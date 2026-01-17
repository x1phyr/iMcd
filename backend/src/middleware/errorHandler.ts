import type { ErrorHandler, NotFoundHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { config } from '@/config'

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[Error] ${err.message}`, config.isProduction ? '' : err.stack)

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: {
          message: err.message,
          status: err.status,
        },
      },
      err.status
    )
  }

  const isMcpError = err.message?.includes('MCP') || 
                     err.message?.includes('transport') ||
                     err.message?.includes('mcp.mcd.cn')

  if (isMcpError) {
    return c.json(
      {
        success: false,
        error: {
          message: 'Failed to connect to McDonald\'s MCP server',
          details: config.isProduction ? undefined : err.message,
        },
      },
      502
    )
  }

  return c.json(
    {
      success: false,
      error: {
        message: config.isProduction ? 'Internal server error' : err.message,
        stack: config.isProduction ? undefined : err.stack,
      },
    },
    500
  )
}

export const notFoundHandler: NotFoundHandler = (c) => {
  return c.json(
    {
      success: false,
      error: {
        message: `Not Found - [${c.req.method}] ${c.req.path}`,
      },
    },
    404
  )
}
