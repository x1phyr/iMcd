import { TokenForm } from '@/components/auth'
import { useToken, useAuthStore } from '@/stores'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Check, ExternalLink, LogOut } from 'lucide-react'

export function SettingsPage() {
  const token = useToken()
  const clearToken = useAuthStore((s) => s.clearToken)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">设置</h1>

      {token ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              已登录
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              您的 MCP Token 已成功配置，可以正常使用优惠券功能。
            </p>
            <div className="p-3 bg-muted rounded-md">
              <code className="text-sm">
                {token.slice(0, 8)}...{token.slice(-8)}
              </code>
            </div>
            <Button
              variant="outline"
              onClick={clearToken}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TokenForm />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">如何获取 MCP Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>访问麦当劳 MCP 平台官网</li>
            <li>使用手机号登录</li>
            <li>在控制台页面复制您的 Token</li>
            <li>粘贴到上方输入框中</li>
          </ol>
          <a
            href="https://open.mcd.cn/mcp/auth"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-mcd-red hover:underline mt-2"
          >
            前往麦当劳 MCP 平台获取 Token
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
