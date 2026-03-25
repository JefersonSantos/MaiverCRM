import React, { useEffect, useState } from 'react'
import { Plus, Package, Loader2, Edit3, Trash2 } from 'lucide-react'
import { useSupabase } from '../hooks/useSupabase'

const Products = () => {
  const { supabase, profile } = useSupabase()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.company_id) {
      fetchProducts()
    }
  }, [profile])

  async function fetchProducts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching products:', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-content">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Produtos e Variantes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie os produtos que disparam seus eventos.</p>
        </div>
        <button className="btn btn-primary"><Plus size={18} /> Novo Produto</button>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 className="animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Você ainda não cadastrou nenhum produto.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }}><Plus size={18} /> Cadastrar Primeiro Produto</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {products.map(product => (
            <div key={product.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>{product.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" style={{ padding: '0.4rem', background: 'var(--surface)' }}><Edit3 size={16} /></button>
                  <button className="btn" style={{ padding: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}><Trash2 size={16} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Variantes</p>
                {product.product_variants?.map(variant => (
                  <div key={variant.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{variant.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {variant.id.substring(0, 8)}...</div>
                    </div>
                    <div style={{ fontWeight: '700', color: 'var(--secondary)' }}>R$ {variant.price.toFixed(2)}</div>
                  </div>
                ))}
                <button className="btn" style={{ marginTop: '0.5rem', border: '1px dashed var(--border)', fontSize: '0.875rem', justifyContent: 'center' }}>
                  <Plus size={14} /> Adicionar Variante
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Products
