"""
Allocation Engine — Rule-based portfolio recommendation engine.
Maps user's risk_profile to a target allocation and diffs against current portfolio.
All allocation values are stored as decimals (e.g. 0.35 = 35%).
"""

from typing import Dict
from sqlalchemy.orm import Session
from app.models.portfolio import Investment, AssetType
from app.models.user import User, RiskProfile


# ── Static Allocation Templates ───────────────────────────────────────────────

ALLOCATION_TEMPLATES: Dict[str, Dict[str, float]] = {
    "conservative": {
        "stocks":       0.15,
        "etfs":         0.20,
        "mutual_funds": 0.25,
        "bonds":        0.35,
        "cash":         0.05,
    },
    "moderate": {
        "stocks":       0.35,
        "etfs":         0.25,
        "mutual_funds": 0.20,
        "bonds":        0.15,
        "cash":         0.05,
    },
    "aggressive": {
        "stocks":       0.55,
        "etfs":         0.25,
        "mutual_funds": 0.10,
        "bonds":        0.05,
        "cash":         0.05,
    },
}

# Map DB enum values to allocation keys
ASSET_TYPE_MAP = {
    AssetType.stock:       "stocks",
    AssetType.etf:         "etfs",
    AssetType.mutual_fund: "mutual_funds",
    AssetType.bond:        "bonds",
    AssetType.cash:        "cash",
}


def get_target_allocation(risk_profile: str) -> Dict[str, float]:
    """
    Return target allocation for a given risk profile.
    Values are decimals (0.35 = 35%).
    Raises ValueError for unknown profiles.
    """
    key = risk_profile.lower() if risk_profile else ""
    if key not in ALLOCATION_TEMPLATES:
        raise ValueError(
            f"Unknown risk profile: '{risk_profile}'. "
            f"Valid options: {list(ALLOCATION_TEMPLATES.keys())}"
        )
    return dict(ALLOCATION_TEMPLATES[key])


def get_current_weights(user_id: int, db: Session) -> Dict[str, float]:
    """
    Compute current portfolio weights per asset class from Investments table.
    Returns decimal weights (0.0–1.0). Returns all-zero dict if portfolio is empty.
    """
    investments = db.query(Investment).filter(Investment.user_id == user_id).all()

    # Aggregate current_value per asset type
    totals: Dict[str, float] = {k: 0.0 for k in ["stocks", "etfs", "mutual_funds", "bonds", "cash"]}
    grand_total = 0.0

    for inv in investments:
        key = ASSET_TYPE_MAP.get(inv.asset_type)
        if key:
            val = float(inv.current_value or inv.cost_basis or 0)
            totals[key] += val
            grand_total += val

    if grand_total == 0:
        return {k: 0.0 for k in totals}

    return {k: round(v / grand_total, 4) for k, v in totals.items()}


def compute_recommendation(user_id: int, db: Session) -> dict:
    """
    Compute a personalised recommendation for a user.
    Returns { title, recommendation_text, suggested_allocation }.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"User {user_id} not found")

    risk_profile = str(user.risk_profile.value if hasattr(user.risk_profile, 'value') else user.risk_profile)
    target = get_target_allocation(risk_profile)
    current = get_current_weights(user_id, db)

    # Build a plain-English summary
    over_weight = []
    under_weight = []
    threshold = 0.05  # 5% drift threshold

    for asset_class, target_pct in target.items():
        current_pct = current.get(asset_class, 0.0)
        drift = current_pct - target_pct
        label = asset_class.replace("_", " ").title()
        if drift > threshold:
            over_weight.append(f"{label} ({current_pct*100:.0f}% vs target {target_pct*100:.0f}%)")
        elif drift < -threshold:
            under_weight.append(f"{label} ({current_pct*100:.0f}% vs target {target_pct*100:.0f}%)")

    profile_label = risk_profile.title()
    parts = [f"Based on your {profile_label} risk profile, here is your recommended allocation."]

    if not over_weight and not under_weight:
        parts.append("Your portfolio is well-balanced and closely aligned with your target allocation.")
    else:
        if over_weight:
            parts.append(f"You are over-weight in: {', '.join(over_weight)}.")
        if under_weight:
            parts.append(f"You are under-weight in: {', '.join(under_weight)}.")
        parts.append("Consider rebalancing to align with your target allocation.")

    recommendation_text = " ".join(parts)
    title = f"{profile_label} Portfolio Allocation — {_today_str()}"

    return {
        "title": title,
        "recommendation_text": recommendation_text,
        "suggested_allocation": target,
    }


def _today_str() -> str:
    from datetime import date
    return date.today().strftime("%b %d, %Y")
