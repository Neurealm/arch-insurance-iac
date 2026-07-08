import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  ArrowLeft, Activity, AlertTriangle, Bot, CheckCircle2, ChevronRight, Clock,
  DollarSign, FileDown, Gauge, HardHat, Send, ShieldCheck, Sparkles, Wrench,
  Zap, Bell, PlayCircle, PauseCircle, Mic, Camera, ClipboardCheck,
  Package, Users, Factory, TrendingUp, TrendingDown, ThermometerSun,
  Waves, BarChart3, MessageSquare, XCircle, ChevronDown, PhoneCall,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar, PieChart, Pie, Cell,
} from "recharts";

// ---------- Data ----------
const plantKpis = [
  { icon: Gauge, l: "Plant Health Score", v: "87.4", sub: "of 100", tone: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Activity, l: "Overall OEE", v: "82.1%", sub: "+1.4% WoW", tone: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: AlertTriangle, l: "Downtime Risk (72h)", v: "High", sub: "Line 3 · M-304", tone: "text-red-600", bg: "bg-red-50" },
  { icon: Clock, l: "MTTR", v: "48 min", sub: "-12 min vs 30d", tone: "text-blue-600", bg: "bg-blue-50" },
  { icon: Wrench, l: "Open Work Orders", v: "27", sub: "6 high priority", tone: "text-orange-600", bg: "bg-orange-50" },
  { icon: Bot, l: "AI Recommendations", v: "14", sub: "9 auto-approved", tone: "text-indigo-600", bg: "bg-indigo-50" },
];

const productionLines = [
  { id: "L1", name: "Line 1 · Filling", health: 96, oee: 88, status: "ok", machines: 14, alerts: 0 },
  { id: "L2", name: "Line 2 · Labeling", health: 91, oee: 84, status: "ok", machines: 11, alerts: 1 },
  { id: "L3", name: "Line 3 · Packaging", health: 62, oee: 71, status: "risk", machines: 18, alerts: 4 },
  { id: "L4", name: "Line 4 · Palletizing", health: 88, oee: 79, status: "ok", machines: 9, alerts: 1 },
  { id: "L5", name: "Line 5 · Inspection", health: 93, oee: 86, status: "ok", machines: 12, alerts: 0 },
];

const machinesOnLine3 = [
  { id: "M-301", name: "Conveyor Drive", health: 94, temp: 62, vib: 1.1, status: "ok" },
  { id: "M-302", name: "Case Erector", health: 89, temp: 58, vib: 1.4, status: "ok" },
  { id: "M-303", name: "Case Sealer", health: 82, temp: 66, vib: 1.8, status: "watch" },
  { id: "M-304", name: "Packaging Motor", health: 41, temp: 84, vib: 4.2, status: "risk" },
  { id: "M-305", name: "Shrink Wrap", health: 91, temp: 61, vib: 1.2, status: "ok" },
];

const telemetry7d = Array.from({ length: 48 }).map((_, i) => ({
  t: `${i}h`,
  vib: 2.2 + (i > 30 ? (i - 30) * 0.09 : Math.random() * 0.15),
  temp: 68 + (i > 28 ? (i - 28) * 0.55 : Math.random() * 1.2),
  rate: 100 - (i > 32 ? (i - 32) * 0.6 : Math.random() * 1.2),
}));

const rcaSignals = [
  { signal: "Vibration RMS", finding: "28% above baseline", delta: "+28%", tone: "red" },
  { signal: "Bearing Temperature", finding: "Trending upward for 6h", delta: "+11 °C", tone: "red" },
  { signal: "Production Rate", finding: "Reduced throughput", delta: "-7%", tone: "orange" },
  { signal: "Motor Current", finding: "Slight upward drift", delta: "+3.2 A", tone: "orange" },
  { signal: "Prior Incidents", finding: "Bearing wear 94 days ago", delta: "similar", tone: "amber" },
  { signal: "Spare Parts", finding: "Bearing kit BK-220 in stock", delta: "12 units", tone: "emerald" },
  { signal: "Technician Availability", finding: "Rivera · 2nd shift", delta: "Ready", tone: "emerald" },
];

const planSteps = [
  { n: 1, t: "Reduce Line 3 speed 10%", detail: "Set VFD to 90% until repair window closes", owner: "MES", eta: "Immediate" },
  { n: 2, t: "Schedule inspection at micro-stop", detail: "Next planned changeover 14:00", owner: "Scheduler", eta: "14:00" },
  { n: 3, t: "Assign technician", detail: "L. Rivera · Level 3 mechanical", owner: "CMMS", eta: "2 min" },
  { n: 4, t: "Reserve parts", detail: "Bearing kit BK-220, seal SL-14", owner: "Parts room", eta: "5 min" },
  { n: 5, t: "Create work order WO-88214", detail: "Priority: High · Est. 30 min", owner: "ServiceNow", eta: "1 min" },
  { n: 6, t: "Notify production supervisor", detail: "Teams alert + email to J. Alvarez", owner: "Teams", eta: "Immediate" },
];

const repairSteps = [
  { t: "Verify Lockout / Tagout", safety: true },
  { t: "PPE check — gloves, glasses, hearing", safety: true },
  { t: "Isolate electrical energy at panel P-3B", safety: true },
  { t: "Remove motor housing cover" },
  { t: "Inspect bearing race and shaft alignment" },
  { t: "Replace bearing kit BK-220 if wear confirmed" },
  { t: "Re-torque per spec (32 Nm cross-pattern)" },
  { t: "Restore power · run 5-min unloaded verification" },
];

const verification = [
  { m: "Vibration RMS", pre: "4.2 mm/s", post: "1.6 mm/s", status: "ok" },
  { m: "Bearing Temperature", pre: "84 °C", post: "63 °C", status: "ok" },
  { m: "Production Rate", pre: "-7%", post: "+0.4%", status: "ok" },
  { m: "Motor Current", pre: "+3.2 A", post: "baseline", status: "ok" },
  { m: "Work Order WO-88214", pre: "Open", post: "Completed", status: "ok" },
  { m: "Documentation", pre: "—", post: "Auto-generated", status: "ok" },
];

const valueSummary = [
  { icon: Clock, l: "Downtime Avoided", v: "3.5 h", tone: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: DollarSign, l: "Estimated Savings", v: "$42,000", tone: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: TrendingDown, l: "MTTR Reduction", v: "-38%", tone: "text-blue-600", bg: "bg-blue-50" },
  { icon: Users, l: "Technician Time Saved", v: "47 min", tone: "text-blue-600", bg: "bg-blue-50" },
  { icon: ClipboardCheck, l: "Documentation Completeness", v: "100%", tone: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: ShieldCheck, l: "Repeat Failure Risk", v: "Reduced", tone: "text-emerald-600", bg: "bg-emerald-50" },
];

const alertsFeed = [
  { t: "M-304 vibration exceeded 4.0 mm/s", when: "2 min ago", tone: "red" },
  { t: "L3 throughput -7% vs 4h baseline", when: "18 min ago", tone: "orange" },
  { t: "Predictive model confidence 0.93", when: "24 min ago", tone: "indigo" },
  { t: "M-303 bearing temperature drift watch", when: "1 h ago", tone: "amber" },
];

// ---------- Small components ----------
const toneBg: Record<string, string> = {
  red: "bg-red-50 text-red-700 border-red-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

function Section({ title, subtitle, right, children }: {
  title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-4 px-5 py-3.5 border-b border-slate-100">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-[12px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function PlantMap({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white overflow-hidden">
      <svg viewBox="0 0 720 300" className="w-full h-[300px]">
        <defs>
          <pattern id="fgrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="720" height="300" fill="url(#fgrid)" />
        {productionLines.map((ln, i) => {
          const y = 30 + i * 50;
          const risk = ln.status === "risk";
          const fill = risk ? "#fee2e2" : ln.status === "watch" ? "#fef3c7" : "#ecfdf5";
          const stroke = risk ? "#f87171" : "#86efac";
          return (
            <g key={ln.id} onClick={() => onSelect(ln.id)} style={{ cursor: "pointer" }}>
              <rect x={30} y={y} width={640} height={36} rx={6} fill={fill} stroke={selected === ln.id ? "#4f46e5" : stroke} strokeWidth={selected === ln.id ? 2 : 1} />
              <text x={44} y={y + 22} fontSize="12" fontWeight={600} fill="#0f172a">{ln.name}</text>
              <text x={220} y={y + 22} fontSize="11" fill="#475569">{ln.machines} machines · OEE {ln.oee}%</text>
              <circle cx={640} cy={y + 18} r={5} fill={risk ? "#ef4444" : ln.status === "watch" ? "#f59e0b" : "#10b981"}>
                {risk && <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />}
              </circle>
              {risk && (
                <text x={600} y={y + 22} fontSize="10" fontWeight={700} fill="#b91c1c">M-304</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------- Page ----------
export default function FactoryMaintenanceCopilot() {
  const [line, setLine] = useState("L3");
  const [machine, setMachine] = useState("M-304");
  const [tab, setTab] = useState<"overview" | "machine" | "rca" | "plan" | "workorder" | "repair" | "verify" | "value">("overview");
  const [copilotQ, setCopilotQ] = useState("");
  const [planApproved, setPlanApproved] = useState(false);

  const activeMachine = useMemo(() => machinesOnLine3.find((m) => m.id === machine)!, [machine]);

  const tabs: { k: typeof tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { k: "overview", label: "Command Center", icon: Factory },
    { k: "machine", label: "Machine Detail", icon: Activity },
    { k: "rca", label: "Root Cause", icon: Sparkles },
    { k: "plan", label: "Action Plan", icon: ClipboardCheck },
    { k: "workorder", label: "Work Order", icon: Wrench },
    { k: "repair", label: "Guided Repair", icon: HardHat },
    { k: "verify", label: "Verification", icon: CheckCircle2 },
    { k: "value", label: "Executive Value", icon: TrendingUp },
  ];

  return (
    <AppShell>
      <div className="bg-slate-50 min-h-full">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Link to="/app" className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 grid place-items-center">
                <Factory className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-[0.14em] text-slate-500">FACTORY OPERATIONS INTELLIGENCE</div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Factory Maintenance Copilot</h1>
                <p className="text-[12px] text-slate-500">AI-guided predictive maintenance across the plant floor</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live · Plant 04
              </span>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-[12px] font-medium text-slate-700">
                <FileDown className="h-3.5 w-3.5" /> Export brief
              </button>
              <button
                onClick={() => setTab("machine")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold shadow-sm"
              >
                <PlayCircle className="h-3.5 w-3.5" /> Start Copilot Walkthrough
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 flex items-center gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.k;
              return (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                    active ? "border-indigo-500 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* KPI strip always visible */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {plantKpis.map((k, i) => {
              const Icon = k.icon;
              return (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className={`h-8 w-8 rounded-md grid place-items-center ${k.bg}`}>
                      <Icon className={`h-4 w-4 ${k.tone}`} />
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">{k.l}</div>
                  <div className="text-lg font-bold text-slate-900 leading-tight">{k.v}</div>
                  <div className="text-[11px] text-slate-500">{k.sub}</div>
                </div>
              );
            })}
          </div>

          {tab === "overview" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2 space-y-5">
                <Section title="Plant Operations Command Center" subtitle="Line-level health · click a line to inspect machines">
                  <PlantMap selected={line} onSelect={(id) => { setLine(id); if (id === "L3") setTab("machine"); }} />
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                    {productionLines.map((ln) => (
                      <button
                        key={ln.id}
                        onClick={() => { setLine(ln.id); if (ln.id === "L3") setTab("machine"); }}
                        className={`text-left rounded-lg border p-3 transition ${
                          line === ln.id ? "border-indigo-400 bg-indigo-50/50" : "border-slate-200 bg-white hover:border-indigo-300"
                        }`}
                      >
                        <div className="text-[11px] text-slate-500">{ln.id}</div>
                        <div className="text-[12.5px] font-semibold text-slate-900 truncate">{ln.name.replace(/^Line \d+ · /, "")}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`text-[11px] font-semibold ${
                            ln.status === "risk" ? "text-red-600" : ln.status === "watch" ? "text-amber-600" : "text-emerald-600"
                          }`}>Health {ln.health}</span>
                          <span className="text-[11px] text-slate-500">OEE {ln.oee}%</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </Section>

                <Section title="Throughput & Anomaly Timeline · Last 48h" subtitle="Model highlights vibration drift on M-304 starting hour 30">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={telemetry7d}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ fontSize: 11 }} />
                        <Area type="monotone" dataKey="vib" name="Vibration mm/s" stroke="#ef4444" fill="#fecaca" strokeWidth={2} />
                        <Area type="monotone" dataKey="rate" name="Rate index" stroke="#4f46e5" fill="#e0e7ff" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              </div>

              <div className="space-y-5">
                <Section title="Live Alerts" subtitle="Prioritized by AI risk score">
                  <ul className="space-y-2">
                    {alertsFeed.map((a, i) => (
                      <li key={i} className={`rounded-md border p-2.5 ${toneBg[a.tone]}`}>
                        <div className="flex items-start gap-2">
                          <Bell className="h-3.5 w-3.5 mt-0.5" />
                          <div className="flex-1 text-[12px] leading-snug">{a.t}</div>
                          <span className="text-[10.5px] opacity-70 whitespace-nowrap">{a.when}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="AI Copilot" subtitle="Ask about any asset, line, or maintenance decision">
                  <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-[12px] text-slate-700 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10.5px] font-semibold tracking-wider mb-1"><Bot className="h-3 w-3" /> COPILOT</div>
                    Line 3 Packaging Motor <b>M-304</b> shows a 28% vibration rise and 11 °C bearing temperature drift over the past 6 hours. Pattern matches a bearing wear event from 94 days ago. Failure probability in the next 72 hours is <b>High (0.93)</b>. Recommend a bearing kit replacement during the 14:00 micro-stop.
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={copilotQ}
                      onChange={(e) => setCopilotQ(e.target.value)}
                      placeholder="e.g. What is the risk to today's shipment?"
                      className="flex-1 h-9 px-3 rounded-md border border-slate-200 text-[12px] focus:outline-none focus:border-indigo-400"
                    />
                    <button className="h-9 px-3 rounded-md bg-indigo-600 text-white text-[12px] font-semibold inline-flex items-center gap-1.5">
                      <Send className="h-3.5 w-3.5" /> Ask
                    </button>
                  </div>
                </Section>
              </div>
            </div>
          )}

          {tab === "machine" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2 space-y-5">
                <Section
                  title="Line 3 Packaging Motor M-304"
                  subtitle="Asset ID M-304 · Line 3 · Building B · Zone Packaging · Criticality A"
                  right={
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-[11px] font-semibold text-red-700">
                      <AlertTriangle className="h-3 w-3" /> Failure probability 93% · 72h
                    </span>
                  }
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { l: "Runtime", v: "18,412 h", i: Clock },
                      { l: "Cycle Count", v: "6.42 M", i: BarChart3 },
                      { l: "Vibration RMS", v: "4.2 mm/s", i: Waves, tone: "text-red-600" },
                      { l: "Bearing Temp", v: "84 °C", i: ThermometerSun, tone: "text-red-600" },
                      { l: "Motor Current", v: "38.4 A", i: Zap, tone: "text-orange-600" },
                      { l: "Last Service", v: "94 days ago", i: Wrench },
                      { l: "Open Parts", v: "2", i: Package },
                      { l: "Recurring Failures", v: "3 (bearing)", i: AlertTriangle, tone: "text-orange-600" },
                    ].map((c, i) => {
                      const Icon = c.i;
                      return (
                        <div key={i} className="rounded-md border border-slate-200 p-3">
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <Icon className="h-3.5 w-3.5" /> {c.l}
                          </div>
                          <div className={`mt-1 text-[15px] font-semibold ${c.tone || "text-slate-900"}`}>{c.v}</div>
                        </div>
                      );
                    })}
                  </div>
                </Section>

                <Section title="Live Telemetry · Last 48h" subtitle="Vibration and bearing temperature diverging from baseline">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={telemetry7d}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ fontSize: 11 }} />
                        <Line yAxisId="left" type="monotone" dataKey="vib" name="Vibration mm/s" stroke="#ef4444" strokeWidth={2} dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="temp" name="Bearing °C" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Section>

                <Section title="Machine Health · Line 3">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {machinesOnLine3.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMachine(m.id)}
                        className={`text-left rounded-lg border p-3 ${
                          machine === m.id ? "border-indigo-400 bg-indigo-50/40" : "border-slate-200 hover:border-indigo-300"
                        }`}
                      >
                        <div className="text-[11px] text-slate-500">{m.id}</div>
                        <div className="text-[12.5px] font-semibold text-slate-900">{m.name}</div>
                        <div className="mt-1 text-[11px]">
                          <span className={
                            m.status === "risk" ? "text-red-600 font-semibold" :
                            m.status === "watch" ? "text-amber-600 font-semibold" : "text-emerald-600 font-semibold"
                          }>Health {m.health}</span>
                          <span className="text-slate-500 ml-2">Vib {m.vib}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </Section>
              </div>

              <div className="space-y-5">
                <Section title="Visual Inspection" subtitle="Latest camera capture · 6 min ago">
                  <div className="aspect-video rounded-lg border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 grid place-items-center text-slate-300 text-[12px]">
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="h-8 w-8 opacity-60" />
                      <div>Motor M-304 · Bearing housing view</div>
                      <div className="text-[10.5px] opacity-70">Thermal overlay available</div>
                    </div>
                  </div>
                  <div className="mt-3 text-[12px] text-slate-600">
                    Vision model detected micro-cracking pattern near drive-end bearing seat. Confidence 0.87.
                  </div>
                </Section>

                <Section title="AI Issue Summary">
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-[12.5px] text-amber-900 leading-relaxed">
                    Line 3 Packaging Motor <b>M-304</b> is showing elevated vibration and temperature drift. Pattern resembles prior bearing wear events. Estimated downtime risk is <b>High</b> within the next 72 hours. Recommend inspection and bearing replacement during the next planned micro-stop.
                  </div>
                  <button
                    onClick={() => setTab("rca")}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-semibold"
                  >
                    View Root Cause Analysis <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </Section>
              </div>
            </div>
          )}

          {tab === "rca" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2">
                <Section title="Root Cause Analysis · M-304" subtitle="Explainable AI reasoning across plant-floor signals">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12.5px]">
                      <thead>
                        <tr className="text-left text-[11px] uppercase text-slate-500 border-b border-slate-200">
                          <th className="py-2 pr-4">Signal</th>
                          <th className="py-2 pr-4">Finding</th>
                          <th className="py-2">Delta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rcaSignals.map((s, i) => (
                          <tr key={i} className="border-b border-slate-100">
                            <td className="py-2.5 pr-4 font-medium text-slate-800">{s.signal}</td>
                            <td className="py-2.5 pr-4 text-slate-600">{s.finding}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${toneBg[s.tone]}`}>{s.delta}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={() => setTab("plan")}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[12.5px] font-semibold"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Generate Maintenance Plan
                  </button>
                </Section>
              </div>
              <div>
                <Section title="Confidence & Similarity">
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ name: "conf", value: 93, fill: "#4f46e5" }]}>
                        <RadialBar background dataKey="value" cornerRadius={8} />
                        <Tooltip contentStyle={{ fontSize: 11 }} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center text-[12px] text-slate-600 -mt-4">
                    <div className="text-2xl font-bold text-indigo-700">93%</div>
                    Model confidence · 12 similar historical events
                  </div>
                </Section>
              </div>
            </div>
          )}

          {tab === "plan" && (
            <Section
              title="Recommended Maintenance Plan"
              subtitle="Copilot-generated · reviewable before dispatch"
              right={
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-md border border-slate-200 text-[12px] hover:bg-slate-50">Edit plan</button>
                  <button className="px-3 py-1.5 rounded-md border border-amber-200 text-amber-700 text-[12px] hover:bg-amber-50">Escalate</button>
                  <button className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 text-[12px] hover:bg-slate-50">Dismiss</button>
                  <button
                    onClick={() => { setPlanApproved(true); setTab("workorder"); }}
                    className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve plan
                  </button>
                </div>
              }
            >
              <ol className="space-y-3">
                {planSteps.map((s) => (
                  <li key={s.n} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center text-[13px] font-bold shrink-0">{s.n}</div>
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold text-slate-900">{s.t}</div>
                      <div className="text-[12px] text-slate-500">{s.detail}</div>
                    </div>
                    <div className="text-right text-[11px] text-slate-500">
                      <div className="font-semibold text-slate-700">{s.owner}</div>
                      <div>{s.eta}</div>
                    </div>
                  </li>
                ))}
              </ol>
              {planApproved && (
                <div className="mt-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] px-3 py-2 inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Plan approved · Work order WO-88214 created
                </div>
              )}
            </Section>
          )}

          {tab === "workorder" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2">
                <Section title="Work Order WO-88214" subtitle="Source: AI Copilot recommendation · Auto-populated fields">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12.5px]">
                    {[
                      ["Title", "Inspect bearing assembly on Packaging Motor M-304"],
                      ["Priority", "High"],
                      ["Asset", "Line 3 Packaging Motor M-304"],
                      ["Assigned to", "L. Rivera · Level 3 Mechanical"],
                      ["Parts required", "Bearing kit BK-220 · Seal SL-14"],
                      ["Target window", "14:00 – 14:30 (micro-stop)"],
                      ["Estimated duration", "30 min"],
                      ["Safety requirements", "LOTO · PPE · Panel P-3B isolation"],
                      ["Cost center", "MFG-PLANT04-PKG"],
                      ["Source", "AI Copilot recommendation"],
                    ].map(([k, v]) => (
                      <div key={k as string} className="rounded-md border border-slate-200 p-2.5">
                        <div className="text-[10.5px] uppercase tracking-wider text-slate-500">{k}</div>
                        <div className="text-slate-900 font-medium">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] text-slate-500">
                      Dispatched to
                      {["CMMS", "ERP", "MES", "ServiceNow", "Teams"].map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-[11px] font-semibold">{s}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => setTab("repair")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white text-[12px] font-semibold hover:bg-slate-800"
                    >
                      Open technician view <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Section>
              </div>
              <div>
                <Section title="Notifications sent">
                  <ul className="space-y-2 text-[12px]">
                    <li className="flex items-center gap-2 text-slate-700"><MessageSquare className="h-3.5 w-3.5 text-indigo-600" /> Teams · Supervisor J. Alvarez</li>
                    <li className="flex items-center gap-2 text-slate-700"><PhoneCall className="h-3.5 w-3.5 text-emerald-600" /> Paged L. Rivera (2nd shift)</li>
                    <li className="flex items-center gap-2 text-slate-700"><Package className="h-3.5 w-3.5 text-amber-600" /> Parts room reservation confirmed</li>
                    <li className="flex items-center gap-2 text-slate-700"><Activity className="h-3.5 w-3.5 text-blue-600" /> MES · Line 3 throttled to 90%</li>
                  </ul>
                </Section>
              </div>
            </div>
          )}

          {tab === "repair" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2">
                <Section title="Guided Repair · WO-88214" subtitle="Copilot walks technician through each step">
                  <ol className="space-y-2">
                    {repairSteps.map((s, i) => (
                      <li key={i} className="flex items-center gap-3 rounded-md border border-slate-200 p-3">
                        <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 grid place-items-center text-[12px] font-bold">{i + 1}</div>
                        <div className="flex-1 text-[12.5px] text-slate-800">{s.t}</div>
                        {s.safety && <span className="text-[10.5px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">SAFETY</span>}
                        <input type="checkbox" className="h-4 w-4 accent-emerald-600" />
                      </li>
                    ))}
                  </ol>
                </Section>
              </div>
              <div className="space-y-5">
                <Section title="Safety Checklist">
                  <ul className="space-y-1.5 text-[12px] text-slate-700">
                    <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> PPE verified</li>
                    <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Lockout / Tagout confirmed</li>
                    <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Panel P-3B isolated</li>
                    <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Two-person rule active</li>
                  </ul>
                </Section>
                <Section title="Voice notes & AI assist">
                  <div className="rounded-md border border-slate-200 p-3 text-[12px] text-slate-700 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10.5px] font-semibold tracking-wider mb-1"><Bot className="h-3 w-3" /> COPILOT</div>
                    If vibration is high but temperature is normal, first check <b>shaft alignment and coupling wear</b> before bearing replacement — misalignment produces vibration without initial thermal signature.
                  </div>
                  <button className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50 text-[12px] font-semibold text-slate-700">
                    <Mic className="h-3.5 w-3.5" /> Record technician observation
                  </button>
                  <button
                    onClick={() => setTab("verify")}
                    className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold"
                  >
                    Complete repair · run verification <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </Section>
              </div>
            </div>
          )}

          {tab === "verify" && (
            <Section
              title="Verification & Closure"
              subtitle="Post-repair asset behavior compared to pre-repair baseline"
              right={
                <button
                  onClick={() => setTab("value")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-semibold"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Close Incident
                </button>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="text-left text-[11px] uppercase text-slate-500 border-b border-slate-200">
                      <th className="py-2 pr-4">Measurement</th>
                      <th className="py-2 pr-4">Before</th>
                      <th className="py-2 pr-4">After</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verification.map((v, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-2.5 pr-4 font-medium text-slate-800">{v.m}</td>
                        <td className="py-2.5 pr-4 text-slate-500">{v.pre}</td>
                        <td className="py-2.5 pr-4 text-slate-900 font-semibold">{v.post}</td>
                        <td className="py-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-[12.5px] text-emerald-900">
                Post-repair verification passed. Documentation generated and added to knowledge base entry <b>KB-3049 · Packaging Motor Bearing Wear</b>.
              </div>
            </Section>
          )}

          {tab === "value" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {valueSummary.map((v, i) => {
                  const Icon = v.icon;
                  return (
                    <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className={`h-9 w-9 rounded-md grid place-items-center ${v.bg}`}>
                        <Icon className={`h-4.5 w-4.5 ${v.tone}`} />
                      </div>
                      <div className="mt-2 text-[11px] text-slate-500">{v.l}</div>
                      <div className="text-xl font-bold text-slate-900">{v.v}</div>
                    </div>
                  );
                })}
              </div>
              <Section title="Executive Value Summary">
                <div className="rounded-md bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 p-4 text-[13px] text-slate-800 leading-relaxed">
                  <b>Maintenance Copilot</b> prevented an unplanned outage on Line 3 by detecting failure risk on Packaging Motor M-304, orchestrating the repair workflow across CMMS, ERP, MES, and ServiceNow, guiding the technician through a safe repair, and verifying asset recovery. Estimated shift savings <b>$42,000</b> with a <b>38%</b> reduction in MTTR versus prior bearing events.
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
