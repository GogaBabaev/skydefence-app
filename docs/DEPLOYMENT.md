# Deployment Guide

## 0. Предварительно

1. **Отзовите старый токен бота** — он был захардкожен в `bot.js` и попал в git-историю. В @BotFather: `/revoke` → получите новый токен.
2. Узнайте chat id менеджера/группы, куда бот будет слать заявки на заказ (например, через `@userinfobot` или `getUpdates`).
3. Купите VPS (2 vCPU / 2 GB достаточно) и домен; направьте A-запись домена на IP сервера.

## 1. Локальная разработка

```bash
# Backend + PostgreSQL
cp backend/.env.example backend/.env        # заполните токен бота и chat id менеджера
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

## 2. Production (VPS)

```bash
# на сервере
apt update && apt install -y docker.io docker-compose-v2 git
mkdir -p /opt/skydefence && cd /opt/skydefence
git clone <ваш-репозиторий> .

cp backend/.env.production.example backend/.env.production
nano backend/.env.production                # токен бота, chat id менеджера, домен

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

## 3. Настройка Telegram

1. @BotFather → `/newapp` (или Bot Settings → Menu Button) → URL Mini App: `https://<домен>/`.
2. Укажите `TELEGRAM_MANAGER_CHAT_ID` в `backend/.env.production` — id чата/группы менеджера, куда бот шлёт заявки.
3. Тестовый заказ: оформите заявку в Mini App — в чат менеджера должно прийти сообщение со сводкой заказа и контактами клиента. Mini App покажет экран «Заявка отправлена».
4. После проверки перезапустите API при изменении env: `docker compose -f docker-compose.prod.yml up -d api`.

## 4. CI/CD

В GitHub репозитории: Settings → Secrets → `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` (приватный ключ деплой-пользователя); Variables → `VITE_API_URL` (пусто — same-origin). Каждый push в `main` после зелёных тестов деплоится автоматически.

## 5. Эксплуатация

- Логи: `docker compose -f docker-compose.prod.yml logs -f api`
- Бэкап БД: настраивается автоматически скриптом `deploy/setup.sh` — ежедневно в 03:00 cron делает `pg_dump` в `/var/backups/skydefence/db_YYYYMMDD_HHMM.sql.gz`, в 03:30 удаляются файлы старше 30 дней. Проверить: `crontab -l` и `ls /var/backups/skydefence`.
- Миграции при обновлении схемы: выполняются автоматически при старте контейнера api (`prisma migrate deploy`)
- Обновление каталога: правьте `backend/prisma/catalog.json` → `npm run seed` (upsert, безопасно)

## Чек-лист безопасности перед боевым запуском

- [ ] Старый токен бота отозван, новый только в env
- [ ] `TELEGRAM_MANAGER_CHAT_ID` указывает на правильный чат менеджера
- [ ] `CORS_ORIGINS` — только ваш домен
- [ ] Бэкапы PostgreSQL настроены
- [ ] SSH на сервере — только по ключам
