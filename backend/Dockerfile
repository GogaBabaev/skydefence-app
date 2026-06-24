# ── build stage ──────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
# Prisma needs libssl/openssl present to pick the right query engine.
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund && npx prisma generate
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ── runtime stage ────────────────────────────────────────────────
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
# openssl so Prisma detects libssl and doesn't try to download an engine at
# runtime (which would fail under the non-root "app" user).
RUN apk add --no-cache openssl
RUN addgroup -S app && adduser -S app -G app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev --no-audit --no-fund && npx prisma generate \
  && npm cache clean --force \
  && chown -R app:app /app/node_modules/.prisma /app/node_modules/@prisma
COPY --from=build /app/dist ./dist
USER app
EXPOSE 3000
# Apply migrations, seed catalog (idempotent upserts), then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
