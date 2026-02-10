import { useState, useEffect } from 'react'
import { INTEREST_CATEGORIES, getDestinationsByInterest, type TravelInterestType, type SuggestedDestination } from '@/config'
import { X, Sparkles } from 'lucide-react'

interface DestinationSuggesterProps {
    onSelectCity: (code: string) => void
    className?: string
}

export function DestinationSuggester({ onSelectCity, className = '' }: DestinationSuggesterProps) {
    const [selectedInterest, setSelectedInterest] = useState<TravelInterestType | null>(null)
    const [suggestions, setSuggestions] = useState<SuggestedDestination[]>([])
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (selectedInterest) {
            setSuggestions(getDestinationsByInterest(selectedInterest))
        } else {
            setSuggestions([])
        }
    }, [selectedInterest])

    const handleSelectCity = (code: string) => {
        onSelectCity(code)
        setIsVisible(false) // Close after selection
        setSelectedInterest(null)
    }

    return (
        <div className={`mt-6 animate-fade-in ${className}`}>
            {!isVisible ? (
                <button
                    type="button"
                    onClick={() => setIsVisible(true)}
                    className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition-colors font-medium"
                >
                    <Sparkles className="h-4 w-4" />
                    Not sure where to go? Explore by interest
                </button>
            ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 relative">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-sky-400" />
                        Explore Destinations
                    </h4>

                    {/* Interest Categories */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {INTEREST_CATEGORIES.map((category) => {
                            const Icon = category.icon
                            const isSelected = selectedInterest === category.id
                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => setSelectedInterest(isSelected ? null : category.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isSelected
                                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                        }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {category.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Suggestions Grid */}
                    {selectedInterest && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
                            {suggestions.map((dest) => (
                                <button
                                    key={dest.code}
                                    type="button"
                                    onClick={() => handleSelectCity(dest.code)}
                                    className="group text-left p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800 border border-slate-700/50 hover:border-sky-500/30 transition-all duration-300"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-slate-200 group-hover:text-sky-400 transition-colors">
                                                {dest.city}
                                            </div>
                                            <div className="text-xs text-slate-500 mb-1">{dest.country}</div>
                                            <div className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                                                {dest.description}
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded group-hover:text-sky-400 transition-colors">
                                            {dest.code}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedInterest && suggestions.length === 0 && (
                        <p className="text-sm text-slate-500 italic">No suggestions found for this category.</p>
                    )}
                </div>
            )}
        </div>
    )
}
