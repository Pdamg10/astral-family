# ==============================================================================
# ASTRAL FAMILY - AUTOMATED POSTGRESQL BACKUP SERVICE DOCKERFILE
# ==============================================================================

FROM alpine:3.20
WORKDIR /backups

RUN apk add --no-cache \
    postgresql16-client \
    gzip \
    bash \
    coreutils \
    tzdata \
    findutils \
    dcron

COPY docker/backup/backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

# Configure cron for daily backup at 03:00 AM UTC
RUN echo "0 3 * * * /usr/local/bin/backup.sh >> /var/log/cron.log 2>&1" > /etc/crontabs/root

ENV CRON_SCHEDULE="0 3 * * *"

# Run immediate backup on container boot, then keep crond in foreground
CMD ["sh", "-c", "/usr/local/bin/backup.sh && crond -f -l 2"]
