'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Customer } from '../../../lib/types'

type Props = {
  customers: Customer[]
  lastTotal: number
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

      {/* Running total preview */}
      <div style={{
        background: '#f0fafa',
        border: '1px solid #0c7177',
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '28px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Last Total
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#054247', marginTop: '4px' }}>
            AFN {lastTotal.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            This Payment
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#0c7177', marginTop: '4px' }}>
            AFN {Number(form.amount_afn || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            New Total
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#054247', marginTop: '4px' }}>
            AFN {previewTotal.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Section: Record Info */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{
          fontSize: '15px', fontWeight: 600, color: '#0c7177',
          marginBottom: '16px', paddingBottom: '8px',
          borderBottom: '2px solid #f0fafa',
        }}>
          Record Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Date *</label>
            <input
              type="date"
              style={inputStyle}
              value={form.record_date}
              onChange={e => set('record_date', e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Bill Number</label>
            <input
              style={inputStyle}
              value={form.bill_number}
              onChange={e => set('bill_number', e.target.value)}
              placeholder="e.g. 4589"
            />
          </div>
        </div>
      </div>

      {/* Section: Customer */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{
          fontSize: '15px', fontWeight: 600, color: '#0c7177',
          marginBottom: '16px', paddingBottom: '8px',
          borderBottom: '2px solid #f0fafa',
        }}>
          Customer *
        </h3>

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
            onFocus={() => setShowDropdown(true)}
            placeholder="Search customer by name, ID or phone..."
          />

          {showDropdown && search && filteredCustomers.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#ffffff',
              border: '1.5px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 100,
              maxHeight: '220px',
              overflowY: 'auto',
              marginTop: '4px',
            }}>
              {filteredCustomers.slice(0, 8).map(c => (
                <div
                  key={c.id}
                  onClick={() => selectCustomer(c)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0fafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                      {c.full_name}
                    </span>
                    {c.phone_1 && (
                      <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                        {c.phone_1}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {c.packages && (
                      <span style={{
                        fontSize: '11px',
                        background: '#f0fafa',
                        color: '#0c7177',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}>
                        {(c.packages as any).mbps}
                      </span>
                    )}
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#0c7177',
                      fontWeight: 600,
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
            marginTop: '12px',
            padding: '12px 16px',
            background: '#f0fafa',
            borderRadius: '8px',
            border: '1px solid #0c7177',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <span style={{ fontWeight: 600, color: '#054247', fontSize: '14px' }}>
                {selectedCustomer.full_name}
              </span>
              <span style={{
                marginLeft: '10px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#0c7177',
                background: '#fff',
                padding: '1px 6px',
                borderRadius: '4px',
              }}>
                {selectedCustomer.customer_code}
              </span>
              {selectedCustomer.zone && (
                <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                  {selectedCustomer.zone}
                </span>
              )}
            </div>
            {selectedCustomer.packages && (
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#0c7177',
              }}>
                {(selectedCustomer.packages as any).mbps}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Section: Payment */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{
          fontSize: '15px', fontWeight: 600, color: '#0c7177',
          marginBottom: '16px', paddingBottom: '8px',
          borderBottom: '2px solid #f0fafa',
        }}>
          Payment Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Amount (AFN) *</label>
            <input
              type="number"
              style={inputStyle}
              value={form.amount_afn}
              onChange={e => set('amount_afn', e.target.value)}
              placeholder="1000"
              min="0"
            />
          </div>

          <div>
            <label style={labelStyle}>Exchange Rate (AFN/USD)</label>
            <input
              type="number"
              style={inputStyle}
              value={form.exchange_rate}
              onChange={e => set('exchange_rate', e.target.value)}
              placeholder="64"
            />
          </div>

          <div>
            <label style={labelStyle}>USD Equivalent</label>
            <div style={{
              ...inputStyle,
              background: '#f9fafb',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
            }}>
              $ {previewUSD}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Payment Status</label>
            <select
              style={inputStyle}
              value={form.payment_status}
              onChange={e => set('payment_status', e.target.value)}
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          <div style={{ gridColumn: '2 / -1' }}>
            <label style={labelStyle}>Comments</label>
            <input
              style={inputStyle}
              value={form.comments}
              onChange={e => set('comments', e.target.value)}
              placeholder="e.g. 1.5MBps wireless internet"
            />
          </div>
        </div>
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
          {loading ? 'Saving...' : 'Save Record'}
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