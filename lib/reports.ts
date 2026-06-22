import { createClient } from './supabase/server'

export async function getDailySummary(date_from: string, date_to: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('billing_records')
    .select(`
      record_date,
      amount_afn,
      amount_usd,
      running_total_afn,
      customers (
        customer_code, full_name, zone,
        packages ( mbps )
      )
    `)
    .gte('record_date', date_from)
    .lte('record_date', date_to)
    .order('record_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getMonthlySummary(year: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('billing_records')
    .select('record_date, amount_afn, amount_usd')
    .gte('record_date', `${year}-01-01`)
    .lte('record_date', `${year}-12-31`)

  if (error) throw error

  const months: Record<number, { afn: number; usd: number; count: number }> = {}
  for (let m = 1; m <= 12; m++) months[m] = { afn: 0, usd: 0, count: 0 }

  for (const r of data) {
    const month = new Date(r.record_date).getMonth() + 1
    months[month].afn += Number(r.amount_afn)
    months[month].usd += Number(r.amount_usd)
    months[month].count += 1
  }

  return months
}

export async function getCustomerSummary(date_from: string, date_to: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('billing_records')
    .select(`
      amount_afn,
      amount_usd,
      record_date,
      customers (
        id, customer_code, full_name, zone,
        packages ( mbps )
      )
    `)
    .gte('record_date', date_from)
    .lte('record_date', date_to)

  if (error) throw error

  const grouped: Record<string, {
    customer_code: string
    full_name: string
    zone: string | null
    mbps: string | null
    total_afn: number
    total_usd: number
    count: number
  }> = {}

  for (const r of data) {
    const c = r.customers as any
    if (!c) continue
    const key = c.id || c.customer_code
    if (!grouped[key]) {
      grouped[key] = {
        customer_code: c.customer_code,
        full_name: c.full_name,
        zone: c.zone,
        mbps: c.packages?.mbps || null,
        total_afn: 0,
        total_usd: 0,
        count: 0,
      }
    }
    grouped[key].total_afn += Number(r.amount_afn)
    grouped[key].total_usd += Number(r.amount_usd)
    grouped[key].count += 1
  }

  return Object.values(grouped).sort((a, b) => b.total_afn - a.total_afn)
}

export async function getFullExportData(date_from: string, date_to: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('billing_records')
    .select(`
      record_date,
      bill_number,
      amount_afn,
      exchange_rate,
      amount_usd,
      running_total_afn,
      payment_status,
      comments,
      customers (
        customer_code, full_name, full_name_dari, zone, phone_1,
        packages ( mbps )
      )
    `)
    .gte('record_date', date_from)
    .lte('record_date', date_to)
    .order('record_date', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}