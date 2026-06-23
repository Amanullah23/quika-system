'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'

type Props = {
  date_from: string
  date_to: string
}

export default function ExportButton({ date_from, date_to }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/reports/export?date_from=${date_from}&date_to=${date_to}`
      )
      const { rows, error } = await res.json()
      if (error) throw new Error(error)

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(rows)
      ws['!cols'] = [
        { wch: 12 }, { wch: 28 }, { wch: 24 }, { wch: 8 },
        { wch: 14 }, { wch: 8 }, { wch: 16 }, { wch: 10 },
        { wch: 14 }, { wch: 18 }, { wch: 7 }, { wch: 14 },
        { wch: 10 }, { wch: 28 },
      ]
      XLSX.utils.book_append_sheet(wb, ws, 'Billing Records')

      const grouped: Record<string, number> = {}
      for (const row of rows) {
        const date = row['Date']
        grouped[date] = (grouped[date] || 0) + row['Amount (AFN)']
      }
      const summaryRows = Object.entries(grouped).map(([date, total]) => ({
        'Date': date,
        'Total (AFN)': total,
        'Records': rows.filter((r: any) => r['Date'] === date).length,
      }))
      const ws2 = XLSX.utils.json_to_sheet(summaryRows)
      ws2['!cols'] = [{ wch: 14 }, { wch: 16 }, { wch: 10 }]
      XLSX.utils.book_append_sheet(wb, ws2, 'Daily Summary')

      XLSX.writeFile(wb, `Quika_Billing_${date_from}_to_${date_to}.xlsx`)
    } catch (e: any) {
      alert('Export failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      style={{
        padding: '9px 18px',
        background: loading ? '#9ca3af' : 'linear-gradient(135deg, #059669, #10b981)',
        color: '#fff', border: 'none', borderRadius: '9px',
        fontSize: '13px', fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: '6px',
        boxShadow: loading ? 'none' : '0 2px 8px rgba(5,150,105,0.25)',
        fontFamily: 'inherit',
      }}
    >
      {loading ? '⏳ Exporting...' : '⬇ Export Excel'}
    </button>
  )
}