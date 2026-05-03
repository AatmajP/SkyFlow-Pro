import { GlobalSearchHeader } from '../components/global-search/GlobalSearchHeader'
import { SmartDiscovery } from '../components/search/SmartDiscovery'
import { Plane, Shield, Tag, Clock, Star, Users, Zap, Globe } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'No Hidden Fees',
    description: 'Every charge itemized upfront. What you see is what you pay.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Tag,
    title: 'Best Price Guarantee',
    description: 'We show you the lowest fares across all carriers.',
    color: 'from-sky-500 to-blue-500',
  },
  {
    icon: Clock,
    title: 'Real-time Pricing',
    description: 'Live fare updates ensure you never miss a deal.',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: Zap,
    title: 'Instant Booking',
    description: 'Secure your seats in seconds with our fast checkout.',
    color: 'from-amber-500 to-orange-500',
  },
]

const stats = [
  { value: '50+', label: 'Destinations', icon: Plane },
  { value: '6', label: 'Airlines', icon: Users },
  { value: '20+', label: 'Daily Flights', icon: Globe },
  { value: '4.9', label: 'User Rating', icon: Star },
]

const airlines = [
  'IndiGo', 'Air India', 'Vistara', 'SpiceJet', 'Akasa Air', 'Patro Airlines',
  'Emirates', 'British Airways', 'Lufthansa', 'Singapore Airlines',
]

export function SearchPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute top-40 right-20 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute bottom-20 left-1/2 h-80 w-80 rounded-full bg-pink-500/8 blur-3xl" />

      {/* Animated floating planes */}
      <div className="absolute top-32 right-[15%] opacity-20 animate-float">
        <Plane className="h-12 w-12 text-sky-400 rotate-45" />
      </div>
      <div className="absolute top-64 left-[10%] opacity-10 animate-float" style={{ animationDelay: '2s' }}>
        <Plane className="h-8 w-8 text-purple-400 rotate-12" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <header className="mb-10 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500/10 to-purple-500/10 px-4 py-1.5 text-xs font-medium text-sky-300 ring-1 ring-sky-500/30 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
            </span>
            Truth-first fares. No hidden fees.
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="gradient-text">Find Your Perfect</span>
            <br />
            <span className="text-slate-100">Flight Experience</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
            Search 50+ destinations across India and beyond.
            Every fee itemized, every seat guaranteed.
          </p>
        </header>

        {/* Search Form */}
        <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <GlobalSearchHeader />
        </div>

        {/* Stats Section */}
        <section className="mb-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="glass rounded-2xl p-5 text-center card-hover"
              >
                <stat.icon className="mx-auto mb-3 h-6 w-6 text-sky-400" />
                <p className="text-2xl font-bold text-slate-50">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Smart Discovery Section */}
        <section className="mb-16">
          <SmartDiscovery />
        </section>

        {/* Features Grid */}
        <section className="mb-16" id="main">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">
              Why Choose <span className="gradient-text">SkyFlow Pro</span>
            </h2>
            <p className="mt-2 text-slate-400">Experience the future of flight booking</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="glass rounded-2xl p-6 card-hover animate-fade-in"
                style={{ animationDelay: `${0.1 * idx}s` }}
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-50 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trusted Airlines */}
        <section className="mb-16 glass rounded-2xl p-8 animate-fade-in">
          <p className="text-center text-sm font-medium text-slate-400 mb-6">
            Trusted by travelers worldwide · Fly with India's best airlines
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {airlines.map((airline, idx) => (
              <span
                key={idx}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-300 cursor-default ${
                  airline === 'Patro Airlines'
                    ? 'text-sky-400 font-semibold'
                    : 'text-slate-500 hover:text-sky-400'
                }`}
              >
                {airline}
              </span>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 pt-8 animate-fade-in">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-purple-600">
                <Plane className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold gradient-text">SkyFlow Pro</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <span>v2.0 · Enhanced Edition</span>
              <span>•</span>
              <span>Built for transparency</span>
              <span>•</span>
              <span>WCAG AA Compliant</span>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary text-xs">Privacy</button>
              <button className="btn-secondary text-xs">Terms</button>
              <button className="btn-secondary text-xs">Contact</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
