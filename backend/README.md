# Backend Starter Guide
Personalized Wealth Management & Goal Tracker

This guide is written for complete beginners.

If you:
- Have never used FastAPI
- Have never worked with PostgreSQL
- Do not know what APIs are
- Are new to backend development

Do not worry. Follow step-by-step.

------------------------------------------------------------
1. What Is The Backend?
------------------------------------------------------------

The backend is the brain of the application.

It:
- Receives requests from frontend
- Processes business logic
- Talks to database
- Sends responses back

Simple flow:

Frontend sends request
-> Backend processes
-> Database stores/retrieves data
-> Backend sends result
-> Frontend displays it

We are building backend using:

- FastAPI (Python framework)
- PostgreSQL (Database)
- SQLAlchemy (ORM)
- JWT (Authentication)
- Celery (Background tasks)
- Redis (Task queue)

------------------------------------------------------------
2. Install Required Software
------------------------------------------------------------

Install these before starting:

1. Python 3.10+
Download:
https://www.python.org/downloads/

Check:
python --version

2. PostgreSQL
Download:
https://www.postgresql.org/download/

Remember:
- Username
- Password
- Port (default 5432)

3. Redis
Download:
https://redis.io/download/

4. Git
https://git-scm.com/

------------------------------------------------------------
3. Create Virtual Environment
------------------------------------------------------------

Go inside backend folder:

cd backend

Create virtual environment:

python -m venv venv

Activate it:

Windows:
venv\Scripts\activate

Mac/Linux:
source venv/bin/activate

You must activate venv every time before working.

------------------------------------------------------------
4. Install Dependencies
------------------------------------------------------------

If requirements.txt exists:

pip install -r requirements.txt

If not, install manually:

pip install fastapi
pip install uvicorn
pip install sqlalchemy
pip install psycopg2-binary
pip install python-jose
pip install passlib[bcrypt]
pip install python-dotenv
pip install celery
pip install redis

------------------------------------------------------------
5. Project Structure (Recommended)
------------------------------------------------------------

backend/
    app/
        models/
        schemas/
        routes/
        services/
        core/
    main.py
    .env

Explanation:

models/     -> Database table definitions
schemas/    -> Data validation (Pydantic)
routes/     -> API endpoints
services/   -> Business logic
core/       -> Config, security, database setup
main.py     -> Entry point

------------------------------------------------------------
6. Create Database
------------------------------------------------------------

Open PostgreSQL:

psql -U postgres

Create database:

CREATE DATABASE wealth_db;

Exit:

\q

------------------------------------------------------------
7. Create .env File
------------------------------------------------------------

Inside backend folder create:

.env

Add:

DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/wealth_db
SECRET_KEY=supersecretkey
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379/0

Replace "yourpassword" with your PostgreSQL password.

------------------------------------------------------------
8. Running The Backend
------------------------------------------------------------

Run:

uvicorn main:app --reload

Open in browser:

http://127.0.0.1:8000/docs

If Swagger UI opens, backend is working.

------------------------------------------------------------
9. What Is FastAPI?
------------------------------------------------------------

FastAPI is a framework used to build APIs.

API means:

A way for frontend to talk to backend.

Example:

GET /users
POST /login
POST /goals

These are endpoints.

------------------------------------------------------------
10. Basic FastAPI Example
------------------------------------------------------------

Example main.py:

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend is running"}

Visit:
http://127.0.0.1:8000/

You will see JSON response.

------------------------------------------------------------
11. Database Setup (SQLAlchemy)
------------------------------------------------------------

We use SQLAlchemy to connect to PostgreSQL.

Example database connection:

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

------------------------------------------------------------
12. Models (Database Tables)
------------------------------------------------------------

Models define tables.

Example User model:

from sqlalchemy import Column, Integer, String
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)

------------------------------------------------------------
13. Schemas (Data Validation)
------------------------------------------------------------

Schemas validate incoming data.

Example:

from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

------------------------------------------------------------
14. Routes (API Endpoints)
------------------------------------------------------------

Example route:

from fastapi import APIRouter

router = APIRouter()

@router.post("/register")
def register(user: UserCreate):
    return {"message": "User registered"}

------------------------------------------------------------
15. Authentication (JWT)
------------------------------------------------------------

JWT is used for secure login.

Flow:

User logs in
-> Backend verifies password
-> Backend creates token
-> Frontend stores token
-> Token sent in future requests

Token is sent in header:

Authorization: Bearer <token>

------------------------------------------------------------
16. Password Hashing
------------------------------------------------------------

Never store plain passwords.

Use passlib to hash:

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"])

hashed = pwd_context.hash(password)

------------------------------------------------------------
17. Protected Routes
------------------------------------------------------------

To protect endpoints:

Check JWT token before allowing access.

If token invalid:
Return 401 Unauthorized.

------------------------------------------------------------
18. Celery & Redis (Background Tasks)
------------------------------------------------------------

Used for:

- Nightly market price updates
- Heavy calculations
- Scheduled tasks

Start Redis:

redis-server

Start Celery worker:

celery -A celery_worker worker --loglevel=info

------------------------------------------------------------
19. Common Errors
------------------------------------------------------------

Database connection error:
Check:
- PostgreSQL running
- Correct password in .env

Module not found:
pip install -r requirements.txt

Address already in use:
uvicorn main:app --reload --port 8001

JWT error:
Check SECRET_KEY and ALGORITHM.

------------------------------------------------------------
20. Backend Development Flow
------------------------------------------------------------

Step 1:
Create database model.

Step 2:
Create schema.

Step 3:
Create route.

Step 4:
Test in Swagger (/docs).

Step 5:
Connect frontend.

Build module by module.

------------------------------------------------------------
21. Modules You Will Build
------------------------------------------------------------

Module A: User Management
- Register
- Login
- Risk profile

Module B: Goals
- Create goal
- Update goal
- Track progress

Module C: Portfolio
- Add investments
- Add transactions

Module D: Market Data
- Fetch stock prices
- Update portfolio value

Module E: Recommendations
- Suggest allocation
- Generate reports

------------------------------------------------------------
22. Important Backend Concepts
------------------------------------------------------------

API = Communication method
ORM = Tool to talk to database
Schema = Data validation model
Model = Database table
JWT = Secure login token
Middleware = Runs before request
Dependency Injection = Reusable logic

------------------------------------------------------------
23. Testing APIs
------------------------------------------------------------

Use:
http://127.0.0.1:8000/docs

Swagger UI allows:
- Testing endpoints
- Sending request body
- Viewing responses

------------------------------------------------------------
24. Final Advice For Beginners
------------------------------------------------------------

Backend can feel complex at first.

Focus on understanding:

How request comes in
How data is validated
How database stores data
How response is returned

Do not rush.

Write clean code.
Add comments.
Test each endpoint before moving ahead.

Errors are normal.
Debug step by step.

------------------------------------------------------------
End of Backend README
------------------------------------------------------------
