import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Monitor, Layers, AlertTriangle, ShieldCheck, ShieldAlert, Database,
  Search, CheckCircle, RefreshCw, Eye, Lock, Zap, Target, TrendingUp,
  Briefcase, FlaskConical, ShoppingBag, Crown, Users,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar,
} from "recharts";

const kpis: KPI[] = [
  { label: "Endpoints Managed", value: "8,000", sub: "100% of target", subColor: "text-emerald-600", icon: Monitor, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Windows 11 Adoption", value: "72%", sub: "5,760 endpoints · ▲ 12% vs last 7 days", subColor: "text-emerald-600", icon: Layers, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Windows 10 Remaining", value: "2,240", sub: "28% of endpoints · ▼ 12% vs last 7 days", subColor: "text-emerald-600", icon: Layers, color: "text-slate-700", bg: "bg-slate-100" },
  { label: "Compliant Endpoints", value: "7,360", sub: "92% compliant · ▲ 3% vs last 7 days", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Drifted Endpoints", value: "640", sub: "8% of endpoints · ▼ 3% vs last 7 days", subColor: "text-emerald-600", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Image Versions", value: "12", sub: "Active", icon: Database, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Critical Patches Missing", value: "48", sub: "0.6% of endpoints", subColor: "text-red-600", icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50" },
];

const upgradeStages = [
  { label: "Assess",    n: "8,000", pct: "100%", icon: Search,      color: "text-slate-500",   bg: "bg-slate-100",   pctColor: "text-slate-600" },
  { label: "Ready",     n: "7,200", pct: "90%",  icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50",  pctColor: "text-emerald-600" },
  { label: "Upgrading", n: "960",   pct: "12%",  icon: RefreshCw,   color: "text-amber-600",   bg: "bg-amber-50",    pctColor: "text-amber-600" },
  { label: "Verifying", n: "480",   pct: "6%",   icon: ShieldCheck, color: "text-violet-600",  bg: "bg-violet-50",   pctColor: "text-violet-600" },
  { label: "Complete",  n: "5,760", pct: "72%",  icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50",  pctColor: "text-emerald-600" },
];

const inventory = [
  { n: "WIN11-ENT-STD",    v: "v3.2.1", os: "Windows 11 23H2", upd: "Feb 12, 2026", patch: "Feb 2026", comp: "98%", dep: "4,320" },
  { n: "WIN11-ENT-SEC",    v: "v2.8.4", os: "Windows 11 23H2", upd: "Feb 10, 2026", patch: "Feb 2026", comp: "99%", dep: "1,920" },
  { n: "WIN10-LTSB-LEGACY",v: "v7.1.0", os: "Windows 10 22H2", upd: "Jan 28, 2026", patch: "Jan 2026", comp: "95%", dep: "1,120" },
  { n: "WIN11-RD-POW",     v: "v1.4.0", os: "Windows 11 23H2", upd: "Feb 11, 2026", patch: "Feb 2026", comp: "97%", dep: "640" },
];

const patchPie = [
  { name: "Compliant", value: 7360, color: "hsl(142 71% 45%)" },
  { name: "Missing Non-Critical", value: 592, color: "hsl(38 92% 50%)" },
  { name: "Missing Critical", value: 48, color: "hsl(0 84% 60%)" },
  { name: "Not Scanned", value: 0, color: "hsl(215 20% 88%)" },
];

const personas = [
  { p: "Corporate", icon: Briefcase,     bundle: "CORP-STD",       apps: 18, dep: "3,120", comp: "96%", color: "text-emerald-500" },
  { p: "Lab / R&D", icon: FlaskConical,  bundle: "LAB-RESEARCH",   apps: 32, dep: "2,080", comp: "95%", color: "text-emerald-500" },
  { p: "Sales",     icon: ShoppingBag,   bundle: "SALES-MOBILITY", apps: 24, dep: "1,360", comp: "97%", color: "text-emerald-500" },
  { p: "Executives",icon: Crown,         bundle: "EXEC-PREMIUM",   apps: 28, dep: "640",   comp: "98%", color: "text-emerald-500" },
  { p: "Shared / Kiosk", icon: Users,    bundle: "SHARED-STD",     apps: 12, dep: "800",   comp: "93%", color: "text-amber-500" },
];

const driftPie = [
  { name: "Security Baseline", value: 210, color: "hsl(0 84% 60%)" },
  { name: "Configuration",     value: 180, color: "hsl(38 92% 50%)" },
  { name: "App Compliance",    value: 120, color: "hsl(28 90% 55%)" },
  { name: "Patch / Updates",   value: 80,  color: "hsl(142 71% 45%)" },
  { name: "Other",             value: 50,  color: "hsl(215 20% 75%)" },
];

const driftCats = [
  { c: "Security Baseline",   ep: 210, pct: "32.8%", color: "bg-red-500" },
  { c: "Configuration Settings", ep: 180, pct: "28.1%", color: "bg-amber-500" },
  { c: "Application Compliance", ep: 120, pct: "18.8%", color: "bg-orange-500" },
  { c: "Patch / Updates",     ep: 80,  pct: "12.5%", color: "bg-emerald-500" },
  { c: "Other",               ep: 50,  pct: "7.8%",  color: "bg-slate-400" },
];

const driftByOs = [
  { name: "Windows 11", value: 380, fill: "hsl(0 84% 60%)" },
  { name: "Windows 10", value: 220, fill: "hsl(38 92% 50%)" },
  { name: "Other",      value: 40,  fill: "hsl(215 20% 75%)" },
];

const driftByDevice = [
  { d: "Laptop",  v: 420, pct: "65.6%", color: "bg-red-500" },
  { d: "Desktop", v: 140, pct: "21.9%", color: "bg-amber-500" },
  { d: "VDI",     v: 60,  pct: "9.4%",  color: "bg-orange-400" },
  { d: "Other",   v: 20,  pct: "3.1%",  color: "bg-emerald-500" },
];

const outcomes: Outcome[] = [
  { icon: Lock,        color: "text-blue-600",    title: "STANDARDIZATION", l1: "Consistent images, policies", l2: "and configurations" },
  { icon: ShieldCheck, color: "text-indigo-600",  title: "SECURITY",        l1: "Hardened baselines and",      l2: "continuous compliance" },
  { icon: RefreshCw,   color: "text-emerald-600", title: "LIFECYCLE MGMT",  l1: "OS transitions and updates",  l2: "at scale" },
  { icon: TrendingUp,  color: "text-violet-600",  title: "OPS EFFICIENCY",  l1: "Reduced effort, fewer",        l2: "incidents, happier users" },
  { icon: Target,      color: "text-emerald-600", title: "BUSINESS IMPACT", l1: "Day 1 readiness, reduced risk,", l2: "audit-ready posture" },
];

function Pill({ v, ok = true }: { v: string; ok?: boolean }) {
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>{v}</span>
  );
}

export default function GoldenImage() {
  return (
    <DashShell
      title="GOLDEN IMAGE & CONFIGURATION CONTROL PLANE"
      subtitle="Standardize. Secure. Compliant. Scaled across every endpoint."
      wwh={{
        what: [
          "Windows 10 → 11 upgrade pipeline and adoption",
          "Golden image versions and patch levels",
          "Application bundles mapped to user personas",
          "Configuration drift detection across endpoints",
          "Compliance and security baseline adherence",
        ],
        why: [
          "Lifecycle transitions must be predictable and standardized",
          "Ensures consistent, secure, and high-performing endpoints",
          "Reduces risk, rework, and user disruption at Day 1 and beyond",
          "Enables audit-ready compliance at scale",
        ],
        how: [
          "Golden image factory with version control and approvals",
          "Automated patching, hardening, and configuration baselines",
          "Persona-driven application bundles and policy assignment",
          "Continuous drift detection and self-healing remediation",
          "Agent-powered insights and exception management",
        ],
      }}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1 — Upgrade Pipeline + Inventory + Patch Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Windows 10 → 11 Upgrade Pipeline">
          <div className="flex items-start justify-between gap-1 mb-3">
            {upgradeStages.map((s, i) => {
              const I = s.icon;
              return (
                <div key={s.label} className="relative flex-1 flex flex-col items-center text-center">
                  {i < upgradeStages.length - 1 && (
                    <div className="absolute top-5 left-1/2 w-full h-px bg-slate-200" />
                  )}
                  <div className={`relative z-10 h-10 w-10 rounded-full ${s.bg} grid place-items-center`}>
                    <I className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div className="mt-1.5 text-[10px] font-semibold text-slate-700">{s.label}</div>
                  <div className="text-sm font-bold text-slate-900">{s.n}</div>
                  <div className={`text-[10px] font-bold ${s.pctColor}`}>{s.pct}</div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-slate-500 mb-1 flex justify-between">
            <span>Overall Progress</span><span className="font-bold text-slate-900">72%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-blue-500" style={{ width: "72%" }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { l: "Upgrade Velocity", v: "240 / day", sub: "7-Day Average" },
              { l: "Est. Completion", v: "Mar 05, 2026", sub: "11 days remaining" },
              { l: "Success Rate", v: "98.6%", sub: "Last 7 days", c: "text-emerald-600" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg bg-slate-50 border border-slate-100 p-2">
                <div className="text-[9px] text-slate-500">{s.l}</div>
                <div className={`text-xs font-bold ${s.c ?? "text-slate-900"}`}>{s.v}</div>
                <div className="text-[9px] text-slate-500">{s.sub}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Golden Image Inventory" action="Manage Images →">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="text-left py-1.5">Image Name</th>
                <th className="text-left">Ver</th>
                <th className="text-left">OS</th>
                <th className="text-left">Updated</th>
                <th className="text-center">Compl</th>
                <th className="text-right">Deployed</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((r) => (
                <tr key={r.n} className="border-b border-slate-50">
                  <td className="py-1.5 font-semibold text-slate-900">{r.n}</td>
                  <td className="text-slate-600">{r.v}</td>
                  <td className="text-slate-600">{r.os}</td>
                  <td className="text-slate-500">{r.upd}</td>
                  <td className="text-center"><Pill v={r.comp} /></td>
                  <td className="text-right font-medium">{r.dep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Patch Compliance Overview">
          <div className="flex items-center gap-3">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={patchPie} dataKey="value" innerRadius={48} outerRadius={70} paddingAngle={1}>
                    {patchPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">92%</div>
                  <div className="text-[10px] text-slate-500">Compliant</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 text-[11px]">
              {[
                { l: "Compliant", v: "7,360", p: "92%", c: "bg-emerald-500" },
                { l: "Missing Non-Critical", v: "592", p: "7%", c: "bg-amber-500" },
                { l: "Missing Critical", v: "48", p: "0.6%", c: "bg-red-500" },
                { l: "Not Scanned", v: "0", p: "0%", c: "bg-slate-300" },
              ].map((r) => (
                <div key={r.l} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${r.c}`} /><span className="text-slate-700">{r.l}</span></span>
                  <span className="flex items-center gap-2"><b className="text-slate-900">{r.v}</b><span className="text-slate-500 w-8 text-right">{r.p}</span></span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[10px]">
            <span><span className="text-slate-500">SLA Target:</span> <b className="text-emerald-600">95%</b></span>
            <span className="text-red-600 font-semibold">At Risk: 48 endpoints</span>
          </div>
        </Section>
      </div>

      {/* Row 2 — Personas + Drift Detection + Drift by OS/Device */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Application Bundles by Persona" action="Manage Bundles →">
          <table className="w-full text-[11px]">
            <thead className="text-[9px] text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="text-left py-1.5">Persona</th>
                <th className="text-left">Bundle</th>
                <th className="text-right">Apps</th>
                <th className="text-right">Deployed</th>
                <th className="text-right">Compl</th>
              </tr>
            </thead>
            <tbody>
              {personas.map((p) => {
                const I = p.icon;
                return (
                  <tr key={p.p} className="border-b border-slate-50">
                    <td className="py-2"><span className="flex items-center gap-1.5"><I className="h-3.5 w-3.5 text-slate-500" /><span className="font-semibold text-slate-900">{p.p}</span></span></td>
                    <td className="text-slate-600">{p.bundle}</td>
                    <td className="text-right">{p.apps}</td>
                    <td className="text-right font-medium">{p.dep}</td>
                    <td className="text-right"><span className="inline-flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${p.color === "text-emerald-500" ? "bg-emerald-500" : "bg-amber-500"}`} /><b>{p.comp}</b></span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>

        <Section title="Configuration Drift Detection">
          <div className="flex items-center gap-3">
            <div className="relative h-36 w-36 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={driftPie} dataKey="value" innerRadius={42} outerRadius={62} paddingAngle={1}>
                    {driftPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900">640</div>
                  <div className="text-[9px] text-slate-500">Drifted<br />Endpoints</div>
                </div>
              </div>
            </div>
            <div className="flex-1 text-[10px]">
              <div className="flex justify-between font-semibold text-slate-500 uppercase mb-1 px-1">
                <span className="flex-1">Top Drift Categories</span>
                <span className="w-10 text-right">Endp</span>
                <span className="w-12 text-right">% Drift</span>
              </div>
              {driftCats.map((c) => (
                <div key={c.c} className="flex items-center gap-2 py-0.5">
                  <div className="flex-1">
                    <div className="text-slate-800 text-[10px] mb-0.5">{c.c}</div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${c.color}`} style={{ width: c.pct }} />
                    </div>
                  </div>
                  <span className="w-10 text-right text-slate-700 font-medium">{c.ep}</span>
                  <span className="w-12 text-right text-slate-600">{c.pct}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-100 text-center">
            <div><div className="flex items-center justify-center gap-1 text-[9px] text-slate-500"><CheckCircle className="h-3 w-3 text-emerald-500" />Auto-Remediated (7d)</div><div className="text-sm font-bold text-emerald-600">420</div></div>
            <div><div className="flex items-center justify-center gap-1 text-[9px] text-slate-500"><RefreshCw className="h-3 w-3 text-amber-500" />Pending Remediation</div><div className="text-sm font-bold text-amber-600">220</div></div>
            <div><div className="flex items-center justify-center gap-1 text-[9px] text-slate-500"><AlertTriangle className="h-3 w-3 text-red-500" />Manual Review</div><div className="text-sm font-bold text-red-600">68</div></div>
          </div>
        </Section>

        <Section title="Drift by OS & Device Type">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-semibold text-slate-500 mb-1">By OS</div>
              <div className="relative h-32">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={driftByOs} dataKey="value" innerRadius={32} outerRadius={50} paddingAngle={1}>
                      {driftByOs.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <div className="text-base font-bold text-slate-900">640</div>
                    <div className="text-[9px] text-slate-500">Drifted</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-[10px] mt-1">
                {driftByOs.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: d.fill }} /><span className="text-slate-700">{d.name}</span></div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 mb-1">By Device Type</div>
              <div className="space-y-2 mt-2">
                {driftByDevice.map((d) => (
                  <div key={d.d}>
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span className="text-slate-700 font-medium">{d.d}</span>
                      <span><b className="text-slate-900">{d.v}</b> <span className="text-slate-500">{d.pct}</span></span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${d.color}`} style={{ width: d.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>
    </DashShell>
  );
}