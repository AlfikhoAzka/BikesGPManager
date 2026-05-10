import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generatePostRaceMessages, generateSeasonStartMessages } from '../engine/messageEngine'
import { generateRiderDatabase, pickRidersForTeam } from '../data/generateRiders'
import { buildSchedule } from '../data/schedule'

function generateScoutNotes(rider, accuracy) {
  const notes = []
  if (rider.riskTaking >= 17) notes.push('Highly aggressive riding style — fast but crash-prone')
  else if (rider.riskTaking <= 8) notes.push('Very conservative — rarely crashes but may lack aggression')
  if (rider.tyreManagement >= 17) notes.push('Exceptional tyre management — strong in long stints')
  if (rider.setupFeedback >= 17) notes.push('Excellent technical feedback — engineers love working with him')
  if (rider.wetPerformance >= 17) notes.push('Outstanding in wet conditions')
  if (rider.mentalResilience <= 10) notes.push('Shows signs of pressure sensitivity — needs support')
  if (notes.length === 0) notes.push('Well-rounded profile with no major weaknesses')
  return notes.slice(0, 2).join('. ')
}

const DEFAULT_BIKE = {
  model: 'Desmosedici GP23',
  spec: 'satellite',
  topSpeed: 16,
  aero: 14,
  chassis: 15,
  braking: 15,
  electronics: 13,
  upgrades: [],
}

const DEFAULT_RIDERS = [
  {
    id: 1,
    name: 'Fabio Q.',
    number: 20,
    overall: 17,
    pace: 18,
    consistency: 16,
    wetSkill: 15,
    fitness: 17,
    mentalState: 16,
    salary: 3.2,
    contractYears: 2,
  },
  {
    id: 2,
    name: 'Alex E.',
    number: 41,
    overall: 15,
    pace: 15,
    consistency: 14,
    wetSkill: 14,
    fitness: 16,
    mentalState: 15,
    salary: 1.8,
    contractYears: 1,
  },
]

const DEFAULT_STAFF = {
  chiefEngineer: { name: 'Marco R.', skill: 16 },
  dataAnalyst: { name: 'Yuki T.', skill: 14 },
  setupSpecialist: { name: 'Paulo M.', skill: 15 },
  physicalTrainer: { name: 'Kim S.', skill: 13 },
}

const EMPTY_STATE = {
  manager: null,
  season: 2025,
  round: 1,
  budget: 14.2,
  rdBudget: 0,
  isFactoryTeam: false,
  championshipPoints: 0,
  championshipPosition: 20,
  boardTarget: null,
  boardPressure: 0,
  currentDate: new Date('2026-01-01').toISOString(),
  currentDayPhase: 'free',
  satelliteTeams: [],
  team: {
    name: 'Pertamina VR46',
    type: 'independent',
    manufacturer: 'Ducati',
    reputation: 60,
  },
  riders: DEFAULT_RIDERS,
  bike: DEFAULT_BIKE,
  staff: DEFAULT_STAFF,
  results: [],
  messages: [],
  chats: {},
  unreadCount: 0,
  riderDatabase: [],
  grid: [],
  negotiations: {},
  contractOffers: [],
  pendingContracts: [],
  activeScouts: {},
  scoutReports: {},
  scoutedRiders: [],
  agentContacts: {},
  calendarEvents: [], 
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...EMPTY_STATE,

      
      advanceDay: () => set(state => {
      const current = new Date(state.currentDate)
      current.setDate(current.getDate() + 1)
      return { currentDate: current.toISOString() }
    }),

    advanceToNextEvent: () => set(state => {
      const schedule = buildSchedule(state.season)
      const allEvents = [...schedule, ...(state.calendarEvents || [])]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
      const current = new Date(state.currentDate)
      const next = allEvents.find(e => {
        const eventDate = new Date(e.date + 'T00:00:00')
        return eventDate > current
      })
      if (!next) return state
      const nextDate = new Date(next.date + 'T10:00:00')
      return { currentDate: nextDate.toISOString() }
    }),

setDayPhase: (phase) => set({ currentDayPhase: phase }),
      spendBudget: (amount) => set((state) => ({
        budget: parseFloat((state.budget - amount).toFixed(1))
      })),

      upgradeBike: (stat, amount, cost) => set((state) => ({
        budget: parseFloat((state.budget - cost).toFixed(1)),
        bike: {
          ...state.bike,
          [stat]: Math.min(20, state.bike[stat] + amount),
          upgrades: [...state.bike.upgrades, stat],
        }
      })),

      spendRdBudget: (amount) => set(state => ({
        rdBudget: parseFloat((state.rdBudget - amount).toFixed(1))
      })),

      developBike: (stat, amount, cost) => set(state => ({
        rdBudget: parseFloat((state.rdBudget - cost).toFixed(1)),
        bike: {
          ...state.bike,
          [stat]: Math.min(20, state.bike[stat] + amount),
        }
      })),

      addBoardPressure: (amount) => set(state => ({
        boardPressure: Math.min(100, state.boardPressure + amount),
      })),

      reduceBoardPressure: (amount) => set(state => ({
        boardPressure: Math.max(0, state.boardPressure - amount),
      })),

      addSatelliteTeam: (team) => set(state => ({
        satelliteTeams: [...state.satelliteTeams, team],
      })),

      updateSatelliteTeam: (teamId, changes) => set(state => ({
        satelliteTeams: state.satelliteTeams.map(t =>
          t.id === teamId ? { ...t, ...changes } : t
        ),
      })),

      addResult: (result, raceResults) => set((state) => {
      const newPoints = state.championshipPoints + result.points
      const current = new Date(state.currentDate)
      current.setDate(current.getDate() + 1)

      const newState = {
        results: [...state.results, result],
        round: state.round + 1,
        budget: parseFloat((state.budget + result.points * 0.05).toFixed(1)),
        championshipPoints: newPoints,
        championshipPosition: newPoints > 150 ? 3 : newPoints > 100 ? 5 : 6,
        currentDate: current.toISOString(),
      }

      if (raceResults) {
        const postRaceMsgs = generatePostRaceMessages(raceResults, state)
        const formatted = postRaceMsgs.map(msg => ({
          id: Math.floor(Date.now() + Math.random() * 1000),
          read: false,
          timestamp: new Date().toISOString(),
          ...msg,
        }))
        newState.messages = [...formatted, ...state.messages]
        newState.unreadCount = state.unreadCount + formatted.length
      }

      return newState
    }),

      addMessage: (message) => set(state => ({
        messages: [{
          id: Math.floor(Date.now() + Math.random() * 1000),
          read: false,
          timestamp: new Date().toISOString(),
          ...message
        }, ...state.messages],
        unreadCount: state.unreadCount + 1,
      })),

      markMessageRead: (id) => set(state => {
        const msg = state.messages.find(m => m.id === id)
        if (!msg || msg.read) return state
        return {
          messages: state.messages.map(m => m.id === id ? { ...m, read: true } : m),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }
      }),

      markAllRead: () => set(state => ({
        messages: state.messages.map(m => ({ ...m, read: true })),
        unreadCount: 0,
      })),

      addChatMessage: (contactId, message) => set(state => {
        const existing = state.chats[contactId] || []
        return {
          chats: {
            ...state.chats,
            [contactId]: [...existing, {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              ...message,
            }]
          }
        }
      }),

      replyChat: (contactId, text) => set(state => {
        const existing = state.chats[contactId] || []
        return {
          chats: {
            ...state.chats,
            [contactId]: [...existing, {
              id: Date.now(),
              from: 'manager',
              text,
              timestamp: new Date().toISOString(),
            }]
          }
        }
      }),

      generateInboxMessages: () => {
        const state = get()
        const msgs = generateSeasonStartMessages(state)
        msgs.forEach(msg => get().addMessage(msg))
      },

      initNewGame: (manager, team) => {
        const riderDatabase = generateRiderDatabase()
        const teamRiders = pickRidersForTeam(riderDatabase, team.type, 2, team.name)
        teamRiders.forEach(r => { r.teamId = 'player' })

        const boardTarget = team.type === 'factory' ? {
          ducati_factory: { label: 'Podium every race', minPosition: 3 },
          aprilia_factory: { label: 'Top 5 every race', minPosition: 5 },
          ktm_factory: { label: 'Top 6 every race', minPosition: 6 },
          honda_factory: { label: 'Top 8 every race', minPosition: 8 },
          yamaha_factory: { label: 'Top 8 every race', minPosition: 8 },
        }[team.id] : null

        set({
          ...EMPTY_STATE,
          currentDate: new Date('2026-01-01').toISOString(),
          manager: {
            name: manager.name,
            age: manager.age,
            nationality: manager.nationality,
            avatarColor: manager.avatarColor,
            background: manager.background,
            experience: manager.experience,
            skills: manager.skills,
          },
          season: 2026,
          round: 1,
          budget: team.budget,
          rdBudget: team.rdBudget || 0,
          isFactoryTeam: team.type === 'factory',
          boardTarget,
          boardPressure: 0,
          championshipPoints: 0,
          championshipPosition: 20,
          team: {
            name: team.name,
            type: team.type,
            manufacturer: team.manufacturer,
            reputation: team.type === 'factory' ? 85 : 60,
          },
          riders: teamRiders,
          riderDatabase,
          bike: {
            model: `${team.manufacturer} ${
              team.id === 'ducati_factory' ? 'GP26' :
              team.id === 'aprilia_factory' ? 'RS-GP26' :
              team.id === 'ktm_factory' ? 'RC16' :
              team.id === 'honda_factory' ? 'RC213V' :
              team.id === 'yamaha_factory' ? 'YZR-M1' :
              team.id === 'vr46' ? 'GP25' :
              team.id === 'pramac' ? 'YZR-M1' :
              team.id === 'tech3' ? 'RC16' :
              team.id === 'trackhouse' ? 'RS-GP25' :
              team.id === 'lcr' ? 'RC213V' : 'GP24'
            }`,
            spec: team.type,
            topSpeed: team.bike.topSpeed,
            aero: team.bike.aero,
            chassis: team.bike.chassis,
            braking: team.bike.braking,
            electronics: team.bike.electronics,
            upgrades: [],
          },
          staff: DEFAULT_STAFF,
          results: [],
          messages: [],
          chats: {},
          unreadCount: 0,
          satelliteTeams: team.type === 'factory' ? [
            {
              id: `${team.manufacturer.toLowerCase()}_sat_1`,
              name: `${team.manufacturer} Independent A`,
              manufacturer: team.manufacturer,
              supportLevel: 'standard',
              bikeSpec: 'previous',
              budget: 12.0,
              riders: [],
            }
          ] : [],
          grid: [],
        })
        setTimeout(() => get().generateInboxMessages(), 100)
      },

      updateTeam: (changes) => set((state) => ({
        team: { ...state.team, ...changes }
      })),

      resetGame: () => {
        set({ ...EMPTY_STATE })
      },

      updateGridTeam: (teamId, changes) => set(state => ({
        grid: state.grid.map(t => t.id === teamId ? { ...t, ...changes } : t)
      })),

      addGridTeam: () => set(state => {
        const newTeam = {
          id: `custom_${Date.now()}`,
          name: 'New Team',
          manufacturer: 'Ducati',
          type: 'satellite',
          budget: 12.0,
          bike: { topSpeed: 14, aero: 13, chassis: 14, braking: 13, electronics: 12 },
          riderIds: [],
        }
        return { grid: [...state.grid, newTeam] }
      }),

      removeGridTeam: (teamId) => set(state => ({
        grid: state.grid.filter(t => t.id !== teamId)
      })),

      updateRiderInDatabase: (riderId, changes) => set(state => ({
        riderDatabase: state.riderDatabase.map(r => r.id === riderId ? { ...r, ...changes } : r)
      })),

      assignRiderToTeam: (riderId, teamId) => set(state => {
        const grid = state.grid.map(t => {
          if (t.riderIds.includes(riderId)) {
            return { ...t, riderIds: t.riderIds.filter(id => id !== riderId) }
          }
          if (t.id === teamId && t.riderIds.length < 2) {
            return { ...t, riderIds: [...t.riderIds, riderId] }
          }
          return t
        })
        return { grid }
      }),

      initGrid: () => {
        const state = get()
        const db = state.riderDatabase
        if (!db || db.length === 0) return

        const DEFAULT_TEAMS = [
          { id: 'ducati_factory', name: 'Ducati Lenovo', manufacturer: 'Ducati', type: 'factory', budget: 28.0, bike: { topSpeed: 19, aero: 18, chassis: 18, braking: 19, electronics: 19 } },
          { id: 'pramac', name: 'Prima Pramac', manufacturer: 'Ducati', type: 'independent', budget: 16.5, bike: { topSpeed: 17, aero: 15, chassis: 16, braking: 16, electronics: 15 } },
          { id: 'gresini', name: 'Gresini Racing', manufacturer: 'Ducati', type: 'independent', budget: 11.0, bike: { topSpeed: 16, aero: 14, chassis: 15, braking: 15, electronics: 14 } },
          { id: 'vr46', name: 'Pertamina VR46', manufacturer: 'Ducati', type: 'independent', budget: 14.2, bike: { topSpeed: 16, aero: 14, chassis: 15, braking: 15, electronics: 13 } },
          { id: 'aprilia_factory', name: 'Aprilia Racing', manufacturer: 'Aprilia', type: 'factory', budget: 24.0, bike: { topSpeed: 18, aero: 17, chassis: 17, braking: 17, electronics: 18 } },
          { id: 'trackhouse', name: 'Trackhouse Racing', manufacturer: 'Aprilia', type: 'independent', budget: 13.0, bike: { topSpeed: 15, aero: 14, chassis: 14, braking: 14, electronics: 13 } },
          { id: 'ktm_factory', name: 'Red Bull KTM', manufacturer: 'KTM', type: 'factory', budget: 22.0, bike: { topSpeed: 17, aero: 15, chassis: 16, braking: 16, electronics: 15 } },
          { id: 'tech3', name: 'Red Bull KTM Tech3', manufacturer: 'KTM', type: 'independent', budget: 13.8, bike: { topSpeed: 15, aero: 14, chassis: 15, braking: 14, electronics: 13 } },
          { id: 'honda_factory', name: 'Repsol Honda', manufacturer: 'Honda', type: 'factory', budget: 26.0, bike: { topSpeed: 16, aero: 14, chassis: 15, braking: 15, electronics: 14 } },
          { id: 'lcr', name: 'LCR Honda', manufacturer: 'Honda', type: 'independent', budget: 12.5, bike: { topSpeed: 14, aero: 13, chassis: 13, braking: 14, electronics: 12 } },
          { id: 'yamaha_factory', name: 'Monster Yamaha', manufacturer: 'Yamaha', type: 'factory', budget: 23.0, bike: { topSpeed: 16, aero: 15, chassis: 16, braking: 15, electronics: 15 } },
        ]

        const usedRiderIds = new Set()
        const grid = DEFAULT_TEAMS.map(team => {
          const available = db.filter(r =>
            !usedRiderIds.has(r.id) &&
            r.tier === (team.type === 'factory' ? 'elite' : 'good')
          )
          const riderIds = []
          for (let i = 0; i < 2; i++) {
            if (available.length > 0) {
              const idx = Math.floor(Math.random() * available.length)
              const r = available.splice(idx, 1)[0]
              usedRiderIds.add(r.id)
              riderIds.push(r.id)
            }
          }
          return { ...team, riderIds }
        })

        set({ grid })
      },

      startNegotiation: (targetId, type, initialOffer) => set(state => ({
        negotiations: {
          ...state.negotiations,
          [targetId]: {
            targetId,
            type,
            status: 'pending',
            round: 0,
            maxRounds: 3,
            playerOffer: initialOffer,
            agentCounter: null,
            history: [],
            startedAt: Date.now(),
          }
        }
      })),

      updateNegotiation: (targetId, changes) => set(state => ({
        negotiations: {
          ...state.negotiations,
          [targetId]: {
            ...state.negotiations[targetId],
            ...changes,
            history: [
              ...(state.negotiations[targetId]?.history || []),
              { timestamp: Date.now(), ...changes }
            ]
          }
        }
      })),

      closeNegotiation: (targetId) => set(state => {
        const { [targetId]: _, ...rest } = state.negotiations
        return { negotiations: rest }
      }),

      signContract: (riderId, terms) => set(state => {
        const isCurrentRider = state.riders.find(r => r.id === riderId)

        if (isCurrentRider) {
          const renewalMsg = {
            id: Math.floor(Date.now() + Math.random() * 1000),
            read: false,
            timestamp: new Date().toISOString(),
            from: isCurrentRider.name,
            fromId: `rider_${riderId}`,
            type: 'rider',
            priority: 'normal',
            subject: 'Contract renewed — thank you!',
            preview: 'Really happy to be staying with the team.',
            body: `Hi Manager,\n\nI just wanted to say thank you for renewing my contract. I'm really happy to be staying with ${state.team.name} for another ${terms.years} year${terms.years > 1 ? 's' : ''}.\n\nI'll give everything I have to make sure we achieve great results together.\n\n— ${isCurrentRider.name}`,
            actions: [],
          }
          return {
            riders: state.riders.map(r =>
              r.id === riderId
                ? { ...r, contractYears: terms.years, salary: terms.salary, role: terms.role }
                : r
            ),
            budget: parseFloat((state.budget - (terms.signingBonus || 0)).toFixed(1)),
            messages: [renewalMsg, ...state.messages],
            unreadCount: state.unreadCount + 1,
          }
        }

        const newRider = state.riderDatabase.find(r => r.id === riderId)
        if (!newRider) return state

        const signingMsg = {
          id: Math.floor(Date.now() + Math.random() * 1000),
          read: false,
          timestamp: new Date().toISOString(),
          from: newRider.name,
          fromId: `rider_${riderId}`,
          type: 'rider',
          priority: 'normal',
          subject: terms.timing === 'immediate'
            ? 'Excited to join the team!'
            : 'Looking forward to next season!',
          preview: terms.timing === 'immediate'
            ? "Can't wait to get started."
            : "Really excited about joining the team next year.",
          body: terms.timing === 'immediate'
            ? `Hi Manager,\n\nI'm thrilled to be joining ${state.team.name} immediately. This is a great opportunity and I can't wait to get on the bike and start working with the team.\n\nLet's make the most of the rest of the season!\n\n— ${newRider.name}`
            : `Hi Manager,\n\nThank you for the contract offer. I'm really excited to be joining ${state.team.name} for the ${state.season + 1} season.\n\nI've been following the team's progress and I'm confident we can achieve great things together. See you soon!\n\n— ${newRider.name}`,
          actions: [],
        }

        const messages = [signingMsg]

        if (terms.replaceRider && terms.timing === 'next_season') {
          const replacedRider = state.riders.find(r => r.id === terms.replaceRider)
          if (replacedRider && replacedRider.mentalState >= 14) {
            const replacedMsg = {
              id: Math.floor(Date.now() + Math.random() * 1001),
              read: false,
              timestamp: new Date().toISOString(),
              from: replacedRider.name,
              fromId: `rider_${replacedRider.id}`,
              type: 'rider',
              priority: 'high',
              subject: 'I heard the news...',
              preview: "I thought we had a future together.",
              body: `Manager,\n\nI've just heard that I won't be part of the team next season. I won't pretend I'm not disappointed — I genuinely believed in this project and thought we were building something special together.\n\nI gave everything for this team and I'm proud of what we achieved. I hope the new rider serves you well.\n\nGood luck for the future.\n\n— ${replacedRider.name}`,
              actions: [],
            }
            messages.push(replacedMsg)
          }
        }

        if (terms.timing === 'next_season') {
          return {
            pendingContracts: [
              ...(state.pendingContracts || []),
              { riderId, terms, replaceRiderId: terms.replaceRider, joiningSeason: state.season + 1 }
            ],
            budget: parseFloat((state.budget - (terms.signingBonus || 0)).toFixed(1)),
            messages: [...messages, ...state.messages],
            unreadCount: state.unreadCount + messages.length,
          }
        }

        const updatedRiders = terms.replaceRider
          ? state.riders.filter(r => r.id !== terms.replaceRider)
          : state.riders.slice(0, 1)

        return {
          riders: [...updatedRiders, {
            ...newRider,
            contractYears: terms.years,
            salary: terms.salary,
            role: terms.role || 'equal',
            teamId: 'player',
          }],
          riderDatabase: state.riderDatabase.map(r =>
            r.id === riderId ? { ...r, teamId: 'player' } : r
          ),
          budget: parseFloat((state.budget - (terms.signingBonus || 0)).toFixed(1)),
          messages: [...messages, ...state.messages],
          unreadCount: state.unreadCount + messages.length,
        }
      }),

      releaseRider: (riderId) => set(state => ({
        riders: state.riders.filter(r => r.id !== riderId),
        riderDatabase: state.riderDatabase.map(r =>
          r.id === riderId ? { ...r, teamId: null } : r
        ),
      })),

      signStaff: (role, person, salary) => set(state => ({
        staff: {
          ...state.staff,
          [role]: { ...person, salary, contractYears: 1 }
        },
        budget: parseFloat((state.budget - salary).toFixed(1)),
      })),

      addScoutedRider: (riderId) => set(state => ({
        scoutedRiders: state.scoutedRiders.includes(riderId)
          ? state.scoutedRiders
          : [...state.scoutedRiders, riderId],
      })),

      startScout: (riderId, level) => set(state => {
      const costs = { basic: 0, detailed: 0.5 }
      const rounds = { basic: 1, detailed: 3 }
      const cost = costs[level] || 0
      if (state.budget < cost) return state
      return {
        budget: parseFloat((state.budget - cost).toFixed(1)),
        activeScouts: {
          ...state.activeScouts,
          [riderId]: {
            level,
            startRound: state.round,
            completesRound: state.round + (rounds[level] || 1),
            cost,
          }
        }
      }
    }),

    completeScout: (riderId) => set(state => {
      const scout = state.activeScouts[riderId]
      if (!scout) return state
      const rider = state.riderDatabase.find(r => r.id === riderId)
      if (!rider) return state

      const analystSkill = state.staff?.dataAnalyst?.skill || 10
      const baseAccuracy = scout.level === 'basic' ? 0.6 : 0.90
      const accuracy = Math.min(0.98, baseAccuracy + (analystSkill / 20) * 0.15)

      function fuzz(val) {
        if (Math.random() < accuracy) return val
        return Math.max(1, Math.min(20, val + Math.round((Math.random() - 0.5) * 4)))
      }

      const isDetailed = scout.level === 'detailed'

      const report = {
        level: scout.level,
        accuracy: Math.round(accuracy * 100),
        completedRound: state.round,
        name: rider.name,
        nationality: rider.nationality,
        flag: rider.flag,
        tier: rider.tier,
        salary: isDetailed ? `€${rider.salary}M` : `~€${(Math.round(rider.salary * 2) / 2).toFixed(1)}M`,
        qualiPace: fuzz(rider.qualiPace),
        racePace: fuzz(rider.racePace),
        wetPerformance: fuzz(rider.wetPerformance),
        tyreManagement: isDetailed ? fuzz(rider.tyreManagement) : null,
        overtaking: isDetailed ? fuzz(rider.overtaking) : null,
        defending: isDetailed ? fuzz(rider.defending) : null,
        consistency: isDetailed ? fuzz(rider.consistency) : null,
        cornerSpeed: isDetailed ? fuzz(rider.cornerSpeed) : null,
        brakingAbility: isDetailed ? fuzz(rider.brakingAbility) : null,
        mentalResilience: isDetailed ? fuzz(rider.mentalResilience) : null,
        riskTaking: isDetailed ? fuzz(rider.riskTaking) : null,
        setupFeedback: isDetailed ? fuzz(rider.setupFeedback) : null,
        physicalStamina: isDetailed ? fuzz(rider.physicalStamina) : null,
        notes: isDetailed ? generateScoutNotes(rider, accuracy) : null,
      }

      const { [riderId]: _, ...remainingScouts } = state.activeScouts
      return {
        activeScouts: remainingScouts,
        scoutReports: { ...state.scoutReports, [riderId]: report },
        scoutedRiders: state.scoutedRiders.includes(riderId)
          ? state.scoutedRiders
          : [...state.scoutedRiders, riderId],
      }
    }),

    contactAgent: (riderId) => set(state => {
      const rider = state.riderDatabase.find(r => r.id === riderId)
      if (!rider) return state

      const teamRep = state.team.reputation || 60
      const riderTier = { elite: 4, good: 3, midfield: 2, backmarker: 1 }[rider.tier] || 2
      const teamTierMap = { factory: 4, independent: 2 }
      const teamTier = teamTierMap[state.team.type] || 2

      let baseInterest = 50
      if (teamTier >= riderTier) baseInterest = 70
      if (teamTier > riderTier) baseInterest = 85
      if (teamTier < riderTier) baseInterest = 30
      baseInterest += (teamRep - 60) * 0.3
      baseInterest = Math.max(5, Math.min(95, baseInterest + (Math.random() - 0.5) * 20))

      const interest = Math.round(baseInterest)
      const status = interest >= 70 ? 'keen' : interest >= 40 ? 'open' : 'reluctant'

      const responses = {
        keen: [
          `${rider.name}'s agent says he's very interested. A move to your team would be exciting for him.`,
          `Great news — ${rider.name} is actively looking for new opportunities and your team is on his shortlist.`,
          `${rider.name} has been following your team's progress closely. His agent says he'd welcome a conversation.`,
        ],
        open: [
          `${rider.name} is open to discussions but has other options on the table. Budget will be key.`,
          `The agent says ${rider.name} is happy where he is but wouldn't rule out a move for the right project.`,
          `${rider.name} is evaluating his options. Your team is a possibility but not a priority right now.`,
        ],
        reluctant: [
          `${rider.name}'s agent was polite but clear — he's not looking to move at this time.`,
          `The agent says ${rider.name} is committed to his current team and isn't considering other offers.`,
          `${rider.name} is focused on his current project. His agent suggested revisiting in the off-season.`,
        ],
      }

      const pool = responses[status]
      const message = pool[Math.floor(Math.random() * pool.length)]

      return {
        agentContacts: {
          ...state.agentContacts,
          [riderId]: {
            interest,
            status,
            message,
            contactedRound: state.round,
          }
        }
      }
    }),

    addCalendarEvent: (event) => set(state => ({
      calendarEvents: [...state.calendarEvents, { id: Date.now(), ...event }]
    })),

    removeCalendarEvent: (eventId) => set(state => ({
      calendarEvents: state.calendarEvents.filter(e => e.id !== eventId)
    })),

    }),
    {
      name: 'motogp-manager-save',
    }
  )
)