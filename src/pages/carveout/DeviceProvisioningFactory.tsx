import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Package, ShoppingCart, Image as ImageIcon, Truck, CheckCircle, Gauge, Activity, Bot,
  AlertTriangle, Info, ShieldAlert, Workflow, Zap, Globe, Target, BarChart3, Layers,
  FileText, Laptop, Users, ShieldCheck, ClipboardCheck, Rocket,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";

const kpis: KPI[] = [
  { label: "Total Devices in Pipeline", value: "27,870", sub: "Across 5 stages", icon: Layers, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Ordered", value: "13,200", sub: "106% of plan", subColor: "text-emerald-600", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Staged", value: "9,820", sub: "79% of plan", subColor: "text-amber-600", icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Imaged", value: "8,150", sub: "66% of plan", subColor: "text-amber-600", icon: ImageIcon, color: "text-slate-700", bg: "bg-slate-100" },
  { label: "Shipped", value: "6,980", sub: "56% of plan", subColor: "text-indigo-600", icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "Activated", value: "5,720", sub: "46% of plan", subColor: "text-emerald-600", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Throughput / Hour", value: "312", sub: "+8% vs avg", subColor: "text-emerald-600", icon: Activity, color: "text-blue-600", bg: "bg-blue-50", spark: [180,220,260,310,290,330,312] },
  { label: "Throughput / Day", value: "2,496", sub: "Target 2,400", subColor: "text-emerald-600", icon: Gauge, color: "text-emerald-600", bg: "bg-emerald-50", spark: [2200,2350,2480,2410,2580,2496,2640] },
];

const pipeline = [
  { label: "Ordered", value: "13,200", pct: 106, eta: "ETA → Stage: 1.2d", icon: ShoppingCart, color: "bg-blue-500", text: "text-blue-600" },
  { label: "Staged", value: "9,820", pct: 79, eta: "ETA → Image: 0.8d", icon: Package, color: "bg-amber-500", text: "text-amber-600" },
  { label: "Imaged", value: "8,150", pct: 66, eta: "ETA → Ship: 1.4d", icon: ImageIcon, color: "bg-amber-500", text: "text-amber-600" },
  { label: "Shipped", value: "6,980", pct: 56, eta: "ETA → Deliver: 2.1d", icon: Truck, color: "bg-indigo-500", text: "text-indigo-600" },
  { label: "Activated", value: "5,720", pct: 46, eta: "Active in field", icon: CheckCircle, color: "bg-emerald-500", text: "text-emerald-600" },
];

const vendors = [
  { v: "CDW", role: "Procurement", sync: "10:24 AM", orders: 312, ship: 184 },
  { v: "Dell", role: "OEM Feed", sync: "10:22 AM", orders: 580, ship: 412 },
  { v: "HP", role: "OEM Feed", sync: "10:21 AM", orders: 420, ship: 308 },
  { v: "Lenovo", role: "OEM Feed", sync: "10:18 AM", orders: 240, ship: 196 },
  { v: "Microsoft", role: "License", sync: "10:15 AM", orders: 0, ship: 0 },
];

const hourly = Array.from({ length: 24 }, (_, i) => ({
  h: `${i}:00`,
  v: Math.round(180 + Math.sin((i - 6) / 3) * 110 + Math.random() * 30),
}));

const daily = [
  { d: "Mon", v: 2280 }, { d: "Tue", v: 2420 }, { d: "Wed", v: 2510 },
  { d: "Thu", v: 2380 }, { d: "Fri", v: 2680 }, { d: "Sat", v: 2240 }, { d: "Sun", v: 2496 },
];

const automation = [
  { title: "Receive Order",    sub: "From vendor /\nprocurement system",    icon: FileText,        color: "text-slate-600" },
  { title: "Stage Device",     sub: "Asset tag, validation,\ninitial config", icon: Package,         color: "text-amber-600" },
  { title: "Image & Patch",    sub: "OS image, drivers,\npatch baseline",     icon: Laptop,          color: "text-emerald-600" },
  { title: "Domain Join",      sub: "Active Directory /\nAzure AD policy",    icon: Users,           color: "text-blue-600" },
  { title: "Security & Policy",sub: "Endpoint security,\nencryption, policies",icon: ShieldCheck,    color: "text-emerald-600" },
  { title: "Quality Check",    sub: "Compliance &\nhealth validation",        icon: ClipboardCheck,  color: "text-violet-600" },
  { title: "Ship to User",     sub: "Logistics & tracking\nupdate",            icon: Truck,          color: "text-indigo-600" },
  { title: "Activate & Enroll",sub: "User sign-in, MDM\nenroll, secure",       icon: Rocket,         color: "text-emerald-600" },
];

const insights = [
  { icon: AlertTriangle, color: "text-red-500", title: "Imaging backlog spike — APAC", sub: "Surge nodes auto-provisioned", time: "10:28 AM" },
  { icon: Info, color: "text-blue-500", title: "Dell shipment manifest received", sub: "412 units in dispatch queue", time: "10:18 AM" },
  { icon: ShieldAlert, color: "text-amber-500", title: "Patch baseline drift detected", sub: "Image WIN11-2.4.1 — auto-patched", time: "10:11 AM" },
  { icon: CheckCircle, color: "text-emerald-500", title: "Capacity scaling complete", sub: "+3 imaging nodes online", time: "10:05 AM" },
];

const utilization = [
  { name: "Used", value: 72, color: "hsl(217 91% 60%)" },
  { name: "Free", value: 28, color: "hsl(217 30% 90%)" },
];

const outcomes: Outcome[] = [
  { icon: Zap, color: "text-blue-600", title: "SPEED", l1: "6.2 day avg", l2: "cycle time" },
  { icon: Layers, color: "text-emerald-600", title: "SCALE", l1: "27,870 devices", l2: "in flight" },
  { icon: ShieldAlert, color: "text-indigo-600", title: "RELIABILITY", l1: "95.4% on-time", l2: "activation" },
  { icon: Bot, color: "text-violet-600", title: "INTELLIGENCE", l1: "AI self-heals", l2: "bottlenecks" },
  { icon: Globe, color: "text-blue-600", title: "GLOBAL EXECUTION", l1: "5 regions, 9.1k", l2: "sites covered" },
  { icon: Target, color: "text-emerald-600", title: "OUTCOME", l1: "Industrialized,", l2: "predictable factory" },
];

export default function DeviceProvisioningFactory() {
  return (
    <DashShell
      title="DEVICE PROVISIONING FACTORY"
      highlight="(GLOBAL VIEW)"
      subtitle="Industrialized. Automated. Intelligent."
      wwh={{
        what: [
          "End-to-end device provisioning pipeline across procurement → activation",
          "Throughput, capacity, and SLA performance",
          "Vendor and OEM integration health",
          "Automation flow status and digital coworker actions",
          "Backlog, surge control, and predicted delays",
        ],
        why: [
          "Day 1 productivity depends on devices arriving on time",
          "Industrialized pipeline removes manual bottlenecks",
          "Real-time capacity scaling prevents Day 1 backlog",
          "Vendor visibility ensures supply continuity",
          "Cost predictability and audit-ready execution",
        ],
        how: [
          "Integrated feeds from CDW, Dell, HP, Lenovo, Microsoft licensing",
          "Automated 8-step workflow with AI quality checks",
          "Surge orchestration (auto-add imaging nodes when load > 75%)",
          "Digital Coworker monitors flow, predicts and resolves issues",
          "Real-time dashboards updated every 5 minutes",
        ],
      }}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Pipeline + summary */}
      <Section title="Device Provisioning Pipeline" className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
          {pipeline.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.label} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${p.text}`} />
                  <span className="text-[11px] font-semibold text-slate-700">{p.label}</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{p.value}</div>
                <div className={`text-[10px] ${p.text}`}>{p.pct}% of plan</div>
                <div className="text-[10px] text-slate-500 mt-1">{p.eta}</div>
                <div className="h-1 mt-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${p.color}`} style={{ width: `${Math.min(p.pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          {[
            { l: "Avg Cycle Time", v: "6.2 d" },
            { l: "Median", v: "5.4 d" },
            { l: "On-Time Activation", v: "95.4%", c: "text-emerald-600" },
            { l: "Backlog", v: "4,670", c: "text-amber-600" },
            { l: "Devices at Risk", v: "210", c: "text-red-600" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg bg-slate-50 border border-slate-100 p-2">
              <div className="text-[10px] text-slate-500">{s.l}</div>
              <div className={`text-base font-bold ${s.c ?? "text-slate-900"}`}>{s.v}</div>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Vendor Integrations">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-slate-500 uppercase">
              <tr className="border-b border-slate-100">
                <th className="text-left py-1.5">Vendor</th>
                <th className="text-left">Role</th>
                <th className="text-left">Status</th>
                <th className="text-right">Today</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v, i) => (
                <tr key={v.v} className={`border-b border-slate-50 ${i % 2 ? "bg-slate-50/40" : ""}`}>
                  <td className="py-1.5 font-semibold">{v.v}</td>
                  <td className="text-slate-600">{v.role}</td>
                  <td><StatusPill status="Connected" /></td>
                  <td className="text-right text-slate-700">{v.orders}o / {v.ship}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Throughput (Devices / Hour)">
          <div className="h-44">
            <ResponsiveContainer>
              <LineChart data={hourly}>
                <XAxis dataKey="h" tick={{ fontSize: 9 }} interval={3} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Current: <b className="text-slate-900">312</b> · Peak: 412 · Trough: 184</div>
        </Section>

        <Section title="Throughput (Devices / Day) — 7-Day Trend">
          <div className="h-44">
            <ResponsiveContainer>
              <BarChart data={daily}>
                <XAxis dataKey="d" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip />
                <Bar dataKey="v" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Automation Flow (Process Steps)" action="View Workflow →" className="lg:col-span-2">
          <div className="grid grid-cols-8 gap-1 items-start">
            {automation.map((s, i) => {
              const I = s.icon;
              return (
                <div key={s.title} className="relative flex flex-col items-center text-center px-1">
                  {/* connector */}
                  {i < automation.length - 1 && (
                    <div className="absolute top-3 left-1/2 w-full h-px bg-slate-200">
                      <span className="absolute right-[-4px] -top-[5px] text-slate-300 text-[10px] leading-none">▶</span>
                    </div>
                  )}
                  {/* step number */}
                  <div className="relative z-10 h-6 w-6 rounded-full bg-blue-600 text-white text-[11px] font-bold grid place-items-center shadow-sm">
                    {i + 1}
                  </div>
                  {/* icon */}
                  <I className={`h-6 w-6 mt-2 ${s.color}`} />
                  {/* title */}
                  <div className="mt-1.5 text-[11px] font-semibold text-slate-900 leading-tight">{s.title}</div>
                  {/* subtitle */}
                  <div className="mt-0.5 text-[9px] text-slate-500 leading-snug whitespace-pre-line">{s.sub}</div>
                  {/* automated pill */}
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700">
                    <CheckCircle className="h-2.5 w-2.5" /> Automated
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l: "Auto-Remediations", v: "24", c: "text-emerald-600", i: Bot },
              { l: "Bottlenecks Resolved", v: "11", c: "text-blue-600", i: Activity },
              { l: "Capacity Actions", v: "3", c: "text-violet-600", i: Layers },
              { l: "Predicted Delays Prevented", v: "17", c: "text-amber-600", i: ShieldAlert },
            ].map((s) => {
              const I = s.i;
              return (
                <div key={s.l} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500"><I className={`h-3.5 w-3.5 ${s.c}`} /> {s.l}</div>
                  <div className={`text-xl font-bold ${s.c}`}>{s.v}</div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Peak Capacity Utilization">
          <div className="relative h-40">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={utilization} dataKey="value" innerRadius={50} outerRadius={70} startAngle={90} endAngle={-270}>
                  {utilization.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">72%</div>
                <div className="text-[10px] text-slate-500">Utilized</div>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-600 space-y-0.5">
            <div>Max Capacity: <b>4,300/day</b></div>
            <div>Current Rate: <b>2,496/day</b></div>
            <div>Headroom: <b className="text-emerald-600">28%</b></div>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Digital Coworker — Live">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-violet-50 grid place-items-center">
              <Bot className="h-7 w-7 text-violet-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">EUC-FactoryBot</div>
              <div className="text-[11px] text-emerald-600 font-semibold">● Active — monitoring pipeline health</div>
            </div>
          </div>
          <ul className="mt-3 text-[11px] text-slate-700 space-y-1.5 list-disc list-inside">
            <li>Auto-scaled imaging cluster +3 nodes</li>
            <li>Re-routed APAC orders → KR DC</li>
            <li>Pre-staged 220 devices for Wave 4</li>
            <li>Patched baseline drift on 84 images</li>
          </ul>
        </Section>

        <Section title="Backlog & Surge Control">
          <div className="text-3xl font-bold text-amber-600">4,670</div>
          <div className="text-[11px] text-slate-500 mb-3">devices in backlog</div>
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 mb-2">
            <span className="text-xs font-semibold text-emerald-700">Surge Scaling</span>
            <StatusPill status="ACTIVE" />
          </div>
          <div className="text-[11px] text-slate-700">Scaling Actions Today</div>
          <div className="text-base font-bold text-blue-600">+3 imaging nodes</div>
          <div className="text-[10px] text-slate-500 mt-1">Predicted clearance: 36 hrs</div>
        </Section>

        <Section title="Alerts & Notifications">
          <ul className="space-y-2.5">
            {insights.map((a) => {
              const I = a.icon;
              return (
                <li key={a.title} className="flex items-start gap-2.5 text-xs">
                  <I className={`h-4 w-4 ${a.color} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{a.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{a.sub}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{a.time}</span>
                </li>
              );
            })}
          </ul>
        </Section>
      </div>
    </DashShell>
  );
}