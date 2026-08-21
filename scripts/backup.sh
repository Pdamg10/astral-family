#!/bin/bash
set -e

# ==============================================================================
# ASTRAL FAMILY - ON-DEMAND DATABASE BACKUP SCRIPT
# Genera un volcado completo de PostgreSQL comprimido en ./backups/
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

echo "======================================================"
echo "📦 GENERANDO BACKUP MANUAL DE POSTGRESQL"
echo "======================================================"

if docker compose ps -q database >/dev/null 2>&1 && [ -n "$(docker compose ps -q database)" ]; then
  echo "🚀 Ejecutando backup a través del contenedor..."
  docker compose exec -T backup /usr/local/bin/backup.sh
else
  echo "⚠️ El contenedor de base de datos no está activo."
  echo "Iniciando temporalmente el servicio de backup..."
  docker compose run --rm backup /usr/local/bin/backup.sh
fi

echo ""
echo "📁 Lista de backups disponibles en ./backups/daily/:"
ls -lh ./backups/daily/ 2>/dev/null || true

echo ""
echo "✅ Proceso de backup finalizado con éxito."
