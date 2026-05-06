import type { CabinClass } from './flight'

/** Whether a seat is free or costs extra */
export type SeatPricingType = 'FREE' | 'PAID' | 'PREMIUM'

/** Visual/selection status of a seat in the UI */
export type SeatStatus = 'available' | 'selected' | 'booked' | 'blocked'

/** Position of a seat within the row (for auto-assign priority) */
export type SeatPosition = 'window' | 'middle' | 'aisle'

/** A single seat in the cabin layout */
export interface Seat {
  seatId: string
  row: number
  column: string // A, B, C, D, E, F …
  label: string  // e.g. "1A"
  type: SeatPricingType
  price: number  // 0 for FREE
  isAvailable: boolean
  classType: CabinClass
  position: SeatPosition
  status: SeatStatus
  features?: string[] // e.g. ['extra-legroom', 'exit-row', 'recline']
}

/** Describes the physical layout of one cabin class section */
export interface CabinLayout {
  classType: CabinClass
  label: string
  columns: string[]        // e.g. ['A','B','C','D','E','F']
  aisleAfter: number[]     // indices in `columns` after which an aisle appears
  seatWidth: number        // px – for visual differentiation
  seatGap: number          // px – spacing between seats
  rowGap: number           // px – spacing between rows
  rowStart: number         // first row number in this section
  rowEnd: number           // last row number in this section
  colorAccent: string      // theme colour for the class
}

/** Full seat map data for a flight + cabin class combination */
export interface SeatMapData {
  flightId: string
  cabinClass: CabinClass
  layouts: CabinLayout[]
  seats: Seat[]
  totalSeats: number
  availableSeats: number
}

/** Payload for the auto-assign endpoint */
export interface AutoAssignRequest {
  flightId: string
  cabinClass: CabinClass
  passengerCount?: number
}

/** Response for the auto-assign endpoint */
export interface AutoAssignResponse {
  assignedSeats: Seat[]
  totalExtraPrice: number
}
