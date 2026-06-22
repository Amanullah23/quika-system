import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '../../../../lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // List all backup files
    const { data, error } = await adminSupabase.storage
      .from('backups')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json(data || [])
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}