/**
 * Stage 2 — unregistered implementation report.
 *
 * Compares the scanned implementation inventory (and the reconciled route
 * table) with the declared module manifests, and recommends an action for
 * everything that no manifest covers.
 *
 * Recommendations are advisory. Nothing is deleted, moved or reassigned here.
 */

import { getModules } from "./registry";
import { IMPLEMENTATION_INVENTORY, NAVIGATION_ENTRIES } from "./generated/implementationInventory";
import { reconcileRoutes } from "./routeOwnership";
import type { ModuleManifest, ConfidenceLevel } from "./types";
import type {
  InventoryItem,
  NavigationEntry,
  RecommendedAction,
  UnregisteredImplementationReport,
  UnregisteredItem,
} from "./routeTypes";

/** Path prefixes that belong to the platform rather than to any module. */
const PLATFORM_PATHS = [
  "src/platform/",
  "src/integrations/",
  "src/context/AuthContext",
  "src/components/auth/",
  "src/components/routing/",
  "src/lib/",
  "supabase/functions/",
];

/** Path prefixes shared by several modules. */
const SHARED_PATHS = [
  "src/components/eoc/",
  "src/components/scenario/",
  "src/components/investigation/",
  "src/components/evidence/",
  "src/context/",
  "src/hooks/",
];

/** Well-known implementation roots that map to an obvious future module id. */
const MODULE_HINTS: readonly [RegExp, string][] = [
  [/^src\/pages\/prod-twin\//, "sre"],
  [/^src\/commercial\//, "commercial"],
  [/^src\/runops\//, "runops"],
  [/^src\/avep\/|^src\/silicon\//, "avep"],
  [/^src\/platform\/cae\//, "cae"],
  [/^src\/platform\//, "platform"],
  [/^src\/pages\/practice-library\//, "practice-library"],
  [/^src\/pages\/coworkers\//, "coworkers"],
  [/^src\/pages\/data-orchestration-twin\//, "sre-data-orchestration"],
];

const startsWithAny = (ref: string, prefixes: readonly string[]) =>
  prefixes.some((p) => ref.startsWith(p));

function coveredBy(modules: readonly ModuleManifest[], ref: string): string | null {
  for (const m of modules) {
    const declared = [
      ...m.boundaries.sourcePaths,
      ...m.boundaries.pageIds,
      ...m.boundaries.componentRefs,
      ...m.boundaries.serviceRefs,
    ];
    if (declared.some((d) => ref === d || ref.startsWith(d.replace(/\*+$/, "")))) {
      return m.identity.moduleId;
    }
  }
  return null;
}

function hintModule(ref: string): { moduleId: string | null; confidence: ConfidenceLevel } {
  for (const [re, id] of MODULE_HINTS) {
    if (re.test(ref)) return { moduleId: id, confidence: "medium" };
  }
  return { moduleId: null, confidence: "low" };
}

function recommend(item: InventoryItem, likely: string | null): RecommendedAction {
  if (item.activity === "unused") return "remove-if-confirmed-unused";
  if (startsWithAny(item.ref, PLATFORM_PATHS)) return "register-as-platform-capability";
  if (startsWithAny(item.ref, SHARED_PATHS)) return "register-as-shared-capability";
  if (likely) return "add-to-existing-module-manifest";
  if (item.implementationType === "page") return "create-new-module";
  return "manual-review-required";
}

export interface UnregisteredInput {
  inventory?: readonly InventoryItem[];
  navigation?: readonly NavigationEntry[];
  modules?: readonly ModuleManifest[];
}

export function buildUnregisteredReport(
  input: UnregisteredInput = {},
): UnregisteredImplementationReport {
  const inventory = input.inventory ?? IMPLEMENTATION_INVENTORY;
  const navigation = input.navigation ?? NAVIGATION_ENTRIES;
  const modules = input.modules ?? getModules();

  const items: UnregisteredItem[] = [];
  let registeredItemCount = 0;

  for (const item of inventory) {
    const owner = coveredBy(modules, item.ref);
    if (owner) {
      registeredItemCount += 1;
      continue;
    }
    const likely = hintModule(item.ref);
    items.push({
      ref: item.ref,
      implementationType: item.implementationType,
      likelyModuleId: likely.moduleId,
      confidence: likely.confidence,
      evidence: [
        item.evidence,
        item.usesSupabase ? "Reads or writes Supabase directly" : "No direct Supabase usage",
      ],
      activity: item.activity,
      recommendedAction: recommend(item, likely.moduleId),
    });
  }

  /* Routes ---------------------------------------------------------------- */
  const routeReport = reconcileRoutes({ modules, navigation });
  for (const r of routeReport.routes) {
    if (r.ownership !== "unregistered" && r.ownership !== "unable-to-verify") continue;
    const likely = r.route.componentFile ? hintModule(r.route.componentFile) : { moduleId: null, confidence: "low" as ConfidenceLevel };
    items.push({
      ref: r.route.path,
      implementationType: "route",
      likelyModuleId: likely.moduleId,
      confidence: r.ownership === "unable-to-verify" ? "unable-to-verify" : likely.confidence,
      evidence: [
        `Registered in ${r.route.declaredIn}`,
        r.route.componentFile ? `Renders ${r.route.componentFile}` : "No resolvable page component",
        ...r.notes,
      ],
      activity: r.reachable ? "active" : "unreachable",
      recommendedAction:
        r.ownership === "unable-to-verify"
          ? "manual-review-required"
          : likely.moduleId
            ? "add-to-existing-module-manifest"
            : "create-new-module",
    });
  }

  /* Navigation entries ----------------------------------------------------- */
  const claimedNavIds = new Set(modules.flatMap((m) => m.boundaries.navigationIds));
  for (const nav of navigation) {
    const ownedRoute = routeReport.routes.find((r) => r.route.path === nav.to && r.declaredInManifest);
    if (ownedRoute || (nav.navId && claimedNavIds.has(nav.navId))) continue;
    items.push({
      ref: nav.navId ?? nav.to,
      implementationType: "navigation-entry",
      likelyModuleId: null,
      confidence: "low",
      evidence: [`Declared in ${nav.declaredIn}`, `Targets ${nav.to}`],
      activity: routeReport.routes.some((r) => r.route.path === nav.to) ? "active" : "unable-to-verify",
      recommendedAction: "manual-review-required",
    });
  }

  const byType: Record<string, number> = {};
  for (const i of items) byType[i.implementationType] = (byType[i.implementationType] ?? 0) + 1;

  return {
    scannedItemCount: inventory.length + routeReport.routes.length + navigation.length,
    registeredItemCount,
    items,
    byType,
  };
}

/** Items that appear unused or unreachable, for the orphan report. */
export function orphanedImplementation(
  report: UnregisteredImplementationReport = buildUnregisteredReport(),
): readonly UnregisteredItem[] {
  return report.items.filter((i) => i.activity === "unused" || i.activity === "unreachable");
}
