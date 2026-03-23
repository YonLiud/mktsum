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

Server runs on port 3000 (configurable via `PORT` in `.env`).

## Migrations
```bash
bun db:generate   # generate migration files from schema
bun db:migrate    # run migrations against the DB
bun db:studio     # open Drizzle visual DB browser
```

## Environment Variables
```
DATABASE_URL=
PORT=3000
```

## API Routes

### Public API (`/v1`)

#### Users (`/v1/users`)
- `GET /` - List all users
- `GET /:id` - Get user by ID (includes briefings and watchlist)
- `POST /` - Create user
- `PATCH /:id` - Update user
- `DELETE /:id` - Delete user

#### Briefings (`/v1/briefings`)
- `GET /user/:userId` - Get all briefings for user
- `GET /user/:userId/latest` - Get user's latest briefing
- `POST /` - Create briefing
- `DELETE /:id` - Delete briefing

#### Watchlist (`/v1/watchlist`)
- `GET /user/:userId` - Get user's watchlist
- `POST /user/:userId` - Add ticker to watchlist (body: `{ ticker }`)
- `DELETE /:id` - Remove watchlist entry by ID
- `DELETE /user/:userId/ticker` - Remove ticker by name (body: `{ ticker }`)

### Internal API (`/internal`) - Engine Only

#### Users (`/internal/users`)
- `GET /` - List all users
- `GET /:id` - Get user by ID
- `POST /` - Create user
- `PATCH /:id` - Update user
- `DELETE /:id` - Delete user

#### Briefings (`/internal/briefings`)
- `GET /pending` - Get all unsent briefings
- `POST /bulk` - Bulk create briefings
- `PATCH /:id/sent` - Mark briefing as sent

#### Watchlist (`/internal/watchlist`)
- `GET /tickers` - Get all unique tickers across all users

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
| `sources` | String[] (optional) | Sources used for the briefing |
| `notif_sent` | Boolean | Whether notification has been sent (default: false) |
| `created_at` | DateTime | Timestamp of creation |

### Watchlist
| Field | Type | Description |
|-------|------|-------------|
| `watchlist_id` | String (PK) | 12-character nanoid |
| `user_id` | String (FK) | Reference to User |
| `ticker` | String | Stock ticker symbol (e.g., "AAPL", "GOOGL") |
| `created_at` | DateTime | Timestamp of creation |