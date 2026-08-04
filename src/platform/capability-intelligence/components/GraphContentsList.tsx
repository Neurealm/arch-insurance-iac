/**
 * Stage 3.5.4.2 — accessible graph contents.
 *
 * The canvas is not the only way to understand the graph. This collapsible
 * table lists every visible entity and relationship, with direction, node type,
 * registration state and the current selection, and is fully keyboard operable.
 */

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { GraphView } from "../graph/graphViewTypes";
import { DIRECTION_LABELS } from "../graph/graphViewTypes";
import { registrationOf } from "../graph/reactFlowAdapter";

export function GraphContentsList({
  view,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
}: {
  view: GraphView;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onSelectEdge: (edgeId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="graph-contents-title" className="rounded border border-border">
      <h3 id="graph-contents-title" className="sr-only">
        Accessible graph contents
      </h3>
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-start gap-2 rounded-b-none text-sm"
        aria-expanded={open}
        aria-controls="graph-contents-panel"
        onClick={() => setOpen((o) => !o)}
        data-testid="graph-contents-toggle"
      >
        {open ? (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        )}
        Graph contents — {view.nodes.length} entities, {view.edges.length} relationships (
        {DIRECTION_LABELS[view.request.direction].toLowerCase()}, depth {view.request.depth})
      </Button>

      {open && (
        <div id="graph-contents-panel" className="space-y-4 border-t border-border p-3">
          <div>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Visible entities
            </h4>
            <Table>
              <caption className="sr-only">
                Entities currently visible on the graph canvas, with type, direction relative to the
                root, registration state and selection state.
              </caption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Entity</TableHead>
                  <TableHead scope="col">Node type</TableHead>
                  <TableHead scope="col">Relation to root</TableHead>
                  <TableHead scope="col">Registration</TableHead>
                  <TableHead scope="col">Selection</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {view.nodes.map((n) => (
                  <TableRow key={n.id} data-testid={`graph-contents-node-${n.id}`}>
                    <TableCell>
                      <button
                        type="button"
                        className="text-left text-xs text-foreground underline-offset-2 hover:underline"
                        onClick={() => onSelectNode(n.id)}
                      >
                        {n.node.label}
                      </button>
                      <div className="font-mono text-[10px] text-muted-foreground">{n.id}</div>
                    </TableCell>
                    <TableCell className="text-xs">{n.node.type}</TableCell>
                    <TableCell className="text-xs">
                      {n.isRoot ? "root" : `${n.side}, depth ${n.depth}`}
                    </TableCell>
                    <TableCell className="text-xs">{registrationOf(n.node)}</TableCell>
                    <TableCell className="text-xs">
                      {n.id === selectedNodeId ? "selected" : "not selected"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Visible relationships
            </h4>
            {view.edges.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No relationships are visible with the current filters.
              </p>
            ) : (
              <Table>
                <caption className="sr-only">
                  Relationships currently visible on the graph canvas, with type, direction and
                  candidate state.
                </caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Relationship</TableHead>
                    <TableHead scope="col">Direction</TableHead>
                    <TableHead scope="col">State</TableHead>
                    <TableHead scope="col">Selection</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {view.edges.map((e) => (
                    <TableRow key={e.id} data-testid={`graph-contents-edge-${e.id}`}>
                      <TableCell>
                        <button
                          type="button"
                          className="text-left text-xs text-foreground underline-offset-2 hover:underline"
                          onClick={() => onSelectEdge(e.id)}
                        >
                          {e.edge.type}
                        </button>
                      </TableCell>
                      <TableCell className="font-mono text-[10px]">
                        {e.edge.from} → {e.edge.to}
                      </TableCell>
                      <TableCell className="text-xs">
                        <StatusBadge
                          value={e.candidate ? "candidate" : "confirmed"}
                          tone={e.candidate ? "warning" : "neutral"}
                        />
                      </TableCell>
                      <TableCell className="text-xs">
                        {e.id === selectedEdgeId ? "selected" : "not selected"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
