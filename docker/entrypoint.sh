#!/bin/sh
set -e

echo "🌌 [Astral Family Entrypoint] Inicializando servicios..."

# Apply database schema to target PostgreSQL / database
if [ -n "$DATABASE_URL" ]; then
  if [ -x "./node_modules/.bin/prisma" ]; then
    ./node_modules/.bin/prisma db push --skip-generate --accept-data-loss || echo "⚠️ prisma db push notice"
  else
    npx prisma db push --skip-generate --accept-data-loss || echo "⚠️ prisma db push notice"
  fi

  # Auto-migrate initial seed if database is empty
  echo "🔍 [Astral Family Entrypoint] Verificando estado inicial de datos..."
  node scripts/migrate-from-sqlite.mjs || echo "ℹ️ Migración inicial ya completada o no requerida."
fi

echo "🚀 [Astral Family Entrypoint] Iniciando servidor de producción..."
exec "$@"
