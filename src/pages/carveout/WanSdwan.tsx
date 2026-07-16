import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Globe, Network, Layers, Box, AlertTriangle, TrendingUp, Activity, Clock,
  ShieldCheck, ArrowRight, CheckCircle2,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import worldMap from "@/assets/world-regions-map.png";

const kpis: KPI[] = [
  { label: "Total Sites", value: "77", sub: "Across 24 Countries", subColor: "text-slate-500", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "SD-WAN Edges", value: "128", sub: "Online: 124 (96.9%)", subColor: "text-emerald-600", icon: Network, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Active Overlays", value: "6", sub: "Healthy", subColor: "text-emerald-600", icon: Layers, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Applications Monitored", value: "156", sub: "Healthy: 142 (91.0%)", subColor: "text-emerald-600", icon: Box, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Critical Alerts", value: "3", sub: "High: 2, Medium: 1", subColor: "text-red-600", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Links Up", value: "186 / 198", sub: "93.9%", subColor: "text-emerald-600", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Packet Loss (Avg)", value: "0.35%", sub: "Good", subColor: "text-emerald-600", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Latency (Avg)", value: "28 ms", sub: "Good", subColor: "text-emerald-600", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
];

const regions = [
  { name: "NORTH AMERICA", sites: 18, x: 22, y: 32 },
  { name: "EUROPE", sites: 21, x: 50, y: 28 },
  { name: "ASIA PACIFIC", sites: 20, x: 76, y: 40 },
  { name: "LATIN AMERICA", sites: 9, x: 30, y: 66 },
  { name: "MIDDLE EAST & AFRICA", sites: 9, x: 55, y: 56 },
];

const nodeLegend = [
  { l: "Hub Site", c: "bg-blue-600" },
  { l: "Edge Site", c: "bg-cyan-500" },
  { l: "Cloud Gateway", c: "bg-violet-500" },
  { l: "Data Center", c: "bg-slate-700" },
];
const linkLegend = [
  { l: "Excellent", c: "bg-emerald-500" },
  { l: "Good", c: "bg-blue-500" },
  { l: "Degraded", c: "bg-amber-500" },
  { l: "Down", c: "bg-red-500" },
];

const pathOptions = [
  { route: "inet-SGX-01 → inet-LON-02", l: "22 ms", j: "3 ms", loss: "0.12%", best: true },
  { route: "mpls-SGX-01 → mpls-FRA-01", l: "32 ms", j: "5 ms", loss: "0.35%" },
  { route: "inet-SGX-02 → inet-LON-03", l: "45 ms", j: "7 ms", loss: "0.62%" },
];

const apps = [
  { app: "Microsoft 365", bp: "High", policy: "Optimize", path: "Internet", traffic: "32%", perf: "Excellent" },
  { app: "SAP S/4HANA", bp: "High", policy: "MPLS Preferred", path: "MPLS", traffic: "18%", perf: "Good" },
  { app: "Salesforce", bp: "High", policy: "Optimize", path: "Internet", traffic: "12%", perf: "Excellent" },
  { app: "Workday", bp: "Medium", policy: "MPLS Preferred", path: "MPLS", traffic: "10%", perf: "Good" },
  { app: "Zoom", bp: "Medium", policy: "Optimize", path: "Internet", traffic: "8%", perf: "Good" },
  { app: "Dropbox", bp: "Low", policy: "Internet Preferred", path: "Internet", traffic: "5%", perf: "Excellent" },
  { app: "YouTube", bp: "Low", policy: "Internet Preferred", path: "Internet", traffic: "3%", perf: "Good" },
  { app: "Other", bp: "Low", policy: "Optimize", path: "Internet", traffic: "12%", perf: "Good" },
];

const circuitHealth = [
  { name: "Excellent", value: 103, pct: "52.0%", color: "hsl(142 71% 45%)" },
  { name: "Good", value: 60, pct: "30.3%", color: "hsl(217 91% 60%)" },
  { name: "Degraded", value: 22, pct: "11.1%", color: "hsl(38 92% 50%)" },
  { name: "Down", value: 13, pct: "6.6%", color: "hsl(0 84% 60%)" },
];

const linkPerf = [
  { link: "inet-SGX-01", type: "Internet", util: "78%", latency: "24 ms", loss: "0.15%", status: "Excellent" },
  { link: "mpls-SGX-01", type: "MPLS", util: "65%", latency: "28 ms", loss: "0.12%", status: "Good" },
  { link: "inet-SIN-02", type: "Internet", util: "62%", latency: "25 ms", loss: "0.18%", status: "Good" },
  { link: "mpls-FRA-01", type: "MPLS", util: "55%", latency: "31 ms", loss: "0.20%", status: "Good" },
  { link: "inet-NYC-02", type: "Internet", util: "48%", latency: "22 ms", loss: "0.10%", status: "Excellent" },
];

const failover = [
  { time: "09:42 AM", site: "London-02", from: "inet-LON-01", to: "mpls-LON-01", reason: "High Loss", impact: "Seamless" },
  { time: "08:15 AM", site: "Singapore-01", from: "inet-SGX-01", to: "inet-SGX-02", reason: "Link Down", impact: "Seamless" },
  { time: "07:21 AM", site: "Dubai-01", from: "mpls-DXB-01", to: "inet-DXB-02", reason: "High Latency", impact: "Seamless" },
  { time: "04:33 AM", site: "Sao Paulo-01", from: "inet-SAO-01", to: "mpls-SAO-01", reason: "Packet Loss", impact: "Seamless" },
  { time: "01:18 AM", site: "New York-02", from: "inet-NYC-01", to: "inet-NYC-03", reason: "Link Down", impact: "Seamless" },
];

const policies = [
  { name: "Path Selection", v: 16, w: 95 },
  { name: "Application Steering", v: 12, w: 75 },
  { name: "QoS & Prioritization", v: 6, w: 38 },
  { name: "Security & Segmentation", v: 5, w: 30 },
  { name: "Others", v: 3, w: 18 },
];

const wwh = {
  what: [
    "SD-WAN overlays, sites, and policies",
    "Path optimization and real-time routing decisions",
    "Traffic steering by application, user group, or destination",
    "Circuit health across all WAN links and providers",
    "Failover events and performance impact",
  ],
  why: [
    "Delivers best application experience with intelligent path selection",
    "Maximizes uptime with sub-second failover and dynamic rerouting",
    "Reduces cost by steering traffic over optimal links",
    "Provides agility to adapt to changing conditions and business needs",
    "Application-aware networking, not static routing",
  ],
  how: [
    "Intent-based policies define how traffic is steered",
    "Real-time telemetry from edges, links, and applications",
    "AI-driven path selection based on performance and business intent",
    "Automated remediation and seamless failover",
    "Centralized orchestration with granular visibility and control",
  ],
};

const outcomes: Outcome[] = [
  { icon: ShieldCheck, color: "text-blue-600", title: "Outcome", l1: "Intelligent path selection, application-aware steering, and automated failover ensure maximum performance, reliability, and cost efficiency across the global network." },
];

export default function WanSdwan() {
  return (
    <DashShell
      title="WAN / SD-WAN"
      highlight="ORCHESTRATION CONSOLE"
      subtitle="Intelligent, application-aware network control with real-time visibility, dynamic path optimization, and automated failover."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Topology */}
        <div className="lg:col-span-5">
          <Section title="SD-WAN Topology Overview">
            <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-slate-50">
              <img src={worldMap} alt="topology" className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale" />
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="22" y1="32" x2="50" y2="28" stroke="hsl(142 71% 45%)" strokeWidth="0.3" />
                <line x1="50" y1="28" x2="76" y2="40" stroke="hsl(217 91% 60%)" strokeWidth="0.3" />
                <line x1="22" y1="32" x2="76" y2="40" stroke="hsl(38 92% 50%)" strokeWidth="0.3" strokeDasharray="1 1" />
                <line x1="22" y1="32" x2="30" y2="66" stroke="hsl(142 71% 45%)" strokeWidth="0.3" />
                <line x1="50" y1="28" x2="55" y2="56" stroke="hsl(0 84% 60%)" strokeWidth="0.3" strokeDasharray="1 1" />
                <line x1="76" y1="40" x2="55" y2="56" stroke="hsl(217 91% 60%)" strokeWidth="0.3" />
                <line x1="30" y1="66" x2="55" y2="56" stroke="hsl(38 92% 50%)" strokeWidth="0.3" />
              </svg>
              {regions.map((r) => (
                <div key={r.name} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${r.x}%`, top: `${r.y}%` }}>
                  <div className="bg-white border border-slate-200 rounded px-2 py-0.5 shadow text-[9px] font-bold text-slate-800">{r.name}</div>
                  <div className="text-[9px] text-slate-600">{r.sites} Sites</div>
                  <div className="mx-auto mt-0.5 h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-white" />
                </div>
              ))}
              <div className="absolute left-2 bottom-2 bg-white/95 rounded-md border border-slate-200 p-2 text-[9px] space-y-0.5">
                <div className="font-bold text-slate-700 mb-0.5">LEGEND</div>
                {nodeLegend.map((l) => (
                  <div key={l.l} className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${l.c}`} />
                    <span className="text-slate-700">{l.l}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 my-1" />
                <div className="font-bold text-slate-700">LINK STATUS</div>
                {linkLegend.map((l) => (
                  <div key={l.l} className="flex items-center gap-1.5">
                    <span className={`h-0.5 w-3 ${l.c}`} />
                    <span className="text-slate-700">{l.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3 text-center text-[11px]">
              {[
                { i: CheckCircle2, c: "text-emerald-600", l: "Optimal Paths", v: 124 },
                { i: AlertTriangle, c: "text-amber-600", l: "Degraded Paths", v: 9 },
                { i: AlertTriangle, c: "text-red-600", l: "Down Paths", v: 3 },
                { i: Activity, c: "text-blue-600", l: "Re-routed (24h)", v: 26 },
              ].map((s) => {
                const I = s.i;
                return (
                  <div key={s.l} className="rounded border border-slate-200 p-2">
                    <I className={`h-4 w-4 mx-auto ${s.c}`} />
                    <div className="text-slate-500 text-[10px] mt-1">{s.l}</div>
                    <div className="font-bold text-slate-900">{s.v}</div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Path optimization */}
        <div className="lg:col-span-4">
          <Section title="Path Optimization & Routing Decisions">
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-slate-200 rounded-lg p-3 text-[11px] space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-500">Selected Path</div>
                <div className="flex items-center gap-1 font-semibold text-slate-900">Singapore-01 <ArrowRight className="h-3 w-3" /> Microsoft 365</div>
                <div className="flex justify-between"><span className="text-slate-500">Application</span><span className="text-slate-800">Microsoft 365</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Business Priority</span><span className="font-semibold text-slate-800">High</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Current Path</span><span className="font-mono text-[10px]">inet-SGX-01 → inet-LON-02</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-semibold text-emerald-600">Optimal</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Latency</span><span>22 ms · 3 ms</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Packet Loss</span><span>0.12%</span></div>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-500">Path Options</div>
                {pathOptions.map((p) => (
                  <div key={p.route} className={`border rounded-lg p-2 text-[10px] ${p.best ? "border-emerald-300 bg-emerald-50" : "border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-800">{p.route}</span>
                      {p.best && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Best</span>}
                    </div>
                    <div className="text-slate-600 mt-0.5">{p.l} | {p.j} | {p.loss}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 border border-slate-200 rounded-lg p-2 text-[11px]">
              <div className="font-semibold text-slate-800">Routing Decision (Real-time)</div>
              <div className="flex justify-between mt-1 text-[10px] text-slate-600"><span>Selected best performing path based on latency, jitter, loss, and policy.</span><span>Decision Time: 120 ms</span></div>
            </div>
          </Section>
        </div>

        {/* App steering */}
        <div className="lg:col-span-3">
          <Section title="Application Traffic Steering">
            <table className="w-full text-[10px]">
              <thead className="text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1">Application</th>
                  <th className="text-left py-1">Priority</th>
                  <th className="text-left py-1">Policy</th>
                  <th className="text-left py-1">Path</th>
                  <th className="text-left py-1">%</th>
                  <th className="text-left py-1">Perf</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.app} className="border-b border-slate-100">
                    <td className="py-1 font-medium text-slate-800">{a.app}</td>
                    <td className="py-1 text-slate-600">{a.bp}</td>
                    <td className="py-1 text-slate-600">{a.policy}</td>
                    <td className="py-1 text-slate-600">{a.path}</td>
                    <td className="py-1 text-slate-700">{a.traffic}</td>
                    <td className="py-1"><span className={`font-semibold ${a.perf === "Excellent" ? "text-emerald-600" : "text-blue-600"}`}>● {a.perf}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="text-xs text-blue-600 font-medium mt-2 inline-block">View all applications →</a>
          </Section>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <div className="lg:col-span-3">
          <Section title="Circuit Health Overview">
            <div className="flex items-center gap-3">
              <div className="relative h-40 w-40">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={circuitHealth} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                      {circuitHealth.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-xl font-extrabold text-slate-900">198</div>
                    <div className="text-[10px] text-slate-500">Total Links</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-1 text-[11px]">
                {circuitHealth.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    <span className="flex-1 text-slate-700">{d.name}</span>
                    <span className="font-semibold text-slate-900">{d.value}</span>
                    <span className="text-slate-500">({d.pct})</span>
                  </div>
                ))}
              </div>
            </div>
            <a className="text-xs text-blue-600 font-medium mt-2 inline-block">View link details →</a>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Link Performance (Top 5 by Utilization)">
            <table className="w-full text-[11px]">
              <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1.5">Link</th>
                  <th className="text-left py-1.5">Type</th>
                  <th className="text-left py-1.5">Util</th>
                  <th className="text-left py-1.5">Latency</th>
                  <th className="text-left py-1.5">Loss</th>
                  <th className="text-left py-1.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {linkPerf.map((l) => (
                  <tr key={l.link} className="border-b border-slate-100">
                    <td className="py-1.5 font-mono text-[10px] text-slate-800">{l.link}</td>
                    <td className="py-1.5 text-slate-600">{l.type}</td>
                    <td className="py-1.5">{l.util}</td>
                    <td className="py-1.5">{l.latency}</td>
                    <td className="py-1.5">{l.loss}</td>
                    <td className="py-1.5"><StatusPill status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="text-xs text-blue-600 font-medium mt-2 inline-block">View all circuits →</a>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Failover Events (24 Hours)">
            <table className="w-full text-[11px]">
              <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1.5">Time</th>
                  <th className="text-left py-1.5">Site</th>
                  <th className="text-left py-1.5">From → To</th>
                  <th className="text-left py-1.5">Reason</th>
                  <th className="text-left py-1.5">Impact</th>
                </tr>
              </thead>
              <tbody>
                {failover.map((f, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-700">{f.time}</td>
                    <td className="py-1.5 font-medium text-slate-800">{f.site}</td>
                    <td className="py-1.5 font-mono text-[9px] text-slate-600">{f.from} → {f.to}</td>
                    <td className="py-1.5 text-slate-700">{f.reason}</td>
                    <td className="py-1.5"><span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">{f.impact}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="text-xs text-blue-600 font-medium mt-2 inline-block">View all events →</a>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Policy Overview">
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div><div className="text-lg font-extrabold text-slate-900">42</div><div className="text-[10px] text-slate-500">Total Policies</div></div>
              <div><div className="text-lg font-extrabold text-slate-900">38</div><div className="text-[10px] text-slate-500">Active Policies</div></div>
              <div><div className="text-lg font-extrabold text-slate-900">12</div><div className="text-[10px] text-slate-500">Policy Changes (24h)</div></div>
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">Policies by Type</div>
            <div className="space-y-2">
              {policies.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between text-[11px]"><span className="text-slate-700">{p.name}</span><span className="font-semibold">{p.v}</span></div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${p.w}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <a className="text-xs text-blue-600 font-medium mt-2 inline-block">View all policies →</a>
          </Section>
        </div>
      </div>
    </DashShell>
  );
}
