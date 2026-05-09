import { useMemo } from 'react'
import { Plane, Clock, DollarSign, Award, TrendingDown, TrendingUp, Zap, BarChart3 } from 'lucide-react'
import type { FlightOption } from '../../types/flight'
import { FlightCard } from './FlightCard'
import { computeFlightBadges } from '../../utils/flightIntelligence'

interface FlightResultsGridProps {
  results: FlightOption[]
  onSelectFlight?: (flight: FlightOption) => void
  selectedFlightId?: string
  isRoundTrip?: boolean
}

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function FlightResultsGrid({ results, onSelectFlight, selectedFlightId, isRoundTrip }: FlightResultsGridProps) {
  // Compute badges dynamically from the data
  const badgeMap = useMemo(() => computeFlightBadges(results), [results])

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

  // Get price stats for header highlights
  const prices = results.map((r) => r.price.total)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
  const fastestFlight = results.reduce((a, b) =>
    a.totalDurationMinutes < b.totalDurationMinutes ? a : b
  )
  const bestValueFlight = results.find((f) => badgeMap[f.id]?.includes('best-value'))

  // Determine price trend direction
  const trendLabel = avgPrice > minPrice * 1.4 ? 'rising' : avgPrice < minPrice * 1.15 ? 'stable' : 'moderate'

  // Count Patro Airlines flights
  const patroFlight = results.find((f) => f.segments[0]?.marketingCarrierCode === 'PT')

  return (
    <section
      aria-label="Flight search results"
      className="flex-1"
    >
      {/* Results header */}
      <div className="glass rounded-2xl p-4 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-400">
              Best options for your route
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Viewing {results.length} curated options · {isRoundTrip ? 'Prices shown are for this leg only' : 'All prices include taxes & fees'}
            </p>
          </div>

          {/* Quick highlights */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-300">
                Lowest from <span className="font-bold">{formatter.format(minPrice)}</span>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-950/30 border border-sky-500/20">
              <Clock className="h-4 w-4 text-sky-400" />
              <span className="text-xs text-sky-300">
                Fastest {Math.floor(fastestFlight.totalDurationMinutes / 60)}h {fastestFlight.totalDurationMinutes % 60}m
              </span>
            </div>
            {/* Price Trend Indicator */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              trendLabel === 'rising'
                ? 'bg-amber-950/30 border-amber-500/20'
                : trendLabel === 'stable'
                  ? 'bg-emerald-950/30 border-emerald-500/20'
                  : 'bg-slate-800/50 border-slate-700/30'
            }`}>
              {trendLabel === 'rising' ? (
                <TrendingUp className="h-4 w-4 text-amber-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-emerald-400" />
              )}
              <span className={`text-xs ${trendLabel === 'rising' ? 'text-amber-300' : 'text-emerald-300'}`}>
                {trendLabel === 'rising' ? 'Prices trending up' : trendLabel === 'stable' ? 'Great prices today' : 'Average pricing'}
              </span>
            </div>
          </div>
        </div>

        {/* Intelligent recommendation badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800/50">
          <span className="text-xs text-slate-500 mr-1">Smart picks:</span>

          {/* Cheapest pill */}
          {results.filter((f) => badgeMap[f.id]?.includes('cheapest')).map((flight) => (
            <div
              key={`cheap-${flight.id}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60 transition-colors cursor-default"
            >
              <TrendingDown className="h-3 w-3" />
              {flight.segments[0]?.marketingCarrier} · {formatter.format(flight.price.total)}
              <span className="text-emerald-400/70 ml-0.5">Cheapest</span>
            </div>
          ))}

          {/* Fastest pill */}
          {results.filter((f) => badgeMap[f.id]?.includes('fastest') && !badgeMap[f.id]?.includes('cheapest')).map((flight) => (
            <div
              key={`fast-${flight.id}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-950/40 text-sky-300 hover:bg-sky-950/60 transition-colors cursor-default"
            >
              <Zap className="h-3 w-3" />
              {flight.segments[0]?.marketingCarrier} · {Math.floor(flight.totalDurationMinutes / 60)}h {flight.totalDurationMinutes % 60}m
              <span className="text-sky-400/70 ml-0.5">Fastest</span>
            </div>
          ))}

          {/* Best Value pill */}
          {bestValueFlight && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-950/40 text-violet-300 hover:bg-violet-950/60 transition-colors cursor-default">
              <Award className="h-3 w-3" />
              {bestValueFlight.segments[0]?.marketingCarrier} · {formatter.format(bestValueFlight.price.total)}
              <span className="text-violet-400/70 ml-0.5">Best Value</span>
            </div>
          )}

          {/* Patro Recommended pill */}
          {patroFlight && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-sky-950/40 to-emerald-950/40 text-sky-300 hover:from-sky-950/60 hover:to-emerald-950/60 transition-colors cursor-default ring-1 ring-sky-500/20">
              <BarChart3 className="h-3 w-3" />
              Patro Airlines · {formatter.format(patroFlight.price.total)}
              <span className="text-emerald-400/70 ml-0.5">Recommended</span>
            </div>
          )}
        </div>
      </div>

      {/* Flight cards */}
      <div className="space-y-4">
        {results.map((flight, idx) => (
          <div
            key={flight.id}
            className="animate-fade-in"
            style={{ animationDelay: `${0.05 * Math.min(idx, 10)}s` }}
          >
            <FlightCard
              flight={flight}
              badges={badgeMap[flight.id] ?? []}
              onSelect={onSelectFlight}
              isSelected={selectedFlightId === flight.id}
            />
          </div>
        ))}
      </div>

      {/* Results footer */}
      <div className="glass rounded-2xl p-4 mt-4 text-center">
        <p className="text-sm text-slate-400">
          Showing all {results.length} results · Prices and availability may change
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Price range: {formatter.format(minPrice)} – {formatter.format(maxPrice)} · Average: {formatter.format(avgPrice)}
        </p>
      </div>
    </section>
  )
}
