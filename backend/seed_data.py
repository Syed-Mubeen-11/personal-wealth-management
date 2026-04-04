"""
Comprehensive Data Seeder
=========================
Populates all model tables with realistic, varied, non-linear data so that
every chart and trend in the frontend is visually informative.

Tables seeded:
  - users        (1 demo user, skipped if exists)
  - assets       (diverse: stocks, bonds, ETFs, crypto, cash)
  - transactions (18+ months of buys, sells, contributions, withdrawals — non-linear)
  - goals        (multiple types at different completion stages)
  - simulations  (pre-computed SIP, retirement, loan scenarios)
  - recommendations (AI-generated style entries)

Usage:
  cd backend
  python seed_data.py
"""

import sys, os, random, math
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, date, timedelta
from database import engine, SessionLocal
import models
from auth import get_password_hash

# ── Ensure tables exist ──────────────────────────────────────────────────────
models.Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ── 1. USER ──────────────────────────────────────────────────────────────────
EMAIL = "aabeltemp@gmail.com"
PASSWORD = "Aabel@2003"

user = db.query(models.User).filter(models.User.email == EMAIL).first()
if not user:
    user = models.User(
        name="Aabel",
        email=EMAIL,
        password=get_password_hash(PASSWORD),
        phone_number="+1 (555) 234-5678",
        residential_address="42 Wall Street, New York, NY 10005",
        date_of_birth=date(2003, 6, 15),
        risk_profile=models.RiskEnum.moderate,
        kyc_status=models.KYCEnum.verified,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"[+] Created user '{EMAIL}' (ID={user.id})")
else:
    print(f"[=] User '{EMAIL}' already exists (ID={user.id})")

USER_ID = user.id

# ── Helper: clear old seed data (idempotent re-runs) ────────────────────────
print("[*] Clearing existing seed data for this user...")
db.query(models.Recommendation).filter(models.Recommendation.user_id == USER_ID).delete()
db.query(models.Simulation).filter(models.Simulation.user_id == USER_ID).delete()
db.query(models.Goal).filter(models.Goal.user_id == USER_ID).delete()
db.query(models.Transaction).filter(models.Transaction.owner_id == USER_ID).delete()
db.query(models.Asset).filter(models.Asset.owner_id == USER_ID).delete()
db.commit()

# ── 2. ASSETS — diverse across asset classes ─────────────────────────────────
# (symbol, company_name, asset_class, quantity, buy_price, current_price)
assets_data = [
    # Stocks — mix of winners and losers
    ("AAPL",  "Apple Inc.",           "Stock",  25,  142.50,  189.25),
    ("MSFT",  "Microsoft Corp.",      "Stock",  18,  285.00,  378.90),
    ("GOOGL", "Alphabet Inc.",        "Stock",  10,  125.30,  152.40),
    ("AMZN",  "Amazon.com Inc.",      "Stock",  12,  178.50,  185.60),
    ("TSLA",  "Tesla Inc.",           "Stock",   8,  245.00,  198.30),   # loser
    ("JPM",   "JPMorgan Chase",       "Stock",  15,  148.20,  196.50),
    ("NVDA",  "NVIDIA Corp.",         "Stock",   5,  450.00,  875.30),   # big winner
    ("META",  "Meta Platforms",       "Stock",   7,  320.00,  492.10),
    # ETFs
    ("VOO",   "Vanguard S&P 500",    "ETF",    20,  380.00,  452.80),
    ("QQQ",   "Invesco QQQ Trust",   "ETF",    12,  350.00,  425.60),
    ("VTI",   "Vanguard Total Mkt",  "ETF",    30,  210.00,  248.30),
    # Bonds
    ("BND",   "Vanguard Total Bond", "Bond",   40,   72.50,   71.80),   # slight loss
    ("TLT",   "iShares 20+ Yr",     "Bond",   25,   98.40,  100.60),
    ("AGG",   "iShares Core Bond",   "Bond",   35,  100.20,   99.90),   # nearly flat
    # Crypto
    ("BTC",   "Bitcoin",             "Crypto",  0.5, 28500.00, 67200.00),  # big winner
    ("ETH",   "Ethereum",            "Crypto",  3.0,  1750.00,  3420.00),
    # Cash
    ("CASH",  "Cash Reserves",       "Cash",  1.0, 15000.00, 15000.00),
]

print(f"[+] Seeding {len(assets_data)} assets...")
for sym, name, cls, qty, buy, cur in assets_data:
    asset = models.Asset(
        symbol=sym,
        company_name=name,
        asset_class=cls,
        quantity=qty,
        buy_price=buy,
        current_value=round(qty * cur, 2),
        last_price=cur,
        last_price_at=datetime.utcnow() - timedelta(minutes=random.randint(5, 120)),
        owner_id=USER_ID,
    )
    db.add(asset)
db.commit()

# ── 3. TRANSACTIONS — 18 months of non-linear activity ──────────────────────
# Generate realistic buy/sell/contribution/withdrawal transactions
# with varying frequency and amounts — NOT linear.
print("[+] Seeding transactions (18 months of history)...")
today = datetime.utcnow()
start_date = today - timedelta(days=540)  # ~18 months ago

transactions = []

## Removed all Contribution transactions

# Stock purchases spread over time with non-uniform timing
stock_buys = [
    ("AAPL",  25,  142.50, 0),   ("MSFT",  18,  285.00, 15),
    ("GOOGL", 10,  125.30, 45),  ("VOO",   20,  380.00, 60),
    ("NVDA",   5,  450.00, 90),  ("BTC",    0.5, 28500.00, 30),
    ("ETH",    3.0, 1750.00, 75), ("JPM",   15,  148.20, 120),
    ("TSLA",   8,  245.00, 150), ("META",    7,  320.00, 180),
    ("QQQ",   12,  350.00, 200), ("VTI",   30,  210.00, 210),
    ("BND",   40,   72.50, 240), ("TLT",   25,   98.40, 270),
    ("AGG",   35,  100.20, 300), ("AMZN",  12,  178.50, 330),
]
for sym, qty, price, days_after in stock_buys:
    d = start_date + timedelta(days=days_after + random.randint(0, 5), hours=random.randint(9, 16), minutes=random.randint(0, 59))
    transactions.append(("Buy", sym, qty, round(qty * price, 2), d))

# Some sells (profit taking and loss cutting) at different points
sells = [
    ("AAPL",  5, 175.00, 250),   # partial profit take
    ("TSLA",  3, 210.00, 360),   # cut loss
    ("NVDA",  2, 720.00, 400),   # big profit take
    ("VOO",   5, 430.00, 420),   # rebalance
    ("BTC",   0.1, 55000.00, 450),  # crypto profit
]
for sym, qty, price, days_after in sells:
    d = start_date + timedelta(days=days_after + random.randint(0, 3), hours=random.randint(9, 16), minutes=random.randint(0, 59))
    transactions.append(("Sell", sym, qty, round(qty * price, 2), d))

## Removed all Withdrawal transactions

print(f"    {len(transactions)} transactions generated (excluding Contribution/Withdrawal)")
for txn_type, sym, qty, amount, d in transactions:
    # Only add non-cash transactions
    if txn_type not in ("Contribution", "Withdrawal"):
        asset_symbol = sym
        quantity = qty
        tx_date = min(d, today)
        t = models.Transaction(
            date=tx_date,
            transaction_type=txn_type,
            asset_symbol=asset_symbol,
            quantity=quantity,
            amount=amount,
            owner_id=USER_ID,
        )
        db.add(t)
db.commit()

# ── 4. GOALS — multiple types at various completion stages ───────────────────
print("[+] Seeding goals...")
goals_data = [
    {
        "goal_name": "Retirement Fund",
        "goal_type": models.GoalTypeEnum.retirement,
        "target_amount": 1000000.00,
        "monthly_contribution": 3000.00,
        "target_date": date(2050, 1, 1),
        "status": models.GoalStatusEnum.active,
        "created_at": today - timedelta(days=400),
    },
    {
        "goal_name": "Dream Home Down Payment",
        "goal_type": models.GoalTypeEnum.home,
        "target_amount": 120000.00,
        "monthly_contribution": 2000.00,
        "target_date": date(2028, 6, 1),
        "status": models.GoalStatusEnum.active,
        "created_at": today - timedelta(days=350),
    },
    {
        "goal_name": "Kids College Fund",
        "goal_type": models.GoalTypeEnum.education,
        "target_amount": 80000.00,
        "monthly_contribution": 800.00,
        "target_date": date(2035, 9, 1),
        "status": models.GoalStatusEnum.active,
        "created_at": today - timedelta(days=300),
    },
    {
        "goal_name": "Japan Travel Fund",
        "goal_type": models.GoalTypeEnum.travel,
        "target_amount": 8000.00,
        "monthly_contribution": 500.00,
        "target_date": date(2026, 12, 1),
        "status": models.GoalStatusEnum.active,
        "created_at": today - timedelta(days=200),
    },
    {
        "goal_name": "Emergency Fund",
        "goal_type": models.GoalTypeEnum.custom,
        "target_amount": 25000.00,
        "monthly_contribution": 1500.00,
        "target_date": date(2025, 12, 31),
        "status": models.GoalStatusEnum.completed,
        "created_at": today - timedelta(days=500),
    },
    {
        "goal_name": "New Car Fund",
        "goal_type": models.GoalTypeEnum.custom,
        "target_amount": 35000.00,
        "monthly_contribution": 400.00,
        "target_date": date(2029, 3, 1),
        "status": models.GoalStatusEnum.paused,
        "created_at": today - timedelta(days=250),
    },
]

goal_ids = []
for g in goals_data:
    goal = models.Goal(user_id=USER_ID, **g)
    db.add(goal)
    db.flush()
    goal_ids.append(goal.id)
db.commit()

# ── 5. SIMULATIONS — pre-saved scenarios with non-linear projections ─────────
print("[+] Seeding simulations...")

# SIP simulation
sip_projections = []
total_inv = 0
total_val = 0
for yr in range(1, 21):
    for _ in range(12):
        total_inv += 5000
        total_val += 5000
        total_val *= (1 + 0.12 / 12)
    sip_projections.append({
        "year": yr,
        "invested_amount": round(total_inv, 2),
        "interest_earned": round(total_val - total_inv, 2),
        "total_value": round(total_val, 2),
    })

sim1 = models.Simulation(
    user_id=USER_ID,
    goal_id=goal_ids[0],  # retirement
    scenario_name="Aggressive SIP – 20yr @ 12%",
    assumptions={
        "type": "sip",
        "monthly_investment": 5000,
        "years": 20,
        "expected_return_rate": 12,
    },
    results={
        "total_invested": round(total_inv, 2),
        "estimated_returns": round(total_val - total_inv, 2),
        "total_value": round(total_val, 2),
        "annual_return_rate": 12,
        "yearly_projections": sip_projections,
    },
    created_at=today - timedelta(days=30),
)
db.add(sim1)

# Conservative SIP
total_inv2 = 0
total_val2 = 0
sip2_proj = []
for yr in range(1, 16):
    for _ in range(12):
        total_inv2 += 3000
        total_val2 += 3000
        total_val2 *= (1 + 0.07 / 12)
    sip2_proj.append({
        "year": yr,
        "invested_amount": round(total_inv2, 2),
        "interest_earned": round(total_val2 - total_inv2, 2),
        "total_value": round(total_val2, 2),
    })

sim2 = models.Simulation(
    user_id=USER_ID,
    goal_id=goal_ids[1],  # home
    scenario_name="Conservative SIP – 15yr @ 7%",
    assumptions={
        "type": "sip",
        "monthly_investment": 3000,
        "years": 15,
        "expected_return_rate": 7,
    },
    results={
        "total_invested": round(total_inv2, 2),
        "estimated_returns": round(total_val2 - total_inv2, 2),
        "total_value": round(total_val2, 2),
        "annual_return_rate": 7,
        "yearly_projections": sip2_proj,
    },
    created_at=today - timedelta(days=20),
)
db.add(sim2)

# Retirement simulation
ret_projections = []
corpus = 50000
ret_invested = 50000
for yr in range(1, 26):
    for _ in range(12):
        corpus += 4000
        corpus *= (1 + 0.09 / 12)
        ret_invested += 4000
    ret_projections.append({
        "age": 30 + yr,
        "year": yr,
        "invested": round(ret_invested, 2),
        "corpus": round(corpus, 2),
        "phase": "accumulation",
    })

sim3 = models.Simulation(
    user_id=USER_ID,
    goal_id=goal_ids[0],  # retirement
    scenario_name="Retirement Plan – retire at 55",
    assumptions={
        "type": "retirement",
        "current_age": 30,
        "retirement_age": 55,
        "current_savings": 50000,
        "monthly_contribution": 4000,
        "expected_return_rate": 9,
        "post_retirement_return_rate": 5,
        "inflation_rate": 3,
        "monthly_expense_at_retirement": 5000,
    },
    results={
        "corpus_at_retirement": round(corpus, 2),
        "inflation_adjusted_expense": round(5000 * (1.03 ** 25), 2),
        "corpus_lasts_until_age": 82,
        "monthly_income_at_retirement": round(corpus * 0.05 / 12, 2),
        "total_invested": round(ret_invested, 2),
        "total_returns": round(corpus - ret_invested, 2),
        "yearly_projections": ret_projections,
    },
    created_at=today - timedelta(days=15),
)
db.add(sim3)

# Loan payoff simulation
principal = 250000
annual_rate = 6.5
term_months = 360
monthly_rate = annual_rate / 100 / 12
monthly_payment = principal * (monthly_rate * (1 + monthly_rate) ** term_months) / ((1 + monthly_rate) ** term_months - 1)
balance = principal
total_interest = 0
amort = []
for m in range(1, term_months + 1):
    interest = balance * monthly_rate
    princ_pay = monthly_payment - interest
    balance -= princ_pay
    total_interest += interest
    if m % 12 == 0 or m <= 3 or m == term_months:
        amort.append({"month": m, "balance": round(max(balance, 0), 2), "interest": round(interest, 2), "principal": round(princ_pay, 2)})

sim4 = models.Simulation(
    user_id=USER_ID,
    goal_id=None,
    scenario_name="Mortgage – $250K @ 6.5%",
    assumptions={
        "type": "loan",
        "principal": 250000,
        "annual_interest_rate": 6.5,
        "loan_term_months": 360,
        "extra_monthly_payment": 0,
    },
    results={
        "monthly_payment": round(monthly_payment, 2),
        "total_interest": round(total_interest, 2),
        "total_amount": round(principal + total_interest, 2),
        "payoff_months": 360,
        "amortization_schedule": amort,
    },
    created_at=today - timedelta(days=10),
)
db.add(sim4)

# Loan with extra payment
extra = 300
balance2 = principal
total_int2 = 0
amort2 = []
m2 = 0
while balance2 > 0:
    m2 += 1
    interest = balance2 * monthly_rate
    princ_pay = monthly_payment + extra - interest
    if princ_pay > balance2:
        princ_pay = balance2
    balance2 -= princ_pay
    total_int2 += interest
    if m2 % 12 == 0 or m2 <= 3 or balance2 <= 0:
        amort2.append({"month": m2, "balance": round(max(balance2, 0), 2)})

sim5 = models.Simulation(
    user_id=USER_ID,
    goal_id=None,
    scenario_name="Mortgage + $300 extra/mo",
    assumptions={
        "type": "loan",
        "principal": 250000,
        "annual_interest_rate": 6.5,
        "loan_term_months": 360,
        "extra_monthly_payment": 300,
    },
    results={
        "monthly_payment": round(monthly_payment + extra, 2),
        "total_interest": round(total_int2, 2),
        "total_amount": round(principal + total_int2, 2),
        "payoff_months": m2,
        "interest_saved": round(total_interest - total_int2, 2),
        "months_saved": 360 - m2,
        "amortization_schedule": amort2,
    },
    created_at=today - timedelta(days=8),
)
db.add(sim5)
db.commit()

# ── 6. RECOMMENDATIONS — pre-seeded AI-style entries ─────────────────────────
print("[+] Seeding recommendations...")
recs = [
    {
        "title": "Increase Bond Allocation for Stability",
        "recommendation_text": (
            "Your portfolio is heavily weighted toward growth stocks (62%). "
            "With rising interest rate uncertainty, consider shifting 8-10% into "
            "investment-grade bonds (BND, AGG) to reduce volatility while maintaining "
            "a moderate risk profile. This rebalance could lower your maximum drawdown "
            "by ~15% during market corrections."
        ),
        "suggested_allocation": {"Stocks": 0.52, "Bonds": 0.22, "ETFs": 0.15, "Crypto": 0.06, "Cash": 0.05},
        "is_read": 1,
        "created_at": today - timedelta(days=25),
    },
    {
        "title": "Take Partial Profits on NVDA",
        "recommendation_text": (
            "NVIDIA has returned +94% since your purchase. Consider selling 20-30% "
            "of your position to lock in gains and redeploy into broader market ETFs. "
            "Concentration risk in a single stock above 10% of portfolio value is "
            "elevated — NVDA currently represents ~12.3% of your holdings."
        ),
        "suggested_allocation": {"Stocks": 0.55, "ETFs": 0.20, "Bonds": 0.15, "Crypto": 0.05, "Cash": 0.05},
        "is_read": 1,
        "created_at": today - timedelta(days=18),
    },
    {
        "title": "Boost Monthly Retirement Contributions",
        "recommendation_text": (
            "Based on your retirement goal of $1M by 2050, your current $3,000/month "
            "contribution puts you on track for ~$890K at a 7% average return. "
            "Increasing to $3,500/month closes the gap with a 95% confidence interval. "
            "Even $250/month more makes a significant difference over 24 years of compounding."
        ),
        "suggested_allocation": {"Stocks": 0.50, "ETFs": 0.20, "Bonds": 0.18, "Crypto": 0.05, "Cash": 0.07},
        "is_read": 0,
        "created_at": today - timedelta(days=7),
    },
    {
        "title": "Diversify Crypto Exposure",
        "recommendation_text": (
            "Your crypto allocation is concentrated in BTC and ETH only. While these "
            "are the most established, adding a small position in a crypto index fund "
            "or diversified crypto ETF could reduce single-asset risk. Keep total crypto "
            "exposure under 8% given your moderate risk profile."
        ),
        "suggested_allocation": {"Stocks": 0.50, "ETFs": 0.22, "Bonds": 0.15, "Crypto": 0.08, "Cash": 0.05},
        "is_read": 0,
        "created_at": today - timedelta(days=3),
    },
    {
        "title": "Rebalance: Tech Overweight Detected",
        "recommendation_text": (
            "Technology sector now accounts for 45% of your equity holdings (AAPL, MSFT, "
            "GOOGL, NVDA, META, QQQ). For a moderate risk profile, sector concentration "
            "above 35% increases correlation risk. Consider trimming tech by 5-8% and "
            "rotating into healthcare (XLV) or consumer staples (XLP) for better "
            "sector diversification."
        ),
        "suggested_allocation": {"Stocks": 0.48, "ETFs": 0.25, "Bonds": 0.15, "Crypto": 0.05, "Cash": 0.07},
        "is_read": 0,
        "created_at": today - timedelta(days=1),
    },
]

for r in recs:
    rec = models.Recommendation(user_id=USER_ID, **r)
    db.add(rec)
db.commit()

# ── Summary ──────────────────────────────────────────────────────────────────
asset_count = db.query(models.Asset).filter(models.Asset.owner_id == USER_ID).count()
txn_count = db.query(models.Transaction).filter(models.Transaction.owner_id == USER_ID).count()
goal_count = db.query(models.Goal).filter(models.Goal.user_id == USER_ID).count()
sim_count = db.query(models.Simulation).filter(models.Simulation.user_id == USER_ID).count()
rec_count = db.query(models.Recommendation).filter(models.Recommendation.user_id == USER_ID).count()

print("\n" + "=" * 50)
print("  SEED COMPLETE")
print("=" * 50)
print(f"  User:            {user.name} ({EMAIL})")
print(f"  Assets:          {asset_count}")
print(f"  Transactions:    {txn_count}")
print(f"  Goals:           {goal_count}")
print(f"  Simulations:     {sim_count}")
print(f"  Recommendations: {rec_count}")
print("=" * 50)
print(f"\n  Login:  {EMAIL}")
print(f"  Pass:   {PASSWORD}")

db.close()
