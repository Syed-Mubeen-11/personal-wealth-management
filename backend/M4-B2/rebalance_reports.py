"""
B2-2 · B2-4 · B2-5  — FastAPI Endpoints
app/api/v1/endpoints/rebalance_reports.py

Mount in your main router as:
    from app.api.v1.endpoints.rebalance_reports import router as rr_router
    api_router.include_router(rr_router, prefix="/api/v1")
"""
import json
from datetime import date
from typing import Literal

import redis
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.config import settings          # has REDIS_URL
from app.api.deps import get_db, get_current_user  # your existing auth deps
from app.services.rebalance_service import compute_rebalance
from app.services.report_service import generate_pdf_report, generate_csv_report

router = APIRouter()

# ── Redis client (singleton per process) ──────────────────────────────────
_redis_client: redis.Redis | None = None

def get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis_client


# ─────────────────────────────────────────────────────────────────────────────
# B2-2  GET /api/v1/recommendations/rebalance
# ─────────────────────────────────────────────────────────────────────────────

REBALANCE_TTL = 30 * 60   # 30 minutes


@router.get("/recommendations/rebalance")
async def get_rebalance_suggestions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Returns rebalance suggestions with Redis caching (30 min, per user).
    Response headers carry X-Cache: HIT | MISS.
    """
    redis_client = get_redis()
    cache_key = f"rebalance:{current_user.id}"

    # ── Cache check ────────────────────────────────────────────────────────
    cached = redis_client.get(cache_key)
    if cached:
        data = json.loads(cached)
        return _json_response_with_cache_header(data, hit=True)

    # ── Compute and cache ─────────────────────────────────────────────────
    result = compute_rebalance(current_user.id, db)
    redis_client.setex(cache_key, REBALANCE_TTL, json.dumps(result))

    return _json_response_with_cache_header(result, hit=False)


def _json_response_with_cache_header(data: dict, hit: bool):
    from fastapi.responses import JSONResponse
    resp = JSONResponse(content=data)
    resp.headers["X-Cache"] = "HIT" if hit else "MISS"
    return resp


# ─────────────────────────────────────────────────────────────────────────────
# B2-4  GET /api/v1/reports/pdf
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/reports/pdf")
async def download_pdf_report(
    scope: str = Query(default="full"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Generates and streams a PDF report.
    Returns 500 with JSON body (never a partial PDF) on generation failure.
    """
    try:
        pdf_bytes = generate_pdf_report(current_user.id, db)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={"error": "PDF generation failed", "reason": str(exc)},
        )

    filename = f"wealth-report-{date.today()}.pdf"

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# ─────────────────────────────────────────────────────────────────────────────
# B2-5  GET /api/v1/reports/csv
# ─────────────────────────────────────────────────────────────────────────────

VALID_CSV_TYPES = {"portfolio", "goals", "transactions"}


@router.get("/reports/csv")
async def download_csv_report(
    type: str = Query(..., description="portfolio | goals | transactions"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Streams a CSV report for the requested type.
    422 for invalid type values.
    """
    if type not in VALID_CSV_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid type '{type}'. Choose from: {sorted(VALID_CSV_TYPES)}",
        )

    csv_str = generate_csv_report(current_user.id, type, db)
    filename = f"wealth-{type}-{date.today()}.csv"

    return StreamingResponse(
        iter([csv_str]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
