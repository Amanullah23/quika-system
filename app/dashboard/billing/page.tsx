import Link from 'next/link'
import { getBillingRecords } from '../../../lib/billing'
import DeleteBillingButton from './DeleteBillingButton'
import type { BillingRecord } from '../../../lib/types'

const statusColors: Record<string, { bg: string; color: string }> = {
  paid:    { bg: '#dcfce7', color: '#166534' },
  pending: { bg: '#fef9c3', color: '#854d0e' },
  partial: { bg: '#fef3c7', color: '#92400e' },
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ date_from?: string; date_to?: string; search?: string }>
}) {
  const params = await searchParams

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]

  const date_from = params.date_from || thirtyDaysAgo
  const date_to = params.date_to || today
  const search = params.search || ''

  let records: BillingRecord[] = []
  let errorMsg = ''

  try {
    records = await getBillingRecords({ date_from, date_to, search })
  } catch (e: any) {
    errorMsg = e.message
  }

  const totalAFN = records.reduce((s, r) => s + Number(r.amount_afn), 0)
  const totalUSD = records.reduce((s, r) => s + Number(r.amount_usd), 0)
  const lastRunning = records.length > 0 ? Number(records[0].running_total_afn) : 0

  return (
    <div style={{ maxWidth: '1200px' }}>
      <style>{`
        .bill-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        .bill-table-wrap { display: block; }
        .bill-cards-wrap { display: none; }
        .bill-filters { display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end; }
        .bill-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        @media (max-width: 1024px) {
          .bill-grid-3 { grid-template-columns: repeat(3,1fr) !important; }
        }
        @media (max-width: 767px) {
          .bill-grid-3 { grid-template-columns: repeat(1,1fr) !important; gap: 10px !important; }
          .bill-table-wrap { display: none !important; }
          .bill-cards-wrap { display: block !important; }
          .bill-filters { flex-direction: column !important; }
          .bill-filters input,
          .bill-filters select { width: 100% !important; }
          .bill-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .bill-header a { width: 100% !important; text-align: center !important; }
        }
      `}</style>

      {/* Header */}
      <div className="bill-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
            Daily Billing
          </h2>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', fontWeight: 500 }}>
            {records.length} records in selected period
          </p>
        </div>
        <Link href="/dashboard/billing/new" style={{
          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
          color: '#fff', padding: '10px 20px',
          borderRadius: '10px', textDecoration: 'none',
          fontSize: '13px', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '6px',
          boxShadow: '0 2px 8px rgba(30,64,175,0.25)',
        }}>
          + Add Record
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="bill-grid-3" style={{ marginBottom: '20px' }}>
        {[
          {
            label: 'Period Total (AFN)',
            value: `AFN ${totalAFN.toLocaleString()}`,
            icon: '💵', iconBg: '#d1fae5', border: '#10b981',
            sub: `${records.length} records`,
          },
          {
            label: 'Period Total (USD)',
            value: `$${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: '💲', iconBg: '#e0e7ff', border: '#6366f1',
            sub: `Rate: 64 AFN/USD`,
          },
          {
            label: 'Running Total (AFN)',
            value: `AFN ${lastRunning.toLocaleString()}`,
            icon: '📊', iconBg: '#fee2e2', border: '#ef4444',
            sub: 'All-time cumulative',
          },
        ].map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: '12px',
            padding: '16px 18px',
            border: '1px solid #f3f4f6',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: '14px',
            borderLeft: `3px solid ${card.border}`,
          }}>
            <div style={{
              width: '44px', height: '44px',
              background: card.iconBg, borderRadius: '12px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '20px', flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                {card.sub}
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
          <div className="bill-filters">
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
                From
              </div>
              <input
                type="date" name="date_from"
                defaultValue={date_from}
                style={{
                  padding: '9px 12px',
                  border: '1.5px solid #e5e7eb', borderRadius: '9px',
                  fontSize: '13px', outline: 'none',
                  background: '#f9fafb', color: '#111827',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
                To
              </div>
              <input
                type="date" name="date_to"
                defaultValue={date_to}
                style={{
                  padding: '9px 12px',
                  border: '1.5px solid #e5e7eb', borderRadius: '9px',
                  fontSize: '13px', outline: 'none',
                  background: '#f9fafb', color: '#111827',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
                Bill No.
              </div>
              <input
                name="search"
                defaultValue={search}
                placeholder="Search bill number..."
                style={{
                  width: '100%', padding: '9px 12px',
                  border: '1.5px solid #e5e7eb', borderRadius: '9px',
                  fontSize: '13px', outline: 'none',
                  background: '#f9fafb', color: '#111827',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <button type="submit" style={{
                padding: '9px 20px',
                background: '#1e40af', color: '#fff',
                border: 'none', borderRadius: '9px',
                fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Filter
              </button>
              <Link href="/dashboard/billing" style={{
                padding: '9px 16px',
                background: '#f3f4f6', color: '#374151',
                borderRadius: '9px', textDecoration: 'none',
                fontSize: '13px', fontWeight: 500,
                display: 'flex', alignItems: 'center',
              }}>
                Reset
              </Link>
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
      <div className="bill-table-wrap" style={{
        background: '#fff', borderRadius: '14px',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
              {['Date', 'Customer', 'ID', 'Mbps', 'Bill No.', 'Amount (AFN)', 'Total (AFN)', 'Rate', 'USD', 'Status', 'Comments', ''].map(h => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'left',
                  fontSize: '10px', fontWeight: 700, color: '#9ca3af',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={12} style={{
                  padding: '60px', textAlign: 'center',
                  color: '#9ca3af', fontSize: '13px',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰</div>
                  No billing records found for this period.
                </td>
              </tr>
            ) : (
              records.map((record, i) => {
                const st = statusColors[record.payment_status] || statusColors.paid
                const customer = record.customers as any
                return (
                  <tr key={record.id} style={{
                    borderBottom: '1px solid #f9fafb',
                    background: i % 2 === 0 ? '#fff' : '#fafafa',
                  }}>
                    <td style={{ padding: '11px 14px', fontSize: '12px', color: '#374151', whiteSpace: 'nowrap' }}>
                      {new Date(record.record_date).toLocaleDateString('en-GB')}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>
                        {customer?.full_name || '—'}
                      </div>
                      {customer?.full_name_dari && (
                        <div style={{ fontSize: '10px', color: '#9ca3af', direction: 'rtl' }}>
                          {customer.full_name_dari}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        fontFamily: 'monospace', fontSize: '11px', fontWeight: 700,
                        color: '#1e40af', background: '#eff6ff',
                        padding: '2px 6px', borderRadius: '5px',
                      }}>
                        {customer?.customer_code || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>
                      {customer?.packages?.mbps || '—'}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '12px', color: '#374151' }}>
                      {record.bill_number || '—'}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '13px', fontWeight: 800, color: '#111827' }}>
                      {Number(record.amount_afn).toLocaleString()}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '12px', fontWeight: 700, color: '#1e40af' }}>
                      {Number(record.running_total_afn).toLocaleString()}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '11px', color: '#9ca3af' }}>
                      {record.exchange_rate}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '12px', color: '#6b7280' }}>
                      ${Number(record.amount_usd).toFixed(2)}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        background: st.bg, color: st.color,
                        padding: '3px 8px', borderRadius: '20px',
                        fontSize: '10px', fontWeight: 700,
                        textTransform: 'capitalize',
                      }}>
                        {record.payment_status}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '11px', color: '#9ca3af', maxWidth: '140px' }}>
                      {record.comments || '—'}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <DeleteBillingButton id={record.id} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>

          {/* Footer totals */}
          {records.length > 0 && (
            <tfoot>
              <tr style={{ background: '#eff6ff', borderTop: '2px solid #bfdbfe' }}>
                <td colSpan={5} style={{ padding: '11px 14px', fontSize: '12px', fontWeight: 700, color: '#1e40af' }}>
                  Period Total ({records.length} records)
                </td>
                <td style={{ padding: '11px 14px', fontSize: '14px', fontWeight: 800, color: '#1e40af' }}>
                  {totalAFN.toLocaleString()}
                </td>
                <td style={{ padding: '11px 14px', fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                  {lastRunning.toLocaleString()}
                </td>
                <td />
                <td style={{ padding: '11px 14px', fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                  ${totalUSD.toFixed(2)}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="bill-cards-wrap">
        {records.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: '14px',
            padding: '48px 24px', textAlign: 'center',
            color: '#9ca3af', fontSize: '13px',
            border: '1px solid #f3f4f6',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰</div>
            No billing records found for this period.
          </div>
        ) : (
          <>
            {/* Mobile total summary */}
            <div style={{
              background: '#eff6ff', borderRadius: '12px',
              padding: '14px 16px', marginBottom: '12px',
              border: '1px solid #bfdbfe',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '10px', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Period Total
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>
                  AFN {totalAFN.toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  USD
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#374151' }}>
                  ${totalUSD.toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {records.map(record => {
                const st = statusColors[record.payment_status] || statusColors.paid
                const customer = record.customers as any
                return (
                  <div key={record.id} style={{
                    background: '#fff', borderRadius: '12px',
                    padding: '14px 16px',
                    border: '1px solid #f3f4f6',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                          {customer?.full_name || '—'}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '3px' }}>
                          <span style={{
                            fontFamily: 'monospace', fontSize: '10px', fontWeight: 700,
                            color: '#1e40af', background: '#eff6ff',
                            padding: '1px 5px', borderRadius: '4px',
                          }}>
                            {customer?.customer_code}
                          </span>
                          <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                            {new Date(record.record_date).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      </div>
                      <span style={{
                        background: st.bg, color: st.color,
                        padding: '3px 8px', borderRadius: '20px',
                        fontSize: '10px', fontWeight: 700,
                        textTransform: 'capitalize', flexShrink: 0,
                      }}>
                        {record.payment_status}
                      </span>
                    </div>

                    {/* Details grid */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '8px', marginBottom: '10px',
                    }}>
                      {[
                        { label: 'Amount', value: `AFN ${Number(record.amount_afn).toLocaleString()}`, bold: true },
                        { label: 'USD', value: `$${Number(record.amount_usd).toFixed(2)}` },
                        { label: 'Bill No.', value: record.bill_number || '—' },
                      ].map(item => (
                        <div key={item.label} style={{
                          background: '#f9fafb', borderRadius: '7px',
                          padding: '7px 9px',
                        }}>
                          <div style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: item.bold ? 800 : 600, color: '#111827' }}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Running total + delete */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        Running: <span style={{ fontWeight: 700, color: '#1e40af' }}>
                          AFN {Number(record.running_total_afn).toLocaleString()}
                        </span>
                      </div>
                      <DeleteBillingButton id={record.id} />
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