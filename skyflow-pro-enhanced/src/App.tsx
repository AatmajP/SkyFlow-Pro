import { Navigate, Route, Routes } from 'react-router-dom'
import { SkipLink } from './components/ui/SkipLink'
import { Navbar } from './components/ui/Navbar'
import { ResultsPage } from './pages/ResultsPage'
import { SearchPage } from './pages/SearchPage'
import { BookingPage } from './pages/BookingPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { Toaster } from './components/ui/Toaster'

function App() {
  return (
    <div className="min-h-screen text-slate-50">
      <SkipLink />
      <Navbar />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/booking/:flightId" element={<BookingPage />} />
        <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
