import Link from 'next/link'
import { getCustomerById } from '../../../../lib/customers'
import { getBillingByCustomer } from '../../../../lib/billing'
import { notFound } from 'next/navigation'

const statusColors: Record<string, { bg: string; color: string }> = {
  active:    { bg: '#dcfce7', color: '#166534' },
  inactive:  { bg: '#f3f4f6', color: '#374151' },
  suspended: { bg: '#fef2f2', color: '#991b1b' },
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
    <div style={{ maxWidth: '860px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/dashboard/customers" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
            ← Customers
          </Link>
          <span style={{ color: '#d1d5db' }}>/</span>
          <span style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>
            {customer.customer_code}
          </span>
        </div>
        <Link href={`/dashboard/customers/${id}/edit`} style={{
          padding: '8px 18px',
          background: '#0c7177',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          Edit Customer
        </Link>
      </div>

      {/* Profile Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        marginBottom: '16px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px', height: '56px',
              background: '#0c7177',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '22px', fontWeight: 700,
            }}>
              {customer.full_name.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                {customer.full_name}
              </h2>
              {customer.full_name_dari && (
                <p style={{ fontSize: '15px', color: '#6b7280', direction: 'rtl', fontFamily: 'serif', marginTop: '2px' }}>
                  {customer.full_name_dari}
                </p>
              )}
            </div>
          </div>
          <span style={{
            background: st.bg, color: st.color,
            padding: '4px 14px', borderRadius: '20px',
            fontSize: '13px', fontWeight: 500, textTransform: 'capitalize',
          }}>
            {customer.status}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Customer ID', value: customer.customer_code },
            { label: 'Signup Date', value: new Date(customer.signup_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { label: 'Phone 1', value: customer.phone_1 || '—' },
            { label: 'Phone 2', value: customer.phone_2 || '—' },
            { label: 'Zone', value: customer.zone || '—' },
            { label: 'Package', value: customer.packages ? `${customer.packages.mbps} — AFN ${customer.packages.price_afn.toLocaleString()}` : '—' },
          ].map(item => (
            <div key={item.label} style={{ padding: '14px 16px', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>
                {item.value}
              </div>
            </div>
          ))}

          {customer.address_dari && (
            <div style={{ gridColumn: '1 / -1', padding: '14px 16px', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Address (Dari)
              </div>
              <div style={{ fontSize: '14px', color: '#111827', direction: 'rtl', fontFamily: 'serif' }}>
                {customer.address_dari}
              </div>
            </div>
          )}

          {customer.comments && (
            <div style={{ gridColumn: '1 / -1', padding: '14px 16px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Comments
              </div>
              <div style={{ fontSize: '14px', color: '#111827' }}>{customer.comments}</div>
            </div>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
            Billing History
          </h3>
          {billingRecords.length > 0 && (
            <span style={{
              fontSize: '13px', fontWeight: 600, color: '#0c7177',
              background: '#f0fafa', padding: '4px 12px', borderRadius: '20px',
            }}>
              Total paid: AFN {totalPaid.toLocaleString()}
            </span>
          )}
        </div>

        {billingRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', fontSize: '14px', background: '#f9fafb', borderRadius: '8px' }}>
            No billing records yet for this customer.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Date', 'Bill No.', 'Amount (AFN)', 'Rate', 'USD', 'Status', 'Comments'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 600, color: '#6b7280',
                      textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {billingRecords.map((r, i) => {
                  const bs = billColors[r.payment_status] || billColors.paid
                  return (
                    <tr key={r.id} style={{
                      borderBottom: '1px solid #f3f4f6',
                      background: i % 2 === 0 ? '#fff' : '#fafafa',
                    }}>
                      <td style={{ padding: '11px 14px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
                        {new Date(r.record_date).toLocaleDateString('en-GB')}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '13px', color: '#374151' }}>
                        {r.bill_number || '—'}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                        {Number(r.amount_afn).toLocaleString()}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: '#6b7280' }}>
                        {r.exchange_rate}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '13px', color: '#374151' }}>
                        ${Number(r.amount_usd).toFixed(2)}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{
                          background: bs.bg, color: bs.color,
                          padding: '2px 8px', borderRadius: '20px',
                          fontSize: '11px', fontWeight: 500, textTransform: 'capitalize',
                        }}>
                          {r.payment_status}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: '#6b7280' }}>
                        {r.comments || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}