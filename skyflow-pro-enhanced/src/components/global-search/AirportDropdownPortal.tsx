import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MapPin } from 'lucide-react'
import { AIRPORTS } from '../../mocks/mockSearchResults'

interface AirportDropdownPortalProps {
  query: string
  isOpen: boolean
  onSelect: (code: string) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
}

/**
 * Portal-based airport autocomplete dropdown.
 * Renders at document.body level to avoid clipping by parent overflow/z-index.
 */
export function AirportDropdownPortal({
  query,
  isOpen,
  onSelect,
  onClose,
  anchorRef,
}: AirportDropdownPortalProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  // Calculate position relative to anchor element
  useEffect(() => {
    if (!isOpen || !anchorRef.current) return

    function updatePosition() {
      if (!anchorRef.current) return
      const rect = anchorRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen, anchorRef])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, anchorRef])

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

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed rounded-xl bg-slate-900/98 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/60 overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 9999,
      }}
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
    </div>,
    document.body,
  )
}
