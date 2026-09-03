# ⚖️ NyayMitra V3 — AI Legal Assistant for India

> AI-powered legal help in 12 Indian languages. Built for the people who need it most.

## 🚀 Quick Start

```bash
chmod +x start.sh
./start.sh
```

Then open:
- **App:** http://localhost:3000
- **Admin Dashboard:** Open `admin-dashboard/index.html` in your browser
- **API Docs:** http://localhost:8000/docs

---

## 🏗 Architecture

```
nyaymitra_v3/
├── backend/           ← FastAPI (Python)
│   ├── main.py        ← App entry, WebSocket endpoints
│   ├── routers/
│   │   ├── admin.py   ← Admin API (sessions, stats, reply, AI suggest)
│   │   ├── chat.py    ← Chat API
│   │   ├── auth.py    ← Auth
│   │   └── documents.py
│   ├── services/
│   │   ├── chat_service.py     ← AI response + session store
│   │   ├── ipc_service.py      ← IPC section tagging
│   │   └── urgency_service.py  ← Urgency classification
│   └── models/schemas.py
│
├── frontend/          ← React App (port 3000)
│   └── src/
│       ├── pages/ChatPage.js      ← Main chat + WebSocket
│       ├── components/ChatMessage.js ← Handles user/AI/admin/alert msgs
│       └── components/...
│
└── admin-dashboard/   ← Single-file Admin Panel
    └── index.html     ← Chart.js + live backend connection
```

---

## 🔗 Backend ↔ Admin ↔ Frontend Connection

### How it works:
1. **User chats** → React frontend → WebSocket `/ws/chat/{session_id}` → backend
2. **Backend stores** all sessions in `CHAT_SESSIONS` dict (chat_service.py)
3. **Admin dashboard** polls `/api/admin/sessions` to see real sessions
4. **Admin replies** → POST `/api/admin/reply` → backend pushes via WebSocket to user's session
5. **User sees** admin message appear in chat as a purple "👮 Legal Officer" bubble

### WebSocket endpoints:
- `ws://localhost:8000/ws/chat/{session_id}` — user chat
- `ws://localhost:8000/ws/admin/{admin_id}` — admin live updates

### Admin API endpoints:
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics + chart data |
| GET | `/api/admin/sessions` | All sessions (filterable by urgency/tag) |
| GET | `/api/admin/sessions/{id}/messages` | Full conversation |
| POST | `/api/admin/reply` | Send message to user (via WebSocket) |
| POST | `/api/admin/ai-suggest/{id}` | AI-generated reply suggestion |
| POST | `/api/admin/sessions/{id}/tag` | Tag + set urgency |
| POST | `/api/admin/sessions/{id}/resolve` | Mark resolved |
| POST | `/api/admin/sessions/{id}/escalate` | Escalate to senior lawyer |

---

## 📊 Admin Dashboard Features

- **Live stats** — active sessions, resolved today, urgent pending, total cases
- **5 Chart.js charts** — categories bar, urgency doughnut, weekly trend line, language doughnut, AI accuracy radar
- **Real session list** — from actual backend data (with demo fallback)
- **Full conversation view** — with IPC chips, urgency banners
- **Admin reply** — types message → backend pushes to user via WebSocket
- **AI Suggest** — calls backend to get context-aware reply suggestion
- **Session actions** — resolve, escalate, flag urgent, tag category
- **Auto-refresh** every 30 seconds

---

## ⚙️ Environment Setup

Copy `.env.example` to `.env` in `/backend/`:

```env
ANTHROPIC_API_KEY=your_key_here
DATABASE_URL=postgresql://user:pass@localhost/nyaymitra
SECRET_KEY=your-secret-key
```

---

## 🌐 Languages Supported

Hindi, Hinglish, English, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia

---

## 📄 Legal Topics Covered

FIR filing, Property disputes, Cyber crime, Domestic violence, RTI applications, Labour rights, Consumer complaints, Divorce/family law, Cheque bounce, IPC sections reference
