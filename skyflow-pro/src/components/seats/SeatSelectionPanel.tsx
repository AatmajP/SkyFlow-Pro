/**
 * SeatSelectionPanel — full seat-selection experience.
 *
 * Features:
 * • Class selector tabs (economy / premium / business)
 * • Interactive SeatMap
 * • Legend + pricing summary
 * • Auto-assign button (skip seat selection)
 * • "View Cabin in 3D" button (optional enhancement)
 * • Dynamic total price update
 *
 * UX Rule: the user is NEVER forced to use 3D or manual selection.
 * If they click "Skip", auto-assign gives them the best free seat.
 */
import { useState, useEffect, useCallback } from 'react'
import { Move3D, ChevronDown, ChevronUp, Info, Zap, Armchair } from 'lucide-react'
import type { CabinClass } from '../../types/flight'
import type { Seat, SeatMapData } from '../../types/seat'
import { SeatService } from '../../services/seatService'
import { SeatMap } from './SeatMap'
import { CabinPreview3D } from '../cabin/CabinPreview3D'

interface SeatSelectionPanelProps {
  flightId: string
  cabinClass: CabinClass
  aircraft?: string
  onSeatSelected: (seat: Seat | null) => void
  selectedSeat: Seat | null
}

const CLASS_TABS: { cabin: CabinClass; label: string; icon: string }[] = [
  { cabin: 'economy', label: 'Economy', icon: '✈️' },
  { cabin: 'premium_economy', label: 'Premium', icon: '💎' },
  { cabin: 'business', label: 'Business', icon: '👑' },
]

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function SeatSelectionPanel({
  flightId,
  cabinClass,
  aircraft,
  onSeatSelected,
  selectedSeat,
}: SeatSelectionPanelProps) {
  const [activeClass, setActiveClass] = useState<CabinClass>(cabinClass)
  const [seatMap, setSeatMap] = useState<SeatMapData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)
  const [autoAssigning, setAutoAssigning] = useState(false)
  const [show3D, setShow3D] = useState(false)

  // Load seat map when class changes
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    SeatService.getSeatMap(flightId, activeClass).then((map) => {
      if (!cancelled) {
        setSeatMap(map)
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [flightId, activeClass])

  const handleSelectSeat = useCallback(
    (seat: Seat) => {
      if (selectedSeat?.seatId === seat.seatId) {
        onSeatSelected(null) // deselect
      } else {
        onSeatSelected(seat)
      }
    },
    [selectedSeat, onSeatSelected],
  )

  const handleAutoAssign = useCallback(async () => {
    setAutoAssigning(true)
    try {
      const result = await SeatService.assignSeat({
        flightId,
        cabinClass: activeClass,
      })
      if (result.assignedSeats.length > 0) {
        onSeatSelected(result.assignedSeats[0])
      }
    } finally {
      setAutoAssigning(false)
    }
  }, [flightId, activeClass, onSeatSelected])

  const handleClassChange = useCallback((cabin: CabinClass) => {
    setActiveClass(cabin)
    onSeatSelected(null) // clear selection when changing class
  }, [onSeatSelected])

  return (
    <div className="glass rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center">
            <Armchair className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-50">Select Your Seat</h3>
            <p className="text-xs text-slate-400">
              {selectedSeat
                ? `Seat ${selectedSeat.label} selected${selectedSeat.price > 0 ? ` · ${formatter.format(selectedSeat.price)}` : ' · Free'}`
                : 'Choose a seat or let us assign the best one'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedSeat && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {selectedSeat.label}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-5">
          {/* ── Class tabs ── */}
          <div className="flex gap-2">
            {CLASS_TABS.map((tab) => (
              <button
                key={tab.cabin}
                type="button"
                onClick={() => handleClassChange(tab.cabin)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  activeClass === tab.cabin
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-md shadow-sky-500/10'
                    : 'bg-slate-800/30 text-slate-400 border border-transparent hover:bg-slate-800/50 hover:text-slate-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Action buttons ── */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAutoAssign}
              disabled={autoAssigning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all duration-300 disabled:opacity-50"
            >
              {autoAssigning ? (
                <div className="h-3.5 w-3.5 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
              Auto-assign best free seat
            </button>

            <button
              type="button"
              onClick={() => setShow3D(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-all duration-300"
            >
              <Move3D className="h-3.5 w-3.5" />
              View Cabin in 3D
            </button>
          </div>

          {/* ── Seat map ── */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Loading seat map…</p>
              </div>
            </div>
          ) : seatMap ? (
            <div className="relative">
              {/* Aircraft nose indicator */}
              <div className="flex justify-center mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/30">
                  <div className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Front of aircraft</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                </div>
              </div>

              {/* Scrollable seat map container */}
              <div className="max-h-[400px] overflow-y-auto overflow-x-auto rounded-xl bg-slate-900/50 border border-slate-800/50 p-4 custom-scrollbar">
                <SeatMap
                  seatMap={seatMap}
                  selectedSeatId={selectedSeat?.seatId ?? null}
                  onSelectSeat={handleSelectSeat}
                />
              </div>

              {/* Aircraft tail indicator */}
              <div className="flex justify-center mt-3">
                <div className="px-3 py-1 rounded-full bg-slate-800/30">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Rear</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* ── Legend ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-800/20 border border-slate-800/30">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded border bg-emerald-500/20 border-emerald-500/40" />
              <span className="text-[11px] text-slate-400">Available (Free)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded border bg-sky-500/20 border-sky-500/40">
                <div className="h-1.5 w-1.5 rounded-full bg-sky-400 ml-auto -mt-0.5 mr-[-2px]" />
              </div>
              <span className="text-[11px] text-slate-400">Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded border bg-amber-500/20 border-amber-500/40">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 ml-auto -mt-0.5 mr-[-2px]" />
              </div>
              <span className="text-[11px] text-slate-400">Premium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded border bg-slate-800/60 border-slate-700/40 flex items-center justify-center">
                <svg className="h-2.5 w-2.5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.364 5.636a1 1 0 010 1.414L13.414 12l4.95 4.95a1 1 0 01-1.414 1.414L12 13.414l-4.95 4.95a1 1 0 01-1.414-1.414L10.586 12 5.636 7.05a1 1 0 011.414-1.414L12 10.586l4.95-4.95a1 1 0 011.414 0z" />
                </svg>
              </div>
              <span className="text-[11px] text-slate-400">Booked</span>
            </div>
          </div>

          {/* ── Availability info ── */}
          {seatMap && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-sky-950/20 border border-sky-500/10">
              <Info className="h-4 w-4 text-sky-400 shrink-0" />
              <p className="text-[11px] text-sky-300/80">
                {seatMap.availableSeats} of {seatMap.totalSeats} seats available in {CLASS_TABS.find(t => t.cabin === activeClass)?.label ?? activeClass}.
                {selectedSeat && selectedSeat.price > 0 && (
                  <span className="ml-1 text-amber-300">
                    Seat surcharge: {formatter.format(selectedSeat.price)}
                  </span>
                )}
                {selectedSeat && selectedSeat.price === 0 && (
                  <span className="ml-1 text-emerald-300">
                    No extra charge for this seat ✓
                  </span>
                )}
              </p>
            </div>
          )}

          {/* ── Selected seat details card ── */}
          {selectedSeat && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-500/10 to-purple-500/10 border border-sky-500/20 animate-scale-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/30">
                    {selectedSeat.label}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-50">
                      Seat {selectedSeat.label}
                    </p>
                    <p className="text-xs text-slate-400">
                      {selectedSeat.position.charAt(0).toUpperCase() + selectedSeat.position.slice(1)} seat
                      {selectedSeat.features && selectedSeat.features.length > 0
                        ? ` · ${selectedSeat.features.join(', ')}`
                        : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {selectedSeat.price > 0 ? (
                    <>
                      <p className="text-lg font-bold text-sky-400">{formatter.format(selectedSeat.price)}</p>
                      <p className="text-[10px] text-slate-500">seat surcharge</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-emerald-400">Free</p>
                      <p className="text-[10px] text-slate-500">included</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <CabinPreview3D
            isOpen={show3D}
            onClose={() => setShow3D(false)}
            aircraft={aircraft}
            cabinClass={activeClass}
            seatMap={seatMap}
            selectedSeatId={selectedSeat?.seatId ?? null}
            onSeatSelected={(seat) => handleSelectSeat(seat)}
          />
        </div>
      )}
    </div>
  )
}
