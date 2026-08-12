/**
 * Program & Customer Timelines — prototype mock data.
 *
 * PROTOTYPE ONLY. No backend, no persistence. All values are illustrative and
 * do not represent committed contractual dates.
 */

export type ActivityCategory =
  | "Planning"
  | "Build"
  | "Testing"
  | "Deployment"
  | "Customer Activity"
  | "Commercial"
  | "Governance"
  | "Readiness";

export type ActivityStatus =
  | "Not Started"
  | "In Progress"
  | "At Risk"
  | "Completed";

export type MilestoneStatus = "Completed" | "In Progress" | "On Track" | "Delayed";

export interface ProgramSummary {
  id: string;
  label: string;
  value: string;
  supporting: string;
  status?: "On Track" | "At Risk";
  /** Lane group ids highlighted when the card is selected. */
  focusGroupIds?: string[];
  detail: string[];
}

export interface TimelineActivity {
  id: string;
  name: string;
  groupId: string;
  start: string; // ISO date
  end: string; // ISO date
  owner: string;
  status: ActivityStatus;
  category: ActivityCategory;
  progress: number; // 0-100
  criticalPath: boolean;
  customerOwned: boolean;
  description: string;
  relatedMilestoneIds: string[];
  customerObligations: string[];
  commercialImplications: string;
  notes: string;
  lastUpdate: string;
}

export interface TimelineGroup {
  id: string;
  name: string;
}

export interface Dependency {
  id: string;
  fromActivityId: string;
  toActivityId: string;
  type: "finish-to-start" | "required-before";
  label: string;
}

export interface Milestone {
  id: string;
  index: number;
  name: string;
  description: string;
  owner: string;
  date: string; // ISO
  status: MilestoneStatus;
  dependency: string;
  emphasis?: boolean;
  readiness: number;
  requiredActions: string[];
}

export interface ScheduleRisk {
  id: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  impact: string;
  owner: string;
  mitigation: string;
}

export interface ScheduleInsight {
  id: string;
  text: string;
}

export interface TimelineFilterState {
  groupIds: string[];
  owners: string[];
  statuses: ActivityStatus[];
  categories: ActivityCategory[];
  milestonesOnly: boolean;
  atRiskOnly: boolean;
  customerOwnedOnly: boolean;
  criticalPathOnly: boolean;
  search: string;
}

export const EMPTY_FILTERS: TimelineFilterState = {
  groupIds: [],
  owners: [],
  statuses: [],
  categories: [],
  milestonesOnly: false,
  atRiskOnly: false,
  customerOwnedOnly: false,
  criticalPathOnly: false,
  search: "",
};

/** Mock "today" for the prototype. */
export const MOCK_TODAY = "2026-06-17";
export const TIMELINE_START = "2026-06-01";
export const TIMELINE_END = "2026-12-31";
export const LAST_UPDATED = "June 17, 2026 at 10:30 AM";

export const PROGRAM_CONTEXT =
  "Citrix + Neurealm Healthcare Operating Model Engagement";

export const PROGRAM_SUMMARY: ProgramSummary[] = [
  {
    id: "duration",
    label: "Program Duration",
    value: "Approximately 6 Months",
    supporting: "June 2026 to December 2026",
    detail: [
      "Five delivery phases spanning discovery through operational acceptance.",
      "Schedule assumes commercial approval completes by July 31, 2026.",
    ],
  },
  {
    id: "go-live",
    label: "Target Go-Live",
    value: "December 15, 2026",
    supporting: "Production launch and steady-state transition",
    status: "On Track",
    detail: [
      "Go-live is gated by UAT sign-off and operational acceptance.",
      "No committed contractual date is represented by this prototype.",
    ],
  },
  {
    id: "stakeholders",
    label: "Stakeholder Model",
    value: "Citrix + Neurealm",
    supporting: "Jointly governed program",
    focusGroupIds: ["customer", "commercial"],
    detail: [
      "Joint steering committee with executive sponsors from both parties.",
      "Customer-owned activities represent roughly 30% of scheduled effort.",
    ],
  },
  {
    id: "milestones",
    label: "Key Milestones",
    value: "7",
    supporting: "Across five delivery phases",
    detail: [
      "One milestone completed, one in progress, five tracking on schedule.",
      "Go-Live is the terminal milestone on the critical path.",
    ],
  },
];

export const TIMELINE_GROUPS: TimelineGroup[] = [
  { id: "deliverables", name: "Neurealm Deliverables" },
  { id: "customer", name: "Customer Activities" },
  { id: "commercial", name: "Commercial and Governance" },
  { id: "readiness", name: "Operational Readiness" },
];

export const TIMELINE_ACTIVITIES: TimelineActivity[] = [
  // Group 1 — Neurealm Deliverables
  {
    id: "a-discovery",
    name: "Discovery & Planning",
    groupId: "deliverables",
    start: "2026-06-17",
    end: "2026-07-15",
    owner: "Joint Program Team",
    status: "In Progress",
    category: "Planning",
    progress: 35,
    criticalPath: true,
    customerOwned: false,
    description:
      "Current-state discovery, operating model baseline, and integrated program planning.",
    relatedMilestoneIds: ["m-kickoff"],
    customerObligations: ["Stakeholder introductions", "Access to operating documentation"],
    commercialImplications: "Confirms scope assumptions underpinning the commercial model.",
    notes: "Discovery workshops scheduled weekly through July.",
    lastUpdate: "June 16, 2026",
  },
  {
    id: "a-design",
    name: "Solution Design",
    groupId: "deliverables",
    start: "2026-07-16",
    end: "2026-08-15",
    owner: "Solution Architecture",
    status: "Not Started",
    category: "Planning",
    progress: 0,
    criticalPath: true,
    customerOwned: false,
    description: "Target architecture, service design, and delivery scope definition.",
    relatedMilestoneIds: ["m-design"],
    customerObligations: ["Architecture review participation"],
    commercialImplications: "Design decisions drive build effort and cost-to-serve.",
    notes: "Design authority review required before build entry.",
    lastUpdate: "June 12, 2026",
  },
  {
    id: "a-build",
    name: "Build & Configuration",
    groupId: "deliverables",
    start: "2026-08-16",
    end: "2026-10-15",
    owner: "Neurealm Delivery",
    status: "Not Started",
    category: "Build",
    progress: 0,
    criticalPath: true,
    customerOwned: false,
    description: "Platform build, configuration, and integration of operating components.",
    relatedMilestoneIds: ["m-config"],
    customerObligations: ["Environment and data access"],
    commercialImplications: "Longest phase; overruns directly compress testing.",
    notes: "Dependent on data and access readiness.",
    lastUpdate: "June 10, 2026",
  },
  {
    id: "a-testing",
    name: "Testing & Validation",
    groupId: "deliverables",
    start: "2026-10-16",
    end: "2026-11-15",
    owner: "Joint Quality Team",
    status: "Not Started",
    category: "Testing",
    progress: 0,
    criticalPath: true,
    customerOwned: false,
    description: "Functional, integration, and operational validation of the delivered solution.",
    relatedMilestoneIds: ["m-uat"],
    customerObligations: ["Test participation and defect triage"],
    commercialImplications: "Testing outcomes gate the go-live commitment.",
    notes: "Runs in parallel with customer UAT.",
    lastUpdate: "June 10, 2026",
  },
  {
    id: "a-deploy",
    name: "Deployment & Transition",
    groupId: "deliverables",
    start: "2026-11-16",
    end: "2026-12-15",
    owner: "Transition Management",
    status: "Not Started",
    category: "Deployment",
    progress: 0,
    criticalPath: true,
    customerOwned: false,
    description: "Production deployment, cutover, and transition to steady-state operations.",
    relatedMilestoneIds: ["m-golive"],
    customerObligations: ["Cutover approval"],
    commercialImplications: "Triggers commencement of steady-state commercial terms.",
    notes: "Cutover window to be confirmed with customer operations.",
    lastUpdate: "June 10, 2026",
  },

  // Group 2 — Customer Activities
  {
    id: "a-stakeholder",
    name: "Stakeholder Alignment",
    groupId: "customer",
    start: "2026-06-17",
    end: "2026-07-10",
    owner: "Citrix + Customer",
    status: "In Progress",
    category: "Customer Activity",
    progress: 45,
    criticalPath: false,
    customerOwned: true,
    description: "Identification, introduction, and alignment of program stakeholders.",
    relatedMilestoneIds: ["m-kickoff"],
    customerObligations: ["Confirm stakeholder map", "Schedule introductions"],
    commercialImplications: "Slow alignment reduces discovery quality and model confidence.",
    notes: "Two business units still to be introduced.",
    lastUpdate: "June 16, 2026",
  },
  {
    id: "a-data-access",
    name: "Data & Access Readiness",
    groupId: "customer",
    start: "2026-07-11",
    end: "2026-08-10",
    owner: "Citrix",
    status: "Not Started",
    category: "Customer Activity",
    progress: 0,
    criticalPath: true,
    customerOwned: true,
    description: "Provision of data extracts, environments, and access required for build.",
    relatedMilestoneIds: ["m-config"],
    customerObligations: ["Data extracts", "Environment credentials"],
    commercialImplications: "Delays here shift build commencement and go-live risk.",
    notes: "Required before build entry.",
    lastUpdate: "June 12, 2026",
  },
  {
    id: "a-uat",
    name: "UAT & Feedback",
    groupId: "customer",
    start: "2026-10-01",
    end: "2026-11-10",
    owner: "Customer",
    status: "Not Started",
    category: "Testing",
    progress: 0,
    criticalPath: true,
    customerOwned: true,
    description: "Customer acceptance testing, validation, and structured feedback.",
    relatedMilestoneIds: ["m-uat"],
    customerObligations: ["Nominate testers", "Complete test scripts"],
    commercialImplications: "UAT sign-off is a precondition to go-live readiness.",
    notes: "Test window overlaps change management activity.",
    lastUpdate: "June 10, 2026",
  },
  {
    id: "a-change",
    name: "Change Management",
    groupId: "customer",
    start: "2026-10-01",
    end: "2026-12-01",
    owner: "Joint Change Team",
    status: "Not Started",
    category: "Deployment",
    progress: 0,
    criticalPath: false,
    customerOwned: true,
    description: "Communications, training, and adoption readiness across affected teams.",
    relatedMilestoneIds: ["m-opaccept"],
    customerObligations: ["Training attendance", "Comms approvals"],
    commercialImplications: "Adoption pace affects realised value in year one.",
    notes: "Adoption metrics to be defined during design.",
    lastUpdate: "June 10, 2026",
  },
  {
    id: "a-golive-readiness",
    name: "Go-Live Readiness",
    groupId: "customer",
    start: "2026-11-16",
    end: "2026-12-15",
    owner: "Joint Program Team",
    status: "Not Started",
    category: "Customer Activity",
    progress: 0,
    criticalPath: true,
    customerOwned: true,
    description: "Final readiness assessment, cutover rehearsal, and go / no-go decision.",
    relatedMilestoneIds: ["m-golive"],
    customerObligations: ["Go / no-go participation"],
    commercialImplications: "Gate for revenue commencement under the operating model.",
    notes: "Requires UAT sign-off.",
    lastUpdate: "June 10, 2026",
  },

  // Group 3 — Commercial and Governance
  {
    id: "a-terms",
    name: "Commercial Terms Alignment",
    groupId: "commercial",
    start: "2026-06-17",
    end: "2026-07-31",
    owner: "Commercial Leadership",
    status: "In Progress",
    category: "Commercial",
    progress: 30,
    criticalPath: true,
    customerOwned: false,
    description: "Alignment of commercial construct, pricing mechanics, and funding assumptions.",
    relatedMilestoneIds: ["m-framework"],
    customerObligations: ["Commercial review participation"],
    commercialImplications: "Directly determines the approved commercial framework.",
    notes: "Draft term sheet in circulation.",
    lastUpdate: "June 16, 2026",
  },
  {
    id: "a-arr",
    name: "Account and ARR Validation",
    groupId: "commercial",
    start: "2026-06-17",
    end: "2026-08-10",
    owner: "Finance + Citrix",
    status: "At Risk",
    category: "Commercial",
    progress: 20,
    criticalPath: true,
    customerOwned: false,
    description: "Validation of account-level ARR, renewal dates, and product mix.",
    relatedMilestoneIds: ["m-framework"],
    customerObligations: ["Account-level ARR extract"],
    commercialImplications: "Unvalidated ARR blocks commercial model approval.",
    notes: "Most material near-term schedule risk.",
    lastUpdate: "June 17, 2026",
  },
  {
    id: "a-governance",
    name: "Governance Model Approval",
    groupId: "commercial",
    start: "2026-07-01",
    end: "2026-07-31",
    owner: "Executive Steering Committee",
    status: "Not Started",
    category: "Governance",
    progress: 0,
    criticalPath: false,
    customerOwned: false,
    description: "Approval of joint governance forums, cadence, and decision rights.",
    relatedMilestoneIds: ["m-framework"],
    customerObligations: ["Executive sponsor nomination"],
    commercialImplications: "Establishes decision authority for change control.",
    notes: "Charter drafted.",
    lastUpdate: "June 12, 2026",
  },
  {
    id: "a-funding",
    name: "Funding and Activation Approval",
    groupId: "commercial",
    start: "2026-07-15",
    end: "2026-08-15",
    owner: "Executive Sponsors",
    status: "Not Started",
    category: "Commercial",
    progress: 0,
    criticalPath: true,
    customerOwned: false,
    description: "Approval of program funding and activation of delivery capacity.",
    relatedMilestoneIds: ["m-framework", "m-design"],
    customerObligations: ["Budget confirmation"],
    commercialImplications: "Releases delivery investment and staffing ramp.",
    notes: "Requires commercial terms alignment.",
    lastUpdate: "June 12, 2026",
  },
  {
    id: "a-opmodel",
    name: "Operating Model Approval",
    groupId: "commercial",
    start: "2026-08-01",
    end: "2026-08-31",
    owner: "Joint Governance Team",
    status: "Not Started",
    category: "Governance",
    progress: 0,
    criticalPath: false,
    customerOwned: false,
    description: "Approval of the target operating model and service boundaries.",
    relatedMilestoneIds: ["m-design"],
    customerObligations: ["Operating model review"],
    commercialImplications: "Confirms cost-to-serve and service commitments.",
    notes: "Follows solution design approval.",
    lastUpdate: "June 12, 2026",
  },

  // Group 4 — Operational Readiness
  {
    id: "a-tooling",
    name: "Tooling and Access Provisioning",
    groupId: "readiness",
    start: "2026-07-15",
    end: "2026-08-31",
    owner: "Citrix IT",
    status: "Not Started",
    category: "Readiness",
    progress: 0,
    criticalPath: false,
    customerOwned: true,
    description: "Provisioning of tooling, monitoring, and operational access.",
    relatedMilestoneIds: ["m-opaccept"],
    customerObligations: ["Access approvals", "Tooling licences"],
    commercialImplications: "Delays increase transition cost and support ramp risk.",
    notes: "Provision access before August 31.",
    lastUpdate: "June 12, 2026",
  },
  {
    id: "a-enablement",
    name: "Team Enablement and Certification",
    groupId: "readiness",
    start: "2026-08-01",
    end: "2026-09-15",
    owner: "Neurealm CoE",
    status: "Not Started",
    category: "Readiness",
    progress: 0,
    criticalPath: false,
    customerOwned: false,
    description: "Enablement, certification, and role readiness for the delivery and support teams.",
    relatedMilestoneIds: ["m-opaccept"],
    customerObligations: [],
    commercialImplications: "Supports the staffing model assumed in the P&L.",
    notes: "Certification tracks defined by CoE.",
    lastUpdate: "June 12, 2026",
  },
  {
    id: "a-support",
    name: "Support Model Activation",
    groupId: "readiness",
    start: "2026-09-01",
    end: "2026-10-15",
    owner: "RunOps Leadership",
    status: "Not Started",
    category: "Readiness",
    progress: 0,
    criticalPath: false,
    customerOwned: false,
    description: "Activation of the support model, runbooks, and escalation paths.",
    relatedMilestoneIds: ["m-opaccept"],
    customerObligations: ["Support model acceptance"],
    commercialImplications: "Underpins service-level commitments.",
    notes: "Requires tooling and access provisioning.",
    lastUpdate: "June 12, 2026",
  },
  {
    id: "a-transition",
    name: "Service Transition Readiness",
    groupId: "readiness",
    start: "2026-10-15",
    end: "2026-11-30",
    owner: "Transition Lead",
    status: "Not Started",
    category: "Readiness",
    progress: 0,
    criticalPath: false,
    customerOwned: false,
    description: "Transition planning, knowledge transfer, and readiness verification.",
    relatedMilestoneIds: ["m-opaccept"],
    customerObligations: ["Knowledge transfer participation"],
    commercialImplications: "Reduces post-go-live stabilisation cost.",
    notes: "Readiness checklist under construction.",
    lastUpdate: "June 12, 2026",
  },
  {
    id: "a-opaccept",
    name: "Operational Acceptance",
    groupId: "readiness",
    start: "2026-12-01",
    end: "2026-12-15",
    owner: "Joint Operations Team",
    status: "Not Started",
    category: "Readiness",
    progress: 0,
    criticalPath: true,
    customerOwned: false,
    description: "Formal acceptance of support, monitoring, runbooks, and service transition.",
    relatedMilestoneIds: ["m-opaccept", "m-golive"],
    customerObligations: ["Acceptance sign-off"],
    commercialImplications: "Precondition to go-live and steady-state billing.",
    notes: "Final gate before go-live.",
    lastUpdate: "June 12, 2026",
  },
];

export const DEPENDENCIES: Dependency[] = [
  { id: "d1", fromActivityId: "a-discovery", toActivityId: "a-design", type: "finish-to-start", label: "Discovery & Planning precedes Solution Design" },
  { id: "d2", fromActivityId: "a-design", toActivityId: "a-build", type: "finish-to-start", label: "Solution Design precedes Build & Configuration" },
  { id: "d3", fromActivityId: "a-build", toActivityId: "a-testing", type: "finish-to-start", label: "Build & Configuration precedes Testing & Validation" },
  { id: "d4", fromActivityId: "a-testing", toActivityId: "a-deploy", type: "finish-to-start", label: "Testing & Validation precedes Deployment & Transition" },
  { id: "d5", fromActivityId: "a-data-access", toActivityId: "a-build", type: "required-before", label: "Data & Access Readiness required before Build & Configuration" },
  { id: "d6", fromActivityId: "a-terms", toActivityId: "a-funding", type: "required-before", label: "Commercial Terms Alignment required before Funding and Activation Approval" },
  { id: "d7", fromActivityId: "a-tooling", toActivityId: "a-support", type: "required-before", label: "Tooling and Access Provisioning required before Support Model Activation" },
  { id: "d8", fromActivityId: "a-uat", toActivityId: "a-golive-readiness", type: "required-before", label: "UAT & Feedback required before Go-Live Readiness" },
  { id: "d9", fromActivityId: "a-opaccept", toActivityId: "a-golive-readiness", type: "required-before", label: "Operational Acceptance required before Go-Live" },
];

export const MILESTONES: Milestone[] = [
  {
    id: "m-kickoff",
    index: 1,
    name: "Project Kickoff",
    description: "Program kickoff and governance alignment",
    owner: "Citrix + Neurealm",
    date: "2026-06-17",
    status: "Completed",
    dependency: "None",
    readiness: 100,
    requiredActions: [],
  },
  {
    id: "m-framework",
    index: 2,
    name: "Commercial Framework Agreed",
    description: "Commercial, funding, and operating assumptions approved",
    owner: "Executive Sponsors",
    date: "2026-07-31",
    status: "In Progress",
    dependency: "Commercial Terms Alignment, Account and ARR Validation",
    readiness: 40,
    requiredActions: [
      "Complete account-level ARR validation",
      "Circulate final term sheet for executive approval",
    ],
  },
  {
    id: "m-design",
    index: 3,
    name: "Solution Design Approval",
    description: "Solution architecture and delivery scope approved",
    owner: "Joint Architecture Council",
    date: "2026-08-15",
    status: "On Track",
    dependency: "Solution Design",
    readiness: 15,
    requiredActions: ["Confirm architecture review participants"],
  },
  {
    id: "m-config",
    index: 4,
    name: "Configuration Complete",
    description: "Core platform and operating components configured",
    owner: "Neurealm",
    date: "2026-10-15",
    status: "On Track",
    dependency: "Build & Configuration, Data & Access Readiness",
    readiness: 5,
    requiredActions: ["Confirm environment provisioning dates"],
  },
  {
    id: "m-uat",
    index: 5,
    name: "UAT Sign-Off",
    description: "User acceptance testing and customer feedback approved",
    owner: "Citrix + Customer",
    date: "2026-11-15",
    status: "On Track",
    dependency: "Testing & Validation, UAT & Feedback",
    readiness: 10,
    requiredActions: [
      "Nominate customer acceptance testers",
      "Agree acceptance criteria and defect thresholds",
    ],
  },
  {
    id: "m-opaccept",
    index: 6,
    name: "Operational Acceptance",
    description: "Support, monitoring, runbooks, and service transition accepted",
    owner: "Joint Operations Team",
    date: "2026-12-10",
    status: "On Track",
    dependency: "Operational Acceptance, Service Transition Readiness",
    readiness: 5,
    requiredActions: ["Publish runbook certification plan"],
  },
  {
    id: "m-golive",
    index: 7,
    name: "Go-Live",
    description: "Production launch and transition to steady-state operations",
    owner: "Citrix + Neurealm",
    date: "2026-12-15",
    status: "On Track",
    dependency: "Operational Acceptance, Go-Live Readiness",
    emphasis: true,
    readiness: 0,
    requiredActions: ["Confirm cutover window"],
  },
];

export const SCHEDULE_RISKS: ScheduleRisk[] = [
  {
    id: "r1",
    title: "Account-level ARR data is not fully validated",
    severity: "High",
    impact: "Could delay commercial model approval",
    owner: "Finance + Citrix",
    mitigation: "Complete account-level validation before July 31",
  },
  {
    id: "r2",
    title: "Customer access and stakeholder introductions are incomplete",
    severity: "Medium",
    impact: "Could reduce discovery quality",
    owner: "Citrix",
    mitigation: "Complete introductions before July 10",
  },
  {
    id: "r3",
    title: "Tooling access may not be available before operational onboarding",
    severity: "Medium",
    impact: "Could delay support readiness",
    owner: "Citrix IT",
    mitigation: "Provision access before August 31",
  },
];

export const SCHEDULE_INSIGHTS: ScheduleInsight[] = [
  { id: "i1", text: "The current schedule supports the December 15 go-live if commercial approval is completed by July 31." },
  { id: "i2", text: "Account and ARR validation is the most material near-term schedule risk." },
  { id: "i3", text: "UAT and operational acceptance form the final critical path to go-live." },
  { id: "i4", text: "Customer-owned activities represent approximately 30 percent of the scheduled program effort." },
  { id: "i5", text: "Delays in data and access readiness will directly affect build commencement." },
  { id: "i6", text: "The program currently remains On Track based on mock assumptions." },
];

export const CATEGORY_LEGEND: { category: ActivityCategory | "At Risk" | "Completed"; token: string }[] = [
  { category: "Planning", token: "planning" },
  { category: "Build", token: "build" },
  { category: "Testing", token: "testing" },
  { category: "Deployment", token: "deployment" },
  { category: "Customer Activity", token: "customer" },
  { category: "Commercial", token: "commercial" },
  { category: "Governance", token: "governance" },
  { category: "Readiness", token: "readiness" },
  { category: "At Risk", token: "risk" },
  { category: "Completed", token: "complete" },
];

export const CATEGORY_TOKEN: Record<ActivityCategory, string> = {
  Planning: "planning",
  Build: "build",
  Testing: "testing",
  Deployment: "deployment",
  "Customer Activity": "customer",
  Commercial: "commercial",
  Governance: "governance",
  Readiness: "readiness",
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_TOKEN) as ActivityCategory[];
export const ALL_STATUSES: ActivityStatus[] = ["Not Started", "In Progress", "At Risk", "Completed"];
export const ALL_OWNERS = Array.from(new Set(TIMELINE_ACTIVITIES.map((a) => a.owner))).sort();
