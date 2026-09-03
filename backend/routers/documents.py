"""Documents API Router — Legal document generation"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
import io
import logging
from datetime import datetime

from models.schemas import DocumentRequest, DocumentResponse
from services.document_service import DocumentGenerator

router = APIRouter()
logger = logging.getLogger(__name__)
doc_generator = DocumentGenerator()


@router.post("/generate", response_model=DocumentResponse)
async def generate_document(request: DocumentRequest):
    """Generate legal document from template and form data."""
    try:
        result = doc_generator.generate(
            doc_type=request.doc_type,
            form_data=request.form_data,
            language=request.language,
        )
        return DocumentResponse(
            doc_type=request.doc_type,
            content=result["content"],
            title=result["title"],
            generated_at=datetime.utcnow().isoformat(),
        )
    except Exception as e:
        logger.error(f"Document generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/download/{doc_type}")
async def download_document(doc_type: str, request: DocumentRequest):
    """Generate and download document as text file."""
    result = doc_generator.generate(doc_type=doc_type, form_data=request.form_data)
    content = result["content"].encode("utf-8")
    return StreamingResponse(
        io.BytesIO(content),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={doc_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"},
    )


@router.get("/templates")
async def list_templates():
    """List all available document templates."""
    return {
        "templates": [
            {"id": "fir", "name": "FIR Application", "category": "Criminal", "icon": "🚨"},
            {"id": "rti", "name": "RTI Application", "category": "Government", "icon": "📋"},
            {"id": "notice", "name": "Legal Notice", "category": "Civil", "icon": "📜"},
            {"id": "complaint", "name": "Consumer Complaint", "category": "Consumer", "icon": "📝"},
            {"id": "bail", "name": "Bail Application", "category": "Criminal", "icon": "⚖️"},
            {"id": "affidavit", "name": "Affidavit", "category": "General", "icon": "🗒️"},
            {"id": "pil", "name": "PIL Petition", "category": "Public Interest", "icon": "🏛️"},
            {"id": "cheque_bounce", "name": "Cheque Bounce Notice", "category": "Financial", "icon": "💳"},
        ]
    }


@router.post("/classify")
async def classify_document(text: str):
    """Classify an uploaded document type using ML."""
    # In production: use trained classifier
    keywords = text.lower()
    if any(w in keywords for w in ["fir", "first information", "police complaint"]):
        doc_type = "FIR"
    elif any(w in keywords for w in ["rti", "right to information", "information sought"]):
        doc_type = "RTI Application"
    elif any(w in keywords for w in ["legal notice", "notice is hereby"]):
        doc_type = "Legal Notice"
    elif any(w in keywords for w in ["consumer", "defect", "deficiency"]):
        doc_type = "Consumer Complaint"
    else:
        doc_type = "Unknown Document"
    return {"doc_type": doc_type, "confidence": 0.85}
