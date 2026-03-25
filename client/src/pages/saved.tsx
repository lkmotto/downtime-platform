import { useData } from "@/lib/DataContext";
import { getEvents } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Info } from "lucide-react";
import { EventCard } from "@/components/EventCard";

export default function SavedPage() {
  const { data, loading } = useData();

  if (loading || !data) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  const events = getEvents(data, { saved: true });

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary" />
          Saved Picks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Events you bookmarked for later.
        </p>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-primary/80 leading-relaxed">
          This is a static site — saves are per-session only. Your weekly email digest is the best way to track top picks.
        </p>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No saved events yet.</p>
          <p className="text-xs mt-1">Bookmark events from the discover page to see them here.</p>
        </div>
      )}
    </div>
  );
}
