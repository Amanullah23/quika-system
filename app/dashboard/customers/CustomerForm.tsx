'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Package, Customer } from '../../../lib/types'

type Props = {
  packages: Package[]
  customer?: Customer
  mode: 'create' | 'edit'
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

const sectionStyle: React.CSSProperties = {
  marginBottom: '24px',
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#1e40af',
  marginBottom: '14px',
  paddingBottom: '8px',
  borderBottom: '2px solid #eff6ff',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
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

  function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = '#1e40af'
    e.target.style.boxShadow = '0 0 0 3px rgba(30,64,175,0.08)'
    e.target.style.background = '#fff'
  }

  function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = '#e5e7eb'
    e.target.style.boxShadow = 'none'
    e.target.style.background = '#f9fafb'
  }

  async function handleSubmit() {
    setError('')
    if (!form.customer_code.trim()) return setError('Customer ID is required')
    if (!form.full_name.trim()) return setError('Full name is required')

    setLoading(true)
    try {
      const url = mode === 'create' ? '/api/customers' : `/api/customers/${customer?.id}`
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
    <>
      <style>{`
        .cform-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .cform-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        .cform-span-2 { grid-column: 1 / -1; }
        @media (max-width: 767px) {
          .cform-grid-2 { grid-template-columns: 1fr !important; }
          .cform-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{
        background: '#fff', borderRadius: '14px',
        padding: '28px', maxWidth: '800px',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '9px', padding: '11px 14px',
            color: '#dc2626', fontSize: '13px', marginBottom: '22px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Basic Info */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span style={{ fontSize: '16px' }}>👤</span> Basic Information
          </div>
          <div className="cform-grid-2">
            <div>
              <label style={labelStyle}>Customer ID / Code *</label>
              <input
                style={inputStyle}
                value={form.customer_code}
                onChange={e => set('customer_code', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
                placeholder="e.g. BI08, Z06, AO09"
              />
              <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
                Zone prefix + number
              </p>
            </div>
            <div>
              <label style={labelStyle}>Signup Date *</label>
              <input
                type="date" style={inputStyle}
                value={form.signup_date}
                onChange={e => set('signup_date', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Full Name (English) *</label>
              <input
                style={inputStyle}
                value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
                placeholder="e.g. Mohammad Amin Qanbari"
              />
            </div>
            <div>
              <label style={labelStyle}>Full Name (Dari / دری)</label>
              <input
                style={{ ...inputStyle, direction: 'rtl', fontFamily: 'serif' }}
                value={form.full_name_dari}
                onChange={e => set('full_name_dari', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
                placeholder="نام کامل به دری"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span style={{ fontSize: '16px' }}>📞</span> Contact Information
          </div>
          <div className="cform-grid-2">
            <div>
              <label style={labelStyle}>Phone Number 1</label>
              <input
                style={inputStyle}
                value={form.phone_1}
                onChange={e => set('phone_1', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
                placeholder="0799 123 456"
              />
            </div>
            <div>
              <label style={labelStyle}>Phone Number 2</label>
              <input
                style={inputStyle}
                value={form.phone_2}
                onChange={e => set('phone_2', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
                placeholder="0799 654 321"
              />
            </div>
            <div className="cform-span-2">
              <label style={labelStyle}>Address (Dari / دری)</label>
              <textarea
                style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', direction: 'rtl', fontFamily: 'serif' } as React.CSSProperties}
                value={form.address_dari}
                onChange={e => set('address_dari', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
                placeholder="آدرس به دری"
              />
            </div>
            <div className="cform-span-2">
              <label style={labelStyle}>Address (English)</label>
              <textarea
                style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' } as React.CSSProperties}
                value={form.address_english}
                onChange={e => set('address_english', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
                placeholder="Address in English"
              />
            </div>
          </div>
        </div>

        {/* Package & Zone */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span style={{ fontSize: '16px' }}>📦</span> Package & Zone
          </div>
          <div className="cform-grid-3">
            <div>
              <label style={labelStyle}>Zone</label>
              <input
                style={inputStyle}
                value={form.zone}
                onChange={e => set('zone', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
                placeholder="e.g. Barchi, Karte Now"
              />
            </div>
            <div>
              <label style={labelStyle}>Internet Package</label>
              <select
                style={inputStyle}
                value={form.package_id}
                onChange={e => set('package_id', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
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
                onFocus={focusStyle} onBlur={blurStyle}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span style={{ fontSize: '16px' }}>💬</span> Comments
          </div>
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' } as React.CSSProperties}
            value={form.comments}
            onChange={e => set('comments', e.target.value)}
            onFocus={focusStyle} onBlur={blurStyle}
            placeholder="Any notes about this customer..."
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '11px 28px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1e40af, #3b82f6)',
              color: '#fff', border: 'none', borderRadius: '9px',
              fontSize: '13px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 2px 8px rgba(30,64,175,0.25)',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Add Customer' : 'Save Changes'}
          </button>
          <button
            onClick={() => router.back()}
            style={{
              padding: '11px 20px',
              background: '#f3f4f6', color: '#374151',
              border: 'none', borderRadius: '9px',
              fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}