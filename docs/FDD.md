# PlacementPro – Frontend Design Document (FDD)

**Developer:** Karthik Acharya  
**Target Platform:** Responsive Web Application  

---

# 1. Frontend Technology Stack

To ensure a fast, scalable, and modern user experience, the frontend will be built using the following ecosystem:

## Core Framework
- **React.js** (initialized via Vite for faster builds and optimized development workflow)

## Routing
- **React Router v6**
  - Single Page Application (SPA) navigation
  - Protected and role-based routes

## Styling
- **Tailwind CSS**
  - Utility-first design
  - Consistent theming
  - Rapid UI development

## State Management
- **Zustand** *or* **Redux Toolkit**
  - Global authentication state
  - Live feed data
  - Drive filtering results
  - Application tracker state

## API Communication
- **Axios** *or* **React Query**
  - FastAPI backend communication
  - Response caching
  - Optimistic updates
  - Error handling

## Authentication
- **Firebase Auth SDK**
  - Secure login sessions
  - JWT handling
  - Role-based access control

## PDF Generation
- **react-pdf** *or* **html2pdf.js**
  - Resume Wizard instant PDF generation

## Calendar & Drag-and-Drop
- **react-big-calendar**
- **dnd-kit**
  - TPO Interview Scheduler implementation

---

# 2. Directory Architecture

A scalable folder structure ensures maintainability and modular growth.

```
/src
  /assets         # Static files (logos, branding, avatars)
  /components     # Reusable UI components (Button, Input, Modal, PlacementBot)
  /context        # Firebase Auth context and role wrappers
  /hooks          # Custom hooks (useAuth, useFetchDrives, etc.)
  /pages
    /auth         # Login, Register, Forgot Password
    /tpo          # Dashboard, Criteria Engine, Drive Manager
    /student      # Resume Wizard, Live Feed, Tracker, Skill Gap
    /alumni       # Job Board, Mentorship Scheduler
  /services       # Axios API configurations
  /store          # Zustand/Redux global store
  /utils          # Helpers (date formatters, PDF logic, validators)
```

---

# 3. Role-Based Access Control (RBAC) & Routing

Since PlacementPro has three distinct interfaces, routing must strictly enforce user roles.

## Public Routes
- `/login`
- `/register`
- `/forgot-password`

## Protected Routes

A wrapper component:

```jsx
<ProtectedRoute allowedRoles={['student']} />
```

### Behavior
- Checks Firebase-authenticated user.
- Validates role from MongoDB.
- Redirects unauthorized access.
  - Example: If a student tries accessing `/tpo/dashboard`, they are redirected to `/student/feed`.

---

# 4. Key Interface & Component Breakdown

---

# 4.1 Student Interface

---

## Resume Wizard Form

### Features
- Multi-step form:
  - Academic details
  - Skills
  - Projects
- Validation at each step
- Final action:
  - **"Generate Profile"** button
  - Instantly generates standardized PDF resume

### Branding
- Hardcoded template with:
  - Sahyadri College of Engineering & Management layout
  - Institutional color scheme
  - Structured formatting constraints

---

## Live Feed View

### Design
- Minimal, decluttered card layout
- Scrollable feed
- Responsive grid design

### Logic
- Renders only drives where:
  - `eligibility_criteria` matches student state data

---

## Application Tracker Timeline

### UI Component
- Horizontal stepper

### Status Flow
- Applied
- Aptitude
- Cleared
- Interview Scheduled
- Selected

### Features
- Color-coded progress
- Animated transitions
- Real-time updates

---

## Market Intelligence View

### Visualization Library
- **Recharts**

### Functionality
- Displays Skill Gap Analysis
- Compares:
  - Student skill set
  - Market demand data

Example:
- Target Role: *Data Analyst*
- Graphical comparison:
  - Present Skills vs Required Skills
- Highlights missing skills (e.g., PowerBI)

---

# 4.2 TPO Admin Interface

---

## Criteria Engine Form

### UI Components
- Input fields:
  - Minimum CGPA
  - Maximum Backlogs
- Branch Multi-select dropdown
  - Example: CS, MCA

---

## Live Query Result

### Component
- Dynamic counter display:
  > "X Students Eligible"

### Behavior
- Updates instantly upon filter execution
- Reflects MongoDB aggregation results

---

## Broadcast Module

### Key Feature
- Prominent:
  > **"Notify All Eligible"** button

### Behavior
- Sends webhook payload to n8n
- Triggers:
  - Email
  - SMS
  - In-app notifications

---

## Interview Scheduler

### UI
- Drag-and-drop calendar interface
- Sidebar containing eligible student chips

### Interaction
- Drag student chip → drop onto time slot
- Prevents:
  - Double booking
  - Overlapping time conflicts

### Visual States
- Green: Valid slot
- Red: Conflict detected

---

# 4.3 Alumni Interface

---

## Job Referral Board

### Layout
- Feed-based UI
- "Post a Job" modal

### Functionality
- Alumni can:
  - Add job details
  - Mention company
  - Add referral notes
- Instantly visible to students

---

## Mentorship Scheduler

### Alumni View
- Clickable calendar
- Block "Available Hours"

### Student View
- Available slots show:
  > "Book Mock Interview"

### Booking Flow
- Student selects slot
- Confirmation modal
- Slot marked as booked

---

# 4.4 Global Components

---

## PlacementBot Widget

### Placement
- Floating component
- Anchored bottom-right
- Visible on all authenticated views

### Features
- Chat history window
- Message input bar
- Typing indicator animation
- Scrollable conversation thread

### Purpose
- Answer FAQs:
  - Cutoffs
  - Interview timings
  - Venue changes
- Provide instant mock interview practice

---

# 5. UI/UX & Design System Guidelines

---

## Color Palette

- Primary colors aligned with college branding
- Clean white/gray dashboard backgrounds
- High-contrast buttons for CTAs

---

## Responsiveness

Using Tailwind utility classes:

- `md:grid-cols-2`
- `lg:flex`
- `sm:hidden`
- `w-full md:w-1/2`

Ensures:
- Desktop optimization
- Tablet compatibility
- Mobile web responsiveness

---

## Feedback & Interaction States

Every API interaction must include:

### Loading States
- Skeleton loaders
- Animated spinners

### Success Notifications
- Toast alerts:
  - "Resume Generated Successfully!"
  - "Drive Created"
  - "Slot Booked"

### Error Handling
- Inline form validation
- Red error text indicators
- Retry buttons for failed requests

---

# Conclusion

The PlacementPro frontend architecture is designed to be:

- Modular  
- Role-driven  
- Responsive  
- Real-time synchronized  
- AI-enhanced  

It provides a clean, intuitive experience tailored separately for Students, TPOs, and Alumni while maintaining a unified and scalable design system across the entire web application.