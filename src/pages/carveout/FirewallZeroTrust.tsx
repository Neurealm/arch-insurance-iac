import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Shield, ShieldCheck, Lock, AlertTriangle, CheckCircle, Eye, Target, Activity,
  FileText, Layers, Network, Crosshair, ShieldAlert, Globe, Server, Database,
  Settings, UserCheck, Smartphone, Fingerprint, ArrowRight, ClipboardCheck, Zap,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const kpis: KPI[] = [
  { label: "Firewalls Managed", value: "128", sub: "Across 24 Countries", icon: Server, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Active Policies", value: "4,782", sub: "↑ 5% vs last 7 days", subColor: "text-emerald-600", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Policy Rule Hygiene", value: "92%", sub: "Good", subColor: "text-emerald-600", icon: CheckCircle, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Security Zones", value: "48", sub: "6 Critical Zones", subColor: "text-amber-600", icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Microsegments", value: "356", sub: "↑ 12% vs last 7 days", subColor: "text-emerald-600", icon: Network, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Zero Trust Enforcement Points", value: "217", sub: "All Active", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Threats Detected (24h)", value: "23", sub: "↓ 28% vs last 7 days", subColor: "text-emerald-600", icon: Crosshair, color: "text-red-600", bg: "bg-red-50" },
  { label: "Blocked Threats (24h)", value: "18", sub: "↑ 15% vs last 7 days", subColor: "text-emerald-600", icon: ShieldAlert, color: "text-violet-600", bg: "bg-violet-50" },
];

const segmentData = [
  { name: "Critical", value: 6, color: "hsl(0 84% 60%)" },
  { name: "High", value: 12, color: "hsl(38 92% 50%)" },
  { name: "Medium", value: 18, color: "hsl(217 91% 60%)" },
  { name: "Low", value: 12, color: "hsl(142 71% 45%)" },
];

const zones = [
  { icon: Globe, name: "Internet Zone", tag: "Untrusted", tagColor: "text-red-600" },
  { icon: Server, name: "DMZ Zone", tag: "Public Services", tagColor: "text-amber-600" },
  { icon: Settings, name: "Application Zone", tag: "Business Apps", tagColor: "text-blue-600" },
  { icon: Database, name: "Data Zone", tag: "Databases", tagColor: "text-violet-600" },
  { icon: Lock, name: "Management Zone", tag: "Admin Access", tagColor: "text-emerald-600" },
];

const ruleHealth = [
  { name: "Active & Used", value: 3621, pct: "76%", color: "hsl(142 71% 45%)" },
  { name: "Active but Unused", value: 687, pct: "14%", color: "hsl(38 92% 50%)" },
  { name: "Redundant", value: 282, pct: "6%", color: "hsl(25 95% 53%)" },
  { name: "Shadowed", value: 122, pct: "3%", color: "hsl(0 84% 60%)" },
  { name: "Disabled", value: 70, pct: "1%", color: "hsl(220 9% 70%)" },
];

const ztMetrics = [
  { label: "Identity Verified", value: "98%", sub: "All Access Requests" },
  { label: "Device Posture Compliant", value: "96%", sub: "Validated Devices" },
  { label: "Least Privilege Access", value: "94%", sub: "Enforced Policies" },
  { label: "MFA Enforcement", value: "99%", sub: "All Access Points" },
];

const ztFlow = [
  { icon: UserCheck, label: "User / Device" },
  { icon: Fingerprint, label: "Verify Identity" },
  { icon: Smartphone, label: "Check Device Posture" },
  { icon: ShieldCheck, label: "Evaluate Policy" },
  { icon: CheckCircle, label: "Grant Least Privilege Access" },
];

const zoneTraffic = [
  { zone: "Internet Zone", traffic: "3,245", allowed: "3,102", blocked: "143", pct: "4.4%", trend: "↓" },
  { zone: "DMZ Zone", traffic: "1,842", allowed: "1,782", blocked: "60", pct: "3.3%", trend: "↓" },
  { zone: "Application Zone", traffic: "2,156", allowed: "2,123", blocked: "33", pct: "1.5%", trend: "↓" },
  { zone: "Data Zone", traffic: "1,325", allowed: "1,315", blocked: "10", pct: "0.8%", trend: "↓" },
  { zone: "Management Zone", traffic: "328", allowed: "324", blocked: "4", pct: "1.2%", trend: "↓" },
  { zone: "Total", traffic: "8,896", allowed: "8,646", blocked: "250", pct: "2.8%", trend: "↓", bold: true },
];

const threats = [
  { name: "Intrusion Attempts", value: 9, pct: "39%", color: "hsl(0 84% 60%)" },
  { name: "Malware Communications", value: 6, pct: "26%", color: "hsl(25 95% 53%)" },
  { name: "C2 Communications", value: 4, pct: "17%", color: "hsl(38 92% 50%)" },
  { name: "Port Scans", value: 3, pct: "13%", color: "hsl(217 91% 60%)" },
  { name: "DNS Tunneling", value: 1, pct: "4%", color: "hsl(262 83% 58%)" },
];

const events = [
  { time: "10:24 AM", sev: "High", type: "Malware Communication", src: "203.0.113.45", dst: "10.20.30.15", action: "Blocked" },
  { time: "10:12 AM", sev: "High", type: "C2 Communication", src: "185.199.108.23", dst: "10.10.5.25", action: "Blocked" },
  { time: "09:58 AM", sev: "Medium", type: "Intrusion Attempt", src: "198.51.100.77", dst: "10.30.15.22", action: "Blocked" },
  { time: "09:41 AM", sev: "Medium", type: "Port Scan", src: "203.0.113.91", dst: "10.20.10.12", action: "Blocked" },
  { time: "09:30 AM", sev: "Low", type: "Policy Violation", src: "10.50.8.33", dst: "Internet", action: "Allowed" },
];

const wwh = {
  what: [
    "Firewall policies, rule health, and traffic control",
    "Network segmentation across zones and microsegments",
    "Zero Trust enforcement points and access validation",
    "Threat detection, prevention, and security events at the network layer",
  ],
  why: [
    "Network separation increases the attack surface and risk",
    "Strong segmentation and Zero Trust reduce lateral movement",
    "Policy hygiene and least privilege prevent security gaps",
    "Real-time threat detection protects critical data and services",
  ],
  how: [
    "Centralized policy management across all firewalls and security devices",
    "Microsegmentation with identity-aware and application-aware controls",
    "Zero Trust enforcement at every access point",
    "AI/ML-powered threat detection with automated response",
  ],
};

const outcomes: Outcome[] = [
  { icon: ShieldCheck, color: "text-emerald-600", title: "SECURE BY DESIGN", l1: "Built-in segmentation and least privilege" },
  { icon: Fingerprint, color: "text-blue-600", title: "ZERO TRUST EVERYWHERE", l1: "Verify explicitly, least privilege access" },
  { icon: Crosshair, color: "text-red-600", title: "THREAT PROTECTION", l1: "Detect, prevent, and respond in real time" },
  { icon: ClipboardCheck, color: "text-violet-600", title: "POLICY HYGIENE", l1: "Continuous review and optimization" },
  { icon: CheckCircle, color: "text-emerald-600", title: "COMPLIANT & AUDIT READY", l1: "Full visibility and reporting" },
];

function sevPill(sev: string) {
  const map: Record<string, string> = {
    High: "bg-red-50 text-red-700 border-red-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[sev]}`}>{sev}</span>;
}

function actionPill(a: string) {
  const cls = a === "Blocked" ? "text-red-600" : "text-emerald-600";
  return <span className={`text-xs font-semibold ${cls}`}>{a}</span>;
}

function GaugeChart({ pct }: { pct: number }) {
  const data = [
    { name: "v", value: pct, color: "hsl(142 71% 45%)" },
    { name: "rest", value: 100 - pct, color: "hsl(220 13% 91%)" },
  ];
  return (
    <div className="relative h-44">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" startAngle={180} endAngle={0} innerRadius={55} outerRadius={80} paddingAngle={0} cy="80%">
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <div className="text-3xl font-extrabold text-slate-900">{pct}%</div>
        <div className="text-xs font-semibold text-emerald-600">Good</div>
      </div>
      <div className="absolute bottom-1 left-2 text-[10px] text-slate-500">0%</div>
      <div className="absolute bottom-1 right-2 text-[10px] text-slate-500">100%</div>
    </div>
  );
}

export default function FirewallZeroTrust() {
  return (
    <DashShell
      title="FIREWALL, SECURITY &"
      highlight="ZERO TRUST CONTROL LAYER"
      subtitle="Secure, segmented, and zero trust network protection with real-time visibility, policy enforcement, and threat detection across the global network."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Segmentation + Rule Hygiene + Zero Trust */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Network Segmentation Overview">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={segmentData} dataKey="value" innerRadius={42} outerRadius={70} paddingAngle={2}>
                    {segmentData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-2xl font-extrabold text-slate-900">48</div>
                <div className="text-[10px] text-slate-500">Zones</div>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {segmentData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-700">{d.name}</span>
                  <span className="ml-auto font-semibold text-slate-900">({d.value})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {zones.map((z) => {
              const Icon = z.icon;
              return (
                <div key={z.name} className="flex items-center gap-2 p-1.5 rounded bg-slate-50 border border-slate-100">
                  <Icon className="h-3.5 w-3.5 text-slate-600" />
                  <span className="text-xs font-medium text-slate-800">{z.name}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400 ml-auto" />
                  <span className={`text-[11px] font-semibold ${z.tagColor}`}>{z.tag}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-[10px] text-emerald-700 font-medium border-t border-slate-100 pt-2">
            Microsegmentation Enabled Across 356 Segments
          </div>
        </Section>

        <Section title="Firewall Policy Rule Hygiene">
          <div className="grid grid-cols-2 gap-3 items-center">
            <GaugeChart pct={92} />
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-slate-500 uppercase">Rule Health Distribution</div>
              {ruleHealth.map((r) => (
                <div key={r.name} className="flex items-center gap-1.5 text-[11px]">
                  <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                  <span className="text-slate-700">{r.name}</span>
                  <span className="ml-auto font-semibold text-slate-900">{r.value.toLocaleString()} ({r.pct})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-600 space-y-0.5">
            <div>Last Policy Review: <span className="font-semibold text-slate-800">Feb 10, 2026</span></div>
            <div>Next Review: <span className="font-semibold text-slate-800">Feb 24, 2026</span></div>
          </div>
        </Section>

        <Section title="Zero Trust Enforcement">
          <div className="grid grid-cols-2 gap-2">
            {ztMetrics.map((m) => (
              <div key={m.label} className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
                <div className="text-[10px] font-medium text-slate-600">{m.label}</div>
                <div className="text-2xl font-extrabold text-blue-700 mt-1">{m.value}</div>
                <div className="text-[10px] text-slate-500">{m.sub}</div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Zero Trust Access Flow</div>
            <div className="flex items-center justify-between gap-1">
              {ztFlow.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-1 flex-1">
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className="h-8 w-8 rounded-full bg-slate-100 grid place-items-center text-slate-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-[9px] text-slate-700 mt-1 leading-tight">{s.label}</div>
                    </div>
                    {i < ztFlow.length - 1 && <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </Section>
      </div>

      {/* Row 2: Zone Traffic + Threats + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Security Zones – Traffic Overview (24h)">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2">Zone</th>
                <th className="text-right py-2">Traffic (GB)</th>
                <th className="text-right py-2">Allowed</th>
                <th className="text-right py-2">Blocked</th>
                <th className="text-right py-2">Blocked %</th>
                <th className="text-right py-2">Trend</th>
              </tr>
            </thead>
            <tbody>
              {zoneTraffic.map((z) => (
                <tr key={z.zone} className={`border-b border-slate-100 ${z.bold ? "font-bold bg-slate-50" : ""}`}>
                  <td className="py-2 text-slate-800">{z.zone}</td>
                  <td className="py-2 text-right text-slate-700">{z.traffic}</td>
                  <td className="py-2 text-right text-slate-700">{z.allowed}</td>
                  <td className="py-2 text-right text-slate-700">{z.blocked}</td>
                  <td className="py-2 text-right text-slate-700">{z.pct}</td>
                  <td className="py-2 text-right text-emerald-600">{z.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Threat Detection at Network Layer (24h)">
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="relative h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={threats} dataKey="value" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {threats.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-2xl font-extrabold text-slate-900">23</div>
                <div className="text-[10px] text-slate-500">Threats</div>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {threats.map((t) => (
                <div key={t.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                  <span className="text-slate-700">{t.name}</span>
                  <span className="ml-auto font-semibold text-slate-900">{t.value} ({t.pct})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-700 border-t border-slate-100 pt-2 flex items-center gap-3">
            <span><span className="font-semibold text-red-600">18</span> Blocked</span>
            <span className="text-slate-300">|</span>
            <span><span className="font-semibold text-amber-600">5</span> Allowed (Monitored)</span>
            <span className="text-slate-300">|</span>
            <span><span className="font-semibold text-slate-600">0</span> Pending</span>
          </div>
        </Section>

        <Section title="Top Security Events (24h)">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">Severity</th>
                <th className="text-left py-2">Event Type</th>
                <th className="text-left py-2">Source</th>
                <th className="text-left py-2">Destination</th>
                <th className="text-left py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">{e.time}</td>
                  <td className="py-2">{sevPill(e.sev)}</td>
                  <td className="py-2 text-slate-800 font-medium">{e.type}</td>
                  <td className="py-2 text-slate-700 font-mono text-[10px]">{e.src}</td>
                  <td className="py-2 text-slate-700 font-mono text-[10px]">{e.dst}</td>
                  <td className="py-2">{actionPill(e.action)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="mt-2 inline-block text-xs text-blue-600 font-medium cursor-pointer">View all security events →</a>
        </Section>
      </div>

      {/* Alerts strip */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-red-100 grid place-items-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-red-700">Critical Security Alerts</div>
            <div className="text-2xl font-extrabold text-slate-900">3</div>
            <div className="text-[10px] text-red-600">Requires Immediate Attention</div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 grid place-items-center">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-amber-700">High Alerts</div>
            <div className="text-2xl font-extrabold text-slate-900">7</div>
            <div className="text-[10px] text-amber-600">Needs Investigation</div>
          </div>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50/50 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-yellow-100 grid place-items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-yellow-700">Medium Alerts</div>
            <div className="text-2xl font-extrabold text-slate-900">12</div>
            <div className="text-[10px] text-yellow-600">Monitoring</div>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 grid place-items-center">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-emerald-700">Security Posture Score</div>
            <div className="text-2xl font-extrabold text-slate-900">88 / 100</div>
            <div className="text-[10px] text-emerald-600">Good</div>
          </div>
        </div>
      </div>
    </DashShell>
  );
}
