import { useAuthStore } from '@/stores'
import type { ApiResponse } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token

  const url = `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (response.status === 401) {
    useAuthStore.getState().clearToken()
    throw new ApiError(401, 'Token 无效或已过期，请重新配置')
  }

  const contentType = response.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    throw new ApiError(
      response.status,
      `服务器返回了非JSON响应 (${response.status})`,
      { contentType }
    )
  }

  let json: ApiResponse<T>
  try {
    json = await response.json()
  } catch {
    throw new ApiError(response.status, '服务器响应解析失败')
  }

  if (!response.ok || !json.success) {
    throw new ApiError(
      response.status,
      json.error?.message || '请求失败',
      json.error?.details
    )
  }

  return json.data as T
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
}

export { ApiError }
