'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Package, Customer } from '../../../lib/types'

type Props = {
  packages: Package[]
  customer?: Customer
  mode: 'create' | 'edit'
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

export default function CustomerForm({ packages, customer, mode }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    customer_code: customer?.customer_code || '',
    full_name: customer?.full_name || '',
    full_name_dari: customer?.full_name_dari || '',
    phone_1: customer?.phone_1 || '',
    phone_2: customer?.phone_2 || '',
    address_dari: customer?.address_dari || '',
    address_english: customer?.address_english || '',
    zone: customer?.zone || '',
    package_id: customer?.package_id || '',
    signup_date: customer?.signup_date || new Date().toISOString().split('T')[0],
    status: customer?.status || 'active',
    comments: customer?.comments || '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setError('')
    if (!form.customer_code.trim()) return setError('Customer ID is required')
    if (!form.full_name.trim()) return setError('Full name is required')

    setLoading(true)

    try {
      const url = mode === 'create'
        ? '/api/customers'
        : `/api/customers/${customer?.id}`

      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      router.push('/dashboard/customers')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      maxWidth: '800px',
    }}>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#dc2626',
          fontSize: '14px',
          marginBottom: '24px',
        }}>
          {error}
        </div>
      )}

      {/* Section: Basic Info */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#0c7177',
          marginBottom: '16px',
          paddingBottom: '8px',
          borderBottom: '2px solid #f0fafa',
        }}>
          Basic Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Customer ID / Code *</label>
            <input
              style={inputStyle}
              value={form.customer_code}
              onChange={e => set('customer_code', e.target.value)}
              placeholder="e.g. BI08, Z06, AO09"
            />
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
              Zone prefix + number (e.g. BI08)
            </p>
          </div>

          <div>
            <label style={labelStyle}>Signup Date *</label>
            <input
              type="date"
              style={inputStyle}
              value={form.signup_date}
              onChange={e => set('signup_date', e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Full Name (English) *</label>
            <input
              style={inputStyle}
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              placeholder="e.g. Mohammad Amin Qanbari"
            />
          </div>

          <div>
            <label style={labelStyle}>Full Name (Dari / دری)</label>
            <input
              style={{ ...inputStyle, direction: 'rtl', fontFamily: 'serif' }}
              value={form.full_name_dari}
              onChange={e => set('full_name_dari', e.target.value)}
              placeholder="نام کامل به دری"
            />
          </div>
        </div>
      </div>

      {/* Section: Contact */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#0c7177',
          marginBottom: '16px',
          paddingBottom: '8px',
          borderBottom: '2px solid #f0fafa',
        }}>
          Contact Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Phone Number 1</label>
            <input
              style={inputStyle}
              value={form.phone_1}
              onChange={e => set('phone_1', e.target.value)}
              placeholder="0799 123 456"
            />
          </div>

          <div>
            <label style={labelStyle}>Phone Number 2</label>
            <input
              style={inputStyle}
              value={form.phone_2}
              onChange={e => set('phone_2', e.target.value)}
              placeholder="0799 654 321"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Address (Dari / دری)</label>
            <textarea
              style={{ ...inputStyle, minHeight: '72px', resize: 'vertical', direction: 'rtl', fontFamily: 'serif' }}
              value={form.address_dari}
              onChange={e => set('address_dari', e.target.value)}
              placeholder="آدرس به دری"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Address (English)</label>
            <textarea
              style={{ ...inputStyle, minHeight: '72px', resize: 'vertical' }}
              value={form.address_english}
              onChange={e => set('address_english', e.target.value)}
              placeholder="Address in English"
            />
          </div>
        </div>
      </div>

      {/* Section: Package & Zone */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#0c7177',
          marginBottom: '16px',
          paddingBottom: '8px',
          borderBottom: '2px solid #f0fafa',
        }}>
          Package & Zone
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Zone</label>
            <input
              style={inputStyle}
              value={form.zone}
              onChange={e => set('zone', e.target.value)}
              placeholder="e.g. Barchi, Karte Now"
            />
          </div>

          <div>
            <label style={labelStyle}>Internet Package</label>
            <select
              style={inputStyle}
              value={form.package_id}
              onChange={e => set('package_id', e.target.value)}
            >
              <option value="">Select package</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.mbps} — AFN {pkg.price_afn.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <select
              style={inputStyle}
              value={form.status}
              onChange={e => set('status', e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section: Comments */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#0c7177',
          marginBottom: '16px',
          paddingBottom: '8px',
          borderBottom: '2px solid #f0fafa',
        }}>
          Comments
        </h3>
        <textarea
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          value={form.comments}
          onChange={e => set('comments', e.target.value)}
          placeholder="Any notes about this customer..."
        />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '11px 28px',
            background: loading ? '#9ca3af' : '#0c7177',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading
            ? 'Saving...'
            : mode === 'create' ? 'Add Customer' : 'Save Changes'}
        </button>

        <button
          onClick={() => router.back()}
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
  )
}