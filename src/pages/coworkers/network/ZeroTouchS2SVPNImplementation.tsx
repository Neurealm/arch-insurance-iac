import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Activity, AlertTriangle, Bell, Bot, CheckCircle, Cloud, FileCode, HelpCircle,
  Key, Layers, Lock, LineChart, Network, Rocket, Search, Send, Shield,
  ShieldCheck, Sparkles, User, Workflow, X, Zap, GitBranch, Globe, Boxes,
} from "lucide-react";

/* ---------- data ---------- */

const liveIndicators = [
  { label: "Operational", value: "All Systems Normal", tone: "emerald", dot: true },
  { label: "VPN Tunnels", value: "4,286" },
  { label: "Connected Sites", value: "1,124" },
  { label: "Cloud Gateways", value: "238" },
  { label: "Deployment Success", value: "99.6%" },
  { label: "Last Tunnel Analysis", value: "6 Seconds Ago" },
  { label: "AI Orchestration Engine", value: "Active", tone: "emerald" },
];

const kpis = [
  { label: "Zero Touch VPN Coverage", value: "94%", sub: "Enterprise", color: "text-emerald-600", bg: "bg-emerald-50", icon: Zap, spark: "emerald" },
  { label: "Tunnel Availability", value: "99.98%", sub: "99.25% SLA", color: "text-emerald-600", bg: "bg-emerald-50", icon: ShieldCheck, spark: "emerald" },
  { label: "Healthy VPNs", value: "4,254", sub: "99.25%", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle, spark: "emerald" },
  { label: "Degraded Tunnels", value: "21", sub: "0.49%", color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle, spark: "amber" },
  { label: "Failed Tunnels", value: "11", sub: "0.26%", color: "text-red-600", bg: "bg-red-50", icon: X, spark: "red" },
  { label: "Automated Recoveries", value: "38", sub: "Today", color: "text-blue-600", bg: "bg-blue-50", icon: Bot, spark: "blue" },
  { label: "Mean Provisioning Time", value: "3.7 min", sub: "Average", color: "text-blue-600", bg: "bg-blue-50", icon: Rocket, spark: "blue" },
  { label: "Configuration Compliance", value: "99.4%", sub: "Compliant", color: "text-emerald-600", bg: "bg-emerald-50", icon: FileCode, spark: "emerald" },
  { label: "Encryption Compliance", value: "100%", sub: "AES-256 / PFS", color: "text-violet-600", bg: "bg-violet-50", icon: Lock, spark: "violet" },
  { label: "Annual Operational Savings", value: "$6.9M", sub: "Annualized", color: "text-emerald-600", bg: "bg-emerald-50", icon: LineChart, spark: "emerald" },
];

const topology = [
  { l: "Enterprise", n: 1 },
  { l: "Regions (6)", n: 6 },
  { l: "Data Centers (8)", n: 8 },
  { l: "Cloud (8)", n: 8 },
  { l: "Branch Offices (412)", n: 412 },
  { l: "Partners (128)", n: 128 },
  { l: "Suppliers (64)", n: 64 },
  { l: "VPN Gateways (238)", n: 238 },
  { l: "IPSec Tunnels (4,286)", n: 4286 },
  { l: "Applications (2,451)", n: 2451 },
  { l: "Business Services (842)", n: 842 },
];

const pipeline = [
  { s: "Business Request", ok: "100%", auto: "100%", time: "12s", queue: 0 },
  { s: "Intent Validation", ok: "100%", auto: "100%", time: "18s", queue: 0 },
  { s: "IPAM Validation", ok: "99.9%", auto: "100%", time: "22s", queue: 1 },
  { s: "Address Allocation", ok: "100%", auto: "100%", time: "8s", queue: 0 },
  { s: "Terraform", ok: "99.8%", auto: "98%", time: "1m 12s", queue: 2 },
  { s: "Ansible", ok: "99.5%", auto: "96%", time: "1m 08s", queue: 1 },
  { s: "Vendor APIs", ok: "99.9%", auto: "97%", time: "1m 18s", queue: 0 },
  { s: "VPN Gateway Config", ok: "99.9%", auto: "97%", time: "1m 18s", queue: 0 },
  { s: "IKE Negotiation", ok: "99.8%", auto: "98%", time: "45s", queue: 3 },
  { s: "Tunnel Validation", ok: "99.9%", auto: "98%", time: "35s", queue: 0 },
  { s: "Traffic Testing", ok: "99.9%", auto: "96%", time: "1m 10s", queue: 0 },
  { s: "Compliance Validation", ok: "100%", auto: "99%", time: "40s", queue: 0 },
  { s: "Monitoring", ok: "100%", auto: "100%", time: "18s", queue: 0 },
  { s: "CMDB Update", ok: "100%", auto: "100%", time: "20s", queue: 0 },
  { s: "Executive Reporting", ok: "100%", auto: "100%", time: "12s", queue: 0 },
];

const healthDonut = [
  { label: "Healthy", value: 4254, color: "#10b981", pct: 99.25 },
  { label: "Negotiating", value: 24, color: "#3b82f6", pct: 0.56 },
  { label: "Disconnected", value: 15, color: "#94a3b8", pct: 0.35 },
  { label: "Flapping", value: 8, color: "#f59e0b", pct: 0.19 },
  { label: "Expired Certs", value: 7, color: "#f97316", pct: 0.16 },
  { label: "Auth Failures", value: 3, color: "#ef4444", pct: 0.07 },
  { label: "Drift Detected", value: 9, color: "#8b5cf6", pct: 0.21 },
];

const riskTunnels = [
  { name: "BRCH-031 ⇌ DC1", sites: "New York", health: "Degraded", risk: 86, fail: "High", impact: "High", conf: "94%", auto: "Repair" },
  { name: "PARTNER-022 ⇌ DC1", sites: "Partner A", health: "Degraded", risk: 78, fail: "High", impact: "Medium", conf: "89%", auto: "Repair" },
  { name: "BRCH-117 ⇌ DC2", sites: "Chicago", health: "Warning", risk: 62, fail: "Medium", impact: "Medium", conf: "85%", auto: "Optimize" },
  { name: "SUPPLIER-09 ⇌ DC1", sites: "Supplier E", health: "Warning", risk: 55, fail: "Medium", impact: "Low", conf: "82%", auto: "Optimize" },
  { name: "AZURE-HUB ⇌ DC1", sites: "Azure", health: "Healthy", risk: 34, fail: "Low", impact: "Low", conf: "78%", auto: "Monitor" },
  { name: "AWS-TGW ⇌ DC2", sites: "AWS", health: "Healthy", risk: 31, fail: "Low", impact: "Low", conf: "76%", auto: "Monitor" },
  { name: "BRCH-305 ⇌ DC3", sites: "Miami", health: "Healthy", risk: 28, fail: "Low", impact: "Low", conf: "74%", auto: "Monitor" },
  { name: "GCP-HUB ⇌ DC1", sites: "Google Cloud", health: "Healthy", risk: 27, fail: "Low", impact: "Low", conf: "73%", auto: "Monitor" },
];

const cloudProviders = [
  { name: "Azure Virtual WAN", tunnels: 684, health: "99.95%", latency: "42 ms", tput: "1.28 Gbps", cost: "$12,430", opt: "Good" },
  { name: "Azure VPN Gateway", tunnels: 512, health: "99.97%", latency: "38 ms", tput: "1.12 Gbps", cost: "$8,210", opt: "Good" },
  { name: "AWS Transit Gateway", tunnels: 746, health: "99.96%", latency: "45 ms", tput: "1.34 Gbps", cost: "$16,750", opt: "Review" },
  { name: "AWS VPN", tunnels: 328, health: "99.91%", latency: "47 ms", tput: "892 Mbps", cost: "$6,320", opt: "Review" },
  { name: "Google Cloud VPN", tunnels: 298, health: "99.93%", latency: "41 ms", tput: "965 Mbps", cost: "$5,910", opt: "Good" },
  { name: "Oracle Cloud", tunnels: 88, health: "99.82%", latency: "62 ms", tput: "512 Mbps", cost: "$2,140", opt: "Improve" },
  { name: "Alibaba Cloud", tunnels: 64, health: "99.74%", latency: "75 ms", tput: "312 Mbps", cost: "$1,080", opt: "Improve" },
  { name: "VMware SD-WAN", tunnels: 122, health: "99.90%", latency: "36 ms", tput: "1.05 Gbps", cost: "$4,310", opt: "Good" },
];

const aiRecs = [
  { title: "Rebuild tunnel BRCH-031 to DC1", conf: "92%", impact: "High", downtime: "4h 32m" },
  { title: "Rotate expiring certificates (21 tunnels)", conf: "90%", impact: "High", downtime: "2h 16m" },
  { title: "Optimize BGP sessions (8 tunnels)", conf: "87%", impact: "Medium", downtime: "1h 42m" },
  { title: "Adjust MTU on AWS-TGW ⇌ DC2", conf: "85%", impact: "Medium", downtime: "1h 15m" },
  { title: "Synchronize Phase 2 encryption policies", conf: "83%", impact: "Medium", downtime: "50m" },
  { title: "Enable HA on 4 VPN gateways", conf: "80%", impact: "Medium", downtime: "3h 20m" },
];

const lifecycle = [
  { label: "Provisioning", value: 48, color: "#3b82f6", pct: 1.1 },
  { label: "Operational", value: 4102, color: "#10b981", pct: 95.7 },
  { label: "Maintenance", value: 72, color: "#f59e0b", pct: 1.7 },
  { label: "Pending Changes", value: 27, color: "#8b5cf6", pct: 0.6 },
  { label: "Decommissioning", value: 15, color: "#94a3b8", pct: 0.3 },
  { label: "Failed", value: 22, color: "#ef4444", pct: 0.5 },
];

const security = [
  { l: "AES-256", v: "100%" },
  { l: "SHA-256 / 384", v: "100%" },
  { l: "DH Group 14+", v: "100%" },
  { l: "Perfect Forward Secrecy", v: "100%" },
  { l: "IKEv2", v: "100%" },
  { l: "Certificate Validity", v: "100%" },
  { l: "Compliance Score", v: "99.4%" },
];

const activity = [
  { t: "12:34:45", msg: "VPN request PART-2049 validated, Terraform plan generated", tone: "emerald" },
  { t: "12:34:12", msg: "IKE Phase 1 negotiated with partner-a-fw01 (AES-256/DH14)", tone: "emerald" },
  { t: "12:33:58", msg: "BGP session established, 428 routes exchanged", tone: "emerald" },
  { t: "12:33:21", msg: "Certificate expiring in 21 days on VPN-BRCH-408 — rotation scheduled", tone: "amber" },
  { t: "12:32:58", msg: "Traffic test passed 0.02% loss, 41 ms RTT", tone: "emerald" },
  { t: "12:32:11", msg: "Tunnel VPN-BRCH-031 flapping — auto-rebuild initiated", tone: "blue" },
];

const integrations = [
  "Cisco SD-WAN Manager", "Cisco Meraki", "Palo Alto Panorama", "FortiManager",
  "Check Point", "Juniper Security Director", "VMware SD-WAN", "Azure Virtual WAN",
  "AWS Transit Gateway", "Google Cloud VPN", "Terraform Cloud", "Ansible AWX",
  "GitHub Enterprise", "Azure DevOps", "ServiceNow", "ThousandEyes",
  "Datadog", "Splunk",
];

/* ---------- helpers ---------- */

const riskChip = (r: string) => {
  const map: Record<string, string> = {
    Critical: "bg-red-100 text-red-700", Failed: "bg-red-100 text-red-700",
    High: "bg-orange-100 text-orange-700", Degraded: "bg-orange-100 text-orange-700",
    Medium: "bg-amber-100 text-amber-700", Warning: "bg-amber-100 text-amber-700",
    Low: "bg-emerald-100 text-emerald-700", Healthy: "bg-emerald-100 text-emerald-700",
    Good: "bg-emerald-100 text-emerald-700", Review: "bg-amber-100 text-amber-700",
    Improve: "bg-orange-100 text-orange-700",
  };
  return map[r] || "bg-slate-100 text-slate-700";
};

const Spark = ({ tone = "emerald" }: { tone?: string }) => {
  const colors: Record<string, string> = { emerald: "#10b981", blue: "#3b82f6", amber: "#f59e0b", red: "#ef4444", violet: "#8b5cf6" };
  const c = colors[tone] || "#10b981";
  return (
    <svg viewBox="0 0 100 20" className="w-full h-5 mt-1">
      <polyline fill="none" stroke={c} strokeWidth="1.6" points="0,14 10,10 20,12 30,8 40,11 50,7 60,10 70,6 80,9 90,5 100,7" />
    </svg>
  );
};

const Donut = ({ data }: { data: { label: string; value: number; color: string; pct: number }[] }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const r = 40, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="w-40 h-40 -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
      {data.map((d) => {
        const frac = d.value / total;
        const dash = frac * c;
        const el = <circle key={d.label} cx="50" cy="50" r={r} fill="none" stroke={d.color} strokeWidth="14" strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-acc * c} />;
        acc += frac;
        return el;
      })}
    </svg>
  );
};

/* ---------- page ---------- */

export default function ZeroTouchS2SVPNImplementation() {
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "I'm monitoring 4,286 IPSec tunnels across 1,124 sites and 238 cloud gateways. 21 degraded and 11 failed tunnels — 32 auto-remediable. Ask me anything." },
  ]);

  const send = () => {
    if (!chat.trim()) return;
    const q = chat.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setChat("");
    setTimeout(() => {
      setMessages((m) => [...m, {
        role: "ai",
        text: q.toLowerCase().includes("fail")
          ? "VPN-BRCH-031 is failing Phase 2 negotiation — DH group mismatch (peer sends DH14, config expects DH19). Auto-repair available. Confidence 94%."
          : q.toLowerCase().includes("certificate") || q.toLowerCase().includes("rotate")
          ? "21 certificates expire in <30 days. Recommend batch rotation via HashiCorp Vault + Ansible — 2h 16m, zero customer impact. Confidence 90%."
          : "Recommendation: deploy secondary tunnels for 12 top-tier partners. Estimated $412K/yr avoided downtime, 4.2 min RTO. Confidence 91%.",
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
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Digital Coworker</div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  Zero Touch Site-to-Site VPN Implementation
                  <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded">AI POWERED</span>
                </h1>
                <p className="text-xs italic text-slate-600 mt-1 max-w-3xl">
                  Continuously automate, validate, deploy, monitor, and optimize secure site-to-site VPN connectivity across enterprise, cloud, partner,
                  and hybrid environments through intent-based networking, Infrastructure-as-Code, AI-driven validation, and autonomous remediation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-slate-100"><Bell className="h-4 w-4 text-slate-600" /><span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[9px] rounded-full grid place-items-center font-bold">4</span></button>
              <button className="p-2 rounded-lg hover:bg-slate-100"><HelpCircle className="h-4 w-4 text-slate-600" /></button>
              <button className="p-2 rounded-lg hover:bg-slate-100"><User className="h-4 w-4 text-slate-600" /></button>
            </div>
          </div>

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
          {/* KPIs */}
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

          {/* Topology + Pipeline + Health */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-800">Enterprise VPN Topology</div>
                <button className="p-1 rounded hover:bg-slate-100"><Search className="h-3.5 w-3.5 text-slate-500" /></button>
              </div>
              <div className="space-y-2">
                {topology.map((r, idx) => (
                  <div key={r.l} className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-full grid place-items-center ${idx === 0 ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-700"}`}><Network className="h-3 w-3" /></div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-500" style={{ width: `${Math.min(100, 15 + idx * 8)}%` }} />
                    </div>
                    <div className="text-[11px] text-slate-700 font-medium w-40 truncate">{r.l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-600">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Healthy &gt; 99%</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Warning 96–99%</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" />Degraded 90–96%</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Failed &lt; 90%</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Zero Touch Deployment Pipeline</div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                      <th className="text-left py-1 font-semibold">Stage</th>
                      <th className="text-left font-semibold">Success</th>
                      <th className="text-left font-semibold">Auto %</th>
                      <th className="text-left font-semibold">Avg Time</th>
                      <th className="text-left font-semibold">Queue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pipeline.map((s) => (
                      <tr key={s.s} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-1 text-slate-700 flex items-center gap-1"><Workflow className="h-3 w-3 text-blue-500" />{s.s}</td>
                        <td className="text-emerald-600 font-semibold">{s.ok}</td>
                        <td className="text-slate-700">{s.auto}</td>
                        <td className="text-slate-500">{s.time}</td>
                        <td className={s.queue > 0 ? "text-amber-600 font-semibold" : "text-slate-400"}>{s.queue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View All Deployments →</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">VPN Health Dashboard</div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Donut data={healthDonut} />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-slate-900">4,286</div>
                      <div className="text-[10px] text-slate-500">Total Tunnels</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  {healthDonut.map((d) => (
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
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View Tunnel Health →</button>
            </div>
          </div>

          {/* AI Risk + Cloud Connectivity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-500" />AI Tunnel Risk Prediction (Top 10)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                      <th className="text-left py-1.5 font-semibold">Tunnel</th>
                      <th className="text-left font-semibold">Sites</th>
                      <th className="text-left font-semibold">Health</th>
                      <th className="text-left font-semibold">Risk</th>
                      <th className="text-left font-semibold">Conf</th>
                      <th className="text-left font-semibold">Auto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskTunnels.map((r) => (
                      <tr key={r.name} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-1.5 font-mono text-slate-700">{r.name}</td>
                        <td className="text-slate-700">{r.sites}</td>
                        <td><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${riskChip(r.health)}`}>{r.health}</span></td>
                        <td className="text-slate-700">{r.risk}</td>
                        <td className="text-emerald-600 font-semibold">{r.conf}</td>
                        <td className="text-blue-600 font-semibold">{r.auto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View All Risk Predictions →</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Cloud className="h-4 w-4 text-blue-500" />Cloud Connectivity</div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                      <th className="text-left py-1.5 font-semibold">Cloud</th>
                      <th className="text-left font-semibold">Tunnels</th>
                      <th className="text-left font-semibold">Health</th>
                      <th className="text-left font-semibold">Latency</th>
                      <th className="text-left font-semibold">Cost/mo</th>
                      <th className="text-left font-semibold">Opt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cloudProviders.map((c) => (
                      <tr key={c.name} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-1.5 text-slate-700 flex items-center gap-1"><Cloud className="h-3 w-3 text-blue-400" />{c.name}</td>
                        <td className="text-slate-700">{c.tunnels}</td>
                        <td className="text-emerald-600 font-semibold">{c.health}</td>
                        <td className="text-slate-700">{c.latency}</td>
                        <td className="text-slate-700">{c.cost}</td>
                        <td><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${riskChip(c.opt)}`}>{c.opt}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View Cloud Connectivity →</button>
            </div>
          </div>

          {/* AI Recs + Lifecycle + Business Impact + Security */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-500" />AI Recommendations</div>
              <div className="space-y-1.5">
                {aiRecs.map((r) => (
                  <div key={r.title} className="text-[11px] p-2 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-800 flex-1">{r.title}</span>
                      <span className="text-emerald-600 font-bold text-[10px]">{r.conf}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${riskChip(r.impact)}`}>{r.impact}</span>
                      <span className="text-slate-500 text-[10px]">Avoids {r.downtime}</span>
                      <button className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">Execute</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View All Recommendations →</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Tunnel Lifecycle</div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Donut data={lifecycle} />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="text-xl font-extrabold text-slate-900">4,286</div>
                      <div className="text-[9px] text-slate-500">Total Tunnels</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  {lifecycle.map((d) => (
                    <div key={d.label} className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-slate-700">{d.label}</span>
                      </span>
                      <span className="font-semibold text-slate-800">{d.value.toLocaleString()} ({d.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View Lifecycle Dashboard →</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Business Impact</div>
              <div className="space-y-2 text-[11px]">
                {[
                  { l: "Applications Protected", v: "2,847", i: Boxes },
                  { l: "Users Impacted", v: "125,430", i: User, tone: "text-amber-600" },
                  { l: "Revenue Exposure", v: "$32.8M", i: LineChart, tone: "text-amber-600" },
                  { l: "Operational Priority", v: "High", i: Zap, tone: "text-red-600" },
                  { l: "SLA Risk", v: "Medium", i: AlertTriangle, tone: "text-amber-600" },
                  { l: "Transactions (Daily)", v: "3.2M", i: Activity },
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
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View Impact Dashboard →</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Lock className="h-4 w-4 text-emerald-500" />Security Compliance</div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Donut data={[{ label: "Compliant", value: 100, color: "#10b981", pct: 100 }, { label: "Other", value: 0, color: "#f1f5f9", pct: 0 }]} />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="text-xl font-extrabold text-emerald-600">100%</div>
                      <div className="text-[9px] text-slate-500">Encryption Compliance</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  {security.map((s) => (
                    <div key={s.l} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-700">{s.l}</span>
                      <span className="font-bold text-emerald-600">{s.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="mt-2 w-full text-[11px] font-semibold text-blue-600 hover:text-blue-700 border-t border-slate-100 pt-2">View Security Dashboard →</button>
            </div>
          </div>

          {/* Activity + Internet Path + Integrations */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-500" />Digital Coworker Activity Feed</div>
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
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Globe className="h-4 w-4 text-blue-500" />Internet Path (VPN-BRCH-031 → DC1)</div>
              <div className="space-y-1.5">
                {[
                  { h: "Branch Router 10.44.1.1", l: "1 ms", loss: "0%" },
                  { h: "ISP Edge AS7018", l: "8 ms", loss: "0%" },
                  { h: "Backbone AS3356", l: "22 ms", loss: "0.1%" },
                  { h: "Cloud Peering AS16509", l: "31 ms", loss: "0.2%" },
                  { h: "VPN Gateway 52.14.x.x", l: "38 ms", loss: "0.4%" },
                  { h: "Remote DC1 GW 10.10.1.1", l: "42 ms", loss: "0.5%" },
                  { h: "Application Cluster", l: "45 ms", loss: "0.5%" },
                ].map((h, idx, arr) => (
                  <div key={h.h} className="flex items-center gap-2 text-[11px]">
                    <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 grid place-items-center text-[9px] font-bold">{idx + 1}</div>
                    <div className="flex-1 truncate text-slate-700">{h.h}</div>
                    <div className="text-slate-500">{h.l}</div>
                    <div className={parseFloat(h.loss) > 0.3 ? "text-amber-600 font-semibold" : "text-emerald-600"}>{h.loss}</div>
                    {idx < arr.length - 1 && <div className="text-slate-300 hidden">↓</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-3">Enterprise Integrations</div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {integrations.map((i) => (
                  <div key={i} className="flex items-center gap-1.5 p-1.5 rounded border border-slate-100 hover:bg-slate-50">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-700 truncate">{i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Copilot */}
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-violet-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 grid place-items-center text-white"><Bot className="h-4 w-4" /></div>
              <div>
                <div className="text-sm font-bold text-slate-800">AI Copilot — Zero Touch VPN Assistant</div>
                <div className="text-[10px] text-slate-600">Ask about tunnels, IKE, BGP, certificates, cloud connectivity, or executive summaries</div>
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
              <input value={chat} onChange={(e) => setChat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask: 'Why is VPN-204 failing?' or 'Rotate certificates'"
                className="flex-1 text-[12px] px-3 py-2 rounded-lg border border-slate-200 bg-white" />
              <button onClick={send} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1"><Send className="h-3.5 w-3.5" />Send</button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["Deploy a new VPN", "Why is VPN-204 failing?", "Rotate certificates", "Show partner connectivity", "Generate executive VPN report"].map((s) => (
                <button key={s} onClick={() => setChat(s)} className="text-[10px] px-2 py-1 rounded-full bg-white/80 border border-slate-200 text-slate-700 hover:bg-white">{s}</button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 border-t border-slate-200 pt-3">
            <div>Data Refreshed: <span className="font-semibold text-slate-700">6 Seconds Ago</span></div>
            <div className="flex gap-4">
              <span><span className="font-bold text-slate-800">4,286</span> VPN Tunnels</span>
              <span><span className="font-bold text-slate-800">1,124</span> Connected Sites</span>
              <span><span className="font-bold text-slate-800">238</span> Cloud Gateways</span>
              <span><span className="font-bold text-slate-800">2,451</span> Applications</span>
              <span><span className="font-bold text-slate-800">842</span> Business Services</span>
            </div>
            <div>© 2026 NOVA AI Digital Coworker</div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
