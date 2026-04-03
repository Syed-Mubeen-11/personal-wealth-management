"""
Reports API — BE-2 deliverable
Endpoints:
  GET /api/v1/reports/pdf  — generate and stream PDF report
  GET /api/v1/reports/csv  — stream CSV export
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date
import io

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.report_service import generate_pdf_report, generate_csv_report

router = APIRouter()


@router.get("/pdf")
def download_pdf_report(
    scope: str = Query(default="full", description="Report scope (currently only 'full' is supported)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a full PDF wealth report for the authenticated user.
    Returns a streaming PDF download.
    """
    try:
        pdf_bytes = generate_pdf_report(current_user.id, db)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

    today_str = date.today().strftime("%Y-%m-%d")
    filename = f"wealth-report-{today_str}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/csv")
def download_csv_report(
    type: str = Query(..., description="Export type: 'portfolio' | 'goals' | 'transactions'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Export data as CSV. The `type` query param controls which data is exported.
    """
    valid_types = ["portfolio", "goals", "transactions"]
    if type not in valid_types:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid type '{type}'. Must be one of: {valid_types}"
        )

    try:
        csv_content = generate_csv_report(current_user.id, type, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CSV generation failed: {str(e)}")

    today_str = date.today().strftime("%Y-%m-%d")
    filename = f"{type}-{today_str}.csv"

    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
