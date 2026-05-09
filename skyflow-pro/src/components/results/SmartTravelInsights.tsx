import { TrendingUp, Users, Award, Zap, Info, Clock, CheckCircle2, ChevronRight, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface SmartTravelInsightsProps {
  from: string
  to: string
  date: string
  cabin: string
  tripType: string
}

export function SmartTravelInsights({ from, to, date, cabin, tripType }: SmartTravelInsightsProps) {
  // In a real app, these would come from an API based on the search params
  const insights = {
    fare: {
      prediction: 'rise',
      percentage: 18,
      timeframe: '48 hours',
      bestWindow: 'Next 24 hours',
      savingDay: 'Tuesday',
      savingAmount: 3200
    },
    demand: {
      level: 'High',
      percentage: 84,
      trend: 'increasing',
      popularity: 9.2
    },
    cabinComparison: [
      {
        type: 'Premium Economy',
        valueScore: 88,
        comfortScore: 92,
        extraLegroom: '38%',
        fareDiff: '12%',
        perks: ['Extra Legroom', 'Priority Boarding', 'Premium Meals']
      }
    ],
    optimization: [
      {
        title: 'Timing Strategy',
        suggestion: 'Morning departures reduce delays by 22%.',
        impact: 'Positive'
      },
      {
        title: 'Price Strategy',
        suggestion: 'Late-night flights are currently 15% cheaper.',
        impact: 'High'
      }
    ],
    upgrade: {
      worth: true,
      reason: 'Business class inventory is high for this route, upgrades starting at ₹5,500.',
      valueScore: 95
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Fare Intelligence */}
      <div className="glass rounded-2xl p-6 border border-slate-800/50 flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <TrendingUp className="h-24 w-24" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-100">Fare Intelligence</h3>
        </div>
        
        <div className="space-y-4 relative z-10">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-200 font-medium flex items-center gap-2">
              <Info className="h-3.5 w-3.5" />
              Price alert for {from} → {to}
            </p>
            <p className="text-sm text-slate-200 mt-1">
              Fares may <span className="text-amber-400 font-bold">rise {insights.fare.percentage}%</span> within the next {insights.fare.timeframe}.
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Best Booking Window</span>
            <span className="text-emerald-400 font-bold">{insights.fare.bestWindow}</span>
          </div>
          
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <p className="text-xs text-slate-300">
              Flying on <span className="text-emerald-400 font-bold">{insights.fare.savingDay}</span> could save you <span className="text-emerald-400 font-bold">₹{insights.fare.savingAmount.toLocaleString()}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Route Demand Analytics */}
      <div className="glass rounded-2xl p-6 border border-slate-800/50 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-100">Demand Analytics</h3>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Flight Occupancy</span>
              <span className="text-sm font-bold text-slate-200">{insights.demand.percentage}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${insights.demand.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Route Popularity</p>
              <p className="text-lg font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                {insights.demand.popularity}
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Trend</p>
              <p className="text-sm font-bold text-emerald-400 mt-1 capitalize">{insights.demand.trend}</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 italic">
            High intensity booking detected in the last 12 hours.
          </p>
        </div>
      </div>

      {/* Cabin Recommendation */}
      <div className="glass rounded-2xl p-6 border border-slate-800/50 flex flex-col gap-4 lg:col-span-1 md:col-span-2 lg:row-span-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Award className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-100">Cabin Intelligence</h3>
        </div>

        {insights.cabinComparison.map((comp, idx) => (
          <div key={idx} className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm font-bold text-slate-100">{comp.type} Upgrade</p>
                <div className="flex items-center gap-1 bg-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-purple-400 uppercase">
                  Value {comp.valueScore}%
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <span className="text-purple-400 font-bold">{comp.type}</span> offers <span className="font-bold text-slate-100">{comp.extraLegroom} more legroom</span> for only <span className="text-emerald-400 font-bold">{comp.fareDiff} higher fare</span>.
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {comp.perks.map(perk => (
                  <span key={perk} className="text-[10px] px-2 py-1 rounded-md bg-slate-900/60 text-slate-400 border border-slate-800">
                    {perk}
                  </span>
                ))}
              </div>
            </div>
            
            <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 transition-all group">
              <span className="text-xs font-semibold text-slate-300">View Comparison Matrix</span>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {/* Travel Optimization Suggestions */}
      <div className="glass rounded-2xl p-6 border border-slate-800/50 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-100">Optimization</h3>
        </div>

        <div className="space-y-3">
          {insights.optimization.map((opt, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-800/20 border border-slate-800/50">
              <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${opt.impact === 'High' ? 'bg-emerald-500' : 'bg-sky-500'}`} />
              <div>
                <p className="text-xs font-bold text-slate-300 mb-0.5">{opt.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{opt.suggestion}</p>
              </div>
            </div>
          ))}
          
          <div className="mt-2 flex items-center gap-2 p-3 rounded-xl bg-sky-500/5 border border-sky-500/10">
            <CheckCircle2 className="h-4 w-4 text-sky-400" />
            <p className="text-[11px] text-sky-300 font-medium">Selected flight has 94% on-time performance.</p>
          </div>
        </div>
      </div>

      {/* Smart Upgrade */}
      <div className="glass rounded-2xl p-6 border border-slate-800/50 flex flex-col gap-4 md:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-100">Upgrade Advisory</h3>
        </div>

        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-200">Is it worth upgrading?</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {insights.upgrade.reason}
            </p>
            
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${insights.upgrade.valueScore}%` }} />
              </div>
              <span className="text-[10px] font-bold text-amber-400">{insights.upgrade.valueScore}% Match</span>
            </div>
          </div>
          
          <button className="btn-primary w-full py-2.5 text-xs">
            Show Upgrade Options
          </button>
        </div>
      </div>
    </div>
  )
}
