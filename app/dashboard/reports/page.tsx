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
  const yearlyTotal = Object.values(monthlyData).reduce((s: number, m: any) => s + m.afn, 0)
  const yearlyUSD = Object.values(monthlyData).reduce((s: number, m: any) => s + m.usd, 0)

  const tabs = [
    { key: 'daily', label: 'Daily Report', icon: '📅' },
    { key: 'monthly', label: 'Monthly Report', icon: '📆' },
    { key: 'customers', label: 'By Customer', icon: '👥' },
  ]

  const inputStyle: React.CSSProperties = {
    padding: '9px 12px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '9px',
    fontSize: '13px',
    outline: 'none',
    background: '#f9fafb',
    color: '#111827',
    fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '5px',
    display: 'block',
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      <style>{`
        .rep-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .rep-header-actions { display: flex; gap: 10px; }
        .rep-tabs { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
        .rep-filters { display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end; }
        .rep-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        .rep-grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; }
        .rep-daily-table { display: block; }
        .rep-daily-cards { display: none; }
        .rep-cust-table { display: block; }
        .rep-cust-cards { display: none; }
        @media (max-width: 1024px) {
          .rep-grid-3 { grid-template-columns: repeat(3,1fr) !important; }
        }
        @media (max-width: 767px) {
          .rep-header { flex-direction: column !important; align-items: flex-start !important; }
          .rep-header-actions { width: 100%; }
          .rep-header-actions button { flex: 1; }
          .rep-grid-3 { grid-template-columns: 1fr !important; gap: 10px !important; }
          .rep-grid-2 { grid-template-columns: 1fr !important; }
          .rep-filters { flex-direction: column !important; }
          .rep-filters input,
          .rep-filters select { width: 100% !important; }
          .rep-daily-table { display: none !important; }
          .rep-daily-cards { display: block !important; }
          .rep-cust-table { display: none !important; }
          .rep-cust-cards { display: block !important; }
        }
        @media print {
          .rep-header-actions, .rep-tabs, .rep-filters { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="rep-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
            Reports
          </h2>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', fontWeight: 500 }}>
            Financial summaries and data export
          </p>
        </div>
        <div className="rep-header-actions">
          <ExportButton date_from={date_from} date_to={date_to} />
          <PrintButton />
        </div>
      </div>

      {/* Tabs */}
      <div className="rep-tabs">
        {tabs.map(t => (
          <a
            key={t.key}
            href={`/dashboard/reports?tab=${t.key}&date_from=${date_from}&date_to=${date_to}&year=${year}`}
            style={{
              padding: '9px 18px',
              background: tab === t.key
                ? 'linear-gradient(135deg, #1e40af, #3b82f6)'
                : '#fff',
              color: tab === t.key ? '#fff' : '#6b7280',
              borderRadius: '9px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: tab === t.key ? 700 : 500,
              border: tab === t.key ? 'none' : '1.5px solid #e5e7eb',
              boxShadow: tab === t.key
                ? '0 2px 8px rgba(30,64,175,0.25)'
                : '0 1px 2px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{t.icon}</span>
            {t.label}
          </a>
        ))}
      </div>

      {/* Date Filter */}
      {tab !== 'monthly' && (
        <div style={{
          background: '#fff', borderRadius: '12px',
          padding: '14px 18px', marginBottom: '20px',
          border: '1px solid #f3f4f6',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <form method="GET">
            <input type="hidden" name="tab" value={tab} />
            <div className="rep-filters">
              <div>
                <label style={labelStyle}>From</label>
                <input type="date" name="date_from" defaultValue={date_from} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>To</label>
                <input type="date" name="date_to" defaultValue={date_to} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" style={{
                  padding: '9px 20px',
                  background: '#1e40af', color: '#fff',
                  border: 'none', borderRadius: '9px',
                  fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Apply
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Year Filter for Monthly */}
      {tab === 'monthly' && (
        <div style={{
          background: '#fff', borderRadius: '12px',
          padding: '14px 18px', marginBottom: '20px',
          border: '1px solid #f3f4f6',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <form method="GET">
            <input type="hidden" name="tab" value="monthly" />
            <div className="rep-filters">
              <div>
                <label style={labelStyle}>Year</label>
                <select name="year" defaultValue={year} style={inputStyle}>
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" style={{
                  padding: '9px 20px',
                  background: '#1e40af', color: '#fff',
                  border: 'none', borderRadius: '9px',
                  fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Apply
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

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

      {/* ── DAILY REPORT ── */}
      {tab === 'daily' && (
        <div>
          {/* Summary cards */}
          <div className="rep-grid-3" style={{ marginBottom: '20px' }}>
            {[
              {
                label: 'Total Records',
                value: dailyData.length.toString(),
                icon: '📝', iconBg: '#e0f2fe', border: '#0ea5e9',
                sub: 'In selected period',
              },
              {
                label: 'Total (AFN)',
                value: grandTotalAFN.toLocaleString(),
                icon: '💵', iconBg: '#d1fae5', border: '#10b981',
                sub: 'Afghan Afghani',
              },
              {
                label: 'Total (USD)',
                value: `$${grandTotalUSD.toFixed(2)}`,
                icon: '💲', iconBg: '#e0e7ff', border: '#6366f1',
                sub: 'US Dollar equivalent',
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
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{card.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily grouped — Desktop */}
          <div className="rep-daily-table">
            {Object.keys(groupedByDate).length === 0 ? (
              <div style={{
                background: '#fff', borderRadius: '14px',
                padding: '60px', textAlign: 'center',
                color: '#9ca3af', fontSize: '13px',
                border: '1px solid #f3f4f6',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📅</div>
                No records in this date range.
              </div>
            ) : (
              Object.entries(groupedByDate).map(([date, group]) => (
                <div key={date} style={{
                  background: '#fff', borderRadius: '14px',
                  border: '1px solid #f3f4f6',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  marginBottom: '14px', overflow: 'hidden',
                }}>
                  {/* Date header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                    padding: '12px 18px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: '1px solid #bfdbfe',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px',
                        background: '#1e40af', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px',
                      }}>
                        📅
                      </div>
                      <span style={{ fontWeight: 800, color: '#1e40af', fontSize: '14px' }}>
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                        {group.records.length} payments
                      </span>
                      <span style={{
                        fontWeight: 800, color: '#1e40af', fontSize: '15px',
                        background: '#fff', padding: '4px 12px',
                        borderRadius: '20px', border: '1px solid #bfdbfe',
                      }}>
                        AFN {group.total_afn.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                        ${group.total_usd.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Records table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Customer', 'ID', 'Mbps', 'Bill No.', 'Amount (AFN)', 'Rate', 'USD'].map(h => (
                          <th key={h} style={{
                            padding: '8px 16px', textAlign: 'left',
                            fontSize: '10px', fontWeight: 700, color: '#9ca3af',
                            textTransform: 'uppercase', letterSpacing: '0.06em',
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
                          <td style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 600, color: '#111827' }}>
                            {r.customers?.full_name || '—'}
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <span style={{
                              fontFamily: 'monospace', fontSize: '11px', fontWeight: 700,
                              color: '#1e40af', background: '#eff6ff',
                              padding: '2px 6px', borderRadius: '4px',
                            }}>
                              {r.customers?.customer_code || '—'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px', fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>
                            {r.customers?.packages?.mbps || '—'}
                          </td>
                          <td style={{ padding: '10px 16px', fontSize: '12px', color: '#374151' }}>
                            {r.bill_number || '—'}
                          </td>
                          <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 800, color: '#111827' }}>
                            {Number(r.amount_afn).toLocaleString()}
                          </td>
                          <td style={{ padding: '10px 16px', fontSize: '11px', color: '#9ca3af' }}>
                            {r.exchange_rate}
                          </td>
                          <td style={{ padding: '10px 16px', fontSize: '12px', color: '#6b7280' }}>
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

          {/* Daily grouped — Mobile cards */}
          <div className="rep-daily-cards">
            {Object.keys(groupedByDate).length === 0 ? (
              <div style={{
                background: '#fff', borderRadius: '14px',
                padding: '48px 24px', textAlign: 'center',
                color: '#9ca3af', fontSize: '13px',
                border: '1px solid #f3f4f6',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📅</div>
                No records in this date range.
              </div>
            ) : (
              Object.entries(groupedByDate).map(([date, group]) => (
                <div key={date} style={{ marginBottom: '14px' }}>
                  {/* Date header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                    borderRadius: '10px 10px 0 0',
                    padding: '10px 14px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                    </span>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                        {group.records.length} payments
                      </span>
                      <span style={{
                        fontWeight: 800, color: '#fff', fontSize: '14px',
                        background: 'rgba(255,255,255,0.15)',
                        padding: '3px 10px', borderRadius: '20px',
                      }}>
                        AFN {group.total_afn.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Records */}
                  <div style={{
                    background: '#fff', border: '1px solid #f3f4f6',
                    borderTop: 'none', borderRadius: '0 0 10px 10px',
                    overflow: 'hidden',
                  }}>
                    {group.records.map((r: any, i: number) => (
                      <div key={i} style={{
                        padding: '12px 14px',
                        borderBottom: i < group.records.length - 1 ? '1px solid #f3f4f6' : 'none',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: i % 2 === 0 ? '#fff' : '#fafafa',
                      }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                            {r.customers?.full_name || '—'}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
                            <span style={{
                              fontFamily: 'monospace', fontSize: '10px', fontWeight: 700,
                              color: '#1e40af', background: '#eff6ff',
                              padding: '1px 5px', borderRadius: '3px',
                            }}>
                              {r.customers?.customer_code}
                            </span>
                            {r.bill_number && (
                              <span style={{ fontSize: '10px', color: '#9ca3af' }}>#{r.bill_number}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>
                            AFN {Number(r.amount_afn).toLocaleString()}
                          </div>
                          <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                            ${Number(r.amount_usd).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── MONTHLY REPORT ── */}
      {tab === 'monthly' && (
        <div>
          {/* Year totals */}
          <div className="rep-grid-2" style={{ marginBottom: '20px' }}>
            {[
              {
                label: `${year} Total (AFN)`,
                value: yearlyTotal.toLocaleString(),
                icon: '💵', iconBg: '#d1fae5', border: '#10b981',
                sub: 'Total collections this year',
              },
              {
                label: `${year} Total (USD)`,
                value: `$${yearlyUSD.toFixed(2)}`,
                icon: '💲', iconBg: '#e0e7ff', border: '#6366f1',
                sub: 'USD equivalent this year',
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
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{card.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly table */}
          <div style={{
            background: '#fff', borderRadius: '14px',
            border: '1px solid #f3f4f6',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                  {['Month', 'Records', 'Total (AFN)', 'Total (USD)', 'Share'].map(h => (
                    <th key={h} style={{
                      padding: '11px 18px', textAlign: 'left',
                      fontSize: '10px', fontWeight: 700, color: '#9ca3af',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((month, i) => {
                  const m = monthlyData[i + 1]
                  const pct = yearlyTotal > 0 ? (m.afn / yearlyTotal) * 100 : 0
                  const isCurrentMonth = i === new Date().getMonth() && year === new Date().getFullYear()
                  return (
                    <tr key={month} style={{
                      borderBottom: '1px solid #f9fafb',
                      background: isCurrentMonth ? '#f0f9ff' : i % 2 === 0 ? '#fff' : '#fafafa',
                    }}>
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isCurrentMonth && (
                            <div style={{
                              width: '6px', height: '6px',
                              borderRadius: '50%', background: '#1e40af',
                              flexShrink: 0,
                            }} />
                          )}
                          <span style={{
                            fontSize: '13px', fontWeight: isCurrentMonth ? 700 : 500,
                            color: isCurrentMonth ? '#1e40af' : '#111827',
                          }}>
                            {month}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 18px', fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                        {m.count > 0 ? m.count : '—'}
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: m.afn > 0 ? 800 : 400,
                          color: m.afn > 0 ? '#111827' : '#d1d5db',
                        }}>
                          {m.afn > 0 ? m.afn.toLocaleString() : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 18px', fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                        {m.usd > 0 ? `$${m.usd.toFixed(2)}` : '—'}
                      </td>
                      <td style={{ padding: '12px 18px', width: '180px' }}>
                        {m.afn > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              flex: 1, background: '#f3f4f6',
                              borderRadius: '4px', height: '7px', overflow: 'hidden',
                            }}>
                              <div style={{
                                background: isCurrentMonth
                                  ? 'linear-gradient(90deg, #1e40af, #3b82f6)'
                                  : '#93c5fd',
                                width: `${pct}%`, height: '100%', borderRadius: '4px',
                              }} />
                            </div>
                            <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, flexShrink: 0 }}>
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#eff6ff', borderTop: '2px solid #bfdbfe' }}>
                  <td style={{ padding: '12px 18px', fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
                    Total {year}
                  </td>
                  <td style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                    {Object.values(monthlyData).reduce((s: number, m: any) => s + m.count, 0)}
                  </td>
                  <td style={{ padding: '12px 18px', fontSize: '15px', fontWeight: 800, color: '#1e40af' }}>
                    {yearlyTotal.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 18px', fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                    ${yearlyUSD.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 18px', fontSize: '11px', color: '#9ca3af' }}>100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── BY CUSTOMER ── */}
      {tab === 'customers' && (
        <div>
          {/* Desktop table */}
          <div className="rep-cust-table" style={{
            background: '#fff', borderRadius: '14px',
            border: '1px solid #f3f4f6',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                  {['#', 'Customer', 'ID', 'Zone', 'Mbps', 'Payments', 'Total (AFN)', 'Total (USD)'].map(h => (
                    <th key={h} style={{
                      padding: '11px 16px', textAlign: 'left',
                      fontSize: '10px', fontWeight: 700, color: '#9ca3af',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customerData.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{
                      padding: '60px', textAlign: 'center',
                      color: '#9ca3af', fontSize: '13px',
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
                      No data in selected period.
                    </td>
                  </tr>
                ) : (
                  customerData.map((c, i) => (
                    <tr key={c.customer_code} style={{
                      borderBottom: '1px solid #f9fafb',
                      background: i % 2 === 0 ? '#fff' : '#fafafa',
                    }}>
                      <td style={{ padding: '11px 16px', fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>
                        {i + 1}
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <div style={{
                            width: '30px', height: '30px',
                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '11px', fontWeight: 700, flexShrink: 0,
                          }}>
                            {c.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                            {c.full_name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{
                          fontFamily: 'monospace', fontSize: '11px', fontWeight: 700,
                          color: '#1e40af', background: '#eff6ff',
                          padding: '2px 6px', borderRadius: '4px',
                        }}>
                          {c.customer_code}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                        {c.zone || '—'}
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        {c.mbps ? (
                          <span style={{
                            fontSize: '11px', fontWeight: 700,
                            color: '#166534', background: '#f0fdf4',
                            padding: '2px 7px', borderRadius: '4px',
                            border: '1px solid #bbf7d0',
                          }}>
                            {c.mbps}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12px', color: '#374151', fontWeight: 500 }}>
                        {c.count}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '14px', fontWeight: 800, color: '#111827' }}>
                        {c.total_afn.toLocaleString()}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                        ${c.total_usd.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {customerData.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#eff6ff', borderTop: '2px solid #bfdbfe' }}>
                    <td colSpan={5} style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 700, color: '#1e40af' }}>
                      Total ({customerData.length} customers)
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                      {customerData.reduce((s, c) => s + c.count, 0)}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: '15px', fontWeight: 800, color: '#1e40af' }}>
                      {customerData.reduce((s, c) => s + c.total_afn, 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                      ${customerData.reduce((s, c) => s + c.total_usd, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Mobile customer cards */}
          <div className="rep-cust-cards">
            {customerData.length === 0 ? (
              <div style={{
                background: '#fff', borderRadius: '14px',
                padding: '48px 24px', textAlign: 'center',
                color: '#9ca3af', fontSize: '13px',
                border: '1px solid #f3f4f6',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
                No data in selected period.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {customerData.map((c, i) => (
                  <div key={c.customer_code} style={{
                    background: '#fff', borderRadius: '12px',
                    padding: '14px 16px',
                    border: '1px solid #f3f4f6',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px',
                          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                          borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '13px', fontWeight: 700,
                        }}>
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                            {c.full_name}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                            <span style={{
                              fontFamily: 'monospace', fontSize: '10px', fontWeight: 700,
                              color: '#1e40af', background: '#eff6ff',
                              padding: '1px 5px', borderRadius: '3px',
                            }}>
                              {c.customer_code}
                            </span>
                            {c.zone && (
                              <span style={{ fontSize: '10px', color: '#9ca3af' }}>{c.zone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        background: '#eff6ff', color: '#1e40af',
                        borderRadius: '6px', padding: '2px 8px',
                        fontSize: '10px', fontWeight: 700,
                      }}>
                        #{i + 1}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      {[
                        { label: 'Payments', value: c.count.toString() },
                        { label: 'Total AFN', value: c.total_afn.toLocaleString(), bold: true },
                        { label: 'Total USD', value: `$${c.total_usd.toFixed(2)}` },
                      ].map(item => (
                        <div key={item.label} style={{
                          background: '#f9fafb', borderRadius: '7px', padding: '7px 9px',
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
                  </div>
                ))}

                {/* Mobile total summary */}
                <div style={{
                  background: '#eff6ff', borderRadius: '12px',
                  padding: '14px 16px', border: '1px solid #bfdbfe',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Grand Total
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>
                      AFN {customerData.reduce((s, c) => s + c.total_afn, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      USD
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#374151' }}>
                      ${customerData.reduce((s, c) => s + c.total_usd, 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}