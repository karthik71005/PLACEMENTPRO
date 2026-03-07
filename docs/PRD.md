# PlacementPro – Product Requirements Document (PRD)

---

## 1. Product Vision & Objective

**PlacementPro** is an integrated campus career suite designed to act as the **central brain** for college placement activities.

### Objective

* Transition institutions away from manual processes.
* Replace traditional Excel sheets with a dynamic database.
* Replace physical notice boards with real-time, personalized digital dashboards.
* Deliver a robust, responsive **web application** as the primary platform.

---

## 2. Target Audience & User Personas

The system architecture supports three distinct, role-based views:

### 2.1 The Placement Officer (TPO)

**Needs:**

* Centralized control center for placement drives.
* Student data filtering.
* Automated communication workflows.

---

### 2.2 The Student

**Needs:**

* Career profile management.
* Placement opportunity tracking.
* Personalized eligibility-based job notifications.

---

### 2.3 The Alumni

**Needs:**

* Networking platform.
* Mentorship opportunities.
* Direct job referral channel for students.

---

## 3. Core Functional Requirements

---

## 3.1 TPO Admin Dashboard (The Control Center)

### 3.1.1 Criteria Engine

* TPO can create a placement **Drive** (e.g., *TCS Digital*).
* Define eligibility constraints:

  * Minimum CGPA
  * Maximum backlogs
  * Eligible branches (e.g., CS/MCA)
* System dynamically queries the database.
* Instantly outputs total eligible student count.

---

### 3.1.2 Automated Notifications

* One-click **"Notify All Eligible"** button.
* Triggers automated:

  * Email
  * SMS
  * In-app notifications
* Sent exclusively to filtered eligible students.

---

### 3.1.3 Interview Scheduler

* Visual drag-and-drop calendar.
* Slot assignment capability.
* Active prevention of overlapping schedules.
* Real-time updates across system.

---

## 3.2 Student Application (Career Profile & Action)

### 3.2.1 Resume Wizard

* Dynamic input form:

  * Projects
  * Skills
  * Academic marks
* Automatically generates:

  * Standardized
  * College-branded PDF resume
* Customizable for institutions (e.g., Sahyadri College of Engineering & Management).

---

### 3.2.2 Personalized Live Feed

* Decluttered dashboard.
* Displays only:

  * Drives matching student eligibility.
* Real-time synchronization.

---

### 3.2.3 Application Tracker

Real-time placement journey status indicators:

* Applied
* Aptitude
* Cleared
* Interview Scheduled
* Selected

---

## 3.3 Alumni "Connect" Portal (Networking)

### 3.3.1 Job Referral Board

* Alumni can post active job openings.
* Direct visibility to eligible junior students.
* Organized feed structure.

---

### 3.3.2 Mentorship Slots

* Alumni define:

  * Available hours
* Students can:

  * View slots
  * Book mock interviews
  * Schedule career guidance sessions

---

## 4. Advanced "Central Brain" Features (AI & Analytics)

---

### 4.1 Market Intelligence & Skill Gap Analysis

Analytics dashboard that:

* Compares student profile with real-world market data.
* Identifies missing in-demand skills.

**Logic Example:**

If a student targets a **Data Analyst** role:

* System identifies that 80% of placed candidates have **PowerBI** skills.
* If missing:

  * System prescribes a recommended learning path.

---

### 4.2 PlacementBot (24/7 Virtual Assistant)

Automated conversational AI agent that:

* Resolves repetitive TPO-related queries.
* Handles:

  * Cutoff questions
  * Interview timings
  * Venue changes
* Supports mock interview preparation.
* Reduces manual intervention.

---

## 5. Technical Specifications & Architecture

To support dynamic queries, real-time updates, and AI workflows:

---

### 5.1 Frontend

* **React**

  * Modular architecture
  * Highly interactive UI
  * Responsive web design

---

### 5.2 Backend System

* **FastAPI (Python)**

  * High concurrency handling
  * Powers Criteria Engine
  * Efficient API layer

---

### 5.3 Database

* **MongoDB**

  * Flexible document-based storage
  * Supports complex student profiles
  * Handles varied company criteria

---

### 5.4 Authentication & Real-Time Sync

* **Firebase**

  * Secure role-based authentication
  * Real-time Student Live Feed updates

---

### 5.5 Workflow Automation

* **n8n**

  * Orchestrates notification pipelines
  * Routes SMS and email automation
  * Supports one-click TPO triggers

---

### 5.6 AI Integration

* **LangChain**

  * Builds Agentic PlacementBot
* **Pinecone**

  * Vector database
* **Gemini**

  * Powers Retrieval-Augmented Generation (RAG)
  * Enables Skill Gap Analysis

---

## 6. Out of Scope

* Native mobile application development (iOS/Android).
* Platform will be strictly a responsive web application.

---

## 7. Success Metrics

### 7.1 Operational Efficiency

* 90% reduction in manual list-making.
* Elimination of Excel-based drive management.

---

### 7.2 Student Engagement

* 100% adoption rate of Resume Wizard.
* Standardized resume formatting across institution.

---

### 7.3 Support Deflection

* PlacementBot resolves 80% of routine student queries without human intervention.

---

## Summary

PlacementPro aims to modernize campus placement operations by:

* Centralizing control for TPOs.
* Personalizing opportunities for students.
* Enabling alumni-driven networking.
* Leveraging AI for analytics and automation.

The platform functions as a unified, intelligent ecosystem replacing fragmented manual systems with a scalable, data-driven solution.
