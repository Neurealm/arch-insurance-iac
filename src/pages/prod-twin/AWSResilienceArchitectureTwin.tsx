import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line, RoundedBox } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import {
  Activity, Shield, DollarSign, AlertTriangle, Wrench, Layers, Zap,
  RotateCcw, ChevronRight, Cloud, X, Clock,
  CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Minus,
  Beaker, Workflow, Users, Sliders, Award,
} from "lucide-react";
import {
  ResilienceLabController, DigitalWorkforcePanel, DependencyMapPanel,
  TransformationSlider, ExecutiveValueRealization, OperatingTimeline,
  WorkshopOutputPanel,
} from "@/components/sre-twin/SRETwinSections";
import { AppShell } from "@/components/eoc/AppShell";
import type { Simulation, Coworker } from "@/data/sreTwinData";

/* ---------------- TYPES & DATA ---------------- */

type Status = "healthy" | "warning" | "degraded" | "critical" | "remediating";
type ViewMode =
  | "architecture" | "reliability" | "performance"
  | "security" | "cost" | "incident" | "remediation"
  | "lab" | "dependency" | "workforce" | "transformation" | "executive";
type ScenarioId =
  | "normal" | "ec2_02_degraded" | "alb_5xx" | "az_a_impair"
  | "patch_risk" | "cost_opt" | "security_exposure";

interface ComponentState {
  status: Status;
  trafficWeight?: number; // 0..1 share of traffic for EC2s
}

interface SceneState {
  alb: ComponentState;
  ec2_01: ComponentState;
  ec2_02: ComponentState;
  ec2_03: ComponentState;
  asg: ComponentState;
  vpc: ComponentState;
  az_a: ComponentState;
  az_b: ComponentState;
  obs: ComponentState;
  runbook: ComponentState;
}

const scenarioStates: Record<ScenarioId, { state: SceneState; headerOverrides?: Partial<HeaderMetrics> }> = {
  normal: {
    state: {
      alb: { status: "healthy" },
      ec2_01: { status: "healthy", trafficWeight: 0.34 },
      ec2_02: { status: "healthy", trafficWeight: 0.33 },
      ec2_03: { status: "healthy", trafficWeight: 0.33 },
      asg: { status: "healthy" }, vpc: { status: "healthy" },
      az_a: { status: "healthy" }, az_b: { status: "healthy" },
      obs: { status: "healthy" }, runbook: { status: "healthy" },
    },
  },
  ec2_02_degraded: {
    state: {
      alb: { status: "warning" },
      ec2_01: { status: "healthy", trafficWeight: 0.45 },
      ec2_02: { status: "degraded", trafficWeight: 0.10 },
      ec2_03: { status: "healthy", trafficWeight: 0.45 },
      asg: { status: "warning" }, vpc: { status: "healthy" },
      az_a: { status: "healthy" }, az_b: { status: "warning" },
      obs: { status: "warning" }, runbook: { status: "remediating" },
    },
    headerOverrides: { incident: "P3 Active", p95: "241 ms", err5xx: "0.42%", health: "Degraded" },
  },
  alb_5xx: {
    state: {
      alb: { status: "critical" },
      ec2_01: { status: "warning", trafficWeight: 0.34 },
      ec2_02: { status: "warning", trafficWeight: 0.33 },
      ec2_03: { status: "warning", trafficWeight: 0.33 },
      asg: { status: "healthy" }, vpc: { status: "healthy" },
      az_a: { status: "warning" }, az_b: { status: "warning" },
      obs: { status: "warning" }, runbook: { status: "remediating" },
    },
    headerOverrides: { incident: "P2 Active", err5xx: "3.4%", health: "Degraded", slo: "99.81%" },
  },
  az_a_impair: {
    state: {
      alb: { status: "warning" },
      ec2_01: { status: "degraded", trafficWeight: 0.05 },
      ec2_02: { status: "healthy", trafficWeight: 0.90 },
      ec2_03: { status: "degraded", trafficWeight: 0.05 },
      asg: { status: "warning" }, vpc: { status: "warning" },
      az_a: { status: "critical" }, az_b: { status: "healthy" },
      obs: { status: "warning" }, runbook: { status: "remediating" },
    },
    headerOverrides: { incident: "P1 Active", health: "Degraded", azScore: "54 / 100" },
  },
  patch_risk: {
    state: {
      alb: { status: "healthy" },
      ec2_01: { status: "healthy", trafficWeight: 0.34 },
      ec2_02: { status: "warning", trafficWeight: 0.33 },
      ec2_03: { status: "healthy", trafficWeight: 0.33 },
      asg: { status: "healthy" }, vpc: { status: "healthy" },
      az_a: { status: "healthy" }, az_b: { status: "warning" },
      obs: { status: "healthy" }, runbook: { status: "healthy" },
    },
  },
  cost_opt: {
    state: {
      alb: { status: "healthy" },
      ec2_01: { status: "healthy", trafficWeight: 0.40 },
      ec2_02: { status: "healthy", trafficWeight: 0.40 },
      ec2_03: { status: "warning", trafficWeight: 0.20 },
      asg: { status: "healthy" }, vpc: { status: "healthy" },
      az_a: { status: "healthy" }, az_b: { status: "healthy" },
      obs: { status: "healthy" }, runbook: { status: "healthy" },
    },
  },
  security_exposure: {
    state: {
      alb: { status: "warning" },
      ec2_01: { status: "healthy", trafficWeight: 0.34 },
      ec2_02: { status: "healthy", trafficWeight: 0.33 },
      ec2_03: { status: "healthy", trafficWeight: 0.33 },
      asg: { status: "healthy" }, vpc: { status: "warning" },
      az_a: { status: "healthy" }, az_b: { status: "healthy" },
      obs: { status: "healthy" }, runbook: { status: "healthy" },
    },
  },
};

interface HeaderMetrics {
  health: string; slo: string; budget: string; incident: string;
  p95: string; err5xx: string; cost: string; azScore: string;
}
const baseHeader: HeaderMetrics = {
  health: "Healthy", slo: "99.93%", budget: "62%", incident: "No active P1",
  p95: "183 ms", err5xx: "0.18%", cost: "$7,840 / mo", azScore: "82 / 100",
};

const scenarios: { id: ScenarioId; label: string }[] = [
  { id: "normal", label: "Normal Operations" },
  { id: "ec2_02_degraded", label: "EC2 App 02 Degraded" },
  { id: "alb_5xx", label: "ALB 5xx Spike" },
  { id: "az_a_impair", label: "AZ A Impairment" },
  { id: "patch_risk", label: "Patch Compliance Risk" },
  { id: "cost_opt", label: "Cost Optimization" },
  { id: "security_exposure", label: "Security Exposure" },
];

const viewModes: { id: ViewMode; label: string; icon: any }[] = [
  { id: "architecture", label: "Architecture", icon: Layers },
  { id: "reliability", label: "Reliability", icon: Activity },
  { id: "performance", label: "Performance", icon: Zap },
  { id: "security", label: "Security", icon: Shield },
  { id: "cost", label: "Cost", icon: DollarSign },
  { id: "incident", label: "Incident", icon: AlertTriangle },
  { id: "lab", label: "Resilience Lab", icon: Beaker },
  { id: "dependency", label: "Dependency Map", icon: Workflow },
  { id: "workforce", label: "Digital Workforce", icon: Users },
  { id: "transformation", label: "Transformation", icon: Sliders },
  { id: "executive", label: "Executive Value", icon: Award },
];

const timelineEvents = [
  { t: "09:02", title: "CloudWatch latency warning", target: "alb", detail: "P95 latency crossed 200ms threshold on listener :443" },
  { t: "09:05", title: "Target group health check variance", target: "ec2_02", detail: "Target group reports 2/3 fully healthy" },
  { t: "09:07", title: "Auto Scaling evaluation", target: "asg", detail: "ASG evaluated scale-out policy; held due to AZ balance" },
  { t: "09:09", title: "SRE runbook recommended", target: "runbook", detail: "Runbook: Drain, Diagnose, Restart, Validate" },
  { t: "09:12", title: "Traffic drain initiated", target: "ec2_02", detail: "ALB target deregistration in progress" },
  { t: "09:18", title: "Recovery forecast updated", target: "runbook", detail: "Forecast: SLO recovery in 11 min" },
];

const statusColor: Record<Status, string> = {
  healthy: "#10b981", warning: "#f59e0b", degraded: "#f97316",
  critical: "#ef4444", remediating: "#3b82f6",
};
const statusBg: Record<Status, string> = {
  healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  degraded: "bg-orange-50 text-orange-700 border-orange-200",
  critical: "bg-red-50 text-red-700 border-red-200",
  remediating: "bg-blue-50 text-blue-700 border-blue-200",
};

/* ---------------- 3D PRIMITIVES ---------------- */

function HealthRing({ status, radius = 0.9 }: { status: Status; radius?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.4; });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[radius, radius + 0.06, 48]} />
      <meshBasicMaterial color={statusColor[status]} transparent opacity={0.85} />
    </mesh>
  );
}

function Node3D({
  position, label, status, onClick, onHover, selected, scale = 1, color = "#ffffff", icon,
}: {
  position: [number, number, number]; label: string; status: Status;
  onClick?: () => void; onHover?: (h: boolean) => void; selected?: boolean;
  scale?: number; color?: string; icon?: string;
}) {
  const grp = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (grp.current) {
      grp.current.position.y = position[1] + Math.sin(s.clock.elapsedTime * 1.2 + position[0]) * 0.04;
    }
  });
  return (
    <group ref={grp} position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); onHover?.(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onHover?.(false); document.body.style.cursor = "default"; }}
    >
      <RoundedBox args={[1.2 * scale, 0.5 * scale, 1.2 * scale]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.35}
          emissive={selected ? statusColor[status] : "#000"} emissiveIntensity={selected ? 0.25 : 0} />
      </RoundedBox>
      <HealthRing status={status} radius={0.85 * scale} />
      <Html position={[0, 0.55 * scale, 0]} center distanceFactor={8} occlude={false}>
        <div className="pointer-events-none whitespace-nowrap text-[11px] font-medium text-slate-800 bg-white/90 backdrop-blur px-2 py-0.5 rounded border border-slate-200 shadow-sm">
          {icon && <span className="mr-1">{icon}</span>}{label}
        </div>
      </Html>
    </group>
  );
}

function Zone({
  position, size, color, label, opacity = 0.18,
}: { position: [number, number, number]; size: [number, number]; color: string; label?: string; opacity?: number }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={size} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <Line
        points={[
          [-size[0] / 2, 0.01, -size[1] / 2], [size[0] / 2, 0.01, -size[1] / 2],
          [size[0] / 2, 0.01, size[1] / 2], [-size[0] / 2, 0.01, size[1] / 2],
          [-size[0] / 2, 0.01, -size[1] / 2],
        ]}
        color={color} lineWidth={1.2} transparent opacity={0.6}
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
    t.current += dt * (0.3 + weight * 0.9);
    if (t.current > 1) t.current = 0;
    if (ref.current) {
      ref.current.position.x = from[0] + (to[0] - from[0]) * t.current;
      ref.current.position.y = from[1] + (to[1] - from[1]) * t.current + 0.3;
      ref.current.position.z = from[2] + (to[2] - from[2]) * t.current;
    }
  });
  const opacity = 0.25 + weight * 0.55;
  return (
    <>
      <Line
        points={[from, [(from[0] + to[0]) / 2, Math.max(from[1], to[1]) + 0.5, (from[2] + to[2]) / 2], to]}
        color={statusColor[status]} lineWidth={1 + weight * 2} transparent opacity={opacity} dashed={false}
      />
      <mesh ref={ref}>
        <sphereGeometry args={[0.07 + weight * 0.05, 12, 12]} />
        <meshBasicMaterial color={statusColor[status]} />
      </mesh>
    </>
  );
}

/* ---------------- SCENE ---------------- */

const POS = {
  users: [-6, 0.3, 0] as [number, number, number],
  alb: [-2.5, 0.3, 0] as [number, number, number],
  ec2_01: [1.5, 0.3, -2] as [number, number, number],   // AZ-A
  ec2_02: [3.5, 0.3, 2] as [number, number, number],    // AZ-B
  ec2_03: [1.5, 0.3, -0.2] as [number, number, number], // AZ-A (offset)
  obs: [5.5, 0.3, -2.5] as [number, number, number],
  runbook: [5.5, 0.3, 2.5] as [number, number, number],
};

function Scene({
  state, selected, setSelected, viewMode,
}: { state: SceneState; selected: string | null; setSelected: (s: string | null) => void; viewMode: ViewMode }) {
  const emphasize = (group: ViewMode[]) => group.includes(viewMode);

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} />
      <directionalLight position={[-5, 8, -5]} intensity={0.3} />

      {/* VPC platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, 0, 0]} onClick={() => setSelected("vpc")}>
        <planeGeometry args={[11, 7]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.06} />
      </mesh>
      <Line
        points={[[-4.5, 0.005, -3.5], [6.5, 0.005, -3.5], [6.5, 0.005, 3.5], [-4.5, 0.005, 3.5], [-4.5, 0.005, -3.5]]}
        color="#0ea5e9" lineWidth={1.5} transparent opacity={0.4}
      />
      <Html position={[-4.4, 0.05, -3.4]} distanceFactor={10}>
        <div className="pointer-events-none text-[10px] uppercase tracking-wider font-semibold text-sky-700/80">VPC · 10.0.0.0/16</div>
      </Html>

      {/* AZ zones */}
      <Zone position={[1.5, 0.01, -2]} size={[8, 3]} color="#6366f1" label="Availability Zone A" opacity={emphasize(["reliability", "architecture"]) ? 0.16 : 0.09} />
      <Zone position={[1.5, 0.01, 2]} size={[8, 3]} color="#a855f7" label="Availability Zone B" opacity={emphasize(["reliability", "architecture"]) ? 0.16 : 0.09} />

      {/* Subnet bands */}
      <Zone position={[-2.5, 0.02, -2]} size={[2, 2.6]} color="#f59e0b" label="Public Subnet" opacity={0.12} />
      <Zone position={[-2.5, 0.02, 2]} size={[2, 2.6]} color="#f59e0b" label="Public Subnet" opacity={0.12} />
      <Zone position={[2.5, 0.02, -2]} size={[5, 2.6]} color="#10b981" label="Private Subnet" opacity={0.12} />
      <Zone position={[2.5, 0.02, 2]} size={[5, 2.6]} color="#10b981" label="Private Subnet" opacity={0.12} />

      {/* ASG boundary */}
      <Line
        points={[[0.3, 0.03, -3.1], [5, 0.03, -3.1], [5, 0.03, 3.1], [0.3, 0.03, 3.1], [0.3, 0.03, -3.1]]}
        color={statusColor[state.asg.status]} lineWidth={1.3} dashed dashSize={0.2} gapSize={0.15} transparent opacity={0.7}
      />
      <Html position={[0.4, 0.05, -3.0]} distanceFactor={10}>
        <div className="pointer-events-none text-[10px] uppercase tracking-wider font-semibold text-slate-600 bg-white/70 px-1.5 rounded">
          Auto Scaling Group
        </div>
      </Html>

      {/* Users */}
      <Node3D position={POS.users} label="Users" status="healthy" color="#f1f5f9"
        onClick={() => setSelected("users")} selected={selected === "users"} icon="👥" />

      {/* ALB */}
      <Node3D position={POS.alb} label="Application Load Balancer" status={state.alb.status}
        color="#fef3c7" onClick={() => setSelected("alb")} selected={selected === "alb"} icon="⚖️" />

      {/* EC2 instances */}
      <Node3D position={POS.ec2_01} label="EC2 App 01" status={state.ec2_01.status}
        color="#dbeafe" onClick={() => setSelected("ec2_01")} selected={selected === "ec2_01"} icon="🖥️" />
      <Node3D position={POS.ec2_02} label="EC2 App 02" status={state.ec2_02.status}
        color="#dbeafe" onClick={() => setSelected("ec2_02")} selected={selected === "ec2_02"} icon="🖥️" />
      <Node3D position={POS.ec2_03} label="EC2 App 03" status={state.ec2_03.status}
        color="#dbeafe" onClick={() => setSelected("ec2_03")} selected={selected === "ec2_03"} icon="🖥️" />

      {/* Observability + Runbooks */}
      <Node3D position={POS.obs} label="Observability" status={state.obs.status}
        color="#ede9fe" scale={0.85} onClick={() => setSelected("obs")} selected={selected === "obs"} icon="📊" />
      <Node3D position={POS.runbook} label="Runbooks" status={state.runbook.status}
        color="#fce7f3" scale={0.85} onClick={() => setSelected("runbook")} selected={selected === "runbook"} icon="📘" />

      {/* Traffic */}
      <TrafficFlow from={POS.users} to={POS.alb} weight={1} status={state.alb.status} />
      <TrafficFlow from={POS.alb} to={POS.ec2_01} weight={state.ec2_01.trafficWeight ?? 0.33} status={state.ec2_01.status} />
      <TrafficFlow from={POS.alb} to={POS.ec2_02} weight={state.ec2_02.trafficWeight ?? 0.33} status={state.ec2_02.status} />
      <TrafficFlow from={POS.alb} to={POS.ec2_03} weight={state.ec2_03.trafficWeight ?? 0.33} status={state.ec2_03.status} />

      {/* Dependency lines */}
      <Line points={[POS.ec2_02, POS.obs]} color="#a78bfa" lineWidth={1} dashed dashSize={0.15} gapSize={0.1} transparent opacity={0.5} />
      <Line points={[POS.ec2_01, POS.runbook]} color="#f472b6" lineWidth={1} dashed dashSize={0.15} gapSize={0.1} transparent opacity={0.5} />
    </>
  );
}

/* ---------------- DETAIL CONTENT ---------------- */

function detailFor(id: string, state: SceneState) {
  const common = (name: string, type: string, owner: string, status: Status) => ({ name, type, owner, status });
  switch (id) {
    case "alb": return {
      ...common("Application Load Balancer", "Elastic Load Balancing · ALB", "Platform SRE", state.alb.status),
      metrics: [
        ["Request rate", "12,400 rpm"], ["P50 latency", "94 ms"], ["P95 latency", "183 ms"],
        ["P99 latency", "392 ms"], ["4xx rate", "1.2%"], ["5xx rate", "0.18%"],
        ["Healthy targets", "3 of 3"], ["Listener status", "Active :443"],
        ["Certificate expiration", "64 days"], ["WAF status", "Enabled"],
        ["Security group", "sg-alb-prod"], ["Last change", "Listener rule, 2d ago"],
      ],
      alerts: ["P95 latency warning (resolved)", "Target group health variance"],
      risks: ["Single listener rule update may bypass WAF on /admin"],
      actions: ["Validate listener rule order", "Renew cert in 60 days", "Enable connection draining"],
      runbook: { name: "ALB 5xx Triage", step: 2, total: 6, percent: 33, owner: "SRE on-call", eta: "11 min" },
    };
    case "ec2_01": return {
      ...common("EC2 App 01", "EC2 t3.large · us-east-1a", "App Platform", state.ec2_01.status),
      metrics: [
        ["Instance ID", "i-0a12bc34"], ["CPU", "42%"], ["Memory", "61%"], ["Disk", "54%"],
        ["Network", "182 Mbps"], ["Uptime", "27 d"], ["Patch", "Current"],
        ["Agent", "Healthy"], ["CloudWatch", "Healthy"], ["AMI", "ami-2026-04"],
        ["Monthly cost", "$168"], ["Rightsizing", "No action"],
      ],
      alerts: [], risks: [],
      actions: ["Keep in service", "Validate after next AMI bake"],
      runbook: { name: "Standard health probe", step: 6, total: 6, percent: 100, owner: "Auto", eta: "—" },
    };
    case "ec2_02": return {
      ...common("EC2 App 02", "EC2 t3.large · us-east-1b", "App Platform", state.ec2_02.status),
      metrics: [
        ["Instance ID", "i-0b22cd45"], ["CPU", "71%"], ["Memory", "77%"], ["Disk", "68%"],
        ["Network", "224 Mbps"], ["Uptime", "31 d"], ["Patch", "1 pending"],
        ["Agent", "Healthy"], ["CloudWatch", "Warning"], ["AMI", "ami-2026-03"],
        ["Monthly cost", "$168"], ["Rightsizing", "Monitor"],
      ],
      alerts: ["CPU sustained > 70%", "Memory > 75%"],
      risks: ["Saturation risk under burst load", "Patch backlog: 1 critical"],
      actions: ["Drain target", "Restart application service", "Reintroduce gradually", "Apply pending patch"],
      runbook: {
        name: "Drain, Diagnose, Restart, Validate", step: 3, total: 8, percent: 38, owner: "SRE on-call", eta: "14 min",
        steps: [
          "Confirm CloudWatch alarm", "Compare instance telemetry to peer nodes",
          "Drain EC2 App 02 from target group", "Restart application service",
          "Validate health checks", "Reintroduce target gradually",
          "Monitor SLO burn for 15 minutes", "Close incident with summary",
        ],
      },
    };
    case "ec2_03": return {
      ...common("EC2 App 03", "EC2 t3.large · us-east-1a", "App Platform", state.ec2_03.status),
      metrics: [
        ["Instance ID", "i-0c33de56"], ["CPU", "28%"], ["Memory", "44%"], ["Disk", "49%"],
        ["Network", "98 Mbps"], ["Uptime", "29 d"], ["Patch", "Current"],
        ["Agent", "Healthy"], ["CloudWatch", "Healthy"], ["AMI", "ami-2026-04"],
        ["Monthly cost", "$168"], ["Rightsizing", "Scale-in candidate"],
      ],
      alerts: [], risks: ["Sustained low utilization"],
      actions: ["Evaluate scheduled scale-in policy", "Estimate $640/qtr savings"],
      runbook: { name: "Rightsizing review", step: 1, total: 4, percent: 25, owner: "FinOps", eta: "Next window" },
    };
    case "vpc": return {
      ...common("VPC", "Virtual Private Cloud", "Cloud Platform", state.vpc.status),
      metrics: [
        ["CIDR", "10.0.0.0/16"], ["Public subnets", "2"], ["Private subnets", "2"],
        ["Route tables", "Healthy"], ["NAT gateways", "2 (HA)"], ["Internet gateway", "Attached"],
        ["Network ACLs", "Default"], ["Security groups", "12 active"],
        ["Flow logs", "Enabled · S3"], ["Monthly net cost", "$612"],
      ],
      alerts: [], risks: ["Open ingress on sg-debug-temp"],
      actions: ["Close sg-debug-temp", "Validate NACL deny rules"],
      runbook: { name: "VPC posture audit", step: 2, total: 5, percent: 40, owner: "CloudSec", eta: "Today" },
    };
    case "asg": return {
      ...common("Auto Scaling Group", "EC2 ASG", "Platform SRE", state.asg.status),
      metrics: [
        ["Desired capacity", "3"], ["Min", "2"], ["Max", "6"],
        ["Healthy instances", "3"], ["Scaling policy", "Target tracking CPU 60%"],
        ["Recent events", "Last scale: 4d ago"], ["Launch template", "v14"],
        ["Drift status", "No drift"], ["Capacity risk", "Low"],
      ],
      alerts: [], risks: ["AZ imbalance during partial failure"],
      actions: ["Enable AZ rebalance", "Lower target tracking to 55%"],
      runbook: { name: "Capacity tune", step: 1, total: 3, percent: 33, owner: "SRE", eta: "Tomorrow" },
    };
    case "obs": return {
      ...common("Observability", "CloudWatch · X-Ray", "Observability Guild", state.obs.status),
      metrics: [["Metric streams", "4"], ["Log groups", "27"], ["Alarms", "18 active"], ["Traces / min", "9,200"]],
      alerts: ["Latency alarm on ALB"], risks: [],
      actions: ["Tune noisy alarms", "Add SLO burn alert"],
      runbook: { name: "Alarm hygiene", step: 0, total: 4, percent: 0, owner: "Obs Guild", eta: "Next sprint" },
    };
    case "runbook": return {
      ...common("Runbooks", "SRE Automation", "SRE", state.runbook.status),
      metrics: [["Active runbooks", "12"], ["Automatable", "8"], ["Last execution", "9:12"], ["Avg MTTR", "18 min"]],
      alerts: [], risks: [],
      actions: ["Promote drain workflow to digital coworker"],
      runbook: { name: "Drain, Diagnose, Restart, Validate", step: 3, total: 8, percent: 38, owner: "SRE on-call", eta: "14 min" },
    };
    default: return {
      ...common("Users", "External traffic", "—", "healthy" as Status),
      metrics: [["Origin", "Global"], ["Sessions / min", "8,400"]],
      alerts: [], risks: [], actions: [],
      runbook: { name: "—", step: 0, total: 0, percent: 0, owner: "—", eta: "—" },
    };
  }
}

/* ---------------- UI HELPERS ---------------- */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] ${className}`}>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${statusBg[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[status] }} />
      {status[0].toUpperCase() + status.slice(1)}
    </span>
  );
}

function MetricTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="px-3 py-2 rounded-lg bg-white border border-slate-200">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{label}</div>
      <div className="text-sm font-semibold text-slate-900 mt-0.5">{value}</div>
      {hint && <div className="text-[10px] text-slate-500 mt-0.5">{hint}</div>}
    </div>
  );
}

/* ---------------- PAGE ---------------- */

export default function AWSResilienceArchitectureTwin() {
  const [scenario, setScenario] = useState<ScenarioId>("normal");
  const [viewMode, setViewMode] = useState<ViewMode>("architecture");
  const [selected, setSelected] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [activeSim, setActiveSim] = useState<string | null>(null);
  const [activeCoworker, setActiveCoworker] = useState<Coworker | null>(null);
  const [transformVal, setTransformVal] = useState(50);
  const [timelineMode, setTimelineMode] = useState<"incident" | "remediation" | "transformation" | "value">("incident");

  const injectSimulation = (s: Simulation) => {
    setActiveSim(s.id);
    setScenario(s.scenarioMap as ScenarioId);
  };
  const recover = () => { setScenario("normal"); };
  const resetEnv = () => { setActiveSim(null); setScenario("normal"); setSelected(null); setResetKey(k => k + 1); };

  const { state, headerOverrides } = scenarioStates[scenario];
  const header = { ...baseHeader, ...(headerOverrides ?? {}) };

  const headerMetricList = [
    { label: "Service Health", value: header.health },
    { label: "SLO Attainment", value: header.slo },
    { label: "Error Budget", value: header.budget },
    { label: "Incident Status", value: header.incident },
    { label: "P95 Latency", value: header.p95 },
    { label: "5xx Error Rate", value: header.err5xx },
    { label: "Monthly Cost", value: header.cost },
    { label: "AZ Resilience", value: header.azScore },
  ];

  const detail = selected ? detailFor(selected, state) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/40 text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-30">
        <div className="px-6 py-4 flex items-start justify-between gap-6 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
              <Cloud className="w-3.5 h-3.5" /> AWS · Production · us-east-1
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mt-1">SRE Digital Twin Operating System</h1>
            <p className="text-sm text-slate-600 mt-0.5 max-w-3xl">
              Interactive resilience, dependency, digital workforce, transformation, and value realization model for a production AWS service.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full lg:w-auto">
            {headerMetricList.map((m) => (
              <div key={m.label} className="px-3 py-2 rounded-lg bg-white border border-slate-200 min-w-[140px]">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{m.label}</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-5">
        {/* LEFT RAIL */}
        <aside className="space-y-4">
          <GlassCard className="p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-2 pb-2">View Mode</div>
            <nav className="space-y-0.5">
              {viewModes.map((v) => (
                <button key={v.id} onClick={() => setViewMode(v.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition ${
                    viewMode === v.id ? "bg-sky-50 text-sky-700 font-medium" : "text-slate-700 hover:bg-slate-50"
                  }`}>
                  <v.icon className="w-4 h-4" /> {v.label}
                </button>
              ))}
            </nav>
          </GlassCard>

          <GlassCard className="p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-2 pb-2">SLO & Error Budget</div>
            <div className="px-2 space-y-2">
              <div className="flex justify-between text-xs"><span className="text-slate-600">Target</span><span className="font-medium">99.9%</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-600">Current</span><span className="font-medium text-emerald-600">{header.slo}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-600">Budget</span><span className="font-medium">{header.budget}</span></div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: header.budget }} />
              </div>
              <div className="flex justify-between text-xs"><span className="text-slate-600">Burn rate</span><span className="font-medium">0.7×</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-600">Customer impact</span><span className="font-medium">Low</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-600">Exhaustion</span><span className="font-medium">19 d</span></div>
            </div>
          </GlassCard>
        </aside>

        {/* MAIN */}
        <main className="space-y-4 min-w-0">
          {/* Executive Summary cards */}
          <ExecutiveCards />

          {/* Scenario controller */}
          <GlassCard className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Scenario</div>
              <div className="flex flex-wrap gap-1.5">
                {scenarios.map((s) => (
                  <button key={s.id} onClick={() => { setScenario(s.id); setSelected(null); }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${
                      scenario === s.id ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-700 border-slate-200 hover:border-sky-300"
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* 3D scene */}
          <GlassCard className="relative overflow-hidden h-[460px]">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold bg-white/80 px-2 py-1 rounded border border-slate-200">
                {viewModes.find((v) => v.id === viewMode)?.label} View
              </span>
            </div>
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <button onClick={() => { setResetKey((k) => k + 1); setSelected(null); }}
                className="flex items-center gap-1 text-xs bg-white/90 border border-slate-200 rounded-md px-2.5 py-1 hover:bg-white shadow-sm">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
            <Canvas key={resetKey} camera={{ position: [4, 7, 10], fov: 45 }} dpr={[1, 1.6]}>
              <Suspense fallback={null}>
                <Scene state={state} selected={selected} setSelected={setSelected} viewMode={viewMode} />
                <OrbitControls enablePan enableRotate enableZoom maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={20} />
              </Suspense>
            </Canvas>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 flex gap-2 text-[10px] z-10">
              {(["healthy", "warning", "degraded", "critical", "remediating"] as Status[]).map((s) => (
                <div key={s} className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded border border-slate-200">
                  <span className="w-2 h-2 rounded-full" style={{ background: statusColor[s] }} />
                  <span className="text-slate-700 capitalize">{s}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* New operating-mode sections */}
          {(viewMode === "lab" || viewMode === "architecture" || viewMode === "incident" || viewMode === "remediation") && (
            <ResilienceLabController active={activeSim} onInject={injectSimulation} onRecover={recover} onReset={resetEnv} />
          )}
          {(viewMode === "dependency" || viewMode === "architecture") && (
            <DependencyMapPanel selectedComponent={selected} onSelectComponent={setSelected} />
          )}
          {(viewMode === "workforce" || viewMode === "incident" || viewMode === "lab") && (
            <DigitalWorkforcePanel activeId={activeCoworker?.id ?? null} onSelect={setActiveCoworker} />
          )}
          {(viewMode === "transformation" || viewMode === "executive") && (
            <TransformationSlider value={transformVal} onChange={setTransformVal} />
          )}
          {(viewMode === "executive" || viewMode === "architecture") && (
            <ExecutiveValueRealization />
          )}

          {/* Timeline with mode tabs */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
                <Clock className="w-3 h-3" /> Operating Timeline
              </div>
              <div className="flex gap-1">
                {(["incident", "remediation", "transformation", "value"] as const).map((m) => (
                  <button key={m} onClick={() => setTimelineMode(m)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${
                      timelineMode === m ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-slate-200"
                    }`}>{m}</button>
                ))}
              </div>
            </div>
            <OperatingTimeline mode={timelineMode} onSelect={(t) => setSelected(t)} />
          </GlassCard>

          {/* Workshop output + Engagement Readout */}
          <WorkshopOutputPanel />
          <EngagementReadout />
        </main>
      </div>

      {/* Active coworker detail */}
      <AnimatePresence>
        {activeCoworker && (
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[640px] max-w-[92vw] bg-white border border-slate-200 rounded-xl shadow-xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500">{activeCoworker.role}</div>
                <div className="text-sm font-semibold text-slate-900">{activeCoworker.name}</div>
              </div>
              <button onClick={() => setActiveCoworker(null)} className="p-1 rounded hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px]">
              {[
                ["Status", activeCoworker.status], ["Confidence", `${activeCoworker.confidence}%`],
                ["Current activity", activeCoworker.activity], ["Last action", activeCoworker.lastAction],
                ["Next action", activeCoworker.nextAction], ["Human owner", activeCoworker.owner],
                ["Approval", activeCoworker.approval], ["Related runbook", activeCoworker.runbook],
                ["Evidence", activeCoworker.evidence],
              ].map(([k, v]) => (
                <div key={k} className="px-2 py-1.5 rounded bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-500">{k}</div>
                  <div className="text-[11px] text-slate-800">{v}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DRAWER */}
      <AnimatePresence>
        {selected && detail && (
          <motion.div
            initial={{ x: 480, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 480, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed top-0 right-0 h-full w-[460px] z-50 bg-white border-l border-slate-200 shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{detail.type}</div>
                <h2 className="text-lg font-semibold text-slate-900 mt-0.5">{detail.name}</h2>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={detail.status} />
                  <span className="text-[11px] text-slate-500">Owner · {detail.owner}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-md hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-5 space-y-5">
              <section>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Key Metrics</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {detail.metrics.map(([k, v]) => (
                    <div key={k} className="px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-500">{k}</div>
                      <div className="text-[12px] font-medium text-slate-900">{v}</div>
                    </div>
                  ))}
                </div>
              </section>

              {detail.alerts.length > 0 && (
                <section>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Recent Alerts</div>
                  <ul className="space-y-1.5">
                    {detail.alerts.map((a, i) => (
                      <li key={i} className="text-[12px] flex items-start gap-2 text-slate-700">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />{a}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {detail.risks.length > 0 && (
                <section>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Risks</div>
                  <ul className="space-y-1.5">
                    {detail.risks.map((r, i) => (
                      <li key={i} className="text-[12px] flex items-start gap-2 text-slate-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />{r}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {detail.actions.length > 0 && (
                <section>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Recommended Actions</div>
                  <ul className="space-y-1.5">
                    {detail.actions.map((a, i) => (
                      <li key={i} className="text-[12px] flex items-start gap-2 text-slate-700">
                        <ChevronRight className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />{a}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="rounded-lg border border-slate-200 bg-gradient-to-br from-sky-50/60 to-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Runbook Progress</div>
                  <span className="text-[10px] text-slate-500">ETA · {detail.runbook.eta}</span>
                </div>
                <div className="text-sm font-medium text-slate-900">{detail.runbook.name}</div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${detail.runbook.percent}%` }}
                    className="h-full bg-sky-500" transition={{ duration: 0.6 }} />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-600">
                  <span>Step {detail.runbook.step} of {detail.runbook.total}</span>
                  <span>{detail.runbook.percent}%</span>
                </div>
                {"steps" in detail.runbook && (detail.runbook as any).steps && (
                  <ol className="mt-3 space-y-1.5">
                    {(detail.runbook as any).steps.map((s: string, i: number) => {
                      const done = i < detail.runbook.step;
                      const active = i === detail.runbook.step;
                      return (
                        <li key={i} className="flex items-start gap-2 text-[12px]">
                          {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /> :
                            active ? <span className="w-3.5 h-3.5 rounded-full border-2 border-sky-500 mt-0.5 animate-pulse" /> :
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mt-0.5" />}
                          <span className={done ? "text-slate-500 line-through" : active ? "text-slate-900 font-medium" : "text-slate-600"}>{s}</span>
                        </li>
                      );
                    })}
                  </ol>
                )}
                <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="px-2 py-1 rounded bg-white border border-slate-200"><span className="text-slate-500">Owner · </span>{detail.runbook.owner}</div>
                  <div className="px-2 py-1 rounded bg-white border border-slate-200"><span className="text-slate-500">Auto-eligible · </span>Yes</div>
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Sub UI sections ---------------- */

function ExecutiveCards() {
  const cards = [
    { title: "Reliability", icon: Activity, baseline: "99.5%", target: "99.9%", current: "99.93%", trend: "Improving", trendIcon: TrendingUp, action: "Automate recovery runbook", tone: "emerald" },
    { title: "Performance", icon: Zap, baseline: "280 ms P95", target: "<200 ms P95", current: "183 ms P95", trend: "Stable", trendIcon: Minus, action: "Monitor EC2 02 saturation", tone: "sky" },
    { title: "Security", icon: Shield, baseline: "Patch drift present", target: "Zero critical drift", current: "1 patch pending", trend: "Watch", trendIcon: TrendingDown, action: "Schedule patch window", tone: "amber" },
    { title: "Cost", icon: DollarSign, baseline: "$8,300 / mo", target: "$7,200 / mo", current: "$7,840 / mo", trend: "Improving", trendIcon: TrendingUp, action: "Review scale-in policy", tone: "violet" },
  ];
  const toneMap: Record<string, string> = {
    emerald: "from-emerald-50 text-emerald-700",
    sky: "from-sky-50 text-sky-700",
    amber: "from-amber-50 text-amber-700",
    violet: "from-violet-50 text-violet-700",
  };
  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((c) => (
        <GlassCard key={c.title} className={`p-3.5 bg-gradient-to-br ${toneMap[c.tone].split(" ")[0]} to-white`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold ${toneMap[c.tone].split(" ").slice(1).join(" ")}`}>
              <c.icon className="w-3.5 h-3.5" /> {c.title}
            </div>
            <c.trendIcon className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-900">{c.current}</div>
          <div className="mt-1 grid grid-cols-2 gap-x-2 text-[10px] text-slate-500">
            <div>Baseline · <span className="text-slate-700">{c.baseline}</span></div>
            <div>Target · <span className="text-slate-700">{c.target}</span></div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/70 text-[11px] text-slate-700">
            <span className="text-slate-500">Action · </span>{c.action}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function EngagementReadout() {
  const items = [
    ["Current reliability posture", "Stable three node application tier with moderate resilience, but limited automated remediation."],
    ["Primary operational risk", "Availability Zone imbalance and manual runbook execution could increase MTTR during a partial failure."],
    ["Highest value remediation", "Automate target draining, instance restart validation, and SLO burn monitoring."],
    ["Automation opportunity", "Convert EC2 degradation response into an approved SRE digital coworker workflow."],
    ["Cost optimization", "Review EC2 App 03 utilization and evaluate scheduled scale-in policy."],
    ["Security concern", "Patch compliance and security group exposure should be validated before production hardening."],
    ["Recommended next action", "Run a failure simulation and validate ALB target recovery workflow."],
  ];
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">SRE Engagement Readout</div>
        <span className="text-[10px] text-slate-500">Synthesized from live telemetry</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(([k, v]) => (
          <div key={k} className="p-3 rounded-lg bg-slate-50/60 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-700">{k}</div>
            <div className="text-[12px] text-slate-600 mt-1 leading-snug">{v}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
