// Guided Investigation Mode — mock data model + Payment Latency Incident hero
// All data is local mock; no live integrations.

export type StepStatus = "not_started" | "active" | "completed" | "skipped";

export interface EvidenceItem {
  label: string;
  value?: string;
  baseline?: string;
  actual?: string;
  change?: string;
  confidence?: number;
  source?: string;
  status?: "healthy" | "warning" | "critical" | "info";
}

export interface MetricSnapshot {
  metric: string;
  target?: string;
  baseline?: string;
  actual: string;
  forecast?: string;
  status?: "healthy" | "warning" | "critical" | "info";
  interpretation?: string;
}

export interface CanvasBehavior {
  focusMode: "single" | "path" | "blast" | "workflow";
  fadeUnrelated: boolean;
  showDependencyPath: boolean;
  pulseObjects: string[];
  showParticles: boolean;
  cameraTarget: string;
  zoomLevel: number;
}

export interface DecisionOption {
  id: string;
  title: string;
  confidence: number;
  risk: "Low" | "Medium" | "High";
  expectedRecovery: string;
  costImpact: string;
  expectedP95After: string;
  expectedErrorAfter: string;
  rollbackAvailable: boolean;
  humanApprovalRequired: boolean;
  recommended?: boolean;
}

export interface RunbookStep {
  label: string;
  status: "complete" | "waiting" | "pending";
}

export interface InvestigationStep {
  id: string;
  stepNumber: number;
  title: string;
  shortLabel: string;
  sreQuestion: string;
  narrative: string;
  focusObjects: string[];
  selectedObject: string;
  activeView: string;
  highlightedDependencyPath: string[];
  timelineEventId?: string;
  rightPanelFocus: string;
  novaPrompt: string;
  novaSummary: string;
  evidenceItems: EvidenceItem[];
  metricSnapshots: MetricSnapshot[];
  expectedInsight: string;
  suggestedAction: string;
  primaryButtonLabel: string;
  secondaryButtonLabel?: string;
  completionCriteria: string;
  talkingPoint: string;
  canvasBehavior: CanvasBehavior;
  decisionOptions?: DecisionOption[];
  runbook?: { name: string; changeId: string; status: string; steps: RunbookStep[]; approvers: string[] };
  reports?: string[];
}

export interface GuidedInvestigation {
  id: string;
  name: string;
  scenarioId: string;
  incidentId: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  primaryService: string;
  primaryTransaction: string;
  primaryApplicationService: string;
  primaryAwsResource: string;
  confidence: number;
  risk: "Low" | "Medium" | "High";
  objective: string;
  summary: string;
  rootCauseHypothesis: string;
  humanApprovalRequired: boolean;
  steps: InvestigationStep[];
  completionActions: string[];
}

const cb = (
  cameraTarget: string,
  focusMode: CanvasBehavior["focusMode"],
  pulseObjects: string[],
  opts: Partial<CanvasBehavior> = {},
): CanvasBehavior => ({
  focusMode,
  fadeUnrelated: true,
  showDependencyPath: focusMode !== "single",
  pulseObjects,
  showParticles: focusMode === "path" || focusMode === "blast",
  cameraTarget,
  zoomLevel: 1.1,
  ...opts,
});

export const PAYMENT_LATENCY_INVESTIGATION: GuidedInvestigation = {
  id: "inv-pay-latency",
  name: "Payment Latency Incident Guided Investigation",
  scenarioId: "payment-latency",
  incidentId: "INC 48291",
  severity: "Critical",
  primaryService: "Payment Services",
  primaryTransaction: "Process Payment",
  primaryApplicationService: "Payment Service",
  primaryAwsResource: "Aurora PostgreSQL",
  confidence: 87,
  risk: "Medium",
  objective: "Detect, diagnose, decide, remediate and communicate the Payment Latency Incident.",
  summary:
    "Walk the SRE team from business impact through telemetry, change correlation, APM evidence, blast radius, decision options, controlled remediation, and RCA.",
  rootCauseHypothesis:
    "Payment Service deployment v2.14.7 introduced connection pool saturation against Aurora PostgreSQL.",
  humanApprovalRequired: true,
  completionActions: [
    "Approve Remediation",
    "Generate RCA",
    "Generate Executive Summary",
    "Export Evidence Package",
    "Return to Digital Twin",
    "Restart Investigation",
  ],
  steps: [
    {
      id: "s1",
      stepNumber: 1,
      title: "Detect service degradation",
      shortLabel: "Detect",
      sreQuestion: "Which business service is unhealthy?",
      narrative:
        "Payment Services is breaching latency and error objectives. Start the investigation from business impact rather than infrastructure noise.",
      focusObjects: ["bs-pay"],
      selectedObject: "bs-pay",
      activeView: "biz",
      highlightedDependencyPath: ["bs-pay"],
      timelineEventId: "t-10-12",
      rightPanelFocus: "business-service",
      novaPrompt: "Why is Payment Services critical right now?",
      novaSummary:
        "Payment Services is breaching its latency and error objectives. The service is consuming error budget at an elevated rate and requires investigation.",
      evidenceItems: [
        { label: "Availability", baseline: "99.95%", actual: "99.72%", status: "critical" },
        { label: "P95 latency", baseline: "228 ms", actual: "912 ms", status: "critical" },
        { label: "Error rate", baseline: "0.08%", actual: "2.7%", status: "critical" },
        { label: "Risk score", actual: "89", status: "critical" },
        { label: "Business impact", actual: "High", status: "critical" },
      ],
      metricSnapshots: [
        { metric: "Availability", target: "99.95%", actual: "99.72%", status: "critical" },
        { metric: "P95 latency", baseline: "228 ms", actual: "912 ms", status: "critical" },
        { metric: "Error rate", baseline: "0.08%", actual: "2.7%", status: "critical" },
      ],
      expectedInsight: "The SRE team starts from business service impact, not infrastructure alerts.",
      suggestedAction: "Identify the degraded transaction.",
      primaryButtonLabel: "Next: Identify transaction",
      secondaryButtonLabel: "Open Service Details",
      completionCriteria: "User reviews Payment Services KPIs.",
      talkingPoint: "We start with business service health, not infrastructure noise.",
      canvasBehavior: cb("bs-pay", "single", ["bs-pay"], { showDependencyPath: false, showParticles: false }),
    },
    {
      id: "s2",
      stepNumber: 2,
      title: "Identify impacted transaction",
      shortLabel: "Transaction",
      sreQuestion: "Which user transaction is driving the service degradation?",
      narrative:
        "Process Payment is the primary degraded transaction. Latency, errors and volume all point to it.",
      focusObjects: ["bs-pay", "tx-pay"],
      selectedObject: "tx-pay",
      activeView: "tx",
      highlightedDependencyPath: ["bs-pay", "tx-pay"],
      timelineEventId: "t-10-08",
      rightPanelFocus: "transaction",
      novaPrompt: "Which transaction inside Payment Services is degraded?",
      novaSummary:
        "Process Payment is the highest contributor to Payment Services degradation based on latency, errors and transaction volume.",
      evidenceItems: [
        { label: "P50 latency", actual: "310 ms", status: "warning" },
        { label: "P95 latency", actual: "912 ms", status: "critical" },
        { label: "P99 latency", actual: "1,840 ms", status: "critical" },
        { label: "Error rate", actual: "2.7%", status: "critical" },
        { label: "Throughput", actual: "3,900 rpm", status: "info" },
        { label: "SLO target", actual: "99.95%", status: "info" },
        { label: "Actual SLO", actual: "99.72%", status: "critical" },
        { label: "Cost per 1k tx", actual: "$0.84", status: "warning" },
      ],
      metricSnapshots: [
        { metric: "P95 latency", baseline: "260 ms", actual: "912 ms", status: "critical" },
        { metric: "Error rate", baseline: "0.10%", actual: "2.7%", status: "critical" },
      ],
      expectedInsight: "The issue is not isolated to an alert — it is affecting a user transaction.",
      suggestedAction: "Trace the transaction to the responsible application service.",
      primaryButtonLabel: "Next: Trace to service",
      completionCriteria: "User reviews Process Payment metrics.",
      talkingPoint: "The degraded service is traced to the Process Payment transaction.",
      canvasBehavior: cb("tx-pay", "path", ["tx-pay"]),
    },
    {
      id: "s3",
      stepNumber: 3,
      title: "Trace to application service",
      shortLabel: "App service",
      sreQuestion: "Which application service is responsible for the degraded transaction?",
      narrative:
        "Process Payment maps directly to the Payment Service application, which recently deployed v2.14.7.",
      focusObjects: ["bs-pay", "tx-pay", "svc-pay"],
      selectedObject: "svc-pay",
      activeView: "apps",
      highlightedDependencyPath: ["bs-pay", "tx-pay", "svc-pay"],
      timelineEventId: "t-10-04",
      rightPanelFocus: "application-service",
      novaPrompt: "Which application service owns Process Payment latency?",
      novaSummary:
        "Payment Service is the application service most correlated with the degraded Process Payment transaction.",
      evidenceItems: [
        { label: "Runtime", actual: "ECS Fargate", status: "info" },
        { label: "Version", actual: "v2.14.7", status: "warning" },
        { label: "P95 latency", actual: "912 ms", status: "critical" },
        { label: "Error rate", actual: "2.7%", status: "critical" },
        { label: "Saturation", actual: "88%", status: "critical" },
        { label: "Traffic", actual: "3,900 rpm", status: "info" },
        { label: "Task count", actual: "42", status: "info" },
        { label: "Last deployment", actual: "2 hours ago", status: "warning" },
        { label: "Recent changes", actual: "3", status: "warning" },
        { label: "Owner", actual: "Payments SRE Squad", status: "info" },
      ],
      metricSnapshots: [
        { metric: "Saturation", baseline: "55%", actual: "88%", status: "critical" },
        { metric: "P95 latency", baseline: "260 ms", actual: "912 ms", status: "critical" },
      ],
      expectedInsight: "The degraded transaction maps directly to Payment Service.",
      suggestedAction: "Inspect downstream AWS dependencies.",
      primaryButtonLabel: "Next: Inspect AWS resource",
      completionCriteria: "User reviews Payment Service v2.14.7 details.",
      talkingPoint: "The transaction maps to Payment Service, which recently changed.",
      canvasBehavior: cb("svc-pay", "path", ["svc-pay"]),
    },
    {
      id: "s4",
      stepNumber: 4,
      title: "Identify saturated AWS resource",
      shortLabel: "AWS resource",
      sreQuestion: "Which AWS resource is causing the application service bottleneck?",
      narrative:
        "Aurora PostgreSQL is saturated. CPU, connection pool, and slow queries all point to a database bottleneck.",
      focusObjects: ["svc-pay", "aurora-pg"],
      selectedObject: "aurora-pg",
      activeView: "aws",
      highlightedDependencyPath: ["svc-pay", "aurora-pg"],
      timelineEventId: "t-10-11",
      rightPanelFocus: "aws-resource",
      novaPrompt: "Where is the infrastructure bottleneck under Payment Service?",
      novaSummary:
        "Aurora PostgreSQL is the most likely infrastructure bottleneck. Saturation aligns with the increase in Payment Service latency and errors.",
      evidenceItems: [
        { label: "CPU", actual: "91%", status: "critical" },
        { label: "Active connections", change: "+43%", actual: "elevated", status: "critical" },
        { label: "Connection pool saturation", actual: "94%", status: "critical" },
        { label: "Read latency", actual: "42 ms", status: "warning" },
        { label: "Write latency", actual: "87 ms", status: "critical" },
        { label: "Slow queries (15m)", actual: "128", status: "critical" },
        { label: "Locks", actual: "elevated", status: "warning" },
        { label: "Failover readiness", actual: "healthy", status: "healthy" },
        { label: "Backup status", actual: "healthy", status: "healthy" },
        { label: "Monthly cost", actual: "$62,400", status: "info" },
        { label: "Cost trend", change: "+18%", actual: "up", status: "warning" },
      ],
      metricSnapshots: [
        { metric: "Connection pool", target: "<75%", actual: "94%", status: "critical" },
        { metric: "CPU", target: "<70%", actual: "91%", status: "critical" },
      ],
      expectedInsight: "The bottleneck is at the database connection and saturation layer.",
      suggestedAction: "Correlate the degradation to recent changes.",
      primaryButtonLabel: "Next: Correlate change",
      completionCriteria: "User reviews Aurora saturation telemetry.",
      talkingPoint: "Aurora PostgreSQL is saturated and is the main resource bottleneck.",
      canvasBehavior: cb("aurora-pg", "path", ["aurora-pg", "svc-pay"]),
    },
    {
      id: "s5",
      stepNumber: 5,
      title: "Correlate recent change",
      shortLabel: "Change",
      sreQuestion: "What changed before the degradation started?",
      narrative:
        "Payment Service deployment v2.14.7 completed 12 minutes before the degradation. Telemetry sequence aligns tightly.",
      focusObjects: ["deploy-v2147", "svc-pay", "aurora-pg"],
      selectedObject: "deploy-v2147",
      activeView: "changes",
      highlightedDependencyPath: ["deploy-v2147", "svc-pay", "aurora-pg"],
      timelineEventId: "t-10-04",
      rightPanelFocus: "change-correlation",
      novaPrompt: "What changed before Payment Services degraded?",
      novaSummary:
        "Timing and telemetry indicate deployment v2.14.7 is strongly correlated with the database saturation pattern.",
      evidenceItems: [
        { label: "10:04", actual: "Deployment v2.14.7 completed", status: "info" },
        { label: "10:08", actual: "P95 latency began rising", status: "warning" },
        { label: "10:11", actual: "Aurora CPU threshold breached", status: "critical" },
        { label: "10:12", actual: "Payment error rate exceeded SLO", status: "critical" },
        { label: "10:14", actual: "SQS queue depth began increasing", status: "warning" },
        { label: "Correlation confidence", actual: "87%", confidence: 87, status: "critical" },
      ],
      metricSnapshots: [
        { metric: "Time to symptom", actual: "4 min after deploy", status: "warning" },
        { metric: "Correlation confidence", actual: "87%", status: "critical" },
      ],
      expectedInsight: "The investigation now has a probable change-related cause.",
      suggestedAction: "Validate supporting APM evidence.",
      primaryButtonLabel: "Next: Validate APM",
      completionCriteria: "User reviews change correlation window.",
      talkingPoint: "The deployment occurred before the degradation and has strong correlation.",
      canvasBehavior: cb("deploy-v2147", "path", ["deploy-v2147"]),
    },
    {
      id: "s6",
      stepNumber: 6,
      title: "Validate APM evidence",
      shortLabel: "APM",
      sreQuestion: "Do traces confirm the suspected bottleneck?",
      narrative:
        "Trace waterfall confirms time is spent inside Payment Service and Aurora — not the edge, API gateway, or KMS.",
      focusObjects: ["svc-pay", "aurora-pg"],
      selectedObject: "apm-trace",
      activeView: "apm",
      highlightedDependencyPath: ["g-edge", "g-api", "svc-pay", "aurora-pg"],
      timelineEventId: "t-apm",
      rightPanelFocus: "apm-trace",
      novaPrompt: "Do traces confirm Aurora is the bottleneck?",
      novaSummary:
        "APM traces confirm the bottleneck is concentrated in Payment Service and Aurora PostgreSQL, not the edge, API gateway, or KMS.",
      evidenceItems: [
        { label: "CloudFront", actual: "18 ms", status: "healthy" },
        { label: "API Gateway", actual: "32 ms", status: "healthy" },
        { label: "Payment Service", actual: "612 ms", status: "critical" },
        { label: "Aurora PostgreSQL", actual: "412 ms", status: "critical" },
        { label: "KMS", actual: "28 ms", status: "healthy" },
        { label: "SQS", actual: "184 ms", status: "warning" },
        { label: "Notification Service", actual: "96 ms", status: "info" },
      ],
      metricSnapshots: [
        { metric: "Slowest span", actual: "Payment Service 612 ms", status: "critical" },
        { metric: "DB time", actual: "412 ms", status: "critical" },
      ],
      expectedInsight: "The root cause hypothesis is supported by traces, not only metrics.",
      suggestedAction: "Assess blast radius.",
      primaryButtonLabel: "Next: Assess blast radius",
      completionCriteria: "User reviews APM trace waterfall.",
      talkingPoint: "APM traces confirm where latency is actually being spent.",
      canvasBehavior: cb("apm-trace", "path", ["svc-pay", "aurora-pg"]),
    },
    {
      id: "s7",
      stepNumber: 7,
      title: "Assess blast radius",
      shortLabel: "Blast radius",
      sreQuestion: "What else is impacted?",
      narrative:
        "Order Management and Notification Services are downstream affected through SQS Payment Events queue.",
      focusObjects: ["bs-pay", "bs-om", "bs-noti", "sqs-pay"],
      selectedObject: "blast-radius",
      activeView: "biz",
      highlightedDependencyPath: ["bs-pay", "svc-pay", "sqs-pay", "svc-noti", "bs-noti", "bs-om"],
      timelineEventId: "t-10-14",
      rightPanelFocus: "blast-radius",
      novaPrompt: "Show me the full blast radius.",
      novaSummary:
        "Blast radius has expanded from Payment Services to downstream order confirmation and notification workflows due to event processing delay.",
      evidenceItems: [
        { label: "Payment Services", actual: "Critical", status: "critical" },
        { label: "Order Management", actual: "Warning", status: "warning" },
        { label: "Notification Services", actual: "Warning", status: "warning" },
        { label: "Process Payment", actual: "Critical", status: "critical" },
        { label: "Submit Order", actual: "Warning", status: "warning" },
        { label: "Payment Service", actual: "Critical", status: "critical" },
        { label: "Aurora PostgreSQL", actual: "Critical", status: "critical" },
        { label: "SQS Payment Events", actual: "Warning", status: "warning" },
      ],
      metricSnapshots: [
        { metric: "SQS queue depth", actual: "24,000 msg", status: "warning" },
        { metric: "Oldest message age", actual: "11 min", status: "warning" },
        { metric: "Dead-letter queue", actual: "142", status: "warning" },
        { metric: "Order confirmation delay", actual: "elevated", status: "warning" },
        { metric: "Notification delivery latency", actual: "elevated", status: "warning" },
      ],
      expectedInsight: "Issue is broader than a single service but contained to a known dependency chain.",
      suggestedAction: "Review decision options.",
      primaryButtonLabel: "Next: Compare options",
      completionCriteria: "User reviews the expanded dependency path.",
      talkingPoint: "The blast radius is contained but downstream services are now affected.",
      canvasBehavior: cb("blast-radius", "blast", ["bs-pay", "bs-om", "bs-noti"]),
    },
    {
      id: "s8",
      stepNumber: 8,
      title: "Compare remediation options",
      shortLabel: "Decision",
      sreQuestion: "What is the best action?",
      narrative:
        "NOVA compares three remediation options on confidence, risk, recovery time, and cost.",
      focusObjects: ["decision-panel", "svc-pay", "aurora-pg"],
      selectedObject: "decision-panel",
      activeView: "actions",
      highlightedDependencyPath: ["svc-pay", "aurora-pg"],
      timelineEventId: "t-10-20",
      rightPanelFocus: "decision-options",
      novaPrompt: "What is the recommended remediation?",
      novaSummary:
        "Rollback is recommended because it addresses the likely root cause, has the highest confidence, and restores latency and error rate closest to baseline.",
      evidenceItems: [],
      metricSnapshots: [],
      decisionOptions: [
        {
          id: "rollback",
          title: "Rollback Payment Service deployment v2.14.7",
          confidence: 87,
          risk: "Medium",
          expectedRecovery: "15 min after approval",
          costImpact: "Reduces hourly cost from $742 → $518",
          expectedP95After: "260 ms",
          expectedErrorAfter: "0.18%",
          rollbackAvailable: true,
          humanApprovalRequired: true,
          recommended: true,
        },
        {
          id: "scale-aurora",
          title: "Scale Aurora writer instance",
          confidence: 72,
          risk: "Medium",
          expectedRecovery: "18 min",
          costImpact: "Increases hourly cost",
          expectedP95After: "420 ms",
          expectedErrorAfter: "0.45%",
          rollbackAvailable: true,
          humanApprovalRequired: true,
        },
        {
          id: "scale-ecs",
          title: "Increase ECS task count",
          confidence: 41,
          risk: "Low",
          expectedRecovery: "Unlikely to recover",
          costImpact: "Increases compute cost",
          expectedP95After: "880 ms",
          expectedErrorAfter: "2.4%",
          rollbackAvailable: true,
          humanApprovalRequired: false,
        },
      ],
      expectedInsight: "Decision is based on evidence, not alert severity alone.",
      suggestedAction: "Prepare human-approved remediation.",
      primaryButtonLabel: "Next: Prepare remediation",
      secondaryButtonLabel: "Ask NOVA",
      completionCriteria: "User reviews remediation comparison.",
      talkingPoint: "The system compares remediation choices using confidence, risk, recovery, and cost.",
      canvasBehavior: cb("decision-panel", "path", ["svc-pay", "aurora-pg"]),
    },
    {
      id: "s9",
      stepNumber: 9,
      title: "Prepare remediation workflow",
      shortLabel: "Runbook",
      sreQuestion: "What must happen before automation executes?",
      narrative:
        "Rollback runbook is staged. Human approval is required because Payment Services is business-critical.",
      focusObjects: ["runbook", "svc-pay"],
      selectedObject: "runbook",
      activeView: "actions",
      highlightedDependencyPath: ["svc-pay", "aurora-pg"],
      timelineEventId: "t-10-22",
      rightPanelFocus: "runbook",
      novaPrompt: "What gates this remediation?",
      novaSummary:
        "The rollback runbook is ready. Human approval is required before execution because the service is business-critical and the change affects payment processing.",
      evidenceItems: [],
      metricSnapshots: [],
      runbook: {
        name: "Rollback Payment Service v2.14.7",
        changeId: "CHG 77128",
        status: "Awaiting approval",
        approvers: ["Incident Commander", "Service Owner", "Change Manager"],
        steps: [
          { label: "Validate active incident state", status: "complete" },
          { label: "Confirm previous artifact version", status: "complete" },
          { label: "Create emergency change", status: "complete" },
          { label: "Request human approval", status: "waiting" },
          { label: "Drain active connections", status: "pending" },
          { label: "Deploy previous version", status: "pending" },
          { label: "Monitor latency recovery", status: "pending" },
          { label: "Generate incident update", status: "pending" },
          { label: "Generate RCA draft", status: "pending" },
        ],
      },
      expectedInsight: "Automation is controlled through guardrails and approval.",
      suggestedAction: "Approve remediation or generate stakeholder update.",
      primaryButtonLabel: "Next: Communicate & RCA",
      secondaryButtonLabel: "Approve Remediation",
      completionCriteria: "User reviews runbook and emergency change.",
      talkingPoint: "Automation is gated by human approval and operational guardrails.",
      canvasBehavior: cb("runbook", "workflow", ["svc-pay"]),
    },
    {
      id: "s10",
      stepNumber: 10,
      title: "Communicate and generate RCA",
      shortLabel: "Communicate",
      sreQuestion: "How do we communicate and prevent recurrence?",
      narrative:
        "Generate executive summary, RCA draft, and prevention backlog from the investigation evidence.",
      focusObjects: ["rca", "exec-summary"],
      selectedObject: "rca",
      activeView: "actions",
      highlightedDependencyPath: ["svc-pay", "aurora-pg"],
      timelineEventId: "t-10-26",
      rightPanelFocus: "rca",
      novaPrompt: "Generate executive update and RCA draft.",
      novaSummary:
        "The incident has enough telemetry, timeline and change evidence to generate an initial RCA and executive summary.",
      evidenceItems: [],
      metricSnapshots: [],
      reports: [
        "Generate Executive Update",
        "Generate Engineering Update",
        "Generate Service Owner Update",
        "Generate RCA Draft",
        "Generate Prevention Backlog",
        "Export Evidence Package",
      ],
      expectedInsight: "The platform closes the loop from detection to learning.",
      suggestedAction: "Complete investigation.",
      primaryButtonLabel: "Complete Investigation",
      secondaryButtonLabel: "Generate RCA",
      completionCriteria: "User generates communication and RCA outputs.",
      talkingPoint: "The platform generates communications and RCA evidence from the investigation.",
      canvasBehavior: cb("rca", "workflow", []),
    },
  ],
};

export const TIMELINE_EVENTS: { id: string; time: string; label: string; tone: "info" | "warning" | "critical" }[] = [
  { id: "t-10-04", time: "10:04", label: "Payment Service v2.14.7 deployed", tone: "info" },
  { id: "t-10-08", time: "10:08", label: "P95 latency begins rising", tone: "warning" },
  { id: "t-10-11", time: "10:11", label: "Aurora CPU threshold breached", tone: "critical" },
  { id: "t-10-12", time: "10:12", label: "Payment error rate exceeds SLO", tone: "critical" },
  { id: "t-10-14", time: "10:14", label: "SQS queue depth increasing", tone: "warning" },
  { id: "t-10-16", time: "10:16", label: "Order Management → Warning", tone: "warning" },
  { id: "t-apm",   time: "10:18", label: "APM trace anomalies confirmed", tone: "warning" },
  { id: "t-10-20", time: "10:20", label: "NOVA root cause hypothesis", tone: "info" },
  { id: "t-10-22", time: "10:22", label: "Emergency change CHG 77128 drafted", tone: "info" },
  { id: "t-10-24", time: "10:24", label: "Human approval requested", tone: "warning" },
  { id: "t-10-26", time: "10:26", label: "Rollback runbook ready", tone: "info" },
  { id: "t-10-30", time: "10:30", label: "Awaiting approval", tone: "warning" },
];

export const GUIDED_INVESTIGATIONS: Record<string, GuidedInvestigation> = {
  "payment-latency": PAYMENT_LATENCY_INVESTIGATION,
};

export function getInvestigationForScenario(scenarioId: string): GuidedInvestigation | null {
  return GUIDED_INVESTIGATIONS[scenarioId] ?? null;
}
