# PlacementPro – Production-Grade Engineering TODO

> **Build Cycle Target:** 3–5 months  
> **Author:** Karthik Acharya  
> **Stack:** React (Vite) · FastAPI · MongoDB Atlas · Firebase · n8n · LangChain · Pinecone · Gemini  
> **Legend:** `[MVP]` = Must ship in Phase 1 · `[P2]` = Phase 2 Enhancement · `[AI]` = AI/Advanced Feature

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Frontend Development](#2-frontend-development)
3. [Backend Development](#3-backend-development)
4. [Database Design](#4-database-design)
5. [Authentication & RBAC](#5-authentication--rbac)
6. [API Implementation](#6-api-implementation)
7. [AI & RAG Integration](#7-ai--rag-integration)
8. [Automation – n8n Workflows](#8-automation--n8n-workflows)
9. [DevOps & Deployment](#9-devops--deployment)
10. [Testing](#10-testing)
11. [Security & Validation](#11-security--validation)
12. [Performance Optimization](#12-performance-optimization)
13. [Documentation](#13-documentation)

---

## 1. Project Setup

### Epic 1.1 – Repository & Monorepo Initialization `[MVP]`

- [ ] Create GitHub repository `placementpro` with branch protection on `main` and `develop`
- [ ] Set up monorepo structure:
  ```
  /placementpro
    /frontend      # React (Vite)
    /backend       # FastAPI
    /n8n           # n8n workflow JSONs
    /docs          # API docs, architectural diagrams
    /infra         # Docker, Nginx, CI/CD configs
  ```
- [ ] Initialize `.gitignore` for Node, Python, and Docker artifacts
- [ ] Add `README.md` at root level with project overview, prerequisites, and local dev setup
- [ ] Create `CONTRIBUTING.md` with branch naming, commit message conventions, and PR template
- [ ] Set up GitHub Actions CI skeleton (runs on push to `develop`)

---

### Epic 1.2 – Frontend Scaffold `[MVP]`

- [ ] Initialize Vite + React project inside `/frontend`: `npm create vite@latest . -- --template react`
- [ ] Install and configure **Tailwind CSS** (v3): `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
- [ ] Configure `tailwind.config.js` with content paths covering all `src/**/*.{jsx,tsx}`
- [ ] Install **React Router v6**: `npm install react-router-dom`
- [ ] Install **Zustand** for state management: `npm install zustand`
- [ ] Install **Axios**: `npm install axios`
- [ ] Install **React Query (TanStack)**: `npm install @tanstack/react-query`
- [ ] Install **Firebase SDK**: `npm install firebase`
- [ ] Install **react-pdf** and/or **html2pdf.js**: `npm install @react-pdf/renderer html2pdf.js`
- [ ] Install **react-big-calendar**: `npm install react-big-calendar moment`
- [ ] Install **dnd-kit**: `npm install @dnd-kit/core @dnd-kit/sortable`
- [ ] Install **Recharts**: `npm install recharts`
- [ ] Install **react-hot-toast** for toast notifications: `npm install react-hot-toast`
- [ ] Install **react-hook-form** for form management: `npm install react-hook-form`
- [ ] Install **zod** for schema-level validation: `npm install zod @hookform/resolvers`
- [ ] Set up Vite `env` variables: create `.env`, `.env.example`, `.env.production`
- [ ] Create the full directory architecture:
  ```
  /src
    /assets
    /components
    /context
    /hooks
    /pages
      /auth
      /tpo
      /student
      /alumni
    /services
    /store
    /utils
  ```

---

### Epic 1.3 – Backend Scaffold `[MVP]`

- [ ] Initialize Python virtual environment inside `/backend`: `python -m venv venv`
- [ ] Create `requirements.txt` with pinned versions:
  - `fastapi`, `uvicorn[standard]`, `motor` (async MongoDB), `pymongo`
  - `firebase-admin`, `python-jose[cryptography]`
  - `python-dotenv`, `pydantic[email]`, `httpx`
  - `langchain`, `langchain-google-genai`, `pinecone-client`
  - `celery` (optional for background tasks), `redis`
  - `pytest`, `pytest-asyncio`, `httpx` (for test client)
- [ ] Set up **FastAPI app** entry point `main.py` with:
  - CORS middleware (restrict origins via `ALLOWED_ORIGINS` env var)
  - Exception handler middleware (global 500 catcher)
  - Health-check route `GET /health`
- [ ] Create `routers/` directory with module: `auth.py`, `drives.py`, `students.py`, `alumni.py`, `notifications.py`, `ai.py`
- [ ] Create `models/` directory with Pydantic schemas per collection
- [ ] Create `services/` directory for business logic separation
- [ ] Create `db/` directory with MongoDB client factory (`motor` async client)
- [ ] Create `core/` directory for `config.py` (env loading), `security.py` (JWT / Firebase verification), `dependencies.py` (FastAPI `Depends`)
- [ ] Create `.env`, `.env.example` with all required variables (see Epic 1.4)
- [ ] Configure **structured logging** using Python `logging` + JSON formatter

---

### Epic 1.4 – Environment Variable Planning `[MVP]`

- [ ] Define and document all environment variables in `.env.example`:

**Frontend (`.env`):**
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_URL=
VITE_API_BASE_URL=http://localhost:8000
```

**Backend (`.env`):**
```
MONGO_URI=mongodb+srv://...
MONGO_DB_NAME=placementpro
FIREBASE_SERVICE_ACCOUNT_JSON=
ALLOWED_ORIGINS=http://localhost:5173
N8N_WEBHOOK_URL=
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
GEMINI_API_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX_NAME=
SECRET_KEY=
LOG_LEVEL=INFO
```

- [ ] Add Secrets management plan (GitHub Secrets for CI, environment injection via Docker)

---

## 2. Frontend Development

### Epic 2.1 – Design System & Global Styles `[MVP]`

- [ ] Define **color palette** in `tailwind.config.js` extending Tailwind theme:
  - Primary: institution brand color (Sahyadri College)
  - Neutral grays, success green, danger red, warning amber
- [ ] Create global `index.css` with CSS variables for consistent theming
- [ ] Select and import Google Font (e.g., **Inter**) via `index.html`
- [ ] Create reusable component library under `/components`:
  - [ ] `Button.jsx` – variants: primary, secondary, danger, ghost; loading state spinner
  - [ ] `Input.jsx` – with label, error, helper text props
  - [ ] `Select.jsx` – single and multi-select support
  - [ ] `Modal.jsx` – overlay, close on Esc/outside click
  - [ ] `Toast.jsx` – wraps `react-hot-toast` with standard messages
  - [ ] `Spinner.jsx` – centered animated loader
  - [ ] `SkeletonCard.jsx` – shimmer animation for loading states
  - [ ] `Badge.jsx` – status badges (Applied, Selected, etc.)
  - [ ] `Card.jsx` – base card component with shadow and border
  - [ ] `Sidebar.jsx` / `Navbar.jsx` – role-aware navigation
  - [ ] `Avatar.jsx` – user profile avatar with initials fallback
  - [ ] `StepperProgress.jsx` – horizontal progress stepper for tracker
  - [ ] `EmptyState.jsx` – illustrated empty state for feeds/lists

---

### Epic 2.2 – Auth Pages `[MVP]`

> **Routes:** `/login`, `/register`, `/forgot-password`

- [ ] **Login Page** (`/pages/auth/Login.jsx`)
  - [ ] Email + Password form with `react-hook-form` + `zod` validation
  - [ ] Firebase `signInWithEmailAndPassword` integration
  - [ ] Google OAuth sign-in button (Firebase provider)
  - [ ] "Forgot Password?" link
  - [ ] Loading spinner on submit
  - [ ] Error toast on failed auth
  - [ ] Redirect to role-specific dashboard on success
- [ ] **Register Page** (`/pages/auth/Register.jsx`)
  - [ ] Fields: Full Name, Email, Password, Role selector (student / alumni)
  - [ ] Confirm Password field with match validation
  - [ ] `zod` schema validation
  - [ ] Firebase `createUserWithEmailAndPassword`
  - [ ] POST to `/auth/verify` after Firebase registration to create MongoDB user record
  - [ ] Error handling: duplicate email, weak password
- [ ] **Forgot Password Page** (`/pages/auth/ForgotPassword.jsx`)
  - [ ] Email input field
  - [ ] Firebase `sendPasswordResetEmail`
  - [ ] Success message toast
  - [ ] Back to login link

---

### Epic 2.3 – RBAC Routing Infrastructure `[MVP]`

- [ ] Create `AuthContext.jsx` in `/context`:
  - [ ] Firebase `onAuthStateChanged` listener
  - [ ] Store user object and JWT token in context
  - [ ] Fetch user role from MongoDB via `GET /auth/me` after Firebase auth
  - [ ] Expose `user`, `role`, `loading`, `logout` to all children
- [ ] Create `ProtectedRoute.jsx` component:
  - [ ] Takes `allowedRoles` prop
  - [ ] If unauthenticated → redirect to `/login`
  - [ ] If authenticated but wrong role → redirect to role's default route
  - [ ] Example: student accessing `/tpo/dashboard` → redirect to `/student/feed`
- [ ] Define all routes in `App.jsx` using React Router v6 `<Routes>`:
  - [ ] Public: `/login`, `/register`, `/forgot-password`
  - [ ] TPO: `/tpo/dashboard`, `/tpo/drives`, `/tpo/scheduler`, `/tpo/notifications`
  - [ ] Student: `/student/feed`, `/student/resume`, `/student/tracker`, `/student/skill-gap`
  - [ ] Alumni: `/alumni/jobs`, `/alumni/mentorship`
- [ ] Implement lazy loading with `React.lazy` + `Suspense` for all page-level components
- [ ] Create `useAuth` custom hook to consume `AuthContext`
- [ ] Create `useRole` hook to return current role string

---

### Epic 2.4 – Student Interface `[MVP]`

#### Resume Wizard (`/student/resume`)
- [ ] Multi-step form with 3 steps:
  - **Step 1:** Academic Details – Full Name, Branch, CGPA, Backlogs, Year of Passing
  - **Step 2:** Skills – Tag-style multi-input for skills array
  - **Step 3:** Projects – Dynamic add/remove fields (title, description, tech stack, link)
- [ ] Per-step `zod` validation before advancing
- [ ] Progress bar / step indicator at top
- [ ] "Back" and "Next" navigation buttons
- [ ] "Generate Profile" CTA on final step:
  - [ ] `PUT /api/students/profile` → save to backend
  - [ ] Trigger PDF generation client-side using `@react-pdf/renderer`
  - [ ] PDF Template: Sahyadri branded layout (college logo, color scheme, structured sections)
  - [ ] Auto-download generated PDF
  - [ ] Upload PDF to Firebase Storage → store URL in student profile
- [ ] Toast: "Resume Generated Successfully!" on completion
- [ ] Loading state during PDF generation and upload
- [ ] Error handling: failed upload, validation errors

#### Live Feed (`/student/feed`) `[MVP]`
- [ ] Fetch eligible drives via `GET /api/students/feed` on mount
- [ ] Skeleton loader during fetch
- [ ] Display drive cards with:
  - [ ] Company name, role, eligibility criteria displayed
  - [ ] "Apply" button per drive (POST `/api/applications`)
  - [ ] Applied state indicator (button disabled after apply)
- [ ] Empty state: "No eligible drives found" illustration
- [ ] Firebase Realtime Database listener for live feed updates (new drive added → feed refreshes without full reload)
- [ ] Error state with retry button

#### Application Tracker (`/student/tracker`) `[MVP]`
- [ ] Fetch all applications via `GET /api/students/tracker`
- [ ] Per-drive horizontal stepper with statuses: Applied → Aptitude → Cleared → Interview Scheduled → Selected
- [ ] Color-coded steps: completed (green), current (blue), pending (gray), rejected (red)
- [ ] Animated step transition
- [ ] Real-time status update via Firebase listener
- [ ] Empty state for no applications

#### Market Intelligence / Skill Gap View (`/student/skill-gap`) `[AI]`
- [ ] Target role selector (dropdown or searchable select)
- [ ] "Analyze" button → `GET /api/ai/skill-gap/{student_id}?target_role={role}`
- [ ] Loading skeleton during RAG pipeline execution
- [ ] Recharts **RadarChart** or **BarChart** comparing student skills vs market demand
- [ ] List of missing skills with recommended learning resources (Coursera, YouTube, etc.)
- [ ] Highlight top missing skill (e.g., PowerBI badge)
- [ ] Error handling for failed AI request

---

### Epic 2.5 – TPO Admin Interface `[MVP]`

#### TPO Dashboard (`/tpo/dashboard`)
- [ ] Summary cards: Total Students, Active Drives, Placements This Season, Open Slots
- [ ] Recent activity feed (last 5 drives created, recent applications)
- [ ] Quick actions: "Create Drive", "Send Notification"

#### Drive Manager (`/tpo/drives`) `[MVP]`
- [ ] "Create Drive" form:
  - [ ] Fields: Company Name, Role, Min CGPA (number input), Max Backlogs (number input), Eligible Branches (multi-select: CS, MCA, etc.), Drive Status (Active/Closed)
  - [ ] `zod` validation
  - [ ] `POST /api/drives` on submit
  - [ ] Toast: "Drive Created"
- [ ] List of all drives in a table/card grid
- [ ] Edit drive details `[P2]`
- [ ] Archive/close drive `[P2]`

#### Criteria Engine (`/tpo/drives` – inline or modal) `[MVP]`
- [ ] "Run Filter" button per drive → `POST /api/drives/{drive_id}/filter`
- [ ] Animated counter: "**X** Students Eligible" — updates instantly after response
- [ ] Display list of eligible student names (expandable panel)
- [ ] Loading spinner during query execution

#### Broadcast Module (`/tpo/notifications`) `[MVP]`
- [ ] Prominent "Notify All Eligible" CTA button
- [ ] Confirmation modal before sending: "Send email + SMS to X students?"
- [ ] `POST /api/notifications/broadcast` → triggers n8n webhook
- [ ] Loading state on button ("Sending...")
- [ ] Toast: "Notifications Dispatched!" on success
- [ ] Error handling: partial failure, n8n unreachable

#### Interview Scheduler (`/tpo/scheduler`) `[MVP]`
- [ ] `react-big-calendar` calendar component
- [ ] Sidebar: list of eligible student chips (draggable via `dnd-kit`)
- [ ] Drag student chip → drop on time slot → creates interview event
- [ ] Visual conflict detection: Red slot = overlap, Green slot = available
- [ ] Double-booking prevention (client-side + API validation)
- [ ] Persist schedule via `POST /api/scheduler/slots` `[P2]`
- [ ] Real-time updates: other TPO users see changes instantly `[P2]`
- [ ] Loading state: skeleton calendar during initial fetch

---

### Epic 2.6 – Alumni Interface `[MVP]`

#### Job Referral Board (`/alumni/jobs`)
- [ ] Feed of all posted referrals (company, role, referral notes, posted by, date)
- [ ] "Post a Job" button → opens modal:
  - [ ] Fields: Company, Role, Location, Job Link, Referral Notes
  - [ ] Zod validation
  - [ ] `POST /api/alumni/jobs`
  - [ ] Toast: "Job Posted"
- [ ] Student view: read-only feed of job referrals (no post button)
- [ ] Empty state for no referrals yet

#### Mentorship Scheduler (`/alumni/mentorship`)
- [ ] **Alumni View:**
  - [ ] Clickable calendar to block "Available Hours"
  - [ ] `POST /api/alumni/slots` to save availability
  - [ ] Display booked slots as distinct color
- [ ] **Student View:**
  - [ ] List or calendar of available alumni slots
  - [ ] "Book Mock Interview" button per slot
  - [ ] Confirmation modal
  - [ ] `POST /api/alumni/slots/{slot_id}/book`
  - [ ] Toast: "Slot Booked"
  - [ ] Prevent booking already-booked slots (disable button + badge: "Booked")

---

### Epic 2.7 – Global Components `[MVP]`

#### PlacementBot Widget
- [ ] Floating chat icon anchored to bottom-right on all authenticated pages
- [ ] Click to expand chat panel
- [ ] Chat history window (scrollable)
- [ ] Message input bar with send button + Enter key submit
- [ ] Typing indicator animation (three bouncing dots)
- [ ] Messages displayed: user (right-aligned) + bot (left-aligned) with avatars
- [ ] `POST /api/ai/chat` on message send
- [ ] Stream response support (SSE or WebSocket) `[P2]`
- [ ] Persist chat history in local state (clears on window close)
- [ ] Loading state between message send and response
- [ ] Error message display if API call fails

#### Responsive Layout `[MVP]`
- [ ] Implement Tailwind responsive breakpoints on all pages:
  - `sm:` (mobile), `md:` (tablet), `lg:` (desktop)
- [ ] Collapsible sidebar on mobile (hamburger menu)
- [ ] Stacked layout for cards on small screens
- [ ] Test on viewport widths: 375px, 768px, 1280px, 1440px

#### Feedback States (Global Requirement) `[MVP]`
- [ ] Every API call wrapped in try/catch with:
  - Loading state: `isLoading` flag → show spinner or skeleton
  - Success state: toast notification
  - Error state: toast error + inline error message where applicable
- [ ] Implement `retry` button for all failed read operations
- [ ] 404 page component
- [ ] Unauthorized (403) page component
- [ ] Generic error boundary component (catches runtime JS errors)

---

## 3. Backend Development

### Epic 3.1 – FastAPI Application Core `[MVP]`

- [ ] Configure CORS: `CORSMiddleware` with `allow_origins=ALLOWED_ORIGINS`, `allow_methods=["*"]`, `allow_headers=["*"]`, `allow_credentials=True`
- [ ] Configure global exception handlers:
  - [ ] `RequestValidationError` → 422 with field-level error details
  - [ ] `HTTPException` → standard JSON error body
  - [ ] Unhandled exceptions → 500 with reference ID for log tracing
- [ ] Set up structured JSON logging middleware (log request path, method, status code, duration)
- [ ] Set up `GET /health` endpoint returning service status + MongoDB connection health
- [ ] Enable FastAPI's built-in OpenAPI docs at `/docs` (disable in production via env flag)
- [ ] Configure `uvicorn` to run with `--workers 4` in production
- [ ] Implement request ID middleware (attach `X-Request-ID` header to every response)

---

### Epic 3.2 – Dependency Injection & Middleware `[MVP]`

- [ ] Create `get_db()` async dependency → yields motor `AsyncIOMotorDatabase` instance
- [ ] Create `get_current_user()` dependency:
  1. Extract Bearer token from `Authorization` header
  2. Verify Firebase JWT using `firebase-admin` SDK
  3. Fetch user document from MongoDB `users` collection
  4. Return user object with `role`, `firebase_uid`, `_id`
- [ ] Create `require_role(roles: list[str])` dependency factory for role-gating endpoints
- [ ] Create `rate_limiter` middleware (IP-based, using `slowapi`): default 100 req/min

---

### Epic 3.3 – Business Logic Services `[MVP]`

- [ ] `services/criteria_engine.py`:
  - [ ] `filter_eligible_students(drive_id)` → async MongoDB aggregation pipeline matching CGPA ≥ min_cgpa, backlogs ≤ max_backlogs, branch in eligible_branches
  - [ ] Return count + list of student IDs and names
- [ ] `services/notification_service.py`:
  - [ ] `broadcast_notification(student_ids, drive_info)` → POST to n8n webhook with payload `{students: [...], drive: {...}}`
  - [ ] Handle n8n timeout/error (retry once, then log + return partial success)
- [ ] `services/resume_service.py`:
  - [ ] `update_student_profile(student_id, profile_data)` → upsert student document in MongoDB
- [ ] `services/application_service.py`:
  - [ ] `apply_to_drive(student_id, drive_id)` → insert into `applications` with status "Applied"
  - [ ] `update_application_status(application_id, status)` → update status field
  - [ ] Prevent duplicate applications (check existing before insert)
- [ ] `services/alumni_service.py`:
  - [ ] `post_job_referral(alumni_id, job_data)` → insert into `job_referrals` collection
  - [ ] `create_mentorship_slot(alumni_id, slot_data)` → insert into `alumni_slots`
  - [ ] `book_slot(slot_id, student_id)` → set `is_booked=True`, `booked_by_student_id=student_id`; prevent double-booking with atomic findOneAndUpdate

---

## 4. Database Design

### Epic 4.1 – MongoDB Atlas Setup `[MVP]`

- [ ] Create MongoDB Atlas account and project
- [ ] Create M0 (free tier) cluster for development; plan M10 for production
- [ ] Create network access: allow backend server IP only (not 0.0.0.0/0)
- [ ] Create DB user with least-privilege role (`readWrite` on `placementpro` DB only)
- [ ] Securely store connection string in backend `.env`
- [ ] Enable MongoDB Atlas backups (daily snapshots for production)

---

### Epic 4.2 – Collection Schemas & Indexes `[MVP]`

#### `users` Collection
- [ ] Define Pydantic model `UserModel`:
  ```python
  _id: ObjectId
  firebase_uid: str  # unique
  email: EmailStr    # unique
  role: Literal["tpo", "student", "alumni"]
  created_at: datetime
  ```
- [ ] Create indexes: `firebase_uid` (unique), `email` (unique)

#### `students` Collection
- [ ] Define Pydantic model `StudentModel`:
  ```python
  _id: ObjectId
  user_id: ObjectId  # ref to users
  full_name: str
  branch: str
  year_of_passing: int
  academics: {cgpa: float, backlogs: int}
  skills: list[str]
  projects: list[{title, description, tech_stack, link}]
  resume_url: str | None
  ```
- [ ] Create indexes: `user_id` (unique), `academics.cgpa`, `branch`
- [ ] Compound index: `{branch: 1, "academics.cgpa": -1, "academics.backlogs": 1}` for Criteria Engine aggregation

#### `company_drives` Collection
- [ ] Define Pydantic model `DriveModel`:
  ```python
  _id: ObjectId
  tpo_id: ObjectId  # ref to users
  company_name: str
  role: str
  description: str | None
  eligibility_criteria: {min_cgpa: float, max_backlogs: int, branches: list[str]}
  status: Literal["Active", "Closed"]
  drive_date: datetime | None
  created_at: datetime
  ```
- [ ] Create indexes: `status`, `created_at`

#### `applications` Collection
- [ ] Define Pydantic model `ApplicationModel`:
  ```python
  _id: ObjectId
  student_id: ObjectId  # ref to students
  drive_id: ObjectId    # ref to company_drives
  status: Literal["Applied", "Aptitude", "Cleared", "Interview Scheduled", "Selected", "Rejected"]
  applied_on: datetime
  updated_at: datetime
  ```
- [ ] Create compound unique index: `{student_id: 1, drive_id: 1}` (prevent duplicate applications)
- [ ] Create indexes: `student_id`, `drive_id`, `status`

#### `alumni_slots` Collection
- [ ] Define Pydantic model `AlumniSlotModel`:
  ```python
  _id: ObjectId
  alumni_id: ObjectId  # ref to users
  start_time: datetime
  end_time: datetime
  is_booked: bool
  booked_by_student_id: ObjectId | None
  session_type: Literal["Mock Interview", "Career Guidance"]
  ```
- [ ] Create indexes: `alumni_id`, `is_booked`, `start_time`

#### `job_referrals` Collection `[MVP]`
- [ ] Define Pydantic model `JobReferralModel`:
  ```python
  _id: ObjectId
  alumni_id: ObjectId
  company: str
  role: str
  location: str | None
  job_link: str | None
  referral_notes: str | None
  posted_at: datetime
  ```
- [ ] Create index: `alumni_id`, `posted_at`

#### `notifications_log` Collection `[P2]`
- [ ] Track every broadcast dispatch: `drive_id`, `student_ids[]`, `channels[]`, `sent_at`, `status`

---

### Epic 4.3 – Schema Validation `[MVP]`

- [ ] All MongoDB inserts/updates go through Pydantic models (no raw dict inserts)
- [ ] Validate `cgpa` range: 0.0–10.0
- [ ] Validate `backlogs` is non-negative integer
- [ ] Validate `role` is always one of the three allowed values
- [ ] Validate `status` fields against allowed literal values
- [ ] Validate `email` with `pydantic[email]`
- [ ] Add `@validator` or `@field_validator` for:
  - Skills array: no empty strings, lowercase normalization
  - Project tech_stack: strip whitespace
  - Drive date cannot be in the past on creation

---

## 5. Authentication & RBAC

### Epic 5.1 – Firebase Auth Setup `[MVP]`

- [ ] Create Firebase project in Firebase Console
- [ ] Enable Authentication providers: Email/Password, Google
- [ ] Download `serviceAccountKey.json` and store securely (never commit to Git)
- [ ] Initialize Firebase Admin SDK in FastAPI:
  ```python
  import firebase_admin
  from firebase_admin import credentials, auth
  cred = credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"]))
  firebase_admin.initialize_app(cred)
  ```
- [ ] Initialize Firebase Client SDK in React (`/src/services/firebase.js`):
  - `initializeApp`, `getAuth`, `getDatabase` exports
- [ ] Configure Firebase Realtime Database rules (authenticated read only for feed/tracker)

---

### Epic 5.2 – JWT Token Flow `[MVP]`

- [ ] Frontend: attach Firebase `idToken` to every API request via Axios interceptor:
  ```js
  axiosInstance.interceptors.request.use(async (config) => {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  ```
- [ ] Handle token expiry: auto-refresh using Firebase `onIdTokenChanged`
- [ ] Backend: `auth.verify_id_token(token)` via `firebase-admin`
- [ ] Extract `uid` + lookup MongoDB for role after every request
- [ ] Return 401 `Unauthorized` if token invalid or expired
- [ ] Return 403 `Forbidden` if role not in allowed roles

---

### Epic 5.3 – Role-Based Authorization `[MVP]`

- [ ] Define middleware `require_role(["tpo"])` on all TPO endpoints
- [ ] Define middleware `require_role(["student"])` on all student endpoints
- [ ] Define middleware `require_role(["alumni"])` on all alumni endpoints
- [ ] `POST /api/drives` → TPO only
- [ ] `PUT /api/students/profile` → student only
- [ ] `POST /api/alumni/jobs` → alumni only
- [ ] `POST /api/alumni/slots/{slot_id}/book` → student only
- [ ] `POST /api/notifications/broadcast` → TPO only
- [ ] `POST /api/drives/{drive_id}/filter` → TPO only
- [ ] `GET /api/ai/skill-gap/{student_id}` → student and tpo

---

## 6. API Implementation

### Epic 6.1 – Auth Routes `[MVP]`

- [ ] `POST /auth/verify`
  - Input: Firebase ID token (from Authorization header)
  - Logic: Verify token → check if `users` collection has `firebase_uid` → if not, create user record → return `{role, user_id}`
  - Response: `{role: "student", user_id: "..."}`
- [ ] `GET /auth/me`
  - Protected: any authenticated user
  - Returns current user's MongoDB document (without sensitive fields)

---

### Epic 6.2 – TPO API Routes `[MVP]`

- [ ] `POST /api/drives`
  - Auth: TPO only
  - Body: `DriveCreateSchema` (company_name, role, eligibility_criteria, drive_date)
  - Logic: Validate → Insert into `company_drives` → return created document
  - Response: 201 Created
- [ ] `GET /api/drives`
  - Auth: Any authenticated user
  - Logic: Fetch all drives (filter by status for students)
  - Response: list of drives
- [ ] `GET /api/drives/{drive_id}`
  - Auth: Any authenticated user
  - Logic: Fetch single drive by ID
- [ ] `PATCH /api/drives/{drive_id}` `[P2]`
  - Auth: TPO only
  - Logic: Update drive fields
- [ ] `POST /api/drives/{drive_id}/filter`
  - Auth: TPO only
  - Logic: Run `criteria_engine.filter_eligible_students(drive_id)` → MongoDB aggregation
  - Response: `{eligible_count: int, students: [{id, name, branch, cgpa}]}`
- [ ] `POST /api/notifications/broadcast`
  - Auth: TPO only
  - Body: `{drive_id: str, student_ids: list[str]}`
  - Logic: Build payload → POST to n8n webhook → log result to `notifications_log`
  - Response: `{status: "dispatched", count: int}`

---

### Epic 6.3 – Student API Routes `[MVP]`

- [ ] `GET /api/students/{student_id}`
  - Auth: Student (own data) or TPO
  - Returns full student profile
- [ ] `PUT /api/students/profile`
  - Auth: Student only
  - Body: `StudentProfileUpdateSchema`
  - Logic: Upsert student document; if `resume_url` provided, update it
- [ ] `GET /api/students/feed`
  - Auth: Student only
  - Logic: Fetch student's own profile → run eligibility match against all Active drives → return matching drives
  - Response: list of eligible drives
- [ ] `GET /api/students/tracker`
  - Auth: Student only
  - Logic: Fetch all applications where `student_id = current_user._id`
  - Response: list of applications with drive info populated
- [ ] `POST /api/applications`
  - Auth: Student only
  - Body: `{drive_id: str}`
  - Logic: Check not already applied → Insert application with status "Applied"
- [ ] `PATCH /api/applications/{application_id}/status` `[MVP]`
  - Auth: TPO only
  - Body: `{status: "Aptitude" | "Cleared" | "Interview Scheduled" | "Selected" | "Rejected"}`
  - Logic: Update application status → trigger Firebase Realtime Database write for live update

---

### Epic 6.4 – Alumni API Routes `[MVP]`

- [ ] `POST /api/alumni/jobs`
  - Auth: Alumni only
  - Body: `JobReferralCreateSchema`
  - Logic: Insert into `job_referrals`
- [ ] `GET /api/alumni/jobs`
  - Auth: Any authenticated user
  - Response: list of job referrals (sorted by `posted_at` desc)
- [ ] `POST /api/alumni/slots`
  - Auth: Alumni only
  - Body: `{start_time, end_time, session_type}`
  - Logic: Create slot in `alumni_slots`, validate no time conflict for same alumni
- [ ] `GET /api/alumni/slots`
  - Auth: Any authenticated user
  - Response: list of all available (unbooked) slots
- [ ] `POST /api/alumni/slots/{slot_id}/book`
  - Auth: Student only
  - Logic: Atomic findOneAndUpdate to set `is_booked=True`, `booked_by_student_id` → return 409 if already booked

---

### Epic 6.5 – AI API Routes `[AI]`

- [ ] `POST /api/ai/chat`
  - Auth: Any authenticated user
  - Body: `{message: str, history: list[{role, content}]}`
  - Logic: Route to PlacementBot LangChain agent → return response
  - Response: `{reply: str}`
- [ ] `GET /api/ai/skill-gap/{student_id}`
  - Auth: Student (own) or TPO
  - Query param: `target_role=string`
  - Logic: Fetch student profile → RAG pipeline via Pinecone + Gemini → return analysis
  - Response: `{present_skills: [...], required_skills: [...], gap: [...], learning_path: [...]}`

---

### Epic 6.6 – Scheduler Routes `[P2]`

- [ ] `POST /api/scheduler/slots` – Create interview slot for student
- [ ] `GET /api/scheduler/slots` – Fetch all scheduled interviews
- [ ] `DELETE /api/scheduler/slots/{slot_id}` – Remove/cancel a slot

---

## 7. AI & RAG Integration

### Epic 7.1 – Pinecone Vector Store Setup `[AI]`

- [ ] Create Pinecone account and project
- [ ] Create index `placementpro-jd` with:
  - Dimension: 768 (matching Gemini embedding model output)
  - Metric: cosine
- [ ] Write ingestion script `scripts/ingest_job_descriptions.py`:
  - [ ] Load market job descriptions (curated corpus for Data Analyst, SDE, Product Manager, etc.)
  - [ ] Chunk each JD into sub-sections (requirements, responsibilities)
  - [ ] Generate embeddings using `GoogleGenerativeAIEmbeddings` (Gemini)
  - [ ] Upsert vectors into Pinecone with metadata: `{role, company_type, skill_mentioned}`
- [ ] Test ingestion: verify 50+ JDs indexed in Pinecone
- [ ] Schedule re-ingestion monthly for updated market data `[P2]`

---

### Epic 7.2 – Skill Gap RAG Pipeline `[AI]`

- [ ] Create `services/ai/skill_gap.py`:
  - [ ] `SkillGapAnalyzer` class:
    - [ ] `analyze(student_id: str, target_role: str) -> SkillGapResult`
    - [ ] Step 1: Fetch student skills from MongoDB
    - [ ] Step 2: Query Pinecone for top-K similar JDs for `target_role`
    - [ ] Step 3: Extract required skills from retrieved JD chunks
    - [ ] Step 4: Compute set difference: `required_skills - student_skills = gap`
    - [ ] Step 5: Call Gemini to generate structured learning path for each gap skill
    - [ ] Return: `{present, required, gap, learning_path}`
- [ ] Define `SkillGapResult` Pydantic model
- [ ] Add caching layer: cache result for `(student_id, target_role)` pair for 24 hours (Redis) `[P2]`
- [ ] Handle Gemini API errors gracefully (timeout → partial result)

---

### Epic 7.3 – PlacementBot (LangChain Agent) `[AI]`

- [ ] Create `services/ai/placement_bot.py`:
  - [ ] Initialize LangChain `ChatGoogleGenerativeAI` with Gemini model
  - [ ] Define custom tools (LangChain `Tool`):
    - [ ] `get_drive_info(company_name: str)` → queries MongoDB `company_drives`
    - [ ] `get_cutoff(drive_id: str)` → returns CGPA/backlog cutoffs
    - [ ] `get_interview_schedule(drive_id: str)` → returns scheduled interview slots
    - [ ] `get_faqs()` → returns static FAQ document from Pinecone or hardcoded YAML
  - [ ] Set up `AgentExecutor` with memory (conversation history per session)
  - [ ] System prompt: "You are PlacementBot, a helpful assistant for campus placement at Sahyadri College..."
  - [ ] Handle multi-turn conversation context
- [ ] `POST /api/ai/chat` route calls `PlacementBot.chat(message, history)`
- [ ] Define max token limit per response
- [ ] Mock interview support: if query contains "mock interview", switch to Q&A mode `[P2]`
- [ ] Tool call logging for debugging

---

### Epic 7.4 – Gemini Embeddings Integration `[AI]`

- [ ] Configure `GoogleGenerativeAIEmbeddings` with `GEMINI_API_KEY`
- [ ] Create embedding utility `utils/embeddings.py`:
  - [ ] `embed_text(text: str) -> list[float]`
  - [ ] Batch embedding support for ingestion scripts
- [ ] Handle API rate limits: exponential backoff retry (max 3 attempts)

---

## 8. Automation – n8n Workflows

### Epic 8.1 – n8n Setup `[MVP]`

- [ ] Deploy n8n locally via Docker: `docker run -d --name n8n -p 5678:5678 n8nio/n8n`
- [ ] For production: deploy n8n on dedicated VM or use n8n Cloud
- [ ] Secure n8n with basic auth or API key
- [ ] Export all workflow JSONs to `/n8n/` directory for version control

---

### Epic 8.2 – Email + SMS Notification Workflow `[MVP]`

- [ ] Create n8n workflow: **"Placement Drive Broadcast"**
  - [ ] Trigger: Webhook node (URL stored in `N8N_WEBHOOK_URL` env var)
  - [ ] Input: `{students: [{email, phone, name}], drive: {company, role, date}}`
  - [ ] Node 1: Loop over students
  - [ ] Node 2: **SendGrid Email** – Template: "Dear {{name}}, you are eligible for {{company}} {{role}} drive..."
  - [ ] Node 3: **Twilio SMS** – "PlacementPro: {{company}} drive on {{date}}. Check your dashboard."
  - [ ] Node 4: **HTTP Request** – POST to FastAPI `/api/notifications/log` to record dispatch
  - [ ] Error node: capture failed sends, log to n8n execution log
- [ ] Create SendGrid account and template
- [ ] Create Twilio account, verify sender phone number
- [ ] Test workflow with dummy payload
- [ ] Set up n8n execution history retention

---

### Epic 8.3 – In-App Notification Trigger `[P2]`

- [ ] Add Firebase Cloud Messaging (FCM) node in n8n
- [ ] Send in-app push notification to eligible students when drive is broadcast
- [ ] Display notification badge in frontend Navbar

---

### Epic 8.4 – Slot Booking Confirmation `[P2]`

- [ ] Create n8n workflow: **"Mentorship Slot Booked"**
  - [ ] Trigger: FastAPI calls webhook on slot booking
  - [ ] Send confirmation email to student and alumni
  - [ ] Send SMS reminder 1 hour before slot time

---

## 9. DevOps & Deployment

### Epic 9.1 – Docker Setup `[MVP]`

- [ ] Create `backend/Dockerfile`:
  ```dockerfile
  FROM python:3.11-slim
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  COPY . .
  CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
  ```
- [ ] Create `docker-compose.yml` for local development:
  - Services: `backend` (FastAPI), `mongo` (local dev only), `n8n`
  - Volumes for persistent data
  - `.env` file injection
- [ ] Create `.dockerignore` to exclude `venv/`, `__pycache__/`, `.env`
- [ ] Multi-stage build for production (builder + slim final stage) `[P2]`

---

### Epic 9.2 – Nginx Configuration `[MVP]`

- [ ] Create `infra/nginx/nginx.conf`:
  - [ ] Reverse proxy: `location /api/ → proxy_pass http://backend:8000`
  - [ ] SSL termination (Let's Encrypt via Certbot)
  - [ ] HTTP → HTTPS redirect
  - [ ] Hide internal server headers (`server_tokens off`)
  - [ ] Set rate limiting at Nginx level: `limit_req_zone`
  - [ ] Gzip compression for static assets
  - [ ] Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`

---

### Epic 9.3 – Frontend Deployment `[MVP]`

- [ ] Configure `vite.config.js` with production build settings
- [ ] Set up **Vercel** deployment:
  - [ ] Connect GitHub repository
  - [ ] Set environment variables in Vercel dashboard
  - [ ] Configure build command: `npm run build`, output dir: `dist`
  - [ ] Set up preview deployments on PR branches
- [ ] Alternative: Firebase Hosting deployment:
  - [ ] `firebase init hosting`
  - [ ] `firebase deploy --only hosting`
- [ ] Configure custom domain and SSL

---

### Epic 9.4 – Backend Deployment `[MVP]`

**Option A: AWS EC2**
- [ ] Launch Ubuntu 22.04 EC2 instance (t3.small minimum)
- [ ] Install Docker and Docker Compose
- [ ] Set up security group: allow 80, 443 only (backend port 8000 internal only)
- [ ] Clone repo, configure `.env`, run `docker-compose up -d`
- [ ] Set up systemd service to restart containers on reboot

**Option B: Google Cloud Run**
- [ ] Build Docker image and push to Google Artifact Registry
- [ ] Deploy to Cloud Run with `--min-instances=1` to avoid cold starts
- [ ] Configure environment variables via Cloud Run secrets

---

### Epic 9.5 – CI/CD Pipeline `[MVP]`

- [ ] Create `.github/workflows/backend-ci.yml`:
  - [ ] Trigger: push to `develop`, PR to `main`
  - [ ] Steps: checkout, Python setup, `pip install -r requirements.txt`, `pytest`
  - [ ] Linting: `ruff` or `flake8`
- [ ] Create `.github/workflows/frontend-ci.yml`:
  - [ ] Trigger: push to `develop`, PR to `main`
  - [ ] Steps: checkout, `npm ci`, `npm run build`, `npm run test`
  - [ ] Linting: ESLint
- [ ] Create `.github/workflows/deploy.yml`:
  - [ ] Trigger: push to `main`
  - [ ] Deploy frontend to Vercel
  - [ ] SSH to EC2 and run `docker-compose pull && docker-compose up -d` `[P2]`

---

### Epic 9.6 – Monitoring & Logging `[P2]`

- [ ] Integrate **Sentry** for error tracking (frontend + backend)
- [ ] Set up **Uptime Robot** for API health check monitoring
- [ ] Configure CloudWatch (AWS) or Cloud Logging (GCP) for backend logs
- [ ] Set up MongoDB Atlas performance advisor alerts (slow queries)
- [ ] Create Grafana + Prometheus dashboard for API metrics `[P2]`
- [ ] Configure alert: notify on error rate > 5% over 5 minutes

---

## 10. Testing

### Epic 10.1 – Backend Unit Tests `[MVP]`

- [ ] Set up `pytest` with `pytest-asyncio` and `httpx` test client
- [ ] Create `conftest.py` with async test MongoDB client and mock Firebase auth
- [ ] Test `criteria_engine.filter_eligible_students`:
  - [ ] Returns correct count for given CGPA/backlog/branch criteria
  - [ ] Returns empty list when no students match
  - [ ] Handles missing fields gracefully
- [ ] Test `application_service.apply_to_drive`:
  - [ ] Prevents duplicate application (idempotency)
  - [ ] Returns correct error on second apply
- [ ] Test `alumni_service.book_slot`:
  - [ ] Prevents double-booking (atomic operation)
  - [ ] Returns 409 on already-booked slot
- [ ] Test all Pydantic validators (invalid CGPA, negative backlogs, invalid role)
- [ ] Test auth dependency: invalid token → 401, missing token → 401, wrong role → 403

---

### Epic 10.2 – Backend Integration Tests `[MVP]`

- [ ] Test full flow: `POST /api/drives` → `POST /api/drives/{id}/filter` → `POST /api/notifications/broadcast`
- [ ] Test application lifecycle: apply → update status → check tracker
- [ ] Test alumni slot booking flow: create slot → book slot → verify booked state
- [ ] Test RBAC enforcement: each endpoint accessible only by correct role
- [ ] Test Firebase JWT verification with mock token

---

### Epic 10.3 – Frontend Unit Tests `[MVP]`

- [ ] Set up **Vitest** + **React Testing Library**
- [ ] Test `ProtectedRoute`: unauthorized access redirects correctly
- [ ] Test `AuthContext`: mock Firebase auth, verify role loading
- [ ] Test `Resume Wizard`: step navigation, validation errors, final submit
- [ ] Test `ApplicationTracker`: renders correct stepper state for each status
- [ ] Test `CriteriaEngineForm`: renders eligible count on API success, error on failure
- [ ] Test `PlacementBot`: message send, typing indicator, response render

---

### Epic 10.4 – E2E Tests `[P2]`

- [ ] Set up **Playwright** or **Cypress**
- [ ] E2E: Student registration → login → view feed → apply to drive → check tracker
- [ ] E2E: TPO login → create drive → run criteria filter → broadcast notification
- [ ] E2E: Alumni login → post job referral → student sees it in feed
- [ ] E2E: Alumni create mentorship slot → student books slot → slot marked booked
- [ ] E2E: PlacementBot conversation flow

---

### Epic 10.5 – AI Module Tests `[AI]`

- [ ] Mock Gemini and Pinecone responses for unit tests
- [ ] Test `SkillGapAnalyzer`: correct gap calculation from mocked vectors
- [ ] Test `PlacementBot`: correct tool selection for "cutoff" query
- [ ] Test embedding utility: handles empty input, API error gracefully
- [ ] Integration test: full skill gap pipeline with real Pinecone (staging environment)

---

## 11. Security & Validation

### Epic 11.1 – Input Validation (Missing Edge Cases) `[MVP]`

- [ ] Sanitize all string inputs: strip HTML tags to prevent XSS (use `bleach` on backend)
- [ ] Validate `ObjectId` format before MongoDB queries (return 400 on malformed ID)
- [ ] Limit array field size: `skills` max 50 items, `projects` max 20 items
- [ ] Enforce max string lengths: `company_name` ≤ 100 chars, `notes` ≤ 1000 chars
- [ ] Validate date ranges: `start_time < end_time` for slots
- [ ] Prevent negative CGPA or CGPA > 10.0 (Pydantic `Field(ge=0.0, le=10.0)`)
- [ ] Validate that drive `role` is non-empty and within reasonable length

---

### Epic 11.2 – API Security `[MVP]`

- [ ] **Rate Limiting:** Enforce via `slowapi` on FastAPI:
  - `/auth/verify`: 10 req/min per IP
  - `/api/ai/chat`: 20 req/min per user
  - All other endpoints: 100 req/min per user
- [ ] **CORS:** Restrict to frontend domain only in production
- [ ] **Helmet** equivalent: response headers via Nginx (see Epic 9.2)
- [ ] **SQL Injection N/A** (MongoDB), but validate all query parameters
- [ ] Prevent MongoDB operator injection: `query_params` must be plain strings, not `$` prefixed
- [ ] **Secret scanning:** Add `gitleaks` or `trufflehog` to CI pipeline to detect committed secrets
- [ ] Rotate Firebase service account key quarterly

---

### Epic 11.3 – Data Privacy `[MVP]`

- [ ] Exclude sensitive fields from API responses: never return `firebase_uid` in list endpoints
- [ ] Student data isolation: student can only access their own profile and applications
- [ ] Alumni can only modify their own slots and job posts
- [ ] TPO cannot view student resume URL (only metadata) unless explicitly granted `[P2]`
- [ ] Implement data deletion endpoint `DELETE /api/users/me` (right to erasure) `[P2]`

---

### Epic 11.4 – Firebase Security Rules `[MVP]`

- [ ] Firebase Realtime Database rules:
  ```json
  {
    "rules": {
      "feeds": {
        "$student_id": {
          ".read": "auth != null && auth.uid === $student_id",
          ".write": false
        }
      },
      "application_updates": {
        "$application_id": {
          ".read": "auth != null",
          ".write": false
        }
      }
    }
  }
  ```
- [ ] Firebase Storage rules: only authenticated users can read/write their own resume files

---

## 12. Performance Optimization

### Epic 12.1 – Backend Performance `[P2]`

- [ ] Add MongoDB indexes for all frequently queried fields (see Epic 4.2)
- [ ] Implement **cursor-based pagination** for all list endpoints (drives, jobs, applications)
- [ ] Add **Redis caching** for:
  - Student feed results (TTL: 60 seconds)
  - Skill gap analysis (TTL: 24 hours)
  - Eligible student list per drive (TTL: 5 minutes)
- [ ] Use `motor` async MongoDB driver throughout (no sync `pymongo` blocking calls)
- [ ] Add database connection pooling (`maxPoolSize=10`)
- [ ] Profile slow MongoDB queries using Explain plan

---

### Epic 12.2 – Frontend Performance `[P2]`

- [ ] Enable Vite code splitting (automatic via dynamic imports already added in Epic 2.3)
- [ ] Lazy-load Recharts and react-big-calendar (heavy deps) only on pages that need them
- [ ] Implement React Query data caching with appropriate `staleTime` and `cacheTime`
- [ ] Memoize expensive component renders with `React.memo` and `useMemo`
- [ ] Use `react-window` or `react-virtualized` for large drive/job lists `[P2]`
- [ ] Optimize images in `/assets` with WebP format
- [ ] Preload critical fonts in `index.html`

---

### Epic 12.3 – Network Performance `[MVP]`

- [ ] Enable Gzip compression in Nginx for API responses
- [ ] Set appropriate HTTP cache headers for static assets (`Cache-Control: max-age=31536000`)
- [ ] Use HTTP/2 in Nginx for multiplexed requests
- [ ] Keep-alive connections between Nginx and FastAPI upstream

---

## 13. Documentation

### Epic 13.1 – API Documentation `[MVP]`

- [ ] FastAPI auto-generates OpenAPI docs at `/docs` – verify all endpoints documented
- [ ] Add `summary`, `description`, and `response_model` to every route decorator
- [ ] Add request body examples using `model_config = ConfigDict(json_schema_extra={"example": {...}})`
- [ ] Export OpenAPI JSON and commit to `/docs/openapi.json`
- [ ] Create Postman collection from OpenAPI spec `[P2]`

---

### Epic 13.2 – Developer Documentation `[MVP]`

- [ ] **Frontend README:** dev setup, env vars, folder structure, component conventions
- [ ] **Backend README:** dev setup, env vars, running locally, running tests
- [ ] **Architecture Diagram:** C4 or sequence diagram showing client → FastAPI → MongoDB → n8n → Firebase flow
- [ ] **Database Schema Diagram:** ERD for MongoDB collections
- [ ] **AI Pipeline Documentation:** flow diagram for RAG and PlacementBot `[AI]`

---

### Epic 13.3 – Operational Runbooks `[P2]`

- [ ] **Deployment Runbook:** step-by-step production deployment guide
- [ ] **Incident Response Runbook:** steps for DB outage, n8n failure, Firebase Auth downtime
- [ ] **n8n Workflow Maintenance:** how to update email templates, add new notification channels
- [ ] **Pinecone Re-ingestion Guide:** how to update JD corpus and re-embed

---

## Phase Summary

### ✅ MVP (Months 1–2) – Core Platform
- Project setup, scaffolding, environment config
- Firebase Auth + RBAC middleware
- MongoDB Atlas + all 5 collections
- Student: Resume Wizard, Live Feed, Application Tracker
- TPO: Drive Manager, Criteria Engine, Broadcast Module, Interview Scheduler
- Alumni: Job Referral Board, Mentorship Scheduler
- All REST API endpoints
- n8n Email + SMS notification workflow
- Docker + Nginx + production deployment
- Unit + integration tests
- Security: rate limiting, CORS, input validation

### 🔄 Phase 2 (Months 3–4) – Enhancement Layer
- Application status update with Firebase live sync
- Slot booking reminder workflow (n8n)
- In-app notifications via FCM
- Pagination on all list endpoints
- Redis caching layer
- Scheduler slot persistence API
- Drive edit/archive
- CI/CD full pipeline automation
- Sentry monitoring
- E2E Playwright tests
- Data deletion (right to erasure)
- Postman collection

### 🤖 AI Advanced Features (Month 4–5) – Intelligence Layer
- Pinecone JD ingestion script
- Skill Gap RAG pipeline (Gemini + Pinecone)
- Market Intelligence UI (Recharts)
- PlacementBot LangChain agent (tools + memory)
- Mock interview Q&A mode in PlacementBot
- AI response caching (Redis)
- AI module tests
- Monthly re-ingestion scheduler

---

## Missing Edge Cases & Implied TODOs

- [ ] **Concurrent slot booking:** Two students booking same slot simultaneously → implement optimistic locking / atomic MongoDB operation
- [ ] **Drive date in the past:** Prevent creating drives with past dates; auto-close expired drives via cron job `[P2]`
- [ ] **Student with 0 skills:** Resume Wizard should warn if skills array is empty before PDF generation
- [ ] **CGPA update after application:** If student updates CGPA after applying, does eligibility re-evaluate? → Define policy and handle
- [ ] **TPO creating drives with no eligible students:** Engine returns 0 → disable "Notify" button with tooltip
- [ ] **Large file upload:** Resume PDF > 5MB → reject with clear error message
- [ ] **Alumni slot overlap:** Prevent alumni from creating two overlapping slots (server-side validation)
- [ ] **PlacementBot hallucination guard:** If Gemini returns confident wrong answer for drive data, tool result should override model
- [ ] **Firebase token rotation during long sessions:** Handle gracefully in Axios interceptor
- [ ] **n8n failure:** If n8n webhook times out, mark broadcast as "pending" and retry with exponential backoff
- [ ] **MongoDB connection drops:** Implement reconnection logic in `motor` client with health check endpoint
- [ ] **PDF generation failure:** If client-side PDF fails, fall back to server-side generation `[P2]`
- [ ] **Empty Pinecone results:** If no JDs match target role, return graceful message: "Insufficient market data for this role"
- [ ] **Student accessing deleted drive:** Application tracker should gracefully handle archived/deleted drive references
- [ ] **Account creation race condition:** Two registrations with same email → handle Firebase duplicate error gracefully
