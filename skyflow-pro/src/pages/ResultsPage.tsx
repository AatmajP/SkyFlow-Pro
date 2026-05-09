import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Filter, Plane, RefreshCw, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { FlightResultsGrid } from '../components/results/FlightResultsGrid'
import { PriceTimeline } from '../components/search/PriceTimeline'
import { SmartTravelInsights } from '../components/results/SmartTravelInsights'
import { MainFooter } from '../components/ui/MainFooter'
import { useFlightSearch } from '../hooks/useFlightSearch'
import { useState, useMemo } from 'react'
import { AIRPORTS } from '../mocks/mockSearchResults'
import type { FlightOption } from '../types/flight'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '../context/CurrencyContext'

type SortOption = 'price' | 'duration' | 'departure'

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function ResultsPage() {
  const { t, i18n } = useTranslation()
  const { formatPrice } = useCurrency()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const from = params.get('from') ?? 'DEL'
  const to = params.get('to') ?? 'BOM'
  const date = params.get('date') ?? ''
  const returnDate = params.get('return') ?? ''
  const flex = Number(params.get('flex') ?? 3)
  const adults = Number(params.get('adults') ?? 1)
  const cabin = params.get('cabin') ?? 'economy'
  const tripType = params.get('tripType') ?? 'oneway'

  const query = useFlightSearch({ from, to, date, flex, adults, cabin, tripType, returnDate })
  const data = query.data
  const isRoundTrip = data?.tripType === 'roundtrip'

  // Round trip selection state
  const [selectedOutbound, setSelectedOutbound] = useState<FlightOption | null>(null)
  const [selectedReturn, setSelectedReturn] = useState<FlightOption | null>(null)

  // Which leg is the user currently viewing
  const [activeLeg, setActiveLeg] = useState<'outbound' | 'return'>('outbound')

  // Get the correct flight list based on trip type and active leg
  const rawResults = useMemo(() => {
    if (!data) return []
    if (isRoundTrip) {
      return activeLeg === 'outbound'
        ? (data.outboundFlights ?? [])
        : (data.returnFlights ?? [])
    }
    return data.results ?? []
  }, [data, isRoundTrip, activeLeg])

  const [sortBy, setSortBy] = useState<SortOption>('price')
  const [showFilters, setShowFilters] = useState(false)
  const [stopsFilter, setStopsFilter] = useState<string>('any')
  const [airlineFilter, setAirlineFilter] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState<string>('any')
  const [priceFilter, setPriceFilter] = useState<string>('any')

  // Get airport display names
  const fromAirport = AIRPORTS.find((a) => a.code === from)
  const toAirport = AIRPORTS.find((a) => a.code === to)

  // Get unique airlines for filter dropdown
  const uniqueAirlines = useMemo(() => {
    const set = new Set<string>()
    rawResults.forEach((f) => {
      const carrier = f.segments[0]?.marketingCarrier
      if (carrier) set.add(carrier)
    })
    return Array.from(set).sort()
  }, [rawResults])

  // Apply filters and sorting
  const results = useMemo(() => {
    let filtered = [...rawResults]

    // Stops filter
    if (stopsFilter === 'nonstop') {
      filtered = filtered.filter((f) => f.stops === 0)
    } else if (stopsFilter === '1stop') {
      filtered = filtered.filter((f) => f.stops === 1)
    }

    // Airline filter
    if (airlineFilter !== 'all') {
      filtered = filtered.filter((f) => f.segments[0]?.marketingCarrier === airlineFilter)
    }

    // Time filter
    if (timeFilter !== 'any') {
      filtered = filtered.filter((f) => {
        const hour = new Date(f.segments[0]?.departureTime ?? '').getHours()
        if (timeFilter === 'morning') return hour >= 6 && hour < 12
        if (timeFilter === 'afternoon') return hour >= 12 && hour < 18
        if (timeFilter === 'evening') return hour >= 18 || hour < 6
        return true
      })
    }

    // Price filter
    if (priceFilter !== 'any') {
      filtered = filtered.filter((f) => {
        if (priceFilter === 'under5k') return f.price.total < 5000
        if (priceFilter === '5k-10k') return f.price.total >= 5000 && f.price.total <= 10000
        if (priceFilter === 'above10k') return f.price.total > 10000
        return true
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price.total - b.price.total
        case 'duration':
          return a.totalDurationMinutes - b.totalDurationMinutes
        case 'departure':
          return new Date(a.segments[0]?.departureTime ?? '').getTime() -
                 new Date(b.segments[0]?.departureTime ?? '').getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [rawResults, sortBy, stopsFilter, airlineFilter, timeFilter, priceFilter])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return t('search.flexible')
    const d = new Date(dateStr)
    return d.toLocaleDateString(i18n.language, { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const activeFilterCount = [stopsFilter !== 'any', airlineFilter !== 'all', timeFilter !== 'any', priceFilter !== 'any'].filter(Boolean).length

  // Round trip total price
  const roundTripTotal = (selectedOutbound?.price.total ?? 0) + (selectedReturn?.price.total ?? 0)

  // Handle flight selection in round trip mode
  const handleSelectFlight = (flight: FlightOption) => {
    if (!isRoundTrip) return
    if (activeLeg === 'outbound') {
      setSelectedOutbound(flight)
      // Auto-switch to return leg
      setActiveLeg('return')
    } else {
      setSelectedReturn(flight)
    }
  }

  const handleProceedToBooking = () => {
    if (selectedOutbound && selectedReturn) {
      sessionStorage.setItem('selectedFlight', JSON.stringify(selectedOutbound))
      sessionStorage.setItem('returnFlight', JSON.stringify(selectedReturn))
      navigate(`/booking/${selectedOutbound.id}`)
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Background decorations */}
      <div className="fixed top-40 right-10 h-96 w-96 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-10 h-72 w-72 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      <div className="mx-auto flex max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Back button and header */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('results.newSearch')}
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="animate-fade-in">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-400 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
                </span>
                {t('results.liveResults')} {isRoundTrip && `· ${t('results.roundTrip')}`}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl flex items-center gap-3">
                {from}
                <span className="inline-flex items-center gap-1 text-sky-400">
                  {isRoundTrip ? (
                    <ArrowRight className="h-6 w-6" />
                  ) : (
                    <Plane className="h-6 w-6 rotate-90" />
                  )}
                </span>
                {to}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {fromAirport ? `${fromAirport.city}` : from} → {toAirport ? `${toAirport.city}` : to}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {formatDate(date)}
                {isRoundTrip && returnDate && ` — ${formatDate(returnDate)}`}
                {' '}• {adults} traveler{adults > 1 ? 's' : ''} • {cabin.charAt(0).toUpperCase() + cabin.slice(1)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => query.refetch()}
                disabled={query.isLoading}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${query.isLoading ? 'animate-spin' : ''}`} />
                {t('results.refresh')}
              </button>
            </div>
          </div>
        </div>

        {/* Price Timeline Section */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <PriceTimeline 
            from={from} 
            to={to} 
            date={date} 
            cabin={cabin}
            tripType={tripType} 
            onSelectDate={(newDate) => {
              const newParams = new URLSearchParams(params)
              newParams.set('date', newDate)
              navigate({ pathname: '/results', search: newParams.toString() })
            }}
          />
        </div>

        {/* Smart Travel Insights Section */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-sky-400" />
            <h2 className="text-xl font-bold text-slate-100">{t('results.smartInsights')}</h2>
          </div>
          <SmartTravelInsights 
            from={from} 
            to={to} 
            date={date} 
            cabin={cabin} 
            tripType={tripType} 
          />
        </div>

        {/* ── Round Trip Leg Selector ── */}
        {isRoundTrip && (
          <div className="mb-6 animate-fade-in">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-4">
                {/* Outbound tab */}
                <button
                  onClick={() => setActiveLeg('outbound')}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                    activeLeg === 'outbound'
                      ? 'border-sky-500/50 bg-sky-500/10'
                      : 'border-slate-700/40 bg-slate-800/30 hover:bg-slate-800/60'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    selectedOutbound ? 'bg-emerald-500/20' : activeLeg === 'outbound' ? 'bg-sky-500/20' : 'bg-slate-800'
                  }`}>
                    {selectedOutbound ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Plane className="h-5 w-5 text-sky-400 -rotate-45" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('results.outbound')}</p>
                    <p className="text-sm font-semibold text-slate-200">
                      {from} → {to} · {formatDate(date)}
                    </p>
                    {selectedOutbound && (
                      <p className="text-xs text-emerald-400 mt-0.5">
                        {selectedOutbound.segments[0]?.marketingCarrier} · {formatter.format(selectedOutbound.price.total)}
                      </p>
                    )}
                  </div>
                </button>

                {/* Return tab */}
                <button
                  onClick={() => setActiveLeg('return')}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                    activeLeg === 'return'
                      ? 'border-sky-500/50 bg-sky-500/10'
                      : 'border-slate-700/40 bg-slate-800/30 hover:bg-slate-800/60'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    selectedReturn ? 'bg-emerald-500/20' : activeLeg === 'return' ? 'bg-sky-500/20' : 'bg-slate-800'
                  }`}>
                    {selectedReturn ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Plane className="h-5 w-5 text-purple-400 rotate-[135deg]" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('results.return')}</p>
                    <p className="text-sm font-semibold text-slate-200">
                      {to} → {from} · {formatDate(returnDate)}
                    </p>
                    {selectedReturn && (
                      <p className="text-xs text-emerald-400 mt-0.5">
                        {selectedReturn.segments[0]?.marketingCarrier} · {formatter.format(selectedReturn.price.total)}
                      </p>
                    )}
                  </div>
                </button>
              </div>

              {/* Total price when both are selected */}
              {selectedOutbound && selectedReturn && (
                <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between animate-fade-in">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">{t('results.total')}</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatPrice(roundTripTotal)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatPrice(selectedOutbound.price.total)} {t('results.outbound').toLowerCase()} + {formatPrice(selectedReturn.price.total)} {t('results.return').toLowerCase()}
                    </p>
                  </div>
                  <button 
                    onClick={handleProceedToBooking}
                    className="btn-primary flex items-center gap-2"
                  >
                    {t('results.proceed')}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filters and Sort Bar */}
        <div className="mb-6 glass rounded-2xl p-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center gap-2 ${showFilters ? 'ring-1 ring-sky-500/50' : ''}`}
              >
                <Filter className="h-4 w-4" />
                {t('results.filters')}
                {activeFilterCount > 0 && (
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-sky-500 text-white text-[0.6rem] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Quick filters */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setStopsFilter(stopsFilter === 'nonstop' ? 'any' : 'nonstop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    stopsFilter === 'nonstop'
                      ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t('results.nonStopOnly')}
                </button>
                <button
                  onClick={() => setTimeFilter(timeFilter === 'morning' ? 'any' : 'morning')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    timeFilter === 'morning'
                      ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t('results.morningFlights')}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{t('results.sortBy')}:</span>
              <div className="flex items-center gap-1 rounded-xl bg-slate-900/80 p-1">
                {(['price', 'duration', 'departure'] as SortOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${sortBy === option
                        ? 'bg-sky-500 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {t(`results.sort.${option}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">{t('results.stops')}</label>
                <select
                  value={stopsFilter}
                  onChange={(e) => setStopsFilter(e.target.value)}
                  className="input-premium text-sm py-2"
                >
                  <option value="any">{t('results.any')}</option>
                  <option value="nonstop">{t('results.nonstop')}</option>
                  <option value="1stop">{t('results.oneStop')}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">{t('results.airlines')}</label>
                <select
                  value={airlineFilter}
                  onChange={(e) => setAirlineFilter(e.target.value)}
                  className="input-premium text-sm py-2"
                >
                  <option value="all">{t('results.allAirlines')}</option>
                  {uniqueAirlines.map((airline) => (
                    <option key={airline} value={airline}>{airline}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">{t('results.departureTime')}</label>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="input-premium text-sm py-2"
                >
                  <option value="any">{t('results.anyTime')}</option>
                  <option value="morning">Morning (6AM-12PM)</option>
                  <option value="afternoon">Afternoon (12PM-6PM)</option>
                  <option value="evening">Evening (6PM-6AM)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">{t('results.priceRange')}</label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="input-premium text-sm py-2"
                >
                  <option value="any">{t('results.anyPrice')}</option>
                  <option value="under5k">{t('results.underPrice', { price: formatPrice(5000) })}</option>
                  <option value="5k-10k">{formatPrice(5000)} – {formatPrice(10000)}</option>
                  <option value="above10k">{t('results.abovePrice', { price: formatPrice(10000) })}</option>
                </select>
              </div>

              {/* Reset filters */}
              {activeFilterCount > 0 && (
                <div className="col-span-2 sm:col-span-4">
                  <button
                    onClick={() => {
                      setStopsFilter('any')
                      setAirlineFilter('all')
                      setTimeFilter('any')
                      setPriceFilter('any')
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    {t('results.clearAll')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <main className="flex flex-1 flex-col gap-6" id="main">
          {query.isLoading ? (
            <div className="glass rounded-2xl p-8 text-center animate-fade-in">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-sky-500/10 mb-4">
                <Plane className="h-8 w-8 text-sky-400 animate-pulse" />
              </div>
              <p className="text-lg font-semibold text-slate-50">{t('results.findingFlights')}</p>
              <p className="text-sm text-slate-400 mt-1">
                {t('results.searchingFromTo', { from: fromAirport?.city ?? from, to: toAirport?.city ?? to })}
              </p>
              <div className="mt-6 max-w-xs mx-auto">
                <div className="progress-bar">
                  <div className="progress-bar-fill animate-shimmer" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          ) : query.isError ? (
            <div className="glass rounded-2xl border border-amber-500/30 bg-amber-950/20 p-8 text-center animate-fade-in">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/10 mb-4">
                <RefreshCw className="h-8 w-8 text-amber-400" />
              </div>
              <p className="text-lg font-semibold text-amber-200">
                {t('results.errorTitle')}
              </p>
              <p className="text-sm text-amber-300/70 mt-2 max-w-md mx-auto">
                {t('results.errorDesc')}
              </p>
              <button
                onClick={() => query.refetch()}
                className="mt-6 btn-primary"
              >
                {t('results.tryAgain')}
              </button>
            </div>
          ) : (
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {/* Leg label for round trip */}
              {isRoundTrip && (
                <div className="mb-4 flex items-center gap-2 text-sm">
                  <Plane className={`h-4 w-4 ${activeLeg === 'outbound' ? 'text-sky-400 -rotate-45' : 'text-purple-400 rotate-[135deg]'}`} />
                  <span className="font-semibold text-slate-200">
                    {activeLeg === 'outbound'
                      ? `Outbound: ${fromAirport?.city ?? from} → ${toAirport?.city ?? to}`
                      : `Return: ${toAirport?.city ?? to} → ${fromAirport?.city ?? from}`
                    }
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{formatDate(activeLeg === 'outbound' ? date : returnDate)}</span>
                  {isRoundTrip && (
                    <span className="ml-auto text-xs text-slate-500">
                      {activeLeg === 'outbound' ? t('results.selectOutbound') : t('results.selectReturn')}
                    </span>
                  )}
                </div>
              )}

              {results.length === 0 && rawResults.length > 0 ? (
                <div className="glass rounded-2xl p-8 text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-800/50 mb-4">
                    <Filter className="h-8 w-8 text-slate-500" />
                  </div>
                  <p className="text-lg font-semibold text-slate-200">{t('results.noMatch')}</p>
                  <p className="text-sm text-slate-400 mt-2">
                    {t('results.availableCount', { count: rawResults.length })}
                  </p>
                  <button
                    onClick={() => {
                      setStopsFilter('any')
                      setAirlineFilter('all')
                      setTimeFilter('any')
                      setPriceFilter('any')
                    }}
                    className="mt-4 btn-secondary"
                  >
                    {t('results.clearAll')}
                  </button>
                </div>
              ) : (
                <FlightResultsGrid
                  results={results}
                  onSelectFlight={isRoundTrip ? handleSelectFlight : undefined}
                  selectedFlightId={
                    activeLeg === 'outbound' ? selectedOutbound?.id : selectedReturn?.id
                  }
                  isRoundTrip={isRoundTrip}
                />
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <MainFooter />
      </div>
    </div>
  )
}
