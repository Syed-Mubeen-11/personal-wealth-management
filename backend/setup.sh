#!/bin/bash
# ============================================================
# Infosys Wealth Manager - Backend Setup Script
# ============================================================

set -e
echo "🚀 Setting up FastAPI backend..."

# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy env file
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📋 Created .env from .env.example — update DATABASE_URL and SECRET_KEY!"
fi

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start PostgreSQL and create the database:"
echo "     createdb wealth_db"
echo "  2. Edit .env with your database password"
echo "  3. Run the server:"
echo "     source venv/bin/activate"
echo "     uvicorn main:app --reload --port 8000"
echo ""
echo "API docs: http://localhost:8000/docs"
