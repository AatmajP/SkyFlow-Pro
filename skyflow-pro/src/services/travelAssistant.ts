import { AIRPORTS } from '../mocks/mockSearchResults'

export interface Suggestion {
  city: string
  airportCode: string
  reason: string
  price: number
  category: 'relaxing' | 'adventure' | 'luxury' | 'nightlife' | 'romantic' | 'family' | 'cold' | 'beach'
}

export interface ChatResponse {
  message: string
  suggestions?: Suggestion[]
  intent?: string
}

export interface ChatState {
  history: { role: 'user' | 'assistant'; text: string }[]
  mood?: string
  budget?: number
  destination?: string
  origin: string
  tripType?: string
  cabin?: string
  awaiting: 'none' | 'mood' | 'budget' | 'destination' | 'origin'
}

export const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  relaxing: { label: 'Relaxing', emoji: '🧘', color: 'text-emerald-400' },
  adventure: { label: 'Adventure', emoji: '🧗', color: 'text-orange-400' },
  luxury: { label: 'Luxury', emoji: '💎', color: 'text-violet-400' },
  nightlife: { label: 'Nightlife', emoji: '🌃', color: 'text-indigo-400' },
  romantic: { label: 'Romantic', emoji: '💖', color: 'text-pink-400' },
  family: { label: 'Family', emoji: '👨‍👩‍👧‍👦', color: 'text-sky-400' },
  cold: { label: 'Snowy', emoji: '❄️', color: 'text-blue-200' },
  beach: { label: 'Beach', emoji: '🏖', color: 'text-amber-300' },
}

const DESTINATIONS: Record<string, string[]> = {
  relaxing: ['GOI', 'COK', 'MLE', 'DPS', 'ZRH'],
  adventure: ['SXR', 'IXB', 'NBO', 'SYD', 'YYZ'],
  luxury: ['DXB', 'SIN', 'CDG', 'HND', 'DOH'],
  nightlife: ['BKK', 'BCN', 'MIA', 'IST', 'HKG'],
  romantic: ['CDG', 'MLE', 'VNS', 'FCO', 'UDR'],
  family: ['SIN', 'DXB', 'LHR', 'JFK', 'MAA'],
  cold: ['ZRH', 'SXR', 'FRA', 'YYZ', 'NRT'],
  beach: ['GOI', 'MLE', 'DPS', 'MIA', 'SYD'],
}

const RESPONSE_TEMPLATES: Record<string, string[]> = {
  welcome: [
    "✨ Welcome to SkyFlow Intelligence! I'm your personal travel curator.\n\nTell me about your vibe—are you looking for a romantic escape, a high-energy city, or perhaps a snowy mountain retreat?",
    "Hello! I'm SkyFlow AI. I can help you plan your next journey based on your mood or budget. Where's your mind wandering today?",
    "Greetings traveler! Ready to explore the world? Tell me what kind of experience you're looking for—adventure, relaxation, or maybe some luxury?"
  ],
  mood_understood: [
    "I love that choice! {mood} trips are exactly what I'm best at planning. Do you have a specific budget in mind, or should I show you the best options regardless of price?",
    "{mood} sounds perfect. I can definitely find some great spots for that. What's the budget we're working with?",
    "Understood! A {mood} getaway it is. How much are we looking to spend for the flights?"
  ],
  budget_understood: [
    "Perfect, keeping it under {budget}. Here are some incredible {mood} destinations that fit your criteria perfectly:",
    "Got it, {budget} max. I've found some amazing {mood} spots that won't break the bank:",
    "{budget} is a great budget for {mood} travel. Check out these top recommendations for you:"
  ],
  recommending: [
    "Based on what you told me, I think you'll absolutely love these places:",
    "Here are my top-tier picks for your {mood} escape:",
    "I've curated a few destinations that match your vibe and budget:"
  ],
  generic_fallback: [
    "That's interesting! Could you tell me a bit more about what you're looking for in your trip? Like the mood (beach, adventure, etc.) or your budget?",
    "I'm here to help! To give you the best advice, let me know if you want something relaxing, adventurous, or maybe a city break?",
    "I'm learning more every day, but I'm best at finding trips based on your 'vibe' or budget. What are you in the mood for today?"
  ]
}

function getRandomTemplate(category: string, variables: Record<string, string | number> = {}): string {
  const templates = RESPONSE_TEMPLATES[category] || RESPONSE_TEMPLATES.generic_fallback
  let template = templates[Math.floor(Math.random() * templates.length)]
  
  Object.entries(variables).forEach(([key, value]) => {
    template = template.replace(`{${key}}`, String(value))
  })
  
  return template
}

export async function processChat(input: string, state: ChatState): Promise<{ response: ChatResponse; newState: ChatState }> {
  const q = input.toLowerCase()
  let newState = { ...state }
  
  // Detect mood
  let detectedMood = ''
  if (q.includes('relax') || q.includes('chill') || q.includes('calm')) detectedMood = 'relaxing'
  else if (q.includes('adventure') || q.includes('trek') || q.includes('climb') || q.includes('explore')) detectedMood = 'adventure'
  else if (q.includes('luxury') || q.includes('fancy') || q.includes('premium')) detectedMood = 'luxury'
  else if (q.includes('party') || q.includes('night') || q.includes('club')) detectedMood = 'nightlife'
  else if (q.includes('romantic') || q.includes('honey') || q.includes('date') || q.includes('couple')) detectedMood = 'romantic'
  else if (q.includes('family') || q.includes('kids') || q.includes('parent')) detectedMood = 'family'
  else if (q.includes('cold') || q.includes('snow') || q.includes('ski') || q.includes('winter')) detectedMood = 'cold'
  else if (q.includes('beach') || q.includes('ocean') || q.includes('sea') || q.includes('island')) detectedMood = 'beach'

  if (detectedMood) newState.mood = detectedMood

  // Detect budget
  const budgetMatch = q.match(/(?:under|below|around|within|₹|\$)\s?(\d+k?|\d+,\d+)/)
  if (budgetMatch) {
    let budgetStr = budgetMatch[1].replace(/,/g, '')
    if (budgetStr.endsWith('k')) {
      newState.budget = parseInt(budgetStr) * 1000
    } else {
      newState.budget = parseInt(budgetStr)
    }
  }

  // State machine logic
  if (newState.mood && !newState.budget && !q.match(/\d/)) {
    return {
      response: { 
        message: getRandomTemplate('mood_understood', { mood: newState.mood }),
        intent: 'collect_budget'
      },
      newState: { ...newState, awaiting: 'budget' }
    }
  }

  if (newState.mood) {
    const moodDestinations = DESTINATIONS[newState.mood] || DESTINATIONS.relaxing
    const suggestions: Suggestion[] = moodDestinations.map(code => {
      const airport = AIRPORTS.find(a => a.code === code)
      // Deterministic but varied prices
      let hash = 0
      for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0
      const basePrice = 4500 + (hash % 15000)
      
      const reasons: Record<string, string> = {
        relaxing: `Perfect for a quiet escape with serene views and world-class spas.`,
        adventure: `Get your adrenaline pumping with local treks and hidden trails.`,
        luxury: `Experience the pinnacle of hospitality and exclusive fine dining.`,
        nightlife: `The city that never sleeps, with vibrant energy and neon lights.`,
        romantic: `Enchanting sunsets and intimate settings for an unforgettable journey.`,
        family: `Engaging activities and safe environments for all ages to enjoy.`,
        cold: `A winter wonderland perfect for cozy nights and snowy sports.`,
        beach: `Sun-soaked shores and crystal clear waters await your arrival.`,
      }

      return {
        city: airport?.city || code,
        airportCode: code,
        reason: reasons[newState.mood!] || 'A top-rated destination for your chosen travel style.',
        price: newState.budget ? Math.min(basePrice, newState.budget * 0.9) : basePrice,
        category: newState.mood as any
      }
    })

    // Filter by budget if provided
    const filtered = newState.budget 
      ? suggestions.filter(s => s.price <= newState.budget!).slice(0, 3)
      : suggestions.slice(0, 3)

    return {
      response: {
        message: newState.budget 
          ? getRandomTemplate('budget_understood', { budget: newState.budget, mood: newState.mood })
          : getRandomTemplate('recommending', { mood: newState.mood }),
        suggestions: filtered,
        intent: 'recommend'
      },
      newState: { ...newState, awaiting: 'none' }
    }
  }

  return {
    response: { 
      message: getRandomTemplate('generic_fallback'),
      intent: 'fallback'
    },
    newState: { ...newState, awaiting: 'mood' }
  }
}
