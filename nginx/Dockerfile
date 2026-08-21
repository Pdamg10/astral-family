# ==============================================================================
# ASTRAL FAMILY - NGINX REVERSE PROXY DOCKERFILE
# ==============================================================================

FROM nginx:1.27-alpine

RUN apk add --no-cache wget

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d/ /etc/nginx/conf.d/

HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
