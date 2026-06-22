import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret or admin request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'quika-backup-secret'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    console.log('Starting daily backup...')

    // Fetch all data in parallel
    const [
      customersResult,
      billingResult,
      packagesResult,
      profilesResult,
    ] = await Promise.all([
      adminSupabase
        .from('customers')
        .select(`*, packages (*)`)
        .order('created_at', { ascending: true }),

      adminSupabase
        .from('billing_records')
        .select(`
          *,
          customers (
            customer_code, full_name, zone,
            packages ( mbps )
          )
        `)
        .order('record_date', { ascending: true })
        .order('created_at', { ascending: true }),

      adminSupabase
        .from('packages')
        .select('*')
        .order('price_afn', { ascending: true }),

      adminSupabase
        .from('profiles')
        .select('id, full_name, role, created_at'),
    ])

    if (customersResult.error) throw new Error('Customers: ' + customersResult.error.message)
    if (billingResult.error) throw new Error('Billing: ' + billingResult.error.message)
    if (packagesResult.error) throw new Error('Packages: ' + packagesResult.error.message)
    if (profilesResult.error) throw new Error('Profiles: ' + profilesResult.error.message)

    // Build backup object
    const now = new Date()
    const backupData = {
      metadata: {
        created_at: now.toISOString(),
        created_at_kabul: new Date(now.getTime() + 4.5 * 60 * 60 * 1000)
          .toISOString()
          .replace('T', ' ')
          .substring(0, 19) + ' (Kabul +4:30)',
        version: '1.0',
        system: 'Quika ISP Management System',
        counts: {
          customers: customersResult.data?.length || 0,
          billing_records: billingResult.data?.length || 0,
          packages: packagesResult.data?.length || 0,
          users: profilesResult.data?.length || 0,
        },
      },
      customers: customersResult.data,
      billing_records: billingResult.data,
      packages: packagesResult.data,
      users: profilesResult.data,
    }

    // Convert to JSON
    const jsonContent = JSON.stringify(backupData, null, 2)
    const jsonBytes = new TextEncoder().encode(jsonContent)

    // File name: backup_2026-06-22.json
    const dateStr = now.toISOString().split('T')[0]
    const fileName = `backup_${dateStr}.json`

    console.log(`Saving backup: ${fileName}`)
    console.log(`Size: ${(jsonBytes.length / 1024).toFixed(1)} KB`)
    console.log(`Customers: ${backupData.metadata.counts.customers}`)
    console.log(`Billing records: ${backupData.metadata.counts.billing_records}`)

    // Delete old backup for same date if exists
    await adminSupabase.storage
      .from('backups')
      .remove([fileName])

    // Upload to Supabase Storage
    const { error: uploadError } = await adminSupabase.storage
      .from('backups')
      .upload(fileName, jsonBytes, {
        contentType: 'application/json',
        upsert: true,
      })

    if (uploadError) throw new Error('Upload failed: ' + uploadError.message)

    console.log('Backup completed successfully:', fileName)

    return NextResponse.json({
      success: true,
      file: fileName,
      size_kb: (jsonBytes.length / 1024).toFixed(1),
      counts: backupData.metadata.counts,
      created_at: now.toISOString(),
    })
  } catch (e: any) {
    console.error('Backup failed:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Also allow GET for manual trigger from dashboard
export async function GET(request: NextRequest) {
  return POST(request)
}