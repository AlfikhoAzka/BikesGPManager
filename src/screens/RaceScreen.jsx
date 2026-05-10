import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { initRace, simulateLap, getResults, getCircuit } from '../engine/raceEngine'

const TYRE_BG = {
  S: 'bg-red-900 text-red-300',
  M: 'bg-yellow-900 text-yellow-300',
  H: 'bg-gray-800 text-gray-300',
}

const PHASE_ORDER = ['fp1', 'fp2', 'qualifying', 'sprint', 'race']

const PHASE_INFO = {
  fp1: {
    label: 'FP1 — Free Practice 1',
    day: 'Friday',
    color: 'text-blue-400',
    badge: 'bg-blue-900 text-blue-300 border-blue-700',
    icon: '🔧',
  },
  fp2: {
    label: 'FP2 — Free Practice 2',
    day: 'Saturday',
    color: 'text-blue-400',
    badge: 'bg-blue-900 text-blue-300 border-blue-700',
    icon: '🔧',
  },
  qualifying: {
    label: 'Qualifying — Q1 / Q2 / Q3',
    day: 'Saturday',
    color: 'text-yellow-400',
    badge: 'bg-yellow-900 text-yellow-300 border-yellow-700',
    icon: '⏱️',
  },
  sprint: {
    label: 'Sprint Race',
    day: 'Saturday',
    color: 'text-orange-400',
    badge: 'bg-orange-900 text-orange-300 border-orange-700',
    icon: '⚡',
  },
  race: {
    label: 'Grand Prix — Race Day',
    day: 'Sunday',
    color: 'text-red-400',
    badge: 'bg-red-900 text-red-300 border-red-700',
    icon: '🏁',
  },
}

// Format lap time properly: e.g. 1:38.471
function formatLapTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(3).padStart(6, '0')
  return `${mins}:${secs}`
}

// Generate realistic lap time based on circuit baseTime + pace
function genLapTime(baseTime, pace, variance = 0.05) {
  const paceBonus = (1 - pace / 20) * 0.15
  const rand = (Math.random() - 0.5) * variance
  return baseTime * (1 + paceBonus + rand)
}

function buildStandings(raceResults, existingResults, teamName) {
  const pointsMap = {}
  existingResults.forEach(r => {
    pointsMap[r.rider] = (pointsMap[r.rider] || 0) + r.points
  })
  raceResults.forEach(r => {
    pointsMap[r.name] = (pointsMap[r.name] || 0) + r.points
  })
  return Object.entries(pointsMap)
    .map(([name, points]) => ({ name, points }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 15)
}

function buildConstructorStandings(raceResults, existingResults) {
  const teamPoints = {}
  existingResults.forEach(r => {
    if (r.team) teamPoints[r.team] = (teamPoints[r.team] || 0) + r.points
  })
  raceResults.forEach(r => {
    if (r.team) teamPoints[r.team] = (teamPoints[r.team] || 0) + r.points
  })
  return Object.entries(teamPoints)
    .map(([team, points]) => ({ team, points }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 10)
}

// AI riders for non-race sessions
const AI_NAMES = [
  { name: 'M. Marquez', pace: 20 }, { name: 'F. Bagnaia', pace: 19 },
  { name: 'J. Martin', pace: 18 }, { name: 'M. Bezzecchi', pace: 18 },
  { name: 'P. Acosta', pace: 18 }, { name: 'F. Quartararo', pace: 17 },
  { name: 'A. Marquez', pace: 17 }, { name: 'T. Razgatlioglu', pace: 17 },
  { name: 'B. Binder', pace: 16 }, { name: 'M. Vinales', pace: 16 },
  { name: 'E. Bastianini', pace: 16 }, { name: 'F. Di Giannantonio', pace: 16 },
  { name: 'R. Fernandez', pace: 15 }, { name: 'A. Ogura', pace: 15 },
  { name: 'J. Zarco', pace: 15 }, { name: 'L. Marini', pace: 15 },
  { name: 'J. Mir', pace: 15 }, { name: 'A. Rins', pace: 15 },
  { name: 'F. Morbidelli', pace: 15 }, { name: 'J. Miller', pace: 14 },
  { name: 'F. Aldeguer', pace: 14 }, { name: 'D. Moreira', pace: 13 },
]

export default function RaceScreen({ phase: initialPhase = 'fp1', onFinished }) {
  const {
    riders, bike, staff, team, round,
    results: existingResults, addResult, advanceDay,
  } = useGameStore()

  const circuit = getCircuit(round)

  const [currentPhase, setCurrentPhase] = useState(initialPhase)
  const [phaseResults, setPhaseResults] = useState({})
  const [raceState, setRaceState] = useState(null)
  const [raceResults, setRaceResults] = useState(null)
  const [autoSim, setAutoSim] = useState(false)
  const [strategy, setStrategy] = useState('normal')
  const [log, setLog] = useState([])
  const [raceStarted, setRaceStarted] = useState(false)
  const [resultSaved, setResultSaved] = useState(false)
  const [standingsTab, setStandingsTab] = useState('race')
  const intervalRef = useRef(null)
  const nextLapRef = useRef(null)

  useEffect(() => () => clearInterval(intervalRef.current), [])

  // Generate FP/Quali/Sprint results
  function generateSessionResult(sessionType) {
    const baseTime = circuit.baseTime

    const allRiders = [
      ...riders.map(r => ({
        name: r.name,
        pace: r.qualiPace || r.pace || 15,
        isPlayer: true,
      })),
      ...AI_NAMES.filter(a => !riders.find(r => r.name.includes(a.name.split('.')[1]?.trim() || a.name))).slice(0, 20),
    ]

    const variance = sessionType === 'qualifying' ? 0.02 : 0.06

    const results = allRiders.map(r => {
      const lapTime = genLapTime(baseTime, r.pace, variance)
      return { ...r, lapTime }
    }).sort((a, b) => a.lapTime - b.lapTime)
    .map((r, i) => ({ ...r, position: i + 1 }))

    return results
  }

  function completeNonRacePhase() {
    const result = generateSessionResult(currentPhase)
    setPhaseResults(prev => ({ ...prev, [currentPhase]: result }))

    const nextIndex = PHASE_ORDER.indexOf(currentPhase) + 1
    if (nextIndex < PHASE_ORDER.length) {
      setCurrentPhase(PHASE_ORDER[nextIndex])
    }
    advanceDay()
  }

  // Race simulation
  function startRace() {
    const state = initRace(round, riders, bike, staff, team.name)
    setRaceState(state)
    setRaceResults(null)
    setResultSaved(false)
    setLog([`🏁 Race start — ${circuit.name}, ${circuit.laps} laps`])
    setStrategy('normal')
    setRaceStarted(true)
  }

  nextLapRef.current = () => {
    setRaceState(prev => {
      if (!prev || prev.finished) return prev
      const newState = simulateLap({ ...prev, strategy })
      if (newState.finished) {
        clearInterval(intervalRef.current)
        setAutoSim(false)
        const res = getResults(newState)
        setRaceResults(res)
        const playerResult = res.find(r => r.isPlayer)
        if (playerResult) {
          setLog(l => [
            `✅ ${playerResult.name} — P${playerResult.position} · ${playerResult.points} pts`,
            ...l.slice(0, 8),
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
    })
  }

  useEffect(() => {
    if (autoSim && raceState && !raceState.finished) {
      intervalRef.current = setInterval(() => nextLapRef.current?.(), 250)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [autoSim, raceState?.finished])

  function pitStop() {
    setRaceState(prev => ({
      ...prev,
      riders: prev.riders.map(r =>
        r.isPlayer ? { ...r, tyre: 'S', tyreLife: 100, gap: r.gap + 22, pitted: true } : r
      ),
    }))
    setLog(l => ['🔧 Pit stop! Fresh soft tyres.', ...l.slice(0, 8)])
  }

  function saveAndFinish() {
    if (resultSaved || !raceResults) return
    setResultSaved(true)
    const playerResults = raceResults.filter(r => r.isPlayer)
    playerResults.forEach(r => {
      addResult(
        { round, position: r.position, points: r.points, rider: r.name, team: team.name },
        raceResults
      )
    })
    advanceDay()
    onFinished()
  }

  const sortedRiders = raceState
    ? [...raceState.riders].sort((a, b) =>
        a.retired === b.retired ? a.gap - b.gap : a.retired ? 1 : -1
      )
    : []

  const phaseInfo = PHASE_INFO[currentPhase]
  const sessionResult = phaseResults[currentPhase]

  // ── SESSION RESULT VIEW (FP1/FP2/Qualifying/Sprint) ────────────────────────
  if (currentPhase !== 'race') {
    const prevResult = phaseResults[currentPhase]

    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
          <div>
            <div className={`text-sm font-semibold uppercase tracking-wider ${phaseInfo.color}`}>
              {phaseInfo.day} · Round {round}
            </div>
            <div className="text-base font-semibold text-white">{circuit.name} · {circuit.country}</div>
          </div>
          <div className="ml-auto">
            <span className={`text-sm px-3 py-1 rounded-lg border ${phaseInfo.badge}`}>
              {phaseInfo.icon} {phaseInfo.label}
            </span>
          </div>
        </header>

        <div className="flex-1 p-6 space-y-5 overflow-y-auto max-w-3xl mx-auto w-full">

          {/* Phase progress */}
          <div className="flex gap-2 flex-wrap">
            {PHASE_ORDER.map(p => {
              const done = PHASE_ORDER.indexOf(p) < PHASE_ORDER.indexOf(currentPhase)
              const active = p === currentPhase
              const info = PHASE_INFO[p]
              return (
                <div key={p} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  done ? 'bg-gray-800 text-gray-500 border-gray-700' :
                  active ? info.badge : 'border-gray-800 text-gray-700'
                }`}>
                  {done ? '✓ ' : ''}{info.icon} {p.toUpperCase()}
                </div>
              )
            })}
          </div>

          {!prevResult ? (
            // Pre-session view
            <div className="space-y-5">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                <div className={`text-4xl mb-3`}>{phaseInfo.icon}</div>
                <div className={`text-xl font-bold mb-1 ${phaseInfo.color}`}>{phaseInfo.label}</div>
                <div className="text-gray-500 text-base mb-2">{phaseInfo.day} · {circuit.name}</div>
                <div className="text-sm text-gray-600">
                  {currentPhase === 'fp1' && 'First practice session. Teams gather data on tyre behaviour and setup.'}
                  {currentPhase === 'fp2' && 'Second practice session. Race simulation runs and further setup refinement.'}
                  {currentPhase === 'qualifying' && 'Q1 — Q2 — Q3. The fastest 10 riders fight for pole position.'}
                  {currentPhase === 'sprint' && '13-lap sprint race. Full points on offer for top 9 finishers.'}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Your Riders
                </div>
                {riders.map(rider => (
                  <div key={rider.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div>
                      <div className="text-base font-medium text-white">{rider.name}</div>
                      <div className="text-sm text-gray-500">
                        {currentPhase === 'qualifying' || currentPhase === 'sprint'
                          ? `Quali pace: ${rider.qualiPace || rider.pace}/20`
                          : `Race pace: ${rider.racePace || rider.pace}/20`}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">Ready ✓</div>
                  </div>
                ))}
              </div>

              <button
                onClick={completeNonRacePhase}
                className={`w-full py-3 rounded-xl text-base font-semibold transition-colors text-white ${
                  currentPhase === 'fp1' || currentPhase === 'fp2' ? 'bg-blue-700 hover:bg-blue-600' :
                  currentPhase === 'qualifying' ? 'bg-yellow-700 hover:bg-yellow-600' :
                  'bg-orange-700 hover:bg-orange-600'
                }`}
              >
                Run {phaseInfo.icon} {currentPhase.toUpperCase()} Session →
              </button>
            </div>
          ) : (
            // Post-session results
            <div className="space-y-5">
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${phaseInfo.color}`}>
                  {phaseInfo.icon} {currentPhase.toUpperCase()} Complete
                </div>
                <div className="text-gray-500">
                  {currentPhase === 'qualifying' && 'Grid positions set for tomorrow\'s race'}
                  {currentPhase === 'sprint' && 'Sprint race complete — championship points awarded'}
                  {(currentPhase === 'fp1' || currentPhase === 'fp2') && 'Session data collected'}
                </div>
              </div>

              {/* Your riders result highlight */}
              <div className="grid grid-cols-2 gap-3">
                {riders.map(rider => {
                  const result = prevResult.find(r => r.name === rider.name)
                  return result ? (
                    <div key={rider.id} className="bg-red-950 border border-red-800 rounded-xl p-4 text-center">
                      <div className="text-sm text-gray-400 mb-1">{rider.name}</div>
                      <div className={`text-3xl font-bold mb-1 ${
                        result.position <= 3 ? 'text-yellow-400' :
                        result.position <= 10 ? 'text-green-400' : 'text-white'
                      }`}>
                        P{result.position}
                      </div>
                      <div className="text-sm text-gray-400 font-mono">
                        {formatLapTime(result.lapTime)}
                      </div>
                      {currentPhase === 'qualifying' && result.position <= 10 && (
                        <div className="text-xs text-yellow-400 mt-1">✓ Q3 — Top 10 grid</div>
                      )}
                    </div>
                  ) : null
                })}
              </div>

              {/* Full session results table */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-800 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Full {currentPhase.toUpperCase()} Classification
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {prevResult.map((r, i) => (
                    <div key={r.name} className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-800 last:border-0 text-sm ${
                      r.isPlayer ? 'bg-red-950 bg-opacity-30' : ''
                    }`}>
                      <span className={`w-8 font-bold flex-shrink-0 ${
                        i === 0 ? 'text-yellow-400' :
                        i === 1 ? 'text-gray-300' :
                        i === 2 ? 'text-amber-600' : 'text-gray-500'
                      }`}>
                        P{r.position}
                      </span>
                      <span className={`flex-1 font-medium ${r.isPlayer ? 'text-red-300' : 'text-white'}`}>
                        {r.name}
                      </span>
                      <span className="font-mono text-gray-400 text-xs">
                        {i === 0 ? formatLapTime(r.lapTime) : `+${(r.lapTime - prevResult[0].lapTime).toFixed(3)}s`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next session or race */}
              {currentPhase !== 'sprint' ? (
                <button
                  onClick={() => {
                    const nextIndex = PHASE_ORDER.indexOf(currentPhase) + 1
                    if (nextIndex < PHASE_ORDER.length) {
                      setCurrentPhase(PHASE_ORDER[nextIndex])
                    }
                  }}
                  className="w-full py-3 rounded-xl text-base font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors"
                >
                  Continue to {PHASE_INFO[PHASE_ORDER[PHASE_ORDER.indexOf(currentPhase) + 1]]?.label || 'Race'} →
                </button>
              ) : (
                <button
                  onClick={() => setCurrentPhase('race')}
                  className="w-full py-3 rounded-xl text-base font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors"
                >
                  Continue to Race Day →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── RACE DAY ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <div>
          <div className="text-sm text-red-400 font-semibold uppercase tracking-wider">
            Sunday · Round {round}
          </div>
          <div className="text-base font-semibold text-white">
            {circuit.name} Grand Prix · {circuit.country}
            {raceState && !raceResults && (
              <span className="text-gray-500 font-normal ml-2">
                Lap {raceState.lap}/{raceState.totalLaps}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">

        {!raceStarted && (
          <div className="flex flex-col items-center justify-center h-64 gap-5">
            <div className="text-4xl">🏁</div>
            <div className="text-xl font-semibold text-white">Race Day</div>
            <div className="text-gray-500 text-base text-center">
              {riders[0]?.name}{riders[1] ? ` & ${riders[1]?.name}` : ''} on the grid
              {phaseResults.qualifying && (() => {
                const qualiResult = phaseResults.qualifying
                const r1 = qualiResult?.find(r => r.name === riders[0]?.name)
                return r1 ? (
                  <span className="block text-sm text-gray-600 mt-1">
                    Starting from P{r1.position}
                  </span>
                ) : null
              })()}
            </div>
            <button
              onClick={startRace}
              className="px-12 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-base font-semibold transition-colors"
            >
              🏁 Start Race
            </button>
          </div>
        )}

        {raceStarted && !raceResults && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap">
                {['normal', 'push', 'save'].map(s => (
                  <button key={s} onClick={() => setStrategy(s)}
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
                  {autoSim ? '⏸ Pause' : '▶ Auto'}
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
                  <span className={`col-span-1 font-bold ${
                    i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    {r.retired ? 'DNF' : `P${i + 1}`}
                  </span>
                  <span className={`col-span-4 font-medium ${r.isPlayer ? 'text-red-300' : 'text-white'}`}>{r.name}</span>
                  <span className="col-span-3 text-gray-500 text-xs">{r.team}</span>
                  <span className="col-span-2 text-gray-300 font-mono text-xs">
                    {i === 0 ? 'Leader' : `+${r.gap.toFixed(3)}s`}
                  </span>
                  <span className={`col-span-1 text-xs font-semibold px-1.5 py-0.5 rounded ${TYRE_BG[r.tyre]}`}>{r.tyre}</span>
                  <span className={`col-span-1 text-xs font-medium ${
                    r.tyreLife < 30 ? 'text-red-400' : r.tyreLife < 60 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {Math.round(r.tyreLife)}%
                  </span>
                </div>
              ))}
            </div>

            {log.length > 0 && (
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 space-y-0.5 max-h-28 overflow-y-auto">
                {log.map((l, i) => <div key={i} className="text-sm text-gray-400">{l}</div>)}
              </div>
            )}
          </>
        )}

        {raceResults && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">Race Finished! 🏁</div>
              <div className="text-gray-400">{circuit.name} Grand Prix · Round {round}</div>
              {(() => {
                const p = raceResults.find(r => r.isPlayer)
                return p && (
                  <div className={`mt-2 text-2xl font-bold ${
                    p.position <= 3 ? 'text-yellow-400' :
                    p.position <= 10 ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    P{p.position} · +{p.points} pts
                  </div>
                )
              })()}
            </div>

            <div className="flex gap-2 flex-wrap">
              {['race', 'riders', 'constructors'].map((t, i) => (
                <button key={t} onClick={() => setStandingsTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    standingsTab === t ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}>
                  {['Race Result', 'Rider Standings', 'Constructor Standings'][i]}
                </button>
              ))}
            </div>

            {standingsTab === 'race' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <span className="col-span-1">Pos</span>
                  <span className="col-span-5">Rider</span>
                  <span className="col-span-4">Team</span>
                  <span className="col-span-2">Pts</span>
                </div>
                {raceResults.map((r, i) => (
                  <div key={r.id} className={`grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-800 last:border-0 text-sm items-center ${
                    r.isPlayer ? 'bg-red-950 bg-opacity-40' : ''
                  }`}>
                    <span className={`col-span-1 font-bold ${
                      i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {r.retired ? 'DNF' : `P${i + 1}`}
                    </span>
                    <span className={`col-span-5 font-medium ${r.isPlayer ? 'text-red-300' : 'text-white'}`}>{r.name}</span>
                    <span className="col-span-4 text-gray-500 text-xs">{r.team}</span>
                    <span className="col-span-2 font-semibold text-yellow-400">
                      {r.points > 0 ? `+${r.points}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {standingsTab === 'riders' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <span className="col-span-1">Pos</span>
                  <span className="col-span-9">Rider</span>
                  <span className="col-span-2">Pts</span>
                </div>
                {buildStandings(raceResults, existingResults, team.name).map((r, i) => (
                  <div key={r.name} className={`grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-800 last:border-0 text-sm ${
                    riders.find(pr => pr.name === r.name) ? 'bg-red-950 bg-opacity-30' : ''
                  }`}>
                    <span className={`col-span-1 font-bold ${
                      i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                    }`}>{i + 1}</span>
                    <span className={`col-span-9 font-medium ${riders.find(pr => pr.name === r.name) ? 'text-red-300' : 'text-white'}`}>
                      {r.name}
                    </span>
                    <span className="col-span-2 font-semibold text-white">{r.points}</span>
                  </div>
                ))}
              </div>
            )}

            {standingsTab === 'constructors' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <span className="col-span-1">Pos</span>
                  <span className="col-span-9">Team</span>
                  <span className="col-span-2">Pts</span>
                </div>
                {buildConstructorStandings(raceResults, existingResults).map((c, i) => (
                  <div key={c.team} className={`grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-800 last:border-0 text-sm ${
                    c.team === team.name ? 'bg-red-950 bg-opacity-30' : ''
                  }`}>
                    <span className={`col-span-1 font-bold ${
                      i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                    }`}>{i + 1}</span>
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
                onClick={saveAndFinish}
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