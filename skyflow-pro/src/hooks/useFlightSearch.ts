import { useQuery } from '@tanstack/react-query'
import { FlightService, type FlightSearchParams } from '@/services/flights/flightService'

export function useFlightSearch(params: FlightSearchParams) {
  return useQuery({
    queryKey: ['flights', 'search', params],
    queryFn: () => FlightService.searchFlights(params),
    enabled: Boolean(params.from && params.to && params.date),
  })
}

