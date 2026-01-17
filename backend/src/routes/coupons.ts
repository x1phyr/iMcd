import { Hono } from 'hono'
import { authMiddleware, getMcpToken } from '@/middleware'
import { getAvailableCoupons, autoBindCoupons, getMyCoupons } from '@/services'

const coupons = new Hono()

coupons.use('*', authMiddleware)

coupons.get('/available', async (c) => {
  const token = getMcpToken(c)
  const result = await getAvailableCoupons(token)
  
  return c.json({
    success: true,
    data: result,
  })
})

coupons.post('/claim', async (c) => {
  const token = getMcpToken(c)
  const result = await autoBindCoupons(token)
  
  return c.json({
    success: true,
    data: result,
  })
})

coupons.get('/mine', async (c) => {
  const token = getMcpToken(c)
  const result = await getMyCoupons(token)
  
  return c.json({
    success: true,
    data: result,
  })
})

export default coupons
