from fastapi import APIRouter
from app.services.stock import get_stock_price

router = APIRouter()

@router.get("/stock/{symbol}")
def fetch_stock(symbol: str):

    price = get_stock_price(symbol)

    if price is None:
        return {"error": "Stock not found"}

    return {
        "symbol": symbol,
        "price": price
    }