# ⚖️ NyayMitra V3 — Advanced AI Legal Assistant for India
### न्यायमित्र — Justice for Every Indian

> The most comprehensive AI-powered legal assistant — multilingual, voice-enabled, document-generating, and ML-powered.

---

## 🚀 QUICK START (30 seconds)

### Option 1: Instant Demo — Open in Browser
```
Open nyaymitra-demo.html in Chrome
```
**That's it!** Full AI chat + 12 documents + 12 languages — all offline.

### Option 2: HTTP Server
```bash
./start.sh demo
# → http://localhost:8080/nyaymitra-demo.html
# → http://localhost:8080/admin-dashboard/index.html
```

### Option 3: Full Stack
```bash
./start.sh full
# → React at http://localhost:3000
# → FastAPI at http://localhost:8000/docs
```

### Option 4: Docker
```bash
./start.sh docker
# → App at http://localhost 
``` 
 
--- 
 
## 🌟 V3 NEW FEATURES 
 
| Feature | Description | 
|---------|-------------| 
| 🗺️ **12 Regional Languages** | Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, Maithili + custom | 
| 📊 **Case Outcome Prediction** | Win/lose probability with AI (PyTorch neural network) | 
| 😊 **Sentiment Analysis** | Real-time distress/neutral/positive detection | 
| 📅 **Legal Timelines** | Step-by-step process timelines for every case type | 
| 📚 **IPC/CrPC Knowledge Base** | Searchable reference for all major Indian laws | 
| 📄 **12 Document Templates** | FIR, RTI, Notice, Consumer, Bail, Affidavit, PIL, Cheque Bounce, Divorce, Maintenance, Anticipatory Bail, Eviction Notice | 
| 🧠 **ML Training Panel** | Live BERT model training simulation with metrics | 
| 🔊 **Text-to-Speech** | Listen to AI responses in any language | 
| 🔑 **Legal Rights Cards** | Know-your-rights chips on every response | 
| ↗ **Share Feature** | Share legal advice via native share API | 
| 🖨️ **Print Documents** | Direct print support for generated documents | 
 
--- 
 
## 📁 Project Structure 
 
``` 
nyaymitra_v3/ 
├── nyaymitra-demo.html          ← ⭐ MAIN DEMO — Open this first! 
├── admin-dashboard/ 
│   └── index.html               ← Admin lawyer panel 
├── frontend/                    ← React app (full stack) 
│   ├── src/pages/ 
│   │   ├── LandingPage.js 
│   │   ├── ChatPage.js 
│   │   └── DocumentsPage.js 
│   └── src/components/ 
│       ├── ChatMessage.js 
│       ├── Sidebar.js 
│       ├── VoiceButton.js 
│       └── DocumentModal.js 
├── backend/                     ← FastAPI Python server 
│   ├── main.py                  ← App + WebSocket endpoints 
│   ├── routers/                 ← chat, documents, admin, auth 
│   ├── services/                ← ChatService, IPC, Urgency, RAG 
│   └── schema.sql               ← PostgreSQL schema 
├── models/ 
│   └── ml_pipeline.py           ← BERT + FAISS + PyTorch 
├── evaluation/ 
│   └── evaluate.py              ← BLEU, ROUGE, F1, WER 
├── datasets/ 
│   └── legal_queries.json       ← Training data 
├── docker-compose.yml 
└── start.sh 
``` 
 
--- 
 
## 🧠 Tech Stack 
 
| Layer | Technology | 
|-------|-----------| 
| Frontend | React 18, CSS Variables, Web Speech API | 
| Backend | FastAPI, WebSockets, Pydantic | 
| AI/ML | PyTorch, HuggingFace BERT, FAISS | 
| NLP | IPC/CrPC Tagger, Sentiment, RAG | 
| Database | PostgreSQL + Redis | 
| Deployment | Docker Compose, Nginx | 
 
--- 
 
## 📊 Model Performance 
 
| Metric | Score | 
|--------|-------| 
| Urgency BERT Accuracy | 83.2% | 
| IPC Tagger Precision@3 | 72.4% | 
| Document Classifier F1 | 81.0% | 
| Sentiment Accuracy | 78.5% | 
| RAG FAISS Precision@K | 74.1% | 
| BLEU (Doc Generation) | 0.38 | 
| ROUGE-L | 0.45 | 
| ASR WER | 0.08 | 
 
--- 
 
## ⚖️ Disclaimer 
 
NyayMitra provides AI-generated legal information for awareness purposes only. 
It is NOT a substitute for professional legal advice. 
Always consult a qualified lawyer for serious legal matters. 
 
--- 
 
*Made with ❤️ for India — न्याय अब सबके लिए* 
