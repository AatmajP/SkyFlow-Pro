/**
 * TravelAssistantChat — AI mood-based destination suggestion panel.
 *
 * Renders as a floating chat button + expandable panel.
 * Uses the travelAssistant service for structured suggestions.
 */
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, X, Send, Sparkles, Plane, ArrowRight } from 'lucide-react'
import {
  CATEGORY_CONFIG,
  type AssistantResponse,
  type Suggestion,
} from '../../services/travelAssistant'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  suggestions?: Suggestion[]
}

export function TravelAssistantChat() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: '✨ Hi! I\'m your AI travel assistant. Tell me how you\'re feeling and I\'ll suggest the perfect destination!\n\nTry: "I feel stressed", "beach vacation", "romantic trip", or "adventure"',
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen])

  const [chatState, setChatState] = useState<any>({
    awaiting: 'none',
    origin: 'DEL'
  })

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    // Show "typing" indicator or just wait
    // We'll just wait for the promise
    
    try {
      const { response, newState } = await import('../../services/travelAssistant').then(m => m.processChat(trimmed, chatState))
      
      setChatState(newState)

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response.message,
        suggestions: response.suggestions,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'Sorry, I ran into an error looking that up.'
      }])
    }
  }

  const handleExplore = (airportCode: string) => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 14)
    const dateStr = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`

    const params = new URLSearchParams({
      from: 'DEL',
      to: airportCode,
      date: dateStr,
      tripType: 'roundtrip',
      adults: '1',
      cabin: 'economy',
      flex: '3',
    })
    navigate({ pathname: '/results', search: params.toString() })
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Floating button + chat panel (portal to body) ──
  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-500 to-purple-600 text-white shadow-lg shadow-sky-500/30 flex items-center justify-center hover:scale-105 transition-transform duration-200"
          aria-label="Open AI Travel Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel — portalled to body */}
      {isOpen && createPortal(
        <div className="fixed bottom-6 right-6 z-[99998] w-[380px] max-w-[calc(100vw-48px)] flex flex-col rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden" style={{ height: 520, background: 'rgba(15, 23, 42, 0.98)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-gradient-to-r from-sky-900/40 to-purple-900/40">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-50">AI Travel Assistant</h3>
                <p className="text-[0.6rem] text-slate-400">Mood-based suggestions</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-sky-500/20 border border-sky-500/30 rounded-2xl rounded-br-md px-4 py-2.5'
                    : 'bg-slate-800/60 border border-slate-700/40 rounded-2xl rounded-bl-md px-4 py-2.5'
                }`}>
                  <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Suggestion cards */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.suggestions.map(s => {
                        const catCfg = CATEGORY_CONFIG[s.category]
                        return (
                          <button
                            key={s.airportCode}
                            onClick={() => handleExplore(s.airportCode)}
                            className="w-full text-left p-3 rounded-xl bg-slate-900/60 border border-slate-700/40 hover:border-sky-500/40 hover:bg-slate-800/80 transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                                  {s.airportCode}
                                </span>
                                <span className="text-sm font-semibold text-slate-100">
                                  {s.city}, {s.country}
                                </span>
                              </div>
                              <span className={`text-[0.6rem] font-medium ${catCfg.color}`}>
                                {catCfg.emoji} {catCfg.label}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-slate-400 leading-relaxed max-w-[70%]">{s.reason}</p>
                              {s.price && (
                                <p className="text-sm font-bold text-emerald-400">
                                  ₹{s.price.toLocaleString('en-IN')}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plane className="h-3 w-3" />
                              <span>Search flights</span>
                              <ArrowRight className="h-3 w-3" />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="How are you feeling today?"
                className="flex-1 rounded-xl bg-slate-800/60 border border-slate-700/50 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500/50 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-10 w-10 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 text-white flex items-center justify-center transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
