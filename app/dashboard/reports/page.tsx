import { getDailySummary, getMonthlySummary, getCustomerSummary } from '../../../lib/reports'
import ExportButton from './ExportButton'
import PrintButton from './PrintButton'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ date_from?: string; date_to?: string; tab?: string; year?: string }>
}) {
  const params = await searchParams

  const today = new Date().toISOString().split('T')[0]
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split('T')[0]

  const date_from = params.date_from || firstOfMonth
  const date_to = params.date_to || today
  const tab = params.tab || 'daily'
  const year = Number(params.year) || new Date().getFullYear()

  let dailyData: any[] = []
  let monthlyData: Record<number, any> = {}
  let customerData: any[] = []
  let errorMsg = ''

  try {
    if (tab === 'daily') {
      dailyData = await getDailySummary(date_from, date_to)
    } else if (tab === 'monthly') {
      monthlyData = await getMonthlySummary(year)
    } else if (tab === 'customers') {
      customerData = await getCustomerSummary(date_from, date_to)
    }
  } catch (e: any) {
    errorMsg = e.message
  }

  // Group daily records by date
  const groupedByDate: Record<string, {
    records: any[]
    total_afn: number
    total_usd: number
  }> = {}

  for (const r of dailyData) {
    const d = r.record_date
    if (!groupedByDate[d]) {
      groupedByDate[d] = { records: [], total_afn: 0, total_usd: 0 }
    }
    groupedByDate[d].records.push(r)
    groupedByDate[d].total_afn += Number(r.amount_afn)
    groupedByDate[d].total_usd += Number(r.amount_usd)
  }

  const grandTotalAFN = dailyData.reduce((s, r) => s + Number(r.amount_afn), 0)
  const grandTotalUSD = dailyData.reduce((s, r) => s + Number(r.amount_usd), 0)

  const yearlyTotal = Object.values(monthlyData).reduce((s, m) => s + m.afn, 0)
  const yearlyUSD = Object.values(monthlyData).reduce((s, m) => s + m.usd, 0)

  const tabStyle = (t: string) => ({
    padding: '8px 20px',
    background: tab === t ? '#0c7177' : '#f3f4f6',
    color: tab === t ? '#ffffff' : '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: tab === t ? 600 : 400,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  } as const)

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
            Reports
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
            Financial summaries and data export
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <ExportButton date_from={date_from} date_to={date_to} />
          <PrintButton />
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        {[
          { key: 'daily', label: 'Daily Report' },
          { key: 'monthly', label: 'Monthly Report' },
          { key: 'customers', label: 'By Customer' },
        ].map(t => (
          <a
            key={t.key}
            href={`/dashboard/reports?tab=${t.key}&date_from=${date_from}&date_to=${date_to}&year=${year}`}
            style={tabStyle(t.key)}
          >
            {t.label}
          </a>
        ))}
      </div>

      {/* Date Filter */}
      {tab !== 'monthly' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <form method="GET" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <input type="hidden" name="tab" value={tab} />
            <div>
              <label style={labelStyle}>From</label>
              <input type="date" name="date_from" defaultValue={date_from} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>To</label>
              <input type="date" name="date_to" defaultValue={date_to} style={inputStyle} />
            </div>
            <button type="submit" style={{
              padding: '9px 20px',
              background: '#0c7177', color: '#fff',
              border: 'none', borderRadius: '8px',
              fontSize: '14px', cursor: 'pointer', fontWeight: 500,
            }}>
              Apply
            </button>
          </form>
        </div>
      )}

      {/* Year Filter for Monthly */}
      {tab === 'monthly' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <form method="GET" style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <input type="hidden" name="tab" value="monthly" />
            <div>
              <label style={labelStyle}>Year</label>
              <select name="year" defaultValue={year} style={inputStyle}>
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button type="submit" style={{
              padding: '9px 20px',
              background: '#0c7177', color: '#fff',
              border: 'none', borderRadius: '8px',
              fontSize: '14px', cursor: 'pointer', fontWeight: 500,
            }}>
              Apply
            </button>
          </form>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '8px', padding: '12px 16px',
          color: '#dc2626', fontSize: '14px', marginBottom: '16px',
        }}>
          Error: {errorMsg}
        </div>
      )}

      {/* ── DAILY REPORT ── */}
      {tab === 'daily' && (
        <div>
          {/* Summary cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            gap: '16px', marginBottom: '20px',
          }}>
            {[
              { label: 'Total Records', value: dailyData.length.toString(), color: '#0c7177' },
              { label: 'Total (AFN)', value: grandTotalAFN.toLocaleString(), color: '#054247' },
              { label: 'Total (USD)', value: `$${grandTotalUSD.toFixed(2)}`, color: '#ce143d' },
            ].map(c => (
              <div key={c.label} style={{
                background: '#ffffff', borderRadius: '12px',
                padding: '18px 20px', borderLeft: `4px solid ${c.color}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {c.label}
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: c.color, marginTop: '6px' }}>
                  {c.value}
                </div>
              </div>
            ))}
          </div>

          {/* Daily grouped table */}
          {Object.keys(groupedByDate).length === 0 ? (
            <div style={{
              background: '#fff', borderRadius: '12px', padding: '48px',
              textAlign: 'center', color: '#9ca3af', fontSize: '14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              No records in this date range.
            </div>
          ) : (
            Object.entries(groupedByDate).map(([date, group]) => (
              <div key={date} style={{
                background: '#ffffff', borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                marginBottom: '16px', overflow: 'hidden',
              }}>
                {/* Date header */}
                <div style={{
                  background: '#f0fafa',
                  padding: '12px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e5e7eb',
                }}>
                  <span style={{ fontWeight: 700, color: '#054247', fontSize: '15px' }}>
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                      {group.records.length} payments
                    </span>
                    <span style={{ fontWeight: 700, color: '#0c7177', fontSize: '15px' }}>
                      AFN {group.total_afn.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                      ${group.total_usd.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Records table */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                      {['Customer', 'ID', 'Mbps', 'Bill No.', 'Amount (AFN)', 'Rate', 'USD'].map(h => (
                        <th key={h} style={{
                          padding: '9px 16px', textAlign: 'left',
                          fontSize: '11px', fontWeight: 600, color: '#9ca3af',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.records.map((r: any, i: number) => (
                      <tr key={i} style={{
                        borderBottom: '1px solid #f9fafb',
                        background: i % 2 === 0 ? '#fff' : '#fafafa',
                      }}>
                        <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 500, color: '#111827' }}>
                          {r.customers?.full_name || '—'}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{
                            fontFamily: 'monospace', fontSize: '12px',
                            fontWeight: 600, color: '#0c7177',
                            background: '#f0fafa', padding: '1px 6px', borderRadius: '4px',
                          }}>
                            {r.customers?.customer_code || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '12px', color: '#6b7280' }}>
                          {r.customers?.packages?.mbps || '—'}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#374151' }}>
                          {r.bill_number || '—'}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                          {Number(r.amount_afn).toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '12px', color: '#6b7280' }}>
                          {r.exchange_rate}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#374151' }}>
                          ${Number(r.amount_usd).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MONTHLY REPORT ── */}
      {tab === 'monthly' && (
        <div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2,1fr)',
            gap: '16px', marginBottom: '20px',
          }}>
            <div style={{
              background: '#ffffff', borderRadius: '12px',
              padding: '18px 20px', borderLeft: '4px solid #0c7177',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {year} Total (AFN)
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#0c7177', marginTop: '6px' }}>
                {yearlyTotal.toLocaleString()}
              </div>
            </div>
            <div style={{
              background: '#ffffff', borderRadius: '12px',
              padding: '18px 20px', borderLeft: '4px solid #054247',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {year} Total (USD)
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#054247', marginTop: '6px' }}>
                ${yearlyUSD.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{
            background: '#ffffff', borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Month', 'Records', 'Total (AFN)', 'Total (USD)', 'Bar'].map(h => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left',
                      fontSize: '12px', fontWeight: 600, color: '#6b7280',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((month, i) => {
                  const m = monthlyData[i + 1]
                  const pct = yearlyTotal > 0 ? (m.afn / yearlyTotal) * 100 : 0
                  return (
                    <tr key={month} style={{
                      borderBottom: '1px solid #f3f4f6',
                      background: i % 2 === 0 ? '#fff' : '#fafafa',
                    }}>
                      <td style={{ padding: '13px 20px', fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                        {month}
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: '13px', color: '#6b7280' }}>
                        {m.count}
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: '14px', fontWeight: m.afn > 0 ? 600 : 400, color: m.afn > 0 ? '#0c7177' : '#9ca3af' }}>
                        {m.afn > 0 ? m.afn.toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: '13px', color: '#374151' }}>
                        {m.usd > 0 ? `$${m.usd.toFixed(2)}` : '—'}
                      </td>
                      <td style={{ padding: '13px 20px', width: '200px' }}>
                        {m.afn > 0 && (
                          <div style={{ background: '#f0fafa', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                            <div style={{
                              background: '#0c7177',
                              width: `${pct}%`,
                              height: '100%',
                              borderRadius: '4px',
                            }} />
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f0fafa', borderTop: '2px solid #0c7177' }}>
                  <td style={{ padding: '13px 20px', fontWeight: 700, color: '#054247', fontSize: '14px' }}>
                    Total
                  </td>
                  <td style={{ padding: '13px 20px', fontWeight: 600, color: '#374151', fontSize: '13px' }}>
                    {Object.values(monthlyData).reduce((s, m) => s + m.count, 0)}
                  </td>
                  <td style={{ padding: '13px 20px', fontWeight: 700, color: '#0c7177', fontSize: '15px' }}>
                    {yearlyTotal.toLocaleString()}
                  </td>
                  <td style={{ padding: '13px 20px', fontWeight: 700, color: '#054247', fontSize: '14px' }}>
                    ${yearlyUSD.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── BY CUSTOMER ── */}
      {tab === 'customers' && (
        <div>
          <div style={{
            background: '#ffffff', borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['#', 'Customer', 'ID', 'Zone', 'Mbps', 'Payments', 'Total (AFN)', 'Total (USD)'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 600, color: '#6b7280',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customerData.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                      No data in selected period.
                    </td>
                  </tr>
                ) : (
                  customerData.map((c, i) => (
                    <tr key={c.customer_code} style={{
                      borderBottom: '1px solid #f3f4f6',
                      background: i % 2 === 0 ? '#fff' : '#fafafa',
                    }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#9ca3af' }}>
                        {i + 1}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                        {c.full_name}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontFamily: 'monospace', fontSize: '12px',
                          fontWeight: 600, color: '#0c7177',
                          background: '#f0fafa', padding: '1px 6px', borderRadius: '4px',
                        }}>
                          {c.customer_code}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>
                        {c.zone || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>
                        {c.mbps || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                        {c.count}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 700, color: '#0c7177' }}>
                        {c.total_afn.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                        ${c.total_usd.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {customerData.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#f0fafa', borderTop: '2px solid #0c7177' }}>
                    <td colSpan={5} style={{ padding: '12px 16px', fontWeight: 700, color: '#054247', fontSize: '14px' }}>
                      Total ({customerData.length} customers)
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#374151', fontSize: '13px' }}>
                      {customerData.reduce((s, c) => s + c.count, 0)}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0c7177', fontSize: '15px' }}>
                      {customerData.reduce((s, c) => s + c.total_afn, 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#054247', fontSize: '14px' }}>
                      ${customerData.reduce((s, c) => s + c.total_usd, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle = {
  display: 'block' as const,
  fontSize: '13px',
  fontWeight: 500 as const,
  color: '#374151',
  marginBottom: '4px',
}

const inputStyle = {
  padding: '9px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  background: '#fff',
  color: '#111827',
} as const