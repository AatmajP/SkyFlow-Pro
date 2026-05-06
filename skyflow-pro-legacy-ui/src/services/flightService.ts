import type { FlightOption, CabinClass } from '../types/flight'
import { generateFlightResults, generateRoundTripResults } from './flightGenerator'
import { createHttpClient, requestWithResilience } from './httpClient'

export interface FlightSearchParams {
  from: string
  to: string
  date: string
  flex: number
  adults: number
  cabin: string
  tripType?: 'oneway' | 'roundtrip'
  returnDate?: string
}

export interface FlightSearchResponse {
  results: FlightOption[]
  returnResults?: FlightOption[] // For round trips
}

const client = createHttpClient()

export const FlightService = {
  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResponse> {
    const useMock =
      (import.meta.env.VITE_USE_MOCKS?.toString() ?? 'true') === 'true'

    // REAL FUNCTIONALITY: Generate realistic flights
    const fallback = async () => {
      const cabin = params.cabin as CabinClass

      if (params.tripType === 'roundtrip' && params.returnDate) {
        const { outbound, return: returnFlights } = generateRoundTripResults({
          from: params.from,
          to: params.to,
          date: params.date,
          cabin,
          adults: params.adults,
          isRoundTrip: true,
          returnDate: params.returnDate
        })

        return {
          results: outbound,
          returnResults: returnFlights
        }
      }

      // One-way flight
      const results = generateFlightResults({
        from: params.from,
        to: params.to,
        date: params.date,
        cabin,
        adults: params.adults
      })

      return { results }
    }

    if (useMock) return fallback()

    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
      date: params.date,
      flex: String(params.flex),
      adults: String(params.adults),
      cabin: params.cabin,
    })

    if (params.tripType) query.set('tripType', params.tripType)
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

