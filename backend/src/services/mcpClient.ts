import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { config } from '@/config'

const CLIENT_TTL_MS = 10 * 60 * 1000
const MAX_CACHE_SIZE = 100

interface CachedClient {
  client: McpClient
  lastUsed: number
  tokenHash: string
}

function hashToken(token: string): string {
  let hash = 0
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

export class McpClient {
  private client: Client | null = null
  private transport: StreamableHTTPClientTransport | null = null
  private token: string

  constructor(token: string) {
    this.token = token
  }

  async connect(): Promise<void> {
    if (this.client) return

    this.transport = new StreamableHTTPClientTransport(
      new URL(config.mcpEndpoint),
      {
        requestInit: {
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        },
      }
    )

    this.client = new Client({
      name: 'iMcd-client',
      version: '1.0.0',
    })

    await this.client.connect(this.transport)
  }

  async callTool<T = unknown>(toolName: string, args: Record<string, unknown> = {}): Promise<T> {
    if (!this.client) {
      await this.connect()
    }

    const result = await this.client!.callTool({
      name: toolName,
      arguments: args,
    })

    const content = result.content
    if (Array.isArray(content) && content.length > 0) {
      const firstContent = content[0]
      if (firstContent.type === 'text' && typeof firstContent.text === 'string') {
        return firstContent.text as T
      }
    }

    return result as T
  }

  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.transport.close().catch(() => {})
      this.transport = null
      this.client = null
    }
  }
}

const clientCache = new Map<string, CachedClient>()

export function getMcpClient(token: string): McpClient {
  const tokenHash = hashToken(token)
  const cached = clientCache.get(tokenHash)
  
  if (cached) {
    cached.lastUsed = Date.now()
    return cached.client
  }
  
  if (clientCache.size >= MAX_CACHE_SIZE) {
    let oldestKey: string | null = null
    let oldestTime = Infinity
    
    for (const [key, entry] of clientCache.entries()) {
      if (entry.lastUsed < oldestTime) {
        oldestTime = entry.lastUsed
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      const old = clientCache.get(oldestKey)
      old?.client.disconnect()
      clientCache.delete(oldestKey)
    }
  }
  
  const client = new McpClient(token)
  clientCache.set(tokenHash, {
    client,
    lastUsed: Date.now(),
    tokenHash,
  })
  
  return client
}

export function clearMcpClient(token: string): void {
  const tokenHash = hashToken(token)
  const cached = clientCache.get(tokenHash)
  if (cached) {
    cached.client.disconnect()
    clientCache.delete(tokenHash)
  }
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of clientCache.entries()) {
    if (now - entry.lastUsed > CLIENT_TTL_MS) {
      entry.client.disconnect()
      clientCache.delete(key)
    }
  }
}, 60000)
