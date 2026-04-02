"""B2-3: PDF Report Service (ReportLab)

Generates a 4-section wealth-management PDF:
  1. Cover Page
  2. Portfolio Summary
  3. Goals Progress
  4. Rebalance Recommendations
"""

import io
from datetime import datetime
from typing import Any, Dict, List

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from sqlalchemy.orm import Session


def _heading(text: str, styles) -> Paragraph:
    return Paragraph(text, styles["Heading1"])


def _subheading(text: str, styles) -> Paragraph:
    return Paragraph(text, styles["Heading2"])


def _body(text: str, styles) -> Paragraph:
    return Paragraph(text, styles["BodyText"])


def _build_cover(user, styles) -> list:
    """Section 1 – Cover Page."""
    elements = []
    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Title"],
        fontSize=28,
        spaceAfter=30,
        textColor=colors.HexColor("#1a237e"),
    )
    elements.append(Spacer(1, 2 * inch))
    elements.append(Paragraph("Personal Wealth Management", title_style))
    elements.append(Spacer(1, 0.3 * inch))
    elements.append(
        Paragraph("Portfolio Report", styles["Heading2"])
    )
    elements.append(Spacer(1, 0.5 * inch))
    elements.append(_body(f"Prepared for: {user.name or user.email}", styles))
    elements.append(
        _body(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles)
    )
    elements.append(Spacer(1, 3 * inch))
    return elements


def _build_portfolio(user, db: Session, styles) -> list:
    """Section 2 – Portfolio Summary table."""
    import models

    elements = []
    elements.append(_heading("Portfolio Summary", styles))
    elements.append(Spacer(1, 0.2 * inch))

    assets = db.query(models.Asset).filter(models.Asset.owner_id == user.id).all()

    if not assets:
        elements.append(_body("No assets in portfolio.", styles))
        return elements

    header = ["Symbol", "Company", "Class", "Qty", "Buy Price", "Current Value"]
    data: List[list] = [header]
    total = 0.0
    for a in assets:
        cv = a.current_value or (a.quantity or 0) * (a.buy_price or 0)
        total += cv
        data.append([
            a.symbol or "",
            (a.company_name or "")[:25],
            a.asset_class or "",
            f"{a.quantity:,.2f}" if a.quantity else "0",
            f"${a.buy_price:,.2f}" if a.buy_price else "$0.00",
            f"${cv:,.2f}",
        ])
    data.append(["", "", "", "", "Total", f"${total:,.2f}"])

    tbl = Table(data, repeatRows=1)
    tbl.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a237e")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("FONTSIZE", (0, 1), (-1, -1), 8),
            ("ALIGN", (3, 0), (-1, -1), "RIGHT"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.whitesmoke, colors.white]),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ])
    )
    elements.append(tbl)
    elements.append(Spacer(1, 0.4 * inch))
    return elements


def _build_goals(user, db: Session, styles) -> list:
    """Section 3 – Goals Progress table."""
    import models

    elements = []
    elements.append(_heading("Goals Progress", styles))
    elements.append(Spacer(1, 0.2 * inch))

    goals = db.query(models.Goal).filter(models.Goal.user_id == user.id).all()

    if not goals:
        elements.append(_body("No goals defined yet.", styles))
        return elements

    header = ["Goal", "Type", "Target", "Target Date", "Monthly", "Status"]
    data: List[list] = [header]
    for g in goals:
        data.append([
            (g.goal_name or "")[:25],
            g.goal_type.value if g.goal_type else "",
            f"${g.target_amount:,.2f}" if g.target_amount else "$0",
            str(g.target_date) if g.target_date else "N/A",
            f"${g.monthly_contribution:,.2f}" if g.monthly_contribution else "$0",
            g.status.value if g.status else "",
        ])

    tbl = Table(data, repeatRows=1)
    tbl.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a237e")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("FONTSIZE", (0, 1), (-1, -1), 8),
            ("ALIGN", (2, 0), (2, -1), "RIGHT"),
            ("ALIGN", (4, 0), (4, -1), "RIGHT"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
        ])
    )
    elements.append(tbl)
    elements.append(Spacer(1, 0.4 * inch))
    return elements


def _build_recommendations(user, db: Session, styles) -> list:
    """Section 4 – Rebalance Recommendations."""
    from app.services.rebalance_service import compute_rebalance

    elements = []
    elements.append(_heading("Rebalance Recommendations", styles))
    elements.append(Spacer(1, 0.2 * inch))

    result = compute_rebalance(user, db)

    elements.append(
        _body(f"Risk Profile: <b>{result['risk_profile']}</b> &nbsp;|&nbsp; "
              f"Total Portfolio Value: <b>${result['total_value']:,.2f}</b>", styles)
    )
    elements.append(Spacer(1, 0.15 * inch))

    if not result["suggestions"]:
        elements.append(_body("Your portfolio is well balanced — no changes needed.", styles))
        return elements

    header = ["Asset Type", "Action", "Symbol", "Qty Change", "Est. Value", "Drift Impact"]
    data: List[list] = [header]
    for s in result["suggestions"]:
        data.append([
            s.get("asset_type", ""),
            s.get("action", ""),
            s.get("symbol", ""),
            f"{s.get('qty_change', 0):,.2f}",
            f"${s.get('estimated_value', 0):,.2f}",
            f"{s.get('drift_impact', 0):+.1f}%",
        ])

    tbl = Table(data, repeatRows=1)
    tbl.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a237e")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("FONTSIZE", (0, 1), (-1, -1), 8),
            ("ALIGN", (1, 0), (3, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
        ])
    )
    elements.append(tbl)
    return elements


# ────────────────────────────────────────────────────────────────────
# Public API
# ────────────────────────────────────────────────────────────────────

def generate_pdf_report(user, db: Session) -> io.BytesIO:
    """Build the full PDF and return an in-memory buffer ready to stream."""
    buf = io.BytesIO()
    styles = getSampleStyleSheet()

    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
    )

    elements: list = []
    elements.extend(_build_cover(user, styles))
    elements.extend(_build_portfolio(user, db, styles))
    elements.extend(_build_goals(user, db, styles))
    elements.extend(_build_recommendations(user, db, styles))

    doc.build(elements)
    buf.seek(0)
    return buf
