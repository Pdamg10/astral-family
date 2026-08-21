#!/bin/bash
set -eo pipefail

# ==============================================================================
# ASTRAL FAMILY - AUTOMATED POSTGRESQL BACKUP ROTATION SCRIPT
# Strategy: 7 Daily Backups + 4 Weekly Backups + 12 Monthly Backups
# ==============================================================================

BACKUP_DIR="${BACKUP_DIR:-/backups}"
POSTGRES_HOST="${POSTGRES_HOST:-database}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-astral_user}"
POSTGRES_DB="${POSTGRES_DB:-astral_db}"
PGPASSWORD="${POSTGRES_PASSWORD:-astral_secure_password_2026}"
export PGPASSWORD

TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
DATE_DAY=$(date +"%Y-%m-%d")
DAY_OF_WEEK=$(date +"%u") # 1 (Mon) to 7 (Sun)
DAY_OF_MONTH=$(date +"%d") # 01 to 31
MONTH_YEAR=$(date +"%Y-%m")
WEEK_YEAR=$(date +"%Y_W%V")

DAILY_DIR="${BACKUP_DIR}/daily"
WEEKLY_DIR="${BACKUP_DIR}/weekly"
MONTHLY_DIR="${BACKUP_DIR}/monthly"

mkdir -p "${DAILY_DIR}" "${WEEKLY_DIR}" "${MONTHLY_DIR}"

echo "======================================================"
echo "📦 [$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Iniciando Backup de PostgreSQL..."
echo "======================================================"

# Wait for PostgreSQL database to be ready
until pg_isready -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"; do
  echo "⏳ Esperando a que PostgreSQL esté listo..."
  sleep 2
done

TARGET_DUMP="${DAILY_DIR}/astral_${POSTGRES_DB}_${TIMESTAMP}.sql.gz"

echo "💾 Volcando base de datos '${POSTGRES_DB}' desde '${POSTGRES_HOST}'..."
pg_dump -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  --format=plain --no-owner --no-acl | gzip -9 > "${TARGET_DUMP}"

DUMP_SIZE=$(du -h "${TARGET_DUMP}" | cut -f1)
echo "✓ Backup diario generado: ${TARGET_DUMP} (${DUMP_SIZE})"

# Copy to Weekly on Sundays (day 7)
if [ "${DAY_OF_WEEK}" -eq 7 ]; then
  WEEKLY_FILE="${WEEKLY_DIR}/astral_${POSTGRES_DB}_${WEEK_YEAR}.sql.gz"
  cp -f "${TARGET_DUMP}" "${WEEKLY_FILE}"
  echo "✓ Copia semanal preservada: ${WEEKLY_FILE}"
fi

# Copy to Monthly on 1st of month
if [ "${DAY_OF_MONTH}" -eq "01" ]; then
  MONTHLY_FILE="${MONTHLY_DIR}/astral_${POSTGRES_DB}_${MONTH_YEAR}.sql.gz"
  cp -f "${TARGET_DUMP}" "${MONTHLY_FILE}"
  echo "✓ Copia mensual preservada: ${MONTHLY_FILE}"
fi

# Also keep a pointer to latest backup
cp -f "${TARGET_DUMP}" "${BACKUP_DIR}/latest_postgres_backup.sql.gz"

# ------------------------------------------------------------------------------
# RETENTION CLEANUP
# ------------------------------------------------------------------------------
echo "🧹 Aplicando política de rotación y retención..."

# 1. Keep last 7 days of daily backups
find "${DAILY_DIR}" -name "*.sql.gz" -type f -mtime +7 -exec rm -f {} + 2>/dev/null || true
REMAINING_DAILY=$(find "${DAILY_DIR}" -name "*.sql.gz" -type f | wc -l)
echo "  • Backups diarios conservados: ${REMAINING_DAILY} (Retención: 7 días)"

# 2. Keep last 4 weeks of weekly backups
find "${WEEKLY_DIR}" -name "*.sql.gz" -type f -mtime +28 -exec rm -f {} + 2>/dev/null || true
REMAINING_WEEKLY=$(find "${WEEKLY_DIR}" -name "*.sql.gz" -type f | wc -l)
echo "  • Backups semanales conservados: ${REMAINING_WEEKLY} (Retención: 4 semanas)"

# 3. Keep last 12 months of monthly backups
find "${MONTHLY_DIR}" -name "*.sql.gz" -type f -mtime +365 -exec rm -f {} + 2>/dev/null || true
REMAINING_MONTHLY=$(find "${MONTHLY_DIR}" -name "*.sql.gz" -type f | wc -l)
echo "  • Backups mensuales conservados: ${REMAINING_MONTHLY} (Retención: 12 meses)"

# Write JSON status metadata
cat <<EOF > "${BACKUP_DIR}/backup_status.json"
{
  "status": "success",
  "lastBackupAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "latestFile": "${TARGET_DUMP}",
  "size": "${DUMP_SIZE}",
  "stats": {
    "dailyCount": ${REMAINING_DAILY},
    "weeklyCount": ${REMAINING_WEEKLY},
    "monthlyCount": ${REMAINING_MONTHLY}
  }
}
EOF

echo "✅ Backup completado exitosamente."
