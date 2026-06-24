import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, Bell, BookCheck, Bot, Briefcase, Building2, Cog, FileSearch, FileText,
  GitBranch, Globe, HelpCircle, KeyRound, LayoutDashboard, Package, Plug, RefreshCw, ScrollText,
  Scale, Search, Server, ServerCog, ShieldAlert, ShieldCheck, UserCog, Users, Zap, Cloud,
  Network, ChevronRight, X, Play, Layers, Map as MapIcon, GitMerge, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactFlow, {
  Background, Controls, MiniMap, MarkerType, useNodesState, useEdgesState, Handle, Position,
  type Node, type Edge, type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { cn } from "@/lib/utils";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

// ============== NAVIGATION (matches main cert page) ==============
const navSections = [
  { label: "Command Center", items: [
    { id: "ops", label: "Operations Overview", icon: LayoutDashboard, to: "/enterprise-certificate-management" },
    { id: "risk", label: "Risk & Exposure", icon: ShieldAlert, active: true },
    { id: "map", label: "Global Map", icon: Globe, to: "/enterprise-certificate-management/global-map" },
    { id: "life", label: "Lifecycle", icon: Activity, to: "/enterprise-certificate-management/lifecycle" },
    { id: "biz", label: "Business Services", icon: Briefcase },
    { id: "rep", label: "Reports", icon: FileText },
  ]},
  { label: "Operations", items: [
    { id: "auto", label: "Agentic Execution Center", icon: Sparkles, to: "/enterprise-certificate-management/agentic-execution" },
    { id: "co", label: "Digital Coworkers", icon: Bot, to: "/enterprise-certificate-management/digital-coworkers" },
    { id: "oc", label: "Operations Center", icon: ServerCog, to: "/enterprise-certificate-management/operations-center" },
    { id: "cm", label: "Change Manager", icon: GitBranch },
    { id: "int", label: "Integrations", icon: Plug },
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
                const inner = (
                  <>
                    <it.icon className="h-4 w-4" />
                    <span>{it.label}</span>
                  </>
                );
                const cls = cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors",
                  it.active ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
                );
                return it.to ? (
                  <Link key={it.id} to={it.to} className={cls}>{inner}</Link>
                ) : (
                  <button key={it.id} className={cls}>{inner}</button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="m-3 p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Digital Coworker Status</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">12</span>
          <span className="text-xs opacity-80">Active</span>
        </div>
        <div className="text-xs opacity-90">249,000 Tasks YTD</div>
        <button className="mt-3 text-xs font-semibold underline-offset-2 hover:underline">View All Coworkers →</button>
      </div>
    </motion.aside>
  );
}

// ============== HEADER ==============
function Header() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
      className="sticky top-0 z-20 bg-white border-b border-slate-200"
    >
      <div className="px-6 py-3 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-slate-500 font-medium">neurealm RunOps · Enterprise Certificate Operations</div>
          <h1 className="text-[20px] font-bold text-slate-900 leading-tight truncate">
            Enterprise Certificate Risk & Exposure Map
          </h1>
          <div className="text-[12px] text-slate-500">Understand what breaks when a certificate expires</div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-[340px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="bg-transparent outline-none text-sm flex-1" placeholder="Search certificates, services, domains" />
          <kbd className="text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">⌘K</kbd>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"><RefreshCw className="h-4 w-4" /></button>
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
          </button>
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"><HelpCircle className="h-4 w-4" /></button>
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"><Cog className="h-4 w-4" /></button>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 grid place-items-center text-white text-xs font-bold">SA</div>
        </div>
      </div>
      <div className="px-6 pb-2 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span>Data as of: <strong className="text-slate-700">Jun 23, 2025 10:24 AM EDT</strong></span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live telemetry</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Tenant: <strong className="text-slate-700">Palo Alto Networks</strong></span>
          <span>Region: <strong className="text-slate-700">Global</strong></span>
        </div>
      </div>
    </motion.header>
  );
}

// ============== KPI CARDS ==============
type Kpi = { id: string; label: string; value: string; sub: string; icon: any; tone: "blue"|"red"|"amber"|"green"|"purple"; subTone?: "red"|"amber"|"slate" };
const KPIS: Kpi[] = [
  { id: "bs", label: "Business Services", value: "500", sub: "42 Critical", icon: Briefcase, tone: "blue", subTone: "red" },
  { id: "app", label: "Applications", value: "1,200", sub: "158 Critical", icon: Layers, tone: "blue", subTone: "red" },
  { id: "srv", label: "Servers", value: "8,000", sub: "612 Critical", icon: Server, tone: "blue", subTone: "red" },
  { id: "cert", label: "Certificates", value: "42,000", sub: "380 Critical", icon: ShieldCheck, tone: "purple", subTone: "red" },
  { id: "ca", label: "Certificate Authorities", value: "7", sub: "External + Internal", icon: Building2, tone: "purple", subTone: "slate" },
  { id: "key", label: "Private Keys", value: "42,000", sub: "HSM + Software", icon: KeyRound, tone: "purple", subTone: "slate" },
  { id: "cloud", label: "Cloud Platforms", value: "35", sub: "Active Accounts", icon: Cloud, tone: "blue", subTone: "slate" },
  { id: "lb", label: "Load Balancers", value: "320", sub: "In Use", icon: Network, tone: "blue", subTone: "slate" },
  { id: "cust", label: "Customers Impacted", value: "28,000", sub: "At Risk", icon: Users, tone: "red", subTone: "red" },
];

const toneMap: Record<string, { bg: string; text: string; ring: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100" },
  red: { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
  green: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
  purple: { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100" },
};
const subToneMap: Record<string, string> = {
  red: "text-rose-600", amber: "text-amber-600", slate: "text-slate-500",
};

function KpiCards({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-3 px-6 pt-4">
      {KPIS.map((k, i) => {
        const t = toneMap[k.tone];
        return (
          <TooltipProvider key={k.id} delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.04, duration: 0.35 }}
                  onClick={() => onPick(k.id)}
                  onDoubleClick={() => onPick(k.id + ":deep")}
                  className="text-left bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10.5px] text-slate-500 font-medium truncate">{k.label}</div>
                      <div className="text-[20px] font-bold text-slate-900 leading-tight mt-0.5">{k.value}</div>
                      <div className={cn("text-[10.5px] font-semibold mt-0.5", subToneMap[k.subTone || "slate"])}>{k.sub}</div>
                    </div>
                    <span className={cn("h-7 w-7 rounded-lg grid place-items-center ring-4", t.bg, t.text, t.ring)}>
                      <k.icon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <div className="font-semibold">{k.label}</div>
                <div className="text-slate-500">Click to analyze · Double-click for deep view</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}

// ============== GRAPH NODES ==============
type RiskLevel = "critical" | "high" | "medium" | "low" | "healthy";
type NodeKind = "customer" | "service" | "infra" | "cert" | "ca" | "key" | "cloud" | "lb" | "user";

const riskStyles: Record<RiskLevel, { bg: string; border: string; text: string; chip: string; dot: string }> = {
  critical: { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-700", chip: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
  high:     { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", chip: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  medium:   { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", chip: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  low:      { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", chip: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  healthy:  { bg: "bg-sky-50", border: "border-sky-300", text: "text-sky-700", chip: "bg-sky-100 text-sky-700", dot: "bg-sky-500" },
};

const kindIcon: Record<NodeKind, any> = {
  customer: Briefcase, service: Layers, infra: Server, cert: ShieldCheck,
  ca: Building2, key: KeyRound, cloud: Cloud, lb: Network, user: Users,
};

type NodeData = {
  label: string;
  sub?: string;
  kind: NodeKind;
  risk: RiskLevel;
  highlight?: "on" | "dim" | "off";
  pulse?: boolean;
};

function DepNode({ data, selected }: NodeProps<NodeData>) {
  const r = riskStyles[data.risk];
  const Icon = kindIcon[data.kind];
  const dim = data.highlight === "dim";
  const on = data.highlight === "on";
  return (
    <div className={cn("relative transition-all", dim && "opacity-25", on && "scale-[1.04]")}>
      <Handle type="target" position={Position.Top} className="!bg-slate-300 !w-1.5 !h-1.5 !border-0" />
      <div className={cn(
        "min-w-[160px] max-w-[180px] rounded-xl border bg-white shadow-sm px-3 py-2",
        r.border, selected && "ring-2 ring-blue-400",
        data.pulse && "animate-pulse",
      )}>
        <div className="flex items-center gap-2">
          <span className={cn("h-7 w-7 rounded-lg grid place-items-center shrink-0", r.bg, r.text)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-slate-900 leading-tight truncate">{data.label}</div>
            {data.sub && <div className="text-[10px] text-slate-500 truncate">{data.sub}</div>}
          </div>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className={cn("inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded", r.chip)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", r.dot)} />
            {data.risk}
          </span>
          <span className="text-[9.5px] text-slate-400 capitalize">{data.kind}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-300 !w-1.5 !h-1.5 !border-0" />
    </div>
  );
}

const nodeTypes = { dep: DepNode };

// ============== GRAPH DATA ==============
type N = { id: string; x: number; y: number; data: NodeData };
const RAW_NODES: N[] = [
  // Layer 0 - Business Service
  { id: "cp",        x: 540, y:   0, data: { label: "Customer Portal", sub: "Tier 1 Critical", kind: "customer", risk: "critical", pulse: true } },
  // Layer 1 - Applications
  { id: "api",       x: 260, y: 130, data: { label: "API Gateway", sub: "12K req/s", kind: "service", risk: "critical" } },
  { id: "auth",      x: 540, y: 130, data: { label: "Auth Service", sub: "OAuth/OIDC", kind: "service", risk: "high" } },
  { id: "pay",       x: 820, y: 130, data: { label: "Payment Service", sub: "PCI-DSS", kind: "service", risk: "high" } },
  // Layer 2 - Infrastructure
  { id: "appsvc",    x: 120, y: 270, data: { label: "Azure App Service", sub: "EastUS-2", kind: "infra", risk: "high" } },
  { id: "aks",       x: 410, y: 270, data: { label: "AKS Cluster", sub: "prod-aks-01", kind: "infra", risk: "medium" } },
  { id: "vmss",      x: 700, y: 270, data: { label: "VM Scale Set", sub: "32 nodes", kind: "infra", risk: "medium" } },
  { id: "lb",        x: 980, y: 270, data: { label: "App Gateway", sub: "WAF v2", kind: "lb", risk: "high" } },
  // Layer 3 - Certificates
  { id: "c1",        x: 100, y: 420, data: { label: "DigiCert TLS RSA 4096", sub: "Expires in 7 days", kind: "cert", risk: "critical", pulse: true } },
  { id: "c2",        x: 360, y: 420, data: { label: "DigiCert TLS ECC 256", sub: "Expires in 18 days", kind: "cert", risk: "high" } },
  { id: "c3",        x: 620, y: 420, data: { label: "DigiCert TLS RSA 2048", sub: "Expires in 32 days", kind: "cert", risk: "low" } },
  // Layer 3b - LB extra
  { id: "afd",       x: 880, y: 420, data: { label: "Azure Front Door", sub: "Global CDN", kind: "lb", risk: "medium" } },
  { id: "tm",        x: 1110, y: 420, data: { label: "Traffic Manager", sub: "DNS routing", kind: "lb", risk: "medium" } },
  // Layer 4 - CAs
  { id: "ca1",       x: 200, y: 560, data: { label: "DigiCert Global Root G2", sub: "External CA", kind: "ca", risk: "healthy" } },
  { id: "ca2",       x: 520, y: 560, data: { label: "DigiCert Global Root G3", sub: "External CA", kind: "ca", risk: "healthy" } },
  // Layer 4b - Keys + KV
  { id: "k1",        x: 760, y: 560, data: { label: "HSM RSA 4096", sub: "Vault West", kind: "key", risk: "healthy" } },
  { id: "k2",        x: 960, y: 560, data: { label: "HSM ECC 256", sub: "Vault West", kind: "key", risk: "healthy" } },
  { id: "k3",        x: 1140, y: 560, data: { label: "HSM RSA 2048", sub: "Vault East", kind: "key", risk: "healthy" } },
  { id: "kv",        x: 380, y: 700, data: { label: "Azure Key Vault", sub: "DNS validation", kind: "cloud", risk: "medium" } },
  // Layer 5 - Customers
  { id: "web",       x: 720, y: 700, data: { label: "Web Customers", sub: "18,000 Users", kind: "user", risk: "critical" } },
  { id: "mob",       x: 920, y: 700, data: { label: "Mobile Customers", sub: "7,000 Users", kind: "user", risk: "high" } },
  { id: "prt",       x: 1120, y: 700, data: { label: "Partners / APIs", sub: "3,000 Users", kind: "user", risk: "medium" } },
];

type DepStrength = "strong" | "medium" | "weak";
const RAW_EDGES: Array<{ s: string; t: string; w: DepStrength; flow?: boolean }> = [
  { s: "cp", t: "api", w: "strong", flow: true },
  { s: "cp", t: "auth", w: "strong", flow: true },
  { s: "cp", t: "pay", w: "strong", flow: true },
  { s: "api", t: "appsvc", w: "strong", flow: true },
  { s: "api", t: "aks", w: "strong" },
  { s: "auth", t: "aks", w: "medium" },
  { s: "auth", t: "vmss", w: "medium" },
  { s: "pay", t: "vmss", w: "strong" },
  { s: "pay", t: "lb", w: "medium" },
  { s: "appsvc", t: "c1", w: "strong", flow: true },
  { s: "aks", t: "c2", w: "strong" },
  { s: "vmss", t: "c3", w: "medium" },
  { s: "lb", t: "afd", w: "medium" },
  { s: "lb", t: "tm", w: "weak" },
  { s: "c1", t: "ca1", w: "strong" },
  { s: "c2", t: "ca2", w: "strong" },
  { s: "c3", t: "ca1", w: "weak" },
  { s: "c1", t: "k1", w: "strong" },
  { s: "c2", t: "k2", w: "strong" },
  { s: "c3", t: "k3", w: "medium" },
  { s: "ca1", t: "kv", w: "medium" },
  { s: "ca2", t: "kv", w: "weak" },
  { s: "afd", t: "web", w: "strong", flow: true },
  { s: "afd", t: "mob", w: "medium", flow: true },
  { s: "tm", t: "prt", w: "medium" },
  { s: "kv", t: "web", w: "weak" },
];

const edgeStyleFor = (w: DepStrength, dim: boolean, on: boolean) => {
  const widths = { strong: 2.4, medium: 1.6, weak: 1 } as const;
  const base = on ? "#2563eb" : dim ? "#e2e8f0" : "#94a3b8";
  return { strokeWidth: widths[w], stroke: base, opacity: dim ? 0.3 : 1 };
};

// ============== PANE DETAILS (unique per object) ==============
type PaneTab = "Executive" | "Technical" | "Dependencies" | "Automation" | "Evidence" | "Timeline";
type Pane = {
  title: string;
  badge: string;
  badgeTone: RiskLevel;
  subtitle: string;
  executiveSummary: string;
  blastRadius: { label: string; value: string; tone?: "red" | "amber" | "slate" }[];
  topDeps: string[];
  coworkers: string[];
  automations: { name: string; status: string }[];
  actions: { label: string; primary?: boolean; icon?: any }[];
  technical?: { label: string; value: string }[];
  evidence?: { ts: string; text: string }[];
  timeline?: { ts: string; text: string }[];
};

const PANES: Record<string, Pane> = {
  c1: {
    title: "DigiCert TLS RSA 4096", badge: "Critical Risk", badgeTone: "critical",
    subtitle: "wildcard.customer-portal.paloaltonetworks.com",
    executiveSummary: "This certificate secures the Customer Portal API Gateway. It expires in 7 days and impacts 18,000 customers.",
    blastRadius: [
      { label: "Business Services", value: "3", tone: "red" },
      { label: "Applications", value: "7", tone: "red" },
      { label: "Servers", value: "42", tone: "amber" },
      { label: "Customers", value: "18,000", tone: "red" },
      { label: "Revenue at Risk", value: "$4.2M / day", tone: "red" },
      { label: "Risk Score", value: "94 / 100", tone: "red" },
    ],
    topDeps: ["Customer Portal", "API Gateway", "Azure App Service", "Azure Key Vault"],
    coworkers: ["CertRenewal-Bot", "PKIValidator-Bot", "DeploymentSync-Bot"],
    automations: [
      { name: "Auto-renewal", status: "Available" },
      { name: "ACME validation", status: "Configured" },
      { name: "Key rotation", status: "Pending approval" },
    ],
    actions: [
      { label: "Renew Now", primary: true, icon: Play },
      { label: "Simulate Impact", icon: Activity },
    ],
    technical: [
      { label: "Serial", value: "0F:9A:21:88:7E:42:11:CC" },
      { label: "Algorithm", value: "RSA 4096 / SHA-256" },
      { label: "Cipher suite", value: "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384" },
      { label: "Issuer", value: "DigiCert Global Root G2" },
      { label: "Validation", value: "DNS-01 via Azure Key Vault" },
      { label: "SAN records", value: "12 entries" },
      { label: "Load balancer", value: "Azure App Gateway (WAF v2)" },
    ],
    evidence: [
      { ts: "10:14 EDT", text: "CT log entry verified · Cloudflare Nimbus 2025" },
      { ts: "09:02 EDT", text: "OCSP responder healthy (DigiCert)" },
      { ts: "Yesterday", text: "SOC 2 control CC7.2 attested" },
    ],
    timeline: [
      { ts: "Jun 30, 2025", text: "Certificate expires" },
      { ts: "Jun 23, 2025", text: "Renewal window opened (T-7)" },
      { ts: "Jun 20, 2024", text: "Issued by DigiCert Global Root G2" },
    ],
  },
  c2: {
    title: "DigiCert TLS ECC 256", badge: "High Risk", badgeTone: "high",
    subtitle: "api.customer-portal.paloaltonetworks.com",
    executiveSummary: "ECC certificate for AKS ingress. Expires in 18 days, covers 9 mobile endpoints.",
    blastRadius: [
      { label: "Applications", value: "4", tone: "amber" }, { label: "Servers", value: "18", tone: "amber" },
      { label: "Customers", value: "7,000", tone: "amber" }, { label: "Revenue at Risk", value: "$1.1M / day", tone: "amber" },
      { label: "Risk Score", value: "71 / 100", tone: "amber" },
    ],
    topDeps: ["AKS Cluster", "Auth Service", "DigiCert Global Root G3"],
    coworkers: ["CertRenewal-Bot", "K8sIngress-Bot"],
    automations: [{ name: "Auto-renewal", status: "Available" }, { name: "K8s secret rotation", status: "Configured" }],
    actions: [{ label: "Schedule Renewal", primary: true, icon: Play }, { label: "Simulate Impact", icon: Activity }],
    technical: [{ label: "Algorithm", value: "ECDSA P-256" }, { label: "Issuer", value: "DigiCert Global Root G3" }],
    evidence: [{ ts: "08:30 EDT", text: "K8s secret synced to 18 pods" }],
    timeline: [{ ts: "Jul 11, 2025", text: "Certificate expires" }],
  },
  c3: {
    title: "DigiCert TLS RSA 2048", badge: "Healthy", badgeTone: "low",
    subtitle: "internal.payments.svc.cluster.local",
    executiveSummary: "Internal mTLS cert for payment microservice. 32 days remaining, auto-renewal armed.",
    blastRadius: [{ label: "Applications", value: "1", tone: "slate" }, { label: "Servers", value: "8", tone: "slate" }, { label: "Risk Score", value: "22 / 100", tone: "slate" }],
    topDeps: ["Payment Service", "VM Scale Set"], coworkers: ["CertRenewal-Bot"],
    automations: [{ name: "Auto-renewal", status: "Armed" }], actions: [{ label: "View Details", primary: true }],
    technical: [{ label: "Algorithm", value: "RSA 2048" }],
    timeline: [{ ts: "Jul 25, 2025", text: "Auto-renewal scheduled" }],
  },
  cp: {
    title: "Customer Portal", badge: "Tier 1 Critical", badgeTone: "critical",
    subtitle: "Top-level customer-facing business service",
    executiveSummary: "Primary customer-facing business service. Generates $1.2B annual revenue across 28K active accounts.",
    blastRadius: [
      { label: "Business Owners", value: "CISO + CTO", tone: "slate" },
      { label: "Revenue Generated", value: "$1.2B / yr", tone: "red" },
      { label: "Customer Volume", value: "28,000 active", tone: "amber" },
      { label: "Critical Functions", value: "Login, Billing, Reporting", tone: "slate" },
      { label: "SLA", value: "99.95%", tone: "slate" },
    ],
    topDeps: ["API Gateway", "Auth Service", "Payment Service"],
    coworkers: ["SLOGuardian-Bot", "IncidentResponder-Bot"],
    automations: [{ name: "Failover orchestration", status: "Armed" }, { name: "Customer comms", status: "Templated" }],
    actions: [{ label: "Open Service Page", primary: true }, { label: "Simulate Impact", icon: Activity }],
  },
  api: {
    title: "API Gateway", badge: "Critical", badgeTone: "critical",
    subtitle: "Edge ingress for all customer portal APIs",
    executiveSummary: "TLS termination point for all customer traffic. Handles 12K req/s sustained, peaks 38K.",
    blastRadius: [
      { label: "API Transactions", value: "12,400 req/s", tone: "slate" },
      { label: "TLS Termination", value: "End-of-life RSA 4096", tone: "red" },
      { label: "Traffic Volume", value: "1.04B req / day", tone: "slate" },
      { label: "Connected Certificates", value: "3", tone: "amber" },
    ],
    topDeps: ["DigiCert TLS RSA 4096", "Azure App Service", "AKS"],
    coworkers: ["APIObservability-Bot"], automations: [{ name: "Cert hot-reload", status: "Configured" }],
    actions: [{ label: "View Telemetry", primary: true }],
  },
  auth: {
    title: "Auth Service", badge: "High", badgeTone: "high",
    subtitle: "OIDC/OAuth provider · token mint",
    executiveSummary: "Identity provider for portal. 240K active sessions, 4 IdP federations.",
    blastRadius: [
      { label: "Active Sessions", value: "240,000", tone: "amber" },
      { label: "Federations", value: "Okta, Entra ID, Ping, Google", tone: "slate" },
      { label: "JWT signing key", value: "Rotated 3d ago", tone: "slate" },
    ],
    topDeps: ["AKS Cluster", "DigiCert TLS ECC 256"], coworkers: ["TokenRotator-Bot"],
    automations: [{ name: "JWK rotation", status: "Scheduled" }], actions: [{ label: "Open IdP Console", primary: true }],
  },
  pay: {
    title: "Payment Service", badge: "High", badgeTone: "high",
    subtitle: "PCI-DSS scoped payment microservice",
    executiveSummary: "Processes $6.8M GMV/day. PCI-DSS Level 1. mTLS required to all downstream PSPs.",
    blastRadius: [
      { label: "GMV / day", value: "$6.8M", tone: "red" },
      { label: "PSP integrations", value: "Stripe, Adyen, Braintree", tone: "slate" },
      { label: "Compliance", value: "PCI-DSS L1, SOX", tone: "slate" },
    ],
    topDeps: ["VM Scale Set", "DigiCert TLS RSA 2048"], coworkers: ["PCIGuard-Bot"],
    automations: [{ name: "Cipher policy enforcement", status: "Active" }], actions: [{ label: "View Compliance", primary: true }],
  },
  appsvc: {
    title: "Azure App Service", badge: "High", badgeTone: "high", subtitle: "EastUS-2 · P3v3 plan",
    executiveSummary: "Hosts API Gateway. SSL binding currently uses expiring DigiCert RSA 4096.",
    blastRadius: [{ label: "Instances", value: "8", tone: "slate" }, { label: "SSL bindings", value: "3", tone: "amber" }],
    topDeps: ["API Gateway", "Azure Key Vault"], coworkers: ["AzureOps-Bot"],
    automations: [{ name: "Slot swap on renewal", status: "Armed" }], actions: [{ label: "Open in Azure", primary: true }],
  },
  aks: {
    title: "AKS Cluster", badge: "Medium", badgeTone: "medium", subtitle: "prod-aks-01 · 32 nodes",
    executiveSummary: "Runs auth & API workloads. cert-manager handles ingress certs.",
    blastRadius: [{ label: "Pods", value: "412", tone: "slate" }, { label: "Ingress hosts", value: "27", tone: "slate" }],
    topDeps: ["Auth Service", "DigiCert TLS ECC 256"], coworkers: ["K8sOps-Bot"],
    automations: [{ name: "cert-manager renewal", status: "Active" }], actions: [{ label: "kubectl context", primary: true }],
  },
  vmss: {
    title: "VM Scale Set", badge: "Medium", badgeTone: "medium", subtitle: "32 nodes · Linux 22.04",
    executiveSummary: "Payment service compute. Auto-rotates certs via Azure Key Vault extension.",
    blastRadius: [{ label: "VMs", value: "32", tone: "slate" }, { label: "Cert extension", value: "v2.1", tone: "slate" }],
    topDeps: ["Payment Service", "DigiCert TLS RSA 2048"], coworkers: ["VMScale-Bot"],
    automations: [{ name: "Key Vault sync", status: "Active" }], actions: [{ label: "Scale Settings", primary: true }],
  },
  lb: {
    title: "App Gateway", badge: "High", badgeTone: "high", subtitle: "WAF v2 · OWASP CRS 3.2",
    executiveSummary: "L7 ingress with WAF. Front-ends all portal traffic, terminates TLS.",
    blastRadius: [{ label: "Listeners", value: "14", tone: "slate" }, { label: "WAF rules", value: "320 active", tone: "slate" }],
    topDeps: ["Azure Front Door", "Traffic Manager"], coworkers: ["WAFTuner-Bot"],
    automations: [{ name: "Rule auto-tuning", status: "Active" }], actions: [{ label: "Open WAF", primary: true }],
  },
  afd: {
    title: "Azure Front Door", badge: "Medium", badgeTone: "medium", subtitle: "Global CDN + edge TLS",
    executiveSummary: "Global CDN. Edge TLS for 4.2M daily user sessions.",
    blastRadius: [{ label: "Edge PoPs", value: "118", tone: "slate" }, { label: "Cache hit ratio", value: "94%", tone: "slate" }],
    topDeps: ["Web Customers", "Mobile Customers"], coworkers: ["EdgeCache-Bot"],
    automations: [{ name: "Cache purge on deploy", status: "Active" }], actions: [{ label: "Edge Analytics", primary: true }],
  },
  tm: {
    title: "Traffic Manager", badge: "Medium", badgeTone: "medium", subtitle: "DNS routing · Performance profile",
    executiveSummary: "Latency-based DNS routing across 4 regions. Health-probe driven failover.",
    blastRadius: [{ label: "Endpoints", value: "4", tone: "slate" }, { label: "TTL", value: "30s", tone: "slate" }],
    topDeps: ["Partners / APIs"], coworkers: ["DNSGuard-Bot"],
    automations: [{ name: "Health probe rotation", status: "Active" }], actions: [{ label: "Open Profile", primary: true }],
  },
  ca1: {
    title: "DigiCert Global Root G2", badge: "External CA", badgeTone: "healthy", subtitle: "Public trust root · RSA 2048",
    executiveSummary: "External public CA root. Anchors 71% of all portal-facing certificates.",
    blastRadius: [
      { label: "Trust hierarchy", value: "Root → ICA → Leaf", tone: "slate" },
      { label: "Issued certificates", value: "29,840", tone: "amber" },
      { label: "Renewal obligations", value: "Quarterly attestation", tone: "slate" },
      { label: "CA concentration risk", value: "71% portfolio", tone: "red" },
    ],
    topDeps: ["DigiCert TLS RSA 4096", "DigiCert TLS RSA 2048"], coworkers: ["CADiversity-Bot"],
    automations: [{ name: "Cross-sign monitoring", status: "Active" }], actions: [{ label: "View CA Profile", primary: true }],
  },
  ca2: {
    title: "DigiCert Global Root G3", badge: "External CA", badgeTone: "healthy", subtitle: "Public trust root · ECC P-384",
    executiveSummary: "ECC public root for modern clients. Issues 9.2K active certs.",
    blastRadius: [{ label: "Issued certificates", value: "9,210", tone: "slate" }, { label: "CA concentration", value: "22%", tone: "amber" }],
    topDeps: ["DigiCert TLS ECC 256"], coworkers: ["CADiversity-Bot"],
    automations: [{ name: "ECC adoption tracking", status: "Active" }], actions: [{ label: "View CA Profile", primary: true }],
  },
  k1: {
    title: "HSM RSA 4096", badge: "Healthy", badgeTone: "healthy", subtitle: "Vault West · FIPS 140-2 L3",
    executiveSummary: "Hardware-protected private key bound to DigiCert RSA 4096 cert.",
    blastRadius: [{ label: "FIPS level", value: "140-2 L3", tone: "slate" }, { label: "Custodians", value: "M-of-N (3/5)", tone: "slate" }],
    topDeps: ["DigiCert TLS RSA 4096"], coworkers: ["HSMSentinel-Bot"],
    automations: [{ name: "Quorum audit", status: "Active" }], actions: [{ label: "Open HSM Console", primary: true }],
  },
  k2: {
    title: "HSM ECC 256", badge: "Healthy", badgeTone: "healthy", subtitle: "Vault West · FIPS 140-2 L3",
    executiveSummary: "ECC private key for AKS ingress cert. Sealed in nCipher nShield.",
    blastRadius: [{ label: "Key uses / day", value: "180K signs", tone: "slate" }],
    topDeps: ["DigiCert TLS ECC 256"], coworkers: ["HSMSentinel-Bot"], automations: [], actions: [{ label: "Open HSM Console", primary: true }],
  },
  k3: {
    title: "HSM RSA 2048", badge: "Healthy", badgeTone: "healthy", subtitle: "Vault East · FIPS 140-2 L2",
    executiveSummary: "Backup vault key. Used for internal mTLS only.",
    blastRadius: [{ label: "Last attestation", value: "12 days ago", tone: "slate" }],
    topDeps: ["DigiCert TLS RSA 2048"], coworkers: ["HSMSentinel-Bot"], automations: [], actions: [{ label: "Open HSM Console", primary: true }],
  },
  kv: {
    title: "Azure Key Vault", badge: "Medium", badgeTone: "medium", subtitle: "kv-portal-prod · Premium SKU",
    executiveSummary: "Stores certificates, secrets, and ACME validation records.",
    blastRadius: [
      { label: "Secrets", value: "1,840", tone: "slate" },
      { label: "Certificates stored", value: "612", tone: "amber" },
      { label: "Rotation schedules", value: "27 active", tone: "slate" },
      { label: "HSM integration", value: "Premium · Managed HSM", tone: "slate" },
    ],
    topDeps: ["DigiCert Global Root G2", "DigiCert Global Root G3"], coworkers: ["VaultRotator-Bot"],
    automations: [{ name: "Auto-rotation", status: "Active" }, { name: "RBAC drift detection", status: "Active" }],
    actions: [{ label: "Open Key Vault", primary: true }],
  },
  web: {
    title: "Web Customers", badge: "Critical", badgeTone: "critical", subtitle: "Browser-based portal users",
    executiveSummary: "18,000 active web users. 62% North America, 24% EMEA, 14% APAC.",
    blastRadius: [
      { label: "Customer count", value: "18,000", tone: "red" },
      { label: "Geography", value: "NA 62% · EMEA 24% · APAC 14%", tone: "slate" },
      { label: "Transaction volume", value: "240K txn / day", tone: "slate" },
      { label: "Revenue exposure", value: "$2.8M / day", tone: "red" },
    ],
    topDeps: ["Azure Front Door", "Customer Portal"], coworkers: ["CXMonitor-Bot"],
    automations: [{ name: "Synthetic transaction probes", status: "Active" }], actions: [{ label: "Open CX Dashboard", primary: true }],
  },
  mob: {
    title: "Mobile Customers", badge: "High", badgeTone: "high", subtitle: "iOS + Android native apps",
    executiveSummary: "7,000 active mobile users. Cert pinning enforced — outage = forced app update.",
    blastRadius: [
      { label: "Customer count", value: "7,000", tone: "amber" },
      { label: "Cert pinning", value: "SHA-256 pin", tone: "red" },
      { label: "Transaction volume", value: "92K txn / day", tone: "slate" },
      { label: "Revenue exposure", value: "$1.1M / day", tone: "amber" },
    ],
    topDeps: ["Azure Front Door", "DigiCert TLS ECC 256"], coworkers: ["MobileTelemetry-Bot"],
    automations: [{ name: "Pin rollout coordination", status: "Manual" }], actions: [{ label: "Open Mobile Console", primary: true }],
  },
  prt: {
    title: "Partners / APIs", badge: "Medium", badgeTone: "medium", subtitle: "B2B integrations · 47 partners",
    executiveSummary: "3,000 partner API consumers across 47 organizations. mTLS required.",
    blastRadius: [
      { label: "Customer count", value: "3,000", tone: "slate" },
      { label: "Partner orgs", value: "47", tone: "slate" },
      { label: "Transaction volume", value: "42K calls / day", tone: "slate" },
      { label: "Revenue exposure", value: "$300K / day", tone: "amber" },
    ],
    topDeps: ["Traffic Manager"], coworkers: ["PartnerTrust-Bot"],
    automations: [{ name: "Partner cert validation", status: "Active" }], actions: [{ label: "Open Partner Hub", primary: true }],
  },
};

const fallbackPane = (id: string, label: string): Pane => ({
  title: label, badge: "Tracked", badgeTone: "low",
  subtitle: `Node ${id}`, executiveSummary: `${label} is part of the certificate dependency graph.`,
  blastRadius: [{ label: "Risk Score", value: "—", tone: "slate" }],
  topDeps: [], coworkers: [], automations: [], actions: [{ label: "Open" }],
});

// ============== ANALYSIS PANE ==============
function AnalysisPane({
  open, deep, nodeId, label, onClose, onSimulate,
}: { open: boolean; deep: boolean; nodeId: string | null; label?: string; onClose: () => void; onSimulate: () => void }) {
  const pane = nodeId ? (PANES[nodeId] || fallbackPane(nodeId, label || nodeId)) : null;
  const [tab, setTab] = useState<PaneTab>("Executive");
  useEffect(() => { setTab(deep ? "Technical" : "Executive"); }, [nodeId, deep]);

  const tabs: PaneTab[] = deep
    ? ["Executive", "Technical", "Dependencies", "Automation", "Evidence", "Timeline"]
    : ["Executive"];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[460px] p-0 overflow-y-auto">
        {pane && (
          <div className="flex flex-col h-full">
            <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-200">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-slate-500">{pane.subtitle}</div>
                  <SheetTitle className="text-base font-bold text-slate-900 leading-tight">{pane.title}</SheetTitle>
                  <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded mt-1.5", riskStyles[pane.badgeTone].chip)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", riskStyles[pane.badgeTone].dot)} />
                    {pane.badge}
                  </span>
                </div>
                <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100"><X className="h-4 w-4 text-slate-500" /></button>
              </div>
            </SheetHeader>

            {tabs.length > 1 && (
              <div className="px-5 pt-2 border-b border-slate-200 flex gap-1 overflow-x-auto">
                {tabs.map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={cn(
                    "text-[11.5px] px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap",
                    tab === t ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50",
                  )}>{t}</button>
                ))}
              </div>
            )}

            <div className="px-5 py-4 space-y-5 flex-1">
              {tab === "Executive" && (
                <>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Executive Summary</div>
                    <p className="text-[13px] text-slate-700 mt-1 leading-relaxed">{pane.executiveSummary}</p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Blast Radius</div>
                    <div className="grid grid-cols-2 gap-2">
                      {pane.blastRadius.map((b) => (
                        <div key={b.label} className="rounded-lg border border-slate-200 p-2.5">
                          <div className="text-[10.5px] text-slate-500">{b.label}</div>
                          <div className={cn("text-[14px] font-bold mt-0.5", subToneMap[b.tone || "slate"])}>{b.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {pane.topDeps.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Top Dependencies</div>
                      <div className="flex flex-wrap gap-1.5">
                        {pane.topDeps.map((d) => (
                          <span key={d} className="text-[11px] px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pane.coworkers.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Digital Coworkers Involved</div>
                      <div className="flex flex-wrap gap-1.5">
                        {pane.coworkers.map((c) => (
                          <span key={c} className="text-[11px] px-2 py-1 rounded-md bg-violet-50 border border-violet-200 text-violet-700 inline-flex items-center gap-1">
                            <Bot className="h-3 w-3" /> {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {tab === "Technical" && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Technical Metadata</div>
                  <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
                    {(pane.technical || [{ label: "—", value: "No technical metadata captured" }]).map((r) => (
                      <div key={r.label} className="flex items-center justify-between px-3 py-2 text-[12px]">
                        <span className="text-slate-500">{r.label}</span>
                        <span className="text-slate-800 font-mono">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "Dependencies" && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Dependency Explorer</div>
                  <div className="space-y-1.5">
                    {pane.topDeps.map((d) => (
                      <div key={d} className="flex items-center justify-between rounded-md border border-slate-200 px-2.5 py-2 text-[12px]">
                        <span className="inline-flex items-center gap-2"><GitMerge className="h-3.5 w-3.5 text-slate-400" /> {d}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "Automation" && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Available Automations</div>
                  <div className="space-y-1.5">
                    {pane.automations.length === 0 && <div className="text-[12px] text-slate-500">No automations registered.</div>}
                    {pane.automations.map((a) => (
                      <div key={a.name} className="flex items-center justify-between rounded-md border border-slate-200 px-2.5 py-2 text-[12px]">
                        <span className="inline-flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-violet-500" /> {a.name}</span>
                        <span className="text-[10.5px] font-semibold text-slate-500">{a.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "Evidence" && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Audit Evidence</div>
                  <ul className="space-y-1.5">
                    {(pane.evidence || [{ ts: "—", text: "No evidence captured" }]).map((e, i) => (
                      <li key={i} className="flex gap-2 text-[12px]"><span className="text-slate-400 tabular-nums">{e.ts}</span><span className="text-slate-700">{e.text}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {tab === "Timeline" && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Historical Events</div>
                  <ul className="space-y-1.5">
                    {(pane.timeline || [{ ts: "—", text: "No history yet" }]).map((e, i) => (
                      <li key={i} className="flex gap-2 text-[12px]"><span className="text-slate-400 tabular-nums">{e.ts}</span><span className="text-slate-700">{e.text}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex items-center gap-2 sticky bottom-0 bg-white">
              {pane.actions.map((a, i) => (
                <button
                  key={a.label}
                  onClick={a.label === "Simulate Impact" ? onSimulate : undefined}
                  className={cn(
                    "text-[12px] font-semibold px-3 py-2 rounded-lg inline-flex items-center gap-1.5",
                    a.primary
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {a.icon && <a.icon className="h-3.5 w-3.5" />}
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ============== BOTTOM IMPACT BAR ==============
const IMPACT = [
  { id: "paths", label: "Critical Risk Paths", value: "68", tone: "red" as const, icon: AlertTriangle },
  { id: "certs", label: "Certificates At Risk", value: "380", tone: "red" as const, icon: ShieldAlert },
  { id: "outages", label: "Potential Outages", value: "42", tone: "amber" as const, icon: Activity },
  { id: "rev", label: "Revenue At Risk", value: "$12.4M", tone: "red" as const, icon: Briefcase },
  { id: "comp", label: "Compliance Impact", value: "7 Frameworks", tone: "amber" as const, icon: BookCheck },
  { id: "mtti", label: "Mean Time To Impact", value: "5.2 Days", tone: "slate" as const, icon: Activity },
];

// ============== MAIN PAGE ==============
export default function RiskExposureMap() {
  const navigate = useNavigate();
  // Build flow nodes/edges
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [deep, setDeep] = useState(false);
  const [openPane, setOpenPane] = useState(false);
  const [paneNodeId, setPaneNodeId] = useState<string | null>(null);
  const [paneLabel, setPaneLabel] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"map" | "heatmap" | "layer">("map");
  const [simulating, setSimulating] = useState(false);

  // adjacency
  const adjacency = useMemo(() => {
    const up = new Map<string, Set<string>>();
    const down = new Map<string, Set<string>>();
    RAW_EDGES.forEach((e) => {
      if (!down.has(e.s)) down.set(e.s, new Set());
      down.get(e.s)!.add(e.t);
      if (!up.has(e.t)) up.set(e.t, new Set());
      up.get(e.t)!.add(e.s);
    });
    return { up, down };
  }, []);

  const relatedSet = (id: string | null) => {
    if (!id) return null;
    const acc = new Set<string>([id]);
    const walk = (start: string, map: Map<string, Set<string>>) => {
      const stack = [start];
      while (stack.length) {
        const n = stack.pop()!;
        const next = map.get(n);
        if (!next) continue;
        for (const m of next) if (!acc.has(m)) { acc.add(m); stack.push(m); }
      }
    };
    walk(id, adjacency.up); walk(id, adjacency.down);
    return acc;
  };

  // build nodes progressively (page load animation: layer by layer)
  useEffect(() => {
    const layers = [
      ["cp"], ["api", "auth", "pay"],
      ["appsvc", "aks", "vmss", "lb"],
      ["c1", "c2", "c3", "afd", "tm"],
      ["ca1", "ca2", "k1", "k2", "k3", "kv"],
      ["web", "mob", "prt"],
    ];
    let total = 0;
    layers.forEach((layer, li) => {
      setTimeout(() => {
        setNodes((prev) => [
          ...prev,
          ...layer.map<Node<NodeData>>((id) => {
            const r = RAW_NODES.find((n) => n.id === id)!;
            return { id, position: { x: r.x, y: r.y }, type: "dep", data: r.data };
          }),
        ]);
      }, 400 + li * 280);
      total = 400 + li * 280;
    });
    // Then connect edges
    setTimeout(() => {
      setEdges(RAW_EDGES.map<Edge>((e, i) => ({
        id: `e${i}`, source: e.s, target: e.t,
        animated: !!e.flow, type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
        style: edgeStyleFor(e.w, false, false),
        data: { w: e.w },
      })));
    }, total + 250);
  }, [setNodes, setEdges]);

  // Update node highlight & edge styling on hover/selection
  useEffect(() => {
    const focusId = hovered || selected;
    const related = relatedSet(focusId);
    setNodes((nds) => nds.map((n) => ({
      ...n,
      data: {
        ...n.data,
        highlight: !related ? "off" : related.has(n.id) ? (n.id === focusId ? "on" : "off") : "dim",
      },
    })));
    setEdges((eds) => eds.map((e) => {
      const isRelated = related && (related.has(e.source) && related.has(e.target));
      const w = (e.data as any)?.w as DepStrength;
      return { ...e, style: edgeStyleFor(w, !!(related && !isRelated), !!(related && isRelated)) };
    }));
  }, [hovered, selected]); // eslint-disable-line

  // Heatmap recoloring
  useEffect(() => {
    setNodes((nds) => nds.map((n) => {
      const orig = RAW_NODES.find((r) => r.id === n.id)?.data.risk || "healthy";
      return { ...n, data: { ...n.data, risk: orig } };
    }));
  }, [viewMode]); // eslint-disable-line

  const onNodeClick = useCallback((_: any, n: Node<NodeData>) => {
    setSelected(n.id); setDeep(false); setPaneNodeId(n.id); setPaneLabel(n.data.label); setOpenPane(true);
  }, []);
  const onNodeDoubleClick = useCallback((_: any, n: Node<NodeData>) => {
    setSelected(n.id); setDeep(true); setPaneNodeId(n.id); setPaneLabel(n.data.label); setOpenPane(true);
  }, []);
  const onNodeMouseEnter = useCallback((_: any, n: Node<NodeData>) => setHovered(n.id), []);
  const onNodeMouseLeave = useCallback(() => setHovered(null), []);

  // Impact simulation: pulse the path c1 → cp
  const runSimulation = () => {
    setSimulating(true);
    const sequence = ["c1", "appsvc", "api", "cp", "web"];
    sequence.forEach((id, i) => {
      setTimeout(() => {
        setNodes((nds) => nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, risk: "critical", pulse: true } } : n,
        ));
      }, i * 600);
    });
    setTimeout(() => setSimulating(false), sequence.length * 600 + 800);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <Header />
        <KpiCards onPick={(id) => {
          const isDeep = id.endsWith(":deep");
          const realId = id.replace(":deep", "");
          setPaneNodeId(realId); setPaneLabel(KPIS.find(k => k.id === realId)?.label); setDeep(isDeep); setOpenPane(true);
        }} />

        {/* View mode controls */}
        <motion.div
          initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          className="px-6 pt-4 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-slate-900 inline-flex items-center gap-2">
              <Network className="h-4 w-4 text-blue-600" /> Certificate Dependency & Risk Map
            </h2>
            <span className="text-[11px] text-slate-500">Interactive digital twin · {nodes.length} nodes · {edges.length} dependencies</span>
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {[
              { id: "map" as const, label: "Dependency Map", icon: Network },
              { id: "heatmap" as const, label: "Risk Heatmap", icon: AlertTriangle },
              { id: "layer" as const, label: "Layer View", icon: Layers },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={cn(
                  "text-[11.5px] font-semibold px-2.5 py-1.5 rounded-md inline-flex items-center gap-1.5",
                  viewMode === v.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <v.icon className="h-3.5 w-3.5" /> {v.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Map area */}
        <div className="px-6 pt-3 pb-3 flex-1 min-h-[640px]">
          <div className="relative h-[640px] rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {viewMode === "layer" && <LayerBands />}
            <ReactFlow
              nodes={nodes} edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick} onNodeDoubleClick={onNodeDoubleClick}
              onNodeMouseEnter={onNodeMouseEnter} onNodeMouseLeave={onNodeMouseLeave}
              fitView fitViewOptions={{ padding: 0.15 }}
              proOptions={{ hideAttribution: true }}
              nodesDraggable={false} nodesConnectable={false} elementsSelectable
              panOnDrag zoomOnScroll
            >
              <Background gap={20} size={1} color="#e2e8f0" />
              <Controls showInteractive={false} className="!shadow-sm !border !border-slate-200 !rounded-lg overflow-hidden" />
              <MiniMap nodeStrokeWidth={2} maskColor="rgba(241,245,249,0.7)" className="!border !border-slate-200 !rounded-lg" />
            </ReactFlow>

            {/* Legend */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Risk Legend</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10.5px] text-slate-600">
                {(["critical","high","medium","low","healthy"] as RiskLevel[]).map((r) => (
                  <div key={r} className="inline-flex items-center gap-1.5 capitalize">
                    <span className={cn("h-2 w-2 rounded-full", riskStyles[r].dot)} />{r}
                  </div>
                ))}
              </div>
            </div>

            {simulating && (
              <div className="absolute top-3 right-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-3 py-2 shadow-sm text-[11.5px] font-semibold inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> Simulating expiration cascade…
              </div>
            )}
          </div>
        </div>

        {/* Bottom impact bar */}
        <motion.div
          initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2 }}
          className="px-6 pb-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {IMPACT.map((m) => (
              <button key={m.id}
                onClick={() => { setPaneNodeId(m.id); setPaneLabel(m.label); setDeep(false); setOpenPane(true); }}
                className="text-left bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10.5px] text-slate-500 font-medium">{m.label}</div>
                  <m.icon className={cn("h-3.5 w-3.5", subToneMap[m.tone])} />
                </div>
                <div className={cn("text-[20px] font-bold mt-1", subToneMap[m.tone])}>{m.value}</div>
              </button>
            ))}
          </div>
        </motion.div>

        <AnalysisPane
          open={openPane} deep={deep} nodeId={paneNodeId} label={paneLabel}
          onClose={() => setOpenPane(false)} onSimulate={() => { setOpenPane(false); runSimulation(); }}
        />
      </main>
    </div>
  );
}

// Subtle layer bands shown in Layer View
function LayerBands() {
  const bands = [
    { label: "Business Layer", y: 0, h: 100 },
    { label: "Application Layer", y: 100, h: 140 },
    { label: "Infrastructure Layer", y: 240, h: 140 },
    { label: "Certificate Layer", y: 380, h: 140 },
    { label: "Security Layer", y: 520, h: 140 },
    { label: "Customer Layer", y: 660, h: 110 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none">
      {bands.map((b, i) => (
        <div key={b.label} style={{ top: b.y, height: b.h }}
          className={cn("absolute inset-x-0 border-t border-dashed border-slate-200 pl-3 text-[10px] uppercase tracking-wider font-bold",
            i % 2 === 0 ? "bg-slate-50/40" : "bg-white/0", "text-slate-300")}>
          <span className="absolute top-1 left-3">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
