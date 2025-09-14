"""
Pydantic schemas for Dream API endpoints

These schemas handle request/response validation and serialization.
They ensure type safety and generate OpenAPI documentation.
"""

from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, Dict
from app.models.dream import DreamStatus, DreamCategory

class DreamBase(BaseModel):
    """Base schema with common dream fields"""
    title: str = Field(..., min_length=1, max_length=200, description="Name of your dream")
    description: Optional[str] = Field(None, max_length=1000, description="Detailed description of your dream")
    category: DreamCategory = Field(default=DreamCategory.lifestyle, description="Category of the dream")
    target_amount: float = Field(..., gt=0, description="Total amount needed to achieve dream")
    target_date: datetime = Field(..., description="When you want to achieve this dream")
    image_url: Optional[str] = Field(None, max_length=500, description="URL to an image representing your dream")

    @validator('target_amount')
    def validate_target_amount(cls, v):
        """Ensure target amount is reasonable"""
        if v <= 0:
            raise ValueError('Target amount must be positive')
        if v > 10_000_000:  # $10M limit for MVP
            raise ValueError('Target amount too large for this demo')
        return round(v, 2)  # Round to cents
    
    @validator('target_date')
    def validate_target_date(cls, v):
        """Ensure target date is in the future"""
        if v <= datetime.now():
            raise ValueError('Target date must be in the future')
        return v

class DreamCreate(DreamBase):
    """Schema for creating a new dream"""
    pass

class DreamUpdate(BaseModel):
    """Schema for updating an existing dream"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    category: Optional[DreamCategory] = None
    target_amount: Optional[float] = Field(None, gt=0)
    target_date: Optional[datetime] = None
    current_saved: Optional[float] = Field(None, ge=0, description="Amount saved so far")
    image_url: Optional[str] = Field(None, max_length=500)
    status: Optional[DreamStatus] = None

    @validator('target_amount')
    def validate_target_amount(cls, v):
        if v is not None:
            if v <= 0:
                raise ValueError('Target amount must be positive')
            if v > 10_000_000:
                raise ValueError('Target amount too large for this demo')
            return round(v, 2)
        return v
    
    @validator('current_saved')
    def validate_current_saved(cls, v):
        if v is not None:
            if v < 0:
                raise ValueError('Current saved amount cannot be negative')
            return round(v, 2)
        return v

class DreamResponse(DreamBase):
    """Schema for dream API responses with calculated fields"""
    id: int
    user_id: int
    current_saved: float = Field(description="Amount saved towards this dream")
    status: DreamStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Calculated fields that make dreams feel achievable
    days_remaining: int = Field(description="Days until target date")
    amount_remaining: float = Field(description="Amount still needed")
    daily_amount: float = Field(description="Daily savings needed - the key insight!")
    weekly_amount: float = Field(description="Weekly savings needed")
    monthly_amount: float = Field(description="Monthly savings needed")
    progress_percentage: float = Field(description="Progress as percentage")
    is_achievable: bool = Field(description="Whether daily amount is realistic")
    comparisons: Dict = Field(description="Relatable comparisons (coffees, lunches, etc.)")
    
    class Config:
        from_attributes = True  # Allows conversion from ORM objects

class DreamSummary(BaseModel):
    """Lightweight schema for dream lists"""
    id: int
    title: str
    category: DreamCategory
    target_amount: float
    target_date: datetime
    daily_amount: float
    progress_percentage: float
    status: DreamStatus
    
    class Config:
        from_attributes = True

class CalculationRequest(BaseModel):
    """Schema for dream calculation requests"""
    target_amount: float = Field(..., gt=0, description="Target amount")
    target_date: datetime = Field(..., description="Target date")
    current_saved: float = Field(default=0.0, ge=0, description="Amount already saved")

class CalculationResponse(BaseModel):
    """Schema for calculation responses"""
    target_amount: float
    target_date: datetime
    current_saved: float
    amount_remaining: float
    days_remaining: int
    daily_amount: float
    weekly_amount: float
    monthly_amount: float
    comparisons: Dict
    motivation: str
    is_achievable: bool

