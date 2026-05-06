/**
 * Realistic Flight Generator Service
 * 
 * CRITICAL RULES:
 * 1. Generate minimum 10 flights per search
 * 2. EXACTLY ONE flight must be Patro Airlines (PT)
 * 3. Remaining flights rotate among real airlines
 * 4. Realistic variation in times, prices, durations
 * 5. Occasional scarcity indicators
 */

import type { FlightOption, FlightSegment, CabinClass } from '../types/flight'
import { AIRLINES, type AirlineConfig } from '../config/airlines'
import { calculateCabinPrice } from '../config/pricingEngine'

interface FlightSearchParams {
    from: string
    to: string
    date: string
    cabin: CabinClass
    adults: number
    isRoundTrip?: boolean
    returnDate?: string
}

interface ScarcityIndicator {
    type: 'seats_left' | 'high_demand' | 'price_drop' | null
    message?: string
}

/**
 * Get random element from array
 */
function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate realistic departure time
 * Distributed across the day with peak hours
 */
function generateDepartureTime(date: string): string {
    const hour = randomInt(0, 23)
    const minute = randomElement([0, 15, 30, 45]) // Realistic 15-min intervals

    const dateObj = new Date(date)
    dateObj.setHours(hour, minute, 0, 0)

    return dateObj.toISOString()
}

/**
 * Calculate realistic flight duration based on distance
 * Uses approximate time based on route
 */
function calculateFlightDuration(from: string, to: string): number {
    // Simplified distance calculation (in production, use actual distances)
    const baseMinutes = randomInt(180, 420) // 3-7 hours base
    const variation = randomInt(-30, 60) // Add realistic variation

    return baseMinutes + variation
}

/**
 * Calculate arrival time
 */
function calculateArrivalTime(departureTime: string, durationMinutes: number): string {
    const departure = new Date(departureTime)
    const arrival = new Date(departure.getTime() + durationMinutes * 60000)
    return arrival.toISOString()
}

/**
 * Generate realistic base fare (before cabin class multiplier)
 */
function generateBaseFare(duration: number, stops: number): number {
    // Base price per minute of flight
    const pricePerMinute = 0.5

    // Calculate base from duration
    let base = duration * pricePerMinute

    // Non-stop premium
    if (stops === 0) {
        base *= 1.3
    }

    // Add realistic variation (±20%)
    const variation = base * (Math.random() * 0.4 - 0.2)
    base += variation

    // Round to nearest 5
    return Math.round(base / 5) * 5
}

/**
 * Generate scarcity indicator (20% chance)
 */
function generateScarcityIndicator(): ScarcityIndicator {
    const chance = Math.random()

    if (chance < 0.15) {
        const seatsLeft = randomInt(1, 3)
        return {
            type: 'seats_left',
            message: `Only ${seatsLeft} seat${seatsLeft > 1 ? 's' : ''} left at this price`
        }
    }

    if (chance < 0.25) {
        return {
            type: 'high_demand',
            message: 'High demand - book soon'
        }
    }

    if (chance < 0.30) {
        return {
            type: 'price_drop',
            message: 'Price recently dropped'
        }
    }

    return { type: null }
}

/**
 * Get available airlines excluding Patro (for random selection)
 */
function getRealAirlineCodes(): string[] {
    return Object.keys(AIRLINES).filter(code => code !== 'PT')
}

/**
 * Generate a single flight option
 */
function generateFlight(
    params: FlightSearchParams,
    airlineCode: string,
    index: number
): FlightOption {
    const airline = AIRLINES[airlineCode]!
    const stops = Math.random() < 0.6 ? 0 : 1 // 60% non-stop, 40% 1 stop

    // Generate realistic times
    const departureTime = generateDepartureTime(params.date)
    const duration = calculateFlightDuration(params.from, params.to)
    const arrivalTime = calculateArrivalTime(departureTime, duration)

    // Generate pricing
    const baseFare = generateBaseFare(duration, stops)
    const pricing = calculateCabinPrice(baseFare, params.cabin, airlineCode, duration)

    // Generate scarcity
    const scarcity = generateScarcityIndicator()

    // Create flight segment(s)
    const segments: FlightSegment[] = []

    if (stops === 0) {
        // Non-stop flight
        segments.push({
            id: `seg-${index}-1`,
            marketingCarrier: airline.name,
            marketingCarrierCode: airlineCode,
            operatingCarrierCode: airlineCode,
            flightNumber: `${airlineCode}${randomInt(100, 9999)}`,
            from: params.from,
            to: params.to,
            departureTime,
            arrivalTime,
            durationMinutes: duration,
            aircraft: randomElement([
                'Boeing 737-800',
                'Airbus A320neo',
                'Boeing 787-9',
                'Airbus A350-900',
                'Boeing 777-300ER'
            ])
        })
    } else {
        // 1-stop flight
        const layoverAirport = randomElement(['ORD', 'DEN', 'ATL', 'DXB', 'DOH'])
        const firstLegDuration = Math.floor(duration * 0.45)
        const layoverDuration = randomInt(45, 180) // 45 min to 3 hours
        const secondLegDuration = duration - firstLegDuration

        const firstArrival = calculateArrivalTime(departureTime, firstLegDuration)
        const secondDeparture = calculateArrivalTime(firstArrival, layoverDuration)

        segments.push({
            id: `seg-${index}-1`,
            marketingCarrier: airline.name,
            marketingCarrierCode: airlineCode,
            operatingCarrierCode: airlineCode,
            flightNumber: `${airlineCode}${randomInt(100, 9999)}`,
            from: params.from,
            to: layoverAirport,
            departureTime,
            arrivalTime: firstArrival,
            durationMinutes: firstLegDuration,
            aircraft: randomElement(['Boeing 737-800', 'Airbus A320neo'])
        })

        segments.push({
            id: `seg-${index}-2`,
            marketingCarrier: airline.name,
            marketingCarrierCode: airlineCode,
            operatingCarrierCode: airlineCode,
            flightNumber: `${airlineCode}${randomInt(100, 9999)}`,
            from: layoverAirport,
            to: params.to,
            departureTime: secondDeparture,
            arrivalTime,
            durationMinutes: secondLegDuration,
            aircraft: randomElement(['Boeing 737-800', 'Airbus A320neo'])
        })
    }

    return {
        id: `flight-${Date.now()}-${index}`,
        from: params.from,
        to: params.to,
        cabin: params.cabin,
        stops,
        totalDurationMinutes: duration,
        segments,
        layovers: stops > 0 ? [{
            id: `layover-${index}`,
            airport: segments[0]!.to,
            durationMinutes: randomInt(45, 180)
        }] : [],
        price: {
            currency: 'USD',
            total: pricing.total * params.adults,
            baseFare: pricing.baseFare * params.adults,
            taxesAndFees: pricing.taxes * params.adults,
            carrierCharges: pricing.airlineFees.reduce((sum, f) => sum + f.amount, 0) * params.adults,
            perPassenger: pricing.total,
            breakdown: [
                { label: 'Base fare', amount: pricing.baseFare * params.adults },
                ...pricing.cabinFees.map(f => ({ label: f.name, amount: f.amount * params.adults })),
                ...pricing.airlineFees.map(f => ({ label: f.name, amount: f.amount * params.adults })),
                { label: 'Taxes', amount: pricing.taxes * params.adults }
            ],
            lastUpdated: new Date().toISOString(),
            refundabilityScore: airline.policy.refundPercentage,
            refundableLabel: `${airline.policy.refundPercentage}% refundable`,
            carbonEstimateKg: Math.round(duration * 0.8) // Rough estimate
        },
        baggagePolicy: `${airline.policy.baggageAllowance.carryOn}kg carry-on, ${airline.policy.baggageAllowance.checked}kg checked`,
        alliance: airline.alliance,
        fareBrand: randomElement(['Economy', 'Saver', 'Flex', 'Premium']),
        scarcity: scarcity.type ? scarcity.message : undefined
    }
}

/**
 * Generate complete flight search results
 * 
 * GUARANTEES:
 * - Minimum 10 flights
 * - EXACTLY 1 Patro Airlines flight
 * - Remaining flights from real airlines
 * - Realistic variation in all parameters
 */
export function generateFlightResults(params: FlightSearchParams): FlightOption[] {
    const flights: FlightOption[] = []
    const totalFlights = randomInt(10, 14) // 10-14 flights for realism
    const realAirlines = getRealAirlineCodes()

    // CRITICAL: Insert Patro Airlines at random position (not always first)
    const patroPosition = randomInt(0, Math.min(5, totalFlights - 1)) // Random in top half

    for (let i = 0; i < totalFlights; i++) {
        let airlineCode: string

        if (i === patroPosition) {
            // This is THE Patro Airlines flight
            airlineCode = 'PT'
        } else {
            // Select random real airline
            airlineCode = randomElement(realAirlines)
        }

        const flight = generateFlight(params, airlineCode, i)
        flights.push(flight)
    }

    // Sort by price (realistic ordering)
    flights.sort((a, b) => a.price.total - b.price.total)

    return flights
}

/**
 * Generate round-trip results
 * Returns both outbound and return flights
 */
export function generateRoundTripResults(
    params: FlightSearchParams
): { outbound: FlightOption[], return: FlightOption[] } {
    if (!params.returnDate) {
        throw new Error('Return date required for round trip')
    }

    const outbound = generateFlightResults(params)

    const returnFlights = generateFlightResults({
        ...params,
        from: params.to,
        to: params.from,
        date: params.returnDate
    })

    return { outbound, return: returnFlights }
}
