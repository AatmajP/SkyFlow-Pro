import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, SearchX, Waves, Building2 } from 'lucide-react'
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
 *
 * WHY PORTAL:
 *   Rendering into document.body completely detaches the dropdown from
 *   any parent stacking context, overflow:hidden, or transform that would
 *   clip it.
 *
 * WHY position:fixed (NOT absolute):
 *   `fixed` positions relative to the **viewport**, which is exactly what
 *   getBoundingClientRect() returns.  No scroll offsets needed.
 *   `absolute` would require the portal container to be `position:relative`,
 *   and document.body is not — so absolute would break.
 *
 * POSITIONING MATH:
 *   rect = anchorRef.getBoundingClientRect()   // viewport coords
 *   top  = rect.bottom + gap                   // directly below input
 *   left = rect.left                           // left-aligned with input
 *   width = rect.width                         // same width as input
 *   NO scrollY/scrollX — fixed already uses viewport coords.
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

  // Reset keyboard selection when query changes
  useEffect(() => {
    setSelectedIndex(-1)
  }, [query])

  // ── Position calculation ──────────────────────────────────────────
  // position:fixed uses VIEWPORT coordinates.
  // getBoundingClientRect() returns VIEWPORT coordinates.
  // Therefore: top = rect.bottom, left = rect.left. No scroll offsets.
  const updatePosition = useCallback(() => {
    if (!anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const GAP = 6

    // Always position directly below the input
    setPosition({
      top: rect.bottom + GAP,
      left: rect.left,
      width: rect.width,
    })
  }, [anchorRef])

  // Recalculate on open, scroll, and resize
  useEffect(() => {
    if (!isOpen || !anchorRef.current) return

    // Initial position
    updatePosition()

    // Use rAF-throttled scroll handler for 60fps tracking
    let rafId = 0
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updatePosition)
    }

    window.addEventListener('scroll', onScroll, true) // capture phase for nested scrollers
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', updatePosition)
      cancelAnimationFrame(rafId)
    }
  }, [isOpen, anchorRef, updatePosition])

  // ── Close on outside click ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        anchorRef.current && !anchorRef.current.contains(target)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, anchorRef])

  // ── Smart search: prefix-first, then contains ─────────────────────
  const { groups, flatList, isSearching } = useMemo(() => {
    if (!query || query.length < 1) {
      // Default groups when input is empty/focused
      const beach = AIRPORTS.filter(a => a.type === 'beach').slice(0, 4)
      const popularCodes = ['DXB', 'LHR', 'JFK', 'SIN', 'CDG', 'HND']
      const popular = AIRPORTS.filter(a => popularCodes.includes(a.code))

      return {
        groups: [
          { label: '🌴 Beach Destinations', icon: Waves, items: beach },
          { label: '🏙 Popular Cities', icon: Building2, items: popular },
        ],
        flatList: [...beach, ...popular],
        isSearching: false,
      }
    }

    const q = query.toLowerCase().trim()

    // Priority 1: prefix matches (code/city/country starts with query)
    const prefixMatches = AIRPORTS.filter(a =>
      a.code.toLowerCase().startsWith(q) ||
      a.city.toLowerCase().startsWith(q) ||
      a.country.toLowerCase().startsWith(q),
    )

    // Priority 2: contains matches (excluding already-matched prefixes)
    const prefixSet = new Set(prefixMatches.map(a => a.code))
    const containsMatches = AIRPORTS.filter(a =>
      !prefixSet.has(a.code) && (
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
      ),
    )

    const combined = [...prefixMatches, ...containsMatches].slice(0, 8)

    return {
      groups: [{ label: '🔎 Search Results', icon: MapPin, items: combined }],
      flatList: combined,
      isSearching: true,
    }
  }, [query])

  // ── Keyboard navigation ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, flatList.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < flatList.length) {
            e.preventDefault()
            e.stopPropagation()
            onSelect(flatList[selectedIndex].code)
            onClose()
          }
          break
        case 'Escape':
          onClose()
          break
      }
    }

    // Capture phase so we intercept Enter before the <form> sees it
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen, flatList, selectedIndex, onSelect, onClose])

  // ── Render ────────────────────────────────────────────────────────
  if (!isOpen) return null

  let globalIdx = -1

  const dropdown = (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight: 360,
        zIndex: 999999,
      }}
      className="rounded-2xl border border-slate-700/60 overflow-hidden flex flex-col shadow-2xl"
    >
      {/* Opaque background — no backdrop-filter here to avoid creating stacking context */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ background: 'rgba(15, 23, 42, 0.98)' }}
      />

      <div className="relative overflow-y-auto" style={{ maxHeight: 360 }}>
        {flatList.length > 0 ? (
          groups.map((group) => (
            <div key={group.label}>
              {/* Group header */}
              <div
                className="sticky top-0 px-4 py-2.5 border-b border-slate-800/80"
                style={{ background: 'rgba(15, 23, 42, 0.95)' }}
              >
                <h4 className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  {isSearching
                    ? <MapPin className="h-3.5 w-3.5 text-sky-400" />
                    : <group.icon className="h-3.5 w-3.5 text-sky-400" />
                  }
                  {group.label}
                </h4>
              </div>

              {/* Items */}
              <div className="p-1">
                {group.items.map((airport) => {
                  globalIdx++
                  const isActive = globalIdx === selectedIndex
                  const capturedIdx = globalIdx
                  return (
                    <button
                      key={airport.code}
                      type="button"
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors duration-100 ${
                        isActive
                          ? 'bg-sky-500/15'
                          : 'hover:bg-slate-800/70'
                      }`}
                      onClick={() => {
                        onSelect(airport.code)
                        onClose()
                      }}
                      onMouseEnter={() => setSelectedIndex(capturedIdx)}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                          isActive
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-800 text-sky-400 border border-slate-700/50'
                        }`}
                      >
                        {airport.code}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold truncate ${isActive ? 'text-sky-300' : 'text-slate-200'}`}>
                          {airport.code} — {airport.city}, {airport.country}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-800/50 flex items-center justify-center">
              <SearchX className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">No airports found</p>
              <p className="text-xs text-slate-500 mt-1">Try a different city, country, or IATA code</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(dropdown, document.body)
}
