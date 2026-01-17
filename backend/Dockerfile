FROM oven/bun:1.1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

FROM oven/bun:1.1-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules
COPY package.json tsconfig.json ./

EXPOSE 3000

USER bun

CMD ["bun", "run", "src/index.ts"]
