# SkyDefence Mini App — Architecture

## 1. Product specification

B2B Telegram Mini App для каталога оборудования: просмотр каталога (8 категорий, 36+ товаров), корзина, оформление заказа, онлайн-оплата через ЮKassa, B2B-заявки на товары «по запросу». Пользователь авторизуется автоматически через Telegram (initData), оплачивает картой/СБП на странице ЮKassa и возвращается в Mini App на экран статуса заказа.

Роли: покупатель (Telegram-пользователь) и менеджер (обрабатывает заказы/заявки в БД или будущей админке). Товары с `price = null` нельзя купить онлайн — для них предусмотрен endpoint B2B-заявок (`POST /api/b2b-requests`).

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
 │  │ Products│ │ Orders       │ │
 │  ├─────────┤ ├──────────────┤ │     ┌──────────────┐
 │  │ B2B     │ │ Payments ────┼─┼────▶│ YooKassa API │
 │  └─────────┘ │  + Webhook ◀─┼─┼─────│  (v3, Basic) │
 │              └──────────────┘ │     └──────────────┘
 │  Guards: TelegramAuth,        │
 │  Throttler; Helmet, CORS      │
 └──────────────┬────────────────┘
                │ Prisma
 ┌──────────────▼────────────────┐
 │  PostgreSQL 16                │
 └───────────────────────────────┘
```

Frontend-слои (FSD): `app/` (роутер, тема) → `pages/` → `widgets/` (navbar, footer) → `features/` (cart, checkout) → `entities/` (product) → `shared/` (api-клиент, telegram-хуки, ui). Состояние корзины — Zustand (`features/cart/model/cart.store.ts`). Каталог загружается с API; статический бандл — offline-fallback только для витрины.

## 3. Payment flow

```
 User          Mini App            API (NestJS)            YooKassa
  │ выбрал товар   │                     │                     │
  │───────────────▶│ POST /api/orders    │                     │
  │                │────────────────────▶│ цены из БД,         │
  │                │   order(PENDING)    │ итог считается      │
  │                │◀────────────────────│ на сервере          │
  │                │ POST /api/orders/:id/payment              │
  │                │────────────────────▶│ POST /v3/payments   │
  │                │                     │──Idempotence-Key───▶│
  │                │ confirmation_url    │◀──pending───────────│
  │                │◀────────────────────│ order→AWAITING_PAYMENT
  │ openLink(confirmation_url) ─────────────────────────────▶ │
  │ платит картой/СБП на странице ЮKassa                       │
  │ return_url → Mini App /#/order/:id                         │
  │                │ GET /orders/:id (poll каждые 3 c)         │
  │                │                     │◀──webhook payment.succeeded
  │                │                     │ 1) IP allowlist      │
  │                │                     │ 2) GET /v3/payments/:id (verify)
  │                │                     │ 3) сверка суммы      │
  │                │                     │ 4) order→PAID (tx)   │
  │                │   status: PAID      │                     │
  │ Success screen ◀────────────────────│                     │
```

Ключевые свойства: клиент никогда не сообщает цену; webhook-пейлоад не является источником истины (re-fetch из API ЮKassa); idempotency на двух уровнях (Idempotence-Key при создании, unique(event, payment_id) при приёме webhook); сверка суммы и валюты перед переводом заказа в PAID.

## 4. Database schema

`users` (id = telegram id, BIGINT) ←─ `orders` (status: PENDING → AWAITING_PAYMENT → PAID/CANCELED → FULFILLED; снапшот customer-полей) ←─ `order_items` (снапшот product_name/unit_price на момент покупки) и `payments` (external_id = id платежа ЮKassa, idempotence_key UNIQUE, raw_payload JSONB для аудита). `categories` ←─ `products` (price NULL = «по запросу», Decimal(12,2), specs JSONB, gallery TEXT[]). `webhook_events` — журнал + идемпотентность. `b2b_requests` — заявки юрлиц. Полная DDL: `backend/prisma/migrations/20260612000000_init/migration.sql`.

## 5. Security model

- **Telegram initData validation** — backend проверяет HMAC-SHA256 подпись (`secret = HMAC("WebAppData", bot_token)`), TTL 24 ч, timing-safe сравнение (`src/common/telegram/init-data.util.ts`). Заголовок `X-Telegram-Init-Data` обязателен для orders/b2b.
- **Zero trust к клиенту** — клиент отправляет только `productId + quantity`; цены, суммы и статусы считает сервер.
- **Webhook security** — ЮKassa не подписывает webhooks, поэтому: allowlist официальных IP-диапазонов + повторная выборка платежа из API с Basic-auth + сверка суммы/валюты + идемпотентность.
- **Rate limiting** — глобально 100 req/мин/IP; POST /orders и /payment — 10/мин; B2B — 5/мин. Webhook исключён из троттлинга (ретраи провайдера).
- **Input validation** — class-validator DTO с `whitelist + forbidNonWhitelisted`; Zod-схемы на фронтенде (UX-валидация, не доверие).
- **Прочее** — Helmet, строгий CORS по `CORS_ORIGINS`, `trust proxy` для корректных IP за Caddy, ParseUUIDPipe на id, секреты только в env.

## 6. Infrastructure

Выбор: **VPS в РФ (Timeweb/Selectel/Yandex Cloud) + Docker Compose + Caddy**. Обоснование: ЮKassa и аудитория в РФ (минимальная латентность, webhooks без блокировок), оплата хостинга из РФ, AWS/GCP/Azure фактически недоступны или нестабильны для этого рынка. Cloudflare перед доменом опционален (WAF/DDoS); Caddy выдаёт TLS Let's Encrypt автоматически.

Контейнеры: `caddy` (TLS, маршрутизация `/api` → api, остальное → web), `web` (статика Vite), `api` (NestJS), `bot` (long-polling), `postgres` (volume `pgdata`). Среды: dev (`docker-compose.yml` — локальный Postgres + API), staging/prod (`docker-compose.prod.yml` + отдельные `.env`).

## 7. CI/CD

GitHub Actions (`.github/workflows/ci.yml`): на каждый push/PR — typecheck + тесты фронтенда и бэкенда параллельно, затем проверка миграций против реального PostgreSQL (service container) с прогоном seed. На push в `main` — деплой по SSH: `git reset --hard` → `docker compose up -d --build` → `prisma migrate deploy`. Секреты: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`; переменная `VITE_API_URL`.

## 8. Testing strategy

- **Backend unit (Jest)**: подпись initData (валидная/чужой токен/подделка/просрочка/DoS), IP-allowlist ЮKassa, PaymentsService (создание, чужой заказ, повторная оплата, amount mismatch), OrdersService (цены из БД, несуществующие/«по запросу»/out-of-stock товары, доступ к чужому заказу).
- **Backend integration**: полный flow order → payment intent → webhook → PAID на реальных сервисах с мокнутыми Prisma/HTTP, включая проверку идемпотентности повторного webhook.
- **Frontend (Vitest)**: cart store (добавление/количество/удаление/очистка), Zod-схема checkout (телефон, ИНН 10/12 цифр, email, граничные случаи).
- **CI**: миграции применяются к чистому PostgreSQL + сидинг — ловит дрейф схемы.

Запуск: `cd backend && npm test` (28 тестов), `npm test` в корне (11 тестов).
