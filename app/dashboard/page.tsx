import Link from 'next/link'
import { getDashboardStats } from '../../lib/dashboard'
import WeekChart from './WeekChart'

const statusColors: Record<string, { bg: string; color: string }> = {
  paid:    { bg: '#dcfce7', color: '#166534' },
  pending: { bg: '#fef9c3', color: '#854d0e' },
  partial: { bg: '#fef3c7', color: '#92400e' },
}

const statCards = [
  { key: 'today', icon: '💰', color: '#10b981', bg: '#d1fae5' },
  { key: 'total', icon: '📊', color: '#6366f1', bg: '#e0e7ff' },
  { key: 'customers', icon: '👥', color: '#0ea5e9', bg: '#e0f2fe' },
  { key: 'active', icon: '✅', color: '#f59e0b', bg: '#fef3c7' },
]

export default async function DashboardPage() {
  let stats
  try {
    stats = await getDashboardStats()
  } catch (e: any) {
    return (
      <div style={{
        background: '#fef2f2', border: '1px solid #fecaca',
        borderRadius: '10px', padding: '16px', color: '#dc2626', fontSize: '13px',
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
        .dash-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .dash-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .dash-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .dash-table-wrap { display: block; }
        .dash-cards-wrap { display: none; }
        @media (max-width: 1024px) {
          .dash-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 767px) {
          .dash-grid-4 { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .dash-grid-2 { grid-template-columns: 1fr !important; }
          .dash-actions { display: grid !important; grid-template-columns: 1fr 1fr; gap: 8px; }
          .dash-table-wrap { display: none !important; }
          .dash-cards-wrap { display: block !important; }
          .dash-banner { padding: 20px !important; }
          .dash-banner h2 { font-size: 16px !important; }
          .dash-banner p { font-size: 12px !important; }
          .dash-banner-btn { display: none !important; }
        }
      `}</style>

      {/* Welcome Banner */}
      <div className="dash-banner" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(30,64,175,0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', right: '120px', top: '-20px',
          width: '120px', height: '120px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', right: '60px', bottom: '-30px',
          width: '160px', height: '160px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '50%',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1 }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', flexShrink: 0,
          }}>
            📡
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
              Welcome back, Amanullah 👋
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
              {new Date(today).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })} · {getGreeting()}
            </p>
          </div>
        </div>

        <Link className="dash-banner-btn" href="/dashboard/billing/new" style={{
          background: '#f59e0b',
          color: '#ffffff',
          padding: '11px 22px',
          borderRadius: '10px',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: 700,
          zIndex: 1,
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
          letterSpacing: '0.2px',
        }}>
          + Add Billing Record
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="dash-grid-4" style={{ marginBottom: '20px' }}>
        {[
          {
            label: "Today's Collections",
            value: `AFN ${todayAFN.toLocaleString()}`,
            sub: `$${todayUSD.toFixed(2)} · ${todayCount} payments`,
            icon: '💰', iconBg: '#d1fae5', iconColor: '#10b981',
            border: '#10b981',
          },
          {
            label: 'All-Time Total',
            value: `AFN ${runningTotal.toLocaleString()}`,
            sub: 'Cumulative running total',
            icon: '📊', iconBg: '#e0e7ff', iconColor: '#6366f1',
            border: '#6366f1',
          },
          {
            label: 'Total Customers',
            value: totalCustomers.toString(),
            sub: `${activeCustomers} active · ${inactiveCustomers} inactive`,
            icon: '👥', iconBg: '#e0f2fe', iconColor: '#0ea5e9',
            border: '#0ea5e9',
          },
          {
            label: 'Active Customers',
            value: activeCustomers.toString(),
            sub: suspendedCustomers > 0 ? `${suspendedCustomers} suspended` : 'All in good standing',
            icon: '✅', iconBg: '#fef3c7', iconColor: '#f59e0b',
            border: '#f59e0b',
          },
        ].map(card => (
          <div key={card.label} style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '18px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}>
            <div style={{
              width: '44px', height: '44px',
              background: card.iconBg,
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                {card.value}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                {card.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dash-actions" style={{ marginBottom: '20px' }}>
        {[
          { label: '+ Add Billing Record', href: '/dashboard/billing/new', primary: true },
          { label: '+ Add Customer', href: '/dashboard/customers/new', primary: false },
          { label: '📈 View Reports', href: '/dashboard/reports', primary: false },
          { label: '📋 All Billing', href: '/dashboard/billing', primary: false },
        ].map(action => (
          <Link key={action.href} href={action.href} style={{
            padding: '9px 18px',
            background: action.primary ? '#1e40af' : '#ffffff',
            color: action.primary ? '#ffffff' : '#374151',
            border: action.primary ? 'none' : '1.5px solid #e5e7eb',
            borderRadius: '9px',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: action.primary
              ? '0 2px 8px rgba(30,64,175,0.2)'
              : '0 1px 2px rgba(0,0,0,0.04)',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {action.label}
          </Link>
        ))}
      </div>

      {/* Chart + Breakdown */}
      <div className="dash-grid-2" style={{ marginBottom: '20px' }}>
        <WeekChart data={weekData} />

        {/* Customer breakdown */}
        <div style={{
          background: '#ffffff', borderRadius: '14px',
          padding: '20px 22px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: '1px solid #f3f4f6',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '18px' }}>
            Customer Breakdown
          </h3>
          {totalCustomers === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
              No customers yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Active', count: activeCustomers, color: '#10b981', bg: '#d1fae5' },
                { label: 'Inactive', count: inactiveCustomers, color: '#6b7280', bg: '#f3f4f6' },
                { label: 'Suspended', count: suspendedCustomers, color: '#ef4444', bg: '#fee2e2' },
              ].map(item => {
                const pct = totalCustomers > 0 ? (item.count / totalCustomers) * 100 : 0
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '8px', height: '8px',
                          borderRadius: '50%', background: item.color,
                        }} />
                        <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>
                          {item.label}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '12px', fontWeight: 700,
                        background: item.bg, color: item.color,
                        padding: '2px 8px', borderRadius: '20px',
                      }}>
                        {item.count}
                      </span>
                    </div>
                    <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: item.color, borderRadius: '3px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                )
              })}

              <div style={{
                marginTop: '6px', padding: '12px 14px',
                background: '#f9fafb', borderRadius: '10px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                border: '1px solid #f3f4f6',
              }}>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Total customers</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{totalCustomers}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Billing */}
      <div style={{
        background: '#ffffff', borderRadius: '14px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid #f3f4f6',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 22px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
            Recent Billing Records
          </h3>
          <Link href="/dashboard/billing" style={{
            fontSize: '12px', color: '#1e40af',
            textDecoration: 'none', fontWeight: 600,
            background: '#eff6ff', padding: '4px 10px',
            borderRadius: '6px',
          }}>
            View all →
          </Link>
        </div>

        {recentRecords.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
            No billing records yet.{' '}
            <Link href="/dashboard/billing/new" style={{ color: '#1e40af', fontWeight: 600 }}>
              Add the first one →
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="dash-table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                    {['Date', 'Customer', 'ID', 'Mbps', 'Bill No.', 'Amount (AFN)', 'USD', 'Status'].map(h => (
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
                  {recentRecords.map((record: any, i: number) => {
                    const st = statusColors[record.payment_status] || statusColors.paid
                    const c = record.customers as any
                    const isToday = record.record_date === today
                    return (
                      <tr key={record.id} style={{
                        borderBottom: '1px solid #f9fafb',
                        background: isToday ? '#f0f9ff' : i % 2 === 0 ? '#fff' : '#fafafa',
                        transition: 'background 0.1s',
                      }}>
                        <td style={{ padding: '11px 16px', fontSize: '12px', color: '#374151', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isToday && (
                              <span style={{
                                fontSize: '9px', background: '#1e40af',
                                color: '#fff', padding: '1px 5px',
                                borderRadius: '4px', fontWeight: 700,
                              }}>TODAY</span>
                            )}
                            {new Date(record.record_date).toLocaleDateString('en-GB')}
                          </div>
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#111827' }}>
                          {c?.full_name || '—'}
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{
                            fontFamily: 'monospace', fontSize: '11px', fontWeight: 700,
                            color: '#1e40af', background: '#eff6ff',
                            padding: '2px 6px', borderRadius: '4px',
                          }}>
                            {c?.customer_code || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>
                          {c?.packages?.mbps || '—'}
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: '12px', color: '#374151' }}>
                          {record.bill_number || '—'}
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: '13px', fontWeight: 800, color: '#111827' }}>
                          {Number(record.amount_afn).toLocaleString()}
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: '12px', color: '#6b7280' }}>
                          ${Number(record.amount_usd).toFixed(2)}
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{
                            background: st.bg, color: st.color,
                            padding: '3px 8px', borderRadius: '20px',
                            fontSize: '10px', fontWeight: 600,
                            textTransform: 'capitalize',
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
                    padding: '13px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: isToday ? '#f0f9ff' : '#fff',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px', fontWeight: 600, color: '#111827',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {c?.full_name || '—'}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{
                          fontFamily: 'monospace', fontSize: '10px', fontWeight: 700,
                          color: '#1e40af', background: '#eff6ff',
                          padding: '1px 5px', borderRadius: '3px',
                        }}>
                          {c?.customer_code}
                        </span>
                        <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                          {new Date(record.record_date).toLocaleDateString('en-GB')}
                        </span>
                        {isToday && (
                          <span style={{
                            fontSize: '9px', background: '#1e40af', color: '#fff',
                            padding: '1px 4px', borderRadius: '3px', fontWeight: 700,
                          }}>TODAY</span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
                        AFN {Number(record.amount_afn).toLocaleString()}
                      </div>
                      <span style={{
                        background: st.bg, color: st.color,
                        padding: '2px 7px', borderRadius: '10px',
                        fontSize: '10px', fontWeight: 600,
                      }}>
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
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}