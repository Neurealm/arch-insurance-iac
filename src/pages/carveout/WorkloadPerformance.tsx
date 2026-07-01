import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Gauge, BarChart3, Server, TrendingUp, Cpu, MemoryStick, HardDrive, Activity,
  CheckCircle2, AlertTriangle, Target, Calendar, ArrowUp, ArrowDown, ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell,
} from "recharts";

const kpis: KPI[] = [
  { label: "Overall Performance Score", value: "92.1%", sub: "Healthy", subColor: "text-emerald-600", icon: Gauge, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Total Workloads", value: "842", sub: "100% Monitored", subColor: "text-emerald-600", icon: BarChart3, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Critical Workloads", value: "68", sub: "8.1% of Total", subColor: "text-red-600", icon: Server, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Avg. Response Time", value: "156 ms", sub: "-12% vs last 7 days", subColor: "text-emerald-600", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "CPU Utilization (Avg.)", value: "62%", sub: "+4% vs last 7 days", subColor: "text-amber-600", icon: Cpu, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Memory Utilization (Avg.)", value: "58%", sub: "+3% vs last 7 days", subColor: "text-emerald-600", icon: MemoryStick, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Storage Utilization (Avg.)", value: "67%", sub: "+5% vs last 7 days", subColor: "text-amber-600", icon: HardDrive, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "I/O Utilization (Avg.)", value: "61%", sub: "+4% vs last 7 days", subColor: "text-amber-600", icon: Activity, color: "text-cyan-600", bg: "bg-cyan-50" },
];

const wwh = {
  what: ["The Workload Performance & Capacity Analytics layer — the system measuring how infrastructure performs under real demand."],
  why: ["Infrastructure success is measured by workload performance, not uptime alone. Poor performance impacts users, applications, and business outcomes."],
  how: [
    "Tracks CPU, memory, storage, and I/O utilization",
    "Monitors workload performance across environments",
    "Identifies capacity constraints and scaling needs",
    "Aligns performance to business services",
  ],
};

const outcomes: Outcome[] = [
  { icon: Target,       color: "text-emerald-600", title: "PERFORMANCE", l1: "92.1% score" },
  { icon: TrendingUp,   color: "text-emerald-600", title: "RESPONSE",    l1: "156 ms avg" },
  { icon: Cpu,          color: "text-amber-600",   title: "CAPACITY",    l1: "62% CPU avg" },
  { icon: AlertTriangle,color: "text-red-600",     title: "RISK",        l1: "68 critical workloads" },
  { icon: CheckCircle2, color: "text-emerald-600", title: "HEALTHY",     l1: "522 of 842" },
  { icon: Calendar,     color: "text-blue-600",    title: "REFRESH",     l1: "Every 5 min" },
];

const perfTrend = Array.from({ length: 7 }, (_, i) => {
  const day = `May ${6 + i}`;
  return {
    day,
    cpu: 60 + Math.round(Math.sin(i) * 5) + (i % 2 ? 2 : 0),
    mem: 55 + Math.round(Math.cos(i) * 4),
    sto: 65 + Math.round(Math.sin(i / 2) * 3),
    io:  58 + Math.round(Math.cos(i / 2) * 4),
    rt:  150 + Math.round(Math.sin(i) * 25),
  };
});

const envTrend = Array.from({ length: 7 }, (_, i) => ({
  day: `May ${6 + i}`,
  Production:    220 + Math.round(Math.sin(i) * 10),
  "Non-Production": 150 + Math.round(Math.cos(i) * 8),
  Development:   90  + Math.round(Math.sin(i / 2) * 8),
}));

const gauges = [
  { label: "CPU",     val: 62, delta: "+4%", color: "hsl(217 91% 60%)" },
  { label: "Memory",  val: 58, delta: "+3%", color: "hsl(142 71% 45%)" },
  { label: "Storage", val: 67, delta: "+5%", color: "hsl(262 83% 58%)" },
  { label: "I/O",     val: 61, delta: "+4%", color: "hsl(38 92% 50%)" },
];

const headroom = [
  { icon: Cpu, label: "CPU", val: 38, color: "text-blue-600", bg: "bg-blue-50" },
  { icon: MemoryStick, label: "Memory", val: 42, color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: HardDrive, label: "Storage", val: 33, color: "text-violet-600", bg: "bg-violet-50" },
  { icon: Activity, label: "I/O", val: 39, color: "text-amber-600", bg: "bg-amber-50" },
];

const topWorkloads = [
  { w: "ERP-PROD-01",    env: "Production", cpu: 78, mem: 71, sto: 72, io: 69, rt: 210 },
  { w: "DATA-WAREHOUSE", env: "Production", cpu: 74, mem: 66, sto: 81, io: 72, rt: 238 },
  { w: "CRM-PROD-01",    env: "Production", cpu: 68, mem: 63, sto: 65, io: 61, rt: 180 },
  { w: "ANALYTICS-01",   env: "Non-Prod",   cpu: 65, mem: 59, sto: 62, io: 58, rt: 165 },
  { w: "FINANCIALS-01",  env: "Production", cpu: 62, mem: 58, sto: 55, io: 53, rt: 142 },
  { w: "PORTAL-PROD-01", env: "Production", cpu: 55, mem: 52, sto: 48, io: 50, rt: 128 },
  { w: "DEV-TEST-01",    env: "Non-Prod",   cpu: 41, mem: 44, sto: 36, io: 37, rt: 98 },
  { w: "BACKUP-SRV",     env: "Production", cpu: 35, mem: 40, sto: 30, io: 29, rt: 76 },
];

const envPerf = [
  { env: "Production",     wl: 412, cpu: 64, mem: 60, sto: 69, io: 62, rt: 172 },
  { env: "Non-Production", wl: 298, cpu: 56, mem: 53, sto: 60, io: 57, rt: 134 },
  { env: "Development",    wl: 82,  cpu: 41, mem: 45, sto: 42, io: 40, rt: 96 },
  { env: "DR / Standby",   wl: 50,  cpu: 28, mem: 32, sto: 29, io: 27, rt: 68 },
];

const risks = [
  { res: "CPU",     status: "At Risk",  riskWl: 24, util: "> 80%",   exh: "18 Days", cls: "text-amber-600" },
  { res: "Storage", status: "At Risk",  riskWl: 31, util: "> 80%",   exh: "25 Days", cls: "text-amber-600" },
  { res: "Memory",  status: "Healthy",  riskWl: 6,  util: "60 - 80%",exh: "45+ Days",cls: "text-emerald-600" },
  { res: "I/O",     status: "Healthy",  riskWl: 10, util: "60 - 80%",exh: "40+ Days",cls: "text-emerald-600" },
];

const businessSvc = [
  { svc: "Order Management",     score: 94, rt: 142, trend: "up" },
  { svc: "Customer Experience",  score: 92, rt: 156, trend: "up" },
  { svc: "Financial Reporting",  score: 90, rt: 168, trend: "up" },
  { svc: "Supply Chain",         score: 88, rt: 178, trend: "flat" },
  { svc: "Analytics & BI",       score: 85, rt: 194, trend: "down" },
  { svc: "Employee Productivity",score: 93, rt: 128, trend: "up" },
];

const distro = [
  { name: "Healthy (≥ 90%)",   value: 522, color: "hsl(142 71% 45%)" },
  { name: "Warning (70 – 89%)",value: 234, color: "hsl(38 92% 50%)" },
  { name: "Critical (< 70%)",  value: 86,  color: "hsl(0 84% 60%)" },
];

const issues = [
  { issue: "High CPU Utilization", aff: 24, impact: "Performance Degradation", status: "Investigating" },
  { issue: "Storage Latency High", aff: 18, impact: "Slow Response Time",      status: "Investigating" },
  { issue: "Memory Pressure",      aff: 12, impact: "App Slowdowns",           status: "Monitoring" },
  { issue: "I/O Wait High",        aff: 10, impact: "Delayed Processing",      status: "Identified" },
  { issue: "Network Throughput",   aff: 8,  impact: "Intermittent Slowness",   status: "Monitoring" },
];

const forecast = [
  { res: "CPU",     cur: 62, proj: 78, risk: "Medium", cls: "text-amber-600" },
  { res: "Memory",  cur: 58, proj: 72, risk: "Medium", cls: "text-amber-600" },
  { res: "Storage", cur: 67, proj: 85, risk: "High",   cls: "text-red-600" },
  { res: "I/O",     cur: 61, proj: 76, risk: "Medium", cls: "text-amber-600" },
];

const recos = [
  "Scale CPU for 24 workloads to maintain performance",
  "Add 120 TB storage to avoid capacity exhaustion",
  "Optimize high memory workloads (12 identified)",
  "Tune I/O performance for 10 workloads",
  "Review and rightsize 31 low-utilization workloads",
];

function Bar1({ pct, color = "hsl(142 71% 45%)" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

function Trend({ t }: { t: string }) {
  if (t === "up")   return <ArrowUp className="h-3.5 w-3.5 text-emerald-600 inline" />;
  if (t === "down") return <ArrowDown className="h-3.5 w-3.5 text-red-500 inline" />;
  return <ArrowRight className="h-3.5 w-3.5 text-amber-500 inline" />;
}

function StatusText({ s }: { s: string }) {
  const cls =
    /investig/i.test(s) ? "text-amber-600" :
    /monitor/i.test(s)  ? "text-blue-600"  :
    /identif/i.test(s)  ? "text-red-600"   :
    "text-slate-700";
  return <span className={`text-[11px] font-medium ${cls}`}>{s}</span>;
}

function Gauge180({ value, color }: { value: number; color: string }) {
  const data = [
    { v: value, color },
    { v: 100 - value, color: "hsl(214 32% 91%)" },
  ];
  return (
    <div className="relative h-16 w-24 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="v" cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={28} outerRadius={42} stroke="none">
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="text-base font-extrabold text-slate-900 leading-none">{value}%</div>
      </div>
    </div>
  );
}

export default function WorkloadPerformance() {
  return (
    <DashShell
      title="WORKLOAD PERFORMANCE"
      highlight="& CAPACITY ANALYTICS"
      subtitle="Measuring how infrastructure performs under real demand to ensure optimal performance, efficiency, and capacity."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <Section title="Performance Overview (Last 7 Days)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={perfTrend}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} domain={[0, 400]} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line yAxisId="l" type="monotone" dataKey="cpu" name="CPU %"     stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ r: 2 }} />
                  <Line yAxisId="l" type="monotone" dataKey="mem" name="Memory %"  stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 2 }} />
                  <Line yAxisId="l" type="monotone" dataKey="sto" name="Storage %" stroke="hsl(262 83% 58%)" strokeWidth={2} dot={{ r: 2 }} />
                  <Line yAxisId="l" type="monotone" dataKey="io"  name="I/O %"     stroke="hsl(38 92% 50%)"  strokeWidth={2} dot={{ r: 2 }} />
                  <Line yAxisId="r" type="monotone" dataKey="rt"  name="Response Time (ms)" stroke="hsl(180 65% 40%)" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <Section title="Utilization by Resource Type">
            <div className="grid grid-cols-4 gap-2">
              {gauges.map((g) => (
                <div key={g.label} className="text-center">
                  <div className="text-[10px] font-semibold text-slate-700 mb-1">{g.label}</div>
                  <Gauge180 value={g.val} color={g.color} />
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">{g.delta}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Capacity Headroom (Average)">
            <div className="grid grid-cols-4 gap-2">
              {headroom.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.label} className="text-center">
                    <div className="text-[10px] font-semibold text-slate-700">{h.label}</div>
                    <div className={`mx-auto my-1 h-9 w-9 rounded-lg ${h.bg} ${h.color} grid place-items-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-bold text-slate-900">{h.val}%</div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        <div className="lg:col-span-4">
          <Section title="Top Workloads by Resource Utilization (Avg.)">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-2">Workload</th>
                  <th className="text-left py-2">Environment</th>
                  <th className="text-right py-2">CPU %</th>
                  <th className="text-right py-2">Mem %</th>
                  <th className="text-right py-2">Sto %</th>
                  <th className="text-right py-2">I/O %</th>
                  <th className="text-right py-2">Resp (ms)</th>
                </tr>
              </thead>
              <tbody>
                {topWorkloads.map((w) => (
                  <tr key={w.w} className="border-b border-slate-100">
                    <td className="py-1.5 font-medium text-slate-800">{w.w}</td>
                    <td className="py-1.5 text-slate-600">{w.env}</td>
                    <td className="py-1.5 text-right">{w.cpu}%</td>
                    <td className="py-1.5 text-right">{w.mem}%</td>
                    <td className="py-1.5 text-right">{w.sto}%</td>
                    <td className="py-1.5 text-right">{w.io}%</td>
                    <td className="py-1.5 text-right font-semibold">{w.rt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <div className="lg:col-span-3">
          <Section title="Performance by Environment">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-2">Environment</th>
                  <th className="text-right py-2">WL</th>
                  <th className="text-right py-2">CPU</th>
                  <th className="text-right py-2">Mem</th>
                  <th className="text-right py-2">Sto</th>
                  <th className="text-right py-2">I/O</th>
                  <th className="text-right py-2">Resp</th>
                </tr>
              </thead>
              <tbody>
                {envPerf.map((e) => (
                  <tr key={e.env} className="border-b border-slate-100">
                    <td className="py-1.5 font-medium text-slate-800">{e.env}</td>
                    <td className="py-1.5 text-right">{e.wl}</td>
                    <td className="py-1.5 text-right">{e.cpu}%</td>
                    <td className="py-1.5 text-right">{e.mem}%</td>
                    <td className="py-1.5 text-right">{e.sto}%</td>
                    <td className="py-1.5 text-right">{e.io}%</td>
                    <td className="py-1.5 text-right">{e.rt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Performance Trend by Environment (Last 7 Days)">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={envTrend}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="Production"     stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="Non-Production" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="Development"    stroke="hsl(262 83% 58%)" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Response Time (ms)</div>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Capacity Risk & Constraints">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-2">Resource</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-right py-2">At Risk WL</th>
                  <th className="text-right py-2">Utilization</th>
                  <th className="text-right py-2">Projected Exh.</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((r) => (
                  <tr key={r.res} className="border-b border-slate-100">
                    <td className="py-2 font-medium text-slate-800">{r.res}</td>
                    <td className="py-2">
                      <span className={`inline-flex items-center gap-1 ${r.cls} text-[11px] font-medium`}>
                        {r.status === "Healthy" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2 text-right">{r.riskWl}</td>
                    <td className="py-2 text-right text-slate-600">{r.util}</td>
                    <td className={`py-2 text-right font-semibold ${r.cls}`}>{r.exh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Performance vs Business Services">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-2">Business Service</th>
                  <th className="text-right py-2">Health</th>
                  <th className="text-right py-2">Resp (ms)</th>
                  <th className="text-right py-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                {businessSvc.map((b) => (
                  <tr key={b.svc} className="border-b border-slate-100">
                    <td className="py-2 text-slate-800">{b.svc}</td>
                    <td className="py-2 text-right font-semibold">{b.score}%</td>
                    <td className="py-2 text-right">{b.rt}</td>
                    <td className="py-2 text-right"><Trend t={b.trend} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <div className="lg:col-span-3">
          <Section title="Workload Performance Distribution">
            <div className="flex items-center gap-3">
              <div className="relative h-32 w-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distro} dataKey="value" innerRadius={36} outerRadius={56} paddingAngle={2}>
                      {distro.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-slate-900">842</div>
                    <div className="text-[9px] text-slate-500">Total Workloads</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 text-[11px] flex-1">
                {distro.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="flex-1 text-slate-700">{d.name}</span>
                    <span className="font-semibold text-slate-900">{d.value} ({((d.value / 842) * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Top Performance Issues">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-2">Issue</th>
                  <th className="text-right py-2">Affected WL</th>
                  <th className="text-left py-2">Impact</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((i) => (
                  <tr key={i.issue} className="border-b border-slate-100">
                    <td className="py-2 text-slate-800">{i.issue}</td>
                    <td className="py-2 text-right font-semibold">{i.aff}</td>
                    <td className="py-2 text-slate-600">{i.impact}</td>
                    <td className="py-2"><StatusText s={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Capacity Forecast (Next 90 Days)">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-2">Resource</th>
                  <th className="text-right py-2">Current</th>
                  <th className="text-left py-2 pl-2">90-Day Forecast</th>
                  <th className="text-right py-2">Risk</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((f) => (
                  <tr key={f.res} className="border-b border-slate-100">
                    <td className="py-2 font-medium text-slate-800">{f.res}</td>
                    <td className="py-2 text-right">{f.cur}%</td>
                    <td className="py-2 pl-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1"><Bar1 pct={f.proj} color={f.risk === "High" ? "hsl(0 84% 60%)" : "hsl(142 71% 45%)"} /></div>
                        <span className="font-semibold text-slate-900 w-9 text-right">{f.proj}%</span>
                      </div>
                    </td>
                    <td className={`py-2 text-right font-semibold ${f.cls}`}>{f.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Optimization Recommendations">
            <ul className="space-y-2 text-[11px]">
              {recos.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">{r}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>

      {/* Footer goal */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-50 grid place-items-center text-blue-600 shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Goal</div>
            <div className="text-[11px] text-slate-600">Optimize workload performance and capacity to deliver best user experience and support business growth.</div>
          </div>
        </div>
        {[
          { l: "Performance Target",       v: "≥ 90%",   sub: "Performance Score" },
          { l: "Avg. Response Time Target",v: "≤ 200 ms",sub: "" },
          { l: "SLA Compliance Target",    v: "≥ 95%",   sub: "" },
          { l: "Capacity Headroom Target", v: "≥ 30%",   sub: "" },
        ].map((t) => (
          <div key={t.l} className="lg:col-span-1.5 col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center" style={{ gridColumn: "span 2 / span 2" }}>
            <div className="text-[10px] text-slate-500 font-medium">{t.l}</div>
            <div className="text-lg font-extrabold text-slate-900 leading-tight">{t.v}</div>
            {t.sub && <div className="text-[9px] text-slate-500">{t.sub}</div>}
          </div>
        ))}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <Calendar className="h-5 w-5 text-blue-600 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 font-medium">Data Refreshed</div>
            <div className="text-xs font-bold text-slate-900">May 12, 2026 10:15 AM</div>
            <div className="text-[9px] text-slate-500">Auto Refresh: Every 5 Minutes</div>
          </div>
        </div>
      </div>
    </DashShell>
  );
}
