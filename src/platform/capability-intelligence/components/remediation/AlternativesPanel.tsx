import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { confidenceLabel } from "../../presentation";
import {
  directionTone,
  formatMetricDelta,
  metricLabel,
  scoreBandTone,
  severityTone,
  validationLabel,
  validationTone,
} from "../../remediationPresentation";
import {
  MAX_COMPARISON_ALTERNATIVES,
  MIN_COMPARISON_ALTERNATIVES,
  type AlternativeEligibility,
  type EligibilityVerdict,
} from "../../remediation/eligibility";
import type { AlternativeComparison, ChangeProposal } from "@/modules/graph/simulation/index";

const VERDICT_LABEL: Record<AlternativeComparison["verdict"], string> = {
  preferred: "A preferred alternative exists",
  equivalent: "The alternatives are equivalent",
  "decision-required": "A governance decision is required",
};

const VERDICT_TONE: Record<AlternativeComparison["verdict"], "positive" | "info" | "warning"> = {
  preferred: "positive",
  equivalent: "info",
  "decision-required": "warning",
};

/**
 * Stage 6 — compare mutually exclusive remediation alternatives.
 *
 * Three separate concerns, deliberately kept apart:
 *   display    — every alternative is shown, including ineligible ones;
 *   selection  — the operator ticks which ones to compare (2–4);
 *   execution  — the comparison engine runs only when every ticked alternative
 *                passes the same eligibility contract simulation uses.
 *
 * The engine states plainly when no deterministic policy can choose between
 * the alternatives; the UI never breaks that tie on its own.
 */
export function AlternativesPanel({
  alternatives,
  eligibility,
  assessed,
  selectedIds,
  comparison,
  comparisonEligibility,
  busy,
  stale,
  onAssess,
  onToggle,
  onCompare,
}: {
  alternatives: readonly ChangeProposal[];
  eligibility: readonly AlternativeEligibility[];
  assessed: boolean;
  selectedIds: readonly string[];
  comparison: AlternativeComparison | null;
  comparisonEligibility: EligibilityVerdict;
  busy: boolean;
  /** Inputs changed after this comparison ran. */
  stale?: boolean;
  onAssess: () => void;
  onToggle: (proposalId: string) => void;
  onCompare: () => void;
}) {
  if (alternatives.length <= 1) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="no-alternatives">
        This proposal has no mutually exclusive alternative. There is nothing to compare, and no
        governance decision is required at this step.
      </p>
    );
  }

  const byId = new Map(eligibility.map((e) => [e.proposalId, e]));
  const eligibleCount = eligibility.filter((e) => e.verdict.eligible).length;

  return (
    <div className="space-y-4" data-testid="alternatives-stage" data-assessed={assessed}>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onAssess} disabled={busy} data-testid="assess-alternatives">
          {busy ? "Assessing…" : assessed ? "Re-assess alternatives" : `Assess ${alternatives.length} alternatives`}
        </Button>
        <Button
          onClick={onCompare}
          disabled={!comparisonEligibility.eligible || busy}
          data-testid="compare-alternatives"
        >
          {comparison ? "Re-compare alternatives" : "Compare selected alternatives"}
        </Button>
        {stale && comparison && (
          <StatusBadge value="stale" tone="warning" label="Inputs changed — re-compare to refresh" />
        )}
      </div>

      <p className="text-xs text-muted-foreground" data-testid="comparison-gate-reason">
        {assessed
          ? comparisonEligibility.reason
          : `Assess the alternatives first: the comparison engine simulates each one, so every selected alternative must pass the same validation gate a single simulation does. Select between ${MIN_COMPARISON_ALTERNATIVES} and ${MAX_COMPARISON_ALTERNATIVES}.`}
      </p>

      {assessed && eligibleCount === 0 && (
        <p className="text-xs text-muted-foreground" data-testid="no-eligible-alternatives">
          None of these alternatives is comparable. Each is listed below with the engine's reason; no
          alternative has been hidden.
        </p>
      )}

      <ul className="space-y-2" data-testid="alternative-candidates">
        {alternatives.map((alternative) => {
          const state = byId.get(alternative.id);
          const checked = selectedIds.includes(alternative.id);
          const selectable = Boolean(state?.verdict.eligible);
          return (
            <li key={alternative.id}>
              <Card
                data-testid="alternative-candidate"
                data-proposal={alternative.id}
                data-eligible={selectable}
              >
                <CardContent className="space-y-2 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Checkbox
                      id={`alt-${alternative.id}`}
                      checked={checked}
                      disabled={!selectable || busy}
                      onCheckedChange={() => onToggle(alternative.id)}
                      aria-label={`Select ${alternative.id} for comparison`}
                    />
                    <label htmlFor={`alt-${alternative.id}`} className="text-xs font-medium text-foreground">
                      {alternative.title}
                    </label>
                    <StatusBadge value={alternative.variant} tone="neutral" label={`Variant: ${alternative.variant}`} />
                    {state?.validation ? (
                      <StatusBadge
                        value={state.validation.outcome}
                        tone={validationTone(state.validation.outcome)}
                        label={validationLabel(state.validation.outcome)}
                      />
                    ) : (
                      <StatusBadge value="not-assessed" tone="neutral" label="Not assessed" />
                    )}
                    <StatusBadge
                      value={alternative.incomplete ? "incomplete" : "parameters-resolved"}
                      tone={alternative.incomplete ? "warning" : "positive"}
                      label={alternative.incomplete ? "Parameters unresolved" : "Parameters resolved"}
                    />
                    <StatusBadge
                      value={selectable ? "comparable" : "not-comparable"}
                      tone={selectable ? "positive" : "critical"}
                      label={selectable ? "Comparable" : "Not comparable"}
                    />
                  </div>
                  {state && !state.verdict.eligible && (
                    <p className="text-[11px] text-muted-foreground" data-testid="alternative-blocker">
                      {state.verdict.reason}
                    </p>
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      {comparison && !busy && (
        <div className="space-y-3" data-testid="alternative-comparison">
          {stale && (
            <p className="text-xs text-muted-foreground" data-testid="comparison-stale">
              The inputs changed after this comparison ran. The result below still describes the
              previous inputs; nothing was re-compared automatically.
            </p>
          )}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-sm">Verdict</CardTitle>
                <StatusBadge
                  value={comparison.verdict}
                  tone={VERDICT_TONE[comparison.verdict]}
                  label={VERDICT_LABEL[comparison.verdict]}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <p>{comparison.rationale}</p>
              {comparison.discriminators.length > 0 && (
                <p>Discriminators: {comparison.discriminators.join("; ")}</p>
              )}
            </CardContent>
          </Card>

          <ul className="space-y-2">
            {comparison.alternatives.map((alt) => {
              const preferred = alt.proposalId === comparison.preferredProposalId;
              const moved = alt.deltas.filter((d) => d.direction !== "unchanged");
              return (
                <li key={alt.proposalId}>
                  <Card
                    className={preferred ? "border-primary" : undefined}
                    data-testid="alternative-outcome"
                    data-preferred={preferred}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge value={alt.variant} tone="neutral" label={`Variant: ${alt.variant}`} />
                        <StatusBadge
                          value={alt.score.band}
                          tone={scoreBandTone(alt.score.band)}
                          label={`${alt.score.band} · ${alt.score.score}`}
                        />
                        <StatusBadge
                          value={alt.confidence}
                          tone="neutral"
                          label={`Confidence: ${confidenceLabel(alt.confidence)}`}
                        />
                        <StatusBadge value={alt.complexity} tone="neutral" label={`Complexity: ${alt.complexity}`} />
                        {preferred && <StatusBadge value="preferred" tone="positive" label="Preferred by the engine" />}
                        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                          {alt.proposalId}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                      <p>
                        Resolves {alt.resolvedRecommendationIds.length} recommendation(s); leaves{" "}
                        {alt.residualRecommendationIds.length} outstanding.
                      </p>
                      {moved.length > 0 && (
                        <ul className="flex flex-wrap gap-1">
                          {moved.map((d) => (
                            <li key={d.key}>
                              <StatusBadge
                                value={d.direction}
                                tone={directionTone(d.direction)}
                                label={`${metricLabel(d.key, d.label)} ${formatMetricDelta(d.key, d.delta)}`}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                      {alt.regressions.length > 0 && (
                        <ul className="space-y-1">
                          {alt.regressions.map((r) => (
                            <li key={r.id} className="flex flex-wrap items-start gap-2">
                              <StatusBadge value={r.severity} tone={severityTone(r.severity)} label={r.severity} />
                              <span>{r.statement}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
