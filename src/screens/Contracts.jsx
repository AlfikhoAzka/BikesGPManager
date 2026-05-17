import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import StarRating from '../components/StarRating'

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

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-300 leading-relaxed shadow-xl pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-600" />
        </div>
      )}
    </div>
  )
}

function NegotiationModal({ target, type, onClose, onSign }) {
  const { budget, team, riders, negotiations, startNegotiation, closeNegotiation, pendingContracts } = useGameStore()

  const availableClauses = CONTRACT_CLAUSES.filter(c =>
    c.availableFor.includes(team.type)
  ).filter(c => c.id !== 'loan_factory' || team.type === 'factory')

  const [salary, setSalary] = useState(
    typeof target.salary === 'number' ? target.salary : parseFloat(target.salary) || 1.0
  )
  const [years, setYears] = useState(1)
  const [signingBonus, setSigningBonus] = useState(0)
  const [selectedClauses, setSelectedClauses] = useState([availableClauses[0]?.id || ''])
  const [riderRole, setRiderRole] = useState('equal')
  const [signTiming, setSignTiming] = useState('next_season')
  const [replaceRider, setReplaceRider] = useState(riders[0]?.id || null)
  const [stage, setStage] = useState('offer')
  const [agentResponse, setAgentResponse] = useState(null)
  const [result, setResult] = useState(null)
  const [showReplaceWarning, setShowReplaceWarning] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [salaryInput, setSalaryInput] = useState(String(
    typeof target.salary === 'number' ? target.salary : parseFloat(target.salary) || 1.0
  ))

  const isFreeAgent = !target.teamId

  // Hitung combined clause modifier (average jika multiple)
  const clauseModifiers = {
    factory_full: 1.20, factory_development: 0.85,
    independent_works: 1.05, independent_standard: 1.0,
    loan_factory: 0.7, buyout_clause: 1.0,
    performance_bonus: 0.80, option_year: 1.05,
    no_compete: 1.10, mentorship: 0.90,
  }
  const clauseModifier = selectedClauses.length > 0
    ? selectedClauses.reduce((acc, id) => acc + (clauseModifiers[id] || 1.0), 0) / selectedClauses.length
    : 1.0

  const roleModifier = { first: 1.15, equal: 1.0, second: 0.85 }[riderRole] || 1.0
  const effectiveSalary = parseFloat((salary * clauseModifier * roleModifier).toFixed(2))
  const totalCost = effectiveSalary * years + signingBonus
  const canAfford = budget >= totalCost

  function toggleClause(id) {
    setSelectedClauses(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(c => c !== id) : prev
        : [...prev, id]
    )
  }

  function handleSalaryInput(val) {
    setSalaryInput(val)
    const parsed = parseFloat(val)
    if (!isNaN(parsed) && parsed > 0) setSalary(parsed)
  }

  function getAgentReaction(offer) {
    const expected = (target.salary || 1.0) * clauseModifier * roleModifier
    const ratio = offer.salary / expected
    if (ratio >= 1.1) return { type: 'accept', msg: `${target.name}'s agent accepts the terms.` }
    if (ratio >= 0.9) return {
      type: 'counter',
      counter: { salary: parseFloat((expected * 1.05).toFixed(2)), years: Math.max(offer.years, 1) },
      msg: `Close — agent wants €${(expected * 1.05).toFixed(2)}M/yr.`,
    }
    if (ratio >= 0.7) return {
      type: 'counter',
      counter: { salary: parseFloat((expected * 1.1).toFixed(2)), years: 2 },
      msg: `${target.name} feels undervalued. Agent wants €${(expected * 1.1).toFixed(2)}M/yr over 2 years.`,
    }
    return { type: 'reject', msg: `Offer rejected — too far below expectations. ${attemptsLeft - 1} attempt(s) remaining.` }
  }

  function sendOffer() {
    if (!canAfford) return
    const offer = { salary: effectiveSalary, years, signingBonus, clauses: selectedClauses }
    const reaction = getAgentReaction(offer)
    startNegotiation(target.id, type, offer)
    setAgentResponse(reaction)
    setStage('negotiating')
    if (reaction.type === 'accept') {
      setResult('accepted')
    } else if (reaction.type === 'reject') {
      const newAttempts = attemptsLeft - 1
      setAttemptsLeft(newAttempts)
      if (newAttempts <= 0) setResult('rejected_final')
      else setResult('rejected')
    }
  }

  function tryAgain() {
    setStage('offer')
    setAgentResponse(null)
    setResult(null)
  }

  function buildTerms() {
    return {
      salary: effectiveSalary,
      years,
      signingBonus,
      clauses: selectedClauses,
      clause: selectedClauses[0],
      role: riderRole,
      timing: type === 'renewal' ? 'immediate' : signTiming,
      replaceRider: type === 'renewal' ? null : replaceRider,
      type,
    }
  }

  function finalizeAccept() {
    if (type !== 'renewal' && signTiming === 'immediate' && !isFreeAgent) {
      setShowReplaceWarning(true)
      return
    }
    onSign(target.id, buildTerms())
    closeNegotiation(target.id)
    onClose()
  }

  function acceptCounter() {
    onSign(target.id, {
      salary: agentResponse.counter.salary,
      years: agentResponse.counter.years,
      signingBonus,
      clauses: selectedClauses,
      clause: selectedClauses[0],
      role: riderRole,
      timing: type === 'renewal' ? 'immediate' : signTiming,
      replaceRider: type === 'renewal' ? null : replaceRider,
      type,
    })
    closeNegotiation(target.id)
    onClose()
  }

  function confirmImmediateSign() {
    onSign(target.id, { ...buildTerms(), timing: 'immediate' })
    closeNegotiation(target.id)
    onClose()
  }

  const salaryColor = effectiveSalary >= (target.salary || 1) * 1.1 ? 'text-green-400' :
    effectiveSalary >= (target.salary || 1) * 0.9 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
          <div>
            <div className="text-lg font-semibold text-white">
              {type === 'renewal' ? 'Contract Renewal' : type === 'new' ? 'New Contract' : 'Staff Contract'}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">{target.name}</div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white text-2xl">×</button>
        </div>

        <div className="px-6 py-5 space-y-5">

          <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-900 flex items-center justify-center text-base font-bold text-red-300">
              {type === 'staff' ? '🔧' : `#${target.number || '?'}`}
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold text-white">{target.name}</div>
              <div className="text-sm text-gray-500">{target.nationality}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current/Asking</div>
              <div className="text-base font-semibold text-yellow-400">€{target.salary}M/yr</div>
            </div>
          </div>

          {stage === 'offer' && (
            <>
              <div>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Contract Type <span className="text-gray-600 normal-case font-normal">(hover for details, multiple allowed)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableClauses.map(clause => {
                    const active = selectedClauses.includes(clause.id)
                    return (
                      <Tooltip key={clause.id} text={`${clause.desc} — ${clause.effect}`}>
                        <button
                          onClick={() => toggleClause(clause.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                            active
                              ? 'bg-red-600 border-red-500 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
                          }`}
                        >
                          {clause.icon} {clause.label}
                        </button>
                      </Tooltip>
                    )
                  })}
                </div>
                {clauseModifier !== 1.0 && (
                  <div className="text-xs text-amber-400 mt-2">
                    Combined clause effect: {clauseModifier > 1
                      ? `+${Math.round((clauseModifier - 1) * 100)}% salary`
                      : `-${Math.round((1 - clauseModifier) * 100)}% salary`}
                  </div>
                )}
              </div>

              {type !== 'staff' && (
                <div>
                  <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Rider Role</div>
                  <div className="flex gap-2">
                    {[
                      { id: 'first', label: '#1 Rider', modifier: '+15%', color: 'text-red-400' },
                      { id: 'equal', label: 'Equal Status', modifier: 'Standard', color: 'text-gray-400' },
                      { id: 'second', label: '#2 Rider', modifier: '-15%', color: 'text-green-400' },
                    ].map(role => (
                      <button
                        key={role.id}
                        onClick={() => setRiderRole(role.id)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                          riderRole === role.id
                            ? 'bg-red-600 border-red-500 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {role.label}
                        <div className={`text-xs mt-0.5 ${riderRole === role.id ? 'text-red-200' : role.color}`}>
                          {role.modifier}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {type === 'new' && riders.length >= 2 && (
                <div>
                  <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Replace Rider</div>
                  <div className="flex gap-2">
                    {riders.map(r => {
                      const seatTaken = (pendingContracts || []).some(
                        p => p.terms?.replaceRider === r.id || p.riderId === r.id
                      )
                      return (
                        <button
                          key={r.id}
                          onClick={() => !seatTaken && setReplaceRider(r.id)}
                          disabled={seatTaken}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                            seatTaken ? 'bg-gray-800 border-gray-800 text-gray-600 cursor-not-allowed opacity-40' :
                            replaceRider === r.id ? 'bg-red-600 border-red-500 text-white' :
                            'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          #{r.number} {r.name}
                          <div className="text-xs mt-0.5 opacity-70">
                            {seatTaken ? 'Seat filled' : `${r.contractYears}yr · €${r.salary}M`}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {type === 'new' && (
                <div>
                  <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">When to Join</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => isFreeAgent && setSignTiming('immediate')}
                      disabled={!isFreeAgent}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                        !isFreeAgent ? 'opacity-40 cursor-not-allowed bg-gray-800 border-gray-700 text-gray-500' :
                        signTiming === 'immediate' ? 'bg-red-600 border-red-500 text-white' :
                        'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      Immediate
                      <div className="text-xs mt-0.5 opacity-70">{isFreeAgent ? 'Free agents only' : 'Not available'}</div>
                    </button>
                    <button
                      onClick={() => setSignTiming('next_season')}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                        signTiming === 'next_season' ? 'bg-red-600 border-red-500 text-white' :
                        'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      Next Season
                      <div className="text-xs mt-0.5 opacity-70">Safer, no penalties</div>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Terms</div>
                <div className="space-y-3">

                  <div className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-400">Base salary (€M/yr)</label>
                      <span className={`text-sm font-semibold ${salaryColor}`}>
                        Effective: €{effectiveSalary}M/yr
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { const v = Math.max(0.1, parseFloat((salary - 0.1).toFixed(1))); setSalary(v); setSalaryInput(String(v)) }}
                        className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center font-bold"
                      >−</button>
                      <input
                        type="number"
                        value={salaryInput}
                        onChange={e => handleSalaryInput(e.target.value)}
                        step="0.1"
                        min="0.1"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-base text-center focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={() => { const v = parseFloat((salary + 0.1).toFixed(1)); setSalary(v); setSalaryInput(String(v)) }}
                        className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center font-bold"
                      >+</button>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 text-center">
                      Rider expects ~€{target.salary}M/yr
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">Contract length</div>
                    <div className="flex gap-2">
                      {[1, 2, 3].map(y => (
                        <button key={y} onClick={() => setYears(y)}
                          className={`flex-1 py-2.5 rounded-xl text-base font-medium border transition-colors ${
                            years === y ? 'bg-red-600 border-red-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >{y} yr</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">Signing bonus</div>
                    <div className="flex gap-2">
                      {[0, 0.5, 1.0, 2.0].map(b => (
                        <button key={b} onClick={() => setSigningBonus(b)}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                            signingBonus === b ? 'bg-red-600 border-red-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >{b === 0 ? 'None' : `€${b}M`}</button>
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
                      {!canAfford && <div className="text-xs font-normal text-red-400">Insufficient</div>}
                    </div>
                  </div>
                </div>
              </div>

              {attemptsLeft < 3 && (
                <div className="text-sm text-amber-400">
                  ⚠ {attemptsLeft} offer attempt{attemptsLeft !== 1 ? 's' : ''} remaining
                </div>
              )}

              <button
                onClick={sendOffer}
                disabled={!canAfford}
                className={`w-full py-3 rounded-xl text-base font-semibold transition-colors ${
                  canAfford ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
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
                  {agentResponse.type === 'accept' ? '✓ Accepted' :
                   agentResponse.type === 'reject' ? '✗ Rejected' : '↔ Counter Offer'}
                </div>
                <div className={`text-sm ${
                  agentResponse.type === 'accept' ? 'text-green-300' :
                  agentResponse.type === 'reject' ? 'text-red-300' : 'text-amber-300'
                }`}>
                  {agentResponse.msg}
                </div>
                {agentResponse.counter && (
                  <div className="mt-2 text-sm text-amber-400 font-medium">
                    Counter: €{agentResponse.counter.salary}M/yr × {agentResponse.counter.years} yr
                  </div>
                )}
              </div>

              <div className="flex gap-3 flex-wrap">
                {result === 'accepted' && (
                  <button onClick={finalizeAccept}
                    className="flex-1 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white text-base font-semibold transition-colors">
                    ✓ Confirm & Sign
                  </button>
                )}
                {result === 'rejected' && attemptsLeft > 0 && (
                  <button onClick={tryAgain}
                    className="flex-1 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-base font-semibold transition-colors">
                    Make New Offer ({attemptsLeft} left)
                  </button>
                )}
                {result === 'rejected_final' && (
                  <div className="flex-1 py-3 text-center text-red-400 text-base">
                    No more attempts — negotiation failed
                  </div>
                )}
                {agentResponse.type === 'counter' && !result && (
                  <>
                    <button onClick={acceptCounter}
                      className="flex-1 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white text-base font-semibold transition-colors">
                      Accept Counter
                    </button>
                    <button onClick={tryAgain}
                      className="flex-1 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-base font-semibold transition-colors">
                      Counter Again ({attemptsLeft} left)
                    </button>
                  </>
                )}
                <button onClick={() => { closeNegotiation(target.id); onClose() }}
                  className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 text-base transition-colors">
                  Walk Away
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {showReplaceWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-6">
          <div className="bg-gray-900 border border-red-700 rounded-2xl w-full max-w-sm p-6">
            <div className="text-lg font-semibold text-white mb-2">⚠ Early Termination</div>
            <div className="text-base text-gray-400 mb-5">
              {riders.find(r => r.id === replaceRider)?.name}'s contract will be terminated immediately.
            </div>
            <div className="flex gap-3">
              <button onClick={confirmImmediateSign}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-base font-semibold">
                Confirm
              </button>
              <button onClick={() => setShowReplaceWarning(false)}
                className="flex-1 py-2.5 bg-gray-800 text-white rounded-xl text-base">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Contracts() {
  const {
    team, budget, riders, staff, riderDatabase, round,
    scoutedRiders, signContract, releaseRider,
    addScoutedRider, negotiations,
    activeScouts, scoutReports, agentContacts,
    startScout, contactAgent,
    pendingContracts,
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

  const isPending = (riderId) =>
  (pendingContracts || []).some(p => p.riderId === riderId)

  const isCurrentRider = (riderId) =>
    riders.some(r => r.id === riderId)

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
        <div className="space-y-4">
          {riders.map(rider => {
            const hasActiveNeg = !!negotiations[rider.id]
            const renewalDone = !hasActiveNeg && rider.contractYears > 1

            const attrs = [
              { label: 'Quali Pace', value: rider.qualiPace ?? rider.pace },
              { label: 'Race Pace', value: rider.racePace ?? rider.pace },
              { label: 'Tyre Mgmt', value: rider.tyreManagement },
              { label: 'Overtaking', value: rider.overtaking },
              { label: 'Defending', value: rider.defending },
              { label: 'Wet', value: rider.wetPerformance ?? rider.wetSkill },
              { label: 'Consistency', value: rider.consistency },
              { label: 'Stamina', value: rider.physicalStamina ?? rider.fitness },
              { label: 'Corner Spd', value: rider.cornerSpeed },
              { label: 'Braking', value: rider.brakingAbility },
              { label: 'Setup FB', value: rider.setupFeedback },
              { label: 'Mental', value: rider.mentalResilience ?? rider.mentalState },
            ].filter(a => a.value !== undefined && a.value !== null)

            const riskLabel = (val) => {
              if (!val) return null
              if (val >= 17) return { text: 'Aggressive', color: 'text-red-400' }
              if (val >= 13) return { text: 'Balanced', color: 'text-yellow-400' }
              return { text: 'Conservative', color: 'text-green-400' }
            }
            const risk = riskLabel(rider.riskTaking)

            return (
              <div key={rider.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-900 flex items-center justify-center text-base font-bold text-red-300 flex-shrink-0">
                    #{rider.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-base font-semibold text-white">{rider.flag} {rider.name}</div>
                        <div className="text-sm text-gray-500">{rider.nationality} · {rider.tier}</div>
                        {risk && <div className={`text-sm font-medium mt-0.5 ${risk.color}`}>{risk.text} style</div>}
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
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {attrs.map(attr => (
                    <div key={attr.label} className="bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between">
                      <span className="text-sm text-gray-400">{attr.label}</span>
                      <div className="flex items-center gap-1.5">
                        <StarRating value={attr.value} max={20} size="sm" />
                        <span className="text-sm font-bold text-white w-4 text-right">{attr.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => !renewalDone && openNegotiation(rider, 'renewal')}
                    disabled={renewalDone}
                    className={`flex-1 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                      renewalDone
                        ? 'bg-green-900 border border-green-700 text-green-400 cursor-not-allowed'
                        : hasActiveNeg
                        ? 'bg-amber-900 border border-amber-700 text-amber-300 hover:bg-amber-800'
                        : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                    }`}
                  >
                    {renewalDone ? '✓ Contract Renewed' :
                    hasActiveNeg ? 'Resume Negotiation' : 'Negotiate Renewal'}
                  </button>
                  <button
                    onClick={() => setConfirmRelease(rider)}
                    className="px-4 py-2.5 rounded-xl text-base text-red-400 hover:bg-red-950 border border-gray-800 transition-colors"
                  >
                    Release
                  </button>
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

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Scout Levels</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  level: 'basic',
                  label: 'Basic Scout',
                  cost: 'Free',
                  time: '1 round',
                  reveals: 'Quali pace, race pace, wet performance, salary estimate'
                },
                {
                  level: 'detailed',
                  label: 'Detailed Report',
                  cost: '€0.5M',
                  time: '3 rounds',
                  reveals: 'All stats — tyre management, overtaking, defending, mental, braking, corner speed, risk style, analyst notes'
                },
              ].map(s => (
                <div key={s.level} className="bg-gray-800 rounded-xl p-4">
                  <div className="text-base font-semibold text-white mb-1">{s.label}</div>
                  <div className="text-base text-green-400 font-medium">{s.cost}</div>
                  <div className="text-sm text-gray-500">{s.time}</div>
                  <div className="text-sm text-gray-600 mt-2 leading-relaxed">{s.reveals}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {availableScouts.length} riders available · Elite riders show basic info automatically
          </div>

          <div className="space-y-2">
            {availableScouts.map(rider => {
              const activeScout = activeScouts?.[rider.id]
              const report = scoutReports?.[rider.id]
              const contact = agentContacts?.[rider.id]
              const hasNeg = negotiations[rider.id]
              const isElite = rider.tier === 'elite'
              const hasReport = !!report
              const roundsLeft = activeScout ? activeScout.completesRound - round : 0

              return (
                <div key={rider.id} className={`bg-gray-900 border rounded-xl p-4 transition-all ${
                  hasNeg ? 'border-amber-700' :
                  isElite ? 'border-yellow-800' :
                  hasReport ? 'border-blue-800' :
                  activeScout ? 'border-purple-800' :
                  'border-gray-800'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-300 flex-shrink-0">
                      #{rider.number}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-base font-semibold text-white">{rider.flag} {rider.name}</span>
                        {isElite && (
                          <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-0.5 rounded border border-yellow-700">
                            Elite
                          </span>
                        )}
                        {activeScout && (
                          <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded border border-purple-700">
                            Scouting... {roundsLeft} round{roundsLeft !== 1 ? 's' : ''} left
                          </span>
                        )}
                        {hasReport && (
                          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded border border-blue-700">
                            {report.level} report
                          </span>
                        )}

                        {isPending(rider.id) && !isCurrentRider(rider.id) && (
                          <div className="mt-3 pt-3 border-t border-gray-800">
                            <div className="bg-green-950 border border-green-700 rounded-xl px-4 py-3">
                              <div className="text-base font-semibold text-green-300">
                                ✓ {rider.name} has accepted your contract and will be your rider next season
                              </div>
                            </div>
                          </div>
                        )}
                        {hasNeg && (
                          <span className="text-xs bg-amber-900 text-amber-300 px-2 py-0.5 rounded border border-amber-700">
                            Negotiating
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{rider.nationality} · {rider.team}</div>

                      {(isElite || hasReport) && (
                        <div className="text-sm text-gray-400 mt-1">
                          {isElite ? `Salary: €${rider.salary}M/yr` :
                          report ? `Salary: ${report.salary}` : ''}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0 items-end">
                      {isCurrentRider(rider.id) && (
                        <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded border border-red-700">
                          Current rider
                        </span>
                      )}

                      {isPending(rider.id) && !isCurrentRider(rider.id) && (
                        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded border border-green-700">
                          ✓ Signed for next season
                        </span>
                      )}

                      {!isCurrentRider(rider.id) && !isPending(rider.id) && !activeScout && !hasReport && !isElite && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => { startScout(rider.id, 'basic'); showNotif(`Basic scout started — ${rider.name}`) }}
                            className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                          >
                            Basic
                          </button>
                          <button
                            onClick={() => { startScout(rider.id, 'detailed'); showNotif(`Detailed report — ${rider.name}`) }}
                            className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-blue-900 hover:bg-blue-800 text-blue-300 border border-blue-700 transition-colors"
                          >
                            Detailed
                          </button>
                        </div>
                      )}

                      {activeScout && (
                        <span className="text-xs text-purple-400">{roundsLeft} round{roundsLeft !== 1 ? 's' : ''} left</span>
                      )}

                      {(isElite || hasReport) && !contact && !hasNeg && !isPending(rider.id) && !isCurrentRider(rider.id) && (
                        <button
                          onClick={() => { contactAgent(rider.id); showNotif(`Contacted ${rider.name}'s agent`) }}
                          className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-blue-900 hover:bg-blue-800 text-blue-300 border border-blue-700 transition-colors"
                        >
                          Talk to Agent
                        </button>
                      )}

                      {contact && !hasNeg && !isPending(rider.id) && !isCurrentRider(rider.id) && contact.status !== 'reluctant' && (
                        <button
                          onClick={() => openNegotiation(rider, 'new')}
                          className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors"
                        >
                          Negotiate
                        </button>
                      )}
                    </div>
                  </div>

                  {hasReport && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                          {report.level} Report
                        </span>
                        <span className="text-xs text-gray-600">Accuracy: ~{report.accuracy}%</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Quali', value: report.qualiPace },
                          { label: 'Race', value: report.racePace },
                          { label: 'Wet', value: report.wetPerformance },
                          { label: 'Tyre', value: report.tyreManagement },
                          ...(report.overtaking !== null ? [{ label: 'Attack', value: report.overtaking }] : []),
                          ...(report.defending !== null ? [{ label: 'Defend', value: report.defending }] : []),
                          ...(report.consistency !== null ? [{ label: 'Consistency', value: report.consistency }] : []),
                          ...(report.cornerSpeed !== null ? [{ label: 'Corner', value: report.cornerSpeed }] : []),
                          ...(report.brakingAbility !== null ? [{ label: 'Braking', value: report.brakingAbility }] : []),
                          ...(report.mentalResilience !== null ? [{ label: 'Mental', value: report.mentalResilience }] : []),
                          ...(report.riskTaking !== null ? [{ label: 'Risk', value: report.riskTaking }] : []),
                        ].filter(s => s.value !== null).map(stat => (
                          <div key={stat.label} className="text-center bg-gray-800 rounded-lg py-1.5 px-1">
                            <div className="text-xs text-gray-500">{stat.label}</div>
                            <div className="text-sm font-bold text-white">{stat.value}</div>
                          </div>
                        ))}
                      </div>
                      {report.projection && (
                        <div className="mt-2 bg-gray-800 rounded-xl p-3">
                          <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Analyst Projection</div>
                          <div className="text-sm text-gray-300">{report.projection.notes}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Best at: {report.projection.bestCircuitType} circuits ·
                            Peak potential: {report.projection.peakOverall}/20
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(() => {
                  const pending = pendingContracts.find(p => p.riderId === rider.id)
                  if (pending) {
                    return (
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="bg-green-950 border border-green-700 rounded-xl px-4 py-3">
                          <div className="text-base font-semibold text-green-300 mb-0.5">
                            ✓ {rider.name} will join your team next season
                          </div>
                          <div className="text-sm text-green-500">
                            Contract signed · Joining Season {useGameStore.getState().season + 1}
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}

                {contact && !negotiations[rider.id] && (() => {
                  const pending = pendingContracts.find(p => p.riderId === rider.id)
                  if (pending) return null
                  return (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <div className={`text-sm leading-relaxed ${
                        contact.status === 'keen' ? 'text-green-400' :
                        contact.status === 'open' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {contact.message}
                      </div>
                    </div>
                  )
                })()}
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