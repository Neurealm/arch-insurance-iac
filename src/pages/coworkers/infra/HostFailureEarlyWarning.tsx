import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  ArrowLeft, Activity, Server, HardDrive, Cpu, MemoryStick, Layers, Gauge,
  AlertTriangle, CheckCircle2, Clock, DollarSign, Bot, Play, Zap, Sparkles,
  ShieldCheck, Network, Thermometer, Wind, Battery, Radio, TrendingUp,
  FileDown, Search, RefreshCcw, X, ChevronRight, Users, Database, Bell,
  MessageSquare, Send, Wrench, PowerOff, Flame, Snowflake,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceLine, Legend, Area, AreaChart, BarChart, Bar, PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
} from "recharts";

// ---------- Data ----------
const statusPills = [
  { l: "Operational Status",         v: "Operational",       cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  { l: "Hosts Monitored",            v: "1,246" },
  { l: "Prediction Models",          v: "12 Running" },
  { l: "Telemetry Sources",          v: "34" },
  { l: "Business Services Protected",v: "182" },
  { l: "Infra Coverage",             v: "99.4%" },
  { l: "Last AI Analysis",           v: "12 seconds ago" },
  { l: "Prediction Accuracy (30d)",  v: "94.6%" },
];

const kpis = [
  { icon: Activity,     l: "Infrastructure Health",          v: "98.4%",  sub: "Healthy",              color: "text-emerald-600", bg: "bg-emerald-50", subCls: "text-emerald-600" },
  { icon: AlertTriangle,l: "Hosts at Immediate Risk",        v: "4",      sub: "+2 vs yesterday",      color: "text-red-600",     bg: "bg-red-50",     subCls: "text-red-600" },
  { icon: Gauge,        l: "Hosts Under Observation",        v: "27",     sub: "-3 vs yesterday",      color: "text-amber-600",   bg: "bg-amber-50",   subCls: "text-emerald-600" },
  { icon: TrendingUp,   l: "Predicted Failures (7d)",        v: "6",      sub: "94% confidence",       color: "text-orange-600",  bg: "bg-orange-50" },
  { icon: TrendingUp,   l: "Predicted Failures (30d)",       v: "11",     sub: "92% confidence",       color: "text-orange-600",  bg: "bg-orange-50" },
  { icon: Layers,       l: "Business Services at Risk",      v: "14",     sub: "3 tier-1",             color: "text-red-600",     bg: "bg-red-50" },
  { icon: Database,     l: "Applications Impacted",          v: "62",     sub: "across 8 BUs",         color: "text-blue-600",    bg: "bg-blue-50" },
  { icon: Bot,          l: "Preventive Actions",             v: "36",     sub: "85% success",          color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Clock,        l: "Potential Downtime Avoided",     v: "182 h",  sub: "this month",           color: "text-violet-600",  bg: "bg-violet-50" },
  { icon: DollarSign,   l: "Financial Risk Avoided",         v: "$8.6M",  sub: "annualized",           color: "text-emerald-600", bg: "bg-emerald-50", subCls: "text-emerald-600" },
  { icon: ShieldCheck,  l: "Prediction Accuracy",            v: "94.6%",  sub: "trailing 30 days",     color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Clock,        l: "MTBF Prediction Lead Time",      v: "38 h",   sub: "median warning",       color: "text-blue-600",    bg: "bg-blue-50" },
];

type Risk = "Critical" | "High" | "Medium" | "Low";
const atRiskHosts: {
  host: string; cluster: string; prob: number; conf: number; eta: string;
  crit: Risk; svc: string; app: string; owner: string; auto: boolean;
}[] = [
  { host: "ESX-214", cluster: "PROD-EAST-01", prob: 96, conf: 99, eta: "18 h", crit: "Critical", svc: "Payments",    app: "checkout-api",      owner: "SRE Core",   auto: true  },
  { host: "ESX-108", cluster: "PROD-WEST-04", prob: 88, conf: 96, eta: "2 d",  crit: "Critical", svc: "Order Mgmt",  app: "order-orchestrator", owner: "Platform",   auto: true  },
  { host: "ESX-031", cluster: "PROD-EAST-02", prob: 81, conf: 94, eta: "5 d",  crit: "High",     svc: "Customer Portal", app: "portal-web",     owner: "AppOps",     auto: true  },
  { host: "ESX-412", cluster: "DR-CENTRAL-01",prob: 74, conf: 92, eta: "7 d",  crit: "High",     svc: "Inventory",   app: "inv-sync",          owner: "SRE Core",   auto: false },
  { host: "ESX-087", cluster: "PROD-EAST-01", prob: 63, conf: 88, eta: "10 d", crit: "Medium",   svc: "Search",      app: "search-index",      owner: "Data Plat",  auto: true  },
  { host: "ESX-511", cluster: "STAGE-EAST-01",prob: 58, conf: 85, eta: "14 d", crit: "Medium",   svc: "CI/CD",       app: "runner-pool",       owner: "DevProd",    auto: true  },
  { host: "ESX-702", cluster: "PROD-EU-02",   prob: 52, conf: 82, eta: "18 d", crit: "Medium",   svc: "Billing",     app: "invoicing-svc",     owner: "FinOps",     auto: false },
];

const forecast = Array.from({ length: 18 }, (_, i) => ({
  day: `D${i * 2}`,
  esx214: Math.min(99, Math.round(52 + i * 2.8 + Math.sin(i / 2) * 2)),
  esx108: Math.min(99, Math.round(38 + i * 2.6 + Math.cos(i / 2) * 2)),
  esx031: Math.round(28 + i * 2.4),
  esx412: Math.round(22 + i * 2.1),
  esx087: Math.round(18 + i * 1.9),
}));

const riskFactors = [
  { f: "Disk SMART Errors",       cur: "1,248",  thr: ">100",   risk: "Critical" },
  { f: "Disk Latency (ms)",       cur: "42.6",   thr: ">20",    risk: "Critical" },
  { f: "Memory Correctable Errors",cur: "5,314", thr: ">1,000", risk: "High"     },
  { f: "CPU Ready (%)",           cur: "18.7",   thr: ">10",    risk: "High"     },
  { f: "Power Supply Health",     cur: "78%",    thr: "<80%",   risk: "High"     },
  { f: "NIC Error Rate (%)",      cur: "3.2",    thr: ">1",     risk: "High"     },
  { f: "Temperature (°C)",        cur: "71",     thr: ">70",    risk: "High"     },
  { f: "Firmware Version",        cur: "7.0.3",  thr: "known bad", risk: "Medium" },
];

const riskDistribution = [
  { name: "Healthy",  value: 1201, color: "#10b981" },
  { name: "Warning",  value: 27,   color: "#f59e0b" },
  { name: "High",     value: 14,   color: "#f97316" },
  { name: "Critical", value: 4,    color: "#ef4444" },
];

const insights = [
  { icon: AlertTriangle, tone: "text-red-600 bg-red-50",
    text: "ESX-214 has a 96% probability of failure within 18 hours due to accelerating SMART disk errors (+312/hr) and sustained storage latency (42ms).",
    cta: "Investigate" },
  { icon: AlertTriangle, tone: "text-red-600 bg-red-50",
    text: "4 hosts show failure patterns nearly identical to ESX-214 from historical incident INC-84213 (Aug 2024). Proactive remediation recommended.",
    cta: "View Hosts" },
  { icon: Thermometer, tone: "text-amber-600 bg-amber-50",
    text: "Temperature anomalies across Rack 14 (DC-East) indicate probable cooling degradation affecting 6 hosts. Facilities notified.",
    cta: "View Details" },
  { icon: Sparkles, tone: "text-blue-600 bg-blue-50",
    text: "Firmware 7.0.3 correlated with elevated PCI bus errors on Dell PowerEdge R750 (18 hosts). Roll back or upgrade to 7.0.5.",
    cta: "Update Now" },
];

const actions = [
  { name: "Live migrate workloads from ESX-214", target: "ESX-214",  reduction: 85, downtime: "None",    cost: "$0",    auto: true  },
  { name: "Replace failing disk (Slot 2)",       target: "ESX-214",  reduction: 78, downtime: "Online",  cost: "$1.2K", auto: false },
  { name: "Replace power supply PSU-B",          target: "ESX-108",  reduction: 64, downtime: "Online",  cost: "$1.8K", auto: false },
  { name: "Update firmware to 7.0.5",            target: "18 hosts", reduction: 22, downtime: "Rolling", cost: "$0",    auto: true  },
  { name: "Rebalance workload from Cluster-A",   target: "Cluster-A",reduction: 18, downtime: "None",    cost: "$0",    auto: true  },
  { name: "Evacuate Rack 14 for cooling fix",    target: "6 hosts",  reduction: 71, downtime: "None",    cost: "$0",    auto: true  },
];

const automationDonut = [
  { name: "Successful",  value: 31, color: "#10b981" },
  { name: "In Progress", value: 2,  color: "#f59e0b" },
  { name: "Failed",      value: 3,  color: "#ef4444" },
];

const activity = [
  { t: "09:42", e: "Analyzed telemetry from ESX-214",                       s: "AI" },
  { t: "09:42", e: "Detected disk latency degradation",                     s: "AI" },
  { t: "09:42", e: "Correlated with SMART error increase",                  s: "AI" },
  { t: "09:42", e: "Predicted failure within 18 hours (96% confidence)",    s: "AI" },
  { t: "09:43", e: "Created remediation playbook",                          s: "System" },
  { t: "09:43", e: "Notified operations team (#sre-core)",                  s: "System" },
  { t: "09:44", e: "Created ServiceNow incident INC-123456",                s: "System" },
  { t: "09:45", e: "Initiated live migration of 23 VMs",                    s: "Automation" },
  { t: "09:47", e: "Validated host stability improvement",                  s: "Automation" },
  { t: "09:48", e: "Closed proactive action — impact avoided",              s: "System" },
];

const integrations = [
  "vCenter", "ESXi", "VMware Aria", "Datadog", "Microsoft Sentinel", "ServiceNow",
  "NetApp", "Dell iDRAC", "HPE iLO", "CrowdStrike", "Cisco Intersight", "Splunk",
  "PagerDuty", "Prometheus", "Grafana", "AWS CloudWatch", "Azure Monitor", "Rubrik",
];

const sensors = [
  { l: "CPU Temp",         v: "71°C",  icon: Flame,       cls: "text-red-600" },
  { l: "Mem Temp",         v: "58°C",  icon: Thermometer, cls: "text-amber-600" },
  { l: "Fan Speed",        v: "8,400 RPM", icon: Wind,    cls: "text-blue-600" },
  { l: "PSU Voltage",      v: "12.02 V",   icon: Battery, cls: "text-emerald-600" },
  { l: "Battery Health",   v: "94%",   icon: Battery,     cls: "text-emerald-600" },
  { l: "Disk SMART",       v: "1,248 err", icon: HardDrive, cls: "text-red-600" },
  { l: "Storage Latency",  v: "42.6 ms",   icon: HardDrive, cls: "text-red-600" },
  { l: "Power Draw",       v: "612 W",     icon: Zap,       cls: "text-blue-600" },
  { l: "Inlet Temp",       v: "27°C",      icon: Snowflake, cls: "text-blue-600" },
  { l: "Humidity",         v: "42%",       icon: Wind,      cls: "text-emerald-600" },
];

const investigationTabs = [
  "Executive Summary", "Prediction Timeline", "Telemetry", "Hardware Sensors",
  "Operating System", "VMware", "Storage", "Networking", "Firmware",
  "Historical Failures", "Dependency Graph", "Root Cause", "Runbooks", "Automation",
];

const riskCls = (r: Risk) =>
  r === "Critical" ? "text-red-700 bg-red-50 border-red-200" :
  r === "High"     ? "text-orange-700 bg-orange-50 border-orange-200" :
  r === "Medium"   ? "text-amber-700 bg-amber-50 border-amber-200" :
                     "text-emerald-700 bg-emerald-50 border-emerald-200";

// ---------- Page ----------
export default function HostFailureEarlyWarning() {
  const [selected, setSelected] = useState(atRiskHosts[0]);
  const [tab, setTab] = useState(investigationTabs[0]);
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "I'm monitoring 1,246 hosts. ESX-214 is highest risk (96% probability of failure within 18h). Want me to run the remediation playbook?" },
  ]);

  const totalHosts = useMemo(
    () => riskDistribution.reduce((a, b) => a + b.value, 0), []
  );

  const send = () => {
    if (!chat.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text: chat },
      { role: "ai", text: "Correlated 5 signals (SMART, latency, CPU ready, temp, firmware). Confidence 96%. Recommend: live-migrate 23 VMs → ESX-032, schedule disk replacement in next maintenance window." },
    ]);
    setChat("");
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/coworkers/infrastructure-automation"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Link>
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white grid place-items-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Digital Coworker</div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">Host Failure Early Warning</h1>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search hosts, clusters, services…"
                  className="pl-7 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg w-72 focus:outline-none focus:border-blue-400"
                />
              </div>
              <button className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 inline-flex items-center gap-1.5 hover:bg-slate-50">
                <RefreshCcw className="h-3.5 w-3.5" /> Refresh
              </button>
              <button className="text-xs font-semibold bg-blue-600 text-white rounded-lg px-2.5 py-1.5 inline-flex items-center gap-1.5 hover:bg-blue-700">
                <FileDown className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          </div>
          {/* Mission + Status pills */}
          <div className="px-6 pb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] border-t border-slate-100 pt-2">
            <p className="text-slate-600 max-w-3xl leading-snug">
              <span className="font-semibold text-slate-800">Mission:</span> Continuously analyze infrastructure telemetry, hardware health, OS metrics, virtualization signals, and historical failure patterns to predict host failures before they impact production workloads.
            </p>
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              {statusPills.map((p) => (
                <div key={p.l} className={`inline-flex items-center gap-1.5 border rounded-full px-2 py-0.5 ${p.cls ?? "border-slate-200 bg-white text-slate-700"}`}>
                  {p.dot && <span className={`h-1.5 w-1.5 rounded-full ${p.dot} animate-pulse`} />}
                  <span className="text-slate-500">{p.l}:</span>
                  <span className="font-semibold text-slate-800">{p.v}</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="px-6 py-5 space-y-5">
          {/* KPI Grid */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {kpis.map((k) => (
              <div key={k.l} className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-tight">{k.l}</div>
                  <div className={`h-7 w-7 rounded-lg grid place-items-center ${k.bg} ${k.color}`}>
                    <k.icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className={`mt-2 text-2xl font-bold ${k.color}`}>{k.v}</div>
                <div className={`text-[10px] font-medium ${k.subCls ?? "text-slate-500"}`}>{k.sub}</div>
              </div>
            ))}
          </section>

          {/* Middle: Prediction table + Risk Distribution */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* AI Failure Prediction */}
            <div className="xl:col-span-8 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div>
                  <div className="text-sm font-bold text-slate-900">AI Failure Prediction — Top At-Risk Hosts</div>
                  <div className="text-[11px] text-slate-500">Ranked by probability × business criticality · updated 12s ago</div>
                </div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All Hosts →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold">Host</th>
                      <th className="text-left py-2 px-3 font-semibold">Failure Probability</th>
                      <th className="text-left py-2 px-3 font-semibold">Confidence</th>
                      <th className="text-left py-2 px-3 font-semibold">ETA</th>
                      <th className="text-left py-2 px-3 font-semibold">Cluster</th>
                      <th className="text-left py-2 px-3 font-semibold">Impact</th>
                      <th className="text-left py-2 px-3 font-semibold">Owner</th>
                      <th className="text-right py-2 px-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atRiskHosts.map((h) => (
                      <tr
                        key={h.host}
                        onClick={() => setSelected(h)}
                        className={`border-t border-slate-100 cursor-pointer hover:bg-blue-50/50 ${selected.host === h.host ? "bg-blue-50/70" : ""}`}
                      >
                        <td className="py-2 px-3 font-semibold text-slate-800">{h.host}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full ${h.prob >= 85 ? "bg-red-500" : h.prob >= 70 ? "bg-orange-500" : "bg-amber-500"}`}
                                style={{ width: `${h.prob}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-800">{h.prob}%</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-slate-700">{h.conf}%</td>
                        <td className="py-2 px-3 text-slate-700">{h.eta}</td>
                        <td className="py-2 px-3 text-slate-600">{h.cluster}</td>
                        <td className="py-2 px-3">
                          <span className={`inline-block border rounded-full px-2 py-0.5 text-[10px] font-semibold ${riskCls(h.crit)}`}>{h.crit}</span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{h.owner}</td>
                        <td className="py-2 px-3 text-right">
                          {h.auto ? (
                            <button className="text-[10px] font-semibold bg-blue-600 text-white rounded px-2 py-0.5 hover:bg-blue-700">Automate</button>
                          ) : (
                            <button className="text-[10px] font-semibold border border-slate-200 text-slate-700 rounded px-2 py-0.5 hover:bg-slate-50">Investigate</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Risk Distribution */}
            <div className="xl:col-span-4 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="text-sm font-bold text-slate-900 mb-1">Risk Distribution</div>
              <div className="text-[11px] text-slate-500 mb-2">Across {totalHosts.toLocaleString()} monitored hosts</div>
              <div className="h-52 relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={riskDistribution} innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {riskDistribution.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{totalHosts.toLocaleString()}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Total Hosts</div>
                  </div>
                </div>
              </div>
              <div className="mt-2 space-y-1.5">
                {riskDistribution.map((r) => {
                  const pct = ((r.value / totalHosts) * 100).toFixed(1);
                  return (
                    <div key={r.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                        <span className="text-slate-700">{r.name}</span>
                      </div>
                      <span className="text-slate-600"><span className="font-semibold text-slate-800">{r.value.toLocaleString()}</span> ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Forecast + Risk Factors + At Risk Services */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-6 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-slate-900">Failure Probability Forecast</div>
                  <div className="text-[11px] text-slate-500">Top 5 hosts · rolling 30-day prediction window</div>
                </div>
                <div className="flex gap-1 text-[10px]">
                  {["24h", "7d", "30d", "90d"].map((w) => (
                    <button key={w} className={`px-2 py-0.5 rounded ${w === "30d" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{w}</button>
                  ))}
                </div>
              </div>
              <div className="h-60">
                <ResponsiveContainer>
                  <LineChart data={forecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="%" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Critical", fontSize: 9, fill: "#ef4444" }} />
                    <Line type="monotone" dataKey="esx214" name="ESX-214" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="esx108" name="ESX-108" stroke="#f97316" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="esx031" name="ESX-031" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="esx412" name="ESX-412" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="esx087" name="ESX-087" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="xl:col-span-3 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="text-sm font-bold text-slate-900">Current Risk Factors</div>
              <div className="text-[11px] text-slate-500 mb-2">Host: <span className="font-semibold text-slate-800">{selected.host}</span></div>
              <div className="space-y-1.5">
                {riskFactors.map((f) => (
                  <div key={f.f} className="flex items-center justify-between text-[11px] border-b border-slate-50 pb-1 last:border-0">
                    <div className="min-w-0 pr-2">
                      <div className="text-slate-700 truncate">{f.f}</div>
                      <div className="text-[10px] text-slate-500">Threshold {f.thr}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{f.cur}</span>
                      <span className={`text-[10px] font-semibold border rounded-full px-1.5 py-0 ${riskCls(f.risk as Risk)}`}>{f.risk}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:col-span-3 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="text-sm font-bold text-slate-900">At-Risk Business Services</div>
              <div className="text-[11px] text-slate-500 mb-2">Predicted host failure exposure</div>
              <div className="space-y-1.5 text-xs">
                {[
                  { s: "E-Commerce Platform", h: 3, i: "Critical" as Risk, rev: "$1.2M/hr" },
                  { s: "Payment Processing",  h: 2, i: "Critical" as Risk, rev: "$820K/hr" },
                  { s: "Customer Portal",     h: 2, i: "High"     as Risk, rev: "$140K/hr" },
                  { s: "Order Management",    h: 1, i: "High"     as Risk, rev: "$92K/hr"  },
                  { s: "Inventory DB",        h: 1, i: "Medium"   as Risk, rev: "$18K/hr"  },
                  { s: "Search Service",      h: 1, i: "Medium"   as Risk, rev: "$12K/hr"  },
                ].map((s) => (
                  <div key={s.s} className="flex items-center justify-between border-b border-slate-50 pb-1 last:border-0">
                    <div>
                      <div className="font-medium text-slate-800">{s.s}</div>
                      <div className="text-[10px] text-slate-500">{s.h} host{s.h > 1 ? "s" : ""} at risk · rev {s.rev}</div>
                    </div>
                    <span className={`text-[10px] font-semibold border rounded-full px-1.5 py-0.5 ${riskCls(s.i)}`}>{s.i}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Insights + Actions + Automation Donut */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-4 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-slate-900 inline-flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600" /> Predictive Insights
                </div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All →</button>
              </div>
              <div className="space-y-2">
                {insights.map((ins, i) => (
                  <div key={i} className="rounded-lg border border-slate-100 p-2.5 flex items-start gap-2">
                    <div className={`h-7 w-7 rounded-lg grid place-items-center shrink-0 ${ins.tone}`}>
                      <ins.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-slate-700 leading-snug">{ins.text}</p>
                    </div>
                    <button className="text-[10px] font-semibold border border-slate-200 rounded px-2 py-1 hover:bg-slate-50 shrink-0">{ins.cta}</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:col-span-5 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-slate-900">Recommended Preventive Actions</div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All Actions →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-[10px] uppercase text-slate-500">
                    <tr className="border-b border-slate-100">
                      <th className="text-left font-semibold py-1.5 pr-2">Action</th>
                      <th className="text-left font-semibold py-1.5 pr-2">Target</th>
                      <th className="text-left font-semibold py-1.5 pr-2">Risk ↓</th>
                      <th className="text-left font-semibold py-1.5 pr-2">Downtime</th>
                      <th className="text-right font-semibold py-1.5">Execute</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actions.map((a) => (
                      <tr key={a.name} className="border-b border-slate-50">
                        <td className="py-1.5 pr-2 text-slate-800 font-medium">{a.name}</td>
                        <td className="py-1.5 pr-2 text-slate-600">{a.target}</td>
                        <td className="py-1.5 pr-2 text-emerald-600 font-semibold">{a.reduction}%</td>
                        <td className="py-1.5 pr-2 text-slate-600">{a.downtime}</td>
                        <td className="py-1.5 text-right">
                          <button className={`text-[10px] font-semibold rounded px-2 py-0.5 ${a.auto ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                            {a.auto ? "Execute" : "Ticket"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="xl:col-span-3 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="text-sm font-bold text-slate-900">Automated Actions (24h)</div>
              <div className="text-[11px] text-slate-500 mb-1">Preventive maintenance orchestration</div>
              <div className="h-40 relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={automationDonut} innerRadius={40} outerRadius={62} dataKey="value" paddingAngle={2}>
                      {automationDonut.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-900">36</div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Total</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-[11px] mt-1">
                {automationDonut.map((a) => (
                  <div key={a.name} className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: a.color }} />{a.name}</span>
                    <span className="font-semibold text-slate-800">{a.value}</span>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full text-[11px] font-semibold text-blue-600 hover:underline">View Automation History →</button>
            </div>
          </section>

          {/* Engineering Panel + Investigation + Activity */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Engineering right panel */}
            <div className="xl:col-span-3 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-slate-900">Engineering Detail</div>
                  <div className="text-[11px] text-slate-500">{selected.host}</div>
                </div>
                <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${riskCls(selected.crit)}`}>{selected.crit}</span>
              </div>
              <div className="space-y-2 text-[11px]">
                {[
                  { l: "Vendor / Model",  v: "Dell PowerEdge R750" },
                  { l: "Serial",          v: "7NJH3T2" },
                  { l: "Rack / DC",       v: "R14 · DC-East" },
                  { l: "ESXi Version",    v: "8.0 U2 (Build 22380479)" },
                  { l: "Firmware BIOS",   v: "2.11.2 (known bad)" },
                  { l: "Cluster",         v: selected.cluster },
                  { l: "vMotion (30d)",   v: "84 events" },
                  { l: "HA / DRS",        v: "Enabled · Aggr 3" },
                  { l: "Backup",          v: "Rubrik · SLA Gold" },
                  { l: "CMDB Owner",      v: selected.owner },
                  { l: "Warranty",        v: "Expires 2027-03-14" },
                  { l: "Lifecycle Stage", v: "In Service (32 mo)" },
                ].map((r) => (
                  <div key={r.l} className="flex items-center justify-between border-b border-slate-50 pb-1 last:border-0">
                    <span className="text-slate-500">{r.l}</span>
                    <span className="font-semibold text-slate-800 text-right ml-2">{r.v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Hardware Sensors</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {sensors.map((s) => (
                    <div key={s.l} className="rounded-lg border border-slate-100 p-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <s.icon className={`h-3 w-3 ${s.cls}`} /> {s.l}
                      </div>
                      <div className={`text-xs font-bold ${s.cls}`}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Investigation Workspace */}
            <div className="xl:col-span-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-900">AI Investigation Workspace — {selected.host}</div>
                    <div className="text-[11px] text-slate-500">Predicted failure in {selected.eta} · {selected.prob}% probability · {selected.conf}% confidence</div>
                  </div>
                  <button className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
                    Open Full <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
                  {investigationTabs.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap ${tab === t ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div className="p-4">
                {tab === "Executive Summary" && (
                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                      <div className="font-semibold text-red-700 inline-flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> High-Confidence Failure Prediction</div>
                      <p className="mt-1 text-red-800/90">
                        {selected.host} is predicted to fail in <b>{selected.eta}</b> with <b>{selected.prob}%</b> probability. Live-migrating 23 workloads to ESX-032 and replacing the failing disk in Slot 2 during the next window will eliminate business impact and preserve {selected.svc} SLA.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { l: "Revenue at Risk",  v: "$1.2M/hr", c: "text-red-600" },
                        { l: "Users Impacted",   v: "184K",     c: "text-orange-600" },
                        { l: "Downtime Avoided", v: "6 h",      c: "text-emerald-600" },
                      ].map((s) => (
                        <div key={s.l} className="rounded-lg border border-slate-100 p-2 text-center">
                          <div className="text-[10px] uppercase text-slate-500 font-semibold">{s.l}</div>
                          <div className={`text-lg font-bold ${s.c}`}>{s.v}</div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Contributing Factors</div>
                      <ul className="space-y-1">
                        {[
                          "Disk SMART errors trending +312/hr (12x baseline)",
                          "Storage latency sustained 42ms (threshold 20ms)",
                          "Firmware 7.0.3 correlated with historical failures INC-84213 / INC-91004",
                          "Rack 14 inlet temperature 27°C (+4°C over 24h)",
                        ].map((f) => (
                          <li key={f} className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-blue-600 mt-0.5 shrink-0" /><span>{f}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {tab !== "Executive Summary" && (
                  <div className="h-64">
                    <ResponsiveContainer>
                      <AreaChart data={forecast}>
                        <defs>
                          <linearGradient id="hfArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="%" />
                        <Tooltip />
                        <Area type="monotone" dataKey="esx214" stroke="#ef4444" strokeWidth={2} fill="url(#hfArea)" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="mt-2 text-[11px] text-slate-500">
                      Showing <span className="font-semibold text-slate-700">{tab}</span> telemetry for {selected.host}. Detailed drill-down available in full workspace.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Feed + AI Copilot */}
            <div className="xl:col-span-3 space-y-4">
              <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-slate-900">Digital Coworker Activity</div>
                  <button className="text-[10px] text-slate-500 hover:underline">Replay</button>
                </div>
                <div className="space-y-1.5">
                  {activity.map((a, i) => (
                    <div key={i} className="grid grid-cols-12 gap-1 text-[10px] items-start border-b border-slate-50 pb-1 last:border-0">
                      <div className="col-span-2 text-slate-500 font-mono">{a.t}</div>
                      <div className="col-span-8 text-slate-700 leading-snug">{a.e}</div>
                      <div className="col-span-2 text-right">
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          a.s === "AI" ? "bg-blue-50 text-blue-700" :
                          a.s === "Automation" ? "bg-violet-50 text-violet-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>{a.s}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-white/20 grid place-items-center"><Bot className="h-3.5 w-3.5" /></div>
                  <div className="text-sm font-bold">AI Copilot</div>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {messages.map((m, i) => (
                    <div key={i} className={`text-[11px] leading-snug rounded-lg px-2.5 py-1.5 ${m.role === "ai" ? "bg-white/10" : "bg-white text-slate-800"}`}>
                      {m.text}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-1">
                  <input
                    value={chat}
                    onChange={(e) => setChat(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask about a host, prediction, or action…"
                    className="flex-1 text-[11px] rounded-lg bg-white/10 border border-white/20 placeholder:text-white/60 px-2 py-1.5 focus:outline-none focus:bg-white/20"
                  />
                  <button onClick={send} className="rounded-lg bg-white text-blue-700 px-2 hover:bg-blue-50">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Integrations strip */}
          <section className="rounded-xl bg-white border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-bold text-slate-900">Enterprise Integrations</div>
                <div className="text-[11px] text-slate-500">34 telemetry sources · all healthy</div>
              </div>
              <button className="text-[11px] font-semibold text-blue-600 hover:underline">Manage →</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {integrations.map((i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-full px-2 py-1 text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {i}
                </span>
              ))}
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 border border-blue-200 rounded-full px-2 py-1 text-blue-700">+16 more</span>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
