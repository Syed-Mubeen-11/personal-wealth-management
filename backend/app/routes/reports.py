from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.investments import Investment
from app.models.goals import Goal
from io import StringIO, BytesIO
import csv
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

router = APIRouter()


@router.get("/pdf")
def generate_pdf_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    scope: str = "full"
):
    """Generate PDF report"""

    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # ── Title ────────────────────────────────────────────────────────────────
    story.append(Paragraph(f"Wealth Report - {current_user.name}", styles['Title']))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    story.append(Spacer(1, 20))

    # ── Portfolio Summary ─────────────────────────────────────────────────────
    story.append(Paragraph("Portfolio Summary", styles['Heading2']))
    total_value = sum(float(inv.current_value or 0) for inv in investments)
    total_cost = sum(float(inv.units or 0) * float(inv.avg_buy_price or 0) for inv in investments)
    total_gain = total_value - total_cost
    story.append(Paragraph(f"Total Portfolio Value: Rs.{total_value:,.2f}", styles['Normal']))
    story.append(Paragraph(f"Total Cost Basis: Rs.{total_cost:,.2f}", styles['Normal']))
    story.append(Paragraph(f"Total Gain/Loss: Rs.{total_gain:,.2f}", styles['Normal']))
    story.append(Spacer(1, 12))

    # ── Investments Table ─────────────────────────────────────────────────────
    if investments:
        story.append(Paragraph("Investments", styles['Heading2']))
        data = [["Symbol", "Asset Type", "Units", "Buy Price", "Current Value", "Gain/Loss"]]
        for inv in investments:
            cost = float(inv.units or 0) * float(inv.avg_buy_price or 0)
            gain_loss = float(inv.current_value or 0) - cost
            data.append([
                inv.symbol,
                str(inv.asset_type).replace("AssetTypeEnum.", ""),
                str(float(inv.units or 0)),
                f"Rs.{float(inv.avg_buy_price or 0):,.2f}",
                f"Rs.{float(inv.current_value or 0):,.2f}",
                f"Rs.{gain_loss:,.2f}"
            ])

        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        story.append(table)
        story.append(Spacer(1, 20))

    # ── Goals Section ─────────────────────────────────────────────────────────
    story.append(Paragraph("Goals", styles['Heading2']))
    if goals:
        goals_data = [["Goal Type", "Target Amount", "Monthly Contribution", "Target Date", "Status"]]
        for goal in goals:
            goals_data.append([
                str(goal.goal_type).replace("GoalTypeEnum.", "").capitalize(),
                f"Rs.{float(goal.target_amount or 0):,.2f}",
                f"Rs.{float(goal.monthly_contribution or 0):,.2f}",
                goal.target_date.strftime("%Y-%m-%d") if goal.target_date else "N/A",
                str(goal.status).replace("GoalStatusEnum.", "").capitalize(),
            ])

        goals_table = Table(goals_data, repeatRows=1)
        goals_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        story.append(goals_table)
    else:
        story.append(Paragraph("No goals created yet.", styles['Normal']))

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


@router.get("/csv")
def export_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    type: str = "portfolio"
):
    """Export data as CSV"""

    output = StringIO()
    writer = csv.writer(output)

    if type == "portfolio":
        writer.writerow(["Symbol", "Asset Type", "Units", "Avg Buy Price", "Current Value", "Gain/Loss %"])
        investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
        for inv in investments:
            cost_basis = float(inv.units or 0) * float(inv.avg_buy_price or 0)
            gain_loss = ((float(inv.current_value or 0) - cost_basis) / cost_basis * 100) if cost_basis > 0 else 0
            writer.writerow([
                inv.symbol,
                str(inv.asset_type).replace("AssetTypeEnum.", ""),
                float(inv.units or 0),
                float(inv.avg_buy_price or 0),
                float(inv.current_value or 0),
                f"{gain_loss:.2f}"
            ])

    elif type == "goals":
        writer.writerow(["Goal Type", "Target Amount", "Monthly Contribution", "Status", "Target Date"])
        goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
        for goal in goals:
            writer.writerow([
                str(goal.goal_type).replace("GoalTypeEnum.", "").capitalize(),
                float(goal.target_amount or 0),
                float(goal.monthly_contribution or 0),
                str(goal.status).replace("GoalStatusEnum.", "").capitalize(),
                goal.target_date.strftime("%Y-%m-%d") if goal.target_date else ""
            ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={type}-export-{datetime.now().strftime('%Y%m%d')}.csv",
            "Access-Control-Allow-Origin": "*",
        }
    )