# downtime-platform

Consolidated downtime platform — merged from three source repositories.

## Subdirectory Layout

| Directory | Source Repo | Description |
|-----------|------------|-------------|
| `frontend/` | `downtime-app` | React/TypeScript frontend with Google OAuth, event discovery UI, and shadcn/ui components |
| `backend/` | `downtime-backend` | Python/FastAPI backend for event fetching, scoring, and caching |
| `config/` | `downtime-dfw` | DFW configuration and data pipeline with Express+React+Vite scaffold and SQLite event storage |

## Shared Schema

The canonical `shared/schema.ts` at the repo root reconciles the previously incompatible schemas from `downtime-app` and `downtime-dfw`:

- All Drizzle ORM table definitions from both sources (users, events, savedEvents, userSavedEvents, dismissedEvents, userPreferences, agentRuns)
- All Zod insert schemas
- API types (ApiEvent, City)

Both `frontend/shared/schema.ts` and `config/shared/schema.ts` are byte-identical copies of the root canonical schema.

## Backend API

The FastAPI backend (`backend/`) provides:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/events` | GET | Scored events for a city |
| `/api/events/scenarios` | GET | Events filtered by scenario |
| `/api/events/refresh` | POST | Force fresh fetch for a city |
| `/api/cities` | GET | List of supported cities |
| `/api/health` | GET | Health check |
| `/internal/events` | POST | Ingest events from external agents |

## Merge Details

- Merged via `git merge -s ours --allow-unrelated-histories` + `git read-tree --prefix` on 2026-06-29
- All git history from all three source repos preserved (49 total commits)
- Zero merge conflicts — files land in disjoint subdirectories
- Source repos archived: `downtime-app`, `downtime-backend`, `downtime-dfw`
- All git tags and branches preserved from all sources
