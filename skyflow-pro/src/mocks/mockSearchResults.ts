import type { FlightOption, CabinClass, PriceTransparency, FlightSegment, ClassPrice } from '../types/flight'

// ─── Real Indian + International Airlines ───────────────────────────
interface AirlineData {
  code: string
  name: string
  alliance: string | null
  isProprietary?: boolean
}

const AIRLINES: AirlineData[] = [
  { code: '6E', name: 'IndiGo', alliance: null },
  { code: 'AI', name: 'Air India', alliance: 'Star Alliance' },
  { code: 'UK', name: 'Vistara', alliance: null },
  { code: 'SG', name: 'SpiceJet', alliance: null },
  { code: 'QP', name: 'Akasa Air', alliance: null },
  { code: 'PT', name: 'Patro Airlines', alliance: null, isProprietary: true },
]

const INTL_AIRLINES: AirlineData[] = [
  { code: 'EK', name: 'Emirates', alliance: null },
  { code: 'BA', name: 'British Airways', alliance: 'oneworld' },
  { code: 'LH', name: 'Lufthansa', alliance: 'Star Alliance' },
  { code: 'SQ', name: 'Singapore Airlines', alliance: 'Star Alliance' },
]

// ─── 50+ Real Airport Codes ─────────────────────────────────────────
interface AirportInfo {
  code: string
  city: string
  country: string
  type: 'metro' | 'beach' | 'tourism' | 'spiritual' | 'pilgrimage'
  highlights?: string[]
  bestMonths?: string[]
  priceRange?: 'budget' | 'mid' | 'premium'
}

const AIRPORTS: AirportInfo[] = [
  // India — Metro
  { code: 'DEL', city: 'New Delhi', country: 'India', type: 'metro' },
  { code: 'BOM', city: 'Mumbai', country: 'India', type: 'metro' },
  { code: 'BLR', city: 'Bengaluru', country: 'India', type: 'metro' },
  { code: 'HYD', city: 'Hyderabad', country: 'India', type: 'metro' },
  { code: 'MAA', city: 'Chennai', country: 'India', type: 'metro' },
  { code: 'CCU', city: 'Kolkata', country: 'India', type: 'metro' },
  { code: 'AMD', city: 'Ahmedabad', country: 'India', type: 'metro' },
  { code: 'PNQ', city: 'Pune', country: 'India', type: 'metro' },
  { code: 'GOI', city: 'Goa', country: 'India', type: 'beach' },
  { code: 'JAI', city: 'Jaipur', country: 'India', type: 'tourism' },
  { code: 'LKO', city: 'Lucknow', country: 'India', type: 'tourism' },
  { code: 'COK', city: 'Kochi', country: 'India', type: 'beach' },
  { code: 'TRV', city: 'Thiruvananthapuram', country: 'India', type: 'beach' },

  // India — Spiritual & Pilgrimage
  { 
    code: 'VNS', city: 'Varanasi', country: 'India', type: 'spiritual',
    highlights: ['Ganga Aarti', 'Kashi Vishwanath Temple', 'Sarnath'],
    bestMonths: ['October', 'November', 'December', 'January', 'February', 'March'],
    priceRange: 'mid'
  },
  { 
    code: 'TIR', city: 'Tirupati', country: 'India', type: 'pilgrimage',
    highlights: ['Tirumala Venkateswara Temple', 'Akasaganga Teertham'],
    bestMonths: ['September', 'October', 'November', 'December', 'January', 'February'],
    priceRange: 'mid'
  },
  { 
    code: 'IXM', city: 'Madurai', country: 'India', type: 'spiritual',
    highlights: ['Meenakshi Amman Temple', 'Thirumalai Nayakkar Mahal'],
    bestMonths: ['October', 'November', 'December', 'January', 'February'],
    priceRange: 'mid'
  },
  { 
    code: 'DED', city: 'Rishikesh', country: 'India', type: 'spiritual',
    highlights: ['Yoga Retreats', 'Laxman Jhula', 'Ganga River Rafting'],
    bestMonths: ['March', 'April', 'May', 'September', 'October', 'November'],
    priceRange: 'budget'
  },
  { 
    code: 'AYJ', city: 'Ayodhya', country: 'India', type: 'pilgrimage',
    highlights: ['Ram Janmabhoomi', 'Hanuman Garhi', 'Sarayu River'],
    bestMonths: ['October', 'November', 'December', 'January', 'February', 'March'],
    priceRange: 'mid'
  },
  { 
    code: 'BBI', city: 'Puri', country: 'India', type: 'pilgrimage',
    highlights: ['Jagannath Temple', 'Golden Beach', 'Konark Sun Temple'],
    bestMonths: ['October', 'November', 'December', 'January', 'February'],
    priceRange: 'mid'
  },
  { 
    code: 'SAG', city: 'Shirdi', country: 'India', type: 'pilgrimage',
    highlights: ['Sai Baba Samadhi Mandir', 'Shani Shingnapur'],
    bestMonths: ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'],
    priceRange: 'budget'
  },
  { 
    code: 'GAY', city: 'Bodh Gaya', country: 'India', type: 'spiritual',
    highlights: ['Mahabodhi Temple', 'Bodhi Tree', 'Great Buddha Statue'],
    bestMonths: ['October', 'November', 'December', 'January', 'February', 'March'],
    priceRange: 'mid'
  },
  { 
    code: 'ATQ', city: 'Amritsar', country: 'India', type: 'spiritual',
    highlights: ['Golden Temple', 'Wagah Border', 'Jallianwala Bagh'],
    bestMonths: ['October', 'November', 'December', 'January', 'February', 'March'],
    priceRange: 'mid'
  },
  { 
    code: 'JGA', city: 'Dwarka', country: 'India', type: 'pilgrimage',
    highlights: ['Dwarkadhish Temple', 'Bet Dwarka', 'Nageshwar Jyotirlinga'],
    bestMonths: ['October', 'November', 'December', 'January', 'February', 'March'],
    priceRange: 'mid'
  },
  { 
    code: 'IDR', city: 'Ujjain', country: 'India', type: 'pilgrimage',
    highlights: ['Mahakaleshwar Jyotirlinga', 'Kshipra River Ghats'],
    bestMonths: ['October', 'November', 'December', 'January', 'February', 'March'],
    priceRange: 'mid'
  },
  { 
    code: 'ISK', city: 'Nashik', country: 'India', type: 'spiritual',
    highlights: ['Trimbakeshwar Temple', 'Panchavati', 'Sula Vineyards'],
    bestMonths: ['October', 'November', 'December', 'January', 'February', 'March'],
    priceRange: 'mid'
  },
  { 
    code: 'IXJ', city: 'Jammu', country: 'India', type: 'pilgrimage',
    highlights: ['Vaishno Devi Temple', 'Raghunath Temple'],
    bestMonths: ['March', 'April', 'May', 'June', 'September', 'October', 'November'],
    priceRange: 'mid'
  },

  // International Spiritual
  { 
    code: 'MED', city: 'Medina', country: 'Saudi Arabia', type: 'pilgrimage',
    highlights: ['Al-Masjid an-Nabawi', 'Quba Mosque'],
    bestMonths: ['November', 'December', 'January', 'February'],
    priceRange: 'premium'
  },
  { 
    code: 'JRS', city: 'Jerusalem', country: 'Israel', type: 'spiritual',
    highlights: ['Western Wall', 'Church of the Holy Sepulchre', 'Dome of the Rock'],
    bestMonths: ['April', 'May', 'October', 'November'],
    priceRange: 'premium'
  },
  { 
    code: 'FCO', city: 'Vatican City', country: 'Italy', type: 'spiritual',
    highlights: ['St. Peter\'s Basilica', 'Sistine Chapel', 'Vatican Museums'],
    bestMonths: ['April', 'May', 'June', 'September', 'October'],
    priceRange: 'premium'
  },
  { 
    code: 'KTM', city: 'Kathmandu', country: 'Nepal', type: 'spiritual',
    highlights: ['Pashupatinath Temple', 'Boudhanath Stupa', 'Swayambhunath'],
    bestMonths: ['September', 'October', 'November', 'March', 'April', 'May'],
    priceRange: 'budget'
  },
  { 
    code: 'LXA', city: 'Lhasa', country: 'Tibet', type: 'spiritual',
    highlights: ['Potala Palace', 'Jokhang Temple', 'Sera Monastery'],
    bestMonths: ['May', 'June', 'July', 'August', 'September', 'October'],
    priceRange: 'premium'
  },
  { 
    code: 'DPS', city: 'Bali', country: 'Indonesia', type: 'spiritual',
    highlights: ['Besakih Temple', 'Uluwatu Temple', 'Ubud Yoga'],
    bestMonths: ['April', 'May', 'June', 'July', 'August', 'September'],
    priceRange: 'mid'
  },
  { 
    code: 'HND', city: 'Kyoto', country: 'Japan', type: 'spiritual',
    highlights: ['Fushimi Inari-taisha', 'Kinkaku-ji', 'Arashiyama Bamboo Grove'],
    bestMonths: ['March', 'April', 'May', 'October', 'November'],
    priceRange: 'premium'
  },
  { 
    code: 'CNX', city: 'Chiang Mai', country: 'Thailand', type: 'spiritual',
    highlights: ['Wat Phra That Doi Suthep', 'Old City Temples'],
    bestMonths: ['November', 'December', 'January', 'February'],
    priceRange: 'budget'
  },
  { 
    code: 'LPQ', city: 'Luang Prabang', country: 'Laos', type: 'spiritual',
    highlights: ['Wat Xieng Thong', 'Morning Alms Giving'],
    bestMonths: ['November', 'December', 'January', 'February'],
    priceRange: 'budget'
  },

  // India — Tier-2 & Others
  { code: 'IXC', city: 'Chandigarh', country: 'India', type: 'metro' },
  { code: 'GAU', city: 'Guwahati', country: 'India', type: 'tourism' },
  { code: 'PAT', city: 'Patna', country: 'India', type: 'tourism' },
  { code: 'IXB', city: 'Bagdogra', country: 'India', type: 'tourism' },
  { code: 'SXR', city: 'Srinagar', country: 'India', type: 'tourism' },
  { code: 'VTZ', city: 'Visakhapatnam', country: 'India', type: 'beach' },
  { code: 'NAG', city: 'Nagpur', country: 'India', type: 'metro' },
  { code: 'UDR', city: 'Udaipur', country: 'India', type: 'tourism' },
  { code: 'JDH', city: 'Jodhpur', country: 'India', type: 'tourism' },
  { code: 'IXZ', city: 'Port Blair', country: 'India', type: 'beach' },
  { code: 'RPR', city: 'Raipur', country: 'India', type: 'metro' },
  { code: 'IXR', city: 'Ranchi', country: 'India', type: 'tourism' },

  // International Metro
  { code: 'DXB', city: 'Dubai', country: 'UAE', type: 'metro' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', type: 'metro' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', type: 'tourism' },
  { code: 'LHR', city: 'London', country: 'UK', type: 'metro' },
  { code: 'JFK', city: 'New York', country: 'USA', type: 'metro' },
  { code: 'LAX', city: 'Los Angeles', country: 'USA', type: 'metro' },
  { code: 'SFO', city: 'San Francisco', country: 'USA', type: 'metro' },
  { code: 'NRT', city: 'Tokyo', country: 'Japan', type: 'metro' },
  { code: 'CDG', city: 'Paris', country: 'France', type: 'metro' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', type: 'metro' },
  { code: 'SYD', city: 'Sydney', country: 'Australia', type: 'beach' },
  { code: 'DOH', city: 'Doha', country: 'Qatar', type: 'metro' },
  { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', type: 'metro' },
  { code: 'HKG', city: 'Hong Kong', country: 'China', type: 'metro' },
  { code: 'MIA', city: 'Miami', country: 'USA', type: 'beach' },
  { code: 'YYZ', city: 'Toronto', country: 'Canada', type: 'metro' },
  { code: 'ZRH', city: 'Zurich', country: 'Switzerland', type: 'tourism' },
  { code: 'NBO', city: 'Nairobi', country: 'Kenya', type: 'tourism' },
  { code: 'AUH', city: 'Abu Dhabi', country: 'UAE', type: 'metro' },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', type: 'metro' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', type: 'tourism' },
  { code: 'ICN', city: 'Seoul', country: 'South Korea', type: 'metro' },
  { code: 'DFW', city: 'Dallas', country: 'USA', type: 'metro' },
  { code: 'ATL', city: 'Atlanta', country: 'USA', type: 'metro' },
  { code: 'ORD', city: 'Chicago', country: 'USA', type: 'metro' },
  { code: 'MAD', city: 'Madrid', country: 'Spain', type: 'metro' },
  { code: 'BCN', city: 'Barcelona', country: 'Spain', type: 'beach' },
  { code: 'MUC', city: 'Munich', country: 'Germany', type: 'metro' },
  { code: 'MLE', city: 'Male', country: 'Maldives', type: 'beach' },
  { code: 'HNL', city: 'Honolulu', country: 'USA', type: 'beach' },
]

// ─── Time Slots for Realistic Scheduling ────────────────────────────
const TIME_SLOTS = [
  // Early morning
  { h: 5, m: 30, label: 'Early Morning' },
  { h: 6, m: 0, label: 'Early Morning' },
  { h: 6, m: 30, label: 'Early Morning' },
  // Morning
  { h: 7, m: 0, label: 'Morning' },
  { h: 7, m: 30, label: 'Morning' },
  { h: 8, m: 0, label: 'Morning' },
  { h: 8, m: 45, label: 'Morning' },
  { h: 9, m: 15, label: 'Morning' },
  { h: 9, m: 45, label: 'Morning' },
  { h: 10, m: 0, label: 'Morning' },
  { h: 10, m: 30, label: 'Morning' },
  { h: 11, m: 0, label: 'Morning' },
  // Afternoon
  { h: 12, m: 0, label: 'Afternoon' },
  { h: 12, m: 30, label: 'Afternoon' },
  { h: 13, m: 15, label: 'Afternoon' },
  { h: 14, m: 0, label: 'Afternoon' },
  { h: 14, m: 30, label: 'Afternoon' },
  { h: 15, m: 0, label: 'Afternoon' },
  // Evening
  { h: 16, m: 0, label: 'Evening' },
  { h: 16, m: 30, label: 'Evening' },
  { h: 17, m: 0, label: 'Evening' },
  { h: 17, m: 45, label: 'Evening' },
  { h: 18, m: 15, label: 'Evening' },
  { h: 18, m: 45, label: 'Evening' },
  // Night
  { h: 19, m: 30, label: 'Night' },
  { h: 20, m: 0, label: 'Night' },
  { h: 20, m: 45, label: 'Night' },
  { h: 21, m: 30, label: 'Night' },
  { h: 22, m: 0, label: 'Night' },
  { h: 23, m: 0, label: 'Night' },
]

const AIRCRAFT = [
  'Airbus A320neo', 'Airbus A321neo', 'Airbus A320', 'Boeing 737-800',
  'Boeing 737 MAX 8', 'ATR 72-600', 'Airbus A330-900neo', 'Boeing 787-9 Dreamliner',
  'Boeing 777-300ER', 'Airbus A350-900',
]

const FARE_BRANDS = [
  'Saver', 'Flexi', 'Super Saver', 'Value', 'Comfort', 'Economy Flex',
  'Premium Saver', 'Corporate', 'Freedom',
]

const BAGGAGE_POLICIES = [
  '1 carry-on (7kg) + 1 checked (15kg). Seat selection available.',
  '1 carry-on (7kg) + 1 checked (20kg). Free seat selection included.',
  '1 carry-on (7kg) + 1 checked (23kg). Priority boarding. Free seat selection.',
  '2 checked bags (23kg each). Lounge access. Priority boarding.',
  '1 carry-on (7kg). No checked bag. Add checked bag from ₹500.',
  '1 carry-on (7kg) + 1 checked (15kg). Free meal included.',
]

const REFUND_LABELS = [
  { score: 15, label: 'Non-refundable · Changes not permitted' },
  { score: 24, label: 'Non-refundable · Changes allowed with fee + fare difference' },
  { score: 45, label: 'Changeable with ₹500 fee · No refunds' },
  { score: 55, label: 'Changeable with ₹250 fee + fare difference · No refunds' },
  { score: 68, label: 'Free changes within 24 hours · Changeable with fare difference after' },
  { score: 78, label: 'Changeable with no fee · Refund to travel credit' },
  { score: 86, label: 'Changeable with no fee · Refund to original form' },
  { score: 92, label: 'Fully refundable · Free changes · Priority support' },
]

// ─── Seeded Random for Deterministic Results ────────────────────────
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function getAirportInfo(code: string): AirportInfo | undefined {
  return AIRPORTS.find((a) => a.code === code)
}

function isDomestic(from: string, to: string): boolean {
  const f = getAirportInfo(from)
  const t = getAirportInfo(to)
  return f?.country === 'India' && t?.country === 'India'
}

function estimateDuration(from: string, to: string, rand: () => number): number {
  if (isDomestic(from, to)) {
    return 90 + Math.floor(rand() * 120) // 1.5h to 3.5h
  }
  const f = getAirportInfo(from)
  const t = getAirportInfo(to)
  const nearCountries = ['UAE', 'Qatar', 'Saudi Arabia', 'Thailand', 'Malaysia', 'Singapore']
  if (
    (f?.country === 'India' && nearCountries.includes(t?.country ?? '')) ||
    (t?.country === 'India' && nearCountries.includes(f?.country ?? ''))
  ) {
    return 180 + Math.floor(rand() * 180) // 3h to 6h
  }
  return 300 + Math.floor(rand() * 360) // 5h to 11h
}

function estimateBasePrice(durationMinutes: number, rand: () => number): number {
  if (durationMinutes <= 120) return 2800 + Math.floor(rand() * 2200)
  if (durationMinutes <= 210) return 3800 + Math.floor(rand() * 3500)
  if (durationMinutes <= 360) return 8000 + Math.floor(rand() * 8000)
  return 18000 + Math.floor(rand() * 25000)
}

// ─── Dynamic Flight Generator ───────────────────────────────────────
export function generateFlights(
  from: string,
  to: string,
  dateStr: string,
  cabin: CabinClass = 'economy',
): FlightOption[] {
  // Create a seed from from/to/date for deterministic but varied results
  let seed = 0
  const seedStr = `${from}-${to}-${dateStr}`
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0
  }
  const rand = seededRandom(seed)

  const domestic = isDomestic(from, to)
  const availableAirlines = domestic ? AIRLINES : [...AIRLINES.filter(a => a.isProprietary), ...INTL_AIRLINES, ...AIRLINES.slice(0, 3)]

  // Generate 20-28 flights for domestic routes, 12-18 for international
  const count = domestic ? 20 + Math.floor(rand() * 9) : 12 + Math.floor(rand() * 7)

  const flights: FlightOption[] = []
  const usedSlots = new Set<number>()

  for (let i = 0; i < count; i++) {
    // Pick time slot (avoid duplicates)
    let slotIdx: number
    do {
      slotIdx = Math.floor(rand() * TIME_SLOTS.length)
    } while (usedSlots.has(slotIdx) && usedSlots.size < TIME_SLOTS.length)
    usedSlots.add(slotIdx)
    const slot = TIME_SLOTS[slotIdx]

    // Pick airline — first is always Patro
    let airline: AirlineData
    if (i === 0) {
      airline = AIRLINES.find((a) => a.isProprietary)!
    } else {
      airline = availableAirlines[Math.floor(rand() * availableAirlines.length)]
      // Avoid duplicate Patro
      while (airline.isProprietary && i !== 0) {
        airline = availableAirlines[Math.floor(rand() * availableAirlines.length)]
      }
    }

    const duration = estimateDuration(from, to, rand)
    const baseINR = estimateBasePrice(duration, rand)

    // Apply Patro discount
    const effectiveBase = airline.isProprietary ? baseINR * 0.9 : baseINR

    // ── Compute prices for ALL 4 cabin classes ──
    const CLASS_CONFIG: { cabin: CabinClass; label: string; multiplier: number; surcharge: number }[] = [
      { cabin: 'economy', label: 'Economy', multiplier: 1.0, surcharge: 0 },
      { cabin: 'premium_economy', label: 'Premium Economy', multiplier: 1.5, surcharge: 1200 },
      { cabin: 'business', label: 'Business', multiplier: 3.0, surcharge: 3500 },
      { cabin: 'first', label: 'First Class', multiplier: 5.0, surcharge: 8000 },
    ]

    const taxRate = 0.12
    const carrierCharges = Math.round(200 + rand() * 500)

    const classPrices: ClassPrice[] = CLASS_CONFIG.map((cc) => {
      const base = Math.round(effectiveBase * cc.multiplier) + cc.surcharge
      const tax = Math.round(base * taxRate)
      return {
        cabin: cc.cabin,
        label: cc.label,
        total: base + tax + carrierCharges,
        baseFare: base,
        taxesAndFees: tax,
        carrierCharges,
      }
    })

    // Use the selected cabin's price as the primary display price
    const selectedClassPrice = classPrices.find((cp) => cp.cabin === cabin) ?? classPrices[0]
    const baseFare = selectedClassPrice.baseFare
    const taxes = selectedClassPrice.taxesAndFees
    const total = selectedClassPrice.total

    // Build departure time
    const dateObj = new Date(dateStr + 'T00:00:00')
    const depDate = new Date(dateObj)
    depDate.setHours(slot.h, slot.m, 0, 0)
    const arrDate = new Date(depDate.getTime() + duration * 60000)

    const flightNumber = `${airline.code}${1000 + Math.floor(rand() * 9000)}`

    const refundInfo = REFUND_LABELS[Math.floor(rand() * REFUND_LABELS.length)]
    const carbon = Math.round(duration * (domestic ? 0.8 : 1.2) + rand() * 50)
    const seatsLeft = 5 + Math.floor(rand() * 140) // 5..145 seats

    // Tags based on random attributes
    const tags: string[] = []
    if (rand() > 0.3) tags.push('meal')
    if (rand() > 0.4) tags.push('baggage')
    if (refundInfo.score >= 68) tags.push('refundable')
    if (seatsLeft <= 30) tags.push('surge')

    const segment: FlightSegment = {
      id: `seg-${i}-0`,
      marketingCarrier: airline.name,
      marketingCarrierCode: airline.code,
      operatingCarrierCode: airline.code,
      flightNumber: flightNumber.slice(2),
      from,
      to,
      departureTime: depDate.toISOString(),
      arrivalTime: arrDate.toISOString(),
      durationMinutes: duration,
      aircraft: AIRCRAFT[Math.floor(rand() * AIRCRAFT.length)],
    }

    const price: PriceTransparency = {
      currency: 'INR',
      total,
      baseFare,
      taxesAndFees: taxes,
      carrierCharges,
      perPassenger: total,
      breakdown: [
        { label: 'Base fare', amount: baseFare },
        { label: 'GST & airport taxes', amount: Math.round(taxes * 0.6) },
        { label: 'User development fee', amount: Math.round(taxes * 0.2) },
        { label: 'Aviation security fee', amount: Math.round(taxes * 0.2) },
        { label: 'Carrier surcharge', amount: carrierCharges },
      ],
      lastUpdated: new Date().toISOString(),
      refundabilityScore: refundInfo.score,
      refundableLabel: refundInfo.label,
      carbonEstimateKg: carbon,
    }

    const flight: FlightOption = {
      id: `flight-${from}-${to}-${i}`,
      from,
      to,
      cabin,
      stops: 0,
      totalDurationMinutes: duration,
      segments: [segment],
      layovers: [],
      price,
      classPrices,
      seatsLeft,
      tags,
      baggagePolicy: BAGGAGE_POLICIES[Math.floor(rand() * BAGGAGE_POLICIES.length)],
      alliance: airline.alliance,
      fareBrand: FARE_BRANDS[Math.floor(rand() * FARE_BRANDS.length)],
    }

    flights.push(flight)
  }

  // Sort by departure time by default
  flights.sort((a, b) => {
    const da = new Date(a.segments[0].departureTime).getTime()
    const db = new Date(b.segments[0].departureTime).getTime()
    return da - db
  })

  return flights
}

// ─── Legacy export for backward compatibility ───────────────────────
// Generate a default set for when the mock is imported directly
const today = new Date()
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

export const mockSearchResults: FlightOption[] = generateFlights('DEL', 'BOM', todayStr)

// ─── Airport/Airline Exports for Search Components ──────────────────
export { AIRPORTS, AIRLINES, INTL_AIRLINES }
export type { AirportInfo, AirlineData }
