/**
 * Tenant profile domain — strict types that describe an internally consistent
 * operational world per industry. Consumed by DemoOperationsProvider to swap
 * every tenant-scoped fixture atomically when the tenant changes.
 *
 * These types deliberately reference the existing scenario fixture shapes
 * (from src/runops/data/scenario.ts) so the provider adapter contract stays
 * intact and no page needs to be rewritten.
 */

import type {
  Approval, BusinessService, Change, Component, Connector, DigitalWorker,
  Execution, Incident, KnowledgeItem, Problem, Runbook, ScenarioStage, Slo,
  Tenant, EvidenceItem,
} from "@/runops/data/scenario";

/** Industry profile codes recognized by the platform. */
export type IndustryProfileCode =
  | "generic-enterprise"
  | "healthcare-amc"
  | "saas-production"
  | "chip-manufacturing";

/** Profile lifecycle state. */
export type ProfileState = "Active" | "Draft" | "Deactivated";

export type CriticalityLevel = {
  readonly key: string;
  readonly label: string;
  readonly description: string;
};

export type ImpactDimension = {
  readonly key: string;
  readonly label: string;
  readonly description: string;
};

export type HardGuardrail = {
  readonly id: string;
  readonly title: string;
  readonly rule: string;
};

export type StandardsMapping = {
  readonly id: string;
  readonly framework: string;
  readonly control: string;
  readonly appliesTo: string;
  readonly note: string;
  /** Explicit: this is a mapping to how NOVA operates against the framework,
   *  not a certification claim. */
  readonly kind: "mapping";
};

export type MetricDefinition = {
  readonly id: string;
  readonly name: string;
  readonly unit: string;
  readonly description: string;
  readonly source: string;
};

export type GlossaryTerm = {
  readonly term: string;
  readonly expansion?: string;
  readonly industry: IndustryProfileCode | "cross-industry";
  readonly definition: string;
  readonly relatedServiceIds?: readonly string[];
  readonly relatedRunbookIds?: readonly string[];
  readonly standardsRef?: string;
  readonly tooltip: string;
  readonly pronunciation?: string;
};

export type SourceSystemAlias = {
  readonly id: string;
  readonly systemName: string;
  readonly aliasIn: string;
  readonly purpose: string;
};

export type TopologyNodeType = {
  readonly key: string;
  readonly label: string;
  readonly description: string;
};

export type ReadinessCategory = {
  readonly key: string;
  readonly label: string;
  readonly description: string;
};

export type CommunicationsAudience = {
  readonly key: string;
  readonly label: string;
  readonly channelHint: string;
};

export type DesignerNodeTemplate = {
  readonly key: string;
  readonly label: string;
  readonly kind: "diagnose" | "mitigate" | "validate" | "rollback" | "approval" | "evidence";
  readonly description: string;
};

export type ToilCategory = {
  readonly key: string;
  readonly label: string;
  readonly description: string;
};

export type ContributingFactorCategory = {
  readonly key: string;
  readonly label: string;
  readonly description: string;
};

export type ScenarioInjectionDefinition = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  /** Deterministic, reversible through Reset Scenario. */
  readonly reversible: true;
  readonly appliesToServices?: readonly string[];
};

/** IndustryProfile — shared across every tenant that adopts this industry. */
export interface IndustryProfile {
  readonly id: string;
  readonly code: IndustryProfileCode;
  readonly name: string;
  readonly description: string;
  readonly operationalPhilosophy: string;

  // Vocabulary
  readonly journeyLabel: string;
  readonly serviceLabel: string;
  readonly componentLabel: string;
  readonly incidentLabel: string;
  readonly impactLabel: string;
  readonly sloLabel: string;
  readonly errorBudgetLabel: string;

  readonly serviceCategories: readonly string[];
  readonly componentCategories: readonly string[];
  readonly topologyNodeTypes: readonly TopologyNodeType[];

  readonly criticalityLevels: readonly CriticalityLevel[];
  readonly impactDimensions: readonly ImpactDimension[];
  readonly hardGuardrails: readonly HardGuardrail[];
  readonly standardsMappings: readonly StandardsMapping[];
  readonly defaultMetricDefinitions: readonly MetricDefinition[];
  readonly defaultRunbookCategories: readonly string[];
  readonly defaultWorkerCategories: readonly string[];
  readonly defaultConnectorCategories: readonly string[];

  // Extended catalogs consumed by module pages so no page hardcodes an
  // industry list. Optional on the type so older industries can grow into
  // these without breaking the shape; every canonical industry in this
  // build populates them.
  readonly readinessCategories?: readonly ReadinessCategory[];
  readonly communicationsAudiences?: readonly CommunicationsAudience[];
  readonly designerTemplates?: readonly DesignerNodeTemplate[];
  readonly toilCategories?: readonly ToilCategory[];
  readonly postmortemFactorCategories?: readonly ContributingFactorCategory[];
  readonly scenarioInjections?: readonly ScenarioInjectionDefinition[];

  readonly presentationGuidance: string;
  readonly glossary: readonly GlossaryTerm[];

  readonly createdAt: string;
  readonly updatedAt: string;
}

/** TenantOperationalProfile — the specific instantiation of an industry
 *  profile for one tenant, plus the operational fixture bundle. */
export interface TenantOperationalProfile {
  readonly tenantId: string;
  readonly industryProfileId: string;

  readonly displayName: string;
  readonly shortName: string;
  readonly industry: IndustryProfileCode;
  readonly businessDescription: string;
  readonly operatingModel: string;
  readonly operatingHours: string;
  readonly geographicScope: string;

  readonly defaultServiceId: string;
  readonly defaultScenarioId: string;
  readonly defaultStoryId: string;
  readonly defaultEnvironment: "Production" | "Staging" | "Development";
  readonly defaultRegion: string;
  readonly defaultTimeRange: "15m" | "1h" | "6h" | "24h" | "7d" | "30d";

  readonly tenantAccent: string; // token-friendly color hint (e.g. "sky", "emerald")
  readonly dataClassification: string;
  readonly complianceContext: readonly string[];
  readonly operationalPriorities: readonly string[];
  readonly hardGuardrails: readonly HardGuardrail[];
  readonly terminologyOverrides: Readonly<Record<string, string>>;
  readonly scenarioMode: "demonstration" | "connected";
  readonly syntheticDataNotice: string;
  readonly sourceSystemAliases: readonly SourceSystemAlias[];

  readonly profileVersion: string;
  readonly profileState: ProfileState;
}

/** TenantFixtureBundle — the concrete operational data for a tenant that the
 *  existing DemoOperationsProvider consumes. Same shapes as scenario.ts. */
export interface TenantFixtureBundle {
  readonly tenant: Tenant;
  readonly services: readonly BusinessService[];
  readonly components: readonly Component[];
  readonly digitalWorkers: readonly DigitalWorker[];
  readonly slos: readonly Slo[];
  readonly connectors: readonly Connector[];
  readonly runbooksList: readonly Runbook[];
  readonly changesList: readonly Change[];
  readonly knowledgeItems: readonly KnowledgeItem[];
  readonly evidenceItems: readonly EvidenceItem[];
  readonly problemsList: readonly Problem[];
  readonly scenarioStages: readonly ScenarioStage[];

  readonly primaryIncident: Incident;
  readonly primaryChange: Change;
  readonly primaryRunbook: Runbook;
  readonly primaryExecution: Execution;
  readonly primaryApproval: Approval;
  readonly primaryProblemId: string;
  readonly primaryPostmortemId: string;

  readonly executionsList: readonly (Execution & { title: string })[];
  /** Initial audit-log seeds for this tenant. */
  readonly initialAuditLog: readonly {
    id: string; at: string; actor: string; action: string; target: string; detail?: string;
  }[];
  /** Initial notifications for this tenant. */
  readonly initialNotifications: readonly {
    id: string; at: string; kind: "info" | "warning" | "critical";
    title: string; detail?: string; entityRef?: string; route?: string;
  }[];
}

/** Full tenant record: profile metadata + fixture bundle + industry profile. */
export interface TenantProfileRecord {
  readonly profile: TenantOperationalProfile;
  readonly industry: IndustryProfile;
  readonly bundle: TenantFixtureBundle;
}

/** Presentation resolver output — everything a page needs to render
 *  tenant-appropriate labels, glossaries, and impact framing. */
export interface TenantPresentationProfile {
  readonly tenantId: string;
  readonly displayName: string;
  readonly shortName: string;
  readonly industry: IndustryProfileCode;
  readonly industryName: string;
  readonly tenantAccent: string;
  readonly isSyntheticDemo: boolean;
  readonly syntheticDataNotice: string;

  readonly journeyLabel: string;
  readonly serviceLabel: string;
  readonly componentLabel: string;
  readonly incidentLabel: string;
  readonly impactLabel: string;
  readonly sloLabel: string;
  readonly errorBudgetLabel: string;

  readonly criticalityLevels: readonly CriticalityLevel[];
  readonly impactDimensions: readonly ImpactDimension[];
  readonly hardGuardrails: readonly HardGuardrail[];
  readonly standardsMappings: readonly StandardsMapping[];
  readonly metricDefinitions: readonly MetricDefinition[];
  readonly runbookCategories: readonly string[];
  readonly workerCategories: readonly string[];
  readonly connectorCategories: readonly string[];
  readonly topologyNodeTypes: readonly TopologyNodeType[];
  readonly glossary: readonly GlossaryTerm[];
  readonly sourceSystemAliases: readonly SourceSystemAlias[];

  // Extended catalogs surfaced from the industry profile.
  readonly readinessCategories: readonly ReadinessCategory[];
  readonly communicationsAudiences: readonly CommunicationsAudience[];
  readonly designerTemplates: readonly DesignerNodeTemplate[];
  readonly toilCategories: readonly ToilCategory[];
  readonly postmortemFactorCategories: readonly ContributingFactorCategory[];
  readonly scenarioInjections: readonly ScenarioInjectionDefinition[];

  /** Narration templates ready for a future TTS layer to consume without
   *  another refactor. Never contain sensitive record identifiers. */
  readonly narrationTemplates: {
    readonly incidentOpen: string;
    readonly incidentMitigating: string;
    readonly incidentResolved: string;
  };
}

/** Validation report shape returned by validateTenantProfile. */
export type ValidationSeverity = "error" | "warning" | "info";
export interface ValidationFinding {
  readonly severity: ValidationSeverity;
  readonly code: string;
  readonly message: string;
}

/** Per-dimension completeness score used by the Tenant Profile Manager. */
export interface CompletenessDimension {
  readonly key: string;
  readonly label: string;
  /** 0..100 */
  readonly score: number;
  readonly ok: boolean;
  readonly detail: string;
  readonly missing: readonly string[];
}

export interface ValidationReport {
  readonly tenantId: string;
  readonly ok: boolean;
  readonly findings: readonly ValidationFinding[];
  readonly completenessPercent: number;
  readonly dimensions: readonly CompletenessDimension[];
}

