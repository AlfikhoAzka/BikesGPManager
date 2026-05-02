import { useState } from 'react'
import StarRating from '../components/StarRating'

const TEAMS = [
  {
    id: 'ducati_factory',
    name: 'Ducati Lenovo',
    manufacturer: 'Ducati',
    type: 'factory',
    budget: 28.0,
    rdBudget: 8.0,
    difficulty: 'Very Hard',
    diffColor: 'text-red-600',
    bike: { topSpeed: 19, aero: 18, chassis: 18, braking: 19, electronics: 19 },
    riders: ['Marc Marquez', 'Francesco Bagnaia'],
    description: 'The dominant force in MotoGP. Highest expectations — win or face board pressure.',
    perks: ['Full R&D control', 'independent team management', 'Manufacturer offers to independents'],
    minTarget: 'Podium every race',
    locked: false,
  },
  {
    id: 'aprilia_factory',
    name: 'Aprilia Racing',
    manufacturer: 'Aprilia',
    type: 'factory',
    budget: 24.0,
    rdBudget: 6.0,
    difficulty: 'Very Hard',
    diffColor: 'text-red-600',
    bike: { topSpeed: 18, aero: 17, chassis: 17, braking: 17, electronics: 18 },
    riders: ['Marco Bezzecchi', 'Jorge Martin'],
    description: 'Rising Italian manufacturer with championship ambitions. Strong 2026 season.',
    perks: ['Full R&D control', 'independent team management', 'Manufacturer offers to independents'],
    minTarget: 'Top 5 every race',
    locked: false,
  },
  {
    id: 'ktm_factory',
    name: 'Red Bull KTM Factory',
    manufacturer: 'KTM',
    type: 'factory',
    budget: 22.0,
    rdBudget: 5.5,
    difficulty: 'Hard',
    diffColor: 'text-red-400',
    bike: { topSpeed: 17, aero: 15, chassis: 16, braking: 16, electronics: 15 },
    riders: ['Pedro Acosta', 'Brad Binder'],
    description: 'Austrian outfit with a young talented lineup. R&D focused, fighting for top spots.',
    perks: ['Full R&D control', 'independent team management', 'Manufacturer offers to independents'],
    minTarget: 'Top 6 every race',
    locked: false,
  },
  {
    id: 'honda_factory',
    name: 'Honda HRC',
    manufacturer: 'Honda',
    type: 'factory',
    budget: 26.0,
    rdBudget: 7.0,
    difficulty: 'Hard',
    diffColor: 'text-red-400',
    bike: { topSpeed: 16, aero: 14, chassis: 15, braking: 15, electronics: 14 },
    riders: ['Luca Marini', 'Joan Mir'],
    description: 'Legendary manufacturer in rebuilding phase. High budget, but bike needs development.',
    perks: ['Full R&D control', 'independent team management', 'Manufacturer offers to independents'],
    minTarget: 'Top 8 every race',
    locked: false,
  },
  {
    id: 'yamaha_factory',
    name: 'Monster Energy Yamaha',
    manufacturer: 'Yamaha',
    type: 'factory',
    budget: 23.0,
    rdBudget: 6.0,
    difficulty: 'Hard',
    diffColor: 'text-red-400',
    bike: { topSpeed: 16, aero: 15, chassis: 16, braking: 15, electronics: 15 },
    riders: ['Fabio Quartararo', 'Alex Rins'],
    description: 'Japanese giant transitioning to V4 engine. Exciting rebuild period with new tech.',
    perks: ['Full R&D control', 'independent team management', 'Manufacturer offers to independents'],
    minTarget: 'Top 8 every race',
    locked: false,
  },

  {
    id: 'vr46',
    name: 'Pertamina VR46',
    manufacturer: 'Ducati',
    type: 'independent',
    budget: 14.2,
    rdBudget: 0,
    difficulty: 'Medium',
    diffColor: 'text-yellow-400',
    bike: { topSpeed: 17, aero: 15, chassis: 16, braking: 16, electronics: 14 },
    riders: ['Fabio Di Giannantonio', 'Franco Morbidelli'],
    description: "Valentino Rossi's team. Strong Ducati independent base with room to grow.",
    perks: ['Can request factory support', 'Negotiate manufacturer switch', 'Path to factory seat'],
    minTarget: 'Points every race',
    locked: false,
  },
  {
    id: 'pramac',
    name: 'Prima Pramac Yamaha',
    manufacturer: 'Yamaha',
    type: 'independent',
    budget: 16.5,
    rdBudget: 0,
    difficulty: 'Medium',
    diffColor: 'text-yellow-400',
    bike: { topSpeed: 16, aero: 14, chassis: 15, braking: 15, electronics: 14 },
    riders: ['Toprak Razgatlioglu', 'Jack Miller'],
    description: 'Well-funded independent with a WSBK star making his MotoGP debut. High potential.',
    perks: ['Can request factory support', 'Negotiate manufacturer switch', 'Path to factory seat'],
    minTarget: 'Points every race',
    locked: false,
  },
  {
    id: 'tech3',
    name: 'Red Bull KTM Tech3',
    manufacturer: 'KTM',
    type: 'independent',
    budget: 13.8,
    rdBudget: 0,
    difficulty: 'Hard',
    diffColor: 'text-red-400',
    bike: { topSpeed: 15, aero: 14, chassis: 15, braking: 14, electronics: 13 },
    riders: ['Maverick Vinales', 'Enea Bastianini'],
    description: "KTM's development team. Good R&D access and strong experienced riders.",
    perks: ['Can request factory support', 'Negotiate manufacturer switch', 'Path to factory seat'],
    minTarget: 'Points every race',
    locked: false,
  },
  {
    id: 'trackhouse',
    name: 'Trackhouse Racing',
    manufacturer: 'Aprilia',
    type: 'independent',
    budget: 13.0,
    rdBudget: 0,
    difficulty: 'Hard',
    diffColor: 'text-red-400',
    bike: { topSpeed: 15, aero: 14, chassis: 14, braking: 14, electronics: 13 },
    riders: ['Raul Fernandez', 'Ai Ogura'],
    description: 'American-owned Aprilia independent. Development potential with two hungry riders.',
    perks: ['Can request factory support', 'Negotiate manufacturer switch', 'Path to factory seat'],
    minTarget: 'Points every race',
    locked: false,
  },
  {
    id: 'lcr',
    name: 'LCR Honda',
    manufacturer: 'Honda',
    type: 'independent',
    budget: 12.5,
    rdBudget: 0,
    difficulty: 'Very Hard',
    diffColor: 'text-red-600',
    bike: { topSpeed: 14, aero: 13, chassis: 13, braking: 14, electronics: 12 },
    riders: ['Johann Zarco', 'Diogo Moreira'],
    description: 'Honda independent during a rebuilding phase. A rookie and a veteran — high challenge.',
    perks: ['Can request factory support', 'Negotiate manufacturer switch', 'Path to factory seat'],
    minTarget: 'Points occasionally',
    locked: false,
  },

  {
    id: 'gresini',
    name: 'Gresini Racing',
    manufacturer: 'Ducati',
    type: 'independent',
    budget: 11.0,
    rdBudget: 0,
    difficulty: 'Hard',
    diffColor: 'text-red-400',
    bike: { topSpeed: 16, aero: 14, chassis: 15, braking: 15, electronics: 14 },
    riders: ['Alex Marquez', 'Fermin Aldeguer'],
    description: 'Independent team running older Ducati spec. Strong riders, tight budget.',
    perks: ['Full budget control', 'Can switch manufacturer freely', 'No factory pressure'],
    minTarget: 'No mandatory target',
    locked: false,
  },
]

const TYPE_INFO = {
  factory: {
    label: 'Factory',
    color: 'bg-purple-900 text-purple-300 border-purple-700',
    desc: 'You control R&D. Manage independent teams. High pressure from the board.',
  },
  independent: {
    label: 'Independent',
    color: 'bg-orange-900 text-orange-300 border-orange-700',
    desc: 'Full freedom. No factory pressure. Switch manufacturers freely.',
  },
}

const DIFF_ORDER = { 'Easy': 0, 'Medium': 1, 'Hard': 2, 'Very Hard': 3 }

function StatMini({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-sm text-gray-500 mb-1">
        {label === 'topSpeed' ? 'Spd' :
         label === 'electronics' ? 'Elec' :
         label === 'chassis' ? 'Cha' :
         label === 'braking' ? 'Brk' : 'Aero'}
      </div>
      <div className="text-base font-semibold text-white">{value}</div>
      <StarRating value={value} max={20} size="sm" />
    </div>
  )
}

export default function TeamSelection({ onConfirm, onBack }) {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [hoveredTeam, setHoveredTeam] = useState(null)

  const filtered = TEAMS.filter(t =>
    filter === 'all' ? true : t.type === filter
  )

  const bikeOverall = t => Math.round(
    (t.bike.topSpeed + t.bike.aero + t.bike.chassis + t.bike.braking + t.bike.electronics) / 5
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">

        <button
          onClick={onBack}
          className="text-gray-500 hover:text-white text-sm mb-8 flex items-center gap-2 transition-colors"
        >
          ← Back
        </button>

        <div className="text-sm font-semibold tracking-[0.3em] text-red-500 uppercase mb-2">Step 2 of 2</div>
        <h2 className="text-3xl font-bold text-white mb-1">Choose Your Team</h2>
        <p className="text-base text-gray-500 mb-6">Factory teams offer R&D control and independent management. Independent teams offer a different path to the top.</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {Object.entries(TYPE_INFO).map(([type, info]) => (
            <div key={type} className={`rounded-xl p-4 border ${
              filter === type ? info.color : 'border-gray-800 bg-gray-900'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${info.color}`}>{info.label}</span>
              </div>
              <div className="text-sm text-gray-400 leading-relaxed">{info.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-5">
          {['all', 'factory', 'satellite', 'independent'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-base font-medium transition-colors capitalize ${
                filter === f ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              {f === 'all' ? `All Teams (${TEAMS.length})` :
               f === 'factory' ? `Factory (${TEAMS.filter(t => t.type === 'factory').length})` :
               f === 'satellite' ? `Satellite (${TEAMS.filter(t => t.type === 'satellite').length})` :
               `Independent (${TEAMS.filter(t => t.type === 'independent').length})`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {filtered.map(team => {
            const isSelected = selected?.id === team.id
            const typeInfo = TYPE_INFO[team.type]
            const overall = bikeOverall(team)

            return (
              <div
                key={team.id}
                onClick={() => setSelected(isSelected ? null : team)}
                onMouseEnter={() => setHoveredTeam(team.id)}
                onMouseLeave={() => setHoveredTeam(null)}
                className={`bg-gray-900 border rounded-xl p-5 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-red-600 ring-1 ring-red-600'
                    : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-base font-semibold text-white">{team.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{team.manufacturer}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <span className={`text-sm font-semibold ${team.diffColor}`}>{team.difficulty}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-400 leading-relaxed mb-4">{team.description}</div>

                <div className="grid grid-cols-5 gap-2 mb-4">
                  {Object.entries(team.bike).map(([stat, val]) => (
                    <StatMini key={stat} label={stat} value={val} />
                  ))}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <StarRating value={overall} max={20} size="sm" />
                    <span className="text-sm text-gray-500">Bike overall</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Budget: </span>
                    <span className="text-green-400 font-semibold">€{team.budget}M</span>
                    {team.type === 'factory' && (
                      <span className="text-purple-400 font-semibold ml-2">+€{team.rdBudget}M R&D</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-3 space-y-2">
                  <div className="text-sm text-gray-500">
                    Riders: <span className="text-gray-300">{team.riders.join(' · ')}</span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Perks</div>
                      <div className="flex flex-wrap gap-1">
                        {team.perks.map((perk, i) => (
                          <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-lg">
                            {perk}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Target</div>
                      <div className={`text-sm font-medium ${
                        team.minTarget === 'No mandatory target' ? 'text-green-400' :
                        team.difficulty === 'Very Hard' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {team.minTarget}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {selected && (
          <div className="sticky bottom-6 flex items-center justify-between bg-gray-900 border border-red-600 rounded-xl px-5 py-4 shadow-2xl">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm text-gray-400">Selected team</div>
                <div className="text-base font-semibold text-white">{selected.name}</div>
                <div className="text-sm text-gray-500">{selected.manufacturer} · {TYPE_INFO[selected.type].label}</div>
              </div>
              <div className="h-10 w-px bg-gray-800" />
              <div>
                <div className="text-sm text-gray-400">Budget</div>
                <div className="text-base font-semibold text-green-400">€{selected.budget}M</div>
              </div>
              {selected.type === 'factory' && (
                <>
                  <div className="h-10 w-px bg-gray-800" />
                  <div>
                    <div className="text-sm text-gray-400">R&D Budget</div>
                    <div className="text-base font-semibold text-purple-400">€{selected.rdBudget}M</div>
                  </div>
                </>
              )}
              <div className="h-10 w-px bg-gray-800" />
              <div>
                <div className="text-sm text-gray-400">Min. target</div>
                <div className={`text-base font-semibold ${
                  selected.minTarget === 'No mandatory target' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {selected.minTarget}
                </div>
              </div>
            </div>
            <button
              onClick={() => onConfirm(selected)}
              className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-semibold text-base transition-all hover:scale-105 whitespace-nowrap"
            >
              Start Season →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}