/**
 * Stage 3.5.3.4 — deterministic conflict detection across proposals.
 *
 * Material conflicts are never auto-resolved. Only exact duplicates are
 * consolidated, and the consolidation rationale is always recorded.
 */

import {
  simSlug,
  sortedUnique,
  stableHash,
  type ChangeProposal,
  type ConflictType,
  type ProposalConflict,
} from "./SimulationTypes";

const conflictId = (type: ConflictType, participants: readonly string[]): string =>
  `cfl:${type}:${stableHash([...participants].sort().join("|"))}`;

const make = (
  type: ConflictType,
  severity: ProposalConflict["severity"],
  proposalIds: readonly string[],
  changeIds: readonly string[],
  entityIds: readonly string[],
  explanation: string,
  resolutionOptions: readonly string[],
  consolidationRationale: string | null = null,
): ProposalConflict => ({
  id: conflictId(type, [...proposalIds, ...entityIds]),
  type,
  severity,
  proposalIds: sortedUnique(proposalIds),
  changeIds: sortedUnique(changeIds),
  entityIds: sortedUnique(entityIds),
  explanation,
  resolutionOptions,
  evidence: [],
  consolidationRationale,
});

/** Detects every conflict class across a proposal set. */
export function detectConflicts(proposals: readonly ChangeProposal[]): readonly ProposalConflict[] {
  const sorted = [...proposals].sort((a, b) => a.id.localeCompare(b.id));
  const conflicts: ProposalConflict[] = [];

  /* ------------------------------------------------- ownership divergence */
  const ownerClaims = new Map<string, Map<string, string[]>>(); // node -> owner -> proposals
  const edgeAdds = new Map<string, string[]>(); // edge id -> proposals
  const removals = new Map<string, string[]>(); // entity id -> proposals
  const dependencies = new Map<string, string[]>(); // entity id -> proposals depending on it
  const expected = new Map<string, string[]>(); // node -> proposals marking expected
  const candidateDecisions = new Map<string, Map<string, string[]>>(); // node -> decision -> proposals

  for (const proposal of sorted) {
    for (const change of proposal.changes) {
      if (change.operation === "declare-ownership" || change.operation === "replace-ownership") {
        const owner = String(change.ownerModuleId ?? "<unbound>");
        const byOwner = ownerClaims.get(change.target.id) ?? new Map<string, string[]>();
        byOwner.set(owner, [...(byOwner.get(owner) ?? []), proposal.id]);
        ownerClaims.set(change.target.id, byOwner);
      }
      if (change.edge) {
        const key = `${change.edge.from}|${change.edge.type}|${change.edge.to}`;
        edgeAdds.set(key, [...(edgeAdds.get(key) ?? []), proposal.id]);
      }
      if (change.operation.startsWith("remove-")) {
        removals.set(change.target.id, [...(removals.get(change.target.id) ?? []), proposal.id]);
      } else {
        for (const nodeId of change.target.nodeIds) {
          dependencies.set(nodeId, [...(dependencies.get(nodeId) ?? []), proposal.id]);
        }
      }
      if (change.operation === "mark-expected-by-design") {
        expected.set(change.target.id, [...(expected.get(change.target.id) ?? []), proposal.id]);
      }
      if (change.operation === "promote-candidate-edge" || change.operation === "reject-candidate-edge") {
        const decision = change.operation === "promote-candidate-edge" ? "promote" : "reject";
        const byDecision = candidateDecisions.get(change.target.id) ?? new Map<string, string[]>();
        byDecision.set(decision, [...(byDecision.get(decision) ?? []), proposal.id]);
        candidateDecisions.set(change.target.id, byDecision);
      }
    }
  }

  for (const [nodeId, byOwner] of [...ownerClaims].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (byOwner.size > 1) {
      const proposalIds = sortedUnique([...byOwner.values()].flat());
      conflicts.push(
        make(
          "divergent-ownership",
          "blocking",
          proposalIds,
          [],
          [nodeId],
          `Proposals assign ${byOwner.size} different owners to "${nodeId}": ${[...byOwner.keys()].sort().join(", ")}.`,
          ["Adjudicate a single owning module.", "Split the node so each owner holds a distinct scope."],
        ),
      );
    }
  }

  for (const [edgeKey, proposalIds] of [...edgeAdds].sort((a, b) => a[0].localeCompare(b[0]))) {
    const unique = sortedUnique(proposalIds);
    if (unique.length > 1) {
      conflicts.push(
        make(
          "duplicate-registration",
          "warning",
          unique,
          [],
          [edgeKey],
          `${unique.length} proposals create the identical relationship "${edgeKey}".`,
          ["Retain one proposal and drop the duplicates."],
          "Identical relationship creation is deterministically de-duplicated during overlay construction; only one edge is materialised.",
        ),
      );
    }
  }

  for (const [entityId, removers] of [...removals].sort((a, b) => a[0].localeCompare(b[0]))) {
    const dependants = sortedUnique(dependencies.get(entityId) ?? []).filter(
      (id) => !removers.includes(id),
    );
    if (dependants.length > 0) {
      conflicts.push(
        make(
          "removal-dependency",
          "blocking",
          sortedUnique([...removers, ...dependants]),
          [],
          [entityId],
          `"${entityId}" is removed by ${sortedUnique(removers).join(", ")} but required by ${dependants.join(", ")}.`,
          ["Sequence the dependent proposal first.", "Drop the removal."],
        ),
      );
    }
  }

  for (const [nodeId, byDecision] of [...candidateDecisions].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (byDecision.size > 1) {
      conflicts.push(
        make(
          "contradictory-candidate-decision",
          "blocking",
          sortedUnique([...byDecision.values()].flat()),
          [],
          [nodeId],
          `Candidate relationships on "${nodeId}" are simultaneously promoted and rejected.`,
          ["Choose promotion or rejection.", "Escalate to the owning module."],
        ),
      );
    }
  }

  for (const [nodeId, marks] of [...expected].sort((a, b) => a[0].localeCompare(b[0]))) {
    const remediating = sortedUnique(
      sorted
        .filter(
          (p) =>
            !marks.includes(p.id) &&
            p.kind !== "expected-by-design" &&
            p.changes.some((c) => c.target.nodeIds.includes(nodeId)),
        )
        .map((p) => p.id),
    );
    if (remediating.length > 0) {
      conflicts.push(
        make(
          "conflicting-expected-by-design",
          "warning",
          sortedUnique([...marks, ...remediating]),
          [],
          [nodeId],
          `"${nodeId}" is classified as expected by design and remediated at the same time.`,
          ["Accept the exception and withdraw the remediation.", "Remediate and withdraw the exception."],
        ),
      );
    }
  }

  /* ---------------------------------------------- alternatives and cycles */
  const selected = new Set(sorted.map((p) => p.id));
  for (const proposal of sorted) {
    const together = proposal.alternativeProposalIds.filter((id) => selected.has(id));
    if (together.length > 0) {
      conflicts.push(
        make(
          "simultaneous-alternatives",
          "blocking",
          sortedUnique([proposal.id, ...together]),
          [],
          [proposal.subject],
          `Mutually exclusive alternatives for "${proposal.subject}" are selected together.`,
          ["Select exactly one alternative.", "Compare the alternatives before selecting."],
        ),
      );
    }
  }

  const cycles = proposalDependencyCycles(sorted);
  for (const cycle of cycles) {
    conflicts.push(
      make(
        "circular-proposal-dependency",
        "blocking",
        cycle,
        [],
        [],
        `Proposals depend on each other in a cycle: ${cycle.join(" -> ")}.`,
        ["Break the dependency by splitting one proposal."],
      ),
    );
  }

  const bySubject = new Map<string, string[]>();
  for (const proposal of sorted) {
    bySubject.set(proposal.subject, [...(bySubject.get(proposal.subject) ?? []), proposal.id]);
  }
  for (const [subject, ids] of [...bySubject].sort((a, b) => a[0].localeCompare(b[0]))) {
    const distinctKinds = new Set(sorted.filter((p) => ids.includes(p.id)).map((p) => p.kind));
    if (ids.length > 1 && distinctKinds.size > 1) {
      const already = conflicts.some(
        (c) => c.type === "simultaneous-alternatives" && ids.every((id) => c.proposalIds.includes(id)),
      );
      if (!already) {
        conflicts.push(
          make(
            "scope-conflict",
            "advisory",
            ids,
            [],
            [subject],
            `Proposals of ${distinctKinds.size} different kinds target the same subject "${simSlug(subject)}".`,
            ["Confirm the proposals are complementary."],
          ),
        );
      }
    }
  }

  return dedupe(conflicts);
}

/** Ordering conflicts: a change depends on a change that no proposal provides. */
export function detectOrderingConflicts(
  proposals: readonly ChangeProposal[],
): readonly ProposalConflict[] {
  const available = new Set(proposals.flatMap((p) => p.changes.map((c) => c.id)));
  const conflicts: ProposalConflict[] = [];
  for (const proposal of [...proposals].sort((a, b) => a.id.localeCompare(b.id))) {
    for (const change of proposal.changes) {
      for (const dep of change.dependencies) {
        if (!available.has(dep.changeId)) {
          conflicts.push(
            make(
              "ordering-conflict",
              "blocking",
              [proposal.id],
              [change.id, dep.changeId],
              change.target.nodeIds,
              `Change "${change.id}" depends on "${dep.changeId}", which no selected proposal provides.`,
              ["Include the prerequisite proposal.", "Remove the dependent change."],
            ),
          );
        }
      }
    }
  }
  return dedupe(conflicts);
}

/** Detects cycles in the proposal-level dependency graph. */
export function proposalDependencyCycles(
  proposals: readonly ChangeProposal[],
): readonly (readonly string[])[] {
  const changeOwner = new Map<string, string>();
  for (const p of proposals) for (const c of p.changes) changeOwner.set(c.id, p.id);

  const edges = new Map<string, Set<string>>();
  for (const p of proposals) {
    const set = edges.get(p.id) ?? new Set<string>();
    for (const c of p.changes) {
      for (const dep of c.dependencies) {
        const owner = changeOwner.get(dep.changeId);
        if (owner && owner !== p.id) set.add(owner);
      }
    }
    edges.set(p.id, set);
  }

  const cycles: string[][] = [];
  const state = new Map<string, 0 | 1 | 2>();
  const stack: string[] = [];

  const visit = (id: string): void => {
    state.set(id, 1);
    stack.push(id);
    for (const next of [...(edges.get(id) ?? [])].sort()) {
      if (state.get(next) === 1) {
        const start = stack.indexOf(next);
        cycles.push([...stack.slice(start), next]);
      } else if (!state.has(next)) {
        visit(next);
      }
    }
    stack.pop();
    state.set(id, 2);
  };

  for (const p of [...proposals].sort((a, b) => a.id.localeCompare(b.id))) {
    if (!state.has(p.id)) visit(p.id);
  }
  return cycles;
}

const dedupe = (conflicts: readonly ProposalConflict[]): readonly ProposalConflict[] => {
  const seen = new Map<string, ProposalConflict>();
  for (const c of conflicts) if (!seen.has(c.id)) seen.set(c.id, c);
  return [...seen.values()].sort((a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id));
};
