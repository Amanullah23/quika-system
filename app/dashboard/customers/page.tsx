import Link from 'next/link'
import { getCustomers } from '../../../lib/customers'
import type { Customer } from '../../../lib/types'

const statusColors: Record<string, { bg: string; color: string; dot: string }> = {
  active:    { bg: '#dcfce7', color: '#166534', dot: '#10b981' },
  inactive:  { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
  suspended: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const search = params.search || ''
  const status = params.status || 'all'

  let customers: Customer[] = []
  let errorMsg = ''

  try {
    customers = await getCustomers(search, status)
  } catch (e: any) {
    errorMsg = e.message
  }

  const total = customers.length
  const active = customers.filter(c => c.status === 'active').length
  const inactive = customers.filter(c => c.status === 'inactive').length
  const suspended = customers.filter(c => c.status === 'suspended').length

  return (
    <div style={{ maxWidth: '1200px' }}>
      <style>{`
        .cust-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
        .cust-table-wrap { display: block; }
        .cust-cards-wrap { display: none; }
        .cust-filters { display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end; }
        .cust-table-wrap table tbody tr:hover { background: #f0f9ff !important; }
        @media (max-width: 1024px) {
          .cust-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 767px) {
          .cust-grid { grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }
          .cust-table-wrap { display: none !important; }
          .cust-cards-wrap { display: block !important; }
          .cust-filters { flex-direction: column !important; }
          .cust-filters input,
          .cust-filters select { width: 100% !important; }
          .cust-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .cust-header a { width: 100% !important; text-align: center !important; }
        }
      `}</style>

      {/* Header */}
      <div className="cust-header" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '20px',
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
            Customers
          </h2>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', fontWeight: 500 }}>
            {total} total customers registered
          </p>
        </div>
        <Link href="/dashboard/customers/new" style={{
          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
          color: '#fff', padding: '10px 20px',
          borderRadius: '10px', textDecoration: 'none',
          fontSize: '13px', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '6px',
          boxShadow: '0 2px 8px rgba(30,64,175,0.25)',
        }}>
          + Add Customer
        </Link>
      </div>

      {/* Stat cards */}
      <div className="cust-grid" style={{ marginBottom: '20px' }}>
        {[
          { label: 'Total', value: total, icon: '👥', iconBg: '#e0f2fe', border: '#0ea5e9' },
          { label: 'Active', value: active, icon: '✅', iconBg: '#d1fae5', border: '#10b981' },
          { label: 'Inactive', value: inactive, icon: '⏸️', iconBg: '#f3f4f6', border: '#9ca3af' },
          { label: 'Suspended', value: suspended, icon: '🚫', iconBg: '#fee2e2', border: '#ef4444' },
        ].map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: '12px',
            padding: '16px 18px',
            border: '1px solid #f3f4f6',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: '12px',
            borderLeft: `3px solid ${card.border}`,
          }}>
            <div style={{
              width: '40px', height: '40px',
              background: card.iconBg, borderRadius: '10px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '18px', flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff', borderRadius: '12px',
        padding: '14px 18px', marginBottom: '16px',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <form method="GET">
          <div className="cust-filters">
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
                Search
              </div>
              <input
                name="search"
                defaultValue={search}
                placeholder="Search by name, ID or phone..."
                style={{
                  width: '100%', padding: '9px 12px',
                  border: '1.5px solid #e5e7eb', borderRadius: '9px',
                  fontSize: '13px', outline: 'none', color: '#111827',
                  background: '#f9fafb', fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
                Status
              </div>
              <select
                name="status"
                defaultValue={status}
                style={{
                  padding: '9px 12px',
                  border: '1.5px solid #e5e7eb', borderRadius: '9px',
                  fontSize: '13px', background: '#f9fafb',
                  outline: 'none', cursor: 'pointer',
                  color: '#111827', fontFamily: 'inherit',
                  minWidth: '140px',
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <button type="submit" style={{
                padding: '9px 20px',
                background: '#1e40af', color: '#fff',
                border: 'none', borderRadius: '9px',
                fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Search
              </button>
              {(search || status !== 'all') && (
                <Link href="/dashboard/customers" style={{
                  padding: '9px 16px',
                  background: '#f3f4f6', color: '#374151',
                  borderRadius: '9px', textDecoration: 'none',
                  fontSize: '13px', fontWeight: 500,
                  display: 'flex', alignItems: 'center',
                }}>
                  Clear
                </Link>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Error */}
      {errorMsg && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '10px', padding: '12px 16px',
          color: '#dc2626', fontSize: '13px', marginBottom: '16px',
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Desktop Table */}
      <div className="cust-table-wrap" style={{
        background: '#fff', borderRadius: '14px',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
              {['Customer', 'ID', 'Phone', 'Zone', 'Package', 'Signup', 'Status', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '11px 16px', textAlign: 'left',
                  fontSize: '10px', fontWeight: 700, color: '#9ca3af',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{
                  padding: '60px', textAlign: 'center',
                  color: '#9ca3af', fontSize: '13px',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
                  {search ? 'No customers found for your search.' : 'No customers yet. Add your first customer.'}
                </td>
              </tr>
            ) : (
              customers.map((customer, i) => {
                const st = statusColors[customer.status] || statusColors.inactive
                return (
                  <tr key={customer.id} style={{
                    borderBottom: '1px solid #f9fafb',
                    background: i % 2 === 0 ? '#fff' : '#fafafa',
                  }}>
                    {/* Customer name + dari */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px',
                          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                          borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '13px', fontWeight: 700, flexShrink: 0,
                        }}>
                          {customer.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                            {customer.full_name}
                          </div>
                          {customer.full_name_dari && (
                            <div style={{
                              fontSize: '11px', color: '#9ca3af',
                              direction: 'rtl', fontFamily: 'serif',
                            }}>
                              {customer.full_name_dari}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontFamily: 'monospace', fontSize: '12px', fontWeight: 700,
                        color: '#1e40af', background: '#eff6ff',
                        padding: '3px 8px', borderRadius: '6px',
                      }}>
                        {customer.customer_code}
                      </span>
                    </td>

                    {/* Phone */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>
                        {customer.phone_1 || '—'}
                      </div>
                      {customer.phone_2 && (
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{customer.phone_2}</div>
                      )}
                    </td>

                    {/* Zone */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                      {customer.zone || '—'}
                    </td>

                    {/* Package */}
                    <td style={{ padding: '12px 16px' }}>
                      {customer.packages ? (
                        <span style={{
                          background: '#f0fdf4', color: '#166534',
                          padding: '3px 8px', borderRadius: '6px',
                          fontSize: '11px', fontWeight: 700,
                          border: '1px solid #bbf7d0',
                        }}>
                          {customer.packages.mbps}
                        </span>
                      ) : (
                        <span style={{ color: '#d1d5db', fontSize: '12px' }}>—</span>
                      )}
                    </td>

                    {/* Signup */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b7280' }}>
                      {new Date(customer.signup_date).toLocaleDateString('en-GB')}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '6px', height: '6px',
                          borderRadius: '50%', background: st.dot,
                          flexShrink: 0,
                        }} />
                        <span style={{
                          background: st.bg, color: st.color,
                          padding: '3px 8px', borderRadius: '20px',
                          fontSize: '10px', fontWeight: 700,
                          textTransform: 'capitalize',
                        }}>
                          {customer.status}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link href={`/dashboard/customers/${customer.id}`} style={{
                          padding: '5px 12px',
                          background: '#eff6ff', color: '#1e40af',
                          borderRadius: '7px', textDecoration: 'none',
                          fontSize: '11px', fontWeight: 700,
                          border: '1px solid #bfdbfe',
                        }}>
                          View
                        </Link>
                        <Link href={`/dashboard/customers/${customer.id}/edit`} style={{
                          padding: '5px 12px',
                          background: '#f9fafb', color: '#374151',
                          borderRadius: '7px', textDecoration: 'none',
                          fontSize: '11px', fontWeight: 600,
                          border: '1px solid #e5e7eb',
                        }}>
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="cust-cards-wrap">
        {customers.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: '14px',
            padding: '48px 24px', textAlign: 'center',
            color: '#9ca3af', fontSize: '13px',
            border: '1px solid #f3f4f6',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
            {search ? 'No customers found.' : 'No customers yet. Add your first customer.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {customers.map(customer => {
              const st = statusColors[customer.status] || statusColors.inactive
              return (
                <div key={customer.id} style={{
                  background: '#fff', borderRadius: '12px',
                  padding: '14px 16px',
                  border: '1px solid #f3f4f6',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px', height: '38px',
                        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '14px', fontWeight: 700, flexShrink: 0,
                      }}>
                        {customer.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                          {customer.full_name}
                        </div>
                        {customer.full_name_dari && (
                          <div style={{ fontSize: '12px', color: '#9ca3af', direction: 'rtl', fontFamily: 'serif' }}>
                            {customer.full_name_dari}
                          </div>
                        )}
                      </div>
                    </div>
                    <span style={{
                      background: st.bg, color: st.color,
                      padding: '3px 8px', borderRadius: '20px',
                      fontSize: '10px', fontWeight: 700,
                      textTransform: 'capitalize', flexShrink: 0,
                    }}>
                      {customer.status}
                    </span>
                  </div>

                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: '8px', marginBottom: '12px',
                  }}>
                    {[
                      { label: 'ID', value: customer.customer_code, mono: true },
                      { label: 'Phone', value: customer.phone_1 || '—' },
                      { label: 'Zone', value: customer.zone || '—' },
                      { label: 'Package', value: customer.packages?.mbps || '—' },
                    ].map(item => (
                      <div key={item.label} style={{
                        background: '#f9fafb', borderRadius: '7px',
                        padding: '7px 10px',
                      }}>
                        <div style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                          {item.label}
                        </div>
                        <div style={{
                          fontSize: '12px', fontWeight: 600,
                          color: item.mono ? '#1e40af' : '#374151',
                          fontFamily: item.mono ? 'monospace' : 'inherit',
                        }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link href={`/dashboard/customers/${customer.id}`} style={{
                      flex: 1, padding: '8px',
                      background: '#eff6ff', color: '#1e40af',
                      borderRadius: '8px', textDecoration: 'none',
                      fontSize: '12px', fontWeight: 700,
                      textAlign: 'center', border: '1px solid #bfdbfe',
                    }}>
                      View
                    </Link>
                    <Link href={`/dashboard/customers/${customer.id}/edit`} style={{
                      flex: 1, padding: '8px',
                      background: '#f9fafb', color: '#374151',
                      borderRadius: '8px', textDecoration: 'none',
                      fontSize: '12px', fontWeight: 600,
                      textAlign: 'center', border: '1px solid #e5e7eb',
                    }}>
                      Edit
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}