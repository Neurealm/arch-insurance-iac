import { AppShell } from "@/components/eoc/AppShell";
import {
  Calendar, Filter, Eye, ShieldCheck, Settings2, Users, CheckCircle2, Clock,
  AlertCircle, Monitor, ShieldHalf, ShoppingCart, Package, Image as ImageIcon,
  Truck, CheckCircle, Cloud, UserSquare2, KeyRound, Network, AppWindow,
  Target, UserCheck, ShieldAlert, Globe, BarChart3, AlertTriangle, Info,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip,
} from "recharts";

const donut = [
  { name: "Provisioned", value: 78, color: "hsl(142 71% 45%)" },
  { name: "In Progress", value: 14, color: "hsl(38 92% 50%)" },
  { name: "Not Started", value: 8, color: "hsl(0 84% 60%)" },
];

const throughput = Array.from({ length: 25 }, (_, i) => ({
  h: i,
  hour: 180 + Math.round(Math.sin(i / 3) * 60 + Math.random() * 60),
  day: 1800 + Math.round(Math.cos(i / 4) * 400 + Math.random() * 300),
}));

const pipeline = [
  { label: "Ordered", value: "13,200", pct: "106% of plan", icon: ShoppingCart, color: "text-blue-600" },
  { label: "Staged", value: "9,820", pct: "79% of plan", icon: Package, color: "text-amber-600" },
  { label: "Imaged", value: "8,150", pct: "66% of plan", icon: ImageIcon, color: "text-slate-700" },
  { label: "Shipped", value: "6,980", pct: "56% of plan", icon: Truck, color: "text-indigo-600" },
  { label: "Activated", value: "5,720", pct: "46% of plan", icon: CheckCircle, color: "text-emerald-600" },
];

const capability = [
  { label: "Identity Readiness", sub: "MFA & Domain Join", icon: UserSquare2, value: 82, count: "6,560 / 8,000", color: "bg-emerald-500" },
  { label: "MFA Enrollment", sub: "Users Enrolled", icon: KeyRound, value: 85, count: "6,800 / 8,000", color: "bg-emerald-500" },
  { label: "Domain Join", sub: "Devices Joined", icon: Network, value: 80, count: "6,400 / 8,000", color: "bg-emerald-500" },
  { label: "Access to Apps", sub: "SSO Ready", icon: AppWindow, value: 78, count: "6,240 / 8,000", color: "bg-emerald-500" },
];

const regions = [
  { region: "North America", users: "2,400", prov: "2,040", readiness: 85, dot: "bg-emerald-500" },
  { region: "Europe", users: "2,000", prov: "1,620", readiness: 81, dot: "bg-emerald-500" },
  { region: "APAC", users: "2,100", prov: "1,512", readiness: 72, dot: "bg-amber-500" },
  { region: "Latin America", users: "900", prov: "585", readiness: 65, dot: "bg-amber-500" },
  { region: "MEA", users: "600", prov: "348", readiness: 58, dot: "bg-red-500" },
];

const insights = [
  { icon: AlertTriangle, color: "text-red-500", title: "Backlog trending up in APAC", sub: "Additional imaging capacity required", time: "10:28 AM" },
  { icon: ShieldAlert, color: "text-amber-500", title: "Image build IM-2026-02-10", sub: "Patch compliance 98% (Target 99%)", time: "10:20 AM" },
  { icon: Info, color: "text-blue-500", title: "Surge scaling activated", sub: "Additional imaging nodes provisioned", time: "10:15 AM" },
  { icon: CheckCircle, color: "text-emerald-500", title: "CDW feed synchronized", sub: "1,280 new devices received", time: "10:10 AM" },
];

const kpis = [
  { label: "Total Users", value: "8,000", sub: "BD → Waters Transition", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Provisioned", value: "6,240", sub: "78% of total users", subColor: "text-emerald-600", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "In Progress", value: "1,120", sub: "14% of total users", subColor: "text-amber-600", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Not Started", value: "640", sub: "8% of total users", subColor: "text-red-600", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  { label: "On VDI (Fallback)", value: "1,250", sub: "16% of total users", subColor: "text-indigo-600", icon: Monitor, color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "Overall Readiness Score", value: "78%", sub: "Program Readiness Score", icon: ShieldHalf, color: "text-blue-600", bg: "bg-blue-50", chart: true },
];

const outcomes = [
  { icon: Target, color: "text-blue-600", title: "OUTCOME", l1: "Zero disruption.", l2: "Day 1 productivity." },
  { icon: UserCheck, color: "text-emerald-600", title: "USERS READY FOR DAY 1", l1: "78% (6,240 / 8,000)", l2: "" },
  { icon: ShieldAlert, color: "text-indigo-600", title: "RISK REDUCED", l1: "Early detection &", l2: "proactive mitigation" },
  { icon: Globe, color: "text-blue-600", title: "GLOBAL CONSISTENCY", l1: "One standard. Local", l2: "execution." },
  { icon: BarChart3, color: "text-emerald-600", title: "MEASURABLE PROGRESS", l1: "Real-time visibility.", l2: "Actionable insights." },
];

function InfoCard({ icon: Icon, title, subtitle, items, tone }: any) {
  const tones: any = {
    blue: { bg: "bg-blue-50", border: "border-blue-100", icon: "text-blue-600", title: "text-blue-700" },
    green: { bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-600", title: "text-emerald-700" },
    purple: { bg: "bg-violet-50", border: "border-violet-100", icon: "text-violet-600", title: "text-violet-700" },
  };
  const t = tones[tone];
  return (
    <div className={`rounded-xl border ${t.border} ${t.bg} p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${t.icon}`} />
        <span className={`font-bold text-sm ${t.title}`}>{title}</span>
        <span className="text-xs text-slate-600">– {subtitle}</span>
      </div>
      <ul className="text-[12px] text-slate-700 space-y-1 list-disc list-inside leading-relaxed">
        {items.map((i: string) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}

export default function WorkforceReadiness() {
  return (
    <AppShell>
      <main className="flex-1 px-6 py-5 bg-slate-50/50 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              WORKFORCE READINESS COMMAND CENTER <span className="text-slate-700">(DAY 1 VIEW)</span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">Waters Corporation – Separation Program (BD → Waters)</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
                <Calendar className="h-3.5 w-3.5" /> {(() => { const d = new Date(); return `${d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"America/New_York"})}`; })()} <span className="text-slate-400">|</span> {new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true,timeZone:"America/New_York"})} ET
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Last updated: {new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true,timeZone:"America/New_York"})} ET</span>
              <button className="inline-flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50">
                <Filter className="h-3.5 w-3.5" /> Filters
              </button>
            </div>
          </div>
        </div>

        {/* WHAT / WHY / HOW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <InfoCard
            icon={Eye} tone="blue" title="WHAT" subtitle="What this dashboard shows"
            items={[
              "Real-time visibility into Day 1 readiness for ~8,000 users across people, devices, identity, access, and locations.",
              "% users provisioned vs total (BD → Waters split)",
              "Devices shipped, staged, deployed",
              "Identity readiness (MFA enrollment & domain join)",
              "VDI fallback coverage for continuity",
              "Regional readiness heatmap",
            ]}
          />
          <InfoCard
            icon={ShieldCheck} tone="green" title="WHY" subtitle="Why it matters"
            items={[
              "Day 1 productivity is critical during separation. This view helps:",
              "Ensure users can work from Day 1 with minimal disruption",
              "Identify gaps early and mitigate risks proactively",
              "Maintain executive control with one source of truth",
              "Drive accountable execution across all workstreams",
            ]}
          />
          <InfoCard
            icon={Settings2} tone="purple" title="HOW" subtitle="How we deliver it"
            items={[
              "Powered by integrated data from provisioning, identity, VDI, and field operations systems with automated updates every 5 minutes.",
              "Automated data ingestion & reconciliation",
              "AI-driven insights & risk detection",
              "Real-time alerts & exception management",
              "Role-based visibility for executives & program teams",
            ]}
          />
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-lg ${k.bg} ${k.color} grid place-items-center shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-slate-500 truncate">{k.label}</div>
                    <div className="text-2xl font-bold text-slate-900 leading-tight">{k.value}</div>
                  </div>
                </div>
                <div className={`mt-2 text-[11px] ${k.subColor ?? "text-slate-500"}`}>{k.sub}</div>
                {k.chart && (
                  <div className="h-6 mt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={throughput}>
                        <Line type="monotone" dataKey="hour" stroke="hsl(142 71% 45%)" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Row: Provisioning / Device Lifecycle / Capability */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Provisioning */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Provisioning Progress</h3>
              <a className="text-xs text-blue-600 font-medium">View Details →</a>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative h-40 w-40 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={donut} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={2}>
                      {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">78%</div>
                    <div className="text-[10px] text-slate-500">Provisioned</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Provisioned</span>
                  <span><b>6,240</b> <span className="text-slate-500">78%</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" />In Progress</span>
                  <span><b>1,120</b> <span className="text-slate-500">14%</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500" />Not Started</span>
                  <span><b>640</b> <span className="text-slate-500">8%</span></span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span className="text-slate-600">Total Users</span>
                  <b>8,000</b>
                </div>
              </div>
            </div>
          </div>

          {/* Device Lifecycle */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Device Lifecycle (Pipeline)</h3>
              <a className="text-xs text-blue-600 font-medium">View Details →</a>
            </div>
            <div className="flex items-end justify-between gap-1 mb-3">
              {pipeline.map((p, i) => {
                const Icon = p.icon;
                return (
                  <div key={p.label} className="flex items-center gap-1 flex-1">
                    <div className="text-center flex-1">
                      <Icon className={`h-6 w-6 mx-auto ${p.color}`} />
                      <div className="text-[10px] text-slate-500 mt-1">{p.label}</div>
                      <div className="text-sm font-bold text-slate-900">{p.value}</div>
                      <div className="text-[10px] text-blue-600">{p.pct}</div>
                    </div>
                    {i < pipeline.length - 1 && <span className="text-slate-300">→</span>}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-100 pt-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>Daily Throughput (Devices)</span>
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="h-1.5 w-3 bg-blue-500 rounded" />Devices / Hour</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-3 bg-blue-300 rounded" />Devices / Day</span>
                </span>
              </div>
              <div className="h-24">
                <ResponsiveContainer>
                  <LineChart data={throughput}>
                    <XAxis dataKey="h" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip />
                    <Line type="monotone" dataKey="hour" stroke="hsl(217 91% 60%)" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="day" stroke="hsl(217 91% 80%)" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Capability */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Readiness by Capability</h3>
              <a className="text-xs text-blue-600 font-medium">View Details →</a>
            </div>
            <div className="space-y-3">
              {capability.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 grid place-items-center shrink-0">
                      <Icon className="h-4 w-4 text-slate-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-900">{c.label}</div>
                          <div className="text-[10px] text-slate-500">{c.sub}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500">{c.count}</div>
                          <div className="text-xs font-bold text-emerald-600">{c.value}%</div>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                        <div className={`h-full ${c.color}`} style={{ width: `${c.value}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row: VDI / Heatmap / Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* VDI */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">VDI Fallback Coverage</h3>
              <a className="text-xs text-blue-600 font-medium">View Details →</a>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-violet-50 grid place-items-center mb-2">
                  <Cloud className="h-8 w-8 text-violet-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">1,250</div>
                <div className="text-[10px] text-slate-500">Users on VDI</div>
                <div className="text-[10px] text-violet-600 font-medium">16% of total users</div>
                <div className="text-[10px] text-slate-500 mt-2 max-w-[120px]">Protecting users during transition to ensure Day 1 productivity</div>
              </div>
              <div className="flex-1 space-y-3 text-xs">
                {[
                  { l: "Active Sessions", v: "1,180", pct: 95, color: "bg-blue-500" },
                  { l: "Session Performance", v: "98%", pct: 98, color: "bg-emerald-500" },
                  { l: "Capacity Utilization", v: "72%", pct: 72, color: "bg-violet-500" },
                ].map((m) => (
                  <div key={m.l}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-600">{m.l}</span>
                      <span className="font-semibold text-slate-900">{m.v}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Regional Readiness Heatmap</h3>
              <a className="text-xs text-blue-600 font-medium">View Details →</a>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] text-slate-500 uppercase">
                  <th className="text-left font-medium pb-2">Region</th>
                  <th className="text-right font-medium pb-2">Users</th>
                  <th className="text-right font-medium pb-2">Provisioned</th>
                  <th className="text-right font-medium pb-2">Readiness</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((r) => (
                  <tr key={r.region} className="border-t border-slate-100">
                    <td className="py-2 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${r.dot}`} />
                      {r.region}
                    </td>
                    <td className="py-2 text-right text-slate-700">{r.users}</td>
                    <td className="py-2 text-right text-slate-700">{r.prov}</td>
                    <td className={`py-2 text-right font-bold ${r.readiness >= 80 ? "text-emerald-600" : r.readiness >= 70 ? "text-amber-600" : "text-red-600"}`}>{r.readiness}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-3 flex-wrap">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />80%+</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-300" />60% – 79%</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />40% – 59%</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />&lt; 40%</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300" />No Data</span>
            </div>
          </div>

          {/* Insights */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Program Insights & Alerts</h3>
              <a className="text-xs text-blue-600 font-medium">View All →</a>
            </div>
            <div className="space-y-3">
              {insights.map((it) => {
                const Icon = it.icon;
                return (
                  <div key={it.title} className="flex items-start gap-3 text-xs">
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${it.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{it.title}</div>
                      <div className="text-[11px] text-slate-500">{it.sub}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{it.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Outcome strip */}
        <div className="rounded-xl border border-slate-200 bg-blue-50/40 p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
          {outcomes.map((o) => {
            const Icon = o.icon;
            return (
              <div key={o.title} className="flex items-start gap-3">
                <Icon className={`h-6 w-6 ${o.color} shrink-0`} />
                <div>
                  <div className="text-[11px] font-bold text-slate-900 tracking-wide">{o.title}</div>
                  <div className="text-[11px] text-slate-600 leading-tight">{o.l1}</div>
                  {o.l2 && <div className="text-[11px] text-slate-600 leading-tight">{o.l2}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </AppShell>
  );
}
