"""
Urgency Detection Service
Classifies legal queries into low/medium/high urgency
Uses keyword-based rules + ML model (when available)
"""

import re
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

HIGH_URGENCY_KEYWORDS = [
    # Violence / immediate danger
    "maar", "maar raha", "maar rahe", "killing", "murder", "rape", "assault",
    "life threat", "jaan ka khatra", "attack", "kidnap", "kidnapping",
    # Domestic violence
    "domestic violence", "घरेलू हिंसा", "beating me", "hitting me", "पीट रहा",
    # Financial emergency
    "bank account frozen", "all money gone", "account hack",
    # Custody emergency
    "child taken", "custody emergency",
    # Legal emergency
    "arrested", "arrest", "girtaar", "court hearing today", "bail emergency",
    "eviction notice today", "immediate",
    # Cyber emergency (recent fraud)
    "just happened", "abhi hua", "right now", "turant",
]

MEDIUM_URGENCY_KEYWORDS = [
    "fir", "police", "court", "case file", "summons", "notice received",
    "fraud", "cheated", "cyber crime", "harassment", "employment terminated",
    "property dispute", "land dispute", "tenant eviction", "zameen",
    "consumer complaint", "refund denied", "defect", "cheque bounce",
    "RTI denied", "government harassment",
]

LOW_URGENCY_KEYWORDS = [
    "rti", "information", "how to", "kaise", "what is", "explain",
    "rights", "adhikar", "process", "document", "template", "draft",
    "general query", "advice", "guidance",
]


class UrgencyClassifier:
    def __init__(self):
        # In production: load trained PyTorch/sklearn model
        self.model_loaded = False
        logger.info("UrgencyClassifier initialized (rule-based mode)")

    def classify(self, text: str) -> Dict:
        text_lower = text.lower()
        high_score = sum(1 for kw in HIGH_URGENCY_KEYWORDS if kw in text_lower)
        medium_score = sum(1 for kw in MEDIUM_URGENCY_KEYWORDS if kw in text_lower)
        low_score = sum(1 for kw in LOW_URGENCY_KEYWORDS if kw in text_lower)

        # Determine urgency
        if high_score >= 1:
            urgency = "high"
            confidence = min(0.6 + high_score * 0.1, 0.99)
            matched = [kw for kw in HIGH_URGENCY_KEYWORDS if kw in text_lower]
        elif medium_score >= 1:
            urgency = "medium"
            confidence = min(0.6 + medium_score * 0.08, 0.92)
            matched = [kw for kw in MEDIUM_URGENCY_KEYWORDS if kw in text_lower]
        else:
            urgency = "low"
            confidence = 0.75
            matched = [kw for kw in LOW_URGENCY_KEYWORDS if kw in text_lower]

        return {
            "urgency": urgency,
            "confidence": round(confidence, 2),
            "keywords": matched[:5],
        }

    def batch_classify(self, texts: List[str]) -> List[Dict]:
        return [self.classify(t) for t in texts]
