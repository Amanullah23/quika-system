'use client'

import { useState, useEffect } from 'react'
import { useRole } from '../../../lib/roleContext'
import { useRouter } from 'next/navigation'

type UserRecord = {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'finance' | 'viewer'
  created_at: string
  last_sign_in: string | null
}

const roleConfig: Record<string, { bg: string; color: string; border: string; icon: string; desc: string }> = {
  admin:   { bg: '#fef3c7', color: '#92400e', border: '#fde68a', icon: '👑', desc: 'Full control — all features' },
  finance: { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe', icon: '💼', desc: 'Billing and customers' },
  viewer:  { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb', icon: '👁️', desc: 'View only access' },
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '9px',
  fontSize: '13px',
  outline: 'none',
  background: '#f9fafb',
  color: '#111827',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 700,
  color: '#6b7280',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

function focusInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = '#1e40af'
  e.target.style.boxShadow = '0 0 0 3px rgba(30,64,175,0.08)'
  e.target.style.background = '#fff'
}

function blurInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = '#e5e7eb'
  e.target.style.boxShadow = 'none'
  e.target.style.background = '#f9fafb'
}

export default function UsersPage() {
  const { isAdmin, profile } = useRole()
  const router = useRouter()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const [addForm, setAddForm] = useState({
    email: '', password: '', full_name: '', role: 'viewer',
  })
  const [editForm, setEditForm] = useState({
    full_name: '', role: 'viewer', password: '',
  })

  async function loadUsers() {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setUsers(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) { router.push('/dashboard'); return }
    loadUsers()
  }, [isAdmin])

  async function handleAdd() {
    setFormError('')
    if (!addForm.full_name.trim()) return setFormError('Full name is required')
    if (!addForm.email.trim()) return setFormError('Email is required')
    if (!addForm.password || addForm.password.length < 6) return setFormError('Password must be at least 6 characters')

    setFormLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch { throw new Error('Server returned invalid response') }
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)
      setShowAddForm(false)
      setAddForm({ email: '', password: '', full_name: '', role: 'viewer' })
      loadUsers()
    } catch (e: any) {
      setFormError(e.message || 'Unknown error')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleEdit() {
    if (!editingUser) return
    setFormError('')
    if (!editForm.full_name.trim()) return setFormError('Full name is required')

    setFormLoading(true)
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEditingUser(null)
      loadUsers()
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeleteConfirm(null)
      loadUsers()
    } catch (e: any) {
      setError(e.message)
    }
  }

  function openEdit(user: UserRecord) {
    setEditingUser(user)
    setEditForm({ full_name: user.full_name, role: user.role, password: '' })
    setFormError('')
  }

  const adminCount = users.filter(u => u.role === 'admin').length
  const financeCount = users.filter(u => u.role === 'finance').length
  const viewerCount = users.filter(u => u.role === 'viewer').length

  if (!isAdmin) return null

  return (
    <div style={{ maxWidth: '1000px' }}>
      <style>{`
        .usr-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .usr-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .usr-table-wrap { display: block; }
        .usr-cards-wrap { display: none; }
        @media (max-width: 900px) {
          .usr-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 767px) {
          .usr-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .usr-header button { width: 100% !important; }
          .usr-stat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .usr-table-wrap { display: none !important; }
          .usr-cards-wrap { display: block !important; }
        }
      `}</style>

      {/* Header */}
      <div className="usr-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
            Users
          </h2>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', fontWeight: 500 }}>
            Manage system users and their roles
          </p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setFormError('') }}
          style={{
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            color: '#fff', padding: '10px 20px',
            borderRadius: '10px', border: 'none',
            fontSize: '13px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 2px 8px rgba(30,64,175,0.25)',
          }}
        >
          + Add User
        </button>
      </div>

      {/* Stat cards */}
      <div className="usr-stat-grid" style={{ marginBottom: '20px' }}>
        {[
          { label: 'Total Users', value: users.length, icon: '👥', iconBg: '#e0f2fe', border: '#0ea5e9' },
          { label: 'Admins', value: adminCount, icon: '👑', iconBg: '#fef3c7', border: '#f59e0b' },
          { label: 'Finance', value: financeCount, icon: '💼', iconBg: '#dbeafe', border: '#3b82f6' },
          { label: 'Viewers', value: viewerCount, icon: '👁️', iconBg: '#f3f4f6', border: '#9ca3af' },
        ].map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: '12px',
            padding: '14px 16px',
            border: '1px solid #f3f4f6',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: '10px',
            borderLeft: `3px solid ${card.border}`,
          }}>
            <div style={{
              width: '36px', height: '36px',
              background: card.iconBg, borderRadius: '9px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '16px', flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role legend */}
      <div style={{
        display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap',
      }}>
        {Object.entries(roleConfig).map(([role, config]) => (
          <div key={role} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#fff', borderRadius: '9px',
            padding: '8px 14px',
            border: '1px solid #f3f4f6',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <span style={{
              background: config.bg, color: config.color,
              padding: '2px 8px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700,
              border: `1px solid ${config.border}`,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              {config.icon} {role}
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{config.desc}</span>
          </div>
        ))}
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

      {/* Desktop Table */}
      <div className="usr-table-wrap" style={{
        background: '#fff', borderRadius: '14px',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
            Loading users...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                {['User', 'Email', 'Role', 'Last Sign In', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '11px 16px', textAlign: 'left',
                    fontSize: '10px', fontWeight: 700, color: '#9ca3af',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const rc = roleConfig[user.role] || roleConfig.viewer
                const isMe = user.id === profile?.id
                return (
                  <tr key={user.id} style={{
                    borderBottom: '1px solid #f9fafb',
                    background: isMe ? '#f0f9ff' : i % 2 === 0 ? '#fff' : '#fafafa',
                  }}>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px',
                          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                          borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '14px', fontWeight: 700, flexShrink: 0,
                        }}>
                          {user.full_name?.charAt(0)?.toUpperCase() ||
                           user.email?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {user.full_name || '—'}
                            {isMe && (
                              <span style={{
                                fontSize: '9px', background: '#1e40af',
                                color: '#fff', padding: '1px 5px',
                                borderRadius: '4px', fontWeight: 700,
                              }}>YOU</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{
                        background: rc.bg, color: rc.color,
                        padding: '4px 10px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: 700,
                        border: `1px solid ${rc.border}`,
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        textTransform: 'capitalize',
                      }}>
                        {rc.icon} {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                      {user.last_sign_in
                        ? new Date(user.last_sign_in).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                        : <span style={{ color: '#d1d5db' }}>Never</span>
                      }
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => openEdit(user)}
                          style={{
                            padding: '5px 12px',
                            background: '#eff6ff', color: '#1e40af',
                            border: '1px solid #bfdbfe', borderRadius: '7px',
                            fontSize: '11px', fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          Edit
                        </button>
                        {!isMe && (
                          deleteConfirm === user.id ? (
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button
                                onClick={() => handleDelete(user.id)}
                                style={{
                                  padding: '5px 10px', background: '#ef4444',
                                  color: '#fff', border: 'none', borderRadius: '7px',
                                  fontSize: '11px', fontWeight: 700,
                                  cursor: 'pointer', fontFamily: 'inherit',
                                }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                style={{
                                  padding: '5px 10px', background: '#f3f4f6',
                                  color: '#374151', border: 'none', borderRadius: '7px',
                                  fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit',
                                }}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(user.id)}
                              style={{
                                padding: '5px 12px', background: '#fee2e2',
                                color: '#dc2626', border: '1px solid #fecaca',
                                borderRadius: '7px', fontSize: '11px',
                                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                              }}
                            >
                              Delete
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="usr-cards-wrap">
        {loading ? (
          <div style={{
            background: '#fff', borderRadius: '14px',
            padding: '48px', textAlign: 'center',
            color: '#9ca3af', fontSize: '13px',
            border: '1px solid #f3f4f6',
          }}>
            Loading users...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {users.map(user => {
              const rc = roleConfig[user.role] || roleConfig.viewer
              const isMe = user.id === profile?.id
              return (
                <div key={user.id} style={{
                  background: isMe ? '#f0f9ff' : '#fff',
                  borderRadius: '12px', padding: '16px',
                  border: isMe ? '1px solid #bfdbfe' : '1px solid #f3f4f6',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}>
                  {/* User header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px', height: '40px',
                        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '15px', fontWeight: 700, flexShrink: 0,
                      }}>
                        {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {user.full_name || '—'}
                          {isMe && (
                            <span style={{
                              fontSize: '9px', background: '#1e40af',
                              color: '#fff', padding: '1px 5px',
                              borderRadius: '4px', fontWeight: 700,
                            }}>YOU</span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      background: rc.bg, color: rc.color,
                      padding: '3px 9px', borderRadius: '20px',
                      fontSize: '10px', fontWeight: 700,
                      border: `1px solid ${rc.border}`,
                      display: 'flex', alignItems: 'center', gap: '3px',
                    }}>
                      {rc.icon} {user.role}
                    </span>
                  </div>

                  {/* Last sign in */}
                  <div style={{
                    background: '#f9fafb', borderRadius: '7px',
                    padding: '8px 10px', marginBottom: '12px',
                    fontSize: '11px', color: '#6b7280',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    🕐 Last sign in:{' '}
                    <span style={{ fontWeight: 600, color: '#374151' }}>
                      {user.last_sign_in
                        ? new Date(user.last_sign_in).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })
                        : 'Never'
                      }
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEdit(user)}
                      style={{
                        flex: 1, padding: '8px',
                        background: '#eff6ff', color: '#1e40af',
                        border: '1px solid #bfdbfe', borderRadius: '8px',
                        fontSize: '12px', fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      ✏️ Edit
                    </button>
                    {!isMe && (
                      deleteConfirm === user.id ? (
                        <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                          <button
                            onClick={() => handleDelete(user.id)}
                            style={{
                              flex: 1, padding: '8px', background: '#ef4444',
                              color: '#fff', border: 'none', borderRadius: '8px',
                              fontSize: '12px', fontWeight: 700,
                              cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              flex: 1, padding: '8px', background: '#f3f4f6',
                              color: '#374151', border: 'none', borderRadius: '8px',
                              fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          style={{
                            padding: '8px 14px', background: '#fee2e2',
                            color: '#dc2626', border: '1px solid #fecaca',
                            borderRadius: '8px', fontSize: '12px',
                            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          🗑
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Add User Modal ── */}
      {showAddForm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '20px',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            width: '100%', maxWidth: '460px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}>
            {/* Modal header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  👤
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Add New User</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', marginTop: '1px' }}>
                    Create a new system account
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none',
                  color: '#fff', width: '32px', height: '32px',
                  borderRadius: '8px', cursor: 'pointer',
                  fontSize: '16px', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '24px' }}>
              {formError && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: '9px', padding: '10px 14px',
                  color: '#dc2626', fontSize: '13px', marginBottom: '18px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  ⚠️ {formError}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    style={inputStyle}
                    value={addForm.full_name}
                    onChange={e => setAddForm(p => ({ ...p, full_name: e.target.value }))}
                    onFocus={focusInput} onBlur={blurInput}
                    placeholder="e.g. Ahmad Karimi"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email" style={inputStyle}
                    value={addForm.email}
                    onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                    onFocus={focusInput} onBlur={blurInput}
                    placeholder="user@quika.af"
                    autoCapitalize="none"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Password * (min 6 characters)</label>
                  <input
                    type="password" style={inputStyle}
                    value={addForm.password}
                    onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))}
                    onFocus={focusInput} onBlur={blurInput}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Role *</label>
                  <select
                    style={inputStyle}
                    value={addForm.role}
                    onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
                    onFocus={focusInput} onBlur={blurInput}
                  >
                    <option value="viewer">👁️ Viewer — view only</option>
                    <option value="finance">💼 Finance — billing and customers</option>
                    <option value="admin">👑 Admin — full control</option>
                  </select>
                </div>

                {/* Role preview */}
                {addForm.role && (
                  <div style={{
                    background: roleConfig[addForm.role]?.bg || '#f9fafb',
                    border: `1px solid ${roleConfig[addForm.role]?.border || '#e5e7eb'}`,
                    borderRadius: '9px', padding: '10px 14px',
                    fontSize: '12px',
                    color: roleConfig[addForm.role]?.color || '#374151',
                    fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <span style={{ fontSize: '16px' }}>{roleConfig[addForm.role]?.icon}</span>
                    {roleConfig[addForm.role]?.desc}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid #f3f4f6',
              display: 'flex', gap: '10px', background: '#fafafa',
            }}>
              <button
                onClick={handleAdd}
                disabled={formLoading}
                style={{
                  flex: 1, padding: '11px',
                  background: formLoading ? '#9ca3af' : 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  color: '#fff', border: 'none', borderRadius: '9px',
                  fontSize: '13px', fontWeight: 700,
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: formLoading ? 'none' : '0 2px 8px rgba(30,64,175,0.25)',
                }}
              >
                {formLoading ? 'Creating...' : 'Create User'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: '11px 20px', background: '#fff',
                  color: '#374151', border: '1.5px solid #e5e7eb',
                  borderRadius: '9px', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editingUser && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '20px',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            width: '100%', maxWidth: '460px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}>
            {/* Modal header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  ✏️
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Edit User</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', marginTop: '1px' }}>
                    {editingUser.email}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none',
                  color: '#fff', width: '32px', height: '32px',
                  borderRadius: '8px', cursor: 'pointer',
                  fontSize: '16px', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '24px' }}>
              {formError && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: '9px', padding: '10px 14px',
                  color: '#dc2626', fontSize: '13px', marginBottom: '18px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  ⚠️ {formError}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    style={inputStyle}
                    value={editForm.full_name}
                    onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                    onFocus={focusInput} onBlur={blurInput}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Role</label>
                  <select
                    style={inputStyle}
                    value={editForm.role}
                    onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                    onFocus={focusInput} onBlur={blurInput}
                  >
                    <option value="viewer">👁️ Viewer — view only</option>
                    <option value="finance">💼 Finance — billing and customers</option>
                    <option value="admin">👑 Admin — full control</option>
                  </select>
                </div>

                {/* Role preview */}
                {editForm.role && (
                  <div style={{
                    background: roleConfig[editForm.role]?.bg || '#f9fafb',
                    border: `1px solid ${roleConfig[editForm.role]?.border || '#e5e7eb'}`,
                    borderRadius: '9px', padding: '10px 14px',
                    fontSize: '12px',
                    color: roleConfig[editForm.role]?.color || '#374151',
                    fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <span style={{ fontSize: '16px' }}>{roleConfig[editForm.role]?.icon}</span>
                    {roleConfig[editForm.role]?.desc}
                  </div>
                )}

                <div>
                  <label style={labelStyle}>New Password (leave empty to keep current)</label>
                  <input
                    type="password" style={inputStyle}
                    value={editForm.password}
                    onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))}
                    onFocus={focusInput} onBlur={blurInput}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid #f3f4f6',
              display: 'flex', gap: '10px', background: '#fafafa',
            }}>
              <button
                onClick={handleEdit}
                disabled={formLoading}
                style={{
                  flex: 1, padding: '11px',
                  background: formLoading ? '#9ca3af' : 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  color: '#fff', border: 'none', borderRadius: '9px',
                  fontSize: '13px', fontWeight: 700,
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: formLoading ? 'none' : '0 2px 8px rgba(30,64,175,0.25)',
                }}
              >
                {formLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditingUser(null)}
                style={{
                  padding: '11px 20px', background: '#fff',
                  color: '#374151', border: '1.5px solid #e5e7eb',
                  borderRadius: '9px', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
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