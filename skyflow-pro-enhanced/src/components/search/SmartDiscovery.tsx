import { useNavigate } from 'react-router-dom'
import { TrendingDown, TrendingUp, Clock, ArrowRight, Zap, Bell, Sparkles, CalendarDays, MapPin } from 'lucide-react'
import { useDiscoveryTimeline, useDiscoveryQuickPicks, useDiscoveryDeals } from '../../hooks/useDiscovery'

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function SmartDiscovery() {
  const navigate = useNavigate()
  const defaultFrom = 'DEL'
  const defaultTo = 'BOM'

  const { data: timelineData, isLoading: isLoadingTimeline } = useDiscoveryTimeline(defaultFrom, defaultTo)
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

  const getDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const getMonthDay = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
        <section className="lg:col-span-7 glass rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-50">Price Timeline</h2>
                <p className="text-xs text-slate-400">{defaultFrom} → {defaultTo} · 7 Day Forecast</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-end gap-2 sm:gap-4 mt-auto pt-8">
            {!isLoadingTimeline && timelineData && (() => {
              const prices = timelineData.map(d => d.price || 0).filter(p => p > 0)
              const maxPrice = Math.max(...prices)
              const minPrice = Math.min(...prices)

              return timelineData.map((day, idx) => {
                if (!day.price) return null
                
                // Calculate height percentage (min 20%, max 100%)
                const heightPct = 20 + ((day.price - minPrice) / (maxPrice - minPrice || 1)) * 80
                
                const isExpensive = day.price > minPrice * 1.3

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer" onClick={() => handleSearch(defaultFrom, defaultTo, day.date)}>
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-slate-700 text-white text-xs py-1 px-2 rounded pointer-events-none z-10 whitespace-nowrap shadow-xl">
                      {getMonthDay(day.date)}: {formatter.format(day.price)}
                    </div>
                    
                    {/* Bar */}
                    <div className="w-full relative flex flex-col justify-end h-32 sm:h-40 bg-slate-800/30 rounded-t-lg overflow-hidden group-hover:bg-slate-800/50 transition-colors">
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 relative ${
                          day.isCheapest ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 
                          isExpensive ? 'bg-amber-500/70' : 
                          'bg-sky-500/70'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      >
                        {day.isCheapest && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                            <TrendingDown className="h-4 w-4 text-emerald-400 animate-bounce" />
                          </div>
                        )}
                        {isExpensive && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrendingUp className="h-4 w-4 text-amber-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Labels */}
                    <div className="mt-3 text-center w-full border-t border-slate-700/50 pt-2">
                      <p className={`text-[0.65rem] uppercase tracking-wider font-semibold ${day.isCheapest ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {getDayOfWeek(day.date)}
                      </p>
                      <p className="text-xs font-bold text-slate-200 mt-0.5 truncate">
                        {formatter.format(day.price).replace('.00', '')}
                      </p>
                    </div>
                  </div>
                )
              })
            })()}
            {isLoadingTimeline && (
              <div className="w-full flex gap-4 h-40 items-end">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div key={i} className="flex-1 bg-slate-800/50 rounded-t-lg animate-pulse" style={{ height: `${20 + Math.random() * 80}%` }} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
