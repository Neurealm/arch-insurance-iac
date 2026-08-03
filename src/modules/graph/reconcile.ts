/**
 * Stage 3.5.2 — reconciliation of the populated graph against Stage 1–3
 * ownership and boundary decisions.
 *
 * Reconciliation is advisory. Low-confidence ownership conflicts are preserved
 * as findings, never auto-resolved.
 */

import type { CapabilityGraph, GraphNode } from "./types";
import type { ReconciliationFinding, ReconciliationReport } from "./populationTypes";
import { getPopulatedGraph } from "./populate";
import { getModules } from "../registry";
import { SHARED_CAPABILITIES } from "../shared/sharedCapabilities";
import { PLATFORM_CAPABILITIES } from "../platform/platformCapabilities";

export function reconcileGraph(graph: CapabilityGraph = getPopulatedGraph().graph): ReconciliationReport {
  const findings: ReconciliationFinding[] = [];
  const add = (f: ReconciliationFinding) => findings.push(f);

  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const degree = new Map<string, number>();
  const outByType = new Map<string, Set<string>>();
  for (const e of graph.edges) {
    degree.set(e.from, (degree.get(e.from) ?? 0) + 1);
    degree.set(e.to, (degree.get(e.to) ?? 0) + 1);
    const key = `${e.from}|${e.type}`;
    outByType.set(key, (outByType.get(key) ?? new Set()).add(e.to));
  }

  const attr = (n: GraphNode, k: string) => n.attributes[k];
  const sharedIds = new Set(SHARED_CAPABILITIES.map((c) => c.sharedCapabilityId));
  const platformIds = new Set(PLATFORM_CAPABILITIES.map((c) => c.platformCapabilityId));

  /* ---------------------------------- declared vs implemented node presence */
  for (const node of graph.nodes) {
    const declared = node.source === "declared";
    const hasFile = Boolean(node.filePath);
    if (declared && (node.type === "page" || node.type === "component" || node.type === "service") && !hasFile) {
      add({
        ruleId: "declared-node-without-implementation",
        severity: "warning",
        subject: node.id,
        message: `Declared ${node.type} "${node.label}" has no resolvable implementation file.`,
        evidence: node.evidence,
        requiresHumanReview: false,
        confidence: node.confidence,
      });
    }
    if (
      node.source === "observed" &&
      attr(node, "registered") === false &&
      (node.type === "page" || node.type === "component")
    ) {
      add({
        ruleId: "implementation-node-not-registered",
        severity: "info",
        subject: node.id,
        message: `Implementation "${node.id}" exists but is not claimed by any module manifest.`,
        evidence: node.evidence,
        requiresHumanReview: attr(node, "humanReviewRequired") === true,
        confidence: node.confidence,
      });
    }

    /* ------------------------------------------- ownership classification */
    if (node.type === "capability" && sharedIds.has(node.id.replace("capability:", ""))) {
      add({
        ruleId: "shared-capability-modelled-as-module-owned",
        severity: "conflict",
        subject: node.id,
        message: `Capability "${node.id}" duplicates a registered shared capability.`,
        evidence: ["Shared capability catalog"],
        requiresHumanReview: true,
        confidence: "medium",
      });
    }
    if (node.type === "capability" && platformIds.has(node.id.replace("capability:", ""))) {
      add({
        ruleId: "platform-capability-counted-as-module-capability",
        severity: "conflict",
        subject: node.id,
        message: `Capability "${node.id}" duplicates a registered platform capability.`,
        evidence: ["Platform capability catalog"],
        requiresHumanReview: true,
        confidence: "medium",
      });
    }
    if (node.type === "customer-extension" && node.ownership !== "customer-owned") {
      add({
        ruleId: "customer-specific-assigned-to-core",
        severity: "warning",
        subject: node.id,
        message: `Customer-specific implementation "${node.id}" is classified as ${node.ownership}.`,
        evidence: node.evidence,
        requiresHumanReview: true,
        confidence: node.confidence,
      });
    }
    if (attr(node, "classification") === "deprecated") {
      const linked = graph.edges.some(
        (e) =>
          (e.from === node.id || e.to === node.id) &&
          (byId.get(e.from === node.id ? e.to : e.from)?.type === "capability" ||
            byId.get(e.from === node.id ? e.to : e.from)?.type === "sub-capability"),
      );
      if (linked) {
        add({
          ruleId: "deprecated-implementation-linked-to-active-capability",
          severity: "warning",
          subject: node.id,
          message: `Deprecated implementation "${node.id}" is still linked to an active capability.`,
          evidence: node.evidence,
          requiresHumanReview: true,
          confidence: node.confidence,
        });
      }
    }

    /* ----------------------------------------- conflicting route ownership */
    if (node.type === "route") {
      const claimed = String(attr(node, "claimedBy") ?? "")
        .split(",")
        .filter(Boolean);
      if (claimed.length > 1) {
        add({
          ruleId: "conflicting-ownership",
          severity: "conflict",
          subject: node.id,
          message: `Route "${node.label}" is claimed by ${claimed.length} modules: ${claimed.join(", ")}.`,
          evidence: node.evidence,
          requiresHumanReview: true,
          confidence: node.confidence,
        });
      }
    }

    /* ------------------------------------------- missing parent containment */
    if (node.type === "sub-capability" && !(outByType.get(`${node.id}|BELONGS_TO`)?.size ?? 0)) {
      add({
        ruleId: "missing-parent-relationship",
        severity: "warning",
        subject: node.id,
        message: `Sub-capability "${node.id}" has no BELONGS_TO parent.`,
        evidence: node.evidence,
        requiresHumanReview: false,
        confidence: node.confidence,
      });
    }
  }

  /* ---------------------------------------- duplicate node representations */
  const byFile = new Map<string, GraphNode[]>();
  for (const node of graph.nodes) {
    if (!node.filePath) continue;
    byFile.set(node.filePath, [...(byFile.get(node.filePath) ?? []), node]);
  }
  for (const [file, nodes] of [...byFile.entries()].sort()) {
    if (nodes.length < 2) continue;
    add({
      ruleId: "duplicate-node-representation",
      severity: "warning",
      subject: file,
      message: `${nodes.length} nodes represent the same implementation file: ${nodes.map((n) => n.id).join(", ")}.`,
      evidence: [file],
      requiresHumanReview: true,
      confidence: "medium",
    });
  }

  /* -------------------------------------------------------- duplicate edges */
  const edgeIds = new Set<string>();
  for (const e of graph.edges) {
    if (edgeIds.has(e.id)) {
      add({
        ruleId: "duplicate-edge-representation",
        severity: "warning",
        subject: e.id,
        message: `Edge "${e.id}" appears more than once.`,
        evidence: e.evidence,
        requiresHumanReview: false,
        confidence: e.confidence,
      });
    }
    edgeIds.add(e.id);
  }

  /* -------------------------------------------- conflicting edge direction */
  const pairs = new Map<string, string>();
  for (const e of graph.edges) {
    const key = `${e.type}|${[e.from, e.to].sort().join("::")}`;
    const seen = pairs.get(key);
    if (seen && seen !== `${e.from}->${e.to}`) {
      add({
        ruleId: "conflicting-relationship-direction",
        severity: "conflict",
        subject: e.id,
        message: `${e.type} is declared in both directions between "${e.from}" and "${e.to}".`,
        evidence: e.evidence,
        requiresHumanReview: true,
        confidence: e.confidence,
      });
    }
    pairs.set(key, `${e.from}->${e.to}`);
  }

  /* ------------------------------ declared edges without observed evidence */
  for (const e of graph.edges) {
    if (e.source !== "declared") continue;
    const from = byId.get(e.from);
    const to = byId.get(e.to);
    if (!from || !to) continue;
    if (
      (e.type === "IMPLEMENTS" || e.type === "USES") &&
      from.source === "declared" &&
      !from.filePath &&
      !to.filePath
    ) {
      add({
        ruleId: "declared-edge-without-implementation-evidence",
        severity: "info",
        subject: e.id,
        message: `Declared ${e.type} edge has no observed implementation on either endpoint.`,
        evidence: e.evidence,
        requiresHumanReview: false,
        confidence: e.confidence,
      });
    }
  }

  /* ------------------- observed relationships absent from module manifests */
  const manifestRoutes = new Set(getModules().flatMap((m) => m.boundaries.routes));
  for (const node of graph.nodes) {
    if (node.type !== "route" || !node.moduleId) continue;
    if (!manifestRoutes.has(node.label) && attr(node, "declaredInManifest") !== true) {
      add({
        ruleId: "implementation-relationship-not-declared",
        severity: "info",
        subject: node.id,
        message: `Route "${node.label}" resolves to module "${node.moduleId}" but is not declared in its manifest.`,
        evidence: node.evidence,
        requiresHumanReview: false,
        confidence: node.confidence,
      });
    }
  }

  const byRule: Record<string, number> = {};
  for (const f of findings) byRule[f.ruleId] = (byRule[f.ruleId] ?? 0) + 1;

  return {
    findings,
    byRule,
    conflictCount: findings.filter((f) => f.severity === "conflict").length,
    warningCount: findings.filter((f) => f.severity === "warning").length,
    infoCount: findings.filter((f) => f.severity === "info").length,
    humanReviewCount: findings.filter((f) => f.requiresHumanReview).length,
  };
}

/** Degree helper reused by orphan analysis and statistics. */
export function nodeDegrees(graph: CapabilityGraph): Map<string, number> {
  const degree = new Map<string, number>(graph.nodes.map((n) => [n.id, 0]));
  for (const e of graph.edges) {
    degree.set(e.from, (degree.get(e.from) ?? 0) + 1);
    degree.set(e.to, (degree.get(e.to) ?? 0) + 1);
  }
  return degree;
}
