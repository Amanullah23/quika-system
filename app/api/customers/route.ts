import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    const { data, error } = await supabase
      .from('customers')
      .insert([{
        customer_code: body.customer_code,
        full_name: body.full_name,
        full_name_dari: body.full_name_dari || null,
        phone_1: body.phone_1 || null,
        phone_2: body.phone_2 || null,
        address_dari: body.address_dari || null,
        address_english: body.address_english || null,
        zone: body.zone || null,
        package_id: body.package_id || null,
        signup_date: body.signup_date,
        status: body.status,
        comments: body.comments || null,
      }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}