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

      // Main sheet
      const ws = XLSX.utils.json_to_sheet(rows)

      // Column widths
      ws['!cols'] = [
        { wch: 12 }, // Date
        { wch: 28 }, // Customer Name
        { wch: 24 }, // Dari Name
        { wch: 8 },  // ID
        { wch: 14 }, // Zone
        { wch: 8 },  // Mbps
        { wch: 16 }, // Phone
        { wch: 10 }, // Bill No
        { wch: 14 }, // Amount AFN
        { wch: 18 }, // Running Total
        { wch: 7 },  // Rate
        { wch: 14 }, // USD
        { wch: 10 }, // Status
        { wch: 28 }, // Comments
      ]

      XLSX.utils.book_append_sheet(wb, ws, 'Billing Records')

      // Summary sheet
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

      // File name with date range
      const fileName = `Quika_Billing_${date_from}_to_${date_to}.xlsx`
      XLSX.writeFile(wb, fileName)
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
        padding: '10px 20px',
        background: loading ? '#9ca3af' : '#166534',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {loading ? 'Exporting...' : '⬇ Export Excel'}
    </button>
  )
}