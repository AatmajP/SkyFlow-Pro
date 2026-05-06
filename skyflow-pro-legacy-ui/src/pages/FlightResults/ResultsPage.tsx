import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Filter, Plane, RefreshCw, Check } from 'lucide-react'
import { FlightResultsGrid } from '@/components/features/flights/results'
import { useFlightSearch } from '@/hooks'
import { useState, useMemo, useEffect } from 'react'
import { PostBookingTrust } from '@/components/features/flights/results'

type SortOption = 'price' | 'duration' | 'departure' | 'arrival'

export function ResultsPage() {
  const [params] = useSearchParams()
  const from = params.get('from') ?? 'JFK'
  const to = params.get('to') ?? 'LAX'
  const date = params.get('date') ?? ''
  const flex = Number(params.get('flex') ?? 3)
  const adults = Number(params.get('adults') ?? 1)
  const cabin = params.get('cabin') ?? 'economy'

  const query = useFlightSearch({ from, to, date, flex, adults, cabin })
  const results = query.data?.results ?? []

  const [sortBy, setSortBy] = useState<SortOption>('price')
  const [showFilters, setShowFilters] = useState(false)

  // Filter States
  const [activeFilters, setActiveFilters] = useState({
    stops: 'Any',
    airline: 'All airlines',
    departureTime: 'Any time',
    priceRange: 'Any price'
  })

  // Pending filters (what the user is selecting before clicking Apply)
  const [pendingFilters, setPendingFilters] = useState(activeFilters)

  // Reset pending filters when opening filter panel
  useEffect(() => {
    if (showFilters) {
      setPendingFilters(activeFilters)
    }
  }, [showFilters, activeFilters])

  // Get unique airlines from results
  const availableAirlines = useMemo(() => {
    const airlines = new Set<string>()
    results.forEach((flight: { segments: { marketingCarrier: string }[] }) => {
      if (flight.segments[0]) {
        airlines.add(flight.segments[0].marketingCarrier)
      }
    })
    return Array.from(airlines).sort()
  }, [results])

  // Filter Logic
  const filteredResults = useMemo(() => {
    let filtered = results.filter((flight: { stops: number; segments: { marketingCarrier: string; departureTime: string }[]; price: { total: number } }) => {
      // Stops
      if (activeFilters.stops !== 'Any') {
        if (activeFilters.stops === 'Non-stop' && flight.stops !== 0) return false
        if (activeFilters.stops === '1 stop' && flight.stops !== 1) return false
        if (activeFilters.stops === '2+ stops' && flight.stops < 2) return false
      }

      // Airline
      if (activeFilters.airline !== 'All airlines') {
        if (flight.segments[0].marketingCarrier !== activeFilters.airline) return false
      }

      // Departure Time
      if (activeFilters.departureTime !== 'Any time') {
        const hour = new Date(flight.segments[0].departureTime).getHours()
        if (activeFilters.departureTime === 'Morning (6AM-12PM)' && (hour < 6 || hour >= 12)) return false
        if (activeFilters.departureTime === 'Afternoon (12PM-6PM)' && (hour < 12 || hour >= 18)) return false
        if (activeFilters.departureTime === 'Evening (6PM-12AM)' && (hour < 18)) return false // Covers 18-24. 
        // Note: Midnight handling logic simplistic but sufficient for demo
      }

      // Price Range
      if (activeFilters.priceRange !== 'Any price') {
        const price = flight.price.total
        if (activeFilters.priceRange === 'Under $300' && price >= 300) return false
        if (activeFilters.priceRange === '$300 - $500' && (price < 300 || price > 500)) return false
        if (activeFilters.priceRange === '$500+' && price <= 500) return false
      }

      return true
    })

    // Sort Logic
    return filtered.sort((a: { price: { total: number }; totalDurationMinutes: number; segments: { departureTime: string; arrivalTime: string }[] }, b: { price: { total: number }; totalDurationMinutes: number; segments: { departureTime: string; arrivalTime: string }[] }) => {
      switch (sortBy) {
        case 'price': return a.price.total - b.price.total
        case 'duration': return a.totalDurationMinutes - b.totalDurationMinutes
        case 'departure': return new Date(a.segments[0].departureTime).getTime() - new Date(b.segments[0].departureTime).getTime()
        case 'arrival': return new Date(a.segments[a.segments.length - 1].arrivalTime).getTime() - new Date(b.segments[b.segments.length - 1].arrivalTime).getTime()
        default: return 0
      }
    })
  }, [results, activeFilters, sortBy])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Flexible dates'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const handleApplyFilters = () => {
    setActiveFilters(pendingFilters)
    // Optional: setShowFilters(false) // Keep it open or close? User usually expects feedback. Let's keep it open but maybe show a toast?
    // User requested "add button where it should apply all filters".
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
              <p className="mt-2 text-sm text-slate-400">
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
              </button>

              {/* Quick filters - Apply immediately or to pending? Let's make them shortcuts to standard filters 
                  For now, I'll remove them or make them just toggle the main filters for consistency with "Apply" button requirement.
                  Or I can force apply them. I'll make them immediately update activeFilters for convenience.
              */}
              <div className="hidden sm:flex items-center gap-2">
                {/* Simplified quick filters for now to avoid confusion with the Apply button paradigm */}
                <span className="text-xs text-slate-500 ml-2">
                  {filteredResults.length} flights found
                </span>
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
            <div className="mt-4 pt-4 border-t border-slate-800/50 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-2">Stops</label>
                  <select
                    value={pendingFilters.stops}
                    onChange={(e) => setPendingFilters(prev => ({ ...prev, stops: e.target.value }))}
                    className="input-premium text-sm py-2"
                  >
                    <option>Any</option>
                    <option>Non-stop</option>
                    <option>1 stop</option>
                    <option>2+ stops</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-2">Airlines</label>
                  <select
                    value={pendingFilters.airline}
                    onChange={(e) => setPendingFilters(prev => ({ ...prev, airline: e.target.value }))}
                    className="input-premium text-sm py-2"
                  >
                    <option>All airlines</option>
                    {availableAirlines.map(airline => (
                      <option key={airline} value={airline}>{airline}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-2">Departure time</label>
                  <select
                    value={pendingFilters.departureTime}
                    onChange={(e) => setPendingFilters(prev => ({ ...prev, departureTime: e.target.value }))}
                    className="input-premium text-sm py-2"
                  >
                    <option>Any time</option>
                    <option>Morning (6AM-12PM)</option>
                    <option>Afternoon (12PM-6PM)</option>
                    <option>Evening (6PM-12AM)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-2">Price range</label>
                  <select
                    value={pendingFilters.priceRange}
                    onChange={(e) => setPendingFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="input-premium text-sm py-2"
                  >
                    <option>Any price</option>
                    <option>Under $300</option>
                    <option>$300 - $500</option>
                    <option>$500+</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleApplyFilters}
                  className="btn-primary py-2 px-6 flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="glass rounded-2xl p-4 sticky top-24 transform transition-all hover:scale-[1.02]">
              <PostBookingTrust />
            </div>
          </div>

          {/* Results */}
          <main className="lg:col-span-3 flex flex-1 flex-col gap-6" id="main">
            {query.isLoading ? (
              <div className="glass rounded-2xl p-8 text-center animate-fade-in">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-sky-500/10 mb-4">
                  <Plane className="h-8 w-8 text-sky-400 animate-pulse" />
                </div>
                <p className="text-lg font-semibold text-slate-50">Finding the best flights...</p>
                <p className="text-sm text-slate-400 mt-1">Searching 500+ airlines for the lowest fares</p>
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
            ) : filteredResults.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center animate-fade-in">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-800 mb-4">
                  <Filter className="h-8 w-8 text-slate-500" />
                </div>
                <p className="text-lg font-semibold text-slate-50">No flights found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your filters to see more results.</p>
                <button
                  onClick={() => {
                    setActiveFilters({
                      stops: 'Any',
                      airline: 'All airlines',
                      departureTime: 'Any time',
                      priceRange: 'Any price'
                    })
                    // Also reset pending
                    setPendingFilters({
                      stops: 'Any',
                      airline: 'All airlines',
                      departureTime: 'Any time',
                      priceRange: 'Any price'
                    })
                  }}
                  className="mt-4 text-sky-400 hover:text-sky-300 text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <FlightResultsGrid results={filteredResults} />
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
    </div>
  )
}
