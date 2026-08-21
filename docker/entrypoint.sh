#!/bin/sh
set -e

echo "🌌 [Astral Family Entrypoint] Inicializando servicios..."

# Apply database schema to target PostgreSQL / database
if [ -n "$DATABASE_URL" ]; then
  echo "📦 [Astral Family Entrypoint] Sincronizando esquema de base de datos..."
  npx prisma db push --skip-generate --accept-data-loss || {
    echo "⚠️ [Astral Family Entrypoint] Advertencia: prisma db push encontró un aviso, continuando..."
  }

  # Auto-migrate initial seed if database is empty
  echo "🔍 [Astral Family Entrypoint] Verificando estado inicial de datos..."
  node -e '
    const { PrismaClient } = require("@prisma/client");
    const db = new PrismaClient();
    async function check() {
      try {
        const count = await db.user.count();
        if (count === 0) {
          console.log("📥 Base de datos vacía detectada. Importando datos iniciales...");
          require("child_process").execSync("node scripts/migrate-from-sqlite.mjs", { stdio: "inherit" });
        } else {
          console.log(`✓ Base de datos existente con ${count} usuario(s).`);
        }
      } catch (err) {
        console.error("Error al verificar estado inicial:", err.message);
      }
    }
    check().then(() => process.exit(0));
  ' || true
fi

echo "🚀 [Astral Family Entrypoint] Iniciando servidor de producción..."
exec "$@"
