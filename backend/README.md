# Backend

## Architecture

```
Routes → Controller → Service → Prisma → Database
```

## Run

```bash
npm run dev
```

Server runs on port 5000.

## Migrate

```bash
npx prisma migrate deploy
```

## API Routes

### Public API (`/api`)

#### Briefings (`/api/briefings`)
- `GET /` - List all briefings
- `GET /:briefingId` - Get briefing by ID

#### Watchlists (`/api/watchlists`)
- `GET /tickers` - Get all unique tickers

### Internal API (`/internal`) - Engine Only

#### Users (`/internal/users`)
- `GET /` - List all users
- `GET /:userId` - Get user by ID (includes all briefings and tickers)
- `GET /:userId/tickers` - Get user's tickers only (fast, no briefings)
- `POST /` - Create user
- `PATCH /:userId` - Update user
- `DELETE /:userId` - Delete user

#### Briefings (`/internal/briefings`)
- `GET /` - List all briefings
- `GET /user/:userId/latest` - Get user's latest briefing
- `GET /user/:userId` - Get all briefings for user
- `GET /:briefingId` - Get briefing by ID
- `POST /` - Create briefing
- `PATCH /:briefingId` - Update briefing
- `DELETE /:briefingId` - Delete briefing

#### Watchlists (`/internal/watchlists`)
- `GET /tickers` - Get all unique tickers
- `POST /users` - Get users by ticker (body: `{ticker}`)
- `POST /check` - Check if user has ticker (body: `{user_id, ticker}`)
- `POST /` - Add ticker to watchlist (body: `{user_id, ticker}`)
- `POST /list` - Get user's watchlist (body: `{user_id}`)
- `DELETE /` - Remove ticker from watchlist (body: `{user_id, ticker}`)

## Database Schema

### User
| Field | Type | Description |
|-------|------|-------------|
| `user_id` | String (PK) | 12-character unique identifier |
| `name` | String | User's display name |
| `ntfy_topic` | String | Topic for notifications |
| `created_at` | DateTime | Timestamp of creation |

### Briefing
| Field | Type | Description |
|-------|------|-------------|
| `briefing_id` | String (PK) | 12-character unique identifier |
| `user_id` | String (FK) | Reference to User |
| `full_summary` | String | Complete briefing summary |
| `short_summary` | String | Condensed briefing summary |
| `created_at` | DateTime | Timestamp of creation |

### Watchlist
| Field | Type | Description |
|-------|------|-------------|
| `watchlist_id` | String (PK) | 12-character unique identifier |
| `user_id` | String (FK) | Reference to User |
| `ticker` | String | Stock ticker symbol (e.g., "AAPL", "GOOGL") |
| `created_at` | DateTime | Timestamp of creation |

