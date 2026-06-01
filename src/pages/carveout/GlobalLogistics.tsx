import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Globe, Laptop, CheckCircle, Package, Clock, UserCog, Handshake, Truck,
  ShieldCheck, Wrench, MessageSquare,
  ClipboardList, Building2, Settings, FileCheck,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import worldRegionsMap from "@/assets/world-regions-map.png";
import worldCoverageMap from "@/assets/world-coverage-heatmap.png";

const kpis: KPI[] = [
  { label: "Total Sites", value: "77+", sub: "Global Sites", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Devices in Transit", value: "5,240", sub: "18% of total", subColor: "text-blue-600", icon: Laptop, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Delivered to Site", value: "12,860", sub: "44% of total", subColor: "text-emerald-600", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Deployed / Installed", value: "9,120", sub: "31% of total", subColor: "text-amber-600", icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Pending Installation", value: "2,380", sub: "7% of total", subColor: "text-violet-600", icon: Clock, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Field Technicians", value: "312", sub: "Active Today", icon: UserCog, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Partner Technicians", value: "186", sub: "Active Today", icon: Handshake, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "On-Time Delivery", value: "96.3%", sub: "This Month", subColor: "text-emerald-600", icon: Truck, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const regions = [
  { c: "hsl(217 91% 60%)", r: "North America", t: "1,250", d: "3,450", dp: "2,890", otd: "97.1%" },
  { c: "hsl(142 71% 45%)", r: "Europe", t: "1,180", d: "3,210", dp: "2,380", otd: "95.6%" },
  { c: "hsl(262 83% 58%)", r: "Asia Pacific", t: "1,620", d: "2,980", dp: "2,150", otd: "95.0%" },
  { c: "hsl(25 95% 53%)", r: "Latin America", t: "540", d: "1,240", dp: "950", otd: "94.8%" },
  { c: "hsl(173 80% 40%)", r: "Middle East & Africa", t: "650", d: "1,980", dp: "1,750", otd: "97.9%" },
];

const readiness = [
  { name: "Ready", value: 48, pct: "62%", color: "hsl(142 71% 45%)" },
  { name: "In Progress", value: 18, pct: "23%", color: "hsl(38 92% 50%)" },
  { name: "Not Ready", value: 7, pct: "9%", color: "hsl(0 84% 60%)" },
  { name: "On Hold", value: 4, pct: "5%", color: "hsl(215 20% 65%)" },
  { name: "Completed", value: 0, pct: "-", color: "hsl(215 16% 47%)" },
];

const siteTypes = [
  { t: "Global Corporate Offices", n: 18, p: 78 },
  { t: "R&D / Labs", n: 22, p: 64 },
  { t: "Manufacturing / Plants", n: 15, p: 67 },
  { t: "Distribution Centers", n: 12, p: 58 },
  { t: "Field / Remote Sites", n: 10, p: 50 },
];

const dispatchModel = [
  { name: "Feet on the Street (Waters)", value: 72, count: 224, color: "hsl(217 91% 60%)" },
  { name: "Partner Dispatch", value: 28, count: 88, color: "hsl(262 83% 58%)" },
];

const topSites = [
  { s: "Waters HQ", l: "Milford, MA, USA", o: 12 },
  { s: "R&D Center", l: "Manchester, UK", o: 9 },
  { s: "Manufacturing Plant", l: "Singapore", o: 8 },
  { s: "Distribution Center", l: "Frankfurt, Germany", o: 7 },
  { s: "Regional Office", l: "São Paulo, Brazil", o: 6 },
];

const exec = [
  { l: "On-Time Delivery", v: "96.3%", t: "≥ 95%", icon: Truck, c: "text-emerald-600", bg: "bg-emerald-50" },
  { l: "First-Time Install Success", v: "94.7%", t: "≥ 92%", icon: Wrench, c: "text-blue-600", bg: "bg-blue-50" },
  { l: "Avg. Resolution Time", v: "4.2 hrs", t: "≤ 6 hrs", icon: Clock, c: "text-amber-600", bg: "bg-amber-50" },
  { l: "Technician Satisfaction", v: "4.6 / 5", t: "≥ 4.3", icon: MessageSquare, c: "text-violet-600", bg: "bg-violet-50" },
];

const flow = [
  { n: 1, icon: Package, c: "text-blue-600", bg: "bg-blue-100", t: "Order & Plan", s: "Devices ordered and logistics planned" },
  { n: 2, icon: Truck, c: "text-emerald-600", bg: "bg-emerald-100", t: "Ship & Track", s: "Real-time shipment tracking by region" },
  { n: 3, icon: Building2, c: "text-violet-600", bg: "bg-violet-100", t: "Deliver to Site", s: "Devices delivered and received at site" },
  { n: 4, icon: UserCog, c: "text-amber-600", bg: "bg-amber-100", t: "Dispatch Technician", s: "Smart dispatch based on skills and location" },
  { n: 5, icon: Settings, c: "text-blue-600", bg: "bg-blue-100", t: "Install & Configure", s: "On-site installation and configuration" },
  { n: 6, icon: FileCheck, c: "text-emerald-600", bg: "bg-emerald-100", t: "Close & Report", s: "Work order closed and results captured" },
];

const outcomes: Outcome[] = [];

export default function GlobalLogistics() {
  return (
    <DashShell
      title="GLOBAL LOGISTICS & FIELD SERVICES ORCHESTRATION"
      subtitle="End-to-end physical execution for devices and on-site services across 77+ global sites."
      wwh={{
        what: [
          "Device shipment tracking and delivery status by region",
          "Field technician dispatch and on-site task execution",
          "Site readiness for 77+ global sites (type model)",
          "Feet on the Street (Waters) vs Partner Dispatch coverage",
          "End-to-end logistics and field services performance",
        ],
        why: [
          "Physical execution is critical for a successful Day 1",
          "Ensures devices arrive on time and are installed correctly",
          "Visibility into global site readiness and technician availability",
          "Ensures consistent experience across all locations",
          "Reduces delays, rework, and user disruptions",
        ],
        how: [
          "Integrated logistics platform with real-time shipment tracking",
          "Intelligent dispatch engine for field technicians & partners",
          "Site readiness assessment and pre-deployment validation",
          "Waters \"Feet on the Street\" model augmented with trusted partners",
          "Real-time collaboration, escalation, and performance monitoring",
        ],
      }}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Shipment by Region (map+table) | Site Readiness Donut | Site Readiness by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Device Shipment Tracking by Region">
          <img
            src={worldRegionsMap}
            alt="World map showing device shipments by region"
            loading="lazy"
            width={1024}
            height={576}
            className="w-full h-32 object-contain mb-2"
          />
          <table className="w-full text-xs">
            <thead className="text-[10px] text-slate-500 uppercase">
              <tr className="border-b border-slate-100">
                <th className="text-left py-1.5">Region</th>
                <th className="text-right">In Transit</th>
                <th className="text-right">Delivered</th>
                <th className="text-right">Deployed</th>
                <th className="text-right">OTD %</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((r) => (
                <tr key={r.r} className="border-b border-slate-50">
                  <td className="py-1.5 font-semibold flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.c }} />
                    {r.r}
                  </td>
                  <td className="text-right">{r.t}</td>
                  <td className="text-right">{r.d}</td>
                  <td className="text-right">{r.dp}</td>
                  <td className="text-right font-bold text-emerald-600">{r.otd}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-1.5">Total</td>
                <td className="text-right">5,240</td>
                <td className="text-right">12,860</td>
                <td className="text-right">9,120</td>
                <td className="text-right text-emerald-600">96.3%</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="Site Readiness Overview (77+ Sites)">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
              <PieChart width={160} height={160}>
                <Pie data={readiness} dataKey="value" cx={80} cy={80} innerRadius={50} outerRadius={75} paddingAngle={2}>
                  {readiness.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-xl font-bold">77+</div>
                  <div className="text-[10px] text-slate-500">Total Sites</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 text-xs">
              {readiness.map((r) => (
                <div key={r.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                  <span className="flex-1 text-slate-700">{r.name}</span>
                  <span className="font-bold">{r.value || "-"} {r.value ? `(${r.pct})` : ""}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Site Readiness by Site Type">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-slate-500 uppercase">
              <tr className="border-b border-slate-100">
                <th className="text-left py-1.5">Site Type</th>
                <th className="text-right">Total Sites</th>
                <th className="text-right pl-2">Ready %</th>
              </tr>
            </thead>
            <tbody>
              {siteTypes.map((s) => (
                <tr key={s.t} className="border-b border-slate-50">
                  <td className="py-1.5 font-semibold">{s.t}</td>
                  <td className="text-right">{s.n}</td>
                  <td className="pl-2">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${s.p}%` }} />
                      </div>
                      <span className="font-bold w-8 text-right">{s.p}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-1.5">Total</td>
                <td className="text-right">77+</td>
                <td className="text-right pl-2 text-emerald-600">62%</td>
              </tr>
            </tbody>
          </table>
        </Section>
      </div>

      {/* Row 2: Dispatch | Coverage Heatmap | Top Sites | Execution Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Section title="Field Technician Dispatch">
          <div className="grid grid-cols-4 gap-1 text-center text-xs mb-3">
            <div>
              <div className="text-[9px] text-slate-500">Today's Dispatches</div>
              <div className="text-base font-bold">128</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500">In Progress</div>
              <div className="text-base font-bold text-blue-600">96</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500">Completed</div>
              <div className="text-base font-bold text-emerald-600">78</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500">Pending</div>
              <div className="text-base font-bold text-amber-600">32</div>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-700 mb-2">Dispatch by Coverage Model</div>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0" style={{ width: 110, height: 110 }}>
              <PieChart width={110} height={110}>
                <Pie data={dispatchModel} dataKey="value" cx={55} cy={55} innerRadius={32} outerRadius={52}>
                  {dispatchModel.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-[11px] font-bold">72% / 28%</div>
              </div>
            </div>
            <div className="flex-1 space-y-1 text-[11px]">
              {dispatchModel.map((d) => (
                <div key={d.name} className="flex items-start gap-1.5">
                  <span className="h-2 w-2 rounded-full mt-1 shrink-0" style={{ background: d.color }} />
                  <div className="flex-1">
                    <div className="text-slate-700 leading-tight">{d.name}</div>
                    <div className="font-bold">{d.value}% ({d.count})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">Total Active Technicians</span>
            <span className="font-bold">312</span>
          </div>
        </Section>

        <Section title="Technician Coverage Heatmap">
          <img
            src={worldCoverageMap}
            alt="World map showing technician coverage heatmap"
            loading="lazy"
            width={1024}
            height={576}
            className="w-full h-44 object-contain rounded-lg bg-slate-50"
          />
          <div className="grid grid-cols-2 gap-1 text-[10px] mt-2">
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />High Coverage</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Medium Coverage</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" />Low Coverage</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" />No Coverage</div>
          </div>
        </Section>

        <Section title="Top Sites by Active Work Orders">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-slate-500 uppercase">
              <tr className="border-b border-slate-100">
                <th className="text-left py-1.5">Site</th>
                <th className="text-left">Location</th>
                <th className="text-right">Orders</th>
                <th className="text-right pl-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {topSites.map((s) => (
                <tr key={s.s} className="border-b border-slate-50">
                  <td className="py-1.5 font-semibold">{s.s}</td>
                  <td className="text-slate-600">{s.l}</td>
                  <td className="text-right font-bold">{s.o}</td>
                  <td className="pl-2 text-right">
                    <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">In Progress</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-[11px] text-blue-600">View All Work Orders →</div>
        </Section>

        <Section title="Execution Performance (This Month)">
          <div className="grid grid-cols-2 gap-2">
            {exec.map((e) => {
              const I = e.icon;
              return (
                <div key={e.l} className={`rounded-lg border border-slate-100 ${e.bg} p-2.5`}>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600 mb-1">
                    <I className={`h-3.5 w-3.5 ${e.c}`} /> {e.l}
                  </div>
                  <div className={`text-lg font-bold ${e.c}`}>{e.v}</div>
                  <div className="text-[10px] text-slate-500">Target: {e.t}</div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      {/* End-to-End Execution Flow */}
      <Section title="End-to-End Execution Flow" action="">
        <div className="flex items-center gap-2 overflow-x-auto">
          {flow.map((s, i) => {
            const I = s.icon;
            return (
              <div key={s.n} className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`h-9 w-9 rounded-full ${s.bg} ${s.c} grid place-items-center shrink-0`}>
                    <I className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-[11px] font-bold leading-tight ${s.c}`}>{s.n}. {s.t}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{s.s}</div>
                  </div>
                </div>
                {i < flow.length - 1 && <span className="text-slate-300">→</span>}
              </div>
            );
          })}
          <div className="ml-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 shrink-0 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <div>
              <div className="text-[11px] font-bold text-emerald-700 leading-tight">Physical Execution. Global Scale. Day 1 Ready.</div>
              <div className="text-[10px] text-emerald-700">Our global logistics and field services ensure every user, in every location, is ready to work on Day 1.</div>
            </div>
          </div>
        </div>
      </Section>
    </DashShell>
  );
}
