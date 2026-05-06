/**
 * Enhanced Global Search Header
 * 
 * BACKWARD COMPATIBLE - Preserves existing layout and functionality
 * 
 * New features:
 * - Airport autocomplete with intelligent search
 * - Support for all cabin classes with proper labels
 * - Visual integration maintained
 */

import { Search, ArrowRightLeft, Calendar, Users, Info, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlexDateStrip } from '../calendar/FlexDateStrip'
import { AirportAutocomplete } from '../search/AirportAutocomplete'
import { getCabinClassLabel, getAllCabinClasses } from '../../config/pricingEngine'
import type { CabinClass } from '../../types/flight'

type TripType = 'oneway' | 'roundtrip' | 'multicity'

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

export function GlobalSearchHeaderEnhanced() {
    const navigate = useNavigate()
    const [isSearching, setIsSearching] = useState(false)
    const [form, setForm] = useState<GlobalSearchForm>({
        from: 'JFK',
        to: 'LAX',
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
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const swapLocations = () => {
        setForm((prev) => ({ ...prev, from: prev.to, to: prev.from }))
    }

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

    const cabinClasses = getAllCabinClasses()

    return (
        <section
            aria-label="Flight search"
            className="glass-floating p-6 sm:p-10 relative z-20 mx-auto w-full max-w-6xl shadow-2xl"
        >
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-8"
                aria-describedby="price-transparency-helper"
            >
                {/* Trip Type Selector - UNCHANGED */}
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="inline-flex rounded-2xl bg-slate-100/50 p-1.5 border border-slate-200/50">
                        {(['oneway', 'roundtrip', 'multicity'] as TripType[]).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => handleChange('tripType', type)}
                                className={`rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-300 ${form.tripType === type
                                        ? 'bg-slate-900 text-white shadow-lg scale-105'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                                    }`}
                                aria-pressed={form.tripType === type}
                            >
                                {type === 'multicity' ? 'Multi-city' : type === 'oneway' ? 'One Way' : 'Round Trip'}
                            </button>
                        ))}
                    </div>

                    <div
                        id="price-transparency-helper"
                        className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 border border-emerald-100 shadow-sm"
                    >
                        <Info className="h-4 w-4" />
                        <span>All Inclusive Pricing • Verified Inventory</span>
                    </div>
                </div>

                {/* Main Search Fields - ENHANCED with Autocomplete */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,auto,1fr] items-end">
                    {/* From Field - NOW with Autocomplete */}
                    <div className="flex-1">
                        <AirportAutocomplete
                            value={form.from}
                            onChange={(value) => handleChange('from', value)}
                            label="Departure City"
                            required
                        />
                    </div>

                    {/* Swap Button */}
                    <div className="flex items-center justify-center pt-8">
                        <button
                            type="button"
                            onClick={swapLocations}
                            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-black transition-all duration-300 shadow-xl scale-110 active:scale-95"
                            aria-label="Swap departure and destination"
                        >
                            <ArrowRightLeft className="h-5 w-5 text-white transition-transform group-hover:rotate-180" />
                        </button>
                    </div>

                    {/* To Field - NOW with Autocomplete */}
                    <div className="flex-1">
                        <AirportAutocomplete
                            value={form.to}
                            onChange={(value) => handleChange('to', value)}
                            label="Destination"
                            required
                        />
                    </div>
                </div>

                {/* Date and Passenger Fields - UNCHANGED */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Departure Date */}
                    <div className="relative group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3 group-focus-within:text-slate-900 transition-colors">
                            <Calendar className="inline h-3.5 w-3.5 mr-2" />
                            Departure Date
                        </label>
                        <input
                            type="date"
                            required
                            value={form.departureDate}
                            onChange={(e) => handleChange('departureDate', e.target.value)}
                            className="input-cinematic shadow-sm"
                        />
                    </div>

                    {/* Return Date - Only for roundtrip */}
                    {form.tripType === 'roundtrip' && (
                        <div className="relative group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3 group-focus-within:text-slate-900 transition-colors">
                                <Calendar className="inline h-3.5 w-3.5 mr-2" />
                                Return Date
                            </label>
                            <input
                                type="date"
                                value={form.returnDate}
                                onChange={(e) => handleChange('returnDate', e.target.value)}
                                className="input-cinematic shadow-sm"
                            />
                        </div>
                    )}

                    {/* Passengers */}
                    <div className="relative group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3 group-focus-within:text-slate-900 transition-colors">
                            <Users className="inline h-3.5 w-3.5 mr-2" />
                            Travelers
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min={1}
                                max={9}
                                value={form.passengers}
                                onChange={(e) => handleChange('passengers', Number(e.target.value || 1))}
                                className="input-cinematic shadow-sm pr-12"
                                aria-label="Number of travelers"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
                                {form.passengers > 1 ? 'Adults' : 'Adult'}
                            </span>
                        </div>
                    </div>

                    {/* Cabin Class - ENHANCED with all classes */}
                    <div className="relative group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3 group-focus-within:text-slate-900 transition-colors">
                            Preferred Class
                        </label>
                        <div className="relative">
                            <select
                                value={form.cabin}
                                onChange={(e) => handleChange('cabin', e.target.value as CabinClass)}
                                className="input-cinematic shadow-sm appearance-none cursor-pointer pr-10"
                            >
                                {cabinClasses.map((cabinClass) => (
                                    <option key={cabinClass} value={cabinClass} className="bg-white text-slate-900">
                                        {getCabinClassLabel(cabinClass)}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flex Date Strip - UNCHANGED */}
                {form.departureDate ? (
                    <FlexDateStrip
                        selectedDate={form.departureDate}
                        flexDays={form.flexDays}
                        onSelect={(nextDate) => handleChange('departureDate', nextDate)}
                    />
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center mt-2">
                        <Calendar className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                        <p className="text-sm text-slate-600 font-medium">
                            Select a departure date to see the cheapest days nearby
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            We'll show you prices ±{form.flexDays} days around your chosen date
                        </p>
                    </div>
                )}

                {/* Search Button - UNCHANGED */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-4">
                    <p className="text-xs text-slate-500">
                        <span className="text-slate-800 font-bold">Flexible dates:</span> ±{form.flexDays} days around your chosen date.
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
