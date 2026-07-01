import { useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Database, Cloud, Clock, Waves, CheckCircle2, AlertTriangle,
  TrendingUp, TrendingDown, DollarSign, Timer, Activity, Zap, Shield, Layers,
  Download, Sparkles, ArrowRight, Gauge,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, RadialBarChart, RadialBar,
} from "recharts";

/* ---------- Source catalog (mirrors matrix) ---------- */
type Src = {
  slug: string; name: string; domain: string; volumeTB: number; changeRate: number;
  queryFreqPerHr: number; latencySlaMs: number; retentionDays: number; recommended: string;
};
const SOURCES: Src[] = [
  { slug: "panw_ngfw_traffic_raw",  name: "panw_ngfw_traffic_raw",  domain: "XSIAM",        volumeTB: 1.12,  changeRate: 48.6, queryFreqPerHr: 620, latencySlaMs: 500,   retentionDays: 7,  recommended: "STAY IN SOURCE" },
  { slug: "panw_ngfw_system_raw",   name: "panw_ngfw_system_raw",   domain: "XSIAM",        volumeTB: 0.0864,changeRate: 32.1, queryFreqPerHr: 240, latencySlaMs: 60000, retentionDays: 14, recommended: "EDGE CACHE / DELTA" },
  { slug: "firewall_threat_logs",   name: "firewall_threat_logs",   domain: "XSIAM",        volumeTB: 0.1427,changeRate: 28.4, queryFreqPerHr: 180, latencySlaMs: 300000,retentionDays: 30, recommended: "EDGE CACHE / DELTA" },
  { slug: "vpn_globalprotect_logs", name: "vpn_globalprotect_logs", domain: "XSIAM",        volumeTB: 0.0382,changeRate: 22.7, queryFreqPerHr: 90,  latencySlaMs: 900000,retentionDays: 30, recommended: "24H DIFF REFRESH" },
  { slug: "gcp_billing_export",     name: "gcp_billing_export",     domain: "BigQuery",     volumeTB: 0.2103,changeRate: 12.3, queryFreqPerHr: 20,  latencySlaMs: 3600000,retentionDays: 90, recommended: "VAULT / NORMALIZED" },
  { slug: "gcp_cloud_audit_logs",   name: "gcp_cloud_audit_logs",   domain: "BigQuery",     volumeTB: 0.1648,changeRate: 9.8,  queryFreqPerHr: 60,  latencySlaMs: 900000, retentionDays: 90, recommended: "24H DIFF REFRESH" },
  { slug: "logicmonitor_device_stats", name: "logicmonitor_device_stats", domain: "LogicMonitor", volumeTB: 0.0576, changeRate: 6.2, queryFreqPerHr: 140, latencySlaMs: 300000, retentionDays: 60, recommended: "EDGE CACHE / DELTA" },
  { slug: "logicmonitor_alerts",    name: "logicmonitor_alerts",    domain: "LogicMonitor", volumeTB: 0.0031,changeRate: 25.6, queryFreqPerHr: 220, latencySlaMs: 300000,retentionDays: 90, recommended: "EDGE CACHE / DELTA" },
  { slug: "datadog_metrics",        name: "datadog_metrics",        domain: "MCP Tools",    volumeTB: 0.0954,changeRate: 18.3, queryFreqPerHr: 380, latencySlaMs: 60000, retentionDays: 15, recommended: "QUERY ON DEMAND" },
  { slug: "k8s_cluster_logs",       name: "k8s_cluster_logs",       domain: "Internal APIs",volumeTB: 0.0789,changeRate: 15.1, queryFreqPerHr: 200, latencySlaMs: 300000,retentionDays: 30, recommended: "GRAPH PROJECTION" },
];

export const PLACEMENT_SLUGS = SOURCES.map((s) => s.slug);
export const getSourceBySlug = (slug: string) => SOURCES.find((s) => s.slug === slug);

/* ---------- Scenario modeling ---------- */
type ScenarioKey = "stay" | "hourly" | "onDemand" | "recurring";
type Scenario = {
  key: ScenarioKey;
  title: string;
  subtitle: string;
  icon: any;
  accent: string; // hex
  chip: string;   // tailwind bg/text
  strategy: string;
  fitFormula: string;
};

const SCENARIOS: Scenario[] = [
  { key: "stay",      title: "Leave Log In Place",         subtitle: "Federated query · zero movement",       icon: Database, accent: "#10b981", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", strategy: "Data never leaves the source; queries are pushed down at read time.", fitFormula: "Best when volume is high and query frequency is low-to-medium." },
  { key: "hourly",    title: "Fetch on Hourly Basis",      subtitle: "Scheduled batch pulls · 24 x/day",      icon: Clock,    accent: "#8b5cf6", chip: "bg-violet-50 text-violet-700 ring-violet-200",     strategy: "Cron-driven ETL pulls the delta every 60 minutes into the platform.", fitFormula: "Best for moderate change-rate, non-real-time observability." },
  { key: "onDemand",  title: "Pull On Demand",             subtitle: "Live federated read · pay-per-query",   icon: Cloud,    accent: "#3b82f6", chip: "bg-blue-50 text-blue-700 ring-blue-200",           strategy: "No pre-materialization; hydrate only on user or agent query.",       fitFormula: "Best when queries are rare but must always be fresh." },
  { key: "recurring", title: "Hydrate on Recurring Basis", subtitle: "Change-rate driven · adaptive cadence", icon: Waves,    accent: "#f59e0b", chip: "bg-amber-50 text-amber-700 ring-amber-200",         strategy: "Ingest cadence auto-tunes to observed change rate (5m → 4h).",       fitFormula: "Best for high-value data with volatile change patterns." },
];

/* ---------- Forecast engine (deterministic per source) ---------- */
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
function rng(seed: number) { let x = seed || 1; return () => { x = (x * 1664525 + 1013904223) | 0; return ((x >>> 0) / 4294967296); }; }

type Stats = {
  freshnessSec: number;
  latencyP95Ms: number;
  costMonthly: number;
  storageTB: number;
  egressGB: number;
  compute: number;         // vCPU-hours / day
  ingestSuccess: number;   // %
  driftRisk: number;       // %
  coverage: number;        // %
  slaBreachRisk: number;   // %
  co2Kg: number;
  score: number;
  fitLabel: "Optimal" | "Recommended" | "Viable" | "Sub-optimal";
  fitColor: string;
  pros: string[];
  cons: string[];
  forecast30d: { d: number; cost: number; freshness: number; volume: number }[];
};

function model(src: Src, s: ScenarioKey): Stats {
  const seed = hash(src.slug + ":" + s);
  const r = rng(seed);
  const V = src.volumeTB;
  const C = src.changeRate;
  const Q = src.queryFreqPerHr;
  const L = src.latencySlaMs;

  let freshnessSec = 60, latencyP95Ms = 200, costMonthly = 500, storageTB = 0, egressGB = 0, compute = 20;
  let ingestSuccess = 99.5, driftRisk = 5, coverage = 98, slaBreachRisk = 5, co2Kg = 40;
  let pros: string[] = [], cons: string[] = [];
  let fitScore = 70;

  if (s === "stay") {
    freshnessSec = 5;
    latencyP95Ms = 1200 + Math.round(V * 400) + Math.round(r() * 300);
    costMonthly = Math.round(120 + Q * 0.6 + r() * 60);
    storageTB = 0;
    egressGB = Math.round(Q * 24 * 30 * 0.02);
    compute = Math.round(4 + Q * 0.02);
    ingestSuccess = 99.9;
    driftRisk = 2;
    coverage = 92;
    slaBreachRisk = L < 1000 ? 32 : L < 60000 ? 12 : 3;
    co2Kg = Math.round(8 + Q * 0.01);
    pros = ["Zero data duplication", "No storage overhead", "Compliance stays in source", "Fastest time-to-market"];
    cons = ["Latency scales with query volume", "Vendor lock-in on source performance", "Egress fees on frequent reads"];
    fitScore = (V > 0.5 ? 30 : 10) + (Q < 200 ? 40 : 20) + (L > 60000 ? 25 : 5);
  }
  if (s === "hourly") {
    freshnessSec = 3600;
    latencyP95Ms = 180 + Math.round(r() * 80);
    costMonthly = Math.round(280 + V * 900 + r() * 90);
    storageTB = Number((V * (src.retentionDays / 30) * 0.9).toFixed(3));
    egressGB = Math.round(V * 1024 * 24);
    compute = Math.round(24 + V * 60);
    ingestSuccess = 99.4;
    driftRisk = Math.min(35, Math.round(C * 0.6));
    coverage = 96;
    slaBreachRisk = L < 3600000 ? 18 : 4;
    co2Kg = Math.round(30 + V * 120);
    pros = ["Predictable batch windows", "Simple to operate & audit", "Cost known in advance"];
    cons = ["1-hour freshness gap", "Stale during change bursts", "Fixed cost even in quiet hours"];
    fitScore = (C < 20 ? 40 : 20) + (Q > 30 ? 30 : 15) + (L > 3600000 ? 25 : 10);
  }
  if (s === "onDemand") {
    freshnessSec = 30;
    latencyP95Ms = 900 + Math.round(V * 300) + Math.round(r() * 250);
    costMonthly = Math.round(60 + Q * 24 * 30 * 0.004);
    storageTB = 0;
    egressGB = Math.round(Q * 24 * 30 * 0.05);
    compute = Math.round(2 + Q * 0.04);
    ingestSuccess = 99.7;
    driftRisk = 3;
    coverage = 88;
    slaBreachRisk = L < 1000 ? 45 : L < 60000 ? 18 : 6;
    co2Kg = Math.round(6 + Q * 0.02);
    pros = ["Pay only for what is queried", "Always current on read", "Ideal for rare-but-critical queries"];
    cons = ["Unpredictable cost under bursty demand", "Higher cold-read latency", "No historical replay without cache"];
    fitScore = (Q < 100 ? 45 : 15) + (V > 0.3 ? 25 : 15) + (L > 60000 ? 20 : 5);
  }
  if (s === "recurring") {
    const cadenceMin = Math.max(5, Math.round(240 / Math.max(1, C / 5)));
    freshnessSec = cadenceMin * 60;
    latencyP95Ms = 160 + Math.round(r() * 60);
    costMonthly = Math.round(340 + V * 780 + C * 6);
    storageTB = Number((V * (src.retentionDays / 30) * 0.75).toFixed(3));
    egressGB = Math.round(V * 1024 * (1440 / cadenceMin));
    compute = Math.round(28 + V * 55 + C * 0.8);
    ingestSuccess = 99.6;
    driftRisk = Math.max(2, 12 - Math.round(C / 5));
    coverage = 98;
    slaBreachRisk = L < 300000 ? 10 : 3;
    co2Kg = Math.round(42 + V * 110);
    pros = ["Adaptive cadence follows change rate", "High coverage & lineage", "Balances cost with freshness"];
    cons = ["Higher storage footprint", "More complex orchestration", "Requires drift-aware scheduler"];
    fitScore = (C > 15 ? 45 : 25) + (Q > 100 ? 30 : 15) + (L < 300000 ? 20 : 10);
  }

  const score = Math.max(20, Math.min(100, fitScore + Math.round(r() * 10) - 5));
  const fitLabel: Stats["fitLabel"] =
    score >= 85 ? "Optimal" : score >= 70 ? "Recommended" : score >= 55 ? "Viable" : "Sub-optimal";
  const fitColor =
    fitLabel === "Optimal" ? "#10b981" : fitLabel === "Recommended" ? "#3b82f6" :
    fitLabel === "Viable" ? "#f59e0b" : "#ef4444";

  const forecast30d = Array.from({ length: 30 }, (_, i) => {
    const jitter = 0.85 + rng(seed + i)() * 0.3;
    return {
      d: i + 1,
      cost: Math.round(costMonthly / 30 * jitter),
      freshness: Math.max(1, Math.round(freshnessSec * (0.7 + rng(seed + i + 99)() * 0.6))),
      volume: Number((V * jitter).toFixed(3)),
    };
  });

  return {
    freshnessSec, latencyP95Ms, costMonthly, storageTB, egressGB, compute,
    ingestSuccess, driftRisk, coverage, slaBreachRisk, co2Kg,
    score, fitLabel, fitColor, pros, cons, forecast30d,
  };
}

const fmtFresh = (sec: number) =>
  sec < 60 ? `${sec}s` : sec < 3600 ? `${Math.round(sec / 60)}m` : sec < 86400 ? `${(sec / 3600).toFixed(1)}h` : `${(sec / 86400).toFixed(1)}d`;

/* ============================== Page ============================== */
export default function PlacementScenarioModeler() {
  const { slug } = useParams();
  const nav = useNavigate();
  const src = getSourceBySlug(slug || "");
  if (!src) {
    return (
      <div className="p-8">
        <div className="text-slate-700">Source not found.</div>
        <Link to="/data-orchestration-twin/data-placement-and-economics-decision-engine" className="text-indigo-600 text-sm">← Back to matrix</Link>
      </div>
    );
  }

  const scenarios = useMemo(() =>
    SCENARIOS.map((s) => ({ ...s, stats: model(src, s.key) })),
    [src.slug]
  );
  const best = scenarios.reduce((a, b) => (b.stats.score > a.stats.score ? b : a));

  // Comparison chart
  const compareData = scenarios.map((s) => ({
    name: s.title.split(" ").slice(0, 2).join(" "),
    Cost: s.stats.costMonthly,
    Freshness: Math.round(s.stats.freshnessSec / 60),
    LatencyMs: s.stats.latencyP95Ms,
    Score: s.stats.score,
    accent: s.accent,
  }));

  return (
    <div className="min-h-full bg-slate-50">
      {/* Header */}
      <header className="px-6 pt-5 pb-4 border-b border-slate-200 bg-white sticky top-0 z-20">
        <nav className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-1.5">
          <Link to="/data-orchestration-twin" className="hover:text-indigo-600">Orchestration Hub</Link>
          <span>/</span>
          <Link to="/data-orchestration-twin/data-placement-and-economics-decision-engine" className="hover:text-indigo-600">Placement Decision Matrix</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Scenario Modeler</span>
        </nav>
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <button onClick={() => nav(-1)} className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-100">
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              </button>
              <h1 className="text-[22px] font-black text-slate-900 tracking-tight leading-none font-mono">{src.name}</h1>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{src.domain}</span>
            </div>
            <p className="text-[12px] text-slate-600 mt-2">
              Modeled scenarios for placement, ingestion, and hydration strategy — forecast against volume, change rate, latency SLA, and query patterns.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <Pill l="Daily Volume" v={`${(src.volumeTB * 1024).toFixed(1)} GB`} />
              <Pill l="Change Rate" v={`${src.changeRate}%`} tone={src.changeRate > 25 ? "amber" : "slate"} />
              <Pill l="Query Freq" v={`${src.queryFreqPerHr}/hr`} />
              <Pill l="Latency SLA" v={fmtFresh(Math.round(src.latencySlaMs / 1000))} />
              <Pill l="Retention" v={`${src.retentionDays}d`} />
              <Pill l="Matrix Rec." v={src.recommended} tone="violet" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Export Forecast
            </button>
            <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white px-3 py-1.5 text-[11px] font-semibold shadow flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> AI Best-Fit: {best.title}
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-5">
        {/* Scenario cards */}
        <section className="grid grid-cols-4 gap-4">
          {scenarios.map((s) => {
            const Icon = s.icon;
            const isBest = s.key === best.key;
            return (
              <div key={s.key} className={`relative rounded-2xl bg-white ring-1 shadow-sm overflow-hidden ${isBest ? "ring-2 ring-emerald-400 shadow-emerald-100" : "ring-slate-200"}`}>
                {isBest && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg">
                    Best Fit
                  </div>
                )}
                <div className="p-4 border-b border-slate-100" style={{ background: `linear-gradient(180deg, ${s.accent}12, transparent)` }}>
                  <div className="flex items-start gap-2.5">
                    <div className="h-9 w-9 rounded-lg grid place-items-center" style={{ background: `${s.accent}22`, color: s.accent }}>
                      <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-slate-900 leading-tight">{s.title}</div>
                      <div className="text-[10.5px] text-slate-500">{s.subtitle}</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-snug">{s.strategy}</p>
                </div>

                {/* Stat grid */}
                <div className="p-3 grid grid-cols-2 gap-1.5 text-[11px]">
                  <Stat icon={Timer}     l="Freshness"     v={fmtFresh(s.stats.freshnessSec)} />
                  <Stat icon={Activity}  l="Latency p95"   v={`${s.stats.latencyP95Ms}ms`} />
                  <Stat icon={DollarSign} l="Cost / mo"    v={`$${s.stats.costMonthly.toLocaleString()}`} strong />
                  <Stat icon={Layers}    l="Storage"       v={s.stats.storageTB ? `${(s.stats.storageTB * 1024).toFixed(1)} GB` : "—"} />
                  <Stat icon={ArrowRight} l="Egress / mo"  v={`${s.stats.egressGB.toLocaleString()} GB`} />
                  <Stat icon={Zap}       l="Compute / d"   v={`${s.stats.compute} vCPU·h`} />
                  <Stat icon={CheckCircle2} l="Ingest OK"   v={`${s.stats.ingestSuccess}%`} tone="emerald" />
                  <Stat icon={AlertTriangle} l="Drift Risk" v={`${s.stats.driftRisk}%`} tone={s.stats.driftRisk > 15 ? "amber" : "slate"} />
                  <Stat icon={Shield}    l="Coverage"      v={`${s.stats.coverage}%`} />
                  <Stat icon={AlertTriangle} l="SLA Breach" v={`${s.stats.slaBreachRisk}%`} tone={s.stats.slaBreachRisk > 20 ? "rose" : s.stats.slaBreachRisk > 10 ? "amber" : "emerald"} />
                </div>

                {/* Fit gauge */}
                <div className="px-3 pb-3">
                  <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-2.5 flex items-center gap-3">
                    <div className="relative h-14 w-14">
                      <ResponsiveContainer>
                        <RadialBarChart innerRadius="65%" outerRadius="100%" data={[{ v: s.stats.score, fill: s.stats.fitColor }]} startAngle={90} endAngle={-270}>
                          <RadialBar dataKey="v" cornerRadius={10} background={{ fill: "#e2e8f0" } as any} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 grid place-items-center">
                        <span className="text-[11px] font-bold text-slate-800 tabular-nums">{s.stats.score}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9.5px] uppercase tracking-wider text-slate-500">Fit Score</div>
                      <div className="text-[13px] font-bold" style={{ color: s.stats.fitColor }}>{s.stats.fitLabel}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{s.fitFormula}</div>
                    </div>
                  </div>
                </div>

                {/* 30-day forecast sparkline */}
                <div className="px-3 pb-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">30-Day Cost Forecast</div>
                  <div className="h-14">
                    <ResponsiveContainer>
                      <AreaChart data={s.stats.forecast30d}>
                        <defs>
                          <linearGradient id={`fg-${s.key}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={s.accent} stopOpacity={0.5} />
                            <stop offset="100%" stopColor={s.accent} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="cost" stroke={s.accent} strokeWidth={1.5} fill={`url(#fg-${s.key})`} />
                        <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} labelFormatter={(l) => `Day ${l}`} formatter={(v) => [`$${v}`, "Daily cost"]} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pros / Cons */}
                <div className="px-3 pb-4 grid grid-cols-2 gap-2 text-[10.5px]">
                  <div>
                    <div className="text-[9.5px] uppercase tracking-wider text-emerald-600 font-semibold mb-1">Pros</div>
                    <ul className="space-y-1">
                      {s.stats.pros.map((p) => (
                        <li key={p} className="flex gap-1.5 text-slate-700"><span className="text-emerald-500 mt-0.5">✓</span><span>{p}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[9.5px] uppercase tracking-wider text-rose-600 font-semibold mb-1">Cons</div>
                    <ul className="space-y-1">
                      {s.stats.cons.map((c) => (
                        <li key={c} className="flex gap-1.5 text-slate-700"><span className="text-rose-500 mt-0.5">✕</span><span>{c}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Comparison charts */}
        <section className="grid grid-cols-12 gap-4">
          <div className="col-span-8 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[13px] font-bold text-slate-900">Scenario Cost vs Freshness Forecast</div>
                <div className="text-[11px] text-slate-500">30-day rolling forecast of daily cost across scenarios</div>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                {scenarios.map((s) => (
                  <span key={s.key} className="inline-flex items-center gap-1 text-slate-600">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.accent }} /> {s.title.split(" ").slice(0, 2).join(" ")}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <LineChart data={Array.from({ length: 30 }, (_, i) => {
                  const row: any = { d: i + 1 };
                  scenarios.forEach((s) => { row[s.key] = s.stats.forecast30d[i].cost; });
                  return row;
                })}>
                  <CartesianGrid stroke="#f1f5f9" />
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  {scenarios.map((s) => (
                    <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.accent} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-4 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4">
            <div className="text-[13px] font-bold text-slate-900">Fit Score Comparison</div>
            <div className="text-[11px] text-slate-500 mb-2">Higher is better — model weights change rate, query freq, latency SLA</div>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={compareData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="Score" radius={[0, 6, 6, 0]}>
                    {compareData.map((d, i) => (
                      <rect key={i} fill={d.accent} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Recommendation strip */}
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white ring-1 ring-slate-800 p-5 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center shadow-lg">
              <Gauge className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">Neurealm AI Recommendation</div>
              <div className="text-[16px] font-bold">Deploy <span className="text-emerald-300">{best.title}</span> for <span className="font-mono">{src.name}</span></div>
              <div className="text-[12px] text-slate-300 mt-1">
                Modeled against {src.changeRate}% change rate, {src.queryFreqPerHr} queries/hr, and a {fmtFresh(Math.round(src.latencySlaMs / 1000))} latency SLA — this scenario delivers a fit score of{" "}
                <span className="text-white font-semibold">{best.stats.score}/100</span> at ${best.stats.costMonthly.toLocaleString()}/mo with {fmtFresh(best.stats.freshnessSec)} freshness.
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center min-w-[300px]">
              <MetricBig l="Est. Monthly Cost" v={`$${best.stats.costMonthly.toLocaleString()}`} />
              <MetricBig l="Freshness" v={fmtFresh(best.stats.freshnessSec)} />
              <MetricBig l="SLA Confidence" v={`${100 - best.stats.slaBreachRisk}%`} />
            </div>
          </div>
        </section>

        {/* Assumptions */}
        <section className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4">
          <div className="text-[13px] font-bold text-slate-900 mb-2">Model Assumptions & Inputs</div>
          <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-700">
            <Assume l="Volume basis" v={`${(src.volumeTB * 1024).toFixed(1)} GB/day observed over trailing 14 days`} />
            <Assume l="Change rate" v={`${src.changeRate}% row-level delta per 24h`} />
            <Assume l="Query pattern" v={`${src.queryFreqPerHr} queries/hr avg, p95 burst 3.4×`} />
            <Assume l="Latency SLA" v={fmtFresh(Math.round(src.latencySlaMs / 1000)) + " end-to-end target"} />
            <Assume l="Retention" v={`${src.retentionDays} days hot`} />
            <Assume l="Cost model" v="Blended $/TB storage, $/GB egress, $0.006 per query at gateway" />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- Small components ---------- */
function Pill({ l, v, tone = "slate" }: { l: string; v: string; tone?: "slate" | "amber" | "violet" }) {
  const map = {
    slate:  "bg-slate-100 text-slate-700 ring-slate-200",
    amber:  "bg-amber-50 text-amber-700 ring-amber-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ring-1 ${map[tone]}`}>
      <span className="text-[9.5px] uppercase tracking-wider opacity-70">{l}</span>
      <span className="font-semibold">{v}</span>
    </span>
  );
}
function Stat({ icon: Icon, l, v, strong, tone = "slate" }: { icon: any; l: string; v: string; strong?: boolean; tone?: "slate" | "emerald" | "amber" | "rose" }) {
  const toneCls = { slate: "text-slate-800", emerald: "text-emerald-600", amber: "text-amber-600", rose: "text-rose-600" }[tone];
  return (
    <div className="rounded-md bg-slate-50 ring-1 ring-slate-100 px-2 py-1.5">
      <div className="flex items-center gap-1 text-[9.5px] text-slate-500 uppercase tracking-wider">
        <Icon className="h-2.5 w-2.5" /> {l}
      </div>
      <div className={`${strong ? "text-[13px] font-bold" : "text-[12px] font-semibold"} tabular-nums ${toneCls}`}>{v}</div>
    </div>
  );
}
function MetricBig({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-2">
      <div className="text-[9.5px] text-slate-400 uppercase tracking-wider">{l}</div>
      <div className="text-[16px] font-black text-white tabular-nums">{v}</div>
    </div>
  );
}
function Assume({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-2.5">
      <div className="text-[9.5px] uppercase tracking-wider text-slate-500">{l}</div>
      <div className="text-slate-800 font-medium">{v}</div>
    </div>
  );
}
