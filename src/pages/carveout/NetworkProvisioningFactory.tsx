import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  ShoppingCart, Settings, Package, Truck, CheckCircle, Gauge, TrendingUp, Target,
  GitBranch, FileText, Cog, ShieldCheck, Share2, ArrowRight, Globe,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis,
  ComposedChart, Line, CartesianGrid, LineChart,
} from "recharts";

const kpis: KPI[] = [
  { label: "Devices Ordered", value: "1,248", sub: "This Quarter", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Configured", value: "1,102", sub: "88.3%", subColor: "text-slate-600", icon: Settings, color: "text-slate-600", bg: "bg-slate-100" },
  { label: "Staged", value: "956", sub: "76.6%", subColor: "text-slate-600", icon: Package, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Deployed", value: "812", sub: "65.1%", subColor: "text-slate-600", icon: Truck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Delivered (Complete)", value: "732", sub: "58.7%", subColor: "text-slate-600", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Avg. Build Cycle Time", value: "4.2 Days", sub: "↓ 18% vs last QTR", subColor: "text-emerald-600", icon: Gauge, color: "text-slate-600", bg: "bg-slate-100" },
  { label: "Deployment Throughput", value: "27.6 / Week", sub: "↑ 22% vs last QTR", subColor: "text-emerald-600", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Build Success Rate", value: "97.8%", sub: "Excellent", subColor: "text-emerald-600", icon: Target, color: "text-violet-600", bg: "bg-violet-50" },
];

const pipeline = [
  { step: "1. Ordered", icon: ShoppingCart, value: "1,248", pct: "100%", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  { step: "2. Configured", icon: Settings, value: "1,102", pct: "88.3%", bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700" },
  { step: "3. Staged", icon: Package, value: "956", pct: "76.6%", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  { step: "4. Deployed", icon: Truck, value: "812", pct: "65.1%", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
];

const iacItems = [
  { icon: GitBranch, title: "Git Repository", sub: "Version Controlled" },
  { icon: FileText, title: "Templates", sub: "Golden Configs" },
  { icon: Cog, title: "Automation Engine", sub: "Terraform / Ansible" },
  { icon: ShieldCheck, title: "Validation", sub: "Policy & Compliance" },
  { icon: Share2, title: "Deployment", sub: "API Driven" },
];

const racks = [
  { site: "London-02", loc: "UK", stage: "Deployed", rack: "Complete", stack: "Complete", upd: "Feb 13, 10:15 AM", owner: "Field Team A" },
  { site: "Singapore-03", loc: "Singapore", stage: "Staged", rack: "Complete", stack: "In Progress", upd: "Feb 13, 09:48 AM", owner: "Field Team B" },
  { site: "Frankfurt-01", loc: "Germany", stage: "Configured", rack: "N/A", stack: "N/A", upd: "Feb 13, 09:30 AM", owner: "Build Team" },
  { site: "Sao Paulo-01", loc: "Brazil", stage: "Staged", rack: "Complete", stack: "Complete", upd: "Feb 13, 08:55 AM", owner: "Field Team C" },
  { site: "Dubai-01", loc: "UAE", stage: "Deployed", rack: "Complete", stack: "Complete", upd: "Feb 13, 08:40 AM", owner: "Field Team D" },
  { site: "Toronto-01", loc: "Canada", stage: "Configured", rack: "N/A", stack: "N/A", upd: "Feb 13, 08:20 AM", owner: "Build Team" },
  { site: "Jakarta-01", loc: "Indonesia", stage: "Ordered", rack: "Not Started", stack: "Not Started", upd: "Feb 13, 07:45 AM", owner: "Procurement" },
  { site: "Mexico City-01", loc: "Mexico", stage: "Staged", rack: "In Progress", stack: "In Progress", upd: "Feb 13, 07:30 AM", owner: "Field Team E" },
];

const throughput = [
  { d: "Jan 17", v: 18, ma: 19 },
  { d: "Jan 24", v: 22, ma: 22 },
  { d: "Jan 31", v: 24, ma: 25 },
  { d: "Feb 7", v: 26, ma: 28 },
  { d: "Feb 13", v: 32, ma: 31 },
];

const categories = [
  { name: "Routers", value: 349, pct: "28%", color: "hsl(217 91% 60%)" },
  { name: "Switches", value: 399, pct: "32%", color: "hsl(142 71% 45%)" },
  { name: "Firewalls", value: 225, pct: "18%", color: "hsl(38 92% 50%)" },
  { name: "Wireless APs", value: 150, pct: "12%", color: "hsl(262 83% 58%)" },
  { name: "Others", value: 125, pct: "10%", color: "hsl(220 9% 70%)" },
];

const cycle = [
  { stage: "Ordered → Configured", v: 1.4, target: 2 },
  { stage: "Configured → Staged", v: 1.3, target: 2 },
  { stage: "Staged → Deployed", v: 1.2, target: 2 },
  { stage: "Total Cycle Time (Avg.)", v: 4.2, target: 6 },
];

const exceptions = [
  { type: "Config Errors", count: 8, ex: "IP conflict, Policy mismatch" },
  { type: "Missing Information", count: 6, ex: "Site details, Rack info" },
  { type: "Hardware Delay", count: 5, ex: "Vendor lead time" },
  { type: "Validation Failed", count: 3, ex: "Compliance check failed" },
  { type: "Other", count: 2, ex: "Manual intervention" },
];

const wwh = {
  what: [
    "End-to-end device build pipeline: Ordered → Configured → Staged → Deployed",
    "Configuration automation and Infrastructure as Code (IaC) for network",
    "Rack & stack execution tracking across global sites",
    "Deployment throughput, cycle time, and success metrics",
  ],
  why: [
    "Ensures consistency, speed, and quality in network builds",
    "Reduces manual errors and configuration drift",
    "Enables scale to 77+ sites with repeatable processes",
    "Delivers on-time readiness for Day 1 separation",
  ],
  how: [
    "Automated build pipeline with standard templates & golden configs",
    "IaC-driven configuration using version-controlled templates",
    "Real-time tracking of rack & stack and field execution",
    "Quality gates and validation at every stage",
  ],
};

const outcomes: Outcome[] = [
  { icon: Cog, color: "text-blue-600", title: "AUTOMATED & REPEATABLE", l1: "Standard templates, golden configs, and IaC ensure consistency." },
  { icon: Gauge, color: "text-emerald-600", title: "FASTER TIME TO DEPLOY", l1: "Reduced cycle time and higher throughput across all regions." },
  { icon: ShieldCheck, color: "text-violet-600", title: "QUALITY BY DESIGN", l1: "Validation and compliance built into every stage." },
  { icon: Globe, color: "text-blue-600", title: "GLOBAL SCALE", l1: "Factory model built to support 77+ sites and beyond." },
];

function statusText(s: string) {
  const map: Record<string, string> = {
    Complete: "text-emerald-600",
    Deployed: "text-emerald-600",
    Staged: "text-amber-600",
    Configured: "text-blue-600",
    Ordered: "text-slate-600",
    "In Progress": "text-amber-600",
    "Not Started": "text-slate-500",
    "N/A": "text-slate-400",
  };
  return <span className={`text-xs font-semibold ${map[s] ?? "text-slate-700"}`}>{s}</span>;
}

export default function NetworkProvisioningFactory() {
  return (
    <DashShell
      title="NETWORK PROVISIONING &"
      highlight="BUILD FACTORY"
      subtitle="Automated, repeatable, and scalable network build pipeline delivering configured devices to the edge."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Pipeline + IaC + Rack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Device Build Pipeline">
          <div className="flex items-center gap-2">
            {pipeline.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={p.step} className="flex items-center gap-2 flex-1">
                  <div className={`flex-1 rounded-xl border ${p.border} ${p.bg} p-3 text-center`}>
                    <div className={`text-[11px] font-semibold ${p.text}`}>{p.step}</div>
                    <Icon className={`h-6 w-6 ${p.text} mx-auto mt-2`} />
                    <div className="text-2xl font-extrabold text-slate-900 mt-1">{p.value}</div>
                    <div className="text-[11px] text-slate-600">{p.pct}</div>
                  </div>
                  {i < pipeline.length - 1 && <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />}
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Pipeline Completion</span>
              <span className="font-bold text-slate-900">65.1%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "65.1%" }} />
            </div>
          </div>
        </Section>

        <Section title="Configuration Automation (IaC)">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              {iacItems.map((it) => {
                const Icon = it.icon;
                return (
                  <div key={it.title} className="flex items-center gap-2 p-1.5 rounded bg-slate-50 border border-slate-100">
                    <div className="h-7 w-7 rounded-lg bg-white border border-slate-200 grid place-items-center">
                      <Icon className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-slate-800 truncate">{it.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{it.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-700 text-center mb-1">Template Compliance</div>
              <div className="relative h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ v: 98, c: "hsl(142 71% 45%)" }, { v: 2, c: "hsl(220 13% 91%)" }]} dataKey="v" innerRadius={36} outerRadius={52} startAngle={90} endAngle={-270}>
                      <Cell fill="hsl(142 71% 45%)" />
                      <Cell fill="hsl(220 13% 91%)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-xl font-extrabold text-slate-900">98%</div>
                  <div className="text-[9px] text-emerald-600 font-semibold">Compliant</div>
                </div>
              </div>
              <div className="mt-2 text-[11px]">
                <div className="text-slate-600 font-medium">IaC Deployments (This Quarter)</div>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-extrabold text-slate-900">1,102</div>
                  <div className="h-6 w-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[{ v: 5 }, { v: 7 }, { v: 8 }, { v: 11 }, { v: 14 }]}>
                        <Line type="monotone" dataKey="v" stroke="hsl(217 91% 60%)" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="text-slate-700 mt-1">Successful Deployments</div>
                <div className="text-emerald-700 font-semibold">1,078 (97.8%)</div>
                <div className="text-slate-700 mt-1">Failed Deployments</div>
                <div className="text-red-600 font-semibold">24 (2.2%)</div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Rack & Stack Execution Tracking">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-2">Site</th>
                  <th className="text-left py-2">Location</th>
                  <th className="text-left py-2">Stage</th>
                  <th className="text-left py-2">Rack</th>
                  <th className="text-left py-2">Stack</th>
                  <th className="text-left py-2">Last Update</th>
                  <th className="text-left py-2">Owner</th>
                </tr>
              </thead>
              <tbody>
                {racks.map((r) => (
                  <tr key={r.site} className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-800 font-medium">{r.site}</td>
                    <td className="py-1.5 text-slate-700">{r.loc}</td>
                    <td className="py-1.5">{statusText(r.stage)}</td>
                    <td className="py-1.5">{statusText(r.rack)}</td>
                    <td className="py-1.5">{statusText(r.stack)}</td>
                    <td className="py-1.5 text-slate-600 text-[11px]">{r.upd}</td>
                    <td className="py-1.5 text-slate-700">{r.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* Row 2: Throughput + Categories + Cycle + Exceptions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Section title="Deployment Throughput (Trend)">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={throughput} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="v" fill="hsl(217 91% 60%)" radius={[3, 3, 0, 0]} barSize={24} />
                <Line type="monotone" dataKey="ma" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-600">
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-blue-500 rounded-sm" />Devices Deployed</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-500 rounded-full" />7-Day Moving Average</span>
          </div>
        </Section>

        <Section title="Device Category Breakdown">
          <div className="relative h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="value" innerRadius={42} outerRadius={70} paddingAngle={2}>
                  {categories.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-xl font-extrabold text-slate-900">1,248</div>
              <div className="text-[10px] text-slate-500">Total Ordered</div>
            </div>
          </div>
          <div className="space-y-1 mt-2 text-[11px]">
            {categories.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                <span className="text-slate-700">{c.name}</span>
                <span className="ml-auto font-semibold text-slate-900">{c.pct} ({c.value})</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Build Cycle Time (By Stage)">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Stage</th>
                <th className="text-right py-1.5"></th>
                <th className="text-right py-1.5">Target</th>
              </tr>
            </thead>
            <tbody>
              {cycle.map((c) => (
                <tr key={c.stage} className="border-b border-slate-100">
                  <td className="py-2 text-slate-800 text-[11px]">{c.stage}</td>
                  <td className="py-2 w-1/2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(c.v / 6) * 100}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 w-14 text-right">{c.v} Days</span>
                    </div>
                  </td>
                  <td className="py-2 text-right text-[11px] text-slate-600">{c.target} Days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Exceptions & Blockers">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Type</th>
                <th className="text-center py-1.5">Count</th>
                <th className="text-left py-1.5">Examples</th>
              </tr>
            </thead>
            <tbody>
              {exceptions.map((e) => (
                <tr key={e.type} className="border-b border-slate-100">
                  <td className="py-2 text-slate-800 font-medium">{e.type}</td>
                  <td className="py-2 text-center">
                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">{e.count}</span>
                  </td>
                  <td className="py-2 text-slate-600 text-[11px]">{e.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </DashShell>
  );
}
