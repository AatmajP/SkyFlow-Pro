/**
 * Notification System
 * 
 * Manages flight notifications including delays, preponements, and gate changes.
 * Uses Zustand for state management.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 'delay' | 'preponement' | 'gate_change' | 'cancellation' | 'boarding' | 'info'

export interface FlightNotification {
    id: string
    type: NotificationType
    flightNumber: string
    airlineCode: string
    title: string
    message: string
    timestamp: string
    read: boolean
    priority: 'high' | 'medium' | 'low'
    actionRequired: boolean
}

interface NotificationStore {
    notifications: FlightNotification[]
    addNotification: (notification: Omit<FlightNotification, 'id' | 'timestamp' | 'read'>) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    deleteNotification: (id: string) => void
    clearAll: () => void
    getUnreadCount: () => number
}

/**
 * Notification store
 */
export const useNotifications = create<NotificationStore>()(
    persist(
        (set, get) => ({
            notifications: [],

            addNotification: (notification) => {
                const newNotification: FlightNotification = {
                    ...notification,
                    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date().toISOString(),
                    read: false,
                }

                set((state) => ({
                    notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
                }))
            },

            markAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, read: true } : n
                    ),
                }))
            },

            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, read: true })),
                }))
            },

            deleteNotification: (id) => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }))
            },

            clearAll: () => {
                set({ notifications: [] })
            },

            getUnreadCount: () => {
                return get().notifications.filter((n) => !n.read).length
            },
        }),
        {
            name: 'skyflow-notifications',
        }
    )
)

/**
 * Helper function to create a delay notification
 */
export function createDelayNotification(
    flightNumber: string,
    airlineCode: string,
    delayMinutes: number,
    isPriority: boolean = false
): Omit<FlightNotification, 'id' | 'timestamp' | 'read'> {
    return {
        type: 'delay',
        flightNumber,
        airlineCode,
        title: `Flight ${flightNumber} Delayed`,
        message: `Your flight has been delayed by ${delayMinutes} minutes. New departure time will be updated shortly.`,
        priority: isPriority ? 'high' : 'medium',
        actionRequired: delayMinutes > 60,
    }
}

/**
 * Helper function to create a preponement notification
 */
export function createPreponementNotification(
    flightNumber: string,
    airlineCode: string,
    advanceMinutes: number,
    isPriority: boolean = false
): Omit<FlightNotification, 'id' | 'timestamp' | 'read'> {
    return {
        type: 'preponement',
        flightNumber,
        airlineCode,
        title: `Flight ${flightNumber} Preponed`,
        message: `Your flight will depart ${advanceMinutes} minutes earlier than scheduled. Please arrive at the gate early.`,
        priority: isPriority ? 'high' : 'high', // Preponement is always high priority
        actionRequired: true,
    }
}

/**
 * Helper function to create a gate change notification
 */
export function createGateChangeNotification(
    flightNumber: string,
    airlineCode: string,
    newGate: string,
    isPriority: boolean = false
): Omit<FlightNotification, 'id' | 'timestamp' | 'read'> {
    return {
        type: 'gate_change',
        flightNumber,
        airlineCode,
        title: `Gate Changed - Flight ${flightNumber}`,
        message: `Your flight's boarding gate has been changed to ${newGate}. Please proceed to the new gate.`,
        priority: isPriority ? 'high' : 'medium',
        actionRequired: true,
    }
}

/**
 * Sync notifications with user bookings
 * Generates realistic updates for user's actual flights
 */
export function syncWithBookings(bookings: any[]) {
    const { addNotification, notifications } = useNotifications.getState()

    // Only generate if we don't have notifications for these flights yet
    bookings.forEach(booking => {
        // Skip cancelled bookings
        if (booking.status === 'cancelled') return

        const flightNumber = booking.flight.segments[0].flightNumber
        const airlineCode = booking.flight.segments[0].marketingCarrierCode
        const exists = notifications.some(n => n.flightNumber === flightNumber)

        if (!exists) {
            // Determine random event based on flight ID hash (deterministic but looks random)
            const hash = flightNumber.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)
            const eventType = hash % 5 // 0: Delay, 1: Gate Change, 2: Preponement, 3: Info, 4: Nothing

            // Patro Airlines specific logic (Better service = more info, less cancellations)
            const isPatro = airlineCode === 'PT'

            if (eventType === 0) {
                // Delay
                addNotification(createDelayNotification(
                    flightNumber,
                    airlineCode,
                    isPatro ? 15 : 45, // Patro has shorter delays
                    isPatro // Patro notifies with priority
                ))
            } else if (eventType === 1) {
                // Gate Change
                const gate = `${String.fromCharCode(65 + (hash % 5))}${10 + (hash % 20)}`
                addNotification(createGateChangeNotification(flightNumber, airlineCode, gate))
            } else if (eventType === 2 && isPatro) {
                // Only Patro does preponements efficiently (demo logic)
                addNotification(createPreponementNotification(flightNumber, airlineCode, 20, true))
            } else if (eventType === 3 || isPatro) {
                // Info / Check-in
                addNotification({
                    type: 'info',
                    flightNumber,
                    airlineCode,
                    title: 'Trip Reminder',
                    message: `Your flight to ${booking.flight.to} is scheduled for tomorrow. Have a safe journey!`,
                    priority: 'low',
                    actionRequired: false
                })
            }
        }
    })
}
