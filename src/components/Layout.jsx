import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'bike', label: 'Bike & Upgrades' },
  { id: 'race', label: 'Race' },
  { id: 'contracts', label: 'Contracts' },
]

export default function Layout({ children, currentScreen, setScreen, onMainMenu }) {
  const { team, budget, round, season, results, resetGame } = useGameStore()
  const [showReset, setShowReset] = useState(false)

  const totalPoints = results.reduce((acc, r) => acc + r.points, 0) + 87

  function handleReset() {
    resetGame()
    setShowReset(false)
    setScreen('dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      <header className="border-b border-gray-800 px-6 py-3 flex items-center gap-6">
        <div>
          <div className="text-sm font-semibold text-white">{team.name}</div>
          <div className="text-xs text-gray-500">{team.manufacturer} · {team.type === 'satellite' ? 'Satellite' : 'Factory'}</div>
        </div>

        <div className="flex gap-4 ml-2">
          <div className="text-center">
            <div className="text-xs text-gray-500">Budget</div>
            <div className="text-sm font-semibold text-green-400">€{budget}M</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Round</div>
            <div className="text-sm font-semibold">{round}/20</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Points</div>
            <div className="text-sm font-semibold text-yellow-400">{totalPoints}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Season</div>
            <div className="text-sm font-semibold">{season}</div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="text-xs text-gray-600 italic">Auto-saved</div>
          <button
            onClick={() => setShowReset(true)}
            className="text-xs text-gray-600 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Main Menu
          </button>
        </div>
      </header>

      {showReset && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-80">
            <div className="text-lg font-semibold mb-2">Start New Game?</div>
            <div className="text-sm text-gray-400 mb-5">All progress will be lost. This cannot be undone.</div>
            <div className="flex gap-3">
              <button onClick={handleReset} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors">
                New Game
              </button>
              <button onClick={() => setShowReset(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        <aside className="w-48 border-r border-gray-800 p-4 flex flex-col gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                currentScreen === item.id
                  ? 'bg-red-600 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  )
}