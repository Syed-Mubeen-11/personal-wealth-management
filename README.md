# Personalized Wealth Management & Goal Tracker

## Quick Start Guide for Team Members

This guide helps you set up and run the project on your local machine.

---

## Prerequisites

Make sure you have the following installed:

| Software | Version | Download Link |
|----------|---------|---------------|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.10+ | https://python.org |
| PostgreSQL | 13+ | https://postgresql.org |
| Redis | 6+ | https://redis.io |
| Git | Latest | https://git-scm.com |

### Verify Installation
```bash
node -v
npm -v
python --version
git --version
```

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd personal-wealth-management
```

### Step 2: Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and edit with your credentials
cp .env.example .env
# Edit .env with your PostgreSQL password and settings
```

### Step 3: Database Setup
```bash
# Open PostgreSQL and create database
psql -U postgres
CREATE DATABASE wealth_db;
\q

# Run database migrations (from backend folder)
python migrations/add_price_columns.py
python migrations/create_simulations_table.py
```

### Step 4: Frontend Setup
```bash
# Navigate to frontend (from root or backend folder)
cd ../frontend
# OR from root: cd frontend

# Install dependencies
npm install
```

### Step 5: Start the Application

**Terminal 1 - Backend API:**
```bash
cd backend
venv\Scripts\activate  # Windows
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Access the Application:**
- Frontend: http://localhost:3000
- Backend API Docs: http://localhost:8000/docs

---

## 🔧 Background Tasks Setup (Optional - For Milestone 3)

If you need to run background tasks (price refresh, simulations):

### Start Redis
```bash
# Using Docker (recommended)
docker run -d -p 6379:6379 --name redis redis:latest

# Or install Redis locally and run:
redis-server
```

### Start Celery Worker
```bash
cd backend
venv\Scripts\activate

# Windows:
celery -A app.core.celery_app worker --loglevel=info --pool=solo

# Mac/Linux:
celery -A app.core.celery_app worker --loglevel=info
```

### Start Celery Beat (Scheduler)
```bash
cd backend
celery -A app.core.celery_app beat --loglevel=info
```

---

## 📁 Project Structure

```
personal-wealth-management/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── celery_app.py      # Celery configuration
│   │   └── services/
│   │       └── tasks.py           # Background tasks
│   ├── migrations/                 # Database migrations
│   ├── main.py                    # FastAPI app & endpoints
│   ├── models.py                  # SQLAlchemy models
│   ├── schemas.py                 # Pydantic schemas
│   ├── database.py                # Database connection
│   ├── auth.py                    # Authentication
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Environment template
│   └── BACKGROUND_TASKS.md        # Background tasks guide
│
└── frontend/
    ├── src/
    │   ├── components/            # React components
    │   ├── pages/                 # Page components
    │   └── api.js                 # API calls
    └── package.json               # Node dependencies
```

---

## 🌐 API Endpoints Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login user |

### Portfolio & Assets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/portfolio` | Get user portfolio |
| GET | `/portfolio/overview` | Get portfolio summary |
| **POST | `/api/market-refresh`** | **Refresh all asset prices from live market data (BE Dev 1)** |
| POST | `/assets` | Add new asset |
| POST | `/transactions` | Create transaction |


### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/goals` | List all goals |
| POST | `/goals` | Create new goal |
| PUT | `/goals/{id}` | Update goal |
| DELETE | `/goals/{id}` | Delete goal |

### Simulations (Milestone 3)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/simulations/sip` | Run SIP simulation |
| POST | `/api/simulations/retirement` | Run retirement simulation |
| POST | `/api/simulations/loan` | Run loan payoff simulation |
| POST | `/api/simulations/goal` | Run goal projection |
| POST | `/api/simulations/calculate/*` | Calculate without saving |
| GET | `/api/simulations` | List saved simulations |

### Background Tasks (Milestone 3)
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST | `/api/market-refresh`** | **✅ LIVE: Updates assets.current_value, last_price, last_price_at** |
| POST | `/api/refresh/all` | Refresh all asset prices |
| POST | `/api/refresh/user` | Refresh user's assets |
| GET | `/api/refresh/status/{task_id}` | Check task status |

---

## ⚠️ Troubleshooting

### Backend won't start
```bash
# Make sure virtual environment is activated
venv\Scripts\activate  # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Database connection error
1. Check PostgreSQL is running
2. Verify `.env` file has correct DATABASE_URL
3. Make sure database `wealth_db` exists

### Frontend won't start
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
```

### Redis connection error
- Make sure Redis server is running on port 6379
- Check REDIS_URL in `.env`

---

## 📋 Environment Variables

Create `.env` file in `backend/` folder:

```env
# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/wealth_db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis (for background tasks)
REDIS_URL=redis://localhost:6379/0

# Alpha Vantage (API Key)
ALPHA_VANTAGE_KEY=9D7A2V8CVVLJV4WT
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Auth | JWT Tokens |
| Background Tasks | Celery + Redis |
| Market Data | yfinance |

---

## 👥 Team Development

### Before pushing code:
1. Make sure all tests pass
2. Don't commit `.env` file (it's in `.gitignore`)
3. Update `requirements.txt` if you add new Python packages
4. Update `package.json` if you add new npm packages

### After pulling new code:
```bash
# Backend - install any new dependencies
cd backend
pip install -r requirements.txt

# Frontend - install any new dependencies  
cd frontend
npm install

# Run any new migrations
cd backend
python migrations/add_price_columns.py
python migrations/create_simulations_table.py
```

---

## Need Help?

- Check the [BACKGROUND_TASKS.md](backend/BACKGROUND_TASKS.md) for detailed Celery setup
- Backend API documentation: http://localhost:8000/docs
- Open an issue in the repository if you encounter problems
