import React from 'react'
import { Key, Globe, Shield, Smartphone } from 'lucide-react'
import { useSupabase } from '../hooks/useSupabase'

const SettingsPage = () => {
  const { profile } = useSupabase()

  return (
    <div className="main-content">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Configurações</h1>
        <p style={{ color: 'var(--text-muted)' }}>Gerencie sua conta e chaves de integração.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Key size={20} className="text-primary" />
            <h3 style={{ margin: 0 }}>API & Webhooks</h3>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Sua API Key</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                readOnly 
                value={profile?.company?.api_key || '••••••••••••••••••••••••'} 
                style={{ flex: 1, padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'white', fontFamily: 'monospace' }} 
              />
              <button className="btn" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Resetar Key</button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Use esta chave no cabeçalho `x-api-key` das suas requisições de webhook.</p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Webhook Endpoint</label>
            <input 
              type="text" 
              readOnly 
              value="https://supabase-instance.com/functions/v1/webhook-handler" 
              style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'white' }} 
            />
          </div>
        </section>

        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Smartphone size={20} className="text-primary" />
            <h3 style={{ margin: 0 }}>Integração Twilio</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Account SID</label>
              <input 
                type="text" 
                placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                defaultValue={profile?.company?.twilio_account_sid || ''}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'white' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Auth Token</label>
              <input 
                type="password" 
                placeholder="••••••••••••••••••••••••"
                defaultValue={profile?.company?.twilio_auth_token || ''}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'white' }} 
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Número de Envio / Messaging SID</label>
              <input 
                type="text" 
                placeholder="+1234567890"
                defaultValue={profile?.company?.twilio_phone_number || ''}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'white' }} 
              />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Salvar Configurações</button>
        </section>
      </div>
    </div>
  )
}

export default SettingsPage
