/**
 * User Authentication Store
 * 
 * Manages user authentication state and booking history.
 * Uses Zustand with localStorage persistence.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
    id: string
    email: string
    name: string
    phone?: string
    loyaltyPrograms?: Record<string, string> // airline code -> membership number
}

export interface BookingHistoryItem {
    id: string
    flightNumber: string
    airlineCode: string
    from: string
    to: string
    date: string
    status: 'confirmed' | 'cancelled' | 'completed'
    pnr: string
}

interface AuthStore {
    user: UserProfile | null
    token: string | null
    isAuthenticated: boolean
    bookingHistory: BookingHistoryItem[]
    login: (token: string, user: UserProfile) => void
    logout: () => void
    updateProfile: (updates: Partial<UserProfile>) => void
    addBooking: (booking: BookingHistoryItem) => void
    setBookingHistory: (history: BookingHistoryItem[]) => void
}

/**
 * Authentication store
 */
export const useAuth = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            bookingHistory: [],

            login: (token, user) => {
                set({
                    token,
                    user,
                    isAuthenticated: true,
                })
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    bookingHistory: [],
                })
            },

            updateProfile: (updates) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                }))
            },

            addBooking: (booking) => {
                set((state) => ({
                    bookingHistory: [booking, ...state.bookingHistory],
                }))
            },

            setBookingHistory: (history) => {
                set({ bookingHistory: history })
            }
        }),
        {
            name: 'skyflow-auth',
        }
    )
)

/**
 * Demo function to populate booking history
 */
export function addDemoBookingHistory() {
    const { addBooking } = useAuth.getState()

    const demoBookings: BookingHistoryItem[] = [
        {
            id: 'book-1',
            flightNumber: 'PT 101',
            airlineCode: 'PT',
            from: 'DEL',
            to: 'BOM',
            date: '2026-03-15',
            status: 'confirmed',
            pnr: 'ABC123',
        },
        {
            id: 'book-2',
            flightNumber: '6E 2024',
            airlineCode: '6E',
            from: 'BLR',
            to: 'MAA',
            date: '2026-02-20',
            status: 'completed',
            pnr: 'XYZ789',
        },
    ]

    demoBookings.forEach(addBooking)
}
