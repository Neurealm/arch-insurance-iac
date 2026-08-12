/**
 * Neurealm Governance — local mock data only.
 * No backend, no persistence. All edits live in browser memory and reset on refresh.
 */

export type HealthStatus =
  | "On Track"
  | "Attention Required"
  | "At Risk"
  | "Scheduled"
  | "In Progress"
  | "Planned"
  | "Future Phase"
  | "Monitoring"
  | "Open"
  | "Closed"
  | "Approved"
  | "Escalated";

export type Trend = "Improving" | "Stable" | "Declining";

export interface GovernanceSummary {
  id: string;
  label: string;
  value: string;
  supportingValue?: string;
  supportingText: string;
  status: HealthStatus;
  /** Section id the card scrolls to / filters. */
  target: string;
}

export interface GovernanceTier {
  id: string;
  tier: 1 | 2 | 3;
  name: string;
  purpose: string;
  responsibilities: string[];
  participants: string[];
  cadence: string;
  decisionAuthority: string;
  escalationPath: string;
  status: HealthStatus;
  openActions: number;
  relatedRiskIds: string[];
  relatedDecisionIds: string[];
  notes: string;
}

export interface GovernanceForum {
  id: string;
  name: string;
  purpose: string;
  participants: string;
  cadence: "Weekly" | "Biweekly" | "Monthly";
  nextMeeting: string;
  chair: string;
  openActions: number;
  status: HealthStatus;
  tier: 1 | 2 | 3;
  agenda: string[];
  notes: string;
}

export interface OperationalActivity {
  id: string;
  label: string;
  complete: boolean;
}

export interface OperationalPhase {
  id: "day0" | "day1" | "day2";
  title: string;
  subtitle: string;
  objective: string;
  activities: OperationalActivity[];
  outcome: string;
  readiness: number;
  status: HealthStatus;
  owner: string;
  targetPeriod: string;
}

export type RaciMarker = "R" | "A" | "C" | "I" | "";

export interface RaciAssignment {
  fn: string;
  description: string;
  cells: Record<string, RaciMarker>;
}

export interface GovernanceRisk {
  id: string;
  title: string;
  type: "Risk" | "Issue";
  severity: "High" | "Medium" | "Low";
  owner: string;
  status: HealthStatus;
  impact: string;
  mitigation: string;
  dueDate: string;
  notes: string[];
}

export type GovernanceIssue = GovernanceRisk;

export interface GovernanceDecision {
  id: string;
  title: string;
  decisionType: string;
  owner: string;
  forum: string;
  dueDate: string;
  status: HealthStatus;
  impact: string;
  rationale: string;
}

export interface GovernanceKpi {
  id: string;
  name: string;
  target: string;
  current: string;
  status: HealthStatus;
  trend: Trend;
  owner: string;
  history: number[];
  updatedAt: string | null;
}

export interface GovernanceMeeting {
  id: string;
  date: string;
  day: string;
  forumId: string;
  forum: string;
  tier: 1 | 2 | 3;
  chair: string;
  purpose: string;
  participants: string;
  agenda: string[];
  openDecisionIds: string[];
  openRiskIds: string[];
  actionItems: string[];
}

export interface GovernanceActivity {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  relatedItem: string;
  category: "Readiness" | "Decision" | "Risk" | "Change" | "Forum" | "KPI";
}

export interface ExecutiveAttentionItem {
  id: string;
  text: string;
  severity: "High" | "Medium";
  relatedTarget: string;
}

export interface GovernanceFilterState {
  search: string;
  status: string[];
  owner: string[];
  cadence: string[];
  severity: string[];
}

export const GOVERNANCE_META = {
  title: "Governance",
  subtitle: "Internal governance framework supporting Day 0, Day 1, and Day 2 operations",
  context: "Citrix Healthcare Operating Model Engagement",
  lastUpdated: "June 17, 2026 at 10:30 AM",
  userInitials: "NN",
};

export const RACI_COLUMNS = [
  "Executive Steering Committee",
  "PMO",
  "Delivery Pods",
  "RunOps & SRE",
  "Customer Success",
  "Commercial",
  "Finance & Legal",
] as const;

export const RACI_SHORT: Record<string, string> = {
  "Executive Steering Committee": "ESC",
  PMO: "PMO",
  "Delivery Pods": "Delivery",
  "RunOps & SRE": "RunOps",
  "Customer Success": "Cust. Success",
  Commercial: "Commercial",
  "Finance & Legal": "Fin. & Legal",
};

export const RACI_LEGEND: Record<Exclude<RaciMarker, "">, string> = {
  R: "Responsible",
  A: "Accountable",
  C: "Consulted",
  I: "Informed",
};

const summary: GovernanceSummary[] = [
  {
    id: "health",
    label: "Overall Governance Health",
    value: "On Track",
    supportingValue: "92%",
    supportingText: "Governance forums, actions, and controls operating effectively",
    status: "On Track",
    target: "kpis",
  },
  {
    id: "workstreams",
    label: "Active Workstreams",
    value: "8",
    supportingText: "All workstreams have assigned owners",
    status: "On Track",
    target: "forums",
  },
  {
    id: "decisions",
    label: "Open Decisions",
    value: "5",
    supportingText: "2 require leadership attention",
    status: "Attention Required",
    target: "decisions",
  },
  {
    id: "risks",
    label: "Open Risks",
    value: "3",
    supportingText: "1 High, 2 Medium",
    status: "At Risk",
    target: "risks",
  },
  {
    id: "meeting",
    label: "Next Governance Meeting",
    value: "June 24, 2026",
    supportingText: "Executive Steering Committee",
    status: "Scheduled",
    target: "calendar",
  },
];

const tiers: GovernanceTier[] = [
  {
    id: "tier-1",
    tier: 1,
    name: "Executive Steering Committee",
    purpose:
      "Provides strategic direction, approves major decisions, monitors value realization, and resolves escalations.",
    responsibilities: [
      "Strategic direction",
      "Commercial approvals",
      "Funding decisions",
      "Risk acceptance",
      "Major scope changes",
      "Executive escalations",
      "Customer and partner alignment",
      "Value realization oversight",
    ],
    participants: [
      "Neurealm Executive Sponsor",
      "Commercial Leader",
      "Delivery Executive",
      "RunOps Practice Leader",
      "Program Sponsor",
      "Finance Representative",
      "Legal Representative, as required",
    ],
    cadence: "Monthly",
    decisionAuthority: "Executive",
    escalationPath: "Escalates to Neurealm Executive Board and customer executive sponsor.",
    status: "On Track",
    openActions: 3,
    relatedRiskIds: ["risk-1", "risk-4"],
    relatedDecisionIds: ["dec-1", "dec-2"],
    notes: "",
  },
  {
    id: "tier-2",
    tier: 2,
    name: "Program Management Office",
    purpose:
      "Governs program execution, cross-workstream coordination, risks, issues, decisions, dependencies, resources, and reporting.",
    responsibilities: [
      "Integrated program plan",
      "Cross-workstream coordination",
      "Risk and issue management",
      "Decision tracking",
      "Dependency management",
      "Financial tracking",
      "Governance reporting",
      "Change control",
      "Milestone assurance",
      "Escalation management",
    ],
    participants: [
      "Program Director",
      "PMO Lead",
      "Workstream Leads",
      "Commercial Lead",
      "Delivery Lead",
      "RunOps Lead",
      "Finance",
      "Customer Success Lead",
    ],
    cadence: "Weekly",
    decisionAuthority: "Program",
    escalationPath: "Escalates unresolved items to the Executive Steering Committee.",
    status: "On Track",
    openActions: 8,
    relatedRiskIds: ["risk-1", "risk-2"],
    relatedDecisionIds: ["dec-5"],
    notes: "",
  },
  {
    id: "tier-3",
    tier: 3,
    name: "Delivery and Operations Pods",
    purpose:
      "Executes customer, transition, delivery, support, reliability, service-management, and continuous-improvement activities.",
    responsibilities: [
      "Service transition",
      "Solution delivery",
      "RunOps execution",
      "Incident management",
      "Problem management",
      "Change enablement",
      "Service reporting",
      "Automation",
      "Capacity management",
      "Continuous improvement",
      "Customer-success actions",
      "Operational risk management",
    ],
    participants: [
      "Delivery Managers",
      "Service Delivery Managers",
      "RunOps Lead",
      "SRE Lead",
      "Technical Leads",
      "Solution Architects",
      "Incident Manager",
      "Problem Manager",
      "Change Manager",
      "Customer Success Manager",
    ],
    cadence: "Daily and Weekly",
    decisionAuthority: "Operational",
    escalationPath: "Escalates to the Program Management Office and RunOps & SRE Council.",
    status: "Attention Required",
    openActions: 12,
    relatedRiskIds: ["risk-3", "risk-5"],
    relatedDecisionIds: ["dec-3", "dec-4"],
    notes: "",
  },
];

const forums: GovernanceForum[] = [
  {
    id: "forum-esc",
    name: "Executive Steering Committee",
    purpose: "Strategic oversight, investment decisions, funding, risks, and escalations",
    participants: "Neurealm executives, program sponsors, commercial and delivery leaders",
    cadence: "Monthly",
    nextMeeting: "June 24, 2026",
    chair: "Executive Sponsor",
    openActions: 3,
    status: "On Track",
    tier: 1,
    agenda: [
      "Governance health review",
      "Commercial framework approval",
      "Day 0 readiness checkpoint",
      "Escalations and risk acceptance",
    ],
    notes: "",
  },
  {
    id: "forum-pmo",
    name: "Program Management Office",
    purpose: "Program planning, execution tracking, risks, issues, dependencies, and reporting",
    participants: "PMO leads, workstream leads, functional leads",
    cadence: "Weekly",
    nextMeeting: "June 18, 2026",
    chair: "Program Director",
    openActions: 8,
    status: "On Track",
    tier: 2,
    agenda: ["Plan and milestone review", "Risk and issue triage", "Dependency check", "Action closure"],
    notes: "",
  },
  {
    id: "forum-tab",
    name: "Technical Advisory Board",
    purpose: "Architecture, standards, technical decisions, and exception management",
    participants: "Solution architects, engineering leaders, SMEs",
    cadence: "Biweekly",
    nextMeeting: "June 19, 2026",
    chair: "Chief Architect",
    openActions: 4,
    status: "On Track",
    tier: 2,
    agenda: ["Reference architecture review", "L3 escalation model", "Standards exceptions"],
    notes: "",
  },
  {
    id: "forum-runops",
    name: "RunOps and SRE Council",
    purpose: "Operational health, incidents, reliability, automation, and service performance",
    participants: "RunOps lead, SRE lead, service delivery managers, operations managers",
    cadence: "Weekly",
    nextMeeting: "June 18, 2026",
    chair: "RunOps Lead",
    openActions: 6,
    status: "Attention Required",
    tier: 3,
    agenda: ["Incident and problem review", "Automation adoption", "Tooling enablement plan"],
    notes: "",
  },
  {
    id: "forum-cab",
    name: "Change Advisory Board",
    purpose: "Change approval, release risk, scheduling, readiness, and post-implementation review",
    participants: "Change manager, technical leads, service owners",
    cadence: "Weekly",
    nextMeeting: "June 17, 2026",
    chair: "Change Manager",
    openActions: 2,
    status: "On Track",
    tier: 3,
    agenda: ["Change queue review", "Release readiness", "Post-implementation reviews"],
    notes: "",
  },
  {
    id: "forum-commercial",
    name: "Commercial Governance Council",
    purpose: "Commercial assumptions, margin protection, services pipeline, funding, and contract obligations",
    participants: "Commercial lead, finance, legal, program leadership",
    cadence: "Biweekly",
    nextMeeting: "June 22, 2026",
    chair: "Commercial Leader",
    openActions: 5,
    status: "Attention Required",
    tier: 2,
    agenda: ["Assumption change sets", "Margin and rate review", "Contract obligations"],
    notes: "",
  },
  {
    id: "forum-cs",
    name: "Customer Success Council",
    purpose: "Customer health, adoption, renewal readiness, stakeholder engagement, and value realization",
    participants: "Customer success, account leaders, delivery leads",
    cadence: "Monthly",
    nextMeeting: "June 26, 2026",
    chair: "Customer Success Lead",
    openActions: 3,
    status: "On Track",
    tier: 3,
    agenda: ["Customer health review", "Adoption plan", "Value realization reporting"],
    notes: "",
  },
];

const act = (id: string, label: string, complete: boolean): OperationalActivity => ({ id, label, complete });

const phases: OperationalPhase[] = [
  {
    id: "day0",
    title: "Day 0",
    subtitle: "Build and Transition",
    objective:
      "Prepare the operating environment, people, processes, tools, governance, and service controls required to begin operations safely.",
    outcome: "Prepared to Operate",
    readiness: 78,
    status: "In Progress",
    owner: "Transition Lead",
    targetPeriod: "Jun – Sep 2026",
    activities: [
      "Governance mobilization",
      "Platform provisioning",
      "Access and identity setup",
      "RunOps onboarding",
      "Service-transition planning",
      "Monitoring setup",
      "Tooling enablement",
      "Documentation and knowledge-base creation",
      "Runbook development",
      "Support-model definition",
      "Operational-readiness reviews",
      "RACI confirmation",
      "Escalation-path validation",
      "Baseline service metrics",
      "Customer and stakeholder communication plan",
    ].map((label, i) => act(`day0-${i + 1}`, label, i < 12)),
  },
  {
    id: "day1",
    title: "Day 1",
    subtitle: "Operate and Stabilize",
    objective:
      "Operate the service reliably, respond to incidents, stabilize the environment, and meet committed service levels.",
    outcome: "Stable Operations",
    readiness: 65,
    status: "Planned",
    owner: "Service Delivery Manager",
    targetPeriod: "Oct 2026 – Mar 2027",
    activities: [
      "Incident management",
      "Major incident management",
      "Event monitoring",
      "Service-request fulfillment",
      "Performance monitoring",
      "Availability management",
      "Problem identification",
      "Change enablement",
      "User support",
      "Operational reporting",
      "SLA tracking",
      "Customer communication",
      "Knowledge refinement",
      "Shift-handover governance",
      "Early-life support",
    ].map((label, i) => act(`day1-${i + 1}`, label, i < 10)),
  },
  {
    id: "day2",
    title: "Day 2",
    subtitle: "Optimize and Evolve",
    objective:
      "Improve service quality, cost, automation, resilience, capacity, customer experience, and business outcomes.",
    outcome: "Continuous Value",
    readiness: 35,
    status: "Future Phase",
    owner: "RunOps Practice Leader",
    targetPeriod: "Apr 2027 onward",
    activities: [
      "Service optimization",
      "Problem elimination",
      "Automation and AI enablement",
      "SRE maturity",
      "Cost optimization",
      "Capacity planning",
      "Demand forecasting",
      "Continual service improvement",
      "Experience improvement",
      "Reliability engineering",
      "Technical-debt reduction",
      "Innovation roadmap",
      "Productivity improvement",
      "Service expansion",
      "Outcome and value reporting",
    ].map((label, i) => act(`day2-${i + 1}`, label, i < 5)),
  },
];

const raci: RaciAssignment[] = [
  {
    fn: "Strategy and Governance",
    description: "Sets engagement strategy, governance structure, and decision rights.",
    cells: {
      "Executive Steering Committee": "A",
      PMO: "R",
      "Delivery Pods": "I",
      "RunOps & SRE": "I",
      "Customer Success": "C",
      Commercial: "C",
      "Finance & Legal": "I",
    },
  },
  {
    fn: "Program Planning",
    description: "Owns the integrated plan, milestones, dependencies, and baselines.",
    cells: {
      "Executive Steering Committee": "A",
      PMO: "R",
      "Delivery Pods": "C",
      "RunOps & SRE": "C",
      "Customer Success": "I",
      Commercial: "C",
      "Finance & Legal": "I",
    },
  },
  {
    fn: "Commercial Management",
    description: "Manages commercial framework, pricing assumptions, and margin protection.",
    cells: {
      "Executive Steering Committee": "A",
      PMO: "C",
      "Delivery Pods": "I",
      "RunOps & SRE": "I",
      "Customer Success": "C",
      Commercial: "R",
      "Finance & Legal": "C",
    },
  },
  {
    fn: "Solution Delivery",
    description: "Designs, builds, and validates the solution against agreed scope.",
    cells: {
      "Executive Steering Committee": "I",
      PMO: "A",
      "Delivery Pods": "R",
      "RunOps & SRE": "C",
      "Customer Success": "I",
      Commercial: "I",
      "Finance & Legal": "",
    },
  },
  {
    fn: "Service Transition",
    description: "Transitions services into operations with readiness gates.",
    cells: {
      "Executive Steering Committee": "I",
      PMO: "A",
      "Delivery Pods": "R",
      "RunOps & SRE": "R",
      "Customer Success": "C",
      Commercial: "I",
      "Finance & Legal": "",
    },
  },
  {
    fn: "Operations Management",
    description: "Runs day-to-day service operations and operational controls.",
    cells: {
      "Executive Steering Committee": "I",
      PMO: "C",
      "Delivery Pods": "C",
      "RunOps & SRE": "R",
      "Customer Success": "I",
      Commercial: "I",
      "Finance & Legal": "",
    },
  },
  {
    fn: "Incident Management",
    description: "Detects, triages, and resolves incidents within service levels.",
    cells: {
      "Executive Steering Committee": "I",
      PMO: "I",
      "Delivery Pods": "C",
      "RunOps & SRE": "R",
      "Customer Success": "I",
      Commercial: "",
      "Finance & Legal": "",
    },
  },
  {
    fn: "Problem Management",
    description: "Eliminates recurring faults and root causes.",
    cells: {
      "Executive Steering Committee": "I",
      PMO: "I",
      "Delivery Pods": "C",
      "RunOps & SRE": "R",
      "Customer Success": "I",
      Commercial: "",
      "Finance & Legal": "",
    },
  },
  {
    fn: "Change Management",
    description: "Assesses, approves, and schedules changes and releases.",
    cells: {
      "Executive Steering Committee": "I",
      PMO: "C",
      "Delivery Pods": "R",
      "RunOps & SRE": "A",
      "Customer Success": "I",
      Commercial: "",
      "Finance & Legal": "",
    },
  },
  {
    fn: "Customer Success",
    description: "Owns customer health, adoption, and stakeholder engagement.",
    cells: {
      "Executive Steering Committee": "I",
      PMO: "I",
      "Delivery Pods": "C",
      "RunOps & SRE": "C",
      "Customer Success": "R",
      Commercial: "C",
      "Finance & Legal": "",
    },
  },
  {
    fn: "Performance and Reporting",
    description: "Produces governance, service, and value reporting.",
    cells: {
      "Executive Steering Committee": "C",
      PMO: "A",
      "Delivery Pods": "C",
      "RunOps & SRE": "R",
      "Customer Success": "C",
      Commercial: "I",
      "Finance & Legal": "I",
    },
  },
  {
    fn: "Risk Management",
    description: "Identifies, mitigates, and escalates program and operational risk.",
    cells: {
      "Executive Steering Committee": "A",
      PMO: "R",
      "Delivery Pods": "C",
      "RunOps & SRE": "C",
      "Customer Success": "I",
      Commercial: "C",
      "Finance & Legal": "C",
    },
  },
  {
    fn: "Value Realization",
    description: "Tracks outcomes, benefits, and business value delivered.",
    cells: {
      "Executive Steering Committee": "A",
      PMO: "C",
      "Delivery Pods": "I",
      "RunOps & SRE": "C",
      "Customer Success": "R",
      Commercial: "C",
      "Finance & Legal": "I",
    },
  },
];

const risks: GovernanceRisk[] = [
  {
    id: "risk-1",
    title: "Delayed customer access may affect transition readiness",
    type: "Risk",
    severity: "High",
    owner: "PMO",
    status: "Open",
    impact: "Delays discovery, build validation, and service onboarding",
    mitigation: "Secure access and customer introductions by July 10, 2026",
    dueDate: "July 10, 2026",
    notes: [],
  },
  {
    id: "risk-2",
    title: "Resource constraints during build and transition",
    type: "Risk",
    severity: "Medium",
    owner: "Delivery Lead",
    status: "Monitoring",
    impact: "Could delay configuration and knowledge transfer",
    mitigation: "Review capacity and resource plan weekly",
    dueDate: "July 15, 2026",
    notes: [],
  },
  {
    id: "risk-3",
    title: "Tooling and automation adoption is slower than planned",
    type: "Issue",
    severity: "Medium",
    owner: "RunOps Lead",
    status: "Open",
    impact: "May increase manual effort and affect Day 1 efficiency",
    mitigation: "Execute tooling enablement plan and adoption reviews",
    dueDate: "August 1, 2026",
    notes: [],
  },
  {
    id: "risk-4",
    title: "Commercial operating assumptions are not fully approved",
    type: "Risk",
    severity: "High",
    owner: "Commercial Lead",
    status: "Open",
    impact: "Could delay mobilization funding and staffing approval",
    mitigation: "Complete executive decision before July 31, 2026",
    dueDate: "July 31, 2026",
    notes: [],
  },
  {
    id: "risk-5",
    title: "L3 escalation responsibilities require clarification",
    type: "Issue",
    severity: "Medium",
    owner: "Technical Advisory Board",
    status: "In Progress",
    impact: "May slow complex incident resolution",
    mitigation: "Approve escalation RACI and response model",
    dueDate: "July 20, 2026",
    notes: [],
  },
];

const decisions: GovernanceDecision[] = [
  {
    id: "dec-1",
    title: "Commercial framework approval",
    decisionType: "Commercial",
    owner: "Citrix Executives",
    forum: "Executive Steering Committee",
    dueDate: "July 31, 2026",
    status: "In Progress",
    impact: "Enables mobilization funding and commercial operating model",
    rationale: "",
  },
  {
    id: "dec-2",
    title: "Neurealm operating model approval",
    decisionType: "Governance",
    owner: "Neurealm Leadership",
    forum: "Executive Steering Committee",
    dueDate: "August 15, 2026",
    status: "Planned",
    impact: "Confirms responsibilities, authority, and operating structure",
    rationale: "",
  },
  {
    id: "dec-3",
    title: "RunOps tooling selection",
    decisionType: "Technology",
    owner: "RunOps Lead",
    forum: "RunOps and SRE Council",
    dueDate: "July 15, 2026",
    status: "Planned",
    impact: "Establishes monitoring, workflow, and service reporting foundation",
    rationale: "",
  },
  {
    id: "dec-4",
    title: "L3 escalation model approval",
    decisionType: "Operations",
    owner: "Technical Advisory Board",
    forum: "Technical Advisory Board",
    dueDate: "July 20, 2026",
    status: "In Progress",
    impact: "Establishes support boundaries and escalation accountability",
    rationale: "",
  },
  {
    id: "dec-5",
    title: "Activation staffing plan",
    decisionType: "Resource",
    owner: "Delivery Executive",
    forum: "PMO",
    dueDate: "July 25, 2026",
    status: "Attention Required",
    impact: "Confirms staffing needed for Day 0 and Day 1 execution",
    rationale: "",
  },
];

const kpis: GovernanceKpi[] = [
  {
    id: "kpi-1",
    name: "Governance Meetings Held",
    target: "≥ 90%",
    current: "100%",
    status: "On Track",
    trend: "Stable",
    owner: "PMO",
    history: [96, 98, 100, 100, 100, 100],
    updatedAt: null,
  },
  {
    id: "kpi-2",
    name: "Decisions Made On Time",
    target: "≥ 90%",
    current: "88%",
    status: "At Risk",
    trend: "Declining",
    owner: "Executive Steering Committee",
    history: [95, 94, 92, 91, 90, 88],
    updatedAt: null,
  },
  {
    id: "kpi-3",
    name: "Risks with Active Mitigation",
    target: "100%",
    current: "100%",
    status: "On Track",
    trend: "Stable",
    owner: "PMO",
    history: [100, 100, 98, 100, 100, 100],
    updatedAt: null,
  },
  {
    id: "kpi-4",
    name: "Critical Incidents Open",
    target: "0",
    current: "0",
    status: "On Track",
    trend: "Stable",
    owner: "RunOps Lead",
    history: [0, 1, 0, 0, 0, 0],
    updatedAt: null,
  },
  {
    id: "kpi-5",
    name: "Customer Satisfaction",
    target: "> 4.5",
    current: "4.6",
    status: "On Track",
    trend: "Improving",
    owner: "Customer Success Lead",
    history: [4.2, 4.3, 4.4, 4.4, 4.5, 4.6],
    updatedAt: null,
  },
  {
    id: "kpi-6",
    name: "Change Success Rate",
    target: "> 95%",
    current: "97%",
    status: "On Track",
    trend: "Improving",
    owner: "Change Manager",
    history: [93, 94, 95, 96, 96, 97],
    updatedAt: null,
  },
  {
    id: "kpi-7",
    name: "SLA Attainment",
    target: "> 99%",
    current: "99.4%",
    status: "On Track",
    trend: "Stable",
    owner: "Service Delivery Manager",
    history: [99.1, 99.2, 99.3, 99.3, 99.4, 99.4],
    updatedAt: null,
  },
  {
    id: "kpi-8",
    name: "Automation Adoption",
    target: "> 60%",
    current: "42%",
    status: "Attention Required",
    trend: "Improving",
    owner: "SRE Lead",
    history: [28, 31, 34, 36, 38, 42],
    updatedAt: null,
  },
  {
    id: "kpi-9",
    name: "Action Closure On Time",
    target: "> 90%",
    current: "84%",
    status: "At Risk",
    trend: "Declining",
    owner: "PMO",
    history: [93, 92, 90, 88, 86, 84],
    updatedAt: null,
  },
  {
    id: "kpi-10",
    name: "Day 0 Readiness",
    target: "100%",
    current: "78%",
    status: "In Progress",
    trend: "Improving",
    owner: "Transition Lead",
    history: [48, 56, 63, 68, 72, 78],
    updatedAt: null,
  },
];

const meetings: GovernanceMeeting[] = [
  {
    id: "mtg-1",
    date: "June 17, 2026",
    day: "Jun 17",
    forumId: "forum-cab",
    forum: "Change Advisory Board",
    tier: 3,
    chair: "Change Manager",
    purpose: "Change approval, release risk, scheduling, readiness, and post-implementation review",
    participants: "Change manager, technical leads, service owners",
    agenda: ["Change queue review", "Monitoring configuration change", "Post-implementation reviews"],
    openDecisionIds: [],
    openRiskIds: ["risk-3"],
    actionItems: ["Confirm change freeze window for transition"],
  },
  {
    id: "mtg-2",
    date: "June 18, 2026",
    day: "Jun 18",
    forumId: "forum-pmo",
    forum: "Program Management Office",
    tier: 2,
    chair: "Program Director",
    purpose: "Program planning, execution tracking, risks, issues, dependencies, and reporting",
    participants: "PMO leads, workstream leads, functional leads",
    agenda: ["Milestone review", "Risk triage", "Activation staffing plan"],
    openDecisionIds: ["dec-5"],
    openRiskIds: ["risk-1", "risk-2"],
    actionItems: ["Publish updated integrated plan"],
  },
  {
    id: "mtg-3",
    date: "June 18, 2026",
    day: "Jun 18",
    forumId: "forum-runops",
    forum: "RunOps and SRE Council",
    tier: 3,
    chair: "RunOps Lead",
    purpose: "Operational health, incidents, reliability, automation, and service performance",
    participants: "RunOps lead, SRE lead, service delivery managers, operations managers",
    agenda: ["Automation adoption", "Tooling selection shortlist", "Monitoring coverage"],
    openDecisionIds: ["dec-3"],
    openRiskIds: ["risk-3"],
    actionItems: ["Complete tooling evaluation scorecard"],
  },
  {
    id: "mtg-4",
    date: "June 19, 2026",
    day: "Jun 19",
    forumId: "forum-tab",
    forum: "Technical Advisory Board",
    tier: 2,
    chair: "Chief Architect",
    purpose: "Architecture, standards, technical decisions, and exception management",
    participants: "Solution architects, engineering leaders, SMEs",
    agenda: ["L3 escalation model", "Architecture standards", "Exception register"],
    openDecisionIds: ["dec-4"],
    openRiskIds: ["risk-5"],
    actionItems: ["Circulate escalation RACI for approval"],
  },
  {
    id: "mtg-5",
    date: "June 22, 2026",
    day: "Jun 22",
    forumId: "forum-commercial",
    forum: "Commercial Governance Council",
    tier: 2,
    chair: "Commercial Leader",
    purpose: "Commercial assumptions, margin protection, services pipeline, funding, and contract obligations",
    participants: "Commercial lead, finance, legal, program leadership",
    agenda: ["Commercial framework readiness", "Margin review", "Contract obligations"],
    openDecisionIds: ["dec-1"],
    openRiskIds: ["risk-4"],
    actionItems: ["Finalize commercial approval pack"],
  },
  {
    id: "mtg-6",
    date: "June 24, 2026",
    day: "Jun 24",
    forumId: "forum-esc",
    forum: "Executive Steering Committee",
    tier: 1,
    chair: "Executive Sponsor",
    purpose: "Strategic oversight, investment decisions, funding, risks, and escalations",
    participants: "Neurealm executives, program sponsors, commercial and delivery leaders",
    agenda: ["Governance health", "Commercial framework approval", "Day 0 readiness", "Escalations"],
    openDecisionIds: ["dec-1", "dec-2"],
    openRiskIds: ["risk-1", "risk-4"],
    actionItems: ["Approve mobilization funding envelope"],
  },
  {
    id: "mtg-7",
    date: "June 26, 2026",
    day: "Jun 26",
    forumId: "forum-cs",
    forum: "Customer Success Council",
    tier: 3,
    chair: "Customer Success Lead",
    purpose: "Customer health, adoption, renewal readiness, stakeholder engagement, and value realization",
    participants: "Customer success, account leaders, delivery leads",
    agenda: ["Customer health", "Stakeholder map", "Value realization plan"],
    openDecisionIds: [],
    openRiskIds: ["risk-1"],
    actionItems: ["Schedule executive stakeholder briefing"],
  },
];

const activity: GovernanceActivity[] = [
  {
    id: "act-1",
    timestamp: "Jun 17, 2026 10:12 AM",
    actor: "PMO",
    action: "Updated Day 0 readiness from 72% to 78%",
    relatedItem: "Day 0 — Build and Transition",
    category: "Readiness",
  },
  {
    id: "act-2",
    timestamp: "Jun 17, 2026 09:40 AM",
    actor: "Commercial Lead",
    action: "Moved commercial framework decision to In Progress",
    relatedItem: "Commercial framework approval",
    category: "Decision",
  },
  {
    id: "act-3",
    timestamp: "Jun 16, 2026 04:22 PM",
    actor: "Program Director",
    action: "Escalated customer access risk to High",
    relatedItem: "Delayed customer access",
    category: "Risk",
  },
  {
    id: "act-4",
    timestamp: "Jun 16, 2026 02:05 PM",
    actor: "PMO",
    action: "Assigned RunOps tooling decision to the RunOps Lead",
    relatedItem: "RunOps tooling selection",
    category: "Decision",
  },
  {
    id: "act-5",
    timestamp: "Jun 16, 2026 11:30 AM",
    actor: "Change Manager",
    action: "Approved the monitoring configuration change",
    relatedItem: "Change Advisory Board",
    category: "Change",
  },
  {
    id: "act-6",
    timestamp: "Jun 15, 2026 05:10 PM",
    actor: "Executive Sponsor",
    action: "Updated Executive Steering Committee agenda",
    relatedItem: "Executive Steering Committee",
    category: "Forum",
  },
  {
    id: "act-7",
    timestamp: "Jun 15, 2026 09:15 AM",
    actor: "SRE Lead",
    action: "Automation adoption KPI improved from 38% to 42%",
    relatedItem: "Automation Adoption",
    category: "KPI",
  },
];

const attention: ExecutiveAttentionItem[] = [
  { id: "att-1", text: "Commercial framework approval is required by July 31.", severity: "High", relatedTarget: "decisions" },
  { id: "att-2", text: "Customer access is required before build validation can begin.", severity: "High", relatedTarget: "risks" },
  { id: "att-3", text: "Activation staffing is not yet fully approved.", severity: "Medium", relatedTarget: "decisions" },
  { id: "att-4", text: "Automation adoption is below the Day 1 target.", severity: "Medium", relatedTarget: "kpis" },
  { id: "att-5", text: "Decision timeliness is below governance target.", severity: "Medium", relatedTarget: "kpis" },
];

export const EXECUTIVE_UPDATE_TEXT =
  "Governance remains broadly on track. Immediate leadership attention is required for commercial approval, customer access, and activation staffing. Day 0 readiness is progressing, but open dependencies could affect build and transition dates if not resolved within the current decision window.";

export interface NeurealmGovernanceData {
  summary: GovernanceSummary[];
  tiers: GovernanceTier[];
  forums: GovernanceForum[];
  phases: OperationalPhase[];
  raci: RaciAssignment[];
  risks: GovernanceRisk[];
  decisions: GovernanceDecision[];
  kpis: GovernanceKpi[];
  meetings: GovernanceMeeting[];
  activity: GovernanceActivity[];
  attention: ExecutiveAttentionItem[];
}

const BASE: NeurealmGovernanceData = {
  summary,
  tiers,
  forums,
  phases,
  raci,
  risks,
  decisions,
  kpis,
  meetings,
  activity,
  attention,
};

/** Returns a deep clone so local edits never mutate the module-level baseline. */
export function createInitialGovernanceData(): NeurealmGovernanceData {
  return structuredClone(BASE);
}
