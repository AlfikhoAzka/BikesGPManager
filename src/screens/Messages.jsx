import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const TYPE_COLOR = {
  rider: 'bg-red-900 text-red-300',
  staff: 'bg-blue-900 text-blue-300',
  sponsor: 'bg-green-900 text-green-300',
  media: 'bg-purple-900 text-purple-300',
}

const TYPE_ICON = {
  rider: '🏍️',
  staff: '🔧',
  sponsor: '💰',
  media: '📰',
}

const PRIORITY_COLOR = {
  high: 'text-red-400',
  normal: 'text-gray-600',
}

const QUICK_REPLIES = {
  rider: [
    "I understand. We'll work on this together.",
    "Keep pushing — I believe in you.",
    "Let's discuss this after the next race.",
    "I'll look into improving the bike setup for you.",
  ],
  staff: [
    "Thanks for the update. Please proceed.",
    "Good analysis. Let's implement your suggestions.",
    "I'll review this and get back to you.",
    "Can you prepare a detailed report?",
  ],
  media: [
    "We'd be happy to attend. Please send details.",
    "Unfortunately we're unavailable at that time.",
    "Our PR team will be in touch shortly.",
  ],
  sponsor: [
    "Thank you for the update.",
    "We'll review and respond soon.",
    "Please schedule a meeting with our team.",
  ],
}

const CHAT_CONTACTS = [
  { id: 'rider', label: 'Riders', icon: '🏍️' },
  { id: 'staff', label: 'Staff', icon: '🔧' },
]

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

function getOpeners(contact) {
  if (contact.type === 'rider') {
    return [
      `Hey ${contact.name}, excited to work with you this season. What are your goals?`,
      `${contact.name}, how are you feeling about the bike setup so far?`,
      `Let's talk about your contract situation — I want to keep you long term.`,
      `${contact.name}, I want to discuss your performance targets for this season.`,
    ]
  }
  if (contact.type === 'staff') {
    return [
      `${contact.name}, what's your assessment of the bike's current setup?`,
      `I'd like your honest opinion on where we can improve this season.`,
      `Can you walk me through the data from our last race?`,
      `What upgrades do you think should be our top priority?`,
    ]
  }
  return [`Hi ${contact.name}, how can I help?`]
}

function getOpenerResponse(contact) {
  if (contact.type === 'rider') {
    return [
      "Thanks for reaching out! I'm really motivated this season. The bike feels good and I think we can fight for podiums.",
      "Honestly, I think we have real potential this year. I just need consistent support from the team.",
      "I appreciate you saying that. Contract security would really help me focus fully on the racing.",
      "My goal is simple — top 5 in the championship. I believe we can do it with the right upgrades.",
    ]
  }
  if (contact.type === 'staff') {
    return [
      "Glad you asked. I have some ideas that could shave a few tenths off our lap time.",
      "The data shows we're losing time in the braking zones. I have a plan to address that.",
      "Honestly, the electronics package needs an upgrade. It's holding us back on corner exit.",
      "I'll prepare a full report. In short — suspension and aero are our biggest areas to improve.",
    ]
  }
  return ["Thanks for getting in touch!"]
}

export default function Messages() {
  const { messages, chats, riders, staff, markMessageRead, markAllRead, addChatMessage, replyChat, unreadCount } = useGameStore()

  const [tab, setTab] = useState('inbox')
  const [selectedMsg, setSelectedMsg] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [filterType, setFilterType] = useState('all')

  const contacts = [
    ...riders.map(r => ({
      id: `rider_${r.id}`,
      name: r.name,
      role: 'Rider',
      number: r.number,
      type: 'rider',
      avatar: `#${r.number}`,
    })),
    ...Object.entries(staff).map(([role, p]) => ({
      id: `staff_${role}`,
      name: p.name,
      role: function formatRole(role) {
              return role
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .replace(/\b\w/g, c => c.toUpperCase())
            },
      type: 'staff',
      avatar: '🔧',
    })),
  ]

  const filteredMessages = messages.filter(m =>
    filterType === 'all' ? true : m.type === filterType
  )

  function openMessage(msg) {
    setSelectedMsg(msg)
    if (!msg.read) markMessageRead(msg.id)
  }

  function sendReply() {
    if (!replyText.trim() || !selectedMsg) return
    setReplyText('')
  }

  function sendChatMessage() {
    if (!chatInput.trim() || !selectedContact) return
    replyChat(selectedContact.id, chatInput.trim())
    setChatInput('')

    setTimeout(() => {
      const responses = {
        rider: [
          "Thanks for letting me know, boss.",
          "Understood. I'll give it my all.",
          "Appreciate the support!",
          "Got it. See you at the next race.",
          "I'll keep that in mind during practice.",
        ],
        staff: [
          "Roger that. I'll get on it right away.",
          "Understood, Manager.",
          "Good call. I'll prepare the report.",
          "Will do. Anything else you need?",
          "Noted. I'll keep you updated.",
        ],
      }
      const type = selectedContact.type
      const pool = responses[type] || responses.staff
      const response = pool[Math.floor(Math.random() * pool.length)]
      addChatMessage(selectedContact.id, {
        from: selectedContact.id,
        text: response,
      })
    }, 800 + Math.random() * 1200)
  }

  const contactChat = selectedContact ? (chats[selectedContact.id] || []) : []

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Messages</h2>
          <p className="text-base text-gray-500">Communications from riders, staff, media and sponsors.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-base text-gray-400 hover:text-white px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg transition-colors"
          >
            Mark all read ({unreadCount})
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {['inbox', 'chat'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-base font-medium transition-colors capitalize relative ${
              tab === t ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            {t === 'inbox' ? 'Inbox' : 'Chat'}
            {t === 'inbox' && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'inbox' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex gap-2 mb-3 flex-wrap">
              {['all', 'rider', 'staff', 'media', 'sponsor'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1.5 rounded-lg text-base font-medium transition-colors capitalize ${
                    filterType === f ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredMessages.length === 0 && (
                <div className="text-center py-12 text-gray-600">No messages yet</div>
              )}
              {filteredMessages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedMsg?.id === msg.id ? 'border-red-600' :
                    !msg.read ? 'border-gray-700 hover:border-gray-600' :
                    'border-gray-800 hover:border-gray-700 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-base flex-shrink-0">
                      {TYPE_ICON[msg.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-base font-medium ${!msg.read ? 'text-white' : 'text-gray-400'}`}>
                          {msg.from}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {msg.priority === 'high' && (
                            <span className="text-xs text-red-400 font-semibold">!</span>
                          )}
                          {!msg.read && (
                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                          )}
                          <span className="text-xs text-gray-600">{formatDate(msg.timestamp)}</span>
                        </div>
                      </div>
                      <div className={`text-base font-medium mb-0.5 ${!msg.read ? 'text-gray-200' : 'text-gray-500'}`}>
                        {msg.subject}
                      </div>
                      <div className="text-base text-gray-600 truncate">{msg.preview}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {selectedMsg ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sticky top-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-base">
                      {TYPE_ICON[selectedMsg.type]}
                    </div>
                    <div>
                      <div className="text-base font-semibold text-white">{selectedMsg.from}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded ${TYPE_COLOR[selectedMsg.type]}`}>
                          {selectedMsg.type}
                        </span>
                        <span className="text-xs text-gray-600">{formatDate(selectedMsg.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedMsg(null)} className="text-gray-600 hover:text-white text-xl">×</button>
                </div>

                <div className="text-base font-semibold text-white mb-3">{selectedMsg.subject}</div>

                <div className="bg-gray-800 rounded-xl p-4 mb-4">
                  <p className="text-base text-gray-300 leading-relaxed whitespace-pre-line">{selectedMsg.body}</p>
                </div>

                {selectedMsg.action?.type === 'boost_morale' && (
                  <div className="bg-blue-950 border border-blue-800 rounded-xl p-3 mb-4">
                    <div className="text-base font-semibold text-blue-300 mb-1">Available Action</div>
                    <div className="text-base text-blue-400">Send motivational message → +2 mental state for this rider</div>
                    <button className="mt-2 px-4 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-base rounded-lg transition-colors font-medium">
                      Send Support
                    </button>
                  </div>
                )}

                {selectedMsg.action?.type === 'press_conference' && (
                  <div className="bg-purple-950 border border-purple-800 rounded-xl p-3 mb-4">
                    <div className="text-base font-semibold text-purple-300 mb-1">Available Action</div>
                    <div className="text-base text-purple-400">Attend press conference → +5 team reputation</div>
                    <button className="mt-2 px-4 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-base rounded-lg transition-colors font-medium">
                      Confirm Attendance
                    </button>
                  </div>
                )}

                <div>
                  <div className="text-base text-gray-500 mb-2">Quick reply</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(QUICK_REPLIES[selectedMsg.type] || []).map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setReplyText(r)}
                        className="text-base bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 text-base"
                    />
                    <button
                      onClick={sendReply}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-base font-medium transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center h-64 text-center">
                <div className="text-gray-600 text-base">Select a message to read</div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'chat' && (
        <div className="grid grid-cols-3 gap-4" style={{ height: '600px' }}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-800">
              <div className="text-base font-semibold text-gray-400 uppercase tracking-wider">Contacts</div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {contacts.map(contact => {
                const contactChats = chats[contact.id] || []
                const lastMsg = contactChats[contactChats.length - 1]
                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-800 ${
                      selectedContact?.id === contact.id ? 'bg-gray-800' : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-basea font-bold flex-shrink-0">
                      {contact.type === 'rider' ? `#${contact.number}` : '🔧'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-medium text-white truncate">{contact.name}</div>
                      <div className="text-base text-gray-500 truncate">
                        {lastMsg ? lastMsg.text : contact.role}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
            {selectedContact ? (
              <>
                <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-base font-bold">
                    {selectedContact.type === 'rider' ? `#${selectedContact.number}` : '🔧'}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">{selectedContact.name}</div>
                    <div className="text-base text-gray-500 capitalize">{selectedContact.role}</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {contactChat.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-8 gap-4">
                      <div className="text-gray-500 text-base">Start a conversation with {selectedContact.name}</div>
                      <div className="text-sm text-gray-600 mb-2">Suggested openers:</div>
                      <div className="flex flex-col gap-2 w-full max-w-sm">
                        {getOpeners(selectedContact).map((opener, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              replyChat(selectedContact.id, opener)
                              setTimeout(() => {
                                const responses = getOpenerResponse(selectedContact)
                                addChatMessage(selectedContact.id, {
                                  from: selectedContact.id,
                                  text: responses[Math.floor(Math.random() * responses.length)],
                                })
                              }, 1000 + Math.random() * 800)
                            }}
                            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white px-4 py-3 rounded-xl text-base text-left transition-colors"
                          >
                            {opener}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {contactChat.map(msg => {
                    const isManager = msg.from === 'manager'
                    return (
                      <div key={msg.id} className={`flex ${isManager ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-base ${
                          isManager
                            ? 'bg-red-600 text-white rounded-br-sm'
                            : 'bg-gray-800 text-white rounded-bl-sm'
                        }`}>
                          <div>{msg.text}</div>
                          <div className={`text-xs mt-1 ${isManager ? 'text-red-300' : 'text-gray-500'}`}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="px-4 py-3 border-t border-gray-800">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {(QUICK_REPLIES[selectedContact.type] || []).slice(0, 2).map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setChatInput(r)}
                        className="text-base bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-1 rounded-lg transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                      placeholder={`Message ${selectedContact.name}...`}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 text-base"
                    />
                    <button
                      onClick={sendChatMessage}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-base font-medium transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <div className="text-gray-600 text-lg">Select a contact to chat</div>
                  <div className="text-gray-700 text-base mt-1">Riders and staff are available</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}