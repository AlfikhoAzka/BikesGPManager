import { useState } from 'react'
import StarRating from '../components/StarRating'
import {
  faker,
  fakerID_ID, fakerES, fakerIT, fakerFR, fakerDE, fakerNL,
  fakerPT_BR, fakerPT_PT, fakerEN_GB, fakerEN_AU, fakerJA,
  fakerZH_CN, fakerKO, fakerPL, fakerRU, fakerTR, fakerRO,
  fakerHU, fakerSV, fakerNB_NO, fakerFI, fakerDA, fakerCS_CZ, fakerUK
} from '@faker-js/faker'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(enLocale)

const ALL_COUNTRIES = Object.entries(
  countries.getNames('en', { select: 'official' })
).map(([, name]) => name).sort()

const COUNTRY_TO_FAKER = {
  'Indonesia': fakerID_ID,
  'Spain': fakerES,
  'Italy': fakerIT,
  'France': fakerFR,
  'Germany': fakerDE,
  'Netherlands': fakerNL,
  'Brazil': fakerPT_BR,
  'Portugal': fakerPT_PT,
  'United Kingdom': fakerEN_GB,
  'Australia': fakerEN_AU,
  'Japan': fakerJA,
  'China': fakerZH_CN,
  'South Korea': fakerKO,
  'Poland': fakerPL,
  'Russia': fakerRU,
  'Turkey': fakerTR,
  'Romania': fakerRO,
  'Hungary': fakerHU,
  'Sweden': fakerSV,
  'Norway': fakerNB_NO,
  'Finland': fakerFI,
  'Denmark': fakerDA,
  'Czech Republic': fakerCS_CZ,
  'Ukraine': fakerUK,
}

const BACKGROUNDS = [
  { id: 'ex_rider', label: 'Ex-Rider', desc: 'Former professional rider. +3 Strategy, +2 Motivation', bonus: { strategy: 3, motivation: 2 } },
  { id: 'engineer', label: 'Race Engineer', desc: 'Technical expert from the pit wall. +4 Technical, +2 Strategy', bonus: { technical: 4, strategy: 2 } },
  { id: 'businessman', label: 'Businessman', desc: 'Investor turned team owner. +4 Negotiation, +1 Motivation', bonus: { negotiation: 4, motivation: 1 } },
  { id: 'journalist', label: 'Motorsport Journalist', desc: 'Deep knowledge of the paddock. +2 Strategy, +3 Negotiation', bonus: { strategy: 2, negotiation: 3 } },
  { id: 'coach', label: 'Performance Coach', desc: 'Specialist in rider development. +4 Motivation, +2 Technical', bonus: { motivation: 4, technical: 2 } },
  { id: 'newcomer', label: 'Newcomer', desc: 'Fresh face with no bias. Balanced stats across all skills.', bonus: { strategy: 1, negotiation: 1, technical: 1, motivation: 1 } },
]

const EXPERIENCE_LEVELS = [
  { id: 'rookie', label: 'Rookie', desc: 'First season as manager. Low base stats but higher growth rate.', basePoints: 16 },
  { id: 'experienced', label: 'Experienced', desc: 'Several seasons under your belt. Balanced stats.', basePoints: 20 },
  { id: 'veteran', label: 'Veteran', desc: 'Decades of experience. High base stats, slower growth.', basePoints: 30 },
]

const AVATAR_COLORS = [
  { bg: 'bg-red-600' }, { bg: 'bg-blue-600' }, { bg: 'bg-green-600' },
  { bg: 'bg-purple-600' }, { bg: 'bg-yellow-500' }, { bg: 'bg-orange-500' },
  { bg: 'bg-pink-600' }, { bg: 'bg-cyan-600' },
]

const SKILL_INFO = {
  strategy: { label: 'Strategy', desc: 'Affects race strategy decisions — tyre choice, pit timing, pace management.', color: 'text-red-400', bar: 'bg-red-500' },
  negotiation: { label: 'Negotiation', desc: 'Better contract deals, lower rider salaries, higher sponsor income.', color: 'text-blue-400', bar: 'bg-blue-500' },
  technical: { label: 'Technical', desc: 'Faster bike development, more effective upgrades, better setup.', color: 'text-yellow-400', bar: 'bg-yellow-500' },
  motivation: { label: 'Motivation', desc: 'Keeps rider morale high, boosts performance under pressure.', color: 'text-green-400', bar: 'bg-green-500' },
}

export default function CreateManager({ onConfirm, onBack }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [age, setAge] = useState(35)
  const [nationality, setNationality] = useState('Spain')
  const [countrySearch, setCountrySearch] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [avatarColor, setAvatarColor] = useState(0)
  const [background, setBackground] = useState(null)
  const [experience, setExperience] = useState(null)
  const [skillPoints, setSkillPoints] = useState({ strategy: 0, negotiation: 0, technical: 0, motivation: 0 })
  const [freePoints, setFreePoints] = useState(0)
  const [error, setError] = useState('')

  const initials = name.trim()
    ? name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'MG'

  const filteredCountries = ALL_COUNTRIES.filter(c =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  )

  function generateName() {
    const localFaker = COUNTRY_TO_FAKER[nationality] || faker
    try {
      const generated = localFaker.person.fullName({ sex: 'male' })
      setName(generated)
    } catch {
      setName(faker.person.fullName({ sex: 'male' }))
    }
    setError('')
  }

  function selectBackground(bg) {
    setBackground(bg)
    const base = experience ? experience.basePoints : 16
    const newSkills = { strategy: 0, negotiation: 0, technical: 0, motivation: 0 }
    Object.entries(bg.bonus).forEach(([k, v]) => { newSkills[k] = v })
    setSkillPoints(newSkills)
    setFreePoints(base)
  }

  function selectExperience(exp) {
    setExperience(exp)
      const newSkills = { strategy: 0, negotiation: 0, technical: 0, motivation: 0 }
    if (background) {
      Object.entries(background.bonus).forEach(([k, v]) => { newSkills[k] = v })
    }
      setSkillPoints(newSkills)
      setFreePoints(exp.basePoints)
  }

  function addPoint(skill) {
    if (freePoints <= 0) return
    if (skillPoints[skill] >= 10) return
    setSkillPoints(p => ({ ...p, [skill]: p[skill] + 1 }))
    setFreePoints(f => f - 1)
  }

  function removePoint(skill) {
    const bgBonus = background?.bonus[skill] || 0
    if (skillPoints[skill] <= bgBonus) return
    setSkillPoints(p => ({ ...p, [skill]: p[skill] - 1 }))
    setFreePoints(f => f + 1)
  }

  function handleNext() {
    if (step === 1) {
      if (!name.trim()) { setError('Please enter your manager name.'); return }
      setError('')
      setStep(2)
    } else if (step === 2) {
      if (!background) { setError('Please select a background.'); return }
      if (!experience) { setError('Please select an experience level.'); return }
      setError('')
      setStep(3)
    }
  }

  function handleConfirm() {
    onConfirm({
      name: name.trim(),
      age,
      nationality,
      avatarColor,
      background: background.id,
      experience: experience.id,
      skills: skillPoints,
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-10">

        <button
          onClick={step === 1 ? onBack : () => setStep(s => s - 1)}
          className="text-gray-500 hover:text-white text-sm mb-8 flex items-center gap-2 transition-colors"
        >
          ← Back
        </button>

        <div className="text-sm font-semibold tracking-[0.3em] text-red-500 uppercase mb-2">
          Create Manager — Step {step} of 3
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-red-500' : 'bg-gray-800'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Personal Info</h2>
              <p className="text-base text-gray-500">Set up your manager identity.</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className={`w-24 h-24 rounded-full ${AVATAR_COLORS[avatarColor].bg} flex items-center justify-center text-3xl font-bold`}>
                {initials}
              </div>
              <div className="flex gap-2">
                {AVATAR_COLORS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setAvatarColor(i)}
                    className={`w-8 h-8 rounded-full ${c.bg} transition-all ${avatarColor === i ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-950 scale-110' : 'opacity-50 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="col-span-2">
                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider block mb-2">Manager Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setError('') }}
                    placeholder="Enter your name"
                    maxLength={30}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors text-base"
                  />
                  <button
                    onClick={generateName}
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-base font-medium text-gray-300 transition-colors whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
                <div className="text-sm text-gray-600 mt-1">Name generated based on selected nationality</div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider block mb-2">Age</label>
                <div className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3">
                  <button onClick={() => setAge(a => Math.max(25, a - 1))} className="text-gray-400 hover:text-white text-lg font-bold w-6">−</button>
                  <span className="flex-1 text-center text-base font-semibold">{age}</span>
                  <button onClick={() => setAge(a => Math.min(70, a + 1))} className="text-gray-400 hover:text-white text-lg font-bold w-6">+</button>
                </div>
              </div>

              <div className="relative">
                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Nationality — <span className="text-white normal-case">{nationality}</span>
                </label>
                <input
                  type="text"
                  value={countrySearch}
                  onChange={e => setCountrySearch(e.target.value)}
                  onFocus={() => setShowCountryDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCountryDropdown(false), 150)}
                  placeholder="Search or click to browse..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors text-base"
                />
                {showCountryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-xl max-h-52 overflow-y-auto">
                    {filteredCountries.slice(0, 50).map(n => (
                      <div
                        key={n}
                        onMouseDown={() => { setNationality(n); setCountrySearch(''); setShowCountryDropdown(false) }}
                        className={`px-4 py-2.5 cursor-pointer text-base transition-colors hover:bg-gray-800 ${
                          nationality === n ? 'text-red-400 font-medium bg-gray-800' : 'text-white'
                        }`}
                      >
                        {n}
                      </div>
                    ))}
                    {filteredCountries.length === 0 && (
                      <div className="px-4 py-3 text-gray-500 text-sm">No country found</div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <button onClick={handleNext} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all text-base">
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Background & Experience</h2>
              <p className="text-base text-gray-500">Your history shapes your strengths.</p>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Background</div>
              <div className="grid grid-cols-2 gap-3">
                {BACKGROUNDS.map(bg => (
                  <div
                    key={bg.id}
                    onClick={() => selectBackground(bg)}
                    className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition-all ${
                      background?.id === bg.id ? 'border-red-600' : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-base font-semibold text-white mb-1">{bg.label}</div>
                    <div className="text-sm text-gray-500 leading-relaxed">{bg.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Experience Level</div>
              <div className="grid grid-cols-3 gap-3">
                {EXPERIENCE_LEVELS.map(exp => (
                  <div
                    key={exp.id}
                    onClick={() => selectExperience(exp)}
                    className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition-all ${
                      experience?.id === exp.id ? 'border-red-600' : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-base font-semibold text-white mb-1">{exp.label}</div>
                    <div className="text-sm text-gray-500 leading-relaxed">{exp.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <button onClick={handleNext} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all text-base">
              Continue →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Skill Points</h2>
              <p className="text-base text-gray-500">Distribute your remaining points across skills.</p>
            </div>

            <div className={`flex items-center justify-between bg-gray-900 border rounded-xl px-5 py-3 ${freePoints > 0 ? 'border-yellow-700' : 'border-gray-800'}`}>
              <span className="text-base text-gray-400">Points remaining</span>
              <span className={`text-2xl font-bold ${freePoints > 0 ? 'text-yellow-400' : 'text-gray-600'}`}>{freePoints}</span>
            </div>

            <div className="space-y-4">
              {Object.entries(SKILL_INFO).map(([key, info]) => (
                <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className={`text-base font-semibold ${info.color}`}>{info.label}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{info.desc}</div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={() => removePoint(key)}
                        className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="text-xl font-bold text-white w-6 text-center">{skillPoints[key]}</span>
                      <button
                        onClick={() => addPoint(key)}
                        disabled={freePoints <= 0}
                        className={`w-8 h-8 rounded-lg font-bold transition-colors flex items-center justify-center ${
                          freePoints > 0 ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <StarRating value={skillPoints[key]} max={10} size="md" />
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Manager Summary</div>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full ${AVATAR_COLORS[avatarColor].bg} flex items-center justify-center text-xl font-bold flex-shrink-0`}>
                  {initials}
                </div>
                <div>
                  <div className="text-base font-semibold text-white">{name || 'No name'}</div>
                  <div className="text-sm text-gray-500">{age} years old · {nationality}</div>
                  <div className="text-sm text-gray-500">{background?.label} · {experience?.label}</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={freePoints > 0}
              className={`w-full py-3 font-semibold rounded-xl transition-all text-base ${
                freePoints === 0
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              {freePoints > 0 ? `Distribute ${freePoints} more point${freePoints > 1 ? 's' : ''}` : 'Start Career →'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}