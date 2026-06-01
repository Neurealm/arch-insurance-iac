import { Bell, Search, Clock, ChevronDown, History } from "lucide-react";
import { PersonaToggle } from "./PersonaToggle";

const ranges = ["Last 15 Minutes", "Last 1 Hour", "Last 24 Hours", "Last 7 Days"];

export function TopBanner() {
  return (
    <header className="bg-card border-b border-border">
      <div className="px-8 pt-5 pb-4 flex items-start gap-6">
        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time operational intelligence across your enterprise
          </p>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-[480px] mt-1">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search for services, incidents, vendors, and more…"
            className="w-full h-11 pl-10 pr-12 rounded-xl bg-secondary/60 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card transition"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground bg-card border border-border rounded px-1.5 py-0.5">
            /
          </kbd>
        </div>

        {/* Time range */}
        <button className="h-11 px-4 rounded-xl border border-border bg-card flex items-center gap-2 text-sm font-medium text-foreground hover:bg-secondary transition mt-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {ranges[0]}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Notifications */}
        <div className="flex items-center gap-3 mt-1">
          <button className="relative h-11 w-11 rounded-xl border border-border bg-card grid place-items-center hover:bg-secondary transition">
            <Bell className="h-[18px] w-[18px] text-foreground" />
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 grid place-items-center text-[10px] font-bold rounded-full bg-status-critical text-white">
              7
            </span>
          </button>
          <button className="h-11 w-11 rounded-xl border border-border bg-card grid place-items-center hover:bg-secondary transition">
            <History className="h-[18px] w-[18px] text-foreground" />
          </button>

          {/* Profile pill is rendered globally by AppShell */}
          <div className="w-[260px]" aria-hidden />
        </div>
      </div>

      {/* Persona toggle row */}
      <div className="px-8 pb-4 flex items-center justify-end">
        <span className="text-xs font-medium text-muted-foreground mr-3">View as</span>
        <PersonaToggle />
      </div>
    </header>
  );
}