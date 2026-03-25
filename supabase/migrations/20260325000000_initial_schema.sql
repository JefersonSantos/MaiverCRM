-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES (The Tenant)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    api_key UUID UNIQUE DEFAULT uuid_generate_v4(),
    twilio_account_sid TEXT,
    twilio_auth_token TEXT,
    twilio_phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCT VARIANTS
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LEADS
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, phone)
);

-- 5. EVENTS
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- e.g., 'purchase', 'abandoned_cart'
    product_id UUID REFERENCES products(id),
    product_variant_id UUID REFERENCES product_variants(id),
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MESSAGE TEMPLATES
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'sms',
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb, -- list of expected variable names
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WORKFLOWS
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trigger_event TEXT NOT NULL, -- matches event_type
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. WORKFLOW STEPS
CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    delay_minutes INTEGER DEFAULT 0,
    action_type TEXT NOT NULL DEFAULT 'send_sms',
    template_id UUID REFERENCES message_templates(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. MESSAGES (History)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id),
    twilio_sid TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued', -- queued, sent, delivered, failed
    price DECIMAL(10,4),
    direction TEXT NOT NULL DEFAULT 'outbound',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MESSAGE LOGS (Detailed Errors/Internal logs)
CREATE TABLE message_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    error_code TEXT,
    error_message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 11. WORKFLOW EXECUTIONS (Track delayed/pending steps)
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, cancelled
    executed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PROFILES (Link Auth users to companies)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES (Multi-tenant isolation)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to get current company_id from session/auth
CREATE OR REPLACE FUNCTION get_my_company() RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Apply RLS to all tables that have company_id
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT table_name 
             FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND column_name = 'company_id'
             AND table_name NOT IN ('companies', 'profiles')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Tenant isolation for %I" ON %I;', t, t);
        EXECUTE format('CREATE POLICY "Tenant isolation for %I" ON %I USING (company_id = get_my_company()) WITH CHECK (company_id = get_my_company());', t, t);
    END LOOP;
END $$;

-- RLS for Companies and Profiles
CREATE POLICY "Users can view their own company" ON companies FOR SELECT USING (id = get_my_company());
CREATE POLICY "Users can update their own company" ON companies FOR UPDATE USING (id = get_my_company());
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (id = auth.uid());

-- Dynamic variable engine function (Postgres version)
CREATE OR REPLACE FUNCTION replace_message_variables(
    message_content TEXT,
    event_payload JSONB,
    lead_data JSONB,
    product_data JSONB,
    variant_data JSONB
) RETURNS TEXT AS $$
DECLARE
    key TEXT;
    val TEXT;
    all_data JSONB;
BEGIN
    -- Merge data with priority: payload -> lead -> product -> variant
    all_data := variant_data || product_data || lead_data || event_payload;
    
    FOR key, val IN SELECT * FROM jsonb_each_text(all_data) LOOP
        message_content := replace(message_content, '{{' || key || '}}', val);
    END LOOP;
    
    RETURN message_content;
END;
$$ LANGUAGE plpgsql;
