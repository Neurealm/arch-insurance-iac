import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  ArrowLeft, Activity, Server, Shield, ShieldCheck, ShieldAlert, KeyRound, Users,
  Network, Globe, Database, Bot, Play, Sparkles, AlertTriangle, CheckCircle2,
  Clock, DollarSign, FileDown, Search, RefreshCcw, Send, Wrench, Layers,
  RadioTower, Cpu, HardDrive, Fingerprint, Lock, Cloud, Route, GitBranch,
  Timer, Gauge, MapPin, BookOpen,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceLine, Legend, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

// ---------- Data ----------
const statusPills = [
  { l: "Operational Status",       v: "Operational",   cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  { l: "Forest Health",            v: "Healthy",       cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  { l: "Domains",                  v: "5" },
  { l: "Sites",                    v: "42" },
  { l: "Domain Controllers",       v: "86" },
  { l: "Global Catalogs",          v: "38" },
  { l: "Replication Links",        v: "214" },
  { l: "Hybrid Identity",          v: "Synced" },
  { l: "Last Replication Analysis",v: "18s ago" },
  { l: "Auth Tx / min",            v: "124,318" },
];

const kpis = [
  { icon: Activity,     l: "AD Health Score",              v: "99.6%",  sub: "Healthy",              color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: RadioTower,   l: "Replication Success",          v: "99.98%", sub: "Excellent",            color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: KeyRound,     l: "Authentication Success",       v: "99.94%", sub: "Excellent",            color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Server,       l: "Healthy DCs",                  v: "86 / 86",sub: "100% Available",       color: "text-blue-600",    bg: "bg-blue-50" },
  { icon: Timer,        l: "Replication Latency",          v: "18 sec", sub: "Average",              color: "text-blue-600",    bg: "bg-blue-50" },
  { icon: ShieldCheck,  l: "Kerberos Health",              v: "Healthy",sub: "No issues",            color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: AlertTriangle,l: "Identity Risks",               v: "3",      sub: "+1 vs yesterday",      color: "text-red-600",     bg: "bg-red-50" },
  { icon: ShieldAlert,  l: "Security Alerts",              v: "5",      sub: "1 critical",           color: "text-orange-600",  bg: "bg-orange-50" },
  { icon: AlertTriangle,l: "Replication Failures",         v: "1",      sub: "1 site link delayed",  color: "text-amber-600",   bg: "bg-amber-50" },
  { icon: HardDrive,    l: "SYSVOL Health",                v: "Healthy",sub: "DFSR converged",       color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Globe,        l: "DNS Health",                   v: "Healthy",sub: "All zones resolving",  color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Cloud,        l: "Hybrid Sync",                  v: "Healthy",sub: "Entra Connect OK",     color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Bot,          l: "Automated Remediations",       v: "42",     sub: "+8 vs yesterday",      color: "text-blue-600",    bg: "bg-blue-50" },
  { icon: Clock,        l: "Est. Downtime Prevented",      v: "143 h",  sub: "annualized",           color: "text-violet-600",  bg: "bg-violet-50" },
  { icon: DollarSign,   l: "Est. Risk Prevented",          v: "$8.6M",  sub: "annualized",           color: "text-emerald-600", bg: "bg-emerald-50" },
];

type Sev = "Critical" | "High" | "Medium" | "Low";
const replication: {
  src: string; dst: string; success: string; latency: string; last: string;
  pending: number; failures: number; usn: string; conf: Sev;
}[] = [
  { src: "DC01.corp.contoso.com", dst: "DC02.corp.contoso.com", success: "100%",   latency: "12 sec", last: "18 sec ago",  pending: 0,  failures: 0, usn: "99.99%", conf: "Low" },
  { src: "DC02.corp.contoso.com", dst: "DC03.corp.contoso.com", success: "100%",   latency: "14 sec", last: "26 sec ago",  pending: 0,  failures: 0, usn: "99.98%", conf: "Low" },
  { src: "DC03.corp.contoso.com", dst: "DC04.corp.contoso.com", success: "99.6%",  latency: "3m 12s", last: "3 min ago",   pending: 12, failures: 1, usn: "99.65%", conf: "Medium" },
  { src: "DC04.corp.contoso.com", dst: "DC05.corp.contoso.com", success: "100%",   latency: "9 sec",  last: "11 sec ago",  pending: 0,  failures: 0, usn: "99.99%", conf: "Low" },
  { src: "DC05.corp.contoso.com", dst: "DC01.corp.contoso.com", success: "100%",   latency: "16 sec", last: "19 sec ago",  pending: 0,  failures: 0, usn: "99.97%", conf: "Low" },
  { src: "eu.contoso.com/DC11",   dst: "corp.contoso.com/DC01", success: "99.9%",  latency: "44 sec", last: "48 sec ago",  pending: 2,  failures: 0, usn: "99.91%", conf: "Low" },
  { src: "apac.contoso.com/DC21", dst: "corp.contoso.com/DC01", success: "99.7%",  latency: "1m 08s", last: "1 min ago",   pending: 4,  failures: 0, usn: "99.72%", conf: "Medium" },
];

const authTrend = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  success: 99.4 + Math.sin(i / 3) * 0.35 + (i === 14 ? -0.6 : 0),
  latency: 18 + Math.cos(i / 4) * 4 + (i === 14 ? 12 : 0),
}));

const replicationTrend = Array.from({ length: 30 }, (_, i) => ({
  d: `D${i + 1}`,
  intra: 14 + Math.sin(i / 3) * 3,
  inter: 42 + Math.cos(i / 4) * 8,
  p95: 68 + Math.sin(i / 2) * 6,
}));

const identityRisks: { risk: string; impact: Sev; conf: number; affected: string; auto: boolean }[] = [
  { risk: "Replication latency detected on 2 site links",  impact: "Critical", conf: 96, affected: "324 objects",     auto: true  },
  { risk: "Lingering objects detected in eu.contoso.com",  impact: "Critical", conf: 94, affected: "1 domain",        auto: true  },
  { risk: "Kerberos pre-auth failures (user logon impact)",impact: "High",     conf: 91, affected: "142 accounts",    auto: false },
  { risk: "SYSVOL DFSR backlog on DC07",                   impact: "High",     conf: 89, affected: "Group Policy",    auto: true  },
  { risk: "Time drift detected on DC11 (+38s)",            impact: "Medium",   conf: 87, affected: "Kerberos w5",     auto: true  },
  { risk: "Certificate expiring in 14 days (ADFS token)",  impact: "Medium",   conf: 99, affected: "SSO federation",  auto: false },
  { risk: "AS-REP roasting attempt detected",              impact: "High",     conf: 92, affected: "3 accounts",      auto: false },
];

const recommendations = [
  { name: "Repair replication link DC03 → DC04",  conf: 98, impact: "High",   auto: true  },
  { name: "Synchronize SYSVOL on DC04",           conf: 96, impact: "High",   auto: true  },
  { name: "Transfer PDC Emulator role",           conf: 94, impact: "High",   auto: false },
  { name: "Correct time drift on DC11",           conf: 92, impact: "Medium", auto: true  },
  { name: "Remove lingering objects (eu.contoso)",conf: 90, impact: "High",   auto: true  },
  { name: "Rotate ADFS token signing certificate",conf: 88, impact: "High",   auto: false },
];

const dcHealth: { dc: string; site: string; ip: string; os: string; role: string; cpu: number; mem: number; risk: Sev }[] = [
  { dc: "DC01.corp.contoso.com", site: "New York",  ip: "10.10.10.21", os: "Win Server 2022", role: "Schema Master, PDC",   cpu: 22, mem: 41, risk: "Low"     },
  { dc: "DC02.corp.contoso.com", site: "New York",  ip: "10.10.10.22", os: "Win Server 2022", role: "GC",                   cpu: 28, mem: 44, risk: "Low"     },
  { dc: "DC03.corp.contoso.com", site: "New York",  ip: "10.10.10.23", os: "Win Server 2019", role: "GC, RID Master",       cpu: 51, mem: 62, risk: "Medium"  },
  { dc: "DC04.corp.contoso.com", site: "London",    ip: "10.20.10.11", os: "Win Server 2019", role: "GC, Infra Master",     cpu: 34, mem: 48, risk: "Medium"  },
  { dc: "DC05.corp.contoso.com", site: "London",    ip: "10.20.10.12", os: "Win Server 2022", role: "GC",                   cpu: 26, mem: 39, risk: "Low"     },
  { dc: "DC11.eu.contoso.com",   site: "Frankfurt", ip: "10.30.10.14", os: "Win Server 2019", role: "GC, Domain Naming",    cpu: 38, mem: 55, risk: "High"    },
  { dc: "DC21.apac.contoso.com", site: "Tokyo",     ip: "10.40.10.11", os: "Win Server 2022", role: "GC",                   cpu: 44, mem: 61, risk: "Medium"  },
  { dc: "DC22.apac.contoso.com", site: "Singapore", ip: "10.40.20.11", os: "Win Server 2022", role: "GC",                   cpu: 31, mem: 47, risk: "Low"     },
];

const forestSummary = [
  { l: "Forest Functional Level",  v: "Windows Server 2016" },
  { l: "Domain Functional Level",  v: "Windows Server 2016" },
  { l: "Schema Master",            v: "DC01.corp.contoso.com" },
  { l: "Domain Naming Master",     v: "DC01.corp.contoso.com" },
  { l: "PDC Emulator",             v: "DC01.corp.contoso.com" },
  { l: "RID Master",               v: "DC03.corp.contoso.com" },
  { l: "Infrastructure Master",    v: "DC04.corp.contoso.com" },
  { l: "Last Schema Update",       v: "5 days ago" },
  { l: "Global Catalogs",          v: "38 / 38 Online" },
  { l: "DNS Health",               v: "Healthy" },
  { l: "SYSVOL Health",            v: "Healthy" },
  { l: "NETLOGON Health",          v: "Healthy" },
];

const siteHealth: { site: string; dcs: number; health: string; latency: string }[] = [
  { site: "New York",  dcs: 12, health: "Healthy", latency: "14 sec" },
  { site: "London",    dcs: 10, health: "Healthy", latency: "16 sec" },
  { site: "Tokyo",     dcs: 8,  health: "Healthy", latency: "18 sec" },
  { site: "Sydney",    dcs: 6,  health: "Warning", latency: "2m 12s" },
  { site: "Singapore", dcs: 6,  health: "Healthy", latency: "20 sec" },
  { site: "Frankfurt", dcs: 6,  health: "Healthy", latency: "22 sec" },
];

const security = [
  { l: "Golden Ticket",        v: 0, color: "text-emerald-600" },
  { l: "Silver Ticket",        v: 0, color: "text-emerald-600" },
  { l: "DCShadow",             v: 0, color: "text-emerald-600" },
  { l: "DCSync",               v: 1, color: "text-orange-600" },
  { l: "Pass-the-Hash",        v: 0, color: "text-emerald-600" },
  { l: "Pass-the-Ticket",      v: 0, color: "text-emerald-600" },
  { l: "Kerberoasting",        v: 2, color: "text-amber-600" },
  { l: "AS-REP Roasting",      v: 1, color: "text-orange-600" },
  { l: "LDAP Enumeration",     v: 3, color: "text-amber-600" },
  { l: "Password Spraying",    v: 0, color: "text-emerald-600" },
  { l: "Tier-0 Group Changes", v: 1, color: "text-orange-600" },
  { l: "GPO Changes",          v: 4, color: "text-blue-600" },
];

const activity = [
  { t: "09:42", e: "Analyzed replication topology across 5 domains",         s: "AI" },
  { t: "09:42", e: "Detected replication latency on DC03 → DC04",            s: "AI" },
  { t: "09:43", e: "Correlated with SYSVOL DFSR backlog",                    s: "AI" },
  { t: "09:43", e: "Calculated business impact: High (324 objects)",         s: "AI" },
  { t: "09:44", e: "Generated recommendation: repair replication link",      s: "AI" },
  { t: "09:44", e: "Executed repadmin /syncall DC03",                        s: "Automation" },
  { t: "09:45", e: "Validation successful — link healthy",                   s: "Automation" },
  { t: "09:45", e: "Closed risk record #AD-1427",                            s: "System" },
  { t: "09:46", e: "Updated ServiceNow CI (Forest: corp.contoso.com)",       s: "System" },
];

const integrations = [
  "Active Directory", "Microsoft Entra ID", "Entra Connect", "Windows Server",
  "DNS", "DHCP", "Group Policy", "AD CS", "Defender for Identity", "Microsoft Sentinel",
  "Azure Monitor", "Log Analytics", "ServiceNow", "Datadog", "Dynatrace", "Splunk",
  "CyberArk", "BeyondTrust", "Okta", "Ping Identity", "CrowdStrike", "Rubrik",
];

const investigationTabs = [
  "Executive Summary", "Replication", "Authentication", "DNS", "Kerberos", "LDAP",
  "SYSVOL", "NETLOGON", "FSMO", "Topology", "Trust Relationships", "Security Events",
  "Hybrid Identity", "Configuration Drift", "Historical Comparison", "Dependency Graph",
  "Knowledge Articles", "Runbooks", "Automation", "Change Requests",
];

const automation = [
  "Run Repadmin", "Run Dcdiag", "Force Replication", "Restart KCC",
  "Repair SYSVOL", "Repair NETLOGON", "Validate DNS", "Repair Secure Channel",
  "Transfer FSMO", "Seize FSMO", "Promote DC", "Demote DC",
  "Repair Trust", "Repair Entra Connect", "Validate Certificates", "Generate Health Report",
];

const hybridSync = [
  { l: "Entra Connect",         v: "Healthy",  sub: "Delta sync 3m ago" },
  { l: "Password Hash Sync",    v: "Healthy",  sub: "Latency 42s" },
  { l: "Pass-through Auth",     v: "Healthy",  sub: "3 agents online" },
  { l: "Cloud Sync",            v: "Healthy",  sub: "OU-scoped" },
  { l: "Federation (ADFS)",     v: "Healthy",  sub: "Token cert 14d" },
  { l: "Conditional Access",    v: "Enforced", sub: "128 policies" },
  { l: "Cloud Kerberos Trust",  v: "Healthy",  sub: "Enabled" },
  { l: "Hybrid Join",           v: "Healthy",  sub: "98.6% coverage" },
];

const riskCls = (r: Sev) =>
  r === "Critical" ? "text-red-700 bg-red-50 border-red-200" :
  r === "High"     ? "text-orange-700 bg-orange-50 border-orange-200" :
  r === "Medium"   ? "text-amber-700 bg-amber-50 border-amber-200" :
                     "text-emerald-700 bg-emerald-50 border-emerald-200";

const healthCls = (h: string) =>
  h === "Healthy" ? "text-emerald-700" :
  h === "Warning" ? "text-amber-700" :
                    "text-red-700";

// ---------- Page ----------
export default function ActiveDirectoryHealthReplication() {
  const [selectedDc, setSelectedDc] = useState(dcHealth[2]);
  const [tab, setTab] = useState(investigationTabs[0]);
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "I'm monitoring 86 domain controllers across 5 domains and 42 sites. Replication latency detected between DC03 → DC04 (3m 12s). Would you like me to run repadmin /syncall to remediate?" },
  ]);

  const totalDcs = dcHealth.length;
  const donut = useMemo(() => ([
    { name: "Healthy",  value: 80, color: "#10b981" },
    { name: "Warning",  value: 4,  color: "#f59e0b" },
    { name: "Critical", value: 2,  color: "#ef4444" },
    { name: "Offline",  value: 0,  color: "#94a3b8" },
  ]), []);

  const send = () => {
    if (!chat.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text: chat },
      { role: "ai", text: "Analyzed replication metadata, DFSR backlog, KCC topology, and DNS resolution. Root cause: transient WAN latency on Site Link NY↔LON combined with SYSVOL backlog on DC04. Confidence 96%. Recommend: force replication + rebuild inbound connections. Automation ready." },
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
                <Fingerprint className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Digital Coworker</div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">Active Directory Health &amp; Replication</h1>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search users, DCs, sites, GPOs, FSMO…"
                  className="pl-7 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg w-80 focus:outline-none focus:border-blue-400"
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
          <div className="px-6 pb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] border-t border-slate-100 pt-2">
            <p className="text-slate-600 max-w-3xl leading-snug">
              <span className="font-semibold text-slate-800">Mission:</span> Continuously monitor the health, security, replication, authentication, and configuration of Active Directory to proactively identify identity infrastructure risks, ensure replication integrity, maintain authentication reliability, and protect enterprise access services.
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
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-3">
            {kpis.map((k) => (
              <div key={k.l} className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-tight">{k.l}</div>
                  <div className={`h-7 w-7 rounded-lg grid place-items-center ${k.bg} ${k.color}`}>
                    <k.icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className={`mt-2 text-2xl font-bold ${k.color}`}>{k.v}</div>
                <div className="text-[10px] font-medium text-slate-500">{k.sub}</div>
              </div>
            ))}
          </section>

          {/* Topology + Replication Matrix + DC Health donut */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Topology */}
            <div className="xl:col-span-4 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-900">Active Directory Topology</div>
                <span className="text-[10px] text-slate-500 font-semibold">Forest · corp.contoso.com</span>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                  <GitBranch className="h-3.5 w-3.5 text-blue-600" /> corp.contoso.com <span className="text-[10px] text-slate-500 font-normal">(Forest Root)</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2 text-center">
                {[
                  { d: "corp.contoso.com", t: "Root", sites: 12, dcs: 28 },
                  { d: "eu.contoso.com",   t: "Child", sites: 8, dcs: 16 },
                  { d: "na.contoso.com",   t: "Child", sites: 10, dcs: 20 },
                  { d: "apac.contoso.com", t: "Child", sites: 7, dcs: 14 },
                  { d: "lab.contoso.com",  t: "Child", sites: 5, dcs: 8 },
                ].map((n) => (
                  <div key={n.d} className="rounded-lg border border-slate-200 p-2 hover:border-blue-300 cursor-pointer">
                    <Layers className="h-4 w-4 text-blue-600 mx-auto" />
                    <div className="text-[10px] font-semibold text-slate-800 mt-1 truncate">{n.d}</div>
                    <div className="text-[9px] text-slate-500">{n.t}</div>
                    <div className="text-[9px] text-slate-600 mt-1">{n.sites} Sites · {n.dcs} DCs</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px]">
                {[
                  { l: "Global Catalogs", v: 38, i: Database },
                  { l: "RODCs",            v: 12, i: Shield },
                  { l: "FSMO Roles",       v: 5,  i: KeyRound },
                  { l: "Sites",            v: 42, i: MapPin },
                  { l: "Trusts",           v: 18, i: Route },
                  { l: "Applications",     v: 324, i: Layers },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg bg-slate-50 border border-slate-100 p-2">
                    <s.i className="h-3.5 w-3.5 mx-auto text-slate-600" />
                    <div className="text-slate-500 mt-1">{s.l}</div>
                    <div className="text-sm font-bold text-slate-800">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Replication Matrix */}
            <div className="xl:col-span-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div>
                  <div className="text-sm font-bold text-slate-900">Replication Health Matrix</div>
                  <div className="text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Healthy</span>
                    <span className="inline-flex items-center gap-1 ml-3"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Warning</span>
                    <span className="inline-flex items-center gap-1 ml-3"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />Failed</span>
                    <span className="inline-flex items-center gap-1 ml-3"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />Not Attempted</span>
                  </div>
                </div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View Full Matrix →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold">Source DC</th>
                      <th className="text-left py-2 px-3 font-semibold">Destination DC</th>
                      <th className="text-left py-2 px-3 font-semibold">Success</th>
                      <th className="text-left py-2 px-3 font-semibold">Latency</th>
                      <th className="text-left py-2 px-3 font-semibold">Last Sync</th>
                      <th className="text-right py-2 px-3 font-semibold">Pending</th>
                      <th className="text-right py-2 px-3 font-semibold">Failures</th>
                      <th className="text-left py-2 px-3 font-semibold">USN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {replication.map((r, i) => (
                      <tr key={i} className="border-t border-slate-100 hover:bg-blue-50/50 cursor-pointer">
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-700">{r.src}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-700">{r.dst}</td>
                        <td className={`py-2 px-3 font-semibold ${r.success === "100%" ? "text-emerald-600" : "text-amber-600"}`}>{r.success}</td>
                        <td className="py-2 px-3 text-slate-700">{r.latency}</td>
                        <td className="py-2 px-3 text-slate-600">{r.last}</td>
                        <td className={`py-2 px-3 text-right font-semibold ${r.pending > 0 ? "text-amber-600" : "text-slate-600"}`}>{r.pending}</td>
                        <td className={`py-2 px-3 text-right font-semibold ${r.failures > 0 ? "text-red-600" : "text-slate-600"}`}>{r.failures}</td>
                        <td className="py-2 px-3 text-slate-700">{r.usn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DC Health donut */}
            <div className="xl:col-span-3 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900">Domain Controller Health</div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All</button>
              </div>
              <div className="h-52 relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={donut} innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {donut.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{totalDcs}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Total DCs</div>
                  </div>
                </div>
              </div>
              <div className="mt-2 space-y-1.5">
                {donut.map((d) => {
                  const pct = ((d.value / (donut.reduce((a, b) => a + b.value, 0) || 1)) * 100).toFixed(1);
                  return (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-slate-700">{d.name}</span>
                      </div>
                      <span className="text-slate-600"><span className="font-semibold text-slate-800">{d.value}</span> ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Auth trend + Kerberos + Identity Risks + AI Recs */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-5 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-slate-900">Authentication Overview (Last 24h)</div>
                  <div className="text-[11px] text-slate-500">Kerberos · NTLM · LDAP · SAML · OIDC</div>
                </div>
                <div className="flex gap-1 text-[10px]">
                  {["1h", "24h", "7d", "30d"].map((w) => (
                    <button key={w} className={`px-2 py-0.5 rounded ${w === "24h" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{w}</button>
                  ))}
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer>
                  <AreaChart data={authTrend}>
                    <defs>
                      <linearGradient id="authFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="h" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis yAxisId="l" domain={[98, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" unit="%" />
                    <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} stroke="#94a3b8" unit="ms" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area yAxisId="l" type="monotone" dataKey="success" name="Auth Success %" stroke="#10b981" fill="url(#authFill)" strokeWidth={2} />
                    <Line  yAxisId="r" type="monotone" dataKey="latency" name="Latency (ms)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3 text-[11px]">
                {[
                  { l: "Kerberos Tickets", v: "2.41M", cls: "text-emerald-600" },
                  { l: "NTLM Auth",        v: "118K",  cls: "text-blue-600" },
                  { l: "Failed Logons",    v: "2,351", cls: "text-amber-600" },
                  { l: "Locked Accounts",  v: "312",   cls: "text-red-600" },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                    <div className="text-slate-500">{s.l}</div>
                    <div className={`text-sm font-bold ${s.cls}`}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Identity Risks */}
            <div className="xl:col-span-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div>
                  <div className="text-sm font-bold text-slate-900">Top Identity Risks</div>
                  <div className="text-[11px] text-slate-500">AI-prioritized by business impact</div>
                </div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All →</button>
              </div>
              <div className="divide-y divide-slate-100">
                {identityRisks.map((r) => (
                  <div key={r.risk} className="px-4 py-2.5 flex items-start gap-3 hover:bg-slate-50">
                    <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${r.impact === "Critical" ? "text-red-500" : r.impact === "High" ? "text-orange-500" : "text-amber-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800">{r.risk}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Affects {r.affected} · Confidence {r.conf}%</div>
                    </div>
                    <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${riskCls(r.impact)}`}>{r.impact}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recs */}
            <div className="xl:col-span-3 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-blue-600" /> AI Recommendations</div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All</button>
              </div>
              <div className="divide-y divide-slate-100">
                {recommendations.map((r) => (
                  <div key={r.name} className="px-4 py-2.5">
                    <div className="text-xs font-semibold text-slate-800">{r.name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-[10px] text-slate-500">Conf {r.conf}% · Impact {r.impact}</div>
                      <button className={`text-[10px] font-semibold rounded px-2 py-0.5 ${r.auto ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>{r.auto ? "Execute" : "Approve"}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Forest Health + Replication Latency + Site Health + DC Details */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-3 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-slate-900">Forest &amp; Domain Health</div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View Details</button>
              </div>
              <div className="space-y-1.5 text-xs">
                {forestSummary.map((s) => (
                  <div key={s.l} className="flex items-center justify-between border-b border-slate-100 last:border-0 py-1">
                    <div className="flex items-center gap-2 text-slate-600">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>{s.l}</span>
                    </div>
                    <span className="font-semibold text-slate-800 text-[11px]">{s.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:col-span-5 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-slate-900">Replication Latency Trend</div>
                  <div className="text-[11px] text-slate-500">Intra-site · Inter-site · P95 · seconds</div>
                </div>
                <div className="flex gap-1 text-[10px]">
                  {["7D", "30D", "90D"].map((w) => (
                    <button key={w} className={`px-2 py-0.5 rounded ${w === "30D" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{w}</button>
                  ))}
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer>
                  <LineChart data={replicationTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="d" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="s" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Warning", fontSize: 9, fill: "#f59e0b" }} />
                    <Line type="monotone" dataKey="intra" name="Intra-site" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="inter" name="Inter-site" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="p95"   name="P95"        stroke="#a855f7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="xl:col-span-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">Site Health</div>
                  <div className="text-[11px] text-slate-500">42 sites · 214 replication links</div>
                </div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All</button>
              </div>
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold">Site</th>
                    <th className="text-right py-2 px-3 font-semibold">DCs</th>
                    <th className="text-left py-2 px-3 font-semibold">Health</th>
                    <th className="text-right py-2 px-3 font-semibold">Avg Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {siteHealth.map((s) => (
                    <tr key={s.site} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-800">{s.site}</td>
                      <td className="py-2 px-3 text-right text-slate-700">{s.dcs}</td>
                      <td className={`py-2 px-3 font-semibold ${healthCls(s.health)}`}>{s.health}</td>
                      <td className="py-2 px-3 text-right text-slate-700">{s.latency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* DC table + Right side engineering panel */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div>
                  <div className="text-sm font-bold text-slate-900">Domain Controller Health</div>
                  <div className="text-[11px] text-slate-500">Click a DC to open the engineering workspace</div>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  {["All", "Prod", "DR", "RODC"].map((f) => (
                    <button key={f} className={`px-2 py-0.5 rounded ${f === "All" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold">Hostname</th>
                      <th className="text-left py-2 px-3 font-semibold">Site</th>
                      <th className="text-left py-2 px-3 font-semibold">IP</th>
                      <th className="text-left py-2 px-3 font-semibold">OS</th>
                      <th className="text-left py-2 px-3 font-semibold">FSMO / GC</th>
                      <th className="text-right py-2 px-3 font-semibold">CPU</th>
                      <th className="text-right py-2 px-3 font-semibold">Memory</th>
                      <th className="text-left py-2 px-3 font-semibold">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dcHealth.map((d) => (
                      <tr
                        key={d.dc}
                        onClick={() => setSelectedDc(d)}
                        className={`border-t border-slate-100 cursor-pointer hover:bg-blue-50/50 ${selectedDc.dc === d.dc ? "bg-blue-50/70" : ""}`}
                      >
                        <td className="py-2 px-3 font-semibold text-slate-800 font-mono text-[11px]">{d.dc}</td>
                        <td className="py-2 px-3 text-slate-700">{d.site}</td>
                        <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{d.ip}</td>
                        <td className="py-2 px-3 text-slate-600">{d.os}</td>
                        <td className="py-2 px-3 text-slate-700 text-[11px]">{d.role}</td>
                        <td className="py-2 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full ${d.cpu > 60 ? "bg-orange-500" : "bg-emerald-500"}`} style={{ width: `${d.cpu}%` }} /></div>
                            <span className="text-slate-700 font-semibold text-[11px]">{d.cpu}%</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full ${d.mem > 60 ? "bg-orange-500" : "bg-emerald-500"}`} style={{ width: `${d.mem}%` }} /></div>
                            <span className="text-slate-700 font-semibold text-[11px]">{d.mem}%</span>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`inline-block border rounded-full px-2 py-0.5 text-[10px] font-semibold ${riskCls(d.risk)}`}>{d.risk}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Engineering Right-Side Panel */}
            <div className="xl:col-span-4 rounded-xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Domain Controller Details</div>
                  <div className="text-sm font-bold text-slate-900 font-mono">{selectedDc.dc}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  ["Site", selectedDc.site],
                  ["IP Address", selectedDc.ip],
                  ["OS", selectedDc.os],
                  ["Uptime", "42 days"],
                  ["FSMO Roles", selectedDc.role],
                  ["Global Catalog", "Yes"],
                  ["Time Sync", "±14 ms"],
                  ["SYSVOL", "Healthy"],
                  ["NETLOGON", "Healthy"],
                  ["LDAP", "Healthy"],
                  ["Kerberos", "Healthy"],
                  ["DNS", "Healthy"],
                ].map(([l, v]) => (
                  <div key={l as string} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider">{l}</div>
                    <div className="text-slate-800 font-semibold truncate">{v}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Replication Partners</div>
                <div className="space-y-1 text-[11px]">
                  {["DC01.corp.contoso.com", "DC02.corp.contoso.com", "DC05.corp.contoso.com"].map((p) => (
                    <div key={p} className="flex items-center justify-between rounded-md bg-slate-50 border border-slate-100 px-2 py-1">
                      <span className="font-mono text-slate-700 truncate">{p}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Healthy</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {["Run Dcdiag", "Run Repadmin", "Force Replication", "Transfer Role", "Create Ticket"].map((a) => (
                  <button key={a} className="text-[10px] font-semibold border border-slate-200 rounded-md px-2 py-1 hover:bg-slate-50">{a}</button>
                ))}
              </div>
            </div>
          </section>

          {/* AI Investigation Workspace */}
          <section className="rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div>
                <div className="text-sm font-bold text-slate-900">AI Investigation Workspace</div>
                <div className="text-[11px] text-slate-500">Active investigation · {selectedDc.dc} · replication link DC03 → DC04</div>
              </div>
              <div className="flex gap-1">
                <button className="text-[11px] font-semibold border border-slate-200 rounded px-2 py-1 hover:bg-slate-50">Export</button>
                <button className="text-[11px] font-semibold bg-blue-600 text-white rounded px-2 py-1 hover:bg-blue-700">Open Runbook</button>
              </div>
            </div>
            <div className="px-4 pt-2 flex flex-wrap gap-1 border-b border-slate-100">
              {investigationTabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-t-md border-b-2 ${tab === t ? "border-blue-600 text-blue-700" : "border-transparent text-slate-600 hover:text-slate-800"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              <div className="lg:col-span-2 space-y-2">
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-blue-700 font-semibold">Executive Summary</div>
                  <p className="text-slate-800 mt-1 leading-relaxed">
                    Replication between <span className="font-mono">DC03</span> and <span className="font-mono">DC04</span> is delayed by 3m 12s (thr: 90s). Root cause correlated with SYSVOL DFSR backlog on DC04 and transient WAN latency across the NY↔LON site link (avg 84ms, peaked at 212ms during window 14:00–14:20). 324 GPO/user objects are pending replication. Estimated business impact: <span className="font-semibold text-red-600">High</span> — group policy changes to 12 tier-1 applications delayed. Confidence 96%.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { l: "Root Cause",       v: "DFSR backlog + WAN jitter" },
                    { l: "Recommended Fix",  v: "repadmin /syncall + DFSR poll" },
                    { l: "Estimated MTTR",   v: "8 minutes" },
                    { l: "Rollback",         v: "Automatic snapshot restore" },
                    { l: "Change Ticket",    v: "CHG-48213" },
                    { l: "Runbook",          v: "AD-REP-002" },
                  ].map((c) => (
                    <div key={c.l} className="rounded-lg border border-slate-100 p-2">
                      <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{c.l}</div>
                      <div className="text-slate-800 font-semibold">{c.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 p-3">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Dependency Graph</div>
                <div className="space-y-1.5 text-[11px]">
                  {[
                    { l: "Domain Controller", v: "DC04.corp.contoso.com" },
                    { l: "Authentication",    v: "Kerberos · LDAP" },
                    { l: "Applications",      v: "62 apps (12 tier-1)" },
                    { l: "Business Services", v: "Checkout · Order Mgmt" },
                    { l: "Departments",       v: "Finance · Ops · Sales" },
                    { l: "Users Affected",    v: "18,214" },
                    { l: "Revenue at Risk",   v: "$1.4M / hr" },
                    { l: "SLA Risk",          v: "Elevated" },
                  ].map((d) => (
                    <div key={d.l} className="flex items-center justify-between">
                      <span className="text-slate-500">{d.l}</span>
                      <span className="text-slate-800 font-semibold">{d.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Hybrid Identity + Security + Activity */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-4 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Cloud className="h-3.5 w-3.5 text-blue-600" /> Hybrid Identity</div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 font-semibold">All Paths Synced</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {hybridSync.map((s) => (
                  <div key={s.l} className="rounded-lg border border-slate-100 p-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{s.l}</div>
                      <span className={`text-[10px] font-semibold ${s.v === "Healthy" || s.v === "Enforced" ? "text-emerald-600" : "text-amber-600"}`}>{s.v}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:col-span-4 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5 text-orange-600" /> Security Intelligence</div>
                <span className="text-[10px] text-slate-500">Last 24h · Defender for Identity</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {security.map((s) => (
                  <div key={s.l} className="flex items-center justify-between rounded-md border border-slate-100 px-2 py-1.5">
                    <span className="text-slate-700 text-[11px]">{s.l}</span>
                    <span className={`font-bold ${s.color}`}>{s.v}</span>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full text-[11px] font-semibold bg-slate-900 text-white rounded-lg py-1.5 hover:bg-slate-800">Open Sentinel Investigation</button>
            </div>

            <div className="xl:col-span-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-blue-600" /> Digital Coworker Activity (Live)</div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All</button>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {activity.map((a, i) => (
                  <div key={i} className="px-4 py-2 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-400 font-mono">{a.t}</span>
                      <span className="text-slate-700 truncate">{a.e}</span>
                    </div>
                    <span className={`ml-2 text-[10px] font-semibold rounded-full px-2 py-0.5 border ${a.s === "AI" ? "text-blue-700 bg-blue-50 border-blue-200" : a.s === "Automation" ? "text-violet-700 bg-violet-50 border-violet-200" : "text-slate-700 bg-slate-50 border-slate-200"}`}>{a.s}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Automation Library + Integrations */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-7 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5 text-blue-600" /> Automation Library</div>
                  <div className="text-[11px] text-slate-500">Launchable workflows · rollback-safe · governance-approved</div>
                </div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">Manage</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {automation.map((a) => (
                  <button key={a} className="text-left rounded-lg border border-slate-200 p-2 hover:border-blue-300 hover:bg-blue-50/40">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-800">{a}</span>
                      <Play className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Approved · Auto rollback</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="xl:col-span-5 rounded-xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Network className="h-3.5 w-3.5 text-blue-600" /> Enterprise Integrations</div>
                  <div className="text-[11px] text-slate-500">Live telemetry from identity, security, monitoring platforms</div>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 font-semibold">22 Connected</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {integrations.map((i) => (
                  <span key={i} className="text-[10px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2 py-1 inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {i}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* AI Copilot */}
          <section className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 grid place-items-center"><Bot className="h-4 w-4" /></div>
                <div>
                  <div className="text-sm font-bold">AI Copilot — Active Directory</div>
                  <div className="text-[11px] text-white/60">Grounded in replication metadata, event logs, Defender for Identity, dependency graphs</div>
                </div>
              </div>
              <div className="flex gap-1 text-[10px]">
                {["Ask", "Investigate", "Remediate", "Report"].map((m, i) => (
                  <button key={m} className={`px-2 py-0.5 rounded ${i === 0 ? "bg-blue-600" : "bg-white/10 hover:bg-white/20"}`}>{m}</button>
                ))}
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-2 max-h-64 overflow-y-auto pr-1">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${m.role === "user" ? "bg-blue-600" : "bg-white/10"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/60 font-semibold mb-1.5">Suggested Prompts</div>
                <div className="space-y-1">
                  {[
                    "Why is replication failing between DC03 and DC04?",
                    "Which DC is unhealthy right now?",
                    "Predict future replication failures.",
                    "Validate hybrid identity synchronization.",
                    "Generate executive identity report.",
                  ].map((p) => (
                    <button key={p} onClick={() => setChat(p)} className="w-full text-left text-[11px] rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1.5">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                <BookOpen className="h-3.5 w-3.5 text-white/50" />
                <input
                  value={chat}
                  onChange={(e) => setChat(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask about replication, Kerberos, DNS, FSMO, hybrid identity…"
                  className="flex-1 bg-transparent placeholder:text-white/40 text-sm focus:outline-none"
                />
                <button onClick={send} className="h-8 w-8 rounded-lg bg-blue-600 grid place-items-center hover:bg-blue-700">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="text-[10px] text-white/50 mt-1.5 flex items-center gap-1.5">
                <Lock className="h-3 w-3" /> Answers include confidence · business impact · root cause · remediation · rollback plan
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
