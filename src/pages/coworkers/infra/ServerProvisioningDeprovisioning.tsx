import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  ArrowLeft, Activity, Server, HardDrive, Database, Network, ShieldCheck,
  AlertTriangle, CheckCircle2, Clock, DollarSign, Bot, Play, Pause, Square,
  RotateCcw, Sparkles, Cpu, MemoryStick, Layers, Gauge, TrendingUp, FileDown,
  Search, RefreshCcw, X, ChevronRight, Cloud, Package, GitBranch, Workflow,
  Users, FileText, Settings, Zap, Terminal, Recycle, LineChart as LineIcon,
  ShieldAlert, CircleCheck, Timer, Send, ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  Area, AreaChart, BarChart, Bar, Legend,
} from "recharts";

// ---------- Data ----------
const statusPills = [
  { l: "Operational Status", v: "Operational", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  { l: "Last Sync",                v: "8 seconds ago" },
  { l: "Infrastructure Managed",   v: "14,862 servers" },
  { l: "Connected Cloud Accounts", v: "127" },
  { l: "Automation Success",       v: "99.2%" },
  { l: "Average Provision Time",   v: "11 min" },
  { l: "Requests in Queue",        v: "237" },
  { l: "Regions",                  v: "18" },
];

const kpis = [
  { icon: Send,          l: "Provision Requests Today", v: "482",   sub: "+12% vs yday", color: "text-blue-600",    bg: "bg-blue-50",    subCls: "text-emerald-600" },
  { icon: CircleCheck,   l: "Provision Success Rate",   v: "99.2%", sub: "SLA 98.5%",    color: "text-emerald-600", bg: "bg-emerald-50", subCls: "text-emerald-600" },
  { icon: Timer,         l: "Avg Deployment Time",      v: "11 m",  sub: "target 15m",   color: "text-violet-600",  bg: "bg-violet-50",  subCls: "text-emerald-600" },
  { icon: Recycle,       l: "Infrastructure Reclaimed", v: "76",    sub: "servers today",color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Cpu,           l: "CPU Reclaimed",            v: "214",   sub: "cores",        color: "text-blue-600",    bg: "bg-blue-50" },
  { icon: MemoryStick,   l: "Memory Reclaimed",         v: "3.6 TB",sub: "RAM",          color: "text-violet-600",  bg: "bg-violet-50" },
  { icon: HardDrive,     l: "Storage Reclaimed",        v: "87 TB", sub: "block+object", color: "text-blue-600",    bg: "bg-blue-50" },
  { icon: DollarSign,    l: "Annual Cost Avoidance",    v: "$4.8M", sub: "run-rate",     color: "text-emerald-600", bg: "bg-emerald-50", subCls: "text-emerald-600" },
  { icon: ShieldCheck,   l: "CMDB Compliance",          v: "98.7%", sub: "+0.6% wow",    color: "text-emerald-600", bg: "bg-emerald-50", subCls: "text-emerald-600" },
  { icon: ShieldAlert,   l: "Policy Compliance",        v: "100%",  sub: "all policies", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Bot,           l: "Automation Success",       v: "99.2%", sub: "1,842 runs",   color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: AlertTriangle, l: "Provision Failures",       v: "8",     sub: "3 auto-fixed", color: "text-red-600",     bg: "bg-red-50",     subCls: "text-red-600" },
  { icon: Activity,      l: "Infrastructure Drift",     v: "0.4%",  sub: "62 CIs",       color: "text-amber-600",   bg: "bg-amber-50" },
  { icon: Clock,         l: "Pending Approvals",        v: "18",    sub: "SLA 2h",       color: "text-orange-600",  bg: "bg-orange-50" },
  { icon: Gauge,         l: "Average Queue Time",       v: "4 m",   sub: "-32% wow",     color: "text-blue-600",    bg: "bg-blue-50",    subCls: "text-emerald-600" },
];

const pipeline = [
  { l: "Request",           icon: FileText,    n: 28, avg: "45s", fail: 0.0, auto: 100 },
  { l: "Approval",          icon: Users,       n: 15, avg: "12m", fail: 0.0, auto: 92 },
  { l: "Arch Validation",   icon: ShieldCheck, n: 22, avg: "38s", fail: 0.4, auto: 100 },
  { l: "Policy Validation", icon: ShieldAlert, n: 12, avg: "22s", fail: 0.2, auto: 100 },
  { l: "Capacity Check",    icon: Gauge,       n: 8,  avg: "18s", fail: 0.0, auto: 100 },
  { l: "Terraform Plan",    icon: Terminal,    n: 10, avg: "1m",  fail: 0.6, auto: 98  },
  { l: "VM Creation",       icon: Server,      n: 18, avg: "3m",  fail: 0.4, auto: 99  },
  { l: "OS Build",          icon: Cpu,         n: 22, avg: "4m",  fail: 0.3, auto: 100 },
  { l: "Patch",             icon: Package,     n: 19, avg: "2m",  fail: 0.2, auto: 100 },
  { l: "Security",          icon: ShieldCheck, n: 18, avg: "1m",  fail: 0.1, auto: 100 },
  { l: "Monitoring",        icon: Activity,    n: 16, avg: "40s", fail: 0.0, auto: 100 },
  { l: "Backup",            icon: HardDrive,   n: 15, avg: "50s", fail: 0.0, auto: 100 },
  { l: "CMDB",              icon: Database,    n: 14, avg: "30s", fail: 0.5, auto: 96  },
  { l: "DNS",               icon: Network,     n: 14, avg: "20s", fail: 0.1, auto: 100 },
  { l: "LB Config",         icon: Workflow,    n: 10, avg: "35s", fail: 0.2, auto: 99  },
  { l: "Validation",        icon: CheckCircle2,n: 14, avg: "1m",  fail: 0.3, auto: 100 },
  { l: "Ready",             icon: Sparkles,    n: 36, avg: "-",   fail: 0.0, auto: 100 },
];

const liveDeployments = [
  { host: "vm-prod-web-35",  env: "Production",  plat: "Azure",     stage: "OS Build",         pct: 62, eta: "3m",  owner: "jdoe",    approval: "Approved" },
  { host: "vm-prod-db-118",  env: "Production",  plat: "VMware",    stage: "Security",         pct: 78, eta: "1m",  owner: "sre-team",approval: "Approved" },
  { host: "vm-dev-app-402",  env: "Development", plat: "AWS",       stage: "Terraform Plan",   pct: 22, eta: "6m",  owner: "aturner", approval: "Approved" },
  { host: "vm-uat-sql-07",   env: "UAT",         plat: "Azure",     stage: "Patch",            pct: 51, eta: "2m",  owner: "dba-svc", approval: "Approved" },
  { host: "vm-prod-k8s-19",  env: "Production",  plat: "AWS",       stage: "Monitoring",       pct: 84, eta: "40s", owner: "platform",approval: "Approved" },
  { host: "vm-stg-gpu-12",   env: "Staging",     plat: "GCP",       stage: "Backup",           pct: 71, eta: "1m",  owner: "ai-team", approval: "Approved" },
];

const provisioningStatus = [
  { l: "Provisioning", v: 28,  bg: "bg-blue-50",    color: "text-blue-700" },
  { l: "Building",     v: 64,  bg: "bg-violet-50",  color: "text-violet-700" },
  { l: "Waiting",      v: 18,  bg: "bg-amber-50",   color: "text-amber-700" },
  { l: "Failed",       v: 8,   bg: "bg-red-50",     color: "text-red-700" },
  { l: "Rollback",     v: 5,   bg: "bg-orange-50",  color: "text-orange-700" },
  { l: "Completed",    v: 451, bg: "bg-emerald-50", color: "text-emerald-700" },
  { l: "Cancelled",    v: 12,  bg: "bg-slate-50",   color: "text-slate-700" },
];

const topIssues = [
  { p: "Critical", env: "Production",  plat: "Azure",  server: "vm-prod-db-42",  issue: "CMDB Sync Failure",     impact: "42 servers",   root: "Rate-limit hit on ServiceNow API",      action: "Retry API Sync",     conf: 96, age: "6m" },
  { p: "High",     env: "Production",  plat: "Azure",  server: "vm-prod-app-91", issue: "Terraform Drift",       impact: "Build failure",root: "Manual change outside pipeline",        action: "Reconcile State",    conf: 94, age: "14m" },
  { p: "High",     env: "VMware",      plat: "vSphere",server: "vm-vsan-118",    issue: "Missing Monitoring Agent",impact: "Visibility gap",root: "Golden image v2024-11 regression",   action: "Install Agent",      conf: 99, age: "22m" },
  { p: "Medium",   env: "Production",  plat: "AWS",    server: "ec2-prod-web-7", issue: "DNS Registration Failed",impact: "Access delay",root: "Infoblox zone lock",                    action: "Retry Workflow",     conf: 92, age: "38m" },
  { p: "Medium",   env: "Windows",     plat: "Azure",  server: "vm-prod-win-58", issue: "Patch Baseline Missing", impact: "Compliance risk",root: "Baseline Win2022-Q2 not applied",     action: "Apply Baseline",     conf: 97, age: "1h" },
  { p: "Low",      env: "Development", plat: "AWS",    server: "ec2-dev-app-14", issue: "Tagging Non-Compliant",  impact: "Chargeback gap",root: "Missing cost-center tag",              action: "Auto-tag",           conf: 100,age: "2h" },
];

const timeline = [
  { t: "09:31", e: "Request Submitted",     tag: "REQ-12458", by: "jdoe" },
  { t: "09:32", e: "Manager Approved",      tag: "APP-77821", by: "mgr-apps" },
  { t: "09:32", e: "Terraform Started",     tag: "TF-88910",  by: "automation" },
  { t: "09:33", e: "VM Created",            tag: "vm-prod-web-35", by: "vcenter01" },
  { t: "09:35", e: "Domain Joined",         tag: "corp.contoso.com", by: "ad01" },
  { t: "09:36", e: "Security Policies Applied", tag: "Baseline-Standard", by: "sentinel" },
  { t: "09:37", e: "Monitoring Installed",  tag: "Datadog Agent", by: "datadog" },
  { t: "09:38", e: "Backup Registered",     tag: "Veeam Backup",  by: "veeam" },
  { t: "09:39", e: "CMDB Updated",          tag: "CI-889210",     by: "servicenow" },
  { t: "09:40", e: "Provision Complete",    tag: "vm-prod-web-35", by: "automation" },
];

const recommendations = [
  { title: "Standardize 42 Linux builds",       conf: 98, save: "$512K/yr",  detail: "Consolidate on Ubuntu 24.04 Gold Image; retire 3 legacy variants." },
  { title: "Consolidate Gold Images",           conf: 96, save: "$386K/yr",  detail: "Merge Win2019/Win2022 golden templates and eliminate 7 duplicate baselines." },
  { title: "Remove duplicate Terraform modules",conf: 94, save: "$172K/yr",  detail: "Refactor 12 duplicate networking modules into shared module v3.2." },
  { title: "Automate middleware installation",  conf: 93, save: "$231K/yr",  detail: "Add Tomcat/Nginx/IIS role automation to reduce manual post-build steps." },
  { title: "Retire obsolete Windows images",    conf: 92, save: "$281K/yr",  detail: "Deprecate 5 Win2016 templates; migrate 128 servers to Win2022." },
];

const integrations = [
  { l: "ServiceNow", c: "text-emerald-600" }, { l: "Terraform", c: "text-violet-600" },
  { l: "VMware",     c: "text-blue-600" },    { l: "Azure",     c: "text-blue-600" },
  { l: "AWS",        c: "text-orange-600" },  { l: "GCP",       c: "text-red-500" },
  { l: "PowerShell", c: "text-blue-700" },    { l: "Ansible",   c: "text-red-600" },
  { l: "Chef",       c: "text-orange-700" },  { l: "Puppet",    c: "text-amber-600" },
  { l: "Salt",       c: "text-blue-500" },    { l: "GitHub",    c: "text-slate-800" },
  { l: "Azure DevOps",c: "text-blue-600" },   { l: "Jenkins",   c: "text-red-700" },
  { l: "CyberArk",   c: "text-red-500" },     { l: "Defender",  c: "text-blue-600" },
  { l: "CrowdStrike",c: "text-red-600" },     { l: "Sentinel",  c: "text-blue-500" },
  { l: "Active Directory", c: "text-blue-700" }, { l: "Entra ID",c: "text-blue-500" },
  { l: "DNS",        c: "text-slate-700" },   { l: "F5",        c: "text-red-600" },
  { l: "Infoblox",   c: "text-emerald-700" }, { l: "Datadog",   c: "text-violet-600" },
  { l: "Dynatrace",  c: "text-emerald-600" }, { l: "Splunk",    c: "text-emerald-700" },
  { l: "Cribl",      c: "text-slate-700" },   { l: "Rubrik",    c: "text-emerald-600" },
  { l: "Veeam",      c: "text-emerald-600" }, { l: "CMDB",      c: "text-blue-600" },
];

const approvals = [
  { l: "Emergency Requests", v: 3,  sla: "SLA 15m", color: "text-red-600",    bg: "bg-red-50" },
  { l: "Standard Requests",  v: 12, sla: "SLA 2h",  color: "text-blue-600",   bg: "bg-blue-50" },
  { l: "Expedited Builds",   v: 8,  sla: "SLA 30m", color: "text-violet-600", bg: "bg-violet-50" },
  { l: "Self-Service Builds",v: 23, sla: "SLA 5m",  color: "text-emerald-600",bg: "bg-emerald-50" },
  { l: "Exceptions",         v: 4,  sla: "Requires Review", color: "text-amber-600", bg: "bg-amber-50" },
];

const capacity = [
  { l: "CPU",          v: "62%", raw: 62, remain: "Available" },
  { l: "Memory",       v: "58%", raw: 58, remain: "Available" },
  { l: "Storage",      v: "47%", raw: 47, remain: "Available" },
  { l: "IP Addresses", v: "71%", raw: 71, remain: "Available" },
  { l: "VLANs",        v: "68%", raw: 68, remain: "Available" },
  { l: "Clusters",     v: "65%", raw: 65, remain: "Available" },
];

const deprovision = [
  { l: "Servers Scheduled",   v: "24" },
  { l: "Servers Retired Today", v: "76" },
  { l: "Storage Reclaimed",   v: "87 TB" },
  { l: "Licenses Reclaimed",  v: "54" },
  { l: "IP Addresses Returned", v: "126" },
  { l: "Savings This Month",  v: "$142K", cls: "text-emerald-700" },
];

const activity = [
  { t: "09:31", e: "Validated request against policies" },
  { t: "09:32", e: "Verified quota and approvals" },
  { t: "09:32", e: "Reserved IP: 10.20.35.158" },
  { t: "09:33", e: "Provisioned VM in vCenter" },
  { t: "09:34", e: "Installed OS and configured" },
  { t: "09:35", e: "Applied security baseline" },
  { t: "09:36", e: "Installed monitoring and backup agents" },
  { t: "09:37", e: "Updated CMDB and ServiceNow CI" },
  { t: "09:38", e: "Generated documentation" },
  { t: "09:40", e: "Notified owner and team" },
];

const deliveryTrend = Array.from({ length: 14 }, (_, i) => ({
  d: `D-${13 - i}`,
  requests: 380 + Math.round(Math.sin(i / 2) * 40 + i * 6),
  completed: 360 + Math.round(Math.cos(i / 2) * 30 + i * 6),
  failed: Math.max(0, 12 - Math.round(i / 2) + (i % 3)),
}));

const capacityForecast = Array.from({ length: 12 }, (_, i) => ({
  m: `M${i + 1}`,
  cpu: 55 + i * 2 + Math.round(Math.sin(i) * 3),
  mem: 60 + i * 1.6 + Math.round(Math.cos(i) * 2),
  stg: 48 + i * 2.4,
}));

const catalog = [
  { l: "Windows Server 2022", cost: "$142/mo", time: "9 min",  cov: "100%" },
  { l: "Linux (RHEL 9)",      cost: "$118/mo", time: "7 min",  cov: "100%" },
  { l: "SQL Server 2022",     cost: "$486/mo", time: "18 min", cov: "96%" },
  { l: "Oracle 19c",          cost: "$742/mo", time: "24 min", cov: "88%" },
  { l: "Kubernetes Worker",   cost: "$96/mo",  time: "6 min",  cov: "100%" },
  { l: "Domain Controller",   cost: "$188/mo", time: "12 min", cov: "100%" },
  { l: "Jump Server",         cost: "$62/mo",  time: "5 min",  cov: "100%" },
  { l: "Application Server",  cost: "$168/mo", time: "10 min", cov: "100%" },
];

const compliancePolicies = [
  { l: "Naming Standards", v: 100 }, { l: "Tagging",         v: 98 },
  { l: "Encryption",       v: 100 }, { l: "Patch Compliance", v: 97 },
  { l: "Security Baselines", v: 99 }, { l: "Backup",         v: 100 },
  { l: "Monitoring",       v: 100 }, { l: "Logging",         v: 99 },
  { l: "Ownership",        v: 98 },  { l: "Cost Allocation", v: 96 },
  { l: "CIS Controls",     v: 97 },  { l: "NIST",            v: 98 },
  { l: "HIPAA",            v: 100 }, { l: "SOX",             v: 100 },
  { l: "PCI",              v: 99 },  { l: "Retention",       v: 100 },
];

const Dot = ({ cls }: { cls: string }) => <span className={`inline-block h-1.5 w-1.5 rounded-full ${cls}`} />;

// ---------- Page ----------
export default function ServerProvisioningDeprovisioning() {
  const [openPanel, setOpenPanel] = useState(true);
  const [selected, setSelected] = useState<string>("vm-prod-web-35");
  const [tab, setTab] = useState<"overview" | "config" | "compliance" | "relationships">("overview");
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const forecastData = useMemo(() => capacityForecast.slice(0, { "7d": 4, "30d": 8, "90d": 12 }[range]), [range]);

  return (
    <AppShell>
      <main className="flex-1 bg-slate-50/60 animate-fade-in min-w-0">
        <div className={`grid ${openPanel ? "grid-cols-1 xl:grid-cols-[1fr_360px]" : "grid-cols-1"} gap-4 p-5`}>
          {/* MAIN COLUMN */}
          <div className="min-w-0 space-y-4">
            {/* Back + Header */}
            <div>
              <Link
                to="/coworkers/infrastructure-automation"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-700 mb-3"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Infrastructure Automation
              </Link>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/40 backdrop-blur p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-widest text-blue-600 font-bold">Digital Coworker</div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                      Server Provisioning &amp; Deprovisioning
                    </h1>
                    <p className="text-[13px] text-slate-600 mt-2 max-w-3xl leading-relaxed">
                      <span className="font-semibold text-slate-800">Mission:</span> Automate the complete infrastructure
                      lifecycle from request through deployment, validation, compliance, ownership, retirement, and asset
                      reclamation while ensuring governance, security, CMDB accuracy, and cost optimization.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                      <Dot cls="bg-emerald-500" /> All Systems Normal
                    </span>
                    <button className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                      <RefreshCcw className="h-3 w-3" /> Refresh
                    </button>
                    <button className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                      <FileDown className="h-3 w-3" /> Export
                    </button>
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input placeholder="Search hostname, CI, workflow…" className="text-[11px] pl-7 pr-2 py-1 rounded-lg border border-slate-200 bg-white w-56 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    </div>
                  </div>
                </div>

                {/* Coverage pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {statusPills.slice(1).map((p) => (
                    <div key={p.l} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md bg-white/70 border border-slate-200">
                      <span className="text-slate-500">{p.l}</span>
                      <span className="font-semibold text-slate-900">{p.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {kpis.map((k) => {
                const Icon = k.icon;
                return (
                  <div key={k.l} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start gap-2">
                      <div className={`h-9 w-9 rounded-lg ${k.bg} ${k.color} grid place-items-center shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-medium text-slate-500 truncate">{k.l}</div>
                        <div className="text-lg font-extrabold text-slate-900 leading-tight">{k.v}</div>
                      </div>
                    </div>
                    <div className={`mt-1 text-[10px] ${(k as any).subCls ?? "text-slate-500"}`}>{k.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Pipeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">Infrastructure Request Pipeline</div>
                  <div className="text-[11px] text-slate-500">Total requests in pipeline: 237 · Real-time orchestration</div>
                </div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
                  View Pipeline Details <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="overflow-x-auto pb-1">
                <div className="flex items-center gap-1 min-w-max">
                  {pipeline.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.l} className="flex items-center">
                        <div className="w-[92px] text-center group cursor-pointer">
                          <div className="mx-auto h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 group-hover:bg-blue-50 group-hover:border-blue-300 grid place-items-center text-slate-700 group-hover:text-blue-700 transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="text-[10px] font-semibold text-slate-800 mt-1 leading-tight">{s.l}</div>
                          <div className="text-[10px] text-slate-500">{s.n}</div>
                        </div>
                        {idx < pipeline.length - 1 && <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-[11px]">
                <span className="inline-flex items-center gap-1 text-slate-600"><Dot cls="bg-emerald-500" /> Completed</span>
                <span className="inline-flex items-center gap-1 text-slate-600"><Dot cls="bg-blue-500" /> In Progress</span>
                <span className="inline-flex items-center gap-1 text-slate-600"><Dot cls="bg-amber-500" /> Waiting</span>
                <span className="inline-flex items-center gap-1 text-slate-600"><Dot cls="bg-red-500" /> Failed</span>
              </div>
            </div>

            {/* Live provisioning + AI recs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-slate-900">Live Provisioning Dashboard</div>
                  <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-3">
                  {provisioningStatus.map((s) => (
                    <div key={s.l} className={`rounded-lg border border-slate-100 p-2 text-center ${s.bg}`}>
                      <div className={`text-[10px] font-semibold uppercase tracking-wide ${s.color}`}>{s.l}</div>
                      <div className="text-xl font-extrabold text-slate-900 mt-0.5">{s.v}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {liveDeployments.map((d) => (
                    <div
                      key={d.host}
                      onClick={() => setSelected(d.host)}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-colors ${selected === d.host ? "border-blue-400 bg-blue-50/40" : "border-slate-200 hover:border-blue-300"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-[12px] font-bold text-slate-900">{d.host}</div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">{d.approval}</span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-500">{d.env} · {d.plat} · {d.owner}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${d.pct}%` }} />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-700 tabular-nums">{d.pct}%</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Stage: <span className="text-slate-800 font-semibold">{d.stage}</span></span>
                        <span className="text-slate-500">ETA <span className="text-slate-800 font-semibold">{d.eta}</span></span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <button className="text-[10px] px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1"><Pause className="h-2.5 w-2.5" /> Pause</button>
                        <button className="text-[10px] px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1"><Square className="h-2.5 w-2.5" /> Cancel</button>
                        <button className="text-[10px] px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1"><RotateCcw className="h-2.5 w-2.5" /> Rollback</button>
                        <button className="text-[10px] px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1"><Terminal className="h-2.5 w-2.5" /> Logs</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-slate-900">AI Recommendations</div>
                  <span className="text-[10px] text-slate-500">{recommendations.length} active</span>
                </div>
                <div className="space-y-2.5">
                  {recommendations.map((r) => (
                    <div key={r.title} className="rounded-xl border border-slate-200 p-3 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[12px] font-bold text-slate-900 leading-snug">{r.title}</div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">{r.conf}%</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">{r.detail}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-emerald-700">{r.save}</span>
                        <button className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-2 py-1 inline-flex items-center gap-1">
                          <Play className="h-2.5 w-2.5" /> Automate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Issues + Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-slate-900">Top Provisioning Issues</div>
                  <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All Issues</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-100">
                        <th className="py-1.5 pr-2 font-semibold">Priority</th>
                        <th className="py-1.5 pr-2 font-semibold">Issue</th>
                        <th className="py-1.5 pr-2 font-semibold">Environment</th>
                        <th className="py-1.5 pr-2 font-semibold">Impact</th>
                        <th className="py-1.5 pr-2 font-semibold">AI Recommendation</th>
                        <th className="py-1.5 pr-2 font-semibold text-right">Age</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topIssues.map((r, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 cursor-pointer" onClick={() => setSelected(r.server)}>
                          <td className="py-1.5 pr-2">
                            <span className={`inline-flex items-center gap-1 font-semibold ${
                              r.p === "Critical" ? "text-red-600" : r.p === "High" ? "text-orange-600" : r.p === "Medium" ? "text-amber-600" : "text-slate-600"
                            }`}>
                              <Dot cls={r.p === "Critical" ? "bg-red-500" : r.p === "High" ? "bg-orange-500" : r.p === "Medium" ? "bg-amber-500" : "bg-slate-400"} />
                              {r.p}
                            </span>
                          </td>
                          <td className="py-1.5 pr-2 text-slate-800">{r.issue}</td>
                          <td className="py-1.5 pr-2 text-slate-600">{r.env}</td>
                          <td className="py-1.5 pr-2 text-slate-600">{r.impact}</td>
                          <td className="py-1.5 pr-2">
                            <span className="inline-flex items-center gap-1 text-slate-700">
                              {r.action}
                              <ChevronRight className="h-3 w-3 text-slate-400" />
                            </span>
                          </td>
                          <td className="py-1.5 pr-2 text-right text-slate-500">{r.age}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-slate-900">Provisioning Timeline (Live)</div>
                  <button className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
                    <Play className="h-3 w-3" /> Replay
                  </button>
                </div>
                <div className="space-y-2">
                  {timeline.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="text-slate-400 tabular-nums w-10 shrink-0">{t.t}</span>
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-800 font-semibold">{t.e}</div>
                        <div className="text-slate-500 truncate">{t.tag} · <span className="text-slate-600">{t.by}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Automation pipeline / integrations */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-900">Automation Pipeline</div>
                <span className="text-[10px] text-slate-500">{integrations.length} platforms integrated</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {integrations.map((i) => (
                  <button key={i.l} className="rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/40 p-2 text-center transition-colors">
                    <div className={`h-8 w-8 mx-auto rounded-lg bg-slate-50 grid place-items-center ${i.c}`}>
                      <Workflow className="h-4 w-4" />
                    </div>
                    <div className="text-[10px] text-slate-700 mt-1 truncate">{i.l}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Approvals + Capacity + Deprovision */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-slate-900">Approval Dashboard</div>
                  <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All</button>
                </div>
                <div className="space-y-2">
                  {approvals.map((a) => (
                    <div key={a.l} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50/60">
                      <div>
                        <div className="text-[12px] font-semibold text-slate-800">{a.l}</div>
                        <div className={`text-[10px] ${a.color}`}>{a.sla}</div>
                      </div>
                      <div className={`text-lg font-extrabold ${a.color}`}>{a.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-slate-900">Capacity Availability</div>
                  <button className="text-[11px] font-semibold text-blue-600 hover:underline">View Details</button>
                </div>
                <div className="space-y-2.5">
                  {capacity.map((c) => (
                    <div key={c.l}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-700 font-semibold">{c.l}</span>
                        <span className="text-slate-500">{c.v} {c.remain}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full ${c.raw > 80 ? "bg-red-500" : c.raw > 65 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${c.raw}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[10px] text-slate-500 text-right">Forecast: 30 Days</div>
              </div>

              <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-slate-900">Deprovision Dashboard</div>
                  <button className="text-[11px] font-semibold text-blue-600 hover:underline">View Details</button>
                </div>
                <div className="space-y-2">
                  {deprovision.map((d) => (
                    <div key={d.l} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50/60">
                      <div className="text-[12px] text-slate-700 font-semibold flex items-center gap-2">
                        <Recycle className="h-3.5 w-3.5 text-emerald-600" /> {d.l}
                      </div>
                      <div className={`text-sm font-extrabold ${d.cls ?? "text-slate-900"}`}>{d.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery trend + Capacity forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-slate-900">Infrastructure Delivery Trend</div>
                  <div className="flex items-center gap-1">
                    {(["7d", "30d", "90d"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={`text-[10px] px-2 py-0.5 rounded border ${range === r ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deliveryTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                      <XAxis dataKey="d" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Requests" />
                      <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                      <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Failed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-900 mb-2">Capacity Forecast</div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData}>
                      <defs>
                        <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                        <linearGradient id="c2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                        <linearGradient id="c3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                      <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="url(#c1)" name="CPU %" />
                      <Area type="monotone" dataKey="mem" stroke="#8b5cf6" fill="url(#c2)" name="Memory %" />
                      <Area type="monotone" dataKey="stg" stroke="#10b981" fill="url(#c3)" name="Storage %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Self-Service Catalog + Compliance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-slate-900">Self-Service Catalog</div>
                  <span className="text-[10px] text-slate-500">Provision from certified templates</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {catalog.map((c) => (
                    <div key={c.l} className="rounded-lg border border-slate-200 p-2.5 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer transition-colors">
                      <div className="text-[12px] font-bold text-slate-900 truncate">{c.l}</div>
                      <div className="mt-1.5 grid grid-cols-3 text-[10px] gap-1">
                        <div><div className="text-slate-500">Build</div><div className="font-semibold text-slate-800">{c.time}</div></div>
                        <div><div className="text-slate-500">Auto</div><div className="font-semibold text-emerald-700">{c.cov}</div></div>
                        <div><div className="text-slate-500">Cost</div><div className="font-semibold text-slate-800">{c.cost}</div></div>
                      </div>
                      <button className="mt-2 w-full text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md py-1 inline-flex items-center justify-center gap-1">
                        <Play className="h-2.5 w-2.5" /> Provision
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-slate-900">Compliance Posture</div>
                  <span className="text-[10px] text-emerald-700 font-semibold">All Policies Met</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {compliancePolicies.map((p) => (
                    <div key={p.l} className="flex items-center justify-between rounded-md border border-slate-100 px-2 py-1.5">
                      <span className="text-[11px] text-slate-700">{p.l}</span>
                      <span className={`text-[11px] font-bold ${p.v === 100 ? "text-emerald-700" : p.v >= 98 ? "text-emerald-600" : "text-amber-600"}`}>{p.v}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity feed */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-900">Digital Coworker Activity</div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
                {activity.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className="text-slate-400 tabular-nums">{a.t}</span>
                    <span className="text-slate-700 flex-1">{a.e}</span>
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT ENGINEERING PANEL */}
          {openPanel && (
            <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Server Details</div>
                <button onClick={() => setOpenPanel(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                  <Server className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-slate-900 truncate">{selected}</div>
                  <div className="text-[11px] text-emerald-600 inline-flex items-center gap-1"><Dot cls="bg-emerald-500" /> Provisioning · Web Tier</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1 border-b border-slate-100">
                {([
                  ["overview","Overview"],
                  ["config","Configuration"],
                  ["compliance","Compliance"],
                  ["relationships","Relationships"],
                ] as const).map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setTab(k as any)}
                    className={`text-[11px] px-2 py-1.5 border-b-2 -mb-px ${tab === k ? "border-blue-600 text-blue-700 font-bold" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="mt-3 space-y-2 text-[11px]">
                {tab === "overview" && (
                  <>
                    {[
                      ["Hostname",       "vm-prod-web-35.contoso.com"],
                      ["IP Address",     "10.20.35.158"],
                      ["Operating System","Windows Server 2022"],
                      ["CPU / Memory",   "8 vCPU / 32 GB"],
                      ["Storage",        "500 GB"],
                      ["Business Owner", "Web Applications Team"],
                      ["Environment",    "Production"],
                      ["Application",    "eCommerce Portal"],
                      ["Provisioned By", "jdoe"],
                      ["Provisioned On", "May 22, 2025 09:33 AM"],
                      ["Lifecycle Stage","In Use"],
                      ["CMDB Status",    "Synced"],
                      ["ServiceNow CI",  "CI-889210"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between border-b border-slate-50 py-1">
                        <span className="text-slate-500">{k}</span>
                        <span className="text-slate-900 font-semibold text-right">{v}</span>
                      </div>
                    ))}
                  </>
                )}
                {tab === "config" && (
                  <>
                    {[
                      ["Terraform Module","aws-web-tier v3.2.1"],
                      ["Git Commit",     "a12f9c4"],
                      ["Pipeline",       "gha-web-tier-prod #482"],
                      ["Automation Run", "run-889021"],
                      ["Workflow Version","2025.06.02"],
                      ["Provision Time", "9m 42s"],
                      ["Image Version",  "win2022-gold-2025.06"],
                      ["Patch Level",    "2025-05-B"],
                      ["Encryption",     "AES-256 (BitLocker)"],
                      ["Firewall",       "Deny-by-default · 24 rules"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between border-b border-slate-50 py-1">
                        <span className="text-slate-500">{k}</span>
                        <span className="text-slate-900 font-semibold text-right">{v}</span>
                      </div>
                    ))}
                  </>
                )}
                {tab === "compliance" && (
                  <>
                    {[
                      ["CIS Score",      "94 / 100"],
                      ["CrowdStrike",    "Installed"],
                      ["Defender",       "Enabled"],
                      ["Sentinel",       "Streaming"],
                      ["Backup",         "Veeam · Daily"],
                      ["Replication",    "ASR · Enabled"],
                      ["Monitoring",     "Datadog · Healthy"],
                      ["DR",             "Zone-redundant"],
                      ["Certificate",    "Valid · 328d left"],
                      ["Support Team",   "SRE-East"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between border-b border-slate-50 py-1">
                        <span className="text-slate-500">{k}</span>
                        <span className="text-slate-900 font-semibold text-right">{v}</span>
                      </div>
                    ))}
                  </>
                )}
                {tab === "relationships" && (
                  <>
                    {[
                      ["Business Service","eCommerce Portal"],
                      ["Depends On",     "sql-prod-cart-04"],
                      ["Depends On",     "redis-prod-cache-11"],
                      ["Load Balancer",  "lb-prod-web-01"],
                      ["Backup Target",  "veeam-repo-east-02"],
                      ["Monitoring",     "datadog-agent v7.54"],
                      ["Cost Center",    "CC-401 · Digital"],
                      ["Business Unit",  "Retail"],
                      ["Project",        "Peak-2025"],
                      ["Monthly Cost",   "$286"],
                      ["Annual Cost",    "$3,432"],
                    ].map(([k, v], i) => (
                      <div key={i} className="flex items-center justify-between border-b border-slate-50 py-1">
                        <span className="text-slate-500">{k}</span>
                        <span className="text-slate-900 font-semibold text-right">{v}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button className="flex-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1.5 inline-flex items-center justify-center gap-1">
                  <Terminal className="h-3 w-3" /> Open Logs
                </button>
                <button className="flex-1 text-[11px] font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg py-1.5 inline-flex items-center justify-center gap-1">
                  <GitBranch className="h-3 w-3" /> Open in ServiceNow
                </button>
              </div>
            </aside>
          )}

          {!openPanel && (
            <button
              onClick={() => setOpenPanel(true)}
              className="fixed right-4 bottom-4 xl:hidden inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-2 rounded-full border border-slate-200 bg-white shadow-md"
            >
              <ChevronRight className="h-3 w-3 rotate-180" /> Details
            </button>
          )}
        </div>
      </main>
    </AppShell>
  );
}
