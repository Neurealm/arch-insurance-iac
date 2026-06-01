import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Database, GitBranch, Activity, ShieldCheck, AlertTriangle, CheckCircle,
  Eye, Target, Clock, Zap, Layers, Workflow, Server, RefreshCw, XCircle,
  Flag, FileCheck, Cog, ArrowRight, Info,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const kpis: KPI[] = [
  { label: "Total Environments", value: "128", sub: "Across All Tiers", subColor: "text-slate-500", icon: Server, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Replication Complete", value: "86", sub: "67.2%", subColor: "text-emerald-600", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "In Progress", value: "28", sub: "21.9%", subColor: "text-amber-600", icon: RefreshCw, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Not Started", value: "10", sub: "7.8%", subColor: "text-red-600", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Data Syncing", value: "4", sub: "3.1%", subColor: "text-violet-600", icon: Database, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Validation Passed", value: "78", sub: "60.9%", subColor: "text-emerald-600", icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Validation Failed", value: "6", sub: "4.7%", subColor: "text-amber-600", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Ready for Cutover", value: "72", sub: "56.3%", subColor: "text-blue-600", icon: Flag, color: "text-blue-600", bg: "bg-blue-50" },
];

const wwh = {
  what: [
    "The Environment Carve-Out & Replication Tracker — ensures all BD environments are replicated, validated, and ready in the Waters environment for Day 1 independence.",
  ],
  why: [
    "Separation requires duplicating environments without breaking dependencies or data integrity. This visibility reduces risk and ensures confidence for cutover.",
  ],
  how: [
    "Tracks source (BD) → target (Waters) environment replication",
    "Monitors data sync and validation status",
    "Ensures configuration parity across environments",
    "Flags gaps before cutover",
  ],
};

const outcomes: Outcome[] = [
  { icon: GitBranch, color: "text-emerald-600", title: "REPLICATED", l1: "86 of 128 complete" },
  { icon: ShieldCheck, color: "text-emerald-600", title: "VALIDATED", l1: "78 environments passed" },
  { icon: Flag, color: "text-blue-600", title: "READY", l1: "72 envs cutover-ready" },
  { icon: Cog, color: "text-violet-600", title: "PARITY", l1: "94.6% avg config parity" },
  { icon: Target, color: "text-emerald-600", title: "DAY 1", l1: "Target 100% by cutover" },
];

const tierRows = [
  { tier: "Production", total: 32, complete: 24, ip: 6, ns: 2, pct: 75.0 },
  { tier: "Pre-Production", total: 28, complete: 18, ip: 6, ns: 4, pct: 64.3 },
  { tier: "Non-Production", total: 48, complete: 34, ip: 10, ns: 4, pct: 70.8 },
  { tier: "Development", total: 12, complete: 6, ip: 4, ns: 2, pct: 50.0 },
  { tier: "Test", total: 8, complete: 4, ip: 2, ns: 2, pct: 50.0 },
  { tier: "Total", total: 128, complete: 86, ip: 28, ns: 10, pct: 67.2, bold: true },
];

const envRows = [
  { env: "PROD-US-EAST-01", tier: "Production", source: "US-East (BD)", target: "US-East (Waters)", sync: "In Sync", val: "Passed", parity: "99%", status: "Complete", ready: "Yes" },
  { env: "PROD-EU-WEST-01", tier: "Production", source: "EU-West (BD)", target: "EU-West (Waters)", sync: "In Sync", val: "Passed", parity: "98%", status: "Complete", ready: "Yes" },
  { env: "PROD-APAC-01", tier: "Production", source: "AP-South (BD)", target: "AP-South (Waters)", sync: "Lagging", val: "In Progress", parity: "92%", status: "In Progress", ready: "No" },
  { env: "PREPROD-US-EAST-01", tier: "Pre-Production", source: "US-East (BD)", target: "US-East (Waters)", sync: "In Sync", val: "Passed", parity: "97%", status: "Complete", ready: "Yes" },
  { env: "NONPROD-EU-WEST-02", tier: "Non-Production", source: "EU-West (BD)", target: "EU-West (Waters)", sync: "In Sync", val: "Passed", parity: "100%", status: "Complete", ready: "Yes" },
  { env: "DEV-US-EAST-01", tier: "Development", source: "US-East (BD)", target: "US-East (Waters)", sync: "Syncing", val: "In Progress", parity: "90%", status: "In Progress", ready: "No" },
  { env: "TEST-APAC-02", tier: "Test", source: "AP-South (BD)", target: "AP-South (Waters)", sync: "Failed", val: "Failed", parity: "60%", status: "Not Started", ready: "No" },
];

const dataSync = [
  { name: "In Sync", value: 102, color: "#22c55e" },
  { name: "Syncing", value: 4, color: "#f59e0b" },
  { name: "Lagging", value: 16, color: "#ef4444" },
  { name: "Failed", value: 6, color: "#a855f7" },
];

const parity = [
  { name: "100% Parity", value: 54, color: "#22c55e" },
  { name: "95–99% Parity", value: 38, color: "#84cc16" },
  { name: "80–94% Parity", value: 24, color: "#f59e0b" },
  { name: "< 80% Parity", value: 6, color: "#ef4444" },
  { name: "Unknown", value: 6, color: "#94a3b8" },
];

const issues = [
  { issue: "Data replication lag > 1 hr", env: 8, impact: "High", status: "Open" },
  { issue: "Missing DB dependencies", env: 5, impact: "High", status: "Open" },
  { issue: "Configuration mismatch", env: 11, impact: "Medium", status: "In Progress" },
  { issue: "Storage capacity shortfall", env: 4, impact: "Medium", status: "In Progress" },
  { issue: "Network segment not ready", env: 3, impact: "Low", status: "Open" },
  { issue: "Identity integration pending", env: 2, impact: "Low", status: "In Progress" },
];

const activities = [
  { icon: CheckCircle, color: "text-emerald-600", text: "Completed replication for PREPROD-EU-WEST-01", time: "May 12, 2025 09:15 AM" },
  { icon: CheckCircle, color: "text-emerald-600", text: "Validation passed for 12 environments", time: "May 12, 2025 08:42 AM" },
  { icon: AlertTriangle, color: "text-amber-600", text: "Detected config drift in 4 environments", time: "May 12, 2025 07:31 AM" },
  { icon: Info, color: "text-blue-600", text: "Replication lag resolved for PROD-APAC-02", time: "May 12, 2025 06:15 AM" },
];

function colorPct(v: number) {
  if (v >= 70) return "bg-emerald-500";
  if (v >= 60) return "bg-lime-500";
  if (v >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function pillTone(text: string) {
  const t = text.toLowerCase();
  if (/in sync|passed|complete|yes/.test(t)) return "text-emerald-700";
  if (/syncing|in progress/.test(t)) return "text-amber-700";
  if (/lagging|failed|no|not started/.test(t)) return "text-red-600";
  return "text-slate-700";
}

function Dot({ color }: { color: string }) {
  return <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${color}`} />;
}

function Donut({ data, center }: { data: { name: string; value: number; color: string }[]; center: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative h-44">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2} stroke="none">
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-2xl font-extrabold text-slate-900 leading-none">{total}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">{center}</div>
      </div>
    </div>
  );
}

export default function EnvCarveOut() {
  return (
    <DashShell
      title="ENVIRONMENT CARVE-OUT &"
      highlight="REPLICATION TRACKER"
      subtitle="Ensure all environments are cleanly separated and replicated for Day 1 readiness with data integrity and configuration parity."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Tier table | Replication Flow | Data Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Section title="Replication Progress by Tier" className="lg:col-span-5">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2 px-2">Tier</th>
                <th className="text-left py-2 px-2">Total</th>
                <th className="text-left py-2 px-2">Complete</th>
                <th className="text-left py-2 px-2">In Progress</th>
                <th className="text-left py-2 px-2">Not Started</th>
                <th className="text-left py-2 px-2 w-32">Progress</th>
              </tr>
            </thead>
            <tbody>
              {tierRows.map((r) => (
                <tr key={r.tier} className={`border-b border-slate-100 ${r.bold ? "font-semibold bg-slate-50" : ""}`}>
                  <td className="py-2 px-2 text-slate-800">{r.tier}</td>
                  <td className="py-2 px-2 text-slate-700">{r.total}</td>
                  <td className="py-2 px-2 text-emerald-700">{r.complete}</td>
                  <td className="py-2 px-2 text-amber-700">{r.ip}</td>
                  <td className="py-2 px-2 text-red-600">{r.ns}</td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full ${colorPct(r.pct)}`} style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="text-[11px] text-slate-700 w-10 text-right">{r.pct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Replication Flow Overview (BD → Waters)" className="lg:col-span-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
                <Server className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-blue-800 leading-tight">BD Source<br/>Environment</div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="flex-1 rounded-lg border border-violet-200 bg-violet-50 p-3 text-center">
                <Cog className="h-5 w-5 text-violet-600 mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-violet-800 leading-tight">Replication<br/>Engine</div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
                <Server className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-emerald-800 leading-tight">Waters Target<br/>Environment</div>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-800 mb-2">Replication Pipeline</div>
              <div className="grid grid-cols-5 gap-1 text-center">
                {[
                  { l: "Extract", s: "Complete", icon: CheckCircle, c: "text-emerald-600" },
                  { l: "Transfer", s: "Complete", icon: CheckCircle, c: "text-emerald-600" },
                  { l: "Apply", s: "Complete", icon: CheckCircle, c: "text-emerald-600" },
                  { l: "Validate", s: "In Progress", icon: Clock, c: "text-amber-600" },
                  { l: "Ready for Cutover", s: "Pending", icon: Clock, c: "text-slate-400" },
                ].map((p) => {
                  const I = p.icon;
                  return (
                    <div key={p.l} className="flex flex-col items-center">
                      <I className={`h-4 w-4 ${p.c}`} />
                      <div className="text-[10px] font-semibold text-slate-800 mt-1 leading-tight">{p.l}</div>
                      <div className={`text-[9px] ${p.c}`}>{p.s}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Data Sync Status" className="lg:col-span-3">
          <Donut data={dataSync} center="Environments" />
          <div className="mt-2 space-y-1 text-[11px]">
            {dataSync.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center"><span className="h-2 w-2 rounded-sm mr-1.5" style={{ background: d.color }} /><span className="text-slate-700">{d.name}</span></div>
                <span className="font-semibold text-slate-800">{d.value} ({((d.value / 128) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-lg bg-red-50 border border-red-100 px-2 py-1.5 text-[10px]">
            <div className="flex items-center gap-1.5 text-red-700 font-semibold"><Clock className="h-3 w-3" /> Longest Replication Lag <span className="ml-auto">02:45:18</span></div>
            <div className="text-slate-700 mt-0.5 grid grid-cols-2 gap-1">
              <span>Environment: <b>PROD-APAC-02</b></span>
              <span>Database: <b>CRM_PROD</b></span>
            </div>
          </div>
        </Section>
      </div>

      {/* Row 2: Env table | Parity | Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Environment Replication Status" className="lg:col-span-5">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-2 px-1.5">Environment</th>
                  <th className="text-left py-2 px-1.5">Tier</th>
                  <th className="text-left py-2 px-1.5">Source (BD)</th>
                  <th className="text-left py-2 px-1.5">Target (Waters)</th>
                  <th className="text-left py-2 px-1.5">Data Sync</th>
                  <th className="text-left py-2 px-1.5">Validation</th>
                  <th className="text-left py-2 px-1.5">Parity</th>
                  <th className="text-left py-2 px-1.5">Status</th>
                  <th className="text-left py-2 px-1.5">Ready</th>
                </tr>
              </thead>
              <tbody>
                {envRows.map((r) => (
                  <tr key={r.env} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-1.5 font-mono text-[10px] text-slate-700">{r.env}</td>
                    <td className="py-2 px-1.5 text-slate-700">{r.tier}</td>
                    <td className="py-2 px-1.5 text-slate-700">{r.source}</td>
                    <td className="py-2 px-1.5 text-slate-700">{r.target}</td>
                    <td className={`py-2 px-1.5 font-semibold ${pillTone(r.sync)}`}><Dot color={r.sync === "In Sync" ? "bg-emerald-500" : r.sync === "Syncing" ? "bg-amber-500" : r.sync === "Lagging" ? "bg-amber-500" : "bg-red-500"} />{r.sync}</td>
                    <td className={`py-2 px-1.5 font-semibold ${pillTone(r.val)}`}>{r.val}</td>
                    <td className="py-2 px-1.5 text-slate-800">{r.parity}</td>
                    <td className={`py-2 px-1.5 font-semibold ${pillTone(r.status)}`}>{r.status}</td>
                    <td className={`py-2 px-1.5 font-semibold ${pillTone(r.ready)}`}>{r.ready}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a className="text-[11px] text-blue-600 mt-2 inline-block">View all environments →</a>
        </Section>

        <Section title="Configuration Parity Summary" className="lg:col-span-3">
          <Donut data={parity} center="Environments" />
          <div className="mt-2 space-y-1 text-[11px]">
            {parity.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center"><span className="h-2 w-2 rounded-sm mr-1.5" style={{ background: d.color }} /><span className="text-slate-700">{d.name}</span></div>
                <span className="font-semibold text-slate-800">{d.value} ({((d.value / 128) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div>
              <div className="text-[10px] text-slate-500">Average Parity Score</div>
              <div className="text-lg font-bold text-emerald-600">94.6%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Below 95% Parity</div>
              <div className="text-lg font-bold text-amber-600">36 (28.1%)</div>
            </div>
          </div>
        </Section>

        <Section title="Blocking Gaps & Issues" className="lg:col-span-4">
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2 px-1.5">Issue</th>
                <th className="text-left py-2 px-1.5">Affected</th>
                <th className="text-left py-2 px-1.5">Impact</th>
                <th className="text-left py-2 px-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((i) => (
                <tr key={i.issue} className="border-b border-slate-100">
                  <td className="py-2 px-1.5 text-slate-800">{i.issue}</td>
                  <td className="py-2 px-1.5 text-slate-700">{i.env}</td>
                  <td className={`py-2 px-1.5 font-semibold ${i.impact === "High" ? "text-red-600" : i.impact === "Medium" ? "text-amber-600" : "text-slate-500"}`}>{i.impact}</td>
                  <td className={`py-2 px-1.5 font-semibold ${i.status === "Open" ? "text-red-600" : "text-amber-600"}`}>{i.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 mt-2 inline-block">View all issues →</a>
        </Section>
      </div>

      {/* Row 3: Cutover Readiness | Path to Day 1 | Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Cutover Readiness Summary" className="lg:col-span-3">
          <div className="flex items-center gap-3">
            <div className="relative h-20 w-20 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{v:72,c:"#22c55e"},{v:56,c:"#e5e7eb"}]} dataKey="v" innerRadius={26} outerRadius={36} startAngle={90} endAngle={-270} stroke="none">
                    <Cell fill="#22c55e" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-base font-bold text-slate-900 leading-none">72</div>
                <div className="text-[9px] text-slate-500">Ready</div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-slate-700"><b>56.3%</b> of environments are ready for cutover</div>
              <div className="text-[11px] text-slate-700 mt-1">Target: <b>100% by Day 1</b></div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: "56%" }} />
                </div>
                <span className="text-[10px] text-slate-700">56%</span>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Path to Day 1 Cutover" className="lg:col-span-5">
          <div className="flex items-center justify-between gap-1">
            {[
              { n: 1, l: "Replic Environments", done: true },
              { n: 2, l: "Validate Data Integrity", done: true },
              { n: 3, l: "Ensure Config Parity", done: true },
              { n: 4, l: "Resolve Gaps & Issues", done: false, current: true },
              { n: 5, l: "Ready for Cutover", done: false },
            ].map((s, i, arr) => (
              <div key={s.n} className="flex-1 flex items-center">
                <div className="flex flex-col items-center text-center flex-1">
                  <div className={`h-8 w-8 rounded-full grid place-items-center text-[11px] font-bold ${s.done ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500" : s.current ? "bg-blue-100 text-blue-700 border-2 border-blue-500" : "bg-slate-100 text-slate-500 border-2 border-slate-300"}`}>
                    {s.done ? <CheckCircle className="h-4 w-4" /> : s.n}
                  </div>
                  <div className="text-[10px] text-slate-700 mt-1 leading-tight max-w-[80px]">{s.l}</div>
                </div>
                {i < arr.length - 1 && <div className="h-px flex-1 bg-slate-200" />}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Recent Activities (Last 7 Days)" className="lg:col-span-4">
          <div className="space-y-2">
            {activities.map((a, i) => {
              const I = a.icon;
              return (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <I className={`h-3.5 w-3.5 mt-0.5 ${a.color} shrink-0`} />
                  <div className="flex-1 text-slate-800">{a.text}</div>
                  <div className="text-[10px] text-slate-500 shrink-0">{a.time}</div>
                </div>
              );
            })}
          </div>
          <a className="text-[11px] text-blue-600 mt-2 inline-block">View all activity →</a>
        </Section>
      </div>
    </DashShell>
  );
}
