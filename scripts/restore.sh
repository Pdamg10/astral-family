#!/bin/bash
set -e

# ==============================================================================
# ASTRAL FAMILY - POSTGRESQL RESTORE SCRIPT
# Restaura un volcado .sql.gz en la base de datos PostgreSQL
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

BACKUP_FILE="${1}"

if [ -z "${BACKUP_FILE}" ]; then
  if [ -f "./backups/latest_postgres_backup.sql.gz" ]; then
    BACKUP_FILE="./backups/latest_postgres_backup.sql.gz"
  else
    echo "❌ Error: No se especificó archivo de backup y no se encontró ./backups/latest_postgres_backup.sql.gz"
    echo "Uso: ./scripts/restore.sh [ruta_al_archivo.sql.gz]"
    exit 1
  fi
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: El archivo especificado '${BACKUP_FILE}' no existe."
  exit 1
fi

echo "======================================================"
echo "⚠️  ADVERTENCIA: RESTAURACIÓN DE BASE DE DATOS"
echo "======================================================"
echo "Archivo seleccionado: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"
echo "Esta operación reemplazará los datos actuales en PostgreSQL."
echo "======================================================"

if [ -t 0 ]; then
  read -p "¿Deseas continuar con la restauración? (escribe 'si' para confirmar): " CONFIRM
  if [ "${CONFIRM}" != "si" ] && [ "${CONFIRM}" != "yes" ]; then
    echo "❌ Operación cancelada por el usuario."
    exit 0
  fi
fi

# Load variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs -d '\n' 2>/dev/null) || true
fi

POSTGRES_DB="${POSTGRES_DB:-astral_db}"
POSTGRES_USER="${POSTGRES_USER:-astral_user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-astral_secure_password_2026}"

echo ""
echo "🛑 [Paso 1/5] Deteniendo contenedores web y WebSocket para evitar escrituras concurrentes..."
docker compose stop web realtime || true

echo "🔄 [Paso 2/5] Verificando que PostgreSQL esté activo..."
docker compose up -d database
until docker compose exec -T database pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null 2>&1; do
  echo "  Esperando a PostgreSQL..."
  sleep 2
done

echo "📥 [Paso 3/5] Restaurando volcado en la base de datos '${POSTGRES_DB}'..."
if [[ "${BACKUP_FILE}" == *.gz ]]; then
  gunzip -c "${BACKUP_FILE}" | docker compose exec -T -e PGPASSWORD="${POSTGRES_PASSWORD}" database psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
else
  cat "${BACKUP_FILE}" | docker compose exec -T -e PGPASSWORD="${POSTGRES_PASSWORD}" database psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
fi

echo "🚀 [Paso 4/5] Reiniciando la aplicación web y microservicios..."
docker compose start web realtime nginx || docker compose up -d

echo "🏥 [Paso 5/5] Verificando salud del sistema..."
sleep 5
HTTP_PORT="${HTTP_PORT:-8080}"
curl -s "http://localhost:${HTTP_PORT}/health" || echo "⚠️ Esperando a que el servicio responda..."

echo ""
echo "======================================================"
echo "✅ RESTAURACIÓN COMPLETADA CON ÉXITO"
echo "======================================================"
