import type { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

export async function authMiddleware(c: Context, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader) {
    throw new HTTPException(401, { message: 'Authorization header is required' })
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Invalid authorization format. Use: Bearer <token>' })
  }

  const token = authHeader.slice(7).trim()
  
  if (!token) {
    throw new HTTPException(401, { message: 'MCP token is required' })
  }

  c.set('mcpToken', token)
  await next()
}

export function getMcpToken(c: Context): string {
  return c.get('mcpToken') as string
}
