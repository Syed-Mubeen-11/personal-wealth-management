"""
Report Service — PDF and CSV export generation.
Uses ReportLab for PDF and Python's csv module for CSV exports.
"""

import io
import csv
from datetime import date
from typing import Optional
from sqlalchemy.orm import Session

from app.models.portfolio import Investment, Transaction
from app.models.goal import Goal, GoalStatus
from app.models.recommendation import Recommendation
from app.models.user import User


# ── PDF Report ────────────────────────────────────────────────────────────────

def generate_pdf_report(user_id: int, db: Session) -> bytes:
    """
    Generate a multi-section PDF report using ReportLab.
    Sections: Cover, Portfolio Summary, Goals Progress, Recommendations.
    Returns raw PDF bytes.
    """
    try:
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
            HRFlowable, PageBreak
        )
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
        from reportlab.graphics.shapes import Drawing, Rect
        from reportlab.graphics import renderPDF
    except ImportError:
        raise RuntimeError("reportlab is not installed. Run: pip install reportlab")

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    # ── Styles ─────────────────────────────────────────────────────────────
    styles = getSampleStyleSheet()
    PURPLE = colors.HexColor("#7c3aed")
    DARK   = colors.HexColor("#1a2035")
    LIGHT  = colors.HexColor("#f1f5f9")
    GREEN  = colors.HexColor("#10b981")
    RED    = colors.HexColor("#f43f5e")
    BORDER = colors.HexColor("#252f47")

    h1_style = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=22, textColor=PURPLE, spaceAfter=6)
    h2_style = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=14, textColor=PURPLE, spaceAfter=4)
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, textColor=colors.HexColor("#475569"), spaceAfter=4)
    small_style = ParagraphStyle("Small", parent=styles["Normal"], fontSize=8, textColor=colors.HexColor("#94a3b8"))

    # ── Fetch Data ─────────────────────────────────────────────────────────
    user = db.query(User).filter(User.id == user_id).first()
    investments = db.query(Investment).filter(Investment.user_id == user_id).all()
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    latest_rec = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == user_id)
        .order_by(Recommendation.created_at.desc())
        .first()
    )

    story = []

    # ── SECTION 1: Cover ───────────────────────────────────────────────────
    story.append(Spacer(1, 1 * inch))
    story.append(Paragraph("WealthApp", ParagraphStyle("Brand", parent=styles["Normal"], fontSize=32, textColor=PURPLE, alignment=TA_CENTER, fontName="Helvetica-Bold")))
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph("Personal Wealth Management Report", ParagraphStyle("Sub", parent=styles["Normal"], fontSize=16, textColor=colors.HexColor("#94a3b8"), alignment=TA_CENTER)))
    story.append(Spacer(1, 0.3 * inch))

    risk_profile = str(user.risk_profile.value if hasattr(user.risk_profile, 'value') else (user.risk_profile or "N/A"))
    cover_data = [
        ["Client Name:", user.name or "N/A"],
        ["Email:", user.email or "N/A"],
        ["Risk Profile:", risk_profile.title()],
        ["Report Date:", date.today().strftime("%B %d, %Y")],
    ]
    cover_table = Table(cover_data, colWidths=[2 * inch, 4 * inch])
    cover_table.setStyle(TableStyle([
        ("FONTSIZE",    (0, 0), (-1, -1), 11),
        ("TEXTCOLOR",   (0, 0), (0, -1), colors.HexColor("#94a3b8")),
        ("TEXTCOLOR",   (1, 0), (1, -1), colors.HexColor("#1e293b")),
        ("FONTNAME",    (0, 0), (0, -1), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("ALIGN",       (0, 0), (-1, -1), "LEFT"),
    ]))
    story.append(cover_table)
    story.append(PageBreak())

    # ── SECTION 2: Portfolio Summary ───────────────────────────────────────
    story.append(Paragraph("Portfolio Summary", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER))
    story.append(Spacer(1, 0.15 * inch))

    if investments:
        total_cost = sum(float(inv.cost_basis or 0) for inv in investments)
        total_value = sum(float(inv.current_value or 0) for inv in investments)
        total_gain = total_value - total_cost
        gain_pct = (total_gain / total_cost * 100) if total_cost > 0 else 0

        story.append(Paragraph(
            f"Total Portfolio Value: <b>${total_value:,.2f}</b> | "
            f"Cost Basis: ${total_cost:,.2f} | "
            f"Gain/Loss: {'▲' if total_gain >= 0 else '▼'} ${abs(total_gain):,.2f} ({gain_pct:+.2f}%)",
            body_style
        ))
        story.append(Spacer(1, 0.1 * inch))

        table_data = [["Symbol", "Type", "Units", "Avg Price", "Cost Basis", "Current Value", "Gain/Loss %"]]
        for inv in investments:
            cost = float(inv.cost_basis or 0)
            val  = float(inv.current_value or 0)
            gl_pct = ((val - cost) / cost * 100) if cost > 0 else 0
            table_data.append([
                inv.symbol or "",
                str(inv.asset_type.value if hasattr(inv.asset_type, "value") else inv.asset_type),
                f"{float(inv.units or 0):.4f}",
                f"${float(inv.avg_buy_price or 0):,.2f}",
                f"${cost:,.2f}",
                f"${val:,.2f}",
                f"{gl_pct:+.2f}%",
            ])

        t = Table(table_data, repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND",  (0, 0), (-1, 0), PURPLE),
            ("TEXTCOLOR",   (0, 0), (-1, 0), colors.white),
            ("FONTNAME",    (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",    (0, 0), (-1, -1), 8),
            ("ALIGN",       (2, 1), (-1, -1), "RIGHT"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("GRID",        (0, 0), (-1, -1), 0.5, BORDER),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING",  (0, 0), (-1, -1), 5),
        ]))
        story.append(t)
    else:
        story.append(Paragraph("No investments found in your portfolio.", body_style))

    story.append(PageBreak())

    # ── SECTION 3: Goals Progress ──────────────────────────────────────────
    story.append(Paragraph("Goals Progress", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER))
    story.append(Spacer(1, 0.15 * inch))

    if goals:
        for goal in goals:
            target  = float(goal.target_amount or 0)
            current = float(goal.current_amount or 0)
            pct     = min((current / target * 100) if target > 0 else 0, 100)
            status_val = str(goal.status.value if hasattr(goal.status, "value") else goal.status)

            story.append(Paragraph(f"<b>{goal.name}</b> — {status_val.title()}", h2_style))
            story.append(Paragraph(
                f"Target: ${target:,.2f}  |  Saved: ${current:,.2f}  |  "
                f"Monthly: ${float(goal.monthly_contribution or 0):,.2f}  |  "
                f"Due: {goal.target_date}",
                body_style
            ))

            # Progress bar drawn with ReportLab Drawing
            bar_w = 5 * inch
            bar_h = 10
            d = Drawing(bar_w, bar_h + 4)
            d.add(Rect(0, 2, bar_w, bar_h, fillColor=colors.HexColor("#252f47"), strokeColor=None))
            fill_w = bar_w * (pct / 100)
            bar_color = GREEN if pct >= 100 else PURPLE
            if fill_w > 0:
                d.add(Rect(0, 2, fill_w, bar_h, fillColor=bar_color, strokeColor=None))
            story.append(d)
            story.append(Paragraph(f"{pct:.1f}% complete", small_style))
            story.append(Spacer(1, 0.1 * inch))
    else:
        story.append(Paragraph("No goals found.", body_style))

    story.append(PageBreak())

    # ── SECTION 4: Recommendations ─────────────────────────────────────────
    story.append(Paragraph("Latest Recommendation", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER))
    story.append(Spacer(1, 0.15 * inch))

    if latest_rec:
        story.append(Paragraph(latest_rec.title, h2_style))
        story.append(Paragraph(latest_rec.recommendation_text, body_style))
        story.append(Spacer(1, 0.1 * inch))

        alloc_data = [["Asset Class", "Target Allocation"]]
        for k, v in (latest_rec.suggested_allocation or {}).items():
            alloc_data.append([k.replace("_", " ").title(), f"{float(v)*100:.0f}%"])

        at = Table(alloc_data, colWidths=[3 * inch, 2 * inch])
        at.setStyle(TableStyle([
            ("BACKGROUND",  (0, 0), (-1, 0), PURPLE),
            ("TEXTCOLOR",   (0, 0), (-1, 0), colors.white),
            ("FONTNAME",    (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",    (0, 0), (-1, -1), 10),
            ("ALIGN",       (1, 0), (1, -1), "CENTER"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("GRID",        (0, 0), (-1, -1), 0.5, BORDER),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING",  (0, 0), (-1, -1), 6),
        ]))
        story.append(at)
    else:
        story.append(Paragraph("No recommendations generated yet. Complete your risk profile to get started.", body_style))

    # ── Build PDF ──────────────────────────────────────────────────────────
    doc.build(story)
    buf.seek(0)
    return buf.read()


# ── CSV Export ────────────────────────────────────────────────────────────────

def generate_csv_report(user_id: int, export_type: str, db: Session) -> str:
    """
    Generate a CSV string for the given type:
      - "portfolio"    → investments
      - "goals"        → goals
      - "transactions" → transactions
    Returns the CSV as a string.
    """
    buf = io.StringIO()
    writer = csv.writer(buf)

    if export_type == "portfolio":
        writer.writerow(["symbol", "asset_type", "units", "avg_buy_price", "cost_basis", "current_value", "gain_loss_pct"])
        investments = db.query(Investment).filter(Investment.user_id == user_id).all()
        for inv in investments:
            cost = float(inv.cost_basis or 0)
            val  = float(inv.current_value or 0)
            gl_pct = ((val - cost) / cost * 100) if cost > 0 else 0
            writer.writerow([
                inv.symbol,
                str(inv.asset_type.value if hasattr(inv.asset_type, "value") else inv.asset_type),
                float(inv.units or 0),
                float(inv.avg_buy_price or 0),
                cost,
                val,
                round(gl_pct, 2),
            ])

    elif export_type == "goals":
        writer.writerow(["goal_type", "name", "target_amount", "current_amount", "monthly_contribution", "status", "target_date"])
        goals = db.query(Goal).filter(Goal.user_id == user_id).all()
        for g in goals:
            writer.writerow([
                str(g.goal_type.value if hasattr(g.goal_type, "value") else g.goal_type),
                g.name,
                float(g.target_amount or 0),
                float(g.current_amount or 0),
                float(g.monthly_contribution or 0),
                str(g.status.value if hasattr(g.status, "value") else g.status),
                str(g.target_date),
            ])

    elif export_type == "transactions":
        writer.writerow(["symbol", "type", "quantity", "price", "fees", "executed_at"])
        transactions = db.query(Transaction).filter(Transaction.user_id == user_id).order_by(Transaction.executed_at.desc()).all()
        for txn in transactions:
            writer.writerow([
                txn.symbol or "",
                str(txn.type.value if hasattr(txn.type, "value") else txn.type),
                float(txn.quantity or 0),
                float(txn.price or 0),
                float(txn.fees or 0),
                txn.executed_at.isoformat() if txn.executed_at else "",
            ])
    else:
        raise ValueError(f"Unknown export type: '{export_type}'. Valid: portfolio, goals, transactions")

    return buf.getvalue()
