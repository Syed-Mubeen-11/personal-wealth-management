# Deployment Runbook – Personal Wealth Management

This document describes how to deploy the full stack (FastAPI backend, React frontend, PostgreSQL, Redis) on a Linux VM using Docker Compose.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Docker Engine | ≥ 24.x |
| Docker Compose v2 | ≥ 2.20 |
| Git | any recent |

Install Docker on Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER   # allow non-root usage (re-login required)
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/Springboard-Mentor/personal-wealth-management.git
cd personal-wealth-management
git checkout team-three
```

---

## 2. Configure Environment Variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set **at minimum**:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | `postgresql://postgres:<pw>@db:5432/personal_wealth_management` — use `db` as host when running in Docker |
| `SECRET_KEY` | Yes | Generate with `openssl rand -hex 32` |
| `POSTGRES_PASSWORD` | Yes | Must match the password in `DATABASE_URL` |
| `REDIS_URL` | Yes | `redis://redis:6379/0` for Docker |
| `ALGORITHM` | No | Default `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Default `30` |
| `ALPHA_VANTAGE_KEY` | No | Optional market-data key |

> **Security:** Never commit `.env` to version control. The file is already in `.gitignore`.

---

## 3. Build & Start

```bash
# Build images and start all containers
docker compose up -d --build

# Verify everything is running
docker compose ps
```

Expected containers:

| Service | Port | Health |
|---------|------|--------|
| `db` | 5432 | `pg_isready` |
| `redis` | 6379 | `redis-cli ping` |
| `backend` | 8000 | `GET /` → 200 |
| `celery-worker` | — | Celery heartbeat |
| `frontend` | 3000 | Vite dev server |

---

## 4. Run Database Migrations

Tables are auto-created on first backend startup via `models.Base.metadata.create_all(bind=engine)`. If you need to force-recreate:

```bash
docker compose exec backend python -c \
  "import models; from database import engine; models.Base.metadata.create_all(bind=engine)"
```

Or use the Makefile shortcut:

```bash
make migrate
```

---

## 5. Verify the Deployment

```bash
# Backend health
curl http://localhost:8000/

# Frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/

# Redis
docker compose exec redis redis-cli ping
```

---

## 6. Common Operations

```bash
# View logs
docker compose logs -f backend

# Restart a single service
docker compose restart backend

# Open a psql shell
docker compose exec db psql -U postgres -d personal_wealth_management

# Stop everything
docker compose down

# Stop and wipe volumes (full reset)
docker compose down -v
```

---

## 7. Production Hardening Checklist

- [ ] Set a strong, unique `SECRET_KEY`
- [ ] Set a strong `POSTGRES_PASSWORD`
- [ ] Switch frontend from Vite dev-server to a production build behind Nginx
- [ ] Enable HTTPS (e.g., Caddy or Nginx + Let's Encrypt)
- [ ] Restrict CORS origins in `backend/main.py` to your domain
- [ ] Set up a firewall (UFW) allowing only ports 80/443
- [ ] Configure log rotation (`docker compose` or systemd)
- [ ] Add a backup cron for PostgreSQL (`pg_dump`)
- [ ] Pin Docker image tags (avoid `latest` in production)

---

## 8. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `backend` exits immediately | Check `docker compose logs backend` — likely missing `.env` or bad `DATABASE_URL` |
| `db` won't start | Port 5432 may be in use by a local PostgreSQL. Stop it or remap the port |
| `redis` connection refused | Ensure `REDIS_URL` uses hostname `redis` (not `localhost`) inside Docker |
| Frontend can't reach backend | Verify `VITE_API_URL` or `api.js` base URL points to `http://backend:8000` (or host IP) |
| Celery tasks stuck | Check `docker compose logs celery-worker` and ensure Redis is healthy |
