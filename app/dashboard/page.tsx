import Link from 'next/link'
import { getDashboardStats } from '../../lib/dashboard'
import WeekChart from './WeekChart'

const statusColors: Record<string, { bg: string; color: string }> = {
  paid:    { bg: '#dcfce7', color: '#166534' },
  pending: { bg: '#fef9c3', color: '#854d0e' },
  partial: { bg: '#fef3c7', color: '#92400e' },
}

export default async function DashboardPage() {
  let stats
  try {
    stats = await getDashboardStats()
  } catch (e: any) {
    return (
      <div style={{
        background: '#fef2f2', border: '1px solid #fecaca',
        borderRadius: '8px', padding: '14px', color: '#dc2626', fontSize: '13px',
      }}>
        Error: {e.message}
      </div>
    )
  }

  const {
    totalCustomers, activeCustomers, inactiveCustomers,
    suspendedCustomers, todayAFN, todayUSD, todayCount,
    runningTotal, weekData, recentRecords, today,
  } = stats

  return (
    <div style={{ maxWidth: '1200px' }}>
      <style>{`
        .dash-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .dash-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .dash-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .dash-table-wrap { display: block; }
        .dash-cards-wrap { display: none; }
        @media (max-width: 767px) {
          .dash-grid-3 { grid-template-columns: 1fr 1fr !important; }
          .dash-today { grid-column: span 2 !important; }
          .dash-grid-2 { grid-template-columns: 1fr !important; }
          .dash-actions { display: grid !important; grid-template-columns: 1fr 1fr; gap: 8px; }
          .dash-table-wrap { display: none !important; }
          .dash-cards-wrap { display: block !important; }
        }
      `}</style>

      {/* Greeting */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#111827' }}>
          Good {getGreeting()}, Amanullah 👋
        </h2>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
          {new Date(today).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="dash-grid-3" style={{ marginBottom: '16px' }}>
        <div className="dash-today" style={{
          background: 'linear-gradient(135deg, #0c7177 0%, #054247 100%)',
          borderRadius: '10px', padding: '16px 18px', color: '#fff',
          boxShadow: '0 3px 10px rgba(12,113,119,0.25)',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 600, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Today's Collections
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px', letterSpacing: '-0.5px' }}>
            AFN {todayAFN.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '3px' }}>
            ${todayUSD.toFixed(2)} · {todayCount} payments
          </div>
        </div>

        <div style={{
          background: '#fff', borderRadius: '10px',
          padding: '16px 18px', borderLeft: '3px solid #ce143d',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            All-Time Total
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#ce143d', marginTop: '6px' }}>
            AFN {runningTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Cumulative</div>
        </div>

        <div style={{
          background: '#fff', borderRadius: '10px',
          padding: '16px 18px', borderLeft: '3px solid #0c7177',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Customers
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#111827', marginTop: '6px' }}>
            {totalCustomers}
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', color: '#166534', background: '#dcfce7', padding: '1px 6px', borderRadius: '8px', fontWeight: 500 }}>
              {activeCustomers} active
            </span>
            {inactiveCustomers > 0 && (
              <span style={{ fontSize: '10px', color: '#374151', background: '#f3f4f6', padding: '1px 6px', borderRadius: '8px', fontWeight: 500 }}>
                {inactiveCustomers} inactive
              </span>
            )}
            {suspendedCustomers > 0 && (
              <span style={{ fontSize: '10px', color: '#991b1b', background: '#fef2f2', padding: '1px 6px', borderRadius: '8px', fontWeight: 500 }}>
                {suspendedCustomers} suspended
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dash-actions" style={{ marginBottom: '16px' }}>
        {[
          { label: '+ Add Billing Record', href: '/dashboard/billing/new', primary: true },
          { label: '+ Add Customer', href: '/dashboard/customers/new', primary: false },
          { label: 'View Reports', href: '/dashboard/reports', primary: false },
          { label: 'All Billing', href: '/dashboard/billing', primary: false },
        ].map(action => (
          <Link key={action.href} href={action.href} style={{
            padding: '8px 16px',
            background: action.primary ? '#0c7177' : '#fff',
            color: action.primary ? '#fff' : '#374151',
            border: action.primary ? 'none' : '1.5px solid #e5e7eb',
            borderRadius: '7px', textDecoration: 'none',
            fontSize: '12px', fontWeight: 600,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            textAlign: 'center',
          }}>
            {action.label}
          </Link>
        ))}
      </div>

      {/* Chart + Breakdown */}
      <div className="dash-grid-2" style={{ marginBottom: '16px' }}>
        <WeekChart data={weekData} />

        <div style={{
          background: '#fff', borderRadius: '10px',
          padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '14px' }}>
            Customer Breakdown
          </h3>
          {totalCustomers === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
              No customers yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Active', count: activeCustomers, color: '#0c7177' },
                { label: 'Inactive', count: inactiveCustomers, color: '#6b7280' },
                { label: 'Suspended', count: suspendedCustomers, color: '#ce143d' },
              ].map(item => {
                const pct = totalCustomers > 0 ? (item.count / totalCustomers) * 100 : 0
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: '12px', color: item.color, fontWeight: 700 }}>
                        {item.count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: '3px' }} />
                    </div>
                  </div>
                )
              })}
              <div style={{
                marginTop: '4px', padding: '10px 14px',
                background: '#f9fafb', borderRadius: '7px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Total</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>{totalCustomers}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Billing */}
      <div style={{
        background: '#fff', borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid #f3f4f6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
            Recent Billing Records
          </h3>
          <Link href="/dashboard/billing" style={{ fontSize: '12px', color: '#0c7177', textDecoration: 'none', fontWeight: 500 }}>
            View all →
          </Link>
        </div>

        {recentRecords.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
            No billing records yet.{' '}
            <Link href="/dashboard/billing/new" style={{ color: '#0c7177' }}>Add the first one →</Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="dash-table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Date', 'Customer', 'ID', 'Mbps', 'Bill No.', 'Amount (AFN)', 'USD', 'Status'].map(h => (
                      <th key={h} style={{
                        padding: '9px 14px', textAlign: 'left',
                        fontSize: '10px', fontWeight: 600, color: '#6b7280',
                        textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.map((record: any, i: number) => {
                    const st = statusColors[record.payment_status] || statusColors.paid
                    const c = record.customers as any
                    const isToday = record.record_date === today
                    return (
                      <tr key={record.id} style={{
                        borderBottom: '1px solid #f3f4f6',
                        background: isToday ? '#f0fafa' : i % 2 === 0 ? '#fff' : '#fafafa',
                      }}>
                        <td style={{ padding: '10px 14px', fontSize: '12px', color: '#374151', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {isToday && (
                              <span style={{ fontSize: '9px', background: '#0c7177', color: '#fff', padding: '1px 4px', borderRadius: '3px', fontWeight: 600 }}>
                                TODAY
                              </span>
                            )}
                            {new Date(record.record_date).toLocaleDateString('en-GB')}
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: '#111827' }}>
                          {c?.full_name || '—'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            fontFamily: 'monospace', fontSize: '11px', fontWeight: 600,
                            color: '#0c7177', background: '#f0fafa',
                            padding: '1px 5px', borderRadius: '3px',
                          }}>
                            {c?.customer_code || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '11px', color: '#6b7280' }}>
                          {c?.packages?.mbps || '—'}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '12px', color: '#374151' }}>
                          {record.bill_number || '—'}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                          {Number(record.amount_afn).toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '12px', color: '#374151' }}>
                          ${Number(record.amount_usd).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            background: st.bg, color: st.color,
                            padding: '2px 7px', borderRadius: '10px',
                            fontSize: '10px', fontWeight: 500, textTransform: 'capitalize',
                          }}>
                            {record.payment_status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="dash-cards-wrap">
              {recentRecords.map((record: any) => {
                const st = statusColors[record.payment_status] || statusColors.paid
                const c = record.customers as any
                const isToday = record.record_date === today
                return (
                  <div key={record.id} style={{
                    padding: '12px 14px', borderBottom: '1px solid #f3f4f6',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: isToday ? '#f0fafa' : '#fff',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c?.full_name || '—'}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '3px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#0c7177', background: '#f0fafa', padding: '1px 5px', borderRadius: '3px' }}>
                          {c?.customer_code}
                        </span>
                        <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                          {new Date(record.record_date).toLocaleDateString('en-GB')}
                        </span>
                        {isToday && (
                          <span style={{ fontSize: '9px', background: '#0c7177', color: '#fff', padding: '1px 4px', borderRadius: '3px', fontWeight: 600 }}>
                            TODAY
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                        AFN {Number(record.amount_afn).toLocaleString()}
                      </div>
                      <span style={{ background: st.bg, color: st.color, padding: '2px 6px', borderRadius: '8px', fontSize: '10px', fontWeight: 500 }}>
                        {record.payment_status}
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

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}