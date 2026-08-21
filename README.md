# 🌌 Astral Family — Guía Integral de Infraestructura Self-Hosted

<div align="center">
  <img src="public/logo.png" width="120" height="120" alt="Astral Family Logo" />
  <h3>Plataforma Privada Familiar de Astrología de Alta Precisión</h3>
  <p><b>Arquitectura 100% Autónoma y Autoalojada (Self-Hosted) en Servidor Propio</b></p>
</div>

---

## 🏛️ 1. Arquitectura del Sistema

Astral Family ha sido diseñada para ejecutarse **exclusivamente dentro de tu propia infraestructura Linux**, garantizando la privacidad absoluta de los datos de nacimiento y la soberanía digital del grupo familiar:

```text
                               INTERNET
                                  │
                                  ▼
                         Cloudflare Edge (HTTPS)
                                  │
                    ┌─────────────┴─────────────┐
                    │     Cloudflare Access     │ (Autenticación / Zero-Trust)
                    └─────────────┬─────────────┘
                                  │ Cloudflare Tunnel (Sin abrir puertos)
                                  ▼
                     Servidor Linux Propio (Host)
                                  │
                     ┌────────────┴────────────┐
                     │   Docker Compose Net    │
                     │  (astral_network bridge)│
                     └────────────┬────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
 ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
 │ Nginx Proxy │           │   Web App   │           │  Realtime   │
 │   (:8080)   │──────────▶│ (Next.js)   │           │ (WebSocket) │
 └─────────────┘           │   (:3000)   │           │   (:3003)   │
                           └──────┬──────┘           └─────────────┘
                                  │ (Red Privada)
                                  ▼
                           ┌─────────────┐           ┌─────────────┐
                           │ PostgreSQL  │◀──────────│ Auto-Backup │
                           │ 16 Alpine   │ (pg_dump) │   Runner    │
                           └──────┬──────┘           └─────────────┘
                                  │
                                  ▼
                        Volumen Persistente
                         [postgres_data]
```

### 🔒 Principios de Seguridad
1. **PostgreSQL Aislado**: El puerto `5432` está restringido a la red interna de Docker (`astral_network`). **Nunca se expone a Internet ni a la IP del host**.
2. **Cero Puertos Abiertos en el Router**: Con Cloudflare Tunnel, el servidor establece una conexión saliente cifrada a la red de Cloudflare; no requiere port forwarding ni IP pública fija.
3. **Cálculos Astrales 100% Locales**: Todas las posiciones planetarias, casas Placidus, decanatos y sinastrías se computan en el backend local mediante motores astronómicos (`astronomy-engine`, efemérides locales).
4. **Persistencia Garantizada**: Los datos residen en el volumen Docker `postgres_data` y se respaldan automáticamente con rotación diaria, semanal y mensual en `./backups/`.

---

## 📋 2. Requisitos Previos

* **Servidor**: PC / Servidor Linux (Ubuntu 22.04+, Debian 12+, Arch, Fedora, etc.) o Raspberry Pi 4/5 (64-bit).
* **Docker Engine**: Versión 24.0 o superior (`docker --version`).
* **Docker Compose**: Plugin v2 o superior (`docker compose version`).
* **Dominio propio**: Configurado en Cloudflare (ej. `astral-family.tudominio.com`).
* **Cuenta de Cloudflare**: Plan gratuito suficiente para DNS, Tunnel y Access.

---

## 🚀 3. Instalación y Puesta en Marcha

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/astral-family.git
cd astral-family
```

### Paso 2: Configurar Variables de Entorno
Copia la plantilla `.env.example` y personaliza tus claves secretas:
```bash
cp .env.example .env
nano .env
```

Asegúrate de definir:
* `POSTGRES_PASSWORD`: Contraseña segura para PostgreSQL.
* `JWT_SECRET`: Llave secreta aleatoria (mínimo 32 caracteres).
* `APP_URL`: URL con la que accederás (ej. `https://astral.tudominio.com` o `http://localhost:8080`).
* `CLOUDFLARE_TUNNEL_TOKEN`: Token generado en el dashboard de Cloudflare Zero Trust (si usas túnel).

### Paso 3: Iniciar la Infraestructura
Utiliza el script de inicio automatizado:
```bash
./scripts/start.sh
```

El script levantará:
* 🐘 **astral-postgres**: Base de datos PostgreSQL 16 con healthchecks activos.
* 🌌 **astral-web**: Aplicación Next.js 16 standalone.
* ⚡ **astral-realtime**: Microservicio de WebSockets para sincronización en tiempo real.
* 🛡️ **astral-nginx**: Gateway inverso y terminación de proxy.
* 📦 **astral-backup**: Gestor de backups automáticos con retención programada.
* 🌐 **astral-cloudflared**: Conector de túnel Cloudflare (si se especificó el token).

---

## 🌐 4. Configuración de Cloudflare Tunnel & Acceso HTTPS

1. Accede al panel de **[Cloudflare Zero Trust](https://one.dash.cloudflare.com/)**.
2. Ve a **Networks ➔ Tunnels ➔ Create a Tunnel**.
3. Selecciona **Cloudflared** y asigna un nombre (ej. `astral-server`).
4. En el paso de instalación, copia el **Token** que aparece en el comando de Docker (la cadena después de `--token`).
5. Pega este token en tu archivo `.env`:
   ```env
   CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoi...tu_token_aqui...
   ```
6. En la pestaña **Public Hostnames** del túnel en Cloudflare:
   * **Subdomain / Domain**: `astral.tudominio.com`
   * **Service Type**: `HTTP`
   * **URL**: `nginx:80`
   * **Additional settings ➔ HTTP Settings**: Habilitar *HTTP2 Support* y *WebSockets*.
7. Inicia el túnel ejecutando:
   ```bash
   ./scripts/start.sh
   ```
8. ¡Listo! Tu aplicación estará disponible de forma segura bajo `https://astral.tudominio.com` con certificado SSL gestionado por Cloudflare.

---

## 💾 5. Política de Backups Automáticos y Retención

El servicio `astral-backup` ejecuta diariamente un volcado comprimido de PostgreSQL mediante `pg_dump` con la siguiente política de rotación:

| Frecuencia | Ubicación | Retención |
| :--- | :--- | :--- |
| **Diario** | `./backups/daily/astral_astral_db_YYYY-MM-DD_HHMMSS.sql.gz` | **Últimos 7 días** |
| **Semanal** | `./backups/weekly/astral_astral_db_YYYY_WXX.sql.gz` | **Últimas 4 semanas** |
| **Mensual** | `./backups/monthly/astral_astral_db_YYYY-MM.sql.gz` | **Últimos 12 meses** |

### Generar un Backup Manual Inmediato
```bash
./scripts/backup.sh
```

---

## 🔄 6. Procedimiento de Restauración (Disaster Recovery)

Para restaurar la base de datos a partir de cualquier archivo de backup:

```bash
# Restaurar el backup más reciente
./scripts/restore.sh

# O restaurar un archivo específico
./scripts/restore.sh ./backups/daily/astral_astral_db_2026-08-20_030000.sql.gz
```

El script se encargará automáticamente de:
1. Pausar los servicios web para evitar colisiones de escritura.
2. Inyectar el volcado SQL en PostgreSQL.
3. Reiniciar la aplicación y verificar la integridad de las cartas y usuarios.

---

## 🛠️ 7. Scripts de Administración

| Script | Descripción |
| :--- | :--- |
| [`./scripts/start.sh`](file:///home/phame/Documentos/github/astral%20family/scripts/start.sh) | Inicia o reconstruye todos los contenedores de la aplicación. |
| [`./scripts/stop.sh`](file:///home/phame/Documentos/github/astral%20family/scripts/stop.sh) | Detiene ordenadamente todos los servicios. |
| [`./scripts/restart.sh`](file:///home/phame/Documentos/github/astral%20family/scripts/restart.sh) | Reinicia los contenedores preservando los datos. |
| [`./scripts/backup.sh`](file:///home/phame/Documentos/github/astral%20family/scripts/backup.sh) | Genera un backup manual comprimido de PostgreSQL. |
| [`./scripts/restore.sh`](file:///home/phame/Documentos/github/astral%20family/scripts/restore.sh) | Restaura una copia de seguridad en la base de datos. |
| [`./scripts/health.sh`](file:///home/phame/Documentos/github/astral%20family/scripts/health.sh) | Muestra el estado de salud, uso de CPU/RAM y latencias. |
| [`./scripts/update.sh`](file:///home/phame/Documentos/github/astral%20family/scripts/update.sh) | Actualiza el código con backup previo y cero pérdida de datos. |

---

## 🔄 8. Procedimiento de Actualización Futura

Para actualizar la aplicación a una nueva versión sin riesgo:

```bash
./scripts/update.sh
```

El flujo ejecutado es:
1. **Backup preventivo automático**.
2. **Git pull** del código más reciente.
3. **Reconstrucción de imágenes Docker**.
4. **Sincronización de esquemas Prisma** (`npx prisma db push`).
5. **Reinicio y verificación de salud** de los endpoints.

---

## 🔙 9. Procedimiento de Rollback (Reversión)

Si una actualización fallase:
1. Revierte el código git:
   ```bash
   git checkout <commit_anterior>
   ```
2. Restaura el backup generado antes de la actualización:
   ```bash
   ./scripts/restore.sh ./backups/daily/astral_backup_previo.sql.gz
   ```
3. Reconstruye e inicia:
   ```bash
   ./scripts/start.sh
   ```

---

## 🧪 10. Datos de Desarrollo vs. Producción

* **Producción**: Los datos reales de los 19 miembros familiares se almacenan exclusivamente en el volumen local `postgres_data`.
* **Desarrollo**: Para inicializar una base de datos local de prueba con datos ficticios no reales (como *Persona Demo 1*, *Persona Demo 2*), ejecuta:
  ```bash
  node scripts/seed-development.mjs
  ```

---

## 🔒 11. Lista de Verificación de Seguridad del Servidor Linux

1. **Usuario no root**: Ejecutar Docker bajo un usuario con privilegios `sudo`, nunca directamente como `root`.
2. **SSH Hardening**: Deshabilitar login por contraseña en `/etc/ssh/sshd_config` (`PasswordAuthentication no`) y utilizar exclusivamente llaves SSH (`ed25519`).
3. **Firewall (UFW)**:
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw enable
   ```
   *Nota: No es necesario abrir puertos web si utilizas Cloudflare Tunnel.*
4. **Copias Offsite**: Puedes sincronizar la carpeta `./backups/` con un disco externo cifrado o un almacenamiento privado mediante `rsync` o `rclone`.

---

<div align="center">
  <sub>Astral Family — Soberanía de Datos, Astrología y Privacidad Familiar.</sub>
</div>
