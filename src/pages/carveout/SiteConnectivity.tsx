import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Globe, CheckCircle2, Clock, AlertTriangle, TrendingUp, Wifi, Network,
  Target, ShieldCheck, Users, Clock4, Search,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import worldMap from "@/assets/world-regions-map.png";

const kpis: KPI[] = [
  { label: "Total Sites", value: "77", sub: "Across 24 Countries", subColor: "text-slate-500", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Ready (Independent)", value: "46", sub: "59.7%", subColor: "text-emerald-600", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "In Progress", value: "22", sub: "28.6%", subColor: "text-amber-600", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Not Ready (At Risk)", value: "9", sub: "11.7%", subColor: "text-red-600", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { label: "WAN Circuits Active", value: "63 / 77", sub: "81.8%", subColor: "text-emerald-600", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "WiFi Deployed", value: "54 / 77", sub: "70.1%", subColor: "text-emerald-600", icon: Wifi, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "LAN Deployed", value: "58 / 77", sub: "75.3%", subColor: "text-emerald-600", icon: Network, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Last-Mile At Risk", value: "7", sub: "9.1%", subColor: "text-red-600", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
];

const readinessTotal = [
  { name: "Ready (Independent)", value: 46, pct: "59.7%", color: "hsl(142 71% 45%)" },
  { name: "In Progress", value: 22, pct: "28.6%", color: "hsl(38 92% 50%)" },
  { name: "Not Ready (At Risk)", value: 9, pct: "11.7%", color: "hsl(0 84% 60%)" },
];

const regionMarkers = [
  { name: "North America", pct: 78, ratio: "18 / 23", x: 22, y: 32 },
  { name: "Europe", pct: 75, ratio: "12 / 16", x: 50, y: 28 },
  { name: "Asia Pacific", pct: 73, ratio: "11 / 15", x: 75, y: 42 },
  { name: "Latin America", pct: 64, ratio: "7 / 11", x: 30, y: 65 },
  { name: "Middle East & Africa", pct: 50, ratio: "6 / 12", x: 55, y: 56 },
];

const sites = [
  { name: "Boston-01", loc: "USA", region: "North America", overall: "Ready", wan: "Active", lan: "Complete", wifi: "Complete", lm: "Low", crit: 0 },
  { name: "London-02", loc: "UK", region: "Europe", overall: "Ready", wan: "Active", lan: "Complete", wifi: "Complete", lm: "Low", crit: 0 },
  { name: "Singapore-03", loc: "Singapore", region: "Asia Pacific", overall: "Ready", wan: "Active", lan: "Complete", wifi: "Complete", lm: "Low", crit: 0 },
  { name: "São Paulo-01", loc: "Brazil", region: "Latin America", overall: "In Progress", wan: "In Progress", lan: "Complete", wifi: "In Progress", lm: "Medium", crit: 1 },
  { name: "Johannesburg-01", loc: "South Africa", region: "MEA", overall: "In Progress", wan: "Ordered", lan: "Not Started", wifi: "Not Started", lm: "High", crit: 2 },
  { name: "Dubai-01", loc: "UAE", region: "MEA", overall: "Not Ready", wan: "Pending", lan: "Not Started", wifi: "Not Started", lm: "High", crit: 3 },
  { name: "Toronto-01", loc: "Canada", region: "North America", overall: "Ready", wan: "Active", lan: "Complete", wifi: "Complete", lm: "Low", crit: 0 },
  { name: "Paris-01", loc: "France", region: "Europe", overall: "In Progress", wan: "In Progress", lan: "Complete", wifi: "In Progress", lm: "Medium", crit: 1 },
  { name: "Jakarta-01", loc: "Indonesia", region: "Asia Pacific", overall: "In Progress", wan: "Ordered", lan: "In Progress", wifi: "In Progress", lm: "Medium", crit: 1 },
  { name: "Mexico City-01", loc: "Mexico", region: "Latin America", overall: "Not Ready", wan: "Pending", lan: "Not Started", wifi: "Not Started", lm: "High", crit: 2 },
];

const wanStatus = [
  { name: "Active", value: 63, pct: "81.8%", color: "hsl(142 71% 45%)" },
  { name: "In Progress", value: 8, pct: "10.4%", color: "hsl(217 91% 60%)" },
  { name: "Ordered", value: 4, pct: "5.2%", color: "hsl(38 92% 50%)" },
  { name: "Pending", value: 2, pct: "2.6%", color: "hsl(0 84% 60%)" },
];

const lastMileRisk = [
  { name: "High Risk", value: 3, pct: "3.9%", color: "hsl(0 84% 60%)" },
  { name: "Medium Risk", value: 4, pct: "5.2%", color: "hsl(38 92% 50%)" },
  { name: "Low Risk", value: 7, pct: "9.1%", color: "hsl(45 93% 58%)" },
  { name: "No Risk", value: 63, pct: "81.8%", color: "hsl(142 71% 45%)" },
];

const topRisks = [
  { site: "Dubai-01", loc: "UAE", risk: "High", reason: "ISP circuit not provisioned", owner: "Carrier Team", target: "Feb 16, 2026" },
  { site: "Johannesburg-01", loc: "South Africa", risk: "High", reason: "Last-mile fiber delay", owner: "Field Ops", target: "Feb 18, 2026" },
  { site: "Mexico City-01", loc: "Mexico", risk: "Medium", reason: "Local provider issue", owner: "Carrier Team", target: "Feb 20, 2026" },
  { site: "São Paulo-01", loc: "Brazil", risk: "Medium", reason: "Permit pending for installation", owner: "Field Ops", target: "Feb 20, 2026" },
];

const trend = [
  { d: "Feb 7", v: 45 }, { d: "Feb 8", v: 49 }, { d: "Feb 9", v: 52 },
  { d: "Feb 10", v: 55 }, { d: "Feb 11", v: 57 }, { d: "Feb 12", v: 58 }, { d: "Feb 13", v: 59.7 },
];

const wwh = {
  what: [
    "Readiness status of 77+ sites across the globe",
    "WAN circuit provisioning status (ordered, installed, active)",
    "LAN and WiFi deployment progress at each site",
    "Last-mile connectivity risks and open issues",
  ],
  why: [
    "Separation success depends on every site being ready on Day 1",
    "Site-level gaps create business disruption and delay cutover",
    "Early risk visibility enables proactive remediation",
    "Ensures consistent execution and full network independence",
  ],
  how: [
    "Ingest real-time data from network tools, carriers, and field teams",
    "Track every site across WAN, LAN, WiFi, and last-mile dependencies",
    "Automate readiness scoring and risk detection",
    "Escalate issues and track to resolution with ownership and SLAs",
  ],
};

const outcomes: Outcome[] = [
  { icon: Target, color: "text-blue-600", title: "Focus", l1: "Ensure every site is ready for Day 1 independence" },
  { icon: ShieldCheck, color: "text-emerald-600", title: "Proactive", l1: "Identify and resolve risks before they impact cutover" },
  { icon: Users, color: "text-violet-600", title: "Accountability", l1: "Clear owners and SLAs for every issue" },
  { icon: Clock4, color: "text-amber-600", title: "Outcome", l1: "Zero surprises on Day 1. Business stays connected." },
];

function Donut({ data, total, sub }: { data: { name: string; value: number; color: string }[]; total: string | number; sub?: string }) {
  return (
    <div className="relative h-44 w-44">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-extrabold text-slate-900">{total}</div>
          {sub && <div className="text-[10px] text-slate-500">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function Gauge({ value, total, pctLabel }: { value: number; total: number; pctLabel: string }) {
  const pct = (value / total) * 100;
  const angle = (pct / 100) * 180;
  const r = 60;
  const cx = 70, cy = 70;
  const rad = (deg: number) => (deg - 180) * (Math.PI / 180);
  const x = cx + r * Math.cos(rad(angle));
  const y = cy + r * Math.sin(rad(angle));
  const large = angle > 180 ? 1 : 0;
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="80" viewBox="0 0 140 80">
        <path d={`M 10 70 A 60 60 0 0 1 130 70`} stroke="hsl(220 13% 91%)" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d={`M 10 70 A 60 60 0 ${large} 1 ${x} ${y}`} stroke="hsl(142 71% 45%)" strokeWidth="12" fill="none" strokeLinecap="round" />
        <text x="70" y="58" textAnchor="middle" fontSize="20" fontWeight="800" fill="hsl(222 47% 11%)">{value} / {total}</text>
        <text x="70" y="74" textAnchor="middle" fontSize="12" fontWeight="700" fill="hsl(142 71% 35%)">{pctLabel}</text>
      </svg>
      <div className="flex justify-between w-full text-[10px] text-slate-500 px-1"><span>0%</span><span>100%</span></div>
    </div>
  );
}

export default function SiteConnectivity() {
  return (
    <DashShell
      title="SITE CONNECTIVITY"
      highlight="READINESS DASHBOARD"
      subtitle="Real-time visibility into site-by-site network readiness, connectivity build progress, and risks to ensure a successful Day 1 separation."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <Section title="Readiness by Region">
            <div className="flex items-center gap-3">
              <Donut data={readinessTotal} total="77" sub="Total Sites" />
              <div className="flex-1 relative aspect-[4/3]">
                <img src={worldMap} alt="map" className="absolute inset-0 w-full h-full object-cover opacity-80 rounded" />
                {regionMarkers.map((r) => (
                  <div key={r.name} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${r.x}%`, top: `${r.y}%` }}>
                    <div className="bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow text-[8px]">
                      <div className="font-semibold text-slate-700">{r.name}</div>
                      <div className="text-slate-600">{r.ratio}</div>
                      <div className="font-bold text-blue-700">{r.pct}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 space-y-1 text-[11px]">
              {readinessTotal.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="flex-1 text-slate-700">{d.name}</span>
                  <span className="font-semibold text-slate-900">{d.value}</span>
                  <span className="text-slate-500">({d.pct})</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="lg:col-span-5">
          <Section title="Site Readiness Overview (All Sites)">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 relative">
                <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="w-full text-xs border border-slate-200 rounded pl-7 pr-2 py-1.5" placeholder="Search sites..." />
              </div>
              <select className="text-xs border border-slate-200 rounded px-2 py-1.5"><option>All Regions</option></select>
              <select className="text-xs border border-slate-200 rounded px-2 py-1.5"><option>All Status</option></select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-1.5">Site Name</th>
                    <th className="text-left py-1.5">Location</th>
                    <th className="text-left py-1.5">Region</th>
                    <th className="text-left py-1.5">Overall Readiness</th>
                    <th className="text-left py-1.5">WAN Circuit</th>
                    <th className="text-left py-1.5">LAN Deployment</th>
                    <th className="text-left py-1.5">WiFi Deployment</th>
                    <th className="text-left py-1.5">Last-Mile Risk</th>
                    <th className="text-left py-1.5">Critical Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((s) => (
                    <tr key={s.name} className="border-b border-slate-100">
                      <td className="py-1.5 font-medium text-slate-800">{s.name}</td>
                      <td className="py-1.5 text-slate-600">{s.loc}</td>
                      <td className="py-1.5 text-slate-600">{s.region}</td>
                      <td className="py-1.5"><StatusPill status={s.overall} /></td>
                      <td className="py-1.5"><StatusPill status={s.wan} /></td>
                      <td className="py-1.5"><StatusPill status={s.lan} /></td>
                      <td className="py-1.5"><StatusPill status={s.wifi} /></td>
                      <td className="py-1.5"><StatusPill status={s.lm} /></td>
                      <td className={`py-1.5 font-semibold ${s.crit > 0 ? "text-red-600" : "text-slate-700"}`}>{s.crit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
              <span>Showing 1 to 10 of 77 sites</span>
              <div className="flex gap-1">
                {["‹","1","2","3","4","5","…","8","›"].map((p,i) => (
                  <span key={i} className={`px-2 py-0.5 rounded border ${p==="1" ? "bg-blue-50 border-blue-300 text-blue-700" : "border-slate-200"}`}>{p}</span>
                ))}
              </div>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <Section title="WAN Circuit Provisioning Status">
            <div className="flex items-center gap-3">
              <Donut data={wanStatus} total="" />
              <div className="flex-1 space-y-1 text-[11px]">
                {wanStatus.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    <span className="flex-1 text-slate-700">{d.name}</span>
                    <span className="font-semibold text-slate-900">{d.value}</span>
                    <span className="text-slate-500">({d.pct})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 text-center">63 of 77 sites have active WAN circuits</div>
          </Section>

          <Section title="Last-Mile Connectivity Risk">
            <div className="flex items-center gap-3">
              <Donut data={lastMileRisk} total="" />
              <div className="flex-1 space-y-1 text-[11px]">
                {lastMileRisk.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    <span className="flex-1 text-slate-700">{d.name}</span>
                    <span className="font-semibold text-slate-900">{d.value}</span>
                    <span className="text-slate-500">({d.pct})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 text-center">7 sites (9.1%) with last-mile connectivity risk</div>
          </Section>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <div className="lg:col-span-3">
          <Section title="LAN / WiFi Deployment Progress">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-[11px] font-semibold text-slate-700 mb-1">LAN Deployment</div>
                <Gauge value={58} total={77} pctLabel="75.3%" />
                <div className="text-[10px] text-slate-500 mt-1">Sites with LAN fully deployed</div>
              </div>
              <div className="text-center">
                <div className="text-[11px] font-semibold text-slate-700 mb-1">WiFi Deployment</div>
                <Gauge value={54} total={77} pctLabel="70.1%" />
                <div className="text-[10px] text-slate-500 mt-1">Sites with WiFi fully deployed</div>
              </div>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-5">
          <Section title="Top Last-Mile Risks">
            <table className="w-full text-[11px]">
              <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1.5">Site Name</th>
                  <th className="text-left py-1.5">Location</th>
                  <th className="text-left py-1.5">Risk Level</th>
                  <th className="text-left py-1.5">Risk Reason</th>
                  <th className="text-left py-1.5">Owner</th>
                  <th className="text-left py-1.5">Target Resolution</th>
                </tr>
              </thead>
              <tbody>
                {topRisks.map((r) => (
                  <tr key={r.site} className="border-b border-slate-100">
                    <td className="py-2 font-medium text-slate-800">{r.site}</td>
                    <td className="py-2 text-slate-600">{r.loc}</td>
                    <td className="py-2"><StatusPill status={r.risk} /></td>
                    <td className="py-2 text-slate-700">{r.reason}</td>
                    <td className="py-2 text-slate-700">{r.owner}</td>
                    <td className="py-2 text-slate-700">{r.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        <div className="lg:col-span-4">
          <Section title="Readiness Trend (Last 7 Days)">
            <div className="h-44">
              <ResponsiveContainer>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="v" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(217 91% 60%)" }} label={{ position: "top", fontSize: 10, fill: "hsl(217 91% 40%)", formatter: (v: number) => `${v}%` }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-slate-500 text-center">% Sites Ready</div>
          </Section>
        </div>
      </div>
    </DashShell>
  );
}
