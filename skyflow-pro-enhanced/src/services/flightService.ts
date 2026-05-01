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
}

export interface FlightSearchResponse {
  results: FlightOption[]
}

const client = createHttpClient()

export const FlightService = {
  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResponse> {
    const useMock =
      (import.meta.env.VITE_USE_MOCKS?.toString() ?? 'true') === 'true'

    const fallback = async () => ({
      results: generateFlights(
        params.from,
        params.to,
        params.date,
        (params.cabin || 'economy') as CabinClass,
      ),
    })

    if (useMock) return fallback()

    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
      date: params.date,
      flex: String(params.flex),
      adults: String(params.adults),
      cabin: params.cabin,
    })

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
