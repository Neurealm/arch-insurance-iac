// Traditional NOC — Global Optical Operations Center domain types.
// All data is deterministic synthetic demonstration data.

export type OperationalStatus = "healthy" | "degraded" | "critical" | "maintenance";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type IncidentPhase =
  | "Detected" | "Triaged" | "Investigating" | "Mitigating" | "Monitoring" | "Resolved";

export type Severity = "Critical" | "Major" | "Minor" | "Informational";

export interface OpticalTerminal {
  id: string;
  name: string;
  city: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  status: OperationalStatus;
  availability: number;
  activeAlarms: number;
  connectedLinks: number;
  customersAffected: number;
  weatherCondition?: string;
  lastTelemetryAt: string;
  powerIssue?: boolean;
  connectivityIssue?: boolean;
  alignmentIssue?: boolean;
  telemetryDelaySec: number;
}

export interface OpticalLink {
  id: string;
  name: string;
  sourceTerminalId: string;
  targetTerminalId: string;
  region: string;
  domain: string;
  status: OperationalStatus;
  capacityGbps: number;
  utilizationPercent: number;
  linkMarginDb: number;
  availability: number;
  activeAlarms: number;
  customersAffected: number;
  incidentId?: string;
  riskLevel: RiskLevel;
  weatherExposed: boolean;
  receivedPowerDbm: number;
  transmitPowerDbm: number;
  bitErrorRate: string;
  packetLossPercent: number;
  latencyMs: number;
  alignmentState: "Nominal" | "Drifting" | "Realigning" | "Locked";
}

export interface CustomerImpactRecord {
  id: string;
  customer: string;
  enterprise: boolean;
  service: string;
  region: string;
  severity: Severity;
  durationMinutes: number;
  affectedTrafficGbps: number;
  slaMinutesAtRisk: number;
  estimatedRestoration: string;
  state: "Degraded" | "Unavailable";
  linkIds: string[];
}

export interface OperationalIncident {
  id: string;
  title: string;
  severity: Severity;
  service: string;
  region: string;
  customersAffected: number;
  startedAt: string;
  durationMinutes: number;
  commander: string;
  technicalOwner: string;
  phase: IncidentPhase;
  estimatedRestoration: string;
  status: "Open" | "Monitoring" | "Resolved";
  hypothesis: string;
  affectedServices: string[];
  affectedLinkIds: string[];
  affectedTerminalIds: string[];
  actionsCompleted: string[];
  nextActions: string[];
  escalations: string[];
  communications: string;
  timeline: { at: string; event: string; actor: string }[];
}

export interface LeadershipAction {
  id: string;
  priority: "Critical" | "High" | "Medium";
  issue: string;
  impact: string;
  durationMinutes: number;
  owner: string;
  nextAction: string;
  decisionDeadlineMinutes: number;
  incidentId?: string;
  region: string;
}

export interface EmergingRisk {
  id: string;
  linkId: string;
  linkName: string;
  region: string;
  driver: string;
  currentStatus: OperationalStatus;
  probabilityPercent: number;
  expectedImpact: string;
  timeToThresholdHours: number;
  preparation: string;
  level: RiskLevel;
}

export interface MaintenanceRecord {
  id: string;
  kind: "Active" | "Upcoming" | "Recent change";
  region: string;
  affectedLinkIds: string[];
  affectedServices: string[];
  customerExposure: number;
  startTime: string;
  endTime: string;
  owner: string;
  risk: RiskLevel;
  status: string;
  rollbackReadiness: "Ready" | "Partial" | "Not required";
}

export interface WeatherExposure {
  id: string;
  condition: string;
  measure: string;
  region: string;
  linkId: string;
  linkName: string;
  linkMarginDb: number;
  customersAffected: number;
  level: RiskLevel;
  expectedDurationHours: number;
  recommendation: string;
}

export interface RegionScorecard {
  region: string;
  availability: number;
  customersAffected: number;
  criticalIncidents: number;
  degradedLinks: number;
  offlineTerminals: number;
  capacityPressurePercent: number;
  weatherExposedLinks: number;
  changeRiskPercent: number;
}

export interface TrafficPoint {
  time: string;
  trafficTbps: number;
  capacityTbps: number;
  utilizationPercent: number;
}

export interface ShiftHandoff {
  currentShift: string;
  outgoingLead: string;
  incomingLead: string;
  openIncidents: number;
  pendingEscalations: number;
  unacknowledgedAlarms: number;
  maintenanceInProgress: number;
  actionsDueNextHour: string[];
  concerns: string[];
}

export interface OperationsFilters {
  timeWindow: string;
  region: string;
  country: string;
  domain: string;
  severity: string;
  customer: string;
  service: string;
  site: string;
  terminal: string;
  linkStatus: string;
  incidentStatus: string;
  maintenanceStatus: string;
}

export type ViewMode = "CTO View" | "NOC Director View";
