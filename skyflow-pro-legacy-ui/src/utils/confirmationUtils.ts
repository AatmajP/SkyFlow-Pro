import type { FlightOption } from '@/types'

export interface ConfirmationData {
    bookingId: string
    flight: FlightOption
    passenger: {
        firstName: string
        lastName: string
        email: string
    }
    bookedAt: string
}

/**
 * Generate E-Ticket File to Download
 */
export function downloadETicket(booking: ConfirmationData) {
    const { flight, passenger, bookingId } = booking
    const airline = flight.segments[0].marketingCarrier

    // Create a rich text representation
    const ticketContent = `
SKYFLOW PRO - ELECTRONIC TICKET
============================================================
BOOKING REFERENCE: ${bookingId}
ISSUED: ${new Date(booking.bookedAt).toLocaleString()}
============================================================

PASSENGER DETAILS
-----------------
Name: ${passenger.firstName} ${passenger.lastName}
Email: ${passenger.email}

FLIGHT INFORMATION
------------------
Airline: ${airline}
Flight: ${flight.segments[0].marketingCarrierCode} ${flight.segments[0].flightNumber}
Class: ${flight.cabin} (${flight.fareBrand})

From: ${flight.from}
To:   ${flight.to}

Departure: ${new Date(flight.segments[0].departureTime).toLocaleDateString()} ${new Date(flight.segments[0].departureTime).toLocaleTimeString()}
Duration:  ${Math.floor(flight.totalDurationMinutes / 60)}h ${flight.totalDurationMinutes % 60}m

BAGGAGE ALLOWANCE
-----------------
${flight.baggagePolicy}

PAYMENT SUMMARY
---------------
Total Paid: $${flight.price.total}
Status: CONFIRMED

============================================================
IMPORTANT NOTES
- Check-in opens 24 hours before departure.
- Please verify visa requirements for destination.
- Carry this e-ticket along with valid ID.
============================================================
    `.trim()

    // Create blob and force download
    const blob = new Blob([ticketContent], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `e-ticket_${bookingId}.txt`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Trigger Browser Share API
 */
export async function shareBooking(booking: ConfirmationData): Promise<boolean> {
    const text = `I'm flying to ${booking.flight.to} with SkyFlow Pro! Flight ${booking.flight.segments[0].flightNumber} on ${new Date(booking.flight.segments[0].departureTime).toLocaleDateString()}. Ref: ${booking.bookingId}`

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'My Flight Booking',
                text: text,
                url: window.location.href
            })
            return true
        } catch (err) {
            console.error('Share failed:', err)
            // Fallback to clipboard
            return copyToClipboard(text)
        }
    } else {
        return copyToClipboard(text)
    }
}

async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (err) {
        console.error('Clipboard failed:', err)
        return false
    }
}

/**
 * Print Itinerary
 */
export function printItinerary() {
    window.print()
}
