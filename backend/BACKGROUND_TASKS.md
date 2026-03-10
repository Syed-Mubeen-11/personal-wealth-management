# Background Tasks & Automation Setup

This document explains how to set up and run the background task system for the Personal Wealth Management application.

## Overview

The application uses **Celery** with **Redis** as the message broker to handle background tasks, including:

- **Nightly Price Refresh**: Automatically updates `current_value` for all user investments every night at 1:00 AM UTC
- **Market Close Refresh**: Additional refresh at market close (4:30 PM EST / 9:30 PM UTC)
- **Manual Refresh Endpoints**: API endpoints to trigger price refreshes on-demand

## Prerequisites

1. **Redis Server** - Required as the Celery message broker
2. **Python dependencies** - Install via pip

```bash
pip install celery redis yfinance
```

## Setup Instructions

### 1. Install Redis

**Windows (using WSL or Docker):**
```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:latest

# Or using WSL
sudo apt install redis-server
sudo service redis-server start
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

### 2. Verify Redis is Running

```bash
redis-cli ping
# Should return: PONG
```

### 3. Run Database Migration

Before starting the Celery workers, run the migration to add the new price tracking columns:

```bash
cd backend
python migrations/add_price_columns.py
```

### 4. Start Celery Worker

In a separate terminal, start the Celery worker:

```bash
cd backend
celery -A app.core.celery_app worker --loglevel=info
```

**Windows note**: On Windows, you may need to use:
```bash
celery -A app.core.celery_app worker --loglevel=info --pool=solo
```

### 5. Start Celery Beat (Scheduler)

In another terminal, start Celery Beat for scheduled tasks:

```bash
cd backend
celery -A app.core.celery_app beat --loglevel=info
```

## API Endpoints

### Price Refresh Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/refresh/all` | POST | Trigger full price refresh for all assets |
| `/api/refresh/user` | POST | Refresh prices for current user's assets (requires auth) |
| `/api/refresh/asset/{asset_id}` | POST | Refresh a single asset (requires auth) |
| `/api/refresh/status/{task_id}` | GET | Check status of a refresh task |
| `/api/assets/prices` | GET | Get all user assets with cached prices (requires auth) |

### Example Usage

**Trigger full refresh:**
```bash
curl -X POST http://localhost:8000/api/refresh/all
```

**Response:**
```json
{
    "message": "Price refresh task started",
    "task_id": "abc123-def456",
    "status_url": "/api/refresh/status/abc123-def456"
}
```

**Check task status:**
```bash
curl http://localhost:8000/api/refresh/status/abc123-def456
```

**Response (when complete):**
```json
{
    "task_id": "abc123-def456",
    "state": "SUCCESS",
    "result": {
        "status": "success",
        "started_at": "2026-03-10T01:00:00",
        "completed_at": "2026-03-10T01:05:32",
        "duration_seconds": 332.5,
        "total_symbols": 50,
        "total_assets": 150,
        "assets_updated": 148,
        "failed_symbols": ["UNKNOWN1", "UNKNOWN2"]
    }
}
```

## Scheduled Tasks

The following tasks are scheduled automatically via Celery Beat:

| Task | Schedule | Description |
|------|----------|-------------|
| `nightly-price-refresh` | Daily at 1:00 AM UTC | Updates all asset prices |
| `market-close-refresh` | Daily at 9:30 PM UTC (4:30 PM EST) | Updates prices after market close |

### Modifying the Schedule

Edit `backend/app/core/celery_app.py` to modify the schedule:

```python
celery_app.conf.beat_schedule = {
    'nightly-price-refresh': {
        'task': 'app.services.tasks.refresh_all_asset_prices',
        'schedule': crontab(hour=1, minute=0),  # Change time here
    },
}
```

## Database Schema Updates

The following columns were added to the `assets` table:

| Column | Type | Description |
|--------|------|-------------|
| `current_value` | FLOAT | Current market value (quantity × last_price) |
| `last_price` | FLOAT | Last fetched price per unit |
| `last_price_at` | TIMESTAMP | When the price was last updated |

## Troubleshooting

### "Connection refused" error
- Ensure Redis is running: `redis-cli ping`
- Check Redis is on port 6379

### Tasks not executing
- Verify Celery worker is running
- Check worker logs for errors
- Ensure database connection is correct

### Price fetch failures
- yfinance has rate limits; tasks include delays
- Check symbol validity
- Network connectivity issues

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   FastAPI App   │────▶│      Redis      │◀────│  Celery Worker  │
│   (Producer)    │     │    (Broker)     │     │   (Consumer)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                              ┌─────────────────────────────────────┐
                              │  Tasks:                             │
                              │  • refresh_all_asset_prices         │
                              │  • refresh_user_assets              │
                              │  • refresh_asset_price              │
                              │  • run_simulation_task              │
                              └─────────────────────────────────────┘
                                                        │
                                                        ▼
                              ┌─────────────────────────────────────┐
                              │  Database (PostgreSQL/SQLite)       │
                              │  - Updates assets.current_value     │
                              │  - Updates assets.last_price        │
                              │  - Updates assets.last_price_at     │
                              └─────────────────────────────────────┘
```

## Running Everything (Development)

Open 4 terminal windows:

**Terminal 1 - Redis:**
```bash
redis-server
```

**Terminal 2 - FastAPI:**
```bash
cd backend
uvicorn main:app --reload
```

**Terminal 3 - Celery Worker:**
```bash
cd backend
celery -A app.core.celery_app worker --loglevel=info --pool=solo
```

**Terminal 4 - Celery Beat:**
```bash
cd backend
celery -A app.core.celery_app beat --loglevel=info
```
