# PlacementPro – System Design Document (SDD)

**Author:** Karthik Acharya
**Project:** The Integrated Campus Career Suite

---

# 1. System Overview & High-Level Architecture

PlacementPro is a centralized web application designed to digitize and manage the entire campus placement lifecycle.

It eliminates:

* Manual Excel-based tracking
* Physical notice board announcements

It leverages:

* API-driven backend architecture
* NoSQL database
* Real-time synchronization
* AI-powered analytics modules

The system follows a **modern Client-Server Architecture**, integrated with third-party automation and AI micro-services.

---

## 1.1 Core Technology Stack

### Frontend Web

* React.js (Single Page Application)
* Tailwind CSS (UI styling)

### Backend API

* FastAPI (Python)

  * High-performance
  * Asynchronous request handling

### Database

* MongoDB (NoSQL)

  * Flexible document-based storage
  * Dynamic student profiles and eligibility constraints

### Authentication & Real-Time Sync

* Firebase

  * Firebase Authentication
  * Firebase Realtime Database

### Workflow Automation

* n8n

  * Notification orchestration
  * Webhook-driven workflows

### AI Engine

* LangChain (Agentic orchestration)
* Pinecone (Vector database)
* Gemini (LLM for RAG pipelines)

---

# 2. Component Design & Data Flow

---

## 2.1 The Client (Frontend)

The React application provides three distinct role-based interfaces:

### 1. TPO Admin Dashboard

Features:

* Criteria Engine
* Drag-and-drop Interview Scheduler
* Broadcast notification tools

---

### 2. Student Dashboard

Features:

* Resume Wizard
* Personalized Live Feed (eligibility-filtered)
* Application Tracker

The Resume Wizard generates standardized PDF templates customized for institutions like:

* Sahyadri College of Engineering & Management

---

### 3. Alumni Portal

Features:

* Job Referral Board
* Mentorship Slot calendar

---

## 2.2 The Core API (Backend)

FastAPI acts as the primary backend gateway.

### Data Flow

1. React client sends a REST or WebSocket request.
2. Firebase JWT token is attached.
3. FastAPI validates the JWT.
4. Business logic is executed.

   * Example: Criteria Engine filters students in MongoDB.
5. JSON response is returned to client.

---

## 2.3 The Automation Layer (n8n)

### Notification Workflow

1. TPO clicks **"Notify All Eligible"**
2. FastAPI sends webhook payload to n8n.

   * Contains eligible student emails/phone numbers.
3. n8n processes workflow.
4. n8n triggers external APIs:

   * SendGrid (Email)
   * Twilio (SMS)
5. Message is broadcasted.

---

## 2.4 The AI & Analytics Layer

---

### PlacementBot (Agentic AI)

* Orchestrated using LangChain.
* When student asks:

  > "What is the cutoff for TCS?"

Flow:

1. LangChain calls FastAPI tools.
2. Retrieves drive data from MongoDB.
3. Generates natural language response.

---

### Skill Gap Analysis (RAG Pipeline)

1. Market job descriptions embedded and stored in Pinecone.
2. Student selects a target role (e.g., Data Analyst).
3. Gemini:

   * Retrieves vector embeddings from Pinecone.
   * Compares with student profile (MongoDB).
4. Outputs personalized learning path.

Example:

* Detects missing skill: **PowerBI**
* Recommends structured learning roadmap.

---

# 3. Database Schema (MongoDB Collections)

---

## 3.1 users

Manages role-based access.

**Fields:**

* `_id`
* `firebase_uid`
* `email`
* `role` (tpo | student | alumni)
* `created_at`

---

## 3.2 students

Stores dynamic student profile data.

**Fields:**

* `_id`
* `user_id`
* `full_name`
* `branch`
* `academics`

  * `cgpa`
  * `backlogs`
* `skills` (array)
* `projects` (array)
* `resume_url`

---

## 3.3 company_drives

Stores placement drive criteria.

**Fields:**

* `_id`
* `company_name`
* `role`
* `eligibility_criteria`

  * `min_cgpa`
  * `max_backlogs`
  * `branches`
* `status`

---

## 3.4 applications

Maps students to drives.

**Fields:**

* `_id`
* `student_id`
* `drive_id`
* `status`

  * Applied
  * Aptitude
  * Interview
  * Selected
* `applied_on`

---

## 3.5 alumni_slots

Manages mentorship availability.

**Fields:**

* `_id`
* `alumni_id`
* `start_time`
* `end_time`
* `is_booked`
* `booked_by_student_id`

---

# 4. RESTful API Endpoints Contract (FastAPI)

---

## 4.1 Auth & Users

### `POST /auth/verify`

* Verifies Firebase token
* Returns user role

---

## 4.2 TPO Operations

### `POST /api/drives`

* Create new company drive

### `POST /api/drives/{drive_id}/filter`

* Executes Criteria Engine
* Runs MongoDB aggregation on students collection

### `POST /api/notifications/broadcast`

* Triggers n8n webhook
* Accepts array of student IDs
* Initiates email/SMS broadcast

---

## 4.3 Student Operations

### `PUT /api/students/profile`

* Updates Resume Wizard data

### `GET /api/students/feed`

* Returns drives where student meets eligibility

### `GET /api/students/tracker`

* Returns application tracking documents

---

## 4.4 Alumni Operations

### `POST /api/alumni/jobs`

* Post referral to Job Board

### `POST /api/alumni/slots`

* Publish mentorship availability

---

## 4.5 AI Modules

### `POST /api/ai/chat`

* PlacementBot endpoint

### `GET /api/ai/skill-gap/{student_id}?target_role={role}`

* Triggers RAG pipeline
* Compares student profile with Pinecone market embeddings
* Returns skill gap analysis

---

# 5. Deployment & Infrastructure Strategy

---

## 5.1 Frontend Deployment

* Vercel
  **or**
* Firebase Hosting

Provides fast global content delivery.

---

## 5.2 Backend Deployment

* Dockerized FastAPI application
* Hosted on:

  * AWS EC2
    **or**
  * Google Cloud Run

---

## 5.3 Database Hosting

* MongoDB Atlas (Managed Cloud Database)
* Securely peered with backend instance

---

## 5.4 Network & Security

### Reverse Proxy

* Nginx configured to:

  * Route traffic securely
  * Terminate SSL
  * Protect internal API routes

### CORS Policies

* Restrict requests to authenticated React frontend only.

### Security Controls

* JWT validation (Firebase)
* Role-based authorization checks
* Secure API gateway design

---

# Conclusion

The PlacementPro system architecture is:

* Modular
* Scalable
* AI-integrated
* Automation-driven

It replaces fragmented manual systems with a secure, real-time, intelligent campus placement ecosystem built for modern institutions.
