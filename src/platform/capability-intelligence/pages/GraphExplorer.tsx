/**
 * Stage 3.5.4.2 — Interactive Graph Explorer.
 *
 * A read-only exploration surface over the canonical capability graph. It never
 * writes to the graph, never invents relationships, and never renders the full
 * 1,291-node graph: every view is a bounded neighbourhood around one root.
 *
 * All view state is local to this screen. Nothing is persisted, so the screen
 * always opens from the same deterministic default.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCapabilityIntelligence } from "../CapabilityIntelligenceProvider";
import type { GraphQueryEngine } from "@/modules/graph/query/index";
import type { IntelligenceResult } from "@/modules/graph/intelligence/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { EmptyState } from "@/platform/components/States";
import { TopologyCanvas } from "@/runops/components/graphs";
import { EntityDrawer } from "../components/EntityDrawer";
import { EdgeDetailPanel } from "../components/EdgeDetailPanel";
import { GraphContentsList } from "../components/GraphContentsList";
import { GraphControls, type GraphControlsState } from "../components/GraphControls";
import { GraphLegend } from "../components/GraphLegend";
import { RootEntityPicker } from "../components/RootEntityPicker";
import { buildGraphView, neighborsWithinView } from "../graph/graphView";
import { layoutGraphView } from "../graph/graphLayout";
import { selectInitialRoot } from "../graph/initialRoot";
import { GRAPH_ROOT_PARAM } from "../graph/exploreLink";
import { toCanvasEdges, toCanvasNodes } from "../graph/reactFlowAdapter";
import {
  DEFAULT_EDGE_TYPES,
  DEFAULT_GRAPH_DEPTH,
  DIRECTION_LABELS,
  MAX_VISIBLE_EDGES,
  MAX_VISIBLE_NODES,
  type GraphView,
  type GraphViewEmptyReason,
} from "../graph/graphViewTypes";

const DEFAULT_CONTROLS: GraphControlsState = {
  direction: "both",
  depth: DEFAULT_GRAPH_DEPTH,
  edgeTypes: DEFAULT_EDGE_TYPES,
  includeCandidates: false,
};

/** Respects the user's reduced-motion preference for edge animation. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/** Distinct, actionable copy for every empty condition. */
function emptyCopy(reason: GraphViewEmptyReason, view: GraphView): { title: string; description: string } {
  const label = view.rootNode?.label ?? "this entity";
  switch (reason) {
    case "no-root":
      return {
        title: "Choose a root entity",
        description: "Search for a capability, module, service or surface to explore its neighbourhood.",
      };
    case "unknown-entity":
      return {
        title: "Entity not in this graph snapshot",
        description: `“${view.request.rootId}” is not present in graph ${view.graphHash}. Choose a different root entity.`,
      };
    case "orphan-root":
      return {
        title: `${label} has no relationships`,
        description:
          "This entity is genuinely disconnected in the canonical graph — it is an orphan, not a filtering artefact. It appears in the Capability Explorer's orphan view.",
      };
    case "no-matching-relationships":
      return {
        title: "No relationships match the current filters",
        description: `${label} has relationships, but none of them match the selected direction, depth or relationship types. Widen the relationship type selection, increase depth, or switch direction to “${DIRECTION_LABELS.both}”.`,
      };
    case "confirmed-none-candidates-exist":
      return {
        title: "Only candidate relationships exist here",
        description: `${label} has no confirmed relationships, but candidate relationships were detected. Enable “Include candidate relationships” to preview them — they remain non-canonical.`,
      };
    case "query-failed":
    default:
      return {
        title: "The graph query could not be completed",
        description:
          view.errorMessage ??
          "The traversal failed for this entity. Reset the view or choose a different root entity.",
      };
  }
}

export default function GraphExplorer() {
  const { queryEngine, intelligence, graphHash } = useCapabilityIntelligence();
  if (!queryEngine || !intelligence) return null;
  return <GraphExplorerScreen engine={queryEngine} intelligence={intelligence} graphHash={graphHash ?? ""} />;
}

function GraphExplorerScreen({
  engine,
  intelligence,
  graphHash,
}: {
  engine: GraphQueryEngine;
  intelligence: IntelligenceResult;
  graphHash: string;
}) {
  const reducedMotion = usePrefersReducedMotion();

  const initialRoot = useMemo(() => selectInitialRoot(engine.source), [engine]);
  /*
   * A `?root=` parameter (written by the cross-screen "Explore relationships"
   * action, or pasted/refreshed directly) wins over the deterministic default.
   * The parameter is the single source of truth for the root, so browser back
   * and forward move between explored roots.
   */
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedRoot = searchParams.get(GRAPH_ROOT_PARAM);
  const rootId = requestedRoot ?? initialRoot.nodeId;
  const setRootId = useCallback(
    (next: string | null) => {
      setSearchParams(
        (params) => {
          const nextParams = new URLSearchParams(params);
          if (next) nextParams.set(GRAPH_ROOT_PARAM, next);
          else nextParams.delete(GRAPH_ROOT_PARAM);
          return nextParams;
        },
        { replace: false },
      );
    },
    [setSearchParams],
  );
  const [controls, setControls] = useState<GraphControlsState>(DEFAULT_CONTROLS);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [drawerNodeId, setDrawerNodeId] = useState<string | null>(null);
  const [fitKey, setFitKey] = useState(0);

  const view = useMemo(
    () =>
      buildGraphView(engine, {
        rootId,
        direction: controls.direction,
        depth: controls.depth,
        edgeTypes: controls.edgeTypes,
        includeCandidates: controls.includeCandidates,
      }),
    [engine, rootId, controls],
  );

  const layout = useMemo(() => layoutGraphView(view), [view]);
  const canvasNodes = useMemo(() => toCanvasNodes(view, layout), [view, layout]);
  const canvasEdges = useMemo(() => toCanvasEdges(view), [view]);
  const highlights = useMemo(() => neighborsWithinView(view, selectedNodeId), [view, selectedNodeId]);
  const selectedEdge = useMemo(
    () => view.edges.find((e) => e.id === selectedEdgeId) ?? null,
    [view.edges, selectedEdgeId],
  );

  /* Selection is view-scoped: a selection that leaves the view is dropped. */
  useEffect(() => {
    if (selectedNodeId && !view.nodes.some((n) => n.id === selectedNodeId)) setSelectedNodeId(null);
    if (selectedEdgeId && !view.edges.some((e) => e.id === selectedEdgeId)) setSelectedEdgeId(null);
  }, [view, selectedNodeId, selectedEdgeId]);

  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
  }, []);

  /** Re-rooting keeps the controls but clears selection — the view has changed. */
  const handleReroot = useCallback((nodeId: string) => {
    setRootId(nodeId);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setDrawerNodeId(null);
    setFitKey((k) => k + 1);
  }, []);

  const handleReset = useCallback(() => {
    setRootId(null);
    setControls(DEFAULT_CONTROLS);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setDrawerNodeId(null);
    setFitKey((k) => k + 1);
  }, [setRootId]);

  const rootLabel = view.rootNode?.label ?? rootId ?? "Select an entity";
  const canvasLabel = `Capability graph neighbourhood of ${rootLabel}. ${view.nodes.length} entities and ${view.edges.length} relationships, ${DIRECTION_LABELS[controls.direction].toLowerCase()}, depth ${controls.depth}. A text equivalent is available in the graph contents list below.`;

  return (
    <div className="space-y-4" data-testid="graph-explorer">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Interactive Graph Explorer</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Explore the canonical capability graph one bounded neighbourhood at a time. This view is
            read-only and derived entirely from graph {graphHash}; it never creates, changes or
            deletes entities or relationships.
          </p>
        </div>
        <StatusBadge value="read-only" tone="neutral" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RootEntityPicker
                engine={engine}
                rootId={rootId}
                rootLabel={rootLabel}
                onSelect={handleReroot}
              />
              <p className="text-[11px] text-muted-foreground">
                Default root selected by policy: {initialRoot.explanation}
              </p>
              <GraphControls
                state={controls}
                onChange={(next) => setControls((c) => ({ ...c, ...next }))}
                onReset={handleReset}
                onFitView={() => setFitKey((k) => k + 1)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <GraphLegend />
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex flex-wrap items-center gap-2 text-sm">
                <span>{rootLabel}</span>
                <StatusBadge value={`${view.nodes.length} entities`} tone="neutral" />
                <StatusBadge value={`${view.edges.length} relationships`} tone="neutral" />
                {view.truncated && <StatusBadge value="view truncated" tone="warning" />}
                {controls.includeCandidates && <StatusBadge value="candidates included" tone="warning" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {view.truncated && (
                <div
                  role="status"
                  className="rounded border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-800 dark:text-amber-300"
                >
                  <p className="font-medium">This view is truncated for safety.</p>
                  <p>
                    Showing {view.nodes.length} of {view.nodeTotalAvailable} entities and{" "}
                    {view.edges.length} of {view.edgeTotalAvailable} relationships (limits:{" "}
                    {MAX_VISIBLE_NODES} entities, {MAX_VISIBLE_EDGES} relationships). Reduce depth,
                    narrow the relationship types, or pick a single direction to see a complete view.
                  </p>
                </div>
              )}

              {view.emptyReason ? (
                <div className="py-8">
                  <EmptyState {...emptyCopy(view.emptyReason, view)} />
                  <div className="mt-3 flex justify-center">
                    <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                      Reset view
                    </Button>
                  </div>
                </div>
              ) : (
                <TopologyCanvas
                  key={`${view.rootId}:${controls.direction}:${controls.depth}:${fitKey}`}
                  nodes={canvasNodes}
                  edges={canvasEdges}
                  height={560}
                  ariaLabel={canvasLabel}
                  selectedNodeId={selectedNodeId ?? undefined}
                  highlightNodeIds={selectedNodeId ? highlights.nodeIds : undefined}
                  highlightEdgeIds={selectedNodeId ? highlights.edgeIds : undefined}
                  selectedEdgeIds={selectedEdgeId ? new Set([selectedEdgeId]) : undefined}
                  animateHighlights={!reducedMotion}
                  onNodeClick={handleSelectNode}
                  onEdgeClick={(e) => {
                    setSelectedEdgeId(e.id);
                    setSelectedNodeId(null);
                  }}
                />
              )}

              {selectedNodeId && (
                <div className="flex flex-wrap items-center gap-2 rounded border border-border p-2">
                  <span className="text-xs text-muted-foreground">
                    Selected: <span className="text-foreground">{engine.getNode(selectedNodeId)?.label}</span>
                  </span>
                  <Button type="button" size="sm" variant="outline" onClick={() => setDrawerNodeId(selectedNodeId)}>
                    Open entity detail
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleReroot(selectedNodeId)}
                    disabled={selectedNodeId === rootId}
                  >
                    Re-root here
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedNodeId(null)}>
                    Clear selection
                  </Button>
                </div>
              )}

              {selectedEdge && (
                <EdgeDetailPanel
                  edge={selectedEdge}
                  engine={engine}
                  onOpenEndpoint={(id) => {
                    setSelectedEdgeId(null);
                    handleSelectNode(id);
                    setDrawerNodeId(id);
                  }}
                  onClear={() => setSelectedEdgeId(null)}
                />
              )}
            </CardContent>
          </Card>

          <GraphContentsList
            view={view}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            onSelectNode={handleSelectNode}
            onSelectEdge={(id) => {
              setSelectedEdgeId(id);
              setSelectedNodeId(null);
            }}
          />
        </div>
      </div>

      <EntityDrawer
        nodeId={drawerNodeId}
        engine={engine}
        intelligence={intelligence}
        onOpenChange={(open) => !open && setDrawerNodeId(null)}
        onSelectEntity={(id) => setDrawerNodeId(id)}
      />
    </div>
  );
}
