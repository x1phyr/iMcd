import { Hono } from 'hono'
import { authMiddleware, getMcpToken } from '@/middleware'
import { getTimeInfo } from '@/services'

const time = new Hono()

time.use('*', authMiddleware)

time.get('/', async (c) => {
  const token = getMcpToken(c)
  const result = await getTimeInfo(token)
  
  return c.json({
    success: true,
    data: result,
  })
})

export default time
