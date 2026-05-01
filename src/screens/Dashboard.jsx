import { useGameStore } from '../store/gameStore'
import StarRating from '../components/StarRating'

function RiderCard({ rider }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold">
          #{rider.number}
        </div>
        <div>
          <div className="font-semibold text-white">{rider.name}</div>
          <div className="text-base text-gray-500">
            Contract: {rider.contractYears} yr · €{rider.salary}M/yr
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-base text-gray-500 mb-1">Overall</div>
          <StarRating value={rider.overall} max={20} size="md" />
        </div>
      </div>

      <div className="space-y-2.5">
        {[
          { label: 'Pace', value: rider.pace },
          { label: 'Consistency', value: rider.consistency },
          { label: 'Wet Skill', value: rider.wetSkill },
          { label: 'Mental', value: rider.mentalState },
          { label: 'Fitness', value: rider.fitness },
        ].map(stat => (
          <div key={stat.label} className="flex items-center justify-between">
            <span className="text-base text-gray-400">{stat.label}</span>
            <StarRating value={stat.value} max={20} size="md" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { team, budget, riders, bike, staff, round, season, manager, championshipPoints, championshipPosition } = useGameStore()

  const bikeOverall = Math.round(
    (bike.topSpeed + bike.aero + bike.chassis + bike.braking + bike.electronics) / 5
  )

  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Dashboard</h2>
          <p className="text-sm text-gray-500">
            Round {round}/20 · {team.manufacturer} {bike.spec === 'satellite' ? 'Satellite' : 'Factory'} · Season {season}
          </p>
        </div>
        {manager && (
          <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">
              {manager.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div className="text-base font-medium text-white">{manager.name}</div>
              <div className="text-sm text-gray-500">{manager.nationality} · Team Manager</div>
            </div>
          </div>
        )}
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
              <span className="text-white font-semibold">{bikeOverall}/20</span>
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