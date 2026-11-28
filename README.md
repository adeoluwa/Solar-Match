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
| File storage| Filebase (S3-compatible) via AWS SDK v3 + `multer`       |
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

## Installer verification (`main-app`, prefix `/api/v1`)

Installers submit a **business profile** plus **verification documents** (PDF only, max 5 MB each) for manual admin review before earning a verified badge. Files are stored in Filebase; the DB keeps only the object key, and a short-lived **presigned URL** is minted on read. Allowed statuses/document types live in app-layer constants ([`installerVerification.js`](main-app/src/shared/constants/installerVerification.js)) — the columns are plain strings, not Postgres enums.

Status lifecycle: `pending → inReview → verified | rejected` (a rejected installer can fix documents and resubmit).

| Method | Path                                | Role      | Purpose                                    |
| ------ | ----------------------------------- | --------- | ------------------------------------------ |
| POST   | `/installers/profile`               | installer | Create or update the business profile      |
| GET    | `/installers/profile`               | installer | Own profile + documents (presigned URLs)   |
| POST   | `/installers/documents`             | installer | Upload PDFs (one field per document type)  |
| DELETE | `/installers/documents/:documentId` | installer | Remove a document                          |
| POST   | `/installers/submit`                | installer | Submit for review (needs required docs)    |
| GET    | `/admin/installers?status=inReview` | admin     | Review queue (filter by status)            |
| GET    | `/admin/installers/:id`             | admin     | One submission + applicant + documents     |
| PATCH  | `/admin/installers/:id/review`      | admin     | Approve or reject (with `rejectionReason`) |

**Required documents to submit:** government ID, proof of address, training certificate, evidence of previous projects — plus a CAC certificate when `isRegisteredBusiness` is `true`. Optional: TIN, professional membership, manufacturer authorisation, customer reference.

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

- **`main-app/.env`** — `DATABASE_URL` (Postgres), `JWT_SECRET`, `REDIS_URL`, `CLIENT_URL`, and for installer document uploads `FILEBASE_ACCESS_TOKEN` / `FILEBASE_SECRET_KEY` / `FILEBASE_BUCKET`
- **`email-service/.env`** — `DATABASE_URL`, `RESEND_API_KEY`, `INTERNAL_API_KEY`
- **`workers/.env`** — `REDIS_URL`, `EMAIL_SERVICE_URL`, `INTERNAL_API_KEY`

> `INTERNAL_API_KEY` must be **identical** in `email-service/.env` and `workers/.env`
> (both ship pre-filled with the same generated value, so they already match).
>
> Set `DATABASE_SSL=true` for hosted Postgres that requires SSL (Neon, Supabase, Render, Railway).
>
> Paste your **own** `RESEND_API_KEY` into `email-service/.env` — no live key is committed to this repo.

### 3. Run migrations

Creates the `main-app` tables (`users`, `installer_profiles`, `installer_documents`) and the `email-service` table (`email_logs`). Set `DATABASE_URL` in both services first:

```bash
npm run db:migrate --prefix main-app         # creates "users", "installer_profiles", "installer_documents"
npm run db:migrate --prefix email-service    # creates "email_logs"
```

Or both at once from root:

```bash
npm run db:migrate
```

**Inspect / roll back** (from root; each runs across both services, or add `--prefix main-app` for just one):

```bash
npm run db:migrate:status      # show which migrations have run
npm run db:migrate:undo        # roll back the most recent migration
npm run db:migrate:undo:all    # roll back every migration
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

## Contributing

Commit messages follow **Conventional Commits** — see [docs/COMMIT_CONVENTION.md](docs/COMMIT_CONVENTION.md)
(e.g. `feat: add admin seeding`, `fix(auth): enforce login role toggle`).
Branch off `development` and open pull requests into it, not `main`.

## Notes

- `main-app` and `email-service` use **separate** Postgres databases (set independently in each `.env`). They can share one instance using two database names.
- Swagger UI: `http://localhost:3000/api-docs` (main-app), `http://localhost:5001/api-docs` (email-service).
