import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Database, CheckCircle, HardDrive, Layers, RefreshCw, ShieldCheck, AlertTriangle,
  Flag, Info, AlertCircle, Calendar, Clock,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend,
} from "recharts";

const kpis: KPI[] = [
  { label: "Total Storage Systems", value: "128", sub: "Across 3 Regions", subColor: "text-slate-500", icon: HardDrive, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Provisioned Capacity", value: "1.84 PB", sub: "76.3% of Planned", subColor: "text-emerald-600", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Used Capacity", value: "896 TB", sub: "48.7% Utilization", subColor: "text-amber-600", icon: Database, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Replication Relationships", value: "256", sub: "Active", subColor: "text-violet-600", icon: Layers, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Data Sync Health", value: "98.6%", sub: "Healthy", subColor: "text-emerald-600", icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Backup Success Rate", value: "97.3%", sub: "Last 7 Days", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Critical Risks", value: "9", sub: "Requires Attention", subColor: "text-red-600", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Ready for Day 1", value: "83%", sub: "Storage Readiness Score", subColor: "text-blue-600", icon: Flag, color: "text-blue-600", bg: "bg-blue-50" },
];

const wwh = {
  what: ["The Storage & Data Platform Readiness Dashboard — ensures all storage systems and data layers are operational and independent."],
  why: ["Data is the hardest part to separate. Storage readiness directly impacts application availability and business continuity."],
  how: [
    "Tracks storage provisioning and replication",
    "Monitors data integrity and synchronization",
    "Validates backup and recovery readiness",
    "Identifies storage bottlenecks and risks",
  ],
};

const outcomes: Outcome[] = [
  { icon: HardDrive, color: "text-emerald-600", title: "PROVISIONED", l1: "1.84 PB capacity ready" },
  { icon: ShieldCheck, color: "text-emerald-600", title: "PROTECTED", l1: "97.3% backup success" },
  { icon: RefreshCw, color: "text-emerald-600", title: "SYNCED", l1: "98.6% replication healthy" },
  { icon: AlertTriangle, color: "text-amber-600", title: "RISK", l1: "9 critical items open" },
  { icon: Flag, color: "text-blue-600", title: "DAY 1", l1: "83% storage readiness" },
];

const layers = [
  { name: "Block Storage", pct: 92, status: "Healthy", note: "All critical arrays ready" },
  { name: "File Storage", pct: 88, status: "Healthy", note: "Performance within limits" },
  { name: "Object Storage", pct: 85, status: "Healthy", note: "Capacity sufficient" },
  { name: "Database Storage", pct: 80, status: "At Risk", note: "2 systems below target" },
  { name: "Archive Storage", pct: 78, status: "At Risk", note: "Backup verification pending" },
];

const replications = [
  { src: "BD PROD-01", tgt: "Waters PROD-01", data: "12.4 TB", lag: "3 min", status: "In Sync" },
  { src: "BD PROD-02", tgt: "Waters PROD-02", data: "8.7 TB", lag: "5 min", status: "In Sync" },
  { src: "BD NONPROD-01", tgt: "Waters NONPROD-01", data: "6.1 TB", lag: "2 min", status: "In Sync" },
  { src: "BD DR-01", tgt: "Waters DR-01", data: "4.8 TB", lag: "7 min", status: "In Sync" },
  { src: "BD ARCHIVE-01", tgt: "Waters ARCHIVE-01", data: "3.2 TB", lag: "35 min", status: "Lagging" },
  { src: "BD TEST-01", tgt: "Waters TEST-01", data: "1.9 TB", lag: "—", status: "Failed" },
];

const utilTrend = Array.from({ length: 30 }, (_, i) => ({
  d: `D${i + 1}`,
  prov: +(1.8 + Math.sin(i / 10) * 0.05).toFixed(2),
  used: +(0.85 + i * 0.005).toFixed(2),
  util: +(46 + i * 0.15 + Math.sin(i / 4) * 1.5).toFixed(1),
}));

const regions = [
  { name: "US-East", value: 48, pct: "37.5%", color: "#3b82f6" },
  { name: "EU-West", value: 40, pct: "31.3%", color: "#22c55e" },
  { name: "AP-South", value: 28, pct: "21.9%", color: "#f59e0b" },
  { name: "AP-Primary", value: 12, pct: "9.4%", color: "#a855f7" },
];

const integrity = [
  { l: "Integrity Checks Passed", v: "12,845", icon: CheckCircle, c: "text-emerald-600" },
  { l: "Validation In Progress", v: "196", icon: Clock, c: "text-amber-500" },
  { l: "Integrity Warnings", v: "18", icon: AlertTriangle, c: "text-amber-600" },
  { l: "Integrity Failures", v: "3", icon: AlertCircle, c: "text-red-600" },
];

const backup = [
  { l: "Successful Backups", v: "1,254", icon: CheckCircle, c: "text-emerald-600" },
  { l: "Backup Warnings", v: "22", icon: AlertTriangle, c: "text-amber-500" },
  { l: "Failed Backups", v: "10", icon: AlertCircle, c: "text-red-600" },
  { l: "Recovery Tests Passed", v: "96%", icon: CheckCircle, c: "text-blue-600" },
];

const risks = [
  { risk: "High Replication Lag (> 30 min)", sev: "High", impacted: 3, status: "Open" },
  { risk: "Low Capacity (< 15% free)", sev: "High", impacted: 2, status: "Open" },
  { risk: "Backup Failures", sev: "Medium", impacted: 4, status: "Open" },
  { risk: "Performance Bottleneck", sev: "Medium", impacted: 5, status: "In Progress" },
  { risk: "Unsupported Firmware Version", sev: "Low", impacted: 6, status: "Open" },
];

const inventory = [
  { name: "STG-ARRAY-01", type: "Block", vendor: "Dell PowerStore", dc: "US-East-DC1", prov: "320 TB", used: "180 TB", util: 56, status: "Healthy" },
  { name: "STG-FILE-01", type: "File", vendor: "NetApp ONTAP", dc: "EU-West-DC1", prov: "210 TB", used: "120 TB", util: 57, status: "Healthy" },
  { name: "STG-DB-01", type: "Block", vendor: "Pure Storage", dc: "AP-South-DC1", prov: "150 TB", used: "95 TB", util: 63, status: "Healthy" },
  { name: "STG-OBJ-01", type: "Object", vendor: "Dell ECS", dc: "US-East-DC2", prov: "500 TB", used: "200 TB", util: 40, status: "Healthy" },
  { name: "STG-ARCH-01", type: "Archive", vendor: "IBM Spectrum", dc: "EU-West-DC2", prov: "200 TB", used: "60 TB", util: 30, status: "Healthy" },
];

const regionsHealth = [
  { name: "US-East", value: 99.1, color: "#22c55e" },
  { name: "EU-West", value: 98.2, color: "#22c55e" },
  { name: "AP-South", value: 98.4, color: "#22c55e" },
];

const activities = [
  { time: "May 12, 2026 09:15 AM", act: "Replication caught up", sys: "STG-ARRAY-01", status: "Success", c: "text-emerald-600", I: CheckCircle },
  { time: "May 12, 2026 08:42 AM", act: "Backup completed", sys: "STG-FILE-01", status: "Success", c: "text-emerald-600", I: CheckCircle },
  { time: "May 12, 2026 07:33 AM", act: "Integrity check passed", sys: "STG-DB-01", status: "Success", c: "text-emerald-600", I: CheckCircle },
  { time: "May 12, 2026 06:21 AM", act: "Capacity threshold warning", sys: "STG-OBJ-01", status: "Warning", c: "text-amber-600", I: AlertTriangle },
  { time: "May 12, 2026 05:58 AM", act: "Replication lag detected", sys: "STG-ARCH-01", status: "Alert", c: "text-red-600", I: AlertCircle },
];

function statusTone(s: string) {
  if (/in sync|healthy|success|passed|complete/i.test(s)) return "text-emerald-700";
  if (/lagging|warning|in progress|at risk/i.test(s)) return "text-amber-700";
  if (/failed|alert|critical/i.test(s)) return "text-red-600";
  return "text-slate-700";
}

function StatusIcon({ s }: { s: string }) {
  if (/in sync|healthy|success|passed/i.test(s)) return <CheckCircle className="h-3 w-3 text-emerald-600 inline mr-1" />;
  if (/lagging|warning|at risk/i.test(s)) return <AlertTriangle className="h-3 w-3 text-amber-500 inline mr-1" />;
  if (/failed|alert/i.test(s)) return <AlertCircle className="h-3 w-3 text-red-600 inline mr-1" />;
  return null;
}

function PctBar({ v, color }: { v: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${v}%` }} />
      </div>
      <span className="text-[11px] font-semibold text-slate-700 w-9 text-right">{v}%</span>
    </div>
  );
}

function ScoreDonut({ value, color, label }: { value: number; color: string; label: string }) {
  const data = [{ v: value, c: color }, { v: 100 - value, c: "#e5e7eb" }];
  return (
    <div className="relative h-32 w-32 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="v" innerRadius={42} outerRadius={56} startAngle={90} endAngle={-270} stroke="none">
            <Cell fill={color} /><Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xl font-extrabold text-slate-900 leading-none">{value}%</div>
        <div className="text-[10px] text-slate-500 mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function StorageDataReadiness() {
  return (
    <DashShell
      title="STORAGE & DATA PLATFORM"
      highlight="READINESS DASHBOARD"
      subtitle="Ensuring storage systems, data layers, and protection are independent, healthy, and ready for Day 1 operations."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Layers | Replication | Capacity Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Section title="Storage Readiness by Layer" className="lg:col-span-4">
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2 px-1.5">Layer</th>
                <th className="text-left py-2 px-1.5 w-32">Readiness</th>
                <th className="text-left py-2 px-1.5">Status</th>
                <th className="text-left py-2 px-1.5">Details</th>
              </tr>
            </thead>
            <tbody>
              {layers.map((l) => (
                <tr key={l.name} className="border-b border-slate-100">
                  <td className="py-2 px-1.5 text-slate-800">{l.name}</td>
                  <td className="py-2 px-1.5"><PctBar v={l.pct} color={l.pct >= 85 ? "bg-emerald-500" : "bg-amber-500"} /></td>
                  <td className={`py-2 px-1.5 font-semibold ${statusTone(l.status)}`}>{l.status}</td>
                  <td className="py-2 px-1.5 text-slate-600">{l.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 mt-2 inline-block">View layer details →</a>
        </Section>

        <Section title="Replication Status (Source → Target)" className="lg:col-span-4">
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2 px-1.5">Source</th>
                <th className="text-left py-2 px-1.5">Target</th>
                <th className="text-left py-2 px-1.5">Data</th>
                <th className="text-left py-2 px-1.5">Lag</th>
                <th className="text-left py-2 px-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {replications.map((r) => (
                <tr key={r.src} className="border-b border-slate-100">
                  <td className="py-2 px-1.5 text-slate-800">{r.src}</td>
                  <td className="py-2 px-1.5 text-slate-700">{r.tgt}</td>
                  <td className="py-2 px-1.5 text-slate-700">{r.data}</td>
                  <td className="py-2 px-1.5 text-slate-700">{r.lag}</td>
                  <td className={`py-2 px-1.5 font-semibold ${statusTone(r.status)}`}><StatusIcon s={r.status} />{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 mt-2 inline-block">View all replication relationships →</a>
        </Section>

        <Section title="Capacity Utilization Trend (Last 30 Days)" className="lg:col-span-4">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={utilTrend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 9 }} interval={4} />
                <YAxis yAxisId="l" tick={{ fontSize: 10 }} unit="PB" domain={[0, 2.5]} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Line yAxisId="l" dataKey="prov" name="Provisioned (PB)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                <Line yAxisId="l" dataKey="used" name="Used (PB)" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} />
                <Line yAxisId="r" dataKey="util" name="Utilization (%)" stroke="#a855f7" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* Row 2: Region Donut | Integrity | Backup | Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Storage Systems by Region" className="lg:col-span-3">
          <div className="flex items-center gap-3">
            <div className="relative h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={regions} dataKey="value" innerRadius={36} outerRadius={56} paddingAngle={2} stroke="none">
                    {regions.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-extrabold text-slate-900 leading-none">128</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Total Systems</div>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 text-[11px]">
              {regions.map((r) => (
                <div key={r.name} className="flex items-center justify-between">
                  <div className="flex items-center"><span className="h-2 w-2 rounded-sm mr-1.5" style={{ background: r.color }} /><span className="text-slate-700">{r.name}</span></div>
                  <span className="font-semibold text-slate-800">{r.value} <span className="text-slate-500">({r.pct})</span></span>
                </div>
              ))}
            </div>
          </div>
          <a className="text-[11px] text-blue-600 mt-2 inline-block">View by data center →</a>
        </Section>

        <Section title="Data Integrity & Validation" className="lg:col-span-3">
          <div className="flex items-center gap-3">
            <ScoreDonut value={98.2} color="#22c55e" label="Integrity Score" />
            <div className="flex-1 space-y-1.5 text-[11px]">
              {integrity.map((r) => {
                const I = r.icon;
                return (
                  <div key={r.l} className="flex items-center justify-between">
                    <div className="flex items-center"><I className={`h-3 w-3 mr-1 ${r.c}`} /><span className="text-slate-700">{r.l}</span></div>
                    <span className="font-semibold text-slate-800">{r.v}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <a className="text-[11px] text-blue-600 mt-2 inline-block">View integrity details →</a>
        </Section>

        <Section title="Backup & Recovery Readiness" className="lg:col-span-3">
          <div className="flex items-center gap-3">
            <ScoreDonut value={97.3} color="#22c55e" label="Backup Success" />
            <div className="flex-1 space-y-1.5 text-[11px]">
              {backup.map((r) => {
                const I = r.icon;
                return (
                  <div key={r.l} className="flex items-center justify-between">
                    <div className="flex items-center"><I className={`h-3 w-3 mr-1 ${r.c}`} /><span className="text-slate-700">{r.l}</span></div>
                    <span className="font-semibold text-slate-800">{r.v}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <a className="text-[11px] text-blue-600 mt-2 inline-block">View protection details →</a>
        </Section>

        <Section title="Top Storage Risks" className="lg:col-span-3">
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2 px-1.5">Risk</th>
                <th className="text-left py-2 px-1.5">Sev</th>
                <th className="text-left py-2 px-1.5">Impacted</th>
                <th className="text-left py-2 px-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <tr key={r.risk} className="border-b border-slate-100">
                  <td className="py-2 px-1.5 text-slate-800">{r.risk}</td>
                  <td className={`py-2 px-1.5 font-semibold ${r.sev === "High" ? "text-red-600" : r.sev === "Medium" ? "text-amber-600" : "text-slate-500"}`}>{r.sev}</td>
                  <td className="py-2 px-1.5 text-slate-700">{r.impacted}</td>
                  <td className={`py-2 px-1.5 font-semibold ${r.status === "Open" ? "text-red-600" : "text-amber-600"}`}>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 mt-2 inline-block">View all risks →</a>
        </Section>
      </div>

      {/* Row 3: Inventory | Regional Health | Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Storage Systems Inventory (Sample)" className="lg:col-span-5">
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2 px-1.5">System Name</th>
                <th className="text-left py-2 px-1.5">Type</th>
                <th className="text-left py-2 px-1.5">Vendor</th>
                <th className="text-left py-2 px-1.5">Data Center</th>
                <th className="text-left py-2 px-1.5">Prov.</th>
                <th className="text-left py-2 px-1.5">Used</th>
                <th className="text-left py-2 px-1.5">Util</th>
                <th className="text-left py-2 px-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((s) => (
                <tr key={s.name} className="border-b border-slate-100">
                  <td className="py-2 px-1.5 font-mono text-[10px] text-slate-700">{s.name}</td>
                  <td className="py-2 px-1.5 text-slate-700">{s.type}</td>
                  <td className="py-2 px-1.5 text-slate-800">{s.vendor}</td>
                  <td className="py-2 px-1.5 text-slate-700">{s.dc}</td>
                  <td className="py-2 px-1.5 text-slate-700">{s.prov}</td>
                  <td className="py-2 px-1.5 text-slate-700">{s.used}</td>
                  <td className="py-2 px-1.5 text-slate-700">{s.util}%</td>
                  <td className={`py-2 px-1.5 font-semibold ${statusTone(s.status)}`}><StatusIcon s={s.status} />{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 mt-2 inline-block">View full inventory →</a>
        </Section>

        <Section title="Data Sync Health by Region" className="lg:col-span-3">
          <div className="flex items-center justify-around h-44">
            {regionsHealth.map((r) => (
              <div key={r.name} className="text-center">
                <div className="h-16 w-16 rounded-full border-4 border-emerald-500 bg-emerald-50 grid place-items-center mx-auto">
                  <div className="text-[12px] font-bold text-emerald-700">{r.value}%</div>
                </div>
                <div className="text-[10px] text-slate-700 mt-2 font-semibold">{r.name}</div>
              </div>
            ))}
          </div>
          <a className="text-[11px] text-blue-600 mt-2 inline-block">View regional details →</a>
        </Section>

        <Section title="Recent Storage Activity" className="lg:col-span-4">
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2 px-1.5">Time</th>
                <th className="text-left py-2 px-1.5">Activity</th>
                <th className="text-left py-2 px-1.5">System</th>
                <th className="text-left py-2 px-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a, i) => {
                const I = a.I;
                return (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2 px-1.5 text-slate-700 whitespace-nowrap">{a.time}</td>
                    <td className="py-2 px-1.5 text-slate-800">{a.act}</td>
                    <td className="py-2 px-1.5 font-mono text-[10px] text-slate-700">{a.sys}</td>
                    <td className={`py-2 px-1.5 font-semibold ${a.c}`}><I className="h-3 w-3 inline mr-1" />{a.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 mt-2 inline-block">View all activity →</a>
        </Section>
      </div>

      {/* Row 4: Day 1 Goal Footer */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 items-center text-[11px]">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-blue-50 grid place-items-center"><Flag className="h-5 w-5 text-blue-600" /></div>
            <div>
              <div className="text-[10px] text-slate-500">Day 1 Goal</div>
              <div className="font-bold text-slate-900 leading-tight">100% Storage & Data Platform Ready</div>
            </div>
          </div>
          <div><div className="text-[10px] text-slate-500">Provisioned Capacity Ready</div><div className="text-lg font-extrabold text-emerald-600">100%</div></div>
          <div><div className="text-[10px] text-slate-500">Replication Healthy</div><div className="text-lg font-extrabold text-emerald-600">≥ 98%</div></div>
          <div><div className="text-[10px] text-slate-500">Backup Success Rate</div><div className="text-lg font-extrabold text-emerald-600">≥ 95%</div></div>
          <div><div className="text-[10px] text-slate-500">Integrity Score</div><div className="text-lg font-extrabold text-emerald-600">≥ 98%</div></div>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <div>
              <div className="text-[10px] text-slate-500">Countdown to Day 1</div>
              <div className="text-lg font-extrabold text-slate-900">18 Days</div>
            </div>
          </div>
        </div>
      </div>
    </DashShell>
  );
}
