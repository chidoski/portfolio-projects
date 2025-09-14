# Cursor AI Instructions - Dream Planner MVP Development

## Project Overview

You are helping build Dream Planner, a web application that revolutionizes retirement planning by transforming distant, intimidating financial goals into achievable daily habits. The core insight is that showing someone they need $2 million for retirement creates paralysis, but showing them they need to save $16 per day (the cost of three coffees) creates action.

This is an MVP being built for a Monday demo to a CEO for a Head of Product role. The goal is to demonstrate product thinking and rapid execution capability, not to build a production-ready application.

## Current Development State

### What's Already Complete
1. **Environment Setup**: Python 3.12.2 backend with FastAPI, React frontend with TypeScript and Tailwind CSS
2. **Project Structure**: Full directory structure created at `/Volumes/Extreme Pro/Programming/Python/Portfolio-Projects/01-web-applications/dream-planner-mvp`
3. **GitHub Integration**: Repository connected and working at `https://github.com/chidoski/portfolio-projects`
4. **Documentation**: Comprehensive PRD, Technical Architecture, and Implementation Roadmap created
5. **Dependencies Installed**: 
   - Backend: FastAPI 0.116.1, Pydantic 2.11.9, SQLAlchemy 2.0.43, Uvicorn 0.35.0
   - Frontend: React 18, TypeScript, Tailwind CSS, Zustand, Recharts

### File Structure
```
dream-planner-mvp/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # API endpoints go here
│   │   ├── core/              # Configuration and security
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── main.py           # FastAPI application entry point
│   ├── venv/                  # Virtual environment (using virtualenv)
│   └── database/              # SQLite database location
├── frontend/
│   ├── src/
│   │   ├── components/        # React components (atoms/molecules/organisms)
│   │   ├── pages/            # Page components
│   │   ├── services/         # API integration
│   │   ├── stores/           # Zustand state management
│   │   └── types/            # TypeScript type definitions
│   └── public/
└── docs/                      # All documentation
```

## Implementation Priority for Monday Demo

Build features in this exact order to ensure a compelling demonstration even if not everything is complete:

### Phase 1: Core Backend Structure (Current Focus)
1. **Create FastAPI Application Structure** (app/main.py)
   - Basic application with CORS configured ✓
   - Health check endpoint ✓
   - Demo calculation endpoint ✓

2. **Build Database Models** (app/models/)
   ```python
   # Dream model needs:
   - id, user_id, title, description
   - target_amount (Decimal), target_date (DateTime)
   - category (enum: travel, home, education, family, freedom)
   - image_url, status, created_at, updated_at
   ```

3. **Create Pydantic Schemas** (app/schemas/)
   - DreamCreate, DreamUpdate, DreamResponse
   - Include calculated fields: daily_amount, weekly_amount, monthly_amount

4. **Implement CRUD Operations** (app/api/v1/endpoints/dreams.py)
   - POST /api/v1/dreams - Create dream
   - GET /api/v1/dreams - List dreams
   - GET /api/v1/dreams/{id} - Get specific dream
   - PUT /api/v1/dreams/{id} - Update dream
   - DELETE /api/v1/dreams/{id} - Soft delete

### Phase 2: Frontend Foundation
1. **Create Landing Page** (frontend/src/pages/Landing.tsx)
   - Hero section with compelling headline
   - Dream gallery with example dreams
   - Call-to-action to start planning

2. **Build Dream Creation Form** (frontend/src/components/organisms/DreamBuilder.tsx)
   - Multi-step form: title → amount → date → image
   - Real-time calculation showing daily/weekly/monthly amounts
   - Relatable comparisons (coffees, streaming services)

3. **Implement Timeline Visualization** (frontend/src/components/organisms/Timeline.tsx)
   - Horizontal scrollable timeline
   - Dreams as nodes with progress indicators
   - Smooth animations and interactions

### Phase 3: The Magic - Calculation Engine
1. **Smart Calculator Service** (backend/app/services/calculator.py)
   ```python
   def calculate_daily_amount(target_amount: float, target_date: date) -> dict:
       # Return daily, weekly, monthly amounts
       # Include compound interest calculations (5% annual)
       # Generate relatable comparisons
   ```

2. **Frontend Calculator Component** (frontend/src/components/molecules/Calculator.tsx)
   - Animated number transitions
   - Multiple comparison frameworks
   - "Start today vs wait a year" comparison

### Phase 4: Progress Tracking
1. **Progress Dashboard** (frontend/src/pages/Dashboard.tsx)
   - Overall wealth score
   - Individual dream progress cards
   - Current week/month performance
   - Streak counters

2. **Backend Progress Endpoints**
   - POST /api/v1/progress - Log savings
   - GET /api/v1/progress/summary - Get progress analytics

## Key Implementation Guidelines

### Design Principles
1. **Emotional Over Technical**: Focus on how features make users FEEL, not technical perfection
2. **Celebration Over Shame**: Always frame progress positively, even when behind
3. **Achievable Over Optimal**: Better to suggest $10/day someone will actually save than $50 they won't
4. **Visual Over Textual**: Use charts, progress bars, and animations to communicate

### UI/UX Requirements
- **Colors**: Warm gradients (purple to pink), avoid corporate blues
- **Typography**: Large, readable fonts with clear hierarchy
- **Animations**: Smooth, delightful micro-interactions
- **Mobile-First**: Must work perfectly on phone screens

### Code Quality for Demo
- Prioritize working features over perfect code
- Use TypeScript for type safety but don't over-engineer
- Comments should explain business logic, not syntax
- Mock data is fine where real data isn't ready

## Specific Files to Create Next

### 1. Database Models (backend/app/models/dream.py)
```python
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.sql import func
from app.models.database import Base
import enum

class DreamStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    paused = "paused"
    archived = "archived"

class Dream(Base):
    __tablename__ = "dreams"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)  # MVP simplification
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)  # travel, home, education, etc.
    target_amount = Column(Float, nullable=False)
    target_date = Column(DateTime, nullable=False)
    image_url = Column(String)
    status = Column(Enum(DreamStatus), default=DreamStatus.active)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Add property for calculated fields
    @property
    def daily_amount(self):
        from datetime import datetime
        days_remaining = (self.target_date - datetime.now()).days
        return self.target_amount / days_remaining if days_remaining > 0 else 0
```

### 2. Database Setup (backend/app/models/database.py)
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./database/dream_planner.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite specific
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 3. Pydantic Schemas (backend/app/schemas/dream.py)
```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DreamBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    target_amount: float
    target_date: datetime
    image_url: Optional[str] = None

class DreamCreate(DreamBase):
    pass

class DreamResponse(DreamBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    daily_amount: float
    weekly_amount: float
    monthly_amount: float
    
    class Config:
        from_attributes = True
```

## Testing the Implementation

After creating each component, test it immediately:

### Backend Testing
```bash
# Run the server
uvicorn app.main:app --reload --port 8000

# Visit http://localhost:8000/docs for interactive API testing
```

### Frontend Testing
```bash
# In a new terminal
cd frontend
npm run dev

# Visit http://localhost:3000
```

## Common Issues and Solutions

1. **Import Errors**: Ensure all `__init__.py` files exist in directories
2. **CORS Issues**: Backend must have CORS middleware configured for localhost:3000
3. **Type Errors**: Use TypeScript's `any` type temporarily if type issues block progress
4. **Database Issues**: Delete `dream_planner.db` and recreate if schema changes

## Success Criteria for Monday Demo

The demo is successful if it demonstrates:
1. **The Core Insight**: Large goals become achievable when broken into daily amounts
2. **Emotional Engagement**: Beautiful UI that makes planning feel exciting, not daunting
3. **Complete User Journey**: From landing → dream creation → timeline view → progress tracking
4. **Product Thinking**: Clear understanding of user pain points and elegant solutions

## Remember

This is a DEMO, not a production app. It's better to have 3 features that work beautifully than 10 features that work poorly. Focus on the emotional journey and the "aha!" moment when users see their dreams are achievable.

When in doubt, prioritize:
1. Visual polish over backend perfection
2. Working happy path over edge case handling
3. Emotional impact over technical completeness

The CEO won't see your code quality, but they will feel the user experience. Make it memorable.