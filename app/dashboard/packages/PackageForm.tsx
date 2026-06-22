'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Package } from '../../../lib/types'

type Props = {
  package?: Package
  mode: 'create' | 'edit'
  onClose: () => void
}

const inputStyle = {
  width: '100%',
  padding: '9px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  background: '#fff',
  color: '#111827',
}

const labelStyle = {
  display: 'block' as const,
  fontSize: '13px',
  fontWeight: 500 as const,
  color: '#374151',
  marginBottom: '6px',
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
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '20px',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827' }}>
            {mode === 'create' ? 'Add New Package' : 'Edit Package'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              fontSize: '16px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#dc2626',
            fontSize: '13px',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Package Name *</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Basic Wireless"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Speed *</label>
              <input
                style={inputStyle}
                value={form.mbps}
                onChange={e => set('mbps', e.target.value)}
                placeholder="e.g. 1.5, 2, 4, 100Gb"
              />
            </div>
            <div>
              <label style={labelStyle}>Price (AFN)</label>
              <input
                type="number"
                style={inputStyle}
                value={form.price_afn}
                onChange={e => set('price_afn', e.target.value)}
                placeholder="1000"
                min="0"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <input
              style={inputStyle}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="e.g. 1.5 Mbps wireless internet"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={e => set('is_active', e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="is_active" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
              Active (available for customer assignment)
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 1,
              padding: '11px',
              background: loading ? '#9ca3af' : '#0c7177',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Add Package' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '11px 20px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}