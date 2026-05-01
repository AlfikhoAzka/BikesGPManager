import { useState } from 'react'
import StarRating from '../components/StarRating'

const TEAMS = [
  {
    id: 'vr46',
    name: 'Pertamina VR46',
    manufacturer: 'Ducati',
    type: 'satellite',
    budget: 14.2,
    difficulty: 'Medium',
    diffColor: 'text-yellow-400',
    bike: { topSpeed: 16, aero: 14, chassis: 15, braking: 15, electronics: 13 },
    riders: ['Fabio Q.', 'Alex E.'],
    description: "Valentino Rossi's satellite team. Strong Ducati base, room to grow.",
  },
  {
    id: 'pramac',
    name: 'Prima Pramac',
    manufacturer: 'Ducati',
    type: 'satellite',
    budget: 16.5,
    difficulty: 'Medium',
    diffColor: 'text-yellow-400',
    bike: { topSpeed: 17, aero: 15, chassis: 16, braking: 16, electronics: 15 },
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
    bike: { topSpeed: 15, aero: 14, chassis: 14, braking: 14, electronics: 13 },
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
    bike: { topSpeed: 14, aero: 13, chassis: 13, braking: 14, electronics: 12 },
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
    bike: { topSpeed: 15, aero: 14, chassis: 15, braking: 14, electronics: 13 },
    riders: ['P. Acosta', 'A. Fernandez'],
    description: "KTM's development team. Good R&D access and young talent pipeline.",
  },
  {
    id: 'gresini',
    name: 'Gresini Racing',
    manufacturer: 'Ducati',
    type: 'independent',
    budget: 11.0,
    difficulty: 'Hard',
    diffColor: 'text-red-400',
    bike: { topSpeed: 16, aero: 14, chassis: 15, braking: 15, electronics: 14 },
    riders: ['M. Marquez', 'A. Marquez'],
    description: 'Independent team with older Ducati spec. Strong rider lineup.',
  },
]


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
                    <StarRating value={val} max={20} size="md" />
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