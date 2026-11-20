# Alifco Auth

Сервис авторизации: регистрация и вход по email и паролю, а также вход через Google, Facebook и Telegram. Сессии хранятся в httpOnly-куках: `access_token` (короткоживущий JWT) и `refresh_token` (меняется при каждом обновлении). Один аккаунт можно привязать к нескольким способам входа, а пароль задать позже, если пользователь пришёл через соцсеть.

Прод: https://alifco.duckdns.org

## Стек

**Backend** (`apps/backend`)
- NestJS 11, TypeScript, Express
- PostgreSQL 17, TypeORM (миграции схемы и сидов)
- Passport + JWT (access и refresh), OAuth 2.0 / OpenID Connect для Google, Facebook и Telegram
- Пароли хешируются через scrypt (`node:crypto`)
- Helmet, rate limiting (`@nestjs/throttler`), валидация через class-validator, конфиг через zod
- Swagger / OpenAPI

**Frontend** (`apps/frontend`)
- Next.js 16 (App Router), React 19
- Tailwind CSS 4, Radix UI
- TanStack Query, axios-клиент, сгенерированный Orval из `openapi.json`
- react-hook-form + zod
- Структура по Feature-Sliced Design: `app`, `widgets`, `features`, `shared`

**Инфраструктура**
- Монорепозиторий на npm workspaces + Nx 22
- Docker, docker compose

## Структура

```
apps/
  backend/    NestJS API, префикс /api
  frontend/   Next.js, проксирует /api/* на бэкенд
```

## API

| Метод | Путь | Что делает |
|---|---|---|
| POST | `/api/auth/register` | Регистрация (name, email, password) |
| POST | `/api/auth/login` | Вход по email и паролю |
| POST | `/api/auth/refresh` | Обновить пару токенов |
| POST | `/api/auth/logout` | Выход |
| GET | `/api/auth/me` | Текущий пользователь |
| POST | `/api/auth/password` | Задать пароль |
| GET | `/api/auth/providers` | Какие соцвходы настроены |
| GET | `/api/auth/oauth/:provider` | Начать вход через провайдера |
| GET | `/api/auth/oauth/:provider/callback` | Callback провайдера |

Swagger UI доступен на `/api/docs`. В проде он выключен, включается переменной `SWAGGER_ENABLED=true`.

## Локальный запуск

Нужны Node.js 22 и Docker.

```bash
npm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
npm run db:up            # Postgres на localhost:5434
npm run migration:run
npm run dev              # backend :4000, frontend :3000
```

Для соцвходов впишите ключи провайдеров в `apps/backend/.env`. Callback-адрес: `http://localhost:3000/api/auth/oauth/<provider>/callback`.

Полезные команды:

```bash
npm run api:generate         # обновить openapi.json и API-клиент фронта
npm run migration:generate   # миграция по изменениям сущностей
npm run typecheck
npm run lint
```
