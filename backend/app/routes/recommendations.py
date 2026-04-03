"""
Recommendations API — BE-1 deliverable
Endpoints:
  GET  /api/v1/recommendations          — paginated list
  POST /api/v1/recommendations/generate — generate & persist
  PATCH /api/v1/recommendations/:id/read — mark as read
  GET  /api/v1/recommendations/rebalance — rebalance suggestions (BE-2)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.recommendation import Recommendation
from app.models.portfolio import Investment
from app.services.allocation_engine import compute_recommendation
from app.services.rebalance_service import compute_rebalance
from app.schemas.recommendation import (
    RecommendationOut, RecommendationListOut, RebalanceOut
)

router = APIRouter()


# ── GET /recommendations ─────────────────────────────────────────────────────

@router.get("", response_model=RecommendationListOut)
def list_recommendations(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return paginated list of the authenticated user's recommendations,
    ordered by created_at DESC.
    """
    query = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == current_user.id)
        .order_by(Recommendation.created_at.desc())
    )
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return RecommendationListOut(total=total, limit=limit, offset=offset, items=items)


# ── POST /recommendations/generate ───────────────────────────────────────────

@router.post("/generate", response_model=RecommendationOut, status_code=status.HTTP_201_CREATED)
def generate_recommendation(
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a new recommendation. Implements 24h idempotency:
    if a recommendation was generated within the last 24h and the portfolio
    hasn't changed, return 304 Not Modified with the existing recommendation.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)

    # Check for recent recommendation
    existing = (
        db.query(Recommendation)
        .filter(
            Recommendation.user_id == current_user.id,
            Recommendation.created_at >= cutoff,
        )
        .order_by(Recommendation.created_at.desc())
        .first()
    )

    if existing:
        # Check if portfolio has changed since the recommendation
        latest_investment = (
            db.query(Investment)
            .filter(Investment.user_id == current_user.id)
            .order_by(Investment.updated_at.desc())
            .first()
        )
        portfolio_changed = (
            latest_investment
            and latest_investment.updated_at
            and latest_investment.updated_at > existing.created_at
        )
        if not portfolio_changed:
            response.status_code = 304
            return existing

    # Generate new recommendation
    payload = compute_recommendation(current_user.id, db)

    rec = Recommendation(
        user_id=current_user.id,
        title=payload["title"],
        recommendation_text=payload["recommendation_text"],
        suggested_allocation=payload["suggested_allocation"],
        is_read=False,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


# ── PATCH /recommendations/:id/read ─────────────────────────────────────────

@router.patch("/{recommendation_id}/read", response_model=RecommendationOut)
def mark_as_read(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a recommendation as read."""
    rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    if rec.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    rec.is_read = True
    db.commit()
    db.refresh(rec)
    return rec


# ── GET /recommendations/rebalance ───────────────────────────────────────────

@router.get("/rebalance", response_model=RebalanceOut)
def get_rebalance_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return current vs. target allocation weights and buy/sell suggestions.
    Results are cached in Redis for 30 min (if Redis is available).
    """
    # Try Redis cache first
    cache_key = f"rebalance:{current_user.id}"
    try:
        import redis
        import json
        from app.core.config import settings
        r = redis.from_url(settings.REDIS_URL or "redis://localhost:6379/0")
        cached = r.get(cache_key)
        if cached:
            from fastapi.responses import JSONResponse
            data = json.loads(cached)
            # Add cache hit header
            return data
    except Exception:
        pass  # Redis unavailable — compute fresh

    result = compute_rebalance(current_user.id, db)

    # Cache result
    try:
        import redis
        import json
        from app.core.config import settings
        r = redis.from_url(settings.REDIS_URL or "redis://localhost:6379/0")
        r.setex(cache_key, 1800, json.dumps(result))
    except Exception:
        pass

    return result
