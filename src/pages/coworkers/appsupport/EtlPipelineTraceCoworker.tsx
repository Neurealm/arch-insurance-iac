import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Bot, Boxes, CheckCircle, Cloud,
  Cpu, Database, DollarSign, Download, GitBranch, GitCommit, GitMerge, Layers,
  LineChart, MessageSquare, Network, Play, RefreshCw, Search, Server, Settings,
  Shield, Sparkles, TrendingUp, Users, Workflow, Zap, Clock, FileText, Filter,
  ChevronRight, XCircle, PieChart, Gauge, Waves,
} from "lucide-react";

/* ============================================================================
   ETL PIPELINE TRACE CO-WORKER — Enterprise Data Operations Platform
   ============================================================================ */

const kpis = [
  { label: "Overall Pipeline Health", value: "98.7%", sub: "Healthy", icon: Shield, tone: "emerald" },
  { label: "Running Pipelines", value: "312", sub: "Running", icon: Play, tone: "blue" },
  { label: "Failed Pipelines", value: "18", sub: "Failed", icon: XCircle, tone: "rose" },
  { label: "Delayed Pipelines", value: "27", sub: "Delayed", icon: Clock, tone: "amber" },
  { label: "Average Runtime", value: "42m 18s", sub: "Today", icon: Gauge, tone: "violet" },
  { label: "Data Freshness", value: "18m", sub: "Avg. Lag", icon: Waves, tone: "cyan" },
  { label: "SLA Compliance", value: "96.2%", sub: "Compliant", icon: CheckCircle, tone: "emerald" },
  { label: "Records Processed Today", value: "4.73B", sub: "+12.4% vs yesterday", icon: Database, tone: "blue" },
  { label: "AI Predicted Failures", value: "6", sub: "Next 24 Hours", icon: AlertTriangle, tone: "rose" },
  { label: "Automated Recoveries", value: "47", sub: "Today", icon: RefreshCw, tone: "emerald" },
  { label: "Revenue at Risk", value: "$2.34M", sub: "Potential Impact", icon: DollarSign, tone: "amber" },
  { label: "Business Processes Impacted", value: "14", sub: "High Impact", icon: Users, tone: "violet" },
];

const toneMap: Record<string, { bg: string; text: string; ring: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-200" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-700", ring: "ring-cyan-200" },
};

const topologyRows: { title: string; items: { name: string; icon: any; color: string }[] }[] = [
  { title: "Source Systems", items: [
    { name: "CRM", icon: Users, color: "text-blue-600" },
    { name: "ERP", icon: Boxes, color: "text-violet-600" },
    { name: "Epic", icon: Activity, color: "text-rose-600" },
    { name: "Salesforce", icon: Cloud, color: "text-sky-600" },
    { name: "SAP", icon: Server, color: "text-indigo-600" },
    { name: "Oracle", icon: Database, color: "text-red-600" },
    { name: "Azure SQL", icon: Database, color: "text-blue-500" },
  ]},
  { title: "Ingestion", items: [
    { name: "Landing Zone", icon: Layers, color: "text-slate-700" },
    { name: "Transformation", icon: Workflow, color: "text-violet-700" },
    { name: "Validation", icon: CheckCircle, color: "text-emerald-700" },
    { name: "Enrichment", icon: Sparkles, color: "text-amber-700" },
    { name: "Aggregation", icon: Layers, color: "text-blue-700" },
  ]},
  { title: "Storage", items: [
    { name: "Feature Store", icon: Database, color: "text-indigo-600" },
    { name: "Warehouse", icon: Database, color: "text-blue-600" },
    { name: "Lakehouse", icon: Database, color: "text-violet-600" },
    { name: "Data Marts", icon: Database, color: "text-emerald-600" },
  ]},
  { title: "Analytics & Visualization", items: [
    { name: "Power BI", icon: BarChart3, color: "text-yellow-600" },
    { name: "Tableau", icon: PieChart, color: "text-blue-600" },
    { name: "Looker", icon: LineChart, color: "text-violet-600" },
    { name: "Databricks SQL", icon: Database, color: "text-red-600" },
    { name: "Excel", icon: FileText, color: "text-emerald-700" },
    { name: "Custom Apps", icon: Layers, color: "text-slate-600" },
  ]},
  { title: "Consumers", items: [
    { name: "Executive Dashboard", icon: BarChart3, color: "text-blue-700" },
    { name: "Reports", icon: FileText, color: "text-slate-700" },
    { name: "Business Users", icon: Users, color: "text-emerald-700" },
    { name: "Data Scientists", icon: Cpu, color: "text-violet-700" },
    { name: "AI/ML Models", icon: Bot, color: "text-rose-700" },
    { name: "Partners", icon: Network, color: "text-amber-700" },
  ]},
];

const pipelines = [
  { name: "Customer 360 Load", platform: "Azure Data Factory", status: "Success", last: "5 min ago", dur: "12m 32s", rec: "125.3M", err: "0.02%", owner: "Data Eng Team", impact: "High" },
  { name: "Sales Daily Aggregation", platform: "Databricks", status: "Success", last: "8 min ago", dur: "16m 12s", rec: "87.6M", err: "0.01%", owner: "Analytics Team", impact: "High" },
  { name: "Finance GL Pipeline", platform: "Informatica", status: "Delayed", last: "15 min ago", dur: "27m 08s", rec: "23.8M", err: "0.11%", owner: "Finance IT", impact: "High" },
  { name: "Inventory Snapshot", platform: "Azure Data Factory", status: "Success", last: "22 min ago", dur: "9m 41s", rec: "42.1M", err: "0.03%", owner: "Data Eng Team", impact: "Medium" },
  { name: "Patient Claims ETL", platform: "Talend", status: "Failed", last: "20 min ago", dur: "30m 05s", rec: "—", err: "3.45%", owner: "Health Ops", impact: "High" },
  { name: "Web Log Processing", platform: "Databricks (Spark)", status: "Success", last: "3 min ago", dur: "18m 26s", rec: "1.2B", err: "0.02%", owner: "Analytics Team", impact: "Medium" },
  { name: "Marketing Attribution", platform: "dbt Cloud", status: "Success", last: "7 min ago", dur: "14m 09s", rec: "12.4M", err: "0.04%", owner: "Marketing Ops", impact: "Medium" },
  { name: "Supplier Data Sync", platform: "SSIS", status: "Delayed", last: "45 min ago", dur: "45m 21s", rec: "8.4M", err: "0.12%", owner: "Supply Chain", impact: "Medium" },
  { name: "IoT Telemetry Pipeline", platform: "Azure Synapse", status: "Success", last: "1 min ago", dur: "19m 47s", rec: "2.68B", err: "0.02%", owner: "Data Platform", impact: "Medium" },
  { name: "Fraud Detection Features", platform: "Databricks", status: "Success", last: "6 min ago", dur: "26m 38s", rec: "310.4M", err: "0.02%", owner: "ML Engineering", impact: "High" },
];

const traceSteps = [
  { name: "Extract - CRM", input: "1,245", output: "1,245", dur: "00:00:18" },
  { name: "Transform - Standardize", input: "1,245", output: "1,243", dur: "00:00:21" },
  { name: "Data Cleansing", input: "1,243", output: "1,238", dur: "00:00:23" },
  { name: "Validation", input: "1,238", output: "1,238", dur: "00:00:11" },
  { name: "Lookup - Customer Ref", input: "1,238", output: "1,238", dur: "00:00:16" },
  { name: "Enrichment - Demographics", input: "1,238", output: "1,238", dur: "00:00:19" },
  { name: "Business Rules", input: "1,238", output: "1,226", dur: "00:00:14" },
  { name: "Deduplication", input: "1,226", output: "1,223", dur: "00:00:08" },
  { name: "Load - Data Warehouse", input: "1,223", output: "1,223", dur: "00:00:22" },
  { name: "Post Load - Verification", input: "1,223", output: "1,223", dur: "00:00:09" },
];

const queues = [
  { name: "customer-events", plat: "Kafka", depth: "125,342", cons: 6, prod: 12, lag: "12,342", dlq: 1, trend: "Healthy" },
  { name: "order-queue", plat: "RabbitMQ", depth: "3,415", cons: 28, prod: 6, lag: "125", dlq: 0, trend: "Warning" },
  { name: "payment-queue", plat: "Azure Service Bus", depth: "18,421", cons: 34, prod: 8, lag: "1,245", dlq: 3, trend: "Warning" },
  { name: "ibm.mq.orders", plat: "IBM MQ", depth: "2,102", cons: 22, prod: 4, lag: "812", dlq: 0, trend: "Healthy" },
  { name: "shipment.topic", plat: "Kafka", depth: "45,987", cons: 62, prod: 14, lag: "44,987", dlq: 2, trend: "Warning" },
  { name: "etl-dlq", plat: "SQS", depth: "842", cons: 2, prod: 1, lag: "842", dlq: 842, trend: "Critical" },
  { name: "inventory.events", plat: "Google Pub/Sub", depth: "12,230", cons: 18, prod: 6, lag: "2,310", dlq: 4, trend: "Healthy" },
];

const dataQuality = [
  { m: "Quality Score", v: "97.3%", d: "▲ 2.1%", tone: "emerald" },
  { m: "Completeness", v: "98.6%", d: "▲ 1.8%", tone: "emerald" },
  { m: "Validity", v: "97.1%", d: "▲ 1.2%", tone: "emerald" },
  { m: "Uniqueness", v: "96.4%", d: "▼ 0.5%", tone: "rose" },
  { m: "Consistency", v: "97.5%", d: "▲ 2.6%", tone: "emerald" },
];

const activity = [
  { time: "10:24:31", msg: "Pipeline Customer 360 Load completed successfully", tone: "Success" },
  { time: "10:24:52", msg: "Data quality scan completed - Score 97.3%", tone: "Success" },
  { time: "10:24:15", msg: "Reference data lag detected in CUSTOMER_REF_TABLE", tone: "Warning" },
  { time: "10:24:10", msg: "Predicted SLA breach for Payment ETL pipeline", tone: "Warning" },
  { time: "10:23:59", msg: "Scaling Spark cluster for Web Log Processing", tone: "Success" },
  { time: "10:23:59", msg: "Replayed 842 messages from etl-dlq queue", tone: "Success" },
  { time: "10:23:42", msg: "Incident INC-87321 updated and resolved", tone: "Success" },
  { time: "10:23:31", msg: "Schema drift detected in source field CUST_TYPE", tone: "Info" },
];

const businessImpact = [
  { m: "Revenue at Risk (per hour)", v: "$389,450", pct: 78 },
  { m: "Orders Impacted", v: "12,245", pct: 62 },
  { m: "Customers Impacted", v: "235,112", pct: 71 },
  { m: "Reports Impacted", v: "18", pct: 48 },
  { m: "Dashboards Impacted", v: "7", pct: 32 },
  { m: "SLA Breach in", v: "2h 14m", pct: 85 },
];

const statusChip = (s: string) => {
  const map: Record<string, string> = {
    Success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Delayed: "bg-amber-50 text-amber-700 border-amber-200",
    Failed: "bg-rose-50 text-rose-700 border-rose-200",
    Healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Warning: "bg-amber-50 text-amber-700 border-amber-200",
    Critical: "bg-rose-50 text-rose-700 border-rose-200",
    Info: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return map[s] ?? "bg-slate-50 text-slate-700 border-slate-200";
};

export default function EtlPipelineTraceCoworker() {
  const [tab, setTab] = useState("Executive Summary");

  return (
    <AppShell>
      <main className="flex-1 px-6 py-5 bg-slate-50/50 animate-fade-in min-w-0">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-9 w-9 rounded-lg bg-blue-900 text-white grid place-items-center">
                <Workflow className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wide text-slate-500">Digital Coworker</div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  ETL Pipeline Trace Co-worker
                  <span className="ml-2 text-[10px] font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 px-2 py-0.5 rounded align-middle">AI POWERED</span>
                </h1>
              </div>
            </div>
            <p className="text-xs italic text-slate-600 max-w-3xl">
              Mission: Continuously trace, monitor, and optimize enterprise ETL pipelines end-to-end. Provide full data lineage, performance insights, and AI-driven root cause analysis to ensure trusted data delivery for every business.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            {[
              { l: "Operational", v: "All Systems Normal", dot: "bg-emerald-500" },
              { l: "Pipelines Monitored", v: "2,846" },
              { l: "Data Sources", v: "1,328" },
              { l: "Destinations", v: "512" },
              { l: "Records Processed Today", v: "4.73B" },
              { l: "Last Analysis", v: "5 Seconds Ago" },
              { l: "AI Engine", v: "Active", dot: "bg-emerald-500" },
            ].map((s) => (
              <div key={s.l} className="text-right">
                <div className="flex items-center justify-end gap-1 text-[9px] uppercase font-semibold text-slate-500">
                  {s.dot && <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />} {s.l}
                </div>
                <div className="font-bold text-slate-900">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2.5 mb-4">
          {kpis.map((k) => {
            const t = toneMap[k.tone];
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur p-3 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="text-[10px] font-semibold uppercase text-slate-500 tracking-wide leading-tight">{k.label}</div>
                  <div className={`h-6 w-6 rounded-md grid place-items-center ${t.bg} ${t.text}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="mt-1 text-xl font-extrabold text-slate-900 leading-tight">{k.value}</div>
                <div className={`text-[10px] font-semibold ${t.text}`}>{k.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Row: Topology + Pipeline health + Live trace + Selected pipeline */}
        <div className="grid grid-cols-12 gap-3 mb-3">
          {/* Topology */}
          <div className="col-span-12 xl:col-span-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-800">Enterprise Data Flow Topology</div>
              <div className="flex items-center gap-1 text-slate-500">
                <Search className="h-3.5 w-3.5" /><Filter className="h-3.5 w-3.5" /><Settings className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="space-y-1.5">
              {topologyRows.map((row) => (
                <div key={row.title}>
                  <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500 mb-1">{row.title}</div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {row.items.map((it, idx) => {
                      const Icon = it.icon;
                      return (
                        <div key={it.name} className="flex items-center">
                          <div className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer min-w-[62px]">
                            <Icon className={`h-4 w-4 ${it.color}`} />
                            <div className="text-[9px] font-semibold text-slate-700 text-center leading-tight">{it.name}</div>
                          </div>
                          {idx < row.items.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-slate-400 mx-0.5" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[9px]">
              {[
                { c: "bg-emerald-500", l: "Healthy" },
                { c: "bg-amber-500", l: "Warning" },
                { c: "bg-orange-500", l: "Degraded" },
                { c: "bg-rose-500", l: "Critical" },
                { c: "bg-slate-400", l: "Unknown" },
              ].map((x) => (
                <div key={x.l} className="flex items-center gap-1"><span className={`h-1.5 w-1.5 rounded-full ${x.c}`} /><span className="text-slate-600">{x.l}</span></div>
              ))}
            </div>
          </div>

          {/* Pipeline health dashboard */}
          <div className="col-span-12 xl:col-span-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-800">Pipeline Health Dashboard</div>
              <div className="flex items-center gap-1">
                <select className="text-[10px] border border-slate-200 rounded px-1 py-0.5"><option>All Platforms</option></select>
                <select className="text-[10px] border border-slate-200 rounded px-1 py-0.5"><option>All Environments</option></select>
              </div>
            </div>
            <div className="overflow-auto max-h-[380px]">
              <table className="w-full text-[10px]">
                <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200 sticky top-0 bg-white">
                  <tr className="text-left">
                    <th className="py-1 pr-2 font-semibold">Pipeline Name</th>
                    <th className="py-1 pr-2 font-semibold">Platform</th>
                    <th className="py-1 pr-2 font-semibold">Status</th>
                    <th className="py-1 pr-2 font-semibold">Last Run</th>
                    <th className="py-1 pr-2 font-semibold">Duration</th>
                    <th className="py-1 pr-2 font-semibold">Records</th>
                    <th className="py-1 pr-2 font-semibold">Error Rate</th>
                    <th className="py-1 pr-2 font-semibold">Owner</th>
                    <th className="py-1 pr-2 font-semibold">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pipelines.map((p) => (
                    <tr key={p.name} className="hover:bg-slate-50 cursor-pointer">
                      <td className="py-1 pr-2 font-semibold text-slate-800">{p.name}</td>
                      <td className="py-1 pr-2 text-slate-600">{p.platform}</td>
                      <td className="py-1 pr-2"><span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-semibold ${statusChip(p.status)}`}>
                        <span className={`h-1 w-1 rounded-full ${p.status === "Success" ? "bg-emerald-500" : p.status === "Delayed" ? "bg-amber-500" : "bg-rose-500"}`} />
                        {p.status}
                      </span></td>
                      <td className="py-1 pr-2 text-slate-600">{p.last}</td>
                      <td className="py-1 pr-2 text-slate-700">{p.dur}</td>
                      <td className="py-1 pr-2 text-slate-700">{p.rec}</td>
                      <td className="py-1 pr-2 text-slate-700">{p.err}</td>
                      <td className="py-1 pr-2 text-slate-600">{p.owner}</td>
                      <td className="py-1 pr-2"><span className={`text-[9px] font-semibold ${p.impact === "High" ? "text-rose-700" : "text-amber-700"}`}>{p.impact}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="mt-2 text-[10px] text-blue-700 font-semibold">View All Pipelines</button>
          </div>

          {/* Live pipeline trace */}
          <div className="col-span-12 xl:col-span-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-800">Live Pipeline Trace <span className="text-slate-500 font-normal">(Customer 360 Load)</span></div>
              <button className="text-[10px] bg-blue-600 text-white font-semibold px-2 py-0.5 rounded flex items-center gap-1"><RefreshCw className="h-3 w-3" />Replay</button>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
              <div>Record ID</div>
              <select className="border border-slate-200 rounded px-1"><option>CUST-458299</option></select>
            </div>
            <div className="overflow-auto max-h-[340px]">
              <table className="w-full text-[10px]">
                <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
                  <tr className="text-left">
                    <th className="py-1 pr-2">Step</th>
                    <th className="py-1 pr-2">Status</th>
                    <th className="py-1 pr-2">Input</th>
                    <th className="py-1 pr-2">Output</th>
                    <th className="py-1 pr-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {traceSteps.map((s, i) => (
                    <tr key={s.name}>
                      <td className="py-1 pr-2 text-slate-800 font-medium">{i + 1}. {s.name}</td>
                      <td className="py-1 pr-2"><CheckCircle className="h-3 w-3 text-emerald-600" /></td>
                      <td className="py-1 pr-2 text-slate-700">{s.input}</td>
                      <td className="py-1 pr-2 text-slate-700">{s.output}</td>
                      <td className="py-1 pr-2 text-slate-600 tabular-nums">{s.dur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-[10px]">
              <div><div className="text-[9px] text-slate-500">Total Duration</div><div className="font-bold text-slate-800">02:26</div></div>
              <div><div className="text-[9px] text-slate-500">Records In</div><div className="font-bold text-slate-800">1,245</div></div>
              <div><div className="text-[9px] text-slate-500">Records Out</div><div className="font-bold text-slate-800">1,223</div></div>
            </div>
            <div className="text-[9px] text-rose-600 mt-1">Rejected: 22 (1.77%)</div>
          </div>

          {/* Selected pipeline right */}
          <div className="col-span-12 xl:col-span-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-bold text-slate-800">Selected Pipeline</div>
              <XCircle className="h-3 w-3 text-slate-400" />
            </div>
            <div className="text-[10px] font-bold text-slate-900">Customer 360 Load</div>
            <div className="text-[9px] text-slate-500 mb-2">Azure Data Factory</div>
            <div className="flex gap-1 border-b border-slate-200 mb-2 flex-wrap">
              {["Overview","Perf","Lineage","Alerts","History"].map((t, i) => (
                <button key={t} className={`text-[9px] pb-1 ${i===0 ? "border-b-2 border-blue-600 text-blue-700 font-semibold" : "text-slate-500"}`}>{t}</button>
              ))}
            </div>
            <div className="space-y-1 text-[9px]">
              <div className="text-slate-500 uppercase font-semibold">General</div>
              <div className="flex justify-between"><span className="text-slate-500">Pipeline ID</span><span className="text-slate-800 font-semibold">PL-C360-ADF-001</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Owner</span><span className="text-slate-800">Data Eng</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Env</span><span className="text-slate-800">Production</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Schedule</span><span className="text-slate-800">Daily 01:00</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Freq</span><span className="text-slate-800">24 Hours</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Last Run</span><span className="text-slate-800">18h 54m</span></div>
              <div className="flex justify-between"><span className="text-slate-500">SLA</span><span className="text-slate-800">30 Min</span></div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100">
              <div className="text-[9px] font-semibold uppercase text-slate-500 mb-1">Recent Runs</div>
              <div className="flex items-center justify-between text-[9px]"><span className="text-emerald-700">Success</span><span className="font-bold text-slate-800">1,242 (96.1%)</span></div>
              <div className="flex items-center justify-between text-[9px]"><span className="text-rose-700">Failed</span><span className="font-bold text-slate-800">18 (1.4%)</span></div>
              <div className="flex items-center justify-between text-[9px]"><span className="text-amber-700">Cancelled</span><span className="font-bold text-slate-800">18 (1.4%)</span></div>
              <div className="flex items-center justify-between text-[9px]"><span className="text-blue-700">Running</span><span className="font-bold text-slate-800">12 (0.9%)</span></div>
            </div>
            <button className="mt-2 text-[9px] text-blue-700 font-semibold">View Full History</button>
          </div>
        </div>

        {/* Row: Transaction monitoring + queues + ETL timeline + AI root cause */}
        <div className="grid grid-cols-12 gap-3 mb-3">
          <div className="col-span-12 xl:col-span-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-800">Transaction Monitoring (24h)</div>
              <select className="text-[10px] border border-slate-200 rounded px-1"><option>24H</option></select>
            </div>
            <div className="flex items-center gap-2 text-[9px] mb-1">
              <span className="flex items-center gap-1"><span className="h-1 w-3 bg-blue-500 rounded" />Transactions/min</span>
              <span className="flex items-center gap-1"><span className="h-1 w-3 bg-emerald-500 rounded" />Success</span>
              <span className="flex items-center gap-1"><span className="h-1 w-3 bg-rose-500 rounded" />Failed</span>
              <span className="flex items-center gap-1"><span className="h-1 w-3 bg-amber-500 rounded" />Retries</span>
            </div>
            <svg viewBox="0 0 300 120" className="w-full h-32">
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#3b82f6" stopOpacity="0.3" /><stop offset="1" stopColor="#3b82f6" stopOpacity="0" /></linearGradient>
              </defs>
              <path d="M0,60 C30,40 60,80 90,55 C120,30 150,70 180,50 C210,35 240,65 270,45 L300,50 L300,120 L0,120 Z" fill="url(#g1)" />
              <path d="M0,60 C30,40 60,80 90,55 C120,30 150,70 180,50 C210,35 240,65 270,45 L300,50" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
              <path d="M0,90 C40,88 80,92 120,85 C160,78 200,90 240,82 L300,85" fill="none" stroke="#10b981" strokeWidth="1.5" />
              <path d="M0,110 C40,108 80,112 120,105 C160,102 200,108 240,105 L300,108" fill="none" stroke="#ef4444" strokeWidth="1.2" />
            </svg>
            <div className="grid grid-cols-3 gap-1 text-[9px] mt-1">
              <div><div className="text-slate-500">Transactions</div><div className="font-bold">54,218</div></div>
              <div><div className="text-slate-500">Success</div><div className="font-bold text-emerald-700">99.987%</div></div>
              <div><div className="text-slate-500">Failed</div><div className="font-bold text-rose-700">0.013%</div></div>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-800">Message Queue Dashboard</div>
              <select className="text-[10px] border border-slate-200 rounded px-1"><option>All Platforms</option></select>
            </div>
            <div className="overflow-auto max-h-[240px]">
              <table className="w-full text-[9px]">
                <thead className="text-slate-500 uppercase text-[8px] border-b border-slate-200 sticky top-0 bg-white">
                  <tr className="text-left">
                    <th className="py-1 pr-1">Queue</th><th className="pr-1">Platform</th><th className="pr-1">Depth</th><th className="pr-1">Cons</th><th className="pr-1">Lag</th><th className="pr-1">DLQ</th><th className="pr-1">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queues.map((q) => (
                    <tr key={q.name} className="hover:bg-slate-50">
                      <td className="py-1 pr-1 font-semibold text-slate-800">{q.name}</td>
                      <td className="pr-1 text-slate-600">{q.plat}</td>
                      <td className="pr-1 text-slate-700">{q.depth}</td>
                      <td className="pr-1 text-slate-700">{q.cons}</td>
                      <td className="pr-1 text-slate-700">{q.lag}</td>
                      <td className="pr-1 text-slate-700">{q.dlq}</td>
                      <td className="pr-1"><span className={`inline-block px-1 rounded text-[8px] font-semibold border ${statusChip(q.trend)}`}>{q.trend}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-800">ETL Execution Timeline <span className="text-slate-500 font-normal">(Customer 360 Load)</span></div>
            </div>
            <div className="space-y-1.5">
              {["Extract","Transform","Lookup","Validation","Enrichment","Aggregation","Business Rules","Load","Verification"].map((s, i) => (
                <div key={s} className="grid grid-cols-[80px_1fr_50px] items-center gap-2 text-[9px]">
                  <div className="text-slate-700 font-semibold">{s}</div>
                  <div className="h-2 bg-slate-100 rounded overflow-hidden relative">
                    <div className="absolute top-0 h-full bg-emerald-500 rounded" style={{ left: `${i*8}%`, width: `${15 + i*2}%` }} />
                  </div>
                  <div className="text-right text-slate-500 tabular-nums">00:00:{(12 + i*3).toString().padStart(2,"0")}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[9px] mt-2 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-emerald-500 rounded" />Completed</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-blue-500 rounded" />In Progress</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-amber-500 rounded" />Waiting</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-rose-500 rounded" />Failed</span>
            </div>
            <div className="text-[10px] mt-1 flex items-center justify-between"><span className="font-semibold text-slate-800">Total Duration</span><span className="font-bold text-slate-900">00:02:14</span></div>
          </div>

          <div className="col-span-12 xl:col-span-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-violet-600" />AI Root Cause Analysis</div>
              <span className="text-[9px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5">Failed</span>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-700">Root Cause</div>
              <p className="text-[10px] text-slate-700 leading-snug">
                Lookup transformation failed due to reference data lag in <span className="font-mono text-rose-700">CUSTOMER_REF_TABLE</span>.
              </p>
            </div>
            <div className="mt-2">
              <div className="text-[10px] font-semibold text-slate-700">Contributing Factors</div>
              <ul className="text-[10px] text-slate-700 list-disc list-inside space-y-0.5">
                <li>Upstream Reference Data pipeline (18m)</li>
                <li>High lookup miss ratio (3.41%)</li>
                <li>Schema drift detected in source field <span className="font-mono">CUST_TYPE</span></li>
                <li>Increase in data volume (+32% vs yesterday)</li>
              </ul>
            </div>
            <div className="mt-2">
              <div className="text-[10px] font-semibold text-slate-700">Related Incidents</div>
              <div className="text-[10px] text-slate-700">INC-87321, INC-87211</div>
            </div>
            <div className="mt-2">
              <div className="text-[10px] font-semibold text-slate-700">Recommended Action</div>
              <p className="text-[10px] text-slate-700">Refresh reference data and replay failed pipeline.</p>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="text-[10px] flex-1"><span className="text-slate-500">Confidence:</span> <span className="font-bold text-emerald-700">92%</span></div>
              <button className="text-[10px] bg-blue-600 text-white font-semibold px-2 py-1 rounded">View Full Analysis</button>
            </div>
          </div>
        </div>

        {/* Row: DQ + Pipeline perf + Lineage + Business impact + Activity */}
        <div className="grid grid-cols-12 gap-3 mb-3">
          <div className="col-span-12 xl:col-span-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs font-bold text-slate-800 mb-2">Data Quality Dashboard <span className="text-slate-500 font-normal">(Customer 360 Load)</span></div>
            <div className="grid grid-cols-5 gap-1 mb-2">
              {dataQuality.map((d) => (
                <div key={d.m} className="rounded-md border border-slate-200 bg-slate-50 p-1.5 text-center">
                  <div className="text-[8px] uppercase font-semibold text-slate-500 leading-tight">{d.m}</div>
                  <div className="text-sm font-extrabold text-slate-900">{d.v}</div>
                  <div className={`text-[8px] font-semibold ${d.tone === "emerald" ? "text-emerald-700" : "text-rose-700"}`}>{d.d}</div>
                </div>
              ))}
            </div>
            <table className="w-full text-[9px]">
              <thead className="text-[8px] uppercase text-slate-500 border-b border-slate-200">
                <tr className="text-left"><th>Issue Type</th><th>Rows</th><th>%</th><th>Trend</th><th>Impact</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ["Null Values","2,341","0.19%","▁▂▃▂▁","Medium"],
                  ["Duplicate Records","1,226","0.10%","▁▂▁▂▁","Low"],
                  ["Schema Drift","3","0.00%","▂▃▅▂▁","High"],
                  ["Referential Integrity","542","0.04%","▁▁▂▃▂","High"],
                  ["Business Rule Violations","1,118","0.09%","▂▃▂▃▁","Medium"],
                ].map(([t,r,p,tr,i]) => (
                  <tr key={t}><td className="py-1 font-semibold text-slate-800">{t}</td><td className="py-1 text-slate-700">{r}</td><td className="py-1 text-slate-700">{p}</td><td className="py-1 font-mono text-emerald-700">{tr}</td><td className="py-1 text-slate-700">{i}</td></tr>
                ))}
              </tbody>
            </table>
            <button className="mt-2 text-[10px] text-blue-700 font-semibold">View All Data Quality Issues</button>
          </div>

          <div className="col-span-12 xl:col-span-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-800">Pipeline Performance <span className="text-slate-500 font-normal">(Customer 360 Load)</span></div>
              <select className="text-[10px] border border-slate-200 rounded px-1"><option>24H</option></select>
            </div>
            <div className="flex gap-1 border-b border-slate-200 mb-1 text-[9px]">
              {["Runtime","CPU","Memory","Shuffle","I/O","Network"].map((t, i) => (
                <button key={t} className={`pb-0.5 ${i===0?"border-b-2 border-blue-600 text-blue-700 font-semibold":"text-slate-500"}`}>{t}</button>
              ))}
            </div>
            <svg viewBox="0 0 300 140" className="w-full h-36">
              {[0,1,2,3].map((i) => <line key={i} x1="0" x2="300" y1={20+i*30} y2={20+i*30} stroke="#e2e8f0" strokeDasharray="2 2" />)}
              <path d="M0,80 Q40,50 60,70 T120,60 T180,75 T240,55 T300,65" fill="none" stroke="#3b82f6" strokeWidth="1.8" />
              {[10,50,90,130,170,210,250,290].map((x,i) => <circle key={i} cx={x} cy={60 + (i%3)*8} r="2" fill="#3b82f6" />)}
            </svg>
            <div className="grid grid-cols-3 gap-1 text-[9px] mt-1 pt-1 border-t border-slate-100">
              <div><div className="text-slate-500">Avg Runtime</div><div className="font-bold">28m 14s</div></div>
              <div><div className="text-slate-500">P95 Runtime</div><div className="font-bold">51m 42s</div></div>
              <div><div className="text-slate-500">P99 Runtime</div><div className="font-bold">1h 12m</div></div>
              <div><div className="text-slate-500">Records/min</div><div className="font-bold">78,342</div></div>
              <div><div className="text-slate-500">CPU Avg</div><div className="font-bold">62%</div></div>
              <div><div className="text-slate-500">Memory Avg</div><div className="font-bold">58%</div></div>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs font-bold text-slate-800 mb-2">Data Lineage <span className="text-slate-500 font-normal">(CUSTOMER_DIM)</span></div>
            <div className="grid grid-cols-3 items-center gap-1 text-[9px]">
              <div>
                <div className="text-[8px] font-semibold text-slate-500 uppercase mb-1">Upstream (6)</div>
                {["CRM_CUSTOMER","SAP_CUSTOMER","WEB_EVENTS","LOYALTY_PROG","CUSTOMER_REF","CONTACT_INFO"].map((n) => (
                  <div key={n} className="border border-slate-200 rounded px-1 py-0.5 mb-0.5 bg-slate-50 text-slate-700 font-mono text-[9px] truncate">{n}</div>
                ))}
              </div>
              <div className="flex flex-col items-center">
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <div className="my-1 border-2 border-blue-500 bg-blue-50 rounded-lg px-2 py-2 text-center">
                  <div className="text-[10px] font-bold text-blue-800">CUSTOMER_DIM</div>
                  <div className="text-[8px] text-slate-600">Table</div>
                  <div className="text-[8px] text-slate-600">Azure SQL</div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <div className="text-[8px] font-semibold text-slate-500 uppercase mb-1">Downstream (52)</div>
                {["SALES_FACT","MARKETING_MART","CUSTOMER_360_VIEW","CHURN_MODEL","POWERBI_CUSTOMER","EXECUTIVE_DASHBOARD"].map((n) => (
                  <div key={n} className="border border-slate-200 rounded px-1 py-0.5 mb-0.5 bg-slate-50 text-slate-700 font-mono text-[9px] truncate">{n}</div>
                ))}
                <div className="text-[8px] text-slate-500 text-center">+6 more</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-[8px] mt-2 pt-2 border-t border-slate-100">
              {[["Table","bg-blue-500"],["View","bg-violet-500"],["Pipeline","bg-emerald-500"],["Report","bg-amber-500"],["ML Model","bg-rose-500"],["Dashboard","bg-cyan-500"]].map(([l,c]) => (
                <div key={l} className="flex items-center gap-0.5"><span className={`h-1.5 w-1.5 rounded-full ${c}`} /><span className="text-slate-600">{l}</span></div>
              ))}
            </div>
            <button className="mt-2 text-[10px] text-blue-700 font-semibold">View Full Lineage</button>
          </div>

          <div className="col-span-12 xl:col-span-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs font-bold text-slate-800 mb-2">Business Impact <span className="text-slate-500 font-normal">(If Pipeline Fails)</span></div>
            <div className="space-y-2">
              {businessImpact.map((b) => (
                <div key={b.m}>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-700">{b.m}</span>
                    <span className="font-bold text-slate-900">{b.v}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-rose-500 rounded" style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="text-slate-700">Impact Level</span>
                <span className="font-bold text-rose-700">High</span>
              </div>
            </div>
            <button className="mt-2 text-[10px] text-blue-700 font-semibold">View Full Impact Analysis</button>
          </div>
        </div>

        {/* Activity Feed & AI Investigation workspace */}
        <div className="grid grid-cols-12 gap-3 mb-3">
          <div className="col-span-12 xl:col-span-8 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1"><Bot className="h-3.5 w-3.5 text-violet-600" />AI Investigation Workspace</div>
              <div className="flex items-center gap-1 flex-wrap">
                {["Executive Summary","Pipeline Trace","Data Lineage","Transformation Logic","Spark","SQL","Infrastructure","Logs","Data Quality","Historical Runs","Automation"].map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`text-[9px] px-2 py-0.5 rounded ${tab===t?"bg-blue-600 text-white font-semibold":"bg-slate-100 text-slate-600"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 min-h-[180px]">
              {tab === "Executive Summary" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Summary</div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      Customer 360 Load completed with 22 rejected records due to reference-data lag in <code>CUSTOMER_REF_TABLE</code>. Downstream analytics for Executive Dashboard and Churn Model may show stale data for the next 18 minutes. Automated remediation available.
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                      <div><div className="text-slate-500">Confidence</div><div className="font-bold text-emerald-700">92%</div></div>
                      <div><div className="text-slate-500">Business Impact</div><div className="font-bold text-rose-700">High</div></div>
                      <div><div className="text-slate-500">Automation</div><div className="font-bold text-blue-700">Available</div></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Recommendations</div>
                    {[
                      { l: "Replay Failed Pipeline", conf: "94%" },
                      { l: "Refresh CUSTOMER_REF cache", conf: "91%" },
                      { l: "Increase Spark executors +2", conf: "88%" },
                      { l: "Repair CUST_TYPE schema", conf: "86%" },
                    ].map((r) => (
                      <div key={r.l} className="flex items-center justify-between text-[10px] py-0.5 border-b border-slate-200 last:border-0">
                        <span className="text-slate-700">{r.l}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-emerald-700 font-bold">{r.conf}</span>
                          <button className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded">Execute</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tab !== "Executive Summary" && (
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  <div className="font-bold text-slate-800 mb-1">{tab}</div>
                  Deep-dive view for <span className="font-semibold">{tab}</span> — telemetry, execution graphs, and engineering evidence for Customer 360 Load are streamed live from Azure Data Factory, Databricks, and dbt Cloud. Correlated with Git commit <code>a91f2d8</code> deployed 4h ago by <span className="font-semibold">j.rivera</span>.
                </div>
              )}
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1"><Activity className="h-3.5 w-3.5 text-emerald-600" />Activity Feed (Live)</div>
            <div className="space-y-1.5 max-h-[240px] overflow-auto">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px]">
                  <span className={`h-1.5 w-1.5 rounded-full mt-1.5 ${a.tone==="Success"?"bg-emerald-500":a.tone==="Warning"?"bg-amber-500":"bg-blue-500"}`} />
                  <div className="flex-1">
                    <div className="text-slate-700 leading-snug">{a.msg}</div>
                    <div className="text-[9px] text-slate-400 tabular-nums">{a.time}</div>
                  </div>
                  <span className={`text-[9px] font-semibold ${a.tone==="Success"?"text-emerald-700":a.tone==="Warning"?"text-amber-700":"text-blue-700"}`}>{a.tone}</span>
                </div>
              ))}
            </div>
            <button className="mt-2 text-[10px] text-blue-700 font-semibold">View Full Activity Feed</button>
          </div>
        </div>

        {/* Quick Actions + Integrations */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 xl:col-span-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-amber-600" />Automation Library</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                "Replay Pipeline","Restart Pipeline","Scale Spark Cluster","Optimize SQL",
                "Repair Schema","Repair Data Quality","Repair API","Retry Transformation",
                "Refresh Warehouse","Refresh Semantic Model","Generate Executive Report","Create ServiceNow Incident",
              ].map((a) => (
                <button key={a} className="text-[10px] border border-slate-200 rounded px-2 py-1 text-left hover:bg-blue-50 hover:border-blue-300 text-slate-700 font-semibold">
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5 text-blue-600" />AI Copilot</div>
            <div className="space-y-1">
              {[
                "Why did today's ETL fail?",
                "Trace customer 458299.",
                "Predict tomorrow's runtime.",
                "Which dashboards will be impacted?",
                "Show schema drift.",
                "Optimize Spark for Customer 360 Load.",
              ].map((q) => (
                <button key={q} className="w-full text-left text-[10px] bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded px-2 py-1 text-slate-700">
                  <ChevronRight className="inline h-3 w-3 text-blue-600 mr-1" />{q}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1">
              <input className="flex-1 text-[10px] border border-slate-200 rounded px-2 py-1" placeholder="Ask the ETL AI Copilot..." />
              <button className="text-[10px] bg-blue-600 text-white font-semibold px-2 py-1 rounded">Ask</button>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1"><GitBranch className="h-3.5 w-3.5 text-violet-600" />Enterprise Integrations</div>
              <button className="text-[10px] bg-blue-600 text-white font-semibold px-2 py-1 rounded flex items-center gap-1"><Download className="h-3 w-3" />Export Report</button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {["Fabric","ADF","Synapse","Databricks","Airflow","Spark","Kafka","Snowflake","dbt","Informatica","Talend","SSIS","Fivetran","Matillion","ADLS","S3","BigQuery","Power BI","Tableau","Looker","GitHub","Terraform","Datadog","ServiceNow"].map((i) => (
                <div key={i} className="text-[9px] text-center border border-slate-200 rounded px-1 py-1 bg-slate-50 text-slate-700 font-semibold">{i}</div>
              ))}
            </div>
            <div className="mt-2 text-[9px] text-slate-500 flex items-center gap-1"><span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />24 integrations connected · Last sync 12s ago</div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
