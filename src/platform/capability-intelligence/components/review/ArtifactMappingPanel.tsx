import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, type StatusTone } from "@/platform/components/StatusBadge";
import { BoundedList } from "../remediation/BoundedList";
import { graphExplorerLink } from "../../graph/exploreLink";
import { confidenceLabel } from "../../presentation";
import type { MappingCategory, MappingGroup, MappingSummary } from "../../review/reviewPackage";

const CATEGORY_TONE: Record<MappingCategory, StatusTone> = {
  "authoritative-resolved": "positive",
  "multiple-candidates": "warning",
  unresolved: "critical",
  "human-selection-required": "warning",
};

/**
 * Stage 3.5.4.4 — artifact mapping readiness.
 *
 * Paths are shown only where the engine resolved one; an unresolved mapping is
 * stated as unresolved and never given an invented path. Nothing here resolves
 * a mapping — that decision belongs to a human, outside this experience.
 */
export function ArtifactMappingPanel({
  groups,
  summary,
}: {
  groups: readonly MappingGroup[];
  summary: MappingSummary;
}) {
  return (
    <Card
      data-testid="artifact-mapping-panel"
      data-total={summary.total}
      data-resolved={summary.resolved}
      data-unresolved={summary.unresolved}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm" id="artifact-mapping-heading">
          Artifact mapping readiness ({summary.total})
        </CardTitle>
        <p className="text-xs text-muted-foreground" data-testid="mapping-summary">
          {summary.resolved} resolved, {summary.candidates} with multiple candidates,{" "}
          {summary.unresolved} unresolved, {summary.humanSelectionRequired} requiring human
          selection, of {summary.total} total.
          {summary.completenessPercent === null
            ? " No completeness percentage is available because the plan declares no mapping."
            : ` Mapping completeness: ${summary.completenessPercent}%.`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.length === 0 && (
          <p className="text-xs text-muted-foreground" data-testid="mapping-empty">
            This plan declares no artifact mapping.
          </p>
        )}
        {groups.map((group) => (
          <section
            key={group.category}
            aria-labelledby={`mapping-group-${group.category}`}
            data-testid={`mapping-group-${group.category}`}
            data-count={group.count}
            className="rounded border border-border p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h4
                id={`mapping-group-${group.category}`}
                className="text-xs font-semibold text-foreground"
              >
                {group.label}
              </h4>
              <StatusBadge
                value={group.category}
                tone={CATEGORY_TONE[group.category]}
                label={`${group.count} mapping(s)`}
              />
            </div>
            <div className="mt-2">
              <BoundedList
                items={group.mappings}
                label={`${group.label} mappings`}
                testId={`mapping-list-${group.category}`}
                keyFor={(v) => v.mapping.id}
                renderItem={(v) => {
                  const m = v.mapping;
                  return (
                    <div
                      className="space-y-1 text-xs text-muted-foreground"
                      data-testid="review-mapping"
                      data-resolved={m.resolved}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px]">{m.id}</span>
                        <StatusBadge value={m.operation} tone="neutral" label={m.operation} />
                        <StatusBadge
                          value={m.entityType}
                          tone="neutral"
                          label={`Entity type: ${m.entityType}`}
                        />
                        {m.humanSelectionRequired && (
                          <StatusBadge
                            value="human-selection"
                            tone="warning"
                            label="Human selection required"
                          />
                        )}
                      </div>
                      <p>
                        <span className="font-medium text-foreground">Graph entity:</span>{" "}
                        <span className="font-mono text-[11px]">{m.entityId}</span>
                      </p>
                      <p data-testid="mapping-artifact-path">
                        <span className="font-medium text-foreground">Artifact:</span>{" "}
                        {m.selected?.path ? (
                          <span className="font-mono text-[11px]">{m.selected.path}</span>
                        ) : (
                          "No artifact path is resolved for this mapping."
                        )}
                      </p>
                      {m.selected && (
                        <p>
                          Type {m.selected.type} · {m.selected.authoritative ? "authoritative" : "non-authoritative"} ·
                          method {m.selected.method} · confidence {confidenceLabel(m.selected.confidence)}
                        </p>
                      )}
                      <p>{m.explanation}</p>
                      {m.candidates.length > 0 && (
                        <p>
                          <span className="font-medium text-foreground">Candidates:</span>{" "}
                          {m.candidates.map((c) => c.path ?? `unresolved (${c.type})`).join(", ")}
                        </p>
                      )}
                      <p>
                        Related patch specifications: {v.relatedPatchIds.length}; related
                        workstreams: {v.relatedWorkstreamIds.length}.
                      </p>
                      <p className="flex flex-wrap gap-3">
                        <Link
                          className="underline underline-offset-2"
                          to={graphExplorerLink(m.entityId)}
                          data-testid="mapping-graph-link"
                        >
                          Explore relationships in the Graph Explorer
                        </Link>
                        <Link
                          className="underline underline-offset-2"
                          to={`/platform/capability-intelligence/explorer?entity=${encodeURIComponent(m.entityId)}`}
                        >
                          Open the entity in the Capability Explorer
                        </Link>
                      </p>
                    </div>
                  );
                }}
              />
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
