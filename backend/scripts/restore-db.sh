#!/bin/bash
# Restore a compressed backup
# Usage: ./restore-db.sh /backups/sg_backup_20260101_030000.sql.gz
# WARNING: This drops and recreates the database. Run only on the target machine.

set -euo pipefail

BACKUP_FILE="${1:-}"
if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "File not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring from $BACKUP_FILE to $DATABASE_URL ..."
echo "This will OVERWRITE the existing database. Press Ctrl-C to abort (5s)..."
sleep 5

gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"
echo "Restore complete."
