/**
 * Module registry validation.
 *
 * Pure functions over an array of manifests. No filesystem or network access:
 * "reference exists" checks are performed against sets the caller supplies
 * (known routes, known entities, known permissions, known workflows), so the
 * same rules run in tests, at dev-time and in a future Module Capability
 * Intelligence report.
 */

import {
  MODULE_MANIFEST_SCHEMA_VERSION,
  type ModuleManifest,
  type RegistryValidationReport,
  type ValidationFinding,
} from "./types";

export interface KnownReferences {
  /** Routes registered in the application router. */
  routes?: readonly string[];
  /** Database entities (tables/views) known to exist. */
  databaseEntities?: readonly string[];
  /** Workflow IDs known to exist. */
  workflows?: readonly string[];
  /** Permission codes known to exist. */
  permissions?: readonly string[];
  /** Source paths known to exist on disk. */
  sourcePaths?: readonly string[];
}

const finding = (f: ValidationFinding): ValidationFinding => f;

function dupes(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const out = new Set<string>();
  for (const v of values) {
    if (seen.has(v)) out.add(v);
    seen.add(v);
  }
  return [...out];
}

export function validateManifests(
  manifests: readonly ModuleManifest[],
  known: KnownReferences = {},
): RegistryValidationReport {
  const findings: ValidationFinding[] = [];

  /* ---- identity ---------------------------------------------------------- */
  for (const id of dupes(manifests.map((m) => m.identity.moduleId))) {
    findings.push(
      finding({
        ruleId: "duplicate-module-id",
        severity: "error",
        moduleId: id,
        subject: id,
        message: `Module ID "${id}" is declared by more than one manifest.`,
      }),
    );
  }

  for (const m of manifests) {
    const id = m.identity.moduleId;

    if (m.schemaVersion !== MODULE_MANIFEST_SCHEMA_VERSION) {
      findings.push(
        finding({
          ruleId: "schema-version-mismatch",
          severity: "error",
          moduleId: id,
          subject: String(m.schemaVersion),
          message: `Manifest targets schema ${m.schemaVersion}; registry expects ${MODULE_MANIFEST_SCHEMA_VERSION}.`,
        }),
      );
    }

    if (!m.identity.productOwner?.trim() || !m.identity.technicalOwner?.trim()) {
      findings.push(
        finding({
          ruleId: "missing-owner",
          severity: "warning",
          moduleId: id,
          subject: "identity.productOwner|technicalOwner",
          message: `Module "${id}" does not declare both a product owner and a technical owner.`,
        }),
      );
    }

    if (m.capabilities.length === 0) {
      findings.push(
        finding({
          ruleId: "missing-capability-declaration",
          severity: "warning",
          moduleId: id,
          subject: "capabilities",
          message: `Module "${id}" declares no capabilities.`,
        }),
      );
    }

    /* ---- inclusion vs exclusion conflicts -------------------------------- */
    const conflictPairs: [readonly string[], readonly string[], string][] = [
      [m.boundaries.sourcePaths, m.exclusions.sourcePaths, "sourcePaths"],
      [m.boundaries.routes, m.exclusions.routes, "routes"],
      [m.boundaries.componentRefs, m.exclusions.components, "components"],
      [m.boundaries.databaseEntities, m.exclusions.databaseEntities, "databaseEntities"],
      [m.boundaries.workflowIds, m.exclusions.workflows, "workflows"],
      [m.boundaries.integrationIds, m.exclusions.integrations, "integrations"],
      [m.boundaries.aiAgentIds, m.exclusions.agents, "agents"],
      [m.boundaries.permissionIds, m.exclusions.permissions, "permissions"],
    ];
    for (const [included, excluded, field] of conflictPairs) {
      for (const value of included) {
        if (excluded.includes(value)) {
          findings.push(
            finding({
              ruleId: "conflicting-inclusion-exclusion",
              severity: "error",
              moduleId: id,
              subject: `${field}:${value}`,
              message: `"${value}" is both included in and excluded from module "${id}".`,
            }),
          );
        }
      }
    }
    const capabilityIds = m.capabilities.map((c) => c.capabilityId);
    for (const capId of capabilityIds) {
      if (m.exclusions.capabilities.includes(capId)) {
        findings.push(
          finding({
            ruleId: "conflicting-inclusion-exclusion",
            severity: "error",
            moduleId: id,
            subject: `capabilities:${capId}`,
            message: `Capability "${capId}" is both declared and excluded by module "${id}".`,
          }),
        );
      }
    }

    /* ---- capability integrity ------------------------------------------- */
    for (const cap of m.capabilities) {
      const hasBackend =
        cap.relatedServices.length > 0 ||
        cap.relatedEntities.length > 0 ||
        cap.relatedApis.length > 0;
      if (cap.implementationStatus === "implemented" && !hasBackend) {
        findings.push(
          finding({
            ruleId: "unregistered-implementation",
            severity: "warning",
            moduleId: id,
            subject: cap.capabilityId,
            message: `Capability "${cap.capabilityId}" claims "implemented" without any service, API or database entity reference.`,
          }),
        );
      }
      for (const route of cap.relatedRoutes) {
        if (!m.boundaries.routes.includes(route)) {
          findings.push(
            finding({
              ruleId: "invalid-route-ownership",
              severity: "ownership-conflict",
              moduleId: id,
              subject: route,
              message: `Capability "${cap.capabilityId}" references route "${route}" which module "${id}" does not claim.`,
            }),
          );
        }
      }
    }

    /* ---- shared ownership ------------------------------------------------ */
    for (const shared of m.sharedOwnership) {
      if (shared.ownership === "shared" && !shared.primaryOwner?.trim()) {
        findings.push(
          finding({
            ruleId: "invalid-shared-capability-ownership",
            severity: "ownership-conflict",
            moduleId: id,
            subject: shared.ref,
            message: `Shared asset "${shared.ref}" has no primary owner.`,
          }),
        );
      }
      if (shared.ownership === "shared" && shared.consumingModules.length === 0) {
        findings.push(
          finding({
            ruleId: "invalid-shared-capability-ownership",
            severity: "warning",
            moduleId: id,
            subject: shared.ref,
            message: `Shared asset "${shared.ref}" declares no consuming modules; it may be module-owned.`,
          }),
        );
      }
    }
  }

  /* ---- cross-module uniqueness ------------------------------------------ */
  const allCapabilityIds = manifests.flatMap((m) =>
    m.capabilities.map((c) => c.capabilityId),
  );
  for (const capId of dupes(allCapabilityIds)) {
    findings.push(
      finding({
        ruleId: "duplicate-capability-id",
        severity: "error",
        moduleId: null,
        subject: capId,
        message: `Capability ID "${capId}" is declared more than once across the registry.`,
      }),
    );
  }

  const claim = (
    pick: (m: ModuleManifest) => readonly string[],
    ruleId: ValidationFinding["ruleId"],
    label: string,
  ) => {
    const owners = new Map<string, string[]>();
    for (const m of manifests) {
      for (const value of pick(m)) {
        owners.set(value, [...(owners.get(value) ?? []), m.identity.moduleId]);
      }
    }
    for (const [value, claimants] of owners) {
      if (claimants.length > 1) {
        findings.push(
          finding({
            ruleId,
            severity: "ownership-conflict",
            moduleId: null,
            subject: value,
            message: `${label} "${value}" is claimed by: ${claimants.join(", ")}.`,
          }),
        );
      }
    }
  };

  claim((m) => m.boundaries.routes, "invalid-route-ownership", "Route");
  claim((m) => m.boundaries.databaseEntities, "duplicate-database-ownership", "Database entity");
  claim((m) => m.boundaries.workflowIds, "duplicate-workflow-ownership", "Workflow");

  /* ---- reference existence ---------------------------------------------- */
  const checkRefs = (
    values: readonly string[],
    pool: readonly string[] | undefined,
    ruleId: ValidationFinding["ruleId"],
    moduleId: string,
    label: string,
  ) => {
    if (!pool) {
      if (values.length > 0) {
        findings.push(
          finding({
            ruleId,
            severity: "unable-to-verify",
            moduleId,
            subject: label,
            message: `No known ${label} list supplied; ${values.length} reference(s) could not be verified.`,
          }),
        );
      }
      return;
    }
    for (const value of values) {
      if (!pool.includes(value)) {
        findings.push(
          finding({
            ruleId,
            severity: "missing-reference",
            moduleId,
            subject: value,
            message: `${label} "${value}" declared by "${moduleId}" was not found.`,
          }),
        );
      }
    }
  };

  for (const m of manifests) {
    const id = m.identity.moduleId;
    checkRefs(m.boundaries.routes, known.routes, "invalid-route-ownership", id, "route");
    checkRefs(m.boundaries.sourcePaths, known.sourcePaths, "missing-referenced-file", id, "source path");
    checkRefs(m.boundaries.databaseEntities, known.databaseEntities, "missing-database-entity", id, "database entity");
    checkRefs(m.boundaries.workflowIds, known.workflows, "missing-workflow", id, "workflow");
    checkRefs(m.boundaries.permissionIds, known.permissions, "missing-permission", id, "permission");
  }

  /* ---- unregistered implementation -------------------------------------- */
  if (known.routes) {
    const claimed = new Set(manifests.flatMap((m) => m.boundaries.routes));
    for (const route of known.routes) {
      if (!claimed.has(route)) {
        findings.push(
          finding({
            ruleId: "unregistered-implementation",
            severity: "warning",
            moduleId: null,
            subject: route,
            message: `Route "${route}" exists in the application but is not claimed by any module manifest.`,
          }),
        );
      }
    }
  }

  const errorCount = findings.filter((f) => f.severity === "error").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  const conflictCount = findings.filter((f) => f.severity === "ownership-conflict").length;

  return {
    moduleCount: manifests.length,
    capabilityCount: allCapabilityIds.length,
    findings,
    errorCount,
    warningCount,
    conflictCount,
    ok: errorCount === 0 && conflictCount === 0,
  };
}
