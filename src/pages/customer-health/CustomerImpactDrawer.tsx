// Universal right-side contextual intelligence drawer. Every infrastructure,
// deployment, dependency, event, region, SLO and risk object populates this
// single component. It always separates the underlying infrastructure
// condition from the actual customer impact.

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomerImpactContext, DeploymentDetail } from "./types";
import { getImpactContext } from "./data";
import { impactStyles, statusStyles, StatusChip } from "./primitives";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-200 px-5 py-4 first:border-t-0">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/* ------------------- deployment-specific drawer sections ------------------ */

function LayerButton({
  label, status, note, onClick,
}: { label: string; status: CustomerImpactContext["infrastructureStatus"]; note: string; onClick: () => void }) {
  const s = statusStyles[status];
  return (
    <button
      type="button" onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-all duration-200 hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70"
    >
      <span className={cn("h-2 w-2 shrink-0 rounded-full", s.dot)} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-[12.5px] font-medium text-slate-900">{label}</span>
        <span className="block truncate text-[11px] text-slate-500">{note}</span>
      </span>
      <span className={cn("shrink-0 text-[11.5px] font-medium", s.text)}>{s.label}</span>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
    </button>
  );
}

function DeploymentSections({ d, onDrill }: { d: DeploymentDetail; onDrill: (id: string) => void }) {
  const sv = statusStyles[d.service.health];
  return (
    <>
      <Section title="Your Service">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="text-[11px] text-slate-500">Health</div>
            <div className={cn("text-[13.5px] font-semibold", sv.text)}>{d.service.healthLabel}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="text-[11px] text-slate-500">Availability</div>
            <div className="text-[13.5px] font-semibold tabular-nums text-slate-900">{d.service.availability}</div>
          </div>
          <div className="col-span-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="text-[11px] text-slate-500">Current customer impact</div>
            <div className="text-[12.5px] font-medium text-slate-700">{d.service.customerImpact}</div>
          </div>
          <div className="col-span-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="text-[11px] text-slate-500">SLO status</div>
            <div className={cn("text-[12.5px] font-medium", statusStyles[d.service.sloStatusLevel].text)}>{d.service.sloStatus}</div>
          </div>
        </div>
      </Section>

      <Section title="Supporting Infrastructure">
        <div className="space-y-2">
          {d.infrastructure.map((l) => (
            <LayerButton key={l.label} label={l.label} status={l.status} note={l.note} onClick={() => onDrill(l.contextId)} />
          ))}
        </div>
      </Section>

      <Section title="Customer Impact">
        <div className={cn("rounded-lg border px-3.5 py-3", impactStyles[d.impact.level])}>
          <div className="text-[14px] font-semibold tracking-tight">{d.impact.statement}</div>
        </div>
        <dl className="mt-2 space-y-1">
          {[
            ["Current impact", d.impact.current],
            ["Potential impact", d.impact.potential],
            ["Affected functionality", d.impact.functionality],
            ["Customer action", d.impact.action],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-1.5">
              <dt className="text-[11.5px] text-slate-500">{k}</dt>
              <dd className="text-right text-[12px] font-medium text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="What we're seeing">
        <p className="text-[13px] leading-relaxed text-slate-600">{d.seeing}</p>
      </Section>

      <Section title="What we're doing">
        <p className="text-[13px] leading-relaxed text-slate-600">{d.doing}</p>
      </Section>

      <Section title="Deployment dependency map">
        <ul className="space-y-1.5">
          {d.tree.map((n) => {
            const s = statusStyles[n.status];
            return (
              <li key={n.id} style={{ paddingLeft: `${n.depth * 14}px` }}>
                <button
                  type="button" onClick={() => onDrill(n.contextId)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-left transition-all duration-200",
                    "hover:-translate-y-[1px] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70",
                    s.chip,
                  )}
                >
                  {n.depth > 0 && <span className="text-[11px] text-slate-400" aria-hidden>&#8627;</span>}
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", s.dot)} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-medium text-slate-900">{n.label}</span>
                    <span className="block truncate text-[10.5px] text-slate-500">{n.note}</span>
                  </span>
                  <span className={cn("shrink-0 text-[10.5px] font-medium", s.text)}>{s.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}

export function CustomerImpactDrawer({
  context, onClose,
}: { context: CustomerImpactContext | null; onClose: () => void }) {
  const [showTechnical, setShowTechnical] = useState(false);
  const [stack, setStack] = useState<CustomerImpactContext[]>([]);

  useEffect(() => {
    setShowTechnical(false);
    setStack([]);
  }, [context?.id]);

  useEffect(() => {
    if (!context) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [context, onClose]);

  if (!context) return null;
  const current = stack.length > 0 ? stack[stack.length - 1] : context;
  const infra = statusStyles[current.infrastructureStatus];
  const drill = (id: string) => setStack((prev) => [...prev, getImpactContext(id)]);
  const back = () => setStack((prev) => prev.slice(0, -1));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button" aria-label="Close panel" tabIndex={-1}
        className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" onClick={onClose}
      />
      <aside
        role="dialog" aria-modal="true" aria-label={context.title}
        className="ch-drawer relative flex h-full w-full max-w-[460px] flex-col border-l border-slate-200 bg-slate-50 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex min-w-0 items-start gap-2.5">
            {stack.length > 0 && (
              <button
                type="button" onClick={back} aria-label="Back"
                className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-[15px] font-semibold text-slate-900">{current.title}</h2>
              {current.subtitle && <p className="mt-0.5 text-[11.5px] text-slate-500">{current.subtitle}</p>}
            </div>
          </div>
          <button
            type="button" onClick={onClose} aria-label="Close panel"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-500 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {current.deployment && <DeploymentSections d={current.deployment} onDrill={drill} />}

          {!current.deployment && (
          <Section title="What is happening?">
            <p className="text-[13px] leading-relaxed text-slate-600">{current.whatIsHappening}</p>
          </Section>
          )}

          {!current.deployment && (
          <Section title="Does this affect me?">
            <div className={cn("rounded-lg border px-3.5 py-3", impactStyles[current.impact])}>
              <div className="text-[16px] font-semibold tracking-tight">{current.impact}</div>
              <p className="mt-1 text-[11.5px] leading-snug text-slate-600">
                Underlying infrastructure condition:{" "}
                <span className={infra.text}>{infra.label}</span> — {current.infrastructureNote}
              </p>
            </div>
          </Section>
          )}

          <Section title="What of mine is affected?">
            <ul className="space-y-2">
              {current.affected.map((a) => (
                <li key={a.label} className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", statusStyles[a.status].dot)} aria-hidden />
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium text-slate-900">{a.label}</div>
                    <div className="text-[11.5px] text-slate-500">{a.detail}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          {current.metrics && current.metrics.length > 0 && (
            <Section title="Key figures">
              <div className="grid grid-cols-2 gap-2">
                {current.metrics.map((m) => (
                  <div key={m.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <div className="text-[11px] text-slate-500">{m.label}</div>
                    <div className={cn("text-[14px] font-semibold tabular-nums", m.status ? statusStyles[m.status].text : "text-slate-900")}>{m.value}</div>
                    {m.caption && <div className="text-[10.5px] leading-snug text-slate-500">{m.caption}</div>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {current.groups?.map((g) => (
            <Section key={g.title} title={g.title}>
              {g.caption && <p className="mb-2 text-[11.5px] leading-snug text-slate-500">{g.caption}</p>}
              <ul className="space-y-2">
                {g.rows.map((r) => (
                  <li key={r.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-[12.5px] font-medium text-slate-900">
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", statusStyles[r.status].dot)} aria-hidden />
                        {r.label}
                      </span>
                      {r.impact && (
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", impactStyles[r.impact])}>
                          {r.impact}
                        </span>
                      )}
                    </div>
                    {r.note && <p className="mt-1 text-[11.5px] leading-snug text-slate-500">{r.note}</p>}
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                      {r.fields.map((f) => (
                        <div key={f.label} className="flex items-baseline justify-between gap-2 border-b border-slate-100 py-0.5">
                          <dt className="text-[11px] text-slate-500">{f.label}</dt>
                          <dd className={cn("text-right text-[11.5px] font-medium tabular-nums", f.status ? statusStyles[f.status].text : "text-slate-700")}>{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
            </Section>
          ))}

          <Section title="What are we seeing?">
            <ul className="space-y-2">
              {current.signals.map((s) => (
                <li key={s.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[12px] text-slate-500">{s.label}</span>
                    <span className={cn("text-[13px] font-semibold tabular-nums", statusStyles[s.status].text)}>{s.value}</span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-snug text-slate-500">{s.interpretation}</p>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="What is being done?">
            <ul className="space-y-1.5">
              {current.whatIsBeingDone.map((w) => (
                <li key={w} className="flex gap-2 text-[12.5px] leading-snug text-slate-600">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-sky-400" aria-hidden />
                  {w}
                </li>
              ))}
            </ul>
          </Section>

          {!current.deployment && (
          <Section title="Do I need to do anything?">
            <div
              className={cn(
                "rounded-lg border px-3.5 py-3 text-[12.5px] leading-relaxed",
                current.noActionRequired
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                  : "border-sky-500/40 bg-sky-500/10 text-sky-700",
              )}
            >
              <div className="text-[13px] font-semibold">
                {current.noActionRequired ? "No action required" : "Recommended action"}
              </div>
              <p className="mt-1 text-slate-600">{current.customerAction}</p>
            </div>
          </Section>
          )}

          <Section title="Timeline">
            <ol className="space-y-0">
              {current.timeline.map((t, i) => (
                <li key={`${t.stage}-${i}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 rounded-full",
                        t.pending ? "border border-slate-300 bg-transparent" : "bg-sky-400",
                      )}
                      aria-hidden
                    />
                    {i < current.timeline.length - 1 && <span className="w-px flex-1 bg-slate-200" aria-hidden />}
                  </div>
                  <div className={cn("pb-3", t.pending && "opacity-60")}>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[12.5px] font-medium text-slate-900">{t.stage}</span>
                      <span className="font-mono text-[11px] text-slate-500">{t.at}</span>
                    </div>
                    <p className="text-[11.5px] leading-snug text-slate-500">{t.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <div className="border-t border-slate-200 px-5 py-3">
            <button
              type="button"
              onClick={() => setShowTechnical((v) => !v)}
              aria-expanded={showTechnical}
              className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 transition-colors duration-200 hover:text-slate-600"
            >
              Technical details
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", showTechnical && "rotate-180")} />
            </button>
            {showTechnical && (
              <dl className="mt-2 space-y-1.5">
                {current.technical.map((t) => (
                  <div key={t.label} className="flex justify-between gap-4 rounded-md border border-slate-200 bg-white px-3 py-2">
                    <dt className="text-[11.5px] text-slate-500">{t.label}</dt>
                    <dd className="text-right font-mono text-[11.5px] text-slate-700">{t.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        <footer className="border-t border-slate-200 px-5 py-3">
          <StatusChip status={current.infrastructureStatus} label={`Infrastructure: ${infra.label}`} />
        </footer>

        <style>{`
          @keyframes chDrawerIn { from { transform: translateX(24px); opacity: 0.4 } to { transform: none; opacity: 1 } }
          .ch-drawer { animation: chDrawerIn 200ms ease-out; }
          @media (prefers-reduced-motion: reduce) { .ch-drawer { animation: none } }
        `}</style>
      </aside>
    </div>
  );
}
