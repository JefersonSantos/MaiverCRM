// Build trigger: 2026-03-27
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { SupabaseProvider, useSupabase } from './hooks/useSupabase'

// Components & Pages
import Sidebar from './components/Sidebar'
import Auth from './components/Auth'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import CRM from './pages/CRM'
import Workflows from './pages/Workflows'
import Templates from './pages/Templates'
import Products from './pages/Products'
import SettingsPage from './pages/Settings'

const App = () => {
  const { session, loading, supabase } = useSupabase()

  // Env check
  if (!supabase && !loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: '#f87171', marginBottom: '1rem' }}>Configuração Necessária</h1>
        <p style={{ maxWidth: '600px', marginBottom: '2rem' }}>
          O MaiverCRM não conseguiu se conectar ao Supabase porque as variáveis de ambiente <strong>VITE_SUPABASE_URL</strong> e <strong>VITE_SUPABASE_ANON_KEY</strong> estão faltando.
        </p>
        <div className="card" style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left', fontSize: '0.875rem' }}>
          <p><strong>Como resolver:</strong></p>
          <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>No seu projeto local, crie um arquivo <code>.env</code> na raiz.</li>
            <li>Adicione os dados do seu projeto Supabase.</li>
            <li>Na Vercel, adicione esses campos em <strong>Settings &gt; Environment Variables</strong>.</li>
          </ol>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  // Auth guard
  if (!session) {
    return <Auth />
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/products" element={<Products />} />
            <Route path="/reports" element={<div className="main-content"><h1>Relatórios</h1></div>} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  )
}

const Root = () => (
  <ErrorBoundary>
    <SupabaseProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SupabaseProvider>
  </ErrorBoundary>
)

export default Root
