import { X, Bookmark, Camera, ExternalLink, MapPin, Clock, Tag } from "lucide-react";
import type { Event } from "@/lib/types";
import { useStore } from "@/lib/store";
import { CATEGORY_GRADIENTS, formatEventDate, getScoreColor, getScoreBg } from "@/lib/utils-app";
import { useState, useEffect } from "react";

interface EventDetailProps {
  event: Event;
  onClose: () => void;
}

export function EventDetail({ event, onClose }: EventDetailProps) {
  const { savedEventIds, toggleSave } = useStore();
  const isSaved = savedEventIds.has(event.id);
  const [pulsing, setPulsing] = useState(false);
  const gradient = CATEGORY_GRADIENTS[event.category] || "from-slate-900 to-gray-800";

  const handleSave = () => {
    toggleSave(event.id);
    if (!isSaved) {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 600);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      data-testid="event-detail-overlay"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg max-h-[92vh] md:max-h-[85vh] bg-card rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col animate-card-enter">
        {/* Header gradient */}
        <div className={`relative h-48 md:h-56 flex-shrink-0 bg-gradient-to-br ${gradient}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <button
            data-testid="close-detail"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-black/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
          {/* Score */}
          <div className={`absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border ${getScoreBg(event.score)} ${getScoreColor(event.score)}`}>
            {event.score}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 -mt-8 relative">
          {/* Category pill */}
          <span className="inline-block font-mono-ui text-xs uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3">
            {event.category}
          </span>

          <h2 className="font-display text-2xl font-semibold text-foreground leading-tight">
            {event.title}
          </h2>

          <div className="flex items-center gap-2 text-muted-foreground mt-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{event.venue} &middot; {event.address}</span>
          </div>

          {/* Date / Time / Price row */}
          <div className="flex flex-wrap gap-4 mt-4 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono-ui text-sm text-foreground">{formatEventDate(event.date_start)}</span>
              <span className="font-mono-ui text-xs text-muted-foreground">{event.time_info}</span>
            </div>
            <div className="font-mono-ui text-sm text-primary font-medium">{event.price_range}</div>
          </div>

          {/* Score breakdown visual */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Match score</span>
            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
                style={{ width: `${event.score}%` }}
              />
            </div>
            <span className={`font-mono-ui text-sm font-bold ${getScoreColor(event.score)}`}>{event.score}/100</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mt-4">
            {event.description}
          </p>

          {/* Camera note */}
          {event.camera_worthy && event.camera_note && (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">Camera-worthy</span>
              </div>
              <p className="text-sm text-amber-200/80 leading-relaxed">{event.camera_note}</p>
            </div>
          )}

          {/* Tags */}
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Source attribution */}
          <div className="mt-4 text-xs text-muted-foreground">
            Source: <span className="capitalize">{event.source}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <a
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="get-tickets-btn"
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition"
            >
              <ExternalLink className="w-4 h-4" />
              Get Tickets
            </a>
            <button
              data-testid="save-detail-btn"
              onClick={handleSave}
              className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                isSaved
                  ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                  : "bg-secondary border-border text-muted-foreground hover:text-amber-400"
              } ${pulsing ? "animate-amber-pulse" : ""}`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
