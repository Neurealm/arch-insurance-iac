// Canonical types for the Customer Health Dashboard (customer-facing cloud
// service health experience). These models intentionally separate the
// *underlying infrastructure condition* from the *customer impact*.

export type HealthStatus =
  | "healthy"
  | "advisory"
  | "degraded"
  | "at-risk"
  | "incident"
  | "info";

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
  timeline: TimelineEntry[];
  technical: TechnicalDetail[];
  /** Optional headline figures rendered as a compact metric grid in the drawer. */
  metrics?: DetailMetric[];
  /** Optional structured decomposition (services, deployments, dependencies…). */
  groups?: DetailGroup[];
  /** Optional deployment-specific decomposition (customer-first deployment view). */
  deployment?: DeploymentDetail;
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
}

export interface ServiceEvent {
  id: string;
  kind: "Advisory" | "Incident" | "Maintenance" | "Information";
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
}

export interface RegionRow {
  id: string;
  name: string;
  status: HealthStatus;
  note: string;
  x: number;
  y: number;
  contextId: string;
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

export interface RiskSignal {
  id: string;
  label: string;
  level: "Low" | "Moderate" | "Elevated" | "High";
  status: HealthStatus;
  spark: number[];
  contextId: string;
}

export interface ChangeRecord {
  id: string;
  title: string;
  window: string;
  potentialImpact: "None" | "Low" | "Moderate";
  kind: "Provider maintenance" | "Platform update";
  contextId: string;
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
