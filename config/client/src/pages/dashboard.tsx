import { useData } from "@/lib/DataContext";
import { getEvents } from "@/lib/data";
import { EventCard } from "@/components/EventCard";
import {
  Sparkles,
  Camera,
  TrendingUp,
  Bookmark,
  Flame,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Dashboard() {
  const { data, loading } = useData();

  if (loading || !data) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const allEvents = getEvents(data);
  const featured = allEvents.filter((e) => e.isFeatured);
  const newEvents = allEvents.filter((e) => e.isNew && !e.isFeatured);
  const cameraWorthy = allEvents.filter((e) => e.cameraWorthy);
  const stats = data.stats;

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            What's Good
          </h1>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            Updated {new Date(data.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Curated picks for your downtime in DFW. Auto-updated weekly by your discovery agent.
        </p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Sparkles className="w-4 h-4" />} label="New" value={stats.new_count} color="text-primary" />
          <StatCard icon={<Camera className="w-4 h-4" />} label="Camera Worthy" value={stats.cameraWorthy} color="text-teal-400" />
          <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Total Picks" value={stats.total} color="text-muted-foreground" />
          <StatCard icon={<Bookmark className="w-4 h-4" />} label="Saved" value={stats.saved} color="text-amber-400" />
        </div>
      )}

      {/* Featured Section */}
      {featured.length > 0 && (
        <Section title="Featured Picks" icon={<Sparkles className="w-4 h-4 text-amber-400" />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {featured.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </Section>
      )}

      {/* New & Next */}
      {newEvents.length > 0 && (
        <Section title="New & Next" icon={<TrendingUp className="w-4 h-4 text-primary" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {newEvents.slice(0, 9).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </Section>
      )}

      {/* Camera Worthy Quick List */}
      {cameraWorthy.length > 0 && (
        <Section
          title="Bring the Camera"
          icon={<Camera className="w-4 h-4 text-teal-400" />}
          action={
            <Link href="/camera">
              <span className="text-xs text-primary flex items-center gap-1 cursor-pointer hover:underline">
                View all <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          }
        >
          <div className="space-y-1.5">
            {cameraWorthy.slice(0, 5).map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        </Section>
      )}

      {/* Category breakdown */}
      {stats && Object.keys(stats.byCategory).length > 0 && (
        <div className="pt-4 border-t border-border/40">
          <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => (
                <Badge
                  key={cat}
                  variant="outline"
                  className="text-xs gap-1.5 px-2.5 py-1"
                >
                  {cat}
                  <span className="text-muted-foreground font-mono">{count}</span>
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="p-3 rounded-lg border border-border/50 bg-card/50" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className={`flex items-center gap-2 mb-1 ${color}`}>
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-semibold font-mono tabular-nums">{value}</div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
