import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, GitMerge, FileText, Package, Settings as SettingsIcon, BarChart3 } from 'lucide-react'
import { SupabaseProvider, useSupabase } from './hooks/useSupabase'
import CRM from './pages/CRM'
import Workflows from './pages/Workflows'
import Templates from './pages/Templates'
import Products from './pages/Products'
import SettingsPage from './pages/Settings'
import Auth from './components/Auth'

// Placeholder components for other pages
const Dashboard = () => {
  const { supabase, profile } = useSupabase()
  const [stats, setStats] = useState({ sent: 0, delivered: 0, revenue: 0, cost: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.company_id) {
      fetchStats()
    }
  }, [profile])

  async function fetchStats() {
    try {
      setLoading(true)
      // Get message counts
      const { data: messages } = await supabase
        .from('messages')
        .select('status, price')
        .eq('company_id', profile.company_id)

      const sent = messages?.length || 0
      const delivered = messages?.filter(m => m.status === 'delivered').length || 0
      const cost = messages?.reduce((acc, m) => acc + (Number(m.price) || 0), 0) || 0

      // Placeholder for revenue (could be from events metadata)
      const revenue = 0 

      setStats({ sent, delivered, revenue, cost })
    } catch (err) {
      console.error('Error fetching dashboard stats:', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-content">
      <div className="glass-glow" />
      <header style={{ marginBottom: '2rem' }}>
        <h1>Dashboard Operacional</h1>
        <p style={{ color: 'var(--text-muted)' }}>Visão geral da sua operação de recuperação.</p>
      </header>
      
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


const App = () => {
  const { session, loading } = useSupabase()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="app-container">
        <aside className="sidebar">
          <div className="logo">MaiverCRM</div>
          
          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/crm" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} /> CRM de Leads
            </NavLink>
            <NavLink to="/workflows" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <GitMerge size={20} /> Funis de Vendas
            </NavLink>
            <NavLink to="/templates" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={20} /> Templates
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Package size={20} /> Produtos
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <BarChart3 size={20} /> Relatórios 
            </NavLink>
          </nav>

          <footer style={{ marginTop: 'auto' }}>
            <NavLink to="/settings" className="nav-item">
              <SettingsIcon size={20} /> Configurações
            </NavLink>
          </footer>
        </aside>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/products" element={<Products />} />
            <Route path="/reports" element={<div className="main-content"><h1>Relatórios</h1></div>} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
  )
}

const Root = () => (
  <SupabaseProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SupabaseProvider>
)

export default Root
