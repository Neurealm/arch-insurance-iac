import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Bell, BookCheck, Bot, Briefcase, Building2, Cog, FileSearch, FileText, GitBranch,
  Globe, HelpCircle, LayoutDashboard, Package, Plug, RefreshCw, ScrollText, Scale, Search,
  ServerCog, ShieldAlert, ShieldCheck, UserCog, Sparkles, X, ChevronRight, AlertTriangle,
  Users, DollarSign, Shield, Layers, TrendingUp, CheckCircle2, Heart, CreditCard, KeyRound,
  Cloud, Code2, Database, MessageSquare, Stethoscope, Filter, ArrowUpRight, Network,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
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
    { id: "biz", label: "Business Services", icon: Briefcase, to: "/enterprise-certificate-management/business-services", active: true },
    { id: "rep", label: "Reports", icon: FileText, to: "/enterprise-certificate-management/reports" },
  ]},
  { label: "Operations", items: [
    { id: "auto", label: "Agentic Execution Center", icon: Sparkles, to: "/enterprise-certificate-management/agentic-execution" },
    { id: "co", label: "Digital Coworkers", icon: Bot, to: "/enterprise-certificate-management/digital-coworkers" },
    { id: "oc", label: "Operations Center", icon: ServerCog, to: "/enterprise-certificate-management/operations-center" },
    { id: "cm", label: "Change Manager", icon: GitBranch, to: "/enterprise-certificate-management/change-manager" },
    { id: "int", label: "Integrations", icon: Plug, to: "/enterprise-certificate-management/integrations" },
  ]},
  { label: "Security & Compliance", items: [
    { id: "sec", label: "Security Posture", icon: ShieldCheck },
    { id: "com", label: "Compliance Center", icon: BookCheck },
    { id: "audit", label: "Audit & Evidence", icon: FileSearch },
    { id: "pol", label: "Policy Engine", icon: Scale },
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
        <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Service Health</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">98.9%</span>
          <span className="text-xs opacity-80">Healthy</span>
        </div>
        <div className="text-xs opacity-90">500 services · 42 Tier 1</div>
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
          <h1 className="text-[18px] font-bold text-slate-900 truncate">Business Services Impact Center</h1>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input placeholder="Search services, certs, owners" className="pl-8 pr-3 h-8 w-72 text-[12px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 outline-none" />
        </div>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
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
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function Kpi({ label, value, prefix = "", suffix = "", decimals = 0, accent = "blue", icon: Icon, delay = 0 }: any) {
  const n = useCountUp(value);
  const display = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
  const accents: Record<string, string> = {
    blue: "from-blue-500 to-sky-400 text-blue-600 bg-blue-50",
    emerald: "from-emerald-500 to-teal-400 text-emerald-600 bg-emerald-50",
    violet: "from-violet-500 to-purple-400 text-violet-600 bg-violet-50",
    amber: "from-amber-500 to-orange-400 text-amber-600 bg-amber-50",
    rose: "from-rose-500 to-red-400 text-rose-600 bg-rose-50",
  };
  const a = accents[accent];
  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="relative bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", a.split(" ").slice(0, 2).join(" "))} />
      <div className="flex items-start justify-between">
        <div className="text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
        {Icon && <div className={cn("h-7 w-7 grid place-items-center rounded-lg", a.split(" ").slice(2).join(" "))}><Icon className="h-3.5 w-3.5" /></div>}
      </div>
      <div className="mt-1.5 text-[22px] font-bold text-slate-900 tabular-nums leading-tight">{prefix}{display}{suffix}</div>
    </motion.div>
  );
}

// ============== DATA ==============
type Service = {
  id: string; name: string; group: string; tier: 1 | 2 | 3; icon: any;
  health: "healthy" | "atrisk" | "warning" | "critical"; risk: number;
  revenue: number; customers: number; certs: number; apps: number;
  frameworks: string[]; coworkers: string[]; dependencies: string[];
  txVolume: string; description: string;
};

const SERVICES: Service[] = [
  { id: "portal", name: "Customer Portal", group: "Customer", tier: 1, icon: Users, health: "atrisk", risk: 64, revenue: 120, customers: 28000, certs: 142, apps: 34, frameworks: ["PCI-DSS", "SOC2"], coworkers: ["Discovery", "Risk", "Renewal", "Deployment"], dependencies: ["API Gateway", "Identity Platform", "Cloudflare CDN", "DigiCert"], txVolume: "12.4M req/day", description: "Authenticated customer self-service portal handling account, billing, and support." },
  { id: "claims", name: "Claims Processing", group: "Claims", tier: 1, icon: FileText, health: "healthy", risk: 28, revenue: 240, customers: 84000, certs: 96, apps: 22, frameworks: ["HIPAA", "SOC2"], coworkers: ["Discovery", "Compliance", "Renewal"], dependencies: ["Provider Network", "Payments", "Document AI", "Sectigo"], txVolume: "1.8M claims/day", description: "End-to-end claims intake, adjudication, and remittance workflow." },
  { id: "provider", name: "Provider Network", group: "Healthcare", tier: 1, icon: Stethoscope, health: "healthy", risk: 22, revenue: 95, customers: 14000, certs: 64, apps: 18, frameworks: ["HIPAA", "NIST"], coworkers: ["Discovery", "Compliance"], dependencies: ["Identity", "Claims", "PHI Vault"], txVolume: "640K lookups/day", description: "Provider directory, eligibility, and credentialing services." },
  { id: "identity", name: "Identity Platform", group: "Identity", tier: 1, icon: KeyRound, health: "warning", risk: 71, revenue: 0, customers: 280000, certs: 188, apps: 41, frameworks: ["SOC2", "ISO27001", "NIST"], coworkers: ["Discovery", "Security", "Cryptography"], dependencies: ["HSM", "MFA Provider", "OAuth Gateway"], txVolume: "42M auth/day", description: "Centralized IAM, SSO, OAuth 2.1, and machine identity issuance." },
  { id: "payments", name: "Payment Processing", group: "Finance", tier: 1, icon: CreditCard, health: "atrisk", risk: 58, revenue: 410, customers: 162000, certs: 124, apps: 28, frameworks: ["PCI-DSS", "SOC2"], coworkers: ["Discovery", "Risk", "Compliance"], dependencies: ["Card Vault", "Settlement", "Fraud Engine"], txVolume: "8.2M txn/day", description: "PCI-scoped tokenization, authorization, settlement, and reconciliation." },
  { id: "gw", name: "API Gateway", group: "Infrastructure", tier: 1, icon: Network, health: "healthy", risk: 18, revenue: 0, customers: 280000, certs: 312, apps: 96, frameworks: ["SOC2"], coworkers: ["Discovery", "Renewal", "Deployment"], dependencies: ["Service Mesh", "WAF", "DNS"], txVolume: "1.2B req/day", description: "Edge gateway terminating TLS and enforcing rate limits across services." },
  { id: "emp", name: "Employee Portal", group: "Collaboration", tier: 2, icon: MessageSquare, health: "healthy", risk: 14, revenue: 0, customers: 38000, certs: 34, apps: 12, frameworks: ["SOC2"], coworkers: ["Discovery", "Renewal"], dependencies: ["Identity", "HRIS"], txVolume: "420K req/day", description: "Internal workforce portal for HR, payroll, and benefits." },
  { id: "analytics", name: "Analytics Platform", group: "Data", tier: 2, icon: Database, health: "healthy", risk: 24, revenue: 18, customers: 4200, certs: 58, apps: 20, frameworks: ["SOC2", "GDPR"], coworkers: ["Discovery", "Compliance"], dependencies: ["Warehouse", "Lake", "Lineage"], txVolume: "3.1B events/day", description: "Streaming + batch analytics, BI delivery, and self-serve datasets." },
  { id: "partner", name: "Partner Integration Hub", group: "Developer", tier: 2, icon: Plug, health: "atrisk", risk: 47, revenue: 64, customers: 1800, certs: 88, apps: 36, frameworks: ["SOC2", "ISO27001"], coworkers: ["Discovery", "Renewal", "Security"], dependencies: ["mTLS Mesh", "B2B Gateway"], txVolume: "260M req/day", description: "Partner B2B mTLS, SFTP, and event integrations with revoke/rotate flows." },
  { id: "erp", name: "Enterprise ERP", group: "Finance", tier: 1, icon: Building2, health: "critical", risk: 84, revenue: 380, customers: 0, certs: 76, apps: 26, frameworks: ["SOX", "SOC2"], coworkers: ["Discovery", "Risk", "Renewal", "Compliance"], dependencies: ["GL", "Procurement", "Treasury"], txVolume: "120K txn/day", description: "Finance, procurement, treasury, and supplier master operations." },
  { id: "data", name: "Data Services", group: "Data", tier: 2, icon: Cloud, health: "healthy", risk: 19, revenue: 12, customers: 800, certs: 44, apps: 14, frameworks: ["SOC2", "GDPR"], coworkers: ["Discovery"], dependencies: ["Object Store", "Catalog"], txVolume: "1.4B IO/day", description: "Multi-region object store, catalog, and data sharing surface." },
  { id: "dev", name: "Developer Platform", group: "Developer", tier: 2, icon: Code2, health: "healthy", risk: 21, revenue: 0, customers: 6400, certs: 72, apps: 28, frameworks: ["SOC2"], coworkers: ["Discovery", "Deployment"], dependencies: ["CI/CD", "Artifact Registry"], txVolume: "180K builds/day", description: "Internal developer platform with golden paths, sandboxes, and registry." },
];

const GROUPS = ["All", "Customer", "Claims", "Finance", "Identity", "Infrastructure", "Developer", "Healthcare", "Data", "Collaboration"];

const HEALTH_META: Record<Service["health"], { color: string; bg: string; border: string; chip: string; dot: string; label: string }> = {
  healthy: { color: "#10b981", bg: "bg-emerald-50", border: "border-emerald-200", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Healthy" },
  atrisk: { color: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200", chip: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", label: "At Risk" },
  warning: { color: "#f97316", bg: "bg-orange-50", border: "border-orange-200", chip: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", label: "Warning" },
  critical: { color: "#ef4444", bg: "bg-rose-50", border: "border-rose-200", chip: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500", label: "Critical" },
};

const COMPLIANCE_FW = ["PCI-DSS", "SOC2", "NIST", "ISO27001", "HIPAA", "GDPR"];

// ============== SERVICE CARD ==============
function ServiceCard({ s, onClick, onDouble, delay }: { s: Service; onClick: () => void; onDouble: () => void; delay: number }) {
  const h = HEALTH_META[s.health];
  return (
    <motion.button
      onClick={onClick} onDoubleClick={onDouble}
      initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35, delay }}
      whileHover={{ y: -4 }}
      className={cn(
        "relative text-left bg-white rounded-xl border p-3.5 shadow-sm hover:shadow-md transition-all overflow-hidden group",
        h.border,
      )}
    >
      <div className="absolute top-0 left-0 bottom-0 w-1" style={{ background: h.color }} />
      <div className="flex items-start gap-2.5">
        <div className={cn("h-9 w-9 rounded-lg grid place-items-center shrink-0", h.bg)} style={{ color: h.color }}>
          <s.icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[13.5px] font-bold text-slate-900 truncate">{s.name}</div>
            <span className={cn("text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border", h.chip)}>
              Tier {s.tier}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 truncate">{s.group} · {s.txVolume}</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <div className="text-slate-500">Revenue</div><div className="text-right font-bold text-slate-900 tabular-nums">${s.revenue}M</div>
        <div className="text-slate-500">Customers</div><div className="text-right font-semibold text-slate-700 tabular-nums">{s.customers.toLocaleString()}</div>
        <div className="text-slate-500">Certs</div><div className="text-right font-semibold text-blue-600 tabular-nums">{s.certs}</div>
        <div className="text-slate-500">Apps</div><div className="text-right font-semibold text-violet-600 tabular-nums">{s.apps}</div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
          <span>Risk Score</span><span className="tabular-nums" style={{ color: h.color }}>{s.risk}</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${s.risk}%` }} transition={{ duration: 0.9, delay: delay + 0.2 }} className="h-full rounded-full" style={{ background: h.color }} />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={cn("inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border", h.chip)}>
          <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", h.dot)} />
          {h.label}
        </span>
        <div className="flex -space-x-1.5">
          {s.coworkers.slice(0, 4).map((c, i) => (
            <div key={i} title={c + " coworker"} className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 border-2 border-white grid place-items-center text-white text-[8px] font-bold">
              {c[0]}
            </div>
          ))}
          {s.coworkers.length > 4 && <div className="h-5 w-5 rounded-full bg-slate-200 border-2 border-white grid place-items-center text-[8px] font-bold text-slate-600">+{s.coworkers.length - 4}</div>}
        </div>
      </div>
    </motion.button>
  );
}

// ============== DEPENDENCY GRAPH ==============
function DependencyGraph({ service }: { service: Service }) {
  const nodes = [
    { id: "svc", label: service.name, x: 50, y: 50, color: HEALTH_META[service.health].color, size: 30 },
    { id: "app", label: "API Gateway", x: 20, y: 18, color: "#8b5cf6", size: 22 },
    { id: "srv", label: "Azure App Service", x: 80, y: 18, color: "#06b6d4", size: 22 },
    { id: "cert", label: "Certificate", x: 12, y: 50, color: "#3b82f6", size: 22 },
    { id: "ca", label: "DigiCert CA", x: 88, y: 50, color: "#3b82f6", size: 22 },
    { id: "hsm", label: "HSM Key", x: 20, y: 82, color: "#0f172a", size: 22 },
    { id: "dns", label: "DNS Validation", x: 50, y: 88, color: "#10b981", size: 22 },
    { id: "cust", label: `${service.customers.toLocaleString()} Customers`, x: 80, y: 82, color: "#f59e0b", size: 22 },
  ];
  const edges = [
    ["svc", "app"], ["svc", "srv"], ["svc", "cert"], ["svc", "ca"],
    ["svc", "hsm"], ["svc", "dns"], ["svc", "cust"],
    ["cert", "ca"], ["cert", "hsm"], ["cert", "dns"],
  ];
  const get = (id: string) => nodes.find((n) => n.id === id)!;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {edges.map(([a, b], i) => {
        const A = get(a), B = get(b);
        return (
          <motion.line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            stroke="#cbd5e1" strokeWidth={0.4} strokeDasharray="0.8 0.8"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.1 + i * 0.06 }}
          />
        );
      })}
      {edges.map(([a, b], i) => {
        const A = get(a), B = get(b);
        return (
          <motion.circle key={`p${i}`} r={0.5} fill="#3b82f6"
            animate={{ cx: [A.x, B.x], cy: [A.y, B.y], opacity: [0, 1, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.18 }}
          />
        );
      })}
      {nodes.map((n, i) => (
        <g key={n.id}>
          <motion.circle cx={n.x} cy={n.y} r={n.size / 8 + 0.5} fill={n.color} fillOpacity={0.15}
            animate={{ r: [n.size / 8 + 0.5, n.size / 8 + 1.4, n.size / 8 + 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.15 }}
          />
          <motion.circle cx={n.x} cy={n.y} r={n.size / 8}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + i * 0.08 }}
            fill={n.color} stroke="white" strokeWidth={0.4}
          />
          <text x={n.x} y={n.y + n.size / 8 + 2.6} textAnchor="middle" style={{ fontSize: 2.2, fontWeight: 700, fill: "#0f172a" }}>{n.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ============== CONTEXT PANEL ==============
function ServicePanel({ service, deep, onClose }: { service: Service | null; deep: boolean; onClose: () => void }) {
  return (
    <Sheet open={!!service} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[680px] p-0 overflow-y-auto">
        {service && (
          <>
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg grid place-items-center" style={{ background: HEALTH_META[service.health].color + "20", color: HEALTH_META[service.health].color }}>
                    <service.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">{deep ? `${service.name} Operations Center` : "Service Detail"}</div>
                    <SheetTitle className="text-[20px] font-bold text-slate-900">{service.name}</SheetTitle>
                    <div className="text-[12px] text-slate-500 mt-0.5">{service.group} · Tier {service.tier} · {service.txVolume}</div>
                  </div>
                </div>
                <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"><X className="h-4 w-4" /></button>
              </div>
            </SheetHeader>

            <div className="p-6 space-y-5">
              <div className="rounded-xl border border-slate-200 p-4 bg-gradient-to-br from-blue-50 to-white">
                <div className="text-[11px] uppercase tracking-wider text-blue-700 font-bold">Executive Summary</div>
                <p className="text-[12.5px] text-slate-700 mt-1.5 leading-relaxed">
                  {service.description} Currently protecting <b>${service.revenue}M</b> in revenue and <b>{service.customers.toLocaleString()}</b> customers across{" "}
                  <b>{service.certs}</b> certificates and <b>{service.apps}</b> dependent applications.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { l: "Revenue", v: `$${service.revenue}M`, tone: "emerald" },
                  { l: "Customers", v: service.customers.toLocaleString() },
                  { l: "Certificates", v: service.certs },
                  { l: "Applications", v: service.apps },
                  { l: "Risk Score", v: service.risk, tone: service.risk >= 60 ? "rose" : service.risk >= 30 ? "amber" : "emerald" },
                  { l: "Health", v: HEALTH_META[service.health].label, tone: service.health === "healthy" ? "emerald" : service.health === "critical" ? "rose" : "amber" },
                  { l: "Frameworks", v: service.frameworks.length },
                  { l: "Coworkers", v: service.coworkers.length },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
                    <div className="text-[9.5px] uppercase tracking-wider text-slate-500 font-semibold">{s.l}</div>
                    <div className={cn("text-[15px] font-bold mt-0.5", s.tone === "rose" ? "text-rose-600" : s.tone === "amber" ? "text-amber-600" : s.tone === "emerald" ? "text-emerald-600" : "text-slate-900")}>{s.v}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">Dependency Map</div>
                <div className="h-[260px]">
                  <DependencyGraph service={service} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">Compliance Requirements</div>
                  <div className="flex flex-wrap gap-1.5">
                    {service.frameworks.map((f) => (
                      <span key={f} className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                        <BookCheck className="h-3 w-3" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">Digital Coworkers Assigned</div>
                  <div className="flex flex-wrap gap-1.5">
                    {service.coworkers.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5">
                        <Bot className="h-3 w-3" /> {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">Operational Dependencies</div>
                <div className="flex flex-wrap gap-1.5">
                  {service.dependencies.map((d) => (
                    <span key={d} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
                      <ChevronRight className="h-3 w-3 text-slate-400" /> {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">Recommended Actions</div>
                <ul className="space-y-1.5">
                  {[
                    `Pre-stage ${Math.max(2, Math.round(service.certs * 0.05))} certs expiring within 14 days`,
                    `Reconcile owners for ${Math.max(1, Math.round(service.apps * 0.1))} apps missing CMDB linkage`,
                    `Validate ${service.frameworks[0]} evidence chain prior to next audit cycle`,
                  ].map((a) => (
                    <li key={a} className="flex items-start gap-2 text-[12.5px] text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> {a}
                    </li>
                  ))}
                </ul>
              </div>

              {deep && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-blue-700 font-bold">Service Operations Workspace</div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["Service Health", "Dependencies", "Certificates", "Applications", "Infrastructure", "Customers", "Compliance", "Digital Coworkers", "Operational Queues", "Revenue Impact", "Risk Analysis", "Timeline"].map((t) => (
                      <button key={t} className="text-[11.5px] font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-100 rounded-lg px-2.5 py-2 text-left">{t} →</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ============== MAIN ==============
export default function BusinessServicesImpactCenter() {
  const [service, setService] = useState<Service | null>(null);
  const [deep, setDeep] = useState(false);
  const [group, setGroup] = useState("All");
  const [framework, setFramework] = useState<string | null>(null);

  const filtered = useMemo(() => SERVICES.filter((s) =>
    (group === "All" || s.group === group) && (!framework || s.frameworks.includes(framework))
  ), [group, framework]);

  const totalRevenue = useMemo(() => SERVICES.reduce((a, s) => a + s.revenue, 0), []);
  const totalCustomers = useMemo(() => SERVICES.reduce((a, s) => a + s.customers, 0), []);

  const revenueByService = SERVICES.slice().sort((a, b) => b.revenue - a.revenue).slice(0, 8).map((s) => ({ name: s.name.split(" ")[0], revenue: s.revenue }));
  const riskByService = SERVICES.slice().sort((a, b) => b.risk - a.risk).slice(0, 8).map((s) => ({ name: s.name.split(" ")[0], risk: s.risk }));
  const healthTrend = Array.from({ length: 12 }).map((_, i) => ({
    m: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i],
    healthy: 92 + Math.round(Math.sin(i / 2) * 3 + i * 0.4),
    atrisk: 14 + Math.round(Math.cos(i / 2) * 2),
    critical: Math.max(1, 6 - Math.round(i / 3)),
  }));
  const coverage = [
    { name: "Discovery", value: 94, color: "#3b82f6" },
    { name: "Risk", value: 88, color: "#8b5cf6" },
    { name: "Renewal", value: 82, color: "#10b981" },
    { name: "Deployment", value: 76, color: "#f59e0b" },
    { name: "Compliance", value: 91, color: "#06b6d4" },
    { name: "Security", value: 71, color: "#ef4444" },
  ];

  const TIERS = [
    { tier: 1, label: "Mission Critical", count: 42, color: "bg-rose-50 border-rose-200 text-rose-700", dot: "bg-rose-500" },
    { tier: 2, label: "Important", count: 118, color: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-500" },
    { tier: 3, label: "Standard", count: 340, color: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Header />
        <main className="p-6 space-y-6">
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-9 gap-3">
            <Kpi label="Business Services" value={500} icon={Briefcase} accent="blue" delay={0.05} />
            <Kpi label="Tier 1 Services" value={42} icon={Heart} accent="rose" delay={0.1} />
            <Kpi label="Protected Revenue" value={1.2} prefix="$" suffix="B" decimals={1} icon={DollarSign} accent="emerald" delay={0.15} />
            <Kpi label="Customers" value={280000} icon={Users} accent="blue" delay={0.2} />
            <Kpi label="Critical Deps" value={8700} icon={Network} accent="violet" delay={0.25} />
            <Kpi label="Certificates" value={42000} icon={Shield} accent="blue" delay={0.3} />
            <Kpi label="Services at Risk" value={18} icon={AlertTriangle} accent="amber" delay={0.35} />
            <Kpi label="Service Health" value={98.9} suffix="%" decimals={1} icon={CheckCircle2} accent="emerald" delay={0.4} />
            <Kpi label="Coworkers" value={12} icon={Bot} accent="violet" delay={0.45} />
          </div>

          {/* Tier matrix */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIERS.map((t, i) => (
              <motion.div key={t.tier} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 + i * 0.08 }}
                className={cn("rounded-2xl border p-4 flex items-center justify-between", t.color)}>
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-full grid place-items-center text-white font-bold", t.dot)}>T{t.tier}</div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider">{t.label}</div>
                    <div className="text-[18px] font-bold text-slate-900">{t.count} <span className="text-[11px] font-medium text-slate-500">services</span></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider font-bold">Coverage</div>
                  <div className="text-[15px] font-bold text-slate-900 tabular-nums">{t.tier === 1 ? 100 : t.tier === 2 ? 96 : 88}%</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2 flex-wrap shadow-sm">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 pr-2 border-r border-slate-200">
              <Filter className="h-3.5 w-3.5" /> Filters
            </div>
            <div className="flex flex-wrap gap-1.5">
              {GROUPS.map((g) => (
                <button key={g} onClick={() => setGroup(g)}
                  className={cn("text-[11.5px] font-semibold rounded-full px-2.5 py-1 border transition-colors",
                    group === g ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}>
                  {g}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Framework:</span>
              {COMPLIANCE_FW.map((f) => (
                <button key={f} onClick={() => setFramework(framework === f ? null : f)}
                  className={cn("text-[10.5px] font-semibold rounded px-2 py-0.5 border transition-colors",
                    framework === f ? "bg-violet-600 text-white border-violet-600" : "bg-white text-violet-700 border-violet-200 hover:bg-violet-50")}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Service portfolio */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold">Service Portfolio</div>
                <div className="text-[15px] font-bold text-slate-900">Business Services · {filtered.length} of {SERVICES.length} shown</div>
              </div>
              <div className="text-[11px] text-slate-500">Single click for detail · Double click for operations center</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <AnimatePresence>
                {filtered.map((s, i) => (
                  <ServiceCard key={s.id} s={s} delay={0.05 * i}
                    onClick={() => { setService(s); setDeep(false); }}
                    onDouble={() => { setService(s); setDeep(true); }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Top 20 ranking table */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold">Ranking</div>
                <div className="text-[14px] font-bold text-slate-900">Top Business Services by Impact</div>
              </div>
              <div className="text-[11px] text-slate-500">Sortable by revenue, risk, customers, certificates</div>
            </div>
            <table className="w-full text-[12px]">
              <thead className="bg-slate-50 text-slate-500 text-[10.5px] uppercase tracking-wider">
                <tr>
                  <th className="text-left font-bold px-4 py-2.5">Service</th>
                  <th className="text-left font-bold px-2 py-2.5">Health</th>
                  <th className="text-right font-bold px-2 py-2.5">Revenue</th>
                  <th className="text-right font-bold px-2 py-2.5">Risk</th>
                  <th className="text-right font-bold px-2 py-2.5">Customers</th>
                  <th className="text-right font-bold px-2 py-2.5">Certs</th>
                  <th className="text-left font-bold px-2 py-2.5">Coworkers</th>
                  <th className="text-right font-bold px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {SERVICES.slice().sort((a, b) => b.revenue - a.revenue).map((s) => {
                  const h = HEALTH_META[s.health];
                  return (
                    <tr key={s.id} className="border-t border-slate-100 hover:bg-blue-50/30 cursor-pointer transition-colors"
                      onClick={() => { setService(s); setDeep(false); }}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg grid place-items-center" style={{ background: h.color + "20", color: h.color }}>
                            <s.icon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{s.name}</div>
                            <div className="text-[10.5px] text-slate-500">{s.group} · Tier {s.tier}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2.5">
                        <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border", h.chip)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", h.dot)} /> {h.label}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right font-bold text-slate-900 tabular-nums">${s.revenue}M</td>
                      <td className="px-2 py-2.5 text-right font-bold tabular-nums" style={{ color: h.color }}>{s.risk}</td>
                      <td className="px-2 py-2.5 text-right text-slate-700 tabular-nums">{s.customers.toLocaleString()}</td>
                      <td className="px-2 py-2.5 text-right text-blue-600 font-semibold tabular-nums">{s.certs}</td>
                      <td className="px-2 py-2.5">
                        <div className="flex -space-x-1.5">
                          {s.coworkers.slice(0, 4).map((c, i) => (
                            <div key={i} className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 border-2 border-white grid place-items-center text-white text-[8px] font-bold">{c[0]}</div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right"><ArrowUpRight className="h-3.5 w-3.5 text-slate-400 inline" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>

          {/* Executive analytics */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold">Executive Analytics</div>
              <div className="text-[14px] font-bold text-slate-900">Revenue Protected by Service</div>
              <div className="h-[230px] mt-2">
                <ResponsiveContainer>
                  <BarChart data={revenueByService} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <RTooltip formatter={(v: any) => `$${v}M`} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} animationDuration={900} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold">Posture</div>
              <div className="text-[14px] font-bold text-slate-900">Risk by Service</div>
              <div className="h-[230px] mt-2">
                <ResponsiveContainer>
                  <BarChart data={riskByService} layout="vertical" margin={{ top: 4, right: 16, left: 6, bottom: 0 }}>
                    <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10.5, fill: "#475569" }} width={90} />
                    <RTooltip />
                    <Bar dataKey="risk" fill="#ef4444" radius={[0, 6, 6, 0]} animationDuration={900} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold">Workforce</div>
              <div className="text-[14px] font-bold text-slate-900">Digital Coworker Coverage</div>
              <div className="space-y-2 mt-3">
                {coverage.map((c, i) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="font-semibold text-slate-700">{c.name}</span>
                      <span className="font-bold tabular-nums" style={{ color: c.color }}>{c.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${c.value}%` }} transition={{ duration: 0.9, delay: 0.1 * i }} className="h-full rounded-full" style={{ background: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold">Trends</div>
                  <div className="text-[14px] font-bold text-slate-900">Business Service Health · Last 12 months</div>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Healthy</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500" /> At Risk</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> Critical</span>
                </div>
              </div>
              <div className="h-[230px] mt-2">
                <ResponsiveContainer>
                  <AreaChart data={healthTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.5} /><stop offset="100%" stopColor="#10b981" stopOpacity={0.02} /></linearGradient>
                      <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.5} /><stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} /></linearGradient>
                      <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} /></linearGradient>
                    </defs>
                    <CartesianGrid stroke="#f1f5f9" />
                    <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <RTooltip />
                    <Area type="monotone" dataKey="healthy" stroke="#10b981" fill="url(#gH)" strokeWidth={2} animationDuration={1000} />
                    <Area type="monotone" dataKey="atrisk" stroke="#f59e0b" fill="url(#gA)" strokeWidth={2} animationDuration={1000} />
                    <Area type="monotone" dataKey="critical" stroke="#ef4444" fill="url(#gC)" strokeWidth={2} animationDuration={1000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      <ServicePanel service={service} deep={deep} onClose={() => setService(null)} />
    </div>
  );
}
