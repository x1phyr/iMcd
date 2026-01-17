export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: unknown
  }
}

export interface ApiError {
  message: string
  status: number
  code?: string
}
