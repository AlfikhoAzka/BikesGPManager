const CIRCUITS = [
  { name: 'Thailand', country: 'Thailand', laps: 26, baseTime: 1.421 },
  { name: 'Argentina', country: 'Argentina', laps: 25, baseTime: 1.572 },
  { name: 'COTA', country: 'USA', laps: 20, baseTime: 2.011 },
  { name: 'Jerez', country: 'Spain', laps: 25, baseTime: 1.387 },
  { name: 'Le Mans', country: 'France', laps: 27, baseTime: 1.431 },
  { name: 'Mugello', country: 'Italy', laps: 23, baseTime: 1.471 },
  { name: 'Catalunya', country: 'Spain', laps: 24, baseTime: 1.421 },
  { name: 'Assen', country: 'Netherlands', laps: 26, baseTime: 1.361 },
  { name: 'Silverstone', country: 'UK', laps: 20, baseTime: 2.001 },
  { name: 'Austria', country: 'Austria', laps: 28, baseTime: 1.234 },
  { name: 'Misano', country: 'Italy', laps: 27, baseTime: 1.431 },
  { name: 'Aragon', country: 'Spain', laps: 23, baseTime: 1.467 },
  { name: 'Motegi', country: 'Japan', laps: 24, baseTime: 1.456 },
  { name: 'Mandalika', country: 'Indonesia', laps: 27, baseTime: 1.412 },
  { name: 'Phillip Island', country: 'Australia', laps: 27, baseTime: 1.291 },
  { name: 'Sepang', country: 'Malaysia', laps: 20, baseTime: 2.011 },
  { name: 'Lusail', country: 'Qatar', laps: 22, baseTime: 1.572 },
  { name: 'Portimao', country: 'Portugal', laps: 25, baseTime: 1.421 },
  { name: 'Valencia', country: 'Spain', laps: 27, baseTime: 1.411 },
  { name: 'Brazil', country: 'Brazil', laps: 24, baseTime: 1.445 },
]

const AI_RIDERS = [
  { name: 'M. Marquez', number: 93, team: 'Ducati Lenovo', manufacturer: 'Ducati', type: 'factory', pace: 20, tyre: 'S' },
  { name: 'F. Bagnaia', number: 63, team: 'Ducati Lenovo', manufacturer: 'Ducati', type: 'factory', pace: 19, tyre: 'M' },
  { name: 'M. Bezzecchi', number: 72, team: 'Aprilia Racing', manufacturer: 'Aprilia', type: 'factory', pace: 18, tyre: 'M' },
  { name: 'J. Martin', number: 89, team: 'Aprilia Racing', manufacturer: 'Aprilia', type: 'factory', pace: 18, tyre: 'M' },
  { name: 'P. Acosta', number: 37, team: 'Red Bull KTM', manufacturer: 'KTM', type: 'factory', pace: 18, tyre: 'M' },
  { name: 'F. Quartararo', number: 20, team: 'Monster Yamaha', manufacturer: 'Yamaha', type: 'factory', pace: 17, tyre: 'M' },
  { name: 'B. Binder', number: 33, team: 'Red Bull KTM', manufacturer: 'KTM', type: 'factory', pace: 16, tyre: 'H' },
  { name: 'L. Marini', number: 10, team: 'Honda HRC', manufacturer: 'Honda', type: 'factory', pace: 15, tyre: 'M' },
  { name: 'J. Mir', number: 36, team: 'Honda HRC', manufacturer: 'Honda', type: 'factory', pace: 15, tyre: 'M' },
  { name: 'A. Rins', number: 42, team: 'Monster Yamaha', manufacturer: 'Yamaha', type: 'factory', pace: 15, tyre: 'S' },

  { name: 'A. Marquez', number: 73, team: 'Gresini Racing', manufacturer: 'Ducati', type: 'independent', pace: 17, tyre: 'S' },
  { name: 'F. Di Giannantonio', number: 49, team: 'Pertamina VR46', manufacturer: 'Ducati', type: 'independent', pace: 16, tyre: 'M' },
  { name: 'T. Razgatlioglu', number: 54, team: 'Prima Pramac', manufacturer: 'Yamaha', type: 'independent', pace: 17, tyre: 'M' },
  { name: 'M. Vinales', number: 12, team: 'KTM Tech3', manufacturer: 'KTM', type: 'independent', pace: 16, tyre: 'M' },
  { name: 'E. Bastianini', number: 23, team: 'KTM Tech3', manufacturer: 'KTM', type: 'independent', pace: 16, tyre: 'M' },
  { name: 'R. Fernandez', number: 25, team: 'Trackhouse Racing', manufacturer: 'Aprilia', type: 'independent', pace: 15, tyre: 'M' },
  { name: 'A. Ogura', number: 79, team: 'Trackhouse Racing', manufacturer: 'Aprilia', type: 'independent', pace: 15, tyre: 'M' },
  { name: 'J. Zarco', number: 5, team: 'LCR Honda', manufacturer: 'Honda', type: 'independent', pace: 15, tyre: 'M' },
  { name: 'F. Morbidelli', number: 21, team: 'Pertamina VR46', manufacturer: 'Ducati', type: 'independent', pace: 15, tyre: 'H' },
  { name: 'J. Miller', number: 43, team: 'Prima Pramac', manufacturer: 'Yamaha', type: 'independent', pace: 14, tyre: 'H' },
  { name: 'F. Aldeguer', number: 54, team: 'Gresini Racing', manufacturer: 'Ducati', type: 'independent', pace: 14, tyre: 'M' },
  { name: 'D. Moreira', number: 7, team: 'LCR Honda', manufacturer: 'Honda', type: 'independent', pace: 13, tyre: 'M' },
]

const TYRE_DEG = { S: 1.9, M: 1.2, H: 0.7 }
const TYRE_PACE_BONUS = { S: 0.008, M: 0, H: -0.005 }
const POINTS = [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

export function getCircuit(round) {
  return CIRCUITS[(round - 1) % CIRCUITS.length]
}

export function initRace(round, riders, bike, staff, teamName) {
  const circuit = getCircuit(round)

  const engineerSkill = staff?.chiefEngineer?.skill || 10
  const engineerBonus = (engineerSkill / 20) * 0.008

  const setupSkill = staff?.setupSpecialist?.skill || 10
  const setupBonus = (setupSkill / 20) * 0.004

  const playerRiders = riders.map(r => {
    const bikeOverall = (
      bike.topSpeed + bike.aero + bike.chassis + bike.braking + bike.electronics
    ) / 5

    const basePace = (r.pace * 0.6 + bikeOverall * 0.4) / 20
    const tyre = 'M'

    return {
      id: r.id,
      name: r.name,
      number: r.number,
      team: teamName || 'Player Team',
      manufacturer: bike.model?.split(' ')[0] || 'Ducati',
      isPlayer: true,
      pace: r.pace,
      consistency: r.consistency || 14,
      wetSkill: r.wetSkill || 14,
      lapTime: circuit.baseTime * (
        1 + (1 - basePace) * 0.18 + TYRE_PACE_BONUS[tyre] - engineerBonus - setupBonus
      ),
      gap: 0,
      tyre,
      tyreLife: 100,
      pitted: false,
      retired: false,
      dnf: false,
    }
  })

  const playerNames = new Set(riders.map(r => r.name.split(' ')[1] || r.name))
  const filteredAI = AI_RIDERS.filter(r => {
    const lastName = r.name.split(' ')[1] || r.name
    return !playerNames.has(lastName)
  })

  const aiRiders = filteredAI.map(r => {
    const basePace = r.pace / 20
    const raceVariance = (Math.random() - 0.5) * 0.02
    return {
      id: r.name,
      name: r.name,
      number: r.number,
      team: r.team,
      manufacturer: r.manufacturer,
      isPlayer: false,
      pace: r.pace,
      lapTime: circuit.baseTime * (
        1 + (1 - basePace) * 0.18 + TYRE_PACE_BONUS[r.tyre] + raceVariance
      ),
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
    const newTyreLife = Math.max(5, r.tyreLife - tyreDeg - Math.random() * 0.3)

    let newLapTime = r.lapTime + wearFactor * 0.05 + rand

    if (r.isPlayer) {
      if (raceState.strategy === 'push') {
        newLapTime -= 0.006
      }
      if (raceState.strategy === 'save') {
        newLapTime += 0.005
        r.tyreLife = Math.min(100, r.tyreLife + 0.3)
      }
    }

    const dnfChance = r.isPlayer ? 0.002 : 0.0025
    const dnf = !r.dnf && Math.random() < dnfChance

    return {
      ...r,
      lapTime: Math.max(raceState.circuit.baseTime * 0.96, newLapTime),
      tyreLife: newTyreLife,
      dnf,
      retired: r.retired || dnf,
    }
  })

  const active = [...newRiders].filter(r => !r.retired).sort((a, b) => a.lapTime - b.lapTime)

  const withGaps = newRiders.map(r => {
    if (r.retired) return { ...r, gap: 999 }
    const idx = active.findIndex(s => s.id === r.id)
    if (idx === 0) return { ...r, gap: 0 }
    const gap = parseFloat((idx * 0.35 + Math.random() * 0.15).toFixed(3))
    return { ...r, gap }
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
  const sorted = [...raceState.riders].sort((a, b) =>
    a.retired === b.retired ? a.gap - b.gap : a.retired ? 1 : -1
  )

  return sorted.map((r, i) => ({
    ...r,
    position: i + 1,
    points: r.retired ? 0 : (POINTS[i] || 0),
  }))
}

export function getCircuitList() {
  return CIRCUITS
}