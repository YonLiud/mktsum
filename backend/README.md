# Backend

> [!NOTE]
> TODO: add relevant tickers in breifings


## Architecture
```
Request → Middleware → Route → Controller → Service → DB
```

## Stack

- **Runtime** — Bun
- **Framework** — Hono
- **ORM** — Drizzle
- **Database** — PostgreSQL

## Run
```bash
bun dev
```

Server runs on port 5000 (configurable via `PORT` in `.env`).

## Migrations

Migrations run automatically on every container start via `src/migrate.ts`.

### Dev workflow (no bun on host — all commands run inside the container)

```bash
# 1. Start the dev stack
docker compose -f docker-compose.dev.yml up -d --build

# 2. After editing src/db/schema.ts, generate the migration
#    The ./drizzle folder is volume-mounted, so the .sql file lands on your disk
docker exec backend-backend-1 bun run db:generate

# 3. Rebuild — the new migration is baked in and applied on start
docker compose -f docker-compose.dev.yml up -d --build
```

Commit both `schema.ts` and the generated `drizzle/*.sql` file.

### Prod

```bash
# Migrations apply automatically on deploy
git pull && docker compose up -d --build
```

### Other commands

```bash
# Run inside the container
docker exec backend-backend-1 bun run db:studio   # Drizzle visual browser
```

## Environment Variables
```
DATABASE_URL=postgresql://user:pass@host:5432/db
PORT=5000
TEST_DATABASE_URL=postgresql://user:pass@host:5432/db_test
```

## Auth

All `/v1` routes except `POST /v1/users` and `POST /v1/auth/login` require a valid session token:

```
Authorization: Bearer <token>
```

Tokens are returned by `POST /v1/auth/login` and stored in the `sessions` table (30-day TTL). Passwords are hashed with argon2 via `Bun.password`.

## Testing

Tests require a running postgres instance and a `backend/.env` file.

```bash
# 1. Start postgres
docker compose -f docker-compose.dev.yml up -d postgres

# 2. Create .env
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mktsum" >> .env
echo "TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mktsum_test" >> .env

# 3. Run tests
bun test
```

The test DB is created, schema-reset, and migrated automatically on each run via `src/tests/setup.ts` (preloaded by `bunfig.toml`).

## API Routes

### Auth (`/v1/auth`)
- `POST /login` - Login (body: `{ username, password }`) → `{ token, user_id, username, name, role }`
- `POST /logout` - Logout (Bearer token required)

### Public API (`/v1`)

All routes below require `Authorization: Bearer <token>` unless noted.

#### Users (`/v1/users`)
- `GET /` - List all users — **admin only**
- `GET /:id` - Get user by ID (briefings + watchlist) — self or admin
- `POST /` - Register (body: `{ username, name, password, ntfy_topic }`) — **no auth**
- `PATCH /:id` - Update user (body: `{ name?, ntfy_topic? }`) — self only
- `DELETE /:id` - Delete user — **admin only**

#### Briefings (`/v1/briefings`)
- `GET /:id` - Get briefing — public if `is_public`, otherwise self or admin
- `GET /user/:userId` - Get all briefings for user — self or admin
- `GET /user/:userId/latest` - Get latest briefing — self or admin
- `POST /` - Create briefing (body: `{ user_id, full_summary, short_summary, sources? }`)
- `PATCH /:id/public` - Set `is_public` (body: `{ is_public: boolean }`) — owner only
- `DELETE /:id` - Delete briefing

#### Watchlist (`/v1/watchlist`)
- `GET /user/:userId` - Get user's watchlist — self only
- `POST /user/:userId` - Add ticker(s) (body: `{ ticker }` or `{ tickers: [] }`) — self only; auto-creates ticker via Yahoo Finance
- `DELETE /:id` - Remove watchlist entry by ID
- `DELETE /user/:userId/ticker` - Remove ticker by name (body: `{ ticker }`) — self only

#### Tickers (`/v1/tickers`)
- `GET /:symbol` - Get ticker by symbol — **no auth**

### Internal API (`/internal`) - Engine Only

#### Briefings (`/internal/briefings`)
- `GET /pending` - Get all unsent briefings
- `POST /` - Create single briefing (body: `{ user_id, full_summary, short_summary, sources? }`)
- `POST /bulk` - Bulk create briefings (body: array of briefings)
- `PATCH /:id/sent` - Mark briefing as sent

#### Watchlist (`/internal/watchlist`)
- `GET /tickers` - Get all unique tickers across all users

#### Tickers (`/internal/tickers`)
- `GET /` - List all cached tickers
- `POST /:symbol/refresh` - Refresh ticker from Yahoo Finance
- `POST /refresh-all` - Refresh all tickers from Yahoo Finance

## Database Schema

### Users
| Field | Type | Description |
|-------|------|-------------|
| `user_id` | String (PK) | 12-character nanoid |
| `username` | String (UNIQUE) | Login credential |
| `name` | String | Display name |
| `password_hash` | String | argon2 hash — never returned by API |
| `role` | String | `user` or `admin` (default: `user`) |
| `ntfy_topic` | String | ntfy notification channel |
| `created_at` | DateTime | |

### Sessions
| Field | Type | Description |
|-------|------|-------------|
| `session_id` | String (PK) | nanoid — used as the bearer token |
| `user_id` | String (FK) | Reference to User, cascades on delete |
| `expires_at` | DateTime | 30-day TTL from creation |
| `created_at` | DateTime | |

### Briefings
| Field | Type | Description |
|-------|------|-------------|
| `briefing_id` | String (PK) | 12-character nanoid |
| `user_id` | String (FK) | Reference to User |
| `full_summary` | String | Complete briefing summary |
| `short_summary` | String | Condensed briefing summary |
| `sources` | JSONB (optional) | `[{ ticker, title, url }]` |
| `notif_sent` | Boolean | Whether notification has been sent (default: false) |
| `is_public` | Boolean | If true, accessible without auth via share link (default: false) |
| `created_at` | DateTime | |

### Watchlist
| Field | Type | Description |
|-------|------|-------------|
| `watchlist_id` | String (PK) | 12-character nanoid |
| `user_id` | String (FK) | Reference to User |
| `ticker` | String (FK) | Reference to Ticker symbol — unique per user |
| `created_at` | DateTime | |

### Tickers
| Field | Type | Description |
|-------|------|-------------|
| `symbol` | String (PK) | Ticker symbol (e.g., `AAPL`) — always uppercased |
| `name` | String | Company name from Yahoo Finance |
| `description` | String (optional) | `longBusinessSummary` from Yahoo Finance |
