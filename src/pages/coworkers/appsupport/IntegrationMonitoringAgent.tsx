import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Workflow, CheckCircle2, AlertTriangle, XCircle, Activity, Cpu, HardDrive,
  Server, Shield, Zap, Clock, TrendingUp, Search, Bot, Sparkles, Bell,
  FileText, Play, RotateCcw, Wrench, GitBranch, Boxes, Network, Layers,
  X, MessageSquare, Send, Database, Radio, Cable,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadialBarChart, RadialBar,
} from "recharts";

const headerStats = [
  { l: "Operational Status", v: "Operational", s: "All Systems Normal", tone: "emerald" },
  { l: "Integrations Monitored", v: "18,462" },
  { l: "Applications Connected", v: "2,843" },
  { l: "Transactions Today", v: "186 Million" },
  { l: "Integration Platforms", v: "42" },
  { l: "API Endpoints", v: "6,842" },
  { l: "Message Brokers", v: "128" },
  { l: "Last Analysis", v: "5 Seconds Ago" },
  { l: "AI Operations Engine", v: "Active", tone: "emerald" },
  { l: "SLA Compliance", v: "99.87%", tone: "emerald" },
];

const kpis = [
  { l: "Overall Integration Health", v: "99.94%", sub: "Healthy", icon: CheckCircle2, tone: "emerald" },
  { l: "Failed Integrations",        v: "23",     sub: "Critical", icon: XCircle, tone: "red" },
  { l: "Degraded Integrations",      v: "112",    sub: "Degraded", icon: AlertTriangle, tone: "amber" },
  { l: "Transactions Processing",    v: "186M",   sub: "Today", icon: Activity, tone: "blue" },
  { l: "Success Rate",               v: "99.987%",sub: "Success", icon: CheckCircle2, tone: "emerald" },
  { l: "Avg Transaction Latency",    v: "118 ms", sub: "Average", icon: Clock, tone: "violet" },
  { l: "Message Queue Backlog",      v: "18,421", sub: "Messages", icon: Boxes, tone: "blue" },
  { l: "Automated Recoveries",       v: "482",    sub: "Today", icon: Wrench, tone: "emerald" },
  { l: "Business Services Impacted", v: "6",      sub: "Services", icon: AlertTriangle, tone: "red" },
  { l: "Downtime Prevented",         v: "428",    sub: "Hours / Annualized", icon: Clock, tone: "blue" },
  { l: "Annual Ops Savings",         v: "$11.2M", sub: "Annualized", icon: TrendingUp, tone: "emerald" },
  { l: "API Availability",           v: "99.98%", sub: "30-day", icon: Radio, tone: "emerald" },
  { l: "Platform Availability",      v: "99.96%", sub: "Uptime", icon: Server, tone: "emerald" },
  { l: "Business Workflow Success",  v: "98.9%",  sub: "24h", icon: Workflow, tone: "emerald" },
];

const toneMap: Record<string, { bg: string; text: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
  red:     { bg: "bg-red-50",     text: "text-red-600" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-600" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-600" },
  slate:   { bg: "bg-slate-100",  text: "text-slate-600" },
};

const flows = [
  { type: "REST APIs",         total: 6248,  healthy: 6128, proc: 48, delay: 22, fail: 16,  retry: 18, disabled: 4,  drift: 12, auto: "96%" },
  { type: "SOAP Services",     total: 1584,  healthy: 1548, proc: 16, delay: 10, fail: 6,   retry: 4,  disabled: 0,  drift: 8,  auto: "95%" },
  { type: "Kafka",             total: 2341,  healthy: 2256, proc: 32, delay: 24, fail: 12,  retry: 8,  disabled: 1,  drift: 8,  auto: "97%" },
  { type: "RabbitMQ",          total: 1892,  healthy: 1852, proc: 18, delay: 12, fail: 6,   retry: 4,  disabled: 0,  drift: 6,  auto: "94%" },
  { type: "Azure Service Bus", total: 1348,  healthy: 1312, proc: 14, delay: 8,  fail: 4,   retry: 6,  disabled: 0,  drift: 4,  auto: "96%" },
  { type: "IBM MQ",            total: 1156,  healthy: 1104, proc: 14, delay: 12, fail: 8,   retry: 12, disabled: 0,  drift: 16, auto: "90%" },
  { type: "Boomi",             total: 1487,  healthy: 1428, proc: 16, delay: 12, fail: 6,   retry: 8,  disabled: 0,  drift: 17, auto: "97%" },
  { type: "MuleSoft",          total: 1905,  healthy: 1846, proc: 22, delay: 16, fail: 6,   retry: 12, disabled: 0,  drift: 3,  auto: "96%" },
  { type: "Logic Apps",        total: 856,   healthy: 820,  proc: 12, delay: 10, fail: 4,   retry: 6,  disabled: 0,  drift: 4,  auto: "94%" },
  { type: "Power Automate",    total: 542,   healthy: 522,  proc: 8,  delay: 4,  fail: 2,   retry: 4,  disabled: 0,  drift: 2,  auto: "92%" },
  { type: "Webhooks",          total: 984,   healthy: 948,  proc: 20, delay: 4,  fail: 6,   retry: 4,  disabled: 0,  drift: 2,  auto: "95%" },
  { type: "Batch Jobs",        total: 784,   healthy: 732,  proc: 18, delay: 12, fail: 12,  retry: 6,  disabled: 0,  drift: 4,  auto: "91%" },
  { type: "File Transfers",    total: 1089,  healthy: 1032, proc: 18, delay: 14, fail: 6,   retry: 12, disabled: 0,  drift: 7,  auto: "96%" },
  { type: "SFTP",              total: 698,   healthy: 660,  proc: 8,  delay: 12, fail: 4,   retry: 8,  disabled: 0,  drift: 6,  auto: "95%" },
  { type: "EDI",               total: 432,   healthy: 404,  proc: 8,  delay: 6,  fail: 4,   retry: 4,  disabled: 0,  drift: 6,  auto: "90%" },
  { type: "GraphQL",           total: 226,   healthy: 216,  proc: 4,  delay: 2,  fail: 0,   retry: 2,  disabled: 0,  drift: 2,  auto: "96%" },
];

const txnTrend = Array.from({ length: 24 }).map((_, i) => ({
  t: `${(i).toString().padStart(2, "0")}:00`,
  tpm: 12000 + Math.sin(i / 3) * 3000 + i * 200,
  success: 11800 + Math.sin(i / 3) * 2800 + i * 200,
  failed: 30 + Math.abs(Math.sin(i / 4)) * 60,
}));

const risks = [
  { i: "Customer-360 Sync",       plat: "MuleSoft",   score: 92, risk: "In 2.4 Hours",  impact: "High",   conf: 88, owner: "Data Team" },
  { i: "Payment Authorization",   plat: "Kafka",      score: 88, risk: "In 6.1 Hours",  impact: "High",   conf: 88, owner: "Payments Team" },
  { i: "Inventory Update Feed",   plat: "RabbitMQ",   score: 77, risk: "In 8.7 Hours",  impact: "Medium", conf: 86, owner: "Inventory Team" },
  { i: "Claims Processing API",   plat: "Boomi",      score: 72, risk: "In 11.2 Hours", impact: "Medium", conf: 82, owner: "Claims Team" },
  { i: "Pricing Calculation API", plat: "Azure",      score: 81, risk: "In 13.8 Hours", impact: "Medium", conf: 78, owner: "Pricing Team" },
  { i: "Shipping Status Webhook", plat: "REST",       score: 68, risk: "In 15.6 Hours", impact: "Low",    conf: 76, owner: "Logistics Team" },
  { i: "Customer Notification",   plat: "Service Bus",score: 88, risk: "In 16.3 Hours", impact: "Medium", conf: 74, owner: "CRM Team" },
  { i: "Financial Reconciliation",plat: "IBM MQ",     score: 62, risk: "In 18.7 Hours", impact: "Medium", conf: 74, owner: "Finance Team" },
  { i: "EFT Sales Pipeline",      plat: "Informatica",score: 88, risk: "In 20.4 Hours", impact: "Medium", conf: 79, owner: "Sales Team" },
  { i: "Vendor EDI Feed",         plat: "SFTP",       score: 91, risk: "In 24.1 Hours", impact: "Low",    conf: 78, owner: "Vendor Mgmt" },
];

const platforms = [
  { p: "Boomi AtomSphere", h: "Healthy", n: 24, cpu: 32, mem: 41, q: 2184, lat: 112, fail: 2,  v: "23.1.2", drift: "No"  },
  { p: "MuleSoft Runtime", h: "Healthy", n: 18, cpu: 28, mem: 38, q: 1842, lat: 98,  fail: 1,  v: "4.6.0",  drift: "No"  },
  { p: "Azure Logic Apps", h: "Healthy", n: 32, cpu: 36, mem: 44, q: 1256, lat: 134, fail: 4,  v: "2.4.7",  drift: "No"  },
  { p: "Kafka Cluster",    h: "Healthy", n: 12, cpu: 38, mem: 40, q: 8642, lat: 86,  fail: 2,  v: "3.6.1",  drift: "No"  },
  { p: "RabbitMQ Cluster", h: "Warning", n: 10, cpu: 42, mem: 61, q: 3421, lat: 156, fail: 6,  v: "3.12.9", drift: "Yes" },
  { p: "IBM MQ",           h: "Healthy", n: 8,  cpu: 35, mem: 48, q: 1987, lat: 142, fail: 1,  v: "9.3.2",  drift: "No"  },
  { p: "TIBCO EMS",        h: "Warning", n: 6,  cpu: 48, mem: 65, q: 2312, lat: 184, fail: 8,  v: "8.6.1",  drift: "Yes" },
];

const recos = [
  { t: "Restart Integration: Customer-360 Sync",  conf: 92, impact: "High",   tx: "1.2M",  down: "3.2 hrs" },
  { t: "Replay Failed Messages: Payment Auth",    conf: 90, impact: "High",   tx: "842K",  down: "2.1 hrs" },
  { t: "Scale Consumers: Inventory Update Feed",  conf: 88, impact: "Medium", tx: "512K",  down: "1.8 hrs" },
  { t: "Repair OAuth Token: Notification Service",conf: 85, impact: "Medium", tx: "312K",  down: "1.2 hrs" },
  { t: "Clear DLQ: Shipping Status Webhook",      conf: 84, impact: "Medium", tx: "192K",  down: "54 mins" },
  { t: "Rotate Certificate: Claims Processing",   conf: 83, impact: "High",   tx: "156K",  down: "48 mins" },
];

const queues = [
  { p: "Kafka",           q: 1247, d: 8642, c: 312, prod: 156, s: "Healthy" },
  { p: "RabbitMQ",        q: 1264, d: 3421, c: 148, prod: 96,  s: "Warning" },
  { p: "Azure Service Bus", q: 642, d: 2184, c: 108, prod: 72, s: "Healthy" },
  { p: "IBM MQ",          q: 432,  d: 1987, c: 86,  prod: 64,  s: "Healthy" },
  { p: "AWS SQS",         q: 1256, d: 4321, c: 218, prod: 128, s: "Healthy" },
  { p: "AWS SNS",         q: 312,  d: 0,    c: 156, prod: 88,  s: "Healthy" },
  { p: "Google Pub/Sub",  q: 198,  d: 1428, c: 72,  prod: 58,  s: "Healthy" },
];

const etlDonut = [
  { name: "Running",   value: 142, color: "#10b981" },
  { name: "Completed", value: 312, color: "#3b82f6" },
  { name: "Failed",    value: 24,  color: "#ef4444" },
  { name: "Delayed",   value: 36,  color: "#f59e0b" },
  { name: "Cancelled", value: 18,  color: "#94a3b8" },
];

const activity = [
  { t: "12:34:45", ev: "Restarted consumer group 'inv-update-cg'",              s: "success" },
  { t: "12:34:12", ev: "Replayed 842,312 messages for Payment Auth",            s: "success" },
  { t: "12:33:58", ev: "Detected latency spike on Order-To-Cash API",           s: "warning" },
  { t: "12:33:31", ev: "Predicted failure for Customer-360 Sync",               s: "critical" },
  { t: "12:32:45", ev: "Cleared 2,184 messages from DLQ",                       s: "success" },
  { t: "12:32:21", ev: "Rotated expired certificate for Claims API",            s: "success" },
  { t: "12:31:55", ev: "Completed integration health assessment",               s: "success" },
];

const sidebar = [
  { l: "Overview", icon: Layers, active: true },
  { l: "Integration Topology", icon: Network },
  { l: "Integration Flows", icon: Workflow },
  { l: "Transaction Monitoring", icon: Activity },
  { l: "API Health", icon: Radio },
  { l: "Message Queues", icon: Boxes },
  { l: "ETL & Batch Jobs", icon: Database },
  { l: "Business Processes", icon: GitBranch },
  { l: "Platform Health", icon: Server },
  { l: "Alerts & Incidents", icon: Bell },
  { l: "AI Risk Prediction", icon: Sparkles },
  { l: "AI Recommendations", icon: Bot },
  { l: "Automation Center", icon: Wrench },
  { l: "Activity Feed", icon: Bell },
  { l: "Reports", icon: FileText },
  { l: "Dashboards", icon: TrendingUp },
  { l: "Integrations", icon: Cable },
];

const quickActions = [
  { l: "View All Alerts", icon: AlertTriangle },
  { l: "Replay Failed Messages", icon: RotateCcw },
  { l: "Restart Integration", icon: Play },
  { l: "Clear Queue", icon: Boxes },
  { l: "Create ServiceNow Incident", icon: FileText },
  { l: "Generate Integration Report", icon: FileText },
];

function Spark({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  const pts = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={22}>
      <LineChart data={pts}><Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} /></LineChart>
    </ResponsiveContainer>
  );
}

function sparkFor(seed: number, up = true) {
  return Array.from({ length: 7 }).map((_, i) => seed + Math.sin((i + seed) / 2) * 4 + (up ? i : -i));
}

export default function IntegrationMonitoringAgent() {
  const [selected, setSelected] = useState<{ n: string; plat: string; env: string; owner: string; ver: string } | null>({
    n: "Order-To-Cash API", plat: "MuleSoft", env: "Production", owner: "Order Management Team", ver: "1.4.7",
  });
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
                      <I className="h-3 w-3" /><span className="truncate">{a.l}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main */}
          <section className="flex-1 min-w-0 px-6 py-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">Integration Monitoring Agent</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-700 border border-violet-200">AI POWERED</span>
                </div>
                <p className="text-[12px] text-slate-600 mt-1 max-w-4xl leading-snug">
                  Mission: Continuously monitor enterprise integrations, APIs, event streams, message queues, ETL pipelines, middleware platforms,
                  and business workflows to ensure reliable, secure, and performant connectivity while proactively preventing transaction failures.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input placeholder="Search integration, API, queue, txn id..." className="w-64 pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white" />
                </div>
                <button className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] grid place-items-center font-bold">12</span>
                </button>
              </div>
            </div>

            {/* Header stats */}
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
                      <div className={`h-8 w-8 rounded-lg ${t.bg} ${t.text} grid place-items-center`}><Icon className="h-4 w-4" /></div>
                      <div className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${t.bg} ${t.text}`}>{k.sub}</div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2 font-medium truncate">{k.l}</div>
                    <div className={`text-xl font-extrabold ${t.text} leading-tight`}>{k.v}</div>
                    <div className="mt-1 h-4"><Spark data={sparkFor(60 + (k.l.length % 8), k.tone === "red" ? false : true)} color={t.text.includes("emerald") ? "#10b981" : t.text.includes("red") ? "#ef4444" : t.text.includes("amber") ? "#f59e0b" : t.text.includes("violet") ? "#8b5cf6" : "#3b82f6"} /></div>
                  </div>
                );
              })}
            </div>

            {/* Row 1: Topology / Flow Dashboard / Transaction Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
              <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-3">Enterprise Integration Topology</div>
                <div className="space-y-2 text-[11px]">
                  <div className="text-center py-1.5 rounded bg-slate-900 text-white font-semibold">Enterprise</div>
                  <div className="text-center text-slate-400">↓</div>
                  <div className="text-center text-[10px] uppercase font-bold text-slate-500">Business Domains</div>
                  <div className="grid grid-cols-4 gap-1">
                    {["Customer","Finance","HR","Supply Chain","IT","Sales","Ops","Legal"].map((r) => (
                      <div key={r} className="text-center py-1 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-semibold truncate">{r}</div>
                    ))}
                  </div>
                  <div className="text-center text-slate-400">↓</div>
                  <div className="text-center text-[10px] uppercase font-bold text-slate-500">Integration Platform</div>
                  <div className="grid grid-cols-4 gap-1">
                    {["Boomi","MuleSoft","Azure","Kafka","RabbitMQ","IBM MQ","TIBCO","AWS"].map((n) => (
                      <div key={n} className="text-center py-1 rounded bg-violet-50 text-violet-700 border border-violet-100 text-[10px] font-semibold">{n}</div>
                    ))}
                  </div>
                  <div className="text-center text-slate-400">↓</div>
                  <div className="text-center text-[10px] uppercase font-bold text-slate-500">External Systems</div>
                  <div className="grid grid-cols-5 gap-1 text-[9px] text-slate-600">
                    {["AWS","Azure","GCP","On-Prem","Partners","SaaS","SAP","Oracle","Salesforce","ServiceNow"].map((n) => (
                      <div key={n} className="text-center py-1 rounded bg-slate-50 border border-slate-200 truncate">{n}</div>
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

              <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-slate-800">Integration Flow Dashboard</div>
                  <div className="text-[10px] text-slate-500">{flows.length} flow types</div>
                </div>
                <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                  <table className="w-full text-[10px]">
                    <thead className="text-[9px] text-slate-500 uppercase sticky top-0 bg-white">
                      <tr>
                        <th className="text-left py-1">Flow Type</th>
                        <th className="text-right">Total</th>
                        <th className="text-right">Healthy</th>
                        <th className="text-right">Proc</th>
                        <th className="text-right">Delay</th>
                        <th className="text-right">Failed</th>
                        <th className="text-right">Retry</th>
                        <th className="text-right">Drift</th>
                        <th className="text-right">Auto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flows.map((f) => (
                        <tr key={f.type} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="py-1 font-medium text-slate-800">{f.type}</td>
                          <td className="py-1 text-right text-slate-700">{f.total.toLocaleString()}</td>
                          <td className="py-1 text-right text-emerald-600 font-semibold">{f.healthy.toLocaleString()}</td>
                          <td className="py-1 text-right text-blue-600">{f.proc}</td>
                          <td className="py-1 text-right text-amber-600">{f.delay}</td>
                          <td className="py-1 text-right text-red-600 font-semibold">{f.fail}</td>
                          <td className="py-1 text-right text-violet-600">{f.retry}</td>
                          <td className="py-1 text-right text-slate-600">{f.drift}</td>
                          <td className="py-1 text-right text-emerald-600 font-semibold">{f.auto}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="w-full mt-2 text-[10px] font-semibold text-blue-600 hover:underline">View All Integration Flows →</button>
              </div>

              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-slate-800">Transaction Monitoring (24h)</div>
                  <div className="flex text-[10px] gap-1">
                    {["24H","7D","30D"].map((r,i) => <button key={r} className={`px-1.5 py-0.5 rounded ${i === 0 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>{r}</button>)}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={90}>
                  <LineChart data={txnTrend}>
                    <XAxis dataKey="t" hide/><YAxis hide/>
                    <Tooltip contentStyle={{ fontSize: 11 }}/>
                    <Line type="monotone" dataKey="tpm" stroke="#3b82f6" strokeWidth={1.5} dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-[9px] text-slate-500 -mt-1">Transactions Per Minute</div>
                <ResponsiveContainer width="100%" height={70}>
                  <AreaChart data={txnTrend}>
                    <defs><linearGradient id="succ" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="t" hide/><YAxis hide/>
                    <Area type="monotone" dataKey="success" stroke="#10b981" fill="url(#succ)" strokeWidth={1.5}/>
                  </AreaChart>
                </ResponsiveContainer>
                <div className="text-[9px] text-slate-500 -mt-1">Successful Transactions</div>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={txnTrend}>
                    <XAxis dataKey="t" hide/><YAxis hide/>
                    <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={1.5} dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-[9px] text-slate-500 -mt-1">Failed Transactions</div>
                <div className="grid grid-cols-4 gap-1 mt-2 text-center text-[9px]">
                  <div><div className="text-slate-500">Total</div><div className="font-bold text-blue-600">186M</div></div>
                  <div><div className="text-slate-500">Success</div><div className="font-bold text-emerald-600">185.95M</div></div>
                  <div><div className="text-slate-500">Failed</div><div className="font-bold text-red-600">54,218</div></div>
                  <div><div className="text-slate-500">Rate</div><div className="font-bold text-emerald-600">99.987%</div></div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] space-y-1">
                  <div className="flex justify-between"><span className="text-slate-500">Retries</span><span className="font-semibold">312,845</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Avg Response</span><span className="font-semibold">118 ms</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">P95 / P99</span><span className="font-semibold">482 / 1,248 ms</span></div>
                </div>
              </div>
            </div>

            {/* Row 2: Risk / Queues / ETL / Business */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
              <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-2">AI Integration Risk Prediction (Top 10)</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead className="text-[9px] uppercase text-slate-500"><tr>
                      <th className="text-left py-1">Integration</th>
                      <th className="text-left">Platform</th>
                      <th className="text-left">Health</th>
                      <th className="text-left">Predicted</th>
                      <th className="text-left">Impact</th>
                      <th className="text-left">Conf</th>
                    </tr></thead>
                    <tbody>
                      {risks.map((r, i) => (
                        <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setSelected({ n: r.i, plat: r.plat, env: "Production", owner: r.owner, ver: "1.4.7" })}>
                          <td className="py-1 font-medium text-slate-800 truncate max-w-[110px]">{r.i}</td>
                          <td className="py-1 text-slate-600">{r.plat}</td>
                          <td className="py-1"><span className={`text-[9px] px-1 py-0.5 rounded font-bold ${r.score >= 85 ? "bg-emerald-50 text-emerald-700" : r.score >= 75 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{r.score}</span></td>
                          <td className="py-1 text-slate-600 truncate max-w-[80px]">{r.risk}</td>
                          <td className="py-1"><span className={`text-[9px] font-bold px-1 py-0.5 rounded ${r.impact === "High" ? "bg-red-50 text-red-700" : r.impact === "Medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{r.impact}</span></td>
                          <td className="py-1 text-slate-700">{r.conf}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="w-full mt-2 text-[10px] font-semibold text-blue-600 hover:underline">View All Risks →</button>
              </div>

              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-slate-800">Message Queue Dashboard</div>
                  <select className="text-[10px] border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-700"><option>All Platforms</option></select>
                </div>
                <table className="w-full text-[10px]">
                  <thead className="text-[9px] uppercase text-slate-500"><tr>
                    <th className="text-left">Platform</th><th className="text-right">Queues</th><th className="text-right">Depth</th><th className="text-right">Cons</th><th className="text-right">Prod</th><th className="text-left pl-2">Status</th>
                  </tr></thead>
                  <tbody>
                    {queues.map((q) => (
                      <tr key={q.p} className="border-t border-slate-100">
                        <td className="py-1 font-medium text-slate-800">{q.p}</td>
                        <td className="py-1 text-right text-slate-700">{q.q.toLocaleString()}</td>
                        <td className="py-1 text-right text-slate-700">{q.d.toLocaleString()}</td>
                        <td className="py-1 text-right text-slate-700">{q.c}</td>
                        <td className="py-1 text-right text-slate-700">{q.prod}</td>
                        <td className="py-1 pl-2"><span className={`inline-flex items-center gap-1 text-[9px] font-semibold ${q.s === "Healthy" ? "text-emerald-600" : "text-amber-600"}`}><span className={`h-1.5 w-1.5 rounded-full ${q.s === "Healthy" ? "bg-emerald-500" : "bg-amber-500"}`}/>{q.s}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="w-full mt-2 text-[10px] font-semibold text-blue-600 hover:underline">View All Queues →</button>
              </div>

              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-2">ETL & Batch Dashboard</div>
                <div className="grid place-items-center">
                  <ResponsiveContainer width={130} height={130}>
                    <PieChart>
                      <Pie data={etlDonut} dataKey="value" innerRadius={38} outerRadius={58} stroke="none">
                        {etlDonut.map((c) => <Cell key={c.name} fill={c.color}/>)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="-mt-20 text-center">
                    <div className="text-lg font-extrabold text-slate-900">532</div>
                    <div className="text-[9px] text-slate-500">Total Jobs</div>
                  </div>
                </div>
                <div className="mt-2 space-y-1 text-[10px]">
                  {etlDonut.map((e) => (
                    <div key={e.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: e.color }}/>{e.name}</span>
                      <span className="font-semibold text-slate-800">{e.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-3 text-center text-[9px]">
                  <div><div className="text-slate-500">Success</div><div className="font-bold text-emerald-600">94.2%</div></div>
                  <div><div className="text-slate-500">Runtime</div><div className="font-bold text-slate-800">24m 18s</div></div>
                  <div><div className="text-slate-500">SLA</div><div className="font-bold text-emerald-600">91.3%</div></div>
                </div>
              </div>

              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-2">Business Impact Dashboard</div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-600">Services at Risk</span><span className="font-bold text-red-600">6</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Applications Impacted</span><span className="font-bold text-slate-800">14</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Users Impacted</span><span className="font-bold text-slate-800">28,431</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Revenue at Risk (24h)</span><span className="font-bold text-emerald-600">$2.3M</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">SLA Compliance</span><span className="font-bold text-emerald-600">98.6%</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Operational Priority</span><span className="font-bold text-red-600">High</span></div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"/>High Impact</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"/>Medium</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Low</span>
                </div>
                <button className="w-full mt-2 text-[10px] font-semibold text-blue-600 hover:underline">View Impact Map →</button>
              </div>
            </div>

            {/* Row 3: AI Recos / Platform Health / Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
              <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-2">AI Recommendations (Top 6)</div>
                <table className="w-full text-[10px]">
                  <thead className="text-[9px] uppercase text-slate-500"><tr>
                    <th className="text-left">Recommendation</th><th>Conf</th><th>Impact</th><th>Recovered</th><th>Downtime</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {recos.map((r) => (
                      <tr key={r.t} className="border-t border-slate-100">
                        <td className="py-1 text-slate-800 truncate max-w-[130px]">{r.t}</td>
                        <td className="py-1 text-center text-emerald-600 font-bold">{r.conf}%</td>
                        <td className="py-1 text-center"><span className={`text-[9px] px-1 py-0.5 rounded ${r.impact === "High" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{r.impact}</span></td>
                        <td className="py-1 text-center text-slate-700">{r.tx}</td>
                        <td className="py-1 text-center text-slate-700">{r.down}</td>
                        <td className="py-1"><div className="flex gap-1"><button className="text-[9px] px-1 py-0.5 rounded bg-white border border-slate-200">Approve</button><button className="text-[9px] px-1 py-0.5 rounded bg-blue-600 text-white">Exec</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-2">Platform Health Dashboard</div>
                <table className="w-full text-[10px]">
                  <thead className="text-[9px] uppercase text-slate-500"><tr>
                    <th className="text-left">Platform</th><th>Health</th><th>Nodes</th><th>CPU</th><th>Memory</th><th>Queue Depth</th><th>Latency</th><th>Failures</th><th>Version</th><th>Drift</th>
                  </tr></thead>
                  <tbody>
                    {platforms.map((p) => (
                      <tr key={p.p} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-1 font-medium text-slate-800">{p.p}</td>
                        <td className="py-1 text-center"><span className={`text-[9px] font-semibold px-1 py-0.5 rounded ${p.h === "Healthy" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{p.h}</span></td>
                        <td className="py-1 text-center text-slate-700">{p.n}</td>
                        <td className="py-1 text-center text-slate-700">{p.cpu}%</td>
                        <td className="py-1 text-center text-slate-700">{p.mem}%</td>
                        <td className="py-1 text-center text-slate-700">{p.q.toLocaleString()}</td>
                        <td className="py-1 text-center text-slate-700">{p.lat} ms</td>
                        <td className="py-1 text-center text-red-600 font-semibold">{p.fail}</td>
                        <td className="py-1 text-center text-slate-600">{p.v}</td>
                        <td className="py-1 text-center"><span className={p.drift === "Yes" ? "text-red-600 font-semibold" : "text-slate-500"}>{p.drift}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="w-full mt-2 text-[10px] font-semibold text-blue-600 hover:underline">View All Platforms →</button>
              </div>

              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-2">Activity Feed (Live)</div>
                <div className="space-y-1.5 text-[10px]">
                  {activity.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 border-b border-slate-50 pb-1">
                      <span className={`h-2 w-2 rounded-full mt-1 shrink-0 ${a.s === "success" ? "bg-emerald-500" : a.s === "warning" ? "bg-amber-500" : "bg-red-500"}`}/>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-700 truncate">{a.ev}</div>
                        <div className="text-slate-400 text-[9px]">{a.t}</div>
                      </div>
                      <span className={`text-[9px] font-semibold ${a.s === "success" ? "text-emerald-600" : a.s === "warning" ? "text-amber-600" : "text-red-600"}`}>{a.s}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-2 text-[10px] font-semibold text-blue-600 hover:underline">View Full Activity →</button>
              </div>
            </div>

            {/* Footer strip */}
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between text-[11px] text-slate-600 flex-wrap gap-2">
              <div>Data Refreshed: <span className="font-semibold text-slate-800">5 Seconds Ago</span></div>
              <div className="flex gap-4">
                <span>18,462 Integrations</span>
                <span>2,843 Applications</span>
                <span>186M Transactions</span>
                <span>42 Platforms</span>
                <span>1,247 Pipelines</span>
                <span>6,842 APIs</span>
              </div>
              <div className="text-slate-400">© 2025 NOVA AI Digital Coworker</div>
            </div>
          </section>

          {/* Right-side panel */}
          {selected && (
            <aside className="w-72 shrink-0 bg-white border-l border-slate-200 min-h-screen p-4 sticky top-0 self-start hidden xl:block">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-800">Selected Integration</div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4"/></button>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Workflow className="h-4 w-4 text-blue-600"/>
                  <div className="font-bold text-slate-900 truncate">{selected.n}</div>
                  <span className="ml-auto text-[10px] font-semibold text-emerald-600">Healthy</span>
                </div>
                <div className="text-[10px] text-slate-500">REST API · {selected.plat}</div>
              </div>
              <div className="border-b border-slate-200 flex text-[10px] mb-3">
                {["Overview","Performance","Flow","Alerts","History"].map((t, i) => (
                  <button key={t} className={`px-2 py-1 font-semibold ${i === 0 ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500"}`}>{t}</button>
                ))}
              </div>
              <div className="space-y-3 text-[11px]">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">General</div>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span className="text-slate-600">Integration ID</span><span className="font-semibold">INT-API-10234</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Business Owner</span><span className="font-semibold truncate max-w-[140px]">{selected.owner}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Environment</span><span className="font-semibold">{selected.env}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Platform</span><span className="font-semibold">{selected.plat}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Version</span><span className="font-semibold">{selected.ver}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Source</span><span className="font-semibold">Order Service (Azure)</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Destination</span><span className="font-semibold">Billing Service (AWS)</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Last Deployed</span><span className="font-semibold">May 12, 2024</span></div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Real-time Performance</div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="rounded bg-slate-50 py-1"><div className="text-[9px] text-slate-500">Latency</div><div className="font-bold text-blue-600">102 ms</div></div>
                    <div className="rounded bg-slate-50 py-1"><div className="text-[9px] text-slate-500">TPM</div><div className="font-bold text-emerald-600">1,842</div></div>
                    <div className="rounded bg-slate-50 py-1"><div className="text-[9px] text-slate-500">Error</div><div className="font-bold text-amber-600">0.01%</div></div>
                    <div className="rounded bg-slate-50 py-1"><div className="text-[9px] text-slate-500">Uptime</div><div className="font-bold text-emerald-600">100%</div></div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Auth & Certs</div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-600">OAuth 2.0</span><span className="text-emerald-600 font-semibold">Active</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">JWT</span><span className="text-emerald-600 font-semibold">Valid</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">TLS 1.3</span><span className="text-emerald-600 font-semibold">Enabled</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Cert Expires</span><span className="text-slate-800 font-semibold">142 days</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="text-[10px] font-semibold py-1.5 rounded bg-blue-600 text-white">Investigate</button>
                  <button className="text-[10px] font-semibold py-1.5 rounded bg-white border border-slate-200 text-slate-700">Restart</button>
                </div>
              </div>
            </aside>
          )}
        </div>

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
              <div className="rounded-lg bg-slate-50 p-2 text-slate-700">I'm monitoring 18,462 enterprise integrations. Ask about queue depth, API latency, or predicted failures.</div>
              <div className="text-[10px] text-slate-500 font-semibold">Try asking:</div>
              {["Why is this integration failing?","Show delayed messages.","Predict queue exhaustion.","Which integrations will fail next?","Why is Kafka lag increasing?"].map((q) => (
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
