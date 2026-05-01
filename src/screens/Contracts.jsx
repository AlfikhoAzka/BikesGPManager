import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const MANUFACTURER_OFFERS = [
  {
    id: 'aprilia_factory',
    manufacturer: 'Aprilia',
    model: 'RS-GP25',
    spec: 'factory',
    budgetBonus: 3.0,
    bikeStats: { topSpeed: 18, aero: 17, chassis: 17, braking: 17, electronics: 18 },
    requirement: 'Top 4 in championship',
    available: true,
  },
  {
    id: 'ktm_semi',
    manufacturer: 'KTM',
    model: 'RC16',
    spec: 'semi-factory',
    budgetBonus: 1.5,
    bikeStats: { topSpeed: 16, aero: 15, chassis: 16, braking: 16, electronics: 16 },
    requirement: 'Top 8 in championship',
    available: true,
  },
  {
    id: 'honda_satellite',
    manufacturer: 'Honda',
    model: 'RC213V',
    spec: 'satellite',
    budgetBonus: 0.5,
    bikeStats: { topSpeed: 14, aero: 13, chassis: 14, braking: 14, electronics: 13 },
    requirement: 'No requirement',
    available: true,
  },
  {
    id: 'ducati_factory',
    manufacturer: 'Ducati',
    model: 'Desmosedici GP25',
    spec: 'factory',
    budgetBonus: 4.0,
    bikeStats: { topSpeed: 19, aero: 18, chassis: 18, braking: 19, electronics: 19 },
    requirement: 'Win 3 races this season',
    available: false,
  },
]

const FREE_AGENTS = [
  { id: 'fa1', name: 'Jorge M.', number: 99, overall: 16, pace: 17, salary: 4.0, nationality: 'Spanish' },
  { id: 'fa2', name: 'Raul P.', number: 55, overall: 13, pace: 14, salary: 1.2, nationality: 'Spanish', moto2: true },
  { id: 'fa3', name: 'Cal C.', number: 35, overall: 14, pace: 15, salary: 2.1, nationality: 'British' },
  { id: 'fa4', name: 'Taka N.', number: 30, overall: 13, pace: 13, salary: 1.5, nationality: 'Japanese' },
]

const SPEC_COLOR = {
  factory: 'bg-purple-900 text-purple-300 border-purple-700',
  'semi-factory': 'bg-blue-900 text-blue-300 border-blue-700',
  satellite: 'bg-gray-800 text-gray-300 border-gray-600',
}

const SPEC_LABEL = {
  factory: 'Factory',
  'semi-factory': 'Semi-Factory',
  satellite: 'Satellite',
}

export default function Contracts() {
  const { team, budget, riders, spendBudget } = useGameStore()
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [acceptedManufacturer, setAcceptedManufacturer] = useState(null)
  const [negotiating, setNegotiating] = useState(null)
  const [notification, setNotification] = useState(null)
  const [signedRiders, setSignedRiders] = useState([])

  function showNotif(msg, type = 'success') {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  function acceptManufacturer(offer) {
    if (!offer.available) {
      showNotif('Requirement not met for this offer.', 'error')
      return
    }
    setAcceptedManufacturer(offer)
    setSelectedOffer(null)
    showNotif(`${offer.manufacturer} contract accepted! Takes effect next season.`)
  }

  function signRider(rider) {
    if (budget < rider.salary) {
      showNotif('Not enough budget for this rider.', 'error')
      return
    }
    spendBudget(rider.salary)
    setSignedRiders(s => [...s, rider.id])
    setNegotiating(null)
    showNotif(`${rider.name} signed! €${rider.salary}M/year deducted.`)
  }

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-lg font-semibold mb-1">Contracts & Transfers</h2>
        <p className="text-base text-gray-500">Current: {team.name} · {team.manufacturer} · End of season transfers</p>
      </div>

      {notification && (
        <div className={`px-4 py-3 rounded-lg text-base font-medium ${
          notification.type === 'success'
            ? 'bg-green-900 border border-green-700 text-green-300'
            : 'bg-red-900 border border-red-700 text-red-300'
        }`}>
          {notification.msg}
        </div>
      )}

      {acceptedManufacturer && (
        <div className="bg-purple-950 border border-purple-700 rounded-xl p-4">
          <div className="text-base font-semibold text-purple-300 mb-1">Contract signed for next season</div>
          <div className="text-white font-semibold">{acceptedManufacturer.manufacturer} — {acceptedManufacturer.model}</div>
          <div className="text-sm text-purple-400 mt-1">
            Spec: {SPEC_LABEL[acceptedManufacturer.spec]} · Budget bonus: +€{acceptedManufacturer.budgetBonus}M
          </div>
        </div>
      )}

      <div>
        <h3 className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-3">Manufacturer Offers — Next Season</h3>
        <div className="grid grid-cols-2 gap-3">
          {MANUFACTURER_OFFERS.map(offer => (
            <div
              key={offer.id}
              onClick={() => offer.available && setSelectedOffer(selectedOffer?.id === offer.id ? null : offer)}
              className={`bg-gray-900 border rounded-xl p-4 transition-all ${
                !offer.available ? 'border-gray-800 opacity-50 cursor-not-allowed' :
                selectedOffer?.id === offer.id ? 'border-red-600 cursor-pointer' :
                acceptedManufacturer?.id === offer.id ? 'border-green-600 cursor-pointer' :
                'border-gray-800 hover:border-gray-600 cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-white">{offer.manufacturer}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{offer.model}</div>
                </div>
                <span className={`text-sm px-2 py-0.5 rounded border ${SPEC_COLOR[offer.spec]}`}>
                  {SPEC_LABEL[offer.spec]}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1 mb-3">
                {Object.entries(offer.bikeStats).map(([stat, val]) => (
                  <div key={stat} className="text-center">
                    <div className="text-base text-gray-400 mb-1">{stat.replace('topSpeed', 'Spd').replace('electronics', 'Elec').replace('chassis', 'Cha').replace('braking', 'Brk').replace('aero', 'Aero')}</div>
                    <div className="text-lg font-semibold text-white">{val}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-green-400">+€{offer.budgetBonus}M budget</div>
                <div className="text-sm text-gray-500">{offer.requirement}</div>
              </div>

              {selectedOffer?.id === offer.id && (
                <button
                  onClick={e => { e.stopPropagation(); acceptManufacturer(offer) }}
                  className="mt-3 w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-base font-semibold transition-colors"
                >
                  Accept for Next Season
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-3">Current Riders</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {riders.map((r, i) => (
            <div key={r.id} className={`flex items-center gap-4 px-4 py-3 ${i < riders.length - 1 ? 'border-b border-gray-800' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">
                #{r.number}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white text-base">{r.name}</div>
                <div className="text-sm text-gray-500">Overall {r.overall} · Contract: {r.contractYears} yr remaining</div>
              </div>
              <div className="text-right">
                <div className="text-base font-semibold text-white">€{r.salary}M/yr</div>
                <div className={`text-sm ${r.contractYears <= 1 ? 'text-red-400' : 'text-green-400'}`}>
                  {r.contractYears <= 1 ? 'Expiring' : 'Contracted'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-3">Free Agents</h3>
        <div className="space-y-3">
          {FREE_AGENTS.map(rider => {
            const signed = signedRiders.includes(rider.id)
            const isNegotiating = negotiating === rider.id
            return (
              <div key={rider.id} className={`bg-gray-900 border rounded-xl p-4 transition-all ${signed ? 'border-green-700' : isNegotiating ? 'border-red-600' : 'border-gray-800'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                    #{rider.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-base">{rider.name}</span>
                      {rider.moto2 && <span className="text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded">Moto2 Promotion</span>}
                    </div>
                    <div className="text-sm text-gray-500">{rider.nationality} · Overall {rider.overall} · Pace {rider.pace}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold text-white">€{rider.salary}M/yr</div>
                    {signed ? (
                      <div className="text-sm text-green-400 font-medium">Signed</div>
                    ) : (
                      <button
                        onClick={() => setNegotiating(isNegotiating ? null : rider.id)}
                        className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-lg transition-colors mt-1"
                      >
                        {isNegotiating ? 'Cancel' : 'Negotiate'}
                      </button>
                    )}
                  </div>
                </div>

                {isNegotiating && !signed && (
                  <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Signing fee: <span className="text-white font-medium">€{rider.salary}M</span> deducted from budget.
                      Current budget: <span className="text-green-400 font-medium">€{budget}M</span>
                    </div>
                    <button
                      onClick={() => signRider(rider)}
                      disabled={budget < rider.salary}
                      className={`px-4 py-1.5 rounded-lg text-base font-semibold transition-colors ${
                        budget >= rider.salary
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Sign Rider
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}