# AGENTS.md for downtime-platform

## Overview
Consolidated downtime platform — merged from three source repositories (downtime-app, downtime-backend, downtime-dfw). React/TypeScript frontend with Google OAuth, Python/FastAPI backend for event fetching/scoring/caching, and DFW configuration/data pipeline.

## Development

### Setup
```bash
# Frontend (TypeScript/React)
cd frontend
npm install

# Backend (Python/FastAPI)
cd backend
pip install -e .
```

### Run
```bash
# Frontend dev server
cd frontend
npm run dev

# Backend API
cd backend
uvicorn main:app --reload
```

### Test
```bash
# Frontend type check
cd frontend
npx tsc --noEmit

# Backend tests
cd backend
pytest
```

### Lint
```bash
# Frontend
cd frontend
npx eslint .

# Backend
cd backend
ruff check .
```

## Deployment
This repository is deployed via Render and/or Northflank.
