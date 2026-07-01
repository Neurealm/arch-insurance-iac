import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Info, Filter, RefreshCw, ChevronRight, Activity, ShieldCheck, Target,
  Gauge, AlertTriangle, BookOpen, Bot, TrendingUp, TrendingDown, CheckCircle2,
  Clock, Users, Wrench, FileText, Calendar, Layers, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Status = "healthy" | "watch" | "risk" | "critical";
const statusCfg: Record<Status, { dot: string; chip: string; label: string }> = {
  healthy:  { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Healthy" },
  watch:    { dot: "bg-amber-500",   chip: "bg-amber-50 text-amber-700 border-amber-200",       label: "Watch" },
  risk:     { dot: "bg-orange-500",  chip: "bg-orange-50 text-orange-700 border-orange-200",    label: "At Risk" },
  critical: { dot: "bg-rose-500",    chip: "bg-rose-50 text-rose-700 border-rose-200",          label: "Critical" },
};

type Drawer = { title: string; subtitle?: string; kind: string; data?: any } | null;

const KPIS = [
  { id: "svc",  label: "Services Governed",   value: "214",   sub: "Active Services",     hint: "+12 This Quarter",        tone: "text-slate-900",   icon: Layers,        accent: "text-blue-600" },
  { id: "slo",  label: "SLO Compliance",      value: "96.2%", sub: "Within Target",       hint: "+0.4 pts vs 30d",         tone: "text-emerald-700", icon: Target,        accent: "text-emerald-600" },
  { id: "burn", label: "Error Budget Burn",   value: "18%",   sub: "Current Month",       hint: "+4 pts vs prior month",   tone: "text-amber-700",   icon: Gauge,         accent: "text-amber-600" },
  { id: "debt", label: "Reliability Debt",    value: "42",    sub: "Open Reliability Items", hint: "8 critical",            tone: "text-rose-700",    icon: AlertTriangle, accent: "text-rose-600" },
  { id: "auto", label: "Automation Coverage", value: "47%",   sub: "Operational Tasks",   hint: "+9 pts YTD",              tone: "text-indigo-700",  icon: Bot,           accent: "text-indigo-600" },
  { id: "prr",  label: "Production Readiness",value: "89%",   sub: "Platform Average",    hint: "11 launches Q2",          tone: "text-teal-700",    icon: ShieldCheck,   accent: "text-teal-600" },
];

const LAYERS = [
  { id: "L1", label: "Service Catalog",          desc: "Authoritative inventory of production services", icon: Layers },
  { id: "L2", label: "SLIs / SLOs",              desc: "Measurable indicators and reliability targets",  icon: Target },
  { id: "L3", label: "Error Budget Governance",  desc: "Burn rates, policies, release gating",            icon: Gauge },
  { id: "L4", label: "Incident Governance",      desc: "SEV model, commander roles, customer impact",    icon: AlertTriangle },
  { id: "L5", label: "Runbook Automation",       desc: "Toil elimination and self-healing operations",   icon: Bot },
  { id: "L6", label: "Continuous Improvement",   desc: "Postmortems, PRRs, cadence reviews",             icon: TrendingUp },
];

const SERVICES = [
  { id: "s1", name: "Caregiver Mobile / EVV",   crit: "Business Critical", owner: "Mobile Platform Pod",   slo: 99.95, health: "healthy" as Status,  burn: 18, errBudget: 82, line: "HHA Enterprise" },
  { id: "s2", name: "Claims Processing",        crit: "Business Critical", owner: "Claims Pod",            slo: 99.50, health: "risk" as Status,     burn: 72, errBudget: 28, line: "HHA Enterprise" },
  { id: "s3", name: "Payroll Processing",       crit: "Business Critical", owner: "Payroll Pod",           slo: 99.90, health: "watch" as Status,    burn: 31, errBudget: 69, line: "HHA Enterprise" },
  { id: "s4", name: "PHI Protection Services",  crit: "Critical",          owner: "Security Engineering",  slo: 99.99, health: "healthy" as Status,  burn: 8,  errBudget: 92, line: "Platform" },
  { id: "s5", name: "Provider Portal",          crit: "Important",         owner: "Web Platform Pod",      slo: 99.50, health: "healthy" as Status,  burn: 22, errBudget: 78, line: "Provider Pro" },
  { id: "s6", name: "Customer Portal",          crit: "Important",         owner: "Web Platform Pod",      slo: 99.50, health: "watch" as Status,    burn: 38, errBudget: 62, line: "HHA Enterprise" },
  { id: "s7", name: "Identity Services",        crit: "Business Critical", owner: "IAM Pod",               slo: 99.95, health: "healthy" as Status,  burn: 12, errBudget: 88, line: "Platform" },
  { id: "s8", name: "Data Platform",            crit: "Business Critical", owner: "Data Pod",              slo: 99.90, health: "watch" as Status,    burn: 41, errBudget: 59, line: "Platform" },
  { id: "s9", name: "Integration Platform",     crit: "Important",         owner: "Integrations Pod",      slo: 99.50, health: "healthy" as Status,  burn: 14, errBudget: 86, line: "Platform" },
  { id: "s10",name: "Observability Platform",   crit: "Important",         owner: "SRE Platform Pod",      slo: 99.50, health: "healthy" as Status,  burn: 9,  errBudget: 91, line: "Platform" },
];

const OWNERSHIP = [
  { svc: "Caregiver Mobile / EVV", po: "G", so: "G", sre: "G", plat: "G", sec: "G", eng: "G" },
  { svc: "Claims Processing",      po: "G", so: "G", sre: "A", plat: "G", sec: "G", eng: "G" },
  { svc: "Payroll Processing",     po: "G", so: "G", sre: "G", plat: "G", sec: "A", eng: "G" },
  { svc: "Identity Services",      po: "G", so: "G", sre: "G", plat: "G", sec: "G", eng: "G" },
  { svc: "PHI Protection",         po: "A", so: "G", sre: "G", plat: "G", sec: "G", eng: "G" },
  { svc: "Provider Portal",        po: "G", so: "A", sre: "A", plat: "G", sec: "G", eng: "G" },
  { svc: "Customer Portal",        po: "G", so: "G", sre: "R", plat: "G", sec: "A", eng: "G" },
  { svc: "Data Platform",          po: "G", so: "G", sre: "G", plat: "G", sec: "A", eng: "G" },
];
const ownCfg: Record<string, { cls: string; label: string }> = {
  G: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Accountable" },
  A: { cls: "bg-amber-100 text-amber-700 border-amber-200",       label: "Shared" },
  R: { cls: "bg-rose-100 text-rose-700 border-rose-200",          label: "Missing" },
};

const SLIS = [
  { svc: "Caregiver Mobile",   metric: "Availability",         val: "99.95%", target: "99.90%", status: "healthy" as Status },
  { svc: "Caregiver Mobile",   metric: "Sync Success",         val: "99.62%", target: "99.50%", status: "healthy" as Status },
  { svc: "Claims Processing",  metric: "Claim Batch Success",  val: "98.70%", target: "99.50%", status: "risk" as Status },
  { svc: "Claims Processing",  metric: "Latency (p95)",        val: "612ms",  target: "< 500ms",status: "risk" as Status },
  { svc: "Payroll",            metric: "Completion Success",   val: "99.80%", target: "99.90%", status: "watch" as Status },
  { svc: "PHI Protection",     metric: "Error Rate",           val: "0.02%",  target: "< 0.05%",status: "healthy" as Status },
  { svc: "Identity",           metric: "Latency (p95)",        val: "187ms",  target: "< 250ms",status: "healthy" as Status },
  { svc: "Data Platform",      metric: "Backup Success",       val: "99.30%", target: "99.50%", status: "watch" as Status },
];

const RUNBOOKS = [
  { id: "r1", name: "Claims Job Restart",          stage: "Runbooked",            hrs: 22, owner: "Claims Pod" },
  { id: "r2", name: "Backup Validation",           stage: "AI Assisted",          hrs: 48, owner: "Data Pod" },
  { id: "r3", name: "Payroll Reconciliation",      stage: "Manual",               hrs: 8,  owner: "Payroll Pod" },
  { id: "r4", name: "Database Failover",           stage: "Automated",            hrs: 96, owner: "Data Pod" },
  { id: "r5", name: "Cache Warm-up",               stage: "Self Healing",         hrs: 36, owner: "SRE Platform Pod" },
  { id: "r6", name: "Certificate Renewal",         stage: "Automated",            hrs: 64, owner: "Security Engineering" },
  { id: "r7", name: "Sync Queue Drain (EVV)",      stage: "AI Assisted",          hrs: 28, owner: "Mobile Platform Pod" },
];
const STAGES = ["Manual", "Scripted", "Runbooked", "Automated", "AI Assisted", "Self Healing"];

const TOIL = [
  { task: "Manual Claims Restart",          freq: "Weekly",      hrs: 12, root: "No retry policy",        cand: "Yes", saved: 10, owner: "Claims Pod" },
  { task: "Manual Security Group Review",   freq: "Weekly",      hrs:  8, root: "Drift detection gap",    cand: "Yes", saved:  7, owner: "Security Engineering" },
  { task: "Backup Validation",              freq: "Weekly",      hrs:  5, root: "Manual log inspection",  cand: "Yes", saved:  4, owner: "Data Pod" },
  { task: "Release Coordination",           freq: "Weekly",      hrs: 14, root: "Tribal handoff process", cand: "Partial", saved: 8, owner: "SRE Platform Pod" },
  { task: "Patch Compliance Check",         freq: "Bi-weekly",   hrs:  9, root: "Manual evidence",        cand: "Yes", saved:  7, owner: "Platform Eng" },
];

const INCIDENTS = [
  { sev: "SEV1", count: 1, mttr: "58m", impact: "Customer Visible", open: 0, closed: 1 },
  { sev: "SEV2", count: 4, mttr: "1h 42m", impact: "Degraded",      open: 1, closed: 3 },
  { sev: "SEV3", count: 9, mttr: "4h 21m", impact: "Partial",       open: 2, closed: 7 },
  { sev: "SEV4", count: 6, mttr: "8h 11m", impact: "Minimal",       open: 1, closed: 5 },
];

const POSTMORTEMS = [
  { id: "INC-48291", title: "Caregiver EVV Sync Lag",       sev: "SEV1", root: "DB failover regression", action: "Add pre-failover health gate", owner: "Data Pod", due: "Jun 30", status: "In Progress" },
  { id: "INC-47632", title: "Claims Batch Memory Leak",     sev: "SEV2", root: "Heap accumulation",      action: "Patch + memory profile in CI",  owner: "Claims Pod", due: "Jul 14", status: "Open" },
  { id: "INC-47511", title: "Provider Portal Deploy Error", sev: "SEV2", root: "Config drift",           action: "Codify env config",             owner: "Web Platform Pod", due: "Jun 22", status: "Closed" },
  { id: "INC-47102", title: "Third-Party API Throttling",   sev: "SEV3", root: "Quota exhaustion",       action: "Adaptive rate limiter",         owner: "Integrations Pod", due: "Jul 02", status: "In Progress" },
];

const PRR = [
  { item: "Observability",     score: 100, status: "healthy" as Status },
  { item: "Rollback Plan",     score: 100, status: "healthy" as Status },
  { item: "Dependencies",      score:  92, status: "watch"   as Status },
  { item: "Data Validation",   score: 100, status: "healthy" as Status },
  { item: "Security Validation",score: 83, status: "watch"   as Status },
  { item: "DR Validation",     score: 100, status: "healthy" as Status },
  { item: "Cost Review",       score:  92, status: "watch"   as Status },
  { item: "Ownership Review",  score:  78, status: "risk"    as Status },
  { item: "Runbook Review",    score: 100, status: "healthy" as Status },
];

const CADENCE = [
  { name: "Weekly SRE Review",       when: "Every Tuesday 10:00 ET",   tag: "On Track" },
  { name: "Monthly Reliability Review", when: "Next: May 27, 2026",    tag: "On Track" },
  { name: "Quarterly Reliability Review", when: "Next: Jul 18, 2026",  tag: "Scheduled" },
  { name: "QBR / Leadership Review", when: "Next: Jun 10, 2026",       tag: "Scheduled" },
  { name: "Board Readout",           when: "Next: Jun 24, 2026",       tag: "Scheduled" },
];

const PRODUCT_LINES = ["All Product Lines","HHA Enterprise","Sandata Fuse","SAM","Provider Pro","Pavilio","Self Direction","Generations"];
const STATUSES = ["All Status","Healthy","Watch","At Risk","Critical"];
const OWNERS = ["All Owners","Service Owner","SRE Owner","Security Owner","Platform Owner"];

export default function SreOperatingModel() {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [layer, setLayer] = useState<string>("L1");
  const [filterLine, setFilterLine] = useState("All Product Lines");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [filterOwner, setFilterOwner] = useState("All Owners");
  const [search, setSearch] = useState("");

  const services = useMemo(() => SERVICES.filter(s => {
    if (filterLine !== "All Product Lines" && s.line !== filterLine) return false;
    if (filterStatus !== "All Status" && statusCfg[s.health].label !== filterStatus) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [filterLine, filterStatus, search]);

  const openDrawer = (d: Drawer) => setDrawer(d);

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50/60 text-slate-900">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Client Production Resilience Operating System</div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">SRE Operating Model Cockpit</h1>
              <Info className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-0.5 text-xs text-slate-500">Govern production services through ownership, SLOs, error budgets, automation, and continuous reliability improvement.</div>
          </div>
          <div className="flex items-center gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services, owners, runbooks…" className="h-9 w-72" />
            <Button variant="outline" size="sm" className="gap-1.5"><Filter className="h-3.5 w-3.5" /> Filters (3)</Button>
            <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
          </div>
        </div>

        {/* Transformation banner */}
        <div className="border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex flex-wrap items-center gap-6 rounded-lg border border-slate-200 bg-gradient-to-r from-blue-50 via-white to-emerald-50 px-4 py-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Transformation</div>
              <div className="text-sm font-semibold text-slate-900">ITIL → SRE Operating Model</div>
            </div>
            <div className="flex-1 min-w-[260px]">
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Current: <span className="font-medium text-slate-700">Standardized</span></span>
                <span>62%</span>
                <span>Target: <span className="font-medium text-slate-700">Product-Owned Reliability</span></span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: "62%" }} />
              </div>
              <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-slate-400">
                <span>Reactive</span><span>Standardized</span><span>Engineered</span><span>Automated</span><span>AI-Assisted</span><span>Product-Owned</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Target Date</div>
              <div className="text-sm font-semibold text-slate-900">Q4 FY2027</div>
            </div>
            <div className="flex gap-2">
              <Select value={filterLine} onValueChange={setFilterLine}>
                <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{PRODUCT_LINES.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={filterOwner} onValueChange={setFilterOwner}>
                <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{OWNERS.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {KPIS.map(k => {
              const Icon = k.icon;
              return (
                <button key={k.id} onClick={() => openDrawer({ kind: "kpi", title: k.label, subtitle: k.sub, data: k })}
                  className="group rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{k.label}</div>
                      <div className={cn("mt-1 text-2xl font-semibold tabular-nums", k.tone)}>{k.value}</div>
                      <div className="text-[11px] text-slate-500">{k.sub}</div>
                    </div>
                    <div className={cn("rounded-md bg-slate-50 p-1.5", k.accent)}><Icon className="h-4 w-4" /></div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                    <TrendingUp className="h-3 w-3 text-emerald-500" /> {k.hint}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4">
          {/* Center */}
          <div className="col-span-12 space-y-4 xl:col-span-9">
            {/* Governance Layers */}
            <Card title="Service Ownership & Reliability Governance Model" sub="Everything revolves around service ownership — not infrastructure, not tickets.">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-4">
                  <div className="relative mx-auto flex h-[280px] w-[280px] items-center justify-center">
                    {LAYERS.map((l, idx) => {
                      const size = 280 - idx * 36;
                      const active = layer === l.id;
                      return (
                        <button key={l.id} onClick={() => setLayer(l.id)}
                          className={cn("absolute rounded-full border transition", active ? "border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.15)]" : "border-slate-200 hover:border-blue-300")}
                          style={{ width: size, height: size, background: idx % 2 === 0 ? "rgba(241,245,249,0.6)" : "white" }}
                          aria-label={l.label} />
                      );
                    })}
                    <div className="absolute flex h-20 w-20 flex-col items-center justify-center rounded-full border border-blue-500 bg-blue-600 text-center text-[10px] font-semibold uppercase text-white shadow">
                      Service<br/>Ownership
                    </div>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-8">
                  <div className="grid grid-cols-2 gap-2">
                    {LAYERS.map(l => {
                      const Icon = l.icon;
                      const active = layer === l.id;
                      return (
                        <button key={l.id} onClick={() => { setLayer(l.id); openDrawer({ kind: "layer", title: l.label, subtitle: l.desc, data: l }); }}
                          className={cn("flex items-start gap-2 rounded-lg border p-3 text-left transition", active ? "border-blue-500 bg-blue-50/60" : "border-slate-200 bg-white hover:border-blue-300")}>
                          <div className={cn("rounded-md p-1.5", active ? "bg-blue-100 text-blue-700" : "bg-slate-50 text-slate-600")}><Icon className="h-4 w-4" /></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm font-semibold">
                              <span>Layer {l.id.slice(1)} · {l.label}</span>
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <div className="text-[11px] text-slate-500">{l.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Service Catalog */}
            <Card title="1. Service Catalog" sub={`${services.length} services shown · ${SERVICES.length} total`}
              actions={<Button variant="ghost" size="sm" className="h-7 text-xs">View all 62</Button>}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                      <Th>Service</Th><Th>Criticality</Th><Th>Owner</Th><Th>SLO</Th><Th>Error Budget</Th><Th>Health</Th><Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(s => (
                      <tr key={s.id} onClick={() => openDrawer({ kind: "service", title: s.name, subtitle: `${s.crit} · ${s.owner}`, data: s })}
                        className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/70">
                        <Td><div className="font-medium text-slate-900">{s.name}</div><div className="text-[11px] text-slate-500">{s.line}</div></Td>
                        <Td><Badge variant="outline" className={cn("text-[11px]", s.crit === "Business Critical" ? "border-rose-200 bg-rose-50 text-rose-700" : s.crit === "Critical" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-slate-200 bg-slate-50 text-slate-600")}>{s.crit}</Badge></Td>
                        <Td className="text-slate-700">{s.owner}</Td>
                        <Td className="tabular-nums">{s.slo.toFixed(2)}%</Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200"><div className={cn("h-full", s.burn > 60 ? "bg-rose-500" : s.burn > 30 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${s.burn}%` }} /></div>
                            <span className="text-[11px] text-slate-500 tabular-nums">{s.burn}% burned</span>
                          </div>
                        </Td>
                        <Td><span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]", statusCfg[s.health].chip)}><span className={cn("h-1.5 w-1.5 rounded-full", statusCfg[s.health].dot)} />{statusCfg[s.health].label}</span></Td>
                        <Td><ChevronRight className="h-3.5 w-3.5 text-slate-400" /></Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid grid-cols-12 gap-4">
              {/* Ownership matrix */}
              <div className="col-span-12 xl:col-span-7">
                <Card title="2. Service Ownership Matrix" sub="8 services missing complete ownership coverage"
                  actions={<Badge variant="outline" className="border-rose-200 bg-rose-50 text-[11px] text-rose-700">8 Gaps</Badge>}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                          <Th>Service</Th><Th>PO</Th><Th>SO</Th><Th>SRE</Th><Th>Platform</Th><Th>Security</Th><Th>Eng Lead</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {OWNERSHIP.map(row => (
                          <tr key={row.svc} className="border-t border-slate-100 hover:bg-slate-50/70">
                            <Td className="font-medium">{row.svc}</Td>
                            {(["po","so","sre","plat","sec","eng"] as const).map(c => (
                              <Td key={c}>
                                <button onClick={() => openDrawer({ kind: "ownership", title: `${row.svc} · ${c.toUpperCase()}`, subtitle: ownCfg[(row as any)[c]].label, data: row })}
                                  className={cn("inline-flex h-6 w-12 items-center justify-center rounded border text-[10px] font-semibold", ownCfg[(row as any)[c]].cls)}>
                                  {ownCfg[(row as any)[c]].label}
                                </button>
                              </Td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* SLI/SLO */}
              <div className="col-span-12 xl:col-span-5">
                <Card title="3. SLI / SLO Governance" sub="Measurable service behavior against targets">
                  <div className="divide-y divide-slate-100">
                    {SLIS.map((m, i) => (
                      <button key={i} onClick={() => openDrawer({ kind: "sli", title: `${m.svc} · ${m.metric}`, subtitle: `Target ${m.target}`, data: m })}
                        className="flex w-full items-center justify-between py-2 text-left hover:bg-slate-50/70">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{m.svc}</div>
                          <div className="text-[11px] text-slate-500">{m.metric} · target {m.target}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold tabular-nums text-slate-800">{m.val}</span>
                          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]", statusCfg[m.status].chip)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg[m.status].dot)} />{statusCfg[m.status].label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Error Budget */}
            <Card title="4. Error Budget Governance" sub="Release gating policy enforced when burn crosses thresholds">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                    <Th>Service</Th><Th>Budget</Th><Th>Consumed</Th><Th>Remaining</Th><Th>Burn Profile</Th><Th>Status</Th><Th>Trend</Th>
                  </tr>
                </thead>
                <tbody>
                  {SERVICES.slice(0, 6).map(s => {
                    const st: Status = s.burn > 60 ? "risk" : s.burn > 30 ? "watch" : "healthy";
                    return (
                      <tr key={s.id} onClick={() => openDrawer({ kind: "budget", title: `${s.name} · Error Budget`, subtitle: `Burn ${s.burn}% · Remaining ${s.errBudget}%`, data: s })}
                        className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/70">
                        <Td className="font-medium">{s.name}</Td>
                        <Td className="tabular-nums">100%</Td>
                        <Td className="tabular-nums text-slate-700">{s.burn}%</Td>
                        <Td className="tabular-nums text-slate-700">{s.errBudget}%</Td>
                        <Td>
                          <div className="relative h-2 w-48 overflow-hidden rounded-full bg-slate-100">
                            <div className={cn("h-full", st === "risk" ? "bg-rose-500" : st === "watch" ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${s.burn}%` }} />
                            <div className="absolute inset-y-0" style={{ left: "30%", width: 1, background: "rgba(15,23,42,0.25)" }} />
                            <div className="absolute inset-y-0" style={{ left: "60%", width: 1, background: "rgba(15,23,42,0.25)" }} />
                          </div>
                        </Td>
                        <Td><span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]", statusCfg[st].chip)}><span className={cn("h-1.5 w-1.5 rounded-full", statusCfg[st].dot)} />{statusCfg[st].label}</span></Td>
                        <Td>{s.burn > 50 ? <TrendingUp className="h-3.5 w-3.5 text-rose-500" /> : <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-3 grid grid-cols-1 gap-2 rounded-md border border-amber-200 bg-amber-50/60 p-3 text-[12px] text-amber-900 md:grid-cols-4">
                <Policy icon={ShieldCheck} label="Pause releases" />
                <Policy icon={FileText}    label="Require review" />
                <Policy icon={Users}       label="Escalate ownership" />
                <Policy icon={Wrench}      label="Increase reliability investment" />
              </div>
            </Card>

            <div className="grid grid-cols-12 gap-4">
              {/* Incidents */}
              <div className="col-span-12 xl:col-span-6">
                <Card title="5. Incident Governance Model" sub="30-day SEV dashboard">
                  <div className="grid grid-cols-4 gap-2">
                    {INCIDENTS.map(i => (
                      <button key={i.sev} onClick={() => openDrawer({ kind: "incident", title: i.sev, subtitle: i.impact, data: i })}
                        className="rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-blue-300 hover:bg-blue-50/40">
                        <div className={cn("inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold",
                          i.sev === "SEV1" ? "bg-rose-100 text-rose-700" :
                          i.sev === "SEV2" ? "bg-orange-100 text-orange-700" :
                          i.sev === "SEV3" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700")}>{i.sev}</div>
                        <div className="mt-1 text-xl font-semibold tabular-nums">{i.count}</div>
                        <div className="text-[11px] text-slate-500">MTTR {i.mttr}</div>
                        <div className="text-[11px] text-slate-500">{i.impact}</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 rounded-md border border-slate-200 bg-slate-50/60 p-3">
                    <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Incident Commander Model</div>
                    <div className="grid grid-cols-2 gap-2 text-[12px] md:grid-cols-5">
                      {["Incident Commander","Technical Lead","Communications","Business Liaison","Exec Escalation"].map(r => (
                        <div key={r} className="rounded border border-slate-200 bg-white px-2 py-1.5 text-center">{r}</div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Runbook Maturity */}
              <div className="col-span-12 xl:col-span-6">
                <Card title="6. Runbook Maturity Model" sub="Manual → Self Healing With Approval">
                  <div className="mb-3 flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500">
                    {STAGES.map((s, i) => (<><span key={s}>{s}</span>{i < STAGES.length - 1 && <ChevronRight className="h-3 w-3" />}</>))}
                  </div>
                  <div className="divide-y divide-slate-100">
                    {RUNBOOKS.map(r => {
                      const idx = STAGES.indexOf(r.stage);
                      return (
                        <button key={r.id} onClick={() => openDrawer({ kind: "runbook", title: r.name, subtitle: `${r.stage} · Owner ${r.owner}`, data: r })}
                          className="flex w-full items-center gap-3 py-2 text-left hover:bg-slate-50/70">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{r.name}</div>
                            <div className="text-[11px] text-slate-500">{r.owner} · {r.hrs}h/mo saved</div>
                          </div>
                          <div className="flex w-48 items-center gap-1">
                            {STAGES.map((_, i) => (
                              <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= idx ? "bg-blue-500" : "bg-slate-200")} />
                            ))}
                          </div>
                          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-[11px] text-blue-700">{r.stage}</Badge>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>

            {/* Toil */}
            <Card title="7. Toil Register" sub="412 hours monthly recoverable through automation"
              actions={<Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700">412 hrs / mo</Badge>}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                    <Th>Task</Th><Th>Frequency</Th><Th>Hours</Th><Th>Root Cause</Th><Th>Automation Candidate</Th><Th>Hrs Saved</Th><Th>Owner</Th>
                  </tr>
                </thead>
                <tbody>
                  {TOIL.map((t, i) => (
                    <tr key={i} onClick={() => openDrawer({ kind: "toil", title: t.task, subtitle: `${t.freq} · ${t.hrs} hrs`, data: t })}
                      className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/70">
                      <Td className="font-medium">{t.task}</Td>
                      <Td>{t.freq}</Td>
                      <Td className="tabular-nums">{t.hrs}</Td>
                      <Td className="text-slate-600">{t.root}</Td>
                      <Td><Badge variant="outline" className={cn("text-[11px]", t.cand === "Yes" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700")}>{t.cand}</Badge></Td>
                      <Td className="tabular-nums text-emerald-700">{t.saved}</Td>
                      <Td>{t.owner}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <div className="grid grid-cols-12 gap-4">
              {/* Postmortems */}
              <div className="col-span-12 xl:col-span-7">
                <Card title="8. Postmortem System" sub="Blameless reviews · last 90 days 100%">
                  <div className="divide-y divide-slate-100">
                    {POSTMORTEMS.map(p => (
                      <button key={p.id} onClick={() => openDrawer({ kind: "postmortem", title: `${p.id} · ${p.title}`, subtitle: `${p.sev} · ${p.status}`, data: p })}
                        className="grid w-full grid-cols-12 items-center gap-2 py-2 text-left hover:bg-slate-50/70">
                        <div className="col-span-3"><div className="text-sm font-medium">{p.id}</div><div className="text-[11px] text-slate-500">{p.title}</div></div>
                        <div className="col-span-1"><Badge variant="outline" className={cn("text-[10px]", p.sev === "SEV1" ? "border-rose-200 bg-rose-50 text-rose-700" : p.sev === "SEV2" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-amber-200 bg-amber-50 text-amber-700")}>{p.sev}</Badge></div>
                        <div className="col-span-3 text-[12px] text-slate-600"><div className="font-medium text-slate-700">Root</div>{p.root}</div>
                        <div className="col-span-3 text-[12px] text-slate-600"><div className="font-medium text-slate-700">Action</div>{p.action}</div>
                        <div className="col-span-1 text-[11px] text-slate-500">{p.due}</div>
                        <div className="col-span-1 text-right"><Badge variant="outline" className={cn("text-[10px]", p.status === "Closed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : p.status === "Open" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700")}>{p.status}</Badge></div>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* PRR + Cadence */}
              <div className="col-span-12 space-y-4 xl:col-span-5">
                <Card title="9. Production Readiness Review" sub="Score 89% · Ready">
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRR.map(p => (
                      <button key={p.item} onClick={() => openDrawer({ kind: "prr", title: p.item, subtitle: `Score ${p.score}%`, data: p })}
                        className="flex items-center justify-between rounded border border-slate-200 bg-white px-2 py-1.5 text-left text-[12px] hover:border-blue-300 hover:bg-blue-50/40">
                        <span className="flex items-center gap-1.5">
                          <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg[p.status].dot)} />
                          <span className="text-slate-700">{p.item}</span>
                        </span>
                        <span className="font-semibold tabular-nums">{p.score}%</span>
                      </button>
                    ))}
                  </div>
                </Card>
                <Card title="10. Service Review Cadence" sub="Weekly · Monthly · Quarterly · QBR · Board">
                  <div className="divide-y divide-slate-100">
                    {CADENCE.map(c => (
                      <button key={c.name} onClick={() => openDrawer({ kind: "review", title: c.name, subtitle: c.when, data: c })}
                        className="flex w-full items-center justify-between py-2 text-left hover:bg-slate-50/70">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <div>
                            <div className="text-sm font-medium">{c.name}</div>
                            <div className="text-[11px] text-slate-500">{c.when}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("text-[11px]", c.tag === "On Track" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-700")}>{c.tag}</Badge>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Right insights panel */}
          <aside className="col-span-12 space-y-4 xl:col-span-3">
            <Card title="Operating Health" sub="Composite score">
              <div className="flex items-end gap-2">
                <div className="text-4xl font-semibold text-emerald-700 tabular-nums">83</div>
                <div className="pb-1 text-[11px] text-slate-500">/100 · Healthy</div>
              </div>
              <div className="mt-2 space-y-1.5">
                {[
                  { l: "Prevent (Automation)",   v: 68, c: "bg-blue-500" },
                  { l: "Detect (Observability)", v: 76, c: "bg-indigo-500" },
                  { l: "Respond (Incident Mgmt)",v: 80, c: "bg-violet-500" },
                  { l: "Learn (Postmortems)",    v: 72, c: "bg-fuchsia-500" },
                ].map(r => (
                  <div key={r.l}>
                    <div className="flex justify-between text-[11px] text-slate-500"><span>{r.l}</span><span>{r.v}%</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={cn("h-full", r.c)} style={{ width: `${r.v}%` }} /></div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Reliability Risks">
              {[
                { l: "Claims Error Budget Burn", v: "72%",   t: "risk" as Status },
                { l: "Ownership Gaps",           v: "8 svcs",t: "watch" as Status },
                { l: "Toil Opportunity",         v: "412 h/mo", t: "watch" as Status },
                { l: "Container Adoption",       v: "21%",   t: "watch" as Status },
              ].map(r => (
                <div key={r.l} className="flex items-center justify-between border-t border-slate-100 py-2 first:border-t-0">
                  <div className="flex items-center gap-2 text-[12px] text-slate-700">
                    <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg[r.t].dot)} />{r.l}
                  </div>
                  <span className="text-[12px] font-semibold tabular-nums">{r.v}</span>
                </div>
              ))}
            </Card>

            <Card title="Modernization & Automation">
              {[
                { l: "Automation Coverage",   v: 47 },
                { l: "GitHub Actions Adoption", v: 68 },
                { l: "Datadog Coverage",      v: 82 },
                { l: "Container Adoption",    v: 21 },
              ].map(r => (
                <div key={r.l} className="py-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500"><span>{r.l}</span><span>{r.v}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-teal-500" style={{ width: `${r.v}%` }} /></div>
                </div>
              ))}
            </Card>

            <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                <Bot className="h-4 w-4" /> AI-Assisted Reliability Operations
              </div>
              <div className="mt-1 text-[11px] text-blue-900/70">AI supports detection, correlation, summarization, RCA, runbook generation, error-budget analysis, capacity forecasting, change prep.</div>
              <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                {["Detection","Correlation","Summarization","RCA","Runbook Gen","Budget Analysis","Capacity Forecast","Change Prep"].map(x => (
                  <div key={x} className="rounded border border-blue-200 bg-white px-1.5 py-1 text-blue-800">{x}</div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
                <ShieldCheck className="h-3 w-3" /> Production-changing actions require human approval.
              </div>
            </div>
          </aside>
        </div>

        <div className="border-t border-slate-200 bg-white px-6 py-2 text-[11px] text-slate-500">
          Last updated: May 16, 2026 9:30 AM ET · Source: Client Digital Twin
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-[520px] sm:max-w-[520px]">
          <SheetHeader>
            <SheetTitle className="text-base">{drawer?.title}</SheetTitle>
            {drawer?.subtitle && <div className="text-xs text-slate-500">{drawer.subtitle}</div>}
          </SheetHeader>
          <div className="mt-4">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="metrics"  className="text-xs">Metrics</TabsTrigger>
                <TabsTrigger value="owners"   className="text-xs">Ownership</TabsTrigger>
                <TabsTrigger value="actions"  className="text-xs">Actions</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-3 space-y-2 text-sm">
                <Row label="Type" value={drawer?.kind ?? "—"} />
                <Row label="Owner" value="SRE Pod A" />
                <Row label="Product Line" value="HHA Enterprise" />
                <Row label="Environment" value="Production" />
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[12px] text-slate-600">
                  This entity is governed under the Client SRE Operating Model. Reliability decisions are made through SLOs and error budgets, not ticket queues.
                </div>
              </TabsContent>
              <TabsContent value="metrics" className="mt-3 space-y-2 text-sm">
                <Row label="Availability" value="99.95%" />
                <Row label="Latency p95"  value="187 ms" />
                <Row label="Error Rate"   value="0.02%" />
                <Row label="MTTR"         value="47 m" />
                <Row label="Change Failure Rate" value="4.2%" />
                <Row label="Toil (mo)"    value="22 hrs" />
              </TabsContent>
              <TabsContent value="owners" className="mt-3 space-y-2 text-sm">
                <Row label="Product Owner" value="J. Reed" />
                <Row label="Service Owner" value="A. Patel" />
                <Row label="SRE Lead"      value="M. Singh" />
                <Row label="Platform Lead" value="L. Romero" />
                <Row label="Security Lead" value="K. Yamada" />
              </TabsContent>
              <TabsContent value="actions" className="mt-3 space-y-2 text-sm">
                {["Open SLO dashboard","Open error budget report","Open runbook","Open postmortem","Escalate to commander","Pause releases"].map(a => (
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
      <header className="mb-3 flex items-start justify-between">
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
function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-2 py-2 text-left font-medium">{children}</th>;
}
function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-2 py-2 align-middle", className)}>{children}</td>;
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-slate-100 bg-slate-50/50 px-2 py-1.5 text-[12px]">
      <span className="text-slate-500">{label}</span><span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
function Policy({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded bg-white px-2 py-1.5 ring-1 ring-amber-200">
      <Icon className="h-3.5 w-3.5 text-amber-600" /><span>{label}</span>
    </div>
  );
}
