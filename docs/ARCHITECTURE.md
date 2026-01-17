# iMcd 架构文档

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Nginx (端口 80)                          │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   静态文件服务       │    │   反向代理 /api → :3000     │ │
│  │   (React SPA)       │    │                             │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Bun + Hono)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ 限流中间件 │→│ 认证中间件 │→│  路由层   │→│  服务层     │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │
│                                                  │           │
│                              ┌───────────────────┼─────────┐ │
│                              │     缓存层        │         │ │
│                              │  ┌────────┐  ┌────────┐     │ │
│                              │  │MCP客户端│  │活动缓存│     │ │
│                              │  │  缓存   │  │       │     │ │
│                              │  └────────┘  └────────┘     │ │
│                              └───────────────────┼─────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              麦当劳 MCP API (open.mcd.cn)                    │
└─────────────────────────────────────────────────────────────┘
```

## 后端架构

### 中间件层

#### 限流中间件 (`middleware/rateLimit.ts`)

- **策略**: IP 优先，回退到 Token Hash
- **配置**: 60 秒窗口，600 次请求
- **存储**: 内存 Map，最大 10000 条目
- **防护**: Token Hash 避免存储原始敏感数据

```typescript
// 限流键生成逻辑
function getRateLimitKey(c: Context): string {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() 
    || c.req.header('x-real-ip')
  if (ip) return `ip:${ip}`
  
  const token = c.req.header('authorization')?.replace('Bearer ', '')
  return token ? `token:${hashToken(token)}` : 'anonymous'
}
```

#### 认证中间件 (`middleware/auth.ts`)

- 验证 `Authorization: Bearer <token>` 头
- 无 token 返回 401

### 服务层

#### MCP 客户端 (`services/mcpClient.ts`)

- **连接池**: 基于 Token Hash 的客户端缓存
- **TTL**: 10 分钟自动断开
- **容量**: 最大 100 个客户端，LRU 淘汰

```typescript
// 缓存结构
interface CachedClient {
  client: McpClient
  lastUsed: number
  tokenHash: string
}
```

#### 活动缓存 (`services/mcpTools.ts`)

- **场景**: 活动数据是公共的，所有用户看到的相同
- **策略**: 按日期缓存，与用户无关
- **TTL**: 1 小时
- **容量**: 最大 100 天数据

这个设计将月视图的 ~30 次 API 调用降为首次访问后的 0 次。

### 路由层

| 路由 | 功能 |
|------|------|
| `GET /api/campaigns` | 活动日历 |
| `GET /api/coupons/available` | 可领优惠券 |
| `GET /api/coupons/mine` | 我的优惠券 |
| `POST /api/coupons/claim-all` | 一键领券 |
| `GET /api/time` | 时间信息 |

## 前端架构

### 状态管理 (Zustand)

```typescript
// authStore - Token 持久化
interface AuthState {
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
}

// couponStore - 优惠券状态
interface CouponState {
  availableCoupons: Coupon[]
  myCoupons: Coupon[]
  // ...
}
```

### 组件结构

```
components/
├── ui/           # 基础 UI 组件 (Button, Card, Tabs, Spinner)
├── layout/       # 布局组件 (Header, MobileNav, Layout)
├── auth/         # 认证组件 (TokenForm)
├── coupon/       # 优惠券组件 (CouponCard, CouponList)
└── campaign/     # 活动组件 (CampaignCard)
```

### MCP 响应解析 (`utils/mcpParser.ts`)

MCP API 返回 Markdown 格式文本，需要解析为结构化数据：

- `cleanMcpResponse()`: 清理 MCP 响应中的噪音文本
- `parseAvailableCoupons()`: 解析可领优惠券
- `parseMyCoupons()`: 解析我的优惠券
- `parseCampaigns()`: 解析活动信息

### 路由

| 路径 | 页面 |
|------|------|
| `/` | 首页 |
| `/coupons` | 优惠券页 |
| `/campaigns` | 活动日历 |
| `/settings` | 设置（Token 配置） |

## 安全设计

### Token 处理

1. **前端**: Token 存储在 localStorage，仅通过 HTTPS 传输
2. **后端**: 
   - 不存储原始 Token
   - 缓存键使用 Token Hash
   - 限流键使用 IP 或 Token Hash

### 限流防护

- 防止单 IP/用户暴力请求
- 内存存储有上限，防止 DoS 耗尽内存

### API 安全

- 非 JSON 响应检测（防止代理错误导致的解析崩溃）
- CORS 限制来源域名

## 性能优化

### 后端

1. **MCP 客户端复用**: 避免重复建立连接
2. **活动数据缓存**: 公共数据共享缓存
3. **定时清理**: 过期缓存自动清理，避免内存泄漏

### 前端

1. **代码分割**: Vite 自动分包
2. **静态资源缓存**: Nginx 配置 1 年缓存 + immutable
3. **Gzip 压缩**: Nginx 启用 gzip

### Nginx 优化

```nginx
# Gzip 压缩
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# 静态资源长缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Docker 部署

### 镜像构建

**Backend Dockerfile**:
- 基础镜像: `oven/bun:1.1-alpine`
- 多阶段构建: 构建阶段 + 运行阶段
- 运行用户: `bun` (非 root)

**Frontend Dockerfile**:
- 构建阶段: `node:20-alpine`
- 运行阶段: `nginx:alpine`
- 输出: 静态文件 + Nginx 配置

### 网络架构

```yaml
services:
  backend:
    networks: [imcd-network]
  frontend:
    networks: [imcd-network]
    depends_on:
      backend:
        condition: service_healthy
```

- 内部网络隔离
- 健康检查确保启动顺序
- 前端通过 `backend:3000` 访问后端
