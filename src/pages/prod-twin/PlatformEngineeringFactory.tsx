import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Info, Filter, ChevronRight, CheckCircle2, Clock, Image as ImageIcon,
  Code2, Github, Boxes, ShieldCheck, UserCog, FileCode, Server, Cloud,
  Database, Layers, AlertTriangle, TrendingUp, Sparkles, Wrench, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Status = "healthy" | "watch" | "risk" | "attn";
const statusDot: Record<Status, string> = {
  healthy: "bg-emerald-500", watch: "bg-amber-500", risk: "bg-rose-500", attn: "bg-violet-500",
};
const statusChip: Record<Status, string> = {
  healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  watch:   "bg-amber-50 text-amber-700 border-amber-200",
  risk:    "bg-rose-50 text-rose-700 border-rose-200",
  attn:    "bg-violet-50 text-violet-700 border-violet-200",
};

type Drawer = { title: string; subtitle?: string; kind: string; data?: any } | null;

const KPIS = [
  { id: "img",  label: "Golden Images",      value: "64%", sub: "Adoption",         hint: "+8% vs 30 days",  icon: ImageIcon,  accent: "text-blue-600" },
  { id: "iac",  label: "Infrastructure as Code", value: "58%", sub: "Coverage",     hint: "+6% vs 30 days",  icon: Code2,      accent: "text-indigo-600" },
  { id: "gh",   label: "GitHub Actions",     value: "68%", sub: "Migration Complete", hint: "+12% vs 30 days", icon: Github, accent: "text-slate-700" },
  { id: "cnt",  label: "Container Readiness",value: "21%", sub: "Workloads Ready",   hint: "+3% vs 30 days",  icon: Boxes,    accent: "text-teal-600" },
  { id: "pat",  label: "Patch Compliance",   value: "89%", sub: "Within Policy",     hint: "+5% vs 30 days",  icon: ShieldCheck, accent: "text-emerald-600" },
  { id: "pol",  label: "Policy Compliance",  value: "93%", sub: "Passing Gates",     hint: "+4% vs 30 days",  icon: FileCode,   accent: "text-violet-600" },
  { id: "ss",   label: "Developer Self Service", value: "42%", sub: "Requests Automated", hint: "+7% vs 30 days", icon: UserCog, accent: "text-blue-600" },
];

type StageStep = { label: string; status: Status };
type Stage = {
  id: string; title: string; icon: any; color: string;
  badge: { label: string; tone: Status };
  steps: StageStep[];
  metrics: { l: string; v: string; tone?: Status }[];
};

const STAGES: Stage[] = [
  { id: "img", title: "Golden Image Factory", icon: ImageIcon, color: "text-blue-600",
    badge: { label: "Healthy", tone: "healthy" },
    steps: [
      { label: "Base OS",          status: "healthy" },
      { label: "CIS Benchmark",    status: "healthy" },
      { label: "EDR Installed",    status: "healthy" },
      { label: "Logging Agent",    status: "healthy" },
      { label: "Observability Agent", status: "healthy" },
      { label: "Patch Baseline",   status: "healthy" },
      { label: "Approval",         status: "healthy" },
      { label: "Published AMI",    status: "healthy" },
    ],
    metrics: [
      { l: "Golden Images", v: "143" },
      { l: "Approved",      v: "128" },
      { l: "Pending",       v: "15",  tone: "watch" },
      { l: "Compliance",    v: "94%" },
    ],
  },
  { id: "iac", title: "Infrastructure as Code Factory", icon: Code2, color: "text-indigo-600",
    badge: { label: "Healthy", tone: "healthy" },
    steps: [
      { label: "Code Commit",   status: "healthy" },
      { label: "Code Review",   status: "healthy" },
      { label: "Security Check",status: "healthy" },
      { label: "Policy Check",  status: "healthy" },
      { label: "Approval",      status: "healthy" },
      { label: "Plan",          status: "healthy" },
      { label: "Apply",         status: "healthy" },
    ],
    metrics: [
      { l: "Terraform Modules", v: "286" },
      { l: "Prod Modules",      v: "218" },
      { l: "Drift Detected",    v: "12",  tone: "watch" },
      { l: "Review Passing",    v: "94%" },
    ],
  },
  { id: "lz", title: "Cloud Landing Zone Factory", icon: Cloud, color: "text-sky-600",
    badge: { label: "Healthy", tone: "healthy" },
    steps: [
      { label: "Request",              status: "healthy" },
      { label: "Policy Validation",    status: "healthy" },
      { label: "Network Assignment",   status: "healthy" },
      { label: "Identity Assignment",  status: "healthy" },
      { label: "Tagging",              status: "healthy" },
      { label: "Budget Assignment",    status: "healthy" },
      { label: "Guardrails",           status: "healthy" },
      { label: "Provision",            status: "healthy" },
    ],
    metrics: [
      { l: "AWS Accounts",      v: "42" },
      { l: "GCP Projects",      v: "8" },
      { l: "Policy Compliance", v: "96%" },
      { l: "Budget Aligned",    v: "91%" },
    ],
  },
  { id: "pipe", title: "Pipeline Factory", icon: Layers, color: "text-violet-600",
    badge: { label: "Watch", tone: "watch" },
    steps: [
      { label: "Source Commit",  status: "healthy" },
      { label: "Build",          status: "healthy" },
      { label: "Test",           status: "healthy" },
      { label: "Security Scan",  status: "healthy" },
      { label: "Artifact Publish", status: "healthy" },
      { label: "Deploy",         status: "healthy" },
      { label: "Verify",         status: "watch" },
    ],
    metrics: [
      { l: "GitHub Actions",   v: "68%", tone: "watch" },
      { l: "Bamboo Pipelines", v: "54" },
      { l: "Octopus Pipelines",v: "32" },
      { l: "Failed Deploys",   v: "6",   tone: "watch" },
    ],
  },
  { id: "cnt", title: "Container Readiness Factory", icon: Boxes, color: "text-teal-600",
    badge: { label: "Watch", tone: "watch" },
    steps: [
      { label: "EC2 / IIS Inventory",  status: "healthy" },
      { label: "Service Extraction",   status: "healthy" },
      { label: "Container Candidate",  status: "healthy" },
      { label: "Assessment",           status: "healthy" },
      { label: "Target Platform",      status: "watch" },
      { label: "Deployment",           status: "watch" },
    ],
    metrics: [
      { l: "Apps Assessed",      v: "182" },
      { l: "Ready",              v: "38"  },
      { l: "Needs Refactoring",  v: "104", tone: "watch" },
      { l: "Remain VM",          v: "40",  tone: "risk" },
    ],
  },
  { id: "dss", title: "Developer Self-Service Factory", icon: UserCog, color: "text-blue-600",
    badge: { label: "Healthy", tone: "healthy" },
    steps: [
      { label: "Request Environment", status: "healthy" },
      { label: "Provision Resources", status: "healthy" },
      { label: "Register Service",    status: "healthy" },
      { label: "Enable Logging",      status: "healthy" },
      { label: "Enable Monitoring",   status: "healthy" },
      { label: "Register SLO",        status: "healthy" },
      { label: "Deploy Safely",       status: "healthy" },
      { label: "Production Approval", status: "healthy" },
    ],
    metrics: [
      { l: "Requests Automated", v: "42%" },
      { l: "Avg Fulfillment Time", v: "22 min" },
      { l: "Manual Requests",    v: "58%", tone: "watch" },
      { l: "Satisfaction Score", v: "4.6 / 5" },
    ],
  },
  { id: "pol", title: "Policy-as-Code Gate", icon: ShieldCheck, color: "text-emerald-600",
    badge: { label: "Healthy", tone: "healthy" },
    steps: [
      { label: "Security",   status: "healthy" },
      { label: "Cost",       status: "healthy" },
      { label: "Backup",     status: "healthy" },
      { label: "Tagging",    status: "healthy" },
      { label: "Encryption", status: "healthy" },
      { label: "Logging",    status: "healthy" },
      { label: "Vulnerability Scan", status: "healthy" },
      { label: "Compliance", status: "healthy" },
      { label: "Approve",    status: "healthy" },
    ],
    metrics: [
      { l: "Passing",         v: "93%" },
      { l: "Failed",          v: "7%",  tone: "risk" },
      { l: "Waived",          v: "5",   tone: "watch" },
      { l: "Mean Remediation",v: "18h" },
    ],
  },
];

const TOP_IMAGES = [
  { name: "Windows Server 2022",   ver: "v2024.05.22", status: "healthy" as Status },
  { name: "Ubuntu 24.04 LTS",      ver: "v2024.05.21", status: "healthy" as Status },
  { name: "SQL Server 2022 Base",  ver: "v2024.05.20", status: "watch"   as Status },
  { name: "App Runtime Base (Java)", ver: "v2024.05.18", status: "healthy" as Status },
];

const TOP_MODULES = [
  { name: "vpc-network",      ver: "v2.4.1" },
  { name: "eks-cluster",      ver: "v3.1.0" },
  { name: "rds-aurora",       ver: "v2.7.3" },
  { name: "security-baseline",ver: "v1.9.5" },
];

const PROVISIONING = [
  { id: "vpc-prod-ml-021",   date: "May 22" },
  { id: "aws-sandbox-045",   date: "May 21" },
  { id: "gcp-data-analytics",date: "May 20" },
  { id: "aws-dev-tools-013", date: "May 19" },
];

const TEMPLATES = [
  { name: "Web Service",   count: 12 },
  { name: "API Service",   count: 18 },
  { name: "Batch Service", count: 9  },
  { name: "DB Migration",  count: 7  },
];

const PLATFORMS = [
  { name: "Amazon EKS",    count: 12, icon: Cloud },
  { name: "Amazon ECS",    count: 12, icon: Cloud },
  { name: "AWS Lambda",    count: 8,  icon: Cloud },
  { name: "Remain on VM",  count: 40, icon: Server },
];

const REQUESTS = [
  { name: "Dev Environment",  count: 68 },
  { name: "Test Environment", count: 54 },
  { name: "DB Instance",      count: 41 },
  { name: "K8s Namespace",    count: 37 },
];

const FAILURES = [
  { name: "Missing Backup Policy", count: 3, tone: "watch"   as Status },
  { name: "Missing Tags",          count: 2, tone: "watch"   as Status },
  { name: "Unencrypted Storage",   count: 2, tone: "risk"    as Status },
  { name: "Critical Vulnerability",count: 1, tone: "risk"    as Status },
];

const INSIGHTS = [
  { icon: TrendingUp,    color: "text-emerald-600", title: "Golden Image Progress",   sub: "64% adoption · +8% vs 30 days ago" },
  { icon: Github,        color: "text-slate-700",   title: "GitHub Actions Migration",sub: "68% complete · +12% vs 30 days ago" },
  { icon: AlertTriangle, color: "text-amber-600",   title: "Container Opportunity",   sub: "104 applications need refactoring assessment" },
  { icon: ShieldCheck,   color: "text-emerald-600", title: "Patch Improvement",       sub: "89% compliance · +5% vs 30 days ago" },
  { icon: Clock,         color: "text-blue-600",    title: "Developer Experience",    sub: "Provisioning time reduced from 3 days to 22 minutes" },
];

const AI_RECS = [
  { title: "Windows IIS Consolidation",  sub: "Consolidate 18 low-usage IIS servers to reduce cost. Est. savings: $320K / year", cta: "Review",    icon: Sparkles },
  { title: "GitHub Actions Expansion",   sub: "Migrate 32 remaining Bamboo pipelines to GitHub Actions.", cta: "Plan",      icon: Github },
  { title: "Policy Automation",          sub: "Automate 41% of manual policy reviews.",                 cta: "Implement", icon: FileCode },
  { title: "Container Migration",        sub: "38 applications ready for container migration.",          cta: "Assess",    icon: Boxes },
];

const TREND_SERIES = [
  { name: "Overall Maturity", val: "71%", color: "stroke-blue-500" },
  { name: "Automation",       val: "64%", color: "stroke-emerald-500" },
  { name: "Standardization",  val: "68%", color: "stroke-violet-500" },
  { name: "Compliance",       val: "93%", color: "stroke-amber-500" },
];

function spark(points: number, seed = 1) {
  let s = seed;
  return Array.from({ length: points }, (_, i) => {
    s = (s * 9301 + 49297) % 233280;
    return 50 + (s / 233280) * 30 - 15 + Math.sin(i / 2 + seed) * 6;
  });
}
function Sparkline({ data, className, area = true }: { data: number[]; className?: string; area?: boolean }) {
  const w = 100, h = 32;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / Math.max(0.0001, max - min)) * (h - 4) - 2;
    return [x, y] as const;
  });
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const fill = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-8 w-full", className)}>
      {area && <path d={fill} className="fill-current opacity-10" />}
      <path d={path} fill="none" strokeWidth={1.5} className="stroke-current" />
    </svg>
  );
}

export default function PlatformEngineeringFactory() {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const open = (d: Drawer) => setDrawer(d);

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50/60 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Client Production Resilience Operating System</div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">Platform Engineering & Golden Environment Factory</h1>
              <Info className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-0.5 text-xs text-slate-500">Standardize, automate, secure, and continuously improve production environments through repeatable engineering patterns.</div>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="Production">
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><SelectValue /></span>
              </SelectTrigger>
              <SelectContent>{["Production","Non Production","All"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select defaultValue="Last 30 days">
              <SelectTrigger className="h-9 w-[140px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{["Last 7 days","Last 30 days","Last 90 days","Year to date"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5 border-blue-200 bg-blue-50 text-blue-700"><Filter className="h-3.5 w-3.5" /> Filters (4)</Button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {KPIS.map((k, i) => {
              const Icon = k.icon;
              return (
                <button key={k.id} onClick={() => open({ kind: "kpi", title: k.label, subtitle: k.sub, data: k })}
                  className="group rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center gap-2">
                    <div className={cn("rounded-md bg-slate-50 p-1.5", k.accent)}><Icon className="h-4 w-4" /></div>
                    <div className="text-[11px] font-medium text-slate-600">{k.label}</div>
                  </div>
                  <div className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{k.value}</div>
                  <div className="text-[11px] text-slate-500">{k.sub}</div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-emerald-600">
                    <span className="inline-flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />{k.hint}</span>
                    <div className="h-5 w-16 text-emerald-500"><Sparkline data={spark(20, i + 3)} /></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4">
          {/* Center: Factory Pipeline */}
          <div className="col-span-12 xl:col-span-9">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <header className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">Platform Engineering Factory Pipeline</h2>
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-600">
                  {([
                    { l: "Healthy", t: "healthy" as Status },
                    { l: "Watch",   t: "watch"   as Status },
                    { l: "At Risk", t: "risk"    as Status },
                    { l: "Needs Attention", t: "attn" as Status },
                  ]).map(x => (
                    <span key={x.l} className="inline-flex items-center gap-1.5"><span className={cn("h-2 w-2 rounded-full", statusDot[x.t])} />{x.l}</span>
                  ))}
                </div>
              </header>

              <div className="overflow-x-auto pb-2">
                <div className="flex min-w-full gap-2">
                  {STAGES.map((st, i) => {
                    const Icon = st.icon;
                    return (
                      <div key={st.id} className="flex items-start">
                        <div className="w-[200px] shrink-0">
                          <button onClick={() => open({ kind: "stage", title: st.title, subtitle: st.badge.label, data: st })}
                            className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-blue-300 hover:bg-blue-50/30">
                            <div className="flex items-start gap-2">
                              <Icon className={cn("h-4 w-4", st.color)} />
                              <div className="flex-1">
                                <div className="text-[12px] font-semibold leading-tight text-slate-900">{st.title}</div>
                                <Badge variant="outline" className={cn("mt-1 text-[10px]", statusChip[st.badge.tone])}>{st.badge.label}</Badge>
                              </div>
                            </div>
                          </button>

                          <div className="relative mt-2 rounded-lg border border-slate-100 bg-slate-50/40 p-2">
                            <div className="absolute left-[14px] top-3 bottom-3 w-px bg-slate-200" />
                            <ul className="space-y-1.5">
                              {st.steps.map(s => (
                                <li key={s.label}>
                                  <button onClick={() => open({ kind: "step", title: s.label, subtitle: st.title, data: s })}
                                    className="relative flex w-full items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-white">
                                    <span className={cn("z-10 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full ring-2 ring-slate-50", statusDot[s.status])}>
                                      {s.status === "healthy" && <CheckCircle2 className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                                    </span>
                                    <span className="text-[11px] text-slate-700">{s.label}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-2 rounded-lg border border-slate-100 bg-white p-2">
                            <ul className="divide-y divide-slate-100">
                              {st.metrics.map(m => (
                                <li key={m.l} className="flex items-center justify-between py-1 text-[11px]">
                                  <span className="text-slate-600">{m.l}</span>
                                  <span className={cn("font-semibold tabular-nums", m.tone === "risk" ? "text-rose-600" : m.tone === "watch" ? "text-amber-600" : "text-slate-900")}>{m.v}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        {i < STAGES.length - 1 && (
                          <div className="flex h-[180px] items-center px-1 pt-6 text-slate-300">
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detail row (per-stage) */}
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
                <DetailCard title="Top Images" actionLabel="View all images →" onClick={() => open({ kind: "images", title: "Golden Images" })}>
                  {TOP_IMAGES.map(i => (
                    <Item key={i.name} dot={i.status}>
                      <div className="text-[12px] font-medium text-slate-800">{i.name}</div>
                      <div className="text-[11px] text-slate-500">{i.ver}</div>
                    </Item>
                  ))}
                </DetailCard>

                <DetailCard title="Top Modules" actionLabel="View module repo →" onClick={() => open({ kind: "modules", title: "Terraform Modules" })}>
                  {TOP_MODULES.map(m => (
                    <Item key={m.name} icon={<Code2 className="h-3 w-3 text-violet-600" />}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-slate-800">{m.name}</span>
                        <span className="text-[11px] text-slate-500">{m.ver}</span>
                      </div>
                    </Item>
                  ))}
                </DetailCard>

                <DetailCard title="Recent Provisioning" actionLabel="View landing zones →" onClick={() => open({ kind: "landing", title: "Landing Zones" })}>
                  {PROVISIONING.map(p => (
                    <Item key={p.id} icon={<Cloud className="h-3 w-3 text-sky-600" />}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-slate-800">{p.id}</span>
                        <span className="text-[11px] text-slate-500">{p.date}</span>
                      </div>
                    </Item>
                  ))}
                </DetailCard>

                <DetailCard title="Pipeline Templates" actionLabel="View all templates →" onClick={() => open({ kind: "tpl", title: "Pipeline Templates" })}>
                  {TEMPLATES.map(t => (
                    <Item key={t.name} icon={<Layers className="h-3 w-3 text-violet-600" />}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-slate-800">{t.name}</span>
                        <span className="text-[11px] text-slate-500">{t.count} pipelines</span>
                      </div>
                    </Item>
                  ))}
                </DetailCard>

                <DetailCard title="Target Platforms" actionLabel="View app inventory →" onClick={() => open({ kind: "platforms", title: "Target Platforms" })}>
                  {PLATFORMS.map(p => {
                    const Icon = p.icon;
                    return (
                      <Item key={p.name} icon={<Icon className="h-3 w-3 text-teal-600" />}>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-slate-800">{p.name}</span>
                          <span className="text-[11px] text-slate-500">{p.count}</span>
                        </div>
                      </Item>
                    );
                  })}
                </DetailCard>

                <DetailCard title="Popular Requests" actionLabel="Open Service Catalog →" onClick={() => open({ kind: "catalog", title: "Service Catalog" })}>
                  {REQUESTS.map(r => (
                    <Item key={r.name} icon={<UserCog className="h-3 w-3 text-blue-600" />}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-slate-800">{r.name}</span>
                        <span className="text-[11px] text-slate-500">{r.count}</span>
                      </div>
                    </Item>
                  ))}
                </DetailCard>

                <DetailCard title="Top Failures" actionLabel="View policy dashboard →" onClick={() => open({ kind: "policy", title: "Policy Failures" })}>
                  {FAILURES.map(f => (
                    <Item key={f.name} dot={f.tone}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-slate-800">{f.name}</span>
                        <span className="text-[11px] text-slate-500">{f.count}</span>
                      </div>
                    </Item>
                  ))}
                </DetailCard>
              </div>
            </section>
          </div>

          {/* Right insights panel */}
          <aside className="col-span-12 space-y-4 xl:col-span-3">
            <Card title="Platform Insights" actions={<Button variant="ghost" size="sm" className="h-7 text-xs">View all insights →</Button>}>
              <div className="space-y-2">
                {INSIGHTS.map(i => {
                  const Icon = i.icon;
                  return (
                    <button key={i.title} onClick={() => open({ kind: "insight", title: i.title, subtitle: i.sub })}
                      className="flex w-full items-start gap-2 rounded-md border border-slate-100 bg-white p-2 text-left hover:border-blue-300 hover:bg-blue-50/40">
                      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", i.color)} />
                      <div className="flex-1">
                        <div className="text-[12px] font-semibold text-slate-800">{i.title}</div>
                        <div className="text-[11px] text-slate-500">{i.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card title="AI Recommendations" actions={<Button variant="ghost" size="sm" className="h-7 text-xs">View all →</Button>}>
              <div className="space-y-2">
                {AI_RECS.map(r => {
                  const Icon = r.icon;
                  return (
                    <div key={r.title} className="flex items-start gap-2 rounded-md border border-slate-100 bg-gradient-to-br from-blue-50/30 to-white p-2">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <div className="flex-1">
                        <div className="text-[12px] font-semibold text-slate-800">{r.title}</div>
                        <div className="text-[11px] text-slate-500">{r.sub}</div>
                      </div>
                      <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => open({ kind: "rec", title: r.title, subtitle: r.sub })}>{r.cta}</Button>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Factory Health Trend" sub="Last 90 days">
              <div className="space-y-2">
                {TREND_SERIES.map((t, i) => (
                  <div key={t.name} className="flex items-center gap-2">
                    <div className="w-28 text-[11px] text-slate-600">{t.name}</div>
                    <div className={cn("flex-1", t.color, "text-slate-400")}><Sparkline data={spark(30, i + 5)} /></div>
                    <div className="w-10 text-right text-[11px] font-semibold tabular-nums text-slate-800">{t.val}</div>
                  </div>
                ))}
                <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-slate-400">
                  <span>Mar 1</span><span>Mar 31</span><span>Apr 30</span><span>May 30</span>
                </div>
              </div>
            </Card>
          </aside>
        </div>

        <div className="border-t border-slate-200 bg-white px-6 py-2 text-[11px] text-slate-500">
          Last updated: May 22, 2025 · Source: Client Platform Engineering Factory
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-[540px] sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle className="text-base">{drawer?.title}</SheetTitle>
            {drawer?.subtitle && <div className="text-xs text-slate-500">{drawer.subtitle}</div>}
          </SheetHeader>
          <div className="mt-4">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="pipeline" className="text-xs">Pipeline</TabsTrigger>
                <TabsTrigger value="owners"   className="text-xs">Ownership</TabsTrigger>
                <TabsTrigger value="actions"  className="text-xs">Actions</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-3 space-y-2 text-sm">
                <Row label="Type" value={drawer?.kind ?? "—"} />
                <Row label="Owner" value="Platform Engineering Pod" />
                <Row label="Region" value="us-east-1" />
                <Row label="Environment" value="Production" />
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[12px] text-slate-600">
                  Environments are not hand-built. They are manufactured through standardized, policy-gated, automated factory pipelines.
                </div>
              </TabsContent>
              <TabsContent value="pipeline" className="mt-3 space-y-2 text-sm">
                {["Source","Build","Security Scan","Policy Check","Approval","Deploy","Verify"].map(s => (
                  <Row key={s} label={s} value="Passed" />
                ))}
              </TabsContent>
              <TabsContent value="owners" className="mt-3 space-y-2 text-sm">
                <Row label="Platform Lead" value="L. Romero" />
                <Row label="SRE Lead"      value="M. Singh" />
                <Row label="Security Lead" value="K. Yamada" />
                <Row label="Product Owner" value="J. Reed" />
              </TabsContent>
              <TabsContent value="actions" className="mt-3 space-y-2 text-sm">
                {["Open factory pipeline","Open module repo","Open policy dashboard","Open service catalog","Request environment","Trigger compliance scan"].map(a => (
                  <button key={a} className="flex w-full items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50/40">
                    <span className="text-[13px] text-slate-700">{a}</span><ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function Card({ title, sub, actions, children }: { title: string; sub?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

function DetailCard({ title, actionLabel, onClick, children }: { title: string; actionLabel: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 text-[12px] font-semibold text-slate-800">{title}</div>
      <ul className="space-y-1">{children}</ul>
      <button onClick={onClick} className="mt-2 w-full rounded border border-slate-100 px-2 py-1 text-[11px] text-blue-600 hover:bg-blue-50/40">{actionLabel}</button>
    </div>
  );
}

function Item({ icon, dot, children }: { icon?: React.ReactNode; dot?: Status; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 rounded px-1 py-0.5 hover:bg-slate-50">
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[dot])} />}
      {icon}
      <div className="flex-1">{children}</div>
    </li>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-slate-100 bg-slate-50/50 px-2 py-1.5 text-[12px]">
      <span className="text-slate-500">{label}</span><span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
