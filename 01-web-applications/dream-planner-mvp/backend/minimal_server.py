#!/usr/bin/env python3
"""
Minimal FastAPI server for Dream Planner - just to get something working
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, date
import uvicorn

# Create simple FastAPI app
app = FastAPI(
    title="Dream Planner API",
    description="Transform your dreams into achievable daily habits",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Dream Planner API is running!",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "dream-planner-api"
    }

@app.post("/calculate")
async def calculate_dream(target_amount: float, target_date: str):
    """
    Calculate daily, weekly, monthly amounts for a dream goal.
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
        
        # Simple calculation without compound interest
        daily_amount = target_amount / days_remaining
        weekly_amount = daily_amount * 7
        monthly_amount = daily_amount * 30
        
        # Generate relatable comparisons
        coffee_price = 5.50
        lunch_price = 12.00
        streaming_price = 15.99
        
        comparisons = {
            "coffees_per_day": round(daily_amount / coffee_price, 1),
            "lunches_per_week": round(weekly_amount / lunch_price, 1),
            "streaming_services": round(monthly_amount / streaming_price, 1)
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
            "motivation": motivation
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

# Simple dreams endpoints for testing
@app.get("/api/v1/dreams/")
async def list_dreams():
    return []

@app.post("/api/v1/dreams/")
async def create_dream():
    return {"message": "Dream creation not implemented in minimal server"}

if __name__ == "__main__":
    print("Starting minimal Dream Planner API server...")
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)
