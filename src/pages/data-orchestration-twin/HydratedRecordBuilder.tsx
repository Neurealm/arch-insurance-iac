import { useEffect, useMemo, useState } from "react";
import {
  Database, Link2, Search, Zap, FileCode, Network, ScrollText, Fingerprint, Users,
  Layers, Lock, Shield, BrainCircuit, Gauge, Clock, TrendingUp, ScanSearch, Sparkles,
  Workflow, CheckCircle2, ArrowRight, Filter, Download, BookOpen, FlaskConical, Play,
  Radio, GitBranch, Boxes, Eye, ChevronRight, RefreshCw, MousePointerClick, Wand2,
  Package, Bell, Cpu, HardDrive,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tone = "blue" | "emerald" | "amber" | "violet" | "rose" | "cyan" | "slate" | "teal" | "orange";
const tone = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200",    hex: "#3b82f6" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", hex: "#10b981" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200",   hex: "#f59e0b" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-200",  hex: "#8b5cf6" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-200",    hex: "#f43f5e" },
  cyan:    { bg: "bg-cyan-50",    text: "text-cyan-600",    border: "border-cyan-200",    hex: "#06b6d4" },
  slate:   { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   hex: "#64748b" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-600",    border: "border-teal-200",    hex: "#14b8a6" },
  orange:  { bg: "bg-orange-50",  text: "text-orange-600",  border: "border-orange-200",  hex: "#f97316" },
} as const;

/* ---------- data ---------- */
const KPIS = [
  { icon: Package,      label: "Records Processed (7D)",   value: "12.4M", sub: "+18.7% vs prior 7D", delta: "+18.7", tone: "blue"    as Tone, spark: [8,9,9.6,10.4,11.1,11.8,12.4] },
  { icon: Sparkles,     label: "Enriched Records Created", value: "11.7M", sub: "94.4% of total",     delta: "+22",   tone: "emerald" as Tone, spark: [7,8,9,10,10.6,11.2,11.7] },
  { icon: Gauge,        label: "Avg Confidence Score",     value: "0.94",  sub: "Target ≥ 0.90",      delta: "+0.02", tone: "teal"    as Tone, spark: [0.88,0.9,0.91,0.92,0.93,0.93,0.94] },
  { icon: BrainCircuit, label: "Hydration Coverage",       value: "88%",   sub: "Target ≥ 90%",       delta: "+3",    tone: "violet"  as Tone, spark: [80,82,84,85,86,87,88] },
  { icon: Layers,       label: "Avg Fields Added",         value: "17/22", sub: "Per Record",         delta: "+2",    tone: "orange"  as Tone, spark: [12,13,14,15,15,16,17] },
  { icon: CheckCircle2, label: "Hydration Success Rate",   value: "92%",   sub: "Target ≥ 90%",       delta: "+1.4",  tone: "emerald" as Tone, spark: [88,89,90,90,91,91,92] },
  { icon: GitBranch,    label: "Lineage Captured",         value: "100%",  sub: "All Records",        delta: "0",     tone: "cyan"    as Tone, spark: [100,100,100,100,100,100,100] },
  { icon: Users,        label: "Operational Consumers",    value: "38",    sub: "Dashboards + AI",    delta: "+4",    tone: "rose"    as Tone, spark: [30,32,33,34,35,36,38] },
];

type MethodKey = "lookup" | "correlation" | "synthQuery" | "synthTx" | "rule" | "topology" | "metadata" | "identity" | "sme";
const METHODS: { key: MethodKey; label: string; icon: any; tone: Tone; success: number; latency: string; conf: number; rps: string; usage: number; badge: string; color: string; }[] = [
  { key:"lookup",      label:"Source of Truth Lookup",   icon:Database,    tone:"emerald" as Tone, success:95, latency:"120ms", conf:0.96, rps:"3.4k", usage:41, badge:"Source of Truth", color:"#10b981" },
  { key:"correlation", label:"Adjacent Log Correlation", icon:Link2,       tone:"blue"    as Tone, success:91, latency:"640ms", conf:0.91, rps:"2.1k", usage:25, badge:"Correlation",     color:"#3b82f6" },
  { key:"synthQuery",  label:"Synthetic Query",          icon:Search,      tone:"violet"  as Tone, success:89, latency:"1.4s",  conf:0.89, rps:"820",  usage:17, badge:"Synthetic Query", color:"#8b5cf6" },
  { key:"synthTx",     label:"Synthetic Transaction",    icon:Zap,         tone:"amber"   as Tone, success:86, latency:"2.6s",  conf:0.86, rps:"210",  usage:8,  badge:"Synthetic Tx",    color:"#f59e0b" },
  { key:"rule",        label:"Rule Based Derivation",    icon:FileCode,    tone:"cyan"    as Tone, success:94, latency:"90ms",  conf:0.93, rps:"5.2k", usage:33, badge:"Rule Derivation", color:"#06b6d4" },
  { key:"topology",    label:"Topology Resolution",      icon:Network,     tone:"teal"    as Tone, success:92, latency:"320ms", conf:0.92, rps:"1.3k", usage:19, badge:"Topology",        color:"#14b8a6" },
  { key:"metadata",    label:"Business Metadata Lookup", icon:ScrollText,  tone:"violet"  as Tone, success:97, latency:"80ms",  conf:0.97, rps:"1.1k", usage:14, badge:"Metadata",        color:"#a78bfa" },
  { key:"identity",    label:"Identity Resolution",      icon:Fingerprint, tone:"blue"    as Tone, success:93, latency:"260ms", conf:0.93, rps:"940",  usage:12, badge:"Identity",        color:"#60a5fa" },
  { key:"sme",         label:"SME Validation",           icon:Users,       tone:"rose"    as Tone, success:98, latency:"12m",   conf:0.98, rps:"6",    usage:2,  badge:"SME",             color:"#f43f5e" },
];

type Field = { field: string; value: string; source: string; method: MethodKey | "raw"; conf: number; ts: string; version: string; raw?: boolean; };
const DERIVED_FIELDS: Field[] = [
  { field:"event_time",        value:"2026-05-12T10:15:22Z",           source:"Raw Log",           method:"raw",         conf:1.00, ts:"10:15:22", version:"—",   raw:true },
  { field:"src_ip",            value:"10.1.2.3",                       source:"Raw Log",           method:"raw",         conf:1.00, ts:"10:15:22", version:"—",   raw:true },
  { field:"dst_ip",            value:"52.23.10.5",                     source:"Raw Log",           method:"raw",         conf:1.00, ts:"10:15:22", version:"—",   raw:true },
  { field:"src_port",          value:"51244",                          source:"Raw Log",           method:"raw",         conf:1.00, ts:"10:15:22", version:"—",   raw:true },
  { field:"dst_port",          value:"443",                            source:"Raw Log",           method:"raw",         conf:1.00, ts:"10:15:22", version:"—",   raw:true },
  { field:"action",            value:"allow",                          source:"Raw Log",           method:"raw",         conf:1.00, ts:"10:15:22", version:"—",   raw:true },
  { field:"bytes",             value:"1520",                           source:"Raw Log",           method:"raw",         conf:1.00, ts:"10:15:22", version:"—",   raw:true },
  { field:"device_name",       value:"NGFW-DC-01",                     source:"ServiceNow CMDB",   method:"lookup",      conf:0.98, ts:"10:15:23", version:"v1" },
  { field:"site",              value:"Dallas-DC1",                     source:"Topology Graph",    method:"topology",    conf:0.98, ts:"10:15:23", version:"v1" },
  { field:"interface",         value:"ethernet1/3",                    source:"CMDB Port Table",   method:"lookup",      conf:0.98, ts:"10:15:23", version:"v1" },
  { field:"user",              value:"jdoe@corp.com",                  source:"Okta Identity",     method:"identity",    conf:0.93, ts:"10:15:23", version:"v1" },
  { field:"application",       value:"Salesforce",                     source:"App Rule Engine",   method:"rule",        conf:0.94, ts:"10:15:23", version:"v1" },
  { field:"rule_name",         value:"Allow-Salesforce-Out",           source:"Policy Rule Set",   method:"rule",        conf:0.95, ts:"10:15:23", version:"v1" },
  { field:"tunnel",            value:"IPSec-Tunnel-Blue",              source:"Topology Graph",    method:"topology",    conf:0.92, ts:"10:15:24", version:"v1" },
  { field:"dns_domain",        value:"salesforce.com",                 source:"DNS Query API",     method:"synthQuery",  conf:0.93, ts:"10:15:24", version:"v1" },
  { field:"topology_path",     value:"LAN → DC-FW → Internet",         source:"Path Solver",       method:"topology",    conf:0.91, ts:"10:15:24", version:"v1" },
  { field:"owner",             value:"Network Operations",             source:"Service Catalog",   method:"metadata",    conf:0.96, ts:"10:15:24", version:"v1" },
  { field:"risk_score",        value:"23 (Low)",                       source:"Risk Rules v3",     method:"rule",        conf:0.92, ts:"10:15:25", version:"v1" },
  { field:"threat_context",    value:"none",                           source:"Threat Correlator", method:"correlation", conf:0.90, ts:"10:15:25", version:"v1" },
  { field:"business_service",  value:"Sales CRM",                      source:"Service Catalog",   method:"metadata",    conf:0.97, ts:"10:15:25", version:"v1" },
  { field:"confidence",        value:"0.94",                           source:"Enrichment Engine", method:"raw",         conf:1.00, ts:"10:15:25", version:"v1" },
  { field:"lineage_id",        value:"ln-9b2a7f5e8c1d",                source:"Enrichment Engine", method:"raw",         conf:1.00, ts:"10:15:25", version:"v1" },
];

const RAW_JSON = `{
  "event_time": "2026-05-12T10:15:22.222Z",
  "src_ip": "10.1.2.3",
  "dst_ip": "52.23.10.5",
  "src_port": 51244,
  "dst_port": 443,
  "action": "allow",
  "bytes": 1520,
  "app": "ssl",
  "policy_id": "12345",
  "rule_uuid": "a1b2c3d4",
  "vsys": "vsys1",
  "device_serial": "001801234567",
  "log_type": "traffic"
}`;

const LINEAGE = [
  { l: "Raw Log Ingested",     ts: "10:15:22", tone: "slate"   as Tone },
  { l: "Enrichment Started",   ts: "10:15:23", tone: "blue"    as Tone },
  { l: "Metadata Attached",    ts: "10:15:23", tone: "violet"  as Tone },
  { l: "Lookups (4) Completed",ts: "10:15:23", tone: "emerald" as Tone },
  { l: "Correlations (3)",     ts: "10:15:24", tone: "cyan"    as Tone },
  { l: "Rules Applied (2)",    ts: "10:15:24", tone: "amber"   as Tone },
  { l: "SME Validation",       ts: "10:15:25", tone: "rose"    as Tone },
  { l: "Confidence Scored",    ts: "10:15:25", tone: "teal"    as Tone },
  { l: "Derived Record Sealed",ts: "10:15:25", tone: "emerald" as Tone },
  { l: "Published to Platform",ts: "10:15:26", tone: "blue"    as Tone },
];

const CONSTRUCTION_PIPELINE = [
  { l:"Raw Record",         icon:Database },
  { l:"Gap Detection",      icon:ScanSearch },
  { l:"Lookup Engine",      icon:Database },
  { l:"Correlation Engine", icon:Link2 },
  { l:"Rule Engine",        icon:FileCode },
  { l:"Identity Resolution",icon:Fingerprint },
  { l:"Topology Resolution",icon:Network },
  { l:"Validation",         icon:Shield },
  { l:"Confidence",         icon:Gauge },
  { l:"Versioning",         icon:GitBranch },
  { l:"Derived Record",     icon:Layers },
  { l:"Operational Platform", icon:Boxes },
];

/* ---------- helpers ---------- */
function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(" ");
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-7"><polyline points={pts} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" /></svg>;
}
function Donut({ segs, center, size = 160 }: { segs: { label: string; value: number; color: string }[]; center: string; size?: number }) {
  const total = segs.reduce((s, x) => s + x.value, 0) || 1;
  let off = 0; const R = 44, C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 120 120" style={{ width: size, height: size }}>
      <circle cx="60" cy="60" r={R} fill="none" stroke="#f1f5f9" strokeWidth="14" />
      {segs.map((s, i) => {
        const len = (s.value / total) * C;
        const el = <circle key={i} cx="60" cy="60" r={R} fill="none" stroke={s.color} strokeWidth="14" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform="rotate(-90 60 60)" />;
        off += len; return el;
      })}
      <text x="60" y="58" textAnchor="middle" className="fill-slate-900" fontSize="16" fontWeight="700">{center}</text>
      <text x="60" y="72" textAnchor="middle" className="fill-slate-500" fontSize="9">Overall</text>
    </svg>
  );
}
function methodBadge(m: Field["method"]) {
  if (m === "raw") return { color: "#64748b", bg: "bg-slate-100", text: "text-slate-600", label: "Raw Log" };
  const meta = METHODS.find((x) => x.key === m)!;
  return { color: meta.color, bg: `bg-[${meta.color}]/10`, text: "text-slate-800", label: meta.badge };
}

/* ---------- component ---------- */
export default function HydratedRecordBuilder() {
  const [tick, setTick] = useState(0);
  const [drawer, setDrawer] = useState<{ title: string; kind: string; data?: any } | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showBefore, setShowBefore] = useState(true);

  // Simulation state
  const [simMissing, setSimMissing] = useState(9);
  const [simConfThreshold, setSimConfThreshold] = useState(85);
  const [simLatency, setSimLatency] = useState(500);
  const [simRelAvail, setSimRelAvail] = useState(85);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => (n + 1) % 1000), 900);
    return () => clearInterval(t);
  }, []);

  const activeStage = tick % CONSTRUCTION_PIPELINE.length;

  const summaryMetrics = useMemo(() => ({
    methodsUsed: "6 / 6",
    fieldsAdded: DERIVED_FIELDS.filter((f) => !f.raw).length,
    lookups: 4, rules: 2, correlations: 3, relationships: 5, topology: 3,
    confidence: 0.94,
    processing: "1.8s",
  }), []);

  const confSegs = [
    { label:"Raw Fields",  value:45, color:"#3b82f6" },
    { label:"Lookup",      value:25, color:"#10b981" },
    { label:"Correlation", value:15, color:"#f59e0b" },
    { label:"Rules",       value:10, color:"#f43f5e" },
    { label:"Topology",    value:3,  color:"#14b8a6" },
    { label:"Validation",  value:2,  color:"#8b5cf6" },
  ];

  const openField = (f: Field) => { setSelectedField(f.field); setDrawer({ title: f.field, kind: "field", data: f }); };

  return (
    <div className="px-6 py-5 space-y-5 max-w-[1920px] mx-auto bg-white">
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-violet-600">
            <Sparkles className="h-3.5 w-3.5" /> Hydration & Lineage · Record Builder
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Hydrated Record Builder</h1>
            <span className="px-2 py-0.5 rounded-md bg-violet-50 border border-violet-200 text-[11px] font-semibold text-violet-700">Example: Firewall Traffic Log</span>
          </div>
          <p className="text-sm text-slate-600 mt-1 max-w-4xl">
            Transform raw operational telemetry into trusted, enriched, observable operational records.
          </p>
          <p className="text-[12px] text-slate-500 mt-1 max-w-4xl leading-relaxed">
            The Record Builder creates immutable, versioned operational records by combining raw telemetry with trusted enrichment sources
            while preserving complete lineage and confidence — raw logs are never overwritten.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 mr-2 text-right leading-tight">
            <div>Last Updated</div>
            <div className="font-semibold text-slate-700 tabular-nums">May 12, 2026 · 10:32 AM</div>
          </div>
          <select className="h-9 px-2 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50">
            <option>Record: 6f3e2b90-4d25</option>
            <option>Record: 8a91b0cf-77e2</option>
            <option>Record: 4c11ee98-3f0a</option>
          </select>
          <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><Play className="h-3.5 w-3.5" /> Replay Build</button>
          <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Method Library</button>
          <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"><FlaskConical className="h-3.5 w-3.5" /> Simulation</button>
          <button className="h-9 px-3 rounded-lg bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 inline-flex items-center gap-1.5 shadow-sm"><Download className="h-3.5 w-3.5" /> Export Record</button>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-4 xl:grid-cols-8 gap-3">
        {KPIS.map((k) => {
          const t = tone[k.tone];
          return (
            <button key={k.label} onClick={() => setDrawer({ title: k.label, kind: "kpi" })}
              className="text-left bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between">
                <div className={`h-8 w-8 rounded-lg ${t.bg} grid place-items-center`}><k.icon className={`h-4 w-4 ${t.text}`} /></div>
                <span className="text-[10px] font-semibold text-emerald-600">{k.delta.startsWith("-") ? "▼" : "▲"} {k.delta}</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mt-2">{k.label}</div>
              <div className="text-[22px] font-bold text-slate-900 leading-tight tabular-nums">{k.value}</div>
              <div className="text-[10px] text-slate-500">{k.sub}</div>
              <Spark data={k.spark} color={t.hex} />
            </button>
          );
        })}
      </section>

      {/* Primary Workspace: three-column */}
      <section className="grid grid-cols-12 gap-4">
        {/* Column 1 - Raw */}
        <div className="col-span-12 xl:col-span-3 bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[11px] font-mono text-slate-400">01</div>
          <div className="text-[14px] font-bold text-slate-900">Raw Record (Untouched)</div>
          <div className="text-[11px] text-slate-500">As received from source</div>

          <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">Raw Log</div>
              <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-full px-2 py-0.5 inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Immutable</span>
            </div>
            <div className="text-[10px] text-violet-600 font-semibold mb-1">Source: XSIAM — NGFW Traffic Logs</div>
            <pre className="text-[10.5px] leading-relaxed text-slate-700 font-mono whitespace-pre-wrap">{RAW_JSON}</pre>
          </div>

          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5"><ScanSearch className="h-3.5 w-3.5" /> Missing Context</div>
            <ul className="text-[11px] text-amber-900 mt-1 space-y-0.5 list-disc pl-4">
              <li>Device identity, Site, Interface</li>
              <li>User, Application, Rule Name</li>
              <li>Tunnel, DNS, Topology, Owner</li>
              <li>Confidence, Lineage</li>
            </ul>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px]">
            <Info l="Source ID" v="XSIAM-01" />
            <Info l="Schema"    v="ngfw.v3" />
            <Info l="Checksum"  v="a1b2…c3d4" />
            <Info l="Version"   v="raw:v1" />
          </div>
        </div>

        {/* Column 2 - Pipeline */}
        <div className="col-span-12 xl:col-span-5 bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-slate-400">02</div>
              <div className="text-[14px] font-bold text-slate-900">Hydration & Enrichment</div>
              <div className="text-[11px] text-slate-500">Data is enriched using trusted methods</div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live orchestration
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            {METHODS.map((m, i) => {
              const t = tone[m.tone]; const active = (tick + i) % 9 < 3;
              return (
                <button key={m.key} onClick={() => setDrawer({ title: m.label, kind: "method", data: m })}
                  className={`w-full text-left rounded-lg border p-2.5 transition-all ${active ? `${t.border} ${t.bg} shadow-sm scale-[1.005]` : "border-slate-200 bg-white hover:border-slate-300"}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-lg ${t.bg} grid place-items-center shrink-0`}><m.icon className={`h-4 w-4 ${t.text}`} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold text-slate-900">{m.label}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-3 mt-0.5 tabular-nums">
                        <span>Success <b className="text-slate-800">{m.success}%</b></span>
                        <span>Lat <b className="text-slate-800">{m.latency}</b></span>
                        <span>Conf <b className="text-slate-800">{m.conf.toFixed(2)}</b></span>
                        <span>{m.rps} rps</span>
                      </div>
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-600 shrink-0 inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Success
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Engineering Summary */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[12px] font-bold text-slate-900 mb-2">Enrichment Summary</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                ["Methods", summaryMetrics.methodsUsed],
                ["Fields Added", summaryMetrics.fieldsAdded.toString()],
                ["Lookups", summaryMetrics.lookups.toString()],
                ["Correlations", summaryMetrics.correlations.toString()],
                ["Rules", summaryMetrics.rules.toString()],
                ["Relationships", summaryMetrics.relationships.toString()],
                ["Processing", summaryMetrics.processing],
                ["Confidence", summaryMetrics.confidence.toFixed(2)],
              ].map(([l, v]) => (
                <div key={l as string} className="rounded-lg border border-slate-200 p-2">
                  <div className="text-[9.5px] uppercase text-slate-500 font-semibold">{l}</div>
                  <div className="text-[14px] font-bold text-slate-900 tabular-nums">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3 - Derived */}
        <div className="col-span-12 xl:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[11px] font-mono text-slate-400">03</div>
          <div className="text-[14px] font-bold text-slate-900">Trusted Enriched Record (New)</div>
          <div className="text-[11px] text-slate-500">Derived record with added context & lineage</div>

          <div className="mt-3 rounded-lg border border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white p-2">
            <div className="text-[10px] text-emerald-800 font-semibold mb-1 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Hydrated Enriched Record</div>
            <div className="text-[10px] text-slate-500 font-mono">Derived ID: 6f3e2b90-4d25-4e31-9b2a-7f5e8c1d9b77</div>
          </div>

          <div className="mt-2 max-h-[520px] overflow-y-auto pr-1">
            <table className="w-full text-[10.5px]">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-left text-[9.5px] uppercase text-slate-500 border-b border-slate-200">
                  <th className="py-1.5 pr-2 font-semibold">Field</th>
                  <th className="py-1.5 pr-2 font-semibold">Value</th>
                  <th className="py-1.5 pr-2 font-semibold">Method</th>
                  <th className="py-1.5 pr-2 font-semibold text-right">Conf</th>
                </tr>
              </thead>
              <tbody>
                {DERIVED_FIELDS.map((f, i) => {
                  const b = methodBadge(f.method);
                  const glow = !f.raw && (tick + i) % 8 === 0;
                  const sel = selectedField === f.field;
                  return (
                    <tr key={f.field}
                        onClick={() => openField(f)}
                        className={`border-b border-slate-100 cursor-pointer transition ${sel ? "bg-blue-50" : glow ? "bg-emerald-50/40" : "hover:bg-slate-50"}`}>
                      <td className="py-1.5 pr-2 font-mono font-semibold text-slate-800">{f.field}</td>
                      <td className="py-1.5 pr-2 text-slate-700 truncate max-w-[140px]">{f.value}</td>
                      <td className="py-1.5 pr-2">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-semibold" style={{ background: `${b.color}18`, color: b.color }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: b.color }} />
                          {b.label}
                        </span>
                      </td>
                      <td className="py-1.5 pr-2 text-right tabular-nums font-semibold text-slate-800">{f.conf.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-[11px] text-emerald-800 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span><b>New derived record created.</b> Raw log is preserved and never overwritten.</span>
          </div>
        </div>
      </section>

      {/* Right intelligence + method effectiveness row */}
      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[14px] font-bold text-slate-900 mb-3">Lineage & Provenance</div>
          <div className="relative pl-4">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-slate-200" />
            {LINEAGE.map((s, i) => {
              const t = tone[s.tone]; const active = i <= (tick % LINEAGE.length);
              return (
                <div key={s.l} className="relative mb-2 last:mb-0">
                  <div className={`absolute -left-4 top-1 h-3 w-3 rounded-full border-2 ${active ? `${t.border}` : "border-slate-300"}`} style={{ background: active ? t.hex : "white" }} />
                  <div className="flex items-center justify-between">
                    <div className={`text-[12px] font-semibold ${active ? "text-slate-900" : "text-slate-500"}`}>{s.l}</div>
                    <div className="text-[10px] text-slate-500 tabular-nums">May 12, {s.ts}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[14px] font-bold text-slate-900 mb-1">Confidence Breakdown</div>
          <div className="text-[11px] text-slate-500 mb-2">Weighted contribution to final score</div>
          <div className="flex items-center gap-3">
            <Donut segs={confSegs} center="0.94" />
            <div className="space-y-1 text-[10.5px] flex-1">
              {confSegs.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: s.color }} /><span className="text-slate-700">{s.label}</span></span>
                  <span className="tabular-nums font-semibold text-slate-900">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[14px] font-bold text-slate-900 mb-3">Operational Impact</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { l:"Dashboards",    v:"23", i:Boxes,      tn:"blue"    as Tone },
              { l:"AI Models",     v:"11", i:BrainCircuit,tn:"violet"  as Tone },
              { l:"Automation",    v:"7",  i:Wand2,      tn:"emerald" as Tone },
              { l:"Graph Nodes",   v:"14", i:Network,    tn:"teal"    as Tone },
              { l:"Relationships", v:"38", i:Link2,      tn:"cyan"    as Tone },
              { l:"Consumers",     v:"38", i:Users,      tn:"rose"    as Tone },
              { l:"Use Cases",     v:"12", i:Package,    tn:"amber"   as Tone },
              { l:"Detections",    v:"12", i:Shield,     tn:"slate"   as Tone },
            ].map((c) => {
              const t = tone[c.tn];
              return (
                <button key={c.l} onClick={() => setDrawer({ title: c.l, kind: "impact" })}
                  className={`text-left rounded-lg border ${t.border} ${t.bg} p-2 hover:shadow-sm transition`}>
                  <div className="flex items-center gap-2">
                    <c.i className={`h-3.5 w-3.5 ${t.text}`} />
                    <span className="text-[10px] uppercase font-semibold text-slate-600">{c.l}</span>
                  </div>
                  <div className="text-[16px] font-bold text-slate-900 tabular-nums mt-1">{c.v}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Engineering Transparency Zone */}
      <section className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 p-5 space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-600">Engineering Transparency</div>
            <h2 className="text-[22px] font-bold tracking-tight text-slate-900">How the Record Builder Engineers Trusted Operational Records</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Deterministic. Reversible. Every derived field explainable to source, method, and confidence.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live engine
          </div>
        </div>

        {/* Construction Pipeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Workflow className="h-4 w-4 text-violet-500" /> Record Construction Pipeline</div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {CONSTRUCTION_PIPELINE.map((s, i) => {
              const active = i === activeStage;
              return (
                <>
                  <button key={s.l} onClick={() => setDrawer({ title: s.l, kind: "stage" })}
                    className={`shrink-0 rounded-lg border p-2 w-[132px] text-left transition-all ${active ? "border-violet-400 bg-violet-50 shadow-md scale-[1.03]" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-6 w-6 rounded-md grid place-items-center ${active ? "bg-violet-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <s.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">S{String(i + 1).padStart(2, "0")}</div>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 mt-1.5 leading-tight">{s.l}</div>
                  </button>
                  {i < CONSTRUCTION_PIPELINE.length - 1 && <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />}
                </>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Enrichment Decision Engine */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-blue-500" /> Enrichment Decision Engine</div>
            <div className="space-y-1">
              {[
                { l:"Missing Fields",       tn:"amber"   as Tone, icon:ScanSearch },
                { l:"Available Sources",    tn:"blue"    as Tone, icon:Database },
                { l:"Relationship Graph",   tn:"teal"    as Tone, icon:Network },
                { l:"Priority Rules",       tn:"violet"  as Tone, icon:FileCode },
                { l:"Confidence Model",     tn:"emerald" as Tone, icon:Gauge },
                { l:"Source Ranking",       tn:"cyan"    as Tone, icon:TrendingUp },
                { l:"Best Method Selected", tn:"blue"    as Tone, icon:Wand2 },
                { l:"Execute",              tn:"emerald" as Tone, icon:Zap },
                { l:"Validate",             tn:"emerald" as Tone, icon:Shield },
                { l:"Publish",              tn:"teal"    as Tone, icon:CheckCircle2 },
              ].map((s, i) => {
                const t = tone[s.tn]; const active = (tick + i) % 10 < 3;
                return (
                  <div key={s.l} className={`flex items-center gap-2 rounded-md border p-1.5 transition ${active ? `${t.border} ${t.bg} shadow-sm` : "border-slate-100"}`}>
                    <div className={`h-6 w-6 rounded-md ${t.bg} grid place-items-center`}><s.icon className={`h-3 w-3 ${t.text}`} /></div>
                    <div className="text-[11px] font-semibold text-slate-800 flex-1">{s.l}</div>
                    {active && <span className="text-[9px] font-mono text-emerald-600">▸ eval</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Before vs After */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2"><Eye className="h-4 w-4 text-emerald-500" /> Before vs After Viewer</div>
              <div className="flex items-center gap-1 text-[10px] rounded-md border border-slate-200 p-0.5">
                <button onClick={() => setShowBefore(true)}  className={`px-2 py-0.5 rounded ${showBefore  ? "bg-slate-900 text-white" : "text-slate-600"}`}>Before</button>
                <button onClick={() => setShowBefore(false)} className={`px-2 py-0.5 rounded ${!showBefore ? "bg-slate-900 text-white" : "text-slate-600"}`}>After</button>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 h-[300px] overflow-y-auto">
              {showBefore ? (
                <pre className="text-[10px] leading-relaxed text-slate-700 font-mono whitespace-pre-wrap">{RAW_JSON}</pre>
              ) : (
                <div className="space-y-0.5">
                  {DERIVED_FIELDS.map((f, i) => {
                    const b = methodBadge(f.method);
                    return (
                      <div key={f.field} className={`flex items-center gap-2 text-[10.5px] px-1.5 py-1 rounded ${!f.raw ? "bg-emerald-50 border border-emerald-100" : ""}`}>
                        <span className="font-mono font-semibold text-slate-800 w-28 truncate">{f.field}</span>
                        <span className="flex-1 text-slate-700 truncate">{f.value}</span>
                        <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded" style={{ background: `${b.color}18`, color: b.color }}>{b.label}</span>
                        <span className="tabular-nums text-slate-600 text-[10px] w-8 text-right">{f.conf.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              {[["Fields", showBefore ? "13" : "22"],["Confidence", showBefore ? "—" : "0.94"],["Lineage", showBefore ? "—" : "✓"]].map(([l, v]) => (
                <div key={l} className="rounded border border-slate-200 p-1.5"><div className="text-[9px] uppercase text-slate-500 font-semibold">{l}</div><div className="text-[13px] font-bold text-slate-900 tabular-nums">{v}</div></div>
              ))}
            </div>
          </div>

          {/* Provenance Graph */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2"><Network className="h-4 w-4 text-teal-500" /> Provenance Graph</div>
            <ProvenanceGraph tick={tick} onClick={(l) => setDrawer({ title: l, kind: "provenance" })} />
          </div>
        </div>

        {/* Bottom operational widgets */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            { l:"Enrichment History",      v:"11.7M", s:"7-day rolling",   i:GitBranch,    tn:"blue"    as Tone },
            { l:"Top Missing Field",       v:"user",  s:"3.1M events",     i:ScanSearch,   tn:"amber"   as Tone },
            { l:"Most Used Method",        v:"Lookup",s:"41% of hydrations",i:Database,    tn:"emerald" as Tone },
            { l:"Lookup Performance",      v:"120ms", s:"p95 210ms",       i:Clock,        tn:"cyan"    as Tone },
            { l:"Identity Resolution",     v:"93%",   s:"canonical merge", i:Fingerprint,  tn:"violet"  as Tone },
            { l:"Confidence Trend",        v:"0.94",  s:"+0.02 wk",        i:Gauge,        tn:"teal"    as Tone },
          ].map((w) => {
            const t = tone[w.tn];
            return (
              <button key={w.l} onClick={() => setDrawer({ title: w.l, kind: "widget" })}
                className="text-left bg-white rounded-xl border border-slate-200 p-3 hover:shadow-sm transition">
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-lg ${t.bg} grid place-items-center`}><w.i className={`h-3.5 w-3.5 ${t.text}`} /></div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{w.l}</div>
                </div>
                <div className="text-[18px] font-bold text-slate-900 mt-2 tabular-nums leading-tight">{w.v}</div>
                <div className={`text-[10px] font-semibold ${t.text}`}>{w.s}</div>
              </button>
            );
          })}
        </div>

        {/* Why This Matters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-[12px] font-bold text-slate-800 mb-2">Why This Matters</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { icon:CheckCircle2, tn:"blue"    as Tone, t:"Complete Context",   s:"All critical fields populated" },
              { icon:Shield,       tn:"cyan"    as Tone, t:"Trusted & Auditable", s:"Every value has a source" },
              { icon:Lock,         tn:"emerald" as Tone, t:"Preserves Raw Data",  s:"No overwrites, always traceable" },
              { icon:Gauge,        tn:"violet"  as Tone, t:"Higher Confidence",   s:"Supports reliable analytics & AI" },
              { icon:TrendingUp,   tn:"teal"    as Tone, t:"Operational Impact",  s:"Better decisions, faster response" },
            ].map((c) => {
              const t = tone[c.tn];
              return (
                <div key={c.t} className={`rounded-lg border ${t.border} ${t.bg} p-3`}>
                  <div className={`h-7 w-7 rounded-lg bg-white grid place-items-center mb-2`}><c.icon className={`h-4 w-4 ${t.text}`} /></div>
                  <div className="text-[12px] font-bold text-slate-900">{c.t}</div>
                  <div className="text-[10.5px] text-slate-600 mt-0.5">{c.s}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Engineering Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-[580px] sm:max-w-[580px] p-0 overflow-y-auto">
          <SheetHeader className="p-5 border-b border-slate-200 bg-gradient-to-br from-white to-blue-50/40">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">Engineering Drawer</div>
            <SheetTitle className="text-lg">{drawer?.title ?? ""}</SheetTitle>
            <p className="text-[11px] text-slate-500">Every derived field — sourced, scored, versioned, reversible.</p>
          </SheetHeader>
          <Tabs defaultValue="overview" className="p-4">
            <TabsList className="grid grid-cols-5 h-8">
              <TabsTrigger value="overview"    className="text-[11px]">Overview</TabsTrigger>
              <TabsTrigger value="engineering" className="text-[11px]">Engineering</TabsTrigger>
              <TabsTrigger value="telemetry"   className="text-[11px]">Telemetry</TabsTrigger>
              <TabsTrigger value="simulation"  className="text-[11px]">Simulation</TabsTrigger>
              <TabsTrigger value="deps"        className="text-[11px]">Dependencies</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-3">
              {drawer?.kind === "field" && drawer.data && (
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">Field</div>
                  <div className="text-[16px] font-mono font-bold text-slate-900">{drawer.data.field}</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Info l="Derived Value" v={drawer.data.value} />
                    <Info l="Source"        v={drawer.data.source} />
                    <Info l="Method"        v={methodBadge(drawer.data.method).label} />
                    <Info l="Confidence"    v={drawer.data.conf.toFixed(2)} />
                    <Info l="Version"       v={drawer.data.version} />
                    <Info l="Timestamp"     v={`May 12, ${drawer.data.ts}`} />
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Operational Purpose</div>
                <p className="text-[12px] text-slate-700 mt-1">This value exists to give downstream analytics, AI agents, and dashboards trusted, canonical context — while the original event remains immutable and auditable.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Info l="Consumers" v="24 downstream" />
                <Info l="Reversible" v="Yes" />
                <Info l="Owner" v="Data Platform" />
                <Info l="Lineage ID" v="ln-9b2a…" />
              </div>
            </TabsContent>

            <TabsContent value="engineering" className="mt-4 space-y-1.5">
              {["Gap detection","Method selection","Lookup engine","Correlation engine","Rule engine","Identity resolution","Topology resolution","Validation","Confidence model","Versioning","Lineage generation","Publication"].map((s, i) => (
                <div key={s} className={`flex items-center gap-2 rounded-md border p-2 ${(tick + i) % 12 < 3 ? "border-blue-300 bg-blue-50" : "border-slate-200"}`}>
                  <div className="h-6 w-6 rounded bg-blue-100 grid place-items-center text-[10px] font-mono text-blue-700">{i + 1}</div>
                  <div className="text-[12px] text-slate-800 font-medium flex-1">{s}</div>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="telemetry" className="mt-4 grid grid-cols-2 gap-2">
              {[
                ["Processing latency", `${120 + (tick % 20)}ms`],
                ["Lookups/sec",        `${420 + tick * 3}`],
                ["Correlation rate",   `${91 + (tick % 4)}%`],
                ["Cache hits",         `${88 + (tick % 5)}%`],
                ["Queue depth",        `${6 + (tick % 5)}`],
                ["Retries",            `${2 + (tick % 3)}`],
                ["Success rate",       `${92 + (tick % 3)}%`],
                ["Confidence avg",     `0.${900 + (tick % 40)}`],
                ["CPU",                `${42 + (tick % 12)}%`],
                ["Memory",             `${58 + (tick % 8)}%`],
                ["Worker util",        `${71 + (tick % 6)}%`],
                ["Throughput",         `${1.4 + (tick % 3) * 0.1}k/s`],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg border border-slate-200 p-2">
                  <div className="text-[10px] uppercase text-slate-500">{l}</div>
                  <div className="text-[14px] font-bold tabular-nums text-slate-900">{v}</div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="simulation" className="mt-4 space-y-3">
              <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                <Slider l="Missing fields" v={simMissing} min={0} max={22} onChange={setSimMissing} />
                <Slider l="Confidence threshold (%)" v={simConfThreshold} min={50} max={99} onChange={setSimConfThreshold} />
                <Slider l="Lookup latency (ms)" v={simLatency} min={50} max={3000} step={50} onChange={setSimLatency} />
                <Slider l="Relationship availability (%)" v={simRelAvail} min={0} max={100} onChange={setSimRelAvail} />
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-[10px] uppercase font-semibold text-emerald-700">Recomputed Outcome</div>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <Info l="Fields Filled" v={`${22 - simMissing}/22`} />
                  <Info l="Confidence"    v={(Math.min(0.99, 0.6 + (simRelAvail / 400) + (simConfThreshold / 400))).toFixed(2)} />
                  <Info l="Est. Latency"  v={`${(simLatency * 2 / 1000).toFixed(1)}s`} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deps" className="mt-4 space-y-1.5">
              {[
                { l:"CMDB",                i:Boxes },
                { l:"Identity",            i:Fingerprint },
                { l:"DNS",                 i:Search },
                { l:"Knowledge Graph",     i:GitBranch },
                { l:"Cloud Inventory",     i:HardDrive },
                { l:"Topology",            i:Network },
                { l:"Relationship Builder",i:Link2 },
                { l:"Validation Engine",   i:Shield },
                { l:"Hydration Engine",    i:Sparkles },
                { l:"Consumers",           i:Users },
                { l:"Ownership",           i:Lock },
              ].map((d) => (
                <div key={d.l} className="flex items-center gap-2 rounded-md border border-slate-200 p-2 hover:bg-slate-50">
                  <d.i className="h-3.5 w-3.5 text-slate-500" />
                  <div className="text-[12px] text-slate-800 font-medium">{d.l}</div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ---------- small components ---------- */
function Info({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-2 bg-white">
      <div className="text-[9.5px] uppercase text-slate-500 font-semibold">{l}</div>
      <div className="text-[12px] font-bold text-slate-900 truncate">{v}</div>
    </div>
  );
}
function Slider({ l, v, min, max, step = 1, onChange }: { l: string; v: number; min: number; max: number; step?: number; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]"><span className="text-slate-700">{l}</span><span className="tabular-nums font-semibold text-slate-900">{v}</span></div>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => onChange(+e.target.value)} className="w-full h-1 accent-blue-500" />
    </div>
  );
}

function ProvenanceGraph({ tick, onClick }: { tick: number; onClick: (label: string) => void }) {
  const nodes = [
    { l:"Raw Record",     x:150, y:130, c:"#64748b" },
    { l:"CMDB",           x:40,  y:40,  c:"#10b981" },
    { l:"Identity",       x:150, y:20,  c:"#60a5fa" },
    { l:"DNS",            x:260, y:40,  c:"#8b5cf6" },
    { l:"Topology",       x:290, y:130, c:"#14b8a6" },
    { l:"Cloud",          x:260, y:220, c:"#3b82f6" },
    { l:"Asset Inventory",x:150, y:240, c:"#f59e0b" },
    { l:"Relationships",  x:40,  y:220, c:"#06b6d4" },
    { l:"Knowledge Base", x:10,  y:130, c:"#a78bfa" },
  ];
  const center = { x: 150, y: 130 };
  return (
    <svg viewBox="0 0 300 260" className="w-full h-64">
      {nodes.slice(1).map((n, i) => (
        <line key={n.l} x1={center.x} y1={center.y} x2={n.x} y2={n.y} stroke={n.c} strokeWidth="1.5" strokeDasharray="3 3" opacity={((tick + i) % 4) < 2 ? 0.9 : 0.4} />
      ))}
      {nodes.map((n) => (
        <g key={n.l} onClick={() => onClick(n.l)} className="cursor-pointer">
          <circle cx={n.x} cy={n.y} r={n.l === "Raw Record" ? 22 : 14} fill={n.c} opacity={0.15} />
          <circle cx={n.x} cy={n.y} r={n.l === "Raw Record" ? 10 : 7} fill={n.c} />
          <text x={n.x} y={n.y + (n.l === "Raw Record" ? 34 : 24)} textAnchor="middle" fontSize="9" fontWeight="600" className="fill-slate-700">{n.l}</text>
        </g>
      ))}
      <text x={center.x} y={center.y + 2} textAnchor="middle" fontSize="7" fontWeight="700" className="fill-white">DERIVED</text>
    </svg>
  );
}
