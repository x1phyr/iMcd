import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Gift, RefreshCw, Check, Bug } from 'lucide-react'
import { Button, Tabs, TabsList, TabsTrigger, TabsContent, Spinner, Card, CardContent } from '@/components/ui'
import { CouponList } from '@/components/coupon'
import { useToken } from '@/stores'
import { getAvailableCoupons, getMyCoupons, claimAllCoupons } from '@/services'
import { parseAvailableCoupons, parseMyCoupons, type ParsedCoupon } from '@/utils/mcpParser'

export function CouponsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = useToken()
  const initialTab = searchParams.get('tab') || 'available'

  const [activeTab, setActiveTab] = useState(initialTab)
  const [availableCoupons, setAvailableCoupons] = useState<ParsedCoupon[]>([])
  const [myCoupons, setMyCoupons] = useState<ParsedCoupon[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [rawResponse, setRawResponse] = useState('')

  const fetchData = async () => {
    if (!token) {
      navigate('/settings')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (activeTab === 'available') {
        const data = await getAvailableCoupons()
        setRawResponse(data)
        setAvailableCoupons(parseAvailableCoupons(data))
      } else {
        const data = await getMyCoupons()
        setRawResponse(data)
        setMyCoupons(parseMyCoupons(data))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab, token])

  const handleClaimAll = async () => {
    if (!token) return

    setIsClaiming(true)
    setClaimSuccess(false)

    try {
      await claimAllCoupons()
      setClaimSuccess(true)
      setTimeout(() => setClaimSuccess(false), 3000)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : '领券失败')
    } finally {
      setIsClaiming(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">优惠券</h1>
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
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          {activeTab === 'available' && (
            <Button
              variant="mcd"
              size="sm"
              onClick={handleClaimAll}
              disabled={isClaiming || availableCoupons.filter(c => c.status === 'available').length === 0}
            >
              {isClaiming ? (
                <Spinner size="sm" className="text-mcd-black" />
              ) : claimSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  领取成功
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4" />
                  一键领券
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {showDebug && rawResponse && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="pt-4">
            <p className="text-xs font-mono text-orange-800 mb-2">Raw API Response:</p>
            <pre className="text-xs overflow-auto max-h-48 p-2 bg-white rounded border whitespace-pre-wrap">
              {rawResponse}
            </pre>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full">
          <TabsTrigger value="available" className="flex-1">
            可领取
            {availableCoupons.filter(c => c.status === 'available').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-green-500 text-white">
                {availableCoupons.filter(c => c.status === 'available').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="mine" className="flex-1">
            我的优惠券
            {myCoupons.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-mcd-yellow text-mcd-black">
                {myCoupons.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <CouponList
            coupons={availableCoupons}
            isLoading={isLoading}
            emptyMessage="暂无可领取的优惠券"
          />
        </TabsContent>

        <TabsContent value="mine">
          <CouponList
            coupons={myCoupons}
            isLoading={isLoading}
            emptyMessage="您还没有优惠券"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
