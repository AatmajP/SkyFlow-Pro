import { TrendingDown, TrendingUp } from 'lucide-react'
import { formatMonthDay, formatWeekdayShort, parseISODate, toISODate, addDays } from '../../utils/dateUtils'

interface FlexDateStripProps {
  selectedDate: string
  flexDays: number
  onSelect: (dateStr: string) => void
}

const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function demoPrice(dateStr: string): number {
  // deterministic-ish demo pricing to support cheapest-day highlighting
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0
  const base = 3200 + (hash % 4500) // ₹3200..₹7700
  const weekendBump = (() => {
    const dt = parseISODate(dateStr)
    if (!dt) return 0
    const day = dt.getDay()
    return day === 0 || day === 6 ? 800 : 0
  })()
  return base + weekendBump
}

export function FlexDateStrip({ selectedDate, flexDays, onSelect }: FlexDateStripProps) {
  const selected = parseISODate(selectedDate)
  if (!selected) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Generate days but filter out past dates
  const allDays = Array.from({ length: flexDays * 2 + 1 }, (_, idx) => addDays(selected, idx - flexDays))
  const days = allDays.filter((d) => d >= today)

  if (days.length === 0) return null

  const prices = days.map((d) => demoPrice(toISODate(d)))
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length

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

      {/* Responsive: horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-7 sm:overflow-visible sm:pb-0">
        {days.map((date, idx) => {
          const iso = toISODate(date)
          const price = prices[idx]
          const isSelected = iso === selectedDate
          const isCheapest = price === min
          const isExpensive = price === max
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
              {/* Day name */}
              <p className={`text-xs font-medium ${isSelected ? 'text-sky-300' : isToday ? 'text-amber-400' : 'text-slate-400'}`}>
                {isToday ? 'Today' : formatWeekdayShort(date)}
              </p>

              {/* Date */}
              <p className={`text-sm font-semibold mt-0.5 ${isSelected ? 'text-slate-50' : 'text-slate-300'}`}>
                {formatMonthDay(date)}
              </p>

              {/* Price */}
              <div className="mt-2 flex items-center gap-1">
                <p className={`text-base font-bold ${isCheapest ? 'text-emerald-400' : isExpensive ? 'text-amber-400' : 'text-slate-50'
                  }`}>
                  {priceFormatter.format(price)}
                </p>
                {priceTrend === 'low' && !isCheapest && (
                  <TrendingDown className="h-3 w-3 text-emerald-500" />
                )}
                {priceTrend === 'high' && (
                  <TrendingUp className="h-3 w-3 text-amber-500" />
                )}
              </div>

              {/* Best badge */}
              {isCheapest && (
                <span className="absolute -top-2 -right-2 badge-success text-[0.6rem] px-1.5 py-0.5 animate-scale-in">
                  Best
                </span>
              )}

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                  <span className="block h-1.5 w-6 rounded-full bg-sky-400" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Price summary + trend indicator */}
      <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <p>
          Prices range from{' '}
          <span className="font-semibold text-emerald-400">{priceFormatter.format(min)}</span>
          {' '}to{' '}
          <span className="font-semibold text-amber-400">{priceFormatter.format(max)}</span>
        </p>
        <div className="flex items-center gap-2">
          {avg > 5000 ? (
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <TrendingUp className="h-3 w-3" /> Prices rising for this period
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <TrendingDown className="h-3 w-3" /> Great prices available
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
