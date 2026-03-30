'use client'
import { useState, useRef } from 'react'
import {
  getCalendarDays, toISO, isToday, expandEvents,
  CATEGORIES, getDailyScore, getMonthlyStats, formatTime,
} from '@/lib/utils'

const WEEK_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_CHIPS    = 3

export default function MonthView({ currentDate, events, onDayClick, onEventClick, onEventDrop }) {
  const [dragId,      setDragId]      = useState(null)
  const [dragOverDate, setDragOverDate] = useState(null)
  const [tooltip,     setTooltip]     = useState(null) // { event, x, y }
  const tooltipRef = useRef(null)

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const days  = getCalendarDays(year, month)

  // Get month range for expansion
  const start = toISO(days[0].date)
  const end   = toISO(days[days.length - 1].date)
  const expanded = expandEvents(events, start, end)

  // Group by date for quick lookup
  const byDate = expanded.reduce((acc, ev) => {
    acc[ev.date] = acc[ev.date] || []
    acc[ev.date].push(ev)
    return acc
  }, {})

  // Productivity scores for heat map
  const { scoreByDate, mostProductive } = getMonthlyStats(events, year, month)
  const maxScore = Object.values(scoreByDate).reduce((m, s) => Math.max(m, s), 1)

  // ── Drag handlers ──────────────────────────────────────────────────────────
  function handleDragStart(e, eventId) {
    setDragId(eventId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', eventId)
    // Slight delay so the element renders before becoming ghost
    setTimeout(() => e.target.classList.add('dragging'), 0)
  }

  function handleDragEnd(e) {
    e.target.classList.remove('dragging')
    setDragId(null)
    setDragOverDate(null)
  }

  function handleDayDragOver(e, dateISO) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDate(dateISO)
  }

  function handleDayDrop(e, dateISO) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') || dragId
    if (id) onEventDrop(id, dateISO)
    setDragId(null)
    setDragOverDate(null)
  }

  // ── Tooltip ────────────────────────────────────────────────────────────────
  function showTooltip(e, ev) {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ event: ev, x: rect.left, y: rect.bottom + 6 })
  }
  function hideTooltip() { setTooltip(null) }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Day headers */}
      <div className="cal-grid border-b border-hub-border bg-white">
        {WEEK_HEADERS.map(h => (
          <div key={h} className="text-center text-xs font-bold uppercase tracking-widest text-faint py-2.5">
            {h}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="cal-grid flex-1 border-l border-hub-border bg-white overflow-y-auto">
        {days.map(({ date, isCurrentMonth }, i) => {
          const iso      = toISO(date)
          const today    = isToday(date)
          const dayEvs   = byDate[iso] || []
          const score    = scoreByDate[iso] || 0
          const heatOpacity = score > 0 ? Math.max(0.06, (score / maxScore) * 0.22) : 0
          const isMostProd  = mostProductive?.date === iso && score > 0
          const overflow    = dayEvs.length > MAX_CHIPS ? dayEvs.length - MAX_CHIPS : 0
          const visible     = dayEvs.slice(0, MAX_CHIPS)
          const isDragOver  = dragOverDate === iso

          return (
            <div
              key={i}
              className={`
                cal-day-cell border-b border-r border-hub-border p-1.5 relative
                ${!isCurrentMonth ? 'opacity-40' : ''}
                ${isDragOver ? 'drag-over' : ''}
              `}
              style={score > 0 ? { backgroundColor: `rgba(21,128,61,${heatOpacity})` } : {}}
              onDragOver={e => handleDayDragOver(e, iso)}
              onDragLeave={() => setDragOverDate(null)}
              onDrop={e => handleDayDrop(e, iso)}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => onDayClick(iso)}
                  className={`
                    w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full transition-colors
                    ${today ? 'bg-hub-blue text-white' : 'text-ink hover:bg-hub-subtle'}
                  `}
                >
                  {date.getDate()}
                </button>
                {isMostProd && (
                  <span className="text-xs" title="Most productive day this month">🏆</span>
                )}
                {score > 0 && !isMostProd && (
                  <span className="text-xs font-bold text-green-700 leading-none">{score}</span>
                )}
              </div>

              {/* Event chips */}
              <div className="space-y-0.5">
                {visible.map(ev => {
                  const cat     = CATEGORIES[ev.category] || CATEGORIES.other
                  const isDone  = ev.completed
                  return (
                    <div
                      key={ev.id + ev.date}
                      draggable
                      onDragStart={e => handleDragStart(e, ev.id)}
                      onDragEnd={handleDragEnd}
                      onMouseEnter={e => showTooltip(e, ev)}
                      onMouseLeave={hideTooltip}
                      onClick={e => { e.stopPropagation(); hideTooltip(); onEventClick(ev) }}
                      className="event-chip rounded px-1.5 py-0.5 text-xs leading-tight"
                      style={{
                        backgroundColor: isDone ? cat.light : cat.bg,
                        color: isDone ? cat.bg : cat.text,
                        border: isDone ? `1px solid ${cat.bg}` : 'none',
                        textDecoration: isDone ? 'line-through' : 'none',
                        opacity: isDone ? 0.75 : 1,
                      }}
                    >
                      {ev.startTime && <span className="mr-1 opacity-80">{formatTime(ev.startTime)}</span>}
                      {ev.title}
                    </div>
                  )
                })}
                {overflow > 0 && (
                  <button
                    onClick={() => onDayClick(iso)}
                    className="text-xs text-hub-blue hover:underline pl-1.5 font-semibold"
                  >
                    +{overflow} more
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <EventTooltip event={tooltip.event} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  )
}

function EventTooltip({ event, x, y }) {
  const cat = CATEGORIES[event.category] || CATEGORIES.other
  return (
    <div
      className="fixed z-50 bg-white border border-hub-border rounded-lg shadow-lg p-3 max-w-xs pointer-events-none fade-in"
      style={{ left: Math.min(x, window.innerWidth - 240), top: y }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.bg }} />
        <span className="font-bold text-sm leading-tight">{event.title}</span>
        {event.completed && <span className="text-green-600 text-xs">✓</span>}
      </div>
      {(event.startTime || event.endTime) && (
        <div className="text-xs text-muted mb-1">
          🕐 {formatTime(event.startTime)}{event.endTime && ` – ${formatTime(event.endTime)}`}
        </div>
      )}
      {event.venue && (
        <div className="text-xs text-muted mb-1">📍 {event.venue}</div>
      )}
      {event.notes && (
        <div className="text-xs text-muted italic border-t border-hub-subtle pt-1 mt-1 line-clamp-2">
          {event.notes}
        </div>
      )}
      <div
        className="text-xs font-bold mt-1.5 px-1.5 py-0.5 rounded-full inline-block"
        style={{ backgroundColor: cat.light, color: cat.bg }}
      >
        {cat.label}
      </div>
    </div>
  )
}
