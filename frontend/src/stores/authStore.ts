import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  token: string | null
  isValidated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  setToken: (token: string) => void
  clearToken: () => void
  setValidated: (validated: boolean) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      token: null,
      isValidated: false,
      isLoading: false,
      error: null,

      setToken: (token) => set({ token, error: null }),
      clearToken: () => set({ token: null, isValidated: false }),
      setValidated: (isValidated) => set({ isValidated }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'imcd-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
)

export const useToken = () => useAuthStore((s) => s.token)
export const useIsValidated = () => useAuthStore((s) => s.isValidated)
export const useAuthLoading = () => useAuthStore((s) => s.isLoading)
export const useAuthError = () => useAuthStore((s) => s.error)
