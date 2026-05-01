import { useEffect, useState } from 'react'
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
    Sparkles,
    Armchair,
    Shield,
    Star
} from 'lucide-react'
import type { FlightOption } from '../types/flight'
import type { Seat } from '../services/seatService'

interface BookingConfirmation {
    bookingId: string
    flight: FlightOption
    passenger: {
        firstName: string
        lastName: string
        email: string
    }
    seat?: Seat
    totalAmount?: number
    bookedAt: string
}

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
})

export function ConfirmationPage() {
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-md animate-scale-in">
                    <h2 className="text-xl font-bold text-slate-900">Booking not found</h2>
                    <p className="text-sm font-medium text-slate-500 mt-2">The booking confirmation could not be found.</p>
                    <Link to="/" className="btn-primary inline-flex mt-8 w-full justify-center">
                        <Home className="h-4 w-4 mr-2" />
                        Go Home
                    </Link>
                </div>
            </div>
        )
    }

    const { flight, passenger } = booking

    const handlePrint = () => {
        window.print()
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Flight Booking',
                    text: `Flight to ${booking.flight.to} with ${booking.flight.segments[0]?.marketingCarrier}`,
                    url: window.location.href,
                })
            } catch (err) {
                console.error('Error sharing:', err)
            }
        } else {
            alert('Sharing is not supported on this browser.')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden print:bg-white">
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

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Success Header */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <div className="relative inline-flex items-center justify-center h-28 w-28 rounded-full mb-8">
                        <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping" style={{ animationDuration: '3s' }} />
                        <div className="absolute inset-2 rounded-full bg-emerald-100 animate-pulse" />
                        <div className="relative flex items-center justify-center h-full w-full rounded-full bg-emerald-50 border border-emerald-200/50 shadow-sm">
                            <CheckCircle2 className="h-14 w-14 text-emerald-600" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Booking Confirmed!
                    </h1>
                    <p className="text-lg font-medium text-slate-500 mt-4 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
                        Your flight has been successfully booked
                    </p>

                    <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-slate-200 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <span className="text-sm font-bold text-slate-500">Confirmation Number:</span>
                        <span className="text-xl font-black text-slate-900 font-mono tracking-wider">{booking.bookingId}</span>
                    </div>
                </div>

                {/* Booking Card */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 sm:p-10 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    {/* Flight Route Header */}
                    <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-slate-100">
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm">
                                <Plane className="h-8 w-8 text-slate-800" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                                    {flight.from} <ArrowRight className="inline h-6 w-6 text-slate-400 mx-2" /> {flight.to}
                                </h2>
                                <p className="text-base font-medium text-slate-500 mt-1.5">
                                    {flight.segments[0]?.marketingCarrier} · {flight.fareBrand}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-4xl font-black text-slate-900">{formatter.format(booking.totalAmount || flight.price.total)}</p>
                            <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mt-1">Total paid</p>
                        </div>
                    </div>

                    {/* Flight Details Grid */}
                    <div className="grid gap-5 sm:grid-cols-4 py-8">
                        {[
                            {
                                icon: Calendar,
                                label: 'Departure Date',
                                value: flight.segments[0]?.departureTime
                                    ? new Date(flight.segments[0].departureTime).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : 'TBD',
                                sub: null,
                            },
                            {
                                icon: Clock,
                                label: 'Flight Duration',
                                value: `${Math.floor(flight.totalDurationMinutes / 60)}h ${flight.totalDurationMinutes % 60}m`,
                                sub: flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`,
                            },
                            {
                                icon: User,
                                label: 'Passenger',
                                value: `${passenger.firstName} ${passenger.lastName}`,
                                sub: passenger.email,
                            },
                            {
                                icon: Armchair,
                                label: 'Seat',
                                value: booking.seat?.seatNumber || 'Auto',
                                sub: booking.seat?.type?.toLowerCase() || 'Standard',
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors animate-fade-in-up"
                                style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
                            >
                                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-white border border-slate-200 mb-4 shadow-sm">
                                    <item.icon className="h-5 w-5 text-slate-700" />
                                </div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
                                <p className="text-lg font-bold text-slate-900 mt-2">{item.value}</p>
                                {item.sub && <p className="text-sm font-medium text-slate-500 mt-1 capitalize">{item.sub}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Boarding Pass Style Section */}
                    <div className="mt-4 p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Boarding Pass</p>
                                <p className="text-base font-bold text-slate-900 mt-2">
                                    Check-in opens 24 hours before departure
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-2xl bg-white p-3 flex items-center justify-center shadow-sm border border-slate-200">
                                    <QrCode className="h-14 w-14 text-slate-900" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Baggage Info */}
                    <div className="mt-6 p-5 rounded-2xl bg-white border border-slate-200 flex items-center gap-4 animate-fade-in-up shadow-sm" style={{ animationDelay: '0.9s' }}>
                        <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-xl bg-slate-50">
                            <Shield className="h-5 w-5 text-slate-700" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Baggage Allowance</p>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">{flight.baggagePolicy}</p>
                        </div>
                    </div>
                </div>

                {/* Confirmation sent notice */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-10 animate-fade-in-up no-print" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                            <Mail className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-lg">Confirmation email sent</p>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                We've sent your booking confirmation and e-ticket to <span className="text-slate-900 font-bold">{passenger.email}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up no-print" style={{ animationDelay: '0.6s' }}>
                    <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 px-6 py-3">
                        <Download className="h-4 w-4" />
                        Download E-Ticket
                    </button>
                    <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 px-6 py-3">
                        <Printer className="h-4 w-4" />
                        Print Itinerary
                    </button>
                    <button onClick={handleShare} className="btn-secondary flex items-center gap-2 px-6 py-3">
                        <Share2 className="h-4 w-4" />
                        Share Details
                    </button>
                </div>

                {/* Rating prompt */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 mt-10 text-center animate-fade-in-up no-print" style={{ animationDelay: '0.7s' }}>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-8 w-8 text-amber-200 hover:text-amber-400 cursor-pointer transition-colors" />
                        ))}
                    </div>
                    <p className="text-base font-bold text-slate-900">How was your booking experience?</p>
                </div>

                {/* Return home */}
                <div className="text-center mt-12 animate-fade-in-up no-print" style={{ animationDelay: '0.8s' }}>
                    <p className="text-slate-500 font-medium mb-5">Need to book another flight?</p>
                    <Link to="/" className="btn-primary inline-flex items-center gap-3">
                        <Plane className="h-5 w-5" />
                        Search New Flights
                    </Link>
                </div>

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-slate-200 text-center">
                    <p className="text-sm font-medium text-slate-500">
                        Need help? Contact our customer support at <span className="text-slate-900 font-bold">support@skyflowpro.com</span>
                    </p>
                    <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">
                        Booked on {new Date(booking.bookedAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </footer>
            </div>
        </div>
    )
}
