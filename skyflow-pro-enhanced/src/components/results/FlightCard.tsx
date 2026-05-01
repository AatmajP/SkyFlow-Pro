import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock3, Luggage, ChevronDown, Leaf, Shield, Info, Zap, TrendingDown, Award, Star } from 'lucide-react'
import type { FlightOption } from '../../types/flight'
import type { FlightBadge } from '../../utils/flightIntelligence'
import { getBadgeConfig } from '../../utils/flightIntelligence'

interface FlightCardProps {
  flight: FlightOption
  badges?: FlightBadge[]
}

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
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

function getBadgeIcon(badge: FlightBadge) {
  switch (badge) {
    case 'cheapest':
      return <TrendingDown className="h-3 w-3" />
    case 'fastest':
      return <Zap className="h-3 w-3" />
    case 'best-value':
      return <Award className="h-3 w-3" />
  }
}

// ─── Airline Logo/Color Mapping ─────────────────────────────────────
function getAirlineVisuals(code: string): { gradient: string; initial: string } {
  switch (code) {
    case '6E': return { gradient: 'from-blue-600 to-blue-800', initial: '6E' }
    case 'AI': return { gradient: 'from-red-600 to-orange-600', initial: 'AI' }
    case 'UK': return { gradient: 'from-purple-600 to-violet-700', initial: 'UK' }
    case 'SG': return { gradient: 'from-yellow-500 to-red-500', initial: 'SG' }
    case 'QP': return { gradient: 'from-orange-500 to-orange-700', initial: 'QP' }
    case 'PT': return { gradient: 'from-sky-500 to-emerald-500', initial: 'PT' }
    case 'EK': return { gradient: 'from-red-700 to-red-900', initial: 'EK' }
    case 'BA': return { gradient: 'from-blue-800 to-red-700', initial: 'BA' }
    case 'LH': return { gradient: 'from-blue-700 to-yellow-500', initial: 'LH' }
    case 'SQ': return { gradient: 'from-blue-900 to-yellow-600', initial: 'SQ' }
    case 'DL': return { gradient: 'from-blue-600 to-indigo-700', initial: 'DL' }
    case 'UA': return { gradient: 'from-blue-700 to-blue-900', initial: 'UA' }
    case 'AA': return { gradient: 'from-red-500 to-red-700', initial: 'AA' }
    case 'B6': return { gradient: 'from-blue-400 to-blue-600', initial: 'B6' }
    default: return { gradient: 'from-slate-600 to-slate-700', initial: code.slice(0, 2) }
  }
}

export function FlightCard({ flight, badges = [] }: FlightCardProps) {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isSelectPressed, setIsSelectPressed] = useState(false)
  const detailsRef = useRef<HTMLDivElement>(null)

  const { price } = flight
  const isHighRefund = price.refundabilityScore >= 75
  const isLowRefund = price.refundabilityScore <= 30
  const ageMinutes = Math.max(
    0,
    Math.round((Date.now() - new Date(price.lastUpdated).getTime()) / 60_000),
  )
  const isStale = ageMinutes >= 15

  const hasBadges = badges.length > 0
  const hasBestValue = badges.includes('best-value')
  const isPatro = flight.segments[0]?.marketingCarrierCode === 'PT'

  const airlineVisuals = getAirlineVisuals(flight.segments[0]?.marketingCarrierCode ?? '')

  const handleSelect = () => {
    sessionStorage.setItem('selectedFlight', JSON.stringify(flight))
    navigate(`/booking/${flight.id}`)
  }

  return (
    <article
      className={`relative rounded-2xl border bg-gradient-to-br from-slate-900/90 to-slate-950/90 shadow-lg flight-card-hover ${
        isHovered ? 'border-sky-500/50 ring-1 ring-sky-500/20' : 'border-slate-800/80'
      } ${hasBestValue ? 'best-value-glow' : ''} ${isPatro ? 'patro-glow' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Patro Airlines ribbon */}
      {isPatro && (
        <div className="absolute top-0 right-6 bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-[0.6rem] font-bold px-3 py-1 rounded-b-lg shadow-lg flex items-center gap-1">
          <Star className="h-3 w-3" />
          Patro Special
        </div>
      )}

      {/* Intelligent badge ribbon */}
      {hasBadges && (
        <div className="flex items-center gap-1.5 px-4 pt-3 sm:px-5 sm:pt-4 pb-0">
          {badges.map((badge) => {
            const config = getBadgeConfig(badge)
            return (
              <span
                key={badge}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold ring-1 badge-pill ${config.bgClass} ${config.textClass}`}
              >
                {getBadgeIcon(badge)}
                {config.label}
              </span>
            )
          })}
        </div>
      )}

      {/* Main content */}
      <div className={`p-4 sm:p-5 ${hasBadges ? 'pt-2 sm:pt-3' : ''} ${isPatro && !hasBadges ? 'pt-6' : ''}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left side - Flight info */}
          <div className="flex flex-1 gap-4">
            {/* Airline logo */}
            <div className="hidden sm:flex shrink-0">
              <div className={`h-14 w-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg airline-logo ${airlineVisuals.gradient}`}>
                {airlineVisuals.initial}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {/* Airline and flight info */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Mobile airline logo */}
                <div className={`sm:hidden h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs ${airlineVisuals.gradient}`}>
                  {airlineVisuals.initial}
                </div>
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
                        <ArrowRight className={`h-4 w-4 transition-colors duration-300 ${isHovered ? 'text-sky-400' : 'text-slate-500'}`} />
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
              <p className={`text-2xl font-bold ${isPatro ? 'text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400' : hasBadges ? 'text-transparent bg-clip-text bg-gradient-to-r from-slate-50 to-slate-200' : 'text-slate-50'}`}>
                {formatter.format(price.total)}
              </p>
              <p className="text-xs text-slate-400">
                {formatter.format(price.perPassenger)} per traveler
              </p>
              {isPatro && (
                <p className="text-[0.65rem] text-emerald-400 font-medium mt-0.5">
                  10% Patro discount applied
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1 btn-details ${
                  isExpanded
                    ? 'text-sky-300 bg-sky-500/10 ring-1 ring-sky-500/20'
                    : 'text-slate-400 bg-slate-800/50 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Details
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleSelect}
                onMouseDown={() => setIsSelectPressed(true)}
                onMouseUp={() => setIsSelectPressed(false)}
                onMouseLeave={() => setIsSelectPressed(false)}
                className={`flex-1 btn-primary text-xs py-2 btn-select ${isSelectPressed ? 'btn-select-active' : ''}`}
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

      {/* Expanded details - smooth toggle */}
      <div
        ref={detailsRef}
        className={`details-panel overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isExpanded ? 'details-panel-open' : 'details-panel-closed'
        }`}
        style={{
          maxHeight: isExpanded ? '500px' : '0px',
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div className="border-t border-slate-800/50 p-4 sm:p-5 bg-slate-900/50">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Price breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Shield className="h-4 w-4 text-sky-400" />
                Price Breakdown
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between group/row">
                  <span className="text-slate-400 group-hover/row:text-slate-300 transition-colors">Base fare</span>
                  <span className="font-medium text-slate-200">{formatter.format(price.baseFare)}</span>
                </div>
                <div className="flex justify-between group/row">
                  <span className="text-slate-400 group-hover/row:text-slate-300 transition-colors">Taxes & fees</span>
                  <span className="font-medium text-slate-200">{formatter.format(price.taxesAndFees)}</span>
                </div>
                <div className="flex justify-between group/row">
                  <span className="text-slate-400 group-hover/row:text-slate-300 transition-colors">Carrier charges</span>
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
                  <div key={item.label} className="flex justify-between text-xs group/row">
                    <span className="text-slate-400 group-hover/row:text-slate-300 transition-colors">{item.label}</span>
                    <span className="font-medium text-slate-300">{formatter.format(item.amount)}</span>
                  </div>
                ))}
              </div>

              {/* Per-passenger visual */}
              <div className="mt-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Per passenger</span>
                  <span className="font-semibold text-sky-300">{formatter.format(price.perPassenger)}</span>
                </div>
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
                <p className="text-slate-400">
                  <span className="font-medium text-slate-200">Aircraft:</span>{' '}
                  {flight.segments[0]?.aircraft}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.65rem] text-slate-400">Refundability</span>
                      <span className={`text-[0.65rem] font-semibold ${
                        isHighRefund ? 'text-emerald-400' : isLowRefund ? 'text-amber-400' : 'text-slate-300'
                      }`}>{price.refundabilityScore}/100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          isHighRefund ? 'bg-emerald-500' : isLowRefund ? 'bg-amber-500' : 'bg-slate-500'
                        }`}
                        style={{ width: `${price.refundabilityScore}%` }}
                      />
                    </div>
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
      </div>
    </article>
  )
}
