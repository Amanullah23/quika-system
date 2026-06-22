'use client'

import { useState, useEffect, useRef } from 'react'
import { useRole } from '../../../lib/roleContext'

type BackupFile = {
  name: string
  created_at: string
  updated_at: string
  metadata: { size: number }
}

type RestoreResult = {
  success: boolean
  results: {
    packages: { restored: number; errors: string[] }
    customers: { restored: number; errors: string[] }
    billing_records: { restored: number; errors: string[] }
  }
  total_errors: number
  message: string
}

export default function BackupsPage() {
  const { isAdmin } = useRole()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [backups, setBackups] = useState<BackupFile[]>([])
  const [loading, setLoading] = useState(true)
  const [runningBackup, setRunningBackup] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [pendingRestoreData, setPendingRestoreData] = useState<any>(null)
  const [pendingFileName, setPendingFileName] = useState('')

  async function loadBackups() {
    try {
      const res = await fetch('/api/backup/list')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setBackups(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBackups() }, [])

  async function runBackupNow() {
    setRunningBackup(true)
    setError('')
    setSuccess('')
    setRestoreResult(null)
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'quika-backup-secret-2026'}`,
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(
        `Backup created: ${data.file} — ${data.size_kb} KB — ` +
        `${data.counts.customers} customers, ${data.counts.billing_records} billing records`
      )
      loadBackups()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setRunningBackup(false)
    }
  }

  async function downloadBackup(fileName: string) {
    try {
      const res = await fetch(`/api/backup/download?file=${fileName}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e.message)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError('')
    setSuccess('')
    setRestoreResult(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      setError('Please select a valid JSON backup file')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const data = JSON.parse(text)

        if (!data.metadata || !data.customers || !data.billing_records) {
          throw new Error('This file is not a valid Quika backup file')
        }

        setPendingRestoreData(data)
        setPendingFileName(file.name)
        setShowRestoreConfirm(true)
      } catch (e: any) {
        setError(e.message || 'Failed to read backup file')
      }
    }
    reader.readAsText(file)

    // Reset input so same file can be selected again
    e.target.value = ''
  }

  async function confirmRestore() {
    if (!pendingRestoreData) return
    setRestoring(true)
    setShowRestoreConfirm(false)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup: pendingRestoreData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setRestoreResult(data)
      if (data.total_errors === 0) {
        setSuccess(`Restore completed successfully from ${pendingFileName}`)
      }
      setPendingRestoreData(null)
      setPendingFileName('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setRestoring(false)
    }
  }

  function formatSize(bytes: number) {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Daily Backups</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
            Automatic backups run every day at 8:00 AM Kabul time
          </p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Restore button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={restoring}
                style={{
                  padding: '10px 20px',
                  background: restoring ? '#9ca3af' : '#ffffff',
                  color: restoring ? '#fff' : '#374151',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px', fontWeight: 600,
                  cursor: restoring ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                {restoring ? '⏳ Restoring...' : '⬆ Restore from File'}
              </button>
            </div>

            {/* Backup now button */}
            <button
              onClick={runBackupNow}
              disabled={runningBackup}
              style={{
                padding: '10px 20px',
                background: runningBackup ? '#9ca3af' : '#0c7177',
                color: '#fff', border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: 600,
                cursor: runningBackup ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {runningBackup ? '⏳ Running...' : '▶ Run Backup Now'}
            </button>
          </div>
        )}
      </div>

      {/* Info cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px', marginBottom: '24px',
      }}>
        {[
          {
            label: 'Auto Backup Schedule',
            value: '8:00 AM Daily',
            sub: 'Kabul time (UTC +4:30)',
            color: '#0c7177',
          },
          {
            label: 'Total Backups',
            value: backups.length.toString(),
            sub: 'Stored in Supabase',
            color: '#054247',
          },
          {
            label: 'Latest Backup',
            value: backups.length > 0
              ? new Date(backups[0].created_at).toLocaleDateString('en-GB')
              : 'None yet',
            sub: backups.length > 0
              ? formatSize(backups[0]?.metadata?.size)
              : 'Run backup now',
            color: '#ce143d',
          },
        ].map(card => (
          <div key={card.label} style={{
            background: '#ffffff', borderRadius: '12px',
            padding: '18px 20px', borderLeft: `4px solid ${card.color}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: card.color, marginTop: '6px' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* What is backed up */}
      <div style={{
        background: '#f0fafa', border: '1px solid #0c7177',
        borderRadius: '12px', padding: '16px 20px',
        marginBottom: '20px', fontSize: '13px', color: '#054247',
      }}>
        <div style={{ fontWeight: 600, marginBottom: '8px' }}>📦 Each backup includes:</div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {['All customers', 'All billing records', 'All packages', 'User profiles', 'Timestamps and metadata'].map(item => (
            <span key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#0c7177', fontWeight: 700 }}>✓</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* Error / Success messages */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '8px', padding: '12px 16px',
          color: '#dc2626', fontSize: '14px', marginBottom: '16px',
        }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: '8px', padding: '12px 16px',
          color: '#166534', fontSize: '14px', marginBottom: '16px',
        }}>
          ✅ {success}
        </div>
      )}

      {/* Restore result */}
      {restoreResult && (
        <div style={{
          background: '#ffffff', borderRadius: '12px',
          padding: '20px 24px', marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: restoreResult.total_errors === 0
            ? '1px solid #bbf7d0' : '1px solid #fecaca',
        }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
            Restore Summary
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
            {[
              { label: 'Packages', data: restoreResult.results.packages },
              { label: 'Customers', data: restoreResult.results.customers },
              { label: 'Billing Records', data: restoreResult.results.billing_records },
            ].map(item => (
              <div key={item.label} style={{
                background: item.data.errors.length > 0 ? '#fef2f2' : '#f0fdf4',
                borderRadius: '8px', padding: '12px 16px',
              }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: item.data.errors.length > 0 ? '#dc2626' : '#166534' }}>
                  {item.data.restored} restored
                </div>
                {item.data.errors.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>
                    {item.data.errors.length} errors
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Show errors if any */}
          {restoreResult.total_errors > 0 && (
            <div style={{ fontSize: '13px', color: '#dc2626', marginTop: '8px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Errors:</div>
              {[
                ...restoreResult.results.packages.errors,
                ...restoreResult.results.customers.errors,
                ...restoreResult.results.billing_records.errors,
              ].map((err, i) => (
                <div key={i} style={{ fontFamily: 'monospace', fontSize: '11px', marginBottom: '2px' }}>
                  • {err}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Backups list */}
      <div style={{
        background: '#ffffff', borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f3f4f6',
          fontSize: '14px', fontWeight: 600, color: '#111827',
        }}>
          Backup Files
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            Loading backups...
          </div>
        ) : backups.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💾</div>
            <div style={{ fontWeight: 500, color: '#374151', marginBottom: '4px' }}>No backups yet</div>
            <div>Click "Run Backup Now" to create your first backup</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['File Name', 'Created At', 'Size', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '11px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: 600, color: '#6b7280',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backups.map((backup, i) => (
                <tr key={backup.name} style={{
                  borderBottom: '1px solid #f3f4f6',
                  background: i === 0 ? '#f0fafa' : i % 2 === 0 ? '#fff' : '#fafafa',
                }}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>💾</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>
                          {backup.name}
                        </div>
                        {i === 0 && (
                          <span style={{
                            fontSize: '10px', background: '#0c7177',
                            color: '#fff', padding: '1px 6px',
                            borderRadius: '4px', fontWeight: 600,
                          }}>
                            LATEST
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: '#374151' }}>
                    {formatDate(backup.created_at)}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: '#6b7280' }}>
                    {formatSize(backup.metadata?.size)}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => downloadBackup(backup.name)}
                        style={{
                          padding: '6px 12px',
                          background: '#f0fafa', color: '#0c7177',
                          border: '1px solid #0c7177',
                          borderRadius: '6px', fontSize: '12px',
                          fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        ⬇ Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Restore confirmation modal */}
      {showRestoreConfirm && pendingRestoreData && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', textAlign: 'center', marginBottom: '12px' }}>
              Confirm Restore
            </h3>

            {/* Backup info */}
            <div style={{
              background: '#f9fafb', borderRadius: '8px',
              padding: '14px 16px', marginBottom: '16px',
              fontSize: '13px', color: '#374151',
            }}>
              <div style={{ marginBottom: '6px' }}>
                <strong>File:</strong> {pendingFileName}
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong>Backup date:</strong> {pendingRestoreData.metadata.created_at_kabul || pendingRestoreData.metadata.created_at}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '10px' }}>
                <div style={{ background: '#f0fafa', padding: '8px 12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Customers</div>
                  <div style={{ fontWeight: 700, color: '#0c7177' }}>{pendingRestoreData.metadata.counts.customers}</div>
                </div>
                <div style={{ background: '#f0fafa', padding: '8px 12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Billing Records</div>
                  <div style={{ fontWeight: 700, color: '#0c7177' }}>{pendingRestoreData.metadata.counts.billing_records}</div>
                </div>
                <div style={{ background: '#f0fafa', padding: '8px 12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Packages</div>
                  <div style={{ fontWeight: 700, color: '#0c7177' }}>{pendingRestoreData.metadata.counts.packages}</div>
                </div>
                <div style={{ background: '#f0fafa', padding: '8px 12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Users</div>
                  <div style={{ fontWeight: 700, color: '#0c7177' }}>{pendingRestoreData.metadata.counts.users}</div>
                </div>
              </div>
            </div>

            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', padding: '12px 16px',
              fontSize: '13px', color: '#991b1b', marginBottom: '24px',
            }}>
              ⚠️ This will overwrite existing records with the same ID. New records added after this backup will not be affected. This action cannot be undone.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={confirmRestore}
                style={{
                  flex: 1, padding: '12px',
                  background: '#ce143d', color: '#fff',
                  border: 'none', borderRadius: '8px',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Yes, Restore Data
              </button>
              <button
                onClick={() => {
                  setShowRestoreConfirm(false)
                  setPendingRestoreData(null)
                  setPendingFileName('')
                }}
                style={{
                  flex: 1, padding: '12px',
                  background: '#f3f4f6', color: '#374151',
                  border: 'none', borderRadius: '8px',
                  fontSize: '14px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}