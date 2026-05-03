import { createHttpClient, requestWithResilience } from './httpClient'

export interface TimelineDay {
  date: string
  price: number | null
  isCheapest: boolean
}

export interface QuickPick {
  id: string
  title: string
  type: string
  destination: string
  price: number
}

export interface LiveDeal {
  route: string
  price: number
  urgency: string
  destination: string
}

const client = createHttpClient()

export const DiscoveryService = {
  async getTimeline(from: string, to: string): Promise<TimelineDay[]> {
    const useMock = (import.meta.env.VITE_USE_MOCKS?.toString() ?? 'true') === 'true'

    const fallback = async (): Promise<TimelineDay[]> => {
      const timeline: TimelineDay[] = []
      const today = new Date()
      let minPrice = Infinity
      
      // Generate some mock prices
      for (let i = 0; i < 7; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        const dateStr = d.toISOString().split('T')[0]
        
        let hash = 0
        const seedStr = `${from}-${to}-${dateStr}`
        for (let j = 0; j < seedStr.length; j++) hash = (hash * 31 + seedStr.charCodeAt(j)) >>> 0
        
        const price = 2800 + (hash % 4000)
        if (price < minPrice) minPrice = price
        
        timeline.push({
          date: dateStr,
          price,
          isCheapest: false
        })
      }
      
      return timeline.map(day => ({
        ...day,
        isCheapest: day.price === minPrice
      }))
    }

    if (useMock) return fallback()

    return await requestWithResilience<TimelineDay[]>(
      client,
      { method: 'GET', url: `/discovery/timeline?from=${from}&to=${to}` },
      { breakerKey: 'DiscoveryService.getTimeline', retries: 2, fallback }
    )
  },

  async getQuickPicks(from: string): Promise<QuickPick[]> {
    const useMock = (import.meta.env.VITE_USE_MOCKS?.toString() ?? 'true') === 'true'

    const fallback = async (): Promise<QuickPick[]> => {
      return [
        { id: 'weekend', title: 'Weekend trips under ₹5000', type: 'budget', destination: 'GOI', price: 4500 },
        { id: 'beach', title: 'Beach destinations', type: 'beach', destination: 'IXZ', price: 5200 },
        { id: 'short', title: 'Short flights (<2h)', type: 'short', destination: 'JAI', price: 3100 },
        { id: 'cheapest', title: 'Cheapest this week', type: 'budget', destination: 'LKO', price: 2800 },
      ]
    }

    if (useMock) return fallback()

    return await requestWithResilience<QuickPick[]>(
      client,
      { method: 'GET', url: `/discovery/quick-picks?from=${from}` },
      { breakerKey: 'DiscoveryService.getQuickPicks', retries: 2, fallback }
    )
  },

  async getLiveDeals(from: string): Promise<LiveDeal[]> {
    const useMock = (import.meta.env.VITE_USE_MOCKS?.toString() ?? 'true') === 'true'

    const fallback = async (): Promise<LiveDeal[]> => {
      return [
        { route: `${from} → BOM`, price: 3400, urgency: 'Only 3 seats left', destination: 'BOM' },
        { route: `${from} → BLR`, price: 4100, urgency: 'Price drops today', destination: 'BLR' },
        { route: `${from} → DXB`, price: 12500, urgency: 'Hot deal', destination: 'DXB' },
      ]
    }

    if (useMock) return fallback()

    return await requestWithResilience<LiveDeal[]>(
      client,
      { method: 'GET', url: `/discovery/deals?from=${from}` },
      { breakerKey: 'DiscoveryService.getLiveDeals', retries: 2, fallback }
    )
  }
}
