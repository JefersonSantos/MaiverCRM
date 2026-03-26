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
  const { session, loading } = useSupabase()

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
