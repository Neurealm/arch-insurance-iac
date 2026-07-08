import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  ArrowLeft, ShieldCheck, ShieldAlert, Activity, Server, Bot, Bell, Search,
  CheckCircle2, AlertTriangle, Clock, DollarSign, Zap, FileDown, RefreshCcw,
  Layers, Database, TrendingUp, ChevronRight, Send, MessageSquare, Play,
  Wrench, PowerOff, Sparkles, HardDrive, Cloud, Network, Boxes, XCircle,
  BookOpen, Settings, Users, Gauge,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  Area, AreaChart, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

// ---------- Data ----------
const statusPills = [
  { l: "Operational Status",          v: "All Systems Normal", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  { l: "Assets Managed",              v: "52,318" },
  { l: "Patch Sources Connected",     v: "24 Live" },
  { l: "Threat Intelligence",         v: "Streaming" },
  { l: "Compliance Coverage",         v: "12 Frameworks" },
  { l: "Last Compliance Scan",        v: "43 sec ago" },
  { l: "Patch Success Rate (30d)",    v: "96.3%" },
  { l: "Maintenance Window",          v: "Open · Wave 2" },
];

const kpis = [
  { icon: ShieldCheck,   l: "Enterprise Patch Compliance",     v: "96.8%",   sub: "Compliant",             color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: ShieldAlert,   l: "Critical Vulnerabilities",        v: "41",      sub: "Immediate action",      color: "text-red-600",     bg: "bg-red-50" },
  { icon: XCircle,       l: "Failed Patch Deployments",        v: "127",     sub: "Pending remediation",   color: "text-orange-600",  bg: "bg-orange-50" },
  { icon: HardDrive,     l: "Devices Missing Critical Patches",v: "318",     sub: "+26 vs yesterday",      color: "text-orange-600",  bg: "bg-orange-50" },
  { icon: AlertTriangle, l: "High-Risk Assets",                v: "76",      sub: "+8 vs yesterday",       color: "text-red-600",     bg: "bg-red-50" },
  { icon: Clock,         l: "Mean Time to Patch",              v: "4.3 d",   sub: "-0.6 d vs 7d",          color: "text-blue-600",    bg: "bg-blue-50" },
  { icon: Bot,           l: "Automated Remediations",          v: "1,214",   sub: "today",                 color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Gauge,         l: "Compliance Framework Score",      v: "87%",     sub: "annualized",            color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: ShieldAlert,   l: "Critical CVEs",                   v: "63",      sub: "12 KEV",                color: "text-red-600",     bg: "bg-red-50" },
  { icon: Zap,           l: "Zero-Day Exposure",               v: "7",       sub: "actively exploited",    color: "text-red-600",     bg: "bg-red-50" },
  { icon: Network,       l: "Internet-Facing at Risk",         v: "122",     sub: "18 tier-0",             color: "text-orange-600",  bg: "bg-orange-50" },
  { icon: Layers,        l: "Business Services at Risk",       v: "31",      sub: "3 revenue critical",    color: "text-red-600",     bg: "bg-red-50" },
  { icon: ShieldCheck,   l: "Cyber Risk Reduction",            v: "-42%",    sub: "quarter-to-date",       color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Clock,         l: "Downtime Prevented",              v: "194 h",   sub: "annualized",            color: "text-violet-600",  bg: "bg-violet-50" },
  { icon: DollarSign,    l: "Financial Exposure Avoided",      v: "$14.2M",  sub: "annualized",            color: "text-emerald-600", bg: "bg-emerald-50" },
];

const platforms = [
  { p: "Windows Server",   assets: 24532, comp: 97.2, at: 426, non: 215 },
  { p: "Linux (RHEL/Ubuntu/SUSE)", assets: 9853, comp: 95.1, at: 312, non: 164 },
  { p: "VMware ESXi",      assets: 2342,  comp: 96.5, at: 74,  non: 39  },
  { p: "Network Devices",  assets: 2165,  comp: 94.0, at: 101, non: 84  },
  { p: "Applications",     assets: 1942,  comp: 95.6, at: 62,  non: 36  },
  { p: "Databases",        assets: 1164,  comp: 93.7, at: 58,  non: 64  },
  { p: "Cloud Instances",  assets: 8298,  comp: 97.8, at: 88,  non: 22  },
  { p: "Firmware / BIOS",  assets: 1822,  comp: 89.4, at: 141, non: 71  },
];

const cves = [
  { id: "CVE-2026-3094",  cvss: 9.8, epss: 94.2, kev: true,  affected: 128, risk: 96 },
  { id: "CVE-2026-38063", cvss: 9.1, epss: 78.6, kev: true,  affected: 76,  risk: 92 },
  { id: "CVE-2026-21413", cvss: 8.6, epss: 65.4, kev: true,  affected: 214, risk: 88 },
  { id: "CVE-2026-21887", cvss: 8.1, epss: 51.3, kev: false, affected: 342, risk: 82 },
  { id: "CVE-2026-27982", cvss: 7.8, epss: 45.1, kev: true,  affected: 568, risk: 78 },
  { id: "CVE-2025-49113", cvss: 7.6, epss: 38.4, kev: false, affected: 189, risk: 72 },
];

const pipeline = [
  { s: "Patch Released",      count: 248, ok: 100 },
  { s: "Threat Correlation",  count: 248, ok: 100 },
  { s: "Risk Assessment",     count: 214, ok: 99 },
  { s: "Approval",            count: 198, ok: 98 },
  { s: "Testing",             count: 183, ok: 97 },
  { s: "Pilot Group",         count: 159, ok: 96 },
  { s: "Production Wave 1",   count: 132, ok: 95 },
  { s: "Production Wave 2",   count: 98,  ok: 94 },
  { s: "Validation",          count: 74,  ok: 96 },
  { s: "Compliance Verify",   count: 62,  ok: 98 },
  { s: "CMDB Update",         count: 42,  ok: 99 },
  { s: "Executive Reporting", count: 36,  ok: 100 },
];

const failed = [
  { host: "WEB-SRV-0221", env: "Production", kb: "KB5036683", vendor: "Microsoft", reason: "Reboot Pending",         age: "2d 4h",  auto: true  },
  { host: "SQL-DB-0114",  env: "Production", kb: "KB5037767", vendor: "Microsoft", reason: "Dependency Failure",     age: "1d 7h",  auto: true  },
  { host: "APP-SRV-0456", env: "Production", kb: "KB5038874", vendor: "Microsoft", reason: "Insufficient Disk Space",age: "1d 3h",  auto: true  },
  { host: "LINUX-APP-0198", env: "Production", kb: "RHSA-2026-1234", vendor: "Red Hat", reason: "Package Conflict", age: "19h 42m", auto: false },
  { host: "VMHOST-07A1",  env: "Production", kb: "ESXi-8.0U2c", vendor: "VMware",  reason: "Reboot Required",        age: "3d 1h",  auto: true  },
  { host: "PAN-FW-EDGE02",env: "Production", kb: "PAN-11.1.4", vendor: "Palo Alto", reason: "Config Drift",          age: "14h",    auto: false },
  { host: "ORA-DB-0341",  env: "Production", kb: "CPU-Jul26",  vendor: "Oracle",   reason: "Certificate Failure",    age: "8h",     auto: true  },
  { host: "K8S-NODE-118", env: "Staging",    kb: "Ubuntu-22.04-SEC", vendor: "Canonical", reason: "Automation Failure", age: "6h",  auto: true  },
];

const aiRecs = [
  { title: "Retry failed patch deployments (127 assets)", conf: 96, impact: "High",   auto: true,  reduction: "-38% risk" },
  { title: "Clear pending reboot on 42 devices",          conf: 95, impact: "High",   auto: true,  reduction: "-22% risk" },
  { title: "Repair Windows Update Agent on 86 hosts",     conf: 92, impact: "High",   auto: true,  reduction: "-18% risk" },
  { title: "Expand disk space on affected servers",       conf: 88, impact: "Medium", auto: false, reduction: "-9% risk"  },
  { title: "Approve & deploy critical zero-day patches",  conf: 97, impact: "Critical",auto: true, reduction: "-52% risk" },
  { title: "Reset SCCM client cache on 214 endpoints",    conf: 90, impact: "Medium", auto: true,  reduction: "-11% risk" },
];

const rootCauses = [
  { c: "Reboot Pending",         pct: 28, n: 349, color: "#3b82f6" },
  { c: "Insufficient Disk Space",pct: 16, n: 224, color: "#f59e0b" },
  { c: "WSUS / SCCM Issues",     pct: 14, n: 175, color: "#10b981" },
  { c: "Dependency / Conflict",  pct: 12, n: 150, color: "#6366f1" },
  { c: "Corrupt Update Cache",   pct: 8,  n: 100, color: "#ef4444" },
  { c: "Permission Issues",      pct: 6,  n: 75,  color: "#8b5cf6" },
  { c: "Application Lock",       pct: 5,  n: 62,  color: "#ec4899" },
  { c: "Offline Device",         pct: 4,  n: 50,  color: "#14b8a6" },
  { c: "Other",                  pct: 7,  n: 62,  color: "#64748b" },
];

const zeroDayThreats = [
  { id: "CVE-2026-3094",  cvss: 9.8, status: "Active Exploitation", affected: 128 },
  { id: "CVE-2026-38063", cvss: 9.1, status: "Active Exploitation", affected: 76  },
  { id: "CVE-2026-21413", cvss: 8.6, status: "PoC Available",       affected: 214 },
];

const bizServices = [
  { svc: "Patient Portal",         risk: "Critical", exposure: "$3.7M", downtime: "8.4h" },
  { svc: "Payment Processing",     risk: "Critical", exposure: "$5.1M", downtime: "6.2h" },
  { svc: "E-Commerce Platform",    risk: "High",     exposure: "$2.9M", downtime: "4.1h" },
  { svc: "Manufacturing Execution",risk: "High",     exposure: "$2.2M", downtime: "3.8h" },
  { svc: "HR Management System",   risk: "Medium",   exposure: "$0.9M", downtime: "2.4h" },
];

const buCompliance = [
  { bu: "Infrastructure", pct: 97.3, risk: "Low",    critical: 18 },
  { bu: "Healthcare",     pct: 96.1, risk: "Medium", critical: 24 },
  { bu: "Finance",        pct: 97.8, risk: "Low",    critical: 12 },
  { bu: "Manufacturing",  pct: 95.2, risk: "Medium", critical: 15 },
  { bu: "Retail",         pct: 94.7, risk: "High",   critical: 22 },
  { bu: "Development",    pct: 97.1, risk: "Low",    critical: 8  },
  { bu: "Cloud",          pct: 98.3, risk: "Low",    critical: 6  },
  { bu: "Operations",     pct: 96.4, risk: "Medium", critical: 11 },
];

const frameworks = [
  { fw: "CIS Controls v8",         score: 92, findings: 42,  audit: "Ready"        },
  { fw: "NIST CSF 2.0",            score: 89, findings: 68,  audit: "Ready"        },
  { fw: "NIST 800-53 Rev 5",       score: 86, findings: 91,  audit: "In Progress"  },
  { fw: "HIPAA Security Rule",     score: 94, findings: 24,  audit: "Ready"        },
  { fw: "PCI DSS 4.0",             score: 91, findings: 33,  audit: "Ready"        },
  { fw: "SOX ITGC",                score: 96, findings: 12,  audit: "Ready"        },
  { fw: "ISO 27001:2022",          score: 88, findings: 54,  audit: "In Progress"  },
  { fw: "SOC 2 Type II",           score: 93, findings: 28,  audit: "Ready"        },
  { fw: "FedRAMP Moderate",        score: 82, findings: 118, audit: "Remediation"  },
  { fw: "CMMC Level 2",            score: 85, findings: 76,  audit: "In Progress"  },
  { fw: "MS Security Baselines",   score: 90, findings: 47,  audit: "Ready"        },
  { fw: "DISA STIG",               score: 84, findings: 112, audit: "Remediation"  },
];

const activityFeed = [
  { t: "12:34:02", tag: "Detect",   msg: "Detected failed patch KB5036683 on WEB-SRV-0221" },
  { t: "12:33:48", tag: "Correlate",msg: "Correlated CVE-2026-3094 to 42 exposed assets" },
  { t: "12:33:21", tag: "Deploy",   msg: "Deployed critical patch CVE-2026-3094 to 42 devices" },
  { t: "12:32:57", tag: "Change",   msg: "Created ServiceNow Change CHG0034567 · emergency patch" },
  { t: "12:32:34", tag: "Analyze",  msg: "Analyzed vulnerability posture · 41 critical vulnerabilities" },
  { t: "12:32:11", tag: "Scan",     msg: "Completed compliance scan · 52,318 assets scanned" },
  { t: "12:31:48", tag: "Rollback", msg: "Rolled back failed update on APP-SRV-0456 after health check" },
  { t: "12:31:22", tag: "Report",   msg: "Generated executive board cybersecurity summary" },
];

const integrations = [
  "SCCM","Intune","WSUS","Azure Update Mgr","AWS SSM","Red Hat Satellite",
  "Ansible","VMware LCM","Defender VM","Tenable","ServiceNow","Splunk",
  "Datadog","Microsoft Sentinel","CrowdStrike","Qualys VMDR","Rapid7","Ivanti",
];

const forecast = Array.from({ length: 18 }, (_, i) => ({
  day: `D${i * 2}`,
  compliance: Math.min(99, Math.round(93 + Math.sin(i / 2) * 1.4 + i * 0.15)),
  critical:   Math.max(6,  Math.round(58 - i * 1.6 + Math.cos(i / 2) * 2)),
  automated:  Math.min(99, Math.round(72 + i * 1.4)),
}));

const investigationTabs = [
  "Executive Summary","Patch Timeline","Deployment Workflow","Threat Intelligence",
  "Windows Update Logs","Linux Package Logs","SCCM Logs","WSUS Logs",
  "Azure Update Manager","AWS Systems Manager","VMware Lifecycle Manager",
  "Configuration Drift","Dependency Analysis","Root Cause","Historical Comparison",
  "Knowledge Articles","Runbooks","Automation Options","Rollback","Export",
];

// ---------- Small UI helpers ----------
function riskCls(r: string) {
  return r === "Critical" ? "text-red-700 bg-red-50 border-red-200"
    : r === "High" ? "text-orange-700 bg-orange-50 border-orange-200"
    : r === "Medium" ? "text-amber-700 bg-amber-50 border-amber-200"
    : r === "Low" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : "text-slate-700 bg-slate-50 border-slate-200";
}
function auditCls(a: string) {
  return a === "Ready" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : a === "In Progress" ? "text-blue-700 bg-blue-50 border-blue-200"
    : "text-orange-700 bg-orange-50 border-orange-200";
}

// ---------- Component ----------
export default function PatchComplianceFailureRemediation() {
  const [selectedHost, setSelectedHost] = useState<string | null>("WEB-SRV-0221");
  const [investigation, setInvestigation] = useState<string | null>(null);
  const [copilotQ, setCopilotQ] = useState("");

  const selected = useMemo(() => failed.find(f => f.host === selectedHost) ?? failed[0], [selectedHost]);

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
          <div className="px-6 py-4 flex items-start gap-4">
            <Link to="/coworkers/infrastructure-automation" className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-600 uppercase tracking-wide">
                <Bot className="w-3.5 h-3.5" /> Digital Coworker
              </div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                Patch Compliance & Failure Remediation
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">AI POWERED</span>
              </h1>
              <p className="text-xs text-slate-600 mt-1 max-w-4xl">
                Continuously assess patch compliance, identify deployment failures, prioritize remediation based on business risk and vulnerability exposure,
                automate patch recovery workflows, and maintain secure, compliant infrastructure across hybrid enterprise environments.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" />Global Search</button>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"><FileDown className="w-3.5 h-3.5" />Export</button>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"><RefreshCcw className="w-3.5 h-3.5" />Refresh</button>
              <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"><Bell className="w-4 h-4 text-slate-600" /></button>
            </div>
          </div>

          {/* Status pills */}
          <div className="px-6 pb-3 flex flex-wrap gap-2">
            {statusPills.map((p, i) => (
              <div key={i} className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${p.cls ?? "text-slate-700 bg-white border-slate-200"} flex items-center gap-1.5`}>
                {p.dot && <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />}
                <span className="text-slate-500 font-medium">{p.l}:</span>
                <span>{p.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {kpis.map((k) => (
              <div key={k.l} className="rounded-xl border border-slate-200 bg-white p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-slate-500">{k.l}</div>
                  <div className={`w-7 h-7 rounded-lg ${k.bg} flex items-center justify-center`}>
                    <k.icon className={`w-4 h-4 ${k.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{k.v}</div>
                <div className={`text-[11px] font-medium ${k.color}`}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Row: Forecast + CVE Intelligence + Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">Compliance & Risk Forecast (36 days)</div>
                  <div className="text-[11px] text-slate-500">AI projection · patch success, critical CVEs, automation coverage</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">94% confidence</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gComp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.35} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                      <linearGradient id="gCrit" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                      <linearGradient id="gAuto" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="compliance" name="Compliance %" stroke="#10b981" fill="url(#gComp)" strokeWidth={2} />
                    <Area type="monotone" dataKey="critical"   name="Critical CVEs" stroke="#ef4444" fill="url(#gCrit)" strokeWidth={2} />
                    <Area type="monotone" dataKey="automated"  name="Automation %"  stroke="#3b82f6" fill="url(#gAuto)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">Vulnerability Intelligence (Top by Risk)</div>
                  <div className="text-[11px] text-slate-500">CVSS · EPSS · KEV · affected assets</div>
                </div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All</button>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="text-left px-2 py-1.5">CVE</th>
                      <th className="text-right px-2 py-1.5">CVSS</th>
                      <th className="text-right px-2 py-1.5">EPSS</th>
                      <th className="text-center px-2 py-1.5">KEV</th>
                      <th className="text-right px-2 py-1.5">Assets</th>
                      <th className="px-2 py-1.5">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cves.map((c) => (
                      <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-2 py-1.5 font-mono font-semibold text-slate-900">{c.id}</td>
                        <td className="px-2 py-1.5 text-right font-bold text-red-600">{c.cvss}</td>
                        <td className="px-2 py-1.5 text-right text-slate-700">{c.epss}%</td>
                        <td className="px-2 py-1.5 text-center">{c.kev ? <span className="text-red-600 font-bold">Yes</span> : <span className="text-slate-400">No</span>}</td>
                        <td className="px-2 py-1.5 text-right text-slate-700">{c.affected}</td>
                        <td className="px-2 py-1.5">
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-400 to-red-500" style={{ width: `${c.risk}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-bold text-slate-900 mb-3">Patch Deployment Pipeline</div>
              <div className="space-y-1.5 max-h-64 overflow-auto pr-1">
                {pipeline.map((p, idx) => (
                  <div key={p.s} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center justify-center">{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold text-slate-800 truncate">{p.s}</div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${p.ok}%` }} />
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-700 w-8 text-right">{p.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row: Platform compliance + Business Unit + Business services */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-bold text-slate-900 mb-3">Patch Compliance by Platform</div>
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="text-left px-2 py-1.5">Platform</th>
                      <th className="text-right px-2 py-1.5">Assets</th>
                      <th className="text-right px-2 py-1.5">Compliant</th>
                      <th className="text-right px-2 py-1.5">At Risk</th>
                      <th className="text-right px-2 py-1.5">Non-Compliant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platforms.map((p) => (
                      <tr key={p.p} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-2 py-1.5 font-semibold text-slate-900">{p.p}</td>
                        <td className="px-2 py-1.5 text-right text-slate-700">{p.assets.toLocaleString()}</td>
                        <td className="px-2 py-1.5 text-right text-emerald-600 font-semibold">{p.comp}%</td>
                        <td className="px-2 py-1.5 text-right text-amber-600 font-semibold">{p.at}</td>
                        <td className="px-2 py-1.5 text-right text-red-600 font-semibold">{p.non}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-bold text-slate-900 mb-3">Compliance by Business Unit</div>
              <div className="space-y-1.5">
                {buCompliance.map((b) => (
                  <div key={b.bu} className="flex items-center gap-2">
                    <div className="w-28 text-[11px] font-semibold text-slate-800 truncate">{b.bu}</div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${b.pct >= 97 ? "bg-emerald-500" : b.pct >= 95 ? "bg-lime-500" : "bg-amber-500"}`} style={{ width: `${b.pct}%` }} />
                    </div>
                    <div className="w-12 text-right text-[11px] font-bold text-slate-800">{b.pct}%</div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${riskCls(b.risk)}`}>{b.risk}</span>
                    <div className="w-8 text-right text-[11px] text-slate-500">{b.critical}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-bold text-slate-900 mb-3">Business Services at Risk</div>
              <div className="space-y-2">
                {bizServices.map((s) => (
                  <div key={s.svc} className="rounded-lg border border-slate-100 p-2 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-slate-900">{s.svc}</div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${riskCls(s.risk)}`}>{s.risk}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>Exposure <span className="text-slate-800 font-semibold">{s.exposure}</span></span>
                      <span>Downtime <span className="text-slate-800 font-semibold">{s.downtime}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row: Failed deployments + AI Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">Failed Patch Deployments (127)</div>
                  <div className="text-[11px] text-slate-500">Click a row to open the AI investigation workspace</div>
                </div>
                <button className="text-[11px] font-semibold text-blue-600 hover:underline">View All</button>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="text-left px-2 py-1.5">Hostname</th>
                      <th className="text-left px-2 py-1.5">Environment</th>
                      <th className="text-left px-2 py-1.5">KB / Patch</th>
                      <th className="text-left px-2 py-1.5">Vendor</th>
                      <th className="text-left px-2 py-1.5">Failure Reason</th>
                      <th className="text-right px-2 py-1.5">Age</th>
                      <th className="text-center px-2 py-1.5">Auto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failed.map((f) => (
                      <tr key={f.host}
                          onClick={() => { setSelectedHost(f.host); setInvestigation(f.host); }}
                          className={`border-t border-slate-100 cursor-pointer ${selectedHost === f.host ? "bg-blue-50/60" : "hover:bg-slate-50"}`}>
                        <td className="px-2 py-1.5 font-mono font-semibold text-slate-900">{f.host}</td>
                        <td className="px-2 py-1.5 text-slate-700">{f.env}</td>
                        <td className="px-2 py-1.5 text-slate-700 font-mono">{f.kb}</td>
                        <td className="px-2 py-1.5 text-slate-700">{f.vendor}</td>
                        <td className="px-2 py-1.5">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">{f.reason}</span>
                        </td>
                        <td className="px-2 py-1.5 text-right text-slate-600">{f.age}</td>
                        <td className="px-2 py-1.5 text-center">
                          {f.auto
                            ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Auto</span>
                            : <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">Manual</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-blue-600" />AI Recommendations</div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">Live</span>
              </div>
              <div className="space-y-2">
                {aiRecs.map((r) => (
                  <div key={r.title} className="rounded-lg border border-slate-100 p-2.5 hover:shadow-sm">
                    <div className="text-[11px] font-semibold text-slate-900">{r.title}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span>Confidence <span className="text-blue-600 font-bold">{r.conf}%</span></span>
                      <span>·</span>
                      <span>Impact <span className={`font-bold ${r.impact === "Critical" ? "text-red-600" : r.impact === "High" ? "text-orange-600" : "text-amber-600"}`}>{r.impact}</span></span>
                      <span>·</span>
                      <span className="text-emerald-600 font-semibold">{r.reduction}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button className="text-[10px] font-semibold px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"><Play className="w-3 h-3" />Execute</button>
                      <button className="text-[10px] font-semibold px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Approve</button>
                      {r.auto && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Automation Ready</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row: Root cause + zero-day + engineering panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-bold text-slate-900 mb-3">Patch Failure Root Causes (30d)</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={rootCauses} dataKey="pct" innerRadius={38} outerRadius={68} paddingAngle={2}>
                        {rootCauses.map((r) => <Cell key={r.c} fill={r.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1">
                  {rootCauses.map((r) => (
                    <div key={r.c} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-sm" style={{ background: r.color }} />
                        <span className="text-slate-700 truncate">{r.c}</span>
                      </div>
                      <span className="text-slate-900 font-bold">{r.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 text-center text-[11px] text-slate-500">1,247 total failures</div>
            </div>

            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-900">Zero-Day Intelligence</div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">Emergency Campaign Active</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-center">
                  <div className="text-[10px] text-red-700 font-semibold">Critical 0-Days</div>
                  <div className="text-lg font-bold text-red-700">7</div>
                </div>
                <div className="rounded-lg bg-orange-50 border border-orange-200 p-2 text-center">
                  <div className="text-[10px] text-orange-700 font-semibold">Actively Exploited</div>
                  <div className="text-lg font-bold text-orange-700">3</div>
                </div>
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-center">
                  <div className="text-[10px] text-amber-700 font-semibold">Internet Facing</div>
                  <div className="text-lg font-bold text-amber-700">122</div>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr><th className="text-left px-2 py-1">CVE</th><th className="text-right px-2 py-1">CVSS</th><th className="text-left px-2 py-1">Status</th><th className="text-right px-2 py-1">Assets</th><th></th></tr>
                  </thead>
                  <tbody>
                    {zeroDayThreats.map((z) => (
                      <tr key={z.id} className="border-t border-slate-100">
                        <td className="px-2 py-1 font-mono font-semibold">{z.id}</td>
                        <td className="px-2 py-1 text-right text-red-600 font-bold">{z.cvss}</td>
                        <td className="px-2 py-1 text-orange-700 font-semibold">{z.status}</td>
                        <td className="px-2 py-1 text-right">{z.affected}</td>
                        <td className="px-2 py-1 text-right"><button className="text-[10px] font-semibold text-red-700 hover:underline">Remediate</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Server className="w-4 h-4 text-blue-600" />Engineering Panel</div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">{selected.host}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                <div><div className="text-slate-500">Environment</div><div className="font-semibold text-slate-900">{selected.env}</div></div>
                <div><div className="text-slate-500">Vendor / OS</div><div className="font-semibold text-slate-900">{selected.vendor}</div></div>
                <div><div className="text-slate-500">Patch ID</div><div className="font-mono font-semibold text-slate-900">{selected.kb}</div></div>
                <div><div className="text-slate-500">Failure Reason</div><div className="font-semibold text-red-600">{selected.reason}</div></div>
                <div><div className="text-slate-500">IP Address</div><div className="font-semibold text-slate-900">10.10.25.34</div></div>
                <div><div className="text-slate-500">Business Owner</div><div className="font-semibold text-slate-900">Finance Applications</div></div>
                <div><div className="text-slate-500">Criticality</div><div className="font-semibold text-red-600">Tier-1</div></div>
                <div><div className="text-slate-500">CMDB CI</div><div className="font-mono font-semibold text-slate-900">CI-00012345</div></div>
                <div><div className="text-slate-500">CVSS / EPSS</div><div className="font-semibold text-slate-900">9.8 · 94.2%</div></div>
                <div><div className="text-slate-500">KEV</div><div className="font-semibold text-red-600">Yes</div></div>
                <div><div className="text-slate-500">Defender VM Score</div><div className="font-semibold text-orange-600">78 / 100</div></div>
                <div><div className="text-slate-500">Last Backup</div><div className="font-semibold text-slate-900">8 min ago</div></div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <button className="text-[10px] font-semibold px-2 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1"><Play className="w-3 h-3" />Retry</button>
                <button className="text-[10px] font-semibold px-2 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1"><Wrench className="w-3 h-3" />Repair</button>
                <button className="text-[10px] font-semibold px-2 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1"><PowerOff className="w-3 h-3" />Reboot</button>
                <button className="text-[10px] font-semibold px-2 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1"><Zap className="w-3 h-3" />Automate</button>
              </div>
            </div>
          </div>

          {/* Compliance frameworks */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-slate-900">Compliance Framework Dashboard</div>
              <div className="text-[11px] text-slate-500">12 frameworks · continuous evidence collection</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {frameworks.map((f) => (
                <div key={f.fw} className="rounded-lg border border-slate-100 p-2.5 hover:shadow-sm">
                  <div className="text-[11px] font-semibold text-slate-900 truncate">{f.fw}</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xl font-bold text-slate-900">{f.score}<span className="text-xs text-slate-500">%</span></div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${auditCls(f.audit)}`}>{f.audit}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div className={`h-full ${f.score >= 90 ? "bg-emerald-500" : f.score >= 85 ? "bg-lime-500" : "bg-amber-500"}`} style={{ width: `${f.score}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{f.findings} findings</div>
                </div>
              ))}
            </div>
          </div>

          {/* Automation library + Activity feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Bot className="w-4 h-4 text-blue-600" />Automation Library</div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">14 workflows ready</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { n: "Run Compliance Scan",           t: "3 min",  r: true },
                  { n: "Deploy Critical Patch",         t: "22 min", r: true },
                  { n: "Deploy Emergency Patch",        t: "18 min", r: true },
                  { n: "Retry Failed Deployment",       t: "8 min",  r: true },
                  { n: "Repair Windows Update",         t: "12 min", r: true },
                  { n: "Repair WSUS",                   t: "16 min", r: true },
                  { n: "Repair SCCM Client",            t: "10 min", r: true },
                  { n: "Repair Package Repository",     t: "14 min", r: true },
                  { n: "Validate Patch Installation",   t: "5 min",  r: false },
                  { n: "Rollback Patch",                t: "20 min", r: true },
                  { n: "Create Maintenance Window",     t: "2 min",  r: false },
                  { n: "Approve Emergency Change",      t: "1 min",  r: false },
                  { n: "Executive Compliance Report",   t: "4 min",  r: false },
                  { n: "Validate Compliance Framework", t: "9 min",  r: false },
                ].map((w) => (
                  <div key={w.n} className="rounded-lg border border-slate-100 p-2 hover:bg-slate-50 hover:shadow-sm">
                    <div className="text-[11px] font-semibold text-slate-900">{w.n}</div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                      <span>~{w.t}</span>
                      {w.r && <span className="text-emerald-600 font-semibold">Rollback</span>}
                    </div>
                    <button className="mt-1 w-full text-[10px] font-semibold px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1"><Play className="w-3 h-3" />Run</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-900">Digital Coworker Activity Feed</div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">Live · Replay</span>
              </div>
              <div className="space-y-2 max-h-72 overflow-auto pr-1">
                {activityFeed.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <div className="w-14 shrink-0 text-slate-500 font-mono">{a.t}</div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">{a.tag}</span>
                    <div className="text-slate-800">{a.msg}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="text-[11px] font-semibold text-slate-700 mb-1.5">Enterprise Integrations</div>
                <div className="flex flex-wrap gap-1.5">
                  {integrations.map((i) => (
                    <span key={i} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200">{i}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Copilot */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center"><MessageSquare className="w-4 h-4" /></div>
              <div>
                <div className="text-sm font-bold text-slate-900">AI Copilot · Patch & Vulnerability</div>
                <div className="text-[11px] text-slate-500">Ask about deployment failures, CVEs, business impact, remediation, and compliance</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                "Why did KB5036683 fail on WEB-SRV-0221?",
                "Which systems remain vulnerable to CVE-2026-3094?",
                "Predict compliance next month",
                "Generate executive board cybersecurity summary",
                "Which business services are most exposed?",
              ].map((q) => (
                <button key={q} onClick={() => setCopilotQ(q)} className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50">{q}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={copilotQ}
                onChange={(e) => setCopilotQ(e.target.value)}
                placeholder="Ask the Digital Coworker about patch compliance, vulnerabilities, or remediation…"
                className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="text-xs font-semibold px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"><Send className="w-3.5 h-3.5" />Ask</button>
            </div>
          </div>
        </div>

        {/* AI Investigation drawer */}
        {investigation && (
          <div className="fixed inset-0 z-40 bg-slate-900/40 flex justify-end" onClick={() => setInvestigation(null)}>
            <div className="w-full max-w-3xl bg-white h-full overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">AI Investigation Workspace</div>
                  <div className="text-sm font-bold text-slate-900">{investigation} · {selected.reason}</div>
                </div>
                <button className="p-1.5 rounded-md hover:bg-slate-100" onClick={() => setInvestigation(null)}><XCircle className="w-4 h-4 text-slate-500" /></button>
              </div>
              <div className="px-5 py-3">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {investigationTabs.map((t, i) => (
                    <span key={t} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${i === 0 ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"}`}>{t}</span>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 p-3 mb-3">
                  <div className="text-[11px] font-semibold text-slate-500 mb-2">Executive Summary</div>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    Patch deployment <span className="font-mono font-semibold">{selected.kb}</span> failed on <span className="font-mono font-semibold">{investigation}</span> due to <span className="font-semibold text-red-600">{selected.reason}</span>.
                    The host runs a Tier-1 workload in <span className="font-semibold">Finance Applications</span> and remains exposed to CVE-2026-3094 (CVSS 9.8, KEV). The Digital Coworker
                    has staged an automated remediation plan with a validated rollback path, ServiceNow change CHG0034567, and pilot validation on 3 canary hosts.
                    Predicted successful re-deployment: <span className="font-semibold text-emerald-600">94% confidence</span> within a 22-minute maintenance window.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="text-[11px] font-semibold text-slate-500 mb-2">Root Cause Analysis</div>
                    <ul className="text-[11px] text-slate-800 space-y-1 list-disc pl-4">
                      <li>Pending reboot from prior servicing stack update</li>
                      <li>Servicing stack version mismatch (10.0.19041.4123 → 4291)</li>
                      <li>Windows Update database (DataStore.edb) size 2.4 GB · corruption suspected</li>
                      <li>Group policy delaying reboot beyond maintenance window</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="text-[11px] font-semibold text-slate-500 mb-2">Recommended Automation</div>
                    <ul className="text-[11px] text-slate-800 space-y-1 list-disc pl-4">
                      <li>Run Repair Windows Update Components (12 min · rollback ready)</li>
                      <li>Extend maintenance window to Wave 2 (auto-approve)</li>
                      <li>Force reboot during change window via SCCM</li>
                      <li>Re-run KB5036683 with validation gate</li>
                      <li>Update CMDB and executive report on completion</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <div className="text-[11px] font-semibold text-slate-500 mb-2">Deployment Timeline (last 24h)</div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={forecast.slice(0, 12).map((f, i) => ({ h: `H-${(11 - i) * 2}`, attempts: 2 + (i % 3), success: (i % 3 === 0 ? 0 : 1) + (i % 2) }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="h" tick={{ fontSize: 10, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        <Line dataKey="attempts" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                        <Line dataKey="success"  stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4">
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">Rollback Plan</button>
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">Export PDF</button>
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"><Play className="w-3.5 h-3.5" />Execute Remediation</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
