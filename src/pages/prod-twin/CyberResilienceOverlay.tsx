import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Filter, TrendingUp, TrendingDown, ShieldCheck, ShieldAlert, Bug, KeyRound,
  Activity, Database, Globe, Layers, Network as NetIcon, Server, Lock, AlertTriangle,
  Sparkles, ChevronRight, Eye, FileCheck, Target, Zap, Workflow, BellRing, HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Risk = "low" | "medium" | "high" | "critical";
const riskDot: Record<Risk, string> = {
  low: "bg-emerald-500", medium: "bg-amber-500", high: "bg-rose-500", critical: "bg-rose-600",
};
const riskChip: Record<Risk, string> = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
  critical: "bg-rose-100 text-rose-800 border-rose-300",
};

type Drawer = { kind: string; title: string; subtitle?: string; data?: any } | null;

/* --- Sparkline --- */
function spark(n: number, seed: number) {
  let s = seed;
  return Array.from({ length: n }, (_, i) => {
    s = (s * 9301 + 49297) % 233280;
    return 50 + (s / 233280) * 30 - 15 + Math.sin(i / 2 + seed) * 6;
  });
}
function Sparkline({ data, color = "text-blue-500" }: { data: number[]; color?: string }) {
  const w = 100, h = 28;
  const mx = Math.max(...data), mn = Math.min(...data);
  const path = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - mn) / Math.max(0.001, mx - mn)) * (h - 4) - 2;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-6 w-full", color)}>
      <path d={`${path} L${w},${h} L0,${h} Z`} className="fill-current opacity-10" />
      <path d={path} fill="none" strokeWidth={1.5} className="stroke-current" />
    </svg>
  );
}

/* --- Donut --- */
function Donut({ value, label, color = "stroke-emerald-500", center }: { value: number; label?: string; color?: string; center: { v: string; sub: string } }) {
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
        <circle cx="18" cy="18" r="15.9" fill="none" className={color} strokeWidth="3.5" strokeDasharray={`${value} 100`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xl font-semibold tabular-nums text-slate-900">{center.v}</div>
        <div className="text-[10px] text-slate-500">{center.sub}</div>
      </div>
    </div>
  );
}

/* --- KPIs --- */
const KPIS = [
  { id: "surface", label: "Production Attack Surface", value: "412", sub: "Tracked Assets",     hint: "+4 vs 30d",          icon: Globe,       accent: "text-blue-600",    up: true,  color: "text-blue-500" },
  { id: "patch",   label: "Patch Compliance",          value: "89%", sub: "Within SLA",         hint: "+6% vs 30 days",     icon: FileCheck,   accent: "text-emerald-600", up: true,  color: "text-emerald-500" },
  { id: "cve",     label: "Critical CVEs",             value: "18",  sub: "Open",               hint: "-4 vs 30 days",      icon: Bug,         accent: "text-rose-600",    up: false, color: "text-rose-500" },
  { id: "golden",  label: "Golden Build Compliance",   value: "92%", sub: "Aligned",            hint: "+5% vs 30 days",     icon: ShieldCheck, accent: "text-emerald-600", up: true,  color: "text-emerald-500" },
  { id: "idrisk",  label: "Identity Risk Score",       value: "74",  sub: "Watch",              hint: "-3 pts vs 30 days",  icon: KeyRound,    accent: "text-amber-600",   up: false, color: "text-amber-500" },
  { id: "edr",     label: "CrowdStrike Coverage",      value: "97%", sub: "Assets Protected",   hint: "+2% vs 30 days",     icon: ShieldCheck, accent: "text-emerald-600", up: true,  color: "text-emerald-500" },
  { id: "recover", label: "Cyber Recovery Readiness",  value: "91%", sub: "Validated",          hint: "+4% vs 30 days",     icon: Activity,    accent: "text-emerald-600", up: true,  color: "text-emerald-500" },
];

/* --- Attack surface layers --- */
type Layer = { id: string; name: string; icon: any; rows: [string, string][]; risk: Risk; brand: string };
const LAYERS: Layer[] = [
  { id: "internet", name: "Internet", icon: Globe, brand: "text-blue-600", risk: "medium",
    rows: [["Public Endpoints","84"],["External APIs","32"],["Portals","14"],["VPN Endpoints","6"]] },
  { id: "controls", name: "Security Controls", icon: ShieldCheck, brand: "text-emerald-600", risk: "medium",
    rows: [["Security Groups","1,284"],["Firewall Policies","218"],["Changes This Month","84"],["Jump Hosts","12"]] },
  { id: "identity", name: "Identity Layer", icon: KeyRound, brand: "text-violet-600", risk: "medium",
    rows: [["Domains","Multiple"],["MFA Coverage","92%"],["Privileged Accounts","214"],["Service Accounts","1,842"]] },
  { id: "apps", name: "Applications", icon: Layers, brand: "text-indigo-600", risk: "medium",
    rows: [["HHA Enterprise",""],["Sandata Fuse",""],["Provider Pro",""],["Pavilio",""],["Self Direction",""],["Claims Services",""],["Payroll Services",""]] },
  { id: "db", name: "Databases", icon: Database, brand: "text-teal-600", risk: "medium",
    rows: [["SQL Server Shards","24"],["Oracle Exadata","14"],["Aurora PostgreSQL","8"],["MySQL","6"],["MongoDB","3"]] },
  { id: "recover", name: "Recovery Layer", icon: Activity, brand: "text-emerald-600", risk: "low",
    rows: [["Immutable Backups",""],["Cross Region Replication",""],["DR Runbooks",""],["Recovery Validation",""],["Identity Recovery",""]] },
];

const PATCH_ROWS = [
  { asset: "Windows IIS Cluster", sev: "Critical" as Risk, days: 4, owner: "Platform Eng", status: "Open" },
  { asset: "SQL Server Shard 2",  sev: "high" as Risk,     days: 9, owner: "DB Team", status: "Open" },
  { asset: "Aurora Cluster",      sev: "medium" as Risk,   days: 12, owner: "Cloud Team", status: "Planned" },
];

const GOLDEN_CHECKS: [string, string][] = [
  ["CIS Benchmark","92%"],["CrowdStrike","97%"],["Logging Agent","94%"],["Encryption","100%"],["Backup Agent","98%"],["Patch Baseline","91%"],
];

const IDENTITY_RISKS: [string, Risk][] = [
  ["AD Risk","medium"],["Entra ID Risk","medium"],["Service Accounts Risk","high"],["Privileged Access Risk","high"],["JML Process","medium"],
];

const FIREWALL_DIFFS = [
  { change: "Public Port Opened", env: "Prod", risk: "high" as Risk, blast: "Claims API", status: "Pending" },
  { change: "New VPN Rule",       env: "Prod", risk: "medium" as Risk, blast: "Provider Portal", status: "Approved" },
  { change: "SG Ingress Open",    env: "Prod", risk: "high" as Risk, blast: "Caregiver API", status: "Pending" },
];

const COVERAGE_SOURCES: [string, "ok" | "warn"][] = [
  ["AWS Logs","ok"],["Windows Logs","ok"],["Linux Logs","ok"],["Database Logs","ok"],["Citrix Logs","warn"],["GitHub Actions","ok"],
];

const RECOVERY_CHECKS: [string, string][] = [
  ["Immutable Backups","100%"],["Restore Validation","97%"],["Identity Recovery","76%"],["Clean Room Recovery","88%"],["DR Testing","94%"],["Cross Region Recovery","93%"],
];

const HANDOFF_STAGES = [
  { icon: ShieldAlert, label: "Finding", v: "18", sub: "New Findings" },
  { icon: Target,      label: "Risk Score", v: "94", sub: "Avg Risk Score" },
  { icon: KeyRound,    label: "Owner", v: "23", sub: "Assigned" },
  { icon: Workflow,    label: "Patch Window", v: "7", sub: "This Week" },
  { icon: ShieldCheck, label: "Validation", v: "12", sub: "Validated" },
  { icon: FileCheck,   label: "Evidence", v: "10", sub: "With Evidence" },
  { icon: Activity,    label: "Closure", v: "15", sub: "Closed" },
];

const EXEC_INSIGHTS = [
  { icon: AlertTriangle, color: "text-rose-600",    title: "Top Risks", sub: "3 critical exposures require action" },
  { icon: Activity,      color: "text-blue-600",    title: "Recovery Risk", sub: "Identity recovery not fully validated" },
  { icon: Zap,           color: "text-violet-600",  title: "Automation Opportunity", sub: "27 automation opportunities identified" },
  { icon: ShieldCheck,   color: "text-emerald-600", title: "Security Health", sub: "Overall cyber health is 87 (Healthy)" },
];

const AI_OPS = [
  { icon: Eye,          title: "Exposure Analysis",   sub: "12 new exposures identified" },
  { icon: Bug,          title: "Patch Prioritization", sub: "18 patches require attention" },
  { icon: NetIcon,      title: "Firewall Diff Review", sub: "7 risky changes detected" },
  { icon: ShieldAlert,  title: "Drift Detection",     sub: "9 systems drifted from standard" },
  { icon: FileCheck,    title: "Evidence Collection", sub: "10 items need validation" },
];

/* --- Small bits --- */
function Card({ title, action, children, onClick }: { title: string; action?: React.ReactNode; children: React.ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={cn("rounded-2xl border border-slate-200 bg-white shadow-sm", onClick && "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200")}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ViewAll({ label = "View all" }: { label?: string }) {
  return <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-blue-600 hover:underline">{label} <ChevronRight className="h-3 w-3" /></span>;
}

/* --- Page --- */
export default function CyberResilienceOverlay() {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [tracing, setTracing] = useState(false);
  const [hoverLayer, setHoverLayer] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    env: "Production", product: "All", cloud: "All", risk: "All", control: "All", mod: "All", time: "Last 30 days",
  });
  const [loading, setLoading] = useState(false);
  const open = (d: Drawer) => setDrawer(d);

  function changeFilter<K extends keyof typeof filters>(k: K, v: string) {
    setLoading(true);
    setFilters({ ...filters, [k]: v });
    setTimeout(() => setLoading(false), 600);
  }

  const tracePath = useMemo(() => ["internet", "controls", "identity", "apps", "db", "recover"], []);

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50/60 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">HHAX Production Resilience Operating System</div>
            <h1 className="text-xl font-semibold tracking-tight">Cyber Resilience Overlay</h1>
            <div className="mt-0.5 text-xs text-slate-500">Protect production workflows through identity, patching, cyber controls, recovery readiness, and security engineering.</div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filters.env} onValueChange={(v) => changeFilter("env", v)}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><SelectValue /></span>
              </SelectTrigger>
              <SelectContent>{["Production","Non Production","All"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.time} onValueChange={(v) => changeFilter("time", v)}>
              <SelectTrigger className="h-9 w-[140px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{["24 hours","7 days","Last 30 days","90 days","12 months"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5 border-blue-200 bg-blue-50 text-blue-700"><Filter className="h-3.5 w-3.5" /> Filters (6)</Button>
            <button className="relative h-9 w-9 rounded-md border border-slate-200 grid place-items-center text-slate-500 hover:bg-slate-50">
              <BellRing className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white grid place-items-center">12</span>
            </button>
            <button className="h-9 w-9 rounded-md border border-slate-200 grid place-items-center text-slate-500 hover:bg-slate-50"><HelpCircle className="h-4 w-4" /></button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center text-white text-xs font-bold">RB</div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {KPIS.map((k, i) => {
              const Icon = k.icon;
              return (
                <button key={k.id} onClick={() => open({ kind: "kpi", title: k.label, subtitle: k.sub, data: k })}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className={cn("rounded-md bg-slate-50 p-1.5", k.accent)}><Icon className="h-4 w-4" /></div>
                    <div className="text-[11px] font-medium text-slate-600 truncate">{k.label}</div>
                  </div>
                  <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{loading ? <span className="inline-block h-6 w-12 rounded bg-slate-100 animate-pulse" /> : k.value}</div>
                  <div className="text-[11px] text-slate-500">{k.sub}</div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
                    <span className={cn("inline-flex items-center gap-0.5", k.up ? "text-emerald-600" : "text-rose-600")}>
                      {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{k.hint}
                    </span>
                    <div className="h-5 w-16"><Sparkline data={spark(20, i + 3)} color={k.color} /></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4">
          <div className="col-span-12 space-y-4 xl:col-span-9">

            {/* Attack Surface Map */}
            <Card title="Production Attack Surface Map" action={
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">View:</span>
                <Select defaultValue="Layered View">
                  <SelectTrigger className="h-7 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Layered View","Service View","Risk View"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
                </Select>
                <Button size="sm" variant={tracing ? "default" : "outline"} className={cn("h-7 gap-1 text-xs", tracing ? "bg-blue-600 hover:bg-blue-600/90" : "border-blue-200 text-blue-700")}
                  onClick={() => { setTracing(!tracing); toast(tracing ? "Attack path tracing stopped" : "Tracing: Public API → SG sg-prod-claims-042 → Claims API → SQL Server Shard 2 → Backup Validation"); }}>
                  <Sparkles className="h-3 w-3" /> Attack Path Tracing
                </Button>
              </div>
            }>
              <div className="overflow-x-auto">
                <div className="flex min-w-[1100px] items-stretch gap-2">
                  {LAYERS.map((L, idx) => {
                    const Icon = L.icon;
                    const isOnPath = tracing && tracePath.includes(L.id);
                    const isHover = hoverLayer && tracePath.indexOf(L.id) >= tracePath.indexOf(hoverLayer);
                    return (
                      <div key={L.id} className="flex items-stretch gap-2">
                        <button
                          onMouseEnter={() => setHoverLayer(L.id)} onMouseLeave={() => setHoverLayer(null)}
                          onClick={() => open({ kind: "layer", title: L.name, subtitle: `Risk: ${L.risk}`, data: L })}
                          className={cn(
                            "w-[170px] rounded-xl border bg-white p-3 text-left shadow-sm transition",
                            "hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300",
                            isOnPath && "ring-2 ring-blue-400 border-blue-300",
                            isHover && !isOnPath && "border-blue-200 bg-blue-50/30"
                          )}
                        >
                          <div className="flex items-center justify-center gap-1.5 border-b border-slate-100 pb-2">
                            <Icon className={cn("h-4 w-4", L.brand)} />
                            <div className="text-[12px] font-semibold text-slate-900">{L.name}</div>
                          </div>
                          <div className="mt-2 space-y-1">
                            {L.rows.map(([k, v]) => (
                              <div key={k} className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-600 truncate">{k}</span>
                                {v && <span className="font-semibold tabular-nums text-slate-800">{v}</span>}
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 text-[11px] text-amber-700 font-medium">Risk: <span className="capitalize">{L.risk}</span></div>
                        </button>
                        {idx < LAYERS.length - 1 && (
                          <div className="flex items-center">
                            <svg width="32" height="20" className="text-slate-300">
                              <line x1="0" y1="10" x2="28" y2="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" className={cn(isOnPath && "text-blue-500")} />
                              <polygon points="28,5 32,10 28,15" className={cn("fill-current", isOnPath && "text-blue-500")} />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Low Risk</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Medium Risk</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" />High Risk</span>
                <span className="inline-flex items-center gap-1.5"><svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="#94a3b8" strokeDasharray="2 2" /></svg>Data / Traffic Flow</span>
              </div>
              <div className="mt-1 text-center text-[11px] text-slate-500">Click any layer or node to explore details, dependencies, risks, and controls.</div>
            </Card>

            {/* Operational grid - row 1 */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {/* Patch & CVE */}
              <Card title="Patch & CVE Cockpit" action={<ViewAll />} onClick={() => open({ kind: "card", title: "Patch & CVE Cockpit" })}>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <Donut value={89} color="stroke-emerald-500" center={{ v: "89%", sub: "Within SLA" }} />
                  <ul className="text-[11px] space-y-1 flex-1">
                    {[["Critical","18","bg-rose-500"],["High","47","bg-orange-500"],["Medium","86","bg-amber-500"],["Low","162","bg-emerald-500"]].map(([n,v,c]) => (
                      <li key={n} className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5"><span className={cn("h-2 w-2 rounded-full", c)} />{n}</span>
                        <span className="font-semibold tabular-nums">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <table className="mt-3 w-full text-[11px]">
                  <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <tr><th className="text-left py-1.5">Asset</th><th className="text-left">Severity</th><th className="text-left">Days</th><th className="text-left">Owner</th><th className="text-left">Status</th></tr>
                  </thead>
                  <tbody>
                    {PATCH_ROWS.map(r => (
                      <tr key={r.asset} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); open({ kind: "patch-row", title: r.asset, data: r }); }}>
                        <td className="py-1.5 font-medium text-slate-800">{r.asset}</td>
                        <td><Badge variant="outline" className={cn("h-4 text-[9px] capitalize", riskChip[r.sev])}>{r.sev}</Badge></td>
                        <td className="tabular-nums">{r.days}d</td>
                        <td className="text-slate-700">{r.owner}</td>
                        <td className="text-slate-700">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={(e) => { e.stopPropagation(); open({ kind: "drilldown", title: "Patch Dashboard" }); }} className="mt-3 text-[11px] font-medium text-blue-600 hover:underline">View full patch dashboard →</button>
              </Card>

              {/* Golden Build */}
              <Card title="Golden Build Compliance" action={<ViewAll />} onClick={() => open({ kind: "card", title: "Golden Build Compliance" })}>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <Donut value={92} color="stroke-emerald-500" center={{ v: "92%", sub: "Aligned" }} />
                  <ul className="text-[11px] space-y-1 flex-1">
                    {GOLDEN_CHECKS.map(([n,v]) => (
                      <li key={n} className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-emerald-500" />{n}</span>
                        <span className="font-semibold tabular-nums">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={(e) => { e.stopPropagation(); open({ kind: "drilldown", title: "Compliance Details" }); }} className="mt-3 text-[11px] font-medium text-blue-600 hover:underline">View compliance details →</button>
              </Card>

              {/* Identity & Access Posture */}
              <Card title="Identity & Access Posture" action={<ViewAll />} onClick={() => open({ kind: "card", title: "Identity & Access Posture" })}>
                <div className="grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
                  {[["Domains","Multiple"],["MFA Coverage","92%"],["Privileged Accounts","214"]].map(([k,v]) => (
                    <div key={k} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                      <div className="text-[10px] text-slate-500">{k}</div>
                      <div className="text-sm font-semibold text-slate-900">{v}</div>
                    </div>
                  ))}
                </div>
                <ul className="mt-3 text-[11px] space-y-1.5" onClick={(e) => e.stopPropagation()}>
                  {IDENTITY_RISKS.map(([k, r]) => (
                    <li key={k} className="flex items-center justify-between border-b border-slate-100 pb-1 cursor-pointer hover:bg-slate-50" onClick={() => open({ kind: "identity-row", title: k, data: { risk: r }})}>
                      <span className="text-slate-700">{k}</span>
                      <Badge variant="outline" className={cn("h-4 text-[9px] capitalize", riskChip[r])}>{r === "medium" ? "Medium" : r === "high" ? "High" : "Watch"}</Badge>
                    </li>
                  ))}
                </ul>
                <button onClick={(e) => { e.stopPropagation(); open({ kind: "drilldown", title: "Identity Dashboard" }); }} className="mt-3 text-[11px] font-medium text-blue-600 hover:underline">View identity dashboard →</button>
              </Card>

              {/* Firewall Diff */}
              <Card title="Security Group / Firewall Diff" action={<ViewAll />} onClick={() => open({ kind: "card", title: "Firewall Diff" })}>
                <div className="flex items-center justify-between text-[11px] text-slate-600" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <div className="text-[10px] text-slate-500">Changes This Month</div>
                    <div className="text-base font-semibold text-slate-900">84</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">High Risk Changes</div>
                    <div className="text-base font-semibold text-rose-600">17</div>
                  </div>
                </div>
                <table className="mt-3 w-full text-[11px]">
                  <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <tr><th className="text-left py-1.5">Change</th><th className="text-left">Env</th><th className="text-left">Risk</th><th className="text-left">Blast Radius</th><th className="text-left">Status</th></tr>
                  </thead>
                  <tbody>
                    {FIREWALL_DIFFS.map(r => (
                      <tr key={r.change} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); open({ kind: "fw-row", title: r.change, data: r }); }}>
                        <td className="py-1.5 font-medium text-slate-800">{r.change}</td>
                        <td>{r.env}</td>
                        <td><Badge variant="outline" className={cn("h-4 text-[9px] capitalize", riskChip[r.risk])}>{r.risk}</Badge></td>
                        <td className="text-slate-700">{r.blast}</td>
                        <td className={cn(r.status === "Pending" ? "text-rose-600" : "text-emerald-600", "font-medium")}>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={(e) => { e.stopPropagation(); open({ kind: "drilldown", title: "Change Intelligence" }); }} className="mt-3 text-[11px] font-medium text-blue-600 hover:underline">View change intelligence →</button>
              </Card>
            </div>

            {/* Operational grid - row 2 */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* SIEM / EDR */}
              <Card title="SIEM / EDR Coverage" action={<ViewAll />} onClick={() => open({ kind: "card", title: "SIEM / EDR Coverage" })}>
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  {[["CrowdStrike","97%","emerald"],["Legacy Cylance","3%","rose"],["SIEM Coverage","89%","emerald"]].map(([k,v,c]) => (
                    <div key={k} className="flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center gap-1.5 text-slate-700"><span className={cn("h-2 w-2 rounded-full", `bg-${c}-500`)} />{k}</span>
                      <span className="font-semibold tabular-nums">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-slate-100 pt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                  {COVERAGE_SOURCES.map(([k, s]) => (
                    <div key={k} className="flex items-center gap-1.5 text-slate-700">
                      <span className={cn("h-2 w-2 rounded-full", s === "ok" ? "bg-emerald-500" : "bg-amber-500")} />{k}
                    </div>
                  ))}
                </div>
                <button onClick={(e) => { e.stopPropagation(); open({ kind: "drilldown", title: "Coverage Matrix" }); }} className="mt-3 text-[11px] font-medium text-blue-600 hover:underline">View coverage matrix →</button>
              </Card>

              {/* Cyber Recovery */}
              <Card title="Cyber Recovery Readiness" action={<ViewAll />} onClick={() => open({ kind: "card", title: "Cyber Recovery Readiness" })}>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <Donut value={91} color="stroke-emerald-500" center={{ v: "91%", sub: "Ready" }} />
                  <ul className="text-[11px] space-y-1 flex-1">
                    {RECOVERY_CHECKS.map(([n,v]) => (
                      <li key={n} className="flex items-center justify-between">
                        <span className="text-slate-700">{n}</span>
                        <span className="font-semibold tabular-nums">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={(e) => { e.stopPropagation(); open({ kind: "drilldown", title: "Recovery Readiness" }); }} className="mt-3 text-[11px] font-medium text-blue-600 hover:underline">View recovery readiness →</button>
              </Card>

              {/* Handoff */}
              <Card title="Security-to-SRE Handoff" action={<ViewAll />} onClick={() => open({ kind: "card", title: "Security-to-SRE Handoff" })}>
                <div className="overflow-x-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1 min-w-[420px]">
                    {HANDOFF_STAGES.map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <div key={s.label} className="flex items-center gap-1">
                          <button onClick={() => open({ kind: "handoff", title: s.label, data: s })} className="flex flex-col items-center gap-1 rounded-lg p-1.5 hover:bg-blue-50">
                            <div className="h-8 w-8 rounded-full border border-blue-200 bg-blue-50 grid place-items-center text-blue-600"><Icon className="h-4 w-4" /></div>
                            <div className="text-[9px] text-slate-600">{s.label}</div>
                          </button>
                          {i < HANDOFF_STAGES.length - 1 && <ChevronRight className="h-3 w-3 text-slate-400" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 grid grid-cols-7 gap-1 text-center">
                    {HANDOFF_STAGES.map(s => (
                      <div key={s.label}>
                        <div className="text-base font-semibold tabular-nums text-slate-900">{s.v}</div>
                        <div className="text-[9px] text-slate-500">{s.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); open({ kind: "drilldown", title: "Handoff Pipeline" }); }} className="mt-3 text-[11px] font-medium text-blue-600 hover:underline">View handoff pipeline →</button>
              </Card>
            </div>
          </div>

          {/* Executive Right Column */}
          <div className="col-span-12 space-y-4 xl:col-span-3">
            <Card title="Executive Insights" action={<ViewAll />}>
              <ul className="space-y-2.5">
                {EXEC_INSIGHTS.map(e => {
                  const Icon = e.icon;
                  return (
                    <li key={e.title}>
                      <button onClick={() => open({ kind: "insight", title: e.title, subtitle: e.sub })} className="w-full text-left rounded-lg p-2 -mx-2 hover:bg-slate-50">
                        <div className="flex items-start gap-2">
                          <Icon className={cn("h-4 w-4 mt-0.5", e.color)} />
                          <div className="flex-1">
                            <div className="text-[12px] font-semibold text-slate-900">{e.title}</div>
                            <div className="text-[11px] text-slate-600">{e.sub}</div>
                            <div className="text-[11px] text-blue-600 hover:underline mt-0.5">See details →</div>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card title="AI Assisted Cyber Operations" action={<ViewAll />}>
              <ul className="space-y-2">
                {AI_OPS.map(a => {
                  const Icon = a.icon;
                  return (
                    <li key={a.title} className="flex items-start gap-2 rounded-lg p-1.5 -mx-1 hover:bg-slate-50">
                      <div className="rounded-md bg-blue-50 p-1.5 text-blue-600"><Icon className="h-3.5 w-3.5" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-slate-900">{a.title}</div>
                        <div className="text-[11px] text-slate-600 truncate">{a.sub}</div>
                      </div>
                      <Button size="sm" variant="outline" className="h-6 text-[10px] border-blue-200 text-blue-700" onClick={() => open({ kind: "ai-review", title: a.title, subtitle: a.sub })}>Review</Button>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card title="Privacy & Least Privilege">
              <div className="text-[11px] text-slate-600">All AI-assisted and human operations must be:</div>
              <ul className="mt-2 space-y-1 text-[11px]">
                {["Least Privilege","Auditable","Policy Governed","Restricted Access","Approved"].map(c => (
                  <li key={c} className="flex items-center gap-1.5 text-slate-700">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />{c}
                  </li>
                ))}
              </ul>
              <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 p-2 text-[10px] text-amber-800">
                No privileged runtime access may bypass production privacy controls.
              </div>
              <button onClick={() => open({ kind: "drilldown", title: "Access Governance" })} className="mt-2 text-[11px] font-medium text-blue-600 hover:underline">View access governance →</button>
            </Card>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="border-t border-slate-200 bg-white px-6 py-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
            {[
              ["env","Environment", ["Production","Non Production","All"]],
              ["product","Product Line",["All","HHA Enterprise","Sandata Fuse","SAM","Provider Pro","Pavilio","Self Direction","Generations"]],
              ["cloud","Cloud Platform",["All","AWS","GCP","Azure / Entra","Ashburn","Citrix","Liquid Web"]],
              ["risk","Risk",["All","Low","Medium","High","Critical"]],
              ["control","Control Type",["All","Identity","Patch","Firewall","Recovery","EDR","SIEM","Golden Build"]],
              ["mod","Modernization Status",["All","Current","In Progress","Planned","Exception"]],
              ["time","Time Range",["24 hours","7 days","Last 30 days","90 days","12 months"]],
            ].map(([k, label, opts]: any) => (
              <div key={k}>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
                <Select value={(filters as any)[k]} onValueChange={(v) => changeFilter(k as any, v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{opts.map((o: string) => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
            <div className="flex items-end">
              <Button size="sm" variant="outline" className="h-8 w-full gap-1.5" onClick={() => { setFilters({ env: "Production", product: "All", cloud: "All", risk: "All", control: "All", mod: "All", time: "Last 30 days" }); toast("Filters cleared"); }}>
                <Filter className="h-3.5 w-3.5" /> Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-[10px]">At Risk</Badge>
              <Badge variant="outline" className="text-[10px]">Platform Engineering</Badge>
            </div>
            <SheetTitle className="text-lg">{drawer?.title}</SheetTitle>
            {drawer?.subtitle && <div className="text-xs text-slate-500">{drawer.subtitle}</div>}
          </SheetHeader>

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid grid-cols-6 h-8">
              {["overview","exposure","deps","risk","controls","actions"].map(t => (
                <TabsTrigger key={t} value={t} className="text-[10px] capitalize">{t}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="overview" className="mt-3 space-y-2 text-xs text-slate-700">
              <div>{drawer?.kind === "kpi" ? `${drawer.title} reflects production cyber posture across HHAX assets. Trend monitoring is active.` :
                drawer?.kind === "layer" ? `The ${drawer.title} layer maps directly to production workflows. Risk: ${drawer.data?.risk}.` :
                drawer?.kind === "ai-review" ? `AI-assisted recommendation requires human approval before any privileged runtime change.` :
                "Detail context for selected cyber resilience entity."}</div>
              {drawer?.kind === "layer" && (
                <ul className="rounded-lg border border-slate-200 p-2 space-y-1">
                  {(drawer.data?.rows as [string,string][]).map(([k,v]) => (
                    <li key={k} className="flex justify-between"><span className="text-slate-600">{k}</span><span className="font-semibold">{v || "—"}</span></li>
                  ))}
                </ul>
              )}
            </TabsContent>
            <TabsContent value="exposure" className="mt-3 text-xs text-slate-700">
              <div className="rounded-lg border border-slate-200 p-3 space-y-1">
                <div className="flex justify-between"><span>Public Endpoints</span><span className="font-semibold">84</span></div>
                <div className="flex justify-between"><span>External APIs</span><span className="font-semibold">32</span></div>
                <div className="flex justify-between"><span>Privileged Accounts</span><span className="font-semibold">214</span></div>
              </div>
            </TabsContent>
            <TabsContent value="deps" className="mt-3 text-xs text-slate-700">
              <div className="rounded-lg border border-slate-200 p-3">Connected workflows: Caregiver EVV, Claims, Payroll, Provider Portal.</div>
            </TabsContent>
            <TabsContent value="risk" className="mt-3 text-xs text-slate-700">
              <div className="rounded-lg border border-slate-200 p-3">Highest exposure: Windows IIS Cluster, SQL Server Shard 2. Identity recovery not fully validated.</div>
            </TabsContent>
            <TabsContent value="controls" className="mt-3 text-xs text-slate-700">
              <div className="rounded-lg border border-slate-200 p-3">Patch SLA · Maintenance Window · Change Approval · Validation Evidence · Privacy Gate.</div>
            </TabsContent>
            <TabsContent value="actions" className="mt-3 space-y-2">
              {["Create action plan","Assign owner","Request approval","Generate executive summary","Open related incidents","Export evidence"].map(a => (
                <Button key={a} variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => toast.success(`${a} — request queued`)}>
                  {a}
                </Button>
              ))}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
