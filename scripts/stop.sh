#!/bin/bash
set -e

# ==============================================================================
# ASTRAL FAMILY - STOP SCRIPT
# Detiene ordenadamente todos los contenedores y servicios
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

echo "🛑 Deteniendo servicios de Astral Family..."
docker compose --profile tunnel --profile production down

echo "✅ Todos los servicios han sido detenidos correctamente."
