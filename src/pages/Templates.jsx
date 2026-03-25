import React, { useEffect, useState } from 'react'
import { Copy, Save, Info, Loader2, Plus, Trash2 } from 'lucide-react'
import { useSupabase } from '../hooks/useSupabase'

const Templates = () => {
  const { supabase, profile } = useSupabase()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  useEffect(() => {
    if (profile?.company_id) {
      fetchTemplates()
    }
  }, [profile])

  async function fetchTemplates() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
      if (data?.length > 0) setSelectedTemplate(data[0])
    } catch (err) {
      console.error('Error fetching templates:', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-content">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Templates de Mensagem</h1>
          <p style={{ color: 'var(--text-muted)' }}>Crie mensagens dinâmicas para seus funis.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ background: 'var(--surface)' }}><Trash2 size={18} /> Excluir</button>
          <button className="btn btn-primary"><Save size={18} /> Salvar Template</button>
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
          <aside className="card" style={{ padding: '1rem' }}>
            <button className="btn" style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem', border: '1px dashed var(--border)' }}>
              <Plus size={16} /> Novo Template
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {templates.map(t => (
                <div 
                  key={t.id} 
                  className={`nav-item ${selectedTemplate?.id === t.id ? 'active' : ''}`}
                  onClick={() => setSelectedTemplate(t)}
                  style={{ cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  {t.name}
                </div>
              ))}
            </div>
          </aside>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
            <div className="card">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Nome do Template</label>
              <input 
                type="text" 
                value={selectedTemplate?.name || ''}
                onChange={(e) => setSelectedTemplate({...selectedTemplate, name: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'white', marginBottom: '1.5rem' }} 
              />

              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Conteúdo da Mensagem</label>
              <textarea 
                rows="8"
                style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'white', fontFamily: 'inherit', resize: 'vertical' }}
                value={selectedTemplate?.content || ''}
                onChange={(e) => setSelectedTemplate({...selectedTemplate, content: e.target.value})}
              ></textarea>
              
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius)', border: '1px solid var(--primary-glow)' }}>
                <p style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Info size={14} /> <strong>Dica:</strong> Use as variáveis entre chaves duplas.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {['name', 'product_name', 'price', 'link', 'variant_name'].map(v => (
                    <span 
                      key={v} 
                      onClick={() => {
                        const content = (selectedTemplate?.content || '') + ` {{${v}}}`
                        setSelectedTemplate({...selectedTemplate, content})
                      }}
                      style={{ fontSize: '0.7rem', background: 'var(--surface)', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border)' }}
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Preview do SMS</h3>
              <div style={{ background: '#000', borderRadius: '32px', padding: '1.5rem', maxWidth: '300px', margin: '0 auto', border: '8px solid #222', minHeight: '500px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '18px', background: '#222', borderRadius: '10px', zIndex: 1 }} />
                
                <div style={{ marginTop: '30px', background: '#222', padding: '1rem', borderRadius: '18px', fontSize: '0.875rem', color: '#eee', border: '1px solid #333' }}>
                  {selectedTemplate?.content?.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
                    const mock = { name: 'João Silva', product_name: 'Burnjaro', variant_name: '3 Potes', price: '297.00', link: 'https://bit.ly/3xY' }
                    return mock[key.trim()] || match
                  }) || 'Sua mensagem aparecerá aqui...'}
                </div>
                
                <p style={{ fontSize: '0.65rem', color: '#666', marginTop: '0.8rem', textAlign: 'center' }}>Agora mesmo • Via SMS</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Templates
