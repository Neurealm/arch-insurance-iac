/**
 * Stage 2 — types for the reconciliation layer.
 *
 * These describe *observed* application facts (routes, navigation entries,
 * implementation artefacts) as opposed to *declared* module facts, which live
 * in `types.ts`. Reconciliation compares the two.
 */

import type { ConfidenceLevel } from "./types";

/** A route as registered in the real application router. */
export interface ApplicationRoute {
  /** Fully-resolved path, including any parent layout prefix. */
  path: string;
  /** Explicit route ID, if the router ever adopts one. */
  routeId: string | null;
  /** Page (or layout) component rendered by the route. */
  component: string | null;
  /** Repo-relative file backing `component`, when it could be resolved. */
  componentFile: string | null;
  lazy: boolean;
  parentLayout: string | null;
  parentPath: string | null;
  isIndex: boolean;
  isLayout: boolean;
  isDynamic: boolean;
  isCatchAll: boolean;
  /** Wrapper components applied to the element (auth/permission/providers). */
  guards: readonly string[];
  permission: string | null;
  /** Target of a `<Navigate>` element, when the route is a redirect. */
  redirectTo: string | null;
  /** `static` when the path was read literally from source. */
  resolution: "static" | "unable-to-verify";
  declaredIn: string;
}

export interface NavigationEntry {
  navId: string | null;
  label: string | null;
  to: string;
  declaredIn: string;
}

export type ImplementationType =
  | "page"
  | "component"
  | "layout"
  | "hook"
  | "context-provider"
  | "state-store"
  | "service"
  | "api-client"
  | "static-data"
  | "utility"
  | "edge-function"
  | "module"
  | "test";

export type ActivityState = "active" | "unused" | "unreachable" | "unable-to-verify";

export interface InventoryItem {
  ref: string;
  implementationType: ImplementationType;
  consumerCount: number;
  reachableViaRoute: boolean;
  activity: ActivityState;
  usesSupabase: boolean;
  evidence: string;
}

/* -------------------------------------------------------------------------- */
/* Route ownership                                                             */
/* -------------------------------------------------------------------------- */

export type RouteOwnershipClass =
  | "module-owned"
  | "shared"
  | "platform-owned"
  | "unregistered"
  | "ownership-conflict"
  | "unable-to-verify";

export interface RouteOwnership {
  route: ApplicationRoute;
  /** Owning module ID, or null when unregistered/conflicting. */
  moduleId: string | null;
  /** Every module that claims the route (length > 1 means conflict). */
  claimedBy: readonly string[];
  ownership: RouteOwnershipClass;
  declaredInManifest: boolean;
  pageExists: boolean;
  reachable: boolean;
  duplicatePath: boolean;
  navigationEntries: readonly NavigationEntry[];
  confidence: ConfidenceLevel;
  notes: readonly string[];
}

/* -------------------------------------------------------------------------- */
/* Unregistered implementation report                                          */
/* -------------------------------------------------------------------------- */

export type RecommendedAction =
  | "add-to-existing-module-manifest"
  | "register-as-shared-capability"
  | "register-as-platform-capability"
  | "create-new-module"
  | "mark-as-deprecated"
  | "remove-if-confirmed-unused"
  | "manual-review-required";

export interface UnregisteredItem {
  ref: string;
  implementationType: ImplementationType | "route" | "navigation-entry";
  likelyModuleId: string | null;
  confidence: ConfidenceLevel;
  evidence: readonly string[];
  activity: ActivityState;
  recommendedAction: RecommendedAction;
}

export interface UnregisteredImplementationReport {
  scannedItemCount: number;
  registeredItemCount: number;
  items: readonly UnregisteredItem[];
  byType: Readonly<Record<string, number>>;
}

/* -------------------------------------------------------------------------- */
/* Evidence-strength model                                                     */
/* -------------------------------------------------------------------------- */

/**
 * How strongly a capability's behaviour is backed by real implementation.
 * Ordered weakest → strongest; `unable-to-verify` sits outside the order.
 */
export type EvidenceStrength =
  | "visual-only"
  | "static-data"
  | "mock-service"
  | "client-side-functional"
  | "shared-service-backed"
  | "api-backed"
  | "database-backed"
  | "integration-backed"
  | "workflow-backed"
  | "runtime-verified"
  | "unable-to-verify";

export const EVIDENCE_STRENGTH_ORDER: readonly EvidenceStrength[] = [
  "visual-only",
  "static-data",
  "mock-service",
  "client-side-functional",
  "shared-service-backed",
  "api-backed",
  "database-backed",
  "integration-backed",
  "workflow-backed",
  "runtime-verified",
];

/** Where a screen's data actually comes from, traced through the import graph. */
export type DataBacking =
  | "hard-coded-static"
  | "local-fixture"
  | "client-generated-state"
  | "shared-service"
  | "internal-api"
  | "supabase"
  | "edge-function"
  | "external-integration"
  | "unable-to-verify";

export interface EvidenceRecord {
  /** Page file or capability ID the record describes. */
  ref: string;
  route: string | null;
  evidenceStrength: EvidenceStrength;
  dataBacking: readonly DataBacking[];
  /** Indirect dependencies traced through imports. */
  tracedDependencies: readonly string[];
  interactive: boolean;
  evidence: readonly string[];
  /** Shell/auth/telemetry imports inherited by every page — not capability evidence. */
  platformChrome: readonly string[];
  confidence: ConfidenceLevel;
}
