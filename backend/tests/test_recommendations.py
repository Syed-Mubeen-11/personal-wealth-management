import pytest
import sys
import os

# Fix path to find app/services
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from app.services.allocation_engine import get_target_allocation, compute_recommendation

def test_conservative():
    result = get_target_allocation("conservative")
    assert result["Stocks"] == 0.15
    assert result["Cash"] == 0.05

def test_moderate():
    result = get_target_allocation("moderate")
    assert result["Stocks"] == 0.35

def test_aggressive():
    result = get_target_allocation("aggressive")
    assert result["Stocks"] == 0.55

def test_invalid():
    with pytest.raises(ValueError):
        get_target_allocation("invalid")

def test_compute():
    result = compute_recommendation(1)
    assert "title" in result
    assert "suggested_allocation" in result
    assert isinstance(result["suggested_allocation"], dict)
