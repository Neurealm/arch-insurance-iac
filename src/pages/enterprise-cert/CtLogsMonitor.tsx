import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Bell, BookCheck, Bot, Briefcase, Building2, Cog, FileSearch, FileText,
  GitBranch, Globe, HelpCircle, LayoutDashboard, Package, Plug, RefreshCw,
  ScrollText, Scale, Search, ServerCog, ShieldAlert, ShieldCheck, UserCog, Sparkles,
  ChevronRight, AlertTriangle, CheckCircle2, FileBadge, Zap, KeyRound,
  TrendingUp, Download, Award, Radar, Radio, Eye, Network, Crosshair, Siren, Fingerprint,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
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
    { id: "int", label: "Integrations", icon: Plug, to: "/enterprise-certificate-management/integrations" },
  ]},
  { label: "Security & Compliance", items: [
    { id: "sec", label: "Security Posture", icon: ShieldCheck, to: "/enterprise-certificate-management/security-posture" },
    { id: "com", label: "Compliance Center", icon: BookCheck, to: "/enterprise-certificate-management/compliance-center" },
    { id: "audit", label: "Audit & Evidence", icon: FileSearch, to: "/enterprise-certificate-management/audit-evidence" },
    { id: "pol", label: "Policy Engine", icon: Scale, to: "/enterprise-certificate-management/policy-engine" },
    { id: "ct", label: "CT Logs Monitor", icon: ScrollText, to: "/enterprise-certificate-management/ct-logs-monitor", active: true },
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
    <motion.aside initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.45 }}
      className="w-[240px] shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 flex flex-col">
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
                const cls = cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors",
                  it.active ? "bg-blue-50 text-blue-700 font-semibold" : "text-blue-700 font-semibold hover:bg-blue-50");
                return it.to
                  ? <Link key={it.id} to={it.to} className={cls}>{inner}</Link>
                  : <button key={it.id} className={cls}>{inner}</button>;
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="m-3 p-4 rounded-xl bg-gradient-to-br from-rose-600 to-orange-600 text-white">
        <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Trust Integrity</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">97.1</span>
          <span className="text-xs opacity-80">/100</span>
        </div>
        <div className="text-xs opacity-90">1,842 domains · 2 unauthorized</div>
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
          <h1 className="text-[18px] font-bold text-slate-900 truncate">Certificate Transparency (CT) Log Monitoring Center</h1>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" /> Live · 12.8M log entries monitored
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input placeholder="Search domains, issuers, certificates" className="pl-8 pr-3 h-8 w-72 text-[12px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 outline-none" />
        </div>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 inline-flex items-center gap-1.5"><Siren className="h-3.5 w-3.5" /> Open Investigation</button>
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
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}
function KpiCard({ icon: Icon, label, value, suffix, accent, trend, decimals = 0 }: any) {
  const n = useCountUp(value);
  const shown = decimals ? n.toFixed(decimals) : Math.floor(n).toLocaleString();
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 hover:shadow-md transition-shadow">
      <div className={cn("absolute inset-x-0 top-0 h-0.5", accent)} />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">{label}</div>
          <div className="mt-1 text-[22px] font-bold text-slate-900 tabular-nums">{shown}{suffix}</div>
        </div>
        <div className="h-8 w-8 rounded-lg bg-slate-50 grid place-items-center text-slate-600 shrink-0"><Icon className="h-4 w-4" /></div>
      </div>
      {trend && <div className="mt-1.5 text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {trend}</div>}
    </motion.div>
  );
}

// ============== CATEGORIES ==============
type Cat = { id: string; label: string; icon: any; color: string; count: number; trend: string; risk: string; desc: string; };
const CATS: Cat[] = [
  { id: "auth",   label: "Authorized Issuance",   icon: CheckCircle2,  color: "from-emerald-500 to-teal-600",  count: 41820, trend: "+212/d", risk: "Low",      desc: "Issuance from approved CAs for known domains." },
  { id: "unauth", label: "Unauthorized Issuance", icon: ShieldAlert,   color: "from-rose-500 to-red-700",      count: 2,     trend: "+1 today", risk: "Critical",desc: "Certs from unapproved CAs for our domains." },
  { id: "susp",   label: "Suspicious Issuance",   icon: AlertTriangle, color: "from-amber-500 to-orange-600",  count: 11,    trend: "+3 today", risk: "High",    desc: "Anomalies in CA, SAN, or naming patterns." },
  { id: "unk",    label: "Unknown Issuance",      icon: Eye,           color: "from-violet-500 to-purple-600", count: 42,    trend: "−8 wk",    risk: "Medium",  desc: "No owner mapped · awaiting attribution." },
  { id: "exp",    label: "Expired Trust",         icon: KeyRound,      color: "from-slate-500 to-slate-700",   count: 18,    trend: "−4 wk",    risk: "Medium",  desc: "Certs past validity still served somewhere." },
  { id: "comp",   label: "Compromised Trust",     icon: Siren,         color: "from-rose-600 to-rose-800",     count: 0,     trend: "0 wk",     risk: "Critical",desc: "Revoked/compromised key chains in the wild." },
  { id: "inv",    label: "Active Investigations", icon: Crosshair,     color: "from-blue-500 to-indigo-600",   count: 4,     trend: "2 closing", risk: "Medium", desc: "Digital coworker investigations in flight." },
];
const RISK_TONE: any = { Critical: "bg-rose-100 text-rose-700 border-rose-200", High: "bg-orange-100 text-orange-700 border-orange-200", Medium: "bg-amber-100 text-amber-700 border-amber-200", Low: "bg-emerald-100 text-emerald-700 border-emerald-200" };

// ============== DOMAIN INVENTORY ==============
const DOMAINS = [
  { name: "company.com",            certs: 142, issuers: "DigiCert · Entrust",    trust: "Trusted",     act: "2m ago",  risk: 12, impact: "Brand · Marketing" },
  { name: "api.company.com",        certs: 38,  issuers: "DigiCert · GlobalSign", trust: "Trusted",     act: "8s ago",  risk: 18, impact: "Public APIs · $480M" },
  { name: "customer.company.com",   certs: 64,  issuers: "DigiCert",              trust: "Trusted",     act: "42s ago", risk: 22, impact: "Customer Portal · $310M" },
  { name: "claims.company.com",     certs: 28,  issuers: "Entrust · Internal CA", trust: "Trusted",     act: "1m ago",  risk: 28, impact: "Healthcare Claims" },
  { name: "partners.company.com",   certs: 18,  issuers: "Sectigo · Unknown",     trust: "Suspicious",  act: "12m ago", risk: 68, impact: "Partner Exchange" },
  { name: "corp.company.com",       certs: 22,  issuers: "Internal CA",           trust: "Trusted",     act: "14m ago", risk: 14, impact: "Employee SSO" },
  { name: "checkout.company.com",   certs: 12,  issuers: "DigiCert",              trust: "Trusted",     act: "32s ago", risk: 24, impact: "Payments · $1.2B" },
  { name: "shadow-r-d.company.io",  certs: 4,   issuers: "Let's Encrypt",         trust: "Unauthorized",act: "9m ago",  risk: 92, impact: "Unknown ownership" },
];
const TRUST_TONE: any = {
  Trusted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Suspicious: "bg-amber-50 text-amber-700 border-amber-200",
  Unauthorized: "bg-rose-50 text-rose-700 border-rose-200",
  Unknown: "bg-slate-100 text-slate-600 border-slate-200",
};

// ============== LIVE FEED ==============
const FEED = [
  { t: "09:42:18", k: "issued",   ev: "Cert issued · CN=api.company.com · DigiCert · SAN +3",                tone: "bg-emerald-500" },
  { t: "09:41:52", k: "wild",     ev: "Wildcard issued · *.dev.company.com · Internal CA",                  tone: "bg-blue-500" },
  { t: "09:41:14", k: "unauth",   ev: "⚠ UNAUTHORIZED · shadow-r-d.company.io · Let's Encrypt · unknown owner", tone: "bg-rose-600" },
  { t: "09:40:48", k: "renew",    ev: "Cert renewed · checkout.company.com · DigiCert",                     tone: "bg-emerald-500" },
  { t: "09:40:21", k: "san",      ev: "New SAN observed · partners.company.com adds vendor-x subdomain",    tone: "bg-amber-500" },
  { t: "09:39:54", k: "issuer",   ev: "Unexpected issuer · Sectigo for claims.company.com · investigating", tone: "bg-amber-500" },
  { t: "09:39:18", k: "expand",   ev: "Domain expansion · 12 new subdomains observed under company.com",    tone: "bg-violet-500" },
  { t: "09:38:42", k: "susp",     ev: "Suspicious · cornpany.com (typo-squat) · monitoring",                tone: "bg-rose-500" },
  { t: "09:38:11", k: "issued",   ev: "Cert issued · CN=customer.company.com · DigiCert",                   tone: "bg-emerald-500" },
  { t: "09:37:48", k: "renew",    ev: "Cert renewed · corp.company.com · Internal CA",                      tone: "bg-emerald-500" },
];

// ============== UNAUTHORIZED ==============
const UNAUTH = [
  { id: "UA-2241", cn: "shadow-r-d.company.io", issuer: "Let's Encrypt", reason: "Unapproved CA · Unknown requestor", risk: 92, found: "9m ago", impact: "Brand trust · possible shadow IT", action: "Investigate · revoke if rogue" },
  { id: "UA-2238", cn: "cornpany.com",          issuer: "GoGetSSL",      reason: "Typo-squat domain · phishing potential", risk: 88, found: "42m ago", impact: "Customer trust · brand", action: "Brand take-down · CT block-list" },
];
const SUSPICIOUS = [
  { id: "SI-9912", cn: "partners.company.com",  issuer: "Sectigo",       reason: "Unexpected issuer for this domain",     risk: 64, found: "12m ago", impact: "Partner data flow",  action: "Validate vendor change request" },
  { id: "SI-9909", cn: "*.dev.company.com",     issuer: "Internal CA",   reason: "Wildcard exceeds policy scope",         risk: 58, found: "26m ago", impact: "Dev environment trust", action: "Request scope reduction" },
  { id: "SI-9907", cn: "vendor-x.partners.company.com", issuer: "Sectigo", reason: "New SAN added · no change ticket",    risk: 52, found: "38m ago", impact: "Partner exchange",   action: "Open ITSM change record" },
];

// ============== TRUST GRAPH ==============
const TG_NODES = [
  { id: "ent", label: "company.com",            x: 50, y: 50, fill: "fill-rose-600",    r: 32, kind: "Enterprise" },
  { id: "ca1", label: "DigiCert",               x: 18, y: 18, fill: "fill-emerald-500", r: 18, kind: "Trusted CA" },
  { id: "ca2", label: "Entrust",                x: 50, y: 12, fill: "fill-emerald-500", r: 16, kind: "Trusted CA" },
  { id: "ca3", label: "GlobalSign",             x: 82, y: 18, fill: "fill-emerald-500", r: 16, kind: "Trusted CA" },
  { id: "ca4", label: "Sectigo",                x: 88, y: 50, fill: "fill-amber-500",   r: 14, kind: "Watchlist" },
  { id: "ca5", label: "Let's Encrypt",          x: 12, y: 50, fill: "fill-rose-500",    r: 14, kind: "Unauthorized" },
  { id: "svc1", label: "Payments · $1.2B",      x: 28, y: 82, fill: "fill-blue-500",    r: 16, kind: "Business Svc" },
  { id: "svc2", label: "Customer Portal",       x: 50, y: 88, fill: "fill-blue-500",    r: 16, kind: "Business Svc" },
  { id: "svc3", label: "Partner Exchange",      x: 72, y: 82, fill: "fill-blue-500",    r: 16, kind: "Business Svc" },
  { id: "inv",  label: "Investigation INV-2241",x: 6,  y: 78, fill: "fill-violet-500",  r: 12, kind: "Investigation" },
];
const TG_EDGES: Array<[string, string, "ok" | "warn" | "bad"]> = [
  ["ent","ca1","ok"],["ent","ca2","ok"],["ent","ca3","ok"],
  ["ent","ca4","warn"],["ent","ca5","bad"],
  ["ent","svc1","ok"],["ent","svc2","ok"],["ent","svc3","warn"],
  ["ca5","inv","bad"],["inv","ent","warn"],
];
const EDGE_TONE: any = { ok: "rgb(16 185 129)", warn: "rgb(245 158 11)", bad: "rgb(225 29 72)" };

// ============== HEAT MAP ==============
const HM_DOMAINS = ["company.com","api","customer","checkout","claims","partners","corp","dev","shadow-r-d","cornpany"];
const HM_REGIONS = ["NA","EU","UK","APAC","LATAM","ME"];
function hmCell(d: string, r: string) {
  const seed = (d.charCodeAt(0) * 7 + r.charCodeAt(0) * 3) % 100;
  if (d === "shadow-r-d" || d === "cornpany") return 88 + (seed % 10);
  if (d === "partners") return 58 + (seed % 10);
  return 8 + (seed % 18);
}
function hmTone(v: number) {
  if (v >= 80) return "bg-rose-600 text-white";
  if (v >= 60) return "bg-orange-500 text-white";
  if (v >= 40) return "bg-amber-400 text-amber-900";
  if (v >= 20) return "bg-lime-300 text-lime-900";
  return "bg-emerald-400 text-emerald-900";
}

// ============== COWORKERS ==============
const COWORKERS = [
  { name: "Security Investigation Analyst", current: "INV-2241 · shadow-r-d.company.io",   conf: 96, evid: 18, action: "Verify ownership · revoke",       escalate: "Sec Lead" },
  { name: "Certificate Risk Analyst",        current: "INV-2238 · cornpany.com take-down", conf: 94, evid: 22, action: "Brand legal · CT block-list",    escalate: "Brand Counsel" },
  { name: "Certificate Discovery Engineer",  current: "SI-9912 · partners.company.com",    conf: 92, evid: 12, action: "Validate vendor change",         escalate: "Partner Ops" },
  { name: "Cryptography Advisor",            current: "Wildcard policy review",            conf: 99, evid: 8,  action: "Recommend scope reduction",      escalate: "PKI Lead" },
];

// ============== ISSUERS ==============
const ISSUERS = [
  { name: "DigiCert",      vol: 28420, trust: "Trusted",     rating: 99, risk: "Low",      act: "212/d", impact: "Public, partner, customer" },
  { name: "Entrust",       vol: 4820,  trust: "Trusted",     rating: 98, risk: "Low",      act: "42/d",  impact: "Enterprise, claims" },
  { name: "GlobalSign",    vol: 3180,  trust: "Trusted",     rating: 97, risk: "Low",      act: "28/d",  impact: "APIs, edge" },
  { name: "Sectigo",       vol: 2420,  trust: "Watchlist",   rating: 86, risk: "Medium",   act: "18/d",  impact: "Partners (under review)" },
  { name: "Internal CA",   vol: 2840,  trust: "Trusted",     rating: 99, risk: "Low",      act: "62/d",  impact: "Corp · internal mesh" },
  { name: "Let's Encrypt", vol: 322,   trust: "Unauthorized",rating: 22, risk: "Critical", act: "1 today", impact: "Shadow IT vector" },
  { name: "Unknown",       vol: 8,     trust: "Unknown",     rating: 0,  risk: "High",     act: "—",     impact: "Attribution pending" },
];

// ============== THREAT CORRELATION ==============
const CORR = [
  { src: "CrowdStrike",      ev: "EDR alert correlated to shadow-r-d host fingerprint",   sev: "High",     time: "8m ago" },
  { src: "Microsoft Sentinel", ev: "Sign-in anomaly · Let's Encrypt API token usage",      sev: "Medium",   time: "14m ago" },
  { src: "Splunk",           ev: "DNS query spike on cornpany.com from external resolvers", sev: "High",   time: "22m ago" },
  { src: "Defender",         ev: "Suspicious cert install attempt blocked on 12 endpoints", sev: "Medium", time: "34m ago" },
  { src: "Wiz",              ev: "Cloud workload exposes cert from non-allow-listed CA",   sev: "Medium",   time: "48m ago" },
  { src: "Threat Intel",     ev: "External feed flagged cornpany.com as phishing kit",    sev: "Critical", time: "1h ago" },
];
const SEV_TONE: any = { Critical: "bg-rose-100 text-rose-700 border-rose-200", High: "bg-orange-100 text-orange-700 border-orange-200", Medium: "bg-amber-100 text-amber-700 border-amber-200", Low: "bg-emerald-100 text-emerald-700 border-emerald-200" };

// ============== INVESTIGATION TIMELINE ==============
const INV = [
  { step: "Certificate Issued",     who: "Let's Encrypt CA",                 when: "T-9m 12s",  what: "CN=shadow-r-d.company.io · 90-day TLS",                 tone: "bg-slate-500" },
  { step: "CT Log Detection",       who: "RunOps CT Collector",              when: "T-8m 58s",  what: "Detected in CT log 'Argon2025' · entry index 18,422",  tone: "bg-violet-500" },
  { step: "Risk Analysis",          who: "Certificate Risk Analyst (bot)",   when: "T-8m 41s",  what: "Score 92 · CA not allow-listed · owner unknown",        tone: "bg-rose-500" },
  { step: "Digital Investigation",  who: "Security Investigation Analyst",   when: "T-8m 22s",  what: "INV-2241 opened · 18 evidence items collected",         tone: "bg-blue-500" },
  { step: "Escalation",             who: "→ Sec Lead",                       when: "T-6m 18s",  what: "Paged · acknowledged in 42s",                           tone: "bg-amber-500" },
  { step: "Resolution",             who: "PKI Team + Brand Legal",           when: "T-3m 04s",  what: "Cert revocation request · CT block-list update queued", tone: "bg-emerald-500" },
  { step: "Audit Record",           who: "PKI Compliance Auditor",           when: "T-2m 48s",  what: "Evidence packaged · hash anchored",                     tone: "bg-teal-500" },
];

// ============== TRUST INTEGRITY ==============
const TRUST_BANDS = [
  { label: "Trusted Certificates",     v: 41820, total: 42000, color: "bg-emerald-500" },
  { label: "Unknown Certificates",     v: 42,    total: 42000, color: "bg-violet-500"  },
  { label: "Expired Certificates",     v: 18,    total: 42000, color: "bg-slate-400"   },
  { label: "Suspicious Certificates",  v: 11,    total: 42000, color: "bg-amber-500"   },
  { label: "Unauthorized Certificates",v: 2,     total: 42000, color: "bg-rose-600"    },
];

// ============== AUTOMATIONS ==============
const AUTOMATIONS = [
  { name: "CT Log Monitoring",      runs: 12800000, success: 99.99, saved: 18420, last: "2s ago" },
  { name: "Domain Monitoring",      runs: 1842000,  success: 99.9,  saved: 8420,  last: "4s ago" },
  { name: "Issuer Validation",      runs: 42000,    success: 99.8,  saved: 4280,  last: "6s ago" },
  { name: "Trust Analysis",         runs: 42000,    success: 99.7,  saved: 6420,  last: "8s ago" },
  { name: "Threat Correlation",     runs: 18420,    success: 99.6,  saved: 3120,  last: "12s ago" },
  { name: "Investigation Creation", runs: 4200,     success: 100,   saved: 2120,  last: "9m ago" },
];

// ============== TRENDS ==============
const T_ISSUE = [{m:"Jan",v:2418},{m:"Feb",v:2812},{m:"Mar",v:3120},{m:"Apr",v:3488},{m:"May",v:3920},{m:"Jun",v:4412},{m:"Jul",v:4812}];
const T_UNAUTH= [{m:"Jan",v:18},{m:"Feb",v:12},{m:"Mar",v:8},{m:"Apr",v:5},{m:"May",v:4},{m:"Jun",v:3},{m:"Jul",v:2}];
const T_EXP   = [{m:"Jan",v:1218},{m:"Feb",v:1342},{m:"Mar",v:1480},{m:"Apr",v:1612},{m:"May",v:1714},{m:"Jun",v:1782},{m:"Jul",v:1842}];
const T_TRUST = [{m:"Jan",v:88.4},{m:"Feb",v:90.2},{m:"Mar",v:92.1},{m:"Apr",v:93.8},{m:"May",v:95.2},{m:"Jun",v:96.4},{m:"Jul",v:97.1}];
const T_INV   = [{m:"Jan",v:412},{m:"Feb",v:482},{m:"Mar",v:612},{m:"Apr",v:822},{m:"May",v:1124},{m:"Jun",v:1480},{m:"Jul",v:4200}];
const T_CORR  = [{m:"Jan",v:142},{m:"Feb",v:188},{m:"Mar",v:228},{m:"Apr",v:262},{m:"May",v:294},{m:"Jun",v:318},{m:"Jul",v:342}];
const T_CWORK = [{m:"Jan",v:62},{m:"Feb",v:88},{m:"Mar",v:128},{m:"Apr",v:182},{m:"May",v:248},{m:"Jun",v:312},{m:"Jul",v:412}];

// ============== PANEL TYPES ==============
type Panel =
  | { kind: "cat"; c: Cat }
  | { kind: "domain"; d: typeof DOMAINS[number] }
  | { kind: "unauth"; u: typeof UNAUTH[number] }
  | { kind: "susp"; s: typeof SUSPICIOUS[number] }
  | { kind: "issuer"; i: typeof ISSUERS[number] }
  | { kind: "inv" }
  | { kind: "graph" }
  | null;

// ============== PAGE ==============
export default function CtLogsMonitor() {
  const [panel, setPanel] = useState<Panel>(null);
  const open = !!panel;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Header />
        <div className="p-6 space-y-6">

          {/* ===== EXECUTIVE KPI ===== */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Executive KPI Layer</div>
                <h2 className="text-[15px] font-bold text-slate-900">Watching the public internet · protecting enterprise trust</h2>
              </div>
              <span className="text-[11px] text-slate-500">Updated 2 seconds ago</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <KpiCard icon={Globe}         label="Domains Monitored"               value={1842}    accent="bg-gradient-to-r from-blue-400 to-indigo-600"     trend="+128 last qtr" />
              <KpiCard icon={FileBadge}     label="Certificates Observed"           value={42000}   accent="bg-gradient-to-r from-cyan-400 to-blue-600"       trend="+4,812 last 30d" />
              <KpiCard icon={ScrollText}    label="CT Log Entries Monitored"        value={12800000} accent="bg-gradient-to-r from-violet-400 to-purple-600"  trend="+1.8M last 30d" />
              <KpiCard icon={Sparkles}      label="New Certs Detected (30d)"        value={4812}    accent="bg-gradient-to-r from-emerald-400 to-teal-600"    trend="+18% MoM" />
              <KpiCard icon={ShieldAlert}   label="Unauthorized Certificates"       value={2}       accent="bg-gradient-to-r from-rose-500 to-rose-700"       trend="−16 vs LY" />
              <KpiCard icon={AlertTriangle} label="Suspicious Issuances"            value={11}      accent="bg-gradient-to-r from-amber-400 to-orange-500"    trend="all under review" />
              <KpiCard icon={Crosshair}     label="Digital Investigations Active"   value={4}       accent="bg-gradient-to-r from-blue-400 to-cyan-500"       trend="2 closing" />
              <KpiCard icon={Award}         label="Trust Integrity Score"           value={97.1}    suffix="" decimals={1} accent="bg-gradient-to-r from-emerald-400 to-green-600" trend="+8.7 vs LY" />
              <KpiCard icon={Radar}         label="Avg Detection Time"              value={3}       suffix=" min" accent="bg-gradient-to-r from-rose-400 to-orange-500"     trend="−2h vs LY" />
              <KpiCard icon={Bot}           label="Investigations Completed (YTD)"  value={4200}    accent="bg-gradient-to-r from-violet-400 to-fuchsia-500"  trend="100% closed" />
            </div>
          </section>

          {/* ===== CT MONITORING COMMAND CENTER ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">CT Monitoring Command Center</div>
                <h2 className="text-[15px] font-bold text-slate-900">Live certificate issuance activity · seven categories</h2>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"><span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" /> Threat board live</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {CATS.map((c) => (
                <motion.button key={c.id} whileHover={{ y: -2 }} onClick={() => setPanel({ kind: "cat", c })}
                  className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:shadow-lg transition group">
                  <div className="flex items-start gap-3">
                    <div className={cn("h-10 w-10 rounded-lg grid place-items-center bg-gradient-to-br text-white", c.color)}>
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-[14px] text-slate-900 truncate">{c.label}</div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{c.desc}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-500">Count</div>
                      <div className="text-[20px] font-bold tabular-nums">{c.count.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", RISK_TONE[c.risk])}>{c.risk}</span>
                      <div className="text-[10px] text-slate-500 mt-1">{c.trend}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* ===== DOMAIN INVENTORY + LIVE FEED ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Enterprise Domain Inventory</div>
                  <h2 className="text-[15px] font-bold text-slate-900">1,842 domains · trust posture per domain</h2>
                </div>
                <button className="text-[11px] font-semibold text-blue-700 inline-flex items-center gap-1">Add domain <ChevronRight className="h-3 w-3" /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead><tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 font-semibold">Domain</th>
                    <th className="py-2 font-semibold text-right">Certs</th>
                    <th className="py-2 font-semibold">Issuers</th>
                    <th className="py-2 font-semibold">Trust</th>
                    <th className="py-2 font-semibold">Recent</th>
                    <th className="py-2 font-semibold text-right">Risk</th>
                    <th className="py-2 font-semibold">Business Impact</th>
                  </tr></thead>
                  <tbody>
                    {DOMAINS.map((d) => (
                      <tr key={d.name} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setPanel({ kind: "domain", d })}>
                        <td className="py-2 font-semibold text-slate-900 inline-flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-blue-500" />{d.name}</td>
                        <td className="py-2 text-right tabular-nums">{d.certs}</td>
                        <td className="py-2 text-slate-600 text-[11px]">{d.issuers}</td>
                        <td className="py-2"><span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", TRUST_TONE[d.trust])}>{d.trust}</span></td>
                        <td className="py-2 text-slate-500 text-[11px]">{d.act}</td>
                        <td className="py-2 text-right">
                          <span className={cn("text-[11px] font-bold tabular-nums px-2 py-0.5 rounded",
                            d.risk >= 80 ? "bg-rose-100 text-rose-700" : d.risk >= 50 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>{d.risk}</span>
                        </td>
                        <td className="py-2 text-slate-600 text-[11px]">{d.impact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Live CT Feed</div>
                  <h2 className="text-[15px] font-bold text-slate-900">Streaming · newest first</h2>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"><Radio className="h-3 w-3 animate-pulse" /> Live</span>
              </div>
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[480px] pr-1">
                {FEED.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="rounded-lg border border-slate-100 p-2 flex items-start gap-2 hover:bg-slate-50">
                    <span className={cn("h-2 w-2 rounded-full shrink-0 mt-1.5", f.tone)} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-slate-500 tabular-nums">{f.t}</div>
                      <div className="text-[11px] text-slate-800 leading-snug">{f.ev}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== UNAUTHORIZED + SUSPICIOUS ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/70 to-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Unauthorized Issuance</div>
                  <h2 className="text-[15px] font-bold text-slate-900">Critical · digital coworkers on point</h2>
                </div>
                <Siren className="h-5 w-5 text-rose-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                {UNAUTH.map((u) => (
                  <button key={u.id} onClick={() => setPanel({ kind: "unauth", u })}
                    className="w-full text-left rounded-xl border border-rose-200 bg-white p-3 hover:shadow-md transition">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[13px] font-bold text-slate-900 truncate">{u.cn}</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">Risk {u.risk}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">{u.reason}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>Issuer: <span className="font-semibold">{u.issuer}</span> · {u.found}</span>
                      <span className="text-slate-400">{u.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 to-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Suspicious Issuance</div>
                  <h2 className="text-[15px] font-bold text-slate-900">Anomalies under digital investigation</h2>
                </div>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="space-y-2">
                {SUSPICIOUS.map((s) => (
                  <button key={s.id} onClick={() => setPanel({ kind: "susp", s })}
                    className="w-full text-left rounded-xl border border-amber-200 bg-white p-3 hover:shadow-md transition">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[13px] font-bold text-slate-900 truncate">{s.cn}</div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">Risk {s.risk}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">{s.reason}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>Issuer: <span className="font-semibold">{s.issuer}</span> · {s.found}</span>
                      <span className="text-slate-400">{s.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ===== TRUST GRAPH + HEAT MAP ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Certificate Trust Graph</div>
                  <h2 className="text-[15px] font-bold text-slate-900">company.com → CAs · services · investigations</h2>
                </div>
                <button onClick={() => setPanel({ kind: "graph" })} className="text-[11px] font-semibold text-blue-700 inline-flex items-center gap-1">Open graph <ChevronRight className="h-3 w-3" /></button>
              </div>
              <div className="relative aspect-[16/9] rounded-xl bg-gradient-to-br from-slate-50 to-rose-50/30 border border-slate-100 overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                  {TG_EDGES.map(([a, b, t], i) => {
                    const na = TG_NODES.find(n => n.id === a)!;
                    const nb = TG_NODES.find(n => n.id === b)!;
                    return <motion.line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                      stroke={EDGE_TONE[t]} strokeWidth={t === "bad" ? 0.5 : 0.3} strokeDasharray={t === "bad" ? "1 1" : "0"}
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: i * 0.05 }} />;
                  })}
                  {TG_NODES.map((n, i) => (
                    <g key={n.id}>
                      <motion.circle cx={n.x} cy={n.y} r={n.r / 6} className={n.fill}
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.05, type: "spring", stiffness: 180 }} />
                      <text x={n.x} y={n.y + n.r / 6 + 3} textAnchor="middle" className="fill-slate-700" style={{ fontSize: 2.2, fontWeight: 700 }}>{n.label}</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-600" />Enterprise</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Trusted CA</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Watchlist</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Unauthorized</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />Business Service</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-500" />Investigation</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Domain Exposure Heat Map</div>
              <h2 className="text-[15px] font-bold text-slate-900 mb-3">Domains × regions · risk-weighted</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead><tr><th></th>{HM_REGIONS.map(r => <th key={r} className="font-semibold text-slate-500 px-1 py-1 text-center">{r}</th>)}</tr></thead>
                  <tbody>
                    {HM_DOMAINS.map((d) => (
                      <tr key={d}>
                        <td className="font-semibold text-slate-700 pr-2 py-0.5 truncate max-w-[90px]">{d}</td>
                        {HM_REGIONS.map((r) => {
                          const v = hmCell(d, r);
                          return <td key={r} className="p-0.5"><div className={cn("h-6 rounded text-center text-[10px] font-bold tabular-nums grid place-items-center", hmTone(v))}>{v}</div></td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[9px] text-slate-500">
                <span className="inline-block h-2 w-3 rounded bg-emerald-400" /><span>Safe</span>
                <span className="inline-block h-2 w-3 rounded bg-amber-400 ml-1" /><span>Watch</span>
                <span className="inline-block h-2 w-3 rounded bg-orange-500 ml-1" /><span>High</span>
                <span className="inline-block h-2 w-3 rounded bg-rose-600 ml-1" /><span>Critical</span>
              </div>
            </div>
          </section>

          {/* ===== DIGITAL THREAT WORKFORCE ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Digital Threat Investigation Workforce</div>
                <h2 className="text-[15px] font-bold text-slate-900">Coworkers running CT investigations right now</h2>
              </div>
              <span className="text-[10px] text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full font-bold uppercase">4 active</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COWORKERS.map((c) => (
                <motion.div key={c.name} whileHover={{ y: -2 }} className="rounded-xl border border-slate-200 p-3.5 hover:shadow-md transition">
                  <div className="flex items-start gap-2">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center text-white shrink-0"><Bot className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-slate-900 truncate">{c.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">Now: <span className="text-slate-700 font-semibold">{c.current}</span></div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Conf</div>
                      <div className="text-[14px] font-bold tabular-nums text-emerald-700">{c.conf}%</div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                    <div className="rounded bg-slate-50 p-1.5"><div className="text-slate-500 uppercase font-bold">Evidence</div><div className="font-bold tabular-nums">{c.evid}</div></div>
                    <div className="rounded bg-slate-50 p-1.5"><div className="text-slate-500 uppercase font-bold">Action</div><div className="font-semibold truncate">{c.action}</div></div>
                    <div className="rounded bg-slate-50 p-1.5"><div className="text-slate-500 uppercase font-bold">Escalate</div><div className="font-semibold truncate">{c.escalate}</div></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ===== ISSUER ANALYTICS + THREAT CORRELATION ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Certificate Issuer Analytics</div>
                  <h2 className="text-[15px] font-bold text-slate-900">Volume · trust rating · risk per issuer</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead><tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 font-semibold">Issuer</th>
                    <th className="py-2 font-semibold text-right">Volume</th>
                    <th className="py-2 font-semibold">Trust</th>
                    <th className="py-2 font-semibold text-right">Rating</th>
                    <th className="py-2 font-semibold">Risk</th>
                    <th className="py-2 font-semibold">Recent</th>
                    <th className="py-2 font-semibold">Business Impact</th>
                  </tr></thead>
                  <tbody>
                    {ISSUERS.map((i) => (
                      <tr key={i.name} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setPanel({ kind: "issuer", i })}>
                        <td className="py-2 font-bold text-slate-900 inline-flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-slate-500" />{i.name}</td>
                        <td className="py-2 text-right tabular-nums">{i.vol.toLocaleString()}</td>
                        <td className="py-2"><span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", TRUST_TONE[i.trust])}>{i.trust}</span></td>
                        <td className="py-2 text-right tabular-nums font-semibold">{i.rating}</td>
                        <td className="py-2"><span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", RISK_TONE[i.risk])}>{i.risk}</span></td>
                        <td className="py-2 text-slate-500 text-[11px]">{i.act}</td>
                        <td className="py-2 text-slate-600 text-[11px]">{i.impact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Threat Intelligence Correlation</div>
              <h2 className="text-[15px] font-bold text-slate-900 mb-3">CrowdStrike · Sentinel · Splunk · Defender · Wiz</h2>
              <div className="space-y-2">
                {CORR.map((c, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] font-bold text-slate-900">{c.src}</div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border", SEV_TONE[c.sev])}>{c.sev}</span>
                        <span className="text-[10px] text-slate-500">{c.time}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{c.ev}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== TRUST INTEGRITY + INVESTIGATION TIMELINE ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Trust Integrity Dashboard</div>
              <h2 className="text-[15px] font-bold text-slate-900 mb-3">Health of the certificate trust ecosystem</h2>
              <div className="space-y-2.5">
                {TRUST_BANDS.map((b) => (
                  <div key={b.label}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">{b.label}</span>
                      <span className="font-bold tabular-nums">{b.v.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(1.5, (b.v / b.total) * 100)}%` }}
                        transition={{ duration: 1 }} className={cn("h-full rounded-full", b.color)} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4">
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Trust Integrity Score</div>
                <div className="mt-1 text-[28px] font-bold tabular-nums">97.1 <span className="text-[14px] font-semibold opacity-80">/ 100</span></div>
                <div className="text-[11px] opacity-90 mt-0.5">+8.7 vs last year</div>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Investigation Timeline · INV-2241</div>
                  <h2 className="text-[15px] font-bold text-slate-900">shadow-r-d.company.io · forensic chain</h2>
                </div>
                <button onClick={() => setPanel({ kind: "inv" })} className="text-[11px] font-semibold text-blue-700 inline-flex items-center gap-1">Open workspace <ChevronRight className="h-3 w-3" /></button>
              </div>
              <ol className="relative border-l-2 border-slate-200 ml-2 space-y-3">
                {INV.map((s, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="ml-4 pl-3">
                    <span className={cn("absolute -left-[7px] h-3 w-3 rounded-full ring-2 ring-white", s.tone)} />
                    <div className="flex items-center justify-between">
                      <div className="text-[12px] font-bold text-slate-900">{s.step}</div>
                      <div className="text-[10px] text-slate-500 tabular-nums">{s.when}</div>
                    </div>
                    <div className="text-[11px] text-slate-600">{s.what}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{s.who}</div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </section>

          {/* ===== AUTOMATIONS ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Automation Layer</div>
            <h2 className="text-[15px] font-bold text-slate-900 mb-3">CT monitoring automations · always on</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {AUTOMATIONS.map((a) => (
                <div key={a.name} className="rounded-xl border border-slate-200 p-3 hover:shadow-md transition">
                  <div className="text-[12px] font-bold text-slate-900 truncate">{a.name}</div>
                  <div className="text-[10px] text-slate-500">{a.last}</div>
                  <div className="mt-2 space-y-1 text-[11px]">
                    <div className="flex justify-between"><span className="text-slate-500">Runs</span><span className="font-bold tabular-nums">{a.runs.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Success</span><span className="font-bold tabular-nums text-emerald-700">{a.success}%</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Hrs saved</span><span className="font-bold tabular-nums">{a.saved.toLocaleString()}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== ANALYTICS ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Executive Analytics</div>
            <h2 className="text-[15px] font-bold text-slate-900 mb-3">CT, trust, and investigation trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { title: "New Certificate Issuance",   data: T_ISSUE, c1: "#2563eb", c2: "#3b82f6" },
                { title: "Unauthorized Trend",         data: T_UNAUTH,c1: "#e11d48", c2: "#fb7185" },
                { title: "Domain Exposure (count)",    data: T_EXP,   c1: "#0891b2", c2: "#06b6d4" },
                { title: "Trust Integrity Score",      data: T_TRUST, c1: "#059669", c2: "#10b981" },
                { title: "Investigations Completed",   data: T_INV,   c1: "#7c3aed", c2: "#7c3aed" },
                { title: "Threat Correlations",        data: T_CORR,  c1: "#d97706", c2: "#f59e0b" },
                { title: "Coworker Security Activity", data: T_CWORK, c1: "#4f46e5", c2: "#6366f1" },
                { title: "Avg Detection (min)",        data: [{m:"Jan",v:142},{m:"Feb",v:88},{m:"Mar",v:42},{m:"Apr",v:22},{m:"May",v:12},{m:"Jun",v:6},{m:"Jul",v:3}], c1: "#dc2626", c2: "#ef4444" },
              ].map((t) => (
                <div key={t.title} className="rounded-xl border border-slate-200 p-3">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t.title}</div>
                  <div className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={t.data}>
                        <defs>
                          <linearGradient id={`g-${t.title}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={t.c2} stopOpacity={0.5} />
                            <stop offset="100%" stopColor={t.c2} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke={t.c1} fill={`url(#g-${t.title})`} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== EXECUTIVE OUTCOMES ===== */}
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-600 via-orange-600 to-amber-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">Executive Outcomes</div>
                <h2 className="text-[16px] font-bold">Before vs after Neurealm RunOps</h2>
              </div>
              <Award className="h-6 w-6 text-white/80" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { l: "Unauthorized Certs Detected",     v: "2",     b: "18 (Y-1)" },
                { l: "Suspicious Issuances Investigated", v: "11",  b: "auto-triaged" },
                { l: "Trust Integrity Score",            v: "97.1", b: "88.4" },
                { l: "Domains Protected",                v: "1,842",b: "412" },
                { l: "Business Services Protected",      v: "500",  b: "180" },
                { l: "Revenue Protected",                v: "$1.2B",b: "$420M" },
                { l: "Avg Detection Time",               v: "3 min",b: "2.3h" },
                { l: "Digital Investigations Completed", v: "4,200",b: "412" },
              ].map((o) => (
                <div key={o.l} className="rounded-xl bg-white/10 border border-white/20 p-3 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-wider text-white/70 font-bold">{o.l}</div>
                  <div className="text-[20px] font-bold mt-0.5">{o.v}</div>
                  <div className="text-[10px] text-white/70">Before: {o.b}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="text-center text-[11px] text-slate-400 py-4">Neurealm RunOps · Certificate Transparency Monitoring Center · The public internet, continuously watched.</div>
        </div>
      </div>

      {/* ===== PANEL ===== */}
      <Sheet open={open} onOpenChange={(o) => !o && setPanel(null)}>
        <SheetContent side="right" className="w-[40vw] sm:max-w-[40vw] overflow-y-auto">
          <AnimatePresence mode="wait">
            {panel && (
              <motion.div key={JSON.stringify(panel).slice(0, 40)} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                <SheetHeader className="mb-3">
                  <SheetTitle className="text-[16px] font-bold text-slate-900">
                    {panel.kind === "cat" && panel.c.label}
                    {panel.kind === "domain" && panel.d.name}
                    {panel.kind === "unauth" && `${panel.u.id} · ${panel.u.cn}`}
                    {panel.kind === "susp" && `${panel.s.id} · ${panel.s.cn}`}
                    {panel.kind === "issuer" && `Issuer · ${panel.i.name}`}
                    {panel.kind === "inv" && "Investigation INV-2241 · shadow-r-d.company.io"}
                    {panel.kind === "graph" && "Trust Graph · company.com"}
                  </SheetTitle>
                </SheetHeader>

                {panel.kind === "cat" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Summary</div><div className="text-slate-700 mt-1">{panel.c.desc}</div></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Count</div><div className="text-[16px] font-bold tabular-nums">{panel.c.count.toLocaleString()}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Trend</div><div className="text-[16px] font-bold">{panel.c.trend}</div></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Risk Tier</div><div className="mt-1"><span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", RISK_TONE[panel.c.risk])}>{panel.c.risk}</span></div></div>
                  </div>
                )}

                {panel.kind === "domain" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", TRUST_TONE[panel.d.trust])}>{panel.d.trust}</span>
                      <span className="text-[10px] text-slate-500">Risk score {panel.d.risk}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Certs</div><div className="text-[16px] font-bold tabular-nums">{panel.d.certs}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Recent</div><div className="text-[14px] font-bold">{panel.d.act}</div></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Issuers</div><div className="text-slate-700 mt-1">{panel.d.issuers}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Business Impact</div><div className="text-slate-700 mt-1">{panel.d.impact}</div></div>
                  </div>
                )}

                {panel.kind === "unauth" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">Risk {panel.u.risk}</span><span className="font-mono text-[11px] text-slate-500">{panel.u.id}</span></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Certificate</div><div className="text-slate-700 mt-1 font-mono text-[11px]">{panel.u.cn}</div></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Issuer</div><div className="font-bold">{panel.u.issuer}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Found</div><div className="font-bold">{panel.u.found}</div></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Risk Analysis</div><div className="text-slate-700 mt-1">{panel.u.reason}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Business Impact</div><div className="text-slate-700 mt-1">{panel.u.impact}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Recommended Actions</div><div className="text-slate-700 mt-1">{panel.u.action}</div></div>
                    <button className="w-full h-8 text-[12px] font-semibold rounded-lg bg-rose-600 text-white inline-flex items-center justify-center gap-1.5"><Siren className="h-3.5 w-3.5" /> Open Investigation</button>
                  </div>
                )}

                {panel.kind === "susp" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">Risk {panel.s.risk}</span><span className="font-mono text-[11px] text-slate-500">{panel.s.id}</span></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Certificate</div><div className="text-slate-700 mt-1 font-mono text-[11px]">{panel.s.cn}</div></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Issuer</div><div className="font-bold">{panel.s.issuer}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Found</div><div className="font-bold">{panel.s.found}</div></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Reason</div><div className="text-slate-700 mt-1">{panel.s.reason}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Business Impact</div><div className="text-slate-700 mt-1">{panel.s.impact}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Recommended Actions</div><div className="text-slate-700 mt-1">{panel.s.action}</div></div>
                  </div>
                )}

                {panel.kind === "issuer" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", TRUST_TONE[panel.i.trust])}>{panel.i.trust}</span>
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", RISK_TONE[panel.i.risk])}>{panel.i.risk}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Volume</div><div className="text-[16px] font-bold tabular-nums">{panel.i.vol.toLocaleString()}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Rating</div><div className="text-[16px] font-bold tabular-nums">{panel.i.rating}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Recent</div><div className="text-[14px] font-bold">{panel.i.act}</div></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Business Impact</div><div className="text-slate-700 mt-1">{panel.i.impact}</div></div>
                  </div>
                )}

                {panel.kind === "inv" && (
                  <div className="space-y-2 text-[12px]">
                    {INV.map((s, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-900">{s.step}</div>
                          <div className="text-[10px] text-slate-500 tabular-nums">{s.when}</div>
                        </div>
                        <div className="text-slate-700 text-[11px] mt-0.5">{s.what}</div>
                        <div className="text-[10px] text-slate-400">{s.who}</div>
                      </div>
                    ))}
                    <button className="w-full h-8 text-[12px] font-semibold rounded-lg bg-rose-600 text-white inline-flex items-center justify-center gap-1.5"><Download className="h-3.5 w-3.5" /> Export forensic package</button>
                  </div>
                )}

                {panel.kind === "graph" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Trust Relationships</div><div className="text-slate-700 mt-1">3 trusted CAs · 1 watchlist · 1 unauthorized · 3 business services · 1 active investigation.</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Certificate Chains</div><div className="text-slate-700 mt-1">42,000 certificate chains validated continuously · 99.6% pass trust validation.</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Recommendations</div><div className="text-slate-700 mt-1">Reduce wildcard scope · revoke shadow-r-d.company.io · add Let's Encrypt to CT block-list.</div></div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </div>
  );
}
