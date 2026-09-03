"""IPC / CrPC Section Tagger — NLP-based section extraction"""

import re
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

# Keyword → Section mapping
IPC_KEYWORD_MAP = {
    # Criminal
    "murder": ["IPC 302"],
    "rape": ["IPC 376", "IPC 354"],
    "assault": ["IPC 323", "IPC 324"],
    "theft": ["IPC 378", "IPC 379"],
    "robbery": ["IPC 390", "IPC 392"],
    "kidnap": ["IPC 359", "IPC 363"],
    "fraud": ["IPC 420", "IPC 415"],
    "cheating": ["IPC 420", "IPC 415"],
    "forgery": ["IPC 463", "IPC 465"],
    "bribery": ["IPC 171B", "Prevention of Corruption Act"],
    "defamation": ["IPC 499", "IPC 500"],
    "criminal breach of trust": ["IPC 406"],
    "extortion": ["IPC 383", "IPC 384"],

    # Family
    "domestic violence": ["PWDVA 2005 Sec 12", "IPC 498A"],
    "cruelty": ["IPC 498A", "IPC 304B"],
    "dowry": ["Dowry Prohibition Act", "IPC 498A", "IPC 304B"],
    "maintenance": ["CrPC 125", "Hindu Marriage Act Sec 24"],
    "divorce": ["Hindu Marriage Act", "CrPC 125"],
    "custody": ["Guardian and Wards Act", "Hindu Minority and Guardianship Act"],

    # Property
    "property dispute": ["Transfer of Property Act 1882", "Specific Relief Act 1963"],
    "land": ["Transfer of Property Act 1882", "CPC Order 39"],
    "tenant": ["Rent Control Act", "Transfer of Property Act"],
    "landlord": ["Rent Control Act", "Transfer of Property Act"],
    "eviction": ["CPC Order 39", "Rent Control Act"],

    # Government/RTI
    "rti": ["RTI Act 2005 Sec 6", "RTI Act 2005 Sec 7"],
    "information": ["RTI Act 2005 Sec 6"],
    "government": ["RTI Act 2005"],

    # Cyber
    "cyber": ["IT Act Sec 66", "IT Act Sec 66D"],
    "hacking": ["IT Act Sec 66", "IPC 420"],
    "online fraud": ["IT Act Sec 66D", "IPC 420"],
    "phishing": ["IT Act Sec 66D", "IPC 420"],

    # Police/FIR
    "fir": ["CrPC 154", "CrPC 156"],
    "police": ["CrPC 154", "IPC 166A"],
    "arrested": ["CrPC 41", "CrPC 50", "Article 22 Constitution"],
    "bail": ["CrPC 436", "CrPC 437", "CrPC 439"],

    # Labour
    "termination": ["Industrial Disputes Act Sec 25F", "Payment of Gratuity Act"],
    "gratuity": ["Payment of Gratuity Act Sec 4"],
    "salary": ["Payment of Wages Act", "Minimum Wages Act"],
    "pf": ["Employees Provident Fund Act"],
    "esi": ["Employees State Insurance Act"],

    # Consumer
    "consumer": ["Consumer Protection Act 2019 Sec 35"],
    "refund": ["Consumer Protection Act 2019"],
    "defect": ["Consumer Protection Act 2019 Sec 2(7)"],
    "cheque bounce": ["Negotiable Instruments Act Sec 138"],

    # Constitutional
    "fundamental rights": ["Article 19", "Article 21 Constitution"],
    "right to life": ["Article 21 Constitution"],
    "free speech": ["Article 19(1)(a) Constitution"],
    "equality": ["Article 14 Constitution"],
}


class IPCTagger:
    def __init__(self):
        logger.info("IPCTagger initialized")

    def extract_sections(self, text: str) -> List[str]:
        text_lower = text.lower()
        sections = set()

        # Keyword-based extraction
        for keyword, section_list in IPC_KEYWORD_MAP.items():
            if keyword in text_lower:
                sections.update(section_list)

        # Regex for explicit section mentions like "Section 302", "IPC 420", "धारा 498A"
        explicit_patterns = [
            r'(?:section|sec|धारा)\s*(\d+[A-Za-z]?)',
            r'IPC\s*(\d+[A-Za-z]?)',
            r'CrPC\s*(\d+[A-Za-z]?)',
            r'Article\s*(\d+[A-Za-z]?)',
        ]
        for pattern in explicit_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for m in matches:
                sections.add(f"IPC {m}")

        return list(sections)[:6]

    def get_section_details(self, section: str) -> Dict:
        """Return details about a specific section (mock — use DB in production)."""
        known_sections = {
            "IPC 420": {"title": "Cheating", "bailable": False, "punishment": "Up to 7 years + fine"},
            "IPC 498A": {"title": "Cruelty by husband/relatives", "bailable": False, "punishment": "Up to 3 years + fine"},
            "CrPC 154": {"title": "FIR Registration", "bailable": None, "punishment": "N/A — procedural"},
            "IPC 302": {"title": "Murder", "bailable": False, "punishment": "Death or life imprisonment"},
            "RTI Act 2005 Sec 6": {"title": "Request for information", "bailable": None, "punishment": "N/A"},
        }
        return known_sections.get(section, {"title": "See official IPC/CrPC text", "bailable": None, "punishment": "Refer statute"})
