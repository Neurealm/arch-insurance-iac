import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { KPIStatCard, SectionCard } from "../components/primitives";
import {
  chartCostByLayer, chartExecutions, chartLatency, chartTokensByAgent, opsMetrics,
} from "../data";
import { Activity, DollarSign, Zap, Timer, CheckCircle2, AlertTriangle } from "lucide-react";

const COLORS = ["#4f46e5", "#7c3aed", "#0d9488", "#2563eb", "#d97706", "#e11d48"];

const iconFor: Record<string, any> = {
  "Agent Health": CheckCircle2,
  "Workflow Success": CheckCircle2,
  "Avg Response": Timer,
  "Approval Queue": AlertTriangle,
  "Tokens Today": Zap,
  "Cost Trend": DollarSign,
  "Failed Tools": AlertTriangle,
  "Policy Violations": CheckCircle2,
  "Retrieval Quality": Activity,
  "SLO Status": CheckCircle2,
};

export default function ObservabilityOps() {
  return (
    <div className="space-y-4">
      <SectionCard title="Operations cockpit" subtitle="Live view across agents, workflows, tools, and cost">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {opsMetrics.map((m) => (
            <KPIStatCard key={m.label} label={m.label} value={m.value} tone={m.tone as any} icon={iconFor[m.label]} />
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Daily agent executions" subtitle="Success vs failure rate">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartExecutions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="success" stackId="a" fill="#4f46e5" name="Success" />
                <Bar dataKey="failed" stackId="a" fill="#e11d48" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Token usage by agent" subtitle="Millions of tokens · rolling 7d">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartTokensByAgent} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="agent" type="category" tick={{ fontSize: 11 }} width={110} />
                <Tooltip />
                <Bar dataKey="tokens" fill="#7c3aed" name="Tokens (M)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Cost by platform layer" subtitle="% of monthly platform run rate">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartCostByLayer} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={2}>
                  {chartCostByLayer.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Latency by workflow" subtitle="p50 vs p95 seconds">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartLatency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="workflow" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="p50" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="p95" stroke="#e11d48" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Operational surface" subtitle="Everything captured, correlated, and audited">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            "Logs", "Metrics", "Traces", "Prompt / response logging",
            "Audit trail", "Agent execution history", "Incident queue", "Runbook triggers",
          ].map((s) => (
            <div key={s} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[12px] text-slate-700">
              {s}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
