import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Events discovered from various platforms
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

// User taste profile - stores preferences that evolve
export const userPreferences = sqliteTable("user_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(), // JSON value
  updatedAt: text("updated_at").notNull(),
});

// Saved / bookmarked events for quick access
export const savedEvents = sqliteTable("saved_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull(),
  note: text("note"),
  savedAt: text("saved_at").notNull(),
});

// Agent run log - tracks when the cron agent ran and what it found
export const agentRuns = sqliteTable("agent_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ranAt: text("ran_at").notNull(),
  eventsFound: integer("events_found").default(0),
  eventsAdded: integer("events_added").default(0),
  sources: text("sources"), // JSON array of sources checked
  summary: text("summary"),
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertPreferenceSchema = createInsertSchema(userPreferences).omit({ id: true });
export const insertSavedEventSchema = createInsertSchema(savedEvents).omit({ id: true });
export const insertAgentRunSchema = createInsertSchema(agentRuns).omit({ id: true });

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertPreference = z.infer<typeof insertPreferenceSchema>;
export type SavedEvent = typeof savedEvents.$inferSelect;
export type InsertSavedEvent = z.infer<typeof insertSavedEventSchema>;
export type AgentRun = typeof agentRuns.$inferSelect;
export type InsertAgentRun = z.infer<typeof insertAgentRunSchema>;
