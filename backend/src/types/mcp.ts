export interface Campaign {
  title: string
  content: string
  imageUrl?: string
  date: string
  status: 'ongoing' | 'past' | 'upcoming'
}

export interface CampaignCalendarResponse {
  currentTime: string
  campaigns: Campaign[]
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

export interface AvailableCouponsResponse {
  coupons: Coupon[]
}

export interface ClaimCouponsResult {
  total: number
  success: number
  failed: number
  claimedCoupons: Coupon[]
  failedCoupons?: Coupon[]
}

export interface MyCouponsResponse {
  coupons: Coupon[]
  total: number
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

export interface McpToolResult<T = unknown> {
  success: boolean
  code: number
  message: string
  data?: T
  traceId?: string
}
