import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// RECONCILED SCHEMA — downtime-platform
//
// Merged from downtime-app (frontend) and downtime-dfw (config).
// All entities from both original schemas are preserved.
// Conflicting names resolved:
//   - App's savedEvents (with userId FK) → userSavedEvents
//   - App's Event (API response interface)  → ApiEvent
//   - DFW's savedEvents (simple bookmarks)  → kept as savedEvents
//   - DFW's Event (drizzle DB type)         → kept as Event
// ============================================================================

// ──────────────────────────────────────────────
// From downtime-app (frontend): Users & auth
// ──────────────────────────────────────────────

/** Users table - for Google OAuth (downtime-app) */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  googleId: text("google_id").unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  city: text("city"),
  state: text("state"),
  lat: text("lat"),
  lon: text("lon"),
  interests: text("interests"), // JSON array
  onboarded: integer("onboarded", { mode: "boolean" }).default(false),
});

/** User-specific saved/bookmarked events with userId FK (downtime-app) */
export const userSavedEvents = sqliteTable("user_saved_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  eventId: text("event_id").notNull(),
});

/** Dismissed events per user (downtime-app) */
export const dismissedEvents = sqliteTable("dismissed_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  eventId: text("event_id").notNull(),
});

// ──────────────────────────────────────────────
// From downtime-dfw (config): Events & data
// ──────────────────────────────────────────────

/** Events discovered from various platforms (downtime-dfw) */
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // motorsports, music, art, food, outdoor, film, fitness, nightlife, comedy, festival, market, sports, photography
  scenario: text("scenario").notNull(), // date-night, solo, weekend-adventure, travel
  source: text("source").notNull(), // bandsintown, eventbrite, yelp, meetup, manual, cron-agent
  sourceUrl: text("source_url"),
  imageUrl: text("image_url"),
  venue: text("venue"),
  address: text("address"),
  city: text("city").notNull().default("Roanoke"),
  state: text("state").notNull().default("TX"),
  dateStart: text("date_start"), // ISO date string
  dateEnd: text("date_end"),
  timeInfo: text("time_info"), // human readable time
  priceRange: text("price_range"), // free, $, $$, $$$
  priceNote: text("price_note"),
  cameraWorthy: integer("camera_worthy", { mode: "boolean" }).default(false),
  cameraNote: text("camera_note"), // why it's good for photos/video
  tags: text("tags"), // JSON array of strings
  score: real("score").default(0), // relevance score 0-100
  scoreBreakdown: text("score_breakdown"), // JSON breakdown
  isNew: integer("is_new", { mode: "boolean" }).default(true),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
  savedByUser: integer("saved_by_user", { mode: "boolean" }).default(false),
  dismissed: integer("dismissed", { mode: "boolean" }).default(false),
  addedAt: text("added_at").notNull(), // ISO timestamp
  expiresAt: text("expires_at"), // when event is no longer relevant
});

/** User taste profile - stores preferences that evolve (downtime-dfw) */
export const userPreferences = sqliteTable("user_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(), // JSON value
  updatedAt: text("updated_at").notNull(),
});

/** Saved / bookmarked events for quick access (downtime-dfw) */
export const savedEvents = sqliteTable("saved_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull(),
  note: text("note"),
  savedAt: text("saved_at").notNull(),
});

/** Agent run log - tracks when the cron agent ran and what it found (downtime-dfw) */
export const agentRuns = sqliteTable("agent_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ranAt: text("ran_at").notNull(),
  eventsFound: integer("events_found").default(0),
  eventsAdded: integer("events_added").default(0),
  sources: text("sources"), // JSON array of sources checked
  summary: text("summary"),
});

// ──────────────────────────────────────────────
// Insert schemas (Zod validation)
// ──────────────────────────────────────────────

// From downtime-app
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertUserSavedEventSchema = createInsertSchema(userSavedEvents).omit({ id: true });
export const insertDismissedEventSchema = createInsertSchema(dismissedEvents).omit({ id: true });

// From downtime-dfw
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertPreferenceSchema = createInsertSchema(userPreferences).omit({ id: true });
export const insertSavedEventSchema = createInsertSchema(savedEvents).omit({ id: true });
export const insertAgentRunSchema = createInsertSchema(agentRuns).omit({ id: true });

// ──────────────────────────────────────────────
// Inferred types from Drizzle tables
// ──────────────────────────────────────────────

// From downtime-app
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserSavedEvent = typeof userSavedEvents.$inferSelect;
export type InsertUserSavedEvent = z.infer<typeof insertUserSavedEventSchema>;
export type DismissedEvent = typeof dismissedEvents.$inferSelect;
export type InsertDismissedEvent = z.infer<typeof insertDismissedEventSchema>;

// From downtime-dfw
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertPreference = z.infer<typeof insertPreferenceSchema>;
export type SavedEvent = typeof savedEvents.$inferSelect;
export type InsertSavedEvent = z.infer<typeof insertSavedEventSchema>;
export type AgentRun = typeof agentRuns.$inferSelect;
export type InsertAgentRun = z.infer<typeof insertAgentRunSchema>;

// ──────────────────────────────────────────────
// API types (not stored in SQLite — from downtime-app)
// ──────────────────────────────────────────────

/** Event shape as returned by the backend API (downtime-app) */
export interface ApiEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  scenario: string;
  source: string;
  source_url: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  date_start: string | null;
  date_end: string | null;
  time_info: string;
  price_range: string;
  price_note: string;
  image_url: string | null;
  camera_worthy: boolean;
  camera_note: string | null;
  tags: string[];
  score: number;
  is_featured: boolean;
  created_at: string;
}

/** City type for location selection (downtime-app) */
export interface City {
  name: string;
  state: string;
  lat: number;
  lon: number;
  display: string;
}
