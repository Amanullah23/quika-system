'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding: '9px 18px',
        background: '#fff',
        color: '#374151',
        border: '1.5px solid #e5e7eb',
        borderRadius: '9px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        fontFamily: 'inherit',
      }}
    >
      🖨 Print
    </button>
  )
}