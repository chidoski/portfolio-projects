# Setup Instructions - Dream Planner MVP

## Prerequisites

Before starting the setup process, ensure you have the following software installed on your Mac. These tools form the foundation of your development environment, and having the correct versions will prevent compatibility issues during development.

### Required Software

**Node.js and npm (version 18.0 or higher)**

Node.js is essential for running the React frontend. To check if you have Node.js installed, open your terminal and run the command `node --version`. If Node.js is not installed or you need to update it, visit the official Node.js website at nodejs.org and download the LTS version for macOS. The installer will guide you through the process and also install npm, which is the package manager for JavaScript.

**Python (version 3.11 or higher)**

Python powers the backend API of the application. Your Mac likely has Python installed, but it might be an older version. Check your Python version by running `python3 --version` in the terminal. If you need to install or update Python, the recommended approach for Mac users is to use Homebrew. If you don't have Homebrew, install it first by running the command found at brew.sh, then install Python with `brew install python@3.11`.

**Git**

Git is necessary for version control and will help you track changes as you develop. Check if Git is installed by running `git --version`. If it's not installed, you can install it through Homebrew with `brew install git` or download it directly from git-scm.com.

## Initial Project Setup

Now that you have the prerequisites ready, let's set up the project structure. The following commands will create all the necessary directories and files for your Dream Planner MVP.

### Step 1: Create Project Structure

Open your terminal and navigate to your desired project location. Run these commands sequentially to create the complete project structure:

```bash
# Navigate to your project directory
cd /Volumes/Extreme\ Pro/Programming/Python/Portfolio-Projects/01-web-applications/

# Create and enter the main project directory
mkdir dream-planner-mvp && cd dream-planner-mvp

# Create all necessary subdirectories
mkdir -p frontend/src/{components/{atoms,molecules,organisms,templates},pages,services,stores,utils,types,styles}
mkdir -p frontend/public/images
mkdir -p backend/app/{api/v1/endpoints,core,models,schemas,services,utils}
mkdir -p backend/tests
mkdir -p backend/scripts
mkdir -p docs/{technical,product}
mkdir -p database
```

### Step 2: Initialize Git Repository

Setting up version control from the start helps track your progress and makes it easier to share with Cursor:

```bash
# Initialize git repository
git init

# Create gitignore file
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc
.env
.env.local
venv/
env/

# Build outputs
frontend/build/
frontend/dist/
*.egg-info/

# Database
*.db
*.sqlite
*.sqlite3
database/*.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.coverage
htmlcov/
.pytest_cache/

# Production
*.pem
EOF

# Make initial commit
git add .
git commit -m "Initial project structure"
```

## Frontend Setup

The frontend uses React with TypeScript for type safety and Tailwind CSS for styling. Let's set up the complete frontend environment with all necessary dependencies and configuration files.

### Step 3: Initialize Frontend Project

Navigate to the frontend directory and create the React application:

```bash
# Navigate to frontend directory
cd frontend

# Initialize package.json with React and TypeScript
npm init -y

# Install React and core dependencies
npm install react@18 react-dom@18 react-router-dom@6

# Install development dependencies
npm install --save-dev @types/react @types/react-dom @types/node typescript@5 
npm install --save-dev @vitejs/plugin-react vite

# Install UI and utility libraries
npm install zustand axios date-fns recharts lucide-react
npm install tailwindcss@3 @tailwindcss/forms @tailwindcss/typography
npm install --save-dev autoprefixer postcss

# Install additional development tools
npm install --save-dev eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Step 4: Configure TypeScript

Create a TypeScript configuration file that provides proper type checking and module resolution:

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Create Vite-specific TypeScript config
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF
```

### Step 5: Configure Vite

Create the Vite configuration for fast development builds and hot module replacement:

```bash
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
EOF
```

### Step 6: Configure Tailwind CSS

Initialize Tailwind CSS with a configuration optimized for the Dream Planner design:

```bash
# Initialize Tailwind
npx tailwindcss init -p

# Update tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3f2',
          100: '#fee5e2',
          200: '#feccca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        dream: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          pink: '#ec4899',
          green: '#10b981',
          yellow: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
EOF
```

### Step 7: Create Core Frontend Files

Create the essential files to get the frontend running:

```bash
# Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/dream-icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dream Planner - Make Your Dreams Achievable</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lexend:wght@600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# Create main.tsx
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Create App.tsx
cat > src/App.tsx << 'EOF'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Routes>
          <Route path="/" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-5xl font-display font-bold text-gray-900 mb-4">
                  Dream Planner
                </h1>
                <p className="text-xl text-gray-600">
                  Transform your dreams into achievable goals
                </p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
EOF

# Create main CSS file
cat > src/styles/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-100 p-6;
  }
}
EOF
```

### Step 8: Update package.json Scripts

Add development scripts to package.json:

```bash
# Update package.json with scripts
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="tsc && vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.lint="eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
```

## Backend Setup

The backend uses FastAPI with Python for high-performance API development. Let's set up the complete backend environment.

### Step 9: Navigate to Backend and Create Virtual Environment

```bash
# Navigate to backend directory
cd ../backend

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Mac/Linux

# Upgrade pip
pip install --upgrade pip
```

### Step 10: Install Backend Dependencies

Create requirements.txt and install all necessary packages:

```bash
# Create requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.0
pydantic-settings==2.1.0
sqlalchemy==2.0.25
alembic==1.13.1
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0
httpx==0.26.0
pytest==7.4.4
pytest-asyncio==0.23.3
black==24.1.0
isort==5.13.2
EOF

# Install all dependencies
pip install -r requirements.txt
```

### Step 11: Create Backend Application Structure

Create the main FastAPI application file:

```bash
# Create main.py
cat > app/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import dreams, goals, progress, analytics
from app.core.config import settings

# Create FastAPI instance
app = FastAPI(
    title="Dream Planner API",
    description="API for managing dreams, goals, and financial progress",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Dream Planner API", "docs": "/docs"}

# Include API routers (to be implemented)
# app.include_router(dreams.router, prefix="/api/v1/dreams", tags=["dreams"])
# app.include_router(goals.router, prefix="/api/v1/goals", tags=["goals"])
# app.include_router(progress.router, prefix="/api/v1/progress", tags=["progress"])
# app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
EOF

# Create configuration file that supports both SQLite and Supabase
cat > app/core/config.py << 'EOF'
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Dream Planner"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database - will use Supabase if DATABASE_URL is set in .env, otherwise SQLite
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./database/dream_planner.db"
    )
    
    # Supabase (optional)
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL", None)
    SUPABASE_ANON_KEY: Optional[str] = os.getenv("SUPABASE_ANON_KEY", None)
    
    # Security (for future use)
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
EOF

# Create __init__.py files
touch app/__init__.py
touch app/api/__init__.py
touch app/api/v1/__init__.py
touch app/api/v1/endpoints/__init__.py
touch app/core/__init__.py
touch app/models/__init__.py
touch app/schemas/__init__.py
touch app/services/__init__.py
touch app/utils/__init__.py
```

### Step 12: Initialize Database

Create the database models and initialization script:

```bash
# Create database models
cat > app/models/database.py << 'EOF'
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite specific
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
EOF

# Create initial models
cat > app/models/dream.py << 'EOF'
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.sql import func
from app.models.database import Base
import enum

class DreamStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    paused = "paused"
    archived = "archived"

class DreamCategory(str, enum.Enum):
    travel = "travel"
    home = "home"
    education = "education"
    family = "family"
    freedom = "freedom"
    other = "other"

class Dream(Base):
    __tablename__ = "dreams"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)  # Simplified for MVP
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(Enum(DreamCategory))
    target_amount = Column(Float, nullable=False)
    target_date = Column(DateTime, nullable=False)
    image_url = Column(String)
    status = Column(Enum(DreamStatus), default=DreamStatus.active)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
EOF

# Create database initialization script
cat > scripts/init_db.py << 'EOF'
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.database import engine, Base
from app.models.dream import Dream

# Create all tables
Base.metadata.create_all(bind=engine)
print("Database tables created successfully!")
EOF
```

## Running the Application

Now that everything is set up, you can run both the frontend and backend servers to see your Dream Planner MVP in action.

### Step 13: Start the Backend Server

In one terminal window, navigate to the backend directory and start the FastAPI server:

```bash
# Navigate to backend directory
cd /Volumes/Extreme\ Pro/Programming/Python/Portfolio-Projects/01-web-applications/dream-planner-mvp/backend

# Activate virtual environment
source venv/bin/activate

# Initialize the database
python scripts/init_db.py

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

The backend will be available at http://localhost:8000, and you can view the interactive API documentation at http://localhost:8000/docs.

### Step 14: Start the Frontend Server

In a new terminal window, navigate to the frontend directory and start the React development server:

```bash
# Navigate to frontend directory
cd /Volumes/Extreme\ Pro/Programming/Python/Portfolio-Projects/01-web-applications/dream-planner-mvp/frontend

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:3000. The page will automatically reload when you make changes to the code.

## Verifying the Setup

To ensure everything is working correctly, perform these verification steps:

### Backend Verification
Open your browser and navigate to http://localhost:8000/docs. You should see the Swagger UI interface showing the Dream Planner API documentation. Try the health check endpoint by clicking on GET /health, then "Try it out," and "Execute." You should receive a response indicating the API is healthy.

### Frontend Verification
Open your browser and navigate to http://localhost:3000. You should see the Dream Planner welcome page with a gradient background and the title "Dream Planner" with the tagline "Transform your dreams into achievable goals."

### Database Verification
Check that the database was created by looking for a file at `backend/database/dream_planner.db`. This SQLite database file stores all the application data.

## Troubleshooting

If you encounter issues during setup, here are common problems and their solutions:

### Port Already in Use
If you see an error that port 3000 or 8000 is already in use, you can either stop the process using that port or change the port in the configuration. For the frontend, modify the port in vite.config.ts. For the backend, add `--port 8001` to the uvicorn command.

### Module Not Found Errors
If you encounter module not found errors, ensure you're in the correct directory and have activated the virtual environment (for Python) or run npm install (for Node.js). The virtual environment must be activated every time you open a new terminal for backend work.

### Database Connection Issues
If you have database connection problems, ensure the database directory exists and has write permissions. You can recreate the database by deleting the .db file and running the init_db.py script again.

## Next Steps

With the basic setup complete, you're ready to start building the Dream Planner features. The next steps involve implementing the core components including the dream builder interface, the progress tracking system, and the goal calculation engine. Use the documentation in the docs folder to guide your implementation, and leverage Cursor's AI capabilities to accelerate development.

Remember to commit your changes regularly to Git as you build features. This helps track progress and makes it easier to revert if needed. Good luck with your demo on Monday!