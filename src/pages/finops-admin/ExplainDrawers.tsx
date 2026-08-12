// Explainability drawers for the FinOps administration plane.
//
// Every signature action — Explain Recommendation, Explain Rejection,
// Explain Savings, Explain Attribution — resolves to a drawer specification
// consumed by the shared InspectDrawer, so the interaction model stays
// identical to Context / Evidence Layer, LLM + Model Routing and Agent
// Orchestration.

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { KV, SubHead, Bullets, StatePill, RichTip, type DrawerTab } from "./parts";
import {
  RECOMMENDATIONS, SAVINGS_RECORDS, LIFECYCLE_STATES, TERMINAL_STATES, DEDUPLICATION,
  BASELINE, APPROVAL_POLICY, AUTONOMY_DISPOSITIONS, EXECUTION_GOVERNANCE, IDEMPOTENCY,
  ROLLBACK_READINESS, TECHNICAL_VALIDATION, FINANCIAL_VALIDATION, ANOMALIES, CONFLICTS,
  SYSTEM_ERRORS, POLICY_VERSIONS, AUDIT, EXCEPTION_REASONS, ROLES, UNIT_DETAIL,
  ACCOUNT_DETAIL, CHANNEL_DETAIL, compositeConfidence, compositeRisk, riskClass,
  type Recommendation, type ScoreComponent, type RiskDimension, type LifecycleState,
} from "./engineering";
import { UNIT_ECONOMICS, ACCOUNTS, CHANNELS } from "./data";

export interface DrawerSpec {
  objectType: string; name: string; status?: string;
  statusTone?: "ok" | "warn" | "bad"; tabs: DrawerTab[];
}

/* ------------------------------ small parts ------------------------------- */

function Note({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-[11.5px] leading-relaxed text-slate-600">{children}</p>;
}

function Chain({ steps, active }: { steps: string[]; active?: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-1">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-1">
          <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-medium",
            active !== undefined && i > active
              ? "border-slate-200 bg-slate-50 text-slate-500"
              : "border-blue-200 bg-blue-50 text-blue-800")}>{s}</span>
          {i < steps.length - 1 && <span className="text-[10px] text-slate-400">→</span>}
        </li>
      ))}
    </ol>
  );
}

export function ScoreBars({ components, composite, compositeLabel, tone = "blue" }: {
  components: { label: string; score: number; weight: number; basis: string; threshold?: string }[];
  composite: number; compositeLabel: string; tone?: "blue" | "amber";
}) {
  return (
    <div>
      <ul className="space-y-1.5">
        {components.map((c) => (
          <RichTip key={c.label} as="li" className="block" tip={{
            term: c.label,
            definition: c.basis,
            rows: [["Current value", String(c.score)], ["Weight", `${Math.round(c.weight * 100)}%`],
              ["Threshold", c.threshold ?? "≥ 80 contributes positively"], ["Weighted contribution", (c.score * c.weight).toFixed(1)]],
            why: "Composite scores are only trustworthy when every component and its weight can be inspected.",
          }}>
            <div className="flex items-center gap-2">
              <span className="w-[150px] shrink-0 truncate text-[11.5px] text-slate-600">{c.label}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <span className={cn("block h-full rounded-full", tone === "blue"
                  ? c.score >= 90 ? "bg-emerald-500" : c.score >= 75 ? "bg-blue-500" : "bg-amber-500"
                  : c.score >= 55 ? "bg-red-500" : c.score >= 30 ? "bg-amber-500" : "bg-emerald-500")}
                  style={{ width: `${c.score}%` }} />
              </span>
              <span className="w-8 shrink-0 text-right text-[11.5px] font-medium tabular-nums text-slate-800">{c.score}</span>
              <span className="w-9 shrink-0 text-right text-[10.5px] tabular-nums text-slate-400">{Math.round(c.weight * 100)}%</span>
            </div>
          </RichTip>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5">
        <span className="text-[11.5px] font-medium text-slate-700">{compositeLabel}</span>
        <span className="text-[13px] font-semibold tabular-nums text-slate-900">{composite}</span>
      </div>
      <Note>Weights are configured tenant policy and are shown alongside every component. The platform never displays an unexplained confidence or risk number.</Note>
    </div>
  );
}

function LifecycleTimeline({ rec }: { rec: Recommendation }) {
  const reached = new Map(rec.history.map((h) => [h.state, h]));
  const terminal = rec.history.find((h) => (TERMINAL_STATES as readonly string[]).includes(h.state));
  const states: LifecycleState[] = [...LIFECYCLE_STATES];
  return (
    <div>
      <ol className="space-y-1">
        {states.map((s) => {
          const hit = reached.get(s);
          return (
            <li key={s}>
              <RichTip as="div" tip={{
                term: s,
                definition: hit ? `Entered ${hit.at}.` : "Not yet reached for this recommendation.",
                rows: hit ? [["Timestamp", hit.at], ["Actor", hit.actor]] : [["State", "Pending"]],
                why: hit?.evidence ?? "Each lifecycle transition records the actor and the evidence that justified it.",
              }}>
                <div className={cn("flex items-start gap-2 rounded border px-2 py-1",
                  hit ? "border-blue-200 bg-blue-50/50" : "border-slate-200 bg-white")}>
                  <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", hit ? "bg-blue-600" : "bg-slate-300")} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11.5px] font-medium text-slate-800">{s}</span>
                    {hit && <span className="block text-[10.5px] text-slate-500">{hit.at} · {hit.actor}</span>}
                    {hit && <span className="mt-0.5 block text-[10.5px] leading-relaxed text-slate-600">{hit.evidence}</span>}
                  </span>
                </div>
              </RichTip>
            </li>
          );
        })}
        {terminal && (
          <li className="rounded border border-red-200 bg-red-50/60 px-2 py-1">
            <span className="block text-[11.5px] font-medium text-red-800">{terminal.state}</span>
            <span className="block text-[10.5px] text-red-700">{terminal.at} · {terminal.actor}</span>
            <span className="mt-0.5 block text-[10.5px] leading-relaxed text-red-700">{terminal.evidence}</span>
          </li>
        )}
      </ol>
      <Note>Click any state to inspect its timestamp, actor and supporting evidence.</Note>
    </div>
  );
}

function EvidenceTable({ rec }: { rec: Recommendation }) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full border-collapse text-[11.5px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] uppercase tracking-wide text-slate-500">
            <th className="px-2 py-1.5 font-medium">Evidence class</th>
            <th className="px-2 py-1.5 font-medium">Source</th>
            <th className="px-2 py-1.5 font-medium">Freshness</th>
            <th className="px-2 py-1.5 font-medium">Quality</th>
          </tr>
        </thead>
        <tbody>
          {rec.evidence.map((e) => (
            <RichTip key={e.klass} as="tr" className="border-b border-slate-100 last:border-0 transition-colors hover:bg-blue-50/40"
              tip={{
                term: e.klass, definition: e.detail,
                rows: [["Source", e.source], ["Timestamp", e.timestamp], ["Freshness", e.freshness], ["Quality", e.quality]],
                why: "A recommendation is only as defensible as the evidence class with the weakest freshness and quality.",
              }}>
              <td className="px-2 py-1 font-medium text-slate-800">{e.klass}</td>
              <td className="px-2 text-slate-600">{e.source}</td>
              <td className="px-2 text-slate-600">{e.freshness}</td>
              <td className="px-2">
                <StatePill tone={e.quality === "Complete" ? "ok" : e.quality === "Partial" ? "warn" : "bad"} label={e.quality} />
              </td>
            </RichTip>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CandidateTable({ rec }: { rec: Recommendation }) {
  return (
    <ul className="space-y-1.5">
      {rec.candidates.map((c) => (
        <li key={c.option} className={cn("rounded-md border px-2.5 py-1.5",
          c.selected ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-white")}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[12px] font-medium text-slate-900">{c.option}</span>
            <span className="text-[11.5px] tabular-nums text-slate-700">{c.savings} · {c.risk} risk</span>
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{c.verdict}</p>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------ recommendation drawer --------------------------- */

function recommendationSpec(rec: Recommendation): DrawerSpec {
  const conf = compositeConfidence(rec.confidenceComponents);
  const risk = compositeRisk(rec.riskDimensions);
  const svg = SAVINGS_RECORDS.find((s) => s.id === rec.savingsRecordId);

  const tabs: DrawerTab[] = [
    { id: "summary", label: "Summary", content: (
      <div>
        <p className="text-[12px] leading-relaxed text-slate-700"><span className="font-semibold">Objective. </span>{rec.objective}</p>
        <SubHead>Decision sequence</SubHead>
        <Chain steps={["Evidence", "Analysis", "Candidate Actions", "Risk", "Policy", "Recommendation"]} />
        <SubHead>Summary</SubHead>
        <KV rows={[
          ["Resource", rec.resource], ["Application", rec.application], ["Owner", rec.owner],
          ["Environment", rec.environment], ["Current configuration", rec.current],
          ["Recommended configuration", rec.recommended],
          ["Potential savings", `$${rec.savingsMonthly.toLocaleString()} / month`],
          ["Confidence", `${conf} / 100`], ["Risk", `${risk} / 100 (${riskClass(risk)})`],
          ["Autonomy disposition", rec.autonomy],
          ["Lifecycle state", rec.state],
        ]} />
        <SubHead>Detected condition</SubHead>
        <p className="text-[11.5px] leading-relaxed text-slate-700">{rec.condition}</p>
      </div>) },

    { id: "evidence", label: "Evidence", content: (
      <div>
        <p className="text-[12px] leading-relaxed text-slate-700">
          {rec.evidence.length} evidence classes were examined. Each carries a source, timestamp, freshness and quality assessment;
          a class marked Missing blocks any reduction that depends on it.
        </p>
        <SubHead>Evidence examined</SubHead>
        <EvidenceTable rec={rec} />
      </div>) },

    { id: "reasoning", label: "Reasoning", content: (
      <div>
        <SubHead>Detected condition</SubHead>
        <p className="text-[11.5px] leading-relaxed text-slate-700">{rec.condition}</p>
        <SubHead>Analysis</SubHead>
        <KV rows={rec.analysis} />
        <SubHead>Candidate actions</SubHead>
        <CandidateTable rec={rec} />
        <SubHead>Selected recommendation</SubHead>
        <p className="text-[11.5px] leading-relaxed text-slate-700">{rec.selectionReason}</p>
        <SubHead>Policy constraints in force</SubHead>
        <Bullets items={[
          "Utilization headroom: target must retain the configured safety buffer above predicted need.",
          "SLO guard: no reduction while the error budget for the period is negative.",
          `Risk ceiling: composite risk must remain at or below 55 (current ${risk}).`,
          `Confidence threshold: composite confidence must reach 88 (current ${conf}).`,
          "Minimum savings: $250 per month.",
        ]} />
      </div>) },

    { id: "confidence", label: "Confidence", content: (
      <div>
        <p className="text-[12px] leading-relaxed text-slate-700">
          Confidence expresses how well the identified optimization and its projected outcome are supported by current technical and
          financial evidence. It is a weighted composite, never an opaque model output.
        </p>
        <SubHead>Components and configured weighting</SubHead>
        <ScoreBars components={rec.confidenceComponents} composite={conf} compositeLabel="Composite confidence" />
      </div>) },

    { id: "risk", label: "Risk", content: (
      <div>
        <p className="text-[12px] leading-relaxed text-slate-700">
          Risk is scored separately from confidence. A recommendation can be highly confident and still be too risky to execute
          autonomously; the two numbers answer different questions.
        </p>
        <SubHead>Execution risk dimensions</SubHead>
        <ScoreBars tone="amber" components={rec.riskDimensions.map((d) => ({ ...d }))}
          composite={risk} compositeLabel={`Composite risk — ${riskClass(risk)}`} />
      </div>) },

    { id: "savings", label: "Savings", content: (
      <div>
        <p className="text-[12px] leading-relaxed text-slate-700">
          Savings move through distinct financial states. Projected savings are never reported as realized savings.
        </p>
        <SubHead>Savings lifecycle</SubHead>
        <KV rows={[
          ["Gross opportunity", svg?.gross ?? `$${Math.round(rec.savingsMonthly * 1.19).toLocaleString()}/month`],
          ["Policy eligible", svg?.policyEligible ?? `$${rec.savingsMonthly.toLocaleString()}/month`],
          ["Risk adjusted", svg?.riskAdjusted ?? "Pending"],
          ["Approved", svg?.approved ?? "Pending approval"],
          ["Executed", svg?.executed ?? "Not executed"],
          ["Technically validated", svg?.technicallyValidated ?? "Not validated"],
          ["Financially validated", svg?.financiallyValidated ?? "Not validated"],
          ["Realized", svg?.realized ?? "$0 — not realized"],
        ]} />
        {svg && <Note>Full provenance is available through Explain Savings on record {svg.id}.</Note>}
      </div>) },

    { id: "policy", label: "Policy", content: (
      <div>
        <SubHead>Autonomy disposition</SubHead>
        <KV rows={[["Current disposition", rec.autonomy],
          ["Meaning", AUTONOMY_DISPOSITIONS.find((a) => a.label === rec.autonomy)?.detail ?? "—"],
          ["Approval required", rec.approvalRequired ? "Yes" : "No"], ["Reason", rec.approvalReason]]} />
        <SubHead>Policy families evaluated</SubHead>
        <Bullets items={[
          "Detection — Resource Rightsizing v11 (active)",
          "Evidence Requirements v4",
          "Execution Risk Policy v3",
          "Production FinOps Change Approval v7",
          "Execution Governance v4 (channel, plan hash, idempotency)",
          "FinOps Savings Validation v6",
        ]} />
      </div>) },

    { id: "approval", label: "Approval", content: (
      <div>
        <SubHead>Routing</SubHead>
        <KV rows={[["Policy", `${APPROVAL_POLICY.name} ${APPROVAL_POLICY.version}`],
          ["Required approvers", APPROVAL_POLICY.approvers.join(", ")],
          ["Conditional approvers", APPROVAL_POLICY.conditional.map((c) => `${c.role} (${c.when})`).join("; ")],
          ["SLA", APPROVAL_POLICY.sla]]} />
        <SubHead>Decisions available</SubHead>
        <Bullets items={APPROVAL_POLICY.decisions} />
        <SubHead>Captured with every decision</SubHead>
        <Bullets items={APPROVAL_POLICY.captured} />
      </div>) },

    { id: "execution", label: "Execution", content: (
      <div>
        <SubHead>Governed execution</SubHead>
        <KV rows={EXECUTION_GOVERNANCE.fields} />
        <SubHead>Allowed operations</SubHead>
        <Bullets items={EXECUTION_GOVERNANCE.allowed} />
        <SubHead>Blocked operations</SubHead>
        <Bullets items={EXECUTION_GOVERNANCE.blocked} />
        <SubHead>Idempotency</SubHead>
        <KV rows={[["Key", IDEMPOTENCY.key], ["Formula", IDEMPOTENCY.keyFormula], ["Execution lock", IDEMPOTENCY.lock],
          ["Duplicate detection window", IDEMPOTENCY.duplicateWindow], ["Replay policy", IDEMPOTENCY.replay],
          ["Correlation ID", IDEMPOTENCY.correlationId]]} />
        <Note>{IDEMPOTENCY.why}</Note>
        <SubHead>Rollback readiness</SubHead>
        <KV rows={[["Rollback required", ROLLBACK_READINESS.required ? "Yes" : "No"], ["Method", ROLLBACK_READINESS.method],
          ["Evidence", ROLLBACK_READINESS.evidence], ["Validation", ROLLBACK_READINESS.validation],
          ["Maximum rollback time", ROLLBACK_READINESS.maxTime], ["Owner", ROLLBACK_READINESS.owner],
          ["Status", ROLLBACK_READINESS.status]]} />
        <Note>{EXECUTION_GOVERNANCE.note}</Note>
      </div>) },

    { id: "validation", label: "Validation", content: (
      <div>
        <SubHead>Technical validation — {TECHNICAL_VALIDATION.result}</SubHead>
        <KV rows={TECHNICAL_VALIDATION.checks} />
        <Note>Performance variance {TECHNICAL_VALIDATION.variance} against an allowed {TECHNICAL_VALIDATION.allowed}. Rollback: {TECHNICAL_VALIDATION.rollback}.</Note>
        <SubHead>Financial validation — {FINANCIAL_VALIDATION.state}</SubHead>
        <KV rows={FINANCIAL_VALIDATION.checks} />
      </div>) },

    { id: "history", label: "History", content: <LifecycleTimeline rec={rec} /> },
  ];

  if (rec.rejection) {
    tabs.splice(1, 0, {
      id: "rejection", label: "Why Not", content: (
        <div>
          <StatePill tone="bad" label={`Rejected — ${rec.rejection.reason}`} />
          <SubHead>Evidence gap</SubHead>
          <p className="text-[11.5px] leading-relaxed text-slate-700">{rec.rejection.gap}</p>
          <SubHead>Affected policy</SubHead>
          <p className="text-[11.5px] leading-relaxed text-slate-700">{rec.rejection.policy}</p>
          <SubHead>Recommended corrective action</SubHead>
          <p className="text-[11.5px] leading-relaxed text-slate-700">{rec.rejection.corrective}</p>
          <Note>Choosing not to optimize is a governed outcome and is recorded with the same rigour as an approved change.</Note>
        </div>),
    });
  }

  return {
    objectType: `Recommendation · ${rec.id}`,
    name: `${rec.current} → ${rec.recommended}`,
    status: rec.state,
    statusTone: rec.state === "Rejected" ? "bad" : rec.state === "Realized" || rec.state === "Executed" ? "ok" : "warn",
    tabs,
  };
}

/* ---------------------------- savings drawer ------------------------------ */

function savingsSpec(id: string): DrawerSpec | null {
  const s = SAVINGS_RECORDS.find((r) => r.id === id);
  if (!s) return null;
  return {
    objectType: `Savings Record · ${s.id}`, name: `${s.application} — ${s.resource}`,
    status: s.state, statusTone: s.state === "Realized" ? "ok" : "warn",
    tabs: [
      { id: "prov", label: "Provenance", content: (
        <div>
          <SubHead>Provenance chain</SubHead>
          <Chain steps={["Recommendation", "Approval", "Execution", "Technical Validation", "Financial Validation", "Realized Savings"]} />
          <SubHead>Record</SubHead>
          <KV rows={[["Recommendation", s.recommendationId], ["Resource", s.resource], ["Application", s.application],
            ["Original configuration", s.originalConfig], ["Recommended configuration", s.recommendedConfig],
            ["Execution date", s.executionDate], ["Change record", s.changeId], ["Execution channel", s.channel],
            ["Validation period", s.validationPeriod], ["Validation policy", s.validationPolicy]]} />
        </div>) },
      { id: "states", label: "Savings States", content: (
        <div>
          <KV rows={[["Gross opportunity", s.gross], ["Policy eligible", s.policyEligible], ["Risk adjusted", s.riskAdjusted],
            ["Approved", s.approved], ["Executed", s.executed], ["Technically validated", s.technicallyValidated],
            ["Financially validated", s.financiallyValidated], ["Realized", s.realized]]} />
          <Note>These states are never collapsed into a single savings number. Only the realized figure is reported to Finance.</Note>
        </div>) },
      { id: "obs", label: "Observed", content: (
        <div>
          <KV rows={[["Projected savings", s.riskAdjusted], ["Observed savings", s.observed],
            ["Demand-normalized savings", s.normalized], ["Realized savings", s.realized],
            ["Projection variance", s.variance]]} />
          {s.exception && (
            <>
              <SubHead>{s.exception.title}</SubHead>
              <KV rows={[["Projected", s.exception.projected], ["Observed", s.exception.observed],
                ["Business demand", s.exception.driver], ["Normalized", s.exception.normalized], ["Status", s.exception.status]]} />
              <Note>Raw observed cost understated the benefit because demand grew inside the validation window. Normalization by the governed demand driver isolates the effect of the change.</Note>
            </>
          )}
        </div>) },
      { id: "tech", label: "Technical", content: (
        <div>
          <KV rows={[["Technical validation", s.technicalValidation], ["Performance regression", s.performanceRegression],
            ["SLO", s.slo], ["Rollback", s.rollback]]} />
          <SubHead>Checks performed</SubHead>
          <KV rows={TECHNICAL_VALIDATION.checks} />
        </div>) },
      { id: "fin", label: "Financial", content: (
        <div>
          <KV rows={FINANCIAL_VALIDATION.checks} />
          <SubHead>Baseline in force</SubHead>
          <KV rows={BASELINE.fields} />
        </div>) },
      { id: "ev", label: "Evidence", content: <div><SubHead>Evidence relied upon</SubHead><Bullets items={s.evidence} /></div> },
    ],
  };
}

/* ------------------------------ other drawers ----------------------------- */

export function buildEngineeringDrawer(key: string): DrawerSpec | null {
  if (!key || key === "none") return null;
  const [kind, id] = key.split(":");

  if (kind === "rec") {
    const rec = RECOMMENDATIONS.find((r) => r.id === id) ?? RECOMMENDATIONS.find((r) => r.opportunityId === id);
    return rec ? recommendationSpec(rec) : null;
  }

  if (kind === "svg") return savingsSpec(id);

  if (kind === "dedup") {
    return {
      objectType: "Savings Attribution", name: "Overlapping savings detected", status: "Adjusted", statusTone: "warn",
      tabs: [
        { id: "o", label: "Attribution", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">Scope: {DEDUPLICATION.scope}</p>
            <SubHead>Claims</SubHead>
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="w-full border-collapse text-[11.5px]">
                <thead><tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-1.5 font-medium">Recommendation</th><th className="px-2 py-1.5 font-medium">Type</th>
                  <th className="px-2 py-1.5 font-medium">Claimed</th><th className="px-2 py-1.5 font-medium">Attribution</th>
                  <th className="px-2 py-1.5 font-medium">Incremental</th></tr></thead>
                <tbody>{DEDUPLICATION.overlapping.map((o) => (
                  <tr key={o.rec} className="border-b border-slate-100 last:border-0">
                    <td className="px-2 py-1 font-medium text-slate-800">{o.rec}</td>
                    <td className="px-2 text-slate-600">{o.type}</td>
                    <td className="px-2 tabular-nums text-slate-700">{o.claimed}</td>
                    <td className="px-2"><StatePill tone={o.attribution === "Primary" ? "ok" : "muted"} label={o.attribution} /></td>
                    <td className="px-2 font-medium tabular-nums text-slate-900">{o.incremental}</td>
                  </tr>))}</tbody>
              </table>
            </div>
            <SubHead>Totals</SubHead>
            <KV rows={[["Naive sum (never published)", DEDUPLICATION.naive], ["Overlap removed", DEDUPLICATION.overlap], ["Adjusted total", DEDUPLICATION.adjusted]]} />
          </div>) },
        { id: "r", label: "Rule", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">{DEDUPLICATION.rule}</p>
            <SubHead>How attribution is resolved</SubHead>
            <Bullets items={DEDUPLICATION.explanation} />
          </div>) },
      ],
    };
  }

  if (kind === "baseline") {
    return {
      objectType: "Savings Baseline", name: BASELINE.name, status: "Active", statusTone: "ok",
      tabs: [
        { id: "o", label: "Configuration", content: <div><p className="text-[12px] leading-relaxed text-slate-700">{BASELINE.summary}</p><SubHead>Baseline rules</SubHead><KV rows={BASELINE.fields} /></div> },
        { id: "e", label: "Exceptions", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">Validation exceptions are expected in a real estate. Each has a defined treatment rather than a silent write-off.</p>
            {EXCEPTION_REASONS.map((e) => (
              <div key={e.reason} className="mt-2 rounded-md border border-slate-200 px-2.5 py-1.5">
                <div className="text-[11.5px] font-medium text-slate-900">{e.reason}</div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{e.detail}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-blue-800">Treatment: {e.action}</p>
              </div>))}
          </div>) },
      ],
    };
  }

  if (kind === "approvalpolicy") {
    return {
      objectType: "Approval Policy", name: APPROVAL_POLICY.name, status: APPROVAL_POLICY.version, statusTone: "ok",
      tabs: [
        { id: "o", label: "Requirement", content: (
          <div>
            <SubHead>Approval required when</SubHead>
            <Bullets items={APPROVAL_POLICY.requiredWhen} />
            <SubHead>Approvers</SubHead>
            <Bullets items={APPROVAL_POLICY.approvers} />
            <SubHead>Conditional approvers</SubHead>
            <Bullets items={APPROVAL_POLICY.conditional.map((c) => `${c.role} — ${c.when}`)} />
          </div>) },
        { id: "d", label: "Decisions", content: <div><SubHead>Available decisions</SubHead><Bullets items={APPROVAL_POLICY.decisions} /><SubHead>Captured with each decision</SubHead><Bullets items={APPROVAL_POLICY.captured} /><Note>{APPROVAL_POLICY.sla}</Note></div> },
        { id: "q", label: "Queue", content: (
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full border-collapse text-[11.5px]">
              <thead><tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] uppercase tracking-wide text-slate-500">
                <th className="px-2 py-1.5 font-medium">Recommendation</th><th className="px-2 py-1.5 font-medium">Approver</th>
                <th className="px-2 py-1.5 font-medium">State</th><th className="px-2 py-1.5 font-medium">Age</th>
                <th className="px-2 py-1.5 font-medium">Value</th></tr></thead>
              <tbody>{APPROVAL_POLICY.queue.map((qr, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  <td className="px-2 py-1 font-medium text-slate-800">{qr.rec}</td>
                  <td className="px-2 text-slate-600">{qr.approver}</td>
                  <td className="px-2"><StatePill tone={qr.state === "Approved" ? "ok" : qr.state === "Blocked" ? "bad" : "warn"} label={qr.state} /></td>
                  <td className="px-2 text-slate-600">{qr.age}</td>
                  <td className="px-2 tabular-nums text-slate-800">{qr.value}</td>
                </tr>))}</tbody>
            </table>
          </div>) },
      ],
    };
  }

  if (kind === "autonomy") {
    return {
      objectType: "Autonomy Policy", name: "Execution autonomy dispositions", status: "6 dispositions", statusTone: "ok",
      tabs: [{ id: "o", label: "Dispositions", content: (
        <div>
          <p className="text-[12px] leading-relaxed text-slate-700">Every recommendation carries exactly one disposition, and it is visible wherever the recommendation appears.</p>
          {AUTONOMY_DISPOSITIONS.map((a) => (
            <div key={a.id} className="mt-2 rounded-md border border-slate-200 px-2.5 py-1.5">
              <div className="text-[11.5px] font-semibold text-slate-900">{a.label}</div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{a.detail}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">Example: {a.example}</p>
            </div>))}
        </div>) }],
    };
  }

  if (kind === "idem") {
    return {
      objectType: "Execution Control", name: "Idempotency & replay protection", status: "Enforced", statusTone: "ok",
      tabs: [{ id: "o", label: "Controls", content: (
        <div>
          <KV rows={[["Idempotency key", IDEMPOTENCY.key], ["Key formula", IDEMPOTENCY.keyFormula], ["Execution lock", IDEMPOTENCY.lock],
            ["Duplicate detection window", IDEMPOTENCY.duplicateWindow], ["Replay policy", IDEMPOTENCY.replay], ["Correlation ID", IDEMPOTENCY.correlationId]]} />
          <SubHead>Why retry cannot blindly repeat a cloud modification</SubHead>
          <p className="text-[11.5px] leading-relaxed text-slate-700">{IDEMPOTENCY.why}</p>
        </div>) }],
    };
  }

  if (kind === "anom") {
    const a = ANOMALIES.find((x) => x.id === id);
    if (!a) return null;
    return {
      objectType: `Cost Anomaly · ${a.id}`, name: `${a.type} — ${a.scope}`, status: a.classification,
      statusTone: a.classification.startsWith("Actionable") ? "warn" : "ok",
      tabs: [
        { id: "o", label: "Observation", content: (
          <div>
            <KV rows={[["Observed", a.observed], ["Expected", a.expected], ["Variance", a.variance], ["Confidence", `${a.confidence} / 100`], ["Classification", a.classification]]} />
            <Note>An anomaly is a deviation from expectation, not automatically waste. Classification requires owner confirmation or a matching change record.</Note>
          </div>) },
        { id: "d", label: "Drivers", content: <div><SubHead>Likely drivers</SubHead><Bullets items={a.drivers} /><SubHead>Affected applications</SubHead><Bullets items={a.applications} /><SubHead>Related changes</SubHead><Bullets items={a.changes} /></div> },
        { id: "e", label: "Evidence", content: <div><Bullets items={a.evidence} /></div> },
        { id: "i", label: "Investigation", content: <div><SubHead>Recommended investigation</SubHead><Bullets items={a.investigation} /></div> },
      ],
    };
  }

  if (kind === "conflict") {
    const c = CONFLICTS.find((x) => x.id === id);
    if (!c) return null;
    return {
      objectType: "Policy Conflict", name: c.object, status: c.severity === "bad" ? "Blocking" : "Warning",
      statusTone: c.severity, tabs: [{ id: "o", label: "Conflict", content: (
        <div>
          <SubHead>Conflict</SubHead>
          <p className="text-[11.5px] leading-relaxed text-slate-700">{c.conflict}</p>
          <SubHead>Impact</SubHead>
          <p className="text-[11.5px] leading-relaxed text-slate-700">{c.impact}</p>
          <SubHead>Resolution</SubHead>
          <p className="text-[11.5px] leading-relaxed text-slate-700">
            Open the affected policy, add the missing control and republish as a new version. Execution remains blocked in this scope
            until the conflict clears.
          </p>
        </div>) }],
    };
  }

  if (kind === "errors") {
    return {
      objectType: "Platform Health", name: "Error and degradation states", status: `${SYSTEM_ERRORS.filter((e) => e.state === "Active").length} active`, statusTone: "warn",
      tabs: [{ id: "o", label: "States", content: (
        <div className="space-y-1.5">
          {SYSTEM_ERRORS.map((e) => (
            <div key={e.id} className="rounded-md border border-slate-200 px-2.5 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11.5px] font-medium text-slate-900">{e.label}</span>
                <StatePill tone={e.state === "Active" ? "warn" : "ok"} label={e.state} />
              </div>
              <p className="mt-0.5 text-[11px] text-slate-600">{e.scope} — {e.detail}</p>
            </div>))}
        </div>) }],
    };
  }

  if (kind === "versions") {
    return {
      objectType: "Policy Versioning", name: "Resource Rightsizing", status: "v11 active · v12 draft", statusTone: "warn",
      tabs: [
        { id: "o", label: "Versions", content: (
          <div className="space-y-1.5">
            {POLICY_VERSIONS.map((v) => (
              <div key={v.version} className="rounded-md border border-slate-200 px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-slate-900">{v.version}</span>
                  <StatePill tone={v.state === "Active" ? "ok" : v.state === "Draft" ? "warn" : "muted"} label={v.state} />
                </div>
                <div className="text-[10.5px] text-slate-500">Published {v.published} · {v.author}</div>
                <ul className="mt-1 space-y-0.5">
                  {v.changes.map((c) => (
                    <li key={c.field} className="text-[11px] text-slate-700">
                      <span className="font-medium">{c.field}: </span>
                      <span className="text-slate-500 line-through">{c.from}</span> → <span className="text-slate-900">{c.to}</span>
                    </li>))}
                </ul>
              </div>))}
          </div>) },
        { id: "a", label: "Actions", content: (
          <div>
            <SubHead>Version operations</SubHead>
            <Bullets items={[
              "Compare — field-level difference between any two versions.",
              "Clone — create a draft from an existing version.",
              "Promote — publish a draft as the active version after review.",
              "Rollback — restore the previous version and record the reason.",
              "Deprecate — retire a version and block new evaluation against it.",
            ]} />
            <Note>Publishing a version is an audited event and records the actor, prior value, new value and reason.</Note>
          </div>) },
      ],
    };
  }

  if (kind === "audit") {
    return {
      objectType: "Audit", name: "Tenant FinOps audit trail", status: `${AUDIT.length} recent events`, statusTone: "ok",
      tabs: [{ id: "o", label: "Events", content: (
        <div className="space-y-1.5">
          {AUDIT.map((a, i) => (
            <RichTip key={i} as="div" tip={{
              term: a.action, definition: a.reason,
              rows: [["Actor", a.actor], ["Object", a.object], ["Policy version", a.policyVersion], ["Old value", a.oldValue], ["New value", a.newValue], ["Ticket", a.ticket]],
              why: "Every material change to a recommendation, policy, baseline or savings record is attributable.",
            }}>
              <div className="rounded-md border border-slate-200 px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-medium text-slate-900">{a.action}</span>
                  <span className="text-[10.5px] tabular-nums text-slate-500">{a.at}</span>
                </div>
                <div className="text-[10.5px] text-slate-600">{a.actor} · {a.object} · {a.policyVersion}</div>
                <div className="mt-0.5 text-[10.5px] text-slate-700">
                  <span className="text-slate-500 line-through">{a.oldValue}</span> → <span className="font-medium">{a.newValue}</span> · {a.ticket}
                </div>
              </div>
            </RichTip>))}
        </div>) }],
    };
  }

  if (kind === "roles") {
    return {
      objectType: "Access Control", name: "Role-based permissions", status: `${ROLES.length} roles`, statusTone: "ok",
      tabs: [{ id: "o", label: "Roles", content: (
        <div className="space-y-1.5">
          {ROLES.map((r) => (
            <div key={r.id} className="rounded-md border border-slate-200 px-2.5 py-1.5">
              <div className="text-[11.5px] font-semibold text-slate-900">{r.label}</div>
              <p className="mt-0.5 text-[11px] text-slate-600">{r.note}</p>
              <p className="mt-0.5 text-[10.5px] text-slate-500">Capabilities: {r.caps.length ? r.caps.join(", ") : "read only"}</p>
            </div>))}
          <Note>Actions unavailable to the acting role remain visible but disabled, and state why they are unavailable on hover.</Note>
        </div>) }],
    };
  }

  /* ---------------- enriched versions of existing objects ---------------- */

  if (kind === "unit") {
    const u = UNIT_ECONOMICS.find((x) => x.id === id);
    const d = UNIT_DETAIL[id];
    if (!u || !d) return null;
    return {
      objectType: "Unit Economics Model", name: u.service, status: `${u.costPerUnit} per ${u.unit}`, statusTone: "ok",
      tabs: [
        { id: "o", label: "Overview", content: (
          <div>
            <KV rows={[["Application", u.service], ["Spend", u.spend], ["Allocation", `${u.coverage}%`], ["Unit", u.unit],
              ["Monthly volume", d.volume], ["Cost / unit", u.costPerUnit], ["Previous", d.previous], ["Variance", d.variance], ["Owner", u.owner]]} />
            <SubHead>Breakdown</SubHead>
            <KV rows={d.breakdown} />
          </div>) },
        { id: "t", label: "Trends", content: (
          <div>
            <SubHead>Cost trend ($M / month)</SubHead><Spark values={d.costTrend} />
            <SubHead>Volume trend</SubHead><Spark values={d.volumeTrend} />
            <SubHead>Unit-cost trend</SubHead><Spark values={d.unitTrend} tone="emerald" />
            <Note>Optimization contribution over the period: unit cost fell while volume grew, so the improvement is efficiency rather than reduced demand.</Note>
          </div>) },
        { id: "d", label: "Cost Drivers", content: <div><SubHead>Top cost drivers</SubHead><Bullets items={d.drivers} /></div> },
        { id: "r", label: "Recommendations", content: (
          <div>
            <SubHead>Open opportunities</SubHead>
            {d.openOpportunities.length === 0
              ? <p className="text-[11.5px] text-slate-600">No open opportunity for this application. Unit cost is inside tolerance and no detection rule has fired.</p>
              : <KV rows={d.openOpportunities.map((o) => [`${o.id} · ${o.type}`, o.savings] as [string, string])} />}
          </div>) },
        { id: "a", label: "Allocation", content: (
          <div>
            <KV rows={[["Allocation coverage", `${u.coverage}%`], ["Method", "Tag-based with declared shared-cost drivers"],
              ["Unit model", `${u.unit} (governed demand driver)`], ["Model owner", u.owner], ["Last change", "2026-07-02 — allocated by bound policies"]]} />
            <Note>Changing the unit model is an audited action available to Technology Finance and FinOps Admin.</Note>
          </div>) },
      ],
    };
  }

  if (kind === "acc") {
    const a = ACCOUNTS.find((x) => x.id === id);
    const d = ACCOUNT_DETAIL[id];
    if (!a || !d) return null;
    return {
      objectType: "Cloud Account Group", name: a.provider, status: a.status, statusTone: a.status === "Healthy" ? "ok" : "warn",
      tabs: [
        { id: "o", label: "Overview", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">{a.note}</p>
            <SubHead>Summary</SubHead>
            <KV rows={[["Accounts", a.accounts], ["Status", a.status], ["Spend coverage", `${a.spendCoverage}%`],
              ["Allocation coverage", `${a.allocationCoverage}%`], ["Telemetry", a.telemetry], ["Monthly spend", a.spend]]} />
            <SubHead>Linked accounts</SubHead><Bullets items={d.linkedAccounts} />
            <SubHead>Regions</SubHead><Bullets items={d.regions} />
          </div>) },
        { id: "b", label: "Billing", content: <div><KV rows={d.billing} /></div> },
        { id: "t", label: "Telemetry", content: <div><KV rows={d.telemetry} /></div> },
        { id: "al", label: "Allocation", content: <div><KV rows={d.allocation} /></div> },
        { id: "p", label: "Permissions", content: <div><KV rows={d.permissions} /><Note>Credential material is referenced, never rendered. No secret is retrievable through this interface.</Note></div> },
        { id: "h", label: "Health", content: <div><KV rows={d.health} /><SubHead>Exceptions</SubHead><Bullets items={d.exceptions} /></div> },
        { id: "u", label: "Usage", content: <div><KV rows={d.usage} /></div> },
        { id: "hist", label: "History", content: <div className="space-y-1.5">{AUDIT.slice(0, 5).map((e, i) => (
          <div key={i} className="rounded-md border border-slate-200 px-2.5 py-1.5">
            <div className="text-[11.5px] font-medium text-slate-900">{e.action}</div>
            <div className="text-[10.5px] text-slate-500">{e.at} · {e.actor} · {e.object}</div>
          </div>))}</div> },
      ],
    };
  }

  if (kind === "ch") {
    const c = CHANNELS.find((x) => x.id === id);
    const d = CHANNEL_DETAIL[id];
    if (!c || !d) return null;
    return {
      objectType: "Execution Channel", name: c.system, status: c.health, statusTone: c.health === "Healthy" ? "ok" : "warn",
      tabs: [
        { id: "o", label: "Binding", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">{c.note}</p>
            <KV rows={[["Binding ID", d.bindingId], ["Invocation mode", c.mode], ["Authentication reference", d.authRef],
              ["Environment", d.environment], ["Approval policy", d.approvalPolicy], ["Risk policy", d.riskPolicy],
              ["Rollback requirement", d.rollback], ["Health", c.health], ["Last policy sync", c.lastSync]]} />
          </div>) },
        { id: "ops", label: "Operations", content: (
          <div>
            <SubHead>Allowed operations</SubHead><Bullets items={c.operations} />
            <SubHead>Blocked operations</SubHead><Bullets items={EXECUTION_GOVERNANCE.blocked} />
            <Note>{EXECUTION_GOVERNANCE.note}</Note>
          </div>) },
        { id: "w", label: "Workflows", content: <div><SubHead>Current workflows</SubHead><Bullets items={d.workflows} /></div> },
        { id: "a", label: "Audit History", content: <div><KV rows={d.audit} /></div> },
      ],
    };
  }

  return null;
}

/* --------------------------------- spark ---------------------------------- */

function Spark({ values, tone = "blue" }: { values: number[]; tone?: "blue" | "emerald" }) {
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  return (
    <div className="flex h-14 items-end gap-1 rounded-md border border-slate-200 bg-slate-50/60 p-2">
      {values.map((v, i) => (
        <RichTip key={i} as="div" className="flex-1"
          tip={{ term: `Period ${i + 1}`, definition: "Observed value for this period.", rows: [["Value", String(v)], ["Change vs first period", `${(((v - values[0]) / values[0]) * 100).toFixed(1)}%`]] }}>
          <div className={cn("w-full rounded-t", tone === "blue" ? "bg-blue-400" : "bg-emerald-500")}
            style={{ height: `${12 + ((v - min) / range) * 32}px` }} />
        </RichTip>
      ))}
    </div>
  );
}
