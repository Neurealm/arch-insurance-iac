import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Bell, BookCheck, Bot, Briefcase, Building2, Cloud, Cog, Container, Database,
  FileSearch, FileText, GitBranch, Globe, HelpCircle, KeyRound, LayoutDashboard, Layers,
  Package, Plug, RefreshCw, ScrollText, Scale, Search, Server, ServerCog, ShieldAlert,
  ShieldCheck, UserCog, Sparkles, X, ChevronRight, AlertTriangle, CheckCircle2, DollarSign,
  Network, Eye, Gauge, Workflow, ArrowUpRight, Filter, Boxes, Lock, Radar, BarChart3, Zap,
  TrendingUp, Send, AlertOctagon, Users, ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  PieChart, Pie, Cell, AreaChart, Area, Legend, LineChart, Line, RadialBarChart, RadialBar,
} from "recharts";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// ============== SIDEBAR ==============
const navSections = [
  { label: "Command Center", items: [
    { id: "ops", label: "Operations Overview", icon: LayoutDashboard, to: "/enterprise-certificate-management" },
    { id: "risk", label: "Risk & Exposure", icon: ShieldAlert, to: "/enterprise-certificate-management/risk-exposure" },
    { id: "map", label: "Global Map", icon: Globe, to: "/enterprise-certificate-management/global-map" },
    { id: "life", label: "Lifecycle", icon: Activity, to: "/enterprise-certificate-management/lifecycle" },
    { id: "biz", label: "Business Services", icon: Briefcase, to: "/enterprise-certificate-management/business-services" },
    { id: "rep", label: "Reports", icon: FileText, to: "/enterprise-certificate-management/reports" },
  ]},
  { label: "Operations", items: [
    { id: "auto", label: "Agentic Execution Center", icon: Sparkles, to: "/enterprise-certificate-management/agentic-execution" },
    { id: "co", label: "Digital Coworkers", icon: Bot, to: "/enterprise-certificate-management/digital-coworkers" },
    { id: "oc", label: "Operations Center", icon: ServerCog, to: "/enterprise-certificate-management/operations-center" },
    { id: "cm", label: "Change Manager", icon: GitBranch, to: "/enterprise-certificate-management/change-manager" },
    { id: "int", label: "Integrations", icon: Plug, to: "/enterprise-certificate-management/integrations", active: true },
  ]},
  { label: "Security & Compliance", items: [
    { id: "sec", label: "Security Posture", icon: ShieldCheck, to: "/enterprise-certificate-management/security-posture" },
    { id: "com", label: "Compliance Center", icon: BookCheck, to: "/enterprise-certificate-management/compliance-center" },
    { id: "audit", label: "Audit & Evidence", icon: FileSearch, to: "/enterprise-certificate-management/audit-evidence" },
    { id: "pol", label: "Policy Engine", icon: Scale, to: "/enterprise-certificate-management/policy-engine" },
    { id: "ct", label: "CT Logs Monitor", icon: ScrollText },
  ]},
  { label: "Administration", items: [
    { id: "inv", label: "Inventory", icon: Package },
    { id: "iss", label: "Issuers & CAs", icon: Building2 },
    { id: "acc", label: "Account Management", icon: UserCog },
    { id: "sys", label: "System Settings", icon: Cog },
  ]},
];

function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.45 }}
      className="w-[240px] shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 flex flex-col"
    >
      <div className="px-5 pt-5 pb-4 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 grid place-items-center text-white text-xs font-bold">n</div>
        <div className="leading-tight">
          <div className="text-[11px] text-slate-500 font-medium">neurealm</div>
          <div className="text-base font-bold text-slate-900 -mt-0.5">RunOps</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {navSections.map((s) => (
          <div key={s.label} className="mt-4">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</div>
            <div className="mt-1 space-y-0.5">
              {s.items.map((it: any) => {
                const inner = (<><it.icon className="h-4 w-4" /><span>{it.label}</span></>);
                const cls = cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors",
                  it.active ? "bg-blue-50 text-blue-700 font-semibold" : "text-blue-700 font-semibold hover:bg-blue-50"
                );
                return it.to
                  ? <Link key={it.id} to={it.to} className={cls}>{inner}</Link>
                  : <button key={it.id} className={cls}>{inner}</button>;
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="m-3 p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Ecosystem Health</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">99.4%</span>
          <span className="text-xs opacity-80">Healthy</span>
        </div>
        <div className="text-xs opacity-90">127 platforms · 650 APIs</div>
      </div>
    </motion.aside>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="min-w-0">
        <div className="text-[11px] text-slate-500 font-medium">Enterprise Certificate Management</div>
        <div className="flex items-center gap-2">
          <h1 className="text-[18px] font-bold text-slate-900 truncate">Enterprise Certificate Integrations Hub</h1>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input placeholder="Search platforms, APIs, workflows" className="pl-8 pr-3 h-8 w-72 text-[12px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 outline-none" />
        </div>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1.5"><Plug className="h-3.5 w-3.5" /> Connect Platform</button>
        <button className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"><Bell className="h-4 w-4 text-slate-600" /></button>
        <button className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"><HelpCircle className="h-4 w-4 text-slate-600" /></button>
      </div>
    </header>
  );
}

// ============== COUNTER ==============
function useCountUp(target: number, duration = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}
function KpiCard({ icon: Icon, label, value, suffix, accent, trend }: any) {
  const n = useCountUp(value);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div className={cn("absolute inset-x-0 top-0 h-0.5", accent)} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">{n.toLocaleString()}{suffix}</div>
        </div>
        <div className="h-9 w-9 rounded-lg bg-slate-50 grid place-items-center text-slate-600"><Icon className="h-4 w-4" /></div>
      </div>
      {trend && (
        <div className="mt-2 text-[11px] text-emerald-600 font-semibold inline-flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> {trend}
        </div>
      )}
    </motion.div>
  );
}

// ============== ARCHITECTURE LAYERS ==============
const LAYERS = [
  { id: "biz",   label: "Business Services",        icon: Briefcase,  color: "from-fuchsia-500 to-pink-600",  count: 500,   sub: "Tier-1 customer-facing capabilities" },
  { id: "apps",  label: "Applications",             icon: Boxes,      color: "from-sky-500 to-blue-600",      count: 1200,  sub: "Application portfolio" },
  { id: "core",  label: "Neurealm RunOps Platform", icon: Workflow,   color: "from-blue-600 to-indigo-700",   count: 1,     sub: "Operational control plane", hero: true },
  { id: "cw",    label: "Digital Coworkers",        icon: Bot,        color: "from-violet-500 to-indigo-600", count: 12,    sub: "Always-on automation workforce" },
  { id: "ent",   label: "Enterprise Integrations",  icon: Plug,       color: "from-amber-500 to-orange-600",  count: 127,   sub: "ITSM · Identity · Security · Observability" },
  { id: "infra", label: "Infrastructure & PKI",     icon: Server,     color: "from-emerald-500 to-teal-600",  count: 28000, sub: "Endpoints, certs, key vaults" },
];

// ============== INTEGRATION CATEGORIES ==============
type Platform = {
  id: string; name: string; status: "Healthy" | "Degraded" | "Disconnected";
  metrics: { label: string; value: string }[]; coverage: number; health: number;
  description?: string;
};
const CATEGORIES = [
  {
    id: "ca", label: "Certificate Authorities", icon: KeyRound, color: "from-amber-500 to-orange-600",
    rowKeys: ["Certs Managed","Issued (30d)","Renewals (30d)","Risk"],
    platforms: [
      { id: "digicert",  name: "DigiCert",            status: "Healthy" as const, metrics: [{label:"Certs",value:"82,400"},{label:"Issued",value:"3,200"},{label:"Renewals",value:"1,420"},{label:"Risk",value:"Low"}],  coverage: 98, health: 99, description: "Primary public-trust CA for customer-facing services." },
      { id: "entrust",   name: "Entrust",             status: "Healthy" as const, metrics: [{label:"Certs",value:"24,100"},{label:"Issued",value:"840"},{label:"Renewals",value:"420"},{label:"Risk",value:"Low"}],   coverage: 96, health: 99 },
      { id: "globalsign",name: "GlobalSign",          status: "Healthy" as const, metrics: [{label:"Certs",value:"12,800"},{label:"Issued",value:"320"},{label:"Renewals",value:"180"},{label:"Risk",value:"Low"}],   coverage: 94, health: 98 },
      { id: "sectigo",   name: "Sectigo",             status: "Healthy" as const, metrics: [{label:"Certs",value:"8,600"}, {label:"Issued",value:"210"},{label:"Renewals",value:"110"},{label:"Risk",value:"Low"}],   coverage: 92, health: 98 },
      { id: "msca",      name: "Microsoft CA",        status: "Healthy" as const, metrics: [{label:"Certs",value:"48,200"},{label:"Issued",value:"1,840"},{label:"Renewals",value:"920"},{label:"Risk",value:"Low"}], coverage: 99, health: 99 },
      { id: "vault",     name: "HashiCorp Vault PKI", status: "Healthy" as const, metrics: [{label:"Certs",value:"42,300"},{label:"Issued",value:"5,200"},{label:"Renewals",value:"3,800"},{label:"Risk",value:"Low"}], coverage: 100, health: 99 },
      { id: "ipki",      name: "Internal PKI",        status: "Degraded" as const, metrics: [{label:"Certs",value:"31,400"},{label:"Issued",value:"720"},{label:"Renewals",value:"410"},{label:"Risk",value:"Med"}],  coverage: 88, health: 92 },
    ] as Platform[],
  },
  {
    id: "clm", label: "Certificate Lifecycle Platforms", icon: ShieldCheck, color: "from-blue-500 to-indigo-600",
    rowKeys: ["Inventory","Automation","Workflows","Coworker Acts"],
    platforms: [
      { id: "venafi",    name: "Venafi",                            status: "Healthy" as const, metrics: [{label:"Inventory",value:"148K"},{label:"Auto",value:"96%"},{label:"Workflows",value:"412"},{label:"Acts",value:"38K"}], coverage: 96, health: 99 },
      { id: "keyfactor", name: "Keyfactor",                         status: "Healthy" as const, metrics: [{label:"Inventory",value:"84K"}, {label:"Auto",value:"94%"},{label:"Workflows",value:"212"},{label:"Acts",value:"21K"}], coverage: 94, health: 99 },
      { id: "digiclm",   name: "DigiCert Trust Lifecycle Manager",  status: "Healthy" as const, metrics: [{label:"Inventory",value:"62K"}, {label:"Auto",value:"95%"},{label:"Workflows",value:"148"},{label:"Acts",value:"14K"}], coverage: 92, health: 98 },
      { id: "cyberark",  name: "CyberArk Certificate Manager",      status: "Healthy" as const, metrics: [{label:"Inventory",value:"24K"}, {label:"Auto",value:"92%"},{label:"Workflows",value:"96"}, {label:"Acts",value:"6K"}],  coverage: 90, health: 98 },
    ] as Platform[],
  },
  {
    id: "itsm", label: "ITSM Platforms", icon: Workflow, color: "from-violet-500 to-purple-600",
    rowKeys: ["Changes (30d)","Approvals","Incidents","CMDB CIs"],
    platforms: [
      { id: "snow",  name: "ServiceNow",            status: "Healthy" as const, metrics: [{label:"Changes",value:"1,480"},{label:"Approvals",value:"1,127"},{label:"Incidents",value:"248"},{label:"CIs",value:"248K"}], coverage: 99, health: 99 },
      { id: "jsm",   name: "Jira Service Management",status: "Healthy" as const, metrics: [{label:"Changes",value:"312"},  {label:"Approvals",value:"248"},  {label:"Incidents",value:"82"}, {label:"CIs",value:"42K"}],  coverage: 92, health: 98 },
      { id: "remedy",name: "BMC Remedy",            status: "Degraded" as const, metrics: [{label:"Changes",value:"148"},  {label:"Approvals",value:"112"},  {label:"Incidents",value:"38"}, {label:"CIs",value:"18K"}],  coverage: 84, health: 91 },
      { id: "fresh", name: "Freshservice",          status: "Healthy" as const, metrics: [{label:"Changes",value:"68"},   {label:"Approvals",value:"54"},   {label:"Incidents",value:"22"}, {label:"CIs",value:"8K"}],   coverage: 88, health: 98 },
    ] as Platform[],
  },
  {
    id: "iam", label: "Identity Platforms", icon: Lock, color: "from-rose-500 to-red-600",
    rowKeys: ["Owners","Users","Access","Cert Ownership"],
    platforms: [
      { id: "entra", name: "Microsoft Entra", status: "Healthy" as const, metrics: [{label:"Owners",value:"4.2K"},{label:"Users",value:"82K"},{label:"Access",value:"99%"},{label:"Cert Owners",value:"98%"}], coverage: 99, health: 99 },
      { id: "ad",    name: "Active Directory", status: "Healthy" as const, metrics: [{label:"Owners",value:"3.8K"},{label:"Users",value:"82K"},{label:"Access",value:"100%"},{label:"Cert Owners",value:"96%"}], coverage: 100, health: 99 },
      { id: "okta",  name: "Okta",            status: "Healthy" as const, metrics: [{label:"Owners",value:"2.4K"},{label:"Users",value:"48K"},{label:"Access",value:"99%"},{label:"Cert Owners",value:"94%"}], coverage: 96, health: 99 },
      { id: "ping",  name: "Ping Identity",   status: "Healthy" as const, metrics: [{label:"Owners",value:"1.1K"},{label:"Users",value:"22K"},{label:"Access",value:"98%"},{label:"Cert Owners",value:"92%"}], coverage: 92, health: 98 },
      { id: "cyark", name: "CyberArk",        status: "Healthy" as const, metrics: [{label:"Owners",value:"480"}, {label:"Users",value:"6K"}, {label:"Access",value:"100%"},{label:"Cert Owners",value:"100%"}], coverage: 94, health: 99 },
    ] as Platform[],
  },
  {
    id: "cloud", label: "Cloud Platforms", icon: Cloud, color: "from-sky-500 to-blue-600",
    rowKeys: ["Certs","LBs","Clusters","Key Vaults"],
    platforms: [
      { id: "azure",  name: "Azure",        status: "Healthy" as const, metrics: [{label:"Certs",value:"48K"},{label:"LBs",value:"320"},{label:"Clusters",value:"82"},{label:"Vaults",value:"148"}], coverage: 99, health: 99 },
      { id: "aws",    name: "AWS",          status: "Healthy" as const, metrics: [{label:"Certs",value:"62K"},{label:"LBs",value:"412"},{label:"Clusters",value:"96"},{label:"Vaults",value:"168"}], coverage: 99, health: 99 },
      { id: "gcp",    name: "Google Cloud", status: "Healthy" as const, metrics: [{label:"Certs",value:"18K"},{label:"LBs",value:"148"},{label:"Clusters",value:"42"},{label:"Vaults",value:"62"}],  coverage: 96, health: 99 },
      { id: "oracle", name: "Oracle Cloud", status: "Degraded" as const, metrics: [{label:"Certs",value:"6K"}, {label:"LBs",value:"42"}, {label:"Clusters",value:"12"},{label:"Vaults",value:"22"}],  coverage: 88, health: 92 },
    ] as Platform[],
  },
  {
    id: "infra", label: "Infrastructure Platforms", icon: Server, color: "from-slate-500 to-slate-700",
    rowKeys: ["Endpoints","Certs","Deploys","Validation"],
    platforms: [
      { id: "win",    name: "Windows Server", status: "Healthy" as const, metrics: [{label:"Endpoints",value:"12K"},{label:"Certs",value:"38K"},{label:"Deploys",value:"4.2K"},{label:"Val",value:"99%"}], coverage: 98, health: 99 },
      { id: "linux",  name: "Linux",          status: "Healthy" as const, metrics: [{label:"Endpoints",value:"14K"},{label:"Certs",value:"42K"},{label:"Deploys",value:"5.1K"},{label:"Val",value:"99%"}], coverage: 99, health: 99 },
      { id: "iis",    name: "IIS",            status: "Healthy" as const, metrics: [{label:"Endpoints",value:"3.4K"},{label:"Certs",value:"9.8K"},{label:"Deploys",value:"1.2K"},{label:"Val",value:"99%"}], coverage: 96, health: 99 },
      { id: "apache", name: "Apache",         status: "Healthy" as const, metrics: [{label:"Endpoints",value:"2.8K"},{label:"Certs",value:"8.4K"},{label:"Deploys",value:"980"}, {label:"Val",value:"99%"}], coverage: 96, health: 99 },
      { id: "nginx",  name: "NGINX",          status: "Healthy" as const, metrics: [{label:"Endpoints",value:"4.2K"},{label:"Certs",value:"12K"}, {label:"Deploys",value:"1.6K"},{label:"Val",value:"99%"}], coverage: 98, health: 99 },
      { id: "tomcat", name: "Tomcat",         status: "Healthy" as const, metrics: [{label:"Endpoints",value:"1.4K"},{label:"Certs",value:"4.2K"},{label:"Deploys",value:"320"}, {label:"Val",value:"98%"}], coverage: 94, health: 98 },
      { id: "f5",     name: "F5",             status: "Healthy" as const, metrics: [{label:"Endpoints",value:"380"}, {label:"Certs",value:"3.8K"},{label:"Deploys",value:"420"}, {label:"Val",value:"99%"}], coverage: 96, health: 99 },
      { id: "citrix", name: "Citrix",         status: "Healthy" as const, metrics: [{label:"Endpoints",value:"220"}, {label:"Certs",value:"1.2K"},{label:"Deploys",value:"112"}, {label:"Val",value:"98%"}], coverage: 92, health: 98 },
      { id: "vmware", name: "VMware",         status: "Healthy" as const, metrics: [{label:"Endpoints",value:"640"}, {label:"Certs",value:"2.8K"},{label:"Deploys",value:"280"}, {label:"Val",value:"99%"}], coverage: 96, health: 99 },
    ] as Platform[],
  },
  {
    id: "k8s", label: "Container Platforms", icon: Container, color: "from-cyan-500 to-sky-600",
    rowKeys: ["Ingress","Secrets","Certs","Workloads"],
    platforms: [
      { id: "k8s",     name: "Kubernetes", status: "Healthy" as const, metrics: [{label:"Ingress",value:"412"},{label:"Secrets",value:"3.2K"},{label:"Certs",value:"8.6K"},{label:"Workloads",value:"24K"}], coverage: 99, health: 99 },
      { id: "ocp",     name: "OpenShift",  status: "Healthy" as const, metrics: [{label:"Ingress",value:"148"},{label:"Secrets",value:"1.4K"},{label:"Certs",value:"3.2K"},{label:"Workloads",value:"8.2K"}], coverage: 96, health: 99 },
      { id: "aks",     name: "AKS",        status: "Healthy" as const, metrics: [{label:"Ingress",value:"96"}, {label:"Secrets",value:"820"},  {label:"Certs",value:"2.1K"},{label:"Workloads",value:"4.8K"}], coverage: 98, health: 99 },
      { id: "eks",     name: "EKS",        status: "Healthy" as const, metrics: [{label:"Ingress",value:"112"},{label:"Secrets",value:"960"},  {label:"Certs",value:"2.6K"},{label:"Workloads",value:"5.4K"}], coverage: 98, health: 99 },
      { id: "gke",     name: "GKE",        status: "Healthy" as const, metrics: [{label:"Ingress",value:"68"}, {label:"Secrets",value:"480"},  {label:"Certs",value:"1.2K"},{label:"Workloads",value:"3.1K"}], coverage: 96, health: 99 },
    ] as Platform[],
  },
  {
    id: "sec", label: "Security Platforms", icon: ShieldAlert, color: "from-rose-500 to-pink-600",
    rowKeys: ["Events (24h)","Findings","Correlations","Compromised"],
    platforms: [
      { id: "crwd",    name: "CrowdStrike",          status: "Healthy" as const, metrics: [{label:"Events",value:"2.4M"},{label:"Findings",value:"148"},{label:"Corr",value:"98%"},{label:"Comp",value:"0"}], coverage: 99, health: 99 },
      { id: "defend",  name: "Microsoft Defender",   status: "Healthy" as const, metrics: [{label:"Events",value:"1.8M"},{label:"Findings",value:"96"}, {label:"Corr",value:"97%"},{label:"Comp",value:"0"}], coverage: 99, health: 99 },
      { id: "sentinel",name: "Microsoft Sentinel",   status: "Healthy" as const, metrics: [{label:"Events",value:"4.2M"},{label:"Findings",value:"212"},{label:"Corr",value:"98%"},{label:"Comp",value:"2"}], coverage: 98, health: 99 },
      { id: "splunk",  name: "Splunk",               status: "Healthy" as const, metrics: [{label:"Events",value:"8.6M"},{label:"Findings",value:"412"},{label:"Corr",value:"99%"},{label:"Comp",value:"2"}], coverage: 99, health: 99 },
      { id: "qradar",  name: "QRadar",               status: "Healthy" as const, metrics: [{label:"Events",value:"1.2M"},{label:"Findings",value:"62"}, {label:"Corr",value:"96%"},{label:"Comp",value:"0"}], coverage: 92, health: 98 },
      { id: "wiz",     name: "Wiz",                  status: "Healthy" as const, metrics: [{label:"Events",value:"380K"},{label:"Findings",value:"248"},{label:"Corr",value:"99%"},{label:"Comp",value:"0"}], coverage: 98, health: 99 },
    ] as Platform[],
  },
  {
    id: "obs", label: "Observability Platforms", icon: Activity, color: "from-emerald-500 to-teal-600",
    rowKeys: ["Service Health","Telemetry","Validation","Incidents"],
    platforms: [
      { id: "dd",     name: "Datadog",      status: "Healthy" as const, metrics: [{label:"Health",value:"99.4%"},{label:"Telemetry",value:"8.2B"},{label:"Val",value:"99.7%"},{label:"Inc",value:"12"}], coverage: 99, health: 99 },
      { id: "dyn",    name: "Dynatrace",    status: "Healthy" as const, metrics: [{label:"Health",value:"99.6%"},{label:"Telemetry",value:"6.4B"},{label:"Val",value:"99.8%"},{label:"Inc",value:"8"}],  coverage: 98, health: 99 },
      { id: "appd",   name: "AppDynamics",  status: "Degraded" as const, metrics: [{label:"Health",value:"98.2%"},{label:"Telemetry",value:"2.1B"},{label:"Val",value:"99.2%"},{label:"Inc",value:"6"}],  coverage: 88, health: 92 },
      { id: "nr",     name: "New Relic",    status: "Healthy" as const, metrics: [{label:"Health",value:"99.1%"},{label:"Telemetry",value:"1.4B"},{label:"Val",value:"99.4%"},{label:"Inc",value:"4"}],  coverage: 94, health: 98 },
      { id: "prom",   name: "Prometheus",   status: "Healthy" as const, metrics: [{label:"Health",value:"99.5%"},{label:"Telemetry",value:"4.8B"},{label:"Val",value:"99.6%"},{label:"Inc",value:"2"}],  coverage: 98, health: 99 },
      { id: "grafana",name: "Grafana",      status: "Healthy" as const, metrics: [{label:"Health",value:"99.7%"},{label:"Telemetry",value:"—"},   {label:"Val",value:"—"},     {label:"Inc",value:"1"}],  coverage: 98, health: 99 },
    ] as Platform[],
  },
];

const STATUS_STYLE: any = {
  "Healthy":      "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Degraded":     "bg-amber-50 text-amber-700 border-amber-200",
  "Disconnected": "bg-rose-50 text-rose-700 border-rose-200",
};

// ============== COWORKER INTEGRATION MAP ==============
const COWORKER_LINKS = [
  { name: "Certificate Discovery Engineer", icon: Search,        color: "from-sky-500 to-blue-600",    targets: ["CMDB","Cloud APIs","Certificate Authorities","Infrastructure"] },
  { name: "Certificate Risk Analyst",       icon: ShieldAlert,   color: "from-amber-500 to-orange-600",targets: ["Observability","Security Tools","Business Services"] },
  { name: "Renewal Coordinator",            icon: RefreshCw,     color: "from-emerald-500 to-teal-600",targets: ["ServiceNow","Change Management","Certificate Authorities"] },
  { name: "Deployment Engineer",            icon: Workflow,      color: "from-blue-500 to-indigo-600", targets: ["Azure","AWS","F5","Kubernetes"] },
  { name: "Compliance Auditor",             icon: BookCheck,     color: "from-violet-500 to-purple-600", targets: ["Audit Systems","Reporting","Governance"] },
  { name: "Security Investigation Analyst", icon: ShieldCheck,   color: "from-rose-500 to-red-600",    targets: ["SIEM","Threat Intelligence","PKI Systems"] },
];

// ============== DATA FLOW STEPS ==============
const FLOW_STEPS = [
  { l: "DigiCert",                     i: KeyRound,     c: "bg-amber-100 text-amber-700 border-amber-200" },
  { l: "Discovery Engineer",           i: Bot,          c: "bg-violet-100 text-violet-700 border-violet-200" },
  { l: "CMDB",                         i: Database,     c: "bg-blue-100 text-blue-700 border-blue-200" },
  { l: "ServiceNow",                   i: Workflow,     c: "bg-violet-100 text-violet-700 border-violet-200" },
  { l: "Renewal Coordinator",          i: Bot,          c: "bg-violet-100 text-violet-700 border-violet-200" },
  { l: "Azure Key Vault",              i: Lock,         c: "bg-sky-100 text-sky-700 border-sky-200" },
  { l: "Deployment Engineer",          i: Bot,          c: "bg-violet-100 text-violet-700 border-violet-200" },
  { l: "Validation Engineer",          i: CheckCircle2, c: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { l: "Compliance Auditor",           i: BookCheck,    c: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200" },
];

// ============== ANALYTICS ==============
const HEALTH_TREND = Array.from({ length: 12 }).map((_, i) => ({
  m: ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"][i],
  healthy: 92 + i * 0.55 + Math.round(Math.sin(i) * 1.5),
  errors:  6 - i * 0.32 + Math.round(Math.cos(i) * 0.8),
}));
const CATEGORY_VOLUME = CATEGORIES.map((c) => ({
  name: c.label.replace("Platforms", "").trim().replace("Certificate Authorities","CAs").replace("Certificate Lifecycle","CLM"),
  value: c.platforms.length * 18 + Math.round(Math.random() * 80) + 40,
}));
const API_UTILIZATION = Array.from({ length: 24 }).map((_, i) => ({
  h: `${i}:00`,
  calls: 80000 + Math.round(Math.sin(i / 3) * 24000) + (i > 8 && i < 18 ? 22000 : 0),
}));

// ============== AUTOMATIONS ==============
const AUTOMATIONS = [
  { name: "Auto Discovery",       runs: 18000, success: 99.6, saved: "8,400 hrs", icon: Search,        c: "from-sky-500 to-blue-600" },
  { name: "Auto Renewal",         runs: 14200, success: 99.7, saved: "12,800 hrs", icon: RefreshCw,    c: "from-emerald-500 to-teal-600" },
  { name: "Auto Deployment",      runs: 3400,  success: 99.8, saved: "6,200 hrs", icon: Workflow,      c: "from-blue-500 to-indigo-600" },
  { name: "Auto Validation",      runs: 14200, success: 99.7, saved: "4,800 hrs", icon: CheckCircle2,  c: "from-green-500 to-emerald-600" },
  { name: "CMDB Sync",            runs: 248000,success: 100,  saved: "5,400 hrs", icon: Database,      c: "from-violet-500 to-indigo-600" },
  { name: "Incident Creation",    runs: 412,   success: 99.5, saved: "1,200 hrs", icon: AlertOctagon,  c: "from-amber-500 to-orange-600" },
  { name: "Compliance Evidence",  runs: 249000,success: 100,  saved: "7,000 hrs", icon: BookCheck,     c: "from-fuchsia-500 to-pink-600" },
];

// ============== MAIN ==============
export default function CertificateIntegrationsHub() {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [selected, setSelected] = useState<{ category: string; platform: Platform } | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const visibleCategories = useMemo(() => activeCat === "all" ? CATEGORIES : CATEGORIES.filter((c) => c.id === activeCat), [activeCat]);

  return (
    <div className="min-h-screen bg-slate-50/60 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">

          {/* KPI LAYER */}
          <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
            <KpiCard icon={Plug}        label="Integrated Platforms"  value={127}   accent="bg-gradient-to-r from-sky-400 to-blue-500"        trend="+8 this qtr" />
            <KpiCard icon={KeyRound}    label="Certificate Authorities" value={7}    accent="bg-gradient-to-r from-amber-400 to-orange-500"   trend="100% covered" />
            <KpiCard icon={Cloud}       label="Cloud Accounts"        value={35}    accent="bg-gradient-to-r from-cyan-400 to-sky-500"        trend="multi-cloud" />
            <KpiCard icon={Boxes}       label="Applications"          value={1200}  accent="bg-gradient-to-r from-blue-400 to-indigo-500"     trend="+18% MoM" />
            <KpiCard icon={Briefcase}   label="Business Services"     value={500}   accent="bg-gradient-to-r from-fuchsia-400 to-pink-500"    trend="Tier-1 mapped" />
            <KpiCard icon={Workflow}    label="Automation Workflows"  value={18000} accent="bg-gradient-to-r from-emerald-400 to-teal-500"    trend="+24% MoM" />
            <KpiCard icon={Bot}         label="Coworkers Active"      value={12}    accent="bg-gradient-to-r from-violet-400 to-indigo-500"   trend="96% conf" />
            <KpiCard icon={Server}      label="Connected Endpoints"   value={28000} accent="bg-gradient-to-r from-slate-400 to-slate-600"     trend="global" />
            <KpiCard icon={Database}    label="Data Sources"          value={94}    accent="bg-gradient-to-r from-indigo-400 to-violet-500"   trend="streaming" />
            <KpiCard icon={Network}     label="API Connections"       value={650}   accent="bg-gradient-to-r from-green-400 to-emerald-500"   trend="99.4% healthy" />
          </section>

          {/* ARCHITECTURE MAP */}
          <section className="rounded-xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">Integration Architecture Map</h2>
                <p className="text-[12px] text-slate-500">Layered model · animated data flows · executive view</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live data flow</span>
              </div>
            </div>
            <div className="relative space-y-2">
              {LAYERS.map((layer, idx) => (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                  className={cn("relative rounded-xl border p-3 flex items-center gap-3 backdrop-blur",
                    layer.hero
                      ? "border-blue-300 bg-gradient-to-r from-blue-600/95 to-indigo-700/95 text-white shadow-lg"
                      : "border-slate-200 bg-white/80")}
                >
                  <div className={cn("h-10 w-10 rounded-lg bg-gradient-to-br grid place-items-center text-white shrink-0", layer.color)}>
                    <layer.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider", layer.hero ? "text-blue-100" : "text-slate-400")}>Layer {idx + 1}</span>
                      <span className={cn("text-[14px] font-bold", layer.hero ? "text-white" : "text-slate-900")}>{layer.label}</span>
                    </div>
                    <div className={cn("text-[11.5px]", layer.hero ? "text-blue-100" : "text-slate-500")}>{layer.sub}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn("text-[20px] font-bold tabular-nums", layer.hero ? "text-white" : "text-slate-900")}>
                      {layer.count >= 1000 ? `${(layer.count / 1000).toFixed(layer.count >= 10000 ? 0 : 1)}K` : layer.count}
                    </div>
                    <div className={cn("text-[9.5px] uppercase tracking-wider font-bold", layer.hero ? "text-blue-100" : "text-slate-400")}>
                      {layer.id === "core" ? "Control Plane" : "Connected"}
                    </div>
                  </div>
                  {/* Animated flow ticks between layers */}
                  {idx < LAYERS.length - 1 && (
                    <div className="absolute left-[34px] -bottom-2 z-10 h-4 w-px bg-gradient-to-b from-blue-400/80 to-transparent">
                      <motion.span
                        className="absolute -left-[3px] h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                        animate={{ y: [0, 16], opacity: [1, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: idx * 0.25 }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>

          {/* FILTERS */}
          <section className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-2 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">Category</span>
            <button onClick={() => setActiveCat("all")} className={cn("h-7 px-2.5 text-[11px] font-semibold rounded-md border transition-colors", activeCat === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")}>All</button>
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setActiveCat(c.id)} className={cn("h-7 px-2.5 text-[11px] font-semibold rounded-md border transition-colors inline-flex items-center gap-1.5", activeCat === c.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")}>
                <c.icon className="h-3 w-3" /> {c.label}
              </button>
            ))}
            <span className="h-5 w-px bg-slate-200 mx-1" />
            <select className="h-7 px-2 text-[11px] font-semibold rounded-md border border-slate-200 bg-white text-slate-700">{["Region: All","NA","EMEA","APAC","LATAM"].map((a) => <option key={a}>{a}</option>)}</select>
            <select className="h-7 px-2 text-[11px] font-semibold rounded-md border border-slate-200 bg-white text-slate-700">{["Service: All","Customer Portal","Payments","Identity","Claims"].map((a) => <option key={a}>{a}</option>)}</select>
            <select className="h-7 px-2 text-[11px] font-semibold rounded-md border border-slate-200 bg-white text-slate-700">{["Health: All","Healthy","Degraded","Disconnected"].map((a) => <option key={a}>{a}</option>)}</select>
            <select className="h-7 px-2 text-[11px] font-semibold rounded-md border border-slate-200 bg-white text-slate-700">{["Coworker: All","Discovery","Risk Analyst","Renewal","Deployment","Validation","Compliance"].map((a) => <option key={a}>{a}</option>)}</select>
            <div className="ml-auto text-[11px] text-slate-500">{visibleCategories.reduce((n, c) => n + c.platforms.length, 0)} platforms</div>
          </section>

          {/* CATEGORIES + PLATFORMS */}
          <section className="space-y-5">
            {visibleCategories.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className={cn("h-7 w-7 rounded-lg bg-gradient-to-br grid place-items-center text-white", cat.color)}>
                    <cat.icon className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[13px] font-bold text-slate-900">{cat.label}</h3>
                  <span className="text-[11px] text-slate-500">({cat.platforms.length})</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {cat.platforms.map((p, i) => (
                    <motion.button
                      key={p.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      onClick={() => setSelected({ category: cat.label, platform: p })}
                      onDoubleClick={() => { setSelected({ category: cat.label, platform: p }); setWorkspaceOpen(true); }}
                      className="text-left rounded-xl border border-slate-200 bg-white p-3 hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-200 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn("h-8 w-8 rounded-lg bg-gradient-to-br grid place-items-center text-white shrink-0", cat.color)}>
                            <cat.icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-bold text-slate-900 truncate group-hover:text-blue-700">{p.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">{cat.label}</div>
                          </div>
                        </div>
                        <span className={cn("shrink-0 text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border inline-flex items-center gap-1", STATUS_STYLE[p.status])}>
                          <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", p.status === "Healthy" ? "bg-emerald-500" : p.status === "Degraded" ? "bg-amber-500" : "bg-rose-500")} />
                          {p.status}
                        </span>
                      </div>
                      <div className="mt-2.5 grid grid-cols-2 gap-1">
                        {p.metrics.slice(0, 4).map((m) => (
                          <div key={m.label} className="rounded-md bg-slate-50 border border-slate-100 px-1.5 py-1">
                            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold truncate">{m.label}</div>
                            <div className="text-[11px] font-bold text-slate-900 truncate">{m.value}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[10px]">
                        <span className="text-slate-500">Coverage</span>
                        <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
                          <motion.div className={cn("h-full bg-gradient-to-r", cat.color)} initial={{ width: 0 }} animate={{ width: `${p.coverage}%` }} transition={{ duration: 1 }} />
                        </div>
                        <span className="font-bold text-slate-700 tabular-nums">{p.coverage}%</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* DATA FLOW VISUALIZATION */}
          <section className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Live Data Flow</div>
                <h3 className="text-[16px] font-bold mt-0.5">DigiCert → Discovery → CMDB → ServiceNow → Renewal → Azure → Deploy → Validate → Audit</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Streaming</span>
            </div>
            <div className="overflow-x-auto -mx-5 px-5 pb-2">
              <div className="flex items-center gap-2 min-w-max">
                {FLOW_STEPS.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className={cn("min-w-[140px] rounded-lg border px-3 py-2.5 backdrop-blur", s.c)}>
                      <div className="flex items-center gap-1.5">
                        <s.i className="h-3.5 w-3.5" />
                        <span className="text-[11.5px] font-bold truncate">{s.l}</span>
                      </div>
                      <div className="mt-1 text-[10px] opacity-80">{Math.round(800 + Math.random() * 4200).toLocaleString()} ev/s</div>
                    </motion.div>
                    {i < FLOW_STEPS.length - 1 && (
                      <div className="relative w-10 h-1 rounded-full bg-white/15 overflow-hidden">
                        <motion.span
                          className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                          animate={{ x: ["-10%", "110%"], opacity: [1, 1, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.18 }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* COWORKER INTEGRATION LAYER + HEALTH */}
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-8 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Digital Coworker Integration Layer</h3>
                  <p className="text-[11px] text-slate-500">Cross-platform automation surface</p>
                </div>
                <Bot className="h-4 w-4 text-violet-500" />
              </div>
              <div className="space-y-2">
                {COWORKER_LINKS.map((cw, i) => (
                  <motion.div key={cw.name} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50/60 transition-colors">
                    <div className={cn("h-9 w-9 rounded-lg bg-gradient-to-br grid place-items-center text-white shrink-0", cw.color)}>
                      <cw.icon className="h-4 w-4" />
                    </div>
                    <div className="text-[12.5px] font-bold text-slate-900 min-w-[200px] shrink-0">{cw.name}</div>
                    <div className="flex items-center gap-1.5 flex-wrap flex-1">
                      {cw.targets.map((t, ix) => (
                        <span key={t} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5">
                          {ix === 0 && <ArrowRight className="h-2.5 w-2.5 text-slate-400" />}
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Integration Health</h3>
                  <p className="text-[11px] text-slate-500">Live ecosystem posture</p>
                </div>
                <Gauge className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <HealthTile label="Healthy" value={121} color="bg-emerald-500 text-emerald-700 bg-emerald-50 border-emerald-200" />
                <HealthTile label="Degraded" value={5}  color="bg-amber-500 text-amber-700 bg-amber-50 border-amber-200" />
                <HealthTile label="Down"     value={1}  color="bg-rose-500 text-rose-700 bg-rose-50 border-rose-200" />
              </div>
              <div className="space-y-1.5">
                {[
                  { l: "API Errors (24h)",        v: "0.08%", pct: 99.92, c: "bg-emerald-500" },
                  { l: "Workflow Failures",      v: "0.3%",  pct: 99.7,  c: "bg-blue-500" },
                  { l: "Authentication Issues",  v: "0",     pct: 100,   c: "bg-violet-500" },
                  { l: "Rate-limit Throttling",  v: "0.4%",  pct: 99.6,  c: "bg-amber-500" },
                ].map((r) => (
                  <div key={r.l} className="rounded-lg border border-slate-100 p-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 font-medium">{r.l}</span>
                      <span className="text-slate-900 font-bold tabular-nums">{r.v}</span>
                    </div>
                    <div className="h-1 rounded-full bg-slate-200 overflow-hidden mt-1"><motion.div className={cn("h-full", r.c)} initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ duration: 1 }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* BUSINESS SERVICE DEPENDENCY + AUTOMATION MARKETPLACE */}
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Service Dependency Path</h3>
                  <p className="text-[11px] text-slate-500">Customer Portal · live trace</p>
                </div>
                <Network className="h-4 w-4 text-blue-500" />
              </div>
              <div className="space-y-1.5">
                {[
                  { l: "Customer Portal",      sub: "Business Service · Tier-1",   i: Briefcase,  c: "from-fuchsia-500 to-pink-600",  meta: "$420M revenue" },
                  { l: "Portal Web · API · Auth",sub: "14 Applications",            i: Boxes,      c: "from-sky-500 to-blue-600",      meta: "99.99% SLA" },
                  { l: "TLS · mTLS · Code-sign",sub: "148 Certificates",            i: KeyRound,   c: "from-amber-500 to-orange-600",  meta: "100% covered" },
                  { l: "ServiceNow · Azure KV · F5", sub: "12 Integrations",        i: Plug,       c: "from-violet-500 to-indigo-600", meta: "all healthy" },
                  { l: "AWS us-east · Azure eastus", sub: "Infrastructure",         i: Server,     c: "from-emerald-500 to-teal-600",  meta: "multi-region" },
                ].map((row, i, arr) => (
                  <div key={i} className="relative">
                    <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5">
                      <div className={cn("h-8 w-8 rounded-lg bg-gradient-to-br grid place-items-center text-white shrink-0", row.c)}>
                        <row.i className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-bold text-slate-900 truncate">{row.l}</div>
                        <div className="text-[10.5px] text-slate-500 truncate">{row.sub}</div>
                      </div>
                      <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5">{row.meta}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="absolute left-[26px] h-2 w-px bg-slate-200 my-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Automation Marketplace</h3>
                  <p className="text-[11px] text-slate-500">Always-on cross-platform workflows</p>
                </div>
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {AUTOMATIONS.map((a, i) => (
                  <motion.div key={a.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="rounded-lg border border-slate-100 p-2.5 hover:shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-8 w-8 rounded-lg bg-gradient-to-br grid place-items-center text-white", a.c)}>
                        <a.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold text-slate-900 truncate">{a.name}</div>
                        <div className="text-[10.5px] text-slate-500 truncate">{a.runs.toLocaleString()} runs · saved {a.saved}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[12px] font-bold text-emerald-600 tabular-nums">{a.success}%</div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider">Success</div>
                      </div>
                    </div>
                    <div className="mt-1.5 h-1 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div className={cn("h-full bg-gradient-to-r", a.c)} initial={{ width: 0 }} animate={{ width: `${a.success}%` }} transition={{ duration: 1 }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ANALYTICS */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-bold text-slate-900">Integration Analytics</h3>
                <p className="text-[11px] text-slate-500">Volume, health, utilization, success</p>
              </div>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </div>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 lg:col-span-5 rounded-lg border border-slate-100 p-3">
                <div className="text-[11px] font-bold text-slate-700 mb-1">Integrations by Category</div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={CATEGORY_VOLUME} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} interval={0} angle={-15} dy={6} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <RTooltip cursor={{ fill: "rgba(59,130,246,0.06)" }} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[6,6,0,0]} fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="col-span-12 lg:col-span-7 rounded-lg border border-slate-100 p-3">
                <div className="text-[11px] font-bold text-slate-700 mb-1">Integration Health Trend (12 mo)</div>
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={HEALTH_TREND} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.35} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis yAxisId="l" domain={[88, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <RTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                    <Area yAxisId="l" type="monotone" dataKey="healthy" stroke="#10b981" strokeWidth={2} fill="url(#hh)" name="Healthy %" />
                    <Line yAxisId="r" type="monotone" dataKey="errors"  stroke="#ef4444" strokeWidth={2} dot={false} name="API Errors %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="col-span-12 lg:col-span-8 rounded-lg border border-slate-100 p-3">
                <div className="text-[11px] font-bold text-slate-700 mb-1">API Utilization (24h)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={API_UTILIZATION} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="api" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.45} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="h" tick={{ fontSize: 9, fill: "#64748b" }} interval={2} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <RTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={2} fill="url(#api)" name="API calls" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="col-span-12 lg:col-span-4 rounded-lg border border-slate-100 p-3">
                <div className="text-[11px] font-bold text-slate-700 mb-1">Coworker Utilization</div>
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart innerRadius={30} outerRadius={90} data={[
                    { name: "Discovery",  value: 92, fill: "#0ea5e9" },
                    { name: "Risk",       value: 78, fill: "#f59e0b" },
                    { name: "Renewal",    value: 88, fill: "#10b981" },
                    { name: "Deploy",     value: 82, fill: "#3b82f6" },
                    { name: "Compliance", value: 74, fill: "#a855f7" },
                  ]}>
                    <RadialBar background dataKey="value" cornerRadius={8} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                    <RTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* CLOSING STRIP */}
          <section className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-5">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 lg:col-span-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Operational Control Plane</div>
                <div className="text-[18px] font-bold mt-1">Keep every tool. Unify every workflow.</div>
                <p className="text-[12.5px] text-slate-300 mt-1.5 max-w-2xl">
                  Neurealm RunOps doesn't replace your CAs, ITSM, cloud, security or observability platforms. It becomes the operational control plane that orchestrates them into a single managed operating model.
                </p>
              </div>
              <div className="col-span-12 lg:col-span-4 grid grid-cols-3 gap-2">
                {[{ l: "Platforms", v: "127" }, { l: "APIs", v: "650" }, { l: "Workflows", v: "18K" }].map((m) => (
                  <div key={m.l} className="rounded-lg bg-white/5 border border-white/10 p-2.5 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">{m.l}</div>
                    <div className="text-[20px] font-bold tabular-nums">{m.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </main>
      </div>

      {/* ============ DETAIL PANEL ============ */}
      <Sheet open={!!selected && !workspaceOpen} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[40vw] p-0 bg-white overflow-y-auto">
          {selected && (() => {
            const { category, platform } = selected;
            return (
              <>
                <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
                  <SheetHeader>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">{category}</span>
                      <span className={cn("ml-auto text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-white/10 border-white/20 inline-flex items-center gap-1")}>
                        <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", platform.status === "Healthy" ? "bg-emerald-400" : platform.status === "Degraded" ? "bg-amber-400" : "bg-rose-400")} />
                        {platform.status}
                      </span>
                    </div>
                    <SheetTitle className="text-white text-[20px] mt-1">{platform.name}</SheetTitle>
                    <div className="text-[12px] opacity-90">Coverage {platform.coverage}% · Health {platform.health}%</div>
                  </SheetHeader>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {platform.metrics.map((m) => (
                      <div key={m.label} className="rounded-lg bg-white/10 border border-white/15 p-2">
                        <div className="text-[9.5px] uppercase tracking-wider opacity-80 font-bold truncate">{m.label}</div>
                        <div className="text-[14px] font-bold truncate">{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <Section title="Executive Summary">
                    <p className="text-[12.5px] text-slate-700 leading-relaxed">
                      {platform.description ?? `${platform.name} is integrated as a first-class participant in the certificate ecosystem. RunOps orchestrates discovery, lifecycle, deployment and audit workflows through its native APIs while preserving existing operational ownership.`}
                    </p>
                  </Section>

                  <Section title={category.includes("Authorities") ? "Certificates Managed" : category.includes("Cloud") ? "Cloud Resources" : "Operational Footprint"}>
                    <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                      {platform.metrics.map((m) => (
                        <div key={m.label} className="rounded-lg bg-slate-50 border border-slate-100 p-2">
                          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{m.label}</div>
                          <div className="font-bold text-slate-900 text-[14px]">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section title="Digital Coworkers Using This Integration">
                    <div className="space-y-1.5">
                      {["Discovery Engineer","Renewal Coordinator","Deployment Engineer","Validation Engineer","Compliance Auditor"].slice(0, 4).map((cw) => (
                        <div key={cw} className="flex items-center gap-2 rounded-lg border border-slate-100 p-1.5 text-[11.5px]">
                          <Bot className="h-3.5 w-3.5 text-violet-600" />
                          <span className="font-semibold text-slate-800 flex-1">{cw}</span>
                          <span className="text-[10px] font-bold text-emerald-700">Active</span>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section title="Risk Exposure">
                    <BodyList items={[
                      "No active threats detected",
                      "Rotation policy compliant",
                      "Mutual TLS enforced on all API calls",
                      "Secrets rotated automatically every 30 days",
                    ]} />
                  </Section>

                  <Section title="Dependencies">
                    <div className="flex flex-wrap gap-1.5">
                      {["ServiceNow CMDB","Azure Key Vault","Splunk","Datadog","Compliance Vault"].map((d) => (
                        <span key={d} className="text-[10.5px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 inline-flex items-center gap-1"><Layers className="h-2.5 w-2.5" /> {d}</span>
                      ))}
                    </div>
                  </Section>

                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => setWorkspaceOpen(true)} className="flex-1 h-9 rounded-lg bg-blue-600 text-white text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-blue-700"><Eye className="h-3.5 w-3.5" /> Open Workspace</button>
                    <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50"><Send className="h-3.5 w-3.5" /> Test API</button>
                    <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50"><RefreshCw className="h-3.5 w-3.5" /> Resync</button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* ============ WORKSPACE PANEL ============ */}
      <Sheet open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[62vw] p-0 bg-white overflow-y-auto">
          {selected && (
            <>
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                  <button onClick={() => setWorkspaceOpen(false)} className="h-7 w-7 grid place-items-center rounded-md border border-slate-200 hover:bg-white"><X className="h-3.5 w-3.5" /></button>
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center text-white"><Plug className="h-3.5 w-3.5" /></div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{selected.category} Integration Center</div>
                    <div className="text-[15px] font-bold text-slate-900">{selected.platform.name}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <button className="h-8 px-3 text-[11.5px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Resync</button>
                    <button className="h-8 px-3 text-[11.5px] font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1.5"><Workflow className="h-3.5 w-3.5" /> New Workflow</button>
                  </div>
                </div>
              </div>
              <div className="p-5 grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-8 space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-[12px] font-bold text-slate-900 mb-2">Connected Systems</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {["RunOps Core","CMDB","ServiceNow","Azure KV","Splunk","Datadog","Compliance Vault","Audit Lake"].map((s) => (
                        <div key={s} className="rounded-lg border border-slate-100 p-2 text-center">
                          <div className="h-6 w-6 mx-auto rounded-md bg-slate-100 grid place-items-center text-slate-600"><Server className="h-3 w-3" /></div>
                          <div className="text-[11px] font-bold text-slate-800 mt-1 truncate">{s}</div>
                          <div className="text-[9.5px] text-emerald-700 font-semibold">Healthy</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-[12px] font-bold text-slate-900 mb-2">API Calls (24h)</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={API_UTILIZATION} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                        <defs><linearGradient id="wsapi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                        <XAxis dataKey="h" tick={{ fontSize: 9, fill: "#64748b" }} interval={2} />
                        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                        <RTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        <Area type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} fill="url(#wsapi)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-[12px] font-bold text-slate-900 mb-2">Active Workflows</div>
                    <div className="space-y-1.5">
                      {["Discovery sync (every 5m)","Renewal trigger pipeline","CMDB CI reconciliation","Audit evidence push","CT log correlation"].map((w) => (
                        <div key={w} className="flex items-center gap-2 rounded-lg border border-slate-100 p-2 text-[11.5px]">
                          <Workflow className="h-3.5 w-3.5 text-blue-600" />
                          <span className="font-semibold text-slate-800 flex-1">{w}</span>
                          <span className="text-[10px] font-bold text-emerald-700">Running</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-4 space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-[12px] font-bold text-slate-900 mb-2 inline-flex items-center gap-1.5"><Bot className="h-3.5 w-3.5 text-violet-600" /> Coworker Actions</div>
                    <ul className="space-y-1.5">
                      {[
                        "Discovery Engineer: 412 new objects ingested",
                        "Renewal Coordinator: 38 renewals triggered",
                        "Deployment Engineer: 22 atomic switchovers",
                        "Compliance Auditor: 1,840 evidence records",
                      ].map((a) => (
                        <li key={a} className="text-[11.5px] text-slate-700 flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" /> {a}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-[12px] font-bold text-slate-900 mb-2 inline-flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5 text-emerald-600" /> Operational Metrics</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {[
                        { l: "Uptime",    v: "99.99%" },
                        { l: "Latency",   v: "84 ms" },
                        { l: "Throughput",v: "8.2K/s" },
                        { l: "Error Rate",v: "0.04%" },
                      ].map((m) => (
                        <div key={m.l} className="rounded-md bg-slate-50 border border-slate-100 p-2">
                          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{m.l}</div>
                          <div className="font-bold text-slate-900 text-[14px]">{m.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-[12px] font-bold text-slate-900 mb-2 inline-flex items-center gap-1.5"><Network className="h-3.5 w-3.5 text-blue-600" /> Dependencies</div>
                    <div className="flex flex-wrap gap-1.5">
                      {["RunOps Core","CMDB","Audit Lake","Identity Broker","Secrets Mgr"].map((d) => (
                        <span key={d} className="text-[10.5px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 inline-flex items-center gap-1"><Layers className="h-2.5 w-2.5" /> {d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function HealthTile({ label, value, color }: { label: string; value: number; color: string }) {
  // color is composite of "<dotBg> <textColor> <bg> <border>"
  const [dotBg, textColor, bg, border] = color.split(" ");
  return (
    <div className={cn("rounded-lg border p-2 text-center", bg, border)}>
      <div className={cn("inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold", textColor)}>
        <span className={cn("h-1.5 w-1.5 rounded-full", dotBg)} /> {label}
      </div>
      <div className={cn("text-[20px] font-bold tabular-nums", textColor)}>{value}</div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">{title}</div>
      {children}
    </div>
  );
}
function BodyList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((i) => (
        <li key={i} className="text-[12.5px] text-slate-700 flex items-start gap-1.5">
          <ChevronRight className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" /> {i}
        </li>
      ))}
    </ul>
  );
}
