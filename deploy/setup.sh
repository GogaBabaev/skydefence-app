#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
# SkyDefence — разовая настройка чистого VPS (Ubuntu 22.04/24.04).
# Запуск от root:
#   bash setup.sh <домен> <git-repo-url> <bot-token> <yk-shop-id> <yk-secret>
# Пример:
#   bash setup.sh app.example.ru https://github.com/user/repo.git 123:AA... 510123 test_abc
# ──────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="${1:?Укажите домен}"
REPO="${2:?Укажите URL git-репозитория}"
BOT_TOKEN="${3:?Укажите токен бота}"
YK_SHOP_ID="${4:?Укажите YooKassa shopId}"
YK_SECRET="${5:?Укажите YooKassa secret key}"

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
YOOKASSA_SHOP_ID=${YK_SHOP_ID}
YOOKASSA_SECRET_KEY=${YK_SECRET}
YOOKASSA_RETURN_URL=https://${DOMAIN}/#/order
YOOKASSA_WEBHOOK_IP_CHECK=true
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
echo "  2) ЮKassa → HTTP-уведомления → https://${DOMAIN}/api/payments/yookassa/webhook"
echo "══════════════════════════════════════════════════════"
