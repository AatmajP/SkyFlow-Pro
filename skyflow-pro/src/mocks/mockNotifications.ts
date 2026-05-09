export interface SkyNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'booking' | 'fare' | 'checkin' | 'gate'
  timestamp: string
  read: boolean
}

export const MOCK_NOTIFICATIONS: SkyNotification[] = [
  {
    id: '1',
    title: 'Fare Alert: Price Drop',
    message: 'Fare dropped by ₹1,200 for your route BLR → BOM. Book now to save!',
    type: 'success',
    category: 'fare',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false
  },
  {
    id: '2',
    title: 'Urgent: Seat Availability',
    message: 'Only 3 seats left for flight AI-804 (DEL → BOM). Secure your seat now.',
    type: 'warning',
    category: 'booking',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false
  },
  {
    id: '3',
    title: 'Check-in Open',
    message: 'Web check-in is now open for your flight SKY-9928 to Mumbai.',
    type: 'info',
    category: 'checkin',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: false
  },
  {
    id: '4',
    title: 'Booking Confirmed',
    message: 'Booking reference #SKY-9928 has been successfully confirmed.',
    type: 'success',
    category: 'booking',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true
  },
  {
    id: '5',
    title: 'Gate Update',
    message: 'Your flight AI-102 will now depart from Gate 4B.',
    type: 'info',
    category: 'gate',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    read: true
  }
]
