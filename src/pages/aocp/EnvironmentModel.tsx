import { AppShell } from "@/components/eoc/AppShell";
import { useNavigate } from "react-router-dom";
import {
  Bot, ChevronRight, CheckCircle2, AlertTriangle, Clock,
  Cloud, Server, Monitor, Database, Globe, Shield, Sparkles,
  ExternalLink, Activity, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl bg-card border border-border p-4 shadow-sm", className)}>{children}</div>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{children}</h3>;
}
function Badge({ label, tone }: { label: string; tone: "green" | "amber" | "red" | "blue" | "slate" }) {
  const cls = { green: "bg-emerald-50 text-emerald-700 border-emerald-200", amber: "bg-amber-50 text-amber-700 border-amber-200", red: "bg-rose-50 text-rose-700 border-rose-200", blue: "bg-blue-50 text-blue-700 border-blue-200", slate: "bg-slate-50 text-slate-600 border-slate-200" }[tone];
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-semibold", cls)}>{label}</span>;
}

const navTabs = [
  { label: "Profile", to: "/aocp/claims-processing" },
  { label: "Environments", to: "#", active: true },
  { label: "Criticality", to: "/aocp/claims-processing/criticality" },
  { label: "Outcomes", to: "/aocp/claims-processing/outcomes" },
  { label: "Architecture", to: "/aocp/claims-processing/architecture" },
  { label: "Lifecycle", to: "/aocp/claims-processing/lifecycle" },
  { label: "Admin Model", to: "/aocp/claims-processing/admin" },
];

const envKpis = [
  { label: "Total Environments", value: "10", color: "#3b82f6", icon: Layers2 },
  { label: "Production Env", value: "1", color: "#10b981", icon: CheckCircle2 },
  { label: "Non-Prod Envs", value: "9", color: "#8b5cf6", icon: Server },
  { label: "Monitoring Coverage", value: "87%", color: "#10b981", icon: Activity },
  { label: "Topology / Hosting", value: "Hybrid", color: "#f59e0b", icon: Cloud },
  { label: "Backup Compliance", value: "94%", color: "#10b981", icon: Shield },
  { label: "Active Infra Issues", value: "3", color: "#ef4444", icon: AlertTriangle },
  { label: "Environment Drift", value: "2", color: "#f59e0b", icon: AlertTriangle },
];

function Layers2(p: any) { return <Server {...p} />; }

const environments = [
  { name: "Production",          type: "Prod",    hosting: "AWS EKS",       status: "Healthy",    coverage: "100%", backup: "Daily",   db: "Oracle 19c",  last: "Jun 5, 2026",  tone: "green" as const },
  { name: "Pre-Production",      type: "Non-Prod", hosting: "AWS EKS",      status: "Healthy",    coverage: "92%",  backup: "Daily",   db: "Oracle 19c",  last: "Jun 4, 2026",  tone: "green" as const },
  { name: "UAT",                 type: "Non-Prod", hosting: "On-Prem VMware",status: "Healthy",    coverage: "85%",  backup: "Weekly",  db: "Oracle 18c",  last: "Jun 3, 2026",  tone: "green" as const },
  { name: "Performance Testing", type: "Non-Prod", hosting: "AWS EC2",       status: "Healthy",    coverage: "78%",  backup: "Weekly",  db: "Oracle 18c",  last: "Jun 1, 2026",  tone: "green" as const },
  { name: "SIT",                 type: "Non-Prod", hosting: "On-Prem VMware",status: "Warning",    coverage: "72%",  backup: "Weekly",  db: "Oracle 18c",  last: "May 30, 2026", tone: "amber" as const },
  { name: "QA",                  type: "Non-Prod", hosting: "On-Prem VMware",status: "Healthy",    coverage: "80%",  backup: "Weekly",  db: "Oracle 18c",  last: "Jun 2, 2026",  tone: "green" as const },
  { name: "Development",         type: "Non-Prod", hosting: "AWS EC2",       status: "Healthy",    coverage: "65%",  backup: "None",    db: "Oracle 18c",  last: "Jun 5, 2026",  tone: "green" as const },
  { name: "Sandbox",             type: "Non-Prod", hosting: "AWS EC2",       status: "Healthy",    coverage: "60%",  backup: "None",    db: "Postgres 14", last: "May 28, 2026", tone: "green" as const },
  { name: "Training",            type: "Non-Prod", hosting: "On-Prem VMware",status: "Degraded",   coverage: "55%",  backup: "Monthly", db: "Oracle 12c",  last: "May 20, 2026", tone: "red" as const  },
  { name: "DR",                  type: "Prod",    hosting: "AWS EKS",       status: "Healthy",    coverage: "98%",  backup: "Hourly",  db: "Oracle 19c",  last: "Jun 5, 2026",  tone: "green" as const },
];

const topology = [
  { layer: "Load Balancer",    items: ["AWS ALB (Prod)", "AWS ALB (Pre-Prod)"],         icon: Globe },
  { layer: "App Tier",         items: ["EKS Cluster (4 nodes)", "Spring Boot Services"],  icon: Package },
  { layer: "Integration",      items: ["Kafka Cluster", "Redis Cache", "API Gateway"],   icon: Activity },
  { layer: "Data Tier",        items: ["Oracle 19c (Primary)", "Oracle 19c (Standby)"],  icon: Database },
  { layer: "Monitoring",       items: ["Datadog", "Splunk", "PagerDuty"],                icon: Monitor },
];

const novaItems = [
  { icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50", text: "Training env running Oracle 12c — approaching end of support in 3 months" },
  { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", text: "Production & DR environments fully healthy with 100% monitoring coverage" },
  { icon: Clock, color: "text-amber-500", bg: "bg-amber-50", text: "SIT environment at 72% coverage — below 80% threshold" },
];

export default function EnvironmentModel() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="flex flex-col min-h-screen bg-background">
        {/* top bar */}
        <header className="border-b border-border bg-card px-6 h-14 flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="cursor-pointer hover:text-foreground" onClick={() => navigate("/crm")}>CRM</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="cursor-pointer hover:text-foreground">Claims Processing Platform</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">Environment Model</span>
          </div>
          <div className="flex-1" />
          {[["Customer","Molina Corp"],["Platform","Claims Processing"],["AOCP Phase","Discovery"],["Completeness","72%"],["Last Updated","Jun 5, 2026"]].map(([k,v]) => (
            <div key={k} className="hidden xl:flex flex-col leading-tight border-l border-border pl-4">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</span>
              {v && <span className="text-[12px] font-semibold">{v}</span>}
            </div>
          ))}
          <button className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700"><Bot className="h-3.5 w-3.5" /> Ask NOVA</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-accent"><ExternalLink className="h-3.5 w-3.5" /> Export</button>
        </header>

        {/* tabs */}
        <nav className="border-b border-border bg-card px-6 flex gap-1 shrink-0">
          {navTabs.map(t => (
            <button key={t.label} onClick={() => !t.active && navigate(t.to)}
              className={cn("px-4 py-2.5 text-[12px] font-semibold border-b-2 transition-colors",
                t.active ? "border-violet-600 text-violet-600" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {t.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 p-5 space-y-4 overflow-auto">
          {/* KPI strip */}
          <div className="grid grid-cols-4 xl:grid-cols-8 gap-3">
            {envKpis.map(k => (
              <Card key={k.label} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-md grid place-items-center shrink-0" style={{ background: `${k.color}1a`, color: k.color }}>
                    <k.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground leading-tight">{k.label}</span>
                </div>
                <div className="text-[22px] font-bold">{k.value}</div>
              </Card>
            ))}
          </div>

          {/* Row 2: Topology + Summary + NOVA */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Topology */}
            <Card className="xl:col-span-4">
              <SectionTitle>Environment Topology Map</SectionTitle>
              <div className="space-y-2">
                {topology.map((t, i) => (
                  <div key={t.layer}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-6 w-6 rounded-md bg-blue-50 text-blue-600 grid place-items-center shrink-0">
                        <t.icon className="h-3 w-3" />
                      </div>
                      <span className="text-[11px] font-bold">{t.layer}</span>
                    </div>
                    <div className="ml-8 flex flex-wrap gap-1.5 mb-2">
                      {t.items.map(item => (
                        <span key={item} className="px-2 py-0.5 rounded-md bg-accent border border-border text-[10px] font-medium">{item}</span>
                      ))}
                    </div>
                    {i < topology.length - 1 && (
                      <div className="ml-3 h-3 w-px bg-border mx-auto" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-2 text-center">
                {[["Prod","AWS EKS","green"],["Non-Prod","Hybrid","blue"],["DR","AWS EKS","emerald"]].map(([e,h,c]) => (
                  <div key={e} className={`rounded-lg p-2 bg-${c}-50 border border-${c}-100`}>
                    <div className={`text-[11px] font-bold text-${c}-700`}>{e}</div>
                    <div className="text-[10px] text-muted-foreground">{h}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Environment Summary */}
            <Card className="xl:col-span-4">
              <SectionTitle>Environment Summary</SectionTitle>
              <div className="space-y-2 text-[12px]">
                {[
                  ["Total Environments", "10"],
                  ["Production", "1 (AWS EKS)"],
                  ["Disaster Recovery", "1 (AWS EKS)"],
                  ["Non-Production", "8 (Mixed)"],
                  ["Hosting Model", "Hybrid (AWS + On-Prem)"],
                  ["Container Platform", "AWS EKS"],
                  ["VM Platform", "VMware vSphere"],
                  ["Database Platform", "Oracle 19c / 18c / 12c"],
                  ["Avg Monitoring Coverage", "87%"],
                  ["Environments Below Threshold", "2 (SIT, Training)"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* NOVA */}
            <Card className="xl:col-span-4 border-violet-200 bg-violet-50/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-violet-600 text-white grid place-items-center"><Sparkles className="h-3.5 w-3.5" /></div>
                <span className="text-[12px] font-bold text-violet-700">NOVA Digital Coworker</span>
              </div>
              <p className="text-[11px] text-violet-800 mb-3 leading-relaxed">Environment insights for <strong>Claims Processing Platform</strong></p>
              <div className="space-y-2 mb-4">
                {novaItems.map((n, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-violet-100">
                    <div className={cn("h-6 w-6 rounded-md grid place-items-center shrink-0 mt-0.5", n.bg)}>
                      <n.icon className={cn("h-3 w-3", n.color)} />
                    </div>
                    <p className="text-[11px] leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-violet-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700 mb-2">Coverage by Environment</div>
                {environments.filter(e => ["Production","Pre-Production","UAT","SIT","DR"].includes(e.name)).map(e => (
                  <div key={e.name} className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] w-28 text-muted-foreground truncate">{e.name}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: e.coverage }} />
                    </div>
                    <span className="text-[10px] font-semibold w-8 text-right">{e.coverage}</span>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700">
                <Bot className="h-3.5 w-3.5" /> Ask NOVA a Question
              </button>
            </Card>
          </div>

          {/* Environment table */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle>Environment Inventory & Support Coverage</SectionTitle>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700">
                <ExternalLink className="h-3 w-3" /> Export Environments
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border">
                    {["Environment","Type","Hosting","Status","Mon. Coverage","Backup","Database","Last Verified"].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {environments.map(e => (
                    <tr key={e.name} className="border-b border-border hover:bg-accent/40">
                      <td className="py-2 px-3 font-semibold">{e.name}</td>
                      <td className="py-2 px-3"><Badge label={e.type} tone={e.type === "Prod" ? "red" : "blue"} /></td>
                      <td className="py-2 px-3 text-muted-foreground">{e.hosting}</td>
                      <td className="py-2 px-3"><Badge label={e.status} tone={e.tone} /></td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden w-16">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: e.coverage }} />
                          </div>
                          <span className="font-semibold">{e.coverage}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{e.backup}</td>
                      <td className="py-2 px-3 text-muted-foreground">{e.db}</td>
                      <td className="py-2 px-3 text-muted-foreground">{e.last}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
    </AppShell>
  );
}
