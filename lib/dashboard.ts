import { createClient } from './supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]

  // Run all queries in parallel
  const [
    customersResult,
    todayResult,
    lastRecordResult,
    weekResult,
    recentResult,
  ] = await Promise.all([
    // Total customers by status
    supabase
      .from('customers')
      .select('status'),

    // Today's billing
    supabase
      .from('billing_records')
      .select('amount_afn, amount_usd')
      .eq('record_date', today),

    // Last running total
    supabase
      .from('billing_records')
      .select('running_total_afn')
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),

    // Last 7 days daily totals
    supabase
      .from('billing_records')
      .select('record_date, amount_afn')
      .gte('record_date', sevenDaysAgo)
      .lte('record_date', today)
      .order('record_date', { ascending: true }),

    // Recent 8 billing records
    supabase
      .from('billing_records')
      .select(`
        id,
        record_date,
        amount_afn,
        amount_usd,
        bill_number,
        payment_status,
        customers (
          customer_code,
          full_name,
          zone,
          packages ( mbps )
        )
      `)
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  // Customer stats
  const customers = customersResult.data || []
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const inactiveCustomers = customers.filter(c => c.status === 'inactive').length
  const suspendedCustomers = customers.filter(c => c.status === 'suspended').length

  // Today stats
  const todayRecords = todayResult.data || []
  const todayAFN = todayRecords.reduce((s, r) => s + Number(r.amount_afn), 0)
  const todayUSD = todayRecords.reduce((s, r) => s + Number(r.amount_usd), 0)
  const todayCount = todayRecords.length

  // Running total
  const runningTotal = Number(lastRecordResult.data?.running_total_afn || 0)

  // Last 7 days grouped
  const weekRecords = weekResult.data || []
  const weekGrouped: Record<string, number> = {}

  // Fill all 7 days even if no records
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]
    weekGrouped[d] = 0
  }
  for (const r of weekRecords) {
    weekGrouped[r.record_date] = (weekGrouped[r.record_date] || 0) + Number(r.amount_afn)
  }

  const weekData = Object.entries(weekGrouped).map(([date, total]) => ({
    date,
    total,
    label: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    shortLabel: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
  }))

  const recentRecords = recentResult.data || []

  return {
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    suspendedCustomers,
    todayAFN,
    todayUSD,
    todayCount,
    runningTotal,
    weekData,
    recentRecords,
    today,
  }
}