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

cat > .env <<EOF
POSTGRES_PASSWORD=${PG_PASS}
TELEGRAM_BOT_TOKEN=${BOT_TOKEN}
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
EOF
chmod 600 backend/.env.production

sed -i "s/app\.example\.com/${DOMAIN}/" Caddyfile.prod

echo "→ Сборка и запуск контейнеров (займёт несколько минут)…"
docker compose -f docker-compose.prod.yml up -d --build

echo "→ Ожидание API…"
sleep 15
docker compose -f docker-compose.prod.yml exec -T api npm run seed || true

echo ""
echo "══════════════════════════════════════════════════════"
echo "✅ Готово. Проверка: curl https://${DOMAIN}/api/health"
echo "Дальше:"
echo "  1) @BotFather → /myapps или Menu Button → URL: https://${DOMAIN}/"
echo "  2) Заявки на заказ будут приходить ботом в чат ${MANAGER_CHAT_ID}"
echo "══════════════════════════════════════════════════════"
