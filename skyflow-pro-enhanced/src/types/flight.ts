export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first'

export interface PriceBreakdownItem {
  label: string
  amount: number
}

export interface PriceTransparency {
  currency: string
  total: number
  baseFare: number
  taxesAndFees: number
  carrierCharges: number
  perPassenger: number
  breakdown: PriceBreakdownItem[]
  lastUpdated: string
  refundabilityScore: number // 0 - 100
  refundableLabel: string
  carbonEstimateKg: number
}

export interface FlightSegment {
  id: string
  marketingCarrier: string
  marketingCarrierCode: string
  operatingCarrierCode: string
  flightNumber: string
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  durationMinutes: number
  aircraft: string
}

export interface Layover {
  id: string
  airport: string
  durationMinutes: number
}

export interface FlightOption {
  id: string
  from: string
  to: string
  cabin: CabinClass
  stops: number
  totalDurationMinutes: number
  segments: FlightSegment[]
  layovers: Layover[]
  price: PriceTransparency
  baggagePolicy: string
  alliance: string | null
  fareBrand: string
}

