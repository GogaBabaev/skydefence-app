# SkyDefence Mini App — Architecture

## 1. Product specification

B2B Telegram Mini App для каталога оборудования: просмотр каталога (8 категорий, 36+ товаров), корзина, оформление заказа, B2B-заявки на товары «по запросу». Пользователь авторизуется автоматически через Telegram (initData); при оформлении заказа создаётся заявка, бот шлёт её менеджеру в Telegram, оплата согласуется отдельно переводом.

Роли: покупатель (Telegram-пользователь) и менеджер (получает заявки в Telegram, обрабатывает заказы в БД или будущей админке). Товары с `price = null` нельзя купить онлайн — для них предусмотрен endpoint B2B-заявок (`POST /api/b2b-requests`).

## 2. System architecture

```
 Telegram Client
 ┌───────────────────────────────┐
 │  Mini App (React 18 + Vite)   │
 │  FSD, Zustand, RHF + Zod      │
 └──────────────┬────────────────┘
                │ HTTPS (X-Telegram-Init-Data)
 ┌──────────────▼────────────────┐      ┌──────────────┐
 │  Caddy (TLS, reverse proxy)   │──────│  web (static)│
 └──────────────┬────────────────┘      └──────────────┘
                │ /api/*
 ┌──────────────▼────────────────┐
 │  NestJS API                   │
 │  ┌─────────┐ ┌──────────────┐ │
 │  │ Products│ │ Orders ──────┼─┼────▶┌──────────────┐
 │  ├─────────┤ │  + Notify    │ │     │ Telegram Bot │
 │  │ B2B     │ └──────────────┘ │     │  API (manager)│
 │  └─────────┘                  │     └──────────────┘
 │  Guards: TelegramAuth,        │
 │  Throttler; Helmet, CORS      │
 └──────────────┬────────────────┘
                │ Prisma
 ┌──────────────▼────────────────┐
 │  PostgreSQL 16                │
 └───────────────────────────────┘
```

Frontend-слои (FSD): `app/` (роутер, тема) → `pages/` → `widgets/` (navbar, footer) → `features/` (cart, checkout) → `entities/` (product) → `shared/` (api-клиент, telegram-хуки, ui). Состояние корзины — Zustand (`features/cart/model/cart.store.ts`). Каталог загружается с API; статический бандл — offline-fallback только для витрины.

## 3. Order request flow

```
 User          Mini App            API (NestJS)        Telegram Bot API
  │ выбрал товар   │                     │                     │
  │───────────────▶│ POST /api/orders    │                     │
  │                │────────────────────▶│ цены из БД,         │
  │                │   order(NEW)        │ итог считается      │
  │                │◀────────────────────│ на сервере          │
  │                │                     │ sendMessage(заявка) │
  │                │                     │────────────────────▶│ → чат менеджера
  │                │ GET /orders/:id     │                     │
  │ Success screen ◀────────────────────│                     │
  │ менеджер связывается с клиентом, оплата — переводом        │
```

Ключевые свойства: клиент никогда не сообщает цену — итог считается на сервере; уведомление менеджеру best-effort (ошибка отправки не блокирует создание заказа); оплата и подтверждение заказа — вручную, менеджер обновляет статус (`CONFIRMED`/`CANCELED`/`FULFILLED`) при последующей доработке админки.

## 4. Database schema

`users` (id = telegram id, BIGINT) ←─ `orders` (status: NEW → CONFIRMED/CANCELED → FULFILLED; снапшот customer-полей) ←─ `order_items` (снапшот product_name/unit_price на момент покупки). `categories` ←─ `products` (price NULL = «по запросу», Decimal(12,2), specs JSONB, gallery TEXT[]). `b2b_requests` — заявки юрлиц. Полная DDL: `backend/prisma/migrations/20260612000000_init/migration.sql`.

## 5. Security model

- **Telegram initData validation** — backend проверяет HMAC-SHA256 подпись (`secret = HMAC("WebAppData", bot_token)`), TTL 24 ч, timing-safe сравнение (`src/common/telegram/init-data.util.ts`). Заголовок `X-Telegram-Init-Data` обязателен для orders/b2b.
- **Zero trust к клиенту** — клиент отправляет только `productId + quantity`; цены, суммы и статусы считает сервер.
- **Rate limiting** — глобально 100 req/мин/IP; POST /orders — 10/мин; B2B — 5/мин.
- **Input validation** — class-validator DTO с `whitelist + forbidNonWhitelisted`; Zod-схемы на фронтенде (UX-валидация, не доверие).
- **Прочее** — Helmet, строгий CORS по `CORS_ORIGINS`, `trust proxy` для корректных IP за Caddy, ParseUUIDPipe на id, секреты только в env.

## 6. Infrastructure

Выбор: **VPS в РФ (Timeweb/Selectel/Yandex Cloud) + Docker Compose + Caddy**. Обоснование: аудитория в РФ (минимальная латентность), оплата хостинга из РФ, AWS/GCP/Azure фактически недоступны или нестабильны для этого рынка. Cloudflare перед доменом опционален (WAF/DDoS); Caddy выдаёт TLS Let's Encrypt автоматически.

Контейнеры: `caddy` (TLS, маршрутизация `/api` → api, остальное → web), `web` (статика Vite), `api` (NestJS), `bot` (long-polling), `postgres` (volume `pgdata`). Среды: dev (`docker-compose.yml` — локальный Postgres + API), staging/prod (`docker-compose.prod.yml` + отдельные `.env`).

## 7. CI/CD

GitHub Actions (`.github/workflows/ci.yml`): на каждый push/PR — typecheck + тесты фронтенда и бэкенда параллельно, затем проверка миграций против реального PostgreSQL (service container) с прогоном seed. На push в `main` — деплой по SSH: `git reset --hard` → `docker compose up -d --build` → `prisma migrate deploy`. Секреты: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`; переменная `VITE_API_URL`.

## 8. Testing strategy

- **Backend unit (Jest)**: подпись initData (валидная/чужой токен/подделка/просрочка/DoS), OrdersService (цены из БД, несуществующие/«по запросу»/out-of-stock товары, доступ к чужому заказу, best-effort уведомление менеджера).
- **Frontend (Vitest)**: cart store (добавление/количество/удаление/очистка), Zod-схема checkout (телефон, ИНН 10/12 цифр, email, граничные случаи).
- **CI**: миграции применяются к чистому PostgreSQL + сидинг — ловит дрейф схемы.

Запуск: `cd backend && npm test` (28 тестов), `npm test` в корне (11 тестов).
