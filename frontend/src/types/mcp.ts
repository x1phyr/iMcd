export interface Campaign {
  title: string
  content: string
  imageUrl?: string
  date: string
  status: 'ongoing' | 'past' | 'upcoming'
}

export interface Coupon {
  couponId?: string
  couponCode?: string
  title: string
  imageUrl?: string
  status: 'available' | 'claimed' | 'unavailable'
  tags?: string[]
  validFrom?: string
  validTo?: string
  claimedAt?: string
}

export interface TimeInfo {
  timestamp: number
  datetime: string
  formatted: string
  date: string
  year: number
  month: number
  day: number
  dayOfWeek: string
  timezone: string
  offset: string
  utc: string
}
