# =============================================
# Personal Wealth Management – Makefile
# =============================================

.DEFAULT_GOAL := help

# ---- Docker Compose shortcuts ----

up:                ## Start all services in detached mode
	docker compose up -d --build

down:              ## Stop and remove all containers
	docker compose down

logs:              ## Tail logs from all containers
	docker compose logs -f

restart:           ## Restart all services
	docker compose restart

ps:                ## Show running containers
	docker compose ps

# ---- Database ----

migrate:           ## Run Alembic / SQLAlchemy table creation
	docker compose exec backend python -c "import models; from database import engine; models.Base.metadata.create_all(bind=engine)"

shell-db:          ## Open psql shell inside the db container
	docker compose exec db psql -U postgres -d personal_wealth_management

# ---- Development helpers ----

backend-shell:     ## Open a bash shell in the backend container
	docker compose exec backend bash

install:           ## Install backend + frontend deps locally
	cd backend && pip install -r requirements.txt
	cd frontend && npm ci

lint:              ## Lint frontend code
	cd frontend && npx eslint src/

test:              ## Run backend tests
	cd backend && python -m pytest

# ---- Cleanup ----

clean:             ## Stop containers and remove volumes
	docker compose down -v

# ---- Help ----

help:              ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

.PHONY: up down logs restart ps migrate shell-db backend-shell install lint test clean help
