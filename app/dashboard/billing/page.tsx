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
  const lastRunning = records.length > 0
    ? Number(records[0].running_total_afn)
    : 0

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
            Daily Billing
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
            {records.length} records in selected period
          </p>
        </div>
        <Link href="/dashboard/billing/new" style={{
          background: '#0c7177',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600,
        }}>
          + Add Record
        </Link>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '18px 20px',
          borderLeft: '4px solid #0c7177',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Period Total (AFN)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#0c7177', marginTop: '6px' }}>
            {totalAFN.toLocaleString()}
          </div>
        </div>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '18px 20px',
          borderLeft: '4px solid #054247',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Period Total (USD)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#054247', marginTop: '6px' }}>
            ${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '18px 20px',
          borderLeft: '4px solid #ce143d',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Running Total (AFN)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#ce143d', marginTop: '6px' }}>
            {lastRunning.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <form method="GET" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ ...labelStyle, marginBottom: '4px' }}>From</label>
            <input
              type="date"
              name="date_from"
              defaultValue={date_from}
              style={{ ...inputStyle, width: 'auto' }}
            />
          </div>
          <div>
            <label style={{ ...labelStyle, marginBottom: '4px' }}>To</label>
            <input
              type="date"
              name="date_to"
              defaultValue={date_to}
              style={{ ...inputStyle, width: 'auto' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={{ ...labelStyle, marginBottom: '4px' }}>Bill No.</label>
            <input
              name="search"
              defaultValue={search}
              placeholder="Search bill number..."
              style={inputStyle}
            />
          </div>
          <button type="submit" style={{
            padding: '9px 20px',
            background: '#0c7177',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            height: '38px',
          }}>
            Filter
          </button>
          <Link href="/dashboard/billing" style={{
            padding: '9px 16px',
            background: '#f3f4f6',
            color: '#374151',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
          }}>
            Reset
          </Link>
        </form>
      </div>

      {errorMsg && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#dc2626',
          fontSize: '14px',
          marginBottom: '16px',
        }}>
          Error: {errorMsg}
        </div>
      )}

      {/* Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Date', 'Customer', 'ID', 'Mbps', 'Bill No.', 'Amount (AFN)', 'Total (AFN)', 'Rate', 'USD', 'Status', 'Comments', ''].map(h => (
                  <th key={h} style={{
                    padding: '11px 14px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{
                    padding: '48px',
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '14px',
                  }}>
                    No billing records found for this period.
                  </td>
                </tr>
              ) : (
                records.map((record, i) => {
                  const st = statusColors[record.payment_status] || statusColors.paid
                  const customer = record.customers as any
                  return (
                    <tr key={record.id} style={{
                      borderBottom: '1px solid #f3f4f6',
                      background: i % 2 === 0 ? '#ffffff' : '#fafafa',
                    }}>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
                        {new Date(record.record_date).toLocaleDateString('en-GB')}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827' }}>
                          {customer?.full_name || '—'}
                        </div>
                        {customer?.full_name_dari && (
                          <div style={{ fontSize: '11px', color: '#9ca3af', direction: 'rtl' }}>
                            {customer.full_name_dari}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#0c7177',
                          background: '#f0fafa',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}>
                          {customer?.customer_code || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7280' }}>
                        {customer?.packages?.mbps || '—'}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#374151' }}>
                        {record.bill_number || '—'}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>
                        {Number(record.amount_afn).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#054247', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {Number(record.running_total_afn).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7280' }}>
                        {record.exchange_rate}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
                        ${Number(record.amount_usd).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: st.bg,
                          color: st.color,
                          padding: '2px 8px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}>
                          {record.payment_status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7280', maxWidth: '160px' }}>
                        {record.comments || '—'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <DeleteBillingButton id={record.id} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>

            {/* Footer totals row */}
            {records.length > 0 && (
              <tfoot>
                <tr style={{ background: '#f0fafa', borderTop: '2px solid #0c7177' }}>
                  <td colSpan={5} style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: '#054247' }}>
                    Period Total ({records.length} records)
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 700, color: '#0c7177' }}>
                    {totalAFN.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 700, color: '#054247' }}>
                    {lastRunning.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px' }} />
                  <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                    ${totalUSD.toFixed(2)}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block' as const,
  fontSize: '13px',
  fontWeight: 500 as const,
  color: '#374151',
}

const inputStyle = {
  padding: '9px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  background: '#fff',
  color: '#111827',
}