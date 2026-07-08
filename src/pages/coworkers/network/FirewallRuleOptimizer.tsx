import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowLeft, Bell, Bot, Boxes, Brain, ChartBar, CheckCircle2,
  Cog, Filter, Gauge, HelpCircle, Layers, LineChart, Lock, Network, Play, RefreshCw,
  Search, Server, Settings, ShieldCheck, Sparkles, Users, Wand2,
  Workflow, X, FileText, Send, GitBranch, Cloud, ClipboardCheck, Fingerprint,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const card = "rounded-2xl border border-slate-200 bg-white shadow-sm";
const glass = "rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm shadow-sm";
const chip = "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border";
const okChip = `${chip} border-emerald-200 bg-emerald-50 text-emerald-700`;
const warnChip = `${chip} border-amber-200 bg-amber-50 text-amber-700`;
const critChip = `${chip} border-red-200 bg-red-50 text-red-700`;
const infoChip = `${chip} border-blue-200 bg-blue-50 text-blue-700`;

const statusDot = (s: string) =>
  s === "Healthy" || s === "Success" || s === "Compliant" ? "bg-emerald-500"
    : s === "Moderate" || s === "Warning" || s === "Medium" ? "bg-amber-500"
    : s === "High" ? "bg-orange-500"
    : s === "Critical" ? "bg-red-500"
    : "bg-slate-400";
const statusColor = (s: string) =>
  s === "Healthy" || s === "Compliant" ? "text-emerald-600"
    : s === "Moderate" || s === "Warning" || s === "Medium" ? "text-amber-600"
    : s === "High" ? "text-orange-600"
    : s === "Critical" ? "text-red-600"
    : s === "Low" ? "text-slate-600"
    : "text-slate-600";

const KPIS = [
  { icon: ShieldCheck, label: "Overall Firewall Hygiene", value: "97.4%",  sub: "Healthy",         tone: "text-emerald-600" },
  { icon: AlertTriangle,label: "High-Risk Rules",          value: "146",    sub: "Critical",        tone: "text-red-600" },
  { icon: Layers,      label: "Shadowed Rules",            value: "2,318",  sub: "High",            tone: "text-orange-600" },
  { icon: FileText,    label: "Unused Rules",              value: "14,287", sub: "Medium",          tone: "text-amber-600" },
  { icon: Boxes,       label: "Duplicate Objects",         value: "9,843",  sub: "Medium",          tone: "text-amber-600" },
  { icon: Gauge,       label: "Policy Complexity Score",   value: "72",     sub: "Moderate",        tone: "text-amber-600" },
  { icon: Bot,         label: "Automated Cleanups",        value: "416",    sub: "Today",           tone: "text-blue-600" },
  { icon: ChartBar,    label: "Est. Rule Reduction",       value: "18%",    sub: "Potential",       tone: "text-emerald-600" },
  { icon: Lock,        label: "Cyber Risk Reduction",      value: "41%",    sub: "Annualized",      tone: "text-emerald-600" },
  { icon: ClipboardCheck, label: "Annual Operational Savings", value: "$4.6M", sub: "Estimated",    tone: "text-emerald-600" },
];

const HEADER = [
  { label: "Operational",          sub: "All Systems Normal", dot: "bg-emerald-500" },
  { label: "Firewalls Managed",    sub: "412" },
  { label: "Security Policies",    sub: "286,942" },
  { label: "Objects",              sub: "1.84 Million" },
  { label: "Rules Analyzed",       sub: "742,611" },
  { label: "Last Policy Analysis", sub: "14 Seconds Ago" },
  { label: "AI Optimization Engine", sub: "Active", tone: "text-emerald-600" },
];

const TOPO = [
  { label: "Enterprise",        count: "1",       icon: Boxes },
  { label: "Regions",           count: "6",       icon: Cloud },
  { label: "Datacenters",       count: "14",      icon: Server },
  { label: "Cloud Platforms",   count: "3",       icon: Cloud },
  { label: "Firewalls",         count: "412",     icon: ShieldCheck },
  { label: "Security Zones",    count: "167",     icon: Network },
  { label: "Policy Packages",   count: "1,286",   icon: Layers },
  { label: "Rules",             count: "742,611", icon: FileText },
  { label: "Objects",           count: "1.84M",   icon: Boxes },
  { label: "Applications",      count: "684",     icon: Cog },
  { label: "Business Services", count: "412",     icon: Users },
];

const FIREWALLS = [
  { fw: "PA-DC01",  vendor: "Palo Alto",   pol: 128, rules: "45,231", hits: "12.4 M", unused: "1,284", shadow: "523", risk: 92, health: "Healthy"  },
  { fw: "PA-DC02",  vendor: "Palo Alto",   pol: 114, rules: "38,722", hits: "8.7 M",  unused: "947",   shadow: "311", risk: 88, health: "Healthy"  },
  { fw: "FG-DC01",  vendor: "Fortinet",    pol: 96,  rules: "36,884", hits: "6.1 M",  unused: "1,642", shadow: "276", risk: 76, health: "Moderate" },
  { fw: "CSF-DC01", vendor: "Cisco",       pol: 104, rules: "52,771", hits: "14.2 M", unused: "2,341", shadow: "764", risk: 68, health: "Moderate" },
  { fw: "CP-DC01",  vendor: "Check Point", pol: 79,  rules: "29,663", hits: "4.8 M",  unused: "1,129", shadow: "263", risk: 72, health: "Moderate" },
  { fw: "AZ-FW-HUB",vendor: "Azure",       pol: 86,  rules: "22,114", hits: "3.2 M",  unused: "531",   shadow: "161", risk: 85, health: "Healthy"  },
  { fw: "AWS-NFW-01",vendor: "AWS",        pol: 64,  rules: "18,943", hits: "2.6 M",  unused: "286",   shadow: "98",  risk: 90, health: "Healthy"  },
  { fw: "JW-SRX-01",vendor: "Juniper",     pol: 42,  rules: "14,097", hits: "1.6 M",  unused: "213",   shadow: "67",  risk: 88, health: "Healthy"  },
];

const AI_OPT = [
  { fw: "CSF-DC01",  pol: "Internet_Access",   risk: 92, comp: "High",   dup: 124, shadow: 87, cleanup: "312 rules", impact: "High",   auto: "95%" },
  { fw: "PA-DC01",   pol: "App_Allow_List",    risk: 88, comp: "High",   dup: 98,  shadow: 64, cleanup: "276 rules", impact: "High",   auto: "92%" },
  { fw: "FG-DC01",   pol: "VPN_Policies",      risk: 81, comp: "High",   dup: 76,  shadow: 45, cleanup: "184 rules", impact: "Medium", auto: "88%" },
  { fw: "CP-DC01",   pol: "Legacy_Policies",   risk: 79, comp: "Medium", dup: 64,  shadow: 38, cleanup: "162 rules", impact: "Medium", auto: "89%" },
  { fw: "PA-DC02",   pol: "DMZ_Access",        risk: 78, comp: "Medium", dup: 52,  shadow: 31, cleanup: "128 rules", impact: "Medium", auto: "91%" },
  { fw: "AWS-NFW-01",pol: "App_Microservices", risk: 74, comp: "Medium", dup: 41,  shadow: 28, cleanup: "106 rules", impact: "Low",    auto: "88%" },
  { fw: "AZ-FW-HUB", pol: "Outbound_Internet", risk: 70, comp: "Medium", dup: 33,  shadow: 19, cleanup: "84 rules",  impact: "Medium", auto: "90%" },
  { fw: "JW-SRX-01", pol: "Data_Center_Core",  risk: 70, comp: "Medium", dup: 27,  shadow: 16, cleanup: "62 rules",  impact: "Low",    auto: "86%" },
  { fw: "PA-DC01",   pol: "Guest_Networks",    risk: 67, comp: "Medium", dup: 22,  shadow: 12, cleanup: "58 rules",  impact: "Low",    auto: "85%" },
  { fw: "FG-DC01",   pol: "Branch_Policies",   risk: 65, comp: "Medium", dup: 18,  shadow: 8,  cleanup: "41 rules",  impact: "Low",    auto: "83%" },
];

const ISSUES = [
  { i: "Shadowed Allow Rule",           fw: "CSF-DC01",   impact: "High",   risk: "Critical", act: "Investigate" },
  { i: "Unused VPN Policy",              fw: "PA-DC01",   impact: "High",   risk: "High",     act: "Investigate" },
  { i: "Duplicate Address Object",       fw: "PA-DC02",   impact: "High",   risk: "High",     act: "Investigate" },
  { i: "Orphaned NAT Rule",              fw: "FG-DC01",   impact: "High",   risk: "Critical", act: "Investigate" },
  { i: "Overly Permissive Any-Any",      fw: "CP-DC01",   impact: "High",   risk: "Critical", act: "Investigate" },
  { i: "Temporary Rule Expired",         fw: "AZ-FW-HUB", impact: "Medium", risk: "High",     act: "Investigate" },
  { i: "Rule Missing Business Owner",    fw: "PA-DC01",   impact: "Medium", risk: "Medium",   act: "Investigate" },
  { i: "Application Dependency Missing", fw: "AWS-NFW-01",impact: "Low",    risk: "Medium",   act: "Investigate" },
  { i: "Object Naming Violation",        fw: "FG-DC01",   impact: "Low",    risk: "Medium",   act: "Investigate" },
  { i: "Duplicate Service Group",        fw: "JW-SRX-01", impact: "Low",    risk: "Medium",   act: "Investigate" },
];

const RECOMMENDATIONS = [
  { r: "Remove Unused Rules",       conf: 95, red: "High",   rules: 4321, auto: true },
  { r: "Merge Duplicate Objects",    conf: 93, red: "High",   rules: 2167, auto: true },
  { r: "Remove Shadowed Rules",      conf: 94, red: "High",   rules: 2318, auto: true },
  { r: "Optimize NAT Policies",      conf: 88, red: "Medium", rules: 824,  auto: true },
  { r: "Normalize Object Names",     conf: 90, red: "Low",    rules: 1024, auto: true },
  { r: "Archive Expired Policies",   conf: 88, red: "Medium", rules: 312,  auto: true },
];

const RULE_LIFECYCLE = [
  { l: "New Rules (30d)",  v: "1,842", d: "↑ 12%", tone: "text-emerald-600" },
  { l: "Temporary Rules",   v: "2,731", d: "↑ 8%",  tone: "text-amber-600" },
  { l: "Expired Rules",     v: "1,128", d: "↑ 5%",  tone: "text-red-600" },
  { l: "Emergency Rules",   v: "214",   d: "↑ 2%",  tone: "text-red-600" },
  { l: "Unused Rules",      v: "14,287",d: "↓ 3%",  tone: "text-emerald-600" },
  { l: "Disabled Rules",    v: "6,431", d: "↓ 7%",  tone: "text-emerald-600" },
  { l: "Awaiting Review",    v: "3,146", d: "↑ 0%",  tone: "text-slate-600" },
  { l: "Missing Owner",     v: "1,326", d: "↓ 4%",  tone: "text-emerald-600" },
];

const HEATMAP_COLS = ["Compliance","Complexity","Unused","Shadowed","Duplicates","NAT","Zones","Objects","Risk","Optim."] as const;
const HEATMAP = [
  { fw: "PA-DC01",   cells: ["g","a","a","a","a","g","g","g","r","g"] },
  { fw: "PA-DC02",   cells: ["g","g","g","g","a","g","g","a","a","g"] },
  { fw: "FG-DC01",   cells: ["a","a","r","a","a","a","g","a","r","g"] },
  { fw: "CSF-DC01",  cells: ["a","r","r","r","r","a","a","r","r","a"] },
  { fw: "CP-DC01",   cells: ["a","a","a","a","r","g","g","a","r","g"] },
  { fw: "AZ-FW-HUB", cells: ["g","g","g","g","a","g","g","g","a","g"] },
  { fw: "AWS-NFW-01",cells: ["g","g","g","g","g","g","g","g","g","g"] },
  { fw: "JW-SRX-01", cells: ["g","g","a","g","g","g","g","g","g","g"] },
];

const OBJECT_HEALTH = [
  { l: "Valid & Active", v: "1,352,114 (73.4%)", tone: "bg-emerald-500" },
  { l: "Unused",         v: "312,451 (17.0%)",   tone: "bg-amber-500" },
  { l: "Duplicate",      v: "98,372 (5.3%)",     tone: "bg-orange-500" },
  { l: "Orphaned",       v: "41,287 (2.2%)",     tone: "bg-red-500" },
  { l: "Invalid",        v: "19,776 (1.1%)",     tone: "bg-red-600" },
  { l: "Overlapping",    v: "14,143 (0.8%)",     tone: "bg-amber-600" },
  { l: "Missing Docs",   v: "6,857 (0.2%)",      tone: "bg-slate-400" },
];

const COMPLIANCE = [
  { f: "NIST CSF",       score: 94, status: "Compliant" },
  { f: "NIST 800-53",    score: 92, status: "Compliant" },
  { f: "CIS Controls",   score: 89, status: "Compliant" },
  { f: "PCI DSS",        score: 96, status: "Compliant" },
  { f: "HIPAA",          score: 91, status: "Compliant" },
  { f: "ISO 27001",      score: 90, status: "Compliant" },
  { f: "ISO 27002",      score: 82, status: "Compliant" },
  { f: "Zero Trust Maturity", score: 71, status: "Moderate" },
];

const ACTIVITY = [
  { t: "12:34:25", d: "Analyzed 742,611 firewall rules across 412 firewalls", status: "Success" },
  { t: "12:34:32", d: "Detected 523 shadowed rules on CSF-DC01",              status: "High" },
  { t: "12:34:16", d: "Correlated duplicate objects across 8 firewalls",       status: "High" },
  { t: "12:34:02", d: "Calculated 18% potential rule reduction",              status: "Success" },
  { t: "12:33:48", d: "Generated optimization plan for PA-DC01",              status: "Success" },
  { t: "12:33:35", d: "Executed cleanup: removed 108 unused rules",           status: "Success" },
  { t: "12:33:22", d: "Validated application connectivity post-cleanup",       status: "Success" },
  { t: "12:33:10", d: "Generated executive summary report",                    status: "Success" },
];

const AUTOMATIONS = [
  { name: "Remove Unused Rules",            desc: "Purge rules with zero hit-count > threshold",  runtime: "2-6 min" },
  { name: "Merge Duplicate Objects",        desc: "Consolidate address/service objects",          runtime: "3-8 min" },
  { name: "Normalize Object Names",         desc: "Apply naming convention across firewalls",     runtime: "1-3 min" },
  { name: "Archive Expired Rules",          desc: "Move expired policies to archive",             runtime: "1-2 min" },
  { name: "Optimize NAT",                   desc: "Consolidate NAT policies and hide rules",      runtime: "4-10 min" },
  { name: "Validate App Dependencies",       desc: "Confirm apps mapped to policy packages",       runtime: "5-15 min" },
  { name: "Run Compliance Assessment",      desc: "Score policies vs NIST/CIS/PCI/ISO",           runtime: "3-6 min" },
  { name: "Generate Cleanup Report",        desc: "Executive-grade PDF/PPT report",               runtime: "1-2 min" },
  { name: "Create Change Request",          desc: "Open ServiceNow CHG with rule diff",           runtime: "< 1 min" },
  { name: "Backup Configuration",           desc: "Snapshot pre-change firewall config",          runtime: "1-3 min" },
  { name: "Rollback Configuration",         desc: "Restore last known-good baseline",             runtime: "2-5 min" },
  { name: "Run Policy Simulation",          desc: "Simulate policy change against live traffic",  runtime: "5-10 min" },
];

const INTEGRATIONS = [
  "Palo Alto Panorama","Cisco FMC","Cisco Defense Orchestrator","Fortinet FortiManager","Check Point SmartConsole",
  "Juniper Security Director","AlgoSec","FireMon","Tufin SecureTrack","Azure Firewall Manager","AWS Network Firewall",
  "Google Cloud Firewall","Prisma Cloud","ServiceNow CMDB","ServiceNow Change","Microsoft Sentinel","Microsoft Defender XDR",
  "CrowdStrike Falcon","Splunk Enterprise","Cribl","Datadog","Dynatrace","Azure Monitor","VMware NSX","Cisco ACI","Infoblox","F5 BIG-IP",
];

const TIME_RANGES = ["01D","7D","30D","90D","180D"] as const;

function StatusPill({ status }: { status: string }) {
  const cls = status === "Critical" ? critChip
    : status === "High" || status === "Warning" || status === "Moderate" ? warnChip
    : status === "Medium" ? infoChip
    : okChip;
  return (
    <span className={cls}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot(status)}`} />
      {status}
    </span>
  );
}

function Sparkline({ tone = "emerald" as "emerald" | "amber" | "red" | "blue" }) {
  const stroke = tone === "emerald" ? "#10b981" : tone === "amber" ? "#f59e0b" : tone === "red" ? "#ef4444" : "#3b82f6";
  const pts = [4, 6, 5, 8, 7, 9, 6, 11, 9, 12, 10, 14, 12, 13];
  const w = 90, h = 22;
  const d = pts.map((y, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * w} ${h - y}`).join(" ");
  return <svg width={w} height={h}><path d={d} fill="none" stroke={stroke} strokeWidth="1.5" /></svg>;
}

function ComplexityChart() {
  const series = [
    { name: "Rule Count",     color: "#3b82f6", data: [30, 34, 38, 42, 47, 51, 56, 60, 65, 71, 76, 82] },
    { name: "Avg Rule Length",color: "#10b981", data: [20, 23, 26, 30, 33, 36, 40, 43, 47, 51, 55, 60] },
    { name: "Object Refs",    color: "#f59e0b", data: [35, 40, 46, 50, 56, 60, 66, 71, 76, 80, 85, 90] },
    { name: "Nested Groups",  color: "#a855f7", data: [22, 25, 28, 32, 35, 38, 42, 46, 50, 53, 57, 62] },
    { name: "Policy Depth",   color: "#ef4444", data: [18, 22, 25, 27, 31, 35, 39, 43, 48, 52, 57, 60] },
  ];
  const w = 620, h = 220, pad = 30, max = 100;
  const line = (d: number[]) =>
    d.map((y, i) => `${i === 0 ? "M" : "L"} ${pad + (i / (d.length - 1)) * (w - pad * 2)} ${h - pad - (y / max) * (h - pad * 2)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {[0, 25, 50, 75, 100].map((g) => (
        <line key={g} x1={pad} x2={w - pad} y1={h - pad - (g / max) * (h - pad * 2)} y2={h - pad - (g / max) * (h - pad * 2)} stroke="#e2e8f0" strokeDasharray="3 3" />
      ))}
      {series.map((s) => <path key={s.name} d={line(s.data)} stroke={s.color} strokeWidth="2" fill="none" />)}
      {["May 26","Jun 2","Jun 9","Jun 16","Jun 23","Now"].map((l,i)=>(
        <text key={l} x={pad + (i/5)*(w-pad*2)} y={h-8} className="fill-slate-400" style={{fontSize:9}} textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

function heatColor(v: string) {
  return v === "g" ? "bg-emerald-500" : v === "a" ? "bg-amber-500" : v === "r" ? "bg-red-500" : "bg-slate-300";
}

export default function FirewallRuleOptimizer() {
  const nav = useNavigate();
  const [range, setRange] = useState<(typeof TIME_RANGES)[number]>("30D");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ fw: string } | null>({ fw: "PA-DC01" });
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilot, setCopilot] = useState("");

  const filteredOpt = useMemo(() => {
    if (!query) return AI_OPT;
    const q = query.toLowerCase();
    return AI_OPT.filter((r) => r.fw.toLowerCase().includes(q) || r.pol.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="flex">
        {/* Left rail */}
        <aside className="hidden lg:flex w-64 shrink-0 bg-[#0b1e3f] text-slate-100 min-h-screen flex-col">
          <div className="p-4 flex items-center gap-3 border-b border-white/10">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 grid place-items-center ring-2 ring-blue-400/40">
              <Bot className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">Digital Coworker</div>
              <div className="text-[10px] text-blue-300">NOVA AI</div>
            </div>
          </div>
          <nav className="p-2 text-[13px] space-y-0.5 flex-1 overflow-y-auto">
            {[
              { label: "Overview",           icon: LineChart, active: true },
              { label: "Firewall Topology",  icon: Network },
              { label: "Policy Health",      icon: ShieldCheck },
              { label: "Object Health",      icon: Boxes },
              { label: "Risk Prediction",    icon: Sparkles },
              { label: "Rule Lifecycle",     icon: GitBranch },
              { label: "Policy Complexity",  icon: Layers },
              { label: "NAT Analysis",       icon: Fingerprint },
              { label: "Compliance",         icon: ClipboardCheck },
              { label: "Business Impact",    icon: Users },
              { label: "Security Posture",   icon: Lock },
              { label: "Issues & Findings",  icon: AlertTriangle },
              { label: "Recommendations",    icon: Wand2 },
              { label: "Automation",         icon: Workflow },
              { label: "Reports",            icon: ChartBar },
              { label: "Insights",           icon: Brain },
              { label: "Activity Feed",      icon: Activity },
              { label: "Settings",           icon: Settings },
            ].map((n) => {
              const I = n.icon;
              return (
                <button key={n.label}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 transition ${n.active ? "bg-blue-500/20 text-white" : "text-slate-300 hover:bg-white/5"}`}>
                  <I className="h-4 w-4" /><span className="truncate">{n.label}</span>
                </button>
              );
            })}
            <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-wider text-blue-300/70">Quick Actions</div>
            {["Run Hygiene Assessment","Optimize Policies","Cleanup Unused Rules","Merge Duplicate Objects","Validate Dependencies","Generate Report","Create Change Request"].map((q) => (
              <button key={q} className="w-full text-left rounded-lg px-3 py-1.5 text-[12px] text-slate-300 hover:bg-white/5 flex items-center gap-2">
                <Play className="h-3 w-3 text-blue-300" /> {q}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-500/20 grid place-items-center"><Sparkles className="h-4 w-4 text-blue-300" /></div>
            <div className="text-[11px]"><div className="text-slate-400">Powered by</div><div className="font-semibold">NOVA AI</div></div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-30">
            <div className="px-6 py-3 flex items-center gap-4">
              <button onClick={() => nav(-1)} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] uppercase tracking-widest text-blue-600 font-semibold">Digital Coworker</div>
                  <span className={infoChip}><Brain className="h-3 w-3" /> AI Powered</span>
                </div>
                <h1 className="text-xl font-bold leading-tight">Firewall Rule Optimizer</h1>
                <p className="text-[11px] text-slate-500 leading-snug max-w-3xl">
                  Continuously assess firewall policy quality, object integrity, security posture, rule lifecycle, compliance,
                  and architectural consistency to eliminate unnecessary complexity, reduce cyber risk, improve operational
                  efficiency, and automate firewall governance across hybrid enterprise environments.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4 text-[11px]">
                {HEADER.map((h) => (
                  <div key={h.label} className="flex flex-col items-start">
                    <div className="flex items-center gap-1">
                      {h.dot && <span className={`h-1.5 w-1.5 rounded-full ${h.dot}`} />}
                      <span className="text-slate-500">{h.label}</span>
                    </div>
                    <span className={`font-semibold ${h.tone ?? "text-slate-900"}`}>{h.sub}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button className="relative h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50">
                  <Bell className="h-4 w-4 text-slate-600" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 grid place-items-center text-[9px] font-bold bg-red-500 text-white rounded-full">6</span>
                </button>
                <button className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"><HelpCircle className="h-4 w-4 text-slate-600" /></button>
                <button className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"><Users className="h-4 w-4 text-slate-600" /></button>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* KPIs */}
            <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {KPIS.map((k) => {
                const I = k.icon;
                return (
                  <div key={k.label} className={`${card} p-3 hover:shadow-md transition cursor-pointer`}>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 grid place-items-center"><I className="h-3.5 w-3.5" /></div>
                      <div className="text-[10px] text-slate-500 leading-tight">{k.label}</div>
                    </div>
                    <div className={`mt-2 text-xl font-bold ${k.tone}`}>{k.value}</div>
                    <div className="text-[10px] text-slate-500">{k.sub}</div>
                    <div className="mt-1"><Sparkline tone={k.tone.includes("red") ? "red" : k.tone.includes("amber") ? "amber" : k.tone.includes("blue") ? "blue" : "emerald"} /></div>
                  </div>
                );
              })}
            </section>

            {/* Topology + Policy Health + Object Health + Selected Panel */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-4 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Enterprise Firewall Topology</h3>
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="space-y-1.5">
                  {TOPO.map((t, i) => {
                    const I = t.icon;
                    return (
                      <div key={t.label} className="flex items-center gap-2 text-[11px]">
                        <div className="w-4 flex justify-center">
                          {i > 0 && <div className="w-px h-3 bg-slate-200" />}
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-slate-100 bg-slate-50/60 flex-1">
                          <I className="h-3.5 w-3.5 text-slate-600" />
                          <span className="text-slate-700 font-medium">{t.label}</span>
                          <span className="ml-auto text-slate-500">{t.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1 text-[10px]">
                  {[
                    { c: "bg-emerald-500", l: "Healthy > 90%" },
                    { c: "bg-amber-500",   l: "Warning 70-90%" },
                    { c: "bg-orange-500",  l: "High Risk 50-70%" },
                    { c: "bg-red-500",     l: "Critical < 50%" },
                    { c: "bg-slate-400",   l: "Unknown" },
                  ].map((x) => (
                    <div key={x.l} className="flex items-center gap-1 text-slate-600"><span className={`h-2 w-2 rounded-full ${x.c}`} />{x.l}</div>
                  ))}
                </div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-4 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Firewall Policy Health</h3>
                  <button className="text-[11px] text-blue-600 hover:underline">View All Firewalls</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead className="text-slate-500">
                      <tr className="text-left">
                        <th className="py-1 pr-2 font-medium">Firewall</th>
                        <th className="py-1 pr-2 font-medium">Vendor</th>
                        <th className="py-1 pr-2 font-medium">Pol</th>
                        <th className="py-1 pr-2 font-medium">Rules</th>
                        <th className="py-1 pr-2 font-medium">Hits (24h)</th>
                        <th className="py-1 pr-2 font-medium">Unused</th>
                        <th className="py-1 pr-2 font-medium">Shadow</th>
                        <th className="py-1 pr-2 font-medium">Risk</th>
                        <th className="py-1 font-medium">Health</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FIREWALLS.map((f) => (
                        <tr key={f.fw} className="border-t border-slate-100 hover:bg-blue-50/40 cursor-pointer" onClick={()=>setSelected({fw:f.fw})}>
                          <td className="py-1.5 pr-2 font-medium text-slate-900">{f.fw}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{f.vendor}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{f.pol}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{f.rules}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{f.hits}</td>
                          <td className="py-1.5 pr-2 text-amber-600">{f.unused}</td>
                          <td className="py-1.5 pr-2 text-red-600">{f.shadow}</td>
                          <td className="py-1.5 pr-2 text-slate-700 font-semibold">{f.risk}</td>
                          <td className="py-1.5"><StatusPill status={f.health} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-2 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Security Object Health</h3>
                </div>
                <div className="relative h-32 w-32 mx-auto rounded-full grid place-items-center"
                     style={{background: "conic-gradient(#10b981 0 73%, #f59e0b 73% 90%, #f97316 90% 95%, #ef4444 95% 97%, #dc2626 97% 98%, #d97706 98% 99.5%, #94a3b8 99.5% 100%)"}}>
                  <div className="h-24 w-24 rounded-full bg-white grid place-items-center">
                    <div className="text-center">
                      <div className="text-lg font-bold">1.84M</div>
                      <div className="text-[9px] text-slate-500 leading-tight">Total Objects</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-[10px]">
                  {OBJECT_HEALTH.map((o) => (
                    <div key={o.l} className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${o.tone}`} />
                      <span className="text-slate-600 flex-1">{o.l}</span>
                      <span className="font-semibold text-slate-900">{o.v}</span>
                    </div>
                  ))}
                </div>
                <button className="text-[11px] text-blue-600 hover:underline mt-2 w-full text-center">View All Objects</button>
              </div>

              <div className={`${card} col-span-12 xl:col-span-2 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Selected Firewall</h3>
                  {selected && <button onClick={()=>setSelected(null)}><X className="h-4 w-4 text-slate-400" /></button>}
                </div>
                {selected ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{selected.fw}</div>
                      <div className="text-[10px] text-slate-500">Palo Alto Networks PA-5220</div>
                      <span className={`${okChip} mt-1`}>Healthy</span>
                    </div>
                    <div className="grid grid-cols-3 text-[10px] border-b border-slate-100 pb-2 gap-1">
                      {["Overview","Policies","Objects","NAT","Endpoints","History"].map((t,i)=>(
                        <button key={t} className={`py-1 truncate ${i===0?"text-blue-600 border-b-2 border-blue-600 -mb-[9px]":"text-slate-500"}`}>{t}</button>
                      ))}
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold mb-1">General</div>
                      <div className="text-[11px] space-y-0.5">
                        {[["Management IP","10.10.10.21"],["HA Status","Active/Passive"],["Software","11.1.3-h2"],["Model","PA-5220"],["Serial","012345678901"],["Location","DC1 · NY"],["Business Owner","Network Security"],["Support Expiry","Jan 15, 2026"]].map(([k,v])=>(
                          <div key={k} className="flex justify-between">
                            <span className="text-slate-500">{k}</span>
                            <span className="text-slate-900 font-medium truncate">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold mb-1">Performance (Live)</div>
                      <div className="grid grid-cols-4 gap-1 text-[10px] text-center">
                        {[["CPU","23%"],["Memory","38%"],["Sess.","128K"],["Thpt","2.3 Gbps"]].map(([l,v])=>(
                          <div key={l} className={`${glass} p-1.5`}>
                            <div className="text-slate-500">{l}</div>
                            <div className="font-semibold text-slate-900">{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold mb-1">Policies</div>
                      <div className="text-[11px] space-y-0.5">
                        {[["Policy Packages","128"],["Security Rules","45,231"],["NAT Rules","8,742"],["Rule Hit Count (24h)","12.4 M"],["Unused Rules","1,284"],["Shadowed Rules","523"]].map(([k,v])=>(
                          <div key={k} className="flex justify-between"><span className="text-slate-500">{k}</span><span className="text-slate-900 font-medium">{v}</span></div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 pt-1">
                      <button className="flex-1 text-[10px] border border-slate-200 rounded-md py-1 hover:bg-slate-50">Investigate</button>
                      <button className="flex-1 text-[10px] bg-blue-600 hover:bg-blue-700 text-white rounded-md py-1">Run Cleanup</button>
                      <button className="flex-1 text-[10px] border border-slate-200 rounded-md py-1 hover:bg-slate-50">Create Change</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500">Select a firewall to view engineering details.</div>
                )}
              </div>
            </section>

            {/* AI Optimization + Lifecycle + Heat Map */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-5 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold">AI Policy Optimization <span className="text-slate-400 font-normal">(Top 10 Opportunities)</span></h3>
                    <div className="text-[10px] text-slate-500">Powered by NOVA AI · Confidence-scored</div>
                  </div>
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-1.5" />
                    <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search firewalls, policies..."
                      className="text-[11px] pl-6 pr-2 py-1 rounded-md border border-slate-200" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead className="text-slate-500">
                      <tr className="text-left">
                        <th className="py-1 pr-2 font-medium">Firewall</th>
                        <th className="py-1 pr-2 font-medium">Policy</th>
                        <th className="py-1 pr-2 font-medium">Risk</th>
                        <th className="py-1 pr-2 font-medium">Complexity</th>
                        <th className="py-1 pr-2 font-medium">Duplicates</th>
                        <th className="py-1 pr-2 font-medium">Shadowed</th>
                        <th className="py-1 pr-2 font-medium">Est. Cleanup</th>
                        <th className="py-1 pr-2 font-medium">Impact</th>
                        <th className="py-1 font-medium">Auto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOpt.map((r,i)=>(
                        <tr key={i} className="border-t border-slate-100 hover:bg-blue-50/40 cursor-pointer">
                          <td className="py-1.5 pr-2 font-medium text-slate-900">{r.fw}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{r.pol}</td>
                          <td className="py-1.5 pr-2 text-slate-700 font-semibold">{r.risk}</td>
                          <td className={`py-1.5 pr-2 font-semibold ${statusColor(r.comp)}`}>{r.comp}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{r.dup}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{r.shadow}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{r.cleanup}</td>
                          <td className={`py-1.5 pr-2 font-semibold ${statusColor(r.impact)}`}>{r.impact}</td>
                          <td className="py-1.5 text-emerald-600 font-semibold">{r.auto}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="text-[11px] text-blue-600 hover:underline mt-2">View All Optimization Opportunities</button>
              </div>

              <div className={`${card} col-span-12 xl:col-span-3 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Rule Lifecycle Dashboard</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {RULE_LIFECYCLE.map((l)=>(
                    <div key={l.l} className={`${glass} p-2`}>
                      <div className="text-[10px] text-slate-500">{l.l}</div>
                      <div className="font-bold text-slate-900">{l.v}</div>
                      <div className={`text-[10px] ${l.tone}`}>{l.d}</div>
                    </div>
                  ))}
                </div>
                <button className="text-[11px] text-blue-600 hover:underline mt-2">View All Rule Lifecycle Metrics</button>
              </div>

              <div className={`${card} col-span-12 xl:col-span-4 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Security Policy Heat Map</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead className="text-slate-500">
                      <tr className="text-left">
                        <th className="py-1 pr-2 font-medium"> </th>
                        {HEATMAP_COLS.map((c)=>(<th key={c} className="py-1 px-1 font-medium text-center">{c}</th>))}
                      </tr>
                    </thead>
                    <tbody>
                      {HEATMAP.map((row)=>(
                        <tr key={row.fw} className="border-t border-slate-100">
                          <td className="py-1.5 pr-2 font-medium text-slate-900">{row.fw}</td>
                          {row.cells.map((cell, idx)=>(
                            <td key={idx} className="py-1.5 px-1 text-center">
                              <span className={`inline-block h-4 w-6 rounded-sm ${heatColor(cell)}`} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="text-[11px] text-blue-600 hover:underline mt-2">View Full Heat Map</button>
              </div>
            </section>

            {/* Top Issues + AI Recommendations + Complexity + Business Impact */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-3 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Top Issues</h3>
                  <button className="text-[11px] text-blue-600 hover:underline">View All</button>
                </div>
                <table className="w-full text-[11px]">
                  <tbody>
                    {ISSUES.map((i)=>(
                      <tr key={i.i} className="border-t border-slate-100 first:border-0">
                        <td className="py-1.5 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${statusDot(i.risk)}`} />
                            <span className="text-slate-900">{i.i}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 ml-3.5">{i.fw}</div>
                        </td>
                        <td className={`py-1.5 pr-2 text-[10px] font-semibold ${statusColor(i.impact)}`}>{i.impact}</td>
                        <td className={`py-1.5 pr-2 text-[10px] font-semibold ${statusColor(i.risk)}`}>{i.risk}</td>
                        <td className="py-1.5 text-[10px] text-blue-600 font-medium">{i.act}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={`${card} col-span-12 xl:col-span-3 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">AI Recommendations <span className="text-slate-400 font-normal">(Top 6)</span></h3>
                </div>
                <table className="w-full text-[11px]">
                  <thead className="text-slate-500">
                    <tr className="text-left">
                      <th className="py-1 pr-2 font-medium">Recommendation</th>
                      <th className="py-1 pr-2 font-medium">Conf.</th>
                      <th className="py-1 pr-2 font-medium">Reduction</th>
                      <th className="py-1 font-medium">Auto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECOMMENDATIONS.map((r)=>(
                      <tr key={r.r} className="border-t border-slate-100">
                        <td className="py-1.5 pr-2 text-slate-900">{r.r}</td>
                        <td className="py-1.5 pr-2 text-emerald-600 font-semibold">{r.conf}%</td>
                        <td className={`py-1.5 pr-2 font-semibold ${statusColor(r.red)}`}>{r.red}</td>
                        <td className="py-1.5 text-slate-700">{r.rules.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="text-[11px] text-blue-600 hover:underline mt-2">View All Recommendations</button>
              </div>

              <div className={`${card} col-span-12 xl:col-span-3 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Policy Complexity Analytics</h3>
                  <div className="flex items-center gap-1">
                    {TIME_RANGES.map((r) => (
                      <button key={r} onClick={()=>setRange(r)}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${range===r?"bg-blue-600 text-white":"text-slate-600 hover:bg-slate-100"}`}>{r}</button>
                    ))}
                  </div>
                </div>
                <div className="h-[180px] mt-1"><ComplexityChart /></div>
                <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-600">
                  {[["Rule Count","742,611","bg-blue-500"],["Avg Rule Length","14.2","bg-emerald-500"],["Object References","5.8M","bg-amber-500"],["Nested Groups","96,432","bg-purple-500"],["Policy Depth","6.2","bg-red-500"],["Exception Count","42,817","bg-slate-500"]].map(([k,v,c])=>(
                    <div key={k} className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${c}`} /><span className="text-slate-500 flex-1 truncate">{k}</span><span className="font-semibold">{v}</span></div>
                  ))}
                </div>
                <button className="text-[11px] text-blue-600 hover:underline mt-2">View Full Analytics</button>
              </div>

              <div className={`${card} col-span-12 xl:col-span-3 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Business Impact Dashboard</h3>
                  <button className="text-[11px] text-blue-600 hover:underline">View Full Map</button>
                </div>
                <div className="space-y-1 text-[11px]">
                  {[["Applications at Risk","68","text-red-600"],["Users Impacted","125,430","text-slate-900"],["Revenue Exposure","$8.7M","text-slate-900"],["Operational Priority","High","text-amber-600"],["Change Risk","Medium","text-amber-600"]].map(([k,v,t])=>(
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500">{k}</span>
                      <span className={`font-semibold ${t}`}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1 text-[11px]">
                  {[["Applications","684"],["Business Services","412"],["Departments","62"],["Revenue Streams","28"],["Customers","1.2M"]].map(([l,v])=>(
                    <div key={l} className="flex items-center justify-between border border-slate-100 rounded-md px-2 py-1">
                      <span className="text-slate-600">{l}</span><span className="font-semibold text-slate-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Compliance + Activity + Automation */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-4 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Compliance Posture</h3>
                  <button className="text-[11px] text-blue-600 hover:underline">View Full Report</button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 rounded-full grid place-items-center"
                       style={{background: "conic-gradient(#10b981 0 91%, #e2e8f0 91% 100%)"}}>
                    <div className="h-20 w-20 rounded-full bg-white grid place-items-center">
                      <div className="text-center">
                        <div className="text-base font-bold text-emerald-600">91%</div>
                        <div className="text-[9px] text-slate-500">Compliant</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-[10px]">
                    <div className="text-slate-500 mb-1">Overall Compliance Score</div>
                    {COMPLIANCE.map((c)=>(
                      <div key={c.f} className="flex items-center gap-2 py-0.5">
                        <span className="text-slate-700 flex-1">{c.f}</span>
                        <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{width:`${c.score}%`}} />
                        </div>
                        <span className={`text-[10px] font-semibold ${c.status==="Compliant"?"text-emerald-600":"text-amber-600"}`}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
                  <div className={`${glass} p-2 text-center`}><div className="text-slate-500 text-[10px]">Critical Findings</div><div className="font-bold text-red-600">24</div></div>
                  <div className={`${glass} p-2 text-center`}><div className="text-slate-500 text-[10px]">High Findings</div><div className="font-bold text-amber-600">57</div></div>
                  <div className={`${glass} p-2 text-center`}><div className="text-slate-500 text-[10px]">Audit Readiness</div><div className="font-bold text-emerald-600">83%</div></div>
                </div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-4 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Digital Coworker Activity Feed <span className="text-slate-400 font-normal">(Live)</span></h3>
                  <button className="text-[11px] text-blue-600 hover:underline">View Full Activity</button>
                </div>
                <div className="space-y-2">
                  {ACTIVITY.map((a,i)=>(
                    <div key={i} className="grid grid-cols-[64px_1fr_80px] gap-2 text-[11px] items-center border-b border-slate-100 pb-1.5 last:border-0">
                      <div className="text-slate-500 font-mono text-[10px]">{a.t}</div>
                      <div className="text-slate-900">{a.d}</div>
                      <div className="justify-self-end"><StatusPill status={a.status} /></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-4 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Automation Library</h3>
                  <button className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Sync</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto">
                  {AUTOMATIONS.map((a) => (
                    <div key={a.name} className="rounded-lg border border-slate-200 p-2 hover:border-blue-300 hover:bg-blue-50/40 transition cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-blue-50 text-blue-600 grid place-items-center"><Workflow className="h-3 w-3" /></div>
                        <div className="text-[11px] font-semibold text-slate-900">{a.name}</div>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">{a.desc}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-500">{a.runtime}</span>
                        <button className="text-[10px] text-blue-600 font-semibold flex items-center gap-1"><Play className="h-3 w-3" /> Launch</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Reports + Integrations */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-5 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Executive Reporting</h3>
                  <span className="text-[10px] text-slate-500">One-click export</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {["Firewall Hygiene Assessment","Executive Firewall Risk Report","Policy Complexity Report","Security Object Optimization","Compliance Assessment","Zero Trust Readiness","Firewall Cleanup Opportunities","Weekly Security Ops Dashboard","Board Cybersecurity Summary","Policy Lifecycle Report"].map((r)=>(
                    <button key={r} className="text-left rounded-lg border border-slate-200 p-2 hover:border-blue-300 hover:bg-blue-50/40 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-slate-800">{r}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 text-[10px] mt-2 text-slate-500">Formats: <span className="font-semibold text-slate-700">PPT · PDF · Excel · Word · Markdown</span></div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-7 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Enterprise Integrations</h3>
                  <span className="text-[10px] text-slate-500">{INTEGRATIONS.length} connected · Data Refreshed: 14 Seconds Ago</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {INTEGRATIONS.map((i) => (
                    <span key={i} className="text-[11px] px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-blue-500" /> {i}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer bar */}
            <section className={`${card} p-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-500`}>
              <span className="flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" /> Data Refreshed: 14 Seconds Ago</span>
              <span>|</span>
              <span>412 Firewalls</span>
              <span>|</span>
              <span>286,942 Policies</span>
              <span>|</span>
              <span>742,611 Rules</span>
              <span>|</span>
              <span>1.84M Objects</span>
              <span>|</span>
              <span>684 Applications</span>
              <span>|</span>
              <span>412 Business Services</span>
              <span className="ml-auto">© 2025 NOVA AI Digital Coworker</span>
            </section>
          </div>
        </main>
      </div>

      {/* Copilot */}
      <button onClick={()=>setCopilotOpen(v=>!v)} className="fixed bottom-5 right-5 z-40 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl grid place-items-center">
        <Brain className="h-5 w-5" />
      </button>
      {copilotOpen && (
        <div className="fixed bottom-20 right-5 z-40 w-[360px] max-h-[70vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="p-3 border-b border-slate-200 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center"><Sparkles className="h-4 w-4" /></div>
            <div>
              <div className="text-sm font-bold">NOVA AI Copilot</div>
              <div className="text-[10px] text-slate-500">Ask about rules, objects, or compliance</div>
            </div>
            <button className="ml-auto" onClick={()=>setCopilotOpen(false)}><X className="h-4 w-4 text-slate-400" /></button>
          </div>
          <div className="p-3 space-y-2 overflow-y-auto flex-1">
            <div className="text-[11px] text-slate-500">Suggested questions</div>
            {[
              "Which firewall rules create the highest risk?",
              "Show unused firewall rules.",
              "Recommend cleanup opportunities.",
              "Predict policy growth over six months.",
              "Show duplicate objects.",
              "Validate Zero Trust readiness.",
              "Generate a firewall hygiene report.",
            ].map((q)=>(
              <button key={q} onClick={()=>setCopilot(q)} className="w-full text-left text-[11px] px-2 py-1.5 rounded-md border border-slate-200 hover:bg-blue-50/50">{q}</button>
            ))}
          </div>
          <div className="p-2 border-t border-slate-200 flex items-center gap-2">
            <input value={copilot} onChange={(e)=>setCopilot(e.target.value)} placeholder="Ask NOVA..."
              className="flex-1 text-[12px] px-2 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-300" />
            <button className="h-8 w-8 grid place-items-center rounded-md bg-blue-600 text-white hover:bg-blue-700"><Send className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
