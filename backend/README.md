# Backend

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
```bash
bun db:generate   # generate migration files from schema
bun db:migrate    # run migrations against the DB
bun db:studio     # open Drizzle visual DB browser
```

> Note: migrations run automatically on container startup in Docker.

## Environment Variables
```
DATABASE_URL=
PORT=5000
TEST_DATABASE_URL=
```

## API Routes

### Public API (`/v1`)

#### Users (`/v1/users`)
- `GET /` - List all users with their watchlist
- `GET /:id` - Get user by ID (includes briefings and watchlist)
- `POST /` - Create user (body: `{ name, ntfy_topic }`)
- `PATCH /:id` - Update user (body: `{ name?, ntfy_topic? }`)
- `DELETE /:id` - Delete user

#### Briefings (`/v1/briefings`)
- `GET /:id` - Get briefing by ID
- `GET /user/:userId` - Get all briefings for user
- `GET /user/:userId/latest` - Get user's latest briefing
- `POST /` - Create briefing (body: `{ user_id, full_summary, short_summary, sources? }`)
- `DELETE /:id` - Delete briefing

#### Watchlist (`/v1/watchlist`)
- `GET /user/:userId` - Get user's watchlist
- `POST /user/:userId` - Add ticker (body: `{ ticker }`) — creates ticker via Yahoo Finance if not cached
- `DELETE /:id` - Remove watchlist entry by ID
- `DELETE /user/:userId/ticker` - Remove ticker by name (body: `{ ticker }`)

#### Tickers (`/v1/tickers`)
- `GET /:symbol` - Get ticker by symbol
- `POST /:symbol/refresh` - Refresh ticker name from Yahoo Finance
- `POST /refresh-all` - Refresh all tickers from Yahoo Finance

### Internal API (`/internal`) - Engine Only

#### Users (`/internal/users`)


#### Briefings (`/internal/briefings`)
- `GET /pending` - Get all unsent briefings
- `POST /` - Create single briefing (body: `{ user_id, full_summary, short_summary, sources? }`)
- `POST /bulk` - Bulk create briefings (body: array of briefings)
- `PATCH /:id/sent` - Mark briefing as sent

#### Watchlist (`/internal/watchlist`)
- `GET /tickers` - Get all unique tickers across all users

#### Tickers (`/internal/tickers`)
- `GET /` - List all cached tickers

## Database Schema

### User
| Field | Type | Description |
|-------|------|-------------|
| `user_id` | String (PK) | 12-character nanoid |
| `name` | String | User's display name |
| `ntfy_topic` | String | Topic for notifications |
| `created_at` | DateTime | Timestamp of creation |

### Briefing
| Field | Type | Description |
|-------|------|-------------|
| `briefing_id` | String (PK) | 12-character nanoid |
| `user_id` | String (FK) | Reference to User |
| `full_summary` | String | Complete briefing summary |
| `short_summary` | String | Condensed briefing summary |
| `sources` | JSONB (optional) | Sources used for the briefing `[{ ticker, title, url }]` |
| `notif_sent` | Boolean | Whether notification has been sent (default: false) |
| `created_at` | DateTime | Timestamp of creation |

### Watchlist
| Field | Type | Description |
|-------|------|-------------|
| `watchlist_id` | String (PK) | 12-character nanoid |
| `user_id` | String (FK) | Reference to User |
| `ticker` | String (FK) | Reference to Ticker symbol — unique per user |
| `created_at` | DateTime | Timestamp of creation |

### Ticker
| Field | Type | Description |
|-------|------|-------------|
| `symbol` | String (PK) | Ticker symbol (e.g., "AAPL", "NVDA") |
| `name` | String | Company name from Yahoo Finance |
| `description` | String (optional) | Additional description |