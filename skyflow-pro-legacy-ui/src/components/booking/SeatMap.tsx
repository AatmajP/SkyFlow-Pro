/**
 * Seat Selection Map Component - PREMIUM UI
 *
 * Interactive aircraft seat map with premium visuals:
 * - 🟩 Green  → Standard (FREE)
 * - 🟦 Blue   → Preferred Window/Aisle (PAID)
 * - 🟪 Purple → Premium Extra Legroom (PAID)
 * - ✖  Grey   → Booked / Unavailable
 *
 * Features:
 * - Hover glow effect on each seat
 * - Floating tooltip showing seat price (Popper-style positioning)
 * - Smooth selection animation
 * - Clear visual color system
 */

import { useState, useMemo, useRef, useCallback } from 'react'
import { Check, X, Plane, Sparkles } from 'lucide-react'
import {
    generateSeatMap,
    autoAssignSeat,
    getSeatMapStats,
    SEAT_TYPE_INFO,
    type Seat,
    type SeatType,
} from '../../services/seatService'

interface SeatMapProps {
    flightId: string
    onSeatSelected: (seat: Seat | null) => void
    selectedSeat?: Seat | null
}

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
})

export function SeatMap({ flightId, onSeatSelected, selectedSeat }: SeatMapProps) {
    const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null)
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
    const mapRef = useRef<HTMLDivElement>(null)

    // Generate seats (memoized by flightId so it's consistent)
    const seats = useMemo(() => generateSeatMap(flightId), [flightId])

    // Apply selection state
    const seatMap = useMemo(() => {
        return seats.map((s) => ({
            ...s,
            status: selectedSeat?.id === s.id ? ('selected' as const) : s.status,
        }))
    }, [seats, selectedSeat])

    const stats = useMemo(() => getSeatMapStats(seatMap), [seatMap])

    // Group seats by row
    const seatsByRow = useMemo(() => {
        const grouped: Record<number, Seat[]> = {}
        seatMap.forEach((seat) => {
            if (!grouped[seat.row]) grouped[seat.row] = []
            grouped[seat.row].push(seat)
        })
        return grouped
    }, [seatMap])

    const rows = Object.keys(seatsByRow)
        .map(Number)
        .sort((a, b) => a - b)

    const handleSeatClick = (seat: Seat) => {
        if (seat.status === 'booked') return

        if (selectedSeat?.id === seat.id) {
            onSeatSelected(null) // Deselect
        } else {
            onSeatSelected(seat)
        }
    }

    const handleAutoAssign = () => {
        const autoSeat = autoAssignSeat(seats)
        if (autoSeat) {
            onSeatSelected(autoSeat)
        }
    }

    const handleSeatHover = useCallback((seat: Seat | null, event?: React.MouseEvent) => {
        setHoveredSeat(seat)
        if (seat && event && mapRef.current) {
            const mapRect = mapRef.current.getBoundingClientRect()
            const btnRect = (event.target as HTMLElement).getBoundingClientRect()
            setTooltipPos({
                x: btnRect.left + btnRect.width / 2 - mapRect.left,
                y: btnRect.top - mapRect.top - 8,
            })
        } else {
            setTooltipPos(null)
        }
    }, [])

    const getSeatClass = (seat: Seat): string => {
        if (seat.status === 'booked') return 'seat-btn seat-booked'
        if (seat.status === 'selected' || selectedSeat?.id === seat.id)
            return 'seat-btn seat-selected animate-seat-pop'

        switch (seat.type) {
            case 'STANDARD':
                return 'seat-btn seat-standard cursor-pointer'
            case 'PREFERRED':
                return 'seat-btn seat-preferred cursor-pointer'
            case 'PREMIUM':
                return 'seat-btn seat-premium cursor-pointer'
        }
    }

    const getSeatTypeColor = (type: SeatType): string => {
        switch (type) {
            case 'STANDARD': return 'text-emerald-400'
            case 'PREFERRED': return 'text-sky-400'
            case 'PREMIUM': return 'text-purple-400'
        }
    }

    const getSeatTypeBg = (type: SeatType): string => {
        switch (type) {
            case 'STANDARD': return 'bg-emerald-500'
            case 'PREFERRED': return 'bg-sky-500'
            case 'PREMIUM': return 'bg-purple-500'
        }
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center shadow-sm">
                        <Plane className="h-6 w-6 text-slate-800" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Select Your Seat</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            {stats.available} seats available · {stats.freeSeats} free seats
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleAutoAssign}
                    className="btn-secondary text-xs flex items-center gap-2"
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    Auto-assign (Free)
                </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                {(Object.entries(SEAT_TYPE_INFO) as [SeatType, typeof SEAT_TYPE_INFO[SeatType]][]).map(
                    ([type, info]) => (
                        <div key={type} className="flex items-center gap-2 text-sm">
                            <div className={`h-5 w-5 rounded-md ${getSeatTypeBg(type)} opacity-80 shadow-sm`} />
                            <span className={getSeatTypeColor(type) + ' font-bold'}>{info.label}</span>
                            <span className="text-slate-500 font-medium">
                                {type === 'STANDARD' ? '(Free)' : `($${type === 'PREFERRED' ? '15' : '35'})`}
                            </span>
                        </div>
                    )
                )}
                <div className="flex items-center gap-2 text-sm">
                    <div className="h-5 w-5 rounded-md bg-slate-200" />
                    <span className="text-slate-500 font-medium">Booked</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="h-5 w-5 rounded-md bg-slate-900 shadow-sm" />
                    <span className="text-slate-900 font-bold">Your Seat</span>
                </div>
            </div>

            {/* Selected Seat Info */}
            {selectedSeat && (
                <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                            <Check className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-emerald-900">
                                Seat {selectedSeat.seatNumber} selected
                            </p>
                            <p className="text-sm font-medium text-emerald-700 mt-1">
                                {SEAT_TYPE_INFO[selectedSeat.type].label}
                                {selectedSeat.isWindow ? ' · Window' : ''}
                                {selectedSeat.isAisle ? ' · Aisle' : ''}
                                {selectedSeat.isExit ? ' · Exit row' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="sm:text-right">
                        <p className="text-2xl font-black text-emerald-700">
                            {selectedSeat.price === 0 ? 'FREE' : formatter.format(selectedSeat.price)}
                        </p>
                        <button
                            onClick={() => onSeatSelected(null)}
                            className="mt-1 text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                        >
                            Change
                        </button>
                    </div>
                </div>
            )}

            {/* Seat Map Grid */}
            <div className="overflow-x-auto" ref={mapRef}>
                <div className="min-w-[380px] max-w-lg mx-auto relative">
                    {/* Aircraft nose visual */}
                    <div className="flex justify-center mb-6">
                        <div className="w-40 h-10 rounded-t-[50%] bg-slate-50 border border-b-0 border-slate-200" />
                    </div>

                    {/* Column headers */}
                    <div className="grid grid-cols-[auto_repeat(3,1fr)_1.5rem_repeat(3,1fr)] gap-1.5 mb-3 px-2">
                        <div className="w-9" />
                        {['A', 'B', 'C'].map((col) => (
                            <div key={col} className="text-center text-[0.7rem] font-semibold text-slate-500 uppercase">
                                {col}
                            </div>
                        ))}
                        <div /> {/* Aisle */}
                        {['D', 'E', 'F'].map((col) => (
                            <div key={col} className="text-center text-[0.7rem] font-semibold text-slate-500 uppercase">
                                {col}
                            </div>
                        ))}
                    </div>

                    {/* Seat rows */}
                    <div className="space-y-1.5">
                        {rows.map((rowNum) => {
                            const rowSeats = seatsByRow[rowNum] || []
                            const isExitRow = rowSeats[0]?.isExit

                            return (
                                <div key={rowNum}>
                                    {isExitRow && (
                                        <div className="flex items-center gap-3 my-4">
                                            <div className="flex-1 h-px bg-slate-200" />
                                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest px-2">
                                                Exit Row
                                            </span>
                                            <div className="flex-1 h-px bg-slate-200" />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-[auto_repeat(3,1fr)_1.5rem_repeat(3,1fr)] gap-1.5 px-2">
                                        {/* Row number */}
                                        <div className="w-9 flex items-center justify-center text-[0.7rem] text-slate-600 font-mono font-medium">
                                            {rowNum}
                                        </div>

                                        {/* Left side (A, B, C) */}
                                        {rowSeats
                                            .filter((s) => ['A', 'B', 'C'].includes(s.col))
                                            .map((seat) => (
                                                <SeatButton
                                                    key={seat.id}
                                                    seat={seat}
                                                    isSelected={selectedSeat?.id === seat.id}
                                                    seatClass={getSeatClass(seat)}
                                                    onClick={() => handleSeatClick(seat)}
                                                    onHover={handleSeatHover}
                                                />
                                            ))}

                                        {/* Aisle */}
                                        <div className="flex items-center justify-center">
                                            <div className="w-px h-full bg-slate-800/30" />
                                        </div>

                                        {/* Right side (D, E, F) */}
                                        {rowSeats
                                            .filter((s) => ['D', 'E', 'F'].includes(s.col))
                                            .map((seat) => (
                                                <SeatButton
                                                    key={seat.id}
                                                    seat={seat}
                                                    isSelected={selectedSeat?.id === seat.id}
                                                    seatClass={getSeatClass(seat)}
                                                    onClick={() => handleSeatClick(seat)}
                                                    onHover={handleSeatHover}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Aircraft tail visual */}
                    <div className="flex justify-center mt-6 mb-4">
                        <div className="w-32 h-8 rounded-b-[40%] bg-slate-50 border border-t-0 border-slate-200" />
                    </div>

                    {/* Floating Tooltip (Popper.js style positioning) */}
                    {hoveredSeat && hoveredSeat.status !== 'booked' && tooltipPos && (
                        <div
                            className="absolute z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-4 min-w-[200px] animate-fade-in pb-1 pointer-events-none"
                            style={{
                                left: `${tooltipPos.x}px`,
                                top: `${tooltipPos.y - 12}px`,
                                transform: 'translateX(-50%) translateY(-100%)',
                            }}
                        >
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="text-left">
                                    <p className="text-base font-bold text-slate-900">
                                        Seat {hoveredSeat.seatNumber}
                                    </p>
                                    <p className={`text-xs font-bold mt-1 ${getSeatTypeColor(hoveredSeat.type)}`}>
                                        {SEAT_TYPE_INFO[hoveredSeat.type].label}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500 mt-1">
                                        {hoveredSeat.isWindow && 'Window '}
                                        {hoveredSeat.isAisle && 'Aisle '}
                                        {hoveredSeat.isExit && 'Exit Room '}
                                    </p>
                                </div>
                                <div className="text-right pl-4 border-l border-slate-100">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Price</p>
                                    <p className="text-lg font-black text-slate-900">
                                        {hoveredSeat.price === 0 ? 'FREE' : formatter.format(hoveredSeat.price)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function SeatButton({
    seat,
    isSelected,
    seatClass,
    onClick,
    onHover,
}: {
    seat: Seat
    isSelected: boolean
    seatClass: string
    onClick: () => void
    onHover: (seat: Seat | null, event?: React.MouseEvent) => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={(e) => onHover(seat, e)}
            onMouseLeave={() => onHover(null)}
            disabled={seat.status === 'booked'}
            className={`h-10 w-full text-[0.65rem] font-semibold ${seatClass}`}
            aria-label={
                seat.status === 'booked'
                    ? `Seat ${seat.seatNumber} - Booked`
                    : `Seat ${seat.seatNumber} - ${SEAT_TYPE_INFO[seat.type].label} - ${seat.price === 0 ? 'Free' : '$' + seat.price}`
            }
        >
            {seat.status === 'booked' ? (
                <X className="h-3.5 w-3.5" />
            ) : isSelected ? (
                <Check className="h-4 w-4" />
            ) : (
                seat.col
            )}
        </button>
    )
}
