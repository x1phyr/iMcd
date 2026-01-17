import { Link, useLocation } from 'react-router-dom'
import { Home, Ticket, Calendar, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/coupons', label: '优惠券', icon: Ticket },
  { path: '/campaigns', label: '活动', icon: Calendar },
  { path: '/settings', label: '设置', icon: Settings },
]

export function MobileNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 text-xs transition-colors',
                isActive ? 'text-mcd-yellow' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
