import { X, Settings, Moon, Sun, Globe, DollarSign, Zap, Bell, Check, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface SettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'INR')
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'English')
  const [animations, setAnimations] = useState(localStorage.getItem('animations') !== 'false')
  const [notifications, setNotifications] = useState(localStorage.getItem('notification_pref') !== 'false')
  const [accessibility, setAccessibility] = useState(localStorage.getItem('accessibility_mode') === 'true')

  useEffect(() => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])

  useEffect(() => localStorage.setItem('currency', currency), [currency])
  useEffect(() => localStorage.setItem('language', language), [language])
  useEffect(() => localStorage.setItem('animations', String(animations)), [animations])
  useEffect(() => localStorage.setItem('notification_pref', String(notifications)), [notifications])
  useEffect(() => localStorage.setItem('accessibility_mode', String(accessibility)), [accessibility])

  // ESC close support
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const currencies = [
    { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
  ]

  const languages = ['English', 'Hindi', 'Spanish', 'French', 'German']

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl flex flex-col overflow-hidden"
          >
            {/* Fixed Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-50 leading-none">Settings</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1.5">Configuration Panel</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Internal Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar min-h-0">
              {/* Appearance */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sun className="h-4 w-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Appearance</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                      theme === 'light' ? 'bg-sky-500/10 border-sky-500/50 text-sky-400' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Sun className="h-6 w-6" />
                    <span className="text-sm font-semibold">Light Mode</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                      theme === 'dark' ? 'bg-sky-500/10 border-sky-500/50 text-sky-400' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Moon className="h-6 w-6" />
                    <span className="text-sm font-semibold">Dark Mode</span>
                  </button>
                </div>
              </section>

              {/* Preferences */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-sky-400" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Regional & Currency</h3>
                </div>
                
                {/* Currency */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">Default Currency</label>
                  <div className="grid grid-cols-4 gap-2">
                    {currencies.map(c => (
                      <button
                        key={c.code}
                        onClick={() => setCurrency(c.code)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          currency === c.code ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/20' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">Preferred Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                  >
                    {languages.map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
                  </select>
                </div>
              </section>

              {/* Accessibility & Notifications */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">System & Alerts</h3>
                </div>
                
                {/* Accessibility Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Accessibility Mode</p>
                      <p className="text-[10px] text-slate-500 font-medium">Enhanced contrast & larger targets</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAccessibility(!accessibility)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${accessibility ? 'bg-sky-500' : 'bg-slate-700'}`}
                  >
                    <motion.div 
                      animate={{ x: accessibility ? 20 : 0 }}
                      className="h-4 w-4 rounded-full bg-white shadow-sm" 
                    />
                  </button>
                </div>

                {/* Notifications Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Smart Notifications</p>
                      <p className="text-[10px] text-slate-500 font-medium">Price drops & booking updates</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${notifications ? 'bg-sky-500' : 'bg-slate-700'}`}
                  >
                    <motion.div 
                      animate={{ x: notifications ? 20 : 0 }}
                      className="h-4 w-4 rounded-full bg-white shadow-sm" 
                    />
                  </button>
                </div>
              </section>
            </div>

            {/* Sticky Footer */}
            <div className="px-6 py-5 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-all border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-sky-500/20 transition-all"
              >
                Apply Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
