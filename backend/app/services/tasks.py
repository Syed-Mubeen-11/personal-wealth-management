from app.core.celery_app import celery_app
import time
from datetime import datetime
import yfinance as yf
import logging
import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()


def _ensure_backend_path():
    """Ensure backend root is importable for worker-side absolute imports."""
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)


_ensure_backend_path()

# Configure logging for tasks
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@celery_app.task
def run_simulation_task(monthly_investment: float, years: int, interest_rate: float):
    # Simulate a heavy process (optional delay)
    time.sleep(3) 
    
    total_value = 0
    year_by_year = []
    
    # Calculate Compound Interest Year by Year
    for year in range(1, years + 1):
        # Add monthly contributions for 12 months
        for _ in range(12):
            total_value += monthly_investment
            total_value += total_value * (interest_rate / 12)
        
        # Save the snapshot for this year
        year_by_year.append({
            "year": year,
            "value": round(total_value, 2)
        })
        
    # RETURN EXACTLY THIS STRUCTURE
    return {
        "total_wealth": round(total_value, 2),
        "year_by_year": year_by_year
    }


def get_db_session():
    """Create a new database session for Celery tasks"""
    _ensure_backend_path()
    
    from database import SessionLocal
    return SessionLocal()


def fetch_stock_price(symbol: str) -> float:
    """Fetch stock price using Yahoo API key path, then Alpha Vantage, then yfinance fallback."""
    yahoo_key = os.getenv("YAHOO_FINANCE_API_KEY")
    yahoo_host = os.getenv("YAHOO_FINANCE_API_HOST", "apidojo-yahoo-finance-v1.p.rapidapi.com")

    if yahoo_key:
        try:
            response = requests.get(
                f"https://{yahoo_host}/stock/v2/get-summary",
                params={"symbol": symbol, "region": "US"},
                headers={
                    "X-RapidAPI-Key": yahoo_key,
                    "X-RapidAPI-Host": yahoo_host,
                },
                timeout=15,
            )
            data = response.json() if response.ok else {}
            price_raw = (
                data.get("price", {}).get("regularMarketPrice", {}).get("raw")
                or data.get("price", {}).get("postMarketPrice", {}).get("raw")
            )
            if price_raw is not None:
                return float(price_raw)
        except Exception as e:
            logger.warning(f"Yahoo key provider failed for {symbol}: {str(e)}; trying Alpha Vantage")

    alpha_key = os.getenv("ALPHA_VANTAGE_KEY") or os.getenv("ALPHA_VANTAGE_API_KEY")

    if alpha_key and alpha_key != "demo":
        try:
            response = requests.get(
                "https://www.alphavantage.co/query",
                params={
                    "function": "GLOBAL_QUOTE",
                    "symbol": symbol,
                    "apikey": alpha_key,
                },
                timeout=15,
            )
            data = response.json()
            quote = data.get("Global Quote", {})
            price_raw = quote.get("05. price")
            if price_raw:
                return float(price_raw)
        except Exception as e:
            logger.warning(f"Alpha Vantage failed for {symbol}: {str(e)}; falling back to yfinance")

    try:
        ticker = yf.Ticker(symbol)
        history = ticker.history(period="1d")
        if not history.empty:
            return float(history['Close'].iloc[-1])
        return None
    except Exception as e:
        logger.error(f"Error fetching price for {symbol}: {str(e)}")
        return None


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def refresh_asset_price(self, asset_id: int):
    """
    Refresh the price for a single asset.
    Updates current_value, last_price, and last_price_at fields.
    """
    _ensure_backend_path()
    import models
    
    db = get_db_session()
    try:
        asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
        if not asset:
            logger.warning(f"Asset {asset_id} not found")
            return {"status": "error", "message": f"Asset {asset_id} not found"}
        
        current_price = fetch_stock_price(asset.symbol)
        
        if current_price is not None:
            asset.last_price = round(current_price, 2)
            asset.current_value = round(asset.quantity * current_price, 2)
            asset.last_price_at = datetime.utcnow()
            
            db.commit()
            
            logger.info(f"Updated {asset.symbol}: price=${current_price:.2f}, value=${asset.current_value:.2f}")
            return {
                "status": "success",
                "asset_id": asset_id,
                "symbol": asset.symbol,
                "last_price": asset.last_price,
                "current_value": asset.current_value,
                "last_price_at": asset.last_price_at.isoformat()
            }
        else:
            logger.warning(f"Could not fetch price for {asset.symbol}")
            return {"status": "error", "message": f"Could not fetch price for {asset.symbol}"}
            
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating asset {asset_id}: {str(e)}")
        raise self.retry(exc=e)
    finally:
        db.close()


@celery_app.task(bind=True)
def refresh_user_assets(self, user_id: int):
    """
    Refresh all asset prices for a specific user.
    Returns summary of updated assets.
    """
    _ensure_backend_path()
    import models
    
    db = get_db_session()
    try:
        assets = db.query(models.Asset).filter(models.Asset.owner_id == user_id).all()
        
        if not assets:
            return {"status": "success", "message": "No assets found for user", "updated": 0}
        
        updated_count = 0
        failed_count = 0
        results = []
        
        for asset in assets:
            current_price = fetch_stock_price(asset.symbol)
            
            if current_price is not None:
                asset.last_price = round(current_price, 2)
                asset.current_value = round(asset.quantity * current_price, 2)
                asset.last_price_at = datetime.utcnow()
                updated_count += 1
                results.append({
                    "symbol": asset.symbol,
                    "last_price": asset.last_price,
                    "current_value": asset.current_value,
                    "status": "updated"
                })
            else:
                failed_count += 1
                results.append({
                    "symbol": asset.symbol,
                    "status": "failed"
                })
            
            # Small delay to avoid rate limiting
            time.sleep(0.5)
        
        db.commit()
        
        logger.info(f"User {user_id}: Updated {updated_count} assets, {failed_count} failed")
        return {
            "status": "success",
            "user_id": user_id,
            "updated": updated_count,
            "failed": failed_count,
            "results": results
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error refreshing assets for user {user_id}: {str(e)}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()


@celery_app.task(bind=True)
def refresh_all_asset_prices(self):
    """
    NIGHTLY REFRESH TASK
    
    This is the main scheduled task that runs nightly to update
    current_value for every asset in the database.
    
    - Fetches current prices from yfinance API
    - Updates last_price, current_value, and last_price_at
    - Logs progress and results
    """
    _ensure_backend_path()
    import models
    
    db = get_db_session()
    start_time = datetime.utcnow()
    logger.info(f"=== NIGHTLY REFRESH STARTED at {start_time.isoformat()} ===")
    
    try:
        # Get all unique symbols across all users
        assets = db.query(models.Asset).all()
        
        if not assets:
            logger.info("No assets found in database")
            return {
                "status": "success",
                "message": "No assets to refresh",
                "started_at": start_time.isoformat(),
                "completed_at": datetime.utcnow().isoformat()
            }
        
        # Group assets by symbol to minimize API calls
        symbol_assets = {}
        for asset in assets:
            symbol = asset.symbol.upper()
            if symbol not in symbol_assets:
                symbol_assets[symbol] = []
            symbol_assets[symbol].append(asset)
        
        total_symbols = len(symbol_assets)
        total_assets = len(assets)
        updated_count = 0
        failed_symbols = []
        
        logger.info(f"Processing {total_symbols} unique symbols, {total_assets} total assets")
        
        # Fetch price for each symbol and update all related assets
        for symbol, asset_list in symbol_assets.items():
            current_price = fetch_stock_price(symbol)
            
            if current_price is not None:
                for asset in asset_list:
                    asset.last_price = round(current_price, 2)
                    asset.current_value = round(asset.quantity * current_price, 2)
                    asset.last_price_at = datetime.utcnow()
                    updated_count += 1
                
                logger.info(f"[{symbol}] Price: ${current_price:.2f} - Updated {len(asset_list)} assets")
            else:
                failed_symbols.append(symbol)
                logger.warning(f"[{symbol}] Failed to fetch price")
            
            # Alpha Vantage free tier is 5 calls/minute; with yfinance fallback this remains safe.
            time.sleep(12)
        
        db.commit()
        
        end_time = datetime.utcnow()
        duration = (end_time - start_time).total_seconds()
        
        summary = {
            "status": "success",
            "started_at": start_time.isoformat(),
            "completed_at": end_time.isoformat(),
            "duration_seconds": round(duration, 2),
            "total_symbols": total_symbols,
            "total_assets": total_assets,
            "assets_updated": updated_count,
            "failed_symbols": failed_symbols
        }
        
        logger.info(f"=== NIGHTLY REFRESH COMPLETED ===")
        logger.info(f"Duration: {duration:.2f}s | Updated: {updated_count}/{total_assets} assets")
        
        return summary
        
    except Exception as e:
        db.rollback()
        logger.error(f"NIGHTLY REFRESH FAILED: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "started_at": start_time.isoformat(),
            "failed_at": datetime.utcnow().isoformat()
        }
    finally:
        db.close()