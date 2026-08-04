/**
 * Stage 3.5.3.4 — proposal validation.
 *
 * Validation reuses the canonical schema (`EDGE_ENDPOINT_POLICY`) and the
 * canonical validator (`validateGraph`) rather than reimplementing them: the
 * proposal is applied to a throwaway overlay and the *difference* in validator
 * findings is attributed to the proposal.
 */

import { EDGE_ENDPOINT_POLICY, type CapabilityGraph, type GraphNode } from "../types";
import { validateGraph } from "../validate";
import { buildOverlay, edgeIdFor } from "./GraphOverlay";
import {
  sortedUnique,
  type ChangeProposal,
  type ProposedChange,
  type ValidationIssue,
  type ValidationOutcome,
  type ValidationResult,
  type ValidationRuleId,
} from "./SimulationTypes";

const RULES_ALWAYS_APPLIED: readonly ValidationRuleId[] = [
  "node-exists",
  "node-absent",
  "edge-exists",
  "edge-absent",
  "endpoint-exists",
  "endpoint-policy",
  "duplicate-node",
  "duplicate-edge",
  "identifier-collision",
  "required-metadata",
  "ownership-conflict",
  "registration-hierarchy",
  "route-lineage",
  "candidate-edge-state",
  "expected-by-design-justification",
  "removal-safety",
  "orphan-creation",
  "broken-dependency",
  "cycle-introduction",
  "scope-validity",
  "parameter-completeness",
  "contradictory-operations",
];

const issue = (
  ruleId: ValidationRuleId,
  severity: ValidationIssue["severity"],
  subject: string,
  message: string,
  changeIds: readonly string[],
): ValidationIssue => ({ ruleId, severity, subject, message, changeIds });

/** Validates one proposal against the canonical graph. */
export function validateProposal(
  canonical: CapabilityGraph,
  proposal: ChangeProposal,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const nodes = new Map<string, GraphNode>(canonical.nodes.map((n) => [n.id, n]));
  const edgeIds = new Set(canonical.edges.map((e) => e.id));

  const missingParameters = sortedUnique([
    ...proposal.parameters.filter((p) => p.required && p.defaultValue === null).map((p) => p.name),
    ...proposal.changes.flatMap((c) => c.requiredParameters),
  ]);

  if (proposal.changes.length === 0) {
    issues.push(
      issue("scope-validity", "error", proposal.id, "Proposal contains no change operations.", []),
    );
  }

  for (const name of missingParameters) {
    issues.push(
      issue(
        "parameter-completeness",
        "blocking",
        name,
        `Required parameter "${name}" is unbound; the proposal cannot be simulated.`,
        proposal.changes.filter((c) => c.requiredParameters.includes(name)).map((c) => c.id),
      ),
    );
  }

  /* ------------------------------------------------- per-change validation */
  const ownershipByNode = new Map<string, Set<string>>();
  const addedEdgeKeys = new Set<string>();
  const addedNodeIds = new Set<string>();

  for (const change of proposal.changes) {
    const cid = [change.id];

    if (change.node) {
      if (nodes.has(change.node.id)) {
        issues.push(
          issue("duplicate-node", "error", change.node.id, `Node "${change.node.id}" already exists.`, cid),
        );
      }
      if (addedNodeIds.has(change.node.id)) {
        issues.push(
          issue("identifier-collision", "error", change.node.id, `Node "${change.node.id}" is added twice.`, cid),
        );
      }
      addedNodeIds.add(change.node.id);
      if (!change.node.label.trim()) {
        issues.push(issue("required-metadata", "warning", change.node.id, "Added node has no label.", cid));
      }
    }

    if (change.edge) {
      const id = edgeIdFor(change.edge);
      const fromNode = nodes.get(change.edge.from) ?? null;
      const toNode = nodes.get(change.edge.to) ?? null;
      const fromType = fromNode?.type ?? findAddedType(proposal.changes, change.edge.from);
      const toType = toNode?.type ?? findAddedType(proposal.changes, change.edge.to);

      if (!fromType) {
        issues.push(issue("endpoint-exists", "error", change.edge.from, `Edge source "${change.edge.from}" does not exist.`, cid));
      }
      if (!toType) {
        issues.push(issue("endpoint-exists", "error", change.edge.to, `Edge target "${change.edge.to}" does not exist.`, cid));
      }
      if (edgeIds.has(id)) {
        issues.push(issue("duplicate-edge", "error", id, `Edge "${id}" already exists.`, cid));
      }
      if (addedEdgeKeys.has(id)) {
        issues.push(issue("duplicate-edge", "error", id, `Edge "${id}" is added twice.`, cid));
      }
      addedEdgeKeys.add(id);

      if (fromType && toType) {
        const policy = EDGE_ENDPOINT_POLICY[change.edge.type];
        if (!policy.from.includes(fromType) || !policy.to.includes(toType)) {
          issues.push(
            issue(
              "endpoint-policy",
              "error",
              id,
              `${change.edge.type} is not allowed from "${fromType}" to "${toType}".`,
              cid,
            ),
          );
        }
      }
      if (change.edge.from === change.edge.to) {
        issues.push(issue("endpoint-policy", "error", id, "Self-referencing relationships are not permitted.", cid));
      }
      if (
        (change.operation === "add-route-registration" || change.operation === "add-capability-registration") &&
        toType &&
        !["capability", "sub-capability", "shared-capability", "platform-capability", "module"].includes(toType)
      ) {
        issues.push(
          issue("registration-hierarchy", "error", id, `Registration must target a capability or module, not "${toType}".`, cid),
        );
      }
      if (change.operation === "add-lineage-relationship" && !toType) {
        issues.push(issue("route-lineage", "error", id, "Lineage target does not exist in the graph.", cid));
      }
    }

    if (change.operation === "remove-edge" || change.operation === "replace-edge") {
      if (!edgeIds.has(change.target.id)) {
        issues.push(issue("edge-exists", "error", change.target.id, `Edge "${change.target.id}" does not exist.`, cid));
      }
    }

    if (
      change.operation === "remove-node" ||
      change.operation === "update-node-metadata" ||
      change.operation === "mark-expected-by-design" ||
      change.operation === "declare-ownership" ||
      change.operation === "replace-ownership"
    ) {
      if (!nodes.has(change.target.id)) {
        issues.push(issue("node-exists", "error", change.target.id, `Node "${change.target.id}" does not exist.`, cid));
      }
    }

    if (change.operation === "remove-node" && nodes.has(change.target.id)) {
      const degree = canonical.edges.filter(
        (e) => e.from === change.target.id || e.to === change.target.id,
      ).length;
      if (degree > 0) {
        issues.push(
          issue(
            "removal-safety",
            "warning",
            change.target.id,
            `Removing "${change.target.id}" also removes ${degree} relationship(s).`,
            cid,
          ),
        );
      }
    }

    if (change.operation === "declare-ownership" || change.operation === "replace-ownership") {
      const owners = ownershipByNode.get(change.target.id) ?? new Set<string>();
      owners.add(String(change.ownerModuleId ?? "<unbound>"));
      ownershipByNode.set(change.target.id, owners);
    }

    if (change.operation === "mark-expected-by-design") {
      const justification = String(change.metadata?.expectedByDesignJustification ?? "").trim();
      if (!justification) {
        issues.push(
          issue(
            "expected-by-design-justification",
            "blocking",
            change.target.id,
            "An expected-by-design classification requires a written justification.",
            cid,
          ),
        );
      }
    }

    if (change.operation === "promote-candidate-edge" && !change.edge) {
      issues.push(
        issue(
          "candidate-edge-state",
          "blocking",
          change.target.id,
          "Candidate promotion requires the concrete relationship to promote.",
          cid,
        ),
      );
    }
  }

  for (const [nodeId, owners] of [...ownershipByNode].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (owners.size > 1) {
      issues.push(
        issue(
          "contradictory-operations",
          "error",
          nodeId,
          `Proposal assigns ${owners.size} different owners to "${nodeId}".`,
          proposal.changes.filter((c) => c.target.id === nodeId).map((c) => c.id),
        ),
      );
    }
  }

  const removedTargets = new Set(
    proposal.changes.filter((c) => c.operation.startsWith("remove-")).map((c) => c.target.id),
  );
  for (const change of proposal.changes) {
    if (change.operation.startsWith("remove-")) continue;
    if (change.target.nodeIds.some((id) => removedTargets.has(id))) {
      issues.push(
        issue(
          "contradictory-operations",
          "error",
          change.target.id,
          "Proposal both removes and depends on the same entity.",
          [change.id],
        ),
      );
    }
  }

  /* ------------------------------------- structural validation via overlay */
  const executableChanges = proposal.changes.filter((c) => c.requiredParameters.length === 0);
  if (executableChanges.length > 0 && issues.every((i) => i.severity !== "blocking")) {
    const before = validateGraph(canonical);
    const { graph } = buildOverlay(canonical, executableChanges);
    const after = validateGraph(graph);
    const beforeKeys = new Set(before.findings.map((f) => `${f.ruleId}|${f.subject}`));
    for (const finding of after.findings) {
      const key = `${finding.ruleId}|${finding.subject}`;
      if (beforeKeys.has(key)) continue;
      const ruleId: ValidationRuleId =
        finding.ruleId === "cyclic-belongs-to"
          ? "cycle-introduction"
          : finding.ruleId === "orphan-node"
            ? "orphan-creation"
            : finding.ruleId === "dangling-edge-endpoint"
              ? "broken-dependency"
              : finding.ruleId === "invalid-edge-endpoint-type"
                ? "endpoint-policy"
                : "required-metadata";
      issues.push(
        issue(
          ruleId,
          finding.severity === "error" ? "error" : finding.severity === "warning" ? "warning" : "info",
          finding.subject,
          `Introduced by this proposal: ${finding.message}`,
          [],
        ),
      );
    }
  }

  const outcome: ValidationOutcome = issues.some((i) => i.severity === "error")
    ? "invalid"
    : missingParameters.length > 0 || issues.some((i) => i.severity === "blocking")
      ? "incomplete"
      : issues.some((i) => i.severity === "warning")
        ? "valid-with-warnings"
        : "valid";

  return {
    proposalId: proposal.id,
    outcome,
    rulesApplied: RULES_ALWAYS_APPLIED,
    issues: [...issues].sort(
      (a, b) => a.ruleId.localeCompare(b.ruleId) || a.subject.localeCompare(b.subject),
    ),
    missingParameters,
    executable: outcome === "valid" || outcome === "valid-with-warnings",
  };
}

function findAddedType(
  changes: readonly ProposedChange[],
  nodeId: string,
): GraphNode["type"] | null {
  const added = changes.find((c) => c.node?.id === nodeId);
  return added?.node?.type ?? null;
}
