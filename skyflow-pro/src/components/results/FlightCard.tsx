import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Clock3, Luggage, ChevronDown, Leaf, Shield, Info,
  Zap, TrendingDown, Award, Star, AlertTriangle, Utensils, Briefcase, RotateCcw,
  Sparkles, Moon
} from 'lucide-react'
import type { FlightOption, CabinClass } from '../../types/flight'
import type { FlightBadge } from '../../utils/flightIntelligence'
import { getBadgeConfig } from '../../utils/flightIntelligence'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '../../context/CurrencyContext'

interface FlightCardProps {
  flight: FlightOption
  badges?: FlightBadge[]
  onSelect?: (flight: FlightOption) => void
  isSelected?: boolean
}


function formatDuration(minutes: number, t: any) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return t('common.duration', { h, m })
}

function formatTime(dateTime: string, lang: string) {
  return new Date(dateTime).toLocaleTimeString(lang, {
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
    default:
      return null
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
    default: return { gradient: 'from-slate-600 to-slate-700', initial: code.slice(0, 2) }
  }
}

// Tag icon helper
function getTagIcon(tag: string) {
  switch (tag) {
    case 'meal': return <Utensils className="h-3 w-3" />
    case 'baggage': return <Briefcase className="h-3 w-3" />
    case 'refundable': return <RotateCcw className="h-3 w-3" />
    case 'surge': return <AlertTriangle className="h-3 w-3" />
    case 'spiritual': return <Sparkles className="h-3 w-3" />
    case 'pilgrimage': return <Moon className="h-3 w-3" />
    case 'meditation': return <div className="text-[10px]">🧘</div>
    default: return null
  }
}

function getTagStyle(tag: string) {
  switch (tag) {
    case 'meal': return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-500/30'
    case 'baggage': return 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-300 ring-sky-200 dark:ring-sky-500/30'
    case 'refundable': return 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-300 ring-violet-200 dark:ring-violet-500/30'
    case 'surge': return 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 ring-amber-200 dark:ring-amber-500/30'
    case 'spiritual': return 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 ring-purple-200 dark:ring-purple-500/30 shadow-sm shadow-purple-500/10'
    case 'pilgrimage': return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-500/30'
    case 'meditation': return 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-300 ring-cyan-200 dark:ring-cyan-500/30'
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-slate-200 dark:ring-slate-700'
  }
}

export function FlightCard({ flight, badges = [], onSelect, isSelected }: FlightCardProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isSelectPressed, setIsSelectPressed] = useState(false)
  const [selectedCabin, setSelectedCabin] = useState<CabinClass>(flight.cabin)
  const detailsRef = useRef<HTMLDivElement>(null)

  // Get price for the currently selected cabin class
  const activeClassPrice = flight.classPrices?.find((cp) => cp.cabin === selectedCabin)
    ?? { total: flight.price.total, baseFare: flight.price.baseFare, taxesAndFees: flight.price.taxesAndFees, carrierCharges: flight.price.carrierCharges, cabin: selectedCabin, label: 'Economy' }

  const { price } = flight
  const isHighRefund = price.refundabilityScore >= 75
  const isLowRefund = price.refundabilityScore <= 30
  const ageMinutes = Math.max(0, Math.round((Date.now() - new Date(price.lastUpdated).getTime()) / 60_000))
  const isStale = ageMinutes >= 15

  const hasBadges = badges.length > 0
  const hasBestValue = badges.includes('best-value')
  const isPatro = flight.segments[0]?.marketingCarrierCode === 'PT'
  const isSurge = (flight.seatsLeft ?? 150) <= 30
  const airlineVisuals = getAirlineVisuals(flight.segments[0]?.marketingCarrierCode ?? '')

  const handleSelect = () => {
    // Store flight with updated price for selected class
    const updatedFlight = {
      ...flight,
      cabin: selectedCabin,
      price: {
        ...flight.price,
        total: activeClassPrice.total,
        baseFare: activeClassPrice.baseFare,
        taxesAndFees: activeClassPrice.taxesAndFees,
        carrierCharges: activeClassPrice.carrierCharges,
        perPassenger: activeClassPrice.total,
        breakdown: [
          { label: 'Base fare', amount: activeClassPrice.baseFare },
          { label: 'GST & airport taxes', amount: Math.round(activeClassPrice.taxesAndFees * 0.6) },
          { label: 'User development fee', amount: Math.round(activeClassPrice.taxesAndFees * 0.2) },
          { label: 'Aviation security fee', amount: Math.round(activeClassPrice.taxesAndFees * 0.2) },
          { label: 'Carrier surcharge', amount: activeClassPrice.carrierCharges },
        ],
      },
    }

    if (onSelect) {
      onSelect(updatedFlight)
    } else {
      sessionStorage.setItem('selectedFlight', JSON.stringify(updatedFlight))
      navigate(`/booking/${flight.id}`)
    }
  }

  return (
    <article
      className={`relative rounded-2xl border transition-all duration-300 flight-card-hover ${
        isSelected
          ? 'border-emerald-500/60 ring-1 ring-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20'
          : isHovered
            ? 'border-sky-500/50 ring-1 ring-sky-500/20 bg-white dark:bg-slate-900'
            : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-950/90'
      } ${hasBestValue ? 'best-value-glow' : ''} ${isPatro ? 'patro-glow' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Patro Airlines ribbon */}
      {isPatro && (
        <div className="absolute top-0 right-6 bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-[0.6rem] font-bold px-3 py-1 rounded-b-lg shadow-lg flex items-center gap-1 z-10">
          <Star className="h-3 w-3" />
          {t('results.card.patroSpecial')}
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
                {t(`results.badges.${badge.replace('-','')}Value`, { defaultValue: config.label })}
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
                <div className={`sm:hidden h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs ${airlineVisuals.gradient}`}>
                  {airlineVisuals.initial}
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-slate-50">
                  {flight.segments[0]?.marketingCarrier}
                </p>
                <span className="text-xs text-slate-500">
                  {flight.segments[0]?.operatingCarrierCode}
                  {flight.segments[0]?.flightNumber}
                </span>
                {flight.alliance && (
                  <span className="badge-info text-[0.65rem]">{flight.alliance}</span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700">
                  {flight.fareBrand}
                </span>
              </div>

              {/* Route and time */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{flight.from}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {flight.segments[0]?.departureTime && formatTime(flight.segments[0].departureTime, i18n.language)}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-1 min-w-[100px]">
                    <p className="text-xs text-slate-500">{formatDuration(flight.totalDurationMinutes, t)}</p>
                    <div className="relative flex items-center w-full">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                        <ArrowRight className={`h-4 w-4 transition-colors duration-300 ${isHovered ? 'text-sky-400' : 'text-slate-500'}`} />
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-400">
                      {flight.stops === 0 ? t('results.card.nonStop') : t('results.card.stops', { count: flight.stops })}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{flight.to}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {flight.segments[flight.segments.length - 1]?.arrivalTime &&
                        formatTime(flight.segments[flight.segments.length - 1].arrivalTime, i18n.language)}
                    </p>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 ml-auto">
                  <div className="flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>{formatDuration(flight.totalDurationMinutes, t)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Luggage className="h-3.5 w-3.5" />
                    <span>{t('results.card.checkedBag')}</span>
                  </div>
                </div>
              </div>

              {/* Tags row */}
              {flight.tags && flight.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {flight.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-medium ring-1 ${getTagStyle(tag)}`}
                    >
                      {getTagIcon(tag)}
                      {tag === 'surge' ? t('results.card.onlyLeft', { count: flight.seatsLeft }) : t(`results.tags.${tag}`, { defaultValue: tag.charAt(0).toUpperCase() + tag.slice(1) })}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Price and CTA */}
          <div className="flex flex-col items-end gap-3 border-t border-slate-200 dark:border-slate-800/50 pt-4 lg:border-0 lg:pt-0 lg:pl-6 lg:border-l lg:border-slate-200 dark:lg:border-slate-800/50 lg:min-w-[220px]">
            <div className="text-right">
              <p className={`text-2xl font-bold transition-all duration-300 ${
                isPatro
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500 dark:from-sky-400 dark:to-emerald-400'
                  : hasBadges
                    ? 'text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-slate-50 dark:to-slate-200'
                    : 'text-slate-900 dark:text-slate-50'
              }`}>
                {formatPrice(activeClassPrice.total)}
              </p>
              <p className="text-xs text-slate-400">
                {t('results.card.perTraveler', { price: formatPrice(activeClassPrice.total) })} · {t(`search.${activeClassPrice.cabin}`, { defaultValue: activeClassPrice.label ?? 'Economy' })}
              </p>
              {isPatro && (
                <p className="text-[0.65rem] text-emerald-400 font-medium mt-0.5">
                  {t('results.card.discountApplied')}
                </p>
              )}
              {isSurge && (
                <p className="text-[0.65rem] text-amber-400 font-medium mt-0.5 flex items-center gap-1 justify-end">
                  <AlertTriangle className="h-3 w-3" />
                  {t('results.card.surgePricing')}
                </p>
              )}
            </div>

            {/* Class selector */}
            <div className="w-full grid grid-cols-4 gap-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 p-1 ring-1 ring-slate-200 dark:ring-slate-800">
              {(flight.classPrices ?? []).map((cp) => (
                <button
                  key={cp.cabin}
                  type="button"
                  onClick={() => setSelectedCabin(cp.cabin)}
                  className={`px-1 py-1.5 rounded-lg text-center transition-all duration-200 ${
                    selectedCabin === cp.cabin
                      ? 'bg-white dark:bg-sky-500 text-sky-600 dark:text-white shadow-md dark:shadow-lg dark:shadow-sky-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <p className="text-[0.55rem] font-bold leading-tight truncate uppercase">
                    {t(`results.card.classShort.${cp.cabin}`)}
                  </p>
                  <p className={`text-[0.6rem] font-bold mt-0.5 ${selectedCabin === cp.cabin ? 'text-sky-600 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                    {formatPrice(cp.total)}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1 btn-details ${
                  isExpanded
                    ? 'text-sky-600 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 ring-1 ring-sky-200 dark:ring-sky-500/20'
                    : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t('results.card.details')}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleSelect}
                onMouseDown={() => setIsSelectPressed(true)}
                onMouseUp={() => setIsSelectPressed(false)}
                onMouseLeave={() => setIsSelectPressed(false)}
                className={`flex-1 text-xs py-2 btn-select ${
                  isSelected ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25' : 'btn-primary'
                } ${isSelectPressed && !isSelected ? 'btn-select-active' : ''}`}
              >
                {isSelected ? t('results.card.selected') : t('results.card.select')}
              </button>
            </div>

            {/* Quick badges */}
            <div className="flex items-center gap-2">
              <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ring-1 ${
                isHighRefund
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-500/30'
                  : isLowRefund
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 ring-amber-200 dark:ring-amber-500/30'
                    : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 ring-slate-200 dark:ring-slate-700'
              }`}>
                {isHighRefund ? t('results.card.flexible') : isLowRefund ? t('results.card.restricted') : t('results.card.mixed')}
              </span>
              <span className="text-[0.65rem] text-slate-500 flex items-center gap-1">
                <Leaf className="h-3 w-3 text-emerald-500" />
                {t('results.card.carbon', { count: price.carbonEstimateKg })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded details — fare breakdown updates dynamically with class */}
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
        <div className="border-t border-slate-200 dark:border-slate-800/50 p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/50">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Dynamic fare breakdown for selected class */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <Shield className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                {t('results.card.fareBreakdown')} — {t(`search.${activeClassPrice.cabin}`, { defaultValue: activeClassPrice.label })}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between group/row">
                  <span className="text-slate-500 dark:text-slate-400 group-hover/row:text-slate-900 dark:group-hover/row:text-slate-300 transition-colors">{t('results.card.baseFare')}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{formatPrice(activeClassPrice.baseFare)}</span>
                </div>
                <div className="flex justify-between group/row">
                  <span className="text-slate-500 dark:text-slate-400 group-hover/row:text-slate-900 dark:group-hover/row:text-slate-300 transition-colors">{t('results.card.taxesFees')}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{formatPrice(activeClassPrice.taxesAndFees)}</span>
                </div>
                <div className="flex justify-between group/row">
                  <span className="text-slate-500 dark:text-slate-400 group-hover/row:text-slate-900 dark:group-hover/row:text-slate-300 transition-colors">{t('results.card.carrierCharges')}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{formatPrice(activeClassPrice.carrierCharges)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-slate-200">{t('results.card.total')}</span>
                  <span className="font-black text-sky-600 dark:text-sky-400">{formatPrice(activeClassPrice.total)}</span>
                </div>
              </div>
            </div>

            {/* All class comparison */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <Info className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                {t('results.card.compareClasses')}
              </h4>
              <div className="space-y-1.5">
                {(flight.classPrices ?? []).map((cp) => (
                  <button
                    key={cp.cabin}
                    type="button"
                    onClick={() => setSelectedCabin(cp.cabin)}
                    className={`w-full flex justify-between items-center text-xs px-3 py-2 rounded-lg transition-all ${
                      selectedCabin === cp.cabin
                        ? 'bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-1 ring-sky-200 dark:ring-sky-500/30 font-bold'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="font-medium">{t(`search.${cp.cabin}`, { defaultValue: cp.label })}</span>
                    <span className={`font-bold ${selectedCabin === cp.cabin ? 'text-sky-700 dark:text-sky-300' : 'text-slate-700 dark:text-slate-300'}`}>
                      {formatPrice(cp.total)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-200">{t('results.card.fareRules')}</h4>
              <div className="space-y-2 text-xs">
                <p className="text-slate-400">
                  <span className="font-medium text-slate-200">{t('results.card.refund')}:</span> {price.refundableLabel}
                </p>
                <p className="text-slate-400">
                  <span className="font-medium text-slate-200">{t('results.card.baggage')}:</span> {flight.baggagePolicy}
                </p>
                <p className="text-slate-400">
                  <span className="font-medium text-slate-200">{t('results.card.aircraft')}:</span> {flight.segments[0]?.aircraft}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.65rem] text-slate-400">{t('results.card.refundability')}</span>
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
                {t('results.card.lastChecked', { time: new Date(price.lastUpdated).toLocaleTimeString(i18n.language) })}
                {isStale && (
                  <span className="ml-1 text-amber-400">{t('results.card.ago', { count: ageMinutes })}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
