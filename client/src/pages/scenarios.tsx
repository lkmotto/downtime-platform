import { useState } from "react";
import { Heart, User, Mountain, Plane, ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { SCENARIOS } from "@/lib/types";
import type { Event, Scenario } from "@/lib/types";
import { SCENARIO_GRADIENTS } from "@/lib/utils-app";
import { EventCard } from "@/components/EventCard";
import { EventDetail } from "@/components/EventDetail";
import { AppLayout } from "@/components/Navigation";

const ICONS: Record<string, typeof Heart> = {
  Heart, User, Mountain, Plane,
};

export default function ScenariosPage() {
  const { events, setScenario } = useStore();
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const scenarios = SCENARIOS.filter((s) => s.value !== "all");

  const getEventCount = (scenario: string) =>
    events.filter((e) => e.scenario === scenario).length;

  const scenarioEvents = activeScenario
    ? events.filter((e) => e.scenario === activeScenario).sort((a, b) => b.score - a.score)
    : [];

  if (activeScenario) {
    const scenario = scenarios.find((s) => s.value === activeScenario);
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6">
          <button
            data-testid="back-to-scenarios"
            onClick={() => setActiveScenario(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to scenarios
          </button>

          <h1 className="font-display text-xl font-semibold text-foreground mb-1">
            {scenario?.label}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">{scenario?.description}</p>

          {scenarioEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {scenarioEvents.map((event) => (
                <EventCard key={event.id} event={event} onOpen={setSelectedEvent} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-muted-foreground text-sm">No events for this scenario yet</p>
            </div>
          )}
        </div>

        {selectedEvent && (
          <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6 md:pt-8">
        <h1 className="font-display text-xl font-semibold text-foreground mb-2">
          Scenarios
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          What kind of experience are you looking for?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
          {scenarios.map((scenario) => {
            const gradient = SCENARIO_GRADIENTS[scenario.value] || "from-slate-900 to-gray-800";
            const IconComp = ICONS[scenario.icon] || Heart;
            const count = getEventCount(scenario.value);

            return (
              <button
                key={scenario.value}
                data-testid={`scenario-${scenario.value}`}
                onClick={() => setActiveScenario(scenario.value as Scenario)}
                className={`relative overflow-hidden rounded-xl p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br ${gradient}`}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                    <IconComp className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                    {scenario.label}
                  </h3>
                  <p className="text-sm text-white/70 mb-3">{scenario.description}</p>
                  <span className="font-mono-ui text-xs text-white/50">
                    {count} {count === 1 ? "event" : "events"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
