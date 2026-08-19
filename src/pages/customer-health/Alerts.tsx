import { cn } from "@/lib/utils";
import { alertRules } from "./data";
import { Interactive, PageHeader, useImpactDrawer } from "./primitives";

export default function CustomerHealthAlerts() {
  const { open } = useImpactDrawer();
  return (
    <div className="space-y-4">
      <PageHeader
        title="Alerts"
        subtitle="Notification rules that tell your team when something could affect your users."
      />
      <ul className="space-y-2">
        {alertRules.map((a) => (
          <li key={a.id}>
            <Interactive
              tooltip="When this rule notifies you, who receives it, and what condition triggers it."
              onClick={() => open(a.contextId)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <span className="min-w-[220px]">
                <span className="block text-[13.5px] font-semibold text-slate-900">{a.name}</span>
                <span className="block text-[11.5px] text-slate-500">{a.scope}</span>
              </span>
              <span className="text-[12px] text-slate-500">{a.channel}</span>
              <span className="text-[11.5px] text-slate-500">Last fired {a.lastFired}</span>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  a.enabled
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-slate-300 bg-slate-100 text-slate-500",
                )}
              >
                {a.enabled ? "Enabled" : "Disabled"}
              </span>
            </Interactive>
          </li>
        ))}
      </ul>
    </div>
  );
}
