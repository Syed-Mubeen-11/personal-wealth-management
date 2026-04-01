"""
Unit tests for B2-1: Rebalance computation service
tests/test_rebalance_service.py

Run with:  pytest tests/test_rebalance_service.py -v
"""
from unittest.mock import MagicMock, patch
import pytest

from app.services.rebalance_service import compute_rebalance


# ── Shared target allocation used across tests ─────────────────────────────
MOCK_TARGET = {"equity": 0.6, "debt": 0.3, "gold": 0.1}


def _mock_investment(symbol, asset_type, quantity, current_value, avg_buy_price=100.0):
    inv = MagicMock()
    inv.symbol = symbol
    inv.asset_type = asset_type
    inv.quantity = quantity
    inv.current_value = current_value
    inv.avg_buy_price = avg_buy_price
    inv.cost_basis = avg_buy_price * quantity
    return inv


# ─────────────────────────────────────────────────────────────────────────────
# Test 1: Empty portfolio → all BUY suggestions
# ─────────────────────────────────────────────────────────────────────────────

@patch("app.services.rebalance_service._get_target_allocation", return_value=MOCK_TARGET)
def test_empty_portfolio_returns_all_buy_suggestions(mock_target):
    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = []

    result = compute_rebalance(user_id=1, db=db)

    assert result["currentWeights"] == {}
    assert result["targetWeights"] == MOCK_TARGET
    suggestions = result["suggestions"]
    assert len(suggestions) > 0, "Should return suggestions for empty portfolio"
    assert all(s["action"] == "BUY" for s in suggestions), "All suggestions should be BUY"


# ─────────────────────────────────────────────────────────────────────────────
# Test 2: Perfectly balanced portfolio → empty suggestions list
# ─────────────────────────────────────────────────────────────────────────────

@patch("app.services.rebalance_service._get_target_allocation", return_value=MOCK_TARGET)
def test_balanced_portfolio_returns_empty_suggestions(mock_target):
    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = [
        _mock_investment("NIFTY", "equity", 60, 6000),   # 60% weight
        _mock_investment("GSEC", "debt", 30, 3000),       # 30% weight
        _mock_investment("GOLD", "gold", 10, 1000),       # 10% weight
    ]

    result = compute_rebalance(user_id=1, db=db)

    # Drift for each asset type is < 0.5%, so no suggestions expected
    assert result["suggestions"] == [], (
        f"Expected no suggestions for balanced portfolio, got: {result['suggestions']}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Test 3: Overweight equity → SELL equity, BUY others
# ─────────────────────────────────────────────────────────────────────────────

@patch("app.services.rebalance_service._get_target_allocation", return_value=MOCK_TARGET)
def test_overweight_equity_generates_sell_suggestion(mock_target):
    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = [
        _mock_investment("NIFTY", "equity", 80, 8000),   # 80% weight — target 60% → SELL
        _mock_investment("GSEC", "debt", 10, 1000),       # 10% weight — target 30% → BUY
        _mock_investment("GOLD", "gold", 10, 1000),       # 10% weight — on target
    ]

    result = compute_rebalance(user_id=1, db=db)
    suggestions = result["suggestions"]

    actions = {s["asset_type"]: s["action"] for s in suggestions}
    assert "equity" in actions, "equity should have a suggestion"
    assert actions["equity"] == "SELL", "overweight equity should trigger SELL"
    assert "debt" in actions, "underweight debt should have a suggestion"
    assert actions["debt"] == "BUY", "underweight debt should trigger BUY"


# ─────────────────────────────────────────────────────────────────────────────
# Test 4: qty_change is always positive
# ─────────────────────────────────────────────────────────────────────────────

@patch("app.services.rebalance_service._get_target_allocation", return_value=MOCK_TARGET)
def test_qty_change_always_positive(mock_target):
    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = [
        _mock_investment("NIFTY", "equity", 90, 9000),
        _mock_investment("GSEC", "debt", 5, 500),
        _mock_investment("GOLD", "gold", 5, 500),
    ]

    result = compute_rebalance(user_id=1, db=db)

    for s in result["suggestions"]:
        assert s["qty_change"] >= 0, (
            f"qty_change must be >= 0, got {s['qty_change']} for {s['symbol']}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Test 5: Underweight scenario
# ─────────────────────────────────────────────────────────────────────────────

@patch("app.services.rebalance_service._get_target_allocation", return_value=MOCK_TARGET)
def test_underweight_generates_buy_suggestions(mock_target):
    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = [
        _mock_investment("NIFTY", "equity", 30, 3000),   # 30% — target 60% → BUY
        _mock_investment("GSEC", "debt", 60, 6000),       # 60% — target 30% → SELL
        _mock_investment("GOLD", "gold", 10, 1000),
    ]

    result = compute_rebalance(user_id=1, db=db)
    actions = {s["asset_type"]: s["action"] for s in result["suggestions"]}

    assert actions.get("equity") == "BUY"
    assert actions.get("debt") == "SELL"
