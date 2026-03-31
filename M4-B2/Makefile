# Makefile — local development helpers (no Docker required)

.PHONY: install dev migrate test lint up down

## Install Python dependencies
install:
	pip install -r requirements.txt

## Start FastAPI dev server (auto-reload)
dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

## Run Alembic migrations
migrate:
	alembic upgrade head

## Rollback last migration
rollback:
	alembic downgrade -1

## Run all tests with coverage
test:
	pytest tests/ -v --cov=app --cov-report=term-missing

## Lint
lint:
	ruff check app/ tests/

## One-shot: install + migrate + start
up: install migrate dev

## Generate new migration (usage: make migration MSG="add users table")
migration:
	alembic revision --autogenerate -m "$(MSG)"

## Show logs (local uvicorn just prints to stdout — tail this file if using nohup)
logs:
	tail -f uvicorn.log
