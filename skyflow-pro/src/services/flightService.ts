import type { FlightOption, CabinClass } from '../types/flight'
import { generateFlights } from '../mocks/mockSearchResults'
import { createHttpClient, requestWithResilience } from './httpClient'

export interface FlightSearchParams {
  from: string
  to: string
  date: string
  flex: number
  adults: number
  cabin: string
  tripType?: string
  returnDate?: string
}

export interface FlightSearchResponse {
  results: FlightOption[]
  /** Round-trip only: outbound flights (from → to) */
  outboundFlights?: FlightOption[]
  /** Round-trip only: return flights (to → from) */
  returnFlights?: FlightOption[]
  tripType: 'oneway' | 'roundtrip'
}

const client = createHttpClient()

export const FlightService = {
  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResponse> {
    const useMock =
      (import.meta.env.VITE_USE_MOCKS?.toString() ?? 'true') === 'true'

    const cabin = (params.cabin || 'economy') as CabinClass
    const isRoundTrip = params.tripType === 'roundtrip' && !!params.returnDate

    const fallback = async (): Promise<FlightSearchResponse> => {
      const outbound = generateFlights(params.from, params.to, params.date, cabin)

      if (isRoundTrip && params.returnDate) {
        // Generate DIFFERENT flights for the return leg (to → from)
        const returnFlights = generateFlights(params.to, params.from, params.returnDate, cabin)
        return {
          results: outbound, // backward compat
          outboundFlights: outbound,
          returnFlights,
          tripType: 'roundtrip',
        }
      }

      return {
        results: outbound,
        tripType: 'oneway',
      }
    }

    if (useMock) return fallback()

    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
      date: params.date,
      flex: String(params.flex),
      adults: String(params.adults),
      cabin: params.cabin,
      tripType: params.tripType ?? 'oneway',
    })
    if (params.returnDate) query.set('returnDate', params.returnDate)

    return await requestWithResilience<FlightSearchResponse>(
      client,
      {
        method: 'GET',
        url: `/flights?${query.toString()}`,
      },
      {
        breakerKey: 'FlightService.searchFlights',
        retries: 2,
        fallback,
      },
    )
  },
}
