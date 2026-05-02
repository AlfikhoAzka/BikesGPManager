import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

const TYPE_COLOR = {
  rider: 'bg-red-950 text-red-300 border-red-800',
  staff: 'bg-blue-950 text-blue-300 border-blue-800',
  sponsor: 'bg-green-950 text-green-300 border-green-800',
  media: 'bg-purple-950 text-purple-300 border-purple-800',
}

const TYPE_ICON = {
  rider: '🏍️',
  staff: '🔧',
  sponsor: '💰',
  media: '📰',
}

const QUICK_REPLIES = {
  rider: [
    "I understand. We'll work on this together.",
    "Keep pushing — I believe in you.",
    "Let's discuss this after the next race.",
    "I'll look into improving the bike setup for you.",
    "Your performance has been noted. Stay focused.",
    "We're fully behind you this season.",
    "I hear you. Let me review what we can do.",
    "Trust the process — results will come.",
  ],
  staff: [
    "Thanks for the update. Please proceed.",
    "Good analysis. Let's implement your suggestions.",
    "I'll review this and get back to you.",
    "Can you prepare a detailed report?",
    "Approved. Keep up the good work.",
    "Let's discuss this before the next race.",
    "Interesting findings. What do you recommend?",
    "Please coordinate with the rest of the team.",
  ],
  media: [
    "We'd be happy to attend. Please send details.",
    "Unfortunately we're unavailable at that time.",
    "Our PR team will be in touch shortly.",
    "We'll issue a statement later today.",
    "No comment at this time.",
    "Thank you for the interest. We'll consider it.",
  ],
  sponsor: [
    "Thank you for the update.",
    "We'll review and respond soon.",
    "Please schedule a meeting with our team.",
    "We appreciate your continued support.",
    "Noted. We're working to improve results.",
    "Thank you for your patience and partnership.",
  ],
}

const CHAT_OPENERS = {
  rider: (name) => [
    `Hey ${name}, excited to work with you this season. What are your goals?`,
    `${name}, how are you feeling about the bike setup so far?`,
    `I want to discuss your contract situation — are you happy here?`,
    `${name}, let's talk about your performance targets this season.`,
    `How are you feeling physically after the last race?`,
    `${name}, what do you think we need to improve on the bike?`,
  ],
  staff: (name) => [
    `${name}, what's your honest assessment of our current setup?`,
    `I'd like your opinion on where we can improve this season.`,
    `Can you walk me through the data from our last race?`,
    `What upgrades should be our top priority right now?`,
    `${name}, how is the team morale from your perspective?`,
    `What's your biggest concern going into the next race?`,
  ],
}

const CHAT_POST_RACE_TOPICS = {
  rider: (name, position) => [
    position <= 5
      ? `${name}, great race today! P${position} — what was the key to your performance?`
      : `${name}, tough race today. P${position} — what did you struggle with most?`,
    `How did the tyre strategy feel during the race?`,
    `Were you happy with the pit wall communication today?`,
    `What's your target for the next round?`,
    `${name}, any feedback on the bike balance during the race?`,
  ],
  staff: (name, position) => [
    `${name}, your analysis on P${position} — what went well?`,
    `Where did we lose the most time compared to the leaders?`,
    `What setup changes would you recommend for next race?`,
    `How did our strategy compare to the other teams?`,
    `${name}, what's our biggest area for improvement right now?`,
  ],
}

const CHAT_RESPONSES = {
  rider: [
    "Thanks for the message, boss. I appreciate you reaching out.",
    "Honestly, I feel like we're getting closer. Just need a few more tweaks.",
    "The bike feels better but there's still some work to do on the setup.",
    "I'm giving everything I have. The results will come.",
    "Appreciated. I'll keep pushing every session.",
    "Good to hear from you. I have some thoughts on the setup actually.",
    "I think we need to work on corner entry — that's where I'm losing time.",
    "The tyres were tricky today but I managed them as best I could.",
    "I want to stay focused on the next race. Let's keep improving.",
    "I feel good physically. Mentally I'm fully committed to this season.",
  ],
  staff: [
    "Understood, Manager. I'll get right on it.",
    "Good point. Let me pull up the data and I'll have a report ready.",
    "Noted. I'll coordinate with the team on this.",
    "I've actually been thinking about this. I have some ideas.",
    "Will do. I'll keep you updated on progress.",
    "The numbers support what you're saying. Let me dig deeper.",
    "I'll have a proposal ready before the next race weekend.",
    "Agreed. This is something I've flagged internally as well.",
    "I'll brief the technical team and report back.",
    "Consider it done. I'll also loop in the setup specialist.",
  ],
}

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

function formatRole(role) {
  return role
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase())
}

function InboxView() {
  const { messages, markMessageRead, markAllRead, unreadCount, budget, spendBudget } = useGameStore()
  const [selectedMsg, setSelectedMsg] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [replyText, setReplyText] = useState('')
  const [replySent, setReplySent] = useState(false)
  const [actionDone, setActionDone] = useState({})

  const filteredMessages = messages.filter(m =>
    filterType === 'all' ? true : m.type === filterType
  )

  function openMessage(msg) {
    setSelectedMsg(msg)
    setReplySent(false)
    setReplyText('')
    if (!msg.read) markMessageRead(msg.id)
  }

  function sendReply() {
    if (!replyText.trim()) return
    setReplySent(true)
    setReplyText('')
  }

  function handleAction(action) {
    if (actionDone[action.type]) return
    setActionDone(prev => ({ ...prev, [action.type]: true }))
    if (action.type === 'sponsor_bonus' || action.type === 'accept_sponsor') {
      spendBudget(-(action.amount || 0.5))
    }
  }

  const unreadByType = {
    rider: messages.filter(m => !m.read && m.type === 'rider').length,
    staff: messages.filter(m => !m.read && m.type === 'staff').length,
    media: messages.filter(m => !m.read && m.type === 'media').length,
    sponsor: messages.filter(m => !m.read && m.type === 'sponsor').length,
  }

  return (
    <div className="grid grid-cols-5 gap-4" style={{ height: '680px' }}>

      {/* Message list */}
      <div className="col-span-2 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1 flex-wrap">
            {['all', 'rider', 'staff', 'media', 'sponsor'].map(f => (
              <button
                key={f}
                onClick={() => { setFilterType(f); setSelectedMsg(null) }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize relative ${
                  filterType === f ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f}
                {f !== 'all' && unreadByType[f] > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                    {unreadByType[f]}
                  </span>
                )}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-gray-600 hover:text-gray-400 transition-colors whitespace-nowrap">
              Mark all read
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filteredMessages.length === 0 && (
            <div className="text-center py-16 text-gray-600 text-sm">No messages</div>
          )}
          {filteredMessages.map(msg => (
            <div
              key={msg.id}
              onClick={() => openMessage(msg)}
              className={`border rounded-xl p-3.5 cursor-pointer transition-all ${
                selectedMsg?.id === msg.id
                  ? 'border-red-600 bg-red-950 bg-opacity-20'
                  : !msg.read
                  ? 'border-gray-700 bg-gray-900 hover:border-gray-600'
                  : 'border-gray-800 bg-gray-900 bg-opacity-50 hover:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  {TYPE_ICON[msg.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className={`text-sm font-semibold truncate ${!msg.read ? 'text-white' : 'text-gray-400'}`}>
                      {msg.from}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {msg.priority === 'high' && <span className="text-red-400 text-xs font-bold">●</span>}
                      {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                      <span className="text-xs text-gray-600">{formatDate(msg.timestamp)}</span>
                    </div>
                  </div>
                  <div className={`text-sm truncate mb-0.5 ${!msg.read ? 'text-gray-200 font-medium' : 'text-gray-500'}`}>
                    {msg.subject}
                  </div>
                  <div className="text-xs text-gray-600 truncate">{msg.preview}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message detail */}
      <div className="col-span-3 bg-gray-900 border border-gray-800 rounded-xl flex flex-col overflow-hidden">
        {selectedMsg ? (
          <>
            <div className="px-5 py-4 border-b border-gray-800 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-base flex-shrink-0">
                  {TYPE_ICON[selectedMsg.type]}
                </div>
                <div>
                  <div className="text-base font-semibold text-white">{selectedMsg.from}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded border ${TYPE_COLOR[selectedMsg.type]}`}>
                      {selectedMsg.type}
                    </span>
                    <span className="text-xs text-gray-600">{formatDate(selectedMsg.timestamp)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedMsg(null)} className="text-gray-600 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="text-base font-semibold text-white">{selectedMsg.subject}</div>

              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-base text-gray-300 leading-relaxed whitespace-pre-line">{selectedMsg.body}</p>
              </div>

              {selectedMsg.actions?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Actions</div>
                  {selectedMsg.actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleAction(action)}
                      disabled={!!actionDone[action.type]}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-base font-medium transition-colors ${
                        actionDone[action.type]
                          ? 'border-green-800 bg-green-950 text-green-400 cursor-not-allowed'
                          : 'border-gray-700 bg-gray-800 text-white hover:border-red-600 hover:bg-red-950'
                      }`}
                    >
                      {actionDone[action.type] ? '✓ ' : ''}{action.label}
                    </button>
                  ))}
                </div>
              )}

              {replySent && (
                <div className="bg-green-950 border border-green-800 rounded-xl px-4 py-3 text-sm text-green-400">
                  ✓ Reply sent successfully
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-800 space-y-3">
              <div className="flex flex-wrap gap-2">
                {(QUICK_REPLIES[selectedMsg.type] || [])
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 3)
                  .map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setReplyText(r)}
                      className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-gray-700"
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
                  onKeyDown={e => e.key === 'Enter' && sendReply()}
                  placeholder="Write a reply..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 text-base"
                />
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim()}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl text-base font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <div className="text-4xl mb-3">📬</div>
              <div className="text-gray-500 text-base">Select a message to read</div>
              <div className="text-gray-700 text-sm mt-1">{messages.length} messages in inbox</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ChatView() {
  const { chats, riders, staff, results, addChatMessage, replyChat } = useGameStore()
  const [selectedContact, setSelectedContact] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  const hasRaceResults = results.length > 0
  const lastRound = results[results.length - 1]

  const contacts = [
    ...riders.map(r => ({
      id: `rider_${r.id}`,
      name: r.name,
      role: 'Rider',
      number: r.number,
      type: 'rider',
      data: r,
    })),
    ...Object.entries(staff).map(([role, p]) => ({
      id: `staff_${role}`,
      name: p.name,
      role: formatRole(role),
      type: 'staff',
      data: p,
    })),
  ]

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, selectedContact])

  function sendMessage(text) {
    if (!text.trim() || !selectedContact) return
    replyChat(selectedContact.id, text.trim())
    setChatInput('')
    setIsTyping(true)

    const delay = 800 + Math.random() * 1500
    setTimeout(() => {
      const pool = CHAT_RESPONSES[selectedContact.type] || CHAT_RESPONSES.staff
      const response = pool[Math.floor(Math.random() * pool.length)]
      addChatMessage(selectedContact.id, {
        from: selectedContact.id,
        text: response,
      })
      setIsTyping(false)
    }, delay)
  }

  function getTopicSuggestions() {
    if (!selectedContact) return []
    const contactChat = chats[selectedContact.id] || []

    if (contactChat.length === 0) {
      return CHAT_OPENERS[selectedContact.type]?.(selectedContact.name) || []
    }

    if (hasRaceResults && lastRound) {
      const pos = lastRound.position
      return CHAT_POST_RACE_TOPICS[selectedContact.type]?.(selectedContact.name, pos) || []
    }

    return (QUICK_REPLIES[selectedContact.type] || []).slice(0, 4)
  }

  const contactChat = selectedContact ? (chats[selectedContact.id] || []) : []
  const topics = getTopicSuggestions()

  return (
    <div className="grid grid-cols-4 gap-4" style={{ height: '680px' }}>

      {/* Contact list */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contacts</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map(contact => {
            const contactChats = chats[contact.id] || []
            const lastMsg = contactChats[contactChats.length - 1]
            const isSelected = selectedContact?.id === contact.id
            return (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-800 ${
                  isSelected ? 'bg-red-950 bg-opacity-40' : 'hover:bg-gray-800'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  contact.type === 'rider' ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'
                }`}>
                  {contact.type === 'rider' ? `#${contact.number}` : '🔧'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-white truncate">{contact.name}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {lastMsg
                      ? (lastMsg.from === 'manager' ? 'You: ' : '') + lastMsg.text
                      : contact.role}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat window */}
      <div className="col-span-3 bg-gray-900 border border-gray-800 rounded-xl flex flex-col overflow-hidden">
        {selectedContact ? (
          <>
            <div className="px-5 py-3.5 border-b border-gray-800 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                selectedContact.type === 'rider' ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'
              }`}>
                {selectedContact.type === 'rider' ? `#${selectedContact.number}` : '🔧'}
              </div>
              <div>
                <div className="text-base font-semibold text-white">{selectedContact.name}</div>
                <div className="text-sm text-gray-500">{selectedContact.role}</div>
              </div>
              {isTyping && (
                <div className="ml-auto text-sm text-gray-500 italic">typing...</div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {contactChat.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-5">
                  <div className="text-center">
                    <div className="text-gray-500 text-base mb-1">Start a conversation</div>
                    <div className="text-gray-700 text-sm">Choose a topic or write your own message</div>
                  </div>
                  <div className="w-full max-w-md space-y-2">
                    {topics.map((topic, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(topic)}
                        className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-4 py-3 rounded-xl text-base transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {contactChat.map(msg => {
                    const isManager = msg.from === 'manager'
                    return (
                      <div key={msg.id} className={`flex ${isManager ? 'justify-end' : 'justify-start'}`}>
                        {!isManager && (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 self-end ${
                            selectedContact.type === 'rider' ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'
                          }`}>
                            {selectedContact.type === 'rider' ? `#${selectedContact.number}` : '🔧'}
                          </div>
                        )}
                        <div className={`max-w-sm px-4 py-2.5 rounded-2xl text-base ${
                          isManager
                            ? 'bg-red-600 text-white rounded-br-sm'
                            : 'bg-gray-800 text-white rounded-bl-sm'
                        }`}>
                          <div className="leading-relaxed">{msg.text}</div>
                          <div className={`text-xs mt-1 ${isManager ? 'text-red-300' : 'text-gray-500'}`}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {contactChat.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-800 space-y-2">
                <div className="flex gap-2 flex-wrap">
                  {topics.slice(0, 3).map((t, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(t)}
                      className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-gray-700 whitespace-nowrap"
                    >
                      {t.length > 40 ? t.slice(0, 40) + '...' : t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage(chatInput)}
                    placeholder={`Message ${selectedContact.name}...`}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 text-base"
                  />
                  <button
                    onClick={() => sendMessage(chatInput)}
                    disabled={!chatInput.trim()}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl text-base font-medium transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <div className="text-4xl mb-3">💬</div>
              <div className="text-gray-500 text-base">Select a contact to chat</div>
              <div className="text-gray-700 text-sm mt-1">Riders and staff are available</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Messages() {
  const { unreadCount } = useGameStore()
  const [tab, setTab] = useState('inbox')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Messages</h2>
          <p className="text-sm text-gray-500">Inbox for official communications · Chat for direct conversations</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'inbox', label: 'Inbox', badge: unreadCount },
          { id: 'chat', label: 'Chat', badge: 0 },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-6 py-2.5 rounded-xl text-base font-medium transition-colors relative ${
              tab === t.id ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            {t.label}
            {t.badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'inbox' && <InboxView />}
      {tab === 'chat' && <ChatView />}
    </div>
  )
}