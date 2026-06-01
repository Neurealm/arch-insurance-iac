import { Rocket, CheckCircle2, AlertTriangle, ShieldCheck, BookOpen, BarChart3, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

const tiles = [
  { l: "Integration Health", v: "100%", s: "All systems healthy", sub: "42 / 42 Connected", icon: CheckCircle2, tone: "healthy" },
  { l: "Policy Validation", v: "98%", s: "Policies validated", sub: "49 / 50 Passed", icon: ShieldCheck, tone: "indigo" },
  { l: "Runbook Coverage", v: "95%", s: "Coverage adequate", sub: "128 / 135 Runbooks", icon: BookOpen, tone: "info" },
  { l: "KPI Baseline", v: "93%", s: "Baselines established", sub: "12 / 13 KPIs Set", icon: BarChart3, tone: "warning" },
  { l: "Validation Results", v: "100%", s: "Simulation passed", sub: "18 / 18 Scenarios", icon: FlaskConical, tone: "healthy" },
];

const checklist = [
  ["All Integrations Connected","Required systems are connected and healthy","Passed"],
  ["Data Ingestion & Normalization","Data flows and mappings validated","Passed"],
  ["Policies & Guardrails","Governance policies validated","Passed"],
  ["Runbooks & Automations","Runbooks configured and tested","Passed"],
  ["Validation & Simulation","All scenarios executed successfully","Passed"],
  ["KPI Baseline Established","Baselines and targets defined","Passed"],
  ["Access & Permissions","Roles and access configured","Passed"],
  ["Audit & Logging","Logging, retention and audit enabled","Passed"],
  ["Go-Live Authorization","Executive approval required","Pending"],
];

const toneMap: any = {
  healthy: "bg-status-healthy-soft text-status-healthy",
  indigo: "bg-accent text-indigo",
  info: "bg-status-info-soft text-status-info",
  warning: "bg-status-warning-soft text-status-warning",
};

export function StepReadiness({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo/10 text-indigo grid place-items-center"><Rocket className="h-5 w-5" /></div>
        <div>
          <h2 className="text-lg font-bold">Go-Live Readiness Dashboard</h2>
          <p className="text-sm text-muted-foreground">Review readiness across all dimensions. Ensure all systems are healthy, policies are validated, and your digital coworker is ready for production.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,1fr)_3fr] gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-3">Overall Readiness Score</h3>
          <div className="flex items-center gap-4">
            <div className="relative h-28 w-28 shrink-0">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--status-healthy))" strokeWidth="3.5" strokeDasharray="96 100" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-status-healthy">96%</div>
                  <div className="text-[10px] text-muted-foreground font-semibold">Ready</div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Launch Readiness</div>
              <div className="text-base font-bold text-status-healthy">Excellent</div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">All critical gates passed. Your coworker is ready for production.</p>
            </div>
          </div>
          <button
            onClick={onLaunch}
            className="mt-4 w-full h-11 rounded-xl bg-crimson text-crimson-foreground font-bold text-sm hover:bg-crimson/90 transition shadow-[var(--shadow-md)] inline-flex items-center justify-center gap-2"
          >
            <Rocket className="h-4 w-4" /> Launch Digital Coworker
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {tiles.map((t) => (
            <div key={t.l} className="bg-card border border-border rounded-2xl p-4">
              <div className={cn("h-9 w-9 rounded-xl grid place-items-center mb-2", toneMap[t.tone])}><t.icon className="h-4 w-4" /></div>
              <div className="text-[11px] text-muted-foreground font-medium">{t.l}</div>
              <div className="text-2xl font-bold leading-tight">{t.v}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{t.s}</div>
              <div className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">{t.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12 lg:col-span-5 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-3">Readiness Gate Checklist</h3>
          <ul className="space-y-2">
            {checklist.map(([t, d, st]) => (
              <li key={t} className="flex items-start gap-3 p-2.5 rounded-lg border border-border">
                {st === "Passed" ? (
                  <CheckCircle2 className="h-4 w-4 text-status-healthy mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-status-warning mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold">{t}</div>
                  <div className="text-[10px] text-muted-foreground">{d}</div>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0",
                  st === "Passed" ? "bg-status-healthy-soft text-status-healthy" : "bg-status-warning-soft text-status-warning",
                )}>{st}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="col-span-12 lg:col-span-4 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-3">System Summary</h3>
          <ul className="space-y-2 text-xs">
            {[
              ["Integrations","42 Connected"],
              ["Data Sources","86 Active Streams"],
              ["Digital Coworker","EOC Command Orchestrator v1.0.0"],
              ["Environment","Production"],
              ["Region","US East (N. Virginia)"],
              ["High Availability","Enabled (Multi-AZ)"],
              ["Last Validation","May 14, 2025 10:30 AM"],
              ["Created By","Jane Smith"],
              ["Deployment Owner","John Anderson"],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-semibold">{v}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="col-span-12 lg:col-span-3 bg-gradient-to-br from-accent to-card border border-indigo/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-status-healthy" />
            <h3 className="text-sm font-bold">Launch Authorization</h3>
          </div>
          <div className="text-xs font-semibold text-status-healthy mb-1">Ready for Launch</div>
          <p className="text-[11px] text-muted-foreground mb-4">All readiness gates passed. Authorization required to go live.</p>
          <ul className="space-y-2 text-xs mb-4">
            {[
              ["Technical Review","Alex Morgan","done"],
              ["Security Review","Sarah Chen","done"],
              ["Operations Review","Michael Brown","done"],
              ["Executive Approval","Pending","pending"],
            ].map(([t, n, s]) => (
              <li key={t} className="flex items-center justify-between">
                <span>
                  <div className="font-semibold">{t}</div>
                  <div className="text-[10px] text-muted-foreground">{n}</div>
                </span>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-md",
                  s === "done" ? "bg-status-healthy-soft text-status-healthy" : "bg-status-warning-soft text-status-warning",
                )}>{s === "done" ? "Completed" : "Pending"}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={onLaunch}
            className="w-full h-10 rounded-lg bg-indigo text-indigo-foreground font-bold text-xs hover:bg-indigo/90 transition inline-flex items-center justify-center gap-2"
          >
            <Rocket className="h-3.5 w-3.5" /> Approve Go-Live Launch
          </button>
        </section>
      </div>
    </div>
  );
}