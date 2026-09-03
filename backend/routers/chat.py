"""Chat API Router"""
from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.chat_service import ChatService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
chat_service = ChatService()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message and get AI legal response."""
    try:
        result = await chat_service.process_message(
            message=request.message,
            session_id=request.session_id,
            language=request.language,
        )
        return ChatResponse(
            response=result["response"],
            session_id=request.session_id,
            ipc_sections=result.get("ipc_sections", []),
            urgency=result.get("urgency", "low"),
            document_link=result.get("document_link"),
            confidence=result.get("confidence", 0.85),
            language=request.language,
        )
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/history/{session_id}")
async def get_history(session_id: str):
    """Get chat history for a session."""
    history = await chat_service.get_history(session_id)
    return {"session_id": session_id, "messages": history, "total": len(history)}

@router.delete("/chat/history/{session_id}")
async def clear_history(session_id: str):
    """Clear chat history."""
    await chat_service.clear_history(session_id)
    return {"cleared": True, "session_id": session_id}
