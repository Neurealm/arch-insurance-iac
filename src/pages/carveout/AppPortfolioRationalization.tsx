import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Boxes, Activity, CloudUpload, ArrowLeftRight, Trash2, Building2, DollarSign,
  Cloud, Code2, Trash, ArrowUp, ArrowDown, Minus, CheckCircle2, AlertCircle, XCircle,
  Gauge, AlertTriangle, BarChart3, Info,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, ScatterChart, Scatter, XAxis, YAxis, ZAxis,
} from "recharts";

const kpis: KPI[] = [
  { label: "Total Applications",   value: "312",    sub: "100% Inventoried",   subColor: "text-emerald-600", icon: Boxes,         color: "text-blue-600",    bg: "bg-blue-50" },
  { label: "Business Critical",    value: "86",     sub: "28% of Portfolio",   subColor: "text-red-600",     icon: Activity,      color: "text-red-600",     bg: "bg-red-50" },
  { label: "In Scope for Migration", value: "214",  sub: "69% of Portfolio",   subColor: "text-violet-600",  icon: CloudUpload,   color: "text-violet-600",  bg: "bg-violet-50" },
  { label: "Migration Candidates", value: "178",    sub: "83% of In Scope",    subColor: "text-cyan-600",    icon: ArrowLeftRight,color: "text-cyan-600",    bg: "bg-cyan-50" },
  { label: "Retire Candidates",    value: "28",     sub: "9% of In Scope",     subColor: "text-amber-600",   icon: Trash2,        color: "text-amber-600",   bg: "bg-amber-50" },
  { label: "Retain On-Prem",       value: "36",     sub: "17% of In Scope",    subColor: "text-slate-600",   icon: Building2,     color: "text-slate-600",   bg: "bg-slate-50" },
  { label: "Estimated 3-Year Savings", value: "$24.7M", sub: "Potential Savings", subColor: "text-emerald-600", icon: DollarSign,  color: "text-emerald-600", bg: "bg-emerald-50" },
];

const wwh = {
  what: [
    "Application inventory and classification",
    "Rationalization decisions: Rehost, Refactor, Retire, Retain",
    "Dependency-aware migration recommendations",
    "Cost vs performance vs risk trade-offs",
  ],
  why: ["Wrong migration decisions create long-term cost, performance, and complexity. This engine provides data-driven recommendations to optimize business outcomes."],
  how: [
    "Analyze application characteristics, dependencies, and usage",
    "Score against cost, performance, risk, and business value",
    "Recommend the optimal migration path",
    "Model future-state costs, benefits, and risks",
  ],
};

const outcomes: Outcome[] = [
  { icon: Info, color: "text-blue-600", title: "RECOMMENDATIONS", l1: "Recommendations are based on current data and may change as application usage, business priorities, and technology evolve." },
];

const tiers = [
  { name: "Tier 1 - Mission Critical", value: 86,  pct: 28, color: "hsl(0 84% 60%)" },
  { name: "Tier 2 - Important",        value: 112, pct: 36, color: "hsl(38 92% 50%)" },
  { name: "Tier 3 - Standard",         value: 78,  pct: 25, color: "hsl(142 71% 45%)" },
  { name: "Tier 4 - Low Value",        value: 36,  pct: 11, color: "hsl(262 83% 58%)" },
];

const decisions = [
  { k: "REHOST",   sub: "Lift & Shift",            v: 96, pct: 31, icon: Cloud,  color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200",
    why: "Move to cloud with minimal changes", best: "Best for stable, low-complexity applications" },
  { k: "REFACTOR", sub: "Optimize / Modernize",    v: 54, pct: 17, icon: Code2,  color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200",
    why: "Modify to improve scalability, performance, or reduce cost", best: "Best for long-term value realization" },
  { k: "RETIRE",   sub: "Decommission",            v: 28, pct: 9,  icon: Trash,  color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200",
    why: "No longer used or business value is low", best: "Saves cost and reduces risk" },
];

const drivers = [
  { l: "Cost",           v: "30%", icon: DollarSign,    c: "text-blue-600",    bg: "bg-blue-50" },
  { l: "Performance",    v: "25%", icon: Gauge,         c: "text-emerald-600", bg: "bg-emerald-50" },
  { l: "Risk",           v: "25%", icon: AlertTriangle, c: "text-amber-600",   bg: "bg-amber-50" },
  { l: "Business Value", v: "20%", icon: BarChart3,     c: "text-violet-600",  bg: "bg-violet-50" },
];

const topApps = [
  { app: "LMS",                 crit: "Tier 1", env: "On-Prem", path: "Rehost",   pc: "bg-blue-100 text-blue-700",      conf: "High",   cost: "-$2.1M", perf: "↑ High",   pc2: "text-red-600",   risk: "Medium", rc: "text-amber-600", deps: 12, note: "Stable, Lift & Shift" },
  { app: "ERP",                 crit: "Tier 1", env: "On-Prem", path: "Refactor", pc: "bg-emerald-100 text-emerald-700",conf: "High",   cost: "-$5.4M", perf: "↑ High",   pc2: "text-red-600",   risk: "High",   rc: "text-red-600",   deps: 28, note: "Refactor to Cloud-Native" },
  { app: "HR Portal",           crit: "Tier 2", env: "On-Prem", path: "Rehost",   pc: "bg-blue-100 text-blue-700",      conf: "Medium", cost: "-$0.8M", perf: "↑ Medium", pc2: "text-amber-600", risk: "Low",    rc: "text-emerald-600", deps: 6, note: "Web Tier Only" },
  { app: "Legacy Reporting",    crit: "Tier 3", env: "On-Prem", path: "Retire",   pc: "bg-amber-100 text-amber-700",    conf: "High",   cost: "-$1.7M", perf: "—",        pc2: "text-slate-500", risk: "Low",    rc: "text-emerald-600", deps: 2, note: "Low Usage" },
  { app: "File Services",       crit: "Tier 3", env: "On-Prem", path: "Retain",   pc: "bg-violet-100 text-violet-700",  conf: "High",   cost: "$0",     perf: "—",        pc2: "text-slate-500", risk: "Medium", rc: "text-amber-600", deps: 8, note: "NAS dependency" },
  { app: "Manufacturing App",   crit: "Tier 1", env: "On-Prem", path: "Retain",   pc: "bg-violet-100 text-violet-700",  conf: "Medium", cost: "$0",     perf: "—",        pc2: "text-slate-500", risk: "High",   rc: "text-red-600",   deps: 14, note: "Real-time / OT constraint" },
  { app: "Training Portal",     crit: "Tier 2", env: "SaaS",    path: "Rehost",   pc: "bg-blue-100 text-blue-700",      conf: "High",   cost: "-$0.3M", perf: "↑ Medium", pc2: "text-amber-600", risk: "Low",    rc: "text-emerald-600", deps: 2, note: "SaaS to Cloud" },
  { app: "Old Finance System",  crit: "Tier 4", env: "On-Prem", path: "Retire",   pc: "bg-amber-100 text-amber-700",    conf: "High",   cost: "-$0.9M", perf: "—",        pc2: "text-slate-500", risk: "Low",    rc: "text-emerald-600", deps: 0, note: "No Usage in 12+ Months" },
];

const tco = [
  { l: "Total 3-Year TCO (Current State)",     v: "$68.4M" },
  { l: "Total 3-Year TCO (Recommended State)", v: "$43.7M" },
  { l: "Total Cost Savings",                   v: "$24.7M" },
  { l: "Savings %",                            v: "36%" },
];

const recs = [
  { i: CheckCircle2, c: "text-emerald-600", t: "150 applications recommended for migration (Rehost + Refactor)" },
  { i: AlertCircle,  c: "text-amber-600",   t: "28 applications identified for retirement" },
  { i: AlertCircle,  c: "text-violet-600",  t: "36 applications to remain on-premises" },
  { i: Info,         c: "text-blue-600",    t: "Estimated 3-year savings of $24.7M with reduced risk and higher performance" },
];

const readiness = [
  { name: "Ready",      value: 78, pct: 36, color: "hsl(142 71% 45%)" },
  { name: "Needs Work", value: 86, pct: 40, color: "hsl(38 92% 50%)" },
  { name: "Not Ready",  value: 50, pct: 24, color: "hsl(0 84% 60%)" },
];

const gaps = [
  { l: "Data Quality",            v: 30, color: "hsl(0 84% 60%)" },
  { l: "Integration Complexity",  v: 26, color: "hsl(0 84% 60%)" },
  { l: "Security & Compliance",   v: 22, color: "hsl(38 92% 50%)" },
  { l: "Application Dependencies",v: 18, color: "hsl(38 92% 50%)" },
  { l: "Technical Debt",          v: 14, color: "hsl(38 92% 50%)" },
];

const bubbles = {
  Rehost:   [{x:25,y:65,z:160},{x:55,y:75,z:200},{x:40,y:55,z:140}],
  Refactor: [{x:65,y:80,z:240},{x:75,y:70,z:180}],
  Retire:   [{x:15,y:25,z:120},{x:25,y:30,z:100}],
  Retain:   [{x:35,y:35,z:140},{x:50,y:40,z:160},{x:60,y:30,z:120}],
};

export default function AppPortfolioRationalization() {
  return (
    <DashShell
      title="APPLICATION PORTFOLIO RATIONALIZATION & MIGRATION DECISION ENGINE"
      subtitle="Intelligent decisions for what moves, what changes, what stays, and what goes"
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Classification */}
        <Section title="Application Classification" className="lg:col-span-3">
          <div className="grid grid-cols-2 gap-2 items-center">
            <div className="relative h-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={tiers} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                    {tiers.map((t) => <Cell key={t.name} fill={t.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-base font-bold text-slate-900">312</div>
                  <div className="text-[9px] text-slate-500">Total</div>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {tiers.map((t) => (
                <div key={t.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: t.color }} />
                  <div className="min-w-0">
                    <div className="text-slate-700 truncate text-[10px]">{t.name}</div>
                  </div>
                  <span className="ml-auto font-semibold text-slate-900 text-[10px]">{t.value} ({t.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Decisions overview */}
        <Section title="Rationalization Decisions Overview" className="lg:col-span-6">
          <div className="grid grid-cols-3 gap-2">
            {decisions.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.k} className={`rounded-lg ${d.bg} ${d.border} border p-3`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${d.color}`} />
                    <div>
                      <div className={`text-sm font-bold ${d.color}`}>{d.k}</div>
                      <div className="text-[10px] text-slate-600">{d.sub}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <div className="text-2xl font-bold text-slate-900">{d.v}</div>
                    <div className="text-sm font-semibold text-slate-600">{d.pct}%</div>
                  </div>
                  <div className="text-[10px] text-slate-700 mt-2 leading-snug">{d.why}</div>
                  <div className="text-[10px] text-slate-500 italic mt-1.5 leading-snug">{d.best}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-around gap-2 text-[11px] border-t border-slate-200 pt-3">
            <div><span className="text-slate-500">Migration Candidates (Rehost + Refactor):</span> <span className="font-bold text-slate-900">150 (48%)</span></div>
            <div><span className="text-slate-500">Non-Migration (Retire + Retain):</span> <span className="font-bold text-slate-900">64 (20%)</span></div>
            <div><span className="text-slate-500">Under Review:</span> <span className="font-bold text-slate-900">98 (32%)</span></div>
          </div>
        </Section>

        {/* Decision drivers */}
        <Section title="Decision Drivers (Weighted Scoring)" className="lg:col-span-3">
          <div className="grid grid-cols-4 gap-2">
            {drivers.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.l} className="text-center">
                  <div className="text-[10px] text-slate-600 mb-1">{d.l}</div>
                  <div className={`h-9 w-9 rounded-lg ${d.bg} ${d.c} grid place-items-center mx-auto`}><Icon className="h-4 w-4" /></div>
                  <div className="text-base font-bold text-slate-900 mt-1">{d.v}</div>
                  <div className="text-[9px] text-slate-500">Weight</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[10px] text-slate-700">
            <div className="font-semibold mb-1">Scoring Scale: 1 (Low) – 5 (High)</div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              <li>Higher Cost Score = Higher cost to run today</li>
              <li>Higher Performance Score = Better improvement potential in cloud</li>
              <li>Higher Risk Score = Higher complexity / compliance / security risk</li>
              <li>Higher Business Value Score = Higher business importance</li>
            </ul>
          </div>
        </Section>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Top Applications by Migration Recommendation" className="lg:col-span-6">
          <table className="w-full text-[10px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Application</th>
                <th className="text-left py-1.5">Tier</th>
                <th className="text-left py-1.5">Env</th>
                <th className="text-left py-1.5">Recommended</th>
                <th className="text-left py-1.5">Conf</th>
                <th className="text-right py-1.5">Cost (3Y)</th>
                <th className="text-left py-1.5 pl-2">Performance</th>
                <th className="text-left py-1.5">Risk</th>
                <th className="text-right py-1.5">Deps</th>
                <th className="text-left py-1.5 pl-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {topApps.map((a) => (
                <tr key={a.app} className="border-b border-slate-100">
                  <td className="py-1.5 font-medium text-slate-900">{a.app}</td>
                  <td className="py-1.5 text-slate-600">{a.crit}</td>
                  <td className="py-1.5 text-slate-600">{a.env}</td>
                  <td className="py-1.5"><span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${a.pc}`}>{a.path}</span></td>
                  <td className="py-1.5 text-slate-700">{a.conf}</td>
                  <td className="py-1.5 text-right text-slate-700">{a.cost}</td>
                  <td className={`py-1.5 pl-2 font-semibold ${a.pc2}`}>{a.perf}</td>
                  <td className={`py-1.5 font-semibold ${a.rc}`}>{a.risk}</td>
                  <td className="py-1.5 text-right text-slate-700">{a.deps}</td>
                  <td className="py-1.5 pl-2 text-slate-600">{a.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Dependency Impact Analysis" className="lg:col-span-3">
          <div className="relative h-48 bg-slate-50 rounded-lg p-2">
            {/* Identity top */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-800">Identity</div>
            {/* ERP center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-100 border-2 border-blue-400 rounded-lg text-xs font-bold text-blue-700">ERP</div>
            {/* Database left */}
            <div className="absolute top-1/2 left-2 -translate-y-1/2 px-2.5 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-800">Database</div>
            {/* Reporting right */}
            <div className="absolute top-1/2 right-2 -translate-y-1/2 px-2.5 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-800">Reporting</div>
            {/* File services bottom-left */}
            <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-white border border-red-300 rounded text-[10px] font-bold text-slate-800">File Services</div>
            {/* Other apps bottom-right */}
            <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-white border border-red-300 rounded text-[10px] font-bold text-slate-800">Other Apps</div>
            {/* SVG lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="50" y1="15" x2="50" y2="48" stroke="hsl(142 71% 45%)" strokeWidth="0.4" />
              <line x1="20" y1="50" x2="45" y2="50" stroke="hsl(38 92% 50%)" strokeWidth="0.4" />
              <line x1="55" y1="50" x2="80" y2="50" stroke="hsl(38 92% 50%)" strokeWidth="0.4" />
              <line x1="50" y1="55" x2="20" y2="88" stroke="hsl(0 84% 60%)" strokeWidth="0.4" />
              <line x1="50" y1="55" x2="80" y2="88" stroke="hsl(0 84% 60%)" strokeWidth="0.4" />
            </svg>
          </div>
          <div className="flex items-center justify-around mt-2 text-[10px] text-slate-700">
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Low Impact</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Medium Impact</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />High Impact</div>
          </div>
        </Section>

        <Section title="Decision Impact Summary (3-Year View)" className="lg:col-span-3">
          <div className="space-y-2 text-[11px]">
            {tco.map((r) => (
              <div key={r.l} className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-600">{r.l}</span>
                <span className="font-bold text-slate-900">{r.v}</span>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Performance Improvement (Apps)</span>
              <span className="text-amber-500 font-bold">★★★★☆</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Risk Reduction</span>
              <span className="font-bold text-emerald-700">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Complexity Reduction</span>
              <span className="font-bold text-emerald-700">High</span>
            </div>
          </div>
        </Section>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Cost vs Performance vs Risk Trade-off (Bubble Chart)" className="lg:col-span-4">
          <div className="h-48">
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 5, right: 5, bottom: 18, left: 0 }}>
                <XAxis dataKey="x" type="number" name="Cost to Move (3-Year)" tick={{ fontSize: 9 }} domain={[0, 100]} ticks={[10, 90]} tickFormatter={(v) => v < 50 ? "Low" : "High"} label={{ value: "Cost to Move (3-Year)", position: "insideBottom", offset: -8, fontSize: 10, fill: "#64748b" }} />
                <YAxis dataKey="y" type="number" name="Performance Benefit" tick={{ fontSize: 9 }} domain={[0, 100]} ticks={[10, 90]} tickFormatter={(v) => v < 50 ? "Low" : "High"} label={{ value: "Performance Benefit", angle: -90, position: "insideLeft", fontSize: 10, fill: "#64748b" }} />
                <ZAxis dataKey="z" range={[100, 400]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter name="Rehost"   data={bubbles.Rehost}   fill="hsl(217 91% 60%)" />
                <Scatter name="Refactor" data={bubbles.Refactor} fill="hsl(142 71% 45%)" />
                <Scatter name="Retire"   data={bubbles.Retire}   fill="hsl(38 92% 50%)" />
                <Scatter name="Retain"   data={bubbles.Retain}   fill="hsl(262 83% 58%)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] mt-1">
            {[["Rehost","hsl(217 91% 60%)"],["Refactor","hsl(142 71% 45%)"],["Retire","hsl(38 92% 50%)"],["Retain","hsl(262 83% 58%)"]].map(([n,c]) => (
              <div key={n} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: c as string }} />{n}</div>
            ))}
          </div>
        </Section>

        <Section title="Migration Readiness" className="lg:col-span-4">
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5 relative h-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={readiness} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                    {readiness.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-base font-bold text-slate-900">214</div>
                  <div className="text-[9px] text-slate-500">In Scope</div>
                </div>
              </div>
            </div>
            <div className="col-span-7 space-y-1.5 text-[11px]">
              {readiness.map((r) => (
                <div key={r.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: r.color }} />
                  <span className="text-slate-700">{r.name}</span>
                  <span className="ml-auto font-semibold text-slate-900">{r.value} ({r.pct}%)</span>
                </div>
              ))}
              <div className="text-[10px] font-bold text-slate-700 mt-3 mb-1">Top Readiness Gaps</div>
              {gaps.map((g) => (
                <div key={g.l} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-700 w-32 truncate">{g.l}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${g.v * 3}%`, background: g.color }} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-900 w-6 text-right">{g.v}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Recommendations Summary" className="lg:col-span-4">
          <div className="space-y-3 text-[11px]">
            {recs.map((r) => {
              const Icon = r.i;
              return (
                <div key={r.t} className="flex items-start gap-2">
                  <Icon className={`h-4 w-4 ${r.c} shrink-0 mt-0.5`} />
                  <span className="text-slate-700 leading-snug">{r.t}</span>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </DashShell>
  );
}
