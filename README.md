# AI-Assisted Document Authoring (Prototype)

This repository contains a minimal prototype of an AI-assisted document authoring and generation platform.

Components
- Backend: FastAPI (Python) with SQLite (SQLModel). Handles authentication (JWT), project management, LLM adapter (mock + OpenAI placeholder), and document export using python-docx/python-pptx.
- Frontend: Simple static HTML/JS UI (in `frontend/`) demonstrating login, creating projects, generating content, refining sections, feedback, comments, and exporting .docx/.pptx.

Quick setup (Windows / PowerShell)

1. Create a virtual environment and install backend dependencies

```powershell
cd "C:/Users/Pranav Nair/OneDrive/Desktop/project/backend"
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Environment variables

- `JWT_SECRET` - optional, default used if not set.
- `OPENAI_API_KEY` - optional. If set, backend will try to call OpenAI (placeholder model used). If not set, a mock LLM will be used.

3. Run backend

```powershell
uvicorn backend.main:app --reload --reload-dir C:/Users/Pranav Nair/OneDrive/Desktop/project/backend
```

4. Open the frontend

Open `frontend/index.html` in your browser (or serve it with a static server). The frontend expects the backend at `http://localhost:8000`.

Usage

- Register a user (enter email and password, click Register).
- Login to receive a JWT (handled by the frontend automatically).
- Create a project (choose docx or pptx, give a prompt).
- Open the project in the editor, click "Generate Content" to populate sections using the mock LLM.
- For each section you can:
  - Provide a refinement prompt and click "Refine" to create an AI revision
  - Click Like/Dislike to record feedback
  - Export the final document using the Export button

Notes and next steps
- This is a focused prototype to demonstrate the end-to-end flow. Recommended next steps:
  - Replace the mock LLM with an actual LLM integration (Gemini/OpenAI) and handle rate limits.
  - Add persistent user sessions and refresh tokens.
  - Improve frontend (React/Vite) to provide a richer editor (WYSIWYG, diffing revisions, comments UI).
  - Add tests and CI pipeline.

Files changed/added
- `backend/` - FastAPI app, models, auth, LLM adapter, exporter
- `frontend/` - HTML/CSS/JS demo UI

License: MIT (for prototype)
