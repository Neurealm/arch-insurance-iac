/**
 * Stage 3.5.3.2 — coverage-gap and orphan analysis.
 *
 * Structural absences only: a gap is reported when a relationship the schema
 * supports is missing, never when a fact is merely unverified. Gaps that are
 * expected by design are flagged as such rather than suppressed.
 */

import type { GraphEdgeType, GraphNode } from "../types";
import type { GraphQueryEngine } from "../query/index";
import type { CoverageGapRecord, ReasoningOptions, ReasoningResult } from "./ReasoningTypes";
import { buildReasoningResult, evidence, finding, nowMs, perf, recommendation } from "./ReasoningResults";

interface Adjacency {
  out: Map<string, Set<GraphEdgeType>>;
  in: Map<string, Set<GraphEdgeType>>;
  outTargets: Map<string, string[]>;
}

const buildAdjacency = (engine: GraphQueryEngine): Adjacency => {
  const out = new Map<string, Set<GraphEdgeType>>();
  const inbound = new Map<string, Set<GraphEdgeType>>();
  const outTargets = new Map<string, string[]>();
  for (const edge of engine.source.edges) {
    (out.get(edge.from) ?? out.set(edge.from, new Set()).get(edge.from)!).add(edge.type);
    (inbound.get(edge.to) ?? inbound.set(edge.to, new Set()).get(edge.to)!).add(edge.type);
    const targets = outTargets.get(edge.from);
    if (targets) targets.push(edge.to);
    else outTargets.set(edge.from, [edge.to]);
  }
  return { out, in: inbound, outTargets };
};

const has = (map: Map<string, Set<GraphEdgeType>>, id: string, types: readonly GraphEdgeType[]): boolean => {
  const set = map.get(id);
  return set ? types.some((t) => set.has(t)) : false;
};

/** Catch-all and utility routes are legitimately capability-free. */
const EXPECTED_ROUTE_PATTERNS = ["*", "not-found", "404", "placeholder", "index"];

const isExpectedRouteGap = (node: GraphNode): boolean => {
  const haystack = `${node.id} ${node.label} ${String(node.attributes.route ?? "")}`.toLowerCase();
  return EXPECTED_ROUTE_PATTERNS.some((pattern) => haystack.includes(pattern));
};

export function analyzeCoverageGaps(
  engine: GraphQueryEngine,
  options: ReasoningOptions = {},
): ReasoningResult<CoverageGapRecord> {
  const startedAt = nowMs();
  const adjacency = buildAdjacency(engine);
  const gaps: CoverageGapRecord[] = [];

  const push = (
    node: GraphNode,
    kind: CoverageGapRecord["kind"],
    rationale: string,
    expected: boolean,
  ): void => {
    gaps.push({
      kind,
      nodeId: node.id,
      nodeType: node.type,
      label: node.label,
      moduleId: node.moduleId,
      rationale,
      expected,
    });
  };

  for (const node of engine.source.nodes) {
    if (options.nodeTypes && !options.nodeTypes.includes(node.type)) continue;
    if (options.moduleId && node.moduleId !== options.moduleId) continue;

    const outbound = adjacency.out.get(node.id);
    const inbound = adjacency.in.get(node.id);
    const isolated = !outbound && !inbound;

    if (isolated) {
      push(
        node,
        "isolated-node",
        "The node participates in no relationship of any type; it cannot be reasoned about.",
        node.type === "persona" || node.type === "permission",
      );
      continue;
    }

    switch (node.type) {
      case "route": {
        if (!has(adjacency.in, node.id, ["EXPOSES"]) && !has(adjacency.out, node.id, ["IMPLEMENTS", "BELONGS_TO"])) {
          push(
            node,
            "route-without-capability",
            "No capability exposes or is implemented by this route, so the route has no declared functional purpose.",
            isExpectedRouteGap(node),
          );
        }
        break;
      }
      case "capability":
      case "sub-capability": {
        if (!has(adjacency.in, node.id, ["IMPLEMENTS"])) {
          push(
            node,
            "capability-without-implementation",
            "No page, component, service, route, workflow, agent or API implements this capability.",
            false,
          );
        }
        break;
      }
      case "service":
      case "api": {
        if (!has(adjacency.in, node.id, ["USES", "CONSUMES", "INVOKES", "DEPENDS_ON"])) {
          push(
            node,
            "service-never-consumed",
            "Nothing uses, consumes, invokes or depends on this service; it may be dead or undeclared.",
            false,
          );
        }
        break;
      }
      case "module": {
        const targets = adjacency.outTargets.get(node.id) ?? [];
        const hasPersona = targets.some((id) => engine.getNode(id)?.type === "persona");
        if (!hasPersona) {
          push(
            node,
            "module-without-persona",
            "The module declares no persona, so accountability for its outcomes is unassigned.",
            false,
          );
        }
        break;
      }
      case "page":
      case "component": {
        if (!node.moduleId && !has(adjacency.out, node.id, ["BELONGS_TO", "IMPLEMENTS"])) {
          push(
            node,
            "unowned-implementation",
            "Implementation artefact with neither a declared module nor a BELONGS_TO/IMPLEMENTS relationship.",
            false,
          );
        }
        break;
      }
      default:
        break;
    }
  }

  gaps.sort(
    (a, b) => a.kind.localeCompare(b.kind) || a.nodeType.localeCompare(b.nodeType) || a.nodeId.localeCompare(b.nodeId),
  );
  const page = options.limit === undefined ? gaps : gaps.slice(0, options.limit);

  const byKind = new Map<string, CoverageGapRecord[]>();
  for (const gap of gaps) {
    const bucket = byKind.get(gap.kind);
    if (bucket) bucket.push(gap);
    else byKind.set(gap.kind, [gap]);
  }

  const findings = [...byKind.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([kind, records]) => {
      const unexpected = records.filter((r) => !r.expected);
      return finding(
        "coverage-gaps",
        unexpected.length === 0 ? "info" : unexpected.length > 20 ? "warning" : "advisory",
        kind,
        `${records.length} ${kind} gap(s); ${unexpected.length} unexpected, ${records.length - unexpected.length} expected by design.`,
        [
          evidence(
            "absence",
            kind,
            `Sample: ${unexpected.slice(0, 10).map((r) => r.nodeId).join(", ") || "none"}.`,
            "high",
            { nodeIds: unexpected.map((r) => r.nodeId) },
          ),
        ],
      );
    });

  const recommendations = [...byKind.entries()]
    .filter(([, records]) => records.some((r) => !r.expected))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([kind, records]) =>
      recommendation(
        "coverage-gaps",
        kind === "capability-without-implementation" ? "P1" : "P2",
        kind,
        "Close the registry gap",
        `${records.filter((r) => !r.expected).length} node(s) exhibit "${kind}"; declare the missing relationship in the owning manifest or registry.`,
        records.filter((r) => !r.expected).map((r) => r.nodeId),
        "high",
      ),
    );

  return buildReasoningResult<CoverageGapRecord>({
    analysis: "coverage-gaps",
    subject: options.moduleId ?? null,
    results: page,
    findings,
    recommendations,
    performance: perf(
      startedAt,
      ["nodeById", "outgoing", "incoming"],
      engine.source.nodes.length,
      engine.source.edges.length,
    ),
    graph: engine.graphMetadata,
  });
}
