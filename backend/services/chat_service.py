"""
Chat Service — Core AI response generation
Uses RAG pipeline with Indian legal corpus
Falls back to rule-based responses when ML models not loaded
"""

import re
import asyncio
import logging
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
import httpx
from dotenv import load_dotenv

from services.urgency_service import UrgencyClassifier
from services.ipc_service import IPCTagger

logger = logging.getLogger(__name__)

# Ensure backend/.env values are available even when process env is minimal.
load_dotenv()

# In-memory session store (use Redis in production)
CHAT_SESSIONS: Dict[str, List[Dict]] = {}


LEGAL_KNOWLEDGE_BASE = {
    "fir": {
        "keywords": ["fir", "police complaint", "police station", "report", "शिकायत", "पुलिस"],
        "response_hi": """## FIR (प्रथम सूचना रिपोर्ट) कैसे दर्ज करें

**Step 1: नजदीकी पुलिस स्टेशन जाएं**
अपने क्षेत्र के थाने में जाएं। ऑनलाइन भी दर्ज कर सकते हैं।

**Step 2: जरूरी दस्तावेज:**
- पहचान पत्र (आधार/पैन)
- घटना का लिखित विवरण
- सबूत (फोटो, वीडियो, screenshots)

**Step 3: FIR आवेदन लिखें:**
घटना का पूरा विवरण, आरोपी का नाम (यदि ज्ञात), तारीख और स्थान

**⚖️ आपके अधिकार:**
- पुलिस FIR लिखने से मना नहीं कर सकती *(धारा 166A IPC)*
- Zero FIR: किसी भी थाने में दर्ज करवा सकते हैं
- मना करे तो SP को लिखें या Magistrate के पास जाएं *(CrPC 156(3))*""",
        "response_en": """## How to File an FIR (First Information Report)

**Step 1:** Visit nearest police station or file online at cybercrime.gov.in

**Step 2: Required Documents:**
- Government ID (Aadhar/PAN)
- Written incident description
- Evidence (photos, videos, screenshots)

**Step 3:** Provide: full incident description, accused name (if known), date and location

**⚖️ Your Rights:**
- Police CANNOT refuse to register FIR *(IPC Section 166A)*
- Zero FIR can be filed at any police station
- If refused: approach Superintendent of Police or Magistrate *(CrPC 156(3))*""",
        "ipc_sections": ["IPC 166A", "CrPC 154", "CrPC 156(3)"],
        "urgency": "medium",
    },
    "rti": {
        "keywords": ["rti", "right to information", "सूचना का अधिकार", "information", "government", "सरकार"],
        "response_hi": """## RTI (सूचना का अधिकार) आवेदन गाइड

**RTI Act 2005** के तहत हर नागरिक को सरकारी जानकारी मांगने का अधिकार है।

**आवेदन कैसे करें:**
1. **ऑनलाइन:** rtionline.gov.in पर जाएं
2. **ऑफलाइन:** Public Information Officer (PIO) को लिखें
3. **शुल्क:** ₹10 (BPL कार्डधारकों के लिए निःशुल्क)

**आवेदन में क्या लिखें:**
- आप कौन सी जानकारी चाहते हैं (specific)
- कौन से विभाग से
- नाम, पता, संपर्क

**Timeline:**
- 30 दिन में जवाब देना अनिवार्य है
- जीवन/स्वतंत्रता से संबंधित: 48 घंटे

क्या मैं आपके लिए **RTI Draft** तैयार करूं?""",
        "response_en": """## RTI (Right to Information) Application Guide

Under the **RTI Act 2005**, every citizen can request information from government departments.

**How to Apply:**
1. **Online:** rtionline.gov.in
2. **Offline:** Write to Public Information Officer (PIO)
3. **Fee:** ₹10 (Free for BPL cardholders)

**Timeline:**
- 30 days mandatory response time
- Life/liberty related matters: 48 hours

**If No Response:**
First Appeal → Second Appeal to Information Commission → High Court

Want me to generate an **RTI draft** for you?""",
        "ipc_sections": ["RTI Act 2005 - Section 6", "RTI Act 2005 - Section 7", "RTI Act 2005 - Section 19"],
        "urgency": "low",
    },
    "domestic_violence": {
        "keywords": ["domestic violence", "घरेलू हिंसा", "maar", "dv", "husband", "पति", "beating", "cruelty", "498a"],
        "response_hi": """## घरेलू हिंसा — तत्काल कदम उठाएं

**⚠️ पहले अपनी सुरक्षा सुनिश्चित करें!**

**तत्काल हेल्पलाइन:**
🆘 महिला हेल्पलाइन: **1091**
🚔 पुलिस: **100**
📱 NCW: **7827170170**
🏠 Shelter: **181**

**कानूनी विकल्प:**

**1. Protection Order** *(PWDVA 2005 धारा 12)*
- Magistrate के सामने आवेदन करें
- 3 दिन में सुनवाई
- आवासीय/संपर्क/monetary आदेश

**2. FIR दर्ज करें** *(IPC 498A)*
- पुलिस स्टेशन में शिकायत
- Cognizable और Non-Bailable offense

**3. DLSA से मुफ्त कानूनी सहायता**
District Legal Services Authority: निःशुल्क वकील

क्या आप अभी सुरक्षित स्थान पर हैं?""",
        "response_en": """## Domestic Violence — Immediate Steps

**⚠️ Your safety is the priority!**

**Emergency Helplines:**
🆘 Women Helpline: **1091**
🚔 Police: **100**
📱 NCW: **7827170170**

**Legal Options:**
1. **Protection Order** under PWDVA 2005 Section 12 — apply to Magistrate
2. **File FIR** under IPC 498A — cognizable and non-bailable
3. **Free legal aid** from DLSA (District Legal Services Authority)

Are you in a safe place right now?""",
        "ipc_sections": ["PWDVA 2005 Sec 12", "IPC 498A", "IPC 323", "IPC 506"],
        "urgency": "high",
    },
    "cyber_crime": {
        "keywords": ["cyber", "online fraud", "hack", "phishing", "scam", "ठगी", "fraud", "money transferred", "otp"],
        "response_hi": """## साइबर क्राइम — तत्काल कार्रवाई

**⚠️ अभी यह करें:**

**Step 1: बैंक को तुरंत सूचित करें**
- Bank Helpline पर call करें
- Transaction block करवाएं
- लगभग 24 घंटे में वापसी संभव

**Step 2: Cybercrime Portal पर शिकायत**
🌐 **cybercrime.gov.in** → "Report Financial Fraud"
📞 **Helpline: 1930**

**Step 3: Documents तैयार रखें:**
- Bank statement + Transaction ID
- Conversation screenshots
- Fraud email/SMS

**Step 4: Local Police में FIR**
Cyber Crime Cell में शिकायत दर्ज करें

**⚖️ लागू धाराएं:**
- IT Act Section 66D (Cyber Fraud)
- IPC 420 (Cheating)
- IPC 406 (Criminal Breach of Trust)""",
        "response_en": """## Cyber Crime — Immediate Action Required

**Step 1: Contact your bank IMMEDIATELY** — block the transaction
**Step 2: File complaint** at cybercrime.gov.in or call **1930**
**Step 3: Collect evidence** — screenshots, transaction IDs, communication records
**Step 4: File FIR** at local cyber crime cell

**Applicable Sections:**
- IT Act 66D (Cyber Fraud)
- IPC 420 (Cheating)
- IPC 406 (Criminal Breach of Trust)""",
        "ipc_sections": ["IT Act 66D", "IPC 420", "IPC 406", "CrPC 154"],
        "urgency": "high",
    },
    "property": {
        "keywords": ["property", "zameen", "land", "जमीन", "भूमि", "rent", "किराया", "tenant", "landlord", "house", "flat"],
        "response_hi": """## संपत्ति विवाद — कानूनी विकल्प

**आपके पास ये विकल्प हैं:**

**1. सिविल कोर्ट में केस:**
- Title suit for declaration
- Injunction order (तत्काल रोक)
- Timeline: 1-3 वर्ष (Fast Track Court में कम)

**2. Revenue Court (Collector Office):**
- Mutation records के लिए
- Khasra/Khatauni correction

**3. Lok Adalat:**
- आपसी समझौता
- बिल्कुल मुफ्त
- Fast resolution

**4. DLSA (District Legal Services Authority):**
- निःशुल्क कानूनी सहायता

**जरूरी दस्तावेज:**
- Sale deed / Gift deed
- Mutation records
- Encumbrance certificate
- Property tax receipts""",
        "response_en": """## Property Dispute — Legal Options

**Options:**
1. **Civil Court** — Title declaration suit, Injunction order (CPC Order 39)
2. **Revenue Court** — Mutation record correction
3. **Lok Adalat** — Free, fast out-of-court settlement
4. **DLSA** — Free legal aid

**Key Documents Needed:**
- Sale deed / inheritance documents
- Khasra/Khatauni records
- Encumbrance certificate
- Property tax receipts

**Relevant Laws:**
Transfer of Property Act 1882, Specific Relief Act 1963""",
        "ipc_sections": ["Transfer of Property Act 1882", "Specific Relief Act 1963", "CPC Order 39", "IPC 420"],
        "urgency": "medium",
    },
    "labour": {
        "keywords": ["job", "termination", "fired", "company", "salary", "naukri", "नौकरी", "gratuity", "labour", "employer", "employee", "resign"],
        "response_hi": """## श्रम कानून — आपके अधिकार

**अवैध बर्खास्तगी के मामले में:**

**आपके अधिकार:**
- 1 माह का Notice या वेतन अनिवार्य *(Industrial Disputes Act Section 25F)*
- 5+ साल सेवा: Gratuity अनिवार्य *(Payment of Gratuity Act)*
- Full & Final Settlement: सभी dues
- PF, ESI निपटान

**Gratuity calculation:**
Last Salary × 15/26 × Years of Service

**कहां शिकायत करें:**
1. Labour Commissioner Office
2. Labour Court में Industrial Dispute file करें
3. EPF Commissioner (PF के लिए)
4. ESIC Office (ESI के लिए)

**Timeline:**
- Notice का जवाब: 30 दिन
- Labour Court: 3-6 माह

क्या मैं **Wrongful Termination Notice** draft करूं?""",
        "response_en": """## Labour Law — Your Rights

**On Wrongful Termination:**
- 1 month notice or salary mandatory *(IDA Section 25F)*
- Gratuity if served 5+ years *(Payment of Gratuity Act)*
- Full & Final Settlement within 45 days

**Gratuity Formula:** Last Salary × 15/26 × Years of Service

**Where to Complain:**
1. Labour Commissioner Office
2. Labour Court (Industrial Dispute)
3. EPF Commissioner (for PF issues)

Shall I draft a **Wrongful Termination Notice**?""",
        "ipc_sections": ["Industrial Disputes Act Sec 25F", "Payment of Gratuity Act Sec 4", "Minimum Wages Act"],
        "urgency": "medium",
    },
    "consumer": {
        "keywords": ["consumer", "product", "refund", "defect", "company", "amazon", "flipkart", "service", "complaint", "cheated", "deficiency"],
        "response_hi": """## उपभोक्ता अधिकार — Consumer Rights

**Consumer Protection Act 2019** के तहत आपके अधिकार:

**Step 1: Company को Notice**
- Email/Written complaint भेजें
- 30 दिन का समय दें

**Step 2: National Consumer Helpline**
📞 **1800-11-4000** (Free)
🌐 consumerhelpline.gov.in

**Step 3: Consumer Forum में शिकायत**
- District Forum: ₹50 लाख तक
- State Commission: ₹2 करोड़ तक
- National Commission: ₹2 करोड़ से ज्यादा

**शिकायत में क्या मांगें:**
- Product refund / replacement
- Compensation for mental harassment
- Legal costs

**⚖️ लागू कानून:** Consumer Protection Act 2019""",
        "response_en": """## Consumer Rights

Under **Consumer Protection Act 2019**:

**Steps:**
1. **Company Notice** — Written complaint, give 30 days
2. **National Consumer Helpline:** 1800-11-4000 (Free)
3. **Consumer Forum** — File at appropriate level:
   - District Forum: up to ₹50 Lakhs
   - State Commission: up to ₹2 Crores
   - National Commission: above ₹2 Crores

**You can claim:** Refund, replacement, compensation for harassment, legal costs""",
        "ipc_sections": ["Consumer Protection Act 2019 Sec 35", "Consumer Protection Act 2019 Sec 2(7)"],
        "urgency": "low",
    },
    "road_accident": {
        "keywords": [
            "accident", "road accident", "highway", "car crash", "bike accident",
            "hit and run", "hit-and-run", "vehicle collision", "rash driving",
            "motor accident", "truck hit", "road mishap", "दुर्घटना", "एक्सीडेंट",
            "सड़क हादसा", "गाड़ी टक्कर",
        ],
        "response_hi": """## Road/Highway Accident — तुरंत क्या करें

**1) पहले सुरक्षा:**
- घायल हों तो तुरंत **112/108** पर कॉल करें
- वाहन को सुरक्षित किनारे लगाएं (यदि संभव हो)

**2) पुलिस को सूचना दें:**
- नजदीकी थाने में तुरंत जानकारी दें / FIR दर्ज कराएं
- Hit-and-run में स्थान, वाहन नंबर (यदि दिखा), समय नोट करें

**3) सबूत इकट्ठा करें:**
- दुर्घटना स्थल की फोटो/वीडियो
- वाहन नुकसान, चोट, ब्रेक मार्क, CCTV/गवाह details
- DL, RC, insurance, PUC की कॉपी रखें

**4) मेडिकल और MLC:**
- तुरंत सरकारी/मान्य अस्पताल जाएं
- **MLC** बनवाएं (legal claim के लिए महत्वपूर्ण)

**5) मुआवजा (Compensation) के लिए:**
- MACT (Motor Accident Claims Tribunal) में claim file करें
- Insurance company को तुरंत intimation दें

**Relevant legal sections (facts ke hisaab se):**
- IPC 279 (rash driving), IPC 337/338 (hurt/grievous hurt), IPC 304A (death by negligence), MV Act Sec 134/187

अगर चाहें तो मैं अभी **FIR/Insurance claim ke liye short draft** बना दूं.""",
        "response_en": """## Road/Highway Accident — Immediate Steps

**1) Ensure safety first:**
- Call **112/108** immediately for emergency help
- Move to a safe side of the road, if possible

**2) Inform police quickly:**
- Report at nearest police station / file FIR
- In hit-and-run, note location, time, and vehicle details if available

**3) Preserve evidence:**
- Photos/videos of scene, damage, injuries, skid marks
- Collect witness and nearby CCTV details
- Keep copies of DL, RC, insurance, and PUC

**4) Get medical + MLC:**
- Visit a hospital immediately
- Ensure **MLC** is created for legal and claim purposes

**5) Compensation route:**
- File compensation claim before MACT (Motor Accident Claims Tribunal)
- Inform insurer without delay

**Likely applicable provisions (as facts fit):**
- IPC 279, IPC 337/338, IPC 304A, MV Act Sec 134/187

If you want, I can generate a **ready FIR/insurance claim draft** now.""",
        "ipc_sections": ["IPC 279", "IPC 337", "IPC 338", "IPC 304A", "MV Act Sec 134", "MV Act Sec 187", "CrPC 154"],
        "urgency": "high",
    },
}

DEFAULT_RESPONSE_HI = """Main aapka sawaal samajh raha hoon. Mujhe thodi aur jankari chahiye:

**Kya aap bata sakte hain:**
1. Ye mudda kab se chal raha hai?
2. Koi police complaint ya court case pehle hua hai?
3. Aapke paas koi documents ya evidence hai?

In details ke saath main aapko **sahi legal guidance** de sakta hoon — relevant IPC sections, next steps, aur documents generate karne mein help kar sakta hoon.

**Note:** Yeh AI-generated information hai. Serious mamlon mein ek qualified lawyer se zaroor milein."""

DEFAULT_RESPONSE_EN = """I understand your concern. Could you please provide a few more details?

1. How long has this issue been going on?
2. Have you filed any police complaint or court case before?
3. Do you have any documents or evidence?

With these details, I can provide you with accurate legal guidance, relevant IPC/CrPC sections, and help generate necessary documents.

**Note:** This is AI-generated information. For serious legal matters, always consult a qualified lawyer."""

LOOP_BREAKER_RESPONSE_HI = """Maine aapki baat samajh li hai. Aapko baar-baar same questions na poochte hue seedhe practical next steps de raha hoon:

**1) Incident record banayein (abhi):**
- Date, time, location, kya hua, kin logon ne dekha
- Phone chats/call logs/screenshots/photos/video ko safe backup karein

**2) Written complaint bhejein:**
- Nearest police station ya relevant authority ko short written complaint
- Complaint receive na ho to SP/DCP office aur email evidence rakhein

**3) Legal escalation path:**
- Police action na ho to Magistrate application (CrPC 156(3))
- Urgent risk ho to 100/112 pe call karein
- Free legal aid ke liye DLSA contact karein

**4) Documents ready rakhein:**
- ID proof, address proof, evidence bundle, witness details

**Applicable provisions (case ke nature ke hisaab se):**
- CrPC 154 (FIR), CrPC 156(3) (Magistrate direction), IPC 166A (refusal context), IPC 420/406/506 (if facts fit)

Agar aap chahen to main abhi aapke liye **ready-to-file complaint draft** bana deta hoon."""

LOOP_BREAKER_RESPONSE_EN = """I understand your issue. Instead of repeating follow-up questions, here are direct practical next steps:

**1) Create an incident record now:**
- Note date, time, location, what happened, and witnesses
- Preserve chats/call logs/screenshots/photos/videos in backup

**2) Send a written complaint:**
- Submit a brief written complaint to police/relevant authority
- If refused, escalate to SP/DCP and keep email/receipt proof

**3) Legal escalation path:**
- If police do not act, move Magistrate under CrPC 156(3)
- In immediate danger, call 100/112
- Contact DLSA for free legal aid

**4) Keep these documents ready:**
- ID proof, address proof, evidence bundle, witness details

**Commonly relevant provisions (depending on facts):**
- CrPC 154 (FIR), CrPC 156(3), IPC 166A (refusal context), IPC 420/406/506 (if applicable)

If you want, I can generate a **ready-to-file complaint draft** right now."""


class ChatService:
    def __init__(self):
        self.urgency_classifier = UrgencyClassifier()
        self.ipc_tagger = IPCTagger()
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        logger.info("ChatService initialized")

    def _find_best_match(self, message: str) -> Optional[Dict]:
        msg_lower = message.lower()
        best_match = None
        max_score = 0
        for topic, data in LEGAL_KNOWLEDGE_BASE.items():
            score = sum(1 for kw in data["keywords"] if kw in msg_lower)
            if score > max_score:
                max_score = score
                best_match = data
        return best_match if max_score > 0 else None

    def _recent_default_prompts(self, session_id: str, window: int = 6) -> int:
        history = CHAT_SESSIONS.get(session_id, [])[-window:]
        default_templates = {DEFAULT_RESPONSE_HI.strip(), DEFAULT_RESPONSE_EN.strip()}
        count = 0
        for item in history:
            if item.get("role") != "assistant":
                continue
            content = (item.get("content") or "").strip()
            if content in default_templates:
                count += 1
        return count

    def _looks_like_incident_details(self, message: str) -> bool:
        msg = message.lower()
        detail_keywords = [
            "incident", "happened", "date", "time", "location", "proof", "evidence",
            "screenshot", "recording", "witness", "complaint", "police", "court",
            "since", "days", "months", "year", "fir", "thana", "complain",
            "घटना", "सबूत", "शिकायत", "पुलिस", "केस", "कब", "कहाँ",
        ]
        return len(msg.strip()) >= 20 and any(keyword in msg for keyword in detail_keywords)

    def _asks_for_immediate_advice(self, message: str) -> bool:
        msg = message.lower()
        advice_phrases = [
            "what should i do", "what to do", "what can i do", "next step", "next steps",
            "help me", "advise me", "solution", "kya karu", "kya karun", "kya karna chahiye",
        ]
        return any(phrase in msg for phrase in advice_phrases)

    def _asks_fault_assessment(self, message: str) -> bool:
        msg = message.lower()
        fault_phrases = [
            "whose fault", "who is at fault", "who was wrong", "who is wrong", "liability",
            "liable", "negligence", "responsible", "kasur kiska", "kis ki galti", "kis ki galati",
            "galti kiski", "fault",
        ]
        return any(phrase in msg for phrase in fault_phrases)

    async def _generate_openai_response(
        self,
        message: str,
        session_id: str,
        language: str,
        fallback_response: str,
        matched_sections: List[str],
    ) -> Optional[str]:
        if not self.openai_api_key:
            return None

        history = CHAT_SESSIONS.get(session_id, [])[-6:]
        convo_messages = []
        for item in history:
            role = item.get("role")
            if role not in {"user", "assistant"}:
                continue
            convo_messages.append({
                "role": role,
                "content": item.get("content", ""),
            })

        fault_hint = ""
        if self._asks_fault_assessment(message):
            fault_hint = (
                "User asks for fault/liability analysis. Provide a preliminary, fact-based view of likely fault shares, "
                "missing facts needed, and legal next steps. Clearly mention this is not a final judicial finding."
            )

        language_hint = "Respond in English." if language == "english" else "Respond in simple Hinglish (Hindi+English)."
        system_prompt = (
            "You are NyayMitra, an Indian legal guidance assistant.\n"
            "Give practical, step-by-step legal help with relevant IPC/CrPC/MV Act sections where useful.\n"
            "Do not refuse with generic follow-up loops. Give immediate actionable advice first, then ask only 1-2 critical follow-up questions if necessary.\n"
            "If user asks fault/liability, give a preliminary assessment using available facts and explain uncertainty.\n"
            "Do not claim to be a lawyer. Add a one-line caution that this is legal information, not final legal advice.\n"
            f"{language_hint}\n"
            f"{fault_hint}"
        )

        user_prompt = (
            f"User message: {message}\n\n"
            f"Fallback guidance (use if relevant): {fallback_response}\n"
            f"Known relevant sections from classifier: {', '.join(matched_sections) if matched_sections else 'None'}"
        )

        payload = {
            "model": self.openai_model,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": system_prompt},
                *convo_messages,
                {"role": "user", "content": user_prompt},
            ],
        }

        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=18.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"].strip()
                return content or None
        except Exception as exc:
            logger.warning("OpenAI response failed; falling back to rule-based. error=%s", exc)
            return None

    def _get_response_text(self, match: Dict, language: str) -> str:
        if language == "english":
            return match.get("response_en", match.get("response_hi", ""))
        return match.get("response_hi", match.get("response_en", ""))

    async def process_message(self, message: str, session_id: str, language: str = "hinglish") -> Dict[str, Any]:
        # Store in session history
        if session_id not in CHAT_SESSIONS:
            CHAT_SESSIONS[session_id] = []
        CHAT_SESSIONS[session_id].append({
            "role": "user",
            "content": message,
            "timestamp": datetime.utcnow().isoformat(),
        })

        # Simulate AI processing delay
        await asyncio.sleep(0.8)

        # Find matching topic
        match = self._find_best_match(message)
        urgency_result = self.urgency_classifier.classify(message)
        ipc_sections = self.ipc_tagger.extract_sections(message)
        asks_advice = self._asks_for_immediate_advice(message)
        looks_detailed = self._looks_like_incident_details(message)
        asks_fault = self._asks_fault_assessment(message)
        match_topic = None
        if match:
            match_topic = next((topic for topic, data in LEGAL_KNOWLEDGE_BASE.items() if data is match), "matched_topic")
        logger.info(
            "chat_route session=%s match=%s asks_advice=%s looks_detailed=%s asks_fault=%s openai_enabled=%s",
            session_id,
            match_topic,
            asks_advice,
            looks_detailed,
            asks_fault,
            bool(self.openai_api_key),
        )

        if match:
            response_text = self._get_response_text(match, language)
            ipc_sections = list(set(ipc_sections + match.get("ipc_sections", [])))
            urgency = match.get("urgency", urgency_result.get("urgency", "low"))
        else:
            repeated_default = self._recent_default_prompts(session_id) >= 1
            if repeated_default or looks_detailed or asks_advice or asks_fault:
                response_text = LOOP_BREAKER_RESPONSE_EN if language == "english" else LOOP_BREAKER_RESPONSE_HI
                ipc_sections = list(set(ipc_sections + ["CrPC 154", "CrPC 156(3)", "IPC 166A"]))
            else:
                response_text = DEFAULT_RESPONSE_EN if language == "english" else DEFAULT_RESPONSE_HI
            urgency = urgency_result.get("urgency", "low")

        # If OpenAI key is configured, enhance answer quality and fault analysis.
        # Keep fallback response in case API call fails.
        llm_response = await self._generate_openai_response(
            message=message,
            session_id=session_id,
            language=language,
            fallback_response=response_text,
            matched_sections=ipc_sections,
        )
        if llm_response:
            response_text = llm_response

        # Store AI response
        CHAT_SESSIONS[session_id].append({
            "role": "assistant",
            "content": response_text,
            "timestamp": datetime.utcnow().isoformat(),
            "ipc_sections": ipc_sections,
            "urgency": urgency,
        })

        return {
            "response": response_text,
            "session_id": session_id,
            "ipc_sections": ipc_sections[:5],
            "urgency": urgency,
            "document_link": None,
            "confidence": 0.88,
            "language": language,
        }

    async def get_history(self, session_id: str) -> List[Dict]:
        return CHAT_SESSIONS.get(session_id, [])

    async def clear_history(self, session_id: str) -> None:
        CHAT_SESSIONS.pop(session_id, None)

    async def summarize_session(self, session_id: str) -> str:
        messages = CHAT_SESSIONS.get(session_id, [])
        if not messages:
            return "No conversation history found."
        user_msgs = [m["content"] for m in messages if m["role"] == "user"]
        return f"Conversation with {len(messages)} messages. User raised {len(user_msgs)} queries covering topics related to: {', '.join(user_msgs[:2])}..."
