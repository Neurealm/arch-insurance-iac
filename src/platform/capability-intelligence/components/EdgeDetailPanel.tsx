/**
 * Stage 3.5.4.2 — read-only relationship detail panel.
 *
 * Selecting an edge never opens the node Entity Drawer; the user must pick an
 * endpoint explicitly. There is no promote, reject, edit or delete affordance.
 */

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { EDGE_ENDPOINT_POLICY } from "@/modules/graph/types";
import type { GraphQueryEngine } from "@/modules/graph/query/index";
import type { GraphViewEdge } from "../graph/graphViewTypes";
import { edgeAccessibleLabel } from "../graph/reactFlowAdapter";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2 py-1 text-xs">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-foreground">{children}</dd>
    </div>
  );
}

export function EdgeDetailPanel({
  edge,
  engine,
  onOpenEndpoint,
  onClear,
}: {
  edge: GraphViewEdge;
  engine: GraphQueryEngine;
  onOpenEndpoint: (nodeId: string) => void;
  onClear: () => void;
}) {
  const from = engine.getNode(edge.edge.from);
  const to = engine.getNode(edge.edge.to);
  const policy = EDGE_ENDPOINT_POLICY[edge.edge.type];
  const metadata = Object.entries(edge.edge.attributes);

  return (
    <section
      aria-label={edgeAccessibleLabel(edge)}
      data-testid="graph-edge-detail"
      className="space-y-2 rounded border border-border p-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Relationship detail</h3>
          <p className="text-[11px] text-muted-foreground">Read-only. Relationships cannot be changed here.</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          Clear selection
        </Button>
      </div>

      <dl className="divide-y divide-border">
        <Row label="Relationship id">
          <span className="font-mono text-[10px]">{edge.id}</span>
        </Row>
        <Row label="Relationship type">
          <StatusBadge value={edge.edge.type} tone="info" />
        </Row>
        <Row label="Source">
          <button
            type="button"
            className="text-left underline-offset-2 hover:underline"
            onClick={() => onOpenEndpoint(edge.edge.from)}
          >
            {from?.label ?? edge.edge.from}
          </button>
          <div className="font-mono text-[10px] text-muted-foreground">{edge.edge.from}</div>
        </Row>
        <Row label="Target">
          <button
            type="button"
            className="text-left underline-offset-2 hover:underline"
            onClick={() => onOpenEndpoint(edge.edge.to)}
          >
            {to?.label ?? edge.edge.to}
          </button>
          <div className="font-mono text-[10px] text-muted-foreground">{edge.edge.to}</div>
        </Row>
        <Row label="State">
          <StatusBadge
            value={edge.candidate ? "candidate" : "confirmed"}
            tone={edge.candidate ? "warning" : "neutral"}
          />
        </Row>
        <Row label="Confidence">
          <StatusBadge value={edge.edge.confidence} />
        </Row>
        <Row label="Fact source">
          <StatusBadge value={edge.edge.source} tone="neutral" />
        </Row>
        <Row label="Evidence">
          {edge.edge.evidence.length === 0 ? (
            "No declared evidence references."
          ) : (
            <ul className="list-disc space-y-0.5 pl-4">
              {edge.edge.evidence.slice(0, 8).map((e) => (
                <li key={e} className="font-mono text-[10px]">
                  {e}
                </li>
              ))}
            </ul>
          )}
        </Row>
        <Row label="Metadata">
          {metadata.length === 0 ? (
            "No additional metadata."
          ) : (
            <ul className="space-y-0.5">
              {metadata.map(([k, v]) => (
                <li key={k} className="font-mono text-[10px]">
                  {k}: {String(v)}
                </li>
              ))}
            </ul>
          )}
        </Row>
        <Row label="Endpoint policy">
          <span className="text-[11px] text-muted-foreground">
            Permitted from {policy.from.join(", ")} → to {policy.to.join(", ")}
          </span>
        </Row>
      </dl>
    </section>
  );
}
