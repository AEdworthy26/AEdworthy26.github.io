'use client'
import { toISO, expandEvents, groupByDate, CATEGORIES, formatFull, formatTime, isToday, fromISO } from '@/lib/utils'

export default function AgendaView({ currentDate, events, onEventClick, onDayClick }) {
  // Show 60 days from current date
  const start = toISO(currentDate)
  const endD  = new Date(currentDate)
  endD.setDate(endD.getDate() + 60)
  const end = toISO(endD)

  const expanded = expandEvents(events, start, end)
  const byDate   = groupByDate(expanded)
  const dates    = Object.keys(byDate).sort()

  if (!dates.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-12">
        <div>
          <div className="text-5xl mb-4 opacity-20">📅</div>
          <div className="font-display font-bold text-xl mb-2">No upcoming events</div>
          <div className="text-muted text-sm">Events you add will appear here.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-2xl">
        {dates.map(date => {
          const today = isToday(fromISO(date))
          const dayEvs = byDate[date].sort((a, b) =>
            (a.startTime || '').localeCompare(b.startTime || ''))

          return (
            <div key={date} className="mb-6 slide-up">
              {/* Date heading */}
              <div
                className={`
                  flex items-center gap-3 mb-2 cursor-pointer group
                `}
                onClick={() => onDayClick(date)}
              >
                <div className={`
                  w-12 h-12 rounded-full flex flex-col items-center justify-center text-center flex-shrink-0
                  ${today ? 'bg-hub-blue text-white' : 'bg-white border border-hub-border text-ink'}
                `}>
                  <span className="text-xs font-bold uppercase leading-none">
                    {fromISO(date).toLocaleDateString('en-GB', { weekday: 'short' })}
                  </span>
                  <span className="font-display font-bold text-base leading-none mt-0.5">
                    {fromISO(date).getDate()}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-sm">
                    {fromISO(date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </div>
                  {today && (
                    <div className="text-xs text-hub-blue font-bold uppercase tracking-wider">Today</div>
                  )}
                </div>
              </div>

              {/* Events for this day */}
              <div className="ml-15 pl-4 border-l-2 border-hub-subtle space-y-2" style={{ marginLeft: '60px' }}>
                {dayEvs.map(ev => {
                  const cat = CATEGORIES[ev.category] || CATEGORIES.other
                  return (
                    <div
                      key={ev.id + ev.date}
                      onClick={() => onEventClick(ev)}
                      className="bg-white border border-hub-border rounded-lg px-4 py-3 cursor-pointer hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Color bar */}
                        <div
                          className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: cat.bg, minHeight: 16 }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-bold text-sm ${ev.completed ? 'line-through opacity-60' : ''}`}>
                              {ev.completed && <span className="text-green-600 mr-1">✓</span>}
                              {ev.title}
                            </span>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ backgroundColor: cat.light, color: cat.bg }}
                            >
                              {cat.label}
                            </span>
                            {ev._recur && (
                              <span className="text-xs text-faint">↻</span>
                            )}
                          </div>

                          {(ev.startTime || ev.venue) && (
                            <div className="text-xs text-muted mt-1 flex items-center gap-3">
                              {ev.startTime && (
                                <span>
                                  🕐 {formatTime(ev.startTime)}
                                  {ev.endTime && ` – ${formatTime(ev.endTime)}`}
                                </span>
                              )}
                              {ev.venue && <span>📍 {ev.venue}</span>}
                            </div>
                          )}

                          {ev.notes && (
                            <div className="text-xs text-faint italic mt-1 truncate">{ev.notes}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
