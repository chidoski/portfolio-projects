"""
Dreams API endpoints - The core of the Dream Planner application

These endpoints handle CRUD operations for financial dreams/goals.
The magic happens in showing users their big dreams are achievable through daily habits.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.database import get_db
from app.models.dream import Dream, DreamStatus, DreamCategory
from app.schemas.dream import (
    DreamCreate, 
    DreamUpdate, 
    DreamResponse, 
    DreamSummary,
    CalculationRequest,
    CalculationResponse
)

router = APIRouter()

@router.post("/", response_model=DreamResponse, status_code=201)
async def create_dream(
    dream: DreamCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new dream/financial goal.
    
    This is where the magic happens - we take a big scary goal
    and immediately show the user it's achievable as a daily habit.
    """
    # Create the dream record
    db_dream = Dream(
        title=dream.title,
        description=dream.description,
        category=dream.category,
        target_amount=dream.target_amount,
        target_date=dream.target_date,
        image_url=dream.image_url,
        current_saved=0.0,  # Starting from zero
        status=DreamStatus.active
    )
    
    db.add(db_dream)
    db.commit()
    db.refresh(db_dream)
    
    # Return with calculated fields that show achievability
    return _build_dream_response(db_dream)

@router.get("/", response_model=List[DreamSummary])
async def list_dreams(
    status: Optional[DreamStatus] = Query(None, description="Filter by dream status"),
    category: Optional[DreamCategory] = Query(None, description="Filter by dream category"),
    limit: int = Query(50, le=100, description="Maximum number of dreams to return"),
    db: Session = Depends(get_db)
):
    """
    Get list of user's dreams with summary information.
    
    Perfect for dashboard views showing multiple dreams at once.
    """
    query = db.query(Dream)
    
    # Apply filters
    if status:
        query = query.filter(Dream.status == status)
    if category:
        query = query.filter(Dream.category == category)
    
    # Order by creation date (newest first) and limit results
    dreams = query.order_by(desc(Dream.created_at)).limit(limit).all()
    
    return dreams

@router.get("/{dream_id}", response_model=DreamResponse)
async def get_dream(
    dream_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific dream.
    
    Includes all the motivational calculations that make big goals feel achievable.
    """
    dream = db.query(Dream).filter(Dream.id == dream_id).first()
    
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    return _build_dream_response(dream)

@router.put("/{dream_id}", response_model=DreamResponse)
async def update_dream(
    dream_id: int,
    dream_update: DreamUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing dream.
    
    Users might adjust their target amount, date, or mark progress.
    """
    dream = db.query(Dream).filter(Dream.id == dream_id).first()
    
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    # Update only provided fields
    update_data = dream_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(dream, field, value)
    
    db.commit()
    db.refresh(dream)
    
    return _build_dream_response(dream)

@router.delete("/{dream_id}")
async def delete_dream(
    dream_id: int,
    hard_delete: bool = Query(False, description="Permanently delete vs soft delete"),
    db: Session = Depends(get_db)
):
    """
    Delete a dream (soft delete by default).
    
    Soft delete preserves data for analytics while hiding from user.
    Hard delete permanently removes the record.
    """
    dream = db.query(Dream).filter(Dream.id == dream_id).first()
    
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    
    if hard_delete:
        # Permanent deletion
        db.delete(dream)
        db.commit()
        return {"message": "Dream permanently deleted"}
    else:
        # Soft delete - just change status
        dream.status = DreamStatus.archived
        db.commit()
        return {"message": "Dream archived"}

@router.post("/calculate", response_model=CalculationResponse)
async def calculate_dream_amounts(calculation: CalculationRequest):
    """
    Calculate daily/weekly/monthly amounts for a dream goal.
    
    This is the core insight of the app - showing big goals are achievable
    through small daily habits. No database needed, pure calculation.
    """
    from datetime import datetime, date
    
    # Calculate days remaining
    if isinstance(calculation.target_date, datetime):
        target = calculation.target_date.date()
    else:
        target = calculation.target_date
    
    today = date.today()
    days_remaining = (target - today).days
    
    if days_remaining <= 0:
        raise HTTPException(status_code=400, detail="Target date must be in the future")
    
    # Calculate amounts needed
    amount_remaining = calculation.target_amount - calculation.current_saved
    daily_amount = amount_remaining / days_remaining if days_remaining > 0 else 0
    weekly_amount = daily_amount * 7
    monthly_amount = daily_amount * 30
    
    # Generate relatable comparisons
    coffee_price = 5.50
    lunch_price = 12.00
    streaming_price = 12.99
    movie_price = 15.00
    
    comparisons = {
        "coffees_per_day": round(daily_amount / coffee_price, 1),
        "lunches_per_week": round(weekly_amount / lunch_price, 1),
        "streaming_services": round(monthly_amount / streaming_price, 1),
        "movie_tickets": round(daily_amount / movie_price, 1)
    }
    
    # Create motivational message
    if daily_amount < 5:
        motivation = f"Just ${daily_amount:.2f}/day - less than a coffee!"
    elif daily_amount < 15:
        motivation = f"${daily_amount:.2f}/day - skip one coffee and you're there!"
    elif daily_amount < 30:
        motivation = f"${daily_amount:.2f}/day - about the cost of lunch!"
    elif daily_amount < 100:
        motivation = f"${daily_amount:.2f}/day - totally achievable!"
    else:
        motivation = f"${daily_amount:.2f}/day - ambitious but possible with focus!"
    
    return CalculationResponse(
        target_amount=calculation.target_amount,
        target_date=calculation.target_date,
        current_saved=calculation.current_saved,
        amount_remaining=amount_remaining,
        days_remaining=days_remaining,
        daily_amount=round(daily_amount, 2),
        weekly_amount=round(weekly_amount, 2),
        monthly_amount=round(monthly_amount, 2),
        comparisons=comparisons,
        motivation=motivation,
        is_achievable=daily_amount <= 100
    )

def _build_dream_response(dream: Dream) -> DreamResponse:
    """
    Helper function to build a complete DreamResponse with calculated fields.
    
    This is where we add all the magic that makes big dreams feel achievable.
    """
    return DreamResponse(
        id=dream.id,
        user_id=dream.user_id,
        title=dream.title,
        description=dream.description,
        category=dream.category,
        target_amount=dream.target_amount,
        target_date=dream.target_date,
        current_saved=dream.current_saved,
        image_url=dream.image_url,
        status=dream.status,
        created_at=dream.created_at,
        updated_at=dream.updated_at,
        
        # Calculated fields - the magic that makes dreams achievable
        days_remaining=dream.days_remaining,
        amount_remaining=dream.amount_remaining,
        daily_amount=dream.daily_amount,
        weekly_amount=dream.weekly_amount,
        monthly_amount=dream.monthly_amount,
        progress_percentage=dream.progress_percentage,
        is_achievable=dream.is_achievable,
        comparisons=dream.get_comparisons()
    )
