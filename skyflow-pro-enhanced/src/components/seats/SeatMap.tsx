/**
 * SeatMap — interactive, class-aware aircraft seat selection grid.
 *
 * Renders the cabin layout with proper aisle gaps, row labels,
 * column headers, hover tooltips, and click-to-select behaviour.
 * Fully controlled: parent manages `selectedSeatId`.
 */
import { useState, useCallback, useMemo } from 'react'
import type { Seat, SeatMapData } from '../../types/seat'

interface SeatMapProps {
  seatMap: SeatMapData
  selectedSeatId: string | null
  onSelectSeat: (seat: Seat) => void
}

/* ── colour tokens per pricing type ── */
const STATUS_COLORS = {
  available: {
    FREE: 'bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/40 hover:border-emerald-400',
    PAID: 'bg-sky-500/20 border-sky-500/40 hover:bg-sky-500/40 hover:border-sky-400',
    PREMIUM: 'bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/40 hover:border-amber-400',
  },
  selected: 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/30',
  booked: 'bg-slate-800/60 border-slate-700/40 text-slate-600 cursor-not-allowed',
  blocked: 'bg-slate-800/30 border-slate-800/20 text-slate-700 cursor-not-allowed',
}

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function SeatMap({ seatMap, selectedSeatId, onSelectSeat }: SeatMapProps) {
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const layout = seatMap.layouts[0]
  if (!layout) return null

  const seatsByRowCol = useMemo(() => {
    const map = new Map<string, Seat>()
    for (const s of seatMap.seats) {
      map.set(`${s.row}-${s.column}`, s)
    }
    return map
  }, [seatMap.seats])

  const rows = useMemo(() => {
    const r: number[] = []
    for (let i = layout.rowStart; i <= layout.rowEnd; i++) r.push(i)
    return r
  }, [layout])

  const handleSeatHover = useCallback((seat: Seat, e: React.MouseEvent) => {
    setHoveredSeat(seat)
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
  }, [])

  const handleSeatLeave = useCallback(() => setHoveredSeat(null), [])

  const handleClick = useCallback(
    (seat: Seat) => {
      if (!seat.isAvailable) return
      onSelectSeat(seat)
    },
    [onSelectSeat],
  )

  /* ── Build columns with aisle gaps ── */
  const columnsWithGaps = useMemo(() => {
    const result: ({ type: 'seat'; col: string; colIdx: number } | { type: 'aisle' })[] = []
    for (let ci = 0; ci < layout.columns.length; ci++) {
      result.push({ type: 'seat', col: layout.columns[ci], colIdx: ci })
      if (layout.aisleAfter.includes(ci)) {
        result.push({ type: 'aisle' })
      }
    }
    return result
  }, [layout])

  const seatSizePx = layout.seatWidth
  const gapPx = layout.seatGap
  const rowGapPx = layout.rowGap
  const isCompact = layout.classType === 'economy'

  return (
    <div className="relative select-none">
      {/* ── Column headers ── */}
      <div
        className="flex items-center mb-2"
        style={{ gap: `${gapPx}px`, paddingLeft: '36px' }}
      >
        {columnsWithGaps.map((item, i) =>
          item.type === 'aisle' ? (
            <div key={`aisle-h-${i}`} style={{ width: isCompact ? '24px' : '32px' }} />
          ) : (
            <div
              key={`col-${item.col}`}
              className="text-[10px] font-bold text-slate-500 text-center uppercase"
              style={{ width: `${seatSizePx}px` }}
            >
              {item.col}
            </div>
          ),
        )}
      </div>

      {/* ── Rows ── */}
      <div className="flex flex-col" style={{ gap: `${rowGapPx}px` }}>
        {rows.map((rowNum) => (
          <div
            key={rowNum}
            className="flex items-center"
            style={{ gap: `${gapPx}px` }}
          >
            {/* Row number label */}
            <div className="w-[30px] text-right pr-1.5">
              <span className="text-[10px] font-semibold text-slate-500 tabular-nums">
                {rowNum}
              </span>
            </div>

            {/* Seats + aisles */}
            {columnsWithGaps.map((item, ci) => {
              if (item.type === 'aisle') {
                return (
                  <div
                    key={`aisle-${rowNum}-${ci}`}
                    className="flex items-center justify-center"
                    style={{ width: isCompact ? '24px' : '32px' }}
                  >
                    <div className="h-[2px] w-3 rounded-full bg-slate-800" />
                  </div>
                )
              }

              const seat = seatsByRowCol.get(`${rowNum}-${item.col}`)
              if (!seat) {
                return <div key={`empty-${rowNum}-${ci}`} style={{ width: `${seatSizePx}px`, height: `${seatSizePx}px` }} />
              }

              const isSelected = seat.seatId === selectedSeatId
              const isAvailable = seat.isAvailable

              let seatClass = ''
              if (isSelected) {
                seatClass = STATUS_COLORS.selected
              } else if (!isAvailable) {
                seatClass = STATUS_COLORS.booked
              } else {
                seatClass = STATUS_COLORS.available[seat.type]
              }

              return (
                <button
                  key={seat.seatId}
                  id={`seat-${seat.label}`}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => handleClick(seat)}
                  onMouseEnter={(e) => handleSeatHover(seat, e)}
                  onMouseLeave={handleSeatLeave}
                  className={`
                    relative border rounded-lg flex items-center justify-center
                    text-[9px] font-bold transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-sky-500/50
                    ${seatClass}
                    ${isAvailable ? 'cursor-pointer active:scale-90' : ''}
                    ${isSelected ? 'scale-105 ring-2 ring-sky-400/50' : ''}
                  `}
                  style={{
                    width: `${seatSizePx}px`,
                    height: `${seatSizePx}px`,
                  }}
                  aria-label={`Seat ${seat.label}${!isAvailable ? ' (booked)' : ''} ${seat.price > 0 ? formatter.format(seat.price) : 'Free'}`}
                >
                  {isSelected && (
                    <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {!isSelected && isAvailable && (
                    <span className={`
                      ${seat.type === 'PREMIUM' ? 'text-amber-300/80' : seat.type === 'PAID' ? 'text-sky-300/80' : 'text-emerald-300/80'}
                    `}>
                      {seat.label}
                    </span>
                  )}
                  {!isAvailable && (
                    <svg className="h-3 w-3 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.364 5.636a1 1 0 010 1.414L13.414 12l4.95 4.95a1 1 0 01-1.414 1.414L12 13.414l-4.95 4.95a1 1 0 01-1.414-1.414L10.586 12 5.636 7.05a1 1 0 011.414-1.414L12 10.586l4.95-4.95a1 1 0 011.414 0z" />
                    </svg>
                  )}

                  {/* Paid seat price dot indicator */}
                  {isAvailable && !isSelected && seat.price > 0 && (
                    <div className={`absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ${
                      seat.type === 'PREMIUM' ? 'bg-amber-400' : 'bg-sky-400'
                    }`} />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* ── Tooltip ── */}
      {hoveredSeat && (
        <div
          className="fixed z-[200] pointer-events-none animate-fade-in"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="glass rounded-xl px-3 py-2 shadow-xl border border-slate-700/50 whitespace-nowrap">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-slate-50">Seat {hoveredSeat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                hoveredSeat.type === 'PREMIUM'
                  ? 'bg-amber-500/20 text-amber-300'
                  : hoveredSeat.type === 'PAID'
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {hoveredSeat.type === 'FREE' ? 'Free' : hoveredSeat.type}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <p>
                {hoveredSeat.position.charAt(0).toUpperCase() + hoveredSeat.position.slice(1)} seat
                {hoveredSeat.price > 0 && <span className="text-sky-300 ml-1">· {formatter.format(hoveredSeat.price)}</span>}
              </p>
              {hoveredSeat.features && hoveredSeat.features.length > 0 && (
                <p className="text-amber-300/80">{hoveredSeat.features.join(' · ')}</p>
              )}
              {!hoveredSeat.isAvailable && <p className="text-red-400">Unavailable</p>}
            </div>
            {/* tooltip arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-700/50" />
          </div>
        </div>
      )}
    </div>
  )
}
