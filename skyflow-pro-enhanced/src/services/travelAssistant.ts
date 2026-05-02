/**
 * travelAssistant.ts — Mood-based destination suggestion engine.
 *
 * Architecture:
 *   mood keywords → category mapping → destination lookup → ranked suggestions
 *
 * NOT hardcoded random replies — uses structured NLP-lite keyword extraction
 * and a curated global destination database with reasons.
 */

// ── Destination database ────────────────────────────────────────────
export interface Destination {
  city: string
  country: string
  airportCode: string
  category: DestinationCategory
  reason: string
}

export type DestinationCategory = 'beach' | 'adventure' | 'romantic' | 'spiritual' | 'city' | 'wellness'

const DESTINATIONS: Destination[] = [
  // Beach / Relaxation
  { city: 'Male', country: 'Maldives', airportCode: 'MLE', category: 'beach', reason: 'Crystal-clear waters and overwater villas for ultimate relaxation' },
  { city: 'Bali', country: 'Indonesia', airportCode: 'DPS', category: 'beach', reason: 'Tropical paradise with serene rice terraces and spa retreats' },
  { city: 'Miami', country: 'USA', airportCode: 'MIA', category: 'beach', reason: 'Vibrant beach life with Art Deco charm and warm waters' },
  { city: 'Phuket', country: 'Thailand', airportCode: 'HKT', category: 'beach', reason: 'Stunning beaches, clear seas, and world-class Thai hospitality' },
  { city: 'Honolulu', country: 'USA', airportCode: 'HNL', category: 'beach', reason: 'Hawaiian paradise with volcanic landscapes and aloha spirit' },
  { city: 'Goa', country: 'India', airportCode: 'GOI', category: 'beach', reason: 'Golden beaches, vibrant nightlife, and Portuguese heritage' },
  { city: 'Sydney', country: 'Australia', airportCode: 'SYD', category: 'beach', reason: 'Iconic harbour, Bondi Beach, and year-round sunshine' },
  { city: 'Barcelona', country: 'Spain', airportCode: 'BCN', category: 'beach', reason: 'Mediterranean coast meets Gaudí architecture' },

  // Adventure
  { city: 'Zurich', country: 'Switzerland', airportCode: 'ZRH', category: 'adventure', reason: 'Gateway to the Alps — skiing, hiking, and paragliding' },
  { city: 'Kathmandu', country: 'Nepal', airportCode: 'KTM', category: 'adventure', reason: 'Base camp for Everest treks and Himalayan adventures' },
  { city: 'Queenstown', country: 'New Zealand', airportCode: 'ZQN', category: 'adventure', reason: 'Bungee jumping capital with stunning fjord landscapes' },
  { city: 'Srinagar', country: 'India', airportCode: 'SXR', category: 'adventure', reason: 'Kashmir valley houseboats and mountain trekking' },
  { city: 'Dehradun', country: 'India', airportCode: 'DED', category: 'adventure', reason: 'Gateway to Rishikesh rafting and Mussoorie trails' },
  { city: 'Nairobi', country: 'Kenya', airportCode: 'NBO', category: 'adventure', reason: 'Safari adventures in Masai Mara and national parks' },

  // Romantic
  { city: 'Paris', country: 'France', airportCode: 'CDG', category: 'romantic', reason: 'The city of love — Eiffel Tower, Seine cruises, and fine dining' },
  { city: 'Rome', country: 'Italy', airportCode: 'FCO', category: 'romantic', reason: 'Ancient romance with Colosseum, fountains, and Italian cuisine' },
  { city: 'Udaipur', country: 'India', airportCode: 'UDR', category: 'romantic', reason: 'City of Lakes with royal palaces and sunset boat rides' },
  { city: 'Santorini', country: 'Greece', airportCode: 'JTR', category: 'romantic', reason: 'Blue domes, sunsets over caldera, and intimate cliffside dining' },
  { city: 'Dubai', country: 'UAE', airportCode: 'DXB', category: 'romantic', reason: 'Luxury resorts, desert safaris, and iconic skyline views' },
  { city: 'Amsterdam', country: 'Netherlands', airportCode: 'AMS', category: 'romantic', reason: 'Canal-side strolls, tulip fields, and cozy café culture' },

  // Spiritual
  { city: 'Varanasi', country: 'India', airportCode: 'VNS', category: 'spiritual', reason: 'Ancient ghats on the Ganges — the spiritual heart of India' },
  { city: 'Amritsar', country: 'India', airportCode: 'ATQ', category: 'spiritual', reason: 'Golden Temple and profound Sikh heritage' },
  { city: 'Tirupati', country: 'India', airportCode: 'TIR', category: 'spiritual', reason: 'Sri Venkateswara Temple, one of the most visited pilgrimage sites' },
  { city: 'Bangkok', country: 'Thailand', airportCode: 'BKK', category: 'spiritual', reason: 'Grand Palace, Wat Arun, and Buddhist meditation retreats' },
  { city: 'Istanbul', country: 'Turkey', airportCode: 'IST', category: 'spiritual', reason: 'Where East meets West — Hagia Sophia and Blue Mosque' },

  // City / Culture
  { city: 'New York', country: 'USA', airportCode: 'JFK', category: 'city', reason: 'The city that never sleeps — Broadway, Central Park, and world cuisine' },
  { city: 'Tokyo', country: 'Japan', airportCode: 'HND', category: 'city', reason: 'Futuristic tech meets ancient tradition, with incredible food' },
  { city: 'London', country: 'UK', airportCode: 'LHR', category: 'city', reason: 'Royal heritage, West End theatre, and iconic landmarks' },
  { city: 'Singapore', country: 'Singapore', airportCode: 'SIN', category: 'city', reason: 'Garden city with hawker food, Marina Bay, and clean efficiency' },
  { city: 'Seoul', country: 'South Korea', airportCode: 'ICN', category: 'city', reason: 'K-culture, street food, palaces, and cutting-edge technology' },

  // Wellness
  { city: 'Kochi', country: 'India', airportCode: 'COK', category: 'wellness', reason: 'Gateway to Kerala backwaters and authentic Ayurvedic retreats' },
  { city: 'Bali', country: 'Indonesia', airportCode: 'DPS', category: 'wellness', reason: 'Yoga retreats, healing ceremonies, and spa sanctuaries in Ubud' },
]

// ── Mood-to-category mapping ────────────────────────────────────────
interface MoodMapping {
  keywords: string[]
  categories: DestinationCategory[]
  responsePrefix: string
}

const MOOD_MAPPINGS: MoodMapping[] = [
  {
    keywords: ['stress', 'stressed', 'tired', 'exhausted', 'burnout', 'overwhelm', 'relax', 'unwind', 'chill', 'peace', 'calm', 'rest'],
    categories: ['beach', 'wellness'],
    responsePrefix: 'Sounds like you need to decompress! Here are some relaxing destinations perfect for unwinding',
  },
  {
    keywords: ['beach', 'ocean', 'sea', 'sun', 'sand', 'tropical', 'island', 'swim', 'surf', 'coast'],
    categories: ['beach'],
    responsePrefix: 'Great choice! Here are the best beach destinations with crystal-clear waters',
  },
  {
    keywords: ['adventure', 'trek', 'hike', 'hiking', 'trekking', 'thrill', 'extreme', 'mountain', 'climb', 'explore', 'safari', 'wild'],
    categories: ['adventure'],
    responsePrefix: 'Adventure awaits! Here are destinations that will get your adrenaline pumping',
  },
  {
    keywords: ['romantic', 'romance', 'honeymoon', 'couple', 'love', 'anniversary', 'date', 'proposal', 'wedding', 'partner', 'valentine'],
    categories: ['romantic'],
    responsePrefix: 'How romantic! Here are dreamy destinations perfect for a couple\'s getaway',
  },
  {
    keywords: ['spiritual', 'temple', 'prayer', 'meditat', 'soul', 'pilgrim', 'holy', 'sacred', 'divine', 'religion', 'god', 'faith', 'worship'],
    categories: ['spiritual'],
    responsePrefix: 'A journey of the soul! Here are spiritually enriching destinations',
  },
  {
    keywords: ['city', 'urban', 'shopping', 'food', 'culture', 'museum', 'nightlife', 'party', 'cosmopolitan', 'sightseeing'],
    categories: ['city'],
    responsePrefix: 'City life it is! Here are vibrant urban destinations packed with experiences',
  },
  {
    keywords: ['wellness', 'spa', 'yoga', 'ayurved', 'heal', 'detox', 'retreat', 'mindful', 'rejuvenat'],
    categories: ['wellness', 'beach'],
    responsePrefix: 'Self-care is important! Here are wellness-focused destinations for mind and body',
  },
]

// ── Core suggestion engine ──────────────────────────────────────────
export interface Suggestion {
  city: string
  country: string
  airportCode: string
  reason: string
  category: DestinationCategory
}

export interface AssistantResponse {
  message: string
  suggestions: Suggestion[]
  detectedMood: string
}

/**
 * Analyze user input and return structured destination suggestions.
 * Uses keyword extraction, not random selection.
 */
export function getDestinationSuggestions(userInput: string): AssistantResponse {
  const input = userInput.toLowerCase().trim()

  if (!input || input.length < 2) {
    return {
      message: 'Tell me how you\'re feeling or what kind of trip you\'re looking for! For example: "I feel stressed", "beach vacation", "romantic getaway", or "adventure trip".',
      suggestions: [],
      detectedMood: 'unknown',
    }
  }

  // Score each mood mapping by keyword matches
  let bestMapping: MoodMapping | null = null
  let bestScore = 0
  let detectedMood = ''

  for (const mapping of MOOD_MAPPINGS) {
    let score = 0
    for (const keyword of mapping.keywords) {
      if (input.includes(keyword)) {
        // Exact word match scores higher than substring
        const wordBoundary = new RegExp(`\\b${keyword}`, 'i')
        score += wordBoundary.test(input) ? 2 : 1
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMapping = mapping
      // Detect the first matching keyword as the mood label
      detectedMood = mapping.keywords.find(k => input.includes(k)) ?? mapping.categories[0]
    }
  }

  // No match — return helpful fallback
  if (!bestMapping || bestScore === 0) {
    // Check for direct airport code or city name
    const directMatch = DESTINATIONS.find(
      d => input.includes(d.city.toLowerCase()) || input.includes(d.airportCode.toLowerCase()),
    )
    if (directMatch) {
      return {
        message: `Great choice! ${directMatch.city} is a wonderful destination. Here are similar places you might enjoy:`,
        suggestions: DESTINATIONS
          .filter(d => d.category === directMatch.category && d.airportCode !== directMatch.airportCode)
          .slice(0, 3)
          .map(d => ({ city: d.city, country: d.country, airportCode: d.airportCode, reason: d.reason, category: d.category })),
        detectedMood: directMatch.category,
      }
    }

    return {
      message: 'I\'d love to help! Try telling me your mood or travel style:\n• "I feel stressed" → relaxing beaches\n• "adventure trip" → mountains & trekking\n• "romantic getaway" → scenic cities\n• "spiritual journey" → sacred destinations',
      suggestions: [],
      detectedMood: 'unknown',
    }
  }

  // Gather destinations from matched categories, deduplicated by airportCode
  const seen = new Set<string>()
  const matched: Destination[] = []
  for (const cat of bestMapping.categories) {
    for (const dest of DESTINATIONS) {
      if (dest.category === cat && !seen.has(dest.airportCode)) {
        seen.add(dest.airportCode)
        matched.push(dest)
      }
    }
  }

  // Return top 4 suggestions
  const suggestions = matched.slice(0, 4).map(d => ({
    city: d.city,
    country: d.country,
    airportCode: d.airportCode,
    reason: d.reason,
    category: d.category,
  }))

  return {
    message: `${bestMapping.responsePrefix}:`,
    suggestions,
    detectedMood,
  }
}

// ── Category display helpers ────────────────────────────────────────
export const CATEGORY_CONFIG: Record<DestinationCategory, { emoji: string; label: string; color: string }> = {
  beach: { emoji: '🌴', label: 'Beach', color: 'text-cyan-400' },
  adventure: { emoji: '🏔️', label: 'Adventure', color: 'text-emerald-400' },
  romantic: { emoji: '💕', label: 'Romantic', color: 'text-pink-400' },
  spiritual: { emoji: '🕊️', label: 'Spiritual', color: 'text-amber-400' },
  city: { emoji: '🏙️', label: 'City', color: 'text-violet-400' },
  wellness: { emoji: '🧘', label: 'Wellness', color: 'text-teal-400' },
}
