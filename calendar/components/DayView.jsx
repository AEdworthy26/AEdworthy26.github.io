'use client'
import { toISO, isToday, expandEvents, CATEGORIES, formatTime, formatFull } from '@/lib/utils'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const SLOT_H = 56

export default function DayView({ currentDate, events, onSlotClick, onEventClick }) {
  const iso      = toISO(currentDate)
  const today    = isToday(currentDate)
  const expanded = expandEvents(events, iso, iso)

  const now     = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()

  function topPct(time)  {
    if (!time) return 0
    const [h, m] = time.split(':').map(Number)
    return ((h * 60 + m) / 1440) * 100
  }
  function heightPct(s, e) {
    if (!s || !e) return (60 / 1440) * 100
    const [sh, sm] = s.split(':').map(Number)
    const [eh, em] = e.split(':').map(Number)
    return Math.max((30 / 1440) * 100, ((eh * 60 + em - sh * 60 - sm) / 1440) * 100)
  }

  return (
    <div className="flex-1 overflow-auto bg-white border border-hub-border rounded-lg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-hub-border px-6 py-3 flex items-center gap-4">
        <div>
          <div className="font-display font-bold text-lg">{formatFull(iso)}</div>
          {today && <div className="text-xs text-hub-blue font-bold uppercase tracking-wider">Today</div>}
        </div>
        <div className="ml-auto text-sm text-muted">
          {expanded.length} {expanded.length === 1 ? 'event' : 'events'}
        </div>
      </div>

      {/* All-day / untimed events */}
      {expanded.filter(ev => !ev.startTime).length > 0 && (
        <div className="px-4 py-2 border-b border-hub-subtle bg-paper/50">
          <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1.5">All Day</div>
          <div className="space-y-1">
            {expanded.filter(ev => !ev.startTime).map(ev => {
              const cat = CATEGORIES[ev.category] || CATEGORIES.other
              return (
                <div
                  key={ev.id}
                  onClick={() => onEventClick(ev)}
                  className="rounded px-3 py-1.5 cursor-pointer text-sm font-semibold hover:opacity-90"
                  style={{ backgroundColor: cat.bg, color: cat.text }}
                >
                  {ev.title}
                  {ev.venue && <span className="ml-2 opacity-75 font-normal text-xs">📍 {ev.venue}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Timed grid */}
      <div
        className="relative"
        style={{ display: 'grid', gridTemplateColumns: '64px 1fr' }}
      >
        {/* Time labels */}
        <div>
          {HOURS.map(h => (
            <div key={h} className="border-b border-hub-subtle text-right pr-3" style={{ height: SLOT_H }}>
              <span className="text-xs text-faint font-bold inline-block pt-1">
                {h === 0 ? '' : `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`}
              </span>
            </div>
          ))}
        </div>

        {/* Event area */}
        <div
          className="relative cursor-pointer"
          style={{ height: HOURS.length * SLOT_H }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const mins = Math.floor(((e.clientY - rect.top) / rect.height * 1440) / 30) * 30
            const h    = String(Math.floor(mins / 60)).padStart(2, '0')
            const m    = String(mins % 60).padStart(2, '0')
            onSlotClick(iso, `${h}:${m}`)
          }}
        >
          {HOURS.map(h => (
            <div key={h} className="absolute left-0 right-0 border-b border-hub-subtle"
              style={{ top: h * SLOT_H }} />
          ))}

          {/* Current time */}
          {today && (
            <div className="absolute left-0 right-0 z-10 pointer-events-none"
              style={{ top: `${(nowMins / 1440) * 100}%` }}>
              <div className="h-0.5 bg-red-500" />
              <div className="absolute -top-1.5 -left-1 w-3 h-3 rounded-full bg-red-500" />
            </div>
          )}

          {/* Events */}
          {expanded.filter(ev => ev.startTime).map(ev => {
            const cat = CATEGORIES[ev.category] || CATEGORIES.other
            return (
              <div
                key={ev.id}
                onClick={e => { e.stopPropagation(); onEventClick(ev) }}
                className="absolute left-1 right-2 rounded-lg px-3 py-2 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden shadow-sm"
                style={{
                  top:    `${topPct(ev.startTime)}%`,
                  height: `${heightPct(ev.startTime, ev.endTime)}%`,
                  backgroundColor: ev.completed ? cat.light : cat.bg,
                  color: ev.completed ? cat.bg : cat.text,
                  border: ev.completed ? `1px solid ${cat.bg}` : 'none',
                  zIndex: 5,
                }}
              >
                <div className="font-bold text-sm leading-tight">
                  {ev.completed && <span className="mr-1">✓</span>}
                  {ev.title}
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  {formatTime(ev.startTime)}{ev.endTime && ` – ${formatTime(ev.endTime)}`}
                </div>
                {ev.venue && <div className="text-xs opacity-70 truncate mt-0.5">📍 {ev.venue}</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
