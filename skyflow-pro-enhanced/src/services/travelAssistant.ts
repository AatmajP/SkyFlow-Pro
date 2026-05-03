import { FlightService } from './flightService'

export type DestinationCategory = 'beach' | 'adventure' | 'romantic' | 'spiritual' | 'city' | 'wellness'

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
  { city: 'Zurich', country: 'Switzerland', airportCode: 'ZRH', category: 'adventure', reason: 'Gateway to the Alps' },
  { city: 'Kathmandu', country: 'Nepal', airportCode: 'KTM', category: 'adventure', reason: 'Base camp for Everest treks' },
  { city: 'Paris', country: 'France', airportCode: 'CDG', category: 'romantic', reason: 'The city of love' },
  { city: 'Udaipur', country: 'India', airportCode: 'UDR', category: 'romantic', reason: 'City of Lakes with royal palaces' },
  { city: 'Varanasi', country: 'India', airportCode: 'VNS', category: 'spiritual', reason: 'Ancient ghats on the Ganges' },
  { city: 'Bangkok', country: 'Thailand', airportCode: 'BKK', category: 'spiritual', reason: 'Grand Palace and Buddhist retreats' },
  { city: 'New York', country: 'USA', airportCode: 'JFK', category: 'city', reason: 'The city that never sleeps' },
  { city: 'London', country: 'UK', airportCode: 'LHR', category: 'city', reason: 'Royal heritage and iconic landmarks' },
  { city: 'Kochi', country: 'India', airportCode: 'COK', category: 'wellness', reason: 'Gateway to Kerala backwaters' },
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
  awaiting: 'intent' | 'budget' | 'none'
  origin: string
}

const MOODS: Record<string, DestinationCategory[]> = {
  relax: ['beach', 'wellness'],
  adventure: ['adventure'],
  romantic: ['romantic'],
  spiritual: ['spiritual'],
  culture: ['city'],
}

const BUDGET_REGEX = /(under|less than|max|budget)?\s*(\$|₹|inr|rs)?\s*(\d+[,.]?\d*k?)/i

export const CATEGORY_CONFIG: Record<DestinationCategory, { emoji: string; label: string; color: string }> = {
  beach: { emoji: '🌴', label: 'Beach', color: 'text-cyan-400' },
  adventure: { emoji: '🏔️', label: 'Adventure', color: 'text-emerald-400' },
  romantic: { emoji: '💕', label: 'Romantic', color: 'text-pink-400' },
  spiritual: { emoji: '🕊️', label: 'Spiritual', color: 'text-amber-400' },
  city: { emoji: '🏙️', label: 'City', color: 'text-violet-400' },
  wellness: { emoji: '🧘', label: 'Wellness', color: 'text-teal-400' },
}

export async function processChat(input: string, state: ChatState): Promise<{ response: AssistantResponse; newState: ChatState }> {
  let newState = { ...state }
  const text = input.toLowerCase()

  // 1. Detect Mood
  if (!newState.mood) {
    for (const [mood, categories] of Object.entries(MOODS)) {
      if (text.includes(mood) || categories.some(c => text.includes(c))) {
        newState.mood = mood
        break
      }
    }
  }

  // 2. Detect Travel Type
  if (text.includes('solo') || text.includes('alone')) newState.travelType = 'solo'
  else if (text.includes('family') || text.includes('kids')) newState.travelType = 'family'
  else if (text.includes('couple') || text.includes('partner')) newState.travelType = 'couple'

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
  if (!newState.mood) {
    newState.awaiting = 'intent'
    return {
      newState,
      response: {
        message: "I can help you find the perfect trip! Are you looking for something relaxing, an adventure, or maybe a romantic getaway?",
        suggestions: []
      }
    }
  }

  if (!newState.budget && newState.awaiting !== 'budget') {
    newState.awaiting = 'budget'
    return {
      newState,
      response: {
        message: `A ${newState.mood} trip sounds wonderful! Do you have a budget in mind per person? (e.g. "under 5000" or "10k")`,
        suggestions: []
      }
    }
  }

  newState.awaiting = 'none'

  // Generate suggestions based on mood
  const categories = MOODS[newState.mood] || ['city']
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
      console.warn("Failed to fetch price for", dest.airportCode)
    }
  }

  if (suggestions.length === 0) {
    return {
      newState,
      response: {
        message: `I couldn't find any ${newState.mood} flights under ${newState.budget ? '₹'+newState.budget : 'that budget'}. Would you like to increase your budget or change your mood?`,
        suggestions: []
      }
    }
  }

  let finalMsg = `I found some excellent real-time ${newState.mood} options`
  if (newState.budget) finalMsg += ` under ₹${newState.budget}`
  if (newState.travelType) finalMsg += ` for your ${newState.travelType} trip`
  finalMsg += `! Here are the best flights departing next week from ${from}:`

  // Reset state slightly if they want to ask again, or keep it to refine
  // We'll keep it so they can just say "change to adventure"

  return {
    newState,
    response: {
      message: finalMsg,
      suggestions: suggestions.sort((a,b) => (a.price || 0) - (b.price || 0))
    }
  }
}
