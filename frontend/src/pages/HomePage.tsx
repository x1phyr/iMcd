import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Calendar, Gift, ArrowRight, AlertCircle } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Spinner } from '@/components/ui'
import { useToken } from '@/stores'
import { getAvailableCoupons, getMyCoupons } from '@/services'

export function HomePage() {
  const token = useToken()
  const [stats, setStats] = useState({ available: 0, owned: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    const fetchStats = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [availableData, myData] = await Promise.all([
          getAvailableCoupons(),
          getMyCoupons(),
        ])

        const availableCount = (availableData.match(/状态：未领取/g) || []).length
        const ownedCount = (myData.match(/共 (\d+) 张/)?.[1]) || '0'

        setStats({
          available: availableCount,
          owned: parseInt(ownedCount, 10),
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [token])

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-mcd-yellow mb-4" />
        <h2 className="text-xl font-semibold mb-2">欢迎使用 iMcd</h2>
        <p className="text-muted-foreground mb-6 text-center">
          请先配置您的 MCP Token 以使用优惠券功能
        </p>
        <Link to="/settings">
          <Button variant="mcd">
            配置 Token
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">首页</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Gift className="h-4 w-4 text-green-500" />
                  可领券
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">{stats.available}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-mcd-yellow" />
                  我的优惠券
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-mcd-yellow">{stats.owned}</p>
              </CardContent>
            </Card>

            <Card className="col-span-2 md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  今日活动
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  to="/campaigns"
                  className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                >
                  查看活动日历
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/coupons?tab=available">
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-green-50">
                      <Gift className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">领取优惠券</h3>
                      <p className="text-sm text-muted-foreground">查看可领取的麦麦省优惠券</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/coupons?tab=mine">
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-mcd-yellow/20">
                      <Ticket className="h-6 w-6 text-mcd-yellow" />
                    </div>
                    <div>
                      <h3 className="font-semibold">我的优惠券</h3>
                      <p className="text-sm text-muted-foreground">查看已领取的优惠券</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
