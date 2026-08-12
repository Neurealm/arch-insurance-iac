// SRE Based Agentic NOC — typed operational model (Stage 1).

export type NetworkStatus =
  | "healthy"
  | "degraded"
  | "critical"
  | "at-risk"
  | "maintenance"
  | "recovery-active"
  | "validated";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type AgentActivityType =
  | "observing"
  | "investigating"
  | "recommending"
  | "awaiting-approval"
  | "executing"
  | "validating"
  | "learning";

export type ValidationState = "not-started" | "running" | "passed" | "failed";

export type AutonomyPolicy =
  | "observe-only"
  | "recommend-only"
  | "human-approval"
  | "autonomous-with-guardrails";

export interface OpticalTerminal {
  id: string;
  name: string;
  city: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  status: NetworkStatus;
  availability: number;
  sloContribution: number;
  activeAlarms: number;
  connectedLinks: number;
  customersAffected: number;
  services: string[];
  activeSituationIds: string[];
  predictedRiskIds: string[];
  weatherCondition?: string;
  agentActivity?: AgentActivityType;
  lastTelemetryAt: string;
}

export interface OpticalLink {
  id: string;
  name: string;
  sourceTerminalId: string;
  targetTerminalId: string;
  status: NetworkStatus;
  capacityGbps: number;
  utilizationPercent: number;
  linkMarginDb: number;
  bitErrorRate: number;
  packetLossPercent: number;
  availability: number;
  services: string[];
  customersAffected: number;
  situationId?: string;
  riskId?: string;
  riskLevel: RiskLevel;
  weatherExposed: boolean;
  protectedRouteAvailable: boolean;
  fallbackLinkIds: string[];
  currentHypothesis?: string;
  activeActionId?: string;
  validationState?: ValidationState;
  agentActivity?: AgentActivityType;
}

export interface PredictedRisk {
  id: string;
  linkId: string;
  title: string;
  riskLevel: RiskLevel;
  probability: number;
  predictedImpactAt: string;
  primaryDriver: string;
  affectedServices: string[];
  customersAtRisk: number;
  recommendedPreparation: string;
}

export interface AgenticAction {
  id: string;
  title: string;
  linkId?: string;
  terminalId?: string;
  situationId?: string;
  activityType: AgentActivityType;
  autonomyPolicy: AutonomyPolicy;
  progressPercent: number;
  expectedResult: string;
  riskDescription: string;
  rollbackReady: boolean;
  validationState: ValidationState;
  approver: string;
  validationPlan: string;
}

export type SituationSeverity = "Critical" | "Major" | "Minor" | "Informational";
export type SituationPhase =
  | "Detected"
  | "Investigating"
  | "Mitigating"
  | "Recovering"
  | "Monitoring"
  | "Resolved";

export interface Situation {
  id: string;
  title: string;
  severity: SituationSeverity;
  status: "Open" | "Mitigating" | "Monitoring" | "Resolved";
  region: string;
  startedAt: string;
  durationMinutes: number;
  customersAffected: number;
  servicesAffected: string[];
  criticalJourneys: string[];
  sloImpact: string;
  phase: SituationPhase;
  rootCauseHypothesis: string;
  confidence: number;
  currentAction: string;
  validationState: ValidationState;
  linkIds: string[];
}

export interface Hypothesis {
  id: string;
  situationId: string;
  hypothesis: string;
  confidence: number;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  similarIncidents: string[];
  investigationState: "open" | "converging" | "confirmed" | "rejected";
}

export interface SloRecord {
  id: string;
  service: string;
  target: number;
  attainment: number;
  errorBudgetRemaining: number;
  burnRate: number;
  status: "healthy" | "degraded" | "critical";
  owner: string;
  region: string;
}

export interface ServiceReliabilityRecord {
  id: string;
  service: string;
  status: NetworkStatus;
  customers: number;
  availability: number;
  region: string;
  criticalJourney: boolean;
}

export interface CapacityPoint {
  time: string;
  traffic: number;
  availableCapacity: number;
  protectedCapacity: number;
  predictedDemand: number;
}

export interface ChangeRecord {
  id: string;
  title: string;
  window: string;
  risk: RiskLevel;
  predictedSuccess: number;
  affectedServices: number;
  region: string;
}

export interface LearningRecord {
  id: string;
  title: string;
  category: "Post-incident learning" | "Knowledge base update" | "Runbook improvement";
  detail: string;
  createdAt: string;
}

export interface OperationalEvent {
  id: string;
  timestamp: string;
  event: string;
  object: string;
  agent: string;
  result: string;
  confidence: number;
  evidence: string;
  activityType: AgentActivityType;
  region: string;
  validationState: ValidationState;
}

export type ViewMode = "SRE View" | "Executive View";

export interface AgenticFilters {
  timeRange: string;
  region: string;
  country: string;
  customer: string;
  service: string;
  terminal: string;
  link: string;
  situationStatus: string;
  networkStatus: string;
  riskLevel: string;
  agentActivity: string;
  validationState: string;
}

export interface MapLayers {
  terminals: boolean;
  links: boolean;
  customerImpact: boolean;
  predictedRisk: boolean;
  weatherExposure: boolean;
  protectedRoutes: boolean;
  automationActivity: boolean;
  maintenance: boolean;
}
