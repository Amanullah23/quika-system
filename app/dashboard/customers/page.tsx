import Link from 'next/link'
import { getCustomers } from '../../../lib/customers'
import type { Customer } from '../../../lib/types'

const statusColors: Record<string, { bg: string; color: string }> = {
  active:    { bg: '#dcfce7', color: '#166534' },
  inactive:  { bg: '#f3f4f6', color: '#374151' },
  suspended: { bg: '#fef2f2', color: '#991b1b' },
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
            Customers
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
            {customers.length} total customers
          </p>
        </div>
        <Link href="/dashboard/customers/new" style={{
          background: '#0c7177',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          + Add Customer
        </Link>
      </div>

      {/* Filters */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <form method="GET" style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name, ID or phone..."
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '8px 14px',
              border: '1.5px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <select
            name="status"
            defaultValue={status}
            style={{
              padding: '8px 14px',
              border: '1.5px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              background: '#fff',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <button type="submit" style={{
            padding: '8px 20px',
            background: '#0c7177',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}>
            Search
          </button>
          {(search || status !== 'all') && (
            <Link href="/dashboard/customers" style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              color: '#374151',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
            }}>
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Error */}
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
                {['ID', 'Customer Name', 'Phone', 'Zone', 'Package', 'Signup Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
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
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{
                    padding: '48px',
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '14px',
                  }}>
                    {search ? 'No customers found for your search.' : 'No customers yet. Add your first customer.'}
                  </td>
                </tr>
              ) : (
                customers.map((customer, i) => {
                  const st = statusColors[customer.status] || statusColors.inactive
                  return (
                    <tr key={customer.id} style={{
                      borderBottom: '1px solid #f3f4f6',
                      background: i % 2 === 0 ? '#ffffff' : '#fafafa',
                    }}>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#0c7177',
                          background: '#f0fafa',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}>
                          {customer.customer_code}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                          {customer.full_name}
                        </div>
                        {customer.full_name_dari && (
                          <div style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            direction: 'rtl',
                            textAlign: 'right',
                            fontFamily: 'serif',
                          }}>
                            {customer.full_name_dari}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>
                        <div>{customer.phone_1 || '—'}</div>
                        {customer.phone_2 && (
                          <div style={{ color: '#9ca3af', fontSize: '12px' }}>{customer.phone_2}</div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>
                        {customer.zone || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>
                        {customer.packages ? (
                          <span style={{
                            background: '#f0fafa',
                            color: '#0c7177',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}>
                            {customer.packages.mbps}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>
                        {new Date(customer.signup_date).toLocaleDateString('en-GB')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: st.bg,
                          color: st.color,
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}>
                          {customer.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link href={`/dashboard/customers/${customer.id}`} style={{
                            padding: '5px 12px',
                            background: '#f0fafa',
                            color: '#0c7177',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}>
                            View
                          </Link>
                          <Link href={`/dashboard/customers/${customer.id}/edit`} style={{
                            padding: '5px 12px',
                            background: '#f3f4f6',
                            color: '#374151',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: 500,
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
      </div>
    </div>
  )
}