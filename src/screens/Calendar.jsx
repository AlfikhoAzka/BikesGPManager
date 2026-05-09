import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { getCircuitList } from '../engine/raceEngine'

const CIRCUIT_INFO = {
  'Thailand': { type: 'technical', surface: 'smooth', temp: '35°C', layout: 'Mixed' },
  'Argentina': { type: 'mixed', surface: 'abrasive', temp: '22°C', layout: 'Technical' },
  'COTA': { type: 'technical', surface: 'bumpy', temp: '28°C', layout: 'High-speed' },
  'Jerez': { type: 'technical', surface: 'smooth', temp: '25°C', layout: 'Technical' },
  'Le Mans': { type: 'mixed', surface: 'abrasive', temp: '18°C', layout: 'Mixed' },
  'Mugello': { type: 'high-speed', surface: 'smooth', temp: '26°C', layout: 'High-speed' },
  'Catalunya': { type: 'mixed', surface: 'smooth', temp: '28°C', layout: 'Mixed' },
  'Assen': { type: 'technical', surface: 'smooth', temp: '20°C', layout: 'Technical' },
  'Silverstone': { type: 'high-speed', surface: 'smooth', temp: '17°C', layout: 'High-speed' },
  'Austria': { type: 'high-speed', surface: 'smooth', temp: '24°C', layout: 'High-speed' },
  'Misano': { type: 'technical', surface: 'smooth', temp: '27°C', layout: 'Technical' },
  'Aragon': { type: 'mixed', surface: 'abrasive', temp: '25°C', layout: 'Mixed' },
  'Motegi': { type: 'technical', surface: 'smooth', temp: '22°C', layout: 'Technical' },
  'Mandalika': { type: 'mixed', surface: 'smooth', temp: '32°C', layout: 'Mixed' },
  'Phillip Island': { type: 'high-speed', surface: 'smooth', temp: '16°C', layout: 'High-speed' },
  'Sepang': { type: 'mixed', surface: 'smooth', temp: '33°C', layout: 'Mixed' },
  'Lusail': { type: 'high-speed', surface: 'smooth', temp: '28°C', layout: 'High-speed' },
  'Portimao': { type: 'technical', surface: 'smooth', temp: '20°C', layout: 'Technical' },
  'Valencia': { type: 'technical', surface: 'smooth', temp: '18°C', layout: 'Technical' },
  'Brazil': { type: 'mixed', surface: 'abrasive', temp: '30°C', layout: 'Mixed' },
}

const WEATHER_OPTIONS = ['☀️ Dry', '⛅ Mixed', '🌧️ Wet', '🌩️ Thunderstorm']

const MILESTONE_EVENTS = [
  { round: 1, type: 'milestone', label: 'Season Opener', desc: 'First race of the season. Media attention is high.', icon: '🏁' },
  { round: 3, type: 'milestone', label: 'Early Season Review', desc: 'Board reviews team performance after first 3 rounds.', icon: '📊' },
  { round: 5, type: 'deadline', label: 'Early Contract Window Opens', desc: 'Teams can begin contract negotiations for next season.', icon: '📋' },
  { round: 8, type: 'milestone', label: 'Mid-Season Analysis', desc: 'Sponsors and board assess championship position.', icon: '🔍' },
  { round: 10, type: 'milestone', label: 'Mid-Season Break', desc: 'Two-week break. Good time for testing and negotiations.', icon: '⏸️' },
  { round: 12, type: 'deadline', label: 'Contract Deadline Approaching', desc: 'Most riders expect contract decisions by this point.', icon: '⏰' },
  { round: 14, type: 'deadline', label: 'Transfer Window Peak', desc: 'Major rider transfers typically confirmed this period.', icon: '🔄' },
  { round: 16, type: 'milestone', label: 'Season Finale Preparation', desc: 'Final 5 rounds — championship battle intensifies.', icon: '🔥' },
  { round: 18, type: 'deadline', label: 'Final Contract Deadline', desc: 'Last chance to secure riders for next season.', icon: '🚨' },
  { round: 20, type: 'milestone', label: 'Season Finale', desc: 'Final round. Championship decided. Transfer season begins.', icon: '🏆' },
]

const TYPE_COLOR = {
  race: 'border-red-800 bg-red-950',
  milestone: 'border-blue-800 bg-blue-950',
  deadline: 'border-amber-800 bg-amber-950',
  custom: 'border-green-800 bg-green-950',
  past: 'border-gray-800 bg-gray-900 opacity-50',
}

const TYPE_BADGE = {
  race: 'bg-red-900 text-red-300',
  milestone: 'bg-blue-900 text-blue-300',
  deadline: 'bg-amber-900 text-amber-300',
  custom: 'bg-green-900 text-green-300',
}

const CIRCUIT_TYPE_BADGE = {
  'technical': 'bg-blue-900 text-blue-300',
  'high-speed': 'bg-red-900 text-red-300',
  'mixed': 'bg-yellow-900 text-yellow-300',
}

function WeatherIcon({ circuit }) {
  const seed = circuit.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const idx = seed % WEATHER_OPTIONS.length
  return <span>{WEATHER_OPTIONS[idx]}</span>
}

export default function Calendar() {
  const { round, season, results, calendarEvents, addCalendarEvent, removeCalendarEvent } = useGameStore()
  const circuits = getCircuitList()

  const [selectedRound, setSelectedRound] = useState(round)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({ label: '', desc: '', round: round })
  const [filter, setFilter] = useState('all')

  const allRounds = circuits.map((circuit, i) => {
    const roundNum = i + 1
    const isPast = roundNum < round
    const isCurrent = roundNum === round
    const result = results.find(r => r.round === roundNum)
    const milestone = MILESTONE_EVENTS.find(m => m.round === roundNum)
    const customEvents = calendarEvents.filter(e => e.round === roundNum)
    const info = CIRCUIT_INFO[circuit.name] || {}

    return {
      round: roundNum,
      circuit,
      isPast,
      isCurrent,
      result,
      milestone,
      customEvents,
      info,
    }
  })

  const filtered = allRounds.filter(r => {
    if (filter === 'upcoming') return !r.isPast
    if (filter === 'past') return r.isPast
    if (filter === 'milestones') return r.milestone
    return true
  })

  const selected = allRounds.find(r => r.round === selectedRound)

  function addEvent() {
    if (!newEvent.label.trim()) return
    addCalendarEvent({ ...newEvent, type: 'custom' })
    setNewEvent({ label: '', desc: '', round })
    setShowAddEvent(false)
  }

  return (
    <div className="space-y-5">

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Season Calendar</h2>
          <p className="text-sm text-gray-500">
            Season {season} · Round {round}/20 ·
            <span className="text-green-400 ml-1">{20 - round} rounds remaining</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddEvent(true)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-base text-gray-300 hover:border-gray-600 transition-colors"
        >
          + Add Event
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Season Progress</span>
          <span>{round - 1}/20 rounds completed</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-red-500 h-2 rounded-full transition-all"
            style={{ width: `${((round - 1) / 20) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>Round 1</span>
          <span>Mid-season (R10)</span>
          <span>Finale (R20)</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'upcoming', 'past', 'milestones'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-base font-medium transition-colors capitalize ${
              filter === f ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">

        <div className="col-span-2 space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filtered.map(item => (
            <div
              key={item.round}
              onClick={() => setSelectedRound(item.round)}
              className={`border rounded-xl p-4 cursor-pointer transition-all ${
                item.isPast ? 'border-gray-800 bg-gray-900 opacity-60 hover:opacity-80' :
                item.isCurrent ? 'border-red-600 bg-red-950 bg-opacity-20' :
                'border-gray-800 bg-gray-900 hover:border-gray-700'
              } ${selectedRound === item.round ? 'ring-1 ring-red-500' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 ${
                  item.isPast ? 'bg-gray-800 text-gray-500' :
                  item.isCurrent ? 'bg-red-600 text-white' :
                  'bg-gray-800 text-gray-300'
                }`}>
                  {item.result ? (item.result.position <= 3 ? '🏆' : `P${item.result.position}`) : item.round}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold text-white">{item.circuit.name}</span>
                    <span className="text-sm text-gray-500">{item.circuit.country}</span>
                    {item.isCurrent && (
                      <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-lg font-medium">
                        Next Race
                      </span>
                    )}
                    {item.isPast && item.result && (
                      <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                        item.result.position <= 3 ? 'bg-yellow-900 text-yellow-300' :
                        item.result.position <= 10 ? 'bg-green-900 text-green-300' :
                        'bg-gray-800 text-gray-400'
                      }`}>
                        P{item.result.position} · {item.result.points}pts
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {item.circuit.laps} laps · <WeatherIcon circuit={item.circuit.name} />
                    {item.info.type && (
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded ${CIRCUIT_TYPE_BADGE[item.info.type]}`}>
                        {item.info.layout}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 items-end flex-shrink-0">
                  {item.milestone && (
                    <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                      {item.milestone.icon} {item.milestone.label}
                    </span>
                  )}
                  {item.customEvents.length > 0 && (
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded">
                      +{item.customEvents.length} event
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {selected && (
            <>
              <div className={`border rounded-xl p-4 ${
                selected.isPast ? 'border-gray-800 bg-gray-900' :
                selected.isCurrent ? 'border-red-700 bg-red-950 bg-opacity-30' :
                'border-gray-800 bg-gray-900'
              }`}>
                <div className="text-base font-semibold text-white mb-1">
                  Round {selected.round} — {selected.circuit.name}
                </div>
                <div className="text-sm text-gray-500 mb-3">{selected.circuit.country}</div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Laps</span>
                    <span className="text-white">{selected.circuit.laps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Layout</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${CIRCUIT_TYPE_BADGE[selected.info.type] || 'bg-gray-800 text-gray-300'}`}>
                      {selected.info.layout || 'Mixed'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Surface</span>
                    <span className="text-white capitalize">{selected.info.surface || 'Smooth'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Temp</span>
                    <span className="text-white">{selected.info.temp || '25°C'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Weather forecast</span>
                    <span><WeatherIcon circuit={selected.circuit.name} /></span>
                  </div>
                </div>

                {selected.result && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="text-sm font-semibold text-gray-400 mb-2">Race Result</div>
                    <div className={`text-2xl font-bold ${
                      selected.result.position <= 3 ? 'text-yellow-400' :
                      selected.result.position <= 10 ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      P{selected.result.position}
                    </div>
                    <div className="text-sm text-gray-500">{selected.result.points} points</div>
                  </div>
                )}
              </div>

              {selected.milestone && (
                <div className="border border-blue-800 bg-blue-950 rounded-xl p-4">
                  <div className="text-base font-semibold text-blue-300 mb-1">
                    {selected.milestone.icon} {selected.milestone.label}
                  </div>
                  <div className="text-sm text-blue-400 leading-relaxed">{selected.milestone.desc}</div>
                </div>
              )}

              {selected.customEvents.map(event => (
                <div key={event.id} className="border border-green-800 bg-green-950 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-base font-semibold text-green-300 mb-1">📌 {event.label}</div>
                      {event.desc && (
                        <div className="text-sm text-green-400 leading-relaxed">{event.desc}</div>
                      )}
                    </div>
                    <button
                      onClick={() => removeCalendarEvent(event.id)}
                      className="text-green-700 hover:text-red-400 text-lg ml-2 transition-colors"
                    >×</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

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
                  placeholder="e.g. Contract deadline for Rider X"
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
              <div>
                <label className="text-sm text-gray-400 block mb-1">Round</label>
                <select
                  value={newEvent.round}
                  onChange={e => setNewEvent(n => ({ ...n, round: parseInt(e.target.value) }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-base focus:outline-none focus:border-red-500"
                >
                  {allRounds.filter(r => !r.isPast).map(r => (
                    <option key={r.round} value={r.round}>
                      Round {r.round} — {r.circuit.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={addEvent}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-base font-semibold transition-colors"
              >
                Add Event
              </button>
              <button
                onClick={() => setShowAddEvent(false)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-base transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}