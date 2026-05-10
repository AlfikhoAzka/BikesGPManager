import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { initRace, simulateLap, getResults } from '../engine/raceEngine'

const TYRE_BG = { S: 'bg-red-900 text-red-300', M: 'bg-yellow-900 text-yellow-300', H: 'bg-gray-800 text-gray-300' }
const POINTS_TABLE = [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

export default function RaceScreen({ phase = 'race', onFinished }) {
  const { riders, bike, staff, team, round, addResult, advanceDay } = useGameStore()

  const [raceState, setRaceState] = useState(null)
  const [results, setResults] = useState(null)
  const [autoSim, setAutoSim] = useState(false)
  const [strategy, setStrategy] = useState('normal')
  const [log, setLog] = useState([])
  const [started, setStarted] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  function startRace() {
    const state = initRace(round, riders, bike, staff, team.name)
    setRaceState(state)
    setResults(null)
    setLog([`Race started — ${state.circuit.name}, ${state.circuit.laps} laps`])
    setStrategy('normal')
    setStarted(true)
  }

  function nextLap() {
    if (!raceState || raceState.finished) return
    setRaceState(prev => {
      const newState = simulateLap({ ...prev, strategy })
      if (newState.finished) {
        clearInterval(intervalRef.current)
        setAutoSim(false)
        const res = getResults(newState)
        setResults(res)
        const playerResult = res.find(r => r.isPlayer)
        if (playerResult) {
          setLog(l => [`Race finished! P${playerResult.position} — ${playerResult.points} pts`, ...l.slice(0, 8)])
        }
      } else {
        const playerRider = newState.riders.find(r => r.isPlayer && !r.retired)
        if (playerRider && newState.lap % 5 === 0) {
          const pos = [...newState.riders].filter(r => !r.retired).sort((a, b) => a.gap - b.gap).findIndex(r => r.id === playerRider.id) + 1
          setLog(l => [`Lap ${newState.lap}: ${playerRider.name} P${pos}`, ...l.slice(0, 8)])
        }
      }
      return newState
    })
  }

  function applyStrategy(s) {
    setStrategy(s)
    const msgs = {
      push: 'Strategy: Push hard — faster but more tyre wear.',
      save: 'Strategy: Save tyres — slower now, stronger finish.',
      normal: 'Strategy: Normal pace.',
    }
    setLog(l => [msgs[s], ...l.slice(0, 8)])
  }

  function pitStop() {
    if (!raceState) return
    setRaceState(prev => ({
      ...prev,
      riders: prev.riders.map(r =>
        r.isPlayer ? { ...r, tyre: 'S', tyreLife: 100, gap: r.gap + 22, pitted: true } : r
      )
    }))
    setLog(l => ['Pit stop! Fresh soft tyres.', ...l.slice(0, 8)])
  }

  function finishAndContinue() {
    if (!results) return
    const playerResults = results.filter(r => r.isPlayer)
    playerResults.forEach(r => {
      addResult({ round, position: r.position, points: r.points, rider: r.name }, results)
    })
    onFinished()
  }

  useEffect(() => {
    if (autoSim && raceState && !raceState.finished) {
      intervalRef.current = setInterval(() => {
        nextLap()
      }, 250)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [autoSim, strategy, raceState?.finished])

  const sortedRiders = raceState
    ? [...raceState.riders].sort((a, b) => a.retired === b.retired ? a.gap - b.gap : a.retired ? 1 : -1)
    : []

  const circuit = raceState?.circuit

  // Practice screen
  if (phase === 'practice') {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="text-sm text-blue-400 uppercase tracking-wider font-semibold">Free Practice</div>
          <div className="text-3xl font-bold">Friday — Practice Day</div>
          <div className="text-gray-400 text-base leading-relaxed">
            Your engineers are running setup simulations and gathering tyre data.
            FP1 and FP2 complete — setup notes ready for qualifying.
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-left space-y-3">
            <div className="text-sm font-semibold text-gray-400 uppercase">Practice Summary</div>
            <div className="flex justify-between text-base">
              <span className="text-gray-500">Best lap</span>
              <span className="text-white font-semibold">1:{(Math.random() * 0.3 + 1.38).toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-500">Tyre recommendation</span>
              <span className="text-yellow-400 font-semibold">Medium — optimal balance</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-500">Setup status</span>
              <span className="text-green-400 font-semibold">✓ Ready for qualifying</span>
            </div>
          </div>
          <button
            onClick={onFinished}
            className="w-full py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-base font-semibold transition-colors"
          >
            Complete Practice Day →
          </button>
        </div>
      </div>
    )
  }

  // Qualifying screen
  if (phase === 'qualifying') {
    const qualiPos = Math.max(1, Math.min(22, Math.round(
      22 - ((riders[0]?.qualiPace || 15) / 20) * 18 - Math.random() * 4
    )))
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="text-sm text-yellow-400 uppercase tracking-wider font-semibold">Qualifying</div>
          <div className="text-3xl font-bold">Saturday — Qualifying</div>
          <div className="text-gray-400 text-base">
            Q1, Q2, and Q3 sessions complete.
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-left space-y-3">
            <div className="text-sm font-semibold text-gray-400 uppercase">Qualifying Result</div>
            {riders.map((rider, i) => {
              const pos = i === 0 ? qualiPos : Math.min(22, qualiPos + 2 + Math.floor(Math.random() * 4))
              return (
                <div key={rider.id} className="flex justify-between text-base items-center">
                  <span className="text-gray-400">{rider.name}</span>
                  <span className={`font-bold text-lg ${pos <= 3 ? 'text-yellow-400' : pos <= 10 ? 'text-white' : 'text-gray-500'}`}>
                    P{pos}
                  </span>
                </div>
              )
            })}
          </div>
          <button
            onClick={onFinished}
            className="w-full py-3 bg-yellow-700 hover:bg-yellow-600 text-white rounded-xl text-base font-semibold transition-colors"
          >
            Complete Qualifying →
          </button>
        </div>
      </div>
    )
  }

  // Race screen
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <div>
          <div className="text-base font-semibold text-white">
            Race Day — Round {round}
          </div>
          <div className="text-sm text-gray-500">
            {circuit ? `${circuit.name}, ${circuit.country} · ${circuit.laps} laps` : 'Loading...'}
          </div>
        </div>
        {raceState && !results && (
          <div className="ml-auto text-sm text-gray-400">
            Lap <span className="text-white font-semibold">{raceState.lap}</span>/{raceState.totalLaps}
          </div>
        )}
      </header>

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">

        {!started && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="text-xl font-semibold text-white">Ready to race?</div>
            <div className="text-gray-500 text-base">
              {riders[0]?.name} and {riders[1]?.name} are on the grid.
            </div>
            <button
              onClick={startRace}
              className="px-10 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-base font-semibold transition-colors"
            >
              Start Race
            </button>
          </div>
        )}

        {started && !results && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2">
                {['normal', 'push', 'save'].map(s => (
                  <button key={s} onClick={() => applyStrategy(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                      strategy === s ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}>
                    {s === 'normal' ? 'Normal' : s === 'push' ? 'Push Hard' : 'Save Tyres'}
                  </button>
                ))}
                <button onClick={pitStop} className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-900 text-blue-300 hover:bg-blue-800 transition-colors">
                  Pit Stop
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={nextLap} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm transition-colors">
                  Next Lap
                </button>
                <button
                  onClick={() => setAutoSim(a => !a)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    autoSim ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-green-700 hover:bg-green-600 text-white'
                  }`}
                >
                  {autoSim ? 'Pause' : 'Auto Sim'}
                </button>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-800 text-sm text-gray-500 uppercase tracking-wider">
                <span className="col-span-1">Pos</span>
                <span className="col-span-4">Rider</span>
                <span className="col-span-3">Team</span>
                <span className="col-span-2">Gap</span>
                <span className="col-span-1">Tyre</span>
                <span className="col-span-1">Life</span>
              </div>
              {sortedRiders.map((r, i) => (
                <div key={r.id} className={`grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-800 last:border-0 text-sm items-center ${
                  r.isPlayer ? 'bg-red-950 bg-opacity-40' : ''
                } ${r.retired ? 'opacity-40' : ''}`}>
                  <span className={`col-span-1 font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
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
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 space-y-0.5">
                {log.map((l, i) => (
                  <div key={i} className="text-sm text-gray-400">{l}</div>
                ))}
              </div>
            )}
          </>
        )}

        {results && (
          <div className="space-y-5">
            <div className="text-center py-4">
              <div className="text-3xl font-bold mb-1">Race Finished!</div>
              <div className="text-gray-400">{circuit?.name} Grand Prix · Round {round}</div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-800 text-sm text-gray-500 uppercase tracking-wider">
                <span className="col-span-1">Pos</span>
                <span className="col-span-5">Rider</span>
                <span className="col-span-4">Team</span>
                <span className="col-span-2">Points</span>
              </div>
              {results.map((r, i) => (
                <div key={r.id} className={`grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-800 last:border-0 text-sm items-center ${
                  r.isPlayer ? 'bg-red-950 bg-opacity-40' : ''
                }`}>
                  <span className={`col-span-1 font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                    {r.retired ? 'DNF' : `P${i + 1}`}
                  </span>
                  <span className={`col-span-5 font-medium ${r.isPlayer ? 'text-red-300' : 'text-white'}`}>{r.name}</span>
                  <span className="col-span-4 text-gray-500 text-xs">{r.team}</span>
                  <span className="col-span-2 font-semibold text-yellow-400">{r.points > 0 ? `+${r.points}` : '—'}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={finishAndContinue}
                className="px-10 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-base font-semibold transition-colors"
              >
                Continue Season →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}