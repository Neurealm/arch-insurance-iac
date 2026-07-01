import { useMemo, useState } from "react";
import {
  Target, Layers, Table as TableIcon, Clock, ShieldCheck, Link2,
  MapPin, Network, BarChart3, GitBranch, CheckCircle2, Info,
  ChevronDown, RefreshCw, X, Cpu, Activity, Boxes, Workflow,
  Server, Users, Route as RouteIcon, AlertTriangle, Calendar,
  Wifi, AppWindow,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------- Design tokens ---------- */
const tone = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",    ring: "ring-blue-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-600",  ring: "ring-violet-200" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",   ring: "ring-amber-200" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-600",    ring: "ring-rose-200" },
  slate:   { bg: "bg-slate-50",   text: "text-slate-600",   ring: "ring-slate-200" },
} as const;
type Tone = keyof typeof tone;

/* ---------- Data ---------- */
const USE_CASES = [
  "Site Resilience — Detect & Isolate Network Issue",
  "Fraud Signal Enrichment",
  "SLO Burn Detection",
  "Change → Incident Correlation",
];

const KPIS: { icon: any; label: string; value: string; sub: string; delta: string; tone: Tone; spark: number[] }[] = [
  { icon: Target,     label: "Use Cases in Scope",      value: "4",     sub: "SREOps · CloudOps · FinOps · NetOps", delta: "+1 QoQ", tone: "blue",    spark: [3,3,3,4,4,4,4] },
  { icon: Layers,     label: "Required Entities",       value: "24",    sub: "Core: 14 · Supporting: 10",           delta: "+2",     tone: "violet",  spark: [18,19,20,21,22,23,24] },
  { icon: TableIcon,  label: "Required Data Fields",    value: "156",   sub: "Mandatory: 87 · Optional: 69",        delta: "+11",    tone: "blue",    spark: [130,138,142,148,150,154,156] },
  { icon: Clock,      label: "Freshness Target",        value: "6 hrs", sub: "Min 15m · Max 24h",                   delta: "tight",  tone: "amber",   spark: [8,7,7,6,6,6,6] },
  { icon: ShieldCheck,label: "Confidence Target",       value: "≥90%",  sub: "Current avg 87%",                     delta: "-3 gap", tone: "emerald", spark: [82,83,85,86,86,87,87] },
  { icon: Link2,      label: "Critical Relationships",  value: "32",    sub: "Direct: 18 · Indirect: 14",           delta: "+4",     tone: "rose",    spark: [24,26,28,29,30,31,32] },
];

const ENTITIES = [
  { id: "device",   label: "Device",      icon: Server,    color: "emerald", pos: { x: 0,   y: 0 } },
  { id: "interface",label: "Interface",   icon: Network,   color: "emerald", pos: { x: 1,   y: 0 } },
  { id: "tunnel",   label: "Tunnel",      icon: Wifi,      color: "amber",   pos: { x: 2,   y: 0 } },
  { id: "user",     label: "User",        icon: Users,     color: "violet",  pos: { x: 0,   y: 1 } },
  { id: "site",     label: "Site",        icon: MapPin,    color: "blue",    pos: { x: 1,   y: 1 } },
  { id: "app",      label: "Application", icon: AppWindow, color: "emerald", pos: { x: 2,   y: 1 } },
  { id: "route",    label: "Route",       icon: RouteIcon, color: "amber",   pos: { x: 0,   y: 2 } },
  { id: "alert",    label: "Alert / Event", icon: AlertTriangle, color: "rose", pos: { x: 1, y: 2 } },
  { id: "change",   label: "Change",      icon: Calendar,  color: "slate",   pos: { x: 2,   y: 2 } },
] as const;

const CONTRACT_SUMMARY = [
  { cat: "Site",        m: 8,  o: 4, fresh: "≤ 1 hr",  conf: "≥ 95%", freq: "5m",  cov: "98%" },
  { cat: "Device",      m: 11, o: 7, fresh: "≤ 1 hr",  conf: "≥ 95%", freq: "1m",  cov: "96%" },
  { cat: "Interface",   m: 10, o: 6, fresh: "≤ 15 min",conf: "≥ 95%", freq: "30s", cov: "94%" },
  { cat: "Tunnel",      m: 9,  o: 5, fresh: "≤ 15 min",conf: "≥ 95%", freq: "30s", cov: "92%" },
  { cat: "Route",       m: 7,  o: 4, fresh: "≤ 15 min",conf: "≥ 90%", freq: "1m",  cov: "89%" },
  { cat: "User",        m: 8,  o: 5, fresh: "≤ 1 hr",  conf: "≥ 90%", freq: "15m", cov: "91%" },
  { cat: "Application", m: 9,  o: 6, fresh: "≤ 1 hr",  conf: "≥ 90%", freq: "5m",  cov: "88%" },
  { cat: "Alert/Event", m: 13, o: 8, fresh: "≤ 15 min",conf: "≥ 90%", freq: "10s", cov: "97%" },
  { cat: "Change",      m: 6,  o: 4, fresh: "≤ 6 hrs", conf: "≥ 90%", freq: "1h",  cov: "85%" },
];

const JOINS = [
  { a: "Site",       rel: "contains",  b: "Device",      type: "Primary",   card: "1 → N" },
  { a: "Device",     rel: "has",       b: "Interface",   type: "Primary",   card: "1 → N" },
  { a: "Device",     rel: "terminates",b: "Tunnel",      type: "Primary",   card: "1 → N" },
  { a: "Interface",  rel: "carries",   b: "Route",       type: "Secondary", card: "1 → N" },
  { a: "User",       rel: "accesses",  b: "Application", type: "Secondary", card: "N → N" },
  { a: "Alert/Event",rel: "impacts",   b: "Site",        type: "Secondary", card: "N → 1" },
  { a: "Change",     rel: "affects",   b: "Device",      type: "Secondary", card: "1 → N" },
];

const FIELDS = [
  { e: "Site",       f: "site_id",         d: "Unique site identifier",    r: true, s: "CMDB",       fr: "≤ 1 hr",   cf: "≥ 95%" },
  { e: "Device",     f: "hostname",        d: "Device hostname",           r: true, s: "NetBox",     fr: "≤ 1 hr",   cf: "≥ 95%" },
  { e: "Interface",  f: "interface_name",  d: "Interface name",            r: true, s: "SNMP",       fr: "≤ 15 min", cf: "≥ 95%" },
  { e: "Interface",  f: "status",          d: "Operational status",        r: true, s: "SNMP",       fr: "≤ 15 min", cf: "≥ 95%" },
  { e: "Tunnel",     f: "tunnel_status",   d: "Tunnel up/down status",     r: true, s: "IPSec",      fr: "≤ 15 min", cf: "≥ 90%" },
  { e: "Route",      f: "next_hop",        d: "Route next hop",            r: true, s: "BGP feed",   fr: "≤ 15 min", cf: "≥ 90%" },
  { e: "User",       f: "user_id",         d: "Unique user identifier",    r: true, s: "IAM",        fr: "≤ 1 hr",   cf: "≥ 90%" },
  { e: "Application",f: "app_id",          d: "Application identifier",    r: true, s: "AppReg",     fr: "≤ 1 hr",   cf: "≥ 90%" },
  { e: "Alert/Event",f: "event_time",      d: "Event timestamp",           r: true, s: "OTel",       fr: "≤ 15 min", cf: "≥ 90%" },
  { e: "Alert/Event",f: "severity",        d: "Event severity level",      r: true, s: "OTel",       fr: "≤ 15 min", cf: "≥ 90%" },
];

const COMPLIANCE = [
  { label: "Fully Compliant (≥ 90%)",     value: 68, pct: 55.7, color: "#10b981" },
  { label: "Partially Compliant (70–89%)",value: 39, pct: 32.0, color: "#f59e0b" },
  { label: "Low Compliance (< 70%)",      value: 10, pct: 8.2,  color: "#ef4444" },
  { label: "Not Mapped",                  value: 5,  pct: 4.1,  color: "#94a3b8" },
];

const CONTRACT_FLOW = [
  "Operational Question","Entity Identification","Field Discovery","Relationship Discovery",
  "Freshness Rules","Confidence Rules","Validation Rules","Engineering Contract",
  "Data Orchestration","Agent Consumption",
];

const ENGINE_STAGES = [
  { icon: Target,      label: "Business Requirements" },
  { icon: ShieldCheck, label: "Policy Engine" },
  { icon: Boxes,       label: "Schema Rules" },
  { icon: Layers,      label: "Entity Resolver" },
  { icon: GitBranch,   label: "Relationship Generator" },
  { icon: CheckCircle2,label: "Validation Rules" },
  { icon: Activity,    label: "Confidence Model" },
  { icon: Cpu,         label: "Contract Compiler" },
  { icon: Workflow,    label: "Versioned Contract" },
];

const VERSIONS = [
  { v: "v1", date: "Feb 04", note: "Initial contract — 6 entities, 82 fields" },
  { v: "v2", date: "Mar 18", note: "Added Route & Tunnel entities; 32 fields" },
  { v: "v3", date: "Apr 22", note: "Confidence raised 85% → 90%; freshness tightened" },
  { v: "v4", date: "May 12", note: "Added Change entity; approvals: A. Morgan · S. Rhee" },
];

/* ---------- Small primitives ---------- */
function Sparkline({ data, color = "#3b82f6" }: { data: number[]; color?: string }) {
  const w = 96, h = 28, max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / range) * h} r={2.5} fill={color} />
    </svg>
  );
}

function AnimatedCounter({ value }: { value: string }) {
  return <span className="tabular-nums">{value}</span>;
}

/* ---------- Page ---------- */
export default function UseCaseToDataContractMapper() {
  const [useCase, setUseCase] = useState(USE_CASES[0]);
  const [drawer, setDrawer] = useState<null | { title: string; kind: string; subtitle?: string }>(null);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  const openDrawer = (title: string, kind: string, subtitle?: string) => setDrawer({ title, kind, subtitle });

  const complianceCircum = 2 * Math.PI * 60;
  const complianceOffsets = useMemo(() => {
    let acc = 0;
    return COMPLIANCE.map((c) => {
      const len = (c.pct / 100) * complianceCircum;
      const seg = { color: c.color, len, offset: complianceCircum - acc };
      acc += len;
      return seg;
    });
  }, [complianceCircum]);

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      {/* ============ HEADER ============ */}
      <header className="mb-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 leading-tight">Use Case to Data Contract Mapper</h1>
            <p className="text-[13px] text-slate-600 mt-1">Translate Operational Outcomes into Engineering Data Contracts</p>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-2xl">
              Every operational question defines a contract describing the minimum trusted data required to answer it.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Use Case Selector</div>
              <div className="relative">
                <select
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-9 text-[12px] font-medium text-slate-800 shadow-sm min-w-[340px] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  {USE_CASES.map((u) => <option key={u}>{u}</option>)}
                </select>
                <ChevronDown className="h-4 w-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Last Updated</div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700">
                May 12, 2026 · 10:32 AM
                <button className="p-1 hover:bg-slate-100 rounded"><RefreshCw className="h-3 w-3 text-slate-500" /></button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============ KPI ROW ============ */}
      <div className="grid grid-cols-6 gap-3 mb-5">
        {KPIS.map((k) => {
          const t = tone[k.tone];
          const Icon = k.icon;
          return (
            <button
              key={k.label}
              onClick={() => openDrawer(k.label, "kpi", k.sub)}
              className="text-left group bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`h-9 w-9 rounded-lg ${t.bg} ${t.text} grid place-items-center ring-1 ${t.ring}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-medium text-slate-500">{k.delta}</span>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 font-medium">{k.label}</div>
              <div className="mt-1 text-[24px] font-bold text-slate-900 leading-none"><AnimatedCounter value={k.value} /></div>
              <div className="mt-2 flex items-end justify-between">
                <div className="text-[10px] text-slate-500 leading-tight">{k.sub}</div>
                <Sparkline data={k.spark} color={
                  k.tone === "emerald" ? "#10b981" :
                  k.tone === "violet" ? "#8b5cf6" :
                  k.tone === "amber" ? "#f59e0b" :
                  k.tone === "rose" ? "#f43f5e" : "#3b82f6"
                } />
              </div>
            </button>
          );
        })}
      </div>

      {/* ============ ROW 1: 3 panels ============ */}
      <div className="grid grid-cols-12 gap-3 mb-3">
        {/* Panel 1: Use Case Overview */}
        <section className="col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <h2 className="text-[13px] font-semibold text-slate-800">1. Use Case Overview</h2>
          </div>
          <div className="p-4 border-l-4 border-blue-500 ml-3 my-2 space-y-3 text-[12px]">
            <Row label="Use Case" value={useCase} />
            <Row label="Description" value="Detect degradation or outage at a site, determine impact, identify root cause and recommend isolation/remediation." wrap />
            <div>
              <div className="text-slate-500 mb-1.5">Primary Questions</div>
              {[
                "Is the site experiencing network degradation or outage?",
                "What is the impacted scope (users, apps, segments)?",
                "What is the root cause and where is the fault?",
                "What isolation or remediation action is recommended?",
              ].map((q) => (
                <div key={q} className="flex items-start gap-2 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-slate-700">{q}</span>
                </div>
              ))}
            </div>
            <Row label="Business Impact" value="High — Impacts user productivity and critical services" wrap />
            <Row label="RTO / RPO"       value="RTO: 1 hr  |  RPO: 15 min" />
            <Row label="SLO / SLA"       value="Detection < 15 min  |  Accuracy ≥ 90%  |  Actionable < 60 min" wrap />
            <Row label="Data Confidence Target" value="≥ 90% for all mandatory fields" wrap />
            <button
              onClick={() => openDrawer("Use Case Engineering", "usecase")}
              className="mt-2 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
            >
              Explain contract derivation →
            </button>
          </div>
        </section>

        {/* Panel 2: Required Entities */}
        <section className="col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Network className="h-4 w-4 text-violet-600" />
            <h2 className="text-[13px] font-semibold text-slate-800">2. Required Entities (Core)</h2>
          </div>
          <div className="p-4">
            <div className="relative h-[340px]">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 340" preserveAspectRatio="none">
                {ENTITIES.filter(e => e.id !== "site").map((e) => {
                  const cx = 50 + e.pos.x * 100;
                  const cy = 40 + e.pos.y * 120;
                  const isPrimary = ["device","interface","tunnel","app","user","alert"].includes(e.id);
                  return (
                    <line key={e.id}
                      x1={150} y1={170} x2={cx} y2={cy}
                      stroke={isPrimary ? "#94a3b8" : "#cbd5e1"}
                      strokeWidth={1}
                      strokeDasharray={isPrimary ? "0" : "3 3"}
                    >
                      <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
                    </line>
                  );
                })}
              </svg>
              {ENTITIES.map((e) => {
                const isSite = e.id === "site";
                const Icon = e.icon;
                const left = `${(50 + e.pos.x * 100) / 300 * 100}%`;
                const top = `${(40 + e.pos.y * 120) / 340 * 100}%`;
                const c = tone[e.color as Tone];
                return (
                  <button
                    key={e.id}
                    onMouseEnter={() => setHoveredEntity(e.id)}
                    onMouseLeave={() => setHoveredEntity(null)}
                    onClick={() => openDrawer(e.label + " Entity", "entity", "Purpose · Owner · Fields · Freshness")}
                    style={{ left, top }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border shadow-sm px-2.5 py-1.5 flex items-center gap-1.5 transition-all hover:scale-110 hover:shadow-md
                      ${isSite ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200" : "bg-white border-slate-200"}
                      ${hoveredEntity === e.id ? "ring-2 ring-offset-1 " + c.ring : ""}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${c.text}`} />
                    <span className="text-[11px] font-medium text-slate-800">{e.label}</span>
                    {isSite && <span className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-blue-500 animate-ping" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-4 h-px bg-slate-400" /> Primary</span>
              <span className="flex items-center gap-1"><span className="w-4 h-px border-t border-dashed border-slate-400" /> Secondary</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 text-center">Core Entities: 14  ·  Supporting Entities: 10</div>
          </div>
        </section>

        {/* Panel 3: Contract Summary Table */}
        <section className="col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
            <h2 className="text-[13px] font-semibold text-slate-800">3. Required Data Contract Summary</h2>
          </div>
          <div className="p-2 overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="text-left px-2 py-2 font-medium">Category</th>
                  <th className="text-right px-1 py-2 font-medium">Mand.</th>
                  <th className="text-right px-1 py-2 font-medium">Opt.</th>
                  <th className="text-right px-1 py-2 font-medium">Freshness</th>
                  <th className="text-right px-2 py-2 font-medium">Conf.</th>
                </tr>
              </thead>
              <tbody>
                {CONTRACT_SUMMARY.map((r) => (
                  <tr key={r.cat}
                      onClick={() => openDrawer(r.cat + " Contract", "contract-row", `${r.m} mandatory · ${r.o} optional`)}
                      className="border-b border-slate-50 hover:bg-blue-50/40 cursor-pointer transition">
                    <td className="px-2 py-1.5 font-medium text-slate-800">{r.cat}</td>
                    <td className="text-right px-1 py-1.5 tabular-nums text-slate-700">{r.m}</td>
                    <td className="text-right px-1 py-1.5 tabular-nums text-slate-600">{r.o}</td>
                    <td className="text-right px-1 py-1.5 text-slate-600">{r.fresh}</td>
                    <td className="text-right px-2 py-1.5 text-emerald-600 font-medium">{r.conf}</td>
                  </tr>
                ))}
                <tr className="bg-blue-50/60 font-semibold">
                  <td className="px-2 py-2 text-blue-700">Total</td>
                  <td className="text-right px-1 py-2 text-blue-700">81</td>
                  <td className="text-right px-1 py-2 text-blue-700">49</td>
                  <td className="text-right px-1 py-2 text-slate-500">—</td>
                  <td className="text-right px-2 py-2 text-blue-700">≥ 90%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ============ ROW 2: Joins / Fields / Compliance ============ */}
      <div className="grid grid-cols-12 gap-3 mb-3">
        {/* Joins */}
        <section className="col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-violet-600" />
            <h2 className="text-[13px] font-semibold text-slate-800">4. Key Relationships & Joins</h2>
          </div>
          <div className="p-2">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="text-left px-2 py-2 font-medium">From</th>
                  <th className="text-left px-1 py-2 font-medium">Rel</th>
                  <th className="text-left px-1 py-2 font-medium">To</th>
                  <th className="text-left px-1 py-2 font-medium">Type</th>
                  <th className="text-right px-2 py-2 font-medium">Card.</th>
                </tr>
              </thead>
              <tbody>
                {JOINS.map((j, i) => (
                  <tr key={i}
                      onClick={() => openDrawer(`${j.a} → ${j.b}`, "join", `${j.rel} · ${j.type} · ${j.card}`)}
                      className="border-b border-slate-50 hover:bg-violet-50/40 cursor-pointer transition">
                    <td className="px-2 py-1.5 text-slate-800">{j.a}</td>
                    <td className="px-1 py-1.5 text-slate-500 italic">{j.rel}</td>
                    <td className="px-1 py-1.5 text-slate-800">{j.b}</td>
                    <td className={`px-1 py-1.5 font-medium ${j.type === "Primary" ? "text-emerald-600" : "text-slate-500"}`}>{j.type}</td>
                    <td className="text-right px-2 py-1.5 tabular-nums text-slate-600">{j.card}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="mt-2 mx-2 text-[11px] text-blue-600 hover:text-blue-800 font-medium">View full relationship map →</button>
          </div>
        </section>

        {/* Critical Fields */}
        <section className="col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <TableIcon className="h-4 w-4 text-blue-600" />
            <h2 className="text-[13px] font-semibold text-slate-800">5. Critical Data Fields (Sample)</h2>
          </div>
          <div className="p-2">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="text-left px-2 py-2 font-medium">Entity</th>
                  <th className="text-left px-1 py-2 font-medium">Field</th>
                  <th className="text-left px-1 py-2 font-medium">Description</th>
                  <th className="text-center px-1 py-2 font-medium">Req</th>
                  <th className="text-right px-1 py-2 font-medium">Freshness</th>
                  <th className="text-right px-2 py-2 font-medium">Conf.</th>
                </tr>
              </thead>
              <tbody>
                {FIELDS.map((f, i) => (
                  <tr key={i}
                      onClick={() => openDrawer(`${f.e}.${f.f}`, "field", f.d)}
                      className="border-b border-slate-50 hover:bg-blue-50/40 cursor-pointer transition">
                    <td className="px-2 py-1.5 text-slate-800">{f.e}</td>
                    <td className="px-1 py-1.5 font-mono text-[10.5px] text-violet-700">{f.f}</td>
                    <td className="px-1 py-1.5 text-slate-600">{f.d}</td>
                    <td className="text-center px-1 py-1.5">{f.r && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 inline" />}</td>
                    <td className="text-right px-1 py-1.5 text-slate-600">{f.fr}</td>
                    <td className="text-right px-2 py-1.5 text-emerald-600 font-medium">{f.cf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="mt-2 mx-2 text-[11px] text-blue-600 hover:text-blue-800 font-medium">View all 156 fields →</button>
          </div>
        </section>

        {/* Compliance Donut */}
        <section className="col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h2 className="text-[13px] font-semibold text-slate-800">6. Contract Compliance</h2>
          </div>
          <div className="p-4">
            <div
              className="relative w-[160px] h-[160px] mx-auto cursor-pointer"
              onClick={() => openDrawer("Data Contract Compliance", "compliance", "Gap analysis across sources")}
            >
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="60" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                {complianceOffsets.map((s, i) => (
                  <circle key={i} cx="80" cy="80" r="60" fill="none" stroke={s.color} strokeWidth="18"
                    strokeDasharray={`${s.len} ${complianceCircum}`} strokeDashoffset={-(complianceCircum - s.offset)}
                    className="transition-all duration-700" />
                ))}
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-[26px] font-bold text-slate-900">87%</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">Overall</div>
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {COMPLIANCE.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-[10.5px]">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-slate-600 flex-1 truncate">{c.label}</span>
                  <span className="tabular-nums text-slate-700 font-medium">{c.value}</span>
                  <span className="tabular-nums text-slate-400">({c.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ============ ENGINEERING TRANSPARENCY ZONE ============ */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-800 shadow-lg text-slate-100 p-5 mb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-blue-300 font-semibold">Engineering Transparency</div>
            <h2 className="text-[18px] font-bold">How We Engineer the Data Contract</h2>
          </div>
          <div className="text-[10px] text-slate-400">Operational Question → Engineering Contract → Data Orchestration → Trusted Answer</div>
        </div>

        {/* Contract Generation Flow */}
        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700 mb-3">
          <div className="text-[11px] font-semibold text-slate-300 mb-3">Contract Generation Flow</div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {CONTRACT_FLOW.map((step, i) => (
              <div key={step} className="flex items-center shrink-0">
                <button
                  onClick={() => openDrawer(step, "flow-step", `Stage ${i + 1} of ${CONTRACT_FLOW.length}`)}
                  className="px-2.5 py-2 rounded-md bg-slate-800 border border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition text-[10.5px] font-medium text-slate-200 whitespace-nowrap"
                >
                  <div className="text-[9px] text-blue-400 mb-0.5">{String(i + 1).padStart(2, "0")}</div>
                  {step}
                </button>
                {i < CONTRACT_FLOW.length - 1 && (
                  <div className="relative w-4 h-px bg-slate-600 mx-0.5">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Data Contract Engine */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
            <div className="text-[11px] font-semibold text-slate-300 mb-3">Data Contract Engine</div>
            <div className="space-y-1.5">
              {ENGINE_STAGES.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => openDrawer(s.label, "engine-stage")}
                    className="w-full flex items-center gap-3 p-2 rounded-md bg-slate-800/70 border border-slate-700 hover:border-blue-500 transition group"
                  >
                    <div className="h-6 w-6 rounded bg-blue-500/20 grid place-items-center">
                      <Icon className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <span className="text-[11px] text-slate-200 flex-1 text-left">{s.label}</span>
                    <span className="text-[9px] text-slate-500">stage {i + 1}</span>
                    <div className="w-8 h-1 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-full bg-blue-400 animate-pulse" style={{ width: `${60 + i * 4}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right column: Versioning + widgets */}
          <div className="space-y-3">
            <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
              <div className="text-[11px] font-semibold text-slate-300 mb-3">Contract Versioning Timeline</div>
              <div className="relative pl-2">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-700" />
                {VERSIONS.map((v, i) => (
                  <button
                    key={v.v}
                    onClick={() => openDrawer(`Contract ${v.v}`, "version", v.note)}
                    className="relative flex items-start gap-3 pb-3 w-full text-left group"
                  >
                    <div className={`h-3 w-3 rounded-full ring-2 ring-slate-900 z-10 mt-0.5 ${i === VERSIONS.length - 1 ? "bg-emerald-400 animate-pulse" : "bg-blue-400"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-100">{v.v}</span>
                        <span className="text-[10px] text-slate-500">{v.date}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-400 group-hover:text-slate-200 transition">{v.note}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Coverage",       value: "94%", tone: "text-emerald-400" },
                { label: "Freshness OK",   value: "97%", tone: "text-emerald-400" },
                { label: "Confidence",     value: "87%", tone: "text-amber-400" },
                { label: "Open Tasks",     value: "28",  tone: "text-blue-400" },
                { label: "Recent Changes", value: "6",   tone: "text-violet-400" },
                { label: "Dep. Risk",      value: "Low", tone: "text-emerald-400" },
              ].map((w) => (
                <button
                  key={w.label}
                  onClick={() => openDrawer(w.label, "widget")}
                  className="bg-slate-800/70 border border-slate-700 hover:border-blue-500 rounded-md p-2.5 text-left transition"
                >
                  <div className={`text-[16px] font-bold ${w.tone} tabular-nums`}>{w.value}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">{w.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Info className="h-3 w-3" /> This contract defines the minimum trusted data required to answer the selected use case.</span>
        </div>
        <div className="flex items-center gap-6">
          <div>Environment: <span className="text-slate-700 font-medium">Production</span></div>
          <div>Alex Morgan · <span className="text-slate-700 font-medium">Lead Platform Architect</span></div>
        </div>
      </div>

      {/* ============ ENGINEERING DRAWER ============ */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-[30vw] min-w-[420px] sm:max-w-none overflow-y-auto">
          {drawer && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">Engineering Drawer</div>
                    <SheetTitle className="text-[18px]">{drawer.title}</SheetTitle>
                    {drawer.subtitle && <div className="text-[12px] text-slate-500 mt-1">{drawer.subtitle}</div>}
                  </div>
                  <button onClick={() => setDrawer(null)} className="p-1 rounded hover:bg-slate-100"><X className="h-4 w-4 text-slate-500" /></button>
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="engineering">Engineering</TabsTrigger>
                  <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
                  <TabsTrigger value="deps">Dependencies</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-3 text-[12px]">
                  <DrawerBlock label="Purpose" text={`Defines the trusted data required to answer: “${drawer.title}”. This is the operational anchor for every downstream engineering decision.`} />
                  <DrawerBlock label="Business Rationale" text="Every field, freshness rule, and confidence target here directly maps to an operational SLO or executive question. Without this contract, agentic reasoning is unbounded." />
                  <DrawerBlock label="Consumers" text="SREOps agent, Incident Copilot, Capacity Planner, Compliance Reporter." />
                </TabsContent>

                <TabsContent value="engineering" className="mt-4 space-y-3 text-[12px]">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Contract Compilation Pipeline</div>
                    <div className="space-y-1.5">
                      {["Entity discovery","Schema mapping","Field resolution","Relationship inference","Confidence scoring","Freshness calc","Validation rules","Contract compile"].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded bg-blue-100 text-blue-700 text-[10px] grid place-items-center font-semibold">{i + 1}</div>
                          <div className="flex-1 text-slate-700">{s}</div>
                          <div className="w-16 h-1 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-blue-500 animate-pulse" style={{ width: `${70 + (i * 3) % 25}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <DrawerBlock label="Rule Engine" text="Executes 214 validation rules · Version-pinned · Rollback-safe. Non-additive changes require reviewer + producer sign-off." />
                  <DrawerBlock label="Graph Projection" text="Contract → Neo4j canonical projection → vector candidate generation for agentic recall." />
                </TabsContent>

                <TabsContent value="telemetry" className="mt-4 space-y-2 text-[12px]">
                  {[
                    ["Evaluation time",   "182 ms p95"],
                    ["Rules executed",    "214 / eval"],
                    ["Fields evaluated",  "156"],
                    ["Contracts generated","62"],
                    ["Validation failures","3 (24h)"],
                    ["Coverage",          "94%"],
                    ["Confidence",        "87%"],
                    ["Policy compliance", "100%"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-slate-100 py-1.5">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-mono font-medium text-slate-800">{v}</span>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="deps" className="mt-4 space-y-3 text-[12px]">
                  <DrawerBlock label="Upstream Systems" text="CMDB · NetBox · SNMP · IPSec Gateway · BGP feed · IAM · OTel Collector" />
                  <DrawerBlock label="Owners" text="Platform Eng (Alex Morgan) · SRE (Priya Kumar) · NetOps (Sam Rhee)" />
                  <DrawerBlock label="Related Contracts" text="Change Ledger v2 · Alert Canonical v3 · Identity Graph v1.4" />
                  <DrawerBlock label="MCP / API" text="/mcp/contracts/v4 · /api/schema/site · /api/hydrate/device" />
                  <DrawerBlock label="Risk" text="Low — 0 breaking changes in last 30d. 2 producer teams on notice for schema evolution." />
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ---------- Small drawer/list helpers ---------- */
function Row({ label, value, wrap }: { label: string; value: string; wrap?: boolean }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <div className="text-slate-500">{label}</div>
      <div className={`text-slate-800 ${wrap ? "" : "truncate"}`}>{value}</div>
    </div>
  );
}
function DrawerBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">{label}</div>
      <div className="text-slate-700 leading-relaxed">{text}</div>
    </div>
  );
}
