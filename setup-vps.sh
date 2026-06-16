#!/bin/bash
# SkyDefence VPS Setup Script
# Запуск на чистом Ubuntu 22.04 / 24.04:
#   curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/setup-vps.sh | bash
# или:
#   bash setup-vps.sh
#
# После запуска скрипта заполните /opt/skydefence/.env и перезапустите:
#   cd /opt/skydefence && docker compose -f docker-compose.prod.yml up -d --build

set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*"; exit 1; }

[ "$(id -u)" -eq 0 ] || err "Запустите от root: sudo bash setup-vps.sh"

log "Обновление системы..."
apt-get update -q && apt-get upgrade -y -q

log "Установка зависимостей..."
apt-get install -y -q curl git ufw fail2ban

# Docker
if ! command -v docker &>/dev/null; then
  log "Установка Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
else
  log "Docker уже установлен: $(docker --version)"
fi

# Firewall
log "Настройка UFW..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Fail2ban
log "Запуск fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Swap (если меньше 2GB RAM)
TOTAL_RAM=$(free -m | awk '/Mem:/{print $2}')
if [ "$TOTAL_RAM" -lt 2048 ] && [ ! -f /swapfile ]; then
  log "Создание swap 2GB (RAM < 2GB)..."
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Директория проекта
APP_DIR=/opt/skydefence
log "Создание директории $APP_DIR..."
mkdir -p "$APP_DIR"

log ""
log "════════════════════════════════════════════════"
log "  VPS подготовлен!"
log ""
warn "Следующие шаги:"
echo ""
echo "  1. Загрузите проект на сервер:"
echo "     git clone https://github.com/YOUR/skydef1.git $APP_DIR"
echo "     # или: scp -r ./skydef1/* root@YOUR_IP:$APP_DIR/"
echo ""
echo "  2. Создайте файл с переменными окружения:"
echo "     cp $APP_DIR/backend/.env.production.example $APP_DIR/backend/.env.production"
echo "     nano $APP_DIR/backend/.env.production"
echo ""
echo "  3. Создайте .env для docker-compose в корне:"
echo "     nano $APP_DIR/.env"
echo "     # Содержимое:"
echo "     POSTGRES_PASSWORD=ваш_пароль_для_базы"
echo "     TELEGRAM_BOT_TOKEN=токен_от_botfather"
echo "     APP_URL=https://ваш_домен.ru"
echo "     ADMIN_API_SECRET=случайная_строка_32_символа"
echo "     TELEGRAM_MANAGER_CHAT_ID=ваш_chat_id"
echo ""
echo "  4. Замените домен в Caddyfile:"
echo "     sed -i 's/app.example.com/ваш_домен.ru/g' $APP_DIR/Caddyfile.prod"
echo ""
echo "  5. Запустите:"
echo "     cd $APP_DIR"
echo "     docker compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "  6. Засейдите базу данных:"
echo "     docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy"
echo "     docker compose -f docker-compose.prod.yml exec api npx ts-node prisma/seed.ts"
echo ""
log "════════════════════════════════════════════════"
