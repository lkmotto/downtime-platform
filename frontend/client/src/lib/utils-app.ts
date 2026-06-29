// App-level utilities

export const CATEGORY_GRADIENTS: Record<string, string> = {
  music: "from-purple-900 to-indigo-800",
  arts: "from-rose-900 to-pink-800",
  food: "from-amber-900 to-orange-800",
  outdoor: "from-emerald-900 to-teal-800",
  nightlife: "from-violet-900 to-purple-800",
  sports: "from-blue-900 to-cyan-800",
  film: "from-slate-900 to-gray-800",
  festivals: "from-fuchsia-900 to-pink-800",
  photography: "from-cyan-900 to-teal-800",
  motorsports: "from-red-900 to-orange-800",
};

export const SCENARIO_GRADIENTS: Record<string, string> = {
  "date-night": "from-rose-900 via-pink-900 to-purple-900",
  solo: "from-cyan-900 via-teal-900 to-emerald-900",
  "weekend-adventure": "from-amber-900 via-orange-900 to-red-900",
  travel: "from-indigo-900 via-blue-900 to-cyan-900",
};

export const SCENARIO_ICONS: Record<string, string> = {
  "date-night": "Heart",
  solo: "User",
  "weekend-adventure": "Mountain",
  travel: "Plane",
};

export function formatEventDate(dateStr: string | null): string {
  if (!dateStr) return "TBA";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) {
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 80) return "text-primary";
  if (score >= 70) return "text-amber-400";
  return "text-muted-foreground";
}

export function getScoreBg(score: number): string {
  if (score >= 90) return "bg-emerald-500/20 border-emerald-500/30";
  if (score >= 80) return "bg-primary/20 border-primary/30";
  if (score >= 70) return "bg-amber-500/20 border-amber-500/30";
  return "bg-muted/40 border-muted";
}
