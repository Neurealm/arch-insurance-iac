// Universal right-side contextual intelligence drawer. Every infrastructure,
// deployment, dependency, event, region, SLO and risk object populates this
// single component. It always separates the underlying infrastructure
// condition from the actual customer impact.

import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomerImpactContext } from "./types";
import { impactStyles, statusStyles, StatusChip } from "./primitives";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-200 px-5 py-4 first:border-t-0">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function CustomerImpactDrawer({
  context, onClose,
}: { context: CustomerImpactContext | null; onClose: () => void }) {
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    setShowTechnical(false);
  }, [context?.id]);

  useEffect(() => {
    if (!context) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [context, onClose]);

  if (!context) return null;
  const infra = statusStyles[context.infrastructureStatus];

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
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold text-slate-900">{context.title}</h2>
            {context.subtitle && <p className="mt-0.5 text-[11.5px] text-slate-500">{context.subtitle}</p>}
          </div>
          <button
            type="button" onClick={onClose} aria-label="Close panel"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-500 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Section title="What is happening?">
            <p className="text-[13px] leading-relaxed text-slate-600">{context.whatIsHappening}</p>
          </Section>

          <Section title="Does this affect me?">
            <div className={cn("rounded-lg border px-3.5 py-3", impactStyles[context.impact])}>
              <div className="text-[16px] font-semibold tracking-tight">{context.impact}</div>
              <p className="mt-1 text-[11.5px] leading-snug text-slate-600">
                Underlying infrastructure condition:{" "}
                <span className={infra.text}>{infra.label}</span> — {context.infrastructureNote}
              </p>
            </div>
          </Section>

          <Section title="What of mine is affected?">
            <ul className="space-y-2">
              {context.affected.map((a) => (
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

          <Section title="What are we seeing?">
            <ul className="space-y-2">
              {context.signals.map((s) => (
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
              {context.whatIsBeingDone.map((w) => (
                <li key={w} className="flex gap-2 text-[12.5px] leading-snug text-slate-600">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-sky-400" aria-hidden />
                  {w}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Do I need to do anything?">
            <div
              className={cn(
                "rounded-lg border px-3.5 py-3 text-[12.5px] leading-relaxed",
                context.noActionRequired
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-sky-500/40 bg-sky-500/10 text-sky-200",
              )}
            >
              <div className="text-[13px] font-semibold">
                {context.noActionRequired ? "No action required" : "Recommended action"}
              </div>
              <p className="mt-1 text-slate-600">{context.customerAction}</p>
            </div>
          </Section>

          <Section title="Timeline">
            <ol className="space-y-0">
              {context.timeline.map((t, i) => (
                <li key={`${t.stage}-${i}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 rounded-full",
                        t.pending ? "border border-slate-300 bg-transparent" : "bg-sky-400",
                      )}
                      aria-hidden
                    />
                    {i < context.timeline.length - 1 && <span className="w-px flex-1 bg-slate-200" aria-hidden />}
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
                {context.technical.map((t) => (
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
          <StatusChip status={context.infrastructureStatus} label={`Infrastructure: ${infra.label}`} />
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
