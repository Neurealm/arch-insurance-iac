import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Activity, AlertTriangle, Bot, CheckCircle, Cloud, Cpu, Database, GitBranch,
  GitCommit, GitPullRequest, Globe, Layers, Network, Play, Rocket, Search,
  Server, Shield, ShieldCheck, Sparkles, Wifi, Workflow, X, Zap, FileCode,
  Boxes, LineChart, Terminal, Bell, HelpCircle, User, RotateCcw, Send,
} from "lucide-react";

/* ---------- data ---------- */

const liveIndicators = [
  { label: "Operational", value: "All Systems Normal", tone: "emerald", dot: true },
  { label: "Network Devices", value: "18,426" },
  { label: "Policy Templates", value: "1,384" },
  { label: "Automated Deployments", value: "97.8%" },
  { label: "IaC Coverage", value: "91%" },
  { label: "Last Deployment Analysis", value: "8 Seconds Ago" },
  { label: "AI Automation Engine", value: "Active", tone: "emerald" },
];

const kpis = [
  { label: "Zero Touch Automation", value: "91%", sub: "Enterprise Coverage", color: "text-emerald-600", bg: "bg-emerald-50", icon: Zap, spark: "emerald" },
  { label: "Policy Deployment Success", value: "99.2%", sub: "Success Rate", color: "text-emerald-600", bg: "bg-emerald-50", icon: ShieldCheck, spark: "emerald" },
  { label: "Pending Changes", value: "14", sub: "↑ 4 vs yesterday", color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle, spark: "amber" },
  { label: "Configuration Drift", value: "23", sub: "Devices  ↑ 6 vs yesterday", color: "text-amber-600", bg: "bg-amber-50", icon: Activity, spark: "amber" },
  { label: "Automated Remediations", value: "118", sub: "Today  ↑ 18 vs yesterday", color: "text-blue-600", bg: "bg-blue-50", icon: Bot, spark: "blue" },
  { label: "Failed Deployments", value: "2", sub: "Today  ↓ 1 vs yesterday", color: "text-red-600", bg: "bg-red-50", icon: X, spark: "red" },
  { label: "Policy Compliance", value: "98.7%", sub: "Compliant", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle, spark: "emerald" },
  { label: "IaC Adoption", value: "94%", sub: "Coverage", color: "text-violet-600", bg: "bg-violet-50", icon: FileCode, spark: "violet" },
  { label: "Mean Deployment Time", value: "4.8 min", sub: "Average", color: "text-blue-600", bg: "bg-blue-50", icon: Rocket, spark: "blue" },
  { label: "Operational Cost Reduction", value: "$8.4M", sub: "Annualized", color: "text-emerald-600", bg: "bg-emerald-50", icon: LineChart, spark: "emerald" },
];

const topologyRings = [
  { label: "Enterprise", n: 1 },
  { label: "8 Regions", n: 8 },
  { label: "31 Campuses", n: 31 },
  { label: "8 Data Centers", n: 8 },
  { label: "5 Clouds", n: 5 },
  { label: "Spine (48)", n: 48 },
  { label: "Leaf (194)", n: 194 },
  { label: "Distribution (312)", n: 312 },
  { label: "Access (1,256)", n: 1256 },
];

const pipelineStages = [
  { s: "Business Intent", ok: "100%", auto: "92%", time: "2m", inProg: 0 },
  { s: "Policy Design", ok: "99%", auto: "95%", time: "3m", inProg: 1 },
  { s: "AI Validation", ok: "99%", auto: "96%", time: "1m", inProg: 0 },
  { s: "Approval", ok: "100%", auto: "100%", time: "30s", inProg: 2 },
  { s: "Git Commit", ok: "100%", auto: "100%", time: "45s", inProg: 0 },
  { s: "Terraform", ok: "98%", auto: "98%", time: "4m", inProg: 3 },
];

const pipelineStages2 = [
  { s: "Ansible", ok: "99%", auto: "97%", time: "3m", inProg: 1 },
  { s: "Vendor API", ok: "98%", auto: "96%", time: "2m", inProg: 0 },
  { s: "Deployment", ok: "98%", auto: "97%", time: "3m", inProg: 5 },
  { s: "Verification", ok: "99%", auto: "98%", time: "1m", inProg: 0 },
  { s: "Compliance", ok: "100%", auto: "99%", time: "1m", inProg: 0 },
  { s: "Monitoring", ok: "99%", auto: "94%", time: "5m", inProg: 0 },
  { s: "CMDB Update", ok: "100%", auto: "100%", time: "30s", inProg: 0 },
  { s: "Reports", ok: "100%", auto: "98%", time: "45s", inProg: 0 },
];

const policyDonut = [
  { label: "Healthy", value: 1256, color: "#10b981", pct: 68.1 },
  { label: "Pending", value: 234, color: "#f59e0b", pct: 12.7 },
  { label: "Modified", value: 128, color: "#8b5cf6", pct: 6.9 },
  { label: "Failed", value: 24, color: "#ef4444", pct: 1.3 },
  { label: "Drift Detected", value: 96, color: "#f97316", pct: 5.2 },
  { label: "Unknown", value: 104, color: "#94a3b8", pct: 5.6 },
];

const aiRisks = [
  { policy: "SEGMENT-WAN-ANY-ANY", dev: 128, comp: "64%", risk: "Critical", status: "Drift Detected", drift: "Yes", bImpact: "High", conf: "92%" },
  { policy: "OLD-VPN-POLICY", dev: 36, comp: "72%", risk: "High", status: "Modified", drift: "Yes", bImpact: "Medium", conf: "89%" },
  { policy: "BGP-PEER-MISCONFIG", dev: 26, comp: "78%", risk: "High", status: "Modified", drift: "Yes", bImpact: "High", conf: "91%" },
  { policy: "DC-ACL-PERMIT-ANY", dev: 212, comp: "55%", risk: "Critical", status: "Active", drift: "Yes", bImpact: "High", conf: "94%" },
  { policy: "NAT-OVERLAP-RULES", dev: 64, comp: "70%", risk: "Medium", status: "Redundant", drift: "No", bImpact: "Medium", conf: "88%" },
  { policy: "OSPF-AREA-MISMATCH", dev: 18, comp: "68%", risk: "Medium", status: "Modified", drift: "Yes", bImpact: "Medium", conf: "85%" },
  { policy: "VLAN-DUPLICATE", dev: 96, comp: "88%", risk: "Low", status: "Active", drift: "No", bImpact: "Low", conf: "78%" },
  { policy: "QOS-UNUSED-POLICY", dev: 53, comp: "90%", risk: "Low", status: "Unused", drift: "No", bImpact: "Low", conf: "80%" },
  { policy: "WIRELESS-OPEN-SSID", dev: 12, comp: "60%", risk: "Critical", status: "Active", drift: "Yes", bImpact: "High", conf: "94%" },
  { policy: "FIREWALL-ANY-ANY", dev: 42, comp: "58%", risk: "High", status: "Drift Detected", drift: "Yes", bImpact: "High", conf: "91%" },
];

const drift = [
  { site: "LA-DC1-LEAF3", severity: "Critical" },
  { site: "CHI-DC2-SPINE2", severity: "High" },
  { site: "NYC-BRANCH-12", severity: "High" },
  { site: "DAL-DC1-LEAF5", severity: "Medium" },
  { site: "SFO-BRANCH-07", severity: "Medium" },
];

const iac = [
  { provider: "Terraform Cloud", repos: 68, commits: 2, prs: 12, deploy: 186, success: "98.4%", cov: "93%" },
  { provider: "Ansible Tower", repos: 42, commits: 213, prs: 8, deploy: 374, success: "97.6%", cov: "91%" },
  { provider: "GitHub Enterprise", repos: 31, commits: 168, prs: 24, deploy: 210, success: "99.1%", cov: "89%" },
  { provider: "Azure DevOps", repos: 26, commits: 14, prs: 19, deploy: 165, success: "96.7%", cov: "88%" },
  { provider: "Cisco NSO", repos: 12, commits: 87, prs: 6, deploy: 240, success: "98.0%", cov: "92%" },
  { provider: "Jenkins", repos: 9, commits: 76, prs: 4, deploy: 98, success: "95.5%", cov: "85%" },
];

const vendors = [
  { name: "Cisco", dev: 7842, comp: "96%", auto: "98%", drift: 12 },
  { name: "Juniper", dev: 3216, comp: "94%", auto: "96%", drift: 8 },
  { name: "Arista", dev: 1824, comp: "93%", auto: "97%", drift: 7 },
  { name: "Palo Alto", dev: 1452, comp: "95%", auto: "96%", drift: 5 },
  { name: "Fortinet", dev: 1120, comp: "90%", auto: "94%", drift: 11 },
  { name: "HPE Aruba", dev: 1008, comp: "93%", auto: "95%", drift: 7 },
  { name: "VMware NSX", dev: 632, comp: "94%", auto: "96%", drift: 3 },
  { name: "F5 Networks", dev: 620, comp: "95%", auto: "95%", drift: 4 },
  { name: "Others", dev: 710, comp: "89%", auto: "88%", drift: 6 },
];

const aiRecs = [
  { title: "Remove Unused ACLs", conf: "95%", risk: "High", effort: "Low", auto: true },
  { title: "Repair Configuration Drift", conf: "93%", risk: "High", effort: "Medium", auto: true },
  { title: "Merge Duplicate Objects", conf: "92%", risk: "Medium", effort: "Low", auto: true },
  { title: "Optimize BGP Policies", conf: "90%", risk: "Medium", effort: "Medium", auto: true },
  { title: "Simplify QoS Policies", conf: "88%", risk: "Low", effort: "Low", auto: true },
  { title: "Normalize Interface Naming", conf: "87%", risk: "Low", effort: "Low", auto: true },
];

const compliance = [
  { fw: "NIST CSF", score: "98%" },
  { fw: "CIS Controls", score: "97%" },
  { fw: "PCI DSS", score: "96%" },
  { fw: "HIPAA", score: "98%" },
  { fw: "Zero Trust", score: "94%" },
  { fw: "Internal Standards", score: "97%" },
  { fw: "STIG", score: "96%" },
];

const activity = [
  { t: "12:34:45", msg: "Policy INTENT-SEG-100 deployed to 128 devices", tone: "emerald" },
  { t: "12:34:12", msg: "Configuration drift detected on LA-DC1-LEAF3", tone: "amber" },
  { t: "12:33:58", msg: "Terraform plan generated for VLAN update", tone: "emerald" },
  { t: "12:33:21", msg: "Ansible job #8734821 completed successfully", tone: "emerald" },
  { t: "12:32:58", msg: "BGP neighbor change validated on 28 devices", tone: "emerald" },
  { t: "12:32:11", msg: "Rollback completed for failed deployment", tone: "blue" },
  { t: "12:31:45", msg: "Compliance scan completed across 18,426 devices", tone: "emerald" },
];

const upcoming = [
  { id: "CHG-88921", change: "VLAN 2100 Update", devices: 236, sched: "Today 14:00", status: "Scheduled", ap: "Approved" },
  { id: "CHG-88922", change: "ACL Optimization", devices: 512, sched: "Today 15:30", status: "Pending", ap: "Pending" },
  { id: "CHG-88923", change: "BGP Policy Update", devices: 128, sched: "Tomorrow 09:00", status: "Scheduled", ap: "Approved" },
  { id: "CHG-88924", change: "QoS Policy Update", devices: 96, sched: "Tomorrow 11:30", status: "Pending", ap: "Pending" },
];

const integrations = [
  "Cisco DNA Center", "Cisco NSO", "Palo Alto Panorama", "Juniper Apstra",
  "Aruba Central", "VMware NSX", "Terraform Cloud", "Ansible AWX",
  "GitHub Enterprise", "Azure DevOps", "ServiceNow", "Splunk",
  "Datadog", "Dynatrace", "Microsoft Sentinel", "ThousandEyes",
  "Infoblox", "F5 BIG-IP",
];

/* ---------- helpers ---------- */

const riskChip = (r: string) => {
  const map: Record<string, string> = {
    Critical: "bg-red-100 text-red-700",
    High: "bg-orange-100 text-orange-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-emerald-100 text-emerald-700",
  };
  return map[r] || "bg-slate-100 text-slate-700";
};

const Spark = ({ tone = "emerald" }: { tone?: string }) => {
  const colors: Record<string, string> = {
    emerald: "#10b981", blue: "#3b82f6", amber: "#f59e0b", red: "#ef4444", violet: "#8b5cf6",
  };
  const c = colors[tone] || "#10b981";
  return (
    <svg viewBox="0 0 100 20" className="w-full h-5 mt-1">
      <polyline
        fill="none" stroke={c} strokeWidth="1.6"
        points="0,14 10,10 20,12 30,8 40,11 50,7 60,10 70,6 80,9 90,5 100,7"
      />
    </svg>
  );
};

const Donut = ({ data }: { data: typeof policyDonut }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const r = 40, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="w-40 h-40 -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
      {data.map((d) => {
        const frac = d.value / total;
        const dash = frac * c;
        const el = (
          <circle key={d.label} cx="50" cy="50" r={r} fill="none"
            stroke={d.color} strokeWidth="14"
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-acc * c}
          />
        );
        acc += frac;
        return el;
      })}
    </svg>
  );
};

/* ---------- page ---------- */

export default function ZeroTouchPolicyImplementation() {
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "I've analyzed 18,426 devices and 1,384 policy templates. Zero Touch coverage is 91% with 23 drift events pending remediation. Ask me anything." },
  ]);

  const send = () => {
    if (!chat.trim()) return;
    const q = chat.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setChat("");
    setTimeout(() => {
      setMessages((m) => [...m, {
        role: "ai",
        text: `Based on Git history, Terraform state and vendor telemetry: ${q.includes("drift") ? "23 devices show configuration drift, 12 auto-remediable in <5 min. Confidence 94%." : q.includes("BGP") ? "BGP validation across 342 peers is healthy. 2 sessions flapping in APAC region — recommend policy realignment. Confidence 91%." : "I recommend running the auto-remediation pipeline. Estimated impact: 18 devices restored, $42K/mo saved, deployment 4.8 min. Confidence 93%."}`,
      }]);
    }, 700);
  };

  return (
    <AppShell>
      <main className="flex-1 bg-slate-50/60 animate-fade-in min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-start gap-4 justify-between">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 grid place-items-center text-white shadow-md">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Digital Coworker</div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  Network Zero Touch Policy Implementation
                  <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded">AI POWERED</span>
                </h1>
                <p className="text-xs italic text-slate-600 mt-1 max-w-3xl">
                  Continuously automate, validate, deploy, monitor, and govern enterprise network policies across hybrid infrastructure
                  through intent-based networking, Infrastructure-as-Code, AI-driven validation, and autonomous remediation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-slate-100"><Bell className="h-4 w-4 text-slate-600" /><span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[9px] rounded-full grid place-items-center font-bold">7</span></button>
              <button className="p-2 rounded-lg hover:bg-slate-100"><HelpCircle className="h-4 w-4 text-slate-600" /></button>
              <button className="p-2 rounded-lg hover:bg-slate-100"><User className="h-4 w-4 text-slate-600" /></button>
            </div>
          </div>

          {/* live indicators */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {liveIndicators.map((i) => (
              <div key={i.label} className="flex items-center gap-2">
                {i.dot && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                <div>
                  <div className={`text-[13px] font-bold ${i.tone === "emerald" ? "text-emerald-700" : "text-slate-900"}`}>{i.value}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">{i.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* KPI grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {kpis.map((k) => {
              const Icon = k.icon;
              return (
                <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">{k.label}</div>
                    <div className={`h-7 w-7 rounded-md ${k.bg} ${k.color} grid place-items-center`}><Icon className="h-3.5 w-3.5" /></div>
                  </div>
                  <div className={`text-2xl font-extrabold ${k.color} mt-1`}>{k.value}</div>
                  <div className="text-[10px] text-slate-500">{k.sub}</div>
                  <Spark tone={k.spark} />
                </div>
              );
            })}
          </div>

          {/* Topology + Pipeline + Policy */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Topology */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-800">Enterprise Network Topology</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-slate-100"><Search className="h-3.5 w-3.5 text-slate-500" /></button>
                </div>
              </div>
              <div className="space-y-2">
                {topologyRings.map((r, idx) => (
                  <div key={r.label} className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold ${idx === 0 ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-700"}`}>
                      <Network className="h-3 w-3" />
                    </div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-500" style={{ width: `${Math.min(100, 20 + idx * 10)}%` }} />
                    </div>
                    <div className="text-[11px] text-slate-700 font-medium w-32 truncate">{r.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-600">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Compliant &gt; 90%</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Pending 70–90%</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" />Drift 50–70%</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Critical &lt; 50%</span>
              </div>
            </div>

            {/* Pipeline */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-1">
              <div className="text-sm font-bold text-slate-800 mb-3">Zero Touch Deployment Pipeline</div>
              <div className="grid grid-cols-6 gap-1">
                {pipelineStages.map((s) => (
                  <div key={s.s} className="text-center">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center mx-auto"><Workflow className="h-4 w-4" /></div>
                    <div className="text-[9px] font-semibold text-slate-700 mt-1 truncate">{s.s}</div>
                    <div className="text-[9px] text-emerald-600 font-bold">{s.ok}</div>
                    <div className="text-[8px] text-slate-500">{s.time}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-8 gap-1 mt-3">
                {pipelineStages2.map((s) => (
                  <div key={s.s} className="text-center">
                    <div className="h-7 w-7 rounded-lg bg-violet-50 text-violet-600 grid place-items-center mx-auto"><Cpu className="h-3.5 w-3.5" /></div>
                    <div className="text-[9px] font-semibold text-slate-700 mt-1 truncate">{s.s}</div>
                    <div className="text-[9px] text-emerald-600 font-bold">{s.ok}</div>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View All Deployments →</button>
            </div>

            {/* Policy Dashboard */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Network Policy Dashboard</div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Donut data={policyDonut} />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-slate-900">1,842</div>
                      <div className="text-[10px] text-slate-500">Total Policies</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  {policyDonut.map((d) => (
                    <div key={d.label} className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-slate-700">{d.label}</span>
                      </span>
                      <span className="font-semibold text-slate-800">{d.value.toLocaleString()} ({d.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View Policy Dashboard →</button>
            </div>
          </div>

          {/* AI Risks + Drift + IaC */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-500" />AI Policy Validation (Top 10 Risks)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                      <th className="text-left py-1.5 font-semibold">Policy</th>
                      <th className="text-left font-semibold">Dev</th>
                      <th className="text-left font-semibold">Comp</th>
                      <th className="text-left font-semibold">Risk</th>
                      <th className="text-left font-semibold">Status</th>
                      <th className="text-left font-semibold">Drift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiRisks.map((r) => (
                      <tr key={r.policy} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-1.5 font-mono text-slate-700">{r.policy}</td>
                        <td className="text-slate-700">{r.dev}</td>
                        <td className="text-slate-700">{r.comp}</td>
                        <td><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${riskChip(r.risk)}`}>{r.risk}</span></td>
                        <td className="text-slate-700">{r.status}</td>
                        <td className={r.drift === "Yes" ? "text-amber-600 font-semibold" : "text-slate-500"}>{r.drift}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View All Risks →</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Configuration Drift Dashboard</div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Donut data={[
                    { label: "Critical", value: 5, color: "#ef4444", pct: 21.7 },
                    { label: "High", value: 7, color: "#f97316", pct: 30.4 },
                    { label: "Medium", value: 6, color: "#f59e0b", pct: 26.1 },
                    { label: "Low", value: 5, color: "#eab308", pct: 21.7 },
                  ]} />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-slate-900">23</div>
                      <div className="text-[9px] text-slate-500">Devices with Drift</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Top Drifted Devices</div>
                  <div className="space-y-1">
                    {drift.map((d) => (
                      <div key={d.site} className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-slate-700">{d.site}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${riskChip(d.severity)}`}>{d.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View All Drifted Devices →</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Infrastructure as Code Dashboard</div>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100">
                    <th className="text-left py-1.5 font-semibold">Provider</th>
                    <th className="text-left font-semibold">Repos</th>
                    <th className="text-left font-semibold">PRs</th>
                    <th className="text-left font-semibold">Deploys</th>
                    <th className="text-left font-semibold">Success</th>
                  </tr>
                </thead>
                <tbody>
                  {iac.map((r) => (
                    <tr key={r.provider} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-1.5 flex items-center gap-1.5"><GitBranch className="h-3 w-3 text-slate-400" /><span className="text-slate-700">{r.provider}</span></td>
                      <td className="text-slate-700">{r.repos}</td>
                      <td className="text-slate-700">{r.prs}</td>
                      <td className="text-slate-700">{r.deploy}</td>
                      <td className="text-emerald-600 font-semibold">{r.success}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View All Repositories →</button>
            </div>
          </div>

          {/* Multi-vendor + AI recs + Business impact + Compliance */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Multi-Vendor Overview</div>
              <div className="space-y-1.5">
                {vendors.map((v) => (
                  <div key={v.name} className="text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">{v.name}</span>
                      <span className="text-slate-500">{v.dev.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                      <div className="h-full bg-emerald-500" style={{ width: v.comp }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View All Vendors →</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-500" />AI Recommendations</div>
              <div className="space-y-1.5">
                {aiRecs.map((r) => (
                  <div key={r.title} className="text-[11px] p-2 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{r.title}</span>
                      <span className="text-emerald-600 font-bold">{r.conf}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${riskChip(r.risk)}`}>{r.risk}</span>
                      <span className="text-slate-500">Effort: {r.effort}</span>
                      {r.auto && <span className="ml-auto text-[9px] text-blue-600 font-bold flex items-center gap-0.5"><Zap className="h-3 w-3" />AUTO</span>}
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View All Recommendations →</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Business Impact Dashboard</div>
              <div className="space-y-2 text-[11px]">
                {[
                  { l: "Applications", v: "2,843", i: Boxes },
                  { l: "Business Services", v: "365", i: Layers },
                  { l: "Departments", v: "48", i: Globe },
                  { l: "Customers", v: "12.6M", i: User },
                  { l: "Applications at Risk", v: "28", i: AlertTriangle, tone: "text-red-600" },
                  { l: "Users Impacted", v: "45,230", i: User, tone: "text-amber-600" },
                  { l: "Revenue Exposure", v: "$12.6M", i: LineChart, tone: "text-amber-600" },
                  { l: "Operational Priority", v: "High", i: Zap, tone: "text-red-600" },
                ].map((r) => {
                  const Ic = r.i;
                  return (
                    <div key={r.l} className="flex items-center justify-between border-b border-slate-50 pb-1">
                      <span className="flex items-center gap-1.5 text-slate-700"><Ic className="h-3.5 w-3.5 text-slate-400" />{r.l}</span>
                      <span className={`font-bold ${r.tone || "text-slate-900"}`}>{r.v}</span>
                    </div>
                  );
                })}
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View Full Impact Map →</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Compliance Dashboard</div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Donut data={[{ label: "Compliant", value: 987, color: "#10b981", pct: 98.7 }, { label: "Other", value: 13, color: "#f1f5f9", pct: 1.3 }]} />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="text-xl font-extrabold text-emerald-600">98.7%</div>
                      <div className="text-[9px] text-slate-500">Overall Compliance</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  {compliance.map((c) => (
                    <div key={c.fw} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700">{c.fw}</span>
                      <span className="font-bold text-emerald-600">{c.score}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View Compliance Dashboard →</button>
            </div>
          </div>

          {/* Activity, Upcoming, Pipeline Health, Integrations */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-500" />Automation Activity Feed (Live)</div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {activity.map((a, i) => (
                  <div key={i} className="text-[11px] flex items-start gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 ${a.tone === "emerald" ? "bg-emerald-500" : a.tone === "amber" ? "bg-amber-500" : "bg-blue-500"}`} />
                    <div>
                      <div className="font-mono text-[10px] text-slate-500">{a.t}</div>
                      <div className="text-slate-700">{a.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View Full Activity Feed →</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Upcoming Deployments</div>
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100">
                    <th className="text-left py-1 font-semibold">ID</th>
                    <th className="text-left font-semibold">Change</th>
                    <th className="text-left font-semibold">Scheduled</th>
                    <th className="text-left font-semibold">Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50">
                      <td className="py-1 font-mono text-blue-700">{u.id}</td>
                      <td className="text-slate-700">{u.change}</td>
                      <td className="text-slate-500">{u.sched}</td>
                      <td><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${u.ap === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{u.ap}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View All Changes →</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Pipeline Health</div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Donut data={[{ label: "Healthy", value: 981, color: "#10b981", pct: 98.1 }, { label: "Other", value: 19, color: "#f1f5f9", pct: 1.9 }]} />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="text-xl font-extrabold text-emerald-600">98.1%</div>
                      <div className="text-[9px] text-slate-500">Success Rate</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-1 text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-700">INTENT-PIPELINE</span><span className="font-bold text-emerald-600">98.4%</span></div>
                  <div className="flex justify-between"><span className="text-slate-700">POLICY-DEPLOY</span><span className="font-bold text-emerald-600">98.7%</span></div>
                  <div className="flex justify-between"><span className="text-slate-700">DRIFT-REMEDIATION</span><span className="font-bold text-emerald-600">97.6%</span></div>
                  <div className="flex justify-between"><span className="text-slate-700">COMPLIANCE-CHECK</span><span className="font-bold text-emerald-600">99.1%</span></div>
                </div>
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View Pipeline Dashboard →</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Integrations</div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {integrations.map((i) => (
                  <div key={i} className="flex items-center gap-1.5 p-1.5 rounded border border-slate-100 hover:bg-slate-50">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-700 truncate">{i}</span>
                  </div>
                ))}
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View All Integrations →</button>
            </div>
          </div>

          {/* AI Copilot */}
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-violet-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 grid place-items-center text-white"><Bot className="h-4 w-4" /></div>
              <div>
                <div className="text-sm font-bold text-slate-800">AI Copilot — Zero Touch Assistant</div>
                <div className="text-[10px] text-slate-600">Ask about deployments, drift, BGP, Terraform, compliance, or executive summaries</div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-lg border border-white/60 p-3 max-h-56 overflow-y-auto space-y-2">
              {messages.map((m, i) => (
                <div key={i} className={`text-[12px] ${m.role === "user" ? "text-right" : ""}`}>
                  <span className={`inline-block px-3 py-1.5 rounded-2xl ${m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"}`}>{m.text}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                value={chat}
                onChange={(e) => setChat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask: 'Show configuration drift' or 'Why did deployment fail?'"
                className="flex-1 text-[12px] px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
              <button onClick={send} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1"><Send className="h-3.5 w-3.5" />Send</button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["Show configuration drift", "Validate BGP", "Rollback latest deployment", "Predict deployment risk", "Generate executive report"].map((s) => (
                <button key={s} onClick={() => setChat(s)} className="text-[10px] px-2 py-1 rounded-full bg-white/80 border border-slate-200 text-slate-700 hover:bg-white">{s}</button>
              ))}
            </div>
          </div>

          {/* Footer bar */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 border-t border-slate-200 pt-3">
            <div>Data Refreshed: <span className="font-semibold text-slate-700">8 Seconds Ago</span></div>
            <div className="flex gap-4">
              <span><span className="font-bold text-slate-800">18,426</span> Devices</span>
              <span><span className="font-bold text-slate-800">1,384</span> Policy Templates</span>
              <span><span className="font-bold text-slate-800">742,611</span> Rules</span>
              <span><span className="font-bold text-slate-800">2,843</span> Applications</span>
              <span><span className="font-bold text-slate-800">365</span> Business Services</span>
            </div>
            <div>© 2026 NOVA AI Digital Coworker</div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
