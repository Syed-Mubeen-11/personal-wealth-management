from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from app.models.goal import GoalType, GoalStatus


# ── Goal Schemas ──────────────────────────────────────────────────────────────

class GoalCreateRequest(BaseModel):
    name:                 str     = Field(..., min_length=1, max_length=200)
    goal_type:            GoalType = GoalType.custom
    target_amount:        Decimal  = Field(..., gt=0)
    current_amount:       Optional[Decimal] = Decimal("0")
    target_date:          date
    monthly_contribution: Optional[Decimal] = Decimal("0")
    notes:                Optional[str] = None

    @field_validator("target_date")
    @classmethod
    def target_date_must_be_future(cls, v):
        if v <= date.today():
            raise ValueError("Target date must be in the future")
        return v

    @field_validator("monthly_contribution")
    @classmethod
    def contribution_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Monthly contribution cannot be negative")
        return v


class GoalUpdateRequest(BaseModel):
    name:                 Optional[str]      = None
    goal_type:            Optional[GoalType] = None
    target_amount:        Optional[Decimal]  = None
    current_amount:       Optional[Decimal]  = None
    target_date:          Optional[date]     = None
    monthly_contribution: Optional[Decimal]  = None
    status:               Optional[GoalStatus] = None
    notes:                Optional[str]      = None


class GoalResponse(BaseModel):
    id:                   int
    user_id:              int
    name:                 str
    goal_type:            GoalType
    target_amount:        Decimal
    current_amount:       Decimal
    target_date:          date
    monthly_contribution: Decimal
    status:               GoalStatus
    notes:                Optional[str] = None
    created_at:           Optional[datetime] = None
    updated_at:           Optional[datetime] = None
    progress_percent:     Optional[float]   = None
    months_remaining:     Optional[int]     = None
    amount_remaining:     Optional[Decimal] = None

    class Config:
        from_attributes = True


class GoalListResponse(BaseModel):
    goals:       List[GoalResponse]
    total:       int
    page:        int
    page_size:   int
    total_pages: int


# ── Simulation Request — with full validation ─────────────────────────────────

class SimulationRequest(BaseModel):
    goal_id:             int
    annual_return_rate:  float  = Field(default=7.5,  ge=0,   le=50,  description="Expected annual return %")
    inflation_rate:      float  = Field(default=3.0,  ge=0,   le=20,  description="Annual inflation %")
    additional_monthly:  float  = Field(default=0.0,  ge=0,           description="Extra monthly contribution $")
    simulation_years:    Optional[int] = Field(default=None, ge=1, le=50, description="Override years (else uses target_date)")
    scenario_name:       str   = Field(default="Base Case", max_length=100)
    save_scenario:       bool  = False

    @field_validator("annual_return_rate")
    @classmethod
    def return_rate_non_negative(cls, v):
        if v < 0:
            raise ValueError("Annual return rate cannot be negative")
        return v

    @field_validator("inflation_rate")
    @classmethod
    def inflation_non_negative(cls, v):
        if v < 0:
            raise ValueError("Inflation rate cannot be negative")
        return v


class SimulationResponse(BaseModel):
    id:            Optional[int]  = None
    goal_id:       int
    scenario_name: str
    assumptions:   dict
    results:       dict
    created_at:    Optional[datetime] = None

    class Config:
        from_attributes = True


# ── What-If Request — with validation ────────────────────────────────────────

class WhatIfRequest(BaseModel):
    # Base (current plan) parameters
    base_annual_return:  float = Field(default=7.5, ge=0, le=50)
    base_inflation:      float = Field(default=3.0, ge=0, le=20)
    base_sim_years:      Optional[int] = Field(default=None, ge=1, le=50)

    # What-if overrides
    whatif_annual_return:  Optional[float] = Field(default=None, ge=0, le=50)
    whatif_extra_monthly:  float = Field(default=0.0, ge=0)
    whatif_sim_years:      Optional[int]   = Field(default=None, ge=1, le=50)
    whatif_inflation:      Optional[float] = Field(default=None, ge=0, le=20)

    # Whether to change target date (retire earlier/later)
    whatif_target_date:    Optional[date]  = None

    save_whatif:           bool = False

    @field_validator("whatif_extra_monthly")
    @classmethod
    def extra_monthly_non_negative(cls, v):
        if v < 0:
            raise ValueError("Extra monthly contribution cannot be negative")
        return v
