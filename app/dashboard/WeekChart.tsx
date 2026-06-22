'use client'

type DayData = {
  date: string
  total: number
  label: string
  shortLabel: string
}

export default function WeekChart({ data }: { data: DayData[] }) {
  const max = Math.max(...data.map(d => d.total), 1)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
            Last 7 Days
          </h3>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
            Daily collections in AFN
          </p>
        </div>
        <div style={{
          fontSize: '12px',
          color: '#0c7177',
          fontWeight: 600,
          background: '#f0fafa',
          padding: '4px 10px',
          borderRadius: '20px',
        }}>
          AFN {data.reduce((s, d) => s + d.total, 0).toLocaleString()} total
        </div>
      </div>

      {/* Bars */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        height: '160px',
        paddingBottom: '32px',
        position: 'relative',
      }}>
        {/* Gridlines */}
        {[0.25, 0.5, 0.75, 1].map(pct => (
          <div key={pct} style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: `calc(32px + ${pct * 128}px)`,
            borderTop: '1px dashed #f3f4f6',
            zIndex: 0,
          }} />
        ))}

        {data.map(day => {
          const heightPct = max > 0 ? (day.total / max) : 0
          const barHeight = Math.max(heightPct * 128, day.total > 0 ? 4 : 0)
          const isToday = day.date === today

          return (
            <div
              key={day.date}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%',
                position: 'relative',
                zIndex: 1,
              }}
              title={`${day.label}: AFN ${day.total.toLocaleString()}`}
            >
              {/* Amount label above bar */}
              {day.total > 0 && (
                <div style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: isToday ? '#0c7177' : '#6b7280',
                  marginBottom: '4px',
                  whiteSpace: 'nowrap',
                }}>
                  {day.total >= 1000
                    ? `${(day.total / 1000).toFixed(1)}k`
                    : day.total.toString()
                  }
                </div>
              )}

              {/* Bar */}
              <div style={{
                width: '100%',
                height: `${barHeight}px`,
                background: isToday ? '#0c7177' : '#b2d8da',
                borderRadius: '5px 5px 0 0',
                transition: 'height 0.3s ease',
                minHeight: day.total > 0 ? '4px' : '0px',
              }} />

              {/* Day label */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                fontSize: '11px',
                fontWeight: isToday ? 700 : 400,
                color: isToday ? '#0c7177' : '#9ca3af',
                textAlign: 'center',
                paddingTop: '6px',
              }}>
                {day.shortLabel}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}