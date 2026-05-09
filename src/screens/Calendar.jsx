import { useState, useMemo } from 'react'
import { useGameStore, buildSchedule } from '../store/gameStore'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const EVENT_COLOR = {
  practice:   { dot: 'bg-blue-500',   badge: 'bg-blue-900 text-blue-300 border-blue-700',   card: 'border-blue-800 bg-blue-950' },
  qualifying: { dot: 'bg-yellow-500', badge: 'bg-yellow-900 text-yellow-300 border-yellow-700', card: 'border-yellow-800 bg-yellow-950' },
  race:       { dot: 'bg-red-500',    badge: 'bg-red-900 text-red-300 border-red-700',       card: 'border-red-800 bg-red-950' },
  milestone:  { dot: 'bg-purple-500', badge: 'bg-purple-900 text-purple-300 border-purple-700', card: 'border-purple-800 bg-purple-950' },
  deadline:   { dot: 'bg-orange-500', badge: 'bg-orange-900 text-orange-300 border-orange-700', card: 'border-orange-800 bg-orange-950' },
  custom:     { dot: 'bg-green-500',  badge: 'bg-green-900 text-green-300 border-green-700',  card: 'border-green-800 bg-green-950' },
}

const EVENT_ICON = {
  practice: '🔧', qualifying: '⏱️', race: '🏁',
  milestone: '📌', deadline: '⏰', custom: '📝',
}

function formatDate(isoStr) {
  const d = new Date(isoStr)
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b)
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
}

function isPast(dateStr, current) {
  return new Date(dateStr) < new Date(current)
}

export default function Calendar() {
  const {
    currentDate, season, round, results,
    calendarEvents, addCalendarEvent, removeCalendarEvent,
    advanceDay, advanceToNextEvent, setDayPhase,
  } = useGameStore()

  const schedule = useMemo(() => buildSchedule(season), [season])
  const allEvents = useMemo(() => {
    const custom = calendarEvents.map(e => ({ ...e, type: 'custom' }))
    return [...schedule, ...custom].sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [schedule, calendarEvents])

  const current = new Date(currentDate)
  const [viewMonth, setViewMonth] = useState(current.getMonth())
  const [viewYear, setViewYear] = useState(current.getFullYear())
  const [selectedDate, setSelectedDate] = useState(currentDate.split('T')[0])
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({ label: '', desc: '', date: '' })
  const [advancing, setAdvancing] = useState(false)

  const todayStr = currentDate.split('T')[0]

  // Events untuk bulan yang ditampilkan
  const monthEvents = useMemo(() => {
    return allEvents.filter(e => {
      const d = new Date(e.date)
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear
    })
  }, [allEvents, viewMonth, viewYear])

  // Events untuk hari yang dipilih
  const selectedEvents = allEvents.filter(e => e.date === selectedDate)

  // Next important event dari hari ini
  const nextEvent = allEvents.find(e => new Date(e.date) > current)

  // Hari-hari di bulan ini
  const daysInMonth = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const last = new Date(viewYear, viewMonth + 1, 0)
    const days = []
    // Padding awal
    for (let i = 0; i < first.getDay(); i++) days.push(null)
    for (let d = 1; d <= last.getDate(); d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayEvents = allEvents.filter(e => e.date === dateStr)
      const isToday = dateStr === todayStr
      const isPastDay = dateStr < todayStr
      days.push({ date: dateStr, d, events: dayEvents, isToday, isPastDay })
    }
    return days
  }, [viewMonth, viewYear, allEvents, todayStr])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function goToToday() {
    const d = new Date(currentDate)
    setViewMonth(d.getMonth())
    setViewYear(d.getFullYear())
    setSelectedDate(todayStr)
  }

  async function handleAdvanceDay() {
    setAdvancing(true)
    advanceDay()
    setTimeout(() => setAdvancing(false), 300)
    // Jump ke bulan baru jika perlu
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setViewMonth(newDate.getMonth())
    setViewYear(newDate.getFullYear())
    setSelectedDate(newDate.toISOString().split('T')[0])
  }

  function handleAdvanceToNext() {
    if (!nextEvent) return
    advanceToNextEvent()
    const d = new Date(nextEvent.date)
    setViewMonth(d.getMonth())
    setViewYear(d.getFullYear())
    setSelectedDate(nextEvent.date)
  }

  function addEvent() {
    if (!newEvent.label.trim() || !newEvent.date) return
    addCalendarEvent({ ...newEvent, type: 'custom' })
    setNewEvent({ label: '', desc: '', date: '' })
    setShowAddEvent(false)
  }

  const todayEvents = allEvents.filter(e => e.date === todayStr)
  const hasImportantToday = todayEvents.some(e =>
    ['practice', 'qualifying', 'race', 'deadline'].includes(e.type)
  )

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Calendar</h2>
          <p className="text-sm text-gray-500">
            {formatDate(currentDate)} · Round {round}/20
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddEvent(true)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-base text-gray-300 hover:border-gray-600 transition-colors"
          >
            + Add Event
          </button>
        </div>
      </div>

      {/* Today's status + advance controls */}
      <div className={`border rounded-xl p-4 ${
        hasImportantToday
          ? 'border-red-700 bg-red-950 bg-opacity-30'
          : 'border-gray-800 bg-gray-900'
      }`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-base font-semibold text-white mb-1">
              {hasImportantToday ? '⚠ Important day — action required' : 'Today'}
            </div>
            <div className="text-sm text-gray-400">{formatDate(currentDate)}</div>
            {todayEvents.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {todayEvents.map((e, i) => (
                  <span key={i} className={`text-xs px-2 py-0.5 rounded border font-medium ${EVENT_COLOR[e.type]?.badge || 'bg-gray-800 text-gray-300'}`}>
                    {EVENT_ICON[e.type]} {e.label}
                  </span>
                ))}
              </div>
            )}
            {todayEvents.length === 0 && (
              <div className="text-sm text-gray-600 mt-1">No scheduled events today</div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleAdvanceDay}
              disabled={advancing || hasImportantToday}
              className={`px-5 py-2.5 rounded-xl text-base font-semibold transition-all ${
                hasImportantToday
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
              }`}
            >
              {advancing ? 'Advancing...' : '+ 1 Day →'}
            </button>
            {nextEvent && (
              <button
                onClick={handleAdvanceToNext}
                disabled={hasImportantToday}
                className={`px-5 py-2.5 rounded-xl text-base font-semibold transition-all ${
                  hasImportantToday
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                Skip to {nextEvent.icon || EVENT_ICON[nextEvent.type]} {nextEvent.circuit || nextEvent.label}
              </button>
            )}
          </div>
        </div>

        {hasImportantToday && (
          <div className="mt-3 pt-3 border-t border-red-900">
            <div className="text-sm text-red-400 font-medium mb-2">Complete today's activities to advance:</div>
            <div className="flex gap-2 flex-wrap">
              {todayEvents.filter(e => ['practice', 'qualifying', 'race'].includes(e.type)).map((e, i) => (
                <button
                  key={i}
                  onClick={() => setDayPhase(e.type)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${EVENT_COLOR[e.type]?.badge || ''} border-opacity-50 hover:opacity-80`}
                >
                  {EVENT_ICON[e.type]} Go to {e.type.charAt(0).toUpperCase() + e.type.slice(1)}
                </button>
              ))}
              <button
                onClick={handleAdvanceDay}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 transition-colors"
              >
                Skip day anyway
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-5">

        {/* Calendar grid */}
        <div className="col-span-2">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors flex items-center justify-center text-lg">
              ‹
            </button>
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-white">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button onClick={goToToday} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                Today
              </button>
            </div>
            <button onClick={nextMonth} className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors flex items-center justify-center text-lg">
              ›
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs text-gray-600 font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />
              const isSelected = day.date === selectedDate
              const hasRace = day.events.some(e => e.type === 'race')
              const hasQuali = day.events.some(e => e.type === 'qualifying')
              const hasPractice = day.events.some(e => e.type === 'practice')
              const hasMilestone = day.events.some(e => ['milestone', 'deadline'].includes(e.type))
              const hasCustom = day.events.some(e => e.type === 'custom')

              return (
                <div
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`relative rounded-xl p-2 cursor-pointer transition-all min-h-14 ${
                    day.isToday
                      ? 'bg-red-600 text-white ring-2 ring-red-400'
                      : day.isPastDay
                      ? 'bg-gray-900 text-gray-600 opacity-50'
                      : isSelected
                      ? 'bg-gray-700 text-white ring-1 ring-gray-500'
                      : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${day.isToday ? 'text-white' : ''}`}>
                    {day.d}
                  </div>
                  {/* Event dots */}
                  <div className="flex flex-wrap gap-0.5">
                    {hasRace && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
                    {hasQuali && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />}
                    {hasPractice && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                    {hasMilestone && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />}
                    {hasCustom && <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 flex-wrap">
            {[
              { color: 'bg-red-500', label: 'Race' },
              { color: 'bg-yellow-500', label: 'Qualifying' },
              { color: 'bg-blue-500', label: 'Practice' },
              { color: 'bg-purple-500', label: 'Milestone' },
              { color: 'bg-orange-500', label: 'Deadline' },
              { color: 'bg-green-500', label: 'Custom' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${l.color}`} />
                <span className="text-xs text-gray-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected day detail */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            {selectedDate === todayStr ? 'Today' : formatDate(selectedDate + 'T00:00:00')}
          </div>

          {selectedEvents.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
              <div className="text-gray-600 text-sm">No events this day</div>
              <button
                onClick={() => { setNewEvent(n => ({ ...n, date: selectedDate })); setShowAddEvent(true) }}
                className="text-xs text-gray-600 hover:text-green-400 mt-2 transition-colors"
              >
                + Add event here
              </button>
            </div>
          ) : (
            selectedEvents.map((event, i) => {
              const colors = EVENT_COLOR[event.type] || EVENT_COLOR.custom
              return (
                <div key={i} className={`border rounded-xl p-4 ${colors.card}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded border ${colors.badge}`}>
                          {EVENT_ICON[event.type]} {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </span>
                        {event.round && (
                          <span className="text-xs text-gray-500">Round {event.round}</span>
                        )}
                      </div>
                      <div className="text-base font-semibold text-white">{event.label}</div>
                      {event.country && (
                        <div className="text-sm text-gray-400 mt-0.5">{event.country}</div>
                      )}
                      {event.desc && (
                        <div className="text-sm text-gray-400 mt-1 leading-relaxed">{event.desc}</div>
                      )}
                    </div>
                    {event.type === 'custom' && (
                      <button
                        onClick={() => removeCalendarEvent(event.id)}
                        className="text-gray-600 hover:text-red-400 text-lg transition-colors flex-shrink-0"
                      >×</button>
                    )}
                  </div>

                  {['practice', 'qualifying', 'race'].includes(event.type) && (
                    <div className="mt-3 pt-3 border-t border-gray-800 border-opacity-50">
                      {selectedDate === todayStr ? (
                        <button
                          onClick={() => setDayPhase(event.type)}
                          className={`w-full py-2 rounded-lg text-sm font-semibold ${colors.badge} border transition-colors hover:opacity-80`}
                        >
                          {EVENT_ICON[event.type]} Go to {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </button>
                      ) : isPast(selectedDate, todayStr) ? (
                        <div className="text-sm text-gray-600 italic">Completed</div>
                      ) : (
                        <div className="text-sm text-gray-600 italic">
                          {Math.ceil((new Date(selectedDate) - new Date(todayStr)) / 86400000)} days away
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}

          {/* Upcoming events mini list */}
          {selectedDate === todayStr && nextEvent && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Next Event</div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded border ${EVENT_COLOR[nextEvent.type]?.badge || 'bg-gray-800 text-gray-300'}`}>
                  {EVENT_ICON[nextEvent.type]}
                </span>
                <div>
                  <div className="text-sm font-medium text-white">{nextEvent.label}</div>
                  <div className="text-xs text-gray-500">{formatDate(nextEvent.date + 'T00:00:00')}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add event modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6">
            <div className="text-lg font-semibold text-white mb-4">Add Calendar Event</div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Event name</label>
                <input
                  type="text"
                  value={newEvent.label}
                  onChange={e => setNewEvent(n => ({ ...n, label: e.target.value }))}
                  placeholder="e.g. Contract deadline — Rider X"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-base focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Date</label>
                <input
                  type="date"
                  value={newEvent.date || selectedDate}
                  onChange={e => setNewEvent(n => ({ ...n, date: e.target.value }))}
                  min={todayStr}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-base focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={newEvent.desc}
                  onChange={e => setNewEvent(n => ({ ...n, desc: e.target.value }))}
                  placeholder="Additional notes..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-base focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={addEvent} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-base font-semibold transition-colors">
                Add
              </button>
              <button onClick={() => setShowAddEvent(false)} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-base transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}