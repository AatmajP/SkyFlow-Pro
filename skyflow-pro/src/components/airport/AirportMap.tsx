import { useState } from 'react'
import { X, MapPin, Coffee, ShoppingBag, Utensils, Armchair, Clock, Footprints } from 'lucide-react'

interface AirportMapProps {
  isOpen: boolean
  onClose: () => void
  airportCode: string
  gateNumber?: string
}

interface MapPOI {
  id: string
  label: string
  type: 'gate' | 'food' | 'lounge' | 'shop' | 'restroom' | 'security'
  x: number // percent
  y: number // percent
  walkTime?: string
}

// Generate realistic airport POIs
function getAirportPOIs(gateNumber: string): MapPOI[] {
  return [
    { id: 'gate', label: `Gate ${gateNumber}`, type: 'gate', x: 78, y: 35, walkTime: '0 min' },
    { id: 'security', label: 'Security Check', type: 'security', x: 15, y: 50, walkTime: '12 min' },
    { id: 'lounge1', label: 'Premium Lounge', type: 'lounge', x: 45, y: 25, walkTime: '5 min' },
    { id: 'lounge2', label: 'Business Lounge', type: 'lounge', x: 60, y: 70, walkTime: '4 min' },
    { id: 'food1', label: 'Food Court', type: 'food', x: 35, y: 60, walkTime: '8 min' },
    { id: 'food2', label: 'Café Coffee Day', type: 'food', x: 55, y: 40, walkTime: '5 min' },
    { id: 'food3', label: 'McDonald\'s', type: 'food', x: 68, y: 55, walkTime: '3 min' },
    { id: 'shop1', label: 'Duty Free', type: 'shop', x: 30, y: 35, walkTime: '9 min' },
    { id: 'shop2', label: 'WH Smith', type: 'shop', x: 50, y: 55, walkTime: '6 min' },
    { id: 'rest1', label: 'Restrooms', type: 'restroom', x: 42, y: 45, walkTime: '7 min' },
    { id: 'rest2', label: 'Restrooms', type: 'restroom', x: 72, y: 45, walkTime: '2 min' },
  ]
}

function getPOIIcon(type: string) {
  switch (type) {
    case 'gate': return <MapPin className="h-4 w-4" />
    case 'food': return <Utensils className="h-3.5 w-3.5" />
    case 'lounge': return <Armchair className="h-3.5 w-3.5" />
    case 'shop': return <ShoppingBag className="h-3.5 w-3.5" />
    case 'security': return <Footprints className="h-3.5 w-3.5" />
    default: return <Coffee className="h-3.5 w-3.5" />
  }
}

function getPOIColor(type: string) {
  switch (type) {
    case 'gate': return { bg: 'bg-sky-500', text: 'text-sky-400', ring: 'ring-sky-500/50' }
    case 'food': return { bg: 'bg-amber-500', text: 'text-amber-400', ring: 'ring-amber-500/50' }
    case 'lounge': return { bg: 'bg-purple-500', text: 'text-purple-400', ring: 'ring-purple-500/50' }
    case 'shop': return { bg: 'bg-emerald-500', text: 'text-emerald-400', ring: 'ring-emerald-500/50' }
    case 'security': return { bg: 'bg-red-500', text: 'text-red-400', ring: 'ring-red-500/50' }
    default: return { bg: 'bg-slate-500', text: 'text-slate-400', ring: 'ring-slate-500/50' }
  }
}

export function AirportMap({ isOpen, onClose, airportCode, gateNumber = 'B12' }: AirportMapProps) {
  const [selectedPOI, setSelectedPOI] = useState<MapPOI | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const pois = getAirportPOIs(gateNumber)
  const filtered = filter === 'all' ? pois : pois.filter((p) => p.type === filter)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl mx-4 glass rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-50">Airport Map</h3>
              <p className="text-xs text-slate-400">{airportCode} · Terminal Layout · Gate {gateNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/30 overflow-x-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'gate', label: 'Gates' },
            { key: 'food', label: 'Food' },
            { key: 'lounge', label: 'Lounges' },
            { key: 'shop', label: 'Shops' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f.key
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Map area */}
        <div className="relative w-full h-[400px] bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden">
          {/* Terminal outline */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Terminal building */}
            <rect x="8" y="20" width="84" height="60" rx="3" fill="none" stroke="rgba(100,116,139,0.3)" strokeWidth="0.3" />
            {/* Concourse arms */}
            <rect x="20" y="28" width="65" height="18" rx="2" fill="rgba(30,41,59,0.5)" stroke="rgba(100,116,139,0.2)" strokeWidth="0.2" />
            <rect x="20" y="54" width="65" height="18" rx="2" fill="rgba(30,41,59,0.5)" stroke="rgba(100,116,139,0.2)" strokeWidth="0.2" />
            {/* Main corridor */}
            <rect x="12" y="42" width="76" height="16" rx="1" fill="rgba(30,41,59,0.3)" stroke="rgba(56,189,248,0.15)" strokeWidth="0.2" />
            {/* Corridor path line */}
            <line x1="15" y1="50" x2="88" y2="50" stroke="rgba(56,189,248,0.2)" strokeWidth="0.15" strokeDasharray="1,0.5" />
            {/* Gate docks */}
            {[25, 40, 55, 70, 82].map((x) => (
              <g key={x}>
                <rect x={x - 2} y="22" width="4" height="6" rx="0.5" fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.15)" strokeWidth="0.15" />
                <rect x={x - 2} y="72" width="4" height="6" rx="0.5" fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.15)" strokeWidth="0.15" />
              </g>
            ))}
          </svg>

          {/* POI markers */}
          {filtered.map((poi) => {
            const colors = getPOIColor(poi.type)
            const isSelected = selectedPOI?.id === poi.id
            return (
              <button
                key={poi.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  isSelected ? 'z-20 scale-125' : 'z-10 hover:scale-110'
                }`}
                style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
                onClick={() => setSelectedPOI(isSelected ? null : poi)}
              >
                <div className={`relative flex items-center justify-center h-8 w-8 rounded-full ${colors.bg} shadow-lg ring-2 ${colors.ring} ${
                  poi.type === 'gate' ? 'h-10 w-10 animate-pulse-glow' : ''
                }`}>
                  <span className="text-white">{getPOIIcon(poi.type)}</span>
                </div>
                {/* Label */}
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap transition-opacity ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <span className="text-[0.6rem] px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 shadow-lg">
                    {poi.label}
                  </span>
                </div>
              </button>
            )
          })}

          {/* Walking path to gate (dotted line from security to gate) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M 15 50 Q 30 50 45 42 T 78 35"
              fill="none"
              stroke="rgba(56,189,248,0.4)"
              strokeWidth="0.3"
              strokeDasharray="1,0.5"
            />
          </svg>
        </div>

        {/* Selected POI detail + legend */}
        <div className="p-4 border-t border-slate-800/50">
          {selectedPOI ? (
            <div className="flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${getPOIColor(selectedPOI.type).bg}`}>
                  <span className="text-white">{getPOIIcon(selectedPOI.type)}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{selectedPOI.label}</p>
                  <p className="text-xs text-slate-400 capitalize">{selectedPOI.type}</p>
                </div>
              </div>
              {selectedPOI.walkTime && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50">
                  <Clock className="h-4 w-4 text-sky-400" />
                  <div>
                    <p className="text-xs text-slate-500">Walk from gate</p>
                    <p className="text-sm font-semibold text-slate-200">{selectedPOI.walkTime}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs">
                {[
                  { type: 'gate', label: 'Gate' },
                  { type: 'food', label: 'Food' },
                  { type: 'lounge', label: 'Lounge' },
                  { type: 'shop', label: 'Shop' },
                ].map((item) => (
                  <div key={item.type} className="flex items-center gap-1.5">
                    <span className={`h-3 w-3 rounded-full ${getPOIColor(item.type).bg}`} />
                    <span className="text-slate-400">{item.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">Click a marker for details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
