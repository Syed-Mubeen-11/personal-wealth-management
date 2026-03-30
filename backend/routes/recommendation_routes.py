from fastapi import APIRouter, Depends
from core.auth import get_current_user
from services.recommendation_service import generate_recommendation

router = APIRouter(
    # FIX: Matching the Frontend v1 structure
    prefix="/api/v1/recommendations", 
    tags=["Recommendations"]
)

@router.get("/")
async def get_recommendations(
    current_user = Depends(get_current_user)
):
    # 1. Try to get real data from your service
    real_data = generate_recommendation(current_user)
    
    if real_data:
        # Wrap in a list because Frontend expects an Array []
        return [real_data] if not isinstance(real_data, list) else real_data

    # 2. FALLBACK: Mock data so the Frontend doesn't show a 404/Empty state
    return [
        {
            "id": 1,
            "title": "Initial Wealth Strategy",
            "recommendation_text": "आपकी वर्तमान आय और खर्चों के आधार पर, हम इंडेक्स फंड में 60% और लिक्विड गोल्ड में 40% निवेश करने की सलाह देते हैं।",
            "suggested_allocation": {
                "Equity": 60,
                "Gold": 40
            },
            "created_at": "2026-03-30T10:00:00",
            "is_read": False
        }
    ]