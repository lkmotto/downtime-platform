import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Event } from "@/lib/types";
import { EventCard } from "@/components/EventCard";
import { EventDetail } from "@/components/EventDetail";
import { AppLayout } from "@/components/Navigation";

export default function SavedPage() {
  const { savedEvents } = useStore();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6 md:pt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-xl font-semibold text-foreground">Saved</h1>
          {savedEvents.length > 0 && (
            <span className="font-mono-ui text-xs text-muted-foreground">
              {savedEvents.length} {savedEvents.length === 1 ? "event" : "events"}
            </span>
          )}
        </div>

        {savedEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {savedEvents.map((event) => (
              <EventCard key={event.id} event={event} onOpen={setSelectedEvent} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-6 h-6 text-muted-foreground" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">
              Nothing saved yet
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Start discovering and save things that catch your eye. They'll show up here.
            </p>
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </AppLayout>
  );
}
