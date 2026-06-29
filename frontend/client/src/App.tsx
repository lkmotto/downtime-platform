import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreContext, useStoreProvider, useStore } from "@/lib/store";
import OnboardingPage from "@/pages/onboarding";
import DiscoverPage from "@/pages/discover";
import ScenariosPage from "@/pages/scenarios";
import SavedPage from "@/pages/saved";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function ThemeInit() {
  useEffect(() => {
    // Default to dark mode
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // Always default to dark for this app
    if (!document.documentElement.classList.contains("dark") && !document.documentElement.classList.contains("light")) {
      document.documentElement.classList.add("dark");
    }
  }, []);
  return null;
}

function AppRouter() {
  const { isOnboarded } = useStore();

  if (!isOnboarded) {
    return <OnboardingPage />;
  }

  return (
    <Switch>
      <Route path="/" component={DiscoverPage} />
      <Route path="/scenarios" component={ScenariosPage} />
      <Route path="/saved" component={SavedPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const store = useStoreProvider();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreContext.Provider value={store}>
        <TooltipProvider>
          <ThemeInit />
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </TooltipProvider>
      </StoreContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
