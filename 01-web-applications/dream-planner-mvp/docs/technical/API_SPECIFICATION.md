# API Specification - Dream Planner MVP

## API Overview

The Dream Planner API provides a RESTful interface for managing user dreams, goals, and progress tracking. The API is designed to be intuitive and self-documenting, following REST best practices and returning predictable responses. All endpoints return JSON and use standard HTTP status codes to indicate success or failure conditions.

The base URL for all API endpoints in development is `http://localhost:8000/api/v1`. The API versioning strategy uses URL path versioning to ensure backward compatibility as the product evolves. All timestamps are returned in ISO 8601 format in UTC timezone, and all monetary values are stored and returned as decimal strings to prevent floating-point precision issues.

## Authentication

For the MVP demonstration, authentication is simplified to focus on core functionality. The system uses a mock authentication system with a default test user that is automatically created on first run. In the future production system, this would be replaced with JWT-based authentication using OAuth2 flows.

```
# MVP Authentication Header
X-User-Id: 1

# Future Production Header
Authorization: Bearer <jwt_token>
```

## Common Response Formats

### Successful Response

All successful responses follow a consistent structure that includes the requested data along with metadata about the request. This standardization makes it easier for the frontend to handle responses uniformly.

```json
{
    "success": true,
    "data": {
        // Response payload specific to endpoint
    },
    "meta": {
        "timestamp": "2024-01-15T10:30:00Z",
        "version": "1.0.0"
    }
}
```

### Error Response

Error responses provide detailed information to help developers understand and resolve issues. Each error includes a unique code that can be used for internationalization and specific error handling in the frontend.

```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input parameters",
        "details": {
            "field": "target_amount",
            "issue": "Must be greater than 0"
        }
    },
    "meta": {
        "timestamp": "2024-01-15T10:30:00Z",
        "request_id": "req_abc123"
    }
}
```

### Pagination Format

List endpoints support pagination to handle large datasets efficiently. The pagination metadata includes everything needed for the frontend to build pagination controls.

```json
{
    "success": true,
    "data": {
        "items": [...],
        "pagination": {
            "total": 150,
            "page": 1,
            "per_page": 20,
            "total_pages": 8,
            "has_next": true,
            "has_prev": false
        }
    }
}
```

## Core Endpoints

### Dreams Management

Dreams are the cornerstone of the application, representing the user's long-term financial goals. Each dream contains all the information needed to track progress and calculate savings requirements.

#### Create Dream
`POST /api/v1/dreams`

This endpoint creates a new dream for the authenticated user. The system automatically calculates various savings scenarios based on the target amount and date provided.

**Request Body:**
```json
{
    "title": "Three Week Trip to Japan",
    "description": "Explore Tokyo, Kyoto, and Osaka including temples, food, and culture",
    "category": "travel",
    "target_amount": "8500.00",
    "target_date": "2026-10-01",
    "priority": "high",
    "image_url": "https://images.example.com/japan-temple.jpg"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "user_id": 1,
        "title": "Three Week Trip to Japan",
        "description": "Explore Tokyo, Kyoto, and Osaka including temples, food, and culture",
        "category": "travel",
        "target_amount": "8500.00",
        "target_date": "2026-10-01",
        "priority": "high",
        "image_url": "https://images.example.com/japan-temple.jpg",
        "status": "active",
        "created_at": "2024-01-15T10:30:00Z",
        "calculated_goals": {
            "daily_amount": "11.64",
            "weekly_amount": "81.48",
            "monthly_amount": "354.17",
            "quarterly_amount": "1062.50",
            "total_weeks": 104,
            "total_months": 24
        },
        "progress": {
            "amount_saved": "0.00",
            "percentage_complete": 0,
            "on_track": true,
            "projected_completion": "2026-10-01"
        }
    }
}
```

#### List Dreams
`GET /api/v1/dreams`

Retrieves all dreams for the authenticated user with optional filtering and sorting capabilities.

**Query Parameters:**
- `status`: Filter by dream status (active, completed, paused, archived)
- `category`: Filter by category (travel, home, education, family, freedom, other)
- `sort`: Sort field (created_at, target_date, target_amount, progress)
- `order`: Sort order (asc, desc)
- `page`: Page number for pagination (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

**Example Request:**
```
GET /api/v1/dreams?status=active&category=travel&sort=target_date&order=asc
```

#### Get Dream Details
`GET /api/v1/dreams/{dream_id}`

Retrieves detailed information about a specific dream including all associated goals and recent progress.

**Response includes:**
- Complete dream information
- Calculated savings requirements
- Current progress statistics
- Associated goals breakdown
- Recent progress entries
- Projected completion analysis

#### Update Dream
`PUT /api/v1/dreams/{dream_id}`

Updates an existing dream. When the target amount or date changes, the system automatically recalculates all associated goals and projections.

**Request Body:**
```json
{
    "title": "Three Week Adventure in Japan",
    "target_amount": "9000.00",
    "target_date": "2026-12-01"
}
```

#### Delete Dream
`DELETE /api/v1/dreams/{dream_id}`

Soft deletes a dream by changing its status to 'archived'. This preserves historical data while removing it from active views.

### Goals Management

Goals break dreams down into manageable time periods. The system automatically creates and updates goals based on dream parameters.

#### Generate Goals for Dream
`POST /api/v1/dreams/{dream_id}/goals/generate`

Automatically generates weekly, monthly, and quarterly goals for a dream based on its target amount and date.

**Request Body:**
```json
{
    "strategy": "balanced",  // "aggressive", "balanced", or "conservative"
    "start_date": "2024-02-01"  // Optional, defaults to today
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "goals_created": {
            "weekly": 104,
            "monthly": 24,
            "quarterly": 8
        },
        "goals": [
            {
                "id": 1,
                "dream_id": 1,
                "period_type": "weekly",
                "period_start": "2024-02-01",
                "period_end": "2024-02-07",
                "target_amount": "81.48",
                "sequence_number": 1
            }
            // ... more goals
        ]
    }
}
```

#### Get Current Goals
`GET /api/v1/goals/current`

Retrieves the user's goals for the current period across all active dreams.

**Query Parameters:**
- `period`: Specify period type (day, week, month, quarter)
- `include_completed`: Include already completed goals (default: false)

### Progress Tracking

Progress endpoints handle the recording and analysis of savings activity.

#### Log Progress
`POST /api/v1/progress`

Records a savings contribution toward one or more dreams.

**Request Body:**
```json
{
    "amount": "100.00",
    "date": "2024-01-15",
    "allocation": [
        {
            "dream_id": 1,
            "amount": "60.00"
        },
        {
            "dream_id": 2,
            "amount": "40.00"
        }
    ],
    "note": "Skipped eating out this week"
}
```

#### Get Progress Summary
`GET /api/v1/progress/summary`

Provides comprehensive progress analytics for the specified time period.

**Query Parameters:**
- `period`: Time period (week, month, quarter, year, all)
- `start_date`: Custom period start date
- `end_date`: Custom period end date

**Response:**
```json
{
    "success": true,
    "data": {
        "period": {
            "start": "2024-01-01",
            "end": "2024-01-31"
        },
        "totals": {
            "target_amount": "1416.68",
            "actual_amount": "1325.00",
            "completion_percentage": 93.5
        },
        "by_dream": [
            {
                "dream_id": 1,
                "dream_title": "Trip to Japan",
                "target": "354.17",
                "actual": "325.00",
                "percentage": 91.8
            }
        ],
        "streaks": {
            "current_weekly_streak": 3,
            "best_weekly_streak": 7,
            "perfect_weeks": 12
        },
        "insights": [
            {
                "type": "achievement",
                "message": "You're consistently hitting 90% of your goals!"
            },
            {
                "type": "suggestion",
                "message": "Adding just $25 more weekly would accelerate Japan trip by 2 months"
            }
        ]
    }
}
```

### Analytics Endpoints

Analytics endpoints provide insights and projections to help users understand their financial journey.

#### Calculate Projections
`POST /api/v1/analytics/projections`

Calculates various savings scenarios and their impact on dream achievement timelines.

**Request Body:**
```json
{
    "dream_id": 1,
    "scenarios": [
        {
            "name": "current_pace",
            "weekly_amount": "81.48"
        },
        {
            "name": "accelerated",
            "weekly_amount": "100.00"
        },
        {
            "name": "reduced",
            "weekly_amount": "60.00"
        }
    ],
    "include_compound_interest": true,
    "interest_rate": 0.05
}
```

#### Get Insights
`GET /api/v1/analytics/insights`

Generates personalized insights based on user behavior and progress patterns.

**Response includes:**
- Savings velocity trends
- Achievement predictions
- Behavioral patterns
- Optimization suggestions
- Motivational insights

### User Preferences

These endpoints manage user settings and preferences for the application experience.

#### Update Preferences
`PUT /api/v1/users/preferences`

Updates user preferences for notifications, display options, and behavioral nudges.

**Request Body:**
```json
{
    "notifications": {
        "morning_motivation": true,
        "evening_checkin": false,
        "weekly_summary": true,
        "achievement_alerts": true
    },
    "display": {
        "currency_symbol": "$",
        "date_format": "MM/DD/YYYY",
        "first_day_of_week": "monday"
    },
    "nudges": {
        "style": "encouraging",  // "encouraging", "neutral", "competitive"
        "frequency": "daily"      // "daily", "weekly", "minimal"
    }
}
```

## WebSocket Events (Future Enhancement)

For real-time features, the API will support WebSocket connections for live updates.

### Event Types

```javascript
// Client to Server
{
    "type": "subscribe",
    "channel": "progress_updates"
}

// Server to Client
{
    "type": "progress_update",
    "data": {
        "dream_id": 1,
        "new_progress": "125.00",
        "total_progress": "1450.00",
        "percentage": 17.1
    }
}

// Achievement Notification
{
    "type": "achievement_unlocked",
    "data": {
        "achievement": "Week Warrior",
        "description": "Completed weekly goal 4 weeks in a row"
    }
}
```

## Rate Limiting

To ensure system stability and fair usage, the API implements rate limiting based on endpoint sensitivity.

- Standard endpoints: 100 requests per minute
- Analytics endpoints: 20 requests per minute
- Write operations: 30 requests per minute

Rate limit information is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Error Codes Reference

The API uses consistent error codes to help frontend developers handle different error scenarios appropriately.

- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource doesn't exist
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `CONFLICT`: Resource conflict (e.g., duplicate)
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Development Tools

### Swagger Documentation
Interactive API documentation is available at `http://localhost:8000/docs` when running the development server. This provides a convenient way to test endpoints and understand request/response formats.

### Postman Collection
A Postman collection with example requests for all endpoints is available in the `/docs/postman` directory. This includes pre-configured requests with sample data for easy testing.

### Mock Data Generator
The development environment includes a mock data generator that can populate the database with realistic test data:
```bash
python scripts/generate_mock_data.py --users 10 --dreams 50 --progress 1000
```

This API specification provides the foundation for building a robust backend that supports the Dream Planner's vision while maintaining flexibility for future enhancements.