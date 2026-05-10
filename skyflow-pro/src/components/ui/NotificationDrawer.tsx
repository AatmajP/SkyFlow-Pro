import { X, Bell, Check, Trash2, Clock, CheckCircle2, AlertTriangle, Info, Tag, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { MOCK_NOTIFICATIONS } from '../../mocks/mockNotifications'
import type { SkyNotification } from '../../mocks/mockNotifications'

interface NotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<SkyNotification[]>(MOCK_NOTIFICATIONS)
  const [activeTab, setActiveTab] = useState<'all' | 'booking' | 'fare' | 'alerts'>('all')
  const unreadCount = notifications.filter(n => !n.read).length

  // ESC close support
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const getIcon = (type: SkyNotification['type'], category: SkyNotification['category']) => {
    switch (category) {
      case 'fare': return <Tag className="h-5 w-5 text-emerald-400" />
      case 'booking': return <CheckCircle2 className="h-5 w-5 text-sky-400" />
      case 'checkin': return <Info className="h-5 w-5 text-indigo-400" />
      case 'gate': return <MapPin className="h-5 w-5 text-amber-400" />
      default: return <Bell className="h-5 w-5 text-slate-400" />
    }
  }

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true
    if (activeTab === 'booking') return n.category === 'booking' || n.category === 'checkin'
    if (activeTab === 'fare') return n.category === 'fare'
    if (activeTab === 'alerts') return n.category === 'gate' || n.type === 'warning'
    return true
  })

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'booking', label: 'Trips' },
    { id: 'fare', label: 'Price' },
    { id: 'alerts', label: 'Alerts' }
  ]

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
            className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-none">Notifications</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1.5">
                    {unreadCount} {unreadCount === 1 ? 'UNREAD UPDATE' : 'UNREAD UPDATES'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 bg-slate-50/50 dark:bg-slate-900/30">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-sky-500 text-white' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              
              <div className="ml-auto flex items-center gap-3">
                <button
                  className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 uppercase tracking-tight"
                >
                  Mark All
                </button>
                <div className="h-3 w-[1px] bg-slate-200 dark:bg-slate-700" />
                <button
                  onClick={clearAll}
                  className="text-[10px] font-bold text-slate-500 hover:text-red-400 uppercase tracking-tight"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20 min-h-0">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border transition-all duration-300 relative group ${
                      n.read
                        ? 'bg-white/40 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 shadow-md dark:shadow-lg shadow-sky-500/5'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ${
                        n.read ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white shadow-sm'
                      }`}>
                        {getIcon(n.type, n.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className={`text-sm font-bold truncate ${n.read ? 'text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                            {n.title}
                          </h3>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 whitespace-nowrap font-medium">
                            <Clock className="h-3 w-3" />
                            {formatTime(n.timestamp)}
                          </div>
                        </div>
                        <p className={`text-xs leading-relaxed font-medium ${n.read ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                          {n.message}
                        </p>
                      </div>
                    </div>
                    
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-sky-500/10 text-sky-400 rounded-lg"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 opacity-40">
                    <Bell className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                  </div>
                  <h3 className="text-slate-900 dark:text-slate-300 font-bold">Quiet in here...</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 max-w-[200px] mx-auto leading-relaxed font-medium">
                    We'll notify you here for gate updates, check-ins, and price drops.
                  </p>
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="px-6 py-5 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <button
                onClick={onClose}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
              >
                Close Panel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
