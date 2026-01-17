import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Calendar, ChevronLeft, ChevronRight, Bug } from 'lucide-react'
import { Button, Spinner, Card, CardContent } from '@/components/ui'
import { CampaignCard } from '@/components/campaign'
import { useToken } from '@/stores'
import { getCampaigns } from '@/services'
import { parseCampaigns, type ParsedCampaign } from '@/utils/mcpParser'

export function CampaignsPage() {
  const navigate = useNavigate()
  const token = useToken()

  const [campaigns, setCampaigns] = useState<ParsedCampaign[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  })
  const [showDebug, setShowDebug] = useState(false)
  const [rawResponses, setRawResponses] = useState<string[]>([])

  const fetchMonthData = async () => {
    if (!token) {
      navigate('/settings')
      return
    }

    setIsLoading(true)
    setError(null)
    setCampaigns([])
    setRawResponses([])

    try {
      const { year, month } = currentMonth
      const daysInMonth = new Date(year, month, 0).getDate()
      const allCampaigns: ParsedCampaign[] = []
      const responses: string[] = []

      const batchSize = 5
      for (let start = 1; start <= daysInMonth; start += batchSize) {
        const end = Math.min(start + batchSize - 1, daysInMonth)
        const promises: Promise<{ data: string; date: string }>[] = []

        for (let day = start; day <= end; day++) {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          promises.push(
            getCampaigns(dateStr)
              .then(data => ({ data, date: dateStr }))
              .catch(() => ({ data: '', date: dateStr }))
          )
        }

        const results = await Promise.all(promises)
        
        for (const { data, date } of results) {
          if (data) {
            responses.push(`[${date}]\n${data}`)
            const parsed = parseCampaigns(data, date)
            for (const campaign of parsed) {
              if (!campaign.date) campaign.date = date
              allCampaigns.push(campaign)
            }
          }
        }
      }

      const uniqueCampaigns = allCampaigns.filter((campaign, index, self) =>
        index === self.findIndex(c => c.title === campaign.title && c.date === campaign.date)
      )

      uniqueCampaigns.sort((a, b) => {
        const dateA = a.date.replace(/[月日]/g, m => m === '月' ? '-' : '')
        const dateB = b.date.replace(/[月日]/g, m => m === '月' ? '-' : '')
        return dateA.localeCompare(dateB)
      })

      setCampaigns(uniqueCampaigns)
      setRawResponses(responses)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMonthData()
  }, [token, currentMonth])

  const changeMonth = (delta: number) => {
    setCurrentMonth(prev => {
      let newMonth = prev.month + delta
      let newYear = prev.year
      
      if (newMonth > 12) {
        newMonth = 1
        newYear++
      } else if (newMonth < 1) {
        newMonth = 12
        newYear--
      }
      
      return { year: newYear, month: newMonth }
    })
  }

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">活动日历</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            title="调试模式"
          >
            <Bug className={`h-4 w-4 ${showDebug ? 'text-orange-500' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMonthData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => changeMonth(-1)}
          disabled={isLoading}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 min-w-[140px] justify-center">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {currentMonth.year}年 {monthNames[currentMonth.month - 1]}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => changeMonth(1)}
          disabled={isLoading}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {showDebug && rawResponses.length > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="pt-4">
            <p className="text-xs font-mono text-orange-800 mb-2">Raw API Responses ({rawResponses.length} days):</p>
            <pre className="text-xs overflow-auto max-h-64 p-2 bg-white rounded border whitespace-pre-wrap">
              {rawResponses.join('\n\n---\n\n')}
            </pre>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">正在加载整月活动数据...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          本月暂无活动信息
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground text-center">
            共 {campaigns.length} 个活动
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign, index) => (
              <CampaignCard
                key={`${campaign.title}-${campaign.date}-${index}`}
                title={campaign.title}
                content={campaign.content}
                imageUrl={campaign.imageUrl}
                date={campaign.date}
                status={campaign.status}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
