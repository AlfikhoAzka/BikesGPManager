import { useState } from 'react'
import { useGameStore } from '../store/gameStore'


export default function Layout({ children, currentScreen, setScreen, onMainMenu, onNewGame }) {
  const { team, budget, round, season, results, resetGame, unreadCount, isFactoryTeam } = useGameStore()

  const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'bike', label: 'Bike & Upgrades' },
  { id: 'race', label: 'Race' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'messages', label: 'Messages' },
  ...(isFactoryTeam ? [{ id: 'rnd', label: 'R&D' }] : []),
]

  const [showReset, setShowReset] = useState(false)

  const totalPoints = results.reduce((acc, r) => acc + r.points, 0) + 87

  function handleReset() {
    resetGame()
    setShowReset(false)
    onCreateManager?.()
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-8">
        <div>
          <div className="text-lg font-semibold text-white">{team.name}</div>
          <div className="text-base text-gray-500">{team.manufacturer} · {team.type === 'satellite' ? 'Satellite' : 'Factory'}</div>
        </div>

        <div className="flex gap-6 ml-2">
          <div className="text-center">
            <div className="text-base text-gray-500">Budget</div>
            <div className="text-lg font-semibold text-green-400">€{budget}M</div>
          </div>
          <div className="text-center">
            <div className="text-base text-gray-500">Round</div>
            <div className="text-lg font-semibold">{round}/20</div>
          </div>
          <div className="text-center">
            <div className="text-base text-gray-500">Points</div>
            <div className="text-lg font-semibold text-yellow-400">{totalPoints}</div>
          </div>
          <div className="text-center">
            <div className="text-base text-gray-500">Season</div>
            <div className="text-lg font-semibold">{season}</div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="text-base text-gray-600 italic">Auto-saved</div>
          <button
            onClick={() => setShowReset(true)}
            className="text-base text-gray-500 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Main Menu
          </button>
        </div>
      </header>

      {showReset && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-96">
            <div className="text-xl font-semibold mb-2">Pause Menu</div>
            <div className="text-base text-gray-400 mb-6">Your progress is auto-saved.</div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { onMainMenu?.(); setShowReset(false) }}
                className="w-full bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg text-base font-semibold transition-colors"
              >
                Main Menu
              </button>
              <button
                onClick={() => { onNewGame?.(); setShowReset(false) }}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-base transition-colors"
              >
                New Game
              </button>
              <button
                onClick={() => setShowReset(false)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-base transition-colors"
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        <aside className="w-52 border-r border-gray-800 p-4 flex flex-col gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`text-left px-4 py-3 rounded-lg text-base transition-colors relative ${
                currentScreen === item.id
                  ? 'bg-red-600 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.label}
              {item.id === 'messages' && unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  )
}