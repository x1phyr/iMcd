import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Key, ArrowRight, ExternalLink } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { useAuthStore } from '@/stores'

export function TokenForm() {
  const [inputToken, setInputToken] = useState('')
  const { setToken, setValidated, isLoading, error, setLoading, setError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedToken = inputToken.trim()

    if (!trimmedToken) {
      setError('请输入 MCP Token')
      return
    }

    setLoading(true)
    setError(null)

    try {
      setToken(trimmedToken)
      setValidated(true)
      navigate('/')
    } catch {
      setError('Token 验证失败，请检查后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mcd-yellow">
          <Key className="h-6 w-6 text-mcd-black" />
        </div>
        <CardTitle className="text-xl">配置 MCP Token</CardTitle>
        <CardDescription>
          请输入您的麦当劳 MCP Token 以使用优惠券功能
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="请输入您的 MCP Token"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              disabled={isLoading}
              className="h-11"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="mcd"
            className="w-full h-11"
            disabled={isLoading || !inputToken.trim()}
          >
            {isLoading ? '验证中...' : '开始使用'}
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="text-center space-y-2">
            <a
              href="https://open.mcd.cn/mcp/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-mcd-red hover:underline"
            >
              前往 MCP 官网获取 Token
              <ExternalLink className="h-3 w-3" />
            </a>
            <p className="text-xs text-muted-foreground">
              Token 仅保存在本地浏览器中，不会上传到任何服务器
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
