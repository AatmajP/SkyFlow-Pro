import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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

import { useCurrency } from '../../context/CurrencyContext'

export function FlightResultsGrid({ results, onSelectFlight, selectedFlightId, isRoundTrip }: FlightResultsGridProps) {
  const { t } = useTranslation()
  const { formatPrice } = useCurrency()
  // Compute badges dynamically from the data
  const badgeMap = useMemo(() => computeFlightBadges(results), [results])

  if (results.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-800/50 mb-4">
          <Plane className="h-10 w-10 text-slate-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-200">{t('results.noFlightsTitle')}</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          {t('results.noFlightsDesc')}
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
              {t('results.bestOptions')}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {t('results.viewingCount', { count: results.length })} · {isRoundTrip ? t('results.legPrices') : t('results.allInclusive')}
            </p>
          </div>

          {/* Quick highlights */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-300">
                {t('results.lowestFrom')} <span className="font-bold">{formatPrice(minPrice)}</span>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-950/30 border border-sky-500/20">
              <Clock className="h-4 w-4 text-sky-400" />
              <span className="text-xs text-sky-300">
                {t('results.fastest')} {t('common.duration', { h: Math.floor(fastestFlight.totalDurationMinutes / 60), m: fastestFlight.totalDurationMinutes % 60 })}
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
                {trendLabel === 'rising' ? t('results.trend.rising') : trendLabel === 'stable' ? t('results.trend.stable') : t('results.trend.average')}
              </span>
            </div>
          </div>
        </div>

        {/* Intelligent recommendation badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800/50">
          <span className="text-xs text-slate-500 mr-1">{t('results.smartPicks')}:</span>

          {/* Cheapest pill */}
          {results.filter((f) => badgeMap[f.id]?.includes('cheapest')).map((flight) => (
            <div
              key={`cheap-${flight.id}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60 transition-colors cursor-default"
            >
              <TrendingDown className="h-3 w-3" />
              {flight.segments[0]?.marketingCarrier} · {formatPrice(flight.price.total)}
              <span className="text-emerald-400/70 ml-0.5">{t('results.badges.cheapest')}</span>
            </div>
          ))}

          {/* Fastest pill */}
          {results.filter((f) => badgeMap[f.id]?.includes('fastest') && !badgeMap[f.id]?.includes('cheapest')).map((flight) => (
            <div
              key={`fast-${flight.id}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-950/40 text-sky-300 hover:bg-sky-950/60 transition-colors cursor-default"
            >
              <Zap className="h-3 w-3" />
              {flight.segments[0]?.marketingCarrier} · {t('common.duration', { h: Math.floor(flight.totalDurationMinutes / 60), m: flight.totalDurationMinutes % 60 })}
              <span className="text-sky-400/70 ml-0.5">{t('results.badges.fastest')}</span>
            </div>
          ))}

          {/* Best Value pill */}
          {bestValueFlight && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-950/40 text-violet-300 hover:bg-violet-950/60 transition-colors cursor-default">
              <Award className="h-3 w-3" />
              {bestValueFlight.segments[0]?.marketingCarrier} · {formatPrice(bestValueFlight.price.total)}
              <span className="text-violet-400/70 ml-0.5">{t('results.badges.bestValue')}</span>
            </div>
          )}

          {/* Patro Recommended pill */}
          {patroFlight && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-sky-950/40 to-emerald-950/40 text-sky-300 hover:from-sky-950/60 hover:to-emerald-950/60 transition-colors cursor-default ring-1 ring-sky-500/20">
              <BarChart3 className="h-3 w-3" />
              Patro Airlines · {formatPrice(patroFlight.price.total)}
              <span className="text-emerald-400/70 ml-0.5">{t('results.badges.recommended')}</span>
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
          {t('results.showingAllCount', { count: results.length })} · {t('results.priceAvailability')}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {t('results.priceSummary', { min: formatPrice(minPrice), max: formatPrice(maxPrice), avg: formatPrice(avgPrice) })}
        </p>
      </div>
    </section>
  )
}
