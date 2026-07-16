import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Server, CheckCircle, RefreshCw, Clock, AlertOctagon, Gauge, TrendingUp, Calendar,
  ClipboardList, Wrench, Settings, ShieldCheck, Rocket, Code2, Info, AlertTriangle, ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, LineChart,
} from "recharts";

const kpis: KPI[] = [
  { label: "Total Build Requests", value: "1,284", sub: "All Time", subColor: "text-slate-500", icon: Server, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Builds Completed", value: "986", sub: "77.0%", subColor: "text-emerald-600", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "In Progress", value: "198", sub: "15.4%", subColor: "text-amber-600", icon: RefreshCw, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Queued", value: "72", sub: "5.6%", subColor: "text-violet-600", icon: Clock, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Failed", value: "28", sub: "2.0%", subColor: "text-red-600", icon: AlertOctagon, color: "text-red-600", bg: "bg-red-50" },
  { label: "Avg Build Time", value: "2h 47m", sub: "↓ 18% vs last 7 days", subColor: "text-emerald-600", icon: Gauge, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Throughput (Daily Avg)", value: "86", sub: "Builds / Day", subColor: "text-slate-500", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Success Rate", value: "97.8%", sub: "↑ 1.6% vs last 7 days", subColor: "text-emerald-600", icon: Calendar, color: "text-violet-600", bg: "bg-violet-50" },
];

const wwh = {
  what: ["The Compute Build Factory — a system that mass-produces standardized server environments through an automated pipeline."],
  why: ["Manual server builds cannot scale across hundreds or thousands of workloads. Automation drives speed, quality, and consistency."],
  how: [
    "Pipeline-driven provisioning (request → build → configure → deploy)",
    "Infrastructure-as-Code for compute",
    "Standard templates and golden configurations",
    "Throughput and build cycle tracking",
  ],
};

const outcomes: Outcome[] = [
  { icon: Rocket, color: "text-emerald-600", title: "SCALE", l1: "986 builds completed" },
  { icon: Gauge, color: "text-blue-600", title: "SPEED", l1: "Avg 2h 47m / build" },
  { icon: ShieldCheck, color: "text-emerald-600", title: "QUALITY", l1: "97.8% success rate" },
  { icon: Code2, color: "text-violet-600", title: "AUTOMATION", l1: "95.4% IaC coverage" },
  { icon: TrendingUp, color: "text-emerald-600", title: "THROUGHPUT", l1: "86 builds / day" },
];

const stages = [
  { n: 1, name: "Request", value: "1,284", sub: "Requests", color: "blue", icon: ClipboardList, items: ["Service Catalog", "Approval", "Validation"] },
  { n: 2, name: "Build", value: "198", sub: "In Progress", color: "emerald", icon: Wrench, items: ["Provision Hardware", "Install OS", "Apply Base Image"] },
  { n: 3, name: "Configure", value: "198", sub: "In Progress", color: "violet", icon: Settings, items: ["Apply Configuration", "Join Domain", "Install Agents"] },
  { n: 4, name: "Test & Validate", value: "146", sub: "In Progress", color: "amber", icon: ShieldCheck, items: ["Functional Tests", "Security Validation", "Performance Check"] },
  { n: 5, name: "Deploy", value: "986", sub: "Completed", color: "teal", icon: Rocket, items: ["Register", "Hand-off to Ops", "Ready for Workload"] },
];

const stageTone: Record<string, { bg: string; border: string; text: string; iconBg: string; iconColor: string }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  teal: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", iconBg: "bg-teal-100", iconColor: "text-teal-600" },
};

const throughput = Array.from({ length: 30 }, (_, i) => {
  const base = 60 + Math.sin(i / 3) * 18 + Math.random() * 12;
  return {
    d: `Apr ${13 + i > 30 ? `May ${13 + i - 30}` : 13 + i}`,
    builds: Math.round(base),
    time: +(2.5 + Math.cos(i / 4) * 0.6 + Math.random() * 0.3).toFixed(1),
  };
});

const cycleTime = Array.from({ length: 30 }, (_, i) => ({
  d: `D${i + 1}`,
  hrs: +(2.4 + Math.sin(i / 3) * 0.5 + (Math.random() * 0.4 - 0.2)).toFixed(2),
}));

const queue = [
  { id: "REQ-12568", env: "Production", tpl: "Web Server Standard", status: "In Progress", elapsed: "01:24:15", target: "May 12, 2:30 PM" },
  { id: "REQ-12569", env: "Production", tpl: "App Server Standard", status: "In Progress", elapsed: "00:58:42", target: "May 12, 2:10 PM" },
  { id: "REQ-12570", env: "Non-Prod", tpl: "DB Server Standard", status: "In Progress", elapsed: "00:47:31", target: "May 12, 1:55 PM" },
  { id: "REQ-12571", env: "Non-Prod", tpl: "Analytics Node", status: "Queued", elapsed: "00:10:03", target: "May 12, 3:15 PM" },
  { id: "REQ-12572", env: "Production", tpl: "API Server Standard", status: "Queued", elapsed: "00:08:21", target: "May 12, 3:30 PM" },
];

const buildsByEnv = [
  { name: "Production", value: 512, pct: "52.0%", color: "#3b82f6" },
  { name: "Non-Production", value: 312, pct: "31.7%", color: "#22c55e" },
  { name: "Development", value: 98, pct: "10.0%", color: "#f59e0b" },
  { name: "Test", value: 64, pct: "6.5%", color: "#a855f7" },
];

const templates = [
  { name: "Web Server Standard", os: "RHEL 8.8", cpu: 4, ram: "16 GB", usage: 248, success: "98.6%" },
  { name: "App Server Standard", os: "Windows Server 2022", cpu: 8, ram: "32 GB", usage: 214, success: "97.7%" },
  { name: "DB Server Standard", os: "RHEL 8.8", cpu: 16, ram: "64 GB", usage: 162, success: "98.1%" },
  { name: "Analytics Node", os: "Ubuntu 22.04", cpu: 16, ram: "64 GB", usage: 118, success: "97.5%" },
  { name: "API Server Standard", os: "Windows Server 2022", cpu: 4, ram: "16 GB", usage: 96, success: "96.9%" },
];

const repos = [
  { name: "Terraform Modules", total: 128, change: "↑ 6%" },
  { name: "Ansible Playbooks", total: 86, change: "↑ 4%" },
  { name: "Packer Images", total: 54, change: "↑ 8%" },
  { name: "Policies / Guardrails", total: 72, change: "↑ 5%" },
];

const activities = [
  { icon: CheckCircle, color: "text-emerald-600", text: "512 builds completed successfully", time: "May 12, 2026 09:15 AM" },
  { icon: Info, color: "text-blue-600", text: "New template 'GPU Compute Node' published", time: "May 11, 2026 04:32 PM" },
  { icon: Info, color: "text-blue-600", text: "Base image Windows Server 2022 v3 updated", time: "May 11, 2026 11:08 AM" },
  { icon: AlertTriangle, color: "text-red-500", text: "28 build failures detected and remediated", time: "May 10, 2026 02:30 PM" },
  { icon: Info, color: "text-blue-600", text: "IaC module 'networking-v2' released", time: "May 09, 2026 10:21 AM" },
];

function statusTone(s: string) {
  if (/in progress/i.test(s)) return "bg-amber-50 text-amber-700 border-amber-200";
  if (/queued/i.test(s)) return "bg-violet-50 text-violet-700 border-violet-200";
  if (/complete|success/i.test(s)) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function ServerStorageFactory() {
  return (
    <DashShell
      title="SERVER PROVISIONING & BUILD FACTORY"
      highlight="(COMPUTE LAYER)"
      subtitle="Industrialized, pipeline-driven server builds delivering standardized, secure, and scalable compute environments."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Pipeline Overview | Throughput */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Section title="Build Pipeline Overview" className="lg:col-span-7">
          <div className="flex items-stretch gap-1.5">
            {stages.map((s, i) => {
              const t = stageTone[s.color];
              const Icon = s.icon;
              return (
                <div key={s.n} className="flex items-stretch flex-1">
                  <div className={`flex-1 rounded-lg border ${t.border} ${t.bg} p-2.5`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`h-6 w-6 rounded ${t.iconBg} grid place-items-center`}>
                        <Icon className={`h-3.5 w-3.5 ${t.iconColor}`} />
                      </div>
                      <div className={`text-[11px] font-bold ${t.text}`}>{s.n}. {s.name}</div>
                    </div>
                    <div className="text-center my-1">
                      <div className={`text-xl font-extrabold ${t.text}`}>{s.value}</div>
                      <div className="text-[10px] text-slate-600">{s.sub}</div>
                    </div>
                    <ul className="text-[10px] text-slate-700 space-y-0.5 list-disc list-inside leading-tight">
                      {s.items.map((it) => <li key={it}>{it}</li>)}
                    </ul>
                  </div>
                  {i < stages.length - 1 && <div className="flex items-center px-0.5"><ArrowRight className="h-4 w-4 text-slate-400" /></div>}
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Build Throughput (Last 30 Days)" className="lg:col-span-5">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={throughput} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 9 }} interval={4} />
                <YAxis yAxisId="l" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} unit="h" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="l" dataKey="builds" name="Builds Completed" fill="#60a5fa" radius={[3, 3, 0, 0]} />
                <Line yAxisId="r" dataKey="time" name="Avg Build Time (hrs)" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* Row 2: Build Queue | Builds by Env | Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Build Queue (Live)" className="lg:col-span-4">
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2 px-1.5">Request ID</th>
                <th className="text-left py-2 px-1.5">Environment</th>
                <th className="text-left py-2 px-1.5">Template</th>
                <th className="text-left py-2 px-1.5">Status</th>
                <th className="text-left py-2 px-1.5">Elapsed</th>
                <th className="text-left py-2 px-1.5">Target</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="py-2 px-1.5 font-mono text-[10px] text-slate-700">{r.id}</td>
                  <td className="py-2 px-1.5 text-slate-700">{r.env}</td>
                  <td className="py-2 px-1.5 text-slate-800">{r.tpl}</td>
                  <td className="py-2 px-1.5"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusTone(r.status)}`}>{r.status}</span></td>
                  <td className="py-2 px-1.5 font-mono text-[10px] text-slate-700">{r.elapsed}</td>
                  <td className="py-2 px-1.5 text-slate-700">{r.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Builds by Environment" className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={buildsByEnv} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2} stroke="none">
                    {buildsByEnv.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-2xl font-extrabold text-slate-900 leading-none">986</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Completed</div>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 text-[11px]">
              {buildsByEnv.map((b) => (
                <div key={b.name} className="flex items-center justify-between">
                  <div className="flex items-center"><span className="h-2 w-2 rounded-sm mr-1.5" style={{ background: b.color }} /><span className="text-slate-700">{b.name}</span></div>
                  <span className="font-semibold text-slate-800">{b.value} <span className="text-slate-500">({b.pct})</span></span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Templates & Golden Configurations" className="lg:col-span-4">
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2 px-1.5">Template Name</th>
                <th className="text-left py-2 px-1.5">OS / Platform</th>
                <th className="text-left py-2 px-1.5">vCPU</th>
                <th className="text-left py-2 px-1.5">RAM</th>
                <th className="text-left py-2 px-1.5">Usage</th>
                <th className="text-left py-2 px-1.5">Success</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.name} className="border-b border-slate-100">
                  <td className="py-2 px-1.5 text-slate-800">{t.name}</td>
                  <td className="py-2 px-1.5 text-slate-700">{t.os}</td>
                  <td className="py-2 px-1.5 text-slate-700">{t.cpu}</td>
                  <td className="py-2 px-1.5 text-slate-700">{t.ram}</td>
                  <td className="py-2 px-1.5 text-slate-700">{t.usage}</td>
                  <td className="py-2 px-1.5 text-emerald-700 font-semibold">{t.success}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>

      {/* Row 3: IaC | Repos | Cycle Time | Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Infrastructure as Code (IaC) Summary" className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-lg bg-blue-50 grid place-items-center">
              <Code2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-[11px] text-slate-600">IaC Coverage</div>
              <div className="text-2xl font-extrabold text-slate-900 leading-none">95.4%</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-700 mt-3">Builds via IaC</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: "94%" }} />
            </div>
            <span className="text-[10px] text-slate-700">94%</span>
          </div>
        </Section>

        <Section title="Code Repositories" className="lg:col-span-3">
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-2 px-1.5"></th>
                <th className="text-right py-2 px-1.5">Total</th>
                <th className="text-right py-2 px-1.5">Change (7D)</th>
              </tr>
            </thead>
            <tbody>
              {repos.map((r) => (
                <tr key={r.name} className="border-b border-slate-100">
                  <td className="py-2 px-1.5 text-slate-800">{r.name}</td>
                  <td className="py-2 px-1.5 text-right text-slate-700">{r.total}</td>
                  <td className="py-2 px-1.5 text-right text-emerald-600 font-semibold">{r.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Build Cycle Time Trend (Hours)" className="lg:col-span-4">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cycleTime} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 9 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} unit="h" domain={[0, 5]} />
                <Tooltip />
                <Line dataKey="hrs" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Recent Activity (Last 7 Days)" className="lg:col-span-3">
          <div className="space-y-2">
            {activities.map((a, i) => {
              const I = a.icon;
              return (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <I className={`h-3.5 w-3.5 mt-0.5 ${a.color} shrink-0`} />
                  <div className="flex-1 text-slate-800 leading-tight">{a.text}</div>
                  <div className="text-[9px] text-slate-500 shrink-0 whitespace-nowrap">{a.time}</div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </DashShell>
  );
}
