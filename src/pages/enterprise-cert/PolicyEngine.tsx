import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Bell, BookCheck, Bot, Briefcase, Building2, Cog, FileSearch, FileText,
  GitBranch, Globe, HelpCircle, LayoutDashboard, Package, Plug, RefreshCw,
  ScrollText, Scale, Search, ServerCog, ShieldAlert, ShieldCheck, UserCog, Sparkles,
  ChevronRight, AlertTriangle, CheckCircle2, FileBadge, Zap, KeyRound,
  TrendingUp, ClipboardCheck, Download, Archive, FileCheck2, Award, ShieldQuestion,
  Gavel, Ban, Play, GitFork, Layers, Lock, FlaskConical, History,
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
    { id: "pol", label: "Policy Engine", icon: Scale, to: "/enterprise-certificate-management/policy-engine", active: true },
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
      <div className="m-3 p-4 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
        <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Policy Compliance</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">99.7%</span>
          <span className="text-xs opacity-80">Enforced</span>
        </div>
        <div className="text-xs opacity-90">1,240 active · 487 blocked</div>
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
          <h1 className="text-[18px] font-bold text-slate-900 truncate">Enterprise Certificate Policy Engine</h1>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" /> Governance Live · 142K evals today
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input placeholder="Search policies, decisions, exceptions" className="pl-8 pr-3 h-8 w-72 text-[12px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 outline-none" />
        </div>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1.5"><FlaskConical className="h-3.5 w-3.5" /> Simulate Decision</button>
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
type Cat = { id: string; label: string; icon: any; color: string; count: number; viol: number; risk: string; exc: number; cov: number; desc: string; };
const CATS: Cat[] = [
  { id: "cert",  label: "Certificate Policies",   icon: FileBadge,     color: "from-blue-500 to-indigo-600",   count: 248, viol: 42, risk: "Low",    exc: 8, cov: 99.9, desc: "Expiration, ownership, naming, wildcard, self-signed standards." },
  { id: "crypt", label: "Cryptographic Policies", icon: KeyRound,      color: "from-violet-500 to-purple-600", count: 96,  viol: 93, risk: "Medium", exc: 4, cov: 99.4, desc: "Key length, algorithms, ciphers, rotation, quantum readiness." },
  { id: "own",   label: "Ownership Policies",     icon: UserCog,       color: "from-emerald-500 to-teal-600",  count: 64,  viol: 12, risk: "Low",    exc: 2, cov: 99.7, desc: "Accountability, lifecycle ownership, delegation rules." },
  { id: "chg",   label: "Change Policies",        icon: GitBranch,     color: "from-cyan-500 to-blue-600",     count: 142, viol: 4,  risk: "Low",    exc: 1, cov: 99.8, desc: "Approval workflow, blackout windows, batch rules." },
  { id: "dep",   label: "Deployment Policies",    icon: ServerCog,     color: "from-sky-500 to-blue-600",      count: 188, viol: 2,  risk: "Low",    exc: 0, cov: 99.9, desc: "Rollout cadence, validation gates, rollback policy." },
  { id: "sec",   label: "Security Policies",      icon: ShieldCheck,   color: "from-rose-500 to-red-600",      count: 212, viol: 0,  risk: "Low",    exc: 3, cov: 100,  desc: "Trust boundaries, CT-log enforcement, key compromise." },
  { id: "comp",  label: "Compliance Policies",    icon: BookCheck,     color: "from-amber-500 to-orange-600",  count: 184, viol: 0,  risk: "Low",    exc: 5, cov: 99.8, desc: "PCI · SOC2 · NIST · ISO · HIPAA · GDPR alignment." },
  { id: "gov",   label: "Governance Policies",    icon: Gavel,         color: "from-indigo-500 to-violet-600", count: 106, viol: 0,  risk: "Low",    exc: 4, cov: 99.9, desc: "Authority levels, escalation, autonomous boundaries." },
];

// ============== POLICY LIBRARY ==============
type Pol = { name: string; status: "Active"|"Draft"|"Retired"; comp: number; viol: number; exc: number; risk: string; impact: string; };
const POLICIES: Pol[] = [
  { name: "Certificate Expiration",     status: "Active", comp: 99.4, viol: 18, exc: 4, risk: "Low",    impact: "Service availability · revenue continuity" },
  { name: "Certificate Ownership",      status: "Active", comp: 98.2, viol: 42, exc: 8, risk: "Medium", impact: "Accountability · audit defensibility" },
  { name: "Renewal Window",             status: "Active", comp: 99.6, viol: 6,  exc: 1, risk: "Low",    impact: "Lifecycle continuity" },
  { name: "Revocation",                 status: "Active", comp: 99.9, viol: 1,  exc: 0, risk: "Low",    impact: "Trust integrity" },
  { name: "CA Trust Allow-list",        status: "Active", comp: 99.8, viol: 2,  exc: 0, risk: "Low",    impact: "Issuance governance" },
  { name: "Certificate Naming",         status: "Active", comp: 99.1, viol: 14, exc: 2, risk: "Low",    impact: "Operational discoverability" },
  { name: "Wildcard Certificate",       status: "Active", comp: 97.8, viol: 22, exc: 6, risk: "Medium", impact: "Blast radius · trust exposure" },
  { name: "Self-Signed Certificate",    status: "Active", comp: 99.6, viol: 8,  exc: 3, risk: "Low",    impact: "Internal trust integrity" },
];
const STATUS_TONE: any = { Active: "bg-emerald-100 text-emerald-700 border-emerald-200", Draft: "bg-amber-100 text-amber-700 border-amber-200", Retired: "bg-slate-100 text-slate-500 border-slate-200" };
const RISK_TONE: any = { Critical: "bg-rose-100 text-rose-700 border-rose-200", High: "bg-orange-100 text-orange-700 border-orange-200", Medium: "bg-amber-100 text-amber-700 border-amber-200", Low: "bg-emerald-100 text-emerald-700 border-emerald-200" };

// ============== CRYPTO POLICIES ==============
const CRYPTO = [
  { k: "RSA Minimum",        v: "3072 bits",  state: "Enforced",        tone: "bg-emerald-500", det: "Raised from 2048 in Mar 2026" },
  { k: "ECC Preferred",      v: "P-384",      state: "Enabled",         tone: "bg-emerald-500", det: "Auto-selected for new issuance" },
  { k: "SHA-1",              v: "Blocked",    state: "Blocked",         tone: "bg-rose-500",    det: "0 issuances in 90d · 4 legacy exceptions" },
  { k: "SHA-256+",           v: "Required",   state: "Enforced",        tone: "bg-emerald-500", det: "100% of new issuance" },
  { k: "Key Rotation",       v: "≤ 365 days", state: "Enforced",        tone: "bg-emerald-500", det: "Auto-renewal coordinator drives" },
  { k: "Cipher Suite",       v: "TLS 1.2+",   state: "Enforced",        tone: "bg-emerald-500", det: "TLS 1.3 preferred · 88% adoption" },
  { k: "Weak Algorithms",    v: "93 viol.",   state: "Remediating",     tone: "bg-amber-500",   det: "MD5/SHA-1/RSA-1024 sweep underway" },
  { k: "Quantum Readiness",  v: "ML-KEM pilot", state: "Tracking",      tone: "bg-violet-500",  det: "Hybrid PQC pilot · 22 services" },
];

// ============== EVALUATION ENGINE ==============
const EVALS = [
  { req: "Renew CN=api.payments.acme.com",     decision: "Allow",            tone: "bg-emerald-500", reason: "Within renewal window · ownership verified · CA allow-listed", confidence: 99, action: "Auto-execute renewal" },
  { req: "Issue *.legacy.intl wildcard",        decision: "Requires Approval", tone: "bg-amber-500",   reason: "Wildcard policy · blast radius >50 hosts · CISO sign-off",     confidence: 96, action: "Route to Sec Lead" },
  { req: "Rotate compromised key svc-edge-44",  decision: "Escalate",         tone: "bg-rose-500",    reason: "Key compromise · Sev1 incident · break-glass authority",      confidence: 99, action: "Page IR + execute" },
  { req: "Issue self-signed for dev sandbox",   decision: "Allow",            tone: "bg-emerald-500", reason: "Isolated subnet · scope limited · TTL=30d",                   confidence: 98, action: "Auto-execute · TTL-bound" },
  { req: "Use untrusted CA for vendor portal",  decision: "Block",            tone: "bg-rose-600",    reason: "CA not on allow-list · trust policy violation",               confidence: 100,action: "Reject + notify owner" },
  { req: "Deploy cert during change freeze",    decision: "Block",            tone: "bg-rose-600",    reason: "Blackout window · only Sev1 exceptions permitted",            confidence: 100,action: "Defer to Nov 14 window" },
];

// ============== DIGITAL COWORKERS ==============
const COWORKERS = [
  { name: "Certificate Discovery Engineer", policies: 96,  decisions: 84200, prevented: 142, escalations: 22, conf: 98, status: "Resolving 22 ownership gaps" },
  { name: "Certificate Risk Analyst",       policies: 142, decisions: 38400, prevented: 318, escalations: 84, conf: 97, status: "Scoring 1.2K renewal candidates" },
  { name: "Renewal Coordinator",            policies: 88,  decisions: 62100, prevented: 4,   escalations: 12, conf: 99, status: "Auto-renewing within policy windows" },
  { name: "Deployment Engineer",            policies: 188, decisions: 46200, prevented: 18,  escalations: 8,  conf: 99, status: "Honoring blackout policy · 142 staged" },
  { name: "PKI Compliance Auditor",         policies: 212, decisions: 18420, prevented: 5,   escalations: 4,  conf: 99, status: "Validating policy adherence" },
  { name: "Security Investigation Analyst", policies: 96,  decisions: 612,   prevented: 0,   escalations: 27, conf: 96, status: "Reviewing 3 exception requests" },
];

// ============== VIOLATIONS ==============
const VIOLATIONS = [
  { id: "VL-9921", cat: "Weak Algorithm",     svc: "Legacy EDI Gateway", region: "EU",   owner: "Claims Plat",  risk: "Medium", impact: "PCI · 3.6" },
  { id: "VL-9920", cat: "Unknown Owner",      svc: "Mfg MES",            region: "APAC", owner: "—",            risk: "Medium", impact: "ISO 27001 · A.10" },
  { id: "VL-9919", cat: "Unauthorized Issuer",svc: "Vendor Portal X",    region: "NA",   owner: "Supplier Ops", risk: "High",   impact: "SOC 2 · CC6.1" },
  { id: "VL-9918", cat: "Expired Certificate",svc: "Marketing Microsite",region: "LATAM",owner: "Marketing",    risk: "Low",    impact: "GDPR · Art. 32" },
  { id: "VL-9917", cat: "Missing Approval",   svc: "R&D Sandbox",        region: "NA",   owner: "R&D Plat",     risk: "Low",    impact: "SOC 2 · CC8.1" },
  { id: "VL-9916", cat: "Unapproved CA",      svc: "Partner Exchange",   region: "UK",   owner: "Partner Ops",  risk: "High",   impact: "NIST · SC-12" },
];

// ============== EXCEPTIONS ==============
const EXCEPTIONS = [
  { id: "EX-0421", state: "Approved",  scope: "Mfg MES (EU)",         risk: "High",   owner: "Plant Ops EU", expires: "Aug 14", comp: "Network isolation",      chain: "Plant Lead → Sec Lead → CISO" },
  { id: "EX-0418", state: "Approved",  scope: "Legacy EDI",           risk: "Medium", owner: "Claims Plat",  expires: "Sep 02", comp: "WAF + audit log",        chain: "App Owner → GRC" },
  { id: "EX-0414", state: "Pending",   scope: "Vendor Portal X",      risk: "Medium", owner: "Supplier Ops", expires: "Awaiting", comp: "MFA + IP allow-list",  chain: "Owner → Sec Lead" },
  { id: "EX-0411", state: "Approved",  scope: "R&D Sandbox",          risk: "Low",    owner: "R&D Plat",     expires: "Dec 01", comp: "Isolated subnet",        chain: "Owner → GRC" },
  { id: "EX-0408", state: "Expired",   scope: "Marketing Microsite",  risk: "Low",    owner: "Marketing",    expires: "Jul 04", comp: "CDN edge cert",          chain: "Owner → GRC" },
  { id: "EX-0405", state: "Rejected",  scope: "Partner Cert (UK)",    risk: "High",   owner: "Partner Ops",  expires: "—",      comp: "—",                       chain: "Sec Lead blocked" },
];
const EX_TONE: any = { Approved: "bg-emerald-100 text-emerald-700 border-emerald-200", Pending: "bg-amber-100 text-amber-700 border-amber-200", Expired: "bg-slate-100 text-slate-600 border-slate-200", Rejected: "bg-rose-100 text-rose-700 border-rose-200" };

// ============== HIERARCHY ==============
const HIERARCHY = [
  { lvl: 0, name: "Enterprise Policies",     count: 142, owner: "CISO Office",   note: "Inherited everywhere · 0 overrides" },
  { lvl: 1, name: "Business Unit Policies",  count: 318, owner: "BU GRC Leads",  note: "12 BU-specific overrides" },
  { lvl: 2, name: "Application Policies",    count: 412, owner: "App Owners",    note: "44 app overrides · 4 conflicts" },
  { lvl: 3, name: "Certificate Policies",    count: 248, owner: "PKI Team",      note: "0 overrides" },
  { lvl: 4, name: "Execution Policies",      count: 120, owner: "Coworker Mesh", note: "Autonomous boundaries · 2 conflicts" },
];

// ============== AUTOMATIONS ==============
const AUTOMATIONS = [
  { name: "Policy Evaluation",       runs: 142000, success: 99.9, saved: 12480, last: "2s ago" },
  { name: "Violation Detection",     runs: 153,    success: 100,  saved: 4280,  last: "8s ago" },
  { name: "Exception Tracking",      runs: 27,     success: 100,  saved: 612,   last: "1m ago" },
  { name: "Governance Enforcement",  runs: 487,    success: 100,  saved: 6420,  last: "14s ago" },
  { name: "Decision Routing",        runs: 142000, success: 99.8, saved: 8420,  last: "3s ago" },
  { name: "Approval Escalation",     runs: 820,    success: 99.9, saved: 2120,  last: "12s ago" },
];

// ============== TIMELINE ==============
const TIMELINE = [
  { t: "09:42", k: "create", ev: "Policy created · Wildcard scope reduced to 25 hosts max" },
  { t: "09:34", k: "update", ev: "RSA minimum raised from 2048 → 3072 · 124 services impacted" },
  { t: "09:21", k: "approve",ev: "Policy approved · Quantum Readiness pilot scope expanded" },
  { t: "09:08", k: "viol",   ev: "Violation: Unauthorized issuer on Vendor Portal X" },
  { t: "08:52", k: "exc",    ev: "Exception EX-0421 approved · Plant Ops EU" },
  { t: "08:34", k: "review", ev: "Quarterly policy review opened · 42 policies in scope" },
  { t: "08:18", k: "retire", ev: "Policy retired · SHA-1 legacy exception sunset" },
  { t: "08:02", k: "viol",   ev: "Violation blocked: deploy attempt during change freeze" },
];
const TIMELINE_TONE: any = { create: "bg-indigo-500", update: "bg-violet-500", approve: "bg-emerald-500", viol: "bg-rose-500", exc: "bg-amber-500", review: "bg-blue-500", retire: "bg-slate-500" };

// ============== TRENDS ==============
const T_COMP    = [{m:"Jan",v:96.4},{m:"Feb",v:97.2},{m:"Mar",v:97.9},{m:"Apr",v:98.4},{m:"May",v:98.9},{m:"Jun",v:99.3},{m:"Jul",v:99.7}];
const T_VIOL    = [{m:"Jan",v:418},{m:"Feb",v:362},{m:"Mar",v:296},{m:"Apr",v:248},{m:"May",v:212},{m:"Jun",v:178},{m:"Jul",v:153}];
const T_EXC     = [{m:"Jan",v:58},{m:"Feb",v:52},{m:"Mar",v:46},{m:"Apr",v:41},{m:"May",v:36},{m:"Jun",v:31},{m:"Jul",v:27}];
const T_ACC     = [{m:"Jan",v:96.2},{m:"Feb",v:97.1},{m:"Mar",v:97.8},{m:"Apr",v:98.3},{m:"May",v:98.7},{m:"Jun",v:99.0},{m:"Jul",v:99.6}];
const T_BLOCK   = [{m:"Jan",v:148},{m:"Feb",v:212},{m:"Mar",v:268},{m:"Apr",v:322},{m:"May",v:388},{m:"Jun",v:432},{m:"Jul",v:487}];
const T_AUTO    = [{m:"Jan",v:62},{m:"Feb",v:78},{m:"Mar",v:96},{m:"Apr",v:112},{m:"May",v:128},{m:"Jun",v:142},{m:"Jul",v:152}];
const T_GOV     = [{m:"Jan",v:142},{m:"Feb",v:168},{m:"Mar",v:188},{m:"Apr",v:206},{m:"May",v:222},{m:"Jun",v:238},{m:"Jul",v:249}];
const T_RISK    = [{m:"Jan",v:72.4},{m:"Feb",v:78.2},{m:"Mar",v:82.6},{m:"Apr",v:87.1},{m:"May",v:90.4},{m:"Jun",v:94.2},{m:"Jul",v:96.4}];

// ============== SIMULATOR SCENARIOS ==============
const SCENARIOS = [
  { id: "renew",   label: "Renew Certificate",          policies: ["Renewal Window","CA Trust","Crypto"],     decision: "Allow",             tone: "bg-emerald-500", text: "Within renewal window · CA allow-listed · RSA-3072 OK" },
  { id: "issue",   label: "Issue New Certificate",      policies: ["Naming","Ownership","CA Trust"],          decision: "Allow",             tone: "bg-emerald-500", text: "Ownership resolved · CA approved · naming compliant" },
  { id: "deploy",  label: "Deploy Certificate",         policies: ["Change Window","Validation Gate"],        decision: "Requires Approval", tone: "bg-amber-500",   text: "Outside standard change window · single-approver required" },
  { id: "rotate",  label: "Rotate Key",                 policies: ["Key Rotation","Incident Authority"],      decision: "Allow",             tone: "bg-emerald-500", text: "Within rotation policy · auto-execute" },
  { id: "ca",      label: "Change Certificate Authority", policies: ["CA Trust","Governance Authority"],      decision: "Escalate",          tone: "bg-rose-500",    text: "CA change requires CISO + Risk Committee" },
  { id: "wild",    label: "Request Wildcard Certificate", policies: ["Wildcard","Blast Radius","Approval"],   decision: "Requires Approval", tone: "bg-amber-500",   text: "Blast radius >25 hosts · Sec Lead sign-off required" },
];

// ============== PANEL TYPES ==============
type Panel =
  | { kind: "cat"; c: Cat }
  | { kind: "pol"; p: Pol }
  | { kind: "crypto"; c: typeof CRYPTO[number] }
  | { kind: "gov"; lvl: typeof HIERARCHY[number] }
  | { kind: "exc"; e: typeof EXCEPTIONS[number] }
  | { kind: "viol"; v: typeof VIOLATIONS[number] }
  | null;

// ============== PAGE ==============
export default function PolicyEngine() {
  const [panel, setPanel] = useState<Panel>(null);
  const [sim, setSim] = useState(SCENARIOS[0]);
  const open = !!panel;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Header />
        <div className="p-6 space-y-6">

          {/* ===== EXEC KPI ===== */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Executive KPI Layer</div>
                <h2 className="text-[15px] font-bold text-slate-900">Every certificate decision · governed by policy</h2>
              </div>
              <span className="text-[11px] text-slate-500">Updated 2 seconds ago</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <KpiCard icon={Scale}         label="Active Policies"               value={1240}   accent="bg-gradient-to-r from-indigo-400 to-blue-600"    trend="+148 last qtr" />
              <KpiCard icon={Zap}           label="Policy Evaluations Today"      value={142000} accent="bg-gradient-to-r from-violet-400 to-purple-600"  trend="+18% vs yest." />
              <KpiCard icon={AlertTriangle} label="Policy Violations"             value={153}    accent="bg-gradient-to-r from-amber-400 to-orange-500"   trend="−265 last qtr" />
              <KpiCard icon={Ban}           label="Blocked Actions"               value={487}    accent="bg-gradient-to-r from-rose-400 to-rose-600"      trend="+99 vs LY" />
              <KpiCard icon={CheckCircle2}  label="Policy Compliance"             value={99.7}   suffix="%" decimals={1} accent="bg-gradient-to-r from-emerald-400 to-teal-600" trend="+3.3 vs LY" />
              <KpiCard icon={ShieldQuestion} label="Approved Exceptions"          value={27}     accent="bg-gradient-to-r from-amber-400 to-orange-500"   trend="−31 last qtr" />
              <KpiCard icon={Bot}           label="Coworker Decisions Governed"   value={249000} accent="bg-gradient-to-r from-violet-400 to-fuchsia-500" trend="100% in-policy" />
              <KpiCard icon={Sparkles}      label="Autonomous Actions Allowed"    value={152000} accent="bg-gradient-to-r from-blue-400 to-cyan-500"      trend="61% autonomous" />
              <KpiCard icon={Gavel}         label="Human Escalations"             value={820}    accent="bg-gradient-to-r from-orange-400 to-rose-500"    trend="−42% vs LY" />
              <KpiCard icon={Award}         label="Risk Reduction Score"          value={96.4}   suffix="" decimals={1} accent="bg-gradient-to-r from-emerald-400 to-green-600" trend="+24 vs LY" />
            </div>
          </section>

          {/* ===== POLICY COMMAND CENTER ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Policy Command Center</div>
                <h2 className="text-[15px] font-bold text-slate-900">Eight policy categories · click to explore</h2>
              </div>
              <span className="text-[11px] text-slate-500 inline-flex items-center gap-1"><Bot className="h-3.5 w-3.5" /> Coworkers enforcing in real time</span>
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
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    <div className="rounded-lg bg-slate-50 p-2"><div className="text-[9px] uppercase font-bold text-slate-500">Policies</div><div className="text-[14px] font-bold tabular-nums">{c.count}</div></div>
                    <div className="rounded-lg bg-slate-50 p-2"><div className="text-[9px] uppercase font-bold text-slate-500">Viol</div><div className="text-[14px] font-bold tabular-nums">{c.viol}</div></div>
                    <div className="rounded-lg bg-slate-50 p-2"><div className="text-[9px] uppercase font-bold text-slate-500">Exc</div><div className="text-[14px] font-bold tabular-nums">{c.exc}</div></div>
                    <div className="rounded-lg bg-slate-50 p-2"><div className="text-[9px] uppercase font-bold text-slate-500">Cov</div><div className="text-[14px] font-bold tabular-nums">{c.cov}%</div></div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className={cn("inline-block px-2 py-0.5 rounded-full font-bold uppercase border", RISK_TONE[c.risk])}>{c.risk}</span>
                    <span className="text-emerald-600 font-semibold inline-flex items-center gap-1"><Bot className="h-3 w-3" /> Coworkers active</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* ===== HIERARCHY + CRYPTO ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Policy Hierarchy</div>
                  <h2 className="text-[15px] font-bold text-slate-900">Enterprise → BU → App → Certificate → Execution</h2>
                </div>
                <span className="text-[10px] text-slate-500">Inheritance · overrides · conflicts</span>
              </div>
              <div className="space-y-2">
                {HIERARCHY.map((h, i) => (
                  <motion.button key={h.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => setPanel({ kind: "gov", lvl: h })}
                    className="w-full text-left rounded-xl border border-slate-200 p-3 hover:shadow-md hover:border-indigo-200 transition flex items-center gap-3"
                    style={{ marginLeft: `${h.lvl * 18}px` }}>
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center text-white shrink-0"><Layers className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[13px] font-bold text-slate-900">{h.name}</div>
                        <div className="text-[10px] text-slate-500">{h.owner}</div>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="font-semibold text-slate-700 tabular-nums">{h.count} policies</span>
                        <span>·</span>
                        <span>{h.note}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cryptographic Policy Center</div>
              <h2 className="text-[15px] font-bold text-slate-900 mb-3">Standards · enforcement · quantum readiness</h2>
              <div className="space-y-2">
                {CRYPTO.map((c) => (
                  <button key={c.k} onClick={() => setPanel({ kind: "crypto", c })}
                    className="w-full text-left rounded-lg border border-slate-200 p-2.5 hover:shadow-sm transition flex items-center gap-2.5">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", c.tone)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="text-[12px] font-bold text-slate-900">{c.k}</div>
                        <div className="text-[11px] font-bold tabular-nums text-slate-700">{c.v}</div>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{c.det}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ===== POLICY LIBRARY ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Certificate Policy Library</div>
                <h2 className="text-[15px] font-bold text-slate-900">Active policies governing the certificate ecosystem</h2>
              </div>
              <button className="text-[11px] font-semibold text-indigo-700 inline-flex items-center gap-1">+ New policy</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {POLICIES.map((p) => (
                <motion.button key={p.name} whileHover={{ y: -2 }} onClick={() => setPanel({ kind: "pol", p })}
                  className="text-left rounded-xl border border-slate-200 bg-white p-3.5 hover:shadow-lg transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[13px] font-bold text-slate-900 truncate">{p.name}</div>
                    <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border", STATUS_TONE[p.status])}>{p.status}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <div className="rounded bg-slate-50 p-1.5"><div className="text-[9px] uppercase font-bold text-slate-500">Comp</div><div className="text-[13px] font-bold tabular-nums text-emerald-700">{p.comp}%</div></div>
                    <div className="rounded bg-slate-50 p-1.5"><div className="text-[9px] uppercase font-bold text-slate-500">Viol</div><div className="text-[13px] font-bold tabular-nums">{p.viol}</div></div>
                    <div className="rounded bg-slate-50 p-1.5"><div className="text-[9px] uppercase font-bold text-slate-500">Exc</div><div className="text-[13px] font-bold tabular-nums">{p.exc}</div></div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", RISK_TONE[p.risk])}>{p.risk}</span>
                    <span className="text-[10px] text-slate-500 truncate">{p.impact}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* ===== EVALUATION ENGINE + DECISION SIMULATOR ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Policy Evaluation Engine · Live</div>
                  <h2 className="text-[15px] font-bold text-slate-900">Decisions streaming through governance</h2>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" /> Streaming</span>
              </div>
              <div className="space-y-2">
                {EVALS.map((e, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-slate-200 p-3 hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                      <span className={cn("h-8 px-2.5 rounded-lg text-white text-[11px] font-bold inline-flex items-center", e.tone)}>{e.decision}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-slate-900 truncate">{e.req}</div>
                        <div className="text-[11px] text-slate-600 truncate">{e.reason}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] uppercase font-bold text-slate-500">Conf</div>
                        <div className="text-[13px] font-bold tabular-nums text-emerald-700">{e.confidence}%</div>
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500 inline-flex items-center gap-1"><Play className="h-3 w-3" /> {e.action}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Decision Simulator</div>
                  <h2 className="text-[15px] font-bold text-slate-900">What if I tried this?</h2>
                </div>
                <FlaskConical className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="space-y-1.5 mb-3">
                {SCENARIOS.map((s) => (
                  <button key={s.id} onClick={() => setSim(s)}
                    className={cn("w-full text-left rounded-lg border px-3 py-2 text-[12px] font-semibold transition",
                      sim.id === s.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200 hover:border-indigo-200")}>
                    {s.label}
                  </button>
                ))}
              </div>
              <motion.div key={sim.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-white border border-slate-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("h-7 px-2.5 rounded-lg text-white text-[11px] font-bold inline-flex items-center", sim.tone)}>{sim.decision}</span>
                  <div className="text-[12px] font-bold text-slate-900 truncate">{sim.label}</div>
                </div>
                <div className="text-[11px] text-slate-600 mb-2">{sim.text}</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Policies evaluated</div>
                <div className="flex flex-wrap gap-1">{sim.policies.map(p => <span key={p} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">{p}</span>)}</div>
              </motion.div>
            </div>
          </section>

          {/* ===== COWORKERS ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Digital Coworker Governance Layer</div>
                <h2 className="text-[15px] font-bold text-slate-900">Policy applied to every autonomous action</h2>
              </div>
              <span className="text-[10px] text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full font-bold uppercase">249K decisions governed</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead><tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 font-semibold">Coworker</th>
                  <th className="py-2 font-semibold text-right">Policies Applied</th>
                  <th className="py-2 font-semibold text-right">Decisions Governed</th>
                  <th className="py-2 font-semibold text-right">Violations Prevented</th>
                  <th className="py-2 font-semibold text-right">Escalations</th>
                  <th className="py-2 font-semibold text-right">Confidence</th>
                  <th className="py-2 font-semibold">Current Activity</th>
                </tr></thead>
                <tbody>
                  {COWORKERS.map((c) => (
                    <tr key={c.name} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 font-bold text-slate-900 inline-flex items-center gap-2"><Bot className="h-3.5 w-3.5 text-indigo-500" />{c.name}</td>
                      <td className="py-2 text-right tabular-nums">{c.policies}</td>
                      <td className="py-2 text-right tabular-nums">{c.decisions.toLocaleString()}</td>
                      <td className="py-2 text-right tabular-nums text-rose-600 font-semibold">{c.prevented}</td>
                      <td className="py-2 text-right tabular-nums">{c.escalations}</td>
                      <td className="py-2 text-right tabular-nums text-emerald-700 font-semibold">{c.conf}%</td>
                      <td className="py-2 text-slate-600 text-[11px]">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ===== VIOLATIONS + EXCEPTIONS ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Policy Violation Center</div>
                  <h2 className="text-[15px] font-bold text-slate-900">Recent violations · all in remediation</h2>
                </div>
                <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-bold uppercase">{VIOLATIONS.length} active</span>
              </div>
              <div className="space-y-2">
                {VIOLATIONS.map((v) => (
                  <button key={v.id} onClick={() => setPanel({ kind: "viol", v })}
                    className="w-full text-left rounded-lg border border-slate-200 p-3 hover:shadow-md transition">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[13px] font-bold text-slate-900 truncate">{v.cat} · {v.svc}</div>
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", RISK_TONE[v.risk])}>{v.risk}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between gap-2 mt-1">
                      <span>{v.region} · {v.owner}</span>
                      <span className="text-slate-400">{v.id} · {v.impact}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Exception Management Center</div>
                  <h2 className="text-[15px] font-bold text-slate-900">Risk-accepted with compensating controls</h2>
                </div>
                <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase">27 approved</span>
              </div>
              <div className="space-y-2">
                {EXCEPTIONS.map((e) => (
                  <button key={e.id} onClick={() => setPanel({ kind: "exc", e })}
                    className="w-full text-left rounded-lg border border-slate-200 p-3 hover:shadow-md transition">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[13px] font-bold text-slate-900 truncate">{e.scope}</div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", EX_TONE[e.state])}>{e.state}</span>
                        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", RISK_TONE[e.risk])}>{e.risk}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between gap-2 mt-1">
                      <span>{e.owner} · expires {e.expires}</span>
                      <span className="text-slate-400">{e.id}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Compensating: {e.comp}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ===== POLICY LIFECYCLE TIMELINE ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Policy Lifecycle Timeline</div>
                <h2 className="text-[15px] font-bold text-slate-900">Create · update · approve · enforce · retire</h2>
              </div>
              <span className="text-[10px] text-slate-500">Auto-refresh · 4s</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {TIMELINE.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="rounded-lg border border-slate-100 p-2.5 flex items-center gap-3 hover:bg-slate-50">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", TIMELINE_TONE[t.k])} />
                  <div className="text-[11px] text-slate-500 tabular-nums w-12 shrink-0">{t.t}</div>
                  <div className="text-[12px] text-slate-800 truncate">{t.ev}</div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ===== AUTOMATIONS ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Automation Layer</div>
            <h2 className="text-[15px] font-bold text-slate-900 mb-3">Active governance automations</h2>
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
            <h2 className="text-[15px] font-bold text-slate-900 mb-3">Policy, decision, and risk trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { title: "Policy Compliance %",     data: T_COMP,  c1: "#059669", c2: "#10b981" },
                { title: "Violation Trend",        data: T_VIOL,  c1: "#e11d48", c2: "#fb7185" },
                { title: "Exception Trend",        data: T_EXC,   c1: "#d97706", c2: "#f59e0b" },
                { title: "Decision Accuracy %",    data: T_ACC,   c1: "#2563eb", c2: "#3b82f6" },
                { title: "Blocked Actions",        data: T_BLOCK, c1: "#0891b2", c2: "#06b6d4" },
                { title: "Autonomous Decisions (K)", data: T_AUTO,c1: "#7c3aed", c2: "#7c3aed" },
                { title: "Governed Decisions (K)", data: T_GOV,   c1: "#4f46e5", c2: "#6366f1" },
                { title: "Risk Reduction Score",   data: T_RISK,  c1: "#15803d", c2: "#22c55e" },
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
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">Executive Outcomes</div>
                <h2 className="text-[16px] font-bold">Before vs after Neurealm RunOps</h2>
              </div>
              <Award className="h-6 w-6 text-white/80" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { l: "Policy Compliance",          v: "99.7%",   b: "62%" },
                { l: "Violations Prevented",       v: "487",     b: "18" },
                { l: "Governed Decisions",         v: "249,000", b: "12,000" },
                { l: "Approved Exceptions",        v: "27",      b: "318" },
                { l: "Risk Reduction",             v: "96.4%",   b: "48%" },
                { l: "Business Services Protected",v: "500",     b: "180" },
                { l: "Revenue Protected",          v: "$1.2B",   b: "$420M" },
                { l: "Coworker Decisions Governed",v: "249,000", b: "—" },
              ].map((o) => (
                <div key={o.l} className="rounded-xl bg-white/10 border border-white/20 p-3 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-wider text-white/70 font-bold">{o.l}</div>
                  <div className="text-[20px] font-bold mt-0.5">{o.v}</div>
                  <div className="text-[10px] text-white/70">Before: {o.b}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="text-center text-[11px] text-slate-400 py-4">Neurealm RunOps · Enterprise Certificate Policy Engine · Digital coworkers operate within policy, not intuition.</div>
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
                    {panel.kind === "pol" && panel.p.name}
                    {panel.kind === "crypto" && `${panel.c.k} · Cryptographic Policy`}
                    {panel.kind === "gov" && panel.lvl.name}
                    {panel.kind === "exc" && `${panel.e.id} · ${panel.e.scope}`}
                    {panel.kind === "viol" && `${panel.v.id} · ${panel.v.cat}`}
                  </SheetTitle>
                </SheetHeader>

                {panel.kind === "cat" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Executive Summary</div><div className="mt-1 text-slate-700">{panel.c.desc}</div></div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Policies</div><div className="text-[16px] font-bold tabular-nums">{panel.c.count}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Viol</div><div className="text-[16px] font-bold tabular-nums">{panel.c.viol}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Exc</div><div className="text-[16px] font-bold tabular-nums">{panel.c.exc}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Cov</div><div className="text-[16px] font-bold tabular-nums">{panel.c.cov}%</div></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Business Impact</div><div className="text-slate-700 mt-1">Governance domain affects trust, availability, and audit defensibility across 500 business services.</div></div>
                  </div>
                )}

                {panel.kind === "pol" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", STATUS_TONE[panel.p.status])}>{panel.p.status}</span>
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", RISK_TONE[panel.p.risk])}>{panel.p.risk}</span>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Policy Description</div><div className="text-slate-700 mt-1">Continuously enforced across all certificates, applications, and digital coworkers in the certificate ecosystem.</div></div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Comp</div><div className="text-[16px] font-bold tabular-nums text-emerald-700">{panel.p.comp}%</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Viol</div><div className="text-[16px] font-bold tabular-nums">{panel.p.viol}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Exc</div><div className="text-[16px] font-bold tabular-nums">{panel.p.exc}</div></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Business Impact</div><div className="text-slate-700 mt-1">{panel.p.impact}</div></div>
                  </div>
                )}

                {panel.kind === "crypto" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Algorithm Requirement</div><div className="text-[18px] font-bold mt-1 tabular-nums">{panel.c.v}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Enforcement State</div><div className="mt-1 inline-flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", panel.c.tone)} /><span className="font-bold">{panel.c.state}</span></div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Detail</div><div className="text-slate-700 mt-1">{panel.c.det}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Recommendation</div><div className="text-slate-700 mt-1">Continue continuous enforcement · expand quantum-readiness pilot.</div></div>
                  </div>
                )}

                {panel.kind === "gov" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Owner</div><div className="text-slate-700 mt-1">{panel.lvl.owner}</div></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Policies</div><div className="text-[16px] font-bold tabular-nums">{panel.lvl.count}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Level</div><div className="text-[16px] font-bold tabular-nums">{panel.lvl.lvl}</div></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Inheritance</div><div className="text-slate-700 mt-1">{panel.lvl.note}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Authority Levels</div><div className="text-slate-700 mt-1">Owner → BU GRC → CISO → Risk Committee · escalations follow severity.</div></div>
                  </div>
                )}

                {panel.kind === "exc" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", EX_TONE[panel.e.state])}>{panel.e.state}</span>
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", RISK_TONE[panel.e.risk])}>{panel.e.risk}</span>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Business Justification</div><div className="text-slate-700 mt-1">Operational continuity for {panel.e.scope} pending modernization milestone.</div></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Owner</div><div className="font-bold">{panel.e.owner}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Expires</div><div className="font-bold">{panel.e.expires}</div></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Compensating Controls</div><div className="text-slate-700 mt-1">{panel.e.comp}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Approval Chain</div><div className="text-slate-700 mt-1">{panel.e.chain}</div></div>
                  </div>
                )}

                {panel.kind === "viol" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", RISK_TONE[panel.v.risk])}>{panel.v.risk}</span>
                      <span className="font-mono text-[11px] text-slate-500">{panel.v.id}</span>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Violation</div><div className="text-slate-700 mt-1">{panel.v.cat} on {panel.v.svc}</div></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Region</div><div className="font-bold">{panel.v.region}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Owner</div><div className="font-bold">{panel.v.owner}</div></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Compliance Impact</div><div className="text-slate-700 mt-1">{panel.v.impact}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Remediation Plan</div><div className="text-slate-700 mt-1">Coworker dispatched · auto-remediation in progress · ETA 4h.</div></div>
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
