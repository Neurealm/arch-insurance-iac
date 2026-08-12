/**
 * Stage 2 — route ownership reconciliation.
 *
 * Compares the real application route table (generated from `src/App.tsx`)
 * against the declared module manifests and produces an ownership
 * classification plus validation findings for every route.
 *
 * Pure functions. No side effects, no filesystem access.
 */

import { getModules } from "./registry";
import { APPLICATION_ROUTES } from "./generated/routeTable";
import { LINK_TARGETS, NAVIGATION_ENTRIES } from "./generated/implementationInventory";
import type { ModuleManifest, ValidationFinding } from "./types";
import type {
  ApplicationRoute,
  NavigationEntry,
  RouteOwnership,
  RouteOwnershipClass,
} from "./routeTypes";

/**
 * Route surfaces owned by the platform itself (authentication, tenant
 * administration, shared shells). Declared here until a `platform` manifest
 * exists in Stage 3 — documented in docs/modules/route-ownership-report.md.
 */
export const PLATFORM_ROUTE_PREFIXES: readonly string[] = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/pending-approval",
  "/no-access",
  "/set-password",
  "/complete-profile",
  "/profile",
  "/invitations",
  "/platform",
  "/_dev",
];

/** Route surfaces intentionally shared by more than one module. */
export const SHARED_ROUTE_PREFIXES: readonly string[] = ["/app", "/settings"];

const matchesPrefix = (path: string, prefixes: readonly string[]) =>
  prefixes.some((p) => path === p || path.startsWith(`${p}/`));

const claimsRoute = (m: ModuleManifest, path: string) =>
  m.boundaries.routes.includes(path) ||
  m.boundaries.routePrefixes.some((p) => path === p || path.startsWith(`${p}/`));

export interface ReconcileInput {
  routes?: readonly ApplicationRoute[];
  navigation?: readonly NavigationEntry[];
  modules?: readonly ModuleManifest[];
  /** Files known to exist on disk; when omitted, page existence is unverified. */
  existingFiles?: readonly string[];
  /** Internal link targets found in source, used for reachability. */
  linkTargets?: readonly string[];
}

export interface RouteOwnershipReport {
  routes: readonly RouteOwnership[];
  findings: readonly ValidationFinding[];
  counts: {
    total: number;
    byOwnership: Record<RouteOwnershipClass, number>;
    unregistered: number;
    conflicts: number;
    missingPages: number;
    unreachable: number;
  };
}

export function reconcileRoutes(input: ReconcileInput = {}): RouteOwnershipReport {
  const routes = input.routes ?? APPLICATION_ROUTES;
  const navigation = input.navigation ?? NAVIGATION_ENTRIES;
  const modules = input.modules ?? getModules();
  const existing = input.existingFiles ? new Set(input.existingFiles) : null;
  const links = new Set(input.linkTargets ?? (input.routes ? [] : LINK_TARGETS));

  const findings: ValidationFinding[] = [];
  const pathCounts = new Map<string, number>();
  for (const r of routes) {
    // Layout shells legitimately share a path with their index child.
    if (r.isLayout || r.isIndex) continue;
    pathCounts.set(r.path, (pathCounts.get(r.path) ?? 0) + 1);
  }

  const routePaths = new Set(routes.map((r) => r.path));

  const results: RouteOwnership[] = routes.map((route) => {
    const claimedBy = modules.filter((m) => claimsRoute(m, route.path)).map((m) => m.identity.moduleId);
    const notes: string[] = [];

    const pageExists = route.componentFile
      ? existing
        ? existing.has(route.componentFile)
        : true
      : false;
    if (!route.componentFile && !route.redirectTo) {
      notes.push("Route element could not be resolved to a page file.");
    }

    const navigationEntries = navigation.filter((n) => n.to === route.path);
    const reachable =
      route.isIndex ||
      route.isCatchAll ||
      Boolean(route.redirectTo) ||
      navigationEntries.length > 0 ||
      links.has(route.path) ||
      route.isDynamic ||
      // A child route is reachable from its parent shell's own navigation.
      navigation.some((n) => route.parentPath && n.to.startsWith(`${route.parentPath}/`));

    let ownership: RouteOwnershipClass;
    let moduleId: string | null = null;
    let confidence: RouteOwnership["confidence"] = "high";

    if (route.resolution === "unable-to-verify") {
      ownership = "unable-to-verify";
      confidence = "unable-to-verify";
      notes.push("Route path is computed at runtime; ownership cannot be derived safely.");
    } else if (claimedBy.length > 1) {
      ownership = "ownership-conflict";
      confidence = "low";
    } else if (claimedBy.length === 1) {
      ownership = "module-owned";
      moduleId = claimedBy[0];
    } else if (matchesPrefix(route.path, PLATFORM_ROUTE_PREFIXES)) {
      ownership = "platform-owned";
      moduleId = "platform";
      confidence = "medium";
      notes.push("Classified by platform route policy; no platform manifest exists yet.");
    } else if (matchesPrefix(route.path, SHARED_ROUTE_PREFIXES)) {
      ownership = "shared";
      confidence = "medium";
      notes.push("Classified by shared route policy; no owning manifest exists yet.");
    } else {
      ownership = "unregistered";
      confidence = "low";
    }

    const duplicatePath = (pathCounts.get(route.path) ?? 0) > 1;

    return {
      route,
      moduleId,
      claimedBy,
      ownership,
      declaredInManifest: claimedBy.length > 0,
      pageExists,
      reachable,
      duplicatePath,
      navigationEntries,
      confidence,
      notes,
    };
  });

  /* ---- findings ---------------------------------------------------------- */

  for (const r of results) {
    if (r.ownership === "ownership-conflict") {
      findings.push({
        ruleId: "invalid-route-ownership",
        severity: "ownership-conflict",
        moduleId: null,
        subject: r.route.path,
        message: `Route "${r.route.path}" is claimed by ${r.claimedBy.join(", ")}.`,
      });
    }
    if (r.ownership === "unregistered") {
      findings.push({
        ruleId: "unregistered-implementation",
        severity: "warning",
        moduleId: null,
        subject: r.route.path,
        message: `Route "${r.route.path}" is present in the router but claimed by no module manifest.`,
      });
    }
    if (r.ownership === "unable-to-verify") {
      findings.push({
        ruleId: "invalid-route-ownership",
        severity: "unable-to-verify",
        moduleId: null,
        subject: r.route.path,
        message: `Route generated dynamically in ${r.route.declaredIn}; ownership cannot be determined.`,
      });
    }
    if (!r.pageExists && !r.route.redirectTo && !r.route.isLayout) {
      findings.push({
        ruleId: "missing-referenced-file",
        severity: "missing-reference",
        moduleId: r.moduleId,
        subject: r.route.path,
        message: `Route "${r.route.path}" does not map to an existing page file.`,
      });
    }
    if (!r.reachable && !r.route.isLayout) {
      findings.push({
        ruleId: "unregistered-implementation",
        severity: "warning",
        moduleId: r.moduleId,
        subject: r.route.path,
        message: `Route "${r.route.path}" has no navigation entry and no parent navigation; it may be unreachable.`,
      });
    }
    if (r.duplicatePath) {
      findings.push({
        ruleId: "invalid-route-ownership",
        severity: "warning",
        moduleId: r.moduleId,
        subject: r.route.path,
        message: `Route "${r.route.path}" is registered more than once.`,
      });
    }
  }

  // Manifest routes that the router does not register.
  for (const m of modules) {
    for (const declared of m.boundaries.routes) {
      if (!routePaths.has(declared)) {
        findings.push({
          ruleId: "missing-referenced-file",
          severity: "missing-reference",
          moduleId: m.identity.moduleId,
          subject: declared,
          message: `Module "${m.identity.moduleId}" declares route "${declared}", which is not registered in the application router.`,
        });
      }
    }
    // Route prefix overlap between modules.
    for (const other of modules) {
      if (other === m) continue;
      for (const p of m.boundaries.routePrefixes) {
        if (other.boundaries.routePrefixes.some((q) => q !== p && (q.startsWith(`${p}/`) || p.startsWith(`${q}/`)))) {
          findings.push({
            ruleId: "invalid-route-ownership",
            severity: "ownership-conflict",
            moduleId: m.identity.moduleId,
            subject: p,
            message: `Route prefix "${p}" overlaps a prefix owned by "${other.identity.moduleId}".`,
          });
        }
      }
    }
  }

  // Navigation entries pointing at paths the router does not serve.
  for (const nav of navigation) {
    const served =
      routePaths.has(nav.to) ||
      routes.some((r) => r.isLayout && (nav.to === r.path || nav.to.startsWith(`${r.path}/`)));
    if (!served) {
      findings.push({
        ruleId: "unregistered-implementation",
        severity: "warning",
        moduleId: null,
        subject: nav.to,
        message: `Navigation entry "${nav.label ?? nav.navId ?? nav.to}" (${nav.declaredIn}) points to a path with no matching route.`,
      });
    }
  }

  const byOwnership = {
    "module-owned": 0,
    shared: 0,
    "platform-owned": 0,
    unregistered: 0,
    "ownership-conflict": 0,
    "unable-to-verify": 0,
  } as Record<RouteOwnershipClass, number>;
  for (const r of results) byOwnership[r.ownership] += 1;

  return {
    routes: results,
    findings,
    counts: {
      total: results.length,
      byOwnership,
      unregistered: byOwnership.unregistered,
      conflicts: byOwnership["ownership-conflict"],
      missingPages: results.filter((r) => !r.pageExists && !r.route.redirectTo && !r.route.isLayout).length,
      unreachable: results.filter((r) => !r.reachable && !r.route.isLayout).length,
    },
  };
}

/** Route-to-module matrix, grouped by owner, for reporting. */
export function routeMatrix(report = reconcileRoutes()): Record<string, string[]> {
  const matrix: Record<string, string[]> = {};
  for (const r of report.routes) {
    const key = r.moduleId ?? r.ownership;
    (matrix[key] ??= []).push(r.route.path);
  }
  for (const key of Object.keys(matrix)) matrix[key].sort();
  return matrix;
}
