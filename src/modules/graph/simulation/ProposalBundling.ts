/**
 * Stage 3.5.3.4 — proposal bundling and sequencing.
 *
 * Sequencing is a deterministic topological layering of the proposal
 * dependency graph. Proposals within a layer are parallelizable because they
 * share no dependency; the rollback order is the exact reverse of application.
 */

import {
  sortedUnique,
  stableHash,
  type ChangeProposal,
  type ProposalSequence,
  type SequenceStep,
} from "./SimulationTypes";
import { proposalDependencyCycles } from "./ConflictDetection";

export const bundleIdFor = (proposalIds: readonly string[]): string =>
  `bundle:${stableHash([...proposalIds].sort().join("|"))}`;

/** Builds the proposal dependency graph: proposal -> proposals it depends on. */
export function proposalDependencies(
  proposals: readonly ChangeProposal[],
): ReadonlyMap<string, readonly string[]> {
  const changeOwner = new Map<string, string>();
  for (const p of proposals) for (const c of p.changes) changeOwner.set(c.id, p.id);

  const map = new Map<string, string[]>();
  for (const p of [...proposals].sort((a, b) => a.id.localeCompare(b.id))) {
    const deps = new Set<string>();
    for (const change of p.changes) {
      for (const dep of change.dependencies) {
        const owner = changeOwner.get(dep.changeId);
        if (owner && owner !== p.id) deps.add(owner);
      }
    }
    // A proposal that introduces a node others attach to must run first.
    const addedNodes = new Set(p.changes.flatMap((c) => (c.node ? [c.node.id] : [])));
    for (const other of proposals) {
      if (other.id === p.id) continue;
      const otherAdded = new Set(other.changes.flatMap((c) => (c.node ? [c.node.id] : [])));
      const consumes = p.changes.some((c) =>
        c.edge ? otherAdded.has(c.edge.from) || otherAdded.has(c.edge.to) : false,
      );
      if (consumes && !addedNodes.size) deps.add(other.id);
    }
    map.set(p.id, [...deps].sort((a, b) => a.localeCompare(b)));
  }
  return map;
}

export function sequenceProposals(proposals: readonly ChangeProposal[]): ProposalSequence {
  const sorted = [...proposals].sort((a, b) => a.id.localeCompare(b.id));
  const deps = proposalDependencies(sorted);
  const cycles = proposalDependencyCycles(sorted);
  const inCycle = new Set(cycles.flat());

  const remaining = new Map<string, Set<string>>(
    sorted.map((p) => [p.id, new Set((deps.get(p.id) ?? []).filter((d) => !inCycle.has(d)))]),
  );
  const steps: SequenceStep[] = [];
  const placed = new Set<string>();
  let order = 1;

  while (placed.size < sorted.length) {
    const layer = sorted
      .map((p) => p.id)
      .filter((id) => !placed.has(id))
      .filter((id) => [...(remaining.get(id) ?? [])].every((d) => placed.has(d) || !remaining.has(d)))
      .sort((a, b) => a.localeCompare(b));

    if (layer.length === 0) {
      // Only unresolvable cycles remain; emit them as a single blocked layer.
      const rest = sorted.map((p) => p.id).filter((id) => !placed.has(id)).sort();
      steps.push({
        order,
        proposalIds: rest,
        parallelizable: false,
        blockedBy: sortedUnique(rest.flatMap((id) => [...(remaining.get(id) ?? [])])),
        rationale: "Circular proposal dependencies prevent deterministic ordering.",
      });
      rest.forEach((id) => placed.add(id));
      break;
    }

    steps.push({
      order,
      proposalIds: layer,
      parallelizable: layer.length > 1,
      blockedBy: sortedUnique(layer.flatMap((id) => [...(remaining.get(id) ?? [])])),
      rationale:
        layer.length > 1
          ? "These proposals share no dependency and may be applied in any order."
          : "Applied after every prerequisite proposal.",
    });
    layer.forEach((id) => placed.add(id));
    order += 1;
  }

  const alternativeBranches = sortedUnique(
    sorted
      .filter((p) => p.alternativeProposalIds.length > 0)
      .map((p) => sortedUnique([p.id, ...p.alternativeProposalIds]).join("|")),
  ).map((joined) => joined.split("|"));

  return {
    steps,
    parallelGroups: steps.filter((s) => s.parallelizable).map((s) => s.proposalIds),
    sequentialGroups: steps.filter((s) => !s.parallelizable).map((s) => s.proposalIds),
    alternativeBranches,
    blockingDependencies: sorted
      .map((p) => ({ proposalId: p.id, dependsOn: deps.get(p.id) ?? [] }))
      .filter((d) => d.dependsOn.length > 0),
    circularDependencies: cycles,
    rollbackOrder: steps
      .slice()
      .reverse()
      .flatMap((s) => [...s.proposalIds].sort((a, b) => b.localeCompare(a))),
  };
}
