#!/usr/bin/env python3
"""
Simple startup script for the Dream Planner backend.
This bypasses module import issues by running everything in the correct context.
"""

import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

if __name__ == "__main__":
    import uvicorn
    from app.main import app
    
    print("Starting Dream Planner API server...")
    print("Backend directory:", backend_dir)
    print("Python path:", sys.path[:3])
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
