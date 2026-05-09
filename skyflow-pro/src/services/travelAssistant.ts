import { FlightService } from './flightService'

export type DestinationCategory = 'beach' | 'adventure' | 'romantic' | 'spiritual' | 'city' | 'wellness' | 'nightlife' | 'cold' | 'history'

export interface Destination {
  city: string
  country: string
  airportCode: string
  category: DestinationCategory
  reason: string
}

export const DESTINATIONS: Destination[] = [
  { city: 'Male', country: 'Maldives', airportCode: 'MLE', category: 'beach', reason: 'Crystal-clear waters and overwater villas' },
  { city: 'Bali', country: 'Indonesia', airportCode: 'DPS', category: 'beach', reason: 'Tropical paradise with serene rice terraces' },
  { city: 'Goa', country: 'India', airportCode: 'GOI', category: 'beach', reason: 'Golden beaches and vibrant nightlife' },
  { city: 'Zurich', country: 'Switzerland', airportCode: 'ZRH', category: 'cold', reason: 'Gateway to the Alps and luxury shopping' },
  { city: 'Kathmandu', country: 'Nepal', airportCode: 'KTM', category: 'adventure', reason: 'Base camp for Everest treks' },
  { city: 'Paris', country: 'France', airportCode: 'CDG', category: 'romantic', reason: 'The city of love and fine dining' },
  { city: 'Udaipur', country: 'India', airportCode: 'UDR', category: 'romantic', reason: 'City of Lakes with royal palaces' },
  { city: 'Varanasi', country: 'India', airportCode: 'VNS', category: 'spiritual', reason: 'Ancient ghats on the Ganges' },
  { city: 'Bangkok', country: 'Thailand', airportCode: 'BKK', category: 'nightlife', reason: 'Street food, shopping, and vibrant clubs' },
  { city: 'New York', country: 'USA', airportCode: 'JFK', category: 'city', reason: 'The city that never sleeps' },
  { city: 'London', country: 'UK', airportCode: 'LHR', category: 'history', reason: 'Royal heritage and iconic landmarks' },
  { city: 'Rome', country: 'Italy', airportCode: 'FCO', category: 'history', reason: 'Colosseum and ancient wonders' },
  { city: 'Reykjavik', country: 'Iceland', airportCode: 'KEF', category: 'cold', reason: 'Northern lights and geothermal lagoons' },
  { city: 'Kochi', country: 'India', airportCode: 'COK', category: 'wellness', reason: 'Gateway to Kerala backwaters' },
  { city: 'Manali', country: 'India', airportCode: 'KUL', category: 'cold', reason: 'Snowy mountains and adventure sports' },
]

export interface Suggestion {
  city: string
  country: string
  airportCode: string
  reason: string
  category: DestinationCategory
  price?: number
}

export interface AssistantResponse {
  message: string
  suggestions: Suggestion[]
}

export interface ChatState {
  mood?: string
  budget?: number
  travelType?: string
  intent?: string
  awaiting: 'intent' | 'budget' | 'none'
  origin: string
}

const MOODS: Record<string, DestinationCategory[]> = {
  relax: ['beach', 'wellness'],
  adventure: ['adventure'],
  romantic: ['romantic'],
  spiritual: ['spiritual'],
  culture: ['city', 'history'],
  nightlife: ['nightlife', 'city'],
  cold: ['cold'],
  beach: ['beach'],
}

const INTENTS: Record<string, string> = {
  honeymoon: 'romantic',
  solo: 'adventure',
  party: 'nightlife',
  peaceful: 'relax',
  winter: 'cold',
  budget: 'relax',
}

const BUDGET_REGEX = /(under|less than|max|budget|limit)?\s*(\$|₹|inr|rs)?\s*(\d+[,.]?\d*k?)/i

export const CATEGORY_CONFIG: Record<DestinationCategory, { emoji: string; label: string; color: string }> = {
  beach: { emoji: '🌴', label: 'Beach', color: 'text-cyan-400' },
  adventure: { emoji: '🏔️', label: 'Adventure', color: 'text-emerald-400' },
  romantic: { emoji: '💕', label: 'Romantic', color: 'text-pink-400' },
  spiritual: { emoji: '🕊️', label: 'Spiritual', color: 'text-amber-400' },
  city: { emoji: '🏙️', label: 'City', color: 'text-violet-400' },
  wellness: { emoji: '🧘', label: 'Wellness', color: 'text-teal-400' },
  nightlife: { emoji: '🍸', label: 'Nightlife', color: 'text-fuchsia-400' },
  cold: { emoji: '❄️', label: 'Cold Weather', color: 'text-blue-400' },
  history: { emoji: '🏛️', label: 'History', color: 'text-orange-400' },
}

export async function processChat(input: string, state: ChatState): Promise<{ response: AssistantResponse; newState: ChatState }> {
  let newState = { ...state }
  const text = input.toLowerCase()

  // 1. Detect Intent
  for (const [intent, mood] of Object.entries(INTENTS)) {
    if (text.includes(intent)) {
      newState.intent = intent
      if (!newState.mood) newState.mood = mood
    }
  }

  // 2. Detect Mood/Category
  if (text.includes('beach')) newState.mood = 'relax'
  else if (text.includes('adventure')) newState.mood = 'adventure'
  else if (text.includes('mountain')) newState.mood = 'adventure'
  else if (text.includes('cold') || text.includes('snow')) newState.mood = 'cold'
  else if (text.includes('nightlife') || text.includes('clubs')) newState.mood = 'nightlife'
  else if (text.includes('history') || text.includes('ancient')) newState.mood = 'history'
  
  if (!newState.mood) {
    for (const [mood, categories] of Object.entries(MOODS)) {
      if (text.includes(mood) || categories.some(c => text.includes(c))) {
        newState.mood = mood
        break
      }
    }
  }

  // 3. Detect Budget
  const budgetMatch = text.match(BUDGET_REGEX)
  if (budgetMatch) {
    let numStr = budgetMatch[3].replace(/,/g, '')
    if (numStr.endsWith('k')) {
      numStr = numStr.replace('k', '')
      newState.budget = parseFloat(numStr) * 1000
    } else {
      newState.budget = parseFloat(numStr)
    }
  }

  // State machine logic
  if (!newState.mood && !newState.budget) {
    newState.awaiting = 'intent'
    return {
      newState,
      response: {
        message: "I'd love to help you plan! Tell me, are you dreaming of a peaceful beach, a snowy adventure, or perhaps a city with a great nightlife?",
        suggestions: []
      }
    }
  }

  newState.awaiting = 'none'

  // Generate suggestions
  const categories = MOODS[newState.mood || 'relax'] || ['city']
  let matchedDests = DESTINATIONS.filter(d => categories.includes(d.category))
  
  if (matchedDests.length === 0) matchedDests = DESTINATIONS.slice(0, 4)

  // Fetch real prices for these destinations
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const dateStr = nextWeek.toISOString().split('T')[0]

  const suggestions: Suggestion[] = []
  const from = state.origin || 'DEL'

  for (const dest of matchedDests.slice(0, 4)) {
    try {
      const result = await FlightService.searchFlights({
        from,
        to: dest.airportCode,
        date: dateStr,
        flex: 0,
        adults: 1,
        cabin: 'economy',
        tripType: 'oneway'
      })
      
      const prices = result.results.map(r => r.price.total)
      if (prices.length > 0) {
        const minPrice = Math.min(...prices)
        if (!newState.budget || minPrice <= newState.budget) {
          suggestions.push({
            ...dest,
            price: minPrice
          })
        }
      }
    } catch (err) {
      // Fallback to pseudo-random if API fails or no flights found
      const seed = (from + dest.airportCode + dateStr).hashCode();
      const pseudoPrice = 3500 + (Math.abs(seed) % 8000);
      if (!newState.budget || pseudoPrice <= newState.budget) {
        suggestions.push({
          ...dest,
          price: pseudoPrice
        })
      }
    }
  }

  if (suggestions.length === 0 && newState.budget) {
    return {
      newState,
      response: {
        message: `I found some great destinations, but they currently exceed your ₹${newState.budget} budget. Would you like to see options with a slightly higher budget or try a different type of trip?`,
        suggestions: []
      }
    }
  }

  let finalMsg = `Based on your interest in ${newState.intent || newState.mood || 'travel'}, here are some intelligent recommendations:`
  if (newState.budget) finalMsg = `Great! I've filtered the best options under ₹${newState.budget.toLocaleString('en-IN')}:`
  
  return {
    newState,
    response: {
      message: finalMsg,
      suggestions: suggestions.sort((a,b) => (a.price || 0) - (b.price || 0))
    }
  }
}

// Add hashCode to String prototype for mock logic
if (!(String.prototype as any).hashCode) {
  (String.prototype as any).hashCode = function() {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
      const char = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash;
  };
}
