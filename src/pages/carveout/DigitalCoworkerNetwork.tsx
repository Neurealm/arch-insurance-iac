import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Bot, Workflow, Zap, Clock, CheckCircle, TrendingUp, ShieldCheck, Target,
  Sparkles, Activity, Network, GitBranch,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";

const kpis: KPI[] = [
  { label: "Active Network Bots", value: "28", sub: "Across 6 domains", icon: Bot, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Tasks Today", value: "8,420", sub: "↑ 18% DoD", subColor: "text-emerald-600", icon: Workflow, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Auto-Resolution", value: "82%", sub: "Target 70%", subColor: "text-emerald-600", icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "FTE Hours Saved", value: "1,840 hrs", sub: "MTD", subColor: "text-emerald-600", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Bot Success Rate", value: "96.4%", sub: "↑ 1.8% WoW", subColor: "text-emerald-600", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Avg Task Time", value: "22 sec", sub: "Was 18 min manual", subColor: "text-emerald-600", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Cost Avoided", value: "$142K", sub: "MTD", subColor: "text-emerald-600", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", spark: [88,98,108,118,128,135,142] },
];

const trend = Array.from({ length: 14 }, (_, i) => ({
  d: `D${i + 1}`,
  tasks: 5800 + i * 200 + Math.round(Math.sin(i / 2) * 400),
  saved: 1100 + i * 50 + Math.round(Math.cos(i / 3) * 100),
}));

const bots = [
  { id: "NB-001", name: "BGP Path Recovery", domain: "Routing", runs: 1240, success: 98.4, savings: "$28K", status: "Active" },
  { id: "NB-007", name: "Tunnel Restoration", domain: "SD-WAN", runs: 842, success: 96.8, savings: "$22K", status: "Active" },
  { id: "NB-014", name: "Wi-Fi AP Reset", domain: "Wireless", runs: 612, success: 94.2, savings: "$18K", status: "Active" },
  { id: "NB-021", name: "Firewall Rule Diff", domain: "Security", runs: 484, success: 99.1, savings: "$24K", status: "Active" },
  { id: "NB-028", name: "Cert Renewal", domain: "Identity", runs: 312, success: 100, savings: "$12K", status: "Active" },
  { id: "NB-031", name: "Config Drift Repair", domain: "Standards", runs: 248, success: 92.6, savings: "$38K", status: "In Progress" },
];

const domain = [
  { name: "Routing", value: 28, color: "hsl(217 91% 60%)" },
  { name: "SD-WAN", value: 22, color: "hsl(262 83% 58%)" },
  { name: "Wireless", value: 16, color: "hsl(142 71% 45%)" },
  { name: "Security", value: 14, color: "hsl(38 92% 50%)" },
  { name: "Standards", value: 12, color: "hsl(199 89% 48%)" },
  { name: "Identity", value: 8, color: "hsl(220 9% 60%)" },
];

const queue = [
  { type: "Tunnel restoration", n: 38, sla: "30s" },
  { type: "Wi-Fi AP reboot", n: 24, sla: "1 min" },
  { type: "BGP route refresh", n: 18, sla: "45s" },
  { type: "ACL diff & apply", n: 14, sla: "2 min" },
  { type: "Cert renewal", n: 8, sla: "5 min" },
];

const wwh = {
  what: ["Live view of all network digital coworkers and automations", "Volume, success rate, and value delivered", "Bot inventory and live task queue"],
  why: ["Network ops scale via automation, not headcount", "Engineers focus on architecture and Day 1, bots handle toil", "Consistent execution = fewer P1s"],
  how: ["Agentic bots wired into NSO, Ansible, vManage, Panorama", "ML-driven detection feeds intent classifier", "Closed-loop feedback retrains daily"],
};

const outcomes: Outcome[] = [
  { icon: Zap, color: "text-blue-600", title: "SCALE", l1: "82% auto-resolved" },
  { icon: Clock, color: "text-emerald-600", title: "SPEED", l1: "22s avg vs 18 min" },
  { icon: TrendingUp, color: "text-violet-600", title: "VALUE", l1: "$142K saved MTD" },
  { icon: ShieldCheck, color: "text-emerald-600", title: "QUALITY", l1: "96.4% success" },
  { icon: Sparkles, color: "text-amber-600", title: "INNOVATION", l1: "5 new bots Q2" },
  { icon: Target, color: "text-blue-600", title: "FOCUS", l1: "Engineers on cutover" },
];

export default function DigitalCoworkerNetwork() {
  return (
    <DashShell
      title="DIGITAL COWORKER –"
      highlight="NETWORK AUTOMATION CONSOLE"
      subtitle="Agentic bots running the network 24/7 — every action measured, every dollar tracked."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Section title="Automation Volume & Hours Saved (14d)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <XAxis dataKey="d" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line yAxisId="l" type="monotone" dataKey="tasks" name="Tasks" stroke="hsl(217 91% 60%)" strokeWidth={2} />
                  <Line yAxisId="r" type="monotone" dataKey="saved" name="FTE Min Saved" stroke="hsl(142 71% 45%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Bot Inventory">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-2 px-2">ID</th>
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Domain</th>
                    <th className="text-right py-2 px-2">Runs (7d)</th>
                    <th className="text-right py-2 px-2">Success</th>
                    <th className="text-right py-2 px-2">Savings</th>
                    <th className="text-left py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bots.map((b) => (
                    <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-2 font-mono text-[11px] text-slate-600">{b.id}</td>
                      <td className="py-2 px-2 font-medium text-slate-900">{b.name}</td>
                      <td className="py-2 px-2 text-slate-700">{b.domain}</td>
                      <td className="py-2 px-2 text-right text-slate-700">{b.runs.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right font-semibold text-emerald-700">{b.success}%</td>
                      <td className="py-2 px-2 text-right font-semibold text-slate-900">{b.savings}</td>
                      <td className="py-2 px-2"><StatusPill status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Bots by Domain">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={domain} dataKey="value" nameKey="name" innerRadius={42} outerRadius={72} paddingAngle={2}>
                    {domain.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              {domain.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm" style={{ background: d.color }} />
                  <span className="text-slate-700">{d.name}</span>
                  <span className="ml-auto font-semibold">{d.value}%</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Live Task Queue">
            <div className="space-y-2">
              {queue.map((q) => (
                <div key={q.type} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-900">{q.type}</div>
                    <div className="text-[10px] text-slate-500">SLA: {q.sla}</div>
                  </div>
                  <div className="text-lg font-bold text-blue-600">{q.n}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Bot Health">
            <div className="space-y-2 text-xs">
              {[
                { l: "Avg Latency", v: "162 ms", ok: true },
                { l: "Error Rate", v: "1.1%", ok: true },
                { l: "Queue Depth", v: "184", ok: true },
                { l: "Pending Approvals", v: "4", ok: false },
              ].map((r) => (
                <div key={r.l} className="flex items-center justify-between">
                  <span className="text-slate-700">{r.l}</span>
                  <span className={`font-semibold ${r.ok ? "text-emerald-700" : "text-amber-700"}`}>{r.v}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </DashShell>
  );
}