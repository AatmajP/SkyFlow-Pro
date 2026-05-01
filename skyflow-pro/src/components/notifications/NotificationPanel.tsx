/**
 * Notification Panel Component
 * 
 * Displays flight notifications in a sliding panel with filtering and actions.
 */

import { Bell, X, Check, Trash2, AlertCircle, Clock, Info, Plane } from 'lucide-react'
import { useNotifications, type FlightNotification, syncWithBookings } from '../../stores/notificationStore' // Import syncWithBookings
import { useBookingStore } from '../../stores/bookingStore' // Import useBookingStore
import { getAirlineConfig } from '../../config/airlines'
import { useEffect } from 'react'

interface NotificationPanelProps {
    isOpen: boolean
    onClose: () => void
}

const ICON_MAP = {
    delay: Clock,
    preponement: AlertCircle,
    gate_change: Plane,
    cancellation: X,
    boarding: Plane,
    info: Info,
}

const PRIORITY_COLORS = {
    high: 'border-red-500/50 bg-red-500/5',
    medium: 'border-amber-500/50 bg-amber-500/5',
    low: 'border-slate-700',
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
    const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications()
    const { bookings } = useBookingStore() // Get bookings

    // Sync with bookings when panel opens
    useEffect(() => {
        if (isOpen && bookings.length > 0) {
            syncWithBookings(bookings)
        }
    }, [isOpen, bookings])

    const unreadCount = notifications.filter((n) => !n.read).length

    const handleMarkAsRead = (id: string) => {
        markAsRead(id)
    }

    const handleDelete = (id: string) => {
        deleteNotification(id)
    }

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

        if (diffMinutes < 1) return 'Just now'
        if (diffMinutes < 60) return `${diffMinutes}m ago`
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
        return `${Math.floor(diffMinutes / 1440)}d ago`
    }

    if (!isOpen) return null

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 animate-slide-in-right flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-sky-400" />
                        <h2 className="text-lg font-semibold text-slate-50">Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-sky-500 text-white rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800 transition-colors"
                        aria-label="Close notifications"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Actions */}
                {notifications.length > 0 && (
                    <div className="flex items-center gap-2 p-3 border-b border-slate-800">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                        <button
                            onClick={clearAll}
                            className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <Bell className="h-16 w-16 text-slate-700 mb-4" />
                            <p className="text-slate-400 font-medium">No notifications</p>
                            <p className="text-sm text-slate-500 mt-1">
                                You'll see flight updates and alerts here
                            </p>
                        </div>
                    ) : (
                        <div className="p-3 space-y-2">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={handleMarkAsRead}
                                    onDelete={handleDelete}
                                    formatTime={formatTime}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
    formatTime,
}: {
    notification: FlightNotification
    onMarkAsRead: (id: string) => void
    onDelete: (id: string) => void
    formatTime: (timestamp: string) => string
}) {
    const Icon = ICON_MAP[notification.type]
    const airline = getAirlineConfig(notification.airlineCode)

    return (
        <div
            className={`relative rounded-xl border p-4 transition-all ${PRIORITY_COLORS[notification.priority]
                } ${!notification.read ? 'ring-2 ring-sky-500/20' : ''}`}
        >
            {/* Unread indicator */}
            {!notification.read && (
                <div className="absolute top-2 right-2">
                    <span className="flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
                    </span>
                </div>
            )}

            <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${notification.priority === 'high' ? 'bg-red-500/10' : 'bg-slate-800/50'
                    }`}>
                    <Icon className={`h-4 w-4 ${notification.priority === 'high' ? 'text-red-400' : 'text-sky-400'
                        }`} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-slate-50">
                            {notification.title}
                        </h3>
                    </div>

                    <p className="text-xs text-slate-400 mb-2">{notification.message}</p>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{airline?.name || notification.airlineCode}</span>
                        <span>•</span>
                        <span>{formatTime(notification.timestamp)}</span>
                        {notification.actionRequired && (
                            <>
                                <span>•</span>
                                <span className="text-amber-400 font-medium">Action required</span>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                        {!notification.read && (
                            <button
                                onClick={() => onMarkAsRead(notification.id)}
                                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                            >
                                <Check className="h-3 w-3" />
                                Mark as read
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(notification.id)}
                            className="ml-auto text-xs text-slate-500 hover:text-red-400 flex items-center gap-1"
                        >
                            <Trash2 className="h-3 w-3" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
