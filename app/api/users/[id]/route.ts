import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '../../../../lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    const { data: myProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = myProfile?.role === 'admin'
    const isOwnProfile = user.id === id

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateData: any = { full_name: body.full_name || '' }
    if (isAdmin && body.role) updateData.role = body.role

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 })

    if (body.password && body.password.length >= 6) {
      const { error: pwError } = await adminSupabase.auth.admin.updateUserById(id, {
        password: body.password,
      })
      if (pwError) return NextResponse.json({ error: pwError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
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
    const adminSupabase = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (user.id === id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const { error } = await adminSupabase.auth.admin.deleteUser(id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}