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
          overall: 88,
          pace: 91,
          consistency: 85,
          wetSkill: 80,
          fitness: 90,
          mentalState: 85,
          salary: 3.2,
          contractYears: 2,
        },
        {
          id: 2,
          name: 'Alex E.',
          number: 41,
          overall: 79,
          pace: 80,
          consistency: 78,
          wetSkill: 75,
          fitness: 88,
          mentalState: 82,
          salary: 1.8,
          contractYears: 1,
        },
      ],

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

      staff: {
        chiefEngineer: { name: 'Marco R.', skill: 84 },
        dataAnalyst: { name: 'Yuki T.', skill: 76 },
        setupSpecialist: { name: 'Paulo M.', skill: 81 },
        physicalTrainer: { name: 'Kim S.', skill: 70 },
      },

      results: [],

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