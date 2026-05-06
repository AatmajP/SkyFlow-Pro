/**
 * Pricing Engine
 * 
 * Handles class-based pricing calculations for all cabin classes.
 * This module is completely isolated from UI components and can be
 * easily tested and modified.
 */

import type { CabinClass } from '../types/flight'
import { getAirlineConfig } from './airlines'

/**
 * Base multipliers for each cabin class
 * These are industry-standard multipliers applied to base fare
 */
const CABIN_CLASS_MULTIPLIERS: Record<CabinClass, number> = {
    economy: 1.0,
    premium_economy: 1.8,
    business: 3.5,
    first: 5.5,
}

/**
 * Additional fees per cabin class
 */
const CABIN_CLASS_FEES: Record<CabinClass, { name: string; amount: number }[]> = {
    economy: [
        { name: 'Economy service fee', amount: 15 },
    ],
    premium_economy: [
        { name: 'Premium cabin fee', amount: 35 },
        { name: 'Enhanced amenities', amount: 25 },
    ],
    business: [
        { name: 'Business class service', amount: 75 },
        { name: 'Lounge access', amount: 40 },
    ],
    first: [
        { name: 'First class service', amount: 150 },
        { name: 'Premium lounge access', amount: 80 },
        { name: 'Concierge service', amount: 50 },
    ],
}

/**
 * Perks included in each cabin class
 */
export const CABIN_CLASS_PERKS: Record<CabinClass, string[]> = {
    economy: [
        '1 carry-on bag (7kg)',
        '1 checked bag (15kg)',
        'Standard seat',
    ],
    premium_economy: [
        '1 carry-on bag (10kg)',
        '2 checked bags (23kg each)',
        'Extra legroom seat',
        'Priority boarding',
        'Enhanced meal service',
    ],
    business: [
        '2 carry-on bags (14kg total)',
        '3 checked bags (32kg each)',
        'Lie-flat seat',
        'Priority check-in & boarding',
        'Lounge access',
        'Premium dining',
        'Priority baggage',
    ],
    first: [
        'Unlimited cabin baggage',
        '4 checked bags (32kg each)',
        'Private suite',
        'Dedicated check-in',
        'Premium lounge access',
        'Fine dining menu',
        'Chauffeur service (select cities)',
        'Priority everything',
    ],
}

export interface PricingBreakdown {
    baseFare: number
    cabinMultiplier: number
    cabinFees: { name: string; amount: number }[]
    airlineFees: { name: string; amount: number }[]
    taxes: number
    total: number
}

/**
 * Calculate price for a specific cabin class
 */
export function calculateCabinPrice(
    baseEconomyFare: number,
    cabinClass: CabinClass,
    airlineCode: string,
    distance: number = 1000 // in miles
): PricingBreakdown {
    const multiplier = CABIN_CLASS_MULTIPLIERS[cabinClass]
    const baseFare = Math.round(baseEconomyFare * multiplier)

    // Get cabin-specific fees
    const cabinFees = CABIN_CLASS_FEES[cabinClass]

    // Get airline-specific fees
    const airlineConfig = getAirlineConfig(airlineCode)
    const airlineFees: { name: string; amount: number }[] = []

    if (airlineConfig) {
        // Add seat selection fee if applicable
        const seatFee = airlineConfig.policy.seatSelectionFee[cabinClass]
        if (seatFee > 0) {
            airlineFees.push({ name: 'Seat selection', amount: seatFee })
        }

        // Patro Airlines has NO hidden fees
        if (!airlineConfig.isProprietary) {
            // Other airlines may have additional carrier charges
            const carrierCharge = Math.round(baseFare * 0.05) // 5% carrier charge
            if (carrierCharge > 0) {
                airlineFees.push({ name: 'Carrier surcharge', amount: carrierCharge })
            }
        }
    }

    // Calculate taxes (approximately 15-20% of base fare + fees)
    const subtotal = baseFare +
        cabinFees.reduce((sum, fee) => sum + fee.amount, 0) +
        airlineFees.reduce((sum, fee) => sum + fee.amount, 0)

    const taxRate = 0.18 // 18% tax
    const taxes = Math.round(subtotal * taxRate)

    const total = subtotal + taxes

    return {
        baseFare,
        cabinMultiplier: multiplier,
        cabinFees,
        airlineFees,
        taxes,
        total,
    }
}

/**
 * Get readable label for cabin class
 */
export function getCabinClassLabel(cabinClass: CabinClass): string {
    const labels: Record<CabinClass, string> = {
        economy: 'Economy',
        premium_economy: 'Premium Economy',
        business: 'Business',
        first: 'First Class',
    }
    return labels[cabinClass]
}

/**
 * Get all available cabin classes
 */
export function getAllCabinClasses(): CabinClass[] {
    return ['economy', 'premium_economy', 'business', 'first']
}

/**
 * Compare prices across cabin classes
 */
export function compareCabinPrices(
    baseEconomyFare: number,
    airlineCode: string
): Record<CabinClass, PricingBreakdown> {
    const classes = getAllCabinClasses()
    const comparison: Record<string, PricingBreakdown> = {}

    classes.forEach((cabinClass) => {
        comparison[cabinClass] = calculateCabinPrice(
            baseEconomyFare,
            cabinClass,
            airlineCode
        )
    })

    return comparison as Record<CabinClass, PricingBreakdown>
}
