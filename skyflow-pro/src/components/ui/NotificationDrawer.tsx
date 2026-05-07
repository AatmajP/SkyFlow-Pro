import { X, Bell, Check, Trash2, Clock, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { MOCK_NOTIFICATIONS } from '../../mocks/mockNotifications'
import type { SkyNotification } from '../../mocks/mockNotifications'

interface NotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<SkyNotification[]>(MOCK_NOTIFICATIONS)
  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const getIcon = (type: SkyNotification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-400" />
      case 'info': return <Info className="h-5 w-5 text-sky-400" />
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-50">Notifications</h2>
                  <p className="text-xs text-slate-400">{unreadCount} unread alerts</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1.5"
                >
                  <Check className="h-3 w-3" />
                  Mark all as read
                </button>
                <button
                  onClick={clearAll}
                  className="text-xs font-semibold text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear all
                </button>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border transition-all duration-300 relative group ${
                      n.read
                        ? 'bg-slate-900/30 border-slate-800/50 opacity-70'
                        : 'bg-slate-800/40 border-slate-700 shadow-lg shadow-sky-500/5'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${
                        n.read ? 'bg-slate-800 text-slate-500' : 'bg-slate-800 text-white'
                      }`}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className={`text-sm font-bold truncate ${n.read ? 'text-slate-400' : 'text-slate-100'}`}>
                            {n.title}
                          </h3>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            {formatTime(n.timestamp)}
                          </div>
                        </div>
                        <p className={`text-xs leading-relaxed ${n.read ? 'text-slate-500' : 'text-slate-400'}`}>
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
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                  <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-slate-600" />
                  </div>
                  <h3 className="text-slate-300 font-semibold">No new notifications</h3>
                  <p className="text-xs text-slate-500 mt-1">We'll alert you when there's an update to your booking or a great deal.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800 text-center">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600">
                End of Notifications
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
