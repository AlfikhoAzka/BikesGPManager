import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generatePostRaceMessages, generateSeasonStartMessages } from '../engine/messageEngine'

export const useGameStore = create(
  persist(
    (set, get) => ({
      manager: null,
      season: 2025,
      round: 1,
      budget: 14.2,
      championshipPoints: 87,
      championshipPosition: 6,

      team: {
        name: 'Pertamina VR46 Satellite',
        type: 'satellite',
        manufacturer: 'Ducati',
        reputation: 72,
      },

      riders: [
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
      ],

      bike: {
        model: 'Desmosedici GP23',
        spec: 'satellite',
        topSpeed: 16,
        aero: 14,
        chassis: 15,
        braking: 15,
        electronics: 13,
        upgrades: [],
      },

      staff: {
        chiefEngineer: { name: 'Marco R.', skill: 16 },
        dataAnalyst: { name: 'Yuki T.', skill: 14 },
        setupSpecialist: { name: 'Paulo M.', skill: 15 },
        physicalTrainer: { name: 'Kim S.', skill: 13 },
      },

      results: [],

      messages: [],
      chats: {},
      unreadCount: 0,

      spendBudget: (amount) => set((state) => ({
        budget: parseFloat((state.budget - amount).toFixed(1))
      })),

      upgradeBike: (stat, amount, cost) => set((state) => ({
        budget: parseFloat((state.budget - cost).toFixed(1)),
        bike: {
          ...state.bike,
          [stat]: Math.min(100, state.bike[stat] + amount),
          upgrades: [...state.bike.upgrades, stat],
        }
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
        messages: state.messages.map(m => ({ ...m, read: true})),
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

      initNewGame: (manager, team) => set({
        season: 2025,
        round: 1,
        budget: team.budget,
        championshipPoints: 0,
        championshipPosition: 20,
        results: [],
        
        manager: {
          name: manager.name,
          nationality: manager.nationality,
          avatarColor: manager.avatarColor,
        },
        team: {
          name: team.name,
          type: team.type,
          manufacturer: team.manufacturer,
          reputation: 60,
        },
        bike: {
          model: `${team.manufacturer} ${team.id === 'vr46' ? 'GP23' : team.id === 'lcr' ? 'RC213V' : team.id === 'tech3' ? 'RC16' : team.id === 'trackhouse' ? 'RS-GP' : 'GP23'}`,
          spec: team.type,
          topSpeed: team.bike.topSpeed,
          aero: team.bike.aero,
          chassis: team.bike.chassis,
          braking: team.bike.braking,
          electronics: team.bike.electronics,
          upgrades: [],
        },
      }),

      updateTeam: (changes) => set((state) => ({
        team: { ...state.team, ...changes }
      })),



      resetGame: () => set({
        season: 2025,
        round: 1,
        budget: 14.2,
        championshipPoints: 87,
        championshipPosition: 6,
        results: [],
        bike: {
          model: 'Desmosedici GP23',
          spec: 'satellite',
          topSpeed: 82,
          aero: 75,
          chassis: 78,
          braking: 80,
          electronics: 71,
          upgrades: [],
        },
      }),
    }),
    {
      name: 'bikesgp-manager-save',
    }
  )
)