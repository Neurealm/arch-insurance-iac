import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  ArrowLeft, KeyRound, Clock, ShieldCheck, ShieldAlert, Bot, Bell, Search,
  CheckCircle2, AlertTriangle, DollarSign, Zap, FileDown, RefreshCcw, Layers,
  Database, TrendingUp, Send, MessageSquare, Play, Wrench, Sparkles, Network,
  XCircle, Server, Users, Globe, Cpu, Radio, Gauge, Activity, Timer,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  Area, AreaChart, PieChart, Pie, Cell, Legend, ReferenceLine,
} from "recharts";

// ---------- Data ----------
const statusPills = [
  { l: "Operational Status",   v: "All Systems Normal", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  { l: "Assets Monitored",     v: "24,817" },
  { l: "Domain Controllers",   v: "86 Live" },
  { l: "Enterprise NTP Sources",v: "42" },
  { l: "Kerberos Health",      v: "Healthy", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  { l: "Auth TPM",             v: "142,318" },
  { l: "Hybrid Identity",      v: "Synchronized" },
  { l: "Last Sync Analysis",   v: "11 sec ago" },
  { l: "Prediction Engine",    v: "12 models · online" },
];

const kpis = [
  { icon: Clock,         l: "Enterprise Time Sync",           v: "99.98%",  sub: "Healthy",           color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: KeyRound,      l: "Kerberos Success Rate",          v: "99.97%",  sub: "Excellent",         color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Timer,         l: "Average Time Drift",             v: "42 ms",   sub: "-8 ms vs yday",     color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: AlertTriangle, l: "Devices Outside Tolerance",      v: "18",      sub: "-4 vs yesterday",   color: "text-amber-600",   bg: "bg-amber-50" },
  { icon: ShieldAlert,   l: "Critical Drift Events",          v: "2",       sub: "Immediate action",  color: "text-red-600",     bg: "bg-red-50" },
  { icon: XCircle,       l: "Authentication Failures (1h)",   v: "14",      sub: "-6 vs prior hour",  color: "text-orange-600",  bg: "bg-orange-50" },
  { icon: Bot,           l: "Automated Corrections",          v: "318",     sub: "+42 today",         color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Layers,        l: "Protected Business Services",    v: "412",     sub: "182 tier-1",        color: "text-blue-600",    bg: "bg-blue-50" },
  { icon: ShieldCheck,   l: "Certificate Synchronization",    v: "99.6%",   sub: "trailing 24h",      color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Gauge,         l: "Identity Risk Score",            v: "12 / 100",sub: "Low",               color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Clock,         l: "Downtime Prevented",             v: "121 h",   sub: "annualized",        color: "text-violet-600",  bg: "bg-violet-50" },
  { icon: ShieldCheck,   l: "Cyber Risk Reduction",           v: "-91%",    sub: "annualized",        color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Wrench,        l: "Mean Time to Repair",            v: "6.4 min", sub: "auto-remediated",   color: "text-blue-600",    bg: "bg-blue-50" },
  { icon: Timer,         l: "Mean Auth Latency",              v: "18 ms",   sub: "-2 ms vs 7d",       color: "text-emerald-600", bg: "bg-emerald-50" },
];

const timeSourceHealth = [
  { src: "GPS-Time-Appliance-01",    type: "GPS",           stratum: 1, offset: "+0.2 ms", jitter: "0.3 ms", latency: "0.8 ms", health: 100.0 },
  { src: "ntp01.corp.contoso.com",   type: "Primary NTP",   stratum: 2, offset: "+38 ms",  jitter: "0.4 ms", latency: "2.4 ms", health: 99.97 },
  { src: "ntp02.corp.contoso.com",   type: "Primary NTP",   stratum: 2, offset: "+850 ms", jitter: "1.6 ms", latency: "2.1 ms", health: 98.4  },
  { src: "ntp03.corp.contoso.com",   type: "Secondary NTP", stratum: 2, offset: "+45 ms",  jitter: "0.6 ms", latency: "2.6 ms", health: 99.96 },
  { src: "time.windows.com",         type: "Public NTP",    stratum: 3, offset: "+58 ms",  jitter: "4.2 ms", latency: "18 ms",  health: 99.60 },
  { src: "Azure-Time-Service",       type: "Cloud",         stratum: 2, offset: "+36 ms",  jitter: "1.9 ms", latency: "3.1 ms", health: 99.95 },
  { src: "AWS-Time-Sync",            type: "Cloud",         stratum: 2, offset: "+22 ms",  jitter: "2.3 ms", latency: "2.9 ms", health: 99.94 },
  { src: "PDC-Emulator (Forest)",    type: "DC (PDCe)",     stratum: 2, offset: "+29 ms",  jitter: "0.7 ms", latency: "1.8 ms", health: 99.98 },
  { src: "VMware-Tools-Sync",        type: "Hypervisor",    stratum: 3, offset: "+41 ms",  jitter: "2.6 ms", latency: "1.3 ms", health: 99.85 },
  { src: "Hyper-V-Time",             type: "Hypervisor",    stratum: 3, offset: "+37 ms",  jitter: "2.1 ms", latency: "1.5 ms", health: 99.83 },
];

const driftPrediction = [
  { host: "APP-SRV-075",  current: "1.2s",  proj: "2.8s",  fail: 92, risk: "Critical", app: "Order Mgmt",    users: 1240 },
  { host: "DB-SQL-021",   current: "850ms", proj: "1.9s",  fail: 78, risk: "High",     app: "Data Warehouse",users: 640  },
  { host: "WEB-FRONT-33", current: "620ms", proj: "1.3s",  fail: 65, risk: "High",     app: "Portal",        users: 3210 },
  { host: "DC-CH1-02",    current: "480ms", proj: "980ms", fail: 45, risk: "Medium",   app: "Identity",      users: 8420 },
  { host: "FS01-LON",     current: "410ms", proj: "820ms", fail: 32, risk: "Medium",   app: "File Services", users: 480  },
  { host: "APP-API-17",   current: "350ms", proj: "690ms", fail: 25, risk: "Medium",   app: "Public API",    users: 240  },
  { host: "WS-10234",     current: "280ms", proj: "540ms", fail: 18, risk: "Low",      app: "Endpoint",      users: 1    },
  { host: "LINUX-APP-09", current: "210ms", proj: "410ms", fail: 10, risk: "Low",      app: "Batch Jobs",    users: 24   },
];

const criticalDrift = [
  { host: "APP-SRV-075", offset: "+1.2s",  thr: "±500ms", trend: "↑", impact: "High",   svc: "Order Mgmt",   users: 1240, owner: "AppOps",   age: "18m" },
  { host: "DB-SQL-021",  offset: "+850ms", thr: "±500ms", trend: "↑", impact: "High",   svc: "Data WH",      users: 640,  owner: "DBA",      age: "42m" },
  { host: "WEB-FRONT-33",offset: "+620ms", thr: "±500ms", trend: "↑", impact: "High",   svc: "Portal",       users: 3210, owner: "Web Ops",  age: "1h 12m" },
  { host: "DC-CH1-02",   offset: "+480ms", thr: "±500ms", trend: "→", impact: "Medium", svc: "Identity",     users: 8420, owner: "IdOps",    age: "2h" },
  { host: "FS01-LON",    offset: "+420ms", thr: "±500ms", trend: "→", impact: "Medium", svc: "File Svc",     users: 480,  owner: "InfraOps", age: "3h 40m" },
  { host: "PRINT-SRV-11",offset: "-410ms", thr: "±500ms", trend: "↓", impact: "Low",    svc: "Print",        users: 210,  owner: "EUC",      age: "5h" },
  { host: "WS-22109",    offset: "-290ms", thr: "±500ms", trend: "→", impact: "Low",    svc: "Endpoint",     users: 1,    owner: "EUC",      age: "6h" },
  { host: "LINUX-APP-09",offset: "+210ms", thr: "±500ms", trend: "→", impact: "Low",    svc: "Batch",        users: 24,   owner: "InfraOps", age: "6h 40m" },
];

const aiRecs = [
  { title: "Force time sync on 18 devices",           conf: 96, impact: "High",    auto: true,  reduction: "-42% risk" },
  { title: "Repair W32Time on 7 servers",             conf: 92, impact: "High",    auto: true,  reduction: "-28% risk" },
  { title: "Change NTP source for 4 devices",         conf: 90, impact: "Medium",  auto: true,  reduction: "-18% risk" },
  { title: "Validate PDC Emulator health",            conf: 95, impact: "High",    auto: false, reduction: "-22% risk" },
  { title: "Repair Kerberos trust on 3 DCs",          conf: 89, impact: "High",    auto: true,  reduction: "-31% risk" },
  { title: "Synchronize Azure AD Connect",            conf: 88, impact: "Medium",  auto: true,  reduction: "-14% risk" },
  { title: "Rotate expiring certs (23 in 30 days)",   conf: 94, impact: "Critical",auto: false, reduction: "-38% risk" },
  { title: "Repair VMware Tools time sync (11 VMs)",  conf: 87, impact: "Medium",  auto: true,  reduction: "-12% risk" },
];

const kerberosMetrics = [
  { l: "TGT Requests (1h)",       v: "1.28M",   trend: "healthy" },
  { l: "Authentication Failures", v: "14",      trend: "warn"   },
  { l: "Clock Skew Events",       v: "18",      trend: "warn"   },
  { l: "NTLM Fallbacks",          v: "7",       trend: "healthy" },
  { l: "Expired Tickets",         v: "2,341",   trend: "healthy" },
  { l: "Cross-Domain Auth",       v: "12,851",  trend: "healthy" },
  { l: "Replay Detections",       v: "0",       trend: "healthy" },
  { l: "Avg Auth Latency",        v: "18 ms",   trend: "healthy" },
];

const identitySecurity = [
  { l: "Kerberos Replay Detection",     v: "0",  cls: "text-emerald-600" },
  { l: "Golden Ticket Indicators",      v: "0",  cls: "text-emerald-600" },
  { l: "Silver Ticket Indicators",      v: "0",  cls: "text-emerald-600" },
  { l: "Clock Manipulation Attempts",   v: "0",  cls: "text-emerald-600" },
  { l: "Certificate Expiring (<30 d)",  v: "23", cls: "text-amber-600" },
  { l: "TLS Cert Clock Skew Events",    v: "7",  cls: "text-amber-600" },
  { l: "JWT Timing Anomalies",          v: "3",  cls: "text-amber-600" },
  { l: "OAuth Token Expiration Issues", v: "5",  cls: "text-amber-600" },
  { l: "SAML Assertion Skew",           v: "2",  cls: "text-amber-600" },
  { l: "PKI Sync Failures",             v: "0",  cls: "text-emerald-600" },
  { l: "Secure Channel Broken",         v: "3",  cls: "text-red-600" },
  { l: "Defender for Identity Alerts",  v: "1",  cls: "text-red-600" },
];

const activityFeed = [
  { t: "12:34:45", tag: "Analyze",   msg: "Analyzed time hierarchy across 24,817 assets" },
  { t: "12:34:42", tag: "Detect",    msg: "Detected drift on APP-SRV-075 (+1.2s)" },
  { t: "12:34:40", tag: "Correlate", msg: "Correlated with Kerberos ticket failures" },
  { t: "12:34:38", tag: "Impact",    msg: "Calculated business impact: High · 1,240 users" },
  { t: "12:34:36", tag: "Predict",   msg: "Generated remediation recommendations · 92% confidence" },
  { t: "12:34:33", tag: "Execute",   msg: "Executed time sync on 18 devices · rollback ready" },
  { t: "12:34:29", tag: "Validate",  msg: "Validated Kerberos authentication on 8 DCs" },
  { t: "12:34:27", tag: "Change",    msg: "Updated ServiceNow incident INC0123456" },
  { t: "12:34:24", tag: "Report",    msg: "Generated executive time synchronization summary" },
];

const integrations = [
  "Active Directory","Entra ID","W32Time","Chrony","NTPsec","PTP","GPS Appliances",
  "Defender for Identity","Microsoft Sentinel","Azure Monitor","Azure Time",
  "AWS Time Sync","VMware vCenter","VMware Tools","Hyper-V","Cisco IOS","Cisco Nexus",
  "Palo Alto","F5 BIG-IP","Splunk","Cribl","Datadog","Dynatrace","ServiceNow","CrowdStrike",
];

const offsetTrend = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  offset: Math.round(30 + Math.sin(i / 3) * 18 + (i > 18 ? (i - 18) * 20 : 0)),
  jitter: Math.round(2 + Math.abs(Math.sin(i / 2)) * 4),
  delay:  Math.round(15 + Math.cos(i / 4) * 4),
  stability: 99.90 + Math.sin(i / 5) * 0.06,
}));

const authTrend = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  success: 99.9 - (i > 18 ? (i - 18) * 0.08 : 0) + Math.sin(i / 4) * 0.02,
  failures: 3 + (i > 18 ? (i - 18) * 3 : 0) + Math.round(Math.abs(Math.cos(i / 3)) * 2),
  latency: 16 + Math.round(Math.sin(i / 3) * 3 + (i > 18 ? (i - 18) * 1.2 : 0)),
}));

const buCompliance = [
  { bu: "Corporate IT",     pct: 99.99, drift: 2  },
  { bu: "Retail Operations",pct: 99.94, drift: 6  },
  { bu: "Manufacturing",    pct: 99.87, drift: 9  },
  { bu: "Healthcare",       pct: 99.96, drift: 4  },
  { bu: "Finance",          pct: 99.99, drift: 1  },
  { bu: "Cloud Services",   pct: 99.98, drift: 3  },
  { bu: "Development",      pct: 99.92, drift: 5  },
  { bu: "Field Offices",    pct: 99.78, drift: 12 },
];

const bizServices = [
  { svc: "Payments Auth",        risk: "High",     users: 12420, exposure: "$3.2M" },
  { svc: "Order Management",     risk: "High",     users: 8320,  exposure: "$2.4M" },
  { svc: "Customer Portal",      risk: "Medium",   users: 42180, exposure: "$1.8M" },
  { svc: "EHR / Clinical",       risk: "Critical", users: 6280,  exposure: "$4.6M" },
  { svc: "Manufacturing MES",    risk: "High",     users: 2140,  exposure: "$2.9M" },
  { svc: "Field Sync",           risk: "Medium",   users: 890,   exposure: "$0.6M" },
];

const investigationTabs = [
  "Executive Summary","Time Synchronization","Kerberos","Authentication","W32Time",
  "NTP","PTP","PDC Emulator","Certificates","PKI","Secure Channel","DNS",
  "Historical Trends","Configuration Drift","Dependency Graph","Knowledge Articles",
  "Runbooks","Automation","Change Requests","Export",
];

// ---------- Helpers ----------
function riskCls(r: string) {
  return r === "Critical" ? "text-red-700 bg-red-50 border-red-200"
    : r === "High" ? "text-orange-700 bg-orange-50 border-orange-200"
    : r === "Medium" ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-emerald-700 bg-emerald-50 border-emerald-200";
}

// ---------- Component ----------
export default function TimeDriftKerberosIntegrity() {
  const [selectedHost, setSelectedHost] = useState<string>("APP-SRV-075");
  const [investigation, setInvestigation] = useState<string | null>(null);
  const [copilotQ, setCopilotQ] = useState("");

  const selected = useMemo(() => criticalDrift.find(c => c.host === selectedHost) ?? criticalDrift[0], [selectedHost]);

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
          <div className="px-6 py-4 flex items-start gap-4">
            <Link to="/coworkers/infrastructure-automation" className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-600 uppercase tracking-wide">
                <Bot className="w-3.5 h-3.5" /> Digital Coworker
              </div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                Time Drift & Kerberos Integrity
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">AI POWERED</span>
              </h1>
              <p className="text-xs text-slate-600 mt-1 max-w-4xl">
                Continuously monitor enterprise time synchronization, Kerberos authentication integrity, secure time sources, certificate validity,
                and identity trust relationships to prevent authentication failures, security vulnerabilities, and business disruptions caused by clock drift.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />Global Search</button>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"><FileDown className="w-3.5 h-3.5" />Export</button>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"><RefreshCcw className="w-3.5 h-3.5" />Refresh</button>
              <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"><Bell className="w-4 h-4 text-slate-600" /></button>
            </div>
          </div>

          {/* Status pills */}
          <div className="px-6 pb-3 flex flex-wrap gap-2">
            {statusPills.map((p, i) => (
              <div key={i} className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${p.cls ?? "text-slate-700 bg-white border-slate-200"} flex items-center gap-1.5`}>
                {p.dot && <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />}
                <span className="text-slate-500 font-medium">{p.l}:</span>
                <span>{p.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* KPI grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {kpis.map((k) => (
              <div key={k.l} className="rounded-xl border border-slate-200 bg-white p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-slate-500 leading-tight">{k.l}</div>
                  <div className={`w-7 h-7 rounded-lg ${k.bg} flex items-center justify-center shrink-0 ml-1`}>
                    <k.icon className={`w-4 h-4 ${k.color}`} />
                  </div>
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1">{k.v}</div>
                <div className={`text-[11px] font-medium ${k.color}`}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Time sync + Kerberos dashboards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">Time Synchronization Dashboard</div>
                  <div className="text-[11px] text-slate-500">Offset · jitter · delay · stability (last 24h)</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">GPS · Stratum 1</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">Frequency +2.3 ppm</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { l: "Current Offset", v: "42 ms" },
                  { l: "Round-Trip",     v: "18 ms" },
                  { l: "Jitter",         v: "2.4 ms" },
                  { l: "Clock Stability",v: "99.996%" },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg border border-slate-100 p-2 text-center">
                    <div className="text-[10px] text-slate-500 font-semibold">{s.l}</div>
                    <div className="text-sm font-bold text-slate-900">{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={offsetTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gOff" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.32} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="h" tick={{ fontSize: 10, fill: "#64748b" }} interval={3} />
                    <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <ReferenceLine yAxisId="l" y={500} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Threshold ±500ms", fontSize: 10, fill: "#ef4444" }} />
                    <Area yAxisId="l" type="monotone" dataKey="offset" name="Offset (ms)" stroke="#3b82f6" fill="url(#gOff)" strokeWidth={2} />
                    <Line yAxisId="l" type="monotone" dataKey="jitter" name="Jitter (ms)" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line yAxisId="l" type="monotone" dataKey="delay"  name="Delay (ms)"  stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-blue-600" />Kerberos Integrity Dashboard</div>
                  <div className="text-[11px] text-slate-500">TGT · service tickets · KDC availability</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Success 99.97%</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { l: "TGT Success",  v: "99.98%" },
                  { l: "Service Ticket",v: "99.96%" },
                  { l: "PAC Validation",v: "99.97%" },
                  { l: "KDC Availability",v: "100%" },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg border border-slate-100 p-2 text-center">
                    <div className="text-[10px] text-slate-500 font-semibold">{s.l}</div>
                    <div className="text-sm font-bold text-slate-900">{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {kerberosMetrics.map((k) => (
                  <div key={k.l} className="flex items-center justify-between rounded-lg border border-slate-100 px-2 py-1.5 text-[11px]">
                    <span className="text-slate-600">{k.l}</span>
                    <span className={`font-bold ${k.trend === "warn" ? "text-amber-600" : "text-slate-900"}`}>{k.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Time hierarchy + Enterprise map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">Enterprise Time Synchronization Map</div>
                  <div className="text-[11px] text-slate-500">Forest → Domains → Sites → DCs → Servers → Workstations</div>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Healthy {"<"}100ms</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Minor 100–500</span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">Warning 500ms–2s</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">Critical {">"}2s</span>
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex flex-col items-center gap-1 text-[11px]">
                  <div className="w-9 h-9 rounded-full bg-white border border-emerald-300 flex items-center justify-center"><Globe className="w-4 h-4 text-emerald-600" /></div>
                  <div className="font-semibold text-slate-900">Enterprise · 1 GPS Reference</div>
                </div>
                <div className="mx-auto w-px h-4 bg-slate-300" />
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: "2 Forests",              icon: Layers,   color: "text-emerald-600" },
                    { l: "5 Domains",              icon: Layers,   color: "text-emerald-600" },
                    { l: "42 Sites",               icon: Network,  color: "text-emerald-600" },
                  ].map((n) => (
                    <div key={n.l} className="flex flex-col items-center text-[11px]">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center"><n.icon className={`w-4 h-4 ${n.color}`} /></div>
                      <div className="font-semibold text-slate-800 mt-1">{n.l}</div>
                    </div>
                  ))}
                </div>
                <div className="mx-auto w-px h-4 bg-slate-300" />
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { l: "86 Domain Controllers", tone: "emerald" },
                    { l: "509 Servers",           tone: "emerald" },
                    { l: "18,432 Workstations",   tone: "amber",  sub: "18 minor drift" },
                    { l: "1,790 Cloud Systems",   tone: "emerald" },
                  ].map((n) => (
                    <div key={n.l} className={`rounded-lg border p-2 text-center ${n.tone === "amber" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
                      <div className={`text-[11px] font-bold ${n.tone === "amber" ? "text-amber-700" : "text-emerald-700"}`}>{n.l}</div>
                      {n.sub && <div className="text-[10px] text-amber-700 mt-0.5">{n.sub}</div>}
                    </div>
                  ))}
                </div>
                <div className="mx-auto w-px h-4 bg-slate-300" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-center">
                    <div className="text-[11px] font-bold text-blue-700">1,248 Applications</div>
                    <div className="text-[10px] text-blue-700 mt-0.5">7 at authentication risk</div>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-center">
                    <div className="text-[11px] font-bold text-blue-700">412 Business Services</div>
                    <div className="text-[10px] text-blue-700 mt-0.5">3 tier-1 exposed</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">Enterprise Time Source Dashboard</div>
                  <div className="text-[11px] text-slate-500">42 sources · GPS anchor · cloud &amp; NTP hierarchy</div>
                </div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All</button>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="text-left px-2 py-1.5">Source</th>
                      <th className="text-left px-2 py-1.5">Type</th>
                      <th className="text-right px-2 py-1.5">Str</th>
                      <th className="text-right px-2 py-1.5">Offset</th>
                      <th className="text-right px-2 py-1.5">Jitter</th>
                      <th className="text-right px-2 py-1.5">Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSourceHealth.map((s) => (
                      <tr key={s.src} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-2 py-1.5 font-mono font-semibold text-slate-900 truncate max-w-[160px]">{s.src}</td>
                        <td className="px-2 py-1.5 text-slate-700">{s.type}</td>
                        <td className="px-2 py-1.5 text-right text-slate-700">{s.stratum}</td>
                        <td className={`px-2 py-1.5 text-right font-semibold ${s.offset.includes("850") ? "text-red-600" : "text-slate-700"}`}>{s.offset}</td>
                        <td className="px-2 py-1.5 text-right text-slate-700">{s.jitter}</td>
                        <td className={`px-2 py-1.5 text-right font-bold ${s.health >= 99.9 ? "text-emerald-600" : s.health >= 99.5 ? "text-amber-600" : "text-red-600"}`}>{s.health}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* AI Drift prediction + AI recs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-blue-600" />AI Drift Prediction · Top at Risk</div>
                  <div className="text-[11px] text-slate-500">Devices ranked by probability of authentication failure (24h)</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">Confidence 92%</span>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="text-left px-2 py-1.5">Hostname</th>
                      <th className="text-right px-2 py-1.5">Current Drift</th>
                      <th className="text-right px-2 py-1.5">Projected (24h)</th>
                      <th className="text-right px-2 py-1.5">Failure Prob.</th>
                      <th className="text-left px-2 py-1.5">Kerberos</th>
                      <th className="text-left px-2 py-1.5">Application</th>
                      <th className="text-right px-2 py-1.5">Users</th>
                      <th className="px-2 py-1.5">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driftPrediction.map((d) => (
                      <tr key={d.host}
                          onClick={() => { setSelectedHost(d.host); }}
                          className={`border-t border-slate-100 cursor-pointer ${selectedHost === d.host ? "bg-blue-50/60" : "hover:bg-slate-50"}`}>
                        <td className="px-2 py-1.5 font-mono font-semibold text-slate-900">{d.host}</td>
                        <td className="px-2 py-1.5 text-right text-slate-700">{d.current}</td>
                        <td className={`px-2 py-1.5 text-right font-semibold ${d.risk === "Critical" ? "text-red-600" : d.risk === "High" ? "text-orange-600" : "text-slate-700"}`}>{d.proj}</td>
                        <td className="px-2 py-1.5 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${d.fail >= 75 ? "bg-red-500" : d.fail >= 50 ? "bg-orange-500" : d.fail >= 25 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${d.fail}%` }} />
                            </div>
                            <span className="font-bold text-slate-800">{d.fail}%</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${riskCls(d.risk)}`}>{d.risk}</span>
                        </td>
                        <td className="px-2 py-1.5 text-slate-700">{d.app}</td>
                        <td className="px-2 py-1.5 text-right text-slate-700">{d.users.toLocaleString()}</td>
                        <td className="px-2 py-1.5 text-center">
                          <button onClick={(e) => { e.stopPropagation(); setInvestigation(d.host); }} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-600 text-white hover:bg-blue-700">Investigate</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-blue-600" />AI Recommendations</div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">Live</span>
              </div>
              <div className="space-y-2 max-h-[380px] overflow-auto pr-1">
                {aiRecs.map((r) => (
                  <div key={r.title} className="rounded-lg border border-slate-100 p-2.5 hover:shadow-sm">
                    <div className="text-[11px] font-semibold text-slate-900">{r.title}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span>Conf <span className="text-blue-600 font-bold">{r.conf}%</span></span>
                      <span>·</span>
                      <span>Impact <span className={`font-bold ${r.impact === "Critical" ? "text-red-600" : r.impact === "High" ? "text-orange-600" : "text-amber-600"}`}>{r.impact}</span></span>
                      <span>·</span>
                      <span className="text-emerald-600 font-semibold">{r.reduction}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button className="text-[10px] font-semibold px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"><Play className="w-3 h-3" />Execute</button>
                      <button className="text-[10px] font-semibold px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Approve</button>
                      {r.auto && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Automation</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Critical drift + Engineering panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">Critical Drift Investigation</div>
                  <div className="text-[11px] text-slate-500">Devices exceeding tolerance · click a row for engineering workspace</div>
                </div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All</button>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="text-left px-2 py-1.5">Hostname</th>
                      <th className="text-right px-2 py-1.5">Offset</th>
                      <th className="text-right px-2 py-1.5">Threshold</th>
                      <th className="text-center px-2 py-1.5">Trend</th>
                      <th className="text-left px-2 py-1.5">Kerberos Impact</th>
                      <th className="text-left px-2 py-1.5">Service</th>
                      <th className="text-right px-2 py-1.5">Users</th>
                      <th className="text-left px-2 py-1.5">Owner</th>
                      <th className="text-right px-2 py-1.5">Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criticalDrift.map((c) => (
                      <tr key={c.host}
                          onClick={() => { setSelectedHost(c.host); setInvestigation(c.host); }}
                          className={`border-t border-slate-100 cursor-pointer ${selectedHost === c.host ? "bg-blue-50/60" : "hover:bg-slate-50"}`}>
                        <td className="px-2 py-1.5 font-mono font-semibold text-slate-900">{c.host}</td>
                        <td className={`px-2 py-1.5 text-right font-semibold ${c.offset.includes("1.2") || c.offset.includes("850") ? "text-red-600" : c.offset.includes("620") ? "text-orange-600" : "text-slate-700"}`}>{c.offset}</td>
                        <td className="px-2 py-1.5 text-right text-slate-500">{c.thr}</td>
                        <td className={`px-2 py-1.5 text-center text-lg leading-none ${c.trend === "↑" ? "text-red-600" : c.trend === "↓" ? "text-emerald-600" : "text-slate-500"}`}>{c.trend}</td>
                        <td className="px-2 py-1.5">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${riskCls(c.impact)}`}>{c.impact}</span>
                        </td>
                        <td className="px-2 py-1.5 text-slate-700">{c.svc}</td>
                        <td className="px-2 py-1.5 text-right text-slate-700">{c.users.toLocaleString()}</td>
                        <td className="px-2 py-1.5 text-slate-700">{c.owner}</td>
                        <td className="px-2 py-1.5 text-right text-slate-500">{c.age}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Server className="w-4 h-4 text-blue-600" />Engineering Panel</div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">{selected.host}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                <div><div className="text-slate-500">Site / Region</div><div className="font-semibold text-slate-900">NY / US-East</div></div>
                <div><div className="text-slate-500">OS</div><div className="font-semibold text-slate-900">Windows Server 2022</div></div>
                <div><div className="text-slate-500">Time Zone</div><div className="font-semibold text-slate-900">UTC-05:00 EST</div></div>
                <div><div className="text-slate-500">Time Source</div><div className="font-mono font-semibold text-slate-900">ntp01.corp</div></div>
                <div><div className="text-slate-500">Current Drift</div><div className="font-semibold text-red-600">{selected.offset}</div></div>
                <div><div className="text-slate-500">Stratum</div><div className="font-semibold text-slate-900">2</div></div>
                <div><div className="text-slate-500">Jitter</div><div className="font-semibold text-slate-900">2.6 ms</div></div>
                <div><div className="text-slate-500">Round Trip</div><div className="font-semibold text-slate-900">18 ms</div></div>
                <div><div className="text-slate-500">KDC</div><div className="font-semibold text-slate-900">DC01.corp</div></div>
                <div><div className="text-slate-500">Ticket Cache</div><div className="font-semibold text-slate-900">2,431</div></div>
                <div><div className="text-slate-500">Clock Skew</div><div className="font-semibold text-orange-600">38 ms</div></div>
                <div><div className="text-slate-500">PAC Validation</div><div className="font-semibold text-emerald-600">Valid</div></div>
                <div><div className="text-slate-500">Certificates</div><div className="font-semibold text-amber-600">1 expiring 21d</div></div>
                <div><div className="text-slate-500">Secure Channel</div><div className="font-semibold text-emerald-600">Healthy</div></div>
                <div><div className="text-slate-500">CMDB CI</div><div className="font-mono font-semibold text-slate-900">CI-00087412</div></div>
                <div><div className="text-slate-500">Business Owner</div><div className="font-semibold text-slate-900">Identity Team</div></div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <button className="text-[10px] font-semibold px-2 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1"><RefreshCcw className="w-3 h-3" />Sync</button>
                <button className="text-[10px] font-semibold px-2 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1"><Wrench className="w-3 h-3" />W32Time</button>
                <button className="text-[10px] font-semibold px-2 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1"><KeyRound className="w-3 h-3" />Kerberos</button>
                <button className="text-[10px] font-semibold px-2 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1"><Zap className="w-3 h-3" />Automate</button>
              </div>
            </div>
          </div>

          {/* Auth trend + Identity security + BU compliance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-bold text-slate-900 mb-2">Authentication Trend (24h)</div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={authTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="h" tick={{ fontSize: 10, fill: "#64748b" }} interval={3} />
                    <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "#64748b" }} domain={[99, 100]} />
                    <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line yAxisId="l" type="monotone" dataKey="success"  name="Success %"    stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line yAxisId="r" type="monotone" dataKey="failures" name="Failures/min" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line yAxisId="r" type="monotone" dataKey="latency"  name="Latency ms"   stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-blue-600" />Identity Security</div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">1 Defender alert</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {identitySecurity.map((s) => (
                  <div key={s.l} className="flex items-center justify-between rounded-lg border border-slate-100 px-2 py-1.5 text-[11px]">
                    <span className="text-slate-600 truncate pr-1">{s.l}</span>
                    <span className={`font-bold ${s.cls}`}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-bold text-slate-900 mb-3">Sync Compliance by BU</div>
              <div className="space-y-1.5">
                {buCompliance.map((b) => (
                  <div key={b.bu}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 font-semibold truncate">{b.bu}</span>
                      <span className="text-slate-900 font-bold">{b.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${b.pct >= 99.95 ? "bg-emerald-500" : b.pct >= 99.85 ? "bg-lime-500" : "bg-amber-500"}`} style={{ width: `${b.pct}%` }} />
                    </div>
                    <div className="text-[10px] text-slate-500">{b.drift} devices out of tolerance</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Business services + Activity feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-bold text-slate-900 mb-3">Business Services at Risk</div>
              <div className="grid grid-cols-2 gap-2">
                {bizServices.map((s) => (
                  <div key={s.svc} className="rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-slate-900 truncate">{s.svc}</div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${riskCls(s.risk)}`}>{s.risk}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>Users <span className="text-slate-800 font-semibold">{s.users.toLocaleString()}</span></span>
                      <span>Exposure <span className="text-slate-800 font-semibold">{s.exposure}</span></span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/60 p-2.5 text-[11px] text-slate-700">
                <div className="font-semibold text-blue-800 mb-1">Authentication Dependency Chain</div>
                <div className="text-[10px] flex items-center gap-1 text-slate-600 flex-wrap">
                  <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">GPS</span>→
                  <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">PDCe</span>→
                  <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">DCs (86)</span>→
                  <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Kerberos</span>→
                  <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Apps (1,248)</span>→
                  <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Services (412)</span>→
                  <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Users (185K)</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-900">Digital Coworker Activity Feed</div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">Live · Replay</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                {activityFeed.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <div className="w-14 shrink-0 text-slate-500 font-mono">{a.t}</div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0">{a.tag}</span>
                    <div className="text-slate-800">{a.msg}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="text-[11px] font-semibold text-slate-700 mb-1.5">Enterprise Integrations</div>
                <div className="flex flex-wrap gap-1.5">
                  {integrations.map((i) => (
                    <span key={i} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200">{i}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Automation library */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Bot className="w-4 h-4 text-blue-600" />Automation Library</div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">13 workflows ready</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {[
                { n: "Force Time Sync",           t: "1 min",  r: true },
                { n: "Restart W32Time",           t: "2 min",  r: true },
                { n: "Restart Chrony",            t: "2 min",  r: true },
                { n: "Validate NTP Config",       t: "3 min",  r: false },
                { n: "Repair Secure Channel",     t: "5 min",  r: true },
                { n: "Repair Kerberos Trust",     t: "8 min",  r: true },
                { n: "Sync PDC Emulator",         t: "4 min",  r: true },
                { n: "Repair Azure AD Connect",   t: "12 min", r: true },
                { n: "Validate Certificates",     t: "3 min",  r: false },
                { n: "Repair PKI",                t: "14 min", r: true },
                { n: "Validate Time Hierarchy",   t: "6 min",  r: false },
                { n: "Time Health Report",        t: "2 min",  r: false },
                { n: "Create ServiceNow Incident",t: "1 min",  r: false },
              ].map((w) => (
                <div key={w.n} className="rounded-lg border border-slate-100 p-2 hover:bg-slate-50 hover:shadow-sm">
                  <div className="text-[11px] font-semibold text-slate-900">{w.n}</div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                    <span>~{w.t}</span>
                    {w.r && <span className="text-emerald-600 font-semibold">Rollback</span>}
                  </div>
                  <button className="mt-1 w-full text-[10px] font-semibold px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1"><Play className="w-3 h-3" />Run</button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Copilot */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center"><MessageSquare className="w-4 h-4" /></div>
              <div>
                <div className="text-sm font-bold text-slate-900">AI Copilot · Time & Identity</div>
                <div className="text-[11px] text-slate-500">Ask about clock drift, Kerberos, PDC health, certificate timing, and business impact</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                "Why are Kerberos failures increasing?",
                "Which systems have excessive clock drift?",
                "Predict authentication failures for the next 24 hours",
                "Show PDC Emulator health",
                "Recommend the best NTP architecture",
              ].map((q) => (
                <button key={q} onClick={() => setCopilotQ(q)} className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50">{q}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={copilotQ}
                onChange={(e) => setCopilotQ(e.target.value)}
                placeholder="Ask the Digital Coworker about time drift, Kerberos, or identity reliability…"
                className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="text-xs font-semibold px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"><Send className="w-3.5 h-3.5" />Ask</button>
            </div>
          </div>
        </div>

        {/* AI Investigation drawer */}
        {investigation && (
          <div className="fixed inset-0 z-40 bg-slate-900/40 flex justify-end" onClick={() => setInvestigation(null)}>
            <div className="w-full max-w-3xl bg-white h-full overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">AI Investigation Workspace</div>
                  <div className="text-sm font-bold text-slate-900">{investigation} · Clock drift &amp; Kerberos impact</div>
                </div>
                <button className="p-1.5 rounded-md hover:bg-slate-100" onClick={() => setInvestigation(null)}><XCircle className="w-4 h-4 text-slate-500" /></button>
              </div>
              <div className="px-5 py-3">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {investigationTabs.map((t, i) => (
                    <span key={t} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${i === 0 ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"}`}>{t}</span>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 p-3 mb-3">
                  <div className="text-[11px] font-semibold text-slate-500 mb-2">Executive Summary</div>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    <span className="font-mono font-semibold">{investigation}</span> is exceeding the Kerberos tolerance (±5 min) trend threshold with a current offset of
                    <span className="font-semibold text-red-600"> {selected.offset}</span> and a projected 24h drift that will trigger ticket rejection.
                    The device syncs from <span className="font-mono font-semibold">ntp02.corp.contoso.com</span>, which is currently reporting +850 ms offset and jitter above baseline.
                    The Digital Coworker has staged an automated remediation: repoint to <span className="font-mono font-semibold">ntp01.corp</span>, force W32Time resync,
                    validate Kerberos on the ticket cache, and confirm secure channel. Predicted successful correction: <span className="font-semibold text-emerald-600">94% confidence</span> within 6 minutes.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="text-[11px] font-semibold text-slate-500 mb-2">Root Cause Analysis</div>
                    <ul className="text-[11px] text-slate-800 space-y-1 list-disc pl-4">
                      <li>Primary NTP source ntp02 lost GPS lock at 12:04:17 UTC</li>
                      <li>W32Time fell back to time.windows.com (Stratum 3 · 58 ms)</li>
                      <li>VMware Tools time sync enabled — competing correction loop detected</li>
                      <li>PAC validation warnings observed on 3 KDC hops</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="text-[11px] font-semibold text-slate-500 mb-2">Recommended Automation</div>
                    <ul className="text-[11px] text-slate-800 space-y-1 list-disc pl-4">
                      <li>Repoint {investigation} to ntp01.corp (Stratum 2 · +38 ms)</li>
                      <li>Disable VMware Tools time sync on the VM (idempotent)</li>
                      <li>Force w32tm /resync /rediscover</li>
                      <li>Purge and re-issue Kerberos tickets · monitor 10 min</li>
                      <li>Open ServiceNow change ticket · attach evidence</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <div className="text-[11px] font-semibold text-slate-500 mb-2">Offset Trend (last 24h)</div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={offsetTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="h" tick={{ fontSize: 10, fill: "#64748b" }} interval={3} />
                        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        <ReferenceLine y={500} stroke="#ef4444" strokeDasharray="4 4" />
                        <Line dataKey="offset" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4">
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">Rollback Plan</button>
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">Export PDF</button>
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"><Play className="w-3.5 h-3.5" />Execute Remediation</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
