/**
 * AIM-003 — Selected Link Prediction summary.
 *
 * Reads the live prediction (baseline or What-If) for the selected Chennai
 * link and exposes the primary operational controls.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ChennaiLink } from "./chennaiFixtures";
import { CHENNAI_MODEL_VERSION } from "./chennaiFixtures";
import type { ChennaiPrediction } from "./chennaiModel";

export interface SelectedLinkSummaryProps {
  link: ChennaiLink | undefined;
  prediction: ChennaiPrediction | null;
  whatIfActive: boolean;
  onViewEvidence: () => void;
  onRunWhatIf: () => void;
  onOpenDetail: () => void;
  onCompareSimilar: () => void;
  onSelectNextRisk: () => void;
  onResetSelection: () => void;
}

function Badge({ tone, children }: { tone: "critical" | "warning" | "positive" | "neutral"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
        tone === "critical" && "border-rose-200 bg-rose-50 text-rose-700",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
        tone === "positive" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "neutral" && "border-slate-200 bg-slate-50 text-slate-700",
      )}
    >
      {children}
    </span>
  );
}

function Metric({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "critical" | "warning" | "positive" }) {
  return (
    <div className="rounded border border-slate-200 bg-white px-2 py-1">
      <dt className="text-[9.5px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd
        className={cn(
          "text-[12px] font-semibold text-slate-900",
          tone === "critical" && "text-rose-700",
          tone === "warning" && "text-amber-700",
          tone === "positive" && "text-emerald-700",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

const ACTION_BUTTON =
  "rounded-md border border-slate-200 bg-white px-2 py-1 text-[10.5px] font-medium text-slate-700 shadow-sm " +
  "hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

export function SelectedLinkSummary({
  link, prediction, whatIfActive, onViewEvidence, onRunWhatIf, onOpenDetail,
  onCompareSimilar, onSelectNextRisk, onResetSelection,
}: SelectedLinkSummaryProps) {
  if (!link || !prediction) {
    return (
      <section
        aria-labelledby="chn-selected-heading"
        data-testid="chennai-selected-summary"
        className="rounded-xl border border-slate-200 bg-white p-3"
      >
        <h3 id="chn-selected-heading" className="text-[13px] font-semibold text-slate-900">
          Selected Link Prediction
        </h3>
        <p className="mt-1 text-[11.5px] text-slate-600">
          No link is currently selected. Choose a link on the map or in the link table to load its prediction.
        </p>
        <button type="button" className={cn(ACTION_BUTTON, "mt-2")} onClick={onResetSelection}>
          Select the highest-risk link
        </button>
      </section>
    );
  }

  const riskTone = prediction.riskClass === "High" ? "critical" : prediction.riskClass === "Moderate" ? "warning" : "positive";

  return (
    <section
      aria-labelledby="chn-selected-heading"
      data-testid="chennai-selected-summary"
      className="rounded-xl border border-slate-200 bg-white p-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 id="chn-selected-heading" className="text-[13px] font-semibold text-slate-900">
            Selected Link Prediction
          </h3>
          <p className="text-[11px] text-slate-500">
            {link.id} · {link.name}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Badge tone={riskTone}>{prediction.riskClass} Risk</Badge>
          <Badge tone={prediction.preventability.preventable ? "positive" : "warning"}>
            {prediction.preventability.preventable ? "Preventable" : "Prevention at risk"}
          </Badge>
          <Badge tone={prediction.fallback.state === "Ready" ? "positive" : "warning"}>
            Fallback {prediction.fallback.state}
          </Badge>
          <Badge tone={prediction.approvalRequired ? "warning" : "neutral"}>
            {prediction.approvalRequired ? "Approval Required" : "No approval required"}
          </Badge>
          {whatIfActive && <Badge tone="neutral">What-If applied</Badge>}
        </div>
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-4">
        <Metric label="Link ID" value={link.id} />
        <Metric label="Risk score" value={prediction.riskProbability.toFixed(2)} tone={riskTone === "critical" ? "critical" : undefined} />
        <Metric label="Risk class" value={prediction.riskClass} />
        <Metric label="Prediction confidence" value={`${prediction.confidencePct}%`} />
        <Metric label="ETA to impact" value={prediction.etaLabel} />
        <Metric label="Primary driver" value={link.primaryDriver} />
        <Metric label="Capacity exposed" value={`${prediction.capacity.exposedGbps} Gbps`} tone="warning" />
        <Metric label="Customer services exposed" value={String(prediction.customer.servicesExposed)} />
        <Metric label="Recommended action" value={prediction.recommendedAction?.name ?? "None"} tone="positive" />
        <Metric label="Approval requirement" value={prediction.approvalRequired ? "Required" : "Not required"} />
        <Metric label="Fallback readiness" value={`${prediction.fallback.state}, ${Math.round(prediction.fallback.score * 100)}%`} />
        <Metric label="Data quality" value={`${link.dataQualityPct}%`} />
        <Metric label="Source agreement" value={`${link.sourceAgreementPct}%`} />
        <Metric label="Model version" value={CHENNAI_MODEL_VERSION} />
        <Metric label="Last evaluated" value={link.lastEvaluated.replace("T", " ").replace("Z", " UTC")} />
      </dl>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button type="button" className={ACTION_BUTTON} onClick={onViewEvidence}>View Evidence</button>
        <button type="button" className={ACTION_BUTTON} onClick={onRunWhatIf}>Run What-If</button>
        <button type="button" className={ACTION_BUTTON} onClick={onOpenDetail}>Open Link Detail</button>
        <button type="button" className={ACTION_BUTTON} onClick={onCompareSimilar}>Compare Similar Links</button>
        <button type="button" className={ACTION_BUTTON} onClick={onSelectNextRisk}>Select Next Risk</button>
        <button type="button" className={ACTION_BUTTON} onClick={onResetSelection}>Reset Link Selection</button>
      </div>

      <p className="mt-1.5 text-[10px] text-slate-500">
        Synthetic reference logic. Values are calculated locally from the demonstration model and are not a Taara
        production prediction.
      </p>
    </section>
  );
}
