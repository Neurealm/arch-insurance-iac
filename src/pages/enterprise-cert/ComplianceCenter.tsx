import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Bell, BookCheck, Bot, Briefcase, Building2, Cog, FileSearch, FileText,
  GitBranch, Globe, HelpCircle, KeyRound, LayoutDashboard, Package, Plug, RefreshCw,
  ScrollText, Scale, Search, ServerCog, ShieldAlert, ShieldCheck, UserCog, Sparkles,
  ChevronRight, AlertTriangle, CheckCircle2, DollarSign, Eye, FileBadge, Zap,
  TrendingUp, Users, Gavel, ClipboardCheck, Download, Archive, FileCheck2, Award,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
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
    { id: "com", label: "Compliance Center", icon: BookCheck, to: "/enterprise-certificate-management/compliance-center", active: true },
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
      <div className="m-3 p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Audit Readiness</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">99.2%</span>
          <span className="text-xs opacity-80">Ready</span>
        </div>
        <div className="text-xs opacity-90">6 frameworks · 249K records</div>
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
          <h1 className="text-[18px] font-bold text-slate-900 truncate">Enterprise Compliance Center</h1>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Continuously Audit-Ready
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input placeholder="Search controls, policies, evidence" className="pl-8 pr-3 h-8 w-72 text-[12px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 outline-none" />
        </div>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> Generate Audit Package</button>
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

// ============== DOMAINS ==============
type Domain = { id: string; label: string; icon: any; color: string; score: number; trend: string; violations: number; risk: string; coworkers: string[]; desc: string; };
const DOMAINS: Domain[] = [
  { id: "policy",  label: "Policy Compliance",   icon: Scale,         color: "from-blue-500 to-indigo-600",   score: 99.1, trend: "+0.4", violations: 153, risk: "Low",    coworkers: ["PKI Compliance Auditor"], desc: "Policy adherence across the certificate ecosystem." },
  { id: "control", label: "Control Validation",  icon: ClipboardCheck,color: "from-emerald-500 to-teal-600",  score: 99.1, trend: "+0.6", violations: 12,  risk: "Low",    coworkers: ["PKI Compliance Auditor","Cert Risk Analyst"], desc: "Continuous validation of certificate-related controls." },
  { id: "audit",   label: "Audit Readiness",     icon: FileBadge,     color: "from-violet-500 to-purple-600", score: 99.2, trend: "+0.8", violations: 4,   risk: "Low",    coworkers: ["PKI Compliance Auditor"], desc: "Always-on audit posture across 6 frameworks." },
  { id: "evid",    label: "Evidence Collection", icon: FileCheck2,    color: "from-cyan-500 to-blue-600",     score: 98.8, trend: "+1.2", violations: 0,   risk: "Low",    coworkers: ["Cert Discovery Engineer","Renewal Coordinator"], desc: "Automated evidence generation, retention, indexing." },
  { id: "reg",     label: "Regulatory Alignment",icon: Gavel,         color: "from-amber-500 to-orange-600",  score: 98.4, trend: "+0.3", violations: 9,   risk: "Medium", coworkers: ["PKI Compliance Auditor"], desc: "PCI · SOC2 · NIST · ISO27001 · HIPAA · GDPR." },
  { id: "exc",     label: "Exception Management",icon: AlertTriangle, color: "from-rose-500 to-red-600",      score: 96.4, trend: "+0.2", violations: 27,  risk: "Medium", coworkers: ["Sec Investigation Analyst"], desc: "Risk acceptance, compensating controls, expiry." },
];

// ============== FRAMEWORKS ==============
type Framework = { f: string; score: number; pass: number; fail: number; evid: number; ready: number; findings: number; trend: string; color: string; tag: string; };
const FRAMEWORKS: Framework[] = [
  { f: "PCI-DSS",   score: 99.7, pass: 412, fail: 2, evid: 99, ready: 99.6, findings: 1, trend: "+0.3", color: "from-rose-500 to-red-600",      tag: "Payments" },
  { f: "SOC 2",     score: 99.4, pass: 318, fail: 3, evid: 98, ready: 99.1, findings: 1, trend: "+0.5", color: "from-blue-500 to-indigo-600",   tag: "Trust Services" },
  { f: "NIST 800-53", score: 98.6, pass: 942, fail: 14, evid: 97, ready: 98.4, findings: 1, trend: "+0.6", color: "from-violet-500 to-purple-600", tag: "Federal" },
  { f: "ISO 27001", score: 99.1, pass: 112, fail: 2, evid: 99, ready: 99.2, findings: 1, trend: "+0.2", color: "from-emerald-500 to-teal-600",  tag: "ISMS" },
  { f: "HIPAA",     score: 99.8, pass: 84,  fail: 0, evid: 100,ready: 99.9, findings: 0, trend: "+0.1", color: "from-cyan-500 to-blue-600",     tag: "Healthcare" },
  { f: "GDPR",      score: 99.2, pass: 62,  fail: 1, evid: 98, ready: 99.0, findings: 0, trend: "+0.4", color: "from-amber-500 to-orange-600",  tag: "EU Privacy" },
];

// ============== CONTROL MATRIX ==============
const FAMILIES = ["Certificate Lifecycle","Key Management","Certificate Issuance","Renewal","Revocation","Ownership","Change Management","Monitoring","Incident Response","Audit Logging"];
const STATES = ["Compliant","Warning","Non-Compliant","N/A"] as const;
function cellVal(fam: string, st: string) {
  const seed = (fam.charCodeAt(0) + st.charCodeAt(0)) % 7;
  if (st === "Compliant") return [142, 118, 96, 88, 124, 110, 102, 156, 128, 114][FAMILIES.indexOf(fam)] || 100;
  if (st === "Warning") return [4, 3, 2, 6, 5, 4, 8, 3, 2, 5][FAMILIES.indexOf(fam)] || 4;
  if (st === "Non-Compliant") return [0, 1, 0, 2, 0, 1, 0, 0, 1, 0][FAMILIES.indexOf(fam)] || 0;
  return [2, 0, 1, 0, 3, 0, 1, 2, 0, 4][FAMILIES.indexOf(fam)] || 0;
}
const STATE_TONE: any = {
  "Compliant": "bg-emerald-500 text-white",
  "Warning": "bg-amber-400 text-amber-900",
  "Non-Compliant": "bg-rose-500 text-white",
  "N/A": "bg-slate-200 text-slate-600",
};

// ============== EVIDENCE ==============
const EVIDENCE = [
  { id: "inv",   name: "Certificate Inventory",   gen: 248320, miss: 12, req: 4,  arch: 1.4 },
  { id: "appr",  name: "Approval Records",        gen: 14820,  miss: 0,  req: 2,  arch: 980 },
  { id: "chg",   name: "Change Records",          gen: 8420,   miss: 1,  req: 0,  arch: 612 },
  { id: "val",   name: "Validation Results",      gen: 62100,  miss: 0,  req: 0,  arch: 24.8 },
  { id: "trail", name: "Audit Trails",            gen: 188400, miss: 0,  req: 0,  arch: 88.2 },
  { id: "own",   name: "Ownership Records",       gen: 4240,   miss: 4,  req: 6,  arch: 312 },
  { id: "rpt",   name: "Compliance Reports",      gen: 2840,   miss: 0,  req: 1,  arch: 1.2 },
  { id: "cw",    name: "Digital Coworker Logs",   gen: 249000, miss: 0,  req: 0,  arch: 96.4 },
];

// ============== POLICIES ==============
const POLICIES = [
  { name: "Certificate Expiration", comp: 99.4, viol: 18, exc: 4, risk: "Low",    impact: "Service availability" },
  { name: "Ownership",              comp: 98.2, viol: 42, exc: 8, risk: "Medium", impact: "Accountability" },
  { name: "Key Length",             comp: 99.1, viol: 14, exc: 2, risk: "Low",    impact: "Cryptographic strength" },
  { name: "Algorithm",              comp: 98.9, viol: 17, exc: 3, risk: "Medium", impact: "Quantum & SHA-1 exposure" },
  { name: "CA Allow-list",          comp: 99.8, viol: 2,  exc: 0, risk: "Low",    impact: "Issuance governance" },
  { name: "Renewal Window",         comp: 99.6, viol: 6,  exc: 1, risk: "Low",    impact: "Lifecycle continuity" },
  { name: "Revocation",             comp: 99.9, viol: 1,  exc: 0, risk: "Low",    impact: "Trust integrity" },
];
const RISK_TONE: any = { Critical: "bg-rose-100 text-rose-700 border-rose-200", High: "bg-orange-100 text-orange-700 border-orange-200", Medium: "bg-amber-100 text-amber-700 border-amber-200", Low: "bg-emerald-100 text-emerald-700 border-emerald-200" };

// ============== EXCEPTIONS ==============
const EXCEPTIONS = [
  { id: "EX-0421", svc: "Mfg MES (EU)",        risk: "High",   owner: "Plant Ops EU",   expires: "Aug 14", impact: "ISO 27001 · A.10",  comp: "Network isolation" },
  { id: "EX-0418", svc: "Legacy EDI",          risk: "Medium", owner: "Claims Plat",    expires: "Sep 02", impact: "HIPAA · §164.312", comp: "WAF + audit log" },
  { id: "EX-0414", svc: "Vendor Portal X",     risk: "Medium", owner: "Supplier Ops",   expires: "Jul 28", impact: "SOC 2 · CC6.1",    comp: "MFA + IP allow-list" },
  { id: "EX-0411", svc: "R&D Sandbox",         risk: "Low",    owner: "R&D Plat",       expires: "Dec 01", impact: "NIST · SC-12",     comp: "Isolated subnet" },
  { id: "EX-0408", svc: "Marketing Microsite", risk: "Low",    owner: "Marketing",      expires: "Jul 04", impact: "GDPR · Art. 32",   comp: "CDN edge cert" },
];

// ============== HEAT MAP ==============
const REGIONS = ["NA","EU","UK","APAC","LATAM","ME"];
const SERVICES = ["Payments","Customer Portal","Mobile","API Edge","Healthcare","Manufacturing","Trading","Back-Office"];
function complianceCell(r: string, s: string) {
  const seed = (r.charCodeAt(0) * 3 + s.charCodeAt(1)) % 6;
  return 96 + seed * 0.7;
}
function complianceTone(v: number) {
  if (v >= 99.5) return "bg-emerald-500 text-white";
  if (v >= 99) return "bg-emerald-300 text-emerald-900";
  if (v >= 98) return "bg-lime-300 text-lime-900";
  if (v >= 97) return "bg-amber-300 text-amber-900";
  return "bg-orange-400 text-white";
}

// ============== COWORKERS ==============
const COWORKERS = [
  { name: "PKI Compliance Auditor",    role: "Controls & evidence",     evid: 188400, ctrl: 1240, find: 142, hours: 12480, conf: 99, status: "Refreshing PCI audit package" },
  { name: "Certificate Risk Analyst",  role: "Risk scoring & exposure", evid: 24800,  ctrl: 412,  find: 318, hours: 6420,  conf: 97, status: "Scoring 1.4K new findings" },
  { name: "Cert Discovery Engineer",   role: "Inventory & ownership",   evid: 14200,  ctrl: 188,  find: 88,  hours: 4280,  conf: 98, status: "Resolving 22 unknown owners" },
  { name: "Renewal Coordinator",       role: "Lifecycle adherence",     evid: 12800,  ctrl: 96,   find: 14,  hours: 9620,  conf: 99, status: "Validating renewal evidence" },
  { name: "Security Investigation Analyst", role: "Exception triage",   evid: 8800,   ctrl: 62,   find: 27,  hours: 5200,  conf: 96, status: "Reviewing 3 risk acceptances" },
];

// ============== TIMELINE ==============
const TIMELINE = [
  { t: "09:42", k: "audit",    ev: "PCI-DSS evidence package regenerated · 412 controls" },
  { t: "09:32", k: "control",  ev: "Control SC-12 validated · NIST 800-53 · auto-pass" },
  { t: "09:18", k: "policy",   ev: "Policy violation: ownership missing on 4 certs" },
  { t: "08:58", k: "evidence", ev: "Evidence collected · 1,420 approval records" },
  { t: "08:46", k: "review",   ev: "Quarterly SOC 2 review opened · auto-prefilled" },
  { t: "08:12", k: "exception",ev: "Exception EX-0421 approved · compensating control bound" },
  { t: "07:58", k: "fail",     ev: "Control CC6.6 — minor warning · auto-remediation queued" },
  { t: "07:32", k: "policy",   ev: "Policy update: key length minimum raised to RSA-3072" },
];
const TIMELINE_TONE: any = {
  audit: "bg-violet-500", control: "bg-emerald-500", policy: "bg-blue-500",
  evidence: "bg-cyan-500", review: "bg-amber-500", exception: "bg-orange-500", fail: "bg-rose-500",
};

// ============== TRENDS ==============
const T_COMPLIANCE = [{m:"Jan",v:96.4},{m:"Feb",v:97.1},{m:"Mar",v:97.6},{m:"Apr",v:98.1},{m:"May",v:98.4},{m:"Jun",v:98.6},{m:"Jul",v:98.7}];
const T_READY      = [{m:"Jan",v:94.2},{m:"Feb",v:95.8},{m:"Mar",v:96.6},{m:"Apr",v:97.4},{m:"May",v:98.2},{m:"Jun",v:98.8},{m:"Jul",v:99.2}];
const T_EVIDENCE   = [{m:"Jan",v:142},{m:"Feb",v:168},{m:"Mar",v:188},{m:"Apr",v:206},{m:"May",v:222},{m:"Jun",v:238},{m:"Jul",v:249}];
const T_CTRL       = [{m:"Jan",v:96.2},{m:"Feb",v:97.1},{m:"Mar",v:97.8},{m:"Apr",v:98.3},{m:"May",v:98.7},{m:"Jun",v:99.0},{m:"Jul",v:99.1}];
const T_EXC        = [{m:"Jan",v:58},{m:"Feb",v:52},{m:"Mar",v:46},{m:"Apr",v:41},{m:"May",v:36},{m:"Jun",v:31},{m:"Jul",v:27}];
const T_FIND       = [{m:"Jan",v:24},{m:"Feb",v:18},{m:"Mar",v:14},{m:"Apr",v:11},{m:"May",v:8},{m:"Jun",v:6},{m:"Jul",v:4}];

// ============== AUTOMATIONS ==============
const AUTOMATIONS = [
  { name: "Evidence Collection",     runs: 248320, success: 99.7, saved: 12480, last: "4s ago" },
  { name: "Control Validation",      runs: 62100,  success: 99.6, saved: 8420,  last: "18s ago" },
  { name: "Policy Monitoring",       runs: 188400, success: 99.9, saved: 4280,  last: "6s ago" },
  { name: "Exception Tracking",      runs: 4280,   success: 100,  saved: 612,   last: "1m ago" },
  { name: "Audit Package Generation",runs: 320,    success: 100,  saved: 6420,  last: "12m ago" },
  { name: "Compliance Reporting",    runs: 2840,   success: 99.8, saved: 5680,  last: "2m ago" },
  { name: "Control Testing",         runs: 24800,  success: 99.4, saved: 3120,  last: "22s ago" },
];

// ============== AUDIT PACKAGES ==============
const PACKAGES = [
  { name: "PCI-DSS Audit Package",     date: "Today 09:42",   evid: 41240, ctrl: 412, ready: 99.6, color: "from-rose-500 to-red-600" },
  { name: "SOC 2 Evidence Package",    date: "Today 08:18",   evid: 38120, ctrl: 318, ready: 99.1, color: "from-blue-500 to-indigo-600" },
  { name: "NIST 800-53 Assessment",    date: "Yesterday",     evid: 84200, ctrl: 942, ready: 98.4, color: "from-violet-500 to-purple-600" },
  { name: "ISO 27001 Evidence Pack",   date: "Yesterday",     evid: 14820, ctrl: 112, ready: 99.2, color: "from-emerald-500 to-teal-600" },
  { name: "HIPAA Evidence Pack",       date: "2 days ago",    evid: 9420,  ctrl: 84,  ready: 99.9, color: "from-cyan-500 to-blue-600" },
  { name: "GDPR Evidence Pack",        date: "3 days ago",    evid: 6280,  ctrl: 62,  ready: 99.0, color: "from-amber-500 to-orange-600" },
];

// ============== PANEL TYPES ==============
type Panel =
  | { kind: "domain"; d: Domain }
  | { kind: "framework"; f: Framework }
  | { kind: "policy"; p: typeof POLICIES[number] }
  | { kind: "exception"; e: typeof EXCEPTIONS[number] }
  | null;

// ============== PAGE ==============
export default function ComplianceCenter() {
  const [panel, setPanel] = useState<Panel>(null);
  const open = !!panel;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Header />
        <div className="p-6 space-y-6">

          {/* ===== EXECUTIVE KPI LAYER ===== */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Executive KPI Layer</div>
                <h2 className="text-[15px] font-bold text-slate-900">Continuous compliance — always audit-ready</h2>
              </div>
              <span className="text-[11px] text-slate-500">Updated 4 seconds ago</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <KpiCard icon={BookCheck}    label="Compliance Score"        value={98.7} suffix="%" decimals={1} accent="bg-gradient-to-r from-emerald-400 to-teal-600" trend="+2.3 vs last qtr" />
              <KpiCard icon={FileBadge}    label="Audit Readiness"         value={99.2} suffix="%" decimals={1} accent="bg-gradient-to-r from-violet-400 to-purple-600" trend="+5.0 vs last qtr" />
              <KpiCard icon={ClipboardCheck} label="Controls Monitored"    value={1240} accent="bg-gradient-to-r from-blue-400 to-indigo-600" trend="+148 new controls" />
              <KpiCard icon={FileCheck2}   label="Evidence Records"        value={249000} accent="bg-gradient-to-r from-cyan-400 to-blue-600" trend="+38K last 30d" />
              <KpiCard icon={Scale}        label="Policy Violations"       value={153}  accent="bg-gradient-to-r from-amber-400 to-orange-500" trend="−42 last 30d" />
              <KpiCard icon={AlertTriangle}label="Audit Findings"          value={4}    accent="bg-gradient-to-r from-orange-400 to-rose-500" trend="−6 vs last audit" />
              <KpiCard icon={Award}        label="Framework Coverage"      value={6}    accent="bg-gradient-to-r from-emerald-400 to-teal-500" trend="100% mapped" />
              <KpiCard icon={Bot}          label="Digital Coworker Actions" value={249000} accent="bg-gradient-to-r from-violet-400 to-fuchsia-500" trend="38K hrs saved" />
              <KpiCard icon={AlertTriangle}label="Open Exceptions"         value={27}   accent="bg-gradient-to-r from-rose-400 to-rose-600" trend="−31 last qtr" />
              <KpiCard icon={Zap}          label="Evidence Automation"     value={94}   suffix="%" accent="bg-gradient-to-r from-blue-400 to-violet-500" trend="+12% vs LY" />
            </div>
          </section>

          {/* ===== COMPLIANCE COMMAND CENTER ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Compliance Command Center</div>
                <h2 className="text-[15px] font-bold text-slate-900">Six governance domains · click to explore</h2>
              </div>
              <span className="text-[11px] text-slate-500 inline-flex items-center gap-1"><Bot className="h-3.5 w-3.5" /> Coworkers continuously validating</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {DOMAINS.map((d) => (
                <motion.button key={d.id} whileHover={{ y: -2 }} onClick={() => setPanel({ kind: "domain", d })}
                  className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:shadow-lg transition group">
                  <div className="flex items-start gap-3">
                    <div className={cn("h-10 w-10 rounded-lg grid place-items-center bg-gradient-to-br text-white", d.color)}>
                      <d.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-[14px] text-slate-900 truncate">{d.label}</div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{d.desc}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-slate-50 p-2"><div className="text-[9px] uppercase font-bold text-slate-500">Score</div><div className="text-[16px] font-bold tabular-nums">{d.score}%</div></div>
                    <div className="rounded-lg bg-slate-50 p-2"><div className="text-[9px] uppercase font-bold text-slate-500">Trend</div><div className="text-[16px] font-bold tabular-nums text-emerald-600">{d.trend}</div></div>
                    <div className="rounded-lg bg-slate-50 p-2"><div className="text-[9px] uppercase font-bold text-slate-500">Violations</div><div className="text-[16px] font-bold tabular-nums">{d.violations}</div></div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Risk: <span className={cn("ml-1 text-[10px] font-bold uppercase border rounded-full px-1.5 py-0.5", RISK_TONE[d.risk])}>{d.risk}</span></span>
                    <div className="flex flex-wrap gap-1">
                      {d.coworkers.slice(0, 2).map((c) => (
                        <span key={c} className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-1.5 py-0.5">
                          <Bot className="h-3 w-3" /> {c.split(" ")[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* ===== FRAMEWORK CARDS ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Framework Compliance Dashboard</div>
                <h2 className="text-[15px] font-bold text-slate-900">Regulatory frameworks · continuous coverage</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {FRAMEWORKS.map((f, i) => (
                <motion.button key={f.f} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3 }} onClick={() => setPanel({ kind: "framework", f })}
                  className="text-left rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
                  <div className={cn("h-1.5 bg-gradient-to-r", f.color)} />
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[15px] font-bold text-slate-900">{f.f}</div>
                        <div className="text-[10.5px] text-slate-500">{f.tag}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[20px] font-bold text-slate-900 tabular-nums">{f.score}%</div>
                        <div className="text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5" />{f.trend}</div>
                      </div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${f.score}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.05 }}
                        className={cn("h-full bg-gradient-to-r", f.color)} />
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
                      <div className="rounded bg-emerald-50 py-1"><div className="text-[9px] uppercase font-bold text-emerald-700">Pass</div><div className="text-[11.5px] font-bold tabular-nums text-emerald-700">{f.pass}</div></div>
                      <div className="rounded bg-rose-50 py-1"><div className="text-[9px] uppercase font-bold text-rose-700">Fail</div><div className="text-[11.5px] font-bold tabular-nums text-rose-700">{f.fail}</div></div>
                      <div className="rounded bg-blue-50 py-1"><div className="text-[9px] uppercase font-bold text-blue-700">Evid</div><div className="text-[11.5px] font-bold tabular-nums text-blue-700">{f.evid}%</div></div>
                      <div className="rounded bg-violet-50 py-1"><div className="text-[9px] uppercase font-bold text-violet-700">Ready</div><div className="text-[11.5px] font-bold tabular-nums text-violet-700">{f.ready}%</div></div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Open findings: <span className="font-bold text-slate-800">{f.findings}</span></span>
                      <span className="text-blue-700 font-semibold inline-flex items-center gap-1">Open package <ChevronRight className="h-3 w-3" /></span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* ===== CONTROL MATRIX + AUDIT READINESS RADIAL ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Control Validation Matrix</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Control families × validation state</h3>
                </div>
                <ClipboardCheck className="h-4 w-4 text-slate-400" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11.5px]">
                  <thead>
                    <tr className="text-[10px] uppercase text-slate-500">
                      <th className="text-left py-2 px-2">Control Family</th>
                      {STATES.map((s) => <th key={s} className="text-center py-2 px-2">{s}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {FAMILIES.map((fam) => (
                      <tr key={fam} className="border-t border-slate-100">
                        <td className="py-1.5 px-2 font-semibold text-slate-800">{fam}</td>
                        {STATES.map((st) => {
                          const v = cellVal(fam, st);
                          return (
                            <td key={st} className="px-1 py-1">
                              <div className={cn("rounded-md text-[11px] font-bold tabular-nums text-center py-1.5", STATE_TONE[st])}>{v}</div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                {STATES.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1">
                    <span className={cn("h-2 w-3 rounded-sm", STATE_TONE[s])} /> {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50/40 to-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Audit Readiness Dashboard</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Always-on audit posture</h3>
                </div>
                <FileBadge className="h-4 w-4 text-violet-500" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-32 w-32 shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="65%" outerRadius="100%" data={[{ name: "R", value: 99.2, fill: "url(#readyGrad)" }]} startAngle={90} endAngle={-270}>
                      <defs>
                        <linearGradient id="readyGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar background={{ fill: "#f1f5f9" }} dataKey="value" cornerRadius={20} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-[22px] font-bold text-violet-700 tabular-nums">99.2%</div>
                    <div className="text-[9px] uppercase font-bold text-slate-500">Audit Ready</div>
                  </div>
                </div>
                <div className="flex-1 space-y-1.5 text-[11.5px]">
                  {[
                    ["Evidence Completeness", "98.8%", "text-cyan-700"],
                    ["Control Validation",    "99.1%", "text-emerald-700"],
                    ["Missing Documentation", "4",     "text-amber-700"],
                    ["Open Findings",         "4",     "text-rose-700"],
                    ["Frameworks Ready",      "6 / 6", "text-violet-700"],
                  ].map(([k, v, c]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-slate-600">{k}</span>
                      <span className={cn("font-bold tabular-nums", c)}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {FRAMEWORKS.map((f) => (
                  <div key={f.f} className="rounded-lg border border-slate-200 bg-white p-1.5 text-center">
                    <div className="text-[9px] uppercase font-bold text-slate-500 truncate">{f.f}</div>
                    <div className="text-[11.5px] font-bold tabular-nums text-emerald-700">{f.ready}%</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== EVIDENCE GENERATION ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Evidence Generation Center</div>
                <h2 className="text-[15px] font-bold text-slate-900">Automated, indexed, retention-aware</h2>
              </div>
              <span className="text-[11px] text-slate-500">249,000 records · 96.4 GB archived</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {EVIDENCE.map((e) => (
                <div key={e.id} className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-cyan-50/30 p-3 hover:shadow transition">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-cyan-50 grid place-items-center text-cyan-600"><FileCheck2 className="h-4 w-4" /></div>
                    <div className="text-[12px] font-bold text-slate-800 truncate">{e.name}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10.5px]">
                    <div className="rounded bg-emerald-50 p-1.5"><div className="text-[9px] uppercase font-bold text-emerald-700">Generated</div><div className="text-[12px] font-bold tabular-nums text-emerald-700">{e.gen.toLocaleString()}</div></div>
                    <div className="rounded bg-amber-50 p-1.5"><div className="text-[9px] uppercase font-bold text-amber-700">Missing</div><div className="text-[12px] font-bold tabular-nums text-amber-700">{e.miss}</div></div>
                    <div className="rounded bg-blue-50 p-1.5"><div className="text-[9px] uppercase font-bold text-blue-700">Requested</div><div className="text-[12px] font-bold tabular-nums text-blue-700">{e.req}</div></div>
                    <div className="rounded bg-slate-50 p-1.5"><div className="text-[9px] uppercase font-bold text-slate-500">Archived</div><div className="text-[12px] font-bold tabular-nums text-slate-700">{e.arch}{e.arch < 100 ? "K" : "K"}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== POLICIES + EXCEPTIONS ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Policy Compliance Center</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Active policies · enforcement state</h3>
                </div>
                <Scale className="h-4 w-4 text-slate-400" />
              </div>
              <div className="space-y-1.5">
                {POLICIES.map((p) => (
                  <button key={p.name} onClick={() => setPanel({ kind: "policy", p })}
                    className="w-full text-left rounded-lg border border-slate-200 hover:bg-slate-50 p-2.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-[12.5px] text-slate-800">{p.name}</div>
                        <span className={cn("text-[10px] font-bold uppercase border rounded-full px-1.5 py-0.5", RISK_TONE[p.risk])}>{p.risk}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${p.comp}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 tabular-nums w-12 text-right">{p.comp}%</span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 mt-1">{p.viol} violations · {p.exc} exceptions · {p.impact}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Exception Management Workspace</div>
                  <h3 className="text-[14px] font-bold text-slate-900">27 open · risk-accepted &amp; compensated</h3>
                </div>
                <AlertTriangle className="h-4 w-4 text-slate-400" />
              </div>
              <div className="space-y-2">
                {EXCEPTIONS.map((e) => (
                  <motion.button key={e.id} whileHover={{ x: 2 }} onClick={() => setPanel({ kind: "exception", e })}
                    className="w-full text-left rounded-lg border border-slate-200 hover:border-amber-300 hover:shadow-sm bg-white p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-50 grid place-items-center text-amber-600 shrink-0 text-[10px] font-bold">{e.id.slice(-3)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-[12.5px] text-slate-800 truncate">{e.svc}</div>
                          <span className={cn("text-[10px] font-bold uppercase border rounded-full px-1.5 py-0.5", RISK_TONE[e.risk])}>{e.risk}</span>
                        </div>
                        <div className="text-[10.5px] text-slate-500">Owner {e.owner} · Expires {e.expires}</div>
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10.5px]">
                      <span className="text-slate-600"><span className="font-semibold">Framework:</span> {e.impact}</span>
                      <span className="text-emerald-700 font-semibold">⊕ {e.comp}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          {/* ===== HEAT MAP + COWORKERS ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Compliance Heat Map</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Region × business service · compliance %</h3>
                </div>
                <span className="text-[11px] text-slate-500">Hover to inspect</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-1">
                  <thead>
                    <tr>
                      <th className="text-[10px] text-slate-500 font-semibold uppercase text-left w-32"></th>
                      {SERVICES.map((s) => <th key={s} className="text-[10px] text-slate-500 font-semibold uppercase text-center px-1">{s}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {REGIONS.map((r) => (
                      <tr key={r}>
                        <td className="text-[11px] font-bold text-slate-700 pr-2">{r}</td>
                        {SERVICES.map((s) => {
                          const v = complianceCell(r, s);
                          return (
                            <td key={s} className="text-center">
                              <motion.div whileHover={{ scale: 1.1 }} className={cn("rounded-md text-[11px] font-bold py-2 tabular-nums", complianceTone(v))}>
                                {v.toFixed(1)}%
                              </motion.div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-emerald-500" /> ≥99.5%</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-emerald-300" /> ≥99%</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-lime-300" /> ≥98%</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-amber-300" /> ≥97%</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-orange-400" /> &lt;97%</span>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Digital Compliance Workforce</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Active coworkers · live</h3>
                </div>
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              <div className="space-y-2">
                {COWORKERS.map((c) => (
                  <div key={c.name} className="rounded-lg border border-slate-200 p-3 bg-gradient-to-r from-white to-violet-50/30">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center text-white"><Bot className="h-4 w-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-bold text-slate-900 truncate">{c.name}</div>
                        <div className="text-[10.5px] text-slate-500">{c.role}</div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Validating
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-1 text-center">
                      <div className="rounded bg-slate-50 py-1"><div className="text-[8.5px] uppercase font-bold text-slate-500">Evid</div><div className="text-[11px] font-bold tabular-nums">{(c.evid/1000).toFixed(0)}K</div></div>
                      <div className="rounded bg-slate-50 py-1"><div className="text-[8.5px] uppercase font-bold text-slate-500">Ctrls</div><div className="text-[11px] font-bold tabular-nums">{c.ctrl}</div></div>
                      <div className="rounded bg-slate-50 py-1"><div className="text-[8.5px] uppercase font-bold text-slate-500">Hrs</div><div className="text-[11px] font-bold tabular-nums">{(c.hours/1000).toFixed(1)}K</div></div>
                      <div className="rounded bg-slate-50 py-1"><div className="text-[8.5px] uppercase font-bold text-slate-500">Conf</div><div className="text-[11px] font-bold tabular-nums">{c.conf}%</div></div>
                    </div>
                    <div className="mt-1.5 text-[10.5px] text-slate-600 italic">⟶ {c.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== REGULATORY IMPACT + TIMELINE ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-50/40 to-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Regulatory Impact Layer</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Material exposure · top findings</h3>
                </div>
                <Gavel className="h-4 w-4 text-rose-500" />
              </div>
              <div className="space-y-2 text-[12px]">
                {[
                  ["Revenue at Risk",       "$2.4M", "text-rose-700"],
                  ["Regulatory Exposure",   "PCI · HIPAA", "text-amber-700"],
                  ["Business Services",     "12 affected", "text-blue-700"],
                  ["Customers Impacted",    "1.4M", "text-violet-700"],
                  ["Potential Penalties",   "$0 (contained)", "text-emerald-700"],
                ].map(([k, v, c]) => (
                  <div key={k} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <span className="text-slate-600">{k}</span>
                    <span className={cn("font-bold tabular-nums", c)}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-rose-200 bg-white p-2.5 text-[10.5px] text-slate-700">
                <span className="font-bold text-rose-700">Note:</span> All material findings have approved compensating controls and tracked remediation. Zero open audit-blocking exceptions.
              </div>
            </div>

            <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Compliance Timeline</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Policies · controls · evidence · approvals</h3>
                </div>
                <span className="text-[11px] text-slate-500 inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Live</span>
              </div>
              <ol className="relative pl-4 space-y-2.5 before:absolute before:left-1 before:top-1 before:bottom-1 before:w-px before:bg-slate-200">
                {TIMELINE.map((t, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="relative">
                    <span className={cn("absolute -left-[14px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white", TIMELINE_TONE[t.k])} />
                    <div className="flex items-center gap-3 text-[12px]">
                      <span className="text-[10px] font-mono text-slate-400 w-12 shrink-0">{t.t}</span>
                      <span className="text-[10px] font-bold uppercase text-slate-500 w-20 shrink-0">{t.k}</span>
                      <span className="text-slate-800 flex-1">{t.ev}</span>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </section>

          {/* ===== EXECUTIVE ANALYTICS ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Executive Analytics</div>
                <h2 className="text-[15px] font-bold text-slate-900">Compliance trends · last 7 quarters</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <TrendCard title="Compliance" data={T_COMPLIANCE} color="#10b981" suffix="%" />
              <TrendCard title="Audit Readiness" data={T_READY} color="#8b5cf6" suffix="%" />
              <TrendCard title="Evidence Growth (K)" data={T_EVIDENCE} color="#0ea5e9" suffix="K" />
              <TrendCard title="Control Validation" data={T_CTRL} color="#14b8a6" suffix="%" />
              <TrendCard title="Open Exceptions" data={T_EXC} color="#f97316" suffix="" invert />
              <TrendCard title="Audit Findings" data={T_FIND} color="#f43f5e" suffix="" invert />
            </div>
          </section>

          {/* ===== AUTOMATIONS ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Compliance Automation Layer</div>
                <h2 className="text-[15px] font-bold text-slate-900">Always-on compliance machinery</h2>
              </div>
              <span className="text-[11px] text-slate-500">38,000 hours saved / qtr</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {AUTOMATIONS.map((a) => (
                <div key={a.name} className="rounded-xl border border-slate-200 p-3 hover:shadow-sm transition">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 grid place-items-center text-emerald-600"><Zap className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-bold text-slate-900 truncate">{a.name}</div>
                      <div className="text-[10.5px] text-slate-500">Last run {a.last}</div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                    <div className="rounded bg-slate-50 py-1"><div className="text-[9px] uppercase font-bold text-slate-500">Runs</div><div className="text-[12px] font-bold tabular-nums">{a.runs.toLocaleString()}</div></div>
                    <div className="rounded bg-slate-50 py-1"><div className="text-[9px] uppercase font-bold text-slate-500">Success</div><div className="text-[12px] font-bold tabular-nums text-emerald-700">{a.success}%</div></div>
                    <div className="rounded bg-slate-50 py-1"><div className="text-[9px] uppercase font-bold text-slate-500">Hrs Saved</div><div className="text-[12px] font-bold tabular-nums">{a.saved.toLocaleString()}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== AUDIT PACKAGE BUILDER ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Audit Package Builder</div>
                <h2 className="text-[15px] font-bold text-slate-900">One-click regulator-ready packages</h2>
              </div>
              <button className="h-8 px-3 text-[12px] font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1.5"><Archive className="h-3.5 w-3.5" /> New Package</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PACKAGES.map((p) => (
                <motion.div key={p.name} whileHover={{ y: -2 }} className="rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
                  <div className={cn("h-1.5 bg-gradient-to-r", p.color)} />
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-slate-50 grid place-items-center text-slate-600"><Archive className="h-4 w-4" /></div>
                        <div>
                          <div className="text-[13px] font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10.5px] text-slate-500">Generated {p.date}</div>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Ready
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                      <div className="rounded bg-cyan-50 py-1"><div className="text-[9px] uppercase font-bold text-cyan-700">Evidence</div><div className="text-[11.5px] font-bold tabular-nums text-cyan-700">{p.evid.toLocaleString()}</div></div>
                      <div className="rounded bg-blue-50 py-1"><div className="text-[9px] uppercase font-bold text-blue-700">Controls</div><div className="text-[11.5px] font-bold tabular-nums text-blue-700">{p.ctrl}</div></div>
                      <div className="rounded bg-violet-50 py-1"><div className="text-[9px] uppercase font-bold text-violet-700">Ready</div><div className="text-[11.5px] font-bold tabular-nums text-violet-700">{p.ready}%</div></div>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      <button className="flex-1 h-7 text-[11px] font-semibold rounded-md border border-slate-200 hover:bg-slate-50 inline-flex items-center justify-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                      <button className="flex-1 h-7 text-[11px] font-semibold rounded-md border border-slate-200 hover:bg-slate-50 inline-flex items-center justify-center gap-1"><Download className="h-3 w-3" /> ZIP</button>
                      <button className="flex-1 h-7 text-[11px] font-semibold rounded-md border border-slate-200 hover:bg-slate-50 inline-flex items-center justify-center gap-1"><Eye className="h-3 w-3" /> Open</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ===== EXECUTIVE OUTCOMES ===== */}
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">Executive Outcomes</div>
                <h2 className="text-[18px] font-bold">Compliance value created by Neurealm RunOps</h2>
              </div>
              <BookCheck className="h-7 w-7 opacity-80" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Audit Readiness", "99.2%", FileBadge],
                ["Evidence Records", "249,000", FileCheck2],
                ["Audit Findings", "4", AlertTriangle],
                ["Controls Passing", "98.7%", ClipboardCheck],
                ["Hours Saved", "38,000", Zap],
                ["Compliance Reports", "2,800", FileText],
                ["Business Services", "500", Briefcase],
                ["Revenue Protected", "$1.2B", DollarSign],
              ].map(([k, v, I]: any) => (
                <div key={k} className="rounded-xl bg-white/10 border border-white/20 backdrop-blur p-3">
                  <div className="flex items-start justify-between">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider opacity-80">{k}</div>
                    <I className="h-4 w-4 opacity-80" />
                  </div>
                  <div className="mt-1 text-[22px] font-bold tabular-nums">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
              <div className="rounded-xl bg-white/10 border border-white/20 p-3">
                <div className="font-bold uppercase tracking-wider text-[10px] opacity-80 mb-1">Before RunOps</div>
                <div className="opacity-90">Audit-driven scrambles · spreadsheet evidence · manual control testing · weeks of prep · recurring findings.</div>
              </div>
              <div className="rounded-xl bg-white/15 border border-white/30 p-3">
                <div className="font-bold uppercase tracking-wider text-[10px] opacity-80 mb-1">With RunOps</div>
                <div>Continuously audit-ready · 249K live evidence records · automated control validation · one-click audit packages.</div>
              </div>
            </div>
          </section>

          <p className="text-center text-[11px] text-slate-400 pb-4">
            Neurealm RunOps · Enterprise Compliance Center · Governance, evidence, and audit-readiness as a service
          </p>
        </div>
      </div>

      {/* ============== RIGHT-SIDE CONTEXTUAL PANEL ============== */}
      <Sheet open={open} onOpenChange={(o) => !o && setPanel(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[560px] overflow-y-auto">
          <SheetHeader><SheetTitle className="text-[15px]">{panelTitle(panel)}</SheetTitle></SheetHeader>
          <AnimatePresence mode="wait">
            {panel && (
              <motion.div key={JSON.stringify(panel)} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="mt-4 space-y-4">
                <PanelBody panel={panel} />
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function panelTitle(p: Panel) {
  if (!p) return "";
  if (p.kind === "domain") return `${p.d.label} · Compliance Workspace`;
  if (p.kind === "framework") return `${p.f.f} · ${p.f.tag} Workspace`;
  if (p.kind === "policy") return `Policy · ${p.p.name}`;
  return `Exception · ${p.e.id}`;
}

function PanelSection({ title, children }: any) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">{title}</div>
      <div className="rounded-lg border border-slate-200 bg-white p-3 text-[12.5px] text-slate-700 space-y-1">{children}</div>
    </div>
  );
}

function PanelBody({ panel }: { panel: NonNullable<Panel> }) {
  if (panel.kind === "domain") {
    const d = panel.d;
    return (
      <>
        <PanelSection title="Executive Summary">
          <div>{d.desc}</div>
          <div className="mt-1.5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded bg-slate-50 p-1.5"><div className="text-[9px] uppercase font-bold text-slate-500">Score</div><div className="text-[14px] font-bold">{d.score}%</div></div>
            <div className="rounded bg-slate-50 p-1.5"><div className="text-[9px] uppercase font-bold text-slate-500">Violations</div><div className="text-[14px] font-bold">{d.violations}</div></div>
            <div className="rounded bg-slate-50 p-1.5"><div className="text-[9px] uppercase font-bold text-slate-500">Trend</div><div className="text-[14px] font-bold text-emerald-600">{d.trend}</div></div>
          </div>
        </PanelSection>
        <PanelSection title="Risk Posture"><span className={cn("text-[10px] font-bold uppercase border rounded-full px-1.5 py-0.5", RISK_TONE[d.risk])}>{d.risk}</span></PanelSection>
        <PanelSection title="Assigned Digital Coworkers">
          <div className="flex flex-wrap gap-1.5">
            {d.coworkers.map((c) => <span key={c} className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5"><Bot className="h-3 w-3" /> {c}</span>)}
          </div>
        </PanelSection>
        <PanelSection title="Recommended Actions">
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Open dedicated compliance workspace</li>
            <li>Trigger control re-validation across all frameworks</li>
            <li>Auto-generate evidence package for the domain</li>
            <li>Notify control owners of any drift</li>
          </ul>
        </PanelSection>
        <PanelSection title="Dependencies">Policy engine · CMDB · evidence vault · framework mapping</PanelSection>
      </>
    );
  }
  if (panel.kind === "framework") {
    const f = panel.f;
    const isPci = f.f.startsWith("PCI"); const isSoc = f.f.startsWith("SOC"); const isNist = f.f.startsWith("NIST");
    return (
      <>
        <PanelSection title={isPci ? "Executive Summary" : isSoc ? "Trust Service Principles" : isNist ? "Control Families" : "Executive Summary"}>
          {isPci && <div>Payment card industry data security. Continuous control validation across cardholder data environments.</div>}
          {isSoc && <div>Security, Availability, Processing Integrity, Confidentiality, Privacy — all five principles covered.</div>}
          {isNist && <div>Comprehensive coverage of AC, AU, CM, IA, SC, SI control families relevant to certificate operations.</div>}
          {!isPci && !isSoc && !isNist && <div>{f.f} ({f.tag}) — continuously validated and audit-ready.</div>}
        </PanelSection>
        <PanelSection title="Control Coverage">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded bg-emerald-50 p-1.5"><div className="text-[9px] uppercase font-bold text-emerald-700">Pass</div><div className="text-[14px] font-bold text-emerald-700">{f.pass}</div></div>
            <div className="rounded bg-rose-50 p-1.5"><div className="text-[9px] uppercase font-bold text-rose-700">Fail</div><div className="text-[14px] font-bold text-rose-700">{f.fail}</div></div>
            <div className="rounded bg-violet-50 p-1.5"><div className="text-[9px] uppercase font-bold text-violet-700">Ready</div><div className="text-[14px] font-bold text-violet-700">{f.ready}%</div></div>
          </div>
        </PanelSection>
        <PanelSection title="Evidence Status">{f.evid}% complete · auto-refreshed daily · cryptographically signed.</PanelSection>
        <PanelSection title="Open Findings &amp; Audit Readiness">{f.findings} open finding(s) · audit-ready package available for one-click download.</PanelSection>
        <PanelSection title="Recommended Actions">
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Generate fresh audit package</li>
            <li>Review and close remaining finding(s)</li>
            <li>Schedule quarterly attestation cycle</li>
          </ul>
        </PanelSection>
        <PanelSection title="Dependencies">Framework mapping · control library · evidence vault · auditor portal</PanelSection>
      </>
    );
  }
  if (panel.kind === "policy") {
    const p = panel.p;
    return (
      <>
        <PanelSection title="Policy Description">{p.name} — enforces baseline standards across the certificate ecosystem; continuously monitored.</PanelSection>
        <PanelSection title="Compliance Rate">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${p.comp}%` }} /></div>
            <span className="font-bold text-emerald-700 tabular-nums">{p.comp}%</span>
          </div>
        </PanelSection>
        <PanelSection title="Violations &amp; Exceptions">{p.viol} active violations · {p.exc} approved exceptions with compensating controls.</PanelSection>
        <PanelSection title="Affected Services">Distributed across application tiers; full mapping available in workspace.</PanelSection>
        <PanelSection title="Business Impact">{p.impact}</PanelSection>
        <PanelSection title="Dependencies">CMDB · ownership graph · policy engine · framework mapping</PanelSection>
      </>
    );
  }
  // exception
  const e = panel.e;
  return (
    <>
      <PanelSection title="Risk Acceptance"><span className={cn("text-[10px] font-bold uppercase border rounded-full px-1.5 py-0.5", RISK_TONE[e.risk])}>{e.risk}</span><span className="ml-2 text-[11px] text-slate-500">Accepted by CISO Risk Council</span></PanelSection>
      <PanelSection title="Owner">{e.owner}</PanelSection>
      <PanelSection title="Expiration">{e.expires} · auto-revalidation 14 days prior</PanelSection>
      <PanelSection title="Compensating Controls">⊕ {e.comp}</PanelSection>
      <PanelSection title="Framework Impact">{e.impact}</PanelSection>
      <PanelSection title="Approval History">
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Service owner submitted exception</li>
          <li>PKI Compliance Auditor reviewed</li>
          <li>CISO Risk Council approved with compensating control</li>
        </ul>
      </PanelSection>
      <PanelSection title="Dependencies">Risk register · CMDB · audit trail · framework control mapping</PanelSection>
    </>
  );
}

function TrendCard({ title, data, color, suffix, invert }: any) {
  const last = data[data.length - 1].v;
  const first = data[0].v;
  const delta = invert ? first - last : last - first;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[11px] font-bold text-slate-700">{title}</div>
        <div className={cn("text-[11px] font-bold tabular-nums", delta >= 0 ? "text-emerald-600" : "text-rose-600")}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}
        </div>
      </div>
      <div className="text-[20px] font-bold tabular-nums">{last}{suffix}</div>
      <div className="h-[60px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
            <defs>
              <linearGradient id={`gc-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#gc-${title})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
