import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import StarRating from '../components/StarRating'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STAFF_ROLES = [
  { key: 'chiefEngineer', label: 'Chief Engineer' },
  { key: 'dataAnalyst', label: 'Data Analyst' },
  { key: 'setupSpecialist', label: 'Setup Specialist' },
  { key: 'physicalTrainer', label: 'Physical Trainer' },
]

const MANUFACTURERS = ['All', 'Ducati', 'Aprilia', 'KTM', 'Honda', 'Yamaha']
const TIERS = ['All', 'elite', 'good', 'midfield', 'backmarker']

const TIER_COLOR = {
  elite: 'bg-yellow-900 text-yellow-300 border-yellow-700',
  good: 'bg-blue-900 text-blue-300 border-blue-700',
  midfield: 'bg-gray-800 text-gray-300 border-gray-600',
  backmarker: 'bg-red-950 text-red-400 border-red-800',
}

// Klausul kontrak
const CONTRACT_CLAUSES = [
  {
    id: 'factory_full',
    label: 'Full Factory Contract',
    desc: 'Rider represents manufacturer as works rider. Access to latest spec, full technical support, highest salary expectations.',
    icon: '🏭',
    color: 'border-purple-700 bg-purple-950',
    badge: 'bg-purple-900 text-purple-300',
    availableFor: ['factory'],
    effect: 'Best bike spec, +20% salary demand, full media obligations',
  },
  {
    id: 'factory_development',
    label: 'Factory Development Contract',
    desc: 'Rider joins as a development asset. Lower salary, more testing duties, potential promotion path.',
    icon: '🔬',
    color: 'border-blue-700 bg-blue-950',
    badge: 'bg-blue-900 text-blue-300',
    availableFor: ['factory'],
    effect: 'Testing duties, -15% salary, promotion clause included',
  },
  {
    id: 'independent_works',
    label: 'Independent Works Contract',
    desc: 'Rider leads an independent team with manufacturer backing. Semi-factory spec bike with some R&D access.',
    icon: '⚙️',
    color: 'border-cyan-700 bg-cyan-950',
    badge: 'bg-cyan-900 text-cyan-300',
    availableFor: ['factory', 'independent'],
    effect: 'Previous-gen factory spec, +factory support clause',
  },
  {
    id: 'independent_standard',
    label: 'Standard Independent Contract',
    desc: 'Standard deal for an independent team. No factory obligations, full team flexibility.',
    icon: '📋',
    color: 'border-gray-600 bg-gray-800',
    badge: 'bg-gray-700 text-gray-300',
    availableFor: ['independent'],
    effect: 'Standard spec bike, no manufacturer obligations',
  },
  {
    id: 'loan_factory',
    label: 'Factory Loan Contract',
    desc: 'Factory team loans rider to an independent team for development. Factory retains contract rights.',
    icon: '🔄',
    color: 'border-amber-700 bg-amber-950',
    badge: 'bg-amber-900 text-amber-300',
    availableFor: ['factory'],
    effect: 'Rider races for independent, factory pays partial salary',
  },
  {
    id: 'buyout_clause',
    label: 'Contract with Buyout Clause',
    desc: 'Standard contract with a fixed buyout amount. Other teams can trigger clause to sign the rider.',
    icon: '💸',
    color: 'border-green-700 bg-green-950',
    badge: 'bg-green-900 text-green-300',
    availableFor: ['factory', 'independent'],
    effect: 'Buyout clause: €3M–€8M depending on rider tier',
  },
  {
    id: 'performance_bonus',
    label: 'Performance-Based Contract',
    desc: 'Lower base salary with race win / podium bonus structure. Good for budget teams.',
    icon: '🏆',
    color: 'border-yellow-700 bg-yellow-950',
    badge: 'bg-yellow-900 text-yellow-300',
    availableFor: ['factory', 'independent'],
    effect: 'Base -20%, +€200k per win, +€100k per podium',
  },
  {
    id: 'option_year',
    label: 'Contract with Option Year',
    desc: 'Team holds the right to extend the contract by one year at a fixed rate.',
    icon: '📅',
    color: 'border-indigo-700 bg-indigo-950',
    badge: 'bg-indigo-900 text-indigo-300',
    availableFor: ['factory', 'independent'],
    effect: 'Team option to extend +1 year at current salary',
  },
  {
    id: 'no_compete',
    label: 'Exclusive Manufacturer Contract',
    desc: 'Rider cannot test or sign with another manufacturer during contract. Locks loyalty.',
    icon: '🔒',
    color: 'border-red-700 bg-red-950',
    badge: 'bg-red-900 text-red-300',
    availableFor: ['factory'],
    effect: 'No manufacturer switch clause, +10% salary',
  },
  {
    id: 'mentorship',
    label: 'Mentorship & Legacy Contract',
    desc: 'Veteran rider contract focused on developing young talent alongside racing.',
    icon: '🎓',
    color: 'border-orange-700 bg-orange-950',
    badge: 'bg-orange-900 text-orange-300',
    availableFor: ['factory', 'independent'],
    effect: 'Rider mentors junior, +staff development bonus per race',
  },
]

// ─── NEGOTIATION MODAL ────────────────────────────────────────────────────────

function NegotiationModal({ target, type, onClose, onSign }) {
  const { budget, team, negotiations, startNegotiation, closeNegotiation } = useGameStore()

  const availableClauses = CONTRACT_CLAUSES.filter(c =>
    c.availableFor.includes(team.type) || c.availableFor.includes('independent')
  )

  const [salary, setSalary] = useState(target.salary || 1.0)
  const [years, setYears] = useState(1)
  const [signingBonus, setSigningBonus] = useState(0)
  const [selectedClause, setSelectedClause] = useState(availableClauses[0]?.id || '')
  const [stage, setStage] = useState('offer')
  const [agentResponse, setAgentResponse] = useState(null)
  const [result, setResult] = useState(null)

  const clauseObj = availableClauses.find(c => c.id === selectedClause)

  // Salary modifier berdasarkan klausul
  const clauseModifier = {
    factory_full: 1.20,
    factory_development: 0.85,
    independent_works: 1.05,
    independent_standard: 1.0,
    loan_factory: 0.7,
    buyout_clause: 1.0,
    performance_bonus: 0.80,
    option_year: 1.05,
    no_compete: 1.10,
    mentorship: 0.90,
  }[selectedClause] || 1.0

  const effectiveSalary = parseFloat((salary * clauseModifier).toFixed(1))
  const totalCost = effectiveSalary * years + signingBonus
  const canAfford = budget >= totalCost

  function getAgentReaction(offer) {
    const expected = (target.salary || 1.0) * clauseModifier
    const ratio = offer.salary / expected

    if (ratio >= 1.15) return {
      type: 'accept',
      msg: `${target.name}'s agent is satisfied. They accept the terms.`,
    }
    if (ratio >= 0.95) return {
      type: 'counter',
      counter: { salary: parseFloat((expected * 1.05).toFixed(1)), years: Math.max(offer.years, 1) },
      msg: `Close but not quite. Agent is asking for €${(expected * 1.05).toFixed(1)}M/yr.`,
    }
    if (ratio >= 0.75) return {
      type: 'counter',
      counter: { salary: parseFloat((expected * 1.12).toFixed(1)), years: 2 },
      msg: `${target.name} feels undervalued. Agent wants €${(expected * 1.12).toFixed(1)}M/yr over 2 years.`,
    }
    return {
      type: 'reject',
      msg: `Offer rejected. ${target.name}'s agent says the terms are too far from expectations.`,
    }
  }

  function sendOffer() {
    if (!canAfford) return
    const offer = { salary: effectiveSalary, years, signingBonus, clause: selectedClause }
    const reaction = getAgentReaction(offer)
    startNegotiation(target.id, type, offer)
    setAgentResponse(reaction)
    setStage('negotiating')
    if (reaction.type === 'accept') setResult('accepted')
    else if (reaction.type === 'reject') setResult('rejected')
  }

  function acceptCounter() {
    const terms = { ...agentResponse.counter, signingBonus, clause: selectedClause }
    onSign(target.id, terms)
    closeNegotiation(target.id)
    onClose()
  }

  function counterOffer() {
    setStage('offer')
    setAgentResponse(null)
  }

  function walkAway() {
    closeNegotiation(target.id)
    onClose()
  }

  function finalizeAccept() {
    onSign(target.id, { salary: effectiveSalary, years, signingBonus, clause: selectedClause })
    closeNegotiation(target.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-screen overflow-y-auto">

        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
          <div>
            <div className="text-lg font-semibold text-white">
              {type === 'renewal' ? 'Contract Renewal' :
               type === 'new' ? 'New Contract Offer' : 'Staff Contract'}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">{target.name}</div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-6">

          <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-900 flex items-center justify-center text-base font-bold text-red-300 flex-shrink-0">
              {type === 'staff' ? '🔧' : `#${target.number || '?'}`}
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold text-white">{target.name}</div>
              <div className="text-sm text-gray-500">{target.nationality} · Overall {target.overall || target.skill}/20</div>
              <StarRating value={target.overall || target.skill || 10} max={20} size="sm" />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Base asking</div>
              <div className="text-base font-semibold text-yellow-400">€{target.salary}M/yr</div>
            </div>
          </div>

          {stage === 'offer' && (
            <>
              <div>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Contract Type</div>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {availableClauses.map(clause => (
                    <div
                      key={clause.id}
                      onClick={() => setSelectedClause(clause.id)}
                      className={`border rounded-xl p-3 cursor-pointer transition-all ${
                        selectedClause === clause.id
                          ? clause.color + ' ring-1 ring-red-500'
                          : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{clause.icon}</span>
                        <span className="text-sm font-semibold text-white leading-tight">{clause.label}</span>
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed mb-2">{clause.desc}</div>
                      <div className="text-xs text-gray-400 italic">{clause.effect}</div>
                    </div>
                  ))}
                </div>

                {clauseObj && clauseModifier !== 1.0 && (
                  <div className="mt-2 text-sm text-amber-400">
                    {clauseModifier > 1
                      ? `This clause adds +${Math.round((clauseModifier - 1) * 100)}% to salary expectations`
                      : `This clause reduces salary by ${Math.round((1 - clauseModifier) * 100)}%`}
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Terms</div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Base salary (€M/yr)</span>
                      <span className={
                        effectiveSalary >= (target.salary || 1) * 1.15 * clauseModifier ? 'text-green-400' :
                        effectiveSalary >= (target.salary || 1) * 0.95 * clauseModifier ? 'text-yellow-400' :
                        'text-red-400'
                      }>
                        €{salary}M base → €{effectiveSalary}M effective
                      </span>
                    </div>
                    <input
                      type="range"
                      min={parseFloat(((target.salary || 1) * 0.5).toFixed(1))}
                      max={parseFloat(((target.salary || 1) * 2.5).toFixed(1))}
                      step={0.1}
                      value={salary}
                      onChange={e => setSalary(parseFloat(e.target.value))}
                      className="w-full accent-red-500"
                    />
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">Contract length</div>
                    <div className="flex gap-2">
                      {[1, 2, 3].map(y => (
                        <button
                          key={y}
                          onClick={() => setYears(y)}
                          className={`flex-1 py-2.5 rounded-xl text-base font-medium transition-colors border ${
                            years === y
                              ? 'bg-red-600 border-red-500 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          {y} yr
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">Signing bonus</div>
                    <div className="flex gap-2">
                      {[0, 0.5, 1.0, 2.0].map(b => (
                        <button
                          key={b}
                          onClick={() => setSigningBonus(b)}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors border ${
                            signingBonus === b
                              ? 'bg-red-600 border-red-500 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          {b === 0 ? 'None' : `€${b}M`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`rounded-xl p-4 flex items-center justify-between ${
                    !canAfford ? 'bg-red-950 border border-red-800' : 'bg-gray-800'
                  }`}>
                    <div>
                      <div className="text-sm text-gray-400">Total commitment</div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        €{effectiveSalary}M × {years}yr + €{signingBonus}M bonus
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${canAfford ? 'text-white' : 'text-red-400'}`}>
                      €{totalCost.toFixed(1)}M
                      {!canAfford && <div className="text-xs font-normal text-red-400">Insufficient budget</div>}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={sendOffer}
                disabled={!canAfford}
                className={`w-full py-3 rounded-xl text-base font-semibold transition-colors ${
                  canAfford
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                Send Offer
              </button>
            </>
          )}

          {stage === 'negotiating' && agentResponse && (
            <div className="space-y-4">
              <div className={`rounded-xl p-4 border ${
                agentResponse.type === 'accept' ? 'bg-green-950 border-green-700' :
                agentResponse.type === 'reject' ? 'bg-red-950 border-red-700' :
                'bg-amber-950 border-amber-700'
              }`}>
                <div className="text-base font-semibold text-white mb-1">
                  {agentResponse.type === 'accept' ? '✓ Offer Accepted' :
                   agentResponse.type === 'reject' ? '✗ Offer Rejected' :
                   '↔ Counter Offer'}
                </div>
                <div className={`text-sm ${
                  agentResponse.type === 'accept' ? 'text-green-300' :
                  agentResponse.type === 'reject' ? 'text-red-300' : 'text-amber-300'
                }`}>
                  {agentResponse.msg}
                </div>
                {agentResponse.counter && (
                  <div className="mt-3 bg-black bg-opacity-20 rounded-lg p-3">
                    <div className="text-sm text-white font-medium">Agent's counter:</div>
                    <div className="text-sm text-amber-300 mt-1">
                      €{agentResponse.counter.salary}M/yr × {agentResponse.counter.years} yr
                      — Total: €{(agentResponse.counter.salary * agentResponse.counter.years).toFixed(1)}M
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Clause: {clauseObj?.label}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {result === 'accepted' && (
                  <button onClick={finalizeAccept} className="flex-1 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white text-base font-semibold transition-colors">
                    ✓ Confirm & Sign
                  </button>
                )}
                {result === 'rejected' && (
                  <button onClick={walkAway} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-400 text-base transition-colors">
                    Walk Away
                  </button>
                )}
                {agentResponse.type === 'counter' && !result && (
                  <>
                    <button onClick={acceptCounter} className="flex-1 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white text-base font-semibold transition-colors">
                      Accept Counter
                    </button>
                    <button onClick={counterOffer} className="flex-1 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-base font-semibold transition-colors">
                      Counter Again
                    </button>
                    <button onClick={walkAway} className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 text-base transition-colors">
                      Walk Away
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ─── MAIN CONTRACTS SCREEN ────────────────────────────────────────────────────

export default function Contracts() {
  const {
    team, budget, riders, staff, riderDatabase,
    scoutedRiders, signContract, releaseRider,
    addScoutedRider, negotiations,
  } = useGameStore()

  const [tab, setTab] = useState('roster')
  const [negotiating, setNegotiating] = useState(null)
  const [negType, setNegType] = useState('renewal')
  const [notification, setNotification] = useState(null)
  const [scoutFilter, setScoutFilter] = useState({ manufacturer: 'All', tier: 'All', search: '' })
  const [confirmRelease, setConfirmRelease] = useState(null)

  function showNotif(msg, type = 'success') {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  function openNegotiation(target, type) {
    setNegotiating(target)
    setNegType(type)
  }

  function handleSign(targetId, terms) {
    signContract(targetId, terms)
    const clause = CONTRACT_CLAUSES.find(c => c.id === terms.clause)
    showNotif(`Signed! ${clause?.label || 'Contract'} · €${terms.salary}M/yr × ${terms.years} yr`)
    setNegotiating(null)
  }

  function handleRelease(rider) {
    releaseRider(rider.id)
    showNotif(`${rider.name} released.`, 'error')
    setConfirmRelease(null)
  }

  // Elite riders auto-scouted
  const autoScouted = riderDatabase.filter(r => r.tier === 'elite').map(r => r.id)
  const isVisible = (rider) =>
    rider.tier === 'elite' ||
    scoutedRiders.includes(rider.id) ||
    autoScouted.includes(rider.id)

  const availableScouts = riderDatabase.filter(r => {
    if (riders.find(pr => pr.id === r.id)) return false
    if (scoutFilter.manufacturer !== 'All' && r.manufacturer !== scoutFilter.manufacturer) return false
    if (scoutFilter.tier !== 'All' && r.tier !== scoutFilter.tier) return false
    if (scoutFilter.search && !r.name.toLowerCase().includes(scoutFilter.search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-5">

      <div>
        <h2 className="text-lg font-semibold mb-1">Contracts & Transfers</h2>
        <p className="text-sm text-gray-500">
          {team.name} · Budget: <span className="text-green-400 font-semibold">€{budget}M</span>
        </p>
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

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'roster', label: 'My Riders' },
          { id: 'staff', label: 'Staff' },
          { id: 'scout', label: 'Scout' },
          { id: 'manufacturer', label: 'Manufacturer' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 rounded-xl text-base font-medium transition-colors ${
              tab === t.id ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'roster' && (
        <div className="space-y-3">
          {riders.map(rider => {
            const hasNeg = negotiations[rider.id]
            return (
              <div key={rider.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-900 flex items-center justify-center text-base font-bold text-red-300 flex-shrink-0">
                    #{rider.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-base font-semibold text-white">{rider.flag} {rider.name}</div>
                        <div className="text-sm text-gray-500">{rider.nationality} · {rider.tier}</div>
                        <StarRating value={rider.overall} max={20} size="md" />
                      </div>
                      <div className="text-right">
                        <div className="text-base font-semibold text-white">€{rider.salary}M/yr</div>
                        <div className={`text-sm font-medium ${
                          rider.contractYears <= 1 ? 'text-red-400' :
                          rider.contractYears === 2 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {rider.contractYears} yr remaining
                          {rider.contractYears <= 1 && ' ⚠'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2 mt-3">
                      {[
                        { label: 'Pace', value: rider.pace },
                        { label: 'Consistency', value: rider.consistency },
                        { label: 'Wet', value: rider.wetSkill },
                        { label: 'Mental', value: rider.mentalState },
                        { label: 'Fitness', value: rider.fitness },
                      ].map(stat => (
                        <div key={stat.label} className="text-center bg-gray-800 rounded-lg py-2">
                          <div className="text-xs text-gray-500 mb-0.5">{stat.label}</div>
                          <div className="text-sm font-bold text-white">{stat.value}</div>
                          <StarRating value={stat.value} max={20} size="sm" />
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => openNegotiation(rider, 'renewal')}
                        className={`flex-1 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                          hasNeg
                            ? 'bg-amber-900 border border-amber-700 text-amber-300'
                            : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                        }`}
                      >
                        {hasNeg ? 'In Negotiation' : 'Negotiate Renewal'}
                      </button>
                      <button
                        onClick={() => setConfirmRelease(rider)}
                        className="px-4 py-2.5 rounded-xl text-base text-red-400 hover:bg-red-950 border border-gray-800 transition-colors"
                      >
                        Release
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'staff' && (
        <div className="space-y-3">
          {STAFF_ROLES.map(({ key, label }) => {
            const person = staff[key]
            if (!person) return null
            const salary = person.salary || parseFloat((person.skill * 0.1).toFixed(1))
            return (
              <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-xl flex-shrink-0">🔧</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-base font-semibold text-white">{person.name}</div>
                        <div className="text-sm text-gray-500">{label}</div>
                        <StarRating value={person.skill} max={20} size="md" />
                      </div>
                      <div className="text-right">
                        <div className="text-base font-semibold text-white">€{salary}M/yr</div>
                        <div className="text-sm text-yellow-400">{person.contractYears || 1} yr remaining</div>
                      </div>
                    </div>
                    <button
                      onClick={() => openNegotiation({ ...person, id: key, salary }, 'staff')}
                      className="w-full mt-3 py-2.5 rounded-xl text-base font-semibold bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-colors"
                    >
                      Negotiate Contract
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'scout' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              value={scoutFilter.search}
              onChange={e => setScoutFilter(f => ({ ...f, search: e.target.value }))}
              placeholder="Search rider..."
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 text-base"
            />
            <select
              value={scoutFilter.manufacturer}
              onChange={e => setScoutFilter(f => ({ ...f, manufacturer: e.target.value }))}
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 text-base"
            >
              {MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              value={scoutFilter.tier}
              onChange={e => setScoutFilter(f => ({ ...f, tier: e.target.value }))}
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 text-base"
            >
              {TIERS.map(t => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Tiers' : t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-500">
            {availableScouts.length} riders · Elite riders auto-scouted
          </div>

          <div className="space-y-2">
            {availableScouts.map(rider => {
              const visible = isVisible(rider)
              const hasNeg = negotiations[rider.id]
              return (
                <div key={rider.id} className={`bg-gray-900 border rounded-xl p-4 transition-all ${
                  hasNeg ? 'border-amber-700' :
                  rider.tier === 'elite' ? 'border-yellow-800' :
                  visible ? 'border-blue-800' : 'border-gray-800'
                }`}>
                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-300 flex-shrink-0">
                      #{rider.number}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-base font-semibold text-white">{rider.flag} {rider.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded border ${TIER_COLOR[rider.tier]}`}>
                          {rider.tier}
                        </span>
                        {rider.tier === 'elite' && (
                          <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-0.5 rounded border border-yellow-700">
                            Auto-scouted
                          </span>
                        )}
                        {hasNeg && (
                          <span className="text-xs bg-amber-900 text-amber-300 px-2 py-0.5 rounded border border-amber-700">
                            In negotiation
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {rider.nationality} · {rider.team}
                      </div>
                      {visible ? (
                        <div className="flex items-center gap-3 mt-1">
                          <StarRating value={rider.overall} max={20} size="sm" />
                          <span className="text-sm text-gray-400">Overall {rider.overall}/20</span>
                          <span className="text-sm text-white font-medium">€{rider.salary}M/yr</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 italic mt-1">Scout to reveal full stats</div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      {!visible ? (
                        <button
                          onClick={() => {
                            addScoutedRider(rider.id)
                            showNotif(`${rider.name} scouted — stats revealed.`)
                          }}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-900 hover:bg-blue-800 text-blue-300 border border-blue-700 transition-colors whitespace-nowrap"
                        >
                          Scout
                        </button>
                      ) : (
                        <button
                          onClick={() => openNegotiation(rider, 'new')}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                            hasNeg
                              ? 'bg-amber-900 border border-amber-700 text-amber-300'
                              : 'bg-red-600 hover:bg-red-500 text-white'
                          }`}
                        >
                          {hasNeg ? 'Negotiating' : 'Talk to Agent'}
                        </button>
                      )}
                    </div>
                  </div>

                  {visible && (
                    <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-gray-800">
                      {[
                        { label: 'Pace', value: rider.pace },
                        { label: 'Consistency', value: rider.consistency },
                        { label: 'Wet', value: rider.wetSkill },
                        { label: 'Mental', value: rider.mentalState },
                        { label: 'Fitness', value: rider.fitness },
                      ].map(stat => (
                        <div key={stat.label} className="text-center bg-gray-800 rounded-lg py-1.5">
                          <div className="text-xs text-gray-500">{stat.label}</div>
                          <div className="text-sm font-bold text-white">{stat.value}</div>
                          <StarRating value={stat.value} max={20} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'manufacturer' && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-base font-semibold text-white mb-1">Current Manufacturer</div>
            <div className="text-sm text-gray-500 mb-4">
              {team.name} · {team.manufacturer} · {team.type === 'factory' ? 'Factory' : 'Independent'}
            </div>

            {team.type === 'factory' ? (
              <div className="bg-purple-950 border border-purple-800 rounded-xl p-4">
                <div className="text-base font-semibold text-purple-300 mb-1">Factory Team</div>
                <div className="text-sm text-purple-400">
                  As a factory team, you represent the manufacturer directly.
                  Use the R&D screen to develop the bike, and manage independent teams from there.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-gray-400 mb-2">
                  Apply for a manufacturer deal for next season. Current results and reputation affect acceptance.
                </div>
                {['Ducati', 'Aprilia', 'KTM', 'Honda', 'Yamaha'].map(mfr => {
                  const isCurrent = mfr === team.manufacturer
                  const specs = {
                    Ducati: { bike: 18, budget: '+€2M', chance: isCurrent ? 'High' : 'Medium' },
                    Aprilia: { bike: 17, budget: '+€1.5M', chance: isCurrent ? 'High' : 'Medium' },
                    KTM: { bike: 16, budget: '+€1M', chance: 'Medium' },
                    Honda: { bike: 15, budget: '+€0.5M', chance: 'High' },
                    Yamaha: { bike: 16, budget: '+€1M', chance: 'Medium' },
                  }[mfr]

                  return (
                    <div key={mfr} className={`border rounded-xl p-4 flex items-center justify-between gap-4 ${
                      isCurrent ? 'border-gray-600 bg-gray-800' : 'border-gray-800 bg-gray-900'
                    }`}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base font-semibold text-white">{mfr}</span>
                          {isCurrent && (
                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">Current</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Bike overall: {specs.bike}/20 · Budget bonus: {specs.budget}
                        </div>
                        <div className={`text-sm font-medium mt-0.5 ${
                          specs.chance === 'High' ? 'text-green-400' :
                          specs.chance === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          Acceptance: {specs.chance}
                        </div>
                      </div>
                      <button
                        onClick={() => showNotif(`Application sent to ${mfr} — response before season end.`)}
                        disabled={isCurrent}
                        className={`px-5 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                          isCurrent
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-500 text-white'
                        }`}
                      >
                        {isCurrent ? 'Current deal' : 'Apply'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {confirmRelease && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6">
            <div className="text-lg font-semibold text-white mb-2">Release {confirmRelease.name}?</div>
            <div className="text-base text-gray-400 mb-6">
              Contract terminated immediately. They become a free agent.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleRelease(confirmRelease)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-base font-semibold transition-colors"
              >
                Release
              </button>
              <button
                onClick={() => setConfirmRelease(null)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-base transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {negotiating && (
        <NegotiationModal
          target={negotiating}
          type={negType}
          onClose={() => setNegotiating(null)}
          onSign={handleSign}
        />
      )}

    </div>
  )
}