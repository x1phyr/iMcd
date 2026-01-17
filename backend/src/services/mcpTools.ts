import { getMcpClient } from './mcpClient'

// Campaign data is public (same for all users), so we cache by date only
const campaignCache = new Map<string, { data: string; timestamp: number }>()
const CAMPAIGN_CACHE_TTL_MS = 60 * 60 * 1000
const MAX_CAMPAIGN_CACHE_SIZE = 100

function cleanupCampaignCache(): void {
  const now = Date.now()
  for (const [key, entry] of campaignCache.entries()) {
    if (now - entry.timestamp > CAMPAIGN_CACHE_TTL_MS) {
      campaignCache.delete(key)
    }
  }
}

setInterval(cleanupCampaignCache, 10 * 60 * 1000)

export async function getCampaignCalendar(token: string, specifiedDate?: string): Promise<string> {
  const cacheKey = specifiedDate || 'today'
  
  const cached = campaignCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CAMPAIGN_CACHE_TTL_MS) {
    return cached.data
  }
  
  const client = getMcpClient(token)
  const args = specifiedDate ? { specifiedDate } : {}
  const result = await client.callTool<string>('campaign-calender', args)
  
  if (campaignCache.size >= MAX_CAMPAIGN_CACHE_SIZE) {
    let oldestKey: string | null = null
    let oldestTime = Infinity
    for (const [key, entry] of campaignCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }
    if (oldestKey) {
      campaignCache.delete(oldestKey)
    }
  }
  
  campaignCache.set(cacheKey, { data: result, timestamp: Date.now() })
  
  return result
}

export async function getAvailableCoupons(token: string): Promise<string> {
  const client = getMcpClient(token)
  return client.callTool<string>('available-coupons', {})
}

export async function autoBindCoupons(token: string): Promise<string> {
  const client = getMcpClient(token)
  return client.callTool<string>('auto-bind-coupons', {})
}

export async function getMyCoupons(token: string): Promise<string> {
  const client = getMcpClient(token)
  return client.callTool<string>('my-coupons', {})
}

export async function getTimeInfo(token: string): Promise<string> {
  const client = getMcpClient(token)
  return client.callTool<string>('now-time-info', {})
}
