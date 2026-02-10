import { Palmtree, Mountain, Landmark, Leaf, Building2, Map, type LucideIcon } from 'lucide-react'

export type TravelInterestType = 'Beach' | 'Mountains' | 'Temples' | 'Nature' | 'City' | 'Adventure'

export interface InterestCategory {
    id: TravelInterestType
    label: string
    icon: LucideIcon
    description: string
}

export interface SuggestedDestination {
    code: string
    city: string
    country: string
    description: string
    priceEstimate?: string // Optional fun detail
    interests: TravelInterestType[]
}

export const INTEREST_CATEGORIES: InterestCategory[] = [
    { id: 'Beach', label: 'Beach', icon: Palmtree, description: 'Sun, sand, and ocean breeze' },
    { id: 'Mountains', label: 'Mountains', icon: Mountain, description: 'Hiking, skiing, and breathtaking views' },
    { id: 'Temples', label: 'Spiritual', icon: Landmark, description: 'Ancient temples and spiritual retreats' },
    { id: 'Nature', label: 'Nature', icon: Leaf, description: 'Forests, wildlife, and natural wonders' },
    { id: 'City', label: 'City Life', icon: Building2, description: 'Shopping, nightlife, and urban culture' },
    { id: 'Adventure', label: 'Adventure', icon: Map, description: 'Thrilling activities and exploration' },
]

// Mapping destinations to our existing airports where possible
export const SUGGESTED_DESTINATIONS: SuggestedDestination[] = [
    // Beach
    { code: 'GOI', city: 'Goa', country: 'India', description: 'Beaches, nightlife, and Portuguese history', interests: ['Beach', 'Nature', 'Adventure'] },
    { code: 'MIA', city: 'Miami', country: 'USA', description: 'South Beach, Art Deco, and vibrant culture', interests: ['Beach', 'City'] },
    { code: 'SYD', city: 'Sydney', country: 'Australia', description: 'Bondi Beach, Opera House, and harbor views', interests: ['Beach', 'City', 'Adventure'] },
    { code: 'HNL', city: 'Honolulu', country: 'USA', description: 'Waikiki Beach and Hawaiian culture', interests: ['Beach', 'Nature', 'Adventure'] }, // Need to ensure code works or added
    { code: 'DXB', city: 'Dubai', country: 'UAE', description: 'Luxury beaches and desert safaris', interests: ['Beach', 'City', 'Adventure'] },

    // Mountains
    { code: 'SXR', city: 'Srinagar', country: 'India', description: 'Himalayan views and Dal Lake', interests: ['Mountains', 'Nature'] }, // Add to airports?
    { code: 'IXB', city: 'Bagdogra', country: 'India', description: 'Gateway to Darjeeling and Sikkim', interests: ['Mountains', 'Nature'] }, // Add
    { code: 'DEN', city: 'Denver', country: 'USA', description: 'Gateway to the Rocky Mountains', interests: ['Mountains', 'Adventure'] }, // Add
    { code: 'ZRH', city: 'Zurich', country: 'Switzerland', description: 'Alps, lakes, and chocolate', interests: ['Mountains', 'City', 'Nature'] }, // Add

    // Temples / Spiritual
    { code: 'VNS', city: 'Varanasi', country: 'India', description: 'Spiritual capital of India on the Ganges', interests: ['Temples'] }, // Add
    { code: 'BKK', city: 'Bangkok', country: 'Thailand', description: 'Grand Palace and Wat Arun', interests: ['Temples', 'City'] },
    { code: 'JAI', city: 'Jaipur', country: 'India', description: 'Pink City, palaces, and forts', interests: ['Temples', 'City'] },
    { code: 'IXM', city: 'Madurai', country: 'India', description: 'Meenakshi Amman Temple', interests: ['Temples'] }, // Add

    // Nature
    { code: 'COK', city: 'Kochi', country: 'India', description: 'Backwaters and green landscapes', interests: ['Nature', 'Beach'] },
    { code: 'SEA', city: 'Seattle', country: 'USA', description: 'Emerald City surrounded by nature', interests: ['Nature', 'City'] },
    { code: 'SIN', city: 'Singapore', country: 'Singapore', description: 'City in a Garden', interests: ['Nature', 'City'] },

    // City
    { code: 'NYC', city: 'New York', country: 'USA', description: 'The city that never sleeps', interests: ['City', 'Adventure'] },
    { code: 'LON', city: 'London', country: 'UK', description: 'History, culture, and iconic landmarks', interests: ['City'] },
    { code: 'BOM', city: 'Mumbai', country: 'India', description: 'Bollywood and bustling city life', interests: ['City'] },
    { code: 'DXB', city: 'Dubai', country: 'UAE', description: 'Futuristic architecture and shopping', interests: ['City', 'Adventure'] },

    // Adventure
    { code: 'LAS', city: 'Las Vegas', country: 'USA', description: 'Entertainment capital of the world', interests: ['Adventure', 'City'] },
    { code: 'SYD', city: 'Sydney', country: 'Australia', description: 'Bridge climb and surfing', interests: ['Adventure', 'Beach'] },
]

export function getDestinationsByInterest(interestId: TravelInterestType): SuggestedDestination[] {
    return SUGGESTED_DESTINATIONS.filter(dest => dest.interests.includes(interestId))
}
