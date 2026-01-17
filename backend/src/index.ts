import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { config } from '@/config'
import { errorHandler, notFoundHandler, rateLimitMiddleware } from '@/middleware'
import { campaignsRoutes, couponsRoutes, timeRoutes } from '@/routes'

const app = new Hono().basePath('/api')

app.onError(errorHandler)
app.notFound(notFoundHandler)

app.use('*', logger())
app.use('*', cors({
  origin: config.isProduction 
    ? [config.frontendUrl] 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 600,
}))

app.use('*', rateLimitMiddleware)

app.get('/health', (c) => {
  return c.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  })
})

app.route('/campaigns', campaignsRoutes)
app.route('/coupons', couponsRoutes)
app.route('/time', timeRoutes)

console.log(`Server starting on port ${config.port}...`)
console.log(`Environment: ${config.nodeEnv}`)
console.log(`Frontend URL: ${config.frontendUrl}`)

export default {
  port: config.port,
  fetch: app.fetch,
}
