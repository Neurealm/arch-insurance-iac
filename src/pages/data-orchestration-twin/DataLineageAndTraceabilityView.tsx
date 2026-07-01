import { useMemo, useState } from "react";
import {
  Activity, ArrowRight, BadgeCheck, Boxes, ChevronRight, Clock, Cpu, Database,
  Download, Eye, FileSearch, Filter, GitBranch, Layers, Link2, Network, Play,
  Radar, RefreshCw, Rewind, Search, Shield, Sparkles, Timer, TrendingUp, X, Zap,
  AlertTriangle, CheckCircle2, Users, GitCommit, Gauge, Workflow, ScrollText,
} from "lucide-react";

/* ---------------- Data ---------------- */

type Tone = "blue" | "emerald" | "amber" | "rose" | "violet" | "teal" | "orange";

const toneMap: Record<Tone, { text: string; bg: string; ring: string; dot: string; soft: string }> = {
  blue:    { text: "text-blue-700",    bg: "bg-blue-50",    ring: "ring-blue-200",    dot: "bg-blue-500",    soft: "bg-blue-100/60" },
  emerald: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500", soft: "bg-emerald-100/60" },
  amber:   { text: "text-amber-700",   bg: "bg-amber-50",   ring: "ring-amber-200",   dot: "bg-amber-500",   soft: "bg-amber-100/60" },
  rose:    { text: "text-rose-700",    bg: "bg-rose-50",    ring: "ring-rose-200",    dot: "bg-rose-500",    soft: "bg-rose-100/60" },
  violet:  { text: "text-violet-700",  bg: "bg-violet-50",  ring: "ring-violet-200",  dot: "bg-violet-500",  soft: "bg-violet-100/60" },
  teal:    { text: "text-teal-700",    bg: "bg-teal-50",    ring: "ring-teal-200",    dot: "bg-teal-500",    soft: "bg-teal-100/60" },
  orange:  { text: "text-orange-700",  bg: "bg-orange-50",  ring: "ring-orange-200",  dot: "bg-orange-500",  soft: "bg-orange-100/60" },
};

const kpis: { label: string; value: string; sub: string; tone: Tone; icon: React.ComponentType<{ className?: string }>; spark: number[]; trend: string }[] = [
  { label: "Enriched Records (7D)",       value: "11.7M",  sub: "94.4% of total",         tone: "emerald", icon: Database,     spark: [4,5,6,7,7,8,9], trend: "+8.2%" },
  { label: "Fields with Complete Lineage",value: "98.6%",  sub: "Target ≥ 95%",           tone: "blue",    icon: GitBranch,    spark: [6,7,7,8,8,9,9], trend: "+0.9%" },
  { label: "Avg Lineage Depth",           value: "4.2",    sub: "Hops per field",         tone: "violet",  icon: Layers,       spark: [3,4,4,5,4,4,4], trend: "+0.3" },
  { label: "High Confidence Fields",      value: "91.2%",  sub: "Confidence ≥ 0.90",      tone: "emerald", icon: BadgeCheck,   spark: [7,7,8,8,9,9,9], trend: "+1.4%" },
  { label: "Lineage Coverage",            value: "100%",   sub: "All records",            tone: "teal",    icon: Radar,        spark: [8,9,9,9,10,10,10], trend: "held" },
  { label: "Orphan Fields",               value: "12",     sub: "0.14% of fields",        tone: "rose",    icon: AlertTriangle,spark: [5,4,4,3,3,2,2], trend: "-38%" },
  { label: "Lineage Queries (7D)",        value: "3,842",  sub: "+21.6% vs prior",        tone: "blue",    icon: FileSearch,   spark: [3,4,5,5,6,7,8], trend: "+21.6%" },
  { label: "Provenance Integrity",        value: "99.4%",  sub: "Checksum verified",      tone: "emerald", icon: Shield,       spark: [9,9,9,10,10,10,10], trend: "+0.2%" },
];

type StepType = "Original Source" | "Adjacent Log" | "Synthetic Query" | "Synthetic Transaction" | "Transformation Rule" | "Validation" | "Hydration" | "Graph Projection" | "Consumer";
type LineageNode = {
  id: string; step: number; type: StepType; title: string; subtitle: string;
  fields: string[]; ts: string; confidence: number; owner: string; latencyMs: number; version: string; tone: Tone;
};

const lineage: LineageNode[] = [
  { id: "n1", step: 1, type: "Original Source",       title: "Raw Log",              subtitle: "XSIAM — NGFW Traffic Logs", fields: ["device_serial", "log_type", "src_ip"],       ts: "10:15:22.104", confidence: 1.00, owner: "Ingestion",         latencyMs: 12, version: "v1.0", tone: "violet" },
  { id: "n2", step: 2, type: "Adjacent Log",          title: "Device Inventory Log", subtitle: "Source: Device Inventory",  fields: ["serial_number", "hostname"],                 ts: "10:15:22.187", confidence: 0.98, owner: "NetOps",           latencyMs: 24, version: "v2.3", tone: "blue" },
  { id: "n3", step: 3, type: "Synthetic Query",       title: "CMDB Lookup",          subtitle: "Query: Get Device Details", fields: ["device_name", "site_name", "owner"],         ts: "10:15:22.412", confidence: 0.93, owner: "Data Platform",    latencyMs: 118, version: "v4.1", tone: "blue" },
  { id: "n4", step: 4, type: "Transformation Rule",   title: "Normalization Rule",   subtitle: "Trim, alias, case standardize", fields: ["device_name → canonical"],              ts: "10:15:22.501", confidence: 1.00, owner: "Data Platform",    latencyMs: 7,  version: "v1.7", tone: "orange" },
  { id: "n5", step: 5, type: "Validation",            title: "SME Validation",       subtitle: "NetOps Review",             fields: ["device_name"],                                ts: "10:16:05.802", confidence: 1.08, owner: "NetOps SME",       latencyMs: 42, version: "v1.0", tone: "emerald" },
  { id: "n6", step: 6, type: "Hydration",             title: "Hydrate Derived",      subtitle: "Assemble derived record",   fields: ["risk_score", "topology_id"],                 ts: "10:16:06.014", confidence: 0.96, owner: "Hydration Svc",    latencyMs: 33, version: "v2.9", tone: "teal" },
  { id: "n7", step: 7, type: "Graph Projection",      title: "Knowledge Graph",      subtitle: "Project into graph nodes",  fields: ["Device → Site → Owner"],                     ts: "10:16:06.204", confidence: 0.97, owner: "Graph Platform",   latencyMs: 26, version: "v3.0", tone: "teal" },
  { id: "n8", step: 8, type: "Consumer",              title: "Operational Consumers",subtitle: "Dashboards · AI · Automation", fields: ["device_name"],                             ts: "10:16:06.312", confidence: 0.98, owner: "Downstream",       latencyMs: 8,  version: "live", tone: "emerald" },
];

const provenanceBreakdown = [
  { label: "Original Source",  pct: 45, tone: "violet" as Tone },
  { label: "Adjacent Logs",    pct: 20, tone: "blue"   as Tone },
  { label: "Synthetic Query",  pct: 15, tone: "blue"   as Tone },
  { label: "Transformation",   pct: 10, tone: "orange" as Tone },
  { label: "Synthetic Txn",    pct:  5, tone: "teal"   as Tone },
  { label: "SME Validation",   pct:  5, tone: "emerald"as Tone },
];

const impactMatrix = {
  upstreamSources: 3, upstreamFields: 5, affectedEnriched: 12, affectedDashboards: 7,
  aiModels: 7, automations: 4, workflows: 9, riskIfBroken: "Low", redundant: true,
};

const graphEdges: [string, string][] = [
  ["Derived Record", "Raw Record"],
  ["Derived Record", "CMDB"],
  ["Derived Record", "DNS"],
  ["Derived Record", "Identity"],
  ["Derived Record", "Topology"],
  ["Derived Record", "Cloud"],
  ["Derived Record", "Knowledge Graph"],
  ["Derived Record", "Policies"],
  ["Derived Record", "Dashboards"],
  ["Derived Record", "AI Models"],
  ["Derived Record", "Automation"],
];

const pipelineStages = [
  "Raw Source", "Metadata Capture", "Transformation", "Hydration", "Validation",
  "Relationship Builder", "Confidence Calc", "Lineage Graph", "Version Engine", "Operational Record",
];

/* ---------------- Small UI ---------------- */

function Sparkline({ values, tone }: { values: number[]; tone: Tone }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 90, h = 24;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / Math.max(1, max - min)) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" strokeWidth={1.5} className={toneMap[tone].text} stroke="currentColor" />
    </svg>
  );
}

function StepBadge({ type }: { type: StepType }) {
  const map: Record<StepType, Tone> = {
    "Original Source": "violet",
    "Adjacent Log": "blue",
    "Synthetic Query": "blue",
    "Synthetic Transaction": "teal",
    "Transformation Rule": "orange",
    "Validation": "emerald",
    "Hydration": "teal",
    "Graph Projection": "teal",
    "Consumer": "emerald",
  };
  const t = toneMap[map[type]];
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${t.bg} ${t.text}`}>{type}</span>;
}

/* ---------------- Page ---------------- */

export default function DataLineageAndTraceabilityView() {
  const [selected, setSelected] = useState<LineageNode | null>(null);
  const [drawerTab, setDrawerTab] = useState<"overview" | "engineering" | "telemetry" | "replay" | "dependencies">("overview");
  const [replayStep, setReplayStep] = useState(lineage.length);
  const [simConfidence, setSimConfidence] = useState(0.92);
  const [simLatency, setSimLatency] = useState(120);
  const [query, setQuery] = useState("");

  const donutTotal = 100;
  const donut = useMemo(() => {
    let acc = 0;
    return provenanceBreakdown.map(seg => {
      const start = acc; acc += seg.pct;
      return { ...seg, start, end: acc };
    });
  }, []);

  const filteredSteps = useMemo(
    () => lineage.filter(n => (n.title + n.subtitle + n.owner + n.type).toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const openDrawer = (n: LineageNode) => { setSelected(n); setDrawerTab("overview"); };

  return (
    <div className="p-6 space-y-6 bg-white">
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Data Lineage &amp; Traceability View</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold ring-1 ring-emerald-200">
              <Shield className="h-3 w-3" /> Trust Proof
            </span>
          </div>
          <p className="mt-1 text-slate-600 text-sm max-w-3xl">
            Complete engineering provenance for every operational record, relationship, transformation, and confidence score.
          </p>
          <p className="mt-1 text-slate-500 text-xs max-w-3xl">
            Every field is fully traceable from raw source through enrichment, validation, canonical modeling, graph projection, and downstream operational consumption.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 mr-1">Last Updated <span className="text-slate-800 font-medium">May 12, 2026 10:32 AM</span></div>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"><Search className="h-3.5 w-3.5"/>Lineage Search</button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"><Clock className="h-3.5 w-3.5"/>7D</button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"><Rewind className="h-3.5 w-3.5"/>Replay</button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-indigo-600 text-white text-xs hover:bg-indigo-700"><Download className="h-3.5 w-3.5"/>Export Lineage</button>
        </div>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map((k) => {
          const t = toneMap[k.tone];
          const Icon = k.icon;
          return (
            <button
              key={k.label}
              onClick={() => openDrawer(lineage[0])}
              className="group text-left rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="flex items-start justify-between">
                <div className={`h-8 w-8 rounded-lg grid place-items-center ${t.bg} ${t.text}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <Sparkline values={k.spark} tone={k.tone} />
              </div>
              <div className="mt-2 text-[11px] text-slate-500 leading-tight">{k.label}</div>
              <div className="mt-0.5 text-xl font-bold text-slate-900 tabular-nums">{k.value}</div>
              <div className={`mt-0.5 text-[10px] font-medium ${t.text}`}>{k.sub} · {k.trend}</div>
            </button>
          );
        })}
      </section>

      {/* Primary workspace: Lineage graph + right rail */}
      <section className="grid grid-cols-12 gap-4">
        {/* Selected field + lineage graph */}
        <div className="col-span-12 xl:col-span-9 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Selected Enriched Field</div>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-2xl font-bold text-slate-900 font-mono">device_name</h2>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">High Confidence · 1.08</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Record ID: <span className="font-mono text-slate-700">0f3e2b90-4d25-4e31-9b2a-7f5e8c1d9b77</span>
                  <span className="mx-2">·</span>
                  Event Time: <span className="font-mono text-slate-700">2026-05-12T10:15:22Z</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search lineage step..." className="pl-7 pr-2 py-1.5 text-xs rounded-md border border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 outline-none w-56" />
                </div>
                <button className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"><Filter className="h-3.5 w-3.5"/>Filter</button>
              </div>
            </div>

            {/* Lineage graph */}
            <div className="mt-4 rounded-lg bg-gradient-to-b from-slate-50 to-white ring-1 ring-slate-100 p-4 overflow-x-auto">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-3">Lineage Graph (End-to-End)</div>
              <div className="flex items-stretch gap-2 min-w-[1200px]">
                {lineage.map((n, i) => {
                  const t = toneMap[n.tone];
                  return (
                    <div key={n.id} className="flex items-stretch">
                      <button
                        onClick={() => openDrawer(n)}
                        className={`w-[150px] text-left rounded-lg p-3 ring-1 ${t.ring} ${t.bg} hover:shadow-md hover:-translate-y-0.5 transition relative overflow-hidden`}
                      >
                        <div className={`absolute inset-x-0 top-0 h-0.5 ${t.dot}`} />
                        <div className={`text-[10px] font-bold ${t.text}`}>{n.step}. {n.type}</div>
                        <div className="text-sm font-semibold text-slate-900 leading-tight mt-1">{n.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{n.subtitle}</div>
                        <ul className="mt-2 space-y-0.5">
                          {n.fields.slice(0, 3).map(f => (
                            <li key={f} className="text-[10px] text-slate-700 font-mono truncate">· {f}</li>
                          ))}
                        </ul>
                        <div className="mt-2 pt-2 border-t border-white/60 flex items-center justify-between text-[10px] text-slate-600">
                          <span>{n.ts}</span>
                          <span className="font-semibold">c={n.confidence.toFixed(2)}</span>
                        </div>
                      </button>
                      {i < lineage.length - 1 && (
                        <div className="flex items-center px-1 relative">
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                          <span className="absolute h-1 w-1 rounded-full bg-indigo-500 animate-ping" style={{ left: 4 }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
                {(["Original Source","Adjacent Log","Synthetic Query","Synthetic Transaction","Transformation Rule","Validation"] as StepType[]).map(s => (
                  <span key={s} className="inline-flex items-center gap-1"><StepBadge type={s}/></span>
                ))}
                <span className="inline-flex items-center gap-1 text-slate-500"><ArrowRight className="h-3 w-3"/>Data Flow</span>
                <span className="inline-flex items-center gap-1 text-slate-500"><Link2 className="h-3 w-3"/>Lookup/Reference</span>
              </div>
            </div>
          </div>

          {/* Step registry */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-semibold text-slate-900">Lineage Step Registry</div>
                <div className="text-[11px] text-slate-500">Every engineering transformation, versioned and owner-attributed</div>
              </div>
              <div className="text-[11px] text-slate-500">{filteredSteps.length} of {lineage.length} steps</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Type</th>
                    <th className="py-2 pr-2">Source / Rule</th>
                    <th className="py-2 pr-2">Fields</th>
                    <th className="py-2 pr-2">Timestamp</th>
                    <th className="py-2 pr-2 text-right">Confidence</th>
                    <th className="py-2 pr-2">Owner</th>
                    <th className="py-2 pr-2">Version</th>
                    <th className="py-2 pr-2 text-right">Latency</th>
                    <th className="py-2 pr-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSteps.map(n => (
                    <tr key={n.id} onClick={() => openDrawer(n)} className="border-b border-slate-100 hover:bg-slate-50/60 cursor-pointer">
                      <td className="py-2 pr-2 text-slate-500 tabular-nums">{n.step}</td>
                      <td className="py-2 pr-2"><StepBadge type={n.type} /></td>
                      <td className="py-2 pr-2 text-slate-800">{n.subtitle}</td>
                      <td className="py-2 pr-2 font-mono text-[11px] text-slate-700">{n.fields.join(", ")}</td>
                      <td className="py-2 pr-2 text-slate-600 tabular-nums">{n.ts}</td>
                      <td className="py-2 pr-2 text-right font-semibold text-slate-900 tabular-nums">{n.confidence.toFixed(2)}</td>
                      <td className="py-2 pr-2 text-slate-700">{n.owner}</td>
                      <td className="py-2 pr-2 text-slate-500 font-mono text-[11px]">{n.version}</td>
                      <td className="py-2 pr-2 text-right text-slate-600 tabular-nums">{n.latencyMs}ms</td>
                      <td className="py-2 pr-2 text-right"><span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5"/>OK</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Impact panel */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Upstream Sources", value: impactMatrix.upstreamSources, icon: Database, tone: "violet" as Tone },
              { label: "Upstream Fields", value: impactMatrix.upstreamFields, icon: Layers, tone: "blue" as Tone },
              { label: "Affected Enriched Fields", value: impactMatrix.affectedEnriched, icon: Sparkles, tone: "teal" as Tone },
              { label: "Affected Dashboards", value: impactMatrix.affectedDashboards, icon: Activity, tone: "emerald" as Tone },
              { label: "AI Models", value: impactMatrix.aiModels, icon: Cpu, tone: "blue" as Tone },
              { label: "Automations", value: impactMatrix.automations, icon: Zap, tone: "amber" as Tone },
              { label: "Workflows", value: impactMatrix.workflows, icon: Workflow, tone: "violet" as Tone },
              { label: "Risk if Broken", value: impactMatrix.riskIfBroken, icon: Shield, tone: "emerald" as Tone },
            ].map(x => {
              const t = toneMap[x.tone];
              const Icon = x.icon;
              return (
                <div key={x.label} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-md grid place-items-center ${t.bg} ${t.text}`}><Icon className="h-3.5 w-3.5"/></div>
                    <div className="text-[11px] text-slate-500">{x.label}</div>
                  </div>
                  <div className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{x.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right rail */}
        <aside className="col-span-12 xl:col-span-3 space-y-4">
          {/* Field lineage summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Field Lineage Details</div>
            <dl className="mt-3 space-y-2 text-[12px]">
              {[
                ["Field Name", "device_name"],
                ["Canonical Field", "device.name"],
                ["Enriched Value", "NGFW-DC-01"],
                ["Final Confidence", "1.08 High"],
                ["Lineage Depth", "5 Hops"],
                ["First Seen", "May 10, 08:12 AM"],
                ["Last Updated", "May 12, 10:15 AM"],
                ["Owner", "NetOps Data Engineering"],
                ["Steward", "Alex Brown"],
                ["Business Meaning", "Firewall device hostname"],
                ["Usage (7D)", "8.7M records (74.4%)"],
                ["Downstream Assets", "23 Dashboards · 12 Alerts · 7 ML"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-3">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-slate-800 text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Provenance donut */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Provenance Breakdown</div>
            <div className="mt-3 flex items-center gap-4">
              <svg viewBox="0 0 42 42" className="h-28 w-28 -rotate-90">
                <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                {donut.map(seg => {
                  const t = toneMap[seg.tone];
                  const dash = `${seg.pct} ${donutTotal - seg.pct}`;
                  const offset = 100 - seg.start;
                  return (
                    <circle
                      key={seg.label}
                      cx="21" cy="21" r="15.9" fill="transparent"
                      strokeWidth="6"
                      stroke="currentColor"
                      className={t.text}
                      strokeDasharray={dash}
                      strokeDashoffset={offset}
                    />
                  );
                })}
              </svg>
              <ul className="flex-1 space-y-1 text-[11px]">
                {provenanceBreakdown.map(seg => (
                  <li key={seg.label} className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-slate-700">
                      <span className={`h-2 w-2 rounded-full ${toneMap[seg.tone].dot}`} />
                      {seg.label}
                    </span>
                    <span className="text-slate-500 tabular-nums font-medium">{seg.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Lineage health */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Lineage Health (7D)</div>
              <Gauge className="h-4 w-4 text-slate-400"/>
            </div>
            <ul className="mt-3 space-y-2 text-[11px]">
              {[
                { label: "Complete Lineage", pct: 98.6, tone: "emerald" as Tone },
                { label: "Trusted Sources",  pct: 97.1, tone: "emerald" as Tone },
                { label: "High Confidence (≥0.90)", pct: 91.2, tone: "emerald" as Tone },
                { label: "Medium Confidence (0.70-0.90)", pct: 7.6, tone: "amber" as Tone },
                { label: "Low Confidence (<0.70)", pct: 1.2, tone: "rose" as Tone },
              ].map(x => (
                <li key={x.label}>
                  <div className="flex justify-between text-slate-600"><span>{x.label}</span><span className="tabular-nums font-medium">{x.pct}%</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${toneMap[x.tone].dot}`} style={{ width: `${Math.min(100, x.pct)}%` }}/>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      {/* Engineering Transparency Zone */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">How the Lineage Engine Builds Trust</div>
            <div className="text-[11px] text-slate-500">Engineering services behind complete provenance, integrity, and replayability</div>
          </div>
          <div className="text-[11px] text-slate-500">Lower 40% · Engineering Transparency</div>
        </div>

        {/* Pipeline */}
        <div className="mt-4 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-[1200px]">
            {pipelineStages.map((s, i) => (
              <div key={s} className="flex items-center">
                <button onClick={() => openDrawer(lineage[Math.min(i, lineage.length-1)])} className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-indigo-300 hover:shadow-sm transition text-left w-[140px]">
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

        {/* Split: Replay + Provenance Matrix + Graph */}
        <div className="mt-4 grid grid-cols-12 gap-4">
          {/* Replay */}
          <div className="col-span-12 lg:col-span-5 rounded-lg bg-slate-950 text-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold flex items-center gap-2"><Rewind className="h-4 w-4"/>Engineering Trace Replay</div>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-white/10"><Rewind className="h-3.5 w-3.5"/></button>
                <button onClick={() => setReplayStep(s => Math.min(lineage.length, s+1))} className="p-1 rounded hover:bg-white/10"><Play className="h-3.5 w-3.5"/></button>
                <button className="p-1 rounded hover:bg-white/10"><RefreshCw className="h-3.5 w-3.5"/></button>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400">Replay through {replayStep} / {lineage.length} engineering steps</div>
            <input
              type="range" min={1} max={lineage.length} value={replayStep}
              onChange={e => setReplayStep(parseInt(e.target.value))}
              className="w-full mt-2 accent-indigo-400"
            />
            <ol className="mt-3 space-y-1.5 text-[12px] font-mono">
              {lineage.slice(0, replayStep).map(n => (
                <li key={n.id} className="flex items-center gap-2">
                  <span className="text-slate-500 w-14 tabular-nums">{n.ts.slice(0,8)}</span>
                  <span className="text-emerald-400">▸</span>
                  <span className="text-slate-200">{n.type}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{n.title}</span>
                  <span className="ml-auto text-indigo-300">c={n.confidence.toFixed(2)}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Provenance matrix */}
          <div className="col-span-12 lg:col-span-4 rounded-lg border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-900">Transformation Provenance Matrix</div>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <th className="py-1 pr-2">Transform</th>
                    <th className="py-1 pr-2">Ver</th>
                    <th className="py-1 pr-2 text-right">Conf</th>
                    <th className="py-1 pr-2 text-right">Exec</th>
                  </tr>
                </thead>
                <tbody>
                  {lineage.map(n => (
                    <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => openDrawer(n)}>
                      <td className="py-1 pr-2 text-slate-800">{n.title}</td>
                      <td className="py-1 pr-2 text-slate-500 font-mono">{n.version}</td>
                      <td className="py-1 pr-2 text-right font-semibold tabular-nums">{n.confidence.toFixed(2)}</td>
                      <td className="py-1 pr-2 text-right text-slate-600 tabular-nums">{n.latencyMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Provenance graph */}
          <div className="col-span-12 lg:col-span-3 rounded-lg border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Network className="h-4 w-4"/>Graph Explorer</div>
            <div className="mt-2 relative h-56">
              <svg viewBox="0 0 220 220" className="absolute inset-0 h-full w-full">
                <defs>
                  <radialGradient id="grad" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#eef2ff"/>
                    <stop offset="100%" stopColor="#ffffff"/>
                  </radialGradient>
                </defs>
                <rect width="220" height="220" fill="url(#grad)"/>
                {graphEdges.map(([, to], i) => {
                  const angle = (i / graphEdges.length) * Math.PI * 2;
                  const x = 110 + Math.cos(angle) * 85;
                  const y = 110 + Math.sin(angle) * 85;
                  return (
                    <g key={to}>
                      <line x1={110} y1={110} x2={x} y2={y} stroke="#c7d2fe" strokeWidth={1}>
                        <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="2s" begin={`${i*0.15}s`} repeatCount="indefinite"/>
                      </line>
                      <circle cx={x} cy={y} r={6} className="fill-white" stroke="#6366f1" strokeWidth={1.2}/>
                      <text x={x} y={y - 9} textAnchor="middle" className="fill-slate-600" fontSize="7">{to}</text>
                    </g>
                  );
                })}
                <circle cx={110} cy={110} r={16} className="fill-indigo-600"/>
                <text x={110} y={113} textAnchor="middle" fontSize="7" className="fill-white font-bold">Derived</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom widgets */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: "Lineage Timeline", icon: Timer, items: ["10:15 Record created", "10:15 First enrichment", "10:15 Rule applied", "10:16 SME validated"] },
            { title: "Recent Transformations", icon: GitCommit, items: ["Normalize device_name v1.7", "Resolve topology_id v3.0", "Hydrate risk_score v2.9"] },
            { title: "Confidence Trends (7D)", icon: TrendingUp, items: ["High: 91.2% ↑", "Medium: 7.6% ↓", "Low: 1.2% ↓", "Broken: 0.0%"] },
            { title: "Dependency Map", icon: Boxes, items: ["Sources: 3", "Consumers: 38", "Graph nodes: 412", "Relationships: 1.2k"] },
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

      {/* Why this matters */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: Shield,     title: "Trust & Transparency", sub: "Every field is traceable" },
          { icon: ScrollText, title: "Audit & Compliance",   sub: "Full lineage for audits" },
          { icon: Search,     title: "Faster Root Cause",    sub: "Know the source of truth" },
          { icon: Users,      title: "Change Impact",        sub: "See what will be affected" },
          { icon: BadgeCheck, title: "Higher Confidence",    sub: "Reliable decisions & alerts" },
        ].map(w => (
          <div key={w.title} className="rounded-lg border border-slate-200 p-3 bg-white flex items-start gap-2 hover:shadow-sm transition">
            <div className="h-8 w-8 rounded-md bg-indigo-50 text-indigo-600 grid place-items-center"><w.icon className="h-4 w-4"/></div>
            <div>
              <div className="text-[12px] font-semibold text-slate-900">{w.title}</div>
              <div className="text-[11px] text-slate-500">{w.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Engineering Drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={() => setSelected(null)} />
          <aside className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-50 shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2"><StepBadge type={selected.type}/><span className="text-[11px] text-slate-500 font-mono">{selected.version}</span></div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{selected.title}</div>
                <div className="text-[12px] text-slate-500">{selected.subtitle}</div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-md hover:bg-slate-100"><X className="h-4 w-4"/></button>
            </div>
            <div className="px-4 pt-2 border-b border-slate-200 flex items-center gap-1 text-[12px]">
              {(["overview","engineering","telemetry","replay","dependencies"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setDrawerTab(t)}
                  className={`px-2.5 py-1.5 rounded-t-md capitalize ${drawerTab === t ? "text-indigo-700 border-b-2 border-indigo-600 -mb-px font-semibold" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="p-4 overflow-y-auto text-[12px] text-slate-700 space-y-3">
              {drawerTab === "overview" && (
                <>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">Business Explanation</div>
                    <p className="mt-1">{selected.title} contributes provenance step {selected.step} for <span className="font-mono">device_name</span>. It ensures the enriched value maps back to a trusted origin with recorded confidence, owner, and version.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[["Owner", selected.owner],["Confidence", selected.confidence.toFixed(2)],["Latency", `${selected.latencyMs}ms`],["Version", selected.version]].map(([k,v]) => (
                      <div key={k} className="rounded-md bg-slate-50 p-2">
                        <div className="text-[10px] text-slate-500">{k}</div>
                        <div className="text-slate-900 font-semibold">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">Consumers</div>
                    <ul className="mt-1 space-y-1">
                      <li className="flex items-center gap-1"><ChevronRight className="h-3 w-3 text-slate-400"/>23 Operational Dashboards</li>
                      <li className="flex items-center gap-1"><ChevronRight className="h-3 w-3 text-slate-400"/>7 ML Models (device risk)</li>
                      <li className="flex items-center gap-1"><ChevronRight className="h-3 w-3 text-slate-400"/>12 Alert Policies</li>
                    </ul>
                  </div>
                </>
              )}

              {drawerTab === "engineering" && (
                <div className="space-y-2">
                  {["Metadata capture","Transformation engine","Hydration","Validation","Relationship generation","Canonical model","Confidence","Versioning","Lineage graph","Graph projection","Publication"].map((s, i) => (
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
                    ["Transforms/sec", "18.4k"],["Latency p95", `${selected.latencyMs+34}ms`],["Rule exec/sec","9.1k"],["CPU","32%"],["Memory","4.1GB"],["Queue depth","12"],["Retries","0.02%"],["Confidence avg", selected.confidence.toFixed(2)],["Versions active","3"],["Replay duration","1.2s"],["Errors","0"],["Workers","24"],
                  ].map(([k,v]) => (
                    <div key={k} className="rounded-md bg-slate-50 p-2">
                      <div className="text-[10px] text-slate-500">{k}</div>
                      <div className="text-slate-900 font-semibold tabular-nums">{v}</div>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === "replay" && (
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">Simulation</div>
                  <label className="mt-2 block">
                    <div className="flex justify-between text-[11px]"><span>Confidence threshold</span><span className="tabular-nums">{simConfidence.toFixed(2)}</span></div>
                    <input type="range" min={0.5} max={1} step={0.01} value={simConfidence} onChange={e => setSimConfidence(parseFloat(e.target.value))} className="w-full accent-indigo-600"/>
                  </label>
                  <label className="mt-3 block">
                    <div className="flex justify-between text-[11px]"><span>Lookup latency (ms)</span><span className="tabular-nums">{simLatency}</span></div>
                    <input type="range" min={20} max={500} step={5} value={simLatency} onChange={e => setSimLatency(parseInt(e.target.value))} className="w-full accent-indigo-600"/>
                  </label>
                  <div className="mt-3 rounded-md bg-slate-950 text-slate-100 p-3 text-[11px] font-mono">
                    <div>projected_high_confidence = {(91.2 + (simConfidence - 0.92)* -30).toFixed(1)}%</div>
                    <div>projected_p95_latency = {simLatency + 40}ms</div>
                    <div>projected_orphans = {Math.max(0, Math.round(12 + (0.92 - simConfidence)*60))}</div>
                  </div>
                </div>
              )}

              {drawerTab === "dependencies" && (
                <ul className="space-y-1.5">
                  {["Source Systems (XSIAM, CMDB, DNS)","Hydration Engine v2.9","Canonical Model v4.1","Relationship Builder","Knowledge Graph","AI Models","Dashboards","Automation","Owners: NetOps Data Eng","Business Domain: Network Security","Risk: Low"].map(x => (
                    <li key={x} className="flex items-center gap-2 rounded-md border border-slate-200 p-2"><Link2 className="h-3.5 w-3.5 text-indigo-600"/>{x}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3"/>Provenance verified</span>
              <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"><Download className="h-3 w-3"/>Export step</button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
