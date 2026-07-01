import { useMemo, useState } from "react";
import {
  Database, CheckCircle2, Cloud, Layers, Clock, Archive, Share2, Ban,
  Filter, Calculator, Download, RefreshCw, X, MoreVertical, Info,
  Cpu, Activity, ShieldCheck, GitBranch, Workflow, Boxes, Zap,
  TrendingUp, TrendingDown, ChevronRight,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------------- Tokens ---------------- */
const toneMap = {
  violet:  { bg: "bg-violet-50",  text: "text-violet-600",  stroke: "#8b5cf6" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", stroke: "#10b981" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",    stroke: "#3b82f6" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",   stroke: "#f59e0b" },
  cyan:    { bg: "bg-cyan-50",    text: "text-cyan-600",    stroke: "#06b6d4" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-600",    stroke: "#f43f5e" },
  slate:   { bg: "bg-slate-50",   text: "text-slate-600",   stroke: "#64748b" },
} as const;
type Tone = keyof typeof toneMap;

const KPIS: { icon: any; label: string; value: string; sub: string; delta: string; tone: Tone; spark: number[] }[] = [
  { icon: Database,    label: "Total Sources Evaluated",  value: "122", sub: "100% of in-scope",  delta: "+4",   tone: "violet",  spark: [100,108,112,116,118,120,122] },
  { icon: CheckCircle2,label: "Stay in Source",           value: "46",  sub: "37.7%",             delta: "+2",   tone: "emerald", spark: [40,41,43,44,45,45,46] },
  { icon: Cloud,       label: "Query on Demand",          value: "18",  sub: "14.8%",             delta: "+1",   tone: "blue",    spark: [14,15,16,16,17,18,18] },
  { icon: Layers,      label: "Edge Cache / Delta",       value: "32",  sub: "26.2%",             delta: "+3",   tone: "amber",   spark: [22,24,26,28,30,31,32] },
  { icon: Clock,       label: "24h Differential Refresh", value: "18",  sub: "14.8%",             delta: "0",    tone: "violet",  spark: [18,17,18,18,18,18,18] },
  { icon: Archive,     label: "Document Store",           value: "11",  sub: "9.0%",              delta: "-1",   tone: "cyan",    spark: [12,12,12,11,11,11,11] },
  { icon: Share2,      label: "Graph Projection",         value: "4",   sub: "3.3%",              delta: "+1",   tone: "rose",    spark: [2,2,3,3,3,4,4] },
  { icon: Ban,         label: "Excluded",                 value: "2",   sub: "1.6%",              delta: "0",    tone: "slate",   spark: [2,2,2,2,2,2,2] },
];

type Placement = "STAY IN SOURCE" | "EDGE CACHE / DELTA" | "24H DIFF REFRESH" | "VAULT / NORMALIZED" | "QUERY ON DEMAND" | "GRAPH PROJECTION" | "DOCUMENT STORE";

const PLACEMENT_STYLE: Record<Placement, { bg: string; text: string }> = {
  "STAY IN SOURCE":     { bg: "bg-emerald-100", text: "text-emerald-700" },
  "EDGE CACHE / DELTA": { bg: "bg-amber-100",   text: "text-amber-700" },
  "24H DIFF REFRESH":   { bg: "bg-violet-100",  text: "text-violet-700" },
  "VAULT / NORMALIZED": { bg: "bg-cyan-100",    text: "text-cyan-700" },
  "QUERY ON DEMAND":    { bg: "bg-blue-100",    text: "text-blue-700" },
  "GRAPH PROJECTION":   { bg: "bg-rose-100",    text: "text-rose-700" },
  "DOCUMENT STORE":     { bg: "bg-slate-100",   text: "text-slate-700" },
};

type Row = {
  name: string; domain: string; volume: string; change: string; freq: string;
  latency: string; retention: string; placement: Placement; conf: number; cost: string;
  iconTone: Tone; score: number;
};

const ROWS: Row[] = [
  { name: "panw_ngfw_traffic_raw",   domain: "XSIAM",         volume: "1.12 TB", change: "48.6%", freq: "Very High", latency: "Real-time", retention: "7 days",  placement: "STAY IN SOURCE",     conf: 95, cost: "$210",  iconTone: "amber",   score: 95 },
  { name: "panw_ngfw_system_raw",    domain: "XSIAM",         volume: "86.4 GB", change: "32.1%", freq: "High",      latency: "< 1 min",   retention: "14 days", placement: "EDGE CACHE / DELTA", conf: 92, cost: "$430",  iconTone: "amber",   score: 90 },
  { name: "firewall_threat_logs",    domain: "XSIAM",         volume: "142.7 GB",change: "28.4%", freq: "High",      latency: "< 5 min",   retention: "30 days", placement: "EDGE CACHE / DELTA", conf: 90, cost: "$560",  iconTone: "slate",   score: 88 },
  { name: "vpn_globalprotect_logs",  domain: "XSIAM",         volume: "38.2 GB", change: "22.7%", freq: "Medium",    latency: "< 15 min",  retention: "30 days", placement: "24H DIFF REFRESH",   conf: 88, cost: "$310",  iconTone: "amber",   score: 84 },
  { name: "gcp_billing_export",      domain: "BigQuery",      volume: "210.3 GB",change: "12.3%", freq: "Low",       latency: "< 1 hr",    retention: "90 days", placement: "VAULT / NORMALIZED", conf: 93, cost: "$720",  iconTone: "blue",    score: 91 },
  { name: "gcp_cloud_audit_logs",    domain: "BigQuery",      volume: "164.8 GB",change: "9.8%",  freq: "Medium",    latency: "< 15 min",  retention: "90 days", placement: "24H DIFF REFRESH",   conf: 90, cost: "$480",  iconTone: "blue",    score: 87 },
  { name: "logicmonitor_device_stats",domain:"LogicMonitor",  volume: "57.6 GB", change: "6.2%",  freq: "Medium",    latency: "< 5 min",   retention: "60 days", placement: "EDGE CACHE / DELTA", conf: 94, cost: "$390",  iconTone: "emerald", score: 92 },
  { name: "logicmonitor_alerts",     domain: "LogicMonitor",  volume: "3.1 GB",  change: "25.6%", freq: "High",      latency: "< 5 min",   retention: "90 days", placement: "EDGE CACHE / DELTA", conf: 92, cost: "$180",  iconTone: "emerald", score: 89 },
  { name: "datadog_metrics",         domain: "MCP Tools",     volume: "95.4 GB", change: "18.3%", freq: "High",      latency: "< 1 min",   retention: "15 days", placement: "QUERY ON DEMAND",    conf: 88, cost: "$120",  iconTone: "violet",  score: 86 },
  { name: "k8s_cluster_logs",        domain: "Internal APIs", volume: "78.9 GB", change: "15.1%", freq: "High",      latency: "< 5 min",   retention: "30 days", placement: "GRAPH PROJECTION",   conf: 87, cost: "$140",  iconTone: "cyan",    score: 85 },
];

const RATIONALE = [
  { label: "Volume (Very High)",              score: 98 },
  { label: "Change Rate (Very High)",         score: 92 },
  { label: "Query Frequency (Very High)",     score: 96 },
  { label: "Latency Sensitivity (Real-time)", score: 100 },
  { label: "Retention Need (Low)",            score: 32 },
  { label: "Cost Efficiency (High if moved)", score: 94 },
];

const COST_BARS = [
  { label: "Stay in Source",     value: 210,  color: "#10b981" },
  { label: "Query on Demand",    value: 480,  color: "#3b82f6" },
  { label: "Edge Cache / Delta", value: 760,  color: "#f59e0b" },
  { label: "24h Diff Refresh",   value: 1150, color: "#8b5cf6" },
  { label: "Vault / Normalized", value: 1680, color: "#06b6d4" },
];

const PIPELINE = [
  "Source Metadata","Telemetry Collection","Cost Engine","Freshness Engine",
  "Latency Model","Relationship Analyzer","Consumption Analysis",
  "Placement Scoring","Recommendation Engine","Continuous Monitoring",
];

const ALGO = [
  { icon: Boxes,       label: "Inputs",                   note: "9 signals" },
  { icon: Calculator,  label: "Weighted Scoring",         note: "w = [.22,.18,.15,.15,.10,.08,.06,.04,.02]" },
  { icon: ShieldCheck, label: "Policy Rules",             note: "42 active" },
  { icon: Activity,    label: "Threshold Evaluation",     note: "12 gates" },
  { icon: GitBranch,   label: "Placement Recommendation", note: "1 of 8 tiers" },
  { icon: Workflow,    label: "Continuous Optimization",  note: "recompute · 1h" },
];

const STRATEGIES: { name: Placement | "EXCLUDED"; icon: any; tone: Tone; blurb: string; latency: string; cost: string; storage: string; complexity: string }[] = [
  { name: "STAY IN SOURCE",     icon: CheckCircle2, tone: "emerald", blurb: "Data remains in original system, queried in place.",            latency: "native",  cost: "$",    storage: "0 GB",  complexity: "Low" },
  { name: "QUERY ON DEMAND",    icon: Cloud,        tone: "blue",    blurb: "No persistent copy, fetched when needed.",                     latency: "medium",  cost: "$$",   storage: "0 GB",  complexity: "Low" },
  { name: "EDGE CACHE / DELTA", icon: Layers,       tone: "amber",   blurb: "Hot data cached at edge with frequent deltas.",                latency: "low",     cost: "$$",   storage: "hot",   complexity: "Med" },
  { name: "24H DIFF REFRESH",   icon: Clock,        tone: "violet",  blurb: "Daily differential pull and refresh.",                         latency: "24h",     cost: "$$$",  storage: "warm",  complexity: "Med" },
  { name: "VAULT / NORMALIZED", icon: Archive,      tone: "cyan",    blurb: "Normalized and stored for analytics & joins.",                 latency: "seconds", cost: "$$$$", storage: "warm",  complexity: "High" },
  { name: "DOCUMENT STORE",     icon: Boxes,        tone: "slate",   blurb: "Unstructured data in document index.",                         latency: "seconds", cost: "$$$",  storage: "warm",  complexity: "Med" },
  { name: "GRAPH PROJECTION",   icon: Share2,       tone: "rose",    blurb: "Relationships projected to graph store.",                      latency: "ms",      cost: "$$",   storage: "graph", complexity: "High" },
  { name: "EXCLUDED",           icon: Ban,          tone: "slate",   blurb: "Out of scope for orchestration.",                              latency: "—",       cost: "$0",   storage: "—",     complexity: "—" },
];

/* ---------------- Primitives ---------------- */
function Sparkline({ data, color = "#8b5cf6" }: { data: number[]; color?: string }) {
  const w = 92, h = 26;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i/(data.length-1))*w},${h-((v-min)/range)*h}`).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polygon fill={color} opacity={0.1} points={area} />
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} />
    </svg>
  );
}

/* ---------------- Page ---------------- */
export default function DataPlacementDecisionEngine() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [drawer, setDrawer] = useState<null | { title: string; subtitle?: string; kind: string }>(null);
  const openDrawer = (title: string, kind: string, subtitle?: string) => setDrawer({ title, kind, subtitle });
  const selected = ROWS[selectedIdx];

  const maxCost = Math.max(...COST_BARS.map(c => c.value));

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      {/* Header */}
      <header className="mb-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 leading-tight">Data Placement & Economics Decision Engine</h1>
          <p className="text-[13px] text-slate-600 mt-1">Optimize source placement to maximize performance, minimize cost, and preserve trusted operational data.</p>
          <p className="text-[11px] text-slate-500 mt-0.5 max-w-3xl">Every source is continuously evaluated against engineering rules, operational telemetry, freshness requirements, storage economics, and downstream AI consumption.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-3">
            <div className="text-[10px] text-slate-500">Last Updated</div>
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700">
              May 12, 2026 · 10:32 AM
              <button className="p-1 hover:bg-slate-100 rounded"><RefreshCw className="h-3 w-3 text-slate-500" /></button>
            </div>
          </div>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] text-slate-700 shadow-sm">
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
          <button
            onClick={() => openDrawer("Scoring Model", "scoring", "9 weighted signals · 42 policy rules")}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] text-slate-700 shadow-sm"
          >
            <Calculator className="h-3.5 w-3.5" /> Scoring Model
          </button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-[12px] shadow-sm">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-8 gap-2.5 mb-5">
        {KPIS.map(k => {
          const t = toneMap[k.tone];
          const Icon = k.icon;
          const up = k.delta.startsWith("+");
          return (
            <button
              key={k.label}
              onClick={() => openDrawer(k.label, "kpi", k.sub)}
              className="text-left group bg-white rounded-xl border border-slate-200 shadow-sm p-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`h-8 w-8 rounded-lg ${t.bg} ${t.text} grid place-items-center`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-[9.5px] font-medium inline-flex items-center gap-0.5 ${up ? "text-emerald-600" : k.delta === "0" ? "text-slate-400" : "text-rose-600"}`}>
                  {up ? <TrendingUp className="h-2.5 w-2.5" /> : k.delta !== "0" ? <TrendingDown className="h-2.5 w-2.5" /> : null} {k.delta}
                </span>
              </div>
              <div className="mt-2 text-[10px] text-slate-500 font-medium leading-tight">{k.label}</div>
              <div className="mt-0.5 text-[20px] font-bold text-slate-900 leading-none tabular-nums">{k.value}</div>
              <div className="mt-1.5 flex items-end justify-between gap-1">
                <div className="text-[10px] text-emerald-600 font-medium tabular-nums">{k.sub}</div>
                <Sparkline data={k.spark} color={t.stroke} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-12 gap-3 mb-3">
        {/* LEFT: Matrix */}
        <section className="col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-slate-800">Placement Decision Matrix</h2>
            <div className="text-[10.5px] text-slate-500">Click a row to inspect the engineering rationale</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11.5px]">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-3 py-2.5 font-medium w-8">#</th>
                  <th className="text-left px-2 py-2.5 font-medium">Source Name</th>
                  <th className="text-left px-2 py-2.5 font-medium">Domain</th>
                  <th className="text-right px-2 py-2.5 font-medium">Daily Vol</th>
                  <th className="text-right px-2 py-2.5 font-medium">Change 24h</th>
                  <th className="text-left px-2 py-2.5 font-medium">Query Freq</th>
                  <th className="text-left px-2 py-2.5 font-medium">Latency</th>
                  <th className="text-left px-2 py-2.5 font-medium">Retention</th>
                  <th className="text-left px-2 py-2.5 font-medium">Placement</th>
                  <th className="text-right px-2 py-2.5 font-medium">Conf.</th>
                  <th className="text-right px-2 py-2.5 font-medium">Est $/mo</th>
                  <th className="px-2 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => {
                  const iconTone = toneMap[r.iconTone];
                  const isSel = selectedIdx === i;
                  const p = PLACEMENT_STYLE[r.placement];
                  return (
                    <tr
                      key={r.name}
                      onClick={() => setSelectedIdx(i)}
                      className={`border-b border-slate-50 cursor-pointer transition ${isSel ? "bg-blue-50/60" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-3 py-2 text-slate-400 tabular-nums">{i + 1}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-md ${iconTone.bg} grid place-items-center shrink-0`}>
                            <Database className={`h-3 w-3 ${iconTone.text}`} />
                          </div>
                          <span className="font-mono text-[11px] font-medium text-slate-800">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-slate-700">{r.domain}</td>
                      <td className="text-right px-2 py-2 tabular-nums text-slate-800 font-medium">{r.volume}</td>
                      <td className="text-right px-2 py-2 tabular-nums text-slate-600">{r.change}</td>
                      <td className="px-2 py-2 text-slate-700">{r.freq}</td>
                      <td className="px-2 py-2 text-slate-700">{r.latency}</td>
                      <td className="px-2 py-2 text-slate-700">{r.retention}</td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide ${p.bg} ${p.text}`}>
                          {r.placement}
                        </span>
                      </td>
                      <td className="text-right px-2 py-2 tabular-nums font-medium text-emerald-600">{r.conf}%</td>
                      <td className="text-right px-2 py-2 tabular-nums text-slate-800 font-medium">{r.cost}</td>
                      <td className="px-2 py-2">
                        <button onClick={(e) => { e.stopPropagation(); openDrawer(r.name, "source", `${r.domain} · ${r.placement}`); }} className="p-1 rounded hover:bg-slate-100">
                          <MoreVertical className="h-3.5 w-3.5 text-slate-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div>Showing 1 to {ROWS.length} of 122 sources</div>
            <div className="flex items-center gap-1">
              <span>Rows:</span>
              <select className="border border-slate-200 rounded px-1.5 py-0.5 text-[11px]"><option>10</option></select>
              <div className="ml-3 flex items-center gap-0.5">
                {["1","2","3","…","13"].map(p => (
                  <button key={p} className={`h-6 min-w-[24px] px-1.5 rounded text-[11px] ${p==="1" ? "bg-blue-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Recommendation */}
        <aside className="col-span-4 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Selected Source</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-6 w-6 rounded-md ${toneMap[selected.iconTone].bg} grid place-items-center`}>
                    <Database className={`h-3.5 w-3.5 ${toneMap[selected.iconTone].text}`} />
                  </div>
                  <div>
                    <div className="font-mono text-[12px] font-semibold text-slate-900">{selected.name}</div>
                    <div className="text-[10px] text-slate-500">{selected.domain} · {selected.volume}</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider text-emerald-600 font-semibold">Recommended</div>
                <div className={`mt-1 inline-flex rounded-md px-2 py-1 text-[10.5px] font-semibold ${PLACEMENT_STYLE[selected.placement].bg} ${PLACEMENT_STYLE[selected.placement].text}`}>
                  {selected.placement}
                </div>
              </div>
            </div>

            <div className="mt-4 mb-2 text-[11px] font-semibold text-slate-700">Decision Rationale</div>
            <div className="space-y-2">
              {RATIONALE.map(r => (
                <button
                  key={r.label}
                  onClick={() => openDrawer(r.label, "rationale", `Score ${r.score} / 100 · click for formula`)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center justify-between text-[10.5px] mb-0.5">
                    <span className="text-slate-600">{r.label}</span>
                    <span className="tabular-nums font-medium text-slate-700">{r.score}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${r.score >= 90 ? "bg-emerald-500" : r.score >= 70 ? "bg-amber-500" : "bg-slate-400"}`}
                      style={{ width: `${r.score}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Overall Score</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Weighted engineering composite</div>
              </div>
              <div className="tabular-nums">
                <span className="text-[24px] font-bold text-emerald-600">{selected.score}</span>
                <span className="text-[11px] text-slate-400"> / 100</span>
              </div>
            </div>
          </div>

          {/* Cost Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-[12px] font-semibold text-slate-800 mb-3">Cost Comparison (Est. Monthly)</div>
            <div className="flex items-end justify-between gap-2 h-[140px] px-1">
              {COST_BARS.map(b => {
                const h = (b.value / maxCost) * 100;
                return (
                  <button
                    key={b.label}
                    onClick={() => openDrawer(b.label + " — Cost Breakdown", "cost", `$${b.value.toLocaleString()} / month`)}
                    className="flex-1 flex flex-col items-center gap-1 group"
                  >
                    <div className="text-[10px] font-medium text-slate-700 tabular-nums">${b.value.toLocaleString()}</div>
                    <div className="w-full flex justify-center">
                      <div
                        className="w-8 rounded-t-md transition-all duration-700 group-hover:brightness-110"
                        style={{ height: `${h}%`, background: b.color, minHeight: 6 }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-1 px-1">
              {COST_BARS.map(b => (
                <div key={b.label} className="flex-1 text-center text-[9px] text-slate-500 leading-tight">{b.label}</div>
              ))}
            </div>
          </div>

          {/* Recommendation Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[12px] font-semibold text-slate-800">Engineering Recommendation</div>
              <span className="text-[10px] text-emerald-600 font-semibold">$286K/mo saved</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-700">
              {[
                "High volume + high change rate make movement cost prohibitive",
                "Real-time latency requirement for incident response",
                "Leverage source-side indexes (XQL) for efficient queries",
                "Store only derived entities and relationships in vault",
              ].map(x => (
                <li key={x} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" /> {x}
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10.5px]">
              {[
                ["Est. Daily Ingress",  "1.12 TB"],
                ["Est. Daily Egress",   "0 GB"],
                ["Est. Monthly Storage","0 GB"],
                ["Est. Monthly Cost",   "$210"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-slate-500">{k}</span>
                  <span className="tabular-nums font-medium text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Engineering Transparency zone */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-800 shadow-lg text-slate-100 p-5 mb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-blue-300 font-semibold">Engineering Transparency</div>
            <h2 className="text-[18px] font-bold">How the Placement Decision Engine Works</h2>
          </div>
          <div className="text-[10px] text-slate-400">Signals → Scoring → Policy → Threshold → Placement → Continuous Optimization</div>
        </div>

        {/* Pipeline */}
        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700 mb-3">
          <div className="text-[11px] font-semibold text-slate-300 mb-3">Decision Pipeline</div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {PIPELINE.map((step, i) => (
              <div key={step} className="flex items-center shrink-0">
                <button
                  onClick={() => openDrawer(step, "pipeline", `Stage ${i+1} of ${PIPELINE.length}`)}
                  className="px-2.5 py-2 rounded-md bg-slate-800 border border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition text-[10.5px] font-medium text-slate-200 whitespace-nowrap"
                >
                  <div className="text-[9px] text-blue-400 mb-0.5">{String(i+1).padStart(2,"0")}</div>
                  {step}
                </button>
                {i < PIPELINE.length - 1 && (
                  <div className="relative w-4 h-px bg-slate-600 mx-0.5">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Algorithm */}
          <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
            <div className="text-[11px] font-semibold text-slate-300 mb-3">Placement Decision Algorithm</div>
            <div className="space-y-1.5">
              {ALGO.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => openDrawer(s.label, "algo", s.note)}
                    className="w-full flex items-center gap-3 p-2 rounded-md bg-slate-800/70 border border-slate-700 hover:border-blue-500 transition"
                  >
                    <div className="h-6 w-6 rounded bg-blue-500/20 grid place-items-center">
                      <Icon className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[11px] text-slate-200">{s.label}</div>
                      <div className="text-[9px] text-slate-500 font-mono truncate">{s.note}</div>
                    </div>
                    <span className="text-[9px] text-slate-500">{i+1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live simulation */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold text-slate-300">Live Engineering Simulation</div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> streaming
              </span>
            </div>
            <div className="space-y-1 mb-3 text-[10.5px] font-mono">
              {[
                { t: "10:32:04", m: "incoming panw_ngfw_traffic_raw · 1.12 TB", c: "text-slate-400" },
                { t: "10:32:04", m: "engine evaluate → 214 rules · 96 hits",  c: "text-blue-300" },
                { t: "10:32:05", m: "placement → STAY IN SOURCE (conf 95%)",  c: "text-emerald-300" },
                { t: "10:32:07", m: "recommendation persisted · v4.2.11",     c: "text-slate-400" },
              ].map((l, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-slate-500">{l.t}</span>
                  <span className={l.c}>{l.m}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {[
                ["CPU",              "38%"],
                ["Memory",           "1.4 GB"],
                ["Evaluation Time",  "182 ms"],
                ["Decision Latency", "9 ms"],
                ["Rules Applied",    "214"],
                ["Policy Hits",      "96"],
                ["Optimization Gain","+38%"],
                ["Recompute Cycle",  "1h"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between bg-slate-800/60 rounded px-2 py-1.5">
                  <span className="text-slate-500 uppercase tracking-wider text-[9px]">{k}</span>
                  <span className="text-slate-100 tabular-nums font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Savings widgets */}
          <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
            <div className="text-[11px] font-semibold text-slate-300 mb-3">Optimization Opportunities</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { k: "Storage Savings",      v: "$186K/mo", tone: "text-emerald-400" },
                { k: "Network Savings",      v: "$52K/mo",  tone: "text-emerald-400" },
                { k: "Compute Savings",      v: "$48K/mo",  tone: "text-emerald-400" },
                { k: "Cost Avoidance",       v: "$286K",    tone: "text-emerald-400" },
                { k: "Carbon Reduction",     v: "1.2 tCO₂", tone: "text-cyan-400" },
                { k: "Latency Improvement",  v: "-38%",     tone: "text-blue-400" },
                { k: "Storage Reduction",    v: "-64%",     tone: "text-violet-400" },
                { k: "AI Readiness",         v: "+22 pts",  tone: "text-amber-400" },
              ].map(w => (
                <button
                  key={w.k}
                  onClick={() => openDrawer(w.k, "widget")}
                  className="bg-slate-800/70 border border-slate-700 hover:border-blue-500 rounded-md p-2 text-left transition"
                >
                  <div className={`text-[13px] font-bold ${w.tone} tabular-nums`}>{w.v}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">{w.k}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Placement Strategy Legend */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-3">
        <div className="text-[12px] font-semibold text-slate-800 mb-3">Placement Strategy Legend</div>
        <div className="grid grid-cols-4 gap-2">
          {STRATEGIES.map(s => {
            const t = toneMap[s.tone];
            const Icon = s.icon;
            return (
              <button
                key={s.name}
                onClick={() => openDrawer(s.name, "strategy", s.blurb)}
                className="text-left flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition"
              >
                <div className={`h-8 w-8 rounded-md ${t.bg} ${t.text} grid place-items-center shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11.5px] font-semibold text-slate-800">{s.name}</div>
                  <div className="text-[10px] text-slate-500 leading-snug">{s.blurb}</div>
                  <div className="mt-1 flex items-center gap-2 text-[9.5px] text-slate-400">
                    <span>lat: <b className="text-slate-600">{s.latency}</b></span>
                    <span>cost: <b className="text-slate-600">{s.cost}</b></span>
                    <span>cx: <b className="text-slate-600">{s.complexity}</b></span>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300 ml-auto shrink-0 mt-1" />
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
        <span className="flex items-center gap-1.5"><Info className="h-3 w-3" /> Every recommendation is continuously recomputed from live telemetry — no manual placement.</span>
        <div className="flex items-center gap-6">
          <div>Environment: <span className="text-slate-700 font-medium">Production</span></div>
          <div>Alex Morgan · <span className="text-slate-700 font-medium">Lead Platform Architect</span></div>
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-[30vw] min-w-[420px] sm:max-w-none overflow-y-auto">
          {drawer && <DrawerContents title={drawer.title} subtitle={drawer.subtitle} onClose={() => setDrawer(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ---------------- Drawer ---------------- */
function DrawerContents({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  const [volume, setVolume] = useState(60);
  const [fresh, setFresh]   = useState(40);
  const [lat, setLat]       = useState(70);
  const [freq, setFreq]     = useState(55);
  const [retention, setRet] = useState(30);

  const score = Math.round(
    (volume * 0.22 + freq * 0.18 + lat * 0.20 + fresh * 0.15 + (100 - retention) * 0.10) + 15
  );
  const rec: Placement = lat > 80 ? "STAY IN SOURCE" : freq > 70 ? "EDGE CACHE / DELTA" : retention > 70 ? "VAULT / NORMALIZED" : "24H DIFF REFRESH";
  const est = Math.round(80 + volume * 6 + freq * 3);

  return (
    <>
      <SheetHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">Engineering Drawer</div>
            <SheetTitle className="text-[18px]">{title}</SheetTitle>
            {subtitle && <div className="text-[12px] text-slate-500 mt-1">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="h-4 w-4 text-slate-500" /></button>
        </div>
      </SheetHeader>

      <Tabs defaultValue="overview" className="mt-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engineering">Engineering</TabsTrigger>
          <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
          <TabsTrigger value="sim">Simulation</TabsTrigger>
          <TabsTrigger value="deps">Deps</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-3 text-[12px]">
          <DrawerBlock label="Current State" text="Placement recomputed 6 minutes ago · confidence 92%. No policy exceptions." />
          <DrawerBlock label="Recommended State" text="Retain current placement for 24h; re-evaluate on next telemetry window." />
          <DrawerBlock label="Business Impact" text="Preserves incident detection SLA; avoids $52K/mo egress; keeps SREOps agent latency < 300ms." />
        </TabsContent>

        <TabsContent value="engineering" className="mt-4 space-y-3 text-[12px]">
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Decision Engine Architecture</div>
            <div className="space-y-1.5">
              {["Signal ingest","Feature extraction","Weighted scoring","Policy evaluation","Threshold gates","Placement selection","Cost projection","Recommendation persist"].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-blue-100 text-blue-700 text-[10px] grid place-items-center font-semibold">{i+1}</div>
                  <div className="flex-1 text-slate-700">{s}</div>
                  <div className="w-16 h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse" style={{ width: `${70 + (i*4)%25}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DrawerBlock label="Policy Engine" text="42 rules · 12 threshold gates · 8 regulatory constraints. Rule catalog: /engine/rules/v4.2" />
          <DrawerBlock label="Optimizers" text="Storage · Latency · Freshness · Cost — each contributes a bounded delta to the composite score." />
        </TabsContent>

        <TabsContent value="telemetry" className="mt-4 space-y-2 text-[12px]">
          {[
            ["Evaluation latency","182 ms p95"],
            ["Storage utilization","64%"],
            ["Bandwidth","28 MB/s"],
            ["Network traffic","1.4 TB/day"],
            ["Cache hit ratio","91%"],
            ["Delta size","6.1%"],
            ["Refresh duration","42 s"],
            ["Query latency","118 ms p95"],
            ["CPU","38%"],
            ["Memory","1.4 GB"],
            ["Retries (24h)","14"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-500">{k}</span>
              <span className="font-mono font-medium text-slate-800">{v}</span>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="sim" className="mt-4 space-y-3 text-[12px]">
          <div className="text-[11px] text-slate-500">Adjust signals to see the recommendation change live.</div>
          {[
            { label: "Daily Volume",      v: volume,    set: setVolume },
            { label: "Freshness SLA",     v: fresh,     set: setFresh },
            { label: "Latency Requirement", v: lat,     set: setLat },
            { label: "Query Frequency",   v: freq,      set: setFreq },
            { label: "Retention",         v: retention, set: setRet },
          ].map(s => (
            <div key={s.label}>
              <div className="flex items-center justify-between text-[10.5px] mb-1">
                <span className="text-slate-600">{s.label}</span>
                <span className="tabular-nums text-slate-800 font-medium">{s.v}</span>
              </div>
              <input type="range" min={0} max={100} value={s.v} onChange={(e) => s.set(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
          ))}
          <div className="mt-3 rounded-lg border border-slate-200 p-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Recommended Placement</div>
                <div className={`mt-1 inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${PLACEMENT_STYLE[rec].bg} ${PLACEMENT_STYLE[rec].text}`}>{rec}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Composite</div>
                <div className="text-[20px] font-bold text-emerald-600 tabular-nums">{Math.min(score, 100)}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Estimated $/mo</span>
              <span className="tabular-nums font-medium text-slate-800">${est}</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deps" className="mt-4 space-y-3 text-[12px]">
          <DrawerBlock label="Source systems" text="Cortex XSIAM · GCP · LogicMonitor · Datadog · K8s API" />
          <DrawerBlock label="Storage" text="Iceberg (warm) · S3 Glacier (cold) · Neo4j (graph) · pgvector (embeddings)" />
          <DrawerBlock label="Consumers" text="SREOps Agent · Incident Copilot · FinOps · Compliance Reporter" />
          <DrawerBlock label="Ownership / Risk" text="Owner: Platform Eng · Risk: Low (0 breaking rule violations 30d)" />
        </TabsContent>
      </Tabs>
    </>
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
