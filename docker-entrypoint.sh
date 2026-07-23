#!/bin/sh
# Swap the build-time NEXT_PUBLIC_* sentinels for the container's runtime env
# values, then launch the standalone Next.js server. This makes the browser-
# facing API/LiveKit URLs configurable per environment WITHOUT a rebuild.
set -e

API_BASE="${NEXT_PUBLIC_API_BASE:-http://localhost:8080/api/v1}"
LIVEKIT_URL="${NEXT_PUBLIC_LIVEKIT_URL:-ws://localhost:7880}"

echo "[entrypoint] NEXT_PUBLIC_API_BASE   = ${API_BASE}"
echo "[entrypoint] NEXT_PUBLIC_LIVEKIT_URL = ${LIVEKIT_URL}"

# Replace sentinels across the built server + client chunks. Only files that
# still contain a sentinel are touched (a no-op on an already-rewritten layer).
for target in /app/.next /app/server.js; do
  [ -e "$target" ] || continue
  find "$target" -type f 2>/dev/null | while IFS= read -r f; do
    if grep -qE '__RT_API_BASE__|__RT_LIVEKIT_URL__' "$f" 2>/dev/null; then
      sed -i "s|__RT_API_BASE__|${API_BASE}|g; s|__RT_LIVEKIT_URL__|${LIVEKIT_URL}|g" "$f"
    fi
  done
done

exec node server.js
