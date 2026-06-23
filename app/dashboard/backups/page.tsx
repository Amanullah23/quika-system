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

  function formatDateShort(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      <style>{`
        .bkp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .bkp-header-actions { display: flex; gap: 10px; }
        .bkp-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .bkp-table-wrap { display: block; }
        .bkp-cards-wrap { display: none; }
        .bkp-restore-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media (max-width: 767px) {
          .bkp-header { flex-direction: column !important; align-items: flex-start !important; }
          .bkp-header-actions { width: 100% !important; }
          .bkp-header-actions button { flex: 1 !important; }
          .bkp-stat-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
          .bkp-table-wrap { display: none !important; }
          .bkp-cards-wrap { display: block !important; }
          .bkp-restore-grid { grid-template-columns: 1fr !important; }
          .bkp-confirm-btns { flex-direction: column !important; }
        }
      `}</style>

      {/* Header */}
      <div className="bkp-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
            Daily Backups
          </h2>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', fontWeight: 500 }}>
            Automatic backups run every day at 8:00 AM Kabul time
          </p>
        </div>
        {isAdmin && (
          <div className="bkp-header-actions">
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
                padding: '10px 18px',
                background: restoring ? '#9ca3af' : '#fff',
                color: restoring ? '#fff' : '#374151',
                border: '1.5px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '13px', fontWeight: 600,
                cursor: restoring ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'inherit',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              {restoring ? '⏳ Restoring...' : '⬆ Restore from File'}
            </button>
            <button
              onClick={runBackupNow}
              disabled={runningBackup}
              style={{
                padding: '10px 18px',
                background: runningBackup
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #1e40af, #3b82f6)',
                color: '#fff', border: 'none',
                borderRadius: '10px',
                fontSize: '13px', fontWeight: 700,
                cursor: runningBackup ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'inherit',
                boxShadow: runningBackup ? 'none' : '0 2px 8px rgba(30,64,175,0.25)',
              }}
            >
              {runningBackup ? '⏳ Running...' : '▶ Run Backup Now'}
            </button>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="bkp-stat-grid" style={{ marginBottom: '20px' }}>
        {[
          {
            label: 'Auto Backup Schedule',
            value: '8:00 AM Daily',
            sub: 'Kabul time (UTC +4:30)',
            icon: '⏰', iconBg: '#e0f2fe', border: '#0ea5e9',
          },
          {
            label: 'Total Backups',
            value: backups.length.toString(),
            sub: 'Stored in Supabase Storage',
            icon: '💾', iconBg: '#dbeafe', border: '#3b82f6',
          },
          {
            label: 'Latest Backup',
            value: backups.length > 0
              ? formatDateShort(backups[0].created_at)
              : 'None yet',
            sub: backups.length > 0
              ? formatSize(backups[0]?.metadata?.size)
              : 'Run backup now',
            icon: '🕐', iconBg: '#d1fae5', border: '#10b981',
          },
        ].map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: '12px',
            padding: '16px 18px',
            border: '1px solid #f3f4f6',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: '14px',
            borderLeft: `3px solid ${card.border}`,
          }}>
            <div style={{
              width: '44px', height: '44px',
              background: card.iconBg, borderRadius: '12px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '20px', flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                {card.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What is backed up */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
        border: '1px solid #bfdbfe',
        borderRadius: '12px', padding: '14px 18px',
        marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '14px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: '36px', height: '36px',
          background: '#1e40af', borderRadius: '10px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '18px', flexShrink: 0,
        }}>
          📦
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>
            Each backup includes:
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {['All customers', 'All billing records', 'All packages', 'User profiles', 'Timestamps & metadata'].map(item => (
              <span key={item} style={{
                fontSize: '12px', color: '#1e40af', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <span style={{
                  width: '16px', height: '16px',
                  background: '#1e40af', borderRadius: '50%',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '9px', fontWeight: 800, flexShrink: 0,
                }}>✓</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '10px', padding: '12px 16px',
          color: '#dc2626', fontSize: '13px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: '10px', padding: '12px 16px',
          color: '#166534', fontSize: '13px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          ✅ {success}
        </div>
      )}

      {/* Restore result */}
      {restoreResult && (
        <div style={{
          background: '#fff', borderRadius: '14px',
          padding: '20px 24px', marginBottom: '16px',
          border: restoreResult.total_errors === 0
            ? '1px solid #bbf7d0' : '1px solid #fecaca',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            fontSize: '14px', fontWeight: 700, color: '#111827',
            marginBottom: '14px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '18px' }}>
              {restoreResult.total_errors === 0 ? '✅' : '⚠️'}
            </span>
            Restore Summary
          </div>
          <div className="bkp-restore-grid" style={{ marginBottom: '12px' }}>
            {[
              { label: 'Packages', data: restoreResult.results.packages, icon: '📦' },
              { label: 'Customers', data: restoreResult.results.customers, icon: '👥' },
              { label: 'Billing Records', data: restoreResult.results.billing_records, icon: '💰' },
            ].map(item => (
              <div key={item.label} style={{
                background: item.data.errors.length > 0 ? '#fef2f2' : '#f0fdf4',
                borderRadius: '10px', padding: '12px 14px',
                border: item.data.errors.length > 0 ? '1px solid #fecaca' : '1px solid #bbf7d0',
              }}>
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>{item.icon}</div>
                <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: '20px', fontWeight: 800,
                  color: item.data.errors.length > 0 ? '#dc2626' : '#166534',
                }}>
                  {item.data.restored}
                  <span style={{ fontSize: '12px', fontWeight: 500, marginLeft: '4px' }}>restored</span>
                </div>
                {item.data.errors.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                    {item.data.errors.length} errors
                  </div>
                )}
              </div>
            ))}
          </div>
          {restoreResult.total_errors > 0 && (
            <div style={{
              background: '#fef2f2', borderRadius: '8px',
              padding: '10px 14px', fontSize: '12px', color: '#dc2626',
            }}>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>Errors:</div>
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

      {/* Backup files list */}
      <div style={{
        background: '#fff', borderRadius: '14px',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        {/* List header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#f9fafb',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
            Backup Files
          </div>
          <span style={{
            fontSize: '11px', fontWeight: 700,
            background: '#eff6ff', color: '#1e40af',
            padding: '3px 10px', borderRadius: '20px',
            border: '1px solid #bfdbfe',
          }}>
            {backups.length} files
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💾</div>
            Loading backups...
          </div>
        ) : backups.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
            <div style={{ fontSize: '48px', marginBottom: '14px' }}>💾</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              No backups yet
            </div>
            <div style={{ marginBottom: '20px' }}>
              Click "Run Backup Now" to create your first backup
            </div>
            {isAdmin && (
              <button
                onClick={runBackupNow}
                disabled={runningBackup}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  color: '#fff', border: 'none', borderRadius: '9px',
                  fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                ▶ Run First Backup
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="bkp-table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                    {['File Name', 'Created At', 'Size', 'Actions'].map(h => (
                      <th key={h} style={{
                        padding: '10px 18px', textAlign: 'left',
                        fontSize: '10px', fontWeight: 700, color: '#9ca3af',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup, i) => (
                    <tr key={backup.name} style={{
                      borderBottom: '1px solid #f9fafb',
                      background: i === 0 ? '#f0f9ff' : i % 2 === 0 ? '#fff' : '#fafafa',
                    }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px',
                            background: i === 0 ? '#dbeafe' : '#f3f4f6',
                            borderRadius: '9px',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '17px', flexShrink: 0,
                          }}>
                            💾
                          </div>
                          <div>
                            <div style={{
                              fontSize: '12px', fontWeight: 700,
                              color: i === 0 ? '#1e40af' : '#111827',
                              fontFamily: 'monospace',
                            }}>
                              {backup.name}
                            </div>
                            {i === 0 && (
                              <span style={{
                                fontSize: '9px', background: '#1e40af',
                                color: '#fff', padding: '1px 6px',
                                borderRadius: '4px', fontWeight: 700,
                                marginTop: '2px', display: 'inline-block',
                              }}>
                                LATEST
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                        {formatDate(backup.created_at)}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontSize: '12px', fontWeight: 600,
                          color: '#374151', background: '#f3f4f6',
                          padding: '3px 8px', borderRadius: '6px',
                        }}>
                          {formatSize(backup.metadata?.size)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => downloadBackup(backup.name)}
                          style={{
                            padding: '7px 14px',
                            background: '#eff6ff', color: '#1e40af',
                            border: '1px solid #bfdbfe',
                            borderRadius: '8px', fontSize: '12px',
                            fontWeight: 700, cursor: 'pointer',
                            fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', gap: '5px',
                          }}
                        >
                          ⬇ Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="bkp-cards-wrap">
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {backups.map((backup, i) => (
                  <div key={backup.name} style={{
                    background: i === 0 ? '#f0f9ff' : '#f9fafb',
                    borderRadius: '10px', padding: '14px',
                    border: i === 0 ? '1px solid #bfdbfe' : '1px solid #f3f4f6',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px',
                          background: i === 0 ? '#dbeafe' : '#f3f4f6',
                          borderRadius: '9px',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '17px', flexShrink: 0,
                        }}>
                          💾
                        </div>
                        <div>
                          <div style={{
                            fontSize: '11px', fontWeight: 700,
                            color: i === 0 ? '#1e40af' : '#111827',
                            fontFamily: 'monospace',
                          }}>
                            {backup.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                            {formatDate(backup.created_at)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        {i === 0 && (
                          <span style={{
                            fontSize: '9px', background: '#1e40af',
                            color: '#fff', padding: '1px 6px',
                            borderRadius: '4px', fontWeight: 700,
                          }}>
                            LATEST
                          </span>
                        )}
                        <span style={{
                          fontSize: '11px', fontWeight: 600,
                          color: '#374151', background: '#f3f4f6',
                          padding: '2px 7px', borderRadius: '5px',
                        }}>
                          {formatSize(backup.metadata?.size)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadBackup(backup.name)}
                      style={{
                        width: '100%', padding: '9px',
                        background: '#eff6ff', color: '#1e40af',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px', fontSize: '12px',
                        fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '6px',
                      }}
                    >
                      ⬇ Download Backup
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Restore confirmation modal */}
      {showRestoreConfirm && pendingRestoreData && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '20px',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            width: '100%', maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            overflow: 'hidden',
          }}>
            {/* Modal header */}
            <div style={{
              background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  ⚠️
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                    Confirm Restore
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', marginTop: '1px' }}>
                    This action cannot be undone
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setShowRestoreConfirm(false); setPendingRestoreData(null); setPendingFileName('') }}
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  color: '#fff', width: '32px', height: '32px',
                  borderRadius: '8px', cursor: 'pointer',
                  fontSize: '16px', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '24px' }}>
              {/* File info */}
              <div style={{
                background: '#f9fafb', borderRadius: '10px',
                padding: '14px 16px', marginBottom: '16px',
                border: '1px solid #f3f4f6',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '20px' }}>💾</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>
                      {pendingFileName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>
                      {pendingRestoreData.metadata.created_at_kabul || pendingRestoreData.metadata.created_at}
                    </div>
                  </div>
                </div>

                {/* Counts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
                  {[
                    { label: 'Customers', value: pendingRestoreData.metadata.counts.customers, icon: '👥' },
                    { label: 'Billing Records', value: pendingRestoreData.metadata.counts.billing_records, icon: '💰' },
                    { label: 'Packages', value: pendingRestoreData.metadata.counts.packages, icon: '📦' },
                    { label: 'Users', value: pendingRestoreData.metadata.counts.users, icon: '🔐' },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: '#eff6ff', borderRadius: '8px',
                      padding: '8px 12px', border: '1px solid #bfdbfe',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <span>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e40af' }}>
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '9px', padding: '12px 14px',
                fontSize: '12px', color: '#991b1b', fontWeight: 500,
                lineHeight: 1.6,
              }}>
                ⚠️ This will overwrite existing records with the same ID. New records added after this backup will not be affected.
              </div>
            </div>

            {/* Modal footer */}
            <div className="bkp-confirm-btns" style={{
              padding: '16px 24px', borderTop: '1px solid #f3f4f6',
              display: 'flex', gap: '10px', background: '#fafafa',
            }}>
              <button
                onClick={confirmRestore}
                style={{
                  flex: 1, padding: '11px',
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                  color: '#fff', border: 'none', borderRadius: '9px',
                  fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 2px 8px rgba(220,38,38,0.25)',
                }}
              >
                Yes, Restore Data
              </button>
              <button
                onClick={() => { setShowRestoreConfirm(false); setPendingRestoreData(null); setPendingFileName('') }}
                style={{
                  flex: 1, padding: '11px',
                  background: '#fff', color: '#374151',
                  border: '1.5px solid #e5e7eb', borderRadius: '9px',
                  fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
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