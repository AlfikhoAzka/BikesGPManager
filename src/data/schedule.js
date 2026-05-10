export function buildSchedule(season = 2026) {
  const RACE_DATES = [
    { round: 1,  name: 'Thailand',       country: 'Thailand',     date: `${season}-03-01` },
    { round: 2,  name: 'Argentina',      country: 'Argentina',    date: `${season}-03-22` },
    { round: 3,  name: 'COTA',           country: 'USA',          date: `${season}-04-12` },
    { round: 4,  name: 'Jerez',          country: 'Spain',        date: `${season}-04-26` },
    { round: 5,  name: 'Le Mans',        country: 'France',       date: `${season}-05-17` },
    { round: 6,  name: 'Mugello',        country: 'Italy',        date: `${season}-06-07` },
    { round: 7,  name: 'Catalunya',      country: 'Spain',        date: `${season}-06-21` },
    { round: 8,  name: 'Assen',          country: 'Netherlands',  date: `${season}-06-28` },
    { round: 9,  name: 'Silverstone',    country: 'UK',           date: `${season}-08-02` },
    { round: 10, name: 'Austria',        country: 'Austria',      date: `${season}-08-16` },
    { round: 11, name: 'Misano',         country: 'Italy',        date: `${season}-09-06` },
    { round: 12, name: 'Aragon',         country: 'Spain',        date: `${season}-09-20` },
    { round: 13, name: 'Motegi',         country: 'Japan',        date: `${season}-10-04` },
    { round: 14, name: 'Mandalika',      country: 'Indonesia',    date: `${season}-10-11` },
    { round: 15, name: 'Phillip Island', country: 'Australia',    date: `${season}-10-18` },
    { round: 16, name: 'Sepang',         country: 'Malaysia',     date: `${season}-11-01` },
    { round: 17, name: 'Lusail',         country: 'Qatar',        date: `${season}-11-15` },
    { round: 18, name: 'Portimao',       country: 'Portugal',     date: `${season}-11-22` },
    { round: 19, name: 'Valencia',       country: 'Spain',        date: `${season}-11-29` },
    { round: 20, name: 'Brazil',         country: 'Brazil',       date: `${season}-12-13` },
  ]

  const events = []
  RACE_DATES.forEach(race => {
    const raceDate = new Date(race.date + 'T00:00:00')
    const fri = new Date(raceDate); fri.setDate(raceDate.getDate() - 2)
    const sat = new Date(raceDate); sat.setDate(raceDate.getDate() - 1)

    events.push({
      type: 'practice',
      round: race.round,
      circuit: race.name,
      country: race.country,
      date: fri.toISOString().split('T')[0],
      label: `FP1 & FP2 — ${race.name}`,
      icon: '🔧',
    })
    events.push({
      type: 'qualifying',
      round: race.round,
      circuit: race.name,
      country: race.country,
      date: sat.toISOString().split('T')[0],
      label: `Qualifying — ${race.name}`,
      icon: '⏱️',
    })
    events.push({
      type: 'race',
      round: race.round,
      circuit: race.name,
      country: race.country,
      date: race.date,
      label: `Race Day — ${race.name} GP`,
      icon: '🏁',
    })
  })

  const MILESTONES = [
    { date: `${season}-04-01`, type: 'milestone', label: 'Early Contract Window Opens', icon: '📋' },
    { date: `${season}-06-01`, type: 'milestone', label: 'Mid-Season Board Review', icon: '📊' },
    { date: `${season}-07-15`, type: 'milestone', label: 'Summer Break Starts', icon: '⏸️' },
    { date: `${season}-08-01`, type: 'milestone', label: 'Transfer Window Peak', icon: '🔄' },
    { date: `${season}-09-01`, type: 'deadline', label: 'Contract Deadline Approaching', icon: '⏰' },
    { date: `${season}-10-01`, type: 'deadline', label: 'Final Contract Deadline', icon: '🚨' },
    { date: `${season}-11-01`, type: 'milestone', label: 'Season Finale Preparation', icon: '🔥' },
  ]

  MILESTONES.forEach(m => events.push(m))
  return events.sort((a, b) => new Date(a.date) - new Date(b.date))
}