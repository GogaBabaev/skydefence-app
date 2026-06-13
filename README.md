# SkyDefence — Telegram Mini App

B2B-магазин внутри Telegram: каталог, корзина, заявки на заказ (оплата — переводом по согласованию с менеджером), B2B-заявки.

| Часть | Стек | Где |
|---|---|---|
| Mini App | React 18, TypeScript, Vite, FSD, Zustand, RHF + Zod, Framer Motion | `src/` |
| API | NestJS, Prisma, PostgreSQL, Telegram Bot API | `backend/` |
| Бот | Node.js (long polling) | `bot.js` |
| Инфра | Docker Compose, Caddy (TLS), GitHub Actions | `docker-compose*.yml`, `.github/` |

## Документация

- [Архитектура, payment flow, безопасность, тесты](docs/ARCHITECTURE.md)
- [Деплой: локально и production](docs/DEPLOYMENT.md)

## Быстрый старт

```bash
# API + БД
cp backend/.env.example backend/.env
docker compose up -d postgres
cd backend && npm install && npx prisma migrate deploy && npx prisma generate && npm run seed && npm run start:dev

# Mini App (второй терминал)
npm install && echo 'VITE_API_URL=http://localhost:3000' > .env.local && npm run dev
```

Тесты: `npm test` (фронтенд) и `cd backend && npm test`.

⚠️ Все секреты (токен бота, chat id менеджера) — только в `.env`, никогда в коде.
