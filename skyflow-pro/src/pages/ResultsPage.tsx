import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Filter, Plane, RefreshCw, Check } from 'lucide-react'
import { FlightResultsGrid } from '../components/results/FlightResultsGrid'
import { useFlightSearch } from '../hooks/useFlightSearch'
import { useState, useMemo, useEffect } from 'react'
import { PostBookingTrust } from '../components/results/PostBookingTrust'

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
    results.forEach(flight => {
      if (flight.segments[0]) {
        airlines.add(flight.segments[0].marketingCarrier)
      }
    })
    return Array.from(airlines).sort()
  }, [results])

  // Filter Logic
  const filteredResults = useMemo(() => {
    let filtered = results.filter(flight => {
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
        if (activeFilters.departureTime === 'Evening (6PM-12AM)' && (hour < 18)) return false
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
    return filtered.sort((a, b) => {
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
  }

  return (
    <div className="relative min-h-screen bg-slate-50">

      <div className="mx-auto flex max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Back button and header */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            New search
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="animate-fade-in">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live Results
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl flex items-center gap-3">
                <span>{from}</span>
                <span className="inline-flex items-center gap-1">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Plane className="h-5 w-5 text-slate-800 rotate-90" />
                  </div>
                </span>
                <span>{to}</span>
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {formatDate(date)} • {adults} traveler{adults > 1 ? 's' : ''} • {cabin.charAt(0).toUpperCase() + cabin.slice(1)}
              </p>
            </div>

            <div className="flex items-center gap-3 animate-hero-reveal" style={{ animationDelay: '0.15s' }}>
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
        <div className="mb-6 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center gap-2 ${showFilters ? 'ring-2 ring-slate-900 bg-slate-50' : ''}`}
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 ml-2 px-3 py-1 rounded-full bg-slate-100">
                  {filteredResults.length} flights found
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Sort by:</span>
              <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1">
                {(['price', 'duration', 'departure'] as SortOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${sortBy === option
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
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
            <div className="mt-5 pt-5 border-t border-slate-100 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Stops', field: 'stops', options: ['Any', 'Non-stop', '1 stop', '2+ stops'],
                  },
                  {
                    label: 'Airlines', field: 'airline', options: ['All airlines', ...availableAirlines],
                  },
                  {
                    label: 'Departure time', field: 'departureTime', options: ['Any time', 'Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-12AM)'],
                  },
                  {
                    label: 'Price range', field: 'priceRange', options: ['Any price', 'Under $300', '$300 - $500', '$500+'],
                  },
                ].map((filter) => (
                  <div key={filter.field} className="group">
                    <label className="text-xs font-bold tracking-wide text-slate-500 block mb-2 uppercase">{filter.label}</label>
                    <select
                      value={(pendingFilters as Record<string, string>)[filter.field]}
                      onChange={(e) => setPendingFilters(prev => ({ ...prev, [filter.field]: e.target.value }))}
                      className="input-cinematic text-sm"
                    >
                      {filter.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleApplyFilters}
                  className="btn-primary py-2.5 px-6 flex items-center gap-2"
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
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5 sticky top-24 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <PostBookingTrust />
            </div>
          </div>

          {/* Results */}
          <main className="lg:col-span-3 flex flex-1 flex-col gap-6" id="main">
            {query.isLoading ? (
              <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-10 text-center animate-fade-in">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-5">
                  <Plane className="h-10 w-10 text-slate-800 animate-pulse" />
                </div>
                <p className="text-xl font-bold text-slate-900">Finding the best flights...</p>
                <p className="text-sm font-medium text-slate-500 mt-2">Searching 500+ airlines for the lowest fares</p>
                <div className="mt-8 max-w-xs mx-auto">
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-slate-800 animate-shimmer w-[60%]" />
                  </div>
                </div>
              </div>
            ) : query.isError ? (
              <div className="bg-white border border-rose-200 rounded-3xl p-10 text-center animate-fade-in">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-rose-50 mb-5">
                  <RefreshCw className="h-10 w-10 text-rose-500" />
                </div>
                <p className="text-xl font-bold text-slate-900">
                  We couldn't fetch fresh inventory right now
                </p>
                <p className="text-sm text-slate-500 font-medium mt-2 max-w-md mx-auto">
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
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center animate-fade-in">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-50 mb-5">
                  <Filter className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-xl font-bold text-slate-900">No flights found</p>
                <p className="text-sm text-slate-500 font-medium mt-2">Try adjusting your filters to see more results.</p>
                <button
                  onClick={() => {
                    setActiveFilters({
                      stops: 'Any',
                      airline: 'All airlines',
                      departureTime: 'Any time',
                      priceRange: 'Any price'
                    })
                    setPendingFilters({
                      stops: 'Any',
                      airline: 'All airlines',
                      departureTime: 'Any time',
                      priceRange: 'Any price'
                    })
                  }}
                  className="mt-6 text-slate-800 hover:text-black hover:underline text-sm font-bold transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="animate-stagger-up" style={{ animationDelay: '0.2s' }}>
                <FlightResultsGrid results={filteredResults} />
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="mt-10 border-t border-slate-200 pt-6 lg:col-span-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-medium text-slate-500">
              <p>All prices include mandatory taxes & carrier fees. No checkout surprises.</p>
              <p>Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
