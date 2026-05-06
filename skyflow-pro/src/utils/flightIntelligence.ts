import type { FlightOption } from '../types/flight'

export type FlightBadge = 'cheapest' | 'fastest' | 'best-value'

export interface FlightBadgeMap {
  [flightId: string]: FlightBadge[]
}

/**
 * Computes intelligent badges for a list of flights.
 * - Cheapest: flight(s) with the lowest base fare (economy)
 * - Fastest: flight(s) with the shortest total duration
 * - Best Value: ONE flight with the optimal price-to-duration ratio
 *
 * Best Value score = normalized_price * 0.6 + normalized_duration * 0.4
 * Lower score = better value. Only the single best is tagged.
 */
export function computeFlightBadges(flights: FlightOption[]): FlightBadgeMap {
  if (flights.length === 0) return {}

  const badgeMap: FlightBadgeMap = {}

  // Initialize all flights with empty arrays
  flights.forEach((f) => {
    badgeMap[f.id] = []
  })

  // --- Cheapest ---
  const minBaseFare = Math.min(...flights.map((f) => f.price.baseFare))
  flights.forEach((f) => {
    if (f.price.baseFare === minBaseFare) {
      badgeMap[f.id].push('cheapest')
    }
  })

  // --- Fastest ---
  const minDuration = Math.min(...flights.map((f) => f.totalDurationMinutes))
  flights.forEach((f) => {
    if (f.totalDurationMinutes === minDuration) {
      badgeMap[f.id].push('fastest')
    }
  })

  // --- Best Value ---
  // Normalize price and duration to [0, 1] range
  const prices = flights.map((f) => f.price.total)
  const durations = flights.map((f) => f.totalDurationMinutes)
  const maxPrice = Math.max(...prices)
  const minPrice = Math.min(...prices)
  const maxDuration = Math.max(...durations)
  const priceRange = maxPrice - minPrice || 1
  const durationRange = maxDuration - minDuration || 1

  const PRICE_WEIGHT = 0.6
  const DURATION_WEIGHT = 0.4

  let bestValueId = ''
  let bestValueScore = Infinity

  flights.forEach((f) => {
    const normalizedPrice = (f.price.total - minPrice) / priceRange
    const normalizedDuration = (f.totalDurationMinutes - minDuration) / durationRange
    const score = normalizedPrice * PRICE_WEIGHT + normalizedDuration * DURATION_WEIGHT

    if (score < bestValueScore) {
      bestValueScore = score
      bestValueId = f.id
    }
  })

  // Only assign Best Value if it's not already the only cheapest AND fastest
  // to avoid triple-badging one card when another deserves the spotlight
  if (bestValueId) {
    badgeMap[bestValueId].push('best-value')
  }

  return badgeMap
}

/**
 * Returns badge display config for rendering
 */
export function getBadgeConfig(badge: FlightBadge) {
  switch (badge) {
    case 'cheapest':
      return {
        label: 'Cheapest',
        bgClass: 'bg-emerald-500/15 ring-emerald-500/30',
        textClass: 'text-emerald-400',
        dotClass: 'bg-emerald-400',
      }
    case 'fastest':
      return {
        label: 'Fastest',
        bgClass: 'bg-sky-500/15 ring-sky-500/30',
        textClass: 'text-sky-400',
        dotClass: 'bg-sky-400',
      }
    case 'best-value':
      return {
        label: 'Best Value',
        bgClass: 'bg-violet-500/15 ring-violet-500/30',
        textClass: 'text-violet-400',
        dotClass: 'bg-violet-400',
      }
  }
}
