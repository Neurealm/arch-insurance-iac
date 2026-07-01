import { useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ShieldCheck, Copy, Archive, Boxes, Layers, Ban,
  AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, DollarSign,
  Timer, Activity, Zap, Shield, Download, Sparkles, ArrowRight,
  Database, HardDrive, Leaf, Clock, Scale, GitBranch,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, RadialBarChart, RadialBar,
} from "recharts";

/* ---------- Source catalog (mirrors NoDup matrix) ---------- */
type Src = {
  slug: string; name: string; sub: string; platform: string; domain: string;
  volumeTB: number; changeRate: number; retentionDays: number;
  accessTier: "realtime" | "near" | "batch"; recommended: string;
  complianceTag?: "SOX" | "HIPAA" | "GDPR" | "PCI" | "SOC2";
};
const SOURCES: Src[] = [
  { slug: "panw_ngfw_traffic_raw",   name: "panw_ngfw_traffic_raw",   sub: "NGFW Traffic Logs",       platform: "XSIAM",        domain: "Security",      volumeTB: 1.12,   changeRate: 48.6, retentionDays: 90,  accessTier: "realtime", recommended: "STAY IN SOURCE",     complianceTag: "SOC2" },
  { slug: "panw_ngfw_system_raw",    name: "panw_ngfw_system_raw",    sub: "NGFW System Events",      platform: "XSIAM",        domain: "Security",      volumeTB: 0.0864, changeRate: 32.1, retentionDays: 7,   accessTier: "realtime", recommended: "EDGE CACHE / DELTA" },
  { slug: "firewall_threat_logs",    name: "firewall_threat_logs",    sub: "Threat / URL / Content",  platform: "XSIAM",        domain: "Security",      volumeTB: 0.1427, changeRate: 28.4, retentionDays: 14,  accessTier: "near",     recommended: "EDGE CACHE / DELTA" },
  { slug: "vpn_globalprotect_logs",  name: "vpn_globalprotect_logs",  sub: "GlobalProtect VPN Logs",  platform: "XSIAM",        domain: "Network",       volumeTB: 0.0382, changeRate: 22.7, retentionDays: 30,  accessTier: "near",     recommended: "24H DIFF REFRESH" },
  { slug: "gcp_billing_export",      name: "gcp_billing_export",      sub: "GCP Billing Export",      platform: "BigQuery",     domain: "FinOps",        volumeTB: 0.2103, changeRate: 12.3, retentionDays: 180, accessTier: "batch",    recommended: "VAULT / NORMALIZED", complianceTag: "SOX" },
  { slug: "gcp_cloud_audit_logs",    name: "gcp_cloud_audit_logs",    sub: "Cloud Audit Logs",        platform: "BigQuery",     domain: "Compliance",    volumeTB: 0.1648, changeRate: 9.8,  retentionDays: 90,  accessTier: "near",     recommended: "24H DIFF REFRESH",   complianceTag: "SOC2" },
  { slug: "logicmonitor_device_stats", name: "logicmonitor_device_stats", sub: "Device Performance Stats", platform: "LogicMonitor", domain: "Infra", volumeTB: 0.0576, changeRate: 6.2, retentionDays: 7, accessTier: "near", recommended: "EDGE CACHE / DELTA" },
  { slug: "logicmonitor_alerts",     name: "logicmonitor_alerts",     sub: "Infrastructure Alerts",   platform: "LogicMonitor", domain: "Infra",         volumeTB: 0.0031, changeRate: 25.6, retentionDays: 30,  accessTier: "near",     recommended: "24H DIFF REFRESH" },
  { slug: "datadog_metrics",         name: "datadog_metrics",         sub: "Datadog Metrics & Events",platform: "MCP Tools",    domain: "Observability", volumeTB: 0.0954, changeRate: 18.3, retentionDays: 3,   accessTier: "realtime", recommended: "HOURLY DELTA" },
  { slug: "k8s_cluster_logs",        name: "k8s_cluster_logs",        sub: "Kubernetes Cluster Logs", platform: "Internal APIs",domain: "Platform",      volumeTB: 0.0789, changeRate: 15.1, retentionDays: 30,  accessTier: "near",     recommended: "GRAPH PROJECTION" },
];

export const getNoDupSourceBySlug = (slug: string) => SOURCES.find((s) => s.slug === slug);

/* ---------- Scenario definitions ---------- */
type ScenarioKey = "sot" | "delta" | "derived" | "fullreplica" | "vault";
type Scenario = {
  key: ScenarioKey; title: string; subtitle: string; icon: any;
  accent: string; strategy: string; principle: string;
};
const SCENARIOS: Scenario[] = [
  { key: "sot",         title: "Single Source of Truth",  subtitle: "Zero copy · federated read",              icon: ShieldCheck, accent: "#10b981", strategy: "Data never leaves the origin. All queries are federated to the source system.", principle: "Maximum adherence to no-duplication policy." },
  { key: "delta",       title: "Selective Delta Cache",   subtitle: "Change-only mirror · TTL bound",          icon: Layers,      accent: "#f59e0b", strategy: "Only changed records are cached locally with strict TTL — deletes propagate.",     principle: "Minimizes duplication while enabling fast queries." },
  { key: "derived",     title: "Derived Record Only",     subtitle: "Extract, discard raw",                     icon: Boxes,       accent: "#14b8a6", strategy: "Raw logs are processed into small operational records; raw payload is discarded.",  principle: "Highest deduplication — replaces raw with canonical facts." },
  { key: "fullreplica", title: "Full Replication + TTL",  subtitle: "Full copy · time-boxed retention",         icon: Copy,        accent: "#f43f5e", strategy: "Complete duplicate lake with hard TTL matching the retention policy.",             principle: "Violates no-dup — reserved for regulated exceptions." },
  { key: "vault",       title: "Compliance Vault Archive",subtitle: "Cold immutable · replay-only",             icon: Archive,     accent: "#06b6d4", strategy: "WORM cold storage for compliance replay; not queried in operational plane.",      principle: "Governed duplicate for legal hold / audit only." },
];

/* ---------- Deterministic model ---------- */
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
function rng(seed: number) { let x = seed || 1; return () => { x = (x * 1664525 + 1013904223) | 0; return ((x >>> 0) / 4294967296); }; }

type Stats = {
  duplicationRatio: number;      // % of raw volume duplicated
  storageGB: number;             // footprint
  retentionEnforcedDays: number;
  shadowCopies: number;          // # additional stores
  costMonthly: number;
  egressGB: number;
  freshnessSec: number;
  latencyP95Ms: number;
  complianceScore: number;       // 0–100
  policyViolationRisk: number;   // %
  recoveryRtoMin: number;        // RTO for replay
  co2Kg: number;
  carbonSaved: number;           // vs full replica baseline
  ingestSuccess: number;
  score: number;
  fitLabel: "Optimal" | "Recommended" | "Viable" | "Not Recommended";
  fitColor: string;
  pros: string[];
  cons: string[];
  forecast30d: { d: number; storage: number; cost: number; duplication: number }[];
};

function model(src: Src, key: ScenarioKey): Stats {
  const seed = hash(src.slug + ":" + key);
  const r = rng(seed);
  const V_GB = src.volumeTB * 1024;
  const R = src.retentionDays;
  const C = src.changeRate;

  let dupRatio = 0, storageGB = 0, retEnf = R, shadow = 0;
  let cost = 0, egress = 0, freshness = 60, latency = 200;
  let compliance = 90, violation = 5, rto = 30, co2 = 30, carbonSaved = 0;
  let ingest = 99.6, fit = 60;
  let pros: string[] = [], cons: string[] = [];

  if (key === "sot") {
    dupRatio = 0;
    storageGB = 0;
    retEnf = R;
    shadow = 0;
    cost = Math.round(80 + V_GB * 0.05 + r() * 40);
    egress = Math.round(V_GB * 0.02 * 30);
    freshness = 5;
    latency = 900 + Math.round(V_GB * 0.6) + Math.round(r() * 200);
    compliance = 99;
    violation = 1;
    rto = 2;
    co2 = Math.round(8 + V_GB * 0.02);
    carbonSaved = Math.round(V_GB * 0.6);
    ingest = 99.9;
    pros = ["Zero duplication — 100% policy compliant", "No shadow lake to govern", "Retention delegated to source", "Lowest carbon footprint"];
    cons = ["Query latency scales with source load", "Egress fees on frequent reads", "Dependent on source SLA"];
    fit = 55 + (V_GB > 500 ? 25 : 10) + (C > 30 ? 15 : 5) + Math.round(r() * 8);
  }
  if (key === "delta") {
    dupRatio = Math.min(35, Math.round(C * 0.6));
    storageGB = Number((V_GB * (C / 100) * (R / 30) * 0.55).toFixed(1));
    retEnf = Math.min(R, 14);
    shadow = 1;
    cost = Math.round(180 + storageGB * 2.4 + r() * 60);
    egress = Math.round(storageGB * 8);
    freshness = 120;
    latency = 180 + Math.round(r() * 60);
    compliance = 92;
    violation = 6;
    rto = 8;
    co2 = Math.round(22 + storageGB * 0.4);
    carbonSaved = Math.round(V_GB * 0.35);
    ingest = 99.5;
    pros = ["~90% storage reduction vs full copy", "Fast local queries", "TTL auto-purges stale deltas", "Change-aware — quiet hours cost less"];
    cons = ["Requires delete-propagation logic", "Cache staleness during change bursts", "Delta reconstruction on cold restart"];
    fit = 45 + (C > 15 && C < 40 ? 30 : 10) + (R < 60 ? 15 : 5) + Math.round(r() * 10);
  }
  if (key === "derived") {
    dupRatio = 3;
    storageGB = Number((V_GB * 0.008 * (R / 30)).toFixed(1));
    retEnf = R;
    shadow = 1;
    cost = Math.round(120 + storageGB * 3 + r() * 50);
    egress = Math.round(storageGB * 4);
    freshness = 300;
    latency = 40 + Math.round(r() * 20);
    compliance = 96;
    violation = 3;
    rto = 12;
    co2 = Math.round(14 + storageGB * 0.3);
    carbonSaved = Math.round(V_GB * 0.55);
    ingest = 99.4;
    pros = ["Extreme dedup — raw replaced by facts", "Sub-50ms operational queries", "Cheap to store & join", "Canonical model enforced"];
    cons = ["Raw evidence not directly queryable", "Modeling effort per source", "Late-arriving fields need backfill"];
    fit = 50 + (V_GB > 100 ? 25 : 10) + (src.accessTier === "realtime" ? 15 : 5) + Math.round(r() * 10);
  }
  if (key === "fullreplica") {
    dupRatio = 100;
    storageGB = Number((V_GB * (R / 30) * 0.95).toFixed(1));
    retEnf = R;
    shadow = 2;
    cost = Math.round(320 + storageGB * 4.2 + r() * 120);
    egress = Math.round(V_GB * 30);
    freshness = 3600;
    latency = 90 + Math.round(r() * 30);
    compliance = 78;
    violation = 22;
    rto = 20;
    co2 = Math.round(90 + storageGB * 0.9);
    carbonSaved = 0;
    ingest = 99.3;
    pros = ["Fastest analytics — nothing federated", "Independent of source uptime", "Full historical replay"];
    cons = ["Explicit no-dup policy violation", "Highest storage & carbon cost", "Retention drift risk in copy", "Ingest lag on high-change sources"];
    fit = 20 + (src.complianceTag === "SOX" || src.complianceTag === "HIPAA" ? 15 : 0) + Math.round(r() * 12);
  }
  if (key === "vault") {
    dupRatio = 100;
    storageGB = Number((V_GB * (Math.min(2555, R * 7) / 30) * 0.15).toFixed(1)); // cold + compressed
    retEnf = Math.max(R, 365);
    shadow = 1;
    cost = Math.round(60 + storageGB * 0.35 + r() * 30);
    egress = 0;
    freshness = 86400;
    latency = 45000;
    compliance = 100;
    violation = 0;
    rto = 240;
    co2 = Math.round(6 + storageGB * 0.05);
    carbonSaved = Math.round(V_GB * 0.2);
    ingest = 99.7;
    pros = ["Legally-defensible retention", "WORM immutability", "Cheapest per GB long-term", "Zero operational query load"];
    cons = ["Not queryable in real time", "Restore takes hours (RTO 4h)", "Duplicates raw but governed as exception"];
    fit = 35 + (src.complianceTag ? 40 : 10) + (R > 180 ? 15 : 5) + Math.round(r() * 8);
  }

  const score = Math.max(15, Math.min(100, fit));
  const fitLabel: Stats["fitLabel"] =
    score >= 85 ? "Optimal" : score >= 70 ? "Recommended" : score >= 55 ? "Viable" : "Not Recommended";
  const fitColor =
    fitLabel === "Optimal" ? "#10b981" : fitLabel === "Recommended" ? "#3b82f6" :
    fitLabel === "Viable" ? "#f59e0b" : "#ef4444";

  const forecast30d = Array.from({ length: 30 }, (_, i) => {
    const j = 0.88 + rng(seed + i)() * 0.24;
    return {
      d: i + 1,
      storage: Number((storageGB * (0.6 + (i / 30) * 0.6) * j).toFixed(1)),
      cost: Math.round((cost / 30) * (1 + i * 0.008) * j),
      duplication: Math.max(0, Math.round(dupRatio * (0.9 + rng(seed + i + 17)() * 0.2))),
    };
  });

  return {
    duplicationRatio: dupRatio, storageGB, retentionEnforcedDays: retEnf, shadowCopies: shadow,
    costMonthly: cost, egressGB: egress, freshnessSec: freshness, latencyP95Ms: latency,
    complianceScore: compliance, policyViolationRisk: violation, recoveryRtoMin: rto,
    co2Kg: co2, carbonSaved, ingestSuccess: ingest,
    score, fitLabel, fitColor, pros, cons, forecast30d,
  };
}

const fmtFresh = (sec: number) =>
  sec < 60 ? `${sec}s` : sec < 3600 ? `${Math.round(sec / 60)}m` : sec < 86400 ? `${(sec / 3600).toFixed(1)}h` : `${(sec / 86400).toFixed(1)}d`;
const fmtRto = (m: number) => m < 60 ? `${m}m` : `${(m / 60).toFixed(1)}h`;

/* ---------- Primitives ---------- */
function Pill({ l, v, tone = "slate" }: { l: string; v: string; tone?: "slate" | "amber" | "violet" | "emerald" | "rose" }) {
  const map: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 ring-1 ${map[tone]}`}>
      <span className="text-[9.5px] uppercase tracking-wider opacity-70">{l}</span>
      <span className="font-semibold">{v}</span>
    </span>
  );
}
function Stat({ icon: Icon, l, v, tone = "slate", strong = false }: { icon: any; l: string; v: string; tone?: "slate" | "emerald" | "amber" | "rose" | "blue"; strong?: boolean }) {
  const map: Record<string, string> = {
    slate: "text-slate-800", emerald: "text-emerald-700", amber: "text-amber-700", rose: "text-rose-700", blue: "text-blue-700",
  };
  return (
    <div className="rounded-md bg-slate-50 ring-1 ring-slate-200 px-2 py-1.5">
      <div className="flex items-center gap-1 text-slate-500 text-[9.5px] uppercase tracking-wider">
        <Icon className="h-3 w-3" /> {l}
      </div>
      <div className={`tabular-nums leading-tight mt-0.5 ${strong ? "text-[13px] font-bold" : "text-[12px] font-semibold"} ${map[tone]}`}>{v}</div>
    </div>
  );
}

/* ============================== Page ============================== */
export default function NoDuplicationScenarioModeler() {
  const { slug } = useParams();
  const nav = useNavigate();
  const src = getNoDupSourceBySlug(slug || "");
  if (!src) {
    return (
      <div className="p-8">
        <div className="text-slate-700">Source not found.</div>
        <Link to="/data-orchestration-twin/no-duplication-strategy-and-retention-policy" className="text-indigo-600 text-sm">← Back to matrix</Link>
      </div>
    );
  }

  const scenarios = useMemo(() =>
    SCENARIOS.map((s) => ({ ...s, stats: model(src, s.key) })),
    [src.slug]
  );
  const best = scenarios.reduce((a, b) => (b.stats.score > a.stats.score ? b : a));

  const compareData = scenarios.map((s) => ({
    name: s.title.split(" ").slice(0, 2).join(" "),
    Storage: s.stats.storageGB,
    Cost: s.stats.costMonthly,
    Duplication: s.stats.duplicationRatio,
    Compliance: s.stats.complianceScore,
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
          <Link to="/data-orchestration-twin/no-duplication-strategy-and-retention-policy" className="hover:text-indigo-600">No Duplication & Retention</Link>
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
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{src.domain} · {src.platform}</span>
            </div>
            <p className="text-[12px] text-slate-600 mt-2 max-w-3xl">
              Modeled scenarios showing the impact of each duplication and retention strategy on <span className="font-semibold text-slate-800">{src.sub}</span> — forecast against volume, change rate, compliance obligations, and carbon footprint.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <Pill l="Daily Volume" v={`${(src.volumeTB * 1024).toFixed(1)} GB`} />
              <Pill l="Change Rate" v={`${src.changeRate}%`} tone={src.changeRate > 25 ? "amber" : "slate"} />
              <Pill l="Retention" v={`${src.retentionDays}d`} />
              <Pill l="Access" v={src.accessTier} />
              <Pill l="Matrix Rec." v={src.recommended} tone="violet" />
              {src.complianceTag && <Pill l="Compliance" v={src.complianceTag} tone="rose" />}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Export Forecast
            </button>
            <div className="rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-3 py-1.5 text-[11px] font-semibold shadow flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> AI Best-Fit: {best.title}
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-5">
        {/* Scenario cards */}
        <section className="grid grid-cols-5 gap-3">
          {scenarios.map((s) => {
            const Icon = s.icon;
            const isBest = s.key === best.key;
            const dupTone: "emerald" | "amber" | "rose" =
              s.stats.duplicationRatio === 0 ? "emerald" : s.stats.duplicationRatio > 50 ? "rose" : "amber";
            return (
              <div key={s.key} className={`relative rounded-2xl bg-white ring-1 shadow-sm overflow-hidden ${isBest ? "ring-2 ring-emerald-400 shadow-emerald-100" : "ring-slate-200"}`}>
                {isBest && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg">
                    Best Fit
                  </div>
                )}
                <div className="p-3 border-b border-slate-100" style={{ background: `linear-gradient(180deg, ${s.accent}14, transparent)` }}>
                  <div className="flex items-start gap-2">
                    <div className="h-9 w-9 rounded-lg grid place-items-center shrink-0" style={{ background: `${s.accent}22`, color: s.accent }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold text-slate-900 leading-tight">{s.title}</div>
                      <div className="text-[10px] text-slate-500">{s.subtitle}</div>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-slate-600 mt-2 leading-snug">{s.strategy}</p>
                  <div className="mt-2 rounded-md bg-white/70 ring-1 ring-slate-200 px-2 py-1 text-[9.5px] text-slate-600">
                    <span className="uppercase tracking-wider text-slate-400 font-semibold mr-1">Principle:</span> {s.principle}
                  </div>
                </div>

                {/* Stat grid — unique to no-dup context */}
                <div className="p-2.5 grid grid-cols-2 gap-1.5">
                  <Stat icon={Ban}         l="Duplication"    v={`${s.stats.duplicationRatio}%`}   tone={dupTone} strong />
                  <Stat icon={HardDrive}   l="Storage"        v={s.stats.storageGB > 0 ? `${s.stats.storageGB.toLocaleString()} GB` : "0 GB"} />
                  <Stat icon={Clock}       l="Retention"      v={`${s.stats.retentionEnforcedDays}d`} />
                  <Stat icon={Copy}        l="Shadow Copies"  v={`${s.stats.shadowCopies}`}         tone={s.stats.shadowCopies > 1 ? "rose" : "emerald"} />
                  <Stat icon={DollarSign}  l="Cost / mo"      v={`$${s.stats.costMonthly.toLocaleString()}`} strong />
                  <Stat icon={ArrowRight}  l="Egress / mo"    v={`${s.stats.egressGB.toLocaleString()} GB`} />
                  <Stat icon={Timer}       l="Freshness"      v={fmtFresh(s.stats.freshnessSec)} />
                  <Stat icon={Activity}    l="Latency p95"    v={s.stats.latencyP95Ms >= 1000 ? `${(s.stats.latencyP95Ms/1000).toFixed(1)}s` : `${s.stats.latencyP95Ms}ms`} />
                  <Stat icon={Shield}      l="Compliance"     v={`${s.stats.complianceScore}%`}     tone={s.stats.complianceScore >= 95 ? "emerald" : "amber"} />
                  <Stat icon={AlertTriangle} l="Policy Risk"  v={`${s.stats.policyViolationRisk}%`} tone={s.stats.policyViolationRisk > 15 ? "rose" : s.stats.policyViolationRisk > 5 ? "amber" : "emerald"} />
                  <Stat icon={Zap}         l="Replay RTO"     v={fmtRto(s.stats.recoveryRtoMin)} />
                  <Stat icon={Leaf}        l="CO₂ / mo"       v={`${s.stats.co2Kg} kg`}             tone={s.stats.co2Kg < 30 ? "emerald" : "amber"} />
                </div>

                {/* Fit gauge */}
                <div className="px-2.5 pb-3">
                  <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-2 flex items-center gap-2.5">
                    <div className="relative h-12 w-12 shrink-0">
                      <ResponsiveContainer>
                        <RadialBarChart innerRadius="65%" outerRadius="100%" data={[{ v: s.stats.score, fill: s.stats.fitColor }]} startAngle={90} endAngle={-270}>
                          <RadialBar dataKey="v" cornerRadius={10} background={{ fill: "#e2e8f0" } as any} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 grid place-items-center">
                        <span className="text-[10.5px] font-bold text-slate-800 tabular-nums">{s.stats.score}</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] uppercase tracking-wider text-slate-500">Fit Score</div>
                      <div className="text-[11px] font-bold" style={{ color: s.stats.fitColor }}>{s.stats.fitLabel}</div>
                      <div className="text-[9.5px] text-emerald-700 mt-0.5">−{s.stats.carbonSaved}kg CO₂ vs full copy</div>
                    </div>
                  </div>
                </div>

                {/* 30d storage forecast sparkline */}
                <div className="px-2.5 pb-3">
                  <div className="text-[9.5px] uppercase tracking-wider text-slate-500 font-semibold mb-1">30-Day Storage Forecast</div>
                  <div className="h-14">
                    <ResponsiveContainer>
                      <AreaChart data={s.stats.forecast30d} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={s.accent} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={s.accent} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area dataKey="storage" stroke={s.accent} strokeWidth={1.5} fill={`url(#g-${s.key})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pros / Cons */}
                <div className="px-2.5 pb-3 space-y-1.5">
                  <div className="rounded-md bg-emerald-50 ring-1 ring-emerald-100 p-2">
                    <div className="text-[9px] uppercase tracking-wider text-emerald-700 font-bold mb-1 flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5" /> Pros</div>
                    <ul className="space-y-0.5">
                      {s.stats.pros.map((p, i) => <li key={i} className="text-[10px] text-slate-700 leading-snug">· {p}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-md bg-rose-50 ring-1 ring-rose-100 p-2">
                    <div className="text-[9px] uppercase tracking-wider text-rose-700 font-bold mb-1 flex items-center gap-1"><AlertTriangle className="h-2.5 w-2.5" /> Trade-offs</div>
                    <ul className="space-y-0.5">
                      {s.stats.cons.map((p, i) => <li key={i} className="text-[10px] text-slate-700 leading-snug">· {p}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Cross-Scenario Comparison */}
        <section className="grid grid-cols-12 gap-4">
          <div className="col-span-8 bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5"><Scale className="h-4 w-4 text-indigo-600" /> Cross-Scenario Comparison</h3>
              <span className="text-[10px] text-slate-500">Forecast weighted for {src.name}</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={compareData} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar yAxisId="l" dataKey="Storage"     fill="#f43f5e" name="Storage GB" />
                  <Bar yAxisId="l" dataKey="Cost"        fill="#f59e0b" name="Cost $/mo" />
                  <Bar yAxisId="r" dataKey="Duplication" fill="#8b5cf6" name="Duplication %" />
                  <Bar yAxisId="r" dataKey="Compliance"  fill="#10b981" name="Compliance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-4 bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4">
            <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5 mb-2"><Sparkles className="h-4 w-4 text-emerald-600" /> AI Recommendation</h3>
            <div className="rounded-xl p-3 mb-2" style={{ background: `linear-gradient(135deg, ${best.accent}18, transparent)`, border: `1px solid ${best.accent}44` }}>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Best fit for this source</div>
              <div className="text-[15px] font-bold text-slate-900 mt-0.5">{best.title}</div>
              <div className="text-[11px] text-slate-600 mt-1">{best.strategy}</div>
              <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
                <div className="rounded bg-white ring-1 ring-slate-200 px-1.5 py-1">
                  <div className="text-slate-500">Dup</div>
                  <div className="font-bold text-slate-800 tabular-nums">{best.stats.duplicationRatio}%</div>
                </div>
                <div className="rounded bg-white ring-1 ring-slate-200 px-1.5 py-1">
                  <div className="text-slate-500">Cost</div>
                  <div className="font-bold text-slate-800 tabular-nums">${best.stats.costMonthly}</div>
                </div>
                <div className="rounded bg-white ring-1 ring-slate-200 px-1.5 py-1">
                  <div className="text-slate-500">Score</div>
                  <div className="font-bold text-slate-800 tabular-nums">{best.stats.score}</div>
                </div>
              </div>
            </div>
            <div className="text-[10.5px] text-slate-600 space-y-1.5">
              <div className="flex gap-1.5"><GitBranch className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" /><span><b>Volume signal:</b> {(src.volumeTB * 1024).toFixed(1)} GB/day biases toward federated read.</span></div>
              <div className="flex gap-1.5"><Activity className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" /><span><b>Change rate:</b> {src.changeRate}% favors {src.changeRate > 25 ? "delta-only" : "batch"} strategies.</span></div>
              <div className="flex gap-1.5"><Shield className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" /><span><b>Compliance:</b> {src.complianceTag ?? "None"} — {src.complianceTag ? "vault override recommended" : "no forced duplication"}.</span></div>
              <div className="flex gap-1.5"><Leaf className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" /><span><b>Sustainability:</b> best-fit saves ~{best.stats.carbonSaved}kg CO₂/mo vs full replica baseline.</span></div>
            </div>
          </div>
        </section>

        {/* Forecast overlay */}
        <section className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-blue-600" /> 30-Day Cost Forecast — All Scenarios</h3>
            <span className="text-[10px] text-slate-500">Daily allocated $ (modeled)</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart margin={{ top: 6, right: 20, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="d" type="number" domain={[1, 30]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {scenarios.map((s) => (
                  <Line
                    key={s.key}
                    data={s.stats.forecast30d}
                    dataKey="cost"
                    name={s.title}
                    stroke={s.accent}
                    strokeWidth={2}
                    dot={false}
                    type="monotone"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Assumptions */}
        <section className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4">
          <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5 mb-2"><Database className="h-4 w-4 text-slate-600" /> Model Inputs & Assumptions</h3>
          <div className="grid grid-cols-4 gap-3 text-[11px]">
            <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-2.5">
              <div className="text-[9.5px] uppercase tracking-wider text-slate-500 font-semibold">Volume Baseline</div>
              <div className="text-slate-800 font-semibold mt-0.5">{(src.volumeTB * 1024).toFixed(1)} GB / day</div>
              <div className="text-slate-500 text-[10px] mt-0.5">Applied uniformly across all scenarios.</div>
            </div>
            <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-2.5">
              <div className="text-[9.5px] uppercase tracking-wider text-slate-500 font-semibold">Change Rate</div>
              <div className="text-slate-800 font-semibold mt-0.5">{src.changeRate}% / day</div>
              <div className="text-slate-500 text-[10px] mt-0.5">Drives delta size and cache TTL.</div>
            </div>
            <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-2.5">
              <div className="text-[9.5px] uppercase tracking-wider text-slate-500 font-semibold">Retention Policy</div>
              <div className="text-slate-800 font-semibold mt-0.5">{src.retentionDays} days</div>
              <div className="text-slate-500 text-[10px] mt-0.5">Retention scales storage footprint linearly.</div>
            </div>
            <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-2.5">
              <div className="text-[9.5px] uppercase tracking-wider text-slate-500 font-semibold">Compliance Flag</div>
              <div className="text-slate-800 font-semibold mt-0.5">{src.complianceTag ?? "None"}</div>
              <div className="text-slate-500 text-[10px] mt-0.5">Regulated sources bias toward Vault scenario.</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
