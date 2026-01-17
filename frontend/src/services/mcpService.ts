import { api } from './api'

export async function getCampaigns(date?: string): Promise<string> {
  const endpoint = date ? `/campaigns?date=${date}` : '/campaigns'
  return api.get<string>(endpoint)
}

export async function getCampaignsForMonth(year: number, month: number): Promise<string[]> {
  const daysInMonth = new Date(year, month, 0).getDate()
  const promises: Promise<string>[] = []
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    promises.push(getCampaigns(dateStr).catch(() => ''))
  }
  
  return Promise.all(promises)
}

export async function getAvailableCoupons(): Promise<string> {
  return api.get<string>('/coupons/available')
}

export async function claimAllCoupons(): Promise<string> {
  return api.post<string>('/coupons/claim')
}

export async function getMyCoupons(): Promise<string> {
  return api.get<string>('/coupons/mine')
}

export async function getServerTime(): Promise<string> {
  return api.get<string>('/time')
}

export async function validateToken(): Promise<boolean> {
  try {
    await api.get('/health')
    return true
  } catch {
    return false
  }
}
