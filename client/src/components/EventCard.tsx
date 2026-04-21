import { Camera, Bookmark } from "lucide-react";
import type { Event } from "@/lib/types";
import { useStore } from "@/lib/store";
import { CATEGORY_GRADIENTS, formatEventDate, getScoreColor, getScoreBg } from "@/lib/utils-app";
import { useState } from "react";

// Unsplash keyword map per category for fallback images
const CATEGORY_UNSPLASH_KEYWORDS: Record<string, string> = {
  music: "live+music,concert,band",
  arts: "art+gallery,exhibition,painting",
  food: "food,restaurant,dining",
  outdoor: "outdoor,nature,adventure",
  nightlife: "nightlife,bar,city+night",
  sports: "sports,stadium,athlete",
  film: "cinema,film,movie+theater",
  festivals: "festival,crowd,celebration",
  photography: "photography,camera,urban",
  motorsports: "motorsports,racing,cars",
};

function getUnsplashUrl(category: string, title: string, width = 800, height = 600): string {
  const keywords = CATEGORY_UNSPLASH_KEYWORDS[category] || "city,event,social";
  // Use a stable seed based on title so the same event always gets the same image
  const seed = encodeURIComponent(title.slice(0, 20));
  return `https://source.unsplash.com/${width}x${height}/?${keywords}&sig=${seed}`;
}

interface EventCardProps {
  event: Event;
  onOpen: (event: Event) => void;
  variant?: "default" | "featured";
}

export function EventCard({ event, onOpen, variant = "default" }: EventCardProps) {
  const { savedEventIds, toggleSave } = useStore();
  const isSaved = savedEventIds.has(event.id);
  const [pulsing, setPulsing] = useState(false);
  const [imgError, setImgError] = useState(false);
  const gradient = CATEGORY_GRADIENTS[event.category] || "from-slate-900 to-gray-800";

  // Resolve image: prefer event.image_url, fallback to Unsplash, fallback to gradient
  const imageSrc = !imgError && event.image_url
    ? event.image_url
    : !imgError
    ? getUnsplashUrl(event.category, event.title)
    : null;

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(event.id);
    if (!isSaved) {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 600);
    }
  };

  if (variant === "featured") {
    return (
      <div
        data-testid={`featured-card-${event.id}`}
        onClick={() => onOpen(event)}
        className="relative min-w-[300px] md:min-w-[360px] h-[280px] rounded-xl overflow-hidden cursor-pointer group flex-shrink-0 snap-start"
      >
        {/* Background: real image or gradient fallback */}
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        )}
        {/* Dark overlay so text stays readable over any image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        {/* Score badge */}
        <div className={`absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border ${getScoreBg(event.score)} ${getScoreColor(event.score)}`}>
          {event.score}
        </div>
        {/* Camera badge */}
        {event.camera_worthy && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Camera className="w-4 h-4 text-amber-400" />
          </div>
        )}
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="font-mono-ui text-xs text-muted-foreground uppercase tracking-wider mb-1">{event.category}</p>
          <h3 className="font-display text-xl font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{event.venue}</p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-3">
              <span className="font-mono-ui text-xs text-muted-foreground">{formatEventDate(event.date_start)}</span>
              <span className="font-mono-ui text-xs text-primary">{event.price_range}</span>
            </div>
            <button
              data-testid={`save-featured-${event.id}`}
              onClick={handleSave}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isSaved ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-muted-foreground hover:text-amber-400"
              } ${pulsing ? "animate-amber-pulse" : ""}`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid={`event-card-${event.id}`}
      onClick={() => onOpen(event)}
      className="rounded-xl overflow-hidden bg-card border border-card-border cursor-pointer group hover:border-muted-foreground/20 hover:scale-[1.02] transition-all duration-200"
    >
      {/* Image/gradient area */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {imageSrc && (
          <img
            src={imageSrc}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        {/* Subtle dark overlay so badges stay visible */}
        {imageSrc && <div className="absolute inset-0 bg-black/20" />}
        {/* Score badge */}
        <div className={`absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border ${getScoreBg(event.score)} ${getScoreColor(event.score)}`}>
          {event.score}
        </div>
        {/* Camera badge */}
        {event.camera_worthy && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
          </div>
        )}
      </div>
      {/* Card content */}
      <div className="p-3.5">
        <h3 className="font-display text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 truncate">{event.venue}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2.5 items-center">
            <span className="font-mono-ui text-xs text-muted-foreground">{formatEventDate(event.date_start)}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="font-mono-ui text-xs text-primary">{event.price_range}</span>
          </div>
          <button
            data-testid={`save-card-${event.id}`}
            onClick={handleSave}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isSaved ? "bg-amber-500/20 text-amber-400" : "bg-secondary text-muted-foreground hover:text-amber-400"
            } ${pulsing ? "animate-amber-pulse" : ""}`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
