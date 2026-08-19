// Tactical SLO KPIs and pre-announcement early surveillance signals.
//
// These metrics are deliberately *leading*: they describe what our own
// telemetry sees before the cloud provider publishes a service health
// notification. A provider condition is never presented as customer impact —
// each signal separates "what we are seeing" from "what it means for you".

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { HealthStatus } from "./types";
import { MetricBar, Panel, Sparkline, StatusChip, statusStyles } from "./primitives";

interface TacticalKpi {
  id: string;
  label: string;
  question: string;
  value: string;
  caption: string;
  status: HealthStatus;
  /** 0-100 progress representation, omitted when not meaningful. */
  bar?: number;
  trend?: number[];
  meaning: string;
  action: string;
  evidence: { label: string; value: string }[];
}

/* --------------------------- error budget tactics -------------------------- */

const budgetKpis: TacticalKpi[] = [
  {
    id: "burn",
    label: "Error budget burn rate",
    question: "Are we spending the allowance faster than the month can absorb?",
    value: "0.9×",
    caption: "Sustainable pace is 1.0× · rising since 06:00 PT",
    status: "healthy",
    bar: 45,
    trend: [0.4, 0.4, 0.5, 0.6, 0.7, 0.9, 0.9],
    meaning:
      "At the current pace the monthly allowance finishes with budget left over. Anything sustained above 1.0× means the objective would be missed if nothing changes.",
    action: "No action required. We re-check the pace every 5 minutes and raise an advisory if it holds above 1.4× for an hour.",
    evidence: [
      { label: "Fast burn (1h window)", value: "1.2× — below the 14.4× page threshold" },
      { label: "Slow burn (6h window)", value: "0.9× — below the 6× ticket threshold" },
      { label: "Largest contributor", value: "EU North identity failover (4.1% of budget)" },
    ],
  },
  {
    id: "exhaustion",
    label: "Projected budget exhaustion",
    question: "If today repeats, when do we breach?",
    value: "No breach projected",
    caption: "~88% remaining at month end · 11 days of cover at worst observed rate",
    status: "healthy",
    bar: 88,
    meaning:
      "A forward projection of the objective using the last 24 hours of consumption, not a historical average. It answers when the commitment would be missed if today's conditions persisted.",
    action: "Keep the West US 2 advisory under watch — it is the only condition capable of moving this date inside the month.",
    evidence: [
      { label: "At current burn", value: "Budget lasts beyond month end" },
      { label: "At worst 1h burn", value: "Budget would last 11 days" },
      { label: "Confidence", value: "High — based on 30 days of matched conditions" },
    ],
  },
  {
    id: "ttd",
    label: "Time to detect",
    question: "How quickly do we see a problem?",
    value: "48 sec",
    caption: "Median across the last 30 days · target under 120 sec",
    status: "healthy",
    trend: [72, 66, 61, 58, 54, 49, 48],
    meaning:
      "The time between the first customer-visible symptom and our detection of it. Shorter detection is what makes the rest of these signals actionable.",
    action: "Detection is inside target. Synthetic probes run every 30 seconds from four external vantage points.",
    evidence: [
      { label: "Fastest path", value: "Synthetic probe — 22 sec" },
      { label: "Slowest path", value: "Dependency error-rate model — 3 min 10 sec" },
      { label: "Missed detections", value: "0 in the last 30 days" },
    ],
  },
  {
    id: "ttm",
    label: "Time to mitigate",
    question: "How quickly is impact removed once seen?",
    value: "6 min 20 sec",
    caption: "Median over 90 days · automated failover in 71% of cases",
    status: "healthy",
    trend: [11, 10, 9, 8, 7, 7, 6.3],
    meaning:
      "How long customer-visible symptoms persist after detection. This, not the provider's incident duration, is what consumes your availability budget.",
    action: "Nothing required. Failover automation covers the three most common conditions without human involvement.",
    evidence: [
      { label: "Automated mitigation", value: "3 min 05 sec median" },
      { label: "Human-led mitigation", value: "18 min 40 sec median" },
      { label: "Longest in 90 days", value: "27 min — April control-plane incident" },
    ],
  },
];

/* --------------------------- early surveillance --------------------------- */

const earlySignals: TacticalKpi[] = [
  {
    id: "lead",
    label: "Detection lead over provider notice",
    question: "Do we know before Azure announces it?",
    value: "31 min ahead",
    caption: "Median lead across the last 12 provider notifications",
    status: "healthy",
    trend: [18, 22, 24, 27, 29, 30, 31],
    meaning:
      "How far ahead of the cloud provider's published service health notification our own telemetry identified the same condition. Positive lead is the entire purpose of independent surveillance.",
    action: "You are notified on our detection, not on the provider's publication. No waiting on an external status page.",
    evidence: [
      { label: "Detected first", value: "11 of the last 12 provider events" },
      { label: "Best lead", value: "1 h 46 min — West Europe storage throttling" },
      { label: "Only miss", value: "Control-plane API deprecation — announcement-only, no telemetry signal" },
    ],
  },
  {
    id: "precursor",
    label: "Pre-announcement precursors open",
    question: "Is something building that nobody has declared yet?",
    value: "2 open",
    caption: "West US 2 storage latency drift · EU North auth retry climb",
    status: "at-risk",
    bar: 40,
    meaning:
      "Conditions our models consider abnormal but which no provider notification covers yet. They are not incidents and they are not affecting you — they are the shape a problem takes before it is declared.",
    action: "Both are being tracked. If either crosses the customer-impact threshold you will be notified without waiting for a provider advisory.",
    evidence: [
      { label: "West US 2 storage", value: "p99 write latency 3.4× baseline for 42 min — no customer symptom" },
      { label: "EU North identity", value: "Token retry rate up 210% — absorbed by the secondary path" },
      { label: "Provider notices covering these", value: "None published" },
    ],
  },
  {
    id: "anomaly",
    label: "Anomaly confidence",
    question: "How sure are we that this is real?",
    value: "78%",
    caption: "Highest-scoring open precursor · alerting threshold 85%",
    status: "advisory",
    bar: 78,
    trend: [41, 46, 52, 61, 68, 74, 78],
    meaning:
      "Model confidence that the strongest open precursor represents a genuine developing fault rather than normal variance. Rising confidence, not a single spike, is what triggers customer notification.",
    action: "At 85% we notify you directly and pre-stage the regional failover runbook. Currently rising slowly.",
    evidence: [
      { label: "Signals agreeing", value: "4 of 6 independent detectors" },
      { label: "Historic precision at this score", value: "72% became declared incidents" },
      { label: "Trend", value: "Up 37 points over 6 hours" },
    ],
  },
  {
    id: "blast",
    label: "Exposure if it lands",
    question: "If this becomes real, how much of me is exposed?",
    value: "18% of traffic",
    caption: "1 of 8 deployments · Production, West US 2",
    status: "advisory",
    bar: 18,
    meaning:
      "The share of your traffic that sits behind the precursor conditions currently open. This is potential exposure, not current impact — nothing is affected today.",
    action: "Shifting West US 2 read traffic to East US would reduce exposure to under 4%. Failover is pre-staged and can be triggered from the region view.",
    evidence: [
      { label: "Exposed deployment", value: "Production, West US 2 — 18% of requests" },
      { label: "Protected by DR", value: "Yes — Central US replica current to 42 sec" },
      { label: "Customers affected today", value: "None" },
    ],
  },
  {
    id: "dr",
    label: "Failover readiness",
    question: "If we have to move, can we?",
    value: "Ready · 42 sec lag",
    caption: "Last verified failover drill 9 days ago · target under 90 sec",
    status: "healthy",
    bar: 82,
    meaning:
      "Whether your disaster recovery path is genuinely usable right now: replica freshness, capacity headroom in the target region and the age of the last successful drill.",
    action: "No action required. Central US holds sufficient headroom to absorb the full West US 2 load.",
    evidence: [
      { label: "Replication lag", value: "42 sec (target under 90 sec)" },
      { label: "Target region headroom", value: "2.4× current West US 2 load" },
      { label: "Last drill result", value: "Passed — 4 min 12 sec cutover" },
    ],
  },
  {
    id: "freshness",
    label: "Surveillance coverage",
    question: "Can we actually see everything right now?",
    value: "97% verified",
    caption: "6 of 6 services reporting · 1 dependency on delayed telemetry",
    status: "advisory",
    bar: 97,
    meaning:
      "How much of your estate is currently confirmed by fresh telemetry. Anything we cannot verify is reported as unverified rather than assumed healthy — silence is never treated as good news.",
    action: "The delayed feed is a third-party payment dependency. Its health is being inferred from transaction success rather than direct telemetry.",
    evidence: [
      { label: "Freshest signal", value: "8 sec ago" },
      { label: "Oldest signal", value: "6 min 40 sec ago — payments dependency" },
      { label: "Objects unverified", value: "1 of 34" },
    ],
  },
];

/* ---------------------------------- card ---------------------------------- */

function KpiCard({ k }: { k: TacticalKpi }) {
  const [open, setOpen] = useState(false);
  const token = statusStyles[k.status];
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full cursor-pointer px-3.5 py-3 text-left transition-colors duration-150 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11.5px] font-medium text-slate-500">{k.label}</div>
            <div className="mt-0.5 text-[10.5px] italic leading-snug text-slate-500">{k.question}</div>
          </div>
          <StatusChip status={k.status} />
        </div>

        <div className="mt-2 flex items-end justify-between gap-3">
          <div className="text-[19px] font-semibold leading-none text-slate-900">{k.value}</div>
          {k.trend && <div className="w-24 shrink-0"><Sparkline points={k.trend} status={k.status} /></div>}
        </div>
        <div className="mt-1 text-[10.5px] leading-snug text-slate-500">{k.caption}</div>

        {typeof k.bar === "number" && <div className="mt-2"><MetricBar value={k.bar} status={k.status} /></div>}

        <div className={cn("mt-2 text-[10.5px] font-medium", token.text)}>
          {open ? "Hide detail" : "What this means and what to do"}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-200 px-3.5 py-3 text-[11px] leading-snug text-slate-600">
          <p>{k.meaning}</p>
          <dl className="mt-2 space-y-1">
            {k.evidence.map((e) => (
              <div key={e.label} className="flex flex-wrap justify-between gap-x-3 border-b border-dashed border-slate-200 pb-1 last:border-0">
                <dt className="text-slate-500">{e.label}</dt>
                <dd className="font-medium tabular-nums text-slate-800">{e.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 rounded-md bg-slate-50 px-2 py-1.5 text-slate-700">
            <span className="font-semibold">Recommended action: </span>{k.action}
          </p>
        </div>
      )}
    </div>
  );
}

function CardGrid({ items }: { items: TacticalKpi[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((k) => <KpiCard key={k.id} k={k} />)}
    </div>
  );
}

export function BudgetTacticsPanel() {
  return (
    <Panel
      title="Objective health in operational terms"
      subtitle="How fast the allowance is being spent, when it would run out, and how quickly problems are seen and removed."
    >
      <CardGrid items={budgetKpis} />
    </Panel>
  );
}

export function EarlySurveillancePanel() {
  return (
    <Panel
      title="Early surveillance — before the provider announces"
      subtitle="Independent leading indicators from our own telemetry. None of these represent impact to your service today; they describe what is forming underneath it."
      action={
        <span className="rounded-full border border-sky-600/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-800">
          Leading indicators
        </span>
      }
    >
      <CardGrid items={earlySignals} />
      <p className="mt-3 text-[11px] leading-snug text-slate-500">
        A provider condition is only reported as impact to your service once telemetry shows your users experiencing it.
        Until then it is surveillance: watched, quantified and pre-staged for action.
      </p>
    </Panel>
  );
}
