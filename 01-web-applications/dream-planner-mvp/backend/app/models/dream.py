"""
Dream model for the Dream Planner application

Represents a user's financial goal/dream with target amount and date.
The core insight: large goals become achievable when broken into daily amounts.
"""

import enum
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.sql import func
from app.models.database import Base

class DreamStatus(str, enum.Enum):
    """Status of a dream/goal"""
    active = "active"        # Currently working towards this dream
    completed = "completed"  # Dream achieved!
    paused = "paused"       # Temporarily stopped progress
    archived = "archived"   # No longer pursuing

class DreamCategory(str, enum.Enum):
    """Categories for organizing dreams"""
    travel = "travel"           # Vacations, trips, adventures
    home = "home"              # House down payment, renovations
    education = "education"     # Courses, degrees, certifications
    family = "family"          # Kids' education, family activities
    freedom = "freedom"        # Emergency fund, early retirement
    lifestyle = "lifestyle"    # Car, hobbies, experiences
    health = "health"          # Medical procedures, wellness

class Dream(Base):
    """
    A financial dream/goal that users want to achieve.
    
    The key insight: Instead of showing "$50,000 vacation", 
    we show "$16/day - the cost of 3 coffees"
    """
    __tablename__ = "dreams"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)  # MVP simplification - single user
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    category = Column(Enum(DreamCategory), default=DreamCategory.lifestyle)
    
    # Financial details
    target_amount = Column(Float, nullable=False)  # The dream's cost
    current_saved = Column(Float, default=0.0)     # Progress so far
    target_date = Column(DateTime, nullable=False)  # When to achieve it
    
    # Visual and metadata
    image_url = Column(String(500))  # URL to dream image
    status = Column(Enum(DreamStatus), default=DreamStatus.active)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    @property
    def days_remaining(self) -> int:
        """Calculate days remaining until target date"""
        if isinstance(self.target_date, datetime):
            target = self.target_date.date()
        else:
            target = self.target_date
            
        today = date.today()
        delta = target - today
        return max(0, delta.days)
    
    @property
    def amount_remaining(self) -> float:
        """Calculate amount still needed to reach goal"""
        return max(0, self.target_amount - self.current_saved)
    
    @property
    def daily_amount(self) -> float:
        """
        Calculate daily amount needed to reach goal.
        This is the CORE INSIGHT of the app!
        """
        days = self.days_remaining
        if days <= 0:
            return 0.0
        
        # Simple calculation for MVP - no compound interest yet
        return self.amount_remaining / days
    
    @property
    def weekly_amount(self) -> float:
        """Weekly savings needed"""
        return self.daily_amount * 7
    
    @property
    def monthly_amount(self) -> float:
        """Monthly savings needed (30-day month)"""
        return self.daily_amount * 30
    
    @property
    def progress_percentage(self) -> float:
        """Progress towards goal as percentage"""
        if self.target_amount <= 0:
            return 0.0
        return min(100.0, (self.current_saved / self.target_amount) * 100)
    
    @property
    def is_achievable(self) -> bool:
        """Whether the daily amount is realistic (under $100/day)"""
        return self.daily_amount <= 100.0
    
    def get_comparisons(self) -> dict:
        """
        Generate relatable comparisons for the daily amount.
        This makes big dreams feel achievable!
        """
        daily = self.daily_amount
        
        # Common expense comparisons
        coffee_price = 5.50
        lunch_price = 12.00
        movie_price = 15.00
        streaming_price = 12.99
        
        return {
            "coffees": round(daily / coffee_price, 1),
            "lunches_per_week": round(self.weekly_amount / lunch_price, 1),
            "movie_tickets": round(daily / movie_price, 1),
            "streaming_services": round(self.monthly_amount / streaming_price, 1)
        }
    
    def __repr__(self):
        return f"<Dream(id={self.id}, title='{self.title}', target=${self.target_amount}, daily=${self.daily_amount:.2f})>"

