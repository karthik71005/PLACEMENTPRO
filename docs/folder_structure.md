# PlacementPro — Complete Folder Structure

> Last updated: 2026-03-07

---

## Root

```
PLACEMENTPRO/
├── .github/                          # GitHub Actions CI/CD configuration
│   └── workflows/
│       ├── backend-ci.yml            # Backend lint & test pipeline
│       ├── frontend-ci.yml           # Frontend build & test pipeline
│       └── deploy-frontend.yml       # Vercel deployment pipeline
│
├── backend/                          # FastAPI Python backend
├── frontend/                         # React (Vite) frontend
├── docs/                             # Project documentation
├── infra/                            # Infrastructure config (Nginx)
├── n8n/                              # n8n workflow automation exports
│
├── docker-compose.yml                # Local multi-service orchestration
├── .gitignore                        # Root-level git ignore rules
├── README.md                         # Project overview & quick start
└── CONTRIBUTING.md                   # Contribution guidelines
```

---

## Backend (`backend/`)

```
backend/
├── core/                             # App-wide shared utilities
│   ├── __init__.py
│   ├── cache.py                      # In-memory / Redis caching helpers
│   ├── config.py                     # Pydantic settings & env loading
│   ├── dependencies.py               # FastAPI dependency injectors
│   └── security.py                   # JWT creation, password hashing
│
├── db/                               # Database layer
│   ├── __init__.py
│   └── client.py                     # SQLAlchemy / async DB client setup
│
├── models/                           # SQLAlchemy ORM models (tables)
│   ├── __init__.py
│   ├── alumni.py                     # Alumni profile model
│   ├── application.py                # Student-drive application model
│   ├── drive.py                      # Placement drive model
│   ├── notification.py               # Notification record model
│   ├── student.py                    # Student profile model
│   └── user.py                       # Base user / auth model
│
├── routers/                          # FastAPI route handlers (controllers)
│   ├── __init__.py
│   ├── ai.py                         # AI chat & analysis endpoints
│   ├── alumni.py                     # Alumni CRUD & mentor matching
│   ├── applications.py               # Application submit / status endpoints
│   ├── auth.py                       # Login, register, token refresh
│   ├── drives.py                     # Drive creation & management
│   ├── interviews.py                 # Interview scheduling endpoints
│   ├── notifications.py              # Notification dispatch endpoints
│   ├── students.py                   # Student profile & data endpoints
│   └── ai/                           # (Reserved) AI sub-router modules
│
├── services/                         # Business logic layer
│   ├── __init__.py
│   ├── alumni_service.py             # Alumni matching & mentorship logic
│   ├── application_service.py        # Application processing logic
│   ├── criteria_engine.py            # Eligibility criteria evaluation
│   ├── notification_service.py       # Email / WhatsApp notification logic
│   └── ai/                           # AI-specific service modules
│       ├── placement_bot.py          # Placement chatbot (LLM integration)
│       └── skill_gap.py              # Skill-gap analysis engine
│
├── scripts/                          # One-off utility scripts
│   └── ingest_job_descriptions.py    # Bulk JD ingestion into the DB
│
├── tests/                            # Pytest unit & integration tests
│   ├── test_application_service.py
│   ├── test_auth.py
│   └── test_criteria_engine.py
│
├── main.py                           # FastAPI app entry point & router registration
├── requirements.txt                  # Python dependencies
├── Dockerfile                        # Backend container definition
├── .dockerignore
├── .env                              # Local secrets (git-ignored)
├── .env.example                      # Environment variable template
├── cleanup.py                        # Dev helper: DB cleanup script
├── debug_api.py                      # Dev helper: ad-hoc API debugger
├── run_ingest.py                     # Runner for ingest_job_descriptions
└── README.md                         # Backend-specific setup guide
```

---

## Frontend (`frontend/`)

```
frontend/
├── public/                           # Static assets served at root
│
├── src/
│   ├── assets/                       # Images, fonts & static resources
│   │   └── logo.png
│   │
│   ├── components/                   # Reusable UI building blocks
│   │   ├── PlacementBot.jsx          # Floating AI chatbot widget
│   │   ├── ProtectedRoute.jsx        # Auth-guard HOC for private routes
│   │   │
│   │   ├── layout/                   # App shell components
│   │   │   ├── AppLayout.jsx         # Root layout wrapper (sidebar + outlet)
│   │   │   ├── Navbar.jsx            # Top navigation bar
│   │   │   └── Sidebar.jsx           # Role-aware collapsible sidebar
│   │   │
│   │   └── ui/                       # Primitive / design-system components
│   │       ├── Avatar.jsx
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── EmptyState.jsx
│   │       ├── ErrorBoundary.jsx
│   │       ├── ErrorPages.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── Select.jsx
│   │       ├── SkeletonCard.jsx
│   │       ├── Spinner.jsx
│   │       └── StepperProgress.jsx
│   │
│   ├── context/                      # React context providers
│   │   └── AuthContext.jsx           # Global auth state & Firebase session
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.js                # Auth state accessor hook
│   │   └── useRole.js                # Role-based permission hook
│   │
│   ├── pages/                        # Route-level page components
│   │   ├── Landing.jsx               # Public marketing / landing page
│   │   │
│   │   ├── auth/                     # Authentication flows
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ForgotPassword.jsx
│   │   │
│   │   ├── student/                  # Student portal pages
│   │   │   ├── Feed.jsx              # Placement drives feed & filters
│   │   │   ├── ResumeWizard.jsx      # Multi-step resume builder
│   │   │   ├── SkillGap.jsx          # AI-powered skill gap analyser
│   │   │   └── Tracker.jsx           # Application status tracker
│   │   │
│   │   ├── tpo/                      # TPO (Training & Placement Officer) portal
│   │   │   ├── Dashboard.jsx         # Overview metrics & KPIs
│   │   │   ├── DriveManager.jsx      # Create / manage placement drives
│   │   │   ├── Notifications.jsx     # Bulk notification centre
│   │   │   └── Scheduler.jsx         # Interview slot scheduler
│   │   │
│   │   └── alumni/                   # Alumni portal pages
│   │       ├── JobBoard.jsx          # External job postings board
│   │       └── Mentorship.jsx        # Mentorship connection hub
│   │
│   ├── services/                     # API & third-party service clients
│   │   ├── api.js                    # Axios instance + interceptors
│   │   └── firebase.js               # Firebase app initialisation
│   │
│   ├── utils/                        # Pure utility helpers
│   │   └── pdf/                      # PDF generation utilities (react-pdf)
│   │       ├── ResumePDF.jsx         # Resume PDF template
│   │       └── SkillGapPDF.jsx       # Skill-gap report PDF template
│   │
│   ├── App.jsx                       # Root component & React Router setup
│   ├── App.css                       # Global app-level styles
│   ├── main.jsx                      # Vite entry point & React root render
│   └── index.css                     # Base / reset CSS
│
├── index.html                        # Vite HTML shell
├── vite.config.js                    # Vite bundler configuration
├── tailwind.config.js                # Tailwind CSS theme & plugin config
├── postcss.config.js                 # PostCSS pipeline config
├── eslint.config.js                  # ESLint rules
├── package.json                      # NPM scripts & dependencies
├── .env                              # Local env vars (git-ignored)
├── .env.example                      # Environment variable template
└── README.md                         # Frontend-specific setup guide
```

---

## Infrastructure (`infra/`)

```
infra/
└── nginx/
    └── nginx.conf                    # Nginx reverse-proxy config
                                      # (routes /api → backend, / → frontend)
```

---

## n8n Automation (`n8n/`)

```
n8n/
└── Placement_Drive_Broadcast (1).json  # n8n workflow export: drive broadcast automation
```

---

## Documentation (`docs/`)

```
docs/
├── folder_structure.md               # ← This file
├── Architecture.md                   # System & component architecture
├── DatabaseSchema.md                 # ER diagram & table definitions
├── FDD.md                            # Feature Design Document
├── PRD.md                            # Product Requirements Document
├── SDD.md                            # Software Design Document
├── AI_Pipeline.md                    # AI/ML pipeline documentation
├── DeploymentRunbook.md              # Step-by-step deployment guide
├── LaunchGuide.md                    # Pre-launch checklist & go-live guide
├── SPRINTS.md                        # Sprint planning & history
├── TODO.md                           # Pending tasks & backlog
├── n8n_email_setup.md                # n8n email integration guide
└── openapi.json                      # OpenAPI spec (auto-generated)
```

---

## Key Entry Points

| Layer | File | Purpose |
|---|---|---|
| Backend API | `backend/main.py` | FastAPI app factory & router registration |
| Frontend App | `frontend/src/main.jsx` | Vite entry point |
| Frontend Routes | `frontend/src/App.jsx` | React Router route definitions |
| Auth Context | `frontend/src/context/AuthContext.jsx` | Global Firebase auth state |
| DB Client | `backend/db/client.py` | Database connection & session factory |
| Config/Env | `backend/core/config.py` | All env vars via Pydantic settings |
| CI/CD | `.github/workflows/` | GitHub Actions pipelines |
| Orchestration | `docker-compose.yml` | Local dev container orchestration |
