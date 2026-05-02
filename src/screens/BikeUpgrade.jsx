import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import StarRating from '../components/StarRating'

const upgrades = [
  { id: 'topSpeed', label: 'Seamless Gearbox', desc: '+1 top speed, +1 braking', cost: 1.8, stats: { topSpeed: 1, braking: 1 } },
  { id: 'aero', label: 'New Aero Winglet Kit', desc: '+2 aero, -1 top speed', cost: 2.1, stats: { aero: 2, topSpeed: -1 } },
  { id: 'electronics', label: 'Bosch Electronics v9', desc: '+2 electronics, +1 braking', cost: 3.0, stats: { electronics: 2, braking: 1 } },
  { id: 'chassis', label: 'Carbon Fibre Chassis', desc: '+2 chassis rigidity', cost: 2.5, stats: { chassis: 2 } },
  { id: 'braking', label: 'Brembo Brake Package', desc: '+1 braking, +1 electronics', cost: 1.5, stats: { braking: 1, electronics: 1 } },
]

export default function BikeUpgrade() {
  const { bike, budget, upgradeBike } = useGameStore()
  const [notification, setNotification] = useState(null)

  const alreadyUpgraded = bike.upgrades || []

  const bikeOverall = Math.round(
    (bike.topSpeed + bike.aero + bike.chassis + bike.braking + bike.electronics) / 5
  )

  function handleUpgrade(upgrade) {
    if (budget < upgrade.cost) {
      setNotification({ msg: 'Not enough budget!', type: 'error' })
      setTimeout(() => setNotification(null), 2500)
      return
    }
    const entries = Object.entries(upgrade.stats)
    entries.forEach(([stat, amount], i) => {
      upgradeBike(stat, amount, i === 0 ? upgrade.cost : 0)
    })
    setNotification({ msg: `${upgrade.label} installed successfully!`, type: 'success' })
    setTimeout(() => setNotification(null), 2500)
  }

  const factoryProgress = 1
  const factoryTarget = 3

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-lg font-semibold mb-1">Bike & Upgrades</h2>
        <p className="text-base text-gray-500">{bike.model} · {bike.spec === 'factory' ? 'Factory Spec' : 'Independent Spec'}</p>
      </div>

      {notification && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          notification.type === 'success'
            ? 'bg-green-900 border border-green-700 text-green-300'
            : 'bg-red-900 border border-red-700 text-red-300'
        }`}>
          {notification.msg}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-base font-semibold text-white">{bike.model}</div>
            <div className="text-base text-gray-500 mt-0.5">
              Overall: <span className="text-blue-400 font-semibold">{bikeOverall}/20</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base text-gray-500 mb-1">Budget remaining</div>
            <div className="text-xl font-semibold text-green-400">€{budget}M</div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Top Speed', value: bike.topSpeed },
            { label: 'Aero', value: bike.aero },
            { label: 'Chassis', value: bike.chassis },
            { label: 'Braking', value: bike.braking },
            { label: 'Electronics', value: bike.electronics },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-800 rounded-xl p-3 flex flex-col gap-2">
              <div className="text-base text-gray-400">{stat.label}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <StarRating value={stat.value} max={20} size="sm" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-950 border border-amber-800 rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-base font-semibold text-amber-300 mb-1">Upgrade to Factory Spec?</div>
            <div className="text-sm text-amber-500 leading-relaxed">
              Finish P5 or better in {factoryTarget} consecutive races + top-4 in championship.
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-3xl font-bold text-amber-300">{factoryProgress}/{factoryTarget}</div>
            <div className="text-sm text-amber-600">races met</div>
          </div>
        </div>
        <div className="mt-3 bg-amber-900 rounded-full h-1.5">
          <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${(factoryProgress / factoryTarget) * 100}%` }} />
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-3">Available Upgrades</h3>
        <div className="space-y-3">
          {upgrades.map(upgrade => {
            const bought = alreadyUpgraded.includes(upgrade.id)
            const canAfford = budget >= upgrade.cost
            return (
              <div key={upgrade.id} className={`bg-gray-900 border rounded-xl p-4 flex items-center justify-between gap-4 ${
                bought ? 'border-green-800 opacity-60' : 'border-gray-800'
              }`}>
                <div>
                  <div className="text-base font-semibold text-white">{upgrade.label}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{upgrade.desc}</div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-base font-semibold text-gray-300">€{upgrade.cost}M</div>
                  {bought ? (
                    <div className="px-4 py-2 rounded-lg bg-green-900 text-green-400 text-sm font-medium">
                      Installed
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(upgrade)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        canAfford
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Purchase
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}