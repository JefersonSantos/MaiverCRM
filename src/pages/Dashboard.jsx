import React, { useEffect, useState } from 'react'
import { useSupabase } from '../hooks/useSupabase'
import { Loader2 } from 'lucide-react'

const Dashboard = () => {
  const { supabase, profile } = useSupabase()
  const [stats, setStats] = useState({ sent: 0, delivered: 0, revenue: 0, cost: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (profile?.company_id) {
      fetchStats()
    } else if (profile) {
      setLoading(false)
    }
  }, [profile])

  async function fetchStats() {
    try {
      setLoading(true)
      setError(null)
      
      // Get message counts
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('status, price')
        .eq('company_id', profile.company_id)

      if (msgError) throw msgError

      const sent = messages?.length || 0
      const delivered = messages?.filter(m => m.status === 'delivered').length || 0
      const cost = messages?.reduce((acc, m) => acc + (Number(m.price) || 0), 0) || 0

      // Placeholder for revenue (could be from events metadata)
      const revenue = 0 

      setStats({ sent, delivered, revenue, cost })
    } catch (err) {
      console.error('Error fetching dashboard stats:', err.message)
      setError('Não foi possível carregar as estatísticas.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="glass-glow" />
      <header style={{ marginBottom: '2rem' }}>
        <h1>Dashboard Operacional</h1>
        <p style={{ color: 'var(--text-muted)' }}>Visão geral da sua operação de recuperação.</p>
      </header>

      {error && (
        <div className="card" style={{ marginBottom: '2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
          {error}
        </div>
      )}
      
      <div className="stats-grid">
        <div className="card stat-card">
          <span className="stat-label">Mensagens Enviadas</span>
          <span className="stat-value">{stats.sent.toLocaleString()}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Taxa de Entrega</span>
          <span className="stat-value" style={{ color: '#4ade80' }}>
            {stats.sent > 0 ? ((stats.delivered / stats.sent) * 100).toFixed(1) : '0.0'}%
          </span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Vendas Recuperadas</span>
          <span className="stat-value" style={{ color: 'var(--secondary)' }}>R$ {stats.revenue.toFixed(2)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Custo Total SMS</span>
          <span className="stat-value">R$ {stats.cost.toFixed(2)}</span>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Workflows em Execução</h3>
          <button className="btn btn-primary">Ver Todos</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Workflow</th>
              <th>Lead</th>
              <th>Status</th>
              <th>Próximo Passo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Nenhum workflow ativo no momento.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard
