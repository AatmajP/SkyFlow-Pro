/**
 * Airport Autocomplete Input Component
 * 
 * Provides intelligent autocomplete suggestions while typing airport/city names.
 * Keyboard accessible and follows ARIA best practices.
 */

import { useState, useRef, useEffect } from 'react'
import { searchAirports, type Airport } from '@/data'
import { MapPin, X } from 'lucide-react'

interface AirportAutocompleteProps {
    value: string
    onChange: (value: string) => void
    label: string
    placeholder?: string
    required?: boolean
    icon?: React.ReactNode
}

export function AirportAutocomplete({
    value,
    onChange,
    label,
    placeholder = 'City or airport code',
    required = false,
    icon,
}: AirportAutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState(value)
    const [suggestions, setSuggestions] = useState<Airport[]>([])
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Search for airports when input changes
    useEffect(() => {
        if (inputValue.length >= 1) {
            const results = searchAirports(inputValue, 8)
            setSuggestions(results)
            setIsOpen(results.length > 0)
        } else {
            setSuggestions([])
            setIsOpen(false)
        }
    }, [inputValue])

    // Sync with external value changes
    useEffect(() => {
        setInputValue(value)
    }, [value])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase()
        setInputValue(val)
        onChange(val)
        setSelectedIndex(-1)
    }

    const handleSelectAirport = (airport: Airport) => {
        setInputValue(airport.code)
        onChange(airport.code)
        setIsOpen(false)
        setSelectedIndex(-1)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown') {
                setIsOpen(true)
            }
            return
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                )
                break

            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
                break

            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSelectAirport(suggestions[selectedIndex])
                }
                break

            case 'Escape':
                setIsOpen(false)
                setSelectedIndex(-1)
                break
        }
    }

    const handleClear = () => {
        setInputValue('')
        onChange('')
        setSuggestions([])
        setIsOpen(false)
        inputRef.current?.focus()
    }

    return (
        <div ref={wrapperRef} className="relative">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                {label}
            </label>

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setIsOpen(true)
                        }
                    }}
                    placeholder={placeholder}
                    required={required}
                    className="input-premium pr-20"
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
                    aria-controls="airport-suggestions"
                />

                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    {inputValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-slate-500 hover:text-slate-300 transition-colors"
                            aria-label="Clear input"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    <div className="text-slate-500">
                        {icon || <MapPin className="h-5 w-5" />}
                    </div>
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div
                    id="airport-suggestions"
                    role="listbox"
                    className="absolute z-50 mt-2 w-full rounded-xl bg-slate-900 border border-slate-700 shadow-2xl max-h-80 overflow-y-auto"
                >
                    {suggestions.map((airport, index) => (
                        <button
                            key={airport.code}
                            type="button"
                            role="option"
                            aria-selected={index === selectedIndex}
                            onClick={() => handleSelectAirport(airport)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`w-full text-left px-4 py-3 border-b border-slate-800 last:border-b-0 transition-colors ${index === selectedIndex
                                    ? 'bg-sky-500/10 text-sky-300'
                                    : 'text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-slate-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{airport.city}</span>
                                        <span className="text-xs text-slate-500">({airport.code})</span>
                                    </div>
                                    <div className="text-xs text-slate-500 truncate">
                                        {airport.name}, {airport.country}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
