'use client'
import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import SAMPLE_EVENTS from '@/lib/sampleData'
import { toISO, formatMonth, isReminderDue, expandEvents, generateId } from '@/lib/utils'
import MonthView  from './MonthView'
import WeekView   from './WeekView'
import DayView    from './DayView'
import AgendaView from './AgendaView'
import EventModal from './EventModal'
import Sidebar    from './Sidebar'
import StatsPanel from './StatsPanel'

const VIEWS = ['month', 'week', 'day', 'agenda']
const VIEW_LABELS = { month: 'Month', week: 'Week', day: 'Day', agenda: 'Agenda' }

export default function CalendarApp() {
  const [events, setEvents]               = useLocalStorage('ph_calendar_events', SAMPLE_EVENTS)
  const [view, setView]                   = useState('month')
  const [currentDate, setCurrentDate]     = useState(new Date())
  const [modal, setModal]                 = useState(null) // { event, defaultDate, defaultTime }
  const [showStats, setShowStats]         = useState(false)
  const [activeCategories, setActiveCats] = useState(['work', 'social', 'sport', 'personal', 'other'])
  const [searchQuery, setSearchQuery]     = useState('')
  const [sidebarOpen, setSidebarOpen]     = useState(true)
  const [reminders, setReminders]         = useState([])

  // ── Reminder polling ─────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const due = events.filter(isReminderDue)
      setReminders(due)
    }
    check()
    const id = setInterval(check, 60000)
    return () => clearInterval(id)
  }, [events])

  // ── Filtered events (for views) ──────────────────────────────────────────
  const filteredEvents = events.filter(ev =>
    activeCategories.includes(ev.category) &&
    (!searchQuery || [ev.title, ev.venue, ev.notes].some(
      f => f?.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  )

  // ── Navigation ────────────────────────────────────────────────────────────
  function navigate(delta) {
    const d = new Date(currentDate)
    if (view === 'month')  d.setMonth(d.getMonth() + delta)
    else if (view === 'week') d.setDate(d.getDate() + delta * 7)
    else d.setDate(d.getDate() + delta)
    setCurrentDate(d)
  }

  function goToToday() { setCurrentDate(new Date()) }

  function navigateTo(date) { setCurrentDate(new Date(date)) }

  // ── Event CRUD ────────────────────────────────────────────────────────────
  function saveEvent(ev) {
    setEvents(prev => {
      const exists = prev.find(e => e.id === ev.id)
      return exists ? prev.map(e => e.id === ev.id ? ev : e) : [...prev, ev]
    })
    setModal(null)
  }

  function deleteEvent(id) {
    if (!confirm('Delete this event?')) return
    setEvents(prev => prev.filter(e => e.id !== id))
    setModal(null)
  }

  function handleEventDrop(eventId, newDate) {
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, date: newDate } : e
    ))
  }

  function toggleCategory(key) {
    setActiveCats(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  // ── Modal openers ─────────────────────────────────────────────────────────
  function openNewEvent(date, time) {
    setModal({ event: null, defaultDate: date || toISO(currentDate), defaultTime: time })
  }

  function openEditEvent(ev) {
    // If it's a recurring instance, open the original for editing
    const original = events.find(e => e.id === ev.id) || ev
    setModal({ event: original, defaultDate: null })
  }

  // ── Export ────────────────────────────────────────────────────────────────
  function exportJSON() {
    const blob = new Blob([JSON.stringify({ events }, null, 2)], { type: 'application/json' })
    download(blob, `calendar-${toISO(new Date())}.json`)
  }

  function exportCSV() {
    const headers = ['id','title','category','date','startTime','endTime','venue','notes','completed']
    const rows    = events.map(e => headers.map(h => JSON.stringify(e[h] ?? '')).join(','))
    const blob    = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' })
    download(blob, `calendar-${toISO(new Date())}.csv`)
  }

  function download(blob, name) {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
  }

  // ── Navigation header label ───────────────────────────────────────────────
  function getHeaderLabel() {
    if (view === 'month') return formatMonth(currentDate.getFullYear(), currentDate.getMonth())
    if (view === 'week') {
      const s = new Date(currentDate); s.setDate(s.getDate() - s.getDay())
      const e = new Date(s); e.setDate(s.getDate() + 6)
      return `${s.toLocaleDateString('en-GB',{day:'numeric',month:'short'})} – ${e.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}`
    }
    return currentDate.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
  }

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()

  return (
    <div className="min-h-screen flex flex-col bg-paper">

      {/* ── Personal Hub header ── */}
      <div className="bg-paper border-b border-hub-border">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex justify-between items-center py-2 text-xs uppercase tracking-widest text-muted border-b border-ink/10 mb-1">
            <span>{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span>
            <span>Alfie Edworthy · Private</span>
          </div>
          <div className="text-center py-1">
            <div className="font-display font-black text-4xl tracking-tight">Personal Hub</div>
            <div className="text-xs italic text-muted">Alfie Edworthy</div>
          </div>
        </div>
      </div>
      <hr className="border-t-[3px] border-double border-ink max-w-screen-xl mx-auto w-full" />

      {/* ── Nav ribbon ── */}
      <div className="nav-ribbon">
        <div className="max-w-screen-xl mx-auto px-4 flex items-center gap-0.5 flex-wrap">
          <a href="../personal_hub.html" className="font-bold text-white border-r border-white/25 pr-3 mr-1">⌂ Home</a>
          <a href="../rics-study.html">RICS Study</a>
          <a href="../world-news.html">World News</a>
          <a href="../tech-news.html">Tech News</a>
          <a href="../curiosity.html">Curiosity Corner</a>
          <a href="../reads.html">Reads</a>
          <a href="#" className="active">Calendar</a>
          <a href="../weekly-checkin.html">Weekly Check-In</a>
          <a href="../monthly-goals.html">Monthly Goals</a>
          <a href="../achievements.html">Achievements</a>
        </div>
      </div>

      {/* ── Reminder banner ── */}
      {reminders.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <div className="max-w-screen-xl mx-auto flex items-center gap-2 flex-wrap">
            <span className="text-red-600 text-sm font-bold reminder-due rounded px-1">🔔 Upcoming:</span>
            {reminders.map(ev => (
              <button
                key={ev.id}
                onClick={() => openEditEvent(ev)}
                className="text-sm text-red-700 hover:underline"
              >
                {ev.title} at {ev.startTime}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="flex-1 flex max-w-screen-xl mx-auto w-full px-4 py-4 gap-4 min-h-0">

        {/* Sidebar */}
        {sidebarOpen && (
          <Sidebar
            currentDate={currentDate}
            events={events}
            activeCategories={activeCategories}
            onToggleCategory={toggleCategory}
            onNavigate={navigateTo}
            onTodayClick={goToToday}
            onShowStats={() => setShowStats(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {/* Calendar area */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">

          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="p-2 rounded-md border border-hub-border bg-white hover:bg-hub-subtle text-sm transition-colors"
              title="Toggle sidebar"
            >
              ☰
            </button>

            {/* Nav arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-1.5 rounded-md border border-hub-border bg-white hover:bg-hub-subtle text-sm transition-colors"
              >‹</button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 rounded-md border border-hub-border bg-white hover:bg-hub-subtle text-xs font-bold uppercase tracking-wider transition-colors"
              >Today</button>
              <button
                onClick={() => navigate(1)}
                className="px-3 py-1.5 rounded-md border border-hub-border bg-white hover:bg-hub-subtle text-sm transition-colors"
              >›</button>
            </div>

            {/* Period label */}
            <h1 className="font-display font-bold text-xl flex-1">{getHeaderLabel()}</h1>

            {/* View switcher */}
            <div className="flex rounded-md border border-hub-border overflow-hidden bg-white">
              {VIEWS.map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-r border-hub-border last:border-r-0 transition-colors ${view === v ? 'bg-hub-blue text-white' : 'hover:bg-hub-subtle'}`}
                >
                  {VIEW_LABELS[v]}
                </button>
              ))}
            </div>

            {/* Add event */}
            <button
              onClick={() => openNewEvent()}
              className="px-4 py-1.5 bg-hub-blue text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-blue-900 transition-colors"
            >
              + Event
            </button>

            {/* Export */}
            <div className="relative group">
              <button className="px-3 py-1.5 border border-hub-border bg-white rounded-md text-xs text-muted hover:bg-hub-subtle transition-colors">
                Export ▾
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white border border-hub-border rounded-lg shadow-lg overflow-hidden z-20 hidden group-hover:block">
                <button onClick={exportJSON} className="block w-full text-left px-4 py-2 text-xs hover:bg-hub-subtle">JSON</button>
                <button onClick={exportCSV}  className="block w-full text-left px-4 py-2 text-xs hover:bg-hub-subtle">CSV</button>
              </div>
            </div>
          </div>

          {/* View area */}
          <div className="flex-1 flex flex-col min-h-0" style={{ minHeight: 500 }}>
            {view === 'month' && (
              <MonthView
                currentDate={currentDate}
                events={filteredEvents}
                onDayClick={date => { setCurrentDate(new Date(date + 'T12:00:00')); setView('day') }}
                onEventClick={openEditEvent}
                onEventDrop={handleEventDrop}
              />
            )}
            {view === 'week' && (
              <WeekView
                currentDate={currentDate}
                events={filteredEvents}
                onSlotClick={(date, time) => openNewEvent(date, time)}
                onEventClick={openEditEvent}
              />
            )}
            {view === 'day' && (
              <DayView
                currentDate={currentDate}
                events={filteredEvents}
                onSlotClick={(date, time) => openNewEvent(date, time)}
                onEventClick={openEditEvent}
              />
            )}
            {view === 'agenda' && (
              <AgendaView
                currentDate={currentDate}
                events={filteredEvents}
                onEventClick={openEditEvent}
                onDayClick={date => { setCurrentDate(new Date(date + 'T12:00:00')); setView('day') }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="text-center text-xs uppercase tracking-widest text-faint border-t border-hub-border py-4 mt-4">
        Personal Hub — Alfie Edworthy — Private &amp; Confidential
      </footer>

      {/* ── Modals ── */}
      {modal && (
        <EventModal
          event={modal.event}
          defaultDate={modal.defaultDate}
          defaultTime={modal.defaultTime}
          onSave={saveEvent}
          onDelete={deleteEvent}
          onClose={() => setModal(null)}
        />
      )}

      {showStats && (
        <StatsPanel
          events={events}
          year={year}
          month={month}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  )
}
