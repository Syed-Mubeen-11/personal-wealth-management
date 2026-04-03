from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.investments import Investment
from app.models.goals import Goal
from app.models.transactions import Transaction
from io import StringIO, BytesIO
import csv
from datetime import datetime
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm, inch
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, HRFlowable, KeepTogether
)
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

router = APIRouter()

# ── Modern Color Palette ──────────────────────────────────────────────────────
PRIMARY      = colors.HexColor('#3b82f6')
PRIMARY_DARK = colors.HexColor('#2563eb')
SUCCESS      = colors.HexColor('#22c55e')
DANGER       = colors.HexColor('#ef4444')
WARNING      = colors.HexColor('#f59e0b')
SLATE_900    = colors.HexColor('#0f172a')
SLATE_700    = colors.HexColor('#334155')
SLATE_500    = colors.HexColor('#64748b')
SLATE_300    = colors.HexColor('#cbd5e1')
SLATE_200    = colors.HexColor('#e2e8f0')
SLATE_100    = colors.HexColor('#f1f5f9')
WHITE        = colors.white


def rs(v):
    """Format as rupee string - using Rs. for compatibility"""
    try:
        return f"Rs.{float(v):,.2f}"
    except Exception:
        return "—"


def pct(v):
    try:
        return f"{float(v):.1f}%"
    except Exception:
        return "—"


def fmt_date(d):
    if not d:
        return "—"
    if isinstance(d, str):
        try:
            d = datetime.fromisoformat(d)
        except Exception:
            return d
    return d.strftime("%d %b %Y")


def build_styles():
    """Return a dict of paragraph styles"""
    return {
        "title": ParagraphStyle(
            "title",
            fontName="Helvetica-Bold",
            fontSize=22,
            textColor=SLATE_900,
            spaceAfter=2,
            leading=26,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            fontName="Helvetica",
            fontSize=9,
            textColor=SLATE_500,
            spaceAfter=0,
        ),
        "section": ParagraphStyle(
            "section",
            fontName="Helvetica-Bold",
            fontSize=14,
            textColor=PRIMARY,
            spaceBefore=16,
            spaceAfter=8,
            leading=18,
        ),
        "body": ParagraphStyle(
            "body",
            fontName="Helvetica",
            fontSize=9,
            textColor=SLATE_700,
            leading=13,
        ),
        "footer": ParagraphStyle(
            "footer",
            fontName="Helvetica",
            fontSize=7,
            textColor=SLATE_500,
            alignment=TA_CENTER,
        ),
        "stat_value": ParagraphStyle(
            "stat_value",
            fontName="Helvetica-Bold",
            fontSize=16,
            textColor=SLATE_900,
            leading=18,
        ),
        "stat_label": ParagraphStyle(
            "stat_label",
            fontName="Helvetica",
            fontSize=8,
            textColor=SLATE_500,
            leading=10,
        ),
    }


def header_table_style():
    """Style for table headers"""
    return TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ])


def data_table_style():
    """Style for data rows"""
    return TableStyle([
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('LEFTPADDING', (0, 1), (-1, -1), 6),
        ('RIGHTPADDING', (0, 1), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, SLATE_100]),
        ('GRID', (0, 0), (-1, -1), 0.5, SLATE_200),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ])


# ── GET /reports/pdf ──────────────────────────────────────────────────────────
@router.get("/pdf")
def generate_pdf_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    scope: str = "full"
):
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id)\
                 .order_by(Transaction.executed_at.desc()).limit(50).all()

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=15*mm, rightMargin=15*mm,
        topMargin=20*mm, bottomMargin=15*mm,
    )
    S = build_styles()
    story = []
    page_width = A4[0] - 30*mm

    # ── Header ────────────────────────────────────────────────────────────────
    story.append(Paragraph("Wealth Report", S["title"]))
    story.append(Paragraph(f"{current_user.name}", S["subtitle"]))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%d %b %Y • %I:%M %p')}", S["subtitle"]))
    story.append(Spacer(1, 12))

    # ── Portfolio Stats ───────────────────────────────────────────────────────
    total_value = sum(float(inv.current_value or 0) for inv in investments)
    total_cost = sum(float(inv.units or 0) * float(inv.avg_buy_price or 0) for inv in investments)
    total_gain = total_value - total_cost
    gain_pct = ((total_gain / total_cost) * 100) if total_cost > 0 else 0

    stats_data = [
        ["Total Value", "Cost Basis", "Total Gain", "Holdings"],
        [rs(total_value), rs(total_cost), f"{rs(total_gain)} ({pct(gain_pct)})", str(len(investments))]
    ]
    stats_table = Table(stats_data, colWidths=[page_width/4] * 4)
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SLATE_100),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (-1, 1), 12),
        ('TEXTCOLOR', (2, 1), (2, 1), SUCCESS if total_gain >= 0 else DANGER),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, SLATE_200),
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 16))

    # ── Investments Table ─────────────────────────────────────────────────────
    story.append(Paragraph("Investments", S["section"]))
    if investments:
        inv_data = [["Symbol", "Type", "Units", "Buy Price", "Current Value", "Gain/Loss"]]
        for inv in investments:
            cost = float(inv.units or 0) * float(inv.avg_buy_price or 0)
            gain = float(inv.current_value or 0) - cost
            gain_p = ((gain / cost) * 100) if cost > 0 else 0
            inv_data.append([
                inv.symbol,
                str(inv.asset_type).replace("AssetTypeEnum.", "")[:12],
                f"{float(inv.units or 0):.2f}",
                rs(inv.avg_buy_price),
                rs(inv.current_value),
                f"{rs(gain)} ({pct(gain_p)})"
            ])

        col_widths = [page_width*0.18, page_width*0.12, page_width*0.10, page_width*0.17, page_width*0.20, page_width*0.23]
        inv_table = Table(inv_data, colWidths=col_widths, repeatRows=1)
        inv_table.setStyle(header_table_style())
        inv_table.setStyle(data_table_style())
        
        # Color gain/loss column
        for i, inv in enumerate(investments, start=1):
            cost = float(inv.units or 0) * float(inv.avg_buy_price or 0)
            gain = float(inv.current_value or 0) - cost
            color = SUCCESS if gain >= 0 else DANGER
            inv_table.setStyle(TableStyle([('TEXTCOLOR', (5, i), (5, i), color)]))
        
        story.append(inv_table)
    else:
        story.append(Paragraph("No investments recorded.", S["body"]))
    
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=0.5, color=SLATE_200))

    # ── Goals Table ───────────────────────────────────────────────────────────
    story.append(Paragraph("Goals", S["section"]))
    if goals:
        goals_data = [["Goal Type", "Target", "Monthly", "Progress", "Target Date", "Status"]]
        for goal in goals:
            monthly = float(goal.monthly_contribution or 0)
            target = float(goal.target_amount or 1)
            progress = min((monthly / target) * 100, 100)
            goals_data.append([
                str(goal.goal_type).replace("GoalTypeEnum.", "").capitalize(),
                rs(goal.target_amount),
                rs(goal.monthly_contribution),
                pct(progress),
                fmt_date(goal.target_date),
                str(goal.status).replace("GoalStatusEnum.", "").capitalize(),
            ])
        
        col_widths = [page_width*0.18, page_width*0.15, page_width*0.15, page_width*0.12, page_width*0.20, page_width*0.20]
        goals_table = Table(goals_data, colWidths=col_widths, repeatRows=1)
        goals_table.setStyle(header_table_style())
        goals_table.setStyle(data_table_style())
        story.append(goals_table)
    else:
        story.append(Paragraph("No goals created yet.", S["body"]))
    
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=0.5, color=SLATE_200))

    # ── Transactions Table ────────────────────────────────────────────────────
    story.append(Paragraph("Recent Transactions", S["section"]))
    if transactions:
        tx_data = [["Symbol", "Type", "Qty", "Price", "Total", "Date"]]
        for txn in transactions[:20]:
            qty = float(txn.quantity or 0)
            price = float(txn.price or 0)
            total = qty * price
            tx_data.append([
                txn.symbol,
                str(txn.type).replace("TransactionTypeEnum.", "").capitalize(),
                f"{qty:.2f}",
                rs(price),
                rs(total),
                fmt_date(txn.executed_at),
            ])
        
        col_widths = [page_width*0.18, page_width*0.12, page_width*0.10, page_width*0.18, page_width*0.20, page_width*0.22]
        tx_table = Table(tx_data, colWidths=col_widths, repeatRows=1)
        tx_table.setStyle(header_table_style())
        tx_table.setStyle(data_table_style())
        
        # Color buy/sell columns
        for i, txn in enumerate(transactions[:20], start=1):
            tx_type = str(txn.type).replace("TransactionTypeEnum.", "").lower()
            color = SUCCESS if tx_type == 'buy' else DANGER if tx_type == 'sell' else SLATE_700
            tx_table.setStyle(TableStyle([('TEXTCOLOR', (1, i), (1, i), color)]))
        
        story.append(tx_table)
    else:
        story.append(Paragraph("No transactions recorded.", S["body"]))

    # ── Footer ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.5, color=SLATE_200))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        f"Report generated on {datetime.now().strftime('%d %b %Y at %I:%M %p')} • All values in Indian Rupees (Rs.)",
        S["footer"]
    ))

    doc.build(story)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=wealth-report-{datetime.now().strftime('%Y%m%d')}.pdf",
            "Access-Control-Allow-Origin": "*",
        }
    )


# ── GET /reports/csv ──────────────────────────────────────────────────────────
@router.get("/csv")
def export_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    type: str = "portfolio"
):
    output = StringIO()
    writer = csv.writer(output)

    if type == "portfolio":
        writer.writerow(["Symbol", "Asset Type", "Units", "Avg Buy Price",
                         "Current Value", "Cost Basis", "Gain/Loss (Rs.)", "Gain/Loss %"])
        for inv in db.query(Investment).filter(Investment.user_id == current_user.id).all():
            units = float(inv.units or 0)
            buy = float(inv.avg_buy_price or 0)
            cur = float(inv.current_value or 0)
            cost = units * buy
            gain = cur - cost
            gain_pct = (gain / cost * 100) if cost > 0 else 0
            writer.writerow([
                inv.symbol,
                str(inv.asset_type).replace("AssetTypeEnum.", ""),
                round(units, 2), round(buy, 2), round(cur, 2),
                round(cost, 2), round(gain, 2), f"{gain_pct:.2f}",
            ])

    elif type == "goals":
        writer.writerow(["Goal Type", "Target Amount", "Monthly Contribution",
                         "Progress %", "Status", "Target Date", "Created At"])
        for goal in db.query(Goal).filter(Goal.user_id == current_user.id).all():
            monthly = float(goal.monthly_contribution or 0)
            target = float(goal.target_amount or 1)
            prog = round(min((monthly / target) * 100, 100), 1)
            writer.writerow([
                str(goal.goal_type).replace("GoalTypeEnum.", "").capitalize(),
                float(goal.target_amount or 0),
                monthly, f"{prog}%",
                str(goal.status).replace("GoalStatusEnum.", "").capitalize(),
                goal.target_date.strftime("%Y-%m-%d") if goal.target_date else "",
                goal.created_at.strftime("%Y-%m-%d") if goal.created_at else "",
            ])

    elif type == "transactions":
        writer.writerow(["Symbol", "Type", "Quantity", "Price",
                         "Fees", "Total Amount", "Date"])
        for txn in db.query(Transaction).filter(Transaction.user_id == current_user.id)\
                      .order_by(Transaction.executed_at.desc()).all():
            qty = float(txn.quantity or 0)
            price = float(txn.price or 0)
            fees = float(txn.fees or 0)
            writer.writerow([
                txn.symbol,
                str(txn.type).replace("TransactionTypeEnum.", "").capitalize(),
                round(qty, 2), round(price, 2), round(fees, 2),
                round(qty * price + fees, 2),
                txn.executed_at.strftime("%Y-%m-%d %H:%M") if txn.executed_at else "",
            ])

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={type}-export-{datetime.now().strftime('%Y%m%d')}.pdf",
            "Access-Control-Allow-Origin": "*",
        }
    )