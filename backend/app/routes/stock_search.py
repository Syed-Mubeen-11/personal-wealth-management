from fastapi import APIRouter
from app.services.stock_search import search_stocks
from app.services.alpha_vantage import fetch_stock_price

router = APIRouter()

@router.get("/search")
def search_stock(keyword: str):
    return search_stocks(keyword)

@router.get("/price/{symbol}")
def get_price(symbol: str):
    price = fetch_stock_price(symbol)
    return {"price": price}