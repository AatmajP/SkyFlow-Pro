import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Luggage, ChevronDown, ChevronUp, Leaf, Shield, Info } from 'lucide-react'
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
    <article className="card-flight mb-6">
      {/* Main content */}
      <div className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left side - Flight info */}
          <div className="flex flex-1 gap-6 items-start">
            {/* Airline logo placeholder */}
            <div className="hidden sm:flex shrink-0">
              <div className="h-20 w-20 rounded-3xl bg-white border border-slate-100 flex items-center justify-center text-slate-950 font-black text-2xl shadow-sm group-hover:shadow-md transition-shadow">
                {flight.segments[0]?.marketingCarrierCode}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {/* Airline and flight info */}
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-base font-black text-slate-950 tracking-tight">
                  {flight.segments[0]?.marketingCarrier}
                </p>
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  {flight.segments[0]?.marketingCarrierCode}
                  {flight.segments[0]?.flightNumber}
                </span>
                {flight.alliance && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-sm scale-95 origin-left">
                    {flight.alliance}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {flight.fareBrand}
                </span>
              </div>

              {/* Route and time */}
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-8">
                  <div className="text-left w-20">
                    <p className="text-xl font-bold text-slate-900">
                      {flight.segments[0]?.departureTime && formatTime(flight.segments[0].departureTime)}
                    </p>
                    <p className="text-sm text-slate-500 font-medium mt-1">{flight.from}</p>
                  </div>

                  <div className="flex flex-col items-center gap-2 min-w-[160px]">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{formatDuration(flight.totalDurationMinutes)}</p>
                    <div className="relative flex items-center w-full">
                      <div className="h-[1px] flex-1 bg-slate-100" />
                      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center bg-white">
                        <div className="h-2 w-2 rounded-full border border-slate-200 bg-white" />
                      </div>
                      <div className="h-[1px] flex-1 bg-slate-100" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {flight.stops === 0 ? (
                        <span className="text-emerald-600">Direct</span>
                      ) : (
                        <span className="text-slate-600">{flight.stops} stop{flight.stops > 1 ? 's' : ''}</span>
                      )}
                    </p>
                  </div>

                  <div className="text-right w-20">
                     <p className="text-xl font-bold text-slate-900">
                      {flight.segments[flight.segments.length - 1]?.arrivalTime &&
                        formatTime(flight.segments[flight.segments.length - 1].arrivalTime)}
                    </p>
                    <p className="text-sm text-slate-500 font-medium mt-1">{flight.to}</p>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-5 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-auto bg-slate-50/50 px-4 py-2 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-2">
                    <Luggage className="h-3.5 w-3.5 text-slate-400" />
                    <span>Checked</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Leaf className="h-3.5 w-3.5" />
                    <span>{price.carbonEstimateKg}kg CO₂</span>
                  </div>
                </div>
              </div>

              {/* Layover info */}
              {flight.layovers.length > 0 && (
                <p className="text-sm text-slate-500">
                  <span className="text-slate-700 font-semibold">Layover:</span>{' '}
                  {flight.layovers[0]?.airport} · {formatDuration(flight.layovers[0]?.durationMinutes ?? 0)}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Price and CTA */}
          <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 lg:border-0 lg:pt-0 lg:pl-8 lg:border-l lg:min-w-[240px]">
             <div className="flex lg:flex-col justify-between items-end gap-1">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total fare</p>
               <p className="text-4xl font-black text-slate-950 tracking-tighter">
                 {formatter.format(price.total)}
               </p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 {formatter.format(price.perPassenger)} / person
               </p>
             </div>

            <div className="flex flex-col gap-2 w-full mt-2 lg:mt-0">
              <button
                type="button"
                onClick={handleSelect}
                className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest flex-1 group active:scale-95 transition-all duration-200"
              >
                Select Flight <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-transparent hover:text-slate-900 transition-all flex items-center justify-center gap-1"
              >
                {isExpanded ? 'Hide Details' : 'View Details'}
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-100 animate-fade-in-up">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            {/* Price breakdown */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-400" />
                Price Breakdown
              </h4>
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base fare</span>
                  <span className="font-semibold text-slate-700">{formatter.format(price.baseFare)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Taxes & fees</span>
                  <span className="font-semibold text-slate-700">{formatter.format(price.taxesAndFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Carrier charges</span>
                  <span className="font-semibold text-slate-700">{formatter.format(price.carrierCharges)}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-lg text-slate-900">{formatter.format(price.total)}</span>
                </div>
              </div>
            </div>

            {/* Detailed breakdown */}
            <div className="space-y-4">
               <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Info className="h-4 w-4 text-slate-400" />
                Fee Details
              </h4>
              <div className="space-y-2 bg-white p-5 rounded-2xl border border-slate-200 text-xs">
                {price.breakdown.map((item) => (
                  <div key={item.label} className="flex justify-between py-1 border-b border-slate-50 last:border-0">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-semibold text-slate-700">{formatter.format(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="space-y-4 text-sm">
              <h4 className="font-bold text-slate-900">Fare Rules</h4>
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200">
                <p className="text-slate-500">
                  <span className="font-semibold text-slate-700 block mb-1">Refund policy:</span>
                  {price.refundableLabel}
                </p>
                <p className="text-slate-500 mt-3 pt-3 border-t border-slate-50">
                  <span className="font-semibold text-slate-700 block mb-1">Baggage:</span>
                  {flight.baggagePolicy}
                </p>
                
                <div className="mt-4 inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className={`h-2 w-2 rounded-full ${isHighRefund ? 'bg-emerald-500' : isLowRefund ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <span className="text-xs font-semibold text-slate-600">Flexibility: {price.refundabilityScore}/100</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Pricing active as of: {new Date(price.lastUpdated).toLocaleTimeString()}
                {isStale && (
                  <span className="ml-1 text-slate-500 font-semibold">• Updated {ageMinutes}m ago</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
