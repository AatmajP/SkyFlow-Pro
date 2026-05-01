import { Search, ArrowRightLeft, Calendar, Users, Briefcase, Info, MapPin } from 'lucide-react'
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlexDateStrip } from '../calendar/FlexDateStrip'
import { AIRPORTS } from '../../mocks/mockSearchResults'

type TripType = 'oneway' | 'roundtrip' | 'multicity'
type CabinClass = 'economy' | 'premium' | 'business' | 'first'

interface GlobalSearchForm {
  from: string
  to: string
  departureDate: string
  returnDate: string
  tripType: TripType
  passengers: number
  cabin: CabinClass
  flexDays: number
}

const cabinLabels: Record<CabinClass, string> = {
  economy: 'Economy',
  premium: 'Premium Economy',
  business: 'Business',
  first: 'First Class',
}

// Today's date string for min attribute
function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Airport Autocomplete Dropdown ──────────────────────────────────
function AirportDropdown({
  query,
  onSelect,
  isOpen,
  onClose,
}: {
  query: string
  onSelect: (code: string) => void
  isOpen: boolean
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const filtered = useMemo(() => {
    if (!query || query.length < 1) return AIRPORTS.slice(0, 10)
    const q = query.toLowerCase()
    return AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q),
    ).slice(0, 8)
  }, [query])

  if (!isOpen || filtered.length === 0) return null

  return (
    <div
      ref={ref}
      className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/40 overflow-hidden"
    >
      {filtered.map((airport) => (
        <button
          key={airport.code}
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sky-500/10 transition-colors"
          onClick={() => {
            onSelect(airport.code)
            onClose()
          }}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-sky-400">
            {airport.code}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-200 truncate">{airport.city}</p>
            <p className="text-xs text-slate-500">{airport.country}</p>
          </div>
          <MapPin className="h-3.5 w-3.5 text-slate-600 shrink-0" />
        </button>
      ))}
    </div>
  )
}

export function GlobalSearchHeader() {
  const navigate = useNavigate()
  const [isSearching, setIsSearching] = useState(false)
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false)
  const [toDropdownOpen, setToDropdownOpen] = useState(false)
  const today = getTodayStr()

  const [form, setForm] = useState<GlobalSearchForm>({
    from: 'DEL',
    to: 'BOM',
    departureDate: '',
    returnDate: '',
    tripType: 'roundtrip',
    passengers: 1,
    cabin: 'economy',
    flexDays: 3,
  })

  const handleChange = <K extends keyof GlobalSearchForm>(
    key: K,
    value: GlobalSearchForm[K],
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // If departure date changes and return date is before it, clear return
      if (key === 'departureDate' && next.returnDate && next.returnDate < String(value)) {
        next.returnDate = ''
      }
      return next
    })
  }

  const swapLocations = () => {
    setForm((prev) => ({ ...prev, from: prev.to, to: prev.from }))
  }

  const handleFromClose = useCallback(() => setFromDropdownOpen(false), [])
  const handleToClose = useCallback(() => setToDropdownOpen(false), [])

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault()
    setIsSearching(true)

    // Simulate a brief loading state for better UX
    await new Promise((resolve) => setTimeout(resolve, 800))

    const params = new URLSearchParams()
    params.set('from', form.from)
    params.set('to', form.to)
    params.set('tripType', form.tripType)
    params.set('adults', String(form.passengers))
    params.set('cabin', form.cabin)
    if (form.departureDate) params.set('date', form.departureDate)
    if (form.tripType === 'roundtrip' && form.returnDate)
      params.set('return', form.returnDate)
    params.set('flex', String(form.flexDays))

    navigate({ pathname: '/results', search: params.toString() })
    setIsSearching(false)
  }

  // Get display name for airport
  const getAirportLabel = (code: string) => {
    const airport = AIRPORTS.find((a) => a.code === code)
    return airport ? `${airport.city} (${airport.code})` : code
  }

  return (
    <section
      aria-label="Flight search"
      className="glass rounded-3xl p-6 shadow-xl sm:p-8"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
        aria-describedby="price-transparency-helper"
      >
        {/* Trip Type Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-2xl bg-slate-900/80 p-1 ring-1 ring-slate-800">
            {(['oneway', 'roundtrip'] as TripType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleChange('tripType', type)}
                className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all duration-300 ${form.tripType === type
                    ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                aria-pressed={form.tripType === type}
              >
                {type === 'oneway' ? 'One Way' : 'Round Trip'}
              </button>
            ))}
          </div>

          <div
            id="price-transparency-helper"
            className="flex items-center gap-2 rounded-xl bg-sky-500/10 px-3 py-2 text-xs text-sky-300 ring-1 ring-sky-500/20"
          >
            <Info className="h-4 w-4" />
            <span>No hidden fees. Every amount itemized before payment.</span>
          </div>
        </div>

        {/* Main Search Fields */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr,auto,1fr]">
          {/* From Field */}
          <div className="relative">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              From
            </label>
            <input
              required
              value={form.from}
              onChange={(e) => {
                handleChange('from', e.target.value.toUpperCase())
                setFromDropdownOpen(true)
              }}
              onFocus={() => setFromDropdownOpen(true)}
              placeholder="City or airport code"
              className="input-premium pr-12"
              autoComplete="off"
            />
            <div className="absolute bottom-3 right-3 text-slate-500">
              <Briefcase className="h-5 w-5" />
            </div>
            {form.from && (
              <p className="text-xs text-slate-500 mt-1">{getAirportLabel(form.from)}</p>
            )}
            <AirportDropdown
              query={form.from}
              isOpen={fromDropdownOpen}
              onSelect={(code) => handleChange('from', code)}
              onClose={handleFromClose}
            />
          </div>

          {/* Swap Button */}
          <div className="flex items-end justify-center pb-3">
            <button
              type="button"
              onClick={swapLocations}
              className="group p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-sky-500/50 hover:bg-slate-800 transition-all duration-300"
              aria-label="Swap departure and destination"
            >
              <ArrowRightLeft className="h-5 w-5 text-slate-400 group-hover:text-sky-400 transition-colors" />
            </button>
          </div>

          {/* To Field */}
          <div className="relative">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              To
            </label>
            <input
              required
              value={form.to}
              onChange={(e) => {
                handleChange('to', e.target.value.toUpperCase())
                setToDropdownOpen(true)
              }}
              onFocus={() => setToDropdownOpen(true)}
              placeholder="City or airport code"
              className="input-premium pr-12"
              autoComplete="off"
            />
            <div className="absolute bottom-3 right-3 text-slate-500">
              <Briefcase className="h-5 w-5" />
            </div>
            {form.to && (
              <p className="text-xs text-slate-500 mt-1">{getAirportLabel(form.to)}</p>
            )}
            <AirportDropdown
              query={form.to}
              isOpen={toDropdownOpen}
              onSelect={(code) => handleChange('to', code)}
              onClose={handleToClose}
            />
          </div>
        </div>

        {/* Date and Passenger Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Departure Date */}
          <div className="relative">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              <Calendar className="inline h-3 w-3 mr-1" />
              Depart
            </label>
            <input
              type="date"
              required
              min={today}
              value={form.departureDate}
              onChange={(e) => handleChange('departureDate', e.target.value)}
              className="input-premium"
            />
          </div>

          {/* Return Date - Only for roundtrip */}
          {form.tripType === 'roundtrip' && (
            <div className="relative">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                <Calendar className="inline h-3 w-3 mr-1" />
                Return
              </label>
              <input
                type="date"
                min={form.departureDate || today}
                value={form.returnDate}
                onChange={(e) => handleChange('returnDate', e.target.value)}
                className="input-premium"
              />
            </div>
          )}

          {/* Passengers */}
          <div className="relative">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              <Users className="inline h-3 w-3 mr-1" />
              Travelers
            </label>
            <input
              type="number"
              min={1}
              max={9}
              value={form.passengers}
              onChange={(e) => handleChange('passengers', Number(e.target.value || 1))}
              className="input-premium"
              aria-label="Number of travelers"
            />
          </div>

          {/* Cabin Class */}
          <div className="relative">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Cabin Class
            </label>
            <select
              value={form.cabin}
              onChange={(e) => handleChange('cabin', e.target.value as CabinClass)}
              className="input-premium appearance-none cursor-pointer"
            >
              {Object.entries(cabinLabels).map(([value, label]) => (
                <option key={value} value={value} className="bg-slate-900">
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Flex Date Strip */}
        {form.departureDate ? (
          <FlexDateStrip
            selectedDate={form.departureDate}
            flexDays={form.flexDays}
            onSelect={(nextDate) => handleChange('departureDate', nextDate)}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-6 text-center">
            <Calendar className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">
              Select a departure date to see the cheapest days nearby
            </p>
            <p className="text-xs text-slate-500 mt-1">
              We'll show you prices ±{form.flexDays} days around your chosen date
            </p>
          </div>
        )}

        {/* Search Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-500">
            <span className="text-sky-400 font-medium">Flexible dates:</span> ±{form.flexDays} days around your chosen date.
            We highlight the cheapest options automatically.
          </p>

          <button
            type="submit"
            disabled={isSearching}
            className={`btn-primary min-w-[200px] ${isSearching ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isSearching ? (
              <>
                <div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" aria-hidden="true" />
                Search Flights
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}
