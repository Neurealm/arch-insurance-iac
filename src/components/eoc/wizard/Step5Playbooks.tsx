import { BookOpen, Search, Sparkles, ArrowDown, CheckCircle2, UserCheck, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const runbooks = [
  { name: "High Priority Incident Response", cat: "Incident Management", selected: true },
  { name: "Major Outage Response", cat: "Infrastructure", selected: true },
  { name: "Security Incident Triage", cat: "Security Operations", selected: true },
  { name: "Change Failure Recovery", cat: "Change Management", selected: false },
  { name: "Vendor SLA Breach Handling", cat: "Vendor Management", selected: false },
  { name: "Database Performance Degradation", cat: "IT Operations", selected: false },
  { name: "Service Request Fulfillment", cat: "Service Management", selected: false },
  { name: "Phishing Alert Investigation", cat: "Security Operations", selected: false },
];

const flow = [
  { n: 1, title: "Detect & Enrich", desc: "Ingest alerts, correlate events, and enrich with context.", type: "auto" },
  { n: 2, title: "Assess & Classify", desc: "Determine severity, impact, and affected services.", type: "auto" },
  { n: 3, title: "Notify & Escalate", desc: "Notify stakeholders and create incident record.", type: "approval" },
  { n: 4, title: "Investigate & Diagnose", desc: "Gather diagnostics and identify root cause.", type: "auto" },
  { n: 5, title: "Remediate", desc: "Execute fix or workaround.", type: "approval" },
  { n: 6, title: "Validate & Close", desc: "Validate resolution and close the incident.", type: "auto" },
];

export function Step5Playbooks() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo/10 text-indigo grid place-items-center"><BookOpen className="h-5 w-5" /></div>
        <div>
          <h2 className="text-lg font-bold">Step 5: Playbooks & Runbooks</h2>
          <p className="text-sm text-muted-foreground">Load, customize, and orchestrate operational response models to automate actions and drive consistent outcomes.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: "Runbooks Available", v: "128", s: "Total in Library" },
          { l: "Selected for Deployment", v: "24", s: "Runbooks" },
          { l: "Automation Workflows", v: "18", s: "Associated" },
          { l: "Escalation Templates", v: "9", s: "Configured" },
          { l: "Vendor Workflows", v: "7", s: "Integrated" },
        ].map((s) => (
          <div key={s.l} className="bg-card border border-border rounded-2xl p-4">
            <div className="text-[11px] text-muted-foreground font-medium">{s.l}</div>
            <div className="text-xl font-bold mt-1">{s.v}</div>
            <div className="text-[10px] text-muted-foreground">{s.s}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12 lg:col-span-4 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold">1. Runbook Library</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Browse and select runbooks to include in your deployment.</p>
          <div className="relative mb-3">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search runbooks…" className="pl-9 h-9" />
          </div>
          <ul className="space-y-1.5">
            {runbooks.map((r) => (
              <li key={r.name} className={cn("flex items-center justify-between p-2.5 rounded-lg border", r.selected ? "border-indigo/30 bg-accent" : "border-border")}>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{r.name}</div>
                  <div className="text-[10px] text-muted-foreground">{r.cat}</div>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-md shrink-0",
                  r.selected ? "bg-status-healthy text-white" : "bg-secondary text-foreground",
                )}>{r.selected ? "Selected" : "Select"}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="col-span-12 lg:col-span-5 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold">2. Response Flow Builder</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Design and customize the response flow for selected runbooks.</p>
          <div className="text-xs font-semibold mb-3 px-3 py-2 rounded-lg bg-secondary inline-block">High Priority Incident Response · v3.2</div>
          <ol className="space-y-2">
            {flow.map((f, i) => (
              <li key={f.n}>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
                  <span className={cn(
                    "h-8 w-8 rounded-full grid place-items-center text-xs font-bold",
                    f.type === "auto" ? "bg-status-healthy-soft text-status-healthy" : "bg-status-warning-soft text-status-warning",
                  )}>{f.n}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{f.title}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{f.desc}</div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-md shrink-0",
                    f.type === "auto" ? "bg-status-healthy-soft text-status-healthy" : "bg-status-warning-soft text-status-warning",
                  )}>{f.type === "auto" ? "Automated" : "Approval Required"}</span>
                </div>
                {i < flow.length - 1 && <div className="flex justify-start pl-4 my-0.5"><ArrowDown className="h-3 w-3 text-muted-foreground" /></div>}
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-status-healthy" />Automated Step</span>
            <span className="flex items-center gap-1"><UserCheck className="h-3 w-3 text-status-warning" />Human Approval</span>
            <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-indigo" />Conditional Path</span>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-3 space-y-5">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-bold">3. Escalation & Communication</h3>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Tiered Incident Escalation</p>
            <div className="space-y-2">
              {[
                ["Tier 1","NOC Analyst","0–15 min"],
                ["Tier 2","Incident Manager","15–30 min"],
                ["Tier 3","Domain Expert","30–60 min"],
                ["Tier 4","Operations Director","60+ min"],
              ].map(([t, who, range]) => (
                <div key={t} className="flex items-center justify-between p-2 rounded-lg bg-secondary/40 text-xs">
                  <div>
                    <div className="font-bold">{t}</div>
                    <div className="text-[10px] text-muted-foreground">{who}</div>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{range}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-bold">4. Vendor Workflows</h3>
            <ul className="mt-2 space-y-2 text-xs">
              {[["Network Provider (AT&T)","Outage Mgmt"],["Cloud Provider (AWS)","Incident Response"],["Security Vendor (CrowdStrike)","Threat Response"]].map(([n, s]) => (
                <li key={n} className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{n}</div>
                    <div className="text-[10px] text-muted-foreground">{s}</div>
                  </div>
                  <span className="text-[10px] font-bold text-status-healthy bg-status-healthy-soft px-2 py-0.5 rounded-md">Active</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}