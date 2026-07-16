import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Server, Link2, Cloud, Network, Activity, Gauge, TrendingUp,
  ShieldCheck, Zap, Lock, Monitor, Building2,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis } from "recharts";

const kpis: KPI[] = [
  { label: "Data Centers", value: "6", sub: "3 Regions", subColor: "text-slate-500", icon: Server, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "DC Interconnects", value: "18", sub: "All Healthy", subColor: "text-emerald-600", icon: Link2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Cloud Providers", value: "3", sub: "Azure, AWS, Hybrid", subColor: "text-violet-600", icon: Cloud, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Cloud Connections", value: "15", sub: "All Active", subColor: "text-emerald-600", icon: Network, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "ExpressRoute Circuits", value: "7", sub: "6 Active / 1 Provisioning", subColor: "text-amber-600", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Direct Connects", value: "6", sub: "All Active", subColor: "text-emerald-600", icon: Cloud, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Avg. Latency (ms)", value: "18 ms", sub: "Good", subColor: "text-emerald-600", icon: Gauge, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Avg. Throughput", value: "12.4 Gbps", sub: "Good", subColor: "text-emerald-600", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const dcs = [
  { id: "DC1", loc: "New Jersey" },
  { id: "DC2", loc: "Frankfurt" },
  { id: "DC3", loc: "Singapore" },
];
const clouds = [
  { id: "Microsoft Azure", color: "bg-blue-100 text-blue-700" },
  { id: "AWS", color: "bg-amber-100 text-amber-700" },
  { id: "Hybrid / Other Clouds", color: "bg-slate-100 text-slate-700" },
];

const cloudStatus = [
  { p: "Microsoft Azure", t: "ExpressRoute", c: "ER-NAM-01", region: "East US", status: "Active", bw: "10 Gbps", util: "32%" },
  { p: "Microsoft Azure", t: "ExpressRoute", c: "ER-EUR-01", region: "West Europe", status: "Active", bw: "10 Gbps", util: "28%" },
  { p: "Microsoft Azure", t: "ExpressRoute", c: "ER-APAC-01", region: "Southeast Asia", status: "Active", bw: "10 Gbps", util: "35%" },
  { p: "AWS", t: "Direct Connect", c: "DX-USE1-01", region: "US East (N. Virginia)", status: "Active", bw: "10 Gbps", util: "41%" },
  { p: "AWS", t: "Direct Connect", c: "DX-EUW1-01", region: "EU (Frankfurt)", status: "Active", bw: "10 Gbps", util: "37%" },
  { p: "AWS", t: "Direct Connect", c: "DX-APS1-01", region: "AP (Singapore)", status: "Active", bw: "10 Gbps", util: "33%" },
  { p: "Hybrid Cloud", t: "IPsec VPN", c: "VPN-HYB-01", region: "Global", status: "Active", bw: "2 Gbps", util: "22%" },
];

const allDcs = ["DC1 New Jersey", "DC2 Frankfurt", "DC3 Singapore", "DC4 London", "DC5 São Paulo", "DC6 Sydney"];

const perfMetrics = [
  { label: "Latency (Avg.)", value: "18 ms", trend: "↓ 12% vs last 7 days", color: "text-emerald-600", data: [25, 23, 22, 20, 19, 18, 18], unit: "ms", yMax: 40, stroke: "hsl(217 91% 60%)" },
  { label: "Throughput (Avg.)", value: "12.4 Gbps", trend: "↑ 8% vs last 7 days", color: "text-emerald-600", data: [10, 11, 11.5, 12, 12.2, 12.3, 12.4], unit: "Gbps", yMax: 20, stroke: "hsl(142 71% 45%)" },
  { label: "Packet Loss (Avg.)", value: "0.12%", trend: "↓ 15% vs last 7 days", color: "text-emerald-600", data: [0.3, 0.25, 0.2, 0.18, 0.15, 0.13, 0.12], unit: "%", yMax: 0.4, stroke: "hsl(38 92% 50%)" },
  { label: "Jitter (Avg.)", value: "2.1 ms", trend: "↓ 10% vs last 7 days", color: "text-emerald-600", data: [4, 3.5, 3, 2.8, 2.5, 2.3, 2.1], unit: "ms", yMax: 6, stroke: "hsl(262 83% 58%)" },
];

const bandwidth = [
  { name: "ExpressRoute", value: 70, pct: "43%", color: "hsl(217 91% 60%)" },
  { name: "Direct Connect", value: 60, pct: "37%", color: "hsl(142 71% 45%)" },
  { name: "MPLS / Private", value: 24, pct: "15%", color: "hsl(262 83% 58%)" },
  { name: "IPsec VPN", value: 8, pct: "5%", color: "hsl(38 92% 50%)" },
];

const topApps = [
  { app: "Microsoft 365", p: "Azure", tp: "3.2 Gbps", pct: "25%" },
  { app: "SAP S/4HANA", p: "AWS", tp: "2.6 Gbps", pct: "21%" },
  { app: "Dynamics 365", p: "Azure", tp: "1.8 Gbps", pct: "14%" },
  { app: "Salesforce", p: "AWS", tp: "1.5 Gbps", pct: "12%" },
  { app: "Workday", p: "AWS", tp: "1.2 Gbps", pct: "9%" },
  { app: "Other Applications", p: "Multi", tp: "2.1 Gbps", pct: "19%" },
];

const alerts = [
  { time: "09:42 AM", type: "Info", source: "ER-NAM-01", msg: "BGP session recovered", sev: "Info" },
  { time: "08:15 AM", type: "Warning", source: "DX-EUW1-01", msg: "High latency detected", sev: "Warning" },
  { time: "07:21 AM", type: "Info", source: "DC2-FRA", msg: "Link utilization normalized", sev: "Info" },
  { time: "06:33 AM", type: "Critical", source: "MPLS-JPN-02", msg: "Circuit down – Traffic failed over", sev: "Critical" },
  { time: "05:10 AM", type: "Info", source: "ER-APAC-01", msg: "Bandwidth increase completed", sev: "Info" },
];

const wwh = {
  what: [
    "Data center interconnects and cross-connect status",
    "Cloud connectivity to Azure, AWS, and hybrid environments",
    "ExpressRoute / Direct Connect provisioning and health",
    "Latency, throughput, and packet loss performance metrics",
  ],
  why: [
    "Ensures secure, high-performance connectivity for critical workloads",
    "Reduces dependency risk and supports independent operations",
    "Enables cloud adoption, scalability, and modernization",
    "Separation requires new, reliable paths to data and cloud services",
  ],
  how: [
    "Dedicated interconnects with redundancy and automated failover",
    "Real-time monitoring of circuits, providers, and performance",
    "Policy-driven routing and bandwidth optimization",
    "Proactive alerts and capacity planning for sustained performance",
  ],
};

const outcomes: Outcome[] = [
  { icon: ShieldCheck, color: "text-blue-600", title: "Resilient by Design", l1: "Redundant links across providers and regions" },
  { icon: Gauge, color: "text-emerald-600", title: "High Performance", l1: "Low latency, high throughput connectivity" },
  { icon: Cloud, color: "text-violet-600", title: "Cloud Ready", l1: "Optimized connectivity to Azure, AWS & more" },
  { icon: Lock, color: "text-amber-600", title: "Secure & Private", l1: "Private circuits + encryption for all traffic" },
  { icon: Monitor, color: "text-slate-700", title: "Continuous Monitoring", l1: "24x7 visibility and proactive alerts" },
];

export default function DcCloudFabric() {
  return (
    <DashShell
      title="DATA CENTER &"
      highlight="CLOUD CONNECTIVITY FABRIC"
      subtitle="Unified visibility into data center interconnects and cloud connectivity to deliver a resilient, high-performance hybrid network."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Global Connectivity Fabric */}
        <div className="lg:col-span-4">
          <Section title="Global Connectivity Fabric">
            <div className="relative">
              {/* Connecting lines layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 220" preserveAspectRatio="none">
                {/* Left side: DC -> Core (left edge of core ~ x=130, right edge ~ x=170) */}
                <line x1="80" y1="40"  x2="130" y2="110" stroke="hsl(217 91% 60%)" strokeWidth="1.2" />
                <line x1="80" y1="110" x2="130" y2="110" stroke="hsl(142 71% 45%)" strokeWidth="1.2" strokeDasharray="4 3" />
                <line x1="80" y1="180" x2="130" y2="110" stroke="hsl(262 83% 58%)" strokeWidth="1.2" />
                {/* Right side: Core -> Cloud */}
                <line x1="170" y1="110" x2="220" y2="40"  stroke="hsl(217 91% 60%)" strokeWidth="1.2" strokeDasharray="4 3" />
                <line x1="170" y1="110" x2="220" y2="110" stroke="hsl(142 71% 45%)" strokeWidth="1.2" />
                <line x1="170" y1="110" x2="220" y2="180" stroke="hsl(217 91% 60%)" strokeWidth="1.2" strokeDasharray="4 3" />
              </svg>

              <div className="relative grid grid-cols-3 gap-2 items-stretch">
                {/* Data Centers */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-slate-700">Data Centers</div>
                  {dcs.map((d) => (
                    <div key={d.id} className="rounded-lg border border-slate-200 bg-white p-2 flex items-center gap-2 shadow-sm">
                      <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-slate-800">{d.id}</div>
                        <div className="text-[10px] text-slate-500">{d.loc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Core Backbone */}
                <div className="flex items-center justify-center">
                  <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-3 text-center w-full">
                    <div className="text-[10px] font-bold text-slate-800 mb-2">Core Backbone</div>
                    <div className="mx-auto h-12 w-12 rounded-full border-2 border-blue-300 grid place-items-center bg-blue-50">
                      <Network className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-[10px] font-semibold text-slate-800 mt-2">MPLS / DWDM</div>
                    <div className="text-[9px] text-slate-500">Global Backbone</div>
                  </div>
                </div>

                {/* Cloud & SaaS */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-slate-700 text-right">Cloud & SaaS</div>
                  {clouds.map((c) => (
                    <div key={c.id} className="rounded-lg border border-slate-200 bg-white p-2 flex items-center gap-2 shadow-sm">
                      <span className={`h-6 w-6 rounded grid place-items-center text-[9px] font-bold ${c.color} shrink-0`}>{c.id.slice(0,2)}</span>
                      <div className="text-xs font-semibold text-slate-800 leading-tight">{c.id}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <a className="text-xs text-blue-600 font-medium mt-3 inline-block">View all DCs →</a>
            <div className="flex flex-wrap gap-3 text-[10px] text-slate-600 justify-center mt-2">
              <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-violet-500" /> MPLS / Private</span>
              <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-emerald-500" /> ExpressRoute</span>
              <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-blue-500" /> Direct Connect</span>
              <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-slate-500" /> IPsec VPN</span>
            </div>
          </Section>
        </div>

        {/* Cloud Connectivity Status */}
        <div className="lg:col-span-4">
          <Section title="Cloud Connectivity Status">
            <table className="w-full text-[11px]">
              <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1.5">Provider</th>
                  <th className="text-left py-1.5">Connection Type</th>
                  <th className="text-left py-1.5">Circuit</th>
                  <th className="text-left py-1.5">Region</th>
                  <th className="text-left py-1.5">Status</th>
                  <th className="text-left py-1.5">Bandwidth</th>
                  <th className="text-left py-1.5">Util.</th>
                </tr>
              </thead>
              <tbody>
                {cloudStatus.map((c, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-1.5 font-medium text-slate-800">{c.p}</td>
                    <td className="py-1.5 text-slate-700">{c.t}</td>
                    <td className="py-1.5 font-mono text-[10px] text-slate-700">{c.c}</td>
                    <td className="py-1.5 text-slate-600">{c.region}</td>
                    <td className="py-1.5"><StatusPill status={c.status} /></td>
                    <td className="py-1.5 text-slate-700">{c.bw}</td>
                    <td className="py-1.5 text-slate-700">{c.util}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="text-xs text-blue-600 font-medium mt-2 inline-block">View all connections →</a>
          </Section>
        </div>

        {/* Interconnect Topology */}
        <div className="lg:col-span-4">
          <Section title="Interconnect Topology (Data Centers)">
            <div className="grid grid-cols-6 gap-2">
              {allDcs.map((d) => {
                const [id, ...loc] = d.split(" ");
                return (
                  <div key={d} className="rounded-lg border border-slate-200 bg-white p-1.5 text-center shadow-sm">
                    <div className="text-[11px] font-bold text-slate-800">{id}</div>
                    <div className="text-[9px] text-slate-500">{loc.join(" ")}</div>
                  </div>
                );
              })}
            </div>
            <svg viewBox="0 0 600 200" className="w-full h-44 mt-2">
              {/* Full mesh between top row (y=10) and bottom row (y=190) */}
              {[0,1,2,3,4,5].flatMap((a) => [0,1,2,3,4,5].map((b) => {
                const x1 = 50 + a * 100;
                const x2 = 50 + b * 100;
                const dist = Math.abs(a - b);
                let stroke = "hsl(217 91% 60%)";
                let dash = "";
                if (dist === 0 || dist === 1) {
                  stroke = "hsl(217 91% 55%)"; // active solid blue
                } else if (dist === 2 || dist === 3) {
                  stroke = "hsl(217 91% 65%)"; // backup dashed blue
                  dash = "4 3";
                } else {
                  stroke = "hsl(262 83% 65%)"; // planned dashed violet
                  dash = "4 3";
                }
                return (
                  <line key={`${a}-${b}`}
                    x1={x1} y1="10" x2={x2} y2="190"
                    stroke={stroke} strokeWidth="0.8" strokeDasharray={dash} opacity="0.85"
                  />
                );
              }))}
              {/* Top + bottom node markers */}
              {[0,1,2,3,4,5].map((i) => (
                <g key={i}>
                  <circle cx={50 + i * 100} cy="10"  r="4" fill="hsl(217 91% 50%)" />
                  <circle cx={50 + i * 100} cy="190" r="4" fill="hsl(217 91% 50%)" />
                </g>
              ))}
            </svg>
            <div className="flex flex-wrap gap-3 text-[10px] text-slate-600 justify-center mt-2">
              <span className="flex items-center gap-1"><span className="h-0.5 w-4 bg-blue-500" /> Active Link</span>
              <span className="flex items-center gap-1"><span className="h-0.5 w-4 border-t border-dashed border-blue-400" /> Backup Link</span>
              <span className="flex items-center gap-1"><span className="h-0.5 w-4 border-t border-dashed border-violet-400" /> Planned Link</span>
            </div>
          </Section>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <div className="lg:col-span-4">
          <Section title="Performance Overview (Global)">
            <div className="grid grid-cols-2 gap-3">
              {perfMetrics.map((m) => (
                <div key={m.label}>
                  <div className="text-[10px] text-slate-500">{m.label}</div>
                  <div className="text-lg font-extrabold text-slate-900">{m.value}</div>
                  <div className={`text-[10px] ${m.color}`}>{m.trend}</div>
                  <div className="h-16 mt-1">
                    <ResponsiveContainer>
                      <LineChart data={m.data.map((v, i) => ({ d: `Feb ${7 + i}`, v }))}>
                        <XAxis dataKey="d" tick={{ fontSize: 8 }} interval={5} />
                        <YAxis hide domain={[0, m.yMax]} />
                        <Line type="monotone" dataKey="v" stroke={m.stroke} strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Bandwidth Utilization by Link Type">
            <div className="flex items-center gap-3">
              <div className="relative h-40 w-40">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={bandwidth} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                      {bandwidth.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500">Total Capacity</div>
                    <div className="text-lg font-extrabold text-slate-900">162 Gbps</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-1.5 text-[11px]">
                {bandwidth.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="flex-1 text-slate-700">{d.name}</span>
                    <span className="font-semibold text-slate-900">{d.value} Gbps ({d.pct})</span>
                  </div>
                ))}
              </div>
            </div>
            <a className="text-xs text-blue-600 font-medium mt-2 inline-block">View capacity planning →</a>
          </Section>
        </div>

        <div className="lg:col-span-2">
          <Section title="Top Applications by Traffic">
            <table className="w-full text-[10px]">
              <thead className="text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1">Application</th>
                  <th className="text-left py-1">Provider</th>
                  <th className="text-left py-1">Avg.</th>
                  <th className="text-left py-1">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {topApps.map((a) => (
                  <tr key={a.app} className="border-b border-slate-100">
                    <td className="py-1 font-medium text-slate-800">{a.app}</td>
                    <td className="py-1 text-slate-600">{a.p}</td>
                    <td className="py-1 text-slate-700">{a.tp}</td>
                    <td className="py-1 text-slate-700">{a.pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="text-xs text-blue-600 font-medium mt-2 inline-block">View all applications →</a>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Alerts & Events (24 Hours)">
            <table className="w-full text-[10px]">
              <thead className="text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1">Time</th>
                  <th className="text-left py-1">Type</th>
                  <th className="text-left py-1">Source</th>
                  <th className="text-left py-1">Message</th>
                  <th className="text-left py-1">Severity</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-1 text-slate-700">{a.time}</td>
                    <td className="py-1"><StatusPill status={a.type} /></td>
                    <td className="py-1 font-mono text-[9px] text-slate-700">{a.source}</td>
                    <td className="py-1 text-slate-700">{a.msg}</td>
                    <td className="py-1"><StatusPill status={a.sev} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a className="text-xs text-blue-600 font-medium mt-2 inline-block">View all events →</a>
          </Section>
        </div>
      </div>
    </DashShell>
  );
}
