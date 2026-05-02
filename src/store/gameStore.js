import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generatePostRaceMessages, generateSeasonStartMessages } from '../engine/messageEngine'
import { generateRiderDatabase, pickRidersForTeam } from '../data/generateRiders'

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
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...EMPTY_STATE,

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
        const newState = {
          results: [...state.results, result],
          round: state.round + 1,
          budget: parseFloat((state.budget + result.points * 0.05).toFixed(1)),
          championshipPoints: newPoints,
          championshipPosition: newPoints > 150 ? 3 : newPoints > 100 ? 5 : 6,
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
          { id: 'pramac', name: 'Prima Pramac', manufacturer: 'Ducati', type: 'satellite', budget: 16.5, bike: { topSpeed: 17, aero: 15, chassis: 16, braking: 16, electronics: 15 } },
          { id: 'gresini', name: 'Gresini Racing', manufacturer: 'Ducati', type: 'independent', budget: 11.0, bike: { topSpeed: 16, aero: 14, chassis: 15, braking: 15, electronics: 14 } },
          { id: 'vr46', name: 'Pertamina VR46', manufacturer: 'Ducati', type: 'satellite', budget: 14.2, bike: { topSpeed: 16, aero: 14, chassis: 15, braking: 15, electronics: 13 } },
          { id: 'aprilia_factory', name: 'Aprilia Racing', manufacturer: 'Aprilia', type: 'factory', budget: 24.0, bike: { topSpeed: 18, aero: 17, chassis: 17, braking: 17, electronics: 18 } },
          { id: 'trackhouse', name: 'Trackhouse Racing', manufacturer: 'Aprilia', type: 'satellite', budget: 13.0, bike: { topSpeed: 15, aero: 14, chassis: 14, braking: 14, electronics: 13 } },
          { id: 'ktm_factory', name: 'Red Bull KTM', manufacturer: 'KTM', type: 'factory', budget: 22.0, bike: { topSpeed: 17, aero: 15, chassis: 16, braking: 16, electronics: 15 } },
          { id: 'tech3', name: 'Red Bull KTM Tech3', manufacturer: 'KTM', type: 'satellite', budget: 13.8, bike: { topSpeed: 15, aero: 14, chassis: 15, braking: 14, electronics: 13 } },
          { id: 'honda_factory', name: 'Repsol Honda', manufacturer: 'Honda', type: 'factory', budget: 26.0, bike: { topSpeed: 16, aero: 14, chassis: 15, braking: 15, electronics: 14 } },
          { id: 'lcr', name: 'LCR Honda', manufacturer: 'Honda', type: 'satellite', budget: 12.5, bike: { topSpeed: 14, aero: 13, chassis: 13, braking: 14, electronics: 12 } },
          { id: 'yamaha_factory', name: 'Monster Yamaha', manufacturer: 'Yamaha', type: 'factory', budget: 23.0, bike: { topSpeed: 16, aero: 15, chassis: 16, braking: 15, electronics: 15 } },
        ]

        const usedRiderIds = new Set()
        const grid = DEFAULT_TEAMS.map(team => {
          const available = db.filter(r =>
            !usedRiderIds.has(r.id) &&
            r.tier === (team.type === 'factory' ? 'elite' : team.type === 'satellite' ? 'good' : 'midfield')
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
    }),
    {
      name: 'motogp-manager-save',
    }
  )
)