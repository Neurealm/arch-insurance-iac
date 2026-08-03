/**
 * Stage 3.5.3.2 — circular dependency detection.
 *
 * Whole-graph strongly-connected-component analysis (iterative Tarjan) over
 * dependency edges, plus a deterministic representative cycle for each
 * component so the finding is actionable rather than abstract.
 */

import type { GraphEdge, GraphEdgeType } from "../types";
import type { GraphQueryEngine, GraphPath } from "../query/index";
import type { CircularDependencyRecord, ReasoningOptions, ReasoningResult } from "./ReasoningTypes";
import { weakestConfidence } from "./ReasoningTypes";
import { buildReasoningResult, evidence, finding, nowMs, perf, recommendation } from "./ReasoningResults";
import { createReasoningContext, moduleOf, pathConfidence } from "./ReasoningContext";

/** Iterative Tarjan; recursion is avoided because the graph exceeds 1,200 nodes. */
function stronglyConnectedComponents(
  nodeIds: readonly string[],
  adjacency: ReadonlyMap<string, readonly GraphEdge[]>,
): string[][] {
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const components: string[][] = [];
  let counter = 0;

  for (const root of nodeIds) {
    if (index.has(root)) continue;
    const work: { id: string; edgeIndex: number }[] = [{ id: root, edgeIndex: 0 }];
    index.set(root, counter);
    low.set(root, counter);
    counter += 1;
    stack.push(root);
    onStack.add(root);

    while (work.length > 0) {
      const frame = work[work.length - 1];
      const edges = adjacency.get(frame.id) ?? [];
      if (frame.edgeIndex < edges.length) {
        const next = edges[frame.edgeIndex].to;
        frame.edgeIndex += 1;
        if (!index.has(next)) {
          index.set(next, counter);
          low.set(next, counter);
          counter += 1;
          stack.push(next);
          onStack.add(next);
          work.push({ id: next, edgeIndex: 0 });
        } else if (onStack.has(next)) {
          low.set(frame.id, Math.min(low.get(frame.id)!, index.get(next)!));
        }
        continue;
      }

      work.pop();
      const parent = work[work.length - 1];
      if (parent) low.set(parent.id, Math.min(low.get(parent.id)!, low.get(frame.id)!));

      if (low.get(frame.id) === index.get(frame.id)) {
        const component: string[] = [];
        let member: string | undefined;
        do {
          member = stack.pop();
          if (member === undefined) break;
          onStack.delete(member);
          component.push(member);
        } while (member !== frame.id);
        if (component.length > 1) components.push(component.sort());
      }
    }
  }

  return components.sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]));
}

/** Shortest cycle back to `start` inside the component; deterministic BFS. */
function representativeCycle(
  start: string,
  members: ReadonlySet<string>,
  adjacency: ReadonlyMap<string, readonly GraphEdge[]>,
): GraphPath {
  const cameFrom = new Map<string, { prev: string; edge: GraphEdge }>();
  let frontier = [start];
  const seen = new Set<string>();

  while (frontier.length > 0) {
    const next: string[] = [];
    for (const id of frontier) {
      const edges = [...(adjacency.get(id) ?? [])].sort(
        (a, b) => a.to.localeCompare(b.to) || a.id.localeCompare(b.id),
      );
      for (const edge of edges) {
        if (!members.has(edge.to)) continue;
        if (edge.to === start) {
          const nodeIds = [start];
          const edgeIds: string[] = [];
          const reverse: { prev: string; edge: GraphEdge }[] = [];
          let cursor = id;
          while (cursor !== start) {
            const step = cameFrom.get(cursor);
            if (!step) break;
            reverse.push(step);
            cursor = step.prev;
          }
          for (const step of reverse.reverse()) {
            edgeIds.push(step.edge.id);
            nodeIds.push(step.edge.to);
          }
          edgeIds.push(edge.id);
          nodeIds.push(start);
          return { nodeIds, edgeIds, length: edgeIds.length };
        }
        if (seen.has(edge.to)) continue;
        seen.add(edge.to);
        cameFrom.set(edge.to, { prev: id, edge });
        next.push(edge.to);
      }
    }
    frontier = next.sort();
  }

  return { nodeIds: [start], edgeIds: [], length: 0 };
}

export function analyzeCircularDependencies(
  engine: GraphQueryEngine,
  options: ReasoningOptions = {},
): ReasoningResult<CircularDependencyRecord> {
  const startedAt = nowMs();
  const includeCandidates = options.includeCandidateRelationships === true;
  const ctx = createReasoningContext(engine, includeCandidates);

  const nodeIds = engine.source.nodes.map((n) => n.id).sort();
  const components = stronglyConnectedComponents(nodeIds, ctx.dependencyOut);

  const records: CircularDependencyRecord[] = components.map((members) => {
    const memberSet = new Set(members);
    const edges: GraphEdge[] = [];
    for (const member of members) {
      for (const edge of ctx.dependencyOut.get(member) ?? []) {
        if (memberSet.has(edge.to)) edges.push(edge);
      }
    }
    edges.sort((a, b) => a.id.localeCompare(b.id));

    const path = representativeCycle(members[0], memberSet, ctx.dependencyOut);
    const { confidence, candidate } = pathConfidence(ctx, path);
    const modules = new Set<string>();
    for (const member of members) {
      const node = engine.getNode(member);
      if (node) modules.add(moduleOf(node));
    }

    return {
      id: members.join("+"),
      memberNodeIds: members,
      size: members.length,
      edgeIds: edges.map((e) => e.id),
      edgeTypes: [...new Set(edges.map((e) => e.type))].sort() as GraphEdgeType[],
      spansModules: [...modules].sort(),
      representativePath: path,
      confidence,
      candidate,
    };
  });

  const filtered = options.moduleId
    ? records.filter((r) => r.spansModules.includes(options.moduleId!))
    : records;
  const page = options.limit === undefined ? filtered : filtered.slice(0, options.limit);

  const findings = page.slice(0, 10).map((record) =>
    finding(
      "circular-dependencies",
      record.spansModules.length > 1 ? "critical" : "warning",
      record.id,
      `Circular dependency over ${record.size} node(s) spanning ${record.spansModules.length} module(s).`,
      [
        evidence(
          "path",
          record.id,
          `Representative cycle: ${record.representativePath.nodeIds.join(" -> ")}.`,
          record.confidence,
          {
            path: record.representativePath,
            nodeIds: record.memberNodeIds,
            edgeIds: record.edgeIds,
            candidate: record.candidate,
          },
        ),
      ],
    ),
  );

  const recommendations = page.map((record) =>
    recommendation(
      "circular-dependencies",
      record.spansModules.length > 1 ? "P1" : "P2",
      record.id,
      "Break the dependency cycle",
      `Invert or extract one relationship in the cycle (${record.edgeTypes.join(", ")}) so the component becomes acyclic.`,
      record.edgeIds,
      record.confidence,
    ),
  );

  return buildReasoningResult<CircularDependencyRecord>({
    analysis: "circular-dependencies",
    subject: options.moduleId ?? null,
    results: page,
    findings,
    recommendations,
    candidateRelationshipsIncluded: includeCandidates,
    confidence: weakestConfidence(page.map((r) => r.confidence)),
    performance: perf(startedAt, ["outgoing"], nodeIds.length, ctx.edgeById.size),
    graph: engine.graphMetadata,
  });
}
