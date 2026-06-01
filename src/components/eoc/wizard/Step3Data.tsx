import { Database, ArrowRight, ShieldAlert, FileText, AlertTriangle, GitBranch, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sources = [
  { name: "Splunk Enterprise", sub: "Logs" },
  { name: "Datadog", sub: "Metrics & Logs" },
  { name: "New Relic", sub: "APM & Metrics" },
  { name: "ServiceNow", sub: "ITSM" },
  { name: "CrowdStrike", sub: "Security Events" },
  { name: "Microsoft Azure", sub: "Cloud Telemetry" },
  { name: "AWS CloudWatch", sub: "Metrics & Logs" },
  { name: "Jira Software", sub: "Issues & Changes", progress: true },
];

const mappings = [
  { from: "Security Events", to: "Security Event", icon: ShieldAlert, color: "critical" },
  { from: "Infrastructure Metric", to: "Metric", icon: Database, color: "indigo" },
  { from: "Application Log", to: "Log Event", icon: FileText, color: "info" },
  { from: "Incident", to: "Incident", icon: AlertTriangle, color: "warning" },
  { from: "Change Record", to: "Change Event", icon: GitBranch, color: "healthy" },
];

const severities = [
  { src: "Critical", uni: "Critical", pri: "P1", color: "bg-status-critical" },
  { src: "High", uni: "High", pri: "P2", color: "bg-status-warning" },
  { src: "Medium", uni: "Medium", pri: "P3", color: "bg-status-info" },
  { src: "Low", uni: "Low", pri: "P4", color: "bg-indigo" },
  { src: "Informational", uni: "Informational", pri: "P5", color: "bg-muted-foreground" },
];

const colorMap: any = {
  critical: "bg-status-critical-soft text-status-critical",
  warning: "bg-status-warning-soft text-status-warning",
  info: "bg-status-info-soft text-status-info",
  healthy: "bg-status-healthy-soft text-status-healthy",
  indigo: "bg-accent text-indigo",
};

export function Step3Data() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo/10 text-indigo grid place-items-center"><Database className="h-5 w-5" /></div>
        <div>
          <h2 className="text-lg font-bold">Step 3: Data Mapping & Signal Normalization</h2>
          <p className="text-sm text-muted-foreground">Map data sources to the unified data model, normalize signals, and define how events are interpreted and prioritized.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Sources */}
        <section className="col-span-12 lg:col-span-3 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold">1. Data Sources</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Select and map your data sources.</p>
          <ul className="space-y-1.5">
            {sources.map((s) => (
              <li key={s.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50">
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{s.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{s.sub}</div>
                </div>
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                  s.progress ? "bg-status-warning-soft text-status-warning" : "bg-status-healthy-soft text-status-healthy",
                )}>
                  {s.progress ? "In Progress" : "Connected"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Flow */}
        <section className="col-span-12 lg:col-span-6 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold">2. Signal Mapping & Normalization</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Map source data to unified signal classes.</p>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            <span>Source Signals</span><span></span><span>Unified Signal Class</span>
          </div>
          <div className="space-y-2">
            {mappings.map((m) => (
              <div key={m.from} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className={cn("flex items-center gap-2 p-2.5 rounded-xl border border-border", colorMap[m.color])}>
                  <m.icon className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-semibold truncate">{m.from}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card">
                  <m.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-xs font-semibold truncate">{m.to}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Severity */}
        <section className="col-span-12 lg:col-span-3 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold">3. Severity & Priority Mapping</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Map source severity to unified priority.</p>
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 text-[10px] font-bold text-muted-foreground uppercase pb-2 border-b border-border">
            <span>Source</span><span>Unified</span><span>Pri</span><span></span>
          </div>
          <div className="space-y-2 mt-2">
            {severities.map((s) => (
              <div key={s.src} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2 text-xs">
                <span className="font-semibold">{s.src}</span>
                <span className="text-muted-foreground">{s.uni}</span>
                <span className="font-bold">{s.pri}</span>
                <span className={cn("h-3 w-3 rounded-full", s.color)} />
              </div>
            ))}
          </div>
        </section>

        {/* Quality */}
        <section className="col-span-12 lg:col-span-6 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold">4. Business Service Mapping</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-4">Map signals to the business services they impact.</p>
          <div className="flex items-center gap-6">
            <div className="relative h-32 w-32 shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo via-ai to-status-info opacity-90" />
              <div className="absolute inset-3 bg-card rounded-full grid place-items-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">36</div>
                  <div className="text-[10px] text-muted-foreground">Services Mapped</div>
                </div>
              </div>
            </div>
            <ul className="flex-1 space-y-1.5 text-xs">
              {[
                ["Digital Banking Platform","9 (25%)","bg-indigo"],
                ["Customer Experience","7 (19%)","bg-ai"],
                ["Core Banking Services","6 (17%)","bg-status-info"],
                ["Payments Processing","5 (14%)","bg-status-warning"],
                ["Infrastructure Services","6 (17%)","bg-status-healthy"],
                ["Other Services","3 (8%)","bg-muted-foreground"],
              ].map(([n, v, c]) => (
                <li key={n} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", c)} />{n}</span>
                  <span className="text-muted-foreground">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-3 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold">5. Data Quality & Coverage</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Overall data mapping health.</p>
          <div className="flex items-center gap-3">
            <div className="relative h-20 w-20">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--status-healthy))" strokeWidth="3" strokeDasharray="92 100" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-sm font-bold">92%</div>
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-status-healthy" />Mapped Signals</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-status-healthy" />Coverage 92%</div>
              <div className="flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 text-status-warning" />Unmapped 112</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}