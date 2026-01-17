import { Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils'

interface CampaignCardProps {
  title: string
  content: string
  imageUrl?: string
  date: string
  status: 'ongoing' | 'past' | 'upcoming'
}

const statusConfig = {
  ongoing: { label: '进行中', color: 'text-green-600 bg-green-50' },
  past: { label: '已结束', color: 'text-gray-500 bg-gray-50' },
  upcoming: { label: '即将开始', color: 'text-blue-600 bg-blue-50' },
}

export function CampaignCard({ title, content, imageUrl, date, status }: CampaignCardProps) {
  const config = statusConfig[status]

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-40 object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              config.color
            )}
          >
            {config.label}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {date}
          </span>
        </div>
        <CardTitle className="text-base line-clamp-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{content}</p>
      </CardContent>
    </Card>
  )
}
