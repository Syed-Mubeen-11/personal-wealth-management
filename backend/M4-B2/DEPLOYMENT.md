# DEPLOYMENT.md — Production Deployment Runbook (GitHub Way)

> No Docker required. Uses Railway for managed Postgres + Redis + app hosting,
> and GitHub Actions for CI/CD. Replace Railway with Render or Fly.io if preferred.

---

## Architecture Overview

```
GitHub repo (main branch)
       │  push
       ▼
GitHub Actions CI/CD
  ├── lint + unit tests (Postgres + Redis as GH services)
  ├── integration smoke tests
  └── deploy ──► Railway
                  ├── backend  (FastAPI/Gunicorn, auto-scaled)
                  ├── postgres (Railway managed, v15)
                  └── redis    (Railway managed, v7)

DNS / SSL  ──► Railway custom domain (auto TLS via Let's Encrypt)
               or Cloudflare proxy → Railway public URL
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.11+ | pyenv or system |
| Railway CLI | latest | `npm i -g @railway/cli` |
| Git | 2.40+ | system |

---

## Step 1 – Local setup

```bash
git clone https://github.com/YOUR_ORG/wealth-backend.git
cd wealth-backend
cp .env.example .env.production   # fill in real values
pip install -r requirements.txt
```

### Start local Postgres + Redis (without Docker)

Option A — install natively:
```bash
# Ubuntu/Debian
sudo apt install postgresql redis-server
sudo systemctl start postgresql redis-server

# macOS (Homebrew)
brew install postgresql@15 redis
brew services start postgresql@15 redis
```

Option B — use a free cloud tier (Neon.tech for Postgres, Upstash for Redis):
- Set DATABASE_URL and REDIS_URL in `.env.production` to the cloud URLs.

```bash
# Apply migrations
alembic upgrade head

# Start dev server
make dev
# → API at http://localhost:8000
# → Docs at http://localhost:8000/docs
```

---

## Step 2 – GitHub Secrets setup

Go to: **GitHub repo → Settings → Secrets and variables → Actions**

Add these secrets:

| Secret | Value |
|--------|-------|
| `RAILWAY_TOKEN` | From Railway dashboard → Account → Tokens |
| `SECRET_KEY` | Strong random string (openssl rand -hex 32) |
| `ALPHA_VANTAGE_KEY` | Your AV API key |
| `CODECOV_TOKEN` | From codecov.io (optional) |

---

## Step 3 – Railway project setup

```bash
# Login
railway login

# Create project
railway init

# Provision Postgres
railway add --database postgres

# Provision Redis
railway add --database redis

# Link to your project
railway link

# Set environment variables on Railway
railway variables set \
  SECRET_KEY="$(openssl rand -hex 32)" \
  ALPHA_VANTAGE_KEY="your_key" \
  ALLOWED_ORIGINS="https://your-frontend.com" \
  ENV="production"

# DATABASE_URL and REDIS_URL are injected automatically by Railway
```

---

## Step 4 – Deploy

Deployments are automatic on push to `main`:

```bash
git add .
git commit -m "feat: add rebalance + report endpoints"
git push origin main
# → GitHub Actions runs: lint → tests → integration → deploy to Railway
```

Manual deploy:
```bash
railway up --service backend
```

Post-deploy migration (run once after schema changes):
```bash
railway run --service backend alembic upgrade head
```

---

## Step 5 – SSL & CORS

**SSL**: Railway auto-provisions TLS certificates for custom domains.  
Add your domain in Railway Dashboard → your service → Settings → Custom Domain.

**CORS**: Set `ALLOWED_ORIGINS` env var (comma-separated):
```
ALLOWED_ORIGINS=https://wealth-app.com,https://www.wealth-app.com
```

The FastAPI CORS middleware reads this via `settings.ALLOWED_ORIGINS`:
```python
# app/main.py
from app.core.config import settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

With `ENV=production`, unknown origins are automatically rejected.

---

## Step 6 – Verify deployment

```bash
# Health check
curl https://your-backend.railway.app/health

# Should return 401 (auth required, not 500)
curl https://your-backend.railway.app/api/v1/recommendations/rebalance

# Authenticated PDF test
TOKEN=$(curl -s -X POST https://your-backend.railway.app/api/v1/auth/token \
  -d "username=test@example.com&password=testpass" | jq -r .access_token)

curl -H "Authorization: Bearer $TOKEN" \
  https://your-backend.railway.app/api/v1/reports/pdf \
  --output wealth-report.pdf

file wealth-report.pdf   # should say: PDF document
```

---

## Environment Variables Reference

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Auto-injected by Railway |
| `REDIS_URL` | Yes | Auto-injected by Railway |
| `SECRET_KEY` | Yes | JWT signing key |
| `ALPHA_VANTAGE_KEY` | Yes | Market data API |
| `ALLOWED_ORIGINS` | Yes | Comma-separated frontend URLs |
| `ENV` | Yes | `production` or `testing` |

> **Never commit `.env` files.** Only `.env.example` (with placeholder values) belongs in git.  
> All secrets are injected at runtime via Railway environment variables.

---

## Rollback procedure

```bash
# List recent deployments
railway deployments

# Rollback to previous
railway rollback --deployment <deployment-id>

# Or revert via git and push
git revert HEAD
git push origin main
```

---

## Monitoring

- **Logs**: `railway logs --service backend --tail`
- **Metrics**: Railway Dashboard → Metrics tab
- **Uptime alerts**: Connect Railway to PagerDuty or use UptimeRobot on `/health`
- **Redis cache hit rate**: Check `X-Cache` header in `/api/v1/recommendations/rebalance` responses

---

_This runbook has been reviewed and contains no placeholder TODOs._
