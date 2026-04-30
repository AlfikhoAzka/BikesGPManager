import { useState } from 'react'

const NATIONALITIES = [
  'Indonesian', 'Spanish', 'Italian', 'French', 'British',
  'German', 'Dutch', 'Portuguese', 'Australian', 'Japanese',
  'American', 'Brazilian', 'Argentine', 'Malaysian', 'Thai',
]

const AVATAR_COLORS = [
  { bg: 'bg-red-600', label: 'Red' },
  { bg: 'bg-blue-600', label: 'Blue' },
  { bg: 'bg-green-600', label: 'Green' },
  { bg: 'bg-purple-600', label: 'Purple' },
  { bg: 'bg-yellow-500', label: 'Yellow' },
  { bg: 'bg-orange-500', label: 'Orange' },
]

export default function CreateManager({ onConfirm, onBack }) {
  const [name, setName] = useState('')
  const [nationality, setNationality] = useState('Indonesian')
  const [avatarColor, setAvatarColor] = useState(0)
  const [error, setError] = useState('')

  const initials = name.trim()
    ? name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'MG'

  function handleConfirm() {
    if (!name.trim()) {
      setError('Please enter your manager name.')
      return
    }
    onConfirm({ name: name.trim(), nationality, avatarColor })
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
      <div className="w-full max-w-md px-6">

        <button onClick={onBack} className="text-gray-600 hover:text-white text-sm mb-8 flex items-center gap-2 transition-colors">
          ← Back
        </button>

        <div className="text-xs font-semibold tracking-[0.3em] text-red-500 uppercase mb-2">Step 1 of 2</div>
        <h2 className="text-3xl font-bold text-white mb-1">Create Manager</h2>
        <p className="text-sm text-gray-500 mb-8">Set up your manager profile before choosing a team.</p>

        <div className="flex flex-col items-center mb-8">
          <div className={`w-20 h-20 rounded-full ${AVATAR_COLORS[avatarColor].bg} flex items-center justify-center text-2xl font-bold text-white mb-4`}>
            {initials}
          </div>
          <div className="flex gap-2">
            {AVATAR_COLORS.map((c, i) => (
              <button
                key={i}
                onClick={() => setAvatarColor(i)}
                className={`w-7 h-7 rounded-full ${c.bg} transition-all ${avatarColor === i ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-950 scale-110' : 'opacity-60 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Manager Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Enter your name"
              maxLength={30}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors text-sm"
            />
            {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Nationality
            </label>
            <select
              value={nationality}
              onChange={e => setNationality(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors text-sm"
            >
              {NATIONALITIES.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full mt-8 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all hover:scale-105 text-sm tracking-wide"
        >
          Continue — Choose Team →
        </button>
      </div>
    </div>
  )
}