import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Database, CheckCircle2, AlertTriangle, XCircle, Activity, Cpu, HardDrive,
  Server, Shield, Zap, Clock, TrendingUp, Search, Bot, Sparkles, Bell,
  FileText, Play, RotateCcw, Wrench, GitBranch, Boxes, Network, Layers,
  ChevronRight, X, LineChart as LineIcon, MessageSquare, Send,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadialBarChart, RadialBar,
} from "recharts";

/* ---------- mock data ---------- */

const headerStats = [
  { l: "Operational Status", v: "Operational", s: "All Systems Normal", tone: "emerald" },
  { l: "Clusters Managed", v: "18" },
  { l: "Nodes", v: "4,826" },
  { l: "Applications", v: "1,247" },
  { l: "Storage Capacity", v: "18.2 PB" },
  { l: "Data Pipelines", v: "312" },
  { l: "Scheduled Jobs", v: "842" },
  { l: "Last Health Assessment", v: "6 Seconds Ago" },
  { l: "AI Readiness Engine", v: "Active", tone: "emerald" },
  { l: "Prod Readiness Score", v: "98.7%", tone: "emerald" },
];

const kpis = [
  { l: "Overall Hadoop Health", v: "98.7%", sub: "Healthy", icon: CheckCircle2, tone: "emerald" },
  { l: "Production Ready", v: "YES", sub: "18/18 Clusters", icon: CheckCircle2, tone: "emerald" },
  { l: "Failed Prechecks", v: "4", sub: "0.3% total", icon: XCircle, tone: "red" },
  { l: "Nodes at Risk", v: "18", sub: "0.37%", icon: AlertTriangle, tone: "amber" },
  { l: "HDFS Health", v: "99.9%", sub: "Nominal", icon: HardDrive, tone: "emerald" },
  { l: "YARN Capacity", v: "81%", sub: "Available", icon: Cpu, tone: "blue" },
  { l: "Automated Remediations", v: "62", sub: "Today", icon: Wrench, tone: "violet" },
  { l: "Predicted Job Failures", v: "3", sub: "Next 24h", icon: AlertTriangle, tone: "red" },
  { l: "Capacity Remaining", v: "29%", sub: "18.2 PB", icon: Boxes, tone: "violet" },
  { l: "Downtime Prevented", v: "318", sub: "Hrs / Annualized", icon: Clock, tone: "blue" },
  { l: "Cluster Availability", v: "99.98%", sub: "30-day", icon: Activity, tone: "emerald" },
  { l: "Job Success Rate", v: "97.2%", sub: "24h", icon: TrendingUp, tone: "emerald" },
  { l: "Security Compliance", v: "98.6%", sub: "SOC2 / ISO", icon: Shield, tone: "emerald" },
  { l: "Platform Readiness", v: "A+", sub: "Score 96/100", icon: Sparkles, tone: "blue" },
];

const toneMap: Record<string, { bg: string; text: string; ring: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200" },
  red:     { bg: "bg-red-50",     text: "text-red-600",     ring: "ring-red-200" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",   ring: "ring-amber-200" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",    ring: "ring-blue-200" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-600",  ring: "ring-violet-200" },
  slate:   { bg: "bg-slate-100",  text: "text-slate-600",   ring: "ring-slate-200" },
};

const clusters = [
  { name: "Cluster-01", status: "Healthy",  score: 98, node: 312, env: "Production", region: "US-East",   ver: "7.1.9", owner: "Data Platform Team" },
  { name: "Cluster-02", status: "Healthy",  score: 96, node: 284, env: "Production", region: "US-West",   ver: "7.1.9", owner: "Data Platform Team" },
  { name: "Cluster-03", status: "Healthy",  score: 97, node: 268, env: "Production", region: "US-East",   ver: "7.1.9", owner: "Data Platform Team" },
  { name: "Cluster-11", status: "Warning",  score: 76, node: 220, env: "Production", region: "EMEA",      ver: "7.1.8", owner: "Analytics Eng" },
  { name: "Cluster-14", status: "Warning",  score: 79, node: 198, env: "Production", region: "APAC",      ver: "7.1.9", owner: "ETL Ops" },
  { name: "Cluster-02b",status: "Degraded", score: 62, node: 176, env: "Staging",    region: "US-Central",ver: "7.1.8", owner: "SRE" },
  { name: "Cluster-17", status: "Healthy",  score: 92, node: 244, env: "Production", region: "EMEA",      ver: "7.1.9", owner: "Data Platform Team" },
  { name: "Cluster-18", status: "Healthy",  score: 94, node: 260, env: "Production", region: "APAC",      ver: "7.1.9", owner: "Data Platform Team" },
];

const prechecks = [
  { cat: "HDFS",         status: "pass", score: 92, trend: [88,90,89,92,91,93,92], risk: "Low",    auto: "Auto Fix" },
  { cat: "YARN",         status: "pass", score: 88, trend: [82,84,86,85,87,88,88], risk: "Low",    auto: "Auto Fix" },
  { cat: "Spark",        status: "pass", score: 85, trend: [80,82,83,84,85,85,85], risk: "Low",    auto: "Auto Fix" },
  { cat: "Hive",         status: "pass", score: 90, trend: [86,88,90,90,91,90,90], risk: "Low",    auto: "Auto Fix" },
  { cat: "Kafka",        status: "warn", score: 72, trend: [80,76,74,72,71,72,72], risk: "Medium", auto: "Auto Fix" },
  { cat: "ZooKeeper",    status: "pass", score: 93, trend: [90,91,92,92,93,93,93], risk: "Low",    auto: "Auto Fix" },
  { cat: "HBase",        status: "pass", score: 87, trend: [84,85,86,86,87,87,87], risk: "Low",    auto: "Auto Fix" },
  { cat: "Impala",       status: "pass", score: 89, trend: [85,87,88,88,89,89,89], risk: "Low",    auto: "Auto Fix" },
  { cat: "Disk",         status: "pass", score: 91, trend: [88,89,90,90,91,91,91], risk: "Low",    auto: "Auto Fix" },
  { cat: "Memory",       status: "warn", score: 74, trend: [82,78,76,74,74,74,74], risk: "Medium", auto: "Auto Fix" },
  { cat: "CPU",          status: "pass", score: 86, trend: [84,85,85,86,86,86,86], risk: "Low",    auto: "Auto Fix" },
  { cat: "Network",      status: "pass", score: 90, trend: [86,88,89,90,90,90,90], risk: "Low",    auto: "Auto Fix" },
  { cat: "Security",     status: "pass", score: 94, trend: [90,91,92,93,94,94,94], risk: "Low",    auto: "Auto Fix" },
  { cat: "Kerberos",     status: "pass", score: 95, trend: [92,93,94,95,95,95,95], risk: "Low",    auto: "Auto Fix" },
  { cat: "DNS",          status: "pass", score: 95, trend: [94,94,95,95,95,95,95], risk: "Low",    auto: "Auto Fix" },
  { cat: "Time Sync",    status: "pass", score: 98, trend: [96,97,97,98,98,98,98], risk: "Low",    auto: "Auto Fix" },
  { cat: "Certificates", status: "warn", score: 76, trend: [82,80,78,76,76,76,76], risk: "Medium", auto: "Auto Fix" },
  { cat: "Dependencies", status: "pass", score: 87, trend: [84,85,86,86,87,87,87], risk: "Low",    auto: "Auto Fix" },
];

const services = [
  { s: "HDFS",     h: "Healthy", ha: "Active-Active", v: "3.3.6", drift: "No" },
  { s: "YARN",     h: "Healthy", ha: "Active-Active", v: "3.3.6", drift: "No" },
  { s: "Spark",    h: "Healthy", ha: "Active",        v: "3.4.1", drift: "No" },
  { s: "Hive",     h: "Healthy", ha: "Active",        v: "3.1.3", drift: "No" },
  { s: "Impala",   h: "Healthy", ha: "Active",        v: "4.3.0", drift: "No" },
  { s: "Kafka",    h: "Warning", ha: "Active",        v: "3.5.1", drift: "Yes" },
  { s: "ZooKeeper",h: "Healthy", ha: "Active",        v: "3.7.1", drift: "No" },
  { s: "HBase",    h: "Healthy", ha: "Active",        v: "2.4.17",drift: "No" },
  { s: "Oozie",    h: "Healthy", ha: "Active",        v: "5.2.1", drift: "No" },
  { s: "Knox",     h: "Healthy", ha: "Active",        v: "1.6.1", drift: "No" },
  { s: "Ranger",   h: "Healthy", ha: "Active",        v: "2.3.0", drift: "No" },
  { s: "Atlas",    h: "Healthy", ha: "Active",        v: "2.3.0", drift: "No" },
  { s: "NiFi",     h: "Healthy", ha: "Active",        v: "1.23.0",drift: "No" },
  { s: "Hue",      h: "Healthy", ha: "Active",        v: "4.11.0",drift: "No" },
];

const hdfsTrend = Array.from({ length: 12 }).map((_, i) => ({
  t: `${i * 2}:00`, cap: 72 + Math.sin(i / 2) * 3, rem: 28 + Math.cos(i / 2) * 2, repl: 99.9,
}));

const yarnTrend = Array.from({ length: 12 }).map((_, i) => ({
  t: `${i * 2}:00`, cpu: 60 + Math.sin(i / 3) * 8, mem: 70 + Math.cos(i / 3) * 6, cont: 45 + Math.sin(i / 4) * 10,
}));

const sparkTrend = Array.from({ length: 12 }).map((_, i) => ({
  t: `${i * 2}:00`, run: 140 + Math.sin(i / 2) * 20, fail: 4 + Math.cos(i / 3) * 2, exec: 3600 + Math.sin(i / 2) * 200,
}));

const capForecast = Array.from({ length: 14 }).map((_, i) => ({
  d: `Day ${i + 1}`, used: 12 + i * 0.35, rem: 18.2 - (12 + i * 0.35), forecast: 12 + i * 0.42,
}));

const perfMetrics = [
  { m: "CPU Usage",      avg: 68, peak: 92, trend: [60,64,68,72,68,66,68] },
  { m: "Memory Usage",   avg: 62, peak: 87, trend: [58,60,62,66,63,62,62] },
  { m: "Disk Usage",     avg: 74, peak: 95, trend: [70,72,74,76,74,73,74] },
  { m: "Network In",     avg: 38.2,peak: 74.1, trend: [30,34,38,42,38,36,38] },
  { m: "Network Out",    avg: 16.7,peak: 38.6, trend: [14,15,17,19,17,16,17] },
  { m: "HDFS Throughput",avg: 4.2, peak: 9.8, trend: [3.8,4.0,4.2,4.6,4.3,4.2,4.2] },
];

const risks = [
  { c: "Cluster-11", score: 76, fail: "YARN Capacity Exhaustion",  impact: "High",   conf: 92, jobs: 32, action: "Increase YARN Capacity" },
  { c: "Cluster-03", score: 76, fail: "Kafka Broker Failure",       impact: "Medium", conf: 88, jobs: 18, action: "Restart Broker" },
  { c: "Cluster-02b",score: 62, fail: "HDFS Disk Failure",          impact: "High",   conf: 96, jobs: 22, action: "Replace Disk" },
  { c: "Cluster-11", score: 71, fail: "Spark Executor Loss",        impact: "Medium", conf: 84, jobs: 12, action: "Increase Executors" },
  { c: "Cluster-14", score: 82, fail: "Under Replicated Blocks",    impact: "Medium", conf: 87, jobs: 26, action: "Balance HDFS" },
  { c: "Cluster-11", score: 65, fail: "Kerberos Ticket Expiry",     impact: "Low",    conf: 79, jobs: 7,  action: "Renew Tickets" },
  { c: "Cluster-17", score: 89, fail: "ZooKeeper Latency",          impact: "Low",    conf: 78, jobs: 6,  action: "Restart Service" },
  { c: "Cluster-01", score: 91, fail: "NodeManager Restart",        impact: "Low",    conf: 75, jobs: 4,  action: "Restart Service" },
];

const recos = [
  { title: "Repair Under-Replicated Blocks", conf: 92, reduction: "High", impact: "High",   auto: true },
  { title: "Expand HDFS Storage",            conf: 90, reduction: "High", impact: "High",   auto: true },
  { title: "Increase YARN Memory",           conf: 88, reduction: "Medium", impact: "Medium", auto: true },
  { title: "Restart Kafka Broker 3",         conf: 88, reduction: "Medium", impact: "Medium", auto: true },
  { title: "Rotate Kerberos Keytab",         conf: 86, reduction: "Medium", impact: "Medium", auto: true },
  { title: "Optimize Spark Executor Memory", conf: 86, reduction: "Medium", impact: "Medium", auto: true },
];

const activity = [
  { t: "12:34:45", ev: "Precheck completed for Cluster-03",              s: "success" },
  { t: "12:34:22", ev: "Repaired under-replicated blocks (124 blocks)",  s: "success" },
  { t: "12:33:58", ev: "Restarted Kafka broker on Cluster-08",           s: "success" },
  { t: "12:33:21", ev: "Detected YARN memory pressure on Cluster-05",    s: "warning" },
  { t: "12:32:44", ev: "Kerberos keytab renewed on Cluster-11",          s: "success" },
  { t: "12:32:11", ev: "HDFS disk replaced on dn-12-45.cluster-03",      s: "success" },
];

const jobReadiness = [
  { name: "High Priority",   value: 312, color: "#ef4444" },
  { name: "Medium Priority", value: 428, color: "#f59e0b" },
  { name: "Low Priority",    value: 102, color: "#10b981" },
];

const securityChecks = [
  { l: "Kerberos Authentication", s: "Healthy",   tone: "emerald" },
  { l: "Ranger Authorization",    s: "Healthy",   tone: "emerald" },
  { l: "TLS Encryption",          s: "Enabled",   tone: "emerald" },
  { l: "Certificate Validity",    s: "Healthy",   tone: "emerald" },
  { l: "HDFS Encryption Zones",   s: "Compliant", tone: "emerald" },
  { l: "Audit Logging",           s: "Enabled",   tone: "emerald" },
];

const quickActions = [
  { l: "Run Precheck Now", icon: Play },
  { l: "Repair Cluster Issues", icon: Wrench },
  { l: "Restart Services", icon: RotateCcw },
  { l: "Expand Storage", icon: HardDrive },
  { l: "Create ServiceNow Incident", icon: FileText },
  { l: "Generate Health Report", icon: FileText },
];

const sidebar = [
  { l: "Overview", icon: Layers, active: true },
  { l: "Cluster Topology", icon: Network },
  { l: "Production Readiness", icon: CheckCircle2 },
  { l: "Cluster Services", icon: Server },
  { l: "HDFS Health", icon: HardDrive },
  { l: "YARN Resources", icon: Cpu },
  { l: "Spark & Analytics", icon: Zap },
  { l: "Storage & Capacity", icon: Boxes },
  { l: "Job Readiness", icon: Activity },
  { l: "AI Precheck Engine", icon: Sparkles },
  { l: "Security", icon: Shield },
  { l: "Performance", icon: TrendingUp },
  { l: "Business Impact", icon: LineIcon },
  { l: "AI Recommendations", icon: Bot },
  { l: "Activity Feed", icon: Bell },
  { l: "Automation Library", icon: Wrench },
  { l: "Reports", icon: FileText },
  { l: "Integrations", icon: GitBranch },
];

/* ---------- tiny sparkline ---------- */
function Spark({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  const pts = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={28}>
      <LineChart data={pts}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ---------- Page ---------- */
export default function HadoopHealthPrecheckAgent() {
  const [selected, setSelected] = useState<typeof clusters[number] | null>(clusters[2]);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <AppShell>
      <main className="flex-1 min-w-0 bg-slate-50/60 animate-fade-in">
        <div className="flex min-h-full">
          {/* Product sidebar */}
          <aside className="w-56 shrink-0 bg-slate-900 text-slate-100 min-h-screen">
            <div className="px-4 py-4 border-b border-slate-800 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 grid place-items-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">Digital Coworker</div>
                <div className="text-[10px] text-slate-400">NOVA AI</div>
              </div>
            </div>
            <nav className="py-2">
              {sidebar.map((it) => {
                const I = it.icon;
                return (
                  <button key={it.l} className={`w-full flex items-center gap-2 text-[12px] px-4 py-2 hover:bg-slate-800 ${it.active ? "bg-slate-800 border-l-2 border-blue-400 text-white" : "text-slate-300"}`}>
                    <I className="h-3.5 w-3.5" />
                    <span className="truncate">{it.l}</span>
                  </button>
                );
              })}
            </nav>
            <div className="px-4 pt-3 pb-2 border-t border-slate-800 mt-2">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Quick Actions</div>
              <div className="space-y-1">
                {quickActions.map((a) => {
                  const I = a.icon;
                  return (
                    <button key={a.l} className="w-full flex items-center gap-2 text-[11px] px-2 py-1.5 rounded bg-slate-800/60 hover:bg-slate-700 text-slate-200">
                      <I className="h-3 w-3" />
                      <span className="truncate">{a.l}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <section className="flex-1 min-w-0 px-6 py-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">Hadoop Health Precheck Agent</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-700 border border-violet-200">AI POWERED</span>
                </div>
                <p className="text-[12px] text-slate-600 mt-1 max-w-4xl leading-snug">
                  Mission: Continuously validate cluster readiness, distributed storage health, compute capacity, security, service availability,
                  and application dependencies before production jobs, upgrades, maintenance windows, or infrastructure changes are executed.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input placeholder="Search cluster, node, service, job..." className="w-64 pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white" />
                </div>
                <button className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] grid place-items-center font-bold">12</span>
                </button>
              </div>
            </div>

            {/* Header stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 mb-4">
              {headerStats.map((s) => (
                <div key={s.l} className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <div className="text-[9px] uppercase tracking-wide text-slate-500 font-semibold truncate">{s.l}</div>
                  <div className={`text-sm font-bold truncate ${s.tone === "emerald" ? "text-emerald-600" : "text-slate-900"}`}>{s.v}</div>
                  {s.s && <div className="text-[9px] text-slate-500 truncate">{s.s}</div>}
                </div>
              ))}
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
              {kpis.slice(0, 14).map((k) => {
                const t = toneMap[k.tone] ?? toneMap.slate;
                const Icon = k.icon;
                return (
                  <div key={k.l} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className={`h-8 w-8 rounded-lg ${t.bg} ${t.text} grid place-items-center`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${t.bg} ${t.text}`}>{k.sub}</div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2 font-medium truncate">{k.l}</div>
                    <div className={`text-xl font-extrabold ${t.text} leading-tight`}>{k.v}</div>
                  </div>
                );
              })}
            </div>

            {/* Row 1: Topology / Production Readiness / Cluster Services */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
              {/* Topology */}
              <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-slate-800">Hadoop Cluster Topology</div>
                  <div className="text-[10px] text-slate-500">18 Clusters</div>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="text-center py-1.5 rounded bg-slate-900 text-white font-semibold">Enterprise</div>
                  <div className="text-center text-slate-400">↓</div>
                  <div className="grid grid-cols-3 gap-1">
                    {["US East", "US West", "EMEA", "APAC", "LATAM", "GLOBAL"].map((r) => (
                      <div key={r} className="text-center py-1 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-semibold">{r}</div>
                    ))}
                  </div>
                  <div className="text-center text-slate-400">↓</div>
                  <div className="grid grid-cols-4 gap-1">
                    {clusters.slice(0, 8).map((c) => {
                      const tone = c.status === "Healthy" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : c.status === "Warning" ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200";
                      return (
                        <button key={c.name} onClick={() => setSelected(c)} className={`text-[9px] font-semibold py-1 rounded border truncate ${tone} ${selected?.name === c.name ? "ring-2 ring-blue-400" : ""}`}>
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-center text-slate-400">↓</div>
                  <div className="grid grid-cols-4 gap-1 text-[9px] text-slate-600">
                    {["NameNode","ResourceMgr","DataNodes","NodeMgrs","Spark","Hive","Kafka","ZK"].map((n) => (
                      <div key={n} className="text-center py-1 rounded bg-slate-50 border border-slate-200">{n}</div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-2 text-[10px] text-slate-600 border-t border-slate-100 mt-2">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Healthy</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"/>Warning</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500"/>Degraded</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"/>Critical</span>
                  </div>
                </div>
              </div>

              {/* Production Readiness Dashboard */}
              <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-slate-800">Production Readiness Dashboard</div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-emerald-600 font-semibold">16 Passed</span>
                    <span className="text-amber-600 font-semibold">2 Warning</span>
                    <span className="text-red-600 font-semibold">0 Failed</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead className="text-[10px] text-slate-500 uppercase">
                      <tr>
                        <th className="text-left py-1">Precheck Category</th>
                        <th className="text-left py-1">Status</th>
                        <th className="text-left py-1">Score</th>
                        <th className="text-left py-1">Trend (7d)</th>
                        <th className="text-left py-1">Risk</th>
                        <th className="text-left py-1">Automation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prechecks.map((p) => (
                        <tr key={p.cat} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="py-1 font-medium text-slate-800">{p.cat}</td>
                          <td className="py-1">
                            {p.status === "pass" ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3 w-3" />Pass</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-600"><AlertTriangle className="h-3 w-3" />Warn</span>
                            )}
                          </td>
                          <td className="py-1 text-slate-700">{p.score}</td>
                          <td className="py-1 w-24"><Spark data={p.trend} color={p.status === "pass" ? "#10b981" : "#f59e0b"} /></td>
                          <td className="py-1 text-slate-600">{p.risk}</td>
                          <td className="py-1"><button className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">{p.auto}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cluster Services */}
              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-3">Cluster Services</div>
                <div className="space-y-1.5 text-[11px]">
                  {services.map((s) => (
                    <div key={s.s} className="flex items-center justify-between py-1 border-b border-slate-50">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${s.h === "Healthy" ? "bg-emerald-500" : "bg-amber-500"}`}/>
                        <span className="font-medium text-slate-800">{s.s}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{s.v}</div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 text-[10px] font-semibold text-blue-600 hover:underline">View All Services →</button>
              </div>
            </div>

            {/* Row 2: HDFS / YARN / Spark trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-slate-800">HDFS Health</div>
                  <div className="flex text-[10px] gap-1">
                    {["24H","7D","30D"].map((r,i) => <button key={r} className={`px-1.5 py-0.5 rounded ${i === 0 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>{r}</button>)}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={hdfsTrend}>
                    <defs>
                      <linearGradient id="hdfsg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="t" tick={{ fontSize: 9 }} stroke="#94a3b8"/>
                    <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8"/>
                    <Tooltip contentStyle={{ fontSize: 11 }}/>
                    <Area type="monotone" dataKey="cap" stroke="#3b82f6" fill="url(#hdfsg)" strokeWidth={2}/>
                    <Line type="monotone" dataKey="rem" stroke="#10b981" strokeWidth={2} dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-2 mt-2 text-[10px]">
                  <div><div className="text-slate-500">Capacity Used</div><div className="font-bold text-blue-600">14.2 PB (78%)</div></div>
                  <div><div className="text-slate-500">Under Replicated</div><div className="font-bold text-amber-600">2,148</div></div>
                  <div><div className="text-slate-500">Corrupt Blocks</div><div className="font-bold text-emerald-600">0</div></div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-slate-800">YARN Resources</div>
                  <div className="flex text-[10px] gap-1">
                    {["24H","7D","30D"].map((r,i) => <button key={r} className={`px-1.5 py-0.5 rounded ${i === 0 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>{r}</button>)}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={yarnTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="t" tick={{ fontSize: 9 }} stroke="#94a3b8"/>
                    <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8"/>
                    <Tooltip contentStyle={{ fontSize: 11 }}/>
                    <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} dot={false}/>
                    <Line type="monotone" dataKey="mem" stroke="#f59e0b" strokeWidth={2} dot={false}/>
                    <Line type="monotone" dataKey="cont" stroke="#10b981" strokeWidth={2} dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-2 mt-2 text-[10px]">
                  <div><div className="text-slate-500">CPU Alloc</div><div className="font-bold text-blue-600">69%</div></div>
                  <div><div className="text-slate-500">Memory Alloc</div><div className="font-bold text-amber-600">72%</div></div>
                  <div><div className="text-slate-500">Containers</div><div className="font-bold text-emerald-600">8,342</div></div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-slate-800">Spark & Analytics</div>
                  <div className="flex text-[10px] gap-1">
                    {["24H","7D","30D"].map((r,i) => <button key={r} className={`px-1.5 py-0.5 rounded ${i === 0 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>{r}</button>)}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={sparkTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="t" tick={{ fontSize: 9 }} stroke="#94a3b8"/>
                    <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8"/>
                    <Tooltip contentStyle={{ fontSize: 11 }}/>
                    <Bar dataKey="run" fill="#8b5cf6"/>
                    <Bar dataKey="fail" fill="#ef4444"/>
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-2 mt-2 text-[10px]">
                  <div><div className="text-slate-500">Running Jobs</div><div className="font-bold text-violet-600">156</div></div>
                  <div><div className="text-slate-500">Failed 24h</div><div className="font-bold text-red-600">7</div></div>
                  <div><div className="text-slate-500">Executors</div><div className="font-bold text-emerald-600">3,842</div></div>
                </div>
              </div>
            </div>

            {/* Row 3: AI Precheck Engine + AI Recos + Business Impact + Security */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
              <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-2">AI Precheck Engine — Top Risks</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead className="text-[9px] uppercase text-slate-500">
                      <tr><th className="text-left py-1">Cluster</th><th className="text-left">Score</th><th className="text-left">Predicted Failure</th><th className="text-left">Impact</th><th className="text-left">Conf</th></tr>
                    </thead>
                    <tbody>
                      {risks.map((r, i) => (
                        <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer">
                          <td className="py-1 font-semibold text-slate-800">{r.c}</td>
                          <td className="py-1 text-slate-700">{r.score}</td>
                          <td className="py-1 text-slate-600 truncate max-w-[140px]">{r.fail}</td>
                          <td className="py-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${r.impact === "High" ? "bg-red-50 text-red-700" : r.impact === "Medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{r.impact}</span>
                          </td>
                          <td className="py-1 text-slate-700">{r.conf}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="w-full mt-2 text-[10px] font-semibold text-blue-600 hover:underline">View All Risks →</button>
              </div>

              <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-2">AI Recommendations</div>
                <div className="space-y-2">
                  {recos.map((r, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-2">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-semibold text-slate-800 truncate">{r.title}</div>
                        <span className="text-[9px] font-bold text-emerald-600">{r.conf}%</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-[10px] text-slate-600">Risk↓ {r.reduction} · Impact {r.impact}</div>
                        <div className="flex gap-1">
                          <button className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Approve</button>
                          <button className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-600 text-white">Execute</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-2">Business Impact</div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-600">Apps Impacted</span><span className="font-bold text-slate-800">124</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Data Pipelines</span><span className="font-bold text-slate-800">312</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Departments</span><span className="font-bold text-slate-800">26</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Users Impacted</span><span className="font-bold text-slate-800">18,742</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Revenue Exposure</span><span className="font-bold text-emerald-600">$12.8M</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">SLA Risk</span><span className="font-bold text-amber-600">Medium</span></div>
                </div>
              </div>

              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-2">Security & Compliance</div>
                <div className="grid place-items-center py-2">
                  <ResponsiveContainer width={110} height={110}>
                    <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ v: 98.6 }]} startAngle={90} endAngle={-270}>
                      <RadialBar dataKey="v" fill="#10b981" background />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="-mt-16 text-center">
                    <div className="text-lg font-extrabold text-emerald-600">98.6%</div>
                    <div className="text-[9px] text-slate-500">Security Score</div>
                  </div>
                </div>
                <div className="space-y-1 text-[10px] mt-2">
                  {securityChecks.slice(0, 4).map((c) => (
                    <div key={c.l} className="flex items-center justify-between">
                      <span className="text-slate-600 truncate">{c.l}</span>
                      <span className="text-emerald-600 font-semibold">{c.s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 4: Performance / Storage forecast / Job Readiness / Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-2">Cluster Performance (24h)</div>
                <table className="w-full text-[11px]">
                  <thead className="text-[9px] uppercase text-slate-500"><tr><th className="text-left">Metric</th><th className="text-left">Avg</th><th className="text-left">Peak</th><th className="text-left">Trend</th></tr></thead>
                  <tbody>
                    {perfMetrics.map((p) => (
                      <tr key={p.m} className="border-t border-slate-100">
                        <td className="py-1 text-slate-800">{p.m}</td>
                        <td className="py-1 text-slate-600">{p.avg}%</td>
                        <td className="py-1 text-slate-600">{p.peak}%</td>
                        <td className="py-1 w-16"><Spark data={p.trend} color="#3b82f6" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-2">Storage & Capacity Forecast</div>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={capForecast}>
                    <defs>
                      <linearGradient id="capg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="d" tick={{ fontSize: 8 }} stroke="#94a3b8"/>
                    <YAxis tick={{ fontSize: 8 }} stroke="#94a3b8"/>
                    <Tooltip contentStyle={{ fontSize: 11 }}/>
                    <Area type="monotone" dataKey="used" stroke="#10b981" fill="url(#capg)" strokeWidth={2}/>
                    <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 3"/>
                  </AreaChart>
                </ResponsiveContainer>
                <div className="text-[10px] text-slate-600 mt-1 text-center">Projected full: <span className="font-bold text-amber-600">Aug 18, 2025</span> (61 days remaining)</div>
              </div>

              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-2">Job Readiness (Next 24h)</div>
                <div className="flex items-center gap-3">
                  <ResponsiveContainer width={130} height={130}>
                    <PieChart>
                      <Pie data={jobReadiness} dataKey="value" innerRadius={38} outerRadius={58} stroke="none">
                        {jobReadiness.map((c) => <Cell key={c.name} fill={c.color}/>)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 text-[11px] space-y-1">
                    {jobReadiness.map((j) => (
                      <div key={j.name} className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-700"><span className="h-2 w-2 rounded-full" style={{ background: j.color }}/>{j.name}</span>
                        <span className="font-semibold text-slate-800">{j.value}</span>
                      </div>
                    ))}
                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <div className="flex justify-between"><span className="text-slate-600">Predicted Success</span><span className="font-bold text-emerald-600">97.2%</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">At Risk</span><span className="font-bold text-amber-600">3 (0.4%)</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-2">Activity Feed (Live)</div>
                <div className="space-y-1.5 text-[10px]">
                  {activity.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 border-b border-slate-50 pb-1">
                      <span className={`h-2 w-2 rounded-full mt-1 shrink-0 ${a.s === "success" ? "bg-emerald-500" : "bg-amber-500"}`}/>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-700 truncate">{a.ev}</div>
                        <div className="text-slate-400 text-[9px]">{a.t}</div>
                      </div>
                      <span className={`text-[9px] font-semibold ${a.s === "success" ? "text-emerald-600" : "text-amber-600"}`}>{a.s}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-2 text-[10px] font-semibold text-blue-600 hover:underline">View All Activity →</button>
              </div>
            </div>

            {/* Footer strip */}
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between text-[11px] text-slate-600 flex-wrap gap-2">
              <div>Data Refreshed: <span className="font-semibold text-slate-800">6 Seconds Ago</span></div>
              <div className="flex gap-4">
                <span>18 Clusters</span>
                <span>4,826 Nodes</span>
                <span>1,247 Applications</span>
                <span>18.2 PB Storage</span>
                <span>842 Scheduled Jobs</span>
                <span>312 Data Pipelines</span>
              </div>
              <div className="text-slate-400">© 2025 NOVA AI Digital Coworker</div>
            </div>
          </section>

          {/* Right-side engineering panel */}
          {selected && (
            <aside className="w-72 shrink-0 bg-white border-l border-slate-200 min-h-screen p-4 sticky top-0 self-start hidden xl:block">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-800">Selected Cluster</div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4"/></button>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="h-4 w-4 text-blue-600"/>
                  <div className="font-bold text-slate-900">{selected.name}</div>
                  <span className="ml-auto text-[10px] font-semibold text-emerald-600">{selected.status}</span>
                </div>
                <div className="text-[10px] text-slate-500">{selected.env} · {selected.region}</div>
              </div>
              <div className="border-b border-slate-200 flex text-[10px] mb-3">
                {["Overview","Nodes","Services","Security","History"].map((t, i) => (
                  <button key={t} className={`px-2 py-1 font-semibold ${i === 0 ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500"}`}>{t}</button>
                ))}
              </div>
              <div className="space-y-3 text-[11px]">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">General</div>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span className="text-slate-600">Cluster Name</span><span className="font-semibold">{selected.name}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Version</span><span className="font-semibold">{selected.ver}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Distribution</span><span className="font-semibold">Cloudera Data Platform</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Owner</span><span className="font-semibold truncate max-w-[130px]">{selected.owner}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Environment</span><span className="font-semibold">{selected.env}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Region</span><span className="font-semibold">{selected.region}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Data Center</span><span className="font-semibold">US-EAST-DC1</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Uptime</span><span className="font-semibold">27d 14h 32m</span></div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Resources</div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="rounded bg-slate-50 py-1"><div className="text-[9px] text-slate-500">Nodes</div><div className="font-bold text-slate-900">{selected.node}</div></div>
                    <div className="rounded bg-slate-50 py-1"><div className="text-[9px] text-slate-500">CPU</div><div className="font-bold text-blue-600">72%</div></div>
                    <div className="rounded bg-slate-50 py-1"><div className="text-[9px] text-slate-500">Mem</div><div className="font-bold text-amber-600">68%</div></div>
                    <div className="rounded bg-slate-50 py-1"><div className="text-[9px] text-slate-500">Storage</div><div className="font-bold text-violet-600">78%</div></div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Precheck Summary</div>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span className="text-emerald-600">Passed</span><span className="font-semibold">{selected.score * 2 + 51}</span></div>
                    <div className="flex justify-between"><span className="text-amber-600">Warning</span><span className="font-semibold">12</span></div>
                    <div className="flex justify-between"><span className="text-red-600">Failed</span><span className="font-semibold">4</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Risk Score</span><span className="font-semibold">{selected.score} / 100</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="text-[10px] font-semibold py-1.5 rounded bg-blue-600 text-white">Run Precheck</button>
                  <button className="text-[10px] font-semibold py-1.5 rounded bg-white border border-slate-200 text-slate-700">Repair Issues</button>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* AI Copilot floating button + panel */}
        <button onClick={() => setChatOpen(!chatOpen)} className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg grid place-items-center hover:scale-105 transition-transform z-40">
          <MessageSquare className="h-5 w-5" />
        </button>
        {chatOpen && (
          <div className="fixed bottom-24 right-6 w-80 rounded-xl border border-slate-200 bg-white shadow-2xl z-40 flex flex-col overflow-hidden">
            <div className="px-3 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4"/>NOVA AI Copilot</div>
              <button onClick={() => setChatOpen(false)}><X className="h-4 w-4"/></button>
            </div>
            <div className="p-3 space-y-2 text-[11px] max-h-72 overflow-y-auto">
              <div className="rounded-lg bg-slate-50 p-2 text-slate-700">Hello — I'm monitoring 18 Hadoop clusters. Ask me anything about readiness, HDFS, YARN, or tonight's ETL run.</div>
              <div className="text-[10px] text-slate-500 font-semibold">Try asking:</div>
              {["Is the cluster ready for production?","Will tonight's ETL fail?","Show HDFS issues.","Predict storage exhaustion.","Generate executive Hadoop report."].map((q) => (
                <button key={q} className="w-full text-left rounded bg-white border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50">{q}</button>
              ))}
            </div>
            <div className="p-2 border-t border-slate-200 flex items-center gap-1">
              <input className="flex-1 text-[11px] px-2 py-1.5 border border-slate-200 rounded" placeholder="Ask NOVA AI..."/>
              <button className="p-1.5 rounded bg-blue-600 text-white"><Send className="h-3.5 w-3.5"/></button>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
