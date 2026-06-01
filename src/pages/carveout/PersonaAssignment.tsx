import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Users, UserCheck, Laptop, LayoutGrid, ShieldCheck, Clock, FlaskConical, BarChart3,
  Building2, FlameKindling, User, Plus, UserPlus, Filter, Target, Cpu, Rocket,
  ShieldAlert, Wifi, FileCheck, RefreshCw, Save, CheckCircle, Bot, Zap,
  Crosshair, ThumbsUp,
} from "lucide-react";

const kpis: KPI[] = [
  { label: "Total Personas", value: "12", sub: "Active Personas", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Auto-Mapped Users", value: "6,240", sub: "78% of new users (30 days)", subColor: "text-emerald-600", icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Devices Auto-Assigned", value: "6,120", sub: "98% success rate", subColor: "text-emerald-600", icon: Laptop, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Apps Auto-Assigned", value: "18,450", sub: "Across all personas", icon: LayoutGrid, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Compliant Assignments", value: "99%", sub: "Policy-compliant", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Avg. Assignment Time", value: "28 sec", sub: "From user creation to ready", subColor: "text-emerald-600", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
];

const personas = [
  { p: "Lab",       icon: FlaskConical, color: "text-emerald-600", desc: "Laboratory & Instrument Operations", users: "Lab Technicians, Scientists",   dev: "High Performance Laptop", apps: 42, sec: 5, label: "High" },
  { p: "Sales",     icon: BarChart3,    color: "text-blue-600",    desc: "Field Sales & Customer Engagement", users: "Sales Reps, Account Managers",   dev: "Standard Laptop",        apps: 28, sec: 4, label: "Medium-High" },
  { p: "Corporate", icon: Building2,    color: "text-slate-600",   desc: "Corporate Functions (IT, HR, Finance, etc.)", users: "Corporate Users, Back Office", dev: "Standard Laptop",        apps: 22, sec: 3, label: "Medium" },
  { p: "R&D",       icon: FlameKindling,color: "text-orange-600",  desc: "Research & Development Engineers",  users: "R&D Engineers, Researchers",     dev: "Performance Workstation", apps: 55, sec: 5, label: "High" },
  { p: "Executive", icon: User,         color: "text-red-600",     desc: "Executives & Leadership",            users: "Executives, Leadership Team",    dev: "Premium Laptop",         apps: 18, sec: 4, label: "High" },
];

const rules = [
  { name: "Lab Users Rule",       cond: ["Department = Lab", "Location = Global"],          out: ["High Performance Laptop", "Lab App Bundle", "High Security Posture"],         pri: 1 },
  { name: "Sales Users Rule",     cond: ["Role = Sales*", "Location = Any"],                out: ["Standard Laptop", "Sales App Bundle", "Medium-High Security"],                pri: 2 },
  { name: "R&D Engineers Rule",   cond: ["Department = R&D", "Role contains 'Engineer'"],   out: ["Performance Workstation", "R&D App Bundle", "High Security Posture"],          pri: 1 },
  { name: "Corporate Users Rule", cond: ["Department in (IT, HR, Finance, Legal, Marketing)"], out: ["Standard Laptop", "Corporate App Bundle", "Medium Security"],              pri: 3 },
  { name: "Executives Rule",      cond: ["Role in (Executive, VP, Director)", "Location = Any"], out: ["Premium Laptop", "Executive App Bundle", "High Security Posture"],        pri: 1 },
];

const policies = [
  { l: "Data Protection", icon: ShieldAlert, color: "text-blue-600" },
  { l: "Network Access",  icon: Wifi,        color: "text-emerald-600" },
  { l: "Compliance",      icon: FileCheck,   color: "text-violet-600" },
  { l: "Patch Policy",    icon: RefreshCw,   color: "text-amber-600" },
  { l: "Backup Policy",   icon: Save,        color: "text-indigo-600" },
];

const flow = [
  { n: 1, t: "New User Created",      sub: "User is created in HRIS / AD\nor Identity System",            icon: UserPlus,   color: "text-blue-600",    bg: "bg-blue-100" },
  { n: 2, t: "Attributes Evaluated",  sub: "Role, Department, Location,\nManager, Compliance needs\nare evaluated", icon: Filter, color: "text-emerald-600", bg: "bg-emerald-100" },
  { n: 3, t: "Persona Matched",       sub: "Best fit persona selected\nby rules engine with\nconfidence score", icon: Target, color: "text-amber-600",   bg: "bg-amber-100" },
  { n: 4, t: "Device & Apps Assigned",sub: "Device type, applications,\nand security posture\nauto-assigned", icon: Laptop, color: "text-blue-600",    bg: "bg-blue-100" },
  { n: 5, t: "Config Generated",      sub: "Policies, profiles, and\nsettings applied automatically\nto the device", icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-100" },
  { n: 6, t: "Ready for User",        sub: "Device shipped or ready in\nVDI. User is productive\nfrom Day 1", icon: Rocket, color: "text-emerald-600", bg: "bg-emerald-100" },
];

const insights = [
  { l: "Mapping Accuracy",    v: "96%",  delta: "▲ 3% vs prior 30 days",   icon: Crosshair, color: "text-blue-600" },
  { l: "Auto-Assignment Rate",v: "78%",  delta: "▲ 5% vs prior 30 days",   icon: Clock,     color: "text-emerald-600" },
  { l: "Reassignment Rate",   v: "2.1%", delta: "▼ 0.6% vs prior 30 days", icon: RefreshCw, color: "text-amber-600" },
  { l: "User Satisfaction",   v: "4.6 / 5", delta: "▲ 0.4 vs prior 30 days", icon: ThumbsUp, color: "text-violet-600" },
];

const outcomes: Outcome[] = [
  { icon: Target,      color: "text-blue-600",    title: "ACCURACY",       l1: "99% policy-compliant assignments" },
  { icon: Zap,         color: "text-amber-600",   title: "SPEED",          l1: "28 sec average from creation to ready" },
  { icon: LayoutGrid,  color: "text-emerald-600", title: "SCALE",          l1: "12 personas across the organization" },
  { icon: Bot,         color: "text-violet-600",  title: "AUTOMATION",     l1: "78% of new users auto-mapped" },
  { icon: ShieldCheck, color: "text-indigo-600",  title: "COMPLIANCE",     l1: "Security posture inherited by design" },
  { icon: ThumbsUp,    color: "text-emerald-600", title: "USER EXPERIENCE",l1: "4.6 / 5 satisfaction, Day 1 productivity" },
];

function SecurityDots({ filled, label }: { filled: number; label: string }) {
  const tone = label === "High" ? "bg-emerald-500" : label === "Medium-High" ? "bg-emerald-400" : "bg-amber-400";
  return (
    <div className="flex flex-col items-start">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${i < filled ? tone : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="text-[9px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

export default function PersonaAssignment() {
  return (
    <DashShell
      title="PERSONA-BASED DEVICE ASSIGNMENT ENGINE"
      subtitle="Intelligent Mapping. Automatic Assignment. Consistent Experience."
      wwh={{
        what: [
          "User personas (Lab, Sales, Corporate, R&D, etc.)",
          "Auto-assigned device type, applications, and security posture",
          "Policy inheritance based on location, role, and compliance",
          "Real-time mapping decisions and assignment outcomes",
        ],
        why: [
          "Ensures the right device and configuration for every user, every time",
          "Eliminates manual mapping and errors",
          "Enforces security and compliance by design",
          "Accelerates onboarding and improves user productivity",
        ],
        how: [
          "Rules engine evaluates user attributes (role, location, department, etc.)",
          "Persona library defines device profiles, apps, and security baselines",
          "Policies inherited automatically (security, network, data, compliance)",
          "Continuous optimization and feedback from usage and posture data",
        ],
      }}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1 — Persona Library + Mapping Rules + Assignment Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        <Section title="Persona Library" action="View All Personas →" className="lg:col-span-5">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="text-left py-1.5">Persona</th>
                <th className="text-left">Description</th>
                <th className="text-left">Typical Users</th>
                <th className="text-left">Default Device</th>
                <th className="text-center">Apps</th>
                <th className="text-left pl-2">Security</th>
              </tr>
            </thead>
            <tbody>
              {personas.map((p) => {
                const I = p.icon;
                return (
                  <tr key={p.p} className="border-b border-slate-50 align-top">
                    <td className="py-2"><span className="flex items-center gap-1.5"><I className={`h-3.5 w-3.5 ${p.color}`} /><span className={`font-semibold ${p.color}`}>{p.p}</span></span></td>
                    <td className="text-slate-700 pr-2">{p.desc}</td>
                    <td className="text-slate-600 pr-2">{p.users}</td>
                    <td className="text-slate-700 pr-2">{p.dev}</td>
                    <td className="text-center text-slate-700 font-medium">{p.apps}</td>
                    <td className="pl-2"><SecurityDots filled={p.sec} label={p.label} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-blue-600 font-semibold py-1.5 hover:bg-blue-50 rounded-lg">
            <Plus className="h-3.5 w-3.5" /> Add Persona
          </button>
        </Section>

        <Section title="Mapping Rules Overview" action="View All Rules →" className="lg:col-span-4">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="text-left py-1.5">Rule Name</th>
                <th className="text-left">Conditions (IF)</th>
                <th className="text-left">Outcome (THEN)</th>
                <th className="text-center">Pri</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.name} className="border-b border-slate-50 align-top">
                  <td className="py-2 font-semibold text-slate-900 pr-2">{r.name}</td>
                  <td className="pr-2">
                    {r.cond.map((c) => <div key={c} className="text-slate-700 leading-tight text-[10px]">{c}</div>)}
                  </td>
                  <td className="pr-2">
                    {r.out.map((c) => <div key={c} className="text-slate-700 leading-tight text-[10px]">{c}</div>)}
                  </td>
                  <td className="text-center font-bold text-slate-700">{r.pri}</td>
                  <td className="text-center"><span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-blue-600 font-semibold py-1.5 hover:bg-blue-50 rounded-lg">
            <Plus className="h-3.5 w-3.5" /> Add Rule
          </button>
        </Section>

        <Section title="Persona Assignment Preview" action="View User →" className="lg:col-span-3">
          <div className="flex items-start gap-2 mb-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-200 to-violet-300 grid place-items-center text-violet-700 font-bold">JS</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-900">Jane Smith</div>
              <div className="text-[10px] text-blue-600 truncate">jane.smith@waters.com</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Boston, MA · R&D · Principal Scientist</div>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
              <CheckCircle className="h-2.5 w-2.5" /> Auto-Mapped
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
              <div className="text-[9px] text-slate-500 font-semibold uppercase">Matched Persona</div>
              <div className="flex items-center gap-1.5 mt-1">
                <FlameKindling className="h-4 w-4 text-orange-600" />
                <span className="font-bold text-slate-900 text-sm">R&D</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-1">Confidence Score: <b className="text-emerald-600">96%</b></div>
              <div className="h-1 bg-slate-200 rounded-full overflow-hidden mt-0.5"><div className="h-full bg-emerald-500" style={{ width: "96%" }} /></div>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
              <div className="text-[9px] text-slate-500 font-semibold uppercase">Assigned Device</div>
              <div className="flex items-center gap-1.5 mt-1">
                <Laptop className="h-4 w-4 text-blue-600" />
                <span className="font-bold text-slate-900 text-[11px]">Performance WS</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-1">(WKS-PERF-16) · Win 11 Pro</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="text-[9px] text-slate-500 font-semibold uppercase mb-1">Apps (Sample)</div>
              <div className="flex items-center gap-1 flex-wrap">
                {["O","X","P","T","T"].map((c, i) => (
                  <span key={i} className="h-5 w-5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold grid place-items-center">{c}</span>
                ))}
                <span className="text-[10px] font-bold text-slate-600">+50</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 font-semibold uppercase mb-1">Security Posture</div>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4].map((i) => <span key={i} className="h-2 w-2 rounded-full bg-emerald-500" />)}
                <span className="h-2 w-2 rounded-full bg-slate-200" />
                <span className="text-[10px] font-bold text-emerald-700 ml-1">High</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">EDR, Full Disk Enc., MFA, DLP</div>
            </div>
          </div>

          <div>
            <div className="text-[9px] text-slate-500 font-semibold uppercase mb-1.5">Policies Inherited</div>
            <div className="grid grid-cols-5 gap-1">
              {policies.map((p) => {
                const I = p.icon;
                return (
                  <div key={p.l} className="flex flex-col items-center text-center">
                    <div className="h-7 w-7 rounded-full bg-slate-100 grid place-items-center"><I className={`h-3.5 w-3.5 ${p.color}`} /></div>
                    <div className="text-[8px] text-slate-600 mt-1 leading-tight">{p.l}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>
      </div>

      {/* Row 2 — User Flow + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        <Section title="User Flow: New User → Auto-Mapped → Device + Config Generated" action="View Workflow →" className="lg:col-span-9">
          <div className="flex items-start gap-1 overflow-x-auto">
            {flow.map((s, i) => {
              const I = s.icon;
              return (
                <div key={s.n} className="relative flex-1 min-w-[110px] flex flex-col items-center text-center px-1">
                  {i < flow.length - 1 && (
                    <div className="absolute top-3 left-1/2 w-full h-px bg-slate-200">
                      <span className="absolute right-[-4px] -top-[5px] text-slate-300 text-[10px] leading-none">▶</span>
                    </div>
                  )}
                  <div className={`relative z-10 h-6 w-6 rounded-full ${s.bg} ${s.color} text-[11px] font-bold grid place-items-center`}>
                    {s.n}
                  </div>
                  <I className={`h-6 w-6 mt-2 ${s.color}`} />
                  <div className="mt-1.5 text-[11px] font-semibold text-slate-900 leading-tight">{s.t}</div>
                  <div className="mt-0.5 text-[9px] text-slate-500 leading-snug whitespace-pre-line">{s.sub}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 flex items-center gap-2">
            <Bot className="h-4 w-4 text-emerald-700 shrink-0" />
            <span className="text-[11px] text-slate-700"><b className="text-emerald-700">Digital Coworker:</b> Continuously learns from user behavior and feedback to improve mapping accuracy and optimize experience.</span>
          </div>
        </Section>

        <Section title="Assignment Insights (Last 30 Days)" action="View Report →" className="lg:col-span-3">
          <div className="grid grid-cols-2 gap-3">
            {insights.map((i) => {
              const I = i.icon;
              return (
                <div key={i.l} className="text-center">
                  <div className="h-9 w-9 mx-auto rounded-full bg-slate-50 grid place-items-center">
                    <I className={`h-5 w-5 ${i.color}`} />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1.5 leading-tight">{i.l}</div>
                  <div className="text-lg font-bold text-slate-900 leading-none mt-1">{i.v}</div>
                  <div className="text-[9px] text-emerald-600 mt-1 leading-tight">{i.delta}</div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </DashShell>
  );
}