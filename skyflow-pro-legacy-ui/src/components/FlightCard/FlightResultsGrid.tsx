import { Plane, Clock, DollarSign, Star } from 'lucide-react'
import type { FlightOption } from '@/types'
import { FlightCard } from './FlightCard'

interface FlightResultsGridProps {
  results: FlightOption[]
}

export function FlightResultsGrid({ results }: FlightResultsGridProps) {
  if (results.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-800/50 mb-4">
          <Plane className="h-10 w-10 text-slate-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-200">No flights found</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Try adjusting your search criteria or flexible dates to find available flights.
        </p>
      </div>
    )
  }

  const prices = results.map((r) => r.price.total)
  const minPrice = Math.min(...prices)
  const fastestFlight = results.reduce((a, b) =>
    a.totalDurationMinutes < b.totalDurationMinutes ? a : b
  )

  return (
    <section aria-label="Flight search results" className="flex-1">
      <div className="glass rounded-2xl p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-400">
              Best options for your route
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Viewing {results.length} curated options · All prices include taxes & fees
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-300">
                Lowest from <span className="font-bold">${minPrice}</span>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-950/30 border border-sky-500/20">
              <Clock className="h-4 w-4 text-sky-400" />
              <span className="text-xs text-sky-300">
                Fastest {Math.floor(fastestFlight.totalDurationMinutes / 60)}h {fastestFlight.totalDurationMinutes % 60}m
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800/50">
          <span className="text-xs text-slate-500">Recommended:</span>
          {results.map((flight, idx) => {
            if (idx > 2) return null
            const isCheapest = flight.price.total === minPrice
            const isFastest = flight.id === fastestFlight.id

            return (
              <div
                key={flight.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${isCheapest
                    ? 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60'
                    : isFastest
                      ? 'bg-sky-950/40 text-sky-300 hover:bg-sky-950/60'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                  }`}
              >
                {isCheapest && <Star className="h-3 w-3" />}
                {isFastest && !isCheapest && <Clock className="h-3 w-3" />}
                {flight.segments[0]?.marketingCarrierCode} · ${flight.price.total}
                {isCheapest && ' (Best price)'}
                {isFastest && !isCheapest && ' (Fastest)'}
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        {results.map((flight, idx) => (
          <div
            key={flight.id}
            className="animate-fade-in"
            style={{ animationDelay: `${0.1 * idx}s` }}
          >
            <FlightCard flight={flight} />
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-4 mt-4 text-center">
        <p className="text-sm text-slate-400">
          Showing all {results.length} results · Prices and availability may change
        </p>
        <p className="text-xs text-slate-500 mt-1">
          More options loading... Live price polling active
        </p>
      </div>
    </section>
  )
}
