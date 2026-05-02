const CIRCUITS = [
  { name: 'Losail', country: 'Qatar', laps: 22, baseTime: 1.572 },
  { name: 'Portimao', country: 'Portugal', laps: 25, baseTime: 1.421 },
  { name: 'COTA', country: 'USA', laps: 20, baseTime: 2.011 },
  { name: 'Jerez', country: 'Spain', laps: 25, baseTime: 1.387 },
  { name: 'Le Mans', country: 'France', laps: 27, baseTime: 1.431 },
  { name: 'Mugello', country: 'Italy', laps: 23, baseTime: 1.471 },
  { name: 'Catalunya', country: 'Spain', laps: 24, baseTime: 1.421 },
  { name: 'Assen', country: 'Netherlands', laps: 26, baseTime: 1.361 },
  { name: 'Silverstone', country: 'UK', laps: 20, baseTime: 2.001 },
  { name: 'Misano', country: 'Italy', laps: 27, baseTime: 1.431 },
]

const AI_RIDERS = [
  { name: 'F. Bagnaia', team: 'Ducati Factory', pace: 19, tyre: 'M' },
  { name: 'J. Martin', team: 'Pramac', pace: 18, tyre: 'M' },
  { name: 'M. Marquez', team: 'Gresini', pace: 18, tyre: 'S' },
  { name: 'A. Espargaro', team: 'Aprilia', pace: 17, tyre: 'M' },
  { name: 'B. Oliveira', team: 'Trackhouse', pace: 16, tyre: 'H' },
  { name: 'L. Marini', team: 'Honda', pace: 15, tyre: 'M' },
  { name: 'T. Nakagami', team: 'LCR Honda', pace: 14, tyre: 'M' },
  { name: 'A. Rins', team: 'Yamaha', pace: 15, tyre: 'S' },
]

const TYRE_DEG = { S: 1.9, M: 1.2, H: 0.7 }
const TYRE_PACE_BONUS = { S: 0.008, M: 0, H: -0.005 }

const POINTS = [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

export function getCircuit(round) {
  return CIRCUITS[(round - 1) % CIRCUITS.length]
}

export function initRace(round, riders, bike, staff) {
  const circuit = getCircuit(round)
  const engineerBonus = (staff.chiefEngineer.skill / 100) * 0.005

  const playerRiders = riders.map(r => {
    const bikeOverall = (bike.topSpeed + bike.aero + bike.chassis + bike.braking + bike.electronics) / 5
    const basePace = (r.pace * 0.6 + bikeOverall * 0.4) / 20
    const tyre = 'M'
    return {
      id: r.id,
      name: r.name,
      number: r.number,
      team: 'VR46 independent',
      isPlayer: true,
      pace: r.pace,
      lapTime: circuit.baseTime * (1 + (1 - basePace) * 0.15 + TYRE_PACE_BONUS[tyre] - engineerBonus),
      gap: 0,
      tyre,
      tyreLife: 100,
      pitted: false,
      retired: false,
      dnf: false,
    }
  })

  const aiRiders = AI_RIDERS.map(r => {
    const basePace = r.pace / 20
    return {
      id: r.name,
      name: r.name,
      team: r.team,
      isPlayer: false,
      pace: r.pace,
      lapTime: circuit.baseTime * (1 + (1 - basePace) * 0.15 + TYRE_PACE_BONUS[r.tyre]),
      gap: 0,
      tyre: r.tyre,
      tyreLife: 100,
      pitted: false,
      retired: false,
      dnf: false,
    }
  })

  return {
    circuit,
    lap: 0,
    totalLaps: circuit.laps,
    riders: [...playerRiders, ...aiRiders],
    finished: false,
    strategy: 'normal',
  }
}

export function simulateLap(raceState) {
  if (raceState.finished) return raceState

  const newLap = raceState.lap + 1
  const finished = newLap >= raceState.totalLaps

  const newRiders = raceState.riders.map(r => {
    if (r.retired) return r

    const tyreDeg = TYRE_DEG[r.tyre]
    const wearFactor = Math.max(0, (100 - r.tyreLife) / 100)
    const rand = (Math.random() - 0.5) * 0.006
    const newTyreLife = Math.max(5, r.tyreLife - tyreDeg - Math.random() * 0.4)

    let newLapTime = r.lapTime + wearFactor * 0.04 + rand

    if (r.isPlayer) {
      if (raceState.strategy === 'push') { newLapTime -= 0.005; }
      if (raceState.strategy === 'save') { newLapTime += 0.004; }
    }

    const dnf = !r.dnf && Math.random() < 0.003

    return {
      ...r,
      lapTime: Math.max(raceState.circuit.baseTime * 0.97, newLapTime),
      tyreLife: newTyreLife,
      dnf,
      retired: r.retired || dnf,
    }
  })

  const sorted = [...newRiders].filter(r => !r.retired).sort((a, b) => a.lapTime - b.lapTime)
  let cumGap = 0
  const withGaps = newRiders.map(r => {
    if (r.retired) return { ...r, gap: 999 }
    const idx = sorted.findIndex(s => s.id === r.id)
    if (idx === 0) return { ...r, gap: 0 }
    cumGap = parseFloat((sorted.slice(0, idx).reduce((acc, s) => acc + s.lapTime, 0) -
      idx * sorted[0].lapTime + cumGap * 0.3).toFixed(3))
    return { ...r, gap: Math.max(0, parseFloat((idx * 0.4 + Math.random() * 0.2).toFixed(3))) }
  })

  return {
    ...raceState,
    lap: newLap,
    riders: withGaps,
    finished,
    strategy: raceState.strategy,
  }
}

export function getResults(raceState) {
  const sorted = [...raceState.riders]
    .sort((a, b) => a.retired === b.retired ? a.gap - b.gap : a.retired ? 1 : -1)

  return sorted.map((r, i) => ({
    ...r,
    position: i + 1,
    points: r.retired ? 0 : (POINTS[i] || 0),
  }))
}