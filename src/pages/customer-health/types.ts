// Canonical types for the Customer Health Dashboard (customer-facing cloud
// service health experience). These models intentionally separate the
// *underlying infrastructure condition* from the *customer impact*.

export type HealthStatus =
  | "healthy"
  | "advisory"
  | "degraded"
  | "at-risk"
  | "incident"
  /** Customer-visible loss of service. */
  | "disrupted"
  /** Telemetry is older than the freshness budget — health cannot be confirmed. */
  | "stale"
  /** Telemetry never arrived / object is not reporting. */
  | "unknown"
  /** No telemetry exists for this object (e.g. nothing deployed here). */
  | "no-data"
  /** Health is being (re)established. */
  | "loading"
  /** A previous condition has closed with no remaining impact. */
  | "resolved"
  | "info";

/**
 * Freshness of the telemetry behind a health verdict. When `state` is
 * `"stale"` the UI must NEVER present the object as Healthy; it shows
 * "Health verification delayed" plus when health was last confirmed.
 */
export interface TelemetryFreshness {
  state: "fresh" | "stale" | "missing";
  /** Human phrase, e.g. "7 minutes ago". */
  lastConfirmedHealthy?: string;
  /** Why verification is delayed, in customer language. */
  note?: string;
}

/** Customer-facing impact verdict shown at the top of every drawer. */
export type ImpactLevel =
  | "NO CURRENT IMPACT"
  | "POTENTIAL IMPACT"
  | "DEGRADED EXPERIENCE"
  | "SERVICE IMPACT";

export interface TimelineEntry {
  /** Detected / Validated / Action initiated / Provider contacted / ... */
  stage:
    | "Detected"
    | "Validated"
    | "Action initiated"
    | "Provider contacted"
    | "Latest observation"
    | "Next update";
  at: string;
  note: string;
  /** Future/unreached steps render muted. */
  pending?: boolean;
}

export interface SignalReading {
  label: string;
  value: string;
  /** Plain-language interpretation of the reading. */
  interpretation: string;
  status: HealthStatus;
}

/** The five questions every drawer must answer above the fold. */
export interface AnswerBand {
  /** What is true right now. */
  currentImpact: string;
  /** What could become true — always probabilistic, never certain. */
  potentialRisk: string;
  /** What we / the provider are doing. */
  providerAction: string;
  /** What the customer must do (or that nothing is required). */
  customerAction: string;
}

export interface TechnicalDetail {
  label: string;
  value: string;
}

/** Everything the universal CustomerImpactDrawer needs to render. */
export interface CustomerImpactContext {
  id: string;
  title: string;
  subtitle?: string;
  /** Underlying infrastructure condition (may differ from customer impact). */
  infrastructureStatus: HealthStatus;
  infrastructureNote: string;
  /** Customer-facing verdict. */
  impact: ImpactLevel;
  whatIsHappening: string;
  affected: { label: string; detail: string; status: HealthStatus }[];
  signals: SignalReading[];
  whatIsBeingDone: string[];
  customerAction: string;
  /** True when the action is simply "No action required". */
  noActionRequired: boolean;
  /** Optional explicit split of current impact vs. potential risk and actions. */
  answers?: Partial<AnswerBand>;
  /** Optional telemetry freshness for this object. */
  telemetry?: TelemetryFreshness;
  timeline: TimelineEntry[];
  technical: TechnicalDetail[];
  /** Optional headline figures rendered as a compact metric grid in the drawer. */
  metrics?: DetailMetric[];
  /** Optional structured decomposition (services, deployments, dependencies…). */
  groups?: DetailGroup[];
  /** Optional deployment-specific decomposition (customer-first deployment view). */
  deployment?: DeploymentDetail;
  /** Optional supporting-dependency decomposition. */
  dependency?: DependencyDetail;
  /** Optional event decomposition. */
  event?: EventDetail;
  /** Optional region decomposition (infrastructure vs. customer service health). */
  region?: RegionDetail;
  /** Optional forward-looking risk decomposition. */
  risk?: RiskDetail;
  /** Optional service level objective decomposition. */
  slo?: SloDetail;
  /** Optional planned-change decomposition. */
  change?: ChangeDetail;
}

/** Compact figure rendered in the drawer's metric grid. */
export interface DetailMetric {
  label: string;
  value: string;
  caption?: string;
  status?: HealthStatus;
}

/** One decomposed entity (a service, a deployment, a dependency…). */
export interface DetailRow {
  label: string;
  status: HealthStatus;
  /** Customer-facing verdict for this specific entity. */
  impact?: ImpactLevel;
  note?: string;
  fields: { label: string; value: string; status?: HealthStatus }[];
}

export interface DetailGroup {
  title: string;
  caption?: string;
  rows: DetailRow[];
}

export interface KpiTile {
  id: string;
  label: string;
  /** The customer question this card answers. */
  question?: string;
  value: string;
  caption: string;
  status: HealthStatus;
  icon: "shield" | "layers" | "box" | "trend" | "bell" | "warning" | "cloud";
  contextId: string;
  /** Small breakdown chips rendered under the value. */
  facets?: { label: string; value: string; status: HealthStatus }[];
}


export interface DeploymentCard {
  id: string;
  name: string;
  region: string;
  nodes: number;
  tier: string;
  availability: string;
  status: HealthStatus;
  alerts: string;
  spark: number[];
  contextId: string;
  /** Environment classification shown on the card (Production / DR / Non-production). */
  environment?: string;
  /** Human description of the resource footprint, e.g. "8 nodes · 46 resources". */
  resources?: string;
  /** Number of active advisories/alerts against this deployment. */
  advisoryCount?: number;
  /** Freshness of the telemetry behind this card's status. */
  telemetry?: TelemetryFreshness;
  /** Compact floating summary shown on hover. */
  hover?: {
    overallHealth: string;
    customerImpact: string;
    availability: string;
    infrastructureRisk: string;
    advisories: string;
    lastHealthChange: string;
  };
}

/** One clickable supporting-infrastructure layer inside a deployment drawer. */
export interface InfraLayerRef {
  label: string;
  status: HealthStatus;
  note: string;
  contextId: string;
}

/** A node in the compact deployment dependency tree. */
export interface DependencyTreeNode {
  id: string;
  label: string;
  depth: number;
  status: HealthStatus;
  note: string;
  contextId: string;
}

/** Deployment-specific drawer payload rendered above the generic sections. */
export interface DeploymentDetail {
  headline: string;
  service: {
    health: HealthStatus;
    healthLabel: string;
    availability: string;
    customerImpact: string;
    sloStatus: string;
    sloStatusLevel: HealthStatus;
  };
  infrastructure: InfraLayerRef[];
  impact: {
    statement: string;
    current: string;
    potential: string;
    functionality: string;
    action: string;
    level: ImpactLevel;
  };
  seeing: string;
  doing: string;
  tree: DependencyTreeNode[];
}

export interface DependencyRow {
  id: string;
  layer: string;
  description: string;
  status: HealthStatus;
  contextId: string;
  /** Indentation depth in the hierarchical dependency list. */
  depth?: number;
  /** Plain-language reason this layer matters to the customer. */
  customerRelevance?: string;
  /** Ids of the dependency rows forming the chain highlighted on hover. */
  chain?: string[];
}

/** Specialised drawer payload for a supporting dependency layer. */
export interface DependencyDetail {
  headline: string;
  conditionLabel: string;
  conditionStatus: HealthStatus;
  impactVerdict: string;
  impactLevel: ImpactLevel;
  affectedDeployments: { name: string; note: string; status: HealthStatus }[];
  signals: { label: string; value: string; status: HealthStatus }[];
  interpretation: string;
  trend: {
    caption: string;
    unit: string;
    baseline: number;
    warning: number;
    series: number[];
  };
  related: { label: string; technical: string; status: HealthStatus; contextId: string }[];
  response: string[];
}

export type EventClassification = "Information" | "Advisory" | "Degradation" | "Incident";

/** Ranking inputs — customer impact leads, infrastructure severity is last. */
export interface EventRanking {
  /** Impact users are experiencing right now, 0 (none) to 3 (full outage). */
  actualImpact: 0 | 1 | 2 | 3;
  /** Impact that could reach users if the condition worsens, 0 to 3. */
  potentialImpact: 0 | 1 | 2 | 3;
  /** How many of the customer's deployments are exposed. */
  exposedDeployments: number;
  /** Duration in minutes. */
  durationMinutes: number;
  /** Underlying infrastructure severity, 0 to 3 — lowest ranking weight. */
  infrastructureSeverity: 0 | 1 | 2 | 3;
}

export interface ServiceEvent {
  id: string;
  kind: EventClassification | "Maintenance";
  title: string;
  started: string;
  updated: string;
  summary: string;
  impactToYou: string;
  affectedDeployment: string;
  affectedDependency: string;
  response: string;
  providerReference: string;
  nextUpdate: string;
  status: HealthStatus;
  contextId: string;
  ranking?: EventRanking;
  customerImpact?: string;
  responseStatus?: string;
  active?: boolean;
}

/** Specialised event drawer payload. */
export interface EventDetail {
  headline: string;
  classification: EventClassification | "Maintenance";
  impactVerdict: ImpactLevel;
  situation: string;
  environment: { name: string; exposure: "Exposed" | "Not exposed"; health: string; status: HealthStatus }[];
  customerExperience: { label: string; value: string; status: HealthStatus }[];
  infrastructureCondition: { label: string; value: string; status: HealthStatus }[];
  actionsUnderway: { label: string; done: boolean }[];
  eventTimeline: { time: string; entry: string }[];
  customerAction: string;
  nextUpdate: string;
  technical: { label: string; value: string }[];
  history: { time: string; entry: string }[];
}

export interface RegionRow {
  id: string;
  name: string;
  /** Legacy combined status — kept for existing callers. */
  status: HealthStatus;
  note: string;
  x: number;
  y: number;
  /** Geographic position used by the world map projection. */
  lat?: number;
  lon?: number;
  contextId: string;
  /** Azure / provider infrastructure condition in this region. */
  infraStatus: HealthStatus;
  infraLabel: string;
  /** Customer service health in this region — independent of infrastructure. */
  serviceStatus: HealthStatus;
  serviceLabel: string;
  /** False when the customer runs nothing in this region. */
  hasDeployment: boolean;
  deploymentCount: number;
  deploymentSummary: string;
  nodes: number;
  activeEvents: number;
  activeEventSummary: string;
  exposure: string;
  potentialImpact: "None" | "Low" | "Moderate" | "High";
  geo: string;
}

/** Region-specific drawer payload rendered above the generic sections. */
export interface RegionDetail {
  headline: string;
  hasDeployment: boolean;
  infrastructure: { status: HealthStatus; label: string; note: string };
  service: { status: HealthStatus; label: string; note: string };
  footprint: string[];
  whatsHappening: string;
  affectsMe: { verdict: ImpactLevel; explanation: string };
  dependencies: { label: string; status: HealthStatus; note: string; contextId?: string }[];
  regionalSignals: { label: string; value: string; status: HealthStatus }[];
  risk: { current: string; potential: string; trend: string; trendStatus: HealthStatus };
  response: string[];
}

export interface SloRow {
  id: string;
  name: string;
  target: string;
  current: string;
  attainment: number;
  errorBudget: number;
  status: HealthStatus;
  contextId: string;
}

export type SloWindow = "24 hours" | "7 days" | "30 days" | "90 days";
export type ReliabilityTrend = "Improving" | "Stable" | "Deteriorating";

export interface SloWindowStats {
  window: SloWindow;
  attainment: string;
  status: HealthStatus;
  /** Customer-impacting time, kept strictly distinct per category. */
  unavailableMinutes: number;
  degradedMinutes: number;
  infrastructureEventMinutes: number;
  customerImpactingEventMinutes: number;
  note: string;
}

export interface SloEventContribution {
  contextId: string;
  title: string;
  classification: string;
  when: string;
  minutes: number;
  budgetPct: number;
  customerImpacting: boolean;
  note: string;
}

export interface SloDetail {
  headline: string;
  target: string;
  current: string;
  statusLabel: string;
  status: HealthStatus;
  meaning: string;
  measurement: string;
  errorBudget: {
    remainingPct: number;
    consumedPct: number;
    remainingPlain: string;
    consumedPlain: string;
    burnRate: string;
    burnRateNote: string;
    projected: string;
    projectedStatus: HealthStatus;
    explanation: string;
  };
  history: SloWindowStats[];
  contributions: SloEventContribution[];
  trend: ReliabilityTrend;
  trendNote: string;
}

export type RiskLevel = "Low" | "Moderate" | "Elevated" | "High";
export type RiskTrend = "Deteriorating" | "Stable" | "Improving";

export interface RiskSignal {
  id: string;
  label: string;
  level: RiskLevel;
  status: HealthStatus;
  spark: number[];
  contextId: string;
  /** Current health of the same area — deliberately independent of risk. */
  currentHealth?: HealthStatus;
  currentHealthLabel?: string;
  trend?: RiskTrend;
  trendNote?: string;
  affectedDeployments?: string[];
  question?: string;
}

/** Forward-looking risk decomposition rendered in the drawer. */
export interface RiskDetail {
  headline: string;
  level: RiskLevel;
  levelStatus: HealthStatus;
  currentImpact: ImpactLevel;
  currentHealthLabel: string;
  currentHealthStatus: HealthStatus;
  /** Correlated contributing signals — each says whether it raises risk. */
  contributingSignals: { label: string; value: string; status: HealthStatus; raisesRisk: boolean }[];
  whatCouldHappen: string;
  estimatedExposure: RiskLevel | "None";
  trend: RiskTrend;
  trendNote: string;
  confidence: number;
  confidenceNote: string;
  affectedDeployments: { name: string; note: string; status: HealthStatus }[];
  preventiveActions: { label: string; done: boolean }[];
  customerAction: string;
  spark: number[];
}

export type ChangeKind =
  | "Azure maintenance"
  | "Platform maintenance"
  | "Infrastructure change"
  | "Service change"
  | "Customer-specific maintenance";

export type ChangeRelevance = "Not relevant to you" | "Informational" | "Relevant" | "Action required";

export interface ChangeRecord {
  id: string;
  title: string;
  window: string;
  potentialImpact: "None" | "Low" | "Moderate";
  kind: ChangeKind;
  contextId: string;
  /** Computed relevance of this change to the customer. */
  relevance: ChangeRelevance;
  region: string;
  deployment: string;
  customerAction: string;
  /** True when the window overlaps the customer's protected business window. */
  inProtectedWindow: boolean;
}

/** Customer-configured window during which changes get elevated attention. */
export interface ProtectedWindow {
  label: string;
  days: string;
  hours: string;
  timezone: string;
  note: string;
}

export interface ChangeDetail {
  headline: string;
  kind: ChangeKind;
  window: string;
  affectsMe: { verdict: string; explanation: string; status: HealthStatus };
  yourEnvironment: { label: string; note: string; status: HealthStatus }[];
  expectedImpact: "None" | "Low" | "Moderate";
  serviceInterruptionExpected: boolean;
  interruptionNote: string;
  resilience: string[];
  customerAction: string;
  actionRequired: boolean;
  timeline: { stage: string; at: string; note: string; pending?: boolean }[];
  validation: { group: string; items: { label: string; state: "Passed" | "Scheduled" | "In progress"; note: string }[] }[];
  protectedWindow?: { overlaps: boolean; note: string };
}

export interface AlertRule {
  id: string;
  name: string;
  scope: string;
  channel: string;
  enabled: boolean;
  lastFired: string;
  contextId: string;
}

export interface ReportItem {
  id: string;
  name: string;
  period: string;
  format: string;
  description: string;
  contextId: string;
}
