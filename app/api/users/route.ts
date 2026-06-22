import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '../../../lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: profiles, error } = await adminSupabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
          
  

    const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers()
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    const merged = profiles.map(p => {
      const authUser = authUsers.users.find(u => u.id === p.id)
      return {
        ...p,
        email: authUser?.email || '',
        last_sign_in: authUser?.last_sign_in_at || null,
      }
    })

    return NextResponse.json(merged)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()


    if (!body.email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (!body.password || body.password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    if (!body.full_name?.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }

    // Use Supabase REST API directly instead of auth.admin.createUser
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY


    const createRes = await fetch(`${url}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey!,
      },
      body: JSON.stringify({
        email: body.email.trim(),
        password: body.password,
        email_confirm: true,
        user_metadata: { full_name: body.full_name },
      }),
    })

    const createData = await createRes.json()

    if (!createRes.ok) {
      console.error('Create user failed:', createData)
      return NextResponse.json({
        error: createData.message || createData.error || 'Failed to create user',
      }, { status: 400 })
    }

    const newUserId = createData.id

    // Wait for trigger to create profile row
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if profile row exists
    const { data: existingProfile } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('id', newUserId)
      .single()

    if (existingProfile) {
      const { error: updateError } = await adminSupabase
        .from('profiles')
        .update({
          full_name: body.full_name,
          role: body.role || 'viewer',
        })
        .eq('id', newUserId)

      if (updateError) {
        console.error('Profile update error:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }
    } else {
  
      const { error: insertError } = await adminSupabase
        .from('profiles')
        .insert({
          id: newUserId,
          full_name: body.full_name,
          role: body.role || 'viewer',
        })

      if (insertError) {
        console.error('Profile insert error:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 400 })
      }
    }


    return NextResponse.json({ success: true, id: newUserId })
  } catch (e: any) {
    console.error('Unexpected error:', e)
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 })
  }
}