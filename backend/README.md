# PlacementPro - Backend

## Introduction

PlacementPro is a unified campus placement suite. This `/backend` directory contains the FastAPI Python backend logic, the MongoDB interface, and the AI Pipeline using LangChain and Pinecone. 

---

## 🚀 Developer Setup

### Prerequisites
- Python 3.11+
- Virtualenv
- (Optional but Recommended) Docker and Docker Compose (to run MongoDB natively or set up networking with `docker-compose.yml`)

### Installation
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Virtual Environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Linux/macOS
   .\venv\Scripts\activate   # On Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend` root. You can refer to `.env.example` if available.

Ensure the following variables are set:

**Core**
- `MONGO_URI`: The MongoDB connection string (e.g. `mongodb://localhost:27017` or Atlas URI).
- `MONGO_DB_NAME`: The database name. Default is `placementpro`.
- `ALLOWED_ORIGINS`: Allowed origins for CORS (e.g. `http://localhost:5173`).
- `ENVIRONMENT`: Set to `development` or `production`.

**Services**
- `FIREBASE_SERVICE_ACCOUNT_JSON`: Path to the serviceAccountKey.json for Firebase Admin.
- `REDIS_URL`: The Redis caching layer URL (e.g., `redis://localhost:6379/0`).
- `N8N_WEBHOOK_URL`: N8N webhook trigger URL for notifications.
- `GEMINI_API_KEY`: API Key for Google Gemini LLM via LangChain.
- `PINECONE_API_KEY`: Pinecone API Key.
- `PINECONE_ENVIRONMENT`: Pinecone environment setup.

---

## 🏃‍♂️ Running Locally

To start the FastAPI server with Uvicorn in real-time reloading mode:
```bash
uvicorn main:app --reload --port 8000
```
Then visit:
- http://localhost:8000/docs for Swagger/OpenAPI documentation.
- http://localhost:8000/redoc for Redoc documentation.

### Running Tests
A full suite of unit and integration tests is available using `pytest`.

Ensure tests run in a safe development database.
```bash
pytest --tb=short tests/
```

---

## 🛠 Features

- **RBAC**: Handled via custom Dependencies (e.g., `require_role()`).
- **Caching**: Endpoints like `student feed` and `skill-gap` are cached in Redis.
- **Criteria Engine**: An aggregation pipeline in `services/criteria_engine.py` fetching eligible drives in O(N).
- **AI RAG (PlacementBot + SkillGap)**: Powered by Gemini and Pinecone embedded data. 
- **Validation**: Data models are defined using `Pydantic`.
