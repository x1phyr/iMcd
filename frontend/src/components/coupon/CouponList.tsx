import { CouponCard } from './CouponCard'
import { Spinner } from '@/components/ui'

interface Coupon {
  title: string
  imageUrl?: string
  status: 'available' | 'claimed' | 'unavailable'
  tags?: string[]
  validTo?: string
}

interface CouponListProps {
  coupons: Coupon[]
  isLoading?: boolean
  emptyMessage?: string
}

export function CouponList({ coupons, isLoading, emptyMessage = '暂无优惠券' }: CouponListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {coupons.map((coupon, index) => (
        <CouponCard
          key={index}
          title={coupon.title}
          imageUrl={coupon.imageUrl}
          status={coupon.status}
          tags={coupon.tags}
          validTo={coupon.validTo}
        />
      ))}
    </div>
  )
}
