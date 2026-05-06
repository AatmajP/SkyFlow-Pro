/**
 * Destination Discovery Data
 *
 * Intent-based destination recommendation system.
 * Cities are tagged with travel interests so users can discover
 * destinations based on what they want to experience.
 */

export type TravelIntent =
  | 'beach'
  | 'mountain'
  | 'temple'
  | 'nightlife'
  | 'adventure'
  | 'heritage'
  | 'romantic'
  | 'wildlife'

export interface Destination {
  city: string
  airportCode: string
  country: string
  tags: TravelIntent[]
  image: string // emoji for quick visual
  description: string
  bestMonths: string
  avgFlightPrice: number // USD base
}

export const DESTINATIONS: Destination[] = [
  // Beach
  {
    city: 'Goa',
    airportCode: 'GOI',
    country: 'India',
    tags: ['beach', 'nightlife', 'adventure'],
    image: '🏖️',
    description: 'Sun-kissed beaches, vibrant nightlife & Portuguese heritage',
    bestMonths: 'Oct – Mar',
    avgFlightPrice: 120,
  },
  {
    city: 'Bali',
    airportCode: 'DPS',
    country: 'Indonesia',
    tags: ['beach', 'temple', 'adventure', 'romantic'],
    image: '🌴',
    description: 'Tropical paradise with ancient temples & rice terraces',
    bestMonths: 'Apr – Oct',
    avgFlightPrice: 350,
  },
  {
    city: 'Phuket',
    airportCode: 'HKT',
    country: 'Thailand',
    tags: ['beach', 'nightlife', 'adventure'],
    image: '🌊',
    description: 'Crystal-clear waters, island hopping & Thai cuisine',
    bestMonths: 'Nov – Apr',
    avgFlightPrice: 280,
  },
  {
    city: 'Miami',
    airportCode: 'MIA',
    country: 'USA',
    tags: ['beach', 'nightlife'],
    image: '🌅',
    description: 'Art deco charm, South Beach & world-class dining',
    bestMonths: 'Dec – May',
    avgFlightPrice: 400,
  },
  {
    city: 'Maldives',
    airportCode: 'MLE',
    country: 'Maldives',
    tags: ['beach', 'romantic', 'adventure'],
    image: '🐚',
    description: 'Overwater villas, turquoise lagoons & marine life',
    bestMonths: 'Nov – Apr',
    avgFlightPrice: 500,
  },

  // Mountain
  {
    city: 'Manali',
    airportCode: 'KUU',
    country: 'India',
    tags: ['mountain', 'adventure', 'romantic'],
    image: '🏔️',
    description: 'Snow-capped peaks, Rohtang Pass & river adventures',
    bestMonths: 'Mar – Jun, Oct – Dec',
    avgFlightPrice: 100,
  },
  {
    city: 'Kathmandu',
    airportCode: 'KTM',
    country: 'Nepal',
    tags: ['mountain', 'temple', 'adventure', 'heritage'],
    image: '⛰️',
    description: 'Gateway to Everest, ancient temples & trekking trails',
    bestMonths: 'Sep – Nov, Mar – May',
    avgFlightPrice: 150,
  },
  {
    city: 'Zurich',
    airportCode: 'ZRH',
    country: 'Switzerland',
    tags: ['mountain', 'romantic', 'adventure'],
    image: '🇨🇭',
    description: 'Swiss Alps, pristine lakes & chocolate paradise',
    bestMonths: 'Jun – Sep, Dec – Mar',
    avgFlightPrice: 600,
  },

  // Temple / Heritage
  {
    city: 'Varanasi',
    airportCode: 'VNS',
    country: 'India',
    tags: ['temple', 'heritage'],
    image: '🕉️',
    description: 'Spiritual capital, Ganga Aarti & ancient ghats',
    bestMonths: 'Oct – Mar',
    avgFlightPrice: 80,
  },
  {
    city: 'Kyoto',
    airportCode: 'KIX',
    country: 'Japan',
    tags: ['temple', 'heritage', 'romantic'],
    image: '⛩️',
    description: 'Zen gardens, geisha culture & bamboo forests',
    bestMonths: 'Mar – May, Oct – Nov',
    avgFlightPrice: 450,
  },
  {
    city: 'Rome',
    airportCode: 'FCO',
    country: 'Italy',
    tags: ['temple', 'heritage', 'romantic', 'nightlife'],
    image: '🏛️',
    description: 'Colosseum, Vatican City & world-famous cuisine',
    bestMonths: 'Apr – Jun, Sep – Oct',
    avgFlightPrice: 500,
  },

  // Nightlife
  {
    city: 'Dubai',
    airportCode: 'DXB',
    country: 'UAE',
    tags: ['nightlife', 'adventure', 'beach'],
    image: '🌃',
    description: 'Luxury shopping, Burj Khalifa & desert safaris',
    bestMonths: 'Nov – Mar',
    avgFlightPrice: 300,
  },
  {
    city: 'Las Vegas',
    airportCode: 'LAS',
    country: 'USA',
    tags: ['nightlife', 'adventure'],
    image: '🎰',
    description: 'Entertainment capital, shows & Grand Canyon trips',
    bestMonths: 'Mar – May, Sep – Nov',
    avgFlightPrice: 380,
  },
  {
    city: 'Bangkok',
    airportCode: 'BKK',
    country: 'Thailand',
    tags: ['nightlife', 'temple', 'beach', 'adventure'],
    image: '🏙️',
    description: 'Street food paradise, ornate temples & floating markets',
    bestMonths: 'Nov – Feb',
    avgFlightPrice: 250,
  },

  // Adventure
  {
    city: 'Queenstown',
    airportCode: 'ZQN',
    country: 'New Zealand',
    tags: ['adventure', 'mountain', 'romantic'],
    image: '🪂',
    description: 'Bungee jumping capital, fjords & Middle-earth landscapes',
    bestMonths: 'Dec – Feb, Jun – Aug',
    avgFlightPrice: 700,
  },
  {
    city: 'Cape Town',
    airportCode: 'CPT',
    country: 'South Africa',
    tags: ['adventure', 'beach', 'wildlife', 'mountain'],
    image: '🦁',
    description: 'Table Mountain, safaris & stunning coastline',
    bestMonths: 'Oct – Mar',
    avgFlightPrice: 550,
  },

  // Wildlife
  {
    city: 'Nairobi',
    airportCode: 'NBO',
    country: 'Kenya',
    tags: ['wildlife', 'adventure'],
    image: '🐘',
    description: 'Safari capital, Great Migration & Masai Mara',
    bestMonths: 'Jun – Oct',
    avgFlightPrice: 480,
  },
]

export const TRAVEL_INTENTS: { id: TravelIntent; label: string; icon: string; gradient: string }[] = [
  { id: 'beach', label: 'Beach & Islands', icon: '🏖️', gradient: 'from-cyan-500 to-blue-500' },
  { id: 'mountain', label: 'Mountains', icon: '🏔️', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'temple', label: 'Temples & Culture', icon: '🕉️', gradient: 'from-amber-500 to-orange-500' },
  { id: 'nightlife', label: 'Nightlife & Party', icon: '🎉', gradient: 'from-purple-500 to-pink-500' },
  { id: 'adventure', label: 'Adventure', icon: '🪂', gradient: 'from-red-500 to-rose-500' },
  { id: 'romantic', label: 'Romantic', icon: '💕', gradient: 'from-pink-500 to-rose-400' },
  { id: 'wildlife', label: 'Wildlife Safari', icon: '🦁', gradient: 'from-yellow-600 to-amber-500' },
  { id: 'heritage', label: 'Heritage', icon: '🏛️', gradient: 'from-stone-500 to-slate-500' },
]

/**
 * Get destinations by travel intent
 */
export function getDestinationsByIntent(intent: TravelIntent): Destination[] {
  return DESTINATIONS.filter((d) => d.tags.includes(intent))
}

/**
 * Get top destinations (for homepage showcase)
 */
export function getTopDestinations(limit: number = 6): Destination[] {
  return DESTINATIONS.slice(0, limit)
}
