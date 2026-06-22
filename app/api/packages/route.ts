import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    if (!body.name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!body.mbps?.trim()) return NextResponse.json({ error: 'Mbps is required' }, { status: 400 })

    const { data, error } = await supabase
      .from('packages')
      .insert([{
        name: body.name,
        mbps: body.mbps,
        price_afn: Number(body.price_afn) || 0,
        description: body.description || null,
        is_active: body.is_active ?? true,
      }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}