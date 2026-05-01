/**
 * Seat Selection Data & Service
 *
 * Provides realistic airline-style seat map generation and selection logic.
 * Seat types: STANDARD (free), PREFERRED (window/aisle paid), PREMIUM (extra legroom).
 */

export type SeatType = 'STANDARD' | 'PREFERRED' | 'PREMIUM'
export type SeatStatus = 'available' | 'booked' | 'selected'

export interface Seat {
    id: string
    seatNumber: string // e.g., '1A'
    row: number
    col: string // A-F
    type: SeatType
    price: number
    status: SeatStatus
    isExit: boolean
    isWindow: boolean
    isAisle: boolean
}

export interface SeatMapConfig {
    rows: number
    columns: string[]  // e.g., ['A', 'B', 'C', 'D', 'E', 'F']
    aisleAfter: string[]  // e.g., ['C'] means aisle between C and D
    exitRows: number[]
    premiumRows: number[]
    unavailablePercentage: number
}

// Standard narrowbody aircraft (A320/737) configuration
const NARROWBODY_CONFIG: SeatMapConfig = {
    rows: 30,
    columns: ['A', 'B', 'C', 'D', 'E', 'F'],
    aisleAfter: ['C'],
    exitRows: [1, 12, 13],
    premiumRows: [1, 2, 3, 12, 13],
    unavailablePercentage: 0.3,
}

// Seat pricing by type (in USD)
const SEAT_PRICES: Record<SeatType, number> = {
    STANDARD: 0,
    PREFERRED: 15,
    PREMIUM: 35,
}

/**
 * Determine seat type based on position
 */
function determineSeatType(
    row: number,
    col: string,
    config: SeatMapConfig
): SeatType {
    // Premium rows (exit rows, first few rows)
    if (config.premiumRows.includes(row)) {
        return 'PREMIUM'
    }

    // Window and aisle seats are PREFERRED (paid)
    const isWindow = col === config.columns[0] || col === config.columns[config.columns.length - 1]
    const isAisle =
        config.aisleAfter.includes(col) ||
        config.aisleAfter.some((a) => {
            const aIdx = config.columns.indexOf(a)
            return config.columns[aIdx + 1] === col
        })

    if (isWindow || isAisle) {
        return 'PREFERRED'
    }

    return 'STANDARD'
}

/**
 * Generate a realistic seat map for a flight
 */
export function generateSeatMap(flightId: string): Seat[] {
    const config = NARROWBODY_CONFIG
    const seats: Seat[] = []

    // Use flightId as seed for consistent randomness per flight
    let seedVal = 0
    for (let i = 0; i < flightId.length; i++) {
        seedVal += flightId.charCodeAt(i)
    }
    const seededRandom = () => {
        seedVal = (seedVal * 9301 + 49297) % 233280
        return seedVal / 233280
    }

    for (let row = 1; row <= config.rows; row++) {
        for (const col of config.columns) {
            const seatNumber = `${row}${col}`
            const seatType = determineSeatType(row, col, config)
            const isWindow = col === config.columns[0] || col === config.columns[config.columns.length - 1]
            const isAisle =
                config.aisleAfter.includes(col) ||
                config.aisleAfter.some((a) => {
                    const aIdx = config.columns.indexOf(a)
                    return config.columns[aIdx + 1] === col
                })

            // Randomly mark some seats as booked (seeded per flight)
            const isBooked = seededRandom() < config.unavailablePercentage

            seats.push({
                id: `${flightId}-${seatNumber}`,
                seatNumber,
                row,
                col,
                type: seatType,
                price: SEAT_PRICES[seatType],
                status: isBooked ? 'booked' : 'available',
                isExit: config.exitRows.includes(row),
                isWindow,
                isAisle,
            })
        }
    }

    return seats
}

/**
 * Auto-assign a free seat (STANDARD type, available)
 */
export function autoAssignSeat(seats: Seat[]): Seat | null {
    const availableStandard = seats.filter(
        (s) => s.type === 'STANDARD' && s.status === 'available'
    )

    if (availableStandard.length === 0) {
        // Fallback to any available seat
        const anyAvailable = seats.find((s) => s.status === 'available')
        return anyAvailable || null
    }

    // Prefer middle rows for auto-assignment (more realistic)
    const midRow = Math.floor(availableStandard.length / 2)
    return availableStandard[midRow] || availableStandard[0]!
}

/**
 * Get seat map statistics
 */
export function getSeatMapStats(seats: Seat[]) {
    const total = seats.length
    const available = seats.filter((s) => s.status === 'available').length
    const booked = seats.filter((s) => s.status === 'booked').length
    const selected = seats.filter((s) => s.status === 'selected').length
    const freeSeats = seats.filter((s) => s.type === 'STANDARD' && s.status === 'available').length
    const paidSeats = seats.filter((s) => s.type === 'PREFERRED' && s.status === 'available').length
    const premiumSeats = seats.filter((s) => s.type === 'PREMIUM' && s.status === 'available').length

    return { total, available, booked, selected, freeSeats, paidSeats, premiumSeats }
}

export const SEAT_TYPE_INFO: Record<SeatType, { label: string; color: string; bgColor: string; description: string }> = {
    STANDARD: {
        label: 'Standard',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500',
        description: 'Free middle seats',
    },
    PREFERRED: {
        label: 'Preferred',
        color: 'text-sky-400',
        bgColor: 'bg-sky-500',
        description: 'Window & aisle seats',
    },
    PREMIUM: {
        label: 'Extra Legroom',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500',
        description: 'Exit rows & front seats',
    },
}
