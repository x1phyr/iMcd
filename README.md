# iMcd - 麦当劳优惠券管理工具

基于麦当劳中国 MCP (Model Context Protocol) 的优惠券管理 Web 应用。

## 功能特性

- **优惠券管理**: 查看可领取的优惠券，一键领取所有优惠券
- **我的优惠券**: 查看已领取的优惠券及有效期
- **活动日历**: 按月浏览麦当劳促销活动
- **调试模式**: 查看原始 API 响应，方便排查问题

## 快速开始

### 前置条件

- Docker & Docker Compose
- 麦当劳 MCP Token（从 https://open.mcd.cn/mcp/login 获取）

### 部署方式一：使用预构建镜像（推荐）

**本地构建镜像（Mac ARM → Linux x86 服务器）：**

```bash
cd iMcd

# 构建 amd64 架构镜像
docker build --platform linux/amd64 -t imcd-backend:latest ./backend
docker build --platform linux/amd64 -t imcd-frontend:latest --build-arg VITE_API_URL=/api ./frontend

# 导出镜像
docker save imcd-backend:latest imcd-frontend:latest -o imcd-images.tar

# 上传到服务器
scp imcd-images.tar docker-compose.yml user@server:/path/to/
```

**服务器上运行：**

```bash
# 加载镜像
docker load -i imcd-images.tar

# 启动服务
docker compose up -d

# 查看状态
docker compose ps
```

### 部署方式二：服务器上构建

```bash
git clone <repo-url> iMcd
cd iMcd
docker compose -f docker-compose.dev.yml up -d --build
```

### 访问应用

打开浏览器访问 `http://服务器IP`，在设置页面配置你的 MCP Token 即可使用。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Bun + Hono + TypeScript |
| 前端 | React 18 + Vite + TailwindCSS + Zustand |
| 部署 | Docker + Nginx |

## 项目结构

```
iMcd/
├── backend/                # 后端服务
│   ├── src/
│   │   ├── index.ts        # 应用入口
│   │   ├── config/         # 配置管理
│   │   ├── middleware/     # 中间件（认证、限流、错误处理）
│   │   ├── routes/         # API 路由
│   │   ├── services/       # MCP 客户端、缓存
│   │   └── types/          # 类型定义
│   └── Dockerfile
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # UI 组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   ├── stores/         # 状态管理
│   │   └── utils/          # 工具函数
│   ├── nginx.conf          # Nginx 配置
│   └── Dockerfile
├── docker-compose.yml      # 生产环境配置
├── docker-compose.dev.yml  # 开发环境配置
└── docs/                   # 项目文档
```

## API 文档

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/campaigns` | GET | 获取活动日历（可选参数 `?date=YYYY-MM-DD`） |
| `/api/coupons/available` | GET | 获取可领取的优惠券 |
| `/api/coupons/mine` | GET | 获取我的优惠券 |
| `/api/coupons/claim-all` | POST | 一键领取所有优惠券 |
| `/api/time` | GET | 获取当前时间信息 |

所有 API（除 health）需要在 Header 中携带 `Authorization: Bearer <MCP_TOKEN>`。

## 本地开发

### 后端

```bash
cd backend
bun install
bun run dev
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

## 环境变量

参考 `.env.example`：

```bash
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=600
```

## 常用命令

```bash
# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 更新部署
docker compose down
docker load -i imcd-images.tar
docker compose up -d
```

## License

MIT
