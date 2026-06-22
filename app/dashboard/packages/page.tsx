'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PackageForm from './PackageForm'
import type { Package } from '../../../lib/types'

export default function PackagesPage() {
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function loadPackages() {
    try {
      const res = await fetch('/api/packages/list')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPackages(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPackages()
  }, [])

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeleteConfirm(null)
      loadPackages()
    } catch (e: any) {
      setError(e.message)
    }
  }

  function openAdd() {
    setEditingPackage(undefined)
    setShowForm(true)
  }

  function openEdit(pkg: Package) {
    setEditingPackage(pkg)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingPackage(undefined)
    loadPackages()
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
            Packages
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
            Internet packages offered to customers
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            background: '#0c7177',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Add Package
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#dc2626',
          fontSize: '14px',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {/* Packages Grid */}
      {loading ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          Loading packages...
        </div>
      ) : packages.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          No packages yet. Add your first package.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px',
        }}>
          {packages.map(pkg => (
            <div key={pkg.id} style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              border: pkg.is_active ? '1px solid #e5e7eb' : '1px solid #f3f4f6',
              opacity: pkg.is_active ? 1 : 0.65,
              position: 'relative',
            }}>
              {/* Status badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: pkg.is_active ? '#dcfce7' : '#f3f4f6',
                color: pkg.is_active ? '#166534' : '#6b7280',
                padding: '2px 8px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                {pkg.is_active ? 'Active' : 'Inactive'}
              </div>

              {/* Speed badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f0fafa',
                color: '#0c7177',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '22px',
                fontWeight: 800,
                marginBottom: '12px',
                letterSpacing: '-0.5px',
              }}>
                {pkg.mbps}
              </div>

              <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                {pkg.name}
              </div>

              {pkg.description && (
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                  {pkg.description}
                </div>
              )}

              <div style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#0c7177',
                marginBottom: '16px',
              }}>
                AFN {Number(pkg.price_afn).toLocaleString()}
                <span style={{ fontSize: '12px', fontWeight: 400, color: '#9ca3af', marginLeft: '4px' }}>
                  / month
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => openEdit(pkg)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '7px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>

                {deleteConfirm === pkg.id ? (
                  <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '7px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '7px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(pkg.id)}
                    style={{
                      padding: '8px 14px',
                      background: '#fef2f2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '7px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <PackageForm
          package={editingPackage}
          mode={editingPackage ? 'edit' : 'create'}
          onClose={closeForm}
        />
      )}
    </div>
  )
}