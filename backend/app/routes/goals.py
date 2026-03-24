from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
import math

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.goal import Goal, Simulation, GoalStatus
from app.schemas.goal import (
    GoalCreateRequest, GoalUpdateRequest, GoalResponse,
    GoalListResponse, SimulationRequest, SimulationResponse,
    WhatIfRequest,
)
from app.services.simulation_service import (
    SimulationInput, run_simulation, run_whatif_comparison, _to_dict
)

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def enrich_goal(goal: Goal) -> GoalResponse:
    today    = date.today()
    target   = float(goal.target_amount)
    current  = float(goal.current_amount)
    progress = round((current / target * 100), 2) if target > 0 else 0.0
    months_remaining = None
    if goal.target_date:
        months_remaining = max(
            (goal.target_date.year - today.year) * 12
            + (goal.target_date.month - today.month), 0
        )
    return GoalResponse(
        id=goal.id, user_id=goal.user_id, name=goal.name,
        goal_type=goal.goal_type, target_amount=goal.target_amount,
        current_amount=goal.current_amount, target_date=goal.target_date,
        monthly_contribution=goal.monthly_contribution, status=goal.status,
        notes=goal.notes, created_at=goal.created_at, updated_at=goal.updated_at,
        progress_percent=progress, months_remaining=months_remaining,
        amount_remaining=max(target - current, 0),
    )


def _build_sim_input(
    goal: Goal,
    annual_return:   float,
    inflation:       float,
    extra_monthly:   float    = 0.0,
    sim_years:       Optional[int]  = None,
    target_date_override: Optional[date] = None,
    name:            str      = "Simulation",
) -> SimulationInput:
    return SimulationInput(
        current_value        = float(goal.current_amount),
        target_amount        = float(goal.target_amount),
        monthly_contribution = float(goal.monthly_contribution),
        annual_return_rate   = annual_return,
        inflation_rate       = inflation,
        target_date          = target_date_override or goal.target_date,
        additional_monthly   = extra_monthly,
        simulation_years     = sim_years,
        scenario_name        = name,
    )


# ── Goals CRUD ────────────────────────────────────────────────────────────────

@router.get("", response_model=GoalListResponse)
def list_goals(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    status: Optional[GoalStatus] = None,
    goal_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Goal).filter(Goal.user_id == current_user.id)
    if status:    query = query.filter(Goal.status == status)
    if goal_type: query = query.filter(Goal.goal_type == goal_type)
    if search:    query = query.filter(Goal.name.ilike(f"%{search}%"))
    total = query.count()
    goals = query.order_by(Goal.created_at.desc()).offset((page-1)*page_size).limit(page_size).all()
    return GoalListResponse(
        goals=[enrich_goal(g) for g in goals], total=total, page=page,
        page_size=page_size, total_pages=math.ceil(total/page_size) if total > 0 else 1,
    )


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    payload: GoalCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = Goal(
        user_id=current_user.id, name=payload.name, goal_type=payload.goal_type,
        target_amount=payload.target_amount, current_amount=payload.current_amount or 0,
        target_date=payload.target_date, monthly_contribution=payload.monthly_contribution or 0,
        notes=payload.notes,
    )
    db.add(goal); db.commit(); db.refresh(goal)
    return enrich_goal(goal)


@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal: raise HTTPException(404, "Goal not found")
    return enrich_goal(goal)


@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int, payload: GoalUpdateRequest,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal: raise HTTPException(404, "Goal not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(goal, field, value)
    db.commit(); db.refresh(goal)
    return enrich_goal(goal)


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal: raise HTTPException(404, "Goal not found")
    db.delete(goal); db.commit()


# ── Simulation ────────────────────────────────────────────────────────────────

@router.post("/{goal_id}/simulate", response_model=SimulationResponse)
def simulate_goal(
    goal_id: int, payload: SimulationRequest,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user),
):
    """
    Run a projection simulation for a goal.

    Uses compound interest formula:
      FV = PV×(1+r)^n  +  PMT×((1+r)^n - 1)/r
    where r = monthly rate, n = months, PMT = monthly contribution
    """
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal: raise HTTPException(404, "Goal not found")

    inp = _build_sim_input(
        goal,
        annual_return = payload.annual_return_rate,
        inflation     = payload.inflation_rate,
        extra_monthly = payload.additional_monthly,
        sim_years     = payload.simulation_years,
        name          = payload.scenario_name,
    )

    result      = run_simulation(inp)
    result_dict = _to_dict(result)
    assumptions = {
        "annual_return_rate":  payload.annual_return_rate,
        "inflation_rate":      payload.inflation_rate,
        "additional_monthly":  payload.additional_monthly,
        "simulation_years":    payload.simulation_years,
        "monthly_contribution": float(goal.monthly_contribution),
        "current_amount":      float(goal.current_amount),
        "target_amount":       float(goal.target_amount),
        "target_date":         str(goal.target_date),
    }

    sim_record = None
    if payload.save_scenario:
        sim_record = Simulation(
            user_id=current_user.id, goal_id=goal_id,
            scenario_name=payload.scenario_name,
            assumptions=assumptions, results=result_dict,
        )
        db.add(sim_record); db.commit(); db.refresh(sim_record)

    return SimulationResponse(
        id=sim_record.id if sim_record else None,
        goal_id=goal_id,
        scenario_name=payload.scenario_name,
        assumptions=assumptions,
        results=result_dict,
        created_at=sim_record.created_at if sim_record else None,
    )


# ── What-If Comparison ────────────────────────────────────────────────────────

@router.post("/{goal_id}/whatif")
def whatif_comparison(
    goal_id: int, payload: WhatIfRequest,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user),
):
    """
    Compare Current Plan vs What-If scenario.

    What-if can change:
    - annual_return_rate  (e.g. more aggressive portfolio)
    - extra_monthly       (e.g. invest $500 more/month)
    - sim_years           (e.g. retire 5 years earlier)
    - target_date         (direct date override)
    - inflation           (different inflation assumption)

    Both scenarios start from the SAME current_amount and monthly_contribution.
    The what-if scenario adds on TOP of the base.
    """
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal: raise HTTPException(404, "Goal not found")

    # Base = current plan, no changes
    base_inp = _build_sim_input(
        goal,
        annual_return = payload.base_annual_return,
        inflation     = payload.base_inflation,
        extra_monthly = 0.0,
        sim_years     = payload.base_sim_years,
        name          = "Current Plan",
    )

    # What-if = same base + user's scenario changes
    whatif_inp = _build_sim_input(
        goal,
        annual_return        = payload.whatif_annual_return or payload.base_annual_return,
        inflation            = payload.whatif_inflation     or payload.base_inflation,
        extra_monthly        = payload.whatif_extra_monthly,
        sim_years            = payload.whatif_sim_years     or payload.base_sim_years,
        target_date_override = payload.whatif_target_date,
        name                 = "What-If Scenario",
    )

    comparison = run_whatif_comparison(base_inp, whatif_inp)

    if payload.save_whatif:
        sim = Simulation(
            user_id=current_user.id, goal_id=goal_id,
            scenario_name="What-If Scenario",
            assumptions={
                "base_annual_return":    payload.base_annual_return,
                "whatif_extra_monthly":  payload.whatif_extra_monthly,
                "whatif_annual_return":  payload.whatif_annual_return,
                "whatif_sim_years":      payload.whatif_sim_years,
                "whatif_inflation":      payload.whatif_inflation,
            },
            results=comparison,
        )
        db.add(sim); db.commit()

    return comparison


# ── Saved Simulations ─────────────────────────────────────────────────────────

@router.get("/{goal_id}/simulations")
def list_simulations(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal: raise HTTPException(404, "Goal not found")

    sims = db.query(Simulation).filter(
        Simulation.goal_id == goal_id,
        Simulation.user_id == current_user.id,
    ).order_by(Simulation.created_at.desc()).all()

    return [
        {
            "id":            s.id,
            "scenario_name": s.scenario_name,
            "assumptions":   s.assumptions,
            "results":       s.results,
            "created_at":    s.created_at,
        }
        for s in sims
    ]
