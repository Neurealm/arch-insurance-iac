import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, ReferenceLine,
} from "recharts";
import {
  Activity, AlertTriangle, Bell, Check, CheckCircle2, ChevronRight, Cpu,
  Database, Factory, FileText, Gauge, HelpCircle, Layers, LayoutGrid, Power,
  Settings, Sparkles, ThermometerSun, TrendingDown, TrendingUp, Wrench, X,
  Zap, Droplets, Wind, FlaskConical, ShieldCheck, Users, Workflow, Play,
  ClipboardCheck, GitBranch, Eye, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

type Severity = "Critical" | "High" | "Medium" | "Low";

const EQUIPMENT = [
  { id: "ETCH-217", name: "Metal Etch", severity: "Critical" as Severity, rul: 4.2, prob: 37, node: "45nm – 130nm", type: "Plasma Etch", loc: "Fab 2 · Bay 12", criticality: "HIGH", lastPm: "Apr 28, 2026", lotsAffected: 37, vendor: "Lam Research", recipe: "MTL-CU-2.1" },
  { id: "PVD-142", name: "TiN Deposition", severity: "High" as Severity, rul: 9.1, prob: 22, node: "65nm – 180nm", type: "PVD Sputter", loc: "Fab 1 · Bay 07", criticality: "HIGH", lastPm: "May 02, 2026", lotsAffected: 21, vendor: "Applied Materials", recipe: "TIN-BAR-0.8" },
  { id: "CMP-038", name: "Polish", severity: "Medium" as Severity, rul: 12.3, prob: 14, node: "90nm – 180nm", type: "Chemical Mech. Polish", loc: "Fab 2 · Bay 03", criticality: "MEDIUM", lastPm: "Apr 19, 2026", lotsAffected: 12, vendor: "Applied Materials", recipe: "CMP-OX-1.4" },
  { id: "PHOTO-096", name: "Scanner", severity: "Low" as Severity, rul: 18.7, prob: 6, node: "65nm – 130nm", type: "DUV Lithography", loc: "Fab 1 · Bay 02", criticality: "MEDIUM", lastPm: "May 11, 2026", lotsAffected: 4, vendor: "ASML", recipe: "LITH-MET1-A" },
  { id: "DIFF-011", name: "Diffusion", severity: "Low" as Severity, rul: 22.4, prob: 3, node: "130nm – 180nm", type: "Diffusion Furnace", loc: "Fab 2 · Bay 11", criticality: "LOW", lastPm: "May 09, 2026", lotsAffected: 2, vendor: "TEL", recipe: "DIFF-N2O-3" },
];

const RUL_BY_EQ: Record<string, { d: string; y: number }[]> = {
  "ETCH-217": [{d:"May 16",y:100},{d:"May 18",y:88},{d:"May 20",y:74},{d:"May 22",y:62},{d:"May 24",y:48},{d:"May 26",y:32},{d:"May 28",y:18},{d:"May 30",y:7}],
  "PVD-142":  [{d:"May 16",y:100},{d:"May 18",y:94},{d:"May 20",y:88},{d:"May 22",y:80},{d:"May 24",y:70},{d:"May 26",y:60},{d:"May 28",y:48},{d:"May 30",y:34}],
  "CMP-038":  [{d:"May 16",y:100},{d:"May 18",y:96},{d:"May 20",y:90},{d:"May 22",y:84},{d:"May 24",y:78},{d:"May 26",y:70},{d:"May 28",y:62},{d:"May 30",y:54}],
  "PHOTO-096":[{d:"May 16",y:100},{d:"May 18",y:97},{d:"May 20",y:94},{d:"May 22",y:90},{d:"May 24",y:86},{d:"May 26",y:81},{d:"May 28",y:76},{d:"May 30",y:70}],
  "DIFF-011": [{d:"May 16",y:100},{d:"May 18",y:98},{d:"May 20",y:96},{d:"May 22",y:93},{d:"May 24",y:90},{d:"May 26",y:86},{d:"May 28",y:82},{d:"May 30",y:78}],
};

type OptId = "now" | "tonight" | "tomorrow" | "next-week";
interface MaintOption {
  id: OptId; label: string; when: string; dur: string;
  prodWafers: number; yieldImpact: "Very Low" | "Low" | "Medium" | "High";
  schedImpact: "Low" | "Medium" | "High"; revImpact: number; score: number;
  recommended?: boolean;
}
const OPTIONS: MaintOption[] = [
  { id: "now",       label: "MAINTAIN NOW",   when: "Immediate",                    dur: "4.3 hrs", prodWafers: -1280, yieldImpact: "Low",      schedImpact: "High",   revImpact: -145, score: 62 },
  { id: "tonight",   label: "TONIGHT",        when: "10:00 PM – 2:30 AM",           dur: "4.2 hrs", prodWafers: -320,  yieldImpact: "Very Low", schedImpact: "Low",    revImpact: -38,  score: 92, recommended: true },
  { id: "tomorrow",  label: "TOMORROW NIGHT", when: "10:00 PM – 2:30 AM",           dur: "4.2 hrs", prodWafers: -680,  yieldImpact: "Low",      schedImpact: "Medium", revImpact: -72,  score: 78 },
  { id: "next-week", label: "NEXT WEEK",      when: "May 23, 10:00 PM",             dur: "4.2 hrs", prodWafers: -2150, yieldImpact: "Medium",   schedImpact: "High",   revImpact: -210, score: 41 },
];

type WfState = "Complete" | "Ready" | "Pending";
interface WfStep { n: number; title: string; desc: string; state: WfState; sources: string[]; logic: string; conf: number; approval: string; }
const WORKFLOW: WfStep[] = [
  { n: 1,  title: "Detect Abnormal Equipment Behavior",     desc: "Continuous monitoring of IoT, process and event data",  state: "Complete", sources: ["FDC","SPC","OSIsoft PI","Datadog"],                  logic: "Multivariate anomaly detection on chamber pressure, RF reflected power, and end-point optical signal.", conf: 97, approval: "None — telemetry layer" },
  { n: 2,  title: "Estimate Remaining Useful Life",         desc: "AI/ML models estimate RUL and failure probability",     state: "Complete", sources: ["FDC history","Lam tool telemetry","CMMS PM history"], logic: "Survival model w/ Weibull prior, conditioned on chamber wet-clean count and DC bias drift.",          conf: 91, approval: "None — analytical layer" },
  { n: 3,  title: "Identify Affected Production Lots",      desc: "Map tool to lots, products and customers",              state: "Ready",    sources: ["MES","Dispatch","ERP"],                              logic: "Trace WIP routes through ETCH-217 over next 7 days; expand to downstream PVD/CMP dependencies.",      conf: 88, approval: "Production Control acknowledge" },
  { n: 4,  title: "Simulate Maintenance Timing Options",    desc: "Run what-if scenarios across multiple time windows",    state: "Ready",    sources: ["Dispatch","MES","FDC"],                              logic: "Discrete-event simulation of 4 PM windows w/ stochastic technician travel + spare-part fetch times.",  conf: 86, approval: "None — simulation only" },
  { n: 5,  title: "Evaluate Dispatch Implications",         desc: "Analyze impact to queues, priorities and cycle time",   state: "Ready",    sources: ["Dispatch","E10 events"],                             logic: "Compute queue-delta and cycle-time delta per option against rolling 7d baseline.",                    conf: 84, approval: "Dispatch lead" },
  { n: 6,  title: "Assess Alternate Tool Capacity",         desc: "Check qualified alternates and capacity availability",  state: "Ready",    sources: ["MES qual matrix","E10","CMMS"],                      logic: "Filter ETCH-219/305/118/402 by recipe qual + current utilization headroom.",                          conf: 90, approval: "Process Eng acknowledge" },
  { n: 7,  title: "Check Technician Availability",          desc: "Verify skills, shifts and labor constraints",           state: "Ready",    sources: ["CMMS","Technician scheduling","SAP HR"],             logic: "Skill-match L3 plasma-etch certified techs against shift roster and active work orders.",             conf: 93, approval: "Maintenance lead" },
  { n: 8,  title: "Consider Utility Demand Forecasts",      desc: "Evaluate utilities and facility constraints",           state: "Ready",    sources: ["Rockwell FactoryTalk","OSIsoft PI","Facility BMS"],  logic: "Forecast N2, chilled water, compressed air load against PM-recovery surge envelope.",                 conf: 81, approval: "Facilities engineer" },
  { n: 9,  title: "Estimate Business and Yield Impacts",    desc: "Revenue, commitments and yield risk analysis",          state: "Ready",    sources: ["ERP","SAP","KLA inspection"],                        logic: "Monetize wafer-loss × ASP per product family; yield-risk via KLA defect-trend correlation.",          conf: 85, approval: "Yield Eng + Finance" },
  { n: 10, title: "Recommend Optimal Maintenance Window",   desc: "AI recommends best window with rationale",              state: "Pending",  sources: ["All upstream signals"],                              logic: "Pareto-rank options on score = 0.4·revenue + 0.3·yield + 0.2·schedule + 0.1·utility.",                conf: 0,  approval: "Fab Ops Manager" },
  { n: 11, title: "Generate Required Work Order",           desc: "Auto-create WO with parts, steps, and checks",          state: "Pending",  sources: ["CMMS","EAM","Inventory"],                            logic: "Compose WO from template MTL-ETCH-PM-04 w/ parts BOM and LOTO checklist.",                            conf: 0,  approval: "Maintenance Planner" },
  { n: 12, title: "Route for Human Approval",               desc: "Workflow routing to stakeholders for approval",         state: "Pending",  sources: ["ServiceNow","SAP Workflow"],                         logic: "Parallel approval routing to Fab Ops, Maintenance Lead, Production Control, Yield Eng.",              conf: 0,  approval: "4 approvers in parallel" },
  { n: 13, title: "Monitor Post-Maintenance Performance",   desc: "Track recovery, performance and KPIs",                  state: "Pending",  sources: ["FDC","SPC","E10","KLA"],                             logic: "Track first-wafer-effect, recipe drift, and defect density vs baseline for 48h after PM.",            conf: 0,  approval: "Process Eng signoff" },
  { n: 14, title: "Learn from Outcome",                     desc: "Update models and knowledge graph",                     state: "Pending",  sources: ["ML feature store","Knowledge graph"],                logic: "Feed actual RUL outcome + PM effectiveness back into survival model and case library.",               conf: 0,  approval: "None — automatic" },
];

const PRODUCTION_SERIES = Array.from({ length: 8 }, (_, i) => ({
  d: ["May 18","May 19","May 20","May 21","May 22","May 23","May 24","May 25"][i],
  o1: [-300,-700,-1100,-1280,-1180,-900,-600,-200][i],
  o2: [-50,-120,-220,-320,-280,-180,-100,-30][i],
  o3: [-80,-220,-440,-680,-560,-380,-220,-90][i],
  o4: [-200,-600,-1100,-1700,-2150,-1800,-1200,-500][i],
}));

const ALT_TOOLS = [
  { id: "ETCH-219", loc: "Fab 2 · Bay 14", util: 68 },
  { id: "ETCH-305", loc: "Fab 1 · Bay 07", util: 73 },
  { id: "ETCH-118", loc: "Fab 2 · Bay 03", util: 91 },
  { id: "ETCH-402", loc: "Fab 2 · Bay 11", util: 95 },
];

const TECH_AVAIL = [
  { day: "Today",  available: 22, scheduled: 18, unavailable: 8 },
  { day: "Sat 17", available: 14, scheduled: 6,  unavailable: 12 },
  { day: "Sun 18", available: 16, scheduled: 4,  unavailable: 10 },
  { day: "Mon 19", available: 28, scheduled: 14, unavailable: 6 },
  { day: "Tue 20", available: 26, scheduled: 16, unavailable: 8 },
  { day: "Wed 21", available: 24, scheduled: 18, unavailable: 8 },
  { day: "Thu 22", available: 27, scheduled: 15, unavailable: 7 },
];

const UTILITIES = [
  { name: "Power",          unit: "MW",    now: 42.1, tonight: 41.3, tomorrow: 43.0, icon: Zap,          color: "text-amber-400" },
  { name: "Nitrogen",       unit: "kSCFM", now: 65.2, tonight: 63.8, tomorrow: 66.1, icon: Wind,         color: "text-sky-400" },
  { name: "Chilled Water",  unit: "Tons",  now: 8420, tonight: 8050, tomorrow: 8610, icon: Droplets,     color: "text-cyan-400" },
  { name: "Compressed Air", unit: "kSCFM", now: 72.1, tonight: 70.3, tomorrow: 73.5, icon: Wind,         color: "text-emerald-400" },
];

const INTEGRATIONS = ["MES","Dispatch","E10","FDC","SPC","CMMS","EAM","ERP","SAP","ServiceNow","Splunk","Datadog","OSIsoft PI","Rockwell FactoryTalk","Applied Materials","Lam Research","KLA","TEL"];

/* ------------------------------------------------------------------ */
/* Tiny helpers                                                       */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, ms = 1200, decimals = 0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return decimals ? Number(v.toFixed(decimals)) : Math.round(v);
}

function severityTone(s: Severity) {
  return s === "Critical" ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
    : s === "High"     ? "text-orange-300 bg-orange-500/10 border-orange-500/30"
    : s === "Medium"   ? "text-amber-300 bg-amber-500/10 border-amber-500/30"
    :                    "text-slate-300 bg-slate-500/10 border-slate-500/30";
}

function scoreTone(n: number) {
  return n >= 85 ? "text-emerald-400" : n >= 70 ? "text-amber-300" : "text-rose-400";
}

function scoreBar(n: number) {
  return n >= 85 ? "bg-emerald-500" : n >= 70 ? "bg-amber-400" : "bg-rose-500";
}

/* ------------------------------------------------------------------ */
/* 3D Etch Chamber (R3F)                                               */
/* ------------------------------------------------------------------ */

function ChamberMesh({ rotating, onHotspot }: { rotating: boolean; onHotspot: (h: string) => void }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, dt) => { if (rotating && ref.current) ref.current.rotation.y += dt * 0.25; });
  return (
    <group ref={ref}>
      {/* base pedestal */}
      <mesh position={[0, -1.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.7, 0.4, 48]} />
        <meshStandardMaterial color="#1f2937" metalness={0.85} roughness={0.35} />
      </mesh>
      {/* chamber body */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1.25, 1.35, 1.8, 48]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.95} roughness={0.18} />
      </mesh>
      {/* viewport ring */}
      <mesh position={[0, 0.4, 1.26]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.05, 16, 48]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* viewport plasma glow */}
      <mesh position={[0, 0.4, 1.27]}>
        <circleGeometry args={[0.28, 32]} />
        <meshStandardMaterial color="#a855f7" emissive="#c084fc" emissiveIntensity={2.4} />
      </mesh>
      <pointLight position={[0, 0.4, 1.4]} color="#c084fc" intensity={1.6} distance={4} />
      {/* top lid */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[1.32, 1.32, 0.25, 48]} />
        <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* gas inlet pipes */}
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 1.35, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      {/* RF cable */}
      <mesh position={[0, 1.55, 0]}>
        <torusGeometry args={[0.3, 0.04, 12, 24]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* sensor hotspots */}
      <Hotspot pos={[1.3, 0.5, 0.6]} label="Optical EP"   tone="#22d3ee" onClick={() => onHotspot("Optical end-point sensor — drift +1.2σ on Cl2 emission line")} />
      <Hotspot pos={[-1.3, 0.1, 0.4]} label="RF Match"    tone="#f59e0b" onClick={() => onHotspot("RF matching network — reflected power 18W (limit 25W)")} />
      <Hotspot pos={[0, -0.8, 1.2]} label="Pedestal Temp" tone="#ef4444" onClick={() => onHotspot("Pedestal temperature deviation 4.1°C above setpoint")} />
      <Hotspot pos={[0.9, 1.2, 0.3]} label="MFC-3"        tone="#10b981" onClick={() => onHotspot("Mass-flow controller 3 — nominal, 49.8 sccm CF4")} />
    </group>
  );
}

function Hotspot({ pos, label, tone, onClick }: { pos: [number, number, number]; label: string; tone: string; onClick: () => void }) {
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={tone} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color={tone} transparent opacity={0.18} />
      </mesh>
      <Html distanceFactor={6} style={{ pointerEvents: "auto" }}>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="text-[10px] whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-900/85 border border-white/10 text-white/90 hover:bg-slate-800"
          style={{ transform: "translate(8px,-50%)" }}
        >
          {label}
        </button>
      </Html>
    </group>
  );
}

function Chamber3D({ onHotspot }: { onHotspot: (msg: string) => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="relative h-[260px] rounded-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Canvas shadows camera={{ position: [3.2, 1.6, 3.8], fov: 38 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 6, 4]} intensity={1.1} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#7dd3fc" />
        <Suspense fallback={null}>
          <ChamberMesh rotating={!hover} onHotspot={onHotspot} />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={3.5} maxDistance={7} target={[0, 0.1, 0]} />
      </Canvas>
      {/* thermal/vibration overlay chips */}
      <div className="absolute top-2 left-2 flex gap-1.5">
        <Chip icon={ThermometerSun} label="Thermal +4.1°C" tone="rose" />
        <Chip icon={Activity} label="Vib 0.42 mm/s" tone="amber" />
        <Chip icon={Sparkles} label="Plasma ON" tone="violet" />
      </div>
      <div className="absolute bottom-2 right-2 text-[10px] text-white/50 tracking-wider">DRAG TO ROTATE · CLICK SENSOR DOTS</div>
    </div>
  );
}

function Chip({ icon: Icon, label, tone }: { icon: any; label: string; tone: "rose" | "amber" | "violet" | "emerald" }) {
  const c = { rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
              amber:"bg-amber-500/15 text-amber-300 border-amber-500/30",
              violet:"bg-violet-500/15 text-violet-300 border-violet-500/30",
              emerald:"bg-emerald-500/15 text-emerald-300 border-emerald-500/30" }[tone];
  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border backdrop-blur", c)}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SemiCommandCenter() {
  const [selectedEq, setSelectedEq] = useState("ETCH-217");
  const [selectedOpt, setSelectedOpt] = useState<OptId>("tonight");
  const [drawer, setDrawer] = useState<null | { type: "equipment" | "option" | "step" | "sensor"; id: string; payload?: any }>(null);
  const [aiRun, setAiRun] = useState(0);
  const [woOpen, setWoOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTickerIdx((i) => (i + 1) % INTEGRATIONS.length), 2200);
    return () => clearInterval(t);
  }, []);

  const eq = EQUIPMENT.find((e) => e.id === selectedEq)!;
  const rulSeries = RUL_BY_EQ[selectedEq];
  const opt = OPTIONS.find((o) => o.id === selectedOpt)!;

  // KPI count-ups
  const oee = useCountUp(86.7, 1100, 1);
  const tput = useCountUp(52340);
  const wip = useCountUp(8742);
  const tools = useCountUp(1248);
  const health = useCountUp(92);
  const downtime = useCountUp(2.1, 1100, 1);
  const alerts = useCountUp(5);

  return (
    <div className="min-h-screen bg-[#070b18] text-slate-100 font-[ui-sans-serif,system-ui]">
      <TopBar />
      <div className="flex">
        <LeftRail />
        <main className="flex-1 min-w-0 p-4 space-y-4">
          {/* Title */}
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">MAINTENANCE OPTIMIZATION AGENT</h1>
              <p className="text-xs text-slate-400 mt-0.5">AI-Powered Maintenance Decision Orchestration · DFW Semiconductor Fab · Richardson, Texas</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiRun((n) => n + 1)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-[0_0_20px_-4px_rgba(168,85,247,0.7)]"
                title="Replay the AI orchestration workflow with refreshed confidence"
              >
                <Sparkles className="h-3.5 w-3.5" /> Run AI Simulation
              </button>
              <button
                onClick={() => setWoOpen(true)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                title="Auto-generate a maintenance work order based on the selected window"
              >
                <FileText className="h-3.5 w-3.5" /> Generate Work Order
              </button>
              <button
                onClick={() => setApprovalOpen(true)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                title="Route the recommended window for human approval"
              >
                <ClipboardCheck className="h-3.5 w-3.5" /> Route for Approval
              </button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            <KpiCard label="Factory OEE"          value={`${oee}`}      unit="%"             trend="+2.4% vs yesterday" trendUp tooltip="Overall Equipment Effectiveness across Fab 1 & Fab 2 (availability × performance × quality)." spark="up" />
            <KpiCard label="Throughput"           value={tput.toLocaleString()} unit="wafers/day" trend="+3.1% vs target"    trendUp tooltip="Rolling 24-hour wafer-out across all process modules."                                       spark="up" />
            <KpiCard label="WIP Lots"             value={wip.toLocaleString()}  unit=""           trend="+1.8%"              trendUp tooltip="Lots currently in process across MES routes."                                                  spark="flat" />
            <KpiCard label="Active Tools"         value={tools.toLocaleString()} unit={`/ 1,420  ${Math.round((tools/1420)*100)}%`} trend="+1.2%" trendUp tooltip="Tools currently in PROD or IDLE per SEMI E10 state." spark="up" />
            <KpiCardGauge value={health}          tooltip="Composite equipment-health index from FDC, SPC, vibration, and PdM models." />
            <KpiCard label="Unplanned Downtime"   value={`${downtime}`} unit="%"             trend="−0.6% vs yesterday" trendUp={false} good tooltip="Unscheduled downtime as a share of available time (E10 UDT)." spark="down" />
            <KpiCardAlert count={alerts}          tooltip="High-priority equipment and process alerts requiring decision in the next 24h." />
          </div>

          {/* Main 3-col */}
          <div className="grid grid-cols-12 gap-3">
            {/* Left: top concerns */}
            <section className="col-span-12 xl:col-span-3">
              <Panel
                title="TOP MAINTENANCE CONCERNS"
                right={<button className="text-[11px] text-sky-400 hover:underline">View All</button>}
              >
                <ul className="divide-y divide-white/5">
                  {EQUIPMENT.map((e) => (
                    <li key={e.id}>
                      <button
                        onClick={() => setSelectedEq(e.id)}
                        onDoubleClick={() => setDrawer({ type: "equipment", id: e.id })}
                        className={cn(
                          "w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 transition",
                          selectedEq === e.id && "bg-white/5 ring-1 ring-inset ring-violet-500/40"
                        )}
                        title={`${e.id} · ${e.type} · ${e.loc}`}
                      >
                        <EqThumb sev={e.severity} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">{e.id}</span>
                            <span className="text-[11px] text-slate-400 truncate">({e.name})</span>
                          </div>
                          {e.severity === "Critical" && <div className="text-[11px] text-rose-300">Abnormal behavior detected</div>}
                          <div className="text-[11px] text-slate-400">RUL: <span className="text-slate-200">{e.rul} days</span> <span className="text-slate-500">({e.severity === "Critical" ? "Low" : e.severity})</span></div>
                        </div>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded border", severityTone(e.severity))}>{e.severity}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </li>
                  ))}
                </ul>
              </Panel>

              <div className="mt-3">
                <Panel title="LIVE INTEGRATION FEED" right={<span className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> STREAMING</span>}>
                  <div className="px-3 py-2 text-[11px] text-slate-300">
                    <div className="font-mono">{INTEGRATIONS[tickerIdx]} → event ingested</div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {INTEGRATIONS.map((i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300">{i}</span>
                      ))}
                    </div>
                  </div>
                </Panel>
              </div>
            </section>

            {/* Center: AI recommendation workspace */}
            <section className="col-span-12 xl:col-span-6 space-y-3">
              <Panel>
                <div className="px-4 py-3 text-center border-b border-white/5">
                  <div className="text-[11px] tracking-wider text-slate-400">GIVEN EVERYTHING HAPPENING ACROSS THE FACTORY,</div>
                  <div className="text-base md:text-lg font-bold text-white mt-0.5">SHOULD I PERFORM MAINTENANCE NOW, LATER TODAY, OR NEXT WEEK?</div>
                </div>

                <div className="grid grid-cols-12 gap-3 p-3">
                  {/* 3D model */}
                  <div className="col-span-12 md:col-span-5">
                    <Chamber3D onHotspot={(msg) => setDrawer({ type: "sensor", id: "sensor", payload: msg })} />
                    <button
                      onClick={() => setDrawer({ type: "equipment", id: eq.id })}
                      className="mt-2 w-full h-9 rounded-md bg-sky-600/20 border border-sky-500/40 text-sky-200 text-xs font-semibold hover:bg-sky-600/30 inline-flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Digital Twin
                    </button>
                  </div>

                  {/* equipment detail */}
                  <div className="col-span-12 md:col-span-4">
                    <div className="text-[10px] tracking-wider text-slate-400">SELECTED EQUIPMENT</div>
                    <div className="text-2xl font-bold text-white">{eq.id}</div>
                    <div className="text-xs text-sky-300">{eq.name} Chamber</div>
                    <div className="mt-3 space-y-1.5 text-xs">
                      <Row label="Criticality" value={<span className="text-rose-300 font-bold">{eq.criticality}</span>} />
                      <Row label="Process Node" value={eq.node} />
                      <Row label="Location" value={eq.loc} />
                      <Row label="Equipment Type" value={eq.type} />
                      <Row label="Vendor" value={eq.vendor} />
                    </div>
                  </div>

                  {/* RUL chart */}
                  <div className="col-span-12 md:col-span-3">
                    <div className="text-[10px] tracking-wider text-slate-400">REMAINING USEFUL LIFE</div>
                    <div className="text-3xl font-bold text-rose-400 leading-none mt-1">{eq.rul} <span className="text-base font-medium text-slate-400">days</span></div>
                    <div className="text-[11px] text-slate-400 mt-1">Confidence: 82%</div>
                    <div className="text-[11px] text-slate-300 mt-2">Probability of Failure<br /><span className="text-rose-400 text-2xl font-bold">{eq.prob}%</span> <span className="text-slate-500 text-[10px]">in next 7 days</span></div>
                    <div className="h-[80px] mt-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={rulSeries} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                          <defs>
                            <linearGradient id="rulg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.55} />
                              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="d" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
                          <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                          <RTooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", fontSize: 11 }} />
                          <Area type="monotone" dataKey="y" stroke="#f43f5e" strokeWidth={2} fill="url(#rulg)" isAnimationActive animationDuration={1200} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </Panel>

              {/* Maintenance windows */}
              <Panel
                title="MAINTENANCE WINDOW OPTIONS (AI SIMULATION SUMMARY)"
                right={<button className="text-[11px] text-sky-400 hover:underline">View All Scenarios</button>}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-3">
                  {OPTIONS.map((o, idx) => (
                    <OptionCard key={o.id} option={o} index={idx + 1} selected={selectedOpt === o.id}
                      onSelect={() => setSelectedOpt(o.id)}
                      onDetails={() => setDrawer({ type: "option", id: o.id })}
                      aiRun={aiRun}
                    />
                  ))}
                </div>
              </Panel>
            </section>

            {/* Right: workflow */}
            <section className="col-span-12 xl:col-span-3">
              <Panel title="MAINTENANCE OPTIMIZATION WORKFLOW" right={<span className="text-[10px] text-slate-400">14 STEPS</span>}>
                <Workflow14 aiRun={aiRun} onPick={(s) => setDrawer({ type: "step", id: String(s.n), payload: s })} />
              </Panel>
            </section>
          </div>

          {/* Lower analytics row */}
          <div className="grid grid-cols-12 gap-3">
            <Panel className="col-span-12 lg:col-span-4" title="PRODUCTION IMPACT OVERVIEW" right={<span className="text-[10px] text-slate-400">All Options · wafers Δ</span>}>
              <div className="h-[180px] p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PRODUCTION_SERIES} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="d" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <RTooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", fontSize: 11 }} />
                    <ReferenceLine y={0} stroke="#334155" />
                    <Line dataKey="o1" name="Option 1" stroke="#f97316" strokeWidth={2} dot={false} isAnimationActive animationDuration={1400} />
                    <Line dataKey="o2" name="Option 2 (Rec.)" stroke="#22c55e" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={1400} />
                    <Line dataKey="o3" name="Option 3" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive animationDuration={1400} />
                    <Line dataKey="o4" name="Option 4" stroke="#a78bfa" strokeWidth={2} dot={false} isAnimationActive animationDuration={1400} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <Legend items={[["Option 1","#f97316"],["Option 2 (Rec.)","#22c55e"],["Option 3","#38bdf8"],["Option 4","#a78bfa"]]} />
            </Panel>

            <Panel className="col-span-12 lg:col-span-3" title="ALTERNATE TOOL CAPACITY" right={<span className="text-[10px] text-slate-400">Qualified Tools</span>}>
              <ul className="p-2 space-y-1.5">
                {ALT_TOOLS.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-xs" title={`${t.id} qualified for ETCH-217 recipe set · ${t.loc}`}>
                    <div className="h-7 w-7 rounded-md bg-white/5 border border-white/10 grid place-items-center"><Factory className="h-3.5 w-3.5 text-slate-400" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium">{t.id}</div>
                      <div className="text-[10px] text-slate-500">{t.loc}</div>
                    </div>
                    <div className="w-24">
                      <div className="h-1.5 rounded bg-white/5 overflow-hidden">
                        <div className={cn("h-full", t.util >= 90 ? "bg-rose-500" : t.util >= 75 ? "bg-amber-400" : "bg-emerald-500")} style={{ width: `${t.util}%` }} />
                      </div>
                    </div>
                    <span className={cn("w-10 text-right font-semibold", t.util >= 90 ? "text-rose-300" : t.util >= 75 ? "text-amber-300" : "text-emerald-300")}>{t.util}%</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel className="col-span-12 lg:col-span-3" title="TECHNICIAN AVAILABILITY" right={<span className="text-[10px] text-slate-400">Next 7 Days</span>}>
              <div className="h-[180px] p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={TECH_AVAIL} layout="vertical" margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap={4}>
                    <CartesianGrid stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="day" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
                    <RTooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", fontSize: 11 }} />
                    <Bar dataKey="available"   stackId="a" fill="#22c55e" isAnimationActive animationDuration={1200} />
                    <Bar dataKey="scheduled"   stackId="a" fill="#3b82f6" isAnimationActive animationDuration={1200} />
                    <Bar dataKey="unavailable" stackId="a" fill="#475569" isAnimationActive animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Legend items={[["Available","#22c55e"],["Scheduled","#3b82f6"],["Unavailable","#475569"]]} />
            </Panel>

            <Panel className="col-span-12 lg:col-span-2" title="UTILITY IMPACT (PEAK DEMAND)" right={<span className="text-[10px] text-slate-400">All Options</span>}>
              <ul className="p-2 space-y-1.5 text-[11px]">
                <li className="grid grid-cols-12 text-slate-500 px-1">
                  <span className="col-span-5">Utility</span><span className="col-span-2 text-right">Now</span><span className="col-span-2 text-right">Tonight</span><span className="col-span-3 text-right">Tomorrow</span>
                </li>
                {UTILITIES.map((u) => (
                  <li key={u.name} className="grid grid-cols-12 items-center px-1 py-0.5" title={`${u.name} demand (${u.unit}) under current vs PM-recovery scenarios`}>
                    <div className="col-span-5 flex items-center gap-1.5"><u.icon className={cn("h-3.5 w-3.5", u.color)} /><span className="text-white">{u.name}</span><span className="text-slate-500">{u.unit}</span></div>
                    <span className="col-span-2 text-right text-slate-200">{u.now}</span>
                    <span className="col-span-2 text-right text-emerald-300">{u.tonight}</span>
                    <span className="col-span-3 text-right text-slate-200">{u.tomorrow}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel className="col-span-12" title="BUSINESS IMPACT SUMMARY">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3">
                <BizStat label="At-Risk Revenue (Next 7 Days)" value="$2.8M"        tone="text-white" />
                <BizStat label="Customer Commitments"           value="97.6% On Track" tone="text-emerald-300" />
                <BizStat label="Yield Risk (If Delayed)"        value="+0.35%"        tone="text-amber-300" />
                <BizStat label="Expedite Cost (If Delayed)"     value="$126K"         tone="text-rose-300" />
                <BizStat label="Overall Business Risk"          value="Medium"        tone="text-amber-300" pill />
              </div>
            </Panel>
          </div>

          <div className="text-[10px] text-slate-500 text-center py-2">
            Synthetic demonstration data · Neurealm RunOps — Maintenance Optimization Agent · Richardson, TX
          </div>
        </main>
      </div>

      {/* Drawers + modals */}
      <Drawer open={!!drawer} onClose={() => setDrawer(null)}>
        {drawer?.type === "equipment" && <EquipmentDetail eqId={drawer.id} onClose={() => setDrawer(null)} />}
        {drawer?.type === "option"    && <OptionDetail   optId={drawer.id as OptId} onClose={() => setDrawer(null)} />}
        {drawer?.type === "step"      && <StepDetail     step={drawer.payload} onClose={() => setDrawer(null)} />}
        {drawer?.type === "sensor"    && <SensorDetail   msg={drawer.payload}  onClose={() => setDrawer(null)} />}
      </Drawer>

      <Modal open={woOpen} onClose={() => setWoOpen(false)} title="Work Order Preview · WO-MTL-ETCH-217-0518">
        <WorkOrderBody />
      </Modal>
      <Modal open={approvalOpen} onClose={() => setApprovalOpen(false)} title="Approval Routing · Recommended Window: Tonight 10:00 PM">
        <ApprovalBody />
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Top bar + left rail                                                 */
/* ------------------------------------------------------------------ */

function TopBar() {
  return (
    <header className="h-14 border-b border-white/5 bg-[#0a0f1f] flex items-center px-4 gap-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-sky-500 grid place-items-center text-white text-xs font-bold">Nr</div>
        <div>
          <div className="text-sm font-bold text-white tracking-wide">Neurealm</div>
          <div className="text-[10px] text-slate-500 -mt-0.5">RunOps · Semiconductor</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="text-right">
        <div className="text-sm font-semibold text-white">DFW Semiconductor Fab</div>
        <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Richardson, Texas</div>
      </div>
      <button className="relative h-9 w-9 grid place-items-center rounded-md hover:bg-white/5" title="Notifications">
        <Bell className="h-4 w-4 text-slate-300" />
        <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-[9px] grid place-items-center text-white">7</span>
      </button>
      <button className="h-9 w-9 grid place-items-center rounded-md hover:bg-white/5" title="Help"><HelpCircle className="h-4 w-4 text-slate-300" /></button>
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 grid place-items-center text-[11px] font-bold text-white">AO</div>
    </header>
  );
}

const RAIL = [
  { icon: LayoutGrid,    label: "Command Center", active: true },
  { icon: Cpu,           label: "Digital Twin" },
  { icon: Factory,       label: "Equipment" },
  { icon: TrendingUp,    label: "Production" },
  { icon: Workflow,      label: "Dispatch" },
  { icon: Power,         label: "Facilities" },
  { icon: Sparkles,      label: "AI Agents" },
  { icon: GitBranch,     label: "Knowledge Graph" },
  { icon: Database,      label: "Reports" },
  { icon: Settings,      label: "Settings" },
];

function LeftRail() {
  return (
    <aside className="w-[72px] shrink-0 border-r border-white/5 bg-[#0a0f1f] py-3 flex flex-col items-center gap-1">
      {RAIL.map((r) => (
        <button key={r.label} className={cn(
          "w-14 py-2 rounded-lg flex flex-col items-center gap-1 text-[9px] tracking-wide",
          r.active ? "bg-violet-600/20 text-violet-200 ring-1 ring-violet-500/40" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
        )} title={r.label}>
          <r.icon className="h-4 w-4" />
          <span className="leading-tight text-center">{r.label.split(" ").join("\n")}</span>
        </button>
      ))}
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* KPI cards                                                           */
/* ------------------------------------------------------------------ */

function KpiCard({ label, value, unit, trend, trendUp, good, tooltip, spark }: {
  label: string; value: string; unit?: string; trend?: string; trendUp?: boolean; good?: boolean; tooltip: string; spark: "up" | "down" | "flat";
}) {
  const stroke = good ? "#22c55e" : spark === "down" ? "#f43f5e" : "#38bdf8";
  const data = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({ x: i, y: 40 + Math.sin(i / 1.7) * 10 + Math.random() * 8 + (spark === "up" ? i : spark === "down" ? -i : 0) })),
    [spark]
  );
  return (
    <div className="relative group rounded-lg border border-white/5 bg-[#0d1426] p-3" title={tooltip}>
      <div className="flex items-center justify-between text-[10px] tracking-wider text-slate-400">
        <span>{label.toUpperCase()}</span>
        <HelpCircle className="h-3 w-3 opacity-60" />
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
      </div>
      {trend && (
        <div className={cn("text-[10px] mt-0.5 flex items-center gap-1", trendUp ? "text-emerald-400" : "text-rose-400")}>
          {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {trend}
        </div>
      )}
      <div className="h-[34px] mt-1 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`k-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.45} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="y" stroke={stroke} strokeWidth={1.5} fill={`url(#k-${label})`} isAnimationActive animationDuration={1200} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function KpiCardGauge({ value, tooltip }: { value: number; tooltip: string }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const color = pct >= 90 ? "#22c55e" : pct >= 75 ? "#facc15" : "#ef4444";
  return (
    <div className="relative rounded-lg border border-white/5 bg-[#0d1426] p-3 flex flex-col items-center" title={tooltip}>
      <div className="self-stretch flex items-center justify-between text-[10px] tracking-wider text-slate-400">
        <span>EQUIPMENT HEALTH</span><HelpCircle className="h-3 w-3 opacity-60" />
      </div>
      <div className="relative h-[78px] w-[78px] mt-1">
        <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
          <circle cx="40" cy="40" r={r} stroke="#1e293b" strokeWidth="7" fill="none" />
          <circle cx="40" cy="40" r={r} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`} style={{ transition: "stroke-dasharray 1.2s ease-out" }} />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-xl font-bold text-white tabular-nums leading-none">{value}</div>
            <div className="text-[9px] text-slate-500 leading-none mt-0.5">/100</div>
          </div>
        </div>
      </div>
      <div className="text-[10px] text-emerald-400 mt-1 font-semibold">Good</div>
    </div>
  );
}

function KpiCardAlert({ count, tooltip }: { count: number; tooltip: string }) {
  return (
    <div className="relative rounded-lg border border-rose-500/30 bg-rose-500/[0.06] p-3" title={tooltip}>
      <div className="flex items-center justify-between text-[10px] tracking-wider text-rose-200">
        <span>HIGH PRIORITY ALERTS</span><AlertTriangle className="h-3 w-3 animate-pulse" />
      </div>
      <div className="text-3xl font-bold text-rose-300 mt-1 tabular-nums leading-none">{count}</div>
      <div className="text-[11px] text-rose-300/80 mt-1">Requires Action</div>
      <div className="mt-2 flex gap-0.5 items-end h-[28px]">
        {Array.from({ length: 26 }).map((_, i) => (
          <span key={i} className="flex-1 bg-rose-400/70 rounded-sm" style={{ height: `${20 + (Math.sin(i) + 1) * 40}%`, opacity: 0.5 + (i / 26) * 0.5 }} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panels + small bits                                                 */
/* ------------------------------------------------------------------ */

function Panel({ title, right, className, children }: { title?: string; right?: any; className?: string; children: any }) {
  return (
    <section className={cn("rounded-lg border border-white/5 bg-[#0d1426]/80 backdrop-blur-sm", className)}>
      {title && (
        <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-300">{title}</span>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-100">{value}</span>
    </div>
  );
}

function EqThumb({ sev }: { sev: Severity }) {
  const tone = sev === "Critical" ? "from-rose-500/30 to-rose-900/40 border-rose-500/40"
            : sev === "High"     ? "from-orange-500/20 to-orange-900/40 border-orange-500/40"
            : sev === "Medium"   ? "from-amber-500/20 to-amber-900/40 border-amber-500/40"
            :                       "from-slate-500/20 to-slate-900/40 border-slate-500/40";
  return (
    <div className={cn("relative h-12 w-12 shrink-0 rounded-md border bg-gradient-to-br grid place-items-center", tone)}>
      <Factory className="h-5 w-5 text-white/80" />
      {sev === "Critical" && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse ring-2 ring-rose-500/30" />}
    </div>
  );
}

function Legend({ items }: { items: [string, string][] }) {
  return (
    <div className="px-3 pb-2 flex flex-wrap gap-x-3 gap-y-1">
      {items.map(([l, c]) => (
        <span key={l} className="text-[10px] text-slate-400 inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm" style={{ background: c }} /> {l}
        </span>
      ))}
    </div>
  );
}

function BizStat({ label, value, tone, pill }: { label: string; value: string; tone: string; pill?: boolean }) {
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] p-3">
      <div className="text-[10px] tracking-wider text-slate-400">{label.toUpperCase()}</div>
      {pill ? (
        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold border border-amber-500/30">{value}</span>
      ) : (
        <div className={cn("text-xl font-bold mt-1", tone)}>{value}</div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Option card + workflow                                              */
/* ------------------------------------------------------------------ */

function OptionCard({ option: o, index, selected, onSelect, onDetails, aiRun }: {
  option: MaintOption; index: number; selected: boolean; onSelect: () => void; onDetails: () => void; aiRun: number;
}) {
  const score = useCountUp(o.score, 1200 + index * 80);
  const [key, setKey] = useState(0);
  useEffect(() => { setKey((k) => k + 1); }, [aiRun]);
  return (
    <div
      key={key}
      onClick={onSelect}
      className={cn(
        "relative rounded-md border bg-[#0a1124] p-3 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg animate-fade-in",
        o.recommended ? "border-emerald-500/50 shadow-[0_0_24px_-8px_rgba(16,185,129,0.6)]" : "border-white/10",
        selected && !o.recommended && "ring-1 ring-sky-500/50",
      )}
      title={`${o.label} · ${o.when} · score ${o.score}/100`}
    >
      {o.recommended && (
        <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded text-[10px] bg-emerald-500 text-emerald-950 font-bold tracking-wider shadow">
          ✦ RECOMMENDED
        </div>
      )}
      <div className="text-[10px] text-slate-500">Option {index}</div>
      <div className="text-sm font-bold text-white tracking-wide">{o.label}</div>
      <div className="text-[11px] text-slate-400">{o.when}</div>
      <div className="text-[11px] text-slate-500">Est. Duration: {o.dur}</div>
      <div className="mt-2 space-y-1 text-[11px]">
        <RowMini k="Production Impact" v={`${o.prodWafers.toLocaleString()} wafers`} vTone="text-slate-100" />
        <RowMini k="Yield Impact"      v={o.yieldImpact}                              vTone={o.yieldImpact === "Very Low" ? "text-emerald-300" : o.yieldImpact === "Low" ? "text-emerald-200" : o.yieldImpact === "Medium" ? "text-amber-300" : "text-rose-300"} />
        <RowMini k="Schedule Impact"   v={o.schedImpact}                              vTone={o.schedImpact === "Low" ? "text-emerald-300" : o.schedImpact === "Medium" ? "text-amber-300" : "text-rose-300"} />
        <RowMini k="Revenue Impact"    v={`-$${Math.abs(o.revImpact)}K`}              vTone="text-rose-300" />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">Overall Score</span>
        <span className={cn("text-lg font-bold tabular-nums", scoreTone(o.score))}>{score}<span className="text-xs text-slate-500">/100</span></span>
      </div>
      <div className="h-1.5 rounded bg-white/5 overflow-hidden">
        <div className={cn("h-full transition-[width] duration-1000", scoreBar(o.score))} style={{ width: `${score}%` }} />
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDetails(); }}
        className="mt-2 w-full h-8 rounded bg-white/5 hover:bg-white/10 text-xs text-slate-200 inline-flex items-center justify-center gap-1"
      >
        View Details <ArrowRight className="h-3 w-3" />
      </button>
      {o.recommended && <div className="absolute top-2 left-2 text-[9px] text-emerald-300 inline-flex items-center gap-1"><Sparkles className="h-3 w-3 animate-pulse" /> AI 92%</div>}
    </div>
  );
}

function RowMini({ k, v, vTone }: { k: string; v: string; vTone: string }) {
  return <div className="flex items-center justify-between"><span className="text-slate-500">{k}</span><span className={cn("font-medium", vTone)}>{v}</span></div>;
}

function Workflow14({ aiRun, onPick }: { aiRun: number; onPick: (s: WfStep) => void }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress(0);
    let i = 0;
    const t = setInterval(() => {
      i += 1; setProgress(i);
      if (i >= WORKFLOW.length) clearInterval(t);
    }, 120);
    return () => clearInterval(t);
  }, [aiRun]);
  return (
    <ul className="relative p-2">
      <span className="absolute left-[26px] top-3 bottom-3 w-px bg-white/5" />
      {WORKFLOW.map((s, i) => {
        const animated = i < progress;
        const state = s.state;
        return (
          <li key={s.n}>
            <button
              onClick={() => onPick(s)}
              className={cn(
                "w-full text-left flex items-start gap-3 px-2 py-1.5 rounded hover:bg-white/5 transition",
                animated ? "opacity-100" : "opacity-30"
              )}
              title={`${s.title} · Source systems: ${s.sources.join(", ")}`}
            >
              <span className={cn(
                "h-6 w-6 shrink-0 rounded-md grid place-items-center text-[10px] font-bold border",
                state === "Complete" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : state === "Ready"   ? "bg-sky-500/15 text-sky-300 border-sky-500/40 animate-pulse"
                :                       "bg-white/5 text-slate-400 border-white/10"
              )}>{state === "Complete" ? <Check className="h-3 w-3" /> : s.n}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{s.title}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{s.desc}</div>
              </div>
              <span className={cn(
                "text-[10px] font-semibold shrink-0",
                state === "Complete" ? "text-emerald-300" : state === "Ready" ? "text-sky-300" : "text-slate-500"
              )}>
                {state === "Complete" ? <span className="inline-flex items-center gap-1">Complete <CheckCircle2 className="h-3 w-3" /></span> : state}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Drawer + modal                                                      */
/* ------------------------------------------------------------------ */

function Drawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: any }) {
  return (
    <>
      <div className={cn("fixed inset-0 z-40 bg-black/60 transition-opacity", open ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={onClose} />
      <aside className={cn(
        "fixed top-0 right-0 z-50 h-screen w-[420px] max-w-[92vw] bg-[#0a0f1f] border-l border-white/10 shadow-2xl transition-transform overflow-y-auto",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        {children}
      </aside>
    </>
  );
}

function DrawerHeader({ eyebrow, title, onClose }: { eyebrow: string; title: string; onClose: () => void }) {
  return (
    <div className="px-4 py-3 border-b border-white/10 sticky top-0 bg-[#0a0f1f] z-10 flex items-start justify-between gap-3">
      <div>
        <div className="text-[10px] tracking-wider text-violet-300">{eyebrow}</div>
        <div className="text-sm font-bold text-white">{title}</div>
      </div>
      <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded hover:bg-white/10 text-slate-300"><X className="h-4 w-4" /></button>
    </div>
  );
}

function EquipmentDetail({ eqId, onClose }: { eqId: string; onClose: () => void }) {
  const e = EQUIPMENT.find((x) => x.id === eqId)!;
  return (
    <div>
      <DrawerHeader eyebrow="DIGITAL TWIN" title={`${e.id} · ${e.name} (${e.type})`} onClose={onClose} />
      <div className="p-4 space-y-4 text-xs text-slate-300">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Criticality" value={e.criticality} tone="text-rose-300" />
          <Stat label="RUL"         value={`${e.rul} days`} tone="text-amber-300" />
          <Stat label="Failure Prob (7d)" value={`${e.prob}%`} tone="text-rose-300" />
          <Stat label="Last PM"     value={e.lastPm} />
          <Stat label="Location"    value={e.loc} />
          <Stat label="Process Node" value={e.node} />
          <Stat label="Vendor"      value={e.vendor} />
          <Stat label="Active Recipe" value={e.recipe} />
        </div>
        <Section title="LIVE SENSOR READINGS">
          {[
            ["Chamber Pressure", "12.4 mTorr", "ok"],
            ["RF Forward Power", "1,150 W", "ok"],
            ["RF Reflected Power", "18 W (limit 25)", "warn"],
            ["Pedestal Temperature", "78.1 °C (+4.1)", "crit"],
            ["MFC-3 CF4 Flow", "49.8 sccm", "ok"],
            ["End-point Optical (Cl2)", "drift +1.2σ", "warn"],
          ].map(([k, v, t]) => (
            <SensorRow key={k} k={k} v={v} t={t as any} />
          ))}
        </Section>
        <Section title="RECENT ANOMALIES (LAST 72H)">
          <ul className="space-y-1.5">
            <Anomaly when="May 18 · 09:42" what="RF reflected-power spike on lot Q4-2381" />
            <Anomaly when="May 17 · 22:18" what="Optical end-point drift detected on Cl2 line" />
            <Anomaly when="May 17 · 06:05" what="Pedestal temperature deviation +3.6°C" />
          </ul>
        </Section>
        <Section title="WAFER LOTS AT RISK">
          <p>{e.lotsAffected} lots routed through {e.id} in next 7 days · top customer commits: Automotive PMIC (A1), Industrial Signal-Chain (S3).</p>
        </Section>
        <Section title="RECOMMENDED ACTION">
          <p className="text-emerald-300">Execute PM template <span className="font-mono">MTL-ETCH-PM-04</span> tonight 10:00 PM. Replace upper electrode, wet-clean chamber, recalibrate end-point. Est. recovery 4.2h.</p>
        </Section>
      </div>
    </div>
  );
}

function SensorRow({ k, v, t }: { k: string; v: string; t: "ok" | "warn" | "crit" }) {
  const tone = t === "crit" ? "text-rose-300" : t === "warn" ? "text-amber-300" : "text-emerald-300";
  return <div className="flex items-center justify-between border-b border-white/5 py-1"><span className="text-slate-400">{k}</span><span className={cn("font-mono text-[11px]", tone)}>{v}</span></div>;
}
function Anomaly({ when, what }: { when: string; what: string }) {
  return <li className="flex gap-2"><span className="text-slate-500 w-24 shrink-0 font-mono text-[10px]">{when}</span><span>{what}</span></li>;
}
function Section({ title, children }: { title: string; children: any }) {
  return <div><div className="text-[10px] tracking-wider text-slate-500 mb-1.5">{title}</div><div className="text-[11px] text-slate-200">{children}</div></div>;
}
function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return <div className="rounded-md border border-white/5 bg-white/[0.02] p-2"><div className="text-[9px] tracking-wider text-slate-500">{label.toUpperCase()}</div><div className={cn("text-sm font-semibold mt-0.5", tone || "text-white")}>{value}</div></div>;
}

function OptionDetail({ optId, onClose }: { optId: OptId; onClose: () => void }) {
  const o = OPTIONS.find((x) => x.id === optId)!;
  return (
    <div>
      <DrawerHeader eyebrow="MAINTENANCE WINDOW SIMULATION" title={`${o.label} · Score ${o.score}/100`} onClose={onClose} />
      <div className="p-4 space-y-4 text-xs text-slate-300">
        <Section title="SCENARIO ASSUMPTIONS">
          <ul className="space-y-1 list-disc pl-4 text-slate-300">
            <li>PM template MTL-ETCH-PM-04 (4.2h nominal, +/- 0.4h)</li>
            <li>Upper electrode + focus-ring replacement, full wet-clean</li>
            <li>End-point recalibration with golden wafer Q-CAL-117</li>
            <li>Window: {o.when} ({o.dur})</li>
          </ul>
        </Section>
        <Section title="LOT IMPACT">
          <p>{Math.abs(o.prodWafers).toLocaleString()} wafer shortfall vs plan. {optId === "next-week" ? "12 priority lots breach OTD." : optId === "now" ? "8 lots interrupted mid-step (rework risk)." : "0 priority OTD impact, no rework risk."}</p>
        </Section>
        <Section title="DISPATCH TRADEOFFS">
          <p>{optId === "tonight" ? "Off-peak window; redirects to ETCH-219/305 absorb spillover with <2h queue add." : optId === "next-week" ? "Compounding queue: +14m avg cycle time, downstream PVD starvation risk." : "Mid-shift impact; dispatch must freeze new starts on metal layer for 5h."}</p>
        </Section>
        <Section title="TECHNICIAN COVERAGE">
          <p>{optId === "tonight" ? "L3 plasma-etch certified: 4 available (S. Patel, M. Nguyen, R. Alvarez, K. Boyd). Shift overlap 21:30–02:30." : "Limited L3 coverage on this window; OT premium applies."}</p>
        </Section>
        <Section title="UTILITY DEMAND">
          <p>Pump-down + recovery surge: +1.8 MW power, +6.4 kSCFM N2. Within Tonight envelope of 71 MW.</p>
        </Section>
        <Section title="SPARE PARTS AVAILABILITY">
          <p>P/N 0040-AE817 (upper electrode) — 2 on-hand, Bay-12 crib. P/N 0190-FR223 (focus ring) — 3 on-hand. No purchase-order required.</p>
        </Section>
        <Section title="FINANCIAL IMPACT">
          <p>Revenue Δ: <span className="text-rose-300 font-semibold">-${Math.abs(o.revImpact)}K</span> · expedite cost avoided vs Next-Week: $88K · NPV vs Maintain-Now: <span className="text-emerald-300 font-semibold">+$107K</span></p>
        </Section>
      </div>
    </div>
  );
}

function StepDetail({ step, onClose }: { step: WfStep; onClose: () => void }) {
  return (
    <div>
      <DrawerHeader eyebrow={`STEP ${step.n} / 14`} title={step.title} onClose={onClose} />
      <div className="p-4 space-y-4 text-xs text-slate-300">
        <Section title="WHAT THIS STEP DOES"><p>{step.desc}</p></Section>
        <Section title="SOURCE SYSTEMS">
          <div className="flex flex-wrap gap-1">{step.sources.map((s) => <span key={s} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">{s}</span>)}</div>
        </Section>
        <Section title="DATA INPUTS"><p>Streaming tool telemetry, MES route data, CMMS PM history, ERP demand signals as applicable to this step.</p></Section>
        <Section title="AI LOGIC"><p>{step.logic}</p></Section>
        <Section title="CONFIDENCE">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded bg-white/5"><div className="h-full bg-emerald-500 rounded" style={{ width: `${step.conf}%` }} /></div>
            <span className="font-semibold text-emerald-300">{step.conf || "—"}%</span>
          </div>
        </Section>
        <Section title="HUMAN APPROVAL"><p className="text-amber-300">{step.approval}</p></Section>
      </div>
    </div>
  );
}

function SensorDetail({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div>
      <DrawerHeader eyebrow="SENSOR HOTSPOT" title="ETCH-217 Live Telemetry" onClose={onClose} />
      <div className="p-4 text-xs text-slate-200">
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200">{msg}</div>
        <div className="mt-4 text-[11px] text-slate-400">Hotspot click events flow through OSIsoft PI → FDC anomaly engine → Operations Intelligence agent. The agent will weight this signal in the next workflow re-run.</div>
      </div>
    </div>
  );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: any }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 grid place-items-center p-4" onClick={onClose}>
      <div className="w-[720px] max-w-[96vw] max-h-[88vh] overflow-y-auto rounded-lg bg-[#0a0f1f] border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0a0f1f]">
          <div className="text-sm font-bold text-white">{title}</div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function WorkOrderBody() {
  return (
    <div className="text-xs text-slate-300 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Asset" value="ETCH-217 (Metal Etch)" />
        <Stat label="Template" value="MTL-ETCH-PM-04" />
        <Stat label="Window" value="Tonight 22:00 – 02:30 CT" tone="text-emerald-300" />
        <Stat label="Priority" value="P2 — Predictive PM" />
      </div>
      <Section title="PARTS LIST">
        <ul className="space-y-1">
          {[
            ["0040-AE817","Upper electrode assembly","2 OH"],
            ["0190-FR223","Focus ring, Si","3 OH"],
            ["0021-OR108","O-ring set, Viton","12 OH"],
            ["0440-EC401","End-point optical window","1 OH"],
          ].map(([p, d, s]) => (
            <li key={p} className="grid grid-cols-12 gap-2 border-b border-white/5 py-1">
              <span className="col-span-3 font-mono text-[11px] text-sky-300">{p}</span>
              <span className="col-span-6">{d}</span>
              <span className="col-span-3 text-right text-emerald-300">{s}</span>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="PROCEDURE STEPS">
        <ol className="list-decimal pl-5 space-y-1 text-slate-300">
          <li>Notify dispatch and freeze new starts on metal layer route</li>
          <li>Vent chamber and isolate process gases per SOP-ETCH-vent-3</li>
          <li>Replace upper electrode and focus ring</li>
          <li>Full wet-clean and dry-cycle, leak-rate test &lt; 5 mTorr/min</li>
          <li>Recalibrate optical end-point with golden wafer Q-CAL-117</li>
          <li>Qualify with seasoning wafer set, release to production</li>
        </ol>
      </Section>
      <Section title="TECHNICIAN ASSIGNMENT">
        <p>Lead: S. Patel (L3 Plasma Etch). Support: M. Nguyen (L2). Coverage: 21:30 – 02:30 CT.</p>
      </Section>
      <Section title="LOCKOUT / TAGOUT CHECKLIST">
        <ul className="space-y-1">
          {[
            "Electrical isolation at panel ETCH-217-MAIN — apply lock #L-217-A",
            "Process gas isolation: Cl2, CF4, O2, Ar — close valves V-12 to V-18, tag",
            "RF generator dissipation verified, ground strap engaged",
            "Cooling water isolated and bleed valves open",
            "Two-person verification: S. Patel + M. Nguyen signoff",
          ].map((c) => <li key={c} className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5" /><span>{c}</span></li>)}
        </ul>
      </Section>
      <Section title="APPROVAL ROUTING">
        <p>Parallel route to Fab Ops Manager, Maintenance Lead, Production Control, Yield Engineering. SLA 30 min.</p>
      </Section>
      <div className="flex gap-2 justify-end pt-2 border-t border-white/10">
        <button className="h-8 px-3 rounded bg-white/5 hover:bg-white/10 text-xs">Save Draft</button>
        <button className="h-8 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold">Submit Work Order</button>
      </div>
    </div>
  );
}

function ApprovalBody() {
  const approvers = [
    { who: "M. Hernandez", role: "Fab Operations Manager",     state: "Approved",  ts: "12:04 CT" },
    { who: "R. Cho",       role: "Maintenance Lead",           state: "Approved",  ts: "12:07 CT" },
    { who: "T. Brennan",   role: "Production Control",         state: "Pending",   ts: "—" },
    { who: "Dr. L. Singh", role: "Yield Engineering",          state: "Pending",   ts: "—" },
  ];
  return (
    <div className="text-xs text-slate-300 space-y-3">
      <p>Recommended window will commit once all approvers respond. SLA 30 minutes. Auto-escalation: Fab Ops Director after 45 min.</p>
      <ul className="divide-y divide-white/5 rounded border border-white/10">
        {approvers.map((a) => (
          <li key={a.who} className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 grid place-items-center text-[11px] font-bold text-white">{a.who.split(" ").map((n) => n[0]).join("")}</div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium">{a.who}</div>
              <div className="text-[11px] text-slate-400">{a.role}</div>
            </div>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded border",
              a.state === "Approved" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-amber-500/40 bg-amber-500/10 text-amber-300 animate-pulse"
            )}>{a.state}</span>
            <span className="text-[10px] text-slate-500 w-14 text-right">{a.ts}</span>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 justify-end pt-2 border-t border-white/10">
        <button className="h-8 px-3 rounded bg-white/5 hover:bg-white/10 text-xs">Send Reminder</button>
        <button className="h-8 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Commit Window</button>
      </div>
    </div>
  );
}
