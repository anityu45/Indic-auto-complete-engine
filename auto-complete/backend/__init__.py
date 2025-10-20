"""
Backend package initializer.
Allows importing the FastAPI `app` via `backend` package.

Example:
    uvicorn backend:app --host 0.0.0.0 --port 8000
"""
from .main import app  # re-export for ASGI servers
