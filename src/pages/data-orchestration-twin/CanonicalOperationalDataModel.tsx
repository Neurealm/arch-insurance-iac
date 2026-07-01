import { useMemo, useState } from "react";
import {
  Activity, ArrowRight, BadgeCheck, Boxes, ChevronRight, Clock, Cpu, Database,
  Download, Filter, GitBranch, Layers, Link2, Network, Play, RefreshCw, Search,
  Shield, Sparkles, TrendingUp, X, Zap, CheckCircle2, Users, Workflow, Gauge,
  Server, Globe, Router, Cable, Cloud, Container, Key, ShieldCheck, Bell,
  FileCode, MapPin, Radar, GitMerge, Repeat, Layers3, Radio, Package,
} from "lucide-react";

/* ---------------- Tokens ---------------- */
type Tone = "blue" | "emerald" | "amber" | "rose" | "violet" | "teal" | "orange";
const T: Record<Tone, { text: string; bg: string; ring: string; dot: string; border: string }> = {
  blue:    { text: "text-blue-700",    bg: "bg-blue-50",    ring: "ring-blue-200",    dot: "bg-blue-500",    border: "border-blue-200" },
  emerald: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500", border: "border-emerald-200" },
  amber:   { text: "text-amber-700",   bg: "bg-amber-50",   ring: "ring-amber-200",   dot: "bg-amber-500",   border: "border-amber-200" },
  rose:    { text: "text-rose-700",    bg: "bg-rose-50",    ring: "ring-rose-200",    dot: "bg-rose-500",    border: "border-rose-200" },
  violet:  { text: "text-violet-700",  bg: "bg-violet-50",  ring: "ring-violet-200",  dot: "bg-violet-500",  border: "border-violet-200" },
  teal:    { text: "text-teal-700",    bg: "bg-teal-50",    ring: "ring-teal-200",    dot: "bg-teal-500",    border: "border-teal-200" },
  orange:  { text: "text-orange-700",  bg: "bg-orange-50",  ring: "ring-orange-200",  dot: "bg-orange-500",  border: "border-orange-200" },
};

/* ---------------- Data ---------------- */
const kpis: { label: string; value: string; sub: string; tone: Tone; icon: any; spark: number[]; trend: string }[] = [
  { label: "Canonical Entity Types",     value: "15",     sub: "Model v4.1",             tone: "violet",  icon: Boxes,       spark: [10,11,12,13,14,15,15], trend: "+2 new" },
  { label: "Entities Generated (7D)",    value: "148.7M", sub: "Across all sources",     tone: "blue",    icon: Database,    spark: [4,5,6,7,8,9,10],       trend: "+12.4%" },
  { label: "Entity Coverage",            value: "98.1%",  sub: "Records mapped",         tone: "emerald", icon: Radar,       spark: [7,8,8,9,9,10,10],      trend: "+0.7%" },
  { label: "Relationships Defined",      value: "236",    sub: "Cross-entity edges",     tone: "teal",    icon: GitBranch,   spark: [5,6,7,8,8,9,9],        trend: "+18" },
  { label: "Reusability Score",          value: "94.3%",  sub: "Consumed by ≥3 systems", tone: "emerald", icon: Repeat,      spark: [7,8,8,9,9,9,10],       trend: "+2.1%" },
  { label: "Downstream Consumers",       value: "27",     sub: "Dashboards · AI · Auto", tone: "blue",    icon: Users,       spark: [6,7,7,8,8,9,9],        trend: "+4" },
  { label: "Canonical Quality Score",    value: "0.93",   sub: "Weighted composite",     tone: "emerald", icon: BadgeCheck,  spark: [8,8,9,9,9,10,10],      trend: "+0.03" },
  { label: "AI Readiness",               value: "97%",    sub: "Agent-queryable",        tone: "violet",  icon: Sparkles,    spark: [7,8,9,9,10,10,10],     trend: "+3.4%" },
];

type Entity = {
  id: string; name: string; description: string; icon: any; tone: Tone;
  primaryKey: string; relationships: string[]; records: string; coverage: number;
  quality: number; version: string; owner: string; consumers: number; updated: string;
  confidence: number; status: "Stable" | "Beta" | "Deprecated";
  sources: string[];
};

const entities: Entity[] = [
  { id: "device",     name: "Device",              description: "Physical or virtual network device",         icon: Router,      tone: "violet",  primaryKey: "device.id",       relationships: ["Site","Interface","Owner"],           records: "412K",  coverage: 99.2, quality: 0.96, version: "v4.1", owner: "NetOps",       consumers: 18, updated: "10:31 AM", confidence: 0.98, status: "Stable", sources: ["NGFW","CMDB","DNS"] },
  { id: "site",       name: "Site",                description: "Physical location or availability zone",     icon: MapPin,      tone: "blue",    primaryKey: "site.code",       relationships: ["Device","Route","Change"],            records: "1.2K",  coverage: 100,  quality: 0.98, version: "v4.1", owner: "Facilities",   consumers: 11, updated: "10:29 AM", confidence: 0.99, status: "Stable", sources: ["CMDB","Cloud Inv"] },
  { id: "interface",  name: "Interface",           description: "Network interface on a device",              icon: Cable,       tone: "teal",    primaryKey: "iface.id",        relationships: ["Device","Tunnel","Route"],            records: "3.8M",  coverage: 97.4, quality: 0.92, version: "v3.9", owner: "NetOps",       consumers: 9,  updated: "10:31 AM", confidence: 0.95, status: "Stable", sources: ["SNMP","Telemetry"] },
  { id: "tunnel",     name: "Tunnel",              description: "Encrypted transport tunnel (IPsec / GRE)",   icon: Cable,       tone: "teal",    primaryKey: "tunnel.id",       relationships: ["Interface","Site","Route"],           records: "48K",   coverage: 96.1, quality: 0.90, version: "v3.7", owner: "NetOps",       consumers: 7,  updated: "10:28 AM", confidence: 0.93, status: "Stable", sources: ["VPN Logs"] },
  { id: "route",      name: "Route",               description: "Reachability path in the routing plane",     icon: Workflow,    tone: "blue",    primaryKey: "route.hash",      relationships: ["Interface","Tunnel","Site"],          records: "12.4M", coverage: 95.8, quality: 0.88, version: "v3.5", owner: "NetOps",       consumers: 6,  updated: "10:30 AM", confidence: 0.91, status: "Stable", sources: ["BGP","OSPF"] },
  { id: "user",       name: "User",                description: "Human or service principal",                 icon: Users,       tone: "violet",  primaryKey: "user.upn",        relationships: ["Identity","Application","Change"],    records: "58K",   coverage: 99.9, quality: 0.97, version: "v4.0", owner: "IAM",          consumers: 15, updated: "10:31 AM", confidence: 0.98, status: "Stable", sources: ["Entra","Okta"] },
  { id: "rule",       name: "Rule",                description: "Firewall or policy rule",                    icon: Shield,      tone: "orange",  primaryKey: "rule.id",         relationships: ["Device","Policy","Application"],      records: "82K",   coverage: 98.0, quality: 0.94, version: "v4.1", owner: "SecEng",       consumers: 8,  updated: "10:31 AM", confidence: 0.96, status: "Stable", sources: ["NGFW"] },
  { id: "app",        name: "Application",         description: "Business application or service",            icon: Package,     tone: "blue",    primaryKey: "app.id",          relationships: ["Service","Owner","User"],             records: "6.4K",  coverage: 97.2, quality: 0.93, version: "v4.0", owner: "AppOps",       consumers: 20, updated: "10:29 AM", confidence: 0.95, status: "Stable", sources: ["CMDB","ServiceNow"] },
  { id: "service",    name: "Service",             description: "Deployed service instance",                  icon: Server,      tone: "blue",    primaryKey: "service.id",      relationships: ["Application","Route","Alert"],        records: "22K",   coverage: 96.9, quality: 0.92, version: "v3.9", owner: "SRE",          consumers: 17, updated: "10:31 AM", confidence: 0.94, status: "Stable", sources: ["K8s","APM"] },
  { id: "alert",      name: "Alert",               description: "Operational alert or signal",                icon: Bell,        tone: "rose",    primaryKey: "alert.id",        relationships: ["Service","Device","Change"],          records: "3.1M",  coverage: 100,  quality: 0.90, version: "v4.1", owner: "SRE",          consumers: 12, updated: "10:32 AM", confidence: 0.92, status: "Stable", sources: ["APM","XSIAM"] },
  { id: "change",     name: "Change",              description: "Change record or deployment event",          icon: GitCommitStub, tone: "amber", primaryKey: "change.id",       relationships: ["Application","Service","User"],       records: "42K",   coverage: 94.1, quality: 0.89, version: "v3.8", owner: "ChangeMgmt",   consumers: 10, updated: "10:26 AM", confidence: 0.90, status: "Stable", sources: ["Jira","ServiceNow"] },
  { id: "dns",        name: "DNS Record",          description: "DNS resource record",                        icon: Globe,       tone: "blue",    primaryKey: "dns.fqdn+type",   relationships: ["Device","Application","Certificate"], records: "8.9M",  coverage: 99.5, quality: 0.95, version: "v4.1", owner: "Platform",     consumers: 13, updated: "10:32 AM", confidence: 0.97, status: "Stable", sources: ["DNS","BIND"] },
  { id: "k8s",        name: "Kubernetes Workload", description: "K8s deployment / statefulset / pod set",     icon: Container,   tone: "teal",    primaryKey: "k8s.uid",         relationships: ["Service","Application","Alert"],      records: "184K",  coverage: 98.7, quality: 0.94, version: "v4.1", owner: "Platform",     consumers: 14, updated: "10:32 AM", confidence: 0.96, status: "Stable", sources: ["Kube API"] },
  { id: "cert",       name: "Certificate",         description: "X.509 certificate lifecycle object",         icon: Key,         tone: "amber",   primaryKey: "cert.thumbprint", relationships: ["DNS","Device","Application"],         records: "24K",   coverage: 96.5, quality: 0.91, version: "v3.9", owner: "SecEng",       consumers: 6,  updated: "10:20 AM", confidence: 0.93, status: "Stable", sources: ["Venafi","CT Logs"] },
  { id: "identity",   name: "Identity",            description: "Canonical identity across IdPs",             icon: ShieldCheck, tone: "violet",  primaryKey: "identity.canon",  relationships: ["User","Application","Change"],        records: "61K",   coverage: 99.4, quality: 0.96, version: "v4.1", owner: "IAM",          consumers: 16, updated: "10:31 AM", confidence: 0.98, status: "Stable", sources: ["Entra","Okta","AD"] },
];

const rawSources = ["Firewall","VPN","Cloud","DNS","Kubernetes","Identity","API","App Logs","Metrics","Events","Config"];
const enrichSteps = ["Metadata","Hydration","Validation","Normalization","Confidence","Relationships","Identity"];
const mapSteps = ["Entity Resolution","Field Mapping","Normalization","De-duplication","Business Rules","Canonical Naming","Relationship Build"];
const consumers = ["Dashboards","Graph","AI Agents","Automation","Runbooks","Analytics","Operational APIs","Knowledge Graph"];

const pipelineStages = [
  "Incoming Logs","Metadata Extraction","Entity Detection","Identity Resolution","Relationship Discovery",
  "Normalization","Canonical Mapping","Validation","Quality Scoring","Operational Entity","Graph Projection","Consumption",
];

const modelHealth = [
  { label: "Complete",       pct: 78, tone: "emerald" as Tone },
  { label: "Partial",        pct: 14, tone: "blue"    as Tone },
  { label: "Low Confidence", pct:  5, tone: "amber"   as Tone },
  { label: "Orphan",         pct:  2, tone: "rose"    as Tone },
  { label: "Deprecated",     pct:  1, tone: "violet"  as Tone },
];

/* Little icon shim so we don't blow up if lucide name changes */
function GitCommitStub(props: any) { return <GitBranch {...props} />; }

/* ---------------- UI atoms ---------------- */
function Spark({ values, tone }: { values: number[]; tone: Tone }) {
  const max = Math.max(...values), min = Math.min(...values);
  const w = 90, h = 24;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / Math.max(1, max - min)) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" strokeWidth={1.5} className={T[tone].text} stroke="currentColor" />
    </svg>
  );
}

function StatusPill({ status }: { status: Entity["status"] }) {
  const map = { Stable: "emerald", Beta: "amber", Deprecated: "rose" } as const;
  const t = T[map[status]];
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${t.bg} ${t.text}`}><span className={`h-1.5 w-1.5 rounded-full ${t.dot}`}/>{status}</span>;
}

/* ---------------- Page ---------------- */
export default function CanonicalOperationalDataModel() {
  const [selected, setSelected] = useState<Entity>(entities[0]);
  const [drawer, setDrawer] = useState<Entity | null>(null);
  const [drawerTab, setDrawerTab] = useState<"overview"|"engineering"|"telemetry"|"simulation"|"dependencies">("overview");
  const [simSimilarity, setSimSimilarity] = useState(0.82);
  const [simMerge, setSimMerge] = useState(0.90);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All"|Entity["status"]>("All");

  const filtered = useMemo(() => entities.filter(e => {
    const q = query.toLowerCase();
    return (statusFilter === "All" || e.status === statusFilter) &&
      (e.name + e.description + e.owner + e.sources.join(" ")).toLowerCase().includes(q);
  }), [query, statusFilter]);

  const openDrawer = (e: Entity) => { setDrawer(e); setDrawerTab("overview"); };

  return (
    <div className="p-6 space-y-6 bg-white">
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Canonical Operational Data Model</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[11px] font-semibold ring-1 ring-violet-200">
              <Layers3 className="h-3 w-3" /> Semantic Layer
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">v4.1</span>
          </div>
          <p className="mt-1 text-slate-600 text-sm max-w-3xl">
            Transform heterogeneous telemetry into trusted operational entities powering AI, automation, graph intelligence, and observability.
          </p>
          <p className="mt-1 text-slate-500 text-xs max-w-3xl">
            The Canonical Model normalizes diverse enterprise telemetry into reusable operational entities that become the foundation for analytics, orchestration, knowledge graphs, and agentic reasoning.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 mr-1">Last Updated <span className="text-slate-800 font-medium">May 12, 2026 10:32 AM</span></div>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"><Search className="h-3.5 w-3.5"/>Model Explorer</button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"><GitBranch className="h-3.5 w-3.5"/>v4.1</button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"><GitMerge className="h-3.5 w-3.5"/>Compare</button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-indigo-600 text-white text-xs hover:bg-indigo-700"><Download className="h-3.5 w-3.5"/>Export Model</button>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map(k => {
          const t = T[k.tone]; const Icon = k.icon;
          return (
            <button key={k.label} onClick={() => openDrawer(selected)}
              className="text-left rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
              <div className="flex items-start justify-between">
                <div className={`h-8 w-8 rounded-lg grid place-items-center ${t.bg} ${t.text}`}><Icon className="h-4 w-4"/></div>
                <Spark values={k.spark} tone={k.tone}/>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 leading-tight">{k.label}</div>
              <div className="mt-0.5 text-xl font-bold text-slate-900 tabular-nums">{k.value}</div>
              <div className={`mt-0.5 text-[10px] font-medium ${t.text}`}>{k.sub} · {k.trend}</div>
            </button>
          );
        })}
      </section>

      {/* Raw → Canonical Pipeline */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Raw → Canonical Transformation Pipeline</div>
            <div className="text-[11px] text-slate-500">Thousands of disparate logs become a single operational language</div>
          </div>
          <div className="text-[11px] text-slate-500 inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"/>Live flow</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {/* Stage 1 */}
          <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-700"><Radio className="h-3.5 w-3.5"/>1 · Raw Sources</div>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {rawSources.map(s => (
                <span key={s} className="text-[10px] px-1.5 py-1 rounded bg-white text-violet-800 border border-violet-100">{s}</span>
              ))}
            </div>
          </div>
          {/* Stage 2 */}
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700"><Zap className="h-3.5 w-3.5"/>2 · Processing & Enrichment</div>
            <ul className="mt-2 space-y-0.5">
              {enrichSteps.map(s => (
                <li key={s} className="text-[11px] text-blue-900/80 flex items-center gap-1"><ChevronRight className="h-3 w-3 text-blue-400"/>{s}</li>
              ))}
            </ul>
          </div>
          {/* Stage 3 */}
          <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-700"><GitMerge className="h-3.5 w-3.5"/>3 · Canonical Mapping</div>
            <ul className="mt-2 space-y-0.5">
              {mapSteps.map(s => (
                <li key={s} className="text-[11px] text-orange-900/80 flex items-center gap-1"><ChevronRight className="h-3 w-3 text-orange-400"/>{s}</li>
              ))}
            </ul>
          </div>
          {/* Stage 4 */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700"><Boxes className="h-3.5 w-3.5"/>4 · Canonical Model</div>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {entities.slice(0, 15).map(e => {
                const Icon = e.icon;
                return (
                  <button key={e.id} onClick={() => { setSelected(e); openDrawer(e); }}
                    title={e.name}
                    className={`h-10 rounded border ${T[e.tone].border} ${T[e.tone].bg} grid place-items-center hover:scale-105 transition`}>
                    <Icon className={`h-3.5 w-3.5 ${T[e.tone].text}`}/>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Stage 5 */}
          <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-700"><Network className="h-3.5 w-3.5"/>5 · Consumption</div>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {consumers.map(s => (
                <span key={s} className="text-[10px] px-1.5 py-1 rounded bg-white text-teal-800 border border-teal-100">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Flow bar */}
        <div className="mt-3 relative h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-violet-400 via-blue-400 via-orange-400 via-emerald-400 to-teal-400 opacity-70"/>
          <div className="absolute top-0 h-full w-8 bg-white/60 blur-sm animate-[slide_3s_linear_infinite]" style={{ animationName: "slide" }}/>
          <style>{`@keyframes slide { from { left: -10%; } to { left: 110%; } }`}</style>
        </div>
      </section>

      {/* Graph + right rail */}
      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-9 space-y-4">
          {/* Interactive canonical graph */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Interactive Canonical Entity Graph</div>
                <div className="text-[11px] text-slate-500">Click any entity to inspect · Hover edges for relationship metadata</div>
              </div>
              <div className="text-[11px] text-slate-500">{entities.length} entities · 236 relationships</div>
            </div>
            <div className="mt-3 rounded-lg bg-gradient-to-b from-slate-50 to-white ring-1 ring-slate-100 p-4">
              <div className="relative h-[340px]">
                <svg viewBox="0 0 800 340" className="absolute inset-0 h-full w-full">
                  {entities.map((e, i) => {
                    const angle = (i / entities.length) * Math.PI * 2 - Math.PI / 2;
                    const cx = 400 + Math.cos(angle) * 140;
                    const cy = 170 + Math.sin(angle) * 130;
                    return (
                      <g key={`edge-${e.id}`}>
                        <line x1={400} y1={170} x2={cx} y2={cy} stroke="#c7d2fe" strokeWidth={1}>
                          <animate attributeName="stroke-opacity" values="0.3;0.9;0.3" dur="2.4s" begin={`${i*0.12}s`} repeatCount="indefinite"/>
                        </line>
                      </g>
                    );
                  })}
                  <circle cx={400} cy={170} r={30} className="fill-indigo-600"/>
                  <text x={400} y={168} textAnchor="middle" fontSize="9" className="fill-white font-bold">Canonical</text>
                  <text x={400} y={180} textAnchor="middle" fontSize="9" className="fill-white font-bold">Model</text>
                </svg>
                {entities.map((e, i) => {
                  const angle = (i / entities.length) * Math.PI * 2 - Math.PI / 2;
                  const left = 50 + 50 * Math.cos(angle) - 3.5; // as %
                  const top  = 50 + 45 * Math.sin(angle) - 4;
                  const Icon = e.icon; const t = T[e.tone];
                  const isSel = selected.id === e.id;
                  return (
                    <button key={e.id} onClick={() => setSelected(e)}
                      onDoubleClick={() => openDrawer(e)}
                      style={{ left: `${left}%`, top: `${top}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border ${t.border} ${t.bg} px-2 py-1.5 shadow-sm hover:shadow-md hover:-translate-y-1 transition text-left w-[110px] ${isSel ? "ring-2 ring-indigo-400" : ""}`}>
                      <div className="flex items-center gap-1.5">
                        <Icon className={`h-3.5 w-3.5 ${t.text}`}/>
                        <span className="text-[11px] font-semibold text-slate-800 truncate">{e.name}</span>
                      </div>
                      <div className="mt-0.5 text-[9px] text-slate-500 tabular-nums">{e.records} · c={e.confidence}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Entity registry */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2 gap-2">
              <div>
                <div className="text-sm font-semibold text-slate-900">Entity Detail Registry</div>
                <div className="text-[11px] text-slate-500">Every canonical entity, versioned and owner-attributed</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search entities..."
                    className="pl-7 pr-2 py-1.5 text-xs rounded-md border border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 outline-none w-56"/>
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                  className="text-xs py-1.5 px-2 rounded-md border border-slate-200">
                  <option>All</option><option>Stable</option><option>Beta</option><option>Deprecated</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-2">Entity</th>
                    <th className="py-2 pr-2">Description</th>
                    <th className="py-2 pr-2">Primary Key</th>
                    <th className="py-2 pr-2">Relationships</th>
                    <th className="py-2 pr-2 text-right">Records</th>
                    <th className="py-2 pr-2 text-right">Coverage</th>
                    <th className="py-2 pr-2 text-right">Quality</th>
                    <th className="py-2 pr-2">Version</th>
                    <th className="py-2 pr-2">Owner</th>
                    <th className="py-2 pr-2 text-right">Consumers</th>
                    <th className="py-2 pr-2 text-right">Conf</th>
                    <th className="py-2 pr-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => {
                    const Icon = e.icon; const t = T[e.tone];
                    return (
                      <tr key={e.id} onClick={() => { setSelected(e); openDrawer(e); }}
                        className={`border-b border-slate-100 hover:bg-slate-50/60 cursor-pointer ${selected.id === e.id ? "bg-indigo-50/30" : ""}`}>
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-2">
                            <span className={`h-6 w-6 rounded grid place-items-center ${t.bg}`}><Icon className={`h-3.5 w-3.5 ${t.text}`}/></span>
                            <span className="font-semibold text-slate-900">{e.name}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-2 text-slate-600">{e.description}</td>
                        <td className="py-2 pr-2 font-mono text-[11px] text-slate-700">{e.primaryKey}</td>
                        <td className="py-2 pr-2 text-slate-600">{e.relationships.join(", ")}</td>
                        <td className="py-2 pr-2 text-right tabular-nums text-slate-800">{e.records}</td>
                        <td className="py-2 pr-2 text-right tabular-nums text-slate-800">{e.coverage}%</td>
                        <td className="py-2 pr-2 text-right tabular-nums font-semibold">{e.quality.toFixed(2)}</td>
                        <td className="py-2 pr-2 text-slate-500 font-mono text-[11px]">{e.version}</td>
                        <td className="py-2 pr-2 text-slate-700">{e.owner}</td>
                        <td className="py-2 pr-2 text-right tabular-nums text-slate-700">{e.consumers}</td>
                        <td className="py-2 pr-2 text-right tabular-nums text-emerald-700 font-semibold">{e.confidence}</td>
                        <td className="py-2 pr-2"><StatusPill status={e.status}/></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <aside className="col-span-12 xl:col-span-3 space-y-4">
          {/* Entity summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg grid place-items-center ${T[selected.tone].bg}`}>
                <selected.icon className={`h-4 w-4 ${T[selected.tone].text}`}/>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Canonical Entity</div>
                <div className="text-sm font-bold text-slate-900">{selected.name}</div>
              </div>
            </div>
            <dl className="mt-3 space-y-1.5 text-[12px]">
              {[
                ["Description", selected.description],
                ["Primary Key", selected.primaryKey],
                ["Record Count", selected.records],
                ["Relationships", selected.relationships.join(", ")],
                ["Coverage", `${selected.coverage}%`],
                ["Quality", selected.quality.toFixed(2)],
                ["Version", selected.version],
                ["Owner", selected.owner],
                ["Consumers", `${selected.consumers} systems`],
                ["Sources", selected.sources.join(", ")],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-3">
                  <dt className="text-slate-500 shrink-0">{k}</dt>
                  <dd className="text-slate-800 text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <button onClick={() => openDrawer(selected)} className="mt-3 w-full text-[11px] py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center justify-center gap-1">
              Open Engineering Drawer <ArrowRight className="h-3 w-3"/>
            </button>
          </div>

          {/* Model health donut */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Model Health</div>
            <div className="mt-3 flex items-center gap-4">
              <svg viewBox="0 0 42 42" className="h-28 w-28 -rotate-90">
                <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#f1f5f9" strokeWidth="6"/>
                {(() => {
                  let acc = 0;
                  return modelHealth.map(seg => {
                    const dash = `${seg.pct} ${100 - seg.pct}`;
                    const off = 100 - acc; acc += seg.pct;
                    return <circle key={seg.label} cx="21" cy="21" r="15.9" fill="transparent" strokeWidth="6"
                      stroke="currentColor" className={T[seg.tone].text} strokeDasharray={dash} strokeDashoffset={off}/>;
                  });
                })()}
              </svg>
              <ul className="flex-1 space-y-1 text-[11px]">
                {modelHealth.map(seg => (
                  <li key={seg.label} className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-slate-700"><span className={`h-2 w-2 rounded-full ${T[seg.tone].dot}`}/>{seg.label}</span>
                    <span className="tabular-nums font-medium text-slate-600">{seg.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Downstream impact */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Downstream Impact</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              {[
                { label: "Dashboards", value: 23, icon: Activity, tone: "blue" as Tone },
                { label: "Automation", value: 14, icon: Zap, tone: "amber" as Tone },
                { label: "Graph Nodes", value: 412, icon: Network, tone: "teal" as Tone },
                { label: "AI Models", value: 7, icon: Cpu, tone: "violet" as Tone },
                { label: "Reports", value: 18, icon: FileCode, tone: "blue" as Tone },
                { label: "Runbooks", value: 9, icon: Workflow, tone: "emerald" as Tone },
                { label: "APIs", value: 12, icon: Cloud, tone: "blue" as Tone },
                { label: "Consumers", value: 27, icon: Users, tone: "violet" as Tone },
              ].map(x => {
                const t = T[x.tone];
                return (
                  <div key={x.label} className="rounded-md border border-slate-200 p-2">
                    <div className="flex items-center gap-1.5"><x.icon className={`h-3 w-3 ${t.text}`}/><span className="text-slate-500">{x.label}</span></div>
                    <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">{x.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </section>

      {/* Engineering Transparency Zone */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">How the Canonical Modeling Engine Works</div>
            <div className="text-[11px] text-slate-500">Engineering services behind entity detection, resolution, and canonical construction</div>
          </div>
          <div className="text-[11px] text-slate-500">Lower 40% · Engineering Transparency</div>
        </div>

        {/* Canonical modeling pipeline */}
        <div className="mt-4 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-[1200px]">
            {pipelineStages.map((s, i) => (
              <div key={s} className="flex items-center">
                <button onClick={() => openDrawer(selected)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-indigo-300 hover:shadow-sm transition text-left w-[130px]">
                  <div className="text-[10px] uppercase text-slate-400">Stage {i+1}</div>
                  <div className="text-[12px] font-semibold text-slate-800 leading-tight">{s}</div>
                </button>
                {i < pipelineStages.length - 1 && (
                  <div className="mx-1 flex items-center gap-0.5">
                    <span className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse"/>
                    <span className="h-1 w-1 rounded-full bg-indigo-400 animate-pulse [animation-delay:120ms]"/>
                    <span className="h-1 w-1 rounded-full bg-indigo-300 animate-pulse [animation-delay:240ms]"/>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Split: Resolution + Live builder + Before/After */}
        <div className="mt-4 grid grid-cols-12 gap-4">
          {/* Entity Resolution */}
          <div className="col-span-12 lg:col-span-4 rounded-lg border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-2"><GitMerge className="h-4 w-4 text-orange-500"/>Entity Resolution Engine</div>
            <ol className="mt-2 space-y-1">
              {["Raw Fields","Similarity Engine","Identity Matching","Business Rules","Conflict Resolution","Canonical Merge","Entity Versioning","Operational Entity"].map((s, i) => (
                <li key={s} className="flex items-center gap-2 text-[11px] rounded-md border border-slate-100 p-1.5 hover:bg-slate-50">
                  <span className="h-5 w-5 rounded bg-orange-50 text-orange-700 grid place-items-center text-[10px] font-bold">{i+1}</span>
                  <span className="text-slate-800">{s}</span>
                  <span className="ml-auto text-[10px] text-slate-500 tabular-nums">c={(0.88 + i*0.01).toFixed(2)}</span>
                </li>
              ))}
            </ol>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[["Sources","11"],["Merges/s","4.2k"],["Conflicts","0.3%"]].map(([k,v]) => (
                <div key={k} className="rounded bg-slate-50 p-2">
                  <div className="text-[10px] text-slate-500">{k}</div>
                  <div className="text-sm font-bold text-slate-900 tabular-nums">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Canonical Builder (dark) */}
          <div className="col-span-12 lg:col-span-4 rounded-lg bg-slate-950 text-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold flex items-center gap-2"><Cpu className="h-4 w-4"/>Live Canonical Builder</div>
              <button className="p-1 rounded hover:bg-white/10"><RefreshCw className="h-3.5 w-3.5"/></button>
            </div>
            <div className="mt-3 space-y-1 text-[11px] font-mono">
              {[
                "detect  › entity=Device src=NGFW      hits=1,240/s",
                "resolve › identity match=0.94 merges=812/s",
                "normalize› fields=17 → canonical=15",
                "validate › rules_ok=99.4%  drift=0",
                "relate   › edges/s=624 conf=0.93",
                "commit   › canonical.write=1,204/s",
              ].map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-slate-500 w-14 tabular-nums">10:32:{String(11+i).padStart(2,"0")}</span>
                  <span className="text-emerald-400">▸</span>
                  <span className="text-slate-200 truncate">{line}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[["Ent/s","1.2k"],["Rel/s","624"],["Merge","8ms"],["Workers","24"]].map(([k,v]) => (
                <div key={k} className="rounded bg-white/5 p-1.5">
                  <div className="text-[10px] text-slate-400">{k}</div>
                  <div className="text-[12px] font-bold tabular-nums">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Before / After Canonical Mapping */}
          <div className="col-span-12 lg:col-span-4 rounded-lg border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-900">Before / After Canonical Mapping</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-md bg-slate-50 p-2 font-mono text-slate-700 space-y-0.5">
                <div className="text-[10px] uppercase text-slate-500 font-sans font-semibold">Raw Log</div>
                <div>src_ip: 10.4.12.11</div>
                <div>dev_ser: 001801234567</div>
                <div>hostn: dc01-ngfw</div>
                <div>vend: PA-3260</div>
                <div>loc: DFW</div>
              </div>
              <div className="rounded-md bg-emerald-50 p-2 font-mono text-emerald-900 space-y-0.5 border border-emerald-100">
                <div className="text-[10px] uppercase text-emerald-700 font-sans font-semibold">Canonical Device</div>
                <div>device.id: NGFW-DC-01</div>
                <div>device.serial: 0018-0123-4567</div>
                <div>device.model: PA-3260</div>
                <div>device.site: DFW-01</div>
                <div>confidence: 0.98</div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1"><Link2 className="h-3 w-3"/>Relationships: Device→Site, Device→Interface, Device→Rule</div>
          </div>
        </div>

        {/* Bottom widgets */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: "Top Entity Growth", icon: TrendingUp, items: ["Alert +18.4% ↑","K8s Workload +12.1% ↑","Certificate +9.7% ↑","Route +4.2% ↑"] },
            { title: "Duplicate Reduction", icon: GitMerge, items: ["Device: -46%","Identity: -38%","Application: -22%","DNS: -19%"] },
            { title: "Recent Entity Changes", icon: GitBranch, items: ["Device v4.1 shipped","Certificate v3.9 patched","Alert v4.1 field added","Route v3.5 deprecation notice"] },
            { title: "Model Evolution", icon: Clock, items: ["v4.1 · today","v4.0 · 12 days ago","v3.9 · 34 days ago","v3.8 · 58 days ago"] },
          ].map(w => (
            <div key={w.title} className="rounded-lg border border-slate-200 p-3 bg-white hover:shadow-sm transition">
              <div className="text-[12px] font-semibold text-slate-900 flex items-center gap-1.5"><w.icon className="h-3.5 w-3.5 text-indigo-600"/>{w.title}</div>
              <ul className="mt-1.5 space-y-1 text-[11px] text-slate-600">
                {w.items.map(i => <li key={i} className="flex items-start gap-1.5"><ChevronRight className="h-3 w-3 mt-0.5 text-slate-400"/>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Engineering Drawer */}
      {drawer && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={() => setDrawer(null)}/>
          <aside className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-50 shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg grid place-items-center ${T[drawer.tone].bg}`}><drawer.icon className={`h-4 w-4 ${T[drawer.tone].text}`}/></div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">Canonical Entity · {drawer.version}</div>
                    <div className="text-lg font-semibold text-slate-900">{drawer.name}</div>
                  </div>
                </div>
                <div className="mt-1 text-[12px] text-slate-500">{drawer.description}</div>
              </div>
              <button onClick={() => setDrawer(null)} className="p-1.5 rounded-md hover:bg-slate-100"><X className="h-4 w-4"/></button>
            </div>
            <div className="px-4 pt-2 border-b border-slate-200 flex items-center gap-1 text-[12px]">
              {(["overview","engineering","telemetry","simulation","dependencies"] as const).map(t => (
                <button key={t} onClick={() => setDrawerTab(t)}
                  className={`px-2.5 py-1.5 rounded-t-md capitalize ${drawerTab === t ? "text-indigo-700 border-b-2 border-indigo-600 -mb-px font-semibold" : "text-slate-500 hover:text-slate-800"}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="p-4 overflow-y-auto text-[12px] text-slate-700 space-y-3">
              {drawerTab === "overview" && (
                <>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">Business Explanation</div>
                    <p className="mt-1"><span className="font-semibold">{drawer.name}</span> is a canonical operational entity used to standardize {drawer.description.toLowerCase()} across {drawer.sources.length} source systems. It powers {drawer.consumers} downstream consumers including dashboards, AI models, and automation.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[["Records", drawer.records],["Coverage", `${drawer.coverage}%`],["Quality", drawer.quality.toFixed(2)],["Confidence", drawer.confidence.toFixed(2)]].map(([k,v]) => (
                      <div key={k} className="rounded-md bg-slate-50 p-2"><div className="text-[10px] text-slate-500">{k}</div><div className="font-semibold text-slate-900">{v}</div></div>
                    ))}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">Sources</div>
                    <div className="mt-1 flex flex-wrap gap-1">{drawer.sources.map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-100">{s}</span>)}</div>
                  </div>
                </>
              )}

              {drawerTab === "engineering" && (
                <div className="space-y-1.5">
                  {["Entity detection","Identity resolution","Normalization","Canonical mapping","Conflict resolution","Merge engine","Relationship builder","Versioning","Validation","Quality scoring"].map((s, i) => (
                    <div key={s} className="flex items-center gap-2 rounded-md border border-slate-200 p-2">
                      <div className="h-6 w-6 rounded bg-indigo-50 text-indigo-600 grid place-items-center text-[10px] font-semibold">{i+1}</div>
                      <div className="text-slate-800 font-medium">{s}</div>
                      <div className="ml-auto text-[10px] text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/>Active</div>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === "telemetry" && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Entities/sec","1,240"],["Relationships/sec","624"],["Merge rate","812/s"],["CPU","34%"],
                    ["Memory","4.2GB"],["Latency p95","28ms"],["Confidence avg", drawer.confidence.toFixed(2)],
                    ["Versions active","3"],["Workers","24"],["Queue depth","12"],["Errors","0"],["Uptime","99.98%"],
                  ].map(([k,v]) => (
                    <div key={k} className="rounded-md bg-slate-50 p-2"><div className="text-[10px] text-slate-500">{k}</div><div className="font-semibold text-slate-900 tabular-nums">{v}</div></div>
                  ))}
                </div>
              )}

              {drawerTab === "simulation" && (
                <div className="space-y-3">
                  <label className="block">
                    <div className="flex justify-between text-[11px]"><span>Similarity threshold</span><span className="tabular-nums">{simSimilarity.toFixed(2)}</span></div>
                    <input type="range" min={0.5} max={1} step={0.01} value={simSimilarity} onChange={e => setSimSimilarity(parseFloat(e.target.value))} className="w-full accent-indigo-600"/>
                  </label>
                  <label className="block">
                    <div className="flex justify-between text-[11px]"><span>Merge confidence</span><span className="tabular-nums">{simMerge.toFixed(2)}</span></div>
                    <input type="range" min={0.5} max={1} step={0.01} value={simMerge} onChange={e => setSimMerge(parseFloat(e.target.value))} className="w-full accent-indigo-600"/>
                  </label>
                  <div className="rounded-md bg-slate-950 text-slate-100 p-3 text-[11px] font-mono">
                    <div>projected_entities = {(148.7 * (0.5 + simSimilarity/2)).toFixed(1)}M</div>
                    <div>projected_duplicates = {(100 - simSimilarity*100).toFixed(1)}%</div>
                    <div>projected_relationships = {(236 * simMerge).toFixed(0)}</div>
                    <div>projected_quality = {(0.75 + simMerge*0.22).toFixed(2)}</div>
                  </div>
                  <p className="text-[11px] text-slate-500">Simulation runs in-memory and does not affect the live canonical model.</p>
                </div>
              )}

              {drawerTab === "dependencies" && (
                <ul className="space-y-1.5">
                  {["Source Systems","Hydration Engine","Validation Engine","Lineage Service","Graph Builder","Knowledge Graph","AI Models","Dashboards","Automation","Ownership: " + drawer.owner,"Risk: Low"].map(x => (
                    <li key={x} className="flex items-center gap-2 rounded-md border border-slate-200 p-2"><Link2 className="h-3.5 w-3.5 text-indigo-600"/>{x}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1"><Gauge className="h-3 w-3"/>Canonical integrity verified</span>
              <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"><Download className="h-3 w-3"/>Export entity</button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
