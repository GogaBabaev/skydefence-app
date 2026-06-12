# Deployment Guide

## 0. Предварительно

1. **Отзовите старый токен бота** — он был захардкожен в `bot.js` и попал в git-историю. В @BotFather: `/revoke` → получите новый токен.
2. Зарегистрируйте магазин в [ЮKassa](https://yookassa.ru), получите `shopId` и секретный ключ (сначала тестовый `test_...`).
3. Купите VPS (2 vCPU / 2 GB достаточно) и домен; направьте A-запись домена на IP сервера.

## 1. Локальная разработка

```bash
# Backend + PostgreSQL
cp backend/.env.example backend/.env        # заполните токен бота и ключи ЮKassa
docker compose up -d postgres
cd backend
npm install
npx prisma migrate deploy && npx prisma generate
npm run seed                                # каталог из prisma/catalog.json
npm run start:dev                           # API на :3000

# Frontend
npm install
echo 'VITE_API_URL=http://localhost:3000' > .env.local
npm run dev
```

Тесты: `cd backend && npm test` и `npm test` в корне.

Для проверки webhooks локально используйте туннель (например, `ssh -R`/cloudpub) и временно `YOOKASSA_WEBHOOK_IP_CHECK=false`.

## 2. Production (VPS)

```bash
# на сервере
apt update && apt install -y docker.io docker-compose-v2 git
mkdir -p /opt/skydefence && cd /opt/skydefence
git clone <ваш-репозиторий> .

cp backend/.env.production.example backend/.env.production
nano backend/.env.production                # реальные ключи ЮKassa, токен бота, домен

cat > .env <<'EOF'
POSTGRES_PASSWORD=<сгенерируйте: openssl rand -hex 24>
TELEGRAM_BOT_TOKEN=<токен из BotFather>
APP_URL=https://app.example.com/
EOF

sed -i 's/app.example.com/<ваш-домен>/' Caddyfile.prod

docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec api npm run seed
```

Caddy сам получит TLS-сертификат. Проверка: `curl https://<домен>/api/health`.

## 3. Настройка Telegram и ЮKassa

1. @BotFather → `/newapp` (или Bot Settings → Menu Button) → URL Mini App: `https://<домен>/`.
2. ЮKassa → Интеграция → HTTP-уведомления: URL `https://<домен>/api/payments/yookassa/webhook`, события `payment.succeeded` и `payment.canceled`.
3. Тестовый платёж: тестовый магазин ЮKassa, карта `5555 5555 5555 4477`, любые CVC/срок. Заказ должен перейти в PAID, Mini App покажет success-экран.
4. После проверки замените тестовые ключи боевыми в `backend/.env.production` и перезапустите: `docker compose -f docker-compose.prod.yml up -d api`.

## 4. CI/CD

В GitHub репозитории: Settings → Secrets → `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` (приватный ключ деплой-пользователя); Variables → `VITE_API_URL` (пусто — same-origin). Каждый push в `main` после зелёных тестов деплоится автоматически.

## 5. Эксплуатация

- Логи: `docker compose -f docker-compose.prod.yml logs -f api`
- Бэкап БД: `docker compose -f docker-compose.prod.yml exec postgres pg_dump -U skydefence skydefence > backup_$(date +%F).sql` (поставьте в cron)
- Миграции при обновлении схемы: выполняются автоматически при старте контейнера api (`prisma migrate deploy`)
- Обновление каталога: правьте `backend/prisma/catalog.json` → `npm run seed` (upsert, безопасно)

## Чек-лист безопасности перед боевым запуском

- [ ] Старый токен бота отозван, новый только в env
- [ ] `YOOKASSA_WEBHOOK_IP_CHECK=true`
- [ ] `CORS_ORIGINS` — только ваш домен
- [ ] Боевые ключи ЮKassa, `vat_code` в receipt соответствует вашей системе налогообложения (`backend/src/payments/yookassa.client.ts`)
- [ ] Бэкапы PostgreSQL настроены
- [ ] SSH на сервере — только по ключам
