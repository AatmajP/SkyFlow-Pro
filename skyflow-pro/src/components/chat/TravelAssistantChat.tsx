import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MessageCircle, X, Send, Sparkles, Plane, ArrowRight, Bot, User, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CATEGORY_CONFIG,
  processChat,
  type Suggestion,
  type ChatState
} from '../../services/travelAssistant'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  suggestions?: Suggestion[]
}

export function TravelAssistantChat() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: '✨ Welcome to SkyFlow Intelligence! I\'m your personal travel curator.\n\nTell me about your vibe—are you looking for a romantic escape, a high-energy city, or perhaps a snowy mountain retreat?',
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [chatState, setChatState] = useState<ChatState>({
    awaiting: 'none',
    origin: searchParams.get('from') || 'DEL'
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    
    try {
      const { response, newState } = await processChat(trimmed, chatState)
      
      // Artificial delay for realism
      await new Promise(r => setTimeout(r, 1200))
      
      setChatState(newState)
      setIsTyping(false)

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response.message,
        suggestions: response.suggestions,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'I apologize, but I encountered a momentary lapse in my systems. Could you try rephrasing that?'
      }])
    }
  }

  const handleExplore = (airportCode: string) => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 14)
    const dateStr = nextWeek.toISOString().split('T')[0]

    const params = new URLSearchParams({
      from: chatState.origin,
      to: airportCode,
      date: dateStr,
      tripType: 'oneway',
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

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[90] h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-xl shadow-sky-500/20 flex items-center justify-center hover:shadow-sky-500/40 transition-shadow group"
          >
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bot className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 border-2 border-slate-900 rounded-full" />
          </motion.button>
        )}
      </AnimatePresence>

      {isOpen && createPortal(
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[1000] w-[400px] max-w-[calc(100vw-32px)] flex flex-col rounded-3xl border border-slate-800 shadow-2xl overflow-hidden bg-slate-950/95 backdrop-blur-xl" 
          style={{ height: 600 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-50">SkyFlow Assistant</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Intelligence</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-slate-200 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-sky-400'
                  }`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`space-y-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-sky-500 text-white rounded-tr-none'
                        : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>

                    {/* Suggestions */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="grid gap-3 mt-4">
                        {msg.suggestions.map(s => {
                          const catCfg = CATEGORY_CONFIG[s.category]
                          return (
                            <motion.button
                              key={s.airportCode}
                              whileHover={{ x: 5 }}
                              onClick={() => handleExplore(s.airportCode)}
                              className="w-full text-left p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-colors group relative overflow-hidden"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded uppercase tracking-tighter">
                                    {s.airportCode}
                                  </span>
                                  <span className="text-sm font-bold text-slate-100">{s.city}</span>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${catCfg.color}`}>
                                  {catCfg.emoji} {catCfg.label}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed pr-8">{s.reason}</p>
                              <div className="mt-3 flex items-center justify-between">
                                <p className="text-sm font-bold text-emerald-400">
                                  ₹{s.price?.toLocaleString('en-IN')}
                                </p>
                                <ArrowRight className="h-4 w-4 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[90%]">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/30">
            <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-1.5 focus-within:border-sky-500/50 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Where should I go for my honeymoon?"
                className="flex-1 bg-transparent py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="h-9 w-9 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white flex items-center justify-center transition-colors"
              >
                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-600 text-center mt-3 font-medium uppercase tracking-tight">
              SkyFlow Pro Intelligence · Version 2.4
            </p>
          </div>
        </motion.div>,
        document.body,
      )}
    </>
  )
}
