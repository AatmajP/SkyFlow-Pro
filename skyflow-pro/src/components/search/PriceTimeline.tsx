import { TrendingDown, TrendingUp, RefreshCw, BarChart3 } from 'lucide-react'
import { useDiscoveryTimeline } from '../../hooks/useDiscovery'
import { motion, AnimatePresence } from 'framer-motion'

interface PriceTimelineProps {
  from: string
  to: string
  date: string
  cabin: string
  tripType: string
  onSelectDate: (date: string) => void
}

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function PriceTimeline({ from, to, date, cabin, tripType, onSelectDate }: PriceTimelineProps) {
  const { data: timelineData, isLoading, refetch } = useDiscoveryTimeline(from, to, date, cabin, tripType)

  const getDayOfWeek = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const getMonthDay = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const prices = (timelineData || []).map(d => d.price || 0).filter(p => p > 0)
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

  return (
    <div className="glass rounded-2xl p-6 border border-slate-800/50 shadow-xl overflow-hidden relative">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
              {from} <span className="text-slate-500">→</span> {to} · 7 Day Forecast
            </h2>
            <p className="text-xs text-slate-400">Prices are based on Economy class · Updated live</p>
          </div>
        </div>
        
        <button 
          onClick={() => refetch()}
          disabled={isLoading}
          className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-all border border-slate-700/50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative h-48 sm:h-56 flex items-end gap-2 sm:gap-4 px-2">
        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] rounded-xl"
            >
              <RefreshCw className="h-8 w-8 text-sky-400 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {timelineData ? timelineData.map((day, idx) => {
          if (!day.price) return null
          
          const isSelected = day.date === date
          const heightPct = 20 + ((day.price - minPrice) / (maxPrice - minPrice || 1)) * 80
          const isExpensive = day.price > minPrice * 1.3

          return (
            <motion.div 
              key={day.date}
              className="flex-1 flex flex-col items-center group relative cursor-pointer"
              onClick={() => onSelectDate(day.date)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              {/* Tooltip */}
              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-800 border border-slate-700 text-white text-xs py-1.5 px-3 rounded-lg pointer-events-none z-10 whitespace-nowrap shadow-2xl translate-y-2 group-hover:translate-y-0">
                <p className="font-bold">{getMonthDay(day.date)}</p>
                <p className="text-emerald-400">{formatter.format(day.price)}</p>
              </div>
              
              {/* Bar Container */}
              <div className="w-full relative flex flex-col justify-end h-32 sm:h-40 bg-slate-800/20 rounded-t-xl overflow-hidden group-hover:bg-slate-800/40 transition-colors">
                {/* Active Highlight */}
                {isSelected && (
                  <motion.div 
                    layoutId="active-bar"
                    className="absolute inset-0 bg-sky-500/10 border-x border-sky-500/30 z-0"
                  />
                )}

                {/* The Bar */}
                <motion.div 
                  className={`w-full rounded-t-lg relative transition-colors duration-300 ${
                    day.isCheapest ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 
                    isExpensive ? 'bg-slate-700 group-hover:bg-amber-500/60' : 
                    isSelected ? 'bg-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.3)]' :
                    'bg-slate-700 group-hover:bg-sky-500/60'
                  }`}
                  style={{ height: `${heightPct}%` }}
                  whileHover={{ scaleY: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {day.isCheapest && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter mb-1">Best</span>
                      <TrendingDown className="h-4 w-4 text-emerald-400 animate-bounce" />
                    </div>
                  )}
                  {isExpensive && !isSelected && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TrendingUp className="h-4 w-4 text-amber-400" />
                    </div>
                  )}
                </motion.div>
              </div>
              
              {/* Labels */}
              <div className={`mt-4 text-center w-full pt-2 transition-colors duration-300 ${isSelected ? 'border-t-2 border-sky-400' : 'border-t border-slate-800'}`}>
                <p className={`text-[0.65rem] uppercase tracking-widest font-bold ${day.isCheapest ? 'text-emerald-400' : isSelected ? 'text-sky-400' : 'text-slate-500'}`}>
                  {getDayOfWeek(day.date)}
                </p>
                <p className={`text-xs font-bold mt-1 ${isSelected ? 'text-slate-50' : 'text-slate-300'}`}>
                  {formatter.format(day.price).replace('.00', '').replace('₹', '₹ ')}
                </p>
              </div>
            </motion.div>
          )
        }) : (
          <div className="w-full flex gap-4 h-40 items-end">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="flex-1 bg-slate-800/30 rounded-t-lg animate-pulse" style={{ height: `${20 + Math.random() * 80}%` }} />
            ))}
          </div>
        )}
      </div>

      {/* Legend / Stats */}
      <div className="mt-8 pt-4 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest font-bold">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Best Price</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            <span className="text-slate-400">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-700" />
            <span className="text-slate-400">Average</span>
          </div>
        </div>
        
        <p className="text-xs text-slate-500">
          * Price fluctuations may occur based on real-time availability.
        </p>
      </div>
    </div>
  )
}
