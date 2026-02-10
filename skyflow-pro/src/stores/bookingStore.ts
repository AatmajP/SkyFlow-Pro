import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FlightOption } from '@/types'

export interface PassengerDetails {
    title: string
    firstName: string
    lastName: string
    email: string
    phone: string
}

export interface Booking {
    id: string
    flight: FlightOption
    returnFlight?: FlightOption
    passengers: PassengerDetails[]
    status: 'confirmed' | 'cancelled' | 'trip-completed'
    bookingDate: string
    totalAmount: number
    pnr: string
}

import { bookingService } from '@/services/bookings/bookingService'

/** Used when backend is unavailable — complete booking locally and show confirmation */
export function generateDemoPnr(): string {
    return `DEMO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

interface BookingStore {
    bookings: Booking[]
    isLoading: boolean
    error: string | null
    fetchBookings: () => Promise<void>
    addBooking: (flightId: number, seatNumber: string, cabinClass: string) => Promise<Booking>
    /** Complete booking locally when API is unavailable; returns object with pnr for confirmation page */
    addDemoBooking: (flight: FlightOption, passenger: { firstName: string; lastName: string; email: string }, seatNumber: string) => { pnr: string }
    cancelBooking: (id: string | number) => Promise<void>
    getBookingById: (id: string | number) => Booking | undefined
}

export const useBookingStore = create<BookingStore>()(
    persist(
        (set, get) => ({
            bookings: [],
            isLoading: false,
            error: null,

            fetchBookings: async () => {
                set({ isLoading: true, error: null })
                try {
                    const data = await bookingService.getMyBookings()
                    // Map backend response to frontend Booking interface if necessary
                    // For now, assume they are compatible or handled in components
                    set({ bookings: data as any, isLoading: false })
                } catch (err: any) {
                    set({ error: err.message, isLoading: false })
                }
            },

            addBooking: async (flightId, seatNumber, cabinClass) => {
                set({ isLoading: true, error: null })
                try {
                    const newBooking = await bookingService.createBooking({ flightId, seatNumber, cabinClass })
                    set((state) => ({
                        bookings: [newBooking as any, ...state.bookings],
                        isLoading: false
                    }))
                    return newBooking as any
                } catch (err: any) {
                    set({ error: err.message, isLoading: false })
                    throw err
                }
            },

            addDemoBooking: (flight, passenger, _seatNumber) => {
                const pnr = generateDemoPnr()
                const demo: Booking = {
                    id: pnr,
                    pnr,
                    flight,
                    passengers: [{ title: 'Mr', firstName: passenger.firstName, lastName: passenger.lastName, email: passenger.email, phone: '' }],
                    status: 'confirmed',
                    bookingDate: new Date().toISOString(),
                    totalAmount: flight.price?.total ?? 0,
                }
                set((state) => ({ bookings: [demo, ...state.bookings] }))
                return { pnr }
            },

            cancelBooking: async (id) => {
                set({ isLoading: true, error: null })
                try {
                    await bookingService.cancelBooking(Number(id))
                    set((state) => ({
                        bookings: state.bookings.map(b =>
                            String(b.id) === String(id) ? { ...b, status: 'cancelled' as any } : b
                        ),
                        isLoading: false
                    }))
                } catch (err: any) {
                    set({ error: err.message, isLoading: false })
                    throw err
                }
            },

            getBookingById: (id) => get().bookings.find(b => String(b.id) === String(id))
        }),
        {
            name: 'skyflow-bookings',
        }
    )
)
