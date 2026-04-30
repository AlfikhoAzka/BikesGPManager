import { useGameStore } from '../store/gameStore'

export default function MainMenu({ onNewGame, onResume }) {
  const { results, round } = useGameStore()
  const hasSave = round > 1 || results.length > 0

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-red-900 opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-red-800 opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-red-700 opacity-10" />
      </div>

      <div className="text-center mb-12 z-10">
        <div className="text-xs font-semibold tracking-[0.3em] text-red-500 uppercase mb-3">
          The Manager Experience
        </div>
        <h1 className="text-6xl font-bold text-white tracking-tight mb-2">
          MotoGP
        </h1>
        <h2 className="text-6xl font-bold text-red-500 tracking-tight">
          Manager
        </h2>
        <div className="text-sm text-gray-600 mt-4">Season 2025</div>
      </div>

      <div className="flex flex-col gap-2 w-56 z-10">
        <button
          onClick={onNewGame}
          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all hover:scale-105 text-sm tracking-wide"
        >
          New Game
        </button>

        <button
          onClick={hasSave ? onResume : null}
          disabled={!hasSave}
          className={`w-full py-3 font-semibold rounded-xl transition-all text-sm tracking-wide border ${
            hasSave
              ? 'border-gray-700 text-white hover:bg-gray-800 hover:scale-105'
              : 'border-gray-800 text-gray-700 cursor-not-allowed'
          }`}
        >
          Resume
        </button>

        <button
          disabled
          className="w-full py-3 font-semibold rounded-xl text-sm tracking-wide border border-gray-800 text-gray-700 cursor-not-allowed"
        >
          Load Game
        </button>

        <button
          disabled
          className="w-full py-3 font-semibold rounded-xl text-sm tracking-wide border border-gray-800 text-gray-700 cursor-not-allowed"
        >
          Settings
        </button>

        <div className="border-t border-gray-800 my-1" />

        <button
          onClick={() => window.close()}
          className="w-full py-3 text-gray-600 hover:text-red-400 font-semibold rounded-xl transition-colors text-sm tracking-wide"
        >
          Quit Game
        </button>
      </div>

      <div className="absolute bottom-6 text-xs text-gray-700 z-10">v1.0.0 — Early Development</div>
    </div>
  )
}