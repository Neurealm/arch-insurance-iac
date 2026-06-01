import { FlaskConical, Play, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { l: "Scenarios Available", v: "24", icon: FlaskConical, tone: "indigo" },
  { l: "Simulations Run", v: "18", icon: Play, tone: "info" },
  { l: "Passed", v: "16", icon: CheckCircle2, tone: "healthy" },
  { l: "Needs Review", v: "2", icon: AlertTriangle, tone: "warning" },
  { l: "Failed", v: "0", icon: XCircle, tone: "critical" },
  { l: "Avg. Response Time", v: "2m 34s", icon: Clock, tone: "muted" },
];

const scenarios = [
  { name: "Major Outage Simulation", cat: "Outage", crit: "Critical", status: "Passed" },
  { name: "Security Breach Simulation", cat: "Security", crit: "Critical", status: "Passed" },
  { name: "Vendor SLA Breach", cat: "Vendor", crit: "High", status: "Passed" },
  { name: "Change Risk Simulation", cat: "Change", crit: "High", status: "Needs Review" },
  { name: "Cloud Region Failure", cat: "Outage", crit: "High", status: "Passed" },
  { name: "Data Leak Detection", cat: "Security", crit: "Medium", status: "Passed" },
];

const toneMap: any = {
  indigo: "bg-accent text-indigo",
  info: "bg-status-info-soft text-status-info",
  healthy: "bg-status-healthy-soft text-status-healthy",
  warning: "bg-status-warning-soft text-status-warning",
  critical: "bg-status-critical-soft text-status-critical",
  muted: "bg-secondary text-muted-foreground",
};

export function Step6Validation() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo/10 text-indigo grid place-items-center"><FlaskConical className="h-5 w-5" /></div>
        <div>
          <h2 className="text-lg font-bold">Step 6: Validation & Simulation Lab</h2>
          <p className="text-sm text-muted-foreground">Test your digital coworker with realistic scenarios to validate responses, automations, and guardrails before going live.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stats.map((s) => (
          <div key={s.l} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-xl grid place-items-center", toneMap[s.tone])}><s.icon className="h-5 w-5" /></div>
            <div className="min-w-0">
              <div className="text-[11px] text-muted-foreground font-medium truncate">{s.l}</div>
              <div className="text-base font-bold leading-tight">{s.v}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12 lg:col-span-8 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-3">Scenario Library</h3>
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left py-2 font-bold">Scenario</th>
                <th className="text-left py-2 font-bold">Category</th>
                <th className="text-left py-2 font-bold">Criticality</th>
                <th className="text-left py-2 font-bold">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.name} className="border-b border-border last:border-0">
                  <td className="py-3 font-semibold">{s.name}</td>
                  <td className="py-3 text-muted-foreground">{s.cat}</td>
                  <td className="py-3">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md",
                      s.crit === "Critical" && "bg-status-critical-soft text-status-critical",
                      s.crit === "High" && "bg-status-warning-soft text-status-warning",
                      s.crit === "Medium" && "bg-status-info-soft text-status-info",
                    )}>{s.crit}</span>
                  </td>
                  <td className="py-3">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md",
                      s.status === "Passed" && "bg-status-healthy-soft text-status-healthy",
                      s.status === "Needs Review" && "bg-status-warning-soft text-status-warning",
                    )}>{s.status}</span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-[11px] font-semibold text-indigo">Run</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="col-span-12 lg:col-span-4 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-3">Live Simulation Timeline</h3>
          <ol className="space-y-3">
            {[
              ["Scenario Initiated","10:30 AM","done"],
              ["Events Injected — 28 synthetic","10:31 AM","done"],
              ["Coworker Response","Pending","pending"],
              ["Automation Execution","Pending","pending"],
              ["Validation & Scoring","Pending","pending"],
            ].map(([t, when, state]) => (
              <li key={t} className="flex items-start gap-3">
                <span className={cn(
                  "h-6 w-6 rounded-full grid place-items-center shrink-0 text-[10px] font-bold",
                  state === "done" ? "bg-status-healthy text-white" : "bg-secondary text-muted-foreground border border-border",
                )}>{state === "done" ? "✓" : "•"}</span>
                <div className="flex-1">
                  <div className="text-xs font-semibold">{t}</div>
                  <div className="text-[10px] text-muted-foreground">{when}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="col-span-12 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Validation Summary (Last 18 Simulations)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            {[
              ["Detection Accuracy","94%","≥ 90%"],
              ["Response Accuracy","92%","≥ 90%"],
              ["Automation Success","91%","≥ 90%"],
              ["Policy Compliance","100%","= 100%"],
              ["Avg. Response Time","2m 34s","≤ 5m 00s"],
            ].map(([l, v, t]) => (
              <div key={l}>
                <div className="text-xs text-muted-foreground">{l}</div>
                <div className="text-2xl font-bold mt-1">{v}</div>
                <div className="text-[10px] text-muted-foreground">Target {t}</div>
                <div className="h-1.5 rounded bg-secondary mt-2 overflow-hidden">
                  <div className="h-full bg-status-healthy" style={{ width: v.includes("%") ? v : "82%" }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}