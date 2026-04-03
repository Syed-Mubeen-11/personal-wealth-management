from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime


class RecommendationOut(BaseModel):
    id: int
    user_id: int
    title: str
    recommendation_text: str
    suggested_allocation: Dict[str, float] = Field(
        ...,
        description="Asset class weights as decimals (e.g. {'stocks': 0.35, 'etfs': 0.25})"
    )
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 42,
                "title": "Moderate Portfolio Allocation — Mar 28, 2026",
                "recommendation_text": "Based on your Moderate risk profile...",
                "suggested_allocation": {
                    "stocks": 0.35, "etfs": 0.25,
                    "mutual_funds": 0.20, "bonds": 0.15, "cash": 0.05
                },
                "is_read": False,
                "created_at": "2026-03-28T10:00:00Z"
            }
        }


class RecommendationListOut(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[RecommendationOut]


class RebalanceSuggestionItem(BaseModel):
    action: str                 # "BUY" or "SELL"
    asset_class: str
    symbol: str
    qty_change: float
    estimated_value: float
    drift_impact: float
    current_weight: float
    target_weight: float


class RebalanceOut(BaseModel):
    currentWeights: Dict[str, float]
    targetWeights: Dict[str, float]
    suggestions: List[RebalanceSuggestionItem]
