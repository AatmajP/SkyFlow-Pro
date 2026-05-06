/**
 * Seat Service — generates deterministic, class-aware seat maps
 * and provides auto-assign logic.
 *
 * Works entirely client-side (mock mode) but mirrors the API contract
 * so switching to a real backend is a one-line change.
 */
import type { CabinClass } from '../types/flight'
import type {
  Seat,
  SeatPricingType,
  SeatPosition,
  SeatMapData,
  CabinLayout,
  AutoAssignRequest,
  AutoAssignResponse,
} from '../types/seat'

// ─── Seeded RNG (same as mockSearchResults) ─────────────────────────
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ─── Layout definitions per class ───────────────────────────────────

const ECONOMY_LAYOUT: Omit<CabinLayout, 'rowStart' | 'rowEnd'> = {
  classType: 'economy',
  label: 'Economy',
  columns: ['A', 'B', 'C', 'D', 'E', 'F'],
  aisleAfter: [2],           // aisle between C and D → 3-3
  seatWidth: 36,
  seatGap: 2,
  rowGap: 4,
  colorAccent: '#38bdf8',    // sky-400
}

const PREMIUM_ECONOMY_LAYOUT: Omit<CabinLayout, 'rowStart' | 'rowEnd'> = {
  classType: 'premium_economy',
  label: 'Premium Economy',
  columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  aisleAfter: [1, 4],       // aisle after B and E → 2-3-2
  seatWidth: 42,
  seatGap: 4,
  rowGap: 8,
  colorAccent: '#a855f7',    // purple-500
}

const BUSINESS_LAYOUT: Omit<CabinLayout, 'rowStart' | 'rowEnd'> = {
  classType: 'business',
  label: 'Business',
  columns: ['A', 'B', 'C', 'D'],
  aisleAfter: [0, 2],       // aisle after A and C → 1-2-1
  seatWidth: 52,
  seatGap: 8,
  rowGap: 14,
  colorAccent: '#f59e0b',    // amber-500
}

const FIRST_LAYOUT: Omit<CabinLayout, 'rowStart' | 'rowEnd'> = {
  classType: 'first',
  label: 'First Class',
  columns: ['A', 'B', 'C', 'D'],
  aisleAfter: [0, 2],
  seatWidth: 60,
  seatGap: 12,
  rowGap: 18,
  colorAccent: '#ec4899',    // pink-500
}

function getLayoutTemplate(cabin: CabinClass) {
  switch (cabin) {
    case 'business': return BUSINESS_LAYOUT
    case 'premium_economy': return PREMIUM_ECONOMY_LAYOUT
    case 'first': return FIRST_LAYOUT
    default: return ECONOMY_LAYOUT
  }
}

// ─── Pricing rules ──────────────────────────────────────────────────

interface PricingRule {
  pricingType: SeatPricingType
  price: number
}

function getSeatPricing(
  row: number,
  position: SeatPosition,
  cabin: CabinClass,
  totalRows: number,
): PricingRule {
  // Business & First: all premium-priced
  if (cabin === 'business') {
    if (row <= 2) return { pricingType: 'PREMIUM', price: 1500 }
    return { pricingType: 'PAID', price: 800 }
  }
  if (cabin === 'first') {
    return { pricingType: 'PREMIUM', price: 2500 }
  }
  // Premium Economy
  if (cabin === 'premium_economy') {
    if (row <= 2) return { pricingType: 'PREMIUM', price: 1200 }
    if (position === 'window') return { pricingType: 'PAID', price: 600 }
    if (position === 'aisle') return { pricingType: 'PAID', price: 400 }
    return { pricingType: 'FREE', price: 0 }
  }
  // Economy
  const frontRows = Math.ceil(totalRows * 0.15)
  const exitRow = Math.ceil(totalRows * 0.45)
  if (row <= frontRows) {
    return { pricingType: 'PAID', price: position === 'window' ? 500 : position === 'aisle' ? 400 : 200 }
  }
  if (row === exitRow || row === exitRow + 1) {
    return { pricingType: 'PAID', price: 700 } // extra legroom
  }
  if (position === 'window') return { pricingType: 'PAID', price: 200 }
  return { pricingType: 'FREE', price: 0 }
}

function getPosition(colIdx: number, totalCols: number, aisleAfter: number[]): SeatPosition {
  if (colIdx === 0 || colIdx === totalCols - 1) return 'window'
  if (aisleAfter.includes(colIdx) || aisleAfter.includes(colIdx - 1)) return 'aisle'
  return 'middle'
}

// ─── Seat Map Generator ─────────────────────────────────────────────

function getRowCounts(cabin: CabinClass): { rows: number } {
  switch (cabin) {
    case 'first': return { rows: 4 }
    case 'business': return { rows: 6 }
    case 'premium_economy': return { rows: 8 }
    default: return { rows: 25 }
  }
}

export function generateSeatMap(flightId: string, cabin: CabinClass): SeatMapData {
  // Deterministic seed from flightId + class
  let seed = 0
  const seedStr = `${flightId}-${cabin}-seats`
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0
  }
  const rand = seededRandom(seed)

  const template = getLayoutTemplate(cabin)
  const { rows } = getRowCounts(cabin)
  const rowStart = 1
  const rowEnd = rows

  const layout: CabinLayout = { ...template, rowStart, rowEnd }
  const seats: Seat[] = []

  for (let r = rowStart; r <= rowEnd; r++) {
    for (let ci = 0; ci < template.columns.length; ci++) {
      const col = template.columns[ci]
      const position = getPosition(ci, template.columns.length, template.aisleAfter)
      const { pricingType, price } = getSeatPricing(r, position, cabin, rows)

      // ~30% booked for economy, ~25% for premium, ~20% for business/first
      const bookRate = cabin === 'economy' ? 0.30 : cabin === 'premium_economy' ? 0.25 : 0.20
      const isBooked = rand() < bookRate

      const features: string[] = []
      const exitRow = Math.ceil(rows * 0.45)
      if (r === exitRow || r === exitRow + 1) features.push('extra-legroom', 'exit-row')
      if (r <= 2) features.push('front-row')
      if (position === 'window') features.push('window-view')

      const seat: Seat = {
        seatId: `${flightId}-${cabin}-${r}${col}`,
        row: r,
        column: col,
        label: `${r}${col}`,
        type: pricingType,
        price,
        isAvailable: !isBooked,
        classType: cabin,
        position,
        status: isBooked ? 'booked' : 'available',
        features,
      }
      seats.push(seat)
    }
  }

  const totalSeats = seats.length
  const availableSeats = seats.filter((s) => s.isAvailable).length

  return {
    flightId,
    cabinClass: cabin,
    layouts: [layout],
    seats,
    totalSeats,
    availableSeats,
  }
}

// ─── Auto-Assign Logic ──────────────────────────────────────────────

/**
 * Auto-assigns the best available FREE seat(s).
 *
 * Priority: window > aisle > middle, closer rows preferred.
 * Only assigns FREE seats so the user never pays extra involuntarily.
 */
export function autoAssignSeats(request: AutoAssignRequest): AutoAssignResponse {
  const map = generateSeatMap(request.flightId, request.cabinClass)
  const count = request.passengerCount ?? 1

  // Filter to available + FREE seats
  const freeSeats = map.seats.filter((s) => s.isAvailable && s.type === 'FREE')

  // Priority score (lower is better)
  const scored = freeSeats.map((s) => {
    let score = s.row * 10 // prefer front
    if (s.position === 'window') score -= 5
    else if (s.position === 'aisle') score -= 3
    else score += 2 // penalty for middle
    return { seat: s, score }
  })

  scored.sort((a, b) => a.score - b.score)

  // If no free seats exist, fall back to cheapest available paid seats
  if (scored.length < count) {
    const paidSeats = map.seats
      .filter((s) => s.isAvailable && s.type !== 'FREE')
      .sort((a, b) => a.price - b.price || a.row - b.row)
    for (const ps of paidSeats) {
      if (scored.length >= count) break
      scored.push({ seat: ps, score: 999 })
    }
  }

  const assigned = scored.slice(0, count).map((s) => ({
    ...s.seat,
    status: 'selected' as const,
  }))

  return {
    assignedSeats: assigned,
    totalExtraPrice: assigned.reduce((sum, s) => sum + s.price, 0),
  }
}

// ─── Service API (mirrors REST contract) ─────────────────────────────

export const SeatService = {
  /** GET /api/seats?flightId=&class= */
  async getSeatMap(flightId: string, cabinClass: CabinClass): Promise<SeatMapData> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 200))
    return generateSeatMap(flightId, cabinClass)
  },

  /** POST /api/seats/assign */
  async assignSeat(request: AutoAssignRequest): Promise<AutoAssignResponse> {
    await new Promise((r) => setTimeout(r, 200))
    return autoAssignSeats(request)
  },
}
