import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Server, CheckCircle, PlayCircle, Clock, AlertCircle, Activity, TrendingUp, Calendar,
  LogOut, ShieldCheck, Database, Flag, Users, ArrowDown, DollarSign, Target,
  HardDrive, Network, UserCheck,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const kpis: KPI[] = [
  { label: "Total Workloads", value: "842", sub: "100%", subColor: "text-slate-500", icon: Server, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Completed", value: "286", sub: "34.0%", subColor: "text-emerald-600", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "In Progress", value: "368", sub: "43.7%", subColor: "text-blue-600", icon: PlayCircle, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Planned", value: "146", sub: "17.3%", subColor: "text-amber-600", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "At Risk", value: "28", sub: "3.3%", subColor: "text-red-600", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Cutover Success Rate", value: "97.8%", sub: "Last 30 Days", subColor: "text-violet-600", icon: Activity, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "TSA Exit Milestone", value: "Phase 3", sub: "In Progress", subColor: "text-emerald-600", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "TSA Exit Target Date", value: "Aug 15, 2025", sub: "Day 1 Readiness", subColor: "text-blue-600", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
];

const wwh = {
  what: ["The Data Center Exit & Migration Console — the system orchestrating workload movement out of BD environments."],
  why: ["Exiting legacy environments is high-risk and must be tightly controlled to ensure business continuity."],
  how: [
    "Tracks migration waves and sequencing",
    "Coordinates compute, storage, and network dependencies",
    "Validates successful cutover per workload",
    "Aligns execution with TSA exit milestones",
  ],
};

const outcomes: Outcome[] = [
  { icon: Target, color: "text-blue-600", title: "DAY 1 GOAL", l1: "100% Workloads Operating in Waters Environments" },
  { icon: CheckCircle, color: "text-emerald-600", title: "ALL CRITICAL DEPENDENCIES", l1: "Resolved" },
  { icon: ShieldCheck, color: "text-amber-600", title: "ZERO SEV-1 CUTOVER FAILURES", l1: "" },
  { icon: Database, color: "text-violet-600", title: "DATA PROTECTED & VALIDATED", l1: "" },
  { icon: Flag, color: "text-blue-600", title: "ON TRACK FOR TSA EXIT", l1: "Aug 15, 2025" },
];

const waves = [
  { wave: "Wave 1 — Foundation", workloads: 112, pct: "13.3%", status: "Completed", progress: 100, date: "Apr 15, 2025" },
  { wave: "Wave 2 — Core Apps", workloads: 198, pct: "23.5%", status: "Completed", progress: 100, date: "Apr 30, 2025" },
  { wave: "Wave 3 — Business Apps", workloads: 214, pct: "25.4%", status: "In Progress", progress: 72, date: "May 20, 2025" },
  { wave: "Wave 4 — Data & Analytics", workloads: 156, pct: "18.5%", status: "In Progress", progress: 48, date: "Jun 10, 2025" },
  { wave: "Wave 5 — Long Tail Apps", workloads: 104, pct: "12.4%", status: "Planned", progress: 0, date: "Jun 30, 2025" },
  { wave: "Wave 6 — Decommission", workloads: 58, pct: "6.9%", status: "Planned", progress: 0, date: "Jul 15, 2025" },
];

const workloadStatus = [
  { id: "ERP-PROD-01", app: "ERP Platform", crit: "High", bd: "BD-DC1", tgt: "Waters-DC1", wave: "Wave 2", status: "Completed", sync: "100%", date: "Apr 28, 2025", result: "Success" },
  { id: "CRM-PROD-01", app: "CRM", crit: "High", bd: "BD-DC1", tgt: "AWS-US-EAST", wave: "Wave 2", status: "Completed", sync: "100%", date: "Apr 30, 2025", result: "Success" },
  { id: "DW-PROD-01", app: "Data Warehouse", crit: "High", bd: "BD-DC2", tgt: "Azure-US-EAST", wave: "Wave 3", status: "In Progress", sync: "82%", date: "May 22, 2025", result: "—" },
  { id: "HR-PROD-01", app: "HR Portal", crit: "Medium", bd: "BD-DC1", tgt: "Waters-DC1", wave: "Wave 3", status: "In Progress", sync: "67%", date: "May 18, 2025", result: "—" },
  { id: "ANALYTICS-01", app: "Analytics Platform", crit: "Medium", bd: "BD-DC2", tgt: "AWS-US-EAST", wave: "Wave 4", status: "In Progress", sync: "41%", date: "Jun 05, 2025", result: "—" },
  { id: "FILESRV-01", app: "File Services", crit: "Low", bd: "BD-DC1", tgt: "Waters-DC1", wave: "Wave 5", status: "Planned", sync: "0%", date: "Jun 28, 2025", result: "—" },
  { id: "LEGACY-APP-12", app: "Legacy App", crit: "Low", bd: "BD-DC2", tgt: "Waters-DC2", wave: "Wave 5", status: "Planned", sync: "0%", date: "Jun 30, 2025", result: "—" },
];

const tsaPhases = [
  { phase: "Phase 1 — Foundation Exit", desc: "Core infra and platform exit", date: "Apr 15, 2025", status: "Completed" },
  { phase: "Phase 2 — Core Workloads", desc: "Core business applications exit", date: "Apr 30, 2025", status: "Completed" },
  { phase: "Phase 3 — Majority Workloads", desc: "Majority of workloads exited", date: "May 31, 2025", status: "In Progress" },
  { phase: "Phase 4 — Final Workloads", desc: "Long tail workloads exit", date: "Jun 30, 2025", status: "Planned" },
  { phase: "Phase 5 — Decommission BD", desc: "BD environments decommissioned", date: "Aug 15, 2025", status: "Planned" },
];

const risks = [
  { issue: "Data Sync Lag > 15 min", impact: 12, sev: "High", status: "In Progress" },
  { issue: "Storage Capacity Constraint", impact: 8, sev: "High", status: "In Progress" },
  { issue: "Network Dependency Block", impact: 5, sev: "High", status: "Open" },
  { issue: "Application Compatibility", impact: 6, sev: "Medium", status: "In Progress" },
  { issue: "Identity Integration Pending", impact: 4, sev: "Medium", status: "Open" },
  { issue: "Backup Verification Failed", impact: 3, sev: "Medium", status: "Open" },
];

const recent = [
  { time: "May 12, 2025 09:15 AM", act: "Completed cutover: CRM-PROD-01", wl: 1, status: "Success" },
  { time: "May 12, 2025 07:42 AM", act: "Started migration: DW-PROD-01", wl: 1, status: "In Progress" },
  { time: "May 11, 2025 08:21 PM", act: "Data sync lag resolved: ANALYTICS-01", wl: 1, status: "Resolved" },
  { time: "May 11, 2025 05:33 PM", act: "Network dependency cleared: HR-PROD-01", wl: 1, status: "Resolved" },
  { time: "May 11, 2025 11:08 AM", act: "Pre-cutover validation passed: ERP-PROD-01", wl: 1, status: "Success" },
];

const dependency = [
  { name: "Ready", value: 672, pct: "79.8%", color: "#22c55e" },
  { name: "With Warnings", value: 98, pct: "11.6%", color: "#f59e0b" },
  { name: "Blocked", value: 28, pct: "3.3%", color: "#ef4444" },
  { name: "Not Assessed", value: 44, pct: "5.2%", color: "#94a3b8" },
];

const validation = [
  { l: "Pre-Cutover Validation Passed", v: "96.2%", num: "312 / 324", color: "#22c55e" },
  { l: "Cutover Success Rate", v: "97.8%", num: "286 / 292", color: "#3b82f6" },
  { l: "Post-Cutover Health Checks", v: "95.6%", num: "278 / 291", color: "#a855f7" },
];

const critDeps = [
  { l: "Compute", v: 18, icon: Server, c: "text-blue-600" },
  { l: "Storage", v: 7, icon: HardDrive, c: "text-violet-600" },
  { l: "Network", v: 6, icon: Network, c: "text-emerald-600" },
  { l: "Identity", v: 5, icon: UserCheck, c: "text-amber-600" },
];

const timelineWaves = [
  { name: "Wave 1 — Foundation", segs: [{ start: 0, end: 18, color: "bg-emerald-500" }] },
  { name: "Wave 2 — Core Apps", segs: [{ start: 8, end: 32, color: "bg-emerald-500" }] },
  { name: "Wave 3 — Business Apps", segs: [{ start: 22, end: 50, color: "bg-blue-500" }] },
  { name: "Wave 4 — Data & Analytics", segs: [{ start: 38, end: 68, color: "bg-blue-500" }] },
  { name: "Wave 5 — Long Tail Apps", segs: [{ start: 58, end: 82, color: "bg-slate-300" }] },
  { name: "Wave 6 — Decommission", segs: [{ start: 76, end: 96, color: "bg-slate-300" }] },
];

const sevColor = (s: string) =>
  s === "High" ? "text-red-600 font-semibold" :
  s === "Medium" ? "text-amber-600 font-semibold" :
  "text-emerald-600 font-semibold";

function Donut({ data, center, sub }: { data: { name: string; value: number; color: string }[]; center: string; sub: string }) {
  return (
    <div className="relative h-44">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={48} outerRadius={70} stroke="none">
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-2xl font-bold text-slate-900">{center}</div>
        <div className="text-[10px] text-slate-500">{sub}</div>
      </div>
    </div>
  );
}

function ScoreDonut({ value, color }: { value: number; color: string }) {
  const data = [{ name: "v", value, color }, { name: "r", value: 100 - value, color: "#e2e8f0" }];
  return (
    <div className="relative h-28">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={36} outerRadius={50} startAngle={90} endAngle={-270} stroke="none">
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-900">{value}%</div>
    </div>
  );
}

export default function DcExitMigration() {
  return (
    <DashShell
      title="DATA CENTER EXIT &"
      highlight="MIGRATION ORCHESTRATION CONSOLE"
      subtitle="Orchestrating the safe, sequenced exit from BD environments and cutover to Waters infrastructure."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1 — Wave Progress / Flow / Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Migration Wave Progress">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-2 px-1">Wave</th>
                  <th className="text-left py-2 px-1">Workloads</th>
                  <th className="text-left py-2 px-1">% of Total</th>
                  <th className="text-left py-2 px-1">Status</th>
                  <th className="text-left py-2 px-1">Progress</th>
                  <th className="text-left py-2 px-1">Target Cutover</th>
                </tr>
              </thead>
              <tbody>
                {waves.map((w) => (
                  <tr key={w.wave} className="border-b border-slate-100">
                    <td className="py-2 px-1 text-slate-800">{w.wave}</td>
                    <td className="py-2 px-1 text-slate-700">{w.workloads}</td>
                    <td className="py-2 px-1 text-slate-700">{w.pct}</td>
                    <td className="py-2 px-1"><StatusPill status={w.status} /></td>
                    <td className="py-2 px-1">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${w.status === "Completed" ? "bg-emerald-500" : w.status === "In Progress" ? "bg-blue-500" : "bg-slate-300"}`} style={{ width: `${w.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-600">{w.progress}%</span>
                      </div>
                    </td>
                    <td className="py-2 px-1 text-slate-700">{w.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Migration Flow Overview (BD → Waters)">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 rounded-lg border border-blue-200 bg-blue-50 p-2 text-center">
              <div className="text-[10px] font-bold text-blue-700">BD Source Environment</div>
              <ul className="text-[9px] text-slate-700 mt-1 space-y-0.5">
                <li>Compute</li><li>Storage</li><li>Network</li><li>Applications</li><li>Data</li>
              </ul>
            </div>
            <ArrowDown className="h-4 w-4 -rotate-90 text-slate-400" />
            <div className="flex-1 rounded-lg border border-violet-200 bg-violet-50 p-2 text-center">
              <div className="text-[10px] font-bold text-violet-700">Migration Orchestrator</div>
              <ul className="text-[9px] text-slate-700 mt-1 space-y-0.5">
                <li>Dependency Check</li><li>Data Sync</li><li>Validation</li><li>Cutover Automation</li><li>Rollback Plan</li>
              </ul>
            </div>
            <ArrowDown className="h-4 w-4 -rotate-90 text-slate-400" />
            <div className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-center">
              <div className="text-[10px] font-bold text-emerald-700">Waters Target Environment</div>
              <ul className="text-[9px] text-slate-700 mt-1 space-y-0.5">
                <li>Compute</li><li>Storage</li><li>Network</li><li>Applications</li><li>Data</li>
              </ul>
            </div>
          </div>
          <div className="text-[10px] font-semibold text-slate-600 mb-2 mt-3">Workflow Steps</div>
          <div className="flex items-center justify-between text-[9px] text-slate-700">
            {[
              { l: "Assess Dependencies", c: "text-emerald-600" },
              { l: "Plan & Sequence", c: "text-emerald-600" },
              { l: "Migrate & Sync", c: "text-emerald-600" },
              { l: "Validate", c: "text-emerald-600" },
              { l: "Cutover", c: "text-amber-500" },
              { l: "Post-Cutover Verify", c: "text-slate-300" },
              { l: "Decommission Source", c: "text-slate-300" },
            ].map((s, i, arr) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <CheckCircle className={`h-4 w-4 ${s.c}`} />
                  <div className="text-center mt-1 leading-tight w-16">{s.l}</div>
                </div>
                {i < arr.length - 1 && <div className="flex-1 h-px bg-slate-200 mx-1" />}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Migration Timeline (All Waves)">
          <div className="flex items-center gap-3 text-[10px] mb-2">
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-500 rounded-sm" /> Completed</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-blue-500 rounded-sm" /> In Progress</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-slate-300 rounded-sm" /> Planned</span>
            <span className="ml-auto text-red-500 font-semibold">Day 1 Aug 15, 2025</span>
          </div>
          <div className="space-y-2 relative">
            {timelineWaves.map((w) => (
              <div key={w.name} className="flex items-center text-[10px]">
                <div className="w-32 text-slate-700 truncate">{w.name}</div>
                <div className="flex-1 relative h-3 bg-slate-50 rounded">
                  {w.segs.map((s, i) => (
                    <div key={i} className={`absolute h-full ${s.color} rounded`} style={{ left: `${s.start}%`, width: `${s.end - s.start}%` }} />
                  ))}
                  <div className="absolute right-[6%] top-[-2px] h-5 w-px border-l border-dashed border-red-400" />
                </div>
              </div>
            ))}
            <div className="flex items-center text-[9px] text-slate-500 pl-32 pt-1">
              <span className="flex-1">Apr '25</span>
              <span className="flex-1">May '25</span>
              <span className="flex-1">Jun '25</span>
              <span className="flex-1">Jul '25</span>
              <span className="flex-1 text-right">Aug '25</span>
            </div>
          </div>
        </Section>
      </div>

      {/* Row 2 — Workload status / Dependency / Validation / Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        <div className="lg:col-span-4">
          <Section title="Workload Migration Status">
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-1.5 px-1">Workload</th>
                    <th className="text-left py-1.5 px-1">Application</th>
                    <th className="text-left py-1.5 px-1">Crit.</th>
                    <th className="text-left py-1.5 px-1">BD</th>
                    <th className="text-left py-1.5 px-1">Target</th>
                    <th className="text-left py-1.5 px-1">Wave</th>
                    <th className="text-left py-1.5 px-1">Status</th>
                    <th className="text-left py-1.5 px-1">Sync</th>
                    <th className="text-left py-1.5 px-1">Cutover</th>
                    <th className="text-left py-1.5 px-1">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {workloadStatus.map((w) => (
                    <tr key={w.id} className="border-b border-slate-100">
                      <td className="py-1.5 px-1 font-mono text-slate-700">{w.id}</td>
                      <td className="py-1.5 px-1 text-slate-700">{w.app}</td>
                      <td className={`py-1.5 px-1 ${sevColor(w.crit)}`}>{w.crit}</td>
                      <td className="py-1.5 px-1 text-slate-700">{w.bd}</td>
                      <td className="py-1.5 px-1 text-slate-700">{w.tgt}</td>
                      <td className="py-1.5 px-1 text-slate-700">{w.wave}</td>
                      <td className="py-1.5 px-1"><StatusPill status={w.status} /></td>
                      <td className="py-1.5 px-1 text-slate-700">{w.sync}</td>
                      <td className="py-1.5 px-1 text-slate-700">{w.date}</td>
                      <td className="py-1.5 px-1">
                        {w.result === "Success" ? <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle className="h-3 w-3" />Success</span> : <span className="text-slate-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Dependency Readiness">
            <Donut data={dependency} center="842" sub="Total Workloads" />
            <div className="space-y-1 text-[10px] mt-2">
              {dependency.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: d.color }} /> {d.name}</span>
                  <span className="text-slate-700 font-medium">{d.value} ({d.pct})</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="text-[10px] font-semibold text-slate-600 mb-2">Critical Dependencies</div>
              <div className="grid grid-cols-4 gap-1 text-center">
                {critDeps.map((d) => {
                  const I = d.icon;
                  return (
                    <div key={d.l}>
                      <I className={`h-4 w-4 mx-auto ${d.c}`} />
                      <div className="text-sm font-bold text-slate-900">{d.v}</div>
                      <div className="text-[9px] text-slate-500">{d.l}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-3">
          <Section title="Cutover Validation Summary (Last 30 Days)">
            <div className="grid grid-cols-3 gap-2">
              {validation.map((v) => (
                <div key={v.l} className="text-center">
                  <div className="text-[10px] font-semibold text-slate-700 mb-1 leading-tight h-8">{v.l}</div>
                  <ScoreDonut value={parseFloat(v.v)} color={v.color} />
                  <div className="text-[10px] text-slate-500 mt-1">{v.num}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="lg:col-span-2">
          <Section title="Top Risks & Issues">
            <div className="space-y-1.5 text-[10px]">
              {risks.map((r) => (
                <div key={r.issue} className="border-b border-slate-100 pb-1.5">
                  <div className="text-slate-800 font-medium leading-tight">{r.issue}</div>
                  <div className="flex items-center justify-between mt-0.5 text-[9px]">
                    <span className="text-slate-500">Impact: {r.impact}</span>
                    <span className={sevColor(r.sev)}>{r.sev}</span>
                    <StatusPill status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* Row 3 — TSA Tracking / Impact / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="TSA Exit Milestone Tracking">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-2 px-1">Milestone</th>
                  <th className="text-left py-2 px-1">Description</th>
                  <th className="text-left py-2 px-1">Target Date</th>
                  <th className="text-left py-2 px-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {tsaPhases.map((p) => (
                  <tr key={p.phase} className="border-b border-slate-100">
                    <td className="py-2 px-1 text-slate-800">{p.phase}</td>
                    <td className="py-2 px-1 text-slate-600">{p.desc}</td>
                    <td className="py-2 px-1 text-slate-700">{p.date}</td>
                    <td className="py-2 px-1"><StatusPill status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Migration Impact Summary">
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: "Downtime Avoided (Est.)", v: "1,236", u: "Hours", icon: Clock, c: "text-blue-600", bg: "bg-blue-50" },
              { l: "Users Impacted Avoided (Est.)", v: "18,540", u: "", icon: Users, c: "text-violet-600", bg: "bg-violet-50" },
              { l: "Risk Events Avoided (Est.)", v: "42", u: "", icon: AlertCircle, c: "text-amber-600", bg: "bg-amber-50" },
              { l: "Cost Avoidance (Est.)", v: "$6.2M", u: "", icon: DollarSign, c: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((m) => {
              const I = m.icon;
              return (
                <div key={m.l} className="rounded-lg border border-slate-100 p-3">
                  <div className={`h-8 w-8 rounded-lg ${m.bg} ${m.c} grid place-items-center mb-2`}><I className="h-4 w-4" /></div>
                  <div className="text-[10px] text-slate-500">{m.l}</div>
                  <div className="text-lg font-bold text-slate-900">{m.v}</div>
                  {m.u && <div className="text-[10px] text-slate-500">{m.u}</div>}
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Recent Activity (Last 7 Days)">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1.5 px-1">Time</th>
                  <th className="text-left py-1.5 px-1">Activity</th>
                  <th className="text-left py-1.5 px-1">WL</th>
                  <th className="text-left py-1.5 px-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-1.5 px-1 text-slate-600 whitespace-nowrap">{r.time}</td>
                    <td className="py-1.5 px-1 text-slate-800">{r.act}</td>
                    <td className="py-1.5 px-1 text-slate-700">{r.wl}</td>
                    <td className="py-1.5 px-1"><StatusPill status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </DashShell>
  );
}
