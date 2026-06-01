import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Globe, CheckCircle2, Clock, AlertTriangle, Network, ShieldCheck,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import worldMap from "@/assets/world-regions-map.png";

const kpis: KPI[] = [
  { label: "Overall Migration Progress", value: "71%", sub: "↑ 12% vs last week", subColor: "text-emerald-600", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Sites Migrated (Independent)", value: "55", sub: "↑ 9 vs last week", subColor: "text-emerald-600", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Sites In Progress", value: "14", sub: "↑ 2 vs last week", subColor: "text-amber-600", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "TSA-Bound / Dependent", value: "8", sub: "↓ 1 vs last week", subColor: "text-red-600", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Critical Dependencies", value: "23", sub: "↑ 4 vs last week", subColor: "text-red-600", icon: Network, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Network Readiness Score", value: "73 / 100", sub: "↑ 8 pts vs last week", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
];

const regions = [
  { name: "North America", pct: 78, x: 18, y: 35, ratio: "34/44" },
  { name: "Europe", pct: 65, x: 45, y: 30, ratio: "11/17" },
  { name: "Asia Pacific", pct: 68, x: 72, y: 40, ratio: "13/19" },
  { name: "Latin America", pct: 70, x: 28, y: 65, ratio: "7/10" },
  { name: "Middle East & Africa", pct: 60, x: 52, y: 55, ratio: "3/5" },
];

const ringColor = (pct: number) => {
  if (pct >= 80) return "hsl(142 71% 45%)";
  if (pct >= 60) return "hsl(217 91% 60%)";
  if (pct >= 40) return "hsl(38 92% 50%)";
  return "hsl(0 84% 60%)";
};

const statusOverview = [
  { name: "Migrated (Independent)", value: 55, pct: "71%", color: "hsl(142 71% 45%)" },
  { name: "In Progress", value: 14, pct: "18%", color: "hsl(38 92% 50%)" },
  { name: "TSA-Bound / Dependent", value: 8, pct: "10%", color: "hsl(0 84% 60%)" },
  { name: "Not Started", value: 0, pct: "0%", color: "hsl(220 9% 75%)" },
];

const readinessByRegion = [
  { region: "North America", score: "78 / 100", trend: "↑ 10", status: "On Track" },
  { region: "Europe", score: "70 / 100", trend: "↑ 7", status: "On Track" },
  { region: "Asia Pacific", score: "69 / 100", trend: "↑ 6", status: "On Track" },
  { region: "Latin America", score: "72 / 100", trend: "↑ 8", status: "On Track" },
  { region: "Middle East & Africa", score: "55 / 100", trend: "↑ 5", status: "At Risk" },
  { region: "Global", score: "73 / 100", trend: "↑ 8", status: "On Track", bold: true },
];

const dependencies = [
  { area: "WAN Connectivity", status: "At Risk", impacted: 9, risk: "High", notes: "3 circuits delayed" },
  { area: "DNS Services", status: "At Risk", impacted: 6, risk: "High", notes: "BD DNS cutover pending" },
  { area: "Identity & Access", status: "In Progress", impacted: 7, risk: "Medium", notes: "AD trust cutover in progress" },
  { area: "Security / Firewalls", status: "In Progress", impacted: 5, risk: "Medium", notes: "Policy migration ongoing" },
  { area: "IP Addressing", status: "On Track", impacted: 2, risk: "Low", notes: "IPAM consolidation" },
];

const atRiskSites = [
  { site: "Frankfurt-01", region: "Europe", reason: "WAN circuit delay", target: "Feb 18, 2026" },
  { site: "Sao Paulo-02", region: "Latin America", reason: "DNS dependency", target: "Feb 20, 2026" },
  { site: "Johannesburg-01", region: "MEA", reason: "Identity cutover", target: "Feb 21, 2026" },
  { site: "Singapore-03", region: "Asia Pacific", reason: "Firewall migration", target: "Feb 19, 2026" },
  { site: "Mexico City-01", region: "Latin America", reason: "Provider issue", target: "Feb 22, 2026" },
];

const milestones = [
  { name: "Complete WAN Cutover - Wave 3", date: "Feb 16, 2026", impacted: 11, status: "In Progress" },
  { name: "DNS Independence - All Regions", date: "Feb 20, 2026", impacted: 6, status: "In Progress" },
  { name: "Identity Independence - Wave 2", date: "Feb 22, 2026", impacted: 9, status: "In Progress" },
  { name: "Security Policy Enforcement", date: "Feb 25, 2026", impacted: 15, status: "On Track" },
  { name: "Final TSA Exit - 100% Independence", date: "Mar 01, 2026", impacted: 77, status: "Planned" },
];

const wwh = {
  what: [
    "Percent of global sites migrated off BD network",
    "Active vs dependent (TSA-bound) sites",
    "Critical path dependencies: WAN, DNS, Identity",
    "Network readiness score by region and globally",
  ],
  why: [
    "Network is the backbone of separation",
    "Delays or dependencies in network cutover block all other workstreams",
    "Enables leadership to take action early on risks and dependencies",
    "Ensures on-time Day 1 readiness for every site",
  ],
  how: [
    "Real-time data from network monitoring, inventory, and project systems",
    "Dependency mapping across WAN, DNS, Identity, and Security",
    "Readiness scoring model based on people, process, technology, testing",
    "Automated risk detection with proactive escalation and dashboards",
  ],
};

const outcomes: Outcome[] = [];

function RingPct({ pct, color }: { pct: number; color: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r={r} stroke="hsl(220 13% 91%)" strokeWidth="6" fill="white" />
      <circle
        cx="30" cy="30" r={r}
        stroke={color} strokeWidth="6" fill="none"
        strokeDasharray={c} strokeDashoffset={off}
        strokeLinecap="round"
        transform="rotate(-90 30 30)"
      />
      <text x="30" y="34" textAnchor="middle" fontSize="13" fontWeight="700" fill="hsl(222 47% 11%)">
        {pct}%
      </text>
    </svg>
  );
}

export default function NetworkSeparationCommand() {
  return (
    <DashShell
      title="GLOBAL NETWORK"
      highlight="SEPARATION COMMAND CENTER (DAY 1 VIEW)"
      subtitle="Executive visibility into network separation readiness and progress toward full independence from BD network."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Map + Site Status + Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Migration Progress by Region">
          <div className="relative w-full aspect-[16/9]">
            <img src={worldMap} alt="World regions" className="absolute inset-0 w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0">
              {regions.map((r) => (
                <div
                  key={r.name}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: `${r.x}%`, top: `${r.y}%` }}
                >
                  <RingPct pct={r.pct} color={ringColor(r.pct)} />
                  <div className="text-[9px] font-semibold text-slate-700 mt-0.5">{r.ratio}</div>
                  <div className="text-[9px] text-slate-600">{r.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-slate-600 justify-center">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> ≥ 80%</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> 60% – 79%</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> 40% – 59%</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> &lt; 40%</span>
          </div>
        </Section>

        <Section title="Site Status Overview">
          <div className="flex items-center gap-3">
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusOverview} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                    {statusOverview.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-slate-900">77</div>
                  <div className="text-[10px] text-slate-500">Total Sites</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2 text-[11px]">
              {statusOverview.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-700 flex-1 truncate">{d.name}</span>
                  <span className="font-semibold text-slate-900">{d.value}</span>
                  <span className="text-slate-500">({d.pct})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-emerald-800">On track for Day 1 readiness</div>
              <div className="text-[11px] text-emerald-700">55 of 77 sites will be independent on Day 1.</div>
            </div>
          </div>
        </Section>

        <Section title="Network Readiness Score by Region">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Region</th>
                <th className="text-left py-1.5">Readiness Score</th>
                <th className="text-left py-1.5">Trend</th>
                <th className="text-left py-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {readinessByRegion.map((r) => (
                <tr key={r.region} className={`border-b border-slate-100 ${r.bold ? "bg-blue-50/50 font-semibold" : ""}`}>
                  <td className="py-2 text-slate-800">{r.region}</td>
                  <td className="py-2 text-slate-700">{r.score}</td>
                  <td className="py-2 text-emerald-600 font-semibold">{r.trend}</td>
                  <td className="py-2"><StatusPill status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>

      {/* Row 2: Dependencies + At Risk + Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Section title="Critical Path Dependencies">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Dependency Area</th>
                <th className="text-left py-1.5">Status</th>
                <th className="text-left py-1.5">Impacted</th>
                <th className="text-left py-1.5">Risk</th>
                <th className="text-left py-1.5">Notes</th>
              </tr>
            </thead>
            <tbody>
              {dependencies.map((d) => (
                <tr key={d.area} className="border-b border-slate-100">
                  <td className="py-2 font-medium text-slate-800">{d.area}</td>
                  <td className="py-2"><StatusPill status={d.status} /></td>
                  <td className="py-2 text-slate-700">{d.impacted}</td>
                  <td className="py-2"><StatusPill status={d.risk} /></td>
                  <td className="py-2 text-[11px] text-slate-600">{d.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-xs text-blue-600 font-medium mt-2 inline-block cursor-pointer">View all dependencies →</a>
        </Section>

        <Section title="Top At-Risk Sites">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Site</th>
                <th className="text-left py-1.5">Region</th>
                <th className="text-left py-1.5">Risk Reason</th>
                <th className="text-left py-1.5">Target Resolution</th>
              </tr>
            </thead>
            <tbody>
              {atRiskSites.map((s) => (
                <tr key={s.site} className="border-b border-slate-100">
                  <td className="py-2 font-medium text-slate-800">{s.site}</td>
                  <td className="py-2 text-slate-700">{s.region}</td>
                  <td className="py-2 text-slate-700">{s.reason}</td>
                  <td className="py-2 text-red-600 font-semibold">{s.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-xs text-blue-600 font-medium mt-2 inline-block cursor-pointer">View all at-risk sites →</a>
        </Section>

        <Section title="Upcoming Milestones (Next 14 Days)">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Milestone</th>
                <th className="text-left py-1.5">Target Date</th>
                <th className="text-left py-1.5">Sites Impacted</th>
                <th className="text-left py-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((m) => (
                <tr key={m.name} className="border-b border-slate-100">
                  <td className="py-2 font-medium text-slate-800">{m.name}</td>
                  <td className="py-2 text-slate-700">{m.date}</td>
                  <td className="py-2 text-slate-700">{m.impacted}</td>
                  <td className="py-2"><StatusPill status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-xs text-blue-600 font-medium mt-2 inline-block cursor-pointer">View full roadmap →</a>
        </Section>
      </div>

      {/* Bottom line */}
      <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="text-sm">
          <span className="font-bold text-blue-700">Bottom Line: </span>
          <span className="text-slate-700">71% of sites are now independent from BD network. 55 sites ready for Day 1. Focus areas: WAN, DNS, and Identity dependencies.</span>
        </div>
      </div>
    </DashShell>
  );
}
