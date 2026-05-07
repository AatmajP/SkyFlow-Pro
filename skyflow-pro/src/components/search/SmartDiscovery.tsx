import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Bell, Sparkles, MapPin } from 'lucide-react'
import { useDiscoveryQuickPicks, useDiscoveryDeals } from '../../hooks/useDiscovery'
import { PriceTimeline } from './PriceTimeline'

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function SmartDiscovery() {
  const navigate = useNavigate()
  const defaultFrom = 'DEL'
  const defaultTo = 'BOM'

  const { data: quickPicks, isLoading: isLoadingPicks } = useDiscoveryQuickPicks(defaultFrom)
  const { data: deals, isLoading: isLoadingDeals } = useDiscoveryDeals(defaultFrom)

  const handleSearch = (from: string, to: string, dateStr?: string) => {
    const params = new URLSearchParams({
      from,
      to,
      adults: '1',
      cabin: 'economy',
      flex: '3',
    })
    
    if (dateStr) {
      params.set('date', dateStr)
      params.set('tripType', 'oneway')
    } else {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      params.set('date', nextWeek.toISOString().split('T')[0])
      params.set('tripType', 'oneway')
    }
    
    navigate({ pathname: '/results', search: params.toString() })
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Live Deals Strip */}
      <section className="glass rounded-2xl p-4 border border-sky-500/20 shadow-lg shadow-sky-500/5">
        <div className="flex items-center gap-3 mb-4 sm:mb-0 sm:float-left sm:mr-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
            <Zap className="h-4 w-4 animate-pulse" />
          </div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Live Deals</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          {!isLoadingDeals && deals?.map((deal, idx) => (
            <button
              key={idx}
              onClick={() => handleSearch(defaultFrom, deal.destination)}
              className="flex-shrink-0 flex items-center gap-4 bg-slate-800/40 hover:bg-slate-700/50 rounded-xl px-4 py-2 border border-slate-700/50 transition-colors group"
            >
              <div>
                <p className="text-sm font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">{deal.route}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Bell className="h-3 w-3 text-amber-400" />
                  <p className="text-[0.65rem] text-amber-400/90">{deal.urgency}</p>
                </div>
              </div>
              <div className="text-right pl-4 border-l border-slate-700/50">
                <p className="text-xs text-slate-500">from</p>
                <p className="text-sm font-bold text-emerald-400">{formatter.format(deal.price)}</p>
              </div>
            </button>
          ))}
          {isLoadingDeals && (
            <div className="flex gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 w-48 bg-slate-800/50 rounded-xl animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Smart Quick Picks */}
        <section className="lg:col-span-5 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-50">Quick Picks</h2>
                <p className="text-xs text-slate-400">Smart suggestions from {defaultFrom}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!isLoadingPicks && quickPicks?.map((pick) => (
              <button
                key={pick.id}
                onClick={() => handleSearch(defaultFrom, pick.destination)}
                className="group flex flex-col items-start p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/50 hover:border-sky-500/30 transition-all text-left"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md ring-1 ring-sky-500/20">
                    {pick.destination}
                  </span>
                  <MapPin className="h-4 w-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1 leading-tight group-hover:text-sky-300">
                  {pick.title}
                </h3>
                <div className="mt-auto pt-3 w-full flex items-center justify-between">
                  <p className="text-lg font-bold text-emerald-400">{formatter.format(pick.price)}</p>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                </div>
              </button>
            ))}
            {isLoadingPicks && (
              <>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
                ))}
              </>
            )}
          </div>
        </section>

        {/* Smart Travel Timeline */}
        <section className="lg:col-span-7">
          <PriceTimeline 
            from={defaultFrom} 
            to={defaultTo} 
            date={new Date().toISOString().split('T')[0]} 
            tripType="oneway" 
            onSelectDate={(dateStr) => handleSearch(defaultFrom, defaultTo, dateStr)} 
          />
        </section>
      </div>
    </div>
  )
}
