import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, CreditCard, Shield, Check, Plane, Clock, AlertCircle, ChevronRight, Lock, MapPin, Armchair } from 'lucide-react'
import type { FlightOption } from '../types/flight'
import type { Seat } from '../types/seat'
import { AirportMap } from '../components/airport/AirportMap'
import { SeatSelectionPanel } from '../components/seats/SeatSelectionPanel'

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

const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
})

export function BookingPage() {
    const navigate = useNavigate()
    const { flightId } = useParams()
    const [flight, setFlight] = useState<FlightOption | null>(null)
    const [currentStep, setCurrentStep] = useState(1)
    const [isProcessing, setIsProcessing] = useState(false)
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [showAirportMap, setShowAirportMap] = useState(false)
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

    const handleSubmit = async () => {
        setIsProcessing(true)
        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Generate booking ID
        const bookingId = `SKY${Date.now().toString(36).toUpperCase()}`

        // Store booking details
        sessionStorage.setItem('bookingConfirmation', JSON.stringify({
            bookingId,
            flight,
            passenger,
            selectedSeat: selectedSeat ? { label: selectedSeat.label, position: selectedSeat.position, price: selectedSeat.price, type: selectedSeat.type } : null,
            bookedAt: new Date().toISOString(),
        }))

        navigate(`/confirmation/${bookingId}`)
    }

    if (!flight) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass rounded-2xl p-8 text-center max-w-md">
                    <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-50">No flight selected</h2>
                    <p className="text-sm text-slate-400 mt-2">Please search for and select a flight first.</p>
                    <Link to="/" className="btn-primary inline-flex mt-6">
                        Search Flights
                    </Link>
                </div>
            </div>
        )
    }

    // 4-step flow: Passenger → Seat Selection → Payment → Review
    const steps = [
        { number: 1, title: 'Passenger Details', icon: User },
        { number: 2, title: 'Seat Selection', icon: Armchair },
        { number: 3, title: 'Payment', icon: CreditCard },
        { number: 4, title: 'Review & Confirm', icon: Check },
    ]

    const isStep1Valid = passenger.firstName && passenger.lastName && passenger.email
    const isStep3Valid = payment.cardNumber && payment.expiryDate && payment.cvv && payment.cardholderName
    const totalPrice = flight.price.total + (selectedSeat?.price ?? 0)

    return (
        <div className="min-h-screen">
            {/* Background */}
            <div className="fixed top-20 right-20 h-96 w-96 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />
            <div className="fixed bottom-20 left-20 h-72 w-72 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Back button */}
                <Link
                    to="/results"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to results
                </Link>

                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-slate-50">Complete Your Booking</h1>
                    <p className="text-slate-400 mt-1">Secure checkout · Your data is encrypted</p>
                    <div className="flex items-center gap-3 mt-3">
                        <button
                            type="button"
                            onClick={() => setShowAirportMap(true)}
                            className="btn-secondary text-xs flex items-center gap-1.5"
                        >
                            <MapPin className="h-3.5 w-3.5" />
                            Airport Map
                        </button>
                    </div>
                </div>

                {/* Airport Map Modal */}
                <AirportMap
                    isOpen={showAirportMap}
                    onClose={() => setShowAirportMap(false)}
                    airportCode={flight.from}
                />

                {/* Progress steps */}
                <div className="glass rounded-2xl p-4 mb-8 animate-fade-in">
                    <div className="flex items-center justify-between">
                        {steps.map((step, idx) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div
                                    className={`flex items-center gap-3 ${currentStep >= step.number ? 'text-sky-400' : 'text-slate-500'
                                        }`}
                                >
                                    <div
                                        className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${currentStep > step.number
                                                ? 'bg-emerald-500 text-white'
                                                : currentStep === step.number
                                                    ? 'bg-sky-500 text-white'
                                                    : 'bg-slate-800 text-slate-500'
                                            }`}
                                    >
                                        {currentStep > step.number ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <step.icon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-slate-50' : 'text-slate-500'}`}>
                                            Step {step.number}
                                        </p>
                                        <p className="text-xs text-slate-500">{step.title}</p>
                                    </div>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className="flex-1 mx-4">
                                        <div className={`h-1 rounded-full ${currentStep > step.number ? 'bg-emerald-500' : 'bg-slate-800'}`} />
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
                            <div className="glass rounded-2xl p-6 animate-fade-in">
                                <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2 mb-6">
                                    <User className="h-5 w-5 text-sky-400" />
                                    Passenger Information
                                </h2>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 block mb-2">First Name *</label>
                                        <input
                                            type="text"
                                            value={passenger.firstName}
                                            onChange={(e) => handlePassengerChange('firstName', e.target.value)}
                                            className="input-premium"
                                            placeholder="John"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 block mb-2">Last Name *</label>
                                        <input
                                            type="text"
                                            value={passenger.lastName}
                                            onChange={(e) => handlePassengerChange('lastName', e.target.value)}
                                            className="input-premium"
                                            placeholder="Doe"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 block mb-2">Email Address *</label>
                                        <input
                                            type="email"
                                            value={passenger.email}
                                            onChange={(e) => handlePassengerChange('email', e.target.value)}
                                            className="input-premium"
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 block mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={passenger.phone}
                                            onChange={(e) => handlePassengerChange('phone', e.target.value)}
                                            className="input-premium"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 block mb-2">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={passenger.dateOfBirth}
                                            onChange={(e) => handlePassengerChange('dateOfBirth', e.target.value)}
                                            className="input-premium"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 block mb-2">Passport Number</label>
                                        <input
                                            type="text"
                                            value={passenger.passportNumber}
                                            onChange={(e) => handlePassengerChange('passportNumber', e.target.value.toUpperCase())}
                                            className="input-premium"
                                            placeholder="AB1234567"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-800/50 flex justify-end">
                                    <button
                                        onClick={handleNextStep}
                                        disabled={!isStep1Valid}
                                        className={`btn-primary flex items-center gap-2 ${!isStep1Valid ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Continue to Seat Selection
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Seat Selection */}
                        {currentStep === 2 && (
                            <div className="space-y-4 animate-fade-in">
                                <SeatSelectionPanel
                                    flightId={flight.id}
                                    cabinClass={flight.cabin}
                                    aircraft={flight.segments[0]?.aircraft}
                                    selectedSeat={selectedSeat}
                                    onSeatSelected={setSelectedSeat}
                                />

                                <div className="flex justify-between pt-2">
                                    <button onClick={handlePrevStep} className="btn-secondary">
                                        Back
                                    </button>
                                    <button
                                        onClick={handleNextStep}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        {selectedSeat ? 'Continue to Payment' : 'Skip & Auto-assign'}
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {currentStep === 3 && (
                            <div className="glass rounded-2xl p-6 animate-fade-in">
                                <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2 mb-6">
                                    <CreditCard className="h-5 w-5 text-sky-400" />
                                    Payment Details
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 block mb-2">Cardholder Name *</label>
                                        <input
                                            type="text"
                                            value={payment.cardholderName}
                                            onChange={(e) => handlePaymentChange('cardholderName', e.target.value)}
                                            className="input-premium"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 block mb-2">Card Number *</label>
                                        <input
                                            type="text"
                                            value={payment.cardNumber}
                                            onChange={(e) => handlePaymentChange('cardNumber', formatCardNumber(e.target.value))}
                                            className="input-premium"
                                            placeholder="4242 4242 4242 4242"
                                            maxLength={19}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-slate-400 block mb-2">Expiry Date *</label>
                                            <input
                                                type="text"
                                                value={payment.expiryDate}
                                                onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                                                className="input-premium"
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-400 block mb-2">CVV *</label>
                                            <input
                                                type="password"
                                                value={payment.cvv}
                                                onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                                                className="input-premium"
                                                placeholder="•••"
                                                maxLength={4}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 rounded-lg bg-sky-950/30 border border-sky-500/20 flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-sky-400" />
                                    <p className="text-xs text-sky-300">Your payment is secured with 256-bit SSL encryption</p>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-800/50 flex justify-between">
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
                            <div className="glass rounded-2xl p-6 animate-fade-in">
                                <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2 mb-6">
                                    <Check className="h-5 w-5 text-sky-400" />
                                    Review Your Booking
                                </h2>

                                {/* Passenger summary */}
                                <div className="p-4 rounded-xl bg-slate-800/30 mb-4">
                                    <h3 className="text-sm font-medium text-slate-300 mb-2">Passenger</h3>
                                    <p className="text-lg font-semibold text-slate-50">
                                        {passenger.firstName} {passenger.lastName}
                                    </p>
                                    <p className="text-sm text-slate-400">{passenger.email}</p>
                                </div>

                                {/* Seat summary */}
                                {selectedSeat && (
                                    <div className="p-4 rounded-xl bg-slate-800/30 mb-4">
                                        <h3 className="text-sm font-medium text-slate-300 mb-2">Selected Seat</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-500/20">
                                                {selectedSeat.label}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-50">
                                                    Seat {selectedSeat.label} · {selectedSeat.position.charAt(0).toUpperCase() + selectedSeat.position.slice(1)}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {selectedSeat.price > 0 ? formatter.format(selectedSeat.price) : 'Free — no extra charge'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Payment summary */}
                                <div className="p-4 rounded-xl bg-slate-800/30 mb-4">
                                    <h3 className="text-sm font-medium text-slate-300 mb-2">Payment Method</h3>
                                    <p className="text-lg font-semibold text-slate-50 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-slate-400" />
                                        •••• •••• •••• {payment.cardNumber.slice(-4)}
                                    </p>
                                    <p className="text-sm text-slate-400">{payment.cardholderName}</p>
                                </div>

                                {/* Terms */}
                                <div className="p-4 rounded-xl bg-slate-800/30 mb-6">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={agreedToTerms}
                                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                                            className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500"
                                        />
                                        <span className="text-sm text-slate-400">
                                            I agree to the <button className="text-sky-400 hover:underline">Terms of Service</button>,{' '}
                                            <button className="text-sky-400 hover:underline">Privacy Policy</button>, and the airline's{' '}
                                            <button className="text-sky-400 hover:underline">fare rules</button>.
                                        </span>
                                    </label>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-800/50 flex justify-between">
                                    <button onClick={handlePrevStep} className="btn-secondary">
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!agreedToTerms || isProcessing}
                                        className={`btn-primary flex items-center gap-2 min-w-[180px] justify-center ${!agreedToTerms || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-4 w-4" />
                                                Pay {formatter.format(totalPrice)}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Flight Summary */}
                    <div className="lg:col-span-1">
                        <div className="glass rounded-2xl p-5 sticky top-24 animate-fade-in">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4">Flight Summary</h3>

                            {/* Flight details */}
                            <div className="p-4 rounded-xl bg-slate-800/30 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                                        <Plane className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-50">
                                            {flight.from} → {flight.to}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {flight.segments[0]?.marketingCarrier}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2 text-xs text-slate-400">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>
                                        {Math.floor(flight.totalDurationMinutes / 60)}h {flight.totalDurationMinutes % 60}m
                                    </span>
                                    <span className="text-slate-600">•</span>
                                    <span>{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}</span>
                                </div>
                            </div>

                            {/* Price breakdown */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Base fare</span>
                                    <span className="text-slate-200">{formatter.format(flight.price.baseFare)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Taxes & fees</span>
                                    <span className="text-slate-200">{formatter.format(flight.price.taxesAndFees)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Carrier charges</span>
                                    <span className="text-slate-200">{formatter.format(flight.price.carrierCharges)}</span>
                                </div>
                                {selectedSeat && selectedSeat.price > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-amber-300">Seat {selectedSeat.label} surcharge</span>
                                        <span className="text-amber-300">{formatter.format(selectedSeat.price)}</span>
                                    </div>
                                )}
                                {selectedSeat && selectedSeat.price === 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-emerald-300">Seat {selectedSeat.label}</span>
                                        <span className="text-emerald-300">Free</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-3 border-t border-slate-800/50">
                                    <span className="font-semibold text-slate-50">Total</span>
                                    <span className="text-xl font-bold text-sky-400">{formatter.format(totalPrice)}</span>
                                </div>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-6 pt-4 border-t border-slate-800/50 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Shield className="h-4 w-4 text-emerald-500" />
                                    <span>100% Secure payment</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Check className="h-4 w-4 text-emerald-500" />
                                    <span>Instant confirmation</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Check className="h-4 w-4 text-emerald-500" />
                                    <span>24/7 customer support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
