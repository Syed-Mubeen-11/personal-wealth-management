from app.core.celery_app import celery_app
import time

@celery_app.task
def run_simulation_task(monthly_investment: float, years: int, interest_rate: float):
    # Simulate a heavy process (optional delay)
    time.sleep(3) 
    
    total_value = 0
    year_by_year = []
    
    # Calculate Compound Interest Year by Year
    for year in range(1, years + 1):
        # Add monthly contributions for 12 months
        for _ in range(12):
            total_value += monthly_investment
            total_value += total_value * (interest_rate / 12)
        
        # Save the snapshot for this year
        year_by_year.append({
            "year": year,
            "value": round(total_value, 2)
        })
        
    # RETURN EXACTLY THIS STRUCTURE
    return {
        "total_wealth": round(total_value, 2),
        "year_by_year": year_by_year
    }