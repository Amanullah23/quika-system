import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const date_from = searchParams.get('date_from') || ''
    const date_to = searchParams.get('date_to') || ''

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

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Format for Excel
    const rows = (data || []).map((r: any) => ({
      'Date': r.record_date,
      'Customer Name': r.customers?.full_name || '',
      'Customer Name (Dari)': r.customers?.full_name_dari || '',
      'ID': r.customers?.customer_code || '',
      'Zone': r.customers?.zone || '',
      'Mbps': r.customers?.packages?.mbps || '',
      'Phone': r.customers?.phone_1 || '',
      'Bill No.': r.bill_number || '',
      'Amount (AFN)': Number(r.amount_afn),
      'Running Total (AFN)': Number(r.running_total_afn),
      'Rate': Number(r.exchange_rate),
      'Amount (USD)': Number(r.amount_usd),
      'Status': r.payment_status,
      'Comments': r.comments || '',
    }))

    return NextResponse.json({ rows })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}