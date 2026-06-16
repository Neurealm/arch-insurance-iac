import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Search, Bell, HelpCircle, Settings, Info, Activity, ShieldCheck, AlertOctagon,
  AlertTriangle, Users, Clock, Smartphone, ClipboardCheck, Calculator, RefreshCw,
  Database, Target, ChevronRight, Filter, Calendar, GitCompare, ArrowRight,
  Home, FileText, Wallet, Building2, Lock, CheckCircle2, ShieldAlert, Sparkles,
  TrendingUp, Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Status = "good" | "degraded" | "risk" | "unknown";
const statusBg: Record<Status, string> = {
  good: "bg-emerald-50 text-emerald-700 border-emerald-200",
  degraded: "bg-amber-50 text-amber-700 border-amber-200",
  risk: "bg-rose-50 text-rose-700 border-rose-200",
  unknown: "bg-slate-50 text-slate-500 border-slate-200",
};
const statusDot: Record<Status, string> = {
  good: "bg-emerald-500", degraded: "bg-amber-500", risk: "bg-rose-500", unknown: "bg-slate-400",
};
const statusLabel = (s: Status, pct?: string) =>
  s === "good" ? `Good${pct ? ` (${pct})` : ""}` :
  s === "degraded" ? `Degraded${pct ? ` (${pct})` : ""}` :
  s === "risk" ? `At Risk${pct ? ` (${pct})` : ""}` : "Unknown";

type Step = { title: string; bullets: string[]; status: Status };
type Workflow = {
  id: string; name: string; subtitle: string; tier: "Mission Critical" | "High";
  icon: React.ReactNode; iconBg: string;
  steps: Step[];
  outcome: { title: string; lines: string[]; status: Status };
};

const WORKFLOWS: Workflow[] = [
  {
    id: "caregiver", name: "Caregiver Visit / EVV", subtitle: "Direct caregiver care", tier: "Mission Critical",
    icon: <Home className="h-4 w-4" />, iconBg: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    steps: [
      { title: "Mobile App", bullets: ["Login & Patient Select", "Offline Mode"], status: "good" },
      { title: "Visit Start / Stop", bullets: ["EVV / Geolocation", "Visit Notes & Tasks"], status: "good" },
      { title: "Local Data Capture", bullets: ["Store Encrypted", "No Data Loss"], status: "good" },
      { title: "Sync to Platform", bullets: ["Background Sync", "Retry w/ Backoff"], status: "good" },
      { title: "API Services / DB", bullets: ["Write Visit Record", "Audit & Confirm"], status: "good" },
    ],
    outcome: { title: "Visit Recorded", lines: ["Caregiver paid", "Patient care validated"], status: "good" },
  },
  {
    id: "claims", name: "Claims Processing", subtitle: "Revenue cycle impact", tier: "Mission Critical",
    icon: <FileText className="h-4 w-4" />, iconBg: "bg-blue-50 text-blue-600 ring-blue-100",
    steps: [
      { title: "Claims Intake", bullets: ["837/EDI / Portal", "Document Upload"], status: "degraded" },
      { title: "Validation", bullets: ["Eligibility Check", "Payer Rules Engine"], status: "degraded" },
      { title: "Claim Adjudication", bullets: ["Batch Jobs", "Coding / Edits"], status: "good" },
      { title: "Submit to Payer", bullets: ["EDI Transmission", "Ack / Rejection"], status: "good" },
      { title: "Payment / Posting", bullets: ["ERA / EFT", "GL / Revenue Posting"], status: "good" },
    ],
    outcome: { title: "Revenue Received", lines: ["Clean claim paid", "Denials minimized"], status: "good" },
  },
  {
    id: "payroll", name: "Payroll Processing", subtitle: "Caregiver payroll accuracy", tier: "High",
    icon: <Wallet className="h-4 w-4" />, iconBg: "bg-violet-50 text-violet-600 ring-violet-100",
    steps: [
      { title: "Time Capture", bullets: ["From EVV Visits", "Manual Adjustments"], status: "good" },
      { title: "Visit Verification", bullets: ["Rules & Exceptions", "Manager Review"], status: "good" },
      { title: "Payroll Calculation", bullets: ["Rates / OT / Taxes", "Deductions"], status: "good" },
      { title: "Payroll Run", bullets: ["Batch Processing", "Bank File Generate"], status: "good" },
      { title: "Disbursement", bullets: ["Direct Deposit", "Pay Stub / Reports"], status: "good" },
    ],
    outcome: { title: "Caregiver Paid", lines: ["On-time & accurate", "Compliant"], status: "good" },
  },
  {
    id: "sla", name: "State / Customer SLA", subtitle: "Compliance & commitments", tier: "High",
    icon: <Building2 className="h-4 w-4" />, iconBg: "bg-amber-50 text-amber-600 ring-amber-100",
    steps: [
      { title: "Commitment Intake", bullets: ["State Contracts", "Customer SLAs"], status: "good" },
      { title: "Availability Monitor", bullets: ["Uptime / Response", "Escalation Rules"], status: "good" },
      { title: "Performance Review", bullets: ["SLA Metrics", "Thresholds"], status: "good" },
      { title: "Escalation / Notify", bullets: ["State / Customer", "Communication"], status: "good" },
      { title: "Audit & Reporting", bullets: ["SLA Reports", "Evidence Packets"], status: "good" },
    ],
    outcome: { title: "SLA Met", lines: ["Compliance", "Customer Trust"], status: "good" },
  },
  {
    id: "phi", name: "PHI Protection", subtitle: "Data privacy & security", tier: "Mission Critical",
    icon: <Lock className="h-4 w-4" />, iconBg: "bg-slate-100 text-slate-700 ring-slate-200",
    steps: [
      { title: "Data Access", bullets: ["RBAC / MFA", "Least Privilege"], status: "good" },
      { title: "Data Handling", bullets: ["Encryption (In Transit)", "Encryption (At Rest)"], status: "good" },
      { title: "Logging / Monitoring", bullets: ["Audit Logs", "Anomaly Detect"], status: "good" },
      { title: "Threat Detection", bullets: ["EDR / SIEM", "Alert / Triage"], status: "good" },
      { title: "Incident Response", bullets: ["Contain / Eradicate", "Forensic / Notify"], status: "good" },
    ],
    outcome: { title: "PHI Protected", lines: ["No Breach", "Data Integrity"], status: "good" },
  },
];

const STAGES = [
  { num: 1, title: "Intake / Capture", sub: "Where it begins", icon: <Smartphone className="h-3.5 w-3.5" /> },
  { num: 2, title: "Process / Validate", sub: "Business logic & rules", icon: <ClipboardCheck className="h-3.5 w-3.5" /> },
  { num: 3, title: "Calculate / Create", sub: "Compute & generate", icon: <Calculator className="h-3.5 w-3.5" /> },
  { num: 4, title: "Deliver / Sync", sub: "Distribute & confirm", icon: <RefreshCw className="h-3.5 w-3.5" /> },
  { num: 5, title: "Downstream", sub: "Systems of record", icon: <Database className="h-3.5 w-3.5" /> },
];

type LayerRow = { layer: string; icon: React.ReactNode; desc: string; cells: { s: Status; v?: string }[] };
const LAYERS: LayerRow[] = [
  { layer: "User Experience", icon: <Users className="h-3.5 w-3.5 text-slate-500" />, desc: "Can the user complete their goal?",
    cells: [{ s: "good" }, { s: "degraded" }, { s: "good" }, { s: "good" }, { s: "good" }, { s: "good" }] },
  { layer: "Application Health", icon: <Layers className="h-3.5 w-3.5 text-slate-500" />, desc: "Are apps & APIs responding?",
    cells: [{ s: "good" }, { s: "degraded" }, { s: "good" }, { s: "good" }, { s: "good" }, { s: "good" }] },
  { layer: "Data Integrity", icon: <Database className="h-3.5 w-3.5 text-slate-500" />, desc: "Is data accurate & consistent?",
    cells: [{ s: "good" }, { s: "risk" }, { s: "good" }, { s: "good" }, { s: "good" }, { s: "risk" }] },
  { layer: "Platform Health", icon: <Activity className="h-3.5 w-3.5 text-slate-500" />, desc: "Is the underlying platform healthy?",
    cells: [{ s: "good" }, { s: "good" }, { s: "good" }, { s: "good" }, { s: "good" }, { s: "good" }] },
  { layer: "Cyber Posture", icon: <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />, desc: "Is the workflow exposed to risk?",
    cells: [{ s: "good" }, { s: "risk" }, { s: "good" }, { s: "good" }, { s: "risk" }, { s: "risk" }] },
  { layer: "SLO / Error Budget", icon: <Target className="h-3.5 w-3.5 text-slate-500" />, desc: "Are we meeting reliability targets?",
    cells: [{ s: "good", v: "13%" }, { s: "risk", v: "28%" }, { s: "good", v: "7%" }, { s: "good", v: "9%" }, { s: "good", v: "5%" }, { s: "risk", v: "12%" }] },
  { layer: "Recovery Posture", icon: <RefreshCw className="h-3.5 w-3.5 text-slate-500" />, desc: "Can we recover without data loss?",
    cells: [{ s: "good" }, { s: "degraded" }, { s: "good" }, { s: "good" }, { s: "good" }, { s: "good" }] },
];

const tierBadge = (t: "Mission Critical" | "High") =>
  t === "Mission Critical"
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : "bg-amber-50 text-amber-700 border-amber-200";

export default function GoldenWorkflowMap() {
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<{ title: string; subtitle?: string; body: React.ReactNode } | null>(null);
  const show = (title: string, body: React.ReactNode, subtitle?: string) => {
    setCtx({ title, subtitle, body }); setOpen(true);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col bg-slate-50/60 min-h-screen">
        {/* Top utility bar */}
        <div className="h-14 border-b bg-white px-6 flex items-center gap-4 sticky top-0 z-20">
          <div className="font-semibold text-slate-800">Client Production Resilience Operating System</div>
          <div className="flex-1 max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search for workflows, services, apps, owners…" className="pl-9 h-9 bg-slate-50 border-slate-200" />
          </div>
          <button className="relative h-9 w-9 grid place-items-center rounded-md hover:bg-slate-100">
            <Bell className="h-4 w-4 text-slate-600" />
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 bg-rose-500 text-white text-[10px] rounded-full grid place-items-center font-semibold">12</span>
          </button>
          <button className="h-9 w-9 grid place-items-center rounded-md hover:bg-slate-100"><HelpCircle className="h-4 w-4 text-slate-600" /></button>
          <button className="h-9 w-9 grid place-items-center rounded-md hover:bg-slate-100"><Settings className="h-4 w-4 text-slate-600" /></button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 grid place-items-center text-white text-xs font-bold">SG</div>
        </div>

        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-900">Golden Workflow Map</h1>
                <Info className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Customer journeys that matter most to Client. Real-time health across experience, applications, data, platform, and security.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Calendar className="h-3.5 w-3.5" />Last 24 hours</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><GitCompare className="h-3.5 w-3.5" />Compare to: 7 days prior</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-blue-200 text-blue-700"><Filter className="h-3.5 w-3.5" />Filters (3)</Button>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
            {[
              { icon: <Activity className="h-4 w-4 text-sky-600" />, label: "Workflow Health", value: "92%", sub: "Good", delta: "+4% vs 7 days prior", tone: "good", body: "Composite weighted across all 5 golden workflows. Trending up 4% week-over-week." },
              { icon: <ShieldCheck className="h-4 w-4 text-blue-600" />, label: "Reliability (SLO Compliance)", value: "95.8%", sub: "Within Target", delta: "+2.1% vs 7 days prior", tone: "good", body: "Weighted SLO compliance across user-facing journeys. Target: 95%." },
              { icon: <AlertOctagon className="h-4 w-4 text-amber-600" />, label: "Error Budget Burn", value: "12%", sub: "Total", delta: "-6% vs 7 days prior", tone: "good", body: "Total error budget consumed this rolling 28-day window. Claims Processing dominates burn." },
              { icon: <AlertTriangle className="h-4 w-4 text-rose-600" />, label: "At Risk Workflows", value: "2", sub: "High Risk", delta: "-1 vs 7 days prior", tone: "risk", body: "Claims Processing and PHI Protection are operating outside SLO or with elevated risk signals." },
              { icon: <Users className="h-4 w-4 text-violet-600" />, label: "Customer Impact", value: "3,210", sub: "Impacted Events", delta: "+1,240 vs 7 days prior", tone: "warn", body: "Customer-facing impact events across all golden workflows over the past 24h." },
              { icon: <Clock className="h-4 w-4 text-teal-600" />, label: "MTTR (Workflow)", value: "38m", sub: "Average", delta: "-15m vs 7 days prior", tone: "good", body: "Mean time to recover workflow health to Green. Best-in-class < 45m." },
            ].map((k, i) => (
              <button key={i} onClick={() => show(k.label, <p className="text-sm text-slate-600">{k.body}</p>, k.sub)}
                className="text-left bg-white border rounded-xl p-3.5 hover:shadow-md hover:border-blue-300 transition group">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 grid place-items-center group-hover:bg-blue-50">{k.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-slate-500">{k.label}</div>
                  </div>
                </div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <div className={cn("text-2xl font-semibold",
                    k.tone === "risk" ? "text-rose-600" : k.tone === "warn" ? "text-amber-600" : "text-slate-900")}>{k.value}</div>
                  <div className="text-[11px] text-slate-500">{k.sub}</div>
                </div>
                <div className={cn("text-[11px] mt-1 flex items-center gap-1",
                  k.delta.startsWith("+") && k.label.includes("Impact") ? "text-rose-600" :
                  k.delta.startsWith("-") && k.label.includes("Burn") ? "text-emerald-600" :
                  k.delta.startsWith("-") && (k.label.includes("Risk") || k.label.includes("MTTR")) ? "text-emerald-600" :
                  k.delta.startsWith("+") ? "text-emerald-600" : "text-slate-500")}>
                  <TrendingUp className="h-3 w-3" /> {k.delta}
                </div>
              </button>
            ))}
          </div>

          {/* Golden Workflow Map grid */}
          <div className="bg-white border rounded-xl overflow-hidden mb-5">
            {/* Column header */}
            <div className="grid grid-cols-[220px_repeat(5,1fr)_180px] border-b bg-slate-50/70">
              <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                Golden Workflows <Info className="h-3 w-3" />
              </div>
              {STAGES.map(s => (
                <div key={s.num} className="px-3 py-3 border-l">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-white border grid place-items-center text-slate-500">{s.icon}</div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{s.num}. {s.title}</div>
                      <div className="text-[10px] text-slate-500">{s.sub}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="px-3 py-3 border-l">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-white border grid place-items-center text-slate-500"><Target className="h-3.5 w-3.5" /></div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Outcome</div>
                    <div className="text-[10px] text-slate-500">Customer impact</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rows */}
            {WORKFLOWS.map(w => (
              <div key={w.id} className="grid grid-cols-[220px_repeat(5,1fr)_180px] border-b last:border-0">
                {/* Workflow label */}
                <button onClick={() => show(w.name, <WorkflowDetail workflow={w} />, w.subtitle)}
                  className="px-4 py-4 text-left flex items-start gap-3 hover:bg-slate-50 transition">
                  <div className={cn("h-9 w-9 rounded-lg ring-1 grid place-items-center shrink-0", w.iconBg)}>
                    {w.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 leading-tight">{w.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{w.subtitle}</div>
                    <Badge variant="outline" className={cn("mt-1.5 text-[10px] border", tierBadge(w.tier))}>{w.tier}</Badge>
                  </div>
                </button>

                {/* Steps */}
                {w.steps.map((step, idx) => (
                  <div key={idx} className="border-l py-4 px-3 relative group">
                    <button onClick={() => show(`${w.name} — ${step.title}`,
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full", statusDot[step.status])} />
                          <span className="text-sm font-medium text-slate-800">{statusLabel(step.status)}</span>
                        </div>
                        <ul className="text-sm text-slate-700 space-y-1 list-disc pl-4">
                          {step.bullets.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                        <div className="pt-2 border-t text-xs text-slate-500">
                          Owned by SRE pod • SLO target 99.5% • Last incident 6d ago
                        </div>
                      </div>, w.name)}
                      className={cn(
                        "w-full text-left rounded-lg border px-2.5 py-2 transition",
                        "hover:shadow-sm hover:border-blue-300 hover:bg-blue-50/30",
                        step.status === "degraded" && "ring-1 ring-amber-200",
                        step.status === "risk" && "ring-1 ring-rose-200",
                      )}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[12px] font-semibold text-slate-800 leading-tight">{step.title}</div>
                        <span className={cn("h-1.5 w-1.5 rounded-full mt-1.5 shrink-0", statusDot[step.status])} />
                      </div>
                      <ul className="mt-1.5 space-y-0.5">
                        {step.bullets.map((b, i) => (
                          <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                            <span className={cn("h-1 w-1 rounded-full mt-1.5 shrink-0", statusDot[step.status])} />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                    {/* connector arrow */}
                    {idx < 4 && (
                      <div className="absolute right-[-7px] top-1/2 -translate-y-1/2 z-10 h-4 w-4 rounded-full bg-white border grid place-items-center text-slate-400">
                        <ArrowRight className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Outcome */}
                <button onClick={() => show(`${w.name} — Outcome`,
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span className="text-sm font-semibold">{w.outcome.title}</span></div>
                    <ul className="text-sm text-slate-700 space-y-1 list-disc pl-4">
                      {w.outcome.lines.map((l, i) => <li key={i}>{l}</li>)}
                    </ul>
                  </div>, w.name)}
                  className="border-l py-4 px-3 text-left hover:bg-emerald-50/40 transition group">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-slate-800 leading-tight">{w.outcome.title}</div>
                      <div className="mt-1 space-y-0.5">
                        {w.outcome.lines.map((l, i) => (
                          <div key={i} className="text-[11px] text-slate-600">{l}</div>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-600 ml-auto self-center" />
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Bottom: Health by Layer + Executive Insights */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
            {/* Health by Layer */}
            <div className="bg-white border rounded-xl p-4">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">Health by Layer</div>
                  <div className="text-[11px] text-slate-500">(Across all workflows)</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[11px] text-slate-500 uppercase tracking-wider">
                      <th className="text-left px-2 py-2 font-semibold w-[140px]">Layer</th>
                      <th className="text-left px-2 py-2 font-semibold w-[220px]">Description</th>
                      {WORKFLOWS.map(w => (
                        <th key={w.id} className="px-2 py-2 text-center font-semibold">
                          <div className="flex flex-col items-center gap-1">
                            <div className={cn("h-6 w-6 rounded-md ring-1 grid place-items-center", w.iconBg)}>{w.icon}</div>
                            <span className="text-[10px] normal-case text-slate-700 leading-tight max-w-[80px]">{w.name}</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-2 py-2 text-center font-semibold">Overall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LAYERS.map((row, ri) => (
                      <tr key={ri} className="border-t">
                        <td className="px-2 py-2 font-medium text-slate-800">
                          <span className="flex items-center gap-1.5">{row.icon}{row.layer}</span>
                        </td>
                        <td className="px-2 py-2 text-slate-500">{row.desc}</td>
                        {row.cells.map((c, ci) => (
                          <td key={ci} className="px-2 py-2 text-center">
                            <button onClick={() => show(
                              `${row.layer} · ${ci < WORKFLOWS.length ? WORKFLOWS[ci].name : "Overall"}`,
                              <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", statusDot[c.s])} /><span className="font-medium text-slate-800">{statusLabel(c.s, c.v)}</span></div>
                                <p>{row.desc}</p>
                                <p className="text-xs text-slate-500">Drill into telemetry, recent incidents, SLO burn, and ownership for this layer.</p>
                              </div>
                            )}
                              className={cn("w-full text-[11px] font-medium px-2 py-1 rounded border transition hover:shadow-sm", statusBg[c.s])}>
                              {statusLabel(c.s, c.v)}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 pt-3 border-t flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Good 90-100%</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Degraded 70-89%</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" />At Risk &lt;70%</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" />Unknown / N/A</span>
              </div>
            </div>

            {/* Executive Insights */}
            <div className="bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-slate-800">Executive Insights</div>
                <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">View All Insights <ChevronRight className="h-3 w-3" /></button>
              </div>
              <div className="space-y-3">
                {[
                  { icon: <AlertTriangle className="h-4 w-4 text-rose-600" />, title: "Claims Processing at Risk", desc: "Error budget burn rate is 28%. Top issue: Payer rule engine latency." },
                  { icon: <ShieldAlert className="h-4 w-4 text-amber-600" />, title: "Cyber Exposure Detected", desc: "2 high CVEs open in claims API dependency." },
                  { icon: <Sparkles className="h-4 w-4 text-violet-600" />, title: "Automation Opportunity", desc: "27 runbooks can be automated. Est. 184 hours saved / month." },
                  { icon: <Users className="h-4 w-4 text-teal-600" />, title: "Reliability Trend", desc: "Overall SLO compliance improved 2.1% vs last 7 days." },
                ].map((ins, i) => (
                  <button key={i} onClick={() => show(ins.title, <p className="text-sm text-slate-600">{ins.desc}</p>)}
                    className="w-full text-left p-3 rounded-lg border hover:border-blue-300 hover:bg-slate-50 transition group">
                    <div className="flex items-start gap-2.5">
                      <div className="h-8 w-8 rounded-md bg-slate-50 grid place-items-center shrink-0">{ins.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-900">{ins.title}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{ins.desc}</div>
                        <div className="mt-1.5 text-[11px] text-blue-600 group-hover:underline inline-flex items-center gap-0.5">View Details <ArrowRight className="h-3 w-3" /></div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Last updated: Jun 14, 2026 8:30 AM ET <RefreshCw className="h-3 w-3 inline ml-1 text-slate-400" /></span>
            <span className="flex items-center gap-1">Source: Client Digital Twin <Info className="h-3 w-3" /></span>
          </div>
        </main>

        {/* Detail drawer */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-[480px] sm:max-w-[480px] overflow-y-auto">
            {ctx && (
              <>
                <SheetHeader>
                  <SheetTitle>{ctx.title}</SheetTitle>
                  {ctx.subtitle && <div className="text-xs text-slate-500">{ctx.subtitle}</div>}
                </SheetHeader>
                <div className="mt-4">{ctx.body}</div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}

function WorkflowDetail({ workflow: w }: { workflow: Workflow }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn("text-[10px] border", tierBadge(w.tier))}>{w.tier}</Badge>
        <Badge variant="outline" className="text-[10px]">SLO 99.5%</Badge>
        <Badge variant="outline" className="text-[10px]">Workflow Owner: SRE Pod A</Badge>
      </div>
      <p className="text-sm text-slate-600">
        End-to-end customer journey health. This is the unit of ownership for the SRE operating model — replacing ticket-level
        accountability with workflow accountability.
      </p>
      <div>
        <div className="text-xs font-semibold text-slate-700 mb-2">Stage Health</div>
        <div className="space-y-1.5">
          {w.steps.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-2 border rounded-md text-xs">
              <span className="flex items-center gap-2">
                <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[s.status])} />
                <span className="font-medium text-slate-800">{i + 1}. {s.title}</span>
              </span>
              <span className={cn("text-[10px] px-2 py-0.5 rounded border", statusBg[s.status])}>{statusLabel(s.status)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between p-2 border rounded-md text-xs bg-emerald-50/40">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span className="font-medium text-slate-800">Outcome: {w.outcome.title}</span></span>
            <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700">Delivered</Badge>
          </div>
        </div>
      </div>
      <Button className="w-full bg-blue-600 hover:bg-blue-700">Open Workflow Workspace</Button>
    </div>
  );
}
