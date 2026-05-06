import { Plane, Clock, Star, TrendingDown } from 'lucide-react'
import type { FlightOption } from '../../types/flight'
import { FlightCard } from './FlightCard'

interface FlightResultsGridProps {
  results: FlightOption[]
}

export function FlightResultsGrid({ results }: FlightResultsGridProps) {
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-slate-50 border border-slate-100 mb-6 shadow-sm">
          <Plane className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">No flights found</h3>
        <p className="text-sm font-medium text-slate-500 mt-2 max-w-md mx-auto">
          Try adjusting your search criteria or flexible dates to find available flights.
        </p>
      </div>
    )
  }

  // Get price stats for highlighting
  const prices = results.map((r) => r.price.total)
  const minPrice = Math.min(...prices)
  const fastestFlight = results.reduce((a, b) =>
    a.totalDurationMinutes < b.totalDurationMinutes ? a : b
  )

  return (
    <section
      aria-label="Flight search results"
      className="flex-1"
    >
      {/* Results header */}
      <div className="bg-white rounded-3xl p-6 mb-6 border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Best options for your route
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-900">
              Viewing {results.length} curated options <span className="text-slate-300">•</span> <span className="font-medium text-slate-500">All prices include taxes & fees</span>
            </p>
          </div>

          {/* Quick highlights */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm">
              <TrendingDown className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-emerald-700 font-bold">
                Lowest from <span className="font-black text-emerald-900">${minPrice}</span>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-sky-50 border border-sky-100 shadow-sm">
              <Clock className="h-4 w-4 text-sky-600" />
              <span className="text-xs text-sky-700 font-bold">
                Fastest <span className="font-black text-sky-900">{Math.floor(fastestFlight.totalDurationMinutes / 60)}h {fastestFlight.totalDurationMinutes % 60}m</span>
              </span>
            </div>
          </div>
        </div>

        {/* Recommendation badges */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Recommended:</span>
          {results.map((flight, idx) => {
            if (idx > 2) return null
            const isCheapest = flight.price.total === minPrice
            const isFastest = flight.id === fastestFlight.id

            return (
              <div
                key={flight.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-sm ${isCheapest
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    : isFastest
                      ? 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
              >
                {isCheapest && <Star className="h-3.5 w-3.5 text-emerald-500" />}
                {isFastest && !isCheapest && <Clock className="h-3.5 w-3.5 text-sky-500" />}
                {flight.segments[0]?.marketingCarrierCode} · ${flight.price.total}
                {isCheapest && ' (Best price)'}
                {isFastest && !isCheapest && ' (Fastest)'}
              </div>
            )
          })}
        </div>
      </div>

      {/* Flight cards */}
      <div className="space-y-4">
        {results.map((flight, idx) => (
          <div
            key={flight.id}
            className="animate-stagger-up"
            style={{ animationDelay: `${0.08 * idx}s` }}
          >
            <FlightCard flight={flight} />
          </div>
        ))}
      </div>

      {/* Results footer */}
      <div className="bg-slate-100 rounded-3xl p-6 mt-6 text-center border border-slate-200">
        <p className="text-sm font-medium text-slate-600">
          Showing all {results.length} results · Prices and availability may change
        </p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">
            Live price polling active
          </p>
        </div>
      </div>
    </section>
  )
}
