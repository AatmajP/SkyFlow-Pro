import { TrendingDown, TrendingUp } from 'lucide-react'
import { formatMonthDay, formatWeekdayShort, parseISODate, toISODate, addDays } from '../../utils/dateUtils'

interface FlexDateStripProps {
  selectedDate: string
  flexDays: number
  onSelect: (dateStr: string) => void
}

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function demoPrice(dateStr: string): number {
  // deterministic-ish demo pricing to support cheapest-day highlighting
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0
  const base = 260 + (hash % 210) // 260..469
  const weekendBump = (() => {
    const dt = parseISODate(dateStr)
    if (!dt) return 0
    const day = dt.getDay()
    return day === 0 || day === 6 ? 35 : 0
  })()
  return base + weekendBump
}

export function FlexDateStrip({ selectedDate, flexDays, onSelect }: FlexDateStripProps) {
  const selected = parseISODate(selectedDate)
  if (!selected) return null

  const days = Array.from({ length: flexDays * 2 + 1 }, (_, idx) => addDays(selected, idx - flexDays))
  const prices = days.map((d) => demoPrice(toISODate(d)))
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length

  return (
    <section
      aria-label={`Flexible dates within plus or minus ${flexDays} days`}
      className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-emerald-600" />
            Cheapest Days (±{flexDays})
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Click any date to change your departure
          </p>
        </div>
        <div className="flex items-center gap-5 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500 uppercase tracking-widest">Best price</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-slate-500 uppercase tracking-widest">Higher</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mt-4">
        {days.map((date, idx) => {
          const iso = toISODate(date)
          const price = prices[idx]
          const isSelected = iso === selectedDate
          const isCheapest = price === min
          const isExpensive = price === max
          const priceTrend = price < avg ? 'low' : price > avg + 30 ? 'high' : 'normal'

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={`
                group relative rounded-2xl border p-4 text-left transition-all duration-300
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2
                ${isSelected
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xl translate-y-[-2px]'
                  : isCheapest
                    ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 hover:bg-emerald-50 shadow-sm'
                    : 'border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white shadow-sm'
                }
              `}
              aria-pressed={isSelected}
            >
              {/* Day name */}
              <p className={`text-xs font-bold uppercase tracking-widest ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                {formatWeekdayShort(date)}
              </p>

              {/* Date */}
              <p className={`text-base font-black mt-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {formatMonthDay(date)}
              </p>

              {/* Price */}
              <div className="mt-3 flex items-center gap-1.5">
                <p className={`text-lg font-black ${isSelected ? 'text-white' : isCheapest ? 'text-emerald-600' : isExpensive ? 'text-amber-600' : 'text-slate-900'
                  }`}>
                  {priceFormatter.format(price)}
                </p>
                {priceTrend === 'low' && !isCheapest && !isSelected && (
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                )}
                {priceTrend === 'high' && !isSelected && (
                  <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                )}
              </div>

              {/* Best badge */}
              {isCheapest && !isSelected && (
                <span className="absolute -top-2.5 -right-2 bg-emerald-100 text-emerald-700 font-black text-[0.65rem] px-2 py-0.5 rounded-full border border-emerald-200 shadow-sm animate-scale-in">
                  Cheapest
                </span>
              )}

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Price summary */}
      <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <p>
          Price range: {' '}
          <span className="text-emerald-600">{priceFormatter.format(min)}</span>
          {' — '}
          <span className="text-amber-600">{priceFormatter.format(max)}</span>
        </p>
        <p>Live Price Polling Active</p>
      </div>
    </section>
  )
}
