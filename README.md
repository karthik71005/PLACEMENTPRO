# PlacementPro 🎓

> An integrated campus career suite — the central brain for college placement activities.

Built with **React · FastAPI · MongoDB Atlas · Firebase · n8n · LangChain · Pinecone · Gemini**

---

## Architecture Overview

```
/placementpro
  /frontend      → React (Vite) + Tailwind CSS
  /backend       → FastAPI (Python)
  /n8n           → Workflow automation JSON exports
  /infra         → Nginx config, Docker helpers
  /docs          → PRD, SDD, FDD, TODO, SPRINTS
```

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| Python | 3.11+ |
| Docker & Docker Compose | Latest |
| MongoDB Atlas | Free M0 cluster |
| Firebase Project | With Auth enabled |

---

## Local Development Setup

### 1 — Clone & configure environment

```bash
git clone https://github.com/<your-org>/placementpro.git
cd placementpro

# Backend env
cp backend/.env.example backend/.env
# → Fill in MONGO_URI, FIREBASE_SERVICE_ACCOUNT_JSON, etc.

# Frontend env
cp frontend/.env.example frontend/.env
# → Fill in VITE_FIREBASE_* and VITE_API_BASE_URL
```

### 2 — Start backend + MongoDB + n8n via Docker

```bash
docker-compose up --build
```

- FastAPI → `http://localhost:8000`
- API Docs → `http://localhost:8000/docs`
- n8n → `http://localhost:5678`

### 3 — Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend → `http://localhost:5173`

### 4 — Verify health

```bash
curl http://localhost:8000/health
# → {"status":"ok","database":"connected"}
```

---

## User Roles

| Role | Default Route | Description |
|------|--------------|-------------|
| `tpo` | `/tpo/dashboard` | Placement Officer — manages drives, notifications, scheduler |
| `student` | `/student/feed` | Student — resume wizard, live feed, application tracker |
| `alumni` | `/alumni/jobs` | Alumni — job referrals, mentorship slots |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, React Query |
| Backend | FastAPI, Uvicorn, Motor (async MongoDB) |
| Database | MongoDB Atlas |
| Auth | Firebase Authentication (JWT) |
| Automation | n8n (email/SMS workflows) |
| AI | LangChain, Gemini, Pinecone |
| Deployment | Vercel (frontend),/ Railway (backend)|

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — protected, merge via PR only |
| `develop` | Integration branch — CI runs on every push |
| `feature/*` | Individual features |
| `fix/*` | Bug fixes |

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full conventions.
