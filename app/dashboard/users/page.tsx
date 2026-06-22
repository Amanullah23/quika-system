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

const roleColors: Record<string, { bg: string; color: string }> = {
  admin:   { bg: '#fef3c7', color: '#92400e' },
  finance: { bg: '#dbeafe', color: '#1e40af' },
  viewer:  { bg: '#f3f4f6', color: '#374151' },
}

const inputStyle = {
  width: '100%',
  padding: '9px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  background: '#fff',
  color: '#111827',
}

const labelStyle = {
  display: 'block' as const,
  fontSize: '13px',
  fontWeight: 500 as const,
  color: '#374151',
  marginBottom: '6px',
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
    if (!addForm.email.trim()) return setFormError('Email is required')
    if (!addForm.password || addForm.password.length < 6) return setFormError('Password must be at least 6 characters')
    if (!addForm.full_name.trim()) return setFormError('Full name is required')

    setFormLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })

      const text = await res.text()
      console.log('Raw response:', text)

      let data: any = {}
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Server returned invalid response: ' + text)
      }

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`)
      }

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

  if (!isAdmin) return null

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '24px',
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Users</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
            Manage system users and their roles
          </p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setFormError('') }}
          style={{
            background: '#0c7177', color: '#fff',
            padding: '10px 20px', borderRadius: '8px',
            border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          + Add User
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '8px', padding: '12px 16px',
          color: '#dc2626', fontSize: '14px', marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {/* Role legend */}
      <div style={{
        display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap',
      }}>
        {[
          { role: 'admin', desc: 'Full control — all features' },
          { role: 'finance', desc: 'Add customers, billing, reports' },
          { role: 'viewer', desc: 'View only — no editing' },
        ].map(r => (
          <div key={r.role} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#ffffff', borderRadius: '8px',
            padding: '8px 14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            fontSize: '13px',
          }}>
            <span style={{
              background: roleColors[r.role].bg,
              color: roleColors[r.role].color,
              padding: '2px 8px', borderRadius: '10px',
              fontSize: '11px', fontWeight: 700, textTransform: 'capitalize',
            }}>
              {r.role}
            </span>
            <span style={{ color: '#6b7280' }}>{r.desc}</span>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div style={{
        background: '#ffffff', borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            Loading users...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['User', 'Email', 'Role', 'Last Sign In', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: 600, color: '#6b7280',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const rc = roleColors[user.role]
                const isMe = user.id === profile?.id
                return (
                  <tr key={user.id} style={{
                    borderBottom: '1px solid #f3f4f6',
                    background: isMe ? '#f0fafa' : i % 2 === 0 ? '#fff' : '#fafafa',
                  }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', background: '#0c7177',
                          borderRadius: '50%', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: '#fff',
                          fontSize: '14px', fontWeight: 700, flexShrink: 0,
                        }}>
                          {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                            {user.full_name || '—'}
                            {isMe && (
                              <span style={{
                                marginLeft: '6px', fontSize: '10px',
                                background: '#0c7177', color: '#fff',
                                padding: '1px 6px', borderRadius: '4px', fontWeight: 600,
                              }}>
                                YOU
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: rc.bg, color: rc.color,
                        padding: '3px 10px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: 600, textTransform: 'capitalize',
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                      {user.last_sign_in
                        ? new Date(user.last_sign_in).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                        : 'Never'
                      }
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEdit(user)}
                          style={{
                            padding: '5px 12px', background: '#f0fafa',
                            color: '#0c7177', border: 'none', borderRadius: '6px',
                            fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        {!isMe && (
                          deleteConfirm === user.id ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => handleDelete(user.id)}
                                style={{
                                  padding: '5px 10px', background: '#dc2626',
                                  color: '#fff', border: 'none', borderRadius: '6px',
                                  fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                style={{
                                  padding: '5px 10px', background: '#f3f4f6',
                                  color: '#374151', border: 'none', borderRadius: '6px',
                                  fontSize: '11px', cursor: 'pointer',
                                }}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(user.id)}
                              style={{
                                padding: '5px 12px', background: '#fef2f2',
                                color: '#dc2626', border: 'none', borderRadius: '6px',
                                fontSize: '12px', cursor: 'pointer',
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

      {/* Add User Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '460px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '24px',
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827' }}>
                Add New User
              </h3>
              <button onClick={() => setShowAddForm(false)} style={{
                background: '#f3f4f6', border: 'none', borderRadius: '8px',
                width: '32px', height: '32px', fontSize: '16px',
                cursor: 'pointer', color: '#6b7280',
              }}>✕</button>
            </div>

            {formError && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '8px', padding: '10px 14px',
                color: '#dc2626', fontSize: '13px', marginBottom: '20px',
              }}>
                {formError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  style={inputStyle}
                  value={addForm.full_name}
                  onChange={e => setAddForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="e.g. Ahmad Karimi"
                />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  style={inputStyle}
                  value={addForm.email}
                  onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="user@quika.af"
                />
              </div>
              <div>
                <label style={labelStyle}>Password * (min 6 characters)</label>
                <input
                  type="password"
                  style={inputStyle}
                  value={addForm.password}
                  onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label style={labelStyle}>Role *</label>
                <select
                  style={inputStyle}
                  value={addForm.role}
                  onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
                >
                  <option value="viewer">Viewer — view only</option>
                  <option value="finance">Finance — add customers and billing</option>
                  <option value="admin">Admin — full control</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={handleAdd}
                disabled={formLoading}
                style={{
                  flex: 1, padding: '11px',
                  background: formLoading ? '#9ca3af' : '#0c7177',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  fontSize: '14px', fontWeight: 600,
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {formLoading ? 'Creating...' : 'Create User'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: '11px 20px', background: '#f3f4f6',
                  color: '#374151', border: 'none', borderRadius: '8px',
                  fontSize: '14px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '460px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '24px',
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827' }}>
                Edit User
              </h3>
              <button onClick={() => setEditingUser(null)} style={{
                background: '#f3f4f6', border: 'none', borderRadius: '8px',
                width: '32px', height: '32px', fontSize: '16px',
                cursor: 'pointer', color: '#6b7280',
              }}>✕</button>
            </div>

            {/* User info */}
            <div style={{
              background: '#f9fafb', borderRadius: '8px',
              padding: '12px 16px', marginBottom: '20px',
              fontSize: '13px', color: '#6b7280',
            }}>
              {editingUser.email}
            </div>

            {formError && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '8px', padding: '10px 14px',
                color: '#dc2626', fontSize: '13px', marginBottom: '20px',
              }}>
                {formError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  style={inputStyle}
                  value={editForm.full_name}
                  onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select
                  style={inputStyle}
                  value={editForm.role}
                  onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                >
                  <option value="viewer">Viewer — view only</option>
                  <option value="finance">Finance — add customers and billing</option>
                  <option value="admin">Admin — full control</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>New Password (leave empty to keep current)</label>
                <input
                  type="password"
                  style={inputStyle}
                  value={editForm.password}
                  onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={handleEdit}
                disabled={formLoading}
                style={{
                  flex: 1, padding: '11px',
                  background: formLoading ? '#9ca3af' : '#0c7177',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  fontSize: '14px', fontWeight: 600,
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {formLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditingUser(null)}
                style={{
                  padding: '11px 20px', background: '#f3f4f6',
                  color: '#374151', border: 'none', borderRadius: '8px',
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