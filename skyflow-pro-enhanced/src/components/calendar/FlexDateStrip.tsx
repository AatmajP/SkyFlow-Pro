import { useState, useEffect } from 'react'
import { TrendingDown, TrendingUp, RefreshCw } from 'lucide-react'
import { formatMonthDay, formatWeekdayShort, parseISODate, toISODate, addDays } from '../../utils/dateUtils'
import { createHttpClient, requestWithResilience } from '../../services/httpClient'

interface FlexDateStripProps {
  from: string
  to: string
  selectedDate: string
  flexDays: number
  onSelect: (dateStr: string) => void
}

interface TimelineData {
  date: string
  price: number | null
  isCheapest: boolean
}

const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const client = createHttpClient()

export function FlexDateStrip({ from, to, selectedDate, flexDays, onSelect }: FlexDateStripProps) {
  const [data, setData] = useState<TimelineData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const fetchTimeline = async (forceRefetch = false) => {
    if (!from || !to || !selectedDate) return
    setIsLoading(true)
    setError(false)

    try {
      const useMock = (import.meta.env.VITE_USE_MOCKS?.toString() ?? 'true') === 'true' && !forceRefetch
      
      const fallback = async (): Promise<TimelineData[]> => {
        const timeline: TimelineData[] = []
        const base = new Date(selectedDate)
        let minPrice = Infinity

        for (let i = -flexDays; i <= flexDays; i++) {
          const d = addDays(base, i)
          const dateStr = toISODate(d)
          
          let hash = 0
          const seedStr = `${from}-${to}-${dateStr}`
          for (let j = 0; j < seedStr.length; j++) hash = (hash * 31 + seedStr.charCodeAt(j)) >>> 0
          
          const price = 3200 + (hash % 4500)
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

      if (useMock) {
        // Wait a bit to simulate network
        await new Promise(r => setTimeout(r, 600))
        setData(await fallback())
        setIsLoading(false)
        return
      }

      const res = await requestWithResilience<TimelineData[]>(
        client,
        { method: 'GET', url: `/api/flights/timeline?from=${from}&to=${to}&date=${selectedDate}` },
        { breakerKey: 'FlexDateStrip.getTimeline', retries: 1, fallback }
      )
      
      setData(res)
    } catch (err) {
      console.error('Failed to fetch timeline:', err)
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Refetch when search parameters change
  useEffect(() => {
    fetchTimeline()
  }, [from, to, selectedDate])

  const selected = parseISODate(selectedDate)
  if (!selected) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Generate all expected dates visually
  const allDays = Array.from({ length: flexDays * 2 + 1 }, (_, idx) => addDays(selected, idx - flexDays))
  const days = allDays.filter((d) => d >= today)

  if (days.length === 0) return null

  // Compute stats from current data
  const validPrices = data.map(d => d.price).filter(p => p !== null) as number[]
  const min = validPrices.length > 0 ? Math.min(...validPrices) : 0
  const max = validPrices.length > 0 ? Math.max(...validPrices) : 0
  const avg = validPrices.length > 0 ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length : 0

  return (
    <section
      aria-label={`Flexible dates within plus or minus ${flexDays} days`}
      className="rounded-2xl border border-slate-800/50 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-4 backdrop-blur-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/50">
        <div>
          <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-emerald-400" />
            Cheapest Days (±{flexDays})
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any date to change your departure
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <button 
            type="button" 
            onClick={() => fetchTimeline(true)}
            className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition-colors mr-2 p-1.5 rounded-lg hover:bg-sky-500/10"
            title="Refresh Timeline"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Best price</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-slate-400">Higher</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-7 sm:overflow-visible sm:pb-0 relative min-h-[120px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 z-10 rounded-xl backdrop-blur-sm">
            <RefreshCw className="h-6 w-6 text-sky-400 animate-spin" />
          </div>
        )}
        
        {days.map((date, idx) => {
          const iso = toISODate(date)
          const dayData = data.find(d => d.date === iso)
          const price = dayData?.price || 0
          
          const isSelected = iso === selectedDate
          const isCheapest = dayData?.isCheapest || price === min && price > 0
          const isExpensive = price === max && price > 0
          const priceTrend = price < avg ? 'low' : price > avg + 500 ? 'high' : 'normal'
          const isToday = iso === toISODate(today)

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={`
                group relative rounded-xl border p-3 text-left transition-all duration-300
                snap-center shrink-0 w-[110px] sm:w-auto
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                ${isSelected
                  ? 'border-sky-400 bg-sky-500/15 ring-1 ring-sky-400/30 shadow-lg shadow-sky-500/10'
                  : isCheapest
                    ? 'border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-400/50'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/50'
                }
              `}
              aria-pressed={isSelected}
            >
              <p className={`text-xs font-medium ${isSelected ? 'text-sky-300' : isToday ? 'text-amber-400' : 'text-slate-400'}`}>
                {isToday ? 'Today' : formatWeekdayShort(date)}
              </p>

              <p className={`text-sm font-semibold mt-0.5 ${isSelected ? 'text-slate-50' : 'text-slate-300'}`}>
                {formatMonthDay(date)}
              </p>

              <div className="mt-2 flex items-center gap-1">
                {price > 0 ? (
                  <p className={`text-base font-bold ${isCheapest ? 'text-emerald-400' : isExpensive ? 'text-amber-400' : 'text-slate-50'}`}>
                    {priceFormatter.format(price)}
                  </p>
                ) : (
                  <p className="text-base font-bold text-slate-500">-</p>
                )}
                {priceTrend === 'low' && !isCheapest && price > 0 && (
                  <TrendingDown className="h-3 w-3 text-emerald-500" />
                )}
                {priceTrend === 'high' && price > 0 && (
                  <TrendingUp className="h-3 w-3 text-amber-500" />
                )}
              </div>

              {isCheapest && price > 0 && (
                <span className="absolute -top-2 -right-2 badge-success text-[0.6rem] px-1.5 py-0.5 animate-scale-in">
                  Best
                </span>
              )}

              {isSelected && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                  <span className="block h-1.5 w-6 rounded-full bg-sky-400" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <p>
          {min > 0 ? (
            <>
              Prices range from{' '}
              <span className="font-semibold text-emerald-400">{priceFormatter.format(min)}</span>
              {' '}to{' '}
              <span className="font-semibold text-amber-400">{priceFormatter.format(max)}</span>
            </>
          ) : (
            <span>Data unavailable for selected range</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          {avg > 5000 ? (
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <TrendingUp className="h-3 w-3" /> Prices rising for this period
            </span>
          ) : avg > 0 ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <TrendingDown className="h-3 w-3" /> Great prices available
            </span>
          ) : null}
        </div>
      </div>
    </section>
  )
}
