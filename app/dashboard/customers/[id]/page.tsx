import Link from 'next/link'
import { getCustomerById } from '../../../../lib/customers'
import { getBillingByCustomer } from '../../../../lib/billing'
import { notFound } from 'next/navigation'

const statusColors: Record<string, { bg: string; color: string; dot: string }> = {
  active:    { bg: '#dcfce7', color: '#166534', dot: '#10b981' },
  inactive:  { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
  suspended: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
}

const billColors: Record<string, { bg: string; color: string }> = {
  paid:    { bg: '#dcfce7', color: '#166534' },
  pending: { bg: '#fef9c3', color: '#854d0e' },
  partial: { bg: '#fef3c7', color: '#92400e' },
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let customer, billingRecords
  try {
    [customer, billingRecords] = await Promise.all([
      getCustomerById(id),
      getBillingByCustomer(id),
    ])
  } catch {
    notFound()
  }

  const st = statusColors[customer.status] || statusColors.inactive
  const totalPaid = billingRecords.reduce((s, r) => s + Number(r.amount_afn), 0)

  return (
    <div style={{ maxWidth: '900px' }}>
      <style>{`
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .detail-span { grid-column: 1 / -1; }
        .bill-table-wrap { display: block; }
        .bill-cards-wrap { display: none; }
        @media (max-width: 767px) {
          .detail-grid { grid-template-columns: 1fr !important; }
          .bill-table-wrap { display: none !important; }
          .bill-cards-wrap { display: block !important; }
          .detail-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .detail-header a:last-child { width: 100% !important; text-align: center !important; }
        }
      `}</style>

      {/* Header */}
      <div className="detail-header" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/dashboard/customers" style={{
            color: '#6b7280', textDecoration: 'none',
            fontSize: '13px', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            ← Customers
          </Link>
          <span style={{ color: '#d1d5db' }}>/</span>
          <span style={{
            fontSize: '13px', fontWeight: 700,
            color: '#1e40af', background: '#eff6ff',
            padding: '2px 8px', borderRadius: '6px',
            fontFamily: 'monospace',
          }}>
            {customer.customer_code}
          </span>
        </div>
        <Link href={`/dashboard/customers/${id}/edit`} style={{
          padding: '9px 18px',
          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
          color: '#fff', borderRadius: '9px',
          textDecoration: 'none', fontSize: '12px', fontWeight: 700,
          boxShadow: '0 2px 8px rgba(30,64,175,0.25)',
        }}>
          ✏️ Edit Customer
        </Link>
      </div>

      {/* Profile Card */}
      <div style={{
        background: '#fff', borderRadius: '14px',
        padding: '24px', marginBottom: '16px',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        {/* Profile header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', marginBottom: '22px',
          paddingBottom: '20px', borderBottom: '1px solid #f3f4f6',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '60px', height: '60px',
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '24px', fontWeight: 800,
              boxShadow: '0 4px 12px rgba(30,64,175,0.25)',
            }}>
              {customer.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
                {customer.full_name}
              </h2>
              {customer.full_name_dari && (
                <p style={{
                  fontSize: '14px', color: '#6b7280',
                  direction: 'rtl', fontFamily: 'serif', marginTop: '2px',
                }}>
                  {customer.full_name_dari}
                </p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '7px', height: '7px',
              borderRadius: '50%', background: st.dot,
            }} />
            <span style={{
              background: st.bg, color: st.color,
              padding: '4px 12px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700, textTransform: 'capitalize',
            }}>
              {customer.status}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="detail-grid">
          {[
            { label: 'Customer ID', value: customer.customer_code, mono: true },
            { label: 'Signup Date', value: new Date(customer.signup_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { label: 'Phone 1', value: customer.phone_1 || '—' },
            { label: 'Phone 2', value: customer.phone_2 || '—' },
            { label: 'Zone', value: customer.zone || '—' },
            { label: 'Package', value: customer.packages ? `${customer.packages.mbps} — AFN ${customer.packages.price_afn.toLocaleString()}` : '—' },
          ].map(item => (
            <div key={item.label} style={{
              padding: '12px 14px',
              background: '#f9fafb', borderRadius: '9px',
              border: '1px solid #f3f4f6',
            }}>
              <div style={{
                fontSize: '9px', fontWeight: 700, color: '#9ca3af',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px',
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: '13px', color: item.mono ? '#1e40af' : '#111827',
                fontWeight: 600,
                fontFamily: item.mono ? 'monospace' : 'inherit',
              }}>
                {item.value}
              </div>
            </div>
          ))}

          {customer.address_dari && (
            <div className="detail-span" style={{
              padding: '12px 14px', background: '#f9fafb',
              borderRadius: '9px', border: '1px solid #f3f4f6',
            }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Address (Dari)
              </div>
              <div style={{ fontSize: '13px', color: '#111827', direction: 'rtl', fontFamily: 'serif', fontWeight: 500 }}>
                {customer.address_dari}
              </div>
            </div>
          )}

          {customer.comments && (
            <div className="detail-span" style={{
              padding: '12px 14px',
              background: '#fffbeb', borderRadius: '9px',
              border: '1px solid #fde68a',
            }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Comments
              </div>
              <div style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>
                {customer.comments}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div style={{
        background: '#fff', borderRadius: '14px',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 22px', borderBottom: '1px solid #f3f4f6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
            Billing History
          </h3>
          {billingRecords.length > 0 && (
            <span style={{
              fontSize: '12px', fontWeight: 700, color: '#166534',
              background: '#dcfce7', padding: '4px 12px', borderRadius: '20px',
              border: '1px solid #bbf7d0',
            }}>
              Total: AFN {totalPaid.toLocaleString()}
            </span>
          )}
        </div>

        {billingRecords.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>💳</div>
            No billing records yet for this customer.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="bill-table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                    {['Date', 'Bill No.', 'Amount (AFN)', 'Rate', 'USD', 'Status', 'Comments'].map(h => (
                      <th key={h} style={{
                        padding: '10px 16px', textAlign: 'left',
                        fontSize: '10px', fontWeight: 700, color: '#9ca3af',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {billingRecords.map((r, i) => {
                    const bs = billColors[r.payment_status] || billColors.paid
                    return (
                      <tr key={r.id} style={{
                        borderBottom: '1px solid #f9fafb',
                        background: i % 2 === 0 ? '#fff' : '#fafafa',
                      }}>
                        <td style={{ padding: '11px 16px', fontSize: '12px', color: '#374151', whiteSpace: 'nowrap' }}>
                          {new Date(r.record_date).toLocaleDateString('en-GB')}
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: '12px', color: '#374151' }}>
                          {r.bill_number || '—'}
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: '13px', fontWeight: 800, color: '#111827' }}>
                          {Number(r.amount_afn).toLocaleString()}
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: '11px', color: '#9ca3af' }}>
                          {r.exchange_rate}
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: '12px', color: '#6b7280' }}>
                          ${Number(r.amount_usd).toFixed(2)}
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{
                            background: bs.bg, color: bs.color,
                            padding: '3px 8px', borderRadius: '20px',
                            fontSize: '10px', fontWeight: 700, textTransform: 'capitalize',
                          }}>
                            {r.payment_status}
                          </span>
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: '12px', color: '#6b7280' }}>
                          {r.comments || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile billing cards */}
            <div className="bill-cards-wrap">
              {billingRecords.map(r => {
                const bs = billColors[r.payment_status] || billColors.paid
                return (
                  <div key={r.id} style={{
                    padding: '13px 16px', borderBottom: '1px solid #f3f4f6',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>
                        {new Date(r.record_date).toLocaleDateString('en-GB')}
                        {r.bill_number && (
                          <span style={{ marginLeft: '8px', color: '#9ca3af', fontWeight: 400 }}>
                            #{r.bill_number}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        Rate: {r.exchange_rate} · ${Number(r.amount_usd).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
                        AFN {Number(r.amount_afn).toLocaleString()}
                      </div>
                      <span style={{
                        background: bs.bg, color: bs.color,
                        padding: '2px 7px', borderRadius: '10px',
                        fontSize: '10px', fontWeight: 700,
                      }}>
                        {r.payment_status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}