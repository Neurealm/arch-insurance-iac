import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Bell, BookCheck, Bot, Briefcase, Building2, Cog, FileSearch, FileText,
  GitBranch, Globe, HelpCircle, LayoutDashboard, Package, Plug, RefreshCw,
  ScrollText, Scale, Search, ServerCog, ShieldAlert, ShieldCheck, UserCog, Sparkles,
  ChevronRight, AlertTriangle, CheckCircle2, Eye, FileBadge, Zap,
  TrendingUp, Users, ClipboardCheck, Download, Archive, FileCheck2, Award, ShieldQuestion,
  PenTool, Fingerprint, Link2, History,
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
    { id: "com", label: "Compliance Center", icon: BookCheck, to: "/enterprise-certificate-management/compliance-center" },
    { id: "audit", label: "Audit & Evidence", icon: FileSearch, to: "/enterprise-certificate-management/audit-evidence", active: true },
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
      <div className="m-3 p-4 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
        <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Audit Response</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">4 min</span>
          <span className="text-xs opacity-80">avg</span>
        </div>
        <div className="text-xs opacity-90">249K records · 6 frameworks</div>
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
          <h1 className="text-[18px] font-bold text-slate-900 truncate">Enterprise Audit & Evidence Center</h1>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" /> Continuous Evidence Stream
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input placeholder="Search evidence, controls, attestations" className="pl-8 pr-3 h-8 w-72 text-[12px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 outline-none" />
        </div>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 inline-flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> Build Audit Package</button>
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
type Domain = { id: string; label: string; icon: any; color: string; score: number; trend: string; count: number; findings: number; coverage: number; coworkers: string[]; desc: string; };
const DOMAINS: Domain[] = [
  { id: "control",  label: "Control Evidence",     icon: ClipboardCheck, color: "from-blue-500 to-indigo-600",   score: 99.4, trend: "+0.6", count: 84200,  findings: 2, coverage: 99.8, coworkers: ["PKI Compliance Auditor"],                            desc: "Evidence supporting all certificate-related controls." },
  { id: "change",   label: "Change Evidence",      icon: GitBranch,      color: "from-emerald-500 to-teal-600",  score: 99.1, trend: "+0.4", count: 38400,  findings: 1, coverage: 99.6, coworkers: ["Change Coordinator","PKI Compliance Auditor"],       desc: "Every certificate change captured end-to-end." },
  { id: "approval", label: "Approval Evidence",    icon: PenTool,        color: "from-violet-500 to-purple-600", score: 99.6, trend: "+0.3", count: 18420,  findings: 0, coverage: 99.9, coworkers: ["Approval Workflow Bot"],                              desc: "Signed approvals with full chain of custody." },
  { id: "deploy",   label: "Deployment Evidence",  icon: ServerCog,      color: "from-cyan-500 to-blue-600",     score: 98.9, trend: "+1.1", count: 46200,  findings: 1, coverage: 99.4, coworkers: ["Cert Deployment Engineer"],                          desc: "Renewals, rotations, rollouts proven per endpoint." },
  { id: "valid",    label: "Validation Evidence",  icon: CheckCircle2,   color: "from-emerald-500 to-green-600", score: 99.2, trend: "+0.7", count: 62100,  findings: 0, coverage: 99.7, coworkers: ["Validation Bot"],                                     desc: "Post-deploy validation and continuous health checks." },
  { id: "sec",      label: "Security Evidence",    icon: ShieldCheck,    color: "from-rose-500 to-red-600",      score: 98.7, trend: "+0.8", count: 24800,  findings: 0, coverage: 99.2, coworkers: ["Sec Investigation Analyst"],                          desc: "Investigations, CT-log discoveries, key handling." },
  { id: "comp",     label: "Compliance Evidence",  icon: BookCheck,      color: "from-amber-500 to-orange-600",  score: 99.0, trend: "+0.5", count: 28200,  findings: 0, coverage: 99.5, coworkers: ["PKI Compliance Auditor"],                            desc: "Framework-aligned evidence ready for regulators." },
  { id: "op",       label: "Operational Evidence", icon: Activity,       color: "from-sky-500 to-blue-600",      score: 99.3, trend: "+0.2", count: 96400,  findings: 0, coverage: 99.8, coworkers: ["Operations Bot"],                                     desc: "Run logs, telemetry, ITSM tickets, audit trails." },
];

// ============== EVIDENCE REPO ==============
const EVIDENCE = [
  { id: "inv",    name: "Certificate Inventory",   count: 248320, updated: "8s ago",    coverage: 99.9, usage: "PCI · SOC2 · NIST · ISO", frameworks: ["PCI","SOC2","NIST","ISO"] },
  { id: "iss",    name: "Certificate Issuance",    count: 41840,  updated: "12s ago",   coverage: 99.8, usage: "PCI · SOC2",              frameworks: ["PCI","SOC2"] },
  { id: "ren",    name: "Certificate Renewal",     count: 38420,  updated: "22s ago",   coverage: 99.7, usage: "PCI · NIST",              frameworks: ["PCI","NIST"] },
  { id: "rev",    name: "Certificate Revocation",  count: 2480,   updated: "1m ago",    coverage: 100,  usage: "PCI · ISO · GDPR",        frameworks: ["PCI","ISO","GDPR"] },
  { id: "dep",    name: "Certificate Deployment",  count: 46200,  updated: "8s ago",    coverage: 99.4, usage: "SOC2 · NIST",             frameworks: ["SOC2","NIST"] },
  { id: "val",    name: "Validation Records",      count: 62100,  updated: "14s ago",   coverage: 99.7, usage: "All Frameworks",          frameworks: ["PCI","SOC2","NIST","ISO","HIPAA","GDPR"] },
  { id: "chg",    name: "Change Records",          count: 8420,   updated: "32s ago",   coverage: 99.6, usage: "SOC2 · NIST · ISO",       frameworks: ["SOC2","NIST","ISO"] },
  { id: "appr",   name: "Approval Records",        count: 18420,  updated: "44s ago",   coverage: 99.9, usage: "SOC2 · ISO",              frameworks: ["SOC2","ISO"] },
  { id: "own",    name: "Ownership Records",       count: 4240,   updated: "2m ago",    coverage: 96.8, usage: "ISO · NIST",              frameworks: ["ISO","NIST"] },
  { id: "inv2",   name: "Security Investigations", count: 612,    updated: "5m ago",    coverage: 100,  usage: "SOC2 · NIST",             frameworks: ["SOC2","NIST"] },
  { id: "exc",    name: "Policy Exceptions",       count: 27,     updated: "12m ago",   coverage: 100,  usage: "All Frameworks",          frameworks: ["PCI","SOC2","NIST","ISO","HIPAA","GDPR"] },
  { id: "rpt",    name: "Compliance Reports",      count: 2840,   updated: "2m ago",    coverage: 99.8, usage: "All Frameworks",          frameworks: ["PCI","SOC2","NIST","ISO","HIPAA","GDPR"] },
  { id: "aud",    name: "Audit Reports",           count: 500,    updated: "9m ago",    coverage: 99.9, usage: "Board · Internal · Ext.", frameworks: ["PCI","SOC2","NIST","ISO","HIPAA","GDPR"] },
];

// ============== AUDIT PACKAGES ==============
const PACKAGES = [
  { name: "PCI-DSS Audit Package",     date: "Today 09:42",   evid: 41240, ctrl: 412, ready: 99.6, color: "from-rose-500 to-red-600" },
  { name: "SOC 2 Audit Package",       date: "Today 08:18",   evid: 38120, ctrl: 318, ready: 99.1, color: "from-blue-500 to-indigo-600" },
  { name: "NIST 800-53 Audit Package", date: "Yesterday",     evid: 84200, ctrl: 942, ready: 98.4, color: "from-violet-500 to-purple-600" },
  { name: "ISO 27001 Audit Package",   date: "Yesterday",     evid: 14820, ctrl: 112, ready: 99.2, color: "from-emerald-500 to-teal-600" },
  { name: "HIPAA Audit Package",       date: "2 days ago",    evid: 9420,  ctrl: 84,  ready: 99.9, color: "from-cyan-500 to-blue-600" },
  { name: "Board Audit Package",       date: "Last week",     evid: 1240,  ctrl: 48,  ready: 100,  color: "from-amber-500 to-orange-600" },
  { name: "Internal Audit Package",    date: "Last week",     evid: 8420,  ctrl: 142, ready: 99.4, color: "from-sky-500 to-blue-600" },
];

// ============== CONTROL EVIDENCE MATRIX ==============
const FAMILIES = ["Certificate Ownership","Certificate Expiration","Renewal Controls","Key Management","Revocation Controls","Change Controls","Monitoring Controls","Incident Response","Issuance Controls","Audit Logging"];
const COLS = ["Evidence Available","Evidence Missing","Validation","Audit Usage"] as const;
function matrixCell(fam: string, col: string) {
  const i = FAMILIES.indexOf(fam);
  if (col === "Evidence Available") return [142,118,96,88,124,110,102,156,128,114][i] || 100;
  if (col === "Evidence Missing")   return [0,1,0,2,0,1,0,0,1,0][i] || 0;
  if (col === "Validation")         return ["Pass","Pass","Pass","Warn","Pass","Pass","Pass","Pass","Pass","Pass"][i];
  return ["PCI·SOC2·ISO","PCI·NIST","PCI·NIST","NIST·ISO","PCI·GDPR","SOC2·NIST","SOC2·NIST","NIST·SOC2","PCI·SOC2","All"][i];
}
const VAL_TONE: any = { Pass: "bg-emerald-500 text-white", Warn: "bg-amber-400 text-amber-900", Fail: "bg-rose-500 text-white" };

// ============== CHAIN OF CUSTODY ==============
const CHAIN = [
  { step: "Risk Analysis",   who: "Cert Risk Analyst (bot)",  when: "T-7d 09:12", what: "Cert CN=api.payments.acme.com flagged for renewal", tone: "bg-violet-500" },
  { step: "Approval",        who: "M. Hossain · Sec Lead",    when: "T-6d 14:22", what: "Renewal approved · ticket CRQ-44218",               tone: "bg-blue-500" },
  { step: "Issuance",        who: "DigiCert · ACME",          when: "T-5d 10:01", what: "Cert issued · serial 0x4a92…f1c · RSA-3072",        tone: "bg-cyan-500" },
  { step: "Deployment",      who: "Cert Deployment Engineer", when: "T-5d 23:14", what: "Rotated across 142 endpoints · zero downtime",      tone: "bg-emerald-500" },
  { step: "Validation",      who: "Validation Bot",           when: "T-5d 23:21", what: "TLS handshake validated · chain trusted",           tone: "bg-teal-500" },
  { step: "Audit Record",    who: "PKI Compliance Auditor",   when: "T-5d 23:24", what: "Evidence packaged · mapped to PCI 4.0.1 · 3.6",     tone: "bg-amber-500" },
  { step: "Attestation",     who: "S. Chen · CISO",           when: "T-5d 23:48", what: "E-signed attestation · SHA-256 hash anchored",      tone: "bg-rose-500" },
];

// ============== TRACEABILITY (svc graph) ==============
const TRACE_NODES = [
  { id: "svc",   label: "Payments Service",    x: 50, y: 50, ring: "fill-violet-600", r: 32 },
  { id: "app1",  label: "Checkout API",        x: 18, y: 18, ring: "fill-blue-500",   r: 18 },
  { id: "app2",  label: "Mobile Gateway",      x: 82, y: 18, ring: "fill-blue-500",   r: 18 },
  { id: "cert1", label: "TLS · api.pay",       x: 8,  y: 50, ring: "fill-cyan-500",   r: 14 },
  { id: "cert2", label: "TLS · mgw.pay",       x: 92, y: 50, ring: "fill-cyan-500",   r: 14 },
  { id: "chg",   label: "Change CRQ-44218",    x: 18, y: 82, ring: "fill-emerald-500",r: 14 },
  { id: "appr",  label: "Approval #18420",     x: 50, y: 88, ring: "fill-amber-500",  r: 14 },
  { id: "ctl",   label: "PCI 4.0.1 · 3.6",     x: 82, y: 82, ring: "fill-rose-500",   r: 14 },
];
const TRACE_EDGES = [
  ["svc","app1"],["svc","app2"],["app1","cert1"],["app2","cert2"],["svc","chg"],["svc","appr"],["svc","ctl"],
  ["cert1","ctl"],["cert2","ctl"],["chg","appr"],
];

// ============== AUTOMATION ==============
const AUTOMATIONS = [
  { name: "Evidence Collection",     runs: 248320, success: 99.7, saved: 12480, last: "4s ago" },
  { name: "Control Mapping",         runs: 142800, success: 99.8, saved: 8420,  last: "11s ago" },
  { name: "Audit Package Generation",runs: 500,    success: 100,  saved: 9620,  last: "12m ago" },
  { name: "Traceability Validation", runs: 84200,  success: 99.9, saved: 4280,  last: "6s ago" },
  { name: "Approval Tracking",       runs: 18420,  success: 100,  saved: 2120,  last: "1m ago" },
  { name: "Attestation Workflow",    runs: 1240,   success: 99.9, saved: 1080,  last: "8m ago" },
  { name: "Chain of Custody Hash",   runs: 249000, success: 100,  saved: 880,   last: "2s ago" },
];

// ============== COWORKERS ==============
const COWORKERS = [
  { name: "PKI Compliance Auditor",        role: "Controls, evidence, packaging", evid: 188400, ctrl: 1240, req: 412, hours: 12480, conf: 99, status: "Refreshing PCI audit package" },
  { name: "Certificate Discovery Engineer",role: "Inventory & ownership evidence",evid: 248320, ctrl: 188,  req: 142, hours: 6420,  conf: 98, status: "Resolving 12 unknown owners" },
  { name: "Certificate Risk Analyst",      role: "Risk evidence & scoring",       evid: 24800,  ctrl: 412,  req: 318, hours: 4280,  conf: 97, status: "Scoring 1.2K renewal candidates" },
  { name: "Renewal Coordinator",           role: "Lifecycle evidence",            evid: 38420,  ctrl: 96,   req: 84,  hours: 9620,  conf: 99, status: "Validating renewal evidence" },
  { name: "Security Investigation Analyst",role: "Incident & investigation evidence", evid: 612, ctrl: 62, req: 27,  hours: 5200,  conf: 96, status: "Closing 3 investigations" },
];

// ============== TIMELINE ==============
const TIMELINE = [
  { t: "09:42", k: "package",  ev: "PCI-DSS audit package generated · 41,240 evidence records · 412 controls" },
  { t: "09:34", k: "evidence", ev: "Evidence captured · 142 renewal validations · ACME-CA" },
  { t: "09:21", k: "control",  ev: "Control PCI 3.6.1 validated · auto-pass · 248 endpoints" },
  { t: "09:08", k: "audit",    ev: "External auditor opened request · auto-prefilled in 4 min" },
  { t: "08:52", k: "attest",   ev: "CISO attestation e-signed · hash anchored to evidence ledger" },
  { t: "08:34", k: "exception",ev: "Exception EX-0421 reviewed · compensating control validated" },
  { t: "08:18", k: "package",  ev: "SOC 2 audit package refreshed · 38,120 records" },
  { t: "08:02", k: "fail",     ev: "Missing evidence detected on 4 ownership records · coworker dispatched" },
];
const TIMELINE_TONE: any = {
  package: "bg-violet-500", evidence: "bg-cyan-500", control: "bg-emerald-500",
  audit: "bg-blue-500", attest: "bg-rose-500", exception: "bg-amber-500", fail: "bg-orange-500",
};

// ============== TRENDS ==============
const T_EVID_GROWTH = [{m:"Jan",v:142},{m:"Feb",v:168},{m:"Mar",v:188},{m:"Apr",v:206},{m:"May",v:222},{m:"Jun",v:238},{m:"Jul",v:249}];
const T_READINESS   = [{m:"Jan",v:94.2},{m:"Feb",v:95.8},{m:"Mar",v:96.6},{m:"Apr",v:97.4},{m:"May",v:98.2},{m:"Jun",v:98.8},{m:"Jul",v:99.2}];
const T_CTRL_VAL    = [{m:"Jan",v:96.2},{m:"Feb",v:97.1},{m:"Mar",v:97.8},{m:"Apr",v:98.3},{m:"May",v:98.7},{m:"Jun",v:99.0},{m:"Jul",v:99.1}];
const T_PKG_USE     = [{m:"Jan",v:38},{m:"Feb",v:62},{m:"Mar",v:118},{m:"Apr",v:212},{m:"May",v:318},{m:"Jun",v:422},{m:"Jul",v:500}];
const T_MISSING     = [{m:"Jan",v:142},{m:"Feb",v:96},{m:"Mar",v:64},{m:"Apr",v:38},{m:"May",v:18},{m:"Jun",v:8},{m:"Jul",v:4}];
const T_RESPONSE    = [{m:"Jan",v:72},{m:"Feb",v:48},{m:"Mar",v:32},{m:"Apr",v:18},{m:"May",v:12},{m:"Jun",v:6},{m:"Jul",v:4}];

// ============== ATTESTATIONS ==============
const ATTESTATIONS = [
  { id: "AT-1192", scope: "PCI-DSS · Q3 Cert Controls",   owner: "S. Chen · CISO",     state: "Signed",   sig: "0x9f4a…3c12", date: "Today 09:48", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: "AT-1191", scope: "SOC 2 · Trust Services CC6",    owner: "M. Patel · Audit",   state: "Signed",   sig: "0x44ea…8910", date: "Today 08:22", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: "AT-1190", scope: "Digital Coworker · PKI Auditor",owner: "PKI Compliance Bot", state: "Auto",     sig: "0x12bd…ff10", date: "Today 07:14", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { id: "AT-1189", scope: "ISO 27001 · Annex A.10",        owner: "L. García · GRC",    state: "Pending",  sig: "—",            date: "Awaiting", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "AT-1188", scope: "HIPAA · §164.312",              owner: "T. Nakamura · CMO",  state: "Signed",   sig: "0x83af…1402", date: "Yesterday", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: "AT-1187", scope: "Board Quarterly Attestation",   owner: "Board Committee",    state: "Signed",   sig: "0x66c1…aa44", date: "Last week", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

// ============== EXCEPTIONS ==============
const EXCEPTIONS = [
  { id: "MX-0021", area: "Ownership Records",        missing: "4 records · Mfg EU plants",       risk: "Medium", impact: "ISO 27001 · A.10",  plan: "Coworker dispatched · 24h SLA" },
  { id: "MX-0022", area: "Deployment Evidence",      missing: "1 record · Legacy EDI gateway",   risk: "Low",    impact: "SOC 2 · CC6.1",     plan: "Capture queued · next change window" },
  { id: "MX-0023", area: "Validation Evidence",      missing: "Awaiting handshake telemetry x2", risk: "Low",    impact: "NIST · SC-12",      plan: "Telemetry pipeline auto-replaying" },
  { id: "MX-0024", area: "Approval Records",         missing: "1 verbal approval needs ratify",  risk: "Low",    impact: "SOC 2 · CC8.1",     plan: "E-signature request sent" },
];

// ============== PANEL TYPES ==============
type Panel =
  | { kind: "domain"; d: Domain }
  | { kind: "evidence"; e: typeof EVIDENCE[number] }
  | { kind: "package"; p: typeof PACKAGES[number] }
  | { kind: "control"; f: string }
  | { kind: "chain" }
  | { kind: "exception"; e: typeof EXCEPTIONS[number] }
  | { kind: "attest"; a: typeof ATTESTATIONS[number] }
  | null;

const RISK_TONE: any = { Critical: "bg-rose-100 text-rose-700 border-rose-200", High: "bg-orange-100 text-orange-700 border-orange-200", Medium: "bg-amber-100 text-amber-700 border-amber-200", Low: "bg-emerald-100 text-emerald-700 border-emerald-200" };

// ============== PAGE ==============
export default function AuditEvidenceCenter() {
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
                <h2 className="text-[15px] font-bold text-slate-900">Continuous evidence · continuous defensibility</h2>
              </div>
              <span className="text-[11px] text-slate-500">Updated 4 seconds ago</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <KpiCard icon={FileCheck2}    label="Evidence Records"           value={249000} accent="bg-gradient-to-r from-violet-400 to-purple-600" trend="+38K last 30d" />
              <KpiCard icon={ClipboardCheck}label="Controls Supported"         value={1240}   accent="bg-gradient-to-r from-blue-400 to-indigo-600"   trend="100% mapped" />
              <KpiCard icon={Archive}       label="Audit Packages Generated"   value={500}    accent="bg-gradient-to-r from-cyan-400 to-blue-600"     trend="+118 last qtr" />
              <KpiCard icon={FileBadge}     label="Audit Readiness"            value={99.2}   suffix="%" decimals={1} accent="bg-gradient-to-r from-emerald-400 to-teal-600" trend="+5.0 vs LY" />
              <KpiCard icon={Link2}         label="Traceability Coverage"      value={99.8}   suffix="%" decimals={1} accent="bg-gradient-to-r from-teal-400 to-emerald-600" trend="+1.4 vs Q2" />
              <KpiCard icon={AlertTriangle} label="Missing Evidence"           value={4}      accent="bg-gradient-to-r from-rose-400 to-rose-600"     trend="−138 last qtr" />
              <KpiCard icon={Bot}           label="Digital Coworker Contribs"  value={38000}  accent="bg-gradient-to-r from-violet-400 to-fuchsia-500" trend="94% automated" />
              <KpiCard icon={History}       label="Avg Audit Response"         value={4}      suffix=" min" accent="bg-gradient-to-r from-blue-400 to-cyan-500"   trend="−68 min vs LY" />
              <KpiCard icon={Zap}           label="Evidence Automation"        value={94}     suffix="%" accent="bg-gradient-to-r from-amber-400 to-orange-500"  trend="+12% vs LY" />
              <KpiCard icon={CheckCircle2}  label="Control Validation Success" value={99.1}   suffix="%" decimals={1} accent="bg-gradient-to-r from-emerald-400 to-green-600" trend="+0.9 vs Q2" />
            </div>
          </section>

          {/* ===== AUDIT READINESS COMMAND CENTER ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Audit Readiness Command Center</div>
                <h2 className="text-[15px] font-bold text-slate-900">Eight evidence domains · click to drill in</h2>
              </div>
              <span className="text-[11px] text-slate-500 inline-flex items-center gap-1"><Bot className="h-3.5 w-3.5" /> Coworkers continuously collecting</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
                    <div className="rounded-lg bg-slate-50 p-2"><div className="text-[9px] uppercase font-bold text-slate-500">Score</div><div className="text-[15px] font-bold tabular-nums">{d.score}%</div></div>
                    <div className="rounded-lg bg-slate-50 p-2"><div className="text-[9px] uppercase font-bold text-slate-500">Records</div><div className="text-[15px] font-bold tabular-nums">{d.count.toLocaleString()}</div></div>
                    <div className="rounded-lg bg-slate-50 p-2"><div className="text-[9px] uppercase font-bold text-slate-500">Findings</div><div className="text-[15px] font-bold tabular-nums">{d.findings}</div></div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Coverage {d.coverage}%</span>
                    <span className="text-emerald-600 font-semibold">▲ {d.trend}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* ===== EVIDENCE REPO + AUDIT PACKAGES ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Evidence Repository</div>
                  <h2 className="text-[15px] font-bold text-slate-900">All evidence categories · indexed, hashed, mapped</h2>
                </div>
                <button className="text-[11px] font-semibold text-blue-700 inline-flex items-center gap-1">Export Index <ChevronRight className="h-3 w-3" /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead><tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 font-semibold">Category</th>
                    <th className="py-2 font-semibold text-right">Records</th>
                    <th className="py-2 font-semibold text-right">Coverage</th>
                    <th className="py-2 font-semibold">Last Updated</th>
                    <th className="py-2 font-semibold">Audit Usage</th>
                  </tr></thead>
                  <tbody>
                    {EVIDENCE.map((e) => (
                      <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                          onClick={() => setPanel({ kind: "evidence", e })}>
                        <td className="py-2 font-semibold text-slate-900 inline-flex items-center gap-2"><Fingerprint className="h-3.5 w-3.5 text-violet-500" />{e.name}</td>
                        <td className="py-2 text-right tabular-nums">{e.count.toLocaleString()}</td>
                        <td className="py-2 text-right tabular-nums text-emerald-700 font-semibold">{e.coverage}%</td>
                        <td className="py-2 text-slate-500">{e.updated}</td>
                        <td className="py-2"><div className="flex flex-wrap gap-1">{e.frameworks.map(f => <span key={f} className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">{f}</span>)}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Audit Package Builder</div>
                  <h2 className="text-[15px] font-bold text-slate-900">One-click regulator-ready bundles</h2>
                </div>
              </div>
              <div className="space-y-2">
                {PACKAGES.map((p) => (
                  <motion.button key={p.name} whileHover={{ x: 2 }} onClick={() => setPanel({ kind: "package", p })}
                    className="w-full text-left rounded-xl border border-slate-200 p-3 hover:shadow-md transition flex items-center gap-3">
                    <div className={cn("h-9 w-9 rounded-lg grid place-items-center text-white bg-gradient-to-br", p.color)}><Archive className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-slate-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-500">{p.date} · {p.ctrl} controls · {p.evid.toLocaleString()} records</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-bold tabular-nums text-emerald-700">{p.ready}%</div>
                      <div className="text-[9px] text-slate-500 uppercase">Ready</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          {/* ===== CHAIN OF CUSTODY + TRACEABILITY GRAPH ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Chain of Custody</div>
                  <h2 className="text-[15px] font-bold text-slate-900">api.payments.acme.com renewal · end-to-end</h2>
                </div>
                <button onClick={() => setPanel({ kind: "chain" })} className="text-[11px] font-semibold text-blue-700 inline-flex items-center gap-1">Open trail <ChevronRight className="h-3 w-3" /></button>
              </div>
              <ol className="relative border-l-2 border-slate-200 ml-2 space-y-3">
                {CHAIN.map((s, i) => (
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

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Evidence Traceability Graph</div>
                  <h2 className="text-[15px] font-bold text-slate-900">Payments service → certs · changes · controls</h2>
                </div>
                <span className="text-[10px] text-slate-500">Auto-mapped</span>
              </div>
              <div className="relative aspect-[4/3] rounded-xl bg-gradient-to-br from-slate-50 to-violet-50/40 border border-slate-100 overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                  {TRACE_EDGES.map(([a, b], i) => {
                    const na = TRACE_NODES.find(n => n.id === a)!;
                    const nb = TRACE_NODES.find(n => n.id === b)!;
                    return <motion.line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                      stroke="rgb(148 163 184)" strokeWidth={0.3} strokeDasharray="1 1"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: i * 0.05 }} />;
                  })}
                  {TRACE_NODES.map((n, i) => (
                    <g key={n.id}>
                      <motion.circle cx={n.x} cy={n.y} r={n.r / 6} className={n.ring}
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.05, type: "spring", stiffness: 180 }} />
                      <text x={n.x} y={n.y + n.r / 6 + 3} textAnchor="middle" className="fill-slate-600" style={{ fontSize: 2.4, fontWeight: 600 }}>{n.label}</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-600" />Business Service</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />Application</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-500" />Certificate</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Change</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Approval</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Control</span>
              </div>
            </div>
          </section>

          {/* ===== CONTROL EVIDENCE MATRIX ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Control Evidence Matrix</div>
                <h2 className="text-[15px] font-bold text-slate-900">Control families × evidence state</h2>
              </div>
              <span className="text-[10px] text-slate-500">Click a row for evidence details</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead><tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 font-semibold">Control Family</th>
                  {COLS.map(c => <th key={c} className="py-2 font-semibold text-center">{c}</th>)}
                </tr></thead>
                <tbody>
                  {FAMILIES.map((fam) => (
                    <tr key={fam} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setPanel({ kind: "control", f: fam })}>
                      <td className="py-2 font-semibold text-slate-900">{fam}</td>
                      <td className="py-2 text-center"><span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold tabular-nums">{matrixCell(fam,"Evidence Available") as number}</span></td>
                      <td className="py-2 text-center"><span className={cn("inline-block px-2 py-0.5 rounded font-bold tabular-nums", (matrixCell(fam,"Evidence Missing") as number) > 0 ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-400")}>{matrixCell(fam,"Evidence Missing") as number}</span></td>
                      <td className="py-2 text-center"><span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase", VAL_TONE[matrixCell(fam,"Validation") as string])}>{matrixCell(fam,"Validation") as string}</span></td>
                      <td className="py-2 text-center text-slate-600 text-[11px]">{matrixCell(fam,"Audit Usage") as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ===== EVIDENCE AUTOMATION + DIGITAL AUDIT WORKFORCE ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Evidence Automation Center</div>
              <h2 className="text-[15px] font-bold text-slate-900 mb-3">Automatically generated evidence streams</h2>
              <div className="space-y-2">
                {AUTOMATIONS.map((a) => (
                  <div key={a.name} className="rounded-lg border border-slate-200 p-3 hover:shadow-sm transition">
                    <div className="flex items-center justify-between">
                      <div className="text-[12px] font-bold text-slate-900">{a.name}</div>
                      <div className="text-[10px] text-slate-500">{a.last}</div>
                    </div>
                    <div className="mt-1 grid grid-cols-3 gap-2 text-[10px]">
                      <div><div className="text-slate-500 uppercase font-bold">Runs</div><div className="font-bold tabular-nums">{a.runs.toLocaleString()}</div></div>
                      <div><div className="text-slate-500 uppercase font-bold">Success</div><div className="font-bold tabular-nums text-emerald-700">{a.success}%</div></div>
                      <div><div className="text-slate-500 uppercase font-bold">Hours saved</div><div className="font-bold tabular-nums">{a.saved.toLocaleString()}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Digital Audit Workforce</div>
                  <h2 className="text-[15px] font-bold text-slate-900">Coworkers generating evidence right now</h2>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"><span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" /> Live</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead><tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 font-semibold">Coworker</th>
                    <th className="py-2 font-semibold">Role</th>
                    <th className="py-2 font-semibold text-right">Evidence</th>
                    <th className="py-2 font-semibold text-right">Controls</th>
                    <th className="py-2 font-semibold text-right">Audit Requests</th>
                    <th className="py-2 font-semibold text-right">Hrs Saved</th>
                    <th className="py-2 font-semibold text-right">Conf</th>
                    <th className="py-2 font-semibold">Current Activity</th>
                  </tr></thead>
                  <tbody>
                    {COWORKERS.map((c) => (
                      <tr key={c.name} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 font-bold text-slate-900 inline-flex items-center gap-2"><Bot className="h-3.5 w-3.5 text-violet-500" />{c.name}</td>
                        <td className="py-2 text-slate-600">{c.role}</td>
                        <td className="py-2 text-right tabular-nums">{c.evid.toLocaleString()}</td>
                        <td className="py-2 text-right tabular-nums">{c.ctrl.toLocaleString()}</td>
                        <td className="py-2 text-right tabular-nums">{c.req.toLocaleString()}</td>
                        <td className="py-2 text-right tabular-nums">{c.hours.toLocaleString()}</td>
                        <td className="py-2 text-right tabular-nums text-emerald-700 font-semibold">{c.conf}%</td>
                        <td className="py-2 text-slate-600 text-[11px]">{c.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ===== ATTESTATION CENTER + EXCEPTIONS ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Attestation Center</div>
                  <h2 className="text-[15px] font-bold text-slate-900">Electronic signoffs · cryptographically anchored</h2>
                </div>
                <button className="text-[11px] font-semibold text-blue-700 inline-flex items-center gap-1">All attestations <ChevronRight className="h-3 w-3" /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead><tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 font-semibold">ID</th>
                    <th className="py-2 font-semibold">Scope</th>
                    <th className="py-2 font-semibold">Owner</th>
                    <th className="py-2 font-semibold">State</th>
                    <th className="py-2 font-semibold">Signature</th>
                    <th className="py-2 font-semibold">When</th>
                  </tr></thead>
                  <tbody>
                    {ATTESTATIONS.map((a) => (
                      <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setPanel({ kind: "attest", a })}>
                        <td className="py-2 font-mono text-[11px] text-slate-500">{a.id}</td>
                        <td className="py-2 font-semibold text-slate-900">{a.scope}</td>
                        <td className="py-2 text-slate-600">{a.owner}</td>
                        <td className="py-2"><span className={cn("inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border", a.color)}>{a.state}</span></td>
                        <td className="py-2 font-mono text-[11px] text-slate-500">{a.sig}</td>
                        <td className="py-2 text-slate-500 text-[11px]">{a.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Missing Evidence · Exceptions</div>
                  <h2 className="text-[15px] font-bold text-slate-900">4 open · all remediating</h2>
                </div>
                <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-bold uppercase">4 open</span>
              </div>
              <div className="space-y-2">
                {EXCEPTIONS.map((e) => (
                  <button key={e.id} onClick={() => setPanel({ kind: "exception", e })}
                    className="w-full text-left rounded-lg border border-slate-200 p-3 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div className="text-[12px] font-bold text-slate-900">{e.area}</div>
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", RISK_TONE[e.risk])}>{e.risk}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{e.missing}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{e.impact} · {e.plan}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ===== AUDIT TIMELINE ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Audit Timeline</div>
                <h2 className="text-[15px] font-bold text-slate-900">Continuous activity stream · today</h2>
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

          {/* ===== EXECUTIVE ANALYTICS ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Executive Analytics</div>
                <h2 className="text-[15px] font-bold text-slate-900">Evidence, readiness, and audit response trends</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: "Evidence Growth (K)", data: T_EVID_GROWTH, c1: "#7c3aed", c2: "#7c3aed" },
                { title: "Audit Readiness %",   data: T_READINESS,   c1: "#059669", c2: "#10b981" },
                { title: "Control Validation %", data: T_CTRL_VAL,    c1: "#2563eb", c2: "#3b82f6" },
                { title: "Audit Packages",      data: T_PKG_USE,     c1: "#0891b2", c2: "#06b6d4" },
                { title: "Missing Evidence",    data: T_MISSING,     c1: "#e11d48", c2: "#fb7185" },
                { title: "Avg Audit Response (min)", data: T_RESPONSE, c1: "#d97706", c2: "#f59e0b" },
              ].map((t) => (
                <div key={t.title} className="rounded-xl border border-slate-200 p-3">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t.title}</div>
                  <div className="h-32">
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
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">Executive Outcomes</div>
                <h2 className="text-[16px] font-bold">Before vs after Neurealm RunOps</h2>
              </div>
              <Award className="h-6 w-6 text-white/80" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { l: "Audit Readiness",         v: "99.2%",   b: "62%" },
                { l: "Evidence Records",        v: "249,000", b: "12,000" },
                { l: "Audit Packages Generated",v: "500",     b: "8" },
                { l: "Traceability Coverage",   v: "99.8%",   b: "48%" },
                { l: "Avg Audit Response",      v: "4 min",   b: "3 wks" },
                { l: "Hours Saved",             v: "38,000",  b: "—" },
                { l: "Business Services Protected", v: "500", b: "180" },
                { l: "Revenue Protected",       v: "$1.2B",   b: "$420M" },
              ].map((o) => (
                <div key={o.l} className="rounded-xl bg-white/10 border border-white/20 p-3 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-wider text-white/70 font-bold">{o.l}</div>
                  <div className="text-[20px] font-bold mt-0.5">{o.v}</div>
                  <div className="text-[10px] text-white/70">Before: {o.b}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="text-center text-[11px] text-slate-400 py-4">Neurealm RunOps · Enterprise Audit & Evidence Center · Continuous evidence · continuous defensibility</div>
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
                    {panel.kind === "domain" && panel.d.label}
                    {panel.kind === "evidence" && panel.e.name}
                    {panel.kind === "package" && panel.p.name}
                    {panel.kind === "control" && panel.f}
                    {panel.kind === "chain" && "Chain of Custody · api.payments.acme.com"}
                    {panel.kind === "exception" && `Missing Evidence · ${panel.e.area}`}
                    {panel.kind === "attest" && `${panel.a.id} · ${panel.a.scope}`}
                  </SheetTitle>
                </SheetHeader>

                {panel.kind === "domain" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Executive Summary</div>
                      <div className="mt-1 text-slate-700">{panel.d.desc}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Score</div><div className="text-[16px] font-bold tabular-nums">{panel.d.score}%</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Records</div><div className="text-[16px] font-bold tabular-nums">{panel.d.count.toLocaleString()}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Coverage</div><div className="text-[16px] font-bold tabular-nums">{panel.d.coverage}%</div></div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Digital Coworker Contributions</div>
                      <div className="flex flex-wrap gap-1.5">{panel.d.coworkers.map(c => <span key={c} className="text-[11px] bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-semibold">{c}</span>)}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Findings & Exceptions</div>
                      <div className="text-[12px] text-slate-700">{panel.d.findings} open finding(s) · all under remediation SLA</div>
                    </div>
                  </div>
                )}

                {panel.kind === "evidence" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Records</div><div className="text-[16px] font-bold tabular-nums">{panel.e.count.toLocaleString()}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Coverage</div><div className="text-[16px] font-bold tabular-nums">{panel.e.coverage}%</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Updated</div><div className="text-[16px] font-bold">{panel.e.updated}</div></div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Framework Mapping</div>
                      <div className="flex flex-wrap gap-1.5">{panel.e.frameworks.map(f => <span key={f} className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">{f}</span>)}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Audit Usage</div>
                      <div className="text-slate-700 mt-1">{panel.e.usage}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Integrity</div>
                      <div className="text-slate-700 mt-1 font-mono text-[11px]">SHA-256 · anchored to evidence ledger · tamper-evident</div>
                    </div>
                  </div>
                )}

                {panel.kind === "package" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Controls</div><div className="text-[16px] font-bold tabular-nums">{panel.p.ctrl}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Evidence</div><div className="text-[16px] font-bold tabular-nums">{panel.p.evid.toLocaleString()}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Ready</div><div className="text-[16px] font-bold tabular-nums text-emerald-700">{panel.p.ready}%</div></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Generated</div>
                      <div className="text-slate-700">{panel.p.date}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 h-8 text-[12px] font-semibold rounded-lg bg-violet-600 text-white inline-flex items-center justify-center gap-1.5"><Download className="h-3.5 w-3.5" /> Export PDF</button>
                      <button className="flex-1 h-8 text-[12px] font-semibold rounded-lg border border-slate-200 inline-flex items-center justify-center gap-1.5"><Archive className="h-3.5 w-3.5" /> Export ZIP</button>
                    </div>
                  </div>
                )}

                {panel.kind === "control" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Control Description</div>
                      <div className="text-slate-700 mt-1">Evidence and validation supporting the <strong>{panel.f}</strong> control family across the certificate ecosystem.</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Available</div><div className="text-[16px] font-bold tabular-nums text-emerald-700">{matrixCell(panel.f, "Evidence Available") as number}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">Missing</div><div className="text-[16px] font-bold tabular-nums">{matrixCell(panel.f, "Evidence Missing") as number}</div></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Audit Usage</div>
                      <div className="text-slate-700 mt-1">{matrixCell(panel.f, "Audit Usage") as string}</div>
                    </div>
                  </div>
                )}

                {panel.kind === "chain" && (
                  <div className="space-y-2 text-[12px]">
                    {CHAIN.map((s, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-900">{s.step}</div>
                          <div className="text-[10px] text-slate-500 tabular-nums">{s.when}</div>
                        </div>
                        <div className="text-slate-700 text-[11px] mt-0.5">{s.what}</div>
                        <div className="text-[10px] text-slate-400">{s.who}</div>
                      </div>
                    ))}
                  </div>
                )}

                {panel.kind === "exception" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="flex items-center gap-2"><span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", RISK_TONE[panel.e.risk])}>{panel.e.risk}</span><span className="font-mono text-[11px] text-slate-500">{panel.e.id}</span></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Missing Evidence</div><div className="text-slate-700 mt-1">{panel.e.missing}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Control Impact</div><div className="text-slate-700 mt-1">{panel.e.impact}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-[10px] uppercase font-bold text-slate-500">Remediation Plan</div><div className="text-slate-700 mt-1">{panel.e.plan}</div></div>
                  </div>
                )}

                {panel.kind === "attest" && (
                  <div className="space-y-3 text-[12px]">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Owner</div>
                      <div className="text-slate-700 mt-1">{panel.a.owner}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">State</div><div className="font-bold">{panel.a.state}</div></div>
                      <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] uppercase font-bold text-slate-500">When</div><div className="font-bold">{panel.a.date}</div></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Cryptographic Signature</div>
                      <div className="text-slate-700 mt-1 font-mono text-[11px]">{panel.a.sig}</div>
                    </div>
                    <button className="w-full h-8 text-[12px] font-semibold rounded-lg bg-violet-600 text-white inline-flex items-center justify-center gap-1.5"><Download className="h-3.5 w-3.5" /> Export attestation</button>
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
