import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { initRace, simulateLap, getResults } from '../engine/raceEngine'
import { buildSchedule } from '../data/schedule'

const TYRE_BG = {
  S: 'bg-red-900 text-red-300',
  M: 'bg-yellow-900 text-yellow-300',
  H: 'bg-gray-800 text-gray-300'
}

// Simulasi klasemen sederhana berdasarkan hasil race
function buildStandings(results, existingResults, riderDatabase) {
  const pointsMap = {}

  // Poin dari race sebelumnya
  existingResults.forEach(r => {
    const key = r.rider
    pointsMap[key] = (pointsMap[key] || 0) + r.points
  })

  // Poin race ini
  results.forEach(r => {
    const key = r.name
    pointsMap[key] = (pointsMap[key] || 0) + r.points
  })

  return Object.entries(pointsMap)
    .map(([name, points]) => ({ name, points }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 15)
}

function buildConstructorStandings(results, existingResults) {
  const teamPoints = {}

  existingResults.forEach(r => {
    const team = r.team || 'Unknown'
    teamPoints[team] = (teamPoints[team] || 0) + r.points
  })

  results.forEach(r => {
    const team = r.team || 'Unknown'
    teamPoints[team] = (teamPoints[team] || 0) + r.points
  })

  return Object.entries(teamPoints)
    .map(([team, points]) => ({ team, points }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 10)
}

export default function RaceScreen({ phase = 'race', onFinished }) {
  const {
    riders, bike, staff, team, round, results: existingResults,
    riderDatabase, addResult, currentDate, advanceDay
  } = useGameStore()

  const [raceState, setRaceState] = useState(null)
  const [results, setResults] = useState(null)
  const [autoSim, setAutoSim] = useState(false)
  const [strategy, setStrategy] = useState('normal')
  const [log, setLog] = useState([])
  const [started, setStarted] = useState(false)
  const [showStandings, setShowStandings] = useState('riders')
  const [resultSaved, setResultSaved] = useState(false)
  const intervalRef = useRef(null)
  const nextLapRef = useRef(null)

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  function startRace() {
    const state = initRace(round, riders, bike, staff, team.name)
    setRaceState(state)
    setResults(null)
    setResultSaved(false)
    setLog([`🏁 Race started — ${state.circuit.name}, ${state.circuit.laps} laps`])
    setStrategy('normal')
    setStarted(true)
  }

  const nextLapFn = (prevState, currentStrategy) => {
    if (!prevState || prevState.finished) return prevState
    const newState = simulateLap({ ...prevState, strategy: currentStrategy })
    if (newState.finished) {
      clearInterval(intervalRef.current)
      setAutoSim(false)
      const res = getResults(newState)
      setResults(res)
      const playerResult = res.find(r => r.isPlayer)
      if (playerResult) {
        setLog(l => [
          `✅ Race finished! ${playerResult.name} — P${playerResult.position} · ${playerResult.points} pts`,
          ...l.slice(0, 8)
        ])
      }
    } else {
      const playerRider = newState.riders.find(r => r.isPlayer && !r.retired)
      if (playerRider && newState.lap % 5 === 0) {
        const pos = [...newState.riders]
          .filter(r => !r.retired)
          .sort((a, b) => a.gap - b.gap)
          .findIndex(r => r.id === playerRider.id) + 1
        setLog(l => [`Lap ${newState.lap}: ${playerRider.name} P${pos} +${playerRider.gap.toFixed(3)}s`, ...l.slice(0, 8)])
      }
    }
    return newState
  }

  nextLapRef.current = () => {
    setRaceState(prev => nextLapFn(prev, strategy))
  }

  function applyStrategy(s) {
    setStrategy(s)
    const msgs = {
      push: 'Strategy: Push hard — faster pace, more tyre wear.',
      save: 'Strategy: Save tyres — conservative pace.',
      normal: 'Strategy: Back to normal pace.',
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
    setLog(l => ['🔧 Pit stop! Fresh soft tyres. Rejoining track.', ...l.slice(0, 8)])
  }

  function saveAndContinue() {
    if (!results || resultSaved) return
    setResultSaved(true)
    const playerResults = results.filter(r => r.isPlayer)
    playerResults.forEach(r => {
      addResult(
        { round, position: r.position, points: r.points, rider: r.name, team: team.name },
        results
      )
    })
  }

  function handleContinue() {
    saveAndContinue()
    onFinished()
  }

  useEffect(() => {
    if (autoSim && raceState && !raceState.finished) {
      intervalRef.current = setInterval(() => {
        nextLapRef.current?.()
      }, 250)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [autoSim, raceState?.finished])

  const sortedRiders = raceState
    ? [...raceState.riders].sort((a, b) =>
        a.retired === b.retired ? a.gap - b.gap : a.retired ? 1 : -1
      )
    : []

  const circuit = raceState?.circuit
  const riderStandings = results ? buildStandings(results, existingResults, riderDatabase) : []
  const constructorStandings = results ? buildConstructorStandings(results, existingResults) : []

  // ── PRACTICE ──────────────────────────────────────────────────────────────
  if (phase === 'practice') {
    const bestLap = (Math.random() * 0.3 + 1.38).toFixed(3)
    const tyreRec = ['Soft', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center">
            <div className="text-sm text-blue-400 uppercase tracking-wider font-semibold mb-2">Free Practice</div>
            <div className="text-3xl font-bold mb-2">Friday — Practice Day</div>
            <div className="text-gray-500">FP1 and FP2 sessions complete</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Practice Summary</div>
            {riders.map(rider => (
              <div key={rider.id} className="space-y-1.5">
                <div className="text-base font-medium text-white">{rider.name}</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between bg-gray-800 rounded-lg px-3 py-2">
                    <span className="text-gray-500">Best lap</span>
                    <span className="text-white font-mono">1:{bestLap}</span>
                  </div>
                  <div className="flex justify-between bg-gray-800 rounded-lg px-3 py-2">
                    <span className="text-gray-500">Tyre rec.</span>
                    <span className="text-yellow-400 font-medium">{tyreRec}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between bg-gray-800 rounded-lg px-3 py-2 text-sm">
              <span className="text-gray-500">Setup status</span>
              <span className="text-green-400 font-medium">✓ Ready for qualifying</span>
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

  // ── QUALIFYING ────────────────────────────────────────────────────────────
  if (phase === 'qualifying') {
    const qualiResults = riders.map((rider, i) => ({
      rider,
      pos: Math.max(1, Math.min(22,
        Math.round(22 - (rider.qualiPace / 20) * 18 - Math.random() * 5 + i * 2)
      )),
      lapTime: (1.38 + (1 - rider.qualiPace / 20) * 0.3 + Math.random() * 0.05).toFixed(3),
    })).sort((a, b) => a.pos - b.pos)

    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center">
            <div className="text-sm text-yellow-400 uppercase tracking-wider font-semibold mb-2">Qualifying</div>
            <div className="text-3xl font-bold mb-2">Saturday — Qualifying</div>
            <div className="text-gray-500">Q1, Q2, and Q3 complete</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 px-4 py-2 border-b border-gray-800 text-sm text-gray-500 uppercase tracking-wider">
              <span>Pos</span><span>Rider</span><span className="text-right">Lap Time</span>
            </div>
            {qualiResults.map(({ rider, pos, lapTime }) => (
              <div key={rider.id} className="grid grid-cols-3 px-4 py-3 border-b border-gray-800 last:border-0 items-center bg-red-950 bg-opacity-20">
                <span className={`text-base font-bold ${pos <= 3 ? 'text-yellow-400' : pos <= 10 ? 'text-white' : 'text-gray-500'}`}>
                  P{pos}
                </span>
                <span className="text-base text-red-300 font-medium">{rider.name}</span>
                <span className="text-right font-mono text-sm text-gray-300">1:{lapTime}</span>
              </div>
            ))}
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

  // ── RACE ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <div>
          <div className="text-base font-semibold text-white">
            Race Day — Round {round}
            {circuit && ` · ${circuit.name}, ${circuit.country}`}
          </div>
          {raceState && !results && (
            <div className="text-sm text-gray-500 mt-0.5">
              Lap {raceState.lap}/{raceState.totalLaps}
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">

        {!started && (
          <div className="flex flex-col items-center justify-center h-64 gap-5">
            <div className="text-xl font-semibold text-white">Race Day</div>
            <div className="text-gray-500">
              {riders[0]?.name}{riders[1] ? ` & ${riders[1]?.name}` : ''} on the grid
            </div>
            <button
              onClick={startRace}
              className="px-12 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-base font-semibold transition-colors"
            >
              🏁 Start Race
            </button>
          </div>
        )}

        {started && !results && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap">
                {['normal', 'push', 'save'].map(s => (
                  <button key={s} onClick={() => applyStrategy(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      strategy === s ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}>
                    {s === 'normal' ? 'Normal' : s === 'push' ? 'Push Hard' : 'Save Tyres'}
                  </button>
                ))}
                <button onClick={pitStop}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-900 text-blue-300 hover:bg-blue-800 transition-colors">
                  Pit Stop
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => nextLapRef.current?.()}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm transition-colors">
                  Next Lap
                </button>
                <button
                  onClick={() => setAutoSim(a => !a)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    autoSim ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-green-700 hover:bg-green-600 text-white'
                  }`}>
                  {autoSim ? '⏸ Pause' : '▶ Auto Sim'}
                </button>
              </div>
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
                <div key={r.id} className={`grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-800 last:border-0 text-sm items-center ${
                  r.isPlayer ? 'bg-red-950 bg-opacity-40' : ''
                } ${r.retired ? 'opacity-40' : ''}`}>
                  <span className={`col-span-1 font-bold text-sm ${
                    i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    {r.retired ? 'DNF' : `P${i + 1}`}
                  </span>
                  <span className={`col-span-4 font-medium text-sm ${r.isPlayer ? 'text-red-300' : 'text-white'}`}>
                    {r.name}
                  </span>
                  <span className="col-span-3 text-gray-500 text-xs">{r.team}</span>
                  <span className="col-span-2 text-gray-300 font-mono text-xs">
                    {i === 0 ? 'Leader' : `+${r.gap.toFixed(3)}`}
                  </span>
                  <span className={`col-span-1 text-xs font-semibold px-1.5 py-0.5 rounded ${TYRE_BG[r.tyre]}`}>
                    {r.tyre}
                  </span>
                  <span className={`col-span-1 text-xs font-medium ${
                    r.tyreLife < 30 ? 'text-red-400' : r.tyreLife < 60 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {Math.round(r.tyreLife)}%
                  </span>
                </div>
              ))}
            </div>

            {log.length > 0 && (
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 space-y-0.5 max-h-32 overflow-y-auto">
                {log.map((l, i) => (
                  <div key={i} className="text-sm text-gray-400">{l}</div>
                ))}
              </div>
            )}
          </>
        )}

        {results && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">Race Finished! 🏁</div>
              <div className="text-gray-400 text-base">{circuit?.name} Grand Prix · Round {round}</div>
              {(() => {
                const playerResult = results.find(r => r.isPlayer)
                return playerResult && (
                  <div className={`mt-2 text-xl font-bold ${
                    playerResult.position <= 3 ? 'text-yellow-400' :
                    playerResult.position <= 10 ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    Best result: P{playerResult.position} · +{playerResult.points} pts
                  </div>
                )
              })()}
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              {['Race Result', 'Rider Standings', 'Constructor Standings'].map((t, i) => {
                const id = ['race', 'riders', 'constructors'][i]
                return (
                  <button key={id} onClick={() => setShowStandings(id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      showStandings === id ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}>
                    {t}
                  </button>
                )
              })}
            </div>

            {/* Race result */}
            {showStandings === 'race' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <span className="col-span-1">Pos</span>
                  <span className="col-span-5">Rider</span>
                  <span className="col-span-4">Team</span>
                  <span className="col-span-2">Pts</span>
                </div>
                {results.map((r, i) => (
                  <div key={r.id} className={`grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-800 last:border-0 text-sm items-center ${
                    r.isPlayer ? 'bg-red-950 bg-opacity-40' : ''
                  }`}>
                    <span className={`col-span-1 font-bold ${
                      i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {r.retired ? 'DNF' : `P${i + 1}`}
                    </span>
                    <span className={`col-span-5 font-medium ${r.isPlayer ? 'text-red-300' : 'text-white'}`}>
                      {r.name}
                    </span>
                    <span className="col-span-4 text-gray-500 text-xs">{r.team}</span>
                    <span className="col-span-2 font-semibold text-yellow-400">
                      {r.points > 0 ? `+${r.points}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Rider standings */}
            {showStandings === 'riders' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <span className="col-span-1">Pos</span>
                  <span className="col-span-9">Rider</span>
                  <span className="col-span-2">Pts</span>
                </div>
                {riderStandings.map((r, i) => (
                  <div key={r.name} className={`grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-800 last:border-0 text-sm items-center ${
                    riders.find(pr => pr.name === r.name) ? 'bg-red-950 bg-opacity-30' : ''
                  }`}>
                    <span className={`col-span-1 font-bold ${
                      i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {i + 1}
                    </span>
                    <span className={`col-span-9 font-medium ${
                      riders.find(pr => pr.name === r.name) ? 'text-red-300' : 'text-white'
                    }`}>
                      {r.name}
                    </span>
                    <span className="col-span-2 font-semibold text-white">{r.points}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Constructor standings */}
            {showStandings === 'constructors' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <span className="col-span-1">Pos</span>
                  <span className="col-span-9">Team</span>
                  <span className="col-span-2">Pts</span>
                </div>
                {constructorStandings.map((c, i) => (
                  <div key={c.team} className={`grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-800 last:border-0 text-sm items-center ${
                    c.team === team.name ? 'bg-red-950 bg-opacity-30' : ''
                  }`}>
                    <span className={`col-span-1 font-bold ${
                      i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {i + 1}
                    </span>
                    <span className={`col-span-9 font-medium ${c.team === team.name ? 'text-red-300' : 'text-white'}`}>
                      {c.team}
                    </span>
                    <span className="col-span-2 font-semibold text-white">{c.points}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                onClick={handleContinue}
                className="px-12 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-base font-semibold transition-colors"
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