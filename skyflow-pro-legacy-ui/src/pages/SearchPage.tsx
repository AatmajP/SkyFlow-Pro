import { GlobalSearchHeaderEnhanced as GlobalSearchHeader } from '../components/global-search/GlobalSearchHeaderEnhanced'
import { DestinationDiscovery } from '../components/search/DestinationDiscovery'
import { useNavigate } from 'react-router-dom'
import { Shield, Tag, Clock, Zap, Plane } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Secure Booking',
    description: 'Every charge itemized upfront. What you see is what you pay.',
  },
  {
    icon: Tag,
    title: 'Best Price Guarantee',
    description: 'We show you the lowest fares across all carriers.',
  },
  {
    icon: Clock,
    title: 'Real-time Updates',
    description: 'Live fare updates ensure you never miss a deal.',
  },
  {
    icon: Zap,
    title: 'Instant Confirmation',
    description: 'Secure your seats in seconds with our fast checkout.',
  },
]

export function SearchPage() {
  const navigate = useNavigate()

  const handleDestinationSelect = (airportCode: string) => {
    const params = new URLSearchParams()
    params.set('from', 'JFK')
    params.set('to', airportCode)
    params.set('tripType', 'oneway')
    params.set('adults', '1')
    params.set('cabin', 'economy')
    params.set('flex', '3')

    const date = new Date()
    date.setDate(date.getDate() + 14)
    params.set('date', date.toISOString().split('T')[0])

    navigate({ pathname: '/results', search: params.toString() })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== HERO SECTION ===== */}
      <div className="relative min-h-[90vh] flex flex-col items-center justify-center pb-24 pt-32">
        {/* Background image layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Beautiful coastal travel destination" 
            className="w-full h-full object-cover scale-105 animate-scale-in" 
            style={{ animationDuration: '20s' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mt-16 max-w-7xl mx-auto flex flex-col items-center">
          {/* Headline */}
          <h1 className="text-6xl font-black tracking-tighter sm:text-8xl text-white drop-shadow-2xl text-center mb-16 animate-fade-in-up uppercase leading-none">
            Where to <span className="text-white/80">Next?</span>
          </h1>

          {/* Search Form Container */}
          <div className="w-full max-w-6xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <GlobalSearchHeader />
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Destination Discovery */}
        <div className="mb-24">
          <DestinationDiscovery onSelectDestination={handleDestinationSelect} />
        </div>

        {/* Features Grid */}
        <div className="py-24 mb-16 border-t border-slate-200">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-8px] transition-all duration-500"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 mb-8 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-wider">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-12 pb-20 flex flex-col items-center sm:flex-row justify-between content-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">SkyFlow Pro</span>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <button className="hover:text-slate-900 transition-colors">Safety</button>
            <button className="hover:text-slate-900 transition-colors">Privacy</button>
            <button className="hover:text-slate-900 transition-colors">Journal</button>
            <button className="hover:text-slate-900 transition-colors">Support</button>
          </div>
        </footer>
      </div>
    </div>
  )
}
