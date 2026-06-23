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

  useEffect(() => { loadPackages() }, [])

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

  const active = packages.filter(p => p.is_active).length
  const inactive = packages.filter(p => !p.is_active).length

  const packageColors = [
    { bg: '#eff6ff', border: '#bfdbfe', icon: '#1e40af', badge: '#dbeafe' },
    { bg: '#f0fdf4', border: '#bbf7d0', icon: '#059669', badge: '#d1fae5' },
    { bg: '#faf5ff', border: '#e9d5ff', icon: '#7c3aed', badge: '#ede9fe' },
    { bg: '#fff7ed', border: '#fed7aa', icon: '#d97706', badge: '#fef3c7' },
    { bg: '#fdf2f8', border: '#f9a8d4', icon: '#db2777', badge: '#fce7f3' },
  ]

  return (
    <div style={{ maxWidth: '1200px' }}>
      <style>{`
        .pkg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .pkg-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .pkg-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        @media (max-width: 767px) {
          .pkg-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .pkg-stat-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 10px !important; }
          .pkg-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .pkg-header button { width: 100% !important; }
        }
      `}</style>

      {/* Header */}
      <div className="pkg-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
            Packages
          </h2>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', fontWeight: 500 }}>
            Internet packages offered to customers
          </p>
        </div>
        <button
          onClick={openAdd}
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
          + Add Package
        </button>
      </div>

      {/* Stat cards */}
      <div className="pkg-stat-grid" style={{ marginBottom: '20px' }}>
        {[
          { label: 'Total Packages', value: packages.length, icon: '📦', iconBg: '#e0f2fe', border: '#0ea5e9' },
          { label: 'Active', value: active, icon: '✅', iconBg: '#d1fae5', border: '#10b981' },
          { label: 'Inactive', value: inactive, icon: '⏸️', iconBg: '#f3f4f6', border: '#9ca3af' },
        ].map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: '12px',
            padding: '16px 18px',
            border: '1px solid #f3f4f6',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: '12px',
            borderLeft: `3px solid ${card.border}`,
          }}>
            <div style={{
              width: '40px', height: '40px',
              background: card.iconBg, borderRadius: '10px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '18px', flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
                {card.value}
              </div>
            </div>
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

      {/* Loading */}
      {loading ? (
        <div style={{
          background: '#fff', borderRadius: '14px',
          padding: '60px', textAlign: 'center',
          color: '#9ca3af', fontSize: '13px',
          border: '1px solid #f3f4f6',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>📦</div>
          Loading packages...
        </div>
      ) : packages.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: '14px',
          padding: '60px', textAlign: 'center',
          border: '1px solid #f3f4f6',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>📦</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
            No packages yet
          </div>
          <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
            Add your first internet package to get started
          </div>
          <button
            onClick={openAdd}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              color: '#fff', border: 'none', borderRadius: '9px',
              fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            + Add First Package
          </button>
        </div>
      ) : (
        <div className="pkg-grid">
          {packages.map((pkg, i) => {
            const colors = packageColors[i % packageColors.length]
            return (
              <div key={pkg.id} style={{
                background: '#fff',
                borderRadius: '14px',
                border: `1px solid ${pkg.is_active ? colors.border : '#e5e7eb'}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                opacity: pkg.is_active ? 1 : 0.6,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}>
                {/* Card top accent */}
                <div style={{
                  height: '4px',
                  background: pkg.is_active
                    ? `linear-gradient(90deg, ${colors.icon}, ${colors.icon}88)`
                    : '#e5e7eb',
                }} />

                <div style={{ padding: '20px' }}>
                  {/* Header row */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'space-between', marginBottom: '16px',
                  }}>
                    {/* Speed badge */}
                    <div style={{
                      background: pkg.is_active ? colors.bg : '#f9fafb',
                      border: `1px solid ${pkg.is_active ? colors.border : '#e5e7eb'}`,
                      borderRadius: '10px',
                      padding: '8px 14px',
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                    }}>
                      <span style={{ fontSize: '16px' }}>📡</span>
                      <span style={{
                        fontSize: '20px', fontWeight: 800,
                        color: pkg.is_active ? colors.icon : '#9ca3af',
                        letterSpacing: '-0.5px',
                      }}>
                        {pkg.mbps}
                      </span>
                      <span style={{
                        fontSize: '10px', fontWeight: 600,
                        color: pkg.is_active ? colors.icon : '#9ca3af',
                        opacity: 0.7,
                      }}>
                        Mbps
                      </span>
                    </div>

                    {/* Status badge */}
                    <span style={{
                      background: pkg.is_active ? '#dcfce7' : '#f3f4f6',
                      color: pkg.is_active ? '#166534' : '#6b7280',
                      padding: '3px 9px', borderRadius: '20px',
                      fontSize: '10px', fontWeight: 700,
                      border: pkg.is_active ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
                    }}>
                      {pkg.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </div>

                  {/* Package name */}
                  <div style={{
                    fontSize: '15px', fontWeight: 700,
                    color: '#111827', marginBottom: '4px',
                  }}>
                    {pkg.name}
                  </div>

                  {/* Description */}
                  {pkg.description && (
                    <div style={{
                      fontSize: '12px', color: '#6b7280',
                      marginBottom: '14px', fontWeight: 400,
                      lineHeight: 1.5,
                    }}>
                      {pkg.description}
                    </div>
                  )}

                  {/* Price */}
                  <div style={{
                    background: pkg.is_active ? colors.bg : '#f9fafb',
                    borderRadius: '9px', padding: '12px 14px',
                    marginBottom: '16px',
                    border: `1px solid ${pkg.is_active ? colors.border : '#e5e7eb'}`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                        Monthly Price
                      </div>
                      <div style={{
                        fontSize: '20px', fontWeight: 800,
                        color: pkg.is_active ? colors.icon : '#9ca3af',
                        letterSpacing: '-0.5px',
                      }}>
                        AFN {Number(pkg.price_afn).toLocaleString()}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '12px', color: '#9ca3af', fontWeight: 500,
                    }}>
                      / month
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEdit(pkg)}
                      style={{
                        flex: 1, padding: '9px',
                        background: '#f9fafb', color: '#374151',
                        border: '1.5px solid #e5e7eb', borderRadius: '8px',
                        fontSize: '12px', fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      ✏️ Edit
                    </button>

                    {deleteConfirm === pkg.id ? (
                      <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          style={{
                            flex: 1, padding: '9px',
                            background: '#ef4444', color: '#fff',
                            border: 'none', borderRadius: '8px',
                            fontSize: '12px', fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={{
                            flex: 1, padding: '9px',
                            background: '#f3f4f6', color: '#374151',
                            border: 'none', borderRadius: '8px',
                            fontSize: '12px', cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(pkg.id)}
                        style={{
                          padding: '9px 14px',
                          background: '#fee2e2', color: '#dc2626',
                          border: '1px solid #fecaca', borderRadius: '8px',
                          fontSize: '12px', fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
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