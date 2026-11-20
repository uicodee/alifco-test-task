ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS builder

WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/frontend/package*.json ./apps/frontend/

RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

COPY apps/backend ./apps/backend

RUN npx nx build backend --skip-nx-cache

RUN npx tsc \
      --outDir apps/backend/dist/migrations \
      --rootDir apps/backend/src/shared/database/migrations \
      --module commonjs --target es2022 --skipLibCheck --types node \
      $(find apps/backend/src/shared/database/migrations -name '*.ts')

FROM ${NODE_IMAGE} AS deps

WORKDIR /app

COPY --from=builder /app/apps/backend/dist/package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm install --omit=dev --prefer-offline --no-audit --no-fund

FROM ${NODE_IMAGE}

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./dist

EXPOSE 4000

CMD ["sh", "-c", "node dist/migrate.js && node dist/main.js"]
