"""
Market Data Service — Bulk Price Update
Uses yfinance.download() to fetch ALL symbols in ONE network call.
Falls back to individual fetches only for failed symbols.
"""
import yfinance as yf
import logging
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, Dict, List
from datetime import datetime

from app.core.config import settings

logger    = logging.getLogger(__name__)
_executor = ThreadPoolExecutor(max_workers=4)

# ─────────────────────────────────────────────────────────────────────────────
# BULK FETCH  (one network call for all symbols)
# ─────────────────────────────────────────────────────────────────────────────

def fetch_prices_bulk(
    symbols: List[str],
    delay_seconds: float = 0.2,
) -> Dict[str, Optional[dict]]:
    """
    Fetch prices for ALL symbols in a single yfinance.download() call.
    This is the "bulk update" — one HTTP round-trip for N symbols.

    Returns:
        { "AAPL": { price, change, change_pct, source, fetched_at }, ... }
    """
    if not symbols:
        return {}

    upper = [s.upper() for s in symbols]
    results: Dict[str, Optional[dict]] = {}

    # ── STEP 1: Bulk download (one call) ─────────────────────────────────────
    try:
        logger.info(f"Bulk fetching {len(upper)} symbols: {upper}")

        raw = yf.download(
            tickers     = upper if len(upper) > 1 else upper[0],
            period      = "5d",        # 5 days so weekends / holidays always have data
            interval    = "1d",
            auto_adjust = True,
            progress    = False,
            threads     = True,        # yfinance internal threading
            group_by    = "ticker",    # multi-ticker: raw["Close"]["AAPL"]
        )

        if raw.empty:
            logger.warning("Bulk download returned empty DataFrame")
        else:
            fetched_at = datetime.utcnow().isoformat()

            if len(upper) == 1:
                # Single ticker — raw["Close"] is a Series
                sym    = upper[0]
                prices = raw["Close"].dropna()
                if len(prices) >= 2:
                    price      = float(prices.iloc[-1])
                    prev       = float(prices.iloc[-2])
                    change     = price - prev
                    change_pct = (change / prev * 100) if prev else 0.0
                elif len(prices) == 1:
                    price = float(prices.iloc[-1]); change = 0.0; change_pct = 0.0
                else:
                    price = None

                if price:
                    results[sym] = _make_result(sym, price, change, change_pct, "yfinance_bulk", fetched_at)
                    logger.info(f"  ✓ {sym}: ${price:.2f} ({change_pct:+.2f}%)")
                else:
                    results[sym] = None
                    logger.warning(f"  ✗ {sym}: no price in bulk response")

            else:
                # Multi-ticker — raw is MultiIndex: raw["Close"]["AAPL"]
                close = raw["Close"] if "Close" in raw.columns else raw.xs("Close", axis=1, level=0)

                for sym in upper:
                    try:
                        if sym not in close.columns:
                            results[sym] = None
                            logger.warning(f"  ✗ {sym}: not in bulk response columns")
                            continue

                        series = close[sym].dropna()
                        if len(series) >= 2:
                            price      = float(series.iloc[-1])
                            prev       = float(series.iloc[-2])
                            change     = price - prev
                            change_pct = (change / prev * 100) if prev else 0.0
                        elif len(series) == 1:
                            price = float(series.iloc[0]); change = 0.0; change_pct = 0.0
                        else:
                            results[sym] = None
                            logger.warning(f"  ✗ {sym}: empty series in bulk response")
                            continue

                        results[sym] = _make_result(sym, price, change, change_pct, "yfinance_bulk", fetched_at)
                        logger.info(f"  ✓ {sym}: ${price:.2f} ({change_pct:+.2f}%)")

                    except Exception as e:
                        results[sym] = None
                        logger.warning(f"  ✗ {sym}: parse error — {e}")

    except Exception as e:
        logger.warning(f"Bulk download failed ({e}) — falling back to individual fetches")

    # ── STEP 2: Individual fallback for any that failed ───────────────────────
    failed = [s for s in upper if s not in results or results[s] is None]
    if failed:
        logger.info(f"Individual fallback for {len(failed)} symbols: {failed}")
        for i, sym in enumerate(failed):
            if i > 0:
                time.sleep(delay_seconds)
            results[sym] = fetch_price_single(sym)

    return results


# ─────────────────────────────────────────────────────────────────────────────
# SINGLE FETCH  (fallback)
# ─────────────────────────────────────────────────────────────────────────────

def fetch_price_single(symbol: str) -> Optional[dict]:
    """
    Fetch price for ONE symbol.
    Used as fallback when bulk download misses a symbol.
    Also falls back to Alpha Vantage if yfinance fails.
    """
    try:
        ticker = yf.Ticker(symbol.upper())
        info   = ticker.fast_info

        price = getattr(info, "last_price", None) or getattr(info, "previous_close", None)
        if not price:
            return _alpha_vantage_fallback(symbol)

        prev       = getattr(info, "previous_close", None) or price
        change     = price - prev
        change_pct = (change / prev * 100) if prev else 0.0

        return _make_result(symbol, float(price), float(change), float(change_pct),
                            "yfinance", datetime.utcnow().isoformat())

    except Exception as e:
        logger.error(f"yfinance single fetch failed for {symbol}: {e}")
        return _alpha_vantage_fallback(symbol)


# ─────────────────────────────────────────────────────────────────────────────
# MARKET INDICES  (for dashboard overview widget)
# ─────────────────────────────────────────────────────────────────────────────

MARKET_INDEX_SYMBOLS = {
    "S&P 500":   "^GSPC",
    "NASDAQ":    "^IXIC",
    "DOW JONES": "^DJI",
    "Gold":      "GC=F",
    "Crude Oil": "CL=F",
}

def fetch_market_indices() -> List[dict]:
    """
    Fetch live prices for major market indices in one bulk call.
    Returns a list of { name, symbol, price, change, change_pct }.
    Used by the dashboard Market Overview widget.
    """
    symbols = list(MARKET_INDEX_SYMBOLS.values())
    prices  = fetch_prices_bulk(symbols, delay_seconds=0.1)

    result = []
    for name, sym in MARKET_INDEX_SYMBOLS.items():
        pd = prices.get(sym)
        if pd:
            result.append({
                "name":       name,
                "symbol":     sym,
                "price":      pd["price"],
                "change":     pd["change"],
                "change_pct": pd["change_pct"],
                "source":     pd["source"],
                "fetched_at": pd["fetched_at"],
            })
        else:
            result.append({
                "name":       name,
                "symbol":     sym,
                "price":      None,
                "change":     0,
                "change_pct": 0,
                "source":     "unavailable",
                "fetched_at": datetime.utcnow().isoformat(),
            })
    return result


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _make_result(symbol, price, change, change_pct, source, fetched_at) -> dict:
    return {
        "symbol":      symbol.upper(),
        "price":       round(float(price),      4),
        "change":      round(float(change),      4),
        "change_pct":  round(float(change_pct),  4),
        "currency":    "USD",
        "market_state":"LIVE",
        "source":      source,
        "fetched_at":  fetched_at,
    }


def _alpha_vantage_fallback(symbol: str) -> Optional[dict]:
    """Alpha Vantage fallback — uses stdlib urllib, no extra deps."""
    key = getattr(settings, "ALPHA_VANTAGE_API_KEY", None)
    if not key or key in ("demo", "YOUR_KEY_HERE", ""):
        return None
    try:
        import urllib.request, json
        url = (
            "https://www.alphavantage.co/query"
            f"?function=GLOBAL_QUOTE&symbol={symbol}&apikey={key}"
        )
        with urllib.request.urlopen(url, timeout=10) as r:
            data = json.loads(r.read())
        quote = data.get("Global Quote", {})
        price = quote.get("05. price")
        if not price:
            return None
        return _make_result(
            symbol,
            float(price),
            float(quote.get("09. change", 0)),
            float(quote.get("10. change percent", "0%").replace("%", "")),
            "alphavantage",
            datetime.utcnow().isoformat(),
        )
    except Exception as e:
        logger.error(f"Alpha Vantage fallback failed for {symbol}: {e}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# ASYNC WRAPPERS  (for FastAPI endpoints)
# ─────────────────────────────────────────────────────────────────────────────

async def fetch_prices_bulk_async(symbols: List[str], delay: float = 0.2) -> Dict[str, Optional[dict]]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, lambda: fetch_prices_bulk(symbols, delay))


async def fetch_market_indices_async() -> List[dict]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, fetch_market_indices)


async def fetch_price_async(symbol: str) -> Optional[dict]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, fetch_price_single, symbol)


# Keep old name as alias for backward compat
fetch_price = fetch_price_single
