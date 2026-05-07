import { X, Settings, Moon, Sun, Globe, DollarSign, Zap, Bell, Check } from 'lucide-react'
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

  useEffect(() => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])

  useEffect(() => localStorage.setItem('currency', currency), [currency])
  useEffect(() => localStorage.setItem('language', language), [language])
  useEffect(() => localStorage.setItem('animations', String(animations)), [animations])
  useEffect(() => localStorage.setItem('notification_pref', String(notifications)), [notifications])

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
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-[70] h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-50">Settings</h2>
                  <p className="text-xs text-slate-400">Personalize your experience</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Appearance */}
              <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Appearance</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                      theme === 'light' ? 'bg-sky-500/10 border-sky-500/50 text-sky-400' : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Sun className="h-6 w-6" />
                    <span className="text-sm font-semibold">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                      theme === 'dark' ? 'bg-sky-500/10 border-sky-500/50 text-sky-400' : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Moon className="h-6 w-6" />
                    <span className="text-sm font-semibold">Dark</span>
                  </button>
                </div>
              </section>

              {/* Preferences */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Regional</h3>
                
                {/* Currency */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    Currency
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {currencies.map(c => (
                      <button
                        key={c.code}
                        onClick={() => setCurrency(c.code)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          currency === c.code ? 'bg-sky-500 text-white border-sky-500' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-sky-400" />
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  >
                    {languages.map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
                  </select>
                </div>
              </section>

              {/* Toggles */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">System</h3>
                
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <Zap className={`h-5 w-5 ${animations ? 'text-amber-400' : 'text-slate-500'}`} />
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Fluid Animations</p>
                      <p className="text-[10px] text-slate-500">Enable smooth UI transitions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAnimations(!animations)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${animations ? 'bg-sky-500' : 'bg-slate-700'}`}
                  >
                    <div className={`h-4 w-4 rounded-full bg-white transition-transform ${animations ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <Bell className={`h-5 w-5 ${notifications ? 'text-sky-400' : 'text-slate-500'}`} />
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Push Notifications</p>
                      <p className="text-[10px] text-slate-500">Get alerts on price drops</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications ? 'bg-sky-500' : 'bg-slate-700'}`}
                  >
                    <div className={`h-4 w-4 rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={onClose}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                Apply Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
