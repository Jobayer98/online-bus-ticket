# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20

# ─── base ────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ─── repo source (pruned by turbo) ───────────────────────────────────────────
FROM base AS pruner
RUN pnpm add -g turbo@2.5.4
WORKDIR /app
COPY . .

FROM pruner AS pruner-api
RUN turbo prune @repo/api --docker

FROM pruner AS pruner-web
RUN turbo prune @repo/web --docker

# ─── install deps (cached layer) ─────────────────────────────────────────────
FROM base AS installer-api
WORKDIR /app
COPY --from=pruner-api /app/out/json/ .
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS installer-web
WORKDIR /app
COPY --from=pruner-web /app/out/json/ .
RUN pnpm install --frozen-lockfile --ignore-scripts

# ─── build: api ──────────────────────────────────────────────────────────────
FROM base AS builder-api
WORKDIR /app
COPY --from=installer-api /app/node_modules ./node_modules
COPY --from=installer-api /app .
COPY --from=pruner-api /app/out/full/ .
RUN pnpm --filter @repo/database generate
RUN pnpm --filter @repo/shared build
RUN pnpm --filter @repo/database build
RUN pnpm --filter @repo/api build

# ─── build: web ──────────────────────────────────────────────────────────────
FROM base AS builder-web
WORKDIR /app
COPY --from=installer-web /app/node_modules ./node_modules
COPY --from=installer-web /app .
COPY --from=pruner-web /app/out/full/ .
RUN pnpm --filter @repo/database generate
RUN pnpm --filter @repo/shared build
RUN pnpm --filter @repo/web build

# ─── migrate ────────────────────────────────────────────────────────────────
FROM base AS migrate
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder-api /app/node_modules ./node_modules
COPY --from=builder-api /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=builder-api /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder-api /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder-api /app/package.json ./package.json
WORKDIR /app/packages/database
CMD ["npx", "prisma", "migrate", "deploy"]

# ─── runtime: api ────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS api
ENV NODE_ENV=production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

COPY --from=builder-api --chown=appuser:appgroup /app/apps/api/dist ./apps/api/dist
COPY --from=builder-api --chown=appuser:appgroup /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder-api --chown=appuser:appgroup /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder-api --chown=appuser:appgroup /app/packages/database/dist ./packages/database/dist
COPY --from=builder-api --chown=appuser:appgroup /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder-api --chown=appuser:appgroup /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=builder-api --chown=appuser:appgroup /app/packages/database/generated ./packages/database/generated
COPY --from=builder-api --chown=appuser:appgroup /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder-api --chown=appuser:appgroup /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder-api --chown=appuser:appgroup /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder-api --chown=appuser:appgroup /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder-api --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder-api --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=builder-api --chown=appuser:appgroup /app/apps/api/openapi ./apps/api/openapi

RUN mkdir -p /app/apps/api/uploads && chown appuser:appgroup /app/apps/api/uploads

USER appuser
EXPOSE 4100
CMD ["node", "apps/api/dist/index.js"]

# ─── runtime: web ────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS web
ENV NODE_ENV=production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

COPY --from=builder-web --chown=appuser:appgroup /app/apps/web/.next/standalone ./
COPY --from=builder-web --chown=appuser:appgroup /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder-web --chown=appuser:appgroup /app/apps/web/public ./apps/web/public

USER appuser
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
