import { getCustomers } from '../../../../lib/customers'
import { getLastRunningTotal } from '../../../../lib/billing'
import BillingForm from '../BillingForm'

export default async function NewBillingPage() {
  const [customers, lastTotal] = await Promise.all([
    getCustomers(),
    getLastRunningTotal(),
  ])

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
          Add Billing Record
        </h2>
        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
          Record a new payment from a customer
        </p>
      </div>
      <BillingForm customers={customers} lastTotal={Number(lastTotal)} />
    </div>
  )
}