import { useState, useEffect } from "react";
import { MapPin, Check, Sun, Moon, Sparkles, Star, Zap, Crown } from "lucide-react";
import { useStore } from "@/lib/store";
import { TOP_CITIES, INTERESTS } from "@/lib/types";
import type { City } from "@/lib/types";
import { AppLayout } from "@/components/Navigation";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

export default function ProfilePage() {
  const { city, userInterests, setCity, setInterests } = useStore();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const toggleInterest = (interest: string) => {
    const newInterests = userInterests.includes(interest)
      ? userInterests.filter((i) => i !== interest)
      : [...userInterests, interest];
    setInterests(newInterests);
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-8">
        <h1 className="font-display text-xl font-semibold text-foreground mb-6">Profile</h1>

        {/* City selector */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Your city
          </h2>
          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
            {TOP_CITIES.map((c) => (
              <button
                key={c.display}
                data-testid={`profile-city-${c.name.toLowerCase().replace(/\s/g, '-')}`}
                onClick={() => setCity(c)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  city?.display === c.display
                    ? "bg-primary/15 border border-primary/40 text-foreground"
                    : "bg-secondary border border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {city?.display === c.display && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                <span className="truncate">{c.display}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Interests */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-accent" />
            Your interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                data-testid={`profile-interest-${interest.toLowerCase().replace(/[^a-z]/g, '-')}`}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  userInterests.includes(interest)
                    ? "bg-primary/15 border border-primary/40 text-foreground"
                    : "bg-secondary border border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {userInterests.includes(interest) && <Check className="w-3 h-3 inline mr-1" />}
                {interest}
              </button>
            ))}
          </div>
        </section>

        {/* Theme */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3">Appearance</h2>
          <button
            data-testid="theme-toggle"
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-4 py-3 bg-secondary rounded-xl"
          >
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-accent" />}
              <span className="text-sm text-foreground">{isDark ? "Dark mode" : "Light mode"}</span>
            </div>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${isDark ? "bg-primary/30" : "bg-muted"}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${isDark ? "left-5 bg-primary" : "left-1 bg-foreground"}`} />
            </div>
          </button>
        </section>

        {/* About */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3">About DownTime</h2>
          <div className="bg-secondary rounded-xl p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-label="DownTime">
                <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
                <path d="M14 8v6l4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
                <circle cx="14" cy="14" r="2" fill="currentColor" className="text-accent" />
              </svg>
              <span className="font-display text-base font-semibold text-foreground">DownTime</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your AI concierge for the best ways to spend your free time. We find compelling events,
              experiences, and hidden gems — then score them based on your taste. Think Spotify's Discover
              Weekly, but for everything you do outside of work.
            </p>
          </div>
        </section>

        {/* Pro teaser */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-900/40 via-orange-900/30 to-rose-900/20 border border-amber-500/20 p-5">
            <div className="absolute top-3 right-3">
              <span className="font-mono-ui text-[10px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                COMING SOON
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-amber-400" />
              <h3 className="font-display text-base font-semibold text-foreground">DownTime Pro</h3>
            </div>
            <ul className="space-y-2 mb-4">
              {[
                "Advanced AI taste engine",
                "Price drop alerts",
                "Ad-free experience",
                "Curated weekend plans",
                "Calendar integration",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pricing */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Pricing
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Free tier */}
            <div className="bg-secondary rounded-xl p-4 border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-1">Free</h3>
              <p className="font-display text-2xl font-bold text-foreground mb-3">$0</p>
              <ul className="space-y-1.5">
                {["Event discovery", "Save & organize", "Scenario browsing", "Camera-worthy tags"].map((f) => (
                  <li key={f} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            {/* Pro tier */}
            <div className="bg-gradient-to-b from-amber-500/10 to-transparent rounded-xl p-4 border border-amber-500/20">
              <h3 className="text-sm font-semibold text-amber-400 mb-1">Pro</h3>
              <p className="font-display text-2xl font-bold text-foreground mb-3">
                $4.99<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="space-y-1.5">
                {["Everything in Free", "AI taste engine", "Price alerts", "Weekend plans", "No ads"].map((f) => (
                  <li key={f} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <PerplexityAttribution />
      </div>
    </AppLayout>
  );
}
