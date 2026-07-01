import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Building2, LayoutGrid, Server, Share2, AlertTriangle, AlertOctagon, HelpCircle,
  Clock, Eye, BarChart3, ShieldCheck, Rocket, RefreshCw,
  Network as NetIcon, Cpu, HardDrive, Database, Box, Users, Globe,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
  CartesianGrid,
} from "recharts";

const kpis: KPI[] = [
  { label: "Total Data Centers", value: "12", sub: "3 Regions", subColor: "text-slate-500", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Applications Mapped", value: "482", sub: "100% Discovered", subColor: "text-emerald-600", icon: LayoutGrid, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Infrastructure Components", value: "6,842", sub: "Across All Layers", subColor: "text-blue-600", icon: Server, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Total Dependencies", value: "24,713", sub: "Active Relationships", subColor: "text-blue-600", icon: Share2, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Critical Dependencies", value: "312", sub: "At Risk", subColor: "text-red-600", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { label: "High Risk Dependencies", value: "821", sub: "Require Attention", subColor: "text-amber-600", icon: AlertOctagon, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Orphaned Components", value: "76", sub: "Unmapped", subColor: "text-violet-600", icon: HelpCircle, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Last Updated", value: "May 12, 2026", sub: "09:45 AM", subColor: "text-slate-500", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
];

const wwh = {
  what: [
    "End-to-end topology of data centers, platforms, and services",
    "Dependencies between infrastructure, applications, and data",
    "Health and risk of dependencies impacting separation",
    "Impact analysis for changes, migrations, and cutover events",
  ],
  why: [
    "Hidden dependencies are the #1 cause of separation failure",
    "Complete visibility reduces risk and prevents outages",
    "Enables informed decisions for migrations and changes",
    "Ensures Day 1 independence with confidence",
  ],
  how: [
    "Auto-discovery and continuous mapping of infrastructure",
    "Dependency modeling across compute, storage, network, identity, and apps",
    "Impact analysis engine for changes and migrations",
    "Drill-down from environment → workload → dependency chain",
  ],
};

const outcomes: Outcome[] = [
  { icon: Eye, color: "text-blue-600", title: "COMPLETE VISIBILITY", l1: "See every component and relationship across your stack" },
  { icon: BarChart3, color: "text-blue-600", title: "UNDERSTAND IMPACT", l1: "Know what is affected before you make a change" },
  { icon: ShieldCheck, color: "text-blue-600", title: "REDUCE RISK", l1: "Identify and resolve critical dependencies early" },
  { icon: Rocket, color: "text-blue-600", title: "ACCELERATE SEPARATION", l1: "Confidently migrate and cut over with full dependency insight" },
  { icon: RefreshCw, color: "text-blue-600", title: "CONTINUOUSLY UPDATED", l1: "Topology maps update automatically as environments change" },
];

const riskSummary = [
  { name: "Critical", value: 312, pct: "1.3%", color: "#ef4444" },
  { name: "High", value: 821, pct: "3.3%", color: "#f97316" },
  { name: "Medium", value: 3214, pct: "13.0%", color: "#eab308" },
  { name: "Low", value: 20366, pct: "82.4%", color: "#22c55e" },
];

const depsByType = [
  { t: "Application → Database", v: 8621 },
  { t: "Application → Infrastructure", v: 6842 },
  { t: "Infrastructure → Infrastructure", v: 5931 },
  { t: "Application → Platform Service", v: 2874 },
  { t: "Platform → Infrastructure", v: 2445 },
];

const topLayers = [
  { l: "Compute", c: "1,956", d: "7,842" },
  { l: "Storage", c: "1,124", d: "6,531" },
  { l: "Network", c: "1,342", d: "4,891" },
  { l: "Platform Services", c: "1,021", d: "3,812" },
  { l: "Identity", c: "489", d: "1,637" },
];

const envs = [
  { e: "PROD", t: "Production", dc: "US-East", st: "Healthy", c: "1,842", d: "7,621", risk: "Low", color: "emerald" },
  { e: "DR", t: "DR", dc: "EU-West", st: "Healthy", c: "1,238", d: "4,892", risk: "Low", color: "emerald" },
  { e: "SECONDARY", t: "Non-Prod", dc: "AP-South", st: "At Risk", c: "1,125", d: "3,912", risk: "High", color: "amber" },
  { e: "DEV", t: "Non-Prod", dc: "US-East", st: "Healthy", c: "893", d: "2,874", risk: "Medium", color: "emerald" },
  { e: "TEST", t: "Non-Prod", dc: "EU-West", st: "At Risk", c: "744", d: "2,214", risk: "Medium", color: "amber" },
];

const impactedApps = [
  { app: "CRM", t: "Business App", users: "1,250", lvl: "High", crit: "Critical" },
  { app: "ERP", t: "Business App", users: "980", lvl: "High", crit: "Critical" },
  { app: "LIMS", t: "Business App", users: "640", lvl: "Medium", crit: "High" },
  { app: "HR Portal", t: "Business App", users: "320", lvl: "Medium", crit: "Medium" },
  { app: "Finance App", t: "Business App", users: "280", lvl: "Low", crit: "Medium" },
];

const changes = [
  { ch: "New dependency discovered", t: "Dependency", c: "CRM → SQL DB", dc: "US-East", time: "May 12, 09:15 AM" },
  { ch: "Component added", t: "Compute", c: "App Server 15", dc: "EU-West", time: "May 11, 04:32 PM" },
  { ch: "Link removed", t: "Network", c: "Old WAN Link", dc: "US-East", time: "May 11, 11:08 AM" },
  { ch: "Service moved", t: "Platform", c: "Backup Service", dc: "AP-South", time: "May 10, 02:45 PM" },
  { ch: "DB replication updated", t: "Storage", c: "SQL DB Replication", dc: "EU-West", time: "May 09, 10:21 AM" },
];

function Pill({ v, kind = "status" }: { v: string; kind?: "status" | "level" | "crit" | "risk" }) {
  const t = v.toLowerCase();
  let cls = "text-slate-700";
  if (kind === "status") {
    cls = /healthy|on track/.test(t) ? "text-emerald-700"
      : /at risk/.test(t) ? "text-amber-700"
      : /blocked|critical|failed/.test(t) ? "text-red-700" : "text-slate-700";
  } else if (kind === "level" || kind === "crit" || kind === "risk") {
    cls = /(high|critical)/.test(t) ? "text-red-600"
      : /(medium)/.test(t) ? "text-amber-600"
      : /(low)/.test(t) ? "text-emerald-600" : "text-slate-700";
  }
  return <span className={`font-semibold ${cls}`}>{v}</span>;
}

/* Topology canvas — 3 regions × layered nodes (SVG) */
function GlobalTopology() {
  const layers = [
    { name: "Network", icon: NetIcon },
    { name: "Compute", icon: Cpu },
    { name: "Storage", icon: HardDrive },
    { name: "Platform", icon: Box },
    { name: "Identity", icon: Users },
    { name: "External", icon: Globe },
  ];
  const regions = [
    { name: "North America", sub: "US-East (Primary)", bg: "#eff6ff", border: "#bfdbfe" },
    { name: "Europe", sub: "EU-West (DR)", bg: "#ecfdf5", border: "#a7f3d0" },
    { name: "Asia Pacific", sub: "AP-South (Secondary)", bg: "#f5f3ff", border: "#ddd6fe" },
  ];
  const compute = [
    ["Compute Cluster A", "Compute Cluster B"],
    ["Compute Cluster C", "Compute Cluster D"],
    ["Compute Cluster C", "Compute Cluster P"],
  ];

  // Geometry
  const W = 900, H = 560;
  const colX = [180, 420, 660]; // region centers
  const colW = 220;
  const rowY = { region: 30, network: 100, compute: 175, storage: 250, platform: 325, identity: 395, external: 465 };
  const boxW = 95, boxH = 28;

  // Helpers for box coordinates
  const cn = (cx: number, cy: number, w = 110, h = 32) => ({ x: cx - w / 2, y: cy - h / 2, w, h });
  const arrow = (x1: number, y1: number, x2: number, y2: number, dashed = false, color = "#94a3b8") =>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1" markerEnd="url(#arrowhead)" strokeDasharray={dashed ? "3 3" : undefined} />;

  return (
    <div className="space-y-2">
      {/* header controls */}
      <div className="flex items-center gap-3 text-[11px]">
        <span className="text-slate-500">View:</span>
        <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-semibold">Logical</span>
        <span className="px-2 py-0.5 rounded text-slate-500">Physical</span>
        <span className="text-slate-500 ml-4">Group by:</span>
        <span className="px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-700">Data Center ▾</span>
      </div>

      <div className="w-full">
        <svg viewBox={`0 0 ${W + 110} ${H}`} className="w-full h-[480px]">
            <defs>
              <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
              </marker>
            </defs>

            {/* Left rail labels (in SVG so alignment is exact) */}
            {(() => {
              const tops = [rowY.network, rowY.compute, rowY.storage, rowY.platform, rowY.identity, rowY.external];
              return layers.map((L, i) => (
                <g key={L.name} transform={`translate(0, ${tops[i]})`}>
                  <rect x="20" y="-10" width="20" height="20" rx="4" fill="#eff6ff" stroke="#bfdbfe" />
                  <text x="50" y="4" fontSize="11" fontWeight="600" fill="#334155">{L.name}</text>
                </g>
              ));
            })()}
            <g transform="translate(110, 0)">
            {/* Region cards */}
            {regions.map((r, i) => (
              <g key={r.name}>
                <rect x={colX[i] - colW / 2} y={rowY.region - 22} width={colW} height={50} rx="8" fill={r.bg} stroke={r.border} />
                <text x={colX[i]} y={rowY.region - 2} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a">{r.name}</text>
                <text x={colX[i]} y={rowY.region + 14} textAnchor="middle" fontSize="9" fill="#64748b">{r.sub}</text>
              </g>
            ))}

            {/* Per-region nodes */}
            {regions.map((_, i) => {
              const cx = colX[i];
              return (
                <g key={i}>
                  {/* Core Network */}
                  <NodeBox cx={cx} cy={rowY.network} label="Core Network" fill="#eff6ff" stroke="#93c5fd" textColor="#1e3a8a" />
                  {/* Compute clusters */}
                  <NodeBox cx={cx - 55} cy={rowY.compute} label={compute[i][0]} w={boxW} h={boxH} fill="#ecfdf5" stroke="#86efac" textColor="#064e3b" />
                  <NodeBox cx={cx + 55} cy={rowY.compute} label={compute[i][1]} w={boxW} h={boxH} fill="#ecfdf5" stroke="#86efac" textColor="#064e3b" />
                  {/* Storage */}
                  <NodeBox cx={cx - 55} cy={rowY.storage} label="Storage Array" w={boxW} h={boxH} fill="#f5f3ff" stroke="#c4b5fd" textColor="#4c1d95" icon="db" />
                  <NodeBox cx={cx + 55} cy={rowY.storage} label="Storage Array" w={boxW} h={boxH} fill="#f5f3ff" stroke="#c4b5fd" textColor="#4c1d95" icon="db" />
                  {/* Platform spans both */}
                  <NodeBox cx={cx} cy={rowY.platform} label="VMware vSphere" w={200} h={boxH} fill="#fff7ed" stroke="#fdba74" textColor="#7c2d12" />
                  {/* Identity */}
                  <NodeBox cx={cx} cy={rowY.identity} label="AD / Windows" w={170} h={boxH} fill="#eff6ff" stroke="#93c5fd" textColor="#1e3a8a" />
                  {/* External */}
                  <NodeBox cx={cx} cy={rowY.external} label="Internet / WAN" w={170} h={boxH} fill="#f8fafc" stroke="#cbd5e1" textColor="#334155" />

                  {/* Vertical connections */}
                  {arrow(cx, rowY.network + 16, cx - 55, rowY.compute - 14)}
                  {arrow(cx, rowY.network + 16, cx + 55, rowY.compute - 14)}
                  {arrow(cx - 55, rowY.compute + 14, cx - 55, rowY.storage - 14)}
                  {arrow(cx + 55, rowY.compute + 14, cx + 55, rowY.storage - 14)}
                  {arrow(cx - 55, rowY.storage + 14, cx - 30, rowY.platform - 14)}
                  {arrow(cx + 55, rowY.storage + 14, cx + 30, rowY.platform - 14)}
                  {arrow(cx, rowY.platform + 14, cx, rowY.identity - 14)}
                  {arrow(cx, rowY.identity + 14, cx, rowY.external - 14)}
                </g>
              );
            })}

            {/* Cross-region replication links */}
            <g stroke="#a78bfa" strokeWidth="1.2" strokeDasharray="4 3" fill="none" markerEnd="url(#arrowhead)">
              <line x1={colX[0] + 55} y1={rowY.network} x2={colX[1] - 55} y2={rowY.network} />
              <line x1={colX[1] + 55} y1={rowY.network} x2={colX[2] - 55} y2={rowY.network} />
              <line x1={colX[0] + 55} y1={rowY.storage} x2={colX[1] - 55} y2={rowY.storage} />
              <line x1={colX[1] + 55} y1={rowY.storage} x2={colX[2] - 55} y2={rowY.storage} />
              <line x1={colX[0] + 100} y1={rowY.platform} x2={colX[1] - 100} y2={rowY.platform} />
              <line x1={colX[1] + 100} y1={rowY.platform} x2={colX[2] - 100} y2={rowY.platform} />
              <line x1={colX[0] + 85} y1={rowY.identity} x2={colX[1] - 85} y2={rowY.identity} />
              <line x1={colX[1] + 85} y1={rowY.identity} x2={colX[2] - 85} y2={rowY.identity} />
            </g>
            <text x={(colX[0] + colX[1]) / 2} y={rowY.network - 22} textAnchor="middle" fontSize="10" fontWeight="600" fill="#7c3aed">Data Replication</text>
            </g>
          </svg>
      </div>
    </div>
  );
}

function NodeBox({
  cx, cy, w = 110, h = 32, label, fill, stroke, textColor, icon,
}: { cx: number; cy: number; w?: number; h?: number; label: string; fill: string; stroke: string; textColor: string; icon?: string }) {
  const x = cx - w / 2, y = cy - h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <circle cx={x + 12} cy={cy} r="5" fill={stroke} opacity="0.5" />
      <text x={x + w / 2 + 6} y={cy + 3.5} textAnchor="middle" fontSize="10" fontWeight="600" fill={textColor}>{label}</text>
    </g>
  );
}

function AppDependencyGraph() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex-1">
        <svg viewBox="0 0 460 360" className="w-full h-[420px]">
          {/* solid (direct) edges */}
          <g stroke="#64748b" strokeWidth="1.1" fill="none">
            <path d="M230,32 L150,70" />
            <path d="M230,32 L310,70" />
            <path d="M150,95 L150,130" />
            <path d="M310,95 L310,130" />
            <path d="M150,95 L310,130" />
            <path d="M310,95 L150,130" />
            <path d="M150,155 L75,195" />
            <path d="M150,155 L230,195" />
            <path d="M310,155 L230,195" />
            <path d="M310,155 L385,195" />
          </g>
          {/* dashed (indirect) edges */}
          <g stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" fill="none">
            <path d="M150,155 L385,195" />
            <path d="M310,155 L75,195" />
            <path d="M75,220 L75,265" />
            <path d="M75,220 L230,265" />
            <path d="M230,220 L230,265" />
            <path d="M230,220 L385,265" />
            <path d="M385,220 L385,265" />
            <path d="M385,220 L230,265" />
          </g>
          {/* nodes */}
          <Node x={185} y={18} w={90} h={24} label="CRM Application" fill="#dbeafe" stroke="#60a5fa" />
          <Node x={105} y={70} w={90} h={25} label="App Server Tier" fill="#dcfce7" stroke="#4ade80" />
          <Node x={265} y={70} w={90} h={25} label="App Server Tier" fill="#dcfce7" stroke="#4ade80" />
          <Node x={105} y={130} w={90} h={25} label="SQL Database" fill="#ede9fe" stroke="#a78bfa" />
          <Node x={265} y={130} w={90} h={25} label="Fileshare Service" fill="#ede9fe" stroke="#a78bfa" />
          <Node x={30} y={195} w={90} h={25} label="VM Cluster" fill="#ffedd5" stroke="#fb923c" />
          <Node x={185} y={195} w={90} h={25} label="Storage Array" fill="#ffedd5" stroke="#fb923c" />
          <Node x={340} y={195} w={90} h={25} label="Backup Service" fill="#ffedd5" stroke="#fb923c" />
          <Node x={30} y={265} w={90} h={25} label="Network Segment" fill="#e0f2fe" stroke="#38bdf8" />
          <Node x={185} y={265} w={90} h={25} label="Load Balancer" fill="#e0f2fe" stroke="#38bdf8" />
          <Node x={340} y={265} w={90} h={25} label="Identity Service" fill="#e0f2fe" stroke="#38bdf8" />
        </svg>
      </div>
      <div className="border-t border-slate-200 pt-2">
        <div className="font-bold text-slate-800 text-[11px] mb-1.5">Legend</div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px]">
          <LegendRow c="#60a5fa" l="Application" />
          <LegendRow c="#4ade80" l="Compute" />
          <LegendRow c="#a78bfa" l="Data" />
          <LegendRow c="#fb923c" l="Platform / Service" />
          <LegendRow c="#38bdf8" l="Infrastructure" />
          <div className="flex items-center gap-1.5">
            <span className="block h-px w-6 border-t-2 border-dashed border-slate-400" />
            <span className="text-slate-600">Indirect Dependency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="block h-px w-6 border-t-2 border-slate-400" />
            <span className="text-slate-600">Direct Dependency</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Node({ x, y, w, h, label, fill, stroke }: any) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill={fill} stroke={stroke} strokeWidth="1" />
      <text x={x + w / 2} y={y + h / 2 + 3} textAnchor="middle" fontSize="8" fontWeight="600" fill="#0f172a">{label}</text>
    </g>
  );
}

function LegendRow({ c, l }: { c: string; l: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
      <span className="text-slate-700">{l}</span>
    </div>
  );
}

function DependencyPath() {
  const steps = [
    { label: "CRM Application", t: "(Application)", color: "bg-blue-50 border-blue-200" },
    { label: "App Server Tier", t: "(Compute)", color: "bg-emerald-50 border-emerald-200" },
    { label: "SQL Database", t: "(Data)", color: "bg-amber-50 border-amber-200" },
    { label: "Storage Array A", t: "(Storage)", color: "bg-violet-50 border-violet-200" },
    { label: "Network Segment 10.2.1.0/24", t: "(Network)", color: "bg-sky-50 border-sky-200" },
    { label: "US-East Data Center", t: "(Infrastructure)", color: "bg-slate-50 border-slate-200" },
  ];
  return (
    <div className="space-y-1.5">
      {steps.map((s, i) => (
        <div key={i} className={`flex items-center justify-between px-2.5 py-1.5 rounded border ${s.color}`}>
          <span className="text-[11px] font-semibold text-slate-800">{s.label}</span>
          <span className="text-[10px] text-slate-500">{s.t}</span>
        </div>
      ))}
    </div>
  );
}

export default function InfraTopology() {
  return (
    <DashShell
      title="DATA CENTER TOPOLOGY & DEPENDENCY MAPPING CONTROL PLANE"
      subtitle="Visualize infrastructure relationships across data centers, platforms, applications, and services to understand dependencies and reduce separation risk."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Topology / App Dep Graph / Risk Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Section title="Global Topology View" className="lg:col-span-6">
          <GlobalTopology />
        </Section>

        <Section title="Application Dependency Graph (Example)" className="lg:col-span-3">
          <AppDependencyGraph />
        </Section>

        <Section title="Dependency Risk Summary" className="lg:col-span-3">
          <div className="h-40 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskSummary} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={2}>
                  {riskSummary.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="text-base font-extrabold text-slate-900">24,713</div>
                <div className="text-[9px] text-slate-500">Total Dependencies</div>
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-1 text-[11px]">
            {riskSummary.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                <span className="text-slate-700">{d.name}</span>
                <span className="ml-auto font-semibold text-slate-900">{d.value.toLocaleString()} ({d.pct})</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Row 2: Deps by type / Top layers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Dependencies by Type" className="lg:col-span-7">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depsByType} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="t" tick={{ fontSize: 10 }} width={200} />
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
                <Bar dataKey="v" fill="hsl(217 91% 60%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Top Dependency Layers" className="lg:col-span-5">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5 px-1">Layer</th>
                <th className="text-left py-1.5 px-1">Components</th>
                <th className="text-left py-1.5 px-1">Dependencies</th>
              </tr>
            </thead>
            <tbody>
              {topLayers.map((l) => (
                <tr key={l.l} className="border-b border-slate-100">
                  <td className="py-1.5 px-1 font-semibold text-slate-900">{l.l}</td>
                  <td className="py-1.5 px-1 text-slate-700">{l.c}</td>
                  <td className="py-1.5 px-1 text-slate-700">{l.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>

      {/* Row 3: Environments / Impact Analysis / Dependency Path */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Environments" className="lg:col-span-3">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5 px-1">Env</th>
                <th className="text-left py-1.5 px-1">Type</th>
                <th className="text-left py-1.5 px-1">DC</th>
                <th className="text-left py-1.5 px-1">Status</th>
                <th className="text-left py-1.5 px-1">Comp</th>
                <th className="text-left py-1.5 px-1">Deps</th>
                <th className="text-left py-1.5 px-1">Risk</th>
              </tr>
            </thead>
            <tbody>
              {envs.map((e) => (
                <tr key={e.e} className="border-b border-slate-100">
                  <td className="py-1.5 px-1 font-semibold text-slate-900">{e.e}</td>
                  <td className="py-1.5 px-1 text-slate-700">{e.t}</td>
                  <td className="py-1.5 px-1 text-slate-700">{e.dc}</td>
                  <td className="py-1.5 px-1"><Pill v={e.st} /></td>
                  <td className="py-1.5 px-1 text-slate-700">{e.c}</td>
                  <td className="py-1.5 px-1 text-slate-700">{e.d}</td>
                  <td className="py-1.5 px-1"><Pill v={e.risk} kind="risk" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="block text-[11px] text-blue-600 mt-2 cursor-pointer">View all environments →</a>
        </Section>

        <Section title="Impact Analysis (Example)" className="lg:col-span-5">
          <div className="text-[11px] text-slate-700 mb-2">
            Planned Change: <span className="font-semibold">Migrate SQL Database from US-East to EU-West</span>
          </div>
          <div className="grid grid-cols-5 gap-2 mb-3 text-center">
            <Stat label="Impacted Applications" v="34" />
            <Stat label="Impacted Components" v="128" />
            <Stat label="Direct Dependencies" v="412" />
            <Stat label="Indirect Dependencies" v="1,287" />
            <div className="rounded-md bg-red-50 border border-red-200 p-2">
              <div className="text-[9px] text-red-600 font-semibold">Risk Level</div>
              <div className="text-base font-extrabold text-red-700">High</div>
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1 font-semibold">Top Impacted Applications</div>
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5 px-1">Application</th>
                <th className="text-left py-1.5 px-1">Type</th>
                <th className="text-left py-1.5 px-1">Users</th>
                <th className="text-left py-1.5 px-1">Dep Level</th>
                <th className="text-left py-1.5 px-1">Criticality</th>
              </tr>
            </thead>
            <tbody>
              {impactedApps.map((a) => (
                <tr key={a.app} className="border-b border-slate-100">
                  <td className="py-1.5 px-1 font-semibold text-slate-900">{a.app}</td>
                  <td className="py-1.5 px-1 text-slate-700">{a.t}</td>
                  <td className="py-1.5 px-1 text-slate-700">{a.users}</td>
                  <td className="py-1.5 px-1"><Pill v={a.lvl} kind="level" /></td>
                  <td className="py-1.5 px-1"><Pill v={a.crit} kind="crit" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="block text-[11px] text-blue-600 mt-2 cursor-pointer">View full impact analysis →</a>
        </Section>

        <Section title="Dependency Path (Sample)" className="lg:col-span-2">
          <DependencyPath />
          <a className="block text-[11px] text-blue-600 mt-2 cursor-pointer">View full dependency chain →</a>
        </Section>

        <Section title="Recent Topology Changes (Last 7 Days)" className="lg:col-span-2">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5 px-1">Change</th>
                <th className="text-left py-1.5 px-1">Time</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((c, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-1.5 px-1">
                    <div className="font-semibold text-slate-900 leading-tight">{c.ch}</div>
                    <div className="text-[9px] text-slate-500">{c.t} · {c.c} · {c.dc}</div>
                  </td>
                  <td className="py-1.5 px-1 text-slate-600 whitespace-nowrap">{c.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="block text-[11px] text-blue-600 mt-2 cursor-pointer">View all changes →</a>
        </Section>
      </div>
    </DashShell>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-md bg-slate-50 border border-slate-200 p-2">
      <div className="text-[9px] text-slate-500 font-medium">{label}</div>
      <div className="text-base font-extrabold text-slate-900">{v}</div>
    </div>
  );
}
