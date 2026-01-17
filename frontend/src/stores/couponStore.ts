import { create } from 'zustand'
import type { Coupon } from '@/types'

interface CouponState {
  availableCoupons: Coupon[]
  myCoupons: Coupon[]
  isLoading: boolean
  error: string | null
  claimResult: {
    total: number
    success: number
    failed: number
  } | null
}

interface CouponActions {
  setAvailableCoupons: (coupons: Coupon[]) => void
  setMyCoupons: (coupons: Coupon[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setClaimResult: (result: CouponState['claimResult']) => void
  clearClaimResult: () => void
}

export const useCouponStore = create<CouponState & CouponActions>()((set) => ({
  availableCoupons: [],
  myCoupons: [],
  isLoading: false,
  error: null,
  claimResult: null,

  setAvailableCoupons: (coupons) => set({ availableCoupons: coupons }),
  setMyCoupons: (coupons) => set({ myCoupons: coupons }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setClaimResult: (claimResult) => set({ claimResult }),
  clearClaimResult: () => set({ claimResult: null }),
}))

export const useAvailableCoupons = () => useCouponStore((s) => s.availableCoupons)
export const useMyCoupons = () => useCouponStore((s) => s.myCoupons)
export const useCouponLoading = () => useCouponStore((s) => s.isLoading)
export const useCouponError = () => useCouponStore((s) => s.error)
export const useClaimResult = () => useCouponStore((s) => s.claimResult)
