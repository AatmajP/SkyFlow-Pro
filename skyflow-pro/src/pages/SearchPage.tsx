import { GlobalSearchHeader } from '../components/global-search/GlobalSearchHeader'
import { SmartDiscovery } from '../components/search/SmartDiscovery'
import { MainFooter } from '../components/ui/MainFooter'
import { Plane, Shield, Tag, Clock, Star, Users, Zap, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function SearchPage() {
  const { t } = useTranslation()

  const features = [
    {
      icon: Shield,
      title: t('features.noHiddenFees.title'),
      description: t('features.noHiddenFees.desc'),
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Tag,
      title: t('features.priceGuarantee.title'),
      description: t('features.priceGuarantee.desc'),
      color: 'from-sky-500 to-blue-500',
    },
    {
      icon: Clock,
      title: t('features.realTime.title'),
      description: t('features.realTime.desc'),
      color: 'from-purple-500 to-violet-500',
    },
    {
      icon: Zap,
      title: t('features.instantBooking.title'),
      description: t('features.instantBooking.desc'),
      color: 'from-amber-500 to-orange-500',
    },
  ]

  const stats = [
    { value: '50+', label: t('stats.destinations'), icon: Plane },
    { value: '6', label: t('stats.airlines'), icon: Users },
    { value: '20+', label: t('stats.dailyFlights'), icon: Globe },
    { value: '4.9', label: t('stats.userRating'), icon: Star },
  ]

  const airlines = [
    'IndiGo', 'Air India', 'Vistara', 'SpiceJet', 'Akasa Air', 'Patro Airlines',
    'Emirates', 'British Airways', 'Lufthansa', 'Singapore Airlines',
  ]

  return (
    <div className="relative min-h-screen overflow-x-hidden">
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
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-500/10 px-4 py-1.5 text-xs font-bold text-sky-600 dark:text-sky-300 ring-1 ring-sky-200 dark:ring-sky-500/30 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
            </span>
            {t('hero.badge')}
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            <span className="gradient-text">{t('hero.titlePrefix')}</span>
            <br />
            <span className="text-slate-900 dark:text-slate-100">{t('hero.titleSuffix')}</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg font-medium">
            {t('hero.subtitle')}
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
                className="glass rounded-2xl p-5 text-center card-hover border border-slate-200 dark:border-slate-800/50"
              >
                <stat.icon className="mx-auto mb-3 h-6 w-6 text-sky-600 dark:text-sky-400" />
                <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{stat.value}</p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{stat.label}</p>
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
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 sm:text-3xl">
              {t('features.title').split('SkyFlow Pro')[0]} <span className="gradient-text">SkyFlow Pro</span>
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 font-medium">{t('features.subtitle')}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="glass rounded-2xl p-6 card-hover animate-fade-in border border-slate-200 dark:border-slate-800/50"
                style={{ animationDelay: `${0.1 * idx}s` }}
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trusted Airlines */}
        <section className="mb-16 glass rounded-2xl p-8 animate-fade-in border border-slate-200 dark:border-slate-800/50">
          <p className="text-center text-sm font-bold text-slate-500 dark:text-slate-400 mb-6">
            {t('trusted.text')}
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
        <MainFooter />
      </div>
    </div>
  )
}
