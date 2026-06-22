import { createClient } from './supabase/server'
import type { BillingRecord } from './types'

export async function getBillingRecords(filters?: {
  date_from?: string
  date_to?: string
  customer_id?: string
  search?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('billing_records')
    .select(`
      *,
      customers (
        id, customer_code, full_name, full_name_dari, zone,
        packages ( mbps )
      )
    `)
    .order('record_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.date_from) {
    query = query.gte('record_date', filters.date_from)
  }
  if (filters?.date_to) {
    query = query.lte('record_date', filters.date_to)
  }
  if (filters?.customer_id) {
    query = query.eq('customer_id', filters.customer_id)
  }
  if (filters?.search) {
    query = query.or(
      `bill_number.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data as BillingRecord[]
}

export async function getBillingByCustomer(customer_id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('billing_records')
    .select('*')
    .eq('customer_id', customer_id)
    .order('record_date', { ascending: false })

  if (error) throw error
  return data as BillingRecord[]
}

export async function getLastRunningTotal() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('billing_records')
    .select('running_total_afn')
    .order('record_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return 0
  return data?.running_total_afn || 0
}

export async function getTodayStats() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('billing_records')
    .select('amount_afn, amount_usd')
    .eq('record_date', today)

  if (error) return { count: 0, total_afn: 0, total_usd: 0 }

  const count = data.length
  const total_afn = data.reduce((sum, r) => sum + Number(r.amount_afn), 0)
  const total_usd = data.reduce((sum, r) => sum + Number(r.amount_usd), 0)

  return { count, total_afn, total_usd }
}

export async function getDailyTotals(date_from: string, date_to: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('billing_records')
    .select('record_date, amount_afn, amount_usd')
    .gte('record_date', date_from)
    .lte('record_date', date_to)
    .order('record_date', { ascending: true })

  if (error) throw error

  const grouped: Record<string, { afn: number; usd: number; count: number }> = {}
  for (const r of data) {
    if (!grouped[r.record_date]) {
      grouped[r.record_date] = { afn: 0, usd: 0, count: 0 }
    }
    grouped[r.record_date].afn += Number(r.amount_afn)
    grouped[r.record_date].usd += Number(r.amount_usd)
    grouped[r.record_date].count += 1
  }

  return grouped
}