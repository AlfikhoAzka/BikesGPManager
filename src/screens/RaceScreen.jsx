import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { initRace, simulateLap, getResults, getCircuit } from '../engine/raceEngine'

const TYRE_COLOR = { S: 'text-red-400', M: 'text-yellow-400', H: 'text-gray-300' }
const TYRE_BG = { S: 'bg-red-900 text-red-300', M: 'bg-yellow-900 text-yellow-300', H: 'bg-gray-800 text-gray-300' }

export default function RaceScreen() {
  const { riders, bike, staff, round, addResult, budget } = useGameStore()
  const [raceState, setRaceState] = useState(null)
  const [results, setResults] = useState(null)
  const [autoSim, setAutoSim] = useState(false)
  const [strategy, setStrategy] = useState('normal')
  const [log, setLog] = useState([])
  const intervalRef = useRef(null)

  const circuit = getCircuit(round)

  function startRace() {
    const state = initRace(round, riders, bike, staff)
    setRaceState(state)
    setResults(null)
    setLog([`Race started at ${circuit.name}, ${circuit.laps} laps.`])
    setStrategy('normal')
  }

  function nextLap() {
    if (!raceState || raceState.finished) return
    const newState = simulateLap({ ...raceState, strategy })
    setRaceState(newState)

    const playerRider = newState.riders.find(r => r.isPlayer && !r.retired)
    if (playerRider) {
      const pos = [...newState.riders]
        .filter(r => !r.retired)
        .sort((a, b) => a.gap - b.gap)
        .findIndex(r => r.id === playerRider.id) + 1
      if (newState.lap % 5 === 0) {
        setLog(l => [`Lap ${newState.lap}: ${playerRider.name} P${pos}, gap +${playerRider.gap.toFixed(3)}s`, ...l.slice(0, 6)])
      }
    }

    if (newState.finished) {
      const res = getResults(newState)
      setResults(res)
      setAutoSim(false)
      const playerResult = res.find(r => r.isPlayer)
      if (playerResult) {
        setLog(l => [`Race finished! ${playerResult.name} finished P${playerResult.position} — ${playerResult.points} pts`, ...l])
      }
    }
  }

  function applyStrategy(s) {
    setStrategy(s)
    const msgs = {
      push: 'Strategy: Push hard — faster but more tyre wear.',
      save: 'Strategy: Save tyres — slower now, stronger finish.',
      normal: 'Strategy: Normal pace.',
    }
    setLog(l => [msgs[s], ...l.slice(0, 6)])
  }

  function pitStop() {
    if (!raceState) return
    setRaceState(prev => ({
      ...prev,
      riders: prev.riders.map(r =>
        r.isPlayer ? { ...r, tyre: 'S', tyreLife: 100, gap: r.gap + 22, pitted: true } : r
      )
    }))
    setLog(l => ['Pit stop! Fresh soft tyres — rejoining P8+', ...l.slice(0, 6)])
  }

  function finishRace() {
    if (!results) return
    const playerResults = results.filter(r => r.isPlayer)
    playerResults.forEach(r => addResult({ round, position: r.position, points: r.points, rider: r.name }))
  }

  useEffect(() => {
    if (autoSim && raceState && !raceState.finished) {
      intervalRef.current = setInterval(() => {
        setRaceState(prev => {
          if (!prev || prev.finished) { clearInterval(intervalRef.current); return prev }
          const newState = simulateLap({ ...prev, strategy })
          if (newState.finished) {
            clearInterval(intervalRef.current)
            setAutoSim(false)
            setResults(getResults(newState))
          }
          return newState
        })
      }, 300)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [autoSim, strategy])

  const sortedRiders = raceState
    ? [...raceState.riders].sort((a, b) => a.retired === b.retired ? a.gap - b.gap : a.retired ? 1 : -1)
    : []

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Race</h2>
        <p className="text-sm text-gray-500">Round {round} · {circuit.name}, {circuit.country} · {circuit.laps} laps</p>
      </div>

      {!raceState && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <div className="text-gray-400 mb-2">Round {round} — {circuit.name}</div>
          <div className="text-2xl font-semibold mb-1">{circuit.country} Grand Prix</div>
          <div className="text-sm text-gray-500 mb-6">{circuit.laps} laps · Dry</div>
          <button onClick={startRace} className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Start Race
          </button>
        </div>
      )}

      {raceState && !results && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Lap <span className="text-white font-semibold">{raceState.lap}</span> / {raceState.totalLaps}
            </div>
            <div className="flex gap-2">
              <button onClick={nextLap} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                Next Lap
              </button>
              <button
                onClick={() => setAutoSim(a => !a)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${autoSim ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-green-700 hover:bg-green-600 text-white'}`}
              >
                {autoSim ? 'Pause' : 'Auto Sim'}
              </button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {['normal', 'push', 'save'].map(s => (
              <button key={s} onClick={() => applyStrategy(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${strategy === s ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                {s === 'normal' ? 'Normal' : s === 'push' ? 'Push Hard' : 'Save Tyres'}
              </button>
            ))}
            <button onClick={pitStop} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-900 text-blue-300 hover:bg-blue-800 transition-colors">
              Pit Stop
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
              <span className="col-span-1">Pos</span>
              <span className="col-span-4">Rider</span>
              <span className="col-span-3">Team</span>
              <span className="col-span-2">Gap</span>
              <span className="col-span-1">Tyre</span>
              <span className="col-span-1">Life</span>
            </div>
            {sortedRiders.map((r, i) => (
              <div key={r.id} className={`grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-800 last:border-0 text-sm items-center ${r.isPlayer ? 'bg-red-950' : ''} ${r.retired ? 'opacity-40' : ''}`}>
                <span className={`col-span-1 font-semibold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                  {r.retired ? 'DNF' : `P${i + 1}`}
                </span>
                <span className={`col-span-4 font-medium ${r.isPlayer ? 'text-red-300' : 'text-white'}`}>{r.name}</span>
                <span className="col-span-3 text-gray-500 text-xs">{r.team}</span>
                <span className="col-span-2 text-gray-300 font-mono text-xs">{i === 0 ? 'Leader' : `+${r.gap.toFixed(3)}`}</span>
                <span className={`col-span-1 text-xs font-semibold px-1.5 py-0.5 rounded ${TYRE_BG[r.tyre]}`}>{r.tyre}</span>
                <span className={`col-span-1 text-xs ${r.tyreLife < 30 ? 'text-red-400' : r.tyreLife < 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {Math.round(r.tyreLife)}%
                </span>
              </div>
            ))}
          </div>

          {log.length > 0 && (
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
              {log.map((l, i) => (
                <div key={i} className="text-xs text-gray-400 py-0.5">{l}</div>
              ))}
            </div>
          )}
        </>
      )}

      {results && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="text-2xl font-bold mb-1">Race Finished!</div>
            <div className="text-gray-400 text-sm">{circuit.name} Grand Prix</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
              <span className="col-span-1">Pos</span>
              <span className="col-span-5">Rider</span>
              <span className="col-span-4">Team</span>
              <span className="col-span-2">Points</span>
            </div>
            {results.map((r, i) => (
              <div key={r.id} className={`grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-800 last:border-0 text-sm items-center ${r.isPlayer ? 'bg-red-950' : ''}`}>
                <span className={`col-span-1 font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                  {r.retired ? 'DNF' : `P${i + 1}`}
                </span>
                <span className={`col-span-5 font-medium ${r.isPlayer ? 'text-red-300' : 'text-white'}`}>{r.name}</span>
                <span className="col-span-4 text-gray-500 text-xs">{r.team}</span>
                <span className="col-span-2 font-semibold text-yellow-400">{r.points > 0 ? `+${r.points}` : '—'}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={finishRace} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors">
              Continue to Next Round
            </button>
            <button onClick={startRace} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-lg text-sm transition-colors">
              Restart Race
            </button>
          </div>
        </div>
      )}
    </div>
  )
}