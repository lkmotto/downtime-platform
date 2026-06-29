import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(server: Server, app: Express) {
  // Get all events with optional filters
  app.get("/api/events", (req, res) => {
    const { category, scenario, saved, new: isNew, camera } = req.query;
    const filters: any = {};
    if (category) filters.category = category as string;
    if (scenario) filters.scenario = scenario as string;
    if (saved === "true") filters.onlySaved = true;
    if (isNew === "true") filters.onlyNew = true;
    if (camera === "true") filters.onlyCameraWorthy = true;

    const events = storage.getEvents(filters);
    res.json(events);
  });

  // Get single event
  app.get("/api/events/:id", (req, res) => {
    const event = storage.getEvent(parseInt(req.params.id));
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  });

  // Create events (batch)
  app.post("/api/events", (req, res) => {
    try {
      const body = Array.isArray(req.body) ? req.body : [req.body];
      const validated = body.map((e: any) => insertEventSchema.parse(e));
      const created = storage.createEvents(validated);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      throw error;
    }
  });

  // Save/unsave event
  app.post("/api/events/:id/save", (req, res) => {
    storage.saveEvent(parseInt(req.params.id));
    res.json({ success: true });
  });

  app.post("/api/events/:id/unsave", (req, res) => {
    storage.unsaveEvent(parseInt(req.params.id));
    res.json({ success: true });
  });

  // Dismiss event
  app.post("/api/events/:id/dismiss", (req, res) => {
    storage.dismissEvent(parseInt(req.params.id));
    res.json({ success: true });
  });

  // Stats
  app.get("/api/stats", (_req, res) => {
    const stats = storage.getEventStats();
    res.json(stats);
  });

  // Preferences
  app.get("/api/preferences", (_req, res) => {
    const prefs = storage.getPreferences();
    res.json(prefs);
  });

  app.post("/api/preferences", (req, res) => {
    const { key, value } = req.body;
    const pref = storage.setPreference({
      key,
      value: typeof value === "string" ? value : JSON.stringify(value),
      updatedAt: new Date().toISOString(),
    });
    res.json(pref);
  });

  // Agent runs
  app.get("/api/agent-runs", (_req, res) => {
    const runs = storage.getAgentRuns(20);
    res.json(runs);
  });

  // Seed initial data (for demo / first load)
  app.post("/api/seed", async (_req, res) => {
    const stats = storage.getEventStats();
    if (stats.total > 0) {
      return res.json({ message: "Already seeded", count: stats.total });
    }

    const now = new Date().toISOString();
    const seedEvents = getSeedEvents(now);
    const created = storage.createEvents(seedEvents);

    // Log agent run
    storage.logAgentRun({
      ranAt: now,
      eventsFound: seedEvents.length,
      eventsAdded: created.length,
      sources: JSON.stringify(["bandsintown", "eventbrite", "yelp", "manual-curated"]),
      summary: "Initial seed with curated DFW events matching user taste profile.",
    });

    res.json({ message: "Seeded", count: created.length });
  });
}

function getSeedEvents(now: string) {
  return [
    // MOTORSPORTS & AUTOMOTIVE
    {
      title: "Lone Star Drift Round 3 — Texas Motor Speedway",
      description: "Pro-am drifting competition with tandem battles, burnout shows, and open paddock access. Bring your drone — the smoke and tire shred make for incredible aerial shots.",
      category: "motorsports",
      scenario: "weekend-adventure",
      source: "manual-curated",
      sourceUrl: "https://lonestardrift.com",
      venue: "Texas Motor Speedway",
      address: "3545 Lone Star Cir, Fort Worth, TX 76177",
      city: "Fort Worth",
      state: "TX",
      dateStart: "2026-04-11",
      dateEnd: "2026-04-12",
      timeInfo: "Gates 10am, Competition 1pm-8pm",
      priceRange: "$",
      priceNote: "$25-40 GA, paddock included",
      cameraWorthy: true,
      cameraNote: "Drone-friendly venue. Tire smoke, tandem battles, sunset backdrops against the speedway. Bring a 70-200mm or longer for trackside.",
      tags: JSON.stringify(["drifting", "motorsports", "outdoor", "photography", "drone-friendly"]),
      score: 95,
      scoreBreakdown: JSON.stringify({ categoryMatch: 25, cameraValue: 25, priceValue: 20, proximity: 15, uniqueness: 10 }),
      isNew: true,
      isFeatured: true,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
      expiresAt: "2026-04-13",
    },
    {
      title: "Cars & Coffee DFW — Monthly Meet",
      description: "Massive monthly car meet at Texas Motorplex. Exotics, JDM, classic muscle, and custom builds. Free entry, food trucks on-site.",
      category: "motorsports",
      scenario: "solo",
      source: "manual-curated",
      sourceUrl: "https://www.carsandcoffeedallas.com",
      venue: "Texas Motorplex",
      address: "7500 W Hwy 287, Ennis, TX 75119",
      city: "Ennis",
      state: "TX",
      dateStart: "2026-04-04",
      timeInfo: "7am-10am",
      priceRange: "free",
      priceNote: "Free entry",
      cameraWorthy: true,
      cameraNote: "Golden hour morning light on exotic paint jobs. Rolling shots in the parking lot. Great for a photo series or vlog.",
      tags: JSON.stringify(["cars", "automotive", "free", "morning", "photography"]),
      score: 88,
      scoreBreakdown: JSON.stringify({ categoryMatch: 25, cameraValue: 20, priceValue: 25, proximity: 8, uniqueness: 10 }),
      isNew: true,
      isFeatured: false,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
      expiresAt: "2026-04-05",
    },
    {
      title: "Goodguys Lone Star Nationals",
      description: "The biggest hot rod and custom car show in Texas. Over 2,500 vehicles, vendor alley, autocross, and live music. Multi-day festival vibes.",
      category: "motorsports",
      scenario: "weekend-adventure",
      source: "manual-curated",
      sourceUrl: "https://www.good-guys.com/lsn",
      venue: "Texas Motor Speedway",
      address: "3545 Lone Star Cir, Fort Worth, TX 76177",
      city: "Fort Worth",
      state: "TX",
      dateStart: "2026-03-28",
      dateEnd: "2026-03-29",
      timeInfo: "8am-5pm daily",
      priceRange: "$",
      priceNote: "$25 day pass, $40 weekend",
      cameraWorthy: true,
      cameraNote: "2,500+ cars in one place. Chrome reflections, vintage paint, engine detail macro shots. Cinematic B-roll heaven.",
      tags: JSON.stringify(["hot-rods", "car-show", "outdoor", "photography", "festival"]),
      score: 92,
      scoreBreakdown: JSON.stringify({ categoryMatch: 25, cameraValue: 22, priceValue: 20, proximity: 15, uniqueness: 10 }),
      isNew: true,
      isFeatured: true,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
      expiresAt: "2026-03-30",
    },
    // MUSIC & CONCERTS
    {
      title: "Main Street Fest — Grapevine Live Music Festival",
      description: "Annual street festival in historic Grapevine with live music stages, craft vendors, food trucks, and carnival rides. 3-day event with headliners.",
      category: "music",
      scenario: "date-night",
      source: "manual-curated",
      sourceUrl: "https://www.grapevinetexasusa.com/main-street-fest",
      venue: "Historic Main Street",
      address: "Main Street, Grapevine, TX 76051",
      city: "Grapevine",
      state: "TX",
      dateStart: "2026-05-15",
      dateEnd: "2026-05-17",
      timeInfo: "Fri 5pm-11pm, Sat-Sun 10am-11pm",
      priceRange: "$",
      priceNote: "$10 admission",
      cameraWorthy: true,
      cameraNote: "Night stage shots with colored lighting. Street festival ambiance. Great for handheld run-and-gun street photography.",
      tags: JSON.stringify(["live-music", "festival", "outdoor", "food", "nightlife"]),
      score: 85,
      scoreBreakdown: JSON.stringify({ categoryMatch: 18, cameraValue: 22, priceValue: 22, proximity: 15, uniqueness: 8 }),
      isNew: true,
      isFeatured: false,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
      expiresAt: "2026-05-18",
    },
    {
      title: "Deep Ellum After Dark — Live Jazz & Blues Walk",
      description: "Self-guided bar crawl through Deep Ellum's best live music venues. Jazz, blues, and soul every Friday night. No cover at most venues.",
      category: "music",
      scenario: "date-night",
      source: "manual-curated",
      venue: "Deep Ellum District",
      address: "Deep Ellum, Dallas, TX 75226",
      city: "Dallas",
      state: "TX",
      dateStart: "2026-04-03",
      timeInfo: "Every Friday, 8pm-2am",
      priceRange: "$",
      priceNote: "Most venues no cover, drinks $8-15",
      cameraWorthy: true,
      cameraNote: "Neon signs, murals, smoky jazz clubs. Low-light street photography opportunity. Bring a fast prime lens (f/1.4-1.8).",
      tags: JSON.stringify(["jazz", "blues", "nightlife", "date-night", "photography", "murals"]),
      score: 82,
      scoreBreakdown: JSON.stringify({ categoryMatch: 15, cameraValue: 22, priceValue: 20, proximity: 15, uniqueness: 10 }),
      isNew: true,
      isFeatured: false,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
      expiresAt: "2026-06-30",
    },
    // ART & GALLERIES
    {
      title: "Kush Fine Art Gallery — New Exhibit Opening",
      description: "Vladimir Kush's surrealist art gallery opening new exhibit. Free wine reception, meet the artist event. Dreamlike landscapes and sculptures.",
      category: "art",
      scenario: "date-night",
      source: "manual-curated",
      sourceUrl: "https://kushfineart.com",
      venue: "Kush Fine Art",
      address: "Legacy West, Plano, TX 75024",
      city: "Plano",
      state: "TX",
      dateStart: "2026-04-18",
      timeInfo: "6pm-9pm",
      priceRange: "free",
      priceNote: "Free admission, wine provided",
      cameraWorthy: true,
      cameraNote: "Surrealist paintings and sculptures in gallery lighting. Permission usually given for non-flash photography. Great for portfolio diversity.",
      tags: JSON.stringify(["art", "gallery", "free", "date-night", "photography", "surrealism"]),
      score: 87,
      scoreBreakdown: JSON.stringify({ categoryMatch: 20, cameraValue: 22, priceValue: 25, proximity: 12, uniqueness: 8 }),
      isNew: true,
      isFeatured: true,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
      expiresAt: "2026-04-19",
    },
    {
      title: "Dallas Arts District — First Saturday Gallery Walk",
      description: "Free self-guided tour through 20+ galleries in the Dallas Arts District. Live music, food vendors, and open studios on first Saturdays.",
      category: "art",
      scenario: "solo",
      source: "manual-curated",
      venue: "Dallas Arts District",
      address: "Flora St, Dallas, TX 75201",
      city: "Dallas",
      state: "TX",
      dateStart: "2026-04-04",
      timeInfo: "First Saturdays, 11am-5pm",
      priceRange: "free",
      priceNote: "Free admission to all galleries",
      cameraWorthy: true,
      cameraNote: "Architecture + art installations + street scenes. Wide-angle for the buildings, macro for sculptures. Drone potential in the open plazas.",
      tags: JSON.stringify(["art", "gallery", "free", "architecture", "photography", "walking"]),
      score: 80,
      scoreBreakdown: JSON.stringify({ categoryMatch: 18, cameraValue: 20, priceValue: 25, proximity: 10, uniqueness: 7 }),
      isNew: true,
      isFeatured: false,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
      expiresAt: "2026-04-05",
    },
    // OUTDOOR & ADVENTURE
    {
      title: "Palo Duro Canyon — Second Largest Canyon in America",
      description: "Texas' Grand Canyon — 120 miles of hiking, mountain biking, and camping. Stunning red rock formations and panoramic vistas. 4hr drive from DFW.",
      category: "outdoor",
      scenario: "weekend-adventure",
      source: "manual-curated",
      sourceUrl: "https://tpwd.texas.gov/state-parks/palo-duro-canyon",
      venue: "Palo Duro Canyon State Park",
      address: "11450 State Hwy Park Rd 5, Canyon, TX 79015",
      city: "Canyon",
      state: "TX",
      dateStart: "2026-04-01",
      timeInfo: "Open daily, sunrise to 10pm",
      priceRange: "$",
      priceNote: "$8/person entry",
      cameraWorthy: true,
      cameraNote: "Epic drone territory. Red rock formations at golden hour. Lighthouse Trail for landscape photography. Time-lapse the sunset from the rim.",
      tags: JSON.stringify(["hiking", "nature", "drone-friendly", "camping", "photography", "canyon"]),
      score: 90,
      scoreBreakdown: JSON.stringify({ categoryMatch: 15, cameraValue: 25, priceValue: 22, proximity: 5, uniqueness: 23 }),
      isNew: true,
      isFeatured: true,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
    },
    {
      title: "Kayaking on Lake Grapevine at Sunset",
      description: "Rent kayaks from Grapevine Lake Marina for sunset paddles. Calm water, wildlife, and the marina has food/drinks after.",
      category: "outdoor",
      scenario: "date-night",
      source: "manual-curated",
      venue: "Grapevine Lake Marina",
      address: "2500 Fairway Dr, Grapevine, TX 76051",
      city: "Grapevine",
      state: "TX",
      dateStart: "2026-04-01",
      timeInfo: "Rentals available 9am-6pm daily",
      priceRange: "$",
      priceNote: "$20-30/hr kayak rental",
      cameraWorthy: true,
      cameraNote: "Sunset on the water. GoPro / action cam for on-kayak POV. Drone for aerial lake shots. Bring the waterproof housing.",
      tags: JSON.stringify(["kayaking", "water", "sunset", "date-night", "nature", "drone-friendly"]),
      score: 78,
      scoreBreakdown: JSON.stringify({ categoryMatch: 12, cameraValue: 22, priceValue: 18, proximity: 18, uniqueness: 8 }),
      isNew: true,
      isFeatured: false,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
    },
    // FOOD & DINING
    {
      title: "Pecan Lodge — Legendary Texas BBQ",
      description: "One of Texas Monthly's top BBQ joints. The Trough (sampler of all meats) is legendary. Deep Ellum location with murals and live music nearby.",
      category: "food",
      scenario: "date-night",
      source: "yelp",
      sourceUrl: "https://www.pecanlodge.com",
      venue: "Pecan Lodge",
      address: "2702 Main St, Dallas, TX 75226",
      city: "Dallas",
      state: "TX",
      timeInfo: "Tue-Sun, 11am-sold out (go early)",
      priceRange: "$$",
      priceNote: "$15-30 per person, GF options available",
      cameraWorthy: true,
      cameraNote: "Smoke, fire, meat — cinematic food shots. The line itself is an experience. Pair with Deep Ellum mural photography after.",
      tags: JSON.stringify(["bbq", "texas", "gluten-free-friendly", "deep-ellum", "food-photography"]),
      score: 83,
      scoreBreakdown: JSON.stringify({ categoryMatch: 18, cameraValue: 18, priceValue: 18, proximity: 14, uniqueness: 15 }),
      isNew: true,
      isFeatured: false,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
    },
    {
      title: "Dallas Farmers Market — Weekend Edition",
      description: "Massive open-air market with local produce, artisan foods, food trucks, and live music. Great for GF options and unique finds.",
      category: "food",
      scenario: "solo",
      source: "manual-curated",
      sourceUrl: "https://dallasfarmersmarket.org",
      venue: "Dallas Farmers Market",
      address: "920 S Harwood St, Dallas, TX 75201",
      city: "Dallas",
      state: "TX",
      dateStart: "2026-04-04",
      timeInfo: "Sat 8am-5pm, Sun 10am-5pm",
      priceRange: "$",
      priceNote: "Free entry, $5-15 for food",
      cameraWorthy: true,
      cameraNote: "Colorful produce displays, street food prep, candid market scenes. Documentary-style photography. Natural light everywhere.",
      tags: JSON.stringify(["farmers-market", "food", "free-entry", "photography", "gluten-free-options"]),
      score: 75,
      scoreBreakdown: JSON.stringify({ categoryMatch: 15, cameraValue: 18, priceValue: 22, proximity: 12, uniqueness: 8 }),
      isNew: true,
      isFeatured: false,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
    },
    // FITNESS & SPORTS
    {
      title: "UFC 312 Watch Party — Lewisville Sports Bar",
      description: "Big screen UFC PPV watch party with drink specials and crowd energy. No cover, just show up.",
      category: "sports",
      scenario: "solo",
      source: "manual-curated",
      venue: "Twin Peaks Lewisville",
      address: "2601 S Stemmons Fwy, Lewisville, TX 75067",
      city: "Lewisville",
      state: "TX",
      dateStart: "2026-04-12",
      timeInfo: "Prelims 6pm, Main Card 10pm",
      priceRange: "$",
      priceNote: "No cover, food/drinks $20-40",
      cameraWorthy: false,
      tags: JSON.stringify(["ufc", "sports", "nightlife", "combat-sports"]),
      score: 72,
      scoreBreakdown: JSON.stringify({ categoryMatch: 20, cameraValue: 5, priceValue: 18, proximity: 20, uniqueness: 9 }),
      isNew: true,
      isFeatured: false,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
    },
    {
      title: "Open Mat Wrestling — Roanoke Fitness Center",
      description: "Weekly open mat for wrestling and grappling. All levels welcome. Great for staying sharp and meeting training partners.",
      category: "fitness",
      scenario: "solo",
      source: "manual-curated",
      venue: "Roanoke Fitness Center",
      address: "Roanoke, TX 76262",
      city: "Roanoke",
      state: "TX",
      timeInfo: "Every Wednesday, 7pm-9pm",
      priceRange: "$",
      priceNote: "$10 drop-in",
      cameraWorthy: true,
      cameraNote: "Action sports content — training footage for vlogs. Set up a GoPro on the corner for drill clips.",
      tags: JSON.stringify(["wrestling", "grappling", "fitness", "weekly", "training"]),
      score: 76,
      scoreBreakdown: JSON.stringify({ categoryMatch: 22, cameraValue: 15, priceValue: 20, proximity: 25, uniqueness: 4 }),
      isNew: true,
      isFeatured: false,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
    },
    // FILM & CREATIVE
    {
      title: "Texas Theatre — Cult Classic Film Nights",
      description: "Iconic historic theater in Oak Cliff showing cult classics, indie films, and hosting filmmaker Q&As. The venue itself is stunning — Art Deco architecture.",
      category: "film",
      scenario: "date-night",
      source: "manual-curated",
      sourceUrl: "https://thetexastheatre.com",
      venue: "Texas Theatre",
      address: "231 W Jefferson Blvd, Dallas, TX 75208",
      city: "Dallas",
      state: "TX",
      timeInfo: "Fri-Sat evenings, check schedule",
      priceRange: "$",
      priceNote: "$12 tickets",
      cameraWorthy: true,
      cameraNote: "Art Deco interior, neon marquee, vintage lobby. Architectural photography gold. Ask about filming rules inside.",
      tags: JSON.stringify(["film", "cinema", "historic", "date-night", "photography", "architecture"]),
      score: 81,
      scoreBreakdown: JSON.stringify({ categoryMatch: 20, cameraValue: 20, priceValue: 20, proximity: 12, uniqueness: 9 }),
      isNew: true,
      isFeatured: false,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
    },
    {
      title: "DFW Drone Meetup — Grapevine Lake Fly Day",
      description: "Monthly drone pilots meetup for flying, racing, and cinematography. Share tips, compare rigs, and get epic aerial footage of the lake.",
      category: "photography",
      scenario: "solo",
      source: "manual-curated",
      venue: "Grapevine Lake Park",
      address: "Grapevine Lake, TX",
      city: "Grapevine",
      state: "TX",
      dateStart: "2026-04-12",
      timeInfo: "Second Saturday, 9am-12pm",
      priceRange: "free",
      priceNote: "Free meetup",
      cameraWorthy: true,
      cameraNote: "Obviously — it's a drone meetup. Bring every camera you own. Lake, trees, boats as subjects. FPV racing footage.",
      tags: JSON.stringify(["drone", "photography", "videography", "meetup", "free", "outdoor"]),
      score: 91,
      scoreBreakdown: JSON.stringify({ categoryMatch: 25, cameraValue: 25, priceValue: 25, proximity: 16, uniqueness: 0 }),
      isNew: true,
      isFeatured: true,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
    },
    // NIGHTLIFE & ENTERTAINMENT
    {
      title: "Reunion Tower GeO-Deck — Night Views",
      description: "360° views of the Dallas skyline from 470 feet up. Interactive displays, cocktail bar. Best at sunset → night transition.",
      category: "nightlife",
      scenario: "date-night",
      source: "manual-curated",
      sourceUrl: "https://reuniontower.com",
      venue: "Reunion Tower",
      address: "300 Reunion Blvd E, Dallas, TX 75207",
      city: "Dallas",
      state: "TX",
      timeInfo: "Sun-Thu 11am-9pm, Fri-Sat 11am-10pm",
      priceRange: "$",
      priceNote: "$22-27 tickets",
      cameraWorthy: true,
      cameraNote: "360° panoramic cityscape. Sunset-to-night timelapse opportunity. Tripod-friendly. Night city lights through glass — bring a polarizer.",
      tags: JSON.stringify(["skyline", "views", "photography", "date-night", "architecture", "night"]),
      score: 84,
      scoreBreakdown: JSON.stringify({ categoryMatch: 12, cameraValue: 25, priceValue: 18, proximity: 14, uniqueness: 15 }),
      isNew: true,
      isFeatured: false,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
    },
    // COMEDY
    {
      title: "Hyena's Comedy Club — Thursday Open Mic",
      description: "Dallas' best comedy club. Thursday open mics are free and wild. Big names roll through on weekends.",
      category: "comedy",
      scenario: "date-night",
      source: "manual-curated",
      venue: "Hyena's Comedy Nightclub",
      address: "5321 E Mockingbird Ln, Dallas, TX 75206",
      city: "Dallas",
      state: "TX",
      timeInfo: "Thursdays 8pm (Open Mic, free), Fri-Sat shows $15-30",
      priceRange: "$",
      priceNote: "Free Thursdays, $15-30 weekends",
      cameraWorthy: false,
      tags: JSON.stringify(["comedy", "nightlife", "date-night", "live-performance"]),
      score: 70,
      scoreBreakdown: JSON.stringify({ categoryMatch: 10, cameraValue: 5, priceValue: 22, proximity: 15, uniqueness: 18 }),
      isNew: true,
      isFeatured: false,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
    },
    // TRAVEL PICKS
    {
      title: "Big Bend National Park — Desert Photography Expedition",
      description: "800,000 acres of Chihuahuan Desert, mountains, and the Rio Grande. Dark sky preserve for astrophotography. 7hr drive but transformational.",
      category: "outdoor",
      scenario: "travel",
      source: "manual-curated",
      sourceUrl: "https://www.nps.gov/bibe",
      venue: "Big Bend National Park",
      address: "Big Bend National Park, TX 79834",
      city: "Big Bend",
      state: "TX",
      priceRange: "$",
      priceNote: "$30 park entry per vehicle, camping $15/night",
      cameraWorthy: true,
      cameraNote: "Dark sky astrophotography (Milky Way visible). Desert landscapes at golden hour. Rio Grande canyon aerials. This is a bucket-list photography trip.",
      tags: JSON.stringify(["national-park", "astrophotography", "drone", "camping", "desert", "nature", "bucket-list"]),
      score: 93,
      scoreBreakdown: JSON.stringify({ categoryMatch: 15, cameraValue: 25, priceValue: 18, proximity: 5, uniqueness: 30 }),
      isNew: true,
      isFeatured: true,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
    },
    {
      title: "Hamilton Pool Preserve — Hidden Swimming Hole",
      description: "Natural swimming pool formed by a collapsed grotto. Stunning 50-foot waterfall. Reservations required. 3.5hr drive from DFW near Austin.",
      category: "outdoor",
      scenario: "travel",
      source: "manual-curated",
      venue: "Hamilton Pool Preserve",
      address: "24300 Hamilton Pool Rd, Dripping Springs, TX 78620",
      city: "Dripping Springs",
      state: "TX",
      priceRange: "$",
      priceNote: "$12 entry, reservation required",
      cameraWorthy: true,
      cameraNote: "Grotto waterfall with emerald pool. Wide-angle for the cave formations. Underwater housing for swimming shots. ND filter for silky waterfall.",
      tags: JSON.stringify(["swimming", "waterfall", "nature", "photography", "grotto", "unique"]),
      score: 86,
      scoreBreakdown: JSON.stringify({ categoryMatch: 10, cameraValue: 25, priceValue: 22, proximity: 5, uniqueness: 24 }),
      isNew: true,
      isFeatured: false,
      savedByUser: false,
      dismissed: false,
      addedAt: now,
    },
  ];
}
