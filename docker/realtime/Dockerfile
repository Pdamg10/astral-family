# ==============================================================================
# ASTRAL FAMILY - REALTIME WEBSOCKET SERVICE DOCKERFILE
# Lightweight Node.js 20 Alpine Image for Socket.io Microservice
# ==============================================================================

FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 realtime

COPY mini-services/realtime-service/package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY mini-services/realtime-service/ ./

USER realtime

ENV NODE_ENV=production
ENV PORT=3003

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3003/health || exit 1

EXPOSE 3003

CMD ["node", "index.mjs"]
