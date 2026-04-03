"""
recommendation_engine.py
─────────────────────────────────────────────────────────────────────────────
Core logic for generating personalized portfolio recommendations.

Analyses:
  1. Portfolio wealth score  (0–100)
  2. Diversification score   (0–100)
  3. Goal alignment          (per goal)
  4. Smart action items      (prioritised)
  5. Risk-adjusted insights  (based on user risk profile vs actual holdings)
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Any

# ─── Target weights per risk profile ─────────────────────────────────────────

TARGET_WEIGHTS: dict[str, dict[str, float]] = {
    "aggressive": {
        "stock":       0.60,
        "etf":         0.20,
        "mutual_fund": 0.10,
        "bond":        0.05,
        "cash":        0.05,
    },
    "moderate": {
        "stock":       0.40,
        "etf":         0.20,
        "mutual_fund": 0.15,
        "bond":        0.20,
        "cash":        0.05,
    },
    "conservative": {
        "stock":       0.20,
        "etf":         0.15,
        "mutual_fund": 0.20,
        "bond":        0.40,
        "cash":        0.05,
    },
}

# ─── Priority of insights (used for sorting) ─────────────────────────────────

_PRIORITY_MAP = {"critical": 0, "high": 1, "medium": 2, "low": 3}


# ─── Helpers ──────────────────────────────────────────────────────────────────


def _current_weights(investments: list) -> dict[str, float]:
    """Return asset-type → weight mapping from a list of Investment ORM objects."""
    total_value = sum(float(inv.current_value or 0) for inv in investments)
    if total_value == 0:
        return {}

    buckets: dict[str, float] = {}
    for inv in investments:
        key = inv.asset_type.value if hasattr(inv.asset_type, "value") else str(inv.asset_type)
        buckets[key] = buckets.get(key, 0.0) + float(inv.current_value or 0)

    return {k: round(v / total_value, 4) for k, v in buckets.items()}


def _drift(current: dict[str, float], target: dict[str, float]) -> dict[str, float]:
    """Return drift = current − target for every asset class."""
    all_keys = set(current) | set(target)
    return {k: round(current.get(k, 0.0) - target.get(k, 0.0), 4) for k in all_keys}


# ─── 1. Diversification score ─────────────────────────────────────────────────


def diversification_score(investments: list) -> dict[str, Any]:
    """
    Score out of 100.
    Penalises:
      • Single-asset concentration  (>50 % in one type)
      • Fewer than 3 distinct asset classes
      • Total portfolio of 0
    """
    if not investments:
        return {"score": 0, "grade": "F", "detail": "No investments found."}

    total_value = sum(float(inv.current_value or 0) for inv in investments)
    if total_value == 0:
        return {"score": 0, "grade": "F", "detail": "Portfolio has no value."}

    weights = _current_weights(investments)
    num_classes = sum(1 for w in weights.values() if w > 0)
    max_weight = max(weights.values(), default=0)

    score = 100

    # Penalise low class count
    if num_classes < 2:
        score -= 40
    elif num_classes < 3:
        score -= 20
    elif num_classes < 4:
        score -= 10

    # Penalise concentration
    if max_weight > 0.80:
        score -= 40
    elif max_weight > 0.65:
        score -= 25
    elif max_weight > 0.50:
        score -= 15

    score = max(0, min(100, score))

    if score >= 80:
        grade = "A"
    elif score >= 65:
        grade = "B"
    elif score >= 50:
        grade = "C"
    elif score >= 35:
        grade = "D"
    else:
        grade = "F"

    detail = (
        f"{num_classes} asset class{'es' if num_classes != 1 else ''} held; "
        f"largest position is {round(max_weight * 100, 1)}% of total wealth."
    )
    return {"score": score, "grade": grade, "detail": detail}


# ─── 2. Risk-alignment score ──────────────────────────────────────────────────


def risk_alignment_score(
    investments: list, risk_profile: str
) -> dict[str, Any]:
    """
    Measures how closely the actual allocation matches the target for the
    user's stated risk profile.  Score = 100 − average absolute drift (%).
    """
    if not investments:
        return {
            "score": 0,
            "grade": "F",
            "detail": "No investments to analyse.",
            "max_drift_asset": None,
        }

    target = TARGET_WEIGHTS.get(risk_profile, TARGET_WEIGHTS["moderate"])
    current = _current_weights(investments)
    drifts = _drift(current, target)

    avg_abs_drift = sum(abs(d) for d in drifts.values()) / len(drifts)
    score = max(0, round(100 - avg_abs_drift * 200))  # 50 % avg drift → 0 score

    max_drift_asset = max(drifts, key=lambda k: abs(drifts[k]), default=None)

    if score >= 85:
        grade = "A"
    elif score >= 70:
        grade = "B"
    elif score >= 55:
        grade = "C"
    elif score >= 40:
        grade = "D"
    else:
        grade = "F"

    return {
        "score": score,
        "grade": grade,
        "detail": (
            f"Average drift from your {risk_profile} wealth target: "
            f"{round(avg_abs_drift * 100, 1)}%."
        ),
        "max_drift_asset": max_drift_asset,
    }


# ─── 3. Portfolio wealth score (composite) ───────────────────────────────────


def portfolio_wealth_score(investments: list, risk_profile: str) -> dict[str, Any]:
    """
    Composite wealth score = 50 % risk-alignment + 50 % diversification.
    Returns score, grade, label, and sub-scores.
    """
    div = diversification_score(investments)
    risk = risk_alignment_score(investments, risk_profile)

    composite = round(0.50 * div["score"] + 0.50 * risk["score"])

    if composite >= 85:
        grade, label = "A", "Excellent"
    elif composite >= 70:
        grade, label = "B", "Good"
    elif composite >= 55:
        grade, label = "C", "Fair"
    elif composite >= 40:
        grade, label = "D", "Needs Attention"
    else:
        grade, label = "F", "Critical"

    # Determine colour for UI
    if composite >= 70:
        color = "emerald"
    elif composite >= 50:
        color = "amber"
    else:
        color = "rose"

    return {
        "composite_score": composite,
        "grade": grade,
        "label": label,
        "color": color,
        "diversification": div,
        "risk_alignment": risk,
    }


# ─── 4. Goal alignment ────────────────────────────────────────────────────────

def _years_to_deadline(target_date) -> float:
    """Return fractional years remaining to a goal deadline."""
    if target_date is None:
        return 999
    today = date.today()
    if isinstance(target_date, datetime):
        target_date = target_date.date()
    delta = (target_date - today).days
    return max(delta / 365.25, 0)


def goal_insights(goals: list, investments: list) -> list[dict[str, Any]]:
    """
    For each goal return feasibility assessment and a tailored recommendation.
    Uses a 6% projected annual return on current portfolio value.
    """
    total_portfolio = sum(float(inv.current_value or 0) for inv in investments)
    insights = []

    for goal in goals:
        target = float(goal.target_amount or 0)
        monthly_contrib = float(goal.monthly_contribution or 0)
        years_left = _years_to_deadline(goal.target_date)

        # Future-value projection (6 % annual return, monthly compounding)
        r = 0.06 / 12
        n = years_left * 12
        projected_fv = (
            monthly_contrib * ((1 + r) ** n - 1) / r
            if r > 0 and n > 0
            else monthly_contrib * n
        )
        projected_fv += total_portfolio * ((1 + 0.06) ** years_left)

        gap = target - projected_fv
        on_track = gap <= 0
        progress_pct = min(round((projected_fv / target * 100) if target > 0 else 0, 1), 100)

        # Urgency
        if years_left < 1:
            urgency = "critical"
        elif years_left < 3:
            urgency = "high"
        elif years_left < 7:
            urgency = "medium"
        else:
            urgency = "low"

        if on_track:
            action = "You are on track! Maintain your current contribution and wealth-building strategy."
            status = "on_track"
        elif gap > 0 and years_left > 0:
            extra_monthly = gap / (years_left * 12)
            action = (
                f"Increase monthly contribution by ₹{round(extra_monthly):,} "
                f"or consider higher-return instruments to bridge the ₹{round(gap):,} wealth gap."
            )
            status = "at_risk"
        else:
            action = "This goal deadline has passed or insufficient data is available."
            status = "overdue"

        insights.append({
            "goal_id": goal.id,
            "goal_type": goal.goal_type.value if hasattr(goal.goal_type, "value") else str(goal.goal_type),
            "target_amount": target,
            "monthly_contribution": monthly_contrib,
            "years_left": round(years_left, 1),
            "projected_value": round(projected_fv, 2),
            "gap": round(abs(gap), 2),
            "on_track": on_track,
            "progress_pct": progress_pct,
            "status": status,
            "urgency": urgency,
            "action": action,
        })

    # Sort by urgency then by gap descending
    insights.sort(key=lambda x: (_PRIORITY_MAP.get(x["urgency"], 99), -(x["gap"] or 0)))
    return insights


# ─── 5. Smart action items ────────────────────────────────────────────────────

_ACTION_TEMPLATES: dict[str, list[dict[str, str]]] = {
    "aggressive": [
        {
            "title": "Maximise Equity Exposure",
            "body": (
                "Your aggressive wealth profile supports 60% in equities. "
                "Prioritise high-growth sectors like technology and emerging markets."
            ),
            "category": "allocation",
            "priority": "high",
            "icon": "📈",
        },
        {
            "title": "Add International Diversification",
            "body": (
                "Consider allocating 10–15% to global ETFs to reduce India-specific risk "
                "while maintaining upside wealth exposure."
            ),
            "category": "diversification",
            "priority": "medium",
            "icon": "🌍",
        },
        {
            "title": "Review High-Beta Holdings",
            "body": (
                "Aggressive wealth strategies carry higher volatility. Re-evaluate individual stock "
                "positions with beta > 1.5 on a quarterly basis."
            ),
            "category": "risk",
            "priority": "medium",
            "icon": "⚡",
        },
    ],
    "moderate": [
        {
            "title": "Balanced Wealth Growth Strategy",
            "body": (
                "Maintain your 40/20/15/20/5 equity-ETF-MF-bond-cash split. "
                "Rebalance quarterly to keep wealth allocation drift below 5%."
            ),
            "category": "allocation",
            "priority": "high",
            "icon": "⚖️",
        },
        {
            "title": "Add Dividend Stocks for Passive Income",
            "body": (
                "Including 2–3 dividend-paying blue-chip stocks can provide steady cash flow "
                "while compounding your long-term wealth."
            ),
            "category": "income",
            "priority": "medium",
            "icon": "💰",
        },
        {
            "title": "Bond Ladder for Wealth Stability",
            "body": (
                "With a 20% bond target, consider a ladder structure across 1-, 3-, and 5-year "
                "government securities to optimise yield and protect wealth."
            ),
            "category": "bonds",
            "priority": "low",
            "icon": "🏛️",
        },
    ],
    "conservative": [
        {
            "title": "Wealth Preservation First",
            "body": (
                "Your conservative wealth profile calls for 40% in high-quality bonds. "
                "Prioritise government and AAA-rated corporate bonds."
            ),
            "category": "allocation",
            "priority": "high",
            "icon": "🛡️",
        },
        {
            "title": "Liquid Fund Allocation",
            "body": (
                "Hold 5–10% in liquid or overnight mutual funds to ensure emergency "
                "access without sacrificing wealth accumulation."
            ),
            "category": "liquidity",
            "priority": "medium",
            "icon": "💧",
        },
        {
            "title": "Inflation-Adjusted Wealth Instruments",
            "body": (
                "Consider sovereign gold bonds or inflation-indexed bonds to protect "
                "your wealth's purchasing power over the long term."
            ),
            "category": "inflation",
            "priority": "low",
            "icon": "🪙",
        },
    ],
}


def smart_actions(
    investments: list,
    risk_profile: str,
    goals: list,
) -> list[dict[str, Any]]:
    """
    Returns a prioritised list of actionable wealth management recommendations.
    Combines profile-based templates with live portfolio analysis.
    """
    actions: list[dict[str, Any]] = []

    # Template actions for risk profile
    for tmpl in _ACTION_TEMPLATES.get(risk_profile, _ACTION_TEMPLATES["moderate"]):
        actions.append({**tmpl, "source": "profile"})

    if not investments:
        actions.append({
            "title": "Start Building Your Wealth",
            "body": "You have no investments yet. Begin your wealth journey by adding stocks, ETFs, or mutual funds.",
            "category": "onboarding",
            "priority": "critical",
            "icon": "🚀",
            "source": "analysis",
        })
        return actions

    total_value = sum(float(inv.current_value or 0) for inv in investments)
    weights = _current_weights(investments)
    target = TARGET_WEIGHTS.get(risk_profile, TARGET_WEIGHTS["moderate"])
    drifts = _drift(weights, target)

    # Rebalancing urgency
    large_drifts = [(k, v) for k, v in drifts.items() if abs(v) > 0.10]
    if large_drifts:
        worst = max(large_drifts, key=lambda x: abs(x[1]))
        direction = "overweight" if worst[1] > 0 else "underweight"
        actions.append({
            "title": "Urgent Wealth Rebalancing Required",
            "body": (
                f"Your {worst[0].replace('_',' ')} allocation is {direction} by "
                f"{round(abs(worst[1]) * 100, 1)}%. "
                "Open the Rebalance tool to get step-by-step trade suggestions."
            ),
            "category": "rebalancing",
            "priority": "critical",
            "icon": "⚠️",
            "source": "analysis",
        })

    # Cash drag on wealth accumulation
    cash_weight = weights.get("cash", 0)
    if cash_weight > 0.10:
        actions.append({
            "title": "Reduce Cash Drag on Wealth",
            "body": (
                f"Cash represents {round(cash_weight * 100, 1)}% of your portfolio. "
                "Idle cash erodes real wealth over time. Consider deploying it into short-duration bonds or liquid funds."
            ),
            "category": "cash",
            "priority": "high",
            "icon": "💸",
            "source": "analysis",
        })

    # Concentration risk (single holding > 30 % of total wealth)
    for inv in investments:
        inv_weight = float(inv.current_value or 0) / total_value if total_value else 0
        if inv_weight > 0.30:
            actions.append({
                "title": f"Concentration Risk: {inv.symbol}",
                "body": (
                    f"{inv.symbol} makes up {round(inv_weight * 100, 1)}% of your total wealth. "
                    "High single-stock concentration amplifies downside risk. Consider trimming to diversify."
                ),
                "category": "concentration",
                "priority": "high",
                "icon": "🎯",
                "source": "analysis",
            })

    # Goal urgency flags
    goal_ins = goal_insights(goals, investments)
    critical_goals = [g for g in goal_ins if g["urgency"] in ("critical", "high") and not g["on_track"]]
    if critical_goals:
        g = critical_goals[0]
        actions.append({
            "title": f"Wealth Goal at Risk: {g['goal_type'].replace('_', ' ').title()}",
            "body": g["action"],
            "category": "goals",
            "priority": g["urgency"],
            "icon": "🏆",
            "source": "goals",
        })

    # Sort by priority
    actions.sort(key=lambda x: _PRIORITY_MAP.get(x["priority"], 99))
    return actions


# ─── 6. Full analysis payload ─────────────────────────────────────────────────


def full_analysis(user, investments: list, goals: list) -> dict[str, Any]:
    """
    Master function that returns the complete wealth management recommendation payload.
    """
    risk_profile: str = (
        user.risk_profile.value
        if hasattr(user.risk_profile, "value")
        else str(user.risk_profile or "moderate")
    )

    total_value = sum(float(inv.current_value or 0) for inv in investments)
    total_cost = sum(
        float(inv.units or 0) * float(inv.avg_buy_price or 0)
        for inv in investments
    )
    overall_gain_pct = (
        round((total_value - total_cost) / total_cost * 100, 2)
        if total_cost > 0 else 0.0
    )

    wealth_score = portfolio_wealth_score(investments, risk_profile)
    actions = smart_actions(investments, risk_profile, goals)
    g_insights = goal_insights(goals, investments)
    current_w = _current_weights(investments)
    target_w = TARGET_WEIGHTS.get(risk_profile, TARGET_WEIGHTS["moderate"])

    return {
        "risk_profile": risk_profile,
        "portfolio_summary": {
            "total_value": round(total_value, 2),
            "total_cost": round(total_cost, 2),
            "overall_gain_pct": overall_gain_pct,
            "num_investments": len(investments),
            "num_goals": len(goals),
        },
        "wealth_score": wealth_score,
        "current_weights": current_w,
        "target_weights": target_w,
        "smart_actions": actions,
        "goal_insights": g_insights,
        "generated_at": datetime.utcnow().isoformat(),
    }
