from fastapi import FastAPI, Depends
import requests
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base, sessionmaker, Session

app = FastAPI()

# ---------------- API KEY ----------------
API_KEY = "3QLS5PH3W3H71DZT"

# ---------------- DATABASE ----------------
DATABASE_URL = "sqlite:///./stocks.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String)
    last_price = Column(Float)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- API CALL ----------------
def get_stock_price(symbol):
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={API_KEY}"
    response = requests.get(url)
    return response.json()

# ---------------- MAPPING ----------------
def map_stock_data(data):
    quote = data["Global Quote"]

    return {
        "symbol": quote["01. symbol"],
        "last_price": float(quote["05. price"])
    }

# ---------------- SAVE + GET ----------------
@app.get("/stock/{symbol}")
def get_stock(symbol: str, db: Session = Depends(get_db)):

    data = get_stock_price(symbol)

    if "Note" in data:
        return {"error": "API limit reached"}

    mapped = map_stock_data(data)

    # 🔥 DB lo save
    new_stock = Stock(
        symbol=mapped["symbol"],
        last_price=mapped["last_price"]
    )

    db.add(new_stock)
    db.commit()
    db.refresh(new_stock)

    return mapped

# ---------------- FETCH ALL ----------------
@app.get("/stocks")
def get_all_stocks(db: Session = Depends(get_db)):
    return db.query(Stock).all()