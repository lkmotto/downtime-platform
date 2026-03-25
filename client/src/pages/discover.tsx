import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import type { Category, Event } from "@/lib/types";
import { EventCard } from "@/components/EventCard";
import { EventDetail } from "@/components/EventDetail";
import { AppLayout } from "@/components/Navigation";

export default function DiscoverPage() {
  const { city, category, setCategory, filteredEvents, featuredEvents, isLoading, searchQuery, setSearchQuery } = useStore();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [timeFilter, setTimeFilter] = useState<"weekend" | "week">("weekend");

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* Header */}
        <header className="pt-6 pb-4 md:pt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{city?.display || "Your City"}</span>
              </div>
              <h1 className="font-display text-xl font-semibold text-foreground">
                Discover
              </h1>
            </div>
            <div className="flex bg-secondary rounded-lg p-0.5">
              <button
                data-testid="filter-weekend"
                onClick={() => setTimeFilter("weekend")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  timeFilter === "weekend" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                This weekend
              </button>
              <button
                data-testid="filter-week"
                onClick={() => setTimeFilter("week")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  timeFilter === "week" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                This week
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              data-testid="discover-search"
              type="search"
              placeholder="Search events, venues, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Category pills */}
          <div className="scroll-pills flex gap-2 -mx-4 px-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                data-testid={`category-${cat.value}`}
                onClick={() => setCategory(cat.value as Category)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  category === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </header>

        {/* Loading state */}
        {isLoading && (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Finding great things to do...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Featured section */}
            {featuredEvents.length > 0 && category === "all" && !searchQuery && (
              <section className="mb-8">
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">Featured</h2>
                <div className="scroll-pills flex gap-4 -mx-4 px-4 snap-x snap-mandatory">
                  {featuredEvents.map((event) => (
                    <EventCard key={event.id} event={event} onOpen={setSelectedEvent} variant="featured" />
                  ))}
                </div>
              </section>
            )}

            {/* Event grid */}
            <section>
              {filteredEvents.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      {searchQuery ? "Results" : "For you"}
                    </h2>
                    <span className="font-mono-ui text-xs text-muted-foreground">
                      {filteredEvents.length} events
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                    {filteredEvents.map((event) => (
                      <EventCard key={event.id} event={event} onOpen={setSelectedEvent} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-16 text-center">
                  <p className="text-muted-foreground text-sm">No events match your filters</p>
                  <button
                    onClick={() => { setCategory("all"); setSearchQuery(""); }}
                    className="text-primary text-sm mt-2 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Event detail overlay */}
      {selectedEvent && (
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </AppLayout>
  );
}
