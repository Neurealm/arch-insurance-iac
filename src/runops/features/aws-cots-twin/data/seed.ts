/**
 * AWS COTS Digital Twin — deterministic seed dataset.
 *
 * Subject: "COTS Application, Single Region, Dual Availability Zone".
 * Tenant "Meridian Enterprise", business service "Enterprise Resource Management",
 * application "Atlas COTS Platform", account 742198563210, region us-east-1,
 * zones us-east-1a / us-east-1b, VPC 10.40.0.0/16.
 *
 * All identifiers, ARNs, and timestamps are synthetic. No live AWS calls.
 * Data is consumed only through the repositories layer — UI components must
 * not import this file directly.
 */

import type {
  Alert,
  Application,
  AutomationAction,
  AvailabilityZone,
  AwsAccount,
  AwsCotsDataset,
  AwsRegion,
  AwsResource,
  AwsResourceConfiguration,
  AwsResourceType,
  BackupStatusRecord,
  BusinessService,
  Change,
  ComplianceFinding,
  CostObservation,
  Incident,
  ResourceRelationship,
  Runbook,
  SecurityFinding,
  SimulationEvent,
  SimulationScenario,
  SyntheticImpactResult,
  Tenant,
  TelemetryDefinition,
  TelemetryObservation,
} from "../types";

const TENANT_ID = "tenant.meridian";
const ACCOUNT_ID = "acct.7421-prod";
const ACCOUNT_NUMBER = "742198563210";
const REGION_CODE = "us-east-1";
const AZ_A_CODE = "us-east-1a";
const AZ_B_CODE = "us-east-1b";
const BS_ID = "bs.erm";
const APP_ID = "app.atlas-cots";
const VPC_ID = "vpc-0a40production";
const NOW = "2026-07-16T13:00:00Z";
const DAY_AGO = "2026-07-15T13:00:00Z";
const WEEK_AGO = "2026-07-09T13:00:00Z";

const tenant: Tenant = {
  id: TENANT_ID,
  name: "Meridian Enterprise",
  slug: "meridian",
};

const business_services: BusinessService[] = [
  {
    id: BS_ID,
    tenant_id: TENANT_ID,
    name: "Enterprise Resource Management",
    description:
      "Company-wide ERP capability powering finance, HR, procurement, and logistics workflows.",
    owner_team: "Enterprise Applications",
    business_criticality: "Business Critical",
    customer_facing: false,
  },
];

const applications: Application[] = [
  {
    id: APP_ID,
    tenant_id: TENANT_ID,
    business_service_id: BS_ID,
    name: "Atlas COTS Platform",
    vendor: "Atlas Software Systems",
    version: "2024.3.2",
    lifecycle_stage: "Sustain",
    description:
      "Commercial off-the-shelf ERP platform, deployed on AWS in one region across two availability zones.",
  },
];

const aws_accounts: AwsAccount[] = [
  {
    id: ACCOUNT_ID,
    tenant_id: TENANT_ID,
    account_number: ACCOUNT_NUMBER,
    alias: "7421-Production",
    environment: "Production",
    organization_unit: "Production/Line-of-Business",
  },
];

const aws_regions: AwsRegion[] = [
  {
    id: "region.us-east-1",
    tenant_id: TENANT_ID,
    aws_account_id: ACCOUNT_ID,
    code: REGION_CODE,
    name: "US East (N. Virginia)",
  },
];

const availability_zones: AvailabilityZone[] = [
  {
    id: "az.us-east-1a",
    tenant_id: TENANT_ID,
    aws_region_id: "region.us-east-1",
    code: AZ_A_CODE,
    name: "us-east-1a",
  },
  {
    id: "az.us-east-1b",
    tenant_id: TENANT_ID,
    aws_region_id: "region.us-east-1",
    code: AZ_B_CODE,
    name: "us-east-1b",
  },
];

/** Small resource factory to keep the seed compact and consistent. */
function R(partial: Partial<AwsResource> & Pick<AwsResource,
  "id" | "resource_type" | "resource_name" | "network_scope"
>): AwsResource {
  return {
    tenant_id: TENANT_ID,
    aws_account_id: ACCOUNT_ID,
    parent_resource_id: null,
    business_service_id: BS_ID,
    application_id: APP_ID,
    resource_subtype: undefined,
    resource_id: partial.id,
    arn: `arn:aws:demo:${REGION_CODE}:${ACCOUNT_NUMBER}:${partial.id}`,
    region: REGION_CODE,
    availability_zone: undefined,
    environment: "Production",
    status: "Active",
    health_status: "Healthy",
    criticality: "High",
    owner: "atlas-platform-team@meridian.example",
    support_group: "SRE — Atlas COTS",
    cost_center: "CC-4108-ERP",
    monthly_cost: 0,
    currency: "USD",
    configuration: {},
    tags: {
      Application: "Atlas COTS Platform",
      BusinessService: "Enterprise Resource Management",
      Environment: "Production",
      Owner: "atlas-platform-team",
    },
    compliance_status: "Compliant",
    security_status: "Clean",
    backup_status: "N/A",
    patch_status: "N/A",
    automation_eligibility: "Partial",
    created_at: WEEK_AGO,
    updated_at: NOW,
    last_discovered_at: NOW,
    last_configuration_change_at: DAY_AGO,
    ...partial,
  } as AwsResource;
}

// ---------------------------------------------------------------------------
// Resources — organized by role. IDs are stable and referenced by relationships.
// ---------------------------------------------------------------------------

const foundation: AwsResource[] = [
  R({
    id: ACCOUNT_ID,
    resource_type: "AwsAccount",
    resource_name: "7421-Production",
    network_scope: "n/a",
    monthly_cost: 0,
    configuration: { account_number: ACCOUNT_NUMBER },
  }),
  R({
    id: "region.us-east-1",
    resource_type: "Region",
    resource_name: "us-east-1",
    network_scope: "n/a",
    parent_resource_id: ACCOUNT_ID,
    configuration: { code: REGION_CODE },
  }),
  R({
    id: "az.us-east-1a",
    resource_type: "AvailabilityZone",
    resource_name: "us-east-1a",
    network_scope: "n/a",
    parent_resource_id: "region.us-east-1",
    availability_zone: AZ_A_CODE,
  }),
  R({
    id: "az.us-east-1b",
    resource_type: "AvailabilityZone",
    resource_name: "us-east-1b",
    network_scope: "n/a",
    parent_resource_id: "region.us-east-1",
    availability_zone: AZ_B_CODE,
  }),
  R({
    id: VPC_ID,
    resource_type: "VPC",
    resource_name: "Atlas Production VPC",
    network_scope: "private-app",
    parent_resource_id: "region.us-east-1",
    configuration: { cidr: "10.40.0.0/16" },
  }),
];

const networking: AwsResource[] = [
  R({ id: "igw-atlas", resource_type: "InternetGateway", resource_name: "Atlas IGW", network_scope: "edge", parent_resource_id: VPC_ID }),

  R({ id: "subnet-pub-a", resource_type: "Subnet", resource_subtype: "Public", resource_name: "Public Subnet A", network_scope: "public", parent_resource_id: VPC_ID, availability_zone: AZ_A_CODE, configuration: { cidr: "10.40.1.0/24" } }),
  R({ id: "subnet-pub-b", resource_type: "Subnet", resource_subtype: "Public", resource_name: "Public Subnet B", network_scope: "public", parent_resource_id: VPC_ID, availability_zone: AZ_B_CODE, configuration: { cidr: "10.40.2.0/24" } }),
  R({ id: "subnet-app-a", resource_type: "Subnet", resource_subtype: "PrivateApp", resource_name: "Private Application Subnet A", network_scope: "private-app", parent_resource_id: VPC_ID, availability_zone: AZ_A_CODE, configuration: { cidr: "10.40.11.0/24" } }),
  R({ id: "subnet-app-b", resource_type: "Subnet", resource_subtype: "PrivateApp", resource_name: "Private Application Subnet B", network_scope: "private-app", parent_resource_id: VPC_ID, availability_zone: AZ_B_CODE, configuration: { cidr: "10.40.12.0/24" } }),
  R({ id: "subnet-db-a", resource_type: "Subnet", resource_subtype: "PrivateDb", resource_name: "Private Database Subnet A", network_scope: "private-db", parent_resource_id: VPC_ID, availability_zone: AZ_A_CODE, configuration: { cidr: "10.40.21.0/24" } }),
  R({ id: "subnet-db-b", resource_type: "Subnet", resource_subtype: "PrivateDb", resource_name: "Private Database Subnet B", network_scope: "private-db", parent_resource_id: VPC_ID, availability_zone: AZ_B_CODE, configuration: { cidr: "10.40.22.0/24" } }),

  R({ id: "nat-a", resource_type: "NatGateway", resource_name: "NAT Gateway A", network_scope: "edge", parent_resource_id: "subnet-pub-a", availability_zone: AZ_A_CODE, monthly_cost: 132, configuration: { elastic_ip: "52.10.10.10" } }),
  R({ id: "nat-b", resource_type: "NatGateway", resource_name: "NAT Gateway B", network_scope: "edge", parent_resource_id: "subnet-pub-b", availability_zone: AZ_B_CODE, monthly_cost: 118, configuration: { elastic_ip: "52.10.10.11" } }),

  R({ id: "rt-public", resource_type: "RouteTable", resource_name: "Public Route Table", network_scope: "public", parent_resource_id: VPC_ID }),
  R({ id: "rt-app-a", resource_type: "RouteTable", resource_name: "Private Application Route Table A", network_scope: "private-app", parent_resource_id: VPC_ID }),
  R({ id: "rt-app-b", resource_type: "RouteTable", resource_name: "Private Application Route Table B", network_scope: "private-app", parent_resource_id: VPC_ID }),
  R({ id: "rt-db", resource_type: "RouteTable", resource_name: "Private Database Route Table", network_scope: "private-db", parent_resource_id: VPC_ID }),

  R({ id: "nacl-public", resource_type: "NetworkAcl", resource_name: "Public Network ACL", network_scope: "public", parent_resource_id: VPC_ID }),
  R({ id: "nacl-app", resource_type: "NetworkAcl", resource_name: "Application Network ACL", network_scope: "private-app", parent_resource_id: VPC_ID }),
  R({ id: "nacl-db", resource_type: "NetworkAcl", resource_name: "Database Network ACL", network_scope: "private-db", parent_resource_id: VPC_ID }),

  R({ id: "sg-alb", resource_type: "SecurityGroup", resource_name: "ALB Security Group", network_scope: "edge", parent_resource_id: VPC_ID, configuration: { ingress: ["0.0.0.0/0:443"] } }),
  R({ id: "sg-app", resource_type: "SecurityGroup", resource_name: "Application Security Group", network_scope: "private-app", parent_resource_id: VPC_ID }),
  R({ id: "sg-db", resource_type: "SecurityGroup", resource_name: "Database Security Group", network_scope: "private-db", parent_resource_id: VPC_ID }),
  R({ id: "sg-shared", resource_type: "SecurityGroup", resource_name: "Shared Services Security Group", network_scope: "private-app", parent_resource_id: VPC_ID }),

  R({ id: "vpce-s3", resource_type: "VpcEndpoint", resource_subtype: "Gateway", resource_name: "S3 VPC Endpoint", network_scope: "private-app", parent_resource_id: VPC_ID }),
  R({ id: "vpce-ssm", resource_type: "VpcEndpoint", resource_subtype: "Interface", resource_name: "Systems Manager VPC Endpoint", network_scope: "private-app", parent_resource_id: VPC_ID }),
  R({ id: "vpce-ec2msg", resource_type: "VpcEndpoint", resource_subtype: "Interface", resource_name: "EC2 Messages VPC Endpoint", network_scope: "private-app", parent_resource_id: VPC_ID }),
  R({ id: "vpce-ssmmsg", resource_type: "VpcEndpoint", resource_subtype: "Interface", resource_name: "SSM Messages VPC Endpoint", network_scope: "private-app", parent_resource_id: VPC_ID }),
  R({ id: "vpce-secrets", resource_type: "VpcEndpoint", resource_subtype: "Interface", resource_name: "Secrets Manager VPC Endpoint", network_scope: "private-app", parent_resource_id: VPC_ID }),
  R({ id: "vpce-logs", resource_type: "VpcEndpoint", resource_subtype: "Interface", resource_name: "CloudWatch Logs VPC Endpoint", network_scope: "private-app", parent_resource_id: VPC_ID }),
];

const edgeAndTraffic: AwsResource[] = [
  R({ id: "r53-zone", resource_type: "Route53HostedZone", resource_name: "erm.meridian.example", network_scope: "edge" }),
  R({ id: "r53-app-record", resource_type: "Route53Record", resource_name: "app.erm.meridian.example (ALIAS)", network_scope: "edge", parent_resource_id: "r53-zone" }),
  R({ id: "waf-web-acl", resource_type: "WafWebAcl", resource_name: "Atlas WAF Web ACL", network_scope: "edge", monthly_cost: 68 }),
  R({ id: "alb-atlas", resource_type: "Alb", resource_name: "Atlas Application Load Balancer", network_scope: "edge", parent_resource_id: VPC_ID, monthly_cost: 240, configuration: { scheme: "internet-facing" } }),
  R({ id: "alb-listener-https", resource_type: "AlbListener", resource_name: "HTTPS 443 Listener", network_scope: "edge", parent_resource_id: "alb-atlas", configuration: { protocol: "HTTPS", port: 443 } }),
  R({ id: "alb-tg-app", resource_type: "AlbTargetGroup", resource_name: "Atlas Application Target Group", network_scope: "private-app", parent_resource_id: "alb-atlas" }),
  R({ id: "acm-cert", resource_type: "AcmCertificate", resource_name: "*.erm.meridian.example", network_scope: "edge", configuration: { expires: "2027-04-01" } }),
];

const compute: AwsResource[] = [
  R({ id: "asg-atlas", resource_type: "AutoScalingGroup", resource_name: "Atlas Application ASG", network_scope: "private-app", configuration: { min: 2, max: 8, desired: 4 } }),
  R({ id: "lt-atlas", resource_type: "LaunchTemplate", resource_name: "Atlas Launch Template v14", network_scope: "private-app" }),
  R({ id: "ami-golden", resource_type: "Ami", resource_name: "Atlas Golden AMI 2026-06", network_scope: "n/a", patch_status: "Overdue", security_status: "Advisory", configuration: { base_os: "Amazon Linux 2023", pending_patches: 2 } }),

  R({ id: "ec2-a1", resource_type: "Ec2Instance", resource_name: "Application Server A1", network_scope: "private-app", parent_resource_id: "subnet-app-a", availability_zone: AZ_A_CODE, monthly_cost: 210, health_status: "Critical", configuration: { instance_type: "m6i.large" }, backup_status: "Protected", patch_status: "Current" }),
  R({ id: "ec2-a2", resource_type: "Ec2Instance", resource_name: "Application Server A2", network_scope: "private-app", parent_resource_id: "subnet-app-a", availability_zone: AZ_A_CODE, monthly_cost: 210, configuration: { instance_type: "m6i.large" }, backup_status: "Protected", patch_status: "Current" }),

  R({ id: "ec2-b1", resource_type: "Ec2Instance", resource_name: "Application Server B1", network_scope: "private-app", parent_resource_id: "subnet-app-b", availability_zone: AZ_B_CODE, monthly_cost: 210, configuration: { instance_type: "m6i.large" }, backup_status: "Protected", patch_status: "Current" }),
  R({ id: "ec2-b2", resource_type: "Ec2Instance", resource_name: "Application Server B2", network_scope: "private-app", parent_resource_id: "subnet-app-b", availability_zone: AZ_B_CODE, monthly_cost: 210, health_status: "Warning", configuration: { instance_type: "m6i.large" }, backup_status: "Protected", patch_status: "Pending" }),
];

const storage: AwsResource[] = [
  R({ id: "ebs-a1", resource_type: "EbsVolume", resource_name: "EBS Root — A1", network_scope: "private-app", parent_resource_id: "ec2-a1", availability_zone: AZ_A_CODE, health_status: "Critical", configuration: { size_gib: 100, type: "gp3", used_pct: 94 }, backup_status: "Protected" }),
  R({ id: "ebs-a2", resource_type: "EbsVolume", resource_name: "EBS Root — A2", network_scope: "private-app", parent_resource_id: "ec2-a2", availability_zone: AZ_A_CODE, configuration: { size_gib: 100, type: "gp3" }, backup_status: "Protected" }),
  R({ id: "ebs-b1", resource_type: "EbsVolume", resource_name: "EBS Root — B1", network_scope: "private-app", parent_resource_id: "ec2-b1", availability_zone: AZ_B_CODE, configuration: { size_gib: 100, type: "gp3" }, backup_status: "Protected" }),
  R({ id: "ebs-b2", resource_type: "EbsVolume", resource_name: "EBS Root — B2", network_scope: "private-app", parent_resource_id: "ec2-b2", availability_zone: AZ_B_CODE, health_status: "Warning", configuration: { size_gib: 100, type: "gp3", used_pct: 84 }, backup_status: "Protected" }),

  R({ id: "efs-atlas", resource_type: "Efs", resource_name: "Atlas Shared EFS", network_scope: "private-app", configuration: { throughput_mode: "bursting" }, backup_status: "Protected" }),
  R({ id: "s3-atlas", resource_type: "S3Bucket", resource_name: "atlas-cots-app-artifacts", network_scope: "n/a", monthly_cost: 42, backup_status: "Protected" }),
];

const database: AwsResource[] = [
  R({
    id: "rds-atlas",
    resource_type: "RdsInstance",
    resource_name: "Atlas RDS Multi-AZ",
    network_scope: "private-db",
    availability_zone: AZ_A_CODE,
    monthly_cost: 1120,
    configuration: {
      engine: "PostgreSQL 15.6",
      instance_class: "db.r6i.xlarge",
      multi_az: true,
      storage_gib: 1024,
    },
    backup_status: "Protected",
    patch_status: "Current",
    criticality: "Business Critical",
  }),
  R({ id: "rds-subnet-group", resource_type: "RdsSubnetGroup", resource_name: "Atlas RDS Subnet Group", network_scope: "private-db" }),
];

const security: AwsResource[] = [
  R({ id: "iam-app-role", resource_type: "IamRole", resource_name: "AtlasApplicationRole", network_scope: "n/a" }),
  R({ id: "secret-atlas-db", resource_type: "SecretsManagerSecret", resource_name: "atlas/app/db-credentials", network_scope: "n/a" }),
  R({ id: "kms-atlas", resource_type: "KmsKey", resource_name: "Atlas Application KMS Key", network_scope: "n/a", configuration: { rotation_enabled: true } }),
  R({ id: "sec-hub", resource_type: "SecurityHub", resource_name: "Security Hub (Account-wide)", network_scope: "n/a" }),
  R({ id: "guardduty", resource_type: "GuardDuty", resource_name: "GuardDuty (Account-wide)", network_scope: "n/a" }),
];

const operations: AwsResource[] = [
  R({ id: "ssm", resource_type: "SystemsManager", resource_name: "Systems Manager", network_scope: "n/a" }),
  R({ id: "cw", resource_type: "CloudWatch", resource_name: "CloudWatch", network_scope: "n/a" }),
  R({ id: "cw-log-app", resource_type: "CloudWatchLogGroup", resource_name: "/atlas/app", network_scope: "n/a", parent_resource_id: "cw" }),
  R({ id: "cw-log-alb", resource_type: "CloudWatchLogGroup", resource_name: "/atlas/alb-access", network_scope: "n/a", parent_resource_id: "cw" }),
  R({ id: "cw-alarm-cpu", resource_type: "CloudWatchAlarm", resource_name: "Atlas EC2 CPU High", network_scope: "n/a", parent_resource_id: "cw" }),
  R({ id: "cw-alarm-5xx", resource_type: "CloudWatchAlarm", resource_name: "Atlas ALB 5XX Error Rate", network_scope: "n/a", parent_resource_id: "cw" }),
  R({ id: "cw-alarm-disk", resource_type: "CloudWatchAlarm", resource_name: "Atlas EC2 Disk Utilization", network_scope: "n/a", parent_resource_id: "cw" }),
  R({ id: "cloudtrail", resource_type: "CloudTrail", resource_name: "Atlas Organization Trail", network_scope: "n/a" }),
  R({ id: "aws-config", resource_type: "AwsConfig", resource_name: "AWS Config (Account-wide)", network_scope: "n/a" }),
  R({ id: "aws-backup", resource_type: "AwsBackup", resource_name: "Atlas Backup Plan", network_scope: "n/a" }),
  R({ id: "sns-ops", resource_type: "SnsTopic", resource_name: "atlas-ops-notifications", network_scope: "n/a" }),
  R({ id: "eb-bus", resource_type: "EventBridgeBus", resource_name: "atlas-operations", network_scope: "n/a" }),
  R({ id: "eb-rule-instance", resource_type: "EventBridgeRule", resource_name: "EC2 State-Change → Ops", network_scope: "n/a", parent_resource_id: "eb-bus" }),
  R({ id: "eb-rule-backup", resource_type: "EventBridgeRule", resource_name: "Backup Job Failed → Ops", network_scope: "n/a", parent_resource_id: "eb-bus" }),
];

const externalDependencies: AwsResource[] = [
  R({ id: "ext-ad", resource_type: "ExternalDependency", resource_subtype: "ActiveDirectory", resource_name: "Enterprise Active Directory", network_scope: "hybrid" }),
  R({ id: "ext-smtp", resource_type: "ExternalDependency", resource_subtype: "SmtpRelay", resource_name: "Enterprise SMTP Relay", network_scope: "hybrid" }),
  R({ id: "ext-itsm", resource_type: "ExternalDependency", resource_subtype: "ITSM", resource_name: "Enterprise ITSM Platform", network_scope: "hybrid" }),
];

const aws_resources: AwsResource[] = [
  ...foundation,
  ...networking,
  ...edgeAndTraffic,
  ...compute,
  ...storage,
  ...database,
  ...security,
  ...operations,
  ...externalDependencies,
];

// Minimal configuration-history sample (drift detection later)
const aws_resource_configurations: AwsResourceConfiguration[] = [
  {
    id: "cfg.ami.patches",
    tenant_id: TENANT_ID,
    resource_id: "ami-golden",
    configuration_key: "pending_patches",
    configuration_value: 2,
    drift_detected: true,
    baseline_value: 0,
    captured_at: NOW,
  },
  {
    id: "cfg.ebs.b2.usedpct",
    tenant_id: TENANT_ID,
    resource_id: "ebs-b2",
    configuration_key: "used_pct",
    configuration_value: 84,
    drift_detected: true,
    baseline_value: 60,
    captured_at: NOW,
  },
];

// ---------------------------------------------------------------------------
// Relationships — primary traffic flow and cross-cutting dependencies
// ---------------------------------------------------------------------------

function REL(
  id: string,
  source: string,
  target: string,
  rel: ResourceRelationship["relationship_type"],
  extra: Partial<ResourceRelationship> = {},
): ResourceRelationship {
  return {
    id,
    tenant_id: TENANT_ID,
    source_resource_id: source,
    target_resource_id: target,
    relationship_type: rel,
    direction: "one-way",
    relationship_status: "Active",
    criticality: "High",
    failover_relationship: false,
    discovered_by: "seed",
    last_validated_at: NOW,
    metadata: {},
    ...extra,
  };
}

const trafficFlow: ResourceRelationship[] = [
  REL("r.internet-r53", "ext-itsm", "r53-zone", "sends-traffic-to", { direction: "one-way", metadata: { note: "Public internet clients resolve DNS." } }),
  REL("r.r53-waf", "r53-app-record", "waf-web-acl", "routes-to", { protocol: "HTTPS", port: 443 }),
  REL("r.waf-alb", "waf-web-acl", "alb-atlas", "protects", { protocol: "HTTPS", port: 443 }),
  REL("r.alb-listener", "alb-atlas", "alb-listener-https", "hosts"),
  REL("r.listener-tg", "alb-listener-https", "alb-tg-app", "routes-to", { protocol: "HTTPS", port: 443 }),
  REL("r.tg-ec2-a1", "alb-tg-app", "ec2-a1", "sends-traffic-to", { protocol: "HTTP", port: 8080 }),
  REL("r.tg-ec2-a2", "alb-tg-app", "ec2-a2", "sends-traffic-to", { protocol: "HTTP", port: 8080 }),
  REL("r.tg-ec2-b1", "alb-tg-app", "ec2-b1", "sends-traffic-to", { protocol: "HTTP", port: 8080 }),
  REL("r.tg-ec2-b2", "alb-tg-app", "ec2-b2", "sends-traffic-to", { protocol: "HTTP", port: 8080, relationship_status: "Degraded" }),
  REL("r.ec2a1-rds", "ec2-a1", "rds-atlas", "writes-to", { protocol: "TCP", port: 5432 }),
  REL("r.ec2a2-rds", "ec2-a2", "rds-atlas", "writes-to", { protocol: "TCP", port: 5432 }),
  REL("r.ec2b1-rds", "ec2-b1", "rds-atlas", "writes-to", { protocol: "TCP", port: 5432 }),
  REL("r.ec2b2-rds", "ec2-b2", "rds-atlas", "writes-to", { protocol: "TCP", port: 5432 }),
];

// EC2 → storage / config / identity
const computeAttachments: ResourceRelationship[] = ["a1", "a2", "b1", "b2"].flatMap((s) => [
  REL(`r.ec2-${s}-ebs`, `ec2-${s}`, `ebs-${s}`, "attached-to"),
  REL(`r.ec2-${s}-efs`, `ec2-${s}`, "efs-atlas", "attached-to"),
  REL(`r.ec2-${s}-secrets`, `ec2-${s}`, "secret-atlas-db", "reads-from"),
  REL(`r.ec2-${s}-kms`, `ec2-${s}`, "kms-atlas", "authenticates-with"),
  REL(`r.ec2-${s}-ssm`, `ec2-${s}`, "ssm", "depends-on"),
  REL(`r.ec2-${s}-ad`, `ec2-${s}`, "ext-ad", "authenticates-with"),
  REL(`r.ec2-${s}-smtp`, `ec2-${s}`, "ext-smtp", "sends-traffic-to", { protocol: "TCP", port: 587 }),
]);

// AWS-wide observability + governance edges
const observability: ResourceRelationship[] = [
  ...["ec2-a1", "ec2-a2", "ec2-b1", "ec2-b2", "alb-atlas", "rds-atlas", "efs-atlas", "s3-atlas", "waf-web-acl"].map(
    (r, i) => REL(`r.mon-${i}`, r, "cw", "monitors", { direction: "bidirectional" }),
  ),
  ...["ec2-a1", "ec2-a2", "ec2-b1", "ec2-b2", "alb-atlas", "rds-atlas", "iam-app-role"].map(
    (r, i) => REL(`r.trail-${i}`, r, "cloudtrail", "logs-to"),
  ),
  ...["ec2-a1", "ec2-a2", "ec2-b1", "ec2-b2", "alb-atlas", "rds-atlas", "sg-app", "sg-db", "sg-alb", "kms-atlas"].map(
    (r, i) => REL(`r.cfg-${i}`, r, "aws-config", "monitors"),
  ),
  ...["ec2-a1", "ec2-a2", "ec2-b1", "ec2-b2", "rds-atlas", "efs-atlas", "s3-atlas"].map(
    (r, i) => REL(`r.bak-${i}`, r, "aws-backup", "backs-up"),
  ),
  REL("r.cw-alarm-cpu-sns", "cw-alarm-cpu", "sns-ops", "notifies"),
  REL("r.cw-alarm-5xx-sns", "cw-alarm-5xx", "sns-ops", "notifies"),
  REL("r.cw-alarm-disk-sns", "cw-alarm-disk", "sns-ops", "notifies"),
  REL("r.eb-rule-inst-sns", "eb-rule-instance", "sns-ops", "triggers"),
  REL("r.eb-rule-bak-sns", "eb-rule-backup", "sns-ops", "triggers"),
];

const resource_relationships: ResourceRelationship[] = [
  ...trafficFlow,
  ...computeAttachments,
  ...observability,
  // Multi-AZ failover marker
  REL("r.rds-failover", "rds-atlas", "az.us-east-1b", "fails-over-to", { failover_relationship: true, criticality: "Business Critical" }),
];

// ---------------------------------------------------------------------------
// Telemetry
// ---------------------------------------------------------------------------

const telemetry_definitions: TelemetryDefinition[] = [
  { id: "td.ec2.cpu", resource_type: "Ec2Instance", metric_namespace: "AWS/EC2", metric_name: "CPUUtilization", display_name: "CPU utilization", unit: "%", statistic: "Average", period_seconds: 60, warning_threshold: 70, critical_threshold: 85, normal_min: 10, normal_max: 60, higher_is_worse: true, source: "CloudWatch" },
  { id: "td.ec2.disk", resource_type: "EbsVolume", metric_namespace: "AWS/EC2", metric_name: "DiskUsedPercent", display_name: "Disk used", unit: "%", statistic: "Maximum", period_seconds: 300, warning_threshold: 75, critical_threshold: 90, higher_is_worse: true, source: "Agent" },
  { id: "td.alb.5xx", resource_type: "Alb", metric_namespace: "AWS/ApplicationELB", metric_name: "HTTPCode_ELB_5XX_Count", display_name: "ALB 5XX rate", unit: "count/min", statistic: "Sum", period_seconds: 60, warning_threshold: 5, critical_threshold: 25, higher_is_worse: true, source: "CloudWatch" },
  { id: "td.alb.latency", resource_type: "Alb", metric_namespace: "AWS/ApplicationELB", metric_name: "TargetResponseTime", display_name: "Target response time (p95)", unit: "s", statistic: "p95", period_seconds: 60, warning_threshold: 0.5, critical_threshold: 1.2, higher_is_worse: true, source: "CloudWatch" },
  { id: "td.rds.cpu", resource_type: "RdsInstance", metric_namespace: "AWS/RDS", metric_name: "CPUUtilization", display_name: "RDS CPU", unit: "%", statistic: "Average", period_seconds: 60, warning_threshold: 70, critical_threshold: 85, higher_is_worse: true, source: "CloudWatch" },
  { id: "td.rds.replica.lag", resource_type: "RdsInstance", metric_namespace: "AWS/RDS", metric_name: "ReplicaLag", display_name: "Replica lag", unit: "s", statistic: "Maximum", period_seconds: 60, warning_threshold: 30, critical_threshold: 120, higher_is_worse: true, source: "CloudWatch" },
  { id: "td.nat.bytes", resource_type: "NatGateway", metric_namespace: "AWS/NATGateway", metric_name: "BytesOutToDestination", display_name: "NAT egress bytes", unit: "GB/day", statistic: "Sum", period_seconds: 86400, warning_threshold: 200, critical_threshold: 400, higher_is_worse: true, source: "CloudWatch" },
];

const telemetry_observations: TelemetryObservation[] = [
  { id: "to.ec2.a1.cpu", tenant_id: TENANT_ID, resource_id: "ec2-a1", metric_definition_id: "td.ec2.cpu", timestamp: NOW, current_value: 34, previous_value: 32, baseline_value: 38, anomaly_score: 0.05, trend: "flat", freshness_status: "Fresh", source: "CloudWatch" },
  { id: "to.ec2.a2.cpu", tenant_id: TENANT_ID, resource_id: "ec2-a2", metric_definition_id: "td.ec2.cpu", timestamp: NOW, current_value: 41, previous_value: 39, baseline_value: 38, anomaly_score: 0.06, trend: "up", freshness_status: "Fresh", source: "CloudWatch" },
  { id: "to.ec2.b1.cpu", tenant_id: TENANT_ID, resource_id: "ec2-b1", metric_definition_id: "td.ec2.cpu", timestamp: NOW, current_value: 44, previous_value: 43, baseline_value: 40, anomaly_score: 0.09, trend: "flat", freshness_status: "Fresh", source: "CloudWatch" },
  { id: "to.ec2.b2.cpu", tenant_id: TENANT_ID, resource_id: "ec2-b2", metric_definition_id: "td.ec2.cpu", timestamp: NOW, current_value: 58, previous_value: 46, baseline_value: 40, anomaly_score: 0.38, trend: "up", freshness_status: "Fresh", source: "CloudWatch" },
  { id: "to.ebs.a1.disk", tenant_id: TENANT_ID, resource_id: "ebs-a1", metric_definition_id: "td.ec2.disk", timestamp: NOW, current_value: 94, previous_value: 91, baseline_value: 62, anomaly_score: 0.88, trend: "up", freshness_status: "Fresh", source: "Agent" },
  { id: "to.ebs.b2.disk", tenant_id: TENANT_ID, resource_id: "ebs-b2", metric_definition_id: "td.ec2.disk", timestamp: NOW, current_value: 84, previous_value: 78, baseline_value: 60, anomaly_score: 0.72, trend: "up", freshness_status: "Fresh", source: "Agent" },
  { id: "to.alb.5xx", tenant_id: TENANT_ID, resource_id: "alb-atlas", metric_definition_id: "td.alb.5xx", timestamp: NOW, current_value: 2, previous_value: 1, baseline_value: 1, anomaly_score: 0.1, trend: "flat", freshness_status: "Fresh", source: "CloudWatch" },
  { id: "to.alb.latency", tenant_id: TENANT_ID, resource_id: "alb-atlas", metric_definition_id: "td.alb.latency", timestamp: NOW, current_value: 0.31, previous_value: 0.29, baseline_value: 0.30, anomaly_score: 0.05, trend: "flat", freshness_status: "Fresh", source: "CloudWatch" },
  { id: "to.rds.cpu", tenant_id: TENANT_ID, resource_id: "rds-atlas", metric_definition_id: "td.rds.cpu", timestamp: NOW, current_value: 46, previous_value: 44, baseline_value: 45, anomaly_score: 0.04, trend: "flat", freshness_status: "Fresh", source: "CloudWatch" },
  { id: "to.rds.replica.lag", tenant_id: TENANT_ID, resource_id: "rds-atlas", metric_definition_id: "td.rds.replica.lag", timestamp: NOW, current_value: 4, previous_value: 3, baseline_value: 4, anomaly_score: 0.02, trend: "flat", freshness_status: "Fresh", source: "CloudWatch" },
  { id: "to.nat.a.bytes", tenant_id: TENANT_ID, resource_id: "nat-a", metric_definition_id: "td.nat.bytes", timestamp: NOW, current_value: 246, previous_value: 200, baseline_value: 200, anomaly_score: 0.31, trend: "up", freshness_status: "Fresh", source: "CloudWatch" },
];

// ---------------------------------------------------------------------------
// Runbooks / Automation
// ---------------------------------------------------------------------------

const runbooks: Runbook[] = [
  { id: "rb.replace-ec2", tenant_id: TENANT_ID, name: "Replace unhealthy EC2 instance", description: "Cordon, drain, terminate and let ASG re-provision.", category: "Recovery", applicable_resource_types: ["Ec2Instance"], autonomy_level: "Semi-Autonomous", average_duration_minutes: 8, approvals_required: true, rollback_supported: true, last_certified_at: WEEK_AGO, fitness_score: 92 },
  { id: "rb.expand-ebs", tenant_id: TENANT_ID, name: "Expand EBS volume online", description: "Grow volume, rescan block device, extend filesystem.", category: "Capacity", applicable_resource_types: ["EbsVolume"], autonomy_level: "Guided", average_duration_minutes: 6, approvals_required: true, rollback_supported: false, last_certified_at: WEEK_AGO, fitness_score: 88 },
  { id: "rb.investigate-latency", tenant_id: TENANT_ID, name: "Investigate application latency", description: "Correlate ALB latency, EC2 CPU, RDS load, and downstream.", category: "Investigation", applicable_resource_types: ["Alb", "Ec2Instance", "RdsInstance"], autonomy_level: "Advisory", average_duration_minutes: 15, approvals_required: false, rollback_supported: true, last_certified_at: WEEK_AGO, fitness_score: 84 },
  { id: "rb.alb-5xx", tenant_id: TENANT_ID, name: "Respond to ALB 5XX errors", description: "Isolate failing targets, capture stack, roll back release if applicable.", category: "Recovery", applicable_resource_types: ["Alb", "AlbTargetGroup", "Ec2Instance"], autonomy_level: "Guided", average_duration_minutes: 12, approvals_required: true, rollback_supported: true, last_certified_at: WEEK_AGO, fitness_score: 86 },
  { id: "rb.rds-failover", tenant_id: TENANT_ID, name: "Fail over RDS database", description: "Trigger managed failover to standby AZ; validate reconnects.", category: "Recovery", applicable_resource_types: ["RdsInstance"], autonomy_level: "Semi-Autonomous", average_duration_minutes: 4, approvals_required: true, rollback_supported: false, last_certified_at: WEEK_AGO, fitness_score: 90 },
  { id: "rb.restore-backup", tenant_id: TENANT_ID, name: "Restore from backup", description: "Restore a resource from AWS Backup recovery point.", category: "Recovery", applicable_resource_types: ["RdsInstance", "EbsVolume", "Efs", "S3Bucket"], autonomy_level: "Guided", average_duration_minutes: 45, approvals_required: true, rollback_supported: false, last_certified_at: WEEK_AGO, fitness_score: 80 },
  { id: "rb.rotate-secret", tenant_id: TENANT_ID, name: "Rotate application secret", description: "Rotate Secrets Manager secret, reload application, verify health.", category: "Security", applicable_resource_types: ["SecretsManagerSecret", "Ec2Instance"], autonomy_level: "Semi-Autonomous", average_duration_minutes: 7, approvals_required: true, rollback_supported: true, last_certified_at: WEEK_AGO, fitness_score: 87 },
  { id: "rb.quarantine-ec2", tenant_id: TENANT_ID, name: "Quarantine compromised instance", description: "Detach from LB, apply quarantine SG, snapshot, notify security.", category: "Security", applicable_resource_types: ["Ec2Instance"], autonomy_level: "Guided", average_duration_minutes: 5, approvals_required: true, rollback_supported: true, last_certified_at: WEEK_AGO, fitness_score: 91 },
  { id: "rb.recover-az", tenant_id: TENANT_ID, name: "Recover failed Availability Zone", description: "Drain workload, shift traffic, warm-standby second AZ.", category: "Recovery", applicable_resource_types: ["AvailabilityZone", "Alb", "AutoScalingGroup", "RdsInstance"], autonomy_level: "Semi-Autonomous", average_duration_minutes: 20, approvals_required: true, rollback_supported: true, last_certified_at: WEEK_AGO, fitness_score: 82 },
  { id: "rb.scale-app", tenant_id: TENANT_ID, name: "Scale application capacity", description: "Adjust ASG desired capacity and warm up new instances.", category: "Capacity", applicable_resource_types: ["AutoScalingGroup"], autonomy_level: "Semi-Autonomous", average_duration_minutes: 6, approvals_required: false, rollback_supported: true, last_certified_at: WEEK_AGO, fitness_score: 94 },
];

const automation_actions: AutomationAction[] = [
  { id: "aa.replace-ec2", tenant_id: TENANT_ID, runbook_id: "rb.replace-ec2", name: "Replace instance via ASG", target_resource_type: "Ec2Instance", approval_required: true, rollback_supported: true, average_duration_seconds: 480 },
  { id: "aa.expand-ebs", tenant_id: TENANT_ID, runbook_id: "rb.expand-ebs", name: "Modify EBS volume size", target_resource_type: "EbsVolume", approval_required: true, rollback_supported: false, average_duration_seconds: 360 },
  { id: "aa.rds-failover", tenant_id: TENANT_ID, runbook_id: "rb.rds-failover", name: "Reboot with failover", target_resource_type: "RdsInstance", approval_required: true, rollback_supported: false, average_duration_seconds: 240 },
  { id: "aa.rotate-secret", tenant_id: TENANT_ID, runbook_id: "rb.rotate-secret", name: "Rotate secret and reload", target_resource_type: "SecretsManagerSecret", approval_required: true, rollback_supported: true, average_duration_seconds: 420 },
  { id: "aa.quarantine-ec2", tenant_id: TENANT_ID, runbook_id: "rb.quarantine-ec2", name: "Apply quarantine security group", target_resource_type: "Ec2Instance", approval_required: true, rollback_supported: true, average_duration_seconds: 180 },
];

// ---------------------------------------------------------------------------
// Alerts / Incidents / Changes
// ---------------------------------------------------------------------------

const incidents: Incident[] = [];
const changes: Change[] = [
  {
    id: "chg.atlas.ami-patch",
    tenant_id: TENANT_ID,
    external_id: "CHG-24187",
    title: "Bake and roll new Atlas Golden AMI with pending security patches",
    type: "Normal",
    state: "Approved",
    risk: "Medium",
    planned_start: "2026-07-19T02:00:00Z",
    planned_end: "2026-07-19T05:00:00Z",
    owner: "atlas-platform-team",
    affected_resource_ids: ["ami-golden", "asg-atlas", "lt-atlas", "ec2-a1", "ec2-a2", "ec2-b1", "ec2-b2"],
  },
];

const alerts: Alert[] = [
  {
    id: "alt.a1-disk",
    tenant_id: TENANT_ID,
    resource_id: "ebs-a1",
    title: "Application Server A1 EBS volume capacity is 94% (critical)",
    description: "Root EBS volume on Application Server A1 exceeded critical threshold (90%). Filesystem is at imminent risk of exhaustion.",
    severity: "Critical",
    status: "Firing",
    category: "Capacity",
    detection_source: "CloudWatch Alarm — Atlas EC2 Disk Utilization",
    metric_name: "DiskUsedPercent",
    current_value: 94,
    threshold: 90,
    first_detected_at: DAY_AGO,
    last_detected_at: NOW,
    assigned_team: "SRE — Atlas COTS",
    assigned_owner: "on-call",
    business_impact: "A1 will begin failing writes and ALB health checks when the volume fills; capacity in AZ A degrades to a single node.",
    probable_cause: "Runaway application temp files after batch job; log rotation not reclaiming space.",
    recommended_action: "Expand EBS volume online to 200 GiB and clear stale temp files, then verify rotation policy.",
    runbook_id: "rb.expand-ebs",
    automation_available: true,
    automated_action_status: "Awaiting Approval",
  },
  {
    id: "alt.b2-disk",
    tenant_id: TENANT_ID,
    resource_id: "ebs-b2",
    title: "Application Server B2 disk utilization is 84%",
    description: "Root EBS volume on Application Server B2 exceeded warning threshold; approaching critical (90%).",
    severity: "High",
    status: "Firing",
    category: "Capacity",
    detection_source: "CloudWatch Alarm — Atlas EC2 Disk Utilization",
    metric_name: "DiskUsedPercent",
    current_value: 84,
    threshold: 75,
    first_detected_at: DAY_AGO,
    last_detected_at: NOW,
    assigned_team: "SRE — Atlas COTS",
    assigned_owner: "on-call",
    business_impact: "Risk of application errors on B2 if volume fills; ALB will shed load to healthy targets.",
    probable_cause: "Application log rotation misconfigured after last release.",
    recommended_action: "Expand EBS volume online, then verify log rotation policy.",
    runbook_id: "rb.expand-ebs",
    automation_available: true,
    automated_action_status: "Awaiting Approval",
  },
  {
    id: "alt.nat-a-cost",
    tenant_id: TENANT_ID,
    resource_id: "nat-a",
    title: "NAT Gateway A data-processing cost is 23% above baseline",
    description: "NAT Gateway A egress volume exceeded 7-day baseline by 23% for the last 24 hours.",
    severity: "Medium",
    status: "Firing",
    category: "Cost",
    detection_source: "FinOps anomaly detector",
    metric_name: "BytesOutToDestination",
    current_value: 246,
    threshold: 200,
    first_detected_at: DAY_AGO,
    last_detected_at: NOW,
    assigned_team: "FinOps",
    business_impact: "Projected ~$180 additional monthly NAT charges if trend persists.",
    probable_cause: "Recent release added chatty outbound calls to third-party analytics.",
    recommended_action: "Investigate outbound traffic profile; consider VPC endpoint or caching.",
    automation_available: false,
    automated_action_status: "N/A",
  },
  {
    id: "alt.ami-patches",
    tenant_id: TENANT_ID,
    resource_id: "ami-golden",
    title: "Atlas Golden AMI contains two overdue security patches",
    description: "Golden AMI is missing two patches classified as Important by the vulnerability program.",
    severity: "Medium",
    status: "Acknowledged",
    category: "Security",
    detection_source: "AWS Inspector",
    first_detected_at: WEEK_AGO,
    last_detected_at: NOW,
    acknowledged_at: DAY_AGO,
    assigned_team: "Security Engineering",
    business_impact: "Delayed patching increases exposure window; no known active exploit.",
    probable_cause: "AMI bake pipeline paused during last week's freeze window.",
    recommended_action: "Rebake AMI and roll instances per CHG-24187.",
    change_id: "chg.atlas.ami-patch",
    automation_available: false,
    automated_action_status: "N/A",
  },
];

// ---------------------------------------------------------------------------
// Security / Compliance / Backup / Cost
// ---------------------------------------------------------------------------

const security_findings: SecurityFinding[] = [
  { id: "sf.ami.patches", tenant_id: TENANT_ID, resource_id: "ami-golden", source: "Inspector", title: "Two overdue OS security patches", severity: "Medium", status: "Open", first_seen_at: WEEK_AGO, standard: "Internal Vulnerability Program" },
];

const compliance_findings: ComplianceFinding[] = [
  { id: "cf.kms.rotation", tenant_id: TENANT_ID, resource_id: "kms-atlas", framework: "CIS", control_id: "3.8", status: "Compliant", evaluated_at: NOW, detail: "KMS key rotation enabled." },
  { id: "cf.rds.multiaz", tenant_id: TENANT_ID, resource_id: "rds-atlas", framework: "Internal", control_id: "AVAIL-01", status: "Compliant", evaluated_at: NOW, detail: "RDS Multi-AZ enabled." },
  { id: "cf.s3.public", tenant_id: TENANT_ID, resource_id: "s3-atlas", framework: "CIS", control_id: "2.1.5", status: "Compliant", evaluated_at: NOW, detail: "Public access blocked at bucket + account levels." },
];

const backup_status_records: BackupStatusRecord[] = [
  { id: "bak.rds", tenant_id: TENANT_ID, resource_id: "rds-atlas", plan_name: "Atlas Daily", last_backup_at: NOW, last_backup_status: "Succeeded", recovery_point_objective_minutes: 15, recovery_time_objective_minutes: 60, retention_days: 35, vault: "atlas-vault" },
  { id: "bak.efs", tenant_id: TENANT_ID, resource_id: "efs-atlas", plan_name: "Atlas Daily", last_backup_at: NOW, last_backup_status: "Succeeded", recovery_point_objective_minutes: 60, recovery_time_objective_minutes: 120, retention_days: 30, vault: "atlas-vault" },
  { id: "bak.ebs.b2", tenant_id: TENANT_ID, resource_id: "ebs-b2", plan_name: "Atlas Daily", last_backup_at: NOW, last_backup_status: "Succeeded", recovery_point_objective_minutes: 60, recovery_time_objective_minutes: 120, retention_days: 14, vault: "atlas-vault" },
];

const cost_observations: CostObservation[] = [
  { id: "co.rds", tenant_id: TENANT_ID, resource_id: "rds-atlas", period_start: WEEK_AGO, period_end: NOW, amount: 274, currency: "USD", cost_category: "Database", variance_from_baseline_pct: 1.2 },
  { id: "co.nat.a", tenant_id: TENANT_ID, resource_id: "nat-a", period_start: WEEK_AGO, period_end: NOW, amount: 41, currency: "USD", cost_category: "Network", variance_from_baseline_pct: 23.0 },
  { id: "co.nat.b", tenant_id: TENANT_ID, resource_id: "nat-b", period_start: WEEK_AGO, period_end: NOW, amount: 29, currency: "USD", cost_category: "Network", variance_from_baseline_pct: 2.1 },
  { id: "co.alb", tenant_id: TENANT_ID, resource_id: "alb-atlas", period_start: WEEK_AGO, period_end: NOW, amount: 61, currency: "USD", cost_category: "Network", variance_from_baseline_pct: -1.4 },
  { id: "co.s3", tenant_id: TENANT_ID, resource_id: "s3-atlas", period_start: WEEK_AGO, period_end: NOW, amount: 10, currency: "USD", cost_category: "Storage", variance_from_baseline_pct: 0.2 },
];

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

const simulation_scenarios: SimulationScenario[] = [
  { id: "sim.ebs-expand", tenant_id: TENANT_ID, name: "Expand EBS volume on B2 online", description: "Grow the B2 root volume from 100 GiB → 200 GiB and rescan filesystem.", category: "Capacity", target_resource_id: "ebs-b2", base_state_ref: "seed:v1", created_at: NOW },
  { id: "sim.az-a-outage", tenant_id: TENANT_ID, name: "Availability Zone A outage", description: "Simulate loss of AZ us-east-1a and observe failover to AZ B.", category: "Failure", target_resource_id: "az.us-east-1a", base_state_ref: "seed:v1", created_at: NOW },
];

const simulation_events: SimulationEvent[] = [];
const synthetic_impact_results: SyntheticImpactResult[] = [];

// ---------------------------------------------------------------------------
// Final dataset
// ---------------------------------------------------------------------------

export const awsCotsSeed: AwsCotsDataset = {
  tenant,
  business_services,
  applications,
  aws_accounts,
  aws_regions,
  availability_zones,
  aws_resources,
  aws_resource_configurations,
  resource_relationships,
  telemetry_definitions,
  telemetry_observations,
  alerts,
  incidents,
  changes,
  runbooks,
  automation_actions,
  security_findings,
  compliance_findings,
  backup_status_records,
  cost_observations,
  simulation_scenarios,
  simulation_events,
  synthetic_impact_results,
};

/** Compile-time exhaustiveness helper — every resource_type is a known value. */
export type _EnsureAllResourceTypesReferenced = AwsResourceType;
