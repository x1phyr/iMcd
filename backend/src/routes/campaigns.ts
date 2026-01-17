import { Hono } from 'hono'
import { authMiddleware, getMcpToken } from '@/middleware'
import { getCampaignCalendar } from '@/services'

const campaigns = new Hono()

campaigns.use('*', authMiddleware)

campaigns.get('/', async (c) => {
  const token = getMcpToken(c)
  const specifiedDate = c.req.query('date')
  
  const result = await getCampaignCalendar(token, specifiedDate)
  
  return c.json({
    success: true,
    data: result,
  })
})

export default campaigns
