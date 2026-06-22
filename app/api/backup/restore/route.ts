import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '../../../../lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only admin can restore
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admin can restore backups' }, { status: 403 })
    }

    const body = await request.json()
    const backup = body.backup

    if (!backup || !backup.metadata) {
      return NextResponse.json({ error: 'Invalid backup file format' }, { status: 400 })
    }

    console.log('Starting restore from backup:', backup.metadata.created_at)
    console.log('Backup counts:', backup.metadata.counts)

    const results: any = {
      packages: { restored: 0, errors: [] },
      customers: { restored: 0, errors: [] },
      billing_records: { restored: 0, errors: [] },
    }

    // ── Step 1: Restore packages first (customers depend on them)
    if (backup.packages && backup.packages.length > 0) {
      console.log(`Restoring ${backup.packages.length} packages...`)

      for (const pkg of backup.packages) {
        const { error } = await adminSupabase
          .from('packages')
          .upsert({
            id: pkg.id,
            name: pkg.name,
            mbps: pkg.mbps,
            price_afn: pkg.price_afn,
            description: pkg.description,
            is_active: pkg.is_active,
            created_at: pkg.created_at,
          }, { onConflict: 'id' })

        if (error) {
          results.packages.errors.push(`${pkg.name}: ${error.message}`)
        } else {
          results.packages.restored++
        }
      }
    }

    // ── Step 2: Restore customers
    if (backup.customers && backup.customers.length > 0) {
      console.log(`Restoring ${backup.customers.length} customers...`)

      for (const customer of backup.customers) {
        const { error } = await adminSupabase
          .from('customers')
          .upsert({
            id: customer.id,
            customer_code: customer.customer_code,
            full_name: customer.full_name,
            full_name_dari: customer.full_name_dari,
            phone_1: customer.phone_1,
            phone_2: customer.phone_2,
            address_dari: customer.address_dari,
            address_english: customer.address_english,
            zone: customer.zone,
            package_id: customer.package_id,
            signup_date: customer.signup_date,
            status: customer.status,
            comments: customer.comments,
            created_at: customer.created_at,
          }, { onConflict: 'id' })

        if (error) {
          results.customers.errors.push(`${customer.customer_code}: ${error.message}`)
        } else {
          results.customers.restored++
        }
      }
    }

    // ── Step 3: Restore billing records
    if (backup.billing_records && backup.billing_records.length > 0) {
      console.log(`Restoring ${backup.billing_records.length} billing records...`)

      for (const record of backup.billing_records) {
        const { error } = await adminSupabase
          .from('billing_records')
          .upsert({
            id: record.id,
            record_date: record.record_date,
            customer_id: record.customer_id,
            bill_number: record.bill_number,
            amount_afn: record.amount_afn,
            exchange_rate: record.exchange_rate,
            running_total_afn: record.running_total_afn,
            payment_status: record.payment_status,
            comments: record.comments,
            created_by: record.created_by,
            created_at: record.created_at,
          }, { onConflict: 'id' })

        if (error) {
          results.billing_records.errors.push(`${record.id}: ${error.message}`)
        } else {
          results.billing_records.restored++
        }
      }
    }

    console.log('Restore complete:', results)

    const totalErrors =
      results.packages.errors.length +
      results.customers.errors.length +
      results.billing_records.errors.length

    return NextResponse.json({
      success: true,
      results,
      total_errors: totalErrors,
      message: totalErrors === 0
        ? 'Restore completed successfully with no errors'
        : `Restore completed with ${totalErrors} errors`,
    })
  } catch (e: any) {
    console.error('Restore failed:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}