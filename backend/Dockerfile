FROM node:20-alpine AS base

FROM base AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json tsconfig.json ./
COPY src/ ./src/

RUN npm i
RUN npm run build
RUN npm prune --production

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist

USER hono
EXPOSE 3000

RUN npx prisma generate
CMD ["node", "/app/dist/index.cjs"]
