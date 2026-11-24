"""
NyayMitra Backend - FastAPI Application
AI-powered legal assistant for India
"""

import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import asyncio
import logging
from datetime import datetime
from typing import Optional
import os

from routers import chat, documents, admin, auth, users
from services.chat_service import ChatService
from services.connection_manager import ConnectionManager
from models.schemas import ChatRequest, ChatResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NyayMitra API",
    description="AI Legal Assistant for India — FastAPI Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
connection_manager = ConnectionManager()
chat_service = ChatService()

# Include Routers
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])


@app.get("/")
async def root():
    return {
        "app": "NyayMitra API",
        "version": "1.0.0",
        "status": "running",
        "description": "AI Legal Assistant for India",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# ─── WebSocket Chat ──────────────────────────────────────────
@app.websocket("/ws/chat/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    await connection_manager.connect(websocket, session_id)
    logger.info(f"WebSocket connected: {session_id}")
    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            message = data.get("message", "")
            language = data.get("language", "hinglish")
            user_email = data.get("user_email")

            if not message.strip():
                continue

            # Send typing indicator
            await connection_manager.send_to_session(session_id, {
                "type": "typing",
                "status": True,
            })

            try:
                response = await chat_service.process_message(
                    message=message,
                    session_id=session_id,
                    language=language,
                    user_email=user_email,
                )
                await connection_manager.send_to_session(session_id, {
                    "type": "message",
                    "content": response["response"],
                    "ipc_sections": response.get("ipc_sections", []),
                    "urgency": response.get("urgency", "low"),
                    "document_link": response.get("document_link"),
                    "timestamp": datetime.utcnow().isoformat(),
                })

                # Notify connected admin dashboards of active session update
                for cid in connection_manager.get_active_sessions():
                    if cid.startswith("admin_"):
                        await connection_manager.send_to_session(cid, {
                            "type": "new_session",
                            "session_id": session_id,
                        })
            except Exception as e:
                logger.error(f"Chat error: {e}")
                await connection_manager.send_to_session(session_id, {
                    "type": "error",
                    "message": "Processing error. Please try again.",
                })

    except WebSocketDisconnect:
        connection_manager.disconnect(session_id)
        logger.info(f"WebSocket disconnected: {session_id}")


# ─── WebSocket Admin ─────────────────────────────────────────
@app.websocket("/ws/admin/{admin_id}")
async def websocket_admin(websocket: WebSocket, admin_id: str):
    await connection_manager.connect(websocket, f"admin_{admin_id}")
    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            # Broadcast admin message to relevant user session
            target_session = data.get("target_session_id")
            if target_session:
                msg_content = data.get("message")
                ts = datetime.utcnow().isoformat()
                
                # Save to history
                if target_session in chat_service.CHAT_SESSIONS:
                    chat_service.CHAT_SESSIONS[target_session].append({
                        "role": "admin",
                        "content": msg_content,
                        "timestamp": ts,
                        "from": "admin"
                    })
                    
                await connection_manager.send_to_session(target_session, {
                    "type": "admin_message",
                    "content": msg_content,
                    "from": "admin",
                    "timestamp": ts,
                })
    except WebSocketDisconnect:
        connection_manager.disconnect(f"admin_{admin_id}")
