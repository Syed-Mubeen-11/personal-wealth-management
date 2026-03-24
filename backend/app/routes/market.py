"""
Market Routes — Bulk Update + Live Dashboard Data

New endpoints:
  GET  /api/market/indices            — live market overview (S&P, NASDAQ etc.)
  GET  /api/dashboard/summary         — dynamic counts + portfolio + goals
  POST /api/market/bulk-refresh       — bulk update all user positions at once
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.portfolio import Investment
from app.services.market_data import (
    fetch_prices_bulk_async,
    fetch_market_indices_async,
    fetch_price_async,
)
from app.services.portfolio_service import upsert_market_price
from pydantic import BaseModel

router = APIRouter()


# ── Live market indices (dashboard widget) ────────────────────────────────────

@router.get("/indices")
async def get_market_indices(
    current_user: User = Depends(get_current_user),
):
    """
    Fetch live prices for major market indices.
    S&P 500, NASDAQ, DOW, Gold, Crude Oil — all in one bulk call.
    """
    try:
        indices = await fetch_market_indices_async()
        return { "indices": indices, "fetched_at": datetime.utcnow().isoformat() }
    except Exception as e:
        raise HTTPException(500, f"Failed to fetch market indices: {e}")


# ── Single symbol price ───────────────────────────────────────────────────────

@router.get("/price/{symbol}")
async def get_live_price(
    symbol: str,
    current_user: User = Depends(get_current_user),
):
    data = await fetch_price_async(symbol.upper())
    if not data:
        raise HTTPException(404, f"Price unavailable for {symbol.upper()}")
    return data


# ── Bulk refresh all user portfolio positions ─────────────────────────────────

@router.post("/bulk-refresh")
async def bulk_refresh_portfolio(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """
    One-shot bulk price update for the entire user portfolio.

    Workflow:
      1. Get all unique symbols from user's investments
      2. ONE yfinance.download() call for ALL symbols
      3. Upsert each price into market_prices table
      4. Sync current_value on all investments
      5. Return summary of what was updated
    """
    investments = db.query(Investment).filter(
        Investment.user_id    == current_user.id,
        Investment.asset_type != "cash",
        Investment.units      >  0,
    ).all()

    if not investments:
        return { "message": "No positions to refresh", "updated": 0, "failed": 0, "prices": {} }

    # Deduplicated symbol list
    symbols = list({ inv.symbol for inv in investments })

    # ONE bulk call for all symbols
    price_map = await fetch_prices_bulk_async(symbols, delay=0.1)

    updated      = 0
    failed       = 0
    prices_stored = {}

    for symbol, pd in price_map.items():
        if pd and pd.get("price"):
            upsert_market_price(
                db,
                symbol     = symbol,
                price      = pd["price"],
                change     = pd.get("change",     0),
                change_pct = pd.get("change_pct", 0),
                currency   = pd.get("currency", "USD"),
                source     = pd.get("source", "yfinance_bulk"),
            )
            prices_stored[symbol] = {
                "price":      pd["price"],
                "change":     pd["change"],
                "change_pct": pd["change_pct"],
                "source":     pd["source"],
            }
            updated += 1
        else:
            failed += 1

    db.commit()

    return {
        "message":      f"Bulk refresh complete: {updated} updated, {failed} failed",
        "updated":      updated,
        "failed":       failed,
        "total":        len(symbols),
        "prices":       prices_stored,
        "last_updated": datetime.utcnow().isoformat(),
    }


# ── Stored market prices ──────────────────────────────────────────────────────

@router.get("/stored-prices")
def get_stored_prices(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    """Return all prices currently stored in market_prices table."""
    from app.models.portfolio import MarketPrice
    prices = db.query(MarketPrice).order_by(MarketPrice.fetched_at.desc()).all()
    return [
        {
            "symbol":     p.symbol,
            "price":      float(p.price),
            "change":     float(p.change     or 0),
            "change_pct": float(p.change_pct or 0),
            "source":     p.source,
            "fetched_at": p.fetched_at,
        }
        for p in prices
    ]


# ── Trigger nightly Celery task manually ─────────────────────────────────────

@router.post("/trigger-nightly")
async def trigger_nightly(current_user: User = Depends(get_current_user)):
    try:
        from app.tasks.celery_worker import nightly_price_refresh
        task = nightly_price_refresh.delay()
        return { "message": "Nightly refresh queued", "task_id": task.id }
    except Exception as e:
        return { "message": f"Celery unavailable ({e}). Use /bulk-refresh instead." }
