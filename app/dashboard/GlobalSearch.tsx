'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Customer = {
  id: string
  customer_code: string
  full_name: string
  full_name_dari: string | null
  phone_1: string | null
  zone: string | null
  status: string
  packages: { mbps: string } | null
}

type BillingRecord = {
  id: string
  record_date: string
  amount_afn: number
  bill_number: string | null
  payment_status: string
  customers: { customer_code: string; full_name: string } | null
}

const statusColors: Record<string, { bg: string; color: string }> = {
  active:    { bg: '#dcfce7', color: '#166534' },
  inactive:  { bg: '#f3f4f6', color: '#374151' },
  suspended: { bg: '#fee2e2', color: '#991b1b' },
  paid:      { bg: '#dcfce7', color: '#166534' },
  pending:   { bg: '#fef9c3', color: '#854d0e' },
  partial:   { bg: '#fef3c7', color: '#92400e' },
}

export default function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [billing, setBilling] = useState<BillingRecord[]>([])
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Open on keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setCustomers([])
      setBilling([])
      setError('')
    }
  }, [open])

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setCustomers([])
      setBilling([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setCustomers(data.customers || [])
      setBilling(data.billing || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  function goTo(path: string) {
    setOpen(false)
    setQuery('')
    router.push(path)
  }

  const hasResults = customers.length > 0 || billing.length > 0
  const showEmpty = query.length >= 2 && !loading && !hasResults

  return (
    <>
      {/* Search trigger button */}
      <div
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#f9fafb', border: '1.5px solid #e5e7eb',
          borderRadius: '9px', padding: '7px 12px',
          fontSize: '13px', color: '#9ca3af',
          cursor: 'pointer', minWidth: '200px',
          transition: 'all 0.15s',
          userSelect: 'none',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = '#1e40af'
          ;(e.currentTarget as HTMLElement).style.background = '#fff'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'
          ;(e.currentTarget as HTMLElement).style.background = '#f9fafb'
        }}
      >
        <span style={{ fontSize: '14px' }}>🔍</span>
        <span style={{ flex: 1 }}>Search...</span>
        <span style={{
          fontSize: '10px', fontWeight: 600,
          background: '#f3f4f6', color: '#9ca3af',
          padding: '2px 6px', borderRadius: '4px',
          border: '1px solid #e5e7eb',
        }}>
          ⌘K
        </span>
      </div>

      {/* Search modal */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '80px',
          paddingLeft: '16px',
          paddingRight: '16px',
          backdropFilter: 'blur(4px)',
        }}>
          <div
            ref={containerRef}
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '600px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Search input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px 20px',
              borderBottom: query.length >= 2 ? '1px solid #f3f4f6' : 'none',
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>🔍</span>
              <input
                ref={inputRef}
                value={query}
                onChange={handleInput}
                placeholder="Search customers, bill numbers, phone..."
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: '15px', color: '#111827',
                  background: 'transparent', fontFamily: 'inherit',
                }}
              />
              {loading && (
                <div style={{
                  width: '18px', height: '18px',
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #1e40af',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  flexShrink: 0,
                }} />
              )}
              <button
                onClick={() => { setOpen(false); setQuery('') }}
                style={{
                  background: '#f3f4f6', border: 'none',
                  color: '#6b7280', padding: '4px 8px',
                  borderRadius: '6px', cursor: 'pointer',
                  fontSize: '11px', fontWeight: 600,
                  fontFamily: 'inherit', flexShrink: 0,
                }}
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div style={{ maxHeight: '480px', overflowY: 'auto' }}>

              {/* Hint */}
              {query.length < 2 && (
                <div style={{ padding: '24px 20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    Quick Search
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { icon: '👥', label: 'Search by customer name', hint: 'e.g. Mohammad' },
                      { icon: '🪪', label: 'Search by customer ID', hint: 'e.g. BI08' },
                      { icon: '📞', label: 'Search by phone number', hint: 'e.g. 0799' },
                      { icon: '🧾', label: 'Search by bill number', hint: 'e.g. 4589' },
                    ].map(item => (
                      <div key={item.label} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '8px 10px', borderRadius: '8px',
                        background: '#f9fafb',
                      }}>
                        <span style={{ fontSize: '16px' }}>{item.icon}</span>
                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                          {item.label}
                        </span>
                        <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>
                          {item.hint}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ padding: '16px 20px', color: '#dc2626', fontSize: '13px' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Empty state */}
              {showEmpty && (
                <div style={{
                  padding: '40px 20px', textAlign: 'center',
                  color: '#9ca3af', fontSize: '13px',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
                  <div style={{ fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    No results for "{query}"
                  </div>
                  <div>Try a different name, ID or bill number</div>
                </div>
              )}

              {/* Customers results */}
              {customers.length > 0 && (
                <div>
                  <div style={{
                    padding: '10px 20px 6px',
                    fontSize: '10px', fontWeight: 700,
                    color: '#9ca3af', textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: '#fafafa',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                    👥 Customers ({customers.length})
                  </div>
                  {customers.map(c => {
                    const st = statusColors[c.status] || statusColors.inactive
                    return (
                      <div
                        key={c.id}
                        onClick={() => goTo(`/dashboard/customers/${c.id}`)}
                        style={{
                          padding: '12px 20px',
                          borderBottom: '1px solid #f9fafb',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0f9ff'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: '36px', height: '36px',
                          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                          borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '14px', fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                              {c.full_name}
                            </span>
                            <span style={{
                              fontFamily: 'monospace', fontSize: '11px', fontWeight: 700,
                              color: '#1e40af', background: '#eff6ff',
                              padding: '1px 6px', borderRadius: '4px',
                            }}>
                              {c.customer_code}
                            </span>
                            <span style={{
                              background: st.bg, color: st.color,
                              padding: '1px 7px', borderRadius: '20px',
                              fontSize: '10px', fontWeight: 700,
                              textTransform: 'capitalize',
                            }}>
                              {c.status}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '3px', flexWrap: 'wrap' }}>
                            {c.phone_1 && (
                              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                📞 {c.phone_1}
                              </span>
                            )}
                            {c.zone && (
                              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                📍 {c.zone}
                              </span>
                            )}
                            {c.packages && (
                              <span style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>
                                📡 {c.packages.mbps}
                              </span>
                            )}
                          </div>
                        </div>

                        <span style={{ fontSize: '16px', color: '#d1d5db', flexShrink: 0 }}>→</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Billing results */}
              {billing.length > 0 && (
                <div>
                  <div style={{
                    padding: '10px 20px 6px',
                    fontSize: '10px', fontWeight: 700,
                    color: '#9ca3af', textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: '#fafafa',
                    borderBottom: '1px solid #f3f4f6',
                    borderTop: customers.length > 0 ? '1px solid #f3f4f6' : 'none',
                  }}>
                    💰 Billing Records ({billing.length})
                  </div>
                  {billing.map(r => {
                    const st = statusColors[r.payment_status] || statusColors.paid
                    return (
                      <div
                        key={r.id}
                        onClick={() => goTo('/dashboard/billing')}
                        style={{
                          padding: '12px 20px',
                          borderBottom: '1px solid #f9fafb',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0f9ff'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
                      >
                        {/* Icon */}
                        <div style={{
                          width: '36px', height: '36px',
                          background: '#d1fae5',
                          borderRadius: '9px',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '16px', flexShrink: 0,
                        }}>
                          💰
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                              AFN {Number(r.amount_afn).toLocaleString()}
                            </span>
                            {r.bill_number && (
                              <span style={{
                                fontSize: '11px', fontWeight: 600,
                                color: '#6b7280', background: '#f3f4f6',
                                padding: '1px 6px', borderRadius: '4px',
                              }}>
                                #{r.bill_number}
                              </span>
                            )}
                            <span style={{
                              background: st.bg, color: st.color,
                              padding: '1px 7px', borderRadius: '20px',
                              fontSize: '10px', fontWeight: 700,
                              textTransform: 'capitalize',
                            }}>
                              {r.payment_status}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '3px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>
                              📅 {new Date(r.record_date).toLocaleDateString('en-GB')}
                            </span>
                            {r.customers && (
                              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                👤 {r.customers.full_name}
                                <span style={{
                                  marginLeft: '4px',
                                  fontFamily: 'monospace', fontSize: '10px',
                                  color: '#1e40af',
                                }}>
                                  ({r.customers.customer_code})
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        <span style={{ fontSize: '16px', color: '#d1d5db', flexShrink: 0 }}>→</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Bottom padding */}
              {hasResults && <div style={{ height: '8px' }} />}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}