"""
DownTime Backend — FastAPI server for event discovery.

API Routes:
    GET  /api/events           — Scored events for a city
    GET  /api/events/scenarios — Events filtered by scenario
    GET  /api/cities           — List of supported cities
    POST /api/events/refresh   — Trigger a fresh fetch for a city
    GET  /api/health           — Health check
"""
import sentry_init  # noqa: E402,F401

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS, HOST, PORT, ENV
from models import Event, EventsResponse, CityResponse, HealthResponse
from cities import get_city, get_all_cities, CITIES
from cache import event_cache
from scoring import score_events
from fetchers.ticketmaster import fetch_ticketmaster_events
from fetchers.seatgeek import fetch_seatgeek_events
from fetchers.serpapi_google import fetch_google_events
from fetchers.opentripmap import fetch_opentripmap_places

# ──────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO if ENV == "production" else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("downtime")


# ──────────────────────────────────────────────
# Lifespan (startup/shutdown)
# ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — runs on startup and shutdown."""
    logger.info("DownTime backend starting up")
    logger.info(f"Environment: {ENV}")
    logger.info(f"Supported cities: {len(CITIES)}")
    yield
    logger.info("DownTime backend shutting down")
    event_cache.clear()


# ──────────────────────────────────────────────
# App
# ──────────────────────────────────────────────

app = FastAPI(
    title="DownTime API",
    description="AI-powered local event discovery — find the best ways to spend your free time.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Internal helpers
# ──────────────────────────────────────────────

async def _fetch_all_events(city: str, state: str, lat: float, lon: float, include_google: bool = False) -> list[Event]:
    """Fetch events from all sources concurrently."""
    tasks = [
        fetch_ticketmaster_events(city=city, state=state, lat=lat, lon=lon),
        fetch_seatgeek_events(city=city, state=state, lat=lat, lon=lon),
        fetch_opentripmap_places(city=city, state=state, lat=lat, lon=lon, fetch_details=True),
    ]

    if include_google:
        tasks.append(fetch_google_events(city=city, state=state))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    all_events: list[Event] = []
    source_names = ["ticketmaster", "seatgeek", "opentripmap"]
    if include_google:
        source_names.append("google")

    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.error(f"Fetch error from {source_names[i]}: {result}")
            continue
        if isinstance(result, list):
            all_events.extend(result)
            logger.info(f"{source_names[i]}: {len(result)} events")

    return all_events


def _deduplicate_events(events: list[Event]) -> list[Event]:
    """Remove duplicate events based on title + date + venue similarity."""
    seen: dict[str, Event] = {}

    for event in events:
        # Create a dedup key from normalized title + date + venue
        title_norm = event.title.lower().strip()[:50]
        date_norm = (event.date_start or "")[:10]
        venue_norm = event.venue.lower().strip()[:30]
        dedup_key = f"{title_norm}|{date_norm}|{venue_norm}"

        if dedup_key not in seen:
            seen[dedup_key] = event
        else:
            # Keep the one with more data (prefer ticketmaster > seatgeek > google > opentripmap)
            source_priority = {"ticketmaster": 4, "seatgeek": 3, "google": 2, "opentripmap": 1}
            existing = seen[dedup_key]
            if source_priority.get(event.source, 0) > source_priority.get(existing.source, 0):
                seen[dedup_key] = event

    return list(seen.values())


# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────

@app.get("/api/events", response_model=EventsResponse)
async def get_events(
    city: str = Query(..., description="City name (e.g., 'Austin')"),
    state: str = Query(..., description="State code (e.g., 'TX')"),
    lat: float | None = Query(None, description="Latitude (optional, auto-resolved from city)"),
    lon: float | None = Query(None, description="Longitude (optional, auto-resolved from city)"),
    category: str | None = Query(None, description="Filter by category"),
    limit: int = Query(50, ge=1, le=200, description="Max events to return"),
):
    """
    Get scored and sorted events for a city.

    Events are fetched from Ticketmaster, SeatGeek, and OpenTripMap,
    then scored, deduplicated, and sorted by relevance score.
    Results are cached for 6 hours.
    """
    # Resolve coordinates if not provided
    city_obj = get_city(city, state)
    if lat is None or lon is None:
        if city_obj:
            lat = city_obj.lat
            lon = city_obj.lon
        else:
            raise HTTPException(
                status_code=400,
                detail=f"City '{city}, {state}' not found. Provide lat/lon or use a supported city.",
            )

    # Check cache
    cached = event_cache.get(city, state)
    if cached is not None:
        # Apply category filter if specified
        events = cached
        if category:
            events = [e for e in events if e.category == category.lower()]
        return EventsResponse(
            events=events[:limit],
            total=len(events),
            city=city,
            state=state,
            cached=True,
        )

    # Fetch fresh data
    raw_events = await _fetch_all_events(city, state, lat, lon)

    # Deduplicate
    deduped = _deduplicate_events(raw_events)

    # Score and sort
    scored = score_events(deduped, city_lat=lat, city_lon=lon)

    # Cache the full result
    event_cache.set(city, state, scored)

    # Apply category filter
    events = scored
    if category:
        events = [e for e in events if e.category == category.lower()]

    return EventsResponse(
        events=events[:limit],
        total=len(events),
        city=city,
        state=state,
        cached=False,
    )


@app.get("/api/events/scenarios", response_model=EventsResponse)
async def get_events_by_scenario(
    city: str = Query(..., description="City name"),
    state: str = Query(..., description="State code"),
    scenario: str = Query(..., description="Scenario: date-night, solo, weekend-adventure, travel"),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Get events filtered by scenario (date-night, solo, weekend-adventure, travel).

    Uses the same cached data as /api/events — if no cache exists, triggers a fresh fetch.
    """
    valid_scenarios = {"date-night", "solo", "weekend-adventure", "travel"}
    if scenario not in valid_scenarios:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid scenario '{scenario}'. Must be one of: {', '.join(valid_scenarios)}",
        )

    city_obj = get_city(city, state)
    lat = city_obj.lat if city_obj else 0.0
    lon = city_obj.lon if city_obj else 0.0

    # Check cache first
    cached = event_cache.get(city, state)
    if cached is None:
        if not city_obj:
            raise HTTPException(status_code=400, detail=f"City '{city}, {state}' not found.")
        # Fetch and cache
        raw_events = await _fetch_all_events(city, state, lat, lon)
        deduped = _deduplicate_events(raw_events)
        cached = score_events(deduped, city_lat=lat, city_lon=lon)
        event_cache.set(city, state, cached)

    # Filter by scenario
    filtered = [e for e in cached if e.scenario == scenario]

    return EventsResponse(
        events=filtered[:limit],
        total=len(filtered),
        city=city,
        state=state,
        cached=True,
    )


@app.get("/api/cities", response_model=CityResponse)
async def list_cities():
    """Return list of all supported cities with coordinates."""
    cities = get_all_cities()
    return CityResponse(cities=cities, total=len(cities))


@app.post("/api/events/refresh", response_model=EventsResponse)
async def refresh_events(
    city: str = Query(..., description="City name"),
    state: str = Query(..., description="State code"),
    include_google: bool = Query(False, description="Include SerpAPI Google Events (costs 1 of 250/month)"),
):
    """
    Force a fresh fetch for a city, bypassing cache.

    Designed to be called by GitHub Actions daily cron or manually.
    Set include_google=true for weekly refreshes that include Google Events.
    """
    city_obj = get_city(city, state)
    if not city_obj:
        raise HTTPException(status_code=400, detail=f"City '{city}, {state}' not found in supported cities.")

    # Invalidate existing cache
    event_cache.invalidate_city(city, state)

    # Fetch fresh from all sources
    raw_events = await _fetch_all_events(
        city, state, city_obj.lat, city_obj.lon,
        include_google=include_google,
    )

    # Deduplicate and score
    deduped = _deduplicate_events(raw_events)
    scored = score_events(deduped, city_lat=city_obj.lat, city_lon=city_obj.lon)

    # Cache
    event_cache.set(city, state, scored)

    return EventsResponse(
        events=scored[:100],
        total=len(scored),
        city=city,
        state=state,
        cached=False,
    )


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        version="0.1.0",
        cache_size=event_cache.size,
        supported_cities=len(CITIES),
    )


# ──────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import sentry_sdk as _sentry_sdk
    try:
        import uvicorn
        uvicorn.run("main:app", host=HOST, port=PORT, reload=(ENV != "production"))
    except Exception as _exc:
        _sentry_sdk.capture_exception(_exc)
        raise

