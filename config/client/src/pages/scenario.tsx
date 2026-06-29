import { useData } from "@/lib/DataContext";
import { getEvents } from "@/lib/data";
import { EventCard } from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, User, Mountain, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const scenarioConfig: Record<string, { title: string; subtitle: string; icon: any }> = {
  "date-night": {
    title: "Date Night",
    subtitle: "Restaurants, experiences, and vibes for two. Budget-friendly, camera-ready.",
    icon: Heart,
  },
  solo: {
    title: "Solo Downtime",
    subtitle: "Things to do on your own — events, fitness, galleries, films.",
    icon: User,
  },
  "weekend-adventure": {
    title: "Weekend Adventures",
    subtitle: "Day trips, outdoor activities, festivals, and motorsports within driving distance.",
    icon: Mountain,
  },
  travel: {
    title: "Travel Picks",
    subtitle: "Bucket-list destinations and experiences worth the drive or flight.",
    icon: Plane,
  },
};

export default function ScenarioPage({ scenario }: { scenario: string }) {
  const config = scenarioConfig[scenario] || { title: scenario, subtitle: "", icon: Mountain };
  const Icon = config.icon;
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const { data, loading } = useData();

  if (loading || !data) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const events = getEvents(data, { scenario });
  const categories = [...new Set(events.map((e) => e.category))].sort();
  const filtered = categoryFilter ? events.filter((e) => e.category === categoryFilter) : events;

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          {config.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{config.subtitle}</p>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={categoryFilter === null ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setCategoryFilter(null)}
            data-testid="filter-all"
          >
            All ({events.length})
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
              data-testid={`filter-${cat}`}
            >
              {cat} ({events.filter((e) => e.category === cat).length})
            </Badge>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Icon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No events found for this scenario yet.</p>
          <p className="text-xs mt-1">Your discovery agent will find more on its next run.</p>
        </div>
      )}
    </div>
  );
}
