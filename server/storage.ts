import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  events,
  userPreferences,
  savedEvents,
  agentRuns,
  type Event,
  type InsertEvent,
  type UserPreference,
  type InsertPreference,
  type SavedEvent,
  type InsertSavedEvent,
  type AgentRun,
  type InsertAgentRun,
} from "@shared/schema";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");
export const db = drizzle(sqlite);

export interface IStorage {
  // Events
  getEvents(filters?: { category?: string; scenario?: string; onlySaved?: boolean; onlyNew?: boolean; onlyCameraWorthy?: boolean }): Event[];
  getEvent(id: number): Event | undefined;
  createEvent(event: InsertEvent): Event;
  createEvents(eventList: InsertEvent[]): Event[];
  updateEvent(id: number, updates: Partial<InsertEvent>): Event | undefined;
  dismissEvent(id: number): void;
  saveEvent(id: number): void;
  unsaveEvent(id: number): void;
  getEventStats(): { total: number; new: number; saved: number; cameraWorthy: number; byCategory: Record<string, number>; byScenario: Record<string, number> };

  // Preferences
  getPreferences(): UserPreference[];
  getPreference(key: string): UserPreference | undefined;
  setPreference(pref: InsertPreference): UserPreference;

  // Agent Runs
  getAgentRuns(limit?: number): AgentRun[];
  logAgentRun(run: InsertAgentRun): AgentRun;
}

export class SqliteStorage implements IStorage {
  getEvents(filters?: { category?: string; scenario?: string; onlySaved?: boolean; onlyNew?: boolean; onlyCameraWorthy?: boolean }): Event[] {
    let query = db.select().from(events).where(eq(events.dismissed, false));

    const conditions = [eq(events.dismissed, false)];

    if (filters?.category) {
      conditions.push(eq(events.category, filters.category));
    }
    if (filters?.scenario) {
      conditions.push(eq(events.scenario, filters.scenario));
    }
    if (filters?.onlySaved) {
      conditions.push(eq(events.savedByUser, true));
    }
    if (filters?.onlyNew) {
      conditions.push(eq(events.isNew, true));
    }
    if (filters?.onlyCameraWorthy) {
      conditions.push(eq(events.cameraWorthy, true));
    }

    return db.select().from(events).where(and(...conditions)).orderBy(desc(events.score)).all();
  }

  getEvent(id: number): Event | undefined {
    return db.select().from(events).where(eq(events.id, id)).get();
  }

  createEvent(event: InsertEvent): Event {
    return db.insert(events).values(event).returning().get();
  }

  createEvents(eventList: InsertEvent[]): Event[] {
    if (eventList.length === 0) return [];
    const results: Event[] = [];
    for (const event of eventList) {
      results.push(db.insert(events).values(event).returning().get());
    }
    return results;
  }

  updateEvent(id: number, updates: Partial<InsertEvent>): Event | undefined {
    return db.update(events).set(updates).where(eq(events.id, id)).returning().get();
  }

  dismissEvent(id: number): void {
    db.update(events).set({ dismissed: true }).where(eq(events.id, id)).run();
  }

  saveEvent(id: number): void {
    db.update(events).set({ savedByUser: true }).where(eq(events.id, id)).run();
    const now = new Date().toISOString();
    db.insert(savedEvents).values({ eventId: id, savedAt: now }).run();
  }

  unsaveEvent(id: number): void {
    db.update(events).set({ savedByUser: false }).where(eq(events.id, id)).run();
    db.delete(savedEvents).where(eq(savedEvents.eventId, id)).run();
  }

  getEventStats() {
    const allEvents = db.select().from(events).where(eq(events.dismissed, false)).all();
    const byCategory: Record<string, number> = {};
    const byScenario: Record<string, number> = {};
    let newCount = 0;
    let savedCount = 0;
    let cameraCount = 0;

    for (const e of allEvents) {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1;
      byScenario[e.scenario] = (byScenario[e.scenario] || 0) + 1;
      if (e.isNew) newCount++;
      if (e.savedByUser) savedCount++;
      if (e.cameraWorthy) cameraCount++;
    }

    return {
      total: allEvents.length,
      new: newCount,
      saved: savedCount,
      cameraWorthy: cameraCount,
      byCategory,
      byScenario,
    };
  }

  // Preferences
  getPreferences(): UserPreference[] {
    return db.select().from(userPreferences).all();
  }

  getPreference(key: string): UserPreference | undefined {
    return db.select().from(userPreferences).where(eq(userPreferences.key, key)).get();
  }

  setPreference(pref: InsertPreference): UserPreference {
    // Upsert
    const existing = this.getPreference(pref.key);
    if (existing) {
      return db.update(userPreferences).set({ value: pref.value, updatedAt: pref.updatedAt }).where(eq(userPreferences.key, pref.key)).returning().get();
    }
    return db.insert(userPreferences).values(pref).returning().get();
  }

  // Agent Runs
  getAgentRuns(limit = 10): AgentRun[] {
    return db.select().from(agentRuns).orderBy(desc(agentRuns.ranAt)).limit(limit).all();
  }

  logAgentRun(run: InsertAgentRun): AgentRun {
    return db.insert(agentRuns).values(run).returning().get();
  }
}

export const storage = new SqliteStorage();
