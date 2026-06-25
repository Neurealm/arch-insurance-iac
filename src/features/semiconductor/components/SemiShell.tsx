import { ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { ScenarioProvider, useScenario, SCENARIOS, type ScenarioId, type WorkshopMode } from "../state/ScenarioContext";
import { Pause, Play, RotateCcw, Network, NotebookPen, ChevronUp, ChevronDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/semiconductor/command-center", label: "Command Center" },
  { to: "/semiconductor/digital-twin", label: "Factory Digital Twin" },
  { to: "/semiconductor/production-flow", label: "Production Flow" },
  { to: "/semiconductor/physical-automation", label: "Physical Automation" },
  { to: "/semiconductor/vision-operations", label: "Vision Operations" },
  { to: "/semiconductor/operations-intelligence", label: "Operations Intelligence" },
  { to: "/semiconductor/resource-optimization", label: "Resource Optimization" },
  { to: "/semiconductor/knowledge-graph", label: "Knowledge Graph" },
  { to: "/semiconductor/proof-of-value", label: "Proof of Value" },
];

function HeaderBar() {
  const s = useScenario();
  const time = s.clock.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Chicago" });
  return (
    <div className="border-b border-border bg-card">
      <div className="px-4 lg:px-6 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo to-blue-500 grid place-items-center text-white font-bold text-[11px]">NG</div>
          <div>
            <div className="font-semibold text-sm text-foreground leading-tight">NeuGAIN Semiconductor Operations Digital Twin</div>
            <div className="text-muted-foreground text-[11px]">North Texas Reference Fab 01 · DFW</div>
          </div>
        </div>
        <div className="h-8 w-px bg-border mx-1" />
        <label className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Scenario</span>
          <select
            className="h-7 rounded border border-border bg-background px-2 text-xs"
            value={s.scenarioId}
            onChange={(e) => s.setScenario(e.target.value as ScenarioId)}
          >
            {Object.entries(SCENARIOS).map(([id, sc]) => (
              <option key={id} value={id}>{sc.label}</option>
            ))}
          </select>
        </label>
        <StatusPill status={s.scenarioStatus} />
        <label className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Mode</span>
          <select
            className="h-7 rounded border border-border bg-background px-2 text-xs"
            value={s.workshopMode}
            onChange={(e) => s.setWorkshopMode(e.target.value as WorkshopMode)}
          >
            <option value="guided">Guided Workshop</option>
            <option value="explore">Explore</option>
            <option value="co-design">Co-Design</option>
          </select>
        </label>
        <div className="text-muted-foreground"><span className="font-medium text-foreground">{s.shift}</span> · {time} CT</div>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => s.setPaused(!s.paused)}
            className="h-7 px-2 rounded border border-border bg-background hover:bg-accent inline-flex items-center gap-1"
          >
            {s.paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {s.paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={s.reset}
            className="h-7 px-2 rounded border border-border bg-background hover:bg-accent inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <NavLink
            to="/semiconductor/knowledge-graph"
            className="h-7 px-2 rounded border border-border bg-background hover:bg-accent inline-flex items-center gap-1"
          >
            <Network className="h-3.5 w-3.5" /> Architecture
          </NavLink>
          <NavLink
            to="/semiconductor/facilitator"
            className="h-7 px-2 rounded border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 inline-flex items-center gap-1"
            title="Internal Facilitator Mode"
          >
            <NotebookPen className="h-3.5 w-3.5" /> Facilitator
          </NavLink>
        </div>
      </div>
      <div className="px-4 lg:px-6 py-1.5 bg-amber-50 border-t border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span>
          Synthetic reference factory data for workshop demonstration. Not Texas Instruments production data. Representative capability, not a live production connection.
        </span>
      </div>
      <nav className="px-2 lg:px-4 flex items-center gap-1 overflow-x-auto border-t border-border bg-background">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              cn(
                "px-3 py-2 text-xs whitespace-nowrap border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-indigo text-indigo font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Baseline" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : status === "Candidate Applied" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : status === "Approval Required" || status === "Recommendation Pending" ? "bg-amber-50 text-amber-800 border-amber-200"
    : "bg-blue-50 text-blue-700 border-blue-200";
  return <span className={cn("h-6 px-2 inline-flex items-center rounded-full border text-[11px] font-medium", tone)}>{status}</span>;
}

function EventTimeline() {
  const [open, setOpen] = useState(true);
  const { timeline } = useScenario();
  return (
    <div className="sticky bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 lg:px-6 py-1.5 text-xs"
      >
        <span className="font-semibold text-foreground">Global Event Timeline</span>
        <span className="flex items-center gap-2 text-muted-foreground">
          {timeline.length} events {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </span>
      </button>
      {open && (
        <div className="max-h-40 overflow-y-auto px-4 lg:px-6 pb-2">
          <table className="w-full text-[11px]">
            <tbody>
              {timeline.slice(0, 25).map((e) => (
                <tr key={e.id} className="border-t border-border/60">
                  <td className="py-1 pr-3 text-muted-foreground tabular-nums w-12">{e.ts}</td>
                  <td className="py-1 pr-3 w-28">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-medium",
                      e.severity === "critical" ? "bg-red-50 text-red-700" :
                      e.severity === "warning" ? "bg-amber-50 text-amber-800" :
                      e.severity === "success" ? "bg-emerald-50 text-emerald-700" :
                      "bg-slate-100 text-slate-700"
                    )}>{e.domain}</span>
                  </td>
                  <td className="py-1 pr-3 text-foreground">{e.title}</td>
                  <td className="py-1 pr-3 text-muted-foreground w-40 truncate">{e.entity}</td>
                  <td className="py-1 text-muted-foreground w-28">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ShellInner({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderBar />
      <div className="flex-1 bg-[#f7f8fa]">{children}</div>
      <EventTimeline />
    </div>
  );
}

export function SemiShell({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <ScenarioProvider>
        <ShellInner>{children}</ShellInner>
      </ScenarioProvider>
    </AppShell>
  );
}
