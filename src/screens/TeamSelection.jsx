import { useState } from 'react'

const TEAMS = [
  {
    id: 'vr46',
    name: 'Pertamina VR46',
    manufacturer: 'Ducati',
    type: 'satellite',
    budget: 14.2,
    difficulty: 'Medium',
    diffColor: 'text-yellow-400',
    bike: { topSpeed: 82, aero: 75, chassis: 78, braking: 80, electronics: 71 },
    riders: ['Fabio Q.', 'Alex E.'],
    description: 'Valentino Rossi\'s satellite team. Strong Ducati base, room to grow.',
  },
  {
    id: 'pramac',
    name: 'Prima Pramac',
    manufacturer: 'Ducati',
    type: 'satellite',
    budget: 16.5,
    difficulty: 'Medium',
    diffColor: 'text-yellow-400',
    bike: { topSpeed: 85, aero: 80, chassis: 81, braking: 83, electronics: 79 },
    riders: ['Jorge M.', 'Franco M.'],
    description: 'Well-funded satellite team with near-factory spec Ducati.',
  },
  {
    id: 'trackhouse',
    name: 'Trackhouse Racing',
    manufacturer: 'Aprilia',
    type: 'satellite',
    budget: 13.0,
    difficulty: 'Hard',
    diffColor: 'text-red-400',
    bike: { topSpeed: 80, aero: 78, chassis: 76, braking: 79, electronics: 75 },
    riders: ['M. Oliveira', 'R. Fernandez'],
    description: 'American-owned team. Aprilia satellite with development potential.',
  },
  {
    id: 'lcr',
    name: 'LCR Honda',
    manufacturer: 'Honda',
    type: 'satellite',
    budget: 12.5,
    difficulty: 'Very Hard',
    diffColor: 'text-red-600',
    bike: { topSpeed: 78, aero: 72, chassis: 74, braking: 76, electronics: 70 },
    riders: ['A. Rins', 'T. Nakagami'],
    description: 'Honda satellite during a rebuilding phase. High challenge, high reward.',
  },
  {
    id: 'tech3',
    name: 'Red Bull KTM Tech3',
    manufacturer: 'KTM',
    type: 'satellite',
    budget: 13.8,
    difficulty: 'Hard',
    diffColor: 'text-red-400',
    bike: { topSpeed: 81, aero: 76, chassis: 79, braking: 78, electronics: 74 },
    riders: ['P. Acosta', 'A. Fernandez'],
    description: 'KTM\'s development team. Good R&D access and young talent pipeline.',
  },
  {
    id: 'gresini',
    name: 'Gresini Racing',
    manufacturer: 'Ducati',
    type: 'independent',
    budget: 11.0,
    difficulty: 'Hard',
    diffColor: 'text-red-400',
    bike: { topSpeed: 83, aero: 77, chassis: 79, braking: 81, electronics: 76 },
    riders: ['M. Marquez', 'A. Marquez'],
    description: 'Independent team with older Ducati spec. Strong rider lineup.',
  },
]

function StarRating({ value, max = 100 }) {
  const stars = Math.round((value / max) * 5)
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3 h-3 ${i <= stars ? 'text-yellow-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

export default function TeamSelection({ onConfirm, onBack }) {
  const [selected, setSelected] = useState(null)

  const bikeOverall = t => Math.round(
    (t.bike.topSpeed + t.bike.aero + t.bike.chassis + t.bike.braking + t.bike.electronics) / 5
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">

        <button onClick={onBack} className="text-gray-600 hover:text-white text-sm mb-8 flex items-center gap-2 transition-colors">
          ← Back
        </button>

        <div className="text-xs font-semibold tracking-[0.3em] text-red-500 uppercase mb-2">Step 2 of 2</div>
        <h2 className="text-3xl font-bold text-white mb-1">Choose Your Team</h2>
        <p className="text-sm text-gray-500 mb-8">Select a team to manage for the 2025 season.</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {TEAMS.map(team => (
            <div
              key={team.id}
              onClick={() => setSelected(team)}
              className={`bg-gray-900 border rounded-xl p-5 cursor-pointer transition-all hover:border-gray-600 ${
                selected?.id === team.id ? 'border-red-600 ring-1 ring-red-600' : 'border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-white">{team.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{team.manufacturer} · {team.type === 'satellite' ? 'Satellite' : 'Independent'}</div>
                </div>
                <span className={`text-xs font-semibold ${team.diffColor}`}>{team.difficulty}</span>
              </div>

              <div className="text-xs text-gray-400 leading-relaxed mb-4">{team.description}</div>

              <div className="grid grid-cols-5 gap-2 mb-4">
                {Object.entries(team.bike).map(([stat, val]) => (
                  <div key={stat} className="text-center">
                    <div className="text-xs text-gray-600 mb-1">
                      {stat === 'topSpeed' ? 'Spd' : stat === 'electronics' ? 'Elec' : stat === 'chassis' ? 'Cha' : stat === 'braking' ? 'Brk' : 'Aero'}
                    </div>
                    <div className="text-sm font-semibold text-white">{val}</div>
                    <StarRating value={val} />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Riders: <span className="text-gray-300">{team.riders.join(', ')}</span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-500">Budget: </span>
                  <span className="text-green-400 font-semibold">€{team.budget}M</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="flex items-center justify-between bg-gray-900 border border-red-600 rounded-xl px-5 py-4">
            <div>
              <div className="text-sm text-gray-400">Selected team</div>
              <div className="font-semibold text-white">{selected.name} — {selected.manufacturer}</div>
            </div>
            <button
              onClick={() => onConfirm(selected)}
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-105"
            >
              Start Season →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}