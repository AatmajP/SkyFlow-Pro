import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, Plane, SearchX } from 'lucide-react'
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
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(-1)
  }, [query])

  // Calculate position relative to anchor element
  useEffect(() => {
    if (!isOpen || !anchorRef.current) return

    function updatePosition() {
      if (!anchorRef.current) return
      const rect = anchorRef.current.getBoundingClientRect()
      // Adjust if it goes off bottom of screen
      const dropdownHeight = 350 // approx max height
      const spaceBelow = window.innerHeight - rect.bottom
      
      let top = rect.bottom + window.scrollY + 8
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        // Show above if not enough space below but enough space above
        top = rect.top + window.scrollY - dropdownHeight - 8
      }

      setPosition({
        top,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }

    updatePosition()
    // Use requestAnimationFrame for smoother scrolling updates
    let rafId: number
    const onScroll = () => {
      rafId = requestAnimationFrame(updatePosition)
    }

    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', updatePosition)
      cancelAnimationFrame(rafId)
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

  const { filtered, isPopular } = useMemo(() => {
    if (!query || query.length < 1) {
      // Default to popular global destinations
      const popularCodes = ['DXB', 'LHR', 'JFK', 'SIN', 'BOM', 'CDG']
      return {
        filtered: AIRPORTS.filter(a => popularCodes.includes(a.code)),
        isPopular: true
      }
    }
    const q = query.toLowerCase().trim()
    return {
      filtered: AIRPORTS.filter(
        (a) =>
          a.code.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q),
      ).slice(0, 8),
      isPopular: false
    }
  }, [query])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < filtered.length) {
          e.preventDefault()
          e.stopPropagation()
          onSelect(filtered[selectedIndex].code)
          onClose()
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    
    // Use capture phase to intercept Enter before form submission
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen, filtered, selectedIndex, onSelect, onClose])

  if (!isOpen) return null

  const portalContent = (
    <div
      ref={dropdownRef}
      className="fixed rounded-2xl bg-slate-900/98 backdrop-blur-2xl border border-slate-700/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transition-all duration-200"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 99999, // Ensure it's above everything
        maxHeight: '350px'
      }}
    >
      {/* Group Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          {isPopular ? (
            <>
              <Plane className="h-3.5 w-3.5 text-sky-400" />
              Popular Destinations
            </>
          ) : (
            <>
              <MapPin className="h-3.5 w-3.5 text-sky-400" />
              Search Results
            </>
          )}
        </h4>
      </div>

      <div className="overflow-y-auto custom-scrollbar p-1">
        {filtered.length > 0 ? (
          filtered.map((airport, idx) => {
            const isSelected = idx === selectedIndex
            return (
              <button
                key={airport.code}
                type="button"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 ${
                  isSelected 
                    ? 'bg-sky-500/20 border border-sky-500/30' 
                    : 'bg-transparent border border-transparent hover:bg-slate-800/60'
                }`}
                onClick={() => {
                  onSelect(airport.code)
                  onClose()
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-xs shadow-sm ${
                  isSelected ? 'bg-sky-500 text-white shadow-sky-500/20' : 'bg-slate-800 text-sky-400 border border-slate-700/50'
                }`}>
                  {airport.code}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate ${isSelected ? 'text-sky-300' : 'text-slate-200'}`}>
                    {airport.city}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {airport.code} — {airport.city}, {airport.country}
                  </p>
                </div>
              </button>
            )
          })
        ) : (
          <div className="px-4 py-8 text-center flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-800/50 flex items-center justify-center">
              <SearchX className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">No airports found</p>
              <p className="text-xs text-slate-500 mt-1">Try a different city, country or IATA code</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(portalContent, document.body)
}
