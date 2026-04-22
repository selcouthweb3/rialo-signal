"""
Rialo Signal — Backend entry point
Run this file to start the development server.

Usage:
    python run.py

Then open:
    http://localhost:8000        → API root
    http://localhost:8000/docs  → Auto-generated Swagger UI (test all endpoints here)
    http://localhost:8000/health → Health check
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",   # tells uvicorn: find the 'app' object inside app/main.py
        host="0.0.0.0",   # 0.0.0.0 means accept connections from any IP (needed for deployment)
        port=8000,
        reload=True,      # auto-restart when you save a file (great for development)
        log_level="info"
    )
