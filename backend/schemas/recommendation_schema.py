from pydantic import BaseModel


class RecommendationResponse(BaseModel):

    recommendation_text: str
    suggested_allocation: dict

    class Config:
        from_attributes = True