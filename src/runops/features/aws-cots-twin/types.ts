/**
 * AWS COTS Digital Twin — core data model types.
 *
 * These types define the logical entities requested in Prompt 1. Every entity
 * carries `tenant_id` so future tenant-isolation (RLS or scoped repositories)
 * is a drop-in. `configuration` on `AwsResource` stays typed-JSON so
 * service-specific fields do not pollute the common shape.
 */

export type Tenant = { id: string; name: string; slug: string };

export type Environment = "Production" | "Staging" | "Development" | "DR";

export type HealthStatus = "Healthy" | "Warning" | "Critical" | "Unknown";
export type ResourceStatus = "Active" | "Provisioning" | "Stopped" | "Terminated" | "Degraded";
export type Criticality = "Low" | "Standard" | "High" | "Business Critical";

export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";
export type AlertStatus = "Firing" | "Acknowledged" | "Suppressed" | "Resolved";

export type ComplianceStatus = "Compliant" | "Non-Compliant" | "Not-Applicable" | "Unknown";
export type SecurityStatus = "Clean" | "Advisory" | "At Risk" | "Compromised" | "Unknown";
export type BackupStatus = "Protected" | "Partial" | "Unprotected" | "N/A";
export type PatchStatus = "Current" | "Pending" | "Overdue" | "N/A";
export type AutomationEligibility = "Full" | "Partial" | "None";

export type NetworkScope = "public" | "private-app" | "private-db" | "edge" | "hybrid" | "n/a";

// --- Foundation ------------------------------------------------------------

export interface BusinessService {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  owner_team: string;
  business_criticality: Criticality;
  customer_facing: boolean;
}

export interface Application {
  id: string;
  tenant_id: string;
  business_service_id: string;
  name: string;
  vendor: string;
  version: string;
  lifecycle_stage: "Introduce" | "Grow" | "Sustain" | "Retire";
  description: string;
}

export interface AwsAccount {
  id: string;
  tenant_id: string;
  account_number: string;
  alias: string;
  environment: Environment;
  organization_unit: string;
}

export interface AwsRegion {
  id: string;
  tenant_id: string;
  aws_account_id: string;
  code: string; // e.g. us-east-1
  name: string;
}

export interface AvailabilityZone {
  id: string;
  tenant_id: string;
  aws_region_id: string;
  code: string; // e.g. us-east-1a
  name: string;
}

// --- Generalized AWS resource ---------------------------------------------

export type AwsResourceType =
  | "AwsAccount" | "Region" | "AvailabilityZone"
  | "VPC" | "InternetGateway" | "Subnet" | "NatGateway"
  | "RouteTable" | "NetworkAcl" | "SecurityGroup" | "VpcEndpoint"
  | "Route53HostedZone" | "Route53Record"
  | "WafWebAcl" | "Alb" | "AlbListener" | "AlbTargetGroup" | "AcmCertificate"
  | "AutoScalingGroup" | "LaunchTemplate" | "Ami" | "Ec2Instance"
  | "EbsVolume" | "Efs" | "S3Bucket"
  | "RdsInstance" | "RdsSubnetGroup"
  | "IamRole" | "SecretsManagerSecret" | "KmsKey" | "SecurityHub" | "GuardDuty"
  | "SystemsManager" | "CloudWatch" | "CloudWatchLogGroup" | "CloudWatchAlarm"
  | "CloudTrail" | "AwsConfig" | "AwsBackup" | "SnsTopic"
  | "EventBridgeBus" | "EventBridgeRule"
  | "ExternalDependency";

export interface AwsResource {
  id: string;
  tenant_id: string;
  aws_account_id: string;
  parent_resource_id: string | null;
  business_service_id: string;
  application_id: string;
  resource_type: AwsResourceType;
  resource_subtype?: string;
  resource_name: string;
  resource_id: string; // AWS-native identifier
  arn: string;
  region: string;
  availability_zone?: string;
  network_scope: NetworkScope;
  environment: Environment;
  status: ResourceStatus;
  health_status: HealthStatus;
  criticality: Criticality;
  owner: string;
  support_group: string;
  cost_center: string;
  monthly_cost: number;
  currency: "USD";
  configuration: Record<string, unknown>;
  tags: Record<string, string>;
  compliance_status: ComplianceStatus;
  security_status: SecurityStatus;
  backup_status: BackupStatus;
  patch_status: PatchStatus;
  automation_eligibility: AutomationEligibility;
  created_at: string;
  updated_at: string;
  last_discovered_at: string;
  last_configuration_change_at: string;
}

export interface AwsResourceConfiguration {
  id: string;
  tenant_id: string;
  resource_id: string;
  configuration_key: string;
  configuration_value: unknown;
  drift_detected: boolean;
  baseline_value?: unknown;
  captured_at: string;
}

// --- Relationships ---------------------------------------------------------

export type RelationshipType =
  | "routes-to" | "attached-to" | "hosts" | "resolves-to" | "protects"
  | "sends-traffic-to" | "reads-from" | "writes-to" | "depends-on"
  | "monitors" | "logs-to" | "backs-up" | "fails-over-to" | "authenticates-with"
  | "notifies" | "triggers";

export interface ResourceRelationship {
  id: string;
  tenant_id: string;
  source_resource_id: string;
  target_resource_id: string;
  relationship_type: RelationshipType;
  direction: "one-way" | "bidirectional";
  protocol?: string;
  port?: number;
  relationship_status: "Active" | "Degraded" | "Broken" | "Planned";
  criticality: Criticality;
  traffic_rate?: string;
  latency_ms?: number;
  failover_relationship: boolean;
  discovered_by: "seed" | "config" | "flow-log" | "manual";
  last_validated_at: string;
  metadata: Record<string, unknown>;
}

// --- Telemetry -------------------------------------------------------------

export interface TelemetryDefinition {
  id: string;
  resource_type: AwsResourceType;
  metric_namespace: string;
  metric_name: string;
  display_name: string;
  unit: string;
  statistic: "Average" | "Sum" | "Maximum" | "Minimum" | "p95" | "p99";
  period_seconds: number;
  warning_threshold?: number;
  critical_threshold?: number;
  normal_min?: number;
  normal_max?: number;
  higher_is_worse: boolean;
  source: "CloudWatch" | "Synthetic" | "Agent" | "Derived";
}

export interface TelemetryObservation {
  id: string;
  tenant_id: string;
  resource_id: string;
  metric_definition_id: string;
  timestamp: string;
  current_value: number;
  previous_value: number;
  baseline_value: number;
  anomaly_score: number; // 0..1
  trend: "up" | "down" | "flat";
  freshness_status: "Fresh" | "Stale" | "Missing";
  source: "CloudWatch" | "Synthetic" | "Agent" | "Derived";
}

// --- Alerts / Incidents / Changes / Runbooks -------------------------------

export interface Alert {
  id: string;
  tenant_id: string;
  resource_id: string;
  title: string;
  description: string;
  severity: Severity;
  status: AlertStatus;
  category: "Availability" | "Performance" | "Cost" | "Security" | "Compliance" | "Capacity";
  detection_source: string;
  metric_name?: string;
  current_value?: number;
  threshold?: number;
  first_detected_at: string;
  last_detected_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  assigned_team: string;
  assigned_owner?: string;
  business_impact: string;
  probable_cause: string;
  recommended_action: string;
  incident_id?: string;
  change_id?: string;
  runbook_id?: string;
  automation_available: boolean;
  automated_action_status: "Not Started" | "Awaiting Approval" | "Running" | "Completed" | "Failed" | "N/A";
}

export interface Incident {
  id: string;
  tenant_id: string;
  external_id: string;
  title: string;
  severity: Severity;
  status: "Investigating" | "Identified" | "Mitigating" | "Monitoring" | "Resolved";
  service_id: string;
  opened_at: string;
  resolved_at?: string;
  commander: string;
  summary: string;
}

export interface Change {
  id: string;
  tenant_id: string;
  external_id: string;
  title: string;
  type: "Standard" | "Normal" | "Emergency";
  state: "Draft" | "Submitted" | "Approved" | "Scheduled" | "In Progress" | "Complete" | "Cancelled";
  risk: "Low" | "Medium" | "High";
  planned_start: string;
  planned_end: string;
  owner: string;
  affected_resource_ids: string[];
}

export interface Runbook {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  category: "Recovery" | "Capacity" | "Investigation" | "Security" | "Operational";
  applicable_resource_types: AwsResourceType[];
  autonomy_level: "Advisory" | "Guided" | "Semi-Autonomous" | "Autonomous";
  average_duration_minutes: number;
  approvals_required: boolean;
  rollback_supported: boolean;
  last_certified_at: string;
  fitness_score: number; // 0..100
}

export interface AutomationAction {
  id: string;
  tenant_id: string;
  runbook_id: string;
  name: string;
  target_resource_type: AwsResourceType;
  approval_required: boolean;
  rollback_supported: boolean;
  average_duration_seconds: number;
  last_executed_at?: string;
  last_status?: "Succeeded" | "Failed" | "Pending";
}

// --- Security / Compliance / Backup / Cost ---------------------------------

export interface SecurityFinding {
  id: string;
  tenant_id: string;
  resource_id: string;
  source: "SecurityHub" | "GuardDuty" | "Inspector" | "Manual";
  title: string;
  severity: Severity;
  status: "Open" | "Suppressed" | "Resolved";
  first_seen_at: string;
  standard: string;
}

export interface ComplianceFinding {
  id: string;
  tenant_id: string;
  resource_id: string;
  framework: "CIS" | "PCI-DSS" | "SOC2" | "HIPAA" | "NIST 800-53" | "Internal";
  control_id: string;
  status: ComplianceStatus;
  evaluated_at: string;
  detail: string;
}

export interface BackupStatusRecord {
  id: string;
  tenant_id: string;
  resource_id: string;
  plan_name: string;
  last_backup_at: string;
  last_backup_status: "Succeeded" | "Failed" | "Partial";
  recovery_point_objective_minutes: number;
  recovery_time_objective_minutes: number;
  retention_days: number;
  vault: string;
}

export interface CostObservation {
  id: string;
  tenant_id: string;
  resource_id: string;
  period_start: string;
  period_end: string;
  amount: number;
  currency: "USD";
  cost_category: "Compute" | "Storage" | "Network" | "Database" | "Security" | "Observability" | "Other";
  variance_from_baseline_pct: number;
}

// --- Simulation ------------------------------------------------------------

export interface SimulationScenario {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  category: "Failure" | "Capacity" | "Cost" | "Security" | "Change";
  target_resource_id: string;
  base_state_ref: string;
  created_at: string;
}

export interface SimulationEvent {
  id: string;
  tenant_id: string;
  scenario_id: string;
  at: string;
  step_index: number;
  label: string;
  actor: string;
  applied_delta: Record<string, unknown>;
}

export interface SyntheticImpactResult {
  id: string;
  tenant_id: string;
  scenario_id: string;
  impacted_resource_id: string;
  dimension: "Availability" | "Performance" | "Cost" | "Compliance" | "Customer";
  before_value: number;
  after_value: number;
  delta_pct: number;
  narrative: string;
}

// --- Aggregate demo dataset ------------------------------------------------

export interface AwsCotsDataset {
  tenant: Tenant;
  business_services: BusinessService[];
  applications: Application[];
  aws_accounts: AwsAccount[];
  aws_regions: AwsRegion[];
  availability_zones: AvailabilityZone[];
  aws_resources: AwsResource[];
  aws_resource_configurations: AwsResourceConfiguration[];
  resource_relationships: ResourceRelationship[];
  telemetry_definitions: TelemetryDefinition[];
  telemetry_observations: TelemetryObservation[];
  alerts: Alert[];
  incidents: Incident[];
  changes: Change[];
  runbooks: Runbook[];
  automation_actions: AutomationAction[];
  security_findings: SecurityFinding[];
  compliance_findings: ComplianceFinding[];
  backup_status_records: BackupStatusRecord[];
  cost_observations: CostObservation[];
  simulation_scenarios: SimulationScenario[];
  simulation_events: SimulationEvent[];
  synthetic_impact_results: SyntheticImpactResult[];
}
