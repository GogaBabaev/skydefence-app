#!/bin/bash
# Restore PostgreSQL from Yandex Object Storage backup
# Usage: ./restore-postgres.sh [filename]
# Without filename — lists available backups and asks which to restore

set -euo pipefail

S3_BUCKET="${S3_BUCKET:-skydefence-backups}"
S3_ENDPOINT="https://storage.yandexcloud.net"
S3_REGION="ru-central1"
DB_NAME="skydefence"
DB_USER="skydefence"
DB_HOST="localhost"
DB_PORT="5432"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

S3_CMD="AWS_ACCESS_KEY_ID=$S3_ACCESS_KEY AWS_SECRET_ACCESS_KEY=$S3_SECRET_KEY aws s3 --endpoint-url $S3_ENDPOINT --region $S3_REGION"

if [[ -z "${1:-}" ]]; then
  log "Available backups:"
  eval "$S3_CMD ls s3://$S3_BUCKET/postgres/" | awk '{print NR". "$4}'
  echo ""
  read -rp "Enter filename to restore: " FILENAME
else
  FILENAME="$1"
fi

TMPFILE="/tmp/$FILENAME"
log "Downloading s3://$S3_BUCKET/postgres/$FILENAME ..."
eval "$S3_CMD cp s3://$S3_BUCKET/postgres/$FILENAME $TMPFILE"

log "Restoring to database $DB_NAME ..."
echo "⚠️  This will OVERWRITE the current database. Continue? (yes/no)"
read -r CONFIRM
[[ "$CONFIRM" == "yes" ]] || { log "Aborted."; exit 0; }

PGPASSWORD="$POSTGRES_PASSWORD" psql \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
  -c "DROP DATABASE IF EXISTS ${DB_NAME}_old; ALTER DATABASE $DB_NAME RENAME TO ${DB_NAME}_old;" \
  postgres 2>/dev/null || true

PGPASSWORD="$POSTGRES_PASSWORD" psql \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
  -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" postgres

gunzip -c "$TMPFILE" | PGPASSWORD="$POSTGRES_PASSWORD" psql \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"

rm -f "$TMPFILE"
log "Restore complete. Old database saved as ${DB_NAME}_old (drop manually when sure)."
