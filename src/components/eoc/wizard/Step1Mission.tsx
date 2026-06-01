import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, Target, Activity, Workflow, Eye, Cloud, ShieldCheck, Building2, Database, Monitor, AlertOctagon, Server } from "lucide-react";
import { cn } from "@/lib/utils";

const objectives = [
  { id: "mttr", title: "Reduce MTTR", desc: "Accelerate incident resolution and reduce downtime.", icon: Activity },
  { id: "eff", title: "Improve Operational Efficiency", desc: "Automate triage, correlation, and routine tasks.", icon: Workflow },
  { id: "vendor", title: "Strengthen Vendor Governance", desc: "Improve SLA adherence and vendor accountability.", icon: Building2 },
  { id: "obs", title: "Enhance Observability", desc: "Unify visibility across infrastructure and services.", icon: Eye },
  { id: "saas", title: "SaaS & Shadow IT Governance", desc: "Discover, govern, and optimize SaaS usage.", icon: Cloud },
  { id: "risk", title: "Risk & Compliance", desc: "Ensure policies, controls, and audit readiness.", icon: ShieldCheck },
];

const domains = [
  { id: "noc", title: "NOC", sub: "Network Operations", icon: Activity },
  { id: "soc", title: "SOC", sub: "Security Operations", icon: ShieldCheck },
  { id: "sre", title: "SRE", sub: "Site Reliability", icon: Server },
  { id: "it", title: "IT Operations", sub: "Infrastructure & Endpoints", icon: Monitor },
  { id: "biz", title: "Business Operations", sub: "Applications & Services", icon: Workflow },
  { id: "cloud", title: "Cloud Operations", sub: "Multi-cloud & Hybrid", icon: Cloud },
  { id: "data", title: "Data Operations", sub: "Databases & Analytics", icon: Database },
  { id: "euc", title: "EUC Operations", sub: "End User Computing", icon: Monitor },
  { id: "dr", title: "DR & Resilience", sub: "Backup & Recovery", icon: AlertOctagon },
];

const kpis = [
  { label: "Mean Time To Resolve (MTTR)", op: "Reduce by", val: 30 },
  { label: "Incident Volume", op: "Reduce by", val: 20 },
  { label: "Change Success Rate", op: "Increase to", val: 95 },
  { label: "SLA Compliance", op: "Increase to", val: 98 },
  { label: "Alert Noise Reduction", op: "Reduce by", val: 40 },
];

export function Step1Mission() {
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const toggleObjective = (id: string) =>
    setSelectedObjectives((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleDomain = (id: string) =>
    setSelectedDomains((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <div className="space-y-6">
      <SectionHeader icon={Target} title="Step 1: Mission & Scope Definition" subtitle="Define the mission, desired outcomes, and operational scope for your EOC Command Orchestrator." />
      <div className="grid grid-cols-12 gap-5">
        {/* Objectives */}
        <Card className="col-span-12 lg:col-span-4">
          <CardTitle num="1" title="Mission & Business Objectives" sub="What do you want this digital coworker to achieve?" />
          <ul className="space-y-2 mt-3">
            {objectives.map((o) => {
              const on = selectedObjectives.includes(o.id);
              return (
                <li
                  key={o.id}
                  onClick={() => toggleObjective(o.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer",
                    on ? "border-indigo/40 bg-accent" : "border-border bg-card hover:bg-secondary/40",
                  )}
                >
                  <span className={cn("h-9 w-9 rounded-lg grid place-items-center shrink-0", on ? "bg-indigo/10 text-indigo" : "bg-secondary text-muted-foreground")}>
                    <o.icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{o.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{o.desc}</div>
                  </div>
                  <Checkbox checked={on} onCheckedChange={() => toggleObjective(o.id)} onClick={(e) => e.stopPropagation()} />
                </li>
              );
            })}
          </ul>
          <button className="mt-3 text-xs font-semibold text-indigo inline-flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Custom Objective
          </button>
        </Card>

        {/* Domains */}
        <Card className="col-span-12 lg:col-span-5">
          <CardTitle num="2" title="Operational Domains (Scope)" sub="Which domains will this coworker operate in?" />
          <div className="grid grid-cols-3 gap-3 mt-3">
            {domains.map((d) => {
              const on = selectedDomains.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDomain(d.id)}
                  className={cn(
                    "rounded-xl p-3 border text-left transition relative",
                    on ? "border-indigo/40 bg-accent" : "border-border bg-card hover:bg-secondary/40",
                  )}
                >
                  <div className={cn("h-8 w-8 rounded-lg grid place-items-center mb-2", on ? "bg-indigo/10 text-indigo" : "bg-secondary text-muted-foreground")}>
                    <d.icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-bold">{d.title}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{d.sub}</div>
                  <Checkbox checked={on} onCheckedChange={() => toggleDomain(d.id)} onClick={(e) => e.stopPropagation()} className="absolute top-2 right-2" />
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-indigo bg-accent border border-indigo/15 rounded-lg px-3 py-2 mt-3">
            You can refine and add domains after deployment.
          </p>
        </Card>

        {/* KPIs */}
        <Card className="col-span-12 lg:col-span-3">
          <CardTitle num="3" title="Key Outcome KPIs" sub="How will we measure success?" />
          <div className="space-y-3 mt-3">
            {kpis.map((k) => (
              <div key={k.label}>
                <div className="text-xs font-semibold mb-1.5">{k.label}</div>
                <div className="flex items-center gap-2">
                  <div className="h-9 px-2.5 rounded-lg border border-border bg-card text-xs font-medium grid place-items-center text-muted-foreground min-w-[88px]">
                    {k.op}
                  </div>
                  <Input defaultValue={k.val} className="h-9 text-xs font-semibold text-right" />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
            ))}
            <button className="text-xs font-semibold text-indigo inline-flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Custom KPI
            </button>
          </div>
        </Card>

        {/* Boundaries + impact */}
        <Card className="col-span-12 lg:col-span-9">
          <CardTitle num="5" title="Operational Boundaries" sub="Define what this coworker can and cannot do." />
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="rounded-xl border border-status-healthy/30 bg-status-healthy-soft p-3">
              <div className="text-xs font-bold text-status-healthy mb-2">In Scope (Can Do)</div>
              <ul className="space-y-1.5 text-xs">
                {["Triage & correlate alerts","Recommend & execute runbooks","Open & update tickets","Escalate to appropriate teams","Generate reports & insights"].map(t => (
                  <li key={t} className="flex items-center gap-2"><span className="text-status-healthy">✓</span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-status-critical/30 bg-status-critical-soft p-3">
              <div className="text-xs font-bold text-status-critical mb-2">Out of Scope (Cannot Do)</div>
              <ul className="space-y-1.5 text-xs">
                {["Make financial commitments","Modify production without approval","Access customer sensitive data","Change security configurations","Approve high-risk changes"].map(t => (
                  <li key={t} className="flex items-center gap-2"><span className="text-status-critical">✕</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-3">
          <CardTitle num="6" title="Business Impact Areas" sub="Which business services will be impacted?" />
          <div className="space-y-2 mt-3">
            {[
              { name: "Digital Banking Platform", level: "High" },
              { name: "Customer Experience Portal", level: "High" },
              { name: "Loan Origination System", level: "Medium" },
              { name: "Core Banking Services", level: "High" },
              { name: "Employee Productivity Suite", level: "Medium" },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="font-medium">{s.name}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-md font-bold text-[10px]",
                  s.level === "High" ? "bg-status-critical-soft text-status-critical" : "bg-status-warning-soft text-status-warning",
                )}>{s.level}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-xl bg-indigo/10 text-indigo grid place-items-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function Card({ children, className }: any) {
  return <section className={cn("bg-card rounded-2xl border border-border p-5", className)}>{children}</section>;
}
function CardTitle({ num, title, sub }: any) {
  return (
    <div>
      <h3 className="text-sm font-bold">{num}. {title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}