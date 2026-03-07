# PlacementPro - Frontend

## Introduction

PlacementPro is a unified campus placement suite. This `/frontend` directory contains the React (Vite) Single Page Application. It leverages Vite for fast builds, React Router V6 for navigation, Zustand for state management, and Tailwind CSS for styling.

---

## 🚀 Developer Setup

### Prerequisites
- Node.js (v18 or v20+ recommended)
- `npm` or `yarn`

### Installation
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## ⚙️ Environment Variables

Create a `.env` file in the `frontend` root. You can use `.env.example` as a template.

Ensure the following variables are set:

- `VITE_API_BASE_URL`: The URL for the PlacementPro backend API (e.g., `http://localhost:8000`).
- `VITE_FIREBASE_API_KEY`: Firebase configuration.
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase Auth Domain.
- `VITE_FIREBASE_PROJECT_ID`: Firebase Project ID.
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket.
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase sender ID.
- `VITE_FIREBASE_APP_ID`: Firebase App ID.

---

## 🏃‍♂️ Running Locally

To start the Vite development server:
```bash
npm run dev
```
The app will typically be available at `http://localhost:5173`.

### Running Tests
To run unit and integration tests using Vitest:
```bash
npm run test
```

---

## 📁 Folder Structure

- `/src/assets`: Images, graphics, and static media.
- `/src/components`: Reusable UI elements (`Button`, `Input`, `Card`, etc.).
- `/src/context`: React context providers (e.g., `AuthContext`).
- `/src/hooks`: Custom React hooks (e.g., `useRole`, `useAuth`).
- `/src/pages`: Top-level route components representing views (`/login`, `/student/feed`, etc.).
- `/src/services`: API handlers and Firebase SDK initialization.
- `/src/store`: Zustand stores for global state (if applicable).
- `/src/utils`: Helper functions and utilities.

---

## 🎨 Component Conventions

- We follow a centralized component library approach.
- Always use the shared components in `/src/components/ui/` instead of bare HTML elements.
- Styling is predominantly handled via utility classes provided by Tailwind CSS. Base definitions refer to the `tailwind.config.js`.
- Responsive design follows mobile-first prefixes: `sm:`, `md:`, `lg:`.
