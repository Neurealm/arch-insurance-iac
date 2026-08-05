import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp, ArrowDown, AlertOctagon, MessageSquare, UserPlus, BookOpen,
  FileText, Settings, BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { cn } from "@/lib/utils";
import { AtcShell, PageHeader, PriBadge, StatusPill } from "./atc/shared";
import {
  KPIS, TICKETS, PERF_SERIES, CATEGORY_DIST, SLA_AT_RISK, MANUAL_REVIEW,
  AGENTS, CONFIDENCE_BUCKETS, ALERTS,
} from "./atc/data";

const queueTabs = ["All Queues", "High Priority", "Unassigned", "AI Review", "Escalated"] as const;

function Sparkline({ data, color = "#4f46e5" }: { data: number[]; color?: string }) {
  const points = data.map((v, i) => ({ i, v }));
  const id = `sk-${color.replace("#", "")}`;
  return (
    <div className="h-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${id})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function RingPct({ pct, color }: { pct: number; color: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r={r} stroke="#e2e8f0" strokeWidth="5" fill="none" />
      <circle cx="28" cy="28" r={r} stroke={color} strokeWidth="5" fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 28 28)" />
      <text x="28" y="32" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">{pct}%</text>
    </svg>
  );
}

export default function AutoTicketCategorization() {
  const [queueTab, setQueueTab] = useState<typeof queueTabs[number]>("All Queues");

  const filtered = useMemo(() => {
    if (queueTab === "High Priority") return TICKETS.filter((t) => t.priority === "P1" || t.priority === "P2");
    if (queueTab === "Unassigned") return TICKETS.filter((t) => t.agent === "Unassigned" || t.agent === "—");
    if (queueTab === "AI Review") return TICKETS.filter((t) => t.status === "Manual Review");
    if (queueTab === "Escalated") return TICKETS.filter((t) => t.status === "Escalated");
    return TICKETS.slice(0, 8);
  }, [queueTab]);

  return (
    <AtcShell activeNav="manager" breadcrumb="Manager Overview">
      <PageHeader
        title="Service Desk Manager View"
        subtitle="Real-time operational view of incoming tickets and AI categorization performance"
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-3 h-7 text-[11px] font-semibold hover:bg-slate-50">
              <BarChart3 className="h-3 w-3" /> Model Performance
            </button>
            <span className="text-[11px] text-slate-500 ml-1">Last Updated: 10:24:18 AM</span>
          </>
        }
      />

      {/* KPI Row */}
      <div className="px-6 pb-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {KPIS.map((k) => (
          <div key={k.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-[11px] text-slate-500 font-medium">
              {k.label} {k.suffix && <span className="text-slate-400">{k.suffix}</span>}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-[26px] font-bold leading-none text-slate-900">{k.value}</span>
                {k.unit && <span className="text-[13px] font-semibold text-slate-500">{k.unit}</span>}
              </div>
              {k.delta && (
                <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-semibold", k.up ? "text-emerald-600" : "text-emerald-600")}>
                  {k.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {k.delta}
                </span>
              )}
              {k.ring !== undefined && (
                <div className="ml-auto"><RingPct pct={k.ring} color={k.tone === "amber" ? "#f59e0b" : "#10b981"} /></div>
              )}
            </div>
            <div className="mt-1 text-[10px] text-slate-500">{k.sub}</div>
            {k.spark && <Sparkline data={k.spark} color={k.id === "res" ? "#10b981" : "#4f46e5"} />}
          </div>
        ))}
      </div>

      {/* Middle grid */}
      <div className="px-6 pb-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-6 rounded-lg border border-slate-200 bg-white">
          <div className="px-4 pt-3 pb-2 border-b border-slate-100">
            <div className="text-[13px] font-semibold text-slate-900">Live Ticket Queue</div>
            <div className="mt-2 flex items-center gap-4 text-[11px]">
              {queueTabs.map((t) => (
                <button key={t} onClick={() => setQueueTab(t)}
                  className={cn("pb-1.5 -mb-px border-b-2 font-medium transition-colors",
                    queueTab === t ? "border-indigo text-indigo" : "border-transparent text-slate-500 hover:text-slate-900")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Ticket #</th>
                  <th className="px-3 py-2 font-semibold">Short Description</th>
                  <th className="px-3 py-2 font-semibold">Priority</th>
                  <th className="px-3 py-2 font-semibold">Predicted Category</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Wait Time</th>
                  <th className="px-3 py-2 font-semibold">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-3 py-2 font-mono text-slate-700">{t.id}</td>
                    <td className="px-3 py-2 text-slate-800">{t.desc}</td>
                    <td className="px-3 py-2"><PriBadge p={t.priority} /></td>
                    <td className="px-3 py-2 text-slate-700">{t.category}</td>
                    <td className="px-3 py-2"><StatusPill s={t.status} /></td>
                    <td className="px-3 py-2 font-mono text-slate-600">{t.wait}</td>
                    <td className="px-3 py-2 text-slate-500">{t.agent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-slate-100">
            <Link to="/itsm/auto-ticket-categorization/ticket-queue" className="text-[11px] font-semibold text-indigo hover:underline">
              View all 156 tickets in queue →
            </Link>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-[13px] font-semibold text-slate-900">AI Categorization Performance <span className="text-slate-400 font-normal text-[11px]">(Last 7 Days)</span></div>
            <div className="h-[190px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PERF_SERIES} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis dataKey="d" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis yAxisId="a" stroke="#64748b" fontSize={10} tickLine={false} domain={[60, 100]} unit="%" width={36} />
                  <YAxis yAxisId="b" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} unit="s" width={30} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Line yAxisId="a" type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
                  <Line yAxisId="b" type="monotone" dataKey="time" name="Avg Time (s)" stroke="#4f46e5" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-600">
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-emerald-500" /> Accuracy %</span>
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-indigo" /> Avg. Categorization Time (sec)</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-[13px] font-semibold text-slate-900">Top Predicted Categories <span className="text-slate-400 font-normal text-[11px]">(30 Days)</span></div>
            <div className="grid grid-cols-5 gap-3 mt-2 items-center">
              <div className="col-span-2 h-[160px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={CATEGORY_DIST} dataKey="value" innerRadius={45} outerRadius={65} paddingAngle={2} stroke="none">
                      {CATEGORY_DIST.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-[15px] font-bold text-slate-900">18,842</div>
                    <div className="text-[9px] text-slate-500">Total Tickets</div>
                  </div>
                </div>
              </div>
              <ul className="col-span-3 text-[11px] space-y-1">
                {CATEGORY_DIST.map((c) => (
                  <li key={c.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="flex-1 text-slate-700 truncate">{c.name}</span>
                    <span className="font-semibold text-slate-900">{c.pct}%</span>
                    <span className="text-slate-400 font-mono w-14 text-right">({c.value.toLocaleString()})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-2 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold text-slate-900">SLAs at Risk</div>
              <Link to="/itsm/auto-ticket-categorization/sla-kpis" className="text-[10px] font-semibold text-indigo hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="rounded border border-rose-200 bg-rose-50 py-2 text-center">
                <div className="text-[18px] font-bold text-rose-600 leading-none">12</div>
                <div className="text-[9px] text-rose-700 mt-1">Breached</div>
                <div className="text-[8px] text-rose-500">(P1/P2)</div>
              </div>
              <div className="rounded border border-amber-200 bg-amber-50 py-2 text-center">
                <div className="text-[18px] font-bold text-amber-600 leading-none">27</div>
                <div className="text-[9px] text-amber-700 mt-1">At Risk</div>
                <div className="text-[8px] text-amber-500">(P3)</div>
              </div>
              <div className="rounded border border-orange-200 bg-orange-50 py-2 text-center">
                <div className="text-[18px] font-bold text-orange-600 leading-none">41</div>
                <div className="text-[9px] text-orange-700 mt-1">Warning</div>
                <div className="text-[8px] text-orange-500">(P4)</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">Upcoming Breaches</div>
              <ul className="space-y-1.5 text-[10px]">
                {SLA_AT_RISK.slice(0, 3).map((s) => (
                  <li key={s.id} className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-700 truncate">{s.id}</span>
                    <PriBadge p={s.pri} />
                    <span className="font-mono text-rose-600 ml-auto">{s.time}</span>
                  </li>
                ))}
              </ul>
              <Link to="/itsm/auto-ticket-categorization/sla-kpis" className="mt-2 inline-block text-[10px] font-semibold text-indigo hover:underline">View all SLA dashboard →</Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold text-slate-900">Manual Review Queue</div>
              <Link to="/itsm/auto-ticket-categorization/auto" className="text-[10px] font-semibold text-indigo hover:underline">View All</Link>
            </div>
            <ul className="mt-2 space-y-1.5 text-[10px]">
              {MANUAL_REVIEW.slice(0, 5).map((m) => (
                <li key={m.id} className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-700">{m.id}</span>
                  <span className="flex-1 text-slate-600 truncate">{m.desc}</span>
                  <PriBadge p={m.pri} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="px-6 pb-6 grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 rounded-lg border border-slate-200 bg-white">
          <div className="px-4 pt-3 pb-2 text-[13px] font-semibold text-slate-900">Agent Workload <span className="text-slate-400 font-normal text-[11px]">(Today)</span></div>
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Agent</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold text-right">Assigned</th>
                <th className="px-3 py-2 font-semibold text-right">Resolved</th>
                <th className="px-3 py-2 font-semibold text-right">Avg Handle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {AGENTS.slice(0, 5).map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-indigo/10 text-indigo grid place-items-center text-[9px] font-bold">
                        {a.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      {a.name}
                    </div>
                  </td>
                  <td className="px-3 py-2"><StatusPill s={a.status} /></td>
                  <td className="px-3 py-2 text-right font-mono text-slate-700">{a.assigned}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-700">{a.resolved}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-600">{a.handle}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-slate-100">
            <Link to="/itsm/auto-ticket-categorization/my-team" className="text-[11px] font-semibold text-indigo hover:underline">View full team performance</Link>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-[13px] font-semibold text-slate-900">Categorization Confidence Distribution <span className="text-slate-400 font-normal text-[11px]">(30 Days)</span></div>
          <div className="h-[220px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CONFIDENCE_BUCKETS} margin={{ top: 20, right: 8, left: 0, bottom: 20 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} label={{ value: "Confidence Score", position: "bottom", fontSize: 10, fill: "#64748b" }} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} width={40} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {CONFIDENCE_BUCKETS.map((_, i) => (
                    <Cell key={i} fill={i === 4 ? "#4f46e5" : i === 3 ? "#6366f1" : "#a5b4fc"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-[13px] font-semibold text-slate-900">Recent System Alerts</div>
            <ul className="mt-2 space-y-2">
              {ALERTS.slice(0, 4).map((a) => {
                const dot = a.tone === "critical" ? "bg-rose-500" : a.tone === "warning" ? "bg-amber-500" : a.tone === "resolved" ? "bg-emerald-500" : "bg-sky-500";
                const chip = a.tone === "critical" ? "bg-rose-50 text-rose-700 border-rose-200" : a.tone === "warning" ? "bg-amber-50 text-amber-700 border-amber-200" : a.tone === "resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-sky-50 text-sky-700 border-sky-200";
                const label = a.tone === "critical" ? "Critical" : a.tone === "warning" ? "Warning" : a.tone === "resolved" ? "Resolved" : "Info";
                return (
                  <li key={a.id} className="flex items-start gap-2 text-[11px]">
                    <span className={cn("mt-1 h-1.5 w-1.5 rounded-full shrink-0", dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-[10px]">{a.time}</span>
                        <span className="font-semibold text-slate-900 truncate">{a.title}</span>
                      </div>
                      <div className="text-slate-500 text-[10px] truncate">{a.body}</div>
                    </div>
                    <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold", chip)}>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-[13px] font-semibold text-slate-900">Quick Actions</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-semibold">
              <Link to="/itsm/auto-ticket-categorization/major-incidents" className="inline-flex items-center gap-1.5 h-8 rounded border border-slate-200 hover:bg-slate-50 px-2"><AlertOctagon className="h-3.5 w-3.5" /> Create Major Incident</Link>
              <button className="inline-flex items-center gap-1.5 h-8 rounded border border-slate-200 hover:bg-slate-50 px-2"><MessageSquare className="h-3.5 w-3.5" /> Broadcast Message</button>
              <Link to="/itsm/auto-ticket-categorization/assignments" className="inline-flex items-center gap-1.5 h-8 rounded border border-slate-200 hover:bg-slate-50 px-2"><UserPlus className="h-3.5 w-3.5" /> Reassign Tickets</Link>
              <Link to="/itsm/auto-ticket-categorization/knowledge-base" className="inline-flex items-center gap-1.5 h-8 rounded border border-slate-200 hover:bg-slate-50 px-2"><BookOpen className="h-3.5 w-3.5" /> Update Knowledge</Link>
              <Link to="/itsm/auto-ticket-categorization/reports" className="inline-flex items-center gap-1.5 h-8 rounded border border-slate-200 hover:bg-slate-50 px-2"><FileText className="h-3.5 w-3.5" /> Run Report</Link>
              <Link to="/itsm/auto-ticket-categorization/categorization-rules" className="inline-flex items-center gap-1.5 h-8 rounded border border-slate-200 hover:bg-slate-50 px-2"><Settings className="h-3.5 w-3.5" /> Configure Rules</Link>
            </div>
          </div>
        </div>
      </div>
    </AtcShell>
  );
}
