import { X, HelpCircle, Mail, Phone, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { chatService, type SupportData } from '@/services/chat/chatService'

interface HelpPanelProps {
    isOpen: boolean
    onClose: () => void
}

export function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
    const [supportData, setSupportData] = useState<SupportData | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true)
            chatService.getSupportData()
                .then(setSupportData)
                .catch(err => console.error('Failed to fetch support data', err))
                .finally(() => setIsLoading(false))
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 animate-slide-in-right flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-sky-400" />
                        <h2 className="text-lg font-semibold text-slate-50">Help & Support</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800 transition-colors"
                        aria-label="Close help panel"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Contact Section */}
                    {supportData && (
                        <section>
                            <h3 className="text-sm font-semibold text-slate-300 mb-3">Contact Support</h3>
                            <div className="space-y-2">
                                <a
                                    href={`mailto:${supportData.supportEmail}`}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                                >
                                    <div className="p-2 rounded-lg bg-sky-500/10">
                                        <Mail className="h-4 w-4 text-sky-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-50">Email Support</div>
                                        <div className="text-xs text-slate-400">{supportData.supportEmail}</div>
                                    </div>
                                </a>

                                <a
                                    href={`tel:${supportData.supportPhone}`}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                                >
                                    <div className="p-2 rounded-lg bg-green-500/10">
                                        <Phone className="h-4 w-4 text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-50">Phone Support</div>
                                        <div className="text-xs text-slate-400">{supportData.supportPhone}</div>
                                    </div>
                                </a>

                                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                        <MessageCircle className="h-4 w-4 text-purple-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-medium text-slate-50">Live Chat</div>
                                        <div className="text-xs text-slate-400">{supportData.chatHours}</div>
                                    </div>
                                </button>
                            </div>
                        </section>
                    )}

                    {/* FAQs */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-300 mb-3">
                            Frequently Asked Questions
                        </h3>
                        {isLoading ? (
                            <div className="text-center py-8 text-slate-500 animate-pulse">Loading FAQs...</div>
                        ) : (
                            <div className="space-y-3">
                                {(supportData?.faqs || []).map((faq, index) => (
                                    <details
                                        key={index}
                                        className="group rounded-xl bg-slate-800/30 border border-slate-800 overflow-hidden"
                                    >
                                        <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-slate-50 hover:bg-slate-800/50 transition-colors">
                                            {faq.question}
                                            <HelpCircle className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                                        </summary>
                                        <div className="px-4 pb-4 text-sm text-slate-400 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Quick Tips */}
                    <section className="rounded-xl bg-sky-500/5 border border-sky-500/20 p-4">
                        <h3 className="text-sm font-semibold text-sky-300 mb-2">💡 Pro Tips</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>• Use flexible dates to find the cheapest fares</li>
                            <li>• Book with Patro Airlines for transparent pricing</li>
                            <li>• Enable notifications for real-time flight updates</li>
                            <li>• Compare cabin classes to find the best value</li>
                            <li>• Check refund policies before booking</li>
                        </ul>
                    </section>
                </div>
            </div>
        </>
    )
}
