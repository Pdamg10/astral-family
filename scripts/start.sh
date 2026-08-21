#!/bin/bash
set -e

# ==============================================================================
# ASTRAL FAMILY - START SCRIPT
# Inicia toda la infraestructura self-hosted (PostgreSQL, Web, WebSocket, Nginx, Backups)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

echo "======================================================"
echo "🚀 INICIANDO ASTRAL FAMILY (INFRAESTRUCTURA SELF-HOSTED)"
echo "======================================================"

if [ ! -f .env ]; then
  echo "⚠️ Archivo .env no encontrado. Creando a partir de .env.example..."
  cp .env.example .env
  echo "👉 Por favor revisa y edita tus contraseñas en .env si es necesario."
fi

# Load variables
export $(grep -v '^#' .env | xargs -d '\n' 2>/dev/null) || true

# Determine if Cloudflare Tunnel should be started
if [ -n "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
  echo "🌐 Token de Cloudflare Tunnel detectado. Habilitando perfil tunnel..."
  docker compose --profile tunnel up -d --build
else
  echo "🏠 Iniciando servicios en red local (sin Cloudflare Tunnel)..."
  docker compose up -d --build
fi

echo ""
echo "⏳ Verificando estado inicial de los contenedores..."
sleep 3
docker compose ps

HTTP_PORT="${HTTP_PORT:-8080}"
echo ""
echo "======================================================"
echo "✅ ASTRAL FAMILY ESTÁ CORRIENDO CORRECTAMENTE"
echo "======================================================"
echo "🌐 Acceso Local:      http://localhost:${HTTP_PORT}"
echo "🏥 Healthcheck:       http://localhost:${HTTP_PORT}/health"
echo "📦 Backups Automáticos: ./backups/"
echo "======================================================"
