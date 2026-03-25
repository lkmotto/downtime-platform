import { Compass, Layers, Bookmark, User } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useStore } from "@/lib/store";

const NAV_ITEMS = [
  { path: "/", label: "Discover", icon: Compass },
  { path: "/scenarios", label: "Scenarios", icon: Layers },
  { path: "/saved", label: "Saved", icon: Bookmark },
  { path: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const [location] = useLocation();
  const { savedEventIds } = useStore();
  const savedCount = savedEventIds.size;

  return (
    <nav
      data-testid="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border bg-background/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path || (item.path === "/" && location === "");
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.label === "Saved" && savedCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                    {savedCount > 9 ? "9+" : savedCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { savedEventIds, city } = useStore();
  const savedCount = savedEventIds.size;

  return (
    <aside
      data-testid="sidebar"
      className="hidden md:flex flex-col w-[240px] h-screen fixed left-0 top-0 bg-sidebar border-r border-sidebar-border z-40"
    >
      {/* Logo */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="DownTime logo">
            <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
            <path d="M14 8v6l4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
            <circle cx="14" cy="14" r="2" fill="currentColor" className="text-accent" />
          </svg>
          <span className="font-display text-lg font-semibold text-foreground tracking-tight">DownTime</span>
        </div>
        {city && (
          <p className="text-xs text-muted-foreground mt-2 ml-[38px]">{city.display}</p>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path || (item.path === "/" && location === "");
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              data-testid={`sidebar-${item.label.toLowerCase()}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.label === "Saved" && savedCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
                    {savedCount > 9 ? "9+" : savedCount}
                  </span>
                )}
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <a
          href="https://www.perplexity.ai/computer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Created with Perplexity Computer
        </a>
      </div>
    </aside>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="md:ml-[240px] pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
