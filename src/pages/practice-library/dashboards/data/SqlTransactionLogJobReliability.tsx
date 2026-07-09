import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Database, Server, HardDrive, Activity, Shield, CheckCircle2, XCircle, AlertTriangle,
  Clock, Bot, Sparkles, Bell, FileText, Play, RotateCcw, Wrench, GitBranch, Layers,
  ChevronRight, X, Search, MessageSquare, Send, Zap, TrendingUp, Boxes, Cpu,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadialBarChart, RadialBar,
} from "recharts";

/* ---------- data ---------- */
const headerStats = [
  { l: "Operational Status", v: "Operational", s: "All Systems Normal", tone: "emerald" },
  { l: "SQL Servers Monitored", v: "428" },
  { l: "Databases", v: "7,842" },
  { l: "Transaction Log Jobs", v: "1,236" },
  { l: "Last Prediction Analysis", v: "8 Seconds Ago" },
  { l: "AI Remediation Engine", v: "Active", tone: "emerald" },
];

const kpis = [
  { l: "Log Job Reliability", v: "99.4%", sub: "Healthy", icon: CheckCircle2, tone: "emerald" },
  { l: "Predicted Job Failures", v: "7", sub: "Next 24 Hours", icon: XCircle, tone: "red" },
  { l: "Critical Log Pressure", v: "18", sub: "Databases", icon: Database, tone: "amber" },
  { l: "Jobs Running Tonight", v: "312", sub: "Scheduled", icon: Clock, tone: "blue" },
  { l: "Automated Self-Heals", v: "84", sub: "Today", icon: Wrench, tone: "emerald" },
  { l: "Support Warm-Ups", v: "11", sub: "Active", icon: Bell, tone: "violet" },
  { l: "Error Budget Remaining", v: "72%", sub: "This Month", icon: Activity, tone: "blue" },
  { l: "Change Policy Compliance", v: "98.9%", sub: "Compliant", icon: Shield, tone: "emerald" },
  { l: "Business Services at Risk", v: "9", sub: "High Impact", icon: AlertTriangle, tone: "amber" },
  { l: "Est. Downtime Prevented", v: "221", sub: "Hours Annualized", icon: Clock, tone: "blue" },
];

const toneMap: Record<string, { bg: string; text: string; ring: string; hex: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200", hex: "#10b981" },
  red:     { bg: "bg-red-50",     text: "text-red-600",     ring: "ring-red-200",     hex: "#ef4444" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",   ring: "ring-amber-200",   hex: "#f59e0b" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",    ring: "ring-blue-200",    hex: "#3b82f6" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-600",  ring: "ring-violet-200",  hex: "#8b5cf6" },
  slate:   { bg: "bg-slate-100",  text: "text-slate-600",   ring: "ring-slate-200",   hex: "#64748b" },
};

const predicted = [
  { srv: "SQL01.prod.corp", db: "SalesDB",       job: "TruncateLog_SalesDB",       next: "00:15 AM", prob: 92, conf: "High",   cause: "Disk > 95%",                 impact: "High",   budget: -4.2, action: "Expand Drive",     auto: "Auto",     change: "Standard" },
  { srv: "SQL07.prod.corp", db: "FinanceDB",     job: "BackupLog_FinanceDB",       next: "00:20 AM", prob: 85, conf: "High",   cause: "Broken Backup Chain",         impact: "High",   budget: -3.1, action: "Retry Backup",     auto: "Auto",     change: "Standard" },
  { srv: "SQL12.prod.corp", db: "HRDB",          job: "TruncateLog_HRDB",          next: "00:30 AM", prob: 76, conf: "Medium", cause: "Long Running Txn",            impact: "Medium", budget: -1.8, action: "Kill Txn",         auto: "Manual",   change: "Approval" },
  { srv: "SQL03.prod.corp", db: "OrderDB",       job: "BackupLog_OrderDB",         next: "00:45 AM", prob: 71, conf: "High",   cause: "Backup Target Down",          impact: "High",   budget: -2.3, action: "Switch Target",    auto: "Auto",     change: "Standard" },
  { srv: "SQL03.prod.corp", db: "InventoryDB",   job: "TruncateLog_Inventory",     next: "01:00 AM", prob: 68, conf: "Medium", cause: "Recovery Model Mismatch",     impact: "Medium", budget: -1.2, action: "Fix Model",        outStr: "Manual", auto: "Manual",   change: "Approval" },
  { srv: "SQL05.prod.corp", db: "BillingDB",     job: "BackupLog_BillingDB",       next: "01:10 AM", prob: 61, conf: "Medium", cause: "VLF Count Excessive",         impact: "Medium", budget: -1.0, action: "Rebuild Log",      auto: "Manual",   change: "Approval" },
  { srv: "SQL08.prod.corp", db: "AuditDB",       job: "TruncateLog_AuditDB",       next: "01:20 AM", prob: 58, conf: "Medium", cause: "Log Disk Growth",             impact: "Low",    budget: -0.5, action: "Monitor",          auto: "Manual",   change: "Approval" },
  { srv: "SQL06.prod.corp", db: "CustomerDB",    job: "BackupLog_CustomerDB",      next: "01:45 AM", prob: 54, conf: "Medium", cause: "AG Secondary Lag",            impact: "Medium", budget: -1.1, action: "Sync Secondary",   auto: "Auto",     change: "Standard" },
  { srv: "SQL09.prod.corp", db: "MarketingDB",   job: "TruncateLog_MarketingDB",   next: "02:00 AM", prob: 43, conf: "Low",    cause: "Job Owner Perm Issue",        impact: "Low",    budget: -0.3, action: "Repair Owner",     auto: "Auto",     change: "Standard" },
  { srv: "SQL11.prod.corp", db: "AnalyticsDB",   job: "BackupLog_AnalyticsDB",     next: "02:15 AM", prob: 38, conf: "Low",    cause: "Maintenance Window Conflict", impact: "Low",    budget: 0.0,  action: "Reschedule",       auto: "Auto",     change: "Standard" },
];

const pressure = [
  { srv: "SQL01.prod.corp", db: "SalesDB",     used: 78, size: "12.4 GB", growth: "6h/hr",  last: "11:59 PM", exhaust: "6h 42m", wait: "ACTIVE_TRANSACTION" },
  { srv: "SQL07.prod.corp", db: "FinanceDB",   used: 91, size: "18.7 GB", growth: "3h 1m",  last: "11:40 PM", exhaust: "2h 18m", wait: "BACKUP" },
  { srv: "SQL12.prod.corp", db: "HRDB",        used: 64, size: "8.3 GB",  growth: "1h 25m", last: "11:30 PM", exhaust: "12h 04m", wait: "LOG_BACKUP" },
  { srv: "SQL03.prod.corp", db: "OrderDB",     used: 82, size: "16.3 GB", growth: "2h 12m", last: "11:35 PM", exhaust: "4h 55m",  wait: "CHECKPOINT" },
  { srv: "SQL03.prod.corp", db: "InventoryDB", used: 59, size: "9.8 GB",  growth: "1h 08m", last: "11:20 PM", exhaust: "14h 30m", wait: "ACTIVE_TRANSACTION" },
  { srv: "SQL08.prod.corp", db: "AuditDB",     used: 72, size: "10.2 GB", growth: "1h 25m", last: "11:15 PM", exhaust: "8h 12m",  wait: "REPLICATION" },
  { srv: "SQL05.prod.corp", db: "BillingDB",   used: 81, size: "14.6 GB", growth: "2h 40m", last: "11:10 PM", exhaust: "5h 20m",  wait: "LOG_BACKUP" },
  { srv: "SQL06.prod.corp", db: "CustomerDB", used: 93, size: "19.1 GB", growth: "3h 15m", last: "11:05 PM", exhaust: "1h 48m",  wait: "LOG_BACKUP" },
  { srv: "SQL11.prod.corp", db: "AnalyticsDB",used: 68, size: "7.6 GB",  growth: "1h 12m", last: "11:00 PM", exhaust: "10h 08m", wait: "CHECKPOINT" },
];

const changes = [
  { id: "CHG0012345", type: "Standard",  status: "Auto-Approved",   risk: "Low",    win: "May 18, 12:00 AM", act: "Executed" },
  { id: "CHG0012346", type: "Emergency", status: "Approval Pending",risk: "High",   win: "May 18, 12:00 AM", act: "CAB Required" },
  { id: "CHG0012347", type: "Standard",  status: "Scheduled",       risk: "Low",    win: "May 18, 12:00 AM", act: "Auto-Approved" },
  { id: "CHG0012348", type: "Emergency", status: "Approval Pending",risk: "High",   win: "May 19, 01:00 AM", act: "Manager Approved" },
  { id: "CHG0012349", type: "Standard",  status: "Executed",        risk: "Low",    win: "May 17, 12:00 AM", act: "Auto-Approved" },
];

const warmups = [
  { l: "DBA On-Call Notified",         v: "2 Engaged",  tone: "emerald" },
  { l: "Infra Support Notified",       v: "3 Engaged",  tone: "emerald" },
  { l: "App Owner Notified",           v: "2 Engaged",  tone: "emerald" },
  { l: "Service Desk Brief Generated", v: "Completed",  tone: "emerald" },
  { l: "ServiceNow Incident Staged",   v: "3 Drafts",   tone: "blue" },
  { l: "Teams Bridge Prepared",        v: "SQL-Bridge-1987", tone: "blue" },
  { l: "Runbook Attached",             v: "LogBackup_RB_v4", tone: "blue" },
  { l: "Probable Root Cause",          v: "Disk Pressure / Long Txn", tone: "amber" },
  { l: "Impact",                       v: "2 Apps · 5 Services", tone: "amber" },
  { l: "Suggested First Action",       v: "Expand Drive / Kill Txn", tone: "violet" },
];

const jobTimeline = [
  { t: "11:00 PM", job: "BackupLog_FinanceDB",   s: "success" },
  { t: "11:30 PM", job: "TruncateLog_OrderDB",   s: "success" },
  { t: "12:00 AM", job: "BackupLog_SalesDB",     s: "predict-fail", note: "Predicted Fail (92%)" },
  { t: "12:30 AM", job: "TruncateLog_BillingDB", s: "warning",       note: "Warning (61%)" },
  { t: "01:00 AM", job: "BackupLog_InventoryDB", s: "predict-fail",  note: "Predicted Fail (68%)" },
  { t: "01:30 AM", job: "BackupLog_CustomerDB",  s: "warning",       note: "Warning (54%)" },
  { t: "02:00 AM", job: "TruncateLog_MarketingDB", s: "success" },
  { t: "02:30 AM", job: "BackupLog_AnalyticsDB", s: "success" },
];

const budgetBurn = [{ name: "Remaining", value: 72 }, { name: "Consumed", value: 18 }, { name: "Forecast Burn", value: 10 }];

const quickActions = [
  { l: "Run Log Backup", icon: Play }, { l: "Retry Failed Job", icon: RotateCcw },
  { l: "Expand Log Drive", icon: HardDrive }, { l: "Warm Up Support", icon: Bell },
  { l: "Create Change (SNOW)", icon: GitBranch }, { l: "Open Incident", icon: AlertTriangle },
  { l: "Generate Evidence Pack", icon: FileText }, { l: "Generate Executive Report", icon: FileText },
];

/* ---------- helpers ---------- */
const Pill = ({ tone = "slate", children }: any) => {
  const t = toneMap[tone] ?? toneMap.slate;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${t.bg} ${t.text} ring-1 ${t.ring}`}>{children}</span>;
};

const Card = ({ title, right, children, className = "" }: any) => (
  <div className={`rounded-2xl bg-white border border-slate-200 shadow-sm p-4 ${className}`}>
    {(title || right) && (
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {right}
      </div>
    )}
    {children}
  </div>
);

const sBadge = (s: string) => {
  if (s === "success") return <Pill tone="emerald">Success</Pill>;
  if (s === "warning") return <Pill tone="amber">Warning</Pill>;
  if (s === "predict-fail") return <Pill tone="red">Predicted Fail</Pill>;
  return <Pill>{s}</Pill>;
};

/* ---------- page ---------- */
export default function SqlTransactionLogJobReliability() {
  const [selected, setSelected] = useState<any>(predicted[0]);
  const [chat, setChat] = useState("");

  return (
    <AppShell>
      <div className="bg-slate-50/60 min-h-full p-4 md:p-6">
        {/* Header */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 mb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Bot className="h-3.5 w-3.5" /> Digital Coworker
                <span className="ml-1 rounded bg-blue-50 text-blue-600 px-1.5 py-0.5 text-[9px] font-semibold ring-1 ring-blue-200">AI POWERED</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">SQL Transaction Log Job Reliability Co-worker</h1>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                Mission: Continuously monitor SQL Server transaction log jobs, predict failure, self-heal when safe,
                warm up support, and operate within error budget and organizational change management principles.
              </p>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {headerStats.map((s: any) => {
                const t = toneMap[s.tone ?? "slate"];
                return (
                  <div key={s.l} className="min-w-[110px]">
                    <div className="text-[10px] uppercase text-slate-500">{s.l}</div>
                    <div className={`text-sm font-semibold ${t.text}`}>{s.v}</div>
                    {s.s && <div className="text-[10px] text-slate-500">{s.s}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {kpis.map((k) => {
            const t = toneMap[k.tone];
            const Icon = k.icon;
            return (
              <div key={k.l} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-3 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase text-slate-500">{k.l}</div>
                  <div className={`h-7 w-7 rounded-lg grid place-items-center ${t.bg} ${t.text}`}><Icon className="h-3.5 w-3.5" /></div>
                </div>
                <div className={`text-2xl font-bold ${t.text} mt-1`}>{k.v}</div>
                <div className="text-[10px] text-slate-500">{k.sub}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Left: Estate + Predicted Failures + Pressure */}
          <div className="xl:col-span-3 space-y-4">
            {/* Estate Map */}
            <Card title="1. SQL Server Estate Map" right={<button className="text-xs text-blue-600">View</button>}>
              <div className="text-[11px] text-slate-600 mb-2">Enterprise › Region › Data Center › Cluster › Instance › Database › Log › Job › Application › Service</div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                {["Americas","EMEA","APAC"].map((r) => (
                  <div key={r} className="rounded-xl bg-slate-50 border border-slate-200 p-2">
                    <div className="font-semibold text-slate-700 mb-1">{r}</div>
                    <div className="grid grid-cols-2 gap-1">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="rounded bg-white border border-slate-200 py-1">SQL-{r.slice(0,2).toUpperCase()}-{i}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-8 gap-1 mt-3">
                {Array.from({ length: 40 }).map((_, i) => {
                  const st = i % 11 === 0 ? "red" : i % 7 === 0 ? "amber" : i % 5 === 0 ? "blue" : "emerald";
                  return <div key={i} className={`h-6 rounded ${toneMap[st].bg} ring-1 ${toneMap[st].ring}`} title={`SQL-${i}`} />;
                })}
              </div>
              <div className="flex gap-3 mt-2 text-[10px] text-slate-600">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Healthy</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"/>Warning</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"/>Failure</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500"/>Self-Healing</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-500"/>Support Warmed</span>
              </div>
            </Card>

            {/* Predicted Failures */}
            <Card title="2. Predictive Job Failure Dashboard" right={<button className="text-xs text-blue-600">View all 1,236 jobs</button>}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-[11px]">
                  <thead className="text-slate-500">
                    <tr className="text-left border-b border-slate-200">
                      {["SQL Server","Database","Job Name","Next Run","Fail. Prob.","Confidence","Predicted Cause","Business Impact","Err Budget Impact","Action","Automation"].map(h => (
                        <th key={h} className="py-2 pr-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {predicted.map((p, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setSelected(p)}>
                        <td className="py-2 pr-3 text-slate-700">{p.srv}</td>
                        <td className="py-2 pr-3">{p.db}</td>
                        <td className="py-2 pr-3">{p.job}</td>
                        <td className="py-2 pr-3">{p.next}</td>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-1"><span className={`font-semibold ${p.prob>75?"text-red-600":p.prob>55?"text-amber-600":"text-slate-700"}`}>{p.prob}%</span>
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div className={`h-full ${p.prob>75?"bg-red-500":p.prob>55?"bg-amber-500":"bg-slate-400"}`} style={{ width: `${p.prob}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-2 pr-3">{p.conf}</td>
                        <td className="py-2 pr-3">{p.cause}</td>
                        <td className="py-2 pr-3">{p.impact}</td>
                        <td className="py-2 pr-3 text-red-600 font-semibold">{p.budget}%</td>
                        <td className="py-2 pr-3">{p.action}</td>
                        <td className="py-2 pr-3">{p.auto} · {p.change}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Row: pressure + decision + budget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card title="3. Transaction Log Pressure (Top 10)" className="lg:col-span-1">
                <div className="text-[10px]">
                  <div className="grid grid-cols-5 text-slate-500 border-b border-slate-200 pb-1">
                    <span>Server</span><span>Used</span><span>Growth/hr</span><span>Last Backup</span><span>Pred. Exhaust</span>
                  </div>
                  {pressure.slice(0,9).map((r,i) => (
                    <div key={i} className="grid grid-cols-5 items-center py-1 border-b border-slate-100">
                      <span className="truncate">{r.srv.split(".")[0]}</span>
                      <span className={`font-semibold ${r.used>85?"text-red-600":r.used>70?"text-amber-600":"text-emerald-600"}`}>{r.used}%</span>
                      <span>{r.growth}</span>
                      <span>{r.last}</span>
                      <span>{r.exhaust}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="4. Self-Healing Decision Center">
                <div className="space-y-2 text-[11px]">
                  {[
                    ["Detect Risk", "emerald"], ["Classify Severity", "emerald"], ["Check Error Budget", "emerald"],
                    ["Check Policy", "emerald"], ["Check Maint. Window", "amber"], ["Select Safe Remediation", "blue"],
                    ["Execute / Approve", "violet"], ["Validate Recovery", "emerald"], ["Document Change", "emerald"],
                    ["Notify Support", "emerald"], ["Close / Escalate", "emerald"],
                  ].map(([l, t]: any) => (
                    <div key={l} className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${toneMap[t].bg.replace("bg-", "bg-").replace("-50","-500")}`} style={{background: toneMap[t].hex}} />
                      <span className="flex-1">{l}</span>
                      <ChevronRight className="h-3 w-3 text-slate-400" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="5. Error Budget Guardrail">
                <div className="flex items-center gap-3">
                  <div className="h-24 w-24">
                    <ResponsiveContainer><PieChart>
                      <Pie data={budgetBurn} innerRadius={28} outerRadius={40} dataKey="value" startAngle={90} endAngle={-270}>
                        <Cell fill="#10b981"/><Cell fill="#f59e0b"/><Cell fill="#ef4444"/>
                      </Pie>
                    </PieChart></ResponsiveContainer>
                  </div>
                  <div className="text-[11px] space-y-1 flex-1">
                    <div className="flex justify-between"><span>Remaining</span><span className="font-semibold text-emerald-600">72%</span></div>
                    <div className="flex justify-between"><span>Consumed</span><span className="font-semibold text-amber-600">18%</span></div>
                    <div className="flex justify-between"><span>Forecast Burn</span><span className="font-semibold text-red-600">10%</span></div>
                  </div>
                </div>
                <div className="mt-3 text-[11px] space-y-1">
                  <div className="flex justify-between"><span className="text-slate-500">Allowed Automation</span><span>Standard</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Manual Approval Threshold</span><span>High Impact</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Business Service SLO</span><span>99.5%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">RTO / RPO</span><span>2h / 15m</span></div>
                </div>
              </Card>
            </div>

            {/* Change mgmt, warm-up, timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card title="6. Change Management & Governance">
                <table className="w-full text-[10px]">
                  <thead className="text-slate-500 border-b border-slate-200">
                    <tr className="text-left">
                      <th className="py-1">Change ID</th><th>Type</th><th>Status</th><th>Risk</th><th>Change Window</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((c) => (
                      <tr key={c.id} className="border-b border-slate-100">
                        <td className="py-1.5 pr-2">{c.id}</td>
                        <td className="pr-2">{c.type}</td>
                        <td className="pr-2"><Pill tone={c.status.includes("Auto")?"emerald":c.status.includes("Pending")?"amber":c.status.includes("Executed")?"blue":"slate"}>{c.status}</Pill></td>
                        <td className="pr-2">{c.risk}</td>
                        <td className="pr-2">{c.win}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="text-xs text-blue-600 mt-2">View all changes in ServiceNow</button>
              </Card>

              <Card title="7. Support Warm-Up Center">
                <div className="space-y-1.5">
                  {warmups.map((w) => (
                    <div key={w.l} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100">
                      <span className="text-slate-700">{w.l}</span>
                      <Pill tone={w.tone}>{w.v}</Pill>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="8. SQL Agent Job Timeline (Next 8 Hours)">
                <div className="space-y-2">
                  {jobTimeline.map((j, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <span className="w-16 text-slate-500">{j.t}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full`} style={{background: j.s==="success"?"#10b981":j.s==="warning"?"#f59e0b":"#ef4444"}} />
                        <span className="truncate">{j.job}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{j.note ?? "✓"}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* AI Root Cause + Business Impact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card title="9. AI Root Cause Analysis" right={<Pill tone="red">High Confidence</Pill>}>
                <div className="text-[11px] space-y-1.5">
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Job</span><span className="font-semibold">{selected.job}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Root Cause</span><span>Log disk will exceed 95% in 6h 42m</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Confidence</span><span className="font-semibold">92%</span></div>
                  <div className="mt-2 text-slate-500">Key Evidence</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                    <li>Log used 78% and growing 12.4 GB/hr</li>
                    <li>Last log backup 11:59 PM completed</li>
                    <li>Autogrowth enabled at 1h 18m</li>
                    <li>Active transaction open &gt; 2h 18m</li>
                    <li>Backup target latency 1.2s (high)</li>
                  </ul>
                  <div className="flex justify-between border-t border-slate-100 pt-2 mt-2"><span className="text-slate-500">Similar Incidents</span><span>7 in last 30 days</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">First Recommended Action</span><span className="font-semibold text-blue-600">Expand log drive or kill long transaction</span></div>
                </div>
              </Card>

              <Card title="10. Business Impact Dashboard">
                <div className="flex items-center gap-2 mb-3 text-[11px] text-slate-600">
                  <Database className="h-3.5 w-3.5"/> SalesDB → <Layers className="h-3.5 w-3.5"/> Sales Application → <TrendingUp className="h-3.5 w-3.5"/> Sales Reporting → <Boxes className="h-3.5 w-3.5"/> Power BI Sales → <Sparkles className="h-3.5 w-3.5"/> Executive Dashboard
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded bg-slate-50 p-2"><div className="text-slate-500 text-[10px]">Applications at Risk</div><div className="text-lg font-bold">3</div></div>
                  <div className="rounded bg-slate-50 p-2"><div className="text-slate-500 text-[10px]">Services Impacted</div><div className="text-lg font-bold">5</div></div>
                  <div className="rounded bg-slate-50 p-2"><div className="text-slate-500 text-[10px]">Users Impacted</div><div className="text-lg font-bold">12,845</div></div>
                  <div className="rounded bg-slate-50 p-2"><div className="text-slate-500 text-[10px]">Transactions Delayed</div><div className="text-lg font-bold">152K/hr</div></div>
                  <div className="rounded bg-slate-50 p-2"><div className="text-slate-500 text-[10px]">Revenue Exposure</div><div className="text-lg font-bold text-red-600">$1.28M/hr</div></div>
                  <div className="rounded bg-slate-50 p-2"><div className="text-slate-500 text-[10px]">SLA Risk</div><div className="text-lg font-bold text-amber-600">8.7%</div></div>
                  <div className="rounded bg-slate-50 p-2"><div className="text-slate-500 text-[10px]">Error Budget Impact</div><div className="text-lg font-bold text-red-600">-4.2%</div></div>
                  <div className="rounded bg-slate-50 p-2"><div className="text-slate-500 text-[10px]">Executive Priority</div><div className="text-lg font-bold">High</div></div>
                </div>
              </Card>
            </div>

            {/* AI Executive Insights */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="text-xs font-semibold text-slate-700 mb-2">AI Executive Insights</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-3">
                  <div className="flex items-center gap-2 font-semibold text-amber-700"><AlertTriangle className="h-3.5 w-3.5"/> Predicted Risk</div>
                  <p className="text-slate-700 mt-1">7 transaction log jobs have elevated failure probability in the next 24 hours. Primary drivers are disk pressure, broken backup chains, and long-running transactions.</p>
                </div>
                <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-3">
                  <div className="flex items-center gap-2 font-semibold text-emerald-700"><Bot className="h-3.5 w-3.5"/> Self-Healing Opportunity</div>
                  <p className="text-slate-700 mt-1">5 predicted failures qualify for standard-change automation and can be remediated without manual approval. Expected recovery time: 18 minutes.</p>
                </div>
                <div className="rounded-xl bg-violet-50/60 border border-violet-200 p-3">
                  <div className="flex items-center gap-2 font-semibold text-violet-700"><Bell className="h-3.5 w-3.5"/> Support Readiness</div>
                  <p className="text-slate-700 mt-1">2 high-impact databases exceed the self-heal risk threshold. Support warmed with runbooks, probable root cause, and staged ServiceNow records.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Engineering Panel */}
          <aside className="xl:col-span-1 space-y-4">
            <Card title="Quick Actions">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((a) => {
                  const I = a.icon;
                  return (
                    <button key={a.l} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] hover:bg-slate-50">
                      <I className="h-3.5 w-3.5 text-blue-600" /> {a.l}
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card title="Selected Job / Database Details" right={<button className="text-slate-400"><X className="h-3.5 w-3.5"/></button>}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center"><Database className="h-4 w-4"/></div>
                <div>
                  <div className="text-sm font-semibold">{selected.job}</div>
                  <div className="text-[10px] text-slate-500">{selected.srv} · {selected.db}</div>
                </div>
                <Pill tone={selected.prob>75?"red":"amber"}>{selected.prob>75?"At Risk":"Warning"}</Pill>
              </div>

              <div className="text-[10px] uppercase text-slate-500 mb-1">General</div>
              <div className="text-[11px] space-y-1 mb-3">
                <div className="flex justify-between"><span className="text-slate-500">Server / Instance</span><span>{selected.srv}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Database</span><span>{selected.db}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Recovery Model</span><span>FULL</span></div>
                <div className="flex justify-between"><span className="text-slate-500">AG Role</span><span>Primary</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Business Owner</span><span>Sales Operations</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Environment</span><span>Production</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Criticality</span><span className="text-red-600 font-semibold">High</span></div>
              </div>

              <div className="text-[10px] uppercase text-slate-500 mb-1">Transaction Log</div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-16 w-16">
                  <ResponsiveContainer><RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ v: 78 }]} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="v" fill="#3b82f6" background />
                  </RadialBarChart></ResponsiveContainer>
                </div>
                <div className="text-[11px]">
                  <div className="text-slate-500">Log Used</div>
                  <div className="text-lg font-bold text-blue-600">78%</div>
                  <div className="text-slate-500">256 GB · 12.4 GB/hr</div>
                  <div className="text-slate-500">Pred. Exhaustion: 6h 42m</div>
                </div>
              </div>

              <div className="text-[10px] uppercase text-slate-500 mb-1 mt-2">Job Details</div>
              <div className="text-[11px] space-y-1 mb-3">
                <div className="flex justify-between"><span className="text-slate-500">Schedule</span><span>Daily 12:00 AM</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Next Run</span><span>{selected.next}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Last Run</span><span>May 18, 11:59 PM</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Last Outcome</span><span className="text-emerald-600">Success</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Avg Duration</span><span>00:02:14</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Job Owner</span><span>CORP\slxvc_maint</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Retry Attempts</span><span>2</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Automation</span><span className="text-emerald-600">Auto-Heal Eligible</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Change Status</span><span>Standard Change</span></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button className="rounded-lg bg-blue-600 text-white text-xs py-1.5 hover:bg-blue-700">Run Log Backup</button>
                <button className="rounded-lg border border-blue-600 text-blue-600 text-xs py-1.5 hover:bg-blue-50">Retry Job</button>
                <button className="col-span-2 rounded-lg border border-slate-200 text-slate-700 text-xs py-1.5 hover:bg-slate-50">More Actions ▾</button>
              </div>
            </Card>

            <Card title="AI Copilot">
              <div className="rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600 mb-2">
                Ask about tonight's jobs, budget, changes, or remediation.
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {["Which jobs will fail tonight?","Can we self-heal SalesDB?","Warm support for high-risk jobs.","Generate evidence pack."].map(q=>(
                  <button key={q} onClick={()=>setChat(q)} className="text-[10px] px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200">{q}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={chat} onChange={e=>setChat(e.target.value)} placeholder="Ask the coworker…" className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs" />
                <button className="rounded-lg bg-blue-600 text-white p-2"><Send className="h-3.5 w-3.5"/></button>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
