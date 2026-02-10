import { SkipLink } from '@/components/common/SkipLink'
import { NavbarEnhanced as Navbar } from '@/components/Header'
import { AppRoutes } from '@/routes/AppRoutes'
import { Toaster } from '@/components/common/Toaster'

function App() {
  return (
    <div className="min-h-screen text-slate-50">
      <SkipLink />
      <Navbar />
      <AppRoutes />
      <Toaster />
    </div>
  )
}

export default App
