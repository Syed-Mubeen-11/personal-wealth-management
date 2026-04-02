# =============================================
# Personal Wealth Management – Makefile
# =============================================

.DEFAULT_GOAL := help

# ---- Development helpers ----

install:           ## Install backend + frontend deps locally
	cd backend && pip install -r requirements.txt
	cd frontend && npm ci

lint:              ## Lint frontend code
	cd frontend && npx eslint src/

test:              ## Run backend tests
	cd backend && python -m pytest

# ---- Help ----

help:              ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

.PHONY: install lint test help
