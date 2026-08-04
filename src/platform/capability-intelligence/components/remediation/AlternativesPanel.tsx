import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { confidenceLabel } from "../../presentation";
import {
  directionTone,
  formatMetricDelta,
  metricLabel,
  scoreBandTone,
  severityTone,
} from "../../remediationPresentation";
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
 * Stage 4 — compare mutually exclusive remediation alternatives.
 *
 * The engine states plainly when no deterministic policy can choose between the
 * alternatives; the UI never breaks that tie on its own.
 */
export function AlternativesPanel({
  alternatives,
  comparison,
  busy,
  onCompare,
}: {
  alternatives: readonly ChangeProposal[];
  comparison: AlternativeComparison | null;
  busy: boolean;
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onCompare} disabled={busy} data-testid="compare-alternatives">
          {busy ? "Comparing…" : comparison ? "Re-compare alternatives" : `Compare ${alternatives.length} alternatives`}
        </Button>
        <p className="text-xs text-muted-foreground">
          Each alternative is simulated on its own isolated overlay.
        </p>
      </div>

      {comparison && !busy && (
        <div className="space-y-3" data-testid="alternative-comparison">
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
                        {preferred && <StatusBadge value="preferred" tone="positive" label="Preferred" />}
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
