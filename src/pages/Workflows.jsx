import React, { useEffect, useState } from 'react'
import { Play, Plus, Clock, MessageSquare, Loader2 } from 'lucide-react'
import { useSupabase } from '../hooks/useSupabase'

const Workflows = () => {
  const { supabase, profile } = useSupabase()
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.company_id) {
      fetchWorkflows()
    }
  }, [profile])

  async function fetchWorkflows() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          workflow_steps(
            *,
            template:message_templates(name, content)
          )
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorkflows(data || [])
    } catch (err) {
      console.error('Error fetching workflows:', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-content">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Funis de Vendas</h1>
          <p style={{ color: 'var(--text-muted)' }}>Automatize sua recuperação com réguas de contato.</p>
        </div>
        <button className="btn btn-primary"><Plus size={18} /> Criar Workflow</button>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 className="animate-spin" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Você ainda não tem nenhum workflow criado.</p>
          <button className="btn btn-primary"><Plus size={18} /> Começar Agora</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {workflows.map(wf => (
            <div key={wf.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{wf.name}</h3>
                  <span className="badge badge-success">{wf.active ? 'Ativo' : 'Inativo'}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gatilho: {wf.trigger_event}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {wf.workflow_steps?.sort((a,b) => a.step_order - b.step_order).map((step, idx) => (
                  <React.Fragment key={step.id}>
                    {idx > 0 && <div style={{ width: '2px', height: '1rem', background: 'var(--border)', marginLeft: '1rem' }} />}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ background: idx === 0 ? 'var(--primary)' : 'var(--surface-hover)', padding: '0.5rem', borderRadius: '8px' }}>
                        {step.delay_minutes > 0 ? <Clock size={16} /> : <Play size={16} />}
                      </div>
                      <div className="card" style={{ flex: 1, padding: '0.75rem', background: 'var(--surface)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                          <span style={{ fontWeight: '600' }}>{step.action_type === 'send_sms' ? 'Enviar SMS' : step.action_type}</span>
                          <span style={{ color: 'var(--text-muted)' }}>+ {step.delay_minutes} min</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Template: {step.template?.name || 'Não selecionado'}
                        </p>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
                
                <button className="btn" style={{ marginTop: '1rem', border: '1px dashed var(--border)', width: '100%', justifyContent: 'center' }}>
                  <Plus size={16} /> Adicionar Passo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Workflows
