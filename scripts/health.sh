#!/bin/bash
set -e

# ==============================================================================
# ASTRAL FAMILY - SYSTEM HEALTHCHECK SCRIPT
# Monitorea el estado de contenedores, base de datos, proxies y endpoints
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs -d '\n' 2>/dev/null) || true
fi

HTTP_PORT="${HTTP_PORT:-8080}"

echo "======================================================"
echo "🏥 ASTRAL FAMILY // ESTADO DE SALUD DEL SISTEMA"
echo "======================================================"
echo "Hora Local: $(date)"
echo ""

echo "📦 1. Estado de Contenedores Docker:"
echo "------------------------------------------------------"
docker compose ps

echo ""
echo "🩺 2. Respuesta del Endpoint de Salud (/health):"
echo "------------------------------------------------------"
HEALTH_URL="http://localhost:${HTTP_PORT}/health"
if command -v curl >/dev/null 2>&1; then
  HEALTH_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${HEALTH_URL}" || echo "ERROR")
  echo "${HEALTH_RESP}"
else
  wget -qO- "${HEALTH_URL}" || echo "Error de conexión"
fi

echo ""
echo ""
echo "💾 3. Último Estado de Backup Automático:"
echo "------------------------------------------------------"
if [ -f "./backups/backup_status.json" ]; then
  cat "./backups/backup_status.json"
else
  echo "⚠️ No se ha generado ningún backup aún."
fi

echo ""
echo ""
echo "⚡ 4. Uso de Recursos en Tiempo Real:"
echo "------------------------------------------------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null || true

echo ""
echo "======================================================"
