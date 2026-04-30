import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const upgrades = [
  { id: 'topSpeed', label: 'Seamless gearbox', desc: '+4 top speed, +3 braking', cost: 1.8, stats: { topSpeed: 4, braking: 3 } },
  { id: 'aero', label: 'New aero winglet kit', desc: '+6 aero, -1 top speed', cost: 2.1, stats: { aero: 6, topSpeed: -1 } },
  { id: 'electronics', label: 'Bosch electronics v9', desc: '+8 electronics, +2 braking', cost: 3.0, stats: { electronics: 8, braking: 2 } },
  { id: 'chassis', label: 'Carbon fibre chassis', desc: '+7 chassis rigidity', cost: 2.5, stats: { chassis: 7 } },
  { id: 'braking', label: 'Brembo brake package', desc: '+5 braking, +2 electronics', cost: 1.5, stats: { braking: 5, electronics: 2 } },
]

function StatBar({ value, color = 'bg-red-500' }) {
  return (
    <div className="w-full bg-gray-800 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
  )
}

export default function BikeUpgrade() {
  const { bike, budget, upgradeBike } = useGameStore()
  const [notification, setNotification] = useState(null)

  const alreadyUpgraded = bike.upgrades || []

  const bikeOverall = Math.round(
    (bike.topSpeed + bike.aero + bike.chassis + bike.braking + bike.electronics) / 5
  )

  function handleUpgrade(upgrade) {
    if (budget < upgrade.cost) {
      setNotification({ msg: 'Budget tidak cukup!', type: 'error' })
      setTimeout(() => setNotification(null), 2500)
      return
    }
    Object.entries(upgrade.stats).forEach(([stat, amount]) => {
      upgradeBike(stat, amount, upgrade.id === Object.keys(upgrade.stats)[0] ? upgrade.cost : 0)
    })
    setNotification({ msg: `${upgrade.label} berhasil dipasang!`, type: 'success' })
    setTimeout(() => setNotification(null), 2500)
  }

  const factoryProgress = 1
  const factoryTarget = 3

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-lg font-semibold mb-1">Motor & Upgrade</h2>
        <p className="text-sm text-gray-500">{bike.model} · {bike.spec === 'satellite' ? 'Satellite Spec' : 'Factory Spec'}</p>
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
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="font-semibold text-white">{bike.model}</div>
            <div className="text-xs text-gray-500 mt-0.5">Overall rating: <span className="text-blue-400 font-semibold">{bikeOverall}/100</span></div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Budget tersisa</div>
            <div className="text-lg font-semibold text-green-400">€{budget}M</div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Top speed', value: bike.topSpeed, color: 'bg-red-500' },
            { label: 'Aero', value: bike.aero, color: 'bg-blue-500' },
            { label: 'Chassis', value: bike.chassis, color: 'bg-yellow-500' },
            { label: 'Braking', value: bike.braking, color: 'bg-orange-500' },
            { label: 'Electronics', value: bike.electronics, color: 'bg-purple-500' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-400">{stat.label}</span>
                <span className="text-white font-medium">{stat.value}/100</span>
              </div>
              <StatBar value={stat.value} color={stat.color} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-950 border border-amber-800 rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold text-amber-300 mb-1">Upgrade ke Factory Spec?</div>
            <div className="text-xs text-amber-500 leading-relaxed">
              Butuh finish P5 atau lebih di {factoryTarget} race berturut-turut + posisi top-4 di kejuaraan.
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-amber-300">{factoryProgress}/{factoryTarget}</div>
            <div className="text-xs text-amber-600">race terpenuhi</div>
          </div>
        </div>
        <div className="mt-3 bg-amber-900 rounded-full h-1.5">
          <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${(factoryProgress/factoryTarget)*100}%` }} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Upgrade tersedia</h3>
        <div className="space-y-3">
          {upgrades.map(upgrade => {
            const bought = alreadyUpgraded.includes(upgrade.id)
            const canAfford = budget >= upgrade.cost
            return (
              <div key={upgrade.id} className={`bg-gray-900 border rounded-xl p-4 flex items-center justify-between gap-4 ${
                bought ? 'border-green-800 opacity-60' : 'border-gray-800'
              }`}>
                <div>
                  <div className="font-medium text-white text-sm">{upgrade.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{upgrade.desc}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-sm text-gray-400">€{upgrade.cost}M</div>
                  {bought ? (
                    <div className="px-3 py-1.5 rounded-lg bg-green-900 text-green-400 text-xs font-medium">
                      Terpasang
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(upgrade)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        canAfford
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Beli
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