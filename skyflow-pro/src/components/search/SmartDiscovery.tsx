import { useNavigate } from 'react-router-dom'
import { Zap, Bell } from 'lucide-react'
import { useDiscoveryDeals } from '../../hooks/useDiscovery'
import { useCurrency } from '../../context/CurrencyContext'
import { useTranslation } from 'react-i18next'

export function SmartDiscovery() {
  const { t } = useTranslation()
  const { formatPrice } = useCurrency()
  const navigate = useNavigate()
  const defaultFrom = 'DEL'

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
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">{t('discovery.liveDeals')}</h2>
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
                <p className="text-xs text-slate-500">{t('discovery.fromPrefix')}</p>
                <p className="text-sm font-bold text-emerald-400">{formatPrice(deal.price)}</p>
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
    </div>
  )
}
