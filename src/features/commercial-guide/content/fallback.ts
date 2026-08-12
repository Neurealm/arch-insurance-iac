import type { CommercialGuideContent, CommercialGuidePageRegistration } from "../types";

export const FALLBACK_STATUS_LABEL = "Training content pending validation";

export const FALLBACK_PURPOSE =
  "This page represents one part of the deal's connected commercial model. Review its inputs, outputs, ownership, assumptions, and relationships before using its results for a decision.";

export const FALLBACK_WARNING =
  "The detailed page-specific training content for this screen has not yet been validated. Do not rely on this guide as the sole basis for a commercial decision.";

/**
 * Safe fallback guide. It must never fabricate page-specific content:
 * every list is intentionally empty so the UI renders explicit
 * "pending validation" states instead of invented methodology.
 */
export function buildFallbackGuide(
  page: CommercialGuidePageRegistration,
): CommercialGuideContent {
  return {
    pageId: page.pageId,
    route: page.route,
    match: page.match ?? "exact",
    pageTitle: page.pageTitle,
    guideTitle: `${page.pageTitle} — Commercial Guide`,
    audiences: ["Commercial Lead"],
    modes: ["executive", "practitioner", "administrator"],
    estimatedReadingMinutes: 2,
    trainingLevel: "Foundation",
    lastUpdated: "Pending validation",

    purpose: FALLBACK_PURPOSE,
    represents: "",
    whyItMatters: "",
    moduleConnection: "",
    questionsAnswered: [],
    expectedOutcome: "",
    lifecycleStages: [],
    prerequisites: [],
    ownership: {},

    sections: [],
    inputs: [],
    outputs: [],
    businessRules: [],
    calculationLogic: [],
    relationship: { receivesFrom: [], models: [], feeds: [] },
    downstreamImpacts: [],
    dataQuality: {
      dataSources: [],
      updateFrequency: "Pending validation",
      knownGaps: [],
      changeControl: "Pending validation",
    },
    modelConfidence: "Not Assessed",
    confidenceBasis: [],
    confidenceGuidance:
      "Confidence has not been assessed for this page. Evaluate it against the underlying data, commercial terms, and governance approvals before relying on the results.",
    commercialReadiness: "Not Ready",
    readinessCriteria: [],

    workflow: [],
    actionsAvailable: [],
    teamActivities: [],
    roles: [],
    raci: [],
    reviewRequirements: [],
    approvalRequirements: [],
    decisions: [],
    whatToDoNext: [],
    relatedPages: [],

    interpretation: [],
    commonMistakes: [],
    bestPractices: [],
    workedExamples: [],
    faqs: [],
    glossary: [],
    executiveTakeaway: "",
    keyRisks: [],

    showOnPageTargets: [
      { targetId: `${page.pageId}-page`, label: page.pageTitle, description: "Primary page container." },
    ],

    isFallback: true,
  };
}
