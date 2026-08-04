import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/platform/components/StatusBadge";
import type { IntelligenceResult } from "@/modules/graph/intelligence/index";
import type { GraphStatistics } from "@/modules/graph/populationTypes";
import type { QueryGraphMetadata } from "@/modules/graph/query/index";

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="text-2xl font-semibold text-foreground" data-testid={`kpi-${label}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground/80">{hint}</div>}
    </div>
  );
}

const pct = (rate: number): string => `${Math.round(rate <= 1 ? rate * 100 : rate)}%`;

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
  const executive = intelligence.summaries.find((x) => x.key === "executive");

  return (
    <div className="space-y-6">
      <section aria-labelledby="graph-scale">
        <h2 id="graph-scale" className="mb-2 text-sm font-semibold text-foreground">
          Graph scale
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <Kpi label="Nodes" value={graph.nodeCount} />
          <Kpi label="Edges" value={graph.edgeCount} />
          <Kpi label="Candidate edges" value={graph.candidateEdgeCount} hint="Weakly inferred" />
          <Kpi label="Node types" value={Object.keys(statistics.nodesByType).length} />
          <Kpi label="Unregistered nodes" value={statistics.totals.unregisteredNodes} />
          <Kpi label="Orphan nodes" value={statistics.totals.orphanNodes} />
        </div>
      </section>

      <section aria-labelledby="recommendation-summary">
        <h2 id="recommendation-summary" className="mb-2 text-sm font-semibold text-foreground">
          Recommendation summary
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <Kpi label="Recommendations" value={s.totalRecommendations} />
          <Kpi label="Findings" value={s.totalFindings} />
          <Kpi label="Critical" value={byPriority.critical} />
          <Kpi label="High" value={byPriority.high} />
          <Kpi label="Medium" value={byPriority.medium} />
          <Kpi label="Low" value={byPriority.low + byPriority.informational} />
        </div>
      </section>

      <section aria-labelledby="health-summary">
        <h2 id="health-summary" className="mb-2 text-sm font-semibold text-foreground">
          Platform health
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <Kpi label="Ownership resolution" value={pct(s.ownershipResolutionRate)} hint="Ownership summary" />
          <Kpi label="Route traceability" value={pct(s.routeTraceabilityRate)} hint="Traceability summary" />
          <Kpi label="Single points of failure" value={s.singlePointOfFailureCount} hint="Resilience summary" />
          <Kpi label="Dependency cycles" value={s.cycleCount} hint="Resilience summary" />
          <Kpi label="Coverage gaps" value={s.coverageGapCount} hint="Registration summary" />
          <Kpi label="Analysis confidence" value={intelligence.confidence} hint="Confidence summary" />
        </div>
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
