import { ReactNode, useState } from "react";
import { Menu, ShieldAlert } from "lucide-react";
import { EocSidebar } from "./Sidebar";
import { PersonaProvider } from "@/context/PersonaContext";

export function AppShell({ children }: { children: ReactNode }) {
  // Mobile drawer open state. AppShell remounts per route, so this naturally
  // resets to closed on navigation (drawer auto-closes after picking a link).
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <PersonaProvider>
      {/*
        Flexbox shell — no margin-left / width:calc hacks.
        Sidebar is an in-flow sticky column on desktop (reserves exactly its own
        width, so collapsing it lets `main` reclaim the space automatically) and
        a fixed overlay drawer on mobile (reserves no space at all).
        `min-w-0` on main is what lets charts/tables shrink instead of overflowing.
      */}
      <div className="flex w-full min-h-screen bg-background text-foreground overflow-x-clip">
        <EocSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        {/* Mobile backdrop — only rendered while the drawer is open, sits beneath it. */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] md:hidden"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-clip">
          {/* Mobile top bar with hamburger — desktop hides this entirely. */}
          <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 h-12 px-4 border-b border-border bg-background/95 backdrop-blur">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="h-8 w-8 grid place-items-center rounded-md text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo to-ai grid place-items-center">
                <ShieldAlert className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="tracking-[0.18em] font-bold text-sm">neuGAIN</span>
            </div>
          </div>

          {children}
        </main>
      </div>
    </PersonaProvider>
  );
}
