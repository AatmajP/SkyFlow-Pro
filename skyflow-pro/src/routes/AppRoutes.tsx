/**
 * Route definitions for the application.
 * Centralizes all route configuration for maintainability.
 */

import { Navigate, Route, Routes } from 'react-router-dom'
import { ResultsPage } from '@/pages/FlightResults'
import { SearchPage } from '@/pages/SearchFlights'
import { BookingPage } from '@/pages/Booking'
import { ConfirmationPage } from '@/pages/BookingConfirmation'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SearchPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/booking/:flightId" element={<BookingPage />} />
      <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
