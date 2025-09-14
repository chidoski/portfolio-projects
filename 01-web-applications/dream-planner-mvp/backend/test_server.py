#!/usr/bin/env python3
"""
Test server to debug the backend issues
"""

import sys
import os

# Add current directory to Python path
sys.path.insert(0, '.')

def test_imports():
    try:
        print("Testing imports...")
        from app.main import app
        print("✓ FastAPI app imported successfully")
        
        # Test a simple route
        @app.get("/test")
        def test_route():
            return {"message": "Test route working"}
        
        print("✓ Test route added")
        return app
    except Exception as e:
        print(f"✗ Import error: {e}")
        import traceback
        traceback.print_exc()
        return None

def start_server(app):
    try:
        import uvicorn
        print("Starting server on http://localhost:8000")
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="debug")
    except Exception as e:
        print(f"✗ Server start error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("Dream Planner Backend Test")
    print("Current directory:", os.getcwd())
    print("Python path:", sys.path[:3])
    
    app = test_imports()
    if app:
        start_server(app)
