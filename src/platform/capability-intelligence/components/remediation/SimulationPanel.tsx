import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { confidenceLabel } from "../../presentation";
import {
  directionTone,
  formatMetricDelta,
  formatMetricValue,
  metricLabel,
  resolutionTone,
  scoreBandTone,
  severityTone,
} from "../../remediationPresentation";
import type { SimulationResult } from "@/modules/graph/simulation/index";

/**
 * Stage 3 — run the proposal against an isolated overlay and read the outcome.
 *
 * The overlay is discarded as soon as its metrics have been read; the canonical
 * graph hash is captured before and after and reported here verbatim.
 */
export function SimulationPanel({
  simulation,
  canRun,
  busy,
  stale,
  onRun,
}: {
  simulation: SimulationResult | null;
  canRun: boolean;
  busy: boolean;
  /** Inputs changed after this result was produced. Never rerun implicitly. */
  stale?: boolean;
  onRun: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onRun} disabled={!canRun || busy} data-testid="run-simulation">
          {busy ? "Simulating…" : simulation ? "Re-run simulation" : "Run simulation"}
        </Button>
        {!canRun && (
          <p className="text-xs text-muted-foreground">Select a proposal to enable simulation.</p>
        )}
        {stale && simulation && (
          <StatusBadge
            value="stale"
            tone="warning"
            label="Inputs changed — re-run to refresh"
          />
        )}
      </div>

      {stale && simulation && (
        <p className="text-xs text-muted-foreground" data-testid="simulation-stale">
          The parameters changed after this simulation ran. The result below still describes the
          previous inputs; nothing was rerun automatically.
        </p>
      )}

      {busy && (
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          Building the overlay and comparing it against the canonical baseline…
        </p>
      )}

      {simulation && !busy && <SimulationOutcome result={simulation} />}
    </div>
  );
}


function SimulationOutcome({ result }: { result: SimulationResult }) {
  const changed = result.metricDeltas.filter((d) => d.direction !== "unchanged");
  return (
    <div className="space-y-4" data-testid="simulation-result" data-success={result.success}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-sm">Outcome</CardTitle>
            <StatusBadge
              value={result.score.band}
              tone={scoreBandTone(result.score.band)}
              label={`Band: ${result.score.band}`}
            />
            <StatusBadge value="score" tone="neutral" label={`Score: ${result.score.score}`} />
            <StatusBadge
              value={result.confidence}
              tone="neutral"
              label={`Confidence: ${confidenceLabel(result.confidence)}`}
            />
            <StatusBadge
              value={result.canonicalGraphHashPreserved ? "preserved" : "changed"}
              tone={result.canonicalGraphHashPreserved ? "positive" : "critical"}
              label={
                result.canonicalGraphHashPreserved
                  ? "Canonical graph unchanged"
                  : "Canonical graph changed — investigate"
              }
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>{result.explanation.outcomeExplanation}</p>
          <p>{result.score.explanation}</p>
          <div className="grid gap-1 md:grid-cols-3 font-mono text-[11px]">
            <span>Simulation: {result.simulationId}</span>
            <span>Canonical hash: {result.canonicalGraphHashBefore}</span>
            <span>Overlay hash: {result.overlayContentHash}</span>
          </div>
          {result.score.gatesApplied.length > 0 && (
            <p>Gates applied: {result.score.gatesApplied.join(", ")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Metric impact</CardTitle>
        </CardHeader>
        <CardContent>
          {changed.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No compared metric moved. The proposal is structurally valid but produces no measurable
              graph improvement on its own.
            </p>
          ) : (
            <table className="w-full text-xs">
              <caption className="sr-only">Baseline against simulated metric values</caption>
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th scope="col" className="py-1 font-medium">Metric</th>
                  <th scope="col" className="py-1 font-medium">Baseline</th>
                  <th scope="col" className="py-1 font-medium">Simulated</th>
                  <th scope="col" className="py-1 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {changed.map((d) => (
                  <tr key={d.key} className="border-t border-border" data-testid="metric-delta">
                    <th scope="row" className="py-1 text-left font-normal text-foreground">
                      {metricLabel(d.key, d.label)}
                    </th>
                    <td className="py-1 text-muted-foreground">{formatMetricValue(d.key, d.baseline)}</td>
                    <td className="py-1 text-muted-foreground">{formatMetricValue(d.key, d.simulated)}</td>
                    <td className="py-1">
                      <StatusBadge
                        value={d.direction}
                        tone={directionTone(d.direction)}
                        label={`${formatMetricDelta(d.key, d.delta)} (${d.direction})`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recommendation resolution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ResolutionByClassification result={result} />

        </CardContent>
      </Card>

      <Card data-testid="simulation-regressions">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Regressions and residual risk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.regressions.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No regression was detected across the {result.metricDeltas.length} compared metrics and the
              14 regression kinds the engine checks.
            </p>
          ) : (
            <ul className="space-y-2">
              {result.regressions.map((r) => (
                <li key={r.id} className="rounded border border-border p-2 text-xs" data-testid="regression">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={r.severity} tone={severityTone(r.severity)} label={r.severity} />
                    <StatusBadge value={r.kind} tone="neutral" label={r.kind} />
                    {!r.reversible && <StatusBadge value="irreversible" tone="warning" label="Not reversible" />}
                  </div>
                  <p className="mt-1 text-muted-foreground">{r.statement}</p>
                </li>
              ))}
            </ul>
          )}
          {result.residualRisks.length > 0 && (
            <ul className="space-y-1">
              {result.residualRisks.map((risk) => (
                <li key={risk.id} className="flex flex-wrap items-start gap-2 text-xs">
                  <StatusBadge value={risk.severity} tone={severityTone(risk.severity)} label={risk.severity} />
                  <span className="text-muted-foreground">{risk.statement}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Accordion type="single" collapsible>
        <AccordionItem value="derivation">
          <AccordionTrigger className="text-sm">How this result was derived</AccordionTrigger>
          <AccordionContent className="space-y-2 text-xs text-muted-foreground">
            <p>{result.explanation.overlayConstruction}</p>
            <DerivationList title="Change statements" items={result.explanation.changeStatements} />
            <DerivationList title="Validation rules applied" items={result.explanation.validationRulesApplied} />
            <DerivationList title="Resolution basis" items={result.explanation.resolutionBasis} />
            <DerivationList title="Regression basis" items={result.explanation.regressionBasis} />
            {result.diagnostics.notes.length > 0 && (
              <DerivationList title="Overlay notes" items={result.diagnostics.notes} />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

/** Canonical resolution classifications, in the engine's own vocabulary. */
const RESOLUTION_CLASSIFICATIONS = [
  ["resolved", "Resolved"],
  ["partially-resolved", "Partially resolved"],
  ["unresolved", "Unresolved"],
  ["superseded", "Superseded"],
  ["invalidated", "Invalidated"],
  ["regressed", "Regressed"],
] as const;

/**
 * Every classification the engine can emit, grouped from all three result
 * buckets. A classification with no members is stated explicitly rather than
 * silently omitted, so an operator can tell "none" from "not reported".
 */
function ResolutionByClassification({ result }: { result: SimulationResult }) {
  const all = [
    ...result.resolvedRecommendations,
    ...result.partiallyResolvedRecommendations,
    ...result.unresolvedRecommendations,
  ];
  return (
    <div className="space-y-2" data-testid="resolution-classifications">
      {RESOLUTION_CLASSIFICATIONS.map(([classification, title]) => {
        const items = all.filter((r) => r.classification === classification);
        return items.length === 0 ? (
          <div
            key={classification}
            className="text-xs text-muted-foreground"
            data-classification={classification}
            data-count={0}
          >
            {title}: none
          </div>
        ) : (
          <div key={classification} data-classification={classification} data-count={items.length}>
            <ResolutionGroup title={title} items={items} />
          </div>
        );
      })}
    </div>
  );
}

function ResolutionGroup({

  title,
  items,
}: {
  title: string;
  items: SimulationResult["resolvedRecommendations"];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="text-xs font-semibold text-foreground">
        {title} ({items.length})
      </div>
      <ul className="mt-1 space-y-1">
        {items.map((r) => (
          <li key={r.recommendationId} className="flex flex-wrap items-start gap-2 text-xs">
            <StatusBadge
              value={r.classification}
              tone={resolutionTone(r.classification)}
              label={r.classification}
            />
            <span className="font-mono text-[11px] text-muted-foreground">{r.recommendationId}</span>
            <span className="text-muted-foreground">{r.explanation}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DerivationList({ title, items }: { title: string; items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="font-semibold text-foreground">{title}</div>
      <ul className="list-disc pl-5">
        {items.map((s, i) => (
          <li key={`${title}-${i}`}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
