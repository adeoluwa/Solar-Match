# Solar Capstone — Backend

A **modular monolith** with two supporting services, built for user authentication.

- **`main-app/`** — the core Express app. Owns the `users` data and exposes auth endpoints: register, login, forgot-password, reset-password. Enqueues background email jobs.
- **`email-service/`** — standalone transactional-email service. Renders templates, sends via [Resend](https://resend.com), and records every send in an `email_logs` table for idempotency.
- **`workers/`** — standalone background worker. Consumes the BullMQ `email` queue and bridges it to the email service over HTTP, so `main-app` never calls `email-service` directly.

```
┌──────────────┐  enqueue job   ┌─────────┐   consume    ┌───────────┐  POST /email/send   ┌───────────────┐
│   main-app   │ ─────────────▶ │  Redis  │ ───────────▶ │  worker   │ ──────────────────▶ │ email-service │ ──▶ Resend
│  (users)     │   (BullMQ)     │  queue  │              │           │   (x-api-key)       │ (email_logs)  │
└──────────────┘                └─────────┘              └───────────┘                     └───────────────┘
```
 
## Stack

| Area        | Choice                                                   |
| ----------- | -------------------------------------------------------- |
| Runtime     | Node.js 20+ (CommonJS)                                   |
| Framework   | Express 5                                                |
| Database    | **PostgreSQL** via **Sequelize** ORM (model validation)  |
| Validation  | Joi (requests) + Sequelize (model/DB layer)              |
| Auth        | JWT (`jsonwebtoken`) + `bcryptjs`                        |
| Background  | BullMQ + Redis (`ioredis`)                               |
| Email       | Resend                                                   |
| API docs    | Swagger / OpenAPI 3 (`/api-docs`)                        |
| Tests       | Jest + Supertest                                         |

## Roles

Three roles, one `users` table:

- **`admin`** — seeded (`npm run db:seed`), never self-registered.
- **`customer`** and **`installer`** — share one register/login screen with a toggle that sets `role`.

Email is **globally unique** (one account per email). Login enforces the toggle: wrong password → `401`; correct password but wrong role → `403` telling the user which login to use.

## Auth endpoints (`main-app`, prefix `/api/v1`)

| Method | Path                     | Purpose                                  |
| ------ | ------------------------ | ---------------------------------------- |
| POST   | `/users/register`        | Create a customer/installer account, queue a welcome email |
| POST   | `/users/login`           | Return a JWT (`role` must match account) |
| POST   | `/users/forgot-password` | Email a single-use reset link (15 min)   |
| POST   | `/users/reset-password`  | Set a new password with the token        |

**Register body:** `fullName`, `email`, `phone` (Nigerian format), `location` (one field, `"State / LGA"` e.g. `"Lagos / Ikeja"` — split into `state` + `lga` server-side), `password` (min 8), `confirmPassword`, `role` (`customer`\|`installer`).

**Login body:** `email`, `password`, `role` (`customer`\|`installer`).

> **Prerequisites:** Node.js 20+, a PostgreSQL database, and a running Redis
> (e.g. `docker run -p 6379:6379 redis`).

### 1. Install dependencies

From the repo root:

```bash
npm install                            # root (concurrently)
npm install --prefix main-app
npm install --prefix email-service
npm install --prefix workers
```

Or the shortcut:

```bash
npm run install:all
```

### 2. Configure env

Copy each `.env.example` to `.env` and fill in the blanks:

- **`main-app/.env`** — `DATABASE_URL` (Postgres), `JWT_SECRET`, `REDIS_URL`, `CLIENT_URL`
- **`email-service/.env`** — `DATABASE_URL`, `RESEND_API_KEY`, `INTERNAL_API_KEY`
- **`workers/.env`** — `REDIS_URL`, `EMAIL_SERVICE_URL`, `INTERNAL_API_KEY`

> `INTERNAL_API_KEY` must be **identical** in `email-service/.env` and `workers/.env`
> (both ship pre-filled with the same generated value, so they already match).
>
> Set `DATABASE_SSL=true` for hosted Postgres that requires SSL (Neon, Supabase, Render, Railway).
>
> Paste your **own** `RESEND_API_KEY` into `email-service/.env` — no live key is committed to this repo.

### 3. Run migrations

Creates the `users` and `email_logs` tables (set `DATABASE_URL` in both services first):

```bash
npm run db:migrate --prefix main-app         # creates "users"
npm run db:migrate --prefix email-service    # creates "email_logs"
```

Or both at once from root:

```bash
npm run db:migrate
```

Then seed the admin account (reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_FULLNAME` from `main-app/.env`):

```bash
npm run db:seed --prefix main-app
```

### 4. Run all three services

```bash
npm run dev     # starts main-app, email-service and workers together
```

### 5. Verify

```bash
npm test        # runs all three test suites
```

Swagger UI: `http://localhost:3000/api-docs` (main-app) · `http://localhost:5001/api-docs` (email-service).

## Tests

Run the whole suite from the root:

```bash
npm test
```

Or one service at a time, e.g. `npm test --prefix main-app`.

## Notes

- `main-app` and `email-service` use **separate** Postgres databases (set independently in each `.env`). They can share one instance using two database names.
- Swagger UI: `http://localhost:3000/api-docs` (main-app), `http://localhost:5001/api-docs` (email-service).
