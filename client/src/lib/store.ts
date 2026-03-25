import { useState, useCallback, useEffect, createContext, useContext } from "react";
import type { Event, City, Scenario, Category } from "./types";
import { TOP_CITIES } from "./types";

// Demo events — the backend agent will replace these with real API data
const DEMO_EVENTS: Event[] = [];

interface AppState {
  city: City | null;
  scenario: Scenario;
  category: Category;
  events: Event[];
  savedEventIds: Set<string>;
  dismissedEventIds: Set<string>;
  isLoading: boolean;
  searchQuery: string;
  userInterests: string[];
  isOnboarded: boolean;
}

interface AppActions {
  setCity: (city: City) => void;
  setScenario: (s: Scenario) => void;
  setCategory: (c: Category) => void;
  setSearchQuery: (q: string) => void;
  toggleSave: (eventId: string) => void;
  dismissEvent: (eventId: string) => void;
  setInterests: (interests: string[]) => void;
  completeOnboarding: (city: City, interests: string[]) => void;
  filteredEvents: Event[];
  savedEvents: Event[];
  featuredEvents: Event[];
}

type Store = AppState & AppActions;

const StoreContext = createContext<Store | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}

export function useStoreProvider(): Store {
  const [city, setCityState] = useState<City | null>(null);
  const [scenario, setScenario] = useState<Scenario>("all");
  const [category, setCategory] = useState<Category>("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [dismissedEventIds, setDismissedEventIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userInterests, setInterests] = useState<string[]>([]);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const setCity = useCallback((c: City) => {
    setCityState(c);
    setIsLoading(true);
    // In production, this would call the backend API
    // For now, generate city-specific demo data
    setTimeout(() => {
      setEvents(generateDemoEvents(c));
      setIsLoading(false);
    }, 800);
  }, []);

  const toggleSave = useCallback((eventId: string) => {
    setSavedEventIds(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  }, []);

  const dismissEvent = useCallback((eventId: string) => {
    setDismissedEventIds(prev => new Set(prev).add(eventId));
  }, []);

  const completeOnboarding = useCallback((c: City, interests: string[]) => {
    setCityState(c);
    setInterests(interests);
    setIsOnboarded(true);
    setIsLoading(true);
    setTimeout(() => {
      setEvents(generateDemoEvents(c));
      setIsLoading(false);
    }, 800);
  }, []);

  const filteredEvents = events.filter(e => {
    if (dismissedEventIds.has(e.id)) return false;
    if (scenario !== "all" && e.scenario !== scenario) return false;
    if (category !== "all" && e.category !== category) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return e.title.toLowerCase().includes(q) ||
             e.description.toLowerCase().includes(q) ||
             e.venue.toLowerCase().includes(q) ||
             e.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  }).sort((a, b) => b.score - a.score);

  const savedEvents = events.filter(e => savedEventIds.has(e.id));
  const featuredEvents = events.filter(e => e.is_featured && !dismissedEventIds.has(e.id)).slice(0, 4);

  return {
    city, scenario, category, events, savedEventIds, dismissedEventIds,
    isLoading, searchQuery, userInterests, isOnboarded,
    setCity, setScenario, setCategory, setSearchQuery,
    toggleSave, dismissEvent, setInterests, completeOnboarding,
    filteredEvents, savedEvents, featuredEvents,
  };
}

export { StoreContext };

// Generate demo events for any city
function generateDemoEvents(city: City): Event[] {
  const now = new Date();
  const categories = ["music", "arts", "food", "outdoor", "nightlife", "sports", "film", "festivals", "photography", "motorsports"];
  const scenarios: ("date-night" | "solo" | "weekend-adventure" | "travel")[] = ["date-night", "solo", "weekend-adventure", "travel"];

  const templates = [
    { title: `Live Jazz at The Blue Room`, cat: "music", scenario: "date-night", venue: `The Blue Room`, desc: "Intimate jazz trio performing standards and originals. Full bar, dim lighting, perfect for date night. Local musicians at their best.", price: "$15-25", camera: true, cameraN: "Low-light performance shots. Bring a fast prime (f/1.4). Candlelit ambiance, saxophone silhouettes.", tags: ["jazz", "live-music", "intimate", "cocktails"] },
    { title: `${city.name} Street Art Walk`, cat: "arts", scenario: "solo", venue: `Downtown ${city.name}`, desc: "Self-guided walking tour through the city's best murals, installations, and hidden art. Free, always open, endlessly photogenic.", price: "Free", camera: true, cameraN: "Wide-angle for full murals. Golden hour light on textured walls. Details and textures for Instagram grid.", tags: ["street-art", "murals", "walking", "free", "photography"] },
    { title: `Sunset Kayaking`, cat: "outdoor", scenario: "weekend-adventure", venue: `Lakeside Marina`, desc: "Rent kayaks for a sunset paddle. Calm water, wildlife, stunning light. Bring someone or go solo — either way it's magic.", price: "$20-35/hr", camera: true, cameraN: "GoPro for on-water POV. Drone for aerial lake shots at golden hour. Waterproof housing recommended.", tags: ["kayaking", "sunset", "water", "nature", "adventure"] },
    { title: `Farmers Market & Food Truck Rally`, cat: "food", scenario: "solo", venue: `City Square`, desc: "Local vendors, artisan foods, live acoustic music. Great coffee, better people-watching. Most vendors have GF options.", price: "$5-20", camera: true, cameraN: "Food styling shots at vendor stalls. Wide shots of the crowd. Morning light is soft and flattering.", tags: ["food", "market", "local", "free-entry", "morning"] },
    { title: `Rooftop Comedy Night`, cat: "nightlife", scenario: "date-night", venue: `The High Note`, desc: "Stand-up comedy on a rooftop with city views. 2-drink minimum. Three comics, each doing 20 minutes. Rotating lineup weekly.", price: "$25-40", camera: false, cameraN: null, tags: ["comedy", "rooftop", "nightlife", "drinks", "views"] },
    { title: `Cars & Coffee Monthly Meet`, cat: "motorsports", scenario: "solo", venue: `Speedway Plaza`, desc: "Massive monthly car meet. Exotics, JDM, classic muscle, custom builds. Free entry, food trucks. Arrive early for the best light.", price: "Free", camera: true, cameraN: "Golden hour on chrome and exotic paint. Low-angle shots for drama. Rolling shots in the parking lot. 70-200mm for details.", tags: ["cars", "automotive", "free", "morning", "photography"] },
    { title: `Indie Film Screening`, cat: "film", scenario: "date-night", venue: `The Reel Theater`, desc: "Curated indie film followed by filmmaker Q&A. Historic Art Deco venue. Craft cocktails in the lobby bar.", price: "$12-18", camera: true, cameraN: "Art Deco interior, neon marquee, vintage lobby. Architectural photography gold. Ask about filming rules inside.", tags: ["film", "indie", "cinema", "date-night", "historic"] },
    { title: `Weekend Hiking — Scenic Overlook Trail`, cat: "outdoor", scenario: "weekend-adventure", venue: `State Park`, desc: "8-mile loop with three scenic overlooks. Moderate difficulty, stunning views. Pack lunch and water. Best in morning light.", price: "$5-10 parking", camera: true, cameraN: "Panoramic landscape from the overlooks. Drone territory. Time-lapse the clouds rolling through the valley. Tripod recommended.", tags: ["hiking", "nature", "views", "exercise", "photography"] },
    { title: `Gallery Opening — New Exhibit`, cat: "arts", scenario: "date-night", venue: `Modern Art Gallery`, desc: "Opening night with free wine, artist meet-and-greet. Contemporary mixed media. Sophisticated but not stuffy.", price: "Free", camera: true, cameraN: "Gallery lighting is flattering. Permission usually given for non-flash photography. Great for portfolio diversity.", tags: ["art", "gallery", "free", "wine", "opening"] },
    { title: `Live Music Festival`, cat: "festivals", scenario: "weekend-adventure", venue: `${city.name} Fairgrounds`, desc: "Three stages, 20+ bands, food village, craft beer garden. All-day event with headliners at sunset. The annual don't-miss.", price: "$45-80", camera: true, cameraN: "Stage shots with colored lighting at night. Festival crowd energy. Wide-angle for the whole scene. Earplugs and fast lens.", tags: ["festival", "live-music", "all-day", "beer", "outdoor"] },
    { title: `Food Hall Crawl`, cat: "food", scenario: "date-night", venue: `The Market Hall`, desc: "Upscale food hall with 15 vendors. Share dishes, try everything. Great date move — no commitment to one cuisine.", price: "$15-30/person", camera: false, cameraN: null, tags: ["food", "variety", "date-night", "indoor"] },
    { title: `Drone Pilots Meetup`, cat: "photography", scenario: "solo", venue: `Lakeside Park`, desc: "Monthly gathering for drone pilots. Fly, race, share tips. All skill levels welcome. Bring your rig and spare batteries.", price: "Free", camera: true, cameraN: "Obviously — it's a drone meetup. Aerial lake shots, FPV racing footage. Bring every camera you own.", tags: ["drone", "photography", "meetup", "free", "tech"] },
    { title: `Vintage Flea Market`, cat: "festivals", scenario: "solo", venue: `Old Town District`, desc: "Monthly vintage market. Records, cameras, furniture, clothing. Early birds get the best finds. Cash preferred at most booths.", price: "Free entry", camera: true, cameraN: "Texture shots of vintage objects. Film camera collection details. Street photography of the crowd.", tags: ["vintage", "market", "shopping", "free", "finds"] },
    { title: `Yoga in the Park`, cat: "outdoor", scenario: "solo", venue: `Central Park`, desc: "Free community yoga every Saturday morning. All levels. Bring a mat. Great way to start the weekend and meet people.", price: "Free", camera: false, cameraN: null, tags: ["yoga", "fitness", "free", "morning", "community"] },
    { title: `Craft Brewery Tour`, cat: "food", scenario: "weekend-adventure", venue: `Brewery District`, desc: "Self-guided tour of 5 craft breweries within walking distance. Flights and tastings at each. Saturday afternoons are liveliest.", price: "$25-50", camera: true, cameraN: "Industrial brewery interiors. Beer pour shots with backlighting. Behind-the-scenes brewing process.", tags: ["beer", "brewery", "walking", "tasting", "social"] },
  ];

  return templates.map((t, i) => {
    const dayOffset = Math.floor(Math.random() * 10);
    const eventDate = new Date(now);
    eventDate.setDate(eventDate.getDate() + dayOffset);

    return {
      id: `${city.name.toLowerCase().replace(/\s/g, '-')}-${i}-${Date.now()}`,
      title: t.title,
      description: t.desc,
      category: t.cat,
      scenario: t.scenario,
      source: ["ticketmaster", "seatgeek", "google", "opentripmap"][i % 4],
      source_url: "#",
      venue: t.venue,
      address: `${100 + i * 37} Main St`,
      city: city.name,
      state: city.state_code,
      lat: city.lat + (Math.random() - 0.5) * 0.1,
      lon: city.lon + (Math.random() - 0.5) * 0.1,
      date_start: eventDate.toISOString(),
      date_end: null,
      time_info: ["7pm-10pm", "8am-12pm", "6pm-9pm", "10am-5pm", "9pm-1am"][i % 5],
      price_range: t.price,
      price_note: t.price === "Free" ? "No cost" : "Per person",
      image_url: null,
      camera_worthy: t.camera,
      camera_note: t.cameraN,
      tags: t.tags,
      score: Math.floor(70 + Math.random() * 30),
      is_featured: i < 4,
      created_at: now.toISOString(),
    };
  });
}
