import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import StarRating from '../components/StarRating'

const RD_PROJECTS = [
  {
    id: 'engine_power',
    category: 'Engine',
    label: 'Engine Power Upgrade',
    desc: 'Increase raw horsepower and top speed through internal engine development.',
    stat: 'topSpeed',
    gain: 1,
    cost: 1.5,
    rounds: 2,
    icon: '⚡',
  },
  {
    id: 'aero_package',
    category: 'Aerodynamics',
    label: 'New Aero Package',
    desc: 'Develop advanced winglet and fairing design for better downforce and stability.',
    stat: 'aero',
    gain: 1,
    cost: 1.8,
    rounds: 3,
    icon: '🌬️',
  },
  {
    id: 'chassis_stiffness',
    category: 'Chassis',
    label: 'Chassis Rigidity Program',
    desc: 'Improve chassis material and geometry for better handling and rider feedback.',
    stat: 'chassis',
    gain: 1,
    cost: 1.6,
    rounds: 2,
    icon: '🔩',
  },
  {
    id: 'braking_system',
    category: 'Braking',
    label: 'Carbon Braking System',
    desc: 'Develop next-gen carbon brake components for improved stopping power.',
    stat: 'braking',
    gain: 1,
    cost: 1.2,
    rounds: 2,
    icon: '🛑',
  },
  {
    id: 'electronics_suite',
    category: 'Electronics',
    label: 'Electronics Suite v2',
    desc: 'Develop advanced traction control, engine braking and anti-wheelie algorithms.',
    stat: 'electronics',
    gain: 1,
    cost: 2.0,
    rounds: 3,
    icon: '💻',
  },
  {
    id: 'tyre_management',
    category: 'Electronics',
    label: 'Tyre Management System',
    desc: 'Advanced sensors and algorithms to maximise tyre life during race conditions.',
    stat: 'electronics',
    gain: 1,
    cost: 1.4,
    rounds: 2,
    icon: '🏁',
  },
  {
    id: 'aero_efficiency',
    category: 'Aerodynamics',
    label: 'Drag Reduction Program',
    desc: 'Reduce aerodynamic drag on straights while maintaining corner stability.',
    stat: 'aero',
    gain: 1,
    cost: 1.6,
    rounds: 2,
    icon: '💨',
  },
  {
    id: 'engine_reliability',
    category: 'Engine',
    label: 'Engine Reliability Program',
    desc: 'Improve engine durability and reduce DNF risk through material improvements.',
    stat: 'topSpeed',
    gain: 1,
    cost: 1.0,
    rounds: 1,
    icon: '🔧',
  },
]

const SUPPORT_LEVELS = [
  { id: 'full', label: 'Full Factory Support', desc: 'Latest spec bike, full data sharing, priority parts', costPerRound: 2.0, bikeBonus: 2 },
  { id: 'standard', label: 'Standard Support', desc: 'Current spec bike, shared data, standard parts supply', costPerRound: 1.0, bikeBonus: 1 },
  { id: 'minimal', label: 'Minimal Support', desc: 'Previous spec bike, limited data, basic parts only', costPerRound: 0.3, bikeBonus: 0 },
]

const CATEGORY_COLOR = {
  Engine: 'text-red-400 bg-red-950 border-red-800',
  Aerodynamics: 'text-blue-400 bg-blue-950 border-blue-800',
  Chassis: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  Braking: 'text-orange-400 bg-orange-950 border-orange-800',
  Electronics: 'text-purple-400 bg-purple-950 border-purple-800',
}

export default function RnD() {
  const {
    bike, rdBudget, budget, isFactoryTeam,
    boardTarget, boardPressure,
    satelliteTeams, developBike, updateSatelliteTeam,
    team, round,
  } = useGameStore()

  const [tab, setTab] = useState('development')
  const [activeProjects, setActiveProjects] = useState([])
  const [notification, setNotification] = useState(null)
  const [filterCat, setFilterCat] = useState('all')

  function showNotif(msg, type = 'success') {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  function startProject(project) {
    if (rdBudget < project.cost) {
      showNotif('Not enough R&D budget!', 'error')
      return
    }
    if (activeProjects.find(p => p.id === project.id)) {
      showNotif('Project already in progress!', 'error')
      return
    }
    if (bike[project.stat] >= 20) {
      showNotif(`${project.stat} is already at maximum!`, 'error')
      return
    }
    developBike(project.stat, project.gain, project.cost)
    setActiveProjects(prev => [...prev, {
      ...project,
      startedRound: round,
      completesRound: round + project.rounds,
    }])
    showNotif(`${project.label} started! Completes in ${project.rounds} round${project.rounds > 1 ? 's' : ''}.`)
  }

  function setSupportLevel(teamId, levelId) {
    updateSatelliteTeam(teamId, { supportLevel: levelId })
    showNotif('Support level updated.')
  }

  const bikeOverall = Math.round(
    (bike.topSpeed + bike.aero + bike.chassis + bike.braking + bike.electronics) / 5
  )

  const filteredProjects = RD_PROJECTS.filter(p =>
    filterCat === 'all' ? true : p.category === filterCat
  )

  const categories = ['all', ...new Set(RD_PROJECTS.map(p => p.category))]

  if (!isFactoryTeam) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-4xl mb-4">🏭</div>
        <div className="text-xl font-semibold text-white mb-2">Factory Teams Only</div>
        <div className="text-base text-gray-500 max-w-sm">
          R&D and satellite management is exclusive to factory teams.
          As an independent team, you can request factory support from the Contracts screen.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">R&D & Factory Management</h2>
          <p className="text-sm text-gray-500">{team.name} · {team.manufacturer} · Season 2026</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-center">
            <div className="text-sm text-gray-500">R&D Budget</div>
            <div className="text-lg font-semibold text-purple-400">€{rdBudget}M</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-center">
            <div className="text-sm text-gray-500">Race Budget</div>
            <div className="text-lg font-semibold text-green-400">€{budget}M</div>
          </div>
        </div>
      </div>

      {boardTarget && (
        <div className={`border rounded-xl p-4 ${
          boardPressure >= 70 ? 'bg-red-950 border-red-700' :
          boardPressure >= 40 ? 'bg-amber-950 border-amber-700' :
          'bg-gray-900 border-gray-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-white mb-0.5">Board Target</div>
              <div className="text-sm text-gray-400">{boardTarget.label}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Board Pressure</div>
              <div className={`text-2xl font-bold ${
                boardPressure >= 70 ? 'text-red-400' :
                boardPressure >= 40 ? 'text-amber-400' : 'text-green-400'
              }`}>{boardPressure}%</div>
            </div>
          </div>
          <div className="mt-3 bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                boardPressure >= 70 ? 'bg-red-500' :
                boardPressure >= 40 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${boardPressure}%` }}
            />
          </div>
          {boardPressure >= 70 && (
            <div className="text-sm text-red-400 mt-2 font-medium">
              ⚠ Warning — continued poor results may result in dismissal
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {['development', 'bike', 'satellite'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-base font-medium transition-colors capitalize ${
              tab === t ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            {t === 'development' ? 'R&D Projects' :
             t === 'bike' ? 'Current Bike' : 'Independent Teams'}
          </button>
        ))}
      </div>

      {notification && (
        <div className={`px-4 py-3 rounded-lg text-base font-medium ${
          notification.type === 'success'
            ? 'bg-green-900 border border-green-700 text-green-300'
            : 'bg-red-900 border border-red-700 text-red-300'
        }`}>
          {notification.msg}
        </div>
      )}

      {tab === 'development' && (
        <div className="space-y-4">
          {activeProjects.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Active Projects ({activeProjects.length})
              </div>
              <div className="space-y-2">
                {activeProjects.map(p => (
                  <div key={p.id} className="bg-gray-900 border border-purple-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{p.icon}</span>
                      <div>
                        <div className="text-base font-medium text-white">{p.label}</div>
                        <div className="text-sm text-gray-500">
                          Started round {p.startedRound} · Completes round {p.completesRound}
                        </div>
                      </div>
                    </div>
                    <div className="text-purple-400 font-semibold text-sm">In Progress</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filterCat === cat ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredProjects.map(project => {
              const isActive = activeProjects.find(p => p.id === project.id)
              const canAfford = rdBudget >= project.cost
              const maxed = bike[project.stat] >= 20
              const catColor = CATEGORY_COLOR[project.category]

              return (
                <div
                  key={project.id}
                  className={`bg-gray-900 border rounded-xl p-4 transition-all ${
                    isActive ? 'border-purple-700 opacity-60' :
                    maxed ? 'border-gray-800 opacity-40' :
                    'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{project.icon}</span>
                      <div>
                        <div className="text-base font-semibold text-white">{project.label}</div>
                        <span className={`text-xs px-2 py-0.5 rounded border ${catColor}`}>
                          {project.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-400 leading-relaxed mb-3">{project.desc}</div>

                  <div className="flex items-center gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Effect: </span>
                      <span className="text-green-400 font-medium">
                        +{project.gain} {project.stat === 'topSpeed' ? 'Top Speed' :
                          project.stat.charAt(0).toUpperCase() + project.stat.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration: </span>
                      <span className="text-white">{project.rounds} round{project.rounds > 1 ? 's' : ''}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cost: </span>
                      <span className={canAfford ? 'text-purple-400 font-semibold' : 'text-red-400 font-semibold'}>
                        €{project.cost}M
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => startProject(project)}
                    disabled={!!isActive || !canAfford || maxed}
                    className={`w-full py-2 rounded-lg text-base font-semibold transition-colors ${
                      isActive ? 'bg-purple-900 text-purple-400 cursor-not-allowed' :
                      maxed ? 'bg-gray-800 text-gray-600 cursor-not-allowed' :
                      !canAfford ? 'bg-gray-800 text-gray-600 cursor-not-allowed' :
                      'bg-purple-700 hover:bg-purple-600 text-white'
                    }`}
                  >
                    {isActive ? 'In Progress' :
                     maxed ? 'Already Maxed' :
                     !canAfford ? 'Insufficient R&D Budget' :
                     'Start Project'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'bike' && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-base font-semibold text-white">{bike.model}</div>
                <div className="text-sm text-gray-500 mt-0.5">Factory spec — full development access</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Overall</div>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating value={bikeOverall} max={20} size="md" />
                  <span className="text-white font-bold text-lg">{bikeOverall}/20</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {[
                { label: 'Top Speed', key: 'topSpeed' },
                { label: 'Aero', key: 'aero' },
                { label: 'Chassis', key: 'chassis' },
                { label: 'Braking', key: 'braking' },
                { label: 'Electronics', key: 'electronics' },
              ].map(stat => (
                <div key={stat.key} className="bg-gray-800 rounded-xl p-3 text-center">
                  <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                  <div className={`text-2xl font-bold mb-1 ${
                    bike[stat.key] >= 19 ? 'text-green-400' :
                    bike[stat.key] >= 16 ? 'text-white' :
                    bike[stat.key] <= 13 ? 'text-red-400' : 'text-white'
                  }`}>{bike[stat.key]}</div>
                  <StarRating value={bike[stat.key]} max={20} size="sm" />
                  {bike[stat.key] >= 20 && (
                    <div className="text-xs text-green-400 mt-1 font-medium">MAX</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-base font-semibold text-white mb-3">Development History</div>
            {activeProjects.length === 0 ? (
              <div className="text-sm text-gray-600 py-4 text-center">No active development projects</div>
            ) : (
              <div className="space-y-2">
                {activeProjects.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-800 last:border-0">
                    <span className="text-gray-300">{p.label}</span>
                    <span className="text-purple-400">Round {p.startedRound} → {p.completesRound}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'satellite' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-white">Independent Teams</div>
              <div className="text-sm text-gray-500 mt-0.5">
                Teams running {team.manufacturer} machinery. Set their support level and bike spec.
              </div>
            </div>
          </div>

          {satelliteTeams.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <div className="text-gray-600 text-base">No independent teams registered</div>
              <div className="text-gray-700 text-sm mt-1">
                Use Contracts screen to send manufacturer offers to independent teams
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {satelliteTeams.map(satTeam => {
                const currentSupport = SUPPORT_LEVELS.find(s => s.id === satTeam.supportLevel) || SUPPORT_LEVELS[1]
                return (
                  <div key={satTeam.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-base font-semibold text-white">{satTeam.name}</div>
                        <div className="text-sm text-gray-500">{satTeam.manufacturer} Independent</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Support cost</div>
                        <div className="text-base font-semibold text-purple-400">
                          €{currentSupport.costPerRound}M/round
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {SUPPORT_LEVELS.map(level => (
                        <div
                          key={level.id}
                          onClick={() => setSupportLevel(satTeam.id, level.id)}
                          className={`border rounded-xl p-3 cursor-pointer transition-all ${
                            satTeam.supportLevel === level.id
                              ? 'border-red-600 bg-red-950 bg-opacity-30'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <div className="text-base font-semibold text-white mb-1">{level.label}</div>
                          <div className="text-sm text-gray-500 leading-relaxed mb-2">{level.desc}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-400 font-medium">€{level.costPerRound}M/round</span>
                            <span className="text-sm text-green-400">+{level.bikeBonus} bike</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="bg-amber-950 border border-amber-800 rounded-xl p-4">
            <div className="text-base font-semibold text-amber-300 mb-1">Send Manufacturer Offer</div>
            <div className="text-sm text-amber-500 leading-relaxed">
              To offer your machinery to independent teams, go to the Contracts screen and use the Manufacturer Offers section.
              Accepted teams will appear here for support management.
            </div>
          </div>
        </div>
      )}

    </div>
  )
}