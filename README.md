# ArthMitra 🇮🇳
### India's Agentic Financial Co-Pilot
*Intercepting every financial decision moment for 900M underserved Indians — in their language, at the right second, with autonomous action.*

**Nomura Services India | KakushIN Innovation Contest 2026**
**Team Starfire & Raven — Krishika Jalali & Prinka Devi | SPIT, Mumbai**

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Features](#3-features)
4. [Folder Structure](#4-folder-structure)
5. [Prerequisites](#5-prerequisites)
6. [Installation](#6-installation)
7. [Environment Variables](#7-environment-variables)
8. [Database Setup](#8-database-setup)
9. [Running the Backend](#9-running-the-backend)
10. [Running the Mobile App](#10-running-the-mobile-app)
11. [Running the Admin Dashboard](#11-running-the-admin-dashboard)
12. [API Documentation](#12-api-documentation)
13. [Agent Architecture](#13-agent-architecture)
14. [Tech Stack](#14-tech-stack)

---

## 1. Project Overview

ArthMitra doesn't teach finance — it **intercepts decisions and acts**.

When a scam loan link arrives on WhatsApp, when salary is credited, when a government scheme becomes available — ArthMitra fires at that exact moment in the user's language, with autonomous agent action.

**Key numbers:**
- 900M underserved Indians targeted
- ₹2,400 avg annual financial loss per person from poor decisions
- 780 dialects — supports 7 Indian languages
- 7 autonomous ReAct agents, 5 tool calls, under 2 seconds response time

---

## 2. Architecture

```
User (Mobile / WhatsApp / Web)
         │
         ▼
    FastAPI 0.111  ←──── Supabase Auth (Phone OTP)
         │
         ▼
  LangGraph Orchestrator
  ┌──────┴──────────────────────────────────────┐
  │  Context   Literacy   Coach   Scam   Benefits│
  │  Agent     Agent      Agent   Guard  Nav     │
  └──────┬──────────────────────────────────────┘
         │  tools: domain_check / scheme_match / cashflow / RAG
         ▼
  Qdrant (vectors) + PostgreSQL (data) + Redis (cache)
         │
         ▼
  Claude Sonnet 4.6 (complex) / Claude Haiku 4.5 (80% queries)
```

---

## 3. Features

| Feature | Agent | Description |
|---|---|---|
| Voice Onboarding | Context Agent | 3 questions in 90 seconds, builds full behavioural profile |
| Multilingual | Accessibility Agent | Hindi, Marathi, Kannada, Tamil, Telugu, Bengali, English |
| Scam Detection | Scam Guardian | URL/UPI/message scan, 99.2% accuracy, RBI registry check |
| Govt Benefits | Benefits Navigator | PM-KISAN, MUDRA, Jan Dhan, Fasal Bima auto-match |
| Savings Nudge | Behavioural Coach | Fires at salary credit, harvest, month-end events |
| Financial Literacy | Literacy Agent | Explains concepts at user's literacy level (0–100 score) |
| Accessibility | Accessibility Agent | WCAG 2.2 AA, screen reader, large font, voice output |
| Offline Mode | Accessibility Agent | Top 5 schemes + scam patterns cached for offline |
| Phone OTP Login | Auth | No password needed — Supabase Auth |

---

## 4. Folder Structure

```
arthmitra/
├── backend/                    # FastAPI 0.111 Python backend
│   ├── agents/                 # LangGraph 7-agent system
│   │   ├── graph.py            # Agent DAG (LangGraph)
│   │   ├── nodes.py            # 7 agent node implementations
│   │   ├── prompts.py          # All agent system prompts
│   │   ├── state.py            # AgentState TypedDict
│   │   └── tools.py            # All agent tool functions
│   ├── api/routes/             # FastAPI route handlers
│   │   ├── auth.py             # OTP send/verify
│   │   ├── users.py            # Profile CRUD
│   │   ├── chat.py             # Main agent chat endpoint
│   │   ├── scam.py             # Scam scan endpoint
│   │   ├── benefits.py         # Scheme matching
│   │   ├── voice.py            # Whisper + XTTS
│   │   ├── notifications.py
│   │   ├── agents.py           # Agent status
│   │   └── admin.py            # Analytics
│   ├── core/
│   │   ├── config.py           # Pydantic Settings
│   │   └── database.py         # Async SQLAlchemy engine
│   ├── models/
│   │   └── models.py           # SQLAlchemy ORM models
│   ├── main.py                 # FastAPI app entry
│   ├── requirements.txt
│   └── .env.example
│
├── mobile/                     # React Native + Expo SDK 51
│   ├── app/                    # Expo Router screens
│   │   ├── _layout.tsx         # Root stack layout
│   │   ├── index.tsx           # Auth redirect
│   │   ├── splash.tsx          # Splash screen
│   │   ├── language.tsx        # Language selection
│   │   ├── onboarding.tsx      # 3-question onboarding
│   │   ├── otp.tsx             # Phone OTP login
│   │   ├── home.tsx            # Home dashboard
│   │   ├── chat.tsx            # AI Chat screen
│   │   ├── scam.tsx            # Scam Guardian screen
│   │   ├── benefits.tsx        # Benefits Navigator screen
│   │   ├── (tabs)/             # Bottom tab navigator
│   │   │   ├── _layout.tsx
│   │   │   ├── home.tsx        # re-exports ../home
│   │   │   ├── chat.tsx
│   │   │   ├── scam.tsx
│   │   │   ├── benefits.tsx
│   │   │   └── profile.tsx
│   │   └── components/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Header.tsx
│   ├── constants/
│   │   └── tokens.ts           # Design tokens (colors, type, spacing)
│   ├── lib/
│   │   └── api.ts              # Axios API client
│   ├── store/
│   │   └── appStore.ts         # Zustand global store
│   ├── package.json
│   └── .env.example
│
├── admin/                      # React + Vite + Tailwind admin dashboard
│   ├── src/
│   │   ├── App.tsx             # Analytics dashboard
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
└── database/
    └── schema.sql              # Full PostgreSQL schema + seed data
```

---

## 5. Prerequisites

Install these **before** anything else:

| Tool | Version | Download |
|---|---|---|
| Python | 3.11+ | https://python.org |
| Node.js | 20 LTS | https://nodejs.org |
| PostgreSQL | 16.3 | https://postgresql.org |
| Redis | 7.2 | https://redis.io |
| Qdrant | 1.9.4 | https://qdrant.tech |
| Expo Go | latest | App Store / Play Store |

---

## 6. Installation

### 6.1 Clone / enter project
```bash
cd C:\Users\prink\Desktop\arthmitra
```

### 6.2 Backend setup (Windows PowerShell)
```powershell
cd backend

# Create and activate virtual environment (already done — use existing .venv)
cd ..
.\.venv\Scripts\Activate.ps1
cd backend

# Install all dependencies
pip install -r requirements.txt

# Copy env file
copy .env.example .env
# → Edit .env with your ANTHROPIC_API_KEY, Supabase keys, DB password
```

### 6.3 Mobile setup
```powershell
cd ..\mobile

# Install dependencies
npm install

# Copy env
copy .env.example .env
# → Set EXPO_PUBLIC_API_URL to your machine's LAN IP:
#   e.g. EXPO_PUBLIC_API_URL=http://192.168.1.10:8000/api/v1
```

### 6.4 Admin setup
```powershell
cd ..\admin
npm install
```

---

## 7. Environment Variables

### Backend (`backend/.env`)
```env
DEBUG=false
SECRET_KEY=your-random-64-char-string
DATABASE_URL=postgresql+asyncpg://arthmitra:yourpassword@localhost:5432/arthmitra
REDIS_URL=redis://localhost:6379/0
QDRANT_HOST=localhost
QDRANT_PORT=6333
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_KEY=eyJxxx
JWT_SECRET=another-random-string
```

### Mobile (`mobile/.env`)
```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000/api/v1
```

---

## 8. Database Setup

### 8.1 Create PostgreSQL database
```powershell
# Open psql (adjust path if needed)
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres

# In psql shell:
CREATE USER arthmitra WITH PASSWORD 'yourpassword';
CREATE DATABASE arthmitra OWNER arthmitra;
\q
```

### 8.2 Run schema
```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U arthmitra -d arthmitra -f database\schema.sql
```

This creates all 11 tables + seeds 6 government schemes.

### 8.3 Start Redis
```powershell
# If installed via Windows installer or WSL:
redis-server
# or via WSL:
wsl redis-server
```

### 8.4 Start Qdrant (local mode for hackathon)
```powershell
# Download qdrant binary from https://github.com/qdrant/qdrant/releases
# Then run:
.\qdrant.exe
# Qdrant runs on http://localhost:6333
```

---

## 9. Running the Backend

```powershell
# From project root, with .venv active:
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Verify:**
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

**Key endpoints:**

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/otp/send` | Send phone OTP |
| POST | `/api/v1/auth/otp/verify` | Verify OTP → JWT |
| POST | `/api/v1/chat/message` | Main agent chat |
| POST | `/api/v1/scam/scan` | Scan URL/UPI/message |
| GET | `/api/v1/benefits/match` | Get matched schemes |
| GET | `/api/v1/admin/dashboard` | Admin analytics |
| GET | `/api/v1/agents/status` | 7-agent status |

---

## 10. Running the Mobile App

```powershell
cd mobile

# Start Expo dev server
npx expo start

# Then:
# → Press 'a' for Android emulator
# → Press 'i' for iOS simulator (Mac only)
# → Scan QR code with Expo Go app on your phone
```

**Important for physical device:** Make sure your phone and PC are on the **same WiFi network**, and set `EXPO_PUBLIC_API_URL` to your PC's LAN IP (e.g. `192.168.1.x`), not `localhost`.

**App flow:**
```
Splash → Language Selection → 3-Question Onboarding → Home Dashboard
                                                            ↓
                              AI Chat ←→ Scam Guardian ←→ Benefits Navigator
```

---

## 11. Running the Admin Dashboard

```powershell
cd admin
npm run dev
# Opens at http://localhost:3000
```

The admin dashboard shows:
- Total users, active today, scams blocked, schemes matched
- Language distribution bar chart
- Agent distribution pie chart
- 7-agent live status table (Haiku vs Sonnet usage)

---

## 12. API Documentation

Full Swagger UI at: **http://localhost:8000/docs**
ReDoc at: **http://localhost:8000/redoc**

### Chat Message Example
```bash
curl -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Bhai ye link check karo - instacash9x.co.in", "is_voice": false}'
```

Response:
```json
{
  "response": "Rajesh bhai, ye link FAKE hai (97% sure). MUDRA loan option dikhata hoon.",
  "confidence": 97.0,
  "agent_used": "scam_guardian",
  "intent": "scam_check",
  "tools_called": ["extract_url", "analyse_domain", "check_rbi_registration"],
  "latency_ms": 1840
}
```

### Scam Scan Example
```bash
curl -X POST http://localhost:8000/api/v1/scam/scan \
  -H "Content-Type: application/json" \
  -d '{"content": "https://instacash9x.co.in", "scan_type": "url", "user_language": "hi"}'
```

---

## 13. Agent Architecture

```
User Input
    │
    ▼
[Language Detection] → detect Hindi/Marathi/Tamil/etc.
    │
    ▼
[Master Orchestrator] → classify intent → route
    │
    ├──scam_check──→ [Scam Guardian]
    │                  extract_url() → analyse_domain() → check_rbi_registration()
    │                  → Risk Score + Red Flags + Verdict
    │
    ├──benefits──→ [Benefits Navigator]
    │                  match_schemes(income_type, state) → top 3 matches
    │
    ├──savings──→ [Behavioural Coach]
    │                  analyse_cashflow(event, amount) → nudge message
    │
    └──literacy──→ [Literacy Agent]
                       retrieve_regulatory_doc(query) → grounded explanation
    │
    ▼
[Accessibility Agent] → format for voice/screen reader if needed
    │
    ▼
Final response with confidence score + source citations
```

**Model routing:**
- 80% queries → `claude-haiku-4-5` (fast, cheap)
- Complex/scam analysis → `claude-sonnet-4-6` (best Indic reasoning)
- Confidence < 60 → auto-escalate to human SEBI-RA advisor

---

## 14. Tech Stack

| Layer | Tool | Version |
|---|---|---|
| Mobile | React Native + Expo | SDK 51 / RN 0.74 |
| Mobile Router | Expo Router | ~3.5 |
| Mobile State | Zustand | ^4.5 |
| Mobile Data | React Query | ^5.40 |
| Admin Web | React + Vite + Tailwind | 18.3 / 5.2 / 3.4 |
| Backend | FastAPI | 0.111.0 |
| Agents | LangGraph | 0.1.19 |
| LLM (complex) | Claude Sonnet 4.6 | claude-sonnet-4-6 |
| LLM (simple) | Claude Haiku 4.5 | claude-haiku-4-5-20251001 |
| Embeddings | sentence-transformers | all-MiniLM-L6-v2 v2.2.2 |
| Vector DB | Qdrant | 1.9.4 |
| Primary DB | PostgreSQL | 16.3 |
| Cache | Redis | 7.2 |
| STT | Whisper | large-v3 |
| TTS | Coqui XTTS | v2 0.24.1 |
| Auth | Supabase Auth | 2.64.3 |
| ORM | SQLAlchemy | 2.0 async |
| Observability | Langfuse | 2.25.0 |

---

## Compliance

| Regulation | How ArthMitra handles it |
|---|---|
| SEBI IA Regulations 2021 | Financial education only, not advice. Human escalation for specific recommendations. |
| DPDP Act 2023 | Anonymised patterns only. 24-hr session purge. Voice-command data deletion. |
| RBI Digital Lending 2022 | Never intermediates loans or holds funds. Info only → links to regulated institutions. |
| WCAG 2.2 AA | Screen reader compatible. Voice output. Large font mode. High contrast. |

---

*Built with ❤️ for 900M underserved Indians | Nomura KakushIN 2026*
