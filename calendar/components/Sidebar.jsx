'use client'
import {
  CATEGORIES,
  getCalendarDays, toISO, isToday, formatMonth,
  getCurrentStreak, getWeeklyScore, getMonthlyStats,
} from '@/lib/utils'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function Sidebar({
  currentDate,
  events,
  activeCategories,
  onToggleCategory,
  onNavigate,
  onTodayClick,
  onShowStats,
  searchQuery,
  onSearchChange,
}) {
  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const days  = getCalendarDays(year, month)

  const streak       = getCurrentStreak(events)
  const weeklyScore  = getWeeklyScore(events)
  const stats        = getMonthlyStats(events, year, month)

  function miniNavYear(delta) {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() + delta)
    onNavigate(d)
  }

  function goToDate(date) {
    onNavigate(new Date(date))
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col gap-4 font-serif">

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm select-none">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search events…"
          className="w-full bg-white border border-hub-border rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-hub-blue"
        />
      </div>

      {/* Mini calendar */}
      <div className="bg-white border border-hub-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => miniNavYear(-1)} className="text-faint hover:text-ink text-sm px-1 transition-colors">‹</button>
          <span className="text-xs font-bold uppercase tracking-wider text-ink">
            {formatMonth(year, month)}
          </span>
          <button onClick={() => miniNavYear(1)} className="text-faint hover:text-ink text-sm px-1 transition-colors">›</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((l, i) => (
            <div key={i} className="text-center text-xs text-faint font-bold py-0.5">{l}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {days.map(({ date, isCurrentMonth }, i) => {
            const iso      = toISO(date)
            const isNow    = isToday(date)
            const hasEvent = events.some(e => e.date === iso)
            return (
              <button
                key={i}
                onClick={() => goToDate(date)}
                className={`
                  relative text-center text-xs py-1 rounded transition-colors
                  ${isCurrentMonth ? 'text-ink' : 'text-faint opacity-40'}
                  ${isNow ? 'bg-hub-blue text-white font-bold' : 'hover:bg-hub-subtle'}
                `}
              >
                {date.getDate()}
                {hasEvent && !isNow && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-hub-blue opacity-50" />
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={onTodayClick}
          className="mt-3 w-full text-xs font-bold uppercase tracking-wider text-hub-blue hover:underline transition-colors"
        >
          Today
        </button>
      </div>

      {/* Gamification stats */}
      <div className="bg-white border border-hub-border rounded-lg p-4 space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-hub-blue mb-1">This Week</div>

        {/* Streak */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Current streak</span>
          <span className="font-display font-bold text-base">
            {streak}
            {streak >= 2 && <span className="ml-1 text-base">🔥</span>}
          </span>
        </div>

        {/* Weekly score */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Weekly score</span>
          <span className="font-display font-bold text-base text-green-700">{weeklyScore}</span>
        </div>

        {/* Completion rate */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted">Month completion</span>
            <span className="text-xs font-bold">{stats.completionRate}%</span>
          </div>
          <div className="h-1.5 bg-hub-subtle rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${stats.completionRate}%`, backgroundColor: '#1a6630' }}
            />
          </div>
        </div>

        <button
          onClick={onShowStats}
          className="w-full text-xs font-bold uppercase tracking-wider text-hub-blue hover:underline text-left transition-colors pt-1"
        >
          View monthly stats →
        </button>
      </div>

      {/* Category filters */}
      <div className="bg-white border border-hub-border rounded-lg p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-hub-blue mb-3">Categories</div>
        <div className="space-y-2">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activeCategories.includes(key)}
                onChange={() => onToggleCategory(key)}
                className="w-3.5 h-3.5 rounded"
                style={{ accentColor: cat.bg }}
              />
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.bg }}
              />
              <span className="text-sm">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}
