import { X, Shield, FileText, Send, HelpCircle, MessageSquare, Phone, Mail, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PrivacyModal({ isOpen, onClose }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[110] w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Shield className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-50">Privacy Policy</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-sm text-slate-400 leading-relaxed custom-scrollbar">
              <section>
                <h3 className="text-slate-100 font-bold mb-3 text-base">1. Information We Collect</h3>
                <p>We collect information you provide directly to us when you search for flights, make a booking, or contact our support team. This includes your name, email address, payment information, and travel preferences.</p>
              </section>
              <section>
                <h3 className="text-slate-100 font-bold mb-3 text-base">2. How We Use Your Data</h3>
                <p>Your data is used solely to provide and improve our services, process transactions, and communicate with you about your bookings and potential fare alerts.</p>
              </section>
              <section>
                <h3 className="text-slate-100 font-bold mb-3 text-base">3. Data Security</h3>
                <p>We implement industry-standard encryption and security measures to protect your personal and payment information. We never store full credit card details on our servers.</p>
              </section>
              <section>
                <h3 className="text-slate-100 font-bold mb-3 text-base">4. Cookies and Tracking</h3>
                <p>We use cookies to enhance your browsing experience, remember your preferences, and analyze our traffic to provide better flight recommendations.</p>
              </section>
            </div>
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
              <button onClick={onClose} className="btn-primary px-8">I Understand</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function TermsModal({ isOpen, onClose }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[110] w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-50">Terms & Conditions</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-sm text-slate-400 leading-relaxed custom-scrollbar">
              <section>
                <h3 className="text-slate-100 font-bold mb-3 text-base">1. Booking and Cancellation</h3>
                <p>All bookings made through SkyFlow Pro are subject to carrier availability. Cancellation policies vary by airline and fare class. Refundable fares will be processed within 5-7 business days.</p>
              </section>
              <section>
                <h3 className="text-slate-100 font-bold mb-3 text-base">2. Baggage Policy</h3>
                <p>Standard economy fares typically include one carry-on and one personal item. Additional checked baggage fees may apply and are determined by the airline.</p>
              </section>
              <section>
                <h3 className="text-slate-100 font-bold mb-3 text-base">3. User Responsibilities</h3>
                <p>Users are responsible for providing accurate travel documents and arriving at the airport at least 3 hours before international flights and 2 hours before domestic flights.</p>
              </section>
              <section>
                <h3 className="text-slate-100 font-bold mb-3 text-base">4. Fare Conditions</h3>
                <p>Prices shown are dynamic and guaranteed only at the time of booking completion. Taxes and carrier fees are included in the final displayed price.</p>
              </section>
            </div>
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
              <button onClick={onClose} className="btn-primary px-8">Accept Terms</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function ContactModal({ isOpen, onClose }: ModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[110] w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-50">Support Center</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-50 mb-2">Message Sent!</h3>
                  <p className="text-slate-400 max-w-sm mx-auto">Thank you for reaching out. Our support team will get back to you within 24 hours.</p>
                  <button onClick={onClose} className="mt-8 btn-secondary">Close Window</button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-slate-100 font-bold mb-4 flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-sky-400" />
                        Common Questions
                      </h3>
                      <div className="space-y-3">
                        {['How to cancel a booking?', 'Baggage allowance rules', 'Refund status check'].map(q => (
                          <button key={q} className="w-full text-left p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300 hover:border-sky-500/30 transition-all flex items-center justify-between group">
                            {q}
                            <Send className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-800 space-y-4">
                      <div className="flex items-center gap-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                        <Phone className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm">+91 1800-SKY-FLOW</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                        <Mail className="h-4 w-4 text-sky-400" />
                        <span className="text-sm">support@skyflowpro.com</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Support Active</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-slate-100 font-bold mb-4">Send us a message</h3>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Category</label>
                      <select required className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50">
                        <option value="booking">Booking Issue</option>
                        <option value="refund">Refund Request</option>
                        <option value="baggage">Baggage Inquiry</option>
                        <option value="other">Other Inquiry</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
                      <input type="email" required placeholder="john@example.com" className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Message</label>
                      <textarea required rows={4} placeholder="How can we help you?" className="w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none" />
                    </div>
                    <button disabled={loading} type="submit" className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                      {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
