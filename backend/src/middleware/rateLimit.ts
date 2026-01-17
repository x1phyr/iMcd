import type { Context, Next } from 'hono'
import { config } from '@/config'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()
const MAX_STORE_SIZE = 10000

function hashToken(token: string): string {
  let hash = 0
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `tok:${hash.toString(16)}`
}

function getRateLimitKey(c: Context): string {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() 
    || c.req.header('x-real-ip')
  
  if (ip) {
    return `ip:${ip}`
  }
  
  const auth = c.req.header('Authorization')
  if (auth?.startsWith('Bearer ')) {
    return hashToken(auth.slice(7))
  }
  
  return 'anonymous'
}

export async function rateLimitMiddleware(c: Context, next: Next): Promise<Response | void> {
  const key = getRateLimitKey(c)
  const now = Date.now()
  
  let entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    if (rateLimitStore.size >= MAX_STORE_SIZE) {
      const oldestKey = rateLimitStore.keys().next().value
      if (oldestKey) rateLimitStore.delete(oldestKey)
    }
    
    entry = {
      count: 0,
      resetTime: now + config.rateLimitWindowMs,
    }
    rateLimitStore.set(key, entry)
  }
  
  entry.count++
  
  const remaining = Math.max(0, config.rateLimitMaxRequests - entry.count)
  const resetSeconds = Math.ceil((entry.resetTime - now) / 1000)
  
  c.header('X-RateLimit-Limit', String(config.rateLimitMaxRequests))
  c.header('X-RateLimit-Remaining', String(remaining))
  c.header('X-RateLimit-Reset', String(resetSeconds))
  
  if (entry.count > config.rateLimitMaxRequests) {
    return c.json(
      {
        success: false,
        error: {
          message: 'Too many requests. Please try again later.',
          retryAfter: resetSeconds,
        },
      },
      429
    )
  }
  
  await next()
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000)
