import { AtcShell, PageHeader, StatusPill, Card } from "./shared";
import { BUSINESS_SERVICES } from "./data";
import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

const tierTone: Record<string, string> = {
  "Tier 1": "text-rose-700 border-rose-200 bg-rose-50",
  "Tier 2": "text-amber-700 border-amber-200 bg-amber-50",
  "Tier 3": "text-slate-700 border-slate-200 bg-slate-50",
};

export default function BusinessServices() {
  return (
    <AtcShell activeNav="biz" breadcrumb="Business Services">
      <PageHeader title="Business Services" subtitle="Business service portfolio, health posture, and ticket load per service." />

      <div className="px-6 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><div className="text-[11px] text-slate-500">Total Services</div><div className="text-[26px] font-bold mt-1">{BUSINESS_SERVICES.length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Tier 1</div><div className="text-[26px] font-bold mt-1">{BUSINESS_SERVICES.filter(b => b.tier === "Tier 1").length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Degraded</div><div className="text-[26px] font-bold mt-1 text-amber-600">{BUSINESS_SERVICES.filter(b => b.health !== "Healthy").length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Total Tickets Routed</div><div className="text-[26px] font-bold mt-1">{BUSINESS_SERVICES.reduce((s, b) => s + b.tickets, 0)}</div></Card>
      </div>

      <div className="px-6 pb-4">
        <div className="rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Service</th>
                <th className="px-3 py-2 font-semibold">Tier</th>
                <th className="px-3 py-2 font-semibold">Health</th>
                <th className="px-3 py-2 font-semibold">Owner Group</th>
                <th className="px-3 py-2 font-semibold text-right">Tickets (7d)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {BUSINESS_SERVICES.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded bg-indigo/10 text-indigo grid place-items-center"><Boxes className="h-3.5 w-3.5" /></div>
                      <div>
                        <div className="font-semibold">{b.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{b.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn("rounded border px-2 py-0.5 text-[10px] font-semibold", tierTone[b.tier])}>{b.tier}</span>
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill s={b.health === "Healthy" ? "On Track" : b.health === "Warning" ? "At Risk" : "Breached"} />
                  </td>
                  <td className="px-3 py-2 text-slate-700">{b.owner}</td>
                  <td className="px-3 py-2 text-right font-mono">{b.tickets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AtcShell>
  );
}
