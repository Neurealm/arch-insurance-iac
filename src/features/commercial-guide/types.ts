/**
 * Commercial Guide — typed content model.
 *
 * CONTENT WRITING LIMITS (enforced editorially, not at runtime):
 *  - purpose ≤ 90 words
 *  - whyItMatters ≤ 90 words
 *  - moduleConnection ≤ 120 words
 *  - PageSectionGuide.explanation ≤ 100 words
 *  - BusinessRuleGuide.explanation ≤ 80 words
 *  - WorkflowStepGuide.description ≤ 45 words
 *  - CommonMistakeGuide.description ≤ 60 words
 *  - WorkedExampleGuide.narrative ≤ 220 words
 *  - FaqGuide.answer ≤ 90 words
 *  - executiveTakeaway ≤ 120 words
 *
 * Content lives in `content/pages/*` and must never be embedded in components.
 */

export type GuideAudience =
  | "Executive"
  | "Commercial Lead"
  | "Finance"
  | "Delivery"
  | "Sales"
  | "Operations"
  | "Administrator";

export type GuideMode = "executive" | "practitioner" | "administrator";

export type TrainingLevel = "Foundation" | "Intermediate" | "Advanced";

export type LifecycleStage =
  | "Opportunity Qualification"
  | "Commercial Structuring"
  | "Financial Modeling"
  | "Executive Review"
  | "Negotiation"
  | "Delivery Planning"
  | "Mobilization"
  | "Execution"
  | "Operations"
  | "Continuous Improvement";

export type ModelConfidence = "High" | "Medium" | "Low" | "Not Assessed";

export type ConfidenceBasis =
  | "Account data"
  | "Commercial terms"
  | "Staffing assumptions"
  | "Revenue assumptions"
  | "Cost assumptions"
  | "Timing"
  | "Governance approvals"
  | "Source completeness";

export type CommercialReadiness =
  | "Information Complete"
  | "Review Required"
  | "Approval Required"
  | "Ready for Decision"
  | "Not Ready";

export type ImpactArea =
  | "Accounts"
  | "Revenue"
  | "Costs"
  | "EBITDA"
  | "Cash"
  | "Staffing"
  | "Capacity"
  | "Timeline"
  | "Activation"
  | "Governance"
  | "Risk"
  | "Customer outcomes";

export type InterpretationBand = "healthy" | "warning" | "critical";

export type RaciRole = "R" | "A" | "C" | "I";

export interface GuideRelationship {
  /** Upstream pages / systems that feed this page. */
  receivesFrom: string[];
  /** What this page models, validates or calculates. */
  models: string[];
  /** Downstream pages / decisions influenced by this page. */
  feeds: string[];
}

export interface PageSectionGuide {
  id: string;
  title: string;
  /** ≤ 100 words */
  explanation: string;
  /** Matches a `data-guide-target` attribute on the page. */
  targetId?: string;
}

export interface CommercialInputGuide {
  id: string;
  label: string;
  description: string;
  owner?: string;
  source?: string;
  required?: boolean;
}

export interface CommercialOutputGuide {
  id: string;
  label: string;
  description: string;
  consumedBy?: string[];
}

export interface BusinessRuleGuide {
  id: string;
  rule: string;
  /** ≤ 80 words */
  explanation: string;
}

export interface WorkflowStepGuide {
  id: string;
  step: number;
  title: string;
  /** ≤ 45 words */
  description: string;
  role?: string;
}

export interface TeamActivityGuide {
  id: string;
  activity: string;
  role: string;
  cadence?: string;
}

export interface RoleResponsibilityGuide {
  role: string;
  responsibility: string;
}

export interface RaciGuide {
  activity: string;
  assignments: { role: string; raci: RaciRole }[];
}

export interface DecisionGuide {
  id: string;
  decision: string;
  decidedBy?: string;
  evidence?: string;
}

export interface InterpretationGuide {
  band: InterpretationBand;
  label: string;
  criteria: string[];
  action: string;
}

export interface CommonMistakeGuide {
  id: string;
  /** ≤ 60 words */
  description: string;
  correction: string;
}

export interface WorkedExampleGuide {
  id: string;
  title: string;
  /** ≤ 220 words */
  narrative: string;
  steps?: string[];
  result?: string;
}

export interface FaqGuide {
  id: string;
  question: string;
  /** ≤ 90 words */
  answer: string;
}

export interface GlossaryGuide {
  term: string;
  definition: string;
}

export interface RelatedPageGuide {
  pageId: string;
  label: string;
  route: string;
  relationship: "Prerequisite" | "Upstream" | "Downstream" | "Companion";
}

export interface DataQualityGuide {
  dataSources: string[];
  updateFrequency: string;
  knownGaps: string[];
  changeControl: string;
  lineage?: string;
}

export interface GuideOwnership {
  businessOwner?: string;
  commercialOwner?: string;
  technicalOwner?: string;
  executiveApprover?: string;
  primaryUsers?: string[];
  consumersOfOutput?: string[];
}

export interface GuidePrerequisite {
  id: string;
  label: string;
  route?: string;
  detail?: string;
}

export interface DownstreamImpactGuide {
  area: ImpactArea;
  effect: string;
}

export interface ShowOnPageTarget {
  targetId: string;
  label: string;
  description?: string;
}

export interface CommercialGuideContent {
  pageId: string;
  route: string;
  /** `exact` for index/leaf routes, `prefix` when detail routes share the guide. */
  match?: "exact" | "prefix";
  pageTitle: string;
  guideTitle: string;
  audiences: GuideAudience[];
  modes: GuideMode[];
  estimatedReadingMinutes: number;
  trainingLevel: TrainingLevel;
  lastUpdated: string;

  /** Overview */
  purpose: string;
  represents: string;
  whyItMatters: string;
  moduleConnection: string;
  questionsAnswered: string[];
  expectedOutcome: string;
  lifecycleStages: LifecycleStage[];
  prerequisites: GuidePrerequisite[];
  ownership: GuideOwnership;

  /** How it works */
  sections: PageSectionGuide[];
  inputs: CommercialInputGuide[];
  outputs: CommercialOutputGuide[];
  businessRules: BusinessRuleGuide[];
  calculationLogic: string[];
  relationship: GuideRelationship;
  downstreamImpacts: DownstreamImpactGuide[];
  dataQuality: DataQualityGuide;
  modelConfidence: ModelConfidence;
  confidenceBasis: ConfidenceBasis[];
  confidenceGuidance: string;
  commercialReadiness: CommercialReadiness;
  readinessCriteria: string[];

  /** How to use it */
  workflow: WorkflowStepGuide[];
  actionsAvailable: string[];
  teamActivities: TeamActivityGuide[];
  roles: RoleResponsibilityGuide[];
  raci: RaciGuide[];
  reviewRequirements: string[];
  approvalRequirements: string[];
  decisions: DecisionGuide[];
  whatToDoNext: string[];
  relatedPages: RelatedPageGuide[];

  /** Interpretation & training */
  interpretation: InterpretationGuide[];
  commonMistakes: CommonMistakeGuide[];
  bestPractices: string[];
  workedExamples: WorkedExampleGuide[];
  faqs: FaqGuide[];
  glossary: GlossaryGuide[];
  executiveTakeaway: string;
  keyRisks: string[];

  /** Show on page */
  showOnPageTargets: ShowOnPageTarget[];

  /** True while the page still uses the safe fallback guide. */
  isFallback?: boolean;
}

/** Minimal registration used by the foundation build. */
export interface CommercialGuidePageRegistration {
  pageId: string;
  route: string;
  match?: "exact" | "prefix";
  pageTitle: string;
  navLabel?: string;
}
