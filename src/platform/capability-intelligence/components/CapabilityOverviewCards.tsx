import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/platform/components/StatusBadge";
import {
  confidenceExplanation,
  confidenceLabel,
  formatRate,
  metricOf,
  type MetricState,
} from "../presentation";
import type { IntelligenceResult } from "@/modules/graph/intelligence/index";
import type { GraphStatistics } from "@/modules/graph/populationTypes";
import type { QueryGraphMetadata } from "@/modules/graph/query/index";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * A single KPI rendered as a description-list group. The DOM order is
 * `<dt>` (term) → `<dd>` (value) → supporting context, so assistive technology
 * receives a valid term/definition pair; the visual order (large figure above
 * its caption) is restored with flex ordering rather than invalid markup.
 * Supporting context is a plain element associated through `aria-describedby`,
 * never a second definition value.
 */
function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  const id = `kpi-${slug(label)}`;
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card px-4 py-3">
      <dt id={`${id}-label`} className="order-2 text-xs text-muted-foreground">
        {label}
      </dt>
      <dd
        className="order-1 text-2xl font-semibold text-foreground"
        data-testid={`kpi-${label}`}
        aria-describedby={hintId}
      >
        {value}
      </dd>
      {hint && (
        <p id={hintId} className="order-3 mt-1 text-[11px] text-muted-foreground/80">
          {hint}
        </p>
      )}
    </div>
  );
}


function KpiGrid({ children, columns = "md:grid-cols-6" }: { children: React.ReactNode; columns?: string }) {
  return <dl className={`grid grid-cols-2 gap-3 ${columns}`}>{children}</dl>;
}


/** Executive KPI grid for the Capability Intelligence overview screen. */
export function CapabilityOverviewCards({
  intelligence,
  statistics,
  graph,
  analysisDurationMs,
  computedAt,
}: {
  intelligence: IntelligenceResult;
  statistics: GraphStatistics;
  graph: QueryGraphMetadata;
  analysisDurationMs: number;
  computedAt: string;
}) {
  const s = intelligence.statistics;
  const byPriority = s.recommendationsByPriority;
  const byStatus = s.recommendationsByStatus;
  const executive = intelligence.summaries.find((x) => x.key === "executive");
  const registration = intelligence.summaries.find((x) => x.key === "registration-coverage");

  const ownership: MetricState = metricOf(s.ownershipResolutionRate);
  const traceability: MetricState = metricOf(s.routeTraceabilityRate);

  return (
    <div className="space-y-6">
      <section aria-labelledby="graph-scale">
        <h2 id="graph-scale" className="mb-2 text-sm font-semibold text-foreground">
          Graph scale
        </h2>
        <KpiGrid>
          <Kpi label="Nodes" value={graph.nodeCount.toLocaleString()} />
          <Kpi label="Edges" value={graph.edgeCount.toLocaleString()} />
          <Kpi label="Candidate edges" value={graph.candidateEdgeCount} hint="Weakly inferred relationships" />
          <Kpi label="Node types" value={Object.keys(statistics.nodesByType).length} />
          <Kpi
            label="Unregistered inventory"
            value={statistics.totals.unregisteredNodes.toLocaleString()}
            hint="Repository surface not yet claimed by a module manifest"
          />
          <Kpi
            label="Orphan nodes"
            value={statistics.totals.orphanNodes.toLocaleString()}
            hint="Zero graph relationships — filterable in the Explorer"
          />
        </KpiGrid>
      </section>

      <section aria-labelledby="recommendation-summary">
        <h2 id="recommendation-summary" className="mb-2 text-sm font-semibold text-foreground">
          Recommendation summary
        </h2>
        <KpiGrid>
          <Kpi label="Recommendations" value={s.totalRecommendations} />
          <Kpi label="Findings" value={s.totalFindings} />
          <Kpi label="Critical" value={byPriority.critical} hint="Priority band" />
          <Kpi label="High" value={byPriority.high} hint="Priority band" />
          <Kpi label="Medium" value={byPriority.medium} hint="Priority band" />
          <Kpi label="Low" value={byPriority.low} hint="Priority band" />
          <Kpi label="Informational" value={byPriority.informational} hint="Priority band" />
          <Kpi label="Open" value={byStatus.open} hint="Recommendation status" />
        </KpiGrid>
      </section>

      <section aria-labelledby="registration-coverage">
        <h2 id="registration-coverage" className="mb-2 text-sm font-semibold text-foreground">
          Registration coverage
        </h2>
        <p className="mb-2 max-w-3xl text-xs text-muted-foreground">
          These figures measure how much of the repository has completed the module registration journey. A large
          backlog reflects migration progress, not a platform fault: the graph and its measurements are valid, and some
          exclusions are intentional.
        </p>
        <KpiGrid>
          <Kpi
            label="Open coverage gaps"
            value={s.coverageGapCount.toLocaleString()}
            hint="Registration backlog awaiting a claim"
          />
          <Kpi
            label="Expected-by-design exclusions"
            value={s.expectedByDesignExclusionCount.toLocaleString()}
            hint="Intentionally out of the registration model"
          />
          <Kpi
            label="Registration recommendations"
            value={s.recommendationsByCategory.registration}
            hint="Advisory, governance category"
          />
          <Kpi
            label="Expected-by-design recommendations"
            value={byStatus["expected-by-design"]}
            hint="Retained for transparency"
          />
        </KpiGrid>
        {registration && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            {registration.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="health-summary">
        <h2 id="health-summary" className="mb-2 text-sm font-semibold text-foreground">
          Platform health
        </h2>
        <KpiGrid>
          <Kpi
            label="Ownership resolution"
            value={formatRate(ownership)}
            hint="Share of evaluated entities with a resolved owning module (ownership summary)"
          />
          <Kpi
            label="Route traceability"
            value={formatRate(traceability)}
            hint="Share of evaluated routes traceable to a capability (traceability summary)"
          />
          <Kpi label="Single points of failure" value={s.singlePointOfFailureCount} hint="Resilience summary" />
          <Kpi label="Dependency cycles" value={s.cycleCount} hint="Resilience summary" />
          <Kpi
            label="Candidate-influenced recommendations"
            value={s.candidateInfluencedRecommendationCount}
            hint="Depend on weakly inferred edges"
          />
          <Kpi
            label="Analysis confidence"
            value={confidenceLabel(intelligence.confidence)}
            hint={confidenceExplanation(intelligence.confidence)}
          />
        </KpiGrid>
        <p className="mt-2 text-[11px] text-muted-foreground" data-testid="confidence-raw">
          Engine confidence value: <span className="font-mono">{intelligence.confidence}</span>
        </p>
      </section>

      {executive && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{executive.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {executive.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Last analysis</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
          <div>
            Graph hash:{" "}
            <span className="font-mono text-foreground" data-testid="graph-hash">
              {graph.contentHash}
            </span>
          </div>
          <div>
            Graph version: <span className="text-foreground">{graph.version}</span> · schema{" "}
            <span className="text-foreground">{graph.schemaVersion}</span>
          </div>
          <div>
            Generator: <span className="font-mono">{intelligence.generator}</span>
          </div>
          <div>
            Analysed in <span className="text-foreground">{analysisDurationMs} ms</span> ·{" "}
            {new Date(computedAt).toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            Hash preserved:{" "}
            <StatusBadge
              value={intelligence.execution.graphHashPreserved ? "yes" : "no"}
              tone={intelligence.execution.graphHashPreserved ? "positive" : "critical"}
            />
          </div>
          <div>
            Analyses executed:{" "}
            <span className="text-foreground">{intelligence.execution.analysesExecuted.length}</span> · policies{" "}
            <span className="text-foreground">{intelligence.execution.policiesEvaluated.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
