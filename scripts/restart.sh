#!/bin/bash
set -e

# ==============================================================================
# ASTRAL FAMILY - RESTART SCRIPT
# Reinicia los contenedores preservando todos los datos
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

echo "🔄 Reiniciando servicios de Astral Family..."
docker compose restart

echo ""
echo "⏳ Verificando estado de los servicios..."
sleep 3
docker compose ps

echo "✅ Reinicio completado exitosamente."
