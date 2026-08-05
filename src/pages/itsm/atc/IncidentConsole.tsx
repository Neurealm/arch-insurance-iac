import { Link } from "react-router-dom";
import { AtcShell, PageHeader, PriBadge, StatusPill, Card } from "./shared";
import { MAJOR_INCIDENTS, ESCALATIONS, TICKETS, ALERTS } from "./data";
import { AlertOctagon, Radio, PhoneCall, ArrowUpRight, MessageSquare, Users } from "lucide-react";

export default function IncidentConsole() {
  const active = MAJOR_INCIDENTS;
  const escalated = TICKETS.filter((t) => t.status === "Escalated" || t.priority === "P1");
  return (
    <AtcShell activeNav="incident" breadcrumb="Incident Console">
      <PageHeader title="Incident Console" subtitle="Live view of major incidents, escalations, and P1/P2 ticket bridges." />

      <div className="px-6 pb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <div className="text-[11px] text-slate-500">Active Major Incidents</div>
          <div className="text-[26px] font-bold text-slate-900 mt-1">{active.length}</div>
          <div className="text-[10px] text-rose-600 mt-1">2 P1 · 1 P2</div>
        </Card>
        <Card>
          <div className="text-[11px] text-slate-500">P1 Tickets Open</div>
          <div className="text-[26px] font-bold text-slate-900 mt-1">{TICKETS.filter(t => t.priority === "P1").length}</div>
          <div className="text-[10px] text-rose-600 mt-1">Requires manager review</div>
        </Card>
        <Card>
          <div className="text-[11px] text-slate-500">Active Bridges</div>
          <div className="text-[26px] font-bold text-slate-900 mt-1">3</div>
          <div className="text-[10px] text-slate-500 mt-1">25 participants total</div>
        </Card>
        <Card>
          <div className="text-[11px] text-slate-500">MTTR Today</div>
          <div className="text-[26px] font-bold text-slate-900 mt-1">32<span className="text-[13px] text-slate-500 ml-1">min</span></div>
          <div className="text-[10px] text-emerald-600 mt-1">▼ 18% vs 7d</div>
        </Card>
      </div>

      <div className="px-6 pb-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <Card title="Active Major Incidents" action={<Link to="/itsm/auto-ticket-categorization/major-incidents" className="text-[11px] font-semibold text-indigo hover:underline">Manage →</Link>}>
            <ul className="divide-y divide-slate-100 -mt-2">
              {active.map((m) => (
                <li key={m.id} className="py-3 flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-600 grid place-items-center shrink-0">
                    <AlertOctagon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-500">{m.id}</span>
                      <PriBadge p={m.severity} />
                      <StatusPill s={m.status} />
                    </div>
                    <div className="mt-0.5 text-[13px] font-semibold text-slate-900">{m.title}</div>
                    <div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-[11px] text-slate-600">
                      <span><span className="text-slate-400">Opened:</span> {m.opened}</span>
                      <span><span className="text-slate-400">Service:</span> {m.service}</span>
                      <span><span className="text-slate-400">Commander:</span> {m.commander}</span>
                      <span><span className="text-slate-400">Impact:</span> {m.impact}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button className="inline-flex items-center gap-1.5 h-7 rounded border border-slate-200 px-2 text-[11px] font-semibold hover:bg-slate-50"><PhoneCall className="h-3 w-3" /> Join Bridge</button>
                      <button className="inline-flex items-center gap-1.5 h-7 rounded border border-slate-200 px-2 text-[11px] font-semibold hover:bg-slate-50"><MessageSquare className="h-3 w-3" /> Broadcast</button>
                      <button className="inline-flex items-center gap-1.5 h-7 rounded border border-slate-200 px-2 text-[11px] font-semibold hover:bg-slate-50"><ArrowUpRight className="h-3 w-3" /> Timeline</button>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 hidden md:block">
                    <div className="inline-flex items-center gap-1 text-emerald-600 font-semibold"><Radio className="h-3 w-3 animate-pulse" /> Live</div>
                    <div className="mt-1">{m.bridge}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Escalated Tickets" subtitle="Tickets escalated by the AI categorizer or a manager.">
            <table className="w-full text-left text-[11px] -mx-4">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-semibold">Ticket</th>
                  <th className="px-3 py-2 font-semibold">Description</th>
                  <th className="px-3 py-2 font-semibold">Priority</th>
                  <th className="px-3 py-2 font-semibold">Service</th>
                  <th className="px-3 py-2 font-semibold">Group</th>
                  <th className="px-3 py-2 font-semibold">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {escalated.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-mono text-slate-700">{t.id}</td>
                    <td className="px-3 py-2 text-slate-800">{t.desc}</td>
                    <td className="px-3 py-2"><PriBadge p={t.priority} /></td>
                    <td className="px-3 py-2 text-slate-700">{t.service}</td>
                    <td className="px-3 py-2 text-slate-600">{t.group}</td>
                    <td className="px-3 py-2"><StatusPill s={t.slaState} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <Card title="Escalation Feed" subtitle="Last 5 escalations processed.">
            <ul className="space-y-2 -mt-1">
              {ESCALATIONS.map((e) => (
                <li key={e.id} className="text-[11px] border-l-2 border-indigo/40 pl-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-500 text-[10px]">{e.at}</span>
                    <span className="font-mono text-slate-900 font-semibold">{e.ticket}</span>
                    {e.ack ? <span className="text-[9px] text-emerald-600 font-semibold">ACK</span> : <span className="text-[9px] text-amber-600 font-semibold">PENDING</span>}
                  </div>
                  <div className="text-slate-700 mt-0.5">{e.from} → <span className="font-semibold">{e.to}</span></div>
                  <div className="text-slate-500 text-[10px]">{e.reason}</div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Response Owners" action={<Users className="h-3.5 w-3.5 text-slate-400" />}>
            <ul className="space-y-2 text-[11px]">
              {["Ryan Blackwell — Manager on Call", "Sarah Williams — IAM Lead", "Daniel Kim — Clinical Systems", "James O'Neill — Security", "Priya Patel — Application Support"].map((r) => (
                <li key={r} className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-indigo/10 text-indigo grid place-items-center text-[9px] font-bold">{r.split(" ").slice(0, 2).map(w => w[0]).join("")}</div>
                  <span className="text-slate-700">{r}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Recent Alerts">
            <ul className="space-y-1.5 -mt-1 text-[10px]">
              {ALERTS.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-500">{a.time}</span>
                  <span className="flex-1 text-slate-700 truncate">{a.title}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AtcShell>
  );
}
