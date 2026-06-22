import { getCustomerById, getPackages } from '../../../../../lib/customers'
import CustomerForm from '../../CustomerForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let customer, packages
  try {
    [customer, packages] = await Promise.all([
      getCustomerById(id),
      getPackages(),
    ])
  } catch {
    notFound()
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <Link href={`/dashboard/customers/${id}`} style={{
            color: '#6b7280', textDecoration: 'none', fontSize: '14px',
          }}>
            ← {customer.full_name}
          </Link>
          <span style={{ color: '#d1d5db' }}>/</span>
          <span style={{ fontSize: '14px', color: '#111827' }}>Edit</span>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
          Edit Customer
        </h2>
      </div>
      <CustomerForm packages={packages} customer={customer} mode="edit" />
    </div>
  )
}