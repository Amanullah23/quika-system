import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    if (!body.customer_id) {
      return NextResponse.json({ error: 'Customer is required' }, { status: 400 })
    }
    if (!body.amount_afn || Number(body.amount_afn) <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    // Get last running total
    const { data: lastRecord } = await supabase
      .from('billing_records')
      .select('running_total_afn')
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const lastTotal = lastRecord?.running_total_afn || 0
    const newTotal = Number(lastTotal) + Number(body.amount_afn)

    const { data, error } = await supabase
      .from('billing_records')
      .insert([{
        record_date: body.record_date,
        customer_id: body.customer_id,
        bill_number: body.bill_number || null,
        amount_afn: Number(body.amount_afn),
        exchange_rate: Number(body.exchange_rate) || 64,
        running_total_afn: newTotal,
        payment_status: body.payment_status || 'paid',
        comments: body.comments || null,
        created_by: user.id,
      }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}