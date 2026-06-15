# mktsum
AI powered market summarization

### Architecture

```mermaid
graph LR
    user(["user"])

    subgraph swarm["  Docker Swarm  "]
        nginx["nginx\nreverse proxy\nmktsum.yxnliu.net"]
        backend["backend\nHono · Drizzle\n/v1/*"]
        engine["engine\ndaily cron · Bun"]
        notifier["notifier\nntfy client"]
        pg[("postgres\nbriefings · users · tickers")]
    end

    subgraph ext["  external  "]
        direction LR
        rss["RSS feeds"]
        LLM["LLM API"]
        ntfy["ntfy"]
        rss ~~~ LLM ~~~ ntfy
    end

    user -->|"HTTPS"| nginx
    nginx -->|"/v1/*"| backend
    backend <--> pg
    engine -->|"fetch"| rss
    rss -->|"articles"| engine
    engine -->|"prompt"| LLM
    LLM -->|"summary"| engine
    engine -->|"writes briefings"| pg
    engine --> notifier
    notifier --> ntfy
    ntfy -->|"push"| user

    style swarm fill:transparent,stroke:#B4B2A9,stroke-dasharray:4 3
    style ext fill:transparent,stroke:#B4B2A9,stroke-dasharray:4 3

    classDef cgr fill:#F1EFE8,stroke:#888780,color:#2C2C2A
    classDef cpu fill:#EEEDFE,stroke:#534AB7,color:#26215C
    classDef cte fill:#E1F5EE,stroke:#0F6E56,color:#04342C
    classDef cam fill:#FAEEDA,stroke:#854F0B,color:#412402
    classDef cco fill:#FAECE7,stroke:#993C1D,color:#4A1B0C
    classDef cbl fill:#E6F1FB,stroke:#185FA5,color:#042C53

    class user cgr
    class nginx cpu
    class backend cte
    class engine cam
    class notifier,ntfy cco
    class pg cbl
    class rss,LLM cgr
```

# Frontend

React SPA with a sidebar layout. Supports light and dark mode. Communicates with the backend over `/v1/*` using session tokens. Fully responsive — adapts to mobile with a bottom tab bar and slide-up drawer.

## Mobile

On small screens the sidebar is replaced with a fixed bottom tab bar (dashboard, watchlist, more). Tapping "more" opens a slide-up drawer with secondary links (profile, notifications, dark mode, etc).

| Closed | Drawer open |
|--------|-------------|
| ![Mobile nav](images/mobile2.png) | ![Mobile drawer](images/mobile.png) |

## Screenshots

### Dashboard
The main view — shows today's AI-generated briefing with a short summary and source tickers, plus a history of past briefings.

| Light | Dark |
|-------|------|
| ![Dashboard light](images/home.jpg) | ![Dashboard dark](images/darktheme.jpg) |

### Watchlist
Manage the tickers included in your daily briefing. Add by symbol; the backend resolves the company name via Yahoo Finance. Up to 15 tickers per user.

![Watchlist](images/watchlist.jpg)

### Profile
Update your display name and ntfy topic. Toggle between light and dark mode. Manage active sessions.

| Light | Dark |
|-------|------|
| ![Profile light](images/profile.jpg) | ![Profile dark](images/profiledarktheme.jpg) |

### Notifications setup
Step-by-step guide for connecting your ntfy topic to receive daily briefings on your phone.

![Notifications](images/notifications.jpg)

### Legal
Links to Terms of Service, Privacy Policy, and Financial Disclaimer.

![Legal](images/legal.jpg)

# Backend:

## Services

- **backend** — REST API (Hono + Drizzle + PostgreSQL); exposed at `mktsum.yxnliu.net` via nginx
- **engine** — daily cron job (Bun); fetches RSS + Yahoo Finance quotes, calls LLM, posts briefings
- **nginx** — reverse proxy; exposes `/v1/*`, blocks `/internal/*`
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

For full backend documentation, API reference, and development workflow see [backend/README.md](backend/README.md).
