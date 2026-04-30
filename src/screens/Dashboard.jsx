import { useGameStore } from '../store/gameStore'

function StatBar({ value, max = 100, color = 'bg-red-500' }) {
  return (
    <div className="w-full bg-gray-800 rounded-full h-1.5">
      <div
        className={`${color} h-1.5 rounded-full transition-all`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  )
}

function RiderCard({ rider }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-content-center text-sm font-bold flex items-center justify-center">
          #{rider.number}
        </div>
        <div>
          <div className="font-semibold text-white">{rider.name}</div>
          <div className="text-xs text-gray-500">Overall {rider.overall} · Kontrak {rider.contractYears} thn · €{rider.salary}M/thn</div>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Pace</span><span>{rider.pace}</span>
          </div>
          <StatBar value={rider.pace} color="bg-red-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Consistency</span><span>{rider.consistency}</span>
          </div>
          <StatBar value={rider.consistency} color="bg-blue-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Wet skill</span><span>{rider.wetSkill}</span>
          </div>
          <StatBar value={rider.wetSkill} color="bg-cyan-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Mental</span><span>{rider.mentalState}</span>
          </div>
          <StatBar value={rider.mentalState} color="bg-yellow-500" />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { team, budget, riders, bike, staff, round } = useGameStore()

  const bikeOverall = Math.round(
    (bike.topSpeed + bike.aero + bike.chassis + bike.braking + bike.electronics) / 5
  )

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-lg font-semibold mb-1">Season Overview 2025</h2>
        <p className="text-sm text-gray-500">Round {round} of 20 · {team.manufacturer} {bike.spec === 'satellite' ? 'Satellite Spec' : 'Factory Spec'}</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Budget', value: `€${budget}M`, color: 'text-green-400' },
          { label: 'Championship Position', value: '#6', color: 'text-yellow-400' },
          { label: 'Total Points', value: '87', color: 'text-white' },
          { label: 'Overall Bike', value: bikeOverall, color: 'text-blue-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
            <div className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Rider</h3>
        <div className="grid grid-cols-2 gap-4">
          {riders.map(rider => (
            <RiderCard key={rider.id} rider={rider} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Motor — {bike.model}</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Top speed', value: bike.topSpeed },
              { label: 'Aero', value: bike.aero },
              { label: 'Chassis', value: bike.chassis },
              { label: 'Braking', value: bike.braking },
              { label: 'Electronics', value: bike.electronics },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-xs text-gray-500 mb-2">{stat.label}</div>
                <div className="text-xl font-semibold text-white mb-2">{stat.value}</div>
                <StatBar value={stat.value} color="bg-red-500" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Technical Staff</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 grid grid-cols-2 gap-4">
          {Object.entries(staff).map(([role, person]) => (
            <div key={role}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400 capitalize">{role.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-white font-medium">{person.name}</span>
              </div>
              <StatBar value={person.skill} color="bg-purple-500" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}