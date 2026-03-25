// Static data loader — reads from data.json (no API server needed)
// The cron agent updates this file and redeploys to Netlify

export interface EventData {
  id: number;
  title: string;
  description: string | null;
  category: string;
  scenario: string;
  source: string;
  sourceUrl: string | null;
  venue: string | null;
  address: string | null;
  city: string;
  state: string;
  dateStart: string | null;
  dateEnd: string | null;
  timeInfo: string | null;
  priceRange: string | null;
  priceNote: string | null;
  cameraWorthy: boolean;
  cameraNote: string | null;
  tags: string | null;
  score: number;
  scoreBreakdown: string | null;
  isNew: boolean;
  isFeatured: boolean;
  savedByUser: boolean;
  dismissed: boolean;
  addedAt: string;
  expiresAt: string | null;
}

export interface AgentRunData {
  id: number;
  ranAt: string;
  eventsFound: number;
  eventsAdded: number;
  sources: string | null;
  summary: string | null;
}

export interface StatsData {
  total: number;
  new_count: number;
  saved: number;
  cameraWorthy: number;
  byCategory: Record<string, number>;
  byScenario: Record<string, number>;
}

export interface SiteData {
  events: EventData[];
  stats: StatsData;
  agentRuns: AgentRunData[];
  lastUpdated: string;
}

let cachedData: SiteData | null = null;

export async function loadData(): Promise<SiteData> {
  if (cachedData) return cachedData;
  const resp = await fetch('./data.json');
  cachedData = await resp.json();
  return cachedData!;
}

export function getEvents(data: SiteData, filters?: {
  category?: string;
  scenario?: string;
  saved?: boolean;
  cameraOnly?: boolean;
}): EventData[] {
  let events = data.events.filter(e => !e.dismissed);
  if (filters?.category) events = events.filter(e => e.category === filters.category);
  if (filters?.scenario) events = events.filter(e => e.scenario === filters.scenario);
  if (filters?.saved) events = events.filter(e => e.savedByUser);
  if (filters?.cameraOnly) events = events.filter(e => e.cameraWorthy);
  return events.sort((a, b) => (b.score || 0) - (a.score || 0));
}
