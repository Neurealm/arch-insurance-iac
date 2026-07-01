import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line as DreiLine, OrbitControls, RoundedBox } from "@react-three/drei";
import { DataDogLogo } from "@/components/brand/DataDogLogo";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, AlertTriangle, ArrowRight, Box, CheckCircle2, ChevronRight, CircleDot,
  Cloud, Cpu, Database, Filter, GitBranch, Layers, LineChart as LineIcon, Lock,
  RefreshCw, Rocket, Search, Server, Shield, Signal, Sparkles as SparklesIcon,
  Timer, TrendingUp, Waves, X, Zap,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar } from "recharts";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ============================== Live Telemetry Engine ============================== */
const rand = (min: number, max: number, d = 0) => {
  const v = Math.random() * (max - min) + min;
  return d ? Number(v.toFixed(d)) : Math.round(v);
};
const abbr = (n: number) => {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
};

const NODES = [
  { id: "sources", name: "Source Connectors", icon: Cloud, angle: 0, health: "green" },
  { id: "ingest", name: "Log Ingestion", icon: Waves, angle: 18, health: "green" },
  { id: "parse", name: "Parsing", icon: GitBranch, angle: 36, health: "green" },
  { id: "norm", name: "Normalization", icon: Layers, angle: 54, health: "green" },
  { id: "enrich", name: "Metadata Enrichment", icon: SparklesIcon, angle: 72, health: "green" },
  { id: "classify", name: "Classification", icon: Filter, angle: 90, health: "green" },
  { id: "pii", name: "PII Detection", icon: Shield, angle: 108, health: "amber" },
  { id: "dedup", name: "Deduplication", icon: Box, angle: 126, health: "green" },
  { id: "schema", name: "Schema Mapping", icon: Database, angle: 144, health: "green" },
  { id: "quality", name: "Data Quality", icon: CheckCircle2, angle: 162, health: "green" },
  { id: "gov", name: "Governance", icon: Lock, angle: 180, health: "green" },
  { id: "index", name: "Indexing", icon: Server, angle: 198, health: "green" },
  { id: "ai", name: "AI Analytics", icon: Cpu, angle: 216, health: "green" },
  { id: "ml", name: "Machine Learning", icon: Activity, angle: 234, health: "green" },
  { id: "alert", name: "Alerting", icon: AlertTriangle, angle: 252, health: "amber" },
  { id: "dash", name: "Dashboard Delivery", icon: LineIcon, angle: 270, health: "green" },
  { id: "siem", name: "SIEM Export", icon: Signal, angle: 288, health: "green" },
  { id: "lake", name: "Data Lake Export", icon: Database, angle: 306, health: "green" },
  { id: "cold", name: "Cold Storage", icon: Box, angle: 324, health: "green" },
  { id: "retain", name: "Retention", icon: Timer, angle: 342, health: "green" },
] as const;
type NodeId = typeof NODES[number]["id"];

const NODE_DETAILS: Record<NodeId, {
  purpose: string; business: string; owner: string;
  sources: string[]; targets: string[]; deps: string[]; errors: string[]; frameworks: string[];
}> = Object.fromEntries(NODES.map((n) => [n.id, {
  purpose: `Operational layer that governs ${n.name.toLowerCase()} across the DataDog log ingestion fabric.`,
  business: `Ensures ${n.name.toLowerCase()} runs at enterprise scale with observability, cost efficiency, and audit-grade lineage.`,
  owner: ["Observability Platform", "Data Engineering", "SRE", "Governance", "Security"][Math.floor(Math.random()*5)],
  sources: ["AWS CloudWatch", "Kubernetes", "NGINX", "M365", "Okta", "DataDog Agent"].slice(0, rand(2,5)),
  targets: ["Snowflake", "Databricks", "Splunk", "S3", "Sentinel"].slice(0, rand(2,4)),
  deps: ["Kafka", "Kinesis", "Fluent Bit", "OTel Collector"].slice(0, rand(1,3)),
  errors: ["Schema drift", "Rate limit", "Auth token expiry", "Deserialization failure"].slice(0, rand(1,3)),
  frameworks: ["SOC 2", "ISO 27001", "HIPAA", "PCI-DSS"].slice(0, rand(1,3)),
}])) as any;

/* ============================== 3D Scene (AWS-style architecture) ============================== */

type Status = "healthy" | "warning" | "degraded" | "critical" | "remediating";
const statusColor: Record<Status, string> = {
  healthy: "#10b981",
  warning: "#f59e0b",
  degraded: "#f97316",
  critical: "#ef4444",
  remediating: "#632CA6",
};

function HealthRing({ status, radius = 0.9 }: { status: Status; radius?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.35;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[radius, radius + 0.06, 48]} />
      <meshBasicMaterial color={statusColor[status]} transparent opacity={0.85} />
    </mesh>
  );
}

function ArchNode({
  position, label, sub, status, color = "#ffffff", scale = 1,
  onHover, hoverId, id,
}: {
  position: [number, number, number]; label: string; sub?: string; status: Status;
  color?: string; scale?: number;
  onHover: (id: NodeId | null) => void; hoverId: NodeId | null; id: NodeId;
}) {
  const grp = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (grp.current) {
      grp.current.position.y = position[1] + Math.sin(s.clock.elapsedTime * 1.2 + position[0]) * 0.03;
    }
  });
  const active = hoverId === id;
  return (
    <group
      ref={grp}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); onHover(id); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onHover(null); document.body.style.cursor = "default"; }}
    >
      <RoundedBox args={[1.25 * scale, 0.5 * scale, 1.25 * scale]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color={color}
          metalness={0.1}
          roughness={0.35}
          emissive={active ? statusColor[status] : "#000"}
          emissiveIntensity={active ? 0.3 : 0}
        />
      </RoundedBox>
      <HealthRing status={status} radius={0.88 * scale} />
      <Html position={[0, 0.55 * scale, 0]} center distanceFactor={8} occlude={false}>
        <div className="pointer-events-none whitespace-nowrap text-[11px] font-semibold text-slate-800 bg-white/90 backdrop-blur px-2 py-0.5 rounded border border-slate-200 shadow-sm">
          {label}
          {sub && <span className="ml-1 text-[9.5px] font-normal text-slate-500">{sub}</span>}
        </div>
      </Html>
    </group>
  );
}

function Zone({
  position, size, color, label, opacity = 0.12,
}: { position: [number, number, number]; size: [number, number]; color: string; label?: string; opacity?: number }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={size} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <DreiLine
        points={[
          [-size[0] / 2, 0.01, -size[1] / 2], [size[0] / 2, 0.01, -size[1] / 2],
          [size[0] / 2, 0.01, size[1] / 2], [-size[0] / 2, 0.01, size[1] / 2],
          [-size[0] / 2, 0.01, -size[1] / 2],
        ]}
        color={color} lineWidth={1.2} transparent opacity={0.55}
      />
      {label && (
        <Html position={[-size[0] / 2 + 0.1, 0.05, -size[1] / 2 + 0.1]} distanceFactor={10}>
          <div className="pointer-events-none text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
        </Html>
      )}
    </group>
  );
}

function TrafficFlow({
  from, to, weight, status,
}: { from: [number, number, number]; to: [number, number, number]; weight: number; status: Status }) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(Math.random());
  useFrame((_, dt) => {
    t.current += dt * (0.35 + weight * 0.8);
    if (t.current > 1) t.current = 0;
    if (ref.current) {
      ref.current.position.x = from[0] + (to[0] - from[0]) * t.current;
      ref.current.position.y = from[1] + (to[1] - from[1]) * t.current + 0.35;
      ref.current.position.z = from[2] + (to[2] - from[2]) * t.current;
    }
  });
  const opacity = 0.28 + weight * 0.55;
  return (
    <>
      <DreiLine
        points={[from, [(from[0] + to[0]) / 2, Math.max(from[1], to[1]) + 0.55, (from[2] + to[2]) / 2], to]}
        color={statusColor[status]} lineWidth={1 + weight * 2} transparent opacity={opacity}
      />
      <mesh ref={ref}>
        <sphereGeometry args={[0.07 + weight * 0.05, 12, 12]} />
        <meshBasicMaterial color={statusColor[status]} />
      </mesh>
    </>
  );
}

/** DataDog paw core: floating logo mark on a purple platform */
function DataDogCore({ position }: { position: [number, number, number] }) {
  const grp = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (grp.current) grp.current.position.y = position[1] + Math.sin(s.clock.elapsedTime * 1.4) * 0.05;
  });
  return (
    <group position={position} ref={grp}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[0.95, 1.15, 64]} />
        <meshBasicMaterial color="#632CA6" transparent opacity={0.55} />
      </mesh>
      <RoundedBox args={[1.5, 0.55, 1.5]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#ffffff" metalness={0.15} roughness={0.3} emissive="#632CA6" emissiveIntensity={0.2} />
      </RoundedBox>
      <Html position={[0, 0.65, 0]} center distanceFactor={7} occlude={false}>
        <div className="pointer-events-none flex flex-col items-center gap-1">
          <DataDogLogo size={44} />
          <div className="text-[11px] font-bold text-slate-800 bg-white/95 px-2 py-0.5 rounded border border-slate-200 shadow-sm">
            Datadog Log Intake
          </div>
        </div>
      </Html>
    </group>
  );
}

/* Pipeline nodes: sources → agents → intake → processing → destinations */
const POS = {
  // Sources (left column)
  src_k8s:    [-6.0, 0.3, -2.2] as [number, number, number],
  src_aws:    [-6.0, 0.3,  0.0] as [number, number, number],
  src_okta:   [-6.0, 0.3,  2.2] as [number, number, number],
  // Agents (aggregation)
  agent:      [-3.2, 0.3,  0.0] as [number, number, number],
  // DataDog intake core
  intake:     [ 0.0, 0.3,  0.0] as [number, number, number],
  // Processing lane
  parse:      [ 2.8, 0.3, -1.6] as [number, number, number],
  enrich:     [ 2.8, 0.3,  1.6] as [number, number, number],
  index:      [ 5.2, 0.3,  0.0] as [number, number, number],
  // Destinations (right)
  snowflake:  [ 7.6, 0.3, -2.2] as [number, number, number],
  splunk:     [ 7.6, 0.3,  0.0] as [number, number, number],
  s3:         [ 7.6, 0.3,  2.2] as [number, number, number],
};

type NodeId =
  | "sources" | "ingest" | "parse" | "norm" | "enrich" | "classify"
  | "pii" | "dedup" | "schema" | "quality" | "gov" | "index"
  | "ai" | "ml" | "alert" | "dash" | "siem" | "lake" | "cold" | "retain";

function Scene({ onHover, hoverId }: { onHover: (id: NodeId | null) => void; hoverId: NodeId | null }) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 10, 5]} intensity={0.55} />
      <directionalLight position={[-5, 8, -5]} intensity={0.3} />

      {/* Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, 0, 0]}>
        <planeGeometry args={[16, 8]} />
        <meshBasicMaterial color="#632CA6" transparent opacity={0.04} />
      </mesh>
      <DreiLine
        points={[[-7, 0.005, -3.7], [8.4, 0.005, -3.7], [8.4, 0.005, 3.7], [-7, 0.005, 3.7], [-7, 0.005, -3.7]]}
        color="#632CA6" lineWidth={1.4} transparent opacity={0.35}
      />
      <Html position={[-6.9, 0.05, -3.6]} distanceFactor={10}>
        <div className="pointer-events-none text-[10px] uppercase tracking-wider font-semibold text-violet-700/80">
          Datadog Log Pipeline · Multi-Region
        </div>
      </Html>

      {/* Zones */}
      <Zone position={[-6, 0.01, 0]} size={[2.2, 6.6]} color="#0ea5e9" label="Log Sources" />
      <Zone position={[-3.2, 0.01, 0]} size={[2.2, 3.4]} color="#10b981" label="Agents" />
      <Zone position={[0, 0.01, 0]} size={[2.4, 3.4]} color="#632CA6" label="Intake" opacity={0.14} />
      <Zone position={[4.0, 0.01, 0]} size={[5.2, 6.2]} color="#8b5cf6" label="Processing" />
      <Zone position={[7.6, 0.01, 0]} size={[2.2, 6.6]} color="#f59e0b" label="Destinations" />

      {/* Source nodes */}
      <ArchNode id="sources" position={POS.src_k8s}  label="Kubernetes"  sub="prod" status="healthy" color="#dbeafe" onHover={onHover} hoverId={hoverId} />
      <ArchNode id="sources" position={POS.src_aws}  label="AWS CloudTrail" status="healthy" color="#dbeafe" onHover={onHover} hoverId={hoverId} />
      <ArchNode id="sources" position={POS.src_okta} label="Okta · M365" status="warning" color="#dbeafe" onHover={onHover} hoverId={hoverId} />

      {/* Agent aggregator */}
      <ArchNode id="ingest" position={POS.agent} label="Datadog Agent" sub="OTel · Fluent" status="healthy" color="#ecfdf5" onHover={onHover} hoverId={hoverId} />

      {/* Intake core (DataDog logo) */}
      <DataDogCore position={POS.intake} />

      {/* Processing lane */}
      <ArchNode id="parse"  position={POS.parse}  label="Parse · Grok"    status="healthy"    color="#f5f3ff" onHover={onHover} hoverId={hoverId} />
      <ArchNode id="enrich" position={POS.enrich} label="Enrich · PII"    status="warning"    color="#f5f3ff" onHover={onHover} hoverId={hoverId} />
      <ArchNode id="index"  position={POS.index}  label="Index · Dedup"   status="remediating" color="#ede9fe" scale={1.05} onHover={onHover} hoverId={hoverId} />

      {/* Destinations */}
      <ArchNode id="lake"  position={POS.snowflake} label="Snowflake"       status="healthy" color="#fef3c7" onHover={onHover} hoverId={hoverId} />
      <ArchNode id="siem"  position={POS.splunk}    label="Splunk · SIEM"   status="healthy" color="#fef3c7" onHover={onHover} hoverId={hoverId} />
      <ArchNode id="cold"  position={POS.s3}        label="S3 · Cold"       status="healthy" color="#fef3c7" onHover={onHover} hoverId={hoverId} />

      {/* Traffic: sources → agent */}
      <TrafficFlow from={POS.src_k8s}  to={POS.agent} weight={0.9} status="healthy" />
      <TrafficFlow from={POS.src_aws}  to={POS.agent} weight={0.6} status="healthy" />
      <TrafficFlow from={POS.src_okta} to={POS.agent} weight={0.35} status="warning" />

      {/* Agent → intake */}
      <TrafficFlow from={POS.agent} to={POS.intake} weight={1} status="healthy" />

      {/* Intake → processing */}
      <TrafficFlow from={POS.intake} to={POS.parse}  weight={0.7} status="healthy" />
      <TrafficFlow from={POS.intake} to={POS.enrich} weight={0.7} status="warning" />
      <TrafficFlow from={POS.parse}  to={POS.index}  weight={0.6} status="healthy" />
      <TrafficFlow from={POS.enrich} to={POS.index}  weight={0.6} status="remediating" />

      {/* Index → destinations */}
      <TrafficFlow from={POS.index} to={POS.snowflake} weight={0.55} status="healthy" />
      <TrafficFlow from={POS.index} to={POS.splunk}    weight={0.75} status="healthy" />
      <TrafficFlow from={POS.index} to={POS.s3}        weight={0.5}  status="healthy" />
    </>
  );
}


/* ============================== Page ============================== */
export default function DataDogLogProfile() {
  const [now, setNow] = useState(() => new Date());
  const [autoRefresh, setAutoRefresh] = useState<"30s" | "1m" | "5m">("1m");
  const [tick, setTick] = useState(0);
  const [hoverId, setHoverId] = useState<NodeId | null>(null);
  const [drawer, setDrawer] = useState<{ title: string; kind: string } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const ms = autoRefresh === "30s" ? 30000 : autoRefresh === "1m" ? 60000 : 300000;
    const t = setInterval(() => setTick((x) => x + 1), ms);
    return () => clearInterval(t);
  }, [autoRefresh]);

  // Live telemetry values (regenerate on tick)
  const tele = useMemo(() => ({
    logs24h: rand(2.2e12, 3.4e12),
    events: rand(9e9, 15e9),
    sources: rand(430, 540),
    pipelines: rand(22, 38),
    jobs: rand(1100, 1450),
    dests: rand(48, 84),
    eventsPerSec: rand(10000, 600000),
    latencyMs: rand(20, 400),
    compression: rand(68, 94),
    schemaDrift: rand(0, 3, 2),
    piiDetection: rand(97, 100, 1),
    aiClass: rand(94, 99, 1),
    queueDepth: rand(10, 800),
  }), [tick]);

  const spark = (base: number, len = 20) =>
    Array.from({ length: len }, (_, i) => ({ i, v: Math.max(0, base * (0.75 + Math.random() * 0.5)) }));

  const KPIS = [
    { label: "Logs Ingested (24h)", value: `${(tele.logs24h / 1e12).toFixed(2)} TB`, delta: `+${rand(8, 22, 1)}%`, icon: Waves, tone: "violet", data: spark(tele.logs24h) },
    { label: "Events Processed", value: abbr(tele.events), delta: `+${rand(6, 20, 1)}%`, icon: Activity, tone: "blue", data: spark(tele.events) },
    { label: "Sources Connected", value: String(tele.sources), delta: `+${rand(2, 12)}`, icon: Cloud, tone: "emerald", data: spark(tele.sources) },
    { label: "Pipelines", value: String(tele.pipelines), delta: `+${rand(1, 5)}`, icon: GitBranch, tone: "amber", data: spark(tele.pipelines) },
    { label: "Transformation Jobs", value: abbr(tele.jobs), delta: `+${rand(10, 45)}`, icon: Cpu, tone: "indigo", data: spark(tele.jobs) },
    { label: "Delivery Destinations", value: String(tele.dests), delta: `+${rand(1, 7)}`, icon: Server, tone: "rose", data: spark(tele.dests) },
  ] as const;

  const toneMap: Record<string, string> = {
    violet: "from-violet-500/20 to-violet-500/5 text-violet-300 ring-violet-500/30",
    blue: "from-blue-500/20 to-blue-500/5 text-blue-300 ring-blue-500/30",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-300 ring-emerald-500/30",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-300 ring-amber-500/30",
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-300 ring-indigo-500/30",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-300 ring-rose-500/30",
  };

  const QUALITY = [
    { name: "Completeness", v: rand(97, 100, 1) },
    { name: "Accuracy", v: rand(95, 99, 1) },
    { name: "Consistency", v: rand(94, 99, 1) },
    { name: "Validity", v: rand(96, 99, 1) },
    { name: "Timeliness", v: rand(93, 99, 1) },
    { name: "Uniqueness", v: rand(96, 99, 1) },
    { name: "Integrity", v: rand(97, 100, 1) },
    { name: "Schema Compliance", v: rand(98, 100, 1) },
    { name: "Freshness", v: rand(95, 99, 1) },
    { name: "Availability", v: rand(99, 100, 2) },
  ];
  const overallQ = Number((QUALITY.reduce((a, b) => a + b.v, 0) / QUALITY.length).toFixed(1));

  const REFRESH = [
    { l: "P50", v: `${rand(1, 3)}m ${rand(10, 55)}s`, tag: "Excellent" },
    { l: "P95", v: `${rand(3, 6)}m ${rand(0, 59)}s`, tag: "Good" },
    { l: "P99", v: `${rand(6, 12)}m ${rand(0, 59)}s`, tag: "Good" },
    { l: "Avg", v: `${rand(2, 4)}m ${rand(0, 59)}s`, tag: "Excellent" },
    { l: "Longest", v: `${rand(14, 26)}m`, tag: "Watch" },
    { l: "Queue", v: String(tele.queueDepth), tag: "Live" },
  ];

  const VOLUME = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    ingested: rand(1.8, 3.2, 2),
    processed: rand(1.6, 3.0, 2),
  }));

  const TOP_SOURCES = [
    { n: "kube-cluster-prod", v: rand(500, 750), p: rand(20, 30) },
    { n: "aws-cloudtrail", v: rand(350, 500), p: rand(14, 20) },
    { n: "apm-services", v: rand(400, 550), p: rand(16, 22) },
    { n: "nginx-ingress", v: rand(200, 320), p: rand(9, 14) },
    { n: "datadog-agent", v: rand(170, 260), p: rand(6, 10) },
    { n: "okta-events", v: rand(120, 200), p: rand(4, 7) },
    { n: "m365-audit", v: rand(90, 160), p: rand(3, 6) },
  ];

  const FACETS = ["hostname", "service", "namespace", "cluster", "container", "severity", "application", "region", "availability_zone", "pod"];

  const ANOMALIES = [
    { t: "Spike Detection", d: "Unusual error rate in payment-service", sev: "High", when: `${rand(1, 30)}m ago` },
    { t: "Missing Logs", d: "Gap detected in okta-events (12min)", sev: "High", when: `${rand(5, 45)}m ago` },
    { t: "Schema Drift", d: "New field observed in kube-apiserver", sev: "Medium", when: `${rand(10, 60)}m ago` },
    { t: "Parsing Errors", d: "JSON decode failures on nginx-ingress", sev: "Medium", when: `${rand(10, 60)}m ago` },
    { t: "Late Events", d: "Events delayed >5min from cloudtrail", sev: "Low", when: `${rand(20, 90)}m ago` },
  ];

  const AI_INSIGHTS = [
    "Schema drift detected in Kubernetes ingress logs — auto-mapping suggested.",
    "Compression opportunity identified: switch to zstd for 18% storage savings.",
    "Duplicate log ingestion reduced by 12% after dedup rule tuning.",
    "Metadata enrichment increased AI search quality by 18%.",
    "Retention optimization can reduce storage costs by $42K annually.",
    "PII detection surfaced 34 new sensitive fields for redaction review.",
  ];
  const [insightIdx, setInsightIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setInsightIdx((i) => (i + 1) % AI_INSIGHTS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const hoverNode = hoverId ? NODES.find((n) => n.id === hoverId)! : null;
  const hoverDet = hoverId ? NODE_DETAILS[hoverId] : null;

  return (
    <div className="min-h-full bg-slate-50">
      {/* Header */}
      <header className="px-6 pt-5 pb-4 border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <nav className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-1.5">
              <Link to="/data-orchestration-twin" className="hover:text-indigo-600">Orchestration Hub</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/data-orchestration-twin/log-source-inventory-and-scope-registry" className="hover:text-indigo-600">Log Profiles</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-800 font-medium">DataDog Log Profile</span>
            </nav>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center shadow-lg shadow-violet-500/30 text-white text-xl">🐶</div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[26px] font-black text-slate-900 tracking-tight leading-none">DataDog Log Profile</h1>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                    <CircleDot className="h-2.5 w-2.5" /> ACTIVE
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 mt-1">Real-time observability log orchestration, analysis, and governance — powered by Neurealm AI.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1">
              <span className="text-[10px] text-slate-500 pl-2">Auto-refresh</span>
              {(["30s","1m","5m"] as const).map((r) => (
                <button key={r} onClick={() => setAutoRefresh(r)}
                  className={`text-[11px] px-2 py-1 rounded-md font-medium ${autoRefresh === r ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                  {r}
                </button>
              ))}
              <button onClick={() => setTick((x) => x + 1)} className="ml-1 h-6 w-6 grid place-items-center rounded-md hover:bg-slate-100" title="Refresh now">
                <RefreshCw className="h-3 w-3 text-slate-600" />
              </button>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Last Updated</div>
              <div className="text-[12px] font-semibold text-slate-800 tabular-nums">
                {now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Env <span className="text-emerald-600 font-semibold">Production</span> · AWS us-east-1 · Azure eastus2 · GCP us-central1</div>
            </div>
          </div>
        </div>

        {/* KPI Ribbon */}
        <div className="mt-4 grid grid-cols-6 gap-2.5">
          {KPIS.map((k) => {
            const Icon = k.icon;
            return (
              <motion.button
                key={k.label}
                whileHover={{ y: -3 }}
                onClick={() => setDrawer({ title: k.label, kind: "kpi" })}
                className={`relative overflow-hidden text-left rounded-xl bg-gradient-to-br ${toneMap[k.tone]} bg-white ring-1 p-3 shadow-sm hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="h-7 w-7 rounded-lg bg-white/70 grid place-items-center">
                    <Icon className={`h-3.5 w-3.5`} />
                  </div>
                  <span className="text-[9.5px] font-semibold text-emerald-600 inline-flex items-center gap-0.5">
                    <TrendingUp className="h-2.5 w-2.5" />{k.delta}
                  </span>
                </div>
                <div className="mt-1.5 text-[10px] text-slate-500 uppercase tracking-wider">{k.label}</div>
                <div className="text-[20px] font-black text-slate-900 tabular-nums leading-tight">
                  <AnimatedCounter value={k.value} />
                </div>
                <div className="h-8 mt-1 -mx-1">
                  <ResponsiveContainer>
                    <AreaChart data={k.data}>
                      <defs>
                        <linearGradient id={`g-${k.label}`} x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="currentColor" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke="currentColor" strokeWidth={1.5} fill={`url(#g-${k.label})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.button>
            );
          })}
        </div>
      </header>

      <div className="p-6 grid grid-cols-12 gap-5">
        {/* Hero 3D + Right column */}
        <section className="col-span-8 relative rounded-2xl overflow-hidden ring-1 ring-slate-900/10 shadow-xl" style={{ height: 620 }}>
          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 1.5, 7], fov: 55 }} dpr={[1, 1.5]}>
              <Suspense fallback={null}>
                <Scene onHover={setHoverId} hoverId={hoverId} />
              </Suspense>
            </Canvas>
          </div>
          {/* Overlay - header chip */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto rounded-lg bg-slate-950/70 backdrop-blur ring-1 ring-white/10 px-3 py-1.5">
              <div className="text-[10px] text-slate-300 uppercase tracking-wider">DataDog Schema & Orchestration Engine</div>
              <div className="text-[13px] font-semibold text-white">Living Digital Twin · 20-layer Log Pipeline</div>
            </div>
            <div className="pointer-events-auto rounded-lg bg-slate-950/70 backdrop-blur ring-1 ring-white/10 px-3 py-1.5 flex items-center gap-3 text-[11px] text-slate-200">
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> {tele.eventsPerSec.toLocaleString()} events/s</span>
              <span className="text-slate-500">•</span>
              <span>Latency <span className="text-white font-semibold">{tele.latencyMs}ms</span></span>
              <span className="text-slate-500">•</span>
              <span>Compress <span className="text-white font-semibold">{tele.compression}%</span></span>
            </div>
          </div>
          {/* Hover panel */}
          <AnimatePresence>
            {hoverNode && hoverDet && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-3 left-3 w-[340px] rounded-xl bg-slate-950/85 backdrop-blur-lg ring-1 ring-white/10 p-4 text-slate-100 shadow-2xl"
              >
                <div className="flex items-center gap-2 mb-1">
                  <hoverNode.icon className="h-4 w-4 text-violet-300" />
                  <div className="text-[13px] font-semibold">{hoverNode.name}</div>
                  <span className={`ml-auto text-[9.5px] px-1.5 py-0.5 rounded-full ring-1 ${hoverNode.health === "green" ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" : "bg-amber-500/15 text-amber-300 ring-amber-500/30"}`}>
                    {hoverNode.health === "green" ? "Healthy" : "Warning"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{hoverDet.business}</p>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10.5px]">
                  <Mini l="Records Today" v={abbr(rand(1e9, 15e9))} />
                  <Mini l="Success Rate" v={`${rand(96, 100, 1)}%`} />
                  <Mini l="Avg Latency" v={`${rand(30, 250)}ms`} />
                  <Mini l="Queue Depth" v={String(rand(0, 200))} />
                  <Mini l="AI Confidence" v={`${rand(94, 99, 1)}%`} />
                  <Mini l="Owner" v={hoverDet.owner} />
                </div>
                <button onClick={() => setDrawer({ title: hoverNode.name, kind: "node" })}
                  className="mt-3 w-full text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md py-1.5 inline-flex items-center justify-center gap-1">
                  Open Engineering Details <ArrowRight className="h-3 w-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {/* AI insight ticker */}
          <div className="absolute bottom-3 right-3 max-w-sm">
            <div className="rounded-xl bg-gradient-to-br from-indigo-600/90 to-violet-600/90 backdrop-blur ring-1 ring-white/20 p-3 text-white shadow-xl">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/70 mb-1">
                <SparklesIcon className="h-3 w-3" /> Neurealm AI Insight
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={insightIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="text-[12px] leading-snug">
                  {AI_INSIGHTS[insightIdx]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Right analytics column */}
        <aside className="col-span-4 space-y-4">
          {/* Data Quality */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[13px] font-bold text-slate-900">Data Quality & Health</div>
              <span className="text-[10px] text-slate-500">Overall Score</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative h-[110px] w-[110px]">
                <ResponsiveContainer>
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ v: overallQ, fill: "#10b981" }]} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="v" cornerRadius={20} background={{ fill: "#e2e8f0" } as any} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="text-[22px] font-black text-slate-900 leading-none">{overallQ}%</div>
                    <div className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wider">Excellent</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                {QUALITY.slice(0, 5).map((q) => (
                  <div key={q.name} className="flex items-center gap-2 text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-700 flex-1 truncate">{q.name}</span>
                    <span className="text-slate-900 font-semibold tabular-nums">{q.v}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1">
              {QUALITY.slice(5).map((q) => (
                <div key={q.name} className="rounded bg-slate-50 ring-1 ring-slate-200 p-1.5 text-center">
                  <div className="text-[9px] text-slate-500 truncate">{q.name}</div>
                  <div className="text-[11px] font-bold text-slate-800 tabular-nums">{q.v}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Refresh */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4">
            <div className="text-[13px] font-bold text-slate-900 mb-2">Refresh & Latency</div>
            <div className="grid grid-cols-2 gap-1.5">
              {REFRESH.map((r) => (
                <div key={r.l} className="rounded-lg bg-slate-50 ring-1 ring-slate-200 px-2 py-1.5 flex items-center justify-between">
                  <div>
                    <div className="text-[9.5px] text-slate-500 uppercase tracking-wider">{r.l}</div>
                    <div className="text-[13px] font-bold text-slate-900 tabular-nums">{r.v}</div>
                  </div>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${r.tag === "Excellent" ? "bg-emerald-50 text-emerald-700" : r.tag === "Good" ? "bg-blue-50 text-blue-700" : r.tag === "Live" ? "bg-violet-50 text-violet-700" : "bg-amber-50 text-amber-700"}`}>
                    {r.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Volume */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[13px] font-bold text-slate-900">Volume & Growth</div>
              <span className="text-[10px] text-slate-500">30 days</span>
            </div>
            <div className="h-[110px]">
              <ResponsiveContainer>
                <AreaChart data={VOLUME}>
                  <defs>
                    <linearGradient id="vg1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="vg2" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Area type="monotone" dataKey="ingested" stroke="#6366f1" strokeWidth={1.8} fill="url(#vg1)" />
                  <Area type="monotone" dataKey="processed" stroke="#10b981" strokeWidth={1.5} fill="url(#vg2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10.5px]">
              <Mini2 l="Daily Avg" v={`${rand(2.1, 2.6, 2)} TB`} />
              <Mini2 l="Projected 30d" v={`${rand(78, 88, 1)} TB`} />
              <Mini2 l="Compression" v={`${tele.compression}%`} />
              <Mini2 l="Hot / Cold / Archive" v="34% / 41% / 25%" />
            </div>
          </div>
        </aside>

        {/* Bottom analytics grid */}
        <section className="col-span-12 grid grid-cols-5 gap-4">
          {/* Top Sources */}
          <Card title="Top Log Sources" hint="By Volume (24h)">
            <div className="space-y-1.5">
              {TOP_SOURCES.map((s) => (
                <div key={s.n} className="flex items-center gap-2 text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <span className="text-slate-800 flex-1 truncate">{s.n}</span>
                  <span className="text-slate-500 tabular-nums w-16 text-right">{s.v} GB</span>
                  <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${s.p * 3}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {/* Top Facets */}
          <Card title="Top Parsed Fields" hint="By Cardinality">
            <div className="space-y-1.5">
              {FACETS.slice(0, 7).map((f) => {
                const v = rand(1500, 14000);
                return (
                  <div key={f} className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-800 flex-1 truncate font-mono">{f}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${Math.min(100, (v / 14000) * 100)}%` }} />
                    </div>
                    <span className="text-slate-500 tabular-nums w-10 text-right">{(v/1000).toFixed(1)}K</span>
                  </div>
                );
              })}
            </div>
          </Card>
          {/* Anomalies */}
          <Card title="Anomalies (24h)" hint={`${ANOMALIES.length} detected`}>
            <div className="space-y-1.5">
              {ANOMALIES.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] rounded-md p-1.5 bg-slate-50 ring-1 ring-slate-100">
                  <AlertTriangle className={`h-3 w-3 mt-0.5 ${a.sev === "High" ? "text-rose-500" : a.sev === "Medium" ? "text-amber-500" : "text-slate-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-800 truncate">{a.d}</div>
                    <div className="text-[9.5px] text-slate-500">{a.when}</div>
                  </div>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${a.sev === "High" ? "bg-rose-50 text-rose-700" : a.sev === "Medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                    {a.sev}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          {/* Pipeline Health */}
          <Card title="Pipeline Health" hint={`${tele.pipelines} pipelines`}>
            <div className="flex items-center gap-3">
              <div className="h-[110px] w-[110px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={[
                      { name: "Running", value: 24, fill: "#10b981" },
                      { name: "Warning", value: 3, fill: "#f59e0b" },
                      { name: "Failed", value: 1, fill: "#ef4444" },
                    ]} dataKey="value" innerRadius={30} outerRadius={50} paddingAngle={2}>
                      <Cell />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1 text-[11px]">
                <Row dot="#10b981" l="Running" v={`${rand(22, 30)} · 85.7%`} />
                <Row dot="#f59e0b" l="Warning" v={`${rand(2, 4)} · 10.7%`} />
                <Row dot="#ef4444" l="Failed" v={`${rand(0, 2)} · 3.6%`} />
                <Row dot="#94a3b8" l="Avg Runtime" v={`${rand(1, 5)}m ${rand(0, 59)}s`} />
              </div>
            </div>
          </Card>
          {/* Governance */}
          <Card title="Governance & Compliance" hint="Live posture">
            <div className="space-y-1.5 text-[11px]">
              {[
                { l: "Data Classification", v: "Operational", ok: true },
                { l: "Retention Policy", v: "30 Days", ok: true },
                { l: "Access Policies", v: "12 Applied", ok: true },
                { l: "PII Detection", v: "Enabled", ok: true },
                { l: "Encryption", v: "AES-256 · TLS 1.3", ok: true },
                { l: "Audit Readiness", v: "Compliant", ok: true },
              ].map((g) => (
                <div key={g.l} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span className="text-slate-700 flex-1 truncate">{g.l}</span>
                  <span className="text-slate-900 font-semibold">{g.v}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Live Telemetry Ribbon */}
        <section className="col-span-12 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white ring-1 ring-slate-800 p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-amber-300" />
            <div className="text-[13px] font-bold">Live Enterprise Telemetry Engine</div>
            <span className="text-[10px] text-slate-400">Regenerates every {autoRefresh}</span>
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> streaming</span>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {[
              { l: "Events/sec", v: tele.eventsPerSec.toLocaleString() },
              { l: "Latency", v: `${tele.latencyMs}ms` },
              { l: "Compression", v: `${tele.compression}%` },
              { l: "Schema Drift", v: `${tele.schemaDrift}%` },
              { l: "PII Detection", v: `${tele.piiDetection}%` },
              { l: "AI Classification", v: `${tele.aiClass}%` },
              { l: "Queue Depth", v: tele.queueDepth.toString() },
              { l: "Uptime", v: "99.982%" },
            ].map((t) => (
              <div key={t.l} className="rounded-lg bg-white/5 ring-1 ring-white/10 p-2.5">
                <div className="text-[9.5px] text-slate-400 uppercase tracking-wider">{t.l}</div>
                <div className="text-[15px] font-bold tabular-nums text-white">{t.v}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Engineering Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent side="right" className="w-[560px] sm:max-w-[560px] bg-slate-950 text-slate-100 border-l border-slate-800 overflow-y-auto p-0">
          <SheetHeader className="p-4 border-b border-slate-800">
            <SheetTitle className="text-white flex items-center gap-2">
              <Rocket className="h-4 w-4 text-violet-300" /> {drawer?.title}
            </SheetTitle>
            <div className="text-[11px] text-slate-400">Engineering Deep-Dive · DataDog Log Profile</div>
          </SheetHeader>
          <Tabs defaultValue="exec" className="p-3">
            <TabsList className="grid grid-cols-4 bg-slate-900 text-[10.5px]">
              <TabsTrigger value="exec">Executive</TabsTrigger>
              <TabsTrigger value="tech">Technical</TabsTrigger>
              <TabsTrigger value="pipe">Pipeline</TabsTrigger>
              <TabsTrigger value="ops">Ops</TabsTrigger>
            </TabsList>
            <TabsContent value="exec" className="mt-3 space-y-2 text-[12px] text-slate-300">
              <p><b className="text-white">Business Purpose.</b> Turn raw DataDog log payloads into governed, AI-enriched operational intelligence for SRE, security, product, and finance stakeholders.</p>
              <p><b className="text-white">Value.</b> Every improvement in parse quality, classification accuracy, and dedup ratio compounds into faster MTTR, lower storage cost, and audit-ready observability.</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Mini3 l="Business Owner" v="VP Observability" />
                <Mini3 l="Cost / TB / mo" v={`$${rand(38,72)}`} />
                <Mini3 l="MTTR Impact" v={`-${rand(24,48)}%`} />
                <Mini3 l="Storage Saved" v={`$${rand(28,64)}K / yr`} />
              </div>
            </TabsContent>
            <TabsContent value="tech" className="mt-3 text-[11.5px] text-slate-300 space-y-2">
              <p>Ingestion via DataDog Agent, HTTP intake, and OTel forwarders. Parsed with Grok + custom Rust decoders. Enriched using service catalog, CMDB, and Neurealm entity resolver.</p>
              <pre className="bg-slate-900 ring-1 ring-slate-800 rounded p-2 text-[10px] overflow-auto">{`{
  "service": "payment-api",
  "env": "prod",
  "level": "error",
  "host": "ip-10-0-42-18",
  "message": "Timeout calling stripe.charge()",
  "trace_id": "abc123",
  "duration_ms": 3812,
  "pii_flags": []
}`}</pre>
            </TabsContent>
            <TabsContent value="pipe" className="mt-3 space-y-2 text-[11.5px] text-slate-300">
              {["Ingest → Buffer (Kafka)", "Parse (Grok/JSON)", "Enrich (CMDB, Owner, Region)", "Classify (Neurealm AI)", "PII Redaction", "Dedup + Compress", "Index (OpenSearch)", "Deliver (Snowflake, Splunk, S3)"].map((s, i) => (
                <div key={i} className="flex items-center gap-2 rounded bg-slate-900/60 ring-1 ring-slate-800 px-2 py-1.5">
                  <span className="h-5 w-5 grid place-items-center rounded bg-violet-600/30 text-violet-200 text-[10px] font-bold">{i+1}</span>
                  <span className="flex-1">{s}</span>
                  <span className="text-[10px] text-emerald-300">healthy</span>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="ops" className="mt-3 space-y-2 text-[11.5px] text-slate-300">
              <Mini3 l="Runbook" v="rb-datadog-log-v4.md" />
              <Mini3 l="On-Call" v="Observability Rotation (PagerDuty)" />
              <Mini3 l="SLO" v="99.9% ingest availability" />
              <Mini3 l="Automation" v="Auto-scale · Auto-parse · Auto-redact" />
              <div className="rounded-lg bg-gradient-to-br from-indigo-600/30 to-violet-600/30 ring-1 ring-indigo-500/30 p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-violet-200 mb-1">AI Recommendation</div>
                <div className="text-white">Enable zstd compression on kube-cluster-prod to save ~18% storage and reduce egress by 12%.</div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ============================== Small Components ============================== */
function AnimatedCounter({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    setDisplay(value);
  }, [value]);
  return <motion.span key={display} initial={{ opacity: 0.4, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>{display}</motion.span>;
}
function Mini({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded bg-white/5 ring-1 ring-white/10 px-2 py-1">
      <div className="text-[9px] text-slate-400 uppercase tracking-wider">{l}</div>
      <div className="text-[11px] text-white font-semibold truncate">{v}</div>
    </div>
  );
}
function Mini2({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded bg-slate-50 ring-1 ring-slate-200 px-2 py-1">
      <div className="text-[9px] text-slate-500 uppercase tracking-wider">{l}</div>
      <div className="text-[11px] text-slate-900 font-semibold truncate">{v}</div>
    </div>
  );
}
function Mini3({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded bg-slate-900 ring-1 ring-slate-800 px-2 py-1.5">
      <div className="text-[9px] text-slate-400 uppercase tracking-wider">{l}</div>
      <div className="text-[12px] text-white font-semibold">{v}</div>
    </div>
  );
}
function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[12px] font-bold text-slate-900">{title}</div>
        {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
function Row({ dot, l, v }: { dot: string; l: string; v: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
      <span className="text-slate-700 flex-1">{l}</span>
      <span className="text-slate-900 font-semibold tabular-nums">{v}</span>
    </div>
  );
}
