import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

      addResult: (result) => set((state) => {
        const newPoints = state.championshipPoints + result.points
        return {
          results: [...state.results, result],
          round: state.round + 1,
          budget: parseFloat((state.budget + result.points * 0.05).toFixed(1)),
          championshipPoints: newPoints,
          championshipPosition: newPoints > 150 ? 3 : newPoints > 100 ? 5 : 6,
        }
      }),

      addMessage: (message) => set(state => ({
        messages: [{
          id: Date.now(),
          read: false,
          timestamp: new Date().toISOString(),
          ...message,
        }, ...state.messages],
        unreadCount: state.unreadCount + 1,
      })),

      markMessageRead: (id) => set(state => ({
        messages: state.messages.map(m => ({ ...m, read: true})),
        unreadCount: 0,
      })),

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
        const { riders, staff, round, budget } = state
        const messages = []

        riders.forEach(rider => {
          if (round === 1) {
            messages.push({
              from: rider.name,
              fromId: `rider_${rider.id}`,
              type: 'rider',
              subject: 'Ready for the season!',
              preview: 'Looking forward to working with you this season.',
              body: `Hi Manager,\n\nI'm really excited to start this season with the team. I've been working hard during the off-season and I feel ready.\n\nLet's make it a great year!\n\n— ${rider.name}`,
              avatar: rider.number,
              priority: 'normal',
            })
          }
          if (rider.mentalState < 12) {
            messages.push({
              from: rider.name,
              fromId: `rider_${rider.id}`,
              type: 'rider',
              subject: 'Feeling frustrated',
              preview: 'I need to talk about my situation....',
              body: `Hi, \n\nI'll be honest, I'm struggling a bit mentally right now. The results haven't been what i expected and I feel like I need more support from the team. \n\nCan we discuss this? \n\n- ${rider.nname}`,
              avatar: rider.number,
              priority: 'high',
              action: { type: 'boost_morale', riderId: rider.id },
            })
          }
        })

        if (budget < 5) {
          messages.push({
            from: 'Finance Department',
            fromId: 'finance',
            type: 'sponsor',
            subject: 'Budget Warning',
            preview: 'Your budget is running low this season.',
            body: `Manager, \n\nWe want to flag that your remaining budget (£${budget}M) is getting critically low. \n\nPlease review your spending before the next round. \n\n- Finance`,
            avatar: '£',
            priority: 'high',
          })
        }

        messages.push({
          from: 'MotoGP Media',
          fromId: 'media',
          type: 'media',
          subject: 'Press conference request',
          preview: 'We would like to schedule an interview...',
          body: `Dear Team Manager, \n\nWe would like to invite you to a press conference ahead of round ${round + 1}.\n\nPlease let us know your availabliity. \n\n- MotoGP Media Team`,
          avatar: '📰',
          priority: 'normal',
          action: { type: 'press_conference' },
        })

        Object.entries(staff).forEach(([role, person]) => {
          if (round % 3 === 0) {
            messages.push({
              from: person.name,
              fromId: `staff_${role}`,
              type: 'staff',
              subject: 'Technical update',
              preview: `Here's my analysis after Round ${round}...`,
              body: `Hi Manager, \n\nAfter reviewing our data from Round ${round}, I have some recommendations: \n\n• Tyre pressure needs adjustment\n• Suspension geometry could be improved\n• Electronics mapping version 3 might give us an edge\n\nLet me know if you want to discuss in detail. \n\n- ${person.name}`,
              avatar: '🔧',
              priority: 'normal',
            })
          }
        })

        messages.forEach(msg => get().addMessage(msg))
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