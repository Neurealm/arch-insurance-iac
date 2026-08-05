import { AtcShell, PageHeader, StatusPill, Card } from "./shared";
import { INTEGRATIONS } from "./data";
import { Plug, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Integrations() {
  const connected = INTEGRATIONS.filter(i => i.status === "Connected").length;
  const errors = INTEGRATIONS.reduce((s, i) => s + i.err, 0);
  return (
    <AtcShell activeNav="integ" breadcrumb="Integrations">
      <PageHeader title="Integrations" subtitle="Upstream ticket sources, identity, observability, and AI providers connected to the categorizer." />

      <div className="px-6 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><div className="text-[11px] text-slate-500">Integrations</div><div className="text-[26px] font-bold mt-1">{INTEGRATIONS.length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Connected</div><div className="text-[26px] font-bold mt-1 text-emerald-600">{connected}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Degraded</div><div className="text-[26px] font-bold mt-1 text-amber-600">{INTEGRATIONS.length - connected}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Errors (1h)</div><div className={cn("text-[26px] font-bold mt-1", errors > 0 ? "text-rose-600" : "text-emerald-600")}>{errors}</div></Card>
      </div>

      <div className="px-6 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {INTEGRATIONS.map((i) => (
          <div key={i.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className={cn("h-10 w-10 rounded-lg grid place-items-center shrink-0",
                i.status === "Connected" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                <Plug className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-slate-900">{i.name}</span>
                  <StatusPill s={i.status} />
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{i.type} · {i.direction}</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <div className="text-slate-500">Last Sync</div>
                    <div className="font-mono text-slate-800">{i.lastSync}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Events (24h)</div>
                    <div className="font-mono text-slate-800">{i.events.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Errors</div>
                    <div className={cn("font-mono", i.err > 0 ? "text-rose-600 font-semibold" : "text-slate-800")}>{i.err}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button className="inline-flex items-center gap-1 h-7 px-2 rounded border border-slate-200 text-[10px] font-semibold hover:bg-slate-50"><RefreshCw className="h-3 w-3" /> Test Connection</button>
                  <button className="inline-flex items-center gap-1 h-7 px-2 rounded border border-slate-200 text-[10px] font-semibold hover:bg-slate-50">View Logs</button>
                  <button className="inline-flex items-center gap-1 h-7 px-2 rounded border border-slate-200 text-[10px] font-semibold hover:bg-slate-50">Configure</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AtcShell>
  );
}
