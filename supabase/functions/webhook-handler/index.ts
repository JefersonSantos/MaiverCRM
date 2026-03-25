import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async (req: Request) => {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) return new Response('Unauthorized', { status: 401 });

  try {
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('api_key', apiKey)
      .single();

    if (companyError || !company) return new Response('Invalid API Key', { status: 401 });

    const payload = await req.json();
    const { event_type, lead, product_id, product_variant_id, metadata } = payload;

    // 1. Upsert Lead
    const { data: leadRecord, error: leadError } = await supabase
      .from('leads')
      .upsert({
        company_id: company.id,
        phone: lead.phone,
        name: lead.name,
        email: lead.email,
        metadata: lead.metadata || {},
        updated_at: new Date().toISOString()
      }, { onConflict: 'company_id,phone' })
      .select()
      .single();

    if (leadError) throw leadError;

    // 2. Create Event
    const { data: eventRecord, error: eventError } = await supabase
      .from('events')
      .insert({
        company_id: company.id,
        lead_id: leadRecord.id,
        event_type,
        product_id,
        product_variant_id,
        payload: { ...lead, ...metadata } // Merged data for variable engine
      })
      .select()
      .single();

    if (eventError) throw eventError;

    // 3. Trigger Workflows
    const { data: workflows } = await supabase
      .from('workflows')
      .select('*, workflow_steps(*)')
      .eq('company_id', company.id)
      .eq('trigger_event', event_type)
      .eq('active', true);

    if (workflows) {
      for (const workflow of workflows) {
        for (const step of workflow.workflow_steps) {
          const scheduledFor = new Date();
          scheduledFor.setMinutes(scheduledFor.getMinutes() + (step.delay_minutes || 0));

          await supabase.from('workflow_executions').insert({
            company_id: company.id,
            workflow_id: workflow.id,
            event_id: eventRecord.id,
            lead_id: leadRecord.id,
            step_id: step.id,
            scheduled_for: scheduledFor.toISOString()
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, event_id: eventRecord.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
