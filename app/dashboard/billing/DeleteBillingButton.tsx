'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteBillingButton({ id }: { id: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await fetch(`/api/billing/${id}`, { method: 'DELETE' })
      router.refresh()
    } catch {
      setLoading(false)
    }
  }

  if (confirm) {
    return (
      <div style={{ display: 'flex', gap: '5px' }}>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            padding: '4px 10px',
            background: '#ef4444', color: '#fff',
            border: 'none', borderRadius: '6px',
            fontSize: '11px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {loading ? '...' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          style={{
            padding: '4px 10px',
            background: '#f3f4f6', color: '#374151',
            border: 'none', borderRadius: '6px',
            fontSize: '11px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      style={{
        padding: '4px 10px',
        background: '#fee2e2', color: '#dc2626',
        border: '1px solid #fecaca',
        borderRadius: '6px', fontSize: '11px',
        fontWeight: 700, cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      Delete
    </button>
  )
}