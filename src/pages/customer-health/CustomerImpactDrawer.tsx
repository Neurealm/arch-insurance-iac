// Universal right-side contextual intelligence drawer. Every infrastructure,
// deployment, dependency, event, region, SLO and risk object populates this
// single component. It always separates the underlying infrastructure
// condition from the actual customer impact.

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomerImpactContext, DependencyDetail, DeploymentDetail, EventDetail, RegionDetail, RiskDetail } from "./types";
import { getImpactContext } from "./data";
import { impactStyles, Sparkline, statusStyles, StatusChip } from "./primitives";
import { classificationStyles } from "./eventDetail";
import { riskLevelStyles, trendStyles } from "./RiskEarlyWarningPanel";

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


/* -------------------- region-specific drawer sections -------------------- */

function RegionSections({ r, onDrill }: { r: RegionDetail; onDrill: (id: string) => void }) {
  const infra = statusStyles[r.infrastructure.status];
  const svc = statusStyles[r.service.status];
  return (
    <>
      <Section title="Region Condition">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <div className="text-[10.5px] uppercase tracking-wide text-slate-500">Infrastructure condition</div>
            <div className={cn("mt-0.5 flex items-center gap-1.5 text-[13.5px] font-semibold", infra.text)}>
              <span className={cn("h-2 w-2 rounded-full", infra.dot)} aria-hidden />{r.infrastructure.label}
            </div>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">{r.infrastructure.note}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <div className="text-[10.5px] uppercase tracking-wide text-slate-500">Your service</div>
            <div className={cn("mt-0.5 flex items-center gap-1.5 text-[13.5px] font-semibold", r.hasDeployment ? svc.text : "text-slate-500")}>
              {r.hasDeployment && <span className={cn("h-2 w-2 rounded-full", svc.dot)} aria-hidden />}
              {r.hasDeployment ? r.service.label : "Not applicable"}
            </div>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">{r.service.note}</p>
          </div>
        </div>
      </Section>

      <Section title="Your Footprint">
        {r.hasDeployment ? (
          <ul className="space-y-1.5">
            {r.footprint.map((f) => (
              <li key={f} className="flex gap-2 text-[12.5px] leading-snug text-slate-600">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-sky-400" aria-hidden />{f}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-slate-300 bg-slate-100 px-3.5 py-3">
            <div className="text-[13px] font-semibold text-slate-700">No customer deployment in this region</div>
            <p className="mt-1 text-[11.5px] leading-snug text-slate-600">
              Regional conditions are shown so you can inspect them, but nothing you run depends on this region.
            </p>
          </div>
        )}
      </Section>

      <Section title="What's happening?">
        <p className="text-[13px] leading-relaxed text-slate-600">{r.whatsHappening}</p>
      </Section>

      <Section title="Does this affect me?">
        <div className={cn("rounded-lg border px-3.5 py-3", impactStyles[r.affectsMe.verdict])}>
          <div className="text-[16px] font-semibold tracking-tight">{r.affectsMe.verdict}</div>
          <p className="mt-1 text-[11.5px] leading-snug text-slate-600">{r.affectsMe.explanation}</p>
        </div>
      </Section>

      <Section title="Your Dependencies">
        <ul className="space-y-2">
          {r.dependencies.map((d) =>
            d.contextId ? (
              <li key={d.label}>
                <LayerButton label={d.label} status={d.status} note={d.note} onClick={() => onDrill(d.contextId!)} />
              </li>
            ) : (
              <li key={d.label} className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", statusStyles[d.status].dot)} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-medium text-slate-900">{d.label}</span>
                  <span className="block truncate text-[11px] text-slate-500">{d.note}</span>
                </span>
                <span className={cn("shrink-0 text-[11.5px] font-medium", statusStyles[d.status].text)}>{statusStyles[d.status].label}</span>
              </li>
            ),
          )}
        </ul>
      </Section>

      <Section title="Other Regional Signals">
        <div className="grid grid-cols-2 gap-2">
          {r.regionalSignals.map((s) => (
            <div key={s.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="text-[11px] text-slate-500">{s.label}</div>
              <div className={cn("text-[12.5px] font-semibold", statusStyles[s.status].text)}>{s.value}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Risk">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="text-[11px] text-slate-500">Current impact</div>
            <div className="text-[12.5px] font-semibold text-slate-900">{r.risk.current}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="text-[11px] text-slate-500">Potential impact</div>
            <div className="text-[12.5px] font-semibold text-slate-900">{r.risk.potential}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="text-[11px] text-slate-500">Trend</div>
            <div className={cn("text-[12.5px] font-semibold", statusStyles[r.risk.trendStatus].text)}>{r.risk.trend}</div>
          </div>
        </div>
      </Section>

      <Section title="Response">
        <ul className="space-y-1.5">
          {r.response.map((x) => (
            <li key={x} className="flex gap-2 text-[12.5px] leading-snug text-slate-600">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-sky-400" aria-hidden />{x}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

/* ------------------ dependency-specific drawer sections ------------------ */

function TelemetryTrend({ t, status }: { t: DependencyDetail["trend"]; status: CustomerImpactContext["infrastructureStatus"] }) {
  const w = 320, h = 84, pad = 6;
  const vals = [...t.series, t.baseline, t.warning];
  const max = Math.max(...vals), min = Math.min(...vals);
  const span = max - min || 1;
  const y = (v: number) => pad + (1 - (v - min) / span) * (h - pad * 2);
  const x = (i: number) => pad + (i / (t.series.length - 1)) * (w - pad * 2);
  const path = t.series.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = t.series[t.series.length - 1];
  const stroke = status === "healthy" ? "#059669" : status === "degraded" ? "#d97706" : "#dc2626";
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <div className="text-[11.5px] text-slate-500">{t.caption}</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 w-full" role="img" aria-label={t.caption}>
        <line x1={pad} x2={w - pad} y1={y(t.warning)} y2={y(t.warning)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" />
        <line x1={pad} x2={w - pad} y1={y(t.baseline)} y2={y(t.baseline)} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 3" />
        <path d={path} fill="none" stroke={stroke} strokeWidth="1.8" />
        <circle cx={x(t.series.length - 1)} cy={y(last)} r="3" fill={stroke} />
      </svg>
      <div className="mt-1 flex flex-wrap gap-3 text-[10.5px] text-slate-500">
        <span className="flex items-center gap-1"><span className="h-px w-3 bg-slate-400" aria-hidden />Normal baseline {t.baseline}{t.unit}</span>
        <span className="flex items-center gap-1"><span className="h-px w-3 bg-amber-500" aria-hidden />Warning threshold {t.warning}{t.unit}</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: stroke }} aria-hidden />Current {last}{t.unit}</span>
      </div>
    </div>
  );
}

function DependencySections({ d, onDrill }: { d: DependencyDetail; onDrill: (id: string) => void }) {
  const cond = statusStyles[d.conditionStatus];
  return (
    <>
      <Section title="Customer Impact">
        <div className={cn("rounded-lg border px-3.5 py-3", impactStyles[d.impactLevel])}>
          <div className="text-[16px] font-semibold tracking-tight">{d.impactVerdict}</div>
          <p className="mt-1 text-[11.5px] leading-snug text-slate-600">
            Underlying dependency condition: <span className={cond.text}>{cond.label}</span> — {d.conditionLabel}
          </p>
        </div>
      </Section>

      <Section title="Affected Deployments">
        <ul className="space-y-2">
          {d.affectedDeployments.map((a) => (
            <li key={a.name} className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", statusStyles[a.status].dot)} aria-hidden />
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-slate-900">{a.name}</div>
                <div className="text-[11.5px] text-slate-500">{a.note}</div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Signals">
        <div className="grid grid-cols-2 gap-2">
          {d.signals.map((s) => (
            <div key={s.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="text-[11px] text-slate-500">{s.label}</div>
              <div className={cn("text-[13px] font-semibold", statusStyles[s.status].text)}>{s.value}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Interpretation">
        <p className="text-[13px] leading-relaxed text-slate-600">{d.interpretation}</p>
      </Section>

      <Section title="Trend">
        <TelemetryTrend t={d.trend} status={d.conditionStatus} />
      </Section>

      <Section title="Related Infrastructure">
        <div className="space-y-2">
          {d.related.map((r) => (
            <LayerButton key={r.label} label={r.label} status={r.status} note={r.technical} onClick={() => onDrill(r.contextId)} />
          ))}
        </div>
      </Section>

      <Section title="Response">
        <ul className="space-y-1.5">
          {d.response.map((r) => (
            <li key={r} className="flex gap-2 text-[12.5px] leading-snug text-slate-600">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-sky-400" aria-hidden />
              {r}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

/* --------------------- event-specific drawer sections --------------------- */

function Grid({ rows }: { rows: { label: string; value: string; status: CustomerImpactContext["infrastructureStatus"] }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {rows.map((r) => (
        <div key={r.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
          <div className="text-[11px] text-slate-500">{r.label}</div>
          <div className={cn("text-[13px] font-semibold", statusStyles[r.status].text)}>{r.value}</div>
        </div>
      ))}
    </div>
  );
}

function Expandable({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button" onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-[12.5px] font-medium text-slate-700"
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="border-t border-slate-200 px-3 py-2">{children}</div>}
    </div>
  );
}

function EventSections({ e }: { e: EventDetail }) {
  const cls = classificationStyles[e.classification] ?? classificationStyles.Advisory;
  return (
    <>
      <Section title="Does this affect me?">
        <div className={cn("rounded-lg border px-3.5 py-3", impactStyles[e.impactVerdict])}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", cls.chip)}>{cls.label}</span>
          </div>
          <div className="mt-1.5 text-[16px] font-semibold tracking-tight">{e.impactVerdict}</div>
          <p className="mt-1 text-[11.5px] leading-snug text-slate-600">{cls.blurb}</p>
        </div>
      </Section>

      <Section title="Situation">
        <p className="text-[13px] leading-relaxed text-slate-600">{e.situation}</p>
      </Section>

      <Section title="Your Environment">
        <ul className="space-y-2">
          {e.environment.map((d) => (
            <li key={d.name} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <span className="flex items-center gap-2 text-[12.5px] font-medium text-slate-900">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", statusStyles[d.status].dot)} aria-hidden />
                {d.name}
              </span>
              <span className="text-[11.5px] text-slate-500">
                <span className={d.exposure === "Exposed" ? "font-medium text-amber-600" : "text-slate-500"}>{d.exposure}</span>
                {" · "}
                <span className={statusStyles[d.status].text}>{d.health}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Customer Experience"><Grid rows={e.customerExperience} /></Section>
      <Section title="Infrastructure Condition"><Grid rows={e.infrastructureCondition} /></Section>

      <Section title="Actions Underway">
        <ul className="space-y-1.5">
          {e.actionsUnderway.map((a) => (
            <li key={a.label} className="flex items-center gap-2 text-[12.5px] text-slate-600">
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", a.done ? "bg-emerald-500" : "border border-slate-300 bg-transparent")} aria-hidden />
              <span className={a.done ? "" : "text-slate-500"}>{a.label}{a.done ? "" : " (in progress)"}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Event Timeline">
        <ol className="space-y-0">
          {e.eventTimeline.map((t, i) => (
            <li key={`${t.time}-${i}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-sky-400" aria-hidden />
                {i < e.eventTimeline.length - 1 && <span className="w-px flex-1 bg-slate-200" aria-hidden />}
              </div>
              <div className="pb-3">
                <div className="text-[12px] font-medium tabular-nums text-slate-900">{t.time}</div>
                <div className="text-[11.5px] text-slate-500">{t.entry}</div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Customer Action">
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-3 text-[12.5px] leading-relaxed text-slate-600">
          {e.customerAction}
        </div>
      </Section>

      <Section title="Next Update">
        <div className="text-[13.5px] font-semibold text-slate-900">{e.nextUpdate}</div>
      </Section>

      <Section title="More detail">
        <div className="space-y-2">
          <Expandable title="Technical details">
            <dl className="grid gap-x-3 gap-y-1">
              {e.technical.map((t) => (
                <div key={t.label} className="flex items-baseline justify-between gap-3 border-b border-slate-100 py-0.5">
                  <dt className="text-[11px] text-slate-500">{t.label}</dt>
                  <dd className="text-right text-[11.5px] font-medium text-slate-700">{t.value}</dd>
                </div>
              ))}
            </dl>
          </Expandable>
          <Expandable title="Event history">
            <ul className="space-y-1.5">
              {e.history.map((h) => (
                <li key={h.time} className="text-[11.5px] text-slate-600">
                  <span className="font-medium text-slate-900">{h.time}</span> — {h.entry}
                </li>
              ))}
            </ul>
          </Expandable>
        </div>
      </Section>
    </>
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

/* --------------------- risk-specific drawer sections ---------------------- */

function RiskSections({ r }: { r: RiskDetail }) {
  const trend = trendStyles[r.trend];
  const health = statusStyles[r.currentHealthStatus];
  return (
    <>
      <Section title="Current risk">
        <div className="grid grid-cols-2 gap-2">
          <div className={cn("rounded-lg border px-3 py-2.5", riskLevelStyles[r.level])}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-75">Current risk</div>
            <div className="text-[17px] font-semibold uppercase tracking-tight">{r.level}</div>
          </div>
          <div className={cn("rounded-lg border px-3 py-2.5", impactStyles[r.currentImpact])}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-75">Current customer impact</div>
            <div className="text-[17px] font-semibold uppercase tracking-tight">NONE</div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <span className={cn("h-2 w-2 shrink-0 rounded-full", health.dot)} aria-hidden />
          <span className={cn("text-[12.5px] font-medium", health.text)}>{r.currentHealthLabel}</span>
        </div>
        <p className="mt-2 text-[11.5px] leading-snug text-slate-500">
          Risk is forward-looking. A healthy service can carry elevated risk — this describes what could
          potentially develop, not something that has already reached your users.
        </p>
      </Section>

      <Section title={`Why risk is ${r.level.toLowerCase()}`}>
        <ul className="space-y-2">
          {r.contributingSignals.map((s) => (
            <li key={s.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[12px] text-slate-500">{s.label}</span>
                <span className={cn("text-right text-[12.5px] font-semibold", statusStyles[s.status].text)}>{s.value}</span>
              </div>
              <div className="mt-1 text-[10.5px] font-medium uppercase tracking-[0.1em] text-slate-400">
                {s.raisesRisk ? "Raises risk" : "Does not raise risk"}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11.5px] leading-snug text-slate-500">
          These are correlated signals observed together. Individually none of them is customer-facing.
        </p>
      </Section>

      <Section title="What could happen?">
        <p className="text-[13px] leading-relaxed text-slate-600">{r.whatCouldHappen}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="text-[10.5px] text-slate-500">Estimated exposure</div>
            <div className="text-[14px] font-semibold text-slate-900">{r.estimatedExposure}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="text-[10.5px] text-slate-500">Confidence</div>
            <div className="text-[14px] font-semibold tabular-nums text-slate-900">{r.confidence}%</div>
          </div>
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-slate-500">{r.confidenceNote}</p>
      </Section>

      <Section title="Observed trend">
        <div className={cn("flex items-center gap-1.5 text-[13px] font-semibold", trend.text)}>
          <trend.Icon className="h-4 w-4 shrink-0" aria-hidden />
          {r.trend}
        </div>
        <Sparkline points={r.spark} status={r.levelStatus} className="mt-1.5" />
        <p className="mt-1 text-[11.5px] leading-snug text-slate-500">{r.trendNote}</p>
      </Section>

      <Section title="Affected deployments">
        <ul className="space-y-2">
          {r.affectedDeployments.map((d) => (
            <li key={d.name} className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", statusStyles[d.status].dot)} aria-hidden />
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-slate-900">{d.name}</div>
                <div className="text-[11.5px] text-slate-500">{d.note}</div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Preventive actions">
        <ul className="space-y-1.5">
          {r.preventiveActions.map((a) => (
            <li key={a.label} className="flex items-start gap-2 text-[12.5px] leading-snug text-slate-600">
              <span
                className={cn("mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full", a.done ? "bg-emerald-500" : "bg-sky-400")}
                aria-hidden
              />
              <span>
                {a.label}
                {!a.done && <span className="text-slate-400"> · standing by</span>}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Customer action">
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-3">
          <div className="text-[13px] font-semibold text-emerald-700">{r.customerAction}</div>
          <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
            We will contact you directly if this emerging condition begins to affect your service.
          </p>
        </div>
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
          {current.dependency && <DependencySections d={current.dependency} onDrill={drill} />}
          {current.event && <EventSections e={current.event} />}
          {current.region && <RegionSections r={current.region} onDrill={drill} />}
          {current.risk && <RiskSections r={current.risk} />}

          {!current.deployment && !current.dependency && !current.event && !current.region && !current.risk && !current.region && (
          <Section title="What is happening?">
            <p className="text-[13px] leading-relaxed text-slate-600">{current.whatIsHappening}</p>
          </Section>
          )}

          {!current.deployment && !current.dependency && !current.event && !current.region && !current.risk && !current.region && (
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

          {!current.dependency && !current.event && !current.region && !current.risk && (
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
          )}

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

          {!current.dependency && !current.event && !current.region && !current.risk && (
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
          )}

          {!current.dependency && !current.event && !current.region && !current.risk && (
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
          )}

          {!current.deployment && !current.dependency && !current.event && !current.region && !current.risk && !current.region && (
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

          {!current.event && !current.region && !current.risk && (
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
          )}

          {!current.event && (
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
          )}
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
