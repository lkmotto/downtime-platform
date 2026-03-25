# DownTime Backend

Python FastAPI backend for the DownTime event discovery app. Aggregates events from multiple free APIs, scores them for relevance, and serves them through a REST API.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FastAPI Server                     │
├──────────┬──────────┬────────────┬──────────────────┤
│ Ticket-  │ SeatGeek │  SerpAPI   │  OpenTripMap     │
│ master   │          │  Google    │  (POIs)          │
│ (daily)  │ (daily)  │  (weekly)  │  (cacheable)     │
└────┬─────┴────┬─────┴─────┬──────┴───────┬──────────┘
     │          │           │              │
     └──────────┴───────────┴──────────────┘
                       │
              ┌────────▼────────┐
              │  Scoring Engine │
              │  (0-100 score)  │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │  In-Memory      │
              │  Cache (6h TTL) │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │   REST API      │
              │   /api/events   │
              └─────────────────┘
```

## Quick Start

### 1. Clone and install

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env and add your API keys
```

### 3. Get free API keys

| Service | Free Tier | Sign Up |
|---------|-----------|---------|
| Ticketmaster | 5,000 calls/day | [developer.ticketmaster.com](https://developer.ticketmaster.com/) |
| SeatGeek | No published cap | [seatgeek.com/account/develop](https://seatgeek.com/account/develop) |
| SerpAPI | 250 searches/month | [serpapi.com](https://serpapi.com/) |
| OpenTripMap | 5,000 calls/day | [opentripmap.io](https://opentripmap.io/) |

### 4. Run the server

```bash
# Development (with auto-reload)
python main.py

# Or directly with uvicorn
uvicorn main:app --reload --port 8000
```

The API docs are available at: http://localhost:8000/docs

## API Endpoints

### GET /api/events
Get scored events for a city.

```
GET /api/events?city=Austin&state=TX
GET /api/events?city=Austin&state=TX&category=music&limit=20
```

**Parameters:**
- `city` (required) — City name
- `state` (required) — State code (e.g., TX)
- `lat`, `lon` (optional) — Coordinates, auto-resolved from city name
- `category` (optional) — Filter: music, sports, arts, food, outdoor, nightlife, film, festivals, photography, motorsports
- `limit` (optional, default 50) — Max events to return

### GET /api/events/scenarios
Get events filtered by scenario.

```
GET /api/events/scenarios?city=Austin&state=TX&scenario=date-night
```

**Scenarios:** `date-night`, `solo`, `weekend-adventure`, `travel`

### GET /api/cities
List all 50 supported US cities.

```
GET /api/cities
```

### POST /api/events/refresh
Force a fresh fetch for a city (bypasses cache).

```
POST /api/events/refresh?city=Austin&state=TX&include_google=false
```

### GET /api/health
Health check.

```
GET /api/health
```

## Scoring Engine

Events are scored 0–100 based on five factors:

| Factor | Max Points | Description |
|--------|-----------|-------------|
| Category match | 25 | How well the event category matches user interests |
| Camera value | 25 | Photography potential — outdoor, scenic, and visual events score higher |
| Price value | 20 | Free and affordable events score higher |
| Proximity | 15 | Distance from city center |
| Uniqueness | 15 | One-time events score higher than recurring/permanent |

Each event also gets:
- **Scenario**: `date-night`, `solo`, `weekend-adventure`, or `travel`
- **Camera-worthy**: Boolean + specific shot ideas
- **Featured**: Events scoring 80+ are flagged as featured

## Deployment

### Railway (recommended)

1. Push to GitHub
2. Connect your repo on [Railway](https://railway.app)
3. Add environment variables in Railway dashboard
4. Deploy — Railway auto-detects the Dockerfile

### Docker

```bash
docker build -t downtime-backend .
docker run -p 8000:8000 --env-file .env downtime-backend
```

## GitHub Actions (Daily Fetch)

The `.github/workflows/fetch-events.yml` workflow:
- Runs daily at 6 AM UTC
- Calls POST /api/events/refresh for each city
- Weekly Sunday run includes Google Events
- Can be triggered manually from the Actions tab

### Setup:
1. Add secrets in GitHub repo settings: `TM_API_KEY`, `SG_CLIENT_ID`, `SERPAPI_KEY`, `OTM_API_KEY`, `BACKEND_URL`
2. The workflow runs automatically on push

## Project Structure

```
backend/
├── main.py                 # FastAPI app + routes
├── config.py               # Environment config
├── models.py               # Pydantic data models
├── scoring.py              # Event scoring engine (0-100)
├── cache.py                # In-memory cache with TTL
├── cities.py               # Top 50 US cities
├── fetchers/
│   ├── __init__.py
│   ├── ticketmaster.py     # Ticketmaster Discovery API
│   ├── seatgeek.py         # SeatGeek API
│   ├── serpapi_google.py   # Google Events via SerpAPI
│   └── opentripmap.py      # OpenTripMap POIs
├── scripts/
│   └── fetch_all_cities.py # Batch fetch script for GH Actions
├── .github/
│   └── workflows/
│       └── fetch-events.yml
├── .env.example
├── requirements.txt
├── Dockerfile
├── Procfile
├── railway.json
├── nixpacks.toml
└── README.md
```

## Design Decisions

1. **httpx (async)** for all API calls — concurrent fetching from 3-4 sources
2. **In-memory cache** with 6-hour TTL — no database for MVP, refreshed daily
3. **Graceful degradation** — if one API fails, others still return data
4. **Lightweight** — fits Railway free tier (512MB RAM)
5. **Rate-limit aware** — SerpAPI (250/month) used weekly only; Ticketmaster (5K/day) and OpenTripMap (5K/day) used daily
6. **CORS enabled** for Netlify frontend
