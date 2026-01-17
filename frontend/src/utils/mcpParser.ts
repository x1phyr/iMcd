const MCP_NOISE_PATTERNS = [
  /如果当前的\s*Client\s*支持\s*Markdown\s*渲染.*?[:：]?/gi,
  /请你把下面响应的内容以\s*Markdown\s*格式返回给用户/gi,
  /以\s*Markdown\s*格式返回/gi,
  /如果.*?支持.*?渲染.*?请/gi,
  /#{1,4}\s*当前时间[：:][^\n]*/gi,
  /#{1,4}\s*活动列表[：:]?\s*/gi,
]

export function cleanMcpResponse(raw: string): string {
  let cleaned = raw
  for (const pattern of MCP_NOISE_PATTERNS) {
    cleaned = cleaned.replace(pattern, '')
  }
  return cleaned.trim()
}

export interface ParsedCoupon {
  title: string
  imageUrl?: string
  status: 'available' | 'claimed' | 'unavailable'
  tags?: string[]
  validTo?: string
}

export interface ParsedCampaign {
  title: string
  content: string
  imageUrl?: string
  date: string
  status: 'ongoing' | 'past' | 'upcoming'
}

const COUPON_HEADER_PATTERNS = [
  /麦麦省优惠券列表/i,
  /麦麦省优惠券/i,
  /我的优惠券/i,
  /优惠券列表/i,
  /coupon\s*list/i,
  /my\s*coupons/i,
]

function extractCouponSections(cleaned: string): string[] {
  const splitPatterns = [
    /- 优惠券标题：/g,
    /\*\*优惠券标题\*\*[：:]/g,
    /## /g,
    /### /g,
    /- /gm,
  ]
  
  for (const pattern of splitPatterns) {
    const sections = cleaned.split(pattern).filter(Boolean)
    if (sections.length > 1) return sections
  }
  
  return cleaned.trim() ? cleaned.split(/\n{2,}/).filter(Boolean) : []
}

function extractTitle(section: string): string {
  const patterns = [
    /^([^\n\\*]+)/,
    /标题[：:]\s*([^\n]+)/,
    /名称[：:]\s*([^\n]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = section.match(pattern)
    if (match && match[1].trim().length > 2) {
      return match[1].trim()
    }
  }
  return ''
}

function isHeaderTitle(title: string): boolean {
  return COUPON_HEADER_PATTERNS.some(p => p.test(title))
}

function extractCouponStatus(section: string): ParsedCoupon['status'] {
  const statusMatch = section.match(/状态[：:]\s*([^\n]+)/i)
  if (!statusMatch) return 'available'
  
  const statusText = statusMatch[1].toLowerCase()
  if (statusText.includes('已领取') || statusText.includes('已绑定')) return 'claimed'
  if (statusText.includes('不可') || statusText.includes('已过期') || statusText.includes('unavailable')) return 'unavailable'
  return 'available'
}

function extractImageUrl(section: string): string | undefined {
  const match = section.match(/(?:src="|!\[.*?\]\()([^")\s]+)/)
  return match?.[1]
}

export function parseAvailableCoupons(raw: string): ParsedCoupon[] {
  const cleaned = cleanMcpResponse(raw)
  const sections = extractCouponSections(cleaned)
  const coupons: ParsedCoupon[] = []

  for (const section of sections) {
    const title = extractTitle(section)
    if (!title || isHeaderTitle(title)) continue

    coupons.push({
      title,
      imageUrl: extractImageUrl(section),
      status: extractCouponStatus(section),
    })
  }

  return coupons
}

export function parseMyCoupons(raw: string): ParsedCoupon[] {
  const cleaned = cleanMcpResponse(raw)
  const sections = extractCouponSections(cleaned)
  const coupons: ParsedCoupon[] = []

  for (const section of sections) {
    const title = extractTitle(section)
    if (!title || isHeaderTitle(title)) continue

    const validMatch = section.match(/有效期[：:]\s*([^\n]+)/i)
    const tagsMatch = section.match(/标签[：:]\s*([^\n]+)/i)

    coupons.push({
      title,
      imageUrl: extractImageUrl(section),
      status: 'claimed',
      validTo: validMatch?.[1]?.split(/[-~至]/)?.[1]?.trim(),
      tags: tagsMatch?.[1]?.split(/[、,，]/).map(t => t.trim()).filter(Boolean),
    })
  }

  return coupons
}

const CAMPAIGN_SKIP_PATTERNS = [
  /^如果当前的\s*Client/i,
  /^Markdown\s*渲染/i,
  /^格式返回给用户/i,
  /^当前时间[：:]/i,
  /^活动列表[：:]?\s*$/i,
  /^\s*$/,
]

const CAMPAIGN_INVALID_TITLE_PATTERNS = [
  /^当前时间/i,
  /^活动列表/i,
  /^\d+月\d+日\s*(往期回顾|今日|即将开始)?\s*$/,
  /^如果/,
  /Markdown/i,
]

function extractCampaignSections(cleaned: string): string[] {
  const splitPatterns = [/####/g, /### /g, /\*\*活动/g]
  
  for (const pattern of splitPatterns) {
    const sections = cleaned.split(pattern).filter(Boolean)
    if (sections.length > 1) return sections
  }
  
  return cleaned.trim() ? [cleaned] : []
}

function extractCampaignStatus(section: string): ParsedCampaign['status'] {
  const statusMatch = section.match(/(往期回顾|今日|即将开始|进行中|已结束)/i)
  if (!statusMatch) return 'ongoing'
  
  const statusText = statusMatch[1]
  if (statusText.includes('往期') || statusText.includes('已结束')) return 'past'
  if (statusText.includes('即将')) return 'upcoming'
  return 'ongoing'
}

export function parseCampaigns(raw: string, dateStr?: string): ParsedCampaign[] {
  const cleaned = cleanMcpResponse(raw)
  const sections = extractCampaignSections(cleaned)
  const campaigns: ParsedCampaign[] = []

  for (const section of sections) {
    if (CAMPAIGN_SKIP_PATTERNS.some(p => p.test(section))) continue

    const dateMatch = section.match(/(\d+月\d+日|\d{4}-\d{2}-\d{2}|\d{2}\/\d{2})/)
    const date = dateMatch?.[1] || dateStr || ''
    const status = extractCampaignStatus(section)

    const activityPatterns = [
      /\*\*活动标题\*\*[：:]\s*([^\n\\]+)[\s\S]*?\*\*活动内容介绍\*\*[：:]\s*([^\n]*(?:\n(?!\*\*)[^\n]*)*)/g,
      /标题[：:]\s*([^\n]+)[\s\S]*?(?:内容|介绍|描述)[：:]\s*([^\n]+)/g,
    ]

    let foundActivity = false
    for (const pattern of activityPatterns) {
      let match
      while ((match = pattern.exec(section)) !== null) {
        foundActivity = true
        const title = match[1].replace(/\\/g, '').trim()
        const content = match[2].replace(/\\/g, '').trim()

        if (title) {
          campaigns.push({
            title,
            content: content || '',
            imageUrl: extractImageUrl(section),
            date,
            status,
          })
        }
      }
    }

    if (!foundActivity && section.trim().length > 10) {
      const lines = section.split('\n').filter(l => l.trim())
      const title = lines[0]?.replace(/^[\s#*-]+/, '').trim()
      const content = lines.slice(1).join(' ').trim()

      const isInvalidTitle = CAMPAIGN_INVALID_TITLE_PATTERNS.some(p => p.test(title))

      if (title && title.length > 2 && title.length < 100 && !isInvalidTitle) {
        campaigns.push({
          title,
          content: content.slice(0, 200),
          date,
          status,
        })
      }
    }
  }

  return campaigns
}
