# InsurOS admin — Fly.io image (Next.js 16 standalone, pnpm workspace monorepo)
FROM node:22-alpine AS base
# pnpm version matches package.json "packageManager" (CI uses the same).
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# ---- install deps + build ----
FROM base AS build
# Copy workspace manifests first for cached, deterministic installs.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/admin/package.json apps/admin/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/services/package.json packages/services/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/mocks/package.json packages/mocks/package.json
RUN pnpm install --frozen-lockfile

COPY . .

# NEXT_PUBLIC_* must exist at BUILD time (baked into the client AND server bundles).
# The Supabase URL + anon key are public by design; pass them as build args:
#   fly deploy --build-arg NEXT_PUBLIC_SUPABASE_URL=... --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# (the deploy workflow does this from GitHub secrets of the same names).
# Built without them, the production server FAILS CLOSED: /dashboard answers 503
# and /api/health reports 503, so Fly will not promote the release.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @insuros/admin build

# ---- runtime ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
# Monorepo standalone output already contains the traced node_modules + server.
COPY --from=build /app/apps/admin/.next/standalone ./
COPY --from=build /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=build /app/apps/admin/public ./apps/admin/public
EXPOSE 8080
CMD ["node", "apps/admin/server.js"]
