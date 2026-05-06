/**
 * Login/Profile Modal Component
 * 
 * Handles user authentication and profile display.
 */

import { useState } from 'react'
import { X, User, Mail, Lock, LogOut, Plane, Award } from 'lucide-react'
import { useAuth } from '@/stores'
import { useBookingStore } from '@/stores'
import { getAirlineConfig } from '@/config'
import { authService } from '@/services/auth/authService'

interface ProfileModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user, isAuthenticated, logout } = useAuth()
    const { bookings } = useBookingStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        try {
            await authService.login(email, password)
            setEmail('')
            setPassword('')
            onClose()
        } catch (error: any) {
            console.error('Login failed:', error)
            setError(error.response?.data?.message || 'Invalid username or password')
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
        onClose()
    }

    return (
        <>
            {/* Modal Wrapper */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-black/50 animate-fade-in"
                    onClick={onClose}
                />

                {/* Modal Container */}
                <div className="relative w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl z-10 animate-scale-in overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-sky-400" />
                            <h2 className="text-lg font-semibold text-slate-50">
                                {isAuthenticated ? 'My Profile' : 'Sign In'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800 transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {isAuthenticated && user ? (
                            <div className="space-y-6">
                                {/* User Info */}
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-purple-600">
                                        <User className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-50">{user.name}</h3>
                                        <p className="text-sm text-slate-400">{user.email}</p>
                                    </div>
                                </div>

                                {/* Loyalty Programs */}
                                {user.loyaltyPrograms && Object.keys(user.loyaltyPrograms).length > 0 && (
                                    <div className="rounded-xl bg-slate-800/30 border border-slate-800 p-4">
                                        <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                            <Award className="h-4 w-4" />
                                            Loyalty Programs
                                        </h4>
                                        <div className="space-y-2">
                                            {Object.entries(user.loyaltyPrograms).map(([code, number]) => {
                                                const airline = getAirlineConfig(code)
                                                return (
                                                    <div
                                                        key={code}
                                                        className="flex items-center justify-between text-sm"
                                                    >
                                                        <span className="text-slate-400">{airline?.name || code}</span>
                                                        <span className="text-slate-50 font-medium">{number}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Booking History */}
                                <div className="rounded-xl bg-slate-800/30 border border-slate-800 p-4">
                                    <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                        <Plane className="h-4 w-4" />
                                        Recent Bookings
                                    </h4>
                                    {bookings.length === 0 ? (
                                        <p className="text-sm text-slate-500">No bookings yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {bookings.slice(0, 3).map((booking) => {
                                                const segment = booking.flight.segments[0]
                                                const airline = getAirlineConfig(segment.marketingCarrierCode)
                                                return (
                                                    <div
                                                        key={booking.id}
                                                        className="flex items-center justify-between text-sm"
                                                    >
                                                        <div>
                                                            <div className="text-slate-50 font-medium">
                                                                {booking.flight.from} → {booking.flight.to}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                {airline?.name} {segment.flightNumber} • PNR: {booking.pnr}
                                                            </div>
                                                        </div>
                                                        <span
                                                            className={`px-2 py-1 text-xs rounded-full ${booking.status === 'confirmed'
                                                                ? 'bg-green-500/10 text-green-400'
                                                                : booking.status === 'trip-completed'
                                                                    ? 'bg-slate-700 text-slate-400'
                                                                    : 'bg-red-500/10 text-red-400'
                                                                }`}
                                                        >
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="text-sm font-medium text-slate-300 block mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Username or Email"
                                            required
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="text-sm font-medium text-slate-300 block mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                                        <p className="text-xs text-red-400">{error}</p>
                                    </div>
                                )}

                                {/* Demo Notice */}
                                <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-3">
                                    <p className="text-xs text-sky-300">
                                        <strong>Real Mode:</strong> Use your registered credentials.
                                        Default User: user/password
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full btn-primary ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Signing In...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>

                                <p className="text-xs text-center text-slate-500">
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        className="text-sky-400 hover:text-sky-300"
                                    >
                                        Sign up
                                    </button>
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
