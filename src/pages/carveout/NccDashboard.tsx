import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/eoc/AppShell";
import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Network, CheckCircle2, Clock, AlertTriangle, Activity, Wifi, Gauge, ShieldCheck,
  Target, Users, Clock4, Bot,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area, BarChart, Bar, Legend,
} from "recharts";

const kpis: KPI[] = [
  { label: "Cutovers Planned", value: "84", sub: "Across program", subColor: "text-slate-500", icon: Network, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Completed Successfully", value: "61", sub: "72.6%", subColor: "text-emerald-600", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "In Flight", value: "14", sub: "16.7%", subColor: "text-amber-600", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "At Risk / Failed", value: "9", sub: "10.7%", subColor: "text-red-600", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Connectivity Success Rate", value: "99.4%", sub: "Last 30 days", subColor: "text-emerald-600", icon: Wifi, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Avg Cutover Window", value: "42 min", sub: "↓ 38% vs baseline", subColor: "text-emerald-600", icon: Clock4, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Auto-Rollbacks Triggered", value: "3", sub: "All recovered <5 min", subColor: "text-emerald-600", icon: Bot, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Open Risks", value: "7", sub: "2 high · 5 medium", subColor: "text-amber-600", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
];

const cutoverStatus = [
  { name: "Successful", value: 61, pct: "72.6%", color: "hsl(142 71% 45%)" },
  { name: "In Flight", value: 14, pct: "16.7%", color: "hsl(217 91% 60%)" },
  { name: "At Risk", value: 6, pct: "7.1%", color: "hsl(38 92% 50%)" },
  { name: "Failed", value: 3, pct: "3.6%", color: "hsl(0 84% 60%)" },
];

const cutovers = [
  { name: "NA-WAN-01", site: "Boston, USA", region: "North America", status: "Successful", window: "30 min", validation: "Pass", rollback: "—", risk: "Low" },
  { name: "EU-WAN-04", site: "London, UK", region: "Europe", status: "Successful", window: "28 min", validation: "Pass", rollback: "—", risk: "Low" },
  { name: "APAC-SDWAN-02", site: "Singapore", region: "Asia Pacific", status: "In Progress", window: "45 min", validation: "Running", rollback: "—", risk: "Medium" },
  { name: "LATAM-WAN-03", site: "São Paulo, Brazil", region: "Latin America", status: "In Progress", window: "55 min", validation: "Running", rollback: "—", risk: "Medium" },
  { name: "MEA-FW-01", site: "Dubai, UAE", region: "MEA", status: "At Risk", window: "—", validation: "Pending", rollback: "Armed", risk: "High" },
  { name: "MEA-WAN-02", site: "Johannesburg, ZA", region: "MEA", status: "Failed", window: "62 min", validation: "Fail", rollback: "Triggered", risk: "High" },
  { name: "NA-FW-08", site: "Toronto, Canada", region: "North America", status: "Successful", window: "32 min", validation: "Pass", rollback: "—", risk: "Low" },
  { name: "EU-DC-02", site: "Frankfurt, DE", region: "Europe", status: "Successful", window: "40 min", validation: "Pass", rollback: "—", risk: "Low" },
];

const successTrend = [
  { d: "W1", v: 92 }, { d: "W2", v: 94 }, { d: "W3", v: 95.5 },
  { d: "W4", v: 97 }, { d: "W5", v: 98.2 }, { d: "W6", v: 99.1 }, { d: "W7", v: 99.4 },
];

const latencyByRegion = [
  { r: "NA", before: 48, after: 31 },
  { r: "EU", before: 52, after: 34 },
  { r: "APAC", before: 78, after: 56 },
  { r: "LATAM", before: 95, after: 71 },
  { r: "MEA", before: 110, after: 82 },
];

const topRisks = [
  { id: "MEA-FW-01", site: "Dubai, UAE", risk: "High", reason: "Carrier circuit not provisioned", owner: "Carrier Team", target: "May 12, 2026" },
  { id: "MEA-WAN-02", site: "Johannesburg, ZA", risk: "High", reason: "Failed BGP convergence – rolled back", owner: "Network Eng", target: "May 10, 2026" },
  { id: "LATAM-WAN-03", site: "São Paulo, BR", risk: "Medium", reason: "Latency above SLA on backup path", owner: "NOC", target: "May 14, 2026" },
  { id: "APAC-SDWAN-02", site: "Singapore", risk: "Medium", reason: "Pending firewall policy approval", owner: "Security", target: "May 11, 2026" },
];

const validationCoverage = [
  { name: "Reachability", value: 100, color: "hsl(142 71% 45%)" },
  { name: "Latency / Loss", value: 96, color: "hsl(217 91% 60%)" },
  { name: "Application Path", value: 92, color: "hsl(262 83% 58%)" },
  { name: "Security / Policy", value: 89, color: "hsl(38 92% 50%)" },
];

const wwh = {
  what: [
    "Status of every planned and in-flight network cutover globally",
    "Real-time connectivity, latency, loss, and application path validation",
    "Risks, blockers, and auto-rollback activity",
    "Cutover windows, success rates, and program-level KPIs",
  ],
  why: [
    "Day 1 success depends on every cutover landing safely",
    "Early risk visibility prevents outages and rework",
    "Validation evidence is required for governance and audits",
    "Performance assurance keeps users productive post-cutover",
  ],
  how: [
    "Ingest telemetry from network, security, and monitoring tools",
    "Correlate change windows with health and experience signals",
    "Auto-validate paths and policies against cutover acceptance criteria",
    "Trigger guarded rollback and notify owners on threshold breach",
  ],
};

const outcomes: Outcome[] = [
  { icon: Target, color: "text-blue-600", title: "Focus", l1: "Land every cutover safely with zero surprises" },
  { icon: ShieldCheck, color: "text-emerald-600", title: "Proactive", l1: "Detect risks early; prevent outages before cutover" },
  { icon: Users, color: "text-violet-600", title: "Accountability", l1: "Clear owners and SLAs on every risk and validation" },
  { icon: Clock4, color: "text-amber-600", title: "Outcome", l1: "Reliable, secure connectivity from Day 1 and beyond" },
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

export default function NccDashboard() {
  const nav = useNavigate();
  return (
    <DashShell
        title="NETWORK CUTOVER"
        highlight="& CONNECTIVITY DASHBOARD"
        subtitle="Real-time visibility into cutover execution, connectivity validation, performance and risks across the global program."
        wwh={wwh}
        kpis={kpis}
        outcomes={outcomes}
        topActions={
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button onClick={() => nav("/coworkers/it-carve-out-and-separation")} className="text-xs text-slate-600 inline-flex items-center gap-1 hover:text-slate-900 font-semibold">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to IT Carve-Out
            </button>
            <div className="flex items-center gap-2">
              <Button onClick={() => nav("/coworkers/it-carve-out-and-separation/ncc/overview")} variant="outline" className="h-10 px-4 font-semibold">
                <FileText className="h-4 w-4" /> Overview
              </Button>
              <Button onClick={() => nav("/coworkers/it-carve-out-and-separation/ncc/solution-design")} className="h-10 px-4 font-semibold bg-navy hover:bg-navy/90 text-white">
                <Workflow className="h-4 w-4" /> Solution Design
              </Button>
            </div>
          </div>
        }
      >
        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4">
            <Section title="Cutover Status (Program)">
              <div className="flex items-center gap-3">
                <Donut data={cutoverStatus} total="84" sub="Total Cutovers" />
                <div className="flex-1 space-y-1 text-[11px]">
                  {cutoverStatus.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="flex-1 text-slate-700">{d.name}</span>
                      <span className="font-semibold text-slate-900">{d.value}</span>
                      <span className="text-slate-500">({d.pct})</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-slate-500 mt-2 text-center">61 of 84 cutovers complete · 99.4% connectivity success</div>
            </Section>
          </div>

          <div className="lg:col-span-5">
            <Section title="Cutover Execution Tracker (Latest)">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-1.5">Cutover</th>
                      <th className="text-left py-1.5">Site</th>
                      <th className="text-left py-1.5">Region</th>
                      <th className="text-left py-1.5">Status</th>
                      <th className="text-left py-1.5">Window</th>
                      <th className="text-left py-1.5">Validation</th>
                      <th className="text-left py-1.5">Rollback</th>
                      <th className="text-left py-1.5">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cutovers.map((c) => (
                      <tr key={c.name} className="border-b border-slate-100">
                        <td className="py-1.5 font-medium text-slate-800">{c.name}</td>
                        <td className="py-1.5 text-slate-600">{c.site}</td>
                        <td className="py-1.5 text-slate-600">{c.region}</td>
                        <td className="py-1.5"><StatusPill status={c.status} /></td>
                        <td className="py-1.5 text-slate-700">{c.window}</td>
                        <td className="py-1.5"><StatusPill status={c.validation} /></td>
                        <td className="py-1.5 text-slate-700">{c.rollback}</td>
                        <td className="py-1.5"><StatusPill status={c.risk} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>

          <div className="lg:col-span-3">
            <Section title="Validation Coverage">
              <div className="space-y-3 mt-1">
                {validationCoverage.map((v) => (
                  <div key={v.name}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-700 font-medium">{v.name}</span>
                      <span className="font-semibold text-slate-900">{v.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${v.value}%`, background: v.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 mt-3 text-center">Acceptance checks across reachability, performance, app path and policy</div>
            </Section>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
          <div className="lg:col-span-4">
            <Section title="Connectivity Success Trend (7 weeks)">
              <div className="h-44">
                <ResponsiveContainer>
                  <AreaChart data={successTrend}>
                    <defs>
                      <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                    <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[85, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip />
                    <Area type="monotone" dataKey="v" stroke="hsl(142 71% 45%)" fill="url(#sg)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-slate-500 text-center">Connectivity success rate</div>
            </Section>
          </div>

          <div className="lg:col-span-4">
            <Section title="Latency by Region (Pre vs Post Cutover)">
              <div className="h-44">
                <ResponsiveContainer>
                  <BarChart data={latencyByRegion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                    <XAxis dataKey="r" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}ms`} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="before" name="Before" fill="hsl(0 84% 60%)" radius={[4,4,0,0]} />
                    <Bar dataKey="after" name="After" fill="hsl(142 71% 45%)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-slate-500 text-center">Avg latency (ms) per region</div>
            </Section>
          </div>

          <div className="lg:col-span-4">
            <Section title="Top Open Risks">
              <table className="w-full text-[11px]">
                <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-1.5">Cutover</th>
                    <th className="text-left py-1.5">Risk</th>
                    <th className="text-left py-1.5">Reason</th>
                    <th className="text-left py-1.5">Owner</th>
                    <th className="text-left py-1.5">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {topRisks.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100">
                      <td className="py-2 font-medium text-slate-800">{r.id}<div className="text-[10px] text-slate-500 font-normal">{r.site}</div></td>
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
        </div>
    </DashShell>
  );
}
