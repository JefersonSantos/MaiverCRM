import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { replaceVariables } from '../../src/utils/variableEngine.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async (req: Request) => {
  try {
    // 1. Fetch pending executions
    const { data: executions, error } = await supabase
      .from('workflow_executions')
      .select(`
        *,
        company:companies(*),
        step:workflow_steps(*),
        event:events(*),
        lead:leads(*),
        template:message_templates(*)
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString());

    if (error) throw error;

    const results = [];

    for (const exec of executions) {
      try {
        // 2. Prepare Data for Variable Engine
        const { data: product } = exec.event.product_id 
          ? await supabase.from('products').select('*').eq('id', exec.event.product_id).single()
          : { data: null };
        
        const { data: variant } = exec.event.product_variant_id
          ? await supabase.from('product_variants').select('*').eq('id', exec.event.product_variant_id).single()
          : { data: null };

        const variableData = {
          payload: exec.event.payload,
          lead: exec.lead,
          product: product,
          variant: variant
        };

        // 3. Replace Variables
        const messageBody = replaceVariables(exec.step.template.content, variableData);

        // 4. Send Message via Twilio (Proxy or Direct)
        // Note: In a real implementation, you'd use Twilio API here.
        const twilioSid = await sendTwilioSMS(exec.company, exec.lead.phone, messageBody);

        // 5. Create Message Record
        const { data: msgRecord } = await supabase.from('messages').insert({
          company_id: exec.company_id,
          lead_id: exec.lead_id,
          event_id: exec.event_id,
          twilio_sid: twilioSid,
          body: messageBody,
          status: 'sent'
        }).select().single();

        // 6. Mark Execution as Completed
        await supabase.from('workflow_executions').update({
          status: 'completed',
          executed_at: new Date().toISOString()
        }).eq('id', exec.id);

        results.push({ id: exec.id, success: true });
      } catch (stepErr: any) {
        await supabase.from('workflow_executions').update({
          status: 'failed',
          error_message: stepErr instanceof Error ? stepErr.message : String(stepErr)
        }).eq('id', exec.id);
        results.push({ id: exec.id, success: false, error: stepErr instanceof Error ? stepErr.message : String(stepErr) });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), { status: 500 });
  }
};

async function sendTwilioSMS(company: any, to: string, body: string): Promise<string> {
  // Mock Twilio Call
  console.log(`Sending SMS to ${to} for company ${company.name}: ${body}`);
  // In reality: 
  // const client = new Twilio(company.twilio_account_sid, company.twilio_auth_token);
  // const msg = await client.messages.create({ body, from: company.twilio_phone_number, to });
  // return msg.sid;
  return `MG${Math.random().toString(36).substring(7)}`;
}
