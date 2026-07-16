import { AtcShell, PageHeader, PriBadge, StatusPill, Card } from "./shared";
import { SLA_AT_RISK, ASSIGNMENT_GROUPS, PERF_SERIES } from "./data";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";

const KPI_TARGETS = [
  { label: "First Response (P1)", target: "15 min",  actual: "12 min",  pct: 96, tone: "emerald" },
  { label: "First Response (P2)", target: "30 min",  actual: "26 min",  pct: 94, tone: "emerald" },
  { label: "Resolution (P1)",     target: "4 hours", actual: "3h 20m",  pct: 91, tone: "emerald" },
  { label: "Resolution (P2)",     target: "8 hours", actual: "7h 12m",  pct: 88, tone: "amber"   },
  { label: "Resolution (P3)",     target: "1 day",   actual: "18h",     pct: 92, tone: "emerald" },
  { label: "Resolution (P4)",     target: "3 days",  actual: "2.1 d",   pct: 97, tone: "emerald" },
  { label: "Auto-Categorize Rate", target: "85%",    actual: "86%",     pct: 101, tone: "emerald" },
  { label: "Categorization Accuracy", target: "95%", actual: "94.7%",   pct: 99, tone: "amber"   },
];

export default function SlaKpis() {
  return (
    <AtcShell activeNav="sla" breadcrumb="SLAs & KPIs">
      <PageHeader title="SLAs & KPIs" subtitle="Service-level performance against targets, plus AI-specific KPIs from the categorizer." />

      <div className="px-6 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
          <div className="text-[11px] text-rose-700 font-semibold">Breached (Today)</div>
          <div className="text-[28px] font-bold text-rose-700 mt-1">12</div>
          <div className="text-[10px] text-rose-600 mt-1">P1: 3 · P2: 9</div>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="text-[11px] text-amber-700 font-semibold">At Risk</div>
          <div className="text-[28px] font-bold text-amber-700 mt-1">27</div>
          <div className="text-[10px] text-amber-600 mt-1">Within 30 min of breach</div>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="text-[11px] text-emerald-700 font-semibold">On Track</div>
          <div className="text-[28px] font-bold text-emerald-700 mt-1">217</div>
          <div className="text-[10px] text-emerald-600 mt-1">Healthy path to close</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-[11px] text-slate-500">MTTR (7-day)</div>
          <div className="text-[28px] font-bold text-slate-900 mt-1">38<span className="text-[13px] text-slate-500 ml-1">min</span></div>
          <div className="text-[10px] text-emerald-600 mt-1">▼ 12% vs prior week</div>
        </div>
      </div>

      <div className="px-6 pb-4 grid grid-cols-12 gap-4">
        <Card title="KPI Targets vs Actual" className="col-span-12 xl:col-span-6">
          <ul className="space-y-3 -mt-1">
            {KPI_TARGETS.map((k) => (
              <li key={k.label}>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-semibold text-slate-800 flex-1">{k.label}</span>
                  <span className="text-slate-500">Target: <span className="font-mono text-slate-700">{k.target}</span></span>
                  <span className="text-slate-500">Actual: <span className="font-mono text-slate-700">{k.actual}</span></span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className={cn("h-full rounded-full", k.tone === "emerald" ? "bg-emerald-500" : "bg-amber-500")}
                    style={{ width: `${Math.min(100, k.pct)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Accuracy & Auto-Rate Trend" subtitle="AI KPIs vs 95% / 85% targets" className="col-span-12 xl:col-span-6">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PERF_SERIES} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="d" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[75, 100]} stroke="#64748b" fontSize={10} tickLine={false} width={36} unit="%" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                <ReferenceLine y={95} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Accuracy target 95%", fontSize: 9, fill: "#10b981", position: "insideTopRight" }} />
                <ReferenceLine y={85} stroke="#4f46e5" strokeDasharray="4 4" label={{ value: "Auto-rate target 85%", fontSize: 9, fill: "#4f46e5", position: "insideBottomRight" }} />
                <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="autoRate" name="Auto-rate %" stroke="#4f46e5" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Upcoming Breaches" className="col-span-12 xl:col-span-7">
          <table className="w-full text-left text-[11px] -mx-4">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Ticket</th>
                <th className="px-3 py-2 font-semibold">Priority</th>
                <th className="px-3 py-2 font-semibold">Time Left</th>
                <th className="px-3 py-2 font-semibold">Service</th>
                <th className="px-3 py-2 font-semibold">Group</th>
                <th className="px-3 py-2 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SLA_AT_RISK.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono text-slate-700">{s.id}</td>
                  <td className="px-3 py-2"><PriBadge p={s.pri} /></td>
                  <td className="px-3 py-2 font-mono text-rose-600">{s.time}</td>
                  <td className="px-3 py-2 text-slate-700">{s.label}</td>
                  <td className="px-3 py-2 text-slate-600">{s.group}</td>
                  <td className="px-3 py-2 text-slate-600">{s.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="SLA by Assignment Group" className="col-span-12 xl:col-span-5">
          <ul className="space-y-2 -mt-1">
            {ASSIGNMENT_GROUPS.slice(0, 8).map((g, i) => {
              const compliance = 100 - (i * 1.4);
              return (
                <li key={g.id} className="text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-slate-800 font-semibold">{g.name}</span>
                    <span className="font-mono text-slate-700">{compliance.toFixed(1)}%</span>
                    <StatusPill s={compliance >= 95 ? "On Track" : compliance >= 90 ? "At Risk" : "Breached"} />
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={cn("h-full rounded-full", compliance >= 95 ? "bg-emerald-500" : compliance >= 90 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${compliance}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </AtcShell>
  );
}
