import { Plane } from 'lucide-react'
import { useState } from 'react'
import { PrivacyModal, TermsModal, ContactModal } from './SupportModals'

export function MainFooter() {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'contact' | null>(null)

  return (
    <footer className="mt-16 border-t border-slate-800/50 pt-10 pb-10">
      <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-purple-600">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-100">SkyFlow</span>
            <span className="ml-1 text-base font-light text-slate-400">Pro</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-slate-500">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Product</span>
            <span className="hover:text-sky-400 cursor-pointer transition-colors">Flight Search</span>
            <span className="hover:text-sky-400 cursor-pointer transition-colors">Seat Selection</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Legal</span>
            <button onClick={() => setActiveModal('privacy')} className="text-left hover:text-sky-400 cursor-pointer transition-colors">Privacy Policy</button>
            <button onClick={() => setActiveModal('terms')} className="text-left hover:text-sky-400 cursor-pointer transition-colors">Terms of Service</button>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Support</span>
            <button onClick={() => setActiveModal('contact')} className="text-left hover:text-sky-400 cursor-pointer transition-colors">Contact Us</button>
            <span className="hover:text-sky-400 cursor-pointer transition-colors">FAQ</span>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-2 text-xs text-slate-500">
          <p>© 2026 SkyFlow Pro. Built for transparency.</p>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Systems operational</span>
          </div>
        </div>
      </div>

      <PrivacyModal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} />
      <TermsModal isOpen={activeModal === 'terms'} onClose={() => setActiveModal(null)} />
      <ContactModal isOpen={activeModal === 'contact'} onClose={() => setActiveModal(null)} />
    </footer>
  )
}
