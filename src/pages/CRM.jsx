import React, { useEffect, useState } from 'react'
import { Search, UserPlus, Filter, Loader2 } from 'lucide-react'
import { useSupabase } from '../hooks/useSupabase'

const CRM = () => {
  const { supabase, profile } = useSupabase()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.company_id) {
      fetchLeads()
    }
  }, [profile])

  async function fetchLeads() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          events(event_type, created_at)
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (err) {
      console.error('Error fetching leads:', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-content">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>CRM de Leads</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie seus leads e histórico de eventos.</p>
        </div>
        <button className="btn btn-primary"><UserPlus size={18} /> Novo Lead</button>
      </header>

      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nome, email ou telefone..." 
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'white' }} 
          />
        </div>
        <button className="btn" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}><Filter size={18} /> Filtros</button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>Último Evento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Nenhum lead encontrado para sua empresa.
                  </td>
                </tr>
              ) : leads.map((lead) => (
                <tr key={lead.id}>
                  <td style={{ fontWeight: '600' }}>{lead.name || 'Sem nome'}</td>
                  <td>
                    <div style={{ fontSize: '0.875rem' }}>{lead.phone}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.email}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem' }}>{lead.events?.[0]?.event_type || 'Nenhum'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {lead.events?.[0] ? new Date(lead.events[0].created_at).toLocaleString() : '-'}
                    </div>
                  </td>
                  <td><span className="badge badge-warning">Ativo</span></td>
                  <td><button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Ver Detalhes</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default CRM
