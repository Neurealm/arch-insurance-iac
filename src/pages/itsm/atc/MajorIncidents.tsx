import { AtcShell, PageHeader, PriBadge, StatusPill, Card } from "./atc/shared";
import { MAJOR_INCIDENTS } from "./atc/data";
import { AlertOctagon, PhoneCall, MessageSquare, Plus, Users, FileText } from "lucide-react";

export default function MajorIncidents() {
  return (
    <AtcShell activeNav="major" breadcrumb="Major Incidents">
      <PageHeader title="Major Incidents" subtitle="P1/P2 events with bridge, commander, and business impact." actions={
        <button className="inline-flex items-center gap-1.5 rounded bg-rose-600 text-white px-3 h-7 text-[11px] font-semibold hover:bg-rose-700">
          <Plus className="h-3 w-3" /> Declare Major Incident
        </button>
      } />

      <div className="px-6 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><div className="text-[11px] text-slate-500">Active</div><div className="text-[26px] font-bold mt-1 text-rose-600">{MAJOR_INCIDENTS.length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">MTTR (30d)</div><div className="text-[26px] font-bold mt-1">1h 48m</div></Card>
        <Card><div className="text-[11px] text-slate-500">Declared (Month)</div><div className="text-[26px] font-bold mt-1">14</div></Card>
        <Card><div className="text-[11px] text-slate-500">Prevented by AI</div><div className="text-[26px] font-bold mt-1 text-emerald-600">7</div></Card>
      </div>

      <div className="px-6 pb-4 space-y-4">
        {MAJOR_INCIDENTS.map((m) => (
          <div key={m.id} className="rounded-lg border border-rose-200 bg-white overflow-hidden">
            <div className="px-4 py-3 flex items-start gap-3 bg-rose-50/50 border-b border-rose-100">
              <div className="h-10 w-10 rounded-lg bg-rose-600 text-white grid place-items-center shrink-0">
                <AlertOctagon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-mono text-slate-600">{m.id}</span>
                  <PriBadge p={m.severity} />
                  <StatusPill s={m.status} />
                </div>
                <div className="mt-0.5 text-[15px] font-bold text-slate-900">{m.title}</div>
                <div className="text-[11px] text-slate-600">Business service: <span className="font-semibold">{m.service}</span> · Opened {m.opened}</div>
              </div>
              <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
                <button className="inline-flex items-center gap-1 h-7 px-3 rounded bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800"><PhoneCall className="h-3 w-3" /> Join Bridge</button>
                <button className="inline-flex items-center gap-1 h-7 px-3 rounded border border-slate-200 text-[11px] font-semibold hover:bg-slate-50"><MessageSquare className="h-3 w-3" /> Broadcast</button>
              </div>
            </div>
            <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-4 gap-4 text-[11px]">
              <div>
                <div className="text-slate-500 uppercase tracking-wide text-[10px] font-semibold">Commander</div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-indigo/10 text-indigo grid place-items-center text-[9px] font-bold">{m.commander.split(" ").map(n => n[0]).join("")}</div>
                  <span className="text-slate-800 font-semibold">{m.commander}</span>
                </div>
              </div>
              <div>
                <div className="text-slate-500 uppercase tracking-wide text-[10px] font-semibold">Impact</div>
                <div className="mt-1 text-slate-800">{m.impact}</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase tracking-wide text-[10px] font-semibold">Bridge</div>
                <div className="mt-1 text-slate-800 inline-flex items-center gap-1"><Users className="h-3 w-3 text-slate-400" /> {m.bridge}</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase tracking-wide text-[10px] font-semibold">Postmortem</div>
                <div className="mt-1"><button className="inline-flex items-center gap-1 text-indigo font-semibold hover:underline"><FileText className="h-3 w-3" /> Prepare draft</button></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AtcShell>
  );
}
