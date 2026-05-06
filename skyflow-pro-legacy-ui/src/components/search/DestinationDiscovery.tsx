import { useState } from 'react'
import { Plane, MapPin, TrendingUp } from 'lucide-react'
import {
    TRAVEL_INTENTS,
    getDestinationsByIntent,
    getTopDestinations,
    type TravelIntent,
    type Destination,
} from '../../data/destinations'

interface DestinationDiscoveryProps {
    onSelectDestination?: (airportCode: string) => void
}

// Map city names to premium travel photos
function getCityPhoto(city: string): string {
    const photos: Record<string, string> = {
        'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Phuket': 'https://images.unsplash.com/photo-1589394815804-964ce0ff96f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Miami': 'https://images.unsplash.com/photo-1514369118554-e20d93546b30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Manali': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Kathmandu': 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'Zurich': 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    }
    // Fallback abstract travel photo
    return photos[city] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
}

export function DestinationDiscovery({ onSelectDestination }: DestinationDiscoveryProps) {
    const [selectedIntent, setSelectedIntent] = useState<TravelIntent | null>(null)

    const destinations = selectedIntent
        ? getDestinationsByIntent(selectedIntent)
        : getTopDestinations(6)

    return (
        <section className="animate-fade-in w-full max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="flex flex-col mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Explore Destinations</h2>
                <p className="text-lg text-slate-500">
                    Find the perfect backdrop for your next story.
                </p>
            </div>

            {/* Intent Chips */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
                <button
                    onClick={() => setSelectedIntent(null)}
                    className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 ${selectedIntent === null
                        ? 'bg-slate-900 text-white shadow-xl scale-105'
                        : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                        }`}
                >
                    <TrendingUp className="inline h-4 w-4 mr-2" />
                    Trending
                </button>
                {TRAVEL_INTENTS.map((intent) => (
                    <button
                        key={intent.id}
                        onClick={() => setSelectedIntent(intent.id)}
                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 ${selectedIntent === intent.id
                            ? `bg-slate-900 text-white shadow-xl scale-105`
                            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        <span className="mr-2 text-base group-hover:scale-110 transition-transform">{intent.icon}</span>
                        {intent.label}
                    </button>
                ))}
            </div>

            {/* Destination Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {destinations.map((dest, idx) => (
                    <DestinationCard
                        key={dest.airportCode}
                        destination={dest}
                        index={idx}
                        onSelect={() => onSelectDestination?.(dest.airportCode)}
                    />
                ))}
            </div>

            {destinations.length === 0 && (
                <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-3xl">
                    <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg font-medium">No destinations found for this category.</p>
                </div>
            )}
        </section>
    )
}

function DestinationCard({
    destination,
    index,
    onSelect,
}: {
    destination: Destination
    index: number
    onSelect: () => void
}) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    })

    return (
        <article
            className="group relative h-[400px] w-full overflow-hidden rounded-[2rem] cursor-pointer"
            style={{ animationDelay: `${index * 0.08}s` }}
            onClick={onSelect}
        >
            {/* Background Image Setup */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={getCityPhoto(destination.city)} 
                    alt={destination.city}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
            </div>
            {/* Soft Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-90" />

            {/* Card Content (Floating at bottom) */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-10">
                <div className="flex items-end justify-between w-full">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">
                            <MapPin className="h-3 w-3 text-emerald-400" />
                            <span>{destination.country}</span>
                        </div>
                        <h3 className="text-4xl font-black text-white leading-tight">{destination.city}</h3>
                    </div>
                    
                    <div className="text-right pb-1">
                        <p className="text-[10px] text-white/60 uppercase tracking-widest font-black mb-1">Starting from</p>
                        <p className="text-2xl font-black text-white">
                            {formatter.format(destination.avgFlightPrice)}
                        </p>
                    </div>
                </div>

                <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden mt-2">
                    <p className="text-sm text-white/90 mb-4 line-clamp-2">
                        {destination.description}
                    </p>
                    
                    <button className="flex items-center gap-2 text-sm font-semibold text-white bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full hover:bg-white hover:text-slate-900 transition-colors duration-300">
                        <Plane className="h-4 w-4" />
                        Find Flights
                    </button>
                </div>
            </div>
        </article>
    )
}
