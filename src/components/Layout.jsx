import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'bike', label: 'Motor & Upgrade' },
  { id: 'race', label: 'Race' },
  { id: 'contracts', label: 'Kontrak' },
]

export default function Layout({ children, currentScreen, setScreen }) {
  const { team, budget, round, season } = useGameStore()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      <header className="border-b border-gray-800 px-6 py-3 flex items-center gap-6">
        <div>
          <div className="text-sm font-semibold text-white">{team.name}</div>
          <div className="text-xs text-gray-500">{team.manufacturer} · {team.spec === 'satellite' ? 'Satelit' : 'Factory'}</div>
        </div>

        <div className="flex gap-4 ml-4">
          <div className="text-center">
            <div className="text-xs text-gray-500">Budget</div>
            <div className="text-sm font-semibold text-green-400">€{budget}M</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Round</div>
            <div className="text-sm font-semibold">{round}/20</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Musim</div>
            <div className="text-sm font-semibold">{season}</div>
          </div>
        </div>
      </header>

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