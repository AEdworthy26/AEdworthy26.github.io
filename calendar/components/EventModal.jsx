'use client'
import { useState, useEffect, useRef } from 'react'
import { CATEGORIES, REMINDER_OPTIONS, RECURRENCE_OPTIONS, generateId } from '@/lib/utils'

const EMPTY = {
  title: '', category: 'work', date: '', startTime: '', endTime: '',
  venue: '', notes: '', reminder: null, recurrence: null, recurrenceEnd: '', completed: false,
}

export default function EventModal({ event, defaultDate, defaultTime, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(EMPTY)
  const titleRef = useRef(null)

  useEffect(() => {
    if (event) {
      setForm({ ...EMPTY, ...event })
    } else {
      setForm({ ...EMPTY, date: defaultDate || '', startTime: defaultTime || '', id: generateId() })
    }
    setTimeout(() => titleRef.current?.focus(), 50)
  }, [event, defaultDate, defaultTime])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.date) return
    onSave({ ...form, id: form.id || generateId() })
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose()
  }

  const cat = CATEGORIES[form.category] || CATEGORIES.other

  return (
    <div className="modal-overlay fade-in" onMouseDown={handleBackdrop}>
      <div className="modal-panel">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-hub-border">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.bg }}
            />
            <h2 className="font-display font-bold text-lg">
              {event ? 'Edit Event' : 'New Event'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-faint hover:text-ink transition-colors text-xl leading-none"
            aria-label="Close"
          >×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-hub-blue mb-1.5">Title *</label>
            <input
              ref={titleRef}
              type="text"
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Event title…"
              className="w-full bg-paper border border-hub-border rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:border-hub-blue focus:ring-1 focus:ring-hub-blue/20"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-hub-blue mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORIES).map(([key, c]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('category', key)}
                  className="px-3 py-1 rounded-full text-xs font-bold border transition-all"
                  style={form.category === key
                    ? { backgroundColor: c.bg, color: c.text, borderColor: c.bg }
                    : { backgroundColor: 'transparent', color: c.bg, borderColor: c.bg, opacity: 0.7 }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date + Times */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-hub-blue mb-1.5">Date *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className="w-full bg-paper border border-hub-border rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:border-hub-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-hub-blue mb-1.5">Start</label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => set('startTime', e.target.value)}
                className="w-full bg-paper border border-hub-border rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:border-hub-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-hub-blue mb-1.5">End</label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => set('endTime', e.target.value)}
                className="w-full bg-paper border border-hub-border rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:border-hub-blue"
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-hub-blue mb-1.5">Venue / Location</label>
            <input
              type="text"
              value={form.venue}
              onChange={e => set('venue', e.target.value)}
              placeholder="Where is it?"
              className="w-full bg-paper border border-hub-border rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:border-hub-blue"
            />
          </div>

          {/* Reminder + Recurrence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-hub-blue mb-1.5">Reminder</label>
              <select
                value={form.reminder ?? ''}
                onChange={e => set('reminder', e.target.value === '' ? null : Number(e.target.value))}
                className="w-full bg-paper border border-hub-border rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:border-hub-blue"
              >
                {REMINDER_OPTIONS.map(o => (
                  <option key={String(o.value)} value={o.value ?? ''}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-hub-blue mb-1.5">Repeat</label>
              <select
                value={form.recurrence ?? ''}
                onChange={e => set('recurrence', e.target.value || null)}
                className="w-full bg-paper border border-hub-border rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:border-hub-blue"
              >
                {RECURRENCE_OPTIONS.map(o => (
                  <option key={String(o.value)} value={o.value ?? ''}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Recurrence end */}
          {form.recurrence && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-hub-blue mb-1.5">Repeat Until (optional)</label>
              <input
                type="date"
                value={form.recurrenceEnd || ''}
                onChange={e => set('recurrenceEnd', e.target.value || null)}
                className="w-full bg-paper border border-hub-border rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:border-hub-blue"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-hub-blue mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="Any additional details…"
              className="w-full bg-paper border border-hub-border rounded-md px-3 py-2 text-sm font-serif resize-none focus:outline-none focus:border-hub-blue"
            />
          </div>

          {/* Completed toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.completed}
              onChange={e => set('completed', e.target.checked)}
              className="w-4 h-4 rounded accent-hub-blue"
            />
            <span className="text-sm font-serif text-muted">Mark as completed</span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-hub-border mt-2">
            {event && (
              <button
                type="button"
                onClick={() => onDelete(event.id)}
                className="text-xs text-red-600 hover:text-red-800 font-bold uppercase tracking-wider transition-colors"
              >
                Delete
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-hub-border rounded-md text-muted hover:bg-hub-subtle transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-hub-blue text-white rounded-md hover:bg-blue-900 transition-colors"
                style={{ backgroundColor: cat.bg }}
              >
                {event ? 'Save Changes' : 'Add Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
