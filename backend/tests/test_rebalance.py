"""
QA Test Suite: Rebalance Portfolio Feature
Tests compute_rebalance() logic, endpoint schema, and edge cases.
"""
import pytest
import sys
import os
from unittest.mock import MagicMock, PropertyMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.rebalance_service import compute_rebalance, get_category
from app.services.allocation_engine import get_target_allocation


# ────────────────────────────────────────────────────────────────────
# UNIT TESTS: get_category()
# ────────────────────────────────────────────────────────────────────

class TestGetCategory:
    def test_stock(self):
        assert get_category("Stock") == "Stocks"

    def test_etf(self):
        assert get_category("ETF") == "ETFs"

    def test_bond(self):
        assert get_category("Bond") == "Bonds"

    def test_cash(self):
        assert get_category("Cash") == "Cash"

    def test_crypto_maps_to_crypto(self):
        assert get_category("Crypto") == "Crypto"

    def test_bitcoin_maps_to_crypto(self):
        assert get_category("Bitcoin") == "Crypto"

    def test_none_maps_to_stocks(self):
        assert get_category("") == "Stocks"
        assert get_category(None) == "Stocks"

    def test_case_insensitive(self):
        assert get_category("etf") == "ETFs"
        assert get_category("BOND") == "Bonds"


# ────────────────────────────────────────────────────────────────────
# UNIT TESTS: compute_rebalance()
# ────────────────────────────────────────────────────────────────────

def _make_mock_asset(symbol, asset_class, quantity, buy_price, current_value=None):
    asset = MagicMock()
    asset.symbol = symbol
    asset.asset_class = asset_class
    asset.quantity = quantity
    asset.buy_price = buy_price
    asset.current_value = current_value
    return asset


def _make_mock_user(user_id=1, risk_profile="moderate"):
    user = MagicMock()
    user.id = user_id
    user.risk_profile = risk_profile
    return user


def _make_mock_db(assets):
    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = assets
    return db


class TestComputeRebalanceEmptyPortfolio:
    """Edge case: user has zero assets."""

    def test_empty_portfolio_returns_zero_weights(self):
        user = _make_mock_user(risk_profile="moderate")
        db = _make_mock_db([])

        result = compute_rebalance(user, db)

        assert result["total_value"] == 0.0
        assert result["current_weights"]["Stocks"] == 0.0
        assert result["current_weights"]["ETFs"] == 0.0
        assert result["current_weights"]["Bonds"] == 0.0
        assert result["current_weights"]["Cash"] == 0.0

        # All categories should be suggestions since current is 0%
        assert len(result["suggestions"]) > 0

    def test_empty_portfolio_all_suggestions_are_buy(self):
        user = _make_mock_user(risk_profile="moderate")
        db = _make_mock_db([])

        result = compute_rebalance(user, db)

        for s in result["suggestions"]:
            assert s["action"] == "BUY"


class TestComputeRebalancePerfectlyBalanced:
    """Edge case: portfolio exactly matches target allocation."""

    def test_balanced_portfolio_no_suggestions(self):
        # Target moderate: Stocks 35%, ETFs 25%, MF 20%, Bonds 15%, Cash 5%
        # Total = $10,000
        assets = [
            _make_mock_asset("AAPL", "Stock", 35, 100, current_value=3500),
            _make_mock_asset("VTI", "ETF", 25, 100, current_value=2500),
            _make_mock_asset("VFIAX", "Mutual Fund", 20, 100, current_value=2000),
            _make_mock_asset("BND", "Bond", 15, 100, current_value=1500),
            _make_mock_asset("USD", "Cash", 5, 100, current_value=500),
        ]
        user = _make_mock_user(risk_profile="moderate")
        db = _make_mock_db(assets)

        result = compute_rebalance(user, db)

        assert result["total_value"] == 10000.0
        assert len(result["suggestions"]) == 0


class TestComputeRebalanceOverweight:
    """Edge case: portfolio is overweight in one category."""

    def test_overweight_stocks_generates_sell_suggestion(self):
        # Stocks at 70% (target 35%), everything else at 0%
        assets = [
            _make_mock_asset("AAPL", "Stock", 70, 100, current_value=7000),
            _make_mock_asset("VTI", "ETF", 0, 100, current_value=0),
            _make_mock_asset("BND", "Bond", 0, 100, current_value=0),
        ]
        user = _make_mock_user(risk_profile="moderate")
        db = _make_mock_db(assets)

        result = compute_rebalance(user, db)

        stocks_suggestion = None
        for s in result["suggestions"]:
            if s["asset_type"] == "Stocks":
                stocks_suggestion = s
                break

        assert stocks_suggestion is not None
        assert stocks_suggestion["action"] == "SELL"
        assert stocks_suggestion["drift_impact"] > 0


class TestComputeRebalanceUnderweight:
    """Edge case: portfolio is underweight in one category."""

    def test_underweight_bonds_generates_buy_suggestion(self):
        assets = [
            _make_mock_asset("AAPL", "Stock", 100, 100, current_value=10000),
        ]
        user = _make_mock_user(risk_profile="moderate")
        db = _make_mock_db(assets)

        result = compute_rebalance(user, db)

        bonds_suggestion = None
        for s in result["suggestions"]:
            if s["asset_type"] == "Bonds":
                bonds_suggestion = s
                break

        assert bonds_suggestion is not None
        assert bonds_suggestion["action"] == "BUY"
        assert bonds_suggestion["drift_impact"] > 0


class TestComputeRebalanceSchema:
    """Verify the exact response schema."""

    def test_response_has_required_keys(self):
        user = _make_mock_user(risk_profile="moderate")
        db = _make_mock_db([])

        result = compute_rebalance(user, db)

        assert "risk_profile" in result
        assert "total_value" in result
        assert "current_weights" in result
        assert "target_weights" in result
        assert "suggestions" in result

    def test_weights_are_dicts_of_floats(self):
        user = _make_mock_user(risk_profile="moderate")
        db = _make_mock_db([])

        result = compute_rebalance(user, db)

        assert isinstance(result["current_weights"], dict)
        assert isinstance(result["target_weights"], dict)
        for v in result["current_weights"].values():
            assert isinstance(v, (int, float))
        for v in result["target_weights"].values():
            assert isinstance(v, (int, float))

    def test_suggestion_fields(self):
        user = _make_mock_user(risk_profile="moderate")
        db = _make_mock_db([])

        result = compute_rebalance(user, db)

        assert len(result["suggestions"]) > 0
        s = result["suggestions"][0]
        assert "action" in s
        assert "symbol" in s
        assert "asset_type" in s
        assert "qty_change" in s
        assert "estimated_value" in s
        assert "drift_impact" in s

    def test_qty_change_is_strictly_positive(self):
        """CRITICAL: qty_change must always be >= 0."""
        user = _make_mock_user(risk_profile="moderate")
        db = _make_mock_db([])

        result = compute_rebalance(user, db)

        for s in result["suggestions"]:
            assert s["qty_change"] >= 0, f"qty_change is negative: {s['qty_change']}"

    def test_action_is_buy_or_sell(self):
        """Action must be exactly 'BUY' or 'SELL'."""
        user = _make_mock_user(risk_profile="moderate")
        db = _make_mock_db([])

        result = compute_rebalance(user, db)

        for s in result["suggestions"]:
            assert s["action"] in ("BUY", "SELL"), f"Invalid action: {s['action']}"

    def test_estimated_value_is_positive(self):
        """estimated_value must always be >= 0."""
        user = _make_mock_user(risk_profile="moderate")
        db = _make_mock_db([])

        result = compute_rebalance(user, db)

        for s in result["suggestions"]:
            assert s["estimated_value"] >= 0, f"estimated_value is negative: {s['estimated_value']}"

    def test_drift_impact_is_positive(self):
        """drift_impact must always be >= 0."""
        user = _make_mock_user(risk_profile="moderate")
        db = _make_mock_db([])

        result = compute_rebalance(user, db)

        for s in result["suggestions"]:
            assert s["drift_impact"] >= 0, f"drift_impact is negative: {s['drift_impact']}"


class TestComputeRebalanceRiskProfiles:
    """Test different risk profiles."""

    def test_conservative_profile(self):
        user = _make_mock_user(risk_profile="conservative")
        db = _make_mock_db([])

        result = compute_rebalance(user, db)

        assert result["risk_profile"] == "conservative"
        assert result["target_weights"]["Bonds"] == 35.0  # 0.35 * 100

    def test_aggressive_profile(self):
        user = _make_mock_user(risk_profile="aggressive")
        db = _make_mock_db([])

        result = compute_rebalance(user, db)

        assert result["risk_profile"] == "aggressive"
        assert result["target_weights"]["Stocks"] == 55.0  # 0.55 * 100


class TestComputeRebalanceZeroQuantity:
    """Edge case: assets with zero quantity."""

    def test_zero_quantity_asset_handled(self):
        assets = [
            _make_mock_asset("AAPL", "Stock", 0, 150, current_value=0),
        ]
        user = _make_mock_user(risk_profile="moderate")
        db = _make_mock_db(assets)

        result = compute_rebalance(user, db)

        # Should not crash, should still produce suggestions
        assert "suggestions" in result
        for s in result["suggestions"]:
            assert s["qty_change"] >= 0


class TestComputeRebalanceCurrentValueFallback:
    """Test that current_value falls back to quantity * buy_price."""

    def test_fallback_to_quantity_times_buy_price(self):
        assets = [
            _make_mock_asset("AAPL", "Stock", 10, 150, current_value=None),
        ]
        user = _make_mock_user(risk_profile="moderate")
        db = _make_mock_db(assets)

        result = compute_rebalance(user, db)

        assert result["total_value"] == 1500.0  # 10 * 150


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
