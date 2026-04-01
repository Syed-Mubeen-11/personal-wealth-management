from fastapi import FastAPI, Depends, Request, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from core.auth import verify_password, create_access_token, hash_password, get_current_user
import models.models as models
import schemas.schemas as schemas
from core.database import engine, SessionLocal
import shutil
import os
import uuid
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Routes
from routes import auth_routes, profile_routes, finance_routes, investment_routes
from routes import goal_routes, transaction_routes, simulation_routes, recommendation_routes, rebalance_routes

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Personal Wealth Management API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
templates = Jinja2Templates(directory="templates")

app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(finance_routes.router)
app.include_router(goal_routes.router)
app.include_router(investment_routes.router)
app.include_router(transaction_routes.router)
app.include_router(simulation_routes.router)
app.include_router(recommendation_routes.router)
app.include_router(rebalance_routes.router)

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("backend.html", {"request": request})