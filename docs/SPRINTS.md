# PlacementPro – Structured Sprint Plan

> **Total Duration:** 12 Weeks (6 × 2-Week Sprints)  
> **Methodology:** Agile / Scrum  
> **Stack:** React (Vite) · FastAPI · MongoDB Atlas · Firebase · n8n · LangChain · Pinecone · Gemini  
> **Tags:** `[BE]` Backend · `[FE]` Frontend · `[DB]` Database · `[INFRA]` Infrastructure · `[AI]` AI/ML

---

## Sprint 1 – Foundation & Infrastructure

**Duration:** Weeks 1–2  
**Sprint Goal:** Establish a fully functional, runnable development environment for both frontend and backend with working authentication end-to-end.

---

### Features Covered

- Monorepo & repository structure
- Backend scaffold (FastAPI)
- Frontend scaffold (React + Vite + Tailwind)
- MongoDB Atlas provisioning
- Firebase Authentication setup
- JWT verification middleware
- Environment variable configuration
- Docker local dev setup
- Health check endpoint

---

### Detailed Task Breakdown

#### Infrastructure & Repository `[INFRA]`
- [ ] Create GitHub repository with `main` and `develop` branch protection rules
- [ ] Initialize monorepo structure: `/frontend`, `/backend`, `/n8n`, `/docs`, `/infra`
- [ ] Add root-level `.gitignore` (Node, Python, Docker artifacts)
- [ ] Add root `README.md` with project overview and local setup guide
- [ ] Add `CONTRIBUTING.md` with branch naming and commit conventions
- [ ] Create `docker-compose.yml` with services: `backend`, `mongo` (local), `n8n`
- [ ] Create `backend/Dockerfile` (Python 3.11-slim base)
- [ ] Create `.dockerignore`
- [ ] Create `infra/nginx/nginx.conf` skeleton (reverse proxy, SSL placeholders)

#### Backend Scaffold `[BE]`
- [ ] Initialize Python virtual environment, create `requirements.txt` with pinned versions
- [ ] Create `main.py` with FastAPI app, CORS middleware, global exception handlers
- [ ] Implement `GET /health` endpoint returning service status + DB connection state
- [ ] Create directory structure: `routers/`, `models/`, `services/`, `db/`, `core/`
- [ ] Create `core/config.py` for Pydantic `BaseSettings` env loading
- [ ] Create `db/client.py` with motor async MongoDB client factory
- [ ] Configure structured JSON logging middleware (path, method, status, duration, request-ID)
- [ ] Create `core/security.py` with Firebase Admin SDK initialization
- [ ] Create `get_current_user()` FastAPI dependency:
  - Extract Bearer token from `Authorization` header
  - Verify via `firebase-admin` `auth.verify_id_token()`
  - Fetch user document from MongoDB `users` collection
  - Return user object with `role`, `firebase_uid`, `_id`
- [ ] Create `require_role(roles)` dependency factory for role-gating
- [ ] Implement `POST /auth/verify` endpoint:
  - Verify Firebase token
  - Upsert user record in MongoDB `users` collection with role
  - Return `{role, user_id}`
- [ ] Implement `GET /auth/me` endpoint (returns current user's MongoDB document)

#### Database Provisioning `[DB]`
- [ ] Create MongoDB Atlas account, project, and M0 cluster
- [ ] Configure network access (allow only backend IP)
- [ ] Create DB user with `readWrite` only on `placementpro` database
- [ ] Store connection string in backend `.env`
- [ ] Enable daily Atlas backups for production cluster
- [ ] Define and create `users` collection with Pydantic model:
  - `_id`, `firebase_uid`, `email`, `role`, `created_at`
- [ ] Create indexes on `users`: `firebase_uid` (unique), `email` (unique)

#### Firebase Setup `[INFRA]`
- [ ] Create Firebase project in Firebase Console
- [ ] Enable Email/Password and Google auth providers
- [ ] Download `serviceAccountKey.json` (store in secrets, never commit)
- [ ] Initialize Firebase Client SDK in `/frontend/src/services/firebase.js`
  - Export `auth`, `database` instances
- [ ] Configure Firebase Realtime Database (base rules: authenticated read only)

#### Frontend Scaffold `[FE]`
- [ ] Initialize Vite + React project inside `/frontend`
- [ ] Install and configure Tailwind CSS v3
- [ ] Configure `tailwind.config.js` with content paths
- [ ] Install all core dependencies:
  - `react-router-dom`, `zustand`, `axios`, `@tanstack/react-query`
  - `firebase`, `react-hot-toast`, `react-hook-form`, `zod`, `@hookform/resolvers`
- [ ] Create full `/src` directory architecture (assets, components, context, hooks, pages, services, store, utils)
- [ ] Create `.env`, `.env.example` with all required `VITE_` variables
- [ ] Define Tailwind theme extension: brand color palette, neutral grays, status colors
- [ ] Import Google Font (Inter) in `index.html`
- [ ] Create `AuthContext.jsx`:
  - Firebase `onAuthStateChanged` listener
  - Fetch role from `GET /auth/me` after auth
  - Expose `user`, `role`, `loading`, `logout`
- [ ] Create `useAuth` custom hook
- [ ] Configure Axios instance in `/services/api.js`:
  - Base URL from `VITE_API_BASE_URL`
  - Request interceptor: attach Firebase `idToken` as Bearer token
  - Handle token auto-refresh via `onIdTokenChanged`

#### Environment Variable Planning `[INFRA]`
- [ ] Define and document all variables in frontend `.env.example` (8 `VITE_` vars)
- [ ] Define and document all variables in backend `.env.example` (14 vars covering Mongo, Firebase, n8n, SendGrid, Twilio, Gemini, Pinecone)
- [ ] Add secrets management plan in `CONTRIBUTING.md`

---

### Dependencies

- MongoDB Atlas cluster must be provisioned before backend can start
- Firebase project must exist before `firebase-admin` SDK can initialize
- Backend `.env` must be complete before running `docker-compose up`
- Frontend `.env` must be complete before starting Vite dev server

---

### Definition of Done

- [ ] `docker-compose up` starts backend, MongoDB, and n8n without errors
- [ ] `GET /health` returns `200 OK` with MongoDB connection status `"connected"`
- [ ] Firebase `auth.verify_id_token()` correctly validates a real Firebase token
- [ ] `POST /auth/verify` creates a user document in MongoDB and returns role
- [ ] `GET /auth/me` returns correct user data when valid Bearer token is provided
- [ ] Unauthorized request to `GET /auth/me` returns `401`
- [ ] Frontend Vite dev server starts without errors; Tailwind styles render
- [ ] Axios interceptor correctly attaches Firebase token to every request
- [ ] All env variables documented in `.env.example` files

---

### Expected Outcome

A runnable fullstack skeleton where a user can authenticate via Firebase, have their role stored in MongoDB, and have that JWT verified by FastAPI. No product screens exist yet — infrastructure only.

---
---

## Sprint 2 – Core Placement Engine

**Duration:** Weeks 3–4  
**Sprint Goal:** Deliver the complete TPO drive management workflow and a working student profile + live feed — the primary value loop of the platform.

---

### Features Covered

- MongoDB collections: `students`, `company_drives`, `applications`
- Student profile (Resume Wizard save flow)
- TPO: Create Drive, Criteria Engine filter
- Student: Eligibility-filtered Live Feed
- Student: Apply to Drive
- Application Tracker read view
- RBAC enforcement on all new endpoints
- Reusable UI component library foundation

---

### Detailed Task Breakdown

#### Database Schema `[DB]`
- [ ] Define and create `students` collection with Pydantic model:
  - `_id`, `user_id`, `full_name`, `branch`, `year_of_passing`, `academics` (`cgpa`, `backlogs`), `skills[]`, `projects[]`, `resume_url`
- [ ] Create indexes on `students`: `user_id` (unique), `academics.cgpa`, `branch`
- [ ] Create compound index: `{branch: 1, "academics.cgpa": -1, "academics.backlogs": 1}` for Criteria Engine
- [ ] Define and create `company_drives` collection with Pydantic model:
  - `_id`, `tpo_id`, `company_name`, `role`, `description`, `eligibility_criteria` (`min_cgpa`, `max_backlogs`, `branches[]`), `status`, `drive_date`, `created_at`
- [ ] Create indexes on `company_drives`: `status`, `created_at`
- [ ] Define and create `applications` collection with Pydantic model:
  - `_id`, `student_id`, `drive_id`, `status`, `applied_on`, `updated_at`
- [ ] Create compound unique index: `{student_id: 1, drive_id: 1}` (prevent duplicate applications)
- [ ] Create indexes on `applications`: `student_id`, `drive_id`, `status`

#### Schema Validation `[BE]`
- [ ] Add Pydantic `Field` validators: `cgpa` range 0.0–10.0, `backlogs` non-negative integer
- [ ] Validate `role` is one of `["tpo", "student", "alumni"]`
- [ ] Validate `status` fields against allowed Literal values
- [ ] Validate `email` with `pydantic[email]`
- [ ] Validate `ObjectId` format before all MongoDB queries (return 400 on malformed ID)
- [ ] Skills array: max 50 items, no empty strings, lowercase normalization
- [ ] Projects array: max 20 items, strip whitespace from all string fields
- [ ] Drive date: cannot be in the past on creation

#### Backend — Student Service & Routes `[BE]`
- [ ] Create `services/application_service.py`:
  - `apply_to_drive(student_id, drive_id)` — check duplicate → insert application with status "Applied"
  - `update_application_status(application_id, status)` — update status field + `updated_at`
- [ ] Implement `PUT /api/students/profile` (student only):
  - Body: full student profile update schema
  - Logic: upsert student document in MongoDB
- [ ] Implement `GET /api/students/{student_id}` (student own or TPO):
  - Return full student profile
- [ ] Implement `GET /api/students/feed` (student only):
  - Fetch calling student's profile
  - Match all active drives where student meets all eligibility criteria
  - Return list of matching drives
- [ ] Implement `GET /api/students/tracker` (student only):
  - Fetch all applications for calling student
  - Populate drive info in response
- [ ] Implement `POST /api/applications` (student only):
  - Check not already applied (return 409 if duplicate)
  - Insert application with status "Applied"
- [ ] Apply `require_role(["student"])` to all student routes

#### Backend — TPO Drive & Criteria Engine `[BE]`
- [ ] Create `services/criteria_engine.py`:
  - `filter_eligible_students(drive_id)` — async MongoDB aggregation matching CGPA, backlogs, branch
  - Return `{eligible_count: int, students: [{id, name, branch, cgpa}]}`
- [ ] Implement `POST /api/drives` (TPO only):
  - Validate body via `DriveCreateSchema`
  - Insert into `company_drives`, return 201
- [ ] Implement `GET /api/drives` (any authenticated user):
  - Students: filter by `status: "Active"` only
  - TPO: return all drives
- [ ] Implement `GET /api/drives/{drive_id}` (any authenticated user)
- [ ] Implement `POST /api/drives/{drive_id}/filter` (TPO only):
  - Run Criteria Engine aggregation
  - Return eligible count + student list
- [ ] Apply `require_role(["tpo"])` to all TPO routes

#### Frontend — Reusable Component Library `[FE]`
- [ ] `Button.jsx` — variants: primary, secondary, danger, ghost; loading spinner state
- [ ] `Input.jsx` — label, error message, helper text props
- [ ] `Select.jsx` — single-select and multi-select support
- [ ] `Modal.jsx` — overlay, close on Esc key and outside click
- [ ] `Spinner.jsx` — centered animated loader
- [ ] `SkeletonCard.jsx` — shimmer animation for loading states
- [ ] `Badge.jsx` — status color badges (Applied, Selected, Rejected, etc.)
- [ ] `Card.jsx` — base card with shadow and border
- [ ] `Navbar.jsx` / `Sidebar.jsx` — role-aware navigation links
- [ ] `EmptyState.jsx` — illustrated empty state for feeds and lists
- [ ] `StepperProgress.jsx` — horizontal progress stepper component
- [ ] `ErrorBoundary.jsx` — catches runtime JS errors, renders fallback UI
- [ ] `404Page.jsx` — not found page
- [ ] `403Page.jsx` — unauthorized access page

#### Frontend — RBAC Routing Infrastructure `[FE]`
- [ ] Create `ProtectedRoute.jsx`:
  - If unauthenticated → redirect to `/login`
  - If wrong role → redirect to role's default route
- [ ] Define all routes in `App.jsx` using React Router v6 `<Routes>`
- [ ] Implement lazy loading with `React.lazy` + `Suspense` for all page-level components
- [ ] Create `useRole` hook

#### Frontend — Auth Pages `[FE]`
- [ ] **Login Page** (`/login`):
  - Email + Password form with `react-hook-form` + `zod`
  - Firebase `signInWithEmailAndPassword`
  - Google OAuth button
  - Error toast on failure; spinner on submit
  - Redirect to role-specific dashboard on success
- [ ] **Register Page** (`/register`):
  - Fields: Full Name, Email, Password, Confirm Password, Role selector
  - Firebase `createUserWithEmailAndPassword`
  - POST to `POST /auth/verify` after registration
  - Duplicate email and weak password error handling
- [ ] **Forgot Password Page** (`/forgot-password`):
  - Firebase `sendPasswordResetEmail`
  - Success message toast

#### Frontend — Student Pages `[FE]`
- [ ] **Resume Wizard** (`/student/resume`):
  - Step 1: Academic Details (Full Name, Branch, CGPA, Backlogs, Year of Passing)
  - Step 2: Skills (tag-style multi-input)
  - Step 3: Projects (dynamic add/remove fields: title, description, tech stack, link)
  - Per-step zod validation before advancing
  - Progress indicator at top
  - "Generate Profile" CTA → `PUT /api/students/profile`
  - Loading state, success toast, error handling
- [ ] **Live Feed** (`/student/feed`):
  - Fetch eligible drives via `GET /api/students/feed`
  - Skeleton loader during fetch
  - Drive cards showing company, role, eligibility
  - "Apply" button → `POST /api/applications`
  - Disable "Apply" button after application (applied badge)
  - Empty state illustration
  - Error state with retry button
- [ ] **Application Tracker** (`/student/tracker`):
  - Fetch via `GET /api/students/tracker`
  - Per-drive horizontal `StepperProgress` component
  - Colors: completed (green), current (blue), pending (gray), rejected (red)
  - Empty state for no applications

#### Frontend — TPO Pages `[FE]`
- [ ] **TPO Dashboard** (`/tpo/dashboard`):
  - Summary cards: Total Students, Active Drives, Placements, Open Slots
  - Recent activity feed (last 5 drives)
  - Quick action buttons: "Create Drive", "Send Notification"
- [ ] **Drive Manager** (`/tpo/drives`):
  - "Create Drive" form with zod validation → `POST /api/drives`
  - List of all drives in card/table layout
  - Toast: "Drive Created"
- [ ] **Criteria Engine** (inline in `/tpo/drives`):
  - "Run Filter" per drive → `POST /api/drives/{drive_id}/filter`
  - Animated counter: "X Students Eligible"
  - Expandable list of eligible students
  - Spinner during execution

---

### Dependencies

- Sprint 1 must be fully complete (Auth + DB client working)
- `users` collection must exist before creating `students` (FK reference)
- `students` and `company_drives` collections must exist before `applications`
- Criteria Engine depends on compound index on `students`
- Frontend auth pages depend on `AuthContext` from Sprint 1
- Protected routes depend on `ProtectedRoute` component
- Student feed depends on `GET /api/students/feed` endpoint being implemented

---

### Definition of Done

- [ ] TPO can log in and create a placement drive via the UI
- [ ] Criteria Engine runs and returns correct eligible student count from MongoDB
- [ ] Student can log in, complete Resume Wizard, and data is saved in MongoDB
- [ ] Student Live Feed shows only drives matching their profile (no ineligible drives shown)
- [ ] Student can apply to an eligible drive; duplicate apply returns 409
- [ ] Application Tracker shows correct status for applied drives
- [ ] Role-based redirects work: student accessing `/tpo/dashboard` is redirected to `/student/feed`
- [ ] All endpoints return 401 without token, 403 for wrong role
- [ ] All form validation errors display inline with red text

---

### Expected Outcome

A working product core: TPO can create drives, run the Criteria Engine, and see eligible students. Students can build their profile, see eligible opportunities in their feed, apply, and track their applications.

---
---

## Sprint 3 – Scheduling, Notifications & Real-Time Sync

**Duration:** Weeks 5–6  
**Sprint Goal:** Complete the TPO broadcast workflow (n8n email + SMS), wire up the TPO Interview Scheduler UI, and add Firebase real-time synchronization for the student tracker.

---

### Features Covered

- n8n workflow: Email + SMS broadcast via SendGrid + Twilio
- `POST /api/notifications/broadcast` endpoint
- TPO Broadcast Module UI
- TPO Interview Scheduler (drag-and-drop calendar)
- Firebase Realtime DB write on application status update
- Student tracker real-time status sync
- `PATCH /api/applications/{id}/status` endpoint
- `notifications_log` collection

---

### Detailed Task Breakdown

#### Database `[DB]`
- [ ] Define and create `notifications_log` collection:
  - `_id`, `drive_id`, `student_ids[]`, `channels[]`, `sent_at`, `status`
- [ ] Create index on `notifications_log`: `drive_id`, `sent_at`

#### Backend — Notification Service `[BE]`
- [ ] Create `services/notification_service.py`:
  - `broadcast_notification(student_ids, drive_info)` → POST to `N8N_WEBHOOK_URL`
  - Build payload: `{students: [{email, phone, name}], drive: {company, role, date}}`
  - Handle n8n timeout: retry once with 3s delay, then log failure and return partial success
  - Write result to `notifications_log` collection
- [ ] Implement `POST /api/notifications/broadcast` (TPO only):
  - Body: `{drive_id, student_ids[]}`
  - Call `NotificationService.broadcast_notification()`
  - Return `{status: "dispatched", count: int}`
- [ ] Implement `PATCH /api/applications/{application_id}/status` (TPO only):
  - Body: `{status: Literal[...]}`
  - Update application status in MongoDB
  - Write update to Firebase Realtime Database path: `/application_updates/{application_id}`
  - Return updated application document

#### n8n Workflow — Email + SMS Broadcast `[INFRA]`
- [ ] Deploy n8n via Docker (add to `docker-compose.yml`), secure with basic auth
- [ ] Create n8n workflow **"Placement Drive Broadcast"**:
  - Trigger: Webhook node (URL = `N8N_WEBHOOK_URL`)
  - Input: `{students: [{email, phone, name}], drive: {company, role, date}}`
  - Node 1: Loop over students array
  - Node 2: SendGrid Email node — subject: "You're eligible for {{company}} {{role}}!"
  - Node 3: Twilio SMS node — message template with drive details
  - Node 4: HTTP Request — POST back to `POST /api/notifications/log` to confirm delivery
  - Error node: capture failed sends and log to n8n execution history
- [ ] Create SendGrid account and configure verified sender
- [ ] Create Twilio account and verify sender phone number
- [ ] Test workflow end-to-end with dummy payload (3 test students)
- [ ] Export workflow JSON to `/n8n/broadcast_workflow.json`
- [ ] Add `N8N_WEBHOOK_URL`, `SENDGRID_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` to `.env`

#### Firebase Real-Time Sync `[BE]` `[FE]`
- [ ] Update Firebase Realtime Database rules to allow authenticated student reads on `/application_updates`
- [ ] Backend: after `PATCH /api/applications/{id}/status`, write `{status, updated_at}` to Firebase `application_updates/{application_id}`
- [ ] Frontend: in Application Tracker, attach Firebase `onValue` listener on `application_updates/{application_id}` for each application
- [ ] Tracker updates status display in real-time without page reload

#### Frontend — TPO Broadcast Module `[FE]`
- [ ] Install: all required deps already present from Sprint 1
- [ ] **Broadcast Module** (within `/tpo/notifications`):
  - Show eligible student count from last filter run
  - Prominent "Notify All Eligible" CTA button
  - Confirmation modal: "Send email + SMS to X students? This cannot be undone."
  - `POST /api/notifications/broadcast` on confirm
  - Button loading state ("Sending...")
  - Toast: "Notifications Dispatched!" on success
  - Disable "Notify" button if eligible student count is 0 (with tooltip: "No eligible students found")
  - Error toast if n8n is unreachable

#### Frontend — TPO Interview Scheduler `[FE]`
- [ ] Install: `react-big-calendar moment dnd-kit` (already in Sprint 1 scaffold)
- [ ] **Interview Scheduler** (`/tpo/scheduler`):
  - `react-big-calendar` calendar component in week view
  - Sidebar: list of eligible student chips (from last filter result), draggable via `dnd-kit`
  - Drag student chip → drop onto calendar time slot → creates interview event
  - Client-side conflict detection:
    - Green highlight on valid drop target
    - Red highlight if time slot already has a student
  - Prevent double-booking: check existing events before drop completes
  - Loading state: skeleton calendar during initial data fetch
  - "Clear Schedule" button to reset current view

---

### Dependencies

- Sprint 2 must be complete: `POST /api/drives/{drive_id}/filter` must exist (provides student list for broadcast)
- `applications` collection must exist before `PATCH` status endpoint
- n8n must be deployed before `POST /api/notifications/broadcast` can be tested
- Firebase Realtime Database rules must be updated before frontend listener is added
- Broadcast module UI requires the notification API endpoint to exist

---

### Definition of Done

- [ ] TPO clicks "Notify All Eligible" → n8n delivers email and SMS to all test students
- [ ] `notifications_log` collection records each broadcast dispatch
- [ ] n8n workflow JSON is committed to `/n8n/` directory
- [ ] TPO updates an application status via `PATCH` → student Tracker updates in real-time via Firebase
- [ ] Scheduler renders calendar; dragging a student chip to a slot creates an event and shows green highlight
- [ ] Dropping onto an occupied slot shows red highlight and is rejected
- [ ] Notification button is disabled when eligible count is 0
- [ ] All loading states and error toasts display correctly

---

### Expected Outcome

End-to-end placement drive cycle is functional: TPO creates a drive → filters eligible students → notifies them via email and SMS through n8n → updates application statuses which students see in real-time on their tracker. Interview scheduling is fully operational.

---
---

## Sprint 4 – Alumni Portal & Advanced UI Polish

**Duration:** Weeks 7–8  
**Sprint Goal:** Deliver the complete Alumni portal (Job Referral Board + Mentorship Scheduler), finalize all UI states (loading, error, empty), implement responsiveness, and complete the Resume Wizard PDF generation.

---

### Features Covered

- `alumni_slots` collection
- `job_referrals` collection
- Alumni: Job Referral Board (post + view)
- Alumni: Mentorship Slot management
- Student: Slot booking flow
- Resume Wizard PDF generation (client-side)
- Atomic slot booking (409 on double-book)
- Full responsive layout (mobile, tablet, desktop)
- Global feedback states audit
- PlacementBot widget shell (static UI, no AI yet)

---

### Detailed Task Breakdown

#### Database `[DB]`
- [ ] Define and create `alumni_slots` collection with Pydantic model:
  - `_id`, `alumni_id`, `start_time`, `end_time`, `is_booked`, `booked_by_student_id`, `session_type`
- [ ] Create indexes on `alumni_slots`: `alumni_id`, `is_booked`, `start_time`
- [ ] Define and create `job_referrals` collection with Pydantic model:
  - `_id`, `alumni_id`, `company`, `role`, `location`, `job_link`, `referral_notes`, `posted_at`
- [ ] Create indexes on `job_referrals`: `alumni_id`, `posted_at`
- [ ] Schema validation: `start_time < end_time` for slots; `company` and `role` non-empty

#### Backend — Alumni Service & Routes `[BE]`
- [ ] Create `services/alumni_service.py`:
  - `post_job_referral(alumni_id, job_data)` → insert into `job_referrals`
  - `create_mentorship_slot(alumni_id, slot_data)` → validate no time overlap for same alumni → insert into `alumni_slots`
  - `book_slot(slot_id, student_id)` → atomic `findOneAndUpdate` setting `is_booked=True`; return 409 if already booked
- [ ] Implement `POST /api/alumni/jobs` (alumni only)
- [ ] Implement `GET /api/alumni/jobs` (any authenticated user) — sorted by `posted_at` desc
- [ ] Implement `POST /api/alumni/slots` (alumni only):
  - Validate no overlapping slots for the same alumni before insert
- [ ] Implement `GET /api/alumni/slots` (any authenticated user) — return only unbooked slots
- [ ] Implement `POST /api/alumni/slots/{slot_id}/book` (student only):
  - Atomic findOneAndUpdate
  - Return 409 with message "Slot already booked" if `is_booked` was already true

#### Backend — Resume URL Storage `[BE]`
- [ ] Add `resume_url` field update to `PUT /api/students/profile`
- [ ] Accept `resume_url` in request body (Firebase Storage URL after client-side upload)

#### Frontend — Alumni Interface `[FE]`
- [ ] **Job Referral Board** (`/alumni/jobs`):
  - Alumni view: "Post a Job" button → modal with fields (Company, Role, Location, Job Link, Referral Notes), zod validation, `POST /api/alumni/jobs`, toast: "Job Posted"
  - Feed of all referrals: company, role, location, referral notes, alumnus name, posted date
  - Student view: same feed, no "Post a Job" button
  - Skeleton loader during fetch; empty state illustration
- [ ] **Mentorship Scheduler** (`/alumni/mentorship`):
  - **Alumni View:**
    - Clickable calendar to block available hours (click cell → slot creation modal)
    - `POST /api/alumni/slots` to save slot
    - Booked slots shown in distinct color with student name
    - Unbooked own slots shown as available (green)
  - **Student View:**
    - List or calendar of available (unbooked) alumni slots
    - Each slot shows: alumnus name, time, session type
    - "Book Mock Interview" button → confirmation modal → `POST /api/alumni/slots/{id}/book`
    - Toast: "Slot Booked!"
    - Disable "Book" button and show "Booked" badge on already-booked slots
    - Return 409 → display error toast: "This slot was just booked by another student"

#### Frontend — Resume PDF Generation `[FE]`
- [ ] Install `@react-pdf/renderer`
- [ ] Create `utils/pdf/ResumePDF.jsx` — Sahyadri branded PDF template:
  - Header: college logo, institutional color scheme, student name
  - Sections: Academic Details, Skills, Projects
  - Structured formatting constraints matching institutional layout
- [ ] On "Generate Profile" click in Resume Wizard:
  - `PUT /api/students/profile` (save data)
  - Generate PDF via `@react-pdf/renderer`
  - Auto-download PDF to user's device
  - Upload PDF blob to Firebase Storage at `resumes/{student_id}/resume.pdf`
  - Retrieve download URL and call `PUT /api/students/profile` again with `resume_url`
- [ ] Loading state during PDF generation and upload ("Generating...")
- [ ] Warning if skills array is empty before PDF generation ("Add at least one skill before generating")
- [ ] Error handling: failed upload → toast error + option to download locally only

#### Frontend — PlacementBot Widget Shell `[FE]`
- [ ] Floating chat button anchored to bottom-right on all authenticated pages
- [ ] Click to expand/collapse chat panel
- [ ] Chat history window (scrollable)
- [ ] Message input bar + send button (Enter key submit)
- [ ] Typing indicator animation (three bouncing dots)
- [ ] Messages laid out: user right-aligned, bot left-aligned with avatar
- [ ] Static mock response: "PlacementBot is loading..." (AI wiring in Sprint 5)
- [ ] Error message display if API call fails

#### Frontend — Responsive Layout & UI Polish `[FE]`
- [ ] Audit every page for Tailwind responsive breakpoints (`sm:`, `md:`, `lg:`)
- [ ] Collapsible sidebar on mobile (hamburger menu with overlay)
- [ ] Stack cards to single column on mobile; 2-col on tablet; 3-col on desktop
- [ ] Test and fix all layouts at viewport widths: 375px, 768px, 1280px, 1440px
- [ ] Global feedback states audit — every API call must have:
  - Loading state (skeleton or spinner)
  - Success toast
  - Error toast + inline error where applicable
  - Retry button for all failed read operations
- [ ] `Avatar.jsx` component with initials fallback
- [ ] Smooth animated step transition in `StepperProgress`

---

### Dependencies

- Sprint 2 must be complete: `students` and `users` collections exist
- `alumni_slots` and `job_referrals` collections are new — created this sprint
- Firebase Storage rules must allow authenticated students to write to `resumes/{their_uid}/`
- Atomic slot booking requires `findOneAndUpdate` (not a two-step read/write)
- PlacementBot widget shell is UI-only; AI routes wired in Sprint 5

---

### Definition of Done

- [x] Alumni can post a job referral; it appears in the feed for all users immediately
- [x] Alumni can create a mentorship slot; it appears in student view
- [x] Student can book a slot; concurrent booking attempt returns 409 and toast error
- [x] Booked slot is visually marked as booked in both alumni and student views
- [x] Resume Wizard generates a correctly formatted PDF and triggers auto-download
- [x] PDF is uploaded to Cloudinary (Updated from Firebase Storage); `resume_url` is saved in MongoDB
- [x] Warning shown if student tries to generate PDF with empty skills list
- [x] PlacementBot chat widget opens and closes; static message renders
- [x] All pages pass visual check at 375px, 768px, 1280px viewports
- [x] Every API interaction has loading, success, and error states implemented

---

### Expected Outcome

The full three-role application is feature-complete at the UI level. All core placement workflows — drive creation, eligibility filtering, applications, notifications, scheduling, alumni networking, and mentorship booking — are working end-to-end. The platform is visually polished and fully responsive.

---
---

## Sprint 5 – AI & Skill Intelligence

**Duration:** Weeks 9–10  
**Sprint Goal:** Integrate the complete AI layer: Pinecone JD vector store, Skill Gap RAG pipeline powered by Gemini, and the LangChain PlacementBot agent with live tool calls.

---

### Features Covered

- Pinecone index creation and JD ingestion
- Gemini embeddings integration
- Skill Gap RAG pipeline (`GET /api/ai/skill-gap`)
- Market Intelligence UI (Recharts visualization)
- LangChain PlacementBot agent with tools
- `POST /api/ai/chat` endpoint wired to PlacementBot widget
- AI-specific error handling and edge cases

---

### Detailed Task Breakdown

#### Pinecone Setup & Ingestion `[AI]`
- [ ] Create Pinecone account and index `placementpro-jd`:
  - Dimension: 768, Metric: cosine
- [ ] Add `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, `PINECONE_INDEX_NAME` to backend `.env`
- [ ] Create embedding utility `utils/embeddings.py`:
  - `embed_text(text: str) -> list[float]` using `GoogleGenerativeAIEmbeddings`
  - Batch embedding support for ingestion
  - Exponential backoff retry (max 3 attempts) for Gemini API rate limits
- [ ] Write ingestion script `scripts/ingest_job_descriptions.py`:
  - Curate corpus: 50+ job descriptions covering Data Analyst, SDE, Product Manager, DevOps, Business Analyst roles
  - Chunk each JD into sub-sections (requirements, responsibilities)
  - Generate embeddings via `embed_text()`
  - Upsert vectors to Pinecone with metadata: `{role, company_type, skill_mentioned}`
- [ ] Run ingestion and verify 50+ vectors indexed in Pinecone
- [ ] Document re-ingestion process in `/docs/pinecone_ingestion.md`

#### Skill Gap RAG Pipeline `[AI]`
- [ ] Create `services/ai/skill_gap.py`:
  - `SkillGapAnalyzer` class with `analyze(student_id, target_role) -> SkillGapResult`
  - Step 1: Fetch student skills from MongoDB
  - Step 2: Query Pinecone for top-10 most similar JD chunks for `target_role`
  - Step 3: Extract required skill keywords from retrieved JD chunks
  - Step 4: Compute gap: `required_skills - student_skills`
  - Step 5: Call Gemini to generate structured learning path per gap skill
  - Return: `{present_skills, required_skills, gap, learning_path}`
- [ ] Define `SkillGapResult` Pydantic model
- [ ] Implement `GET /api/ai/skill-gap/{student_id}` (student own or TPO):
  - Query param: `target_role=string`
  - Calls `SkillGapAnalyzer.analyze()`
  - Graceful handling: empty Pinecone result → return `{message: "Insufficient market data for this role"}`
  - Gemini timeout → return partial result with available data
- [ ] Handle edge case: student with 0 skills → return all market-required skills as gap

#### PlacementBot LangChain Agent `[AI]`
- [ ] Create `services/ai/placement_bot.py`:
  - Initialize `ChatGoogleGenerativeAI` (Gemini model) with `GEMINI_API_KEY`
  - Define LangChain custom tools:
    - `get_drive_info(company_name)` → query MongoDB `company_drives`
    - `get_cutoff(drive_id)` → return CGPA/backlog cutoffs for a drive
    - `get_interview_schedule(drive_id)` → return scheduled interview slots
    - `get_faqs()` → return static FAQ YAML (cutoffs, timings, venue)
  - Set up `AgentExecutor` with:
    - System prompt: "You are PlacementBot, a friendly placement assistant for Sahyadri College..."
    - Conversation memory (per session, in-memory, keyed by session ID)
    - Max token limit per response: 500
  - `chat(message, history, session_id) -> str`
- [ ] Add tool call logging to structured logger
- [ ] Implement `POST /api/ai/chat` (any authenticated user):
  - Body: `{message: str, history: list[{role, content}], session_id: str}`
  - Calls `PlacementBot.chat()`
  - Returns `{reply: str}`
  - Rate limit: 20 requests/min per user (via `slowapi`)
  - Error handling: Gemini failure → return fallback: "PlacementBot is temporarily unavailable."

#### Frontend — Market Intelligence View `[FE]`
- [ ] Install `recharts` (already in scaffold from Sprint 1)
- [ ] **Skill Gap View** (`/student/skill-gap`):
  - Target role selector (searchable dropdown: Data Analyst, SDE, Product Manager, etc.)
  - "Analyze" button → `GET /api/ai/skill-gap/{student_id}?target_role={role}`
  - Skeleton loader during RAG pipeline execution (can take 3–8 seconds)
  - Recharts `RadarChart`:
    - Present skills (filled polygon, blue)
    - Required market skills (outline polygon, gray)
  - OR `BarChart` showing % match per skill category
  - List of missing skills with colored "gap" badge per skill
  - Learning path section: per-gap skill with resource links (Coursera, YouTube)
  - Top missing skill highlighted with a prominent badge
  - Empty result message: "Insufficient market data for this role"
  - Error state with retry button

#### Frontend — PlacementBot Widget Live Integration `[FE]`
- [ ] Wire PlacementBot widget (built as shell in Sprint 4) to `POST /api/ai/chat`
- [ ] On message send → show typing indicator → await response → render bot reply
- [ ] Maintain `history[]` array in component state and pass with each request
- [ ] Generate `session_id` (UUID) per widget mount; pass with every request
- [ ] Persist chat history in component state (clears on widget unmount)
- [ ] Error message: "PlacementBot is temporarily unavailable. Please try again." with retry
- [ ] PlacementBot visible on all authenticated pages (student, TPO, alumni)

#### AI-Specific Error Handling & Edge Cases `[AI]`
- [ ] PlacementBot hallucination guard: if tool returns structured drive data, it overrides model's in-context answer
- [ ] Skill gap: if Gemini returns error on learning path generation, return gap list without learning path (partial success)
- [ ] Handle Pinecone empty result gracefully (no 500 error)
- [ ] Handle student with 0 skills in profile (return full required skills as gap without crash)
- [ ] Handle `target_role` not recognized by Pinecone (cosine similarity too low → warn user)
- [ ] Log all AI tool calls and responses to structured logger for debugging

---

### Dependencies

- Sprint 2 must be complete: `students` collection with skills data must be present
- Gemini API key and Pinecone credentials must be configured in `.env`
- JD ingestion script must be run before skill gap pipeline works
- PlacementBot widget shell must be in place from Sprint 4
- `GET /api/ai/chat` endpoint must exist before widget is wired

---

### Definition of Done

- [ ] 50+ job descriptions are indexed as vectors in Pinecone
- [ ] `GET /api/ai/skill-gap` returns a valid gap analysis for a student with skills targeting "Data Analyst"
- [ ] Recharts visualization renders correctly showing present vs required skills
- [ ] PlacementBot answers "What is the cutoff for TCS?" by calling `get_drive_info` tool and returning accurate data from MongoDB
- [ ] PlacementBot handles multi-turn conversation (references previous message context)
- [ ] Chat widget sends message, shows typing indicator, renders reply
- [ ] Empty Pinecone result returns user-friendly message (no 500 error)
- [ ] Rate limiter rejects excessive `/api/ai/chat` requests with 429 response

---

### Expected Outcome

PlacementPro is now AI-enabled. Students can analyze their skill gaps against real market data and receive a personalized learning path. PlacementBot answers placement queries using live database data. All five core product pillars are functional.

---
---

## Sprint 6 – Security, Performance, Testing & Deployment

**Duration:** Weeks 11–12  
**Sprint Goal:** Harden the platform for production: complete test coverage, enforce security controls, optimize performance, deploy to production infrastructure, and deliver documentation.

---

### Features Covered

- Rate limiting (backend: `slowapi`, Nginx)
- Input sanitization (XSS prevention)
- MongoDB operator injection prevention
- Firebase Security Rules finalization
- Nginx SSL termination + security headers
- CI/CD pipeline (GitHub Actions)
- Frontend deployment (Vercel)
- Backend deployment (Docker on EC2 or Cloud Run)
- Unit + integration tests (backend)
- Unit tests (frontend: Vitest)
- E2E tests (Playwright or Cypress)
- Redis caching (drive feed, skill gap)
- Pagination on list endpoints
- Sentry error monitoring
- Full API documentation & OpenAPI export
- Developer and operational documentation

---

### Detailed Task Breakdown

#### Security Hardening `[BE]` `[INFRA]`
- [ ] Install `slowapi` and configure rate limits:
  - `/auth/verify`: 10 req/min per IP
  - `/api/ai/chat`: 20 req/min per user (already done in Sprint 5)
  - All other endpoints: 100 req/min per user
- [ ] Install `bleach`; sanitize all string inputs in Pydantic validators to strip HTML tags (XSS prevention)
- [ ] Validate all query parameters — reject any containing `$` prefix (MongoDB operator injection)
- [ ] Enforce max string length limits: `company_name` ≤ 100 chars, `referral_notes` ≤ 1000 chars
- [ ] Add `gitleaks` or `trufflehog` to GitHub Actions CI pipeline to detect committed secrets
- [ ] Nginx security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains`
  - `server_tokens off`
- [ ] Configure Nginx rate limiting: `limit_req_zone $binary_remote_addr`
- [ ] Set up Let's Encrypt Certbot for SSL certificate + auto-renewal
- [ ] Finalize Firebase Realtime Database security rules (per Epic 11.4)
- [ ] Configure Firebase Storage rules: users can only read/write their own `resumes/{uid}/` path
- [ ] Data isolation audit: verify no endpoint leaks another student's data
- [ ] Add `X-Request-ID` response header (already in middleware — verify working)

#### Nginx Production Configuration `[INFRA]`
- [ ] Complete `infra/nginx/nginx.conf`:
  - Reverse proxy: `location /api/ → proxy_pass http://backend:8000`
  - HTTP → HTTPS redirect (301)
  - SSL termination with Let's Encrypt
  - Gzip compression for API responses and static assets
  - HTTP/2 enabled
  - `proxy_set_header` for forwarding real IP
  - Keep-alive connections between Nginx and upstream
- [ ] Set HTTP cache headers for static frontend assets: `Cache-Control: max-age=31536000, immutable`

#### Performance Optimization `[BE]`
- [ ] Install `redis` Python client; set up Redis container in `docker-compose.yml`
- [ ] Add Redis caching:
  - Student feed results: TTL 60 seconds (keyed by `student_id`)
  - Skill gap analysis: TTL 24 hours (keyed by `student_id + target_role`)
  - Eligible student list per drive: TTL 5 minutes (keyed by `drive_id`)
- [ ] Implement cursor-based pagination on all list endpoints:
  - `GET /api/drives` — `?cursor=<last_id>&limit=20`
  - `GET /api/alumni/jobs` — `?cursor=<last_id>&limit=20`
  - `GET /api/students/tracker` — `?cursor=<last_id>&limit=20`
- [ ] Verify `motor` async driver is used throughout (no blocking `pymongo` calls)
- [ ] Set MongoDB connection pool `maxPoolSize=10`

#### Performance Optimization `[FE]`
- [ ] Verify React Query `staleTime` and `cacheTime` are set appropriately per endpoint
- [ ] Memoize expensive renders with `React.memo` and `useMemo` where applicable
- [ ] Lazy-load Recharts and `react-big-calendar` only on pages that require them
- [ ] Optimize images in `/assets`: convert to WebP format
- [ ] Preload Inter font in `index.html` (`<link rel="preload">`)

#### Testing — Backend `[BE]`
- [ ] Set up `pytest` with `conftest.py`: async test DB client, mock Firebase auth
- [ ] Unit tests — `criteria_engine.filter_eligible_students`:
  - Returns correct count for CGPA/backlog/branch criteria
  - Returns empty list when no students match
  - Handles missing fields gracefully
- [ ] Unit tests — `application_service.apply_to_drive`:
  - Prevents duplicate application (idempotency)
  - Returns 409 on second apply
- [ ] Unit tests — `alumni_service.book_slot`:
  - Returns 409 on already-booked slot (atomic)
- [ ] Unit tests — all Pydantic validators (invalid CGPA, negative backlogs, invalid role, past drive date)
- [ ] Unit tests — auth dependency: invalid token → 401, missing token → 401, wrong role → 403
- [ ] Integration tests:
  - Full drive flow: `POST /api/drives` → `POST /api/drives/{id}/filter` → `POST /api/notifications/broadcast`
  - Application lifecycle: apply → TPO updates status → verify tracker reflects update
  - Alumni slot booking: create slot → book slot → verify booked state → reject second booking
  - RBAC audit: verify every endpoint returns 403 for incorrect role
- [ ] AI unit tests (mocked Gemini + Pinecone):
  - `SkillGapAnalyzer`: correct gap calculation from mocked vectors
  - `PlacementBot`: correct tool called for "cutoff" query
  - Embedding utility: handles empty input and API error gracefully

#### Testing — Frontend `[FE]`
- [ ] Set up Vitest + React Testing Library
- [ ] Test `ProtectedRoute`: unauthorized redirect, wrong-role redirect
- [ ] Test `AuthContext`: mock Firebase auth, verify role loading
- [ ] Test Resume Wizard: step navigation, validation errors, final submit call
- [ ] Test Application Tracker: renders correct stepper state for each status value
- [ ] Test Criteria Engine form: renders eligible count on success, error state on failure
- [ ] Test PlacementBot widget: message send, typing indicator visible, response renders

#### Testing — E2E `[FE]`
- [ ] Set up Playwright
- [ ] E2E: Student registration → login → view feed → apply to drive → check tracker
- [ ] E2E: TPO login → create drive → run criteria filter → broadcast notification
- [ ] E2E: Alumni login → post job referral → switch to student account → verify feed
- [ ] E2E: Alumni create mentorship slot → student books slot → slot marked booked
- [ ] E2E: PlacementBot opens → sends a message → bot replies

#### CI/CD Pipeline `[INFRA]`
- [ ] Create `.github/workflows/backend-ci.yml`:
  - Trigger: push to `develop`, PR to `main`
  - Steps: checkout, Python 3.11 setup, `pip install -r requirements.txt`, `pytest --tb=short`
  - Linting: `ruff check .`
  - Secret scanning: `gitleaks` scan
- [ ] Create `.github/workflows/frontend-ci.yml`:
  - Trigger: push to `develop`, PR to `main`
  - Steps: checkout, `npm ci`, `npm run build`, `npx vitest run`
  - ESLint: `npm run lint`
- [ ] Create `.github/workflows/deploy-frontend.yml`:
  - Trigger: push to `main`
  - Deploy to Vercel via Vercel CLI or GitHub integration

#### Production Deployment `[INFRA]`
- [ ] Set up production environment (EC2 t3.small or Cloud Run):
  - Install Docker and Docker Compose
  - Configure security group: allow only ports 80, 443 (backend port 8000 is internal)
  - Set all production `.env` values
- [ ] Build and push backend Docker image to registry
- [ ] Run `docker-compose up -d` with Nginx + backend + n8n
- [ ] Configure Vercel: connect GitHub, set all `VITE_` env vars, build command `npm run build`, output `dist`
- [ ] Configure custom domain and SSL (Vercel auto-provisions; Nginx via Certbot)
- [ ] Verify `GET /health` returns 200 on production URL

#### Monitoring `[INFRA]`
- [ ] Integrate Sentry (frontend and backend):
  - Frontend: `npm install @sentry/react`
  - Backend: `pip install sentry-sdk`
  - Configure DSN via environment variable
- [ ] Set up Uptime Robot free monitor on `GET /health` (alert on downtime > 2 min)
- [ ] MongoDB Atlas: enable Performance Advisor, set alert for slow queries > 100ms

#### Documentation `[INFRA]`
- [ ] Verify FastAPI OpenAPI docs complete: every endpoint has `summary`, `description`, `response_model`, and body `example`
- [ ] Export `docs/openapi.json` from `/docs`
- [ ] Write `/frontend/README.md`: dev setup, env vars, folder structure, component conventions
- [ ] Write `/backend/README.md`: dev setup, env vars, running locally, running tests
- [ ] Create architecture diagram (C4 or sequence): client → FastAPI → MongoDB → n8n → Firebase flow
- [ ] Create database schema diagram (MongoDB collections ERD)
- [ ] Write AI pipeline doc: RAG flow diagram for Skill Gap and PlacementBot
- [ ] Write deployment runbook: step-by-step production deployment guide

---

### Dependencies

- Sprints 1–5 must be complete before this sprint begins
- Redis must be running before caching code is tested
- All API endpoints must be implemented before E2E tests can run
- CI/CD pipeline must run tests before deploying
- OpenAPI documentation requires all routes to be finalized

---

### Definition of Done

- [ ] All backend unit and integration tests pass (`pytest` exit code 0)
- [ ] All frontend unit tests pass (Vitest exit code 0)
- [ ] All 5 E2E Playwright flows pass on staging environment
- [ ] `gitleaks` CI check passes (no committed secrets)
- [ ] `/docs/openapi.json` is exported and committed
- [ ] Production URL returns `200 OK` on `GET /health`
- [ ] Frontend loads on production domain with valid SSL
- [ ] Sentry records a test error event for both frontend and backend
- [ ] Uptime Robot monitor is configured and active
- [ ] All API responses include `X-Request-ID` header
- [ ] Rate limiter returns 429 under load for `/auth/verify` > 10 req/min
- [ ] MongoDB queries with `$` prefix in user input are rejected with 400

---

### Expected Outcome

PlacementPro is production-ready. All features from all three roles are working, tested, secured, monitored, and deployed. The codebase has CI/CD, full test coverage, structured logging, error monitoring via Sentry, and comprehensive documentation for handoff or onboarding.

---
---

## Sprint Summary

| Sprint | Duration | Focus | Key Deliverable |
|--------|----------|-------|-----------------|
| 1 | Weeks 1–2 | Foundation & Infrastructure | Runnable auth skeleton (Firebase ↔ FastAPI ↔ MongoDB) |
| 2 | Weeks 3–4 | Core Placement Engine | TPO drives + Criteria Engine + Student Feed + Applications |
| 3 | Weeks 5–6 | Scheduling & Notifications | n8n email/SMS broadcast + Interview Scheduler + Real-time tracker |
| 4 | Weeks 7–8 | Alumni Portal & UI Polish | Alumni Job Board + Mentorship + PDF Resume + Responsive UI |
| 5 | Weeks 9–10 | AI & Skill Intelligence | Skill Gap RAG (Gemini + Pinecone) + PlacementBot (LangChain) |
| 6 | Weeks 11–12 | Security, Testing & Deployment | Production deployment + Full test suite + Security hardening |

---

## Dependency Chain

```
Sprint 1 (Auth + DB + Scaffold)
    └──► Sprint 2 (Core Collections + Drive Engine + Student Flows)
              └──► Sprint 3 (Notifications API + n8n + Real-Time Sync)
              └──► Sprint 4 (Alumni Collections + PDF + UI Polish)
                        └──► Sprint 5 (AI — requires stable data + widget shell)
                                  └──► Sprint 6 (All features stable → test + secure + deploy)
```
