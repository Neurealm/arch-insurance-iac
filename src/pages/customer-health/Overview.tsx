// Overview — the dense landing surface answering "are my services healthy and
// is anything happening underneath that affects me?"

import {
  AlertTriangle, Bell, Box, Cloud, Layers, ShieldCheck, TrendingUp, Wrench, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  availability30d, changes, dependencies, deployments, events, kpis, regions, risks, slos,
} from "./data";
import {
  Interactive, MetricBar, Panel, Sparkline, StatusChip, StatusDot, statusStyles, useImpactDrawer,
} from "./primitives";

const ICONS: Record<string, LucideIcon> = {
  shield: ShieldCheck, layers: Layers, box: Box, trend: TrendingUp,
  bell: Bell, warning: AlertTriangle, cloud: Cloud,
};

const KPI_TOOLTIPS: Record<string, string> = {
  "k-health": "A single roll-up of every service you consume, based on what your users actually experience.",
  "k-services": "How many of your subscribed services are currently meeting their targets.",
  "k-deploy": "Environments running your workloads, across the regions you are deployed in.",
  "k-avail": "The share of the last 24 hours your services were available, measured at the customer edge.",
  "k-events": "Open advisories and incidents relevant to you. Advisories mean we are watching, not that you are impacted.",
  "k-risk": "Deployments where an underlying condition raises the chance of future impact.",
  "k-azure": "Cloud provider services your deployments depend on. A degraded dependency does not automatically mean degraded service.",
};

export default function CustomerHealthOverview() {
  const { open } = useImpactDrawer();
  const activeEvent = events[0];

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        {kpis.map((k) => {
          const Icon = ICONS[k.icon];
          const s = statusStyles[k.status];
          return (
            <Interactive
              key={k.id}
              tooltip={KPI_TOOLTIPS[k.id]}
              onClick={() => open(k.contextId)}
              ariaLabel={`${k.label}: ${k.value}`}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-3"
            >
              <div className="flex items-start gap-3">
                <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg border", s.chip)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-500">{k.label}</div>
                  <div className={cn("truncate text-[17px] font-semibold leading-tight", s.text)}>{k.value}</div>
                  <div className="truncate text-[11px] text-slate-500">{k.caption}</div>
                </div>
              </div>
            </Interactive>
          );
        })}
      </div>

      {/* Deployments + dependency health */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Your Deployments" subtitle="Health of your service deployments">
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {deployments.slice(0, 3).map((d) => {
              const s = statusStyles[d.status];
              return (
                <Interactive
                  key={d.id}
                  tooltip={`What this deployment of yours is doing right now, and whether anything underneath it puts your users at risk.`}
                  onClick={() => open(d.contextId)}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className={cn("flex items-center gap-2 border-b px-3 py-2", s.chip)}>
                    <StatusDot status={d.status} />
                    <span className="text-[12px] font-medium">{s.label}</span>
                  </div>
                  <div className="px-3 py-3">
                    <div className="text-[13.5px] font-semibold text-slate-900">{d.name}</div>
                    <div className="mt-0.5 text-[11.5px] text-slate-500">{d.region}</div>
                    <div className="text-[11.5px] text-slate-500">{d.nodes} Nodes</div>
                    <div className="text-[11.5px] text-slate-500">{d.tier}</div>
                    <div className="mt-2.5 flex items-end justify-between gap-2 border-t border-slate-200 pt-2.5">
                      <div>
                        <div className="text-[16px] font-semibold text-slate-900">{d.availability}</div>
                        <div className="text-[10.5px] text-slate-500">Availability (24h)</div>
                      </div>
                      <div className="w-24"><Sparkline points={d.spark} status={d.status} /></div>
                    </div>
                    <div className={cn("mt-2 text-[11.5px]", d.status === "healthy" ? "text-slate-500" : s.text)}>{d.alerts}</div>
                  </div>
                </Interactive>
              );
            })}
          </div>
        </Panel>

        <Panel title="Service Dependency Health" subtitle="Health across layers that support your services">
          <ul className="divide-y divide-slate-200">
            {dependencies.map((row) => (
              <li key={row.id}>
                <Interactive
                  tooltip="How this supporting layer is behaving — and whether its condition is reaching your users."
                  onClick={() => open(row.contextId)}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-transparent px-2.5 py-2.5 sm:grid-cols-[180px_120px_1fr]"
                >
                  <span className="text-[12.5px] font-medium text-slate-900">{row.layer}</span>
                  <StatusChip status={row.status} />
                  <span className="hidden text-[11.5px] text-slate-500 sm:block">{row.description}</span>
                </Interactive>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Active event / regional health / availability */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Active Event" subtitle="Events currently open against your services">
          <Interactive
            tooltip="An open advisory. Advisories describe an underlying condition we are managing; they do not mean your service is impacted."
            onClick={() => open(activeEvent.contextId)}
            className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3.5 py-3"
          >
            <StatusChip status="advisory" label={activeEvent.kind.toUpperCase()} />
            <div className="mt-2 text-[13.5px] font-semibold text-slate-900">{activeEvent.title}</div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              Started {activeEvent.started} · Updated {activeEvent.updated}
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">{activeEvent.summary}</p>
            <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-200 pt-2.5 text-[11px]">
              <div><dt className="text-slate-500">Impact to you</dt><dd className="text-emerald-400">{activeEvent.impactToYou}</dd></div>
              <div><dt className="text-slate-500">Affected deployment</dt><dd className="text-slate-700">{activeEvent.affectedDeployment}</dd></div>
              <div><dt className="text-slate-500">Affected dependency</dt><dd className="text-slate-700">{activeEvent.affectedDependency}</dd></div>
              <div><dt className="text-slate-500">Our response</dt><dd className="text-slate-700">{activeEvent.response}</dd></div>
              <div><dt className="text-slate-500">Provider reference</dt><dd className="font-mono text-slate-700">{activeEvent.providerReference}</dd></div>
              <div><dt className="text-slate-500">Next update</dt><dd className="text-slate-700">{activeEvent.nextUpdate}</dd></div>
            </dl>
          </Interactive>
        </Panel>

        <Panel title="Regional Health" subtitle="Health of cloud regions relevant to your services">
          <div className="relative mb-3 h-32 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(56,189,248,0.10),transparent_60%)]" aria-hidden />
            {regions.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => open(r.contextId)}
                aria-label={`${r.name} region health`}
                title={`${r.name} — ${r.note}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 transition-transform duration-200 hover:scale-125"
                style={{ left: `${r.x}%`, top: `${r.y}%` }}
              >
                <span className={cn("block h-2.5 w-2.5 rounded-full ring-4 ring-slate-200", statusStyles[r.status].dot)} />
              </button>
            ))}
          </div>
          <ul className="space-y-1.5">
            {regions.slice(0, 4).map((r) => (
              <li key={r.id}>
                <Interactive
                  tooltip="Whether this cloud region is healthy, and whether anything you run there is affected."
                  onClick={() => open(r.contextId)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                >
                  <span className="text-[12.5px] text-slate-700">{r.name}</span>
                  <span className="text-right">
                    <span className={cn("text-[12px] font-medium", statusStyles[r.status].text)}>{statusStyles[r.status].label}</span>
                    <span className="block text-[10.5px] text-slate-500">{r.note}</span>
                  </span>
                </Interactive>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Availability (30 Days)" subtitle="Your service availability over time">
          <Interactive
            tooltip="Daily availability for the last 30 days measured at the customer edge, compared with your contractual target."
            onClick={() => open("slo-availability")}
            className="rounded-lg border border-slate-200 px-3 py-3"
          >
            <div className="text-[24px] font-semibold leading-none text-slate-900">99.991%</div>
            <div className="text-[11px] text-slate-500">30-day availability</div>
            <div className="mt-3 flex h-24 items-end gap-[3px]">
              {availability30d.map((v, i) => {
                const h = Math.max(8, ((v - 99.97) / 0.03) * 100);
                const tone = v >= 99.99 ? "bg-emerald-500" : v >= 99.98 ? "bg-amber-400" : "bg-orange-400";
                return <span key={i} className={cn("flex-1 rounded-sm transition-all duration-200", tone)} style={{ height: `${Math.min(100, h)}%` }} />;
              })}
            </div>
          </Interactive>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-lg border border-slate-200 px-2.5 py-2">
              <div className="text-slate-500">SLO Target</div><div className="text-[13px] text-slate-900">99.99%</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-2.5 py-2">
              <div className="text-slate-500">SLO Status</div><div className="text-[13px] text-emerald-400">Met</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-2.5 py-2">
              <div className="text-slate-500">Error Budget</div><div className="text-[13px] text-slate-900">93.4%</div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Risk / SLO / changes */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Risk & Early Warning" subtitle="Proactive risk signals for your environment">
          <div className="grid grid-cols-2 gap-3">
            {risks.map((r) => (
              <Interactive
                key={r.id}
                tooltip="A prediction of how likely this area is to affect your users in the near future — not a statement that it already has."
                onClick={() => open(r.contextId)}
                className="rounded-lg border border-slate-200 px-3 py-2.5"
              >
                <div className="text-[11px] text-slate-500">{r.label}</div>
                <div className={cn("text-[14px] font-semibold", statusStyles[r.status].text)}>{r.level}</div>
                <Sparkline points={r.spark} status={r.status} className="mt-1" />
              </Interactive>
            ))}
          </div>
          <p className="mt-2.5 text-[10.5px] text-slate-500">Risk is calculated using predictive analysis and historical patterns.</p>
        </Panel>

        <Panel title="SLO Status" subtitle="Your service level objectives">
          <div className="grid grid-cols-2 gap-3">
            {slos.map((s) => (
              <Interactive
                key={s.id}
                tooltip="How your service is performing against a commitment we make to you, and how much error budget remains."
                onClick={() => open(s.contextId)}
                className="rounded-lg border border-slate-200 px-3 py-2.5"
              >
                <div className="text-[11px] text-slate-500">{s.name}</div>
                <div className="text-[15px] font-semibold text-slate-900">{s.target}</div>
                <div className={cn("text-[11.5px]", statusStyles[s.status].text)}>{s.current} current</div>
                <div className="mt-2"><MetricBar value={s.errorBudget} status={s.status} /></div>
              </Interactive>
            ))}
          </div>
        </Panel>

        <Panel title="Recent Changes & Maintenance" subtitle="Upcoming changes that may affect your environment">
          <ul className="space-y-2">
            {changes.map((c) => (
              <li key={c.id}>
                <Interactive
                  tooltip="A planned change in your environment or at the cloud provider, with our assessment of what it could mean for you."
                  onClick={() => open(c.contextId)}
                  className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5"
                >
                  <span className="flex min-w-0 items-start gap-2.5">
                    <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] text-slate-900">{c.title}</span>
                      <span className="block text-[11px] text-slate-500">{c.window}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[10.5px] text-slate-500">Potential impact</span>
                    <span className={cn("text-[12px]", c.potentialImpact === "None" ? "text-emerald-400" : "text-amber-400")}>
                      {c.potentialImpact}
                    </span>
                  </span>
                </Interactive>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
