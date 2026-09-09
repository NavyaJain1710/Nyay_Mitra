from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import hashlib
import secrets
from datetime import datetime, timedelta
import logging

# We will import CHAT_SESSIONS from chat_service inside the route to avoid circular imports if necessary
# or just store a reference to the global dicts.

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory stores
USERS = {}
ACTIVE_USER_TOKENS = {}

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def user_signup(request: SignupRequest):
    if request.email in USERS:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    pw_hash = hashlib.sha256(request.password.encode()).hexdigest()
    USERS[request.email] = {
        "password_hash": pw_hash,
        "name": request.name,
        "email": request.email,
        "role": "user"
    }
    
    # Auto-login after signup
    token = secrets.token_urlsafe(32)
    ACTIVE_USER_TOKENS[token] = {
        "email": request.email,
        "name": request.name,
        "expires": datetime.utcnow() + timedelta(hours=24)
    }
    
    return {"token": token, "name": request.name, "email": request.email, "role": "user"}

@router.post("/login")
async def user_login(request: LoginRequest):
    user = USERS.get(request.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    pw_hash = hashlib.sha256(request.password.encode()).hexdigest()
    if pw_hash != user["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = secrets.token_urlsafe(32)
    ACTIVE_USER_TOKENS[token] = {
        "email": request.email,
        "name": user["name"],
        "expires": datetime.utcnow() + timedelta(hours=24)
    }
    return {"token": token, "name": user["name"], "email": request.email, "role": user["role"]}

@router.get("/dashboard")
async def get_dashboard(token: str):
    if token not in ACTIVE_USER_TOKENS:
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    
    user_email = ACTIVE_USER_TOKENS[token]["email"]
    
    # Import CHAT_SESSIONS here to get the data
    from services.chat_service import CHAT_SESSIONS
    
    user_sessions = []
    
    for session_id, messages in CHAT_SESSIONS.items():
        if not messages:
            continue
            
        belongs_to_user = False
        has_admin_reply = False
        preview_text = ""
        
        for msg in messages:
            if msg.get("user_email") == user_email:
                belongs_to_user = True
            if msg.get("role") == "admin":
                has_admin_reply = True
            if msg.get("role") == "user" and not preview_text:
                preview_text = msg.get("content", "")[:50] + "..."
                
        if belongs_to_user:
            user_sessions.append({
                "session_id": session_id,
                "preview": preview_text,
                "has_admin_reply": has_admin_reply,
                "messages": messages,
                "created_at": messages[0].get("timestamp")
            })
            
    # Sort by newest first
    user_sessions.sort(key=lambda x: x["created_at"] or "", reverse=True)
    
    return {"sessions": user_sessions}
