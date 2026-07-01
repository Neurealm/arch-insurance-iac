import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowLeft, Boxes, Brain, CheckCircle2, ChevronRight,
  Cpu, Database, Gauge, GitBranch, Layers, Network, Radar, Server, ShieldCheck,
  Sparkles, Target, Workflow, Wifi, X, Zap, Clock, Users,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppShell } from "@/components/eoc/AppShell";

/* ================= Telemetry helpers ================= */
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const rand = (a: number, b: number, d = 0) => +(a + Math.random() * (b - a)).toFixed(d);
const CISCO = ["Catalyst 9500", "Catalyst 9300", "Nexus 9336", "ASR 1002-HX", "ISR 4451"];
const JUNIPER = ["MX204", "QFX5120", "EX4400", "SRX4600"];
const ISPS = ["AT&T", "Lumen", "Verizon", "Zayo", "Comcast Business", "Cogent", "NTT"];
const REGIONS = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"];
const SITES = ["DFW-HQ", "NYC-BR-02", "LON-DC-01", "SNG-BR-11", "PHX-FAB-03", "CHI-RTL-27"];

/* ================= Static content ================= */
const WORKFLOW_STAGES = [
  { id: "discovery", label: "Discovery", icon: Radar, desc: "Continuous topology + inventory discovery across cloud, WAN, LAN, wireless." },
  { id: "telemetry", label: "Telemetry Collection", icon: Activity, desc: "Streams SNMP, NetFlow, sFlow, IPFIX, gNMI, OTel from 40+ producers." },
  { id: "correlation", label: "AI Correlation", icon: Brain, desc: "Multi-signal correlation across metrics, logs, changes, tickets." },
  { id: "dependency", label: "Dependency Analysis", icon: GitBranch, desc: "Live dependency graph from CMDB + traceroute + traces." },
  { id: "rca", label: "Root Cause Analysis", icon: Target, desc: "Weighted RCA ranking across WAN, LAN, ISP, BGP, DNS, App." },
  { id: "risk", label: "Risk Assessment", icon: ShieldCheck, desc: "Blast-radius, user impact, revenue impact, SLA risk scoring." },
  { id: "planning", label: "Remediation Planning", icon: Workflow, desc: "Selects optimal action from automation library w/ rollback plan." },
  { id: "exec", label: "Execution", icon: Zap, desc: "MCP-invoked automation, gated by risk-tiered approval matrix." },
  { id: "validate", label: "Validation", icon: CheckCircle2, desc: "Post-change synthetic probes + SLO confirmation." },
  { id: "learn", label: "Learning", icon: Sparkles, desc: "Outcome logged; models retrained on confirmed root cause." },
] as const;

const DATA_SOURCES = [
  "Cisco DNA Center", "Cisco Catalyst Center", "Juniper Mist", "Arista CloudVision",
  "Palo Alto Panorama", "Fortinet FortiManager", "Meraki Dashboard", "SolarWinds",
  "DataDog", "Splunk", "Dynatrace", "ThousandEyes", "NetBrain", "Azure Monitor",
  "AWS CloudWatch", "ServiceNow", "CMDB", "IPAM", "DNS", "DHCP", "Infoblox",
  "NetBox", "SNMP", "Syslog", "NetFlow", "sFlow", "IPFIX", "Streaming Telemetry",
  "OpenTelemetry",
];

const RCA_MODELS = [
  { name: "WAN Provider", conf: 92, tone: "rose" },
  { name: "Access Switch", conf: 88, tone: "amber" },
  { name: "Core Switch", conf: 81, tone: "amber" },
  { name: "Firewall", conf: 74, tone: "blue" },
  { name: "ISP", conf: 68, tone: "blue" },
  { name: "BGP", conf: 52, tone: "slate" },
  { name: "DNS", conf: 44, tone: "slate" },
  { name: "Application", conf: 31, tone: "slate" },
] as const;

const AUTOMATIONS = [
  { name: "Restart Interface", tier: "green", time: "8s", risk: 12, success: 99.4 },
  { name: "Bounce VPN", tier: "green", time: "14s", risk: 18, success: 98.1 },
  { name: "Reset BGP", tier: "yellow", time: "22s", risk: 41, success: 94.7 },
  { name: "Restart SD-WAN Tunnel", tier: "green", time: "11s", risk: 15, success: 98.9 },
  { name: "Move Traffic", tier: "yellow", time: "34s", risk: 46, success: 96.2 },
  { name: "Modify Routing Preference", tier: "red", time: "48s", risk: 72, success: 92.1 },
  { name: "Drain Circuit", tier: "yellow", time: "27s", risk: 39, success: 95.4 },
  { name: "Create Incident", tier: "green", time: "3s", risk: 4, success: 99.9 },
  { name: "Notify Provider", tier: "green", time: "6s", risk: 2, success: 99.7 },
  { name: "Escalate Engineer", tier: "green", time: "4s", risk: 3, success: 99.8 },
  { name: "Collect Packet Capture", tier: "green", time: "18s", risk: 8, success: 99.1 },
  { name: "Run Diagnostics", tier: "green", time: "12s", risk: 5, success: 99.6 },
  { name: "Launch NetBrain", tier: "green", time: "9s", risk: 6, success: 99.3 },
  { name: "Validate DNS", tier: "green", time: "5s", risk: 3, success: 99.8 },
  { name: "Update ServiceNow", tier: "green", time: "3s", risk: 2, success: 99.9 },
  { name: "Shutdown Device", tier: "red", time: "12s", risk: 88, success: 91.2 },
  { name: "Change Firewall Policy", tier: "red", time: "42s", risk: 84, success: 90.5 },
];

const REASONING_LAYERS = [
  { name: "Anomaly Detection", model: "Isolation Forest + LSTM-AE", features: 142, acc: 96.4 },
  { name: "Correlation", model: "Graph Neural Network", features: 88, acc: 94.1 },
  { name: "Topology Mapping", model: "Deterministic + Embedding", features: 214, acc: 98.7 },
  { name: "Dependency Graph", model: "Neo4j Traversal", features: 67, acc: 97.2 },
  { name: "Pattern Matching", model: "Sequence Transformer", features: 176, acc: 92.8 },
  { name: "Historical Similarity", model: "FAISS + Cosine", features: 512, acc: 95.5 },
  { name: "ML Prediction", model: "XGBoost Ensemble", features: 128, acc: 93.6 },
  { name: "Risk Analysis", model: "Bayesian Belief Net", features: 46, acc: 96.1 },
  { name: "Root Cause Ranking", model: "Learn-to-Rank", features: 84, acc: 96.2 },
  { name: "Action Recommendation", model: "Policy RL + Rules", features: 38, acc: 97.4 },
];

const DATA_QUALITY = [
  { label: "Overall Confidence", value: 98.8, def: "Weighted aggregate of source freshness × completeness × schema fidelity." },
  { label: "Completeness", value: 99.1, def: "% of required fields present in each event." },
  { label: "Freshness", value: 99.7, def: "% of events arriving within contracted freshness SLA." },
  { label: "Latency", value: 4.1, unit: "sec", def: "Median ingest→queryable latency across producers." },
  { label: "Schema Drift", value: 0.0, unit: "%", def: "Rate of unannounced field/type changes." },
  { label: "Duplicate Records", value: 0.3, unit: "%", def: "Dedup residual after canonicalization." },
  { label: "Missing Fields", value: 0.4, unit: "%", def: "% of mandatory fields null on arrival." },
  { label: "Normalization", value: 100, unit: "%", def: "% of records mapped to canonical model." },
];

const KG_NODES = [
  "Site", "WAN", "Firewall", "Switch", "Router", "Circuit", "Application",
  "Business Service", "Users", "Incident",
];

/* ================= Small primitives ================= */
function tierColor(t: string) {
  if (t === "green") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (t === "yellow") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-rose-50 text-rose-700 ring-rose-200";
}
function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-100 ring-1 ring-slate-200 px-2.5 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-[12px] font-semibold text-slate-900 tabular-nums">{value}</div>
    </div>
  );
}

/* ================= PAGE ================= */
export default function SiteResilienceCoworker() {
  const [drawer, setDrawer] = useState<null | { title: string; body: React.ReactNode }>(null);
  const [selStage, setSelStage] = useState<string>("rca");
  const [selRca, setSelRca] = useState<string>("WAN Provider");
  const [telemetry, setTelemetry] = useState(() => buildTelemetry());
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTelemetry(buildTelemetry()), 2200);
    const p = setInterval(() => setPulse((v) => v + 1), 900);
    return () => { clearInterval(t); clearInterval(p); };
  }, []);

  const activeStageIdx = useMemo(
    () => WORKFLOW_STAGES.findIndex((s) => s.id === selStage),
    [selStage]
  );

  const openStage = (s: typeof WORKFLOW_STAGES[number]) => {
    setSelStage(s.id);
    setDrawer({
      title: `${s.label} — Engineering Detail`,
      body: <StageDrawer stage={s} />,
    });
  };

  return (
    <AppShell>
      <div className="min-h-full bg-gradient-to-b from-white via-slate-50 to-white text-slate-900">
        {/* Header */}
        <header className="px-6 pt-5 pb-4 border-b border-slate-200 sticky top-0 z-10 bg-white/85 backdrop-blur">
          <div className="flex items-start justify-between gap-6">
            <div>
              <Link
                to="/data-orchestration-twin/use-case-to-data-contract-mapper"
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-200 mb-2"
              >
                <ArrowLeft className="h-3 w-3" /> Back to Use Case Mapper
              </Link>
              <div className="text-[10px] uppercase tracking-[0.18em] text-blue-400 font-semibold">
                Digital Coworker · Engineering Profile
              </div>
              <h1 className="text-[26px] font-bold leading-tight mt-0.5">
                Site Resilience — Detect &amp; Isolate Network Issue
              </h1>
              <p className="text-[12px] text-slate-500 mt-1 max-w-3xl">
                The brain of the site-resilience coworker: everything it knows, how it reasons, what it consumes, what it can execute, and how every recommendation is derived.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <StatChip label="Status" value="Production" />
              <StatChip label="Version" value="3.2.4" />
              <StatChip label="Automation" value="L2 Autonomous" />
              <StatChip label="Confidence" value={`${(98.4 + Math.sin(pulse / 3) * 0.2).toFixed(1)}%`} />
              <StatChip label="Owner" value="RunOps AI" />
              <StatChip label="Domain" value="Network Ops" />
              <StatChip label="Knowledge" value="2026.07.01" />
              <StatChip label="Refreshed" value={`${(pulse % 60) + 1}s ago`} />
            </div>
          </div>
        </header>

        <div className="p-6 space-y-5">
          {/* Executive summary */}
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-8 rounded-xl bg-white ring-1 ring-slate-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <h2 className="text-[13px] font-semibold">Executive Summary</h2>
              </div>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Automatically detect, isolate, diagnose, and orchestrate remediation for enterprise network outages before users experience disruption — across branch, campus, plant, hospital, retail, and data-center estates.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Reduce MTTR","Reduce P1 incidents","Improve SLA","Improve UX","Reduce engineer workload","Prevent cascading failures","Improve resilience"].map((b) => (
                  <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/30">{b}</span>
                ))}
              </div>
            </div>
            <div className="col-span-4 grid grid-cols-2 gap-2">
              {[
                { l: "Expected MTTR ↓", v: "74%" },
                { l: "Detection", v: "<30s" },
                { l: "Isolation", v: "46s" },
                { l: "RCA Accuracy", v: "96.2%" },
                { l: "Automation Success", v: "91%" },
                { l: "P1 Prevented / mo", v: "38" },
              ].map((k) => (
                <div key={k.l} className="rounded-lg bg-white ring-1 ring-slate-200 p-3">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">{k.l}</div>
                  <div className="text-[18px] font-bold text-slate-900 tabular-nums">{k.v}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Workflow */}
          <section className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-blue-400" />
                <h2 className="text-[13px] font-semibold">Digital Coworker Workflow</h2>
              </div>
              <div className="text-[10px] text-slate-500">Click any stage for engineering detail</div>
            </div>
            <div className="flex items-stretch gap-1.5 overflow-x-auto pb-2">
              {WORKFLOW_STAGES.map((s, i) => {
                const active = selStage === s.id;
                const Icon = s.icon;
                const done = i < activeStageIdx;
                return (
                  <button
                    key={s.id}
                    onClick={() => openStage(s)}
                    className={`group flex-1 min-w-[110px] rounded-lg p-2.5 text-left ring-1 transition ${
                      active
                        ? "bg-blue-500/15 ring-blue-400/60 shadow-[0_0_0_1px_rgba(59,130,246,0.4)]"
                        : done
                        ? "bg-emerald-500/5 ring-emerald-500/25 hover:ring-emerald-400/50"
                        : "bg-slate-50 ring-slate-200 hover:ring-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-3.5 w-3.5 ${active ? "text-blue-700" : done ? "text-emerald-400" : "text-slate-500"}`} />
                      <div className="text-[9px] uppercase tracking-wider text-slate-500">Step {i + 1}</div>
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-slate-900">{s.label}</div>
                    <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${active ? "bg-blue-400" : done ? "bg-emerald-400" : "bg-slate-700"}`}
                        style={{ width: `${active ? 60 + (pulse % 40) : done ? 100 : 8}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Row: Data Contract + Data Sources */}
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-5 rounded-xl bg-white ring-1 ring-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-blue-400" />
                <h2 className="text-[13px] font-semibold">Data Contract Summary</h2>
                <span className="ml-auto text-[10px] text-slate-500">Schema v4.3 · 365d retention</span>
              </div>
              <ContractBlock label="Business Event" text="Network degradation detected" />
              <ContractBlock label="Trigger Conditions" list={[
                "Packet Loss > 5%", "Latency > SLA", "BGP Session Drop", "OSPF Neighbor Lost",
                "Interface Down", "High CRC Errors", "WAN Circuit Failure",
                "Wireless Controller Offline", "Firewall Session Failure", "VPN Tunnel Down",
              ]} />
              <div className="grid grid-cols-3 gap-2 mt-2">
                <MiniStat l="Frequency" v="Continuous" />
                <MiniStat l="Volume" v="2M/day" />
                <MiniStat l="Retention" v="365d" />
              </div>
            </div>

            <div className="col-span-7 rounded-xl bg-white ring-1 ring-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Boxes className="h-4 w-4 text-blue-400" />
                <h2 className="text-[13px] font-semibold">Data Sources</h2>
                <span className="ml-auto text-[10px] text-slate-500">{DATA_SOURCES.length} producers · live</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 max-h-[260px] overflow-auto pr-1">
                {DATA_SOURCES.map((src, i) => {
                  const seed = (i + pulse) % 7;
                  const ok = seed !== 3;
                  return (
                    <button
                      key={src}
                      onClick={() => setDrawer({
                        title: `${src} — Connector`,
                        body: <SourceDrawer name={src} />,
                      })}
                      className="text-left rounded-md bg-slate-50 ring-1 ring-slate-200 hover:ring-blue-500/40 p-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-medium text-slate-900 truncate">{src}</div>
                        <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
                      </div>
                      <div className="mt-1 flex justify-between text-[9px] text-slate-500 tabular-nums">
                        <span>{rand(5, 320)} ms</span>
                        <span>{rand(80, 12000)} rec/s</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Reasoning + RCA */}
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-7 rounded-xl bg-white ring-1 ring-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-blue-400" />
                <h2 className="text-[13px] font-semibold">AI Reasoning Engine</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {REASONING_LAYERS.map((l, i) => (
                  <div key={l.name} className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-2.5">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-slate-900">{i + 1}. {l.name}</div>
                      <div className="text-[10px] text-emerald-300 tabular-nums">{l.acc}%</div>
                    </div>
                    <div className="mt-1 flex justify-between text-[9px] text-slate-500">
                      <span>{l.model}</span>
                      <span className="tabular-nums">{l.features} feats</span>
                    </div>
                    <div className="mt-1.5 h-1 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400" style={{ width: `${l.acc}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-5 rounded-xl bg-white ring-1 ring-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-blue-400" />
                <h2 className="text-[13px] font-semibold">Root Cause Models</h2>
                <span className="ml-auto text-[10px] text-slate-500">Weighted confidence</span>
              </div>
              <div className="space-y-1.5">
                {RCA_MODELS.map((r) => {
                  const active = selRca === r.name;
                  return (
                    <button
                      key={r.name}
                      onClick={() => {
                        setSelRca(r.name);
                        setDrawer({ title: `${r.name} — Root Cause Model`, body: <RcaDrawer name={r.name} conf={r.conf} /> });
                      }}
                      className={`w-full text-left rounded-md p-2 ring-1 ${
                        active ? "bg-blue-500/15 ring-blue-400/60" : "bg-slate-50 ring-slate-200 hover:ring-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-900">{r.name}</span>
                        <span className="tabular-nums text-slate-600">{r.conf}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400"
                          style={{ width: `${r.conf}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Knowledge Graph + Confidence */}
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-7 rounded-xl bg-white ring-1 ring-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Network className="h-4 w-4 text-blue-400" />
                <h2 className="text-[13px] font-semibold">Knowledge Graph</h2>
                <span className="ml-auto text-[10px] text-slate-500">Live topology · hover a node</span>
              </div>
              <KgSvg pulse={pulse} onNode={(n) => setDrawer({ title: `${n} — Graph Node`, body: <NodeDrawer name={n} /> })} />
            </div>
            <div className="col-span-5 rounded-xl bg-white ring-1 ring-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Gauge className="h-4 w-4 text-blue-400" />
                <h2 className="text-[13px] font-semibold">Confidence Engine</h2>
              </div>
              <ConfidenceGauge pulse={pulse} />
              <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px]">
                {["Telemetry", "Historical Similarity", "Topology", "CMDB", "User Impact", "App Impact", "Current Health", "Data Freshness", "AI Agreement"].map((f, i) => (
                  <div key={f} className="flex items-center justify-between rounded bg-slate-50 ring-1 ring-slate-200 px-2 py-1">
                    <span className="text-slate-600">{f}</span>
                    <span className="tabular-nums text-emerald-300">{(88 + ((i + pulse) % 11)).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Automation Library */}
          <section className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-blue-400" />
              <h2 className="text-[13px] font-semibold">Automation Library</h2>
              <span className="ml-auto text-[10px] text-slate-500">Human Approval Matrix · Green: autonomous · Yellow: recommend · Red: approval</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {AUTOMATIONS.map((a) => (
                <button
                  key={a.name}
                  onClick={() => setDrawer({ title: `${a.name} — Automation`, body: <AutomationDrawer a={a} /> })}
                  className="text-left rounded-lg bg-slate-50 ring-1 ring-slate-200 hover:ring-blue-500/40 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-slate-900">{a.name}</div>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full ring-1 ${tierColor(a.tier)}`}>{a.tier === "green" ? "Auto" : a.tier === "yellow" ? "Recommend" : "Approve"}</span>
                  </div>
                  <div className="mt-1.5 grid grid-cols-3 gap-1 text-[9px] text-slate-500">
                    <div><span className="text-slate-500">time </span><span className="text-slate-200 tabular-nums">{a.time}</span></div>
                    <div><span className="text-slate-500">risk </span><span className="text-slate-200 tabular-nums">{a.risk}</span></div>
                    <div><span className="text-slate-500">succ </span><span className="text-emerald-300 tabular-nums">{a.success}%</span></div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Data Quality */}
          <section className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <h2 className="text-[13px] font-semibold">Data Quality</h2>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {DATA_QUALITY.map((d) => (
                <div key={d.label} title={d.def} className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-2.5">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">{d.label}</div>
                  <div className="text-[16px] font-bold text-slate-900 tabular-nums mt-0.5">
                    {d.value}{d.unit ? <span className="text-[10px] text-slate-500 ml-0.5">{d.unit}</span> : "%"}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Live Telemetry */}
          <section className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-blue-400" />
              <h2 className="text-[13px] font-semibold">Live Enterprise Telemetry</h2>
              <span className="ml-auto text-[10px] text-slate-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> streaming
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {telemetry.rows.map((r, i) => (
                <div key={i} className="rounded-md bg-slate-50 ring-1 ring-slate-200 p-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{r.site}</span>
                    <span className={r.loss > 3 ? "text-rose-300" : r.loss > 1 ? "text-amber-300" : "text-emerald-300"}>{r.loss}% loss</span>
                  </div>
                  <div className="mt-1 text-slate-200 font-medium truncate">{r.device}</div>
                  <div className="text-slate-500">{r.isp} · {r.region}</div>
                  <div className="mt-1 flex justify-between text-slate-500 tabular-nums">
                    <span>{r.lat}ms</span><span>{r.bw} Gbps</span><span>cpu {r.cpu}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-[10px]">
              <MiniStat l="Interfaces monitored" v={telemetry.ifaces.toLocaleString()} />
              <MiniStat l="Events / sec" v={telemetry.eps.toLocaleString()} />
              <MiniStat l="Active incidents" v={String(telemetry.incidents)} />
              <MiniStat l="MTTD (rolling)" v={`${telemetry.mttd}s`} />
            </div>
          </section>

          {/* Success Metrics */}
          <section className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <h2 className="text-[13px] font-semibold">Success Metrics</h2>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {[
                ["MTTD","28s"],["MTTR","6m 12s"],["Automation %","91%"],["Engineer Hours Saved / mo","1,840"],
                ["P1 Avoided","38"],["SLA Compliance","99.94%"],["User Impact Prevented","4.1M sessions"],
                ["Financial Savings / mo","$2.7M"],["Availability","99.982%"],["Mean Confidence","98.6%"],
                ["Incident Accuracy","96.2%"],["Continuous Learning","+2.4% MoM"],
              ].map(([l,v]) => (
                <div key={l} className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-2.5">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">{l}</div>
                  <div className="text-[15px] font-bold text-slate-900 tabular-nums">{v}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right engineering drawer */}
        <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
          <SheetContent side="right" className="w-[520px] sm:max-w-[520px] bg-white text-slate-900 border-l border-slate-200 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-slate-900 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-400" />
                {drawer?.title}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4">{drawer?.body}</div>
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}

/* ================= Drawer bodies ================= */
function StageDrawer({ stage }: { stage: typeof WORKFLOW_STAGES[number] }) {
  return (
    <Tabs defaultValue="exec" className="w-full">
      <TabsList className="grid grid-cols-4 bg-slate-100 text-[11px]">
        <TabsTrigger value="exec">Exec</TabsTrigger>
        <TabsTrigger value="tech">Technical</TabsTrigger>
        <TabsTrigger value="contract">Contract</TabsTrigger>
        <TabsTrigger value="ops">Ops</TabsTrigger>
      </TabsList>
      <TabsContent value="exec" className="mt-3 space-y-2 text-[12px] text-slate-600">
        <DrawerLine k="Purpose" v={stage.desc} />
        <DrawerLine k="Business Value" v="Reduces MTTR, protects SLA, prevents cascading impact across dependent services." />
        <DrawerLine k="Owner" v="RunOps AI Platform · NetOps Guild" />
      </TabsContent>
      <TabsContent value="tech" className="mt-3 space-y-2 text-[12px] text-slate-600">
        <DrawerLine k="Models Used" v="GNN + Transformer + XGBoost ensemble" />
        <DrawerLine k="Feature Engineering" v="Rolling entropy, sequence embeddings, topology walk features" />
        <DrawerLine k="Reasoning Chain" v="Symptom → correlated signals → dependency projection → weighted candidates → ranked cause" />
        <DrawerLine k="APIs / MCP" v="/mcp/network/isolate · /api/topology/hydrate · /mcp/rca/rank" />
      </TabsContent>
      <TabsContent value="contract" className="mt-3 space-y-2 text-[12px] text-slate-600">
        <pre className="text-[10px] bg-slate-100 ring-1 ring-slate-200 rounded p-3 overflow-auto">
{`{
  "event": "network.degradation.detected",
  "site_id": "string",
  "signals": ["packet_loss","latency","bgp","ospf","iface"],
  "freshness_sla_sec": 30,
  "confidence_min": 0.90
}`}
        </pre>
      </TabsContent>
      <TabsContent value="ops" className="mt-3 space-y-2 text-[12px] text-slate-600">
        <DrawerLine k="Rollback" v="Snapshotted routing + config diff replay via NetBrain" />
        <DrawerLine k="Failure Modes" v="Partial telemetry loss, stale CMDB, conflicting change window" />
        <DrawerLine k="Audit" v="Every decision + evidence chain persisted to immutable ledger" />
      </TabsContent>
    </Tabs>
  );
}

function SourceDrawer({ name }: { name: string }) {
  return (
    <div className="space-y-2 text-[12px] text-slate-600">
      <DrawerLine k="Connector" v={name} />
      <DrawerLine k="Auth" v={pick(["OAuth2", "mTLS", "API key (rotating)", "IAM role"]) as string} />
      <DrawerLine k="Refresh" v={`${rand(5, 60)}s`} />
      <DrawerLine k="Records/sec" v={`${rand(200, 18000).toLocaleString()}`} />
      <DrawerLine k="Schema" v="v4.3 (canonicalized)" />
      <DrawerLine k="Owner" v="NetOps Platform" />
    </div>
  );
}

function RcaDrawer({ name, conf }: { name: string; conf: number }) {
  return (
    <div className="space-y-2 text-[12px] text-slate-600">
      <DrawerLine k="Confidence" v={`${conf}%`} />
      <DrawerLine k="Signals" v="packet loss, jitter, BGP flaps, syslog errors, tunnel state" />
      <DrawerLine k="Correlations" v="Change ledger, provider status, ThousandEyes path metrics" />
      <DrawerLine k="Historical Incidents" v={`${rand(4, 42)} similar in last 90d`} />
      <DrawerLine k="Recommended Actions" v={`${name === "WAN Provider" ? "Drain circuit, notify provider" : "Restart interface, revalidate"}`} />
    </div>
  );
}

function AutomationDrawer({ a }: { a: typeof AUTOMATIONS[number] }) {
  return (
    <div className="space-y-2 text-[12px] text-slate-600">
      <DrawerLine k="Automation ID" v={`auto.${a.name.toLowerCase().replace(/\s+/g, "_")}`} />
      <DrawerLine k="Approval" v={a.tier === "red" ? "Required (Change Advisory)" : a.tier === "yellow" ? "Recommend + owner ack" : "None (autonomous)"} />
      <DrawerLine k="Execution Time" v={a.time} />
      <DrawerLine k="Risk Score" v={String(a.risk)} />
      <DrawerLine k="Rollback" v="Config snapshot, replayable via NetBrain" />
      <DrawerLine k="Success Rate" v={`${a.success}%`} />
    </div>
  );
}

function NodeDrawer({ name }: { name: string }) {
  return (
    <div className="space-y-2 text-[12px] text-slate-600">
      <DrawerLine k="Node" v={name} />
      <DrawerLine k="Dependencies" v="Upstream and downstream relationships mapped via CMDB + live traces" />
      <DrawerLine k="Blast Radius" v={`${rand(2, 34)} services · ${rand(120, 4200)} users`} />
      <DrawerLine k="Owner" v={pick(["NetOps","SREOps","Platform Eng","CloudOps"]) as string} />
    </div>
  );
}

/* ================= Small primitives ================= */
function DrawerLine({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-slate-100 ring-1 ring-slate-200 p-2.5">
      <div className="text-[9px] uppercase tracking-wider text-slate-500">{k}</div>
      <div className="text-slate-200 leading-relaxed">{v}</div>
    </div>
  );
}
function ContractBlock({ label, text, list }: { label: string; text?: string; list?: string[] }) {
  return (
    <div className="mb-2">
      <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">{label}</div>
      {text && <div className="text-[12px] text-slate-200">{text}</div>}
      {list && (
        <div className="flex flex-wrap gap-1">
          {list.map((x) => (
            <span key={x} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 ring-1 ring-slate-200 text-slate-600">{x}</span>
          ))}
        </div>
      )}
    </div>
  );
}
function MiniStat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-md bg-slate-50 ring-1 ring-slate-200 p-2">
      <div className="text-[9px] uppercase tracking-wider text-slate-500">{l}</div>
      <div className="text-[12px] text-slate-900 font-semibold tabular-nums">{v}</div>
    </div>
  );
}

/* ================= Knowledge Graph SVG ================= */
function KgSvg({ pulse, onNode }: { pulse: number; onNode: (n: string) => void }) {
  const cx = 320, cy = 170, R = 140;
  const positions = KG_NODES.map((n, i) => {
    const a = (i / KG_NODES.length) * Math.PI * 2 - Math.PI / 2;
    return { n, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
  });
  return (
    <svg viewBox="0 0 640 340" className="w-full h-[280px]">
      <defs>
        <radialGradient id="core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={40 + (pulse % 6)} fill="url(#core)" opacity={0.5} />
      {positions.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#334155" strokeWidth={1} strokeDasharray="2 3" />
      ))}
      {positions.map((p, i) => {
        const glow = (pulse + i) % KG_NODES.length === i % 3;
        return (
          <g key={p.n} className="cursor-pointer" onClick={() => onNode(p.n)}>
            <circle cx={p.x} cy={p.y} r={glow ? 16 : 12} fill="#0f172a" stroke={glow ? "#60a5fa" : "#475569"} strokeWidth={glow ? 2 : 1} />
            <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize="9" fill="#e2e8f0" fontWeight="600">{p.n.split(" ")[0]}</text>
          </g>
        );
      })}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="#93c5fd" fontWeight="700">SITE</text>
    </svg>
  );
}

/* ================= Confidence Gauge ================= */
function ConfidenceGauge({ pulse }: { pulse: number }) {
  const value = 96 + (pulse % 4);
  const C = 2 * Math.PI * 60;
  const dash = (value / 100) * C;
  return (
    <div className="relative flex items-center justify-center py-2">
      <svg viewBox="0 0 160 160" className="w-[180px] h-[180px]">
        <circle cx="80" cy="80" r="60" stroke="#1e293b" strokeWidth="14" fill="none" />
        <circle
          cx="80" cy="80" r="60"
          stroke="url(#g1)" strokeWidth="14" fill="none" strokeLinecap="round"
          strokeDasharray={`${dash} ${C - dash}`} transform="rotate(-90 80 80)"
        />
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <text x="80" y="78" textAnchor="middle" fontSize="26" fontWeight="800" fill="#e2e8f0">{value}%</text>
        <text x="80" y="98" textAnchor="middle" fontSize="9" fill="#64748b">Overall confidence</text>
      </svg>
    </div>
  );
}

/* ================= Telemetry builder ================= */
function buildTelemetry() {
  const rows = Array.from({ length: 12 }, () => ({
    site: pick(SITES),
    device: `${pick([...CISCO, ...JUNIPER])}`,
    isp: pick(ISPS),
    region: pick(REGIONS),
    lat: rand(4, 180),
    loss: +(Math.random() * 6).toFixed(2),
    bw: rand(1, 40),
    cpu: rand(8, 96),
  }));
  return {
    rows,
    ifaces: rand(48000, 96000),
    eps: rand(180000, 640000),
    incidents: rand(2, 14),
    mttd: rand(18, 42),
  };
}
