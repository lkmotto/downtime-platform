import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "./components/AppShell";
import Dashboard from "./pages/dashboard";
import ScenarioPage from "./pages/scenario";
import SavedPage from "./pages/saved";
import CameraPage from "./pages/camera";
import AgentPage from "./pages/agent";
import NotFound from "./pages/not-found";
import { DataProvider } from "./lib/DataContext";

function AppRouter() {
  return (
    <Router hook={useHashLocation}>
      <DataProvider>
        <AppShell>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/date-night" component={() => <ScenarioPage scenario="date-night" />} />
            <Route path="/solo" component={() => <ScenarioPage scenario="solo" />} />
            <Route path="/weekend" component={() => <ScenarioPage scenario="weekend-adventure" />} />
            <Route path="/travel" component={() => <ScenarioPage scenario="travel" />} />
            <Route path="/saved" component={SavedPage} />
            <Route path="/camera" component={CameraPage} />
            <Route path="/agent" component={AgentPage} />
            <Route component={NotFound} />
          </Switch>
        </AppShell>
      </DataProvider>
    </Router>
  );
}

function App() {
  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}

export default App;
