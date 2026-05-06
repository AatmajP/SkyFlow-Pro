import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, CreditCard, Shield, Check, Plane, Clock, ChevronRight, Lock, Sparkles } from 'lucide-react'
import type { FlightOption } from '../types/flight'
import { useBookingStore } from '../stores/bookingStore' // Import booking store
import { SeatMap } from '../components/booking/SeatMap'
import type { Seat } from '../services/seatService'

interface PassengerInfo {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    passportNumber: string
}

interface PaymentInfo {
    cardNumber: string
    expiryDate: string
    cvv: string
    cardholderName: string
}

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
})

export function BookingPage() {
    const navigate = useNavigate()
    const { flightId } = useParams()
    const [flight, setFlight] = useState<FlightOption | null>(null)
    const [currentStep, setCurrentStep] = useState(1)
    const [isProcessing, setIsProcessing] = useState(false)
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)

    const [passenger, setPassenger] = useState<PassengerInfo>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        passportNumber: '',
    })

    const [payment, setPayment] = useState<PaymentInfo>({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
    })

    useEffect(() => {
        // Get flight from session storage
        const stored = sessionStorage.getItem('selectedFlight')
        if (stored) {
            setFlight(JSON.parse(stored))
        }
    }, [flightId])

    const handlePassengerChange = (field: keyof PassengerInfo, value: string) => {
        setPassenger((prev) => ({ ...prev, [field]: value }))
    }

    const handlePaymentChange = (field: keyof PaymentInfo, value: string) => {
        setPayment((prev) => ({ ...prev, [field]: value }))
    }

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        const matches = v.match(/\d{4,16}/g)
        const match = (matches && matches[0]) || ''
        const parts = []
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }
        return parts.length ? parts.join(' ') : value
    }

    const handleNextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const { addBooking } = useBookingStore()

    const handleSubmit = async () => {
        if (!flight) return

        setIsProcessing(true)
        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const totalWithSeat = flight.price.total + (selectedSeat?.price || 0)

        const bookingData = {
            flight,
            passengers: [{
                ...passenger,
                title: 'Mr/Ms' // Default title as it's not collected in the form
            }],
            totalAmount: totalWithSeat,
            seat: selectedSeat
        }

        // Add to persistent store for notifications/history
        addBooking(bookingData)

        const bookingId = `SKY${Date.now().toString(36).toUpperCase()}`

        // Store booking details in session for ConfirmationPage
        sessionStorage.setItem('bookingConfirmation', JSON.stringify({
            bookingId,
            flight,
            passenger,
            seat: selectedSeat,
            totalAmount: totalWithSeat,
            bookedAt: new Date().toISOString(),
        }))

        // Dispatch custom event for immediate UI updates if needed
        window.dispatchEvent(new CustomEvent('booking-completed', { detail: { bookingId, ...bookingData } }))

        navigate(`/confirmation/${bookingId}`)
    }

    if (!flight) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-md animate-scale-in shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">No flight selected</h2>
                    <p className="text-sm font-medium text-slate-500 mt-2">Please search for and select a flight first.</p>
                    <Link to="/" className="btn-primary inline-flex mt-8 w-full justify-center">
                        Search Flights
                    </Link>
                </div>
            </div>
        )
    }

    const steps = [
        { number: 1, title: 'Passenger', icon: User },
        { number: 2, title: 'Seat', icon: Plane },
        { number: 3, title: 'Payment', icon: CreditCard },
        { number: 4, title: 'Confirm', icon: Check },
    ]

    const isStep1Valid = passenger.firstName && passenger.lastName && passenger.email
    const isStep2Valid = selectedSeat !== null // Seat must be selected
    const isStep3Valid = payment.cardNumber && payment.expiryDate && payment.cvv && payment.cardholderName

    const totalWithSeat = flight.price.total + (selectedSeat?.price || 0)

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Back button */}
                <Link
                    to="/results"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6 group"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to results
                </Link>

                {/* Header */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">Complete Your Booking</h1>
                    <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-emerald-500" />
                        Secure checkout · Your data is encrypted
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between">
                        {steps.map((step, idx) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div
                                    className={`flex items-center gap-3 ${currentStep >= step.number ? 'text-slate-900' : 'text-slate-400'
                                        }`}
                                >
                                    <div
                                        className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 ${currentStep > step.number
                                            ? 'bg-slate-900 text-white'
                                            : currentStep === step.number
                                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                                : 'bg-slate-100 text-slate-400'
                                            }`}
                                    >
                                        {currentStep > step.number ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <step.icon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className={`text-sm font-bold ${currentStep >= step.number ? 'text-slate-900' : 'text-slate-400'}`}>
                                            Step {step.number}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-500">{step.title}</p>
                                    </div>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className="flex-1 mx-4">
                                        <div className={`h-1 rounded-full transition-all duration-500 ${currentStep > step.number
                                            ? 'bg-emerald-500'
                                            : 'bg-slate-100'
                                            }`} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main content */}
                    <div className="lg:col-span-2">
                        {/* Step 1: Passenger Details */}
                        {currentStep === 1 && (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-fade-in-up">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-8">
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <User className="h-5 w-5 text-slate-800" />
                                    </div>
                                    Passenger Information
                                </h2>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    {[
                                        { label: 'First Name *', field: 'firstName' as const, type: 'text', placeholder: 'John' },
                                        { label: 'Last Name *', field: 'lastName' as const, type: 'text', placeholder: 'Doe' },
                                        { label: 'Email Address *', field: 'email' as const, type: 'email', placeholder: 'john@example.com' },
                                        { label: 'Phone Number', field: 'phone' as const, type: 'tel', placeholder: '+1 (555) 000-0000' },
                                        { label: 'Date of Birth', field: 'dateOfBirth' as const, type: 'date', placeholder: '' },
                                        { label: 'Passport Number', field: 'passportNumber' as const, type: 'text', placeholder: 'AB1234567' },
                                    ].map((input) => (
                                        <div key={input.field} className="group">
                                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-2">{input.label}</label>
                                            <input
                                                type={input.type}
                                                value={passenger[input.field]}
                                                onChange={(e) => handlePassengerChange(input.field, input.field === 'passportNumber' ? e.target.value.toUpperCase() : e.target.value)}
                                                className="input-cinematic"
                                                placeholder={input.placeholder}
                                                required={input.label.includes('*')}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                    <button
                                        onClick={handleNextStep}
                                        disabled={!isStep1Valid}
                                        className={`btn-primary flex items-center gap-2 ${!isStep1Valid ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Select Seat
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Seat Selection */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <SeatMap
                                    flightId={flight.id}
                                    selectedSeat={selectedSeat}
                                    onSeatSelected={setSelectedSeat}
                                />

                                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex justify-between">
                                    <button onClick={handlePrevStep} className="btn-secondary">
                                        Back
                                    </button>
                                    <button
                                        onClick={handleNextStep}
                                        disabled={!isStep2Valid}
                                        className={`btn-primary flex items-center gap-2 ${!isStep2Valid ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {selectedSeat ? 'Continue to Payment' : 'Select a seat to continue'}
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {currentStep === 3 && (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-fade-in-up">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-8">
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <CreditCard className="h-5 w-5 text-slate-800" />
                                    </div>
                                    Payment Details
                                </h2>

                                <div className="space-y-5">
                                    {[
                                        { label: 'Cardholder Name *', field: 'cardholderName' as const, type: 'text', placeholder: 'John Doe', maxLength: undefined },
                                        { label: 'Card Number *', field: 'cardNumber' as const, type: 'text', placeholder: '4242 4242 4242 4242', maxLength: 19 },
                                    ].map((input) => (
                                        <div key={input.field} className="group">
                                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-2">{input.label}</label>
                                            <input
                                                type={input.type}
                                                value={payment[input.field]}
                                                onChange={(e) => handlePaymentChange(input.field, input.field === 'cardNumber' ? formatCardNumber(e.target.value) : e.target.value)}
                                                className="input-cinematic"
                                                placeholder={input.placeholder}
                                                maxLength={input.maxLength}
                                                required
                                            />
                                        </div>
                                    ))}
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="group">
                                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-2">Expiry Date *</label>
                                            <input
                                                type="text"
                                                value={payment.expiryDate}
                                                onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                                                className="input-cinematic"
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                required
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-2">CVV *</label>
                                            <input
                                                type="password"
                                                value={payment.cvv}
                                                onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                                                className="input-cinematic"
                                                placeholder="•••"
                                                maxLength={4}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                                        <Lock className="h-4 w-4 text-slate-700" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">Your payment is secured with 256-bit SSL encryption</p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
                                    <button onClick={handlePrevStep} className="btn-secondary">
                                        Back
                                    </button>
                                    <button
                                        onClick={handleNextStep}
                                        disabled={!isStep3Valid}
                                        className={`btn-primary flex items-center gap-2 ${!isStep3Valid ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Review Booking
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review & Confirm */}
                        {currentStep === 4 && (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-fade-in-up">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-8">
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-slate-800" />
                                    </div>
                                    Review Your Booking
                                </h2>

                                {/* Passenger summary */}
                                <div className="p-5 rounded-2xl bg-slate-50 mb-4 border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Passenger</h3>
                                    <p className="text-xl font-bold text-slate-900">
                                        {passenger.firstName} {passenger.lastName}
                                    </p>
                                    <p className="text-sm font-medium text-slate-500">{passenger.email}</p>
                                </div>

                                <div className="p-5 rounded-2xl bg-slate-50 mb-4 border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Seat Selected</h3>
                                    <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <Plane className="h-5 w-5 text-slate-500 rotate-90" />
                                        {selectedSeat?.seatNumber}
                                    </p>
                                    <p className="text-sm font-medium text-slate-500">
                                        {selectedSeat?.type === 'STANDARD' ? 'Standard Seat' :
                                            selectedSeat?.type === 'PREFERRED' ? 'Preferred Seat' : 'Premium / Extra Legroom'}
                                    </p>
                                </div>

                                {/* Payment summary */}
                                <div className="p-5 rounded-2xl bg-slate-50 mb-6 border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Payment Method</h3>
                                    <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-slate-500" />
                                        •••• •••• •••• {payment.cardNumber.slice(-4)}
                                    </p>
                                    <p className="text-sm font-medium text-slate-500">{payment.cardholderName}</p>
                                </div>

                                {/* Terms */}
                                <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 mb-8">
                                    <label className="flex items-start gap-4 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={agreedToTerms}
                                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                                            className="mt-1 h-5 w-5 rounded border-slate-300 bg-white text-slate-900 focus:ring-slate-900 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium text-slate-700 leading-relaxed">
                                            I agree to the <button className="font-bold border-b border-slate-900 hover:text-slate-900 pb-0.5">Terms of Service</button>,{' '}
                                            <button className="font-bold border-b border-slate-900 hover:text-slate-900 pb-0.5">Privacy Policy</button>, and the airline's{' '}
                                            <button className="font-bold border-b border-slate-900 hover:text-slate-900 pb-0.5">fare rules</button>.
                                        </span>
                                    </label>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
                                    <button onClick={handlePrevStep} className="btn-secondary">
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!agreedToTerms || isProcessing}
                                        className={`btn-gradient flex items-center gap-2 min-w-[200px] justify-center ${!agreedToTerms || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="h-5 w-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-4 w-4" />
                                                Pay {formatter.format(totalWithSeat)}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Flight Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sticky top-24 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <h3 className="text-xs font-bold text-slate-500 mb-5 uppercase tracking-widest">Flight Summary</h3>

                            {/* Flight details */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                                        <Plane className="h-6 w-6 text-slate-800" />
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-slate-900 text-lg">
                                            {flight.from} → {flight.to}
                                        </p>
                                        <p className="text-sm font-medium text-slate-500">
                                            {flight.segments[0]?.marketingCarrier}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 text-sm font-semibold text-slate-500">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        {Math.floor(flight.totalDurationMinutes / 60)}h {flight.totalDurationMinutes % 60}m
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span>{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}</span>
                                </div>
                            </div>

                            {/* Price breakdown */}
                            <div className="space-y-4 text-sm font-medium">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Base fare</span>
                                    <span className="text-slate-900">{formatter.format(flight.price.baseFare)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Taxes & fees</span>
                                    <span className="text-slate-900">{formatter.format(flight.price.taxesAndFees)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Carrier charges</span>
                                    <span className="text-slate-900">{formatter.format(flight.price.carrierCharges)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Seat selection</span>
                                    <span className={selectedSeat?.price ? "text-slate-900" : "text-emerald-600"}>
                                        {selectedSeat ? (selectedSeat.price > 0 ? formatter.format(selectedSeat.price) : 'Free') : 'Not selected'}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-5 mt-2 border-t border-slate-200">
                                    <span className="font-bold text-slate-900">Total</span>
                                    <span className="text-2xl font-black text-slate-900">{formatter.format(totalWithSeat)}</span>
                                </div>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                                {[
                                    { icon: Shield, text: '100% Secure payment', color: 'text-emerald-600' },
                                    { icon: Check, text: 'Instant confirmation', color: 'text-emerald-600' },
                                    { icon: Check, text: '24/7 customer support', color: 'text-emerald-600' },
                                ].map((badge, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                        <badge.icon className={`h-5 w-5 ${badge.color}`} />
                                        <span>{badge.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
