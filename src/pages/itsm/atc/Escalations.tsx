import { AtcShell, PageHeader, PriBadge, Card } from "./atc/shared";
import { ESCALATIONS, TICKETS } from "./atc/data";
import { ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Escalations() {
  const escalated = TICKETS.filter((t) => t.status === "Escalated");
  const ack = ESCALATIONS.filter(e => e.ack).length;

  return (
    <AtcShell activeNav="esc" breadcrumb="Escalations">
      <PageHeader title="Escalations" subtitle="Tickets and events escalated by agents, managers, or the AI categorizer." />

      <div className="px-6 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><div className="text-[11px] text-slate-500">Open Escalations</div><div className="text-[26px] font-bold mt-1 text-rose-600">{escalated.length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Acknowledged</div><div className="text-[26px] font-bold mt-1 text-emerald-600">{ack} / {ESCALATIONS.length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">AI-triggered</div><div className="text-[26px] font-bold mt-1 text-indigo">3</div></Card>
        <Card><div className="text-[11px] text-slate-500">Avg. Ack Time</div><div className="text-[26px] font-bold mt-1">2m 14s</div></Card>
      </div>

      <div className="px-6 pb-4 grid grid-cols-12 gap-4">
        <Card title="Escalated Tickets" className="col-span-12 xl:col-span-7">
          <table className="w-full text-left text-[11px] -mx-4">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Ticket</th>
                <th className="px-3 py-2 font-semibold">Description</th>
                <th className="px-3 py-2 font-semibold">Priority</th>
                <th className="px-3 py-2 font-semibold">Service</th>
                <th className="px-3 py-2 font-semibold">Escalated To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {escalated.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono">{t.id}</td>
                  <td className="px-3 py-2 text-slate-800">{t.desc}</td>
                  <td className="px-3 py-2"><PriBadge p={t.priority} /></td>
                  <td className="px-3 py-2 text-slate-700">{t.service}</td>
                  <td className="px-3 py-2 text-slate-600">{t.group}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Escalation Log" className="col-span-12 xl:col-span-5">
          <ol className="relative border-l border-slate-200 ml-2 space-y-3 -mt-1">
            {ESCALATIONS.map((e) => (
              <li key={e.id} className="ml-4">
                <span className={cn("absolute -left-1.5 h-3 w-3 rounded-full border-2 border-white", e.ack ? "bg-emerald-500" : "bg-amber-500")} />
                <div className="text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 text-[10px]">{e.at}</span>
                    <span className="font-mono font-semibold text-slate-900">{e.ticket}</span>
                    {e.ack ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-600 font-semibold"><CheckCircle2 className="h-3 w-3" /> ACK</span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-600 font-semibold"><Clock className="h-3 w-3" /> PENDING</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-slate-700">{e.from} <ArrowUpRight className="inline h-3 w-3" /> <span className="font-semibold">{e.to}</span></div>
                  <div className="text-slate-500 text-[10px]">{e.reason}</div>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </AtcShell>
  );
}
