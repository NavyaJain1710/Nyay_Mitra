"""Auth Router — JWT-based authentication"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import hashlib
import secrets
from datetime import datetime, timedelta
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)

# Mock user store (use PostgreSQL + bcrypt in production)
MOCK_ADMINS = {
    "admin@nyaymitra.in": {"password_hash": hashlib.sha256("admin123".encode()).hexdigest(), "name": "Admin", "role": "admin"},
}
ACTIVE_TOKENS = {}


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/admin/login")
async def admin_login(request: LoginRequest):
    user = MOCK_ADMINS.get(request.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    pw_hash = hashlib.sha256(request.password.encode()).hexdigest()
    if pw_hash != user["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = secrets.token_urlsafe(32)
    ACTIVE_TOKENS[token] = {"email": request.email, "name": user["name"], "expires": datetime.utcnow() + timedelta(hours=8)}
    return {"token": token, "name": user["name"], "role": user["role"], "expires_in": 28800}


@router.post("/admin/logout")
async def admin_logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials:
        ACTIVE_TOKENS.pop(credentials.credentials, None)
    return {"message": "Logged out"}


@router.get("/admin/me")
async def get_admin_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or credentials.credentials not in ACTIVE_TOKENS:
        raise HTTPException(status_code=401, detail="Invalid token")
    token_data = ACTIVE_TOKENS[credentials.credentials]
    return {"email": token_data["email"], "name": token_data["name"]}
