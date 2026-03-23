# mktsum
AI powered market summarization

# Frontend:

<!-- Omry put ur stuff here -->

# Backend:

## Services

- **backend** — REST API (Hono + Drizzle + PostgreSQL)
- **n8n** — automation engine for data fetching and notifications
- **postgres** — shared database

## Infrastructure

- App: `/opt/mktsum`
- Persistent data: `/srv/mktsum_data`

## First time setup
```bash
bash scripts/setup.sh
cp .env.example .env
nano .env  # fill in values
docker compose up -d --build
```

## Deploy
```bash
git pull
docker compose up -d --build
```

## Services & Ports

| Service | Port |
|---------|------|
| Backend API | 5000 |
| n8n | 5678 |
| PostgreSQL | internal only |