import { Ticket, Check, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'

interface CouponCardProps {
  title: string
  imageUrl?: string
  status: 'available' | 'claimed' | 'unavailable'
  tags?: string[]
  validTo?: string
}

const statusConfig = {
  available: { label: '可领取', color: 'bg-green-500', icon: Check },
  claimed: { label: '已领取', color: 'bg-mcd-yellow', icon: Check },
  unavailable: { label: '不可领取', color: 'bg-gray-400', icon: X },
}

export function CouponCard({ title, imageUrl, status, tags, validTo }: CouponCardProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-32 object-cover"
            onError={(e) => {
              e.currentTarget.src = '/mcd-logo.svg'
              e.currentTarget.className = 'w-full h-32 object-contain p-8 bg-mcd-yellow/10'
            }}
          />
        ) : (
          <div className="w-full h-32 bg-mcd-yellow/10 flex items-center justify-center">
            <Ticket className="h-12 w-12 text-mcd-yellow" />
          </div>
        )}
        <span
          className={cn(
            'absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white',
            config.color
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </span>
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm line-clamp-2">{title}</h3>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 text-xs bg-gray-100 rounded text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {validTo && (
          <p className="text-xs text-muted-foreground mt-2">
            有效期至: {validTo}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
