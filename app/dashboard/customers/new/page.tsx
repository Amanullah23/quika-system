import { getPackages } from '../../../../lib/customers'
import CustomerForm from '../CustomerForm'

export default async function NewCustomerPage() {
  const packages = await getPackages()

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
          Add New Customer
        </h2>
        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
          Fill in the customer details below
        </p>
      </div>
      <CustomerForm packages={packages} mode="create" />
    </div>
  )
}