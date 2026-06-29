import { Link, useLocation } from "wouter";
import {
  Compass,
  Heart,
  Camera,
  Bot,
  Flame,
  User,
  Mountain,
  Plane,
  Bookmark,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { PerplexityAttribution } from "./PerplexityAttribution";

const navItems = [
  { href: "/", label: "Discover", icon: Compass, description: "New & Next" },
  { href: "/date-night", label: "Date Night", icon: Heart, description: "For two" },
  { href: "/solo", label: "Solo", icon: User, description: "Just me" },
  { href: "/weekend", label: "Weekend", icon: Mountain, description: "Adventures" },
  { href: "/travel", label: "Travel", icon: Plane, description: "Get out" },
  { href: "/camera", label: "Camera", icon: Camera, description: "Worth the shot" },
  { href: "/saved", label: "Saved", icon: Bookmark, description: "My picks" },
  { href: "/agent", label: "Agent", icon: Bot, description: "Run history" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-card shrink-0">
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Flame className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">DownTime</h1>
              <p className="text-[11px] text-muted-foreground leading-none">DFW Discovery</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="block leading-tight">{item.label}</span>
                    <span className="block text-[11px] opacity-60 leading-tight">{item.description}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-border">
          <PerplexityAttribution />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center px-4">
        <button
          data-testid="button-mobile-menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 -ml-2 rounded-md hover:bg-accent/50"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2 ml-3">
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">DownTime</span>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm pt-14">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base cursor-pointer ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
}
