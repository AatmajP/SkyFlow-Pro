import { Search, ArrowRightLeft, Calendar, Users, Briefcase, Info } from 'lucide-react'
import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PriceTimeline } from '../search/PriceTimeline'
import { AirportDropdownPortal } from './AirportDropdownPortal'
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

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function GlobalSearchHeader() {
  const navigate = useNavigate()
  const [isSearching, setIsSearching] = useState(false)
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false)
  const [toDropdownOpen, setToDropdownOpen] = useState(false)
  const today = getTodayStr()

  // Refs for portal positioning
  const fromInputRef = useRef<HTMLDivElement>(null)
  const toInputRef = useRef<HTMLDivElement>(null)

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
          <div ref={fromInputRef} className="relative">
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
            {/* Portal-based dropdown — no overlap issues */}
            <AirportDropdownPortal
              query={form.from}
              isOpen={fromDropdownOpen}
              onSelect={(code) => handleChange('from', code)}
              onClose={handleFromClose}
              anchorRef={fromInputRef}
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
          <div ref={toInputRef} className="relative">
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
            <AirportDropdownPortal
              query={form.to}
              isOpen={toDropdownOpen}
              onSelect={(code) => handleChange('to', code)}
              onClose={handleToClose}
              anchorRef={toInputRef}
            />
          </div>
        </div>

        {/* Date and Passenger Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {form.departureDate ? (
          <PriceTimeline
            from={form.from}
            to={form.to}
            date={form.departureDate}
            cabin={form.cabin}
            tripType={form.tripType}
            onSelectDate={(nextDate) => handleChange('departureDate', nextDate)}
          />
        ) : (
          <div className="glass rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-6 text-center">
            <Calendar className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">
              Select a departure date to see the cheapest days nearby
            </p>
            <p className="text-xs text-slate-500 mt-1">
              We'll show you prices ±3 days around your chosen date
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
