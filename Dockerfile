# syntax=docker/dockerfile:1
#
# Bangladesh Betar — public portal (Next.js 16) production image.
#
# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, which
# normally means the API/LiveKit URLs are frozen into the image. To keep this
# image portable across environments, we bake harmless SENTINELS at build time
# and swap them for the real values from the container's environment at start
# (see docker-entrypoint.sh). Change the API host by editing the env and
# restarting — no rebuild required.

############################  deps  ############################
FROM node:22-alpine AS deps
WORKDIR /app
# Only the manifests → better layer caching for dependency installs.
# `npm install` (not `npm ci`) tolerates the checked-in lockfile drift while
# still resolving platform-correct native deps (SWC musl) inside the image.
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

##########################  builder  ##########################
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time placeholders. The entrypoint replaces these with the runtime
# NEXT_PUBLIC_* env values before the server starts.
ENV NEXT_PUBLIC_API_BASE=__RT_API_BASE__ \
    NEXT_PUBLIC_LIVEKIT_URL=__RT_LIVEKIT_URL__ \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

##########################  runner  ##########################
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=15001 \
    HOSTNAME=0.0.0.0

# Run as an unprivileged user.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Standalone server + its static assets + public files. Chown so the entrypoint
# (running as nextjs) can rewrite the baked sentinels in place.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 15001

# Basic liveness check against the running server.
HEALTHCHECK --interval=30s --timeout=4s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+ (process.env.PORT||15001)).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
