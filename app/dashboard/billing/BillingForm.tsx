'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Customer } from '../../../lib/types'

type Props = {
  customers: Customer[]
  lastTotal: number
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

export default function BillingForm({ customers, lastTotal }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    record_date: today,
    customer_id: '',
    bill_number: '',
    amount_afn: '',
    exchange_rate: '64',
    payment_status: 'paid',
    comments: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function focusInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = '#1e40af'
    e.target.style.boxShadow = '0 0 0 3px rgba(30,64,175,0.08)'
    e.target.style.background = '#fff'
  }

  function blurInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = '#e5e7eb'
    e.target.style.boxShadow = 'none'
    e.target.style.background = '#f9fafb'
  }

  const filteredCustomers = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.customer_code.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone_1 && c.phone_1.includes(search))
  )

  function selectCustomer(c: Customer) {
    setSelectedCustomer(c)
    setForm(prev => ({ ...prev, customer_id: c.id }))
    setSearch(c.full_name + ' — ' + c.customer_code)
    setShowDropdown(false)
  }

  const previewTotal = lastTotal + (Number(form.amount_afn) || 0)
  const previewUSD = form.amount_afn
    ? (Number(form.amount_afn) / Number(form.exchange_rate)).toFixed(2)
    : '0.00'

  async function handleSubmit() {
    setError('')
    if (!form.customer_id) return setError('Please select a customer')
    if (!form.amount_afn || Number(form.amount_afn) <= 0) return setError('Amount must be greater than 0')

    setLoading(true)
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      router.push('/dashboard/billing')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .bform-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .bform-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        .bform-preview { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        @media (max-width: 767px) {
          .bform-grid-2 { grid-template-columns: 1fr !important; }
          .bform-grid-3 { grid-template-columns: 1fr !important; }
          .bform-preview { grid-template-columns: 1fr !important; }
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

        {/* Running total preview */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          border: '1px solid #bfdbfe',
          borderRadius: '12px', padding: '16px 20px',
          marginBottom: '26px',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Payment Preview
          </div>
          <div className="bform-preview">
            {[
              { label: 'Last Total', value: `AFN ${lastTotal.toLocaleString()}`, sub: 'Before this payment', color: '#374151' },
              { label: 'This Payment', value: `AFN ${Number(form.amount_afn || 0).toLocaleString()}`, sub: `≈ $${previewUSD}`, color: '#1e40af' },
              { label: 'New Total', value: `AFN ${previewTotal.toLocaleString()}`, sub: 'After this payment', color: '#059669' },
            ].map(item => (
              <div key={item.label} style={{
                background: '#fff', borderRadius: '9px',
                padding: '12px 14px', border: '1px solid #dbeafe',
              }}>
                <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: item.color, letterSpacing: '-0.3px' }}>
                  {item.value}
                </div>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Record Details */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '13px', fontWeight: 700, color: '#1e40af',
            marginBottom: '14px', paddingBottom: '8px',
            borderBottom: '2px solid #eff6ff',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>📋</span> Record Details
          </div>
          <div className="bform-grid-2">
            <div>
              <label style={labelStyle}>Date *</label>
              <input
                type="date" style={inputStyle}
                value={form.record_date}
                onChange={e => set('record_date', e.target.value)}
                onFocus={focusInput} onBlur={blurInput}
              />
            </div>
            <div>
              <label style={labelStyle}>Bill Number</label>
              <input
                style={inputStyle}
                value={form.bill_number}
                onChange={e => set('bill_number', e.target.value)}
                onFocus={focusInput} onBlur={blurInput}
                placeholder="e.g. 4589"
              />
            </div>
          </div>
        </div>

        {/* Customer Search */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '13px', fontWeight: 700, color: '#1e40af',
            marginBottom: '14px', paddingBottom: '8px',
            borderBottom: '2px solid #eff6ff',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>👤</span> Customer *
          </div>

          <div style={{ position: 'relative' }}>
            <input
              style={inputStyle}
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setShowDropdown(true)
                if (!e.target.value) {
                  setSelectedCustomer(null)
                  setForm(prev => ({ ...prev, customer_id: '' }))
                }
              }}
              onFocus={e => { setShowDropdown(true); focusInput(e) }}
              onBlur={blurInput}
              placeholder="Search customer by name, ID or phone..."
            />

            {showDropdown && search && filteredCustomers.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: '#fff', border: '1.5px solid #e5e7eb',
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                zIndex: 100, maxHeight: '220px', overflowY: 'auto',
                marginTop: '4px',
              }}>
                {filteredCustomers.slice(0, 8).map(c => (
                  <div
                    key={c.id}
                    onClick={() => selectCustomer(c)}
                    style={{
                      padding: '10px 14px', cursor: 'pointer',
                      borderBottom: '1px solid #f9fafb',
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0f9ff'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '30px', height: '30px',
                        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '12px', fontWeight: 700, flexShrink: 0,
                      }}>
                        {c.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                          {c.full_name}
                        </div>
                        {c.phone_1 && (
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{c.phone_1}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {c.packages && (
                        <span style={{
                          fontSize: '10px', background: '#f0fdf4',
                          color: '#166534', padding: '2px 6px',
                          borderRadius: '4px', fontWeight: 700,
                          border: '1px solid #bbf7d0',
                        }}>
                          {(c.packages as any).mbps}
                        </span>
                      )}
                      <span style={{
                        fontFamily: 'monospace', fontSize: '11px',
                        color: '#1e40af', background: '#eff6ff',
                        padding: '2px 6px', borderRadius: '4px', fontWeight: 700,
                      }}>
                        {c.customer_code}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected customer card */}
          {selectedCustomer && (
            <div style={{
              marginTop: '10px', padding: '12px 16px',
              background: '#f0f9ff', borderRadius: '10px',
              border: '1.5px solid #bfdbfe',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px', height: '34px',
                  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '13px', fontWeight: 700,
                }}>
                  {selectedCustomer.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
                    {selectedCustomer.full_name}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span style={{
                      fontFamily: 'monospace', fontSize: '11px',
                      color: '#1e40af', background: '#fff',
                      padding: '1px 6px', borderRadius: '4px', fontWeight: 700,
                      border: '1px solid #bfdbfe',
                    }}>
                      {selectedCustomer.customer_code}
                    </span>
                    {selectedCustomer.zone && (
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        {selectedCustomer.zone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {selectedCustomer.packages && (
                <span style={{
                  fontSize: '12px', fontWeight: 700, color: '#166534',
                  background: '#f0fdf4', padding: '4px 10px',
                  borderRadius: '6px', border: '1px solid #bbf7d0',
                }}>
                  {(selectedCustomer.packages as any).mbps}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '13px', fontWeight: 700, color: '#1e40af',
            marginBottom: '14px', paddingBottom: '8px',
            borderBottom: '2px solid #eff6ff',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>💳</span> Payment Details
          </div>
          <div className="bform-grid-3">
            <div>
              <label style={labelStyle}>Amount (AFN) *</label>
              <input
                type="number" style={inputStyle}
                value={form.amount_afn}
                onChange={e => set('amount_afn', e.target.value)}
                onFocus={focusInput} onBlur={blurInput}
                placeholder="1000" min="0"
              />
            </div>
            <div>
              <label style={labelStyle}>Exchange Rate</label>
              <input
                type="number" style={inputStyle}
                value={form.exchange_rate}
                onChange={e => set('exchange_rate', e.target.value)}
                onFocus={focusInput} onBlur={blurInput}
                placeholder="64"
              />
            </div>
            <div>
              <label style={labelStyle}>USD Equivalent</label>
              <div style={{
                ...inputStyle,
                background: '#f3f4f6', color: '#6b7280',
                display: 'flex', alignItems: 'center',
                fontWeight: 700,
              }}>
                ${previewUSD}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Payment Status</label>
              <select
                style={inputStyle}
                value={form.payment_status}
                onChange={e => set('payment_status', e.target.value)}
                onFocus={focusInput} onBlur={blurInput}
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Comments</label>
              <input
                style={inputStyle}
                value={form.comments}
                onChange={e => set('comments', e.target.value)}
                onFocus={focusInput} onBlur={blurInput}
                placeholder="e.g. 1.5MBps wireless internet"
              />
            </div>
          </div>
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
            {loading ? 'Saving...' : 'Save Record'}
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