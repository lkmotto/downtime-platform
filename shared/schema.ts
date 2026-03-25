import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for Google OAuth
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

// Saved events (user bookmarks)
export const savedEvents = sqliteTable("saved_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  eventId: text("event_id").notNull(),
});

// Dismissed events
export const dismissedEvents = sqliteTable("dismissed_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  eventId: text("event_id").notNull(),
});

// Types
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertSavedEventSchema = createInsertSchema(savedEvents).omit({ id: true });
export type InsertSavedEvent = z.infer<typeof insertSavedEventSchema>;
export type SavedEvent = typeof savedEvents.$inferSelect;

// Event type (from backend API, not stored in SQLite)
export interface Event {
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

// City type
export interface City {
  name: string;
  state: string;
  lat: number;
  lon: number;
  display: string;
}
