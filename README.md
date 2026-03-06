<<<<<<< HEAD
# Personalized Wealth Management & Goal Tracker

## Beginner-Friendly Intern Starter Guide

Welcome to the project!

This guide is written for interns who may have:
- Zero finance knowledge
- Zero full-stack experience
- Never worked with React or FastAPI before

Everything is explained in simple language.

---

# 1. What Is This Project?

This is a web application where users can:

- Set financial goals (retirement, home, education, etc.)
- Invest in assets (stocks, ETFs, mutual funds)
- Track investment growth
- See live market prices
- Run simulations (what if I invest more?)
- Get portfolio recommendations

In simple terms:

User -> Website -> Backend -> Database -> Results shown on screen

---

# 2. Tech Stack (What We Are Using)

Frontend:
- React.js
- Tailwind CSS

Backend:
- FastAPI (Python)

Database:
- PostgreSQL

Authentication:
- JWT (secure login tokens)

Background Tasks:
- Celery + Redis

Market Data:
- Alpha Vantage or Yahoo Finance APIs

---

# 3. Required Software (Install First)

Install these before starting:

1. Node.js  
   Download: https://nodejs.org  
   Check:
   node -v
   npm -v

2. Python 3.10+  
   Download: https://python.org  
   Check:
   python --version

3. PostgreSQL  
   Download: https://postgresql.org  
   Remember your username and password.

4. Redis  
   Download: https://redis.io/download  

5. Git  
   Download: https://git-scm.com  
   Check:
   git --version

---

# 4. Clone the Project

git clone <repository-url>
cd wealth-management-app

Project structure should look like:

wealth-management-app/
    backend/
    frontend/

---

# 5. Backend Setup (FastAPI)

Go to backend folder:

cd backend

---

## Step 1: Create Virtual Environment

python -m venv venv

Activate:

Windows:
venv\Scripts\activate

Mac/Linux:
source venv/bin/activate

---

## Step 2: Install Dependencies

If requirements.txt exists:

pip install -r requirements.txt

If not:

pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose passlib[bcrypt] python-dotenv celery redis

---

## Step 3: Create Database

Open PostgreSQL:

psql -U postgres

Create database:

CREATE DATABASE wealth_db;

Exit:

\q

---

## Step 4: Create .env File

Inside backend folder, create a file named:

.env

Add this:

DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/wealth_db
SECRET_KEY=supersecretkey
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379/0

Replace "yourpassword" with your PostgreSQL password.

---

## Step 5: Run Backend

uvicorn main:app --reload

Open in browser:

http://127.0.0.1:8000/docs

If Swagger page opens, backend is working.

---

# 6. Frontend Setup (React)

Go to frontend folder:

cd ../frontend

Install dependencies:

npm install

If React app is not initialized:

npx create-react-app .
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

Run frontend:

npm start

Open:

http://localhost:3000

If page loads, frontend is working.

---

# 7. How System Works Together

Flow:

Browser (User)
    ->
React Frontend
    ->
FastAPI Backend
    ->
PostgreSQL Database
    ->
Response back to User

Frontend sends request.
Backend processes logic.
Database stores data.
Backend returns response.
Frontend displays result.

---

# 8. Database Tables Overview

Users
- id
- name
- email
- password
- risk_profile (conservative/moderate/aggressive)
- kyc_status
- created_at

Goals
- id
- user_id
- goal_type
- target_amount
- target_date
- monthly_contribution
- status

Investments
- id
- user_id
- asset_type
- symbol
- units
- avg_buy_price
- cost_basis
- current_value

Transactions
- id
- user_id
- symbol
- type (buy/sell/dividend/etc.)
- quantity
- price
- fees

Recommendations
- user_id
- recommendation_text
- suggested_allocation

Simulations
- goal_id
- assumptions (JSON)
- results (JSON)

---

# 9. Modules You Will Build

Module A: User Management
- Register
- Login
- JWT authentication
- Risk profile

Module B: Goals
- Create goal
- Edit goal
- Track progress

Module C: Portfolio
- Add investments
- Add transactions
- View portfolio summary

Module D: Market Data
- Fetch stock prices
- Update nightly with Celery

Module E: Reports & Recommendations
- Allocation suggestions
- Export PDF/CSV

---

# 10. Common Errors

Database connection failed:
- Check PostgreSQL running
- Check password in .env

Module not found:
pip install -r requirements.txt

Port already in use:
uvicorn main:app --reload --port 8001

---

# 11. Running Background Tasks

Start Redis:

redis-server

Start Celery:

celery -A celery_worker worker --loglevel=info

---

# 12. Important Finance Terms (Simple Meaning)

Portfolio = Collection of investments  
SIP = Monthly fixed investment  
Asset Allocation = How money is split across investments  
Risk Profile = How much risk a user can handle  
Simulation = Testing future possibilities  

---

# 13. Recommended Folder Structure

wealth-management-app/
    backend/
        app/
            models/
            schemas/
            routes/
            services/
            core/
        main.py
        .env
    frontend/
        src/
            pages/
            components/
            services/
            App.js

---

# 14. Final Advice for Interns

Do not try to build everything at once.

Step-by-step approach:
1. Setup environment
2. Make backend run
3. Make frontend run
4. Connect frontend to backend
5. Build one module at a time

Focus on understanding:
- How data flows
- How APIs work
- How database stores data

Finance knowledge will come gradually.

---

End of README
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> bf3d4034d67f98e5d486f6469e73cf7487de712b
