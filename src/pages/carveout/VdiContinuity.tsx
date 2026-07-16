import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Users, Monitor, Cloud, Clock, RefreshCw, TrendingUp, ShieldCheck,
  UserPlus, ScanSearch, CloudOff, Lock, MonitorCheck, Laptop, CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid,
} from "recharts";

const kpis: KPI[] = [
  { label: "Total Users in Scope", value: "8,000", sub: "100%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "On Physical Devices", value: "6,240", sub: "78%", subColor: "text-emerald-600", icon: Monitor, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "On VDI (Active)", value: "1,360", sub: "17%", subColor: "text-violet-600", icon: Cloud, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Awaiting Devices (On VDI)", value: "400", sub: "5%", subColor: "text-amber-600", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Total VDI Capacity", value: "2,000", sub: "100%", subColor: "text-blue-600", icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Capacity Utilization", value: "68%", sub: "Normal", subColor: "text-emerald-600", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Continuity Readiness", value: "94%", sub: "Good", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const access = [
  { name: "On Physical Devices", value: 6240, pct: "78%", color: "hsl(142 71% 45%)" },
  { name: "On VDI (Active)", value: 1360, pct: "17%", color: "hsl(262 83% 58%)" },
  { name: "Awaiting Devices (On VDI)", value: 400, pct: "5%", color: "hsl(38 92% 50%)" },
];

const logon = Array.from({ length: 24 }, (_, i) => ({
  h: `${i}`,
  v: 18 + Math.round(Math.sin(i / 2) * 4 + Math.random() * 6),
}));

const capTrend = [
  { d: "Feb 7", v: 52 }, { d: "Feb 8", v: 58 }, { d: "Feb 9", v: 65 },
  { d: "Feb 10", v: 70 }, { d: "Feb 11", v: 72 }, { d: "Feb 12", v: 68 }, { d: "Feb 13", v: 68 },
];

const regions = [
  { r: "North America", v: 490, pct: 45 },
  { r: "Europe", v: 600, pct: 30 },
  { r: "Asia Pacific", v: 340, pct: 17 },
  { r: "Latin America", v: 150, pct: 8 },
];

const mitigation = [
  { l: "VDI (Full Desktop)", v: 320, pct: 80 },
  { l: "VDI (Application)", v: 60, pct: 15 },
  { l: "Cloud Apps / Web", v: 20, pct: 5 },
];

const apps = [
  { a: "Microsoft 365", users: "1,120", pct: "82%", st: "Good" },
  { a: "SAP", users: "420", pct: "31%", st: "Good" },
  { a: "Salesforce", users: "360", pct: "26%", st: "Good" },
  { a: "Workday", users: "280", pct: "21%", st: "Good" },
  { a: "Internal Apps", users: "640", pct: "47%", st: "Good" },
];

const flow = [
  { n: 1, icon: UserPlus, color: "text-blue-600", bg: "bg-blue-100", title: "User Created", sub: "User is created in identity system" },
  { n: 2, icon: ScanSearch, color: "text-emerald-600", bg: "bg-emerald-100", title: "Device Check", sub: "System checks for available device" },
  { n: 3, icon: CloudOff, color: "text-amber-600", bg: "bg-amber-100", title: "No Device Available", sub: "User automatically assigned to VDI" },
  { n: 4, icon: Lock, color: "text-violet-600", bg: "bg-violet-100", title: "Secure Access Provisioned", sub: "MFA, policies, and apps provisioned" },
  { n: 5, icon: MonitorCheck, color: "text-blue-600", bg: "bg-blue-100", title: "User Can Work", sub: "Full access to apps and data on Day 1" },
  { n: 6, icon: Laptop, color: "text-emerald-600", bg: "bg-emerald-100", title: "Device Arrives", sub: "User transitions seamlessly to physical device" },
];

const outcomes: Outcome[] = [
  { icon: Users, color: "text-blue-600", title: "USER CREATED", l1: "Identity system", l2: "onboards user" },
  { icon: ScanSearch, color: "text-emerald-600", title: "DEVICE CHECK", l1: "Auto-detect", l2: "availability" },
  { icon: CloudOff, color: "text-amber-600", title: "NO DEVICE", l1: "Auto-assign", l2: "to VDI" },
  { icon: Lock, color: "text-violet-600", title: "SECURE ACCESS", l1: "MFA + policies", l2: "provisioned" },
  { icon: MonitorCheck, color: "text-blue-600", title: "USER WORKS", l1: "Day 1 access", l2: "guaranteed" },
  { icon: CheckCircle2, color: "text-emerald-600", title: "CONTINUITY", l1: "Every user.", l2: "Every time." },
];

export default function VdiContinuity() {
  return (
    <DashShell
      title="VDI & DAY 1 CONTINUITY LAYER"
      subtitle="Ensuring every user can work on Day 1—no disruption, no delays."
      wwh={{
        what: [
          "Users on VDI vs physical devices",
          "Temporary access provisioning for users awaiting devices",
          "Device shortage mitigation with VDI capacity",
          "VDI session performance and user experience metrics",
          "Real-time visibility into continuity readiness for Day 1",
        ],
        why: [
          "VDI is the bridge that keeps users productive if devices are delayed",
          "Prevents Day 1 disruption and productivity loss",
          "Ensures business continuity during separation and provisioning surges",
          "Provides secure, consistent access to apps and data from anywhere",
          "Reduces risk, support volume, and user frustration",
        ],
        how: [
          "Auto-provision VDI access for users without a ready device",
          "Dynamic capacity scaling based on demand and shortages",
          "Secure access with MFA, least-privilege, and policy enforcement",
          "Real-time monitoring of sessions, performance, and capacity",
          "Agentic automation for issue detection, remediation, and scaling",
        ],
      }}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Users by Access Type | Temporary Access Provisioning | VDI Session Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Users by Access Type" action="">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
              <PieChart width={160} height={160}>
                <Pie data={access} dataKey="value" cx={80} cy={80} innerRadius={50} outerRadius={75} paddingAngle={2}>
                  {access.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-xl font-bold">8,000</div>
                  <div className="text-[10px] text-slate-500">Total Users</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2 text-xs">
              {access.map((a) => (
                <div key={a.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: a.color }} />
                  <span className="flex-1 text-slate-700">{a.name}</span>
                  <span className="font-bold">{a.value.toLocaleString()} ({a.pct})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-2 text-[11px] text-blue-700 text-center">
            All users have access. VDI ensures no productivity gap on Day 1.
          </div>
        </Section>

        <Section title="Temporary Access Provisioning" action="">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <UserPlus className="h-5 w-5 text-violet-600 mx-auto mb-1" />
              <div className="text-lg font-bold">1,760</div>
              <div className="text-[10px] text-slate-500 leading-tight">VDI Access Provisioned</div>
              <div className="text-[10px] text-slate-400">(Last 7 Days)</div>
            </div>
            <div className="text-center">
              <Clock className="h-5 w-5 text-amber-600 mx-auto mb-1" />
              <div className="text-lg font-bold">560</div>
              <div className="text-[10px] text-slate-500 leading-tight">Auto-Provisioned</div>
              <div className="text-[10px] text-slate-400">(Last 7 Days)</div>
              <div className="text-[10px] font-semibold text-amber-600 mt-0.5">32%</div>
            </div>
            <div className="text-center">
              <Users className="h-5 w-5 text-violet-600 mx-auto mb-1" />
              <div className="text-lg font-bold">120</div>
              <div className="text-[10px] text-slate-500 leading-tight">Manual Overrides</div>
              <div className="text-[10px] text-slate-400">(Last 7 Days)</div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5">7%</div>
            </div>
            <div className="text-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-lg font-bold">98%</div>
              <div className="text-[10px] text-slate-500 leading-tight">Provisioning Success Rate</div>
              <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">Target: &gt; 95%</div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 p-2 text-[11px] text-emerald-700 text-center">
            Auto-provisioning ensures rapid, secure access while devices are in transit.
          </div>
        </Section>

        <Section title="VDI Session Performance (Real-Time)">
          <div className="flex items-start justify-between mb-1">
            <div className="text-[11px] text-slate-500">Average Logon Duration (sec)</div>
            <div className="text-right">
              <div className="text-lg font-bold">22 sec</div>
              <div className="text-[10px] font-semibold text-emerald-600">Good</div>
            </div>
          </div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={logon} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <XAxis dataKey="h" tick={{ fontSize: 9 }} interval={5} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}h`} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 60]} ticks={[0, 20, 40, 60]} />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke="hsl(217 91% 60%)" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            <div className="rounded-lg bg-slate-50 p-2">
              <div className="text-[10px] text-slate-500">Protocol Success Rate</div>
              <div className="text-sm font-bold">99.2%</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Good</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <div className="text-[10px] text-slate-500">Avg. Session Latency</div>
              <div className="text-sm font-bold">42 ms</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Good</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <div className="text-[10px] text-slate-500">Active Sessions</div>
              <div className="text-sm font-bold">1,360</div>
              <div className="text-[10px] text-slate-500">of 2,000 capacity</div>
            </div>
          </div>
        </Section>
      </div>

      {/* Row 2: Device Shortage Mitigation | VDI Capacity Overview | Top Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Device Shortage Mitigation">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-slate-500 mb-1">Users Impacted by Shortage</div>
              <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-center">
                <div className="text-2xl font-bold text-amber-700">400</div>
                <div className="text-[10px] text-slate-600">Users on VDI due to Device Shortage</div>
              </div>
              <div className="mt-2 text-[11px]">
                <span className="text-slate-500">Impact Reduced</span>
                <div className="text-lg font-bold text-emerald-600">100%</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-1">Mitigation Breakdown</div>
              <div className="space-y-2">
                {mitigation.map((m) => (
                  <div key={m.l}>
                    <div className="flex justify-between text-[11px]"><span>{m.l}</span><span className="font-semibold">{m.v} ({m.pct}%)</span></div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 p-2 text-[11px] text-amber-700 text-center">
            VDI and cloud access eliminate productivity gaps caused by device delays.
          </div>
        </Section>

        <Section title="VDI Capacity Overview">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-slate-500 mb-1">Capacity by Site/Region</div>
              <div className="space-y-1.5">
                {regions.map((r) => (
                  <div key={r.r}>
                    <div className="flex justify-between text-[11px]"><span>{r.r}</span><span className="font-semibold">{r.v} {r.pct}%</span></div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] text-slate-500">Capacity Trend (Last 7 Days)</div>
                <div className="text-[10px] text-blue-600">Utilization (%)</div>
              </div>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={capTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="d" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="v" stroke="hsl(217 91% 60%)" fill="hsl(217 91% 60% / 0.2)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-2 text-[11px] text-blue-700 text-center">
            Dynamic scaling maintains performance during surges and peaks.
          </div>
        </Section>

        <Section title="Top Applications on VDI">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-slate-500 uppercase">
              <tr className="border-b border-slate-100">
                <th className="text-left py-1.5">Application</th>
                <th className="text-right">Active Users</th>
                <th className="text-right">% of VDI Users</th>
                <th className="text-right pl-2">Performance</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a, i) => (
                <tr key={a.a} className={`border-b border-slate-50 ${i % 2 ? "bg-slate-50/40" : ""}`}>
                  <td className="py-1.5 font-semibold">{a.a}</td>
                  <td className="text-right font-bold">{a.users}</td>
                  <td className="text-right text-slate-600">{a.pct}</td>
                  <td className="text-right pl-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> {a.st}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>

      {/* User Experience Flow */}
      <Section title="User Experience Flow: No Device? No Problem." action="">
        <div className="flex items-center gap-2 overflow-x-auto">
          {flow.map((s, i) => {
            const I = s.icon;
            return (
              <div key={s.n} className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-full ${s.bg} ${s.color} grid place-items-center text-[11px] font-bold shrink-0`}>{s.n}</div>
                  <I className={`h-5 w-5 ${s.color}`} />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-900 leading-tight">{s.title}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{s.sub}</div>
                  </div>
                </div>
                {i < flow.length - 1 && <span className="text-slate-300">→</span>}
              </div>
            );
          })}
          <div className="ml-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 shrink-0 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <div>
              <div className="text-[11px] font-bold text-emerald-700 leading-tight">Business Continuity Guaranteed</div>
              <div className="text-[10px] text-emerald-700">Every user. Every time.</div>
            </div>
          </div>
        </div>
      </Section>
    </DashShell>
  );
}
