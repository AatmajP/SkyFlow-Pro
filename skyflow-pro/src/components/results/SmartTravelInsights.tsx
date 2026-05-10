import { TrendingUp, Users, Award, Zap, Info, Clock, CheckCircle2, ChevronRight, Star, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCurrency } from '../../context/CurrencyContext'
import { useTranslation, Trans } from 'react-i18next'

interface SmartTravelInsightsProps {
  from: string
  to: string
  date: string
  cabin: string

  tripType: string
}

export function SmartTravelInsights({ from, to, date, cabin, tripType }: SmartTravelInsightsProps) {
  const { t } = useTranslation()
  const { formatPrice } = useCurrency()

  // Dynamic Intelligence Engine
  const generateInsights = () => {
    // Determine route characteristics
    const isDomestic = from.length === 3 && to.length === 3 // Simplified for mock
    const isLongHaul = !isDomestic || ['LHR', 'JFK', 'LAX', 'SFO', 'NRT', 'SYD'].includes(to)
    const isBusinessRoute = ['BOM', 'BLR', 'DXB', 'SIN', 'LHR', 'JFK'].includes(to)
    const isLeisureRoute = ['GOA', 'MLE', 'BKK', 'DPS', 'FCO', 'CDG'].includes(to)

    const dayOfWeek = new Date(date).getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5

    // Seeded random for deterministic but route-specific values
    const seed = (from + to + cabin).split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    const rnd = (max: number) => Math.floor(((seed * 16807) % 2147483647) % max)

    const fareRise = 10 + rnd(15)
    const demandLevel = isBusinessRoute ? t('results.demand.veryHigh') : isLeisureRoute && isWeekend ? t('results.demand.peak') : t('results.demand.high')
    const occupancy = 75 + rnd(20)

    // Custom upgrade logic
    let upgradeReason = t('results.insights.upgradeCorridor', { from, to })
    if (isLongHaul) upgradeReason = t('results.insights.upgradeLongHaul')
    if (isBusinessRoute) upgradeReason = t('results.insights.upgradeBusiness', { to })
    if (cabin === 'business') upgradeReason = t('results.insights.upgradeFirst')

    const upgradePrice = isLongHaul ? 15000 + rnd(10000) : 4500 + rnd(3000)

    return {
      fare: {
        prediction: 'rise',
        percentage: fareRise,
        timeframe: isWeekend ? t('results.insights.12h') : t('results.insights.48h'),
        bestWindow: t('results.insights.bookWithin6h'),
        savingDay: dayOfWeek === 2 ? t('common.days.wednesday') : t('common.days.tuesday'),
        savingAmount: 2500 + rnd(2000)
      },
      demand: {
        level: demandLevel,
        percentage: occupancy,
        trend: 'increasing',
        popularity: (8.5 + (seed % 15) / 10).toFixed(1)
      },
      cabinComparison: [
        {
          type: cabin === 'economy' ? t('search.premiumEconomy') : cabin === 'premium_economy' ? t('search.business') : t('search.first'),
          valueScore: 85 + rnd(10),
          comfortScore: 90 + rnd(8),
          extraLegroom: isLongHaul ? '42%' : '35%',
          fareDiff: isLongHaul ? '25%' : '15%',
          perks: isLongHaul
            ? [t('results.perks.priority'), t('results.perks.baggage'), t('results.perks.sleepKit'), t('results.perks.recline')]
            : [t('results.perks.legroom'), t('results.perks.priority'), t('results.perks.meals')]
        }
      ],
      optimization: [
        {
          title: t('results.insights.timingStrategy'),
          suggestion: isBusinessRoute
            ? t('results.insights.timingBusiness')
            : t('results.insights.timingLeisure'),
          impact: 'Positive'
        },
        {
          title: t('results.insights.routeInsight'),
          suggestion: isLongHaul
            ? t('results.insights.routeLongHaul')
            : t('results.insights.routeNearby'),
          impact: 'High'
        }
      ],
      upgrade: {
        worth: true,
        reason: upgradeReason,
        valueScore: 88 + rnd(10),
        price: upgradePrice
      }
    }
  }

  const insights = generateInsights()

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
          <h3 className="font-bold text-slate-100">{t('results.insights.fareTitle')}</h3>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-200 font-medium flex items-center gap-2">
              <Info className="h-3.5 w-3.5" />
              {t('results.insights.priceAlert', { from, to })}
            </p>
            <p className="text-sm text-slate-200 mt-1">
              <Trans
                i18nKey="results.insights.fareRise"
                values={{ percentage: insights.fare.percentage, timeframe: insights.fare.timeframe }}
                components={{ span: <span className="text-amber-400 font-bold" /> }}
              />
            </p>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{t('results.insights.bestWindow')}</span>
            <span className="text-emerald-400 font-bold">{insights.fare.bestWindow}</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <p className="text-xs text-slate-300">
              <Trans
                i18nKey="results.insights.savingDay"
                values={{ day: insights.fare.savingDay, amount: formatPrice(insights.fare.savingAmount) }}
                components={{ span: <span className="text-emerald-400 font-bold" /> }}
              />
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
          <h3 className="font-bold text-slate-100">{t('results.insights.demandTitle')}</h3>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t('results.insights.occupancy')}</span>
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
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{t('results.insights.popularity')}</p>
              <p className="text-lg font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                {insights.demand.popularity}
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{t('results.insights.trend')}</p>
              <p className="text-sm font-bold text-emerald-400 mt-1 capitalize">{insights.demand.trend}</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 italic">
            {t('results.insights.intensity')}
          </p>
        </div>
      </div>

      {/* Cabin Recommendation */}
      <div className="glass rounded-2xl p-6 border border-slate-800/50 flex flex-col gap-4 lg:col-span-1 md:col-span-2 lg:row-span-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Award className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-100">{t('results.insights.cabinTitle')}</h3>
        </div>

        {insights.cabinComparison.map((comp, idx) => (
          <div key={idx} className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm font-bold text-slate-100">{t('results.insights.upgradeTitleValue', { type: comp.type })}</p>
                <div className="flex items-center gap-1 bg-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-purple-400 uppercase">
                  {t('results.insights.value', { score: comp.valueScore })}
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <Trans
                  i18nKey="results.insights.upgradeOffer"
                  values={{ type: comp.type, legroom: comp.extraLegroom, fareDiff: comp.fareDiff }}
                  components={{ span: <span className="font-bold text-slate-100" />, pspan: <span className="text-purple-400 font-bold" />, espan: <span className="text-emerald-400 font-bold" /> }}
                />
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
              <span className="text-xs font-semibold text-slate-300">{t('results.insights.viewMatrix')}</span>
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
          <h3 className="font-bold text-slate-100">{t('results.insights.optimizationTitle')}</h3>
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
            <p className="text-[11px] text-sky-300 font-medium">{t('results.insights.onTime')}</p>
          </div>
        </div>
      </div>

      {/* Smart Upgrade */}
      <div className="glass rounded-2xl p-6 border border-slate-800/50 flex flex-col gap-4 md:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-100">{t('results.insights.upgradeTitle')}</h3>
        </div>

        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-200">{t('results.insights.worthUpgrade')}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <Trans
                i18nKey="results.insights.upgradeReason"
                values={{ reason: insights.upgrade.reason, price: formatPrice(insights.upgrade.price) }}
                components={{ span: <span className="text-emerald-400 font-bold" /> }}
              />
            </p>

            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${insights.upgrade.valueScore}%` }} />
              </div>
              <span className="text-[10px] font-bold text-amber-400">{t('results.insights.match', { score: insights.upgrade.valueScore })}</span>
            </div>
          </div>

          <button className="btn-primary w-full py-2.5 text-xs">
            {t('results.insights.showOptions')}
          </button>
        </div>
      </div>
    </div>
  )
}
