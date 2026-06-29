import { useState, useEffect } from "react";
import { Search, Check, ArrowRight, Sparkles } from "lucide-react";
import { TOP_CITIES, INTERESTS } from "@/lib/types";
import type { City } from "@/lib/types";
import { useStore } from "@/lib/store";

export default function OnboardingPage() {
  const { completeOnboarding } = useStore();
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  const filteredCities = TOP_CITIES.filter((c) =>
    c.display.toLowerCase().includes(citySearch.toLowerCase())
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const goNext = () => {
    setTransitioning(true);
    setTimeout(() => {
      setStep((s) => s + 1);
      setTransitioning(false);
    }, 300);
  };

  const finish = () => {
    if (selectedCity) {
      setTransitioning(true);
      setTimeout(() => {
        setStep(3);
        setTransitioning(false);
      }, 300);
    }
  };

  // Auto-redirect after "You're all set" step
  useEffect(() => {
    if (step === 3 && selectedCity) {
      const timeout = setTimeout(() => {
        completeOnboarding(selectedCity, selectedInterests);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [step, selectedCity, selectedInterests, completeOnboarding]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <div
        className={`w-full max-w-md transition-all duration-300 ${
          transitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Step 1: City */}
        {step === 1 && (
          <div data-testid="onboarding-step-1" className="space-y-6">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2.5 mb-4">
                <svg width="36" height="36" viewBox="0 0 28 28" fill="none" aria-label="DownTime logo">
                  <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
                  <path d="M14 8v6l4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
                  <circle cx="14" cy="14" r="2" fill="currentColor" className="text-accent" />
                </svg>
                <span className="font-display text-2xl font-semibold text-foreground tracking-tight">DownTime</span>
              </div>
              <p className="text-sm text-muted-foreground">Your AI concierge for the best ways to spend your free time</p>
            </div>

            <h2 className="font-display text-xl font-semibold text-foreground text-center">
              What city are you in?
            </h2>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                data-testid="city-search"
                type="search"
                placeholder="Search cities..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* City grid */}
            <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredCities.map((city) => (
                <button
                  key={city.display}
                  data-testid={`city-${city.name.toLowerCase().replace(/\s/g, '-')}`}
                  onClick={() => setSelectedCity(city)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
                    selectedCity?.display === city.display
                      ? "bg-primary/15 border border-primary/40 text-foreground"
                      : "bg-secondary border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {selectedCity?.display === city.display && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                  <span className="truncate">{city.display}</span>
                </button>
              ))}
            </div>

            {/* Next button */}
            <button
              data-testid="onboarding-next-1"
              disabled={!selectedCity}
              onClick={goNext}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div data-testid="onboarding-step-2" className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">
                What are you into?
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Pick at least 3 to personalize your feed
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  data-testid={`interest-${interest.toLowerCase().replace(/[^a-z]/g, '-')}`}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedInterests.includes(interest)
                      ? "bg-primary/15 border border-primary/40 text-foreground"
                      : "bg-secondary border border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {selectedInterests.includes(interest) && (
                    <Check className="w-3.5 h-3.5 inline mr-1.5" />
                  )}
                  {interest}
                </button>
              ))}
            </div>

            <button
              data-testid="onboarding-next-2"
              disabled={selectedInterests.length < 3}
              onClick={finish}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              Let's go
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-muted-foreground">
              {selectedInterests.length} of 3 minimum selected
            </p>
          </div>
        )}

        {/* Step 3: All set */}
        {step === 3 && (
          <div data-testid="onboarding-step-3" className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              You're all set
            </h2>
            <p className="text-sm text-muted-foreground">
              Finding the best things to do in {selectedCity?.name}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
