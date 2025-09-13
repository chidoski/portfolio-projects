# Technical Architecture - Dream Planner MVP

## System Architecture Overview

The Dream Planner follows a modern three-tier architecture with clear separation of concerns. The frontend handles all user interactions and visualizations, the backend manages business logic and data processing, and the database stores user information and dream data persistently.

```
┌─────────────────────────────────────────────┐
│           React Frontend (Port 3000)         │
│  - Components: Dreams, Timeline, Progress    │
│  - State Management: Zustand                 │
│  - Styling: Tailwind CSS                     │
└────────────────┬────────────────────────────┘
                 │ REST API
┌────────────────▼────────────────────────────┐
│         Python FastAPI (Port 8000)          │
│  - Endpoints: /dreams, /goals, /progress    │
│  - Services: Calculator, Analytics          │
│  - Middleware: CORS, Auth (future)          │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│            SQLite Database                   │
│  Tables: users, dreams, goals, progress     │
└─────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack
- **React 18**: Provides component-based architecture with hooks for state management
- **TypeScript**: Ensures type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS for rapid UI development
- **Zustand**: Lightweight state management without Redux complexity
- **Recharts**: Declarative charting library for progress visualizations
- **React Router v6**: Client-side routing for SPA navigation
- **Axios**: HTTP client for API communication

### Component Structure

The frontend follows atomic design principles, building from small, reusable components up to complete pages:

```
src/
├── components/
│   ├── atoms/           # Basic building blocks
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ProgressBar.tsx
│   ├── molecules/       # Combined atoms
│   │   ├── DreamCard.tsx
│   │   ├── GoalInput.tsx
│   │   ├── TimelineNode.tsx
│   │   └── ProgressRing.tsx
│   ├── organisms/       # Complex components
│   │   ├── DreamBuilder.tsx
│   │   ├── Timeline.tsx
│   │   ├── Dashboard.tsx
│   │   └── WeeklyCheckIn.tsx
│   └── templates/       # Page layouts
│       ├── AppLayout.tsx
│       └── OnboardingLayout.tsx
├── pages/              # Route components
│   ├── Onboarding.tsx
│   ├── Dreams.tsx
│   ├── Progress.tsx
│   └── Settings.tsx
├── services/           # API integration
│   ├── api.ts
│   ├── dreamService.ts
│   └── analyticsService.ts
├── stores/             # Zustand stores
│   ├── userStore.ts
│   ├── dreamStore.ts
│   └── progressStore.ts
├── utils/              # Helper functions
│   ├── calculations.ts
│   ├── formatters.ts
│   └── validators.ts
└── types/              # TypeScript definitions
    ├── dream.types.ts
    ├── user.types.ts
    └── api.types.ts
```

### State Management Strategy

Zustand stores manage different domains of application state:

**User Store**: Handles user profile, preferences, and authentication state
**Dream Store**: Manages all dreams, their timelines, and associated goals
**Progress Store**: Tracks daily, weekly, and monthly progress metrics
**UI Store**: Controls modal states, loading indicators, and notifications

### Responsive Design Approach

The application prioritizes mobile experience while scaling elegantly to desktop:
- Mobile-first breakpoints: 640px, 768px, 1024px, 1280px
- Touch-optimized interactions with 44px minimum tap targets
- Progressive disclosure to avoid overwhelming mobile users
- Swipe gestures for timeline navigation on mobile

## Backend Architecture

### Technology Stack
- **FastAPI**: Modern Python web framework with automatic API documentation
- **Pydantic**: Data validation using Python type annotations
- **SQLAlchemy**: ORM for database interactions
- **Alembic**: Database migration management
- **Python 3.11+**: Latest Python features for performance and type hints

### API Design Philosophy

The API follows RESTful principles with clear resource-based URLs and appropriate HTTP methods:

```python
# Resource endpoints follow consistent patterns
GET    /api/v1/dreams           # List all dreams
POST   /api/v1/dreams           # Create new dream
GET    /api/v1/dreams/{id}      # Get specific dream
PUT    /api/v1/dreams/{id}      # Update dream
DELETE /api/v1/dreams/{id}      # Delete dream

# Nested resources for related data
GET    /api/v1/dreams/{id}/goals      # Goals for a dream
POST   /api/v1/dreams/{id}/progress   # Log progress
```

### Service Layer Architecture

Business logic is separated into focused service classes:

```python
backend/app/
├── api/
│   ├── v1/
│   │   ├── endpoints/
│   │   │   ├── dreams.py       # Dream CRUD operations
│   │   │   ├── goals.py        # Goal management
│   │   │   ├── progress.py     # Progress tracking
│   │   │   └── analytics.py    # Analytics endpoints
│   │   └── router.py            # API route aggregation
├── core/
│   ├── config.py                # Application configuration
│   ├── security.py              # Authentication/authorization
│   └── exceptions.py            # Custom exception classes
├── models/
│   ├── dream.py                 # Dream SQLAlchemy model
│   ├── goal.py                  # Goal model
│   ├── user.py                  # User model
│   └── progress.py              # Progress tracking model
├── schemas/                     # Pydantic models
│   ├── dream.py                 # Dream request/response schemas
│   ├── goal.py                  # Goal schemas
│   └── progress.py              # Progress schemas
├── services/
│   ├── dream_service.py         # Dream business logic
│   ├── calculator_service.py    # Financial calculations
│   ├── analytics_service.py     # Progress analytics
│   └── notification_service.py  # Notification handling
└── main.py                      # FastAPI application entry
```

### Key Services Explained

**Dream Service**: Manages the lifecycle of dreams including creation, modification, and timeline adjustments. It ensures dreams are properly broken down into achievable goals.

**Calculator Service**: Handles all financial calculations including compound interest, savings requirements, and progress projections. This service factors in inflation and realistic return rates.

**Analytics Service**: Processes user progress data to generate insights, identify patterns, and create recommendations for achieving dreams faster.

**Notification Service**: Manages the behavioral nudge system, determining when and how to send encouragement or reminders to users.

## Database Design

### Schema Overview

The database uses a normalized structure to maintain data integrity while optimizing for common query patterns:

```sql
-- Core user information
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    age INTEGER,
    income_range TEXT,
    savings_rate DECIMAL(5,2)
);

-- Dreams represent long-term goals
CREATE TABLE dreams (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,  -- Travel, Home, Education, etc.
    target_amount DECIMAL(10,2),
    target_date DATE,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active'  -- active, achieved, paused
);

-- Goals break dreams into time periods
CREATE TABLE goals (
    id INTEGER PRIMARY KEY,
    dream_id INTEGER REFERENCES dreams(id),
    period_type TEXT,  -- weekly, monthly, quarterly, yearly
    period_start DATE,
    period_end DATE,
    target_amount DECIMAL(10,2),
    actual_amount DECIMAL(10,2) DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE
);

-- Progress tracks actual savings activity
CREATE TABLE progress (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    goal_id INTEGER REFERENCES goals(id),
    amount DECIMAL(10,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT
);

-- Behavioral tracking for engagement
CREATE TABLE user_activity (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    activity_type TEXT,  -- login, goal_set, progress_logged
    activity_data JSON,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexing Strategy

Strategic indexes optimize common query patterns:
- User email lookups for authentication
- Dream retrieval by user and status
- Goal queries by period for dashboard views
- Progress aggregations for analytics

## Security Considerations

### Authentication & Authorization (Post-MVP)
While the MVP runs locally without authentication, the architecture supports future security implementation:
- JWT tokens for stateless authentication
- Role-based access control preparation
- API key management for third-party integrations

### Data Protection
- Input validation at every layer
- SQL injection prevention through parameterized queries
- XSS protection via React's default escaping
- CORS configuration for API access control

## Performance Optimization

### Frontend Optimization
- Code splitting for faster initial loads
- Lazy loading of route components
- Image optimization with WebP format
- Memoization of expensive calculations
- Virtual scrolling for long dream lists

### Backend Optimization
- Database connection pooling
- Query result caching for analytics
- Asynchronous request handling
- Batch processing for bulk operations

### Caching Strategy
- Browser caching for static assets
- API response caching for infrequently changing data
- Calculation result caching for complex projections

## Development Workflow

### Local Development Setup
The application uses a straightforward development environment:
1. Frontend runs on http://localhost:3000 with hot reloading
2. Backend API runs on http://localhost:8000 with auto-reload
3. SQLite database stored locally for easy inspection
4. API documentation available at http://localhost:8000/docs

### Testing Strategy
- Unit tests for calculation services
- Integration tests for API endpoints
- Component testing for React components
- End-to-end testing for critical user flows

## Deployment Considerations (Future)

### Containerization
Docker configuration for consistent environments:
- Frontend container with Nginx
- Backend container with Uvicorn
- Database migration container
- Docker Compose for local orchestration

### Cloud Architecture (Post-MVP)
Future cloud deployment would utilize:
- Frontend: Vercel or Netlify for static hosting
- Backend: AWS Lambda or Google Cloud Run
- Database: PostgreSQL on AWS RDS or Supabase
- File Storage: AWS S3 for dream images

## Integration Points

### Current Integrations (MVP)
- Local file system for image uploads
- Browser local storage for quick access data

### Future Integrations
- OpenAI API for personalized insights
- Plaid for bank account connections
- SendGrid for email notifications
- Stripe for premium features
- Google Analytics for usage tracking

## Monitoring & Observability (Future)

### Application Monitoring
- Error tracking with Sentry
- Performance monitoring with DataDog
- User analytics with Mixpanel
- API monitoring with Postman

### Key Metrics to Track
- API response times
- Database query performance
- Frontend load times
- User engagement patterns
- Error rates and types

This architecture provides a solid foundation for the MVP while maintaining flexibility for future enhancements and scale.