import { TrendingUp, Users, Award, Zap, Info, Clock, CheckCircle2, ChevronRight, Star, MapPin, Sparkles, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCurrency } from '../../context/CurrencyContext'
import { useTranslation, Trans } from 'react-i18next'
import { AIRPORTS } from '../../mocks/mockSearchResults'

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

  const destinationInfo = AIRPORTS.find(a => a.code === to)
  const isSpiritual = destinationInfo?.type === 'spiritual' || destinationInfo?.type === 'pilgrimage'

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
    const demandLevel = isBusinessRoute ? t('results.demand.veryHigh', 'Very High') : isLeisureRoute && isWeekend ? t('results.demand.peak', 'Peak') : t('results.demand.high', 'High')
    const occupancy = 75 + rnd(20)

    // Custom upgrade logic
    let upgradeReason = t('results.insights.upgradeCorridor', 'Business class inventory is currently favorable for the {{from}}→{{to}} corridor.', { from, to })
    if (isLongHaul) upgradeReason = t('results.insights.upgradeLongHaul', 'Long-haul flight detected. Flat-bed seats in Business class offer 4x more rest for your arrival.')
    if (isBusinessRoute) upgradeReason = t('results.insights.upgradeBusiness', 'High corporate demand. Secure your upgrade now to access premium lounges in {{to}}.', { to })
    if (cabin === 'business') upgradeReason = t('results.insights.upgradeFirst', 'First Class suites available. Experience ultimate privacy and 5-star dining above the clouds.')

    const upgradePrice = isLongHaul ? 15000 + rnd(10000) : 4500 + rnd(3000)

    return {
      fare: {
        prediction: 'rise',
        percentage: fareRise,
        timeframe: isWeekend ? t('results.insights.12h', '12 hours') : t('results.insights.48h', '48 hours'),
        bestWindow: t('results.insights.bookWithin6h', 'book within 6h'),
        savingDay: dayOfWeek === 2 ? t('common.days.wednesday', 'Wednesday') : t('common.days.tuesday', 'Tuesday'),
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
          type: cabin === 'economy' ? t('search.premiumEconomy', 'Premium Economy') : cabin === 'premium_economy' ? t('search.business', 'Business') : t('search.first', 'First Class'),
          valueScore: 85 + rnd(10),
          comfortScore: 90 + rnd(8),
          extraLegroom: isLongHaul ? '42%' : '35%',
          fareDiff: isLongHaul ? '25%' : '15%',
          perks: isLongHaul
            ? [t('results.perks.priority', 'Priority Boarding'), t('results.perks.baggage', 'Extra Baggage'), t('results.perks.sleepKit', 'Sleep Kit'), t('results.perks.recline', 'Better Recline')]
            : [t('results.perks.legroom', 'Extra Legroom'), t('results.perks.priority', 'Priority Boarding'), t('results.perks.meals', 'Premium Meals')]
        }
      ],
      optimization: [
        {
          title: t('results.insights.timingStrategy', 'Timing Strategy'),
          suggestion: isBusinessRoute
            ? t('results.insights.timingBusiness', 'Early morning flights (6-8 AM) have the highest on-time performance for business travelers.')
            : t('results.insights.timingLeisure', 'Afternoon departures on this route are typically less crowded.'),
          impact: 'Positive'
        },
        {
          title: isSpiritual ? t('results.insights.spiritualTitle', 'Spiritual Intelligence') : t('results.insights.routeInsight', 'Route Insight'),
          suggestion: isSpiritual 
            ? `High demand during upcoming festivals in ${destinationInfo.city}. Book early to secure temple-adjacent stays.`
            : isLongHaul
            ? t('results.insights.routeLongHaul', 'Direct flights save you approx. 4.5 hours of travel time compared to layover options.')
            : t('results.insights.routeNearby', 'Non-stop inventory is selling fast. Alternative nearby airports could save 10%.'),
          impact: isSpiritual ? 'High' : 'High'
        }
      ],
      upgrade: {
        worth: true,
        reason: upgradeReason,
        valueScore: 88 + rnd(10),
        price: upgradePrice
      },
      spiritual: isSpiritual ? {
        bestMonths: destinationInfo.bestMonths?.join(', ') || 'October to March',
        highlights: destinationInfo.highlights || [],
        crowdAlert: rnd(10) > 7 ? 'High festival demand' : 'Standard pilgrimage flow',
        peaceScore: 85 + rnd(15)
      } : null
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
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100">{t('results.insights.fareTitle', 'Fare Intelligence')}</h3>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <p className="text-xs text-amber-700 dark:text-amber-200 font-bold flex items-center gap-2">
              <Info className="h-3.5 w-3.5" />
              {t('results.insights.priceAlert', 'Price alert for {{from}} → {{to}}', { from, to })}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">
              <Trans
                i18nKey="results.insights.fareRise"
                defaults="Fares could <span class='text-amber-400 font-bold'>rise by {{percentage}}%</span> within the next {{timeframe}}."
                values={{ percentage: insights.fare.percentage, timeframe: insights.fare.timeframe }}
                components={{ span: <span className="text-amber-600 dark:text-amber-400 font-bold" /> }}
              />
            </p>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{t('results.insights.bestWindow', 'Best Booking Window')}</span>
            <span className="text-emerald-400 font-bold">{insights.fare.bestWindow}</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <Trans
                i18nKey="results.insights.savingDay"
                defaults="Flying on a <span class='text-emerald-400 font-bold'>{{day}}</span> could save you <span class='text-emerald-400 font-bold'>{{amount}}</span>."
                values={{ day: insights.fare.savingDay, amount: formatPrice(insights.fare.savingAmount) }}
                components={{ span: <span className="text-emerald-600 dark:text-emerald-400 font-bold" /> }}
              />
            </p>
          </div>
        </div>
      </div>

      {/* Route Demand Analytics */}
      <div className="glass rounded-2xl p-6 border border-slate-800/50 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100">{t('results.insights.demandTitle', 'Demand Analytics')}</h3>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t('results.insights.occupancy', 'Flight Occupancy')}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{insights.demand.percentage}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${insights.demand.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{t('results.insights.popularity', 'Route Popularity')}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                {insights.demand.popularity}
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{t('results.insights.trend', 'Trend')}</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 capitalize">{insights.demand.trend}</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 italic">
            {t('results.insights.intensity', 'High intensity booking detected in the last 12 hours.')}
          </p>
        </div>
      </div>

      {/* Spiritual Intelligence (Conditional) */}
      {insights.spiritual && (
        <div className="glass rounded-2xl p-6 border border-purple-500/30 flex flex-col gap-4 bg-gradient-to-br from-purple-500/5 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="h-24 w-24 text-purple-400" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">{t('results.insights.spiritualTitle', 'Spiritual Intelligence')}</h3>
          </div>
          
          <div className="space-y-4 relative z-10">
            <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <p className="text-xs text-purple-400 font-bold flex items-center gap-2 mb-1">
                <Moon className="h-3.5 w-3.5" />
                {t('results.insights.bestMonths', 'Best Months for Pilgrimage')}
              </p>
              <p className="text-sm text-slate-200">{insights.spiritual.bestMonths}</p>
            </div>
 
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{t('results.insights.peaceScore', 'Peace Score')}</span>
              <span className="text-cyan-400 font-bold">{insights.spiritual.peaceScore}/100</span>
            </div>
 
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('results.insights.spiritualHighlights', 'Spiritual Highlights')}</p>
              <div className="flex flex-wrap gap-2">
                {insights.spiritual.highlights.map(h => (
                  <span key={h} className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {h}
                  </span>
                ))}
              </div>
            </div>
 
            <p className="text-[11px] text-amber-400/80 italic font-medium">
              {t('results.insights.spiritualNote', 'Note: {{alert}} during this period.', { alert: insights.spiritual.crowdAlert })}
            </p>
          </div>
        </div>
      )}

      {/* Cabin Recommendation */}
      {!insights.spiritual && (
        <div className="glass rounded-2xl p-6 border border-slate-800/50 flex flex-col gap-4 lg:col-span-1 md:col-span-2 lg:row-span-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">{t('results.insights.cabinTitle', 'Cabin Intelligence')}</h3>
          </div>

          {insights.cabinComparison.map((comp, idx) => (
            <div key={idx} className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 border border-purple-100 dark:border-purple-500/20">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('results.insights.upgradeTitleValue', '{{type}} Upgrade', { type: comp.type })}</p>
                  <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                    {t('results.insights.value', 'Value {{score}}%', { score: comp.valueScore })}
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <Trans
                    i18nKey="results.insights.upgradeOffer"
                    defaults="<pspan>{{type}}</pspan> offers <pspan>{{legroom}} more space</pspan> for only <pspan>{{fareDiff}} more</pspan>."
                    values={{ type: comp.type, legroom: comp.extraLegroom, fareDiff: comp.fareDiff }}
                    components={{ span: <span className="font-bold text-slate-900 dark:text-slate-100" />, pspan: <span className="text-purple-600 dark:text-purple-400 font-bold" />, espan: <span className="text-emerald-600 dark:text-emerald-400 font-bold" /> }}
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

              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 transition-all group">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t('results.insights.viewMatrix', 'View Comparison Matrix')}</span>
                <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Travel Optimization Suggestions */}
      <div className="glass rounded-2xl p-6 border border-slate-800/50 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100">{t('results.insights.optimizationTitle', 'Optimization')}</h3>
        </div>

        <div className="space-y-3">
          {insights.optimization.map((opt, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800/50">
              <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${opt.impact === 'High' ? 'bg-emerald-500' : 'bg-sky-500'}`} />
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-0.5">{opt.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{opt.suggestion}</p>
              </div>
            </div>
          ))}

          <div className="mt-2 flex items-center gap-2 p-3 rounded-xl bg-sky-50 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-500/10">
            <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <p className="text-[11px] text-sky-700 dark:text-sky-300 font-bold">{t('results.insights.onTime', 'The selected flight has a 94% on-time performance.')}</p>
          </div>
        </div>
      </div>

      {/* Smart Upgrade */}
      <div className="glass rounded-2xl p-6 border border-slate-800/50 flex flex-col gap-4 md:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100">{t('results.insights.upgradeTitle', 'Upgrade Advisory')}</h3>
        </div>

        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{t('results.insights.worthUpgrade', 'Is it worth upgrading?')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <Trans
                i18nKey="results.insights.upgradeReason"
                defaults="{{reason}} Upgrades starting from <span class='text-emerald-400 font-bold'>{{price}}</span>."
                values={{ reason: insights.upgrade.reason, price: formatPrice(insights.upgrade.price) }}
                components={{ span: <span className="text-emerald-600 dark:text-emerald-400 font-bold" /> }}
              />
            </p>

            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${insights.upgrade.valueScore}%` }} />
              </div>
              <span className="text-[10px] font-bold text-amber-400">{t('results.insights.match', '{{score}}% Match', { score: insights.upgrade.valueScore })}</span>
            </div>
          </div>

          <button className="btn-primary w-full py-2.5 text-xs">
            {t('results.insights.showOptions', 'Show Upgrade Options')}
          </button>
        </div>
      </div>
    </div>
  )
}
