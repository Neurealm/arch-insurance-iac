// SRE Digital Twin Operating System — mock data structured so real telemetry
// (CloudWatch, ServiceNow, Jira, APM, FinOps, CMDB) could replace it later.

export type CoworkerStatus =
  | "Idle" | "Monitoring" | "Investigating" | "Recommending"
  | "Executing" | "Waiting for Approval" | "Completed";

export interface Simulation {
  id: string;
  name: string;
  severity: "Low" | "Moderate" | "High" | "Critical";
  scenarioMap: string; // maps to existing ScenarioId in the page
  blastRadius: string;
  customerImpact: string;
  sloImpact: string;
  mttrForecast: string;
  runbook: string;
  automation: "Eligible" | "Partial" | "Manual";
  approval: "Required" | "Not required";
  rollback: string;
  description: string;
}

export const simulations: Simulation[] = [
  { id: "kill_ec2_02", name: "Kill EC2 App 02", severity: "High", scenarioMap: "ec2_02_degraded",
    blastRadius: "Application API, Session Service, Transaction Submission",
    customerImpact: "≈18% sessions if traffic not drained",
    sloImpact: "Error rate 0.74% · P95 246 ms", mttrForecast: "18 minutes",
    runbook: "Drain, Replace, Validate", automation: "Eligible", approval: "Required",
    rollback: "Re-register instance and restore prior target weight",
    description: "EC2 App 02 becomes Critical. Target group reports 2/3 healthy." },
  { id: "cpu_saturate_01", name: "Saturate CPU on EC2 App 01", severity: "Moderate", scenarioMap: "ec2_02_degraded",
    blastRadius: "Application API tier", customerImpact: "Latency spikes for ~12% of sessions",
    sloImpact: "Burn rate 1.9× · P95 291 ms", mttrForecast: "22 minutes",
    runbook: "Scale Out and Inspect Saturation", automation: "Partial", approval: "Required",
    rollback: "Scale-in to prior desired capacity",
    description: "CPU 94% · Memory 83%. ASG evaluates capacity." },
  { id: "az_a_degrade", name: "Degrade Availability Zone A", severity: "Critical", scenarioMap: "az_a_impair",
    blastRadius: "AZ-A subnets, EC2 App 01 + 03, dependent services",
    customerImpact: "Moderate · regional latency variance",
    sloImpact: "Resilience score 82 → 61", mttrForecast: "30 minutes",
    runbook: "Validate Failover and Rebalance", automation: "Partial", approval: "Required",
    rollback: "Restore AZ-A traffic share after health restored",
    description: "EC2 App 01 and 03 degraded; traffic shifts to AZ-B." },
  { id: "alb_5xx_spike", name: "Create ALB 5xx spike", severity: "High", scenarioMap: "alb_5xx",
    blastRadius: "Edge listener, target group, all downstream services",
    customerImpact: "User facing 5xx on /api/* paths",
    sloImpact: "5xx 1.8% · Burn 2.4×", mttrForecast: "16 minutes",
    runbook: "ALB 5xx Triage", automation: "Partial", approval: "Required",
    rollback: "Revert listener rule change", description: "Inspect target group, listener changes, and app response codes." },
  { id: "tls_expire", name: "Expire TLS certificate", severity: "Critical", scenarioMap: "security_exposure",
    blastRadius: "ALB :443 listener, all HTTPS clients",
    customerImpact: "Service interruption if not renewed",
    sloImpact: "Availability risk", mttrForecast: "12 minutes",
    runbook: "Cert Renew + Listener Bind", automation: "Eligible", approval: "Required",
    rollback: "Reattach prior valid certificate",
    description: "ACM certificate within renewal window." },
  { id: "packet_loss", name: "Introduce packet loss", severity: "Moderate", scenarioMap: "az_a_impair",
    blastRadius: "VPC network path, NAT gateway",
    customerImpact: "Intermittent latency, elevated retries",
    sloImpact: "P95 +90 ms", mttrForecast: "25 minutes",
    runbook: "Network Path Audit", automation: "Manual", approval: "Required",
    rollback: "Restore prior route table and NACL set",
    description: "Inspect route table, NAT gateway, NACL posture." },
  { id: "bad_deploy", name: "Simulate bad deployment", severity: "High", scenarioMap: "ec2_02_degraded",
    blastRadius: "EC2 App 02 + 03 application errors",
    customerImpact: "Partial transaction failures",
    sloImpact: "Error rate 1.1%", mttrForecast: "14 minutes",
    runbook: "Rollback Release", automation: "Eligible", approval: "Required",
    rollback: "Pin previous AMI/build", description: "Deployment event flagged as probable trigger." },
  { id: "db_latency", name: "Trigger database latency dependency", severity: "Moderate", scenarioMap: "ec2_02_degraded",
    blastRadius: "Data Service → Application API → Transaction Submission",
    customerImpact: "Slow transactions, elevated wait time",
    sloImpact: "P95 +140 ms", mttrForecast: "28 minutes",
    runbook: "Trace App Dependency", automation: "Partial", approval: "Required",
    rollback: "Failover to read replica",
    description: "Downstream Data Service shows elevated latency." },
  { id: "exhaust_budget", name: "Exhaust error budget", severity: "Critical", scenarioMap: "alb_5xx",
    blastRadius: "All change governance",
    customerImpact: "Reliability risk increasing",
    sloImpact: "Budget < 10%", mttrForecast: "Policy driven",
    runbook: "Freeze + Stabilize", automation: "Partial", approval: "Required",
    rollback: "Resume normal change cadence after recovery",
    description: "Freeze nonessential changes and prioritize stability." },
  { id: "sg_exposure", name: "Create security group exposure", severity: "High", scenarioMap: "security_exposure",
    blastRadius: "Ingress paths · sg-debug-temp",
    customerImpact: "Potential data exposure",
    sloImpact: "Security posture Warning", mttrForecast: "20 minutes",
    runbook: "SG Hardening", automation: "Eligible", approval: "Required",
    rollback: "Restore restrictive ingress",
    description: "Restrict ingress, validate owner, create change approval." },
];

/* ---------- Digital workforce ---------- */
export interface Coworker {
  id: string; name: string; role: string; status: CoworkerStatus;
  activity: string; confidence: number; lastAction: string; nextAction: string;
  owner: string; approval: "Required" | "Not required";
  runbook: string; evidence: string;
}

export const digitalCoworkers: Coworker[] = [
  { id: "incident_coord", name: "SRE Incident Coordinator", role: "Incident orchestration",
    status: "Investigating", activity: "Correlating alarms and opening incident context",
    confidence: 91, lastAction: "Confirmed target health degradation",
    nextAction: "Recommend traffic drain", owner: "SRE Lead", approval: "Not required",
    runbook: "Drain, Diagnose, Restart, Validate",
    evidence: "CloudWatch latency + target group health variance" },
  { id: "reliability", name: "Reliability Analyst", role: "Telemetry comparison",
    status: "Recommending", activity: "Comparing EC2 App 02 telemetry against peer nodes",
    confidence: 87, lastAction: "Detected CPU and memory deviation",
    nextAction: "Recommend restart and health validation", owner: "Platform Engineer",
    approval: "Required", runbook: "Drain, Diagnose, Restart, Validate",
    evidence: "Peer comparison report" },
  { id: "runbook_auto", name: "Runbook Automation Engineer", role: "Workflow execution",
    status: "Waiting for Approval", activity: "Preparing drain and restart workflow",
    confidence: 84, lastAction: "Validated rollback plan",
    nextAction: "Execute approved remediation", owner: "Incident Commander",
    approval: "Required", runbook: "Drain, Diagnose, Restart, Validate",
    evidence: "Workflow simulation + rollback checks" },
  { id: "cost", name: "Cloud Cost Optimizer", role: "FinOps", status: "Monitoring",
    activity: "Evaluating EC2 App 03 scale-in candidacy", confidence: 76,
    lastAction: "Flagged sustained low utilization", nextAction: "Suggest scheduled scale-in",
    owner: "FinOps Lead", approval: "Required", runbook: "Rightsizing Review",
    evidence: "7d utilization trend" },
  { id: "patch", name: "Patch Compliance Coordinator", role: "Vulnerability hygiene",
    status: "Monitoring", activity: "Tracking patch drift on EC2 App 02",
    confidence: 88, lastAction: "Identified 1 pending critical patch",
    nextAction: "Schedule maintenance window", owner: "SecOps", approval: "Required",
    runbook: "Patch Window", evidence: "SSM patch report" },
  { id: "security", name: "Security Guardrail Analyst", role: "Posture", status: "Monitoring",
    activity: "Validating SG ingress and TLS posture", confidence: 90,
    lastAction: "Detected sg-debug-temp drift", nextAction: "Recommend ingress restriction",
    owner: "CloudSec", approval: "Required", runbook: "SG Hardening",
    evidence: "Config Rules + Inspector findings" },
  { id: "change", name: "Change Risk Analyst", role: "Change correlation", status: "Investigating",
    activity: "Correlating recent listener rule change with 5xx spike", confidence: 82,
    lastAction: "Linked deployment to error window", nextAction: "Recommend revert",
    owner: "Release Manager", approval: "Required", runbook: "Rollback Release",
    evidence: "Change diff + deploy timeline" },
  { id: "owner", name: "Service Owner Advisor", role: "Service ownership", status: "Monitoring",
    activity: "Mapping impacted business capabilities to owners", confidence: 80,
    lastAction: "Updated ownership for Transaction Submission",
    nextAction: "Notify business owner", owner: "Service Owner", approval: "Not required",
    runbook: "—", evidence: "CMDB ownership lookup" },
  { id: "exec", name: "Executive Readout Analyst", role: "Stakeholder summary",
    status: "Monitoring", activity: "Summarizing business impact and recovery forecast",
    confidence: 79, lastAction: "Updated stakeholder summary",
    nextAction: "Publish recovery estimate", owner: "Engagement Manager",
    approval: "Required", runbook: "—", evidence: "Impact draft" },
  { id: "telemetry", name: "Telemetry Correlation Analyst", role: "Signal correlation",
    status: "Investigating", activity: "Joining metrics, logs, and traces across services",
    confidence: 86, lastAction: "Correlated latency to EC2 App 02",
    nextAction: "Surface trace exemplars", owner: "Observability Guild",
    approval: "Not required", runbook: "Signal Correlation", evidence: "X-Ray + Logs join" },
];

export const workforceActivity = [
  { t: "09:02", agent: "Reliability Analyst", action: "Detected latency variance",
    evidence: "CloudWatch P95 exceeded threshold", recommendation: "Recommend target health inspection",
    confidence: 92, approval: "No approval required" },
  { t: "09:05", agent: "SRE Incident Coordinator", action: "Confirmed degraded target",
    evidence: "Target group shows one impaired instance",
    recommendation: "Recommend traffic drain", confidence: 91, approval: "Approval required" },
  { t: "09:08", agent: "Runbook Automation Engineer", action: "Prepared restart workflow",
    evidence: "Rollback plan validated", recommendation: "Recommend controlled restart",
    confidence: 84, approval: "Approval required" },
  { t: "09:12", agent: "Executive Readout Analyst", action: "Updated impact summary",
    evidence: "Customer impact remains low", recommendation: "Recommend stakeholder update",
    confidence: 79, approval: "Approval required" },
];

/* ---------- Dependency map ---------- */
export type DepLayer = "infrastructure" | "service" | "business";

export const dependencyLayers: Record<DepLayer, { id: string; label: string; status?: string }[]> = {
  infrastructure: [
    { id: "vpc", label: "VPC" }, { id: "az_a", label: "AZ-A" }, { id: "az_b", label: "AZ-B" },
    { id: "subnet_pub", label: "Public Subnets" }, { id: "subnet_priv", label: "Private Subnets" },
    { id: "alb", label: "ALB" }, { id: "tg", label: "Target Group" }, { id: "asg", label: "Auto Scaling Group" },
    { id: "ec2_01", label: "EC2 App 01" }, { id: "ec2_02", label: "EC2 App 02" },
    { id: "ec2_03", label: "EC2 App 03" }, { id: "obs", label: "Observability" }, { id: "runbook", label: "Runbooks" },
  ],
  service: [
    { id: "front_door", label: "Web Front Door" }, { id: "auth", label: "Authentication Service" },
    { id: "api", label: "Application API" }, { id: "session", label: "Session Service" },
    { id: "data", label: "Data Access Service" }, { id: "notify", label: "Notification Service" },
    { id: "report", label: "Reporting Service" },
  ],
  business: [
    { id: "portal", label: "Customer Portal Access" }, { id: "login", label: "Account Login" },
    { id: "txn", label: "Transaction Submission" }, { id: "case", label: "Case Processing" },
    { id: "notif", label: "Customer Notification" }, { id: "ops_report", label: "Operational Reporting" },
    { id: "revenue", label: "Revenue Protection" },
  ],
};

export const dependencyPaths: Record<string, { services: string[]; capabilities: string[] }> = {
  ec2_01: { services: ["Application API", "Session Service"], capabilities: ["Transaction Submission", "Account Login"] },
  ec2_02: { services: ["Application API", "Session Service"], capabilities: ["Transaction Submission", "Operational Reporting"] },
  ec2_03: { services: ["Reporting Service", "Application API"], capabilities: ["Operational Reporting", "Case Processing"] },
  alb:    { services: ["Web Front Door", "Authentication Service"], capabilities: ["Customer Portal Access", "Account Login"] },
  vpc:    { services: ["All services"], capabilities: ["All business capabilities"] },
  asg:    { services: ["Application API"], capabilities: ["Transaction Submission"] },
  obs:    { services: ["All services (read-only)"], capabilities: ["Operational Reporting"] },
  runbook:{ services: ["All services"], capabilities: ["All capabilities (recovery)"] },
};

export const blastRadiusByComponent: Record<string, {
  users: string; revenue: string; cx: string; severity: string;
  action: string; serviceOwner: string; commsOwner: string;
}> = {
  ec2_02: {
    users: "≈18% of active sessions if traffic is not drained",
    revenue: "$42,000 / hour during sustained failure",
    cx: "Intermittent latency and partial transaction retries",
    severity: "Moderate",
    action: "Drain instance, validate peer capacity, restart application service, monitor SLO burn",
    serviceOwner: "Application Platform Team", commsOwner: "Incident Commander",
  },
  ec2_01: { users: "≈10% sessions", revenue: "$22,000 / hour", cx: "Login latency",
    severity: "Low", action: "Scale-out evaluation and saturation inspection",
    serviceOwner: "Application Platform Team", commsOwner: "SRE on-call" },
  ec2_03: { users: "Minor", revenue: "<$5,000 / hour", cx: "Reporting delay",
    severity: "Low", action: "Evaluate rightsizing",
    serviceOwner: "Application Platform Team", commsOwner: "FinOps" },
  alb: { users: "100% inbound traffic", revenue: "$120,000 / hour during 5xx event",
    cx: "User facing 5xx", severity: "High",
    action: "Inspect listener rules and target group", serviceOwner: "Platform SRE", commsOwner: "Incident Commander" },
  vpc: { users: "All", revenue: "Full service exposure", cx: "Network instability",
    severity: "Critical", action: "Network path audit", serviceOwner: "Cloud Platform", commsOwner: "Incident Commander" },
};

/* ---------- Transformation states ---------- */
export interface TransformationStateInfo {
  label: string;
  operatingModel: string; challenge: string; concern: string; shift: string;
  bullets: string[];
}

export const transformationStates: Record<"current" | "transition" | "target", TransformationStateInfo> = {
  current: {
    label: "Current State",
    operatingModel: "Reactive operations",
    challenge: "Manual triage and limited business impact visibility",
    concern: "MTTR depends too heavily on individual expertise",
    shift: "Standardize runbooks and connect telemetry to service ownership",
    bullets: [
      "Three EC2 instances", "Manual incident triage", "Manual runbook execution",
      "Limited dependency awareness", "Basic CloudWatch alerts",
      "No automated traffic drain", "Patch drift exists",
      "Cost optimization is periodic", "Business impact mapping is manual",
      "MTTR baseline is 112 minutes",
    ],
  },
  transition: {
    label: "Transition State",
    operatingModel: "Managed SRE adoption",
    challenge: "Automations require approval and evidence validation",
    concern: "Runbook maturity varies by component",
    shift: "Convert high frequency runbooks into governed digital coworker workflows",
    bullets: [
      "Standardized runbooks", "SLO and error budget visible",
      "Dependency map partially implemented", "Digital coworkers recommend actions",
      "Some runbook steps automated", "Incident timeline automated",
      "Cost recommendations available", "Security findings correlated",
      "MTTR improves to 37 minutes", "Automation reaches 42%",
    ],
  },
  target: {
    label: "Target State",
    operatingModel: "Proactive reliability engineering",
    challenge: "Govern automation safely across production",
    concern: "Ensure guardrails, evidence, and rollback are always enforced",
    shift: "Operationalize SLO based governance and automated remediation",
    bullets: [
      "Automated failure detection", "Automated traffic drain with approval guardrails",
      "Automated restart and validation workflow", "Digital coworker led diagnosis",
      "Human approved remediation", "Full dependency and business impact mapping",
      "SLO based change governance", "Continuous patch and security posture",
      "Continuous cost optimization", "MTTR target 15 minutes · Automation 80%",
      "Error budget burn actively governed",
    ],
  },
};

/* ---------- Executive value realization ---------- */
export interface ValueMetric {
  id: string; name: string; baseline: string; current: string; target: string;
  trend: "Improving" | "Stable" | "Watch";
  meaning: string; action: string;
}

export const valueMetrics: ValueMetric[] = [
  { id: "reliability", name: "Reliability Value", baseline: "99.50%", current: "99.93%", target: "99.95%",
    trend: "Improving", meaning: "More stable customer experience and fewer service interruptions",
    action: "Protect SLO through automated remediation and change governance" },
  { id: "mttr", name: "MTTR Value", baseline: "112 min", current: "37 min", target: "15 min",
    trend: "Improving", meaning: "Faster recovery and reduced operational disruption",
    action: "Automate the top five recovery runbooks" },
  { id: "automation", name: "Automation Value", baseline: "0%", current: "42%", target: "80%",
    trend: "Improving", meaning: "Lower toil and more consistent response quality",
    action: "Move approved diagnostic and remediation steps into digital coworker workflows" },
  { id: "cost", name: "Cost Value", baseline: "$8,300 / mo", current: "$7,840 / mo", target: "$7,200 / mo",
    trend: "Improving", meaning: "Improved infrastructure efficiency without reducing resilience",
    action: "Validate rightsizing and scheduled scale policies" },
  { id: "risk", name: "Risk Value", baseline: "High", current: "Moderate", target: "Low",
    trend: "Improving", meaning: "Reduced operational, security, and availability exposure",
    action: "Close patch drift and validate security group guardrails" },
  { id: "debt", name: "Technical Debt Value", baseline: "78", current: "54", target: "22",
    trend: "Improving", meaning: "Less brittle operating model and improved supportability",
    action: "Modernize runbook catalog and standardize telemetry coverage" },
];

export const executiveReadout = [
  ["Current reliability posture", "Stable three node application tier with moderate resilience and improving SLO posture."],
  ["Primary operational risk", "Manual remediation and limited dependency awareness can increase recovery time during partial failure."],
  ["Highest value remediation", "Automate target draining, instance restart validation, and SLO burn monitoring."],
  ["Automation opportunity", "Convert EC2 degradation response into an approved SRE digital coworker workflow."],
  ["Cost optimization opportunity", "Review EC2 App 03 utilization and evaluate scheduled scale in policy."],
  ["Security concern", "Patch compliance and security group exposure should be validated before production hardening."],
  ["Recommended next action", "Run a controlled failure simulation and validate ALB target recovery workflow."],
  ["Client conversation prompt", "Which production service would benefit most from this level of SRE visibility, resilience testing, and automation governance?"],
];

/* ---------- Timeline modes ---------- */
export const remediationTimeline = [
  "Confirm alarm", "Validate target group", "Drain impacted instance",
  "Restart application service", "Validate health checks",
  "Reintroduce traffic", "Monitor SLO burn", "Close incident summary",
];

export const transformationTimeline = [
  ["Week 1", "Baseline telemetry and SLOs"],
  ["Week 2", "Map dependencies and business capabilities"],
  ["Week 3", "Standardize runbooks"],
  ["Week 4", "Add digital coworker recommendations"],
  ["Week 5", "Automate approved diagnostics"],
  ["Week 6", "Automate guarded remediation"],
  ["Week 7", "Validate resilience testing"],
  ["Week 8", "Executive value readout"],
];

export const valueTimeline = [
  ["Baseline", "MTTR 112 minutes"],
  ["Month 1", "MTTR 67 minutes"],
  ["Month 2", "MTTR 37 minutes"],
  ["Month 3", "MTTR 24 minutes"],
  ["Target", "MTTR 15 minutes"],
];

/* ---------- Engagement workshop ---------- */
export const engagementPrompts = [
  "Which components create the highest reliability exposure?",
  "Which failures have the greatest business impact?",
  "Which runbooks should be standardized first?",
  "Which remediation steps can be automated safely?",
  "Which value metrics should be committed to in the target operating model?",
];

export const workshopOutput = {
  reliabilityRisks: ["AZ imbalance during EC2 partial failure", "Single listener rule blast radius on ALB", "Patch drift on EC2 App 02"],
  automationCandidates: ["Target drain + restart workflow", "Certificate renewal + listener bind", "ALB 5xx triage"],
  dependencyGaps: ["Data Service dependency not mapped to business capability", "Reporting Service ownership unclear", "Notification Service SLO not defined"],
  costOpportunities: ["EC2 App 03 scheduled scale-in", "ALB request unit review", "Observability log retention tuning"],
  securityActions: ["Close sg-debug-temp", "Validate ACM renewal automation", "Enforce SSM patch baseline"],
  plan: [
    ["Days 1–7", "Baseline SLOs, telemetry coverage, service ownership, and incident history."],
    ["Days 8–14", "Map dependencies, business capabilities, runbooks, and operational risks."],
    ["Days 15–21", "Prioritize automation candidates, define approval guardrails, and validate resilience simulations."],
    ["Days 22–30", "Implement first digital coworker workflow, measure MTTR improvement, and publish executive readout."],
  ] as [string, string][],
};
