import { useGameStore } from '../store/gameStore'
import StarRating from '../components/StarRating'
import { buildSchedule } from '../store/gameStore'

function RiderCard({ rider }) {
  const AVATAR_COLORS = [
    'bg-red-600', 'bg-blue-600', 'bg-green-600',
    'bg-purple-600', 'bg-yellow-500', 'bg-orange-500',
  ]

  const riskLabel = (val) => {
    if (!val) return null
    if (val >= 17) return { text: 'Aggressive', color: 'text-red-400' }
    if (val >= 13) return { text: 'Balanced', color: 'text-yellow-400' }
    return { text: 'Conservative', color: 'text-green-400' }
  }

  const risk = riskLabel(rider.riskTaking)

  const attrs = [
    { label: 'Quali Pace', value: rider.qualiPace ?? rider.pace },
    { label: 'Race Pace', value: rider.racePace ?? rider.pace },
    { label: 'Tyre Mgmt', value: rider.tyreManagement },
    { label: 'Overtaking', value: rider.overtaking },
    { label: 'Defending', value: rider.defending },
    { label: 'Wet', value: rider.wetPerformance ?? rider.wetSkill },
    { label: 'Consistency', value: rider.consistency },
    { label: 'Stamina', value: rider.physicalStamina ?? rider.fitness },
    { label: 'Corner Spd', value: rider.cornerSpeed },
    { label: 'Braking', value: rider.brakingAbility },
    { label: 'Setup FB', value: rider.setupFeedback },
    { label: 'Mental', value: rider.mentalResilience ?? rider.mentalState },
  ].filter(a => a.value !== undefined && a.value !== null)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
          #{rider.number}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-white text-base">{rider.flag} {rider.name}</div>
          <div className="text-sm text-gray-500">
            {rider.nationality} · Contract: {rider.contractYears} yr · €{rider.salary}M/yr
          </div>
        </div>
        <div className="text-right">
          {risk && (
            <div className={`text-sm font-semibold ${risk.color}`}>{risk.text}</div>
          )}
          <div className="text-xs text-gray-500 mt-0.5">Risk style</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {attrs.map(attr => (
          <div key={attr.label} className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{attr.label}</span>
            <div className="flex items-center gap-2">
              <StarRating value={attr.value} max={20} size="sm" />
              <span className="text-sm font-semibold text-white w-5 text-right">{attr.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const {
    team, budget, riders, bike, staff, round, season,
    manager, championshipPoints, championshipPosition,
    currentDate, advanceDay, advanceToNextEvent,
    calendarEvents,
  } = useGameStore()

  const bikeOverall = Math.round(
    (bike.topSpeed + bike.aero + bike.chassis + bike.braking + bike.electronics) / 5
  )
  const todayStr = currentDate ? currentDate.split('T')[0] : ''
  const schedule = buildSchedule ? buildSchedule(season) : []
  const allEvents = [...(schedule || []), ...(calendarEvents || [])]
  const hasImportantToday = allEvents.some(e =>
    e.date === todayStr && ['practice', 'qualifying', 'race', 'deadline'].includes(e.type)
  )

  const nextEvent = allEvents
    .filter(e => new Date(e.date) > new Date(currentDate))
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0]

  function formatDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  }

  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Dashboard</h2>
          <p className="text-sm text-gray-500">
            Round {round}/20 · {team.manufacturer} · Season {season}
          </p>
          {currentDate && (
            <p className="text-sm text-gray-600 mt-0.5">{formatDate(currentDate)}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {manager && (
            <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">
                {manager.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{manager.name}</div>
                <div className="text-xs text-gray-500">{manager.nationality} · Manager</div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              onClick={() => advanceDay?.()}
              disabled={hasImportantToday}
              className={`px-5 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                hasImportantToday
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                  : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
              }`}
            >
              + 1 Day
            </button>
            {nextEvent && (
              <button
                onClick={() => advanceToNextEvent?.()}
                disabled={hasImportantToday}
                className={`px-5 py-2.5 rounded-xl text-base font-semibold transition-colors text-center ${
                  hasImportantToday
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                Skip → {nextEvent.circuit || nextEvent.label?.split(' ')[0]}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Budget', value: `€${budget}M`, color: 'text-green-400' },
          { label: 'Championship', value: `P${championshipPosition ?? 20}`, color: 'text-yellow-400' },
          { label: 'Points', value: championshipPoints ?? 0, color: 'text-white' },
          { label: 'Bike Overall', value: bikeOverall, color: 'text-blue-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-base text-gray-500 mb-1">{stat.label}</div>
            <div className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-3">Riders</h3>
        <div className="grid grid-cols-2 gap-4">
          {riders.map(rider => (
            <RiderCard key={rider.id} rider={rider} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Bike — {bike.model}
        </h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-base text-gray-400">Overall Rating</div>
            <div className="flex items-center gap-2">
              <StarRating value={bikeOverall} max={20} size="md" />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Top Speed', value: bike.topSpeed },
              { label: 'Aero', value: bike.aero },
              { label: 'Chassis', value: bike.chassis },
              { label: 'Braking', value: bike.braking },
              { label: 'Electronics', value: bike.electronics },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-800 rounded-xl p-3 flex flex-col gap-2">
                <div className="text-base text-gray-400">{stat.label}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <StarRating value={stat.value} max={20} size="md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-3">Technical Staff</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 grid grid-cols-2 gap-4">
          {Object.entries(staff).map(([role, person]) => (
            <div key={role} className="flex items-center justify-between">
              <div>
                <div className="text-base text-gray-500 capitalize mb-1">
                  {role.replace(/([A-Z])/g, ' $1')}
                </div>
                <div className="text-base font-medium text-white">{person.name}</div>
                <StarRating value={person.skill} max={20} size="md" />
              </div>
              <div className="text-3xl font-bold text-gray-700">{person.skill}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}