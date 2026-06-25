import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Float } from "@react-three/drei";
import * as THREE from "three";
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, ReferenceLine, Tooltip as RTooltip,
} from "recharts";
import {
  Activity, AlertTriangle, Bell, Cpu, Factory, Gauge, HelpCircle, Layers, LayoutGrid,
  Settings, ChevronRight, ChevronLeft, X, ArrowRight, CheckCircle2, Clock, Radio,
  TrendingUp, Database, Wind, Thermometer, Zap, Workflow, Users, BookOpen, Brain,
  Power, Play, Pause, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ----------------------------- data ----------------------------- */

type Sev = "HIGH" | "MEDIUM" | "LOW";
interface Equip {
  id: string; sub: string; score: number; sev: Sev;
  process: string; loc: string; tool: string; criticality: Sev;
  detected: string;
}
const EQUIPS: Equip[] = [
  { id: "ETCH-217",  sub: "Metal Etch Chamber", score: 78, sev: "HIGH",   process: "Metal Etch",       loc: "Fab 2 – Bay 12", tool: "Plasma Etch",       criticality: "HIGH",   detected: "10:23:47 AM CT" },
  { id: "CMP-038",   sub: "CMP Module",         score: 61, sev: "MEDIUM", process: "Oxide CMP",        loc: "Fab 2 – Bay 03", tool: "Chemical Mech. Polish", criticality: "HIGH", detected: "10:18:12 AM CT" },
  { id: "PVD-142",   sub: "TiN Deposition",     score: 49, sev: "MEDIUM", process: "Barrier PVD",      loc: "Fab 1 – Bay 07", tool: "PVD Sputter",       criticality: "MEDIUM", detected: "10:09:33 AM CT" },
  { id: "DIFF-011",  sub: "Diffusion Furnace",  score: 32, sev: "LOW",    process: "N2O Anneal",       loc: "Fab 2 – Bay 11", tool: "Diffusion Furnace", criticality: "MEDIUM", detected: "09:54:02 AM CT" },
  { id: "PHOTO-096", sub: "Scanner",            score: 28, sev: "LOW",    process: "Metal-1 Litho",    loc: "Fab 1 – Bay 02", tool: "DUV Lithography",   criticality: "LOW",    detected: "09:41:18 AM CT" },
];

interface Sensor {
  key: string; label: string; value: string; delta: string; abnormal: boolean;
  pos: { top: string; left?: string; right?: string };
  expected: string; baseline: string; duration: string; failure: string;
}
const SENSORS: Record<string, Sensor[]> = {
  "ETCH-217": [
    { key: "rf",   label: "RF Power",            value: "2.18 kW",   delta: "+12.7%", abnormal: true,  pos: { top: "18%",  left: "4%"  }, expected: "1.85 – 2.05 kW",   baseline: "1.93 kW (30d)", duration: "8m 36s", failure: "RF generator drift / matching network detune" },
    { key: "p",    label: "Chamber Pressure",    value: "3.42 mTorr",delta: "+9.3%",  abnormal: true,  pos: { top: "40%",  left: "4%"  }, expected: "2.95 – 3.20 mTorr",baseline: "3.08 mTorr (30d)", duration: "11m 02s", failure: "Throttle valve hysteresis / pump degradation" },
    { key: "he",   label: "He Backside Temp",    value: "198.7 °C",  delta: "+8.6%",  abnormal: true,  pos: { top: "62%",  left: "4%"  }, expected: "175 – 185 °C",    baseline: "182.4 °C (30d)", duration: "6m 41s", failure: "ESC clamp force loss / He leak" },
    { key: "vib",  label: "Motor Vibration (X)", value: "7.28 mm/s", delta: "+65.4%", abnormal: true,  pos: { top: "20%",  right: "4%" }, expected: "2.5 – 4.5 mm/s",  baseline: "3.81 mm/s (30d)", duration: "12m 18s", failure: "Turbo bearing wear / imbalance" },
    { key: "tv",   label: "Throttle Valve Pos.", value: "78.3 %",    delta: "+14.2%", abnormal: true,  pos: { top: "42%",  right: "4%" }, expected: "62 – 70 %",        baseline: "66.4 % (30d)",   duration: "9m 12s", failure: "Conductance loss compensating pressure drift" },
    { key: "gas",  label: "Process Gas Flow",    value: "142.6 sccm",delta: "+6.1%",  abnormal: false, pos: { top: "64%",  right: "4%" }, expected: "130 – 150 sccm",  baseline: "134.2 sccm (30d)", duration: "—",       failure: "MFC drift (within tolerance)" },
  ],
  "CMP-038":   [{ key: "pad", label: "Pad Pressure",   value: "5.6 psi",   delta: "+8.1%", abnormal: true,  pos: { top: "22%", left: "4%" }, expected: "4.8 – 5.2 psi",  baseline: "5.0 psi", duration: "5m 12s", failure: "Pad conditioner wear" }],
  "PVD-142":   [{ key: "tgt", label: "Target Voltage", value: "412 V",     delta: "+4.4%", abnormal: true,  pos: { top: "22%", left: "4%" }, expected: "385 – 400 V",    baseline: "392 V",   duration: "4m 03s", failure: "Target end-of-life approaching" }],
  "DIFF-011":  [{ key: "tc",  label: "Zone-3 Temp",    value: "1042 °C",   delta: "+1.8%", abnormal: false, pos: { top: "22%", left: "4%" }, expected: "1020 – 1045 °C", baseline: "1031 °C", duration: "—",       failure: "Within tolerance" }],
  "PHOTO-096": [{ key: "foc", label: "Focus Offset",   value: "+18 nm",    delta: "+12.0%",abnormal: false, pos: { top: "22%", left: "4%" }, expected: "±15 nm",         baseline: "+9 nm",   duration: "—",       failure: "Lens heating (trend monitoring)" }],
};

const ANOMALY_SERIES = [
  { t: "09:50", y: 12, w: 50 }, { t: "09:54", y: 14, w: 50 }, { t: "09:58", y: 18, w: 50 },
  { t: "10:02", y: 22, w: 50 }, { t: "10:06", y: 28, w: 50 }, { t: "10:10", y: 41, w: 50 },
  { t: "10:14", y: 54, w: 50 }, { t: "10:18", y: 66, w: 50 }, { t: "10:22", y: 78, w: 50 },
];

const NAV = [
  { id: "cmd",    label: "Command\nCenter", icon: LayoutGrid },
  { id: "twin",   label: "Digital\nTwin",   icon: Cpu, active: true },
  { id: "eq",     label: "Equipment",       icon: Factory },
  { id: "prod",   label: "Production",      icon: TrendingUp },
  { id: "disp",   label: "Dispatch",        icon: Workflow },
  { id: "fac",    label: "Facilities",      icon: Layers },
  { id: "ai",     label: "AI Agents",       icon: Brain },
  { id: "kg",     label: "Knowledge\nGraph",icon: BookOpen },
  { id: "rep",    label: "Reports",         icon: Activity },
  { id: "set",    label: "Settings",        icon: Settings },
];

const STEPS = [
  { n: 1, label: "Detect" },
  { n: 2, label: "Estimate RUL" },
  { n: 3, label: "Identify Impact" },
  { n: 4, label: "Simulate Options" },
  { n: 5, label: "Recommend" },
];

/* ----------------------------- helpers ----------------------------- */

function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString();
}

function sevTone(s: Sev) {
  return s === "HIGH" ? "text-rose-400" : s === "MEDIUM" ? "text-amber-400" : "text-sky-400";
}

/* ----------------------------- 3D scene ----------------------------- */

function PlasmaCore() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.06);
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.2 + Math.sin(t * 3) * 0.6;
  });
  return (
    <mesh ref={ref} position={[0, 0.2, 0]}>
      <sphereGeometry args={[0.55, 32, 32]} />
      <meshStandardMaterial color="#ff3b5c" emissive="#ff3b5c" emissiveIntensity={2.5} transparent opacity={0.85} />
    </mesh>
  );
}

function Chamber() {
  return (
    <group>
      {/* base plinth */}
      <mesh position={[0, -1.1, 0]} receiveShadow>
        <boxGeometry args={[5.4, 0.2, 3.6]} />
        <meshStandardMaterial color="#0c1424" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* main chamber body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[3.2, 2.2, 2.6]} />
        <meshStandardMaterial color="#1a2438" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* viewing window */}
      <mesh position={[0, 0.05, 1.31]}>
        <cylinderGeometry args={[0.78, 0.78, 0.04, 48]} />
        <meshStandardMaterial color="#000814" emissive="#ff2b4a" emissiveIntensity={0.4} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.05, 1.34]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.78, 0.05, 16, 64]} />
        <meshStandardMaterial color="#ff3b5c" emissive="#ff3b5c" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 0.05, 1.36]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.015, 16, 64]} />
        <meshStandardMaterial color="#ff5577" emissive="#ff5577" emissiveIntensity={1.2} transparent opacity={0.6} />
      </mesh>
      <group position={[0, 0.05, 0.9]}>
        <PlasmaCore />
      </group>
      {/* side equipment racks */}
      <mesh position={[-2.4, -0.2, 0]}>
        <boxGeometry args={[1.4, 1.8, 2.4]} />
        <meshStandardMaterial color="#141d2f" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[2.4, -0.2, 0]}>
        <boxGeometry args={[1.4, 1.8, 2.4]} />
        <meshStandardMaterial color="#141d2f" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* status leds */}
      {[-2.4, 2.4].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 1.21]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
        </mesh>
      ))}
      {/* top exhaust */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 0.7, 24]} />
        <meshStandardMaterial color="#1a2438" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* AMR cart */}
      <group position={[-1.6, -0.85, 1.8]}>
        <mesh>
          <boxGeometry args={[0.9, 0.4, 0.6]} />
          <meshStandardMaterial color="#0f1a2e" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.6, 0.1, 0.4]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} />
        </mesh>
      </group>
      {/* floor grid glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.18, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshBasicMaterial color="#0a1428" />
      </mesh>
    </group>
  );
}

function Scene() {
  const cam = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!cam.current) return;
    const t = s.clock.elapsedTime * 0.15;
    cam.current.rotation.y = Math.sin(t) * 0.12;
  });
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 6, 5]} intensity={1.1} color="#dbeafe" />
      <pointLight position={[0, 0.5, 1.5]} intensity={2.2} color="#ff3b5c" distance={6} />
      <pointLight position={[-3, 2, 3]} intensity={1.2} color="#60a5fa" />
      <pointLight position={[3, 2, 3]} intensity={1.0} color="#22d3ee" />
      <group ref={cam}>
        <Float speed={0.6} rotationIntensity={0.05} floatIntensity={0.15}>
          <Chamber />
        </Float>
      </group>
    </>
  );
}

/* ----------------------------- UI bits ----------------------------- */

function Pill({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "red" | "amber" | "emerald" }) {
  const t = tone === "red"   ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
          : tone === "amber" ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
          : tone === "emerald"? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          : "bg-sky-500/15 text-sky-300 border-sky-500/30";
  return <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium", t)}>{children}</span>;
}

function Tooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="pointer-events-none absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="px-2.5 py-1.5 rounded-md bg-slate-950/95 border border-slate-700 text-[11px] text-slate-200 whitespace-nowrap shadow-xl">
          {content}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Page ----------------------------- */

export default function DigitalTwin() {
  const [equipId, setEquipId] = useState("ETCH-217");
  const [activeStep, setActiveStep] = useState(1);
  const [openSensor, setOpenSensor] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<"analysis" | "sensor" | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [paused, setPaused] = useState(false);

  const equip = useMemo(() => EQUIPS.find((e) => e.id === equipId)!, [equipId]);
  const sensors = SENSORS[equipId] ?? SENSORS["ETCH-217"];

  const sources = useCountUp(2847);
  const stream = useCountUp(18540);
  const anom = useCountUp(7);

  return (
    <div className="min-h-screen bg-[#070b15] text-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0a1020]/95 backdrop-blur">
        <div className="flex items-center gap-4 px-4 h-16">
          <div className="flex items-center gap-2.5 w-[210px] shrink-0">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 grid place-items-center text-white font-bold">N</div>
            <div className="font-semibold tracking-tight">Neurealm</div>
          </div>
          <div className="w-[260px] shrink-0">
            <div className="text-[15px] font-semibold leading-tight">Digital Coworker</div>
            <div className="text-xs text-slate-400">Maintenance Optimization Agent</div>
          </div>
          {/* stepper */}
          <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0 overflow-x-auto">
            {STEPS.map((s, i) => {
              const active = activeStep === s.n;
              const done = activeStep > s.n;
              return (
                <div key={s.n} className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveStep(s.n)}
                    className={cn(
                      "h-7 px-2 rounded-full inline-flex items-center gap-1.5 text-xs font-medium transition border",
                      active && "bg-sky-500 text-white border-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.45)]",
                      done && !active && "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
                      !active && !done && "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500",
                    )}
                  >
                    <span className={cn("h-4 w-4 rounded-full grid place-items-center text-[10px] font-bold",
                      active ? "bg-white/20" : done ? "bg-emerald-500/30" : "bg-slate-700")}>{s.n}</span>
                    {s.label}
                  </button>
                  {i < STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-slate-600" />}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-sm font-semibold leading-tight">DFW Semiconductor Fab</div>
              <div className="text-[11px] text-slate-400">📍 Richardson, Texas</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-right">
              <div className="text-[11px] text-slate-400">May 23, 2025  10:24 AM CT</div>
              <Pill tone="emerald"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Live</Pill>
            </div>
            <button className="relative h-9 w-9 rounded-lg bg-slate-900 border border-slate-700 grid place-items-center hover:border-slate-500">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold grid place-items-center">5</span>
            </button>
            <button className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-700 grid place-items-center hover:border-slate-500">
              <HelpCircle className="h-4 w-4" />
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 grid place-items-center text-xs font-bold">AO</div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* LEFT NAV */}
        <aside className="w-[88px] shrink-0 border-r border-slate-800 bg-[#0a1020] min-h-[calc(100vh-4rem)] py-3 flex flex-col items-stretch gap-1 px-2">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <button
                key={n.id}
                className={cn(
                  "py-2.5 rounded-lg flex flex-col items-center gap-1 text-[10.5px] leading-tight whitespace-pre-line text-center transition border",
                  n.active
                    ? "bg-sky-500/10 text-sky-300 border-sky-500/40 shadow-[0_0_18px_rgba(56,189,248,0.15)_inset]"
                    : "text-slate-400 border-transparent hover:bg-slate-900 hover:text-slate-200"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{n.label}</span>
              </button>
            );
          })}
          <button className="mt-auto py-2 text-slate-500 hover:text-slate-200">
            <ChevronLeft className="h-4 w-4 mx-auto" />
          </button>
        </aside>

        {/* MAIN */}
        <main className="flex-1 min-w-0 p-4 lg:p-5 space-y-4">
          {/* Top section: title + KPIs */}
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-7 rounded-xl border border-slate-800 bg-gradient-to-br from-[#0d1426] to-[#0a1020] p-4">
              <div className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">STEP 1 OF 14</div>
              <div className="flex items-start justify-between gap-3 mt-1">
                <h1 className="text-[26px] font-bold tracking-tight">Detect Abnormal Equipment Behavior</h1>
                <Pill tone="blue">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Analyzing Real-Time Data
                </Pill>
              </div>
              <p className="text-[12.5px] text-slate-400 mt-1.5 max-w-[68ch]">
                The Maintenance Optimization Agent continuously observes multi-sensor data from across the
                factory to detect subtle deviations that precede equipment degradation or failure.
              </p>
            </div>

            <div className="col-span-12 xl:col-span-5 rounded-xl border border-slate-800 bg-[#0a1020] p-4 grid grid-cols-3 gap-4 relative">
              <Kpi label="Data Sources" value={sources} sub="IoT Tags Streaming" icon={Database} tone="sky" />
              <Kpi label="Streaming Rate" value={stream} sub="Events / Second" icon={Radio} tone="sky" />
              <Kpi label="Anomalies Detected" value={anom} sub="In Last 5 Minutes" icon={AlertTriangle} tone="rose" />
            </div>
          </section>

          {/* Middle: left card | 3D scene | right analysis */}
          <section className="grid grid-cols-12 gap-4">
            {/* Left anomaly card */}
            <div className="col-span-12 xl:col-span-3 rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-950/30 to-[#0a1020] p-4 space-y-3">
              <div className="text-[10px] font-semibold tracking-[0.18em] text-rose-400">ANOMALY DETECTED</div>
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-lg bg-rose-500/15 border border-rose-500/40 grid place-items-center">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <div className="text-lg font-bold leading-tight">{equip.id}</div>
                  <div className="text-xs text-rose-300">{equip.sub}</div>
                </div>
              </div>
              <div className="text-[12px] text-rose-300/90">
                Anomalous behavior detected<br />at {equip.detected}
              </div>
              <dl className="text-xs divide-y divide-slate-800 border-y border-slate-800">
                {[
                  ["Process Step", equip.process, "text-sky-300"],
                  ["Location", equip.loc, ""],
                  ["Tool Type", equip.tool, ""],
                  ["Criticality", equip.criticality, sevTone(equip.criticality)],
                  ["Impact Score", `${equip.score} / 100`, "text-amber-300"],
                ].map(([k, v, c]) => (
                  <div key={k as string} className="flex justify-between py-1.5">
                    <dt className="text-slate-400">{k}</dt>
                    <dd className={cn("font-semibold", c)}>{v}</dd>
                  </div>
                ))}
              </dl>
              <button
                onClick={() => setDrawer("analysis")}
                className="w-full h-9 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-xs font-semibold inline-flex items-center justify-between px-3"
              >
                View Full Analysis <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 3D scene */}
            <div className="col-span-12 xl:col-span-6 rounded-xl border border-slate-800 bg-[#06101f] relative overflow-hidden min-h-[460px]">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-md bg-slate-950/80 border border-slate-700 text-xs">
                <span className="font-semibold">{equip.id}</span>
                <span className="text-sky-300 ml-1.5">{equip.sub}</span>
              </div>
              <Canvas
                shadows
                camera={{ position: [4.5, 2.2, 5.5], fov: 42 }}
                className="!h-[460px]"
                gl={{ antialias: true }}
              >
                <color attach="background" args={["#06101f"]} />
                <Suspense fallback={null}>
                  <Scene />
                </Suspense>
                <OrbitControls enablePan={false} minDistance={4} maxDistance={9} maxPolarAngle={Math.PI / 2.1} />
              </Canvas>

              {/* sensor hotspots overlay */}
              {sensors.map((sn, i) => (
                <button
                  key={sn.key}
                  onClick={() => { setOpenSensor(sn.key); setDrawer("sensor"); }}
                  onMouseEnter={() => setOpenSensor(sn.key)}
                  style={{ top: sn.pos.top, left: sn.pos.left, right: sn.pos.right, animationDelay: `${i * 120}ms` }}
                  className={cn(
                    "absolute z-10 w-[170px] text-left rounded-lg border px-2.5 py-1.5 backdrop-blur transition-all animate-[fadeIn_0.4s_ease-out_both]",
                    sn.abnormal
                      ? "border-rose-500/50 bg-rose-950/40 shadow-[0_0_22px_rgba(244,63,94,0.25)]"
                      : "border-sky-500/40 bg-sky-950/30",
                  )}
                >
                  <div className="text-[10.5px] text-slate-300">{sn.label}</div>
                  <div className="text-sm font-semibold">{sn.value}</div>
                  <div className={cn("text-[10.5px] font-medium", sn.abnormal ? "text-rose-400" : "text-emerald-400")}>{sn.delta}</div>
                  {sn.abnormal && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                  )}
                  {openSensor === sn.key && (
                    <div className="absolute z-20 left-full ml-2 top-0 w-[230px] rounded-md bg-slate-950/95 border border-slate-700 p-2.5 text-[11px] shadow-xl space-y-1">
                      <div className="font-semibold text-sm">{sn.label}</div>
                      <div className="flex justify-between"><span className="text-slate-400">Expected</span><span>{sn.expected}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Current</span><span className={sn.abnormal ? "text-rose-300" : ""}>{sn.value}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Baseline (30d)</span><span>{sn.baseline}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Duration</span><span>{sn.duration}</span></div>
                      <div className="pt-1 border-t border-slate-800 text-slate-300">{sn.failure}</div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Right analysis */}
            <div className="col-span-12 xl:col-span-3 space-y-4">
              <div className="rounded-xl border border-slate-800 bg-[#0a1020] p-4">
                <div className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">ANOMALY OVERVIEW</div>
                <div className="text-[11px] text-slate-400 mb-3">What makes this different?</div>
                <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 mb-3">
                  <div>
                    <div className="text-[10px] text-slate-400">Anomaly Score</div>
                    <div className="text-2xl font-bold text-amber-300 tabular-nums">{equip.score}<span className="text-sm text-slate-500"> / 100</span></div>
                  </div>
                  <Pill tone="red">{equip.sev}</Pill>
                </div>
                <ul className="space-y-1.5 text-[12px]">
                  {[
                    [AlertTriangle, "7 of 8 critical sensors deviating"],
                    [Clock, "Deviation sustained for 8m 36s"],
                    [Activity, "Pattern matches early failure signature"],
                    [Layers, "Similar to 3 past incidents"],
                    [Gauge, "Conflicting with normal process window"],
                    [TrendingUp, "Increasing rate of deviation"],
                  ].map(([Icon, t], i) => {
                    const I = Icon as any;
                    return (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <I className="h-3.5 w-3.5 text-slate-500 mt-0.5 shrink-0" />
                        <span>{t as string}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#0a1020] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">ANOMALY TIMELINE</div>
                  <select className="h-6 text-[11px] bg-slate-900 border border-slate-700 rounded px-1.5">
                    <option>Last 30 Minutes</option>
                    <option>Last 2 Hours</option>
                    <option>Last 24 Hours</option>
                  </select>
                </div>
                <div className="h-[140px]">
                  <ResponsiveContainer>
                    <AreaChart data={ANOMALY_SERIES} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="anomG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="t" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={{ stroke: "#1f2937" }} tickLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={{ stroke: "#1f2937" }} tickLine={false} domain={[0, 100]} />
                      <RTooltip contentStyle={{ background: "#0a1020", border: "1px solid #334155", fontSize: 11 }} />
                      <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: "Warning", position: "insideTopLeft", fill: "#f59e0b", fontSize: 10 }} />
                      <Area type="monotone" dataKey="y" stroke="#f43f5e" strokeWidth={2} fill="url(#anomG)" isAnimationActive animationDuration={1500} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                  <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 bg-rose-500" />Anomaly Score</span>
                  <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 border-t border-dashed border-amber-500" />Warning Threshold</span>
                </div>
              </div>
            </div>
          </section>

          {/* Visibility gap + Top anomalies */}
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-9 rounded-xl border border-slate-800 bg-[#0a1020] p-4">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold tracking-wide">THE VISIBILITY GAP IN TRADITIONAL SYSTEMS</div>
                  <div className="text-[11px] text-slate-400">What existing solutions show vs. what the Maintenance Optimization Agent detects</div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3 items-stretch">
                <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-2">
                  {[
                    { t: "OEM Equipment HMI", s: "Basic alarms only",  st: "NORMAL" },
                    { t: "MES Equipment Status", s: "Run / Idle / Down", st: "RUNNING" },
                    { t: "EHS / SPC Systems", s: "Process within control", st: "IN CONTROL" },
                    { t: "CMMS / PM System", s: "Next PM in 5 days", st: "NOT DUE" },
                  ].map((c) => (
                    <Tooltip key={c.t} content="Existing system shows OK while degradation is silently progressing">
                      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2.5 text-center w-full">
                        <div className="text-[11px] font-semibold">{c.t}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{c.s}</div>
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto my-1.5" />
                        <div className="text-[10px] font-bold text-emerald-300">{c.st}</div>
                      </div>
                    </Tooltip>
                  ))}
                </div>

                <div className="col-span-12 lg:col-span-1 flex items-center justify-center">
                  <div className="relative h-10 w-full lg:h-full lg:w-10">
                    <ArrowRight className="absolute inset-0 m-auto h-7 w-7 text-rose-500 animate-[pulse_1.6s_ease-in-out_infinite]" />
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-6 rounded-lg border border-sky-500/30 bg-sky-950/20 p-3">
                  <div className="text-[11px] font-semibold mb-2">NEUREALM AGENT <span className="text-slate-400 font-normal">(What You See Now)</span></div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { t: "Multi-Sensor Correlation", s: "Sees subtle patterns",   st: "DEVIATION",      tone: "red" as const },
                      { t: "Early Degradation Detection", s: "Catches issues early", st: "DETECTED",       tone: "red" as const },
                      { t: "Failure Pattern Matching", s: "Learns from history",     st: "MATCHED",        tone: "amber" as const },
                      { t: "Cross-Domain Context", s: "Understands impact",          st: "RISK IDENTIFIED",tone: "amber" as const },
                    ].map((c) => (
                      <div key={c.t} className="rounded-lg border border-slate-800 bg-slate-900/40 p-2.5 text-center">
                        <div className="text-[11px] font-semibold">{c.t}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{c.s}</div>
                        <AlertTriangle className={cn("h-5 w-5 mx-auto my-1.5", c.tone === "red" ? "text-rose-400" : "text-amber-400")} />
                        <div className={cn("text-[10px] font-bold", c.tone === "red" ? "text-rose-300" : "text-amber-300")}>{c.st}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-2.5 text-[11.5px] text-center">
                  <div>Hidden <span className="text-rose-300">degradation</span> remains invisible until it becomes a failure</div>
                  <div className="text-rose-300/80 mt-0.5">Typical false negative window: 3 – 14 days</div>
                </div>
                <div className="rounded-lg border border-sky-500/30 bg-sky-950/20 p-2.5 text-[11.5px] text-center">
                  <div>Detects problems <span className="text-sky-300 font-semibold">3 – 14 days</span> before failure</div>
                  <div className="text-sky-300/80 mt-0.5">Enables optimal maintenance timing</div>
                </div>
              </div>
            </div>

            {/* Top 5 anomalies */}
            <div className="col-span-12 xl:col-span-3 rounded-xl border border-slate-800 bg-[#0a1020] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-semibold tracking-wide">TOP 5 ACTIVE ANOMALIES</div>
                <button className="text-[10px] text-sky-300 hover:underline">View All</button>
              </div>
              <ul className="space-y-1.5">
                {EQUIPS.map((e) => (
                  <li key={e.id}>
                    <button
                      onClick={() => setEquipId(e.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 p-2 rounded-lg border text-left transition",
                        equipId === e.id ? "border-sky-500/50 bg-sky-950/30" : "border-slate-800 bg-slate-900/30 hover:bg-slate-900/60"
                      )}
                    >
                      <div className={cn("h-8 w-8 rounded-md grid place-items-center shrink-0",
                        e.sev === "HIGH" ? "bg-rose-500/15 border border-rose-500/30" :
                        e.sev === "MEDIUM" ? "bg-amber-500/15 border border-amber-500/30" :
                        "bg-sky-500/15 border border-sky-500/30")}>
                        <Cpu className={cn("h-4 w-4", sevTone(e.sev))} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold truncate">{e.id}</div>
                        <div className="text-[10.5px] text-slate-400 truncate">{e.sub}</div>
                      </div>
                      <div className="text-right">
                        <div className={cn("text-sm font-bold tabular-nums", sevTone(e.sev))}>{e.score}</div>
                        <div className={cn("text-[9.5px] font-semibold", sevTone(e.sev))}>{e.sev}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Bottom telemetry bar */}
          <footer className="rounded-xl border border-slate-800 bg-[#0a1020] px-4 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11.5px]">
            <Telemetry label="Agent Status"><span className="inline-flex items-center gap-1.5 font-semibold text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Active</span></Telemetry>
            <Telemetry label="Streaming Since">10:12:34 AM</Telemetry>
            <Telemetry label="Data Health"><span className="font-semibold text-emerald-300">99.98%</span></Telemetry>
            <Telemetry label="Model Confidence"><span className="font-semibold">High (94.2%)</span></Telemetry>
            <div className="ml-auto flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <span className="text-slate-400">Auto-refresh</span>
                <button onClick={() => setAutoRefresh(!autoRefresh)} className={cn("h-5 w-9 rounded-full border transition relative",
                  autoRefresh ? "bg-emerald-500/30 border-emerald-400" : "bg-slate-800 border-slate-700")}>
                  <span className={cn("absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all",
                    autoRefresh ? "left-[18px]" : "left-0.5")} />
                </button>
                <span className={cn("font-semibold", autoRefresh ? "text-emerald-300" : "text-slate-500")}>{autoRefresh ? "ON" : "OFF"}</span>
              </label>
              <button onClick={() => setPaused(!paused)} className="h-7 px-3 rounded-md border border-slate-700 bg-slate-900 hover:border-slate-500 inline-flex items-center gap-1.5 text-xs">
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                {paused ? "Resume" : "Pause"}
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* Drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer(null)} />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[460px] bg-[#0a1020] border-l border-slate-800 shadow-2xl overflow-y-auto animate-[slideIn_0.3s_ease-out]">
            <div className="sticky top-0 bg-[#0a1020]/95 backdrop-blur border-b border-slate-800 p-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-semibold tracking-[0.18em] text-sky-300">
                  {drawer === "analysis" ? "FULL ANALYSIS" : "SENSOR DEEP-DIVE"}
                </div>
                <div className="text-lg font-bold leading-tight mt-0.5">
                  {drawer === "analysis"
                    ? `${equip.id} · ${equip.sub}`
                    : sensors.find((s) => s.key === openSensor)?.label ?? equip.id}
                </div>
              </div>
              <button onClick={() => setDrawer(null)} className="h-8 w-8 rounded-md border border-slate-700 grid place-items-center hover:bg-slate-900">
                <X className="h-4 w-4" />
              </button>
            </div>
            {drawer === "analysis" ? (
              <AnalysisBody equip={equip} />
            ) : (
              <SensorBody sensor={sensors.find((s) => s.key === openSensor)!} equip={equip} />
            )}
          </aside>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </div>
  );
}

/* ----------------------------- small subcomponents ----------------------------- */

function Kpi({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: any; tone: "sky" | "rose" }) {
  const c = tone === "rose" ? "text-rose-400" : "text-slate-100";
  return (
    <Tooltip content={`${label}: ${value} — ${sub}`}>
      <div className="w-full text-left">
        <div className="text-[11px] text-slate-400">{label}</div>
        <div className={cn("text-[28px] font-bold tabular-nums leading-tight mt-0.5", c)}>{value}</div>
        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-0.5">
          <Icon className="h-3 w-3" /> {sub}
        </div>
      </div>
    </Tooltip>
  );
}

function Telemetry({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-500">{label}:</span>
      <span>{children}</span>
    </div>
  );
}

function AnalysisBody({ equip }: { equip: Equip }) {
  return (
    <div className="p-4 space-y-4 text-[12.5px]">
      <Section title="Root Cause Hypothesis">
        <p className="text-slate-300">Combined RF generator drift (+12.7%) and pressure compensation by throttle valve (+14.2%) on <b>{equip.id}</b> suggests RF matching network detune coupled with conductance loss. Vibration spike (+65.4% on motor X) indicates turbo bearing degradation accelerating gas-flow control variability.</p>
      </Section>
      <Section title="Sensor Contribution Ranking">
        <ol className="space-y-1.5">
          {[
            ["Motor Vibration (X)", 38],
            ["RF Power",            22],
            ["Throttle Valve Pos.", 17],
            ["Chamber Pressure",    13],
            ["He Backside Temp",    10],
          ].map(([n, v]) => (
            <li key={n as string} className="flex items-center gap-2">
              <span className="w-40 text-slate-300">{n as string}</span>
              <div className="flex-1 h-1.5 rounded bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-rose-500" style={{ width: `${v}%` }} />
              </div>
              <span className="w-8 text-right tabular-nums text-slate-400">{v}%</span>
            </li>
          ))}
        </ol>
      </Section>
      <Section title="Similar Historical Incidents">
        <ul className="space-y-1 text-slate-300">
          <li>· INC-2024-0418  ETCH-217  Wet-clean +3 days early avoided 14h unplanned down</li>
          <li>· INC-2024-0207  ETCH-301  Same vibration signature → bearing replace</li>
          <li>· INC-2023-1128  ETCH-217  RF matching network re-tune resolved drift</li>
        </ul>
      </Section>
      <Section title="Probable Degradation Mechanism">
        <p className="text-slate-300">Plasma stability degradation driven by chamber wall conditioning loss; expected to manifest as CD uniformity excursion on next 4 lots if uncorrected.</p>
      </Section>
      <Section title="Recommended Next Step">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-emerald-200">
          Proceed to <b>Step 2 — Estimate Remaining Useful Life</b> and trigger preventive wet-clean within next maintenance window.
        </div>
      </Section>
      <div className="grid grid-cols-2 gap-2 text-[11.5px]">
        <Mini label="Data Confidence" value="94.2% High" />
        <Mini label="Affected Recipe" value="MTL-CU-2.1" />
        <Mini label="WIP at Risk" value="37 lots / 6 customers" />
        <Mini label="False Alarm Rate" value="2.1% (30d)" />
      </div>
      <Section title="Open Engineering Questions">
        <ul className="list-disc list-inside text-slate-300 space-y-0.5">
          <li>Has matching network been calibrated since last wet-clean?</li>
          <li>Confirm turbo bearing inspection interval against vendor bulletin LAM-2024-07</li>
          <li>Cross-check He leak rate against ESC clamp force trend</li>
        </ul>
      </Section>
    </div>
  );
}

function SensorBody({ sensor, equip }: { sensor: Sensor; equip: Equip }) {
  return (
    <div className="p-4 space-y-4 text-[12.5px]">
      <div className="grid grid-cols-2 gap-2">
        <Mini label="Current" value={sensor.value} />
        <Mini label="Expected" value={sensor.expected} />
        <Mini label="Baseline (30d)" value={sensor.baseline} />
        <Mini label="Deviation Duration" value={sensor.duration} />
      </div>
      <Section title="Likely Failure Mode">
        <p className="text-slate-300">{sensor.failure}</p>
      </Section>
      <Section title="Context">
        <p className="text-slate-300">{sensor.label} on <b>{equip.id}</b> ({equip.tool}) at {equip.loc}. Recipe MTL-CU-2.1, last PM wet-clean Apr 28, 2024.</p>
      </Section>
      <Section title="Recommended Diagnostic">
        <ul className="list-disc list-inside text-slate-300 space-y-0.5">
          <li>Cross-correlate with FDC chamber-state vectors</li>
          <li>Check SPC chart for downstream CD uniformity</li>
          <li>Compare to fleet siblings ETCH-219, ETCH-305</li>
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-[0.18em] text-slate-500 mb-1.5">{title.toUpperCase()}</div>
      {children}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/40 px-2.5 py-1.5">
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
