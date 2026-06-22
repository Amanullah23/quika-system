import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '../../../../lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('file')

    if (!fileName) return NextResponse.json({ error: 'File name required' }, { status: 400 })

    // Validate file name format for security
    if (!fileName.match(/^backup_\d{4}-\d{2}-\d{2}\.json$/)) {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 })
    }

    // Download from storage
    const { data, error } = await adminSupabase.storage
      .from('backups')
      .download(fileName)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const buffer = await data.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}