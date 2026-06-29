#!/usr/bin/env python3
"""
Fetch events for all configured cities.
Designed to run from GitHub Actions or directly.

Usage:
    python scripts/fetch_all_cities.py

Environment variables:
    BACKEND_URL     — URL of the running backend (e.g., https://downtime-api.up.railway.app)
    INCLUDE_GOOGLE  — Set to 'true' to include Google Events (weekly only)
    TM_API_KEY, SG_CLIENT_ID, SERPAPI_KEY, OTM_API_KEY — API keys
"""

import sys as _sys
import pathlib as _pathlib  # noqa: E402

_sys.path.insert(0, str(_pathlib.Path(__file__).resolve().parent.parent))
from motto_common.sentry_init import init_sentry  # was: import sentry_init
init_sentry(agent_name="downtime-backend")

import asyncio
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path

# Add parent directory to path so we can import our modules
sys.path.insert(0, str(Path(__file__).parent.parent))

import httpx

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("fetch_all")

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
INCLUDE_GOOGLE = os.getenv("INCLUDE_GOOGLE", "false").lower() == "true"

# Rate limit: don't hammer the backend
DELAY_BETWEEN_CITIES = 2  # seconds


async def refresh_city_via_api(
    client: httpx.AsyncClient, city: str, state: str, include_google: bool = False
) -> dict:
    """Call the backend's refresh endpoint for a single city."""
    params = {
        "city": city,
        "state": state,
        "include_google": str(include_google).lower(),
    }
    try:
        resp = await client.post(f"{BACKEND_URL}/api/events/refresh", params=params)
        resp.raise_for_status()
        data = resp.json()
        return {
            "city": city,
            "state": state,
            "status": "ok",
            "total_events": data.get("total", 0),
        }
    except httpx.HTTPStatusError as e:
        return {
            "city": city,
            "state": state,
            "status": "error",
            "error": f"HTTP {e.response.status_code}: {e.response.text[:200]}",
        }
    except Exception as e:
        return {
            "city": city,
            "state": state,
            "status": "error",
            "error": str(e),
        }


async def refresh_city_direct(
    city: str, state: str, lat: float, lon: float, include_google: bool = False
) -> dict:
    """Fetch events directly using Python modules (no running backend needed)."""
    from fetchers.ticketmaster import fetch_ticketmaster_events
    from fetchers.seatgeek import fetch_seatgeek_events
    from fetchers.serpapi_google import fetch_google_events
    from fetchers.opentripmap import fetch_opentripmap_places
    from scoring import score_events

    all_events = []
    sources_status = {}

    # Ticketmaster
    try:
        tm_events = await fetch_ticketmaster_events(
            city=city, state=state, lat=lat, lon=lon
        )
        all_events.extend(tm_events)
        sources_status["ticketmaster"] = len(tm_events)
    except Exception as e:
        sources_status["ticketmaster"] = f"error: {e}"

    # SeatGeek
    try:
        sg_events = await fetch_seatgeek_events(
            city=city, state=state, lat=lat, lon=lon
        )
        all_events.extend(sg_events)
        sources_status["seatgeek"] = len(sg_events)
    except Exception as e:
        sources_status["seatgeek"] = f"error: {e}"

    # OpenTripMap
    try:
        otm_events = await fetch_opentripmap_places(
            city=city, state=state, lat=lat, lon=lon, fetch_details=False
        )
        all_events.extend(otm_events)
        sources_status["opentripmap"] = len(otm_events)
    except Exception as e:
        sources_status["opentripmap"] = f"error: {e}"

    # Google Events (weekly only)
    if include_google:
        try:
            ge_events = await fetch_google_events(city=city, state=state)
            all_events.extend(ge_events)
            sources_status["google"] = len(ge_events)
        except Exception as e:
            sources_status["google"] = f"error: {e}"

    # Score
    scored = score_events(all_events, city_lat=lat, city_lon=lon)

    return {
        "city": city,
        "state": state,
        "status": "ok",
        "total_events": len(scored),
        "sources": sources_status,
    }


async def main():
    from cities import CITIES

    logger.info(f"Starting event fetch for {len(CITIES)} cities")
    logger.info(f"Backend URL: {BACKEND_URL}")
    logger.info(f"Include Google Events: {INCLUDE_GOOGLE}")

    start_time = time.time()
    results = []

    # Check if backend is reachable
    use_api = True
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"{BACKEND_URL}/api/health")
            if resp.status_code != 200:
                use_api = False
    except Exception:
        use_api = False

    if use_api:
        logger.info("Backend is reachable — using API refresh endpoint")
        async with httpx.AsyncClient(timeout=120) as client:
            for city in CITIES:
                logger.info(f"Refreshing {city.name}, {city.state}...")
                result = await refresh_city_via_api(
                    client, city.name, city.state, INCLUDE_GOOGLE
                )
                results.append(result)
                logger.info(
                    f"  → {result['status']}: {result.get('total_events', 0)} events"
                )
                await asyncio.sleep(DELAY_BETWEEN_CITIES)
    else:
        logger.info("Backend not reachable — running fetch directly")
        for city in CITIES:
            logger.info(f"Fetching {city.name}, {city.state}...")
            result = await refresh_city_direct(
                city.name, city.state, city.lat, city.lon, INCLUDE_GOOGLE
            )
            results.append(result)
            logger.info(
                f"  → {result['status']}: {result.get('total_events', 0)} events"
            )
            await asyncio.sleep(DELAY_BETWEEN_CITIES)

    elapsed = time.time() - start_time

    # Summary
    ok_count = sum(1 for r in results if r["status"] == "ok")
    error_count = sum(1 for r in results if r["status"] == "error")
    total_events = sum(r.get("total_events", 0) for r in results if r["status"] == "ok")

    logger.info("=" * 60)
    logger.info(f"Fetch complete in {elapsed:.1f}s")
    logger.info(f"Cities: {ok_count} OK, {error_count} errors")
    logger.info(f"Total events fetched: {total_events}")
    logger.info("=" * 60)

    # Save log
    log_dir = Path(__file__).parent.parent / "logs"
    log_dir.mkdir(exist_ok=True)
    log_file = log_dir / f"fetch_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    log_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "elapsed_seconds": round(elapsed, 1),
        "cities_ok": ok_count,
        "cities_error": error_count,
        "total_events": total_events,
        "include_google": INCLUDE_GOOGLE,
        "results": results,
    }
    with open(log_file, "w") as f:
        json.dump(log_data, f, indent=2)
    logger.info(f"Log saved to {log_file}")

    # Exit with error code if too many failures
    if error_count > len(CITIES) // 2:
        logger.error("More than half of cities failed — exiting with error")
        sys.exit(1)


if __name__ == "__main__":
    import sentry_sdk as _sentry_sdk

    try:
        asyncio.run(main())
    except Exception as _exc:
        _sentry_sdk.capture_exception(_exc)
        raise
