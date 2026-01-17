import { Link, useLocation } from 'react-router-dom'
import { Home, Ticket, Calendar, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore, useToken } from '@/stores'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/coupons', label: '优惠券', icon: Ticket },
  { path: '/campaigns', label: '活动日历', icon: Calendar },
  { path: '/settings', label: '设置', icon: Settings },
]

export function Header() {
  const location = useLocation()
  const token = useToken()
  const clearToken = useAuthStore((s) => s.clearToken)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mcd-yellow">
            <span className="text-lg font-bold text-mcd-black">M</span>
          </div>
          <span className="text-lg font-bold text-mcd-black">iMcd</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-mcd-yellow',
                  isActive ? 'text-mcd-yellow' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {token && (
          <button
            onClick={clearToken}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">退出</span>
          </button>
        )}
      </div>
    </header>
  )
}
