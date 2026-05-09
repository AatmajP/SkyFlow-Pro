import { useEffect, useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import {
    CheckCircle2,
    Plane,
    Calendar,
    Clock,
    User,
    Download,
    Mail,
    Share2,
    Printer,
    Home,
    ArrowRight,
    QrCode,
    Sparkles
} from 'lucide-react'
import type { FlightOption } from '../types/flight'

interface BookingConfirmation {
    bookingId: string
    flight: FlightOption
    passenger: {
        firstName: string
        lastName: string
        email: string
    }
    bookedAt: string
}

import { useCurrency } from '../context/CurrencyContext'

export function ConfirmationPage() {
    const { t, i18n } = useTranslation()
    const { formatPrice } = useCurrency()
    const { bookingId } = useParams()
    const [booking, setBooking] = useState<BookingConfirmation | null>(null)
    const [showConfetti, setShowConfetti] = useState(true)

    useEffect(() => {
        const stored = sessionStorage.getItem('bookingConfirmation')
        if (stored) {
            setBooking(JSON.parse(stored))
        }

        // Hide confetti after 5 seconds
        const timer = setTimeout(() => setShowConfetti(false), 5000)
        return () => clearTimeout(timer)
    }, [bookingId])

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass rounded-2xl p-8 text-center max-w-md">
                    <h2 className="text-xl font-semibold text-slate-50">{t('confirmation.notFound')}</h2>
                    <p className="text-sm text-slate-400 mt-2">{t('confirmation.notFoundDesc')}</p>
                    <Link to="/" className="btn-primary inline-flex mt-6">
                        <Home className="h-4 w-4 mr-2" />
                        {t('confirmation.goHome')}
                    </Link>
                </div>
            </div>
        )
    }

    const { flight, passenger } = booking

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Confetti animation (CSS-based) */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-fall"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-20px`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${3 + Math.random() * 2}s`,
                            }}
                        >
                            <Sparkles
                                className="h-4 w-4"
                                style={{
                                    color: ['#38bdf8', '#8b5cf6', '#ec4899', '#22c55e', '#f59e0b'][Math.floor(Math.random() * 5)]
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Background decorations */}
            <div className="fixed top-20 right-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-pulse" />
            <div className="fixed bottom-20 left-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none animate-pulse" />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Success Header */}
                <div className="text-center mb-10 animate-scale-in">
                    <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-emerald-500/20 mb-6 animate-pulse-glow">
                        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl">
                        {t('confirmation.successTitle')}
                    </h1>
                    <p className="text-lg text-slate-400 mt-2">
                        {t('confirmation.successSubtitle')}
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700">
                        <span className="text-sm text-slate-400">{t('confirmation.confNumber')}</span>
                        <span className="text-lg font-bold text-sky-400 font-mono">{booking.bookingId}</span>
                    </div>
                </div>

                {/* Booking Card */}
                <div className="glass rounded-3xl p-6 sm:p-8 mb-8 animate-fade-in">
                    {/* Flight Route Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/50">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center">
                                <Plane className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-50">
                                    {flight.from} <ArrowRight className="inline h-5 w-5 text-sky-400 mx-1" /> {flight.to}
                                </h2>
                                <p className="text-sm text-slate-400">
                                    {flight.segments[0]?.marketingCarrier} · {flight.fareBrand}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-400">{formatPrice(flight.price.total)}</p>
                            <p className="text-sm text-slate-400">{t('confirmation.totalPaid')}</p>
                        </div>
                    </div>

                    {/* Flight Details Grid */}
                    <div className="grid gap-6 sm:grid-cols-3 py-6">
                        <div className="text-center p-4 rounded-xl bg-slate-800/30">
                            <Calendar className="h-6 w-6 text-sky-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">{t('confirmation.departureDate')}</p>
                            <p className="text-lg font-semibold text-slate-50 mt-1">
                                {flight.segments[0]?.departureTime
                                    ? new Date(flight.segments[0].departureTime).toLocaleDateString(i18n.language, {
                                        weekday: 'short',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : 'TBD'
                                }
                            </p>
                        </div>

                        <div className="text-center p-4 rounded-xl bg-slate-800/30">
                            <Clock className="h-6 w-6 text-sky-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">{t('confirmation.flightDuration')}</p>
                            <p className="text-lg font-semibold text-slate-50 mt-1">
                                {t('common.duration', { h: Math.floor(flight.totalDurationMinutes / 60), m: flight.totalDurationMinutes % 60 })}
                            </p>
                            <p className="text-xs text-slate-500">{flight.stops === 0 ? t('results.card.nonStop') : t('results.card.stops', { count: flight.stops })}</p>
                        </div>

                        <div className="text-center p-4 rounded-xl bg-slate-800/30">
                            <User className="h-6 w-6 text-sky-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">{t('confirmation.passenger')}</p>
                            <p className="text-lg font-semibold text-slate-50 mt-1">
                                {passenger.firstName} {passenger.lastName}
                            </p>
                            <p className="text-xs text-slate-500">{passenger.email}</p>
                        </div>
                    </div>

                    {/* Boarding Pass Style Section */}
                    <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-dashed border-slate-700">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">{t('confirmation.boardingPass')}</p>
                                <p className="text-sm text-slate-300 mt-1">
                                    {t('confirmation.checkInNote')}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-xl bg-white p-2 flex items-center justify-center">
                                    <QrCode className="h-full w-full text-slate-900" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Baggage Info */}
                    <div className="mt-6 p-4 rounded-xl bg-sky-950/30 border border-sky-500/20">
                        <p className="text-sm font-medium text-sky-300">{t('confirmation.baggageAllowance')}</p>
                        <p className="text-sm text-slate-400 mt-1">{flight.baggagePolicy}</p>
                    </div>
                </div>

                {/* Confirmation sent notice */}
                <div className="glass rounded-2xl p-5 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <Mail className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-200">{t('confirmation.emailSent')}</p>
                            <p className="text-sm text-slate-400">
                                <Trans i18nKey="confirmation.emailSentDesc" values={{ email: passenger.email }}>
                                    We've sent your booking confirmation and e-ticket to <span className="text-sky-400">{{ email: passenger.email }}</span>
                                </Trans>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        {t('confirmation.downloadTicket')}
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        {t('confirmation.printItinerary')}
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        {t('confirmation.shareDetails')}
                    </button>
                </div>

                {/* Return home */}
                <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <p className="text-slate-400 mb-4">{t('confirmation.bookAnother')}</p>
                    <Link to="/" className="btn-primary inline-flex items-center gap-2">
                        <Plane className="h-4 w-4" />
                        {t('confirmation.searchNew')}
                    </Link>
                </div>

                {/* Footer */}
                <footer className="mt-12 pt-6 border-t border-slate-800/50 text-center">
                    <p className="text-xs text-slate-500">
                        <Trans i18nKey="confirmation.supportNote">
                            Need help? Contact our 24/7 customer support at <span className="text-sky-400">support@skyflowpro.com</span>
                        </Trans>
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                        {t('confirmation.bookedOn', {
                            date: new Date(booking.bookedAt).toLocaleDateString(i18n.language, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                        })}
                    </p>
                </footer>
            </div>
        </div>
    )
}
