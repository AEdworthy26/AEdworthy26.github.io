'use client'
import { CATEGORIES, formatFull, getMonthlyStats, getCurrentStreak, getWeeklyScore, formatMonth } from '@/lib/utils'

export default function StatsPanel({ events, year, month, onClose }) {
  const stats  = getMonthlyStats(events, year, month)
  const streak = getCurrentStreak(events)
  const weekScore = getWeeklyScore(events)

  const catEntries = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])
  const total = catEntries.reduce((s, [, n]) => s + n, 0)

  return (
    <div className="modal-overlay fade-in" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-panel max-w-lg">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-hub-border">
          <h2 className="font-display font-bold text-lg">
            📊 {formatMonth(year, month)} — Summary
          </h2>
          <button onClick={onClose} className="text-faint hover:text-ink transition-colors text-xl">×</button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Top stats row */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard value={stats.total}       label="Total Events"      color="#003399" />
            <StatCard value={stats.completed}   label="Completed"         color="#1a6630" />
            <StatCard value={`${stats.completionRate}%`} label="Completion Rate" color="#7c3aed" />
          </div>

          {/* Streak + weekly score */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-paper border border-hub-border rounded-lg p-4 text-center">
              <div className="font-display font-bold text-3xl">
                {streak}{streak >= 2 ? ' 🔥' : ''}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-faint mt-1">Day Streak</div>
            </div>
            <div className="bg-paper border border-hub-border rounded-lg p-4 text-center">
              <div className="font-display font-bold text-3xl text-green-700">{weekScore}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-faint mt-1">Week Score</div>
            </div>
          </div>

          {/* Highlights */}
          {(stats.busiest || stats.mostProductive) && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-widest text-hub-blue">Highlights</div>
              {stats.busiest && (
                <HighlightRow
                  icon="📅"
                  label="Busiest day"
                  value={`${formatFull(stats.busiest.date)} — ${stats.busiest.count} events`}
                />
              )}
              {stats.mostProductive && (
                <HighlightRow
                  icon="🏆"
                  label="Most productive day"
                  value={`${formatFull(stats.mostProductive.date)} — score ${stats.mostProductive.score}`}
                />
              )}
            </div>
          )}

          {/* Category breakdown */}
          {catEntries.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-hub-blue mb-3">By Category</div>
              <div className="space-y-2.5">
                {catEntries.map(([key, count]) => {
                  const cat = CATEGORIES[key] || CATEGORIES.other
                  const pct = total ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.bg }} />
                          <span className="text-sm">{cat.label}</span>
                        </div>
                        <span className="text-xs font-bold text-muted">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-hub-subtle rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: cat.bg }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {stats.total === 0 && (
            <div className="text-center text-muted italic py-4">No events this month.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label, color }) {
  return (
    <div className="bg-paper border border-hub-border rounded-lg p-3 text-center">
      <div className="font-display font-bold text-2xl" style={{ color }}>{value}</div>
      <div className="text-xs font-bold uppercase tracking-wider text-faint mt-1">{label}</div>
    </div>
  )
}

function HighlightRow({ icon, label, value }) {
  return (
    <div className="flex gap-2 bg-paper border border-hub-border rounded-lg px-3 py-2.5 text-sm">
      <span>{icon}</span>
      <div>
        <span className="font-bold text-muted text-xs uppercase tracking-wide mr-1">{label}</span>
        <span className="text-ink text-xs">{value}</span>
      </div>
    </div>
  )
}
