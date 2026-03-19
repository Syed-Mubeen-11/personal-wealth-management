import yfinance as yf
from sqlalchemy.orm import Session
from models.investment_model import Investment

def update_live_prices(db: Session, user_id: int):
    investments = db.query(Investment).filter(Investment.user_id == user_id).all()
    if not investments:
        return

    # Create a mapping to handle symbol formatting
    # This prevents "TCS.NS.NS" by checking if suffix already exists
    formatted_symbols = []
    symbol_map = {}

    for inv in investments:
        original_symbol = inv.symbol.upper()
        
        if inv.asset_type.lower() == "stock":
            # ONLY add .NS if it's not already there
            if not (original_symbol.endswith(".NS") or original_symbol.endswith(".BO")):
                lookup_symbol = f"{original_symbol}.NS"
            else:
                lookup_symbol = original_symbol
        else:
            # For Crypto (BTC-INR, etc.), keep as is
            lookup_symbol = original_symbol
            
        formatted_symbols.append(lookup_symbol)
        symbol_map[inv.id] = lookup_symbol

    try:
        # Fetch all unique symbols in one go
        unique_symbols = list(set(formatted_symbols))
        tickers = yf.download(unique_symbols, period="1d", interval="1m", threads=True, progress=False)
        
        for inv in investments:
            lookup_key = symbol_map[inv.id]
            
            try:
                if len(unique_symbols) > 1:
                    current_price = tickers['Close'][lookup_key].iloc[-1]
                else:
                    current_price = tickers['Close'].iloc[-1]

                # ONLY update if we got a valid number
                if current_price is not None and not hasattr(current_price, '__len__'):
                    inv.current_value = float(current_price) * inv.units
                else:
                    # If price fetch failed, keep the old value or fallback to cost_basis
                    if inv.current_value is None:
                        inv.current_value = inv.cost_basis
            except Exception:
                # Fallback if specific symbol indexing fails
                if inv.current_value is None:
                    inv.current_value = inv.cost_basis
        
        db.commit()
        print(f"Successfully updated {len(investments)} assets for user {user_id}")
        return True
    except Exception as e:
        db.rollback()
        print(f"Error fetching live prices: {str(e)}")
        return False