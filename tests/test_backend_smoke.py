"""
Smoke tests for the downtime-platform backend.

Tests cover:
- Model instantiation and validation (Pydantic models)
- City lookup functions
- Event cache operations
- Scoring engine pure functions
"""

import time
from datetime import datetime

import pytest

from models import Event, City, UserPreferences, EventsResponse, CityResponse, HealthResponse
from cities import get_city, get_all_cities, CITIES
from cache import EventCache
from scoring import (
    score_event,
    score_events,
    _parse_price_value,
    _haversine_km,
    _score_category_match,
    _score_camera_value,
    _score_price_value,
    _score_proximity,
    _score_uniqueness,
    _assign_scenario,
    _assign_camera,
)


# ──────────────────────────────────────────────
# helper
# ──────────────────────────────────────────────

def _make_event(
    id: str = "evt-1",
    title: str = "Test Event",
    source: str = "ticketmaster",
    category: str = "music",
    lat: float = 32.7767,
    lon: float = -96.7970,
    price_range: str = "free",
    camera_worthy: bool = False,
    camera_note: str | None = None,
    date_start: str | None = None,
    description: str = "",
    tags: list[str] | None = None,
    venue: str = "",
    time_info: str = "",
) -> Event:
    return Event(
        id=id,
        title=title,
        source=source,
        category=category,
        lat=lat,
        lon=lon,
        price_range=price_range,
        camera_worthy=camera_worthy,
        camera_note=camera_note,
        date_start=date_start,
        description=description,
        tags=tags or [],
        venue=venue,
        time_info=time_info,
    )


# ──────────────────────────────────────────────
# 1. Pydantic model smoke
# ──────────────────────────────────────────────


class TestEventModel:
    """Minimal model instantiation and default-value tests."""

    def test_event_creation_minimal(self):
        e = Event(id="abc", title="A Show", source="seatgeek")
        assert e.id == "abc"
        assert e.title == "A Show"
        assert e.source == "seatgeek"
        assert e.score == 0
        assert e.category == ""
        assert e.scenario == ""
        assert e.tags == []
        assert isinstance(e.created_at, datetime)

    def test_event_creation_full(self):
        e = Event(
            id="full-1",
            title="Full Event",
            description="An event with every field",
            category="outdoor",
            scenario="weekend-adventure",
            source="ticketmaster",
            source_url="https://example.com",
            venue="Central Park",
            address="123 Main St",
            city="New York",
            state="NY",
            lat=40.7128,
            lon=-74.0060,
            date_start="2025-07-04",
            date_end="2025-07-05",
            time_info="10:00 AM - 6:00 PM",
            price_range="$25",
            price_note="Early bird available",
            image_url="https://img.example.com/e.jpg",
            camera_worthy=True,
            camera_note="Great golden hour spot",
            tags=["outdoor", "summer", "free"],
            score=85,
            is_featured=True,
        )
        assert e.id == "full-1"
        assert e.tags == ["outdoor", "summer", "free"]
        assert e.lat == 40.7128
        assert e.score == 85
        assert e.is_featured is True

    def test_event_model_validation_invalid_type(self):
        """score must be int — passing a float should coerce (pydantic v2 lenient)."""
        e = Event(id="x", title="T", source="s", score=90.0)
        assert isinstance(e.score, int)
        # A fully invalid type should raise
        with pytest.raises(Exception):
            Event(id="bad", title="B", source="s", score="not-a-number")

    def test_city_model(self):
        c = City(name="Dallas", state="TX", lat=32.7767, lon=-96.7970)
        assert c.name == "Dallas"
        assert c.state == "TX"
        assert c.lat == 32.7767
        assert c.lon == -96.7970

    def test_user_preferences_model(self):
        up = UserPreferences(
            user_id="user-1",
            city="Austin, TX",
            interests=["motorsports", "drone"],
            saved_events=["evt-1", "evt-2"],
            dismissed_events=["evt-3"],
        )
        assert up.user_id == "user-1"
        assert len(up.interests) == 2
        assert len(up.saved_events) == 2
        assert len(up.dismissed_events) == 1

    def test_response_models(self):
        e = _make_event()
        er = EventsResponse(events=[e], total=1, city="Dallas", state="TX", cached=False)
        assert er.total == 1
        assert er.cached is False

        c = City(name="Dallas", state="TX", lat=32.7767, lon=-96.7970)
        cr = CityResponse(cities=[c], total=1)
        assert cr.total == 1

        hr = HealthResponse(status="healthy", version="1.0", cache_size=0, supported_cities=50)
        assert hr.status == "healthy"


# ──────────────────────────────────────────────
# 2. Cities module
# ──────────────────────────────────────────────


class TestCities:
    def test_get_all_cities_returns_50(self):
        cities = get_all_cities()
        assert len(cities) == 50
        assert all(isinstance(c, City) for c in cities)

    def test_get_city_found_exact(self):
        c = get_city("Dallas", "TX")
        assert c is not None
        assert c.name == "Dallas"
        assert c.state == "TX"
        assert c.lat == 32.7767
        assert c.lon == -96.7970

    def test_get_city_case_insensitive(self):
        c = get_city("austin", "tx")
        assert c is not None
        assert c.name == "Austin"

    def test_get_city_not_found(self):
        assert get_city("FakeCity", "ZZ") is None

    def test_get_city_without_state(self):
        c = get_city("chicago")
        assert c is not None
        assert c.name == "Chicago"

    def test_cities_list_contains_known(self):
        names = {c.name for c in CITIES}
        assert "New York" in names
        assert "Los Angeles" in names
        assert "Austin" in names
        assert "Seattle" in names


# ──────────────────────────────────────────────
# 3. EventCache
# ──────────────────────────────────────────────


class TestEventCache:
    def test_set_and_get(self):
        cache = EventCache(default_ttl=3600)
        cache.set("dallas", "tx", [{"id": 1}])
        assert cache.get("dallas", "tx") == [{"id": 1}]

    def test_get_miss(self):
        cache = EventCache()
        assert cache.get("nonexistent", "xx") is None

    def test_expiration(self):
        cache = EventCache(default_ttl=0)
        cache.set("dallas", "tx", [{"id": 1}])
        time.sleep(0.01)
        assert cache.get("dallas", "tx") is None

    def test_invalidate(self):
        cache = EventCache()
        cache.set("austin", "tx", [1, 2, 3])
        assert cache.size == 1
        cache.invalidate("austin", "tx")
        assert cache.size == 0
        assert cache.get("austin", "tx") is None

    def test_invalidate_city_removes_all_entries(self):
        cache = EventCache()
        cache.set("dallas", "tx", [1], suffix="main")
        cache.set("dallas", "tx", [2], suffix="scenario")
        cache.set("austin", "tx", [3])
        assert cache.size == 3
        cache.invalidate_city("dallas", "tx")
        assert cache.size == 1
        assert cache.get("austin", "tx") == [3]

    def test_clear(self):
        cache = EventCache()
        cache.set("a", "b", [1])
        cache.set("c", "d", [2])
        cache.clear()
        assert cache.size == 0

    def test_cleanup_expired(self):
        cache = EventCache(default_ttl=0)
        cache.set("a", "b", [1])
        time.sleep(0.01)
        cache.cleanup_expired()
        assert cache.size == 0

    def test_make_key_format(self):
        cache = EventCache()
        # _make_key is private but we can test via set/get pattern
        cache.set("Austin", "TX", [1])
        # get with different casing should still hit
        assert cache.get("austin", "tx") == [1]


# ──────────────────────────────────────────────
# 4. Scoring engine — individual helpers
# ──────────────────────────────────────────────


class TestParsePriceValue:
    def test_free(self):
        assert _parse_price_value("free") == 0.0
        assert _parse_price_value("$0") == 0.0

    def test_unknown(self):
        assert _parse_price_value("unknown") is None
        assert _parse_price_value("varies") is None
        assert _parse_price_value("see link") is None

    def test_dollar_value(self):
        assert _parse_price_value("$25") == 25.0
        assert _parse_price_value("$10.50") == 10.5

    def test_numeric_only(self):
        assert _parse_price_value("35") == 35.0

    def test_empty_string(self):
        assert _parse_price_value("") is None


class TestHaversine:
    def test_same_point(self):
        assert _haversine_km(0, 0, 0, 0) == 0.0

    def test_ny_to_la(self):
        d = _haversine_km(40.7128, -74.0060, 34.0522, -118.2437)
        assert 3900 < d < 4000

    def test_dallas_to_austin(self):
        d = _haversine_km(32.7767, -96.7970, 30.2672, -97.7431)
        assert 290 < d < 310


class TestScoreCategory:
    def test_popular_category_gets_baseline(self):
        s = _score_category_match(_make_event(category="music"))
        assert s == 20

    def test_obscure_category_gets_default(self):
        s = _score_category_match(_make_event(category="unknown-cat"))
        assert s == 12

    def test_direct_match(self):
        s = _score_category_match(_make_event(category="music"), user_interests=["music"])
        assert s == 25

    def test_related_match(self):
        s = _score_category_match(_make_event(category="nightlife"), user_interests=["music"])
        assert s == 15

    def test_no_match_with_interests(self):
        s = _score_category_match(_make_event(category="sports"), user_interests=["music", "arts"])
        assert s == 5


class TestScoreCamera:
    def test_not_camera_worthy(self):
        e = _make_event(camera_worthy=False)
        assert _score_camera_value(e) == 5

    def test_camera_worthy_category(self):
        e = _make_event(category="outdoor", camera_worthy=True)
        s = _score_camera_value(e)
        assert s >= 15

    def test_visual_keyword_bonuses(self):
        e = _make_event(
            category="outdoor",
            camera_worthy=True,
            title="Sunset at the Waterfront",
        )
        s = _score_camera_value(e)
        assert s >= 17  # 15 base + at least 2 for "sunset"


class TestScorePrice:
    def test_free_is_max(self):
        assert _score_price_value(_make_event(price_range="free")) == 20
        assert _score_price_value(_make_event(price_range="$0")) == 20

    def test_unknown_is_neutral(self):
        assert _score_price_value(_make_event(price_range="unknown")) == 10

    def test_cheap(self):
        assert _score_price_value(_make_event(price_range="$10")) == 18

    def test_expensive(self):
        assert _score_price_value(_make_event(price_range="$500")) == 3


class TestScoreProximity:
    def test_close_to_center(self):
        e = _make_event(lat=32.7767, lon=-96.7970)
        s = _score_proximity(e, 32.7767, -96.7970)
        assert s == 15

    def test_within_5km(self):
        # ~2.8 km north of Dallas center
        e = _make_event(lat=32.8019, lon=-96.7970)
        s = _score_proximity(e, 32.7767, -96.7970)
        assert s == 15

    def test_far_away(self):
        e = _make_event(lat=29.7604, lon=-95.3698)  # Houston
        s = _score_proximity(e, 32.7767, -96.7970)  # vs Dallas
        assert s <= 4

    def test_unknown_location(self):
        e = _make_event(lat=0.0, lon=0.0)
        s = _score_proximity(e, 32.7767, -96.7970)
        assert s == 8


class TestScoreUniqueness:
    def test_festival_bonus(self):
        e = _make_event(title="Summer Festival", description="An annual celebration")
        s = _score_uniqueness(e)
        assert s > 8  # base 8 + festival keyword

    def test_recurring_penalty(self):
        e = _make_event(description="Every week we host this recurring event")
        s = _score_uniqueness(e)
        assert s < 8

    def test_opentripmap_source_penalty(self):
        e = _make_event(source="opentripmap")
        s = _score_uniqueness(e)
        assert s <= 5  # base 8 - 3 for opentripmap

    def test_dated_event_bonus(self):
        e = _make_event(date_start="2025-07-04")
        s = _score_uniqueness(e)
        assert s >= 10  # base 8 + 2 for having a date


class TestAssignScenario:
    def test_date_night_by_category(self):
        e = _make_event(category="music", title="Jazz Night")
        assert _assign_scenario(e) == "date-night"

    def test_outdoor_without_keywords_defaults_to_first_match(self):
        # "outdoor" category matches both solo and weekend-adventure (3 pts each).
        # When tied, max() on dict returns first key — "solo" wins.
        e = _make_event(category="outdoor")
        assert _assign_scenario(e) == "solo"

    def test_solo_default(self):
        e = _make_event(category="photography")
        assert _assign_scenario(e) == "solo"

    def test_keyword_hike_trail_match(self):
        # "hike" and "trail" are solo keywords → +2+2=4, "adventure" is weekend → +2
        # solo: 3 (category) + 4 (keywords) = 7
        # weekend-adventure: 3 (category) + 2 (keywords) = 5
        # solo wins
        e = _make_event(
            category="outdoor",
            title="Mountain Hike Adventure",
            description="Great hike with trails",
        )
        assert _assign_scenario(e) == "solo"

    def test_weekend_keyword_wins(self):
        # Pure weekend keywords with an outdoor category
        e = _make_event(
            category="outdoor",
            title="Kayak Festival Weekend Camping Trip",
            description="Kayak and camp at the lake",
        )
        # "kayak", "camping", "lake" = weekend keywords → +6
        # weekend-adventure: 3 + 6 = 9 → wins
        assert _assign_scenario(e) == "weekend-adventure"

    def test_date_night_time_hints(self):
        e = _make_event(
            category="music",
            title="Evening Jazz",
            time_info="8:00 PM - 11:00 PM",
        )
        # "music" → date-night category match +3, "jazz" keyword +2, "pm" time hint +1
        assert _assign_scenario(e) == "date-night"


class TestAssignCamera:
    def test_already_assigned(self):
        e = _make_event(camera_worthy=True, camera_note="A great spot!")
        worthy, note = _assign_camera(e)
        assert worthy is True
        assert note == "A great spot!"

    def test_outdoor_category_is_worthy(self):
        e = _make_event(category="outdoor", camera_worthy=False)
        worthy, note = _assign_camera(e)
        assert worthy is True
        assert note is not None

    def test_non_worthy_category(self):
        e = _make_event(category="motorsports", camera_worthy=False)
        worthy, note = _assign_camera(e)
        assert worthy is False
        assert note is None

    def test_keyword_makes_worthy(self):
        e = _make_event(
            category="nightlife",
            camera_worthy=False,
            title="Sunset Rooftop Party",
        )
        worthy, note = _assign_camera(e)
        assert worthy is True


class TestScoreEvent:
    """Integration-level: score a single event end-to-end."""

    def test_score_event_returns_in_range(self):
        e = _make_event(
            category="music",
            camera_worthy=True,
            camera_note="Great lighting",
            price_range="free",
        )
        scored = score_event(e, city_lat=32.7767, city_lon=-96.7970)
        assert 0 <= scored.score <= 100
        assert scored.scenario != ""
        assert isinstance(scored.is_featured, bool)

    def test_high_value_event_is_featured(self):
        e = _make_event(
            category="festivals",
            camera_worthy=True,
            camera_note="Amazing photo ops",
            price_range="free",
            title="Summer Festival Sunset",
            date_start="2025-07-04",
        )
        scored = score_event(e, city_lat=32.7767, city_lon=-96.7970)
        # A free festival with camera value near city center should score well
        assert scored.score >= 50

    def test_score_preserves_original_fields(self):
        e = _make_event(id="keep-1", title="Keep Me")
        scored = score_event(e)
        assert scored.id == "keep-1"
        assert scored.title == "Keep Me"
        assert scored.source == "ticketmaster"


class TestScoreEvents:
    def test_batch_scores_and_sorts(self):
        e1 = _make_event(id="a", title="Free Festival", category="festivals", price_range="free", camera_worthy=True)
        e2 = _make_event(id="b", title="Expensive Dinner", category="food", price_range="$200")
        result = score_events([e1, e2], city_lat=32.7767, city_lon=-96.7970)
        assert len(result) == 2
        assert result[0].score >= result[1].score
        # The free festival should rank above the expensive dinner
        assert result[0].id == "a"

    def test_empty_list(self):
        assert score_events([]) == []
