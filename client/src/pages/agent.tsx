import { useData } from "@/lib/DataContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, CheckCircle, Clock, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AgentPage() {
  const { data, loading } = useData();

  if (loading || !data) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  const runs = data.agentRuns;

  return (
    <div className="p-4 lg:p-6 max-w-[1000px] space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          Discovery Agent
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Automated agent runs weekly, searching the web for events matching your tastes. Zero cost, zero credits.
        </p>
      </div>

      {/* Agent status */}
      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-medium">Agent Active</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block">Schedule</span>
            <span className="font-medium">Thu 6pm + Fri email</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Sources</span>
            <span className="font-medium">14+ platforms</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Location</span>
            <span className="font-medium">DFW Area (76262)</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Hosting</span>
            <span className="font-medium text-emerald-400">Netlify (free)</span>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-3">
        <h3 className="text-sm font-medium">How Updates Work</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="text-primary font-mono font-bold shrink-0">Thu 6pm</span>
            <span>Agent searches 14+ platforms for new events, scores them, writes fresh data.json, and redeploys to Netlify.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-mono font-bold shrink-0">Fri 10am</span>
            <span>Email arrives with top weekend picks — date night, solo, weekend adventure recommendations.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-mono font-bold shrink-0">Anytime</span>
            <span>Open this site to browse all picks. No server, no API, no cost.</span>
          </div>
        </div>
      </div>

      {/* Taste profile */}
      <div className="p-4 rounded-xl border border-border/60 bg-card space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Database className="w-4 h-4 text-muted-foreground" />
          Your Taste Profile
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Motorsports", "Drifting", "Car Shows", "Wrestling", "UFC",
            "Drone Photography", "Cinematography", "Art Galleries",
            "Live Music", "BBQ", "Gluten-Free", "Outdoor Adventures",
            "Film Screenings", "Budget-Friendly", "Night Photography",
          ].map((tag) => (
            <Badge key={tag} variant="outline" className="text-[11px]">{tag}</Badge>
          ))}
        </div>
      </div>

      {/* Run history */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Run History</h3>
        {runs.length > 0 ? (
          <div className="space-y-2">
            {runs.map((run) => (
              <div
                key={run.id}
                data-testid={`agent-run-${run.id}`}
                className="p-3 rounded-lg border border-border/50 bg-card/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-medium">
                      {new Date(run.ranAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{run.eventsFound} found</span>
                    <span>{run.eventsAdded} added</span>
                  </div>
                </div>
                {run.summary && (
                  <p className="text-xs text-muted-foreground">{run.summary}</p>
                )}
                {run.sources && (
                  <div className="flex flex-wrap gap-1">
                    {JSON.parse(run.sources).map((s: string) => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No agent runs yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
