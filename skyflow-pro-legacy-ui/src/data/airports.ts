/**
 * Airport and City Database
 * 
 * Contains realistic airport and city data for autocomplete functionality.
 * This data is used to provide intelligent search suggestions.
 */

export interface Airport {
    code: string // IATA code
    name: string
    city: string
    country: string
    searchTerms: string[] // For fuzzy matching
}

/**
 * Major airports database
 * In a real application, this would come from an API
 */
export const AIRPORTS: Airport[] = [
    // India
    { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', country: 'India', searchTerms: ['delhi', 'new delhi', 'del', 'igdel'] },
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India', searchTerms: ['mumbai', 'bombay', 'bom'] },
    { code: 'BLR', name: 'Kempegowda International', city: 'Bangalore', country: 'India', searchTerms: ['bangalore', 'bengaluru', 'blr'] },
    { code: 'MAA', name: 'Chennai International', city: 'Chennai', country: 'India', searchTerms: ['chennai', 'madras', 'maa'] },
    { code: 'HYD', name: 'Rajiv Gandhi International', city: 'Hyderabad', country: 'India', searchTerms: ['hyderabad', 'hyd'] },
    { code: 'CCU', name: 'Netaji Subhas Chandra Bose International', city: 'Kolkata', country: 'India', searchTerms: ['kolkata', 'calcutta', 'ccu'] },
    { code: 'PNQ', name: 'Pune Airport', city: 'Pune', country: 'India', searchTerms: ['pune', 'pnq'] },
    { code: 'AMD', name: 'Sardar Vallabhbhai Patel International', city: 'Ahmedabad', country: 'India', searchTerms: ['ahmedabad', 'amd'] },
    { code: 'GOI', name: 'Goa International', city: 'Goa', country: 'India', searchTerms: ['goa', 'dabolim', 'goi'] },
    { code: 'COK', name: 'Cochin International', city: 'Kochi', country: 'India', searchTerms: ['kochi', 'cochin', 'cok'] },
    { code: 'JAI', name: 'Jaipur International', city: 'Jaipur', country: 'India', searchTerms: ['jaipur', 'jai'] },

    // USA
    { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', searchTerms: ['new york', 'nyc', 'jfk', 'kennedy'] },
    { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', searchTerms: ['los angeles', 'la', 'lax'] },
    { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA', searchTerms: ['chicago', 'ord', 'ohare'] },
    { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA', searchTerms: ['san francisco', 'sf', 'sfo'] },
    { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA', searchTerms: ['miami', 'mia'] },
    { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA', searchTerms: ['dallas', 'fort worth', 'dfw'] },
    { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA', searchTerms: ['seattle', 'sea', 'tacoma'] },
    { code: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', country: 'USA', searchTerms: ['las vegas', 'vegas', 'las'] },
    { code: 'BOS', name: 'Logan International', city: 'Boston', country: 'USA', searchTerms: ['boston', 'bos', 'logan'] },
    { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'USA', searchTerms: ['atlanta', 'atl'] },

    // Europe
    { code: 'LHR', name: 'Heathrow', city: 'London', country: 'UK', searchTerms: ['london', 'heathrow', 'lhr'] },
    { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', searchTerms: ['paris', 'cdg', 'charles de gaulle'] },
    { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', searchTerms: ['frankfurt', 'fra'] },
    { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', searchTerms: ['amsterdam', 'ams', 'schiphol'] },
    { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain', searchTerms: ['madrid', 'mad'] },
    { code: 'FCO', name: 'Leonardo da Vinci-Fiumicino', city: 'Rome', country: 'Italy', searchTerms: ['rome', 'fco', 'fiumicino'] },

    // Middle East
    { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', searchTerms: ['dubai', 'dxb'] },
    { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', searchTerms: ['doha', 'doh', 'qatar'] },
    { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE', searchTerms: ['abu dhabi', 'auh'] },

    // Asia-Pacific
    { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', searchTerms: ['singapore', 'sin', 'changi'] },
    { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', searchTerms: ['hong kong', 'hkg'] },
    { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', searchTerms: ['tokyo', 'narita', 'nrt'] },
    { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', searchTerms: ['seoul', 'incheon', 'icn'] },
    { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand', searchTerms: ['bangkok', 'bkk', 'suvarnabhumi'] },
    { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', searchTerms: ['sydney', 'syd'] },
]

/**
 * Search airports by query string
 * Supports searching by city name, airport name, or airport code
 */
export function searchAirports(query: string, limit: number = 10): Airport[] {
    if (!query || query.length < 1) {
        return []
    }

    const normalizedQuery = query.toLowerCase().trim()

    // First, check for exact matches on airport code
    const exactMatch = AIRPORTS.filter(
        (airport) => airport.code.toLowerCase() === normalizedQuery
    )

    if (exactMatch.length > 0) {
        return exactMatch.slice(0, limit)
    }

    // Then search through all fields
    const matches = AIRPORTS.filter((airport) => {
        // Check code
        if (airport.code.toLowerCase().includes(normalizedQuery)) {
            return true
        }

        // Check city
        if (airport.city.toLowerCase().includes(normalizedQuery)) {
            return true
        }

        // Check airport name
        if (airport.name.toLowerCase().includes(normalizedQuery)) {
            return true
        }

        // Check search terms
        return airport.searchTerms.some((term) =>
            term.includes(normalizedQuery)
        )
    })

    // Sort by relevance (code matches first, then city, then name)
    matches.sort((a, b) => {
        const aCodeMatch = a.code.toLowerCase().startsWith(normalizedQuery)
        const bCodeMatch = b.code.toLowerCase().startsWith(normalizedQuery)

        if (aCodeMatch && !bCodeMatch) return -1
        if (!aCodeMatch && bCodeMatch) return 1

        const aCityMatch = a.city.toLowerCase().startsWith(normalizedQuery)
        const bCityMatch = b.city.toLowerCase().startsWith(normalizedQuery)

        if (aCityMatch && !bCityMatch) return -1
        if (!aCityMatch && bCityMatch) return 1

        return 0
    })

    return matches.slice(0, limit)
}

/**
 * Get airport by code
 */
export function getAirportByCode(code: string): Airport | null {
    return AIRPORTS.find((a) => a.code === code) || null
}

/**
 * Format airport for display
 */
export function formatAirportDisplay(airport: Airport): string {
    return `${airport.city} (${airport.code}) - ${airport.name}`
}

/**
 * Format airport for compact display
 */
export function formatAirportCompact(airport: Airport): string {
    return `${airport.city} (${airport.code})`
}
