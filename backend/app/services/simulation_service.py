"""
Simulation Engine — Fixed & Validated

Bugs fixed:
1. Inflation was stored but NEVER applied to calculations
2. required_monthly formula was wrong (annuity formula for PV not FV)
3. yearly_breakdown gain calculation double-counted
4. what-if sim_years were shared between base and what-if (should be independent)

Finance formulas used:
  FV of lump sum:    FV = PV × (1 + r)^n
  FV of annuity:     FV = PMT × ((1+r)^n - 1) / r
  Required PMT:      PMT = (FV_needed) × r / ((1+r)^n - 1)
  Real return rate:  r_real = (1 + r_nominal) / (1 + r_inflation) - 1
"""
from datetime import date
from typing import Optional, List
from dataclasses import dataclass, field


@dataclass
class SimulationInput:
    current_value:        float
    target_amount:        float
    monthly_contribution: float
    annual_return_rate:   float     # nominal annual return %
    inflation_rate:       float     # annual inflation %
    target_date:          date
    additional_monthly:   float = 0.0
    simulation_years:     Optional[int] = None
    scenario_name:        str = "Base Case"


@dataclass
class YearlyPoint:
    year:                    int
    value:                   float
    contribution:            float   # contributions this year
    gain:                    float   # investment gains this year
    cumulative_contribution: float   # total contributed so far
    cumulative_gain:         float   # total gains so far


@dataclass
class SimulationOutput:
    scenario:                 str
    projected_value:          float
    projected_value_real:     float   # inflation-adjusted (today's purchasing power)
    total_contributions:      float
    total_gains:              float
    goal_achievable:          bool
    years_to_goal:            Optional[float]
    monthly_required_to_meet: float   # monthly SIP needed to hit target
    inflation_rate:           float
    annual_return_rate:       float
    months_simulated:         int
    yearly_breakdown:         List[YearlyPoint] = field(default_factory=list)


def _months_from_today(target_date: date) -> int:
    today = date.today()
    months = (target_date.year - today.year) * 12 + (target_date.month - today.month)
    return max(months, 1)


def run_simulation(inp: SimulationInput) -> SimulationOutput:
    """
    Core compound interest simulation with:
    - Monthly compounding
    - Optional inflation adjustment for real value
    - Accurate required_monthly calculation
    """
    # ── Period ─────────────────────────────────────────────────────────────────
    if inp.simulation_years and inp.simulation_years > 0:
        months = inp.simulation_years * 12
    else:
        months = _months_from_today(inp.target_date)

    # ── Rates ──────────────────────────────────────────────────────────────────
    monthly_nominal_rate  = (inp.annual_return_rate / 100) / 12
    monthly_inflation_rate = (inp.inflation_rate / 100) / 12
    total_monthly_pmt     = inp.monthly_contribution + inp.additional_monthly

    # ── Simulation loop ────────────────────────────────────────────────────────
    value               = inp.current_value
    cumulative_contrib  = 0.0
    cumulative_gain     = 0.0
    years_to_goal       = None
    yearly: List[YearlyPoint] = []

    year_contrib = 0.0
    year_gain    = 0.0
    start_year   = date.today().year

    for month in range(1, months + 1):
        prev_value = value

        # Apply monthly return then add contribution
        if monthly_nominal_rate > 0:
            value = value * (1 + monthly_nominal_rate) + total_monthly_pmt
        else:
            value += total_monthly_pmt

        month_gain = (value - prev_value - total_monthly_pmt)

        cumulative_contrib += total_monthly_pmt
        cumulative_gain    += month_gain
        year_contrib       += total_monthly_pmt
        year_gain          += month_gain

        # First time we hit target
        if years_to_goal is None and value >= inp.target_amount:
            years_to_goal = round(month / 12, 1)

        # Yearly snapshot
        if month % 12 == 0:
            yearly.append(YearlyPoint(
                year                    = start_year + month // 12,
                value                   = round(value, 2),
                contribution            = round(year_contrib, 2),
                gain                    = round(year_gain, 2),
                cumulative_contribution = round(cumulative_contrib, 2),
                cumulative_gain         = round(cumulative_gain, 2),
            ))
            year_contrib = 0.0
            year_gain    = 0.0

    # ── Inflation-adjusted "real" value ────────────────────────────────────────
    # What is the projected_value worth in today's money?
    inflation_factor = (1 + monthly_inflation_rate) ** months
    projected_real   = round(value / inflation_factor, 2) if inflation_factor > 0 else value

    # ── Monthly SIP required to hit target exactly ─────────────────────────────
    # Formula: PMT = (FV - PV×(1+r)^n) × r / ((1+r)^n - 1)
    r, n = monthly_nominal_rate, months
    if r > 0 and n > 0:
        growth_factor = (1 + r) ** n
        fv_of_current = inp.current_value * growth_factor
        shortfall     = max(inp.target_amount - fv_of_current, 0)
        if growth_factor > 1:
            required_monthly = shortfall * r / (growth_factor - 1)
        else:
            required_monthly = shortfall / n
    elif n > 0:
        required_monthly = max(inp.target_amount - inp.current_value - cumulative_contrib, 0) / n
    else:
        required_monthly = 0.0

    return SimulationOutput(
        scenario                 = inp.scenario_name,
        projected_value          = round(value, 2),
        projected_value_real     = projected_real,
        total_contributions      = round(cumulative_contrib, 2),
        total_gains              = round(cumulative_gain, 2),
        goal_achievable          = value >= inp.target_amount,
        years_to_goal            = years_to_goal,
        monthly_required_to_meet = round(max(required_monthly, 0), 2),
        inflation_rate           = inp.inflation_rate,
        annual_return_rate       = inp.annual_return_rate,
        months_simulated         = months,
        yearly_breakdown         = yearly,
    )


def run_whatif_comparison(base_inp: SimulationInput, whatif_inp: SimulationInput) -> dict:
    """
    Run both scenarios and return side-by-side comparison.
    Each scenario uses its own independent simulation period.
    """
    base_result   = run_simulation(base_inp)
    whatif_result = run_simulation(whatif_inp)

    diff_value     = whatif_result.projected_value - base_result.projected_value
    diff_value_pct = round(diff_value / base_result.projected_value * 100, 2) if base_result.projected_value > 0 else 0

    # Years saved = how much sooner the what-if reaches goal vs base
    years_saved = None
    if base_result.years_to_goal and whatif_result.years_to_goal:
        years_saved = round(base_result.years_to_goal - whatif_result.years_to_goal, 1)
    elif whatif_result.years_to_goal and not base_result.years_to_goal:
        years_saved = None  # what-if achieves goal but base never does

    return {
        "base_scenario":   _to_dict(base_result),
        "whatif_scenario": _to_dict(whatif_result),
        "comparison": {
            "projected_value_diff":     round(diff_value, 2),
            "projected_value_diff_pct": diff_value_pct,
            "years_saved":              years_saved,
            "base_achievable":          base_result.goal_achievable,
            "whatif_achievable":        whatif_result.goal_achievable,
            "extra_monthly":            whatif_inp.additional_monthly,
            "base_return_rate":         base_inp.annual_return_rate,
            "whatif_return_rate":       whatif_inp.annual_return_rate,
        },
    }


def _to_dict(o: SimulationOutput) -> dict:
    return {
        "scenario":                  o.scenario,
        "projected_value":           o.projected_value,
        "projected_value_real":      o.projected_value_real,
        "total_contributions":       o.total_contributions,
        "total_gains":               o.total_gains,
        "goal_achievable":           o.goal_achievable,
        "years_to_goal":             o.years_to_goal,
        "monthly_required_to_meet":  o.monthly_required_to_meet,
        "inflation_rate":            o.inflation_rate,
        "annual_return_rate":        o.annual_return_rate,
        "months_simulated":          o.months_simulated,
        "yearly_breakdown": [
            {
                "year":                    p.year,
                "value":                   p.value,
                "contribution":            p.contribution,
                "gain":                    p.gain,
                "cumulative_contribution": p.cumulative_contribution,
                "cumulative_gain":         p.cumulative_gain,
            }
            for p in o.yearly_breakdown
        ],
    }


# Keep backward compat alias
_output_to_dict = _to_dict
