from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.models.portfolio import AssetType, TransactionType


# ── Transaction Schemas ───────────────────────────────────────────────────────

class TransactionCreateRequest(BaseModel):
    symbol:        Optional[str]   = None
    type:          TransactionType
    quantity:      Optional[Decimal] = Decimal("0")
    price:         Optional[Decimal] = Decimal("0")
    fees:          Optional[Decimal] = Decimal("0")
    notes:         Optional[str]   = None
    executed_at:   Optional[datetime] = None
    asset_type:    AssetType       = AssetType.stock
    company_name:  Optional[str]   = None


class TransactionResponse(BaseModel):
    id:            int
    user_id:       int
    investment_id: Optional[int]   = None
    symbol:        Optional[str]   = None
    type:          TransactionType
    quantity:      Decimal
    price:         Decimal
    fees:          Decimal
    notes:         Optional[str]   = None
    executed_at:   Optional[datetime] = None
    total_amount:  Optional[float] = None

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    transactions: List[TransactionResponse]
    total:        int
    page:         int
    page_size:    int
    total_pages:  int


# ── Investment Schemas ────────────────────────────────────────────────────────

class InvestmentResponse(BaseModel):
    id:            int
    user_id:       int
    asset_type:    AssetType
    symbol:        str
    company_name:  Optional[str]   = None
    units:         Decimal
    avg_buy_price: Decimal
    cost_basis:    Decimal
    current_value: Decimal
    last_price:    Optional[Decimal] = None
    last_price_at: Optional[datetime] = None
    created_at:    Optional[datetime] = None
    gain_loss:     Optional[float]  = None
    gain_loss_pct: Optional[float]  = None

    class Config:
        from_attributes = True


# ── Market Price Schema ───────────────────────────────────────────────────────

class MarketPriceResponse(BaseModel):
    symbol:     str
    price:      float
    change:     float
    change_pct: float
    currency:   str
    source:     str
    fetched_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Portfolio Summary ─────────────────────────────────────────────────────────

class AllocationItem(BaseModel):
    asset_type:  str
    value:       float
    percentage:  float
    color:       str


class PortfolioSummaryResponse(BaseModel):
    total_value:       float
    total_cost_basis:  float
    total_gain_loss:   float
    gain_loss_pct:     float
    today_change:      float
    today_change_pct:  float
    num_positions:     int
    allocation:        List[AllocationItem]
    investments:       List[InvestmentResponse]
