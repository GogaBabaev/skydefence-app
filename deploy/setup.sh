#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
# SkyDefence — разовая настройка чистого VPS (Ubuntu 22.04/24.04).
# Запуск от root:
#   bash setup.sh <домен> <git-repo-url> <bot-token> <manager-chat-id>
# Пример:
#   bash setup.sh app.example.ru https://github.com/user/repo.git 123:AA... 123456789
# ──────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="${1:?Укажите домен}"
REPO="${2:?Укажите URL git-репозитория}"
BOT_TOKEN="${3:?Укажите токен бота}"
MANAGER_CHAT_ID="${4:?Укажите Telegram chat id менеджера}"

echo "→ Установка Docker и git…"
apt-get update -qq
apt-get install -y -qq docker.io docker-compose-v2 git curl >/dev/null

echo "→ Клонирование репозитория…"
mkdir -p /opt/skydefence
if [ ! -d /opt/skydefence/.git ]; then
  git clone "$REPO" /opt/skydefence
fi
cd /opt/skydefence

echo "→ Генерация секретов и конфигов…"
PG_PASS=$(openssl rand -hex 24)
# Общий секрет между API и ботом для админ-эндпоинтов (/api/admin/*).
# Требуется и docker-compose (бот), и backend (env.validation) — генерируем один раз.
ADMIN_API_SECRET=$(openssl rand -hex 24)

cat > .env <<EOF
POSTGRES_PASSWORD=${PG_PASS}
TELEGRAM_BOT_TOKEN=${BOT_TOKEN}
TELEGRAM_MANAGER_CHAT_ID=${MANAGER_CHAT_ID}
ADMIN_API_SECRET=${ADMIN_API_SECRET}
APP_URL=https://${DOMAIN}/
EOF
chmod 600 .env

cat > backend/.env.production <<EOF
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://${DOMAIN}
TELEGRAM_BOT_TOKEN=${BOT_TOKEN}
TELEGRAM_INITDATA_TTL=86400
TELEGRAM_MANAGER_CHAT_ID=${MANAGER_CHAT_ID}
ADMIN_API_SECRET=${ADMIN_API_SECRET}
EOF
chmod 600 backend/.env.production

sed -i "s/app\.example\.com/${DOMAIN}/" Caddyfile.prod

echo "→ Сборка и запуск контейнеров (займёт несколько минут)…"
docker compose -f docker-compose.prod.yml up -d --build

echo "→ Ожидание API…"
sleep 15
docker compose -f docker-compose.prod.yml exec -T api npm run seed || true

echo "→ Настройка ежедневного бэкапа БД (cron, 03:00, хранение 30 дней)…"
mkdir -p /var/backups/skydefence
(crontab -l 2>/dev/null | grep -v 'skydefence/db_'; echo "0 3 * * * docker compose \
-f /opt/skydefence/docker-compose.prod.yml exec -T postgres \
pg_dump -U skydefence skydefence | gzip \
> /var/backups/skydefence/db_\$(date +\%Y\%m\%d_\%H\%M).sql.gz") | crontab -
(crontab -l 2>/dev/null | grep -v 'skydefence -name'; echo "30 3 * * * find \
/var/backups/skydefence -name '*.sql.gz' -mtime +30 -delete") | crontab -

echo ""
echo "══════════════════════════════════════════════════════"
echo "✅ Готово. Проверка: curl https://${DOMAIN}/api/health"
echo "Дальше:"
echo "  1) @BotFather → /myapps или Menu Button → URL: https://${DOMAIN}/"
echo "  2) Заявки на заказ будут приходить ботом в чат ${MANAGER_CHAT_ID}"
echo "══════════════════════════════════════════════════════"
