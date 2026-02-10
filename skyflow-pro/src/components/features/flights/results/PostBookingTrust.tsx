import { Shield, Clock, RotateCcw, MessageSquare } from 'lucide-react'

export function PostBookingTrust() {
    return (
        <div className="rounded-2xl border border-sky-500/20 bg-sky-950/10 p-4 mt-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-sky-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Post-Booking Promise
            </h3>

            <div className="space-y-4">
                <div className="flex gap-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Clock className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-200">Instant Confirmation</h4>
                        <p className="text-xs text-slate-400">Receive your e-ticket and booking reference immediately via email.</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-amber-500/10 text-amber-500">
                        <RotateCcw className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-200">24-Hour Free Cancellation</h4>
                        <p className="text-xs text-slate-400">Changed your mind? Cancel within 24 hours for a full refund.*</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-purple-500/10 text-purple-500">
                        <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-200">Real-time Updates</h4>
                        <p className="text-xs text-slate-400">We'll notify you automatically about gate changes or delays.</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-sky-500/10 text-[10px] text-slate-500 text-center">
                *Applies to flights booked at least 7 days before departure
            </div>
        </div>
    )
}
