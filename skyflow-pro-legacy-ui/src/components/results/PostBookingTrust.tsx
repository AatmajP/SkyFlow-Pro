import { Shield, Clock, RotateCcw, MessageSquare } from 'lucide-react'

export function PostBookingTrust() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 mt-4">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                Post-Booking Promise
            </h3>

            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-emerald-100 text-emerald-600">
                        <Clock className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">Instant Confirmation</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Receive your e-ticket and booking reference immediately via email.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-amber-100 text-amber-600">
                        <RotateCcw className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">24-Hour Free Cancellation</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Changed your mind? Cancel within 24 hours for a full refund.*</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-indigo-100 text-indigo-600">
                        <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">Real-time Updates</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">We'll notify you automatically about gate changes or delays.</p>
                    </div>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 text-[10px] text-slate-400 font-medium text-center">
                *Applies to flights booked at least 7 days before departure
            </div>
        </div>
    )
}
