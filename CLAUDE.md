# mktsum

AI-powered market summarization service. Users maintain a watchlist of stock tickers and receive AI-generated briefings (full + short summaries) pushed via ntfy notifications. A custom engine runs on a daily cron schedule to fetch data, call the LLM, and post briefings back to the backend.

## Architecture

```
 ┌─────────┐    ┌─────────┐    ┌──────────┐
 │ engine  │──▶ │ backend │──▶ │ postgres │
 └─────────┘    └─────────┘    └──────────┘
                     │
                     └──▶ ntfy (push notifications)
```

- **backend** — REST API (Bun + Hono + Drizzle + PostgreSQL)
- **engine** — daily cron job (Bun); fetches RSS + Yahoo Finance quotes, calls LLM, posts briefings back to backend via `/internal/*`
- **frontend** — React SPA
- **postgres** — shared DB
- **nginx** — reverse proxy in front of backend on `mktsum.yxnliu.net`; blocks `/internal/*` from the public internet, only `/v1/*` is exposed. Listens on port 80 only — TLS is terminated by Cloudflare, not on the server.

Request flow inside backend: `Request → Middleware → Route → Controller → Service → DB`.

## Infra

- App dir on server: `/opt/mktsum`
- Persistent volumes: `/srv/mktsum_data/postgres` (prod), `/srv/mktsum_data/postgres_staging` (staging)
- Ports — prod: backend `5000`, notifier `3001`, frontend `4173`; staging: backend `5001`, notifier `3002`, frontend `4174`; postgres internal-only
- Swarm stack names: `mktsum` (prod), `mktsum-staging` (staging)
- Orchestration: Docker Swarm (single node); `docker-stack.yml` for prod, `docker-stack.staging.yml` for staging
- Engine runs as an ofelia `job-run` (fresh container per schedule, no idle container)

## Backend

### Stack
- Runtime: Bun
- Framework: Hono
- ORM: Drizzle (node-postgres driver)
- DB: PostgreSQL 16
- Validation: Zod
- IDs: 12-char nanoid (custom alphabet, URL-safe)
- External: `yahoo-finance2` for ticker metadata

### Layout
```
backend/
├── src/
│   ├── index.ts              # entrypoint; Bun.serve via Hono; error + notFound handlers
│   ├── app.ts                # (alternate app bootstrap, used by tests — cors + router)
│   ├── migrate.ts            # runs drizzle migrations at container start
│   ├── db/
│   │   ├── index.ts          # drizzle client
│   │   └── schema.ts         # tables + relations
│   ├── routes/
│   │   ├── index.ts          # mounts /v1 and /internal
│   │   ├── v1/               # public routes (auth, users, briefings, watchlist, tickers)
│   │   └── internal/         # engine-only routes (briefings, watchlist, tickers)
│   ├── controllers/          # parse request, call service, shape response
│   ├── services/             # business logic + DB access
│   ├── middleware/
│   │   └── auth.ts           # requireAuth, requireAdmin, optionalAuth
│   ├── validators/           # Zod schemas per resource
│   ├── lib/nanoid.ts         # id generator
│   └── tests/                # bun:test suites + helpers
└── drizzle/                  # generated SQL migrations
```

### Run
```bash
bun dev              # bun --watch src/index.ts, port 5000 (override via PORT)
bun test
bun db:generate      # generate migration SQL from schema
bun db:migrate       # apply migrations
bun db:studio        # drizzle-kit visual browser
```

Docker: migrations run on container start (`bun src/migrate.ts && bun src/index.ts`).

### Environment
```
DATABASE_URL=postgresql://user:pass@host:5432/db
PORT=5000
TEST_DATABASE_URL=postgresql://user:pass@host:5432/db_test
```

Bun auto-loads `.env`; no `dotenv` dep.

### Running tests locally

Tests require a running postgres instance and a `.env` file in `backend/` with both `DATABASE_URL` and `TEST_DATABASE_URL`. The test DB is created and migrated automatically on each run.

```bash
# 1. Start postgres (dev compose, postgres service only)
docker compose -f backend/docker-compose.dev.yml up -d postgres

# 2. Create backend/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mktsum
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mktsum_test

# 3. Run tests
cd backend && bun test
```

`bunfig.toml` configures bun to preload `src/tests/setup.ts` before each test run — this creates the test DB if missing, drops and recreates the schema, and runs all migrations fresh.

## Database schema

All primary keys are 12-char nanoids (text), except `tickers.symbol` which is the ticker itself. All timestamps default to `now()`.

### `users`
| Field | Type | Notes |
|---|---|---|
| `user_id` | text PK | nanoid |
| `username` | text UNIQUE | login credential |
| `name` | text | display name |
| `password_hash` | text | argon2 via `Bun.password` — never returned from service layer |
| `role` | text | `'user'` or `'admin'`, default `'user'` |
| `ntfy_topic` | text | notification channel |
| `created_at` | timestamp | |

### `sessions`
| Field | Type | Notes |
|---|---|---|
| `session_id` | text PK | nanoid — used as the bearer token |
| `user_id` | text FK → users | cascades on delete |
| `expires_at` | timestamp | 30-day TTL set at creation |
| `created_at` | timestamp | |

### `briefings`
| Field | Type | Notes |
|---|---|---|
| `briefing_id` | text PK | nanoid |
| `user_id` | text FK → users | |
| `subject` | text nullable | short title / email subject line generated by AI |
| `full_summary` | text | long-form markdown newsletter |
| `short_summary` | text | 2-sentence TL;DR |
| `sources` | jsonb nullable | `[{ ticker, title, url }]` |
| `notif_sent` | boolean | default false |
| `is_public` | boolean | default false; if true, accessible without auth (share link) |
| `created_at` | timestamp | |

### `watchlist`
| Field | Type | Notes |
|---|---|---|
| `watchlist_id` | text PK | nanoid |
| `user_id` | text FK → users | |
| `ticker` | text FK → tickers.symbol | |
| `created_at` | timestamp | |
| unique index | `(user_id, ticker)` | one ticker per user |

### `tickers`
| Field | Type | Notes |
|---|---|---|
| `symbol` | text PK | e.g. `AAPL` — always uppercased |
| `name` | text | from Yahoo Finance |
| `description` | text nullable | `longBusinessSummary` |
| `price` | real nullable | `regularMarketPrice` from Yahoo Finance; populated on create/refresh |
| `change_pct` | real nullable | `regularMarketChangePercent` from Yahoo Finance; populated on create/refresh |

## Auth

All `/v1` routes except `POST /v1/users` and `POST /v1/auth/login` require a valid session token in the `Authorization: Bearer <token>` header. Tokens are opaque nanoid strings stored in the `sessions` table (30-day TTL). Password hashing uses `Bun.password` (argon2).

Three middleware variants in `middleware/auth.ts`:
- `requireAuth` — valid session required; attaches `user` and `token` to Hono context
- `requireAdmin` — valid session + `role === 'admin'` required
- `optionalAuth` — attaches user if token present, passes through if not (used for share-link briefings)

Access matrix:
| Route | Access |
|---|---|
| `GET /v1/users` | admin only |
| `GET /v1/users/:id` | self or admin |
| `PATCH /v1/users/:id` | self only |
| `DELETE /v1/users/:id` | admin only |
| `GET /v1/briefings/:id` | public if `is_public`, else self or admin |
| all other briefing/watchlist routes | self only |

## API routes

Two surface areas, split at the router level:
- `/v1/*` — public (exposed via nginx)
- `/internal/*` — engine-only (403 at nginx)

### Public — `/v1`

#### `/v1/auth`
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/login` | `{ username, password }` | `{ token, user_id, username, name, role }` |
| POST | `/logout` | — (Bearer token) | `{ success: true }` |

#### `/v1/users`
| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| GET | `/` | admin | — | all users + their watchlist |
| GET | `/:id` | self or admin | — | user + briefings (`id, date, short`) + watchlist |
| POST | `/` | none (registration) | `{ username, name, password, ntfy_topic }` | created user |
| PATCH | `/:id` | self | `{ name?, ntfy_topic? }` | updated user |
| DELETE | `/:id` | admin | — | `{ success: true }` |

#### `/v1/briefings`
| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| GET | `/:id` | optional (public if `is_public`) | — | briefing |
| GET | `/user/:userId` | self or admin | — | all briefings for user |
| GET | `/user/:userId/latest` | self or admin | — | most recent briefing |
| POST | `/` | self | `{ user_id, full_summary, short_summary, sources? }` | created |
| DELETE | `/:id` | self | — | `{ success: true }` |

#### `/v1/watchlist`
| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| GET | `/user/:userId` | self | — | watchlist entries |
| POST | `/user/:userId` | self | `{ ticker }` or `{ tickers: [...] }` | single entry or array; auto-creates ticker via Yahoo if new |
| DELETE | `/:id` | self | — | `{ success: true }` |
| DELETE | `/user/:userId/ticker` | self | `{ ticker }` | `{ success: true }` |

#### `/v1/tickers`
| Method | Path | Auth | Returns |
|---|---|---|---|
| GET | `/:symbol` | none | ticker (404 if not cached) |

### Internal — `/internal` (engine only)

#### `/internal/briefings`
| Method | Path | Body |
|---|---|---|
| GET | `/pending` | unsent briefings (`notif_sent = false`) |
| POST | `/` | same as public create |
| POST | `/bulk` | array of briefings |
| PATCH | `/:id/sent` | mark `notif_sent = true` |

#### `/internal/watchlist`
| Method | Path | Returns |
|---|---|---|
| GET | `/tickers` | distinct tickers across all users (for engine fan-out) |

#### `/internal/tickers`
| Method | Path |
|---|---|
| GET | `/` — list all cached tickers |
| POST | `/:symbol/refresh` — refetch from Yahoo Finance |
| POST | `/refresh-all` — refresh all cached tickers |

#### `/internal/users`
| Method | Path | Returns |
|---|---|---|
| GET | `/` | all users with their watchlist tickers `[{ user_id, username, name, role, ntfy_topic, created_at, watchlist: [{ ticker }] }]` |
| GET | `/:id` | single user by id (same shape, 404 if not found) |

## Conventions

- **Layering**: routes are dumb wiring, controllers do parse+validate+respond, services own business logic and all DB access. Don't reach into drizzle from a controller.
- **Validation**: every `POST`/`PATCH` body goes through a Zod schema in `validators/`. `safeParse` + `400 { error: flatten() }` on failure.
- **Tickers are uppercased** at every boundary (validators `toUpperCase`, controller normalizes param).
- **IDs**: always generate via `generateId()` from `lib/nanoid.ts`. Don't use UUIDs.
- **Errors**: throw HTTPException from Hono, or return `c.json({ error }, status)`. Global `onError` in `index.ts` handles the rest.
- **DB**: use `db.query.*` for reads with relations, `db.select/insert/update/delete` for simple ops.
- **Auth**: apply middleware at the route level, not inside controllers. Ownership checks (self vs admin) happen in the controller using `c.get('user')`. Never return `password_hash` from any service method — strip it with `columns: { password_hash: false }` on reads or destructuring on writes.
- **Passwords**: always use `Bun.password.hash` / `Bun.password.verify` (argon2). Never roll a custom hashing scheme.

## Deployment

Production and staging both run on the same VPS under Docker Swarm. Images are built locally on the VPS then deployed via `docker stack deploy`.

```bash
# first-time swarm init (once per VPS)
docker swarm init

# deploy / update prod
git pull
docker compose build
docker stack deploy -c docker-stack.yml mktsum

# deploy / update staging
git pull
docker compose build
docker stack deploy -c docker-stack.staging.yml mktsum-staging
```

Swarm rolls updates with `start-first` order — new container passes healthcheck before old one is stopped. Failed deploys auto-rollback. Migrations run on every backend container start.

### Local dev

```bash
docker compose up -d --build   # uses docker-compose.yml, all services
```

## Branching

- `main` — production; merges only from `dev`
- `dev` — integration; merges from `feature/*`
- `feature/*` — off `dev`
- `fix/*` — off `dev`
- `infra/*` — off `dev`, for infrastructure changes (Docker, Swarm, CI/CD, nginx)

Commit prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `infra:`.