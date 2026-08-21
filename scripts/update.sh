#!/bin/bash
set -e

# ==============================================================================
# ASTRAL FAMILY - SAFE APPLICATION UPDATE SCRIPT
# Realiza backup previo, actualiza código, reconstruye imágenes y verifica salud
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

echo "======================================================"
echo "🔄 INICIANDO ACTUALIZACIÓN SEGURA DE ASTRAL FAMILY"
echo "======================================================"

# 1. Mandatory Pre-update Backup
echo ""
echo "📦 [Paso 1/5] Ejecutando backup preventivo de base de datos..."
./scripts/backup.sh || {
  echo "❌ Error: Falló el backup preventivo. Abortando actualización por seguridad."
  exit 1
}

# 2. Pull Git updates if in repository
echo ""
echo "📥 [Paso 2/5] Descargando últimas actualizaciones de Git..."
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git pull origin main || echo "⚠️ Advertencia: No se pudo hacer git pull automático o no hay conexión remota. Continuando con archivos locales..."
fi

# 3. Rebuild Docker Images
echo ""
echo "🏗️ [Paso 3/5] Reconstruyendo imágenes de producción con Docker..."
docker compose build

# 4. Restart Services & Apply Migrations
echo ""
echo "🚀 [Paso 4/5] Reiniciando servicios y sincronizando esquemas..."
docker compose up -d

# 5. Verify Health Status
echo ""
echo "🏥 [Paso 5/5] Verificando salud de la nueva versión..."
sleep 5
./scripts/health.sh

echo ""
echo "======================================================"
echo "✅ ACTUALIZACIÓN COMPLETADA CON ÉXITO Y SIN PÉRDIDA DE DATOS"
echo "======================================================"
