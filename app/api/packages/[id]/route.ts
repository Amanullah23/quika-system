import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    // First update
    const { error } = await supabase
      .from('packages')
      .update({
        name: body.name,
        mbps: body.mbps,
        price_afn: Number(body.price_afn) || 0,
        description: body.description || null,
        is_active: body.is_active ?? true,
      })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Then fetch the updated record separately
    const { data, error: fetchError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', id)
      .limit(1)
      .single()

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 })

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}