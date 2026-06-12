# ── build stage ──────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund && npx prisma generate
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ── runtime stage ────────────────────────────────────────────────
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev --no-audit --no-fund && npx prisma generate \
  && npm cache clean --force
COPY --from=build /app/dist ./dist
USER app
EXPOSE 3000
# Apply migrations, seed catalog (idempotent upserts), then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
