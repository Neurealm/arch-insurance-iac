import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Server, Database, Activity, ShieldCheck, AlertTriangle, CheckCircle, Eye,
  Target, Zap, Clock, Network as NetIcon, HardDrive, Cpu, Box, Users,
  CalendarDays, ClipboardList,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
  LineChart, Line, Legend, CartesianGrid,
} from "recharts";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoEqualEarth } from "d3-geo";

const kpis: KPI[] = [
  { label: "Overall Separation Readiness", value: "82%", sub: "On Track", subColor: "text-emerald-600", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Environments Separated", value: "86 / 104", sub: "↑ 6.4% vs last 7 days", subColor: "text-emerald-600", icon: Box, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Critical Dependencies", value: "27", sub: "↓ 18 vs last 7 days", subColor: "text-emerald-600", icon: Database, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Blocking Issues", value: "14", sub: "↓ 5 vs last 7 days", subColor: "text-red-600", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Independent from BD", value: "Compute 81% | Storage 79%", sub: "Platform 83% | Network 84% | Identity 88%", subColor: "text-blue-600", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Day 1 Readiness Score", value: "A-", sub: "Good", subColor: "text-emerald-600", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Days to Day 1", value: "18", sub: "June 6, 2025", subColor: "text-blue-600", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
];

const layers = [
  { name: "Compute", value: 81, delta: "↑ 7%", icon: Cpu },
  { name: "Storage", value: 79, delta: "↑ 6%", icon: HardDrive },
  { name: "Platform / Virtualization", value: 83, delta: "↑ 5%", icon: Box },
  { name: "Network", value: 84, delta: "↑ 6%", icon: NetIcon },
  { name: "Identity & Access", value: 88, delta: "↑ 8%", icon: Users },
];

const progress = [
  { d: "Mar 16", overall: 50, compute: 42, storage: 35, platform: 45, network: 48, identity: 52 },
  { d: "Mar 23", overall: 55, compute: 48, storage: 40, platform: 50, network: 53, identity: 58 },
  { d: "Mar 30", overall: 60, compute: 52, storage: 45, platform: 56, network: 58, identity: 64 },
  { d: "Apr 6",  overall: 65, compute: 58, storage: 52, platform: 62, network: 64, identity: 70 },
  { d: "Apr 13", overall: 70, compute: 64, storage: 58, platform: 67, network: 70, identity: 75 },
  { d: "Apr 20", overall: 74, compute: 68, storage: 62, platform: 72, network: 75, identity: 80 },
  { d: "Apr 27", overall: 77, compute: 72, storage: 66, platform: 76, network: 78, identity: 83 },
  { d: "May 4",  overall: 80, compute: 76, storage: 70, platform: 80, network: 82, identity: 86 },
  { d: "May 11", overall: 82, compute: 81, storage: 79, platform: 83, network: 84, identity: 88 },
];

const envSummary = [
  { name: "Ready", value: 86, pct: "82.7%", color: "hsl(142 71% 45%)" },
  { name: "In Progress", value: 12, pct: "11.5%", color: "hsl(217 91% 60%)" },
  { name: "At Risk", value: 4, pct: "3.8%", color: "hsl(38 92% 50%)" },
  { name: "Blocked", value: 2, pct: "1.9%", color: "hsl(0 84% 60%)" },
  { name: "Not Started", value: 0, pct: "0 (0%)", color: "hsl(220 9% 70%)" },
];

const topEnvs = [
  { e: "PROD-APP1", t: "Production", r: "North America", read: "95%", st: "On Track", dep: 0, color: "emerald" },
  { e: "PROD-DB1", t: "Production", r: "Europe", read: "92%", st: "On Track", dep: 1, color: "emerald" },
  { e: "LAB-RD", t: "Non-Prod", r: "Asia", read: "78%", st: "In Progress", dep: 2, color: "amber" },
  { e: "PROD-APP2", t: "Production", r: "Asia", read: "65%", st: "At Risk", dep: 3, color: "amber" },
  { e: "DW-ANALYTICS", t: "Data Warehouse", r: "South America", read: "42%", st: "Blocked", dep: 4, color: "red" },
];

const critDeps = [
  { d: "BD Core Network Link", t: "Network", n: 9, st: "Blocked", o: "Network Ops" },
  { d: "BD Identity Trust", t: "Identity", n: 7, st: "At Risk", o: "IAM Team" },
  { d: "BD Storage Array Replication", t: "Storage", n: 6, st: "At Risk", o: "Storage Team" },
  { d: "BD DNS / Name Resolution", t: "Platform", n: 5, st: "At Risk", o: "Platform Team" },
  { d: "BD Backup Infrastructure", t: "Storage", n: 4, st: "At Risk", o: "Data Protection" },
];

const blocking = [
  { i: "Firewall rules still routed via BD hub", l: "Network", n: 6, sev: "High", st: "Open", age: "3 days" },
  { i: "Storage replication lag > 1 hour", l: "Storage", n: 4, sev: "High", st: "Open", age: "2 days" },
  { i: "Identity trust not fully cut over", l: "Identity", n: 7, sev: "High", st: "Open", age: "1 day" },
  { i: "VMware license dependency on BD", l: "Platform", n: 3, sev: "Medium", st: "In Progress", age: "5 days" },
];

const recentActivity = [
  { t: "Production environment PROD-APP1 fully independent from BD", time: "May 12, 2025 09:14 AM", tone: "ok" },
  { t: "Storage replication for DW-ANALYTICS completed", time: "May 11, 2025 04:32 PM", tone: "ok" },
  { t: "Identity trust cutover validation for 7 environments in progress", time: "May 11, 2025 11:08 AM", tone: "info" },
  { t: "Blocking: Firewall rules still dependent on BD core network", time: "May 10, 2025 02:45 PM", tone: "warn" },
  { t: "Network link migration completed for 12 sites", time: "May 09, 2025 10:21 AM", tone: "ok" },
];

const wwh = {
  what: [
    "The Infrastructure Separation Command Center – the single control plane showing whether compute, storage, and platform layers are fully independent from BD on Day 1.",
  ],
  why: [
    "Infrastructure is deeply coupled today. If this layer is not separated correctly, applications, data, and users cannot operate independently.",
  ],
  how: [
    "Real-time tracking of infrastructure separation progress",
    "Dependency mapping across compute, storage, identity, and network",
    "Readiness scoring by environment and region",
    "Proactive identification of blocking dependencies",
  ],
};

const outcomes: Outcome[] = [
  { icon: CalendarDays, color: "text-blue-600", title: "DAY 1 GOAL", l1: "100% Independent Infrastructure" },
  { icon: Cpu, color: "text-emerald-600", title: "COMPUTE", l1: "100%" },
  { icon: HardDrive, color: "text-emerald-600", title: "STORAGE", l1: "100%" },
  { icon: Box, color: "text-emerald-600", title: "PLATFORM", l1: "100%" },
  { icon: NetIcon, color: "text-emerald-600", title: "NETWORK", l1: "100%" },
  { icon: Users, color: "text-emerald-600", title: "IDENTITY", l1: "100%" },
  { icon: Clock, color: "text-blue-600", title: "COUNTDOWN TO DAY 1", l1: "18 Days" },
];

function readinessFill(v: number) {
  if (v >= 80) return "hsl(142 71% 45%)";
  if (v >= 60) return "hsl(38 92% 50%)";
  if (v >= 40) return "hsl(25 95% 53%)";
  return "hsl(0 84% 60%)";
}

function StatusBadge({ s }: { s: string }) {
  const t = s.toLowerCase();
  const cls = /on track|ready|completed|complete|resolved/.test(t)
    ? "text-emerald-700"
    : /in progress|in-progress/.test(t)
    ? "text-amber-700"
    : /blocked|critical/.test(t)
    ? "text-red-700"
    : /at risk/.test(t)
    ? "text-amber-700"
    : "text-slate-700";
  return <span className={`font-semibold ${cls}`}>{s}</span>;
}

function SevBadge({ v }: { v: string }) {
  const t = v.toLowerCase();
  const cls = t === "high" ? "text-red-600" : t === "medium" ? "text-amber-600" : "text-slate-600";
  return <span className={`font-bold ${cls}`}>{v}</span>;
}

/** Tidy world map using real geography + readiness bubbles per region. */
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Region color by readiness band
const REGION_FILL: Record<string, string> = {
  "North America": "#22c55e", // 88% — green
  "South America": "#fde047", // 76% — yellow
  "Europe": "#22c55e",        // 86% — green
  "Africa": "#fde047",         // 70% — yellow
  "Asia": "#fb923c",           // 79% — orange
  "Oceania": "#22c55e",        // 90% — green
  "Antarctica": "#e5e7eb",
};

const SOUTH_AMERICA = new Set(["Argentina","Bolivia","Brazil","Chile","Colombia","Ecuador","Guyana","Paraguay","Peru","Suriname","Uruguay","Venezuela","Falkland Is.","Fr. S. Antarctic Lands"]);
const NORTH_AMERICA = new Set(["United States of America","Canada","Mexico","Greenland","Cuba","Haiti","Dominican Rep.","Jamaica","Puerto Rico","Bahamas","Panama","Costa Rica","Nicaragua","Honduras","El Salvador","Guatemala","Belize","Trinidad and Tobago"]);
const EUROPE = new Set(["Russia","Ukraine","France","Spain","Sweden","Germany","Finland","Norway","Poland","Italy","United Kingdom","Romania","Belarus","Greece","Bulgaria","Iceland","Hungary","Portugal","Austria","Czechia","Serbia","Ireland","Lithuania","Latvia","Croatia","Bosnia and Herz.","Slovakia","Estonia","Denmark","Switzerland","Netherlands","Moldova","Belgium","Albania","Macedonia","Turkey","Slovenia","Montenegro","Kosovo","Cyprus","Luxembourg","Andorra","Malta","Liechtenstein","San Marino","Monaco","Vatican","N. Cyprus"]);
const AFRICA = new Set(["Algeria","Dem. Rep. Congo","Sudan","Libya","Chad","Niger","Angola","Mali","South Africa","Ethiopia","Mauritania","Egypt","Tanzania","Nigeria","Namibia","Mozambique","Zambia","Somalia","Central African Rep.","Madagascar","Botswana","Kenya","Cameroon","Zimbabwe","Congo","Morocco","Côte d'Ivoire","Burkina Faso","Gabon","Guinea","Ghana","Uganda","Senegal","Tunisia","Malawi","Eritrea","Benin","Liberia","Sierra Leone","Togo","S. Sudan","Burundi","Rwanda","Djibouti","eSwatini","Lesotho","Equatorial Guinea","Gambia","Guinea-Bissau","Comoros","Cape Verde","São Tomé and Principe","Mauritius","Seychelles","W. Sahara","Somaliland"]);
const OCEANIA = new Set(["Australia","Papua New Guinea","New Zealand","Solomon Is.","Fiji","Vanuatu","New Caledonia","Samoa","Kiribati","Tonga","Micronesia","Palau","Marshall Is.","Nauru","Tuvalu"]);
const ANTARCTICA = new Set(["Antarctica"]);

function regionForCountry(name: string): keyof typeof REGION_FILL {
  if (NORTH_AMERICA.has(name)) return "North America";
  if (SOUTH_AMERICA.has(name)) return "South America";
  if (EUROPE.has(name)) return "Europe";
  if (AFRICA.has(name)) return "Africa";
  if (OCEANIA.has(name)) return "Oceania";
  if (ANTARCTICA.has(name)) return "Antarctica";
  return "Asia";
}

function WorldReadinessMap() {
  const bubbles = [
    { coords: [-100, 45] as [number, number], v: "88%", color: "#15803d" },
    { coords: [-60, -15] as [number, number], v: "76%", color: "#ca8a04" },
    { coords: [15, 50] as [number, number], v: "86%", color: "#15803d" },
    { coords: [20, 5] as [number, number], v: "70%", color: "#ca8a04" },
    { coords: [95, 35] as [number, number], v: "79%", color: "#ea580c" },
    { coords: [145, -25] as [number, number], v: "90%", color: "#15803d" },
  ];

  const W = 800, H = 380;
  const projection = geoEqualEarth().scale(155).translate([W / 2, H / 2]);

  return (
    <div className="w-full">
      <div className="relative rounded-lg bg-slate-50 border border-slate-200 overflow-hidden">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 155 }}
          width={800}
          height={380}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.name || geo.properties.NAME || "";
                const region = regionForCountry(name);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={REGION_FILL[region] || "#e5e7eb"}
                    stroke="#ffffff"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", opacity: 0.85 },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Readiness bubbles overlay using percentage-based positions */}
        <div className="absolute inset-0 pointer-events-none">
          {bubbles.map((b, i) => {
            const p = projection(b.coords);
            if (!p) return null;
            const [px, py] = p;
            const left = (px / W) * 100;
            const top = (py / H) * 100;
            return (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full text-white font-bold shadow-md"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: 44,
                  height: 44,
                  background: b.color,
                  border: "3px solid white",
                  fontSize: 12,
                }}
              >
                {b.v}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px]">
        <Legend2 c="#15803d" l="80% and above" />
        <Legend2 c="#22c55e" l="60% – 79%" />
        <Legend2 c="#fde047" l="40% – 59%" />
        <Legend2 c="#fb923c" l="Below 40%" />
        <Legend2 c="#cbd5e1" l="Not Started" />
      </div>
    </div>
  );
}
function Legend2({ c, l }: { c: string; l: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
      <span className="text-slate-600">{l}</span>
    </div>
  );
}

export default function InfraSeparationCommand() {
  return (
    <DashShell
      title="INFRASTRUCTURE SEPARATION COMMAND CENTER (DAY 1 VIEW)"
      subtitle="Real-time control plane for infrastructure independence from BD across compute, storage, platform, network, and identity."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Section title="Separation Readiness by Region" className="lg:col-span-4">
          <WorldReadinessMap />
        </Section>

        <Section title="Readiness by Infrastructure Layer (Global)" className="lg:col-span-4">
          <div className="space-y-3">
            {layers.map((l) => {
              const Icon = l.icon;
              return (
                <div key={l.name}>
                  <div className="flex items-center gap-2 text-[12px]">
                    <Icon className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-700 flex-1">{l.name}</span>
                    <span className="font-bold text-slate-900">{l.value}%</span>
                    <span className="text-emerald-600 font-semibold w-10 text-right">{l.delta}</span>
                  </div>
                  <div className="h-2 mt-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${l.value}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="text-[10px] text-slate-500 text-right pt-1">vs last 7 days</div>
          </div>
        </Section>

        <Section title="Separation Progress Over Time" className="lg:col-span-4">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 9 }} iconSize={8} />
                <Line type="monotone" dataKey="overall" name="Overall Readiness" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="compute" name="Compute" stroke="hsl(142 71% 45%)" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="storage" name="Storage" stroke="hsl(38 92% 50%)" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="platform" name="Platform" stroke="hsl(262 83% 58%)" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="network" name="Network" stroke="hsl(180 70% 45%)" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="identity" name="Identity" stroke="hsl(330 75% 55%)" strokeWidth={1.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Environment Readiness Summary" className="lg:col-span-3">
          <div className="h-40 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={envSummary} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={2}>
                  {envSummary.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="text-xl font-extrabold text-slate-900">104</div>
                <div className="text-[9px] text-slate-500">Total Environments</div>
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-1 text-[11px]">
            {envSummary.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                <span className="text-slate-700">{d.name}</span>
                <span className="ml-auto font-semibold text-slate-900">{d.value} ({d.pct})</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold text-center mt-2">86 environments on track for Day 1</div>
        </Section>

        <Section title="Top Environments by Readiness" className="lg:col-span-5">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5 px-1">Environment</th>
                <th className="text-left py-1.5 px-1">Type</th>
                <th className="text-left py-1.5 px-1">Region</th>
                <th className="text-left py-1.5 px-1">Readiness</th>
                <th className="text-left py-1.5 px-1">Status</th>
                <th className="text-left py-1.5 px-1">Critical Deps</th>
                <th className="text-left py-1.5 px-1">Trend (7D)</th>
              </tr>
            </thead>
            <tbody>
              {topEnvs.map((e) => (
                <tr key={e.e} className="border-b border-slate-100">
                  <td className="py-1.5 px-1 font-semibold text-slate-900">{e.e}</td>
                  <td className="py-1.5 px-1 text-slate-700">{e.t}</td>
                  <td className="py-1.5 px-1 text-slate-700">{e.r}</td>
                  <td className="py-1.5 px-1 font-bold text-slate-900">{e.read}</td>
                  <td className="py-1.5 px-1"><StatusBadge s={e.st} /></td>
                  <td className="py-1.5 px-1 text-slate-700">{e.dep}</td>
                  <td className="py-1.5 px-1">
                    <svg width="60" height="14" viewBox="0 0 60 14">
                      <polyline
                        fill="none"
                        stroke={e.color === "emerald" ? "#16a34a" : e.color === "amber" ? "#ca8a04" : "#dc2626"}
                        strokeWidth="1.5"
                        points="0,8 10,6 20,9 30,5 40,7 50,4 60,6"
                      />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="block text-[11px] text-blue-600 mt-2 cursor-pointer">View all environments →</a>
        </Section>

        <Section title="Critical Dependencies (Top 5)" className="lg:col-span-4">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5 px-1">Dependency</th>
                <th className="text-left py-1.5 px-1">Type</th>
                <th className="text-left py-1.5 px-1">Impacted</th>
                <th className="text-left py-1.5 px-1">Status</th>
                <th className="text-left py-1.5 px-1">Owner</th>
              </tr>
            </thead>
            <tbody>
              {critDeps.map((d) => (
                <tr key={d.d} className="border-b border-slate-100">
                  <td className="py-1.5 px-1 font-semibold text-slate-900">{d.d}</td>
                  <td className="py-1.5 px-1 text-slate-700">{d.t}</td>
                  <td className="py-1.5 px-1 text-slate-700">{d.n}</td>
                  <td className="py-1.5 px-1"><StatusBadge s={d.st} /></td>
                  <td className="py-1.5 px-1 text-slate-700">{d.o}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="block text-[11px] text-blue-600 mt-2 cursor-pointer">View all dependencies →</a>
        </Section>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Blocking Issues Requiring Attention" className="lg:col-span-4">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5 px-1">Issue</th>
                <th className="text-left py-1.5 px-1">Layer</th>
                <th className="text-left py-1.5 px-1">Envs</th>
                <th className="text-left py-1.5 px-1">Sev</th>
                <th className="text-left py-1.5 px-1">Status</th>
                <th className="text-left py-1.5 px-1">Age</th>
              </tr>
            </thead>
            <tbody>
              {blocking.map((b) => (
                <tr key={b.i} className="border-b border-slate-100">
                  <td className="py-1.5 px-1 font-medium text-slate-900">{b.i}</td>
                  <td className="py-1.5 px-1 text-slate-700">{b.l}</td>
                  <td className="py-1.5 px-1 text-slate-700">{b.n}</td>
                  <td className="py-1.5 px-1"><SevBadge v={b.sev} /></td>
                  <td className="py-1.5 px-1"><StatusBadge s={b.st} /></td>
                  <td className="py-1.5 px-1 text-slate-700">{b.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="block text-[11px] text-blue-600 mt-2 cursor-pointer">View all issues →</a>
        </Section>

        <Section title="Dependency Heatmap (Impact vs Risk)" className="lg:col-span-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center justify-around text-[10px] font-semibold text-slate-600 py-2">
              <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Impact</span>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-1">
                {[
                  { v: "", bg: "bg-emerald-200" }, { v: "2", bg: "bg-amber-300" }, { v: "4", bg: "bg-red-500 text-white" },
                  { v: "", bg: "bg-emerald-200" }, { v: "3", bg: "bg-amber-200" }, { v: "", bg: "bg-orange-400" },
                  { v: "6", bg: "bg-emerald-400" }, { v: "12", bg: "bg-yellow-300" }, { v: "0", bg: "bg-orange-300" },
                ].map((c, i) => (
                  <div key={i} className={`${c.bg} h-12 rounded grid place-items-center font-bold text-sm`}>{c.v}</div>
                ))}
              </div>
              <div className="grid grid-cols-3 text-[10px] text-slate-500 text-center mt-1 font-semibold">
                <span>Low</span><span>Medium</span><span>High</span>
              </div>
              <div className="text-[10px] text-slate-500 text-center mt-1">Risk</div>
            </div>
            <div className="space-y-1.5 text-[10px] w-32">
              <Legend2 c="#dc2626" l="High Risk / High Impact (4)" />
              <Legend2 c="#fb923c" l="High Risk / Med Impact (2)" />
              <Legend2 c="#fde047" l="Med Risk / Med Impact (3)" />
              <Legend2 c="#fbbf24" l="Low Risk / Med Impact (12)" />
              <Legend2 c="#86efac" l="Low Risk / Low Impact (6)" />
              <div className="pt-1 text-slate-700 font-semibold">Total Dependencies: 27</div>
            </div>
          </div>
        </Section>

        <Section title="Recent Activity (Last 7 Days)" className="lg:col-span-4">
          <ul className="space-y-2">
            {recentActivity.map((a, i) => {
              const tone = a.tone === "ok" ? "text-emerald-600" : a.tone === "warn" ? "text-amber-600" : "text-blue-600";
              const Icon = a.tone === "ok" ? CheckCircle : a.tone === "warn" ? AlertTriangle : ClipboardList;
              return (
                <li key={i} className="flex items-start gap-2 text-[11px]">
                  <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${tone}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-800">{a.t}</div>
                    <div className="text-[10px] text-slate-500">{a.time}</div>
                  </div>
                </li>
              );
            })}
          </ul>
          <a className="block text-[11px] text-blue-600 mt-2 cursor-pointer">View all activity →</a>
        </Section>
      </div>
    </DashShell>
  );
}
