"""
FastAPI Dream Planner Application

This is the main entry point for the Dream Planner MVP backend.
The app transforms intimidating retirement goals into achievable daily habits.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import math

# Import database and API routes
from app.models.database import create_tables
from app.api.v1.endpoints import dreams

# Create FastAPI application
app = FastAPI(
    title="Dream Planner API",
    description="Transform your dreams into achievable daily habits",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(dreams.router, prefix="/api/v1/dreams", tags=["dreams"])

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on application startup"""
    create_tables()

@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {
        "message": "Dream Planner API is running!",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "dream-planner-api"
    }

@app.post("/calculate")
async def calculate_dream(target_amount: float, target_date: str):
    """
    Demo calculation endpoint - shows the core insight of daily affordability
    
    Args:
        target_amount: The financial goal (e.g., 50000 for a vacation)
        target_date: ISO date string for when the goal should be achieved
    
    Returns:
        Dictionary with daily, weekly, monthly amounts and relatable comparisons
    """
    try:
        # Parse target date
        target_datetime = datetime.fromisoformat(target_date.replace('Z', '+00:00'))
        current_date = datetime.now()
        
        # Calculate days remaining
        days_remaining = (target_datetime - current_date).days
        
        if days_remaining <= 0:
            return {
                "error": "Target date must be in the future",
                "days_remaining": days_remaining
            }
        
        # Calculate amounts (assuming 5% annual interest)
        annual_rate = 0.05
        daily_rate = annual_rate / 365
        
        # Future value calculation: FV = PV * (1 + r)^n
        # We need: PV = FV / (1 + r)^n, then divide by days for daily amount
        if daily_rate > 0:
            # Compound interest calculation
            present_value_needed = target_amount / ((1 + daily_rate) ** days_remaining)
            daily_amount = present_value_needed / days_remaining
        else:
            # Simple division if no interest
            daily_amount = target_amount / days_remaining
        
        weekly_amount = daily_amount * 7
        monthly_amount = daily_amount * 30
        
        # Generate relatable comparisons
        coffee_price = 5.50  # Average coffee price
        streaming_price = 15.99  # Netflix-like service
        lunch_price = 12.00  # Average lunch
        
        comparisons = {
            "coffees_per_day": round(daily_amount / coffee_price, 1),
            "streaming_services": round(monthly_amount / streaming_price, 1),
            "lunches_per_week": round(weekly_amount / lunch_price, 1)
        }
        
        # Create motivational message
        if daily_amount < 10:
            motivation = f"Just ${daily_amount:.2f} per day - less than your morning coffee!"
        elif daily_amount < 25:
            motivation = f"${daily_amount:.2f} per day - about the cost of lunch!"
        else:
            motivation = f"${daily_amount:.2f} per day - your dream is achievable!"
        
        return {
            "target_amount": target_amount,
            "target_date": target_date,
            "days_remaining": days_remaining,
            "daily_amount": round(daily_amount, 2),
            "weekly_amount": round(weekly_amount, 2),
            "monthly_amount": round(monthly_amount, 2),
            "comparisons": comparisons,
            "motivation": motivation,
            "calculation_note": "Includes 5% annual compound interest"
        }
        
    except ValueError as e:
        return {
            "error": f"Invalid date format: {str(e)}",
            "expected_format": "YYYY-MM-DD or ISO datetime"
        }
    except Exception as e:
        return {
            "error": f"Calculation error: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

