import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
  season: 2025,
  round: 1,
  budget: 14.2,

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

  addResult: (result) => set((state) => ({
    results: [...state.results, result],
    round: state.round + 1,
  })),
}))