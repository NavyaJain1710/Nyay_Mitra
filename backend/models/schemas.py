"""Pydantic models / schemas for NyayMitra API"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class Language(str, Enum):
    hindi = "hindi"
    english = "english"
    hinglish = "hinglish"


class Urgency(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User's legal query")
    session_id: str = Field(..., description="Unique session identifier")
    language: Language = Field(Language.hinglish, description="Preferred response language")
    user_name: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Mera landlord rent receipt nahi de raha, kya karoon?",
                "session_id": "session_123456",
                "language": "hinglish",
            }
        }


class IPCSection(BaseModel):
    section: str
    title: str
    description: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    ipc_sections: List[str] = []
    urgency: Urgency = Urgency.low
    document_link: Optional[str] = None
    confidence: Optional[float] = None
    language: Language = Language.hinglish
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

    class Config:
        json_schema_extra = {
            "example": {
                "response": "Aap Rent Control Act ke Section 7 ke tahat...",
                "session_id": "session_123456",
                "ipc_sections": ["Rent Control Act Sec 7", "CPC Sec 9"],
                "urgency": "low",
                "document_link": None,
                "confidence": 0.92,
                "language": "hinglish",
            }
        }


class Message(BaseModel):
    role: str  # "user" | "assistant" | "admin"
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    ipc_sections: List[str] = []
    urgency: Optional[Urgency] = None


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: List[Message]
    total: int = 0


class DocumentRequest(BaseModel):
    doc_type: str = Field(..., description="fir | rti | notice | complaint | bail | affidavit")
    form_data: Dict[str, Any] = Field(..., description="Form fields for document")
    language: Language = Language.hindi
    session_id: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "doc_type": "fir",
                "form_data": {
                    "complainant_name": "Ramesh Kumar",
                    "complainant_address": "123 Main Street, Delhi",
                    "incident_description": "My neighbor stole my property...",
                },
                "language": "hindi",
            }
        }


class DocumentResponse(BaseModel):
    doc_type: str
    title: str
    content: str
    generated_at: str
    download_url: Optional[str] = None


class SessionInfo(BaseModel):
    session_id: str
    user_name: Optional[str] = None
    urgency: Urgency = Urgency.low
    tag: Optional[str] = None
    message_count: int = 0
    last_activity: Optional[str] = None
    location: Optional[str] = None
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class AdminReplyRequest(BaseModel):
    session_id: str
    message: str
    admin_id: str


class UrgencyAnalysis(BaseModel):
    urgency: Urgency
    confidence: float
    keywords: List[str] = []
    reasoning: Optional[str] = None
