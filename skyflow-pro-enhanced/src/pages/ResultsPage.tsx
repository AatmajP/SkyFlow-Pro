import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Filter, Plane, RefreshCw } from 'lucide-react'
import { FlightResultsGrid } from '../components/results/FlightResultsGrid'
import { useFlightSearch } from '../hooks/useFlightSearch'
import { useState, useMemo } from 'react'
import type { FlightOption } from '../types/flight'
import { AIRPORTS } from '../mocks/mockSearchResults'

type SortOption = 'price' | 'duration' | 'departure'

export function ResultsPage() {
  const [params] = useSearchParams()
  const from = params.get('from') ?? 'DEL'
  const to = params.get('to') ?? 'BOM'
  const date = params.get('date') ?? ''
  const flex = Number(params.get('flex') ?? 3)
  const adults = Number(params.get('adults') ?? 1)
  const cabin = params.get('cabin') ?? 'economy'

  const query = useFlightSearch({ from, to, date, flex, adults, cabin })
  const rawResults = query.data?.results ?? []

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
    if (!dateStr) return 'Flexible dates'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const activeFilterCount = [stopsFilter !== 'any', airlineFilter !== 'all', timeFilter !== 'any', priceFilter !== 'any'].filter(Boolean).length

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
            New search
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="animate-fade-in">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-400 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
                </span>
                Live Results
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl flex items-center gap-3">
                {from}
                <span className="inline-flex items-center gap-1 text-sky-400">
                  <Plane className="h-6 w-6 rotate-90" />
                </span>
                {to}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {fromAirport ? `${fromAirport.city}` : from} → {toAirport ? `${toAirport.city}` : to}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {formatDate(date)} • {adults} traveler{adults > 1 ? 's' : ''} • {cabin.charAt(0).toUpperCase() + cabin.slice(1)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => query.refetch()}
                disabled={query.isLoading}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${query.isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Sort Bar */}
        <div className="mb-6 glass rounded-2xl p-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center gap-2 ${showFilters ? 'ring-1 ring-sky-500/50' : ''}`}
              >
                <Filter className="h-4 w-4" />
                Filters
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
                  Non-stop only
                </button>
                <button
                  onClick={() => setTimeFilter(timeFilter === 'morning' ? 'any' : 'morning')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    timeFilter === 'morning'
                      ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Morning flights
                </button>
                <button
                  onClick={() => {
                    const isActive = airlineFilter === 'Patro Airlines'
                    setAirlineFilter(isActive ? 'all' : 'Patro Airlines')
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    airlineFilter === 'Patro Airlines'
                      ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Patro Airlines
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Sort by:</span>
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
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">Stops</label>
                <select
                  value={stopsFilter}
                  onChange={(e) => setStopsFilter(e.target.value)}
                  className="input-premium text-sm py-2"
                >
                  <option value="any">Any</option>
                  <option value="nonstop">Non-stop</option>
                  <option value="1stop">1 stop</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">Airlines</label>
                <select
                  value={airlineFilter}
                  onChange={(e) => setAirlineFilter(e.target.value)}
                  className="input-premium text-sm py-2"
                >
                  <option value="all">All airlines</option>
                  {uniqueAirlines.map((airline) => (
                    <option key={airline} value={airline}>{airline}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">Departure time</label>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="input-premium text-sm py-2"
                >
                  <option value="any">Any time</option>
                  <option value="morning">Morning (6AM-12PM)</option>
                  <option value="afternoon">Afternoon (12PM-6PM)</option>
                  <option value="evening">Evening (6PM-6AM)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">Price range</label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="input-premium text-sm py-2"
                >
                  <option value="any">Any price</option>
                  <option value="under5k">Under ₹5,000</option>
                  <option value="5k-10k">₹5,000 – ₹10,000</option>
                  <option value="above10k">Above ₹10,000</option>
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
                    Clear all filters
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
              <p className="text-lg font-semibold text-slate-50">Finding the best flights...</p>
              <p className="text-sm text-slate-400 mt-1">
                Searching {fromAirport?.city ?? from} to {toAirport?.city ?? to}
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
                We couldn't fetch fresh inventory right now
              </p>
              <p className="text-sm text-amber-300/70 mt-2 max-w-md mx-auto">
                Try again in a moment. If this keeps happening, we'll fall back to cached results.
              </p>
              <button
                onClick={() => query.refetch()}
                className="mt-6 btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {results.length === 0 && rawResults.length > 0 ? (
                <div className="glass rounded-2xl p-8 text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-800/50 mb-4">
                    <Filter className="h-8 w-8 text-slate-500" />
                  </div>
                  <p className="text-lg font-semibold text-slate-200">No flights match your filters</p>
                  <p className="text-sm text-slate-400 mt-2">
                    {rawResults.length} flights available. Try adjusting your filters.
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
                    Clear all filters
                  </button>
                </div>
              ) : (
                <FlightResultsGrid results={results} />
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-800/50 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <p>All prices include mandatory taxes & carrier fees. No checkout surprises.</p>
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
