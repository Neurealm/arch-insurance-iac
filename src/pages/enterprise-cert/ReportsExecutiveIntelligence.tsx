import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Bell, BookCheck, Bot, Briefcase, Building2, Cog, FileSearch, FileText, GitBranch,
  Globe, HelpCircle, LayoutDashboard, Package, Plug, RefreshCw, ScrollText, Scale, Search,
  ServerCog, ShieldAlert, ShieldCheck, UserCog, Sparkles, X, ChevronRight, AlertTriangle,
  DollarSign, Shield, TrendingUp, CheckCircle2, Filter, ArrowUpRight, Calendar, Download,
  Mail, Presentation, FileBarChart, FileCheck2, Gauge, Send, Wand2, Eye, Star, Clock,
  BarChart3, PieChart as PieIcon, Layers, Award, Zap, Crown,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  PieChart, Pie, Cell, AreaChart, Area, Legend, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
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
    { id: "rep", label: "Reports", icon: FileText, to: "/enterprise-certificate-management/reports", active: true },
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
        <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Intelligence Feed</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">14.2K</span>
          <span className="text-xs opacity-80">Reports</span>
        </div>
        <div className="text-xs opacity-90">99.2% audit-ready</div>
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
          <h1 className="text-[18px] font-bold text-slate-900 truncate">Reports & Executive Intelligence Center</h1>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input placeholder="Search reports, audiences, frameworks" className="pl-8 pr-3 h-8 w-72 text-[12px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 outline-none" />
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
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
    >
      <div className={cn("absolute inset-x-0 top-0 h-0.5", accent)} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">
            {n.toLocaleString()}{suffix}
          </div>
        </div>
        <div className="h-9 w-9 rounded-lg bg-slate-50 grid place-items-center text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 text-[11px] text-emerald-600 font-semibold inline-flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> {trend}
        </div>
      )}
    </motion.div>
  );
}

// ============== DATA ==============
type Report = {
  id: string; title: string; category: string; audience: string; status: "Ready" | "Generating" | "Scheduled" | "Draft";
  generated: string; risk?: number; summary: string; metrics: { label: string; value: string }[];
  evidence?: number; findings?: number;
};

const REPORTS: Report[] = [
  // Executive
  { id: "e1", title: "Certificate Health Summary", category: "Executive", audience: "CIO / CTO", status: "Ready", generated: "2h ago", risk: 12, summary: "Enterprise certificate fleet operating at 98.9% health with 12 elevated-risk items under active remediation.", metrics: [{label:"Health",value:"98.9%"},{label:"At Risk",value:"12"},{label:"Coverage",value:"100%"}], evidence: 1840 },
  { id: "e2", title: "Quarterly Executive Briefing", category: "Executive", audience: "Board", status: "Ready", generated: "1d ago", risk: 8, summary: "Q2 quarterly business review covering value realization, risk reduction and operational excellence.", metrics: [{label:"Value",value:"$48M"},{label:"Risk ↓",value:"62%"},{label:"SLAs",value:"99.4%"}], evidence: 2400 },
  { id: "e3", title: "Risk Exposure Dashboard", category: "Executive", audience: "CIO / CISO", status: "Ready", generated: "4h ago", risk: 22, summary: "Aggregated enterprise risk view across services, regions and compliance posture.", metrics: [{label:"Exposure",value:"$3.2M"},{label:"Critical",value:"3"},{label:"Tier-1",value:"42"}], evidence: 980 },
  { id: "e4", title: "Business Service Impact Report", category: "Executive", audience: "COO", status: "Ready", generated: "1d ago", risk: 9, summary: "Service-level impact mapping for top revenue-generating capabilities.", metrics: [{label:"Services",value:"500"},{label:"Revenue",value:"$2.8B"},{label:"Customers",value:"24M"}], evidence: 3120 },
  { id: "e5", title: "Operational Health Review", category: "Executive", audience: "VP Ops", status: "Generating", generated: "—", risk: 14, summary: "Operational queues, escalations and SLA performance trending.", metrics: [{label:"SLA",value:"99.4%"},{label:"Queues",value:"38"},{label:"Auto",value:"94%"}] },
  { id: "e6", title: "Value Realization Report", category: "Executive", audience: "CFO", status: "Ready", generated: "3d ago", risk: 0, summary: "Cumulative financial value delivered by RunOps automation and digital coworkers.", metrics: [{label:"Saved",value:"$48M"},{label:"Hours",value:"312K"},{label:"ROI",value:"640%"}], evidence: 1450 },
  { id: "e7", title: "RunOps Monthly Business Review", category: "Executive", audience: "All Execs", status: "Scheduled", generated: "Tomorrow", risk: 0, summary: "Comprehensive monthly review combining ops, security, compliance and finance lenses.", metrics: [{label:"Sections",value:"12"},{label:"Charts",value:"48"},{label:"Slides",value:"36"}] },
  // Operations
  { id: "o1", title: "Renewal Performance Report", category: "Operations", audience: "Ops Team", status: "Ready", generated: "6h ago", summary: "Renewal throughput, success rates and pre-expiry coverage across all CAs.", metrics: [{label:"Renewed",value:"1,420"},{label:"Success",value:"99.6%"},{label:"Lead Time",value:"14d"}], evidence: 1240 },
  { id: "o2", title: "Operational SLA Report", category: "Operations", audience: "Ops Lead", status: "Ready", generated: "12h ago", summary: "SLA attainment by queue, region and digital coworker.", metrics: [{label:"Attain",value:"99.4%"},{label:"Breaches",value:"4"},{label:"MTTR",value:"22m"}], evidence: 820 },
  { id: "o3", title: "Queue Health Analysis", category: "Operations", audience: "Ops Team", status: "Ready", generated: "2h ago", summary: "Workload distribution and backlog risk across all operational queues.", metrics: [{label:"Open",value:"126"},{label:"Aging",value:"3"},{label:"Auto",value:"94%"}] },
  { id: "o4", title: "Digital Workforce Utilization", category: "Operations", audience: "Ops Lead", status: "Ready", generated: "1h ago", summary: "Digital coworker capacity, throughput and confidence trends.", metrics: [{label:"Coworkers",value:"38"},{label:"Util",value:"78%"},{label:"Conf",value:"96%"}], evidence: 1200 },
  { id: "o5", title: "Deployment Success Report", category: "Operations", audience: "Eng Lead", status: "Ready", generated: "5h ago", summary: "Certificate deployments by platform, success rate and rollback events.", metrics: [{label:"Deploys",value:"3,400"},{label:"Success",value:"99.8%"},{label:"Rollback",value:"6"}] },
  // Security
  { id: "s1", title: "Certificate Risk Assessment", category: "Security", audience: "CISO", status: "Ready", generated: "3h ago", risk: 28, summary: "Comprehensive risk assessment across cryptographic strength, ownership and exposure.", metrics: [{label:"Score",value:"82/100"},{label:"Critical",value:"3"},{label:"High",value:"14"}], findings: 17, evidence: 920 },
  { id: "s2", title: "Weak Algorithm Analysis", category: "Security", audience: "Sec Team", status: "Ready", generated: "1d ago", risk: 18, summary: "SHA-1, RSA-1024 and other weak algorithm usage with remediation roadmap.", metrics: [{label:"Weak",value:"22"},{label:"Migrated",value:"94%"},{label:"Remaining",value:"22"}], findings: 22 },
  { id: "s3", title: "Compromised Key Report", category: "Security", audience: "CISO", status: "Ready", generated: "8h ago", risk: 42, summary: "Forensic review of suspected key compromise events and CT log anomalies.", metrics: [{label:"Events",value:"2"},{label:"Revoked",value:"2"},{label:"Impact",value:"Low"}], findings: 2, evidence: 380 },
  { id: "s4", title: "Unauthorized Issuance Review", category: "Security", audience: "Sec Team", status: "Ready", generated: "1d ago", risk: 16, summary: "CT log monitoring detected and triaged unauthorized issuance attempts.", metrics: [{label:"Detected",value:"7"},{label:"Blocked",value:"7"},{label:"Sources",value:"3"}], findings: 7 },
  // Compliance
  { id: "c1", title: "PCI Evidence Package", category: "Compliance", audience: "Auditor", status: "Ready", generated: "2d ago", summary: "Complete PCI-DSS 4.0 evidence package with control mappings and attestations.", metrics: [{label:"Controls",value:"412"},{label:"Pass",value:"99.7%"},{label:"Findings",value:"1"}], evidence: 18200, findings: 1 },
  { id: "c2", title: "SOC2 Control Report", category: "Compliance", audience: "Auditor", status: "Ready", generated: "3d ago", summary: "SOC2 Type II readiness with continuous control monitoring.", metrics: [{label:"Controls",value:"118"},{label:"Pass",value:"100%"},{label:"Period",value:"12mo"}], evidence: 9400 },
  { id: "c3", title: "NIST Compliance Summary", category: "Compliance", audience: "GRC Lead", status: "Ready", generated: "5h ago", summary: "NIST 800-53 control coverage and certificate-related findings.", metrics: [{label:"Controls",value:"284"},{label:"Pass",value:"99.2%"},{label:"Gaps",value:"3"}], evidence: 6200, findings: 3 },
  { id: "c4", title: "ISO27001 Readiness Report", category: "Compliance", audience: "GRC Lead", status: "Generating", generated: "—", summary: "ISO27001:2022 Annex A control coverage and Statement of Applicability.", metrics: [{label:"Annex A",value:"93"},{label:"Coverage",value:"98%"},{label:"Owners",value:"42"}] },
  // Audit
  { id: "a1", title: "Audit Evidence Package", category: "Audit", audience: "External Auditor", status: "Ready", generated: "1d ago", summary: "Complete audit evidence bundle with approvals, chain of custody and traceability.", metrics: [{label:"Records",value:"249K"},{label:"Approvals",value:"38K"},{label:"Score",value:"99.2%"}], evidence: 249000 },
  { id: "a2", title: "Certificate Lifecycle Audit", category: "Audit", audience: "Internal Audit", status: "Ready", generated: "2d ago", summary: "Full lifecycle audit from request to revocation with timestamped evidence.", metrics: [{label:"Certs",value:"248K"},{label:"Events",value:"4.1M"},{label:"Gaps",value:"0"}], evidence: 4100000 },
  { id: "a3", title: "Governance Audit", category: "Audit", audience: "Internal Audit", status: "Ready", generated: "5d ago", summary: "Policy adherence and approval governance audit across business units.", metrics: [{label:"Policies",value:"38"},{label:"Adherence",value:"99.7%"},{label:"Exceptions",value:"6"}] },
  // Business Service
  { id: "bs1", title: "Customer Portal Risk Analysis", category: "Business Service", audience: "Service Owner", status: "Ready", generated: "3h ago", risk: 11, summary: "Risk profile of customer portal service including certificates, dependencies and exposure.", metrics: [{label:"Revenue",value:"$420M"},{label:"Customers",value:"8.2M"},{label:"Certs",value:"148"}] },
  { id: "bs2", title: "Claims Platform Dependency Review", category: "Business Service", audience: "Service Owner", status: "Ready", generated: "1d ago", risk: 6, summary: "Dependency map and risk concentration for claims processing platform.", metrics: [{label:"Apps",value:"42"},{label:"Certs",value:"310"},{label:"SLA",value:"99.97%"}] },
  { id: "bs3", title: "Identity Service Health Report", category: "Business Service", audience: "IAM Lead", status: "Ready", generated: "4h ago", risk: 8, summary: "Health of identity & SSO services with certificate posture.", metrics: [{label:"Auth/sec",value:"42K"},{label:"Certs",value:"96"},{label:"Health",value:"99.99%"}] },
  // Digital Coworker
  { id: "dc1", title: "Discovery Engineer Performance", category: "Digital Coworker", audience: "Ops Lead", status: "Ready", generated: "1h ago", summary: "Performance metrics for the Discovery digital coworker.", metrics: [{label:"Tasks",value:"42,180"},{label:"Saved",value:"18.2K hrs"},{label:"Conf",value:"97%"}] },
  { id: "dc2", title: "Risk Analyst Performance", category: "Digital Coworker", audience: "Sec Lead", status: "Ready", generated: "2h ago", summary: "Risk analyst coworker findings, escalations and confidence.", metrics: [{label:"Analyzed",value:"248K"},{label:"Findings",value:"1.2K"},{label:"Escalated",value:"38"}] },
  { id: "dc3", title: "Renewal Coordinator Metrics", category: "Digital Coworker", audience: "Ops Lead", status: "Ready", generated: "30m ago", summary: "Renewal coordinator throughput, pre-expiry coverage and success rate.", metrics: [{label:"Renewed",value:"14,200"},{label:"Success",value:"99.6%"},{label:"Saved",value:"42K hrs"}] },
  { id: "dc4", title: "Compliance Auditor Performance", category: "Digital Coworker", audience: "GRC Lead", status: "Ready", generated: "1h ago", summary: "Continuous compliance auditor evidence collection and gap analysis.", metrics: [{label:"Evidence",value:"249K"},{label:"Gaps",value:"3"},{label:"Frameworks",value:"8"}] },
  // Financial
  { id: "f1", title: "Value Realization Report", category: "Financial", audience: "CFO", status: "Ready", generated: "1d ago", summary: "Cumulative quantified value delivered by RunOps program.", metrics: [{label:"Value",value:"$48M"},{label:"ROI",value:"640%"},{label:"Payback",value:"4mo"}], evidence: 1840 },
  { id: "f2", title: "Labor Savings Analysis", category: "Financial", audience: "CFO", status: "Ready", generated: "2d ago", summary: "Hours saved by digital coworkers translated into operational cost reduction.", metrics: [{label:"Hours",value:"312K"},{label:"FTE",value:"168"},{label:"Saved",value:"$24M"}] },
  { id: "f3", title: "Incident Avoidance Report", category: "Financial", audience: "COO", status: "Ready", generated: "3d ago", summary: "Outages avoided through proactive certificate management and remediation.", metrics: [{label:"Avoided",value:"38"},{label:"Saved",value:"$18M"},{label:"Customers",value:"2.4M"}] },
  { id: "f4", title: "ROI Summary", category: "Financial", audience: "CFO", status: "Ready", generated: "5d ago", summary: "Program-level ROI summary across automation, risk and revenue protection.", metrics: [{label:"ROI",value:"640%"},{label:"Invest",value:"$7.5M"},{label:"Return",value:"$48M"}], evidence: 620 },
];

const CATEGORIES = [
  { id: "Executive", icon: Crown, color: "from-violet-500 to-indigo-600", chip: "bg-violet-50 text-violet-700 border-violet-200" },
  { id: "Operations", icon: ServerCog, color: "from-sky-500 to-blue-600", chip: "bg-sky-50 text-sky-700 border-sky-200" },
  { id: "Security", icon: ShieldCheck, color: "from-rose-500 to-red-600", chip: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "Compliance", icon: BookCheck, color: "from-emerald-500 to-teal-600", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "Audit", icon: FileSearch, color: "from-amber-500 to-orange-600", chip: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "Business Service", icon: Briefcase, color: "from-blue-500 to-cyan-600", chip: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "Digital Coworker", icon: Bot, color: "from-fuchsia-500 to-pink-600", chip: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  { id: "Financial", icon: DollarSign, color: "from-green-500 to-emerald-600", chip: "bg-green-50 text-green-700 border-green-200" },
];

const STATUS_STYLE: any = {
  "Ready": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Generating": "bg-blue-50 text-blue-700 border-blue-200",
  "Scheduled": "bg-amber-50 text-amber-700 border-amber-200",
  "Draft": "bg-slate-50 text-slate-700 border-slate-200",
};

// Analytics data
const REPORTS_BY_CATEGORY = CATEGORIES.map((c) => ({
  name: c.id.replace("Business Service", "Biz Svc").replace("Digital Coworker", "Coworker"),
  value: REPORTS.filter((r) => r.category === c.id).length * 220 + Math.floor(Math.random() * 400) + 600,
}));
const REPORTS_BY_AUDIENCE = [
  { name: "CIO/CTO", value: 2400 }, { name: "CISO", value: 2100 }, { name: "CFO", value: 1400 },
  { name: "Auditors", value: 3200 }, { name: "Ops", value: 3800 }, { name: "Board", value: 480 },
];
const READINESS_TREND = Array.from({ length: 12 }).map((_, i) => ({
  m: ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"][i],
  audit: 92 + Math.round(Math.sin(i / 2) * 2) + i * 0.55,
  compliance: 94 + Math.round(Math.cos(i / 3) * 1.5) + i * 0.45,
  risk: 38 - i * 2.4 + Math.round(Math.sin(i) * 2),
}));
const COWORKER_PROD = Array.from({ length: 12 }).map((_, i) => ({
  m: ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"][i],
  hours: 14000 + i * 2200 + Math.round(Math.random() * 1800),
  value: 1.8 + i * 0.42,
}));
const STAKEHOLDER_PIE = [
  { name: "Executive", value: 28, color: "#7c3aed" },
  { name: "Security", value: 22, color: "#e11d48" },
  { name: "Compliance", value: 18, color: "#059669" },
  { name: "Operations", value: 20, color: "#0284c7" },
  { name: "Finance", value: 12, color: "#16a34a" },
];

const AUTOMATIONS = [
  { name: "Monthly Executive Briefing", schedule: "1st of month", success: 100, recipients: 12, last: "3d ago", icon: Crown },
  { name: "Weekly Operations Report", schedule: "Mondays 06:00", success: 99.6, recipients: 28, last: "2d ago", icon: ServerCog },
  { name: "Daily Risk Summary", schedule: "Daily 07:00", success: 99.9, recipients: 8, last: "8h ago", icon: ShieldAlert },
  { name: "Compliance Evidence Collection", schedule: "Continuous", success: 100, recipients: 6, last: "Live", icon: BookCheck },
  { name: "Board Reporting Package", schedule: "Quarterly", success: 100, recipients: 14, last: "32d ago", icon: Presentation },
  { name: "Audit Readiness Assessment", schedule: "Weekly", success: 99.8, recipients: 9, last: "4d ago", icon: FileCheck2 },
];

// ============== NARRATIVE BUILDER ==============
const NARRATIVE_OPTIONS = [
  { id: "exec", label: "Executive Summary", icon: Crown },
  { id: "risk", label: "Business Risk Summary", icon: ShieldAlert },
  { id: "sec", label: "Security Summary", icon: ShieldCheck },
  { id: "com", label: "Compliance Summary", icon: BookCheck },
  { id: "val", label: "Value Summary", icon: DollarSign },
];

const NARRATIVES: Record<string, { title: string; body: string; evidence: string[]; actions: string[]; talking: string[] }> = {
  exec: {
    title: "Q2 Executive Summary",
    body: "RunOps delivered $48M of quantified value this quarter while reducing certificate-driven risk exposure by 62%. 14,200 reports were generated across 8 stakeholder groups, with audit readiness sustained at 99.2% and policy compliance at 99.7%. Digital coworkers executed 38,000 operational tasks, freeing 312,000 engineering hours.",
    evidence: ["Value Realization Report", "Audit Readiness Trend", "Risk Reduction Trend", "Coworker Productivity Index"],
    actions: ["Approve expansion to APAC region", "Promote 3 manual queues to full automation", "Schedule board briefing for July 14"],
    talking: ["RunOps is now the executive intelligence layer", "Every stakeholder is served by a single platform", "Risk reduced 62% with no added headcount"],
  },
  risk: {
    title: "Business Risk Summary",
    body: "Aggregate certificate-related risk exposure is $3.2M, down 62% YoY. 3 critical and 14 high findings are under active remediation by digital coworkers, with projected closure within 14 days. Tier-1 service exposure is contained to 4 services, all with mitigations deployed.",
    evidence: ["Risk Exposure Dashboard", "Weak Algorithm Analysis", "Compromised Key Report"],
    actions: ["Approve emergency rotation for 3 critical certs", "Retire SHA-1 across remaining 22 endpoints", "Tier-1 service owner sign-off"],
    talking: ["Risk is quantified in dollars, not just CVEs", "Coworkers remediate while we sleep", "Tier-1 exposure already contained"],
  },
  sec: {
    title: "Security Posture Summary",
    body: "Security posture score is 82/100, up 11 points QoQ. 7 unauthorized issuance attempts were detected and blocked via CT log monitoring. Weak algorithm migration is 94% complete with 22 endpoints remaining on the roadmap.",
    evidence: ["Certificate Risk Assessment", "CT Log Monitor Feed", "Unauthorized Issuance Review"],
    actions: ["Close 22 remaining SHA-1 endpoints", "Rotate 2 compromised keys", "Enable continuous CT enforcement"],
    talking: ["CT logs catch what humans miss", "94% of weak crypto already migrated", "Zero successful unauthorized issuances"],
  },
  com: {
    title: "Compliance Summary",
    body: "All 8 frameworks (PCI, SOC2, NIST, ISO27001, HIPAA, GDPR, FedRAMP, DORA) are green. 249,000 evidence records collected continuously. Audit readiness at 99.2%, with 3 minor NIST gaps targeted for closure this sprint.",
    evidence: ["PCI Evidence Package", "SOC2 Control Report", "NIST Compliance Summary"],
    actions: ["Close 3 NIST control gaps", "Submit ISO27001 readiness package", "Schedule PCI external attestation"],
    talking: ["8 frameworks, one platform, zero spreadsheets", "Audit-ready every day, not just at year-end", "Evidence collected continuously"],
  },
  val: {
    title: "Value Realization Summary",
    body: "$48M cumulative value delivered: $24M labor savings (312K hours), $18M outage avoidance (38 incidents prevented), and $6M compliance acceleration. ROI of 640% on a $7.5M investment, with payback achieved in 4 months.",
    evidence: ["Value Realization Report", "Labor Savings Analysis", "Incident Avoidance Report"],
    actions: ["Reinvest 25% of savings into APAC expansion", "Publish CFO-ready ROI deck", "Brief audit committee"],
    talking: ["640% ROI, payback in 4 months", "$48M delivered, $18M outages avoided", "Value compounds quarter over quarter"],
  },
};

// ============== MAIN ==============
export default function ReportsExecutiveIntelligence() {
  const [activeCat, setActiveCat] = useState<string | "all">("all");
  const [selected, setSelected] = useState<Report | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [narrativeKey, setNarrativeKey] = useState("exec");
  const [filterAudience, setFilterAudience] = useState("All");

  const filtered = useMemo(() => REPORTS.filter((r) =>
    (activeCat === "all" || r.category === activeCat) &&
    (filterAudience === "All" || r.audience.includes(filterAudience))
  ), [activeCat, filterAudience]);

  const grouped = useMemo(() => {
    const map: Record<string, Report[]> = {};
    CATEGORIES.forEach((c) => (map[c.id] = []));
    filtered.forEach((r) => { (map[r.category] ||= []).push(r); });
    return map;
  }, [filtered]);

  const narrative = NARRATIVES[narrativeKey];

  return (
    <div className="min-h-screen bg-slate-50/60 flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">

          {/* KPI Layer */}
          <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            <KpiCard icon={FileText} label="Reports Generated" value={14200} accent="bg-gradient-to-r from-violet-400 to-indigo-500" trend="+18% MoM" />
            <KpiCard icon={FileCheck2} label="Audit Packages" value={500} accent="bg-gradient-to-r from-amber-400 to-orange-500" trend="+12 this wk" />
            <KpiCard icon={BookCheck} label="Compliance Reports" value={2800} accent="bg-gradient-to-r from-emerald-400 to-teal-500" trend="8 frameworks" />
            <KpiCard icon={Crown} label="Exec Briefings" value={1200} accent="bg-gradient-to-r from-fuchsia-400 to-pink-500" trend="+24 QoQ" />
            <KpiCard icon={Bot} label="Coworker Reports" value={38000} accent="bg-gradient-to-r from-sky-400 to-blue-500" trend="+22% MoM" />
            <KpiCard icon={FileSearch} label="Evidence Records" value={249000} accent="bg-gradient-to-r from-cyan-400 to-blue-500" trend="continuous" />
            <KpiCard icon={Award} label="Audit Readiness" value={99} suffix=".2%" accent="bg-gradient-to-r from-green-400 to-emerald-500" trend="+1.4pts" />
            <KpiCard icon={Shield} label="Policy Compliance" value={99} suffix=".7%" accent="bg-gradient-to-r from-blue-400 to-indigo-500" trend="38 policies" />
          </section>

          {/* Filter Bar */}
          <section className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-2 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">Filters</span>
            <button onClick={() => setActiveCat("all")} className={cn("h-7 px-2.5 text-[11px] font-semibold rounded-md border transition-colors", activeCat === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")}>All Categories</button>
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setActiveCat(c.id)} className={cn("h-7 px-2.5 text-[11px] font-semibold rounded-md border transition-colors inline-flex items-center gap-1.5", activeCat === c.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")}>
                <c.icon className="h-3 w-3" /> {c.id}
              </button>
            ))}
            <span className="h-5 w-px bg-slate-200 mx-1" />
            <select value={filterAudience} onChange={(e) => setFilterAudience(e.target.value)} className="h-7 px-2 text-[11px] font-semibold rounded-md border border-slate-200 bg-white text-slate-700">
              {["All","CIO","CISO","CFO","COO","Board","Auditor","Ops","GRC"].map((a) => <option key={a}>{a}</option>)}
            </select>
            <select className="h-7 px-2 text-[11px] font-semibold rounded-md border border-slate-200 bg-white text-slate-700">
              {["Region: All","NA","EMEA","APAC","LATAM"].map((a) => <option key={a}>{a}</option>)}
            </select>
            <select className="h-7 px-2 text-[11px] font-semibold rounded-md border border-slate-200 bg-white text-slate-700">
              {["Framework: All","PCI","SOC2","NIST","ISO27001","HIPAA","GDPR","FedRAMP","DORA"].map((a) => <option key={a}>{a}</option>)}
            </select>
            <select className="h-7 px-2 text-[11px] font-semibold rounded-md border border-slate-200 bg-white text-slate-700">
              {["Risk: Any","Critical","High","Medium","Low"].map((a) => <option key={a}>{a}</option>)}
            </select>
            <select className="h-7 px-2 text-[11px] font-semibold rounded-md border border-slate-200 bg-white text-slate-700">
              {["Range: Last 30d","7d","90d","YTD","All time"].map((a) => <option key={a}>{a}</option>)}
            </select>
            <div className="ml-auto text-[11px] text-slate-500">{filtered.length} reports</div>
          </section>

          {/* Report Library */}
          <section>
            <div className="flex items-end justify-between mb-3">
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">Report Library</h2>
                <p className="text-[12px] text-slate-500">Intelligence grouped by stakeholder discipline</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ready</span>
                <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Generating</span>
                <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Scheduled</span>
              </div>
            </div>

            <div className="space-y-6">
              {CATEGORIES.filter((c) => grouped[c.id]?.length).map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className={cn("h-7 w-7 rounded-lg bg-gradient-to-br grid place-items-center text-white", cat.color)}>
                      <cat.icon className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-[13px] font-bold text-slate-900">{cat.id} Reports</h3>
                    <span className="text-[11px] text-slate-500">({grouped[cat.id].length})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {grouped[cat.id].map((r, i) => (
                      <motion.button
                        key={r.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        onClick={() => setSelected(r)}
                        onDoubleClick={() => { setSelected(r); setWorkspaceOpen(true); }}
                        className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-200 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-slate-900 truncate group-hover:text-blue-700">{r.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{r.audience} · {r.generated}</div>
                          </div>
                          <span className={cn("shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", STATUS_STYLE[r.status])}>{r.status}</span>
                        </div>
                        <p className="mt-2 text-[12px] text-slate-600 line-clamp-2">{r.summary}</p>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {r.metrics.map((m) => (
                            <div key={m.label} className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-1.5">
                              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">{m.label}</div>
                              <div className="text-[12px] font-bold text-slate-900 truncate">{m.value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[11px]">
                          <div className="inline-flex items-center gap-1.5 text-slate-500">
                            {r.risk !== undefined && (
                              <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border font-semibold",
                                r.risk > 25 ? "bg-rose-50 text-rose-700 border-rose-200" :
                                r.risk > 12 ? "bg-amber-50 text-amber-700 border-amber-200" :
                                "bg-emerald-50 text-emerald-700 border-emerald-200")}>
                                <AlertTriangle className="h-2.5 w-2.5" /> Risk {r.risk}
                              </span>
                            )}
                            {r.evidence && <span className="inline-flex items-center gap-1"><FileSearch className="h-3 w-3" /> {r.evidence.toLocaleString()}</span>}
                          </div>
                          <span className="inline-flex items-center gap-1 text-blue-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            Open <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Two-column: Analytics + Generation Center */}
          <section className="grid grid-cols-12 gap-4">
            {/* Report Analytics */}
            <div className="col-span-12 lg:col-span-8 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Report Analytics Workspace</h3>
                  <p className="text-[11px] text-slate-500">Consumption, value and audience reach</p>
                </div>
                <button className="text-[11px] font-semibold text-blue-700 inline-flex items-center gap-1">View Studio <ArrowUpRight className="h-3 w-3" /></button>
              </div>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-7 rounded-lg border border-slate-100 p-3 bg-gradient-to-br from-white to-slate-50/40">
                  <div className="text-[11px] font-bold text-slate-700 mb-1">Reports Generated by Category (12 mo)</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={REPORTS_BY_CATEGORY} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} interval={0} angle={-12} dy={6} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                      <RTooltip cursor={{ fill: "rgba(59,130,246,0.06)" }} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Bar dataKey="value" radius={[6,6,0,0]} fill="url(#barGrad)" />
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="col-span-12 md:col-span-5 rounded-lg border border-slate-100 p-3">
                  <div className="text-[11px] font-bold text-slate-700 mb-1">Reports by Stakeholder</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={STAKEHOLDER_PIE} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                        {STAKEHOLDER_PIE.map((p, i) => <Cell key={i} fill={p.color} />)}
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                      <RTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="col-span-12 rounded-lg border border-slate-100 p-3">
                  <div className="text-[11px] font-bold text-slate-700 mb-1">Audit Readiness, Compliance & Risk Trend</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={READINESS_TREND} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="audit" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.35} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                        <linearGradient id="comp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                      <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                      <RTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Area type="monotone" dataKey="audit" stroke="#10b981" strokeWidth={2} fill="url(#audit)" name="Audit Readiness" />
                      <Area type="monotone" dataKey="compliance" stroke="#3b82f6" strokeWidth={2} fill="url(#comp)" name="Compliance" />
                      <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} dot={false} name="Risk Score" />
                      <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Generation Center */}
            <div className="col-span-12 lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Report Generation Center</h3>
                  <p className="text-[11px] text-slate-500">One-click intelligence workflows</p>
                </div>
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: "Generate Report", i: FileBarChart, c: "from-blue-500 to-indigo-600" },
                  { l: "Schedule Report", i: Calendar, c: "from-violet-500 to-purple-600" },
                  { l: "Export Report", i: Download, c: "from-slate-700 to-slate-900" },
                  { l: "Email Report", i: Mail, c: "from-sky-500 to-blue-600" },
                  { l: "Exec Briefing", i: Crown, c: "from-fuchsia-500 to-pink-600" },
                  { l: "Audit Package", i: FileCheck2, c: "from-amber-500 to-orange-600" },
                  { l: "Compliance Evidence", i: BookCheck, c: "from-emerald-500 to-teal-600" },
                  { l: "Board Deck", i: Presentation, c: "from-rose-500 to-red-600" },
                ].map((b) => (
                  <button key={b.l} className="group rounded-lg border border-slate-200 p-2.5 text-left hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className={cn("h-7 w-7 rounded-md bg-gradient-to-br grid place-items-center text-white mb-1.5", b.c)}>
                      <b.i className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[11.5px] font-semibold text-slate-800 group-hover:text-blue-700">{b.l}</div>
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">Active Generation</div>
                {[
                  { n: "ISO27001 Readiness", p: 72 },
                  { n: "Q2 Board Deck", p: 38 },
                  { n: "Operational Health Review", p: 89 },
                ].map((g) => (
                  <div key={g.n} className="mb-1.5 last:mb-0">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 font-medium truncate">{g.n}</span>
                      <span className="text-slate-500 tabular-nums">{g.p}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-slate-200 overflow-hidden mt-1">
                      <motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" initial={{ width: 0 }} animate={{ width: `${g.p}%` }} transition={{ duration: 0.9 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Executive Narrative Builder */}
          <section className="rounded-xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50/40 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center text-white">
                  <Wand2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Executive Narrative Builder</h3>
                  <p className="text-[11px] text-slate-500">Digital coworkers translate operational data into executive language</p>
                </div>
              </div>
              <button className="h-8 px-3 text-[12px] font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white inline-flex items-center gap-1.5 hover:shadow-md">
                <Sparkles className="h-3.5 w-3.5" /> Regenerate
              </button>
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-3 space-y-1.5">
                {NARRATIVE_OPTIONS.map((o) => (
                  <button key={o.id} onClick={() => setNarrativeKey(o.id)}
                    className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors text-left border",
                      narrativeKey === o.id ? "bg-white border-indigo-300 text-indigo-700 shadow-sm" : "bg-white/60 border-transparent text-slate-700 hover:bg-white")}>
                    <o.icon className="h-3.5 w-3.5" /> {o.label}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={narrativeKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="col-span-12 md:col-span-9 grid grid-cols-12 gap-3">
                  <div className="col-span-12 lg:col-span-7 rounded-xl bg-white border border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-3.5 w-3.5 text-indigo-600" />
                      <div className="text-[13px] font-bold text-slate-900">{narrative.title}</div>
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5">AI Generated</span>
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-slate-700">{narrative.body}</p>
                    <div className="mt-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Supporting Evidence</div>
                      <div className="flex flex-wrap gap-1.5">
                        {narrative.evidence.map((e) => (
                          <span key={e} className="text-[10.5px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 inline-flex items-center gap-1"><FileSearch className="h-2.5 w-2.5" />{e}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-5 space-y-3">
                    <div className="rounded-xl bg-white border border-slate-200 p-4">
                      <div className="text-[11px] font-bold text-slate-900 mb-1.5 inline-flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5 text-emerald-600" /> Recommended Actions</div>
                      <ul className="space-y-1.5">
                        {narrative.actions.map((a) => (
                          <li key={a} className="text-[12px] text-slate-700 flex items-start gap-1.5">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" /> {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200 p-4">
                      <div className="text-[11px] font-bold text-slate-900 mb-1.5 inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-500" /> Executive Talking Points</div>
                      <ul className="space-y-1">
                        {narrative.talking.map((t) => (
                          <li key={t} className="text-[12px] text-slate-700 italic before:content-['“'] after:content-['”']">{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* Executive Analytics + Automation */}
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-7 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Executive Analytics</h3>
                  <p className="text-[11px] text-slate-500">Productivity, risk reduction and value trend</p>
                </div>
                <BarChart3 className="h-4 w-4 text-slate-400" />
              </div>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 lg:col-span-7 rounded-lg border border-slate-100 p-3">
                  <div className="text-[11px] font-bold text-slate-700 mb-1">Digital Coworker Productivity & Value (12 mo)</div>
                  <ResponsiveContainer width="100%" height={210}>
                    <AreaChart data={COWORKER_PROD} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="hours" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                      <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <RTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Area yAxisId="l" type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} fill="url(#hours)" name="Hours Saved" />
                      <Line yAxisId="r" type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} dot={false} name="Value ($M)" />
                      <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="col-span-12 lg:col-span-5 rounded-lg border border-slate-100 p-3">
                  <div className="text-[11px] font-bold text-slate-700 mb-1">Reports by Audience</div>
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart data={REPORTS_BY_AUDIENCE} layout="vertical" margin={{ top: 4, right: 8, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} width={62} />
                      <RTooltip cursor={{ fill: "rgba(59,130,246,0.06)" }} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Bar dataKey="value" radius={[0,6,6,0]} fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Reporting Automations</h3>
                  <p className="text-[11px] text-slate-500">Scheduled intelligence pipelines</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">6 active</span>
              </div>
              <div className="space-y-2">
                {AUTOMATIONS.map((a) => (
                  <div key={a.name} className="rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center text-slate-700">
                        <a.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold text-slate-900 truncate">{a.name}</div>
                        <div className="text-[10.5px] text-slate-500 truncate">{a.schedule} · {a.recipients} recipients · Last: {a.last}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[12px] font-bold text-emerald-600 tabular-nums">{a.success}%</div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider">Success</div>
                      </div>
                      <button className="h-7 w-7 grid place-items-center rounded-md border border-slate-200 hover:bg-white"><Send className="h-3 w-3 text-slate-600" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom strip */}
          <section className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-5">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 lg:col-span-7">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Executive Intelligence Layer</div>
                <div className="text-[18px] font-bold mt-1">One platform. Every stakeholder. Continuous intelligence.</div>
                <p className="text-[12.5px] text-slate-300 mt-1.5 max-w-2xl">
                  Neurealm RunOps continuously converts certificate operations into actionable business intelligence, audit evidence, compliance reporting and executive value realization.
                </p>
              </div>
              <div className="col-span-12 lg:col-span-5 grid grid-cols-4 gap-2">
                {[
                  { l: "Stakeholders", v: "8" },
                  { l: "Audiences", v: "32" },
                  { l: "Frameworks", v: "8" },
                  { l: "Evidence", v: "249K" },
                ].map((m) => (
                  <div key={m.l} className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">{m.l}</div>
                    <div className="text-[18px] font-bold tabular-nums">{m.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* ================ DETAIL PANEL ================ */}
      <Sheet open={!!selected && !workspaceOpen} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[40vw] p-0 bg-white overflow-y-auto">
          {selected && (() => {
            const cat = CATEGORIES.find((c) => c.id === selected.category)!;
            return (
              <>
                <div className={cn("p-5 bg-gradient-to-br text-white", cat.color)}>
                  <SheetHeader>
                    <div className="flex items-center gap-2">
                      <cat.icon className="h-4 w-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">{selected.category}</span>
                      <span className={cn("ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 border border-white/20")}>{selected.status}</span>
                    </div>
                    <SheetTitle className="text-white text-[20px] mt-1">{selected.title}</SheetTitle>
                    <div className="text-[12px] opacity-90">For {selected.audience} · {selected.generated}</div>
                  </SheetHeader>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {selected.metrics.map((m) => (
                      <div key={m.label} className="rounded-lg bg-white/10 border border-white/15 p-2">
                        <div className="text-[9.5px] uppercase tracking-wider opacity-80 font-bold">{m.label}</div>
                        <div className="text-[15px] font-bold">{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <Section title="Executive Summary"><p className="text-[12.5px] text-slate-700 leading-relaxed">{selected.summary}</p></Section>

                  {selected.category === "Executive" && (
                    <>
                      <Section title="Business Impact"><BodyList items={["$2.8B revenue protected","24M customers served","42 Tier-1 services covered","Audit-ready every day"]} /></Section>
                      <Section title="Risk Analysis"><BodyList items={[`Risk score ${selected.risk ?? 12}/100`,"3 critical items under remediation","Trend: down 62% YoY"]} /></Section>
                      <Section title="Operational Health"><BodyList items={["SLA attainment 99.4%","Automation rate 94%","Coworker confidence 96%"]} /></Section>
                    </>
                  )}
                  {selected.category === "Security" && (
                    <>
                      <Section title="Security Findings"><BodyList items={[`${selected.findings ?? 5} active findings`,"7 unauthorized issuance attempts blocked","2 keys rotated in last 24h"]} /></Section>
                      <Section title="Threat Exposure"><BodyList items={["CT logs monitored continuously","Weak crypto migration 94% complete","Zero successful unauthorized issuances"]} /></Section>
                    </>
                  )}
                  {selected.category === "Compliance" && (
                    <>
                      <Section title="Framework Coverage"><BodyList items={["PCI · SOC2 · NIST · ISO27001","HIPAA · GDPR · FedRAMP · DORA","Continuous control monitoring"]} /></Section>
                      <Section title="Control Mapping"><BodyList items={["412 controls evidenced","99.7% pass rate","Statement of Applicability auto-generated"]} /></Section>
                      <Section title="Findings & Exceptions"><BodyList items={[`${selected.findings ?? 1} open findings`,"All exceptions time-bound and approved","No material weaknesses"]} /></Section>
                    </>
                  )}
                  {selected.category === "Financial" && (
                    <>
                      <Section title="ROI & Savings"><BodyList items={["$48M cumulative value","640% ROI · 4-month payback","312K hours saved"]} /></Section>
                      <Section title="Revenue Protection"><BodyList items={["38 outages avoided","$18M revenue protected","2.4M customers shielded"]} /></Section>
                    </>
                  )}
                  {selected.category === "Digital Coworker" && (
                    <>
                      <Section title="Tasks & Confidence"><BodyList items={["38,000 tasks executed","96% average confidence","2.1% escalation rate"]} /></Section>
                      <Section title="Value Delivered"><BodyList items={["312K hours saved","$24M labor savings","168 FTE equivalent"]} /></Section>
                    </>
                  )}
                  {(selected.category === "Operations" || selected.category === "Business Service" || selected.category === "Audit") && (
                    <>
                      <Section title="Key Findings"><BodyList items={["All SLAs trending green","No material exceptions","Continuous evidence collection active"]} /></Section>
                      <Section title="Dependencies"><BodyList items={["Operations Center","Agentic Execution","Audit & Evidence vault"]} /></Section>
                    </>
                  )}

                  <Section title="Recommended Actions">
                    <div className="space-y-1.5">
                      {["Distribute to stakeholders","Schedule executive briefing","Archive to evidence vault","Trigger remediation workflows"].map((a) => (
                        <div key={a} className="flex items-start gap-2 text-[12px] text-slate-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" /> {a}
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section title="Generated By">
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 p-2.5">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center text-white"><Bot className="h-4 w-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold text-slate-900">Executive Reporter (Digital Coworker)</div>
                        <div className="text-[11px] text-slate-500">Confidence 97% · {selected.evidence?.toLocaleString() ?? "—"} evidence sources</div>
                      </div>
                    </div>
                  </Section>

                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => setWorkspaceOpen(true)} className="flex-1 h-9 rounded-lg bg-blue-600 text-white text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-blue-700"><Eye className="h-3.5 w-3.5" /> Open Workspace</button>
                    <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50"><Download className="h-3.5 w-3.5" /> Export</button>
                    <button className="h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50"><Mail className="h-3.5 w-3.5" /> Send</button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* ================ WORKSPACE PANEL ================ */}
      <Sheet open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[60vw] p-0 bg-white overflow-y-auto">
          {selected && (() => {
            const cat = CATEGORIES.find((c) => c.id === selected.category)!;
            const workspaceName = ({
              "Executive":"Executive Reporting Studio",
              "Audit":"Audit Package Builder",
              "Compliance":"Compliance Reporting Center",
              "Security":"Security Intelligence Center",
              "Financial":"Financial Analytics Center",
              "Digital Coworker":"Digital Workforce Reporting Center",
              "Operations":"Operations Reporting Studio",
              "Business Service":"Service Reporting Studio",
            } as any)[selected.category];
            return (
              <>
                <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setWorkspaceOpen(false)} className="h-7 w-7 grid place-items-center rounded-md border border-slate-200 hover:bg-white"><X className="h-3.5 w-3.5" /></button>
                    <div className={cn("h-7 w-7 rounded-lg bg-gradient-to-br grid place-items-center text-white", cat.color)}><cat.icon className="h-3.5 w-3.5" /></div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{workspaceName}</div>
                      <div className="text-[15px] font-bold text-slate-900">{selected.title}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <button className="h-8 px-3 text-[11.5px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"><Presentation className="h-3.5 w-3.5" /> Presentation</button>
                      <button className="h-8 px-3 text-[11.5px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Schedule</button>
                      <button className="h-8 px-3 text-[11.5px] font-semibold rounded-lg bg-blue-600 text-white inline-flex items-center gap-1.5 hover:bg-blue-700"><Download className="h-3.5 w-3.5" /> Export</button>
                    </div>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-12 gap-4">
                  <div className="col-span-12 lg:col-span-8 space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-[12px] font-bold text-slate-900 mb-1">Report Content</div>
                      <p className="text-[12.5px] text-slate-700 leading-relaxed">{selected.summary}</p>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {selected.metrics.map((m) => (
                          <div key={m.label} className="rounded-lg bg-slate-50 border border-slate-100 p-2.5">
                            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{m.label}</div>
                            <div className="text-[16px] font-bold text-slate-900">{m.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-[12px] font-bold text-slate-900 mb-2">Supporting Data</div>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={READINESS_TREND} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                          <defs><linearGradient id="ws" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                          <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                          <RTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                          <Area type="monotone" dataKey="audit" stroke="#3b82f6" strokeWidth={2} fill="url(#ws)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-[12px] font-bold text-slate-900 mb-2">Dependencies</div>
                      <div className="flex flex-wrap gap-1.5">
                        {["Operations Center","Agentic Execution","Audit & Evidence","Policy Engine","Digital Coworkers","Global Map"].map((d) => (
                          <span key={d} className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 inline-flex items-center gap-1"><Layers className="h-2.5 w-2.5" /> {d}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-4 space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-[12px] font-bold text-slate-900 mb-2 inline-flex items-center gap-1.5"><FileSearch className="h-3.5 w-3.5 text-amber-600" /> Evidence ({(selected.evidence ?? 420).toLocaleString()})</div>
                      <ul className="space-y-1.5">
                        {["Approval Chain","CT Log Records","Policy Evaluation","Coworker Decisions","Inventory Snapshot"].map((e) => (
                          <li key={e} className="text-[12px] text-slate-700 flex items-center gap-2"><FileText className="h-3 w-3 text-slate-400" /> {e}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-[12px] font-bold text-slate-900 mb-2 inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-violet-600" /> Scheduling</div>
                      <div className="space-y-1.5">
                        {["Monthly · 1st @ 06:00","Quarterly business review","On-demand triggers"].map((s) => (
                          <div key={s} className="flex items-center justify-between text-[12px] text-slate-700 border border-slate-100 rounded-lg px-2.5 py-1.5">
                            <span>{s}</span><Clock className="h-3 w-3 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-[12px] font-bold text-slate-900 mb-2 inline-flex items-center gap-1.5"><Download className="h-3.5 w-3.5 text-blue-600" /> Export Options</div>
                      <div className="grid grid-cols-2 gap-2">
                        {["PDF","PPTX","XLSX","CSV","JSON","Email","Slack","Teams"].map((f) => (
                          <button key={f} className="h-8 text-[11.5px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50">{f}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
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
