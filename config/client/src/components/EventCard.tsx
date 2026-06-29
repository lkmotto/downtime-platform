import { type EventData } from "@/lib/data";
import {
  Camera,
  MapPin,
  Calendar,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  X,
  ExternalLink,
  Star,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const categoryColors: Record<string, string> = {
  motorsports: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  music: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  art: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  food: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  outdoor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  film: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  fitness: "bg-red-500/15 text-red-400 border-red-500/20",
  sports: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  nightlife: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  comedy: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  photography: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  festival: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  market: "bg-lime-500/15 text-lime-400 border-lime-500/20",
};

const scenarioLabels: Record<string, string> = {
  "date-night": "Date Night",
  solo: "Solo",
  "weekend-adventure": "Weekend",
  travel: "Travel",
};

export function EventCard({ event, compact = false }: { event: EventData; compact?: boolean }) {
  const { toast } = useToast();
  const [saved, setSaved] = useState(event.savedByUser);
  const [dismissed, setDismissed] = useState(false);

  const tags = event.tags ? JSON.parse(event.tags) : [];
  const colorClass = categoryColors[event.category] || "bg-muted text-muted-foreground";

  function toggleSave() {
    setSaved(!saved);
    toast({ title: saved ? "Removed from saved" : "Saved for later" });
  }

  function dismiss() {
    setDismissed(true);
  }

  if (dismissed) return null;

  if (compact) {
    return (
      <div
        data-testid={`card-event-${event.id}`}
        className="group flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border bg-card/50 hover:bg-card transition-all"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colorClass}`}>
              {event.category}
            </Badge>
            {event.cameraWorthy && <Camera className="w-3 h-3 text-primary shrink-0" />}
            {event.isFeatured && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
          </div>
          <h4 className="text-sm font-medium leading-snug truncate">{event.title}</h4>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
            {event.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.city}
              </span>
            )}
            {event.priceRange && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {event.priceRange}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleSave} data-testid={`button-save-${event.id}`}>
            {saved ? <BookmarkCheck className="w-3.5 h-3.5 text-primary" /> : <Bookmark className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid={`card-event-${event.id}`}
      className="group relative rounded-xl border border-border/60 bg-card hover:border-border hover:shadow-md transition-all overflow-hidden"
    >
      {event.isFeatured && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-amber-500/90 text-black text-[10px] font-semibold px-2 py-0.5 gap-1">
            <Sparkles className="w-3 h-3" />
            Featured
          </Badge>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${colorClass}`}>
            {event.category}
          </Badge>
          <Badge variant="outline" className="text-[11px] px-2 py-0.5 text-muted-foreground">
            {scenarioLabels[event.scenario] || event.scenario}
          </Badge>
          {event.isNew && (
            <Badge className="bg-primary/15 text-primary text-[10px] px-1.5 py-0 border-0">
              New
            </Badge>
          )}
          <div className="ml-auto flex items-center gap-1">
            <div className="text-xs font-mono font-medium text-muted-foreground">
              {Math.round(event.score || 0)}
            </div>
            <div className="w-8 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${event.score || 0}%` }}
              />
            </div>
          </div>
        </div>

        <h3 className="text-base font-semibold leading-snug mb-2">{event.title}</h3>

        {event.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-3">
          {event.venue && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {event.venue}, {event.city}
            </span>
          )}
          {event.dateStart && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {formatDate(event.dateStart)}
              {event.dateEnd && event.dateEnd !== event.dateStart && ` — ${formatDate(event.dateEnd)}`}
            </span>
          )}
          {event.timeInfo && (
            <span className="text-muted-foreground/70">{event.timeInfo}</span>
          )}
          {event.priceRange && (
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              {event.priceRange}
              {event.priceNote && <span className="text-muted-foreground/60">· {event.priceNote}</span>}
            </span>
          )}
        </div>

        {event.cameraWorthy && event.cameraNote && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 mb-3">
            <Camera className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-primary/80 leading-relaxed">{event.cameraNote}</p>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 5).map((tag: string) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={toggleSave}
            data-testid={`button-save-${event.id}`}
          >
            {saved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                Save
              </>
            )}
          </Button>
          {event.sourceUrl && (
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Source
            </a>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 ml-auto text-muted-foreground hover:text-destructive"
            onClick={dismiss}
            data-testid={`button-dismiss-${event.id}`}
          >
            <X className="w-3.5 h-3.5" />
            Not interested
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
  } catch {
    return iso;
  }
}
