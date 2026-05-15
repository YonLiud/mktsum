# mktsum
AI powered market summarization

# Frontend:

<!-- Omry put ur stuff here -->

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

## Services & Ports

| Service | Port |
|---------|------|
| Backend API | 5000 |
| PostgreSQL | internal only |

## Development Workflow

### Branching Strategy
- `main` — production-ready, merges only from `dev`
- `dev` — integration branch, merges from `feature/*` and `fix/*`
- `feature/*` — feature branches off `dev`
- `fix/*` — fix branches off `dev`

Always create a feature branch. Never commit directly to `main` or `dev`.

### Implementing a Feature

1. **Create feature branch**
   ```bash
   git checkout dev && git pull
   git checkout -b feature/your-feature
   ```

2. **Implement & commit** (small logical commits)
   ```bash
   git commit -m "feat: add login endpoint"
   ```
   Commit format: `feat:` (feature), `fix:` (bug), `refactor:`, `docs:`

3. **Test locally**
   - Backend: `bun test`
   - Start services: `docker compose up -d`
   - Hit endpoints manually or via tests
   - Don't push until it actually works

4. **Push & create PR** (especially for security-sensitive features like auth)
   ```bash
   git push origin feature/your-feature
   ```
   Create PR on GitHub, request review for auth/core features

5. **Merge to dev**
   ```bash
   git checkout dev && git pull
   git merge feature/your-feature
   git push origin dev
   ```

6. **Promote to main when stable**
   ```bash
   git checkout main && git pull
   git merge dev
   git push origin main
   ```

### PR Review
- **Auth, security changes**: always get reviewed
- **Other features**: can skip PR if confident, just test locally first
- Use `/review` command for Claude Code review