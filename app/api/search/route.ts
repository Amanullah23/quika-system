import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    if (q.length < 2) return NextResponse.json({ customers: [], billing: [] })

    // Search customers
    const { data: customers } = await supabase
      .from('customers')
      .select(`
        id, customer_code, full_name, full_name_dari,
        phone_1, zone, status,
        packages ( mbps )
      `)
      .or(
        `full_name.ilike.%${q}%,customer_code.ilike.%${q}%,phone_1.ilike.%${q}%,full_name_dari.ilike.%${q}%`
      )
      .limit(6)

    // Search billing
    const { data: billing } = await supabase
      .from('billing_records')
      .select(`
        id, record_date, amount_afn, bill_number, payment_status,
        customers (
          customer_code, full_name
        )
      `)
      .or(
        `bill_number.ilike.%${q}%`
      )
      .order('record_date', { ascending: false })
      .limit(5)

    // Also search billing by customer name
    const { data: billingByCustomer } = await supabase
      .from('billing_records')
      .select(`
        id, record_date, amount_afn, bill_number, payment_status,
        customers!inner (
          customer_code, full_name
        )
      `)
      .ilike('customers.full_name', `%${q}%`)
      .order('record_date', { ascending: false })
      .limit(5)

    // Merge and deduplicate billing results
    const allBilling = [...(billing || []), ...(billingByCustomer || [])]
    const seen = new Set()
    const uniqueBilling = allBilling.filter(r => {
      if (seen.has(r.id)) return false
      seen.add(r.id)
      return true
    }).slice(0, 6)

    return NextResponse.json({
      customers: customers || [],
      billing: uniqueBilling,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}