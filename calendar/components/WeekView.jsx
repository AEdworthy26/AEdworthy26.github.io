'use client'
import { getWeekDays, toISO, isToday, expandEvents, CATEGORIES, formatTime } from '@/lib/utils'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const SLOT_H = 48 // px per hour

export default function WeekView({ currentDate, events, onSlotClick, onEventClick }) {
  const days    = getWeekDays(currentDate)
  const start   = toISO(days[0])
  const end     = toISO(days[6])
  const expanded = expandEvents(events, start, end)

  const byDate = expanded.reduce((acc, ev) => {
    acc[ev.date] = acc[ev.date] || []
    acc[ev.date].push(ev)
    return acc
  }, {})

  // Current time position
  const now     = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const nowPct  = (nowMins / 1440) * 100

  function topPct(time) {
    if (!time) return 0
    const [h, m] = time.split(':').map(Number)
    return ((h * 60 + m) / 1440) * 100
  }
  function heightPct(start, end) {
    if (!start || !end) return (60 / 1440) * 100
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const dur = (eh * 60 + em) - (sh * 60 + sm)
    return Math.max((30 / 1440) * 100, (dur / 1440) * 100)
  }

  return (
    <div className="flex-1 overflow-auto bg-white border border-hub-border rounded-lg">
      {/* Header row */}
      <div className="sticky top-0 z-10 grid bg-white border-b border-hub-border"
        style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
        <div className="border-r border-hub-border" />
        {days.map((d, i) => {
          const today = isToday(d)
          return (
            <div
              key={i}
              className={`text-center py-2.5 border-r border-hub-border ${today ? 'bg-blue-50' : ''}`}
            >
              <div className="text-xs uppercase tracking-wider text-faint font-bold">
                {d.toLocaleDateString('en-GB', { weekday: 'short' })}
              </div>
              <div className={`
                text-sm font-bold mt-0.5 mx-auto w-7 h-7 flex items-center justify-center rounded-full
                ${today ? 'bg-hub-blue text-white' : 'text-ink'}
              `}>
                {d.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div className="relative grid" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
        {/* Time labels */}
        <div className="border-r border-hub-border">
          {HOURS.map(h => (
            <div key={h} className="border-b border-hub-subtle" style={{ height: SLOT_H }}>
              <span className="text-xs text-faint font-bold sticky top-0 block pt-1 pl-2 leading-none">
                {h === 0 ? '' : `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((d, di) => {
          const iso    = toISO(d)
          const dayEvs = byDate[iso] || []
          const today  = isToday(d)

          return (
            <div
              key={di}
              className={`relative border-r border-hub-border ${today ? 'bg-blue-50/30' : ''}`}
              style={{ height: HOURS.length * SLOT_H }}
              onClick={e => {
                const rect  = e.currentTarget.getBoundingClientRect()
                const relY  = e.clientY - rect.top
                const mins  = Math.floor((relY / rect.height) * 1440 / 30) * 30
                const h     = String(Math.floor(mins / 60)).padStart(2, '0')
                const m     = String(mins % 60).padStart(2, '0')
                onSlotClick(iso, `${h}:${m}`)
              }}
            >
              {/* Hour lines */}
              {HOURS.map(h => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-b border-hub-subtle"
                  style={{ top: h * SLOT_H }}
                />
              ))}

              {/* Current time */}
              {today && (
                <div
                  className="absolute left-0 right-0 z-10 pointer-events-none"
                  style={{ top: `${nowPct}%` }}
                >
                  <div className="h-0.5 bg-red-500 w-full" />
                  <div className="absolute -top-1.5 -left-1 w-3 h-3 rounded-full bg-red-500" />
                </div>
              )}

              {/* Events */}
              {dayEvs.map(ev => {
                const cat   = CATEGORIES[ev.category] || CATEGORIES.other
                const top   = topPct(ev.startTime)
                const ht    = heightPct(ev.startTime, ev.endTime)
                return (
                  <div
                    key={ev.id + ev.date}
                    onClick={e => { e.stopPropagation(); onEventClick(ev) }}
                    className="absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
                    style={{
                      top: `${top}%`,
                      height: `${ht}%`,
                      backgroundColor: ev.completed ? cat.light : cat.bg,
                      color: ev.completed ? cat.bg : cat.text,
                      border: ev.completed ? `1px solid ${cat.bg}` : 'none',
                      zIndex: 5,
                    }}
                    title={`${ev.title}${ev.venue ? ' · ' + ev.venue : ''}`}
                  >
                    <div className="text-xs font-bold truncate leading-tight">{ev.title}</div>
                    {ev.startTime && (
                      <div className="text-xs opacity-80 truncate">{formatTime(ev.startTime)}</div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
