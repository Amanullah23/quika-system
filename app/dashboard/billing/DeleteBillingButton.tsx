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
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            padding: '4px 10px',
            background: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          {loading ? '...' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          style={{
            padding: '4px 10px',
            background: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '5px',
            fontSize: '11px',
            cursor: 'pointer',
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
        background: '#fef2f2',
        color: '#dc2626',
        border: 'none',
        borderRadius: '5px',
        fontSize: '11px',
        cursor: 'pointer',
      }}
    >
      Delete
    </button>
  )
}