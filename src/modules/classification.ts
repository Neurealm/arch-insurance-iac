/**
 * Stage 3 — classification of unregistered implementation.
 *
 * Every unregistered item produced by the Stage 2 report is given exactly one
 * classification. Rules are applied in a fixed order and each one records the
 * evidence it fired on, so a disposition can always be argued with.
 *
 * Two hard rules:
 *   1. Low-confidence items are classified `unable-to-determine` and flagged for
 *      human review — never pushed into a module to make a number look better.
 *   2. Anything matching the shared or platform registry is classified there, so
 *      it is not counted as a module capability.
 */

import { buildUnregisteredReport } from "./inventory";
import { IMPLEMENTATION_INVENTORY } from "./generated/implementationInventory";
import { APPLICATION_ROUTES } from "./generated/routeTable";
import { getModules } from "./registry";
import { SHARED_CAPABILITIES } from "./shared/sharedCapabilities";
import { PLATFORM_CAPABILITIES } from "./platform/platformCapabilities";
import type { ConfidenceLevel } from "./types";
import type { UnregisteredImplementationReport, UnregisteredItem } from "./routeTypes";
import type {
  ClassificationKind,
  ClassificationReport,
  ClassifiedItem,
  OwnershipClassification,
} from "./classificationTypes";

/** Registered module IDs are resolved at call time, not baked in. */
const registeredIds = () => new Set(getModules().map((m) => m.identity.moduleId));

/**
 * Candidate module IDs with enough structural evidence to be worth proposing.
 * Mirrors the cluster list in `scripts/scan-domain-signals.mjs`.
 */
export const CANDIDATE_MODULE_IDS: readonly string[] = [
  "commercial",
  "runops",
  "avep",
  "cae",
  "platform",
  "practice-library",
  "coworkers",
  "sre-data-orchestration",
  "agentic-ai-studio",
  "carve-out",
  "questionnaires",
  "crm",
  "etdm",
  "itsm",
];

/** Tokens that identify a named customer or engagement rather than a product. */
const CUSTOMER_TOKENS = ["contoso", "momentous", "meridian"];

const DEMO_TOKENS = ["demo", "prototype", "placeholder", "sample", "mock", "story"];
const EXPERIMENTAL_TOKENS = ["_dev", "experiment", "sandbox", "scratch"];

const includesToken = (ref: string, tokens: readonly string[]) => {
  const lower = ref.toLowerCase();
  return tokens.some((t) => lower.includes(t));
};

const sharedMatch = (ref: string) =>
  SHARED_CAPABILITIES.find((c) => c.sourcePaths.some((p) => ref.startsWith(p)) || c.routes.includes(ref));

const platformMatch = (ref: string) =>
  PLATFORM_CAPABILITIES.find((c) => c.sourcePaths.some((p) => ref.startsWith(p)) || c.routes.includes(ref));

/** Routes rendering a component that another route also renders. */
function duplicateRoutePaths(): Set<string> {
  const byComponent = new Map<string, string[]>();
  for (const r of APPLICATION_ROUTES) {
    if (!r.componentFile || r.isLayout || r.isIndex) continue;
    byComponent.set(r.componentFile, [...(byComponent.get(r.componentFile) ?? []), r.path]);
  }
  const dupes = new Set<string>();
  for (const paths of byComponent.values()) {
    if (paths.length > 1) paths.forEach((p) => dupes.add(p));
  }
  return dupes;
}

function referencingModules(ref: string): string[] {
  return getModules()
    .filter((m) =>
      [
        ...m.boundaries.sourcePaths,
        ...m.boundaries.componentRefs,
        ...m.boundaries.serviceRefs,
        ...m.boundaries.routes,
      ].some((d) => ref === d || ref.startsWith(d.replace(/\*+$/, ""))),
    )
    .map((m) => m.identity.moduleId);
}

interface Verdict {
  classification: ClassificationKind;
  ownership: OwnershipClassification;
  confidence: ConfidenceLevel;
  evidence: string[];
  humanReview: boolean;
  action: ClassifiedItem["recommendedAction"];
  owner?: string | null;
}

function classifyOne(item: UnregisteredItem, dupes: Set<string>): Verdict {
  const ref = item.ref;
  const isRoute = item.implementationType === "route";
  const isNav = item.implementationType === "navigation-entry";

  /* 1. Registry membership wins — never counted as module capability. */
  const platform = platformMatch(ref);
  if (platform) {
    return {
      classification: "platform-capability",
      ownership: "platform-owned",
      confidence: "high",
      evidence: [`Covered by platform capability ${platform.platformCapabilityId}`],
      humanReview: false,
      action: "register-in-platform-registry",
      owner: "platform",
    };
  }
  const shared = sharedMatch(ref);
  if (shared) {
    return {
      classification: "shared-capability",
      ownership: "shared",
      confidence: shared.primaryOwner === "unassigned" ? "medium" : "high",
      evidence: [
        `Covered by shared capability ${shared.sharedCapabilityId}`,
        `Consumed by: ${shared.consumingModules.join(", ") || "unknown"}`,
        shared.primaryOwner === "unassigned" ? "No primary owner agreed" : `Owner: ${shared.primaryOwner}`,
      ],
      humanReview: shared.primaryOwner === "unassigned",
      action: "register-in-shared-registry",
      owner: shared.primaryOwner === "unassigned" ? null : shared.primaryOwner,
    };
  }

  /* 2. Non-product implementation. */
  if (/\/test\/|\.test\.|setup\.ts$|\/__mocks__\//.test(ref)) {
    return {
      classification: "test-support",
      ownership: "platform-owned",
      confidence: "high",
      evidence: ["Test harness or fixture path"],
      humanReview: false,
      action: "no-action",
    };
  }
  if (item.implementationType === "utility" || /^src\/lib\//.test(ref)) {
    return {
      classification: "utility-or-common-library",
      ownership: "platform-owned",
      confidence: "high",
      evidence: ["Common library path with no module-specific domain logic"],
      humanReview: false,
      action: "register-in-platform-registry",
    };
  }
  if (includesToken(ref, EXPERIMENTAL_TOKENS)) {
    return {
      classification: "experimental",
      ownership: "unassigned",
      confidence: "medium",
      evidence: ["Developer-only or experimental path token"],
      humanReview: true,
      action: "manual-review-required",
    };
  }
  if (includesToken(ref, CUSTOMER_TOKENS)) {
    return {
      classification: "customer-specific",
      ownership: "unassigned",
      confidence: "medium",
      evidence: ["Path or identifier names a specific customer or engagement"],
      humanReview: true,
      action: "manual-review-required",
    };
  }
  if (includesToken(ref, DEMO_TOKENS)) {
    return {
      classification: "demonstration-or-prototype",
      ownership: "unassigned",
      confidence: "medium",
      evidence: ["Path indicates demonstration, prototype or placeholder content"],
      humanReview: true,
      action: "manual-review-required",
    };
  }

  /* 3. Lifecycle problems. */
  if (isRoute && dupes.has(ref)) {
    return {
      classification: "duplicate",
      ownership: "unassigned",
      confidence: "high",
      evidence: ["Another route renders the same page component"],
      humanReview: true,
      action: "manual-review-required",
    };
  }
  if (item.activity === "unused" || item.activity === "unreachable") {
    return {
      classification: "orphaned",
      ownership: "unassigned",
      confidence: item.activity === "unused" ? "medium" : "low",
      evidence: [
        item.activity === "unused"
          ? "No import sites and no route reference"
          : "No navigation entry and no inbound link found (may be composed at runtime)",
      ],
      humanReview: true,
      action: "remove-if-confirmed-unused",
    };
  }

  /* 4. Ownership by cluster. */
  const likely = item.likelyModuleId;
  if (likely && registeredIds().has(likely)) {
    return {
      classification: "existing-module-extension",
      ownership: "module-owned",
      confidence: "medium",
      evidence: [`Source cluster maps to registered module ${likely}`],
      humanReview: false,
      action: "add-to-existing-module-manifest",
      owner: likely,
    };
  }
  if (likely && CANDIDATE_MODULE_IDS.includes(likely)) {
    return {
      classification: "candidate-product-module",
      ownership: "unassigned",
      confidence: "medium",
      evidence: [`Source cluster maps to candidate module ${likely}`],
      humanReview: false,
      action: "create-new-module",
      owner: likely,
    };
  }

  /* 5. Nothing conclusive. */
  return {
    classification: "unable-to-determine",
    ownership: "unassigned",
    confidence: isNav ? "low" : "unable-to-verify",
    evidence: [
      "No registry match, no cluster match and no lifecycle signal",
      ...(isNav ? ["Navigation entry alone is not evidence of a module"] : []),
    ],
    humanReview: true,
    action: "manual-review-required",
  };
}

const EMPTY_CLASSIFICATION_COUNTS: Record<ClassificationKind, number> = {
  "candidate-product-module": 0,
  "existing-module-extension": 0,
  "shared-capability": 0,
  "platform-capability": 0,
  "customer-specific": 0,
  experimental: 0,
  "demonstration-or-prototype": 0,
  "test-support": 0,
  "utility-or-common-library": 0,
  deprecated: 0,
  orphaned: 0,
  duplicate: 0,
  "unable-to-determine": 0,
};

export function classifyUnregistered(
  report: UnregisteredImplementationReport = buildUnregisteredReport(),
): ClassificationReport {
  const dupes = duplicateRoutePaths();
  const inventoryByRef = new Map(IMPLEMENTATION_INVENTORY.map((i) => [i.ref, i]));
  const routeByPath = new Map(APPLICATION_ROUTES.map((r) => [r.path, r]));

  const items: ClassifiedItem[] = report.items.map((item) => {
    const verdict = classifyOne(item, dupes);
    const isRoute = item.implementationType === "route";
    const isNav = item.implementationType === "navigation-entry";
    const route = isRoute ? routeByPath.get(item.ref) ?? null : null;
    const inv = inventoryByRef.get(item.ref);

    return {
      itemId: `${item.implementationType}:${item.ref}`,
      ref: item.ref,
      filePath: isRoute ? route?.componentFile ?? null : isNav ? null : item.ref,
      implementationType: item.implementationType,
      relatedRoute: isRoute
        ? item.ref
        : APPLICATION_ROUTES.find((r) => r.componentFile === item.ref)?.path ?? null,
      relatedNavigationId: isNav ? item.ref : null,
      referencingModules: referencingModules(item.ref),
      likelyOwner: verdict.owner ?? null,
      ownershipClassification: verdict.ownership,
      classification: verdict.classification,
      confidence: verdict.confidence,
      evidence: [
        ...verdict.evidence,
        ...item.evidence,
        ...(inv?.usesSupabase ? ["Direct Supabase usage observed"] : []),
      ],
      recommendedAction: verdict.action,
      humanReviewRequired: verdict.humanReview,
    };
  });

  const byClassification = { ...EMPTY_CLASSIFICATION_COUNTS };
  const byOwnership: Record<OwnershipClassification, number> = {
    "module-owned": 0,
    shared: 0,
    "platform-owned": 0,
    unassigned: 0,
  };
  for (const i of items) {
    byClassification[i.classification] += 1;
    byOwnership[i.ownershipClassification] += 1;
  }

  return {
    items,
    byClassification,
    byOwnership,
    humanReviewCount: items.filter((i) => i.humanReviewRequired).length,
    unableToDetermineCount: byClassification["unable-to-determine"],
  };
}
