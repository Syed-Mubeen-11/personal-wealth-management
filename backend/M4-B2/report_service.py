"""
B2-3: PDF & CSV Report Service
app/services/report_service.py
"""
import io
import csv
from datetime import date
from typing import Literal
from sqlalchemy.orm import Session

# ReportLab imports
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics import renderPDF

from app.models import Investment, Goal, Transaction, User  # adjust to your models


# ─────────────────────────────────────────────────────────────────────────────
# B2-3  generate_pdf_report
# ─────────────────────────────────────────────────────────────────────────────

def generate_pdf_report(user_id: int, db: Session) -> bytes:
    """
    Generates a 4-section PDF report and returns raw PDF bytes.

    Sections:
      1. Cover          – user name, risk profile, report date
      2. Portfolio Sum  – table: symbol, asset_type, units, avg_buy, current_value, gain/loss
      3. Goals Progress – progress bar per goal
      4. Recommendations – latest recommendation text + allocation table
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        title="Wealth Report",
    )

    user: User = db.query(User).filter(User.id == user_id).first()
    investments = db.query(Investment).filter(Investment.user_id == user_id).all()
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()

    styles = getSampleStyleSheet()
    story = []

    # ── Section 1: Cover ───────────────────────────────────────────────────
    story.append(Spacer(1, 30 * mm))
    cover_title = ParagraphStyle(
        "CoverTitle",
        parent=styles["Title"],
        fontSize=28,
        textColor=colors.HexColor("#1a1a2e"),
        spaceAfter=8,
    )
    story.append(Paragraph("Wealth Report", cover_title))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#4a90d9")))
    story.append(Spacer(1, 6 * mm))

    sub_style = ParagraphStyle("Sub", parent=styles["Normal"], fontSize=13, spaceAfter=4)
    story.append(Paragraph(f"<b>Client:</b> {user.full_name if user else 'N/A'}", sub_style))
    story.append(Paragraph(f"<b>Risk Profile:</b> {getattr(user, 'risk_profile', 'Moderate')}", sub_style))
    story.append(Paragraph(f"<b>Report Date:</b> {date.today().strftime('%d %B %Y')}", sub_style))
    story.append(Spacer(1, 20 * mm))

    # ── Section 2: Portfolio Summary ───────────────────────────────────────
    section_header = ParagraphStyle(
        "SectionH", parent=styles["Heading1"], fontSize=15,
        textColor=colors.HexColor("#1a1a2e"), spaceBefore=12, spaceAfter=6,
    )
    story.append(Paragraph("Portfolio Summary", section_header))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey))
    story.append(Spacer(1, 3 * mm))

    port_headers = ["Symbol", "Asset Type", "Units", "Avg Buy (₹)", "Current (₹)", "Gain/Loss (%)"]
    port_data = [port_headers]
    for inv in investments:
        gain_pct = (
            ((inv.current_value - inv.cost_basis) / inv.cost_basis * 100)
            if inv.cost_basis else 0.0
        )
        port_data.append([
            inv.symbol,
            inv.asset_type,
            f"{inv.quantity:.2f}",
            f"{inv.avg_buy_price:.2f}",
            f"{inv.current_value:.2f}",
            f"{gain_pct:+.2f}%",
        ])

    port_table = Table(port_data, repeatRows=1, hAlign="LEFT")
    port_table.setStyle(_table_style())
    story.append(port_table)
    story.append(Spacer(1, 8 * mm))

    # ── Section 3: Goals Progress ──────────────────────────────────────────
    story.append(Paragraph("Goals Progress", section_header))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey))
    story.append(Spacer(1, 3 * mm))

    for goal in goals:
        progress = min(goal.current_amount / goal.target_amount, 1.0) if goal.target_amount else 0
        _append_progress_bar(story, goal.name, progress, goal.target_amount, styles)

    story.append(Spacer(1, 8 * mm))

    # ── Section 4: Recommendations ─────────────────────────────────────────
    story.append(Paragraph("Recommendations", section_header))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey))
    story.append(Spacer(1, 3 * mm))

    rec_text = getattr(user, "latest_recommendation", None) or (
        "Based on your risk profile and current portfolio, we recommend rebalancing "
        "toward your target allocation. Review the suggestions in the rebalance section."
    )
    story.append(Paragraph(rec_text, styles["Normal"]))
    story.append(Spacer(1, 5 * mm))

    # Allocation table (target weights)
    try:
        from app.services.allocation_engine import get_target_allocation
        targets = get_target_allocation(user_id, db)
        alloc_data = [["Asset Type", "Target Weight"]] + [
            [k, f"{v*100:.1f}%"] for k, v in targets.items()
        ]
        alloc_table = Table(alloc_data, hAlign="LEFT")
        alloc_table.setStyle(_table_style())
        story.append(alloc_table)
    except Exception:
        story.append(Paragraph("Allocation data unavailable.", styles["Normal"]))

    doc.build(story)
    return buffer.getvalue()


# ─────────────────────────────────────────────────────────────────────────────
# CSV Export helpers (used by B2-5 endpoint)
# ─────────────────────────────────────────────────────────────────────────────

CSVType = Literal["portfolio", "goals", "transactions"]


def generate_csv_report(user_id: int, report_type: CSVType, db: Session) -> str:
    """Returns CSV as a string (caller wraps in StreamingResponse)."""
    buffer = io.StringIO()

    if report_type == "portfolio":
        _write_portfolio_csv(user_id, db, buffer)
    elif report_type == "goals":
        _write_goals_csv(user_id, db, buffer)
    elif report_type == "transactions":
        _write_transactions_csv(user_id, db, buffer)

    return buffer.getvalue()


def _write_portfolio_csv(user_id: int, db: Session, buf: io.StringIO) -> None:
    writer = csv.writer(buf)
    writer.writerow(["symbol", "asset_type", "units", "avg_buy_price", "current_value", "gain_loss_pct"])
    investments = db.query(Investment).filter(Investment.user_id == user_id).all()
    for inv in investments:
        gain_pct = (
            (inv.current_value - inv.cost_basis) / inv.cost_basis * 100
            if inv.cost_basis else 0.0
        )
        writer.writerow([
            inv.symbol,
            inv.asset_type,
            round(inv.quantity, 4),
            round(inv.avg_buy_price, 2),
            round(inv.current_value, 2),
            round(gain_pct, 2),
        ])


def _write_goals_csv(user_id: int, db: Session, buf: io.StringIO) -> None:
    writer = csv.writer(buf)
    writer.writerow(["goal_type", "target_amount", "monthly_contribution", "status", "target_date"])
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    for g in goals:
        writer.writerow([
            g.goal_type,
            g.target_amount,
            g.monthly_contribution,
            g.status,
            g.target_date,
        ])


def _write_transactions_csv(user_id: int, db: Session, buf: io.StringIO) -> None:
    writer = csv.writer(buf)
    writer.writerow(["symbol", "type", "quantity", "price", "fees", "executed_at"])
    txns = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    for t in txns:
        writer.writerow([
            t.symbol,
            t.type,
            t.quantity,
            t.price,
            t.fees,
            t.executed_at,
        ])


# ─────────────────────────────────────────────────────────────────────────────
# Private ReportLab utilities
# ─────────────────────────────────────────────────────────────────────────────

def _table_style() -> TableStyle:
    return TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f2f5fb")]),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.lightgrey),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ])


def _append_progress_bar(story, name: str, progress: float, target: float, styles) -> None:
    """Draws a labelled progress bar using ReportLab Drawing."""
    bar_w, bar_h = 400, 14
    filled_w = bar_w * progress

    d = Drawing(bar_w, bar_h + 4)
    # Background
    d.add(Rect(0, 0, bar_w, bar_h, fillColor=colors.HexColor("#e0e0e0"), strokeColor=None))
    # Fill
    if filled_w > 0:
        d.add(Rect(0, 0, filled_w, bar_h, fillColor=colors.HexColor("#4a90d9"), strokeColor=None))

    label_style = ParagraphStyle(
        "BarLabel", parent=styles["Normal"], fontSize=9, spaceAfter=2
    )
    story.append(
        Paragraph(
            f"<b>{name}</b> — ₹{target:,.0f} target &nbsp; ({progress*100:.0f}% complete)",
            label_style,
        )
    )
    story.append(d)
    story.append(Spacer(1, 4 * mm))
