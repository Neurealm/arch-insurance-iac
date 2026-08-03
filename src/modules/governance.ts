/**
 * Stage 3 — governance rules.
 *
 * Governance reports on the health of the module catalog. It is advisory by
 * design: findings never block local development. Only `error` findings gate a
 * release review, and every finding carries a concrete remediation.
 */

import { reconcileRoutes } from "./routeOwnership";
import { getModules, getCapabilities } from "./registry";
import { classifyUnregistered } from "./classification";
import { discoverCandidateModules } from "./candidates";
import { SHARED_CAPABILITIES } from "./shared/sharedCapabilities";
import { PLATFORM_CAPABILITIES } from "./platform/platformCapabilities";
import { SRE_CAPABILITY_HIERARCHY } from "./sre/capabilityHierarchy";
import { DOMAIN_SIGNALS } from "./generated/domainSignals";
import type {
  CapabilityHierarchy,
  GovernanceFinding,
  GovernanceReport,
} from "./classificationTypes";

const HIERARCHIES: readonly CapabilityHierarchy[] = [SRE_CAPABILITY_HIERARCHY];

const LEVEL_ORDER = ["domain", "capability", "sub-capability", "feature"] as const;

function ruleRouteWithoutOwnership(): GovernanceFinding[] {
  const report = reconcileRoutes();
  return report.rows
    .filter((r) => r.ownership === "unowned")
    .map((r) => ({
      ruleId: "route-without-module-ownership" as const,
      severity: "warning" as const,
      subject: r.path,
      moduleId: null,
      message: `Route ${r.path} is not claimed by any registered module, shared capability or platform capability.`,
      remediation:
        "Add the route to an existing module manifest, or register the owning candidate module from the Stage 3 candidate list.",
    }));
}

function rulePageWithoutRegistration(): GovernanceFinding[] {
  const { items } = classifyUnregistered();
  return items
    .filter(
      (i) =>
        i.implementationType === "page" &&
        (i.classification === "unregistered-product-implementation" ||
          i.classification === "unable-to-determine"),
    )
    .map((i) => ({
      ruleId: "page-without-registration" as const,
      severity: "warning" as const,
      subject: i.ref,
      moduleId: i.likelyOwner,
      message: `Page ${i.ref} has no registered owner${i.likelyOwner ? ` (likely ${i.likelyOwner})` : ""}.`,
      remediation: i.likelyOwner
        ? `Register the ${i.likelyOwner} module, or add the page to its manifest if it already exists.`
        : "Classify the page as product, shared, platform, customer-specific or experimental, then register it accordingly.",
    }));
}

function ruleCapabilityConsumedWithoutDependency(): GovernanceFinding[] {
  const findings: GovernanceFinding[] = [];
  const declaredShared = new Set(SHARED_CAPABILITIES.map((c) => c.sharedCapabilityId));

  for (const shared of SHARED_CAPABILITIES) {
    for (const consumer of shared.consumingModules) {
      const module = getModules().find((m) => m.identity.moduleId === consumer);
      if (!module) continue;
      const declares = module.capabilities.some((c) =>
        (c.dependencies ?? []).includes(shared.sharedCapabilityId),
      );
      if (!declares) {
        findings.push({
          ruleId: "capability-consumed-without-dependency",
          severity: "warning",
          subject: shared.sharedCapabilityId,
          moduleId: consumer,
          message: `Module ${consumer} consumes shared capability ${shared.sharedCapabilityId} but declares no dependency on it.`,
          remediation: `Add "${shared.sharedCapabilityId}" to the dependencies of the consuming capability in the ${consumer} manifest.`,
        });
      }
    }
  }

  // A declared dependency pointing at nothing is equally a defect.
  for (const capability of getCapabilities()) {
    for (const dep of capability.dependencies ?? []) {
      if (dep.startsWith("shared.") && !declaredShared.has(dep)) {
        findings.push({
          ruleId: "capability-consumed-without-dependency",
          severity: "error",
          subject: dep,
          moduleId: capability.moduleId,
          message: `Capability ${capability.capabilityId} depends on ${dep}, which is not in the shared capability registry.`,
          remediation:
            "Register the shared capability in src/modules/shared/sharedCapabilities.ts or correct the dependency identifier.",
        });
      }
    }
  }
  return findings;
}

function ruleSharedWithoutOwner(): GovernanceFinding[] {
  return SHARED_CAPABILITIES.filter((c) => c.primaryOwner === "unassigned").map((c) => ({
    ruleId: "shared-capability-without-primary-owner" as const,
    severity: "warning" as const,
    subject: c.sharedCapabilityId,
    moduleId: null,
    message: `Shared capability ${c.sharedCapabilityId} has no primary owner; ${c.consumingModules.length} modules consume it.`,
    remediation:
      "Assign a primary owning module, or promote the capability to a platform capability if no product module should own it.",
  }));
}

function rulePlatformDeclaredAsModuleOwned(): GovernanceFinding[] {
  const findings: GovernanceFinding[] = [];
  const platformPaths = PLATFORM_CAPABILITIES.flatMap((c) =>
    c.sourcePaths.map((p) => ({ path: p, id: c.platformCapabilityId })),
  );

  for (const capability of getCapabilities()) {
    const owned = [...capability.relatedPages, ...capability.relatedComponents];
    for (const ref of owned) {
      const hit = platformPaths.find((p) => ref.startsWith(p.path));
      if (hit) {
        findings.push({
          ruleId: "platform-capability-declared-as-module-owned",
          severity: "error",
          subject: ref,
          moduleId: capability.moduleId,
          message: `Capability ${capability.capabilityId} claims ${ref}, which belongs to platform capability ${hit.id}.`,
          remediation:
            "Remove the platform-owned reference from the module manifest and record it as a platform dependency instead.",
        });
      }
    }
  }
  return findings;
}

function ruleAgentOrWorkflowUnregistered(): GovernanceFinding[] {
  const registeredAgents = new Set(
    getCapabilities().flatMap((c) => c.relatedAgents ?? []),
  );
  const registeredWorkflows = new Set(
    getCapabilities().flatMap((c) => c.relatedWorkflows ?? []),
  );
  const findings: GovernanceFinding[] = [];

  for (const signal of DOMAIN_SIGNALS) {
    for (const agent of signal.agentRefs) {
      if (!registeredAgents.has(agent)) {
        findings.push({
          ruleId: "agent-or-workflow-referenced-but-unregistered",
          severity: "info",
          subject: agent,
          moduleId: null,
          message: `Agent reference "${agent}" appears in the ${signal.clusterId} cluster but is not declared by any registered capability.`,
          remediation:
            "Declare the agent on the owning capability, or confirm it is catalogue content rather than an executing agent.",
        });
      }
    }
    for (const workflow of signal.workflowRefs) {
      if (!registeredWorkflows.has(workflow)) {
        findings.push({
          ruleId: "agent-or-workflow-referenced-but-unregistered",
          severity: "info",
          subject: workflow,
          moduleId: null,
          message: `Workflow reference "${workflow}" appears in the ${signal.clusterId} cluster but is not declared by any registered capability.`,
          remediation:
            "Declare the workflow on the owning capability, or confirm it is descriptive content with no execution path.",
        });
      }
    }
  }
  return findings;
}

function ruleRegisteredCapabilityWithoutEvidence(): GovernanceFinding[] {
  return getCapabilities()
    .filter(
      (c) =>
        c.relatedPages.length === 0 &&
        c.relatedRoutes.length === 0 &&
        c.relatedComponents.length === 0,
    )
    .map((c) => ({
      ruleId: "registered-capability-without-evidence" as const,
      severity: "error" as const,
      subject: c.capabilityId,
      moduleId: c.moduleId,
      message: `Capability ${c.capabilityId} declares no page, route or component.`,
      remediation:
        "Attach the implementation that realises the capability, or remove the capability until it exists.",
    }));
}

function ruleHierarchyIntegrity(): GovernanceFinding[] {
  const findings: GovernanceFinding[] = [];

  for (const hierarchy of HIERARCHIES) {
    const seen = new Set<string>();
    const ids = new Set(hierarchy.nodes.map((n) => n.capabilityId));

    for (const n of hierarchy.nodes) {
      if (seen.has(n.capabilityId)) {
        findings.push({
          ruleId: "duplicate-capability-node",
          severity: "error",
          subject: n.capabilityId,
          moduleId: hierarchy.moduleId,
          message: `Capability node ${n.capabilityId} is declared more than once.`,
          remediation: "Remove or rename the duplicate node so every capability ID is unique.",
        });
      }
      seen.add(n.capabilityId);

      if (n.parentCapabilityId && !ids.has(n.parentCapabilityId)) {
        findings.push({
          ruleId: "capability-parent-missing",
          severity: "error",
          subject: n.capabilityId,
          moduleId: hierarchy.moduleId,
          message: `Capability node ${n.capabilityId} references missing parent ${n.parentCapabilityId}.`,
          remediation: "Add the parent node, or reparent this node onto an existing capability.",
        });
      }

      const parent = hierarchy.nodes.find((p) => p.capabilityId === n.parentCapabilityId);
      if (parent) {
        const expected = LEVEL_ORDER.indexOf(parent.level) + 1;
        if (LEVEL_ORDER.indexOf(n.level) !== expected) {
          findings.push({
            ruleId: "capability-level-mismatch",
            severity: "warning",
            subject: n.capabilityId,
            moduleId: hierarchy.moduleId,
            message: `Node ${n.capabilityId} is level "${n.level}" under a "${parent.level}" parent.`,
            remediation: `Set the level to "${LEVEL_ORDER[expected] ?? "feature"}" or reparent the node.`,
          });
        }
      } else if (n.parentCapabilityId === null && n.level !== "domain") {
        findings.push({
          ruleId: "capability-level-mismatch",
          severity: "warning",
          subject: n.capabilityId,
          moduleId: hierarchy.moduleId,
          message: `Root node ${n.capabilityId} is level "${n.level}" but roots must be "domain".`,
          remediation: 'Set the root node level to "domain".',
        });
      }
    }
  }
  return findings;
}

function ruleCandidatesAwaitingRegistration(): GovernanceFinding[] {
  return discoverCandidateModules()
    .filter((c) => c.readiness === "ready-to-register")
    .map((c) => ({
      ruleId: "page-without-registration" as const,
      severity: "info" as const,
      subject: c.proposedModuleId,
      moduleId: null,
      message: `Candidate module "${c.proposedName}" is ready to register (${c.metrics.routeCount} routes, ${c.metrics.fileCount} files).`,
      remediation: `Create src/modules/${c.proposedModuleId}/module.manifest.ts using the candidate boundary as the starting point.`,
    }));
}

export function runGovernance(): GovernanceReport {
  const findings: GovernanceFinding[] = [
    ...ruleRouteWithoutOwnership(),
    ...rulePageWithoutRegistration(),
    ...ruleCapabilityConsumedWithoutDependency(),
    ...ruleSharedWithoutOwner(),
    ...rulePlatformDeclaredAsModuleOwned(),
    ...ruleAgentOrWorkflowUnregistered(),
    ...ruleRegisteredCapabilityWithoutEvidence(),
    ...ruleHierarchyIntegrity(),
    ...ruleCandidatesAwaitingRegistration(),
  ];

  const errorCount = findings.filter((f) => f.severity === "error").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  const infoCount = findings.filter((f) => f.severity === "info").length;

  return {
    findings,
    errorCount,
    warningCount,
    infoCount,
    blocksRelease: errorCount > 0,
  };
}

export function governanceByRule() {
  const report = runGovernance();
  return report.findings.reduce<Record<string, GovernanceFinding[]>>((acc, f) => {
    (acc[f.ruleId] ??= []).push(f);
    return acc;
  }, {});
}
