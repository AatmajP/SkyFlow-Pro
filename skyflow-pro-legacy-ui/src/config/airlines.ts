/**
 * Airline Configuration
 * 
 * This file contains all airline-specific configurations including:
 * - Real-world airlines (IndiGo, Air India, Vistara, etc.)
 * - Proprietary airline (Patro Airlines)
 * - Business rules and policies for each airline
 * 
 * All airline behavior is configuration-driven to avoid hardcoding
 * conditionals in UI components.
 */

export interface AirlinePolicy {
    seatSelectionFee: {
        economy: number
        premium_economy: number
        business: number
        first: number
    }
    refundPercentage: number // 0-100
    transparentPricing: boolean
    priorityNotifications: boolean
    baggageAllowance: {
        carryOn: number // in kg
        checked: number // in kg
        additionalFee: number // per bag
    }
    changeFee: number
    cancellationDeadlineHours: number
    loyaltyProgram?: string
    perks?: string[]
}

export interface AirlineConfig {
    code: string
    name: string
    country: string
    alliance: string | null
    policy: AirlinePolicy
    isProprietary: boolean
}

/**
 * Default policy template for real airlines
 */
const DEFAULT_AIRLINE_POLICY: AirlinePolicy = {
    seatSelectionFee: {
        economy: 15,
        premium_economy: 10,
        business: 0,
        first: 0,
    },
    refundPercentage: 50,
    transparentPricing: false,
    priorityNotifications: false,
    baggageAllowance: {
        carryOn: 7,
        checked: 15,
        additionalFee: 35,
    },
    changeFee: 75,
    cancellationDeadlineHours: 24,
}

/**
 * Patro Airlines - Our proprietary airline with customer-friendly policies
 */
const PATRO_AIRLINES_POLICY: AirlinePolicy = {
    seatSelectionFee: {
        economy: 0, // FREE seat selection in Economy!
        premium_economy: 0,
        business: 0,
        first: 0,
    },
    refundPercentage: 85, // Higher refund percentage
    transparentPricing: true, // No hidden fees
    priorityNotifications: true, // Priority alerts for delays/changes
    baggageAllowance: {
        carryOn: 10,
        checked: 23,
        additionalFee: 25,
    },
    changeFee: 0, // No change fees!
    cancellationDeadlineHours: 48,
    perks: [
        'Free seat selection in all classes',
        '85% refund on cancellations',
        'No hidden fees - transparent pricing',
        'Priority notifications for flight changes',
        'No change fees',
    ],
}

/**
 * All supported airlines
 */
export const AIRLINES: Record<string, AirlineConfig> = {
    // Proprietary Airline
    PT: {
        code: 'PT',
        name: 'Patro Airlines',
        country: 'India',
        alliance: null,
        policy: PATRO_AIRLINES_POLICY,
        isProprietary: true,
    },

    // Indian Airlines
    '6E': {
        code: '6E',
        name: 'IndiGo',
        country: 'India',
        alliance: null,
        policy: {
            ...DEFAULT_AIRLINE_POLICY,
            refundPercentage: 45,
            baggageAllowance: {
                carryOn: 7,
                checked: 15,
                additionalFee: 30,
            },
        },
        isProprietary: false,
    },

    AI: {
        code: 'AI',
        name: 'Air India',
        country: 'India',
        alliance: 'Star Alliance',
        policy: {
            ...DEFAULT_AIRLINE_POLICY,
            refundPercentage: 60,
            baggageAllowance: {
                carryOn: 8,
                checked: 23,
                additionalFee: 40,
            },
            loyaltyProgram: 'Flying Returns',
        },
        isProprietary: false,
    },

    UK: {
        code: 'UK',
        name: 'Vistara',
        country: 'India',
        alliance: null,
        policy: {
            ...DEFAULT_AIRLINE_POLICY,
            refundPercentage: 65,
            seatSelectionFee: {
                economy: 10,
                premium_economy: 5,
                business: 0,
                first: 0,
            },
            loyaltyProgram: 'Club Vistara',
        },
        isProprietary: false,
    },

    QP: {
        code: 'QP',
        name: 'Akasa Air',
        country: 'India',
        alliance: null,
        policy: {
            ...DEFAULT_AIRLINE_POLICY,
            refundPercentage: 50,
            changeFee: 50,
            baggageAllowance: {
                carryOn: 7,
                checked: 15,
                additionalFee: 28,
            },
        },
        isProprietary: false,
    },

    // International Airlines
    EK: {
        code: 'EK',
        name: 'Emirates',
        country: 'UAE',
        alliance: null,
        policy: {
            ...DEFAULT_AIRLINE_POLICY,
            refundPercentage: 70,
            seatSelectionFee: {
                economy: 20,
                premium_economy: 15,
                business: 0,
                first: 0,
            },
            baggageAllowance: {
                carryOn: 7,
                checked: 30,
                additionalFee: 50,
            },
            loyaltyProgram: 'Emirates Skywards',
        },
        isProprietary: false,
    },

    QR: {
        code: 'QR',
        name: 'Qatar Airways',
        country: 'Qatar',
        alliance: 'oneworld',
        policy: {
            ...DEFAULT_AIRLINE_POLICY,
            refundPercentage: 75,
            seatSelectionFee: {
                economy: 18,
                premium_economy: 12,
                business: 0,
                first: 0,
            },
            baggageAllowance: {
                carryOn: 7,
                checked: 30,
                additionalFee: 55,
            },
            loyaltyProgram: 'Privilege Club',
        },
        isProprietary: false,
    },

    // US Airlines
    DL: {
        code: 'DL',
        name: 'Delta',
        country: 'USA',
        alliance: 'SkyTeam',
        policy: {
            ...DEFAULT_AIRLINE_POLICY,
            refundPercentage: 55,
            baggageAllowance: {
                carryOn: 10,
                checked: 23,
                additionalFee: 35,
            },
            loyaltyProgram: 'SkyMiles',
        },
        isProprietary: false,
    },

    AA: {
        code: 'AA',
        name: 'American Airlines',
        country: 'USA',
        alliance: 'oneworld',
        policy: {
            ...DEFAULT_AIRLINE_POLICY,
            refundPercentage: 50,
            loyaltyProgram: 'AAdvantage',
        },
        isProprietary: false,
    },

    UA: {
        code: 'UA',
        name: 'United Airlines',
        country: 'USA',
        alliance: 'Star Alliance',
        policy: {
            ...DEFAULT_AIRLINE_POLICY,
            refundPercentage: 52,
            loyaltyProgram: 'MileagePlus',
        },
        isProprietary: false,
    },
}

/**
 * Helper function to get airline configuration
 */
export function getAirlineConfig(code: string): AirlineConfig | null {
    return AIRLINES[code] || null
}

/**
 * Helper function to check if an airline is Patro Airlines
 */
export function isPatroAirlines(code: string): boolean {
    return code === 'PT'
}

/**
 * Get all airline codes
 */
export function getAllAirlineCodes(): string[] {
    return Object.keys(AIRLINES)
}

/**
 * Get all airline names
 */
export function getAllAirlineNames(): string[] {
    return Object.values(AIRLINES).map((a) => a.name)
}
