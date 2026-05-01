import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FlightOption } from '../types/flight'

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

interface BookingStore {
    bookings: Booking[]
    addBooking: (booking: Omit<Booking, 'id' | 'bookingDate' | 'status' | 'pnr'>) => void
    cancelBooking: (id: string) => void
    getBookings: () => Booking[]
    getBookingById: (id: string) => Booking | undefined
}

export const useBookingStore = create<BookingStore>()(
    persist(
        (set, get) => ({
            bookings: [],

            addBooking: (bookingData) => {
                const newBooking: Booking = {
                    ...bookingData,
                    id: `bk-${Date.now()}`,
                    bookingDate: new Date().toISOString(),
                    status: 'confirmed',
                    pnr: Math.random().toString(36).substr(2, 6).toUpperCase()
                }

                set((state) => ({
                    bookings: [newBooking, ...state.bookings]
                }))
            },

            cancelBooking: (id) => {
                set((state) => ({
                    bookings: state.bookings.map(b =>
                        b.id === id ? { ...b, status: 'cancelled' } : b
                    )
                }))
            },

            getBookings: () => get().bookings,

            getBookingById: (id) => get().bookings.find(b => b.id === id)
        }),
        {
            name: 'skyflow-bookings',
        }
    )
)
