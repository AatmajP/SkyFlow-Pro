export interface SkyNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  read: boolean
}

export const MOCK_NOTIFICATIONS: SkyNotification[] = [
  {
    id: '1',
    title: 'Price Dropped!',
    message: 'Fare dropped by ₹1,200 for your searched route BLR → BOM. Book now to save!',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    read: false
  },
  {
    id: '2',
    title: 'Only 3 seats left',
    message: 'Flight AI-804 from DEL to BOM is filling up fast. Secure your seat today.',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false
  },
  {
    id: '3',
    title: 'Booking Confirmed',
    message: 'Your booking for New Delhi to Mumbai (SKY-9928) is successfully confirmed.',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true
  },
  {
    id: '4',
    title: 'Gate Reminder',
    message: 'Your flight AI-102 departs from Gate 4B in 45 minutes.',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    read: true
  }
]
