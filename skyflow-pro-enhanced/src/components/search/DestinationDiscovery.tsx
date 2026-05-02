import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass, Palmtree, Mountain, Building2, Sparkles, ArrowRight } from 'lucide-react'
import { AIRPORTS } from '../../mocks/mockSearchResults'

interface DestinationCategory {
  id: string
  label: string
  tag: string
  icon: React.ElementType
  gradient: string
  description: string
  emoji: string
}

const CATEGORIES: DestinationCategory[] = [
  {
    id: 'beach',
    label: 'Beaches',
    tag: 'beach',
    icon: Palmtree,
    gradient: 'from-cyan-500 to-blue-500',
    description: 'Sun, sand & serenity',
    emoji: '🏖️',
  },
  {
    id: 'metro',
    label: 'Cities',
    tag: 'metro',
    icon: Building2,
    gradient: 'from-violet-500 to-purple-600',
    description: 'Urban exploration',
    emoji: '🌆',
  },
  {
    id: 'tourism',
    label: 'Tourism',
    tag: 'tourism',
    icon: Mountain,
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Temples & Mountains',
    emoji: '🌄',
  },
]

// Best travel time hints
const TRAVEL_HINTS: Record<string, string> = {
  GOI: 'Nov–Feb · Best weather',
  SXR: 'Apr–Jun · Spring blooms',
  UDR: 'Sep–Mar · Cool evenings',
  VNS: 'Oct–Mar · Festival season',
  IXB: 'Oct–Dec · Clear skies',
  ATQ: 'Nov–Mar · Pleasant weather',
  DXB: 'Nov–Apr · Cool & sunny',
  BKK: 'Nov–Feb · Dry season',
  SIN: 'Feb–Apr · Least rain',
  LHR: 'Jun–Aug · Summer',
  JFK: 'Apr–Jun · Spring',
  COK: 'Oct–Feb · Post-monsoon',
  IXZ: 'Nov–Apr · Clear waters',
  DED: 'Mar–Jun · Before monsoon',
  JAI: 'Oct–Mar · Desert cool',
  TIR: 'Sep–Mar · Pilgrimage season',
}

function getDemoPrice(code: string): number {
  let hash = 0
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0
  return 2800 + (hash % 5000) // ₹2800 to ₹7800
}

const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function DestinationDiscovery() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<string>('beach')

  const filteredDestinations = AIRPORTS.filter((a) =>
    a.type === activeCategory,
  ).slice(0, 6)

  const handleExplore = (code: string) => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 14)
    const dateStr = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`

    const params = new URLSearchParams({
      from: 'DEL',
      to: code,
      date: dateStr,
      tripType: 'roundtrip',
      adults: '1',
      cabin: 'economy',
      flex: '3',
    })
    navigate({ pathname: '/results', search: params.toString() })
  }

  return (
    <section className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-purple-600">
          <Compass className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-50 sm:text-2xl">
            Discover Your Next <span className="gradient-text">Destination</span>
          </h2>
          <p className="text-sm text-slate-400">Smart suggestions based on your interests</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.tag)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeCategory === cat.tag
                ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg`
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            <cat.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Destination cards grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDestinations.map((dest, idx) => {
          const price = getDemoPrice(dest.code)
          const hint = TRAVEL_HINTS[dest.code]

          return (
            <button
              key={dest.code}
              onClick={() => handleExplore(dest.code)}
              className="group glass rounded-2xl p-4 text-left transition-all duration-300 hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/5 card-hover animate-fade-in"
              style={{ animationDelay: `${0.05 * idx}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md ring-1 ring-sky-500/20">
                      {dest.code}
                    </span>
                    {dest.country === 'India' && (
                      <span className="text-[0.6rem] text-slate-500">🇮🇳</span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-slate-100 truncate group-hover:text-sky-300 transition-colors">
                    {dest.city}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{dest.country}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">from</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {priceFormatter.format(price)}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span
                    className="text-[0.6rem] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 ring-1 ring-slate-700/50 uppercase"
                  >
                    {dest.type}
                  </span>
              </div>

              {/* Travel hint */}
              {hint && (
                <div className="flex items-center gap-1.5 mt-3 text-[0.65rem] text-amber-400/80">
                  <Sparkles className="h-3 w-3" />
                  <span>{hint}</span>
                </div>
              )}

              {/* Explore CTA */}
              <div className="flex items-center gap-1 mt-3 text-xs text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Explore flights</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
