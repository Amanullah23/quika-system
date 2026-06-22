'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding: '10px 20px',
        background: '#374151',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      🖨 Print
    </button>
  )
}