// Customer-first deployment cards. Service health leads; infrastructure
// statistics are deliberately secondary. Hovering reveals a compact floating
// summary; clicking opens the universal CustomerImpactDrawer.

import { cn } from "@/lib/utils";
import type { DeploymentCard } from "./types";
import { Sparkline, StatusDot, statusStyles, useImpactDrawer } from "./primitives";
import { useCorrelation } from "./correlation";

function HoverSummary({ d }: { d: DeploymentCard }) {
  if (!d.hover) return null;
  const rows: [string, string][] = [
    ["Overall health", d.hover.overallHealth],
    ["Customer impact", d.hover.customerImpact],
    ["Availability", d.hover.availability],
    ["Infrastructure risk", d.hover.infrastructureRisk],
    ["Active advisories", d.hover.advisories],
    ["Last health change", d.hover.lastHealthChange],
  ];
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute left-2 right-2 top-[calc(100%-10px)] z-50 hidden rounded-lg border border-slate-300 bg-white p-3 shadow-2xl group-hover/dep:block"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <StatusDot status={d.status} />
        <span className="text-[12px] font-semibold text-slate-900">{d.name}</span>
      </div>
      <dl className="space-y-0.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 border-b border-slate-100 py-0.5 last:border-b-0">
            <dt className="text-[10.5px] text-slate-500">{k}</dt>
            <dd className="text-right text-[11px] font-medium text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function DeploymentCardItem({ d }: { d: DeploymentCard }) {
  const { open } = useImpactDrawer();
  const { bind, className: corrClass } = useCorrelation(`deployment:${d.id}`);
  const s = statusStyles[d.status];
  const clean = d.status === "healthy";
  return (
    <div className="group/dep relative">
      <button
        type="button"
        onClick={() => open(d.contextId)}
        {...bind}
        aria-label={`Open health detail for ${d.name}`}
        className={cn(
          "w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-lg hover:shadow-slate-300/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70",
          corrClass,
        )}
      >
              {/* Service health leads the card */}
              <div className={cn("flex items-center justify-between gap-2 border-b px-3.5 py-2.5", s.chip)}>
                <span className="flex items-center gap-2">
                  <StatusDot status={d.status} />
                  <span className="text-[12.5px] font-semibold">{clean ? "Your service is healthy" : s.label}</span>
                </span>
                <span className="text-[10.5px] uppercase tracking-[0.12em] opacity-80">{d.environment ?? d.tier}</span>
              </div>

              <div className="px-3.5 py-3">
                <div className="text-[14px] font-semibold text-slate-900">{d.name}</div>
                <div className="mt-0.5 text-[11.5px] text-slate-500">{d.region}</div>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-[22px] font-semibold leading-none tracking-tight text-slate-900">{d.availability}</div>
                    <div className="mt-1 text-[10.5px] text-slate-500">Availability (24h)</div>
                  </div>
                  <div className="w-28"><Sparkline points={d.spark} status={d.status} /></div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200 pt-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      (d.advisoryCount ?? 0) > 0
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-700"
                        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
                    )}
                  >
                    {(d.advisoryCount ?? 0) > 0 ? `${d.advisoryCount} advisory` : "No active advisories"}
                  </span>
                  <span className="text-[10.5px] text-slate-400">{d.resources ?? `${d.nodes} nodes`}</span>
                </div>
              </div>
      </button>
      <HoverSummary d={d} />
    </div>
  );
}

export function DeploymentCards({ items }: { items: DeploymentCard[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((d) => (
        <DeploymentCardItem key={d.id} d={d} />
      ))}
    </div>
  );
}
