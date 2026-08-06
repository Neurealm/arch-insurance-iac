/**
 * Team Persona Library — deterministic seeded demonstration data.
 * Synthetic enterprise content only. No backend, no real employee data.
 */

export type LibraryView = "portfolio" | "operating-model" | "relationship" | "governance";

export type Freshness = "Current" | "Aging" | "Stale";

export interface PersonaMetric {
  name: string; baseline: string; target: string; warning: string; critical: string;
}

export interface PersonaDependency {
  name: string; type: "Team" | "Service" | "System" | "API" | "Data Product" | "External Provider";
  direction: "Upstream" | "Downstream"; criticality: "Critical" | "High" | "Medium" | "Low"; confidence: number;
}

export interface PersonaRisk {
  risk: string; failureMode: string; control: string; mitigation: string; escalationTrigger: string; recovery: string;
}

export interface PersonaThinking {
  decisionPriorities: string[];
  successCriteria: string[];
  failureModes: string[];
  commonTradeoffs: string[];
  preferredEvidence: string[];
  escalationPhilosophy: string[];
  riskAppetite: string[];
}

export interface LibraryPersona {
  id: string;
  teamId: string;
  teamName: string;
  businessUnit: string;
  knowledgeDomains: string[];
  mission: string;
  responsibilities: string[];
  boundaries: string[];
  exclusions: string[];
  capabilities: { name: string; kind: "Business" | "Operational"; criticality: string; owner: string; conditions: number }[];
  products: string[];
  services: { name: string; criticality: string; slo: string }[];
  apis: string[];
  systems: string[];
  dataProducts: string[];
  internalCustomers: string[];
  externalCustomers: string[];
  stakeholders: string[];
  regulatoryStakeholders: string[];
  partners: string[];
  customerJourneys: string[];
  objectives: string[];
  keyResults: string[];
  serviceLevelObjectives: string[];
  metrics: PersonaMetric[];
  policies: string[];
  constraints: string[];
  costGuardrails: string[];
  complianceObligations: string[];
  operationalWindows: string[];
  changeRestrictions: string[];
  approvalRequirements: string[];
  dependencies: PersonaDependency[];
  risks: PersonaRisk[];
  assumptions: string[];
  decisionRules: string[];
  thinking: PersonaThinking;
  upstreamTeams: string[];
  downstreamTeams: string[];
  evidence: { conditionId: string; statement: string; artifact: string; passage: string; authority: string; confidence: number; freshness: Freshness }[];
  usage: { impactEvaluations: number; incomingWork: number; decisionReferences: number; searchRetrievals: number; graphRelationships: number; lastUsedAt: string };
  versions: { version: string; status: string; effectiveDate: string; changeSummary: string; approvedBy: string }[];
  audit: { at: string; action: string; actor: string; result: string; auditId: string }[];
  conditionCount: number;
  dependencyCount: number;
  qualityScore: number;
  completenessScore: number;
  confidence: number;
  freshnessStatus: Freshness;
  constructionStatus: "Approved" | "Review Required" | "Draft" | "Stale" | "Conflict" | "Refreshing";
  approvalState: string;
  personaOwner: string;
  teamOwner: string;
  technicalOwner: string;
  version: string;
  riskLevel: "Low" | "Medium" | "High";
  dependencyCriticality: "Low" | "Medium" | "High" | "Critical";
  accessClassification: "Internal" | "Confidential" | "Restricted";
  region: string;
  environment: string;
  versionStatus: "Current" | "Superseded" | "Draft";
  driftStatus: "None" | "Minor" | "Material";
  reviewStatus: "None" | "Requested" | "In Review";
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

const thinkingPayments: PersonaThinking = {
  decisionPriorities: [
    "Payment integrity",
    "Customer checkout completion",
    "Reliability",
    "Security",
    "Regulatory compliance",
    "Operational reversibility",
  ],
  successCriteria: [
    "Availability at least 99.95 percent",
    "P95 latency below 250 milliseconds during peak periods",
    "Error rate below 0.3 percent target",
    "No duplicate transactions",
    "No unauthorized token persistence",
  ],
  failureModes: [
    "Payment authorization unavailable",
    "Retry amplification causing duplicate processing",
    "Identity latency blocking checkout",
    "Fraud timeout causing abandonment",
    "Regional dependency failure",
  ],
  commonTradeoffs: [
    "Fraud protection versus checkout conversion",
    "Retry aggressiveness versus duplicate transaction risk",
    "Release speed versus operational stability",
    "Regional resilience versus implementation complexity",
  ],
  preferredEvidence: [
    "Production telemetry",
    "Controlled experiments",
    "Incident trends",
    "Customer conversion metrics",
    "Fraud loss metrics",
    "Dependency health",
  ],
  escalationPhilosophy: [
    "Escalate before customer impact becomes widespread",
    "Include affected dependency owners",
    "Use contained escalation for measurable degradation",
    "Use critical escalation for payment integrity or broad customer impact",
  ],
  riskAppetite: [
    "Low tolerance for payment integrity, security, and compliance risk",
    "Moderate tolerance for reversible performance experimentation",
    "Higher tolerance for internal tooling change without customer or financial exposure",
  ],
};

const genericThinking = (team: string, priorities: string[], success: string[], failure: string[], tradeoffs: string[]): PersonaThinking => ({
  decisionPriorities: priorities,
  successCriteria: success,
  failureModes: failure,
  commonTradeoffs: tradeoffs,
  preferredEvidence: ["Production telemetry", "Incident trends", "Approved business conditions", "Dependency health", "Customer impact metrics"],
  escalationPhilosophy: [
    `Escalate when ${team} objectives are measurably at risk`,
    "Include dependency owners in the first escalation hop",
    "Use critical escalation for customer facing or regulatory exposure",
  ],
  riskAppetite: [
    "Low tolerance for compliance and customer trust risk",
    "Moderate tolerance for reversible operational change",
    "Higher tolerance for internal change without customer exposure",
  ],
});

function persona(seed: Partial<LibraryPersona> & Pick<LibraryPersona,
  "id" | "teamName" | "businessUnit" | "mission" | "qualityScore" | "completenessScore" | "confidence" |
  "freshnessStatus" | "constructionStatus" | "approvalState" | "conditionCount" | "dependencyCount" | "personaOwner">): LibraryPersona {
  const team = seed.teamName;
  return {
    teamId: seed.id.toLowerCase().replace(/\s+/g, "-"),
    knowledgeDomains: ["Payments", "Reliability"],
    responsibilities: [`Own the ${team} operating model`, `Maintain approved service commitments for ${team}`, "Coordinate change with dependent teams"],
    boundaries: [`${team} owns the services it publishes and the conditions mapped to them`, "Shared platform capabilities are governed jointly"],
    exclusions: ["Does not own downstream consumer experiences", "Does not own enterprise identity policy"],
    capabilities: [
      { name: `${team} core capability`, kind: "Business", criticality: "Critical", owner: seed.personaOwner, conditions: 84 },
      { name: `${team} operational readiness`, kind: "Operational", criticality: "High", owner: seed.personaOwner, conditions: 46 },
    ],
    products: [`${team} platform`],
    services: [{ name: `${team} service`, criticality: "Tier 1", slo: "99.9% availability" }],
    apis: [`${team} API`],
    systems: [`${team} control plane`],
    dataProducts: [`${team} operational metrics`],
    internalCustomers: ["Checkout Engineering", "Customer Support Operations"],
    externalCustomers: ["Enterprise merchants"],
    stakeholders: ["VP Engineering", "Director of Operations"],
    regulatoryStakeholders: ["Compliance Office"],
    partners: ["Managed platform partner"],
    customerJourneys: ["Checkout Customer Journey"],
    objectives: [`Improve ${team} reliability and predictability`],
    keyResults: ["Reduce customer impacting incidents by 25 percent"],
    serviceLevelObjectives: ["99.9 percent availability", "P95 latency below 400 milliseconds"],
    metrics: [
      { name: "Availability", baseline: "99.91%", target: "99.95%", warning: "99.90%", critical: "99.80%" },
      { name: "P95 latency", baseline: "290 ms", target: "250 ms", warning: "320 ms", critical: "450 ms" },
    ],
    policies: ["Change advisory approval required for tier 1 services"],
    constraints: ["No unapproved data retention", "Regional failover must remain tested quarterly"],
    costGuardrails: ["Infrastructure growth capped at 8 percent per quarter"],
    complianceObligations: ["PCI DSS controls apply to cardholder data paths"],
    operationalWindows: ["Standard change window Tuesday and Thursday, 02:00 to 05:00 UTC"],
    changeRestrictions: ["No production change during quarter end close"],
    approvalRequirements: ["Dependency owner approval for shared service change"],
    dependencies: [
      { name: "Identity Services", type: "Service", direction: "Upstream", criticality: "Critical", confidence: 92 },
      { name: "Observability Platform", type: "System", direction: "Upstream", criticality: "High", confidence: 95 },
      { name: "Checkout Engineering", type: "Team", direction: "Downstream", criticality: "Critical", confidence: 94 },
    ],
    risks: [
      {
        risk: "Upstream dependency degradation",
        failureMode: "Requests time out during peak traffic",
        control: "Circuit breaker with bounded retry",
        mitigation: "Regional failover with tested runbook",
        escalationTrigger: "Error rate above 1 percent for 5 minutes",
        recovery: "Recovery within 15 minutes of detection",
      },
    ],
    assumptions: ["Traffic profile remains within forecast plus 20 percent"],
    decisionRules: [
      "Reject change that reduces measured reliability without a rollback threshold",
      "Require dependency owner approval where shared services are affected",
    ],
    thinking: genericThinking(team,
      ["Reliability", "Customer outcome", "Compliance", "Operational reversibility"],
      ["Approved service levels met for the quarter", "No unresolved critical dependency conflicts"],
      ["Dependency saturation", "Unbounded retry behaviour", "Undetected configuration drift"],
      ["Speed of delivery versus operational stability", "Cost efficiency versus resilience"]),
    upstreamTeams: ["Identity Engineering", "Site Reliability Engineering"],
    downstreamTeams: ["Checkout Engineering", "Customer Support Operations"],
    evidence: [
      {
        conditionId: "COND 100421",
        statement: `${team} availability >= 99.95%`,
        artifact: "Payments API Reliability Requirements v3.2",
        passage: "The service shall maintain monthly availability of no less than 99.95 percent measured at the edge.",
        authority: "Authoritative",
        confidence: 96,
        freshness: "Current",
      },
      {
        conditionId: "COND 100488",
        statement: "Quarter end deployment restriction",
        artifact: "Engineering Change Policy v7",
        passage: "Production change is suspended during the final three business days of each fiscal quarter.",
        authority: "Policy",
        confidence: 93,
        freshness: "Current",
      },
    ],
    usage: { impactEvaluations: 4, incomingWork: 22, decisionReferences: 412, searchRetrievals: 806, graphRelationships: 4218, lastUsedAt: "Today 09:51" },
    versions: [
      { version: "v3.4", status: "Current", effectiveDate: "2026-07-28", changeSummary: "Retry approval threshold tightened", approvedBy: "Engineering Governance" },
      { version: "v3.3", status: "Superseded", effectiveDate: "2026-05-12", changeSummary: "Dependency confidence recalculated", approvedBy: "Engineering Governance" },
    ],
    audit: [
      { at: "2026-07-28 10:22", action: "Published", actor: "Engineering Governance", result: "Version published", auditId: "AUD 88421" },
      { at: "2026-07-27 16:04", action: "Approved", actor: seed.personaOwner, result: "Approval recorded", auditId: "AUD 88410" },
      { at: "2026-07-24 11:38", action: "Reviewed", actor: "Persona Review Board", result: "Two comments resolved", auditId: "AUD 88377" },
    ],
    teamOwner: `${team} Leadership`,
    technicalOwner: `${team} Principal Engineer`,
    version: "v3.4",
    riskLevel: "Medium",
    dependencyCriticality: "High",
    accessClassification: "Internal",
    region: "Global",
    environment: "Production",
    versionStatus: "Current",
    driftStatus: "None",
    reviewStatus: "None",
    createdAt: "2025-11-04",
    updatedAt: "2026-07-28",
    publishedAt: "2026-07-28",
    ...seed,
  } as LibraryPersona;
}

export const libraryPersonas: LibraryPersona[] = [
  persona({
    id: "PERSONA 1001",
    teamName: "Payments Platform",
    businessUnit: "Commerce Engineering",
    knowledgeDomains: ["Payments", "Reliability", "Risk"],
    mission: "Enable reliable, secure, low friction payment processing for every checkout transaction",
    qualityScore: 94, completenessScore: 92, confidence: 95, freshnessStatus: "Current",
    constructionStatus: "Approved", approvalState: "Approved", conditionCount: 428, dependencyCount: 18,
    personaOwner: "Jane Smith",
    teamOwner: "Payments Leadership", technicalOwner: "Payments Principal Engineer",
    riskLevel: "High", dependencyCriticality: "Critical", accessClassification: "Confidential",
    driftStatus: "Material",
    products: ["Payments Platform", "Regional Token Vault"],
    services: [
      { name: "Payments API", criticality: "Tier 0", slo: "99.95% availability, P95 < 250 ms" },
      { name: "Retry Orchestrator", criticality: "Tier 1", slo: "Bounded retry within 3 attempts" },
      { name: "Regional Token Vault", criticality: "Tier 0", slo: "99.99% availability" },
    ],
    apis: ["Payments Authorization API", "Refund API", "Tokenization API"],
    systems: ["Payments Core", "Retry Orchestrator", "Regional Token Vault"],
    dataProducts: ["Authorization outcome stream", "Payment reconciliation ledger"],
    capabilities: [
      { name: "Payment authorization", kind: "Business", criticality: "Critical", owner: "Jane Smith", conditions: 142 },
      { name: "Tokenization and vaulting", kind: "Business", criticality: "Critical", owner: "Payments Security", conditions: 96 },
      { name: "Retry orchestration", kind: "Operational", criticality: "High", owner: "Payments Reliability", conditions: 74 },
      { name: "Reconciliation support", kind: "Operational", criticality: "High", owner: "Finance Technology", conditions: 58 },
    ],
    internalCustomers: ["Checkout Engineering", "Finance Operations", "Customer Support Operations"],
    externalCustomers: ["Enterprise merchants", "Marketplace sellers"],
    stakeholders: ["Chief Commerce Officer", "VP Payments Engineering"],
    regulatoryStakeholders: ["PCI Compliance Office", "Regional payment regulators"],
    partners: ["Acquiring bank partners", "Card network partners"],
    customerJourneys: ["Checkout Customer Journey", "Refund Journey"],
    objectives: ["Protect payment integrity at enterprise scale", "Improve authorization success rate"],
    keyResults: ["Raise authorization success to 97.4 percent", "Zero duplicate transaction incidents"],
    serviceLevelObjectives: ["99.95 percent availability", "P95 latency below 250 milliseconds at peak", "Error rate below 0.3 percent"],
    metrics: [
      { name: "Availability", baseline: "99.94%", target: "99.95%", warning: "99.92%", critical: "99.85%" },
      { name: "P95 authorization latency", baseline: "238 ms", target: "250 ms", warning: "300 ms", critical: "400 ms" },
      { name: "Error rate", baseline: "0.21%", target: "0.30%", warning: "0.45%", critical: "0.80%" },
      { name: "Duplicate transaction rate", baseline: "0.00%", target: "0.00%", warning: "0.01%", critical: "0.05%" },
    ],
    policies: ["Cardholder data may never leave approved regional vaults", "All retries must be idempotent"],
    constraints: ["No token persistence outside the Regional Token Vault", "Retry exposure limited to approved traffic percentage"],
    costGuardrails: ["Authorization infrastructure cost per transaction below 0.6 cents"],
    complianceObligations: ["PCI DSS 4.0", "Regional payment reporting obligations"],
    operationalWindows: ["Change window Tuesday and Thursday 02:00 to 05:00 UTC"],
    changeRestrictions: ["No production change during quarter end close", "No retry policy change during peak commerce events"],
    approvalRequirements: ["Fraud Engineering approval for retry exposure above 10 percent of traffic", "Release Governance approval for tier 0 change"],
    dependencies: [
      { name: "Identity Services", type: "Service", direction: "Upstream", criticality: "Critical", confidence: 91 },
      { name: "Fraud Decision Service", type: "Service", direction: "Upstream", criticality: "Critical", confidence: 93 },
      { name: "Regional Token Vault", type: "System", direction: "Upstream", criticality: "Critical", confidence: 98 },
      { name: "Observability Platform", type: "System", direction: "Upstream", criticality: "High", confidence: 96 },
      { name: "Checkout Orchestrator", type: "Service", direction: "Downstream", criticality: "Critical", confidence: 95 },
      { name: "Finance Operations", type: "Team", direction: "Downstream", criticality: "High", confidence: 92 },
    ],
    risks: [
      {
        risk: "Retry amplification",
        failureMode: "Duplicate transaction processing during partial failure",
        control: "Idempotency key enforcement",
        mitigation: "Bounded retry with exponential backoff and traffic segmentation",
        escalationTrigger: "Duplicate rate above 0.01 percent",
        recovery: "Automatic retry disablement within 5 minutes",
      },
      {
        risk: "Identity latency",
        failureMode: "Checkout blocked awaiting identity validation",
        control: "Timeout with degraded validation path",
        mitigation: "Cached validation for low risk sessions",
        escalationTrigger: "P95 identity latency above 200 milliseconds",
        recovery: "Fallback path engaged within 2 minutes",
      },
      {
        risk: "Regional dependency failure",
        failureMode: "Regional vault unavailable",
        control: "Multi region replication",
        mitigation: "Tested regional failover runbook",
        escalationTrigger: "Vault availability below 99.9 percent",
        recovery: "Failover within 10 minutes",
      },
    ],
    assumptions: ["Peak commerce traffic remains within forecast plus 30 percent", "Fraud decision latency stays below 120 milliseconds"],
    decisionRules: [
      "Reject any retry change without idempotency test evidence",
      "Require Fraud Engineering approval when retry exposure exceeds 10 percent of traffic",
      "Require rollback threshold for any change affecting authorization paths",
      "Prefer reversible change over faster delivery for tier 0 services",
    ],
    thinking: thinkingPayments,
    upstreamTeams: ["Identity Engineering", "Fraud Engineering", "Site Reliability Engineering"],
    downstreamTeams: ["Checkout Engineering", "Finance Operations", "Customer Support Operations"],
    usage: { impactEvaluations: 9, incomingWork: 58, decisionReferences: 1284, searchRetrievals: 2211, graphRelationships: 14208, lastUsedAt: "Today 10:22" },
    versions: [
      { version: "v3.4", status: "Current", effectiveDate: "2026-07-28", changeSummary: "Retry approval threshold reduced to 10 percent traffic exposure", approvedBy: "Engineering Governance" },
      { version: "v3.3", status: "Superseded", effectiveDate: "2026-05-12", changeSummary: "Quarter end restriction and identity confidence updated", approvedBy: "Engineering Governance" },
      { version: "v3.2", status: "Superseded", effectiveDate: "2026-02-03", changeSummary: "Initial regional vault constraints added", approvedBy: "Payments Leadership" },
    ],
  }),
  persona({
    id: "PERSONA 1002",
    teamName: "Checkout Engineering",
    businessUnit: "Commerce Engineering",
    knowledgeDomains: ["Checkout", "Customer Experience"],
    mission: "Deliver a fast, resilient, and low friction customer checkout experience",
    qualityScore: 96, completenessScore: 97, confidence: 96, freshnessStatus: "Current",
    constructionStatus: "Approved", approvalState: "Approved", conditionCount: 362, dependencyCount: 22,
    personaOwner: "Marcus Lee", riskLevel: "Medium", dependencyCriticality: "Critical",
    products: ["Checkout Experience", "Checkout Orchestrator"],
    services: [
      { name: "Checkout Orchestrator", criticality: "Tier 0", slo: "99.95% availability" },
      { name: "Cart Service", criticality: "Tier 1", slo: "P95 < 180 ms" },
    ],
    thinking: genericThinking("Checkout Engineering",
      ["Checkout completion rate", "Customer friction reduction", "Latency", "Reliability", "Experiment velocity"],
      ["Completion rate above 92.5 percent", "P95 checkout render below 900 milliseconds", "No customer visible checkout errors above 0.2 percent"],
      ["Payment authorization delay", "Fraud challenge friction", "Client side render regression"],
      ["Conversion optimization versus fraud control", "Experiment velocity versus stability"]),
    version: "v4.1",
    versions: [
      { version: "v4.1", status: "Current", effectiveDate: "2026-07-26", changeSummary: "Conversion thresholds updated", approvedBy: "Commerce Leadership" },
      { version: "v4.0", status: "Superseded", effectiveDate: "2026-04-18", changeSummary: "Journey coverage expanded", approvedBy: "Commerce Leadership" },
    ],
  }),
  persona({
    id: "PERSONA 1003",
    teamName: "Fraud Engineering",
    businessUnit: "Risk Technology",
    knowledgeDomains: ["Fraud", "Risk"],
    mission: "Prevent fraudulent transactions while minimizing unnecessary customer friction",
    qualityScore: 93, completenessScore: 94, confidence: 94, freshnessStatus: "Current",
    constructionStatus: "Approved", approvalState: "Approved", conditionCount: 314, dependencyCount: 17,
    personaOwner: "Priya Patel", riskLevel: "High", dependencyCriticality: "Critical",
    products: ["Fraud Decision Platform"],
    services: [{ name: "Fraud Decision Service", criticality: "Tier 0", slo: "P95 < 120 ms" }],
    thinking: genericThinking("Fraud Engineering",
      ["Fraud loss prevention", "Decision accuracy", "Regulatory compliance", "Customer friction minimization"],
      ["Fraud loss basis points below plan", "False positive rate below 1.2 percent", "Decision latency below 120 milliseconds"],
      ["Model drift", "Decision timeout causing checkout abandonment", "Rule conflict with payment retry policy"],
      ["Fraud capture versus customer friction", "Rule strictness versus conversion"]),
  }),
  persona({
    id: "PERSONA 1004",
    teamName: "Identity Engineering",
    businessUnit: "Security Engineering",
    knowledgeDomains: ["Identity", "Security"],
    mission: "Provide secure, available, and performant identity validation services",
    qualityScore: 81, completenessScore: 84, confidence: 82, freshnessStatus: "Aging",
    constructionStatus: "Review Required", approvalState: "Conflict Review", conditionCount: 286, dependencyCount: 26,
    personaOwner: "Security Architecture", riskLevel: "High", dependencyCriticality: "Critical",
    driftStatus: "Material", reviewStatus: "In Review", accessClassification: "Restricted",
    services: [{ name: "Identity Services", criticality: "Tier 0", slo: "P95 < 150 ms" }],
    thinking: genericThinking("Identity Engineering",
      ["Security assurance", "Availability", "Latency", "Regulatory compliance"],
      ["Identity validation P95 below 150 milliseconds", "Zero unauthorized credential exposure"],
      ["Validation latency spike", "Credential store degradation", "Token refresh storm"],
      ["Security strictness versus checkout latency", "Session duration versus assurance"]),
  }),
  persona({
    id: "PERSONA 1005",
    teamName: "Site Reliability Engineering",
    businessUnit: "Platform Operations",
    knowledgeDomains: ["Reliability", "Observability"],
    mission: "Maintain reliability, observability, and operational resilience across critical services",
    qualityScore: 97, completenessScore: 98, confidence: 97, freshnessStatus: "Current",
    constructionStatus: "Approved", approvalState: "Approved", conditionCount: 512, dependencyCount: 31,
    personaOwner: "Reliability Operations", riskLevel: "Medium", dependencyCriticality: "Critical",
    services: [{ name: "Observability Platform", criticality: "Tier 0", slo: "99.99% ingestion availability" }],
    thinking: genericThinking("Site Reliability Engineering",
      ["Service reliability", "Blast radius containment", "Observability coverage", "Operational reversibility"],
      ["Error budget preserved for tier 0 services", "Mean time to detect below 3 minutes"],
      ["Alert fatigue", "Unobserved dependency failure", "Uncontrolled change velocity"],
      ["Change velocity versus error budget", "Alert sensitivity versus noise"]),
  }),
  persona({
    id: "PERSONA 1006",
    teamName: "Customer Support Operations",
    businessUnit: "Customer Experience",
    knowledgeDomains: ["Support", "Customer Experience"],
    mission: "Resolve customer issues quickly while preserving customer confidence and trust",
    qualityScore: 86, completenessScore: 79, confidence: 87, freshnessStatus: "Current",
    constructionStatus: "Draft", approvalState: "Owner Review", conditionCount: 248, dependencyCount: 15,
    personaOwner: "Customer Support Leadership", riskLevel: "Medium", dependencyCriticality: "Medium",
    versionStatus: "Draft", version: "v1.6", driftStatus: "Minor",
    thinking: genericThinking("Customer Support Operations",
      ["Customer trust", "Resolution speed", "Accuracy of information", "Escalation clarity"],
      ["First contact resolution above 74 percent", "Escalation acknowledgement within 10 minutes"],
      ["Unannounced product change", "Missing incident communication", "Knowledge article staleness"],
      ["Speed of response versus accuracy", "Automation versus empathy"]),
  }),
  persona({
    id: "PERSONA 1007",
    teamName: "Release Governance",
    businessUnit: "Engineering Operations",
    knowledgeDomains: ["Governance", "Change Management"],
    mission: "Protect enterprise stability while enabling timely and controlled software change",
    qualityScore: 92, completenessScore: 93, confidence: 94, freshnessStatus: "Current",
    constructionStatus: "Approved", approvalState: "Approved", conditionCount: 194, dependencyCount: 28,
    personaOwner: "Engineering Governance", riskLevel: "Low", dependencyCriticality: "High",
    thinking: genericThinking("Release Governance",
      ["Enterprise stability", "Change traceability", "Approval integrity", "Delivery predictability"],
      ["Zero unapproved tier 0 change", "Change failure rate below 4 percent"],
      ["Approval bypass", "Insufficient rollback evidence", "Change collision during restricted windows"],
      ["Delivery speed versus control", "Standardization versus team autonomy"]),
  }),
  persona({
    id: "PERSONA 1008",
    teamName: "Finance Operations",
    businessUnit: "Corporate Operations",
    knowledgeDomains: ["Finance", "Reconciliation"],
    mission: "Protect financial integrity, reconciliation accuracy, and operational control",
    qualityScore: 91, completenessScore: 92, confidence: 93, freshnessStatus: "Current",
    constructionStatus: "Approved", approvalState: "Approved", conditionCount: 226, dependencyCount: 19,
    personaOwner: "Finance Technology", riskLevel: "Medium", dependencyCriticality: "High",
    accessClassification: "Confidential",
    thinking: genericThinking("Finance Operations",
      ["Financial integrity", "Reconciliation accuracy", "Auditability", "Control effectiveness"],
      ["Reconciliation break rate below 0.05 percent", "Close completed within 3 business days"],
      ["Duplicate settlement", "Unreconciled payment exceptions", "Late ledger delivery"],
      ["Automation versus control assurance", "Close speed versus completeness"]),
  }),
  persona({
    id: "PERSONA 1009",
    teamName: "Customer Experience Analytics",
    businessUnit: "Customer Experience",
    knowledgeDomains: ["Analytics", "Customer Experience"],
    mission: "Measure customer behavior and translate experience signals into actionable insight",
    qualityScore: 84, completenessScore: 86, confidence: 85, freshnessStatus: "Aging",
    constructionStatus: "Review Required", approvalState: "Evidence Review", conditionCount: 218, dependencyCount: 14,
    personaOwner: "Customer Experience Analytics", riskLevel: "Low", dependencyCriticality: "Medium",
    reviewStatus: "Requested", driftStatus: "Minor",
    thinking: genericThinking("Customer Experience Analytics",
      ["Measurement integrity", "Insight timeliness", "Privacy compliance", "Decision usefulness"],
      ["Experience metrics refreshed daily", "Attribution confidence above 90 percent"],
      ["Instrumentation gaps", "Sampling bias", "Stale experience baselines"],
      ["Speed of insight versus statistical rigour", "Granularity versus privacy"]),
  }),
];

/* ------------------------------- filters -------------------------------- */

export interface LibraryFilters {
  businessUnit: string; team: string; knowledgeDomain: string; capability: string; product: string;
  service: string; system: string; customerJourney: string; personaStatus: string; approvalState: string;
  constructionState: string; personaOwner: string; teamOwner: string; technicalOwner: string;
  qualityBand: string; completenessBand: string; confidenceBand: string; freshness: string;
  riskLevel: string; dependencyCriticality: string; accessClassification: string; region: string;
  environment: string; versionStatus: string; driftStatus: string; reviewStatus: string;
}

export const defaultLibraryFilters: LibraryFilters = {
  businessUnit: "All", team: "All", knowledgeDomain: "All", capability: "All", product: "All",
  service: "All", system: "All", customerJourney: "All", personaStatus: "All", approvalState: "All",
  constructionState: "All", personaOwner: "All", teamOwner: "All", technicalOwner: "All",
  qualityBand: "All", completenessBand: "All", confidenceBand: "All", freshness: "All",
  riskLevel: "All", dependencyCriticality: "All", accessClassification: "All", region: "All",
  environment: "All", versionStatus: "All", driftStatus: "All", reviewStatus: "All",
};

export const libraryFilterLabels: Record<keyof LibraryFilters, string> = {
  businessUnit: "Business Unit", team: "Team", knowledgeDomain: "Knowledge Domain", capability: "Business Capability",
  product: "Product", service: "Service", system: "System", customerJourney: "Customer Journey",
  personaStatus: "Persona Status", approvalState: "Approval State", constructionState: "Construction State",
  personaOwner: "Persona Owner", teamOwner: "Team Owner", technicalOwner: "Technical Owner",
  qualityBand: "Quality Band", completenessBand: "Completeness Band", confidenceBand: "Confidence Band",
  freshness: "Freshness", riskLevel: "Risk Level", dependencyCriticality: "Dependency Criticality",
  accessClassification: "Access Classification", region: "Region", environment: "Environment",
  versionStatus: "Version Status", driftStatus: "Drift Status", reviewStatus: "Review Status",
};

const uniq = (values: string[]) => ["All", ...Array.from(new Set(values)).sort()];

export const libraryFilterOptions: Record<keyof LibraryFilters, string[]> = {
  businessUnit: uniq(libraryPersonas.map((p) => p.businessUnit)),
  team: uniq(libraryPersonas.map((p) => p.teamName)),
  knowledgeDomain: uniq(libraryPersonas.flatMap((p) => p.knowledgeDomains)),
  capability: uniq(libraryPersonas.flatMap((p) => p.capabilities.map((c) => c.name))),
  product: uniq(libraryPersonas.flatMap((p) => p.products)),
  service: uniq(libraryPersonas.flatMap((p) => p.services.map((s) => s.name))),
  system: uniq(libraryPersonas.flatMap((p) => p.systems)),
  customerJourney: uniq(libraryPersonas.flatMap((p) => p.customerJourneys)),
  personaStatus: uniq(libraryPersonas.map((p) => p.constructionStatus)),
  approvalState: uniq(libraryPersonas.map((p) => p.approvalState)),
  constructionState: ["All", "Constructed", "In Construction", "Not Started"],
  personaOwner: uniq(libraryPersonas.map((p) => p.personaOwner)),
  teamOwner: uniq(libraryPersonas.map((p) => p.teamOwner)),
  technicalOwner: uniq(libraryPersonas.map((p) => p.technicalOwner)),
  qualityBand: ["All", "90 and above", "80 to 89", "Below 80"],
  completenessBand: ["All", "90 and above", "80 to 89", "Below 80"],
  confidenceBand: ["All", "90 and above", "80 to 89", "Below 80"],
  freshness: ["All", "Current", "Aging", "Stale"],
  riskLevel: ["All", "Low", "Medium", "High"],
  dependencyCriticality: ["All", "Low", "Medium", "High", "Critical"],
  accessClassification: ["All", "Internal", "Confidential", "Restricted"],
  region: uniq(libraryPersonas.map((p) => p.region)),
  environment: uniq(libraryPersonas.map((p) => p.environment)),
  versionStatus: ["All", "Current", "Superseded", "Draft"],
  driftStatus: ["All", "None", "Minor", "Material"],
  reviewStatus: ["All", "None", "Requested", "In Review"],
};

const band = (value: number, choice: string) =>
  choice === "All" ? true
    : choice === "90 and above" ? value >= 90
      : choice === "80 to 89" ? value >= 80 && value < 90
        : value < 80;

export const activeLibraryFilterCount = (f: LibraryFilters) =>
  Object.values(f).filter((v) => v !== "All").length;

export function applyLibraryFilters(rows: LibraryPersona[], f: LibraryFilters, search: string): LibraryPersona[] {
  const q = search.trim().toLowerCase();
  return rows.filter((p) => {
    if (f.businessUnit !== "All" && p.businessUnit !== f.businessUnit) return false;
    if (f.team !== "All" && p.teamName !== f.team) return false;
    if (f.knowledgeDomain !== "All" && !p.knowledgeDomains.includes(f.knowledgeDomain)) return false;
    if (f.capability !== "All" && !p.capabilities.some((c) => c.name === f.capability)) return false;
    if (f.product !== "All" && !p.products.includes(f.product)) return false;
    if (f.service !== "All" && !p.services.some((s) => s.name === f.service)) return false;
    if (f.system !== "All" && !p.systems.includes(f.system)) return false;
    if (f.customerJourney !== "All" && !p.customerJourneys.includes(f.customerJourney)) return false;
    if (f.personaStatus !== "All" && p.constructionStatus !== f.personaStatus) return false;
    if (f.approvalState !== "All" && p.approvalState !== f.approvalState) return false;
    if (f.personaOwner !== "All" && p.personaOwner !== f.personaOwner) return false;
    if (f.teamOwner !== "All" && p.teamOwner !== f.teamOwner) return false;
    if (f.technicalOwner !== "All" && p.technicalOwner !== f.technicalOwner) return false;
    if (!band(p.qualityScore, f.qualityBand)) return false;
    if (!band(p.completenessScore, f.completenessBand)) return false;
    if (!band(p.confidence, f.confidenceBand)) return false;
    if (f.freshness !== "All" && p.freshnessStatus !== f.freshness) return false;
    if (f.riskLevel !== "All" && p.riskLevel !== f.riskLevel) return false;
    if (f.dependencyCriticality !== "All" && p.dependencyCriticality !== f.dependencyCriticality) return false;
    if (f.accessClassification !== "All" && p.accessClassification !== f.accessClassification) return false;
    if (f.region !== "All" && p.region !== f.region) return false;
    if (f.environment !== "All" && p.environment !== f.environment) return false;
    if (f.versionStatus !== "All" && p.versionStatus !== f.versionStatus) return false;
    if (f.driftStatus !== "All" && p.driftStatus !== f.driftStatus) return false;
    if (f.reviewStatus !== "All" && p.reviewStatus !== f.reviewStatus) return false;
    if (q) {
      const hay = [p.id, p.teamName, p.businessUnit, p.mission, p.personaOwner, ...p.knowledgeDomains,
        ...p.services.map((s) => s.name), ...p.systems, ...p.products].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/* --------------------------------- KPIs --------------------------------- */

export interface LibraryKpi {
  id: string; name: string; value: string; change?: string; target?: string; context: string;
  supporting: { label: string; value: string }[]; status: "Healthy" | "Attention" | "Warning";
  trend: number[]; tooltip: string;
}

export const libraryKpis: LibraryKpi[] = [
  {
    id: "kpi-personas", name: "Team Personas", value: "72", context: "Governed team operating models",
    supporting: [{ label: "Approved", value: "61" }, { label: "Review Required", value: "7" }, { label: "Draft", value: "4" }],
    status: "Healthy", trend: [58, 62, 65, 67, 69, 70, 71, 72],
    tooltip: "All Team Personas in the library. Selecting filters the inventory to active Personas.",
  },
  {
    id: "kpi-teams", name: "Teams Covered", value: "48", change: "+4 this quarter", context: "87 percent of priority teams",
    supporting: [{ label: "Priority coverage", value: "87%" }, { label: "Teams without Persona", value: "7" }],
    status: "Healthy", trend: [38, 41, 43, 44, 45, 46, 47, 48],
    tooltip: "Teams with at least one Persona. Selecting opens the enterprise coverage summary.",
  },
  {
    id: "kpi-quality", name: "Persona Quality", value: "92 / 100", target: "Target 95", context: "Healthy",
    supporting: [{ label: "Dimensions below target", value: "5" }, { label: "Trend", value: "+2" }],
    status: "Healthy", trend: [86, 87, 88, 89, 90, 91, 92, 92],
    tooltip: "Weighted quality across mission, ownership, coverage, decision logic and evidence dimensions.",
  },
  {
    id: "kpi-evidence", name: "Evidence Coverage", value: "94 percent", change: "+3% this quarter", context: "Persona attributes linked to approved conditions",
    supporting: [{ label: "Unlinked attributes", value: "6%" }, { label: "Evidence gaps", value: "5" }],
    status: "Healthy", trend: [88, 89, 90, 91, 92, 93, 94, 94],
    tooltip: "Share of Persona attributes traceable to approved business conditions and exact evidence.",
  },
  {
    id: "kpi-attention", name: "Personas Requiring Attention", value: "14", context: "Open governance and quality issues",
    supporting: [{ label: "Evidence Gaps", value: "5" }, { label: "Dependency Conflicts", value: "4" }, { label: "Missing Owners", value: "3" }, { label: "Stale", value: "2" }],
    status: "Attention", trend: [21, 20, 19, 18, 17, 16, 15, 14],
    tooltip: "Personas with an open issue affecting quality, ownership, evidence or dependencies.",
  },
  {
    id: "kpi-reuse", name: "Persona Reuse", value: "24 active evaluations", context: "Persona context consumed enterprise wide",
    supporting: [{ label: "Decisions referenced", value: "4,812" }, { label: "Work items evaluated", value: "186" }],
    status: "Healthy", trend: [12, 14, 16, 18, 20, 22, 23, 24],
    tooltip: "How often approved Persona context is reused for impact analysis and decisions.",
  },
];

/* ------------------------------- coverage -------------------------------- */

export const coverageSummary = [
  { label: "Priority Teams Covered", value: 87 },
  { label: "Critical Services Covered", value: 94 },
  { label: "Knowledge Domains Covered", value: 91 },
  { label: "Customer Journeys Covered", value: 82 },
];

export const coverageCounts = [
  { label: "Approved Personas", value: 61 },
  { label: "Draft Personas", value: 4 },
  { label: "Review Required", value: 7 },
  { label: "Teams Without Persona", value: 7 },
];

export const coverageDimensions: Record<string, { name: string; covered: number; total: number; filterKey: keyof LibraryFilters; filterValue: string }[]> = {
  "Business Unit": [
    { name: "Commerce Engineering", covered: 14, total: 15, filterKey: "businessUnit", filterValue: "Commerce Engineering" },
    { name: "Risk Technology", covered: 9, total: 11, filterKey: "businessUnit", filterValue: "Risk Technology" },
    { name: "Platform Operations", covered: 12, total: 12, filterKey: "businessUnit", filterValue: "Platform Operations" },
    { name: "Customer Experience", covered: 8, total: 11, filterKey: "businessUnit", filterValue: "Customer Experience" },
    { name: "Security Engineering", covered: 7, total: 9, filterKey: "businessUnit", filterValue: "Security Engineering" },
    { name: "Corporate Operations", covered: 6, total: 8, filterKey: "businessUnit", filterValue: "Corporate Operations" },
    { name: "Engineering Operations", covered: 5, total: 6, filterKey: "businessUnit", filterValue: "Engineering Operations" },
  ],
  "Knowledge Domain": [
    { name: "Payments", covered: 12, total: 13, filterKey: "knowledgeDomain", filterValue: "Payments" },
    { name: "Reliability", covered: 11, total: 11, filterKey: "knowledgeDomain", filterValue: "Reliability" },
    { name: "Risk", covered: 8, total: 10, filterKey: "knowledgeDomain", filterValue: "Risk" },
    { name: "Identity", covered: 6, total: 8, filterKey: "knowledgeDomain", filterValue: "Identity" },
    { name: "Customer Experience", covered: 7, total: 9, filterKey: "knowledgeDomain", filterValue: "Customer Experience" },
    { name: "Governance", covered: 5, total: 5, filterKey: "knowledgeDomain", filterValue: "Governance" },
  ],
  "Business Capability": [
    { name: "Payment authorization", covered: 6, total: 6, filterKey: "capability", filterValue: "Payment authorization" },
    { name: "Tokenization and vaulting", covered: 4, total: 5, filterKey: "capability", filterValue: "Tokenization and vaulting" },
    { name: "Retry orchestration", covered: 3, total: 4, filterKey: "capability", filterValue: "Retry orchestration" },
    { name: "Reconciliation support", covered: 4, total: 6, filterKey: "capability", filterValue: "Reconciliation support" },
  ],
  "Critical Service": [
    { name: "Payments API", covered: 5, total: 5, filterKey: "service", filterValue: "Payments API" },
    { name: "Checkout Orchestrator", covered: 4, total: 4, filterKey: "service", filterValue: "Checkout Orchestrator" },
    { name: "Identity Services", covered: 3, total: 4, filterKey: "service", filterValue: "Identity Services" },
    { name: "Fraud Decision Service", covered: 3, total: 3, filterKey: "service", filterValue: "Fraud Decision Service" },
  ],
  "Customer Journey": [
    { name: "Checkout Customer Journey", covered: 9, total: 10, filterKey: "customerJourney", filterValue: "Checkout Customer Journey" },
    { name: "Refund Journey", covered: 5, total: 7, filterKey: "customerJourney", filterValue: "Refund Journey" },
  ],
};

/* -------------------------------- quality -------------------------------- */

export interface QualityDimension {
  name: string; score: number; target: number; trend: number[]; affected: number; status: "Healthy" | "Attention" | "Warning";
  definition: string; causes: string[]; actions: string[];
}

export const qualityDimensions: QualityDimension[] = [
  { name: "Mission Clarity", score: 96, target: 95, trend: [92, 93, 94, 96], affected: 2, status: "Healthy", definition: "Whether the Persona mission is explicit, bounded, and evidence linked.", causes: ["Mission not restated after reorganization"], actions: ["Confirm mission with team owner"] },
  { name: "Ownership Completeness", score: 94, target: 95, trend: [90, 92, 93, 94], affected: 3, status: "Attention", definition: "Whether Persona, team, and technical owners are all assigned and current.", causes: ["Technical owner vacated after transfer"], actions: ["Assign technical owner", "Confirm approval chain"] },
  { name: "Capability Coverage", score: 93, target: 95, trend: [89, 90, 92, 93], affected: 4, status: "Attention", definition: "Share of team capabilities represented with supporting conditions.", causes: ["Operational capabilities under represented"], actions: ["Extract operational capability conditions"] },
  { name: "Products & Services Coverage", score: 95, target: 95, trend: [91, 93, 94, 95], affected: 2, status: "Healthy", definition: "Coverage of products, services, APIs, systems and data products.", causes: ["Data products not registered"], actions: ["Register data products"] },
  { name: "Objective & Metric Coverage", score: 92, target: 95, trend: [88, 90, 91, 92], affected: 5, status: "Attention", definition: "Presence of objectives, key results, service levels, and thresholds.", causes: ["Thresholds missing for secondary metrics"], actions: ["Add warning and critical thresholds"] },
  { name: "Constraint Coverage", score: 90, target: 95, trend: [86, 87, 89, 90], affected: 6, status: "Attention", definition: "Coverage of policies, guardrails, windows and change restrictions.", causes: ["Cost guardrails undocumented"], actions: ["Extract cost guardrail conditions"] },
  { name: "Dependency Coverage", score: 88, target: 95, trend: [83, 85, 87, 88], affected: 7, status: "Warning", definition: "Completeness and confidence of upstream and downstream dependencies.", causes: ["External provider dependencies missing"], actions: ["Map external provider dependencies"] },
  { name: "Risk & Control Coverage", score: 87, target: 95, trend: [82, 84, 86, 87], affected: 8, status: "Warning", definition: "Coverage of risks, failure modes, controls and recovery expectations.", causes: ["Recovery expectations undefined for tier 1 services"], actions: ["Define recovery expectations"] },
  { name: "Decision Logic Completeness", score: 91, target: 95, trend: [86, 88, 90, 91], affected: 5, status: "Attention", definition: "Presence of decision priorities, tradeoffs, escalation and risk appetite.", causes: ["Escalation philosophy incomplete for three Personas"], actions: ["Complete escalation philosophy"] },
  { name: "Evidence Coverage", score: 95, target: 95, trend: [91, 92, 94, 95], affected: 3, status: "Healthy", definition: "Share of Persona attributes traceable to approved conditions.", causes: ["Aging artifacts for two Personas"], actions: ["Refresh source artifacts"] },
  { name: "Authority Confidence", score: 93, target: 95, trend: [89, 90, 92, 93], affected: 4, status: "Attention", definition: "Authority strength of the sources backing Persona attributes.", causes: ["Informal sources used for two constraints"], actions: ["Replace informal sources"] },
  { name: "Freshness", score: 89, target: 95, trend: [93, 92, 90, 89], affected: 9, status: "Warning", definition: "Recency of the conditions and artifacts backing the Persona.", causes: ["Nine Personas have source changes pending refresh"], actions: ["Run Refresh Persona"] },
];

/* ------------------------------ distribution ------------------------------ */

export const statusDistribution = [
  { label: "Approved", value: 61, tone: "green" as const, status: "Approved" },
  { label: "Review Required", value: 7, tone: "amber" as const, status: "Review Required" },
  { label: "Draft", value: 4, tone: "slate" as const, status: "Draft" },
  { label: "Stale", value: 2, tone: "red" as const, status: "Stale" },
  { label: "Conflict", value: 3, tone: "red" as const, status: "Conflict" },
  { label: "Refreshing", value: 2, tone: "blue" as const, status: "Refreshing" },
];

/* --------------------------- freshness and drift -------------------------- */

export const freshnessSummary = [
  { label: "Current Personas", value: 61 },
  { label: "Aging Personas", value: 7 },
  { label: "Stale Personas", value: 2 },
  { label: "Material Drift", value: 3 },
  { label: "Minor Drift", value: 5 },
  { label: "Personas with Source Changes", value: 8 },
  { label: "Evaluations Requiring Reassessment", value: 4 },
];

export interface LibraryDrift {
  id: string; personaId: string; personaName: string; driftType: string; changedRecord: string;
  previousValue: string; currentValue: string; materiality: "High" | "Medium" | "Low";
  affectedSection: string; detectedAt: string; downstreamImpact: string; status: string;
}

export const libraryDrift: LibraryDrift[] = [
  {
    id: "DRIFT 4101", personaId: "PERSONA 1001", personaName: "Payments Platform",
    driftType: "Approval Requirement Changed", changedRecord: "COND 100612",
    previousValue: "20 percent traffic exposure", currentValue: "10 percent traffic exposure",
    materiality: "High", affectedSection: "Approval Requirements", detectedAt: "Today 08:41",
    downstreamImpact: "2 impact evaluations require reassessment", status: "Open",
  },
  {
    id: "DRIFT 4102", personaId: "PERSONA 1004", personaName: "Identity Engineering",
    driftType: "Performance Threshold Conflict", changedRecord: "COND 100731",
    previousValue: "200 milliseconds", currentValue: "150 milliseconds",
    materiality: "High", affectedSection: "Service Levels", detectedAt: "Today 07:58",
    downstreamImpact: "Payments Platform latency assumption affected", status: "Open",
  },
  {
    id: "DRIFT 4103", personaId: "PERSONA 1006", personaName: "Customer Support Operations",
    driftType: "Evidence Freshness", changedRecord: "CAN 38904",
    previousValue: "Current", currentValue: "Aging",
    materiality: "Medium", affectedSection: "Escalation Philosophy", detectedAt: "Yesterday 16:12",
    downstreamImpact: "Escalation guidance may be outdated", status: "Open",
  },
];

/* --------------------------- relationship explorer ------------------------ */

export type RelationshipType =
  | "DEPENDS ON" | "PROVIDES TO" | "CONSUMED BY" | "APPROVED BY"
  | "ESCALATES TO" | "SUPPORTS" | "MEASURED BY" | "GOVERNED BY";

export interface RelationshipNode {
  id: string; label: string; kind: "Persona" | "Service" | "System" | "Journey";
  summary: string; owner: string; criticality: string; confidence: number;
  x: number; y: number;
}

export interface RelationshipEdge {
  from: string; to: string; type: RelationshipType; direction: "Upstream" | "Downstream";
  critical: boolean; customerImpact: boolean; conditions: string[]; evidence: string;
}

export const relationshipNodes: RelationshipNode[] = [
  { id: "payments", label: "Payments Platform", kind: "Persona", summary: "Center Persona. Payment authorization and integrity.", owner: "Jane Smith", criticality: "Critical", confidence: 95, x: 50, y: 50 },
  { id: "checkout", label: "Checkout Engineering", kind: "Persona", summary: "Owns the checkout experience and orchestration.", owner: "Marcus Lee", criticality: "Critical", confidence: 96, x: 20, y: 20 },
  { id: "fraud", label: "Fraud Engineering", kind: "Persona", summary: "Owns fraud decisioning and loss prevention.", owner: "Priya Patel", criticality: "Critical", confidence: 94, x: 80, y: 20 },
  { id: "identity", label: "Identity Engineering", kind: "Persona", summary: "Owns identity validation services.", owner: "Security Architecture", criticality: "Critical", confidence: 82, x: 82, y: 50 },
  { id: "sre", label: "Site Reliability Engineering", kind: "Persona", summary: "Owns reliability and observability.", owner: "Reliability Operations", criticality: "Critical", confidence: 97, x: 50, y: 84 },
  { id: "finance", label: "Finance Operations", kind: "Persona", summary: "Owns reconciliation and financial control.", owner: "Finance Technology", criticality: "High", confidence: 93, x: 18, y: 78 },
  { id: "support", label: "Customer Support Operations", kind: "Persona", summary: "Owns customer resolution and escalation.", owner: "Customer Support Leadership", criticality: "Medium", confidence: 87, x: 82, y: 78 },
  { id: "release", label: "Release Governance", kind: "Persona", summary: "Owns change approval and stability control.", owner: "Engineering Governance", criticality: "High", confidence: 94, x: 50, y: 14 },
  { id: "payments-api", label: "Payments API", kind: "Service", summary: "Tier 0 authorization service.", owner: "Payments Platform", criticality: "Tier 0", confidence: 96, x: 34, y: 40 },
  { id: "retry", label: "Retry Orchestrator", kind: "Service", summary: "Bounded retry orchestration.", owner: "Payments Reliability", criticality: "Tier 1", confidence: 92, x: 34, y: 62 },
  { id: "identity-svc", label: "Identity Services", kind: "Service", summary: "Identity validation for checkout sessions.", owner: "Identity Engineering", criticality: "Tier 0", confidence: 88, x: 68, y: 40 },
  { id: "fraud-svc", label: "Fraud Decision Service", kind: "Service", summary: "Realtime fraud decisioning.", owner: "Fraud Engineering", criticality: "Tier 0", confidence: 93, x: 68, y: 28 },
  { id: "vault", label: "Regional Token Vault", kind: "System", summary: "Regional cardholder token storage.", owner: "Payments Security", criticality: "Tier 0", confidence: 98, x: 66, y: 62 },
  { id: "observability", label: "Observability Platform", kind: "System", summary: "Telemetry, alerting, and error budget measurement.", owner: "Site Reliability Engineering", criticality: "Tier 0", confidence: 96, x: 50, y: 68 },
  { id: "checkout-orch", label: "Checkout Orchestrator", kind: "Service", summary: "Coordinates checkout steps and payment calls.", owner: "Checkout Engineering", criticality: "Tier 0", confidence: 95, x: 30, y: 28 },
  { id: "journey", label: "Checkout Customer Journey", kind: "Journey", summary: "End to end customer checkout journey.", owner: "Customer Experience", criticality: "Critical", confidence: 91, x: 14, y: 50 },
];

export const relationshipEdges: RelationshipEdge[] = [
  { from: "payments", to: "identity-svc", type: "DEPENDS ON", direction: "Upstream", critical: true, customerImpact: true, conditions: ["COND 100731 Identity validation P95 < 150 ms"], evidence: "Identity Service Levels v2.1" },
  { from: "payments", to: "fraud-svc", type: "DEPENDS ON", direction: "Upstream", critical: true, customerImpact: true, conditions: ["COND 100544 Fraud decision latency < 120 ms"], evidence: "Fraud Decision Requirements v4.0" },
  { from: "payments", to: "vault", type: "DEPENDS ON", direction: "Upstream", critical: true, customerImpact: false, conditions: ["COND 100822 Tokens stored only in regional vault"], evidence: "PCI Control Standard v9" },
  { from: "payments", to: "observability", type: "MEASURED BY", direction: "Upstream", critical: false, customerImpact: false, conditions: ["COND 100901 Error budget measured at edge"], evidence: "Reliability Measurement Standard v3" },
  { from: "payments", to: "payments-api", type: "PROVIDES TO", direction: "Downstream", critical: true, customerImpact: true, conditions: ["COND 100421 Availability >= 99.95%"], evidence: "Payments API Reliability Requirements v3.2" },
  { from: "payments", to: "retry", type: "SUPPORTS", direction: "Downstream", critical: true, customerImpact: true, conditions: ["COND 100612 Retry exposure approval threshold"], evidence: "Retry Policy Standard v2.4" },
  { from: "checkout-orch", to: "payments", type: "CONSUMED BY", direction: "Downstream", critical: true, customerImpact: true, conditions: ["COND 100455 Checkout completion dependency"], evidence: "Checkout Architecture Record v6" },
  { from: "checkout", to: "payments", type: "CONSUMED BY", direction: "Downstream", critical: true, customerImpact: true, conditions: ["COND 100455 Checkout completion dependency"], evidence: "Checkout Architecture Record v6" },
  { from: "fraud", to: "payments", type: "APPROVED BY", direction: "Downstream", critical: true, customerImpact: false, conditions: ["COND 100612 Fraud approval for retry exposure"], evidence: "Retry Policy Standard v2.4" },
  { from: "release", to: "payments", type: "GOVERNED BY", direction: "Upstream", critical: false, customerImpact: false, conditions: ["COND 100488 Quarter end change restriction"], evidence: "Engineering Change Policy v7" },
  { from: "payments", to: "sre", type: "ESCALATES TO", direction: "Downstream", critical: true, customerImpact: true, conditions: ["COND 100933 Critical escalation path"], evidence: "Incident Response Standard v5" },
  { from: "payments", to: "finance", type: "PROVIDES TO", direction: "Downstream", critical: false, customerImpact: false, conditions: ["COND 100710 Reconciliation ledger delivery"], evidence: "Reconciliation Requirements v2" },
  { from: "payments", to: "support", type: "PROVIDES TO", direction: "Downstream", critical: false, customerImpact: true, conditions: ["COND 100777 Payment failure explanation codes"], evidence: "Support Knowledge Standard v3" },
  { from: "payments", to: "journey", type: "SUPPORTS", direction: "Downstream", critical: true, customerImpact: true, conditions: ["COND 100455 Checkout completion dependency"], evidence: "Customer Journey Model v4" },
  { from: "identity", to: "identity-svc", type: "PROVIDES TO", direction: "Upstream", critical: true, customerImpact: true, conditions: ["COND 100731 Identity validation P95 < 150 ms"], evidence: "Identity Service Levels v2.1" },
  { from: "fraud", to: "fraud-svc", type: "PROVIDES TO", direction: "Upstream", critical: true, customerImpact: true, conditions: ["COND 100544 Fraud decision latency < 120 ms"], evidence: "Fraud Decision Requirements v4.0" },
];

/* ------------------------------ comparison -------------------------------- */

export const comparisonRows: { label: string; get: (p: LibraryPersona) => string }[] = [
  { label: "Mission", get: (p) => p.mission },
  { label: "Capabilities", get: (p) => p.capabilities.map((c) => c.name).join(", ") },
  { label: "Products", get: (p) => p.products.join(", ") },
  { label: "Services", get: (p) => p.services.map((s) => s.name).join(", ") },
  { label: "Customers", get: (p) => [...p.internalCustomers, ...p.externalCustomers].join(", ") },
  { label: "Objectives", get: (p) => p.objectives.join("; ") },
  { label: "KPIs", get: (p) => p.metrics.map((m) => `${m.name} target ${m.target}`).join("; ") },
  { label: "Service Levels", get: (p) => p.serviceLevelObjectives.join("; ") },
  { label: "Constraints", get: (p) => p.constraints.join("; ") },
  { label: "Policies", get: (p) => p.policies.join("; ") },
  { label: "Dependencies", get: (p) => p.dependencies.map((d) => d.name).join(", ") },
  { label: "Risks", get: (p) => p.risks.map((r) => r.risk).join("; ") },
  { label: "Controls", get: (p) => p.risks.map((r) => r.control).join("; ") },
  { label: "Decision Priorities", get: (p) => p.thinking.decisionPriorities.join("; ") },
  { label: "Success Criteria", get: (p) => p.thinking.successCriteria.join("; ") },
  { label: "Failure Modes", get: (p) => p.thinking.failureModes.join("; ") },
  { label: "Tradeoffs", get: (p) => p.thinking.commonTradeoffs.join("; ") },
  { label: "Preferred Evidence", get: (p) => p.thinking.preferredEvidence.join("; ") },
  { label: "Escalation Philosophy", get: (p) => p.thinking.escalationPhilosophy.join("; ") },
  { label: "Risk Appetite", get: (p) => p.thinking.riskAppetite.join("; ") },
  { label: "Approval Requirements", get: (p) => p.approvalRequirements.join("; ") },
  { label: "Quality", get: (p) => `${p.qualityScore} / 100` },
  { label: "Completeness", get: (p) => `${p.completenessScore}%` },
  { label: "Confidence", get: (p) => `${p.confidence}%` },
  { label: "Freshness", get: (p) => p.freshnessStatus },
];

export const comparisonInsights = [
  { tone: "amber" as const, text: "Payments Platform prioritizes payment integrity and reliability, while Checkout Engineering prioritizes completion rate and customer friction." },
  { tone: "red" as const, text: "Conflicting priority: a more aggressive retry policy improves completion for Checkout Engineering but raises duplicate transaction risk for Payments Platform." },
  { tone: "red" as const, text: "Fraud Engineering optimizes fraud loss prevention and requires approval where retry exposure exceeds 10 percent of traffic." },
  { tone: "blue" as const, text: "Shared dependencies: Identity Services, Observability Platform, and the Checkout Customer Journey." },
  { tone: "blue" as const, text: "Unique dependency: Payments Platform alone depends on the Regional Token Vault." },
  { tone: "amber" as const, text: "Shared risk: dependency latency causing checkout abandonment appears in all three Personas." },
  { tone: "green" as const, text: "Customer journey intersection: all three Personas support the Checkout Customer Journey." },
];

/* --------------------------- version comparison --------------------------- */

export interface VersionDiffRow {
  section: string; previous: string; current: string; change: "Added" | "Removed" | "Changed" | "Unchanged";
}

export const versionDiff: VersionDiffRow[] = [
  { section: "Mission", previous: "Enable reliable, secure, low friction payment processing", current: "Enable reliable, secure, low friction payment processing for every checkout transaction", change: "Changed" },
  { section: "Capabilities", previous: "4 capabilities", current: "4 capabilities", change: "Unchanged" },
  { section: "Services", previous: "3 services", current: "3 services", change: "Unchanged" },
  { section: "Objectives", previous: "2 objectives", current: "2 objectives", change: "Unchanged" },
  { section: "Metrics", previous: "P95 target 250 ms", current: "P95 target 250 ms", change: "Unchanged" },
  { section: "Approval Requirements", previous: "Fraud approval above 20 percent traffic exposure", current: "Fraud approval above 10 percent traffic exposure", change: "Changed" },
  { section: "Change Restrictions", previous: "No change during quarter end close", current: "No change during quarter end close and peak commerce events", change: "Changed" },
  { section: "Dependencies", previous: "Identity dependency confidence 84 percent", current: "Identity dependency confidence 91 percent", change: "Changed" },
  { section: "Risks", previous: "3 risks", current: "3 risks", change: "Unchanged" },
  { section: "Controls", previous: "Idempotency control authority Advisory", current: "Idempotency control authority Authoritative", change: "Changed" },
  { section: "Decision Logic", previous: "3 decision rules", current: "4 decision rules", change: "Added" },
  { section: "Conditions Included", previous: "421 conditions", current: "428 conditions", change: "Added" },
  { section: "Conditions Removed", previous: "—", current: "2 superseded conditions removed", change: "Removed" },
  { section: "Evidence", previous: "92 percent coverage", current: "95 percent coverage", change: "Changed" },
  { section: "Owners", previous: "Jane Smith", current: "Jane Smith", change: "Unchanged" },
  { section: "Quality", previous: "91", current: "94", change: "Changed" },
  { section: "Completeness", previous: "89 percent", current: "92 percent", change: "Changed" },
  { section: "Confidence", previous: "92 percent", current: "95 percent", change: "Changed" },
  { section: "Effective Date", previous: "2026-05-12", current: "2026-07-28", change: "Changed" },
];

export const versionDownstream = [
  "3 Persona sections changed",
  "2 impact evaluations require reassessment",
  "1 active decision references the prior threshold",
];

/* --------------------------------- usage ---------------------------------- */

export const usageMetrics = [
  { label: "Active Personas Used This Month", value: "61" },
  { label: "Impact Evaluations", value: "24" },
  { label: "Incoming Work Items Evaluated", value: "186" },
  { label: "Decision References", value: "4,812" },
  { label: "Cognitive Search Retrievals", value: "8,426" },
  { label: "Context Graph Relationships", value: "52,632" },
];

export const topReused = [
  { persona: "Payments Platform", personaId: "PERSONA 1001", reuse: 1284, evaluations: 9, decisions: 1284, retrievals: 2211, lastUsed: "Today 10:22", quality: 94, freshness: "Current" },
  { persona: "Site Reliability Engineering", personaId: "PERSONA 1005", reuse: 1102, evaluations: 7, decisions: 1102, retrievals: 1908, lastUsed: "Today 10:04", quality: 97, freshness: "Current" },
  { persona: "Checkout Engineering", personaId: "PERSONA 1002", reuse: 964, evaluations: 5, decisions: 964, retrievals: 1642, lastUsed: "Today 09:47", quality: 96, freshness: "Current" },
  { persona: "Fraud Engineering", personaId: "PERSONA 1003", reuse: 802, evaluations: 4, decisions: 802, retrievals: 1388, lastUsed: "Today 09:31", quality: 93, freshness: "Current" },
  { persona: "Identity Engineering", personaId: "PERSONA 1004", reuse: 660, evaluations: 3, decisions: 660, retrievals: 1277, lastUsed: "Today 08:58", quality: 81, freshness: "Aging" },
];

/* ----------------------------- impact preview ----------------------------- */

export const impactPreview = {
  persona: "Payments Platform",
  change: "Checkout Retry Policy Update",
  description: "Increase automated retries from two attempts to three for selected payment failures",
  reactions: [
    { label: "Potential Availability Benefit", level: "Medium" },
    { label: "Customer Completion Benefit", level: "Medium" },
    { label: "Duplicate Transaction Risk", level: "High" },
    { label: "Latency Risk", level: "Medium" },
    { label: "Fraud Dependency Impact", level: "High" },
    { label: "Approval Required", level: "Yes" },
  ],
  reviewers: ["Payments Reliability", "Fraud Engineering", "Site Reliability Engineering"],
  evidence: ["Traffic segmentation plan", "Idempotency test results", "Fraud loss analysis", "Checkout conversion analysis", "Rollback threshold", "Dependency health"],
};

/* --------------------------- evidence provenance -------------------------- */

export interface LineageNode {
  stage: string; recordId: string; type: string; owner: string; authority: string;
  confidence: number; freshness: Freshness; version: string; classification: string; title: string;
}

export const evidenceLineage: LineageNode[] = [
  { stage: "Source Artifact", recordId: "SRC 21884", type: "Requirements document", owner: "Payments Architecture", authority: "Authoritative", confidence: 96, freshness: "Current", version: "v3.2", classification: "Internal", title: "Payments API Reliability Requirements v3.2" },
  { stage: "Canonical Artifact", recordId: "CAN 38421", type: "Canonical artifact", owner: "Artifact Normalization", authority: "Authoritative", confidence: 96, freshness: "Current", version: "v1.4", classification: "Internal", title: "Normalized payments reliability artifact" },
  { stage: "Business Condition", recordId: "COND 100421", type: "Service level condition", owner: "Payments Platform", authority: "Authoritative", confidence: 96, freshness: "Current", version: "v2.0", classification: "Internal", title: "Payments API availability >= 99.95%" },
  { stage: "Team Persona Section", recordId: "SEC 5120", type: "Persona section", owner: "Jane Smith", authority: "Approved", confidence: 95, freshness: "Current", version: "v3.4", classification: "Confidential", title: "Payments Platform Persona — Service Levels" },
  { stage: "Impact Evaluation", recordId: "EVAL 2048", type: "Impact evaluation", owner: "Payments Reliability", authority: "Derived", confidence: 92, freshness: "Current", version: "v1.1", classification: "Internal", title: "Checkout Retry Evaluation" },
  { stage: "Decision", recordId: "DEC 4812", type: "Decision record", owner: "Engineering Governance", authority: "Approved", confidence: 94, freshness: "Current", version: "v1.0", classification: "Internal", title: "Retry exposure approval decision" },
];

/* ------------------------------- attention -------------------------------- */

export interface AttentionItem {
  id: string; personaId: string; persona: string; issueType: string; severity: "High" | "Medium" | "Low";
  section: string; owner: string; age: string; qualityImpact: string; downstreamImpact: string;
  recommendedAction: string; status: string;
}

export const attentionSummary = [
  { label: "Evidence Gaps", value: 5, type: "Evidence Gap" },
  { label: "Dependency Conflicts", value: 4, type: "Dependency Conflict" },
  { label: "Missing Owners", value: 3, type: "Missing Owner" },
  { label: "Stale Personas", value: 2, type: "Stale Persona" },
  { label: "Decision Rule Conflicts", value: 3, type: "Decision Rule Conflict" },
  { label: "Incomplete Escalation Paths", value: 3, type: "Incomplete Escalation Path" },
];

export const attentionItems: AttentionItem[] = [
  { id: "ATT 7001", personaId: "PERSONA 1004", persona: "Identity Engineering", issueType: "Dependency Conflict", severity: "High", section: "Service Levels", owner: "Security Architecture", age: "3 days", qualityImpact: "-6", downstreamImpact: "Payments Platform latency assumption", recommendedAction: "Open Conflict", status: "Open" },
  { id: "ATT 7002", personaId: "PERSONA 1009", persona: "Customer Experience Analytics", issueType: "Evidence Gap", severity: "Medium", section: "Objectives & Metrics", owner: "CX Analytics", age: "6 days", qualityImpact: "-4", downstreamImpact: "2 decisions lack traceable baselines", recommendedAction: "Open Evidence", status: "Open" },
  { id: "ATT 7003", personaId: "PERSONA 1006", persona: "Customer Support Operations", issueType: "Missing Owner", severity: "Medium", section: "Ownership", owner: "Unassigned", age: "9 days", qualityImpact: "-5", downstreamImpact: "Escalation approval unclear", recommendedAction: "Assign Owner", status: "Open" },
  { id: "ATT 7004", personaId: "PERSONA 1001", persona: "Payments Platform", issueType: "Decision Rule Conflict", severity: "High", section: "Approval Requirements", owner: "Jane Smith", age: "1 day", qualityImpact: "-3", downstreamImpact: "1 active decision references prior threshold", recommendedAction: "Open Conflict", status: "Open" },
  { id: "ATT 7005", personaId: "PERSONA 1006", persona: "Customer Support Operations", issueType: "Incomplete Escalation Path", severity: "Medium", section: "How This Team Thinks", owner: "Support Leadership", age: "4 days", qualityImpact: "-4", downstreamImpact: "Escalation guidance incomplete", recommendedAction: "Request Review", status: "Open" },
  { id: "ATT 7006", personaId: "PERSONA 1009", persona: "Customer Experience Analytics", issueType: "Stale Persona", severity: "Low", section: "Evidence", owner: "CX Analytics", age: "21 days", qualityImpact: "-2", downstreamImpact: "Search retrieval confidence reduced", recommendedAction: "Refresh Persona", status: "Open" },
];

/* -------------------------------- activity -------------------------------- */

export interface LibraryActivity {
  id: string; at: string; action: string; persona: string; team: string; section: string;
  result: string; owner: string; auditId: string;
}

export const libraryActivity: LibraryActivity[] = [
  { id: "ACT 9001", at: "10:22 AM", action: "Version published", persona: "PERSONA 1001", team: "Payments Platform", section: "Versions", result: "Persona version 3.4 published", owner: "Engineering Governance", auditId: "AUD 88421" },
  { id: "ACT 9002", at: "10:18 AM", action: "Dependency approved", persona: "PERSONA 1003", team: "Fraud Engineering", section: "Dependencies", result: "Dependency approved", owner: "Priya Patel", auditId: "AUD 88418" },
  { id: "ACT 9003", at: "10:14 AM", action: "Conflict opened", persona: "PERSONA 1004", team: "Identity Engineering", section: "Service Levels", result: "Latency conflict opened", owner: "Security Architecture", auditId: "AUD 88414" },
  { id: "ACT 9004", at: "10:09 AM", action: "Persona approved", persona: "PERSONA 1002", team: "Checkout Engineering", section: "Approval", result: "Persona v4.1 approved", owner: "Commerce Leadership", auditId: "AUD 88409" },
  { id: "ACT 9005", at: "10:06 AM", action: "Evidence coverage increased", persona: "PERSONA 1001", team: "Payments Platform", section: "Evidence", result: "Coverage increased to 95 percent", owner: "Jane Smith", auditId: "AUD 88406" },
  { id: "ACT 9006", at: "10:03 AM", action: "Revision requested", persona: "PERSONA 1006", team: "Customer Support Operations", section: "Escalation Philosophy", result: "Revision requested", owner: "Persona Review Board", auditId: "AUD 88403" },
  { id: "ACT 9007", at: "9:58 AM", action: "Persona refreshed", persona: "PERSONA 1007", team: "Release Governance", section: "Constraints", result: "Refreshed after condition change", owner: "Engineering Governance", auditId: "AUD 88358" },
  { id: "ACT 9008", at: "9:52 AM", action: "Persona referenced", persona: "PERSONA 1005", team: "Site Reliability Engineering", section: "Usage", result: "Referenced by new impact evaluation", owner: "Reliability Operations", auditId: "AUD 88352" },
];

/* ------------------------------ notifications ----------------------------- */

export interface LibraryNotification {
  id: string; at: string; category: string; title: string; detail: string;
  tone: "green" | "amber" | "red" | "blue" | "slate"; read: boolean;
}

export const libraryNotifications: LibraryNotification[] = [
  { id: "N-1", at: "10:22 AM", category: "New Version Published", title: "Payments Platform v3.4 published", detail: "Retry approval threshold reduced to 10 percent traffic exposure.", tone: "green", read: false },
  { id: "N-2", at: "10:14 AM", category: "Dependency Conflict", title: "Identity Engineering latency conflict", detail: "Threshold changed from 200 ms to 150 ms.", tone: "red", read: false },
  { id: "N-3", at: "10:09 AM", category: "Persona Approved", title: "Checkout Engineering v4.1 approved", detail: "Approved by Commerce Leadership.", tone: "green", read: false },
  { id: "N-4", at: "10:03 AM", category: "Persona Review Requested", title: "Customer Support escalation philosophy", detail: "Revision requested by the Persona Review Board.", tone: "amber", read: false },
  { id: "N-5", at: "09:41 AM", category: "Persona Drift Detected", title: "Material drift on Payments Platform", detail: "Approval requirement condition changed.", tone: "amber", read: true },
  { id: "N-6", at: "09:12 AM", category: "Evidence Gap Detected", title: "CX Analytics evidence gap", detail: "Baseline metrics lack approved conditions.", tone: "amber", read: true },
  { id: "N-7", at: "08:47 AM", category: "Impact Evaluation Requires Reassessment", title: "EVAL 2048 requires reassessment", detail: "Referenced Persona version superseded.", tone: "blue", read: true },
  { id: "N-8", at: "08:20 AM", category: "Persona Became Stale", title: "Two Personas became stale", detail: "Source artifacts exceeded the freshness window.", tone: "red", read: true },
];

/* ------------------------------ demo scenarios ---------------------------- */

export interface LibraryScenario {
  id: string; label: string; description: string;
  libraryState: "Operational" | "Review Required" | "Refreshing" | "Degraded" | "Maintenance";
  kpiOverrides: Partial<Record<string, string>>;
  personaOverrides: Record<string, Partial<LibraryPersona>>;
  extraActivity?: LibraryActivity;
  extraNotification?: LibraryNotification;
  extraAttention?: AttentionItem;
  driftOverride?: LibraryDrift[];
  banner: string;
}

const noop = { kpiOverrides: {}, personaOverrides: {} };

export const libraryScenarios: LibraryScenario[] = [
  { id: "healthy", label: "Healthy Persona Library", description: "All Personas approved, fresh, and reusable.", libraryState: "Operational", banner: "Library operating normally. 61 approved Personas with current evidence.", ...noop },
  {
    id: "new-persona", label: "New Persona Created", description: "A new Persona has entered construction.",
    libraryState: "Operational", banner: "Marketplace Operations Persona created and entered construction.",
    kpiOverrides: { "kpi-personas": "73", "kpi-teams": "49" }, personaOverrides: {},
    extraActivity: { id: "ACT 9100", at: "10:31 AM", action: "Persona created", persona: "PERSONA 1010", team: "Marketplace Operations", section: "Identity", result: "Construction started", owner: "Marketplace Leadership", auditId: "AUD 88500" },
    extraNotification: { id: "N-100", at: "10:31 AM", category: "Persona Created", title: "Marketplace Operations Persona created", detail: "Construction started from 118 approved conditions.", tone: "blue", read: false },
  },
  {
    id: "review", label: "Persona Review Required", description: "Additional Personas require human review.",
    libraryState: "Review Required", banner: "Two additional Personas require human review before reuse.",
    kpiOverrides: { "kpi-attention": "16" },
    personaOverrides: { "PERSONA 1002": { constructionStatus: "Review Required", approvalState: "Owner Review", reviewStatus: "Requested" } },
    extraNotification: { id: "N-101", at: "10:34 AM", category: "Persona Review Requested", title: "Checkout Engineering review requested", detail: "Objective thresholds changed since approval.", tone: "amber", read: false },
  },
  {
    id: "missing-owner", label: "Missing Owner", description: "A Persona has lost its technical owner.",
    libraryState: "Review Required", banner: "Identity Engineering has no assigned technical owner.",
    kpiOverrides: { "kpi-attention": "15" },
    personaOverrides: { "PERSONA 1004": { technicalOwner: "Unassigned", qualityScore: 77 } },
    extraAttention: { id: "ATT 7100", personaId: "PERSONA 1004", persona: "Identity Engineering", issueType: "Missing Owner", severity: "High", section: "Ownership", owner: "Unassigned", age: "Today", qualityImpact: "-4", downstreamImpact: "Approval routing blocked", recommendedAction: "Assign Owner", status: "Open" },
  },
  {
    id: "evidence-gap", label: "Evidence Gap", description: "Persona attributes lost their supporting evidence.",
    libraryState: "Review Required", banner: "Payments Platform constraint attributes lost supporting evidence.",
    kpiOverrides: { "kpi-evidence": "89 percent", "kpi-attention": "16" },
    personaOverrides: { "PERSONA 1001": { qualityScore: 88, completenessScore: 86 } },
    extraAttention: { id: "ATT 7101", personaId: "PERSONA 1001", persona: "Payments Platform", issueType: "Evidence Gap", severity: "High", section: "Constraints & Guardrails", owner: "Jane Smith", age: "Today", qualityImpact: "-6", downstreamImpact: "3 evaluations lose traceability", recommendedAction: "Open Evidence", status: "Open" },
  },
  {
    id: "dependency-conflict", label: "Dependency Conflict", description: "Two Personas disagree on a shared dependency threshold.",
    libraryState: "Degraded", banner: "Identity latency threshold conflicts with the Payments Platform assumption.",
    kpiOverrides: { "kpi-attention": "17" },
    personaOverrides: { "PERSONA 1004": { constructionStatus: "Conflict", approvalState: "Conflict Review" } },
    extraNotification: { id: "N-102", at: "10:36 AM", category: "Dependency Conflict", title: "Identity dependency conflict escalated", detail: "Payments Platform and Identity Engineering thresholds disagree.", tone: "red", read: false },
  },
  {
    id: "decision-conflict", label: "Decision Rule Conflict", description: "Approval rules disagree across teams.",
    libraryState: "Degraded", banner: "Retry approval rules disagree between Payments Platform and Fraud Engineering.",
    kpiOverrides: { "kpi-attention": "16" },
    personaOverrides: { "PERSONA 1003": { constructionStatus: "Conflict", approvalState: "Conflict Review" } },
  },
  {
    id: "stale", label: "Persona Became Stale", description: "Source conditions aged beyond the freshness window.",
    libraryState: "Review Required", banner: "Customer Experience Analytics Persona is now stale.",
    kpiOverrides: { "kpi-quality": "89 / 100" },
    personaOverrides: { "PERSONA 1009": { constructionStatus: "Stale", freshnessStatus: "Stale", qualityScore: 79 } },
  },
  {
    id: "material-drift", label: "Material Drift Detected", description: "Approved conditions changed materially.",
    libraryState: "Review Required", banner: "Material drift detected on Payments Platform approval requirements.",
    kpiOverrides: { "kpi-attention": "17", "kpi-quality": "90 / 100" },
    personaOverrides: { "PERSONA 1001": { driftStatus: "Material", reviewStatus: "Requested", qualityScore: 90, freshnessStatus: "Aging" } },
    extraAttention: { id: "ATT 7102", personaId: "PERSONA 1001", persona: "Payments Platform", issueType: "Material Drift", severity: "High", section: "Approval Requirements", owner: "Jane Smith", age: "Today", qualityImpact: "-4", downstreamImpact: "2 evaluations require reassessment", recommendedAction: "Refresh Persona", status: "Open" },
    extraNotification: { id: "N-103", at: "10:38 AM", category: "Persona Drift Detected", title: "Material drift on Payments Platform", detail: "Retry approval threshold changed from 20 percent to 10 percent.", tone: "red", read: false },
    extraActivity: { id: "ACT 9101", at: "10:38 AM", action: "Drift detected", persona: "PERSONA 1001", team: "Payments Platform", section: "Approval Requirements", result: "Material drift recorded", owner: "Fabric Monitor", auditId: "AUD 88510" },
  },
  {
    id: "refreshing", label: "Persona Refresh in Progress", description: "A Persona refresh is currently executing.",
    libraryState: "Refreshing", banner: "Payments Platform refresh in progress against 14 changed conditions.",
    kpiOverrides: {},
    personaOverrides: { "PERSONA 1001": { constructionStatus: "Refreshing" } },
  },
  {
    id: "new-version", label: "New Persona Version", description: "A draft version awaits approval.",
    libraryState: "Operational", banner: "Payments Platform draft v3.5 created from the latest refresh.",
    kpiOverrides: {}, personaOverrides: { "PERSONA 1001": { version: "v3.5", versionStatus: "Draft" } },
  },
  {
    id: "approved", label: "Persona Approved", description: "A Persona has completed approval.",
    libraryState: "Operational", banner: "Customer Support Operations Persona approved.",
    kpiOverrides: {}, personaOverrides: { "PERSONA 1006": { constructionStatus: "Approved", approvalState: "Approved", qualityScore: 90, completenessScore: 88 } },
  },
  {
    id: "published", label: "Persona Published", description: "An approved Persona has been published for reuse.",
    libraryState: "Operational", banner: "Customer Support Operations Persona published to the Cognitive Memory.",
    kpiOverrides: { "kpi-personas": "72" },
    personaOverrides: { "PERSONA 1006": { constructionStatus: "Approved", approvalState: "Approved", versionStatus: "Current" } },
  },
  {
    id: "reassessment", label: "Impact Evaluation Requires Reassessment", description: "Evaluations reference a superseded Persona version.",
    libraryState: "Review Required", banner: "Four impact evaluations reference superseded Persona versions.",
    kpiOverrides: { "kpi-reuse": "20 active evaluations" }, personaOverrides: {},
    extraNotification: { id: "N-104", at: "10:40 AM", category: "Impact Evaluation Requires Reassessment", title: "EVAL 2048 requires reassessment", detail: "Payments Platform v3.3 superseded by v3.4.", tone: "blue", read: false },
  },
  {
    id: "high-reuse", label: "High Persona Reuse", description: "Persona reuse spikes across the enterprise.",
    libraryState: "Operational", banner: "Persona reuse is at a record level this month.",
    kpiOverrides: { "kpi-reuse": "31 active evaluations" }, personaOverrides: {},
  },
  { id: "reset", label: "Reset Demo Data", description: "Return the library to seeded state.", libraryState: "Operational", banner: "Demo data reset to the seeded library state.", ...noop },
];

/* ------------------------------- demo story ------------------------------- */

export interface StoryStep {
  id: string; target: string; caption: string; notes: string; action?: "open-persona" | "open-compare";
}

export const libraryStory: StoryStep[] = [
  { id: "s1", target: "kpis", caption: "The Team Persona Library provides one governed catalog of how enterprise teams operate and evaluate change.", notes: "Anchor on Team Personas and Teams Covered." },
  { id: "s2", target: "inventory", caption: "Each Persona captures mission, ownership, objectives, metrics, constraints, dependencies, risks, and decision logic.", notes: "Show the inventory columns changing with the view selector." },
  { id: "s3", target: "inventory", caption: "A Team Persona is not a personality profile. It is an evidence linked operating model of the team.", notes: "Open Payments Platform.", action: "open-persona" },
  { id: "s4", target: "thinking", caption: "The Persona explains what the team prioritizes, what defines success, what can fail, what evidence it trusts, and how it evaluates tradeoffs.", notes: "How This Team Thinks is the signature section." },
  { id: "s5", target: "evidence", caption: "Every Persona attribute remains connected to approved business conditions and exact source evidence.", notes: "Walk the lineage from source artifact to decision." },
  { id: "s6", target: "relationships", caption: "The Fabric identifies what the team depends on, what depends on it, and where changes can ripple across the enterprise.", notes: "Use the relationship filters." },
  { id: "s7", target: "inventory", caption: "Different teams can optimize for different outcomes, and the Library makes those tradeoffs visible before a change becomes a conflict.", notes: "Open comparison for Payments, Checkout, Fraud.", action: "open-compare" },
  { id: "s8", target: "drift", caption: "When source conditions, owners, policies, metrics, or dependencies change, the Fabric identifies which Personas require refresh.", notes: "Point at material drift." },
  { id: "s9", target: "usage", caption: "Approved Personas become reusable context across incoming work, impact analysis, decision intelligence, and enterprise search.", notes: "Reuse is the payoff." },
  { id: "s10", target: "impact", caption: "The same Persona can now evaluate a proposed change from the team's perspective without requiring engineers to stop and coordinate manually.", notes: "Close on the retry policy preview." },
];

/* -------------------------------- helpers --------------------------------- */

export const searchCategories = [
  "Team Personas", "Teams", "Capabilities", "Products", "Services", "Systems", "Customers",
  "Knowledge Domains", "Business Conditions", "Dependencies", "Risks", "Controls", "Metrics",
  "Decision Rules", "Evidence", "Versions", "Impact Evaluations", "Decisions",
];

export const exampleQueries = [
  "Personas dependent on Identity Services",
  "Teams with payment availability objectives",
  "Personas with stale evidence",
  "Teams requiring Fraud Engineering approval",
  "Personas sharing the Checkout customer journey",
  "Personas with high risk payment dependencies",
  "Teams with quarter end change restrictions",
];

export const personaToRecord = (p: LibraryPersona) => ({
  id: p.id,
  team: p.teamName,
  businessUnit: p.businessUnit,
  mission: p.mission,
  status: p.constructionStatus,
  approval: p.approvalState,
  quality: p.qualityScore,
  completeness: p.completenessScore,
  confidence: p.confidence,
  freshness: p.freshnessStatus,
  conditions: p.conditionCount,
  dependencies: p.dependencyCount,
  owner: p.personaOwner,
  version: p.version,
});
