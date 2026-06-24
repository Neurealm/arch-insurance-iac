import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Bell, BookCheck, Bot, Briefcase, Building2, Cog, FileSearch, FileText,
  GitBranch, Globe, HelpCircle, KeyRound, LayoutDashboard, Package, Plug, RefreshCw,
  ScrollText, Scale, Search, ServerCog, ShieldAlert, ShieldCheck, UserCog, Sparkles,
  X, ChevronRight, AlertTriangle, CheckCircle2, DollarSign, Eye, Lock, Radar, Zap,
  TrendingUp, AlertOctagon, Users, Fingerprint, Cpu, Atom, Network, Siren, Crosshair,
  ShieldOff, Layers, ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  AreaChart, Area, LineChart, Line, RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// ============== SIDEBAR (parity with sibling pages) ==============
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
    { id: "sec", label: "Security Posture", icon: ShieldCheck, to: "/enterprise-certificate-management/security-posture", active: true },
    { id: "com", label: "Compliance Center", icon: BookCheck, to: "/enterprise-certificate-management/compliance-center" },
    { id: "audit", label: "Audit & Evidence", icon: FileSearch, to: "/enterprise-certificate-management/audit-evidence" },
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
      <div className="m-3 p-4 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-700 text-white">
        <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Trust Integrity</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">97.1</span>
          <span className="text-xs opacity-80">Score</span>
        </div>
        <div className="text-xs opacity-90">96.4 posture · 99.7% policy</div>
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
          <h1 className="text-[18px] font-bold text-slate-900 truncate">Enterprise Security Posture Center</h1>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live SOC
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
            <Crosshair className="h-3 w-3" /> Cyber Ops
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input placeholder="Search certificates, findings, issuers" className="pl-8 pr-3 h-8 w-72 text-[12px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 outline-none" />
        </div>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> Trigger Investigation</button>
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
      {trend && (
        <div className="mt-1.5 text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> {trend}
        </div>
      )}
    </motion.div>
  );
}

// ============== RISK DOMAINS ==============
type Domain = {
  id: string; label: string; icon: any; color: string; score: number; trend: string;
  findings: number; impact: string; coworkers: string[]; desc: string;
};
const DOMAINS: Domain[] = [
  { id: "crypto", label: "Cryptographic Risk", icon: KeyRound, color: "from-rose-500 to-red-600", score: 84, trend: "+3.2", findings: 110, impact: "318 quantum-vulnerable certs", coworkers: ["Cryptography Advisor","Cert Risk Analyst"], desc: "Weak algorithms, RSA-1024, SHA-1, deprecated cipher suites." },
  { id: "trust",  label: "Trust Relationships", icon: Network,  color: "from-violet-500 to-purple-600", score: 97, trend: "+1.4", findings: 8, impact: "12 broken chains across 4 intermediates", coworkers: ["PKI Compliance Auditor"], desc: "Root and intermediate CA trust graph integrity." },
  { id: "expose", label: "Certificate Exposure", icon: Eye,     color: "from-amber-500 to-orange-600", score: 91, trend: "+2.1", findings: 47, impact: "143 shadow certs in 22 services", coworkers: ["Cert Risk Analyst"], desc: "Shadow, self-signed, unmanaged and externally-issued certs." },
  { id: "ident",  label: "Identity & Ownership", icon: Fingerprint, color: "from-blue-500 to-indigo-600", score: 96, trend: "+0.8", findings: 22, impact: "98% ownership coverage", coworkers: ["PKI Compliance Auditor"], desc: "Owners, accountability, lifecycle stewardship of every cert." },
  { id: "threat", label: "Threat Activity", icon: Crosshair, color: "from-slate-700 to-slate-900", score: 93, trend: "+4.6", findings: 14, impact: "2 unauthorized issuances · 4 keys", coworkers: ["Security Investigation Analyst"], desc: "CT-log signals, compromised keys, certificate abuse." },
  { id: "comp",   label: "Compliance Risk", icon: BookCheck, color: "from-emerald-500 to-teal-600", score: 99, trend: "+0.4", findings: 6, impact: "0 audit-blocking exceptions", coworkers: ["PKI Compliance Auditor"], desc: "PCI, SOC2, NIST, ISO27001, HIPAA, GDPR exposure." },
];

// ============== CRYPTO HEATMAP ==============
const CRYPTO_HEAT = [
  { algo: "RSA 1024", count: 14,   level: 4 },
  { algo: "RSA 2048", count: 8420, level: 1 },
  { algo: "RSA 4096", count: 3120, level: 0 },
  { algo: "ECDSA P-256", count: 12480, level: 0 },
  { algo: "ECDSA P-384", count: 2840, level: 0 },
  { algo: "SHA-1",     count: 17,   level: 4 },
  { algo: "SHA-256",   count: 21800, level: 0 },
  { algo: "SHA-384",   count: 3420, level: 0 },
  { algo: "DES/3DES",  count: 6,    level: 4 },
  { algo: "MD5",       count: 2,    level: 4 },
  { algo: "TLS 1.0",   count: 38,   level: 3 },
  { algo: "TLS 1.2",   count: 18200, level: 1 },
  { algo: "TLS 1.3",   count: 14600, level: 0 },
  { algo: "Quantum-Vuln", count: 318, level: 3 },
];
const HEAT_BG = ["bg-emerald-100 text-emerald-800 border-emerald-200","bg-lime-100 text-lime-800 border-lime-200","bg-amber-100 text-amber-800 border-amber-200","bg-orange-100 text-orange-800 border-orange-200","bg-rose-200 text-rose-900 border-rose-300"];

// ============== TRUST GRAPH ==============
const ROOTS = [
  { id: "dc", label: "DigiCert Global Root G2", trusted: true, issued: 82400 },
  { id: "ms", label: "Microsoft Root Authority", trusted: true, issued: 48200 },
  { id: "et", label: "Entrust Root CA",          trusted: true, issued: 24100 },
  { id: "ip", label: "Internal Corp Root",       trusted: true, issued: 31400, warn: true },
  { id: "un", label: "Unknown Issuer (CT-1402)", trusted: false, issued: 12 },
];
const INTS = [
  { id: "i1", root: "dc", label: "DigiCert TLS Hybrid ECC", state: "ok",      certs: 38200 },
  { id: "i2", root: "dc", label: "DigiCert SHA2 Secure",    state: "ok",      certs: 22100 },
  { id: "i3", root: "ms", label: "Internal Issuing CA-01",  state: "ok",      certs: 18420 },
  { id: "i4", root: "ms", label: "Internal Issuing CA-02",  state: "expired", certs: 4200 },
  { id: "i5", root: "et", label: "Entrust L1K",             state: "ok",      certs: 12480 },
  { id: "i6", root: "ip", label: "Legacy Internal Sub-CA",  state: "broken",  certs: 2840 },
  { id: "i7", root: "un", label: "—",                       state: "untrust", certs: 12 },
];

// ============== UNAUTHORIZED ISSUANCE ==============
const UNAUTH = [
  { issuer: "Let's Encrypt", domain: "checkout-prod-eu.bank.example", risk: "Critical", time: "12m ago", impact: "Customer checkout · PCI scope" },
  { issuer: "ZeroSSL",        domain: "api-internal-mfg.example",     risk: "Critical", time: "1h 04m",  impact: "Manufacturing API · OT bridge" },
  { issuer: "Sectigo (CT)",   domain: "marketing.example",            risk: "Medium",   time: "3h 22m",  impact: "Marketing microsite" },
  { issuer: "Unknown",        domain: "*.lab.example",                risk: "High",     time: "6h 18m",  impact: "R&D lab subnet" },
];
const RISK_COLOR: any = { Critical: "bg-rose-100 text-rose-700 border-rose-200", High: "bg-orange-100 text-orange-700 border-orange-200", Medium: "bg-amber-100 text-amber-700 border-amber-200", Low: "bg-emerald-100 text-emerald-700 border-emerald-200" };

// ============== COMPROMISED KEYS ==============
const COMPROMISED = [
  { id: "K-2811", subject: "payments-gw.bank.example",   svc: "Payments Gateway",    apps: 4, customers: 1240000, blast: 92, status: "Rotating", eta: "1h 12m" },
  { id: "K-2812", subject: "iam-sso.example",            svc: "Enterprise SSO",      apps: 28, customers: 82000,  blast: 88, status: "Rotated",  eta: "—" },
  { id: "K-2813", subject: "edi-clearinghouse.example",  svc: "Claims EDI",          apps: 6, customers: 412000, blast: 81, status: "Rotating", eta: "32m" },
  { id: "K-2814", subject: "factory-mes-eu.example",     svc: "Mfg MES (EU)",        apps: 9, customers: 0,      blast: 74, status: "Contained",eta: "—" },
];

// ============== SHADOW CERTS ==============
const SHADOW = [
  { found: "Today",   subject: "internal-jira.example",       risk: "Medium",   owner: "Unknown", impact: "Eng productivity" },
  { found: "Today",   subject: "test-mock-api.example",       risk: "Low",      owner: "QA Team", impact: "Non-prod" },
  { found: "Yesterday", subject: "vpn-legacy.example",        risk: "High",     owner: "Unknown", impact: "Remote access" },
  { found: "2d ago",  subject: "vendor-portal-x.example",     risk: "Critical", owner: "Vendor",  impact: "Supplier integration" },
  { found: "3d ago",  subject: "report-export.example",       risk: "Medium",   owner: "Finance", impact: "Reg reporting" },
];

// ============== SECURITY TIMELINE ==============
const TIMELINE = [
  { t: "09:42", src: "Sentinel",   ev: "Certificate Abuse pattern matched on payments-gw",  sev: "Critical" },
  { t: "09:38", src: "Coworker",   ev: "Security Investigation Analyst opened case INV-4421", sev: "Info" },
  { t: "09:21", src: "CT Logs",    ev: "Unexpected issuance: api-internal-mfg.example",     sev: "Critical" },
  { t: "09:14", src: "CrowdStrike",ev: "Endpoint anomaly · private-key file accessed",      sev: "High" },
  { t: "08:58", src: "Wiz",        ev: "Public S3 holding .pfx detected · auto-quarantined",sev: "High" },
  { t: "08:46", src: "Coworker",   ev: "Cryptography Advisor flagged 17 SHA-1 certs",       sev: "Medium" },
  { t: "08:30", src: "Defender",   ev: "Trust chain warning: Internal Issuing CA-02 expired", sev: "High" },
  { t: "08:12", src: "Splunk",     ev: "Policy violation: self-signed cert in prod ingress", sev: "Medium" },
];
const SEV_COLOR: any = { Critical: "bg-rose-500", High: "bg-orange-500", Medium: "bg-amber-500", Info: "bg-blue-500" };

// ============== TRENDS ==============
const TREND_POSTURE = [{m:"Jan",v:88},{m:"Feb",v:90},{m:"Mar",v:91},{m:"Apr",v:92},{m:"May",v:94},{m:"Jun",v:95},{m:"Jul",v:96.4}];
const TREND_TRUST = [{m:"Jan",v:92},{m:"Feb",v:93},{m:"Mar",v:94},{m:"Apr",v:95},{m:"May",v:96},{m:"Jun",v:96.7},{m:"Jul",v:97.1}];
const TREND_QUANTUM = [{m:"Jan",v:42},{m:"Feb",v:48},{m:"Mar",v:53},{m:"Apr",v:58},{m:"May",v:62},{m:"Jun",v:65},{m:"Jul",v:68}];
const TREND_COMPLIANCE = [{m:"Jan",v:96.8},{m:"Feb",v:97.2},{m:"Mar",v:97.6},{m:"Apr",v:98.4},{m:"May",v:98.9},{m:"Jun",v:99.4},{m:"Jul",v:99.7}];
const TREND_COMPROMISE = [{m:"Jan",v:11},{m:"Feb",v:9},{m:"Mar",v:8},{m:"Apr",v:6},{m:"May",v:5},{m:"Jun",v:4},{m:"Jul",v:4}];
const TREND_ABUSE = [{m:"Jan",v:18},{m:"Feb",v:14},{m:"Mar",v:11},{m:"Apr",v:9},{m:"May",v:7},{m:"Jun",v:5},{m:"Jul",v:4}];

// ============== AUTOMATIONS ==============
const AUTOMATIONS = [
  { name: "Shadow Certificate Detection",   runs: 14820, success: 99.4, saved: 4280, last: "12s ago" },
  { name: "CT-Log Transparency Monitoring", runs: 88600, success: 99.9, saved: 2140, last: "4s ago" },
  { name: "Weak Algorithm Detection",       runs: 24180, success: 99.7, saved: 1820, last: "32s ago" },
  { name: "Compromised Key Response",       runs: 412,   success: 100,  saved: 612,  last: "2m ago" },
  { name: "Compliance Continuous Monitor",  runs: 18420, success: 99.6, saved: 1980, last: "8s ago" },
  { name: "Trust Chain Validation",         runs: 62100, success: 99.8, saved: 920,  last: "6s ago" },
];

// ============== HEAT MAP — REGION × SERVICE ==============
const REGIONS = ["NA","EU","UK","APAC","LATAM","ME"];
const SERVICES = ["Payments","Customer Portal","Mobile","API Edge","Healthcare","Manufacturing","Trading","Back-Office"];
function riskCell(r: string, s: string) {
  const seed = (r.charCodeAt(0) + s.charCodeAt(0)) % 5;
  const score = [4, 12, 22, 38, 64][seed];
  return score;
}
function cellTone(n: number) {
  if (n >= 50) return "bg-rose-500 text-white";
  if (n >= 30) return "bg-orange-400 text-white";
  if (n >= 15) return "bg-amber-300 text-amber-900";
  if (n >= 5)  return "bg-lime-300 text-lime-900";
  return "bg-emerald-300 text-emerald-900";
}

// ============== COWORKERS ==============
const COWORKERS = [
  { name: "Security Investigation Analyst", role: "Forensics & triage", findings: 148, conf: 97, escal: 4, status: "Investigating INV-4421" },
  { name: "Certificate Risk Analyst",       role: "Exposure scoring",   findings: 412, conf: 96, escal: 2, status: "Scoring 1.2K new findings" },
  { name: "Cryptography Advisor",           role: "Algorithm modernization", findings: 96,  conf: 98, escal: 1, status: "Planning SHA-1 retirement" },
  { name: "PKI Compliance Auditor",         role: "Policy & evidence",  findings: 62,  conf: 99, escal: 0, status: "Refreshing PCI evidence" },
];

// ============== COMPLIANCE FRAMEWORKS ==============
const FRAMEWORKS = [
  { f: "PCI-DSS",   score: 99.7, viol: 1, audit: "Ready",  evid: "Fresh",   excpt: 0 },
  { f: "SOC 2",     score: 99.4, viol: 2, audit: "Ready",  evid: "Fresh",   excpt: 1 },
  { f: "NIST 800-53", score: 98.6, viol: 6, audit: "Ready",evid: "Fresh",   excpt: 2 },
  { f: "ISO 27001", score: 99.1, viol: 3, audit: "Ready",  evid: "Fresh",   excpt: 0 },
  { f: "HIPAA",     score: 99.8, viol: 0, audit: "Ready",  evid: "Fresh",   excpt: 0 },
  { f: "GDPR",      score: 99.2, viol: 2, audit: "Ready",  evid: "Fresh",   excpt: 1 },
];

// ============== PANEL TYPES ==============
type Panel =
  | { kind: "domain", d: Domain }
  | { kind: "unauth", row: typeof UNAUTH[number] }
  | { kind: "compromise", row: typeof COMPROMISED[number] }
  | { kind: "shadow", row: typeof SHADOW[number] }
  | null;

// ============== PAGE ==============
export default function SecurityPostureCenter() {
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
                <h2 className="text-[15px] font-bold text-slate-900">Enterprise trust fabric — live</h2>
              </div>
              <span className="text-[11px] text-slate-500">Updated 4 seconds ago</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <KpiCard icon={ShieldCheck}  label="Security Posture Score" value={96.4} decimals={1} accent="bg-gradient-to-r from-emerald-400 to-emerald-600" trend="+2.1 vs last qtr" />
              <KpiCard icon={BookCheck}    label="Policy Compliance"      value={99.7} suffix="%" decimals={1} accent="bg-gradient-to-r from-emerald-400 to-teal-600" trend="+0.4 vs last qtr" />
              <KpiCard icon={AlertTriangle}label="Weak Algorithms"        value={93}  accent="bg-gradient-to-r from-amber-400 to-orange-500"  trend="−18 last 30d" />
              <KpiCard icon={AlertOctagon} label="SHA-1 Certificates"     value={17}  accent="bg-gradient-to-r from-orange-400 to-rose-500"   trend="−6 last 30d" />
              <KpiCard icon={KeyRound}     label="Compromised Keys"       value={4}   accent="bg-gradient-to-r from-rose-500 to-red-600"      trend="all in rotation" />
              <KpiCard icon={ShieldAlert}  label="Unauthorized Issuances" value={2}   accent="bg-gradient-to-r from-rose-500 to-red-700"      trend="contained <15m" />
              <KpiCard icon={Eye}          label="Shadow Certificates"    value={143} accent="bg-gradient-to-r from-amber-400 to-orange-500"  trend="−22 last 7d" />
              <KpiCard icon={Siren}        label="Critical-Risk Certs"    value={380} accent="bg-gradient-to-r from-rose-400 to-rose-600"     trend="−42 last 30d" />
              <KpiCard icon={Atom}         label="Quantum Readiness"      value={68}  suffix="%" accent="bg-gradient-to-r from-violet-500 to-fuchsia-600" trend="+6% last qtr" />
              <KpiCard icon={Fingerprint}  label="Trust Integrity Score"  value={97.1} decimals={1} accent="bg-gradient-to-r from-blue-500 to-indigo-600" trend="+0.7 vs last qtr" />
            </div>
          </section>

          {/* ===== RISK COMMAND CENTER ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Security Risk Command Center</div>
                <h2 className="text-[15px] font-bold text-slate-900">Six security domains across the certificate ecosystem</h2>
              </div>
              <span className="text-[11px] text-slate-500 inline-flex items-center gap-1"><Radar className="h-3.5 w-3.5" /> Continuous monitoring · click a domain</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {DOMAINS.map((d) => (
                <motion.button
                  key={d.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setPanel({ kind: "domain", d })}
                  className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:shadow-lg transition group"
                >
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
                    <div className="rounded-lg bg-slate-50 p-2">
                      <div className="text-[9px] uppercase font-bold text-slate-500">Score</div>
                      <div className="text-[16px] font-bold tabular-nums">{d.score}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <div className="text-[9px] uppercase font-bold text-slate-500">Trend</div>
                      <div className="text-[16px] font-bold tabular-nums text-emerald-600">{d.trend}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <div className="text-[9px] uppercase font-bold text-slate-500">Findings</div>
                      <div className="text-[16px] font-bold tabular-nums">{d.findings}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-600"><span className="font-semibold text-slate-800">Impact:</span> {d.impact}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {d.coworkers.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5">
                        <Bot className="h-3 w-3" /> {c}
                      </span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* ===== CRYPTO HEATMAP + TRUST GRAPH ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cryptographic Risk</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Algorithm & Cipher Posture</h3>
                </div>
                <Cpu className="h-4 w-4 text-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CRYPTO_HEAT.map((c) => (
                  <motion.div key={c.algo} whileHover={{ scale: 1.02 }}
                    className={cn("rounded-lg border p-2.5", HEAT_BG[c.level])}>
                    <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">{c.algo}</div>
                    <div className="text-[18px] font-bold tabular-nums">{c.count.toLocaleString()}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 text-[11px] text-slate-600 flex items-center gap-3">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-300" /> Safe</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-300" /> Watch</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-orange-400" /> Deprecate</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-rose-300" /> Critical</span>
              </div>
            </div>

            <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Trust Chain Visualization</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Roots → Intermediates → Services</h3>
                </div>
                <span className="text-[11px] text-slate-500 inline-flex items-center gap-1"><Network className="h-3.5 w-3.5" /> Live trust graph</span>
              </div>
              <div className="relative h-[280px] overflow-hidden rounded-xl border border-slate-200 bg-white">
                <svg viewBox="0 0 800 280" className="absolute inset-0 w-full h-full">
                  {/* animated dependency paths */}
                  {INTS.map((i, idx) => {
                    const r = ROOTS.findIndex((x) => x.id === i.root);
                    const rx = 120, ry = 40 + r * 50;
                    const ix = 420, iy = 30 + idx * 32;
                    const sx = 720, sy = 30 + idx * 32;
                    const color =
                      i.state === "broken" ? "#f43f5e" :
                      i.state === "expired" ? "#f97316" :
                      i.state === "untrust" ? "#ef4444" : "#3b82f6";
                    return (
                      <g key={i.id}>
                        <path d={`M${rx},${ry} C260,${ry} 280,${iy} ${ix},${iy}`} stroke={color} strokeWidth={i.state === "ok" ? 1.5 : 2} fill="none" strokeDasharray={i.state === "ok" ? "0" : "5 4"} opacity={0.85}>
                          {i.state === "ok" && (
                            <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="6s" repeatCount="indefinite" />
                          )}
                        </path>
                        <path d={`M${ix},${iy} L${sx},${sy}`} stroke={color} strokeWidth={1.2} fill="none" opacity={0.55} />
                      </g>
                    );
                  })}
                </svg>
                {/* Roots */}
                <div className="absolute left-2 top-2 bottom-2 flex flex-col justify-around">
                  {ROOTS.map((r) => (
                    <div key={r.id} className={cn(
                      "w-[200px] rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold bg-white shadow-sm",
                      r.trusted ? (r.warn ? "border-amber-300 text-amber-800" : "border-emerald-300 text-emerald-800") : "border-rose-300 text-rose-700"
                    )}>
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate">{r.label}</span>
                        {r.trusted ? (r.warn ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />) : <ShieldOff className="h-3 w-3" />}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">{r.issued.toLocaleString()} certs</div>
                    </div>
                  ))}
                </div>
                {/* Intermediates */}
                <div className="absolute left-1/2 top-2 bottom-2 -translate-x-1/2 flex flex-col justify-around">
                  {INTS.map((i) => (
                    <div key={i.id} className={cn(
                      "w-[180px] rounded-lg border px-2 py-1 text-[10.5px] font-semibold bg-white shadow-sm",
                      i.state === "ok" ? "border-blue-200 text-blue-800" :
                      i.state === "expired" ? "border-orange-300 text-orange-800" :
                      i.state === "broken" ? "border-rose-300 text-rose-800" : "border-rose-400 text-rose-900"
                    )}>
                      <div className="truncate">{i.label}</div>
                      <div className="text-[9.5px] text-slate-500 font-normal flex justify-between">
                        <span>{i.certs.toLocaleString()} certs</span>
                        <span className="uppercase">{i.state}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Services column */}
                <div className="absolute right-2 top-2 bottom-2 flex flex-col justify-around">
                  {INTS.map((i, idx) => (
                    <div key={i.id} className="w-[70px] rounded-lg border border-slate-200 bg-slate-50 text-[10px] text-center py-1 font-semibold text-slate-700">
                      Svc {idx + 1}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-blue-500" /> Trusted</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-orange-500" /> Expired intermediate</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-rose-500" /> Broken / Untrusted</span>
              </div>
            </div>
          </section>

          {/* ===== UNAUTHORIZED ISSUANCE + COMPROMISED KEYS ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">CT-Log Transparency Monitoring</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Unauthorized Issuance Detected · 2 Critical</h3>
                </div>
                <ScrollText className="h-4 w-4 text-slate-400" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                      <th className="text-left py-2 px-2">Issuer</th>
                      <th className="text-left py-2 px-2">Domain</th>
                      <th className="text-left py-2 px-2">Risk</th>
                      <th className="text-left py-2 px-2">Discovered</th>
                      <th className="text-left py-2 px-2">Impact</th>
                      <th className="py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {UNAUTH.map((u) => (
                      <tr key={u.domain} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setPanel({ kind: "unauth", row: u })}>
                        <td className="py-2 px-2 font-semibold text-slate-800">{u.issuer}</td>
                        <td className="py-2 px-2 font-mono text-[11px] text-slate-700 truncate max-w-[180px]">{u.domain}</td>
                        <td className="py-2 px-2"><span className={cn("inline-flex items-center text-[10px] font-bold uppercase border rounded-full px-1.5 py-0.5", RISK_COLOR[u.risk])}>{u.risk}</span></td>
                        <td className="py-2 px-2 text-slate-600">{u.time}</td>
                        <td className="py-2 px-2 text-slate-600 truncate max-w-[170px]">{u.impact}</td>
                        <td className="py-2 px-2 text-right"><ChevronRight className="h-3.5 w-3.5 text-slate-300 inline" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Compromised Key Investigation</div>
                  <h3 className="text-[14px] font-bold text-slate-900">4 keys · blast radius & rotation</h3>
                </div>
                <KeyRound className="h-4 w-4 text-slate-400" />
              </div>
              <div className="space-y-2">
                {COMPROMISED.map((k) => (
                  <motion.button key={k.id} whileHover={{ x: 2 }} onClick={() => setPanel({ kind: "compromise", row: k })}
                    className="w-full text-left rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm bg-white p-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-rose-50 grid place-items-center text-rose-600 shrink-0"><KeyRound className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-[12.5px] text-slate-800 truncate">{k.id} · {k.svc}</div>
                        <span className={cn("text-[10px] font-bold uppercase rounded-full px-1.5 py-0.5 border",
                          k.status === "Rotated" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          k.status === "Contained" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-amber-50 text-amber-700 border-amber-200"
                        )}>{k.status}{k.eta !== "—" ? ` · ETA ${k.eta}` : ""}</span>
                      </div>
                      <div className="text-[10.5px] font-mono text-slate-500 truncate">{k.subject}</div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-rose-500" style={{ width: `${k.blast}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 tabular-nums w-8 text-right">{k.blast}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">{k.apps} apps · {k.customers.toLocaleString()} customers</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          {/* ===== SHADOW + TIMELINE ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Shadow Certificate Discovery</div>
                  <h3 className="text-[14px] font-bold text-slate-900">143 ungoverned certificates</h3>
                </div>
                <Eye className="h-4 w-4 text-slate-400" />
              </div>
              <div className="space-y-2">
                {SHADOW.map((s) => (
                  <button key={s.subject} onClick={() => setPanel({ kind: "shadow", row: s })}
                    className="w-full text-left rounded-lg border border-slate-200 hover:bg-slate-50 p-2.5 flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full shrink-0",
                      s.risk === "Critical" ? "bg-rose-500" : s.risk === "High" ? "bg-orange-500" : s.risk === "Medium" ? "bg-amber-500" : "bg-emerald-500")} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-mono text-slate-800 truncate">{s.subject}</div>
                      <div className="text-[10.5px] text-slate-500">{s.found} · owner {s.owner} · {s.impact}</div>
                    </div>
                    <span className={cn("text-[10px] font-bold uppercase border rounded-full px-1.5 py-0.5", RISK_COLOR[s.risk])}>{s.risk}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Security Intelligence Timeline</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Correlated findings · SIEM · CT · Endpoint · Coworkers</h3>
                </div>
                <span className="text-[11px] text-slate-500 inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Streaming</span>
              </div>
              <ol className="relative pl-4 space-y-2.5 before:absolute before:left-1 before:top-1 before:bottom-1 before:w-px before:bg-slate-200">
                {TIMELINE.map((t, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="relative">
                    <span className={cn("absolute -left-[14px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white", SEV_COLOR[t.sev])} />
                    <div className="flex items-center gap-3 text-[12px]">
                      <span className="text-[10px] font-mono text-slate-400 w-12 shrink-0">{t.t}</span>
                      <span className="text-[10px] font-bold uppercase text-slate-500 w-20 shrink-0">{t.src}</span>
                      <span className="text-slate-800 flex-1">{t.ev}</span>
                      <span className={cn("text-[10px] font-bold uppercase rounded-full px-1.5 py-0.5",
                        t.sev === "Critical" ? "bg-rose-100 text-rose-700" :
                        t.sev === "High" ? "bg-orange-100 text-orange-700" :
                        t.sev === "Medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      )}>{t.sev}</span>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </section>

          {/* ===== HEAT MAP + COWORKERS ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Enterprise Risk Heat Map</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Risk by Region × Business Service</h3>
                </div>
                <span className="text-[11px] text-slate-500">Findings count per cell</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-1">
                  <thead>
                    <tr>
                      <th className="text-[10px] text-slate-500 font-semibold uppercase text-left w-32"></th>
                      {SERVICES.map((s) => (
                        <th key={s} className="text-[10px] text-slate-500 font-semibold uppercase text-center px-1">{s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {REGIONS.map((r) => (
                      <tr key={r}>
                        <td className="text-[11px] font-bold text-slate-700 pr-2">{r}</td>
                        {SERVICES.map((s) => {
                          const n = riskCell(r, s);
                          return (
                            <td key={s} className="text-center">
                              <motion.div whileHover={{ scale: 1.1 }} className={cn("rounded-md text-[11px] font-bold py-2 tabular-nums", cellTone(n))}>
                                {n}
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
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-emerald-300" /> Low</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-lime-300" /> Watch</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-amber-300" /> Elevated</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-orange-400" /> High</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-rose-500" /> Critical</span>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Digital Security Workforce</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Active coworkers · investigations</h3>
                </div>
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              <div className="space-y-2">
                {COWORKERS.map((c) => (
                  <div key={c.name} className="rounded-lg border border-slate-200 p-3 bg-gradient-to-r from-white to-violet-50/30">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-bold text-slate-900 truncate">{c.name}</div>
                        <div className="text-[10.5px] text-slate-500">{c.role}</div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                      <div className="rounded bg-slate-50 py-1"><div className="text-[9px] uppercase font-bold text-slate-500">Findings</div><div className="text-[12px] font-bold tabular-nums">{c.findings}</div></div>
                      <div className="rounded bg-slate-50 py-1"><div className="text-[9px] uppercase font-bold text-slate-500">Conf</div><div className="text-[12px] font-bold tabular-nums">{c.conf}%</div></div>
                      <div className="rounded bg-slate-50 py-1"><div className="text-[9px] uppercase font-bold text-slate-500">Escal</div><div className="text-[12px] font-bold tabular-nums">{c.escal}</div></div>
                    </div>
                    <div className="mt-1.5 text-[10.5px] text-slate-600 italic">⟶ {c.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== QUANTUM + COMPLIANCE ===== */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50/40 to-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Quantum Readiness Center</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Post-quantum migration posture</h3>
                </div>
                <Atom className="h-4 w-4 text-violet-500" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-32 w-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="65%" outerRadius="100%" data={[{ name: "Q", value: 68, fill: "url(#quantum)" }]} startAngle={90} endAngle={-270}>
                      <defs>
                        <linearGradient id="quantum" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#d946ef" />
                        </linearGradient>
                      </defs>
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar background={{ fill: "#f1f5f9" }} dataKey="value" cornerRadius={20} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="-mt-[88px] text-center pointer-events-none">
                    <div className="text-[22px] font-bold text-violet-700 tabular-nums">68%</div>
                    <div className="text-[9px] uppercase font-bold text-slate-500">Quantum Ready</div>
                  </div>
                </div>
                <div className="flex-1 space-y-1.5 text-[11.5px]">
                  {[
                    ["RSA Inventory", "31,840", "text-amber-700"],
                    ["ECC Adoption", "15,320", "text-emerald-700"],
                    ["Quantum-Vulnerable Certs", "318", "text-rose-700"],
                    ["Modernization Pipeline", "1,420 in flight", "text-blue-700"],
                    ["Target Readiness (Q4)", "85%", "text-violet-700"],
                  ].map(([k, v, c]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-slate-600">{k}</span>
                      <span className={cn("font-bold tabular-nums", c)}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-violet-200 bg-white p-2.5 text-[10.5px] text-slate-700">
                <span className="font-bold text-violet-700">Roadmap:</span> Hybrid TLS pilot (Q3) → ML-KEM/Dilithium rollout for tier-1 services (Q4) → Full inventory crossover (FY+1).
              </div>
            </div>

            <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Compliance Exposure Center</div>
                  <h3 className="text-[14px] font-bold text-slate-900">Frameworks · controls · audit readiness</h3>
                </div>
                <BookCheck className="h-4 w-4 text-slate-400" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                      <th className="text-left py-2 px-2">Framework</th>
                      <th className="text-left py-2 px-2">Score</th>
                      <th className="text-left py-2 px-2">Violations</th>
                      <th className="text-left py-2 px-2">Audit</th>
                      <th className="text-left py-2 px-2">Evidence</th>
                      <th className="text-left py-2 px-2">Exceptions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FRAMEWORKS.map((f) => (
                      <tr key={f.f} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-2 font-bold text-slate-800">{f.f}</td>
                        <td className="py-2 px-2"><div className="flex items-center gap-2"><div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${f.score}%` }} /></div><span className="text-[11px] font-bold tabular-nums text-emerald-700">{f.score}%</span></div></td>
                        <td className="py-2 px-2 tabular-nums">{f.viol}</td>
                        <td className="py-2 px-2"><span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-1.5 py-0.5">{f.audit}</span></td>
                        <td className="py-2 px-2"><span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-1.5 py-0.5">{f.evid}</span></td>
                        <td className="py-2 px-2 tabular-nums">{f.excpt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ===== EXECUTIVE ANALYTICS ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Executive Analytics</div>
                <h2 className="text-[15px] font-bold text-slate-900">Security trends · last 7 quarters</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <TrendCard title="Security Posture" data={TREND_POSTURE} color="#10b981" suffix="" />
              <TrendCard title="Trust Integrity" data={TREND_TRUST} color="#3b82f6" suffix="" />
              <TrendCard title="Quantum Readiness" data={TREND_QUANTUM} color="#8b5cf6" suffix="%" />
              <TrendCard title="Compliance" data={TREND_COMPLIANCE} color="#14b8a6" suffix="%" />
              <TrendCard title="Compromised Keys" data={TREND_COMPROMISE} color="#f43f5e" suffix="" invert />
              <TrendCard title="Certificate Abuse" data={TREND_ABUSE} color="#f97316" suffix="" invert />
            </div>
          </section>

          {/* ===== AUTOMATION LAYER ===== */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Security Automation Layer</div>
                <h2 className="text-[15px] font-bold text-slate-900">Always-on protective automations</h2>
              </div>
              <span className="text-[11px] text-slate-500">12,752 hours saved / qtr</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {AUTOMATIONS.map((a) => (
                <div key={a.name} className="rounded-xl border border-slate-200 p-3 hover:shadow-sm transition">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 grid place-items-center text-blue-600"><Zap className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-bold text-slate-900 truncate">{a.name}</div>
                      <div className="text-[10.5px] text-slate-500">Last run {a.last}</div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                    <div className="rounded bg-slate-50 py-1"><div className="text-[9px] uppercase font-bold text-slate-500">Runs</div><div className="text-[12px] font-bold tabular-nums">{a.runs.toLocaleString()}</div></div>
                    <div className="rounded bg-slate-50 py-1"><div className="text-[9px] uppercase font-bold text-slate-500">Success</div><div className="text-[12px] font-bold tabular-nums text-emerald-700">{a.success}%</div></div>
                    <div className="rounded bg-slate-50 py-1"><div className="text-[9px] uppercase font-bold text-slate-500">Hrs Saved</div><div className="text-[12px] font-bold tabular-nums">{a.saved}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== EXECUTIVE OUTCOMES ===== */}
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">Executive Outcomes</div>
                <h2 className="text-[18px] font-bold">Business value created by Neurealm RunOps · this quarter</h2>
              </div>
              <ShieldCheck className="h-7 w-7 opacity-80" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Critical Findings Resolved", "96%", CheckCircle2],
                ["Unauthorized Issuances Detected", "2", ShieldAlert],
                ["Compromised Keys Remediated", "4", KeyRound],
                ["Shadow Certificates Identified", "143", Eye],
                ["Trust Integrity", "97.1%", Fingerprint],
                ["Policy Compliance", "99.7%", BookCheck],
                ["Revenue Protected", "$12.4M", DollarSign],
                ["Business Services Protected", "500", Briefcase],
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
                <div className="opacity-90">Reactive PKI, no CT monitoring, hidden shadow inventory, manual key rotation, audit-by-screenshot.</div>
              </div>
              <div className="rounded-xl bg-white/15 border border-white/30 p-3">
                <div className="font-bold uppercase tracking-wider text-[10px] opacity-80 mb-1">With RunOps</div>
                <div>Continuous trust assurance · live CT correlation · automated rotation · always-fresh compliance evidence · 96% findings resolved.</div>
              </div>
            </div>
          </section>

          <p className="text-center text-[11px] text-slate-400 pb-4">
            Neurealm RunOps · Enterprise Security Posture Center · Continuously protecting the enterprise trust fabric
          </p>
        </div>
      </div>

      {/* ============== RIGHT-SIDE CONTEXTUAL PANEL ============== */}
      <Sheet open={open} onOpenChange={(o) => !o && setPanel(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[560px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-[15px]">{panelTitle(panel)}</SheetTitle>
          </SheetHeader>
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
  if (p.kind === "domain") return `${p.d.label} · Security Workspace`;
  if (p.kind === "unauth") return `Unauthorized Issuance · ${p.row.domain}`;
  if (p.kind === "compromise") return `Compromised Key · ${p.row.id}`;
  return `Shadow Certificate · ${p.row.subject}`;
}

function PanelSection({ title, children }: any) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">{title}</div>
      <div className="rounded-lg border border-slate-200 bg-white p-3 text-[12.5px] text-slate-700 space-y-1">
        {children}
      </div>
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
            <div className="rounded bg-slate-50 p-1.5"><div className="text-[9px] uppercase font-bold text-slate-500">Score</div><div className="text-[14px] font-bold">{d.score}</div></div>
            <div className="rounded bg-slate-50 p-1.5"><div className="text-[9px] uppercase font-bold text-slate-500">Findings</div><div className="text-[14px] font-bold">{d.findings}</div></div>
            <div className="rounded bg-slate-50 p-1.5"><div className="text-[9px] uppercase font-bold text-slate-500">Trend</div><div className="text-[14px] font-bold text-emerald-600">{d.trend}</div></div>
          </div>
        </PanelSection>
        <PanelSection title="Business Impact">{d.impact}</PanelSection>
        <PanelSection title="Assigned Digital Coworkers">
          <div className="flex flex-wrap gap-1.5">
            {d.coworkers.map((c) => <span key={c} className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5"><Bot className="h-3 w-3" /> {c}</span>)}
          </div>
        </PanelSection>
        <PanelSection title="Recommended Actions">
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Open dedicated security workspace</li>
            <li>Auto-create remediation cases for top findings</li>
            <li>Trigger coworker investigation playbook</li>
            <li>Notify service owners with blast-radius summary</li>
          </ul>
        </PanelSection>
        <PanelSection title="Dependencies">Trust graph · CMDB ownership · CT-Log feed · SIEM correlation</PanelSection>
      </>
    );
  }
  if (panel.kind === "unauth") {
    const r = panel.row;
    return (
      <>
        <PanelSection title="Issuer Details"><div className="font-semibold">{r.issuer}</div><div className="text-[11px] text-slate-500">Discovered {r.time} via Certificate Transparency logs</div></PanelSection>
        <PanelSection title="Domain"><div className="font-mono text-[12px]">{r.domain}</div></PanelSection>
        <PanelSection title="Risk Analysis"><div>Risk: <span className={cn("text-[10px] font-bold uppercase border rounded-full px-1.5 py-0.5 ml-1", RISK_COLOR[r.risk])}>{r.risk}</span></div><div className="mt-1">External issuer outside the approved CA list. Indicative of provisioning bypass or potential domain hijack.</div></PanelSection>
        <PanelSection title="Blast Radius">{r.impact}</PanelSection>
        <PanelSection title="Recommended Actions"><ul className="list-disc pl-4 space-y-0.5"><li>Verify legitimate ownership with service owner</li><li>If unauthorized — revoke and re-issue from approved CA</li><li>Open incident in SIEM &amp; engage IR coworker</li></ul></PanelSection>
        <PanelSection title="Dependencies">DNS &amp; domain ownership · CMDB · IR runbook · CA allow-list policy</PanelSection>
      </>
    );
  }
  if (panel.kind === "compromise") {
    const k = panel.row;
    return (
      <>
        <PanelSection title="Affected Services"><div className="font-semibold">{k.svc}</div><div className="font-mono text-[11.5px] text-slate-500 truncate">{k.subject}</div></PanelSection>
        <PanelSection title="Applications &amp; Customers"><div>{k.apps} applications · {k.customers.toLocaleString()} customers impacted</div></PanelSection>
        <PanelSection title="Rotation Status"><div className="font-semibold">{k.status}{k.eta !== "—" ? ` · ETA ${k.eta}` : ""}</div><div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-400 to-rose-500" style={{ width: `${k.blast}%` }} /></div><div className="text-[10px] text-slate-500 mt-1">Blast radius score {k.blast}/100</div></PanelSection>
        <PanelSection title="Business Impact">Revenue / customer trust risk concentrated to the single service tenant; isolation contained by automated rotation.</PanelSection>
        <PanelSection title="Dependencies">HSM · vault · IAM ownership · downstream consumers in CMDB</PanelSection>
      </>
    );
  }
  // shadow
  const s = panel.row;
  return (
    <>
      <PanelSection title="Discovery Source">Detected via network scan &amp; CT-log correlation</PanelSection>
      <PanelSection title="Risk"><span className={cn("text-[10px] font-bold uppercase border rounded-full px-1.5 py-0.5", RISK_COLOR[s.risk])}>{s.risk}</span></PanelSection>
      <PanelSection title="Ownership"><div>Current owner: <span className="font-semibold">{s.owner}</span></div><div className="text-[11px] text-slate-500">Run ownership-resolution coworker to assign accountable team</div></PanelSection>
      <PanelSection title="Business Impact">{s.impact}</PanelSection>
      <PanelSection title="Remediation Plan"><ul className="list-disc pl-4 space-y-0.5"><li>Catalog into governed inventory</li><li>Move to approved CA</li><li>Bind to owner &amp; lifecycle policy</li></ul></PanelSection>
      <PanelSection title="Dependencies">CMDB · IAM ownership · approved CA policy</PanelSection>
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
              <linearGradient id={`g-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#g-${title})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
