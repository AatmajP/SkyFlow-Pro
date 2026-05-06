import type { FlightOption, CabinClass } from '@/types'
import { generateFlightResults, generateRoundTripResults } from './flightGenerator'
import apiClient from '@/services/api/apiClient'

// ... (params and response interfaces)

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
  returnResults?: FlightOption[]
}

// Backend uses "Economy", "Premium Economy", "Business", "First Class"
const cabinToBackendClass: Record<string, string> = {
  economy: 'Economy',
  premium: 'Premium Economy',
  business: 'Business',
  first: 'First Class',
}

export const FlightService = {
  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResponse> {
    const useMock = (import.meta.env.VITE_USE_MOCKS?.toString() ?? 'false') === 'true'

    const fallback = async (): Promise<FlightSearchResponse> => {
      const cabin = params.cabin as CabinClass
      if (params.tripType === 'roundtrip' && params.returnDate) {
        const { outbound, return: returnFlights } = generateRoundTripResults({ ...params, cabin })
        return { results: outbound, returnResults: returnFlights }
      }
      return { results: generateFlightResults({ ...params, cabin }) }
    }

    if (useMock) return fallback()

    try {
      const query = new URLSearchParams({
        from: params.from,
        to: params.to,
        date: params.date,
      })

      const res = await apiClient.get<any[]>('/flights/search', { params: query })

      const mapFlight = (f: any): FlightOption => {
        const cabin = params.cabin as CabinClass
        const backendClass = cabinToBackendClass[params.cabin] || 'Economy'
        const basePrice = (f.classPrices && f.classPrices[backendClass]) || (f.classPrices && f.classPrices['Economy']) || 100;

        return {
          id: String(f.id),
          from: f.origin,
          to: f.destination,
          cabin,
          stops: f.stops,
          totalDurationMinutes: f.durationMinutes,
          segments: [{
            id: `seg-${f.id}`,
            marketingCarrier: f.airlineName,
            marketingCarrierCode: f.airlineCode,
            operatingCarrierCode: f.airlineCode,
            flightNumber: f.flightNumber,
            from: f.origin,
            to: f.destination,
            departureTime: f.departureTime,
            arrivalTime: f.arrivalTime,
            durationMinutes: f.durationMinutes,
            aircraft: 'Boeing 737-800'
          }],
          layovers: [],
          price: {
            currency: 'USD',
            total: basePrice * params.adults,
            baseFare: basePrice * 0.8 * params.adults,
            taxesAndFees: basePrice * 0.1 * params.adults,
            carrierCharges: basePrice * 0.1 * params.adults,
            perPassenger: basePrice,
            breakdown: [
              { label: 'Base Fare', amount: basePrice * 0.8 * params.adults },
              { label: 'Taxes & Fees', amount: basePrice * 0.1 * params.adults },
              { label: 'Carrier Surcharges', amount: basePrice * 0.1 * params.adults }
            ],
            lastUpdated: new Date().toISOString(),
            refundabilityScore: f.isProprietary ? 100 : 70,
            refundableLabel: f.isProprietary ? 'Fully Refundable' : 'Partial Refund',
            carbonEstimateKg: Math.round(f.durationMinutes * 0.8)
          },
          baggagePolicy: f.isProprietary ? '2x 23kg Checked' : '1x 23kg Checked',
          alliance: null,
          fareBrand: 'Standard',
          scarcity: f.availableSeats != null && f.availableSeats < 10 ? `Only ${f.availableSeats} seats left` : undefined
        };
      };

      const results = res.data.map(mapFlight);

      if (params.tripType === 'roundtrip' && params.returnDate) {
        const returnQuery = new URLSearchParams({
          from: params.to,
          to: params.from,
          date: params.returnDate,
        })
        const returnRes = await apiClient.get<any[]>('/flights/search', { params: returnQuery })
        return {
          results,
          returnResults: returnRes.data.map(mapFlight)
        }
      }

      return { results }
    } catch (error) {
      console.error('Flight search API failed, falling back to mock.', error)
      return fallback()
    }
  },
}

