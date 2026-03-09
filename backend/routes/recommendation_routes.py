from fastapi import APIRouter, Depends

from core.auth import get_current_user
from services.recommendation_service import generate_recommendation


router = APIRouter(
    prefix="/api/recommendations",
    tags=["Recommendations"]
)


@router.get("/")
def get_recommendation(
    current_user = Depends(get_current_user)
):

    return generate_recommendation(current_user)