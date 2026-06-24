#!/bin/bash
# Automated PostgreSQL backup script
# Cron: 0 3 * * * /app/scripts/backup-db.sh >> /app/logs/backup.log 2>&1

set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_FILE="$BACKUP_DIR/sg_backup_$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[$(date)] Backup created: $BACKUP_FILE ($SIZE)"

# TODO: Uncomment to upload to S3
# aws s3 cp "$BACKUP_FILE" "s3://sg-backups/$(basename $BACKUP_FILE)"
# echo "[$(date)] Uploaded to S3"

# Delete backups older than 30 days
find "$BACKUP_DIR" -name "sg_backup_*.sql.gz" -mtime +30 -delete
echo "[$(date)] Old backups cleaned up"

echo "[$(date)] Backup complete."
