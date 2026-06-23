'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Package } from '../../../lib/types'

type Props = {
  package?: Package
  mode: 'create' | 'edit'
  onClose: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '9px',
  fontSize: '13px',
  outline: 'none',
  background: '#f9fafb',
  color: '#111827',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 700,
  color: '#6b7280',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

export default function PackageForm({ package: pkg, mode, onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: pkg?.name || '',
    mbps: pkg?.mbps || '',
    price_afn: pkg?.price_afn?.toString() || '',
    description: pkg?.description || '',
    is_active: pkg?.is_active ?? true,
  })

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function focusInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = '#1e40af'
    e.target.style.boxShadow = '0 0 0 3px rgba(30,64,175,0.08)'
    e.target.style.background = '#fff'
  }

  function blurInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = '#e5e7eb'
    e.target.style.boxShadow = 'none'
    e.target.style.background = '#f9fafb'
  }

  async function handleSubmit() {
    setError('')
    if (!form.name.trim()) return setError('Package name is required')
    if (!form.mbps.trim()) return setError('Speed (Mbps) is required')

    setLoading(true)
    try {
      const url = mode === 'create' ? '/api/packages' : `/api/packages/${pkg?.id}`
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      router.refresh()
      onClose()
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: '20px',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        width: '100%', maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}>
        {/* Modal header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
          padding: '20px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px',
            }}>
              📦
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                {mode === 'create' ? 'Add New Package' : 'Edit Package'}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', marginTop: '1px' }}>
                {mode === 'create' ? 'Create a new internet package' : 'Update package details'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none', color: '#fff',
              width: '32px', height: '32px',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '16px', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '9px', padding: '10px 14px',
              color: '#dc2626', fontSize: '13px', marginBottom: '18px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Package Name *</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={e => set('name', e.target.value)}
                onFocus={focusInput} onBlur={blurInput}
                placeholder="e.g. Basic Wireless"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Speed (Mbps) *</label>
                <input
                  style={inputStyle}
                  value={form.mbps}
                  onChange={e => set('mbps', e.target.value)}
                  onFocus={focusInput} onBlur={blurInput}
                  placeholder="e.g. 1.5, 2, 4, 100Gb"
                />
              </div>
              <div>
                <label style={labelStyle}>Price (AFN)</label>
                <input
                  type="number" style={inputStyle}
                  value={form.price_afn}
                  onChange={e => set('price_afn', e.target.value)}
                  onFocus={focusInput} onBlur={blurInput}
                  placeholder="1000" min="0"
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: '72px', resize: 'vertical' } as React.CSSProperties}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                onFocus={focusInput} onBlur={blurInput}
                placeholder="e.g. 1.5 Mbps wireless internet"
              />
            </div>

            {/* Active toggle */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f9fafb', borderRadius: '9px',
              padding: '12px 14px', border: '1px solid #f3f4f6',
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                  Active Package
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>
                  Available for customer assignment
                </div>
              </div>
              <div
                onClick={() => set('is_active', !form.is_active)}
                style={{
                  width: '44px', height: '24px',
                  background: form.is_active
                    ? 'linear-gradient(135deg, #1e40af, #3b82f6)'
                    : '#e5e7eb',
                  borderRadius: '12px',
                  position: 'relative', cursor: 'pointer',
                  transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <div style={{
                  width: '18px', height: '18px',
                  background: '#fff', borderRadius: '50%',
                  position: 'absolute',
                  top: '3px',
                  left: form.is_active ? '23px' : '3px',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #f3f4f6',
          display: 'flex', gap: '10px',
          background: '#fafafa',
        }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 1, padding: '11px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1e40af, #3b82f6)',
              color: '#fff', border: 'none', borderRadius: '9px',
              fontSize: '13px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 2px 8px rgba(30,64,175,0.25)',
            }}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Add Package' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '11px 20px',
              background: '#fff', color: '#374151',
              border: '1.5px solid #e5e7eb', borderRadius: '9px',
              fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}