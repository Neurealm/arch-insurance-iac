import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Sparkles, Clock, Gauge, Activity, Zap, Cpu, Database, Cloud, Shield,
  Boxes, Server, Radio, Layers, GitBranch, Workflow, Network, ShieldCheck,
  CheckCircle2, AlertTriangle, XCircle, Timer, Info, ChevronRight, Play, Settings2,
  CalendarClock, TrendingUp, TrendingDown, DollarSign, Waves, GitMerge, Filter, Brain,
  RefreshCw, HardDrive, Archive, Trash2, PackageSearch, FlaskConical, LineChart, Fingerprint,
} from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Line as DreiLine, Html } from "@react-three/drei";
import * as THREE from "three";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* -------------------- deterministic RNG per source -------------------- */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedOf(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* -------------------- source catalog -------------------- */
type Meta = {
  desc: string; domain: string; platform: string; icon: any; color: string;
  strategy: string; ingestion: string; family: "security" | "network" | "cloud" | "observability" | "platform" | "governance" | "finops" | "integration";
};
const CATALOG: Record<string, Meta> = {
  panw_ngfw_traffic_raw:    { desc:"NGFW Traffic Logs",     domain:"Security",       platform:"Cortex XSIAM", icon:Shield,   color:"#f59e0b", strategy:"Query on Demand",     ingestion:"Event-Driven",     family:"security" },
  panw_ngfw_system_raw:     { desc:"NGFW System Events",    domain:"Security",       platform:"Cortex XSIAM", icon:Shield,   color:"#f59e0b", strategy:"15 Min Refresh",       ingestion:"Micro-batching",   family:"security" },
  firewall_threat_logs:     { desc:"Threat / URL / Content",domain:"Security",       platform:"Cortex XSIAM", icon:Shield,   color:"#f43f5e", strategy:"Hourly Delta",         ingestion:"Micro-batching",   family:"security" },
  vpn_globalprotect_logs:   { desc:"GlobalProtect VPN",     domain:"Network",        platform:"Cortex XSIAM", icon:Network,  color:"#f59e0b", strategy:"6 Hour Refresh",       ingestion:"Scheduled Batch",  family:"network" },
  gcp_billing_export:       { desc:"GCP Billing Export",    domain:"FinOps",         platform:"BigQuery",     icon:Database, color:"#3b82f6", strategy:"24 HR Diff Refresh",   ingestion:"Scheduled Batch",  family:"finops" },
  gcp_cloud_audit_logs:     { desc:"Cloud Audit Logs",      domain:"Governance",     platform:"BigQuery",     icon:Database, color:"#3b82f6", strategy:"24 HR Diff Refresh",   ingestion:"Scheduled Batch",  family:"governance" },
  logicmonitor_device_stats:{ desc:"Device Performance",    domain:"Infra",          platform:"LogicMonitor", icon:Activity, color:"#10b981", strategy:"15 Min Refresh",       ingestion:"Micro-batching",   family:"observability" },
  logicmonitor_alerts:      { desc:"Infrastructure Alerts", domain:"Infra",          platform:"LogicMonitor", icon:Activity, color:"#10b981", strategy:"Hourly Delta",         ingestion:"Event-Driven",     family:"observability" },
  datadog_metrics:          { desc:"Metrics & Events",      domain:"Observability",  platform:"Datadog",      icon:Cloud,    color:"#8b5cf6", strategy:"Adaptive Streaming",   ingestion:"Continuous Streaming", family:"observability" },
  k8s_cluster_logs:         { desc:"Kubernetes Logs",       domain:"Platform",       platform:"Kubernetes API",icon:Boxes,   color:"#06b6d4", strategy:"Hybrid Streaming",     ingestion:"Continuous Streaming", family:"platform" },
  file_ingest_sftp:         { desc:"Partner File Ingest",   domain:"Integration",    platform:"SFTP",         icon:Server,   color:"#64748b", strategy:"Daily Snapshot",       ingestion:"Scheduled Batch",  family:"integration" },
  threat_intel_feeds:       { desc:"External Threat Feeds", domain:"Security",       platform:"Public API",   icon:Shield,   color:"#f43f5e", strategy:"6 Hour Refresh",       ingestion:"Event-Driven",     family:"security" },
};
const FALLBACK: Meta = { desc:"Log Source", domain:"Platform", platform:"Custom", icon:Database, color:"#6366f1", strategy:"Adaptive", ingestion:"Adaptive Streaming", family:"platform" };

/* -------------------- lifecycle stages -------------------- */
const STAGES = [
  { key:"Fetch",         icon:Radio,       color:"#3b82f6" },
  { key:"Normalize",     icon:Filter,      color:"#0ea5e9" },
  { key:"Hydrate",       icon:Waves,       color:"#06b6d4" },
  { key:"Validate",      icon:ShieldCheck, color:"#10b981" },
  { key:"Enrich",        icon:Sparkles,    color:"#8b5cf6" },
  { key:"Deduplicate",   icon:GitMerge,    color:"#a855f7" },
  { key:"Quality Gate",  icon:Gauge,       color:"#22c55e" },
  { key:"Classify",      icon:Layers,      color:"#14b8a6" },
  { key:"AI Analysis",   icon:Brain,       color:"#c084fc" },
  { key:"Index",         icon:PackageSearch,color:"#0284c7" },
  { key:"Governance",    icon:Shield,      color:"#0891b2" },
  { key:"Publish",       icon:GitBranch,   color:"#2563eb" },
  { key:"Archive",       icon:Archive,     color:"#f59e0b" },
  { key:"Delete",        icon:Trash2,      color:"#94a3b8" },
];

/* -------------------- scheduling categories -------------------- */
type CatOption = { label: string; delta: { latency: number; cost: number; risk: number; freshness: number }; };
type Category = { id: string; title: string; icon: any; description: string; options: CatOption[]; techs: string[]; };

function categoriesFor(rng: () => number): Category[] {
  return [
    { id:"ingest", title:"Ingestion Strategy", icon:Radio,
      description:"How events physically arrive from the source.",
      options:[
        { label:"Continuous Streaming", delta:{ latency:-42, cost:+18, risk:-8,  freshness:+55 } },
        { label:"Micro-batching",       delta:{ latency:-22, cost:+6,  risk:-4,  freshness:+30 } },
        { label:"Event-driven",         delta:{ latency:-30, cost:-4,  risk:-6,  freshness:+40 } },
        { label:"Scheduled Batch",      delta:{ latency:+18, cost:-24, risk:+2,  freshness:-25 } },
        { label:"Hybrid Streaming",     delta:{ latency:-24, cost:+8,  risk:-10, freshness:+38 } },
        { label:"Adaptive Streaming",   delta:{ latency:-36, cost:+2,  risk:-14, freshness:+48 } },
      ],
      techs:["Kafka","Azure Event Hub","Kinesis","Pulsar","OpenTelemetry Collector","Fluent Bit","Fluentd","Vector"] },
    { id:"freq", title:"Fetch Frequency", icon:Timer,
      description:"Cadence at which the pipeline reaches back to the source.",
      options:[
        { label:"Real-Time",   delta:{ latency:-50, cost:+30, risk:-10, freshness:+60 } },
        { label:"5 Seconds",   delta:{ latency:-40, cost:+22, risk:-8,  freshness:+55 } },
        { label:"30 Seconds",  delta:{ latency:-28, cost:+12, risk:-5,  freshness:+45 } },
        { label:"1 Minute",    delta:{ latency:-18, cost:+6,  risk:-3,  freshness:+35 } },
        { label:"5 Minutes",   delta:{ latency:-8,  cost:0,   risk:0,   freshness:+20 } },
        { label:"15 Minutes",  delta:{ latency:+4,  cost:-6,  risk:+2,  freshness:+5 } },
        { label:"Hourly",      delta:{ latency:+22, cost:-16, risk:+4,  freshness:-15 } },
        { label:"Adaptive",    delta:{ latency:-18, cost:-4,  risk:-6,  freshness:+30 } },
        { label:"AI Controlled",delta:{ latency:-24, cost:-10, risk:-10, freshness:+40 } },
      ],
      techs:["Airflow","Prefect","Dagster","Temporal","Snowflake Tasks","Azure Data Factory","Databricks Workflows"] },
    { id:"schema", title:"Schema Validation", icon:Filter,
      description:"When and how strictly the payload is verified.",
      options:[
        { label:"Every Event",             delta:{ latency:+12, cost:+6, risk:-16, freshness:-6 } },
        { label:"Per Batch",               delta:{ latency:+4,  cost:+2, risk:-8,  freshness:-2 } },
        { label:"Periodic",                delta:{ latency:-2,  cost:-2, risk:+4,  freshness:+2 } },
        { label:"AI Triggered",            delta:{ latency:+2,  cost:+4, risk:-12, freshness:0 } },
        { label:"Schema Drift Detection",  delta:{ latency:0,   cost:+3, risk:-14, freshness:0 } },
      ], techs:["Great Expectations","Schema Registry","Confluent","Protobuf","Avro","JSON Schema"] },
    { id:"hydrate", title:"Hydration Strategy", icon:Waves,
      description:"How auxiliary attributes are joined against the raw payload.",
      options:[
        { label:"Immediate",                    delta:{ latency:+18, cost:+22, risk:-4, freshness:+10 } },
        { label:"Deferred",                     delta:{ latency:-14, cost:-14, risk:+2, freshness:-4 } },
        { label:"Lazy Loading",                 delta:{ latency:-8,  cost:-18, risk:+4, freshness:-10 } },
        { label:"On Demand",                    delta:{ latency:-4,  cost:-22, risk:+6, freshness:-14 } },
        { label:"AI Prioritized",               delta:{ latency:-6,  cost:-10, risk:-6, freshness:+8 } },
        { label:"Hydrate Critical Fields First",delta:{ latency:-10, cost:-8,  risk:-8, freshness:+12 } },
      ], techs:["Redis","Materialize","DynamoDB","Feature Store","Snowflake","BigQuery"] },
    { id:"enrich", title:"Data Enrichment", icon:Sparkles,
      description:"When enrichment (geo, threat intel, business tags) is applied.",
      options:[
        { label:"Immediately",     delta:{ latency:+22, cost:+18, risk:-6, freshness:+8 } },
        { label:"Before Storage",  delta:{ latency:+8,  cost:+6,  risk:-4, freshness:+4 } },
        { label:"Before Analytics",delta:{ latency:+2,  cost:+2,  risk:0,  freshness:0 } },
        { label:"Before AI",       delta:{ latency:+4,  cost:+4,  risk:-8, freshness:0 } },
        { label:"After Archive",   delta:{ latency:-4,  cost:-14, risk:+6, freshness:-12 } },
        { label:"Event Driven",    delta:{ latency:-2,  cost:-6,  risk:-2, freshness:+2 } },
      ], techs:["GeoIP","MISP","VirusTotal","Snowflake Cortex","LLM Enrichment","Data Fusion"] },
    { id:"quality", title:"Data Quality Gates", icon:Gauge,
      description:"Rules that must pass before promotion downstream.",
      options:[
        { label:"Strict",                delta:{ latency:+16, cost:+10, risk:-18, freshness:-4 } },
        { label:"Advisory",              delta:{ latency:+2,  cost:+2,  risk:+4,  freshness:0 } },
        { label:"Sample Validation",     delta:{ latency:+4,  cost:+4,  risk:0,   freshness:0 } },
        { label:"Progressive Validation",delta:{ latency:+6,  cost:+6,  risk:-8,  freshness:-2 } },
        { label:"AI Assisted Validation",delta:{ latency:+4,  cost:+8,  risk:-14, freshness:0 } },
      ], techs:["Great Expectations","Soda","Monte Carlo","Bigeye","Deequ"] },
    { id:"dedup", title:"Deduplication", icon:GitMerge,
      description:"Strategy for suppressing repeat records.",
      options:[
        { label:"None",           delta:{ latency:-2,  cost:+12, risk:+6,  freshness:0 } },
        { label:"Real-Time",      delta:{ latency:+8,  cost:+6,  risk:-8,  freshness:+2 } },
        { label:"Sliding Window", delta:{ latency:+6,  cost:+2,  risk:-6,  freshness:0 } },
        { label:"Hash Matching",  delta:{ latency:+4,  cost:-6,  risk:-10, freshness:0 } },
        { label:"ML Similarity",  delta:{ latency:+10, cost:+8,  risk:-14, freshness:0 } },
      ], techs:["Bloom Filters","MinHash","xxHash","Redis Streams","Flink"] },
    { id:"retry", title:"Retry Policy", icon:RefreshCw,
      description:"Behavior when a stage fails.",
      options:[
        { label:"Linear",          delta:{ latency:+6, cost:+4, risk:+2,  freshness:-2 } },
        { label:"Exponential",     delta:{ latency:+8, cost:+2, risk:-6,  freshness:-4 } },
        { label:"Adaptive",        delta:{ latency:+4, cost:-2, risk:-10, freshness:-2 } },
        { label:"Priority Based",  delta:{ latency:+2, cost:0,  risk:-12, freshness:0 } },
        { label:"Circuit Breaker", delta:{ latency:0,  cost:-4, risk:-14, freshness:-4 } },
      ], techs:["Temporal","Restate","Kafka Retry Topics","Cadence"] },
    { id:"parallel", title:"Parallelization Strategy", icon:Cpu,
      description:"How work is distributed across workers.",
      options:[
        { label:"Sequential",   delta:{ latency:+30, cost:-14, risk:+6, freshness:-18 } },
        { label:"Parallel",     delta:{ latency:-22, cost:+10, risk:-4, freshness:+18 } },
        { label:"Dynamic",      delta:{ latency:-28, cost:+2,  risk:-8, freshness:+22 } },
        { label:"AI Optimized", delta:{ latency:-34, cost:-4,  risk:-12,freshness:+30 } },
        { label:"Priority Queue",delta:{ latency:-18, cost:0,   risk:-10,freshness:+16 } },
      ], techs:["Ray","Dask","Kubernetes Jobs","Spark","Flink"] },
    { id:"archive", title:"Archive Strategy", icon:Archive,
      description:"How cold data is stored, tiered, and eventually deleted.",
      options:[
        { label:"Immediate Archive",   delta:{ latency:0, cost:-18, risk:+4,  freshness:0 } },
        { label:"30 Days",             delta:{ latency:0, cost:-8,  risk:0,   freshness:0 } },
        { label:"90 Days",             delta:{ latency:0, cost:-2,  risk:0,   freshness:0 } },
        { label:"365 Days",            delta:{ latency:0, cost:+8,  risk:-2,  freshness:0 } },
        { label:"Intelligent Tiering", delta:{ latency:0, cost:-14, risk:-4,  freshness:0 } },
        { label:"Cold Storage",        delta:{ latency:0, cost:-22, risk:+6,  freshness:0 } },
        { label:"Object Storage",      delta:{ latency:0, cost:-10, risk:0,   freshness:0 } },
        { label:"Immutable Archive",   delta:{ latency:0, cost:+4,  risk:-16, freshness:0 } },
      ], techs:["S3 Glacier","GCS Nearline","Azure Blob Cool","MinIO","Snowflake Time Travel"] },
  ];
}

/* -------------------- generated telemetry -------------------- */
function generate(source: string) {
  const rng = mulberry32(seedOf(source));
  const meta = CATALOG[source] ?? { ...FALLBACK, desc: source };
  const eps = Math.round(25000 + rng() * 725000);
  const queueDepth = Math.round(50 + rng() * 19950);
  const latency = Math.round(20 + rng() * 580);
  const freshness = Math.round(2 + rng() * 88);
  const drift = +(rng() * 2).toFixed(2);
  const retryRate = +(rng() * 5).toFixed(2);
  const dedupSavings = Math.round(5 + rng() * 35);
  const compression = +(2 + rng() * 8).toFixed(1);
  const storageGrowth = +(0.5 + rng() * 14.5).toFixed(1);
  const aiSuccess = +(95 + rng() * 4.9).toFixed(2);
  const cost = Math.round(300 + rng() * 8700);
  const runtime = Math.round(20 + rng() * 300);
  const confidence = Math.round(82 + rng() * 16);
  const sla = Math.round(88 + rng() * 11);
  const cats = categoriesFor(rng);
  const recommendedIdx: Record<string, number> = {};
  cats.forEach(c => { recommendedIdx[c.id] = Math.floor(rng() * c.options.length); });
  const deps = [
    { from:"Source", to:"Fetcher",       throughput: `${(eps/1000).toFixed(1)}K/s`, latency: `${Math.round(latency*0.1)}ms`, errors: `${(rng()*0.4).toFixed(2)}%` },
    { from:"Fetcher", to:"Normalize",    throughput: `${(eps/1000).toFixed(1)}K/s`, latency: `${Math.round(latency*0.08)}ms`, errors: `${(rng()*0.2).toFixed(2)}%` },
    { from:"Normalize", to:"Enrich",     throughput: `${(eps/1050).toFixed(1)}K/s`, latency: `${Math.round(latency*0.14)}ms`, errors: `${(rng()*0.3).toFixed(2)}%` },
    { from:"Enrich", to:"AI",            throughput: `${(eps/1200).toFixed(1)}K/s`, latency: `${Math.round(latency*0.22)}ms`, errors: `${(rng()*0.5).toFixed(2)}%` },
    { from:"AI", to:"Index",             throughput: `${(eps/1300).toFixed(1)}K/s`, latency: `${Math.round(latency*0.12)}ms`, errors: `${(rng()*0.4).toFixed(2)}%` },
    { from:"Index", to:"Governance",     throughput: `${(eps/1400).toFixed(1)}K/s`, latency: `${Math.round(latency*0.10)}ms`, errors: `${(rng()*0.2).toFixed(2)}%` },
    { from:"Governance", to:"Archive",   throughput: `${(eps/2000).toFixed(1)}K/s`, latency: `${Math.round(latency*0.18)}ms`, errors: `${(rng()*0.1).toFixed(2)}%` },
  ];
  const opportunities = [
    "Move hydration after validation to reclaim 18% of pipeline runtime.",
    "Split enrichment into 4 parallel workers to reduce backpressure.",
    "Increase worker pool during 09:00–17:00 to absorb peak volume.",
    "Delay archive until batch complete to lower egress cost by 22%.",
    "Introduce adaptive batching between Fetch and Normalize.",
    "Move AI inference closer to ingestion to cut cross-region hops.",
    "Replace polling with events for LogicMonitor alerts.",
    "Use streaming only during business hours; fall back to 15m outside.",
  ];
  const calendar: number[] = Array.from({ length: 24 }, (_, h) => {
    const business = h >= 8 && h <= 20 ? 1.4 : 0.6;
    return Math.round((0.3 + rng() * 0.7) * 100 * business);
  });
  return { meta, eps, queueDepth, latency, freshness, drift, retryRate, dedupSavings, compression, storageGrowth, aiSuccess, cost, runtime, confidence, sla, cats, recommendedIdx, deps, opportunities, calendar };
}

/* -------------------- 3D pipeline scene -------------------- */
function Packet({ path, color, speed, offset }: { path: [number, number, number][]; color: string; speed: number; offset: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = ((s.clock.getElapsedTime() * speed + offset) % 1);
    const idx = Math.min(path.length - 2, Math.floor(t * (path.length - 1)));
    const frac = t * (path.length - 1) - idx;
    const a = path[idx], b = path[idx + 1];
    if (ref.current) ref.current.position.set(a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac + 0.15, a[2] + (b[2] - a[2]) * frac);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
    </mesh>
  );
}

function StagePlatform({ pos, color, label, active, onHover }: { pos: [number, number, number]; color: string; label: string; active: boolean; onHover: (v: boolean) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => { if (ref.current) { const scale = active ? 1.08 + Math.sin(s.clock.getElapsedTime() * 3) * 0.04 : 1; ref.current.scale.set(scale, scale, scale); } });
  return (
    <group position={pos}>
      <mesh ref={ref} onPointerOver={() => onHover(true)} onPointerOut={() => onHover(false)}>
        <cylinderGeometry args={[0.55, 0.6, 0.14, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.7 : 0.28} metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <Html center position={[0, -0.4, 0]} distanceFactor={8}>
        <div className="text-[9px] font-semibold text-slate-100 bg-slate-900/70 px-1.5 py-0.5 rounded whitespace-nowrap">{label}</div>
      </Html>
    </group>
  );
}

function Pipeline3D({ colors, activeIdx, setActive }: { colors: string[]; activeIdx: number; setActive: (i: number) => void }) {
  const n = STAGES.length;
  const positions: [number, number, number][] = STAGES.map((_, i) => {
    const t = i / (n - 1);
    const x = (t - 0.5) * 10;
    const z = Math.sin(t * Math.PI * 1.5) * 1.6;
    return [x, 0, z];
  });
  return (
    <Canvas camera={{ position: [0, 4.5, 7], fov: 45 }}>
      <color attach="background" args={["#0b1220"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} />
      <pointLight position={[-5, 3, -3]} intensity={0.6} color="#8b5cf6" />
      {/* platforms */}
      {STAGES.map((s, i) => (
        <StagePlatform key={s.key} pos={positions[i]} color={colors[i % colors.length]} label={s.key} active={i === activeIdx} onHover={(v) => v && setActive(i)} />
      ))}
      {/* connecting lines */}
      {positions.slice(0, -1).map((p, i) => (
        <DreiLine key={i} points={[p, positions[i + 1]] as any} color={colors[i % colors.length]} lineWidth={1.2} transparent opacity={0.55} />
      ))}
      {/* flowing packets */}
      {Array.from({ length: 22 }).map((_, i) => (
        <Packet key={i} path={positions} color={STAGES[i % STAGES.length].color} speed={0.08 + (i % 5) * 0.015} offset={i * 0.05} />
      ))}
      {/* floor grid */}
      <gridHelper args={[16, 16, "#1e293b", "#0f172a"]} position={[0, -0.6, 0]} />
      <Float floatIntensity={0.4} rotationIntensity={0.2}>
        <mesh position={[0, 2.6, -3]}>
          <torusGeometry args={[0.6, 0.05, 12, 60]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.9} />
        </mesh>
      </Float>
      <OrbitControls enablePan={false} minDistance={5} maxDistance={14} autoRotate autoRotateSpeed={0.6} />
    </Canvas>
  );
}

/* -------------------- helpers -------------------- */
const Spark = ({ points, color = "#3b82f6", w = 84, h = 26 }: { points: number[]; color?: string; w?: number; h?: number }) => {
  const min = Math.min(...points), max = Math.max(...points);
  const d = points.map((v, i) => { const x = (i / (points.length - 1)) * w; const y = h - ((v - min) / Math.max(1e-6, max - min)) * h; return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`; }).join(" ");
  return <svg width={w} height={h} className="overflow-visible"><path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" /></svg>;
};

function Gauge2({ value, label, color }: { value: number; label: string; color: string }) {
  const angle = Math.min(180, Math.max(0, value * 1.8));
  const rad = (angle - 90) * (Math.PI / 180);
  const x = 40 + Math.cos(rad) * 32; const y = 42 + Math.sin(rad) * 32;
  const large = angle > 180 ? 1 : 0;
  return (
    <div className="flex flex-col items-center">
      <svg width="80" height="52">
        <path d="M 8 42 A 32 32 0 0 1 72 42" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
        <path d={`M 8 42 A 32 32 0 ${large} 1 ${x.toFixed(1)} ${y.toFixed(1)}`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <text x="40" y="40" textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: "#0f172a" }}>{Math.round(value)}%</text>
      </svg>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

/* -------------------- page -------------------- */
export default function ScheduleBuilder() {
  const { slug = "" } = useParams();
  const source = decodeURIComponent(slug);
  const gen = useMemo(() => generate(source), [source]);
  const Icon = gen.meta.icon;
  const [activeStage, setActiveStage] = useState(0);
  const [selection, setSelection] = useState<Record<string, number>>(() => ({ ...gen.recommendedIdx }));
  const [open, setOpen] = useState(false);
  const [openContext, setOpenContext] = useState<string>("");
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(v => (v + 1) % 1_000_000), 1500); return () => clearInterval(t); }, []);

  // predicted outcomes recompute from selection deltas
  const predicted = useMemo(() => {
    let latency = 100, cost = 100, risk = 100, freshness = 100;
    for (const c of gen.cats) {
      const o = c.options[selection[c.id]];
      if (!o) continue;
      latency += o.delta.latency;
      cost += o.delta.cost;
      risk += o.delta.risk;
      freshness += o.delta.freshness;
    }
    return {
      latency: Math.max(20, Math.min(220, latency)),
      cost: Math.max(20, Math.min(220, cost)),
      risk: Math.max(10, Math.min(200, risk)),
      freshness: Math.max(20, Math.min(220, freshness)),
    };
  }, [selection, gen.cats]);

  const sparkFreshness = useMemo(() => Array.from({ length: 12 }, (_, i) => 40 + Math.round(Math.sin(i + tick / 3) * 6) + i), [tick]);
  const sparkLatency = useMemo(() => Array.from({ length: 12 }, (_, i) => gen.latency - 20 + Math.round(Math.cos(i + tick / 4) * 8)), [tick, gen.latency]);

  const stageColors = STAGES.map(s => s.color);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/data-orchestration-twin/fetch-orchestration-scheduler" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-3.5 w-3.5" /> Fetch Orchestration Scheduler
            </Link>
            <div className="text-slate-300">/</div>
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium ring-1 ring-indigo-100">
              <CalendarClock className="h-3.5 w-3.5" /> Schedule Builder
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-xs px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1"><Settings2 className="h-3.5 w-3.5"/>Configure</button>
            <button className="text-xs px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center gap-1"><Play className="h-3.5 w-3.5"/>Simulate</button>
          </div>
        </div>
        <div className="px-8 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg inline-flex items-center justify-center" style={{ backgroundColor: `${gen.meta.color}14`, color: gen.meta.color }}>
              <Icon className="h-5 w-5"/>
            </div>
            <div>
              <div className="text-xs text-slate-500">{gen.meta.platform} · {gen.meta.domain}</div>
              <div className="text-xl font-semibold tracking-tight text-slate-900">Lifecycle Scheduler — {source || "log source"}</div>
              <div className="text-xs text-slate-500">AI Scheduling Recommendation Engine · {gen.meta.desc}</div>
            </div>
          </div>
          {/* header metric strip */}
          <div className="mt-4 grid grid-cols-9 gap-2 text-[11px]">
            {[
              { l:"Strategy",           v: gen.meta.strategy,                     tone:"indigo" },
              { l:"Ingestion",          v: gen.meta.ingestion,                    tone:"cyan" },
              { l:"Confidence",         v: `${gen.confidence}%`,                  tone:"emerald" },
              { l:"Freshness",          v: `${gen.freshness}s`,                   tone:"blue" },
              { l:"Last Optimization",  v: "6 min ago",                           tone:"violet" },
              { l:"Avg Runtime",        v: `${gen.runtime}s`,                     tone:"slate" },
              { l:"Est. Daily Cost",    v: `$${gen.cost.toLocaleString()}`,       tone:"amber" },
              { l:"SLA",                v: `${gen.sla}%`,                         tone:"emerald" },
              { l:"Health",             v: gen.sla > 92 ? "Healthy" : "Watch",    tone: gen.sla > 92 ? "emerald" : "amber" },
            ].map((m, i) => (
              <div key={i} className="rounded-md border border-slate-200 bg-white px-2 py-2">
                <div className="text-[10px] text-slate-500">{m.l}</div>
                <div className="text-[12px] font-semibold text-slate-800 truncate" title={m.v}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3D + center */}
      <div className="px-8 pt-6 grid grid-cols-12 gap-4">
        {/* LEFT: scheduling decision library */}
        <div className="col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm p-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="text-xs font-semibold text-slate-700">Scheduling Considerations</div>
            <span className="text-[10px] text-slate-500">{gen.cats.length} decisions</span>
          </div>
          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {gen.cats.map((c) => {
              const CIcon = c.icon;
              const sel = c.options[selection[c.id]];
              const rec = c.options[gen.recommendedIdx[c.id]];
              const isRec = selection[c.id] === gen.recommendedIdx[c.id];
              return (
                <details key={c.id} className="group rounded-lg border border-slate-200 open:shadow-sm">
                  <summary className="cursor-pointer list-none px-2.5 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-6 w-6 rounded-md bg-slate-100 text-slate-600 inline-flex items-center justify-center"><CIcon className="h-3.5 w-3.5"/></div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-800 truncate">{c.title}</div>
                        <div className="text-[10px] text-slate-500 truncate">{sel.label}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isRec && <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-700">AI</span>}
                      <ChevronRight className="h-3 w-3 text-slate-400 group-open:rotate-90 transition"/>
                    </div>
                  </summary>
                  <div className="px-2.5 pb-2.5 pt-1 border-t border-slate-100 space-y-1.5">
                    <div className="text-[10px] text-slate-500">{c.description}</div>
                    <div className="space-y-1">
                      {c.options.map((o, i) => {
                        const isSel = selection[c.id] === i;
                        const isR = gen.recommendedIdx[c.id] === i;
                        return (
                          <button key={o.label} onClick={() => setSelection(s => ({ ...s, [c.id]: i }))}
                            className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] border transition ${isSel ? "border-indigo-300 bg-indigo-50 text-indigo-800" : "border-transparent hover:bg-slate-50 text-slate-700"}`}>
                            <div className="flex items-center justify-between">
                              <span className="truncate">{o.label}</span>
                              {isR && <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-700">Rec</span>}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-[9px] text-slate-500">
                              <span className={`inline-flex items-center gap-0.5 ${o.delta.latency < 0 ? "text-emerald-600" : "text-rose-600"}`}>lat {o.delta.latency > 0 ? "+" : ""}{o.delta.latency}</span>
                              <span className={`inline-flex items-center gap-0.5 ${o.delta.cost < 0 ? "text-emerald-600" : "text-amber-600"}`}>$ {o.delta.cost > 0 ? "+" : ""}{o.delta.cost}</span>
                              <span className={`inline-flex items-center gap-0.5 ${o.delta.risk < 0 ? "text-emerald-600" : "text-rose-600"}`}>risk {o.delta.risk > 0 ? "+" : ""}{o.delta.risk}</span>
                              <span className={`inline-flex items-center gap-0.5 ${o.delta.freshness > 0 ? "text-emerald-600" : "text-amber-600"}`}>fresh {o.delta.freshness > 0 ? "+" : ""}{o.delta.freshness}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      <div className="font-medium text-slate-600 mb-0.5">Typical technologies</div>
                      <div className="flex flex-wrap gap-1">
                        {c.techs.map(t => <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{t}</span>)}
                      </div>
                    </div>
                    <button onClick={() => { setOpenContext(c.title); setOpen(true); }} className="w-full text-[10px] mt-1 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center justify-center gap-1">
                      <Info className="h-3 w-3"/> Engineering detail
                    </button>
                  </div>
                </details>
              );
            })}
          </div>
        </div>

        {/* CENTER: 3D pipeline + timeline + dependency graph */}
        <div className="col-span-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-950 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 text-slate-200">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Digital Twin</div>
                <div className="text-sm font-semibold">Interactive Lifecycle Pipeline · {STAGES[activeStage].key}</div>
              </div>
              <div className="text-[10px] text-slate-400">{gen.eps.toLocaleString()} events/sec · queue {gen.queueDepth.toLocaleString()}</div>
            </div>
            <div className="h-[320px]">
              <Pipeline3D colors={stageColors} activeIdx={activeStage} setActive={setActiveStage} />
            </div>
            <div className="grid grid-cols-7 gap-1 p-2 bg-slate-900/70 text-[10px]">
              {STAGES.map((s, i) => {
                const SIcon = s.icon; const isA = i === activeStage;
                return (
                  <button key={s.key} onClick={() => setActiveStage(i)}
                    className={`px-1.5 py-1 rounded flex items-center gap-1 justify-center border ${isA ? "border-slate-400 bg-slate-800 text-white" : "border-slate-800 text-slate-300 hover:bg-slate-800/60"}`}>
                    <SIcon className="h-3 w-3" style={{ color: s.color }}/><span className="truncate">{s.key}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* animated horizontal lifecycle */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">Lifecycle Flow</div>
                <div className="text-[11px] text-slate-500">Records progressing through {STAGES.length} stages · live</div>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"/>flowing</div>
            </div>
            <div className="relative h-24 rounded-lg bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-100 overflow-hidden">
              {/* stage anchors */}
              <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200"/>
              {STAGES.map((s, i) => {
                const left = 12 + (i * (100 - 4)) / (STAGES.length - 1);
                return (
                  <div key={s.key} className="absolute -translate-x-1/2 flex flex-col items-center" style={{ left: `${left}%`, top: 6 }}>
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}` }}/>
                    <div className="mt-1 text-[8px] text-slate-500 whitespace-nowrap">{s.key}</div>
                  </div>
                );
              })}
              {/* moving packets */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="absolute top-[46%] h-2 w-2 rounded-full sb-packet"
                     style={{ left: 0, backgroundColor: STAGES[i % STAGES.length].color, animationDelay: `${i * 0.6}s`, boxShadow: `0 0 6px ${STAGES[i % STAGES.length].color}` }}/>
              ))}
            </div>
          </div>

          {/* dependency graph */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">Dynamic Dependency Graph</div>
                <div className="text-[11px] text-slate-500">Live throughput · latency · error rate per edge</div>
              </div>
              <div className="text-[10px] text-slate-500">Hover an edge for detail</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {gen.deps.map((d, i) => (
                <div key={i} className="rounded-md border border-slate-100 bg-slate-50/60 px-3 py-2 flex items-center justify-between">
                  <div className="text-[11px] text-slate-700"><span className="font-semibold">{d.from}</span> <span className="text-slate-400">→</span> <span className="font-semibold">{d.to}</span></div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="inline-flex items-center gap-1 text-slate-600"><Activity className="h-3 w-3"/>{d.throughput}</span>
                    <span className="inline-flex items-center gap-1 text-slate-600"><Timer className="h-3 w-3"/>{d.latency}</span>
                    <span className="inline-flex items-center gap-1 text-rose-600"><AlertTriangle className="h-3 w-3"/>{d.errors}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: outcomes + AI recommendation */}
        <div className="col-span-3 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="text-xs font-semibold text-slate-700">Predicted Outcomes</div>
            <div className="text-[11px] text-slate-500 mb-3">Recomputed from your selections</div>
            <div className="grid grid-cols-2 gap-2">
              <Gauge2 value={predicted.freshness / 2.2} label="Freshness" color="#10b981" />
              <Gauge2 value={100 - Math.abs(predicted.latency - 100) / 2} label="Latency Health" color="#3b82f6" />
              <Gauge2 value={100 - predicted.cost / 2.2} label="Cost Efficiency" color="#f59e0b" />
              <Gauge2 value={100 - predicted.risk / 2} label="Resilience" color="#8b5cf6" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
              <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">Pipeline Runtime</div><div className="font-semibold">{Math.round(gen.runtime * (predicted.latency / 100))}s</div></div>
              <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">Daily Cost</div><div className="font-semibold">${Math.round(gen.cost * (predicted.cost / 100)).toLocaleString()}</div></div>
              <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">AI Accuracy</div><div className="font-semibold">{gen.aiSuccess}%</div></div>
              <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">Storage Growth</div><div className="font-semibold">{gen.storageGrowth} TB/day</div></div>
              <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">Dedup Savings</div><div className="font-semibold">{gen.dedupSavings}%</div></div>
              <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">Compression</div><div className="font-semibold">{gen.compression}:1</div></div>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white shadow-sm p-4">
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold"><Brain className="h-4 w-4"/>AI Recommendation</div>
            <div className="mt-2 text-[11px] text-slate-700">
              For <span className="font-semibold">{source}</span> operating at <span className="font-semibold">{(gen.eps/1000).toFixed(0)}K events/sec</span>, the Digital Coworker recommends:
            </div>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-800">
              {gen.cats.map(c => (
                <li key={c.id} className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 mt-0.5 text-emerald-500"/>
                  <span><span className="text-slate-500">{c.title}:</span> <span className="font-medium">{c.options[gen.recommendedIdx[c.id]].label}</span></span>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-md bg-white border border-slate-200 p-2 text-[10px] text-slate-600">
              <div className="font-semibold text-slate-700 mb-1">Reasoning</div>
              Current event volume exceeds {Math.round(gen.eps / 1000)}K/s. The recommended strategy minimizes tail latency by {Math.abs(gen.recommendedIdx.freq * 6 + 12)}%, reduces cloud API calls via deferred hydration, and lifts search quality by {Math.round(15 + (gen.confidence % 12))}% through AI-prioritized enrichment.
            </div>
            <button onClick={() => setSelection({ ...gen.recommendedIdx })} className="mt-3 w-full text-[11px] py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center justify-center gap-1"><Sparkles className="h-3 w-3"/>Apply recommendation</button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="text-xs font-semibold text-slate-700">Live Signals</div>
            <div className="mt-2 space-y-2 text-[11px]">
              <div className="flex items-center justify-between"><span className="text-slate-500">Freshness</span><Spark points={sparkFreshness} color="#10b981"/></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Latency</span><Spark points={sparkLatency} color="#3b82f6"/></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Retry rate</span><span className="font-medium">{gen.retryRate}%</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Schema drift</span><span className="font-medium">{gen.drift}%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Builder */}
      <div className="px-8 pt-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <div>
              <div className="text-sm font-semibold text-slate-800">Schedule Builder</div>
              <div className="text-[11px] text-slate-500">Per-stage frequency, triggers, workers, retries, and windows</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-[11px] px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Export DAG</button>
              <button className="text-[11px] px-2.5 py-1 rounded-md bg-slate-900 text-white hover:bg-slate-800">Save schedule</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="text-left">
                  {["Stage","Frequency","Trigger","Dependencies","Priority","Concurrency","Retry","Timeout","Worker Pool","Window","Region"].map(h => (
                    <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAGES.map((s, i) => {
                  const SIcon = s.icon;
                  return (
                    <tr key={s.key} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                            <SIcon className="h-3.5 w-3.5 m-0.5"/>
                          </div>
                          <span className="font-medium text-slate-800">{s.key}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2"><select defaultValue={i < 3 ? "Streaming" : i < 8 ? "5m" : "15m"} className="border border-slate-200 rounded px-1.5 py-1 text-[11px]"><option>Streaming</option><option>5s</option><option>30s</option><option>1m</option><option>5m</option><option>15m</option><option>Hourly</option><option>Adaptive</option></select></td>
                      <td className="px-3 py-2"><select defaultValue={i === 0 ? "Event" : "Cron"} className="border border-slate-200 rounded px-1.5 py-1 text-[11px]"><option>Cron</option><option>Event</option><option>Webhook</option><option>Sensor</option><option>Manual</option></select></td>
                      <td className="px-3 py-2 text-slate-500">{i === 0 ? "—" : STAGES[i - 1].key}</td>
                      <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded ${i < 4 ? "bg-rose-50 text-rose-700" : i < 9 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{i < 4 ? "P1" : i < 9 ? "P2" : "P3"}</span></td>
                      <td className="px-3 py-2"><input defaultValue={i < 3 ? 12 : 6} className="w-14 border border-slate-200 rounded px-1.5 py-1 text-[11px]"/></td>
                      <td className="px-3 py-2"><select defaultValue="Exponential" className="border border-slate-200 rounded px-1.5 py-1 text-[11px]"><option>Linear</option><option>Exponential</option><option>Adaptive</option><option>Circuit Breaker</option></select></td>
                      <td className="px-3 py-2"><input defaultValue={i < 6 ? "30s" : "2m"} className="w-14 border border-slate-200 rounded px-1.5 py-1 text-[11px]"/></td>
                      <td className="px-3 py-2"><select defaultValue={i < 5 ? "stream-pool" : "batch-pool"} className="border border-slate-200 rounded px-1.5 py-1 text-[11px]"><option>stream-pool</option><option>batch-pool</option><option>ai-pool</option><option>archive-pool</option></select></td>
                      <td className="px-3 py-2 text-slate-500">24×7</td>
                      <td className="px-3 py-2 text-slate-500">us-central1</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom: calendar + opportunities */}
      <div className="px-8 py-6 grid grid-cols-12 gap-4">
        <div className="col-span-8 rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-slate-800">Execution Calendar</div>
              <div className="text-[11px] text-slate-500">24-hour orchestration heatmap · pipeline runs · queue depth · SLA</div>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded bg-blue-300"/>light</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded bg-blue-500"/>steady</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded bg-rose-500"/>peak</span>
            </div>
          </div>
          <div className="grid grid-cols-24 gap-1" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
            {gen.calendar.map((v, h) => {
              const bg = v > 110 ? "#f43f5e" : v > 85 ? "#3b82f6" : v > 55 ? "#60a5fa" : "#bfdbfe";
              return (
                <div key={h} className="rounded-sm h-10 flex items-end justify-center text-[8px] text-white/90" style={{ backgroundColor: bg }} title={`${h}:00 · ${v} runs`}>
                  {h}
                </div>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-[10px]">
            <div className="rounded bg-slate-50 p-2"><div className="text-slate-500">Peak Hour</div><div className="font-semibold">14:00</div></div>
            <div className="rounded bg-slate-50 p-2"><div className="text-slate-500">Maintenance Window</div><div className="font-semibold">02:00–03:00</div></div>
            <div className="rounded bg-slate-50 p-2"><div className="text-slate-500">SLA Violations (24h)</div><div className="font-semibold">{100 - gen.sla}</div></div>
            <div className="rounded bg-slate-50 p-2"><div className="text-slate-500">Retry Storms</div><div className="font-semibold">{Math.round(gen.retryRate)}</div></div>
          </div>
        </div>
        <div className="col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <div className="text-sm font-semibold text-slate-800">Optimization Opportunities</div>
          <div className="text-[11px] text-slate-500 mb-2">AI-detected improvements for this source</div>
          <ul className="space-y-2">
            {gen.opportunities.map((o, i) => (
              <li key={i} className="rounded-md border border-slate-100 bg-slate-50/60 px-2.5 py-1.5 text-[11px] text-slate-700 flex items-start gap-1.5">
                <TrendingUp className="h-3 w-3 mt-0.5 text-emerald-500"/>{o}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Engineering drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[560px] sm:max-w-[560px] overflow-y-auto">
          <SheetHeader><SheetTitle className="text-slate-900">Engineering Detail · {openContext || "Overview"}</SheetTitle></SheetHeader>
          <Tabs defaultValue="exec" className="mt-4">
            <TabsList className="grid grid-cols-5 text-[11px]">
              <TabsTrigger value="exec">Executive</TabsTrigger>
              <TabsTrigger value="tech">Technical</TabsTrigger>
              <TabsTrigger value="deps">Dependencies</TabsTrigger>
              <TabsTrigger value="algo">Algorithm</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
            </TabsList>
            <TabsContent value="exec" className="text-xs text-slate-600 space-y-2 mt-3">
              <p><span className="font-semibold text-slate-800">Purpose.</span> Determine the optimal scheduling strategy for <span className="font-medium">{source}</span> across its complete lifecycle from ingest to deletion.</p>
              <p><span className="font-semibold text-slate-800">Business impact.</span> Improves data freshness by ~{Math.round(gen.freshness / 2)}%, cuts daily infrastructure spend by ~{Math.round(gen.cost * 0.14).toLocaleString()} USD, and raises AI accuracy to {gen.aiSuccess}%.</p>
            </TabsContent>
            <TabsContent value="tech" className="text-xs text-slate-600 space-y-2 mt-3">
              <p><span className="font-semibold text-slate-800">Ingestion.</span> {gen.meta.ingestion} via Kafka topics partitioned by tenant, feeding an OpenTelemetry Collector into the enrichment fabric.</p>
              <p><span className="font-semibold text-slate-800">Storage.</span> Hot on Snowflake, warm on BigQuery, cold on S3 Intelligent-Tiering, immutable audit on Object Lock.</p>
              <p><span className="font-semibold text-slate-800">Scaling.</span> HPA on queue depth &gt; {Math.round(gen.queueDepth * 0.7).toLocaleString()}; workers cap at 32/pool.</p>
            </TabsContent>
            <TabsContent value="deps" className="text-xs text-slate-600 space-y-1 mt-3">
              {gen.deps.map((d, i) => (
                <div key={i} className="rounded border border-slate-100 px-2 py-1.5 flex items-center justify-between">
                  <span>{d.from} → {d.to}</span>
                  <span className="text-slate-500">{d.throughput} · {d.latency} · {d.errors} err</span>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="algo" className="text-xs mt-3">
              <pre className="bg-slate-950 text-slate-100 rounded-md p-3 overflow-x-auto text-[10px] leading-relaxed">{`function scheduleFor(source):
  vol   = observedEventsPerSec(source)
  slo   = contract(source).freshness
  cost  = infra.costCurve(source)
  risk  = risk.model(source)

  if vol > 200_000 and slo < 30s:
    return recommend("Streaming", "AdaptiveRetry",
                     "ImmediateValidation", "DeferredHydration",
                     "AIPrioritizedEnrichment", "HashDedup",
                     "IntelligentTiering")
  if slo < 5m:
    return recommend("Micro-batching", "Exponential",
                     "PerBatchValidation", "AIPrioritizedHydration")
  return recommend("AdaptiveBatch", "CircuitBreaker",
                   "SchemaDrift", "OnDemandHydration",
                   "ColdStorage")`}</pre>
            </TabsContent>
            <TabsContent value="risk" className="text-xs text-slate-600 space-y-2 mt-3">
              <p><span className="font-semibold text-slate-800">Failure modes.</span> Backpressure spikes during regional flap; schema drift on vendor upgrades; retry amplification on transient 429s.</p>
              <p><span className="font-semibold text-slate-800">Recovery.</span> Circuit breaker isolates failing partitions; DLQ replays after 15m cool-down; adaptive concurrency clamps at 60% saturation.</p>
              <p><span className="font-semibold text-slate-800">Compliance impact.</span> Aligned to SOC 2 CC7.2, ISO 27001 A.12.4, and PCI 10.5.4 for log retention.</p>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <style>{`
        @keyframes sb-packet {
          0%   { left: 0%;   opacity: 0; transform: scale(0.6);}
          10%  { opacity: 1; transform: scale(1);}
          90%  { opacity: 1; }
          100% { left: 100%; opacity: 0; transform: scale(0.6);}
        }
        .sb-packet { animation: sb-packet 6s linear infinite; }
      `}</style>
    </div>
  );
}
