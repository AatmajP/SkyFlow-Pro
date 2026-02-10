import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock3, Luggage, ChevronDown, ChevronUp, Leaf, Shield, Info } from 'lucide-react'
import type { FlightOption } from '../../types/flight'

interface FlightCardProps {
  flight: FlightOption
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h${m ? ` ${m}m` : ''}`
}

function formatTime(dateTime: string) {
  return new Date(dateTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function FlightCard({ flight }: FlightCardProps) {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const { price } = flight
  const isHighRefund = price.refundabilityScore >= 75
  const isLowRefund = price.refundabilityScore <= 30
  const ageMinutes = Math.max(
    0,
    Math.round((Date.now() - new Date(price.lastUpdated).getTime()) / 60_000),
  )
  const isStale = ageMinutes >= 15

  const handleSelect = () => {
    // Store the flight in session storage for the booking page
    sessionStorage.setItem('selectedFlight', JSON.stringify(flight))
    navigate(`/booking/${flight.id}`)
  }

  return (
    <article
      className={`relative rounded-2xl border bg-gradient-to-br from-slate-900/90 to-slate-950/90 shadow-lg transition-all duration-400 card-hover ${isHovered ? 'border-sky-500/50 ring-1 ring-sky-500/20' : 'border-slate-800/80'
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main content */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left side - Flight info */}
          <div className="flex flex-1 gap-4">
            {/* Airline logo placeholder */}
            <div className="hidden sm:flex shrink-0">
              <div className={`h-14 w-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg ${flight.segments[0]?.marketingCarrierCode === 'SA'
                  ? 'from-sky-500 to-blue-600'
                  : 'from-purple-500 to-violet-600'
                }`}>
                {flight.segments[0]?.marketingCarrierCode}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {/* Airline and flight info */}
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-slate-50">
                  {flight.segments[0]?.marketingCarrier}
                </p>
                <span className="text-xs text-slate-500">
                  {flight.segments[0]?.operatingCarrierCode}
                  {flight.segments[0]?.flightNumber}
                </span>
                {flight.alliance && (
                  <span className="badge-info text-[0.65rem]">
                    {flight.alliance}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-medium bg-slate-800 text-slate-300 ring-1 ring-slate-700">
                  {flight.fareBrand}
                </span>
              </div>

              {/* Route and time */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-50">{flight.from}</p>
                    <p className="text-xs text-slate-400">
                      {flight.segments[0]?.departureTime && formatTime(flight.segments[0].departureTime)}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-1 min-w-[100px]">
                    <p className="text-xs text-slate-500">{formatDuration(flight.totalDurationMinutes)}</p>
                    <div className="relative flex items-center w-full">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                        <ArrowRight className={`h-4 w-4 transition-colors ${isHovered ? 'text-sky-400' : 'text-slate-500'}`} />
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-400">
                      {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-50">{flight.to}</p>
                    <p className="text-xs text-slate-400">
                      {flight.segments[flight.segments.length - 1]?.arrivalTime &&
                        formatTime(flight.segments[flight.segments.length - 1].arrivalTime)}
                    </p>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 ml-auto">
                  <div className="flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>{formatDuration(flight.totalDurationMinutes)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Luggage className="h-3.5 w-3.5" />
                    <span>Checked bag included</span>
                  </div>
                </div>
              </div>

              {/* Layover info */}
              {flight.layovers.length > 0 && (
                <p className="text-xs text-slate-400">
                  <span className="text-amber-400">Layover:</span>{' '}
                  {flight.layovers[0]?.airport} · {formatDuration(flight.layovers[0]?.durationMinutes ?? 0)}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Price and CTA */}
          <div className="flex flex-col items-end gap-3 border-t border-slate-800/50 pt-4 lg:border-0 lg:pt-0 lg:pl-6 lg:border-l lg:min-w-[220px]">
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-50">
                {formatter.format(price.total)}
              </p>
              <p className="text-xs text-slate-400">
                {formatter.format(price.perPassenger)} per traveler
              </p>
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 bg-slate-800/50 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center justify-center gap-1"
              >
                Details
                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleSelect}
                className="flex-1 btn-primary text-xs py-2"
              >
                Select
              </button>
            </div>

            {/* Quick badges */}
            <div className="flex items-center gap-2">
              <span className={`text-[0.65rem] font-medium px-2 py-0.5 rounded-full ${isHighRefund
                  ? 'bg-emerald-950/50 text-emerald-300 ring-1 ring-emerald-500/30'
                  : isLowRefund
                    ? 'bg-amber-950/50 text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-slate-800/50 text-slate-300 ring-1 ring-slate-700'
                }`}>
                {isHighRefund ? 'Flexible' : isLowRefund ? 'Restricted' : 'Mixed'}
              </span>
              <span className="text-[0.65rem] text-slate-500 flex items-center gap-1">
                <Leaf className="h-3 w-3 text-emerald-500" />
                {price.carbonEstimateKg} kg CO₂
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-slate-800/50 p-4 sm:p-5 bg-slate-900/50 animate-fade-in">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Price breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Shield className="h-4 w-4 text-sky-400" />
                Price Breakdown
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Base fare</span>
                  <span className="font-medium text-slate-200">{formatter.format(price.baseFare)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Taxes & fees</span>
                  <span className="font-medium text-slate-200">{formatter.format(price.taxesAndFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Carrier charges</span>
                  <span className="font-medium text-slate-200">{formatter.format(price.carrierCharges)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800">
                  <span className="font-semibold text-slate-200">Total</span>
                  <span className="font-bold text-sky-400">{formatter.format(price.total)}</span>
                </div>
              </div>
            </div>

            {/* Detailed breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Info className="h-4 w-4 text-sky-400" />
                Fee Details
              </h4>
              <div className="space-y-1">
                {price.breakdown.map((item) => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="font-medium text-slate-300">{formatter.format(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-200">Fare Rules</h4>
              <div className="space-y-2 text-xs">
                <p className="text-slate-400">
                  <span className="font-medium text-slate-200">Refund policy:</span>{' '}
                  {price.refundableLabel}
                </p>
                <p className="text-slate-400">
                  <span className="font-medium text-slate-200">Baggage:</span>{' '}
                  {flight.baggagePolicy}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`text-xs font-medium px-2 py-1 rounded-lg ${isHighRefund
                      ? 'bg-emerald-950/50 text-emerald-300'
                      : isLowRefund
                        ? 'bg-amber-950/50 text-amber-300'
                        : 'bg-slate-800/50 text-slate-300'
                    }`}>
                    Refundability score: {price.refundabilityScore}/100
                  </div>
                </div>
              </div>
              <p className="text-[0.65rem] text-slate-500">
                Last checked: {new Date(price.lastUpdated).toLocaleTimeString()}
                {isStale && (
                  <span className="ml-1 text-amber-400">({ageMinutes}m ago - may have changed)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
