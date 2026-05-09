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
import { useCurrency } from '../../context/CurrencyContext'
import { useTranslation } from 'react-i18next'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  suggestions?: Suggestion[]
}

export function TravelAssistantChat() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()
  const [searchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: t('chat.greeting'),
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

      // Format budget in the message if it exists
      let formattedText = response.message
      if (newState.budget) {
        formattedText = formattedText.replace(String(newState.budget), formatPrice(newState.budget))
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: formattedText,
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

  const suggestionChips = [
    { label: t('chat.suggestions.relaxing'), mood: 'relaxing' },
    { label: t('chat.suggestions.adventure'), mood: 'adventure' },
    { label: t('chat.suggestions.luxury'), mood: 'luxury' },
    { label: t('chat.suggestions.nightlife'), mood: 'nightlife' },
    { label: t('chat.suggestions.cold'), mood: 'cold' },
  ]

  const handleChipClick = (mood: string) => {
    const chip = suggestionChips.find(c => c.mood === mood)
    if (chip) {
      setInput(`I'm looking for a ${chip.label.toLowerCase()} trip`)
      setTimeout(() => handleSend(), 100)
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
          className="fixed bottom-6 right-6 z-[1000] w-[420px] max-w-[calc(100vw-32px)] flex flex-col rounded-3xl border border-slate-800 shadow-2xl overflow-hidden bg-slate-950/95 backdrop-blur-xl" 
          style={{ height: 650 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-50">{t('chat.title')}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('chat.activeIntelligence')}</p>
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
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar min-h-0">
            {messages.map((msg, idx) => (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx === messages.length - 1 ? 0.2 : 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-sky-400'
                  }`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`space-y-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-sky-500 text-white rounded-tr-none shadow-lg shadow-sky-500/10'
                        : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>

                    {/* Suggestions */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="grid gap-3 mt-4">
                        {msg.suggestions.map((s, sIdx) => {
                          const catCfg = CATEGORY_CONFIG[s.category] || CATEGORY_CONFIG.relaxing
                          return (
                            <motion.button
                              key={`${s.airportCode}-${sIdx}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + sIdx * 0.1 }}
                              whileHover={{ x: 5 }}
                              onClick={() => handleExplore(s.airportCode)}
                              className="w-full text-left p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-colors group relative overflow-hidden shadow-xl"
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
                                  Est. {formatPrice(s.price)}
                                </p>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-sky-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                  {t('chat.viewFlights')} <ArrowRight className="h-3 w-3" />
                                </div>
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[90%]">
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {messages.length < 4 && (
            <div className="px-6 pb-2 overflow-x-auto flex gap-2 no-scrollbar">
              {suggestionChips.map(chip => (
                <button
                  key={chip.mood}
                  onClick={() => handleChipClick(chip.mood)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-[10px] font-bold text-slate-300 hover:bg-sky-500/10 hover:border-sky-500/30 hover:text-sky-400 transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/30">
            <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-1.5 focus-within:border-sky-500/50 transition-colors shadow-inner">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder')}
                className="flex-1 bg-transparent py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="h-9 w-9 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white flex items-center justify-center transition-all shadow-lg shadow-sky-500/20 active:scale-95"
              >
                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-600 text-center mt-3 font-medium uppercase tracking-widest">
              {t('chat.version')}
            </p>
          </div>
        </motion.div>,
        document.body,
      )}
    </>
  )
}
