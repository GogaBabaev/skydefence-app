#!/bin/bash
# PostgreSQL → Yandex Object Storage backup
# Runs via cron every night at 3:00 AM
# Required env vars (add to /etc/environment or .env on VPS):
#   POSTGRES_PASSWORD, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
DB_NAME="skydefence"
DB_USER="skydefence"
DB_HOST="postgres"
DB_PORT="5432"

S3_BUCKET="${S3_BUCKET:-skydefence-backups}"
S3_ENDPOINT="https://storage.yandexcloud.net"
S3_REGION="ru-central1"

RETAIN_DAYS=30            # delete backups older than this
BACKUP_DIR="/tmp/pg-backups"

# ── Helpers ───────────────────────────────────────────────────────────────────
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
die() { log "ERROR: $*"; exit 1; }

# ── Check deps ────────────────────────────────────────────────────────────────
command -v pg_dump  >/dev/null || die "pg_dump not found"
command -v aws      >/dev/null || die "aws CLI not found (pip install awscli)"
command -v gzip     >/dev/null || die "gzip not found"

# ── Dump ──────────────────────────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"
FILENAME="skydefence_$(date '+%Y%m%d_%H%M%S').sql.gz"
FILEPATH="$BACKUP_DIR/$FILENAME"

log "Dumping database $DB_NAME..."
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" \
  | gzip > "$FILEPATH"

SIZE=$(du -sh "$FILEPATH" | cut -f1)
log "Dump created: $FILENAME ($SIZE)"

# ── Upload to Yandex Object Storage ──────────────────────────────────────────
log "Uploading to s3://$S3_BUCKET/postgres/$FILENAME ..."
AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY" \
AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY" \
aws s3 cp "$FILEPATH" "s3://$S3_BUCKET/postgres/$FILENAME" \
  --endpoint-url "$S3_ENDPOINT" \
  --region "$S3_REGION"

log "Upload complete."

# ── Remove old backups from S3 (older than RETAIN_DAYS) ──────────────────────
log "Cleaning up backups older than $RETAIN_DAYS days..."
CUTOFF=$(date -d "-${RETAIN_DAYS} days" '+%Y-%m-%dT%H:%M:%S' 2>/dev/null || \
         date -v "-${RETAIN_DAYS}d" '+%Y-%m-%dT%H:%M:%S')  # macOS fallback

AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY" \
AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY" \
aws s3 ls "s3://$S3_BUCKET/postgres/" \
  --endpoint-url "$S3_ENDPOINT" \
  --region "$S3_REGION" \
  | awk '{print $4}' \
  | while read -r key; do
      file_date=$(echo "$key" | grep -oP '\d{8}' | head -1)
      if [[ -n "$file_date" ]]; then
        file_ts="${file_date:0:4}-${file_date:4:2}-${file_date:6:2}T00:00:00"
        if [[ "$file_ts" < "$CUTOFF" ]]; then
          log "Deleting old backup: $key"
          AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY" \
          AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY" \
          aws s3 rm "s3://$S3_BUCKET/postgres/$key" \
            --endpoint-url "$S3_ENDPOINT" \
            --region "$S3_REGION"
        fi
      fi
    done

# ── Cleanup local tmp ─────────────────────────────────────────────────────────
rm -f "$FILEPATH"
log "Done. Backup stored for $RETAIN_DAYS days."
