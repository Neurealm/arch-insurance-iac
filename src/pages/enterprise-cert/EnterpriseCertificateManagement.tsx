import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, KeyRound, AlertTriangle, Activity, Bot, Sparkles, X, Search,
  Globe2, Server, Cloud, Building2, Users, TrendingUp, TrendingDown, Zap,
  CheckCircle2, Clock, FileWarning, Lock, Cpu, GitBranch, Database, RefreshCw,
  PlayCircle, ChevronRight, MapPin, Layers, ShieldAlert, Workflow, Eye
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, LineChart, Line, CartesianGrid } from "recharts";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

// ---------- DATA ----------
const KPI_GROUPS = [
  {
    title: "Inventory", icon: Database, tone: "blue",
    items: [
      { label: "Total Certificates", value: "250,847", delta: "+2.1%", up: true },
      { label: "Managed", value: "229,563", delta: "+3.4%", up: true },
      { label: "Unmanaged", value: "21,284", delta: "-8.2%", up: false, good: true },
      { label: "Coverage", value: "91.5%", delta: "+1.7pp", up: true },
    ],
  },
  {
    title: "Risk", icon: ShieldAlert, tone: "amber",
    items: [
      { label: "Expiring 7 Days", value: "1,487", delta: "+142", up: true, bad: true },
      { label: "Expiring 30 Days", value: "5,921", delta: "+318", up: true, bad: true },
      { label: "Policy Violations", value: "372", delta: "-46", up: false, good: true },
      { label: "Unknown Owners", value: "188", delta: "-22", up: false, good: true },
    ],
  },
  {
    title: "Operations", icon: Workflow, tone: "violet",
    items: [
      { label: "Renewal Success", value: "99.1%", delta: "+0.3pp", up: true },
      { label: "Automation Coverage", value: "82.3%", delta: "+4.6pp", up: true },
      { label: "Agentic Resolution", value: "61.2%", delta: "+11.2pp", up: true },
      { label: "Human Escalations", value: "4.7%", delta: "-2.1pp", up: false, good: true },
    ],
  },
  {
    title: "Security", icon: Lock, tone: "rose",
    items: [
      { label: "Weak Algorithms", value: "93", delta: "-14", up: false, good: true },
      { label: "SHA1 Certificates", value: "17", delta: "-5", up: false, good: true },
      { label: "Key Exposures", value: "4", delta: "+1", up: true, bad: true },
      { label: "Unauthorized Issuances", value: "2", delta: "+1", up: true, bad: true },
    ],
  },
];

const STATUS_DATA = [
  { name: "Active", value: 229563, color: "#10b981" },
  { name: "Expiring", value: 5921, color: "#f59e0b" },
  { name: "Revoked", value: 1842, color: "#6366f1" },
  { name: "Unknown", value: 13338, color: "#94a3b8" },
  { name: "Failed Validation", value: 183, color: "#ef4444" },
];

const TYPE_DATA = [
  { name: "TLS/SSL", value: 178432 },
  { name: "Internal PKI", value: 41281 },
  { name: "Client Auth", value: 18402 },
  { name: "Code Signing", value: 6843 },
  { name: "Email (S/MIME)", value: 4291 },
  { name: "Document Signing", value: 1598 },
];

const ISSUER_DATA = [
  { name: "DigiCert", value: 84231, color: "#3b82f6" },
  { name: "Entrust", value: 41382, color: "#8b5cf6" },
  { name: "GlobalSign", value: 28412, color: "#10b981" },
  { name: "Let's Encrypt", value: 19842, color: "#f59e0b" },
  { name: "Internal CA", value: 62389, color: "#06b6d4" },
  { name: "Microsoft CA", value: 14591, color: "#ec4899" },
];

const RISK_MATRIX_ROWS = ["Finance", "Claims", "Customer Portal", "ERP", "IAM", "Network", "Cloud", "Healthcare"];
const RISK_MATRIX_COLS = ["Critical", "High", "Medium", "Low"];
const RISK_MATRIX: Record<string, number[]> = {
  Finance: [12, 38, 124, 482],
  Claims: [18, 52, 198, 612],
  "Customer Portal": [9, 41, 156, 384],
  ERP: [7, 22, 89, 241],
  IAM: [21, 64, 142, 312],
  Network: [4, 18, 71, 503],
  Cloud: [15, 49, 211, 728],
  Healthcare: [11, 37, 132, 408],
};

// World regions with geographic coordinates [lon, lat]
const REGIONS = [
  { id: "na", name: "North America", coords: [-100, 45] as [number, number], certs: 87234, apps: 784, services: 122, critical: 1843, renewals: 2193, violations: 71, compliance: 96.4, incidents: 12 },
  { id: "eu", name: "Europe", coords: [12, 50] as [number, number], certs: 64891, apps: 612, services: 98, critical: 1421, renewals: 1782, violations: 54, compliance: 97.1, incidents: 8 },
  { id: "ap", name: "Asia Pacific", coords: [110, 30] as [number, number], certs: 58412, apps: 521, services: 84, critical: 1287, renewals: 1648, violations: 62, compliance: 94.8, incidents: 11 },
  { id: "sa", name: "South America", coords: [-60, -15] as [number, number], certs: 18241, apps: 184, services: 28, critical: 412, renewals: 521, violations: 18, compliance: 93.2, incidents: 4 },
  { id: "me", name: "Middle East", coords: [45, 28] as [number, number], certs: 12384, apps: 142, services: 22, critical: 318, renewals: 384, violations: 14, compliance: 92.6, incidents: 3 },
  { id: "af", name: "Africa", coords: [20, 0] as [number, number], certs: 6892, apps: 78, services: 12, critical: 142, renewals: 218, violations: 9, compliance: 91.4, incidents: 2 },
  { id: "au", name: "Australia", coords: [134, -25] as [number, number], certs: 2793, apps: 38, services: 6, critical: 84, renewals: 112, violations: 4, compliance: 95.8, incidents: 1 },
];

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const OPS_QUEUE = [
  { id: 1, type: "Certificate Renewal", target: "api.payments.corp", status: "running", agent: "Renewal Planner", time: "2m ago", severity: "info" },
  { id: 2, type: "Deployment Failure", target: "lb-east-prod-04", status: "escalated", agent: "Deployment Coordinator", time: "5m ago", severity: "critical" },
  { id: 3, type: "Ownership Issue", target: "legacy-erp-mgr.int", status: "investigating", agent: "Owner Discovery", time: "8m ago", severity: "warning" },
  { id: 4, type: "Compliance Violation", target: "claims-portal.corp", status: "remediating", agent: "Policy Advisor", time: "12m ago", severity: "warning" },
  { id: 5, type: "CA Outage", target: "Internal-CA-West", status: "monitoring", agent: "Security Investigator", time: "18m ago", severity: "critical" },
  { id: 6, type: "Key Rotation", target: "iam-signing-key", status: "completed", agent: "Certificate Modernization", time: "22m ago", severity: "info" },
  { id: 7, type: "Revocation", target: "compromised-svc.int", status: "completed", agent: "Security Investigator", time: "31m ago", severity: "critical" },
  { id: 8, type: "Security Event", target: "ct-log-anomaly-2841", status: "investigating", agent: "Blast Radius", time: "44m ago", severity: "warning" },
];

const GROWTH_DATA = [
  { m: "Jan", certs: 218000, automated: 162000 },
  { m: "Feb", certs: 224000, automated: 172000 },
  { m: "Mar", certs: 229000, automated: 181000 },
  { m: "Apr", certs: 235000, automated: 189000 },
  { m: "May", certs: 241000, automated: 198000 },
  { m: "Jun", certs: 247000, automated: 204000 },
  { m: "Jul", certs: 250847, automated: 206423 },
];

const SCENARIOS = [
  "Certificate Expires", "CA Outage", "Compromised Key", "Mass Renewal Event",
  "Data Center Failure", "Cloud Migration", "CA Change", "Quantum Crypto Migration",
];

const TONE: Record<string, { bg: string; text: string; ring: string; chip: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-600",   ring: "ring-blue-200",   chip: "bg-blue-100 text-blue-700" },
  amber:  { bg: "bg-amber-50",  text: "text-amber-600",  ring: "ring-amber-200",  chip: "bg-amber-100 text-amber-700" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-200", chip: "bg-violet-100 text-violet-700" },
  rose:   { bg: "bg-rose-50",   text: "text-rose-600",   ring: "ring-rose-200",   chip: "bg-rose-100 text-rose-700" },
};

// ---------- PAGE ----------
export default function EnterpriseCertificateManagement() {
  const [panel, setPanel] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [scenario, setScenario] = useState<string | null>(null);

  const openPanel = (data: any) => { setPanel(data); setActiveTab("overview"); };

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        {/* Header */}
        <div className="sticky top-0 z-30 backdrop-blur-lg bg-white/80 border-b border-slate-200/70">
          <div className="px-6 py-3 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-slate-900 truncate">Enterprise Certificate Management — Digital Twin</h1>
              <p className="text-[11px] text-slate-500">Global PKI Operations · 250,847 certs · 35,000 endpoints · 15 regions</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-100/70 border border-slate-200 min-w-[280px]">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input placeholder="Search certificates, domains, owners…" className="bg-transparent text-xs outline-none flex-1 placeholder:text-slate-400" />
              <kbd className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500">⌘K</kbd>
            </div>
            <button className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <RefreshCw className="h-3.5 w-3.5" /> Live
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* KPI BANNER */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {KPI_GROUPS.map((g) => {
              const t = TONE[g.tone];
              return (
                <motion.div
                  key={g.title}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-7 w-7 rounded-lg ${t.bg} grid place-items-center`}>
                        <g.icon className={`h-3.5 w-3.5 ${t.text}`} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{g.title}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${t.chip} font-semibold`}>LIVE</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {g.items.map((it: any) => {
                      const positive = it.good || (it.up && !it.bad);
                      const Arrow = it.up ? TrendingUp : TrendingDown;
                      return (
                        <button
                          key={it.label}
                          onClick={() => openPanel({ kind: "kpi", title: it.label, value: it.value, group: g.title })}
                          className="text-left group"
                        >
                          <div className="text-[10px] text-slate-500 truncate">{it.label}</div>
                          <div className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{it.value}</div>
                          <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${positive ? "text-emerald-600" : "text-rose-600"}`}>
                            <Arrow className="h-2.5 w-2.5" />{it.delta}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ZONE 1: Estate Health Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="Certificate Status" subtitle="Health distribution across estate" onClick={openPanel}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={STATUS_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={2}>
                    {STATUS_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-1 text-[10px]">
                {STATUS_DATA.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.name}</span>
                    <span className="font-semibold text-slate-700">{s.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Certificate Types" subtitle="Inventory by certificate purpose" onClick={openPanel}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={TYPE_DATA} layout="vertical" margin={{ left: 80, right: 16 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Issuer Analysis" subtitle="Distribution across CAs" onClick={openPanel}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={ISSUER_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                    {ISSUER_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-1 text-[10px]">
                {ISSUER_DATA.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-slate-600">{s.name}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* ZONE 2 + 3: Risk Matrix + World Map */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            {/* Risk Matrix */}
            <div className="xl:col-span-2 bg-white/80 backdrop-blur rounded-2xl border border-slate-200/70 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Enterprise Risk Matrix</h3>
                  <p className="text-[11px] text-slate-500">Applications × certificate risk severity</p>
                </div>
                <Layers className="h-4 w-4 text-slate-400" />
              </div>
              <div className="grid grid-cols-[1fr_repeat(4,1fr)] gap-1.5 text-[10px]">
                <div></div>
                {RISK_MATRIX_COLS.map((c) => <div key={c} className="text-center font-semibold text-slate-600">{c}</div>)}
                {RISK_MATRIX_ROWS.map((row) => (
                  <>
                    <div key={row} className="text-slate-700 font-medium py-2">{row}</div>
                    {RISK_MATRIX[row].map((v, i) => {
                      const intensity = i === 0 ? "bg-rose-500" : i === 1 ? "bg-orange-400" : i === 2 ? "bg-amber-300" : "bg-emerald-200";
                      const txt = i < 2 ? "text-white" : "text-slate-800";
                      return (
                        <button
                          key={i}
                          onClick={() => openPanel({ kind: "risk", row, col: RISK_MATRIX_COLS[i], count: v })}
                          className={`${intensity} ${txt} rounded font-bold py-2 hover:scale-105 transition-transform shadow-sm`}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>

            {/* World Map */}
            <div className="xl:col-span-3 bg-white/80 backdrop-blur rounded-2xl border border-slate-200/70 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Globe2 className="h-4 w-4 text-blue-600" /> Global Certificate Topology</h3>
                  <p className="text-[11px] text-slate-500">Click any region for deep operational context</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-600 font-medium">Live telemetry</span>
                </div>
              </div>
              <div className="relative w-full aspect-[2/1] rounded-xl bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 border border-slate-200/50 overflow-hidden">
                <ComposableMap
                  projection="geoEqualEarth"
                  projectionConfig={{ scale: 165 }}
                  width={900}
                  height={450}
                  style={{ width: "100%", height: "100%" }}
                >
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#e2e8f0"
                          stroke="#ffffff"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { outline: "none", fill: "#cbd5e1" },
                            pressed: { outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>
                  {REGIONS.map((r) => (
                    <Marker key={r.id} coordinates={r.coords} onClick={() => openPanel({ kind: "region", ...r })} style={{ default: { cursor: "pointer" }, hover: { cursor: "pointer" }, pressed: { cursor: "pointer" } }}>
                      <g>
                        <circle r={18} fill="#3b82f6" opacity={0.18}>
                          <animate attributeName="r" values="18;28;18" dur="2.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.25;0;0.25" dur="2.4s" repeatCount="indefinite" />
                        </circle>
                        <circle r={16} fill="url(#regionGrad)" stroke="#ffffff" strokeWidth={2} style={{ filter: "drop-shadow(0 4px 8px rgba(59,130,246,0.35))" }} />
                        <text textAnchor="middle" y={4} fill="#ffffff" fontSize={9} fontWeight={700}>{r.id.toUpperCase()}</text>
                        <g transform="translate(0, 28)">
                          <rect x={-18} y={-7} width={36} height={14} rx={3} fill="#ffffff" stroke="#e2e8f0" strokeWidth={0.5} />
                          <text textAnchor="middle" y={3} fill="#334155" fontSize={8} fontWeight={700}>{(r.certs / 1000).toFixed(1)}k</text>
                        </g>
                      </g>
                    </Marker>
                  ))}
                  <defs>
                    <radialGradient id="regionGrad">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </radialGradient>
                  </defs>
                </ComposableMap>
              </div>
            </div>
          </div>

          {/* ZONE 4: Ops Queue + Agentic Command */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 bg-white/80 backdrop-blur rounded-2xl border border-slate-200/70 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Activity className="h-4 w-4 text-blue-600" /> Active Operations Queue</h3>
                  <p className="text-[11px] text-slate-500">Live agentic + automated operations</p>
                </div>
                <span className="text-[10px] font-semibold text-blue-600">{OPS_QUEUE.length} active</span>
              </div>
              <div className="space-y-1.5 max-h-[340px] overflow-auto">
                {OPS_QUEUE.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => openPanel({ kind: "op", ...op })}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors text-left"
                  >
                    <span className={`h-2 w-2 rounded-full ${op.severity === "critical" ? "bg-rose-500" : op.severity === "warning" ? "bg-amber-500" : "bg-emerald-500"} ${op.status !== "completed" ? "animate-pulse" : ""}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">{op.type}</div>
                      <div className="text-[10px] text-slate-500 truncate">{op.target} · {op.agent}</div>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                      op.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                      op.status === "escalated" ? "bg-rose-50 text-rose-700" :
                      op.status === "running" ? "bg-blue-50 text-blue-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>{op.status}</span>
                    <span className="text-[10px] text-slate-400 w-16 text-right">{op.time}</span>
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Agentic Command Center */}
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-500/20 p-4 text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur grid place-items-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Digital Certificate Ops Center</h3>
                    <p className="text-[10px] text-blue-100">Agentic Coworker Control Plane</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { l: "Active Coworkers", v: "10" }, { l: "Tasks Running", v: "47" },
                    { l: "Recommendations", v: "128" }, { l: "Escalations", v: "12" },
                    { l: "Autonomous Actions", v: "8,412" }, { l: "Hours Saved", v: "3,847" },
                    { l: "ROI Generated", v: "$2.4M" }, { l: "Risk Avoided", v: "$18M" },
                  ].map((s) => (
                    <div key={s.l} className="bg-white/10 backdrop-blur rounded-lg p-2 border border-white/10">
                      <div className="text-[9px] text-blue-100">{s.l}</div>
                      <div className="text-base font-bold">{s.v}</div>
                    </div>
                  ))}
                </div>
                <button className="w-full bg-white/15 hover:bg-white/25 backdrop-blur text-xs font-semibold py-2 rounded-lg border border-white/20 flex items-center justify-center gap-1.5 transition-colors">
                  <Sparkles className="h-3.5 w-3.5" /> View All Coworkers
                </button>
              </div>
            </div>
          </div>

          {/* Scenario Simulator + Analytics */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/70 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <PlayCircle className="h-4 w-4 text-violet-600" />
                <h3 className="text-sm font-bold text-slate-900">Scenario Simulator</h3>
              </div>
              <p className="text-[10px] text-slate-500 mb-3">Trigger to ripple risk, automation & agentic response</p>
              <div className="grid grid-cols-2 gap-1.5">
                {SCENARIOS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setScenario(s)}
                    className={`text-[10px] font-semibold py-2 px-2 rounded-lg border transition-all ${
                      scenario === s
                        ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-violet-300 hover:bg-violet-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {scenario && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-2.5 rounded-lg bg-violet-50 border border-violet-200">
                  <div className="text-[10px] font-bold text-violet-700">Simulating: {scenario}</div>
                  <div className="text-[10px] text-violet-600 mt-0.5">Risk re-calculating · 4 agents engaged · ETA 2m</div>
                </motion.div>
              )}
            </div>

            <div className="xl:col-span-2 bg-white/80 backdrop-blur rounded-2xl border border-slate-200/70 shadow-sm p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Executive Analytics</h3>
              <p className="text-[11px] text-slate-500 mb-3">Certificate growth & automation adoption trajectory</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={GROWTH_DATA}>
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="certs" stroke="#3b82f6" strokeWidth={2} fill="url(#cg)" name="Total Certs" />
                  <Area type="monotone" dataKey="automated" stroke="#10b981" strokeWidth={2} fill="url(#ag)" name="Automated" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-4 gap-2 mt-2 pt-3 border-t border-slate-100">
                {[
                  { l: "Cost Savings", v: "$4.8M" },
                  { l: "Effort Reduced", v: "68%" },
                  { l: "Incidents ↓", v: "-42%" },
                  { l: "Compliance", v: "96.8%" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="text-[9px] text-slate-500 uppercase">{s.l}</div>
                    <div className="text-sm font-bold text-slate-900">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE PANEL */}
        <AnimatePresence>
          {panel && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setPanel(null)}
                className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 280 }}
                className="fixed top-0 right-0 h-full w-full md:w-[40%] bg-white shadow-2xl z-50 flex flex-col"
              >
                <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-gradient-to-br from-blue-50/50 to-white">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">
                      {panel.kind === "region" ? "Regional Operations" : panel.kind === "risk" ? "Risk Cluster" : panel.kind === "op" ? "Operation" : panel.kind === "kpi" ? "KPI Detail" : "Detail"}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                      {panel.name || panel.title || panel.type || `${panel.row} · ${panel.col}`}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">{panel.kind === "region" ? `${panel.certs?.toLocaleString()} certificates · ${panel.apps} applications` : "Contextual operational view"}</p>
                  </div>
                  <button onClick={() => setPanel(null)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-slate-100">
                    <X className="h-4 w-4 text-slate-600" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="px-5 border-b border-slate-200 flex gap-1 overflow-x-auto">
                  {["overview", "operations", "dependencies", "automation", "agentic", "security", "audit", "timeline"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`text-[11px] font-semibold capitalize px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {t === "agentic" ? "Agentic Coworker" : t}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-auto p-5">
                  <PanelContent tab={activeTab} panel={panel} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

// ---------- Helpers ----------
function ChartCard({ title, subtitle, children, onClick }: any) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-[10px] text-slate-500">{subtitle}</p>
        </div>
        <button onClick={() => onClick({ kind: "chart", title })} className="text-[10px] text-blue-600 font-semibold hover:underline">
          View all
        </button>
      </div>
      {children}
    </div>
  );
}


function PanelContent({ tab, panel }: { tab: string; panel: any }) {
  if (panel.kind === "region") {
    if (tab === "overview") {
      return (
        <div className="space-y-4">
          <Grid items={[
            { l: "Certificates", v: panel.certs.toLocaleString() },
            { l: "Applications", v: panel.apps },
            { l: "Business Services", v: panel.services },
            { l: "Critical Certs", v: panel.critical.toLocaleString() },
            { l: "Upcoming Renewals", v: panel.renewals.toLocaleString() },
            { l: "Policy Violations", v: panel.violations },
            { l: "Compliance", v: `${panel.compliance}%` },
            { l: "Open Incidents", v: panel.incidents },
          ]} />

          <Section title="Regional Infrastructure">
            <div className="grid grid-cols-3 gap-2">
              {[{ n: "Azure", v: 12, i: Cloud }, { n: "AWS", v: 8, i: Cloud }, { n: "GCP", v: 3, i: Cloud }].map((c) => (
                <div key={c.n} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <c.i className="h-3.5 w-3.5 text-blue-600 mb-1" />
                  <div className="text-[10px] text-slate-500">{c.n}</div>
                  <div className="text-sm font-bold text-slate-900">{c.v} accounts</div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Chicago", "Dallas", "New York", "Toronto"].map((d) => (
                <span key={d} className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold flex items-center gap-1">
                  <Building2 className="h-2.5 w-2.5" />{d}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Top Applications">
            {["Claims Platform", "Customer Portal", "IAM Platform", "Finance ERP", "API Gateway"].map((a) => (
              <Row key={a} left={a} right={`${Math.floor(Math.random() * 400 + 100)} certs`} />
            ))}
          </Section>

          <Section title="Regional Owners">
            {[
              { o: "Sarah Mitchell", t: "Platform Eng", c: 96, r: "A+" },
              { o: "James Chen", t: "Security", c: 88, r: "A" },
              { o: "Priya Patel", t: "Cloud Ops", c: 91, r: "A" },
            ].map((p) => (
              <div key={p.o} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                <div>
                  <div className="text-xs font-semibold text-slate-800">{p.o}</div>
                  <div className="text-[10px] text-slate-500">{p.t}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">{p.c}% coverage</div>
                  <div className="text-[10px] font-bold text-emerald-600">{p.r}</div>
                </div>
              </div>
            ))}
          </Section>

          <Section title="Automation Coverage">
            <div className="space-y-2">
              {[{ l: "Automation", v: 84, c: "bg-blue-500" }, { l: "Agentic", v: 63, c: "bg-violet-500" }, { l: "Manual", v: 16, c: "bg-slate-400" }].map((a) => (
                <div key={a.l}>
                  <div className="flex justify-between text-[10px] mb-0.5"><span>{a.l}</span><span className="font-semibold">{a.v}%</span></div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full ${a.c}`} style={{ width: `${a.v}%` }} /></div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      );
    }
  }

  if (tab === "agentic") {
    return (
      <div className="space-y-2">
        {[
          { n: "Owner Discovery Agent", c: 94, r: "Discovered owner for 12 orphaned certs via SCM commit analysis" },
          { n: "Certificate Risk Analyst", c: 88, r: "Surfaced 3 high-risk SHA1 certs binding production load balancers" },
          { n: "Blast Radius Agent", c: 91, r: "Mapped 87 downstream services impacted by api.payments cert" },
          { n: "Renewal Planner", c: 96, r: "Sequenced 142 renewals into 4 low-risk maintenance windows" },
          { n: "Deployment Coordinator", c: 89, r: "Coordinated rollout across 12 LBs + 38 k8s clusters" },
          { n: "Policy Advisor", c: 92, r: "Flagged 18 certs violating new quantum-readiness baseline" },
        ].map((a) => (
          <div key={a.n} className="p-3 rounded-lg border border-slate-200 bg-gradient-to-br from-violet-50/50 to-white">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Bot className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-xs font-bold text-slate-900">{a.n}</span>
              </div>
              <span className="text-[10px] font-bold text-violet-600">{a.c}% confidence</span>
            </div>
            <p className="text-[11px] text-slate-600">{a.r}</p>
            <div className="flex gap-1.5 mt-2">
              <button className="text-[10px] px-2 py-1 bg-violet-600 text-white rounded font-semibold">Approve</button>
              <button className="text-[10px] px-2 py-1 bg-slate-100 text-slate-700 rounded font-semibold">Review</button>
              <button className="text-[10px] px-2 py-1 bg-slate-100 text-slate-700 rounded font-semibold">Evidence</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "automation") {
    return (
      <div className="space-y-1.5">
        {[
          "Auto Renewal", "Certificate Deployment", "CA Synchronization", "Certificate Discovery",
          "Ownership Notification", "CMDB Updates", "Change Record Creation", "Policy Enforcement",
          "Validation Testing", "Rollback Automation",
        ].map((a, i) => (
          <div key={a} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800">{a}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span className="text-emerald-600 font-bold">{(95 + Math.random() * 4).toFixed(1)}%</span>
              <span>{Math.floor(Math.random() * 5000 + 500)} runs</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "security") {
    return (
      <div className="space-y-3">
        {[
          { l: "Certificate Transparency Logs", v: "247,841 monitored", s: "ok" },
          { l: "Unauthorized Issuances", v: "2 detected", s: "warn" },
          { l: "Weak Algorithms", v: "93 certs (SHA1/RSA-1024)", s: "warn" },
          { l: "Compromised Key Detection", v: "4 keys flagged via threat intel", s: "alert" },
          { l: "Certificate Abuse Monitoring", v: "0 active campaigns", s: "ok" },
          { l: "Threat Intelligence", v: "Connected · 14 feeds", s: "ok" },
          { l: "Zero Trust Alignment", v: "94.2% compliant", s: "ok" },
          { l: "Quantum Readiness Score", v: "62/100", s: "warn" },
        ].map((m) => (
          <div key={m.l} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-semibold text-slate-800">{m.l}</div>
              <div className="text-[10px] text-slate-500">{m.v}</div>
            </div>
            <span className={`h-2 w-2 rounded-full ${m.s === "ok" ? "bg-emerald-500" : m.s === "warn" ? "bg-amber-500" : "bg-rose-500 animate-pulse"}`} />
          </div>
        ))}
      </div>
    );
  }

  if (tab === "timeline") {
    return (
      <div className="space-y-3">
        {[
          { t: "2m ago", e: "Renewal completed", d: "api.payments.corp · DigiCert" },
          { t: "14m ago", e: "Deployment validated", d: "12 load balancers · 38 clusters" },
          { t: "1h ago", e: "Owner assigned", d: "Platform Eng team · Sarah Mitchell" },
          { t: "3h ago", e: "Policy exception approved", d: "Legacy ERP · 90-day grace" },
          { t: "1d ago", e: "Discovery sweep", d: "1,247 new certs catalogued" },
          { t: "2d ago", e: "Incident resolved", d: "CA-West outage · 47m MTTR" },
        ].map((ev, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
              <div className="w-px flex-1 bg-slate-200" />
            </div>
            <div className="flex-1 pb-3">
              <div className="text-[10px] text-slate-500">{ev.t}</div>
              <div className="text-xs font-semibold text-slate-900">{ev.e}</div>
              <div className="text-[11px] text-slate-600">{ev.d}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "dependencies") {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
          <div className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-2"><GitBranch className="h-3.5 w-3.5 text-blue-600" /> Dependency Graph</div>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-600" /> api.payments.corp <span className="text-slate-400">→</span> <span className="font-mono">12 LBs, 38 clusters, 4 API gateways</span></div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet-600" /> 87 downstream services impacted</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> 14 business services in blast radius</div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "audit") {
    return (
      <div className="space-y-2">
        {["Change Records", "Approvals", "Renewal History", "Policy Exceptions", "Regulatory Compliance", "Evidence Repository"].map((a) => (
          <div key={a} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200">
            <span className="text-xs font-semibold text-slate-800">{a}</span>
            <button className="text-[10px] text-blue-600 font-semibold hover:underline flex items-center gap-1">View <ChevronRight className="h-3 w-3" /></button>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "operations") {
    return (
      <div className="space-y-3">
        <Grid items={[
          { l: "Deployment Status", v: "Healthy" },
          { l: "Active Bindings", v: "847" },
          { l: "Servers", v: "1,284" },
          { l: "Load Balancers", v: "42" },
          { l: "Containers", v: "12,847" },
          { l: "K8s Clusters", v: "38" },
          { l: "API Gateways", v: "14" },
          { l: "Cloud Services", v: "284" },
        ]} />
      </div>
    );
  }

  return <div className="text-xs text-slate-500">Contextual content for {tab}.</div>;
}

function Section({ title, children }: any) {
  return (
    <div>
      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</h4>
      <div>{children}</div>
    </div>
  );
}

function Grid({ items }: { items: { l: string; v: any }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((i) => (
        <div key={i.l} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[10px] text-slate-500">{i.l}</div>
          <div className="text-sm font-bold text-slate-900">{i.v}</div>
        </div>
      ))}
    </div>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-700">{left}</span>
      <span className="text-[10px] font-semibold text-slate-500">{right}</span>
    </div>
  );
}
