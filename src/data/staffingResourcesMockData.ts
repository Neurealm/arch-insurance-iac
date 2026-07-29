/**
 * Staffing & Resources — local mock data only.
 * No backend, no persistence. All edits live in React state and reset on refresh.
 */

export type ScenarioKey = "conservative" | "base" | "upside";
export type PhaseKey = "day0" | "day1" | "day2";
export type RoleStatus = "On Track" | "Attention Required" | "At Risk";
export type Severity = "High" | "Medium" | "Low";

export interface StaffingScenario {
  key: ScenarioKey;
  label: string;
  description: string;
  /** multiplier applied to demand/planned values */
  factor: number;
  coverageDelta: number;
}

export interface StaffingSummary {
  id: string;
  label: string;
  value: string;
  support: string;
  status: string;
  definition: string;
  calculation: string;
  relatedRoles: string[];
  relatedPhases: string[];
  capacityImplications: string;
  risks: string[];
  assumptions: string[];
}

export interface OperationalPhase {
  key: PhaseKey;
  title: string;
  subtitle: string;
  period: string;
  peakFtes: number;
  focus: string[];
  outcome: string;
}

export interface MonthlyStaffingDemand {
  month: string;
  short: string;
  delivery: number;
  runops: number;
  customerSuccess: number;
  support: number;
  phase: PhaseKey;
}

export interface FunctionalAllocation {
  key: string;
  name: string;
  ftes: number;
  pct: number;
  purpose: string;
  filled: number;
  openRoles: number;
  peakUtilization: number;
  criticalSkills: string[];
  phaseDemand: string;
  sharing: string;
  risks: string[];
}

export interface StaffingRole {
  id: string;
  role: string;
  functionKey: string;
  structure: string;
  day0: number;
  day1: number;
  day2: number;
  totalPlanned: number;
  filled: number;
  open: number;
  shared: number;
  contractor: number;
  utilization: number;
  status: RoleStatus;
  locationModel: string;
  resourceType: string;
  owner: string;
  skills: string[];
  startDate: string;
  endDate: string;
  dependencies: string[];
  risks: string[];
  notes: string;
}

export interface CriticalRole {
  id: string;
  name: string;
  status: "Filled" | "Open" | "Backfill Required";
  owner: string;
  dueDate: string;
  phase: PhaseKey;
  notes: string;
}

export interface ResourcePipelineItem {
  id: string;
  name: string;
  source: string;
  role: string;
  stage: string;
  expectedStart: string;
}

export interface OperatingStructure {
  id: string;
  name: string;
  purpose: string;
  exampleRoles: string[];
  model: string;
  peakAllocation: number;
  openRoles: number;
  utilization: number;
  phaseDemand: string;
}

export interface CapacityGap {
  id: string;
  area: string;
  demand: number;
  available: number;
  gap: number;
  severity: Severity;
  requiredBy: string;
  strategy: string;
  owner: string;
  status: string;
}

export interface ResourceRisk {
  id: string;
  title: string;
  severity: Severity;
  owner: string;
  impact: string;
  mitigation: string;
  status: string;
}

export interface ResourceHealthMetric {
  id: string;
  label: string;
  value: string;
  status: string;
  detail: string;
}

export interface StaffingActivity {
  id: string;
  at: string;
  message: string;
}

export interface StaffingFilterState {
  search: string;
  phases: PhaseKey[];
  functions: string[];
  structures: string[];
  statuses: RoleStatus[];
  resourceTypes: string[];
  locationModels: string[];
  utilizationMin: number;
  criticalOnly: boolean;
  openOnly: boolean;
  gapsOnly: boolean;
  atRiskOnly: boolean;
}

export const EMPTY_STAFFING_FILTERS: StaffingFilterState = {
  search: "",
  phases: [],
  functions: [],
  structures: [],
  statuses: [],
  resourceTypes: [],
  locationModels: [],
  utilizationMin: 0,
  criticalOnly: false,
  openOnly: false,
  gapsOnly: false,
  atRiskOnly: false,
};

export const STAFFING_META = {
  title: "Neurealm Staffing & Resources",
  subtitle:
    "Internal staffing plan and resource capacity to support Day 0, Day 1, and Day 2 operations",
  context: "Citrix Healthcare Operating Model Engagement",
  lastUpdated: "June 17, 2026 at 10:30 AM",
  userInitials: "NN",
};

export const RESOURCE_TYPES = [
  "Employee",
  "Contractor",
  "Shared CoE",
  "Internal Transfer",
  "New Hire",
  "Backfill",
];

export const LOCATION_MODELS = ["Onshore", "Nearshore", "Offshore", "Hybrid"];

export const PIPELINE_STAGES = [
  "Identified",
  "Screening",
  "Interviewing",
  "Offer",
  "Accepted",
  "Assigned",
  "Onboarding",
  "Ready",
];

export const SCENARIOS: StaffingScenario[] = [
  {
    key: "conservative",
    label: "Conservative",
    description: "Lower demand and slower staffing ramp",
    factor: 0.88,
    coverageDelta: 4,
  },
  { key: "base", label: "Base", description: "Expected staffing plan", factor: 1, coverageDelta: 0 },
  {
    key: "upside",
    label: "Upside",
    description: "Higher demand and accelerated activation",
    factor: 1.15,
    coverageDelta: -6,
  },
];

export const STAFFING_SUMMARY: StaffingSummary[] = [
  {
    id: "sum-peak-fte",
    label: "Total Planned FTEs, Peak",
    value: "48.5",
    support: "Across all operational phases",
    status: "Base Scenario",
    definition: "Highest simultaneous FTE demand across all functions in any single month.",
    calculation: "MAX(monthly sum of Delivery + RunOps & SRE + Customer Success + Support Functions)",
    relatedRoles: ["Solution Delivery", "RunOps and SRE", "Customer Success", "Support Functions"],
    relatedPhases: ["Day 1, Operate and Stabilize"],
    capacityImplications:
      "Peak simultaneous demand of 48.5 FTEs occurs in September 2026 and requires contractor and shared CoE coverage.",
    risks: ["Peak overlaps with delivery completion and early-life support"],
    assumptions: ["FTE values are illustrative planning assumptions"],
  },
  {
    id: "sum-coverage",
    label: "Resource Coverage",
    value: "93%",
    support: "Adequate coverage against forecast demand",
    status: "On Track",
    definition: "Available capacity expressed as a percentage of forecast demand.",
    calculation: "Filled FTEs / Total planned FTEs",
    relatedRoles: ["All functions"],
    relatedPhases: ["Day 0", "Day 1", "Day 2"],
    capacityImplications: "A 7% shortfall concentrates in SRE, automation, and support functions.",
    risks: ["Coverage falls below 90% under the Upside scenario"],
    assumptions: ["Shared CoE assignments count at 50% availability"],
  },
  {
    id: "sum-critical",
    label: "Critical Roles Filled",
    value: "42 of 45",
    support: "93% of critical roles filled",
    status: "Attention Required",
    definition: "Named coverage for roles designated critical to service continuity.",
    calculation: "Filled critical roles / Total critical roles",
    relatedRoles: ["SRE Lead", "Transition Lead", "Automation Lead"],
    relatedPhases: ["Day 0", "Day 1"],
    capacityImplications: "Three unfilled critical roles create single points of failure at go-live.",
    risks: ["SRE Lead unfilled before the Day 1 stabilization window"],
    assumptions: ["Interim coverage is not counted as filled"],
  },
  {
    id: "sum-open",
    label: "Open Positions",
    value: "3",
    support: "Backfill and recruitment in progress",
    status: "In Progress",
    definition: "Approved positions with no named resource assigned.",
    calculation: "SUM(open positions across critical roles)",
    relatedRoles: ["SRE Lead", "Transition Lead", "Automation Lead"],
    relatedPhases: ["Day 0", "Day 1", "Day 2"],
    capacityImplications: "Recruitment lead time of 8 to 10 weeks must start before July.",
    risks: ["Offer acceptance slippage delays onboarding into the peak window"],
    assumptions: ["Pipeline conversion of 60% assumed"],
  },
  {
    id: "sum-peak-window",
    label: "Peak Staffing Window",
    value: "August 16 to October 15, 2026",
    support: "Build, validation, and stabilization period",
    status: "Peak Demand",
    definition: "The continuous period where demand exceeds 90% of peak FTEs.",
    calculation: "Months where total demand >= 0.9 × peak demand",
    relatedRoles: ["Solution Delivery", "RunOps and SRE"],
    relatedPhases: ["Day 1, Operate and Stabilize"],
    capacityImplications: "Onboarding must be complete two weeks before August 16.",
    risks: ["Utilization exceeds sustainable threshold during the window"],
    assumptions: ["No vacation absorption modelled in the peak window"],
  },
];

export const OPERATIONAL_PHASES: OperationalPhase[] = [
  {
    key: "day0",
    title: "Day 0",
    subtitle: "Build and Transition",
    period: "June 2026 to August 15, 2026",
    peakFtes: 24.5,
    focus: [
      "Program mobilization",
      "Solution delivery",
      "Transition management",
      "Architecture",
      "Tooling",
      "Knowledge transfer",
      "Governance",
      "Initial RunOps onboarding",
    ],
    outcome: "Staffed and prepared to operate",
  },
  {
    key: "day1",
    title: "Day 1",
    subtitle: "Operate and Stabilize",
    period: "August 16 to November 15, 2026",
    peakFtes: 48.5,
    focus: [
      "Delivery completion",
      "RunOps",
      "SRE",
      "Service management",
      "Incident and problem management",
      "Monitoring",
      "Customer success",
      "Early-life support",
      "Operational stabilization",
    ],
    outcome: "Stable operational coverage",
  },
  {
    key: "day2",
    title: "Day 2",
    subtitle: "Optimize and Evolve",
    period: "November 16 to December 31, 2026",
    peakFtes: 32.0,
    focus: [
      "Service optimization",
      "Automation",
      "Reliability engineering",
      "Continual improvement",
      "Cost optimization",
      "Customer value realization",
      "Capacity planning",
      "Innovation roadmap",
    ],
    outcome: "Scaled continuous improvement",
  },
];

export const MONTHLY_DEMAND: MonthlyStaffingDemand[] = [
  { month: "June 2026", short: "Jun '26", delivery: 9.0, runops: 4.0, customerSuccess: 2.0, support: 3.5, phase: "day0" },
  { month: "July 2026", short: "Jul '26", delivery: 12.0, runops: 6.0, customerSuccess: 2.5, support: 4.0, phase: "day0" },
  { month: "August 2026", short: "Aug '26", delivery: 19.0, runops: 11.0, customerSuccess: 6.0, support: 7.0, phase: "day1" },
  { month: "September 2026", short: "Sep '26", delivery: 21.0, runops: 13.0, customerSuccess: 7.0, support: 7.5, phase: "day1" },
  { month: "October 2026", short: "Oct '26", delivery: 18.0, runops: 14.0, customerSuccess: 6.0, support: 6.0, phase: "day1" },
  { month: "November 2026", short: "Nov '26", delivery: 12.0, runops: 11.0, customerSuccess: 4.0, support: 5.0, phase: "day2" },
  { month: "December 2026", short: "Dec '26", delivery: 7.0, runops: 8.0, customerSuccess: 2.5, support: 3.0, phase: "day2" },
];

export const FUNCTION_KEYS = ["delivery", "runops", "customerSuccess", "support"] as const;

export const FUNCTIONAL_ALLOCATION: FunctionalAllocation[] = [
  {
    key: "delivery",
    name: "Delivery",
    ftes: 24.0,
    pct: 49,
    purpose: "Implementation, modernization, migration, and transition delivery for the engagement.",
    filled: 22.0,
    openRoles: 2,
    peakUtilization: 92,
    criticalSkills: ["Virtualization", "Migration engineering", "Test leadership"],
    phaseDemand: "Peaks in Day 1, declines through Day 2",
    sharing: "Mostly dedicated, phase-based",
    risks: ["Delivery completion overlaps early-life support"],
  },
  {
    key: "runops",
    name: "RunOps and SRE",
    ftes: 12.0,
    pct: 25,
    purpose: "Operational reliability, monitoring, incident, problem, and automation capability.",
    filled: 10.0,
    openRoles: 2,
    peakUtilization: 95,
    criticalSkills: ["SRE", "Observability", "Automation"],
    phaseDemand: "Grows through Day 1 and sustains into Day 2",
    sharing: "Shared and pooled CoE",
    risks: ["SRE Lead unfilled", "Peak utilization above threshold"],
  },
  {
    key: "customerSuccess",
    name: "Customer Success",
    ftes: 7.0,
    pct: 14,
    purpose: "Adoption, value realization, stakeholder engagement, and renewal readiness.",
    filled: 6.5,
    openRoles: 1,
    peakUtilization: 88,
    criticalSkills: ["Value realization", "Executive engagement"],
    phaseDemand: "Steps up at Day 1 and continues in Day 2",
    sharing: "Semi-dedicated account pods",
    risks: ["Coverage below peak demand"],
  },
  {
    key: "support",
    name: "Support Functions",
    ftes: 5.5,
    pct: 11,
    purpose: "Governance, finance, legal, security, enablement, and workforce management support.",
    filled: 4.0,
    openRoles: 1,
    peakUtilization: 78,
    criticalSkills: ["Commercial operations", "Security and compliance"],
    phaseDemand: "Flat across all phases",
    sharing: "On demand shared services",
    risks: ["Limited buffer for approval throughput"],
  },
];

export const RESOURCE_HEALTH: ResourceHealthMetric[] = [
  { id: "rh-1", label: "Capacity versus Demand", value: "93%", status: "Adequate Coverage", detail: "Filled capacity of 48.0 FTEs against planned demand of 54.5 FTEs." },
  { id: "rh-2", label: "Overallocated Resources", value: "2", status: "Requires Monitoring", detail: "Two named resources exceed the 95% sustainable utilization threshold." },
  { id: "rh-3", label: "Skill Coverage", value: "88%", status: "Good Coverage", detail: "Critical skills are covered except SRE leadership and automation engineering." },
  { id: "rh-4", label: "Attrition Risk", value: "Low", status: "Within Acceptable Range", detail: "No flagged attrition among critical-role holders in the next two quarters." },
  { id: "rh-5", label: "Contractor Dependency", value: "12%", status: "Acceptable", detail: "5.5 contractor FTEs of 48.0 filled FTEs." },
  { id: "rh-6", label: "Bench Availability", value: "4.5 FTEs", status: "Limited Buffer", detail: "Bench absorbs short absences only, not sustained peak demand." },
  { id: "rh-7", label: "Offshore Coverage", value: "68%", status: "On Track", detail: "Offshore delivery and RunOps coverage aligned to the operating model." },
  { id: "rh-8", label: "Onshore Leadership Coverage", value: "100%", status: "On Track", detail: "All onshore leadership positions are named except Transition Lead." },
];

export const STAFFING_ROLES: StaffingRole[] = [
  { id: "r-1", role: "Solution Delivery", functionKey: "delivery", structure: "Delivery Pods", day0: 8.5, day1: 18.0, day2: 10.0, totalPlanned: 22.0, filled: 20.0, open: 2, shared: 2.0, contractor: 3.0, utilization: 92, status: "On Track", locationModel: "Hybrid", resourceType: "Employee", owner: "Delivery Manager", skills: ["Migration", "Virtualization", "Test"], startDate: "June 1, 2026", endDate: "December 31, 2026", dependencies: ["Architecture CoE"], risks: ["Peak overlap with early-life support"], notes: "Phase-based pods scale down after stabilization." },
  { id: "r-2", role: "RunOps and SRE", functionKey: "runops", structure: "RunOps and SRE CoE", day0: 3.0, day1: 12.0, day2: 8.0, totalPlanned: 13.0, filled: 11.0, open: 2, shared: 2.0, contractor: 1.0, utilization: 95, status: "Attention Required", locationModel: "Offshore", resourceType: "Shared CoE", owner: "RunOps Lead", skills: ["SRE", "Observability", "Incident"], startDate: "June 15, 2026", endDate: "December 31, 2026", dependencies: ["Monitoring tooling"], risks: ["SRE Lead open", "Utilization above threshold"], notes: "Requires staggered onboarding before the peak window." },
  { id: "r-3", role: "Service Delivery Management", functionKey: "support", structure: "Service Management", day0: 2.0, day1: 6.0, day2: 4.0, totalPlanned: 7.0, filled: 7.0, open: 0, shared: 1.0, contractor: 0, utilization: 90, status: "On Track", locationModel: "Onshore", resourceType: "Employee", owner: "Service Delivery Manager", skills: ["ITIL", "Service reporting"], startDate: "June 1, 2026", endDate: "December 31, 2026", dependencies: ["Governance forums"], risks: [], notes: "Fully named across all phases." },
  { id: "r-4", role: "Customer Success", functionKey: "customerSuccess", structure: "Account Pods", day0: 1.5, day1: 7.0, day2: 6.0, totalPlanned: 7.5, filled: 6.5, open: 1, shared: 1.5, contractor: 0, utilization: 88, status: "Attention Required", locationModel: "Onshore", resourceType: "Employee", owner: "Customer Success Lead", skills: ["Adoption", "Value realization"], startDate: "July 1, 2026", endDate: "December 31, 2026", dependencies: ["Delivery milestones"], risks: ["Coverage below peak demand"], notes: "Pooled coverage planned during stabilization." },
  { id: "r-5", role: "Solution Architecture", functionKey: "delivery", structure: "Architecture CoE", day0: 2.0, day1: 3.0, day2: 1.5, totalPlanned: 3.5, filled: 3.5, open: 0, shared: 2.0, contractor: 0, utilization: 85, status: "On Track", locationModel: "Hybrid", resourceType: "Shared CoE", owner: "Solution Architect", skills: ["Architecture", "Security design"], startDate: "June 1, 2026", endDate: "November 30, 2026", dependencies: ["Security CoE"], risks: [], notes: "Shared across two engagements." },
  { id: "r-6", role: "Project and Program Management", functionKey: "support", structure: "PMO", day0: 1.5, day1: 4.0, day2: 2.0, totalPlanned: 4.0, filled: 4.0, open: 0, shared: 0.5, contractor: 0, utilization: 92, status: "On Track", locationModel: "Onshore", resourceType: "Employee", owner: "Program Director", skills: ["Program management", "Governance"], startDate: "June 1, 2026", endDate: "December 31, 2026", dependencies: [], risks: [], notes: "Includes governance secretariat effort." },
  { id: "r-7", role: "Support Functions", functionKey: "support", structure: "Shared Services", day0: 2.0, day1: 3.5, day2: 2.0, totalPlanned: 4.5, filled: 3.0, open: 1, shared: 2.5, contractor: 0.5, utilization: 78, status: "Attention Required", locationModel: "Nearshore", resourceType: "Shared CoE", owner: "PMO", skills: ["Enablement", "Workforce management"], startDate: "June 1, 2026", endDate: "December 31, 2026", dependencies: ["Corporate shared services"], risks: ["Limited buffer"], notes: "On demand model with service-level commitments pending." },
  { id: "r-8", role: "Security and Compliance", functionKey: "support", structure: "Security CoE", day0: 1.0, day1: 2.5, day2: 1.5, totalPlanned: 3.0, filled: 3.0, open: 0, shared: 2.0, contractor: 0, utilization: 82, status: "On Track", locationModel: "Hybrid", resourceType: "Shared CoE", owner: "Security Lead", skills: ["HIPAA", "Controls assurance"], startDate: "June 1, 2026", endDate: "December 31, 2026", dependencies: [], risks: [], notes: "Shared CoE assignment." },
  { id: "r-9", role: "Automation and AI Operations", functionKey: "runops", structure: "Automation and SRE CoE", day0: 0.5, day1: 2.5, day2: 4.0, totalPlanned: 4.5, filled: 3.0, open: 1, shared: 2.0, contractor: 1.0, utilization: 96, status: "At Risk", locationModel: "Offshore", resourceType: "Contractor", owner: "SRE Lead", skills: ["Automation", "AIOps", "Toil reduction"], startDate: "August 1, 2026", endDate: "December 31, 2026", dependencies: ["RunOps tooling"], risks: ["Capability below Day 2 requirement"], notes: "Contractor capacity required before peak demand." },
  { id: "r-10", role: "Finance, Legal and Commercial Operations", functionKey: "support", structure: "Corporate Shared Services", day0: 1.0, day1: 1.5, day2: 1.0, totalPlanned: 2.0, filled: 2.0, open: 0, shared: 2.0, contractor: 0, utilization: 75, status: "On Track", locationModel: "Onshore", resourceType: "Shared CoE", owner: "Commercial Operations", skills: ["Commercial", "Legal"], startDate: "June 1, 2026", endDate: "December 31, 2026", dependencies: [], risks: [], notes: "On demand support." },
];

export const ROLE_TOTALS = {
  day0: 18.5,
  day1: 48.5,
  day2: 32.0,
  totalPlanned: 54.5,
  filled: 48.0,
  open: 6,
  utilization: 93,
};

export const CRITICAL_ROLES: CriticalRole[] = [
  { id: "cr-1", name: "Program Director", status: "Filled", owner: "Delivery Executive", dueDate: "Filled", phase: "day0", notes: "Named and onboarded." },
  { id: "cr-2", name: "Delivery Manager", status: "Filled", owner: "Delivery Executive", dueDate: "Filled", phase: "day0", notes: "Named and onboarded." },
  { id: "cr-3", name: "RunOps Lead", status: "Filled", owner: "RunOps Executive", dueDate: "Filled", phase: "day1", notes: "Named and onboarded." },
  { id: "cr-4", name: "SRE Lead", status: "Open", owner: "RunOps Executive", dueDate: "August 15, 2026", phase: "day1", notes: "Required before the Day 1 stabilization window." },
  { id: "cr-5", name: "Solution Architect", status: "Filled", owner: "Architecture CoE", dueDate: "Filled", phase: "day0", notes: "Shared CoE assignment." },
  { id: "cr-6", name: "Customer Success Lead", status: "Filled", owner: "Customer Success Executive", dueDate: "Filled", phase: "day1", notes: "Named and onboarded." },
  { id: "cr-7", name: "Transition Lead", status: "Open", owner: "Delivery Executive", dueDate: "July 15, 2026", phase: "day0", notes: "Interim coverage under consideration." },
  { id: "cr-8", name: "Service Delivery Manager", status: "Filled", owner: "Service Management", dueDate: "Filled", phase: "day1", notes: "Named and onboarded." },
  { id: "cr-9", name: "Incident Manager", status: "Filled", owner: "RunOps Lead", dueDate: "Filled", phase: "day1", notes: "Named and onboarded." },
  { id: "cr-10", name: "Problem Manager", status: "Backfill Required", owner: "RunOps Lead", dueDate: "September 1, 2026", phase: "day1", notes: "Incumbent rotating off the engagement." },
  { id: "cr-11", name: "Change Manager", status: "Filled", owner: "Service Management", dueDate: "Filled", phase: "day1", notes: "Named and onboarded." },
  { id: "cr-12", name: "Automation Lead", status: "Open", owner: "SRE Lead", dueDate: "November 1, 2026", phase: "day2", notes: "Required for Day 2 optimization." },
];

export const PIPELINE_SUMMARY = [
  { id: "ps-1", label: "Backfills in Progress", value: 3, source: "Backfill" },
  { id: "ps-2", label: "Planned New Hires", value: 2, source: "New Hire" },
  { id: "ps-3", label: "Planned Contractors", value: 4, source: "Contractor" },
  { id: "ps-4", label: "Internal Transfers", value: 3, source: "Internal Transfer" },
  { id: "ps-5", label: "CoE Shared Assignments", value: 6, source: "Shared CoE" },
  { id: "ps-6", label: "Pending Approvals", value: 2, source: "Approval" },
];

export const PIPELINE_ITEMS: ResourcePipelineItem[] = [
  { id: "pi-1", name: "Candidate A", source: "New Hire", role: "SRE Lead", stage: "Interviewing", expectedStart: "August 1, 2026" },
  { id: "pi-2", name: "Candidate B", source: "Contractor", role: "Automation Engineer", stage: "Offer", expectedStart: "September 1, 2026" },
  { id: "pi-3", name: "Candidate C", source: "Internal Transfer", role: "Transition Lead", stage: "Accepted", expectedStart: "July 10, 2026" },
  { id: "pi-4", name: "Candidate D", source: "Backfill", role: "Problem Manager", stage: "Screening", expectedStart: "September 1, 2026" },
  { id: "pi-5", name: "Candidate E", source: "Shared CoE", role: "Support Analyst", stage: "Assigned", expectedStart: "July 1, 2026" },
  { id: "pi-6", name: "Candidate F", source: "Contractor", role: "Migration Engineer", stage: "Onboarding", expectedStart: "June 30, 2026" },
];

export const OPERATING_STRUCTURES: OperatingStructure[] = [
  {
    id: "os-1",
    name: "Account Pods",
    purpose: "Dedicated cross-functional teams supporting strategic customer accounts",
    exampleRoles: ["Account Executive", "Customer Success Manager", "Service Delivery Manager", "Solution Architect", "Delivery Lead"],
    model: "Dedicated and semi-dedicated",
    peakAllocation: 12.0,
    openRoles: 1,
    utilization: 88,
    phaseDemand: "Steps up at Day 1, sustains in Day 2",
  },
  {
    id: "os-2",
    name: "Delivery Pods",
    purpose: "Project and transformation teams delivering implementation, modernization, and transition",
    exampleRoles: ["Project Manager", "Technical Lead", "Engineers", "Migration Specialists", "Test Lead"],
    model: "Phase-based",
    peakAllocation: 18.0,
    openRoles: 2,
    utilization: 92,
    phaseDemand: "Peaks in Day 1, declines through Day 2",
  },
  {
    id: "os-3",
    name: "RunOps and SRE CoE",
    purpose: "Shared operational, reliability, automation, monitoring, and support capabilities",
    exampleRoles: ["RunOps Lead", "SRE Lead", "Incident Manager", "Problem Manager", "Automation Engineers", "Monitoring Engineers"],
    model: "Shared and pooled",
    peakAllocation: 12.0,
    openRoles: 3,
    utilization: 95,
    phaseDemand: "Grows through Day 1 and sustains into Day 2",
  },
  {
    id: "os-4",
    name: "Enterprise Shared Services",
    purpose: "Specialist support across governance, finance, legal, security, commercial operations, and enablement",
    exampleRoles: ["Finance", "Legal", "Commercial Operations", "Security", "Learning and Enablement", "Workforce Management"],
    model: "On demand",
    peakAllocation: 6.5,
    openRoles: 1,
    utilization: 78,
    phaseDemand: "Flat across all phases",
  },
];

export const CAPACITY_GAPS: CapacityGap[] = [
  { id: "cg-1", area: "SRE Leadership", demand: 1.0, available: 0, gap: 1.0, severity: "High", requiredBy: "August 15, 2026", strategy: "External hire with interim CoE cover", owner: "RunOps Executive", status: "Open" },
  { id: "cg-2", area: "Automation Engineering", demand: 4.0, available: 3.0, gap: 1.0, severity: "High", requiredBy: "November 1, 2026", strategy: "Contractor capacity plus CoE support", owner: "SRE Lead", status: "Open" },
  { id: "cg-3", area: "Customer Success", demand: 7.0, available: 6.5, gap: 0.5, severity: "Medium", requiredBy: "August 16, 2026", strategy: "Pooled coverage during stabilization", owner: "Customer Success Lead", status: "Monitoring" },
  { id: "cg-4", area: "Support Functions", demand: 4.5, available: 3.0, gap: 1.5, severity: "Medium", requiredBy: "July 31, 2026", strategy: "Shared services service-level commitment", owner: "PMO", status: "Open" },
  { id: "cg-5", area: "Transition Leadership", demand: 1.0, available: 0, gap: 1.0, severity: "High", requiredBy: "July 15, 2026", strategy: "Internal transfer with accelerated recruitment", owner: "Delivery Executive", status: "Open" },
  { id: "cg-6", area: "Solution Delivery", demand: 22.0, available: 20.0, gap: 2.0, severity: "Medium", requiredBy: "August 16, 2026", strategy: "Contractor augmentation for migration workstream", owner: "Delivery Manager", status: "Monitoring" },
];

export const RESOURCE_RISKS: ResourceRisk[] = [
  { id: "rr-1", title: "Peak-period utilization exceeds sustainable threshold for RunOps and SRE", severity: "High", owner: "RunOps Lead", impact: "Service instability and burnout risk", mitigation: "Add shared SRE coverage and stagger onboarding", status: "Open" },
  { id: "rr-2", title: "Transition Lead position is not filled", severity: "High", owner: "Delivery Executive", impact: "Day 0 coordination and readiness may be delayed", mitigation: "Assign interim lead and accelerate recruitment", status: "Open" },
  { id: "rr-3", title: "Automation capability is below Day 2 requirement", severity: "High", owner: "SRE Lead", impact: "Higher manual effort and lower operating leverage", mitigation: "Add contractor capacity and CoE support", status: "Open" },
  { id: "rr-4", title: "Customer Success coverage is below peak demand", severity: "Medium", owner: "Customer Success Lead", impact: "Reduced stakeholder engagement and renewal readiness", mitigation: "Use pooled coverage during stabilization", status: "Monitoring" },
  { id: "rr-5", title: "Shared support functions have limited buffer", severity: "Medium", owner: "PMO", impact: "Decision and approval delays", mitigation: "Establish service-level commitments for shared functions", status: "Monitoring" },
];

export const EXECUTIVE_ATTENTION: string[] = [
  "SRE Lead remains open before the Day 1 stabilization window.",
  "Transition Lead coverage is required before July 15.",
  "Automation Engineering has a projected Day 2 capacity gap.",
  "Two resources exceed the preferred utilization threshold.",
  "Support Functions have limited staffing buffer.",
  "Contractor onboarding must begin before peak demand.",
];

export const EXECUTIVE_STAFFING_UPDATE =
  "Staffing coverage is currently 93% against the Base Scenario. Overall capacity is adequate, but leadership action is required for SRE leadership, transition management, automation engineering, and support-function coverage. Peak staffing demand occurs between August 16 and October 15, when simultaneous delivery, RunOps, stabilization, and customer-success activities require approximately 48.5 FTEs.";

export const FUNCTION_LABELS: Record<string, string> = {
  delivery: "Delivery",
  runops: "RunOps and SRE",
  customerSuccess: "Customer Success",
  support: "Support Functions",
};

export function scenarioFactor(key: ScenarioKey): number {
  return SCENARIOS.find((s) => s.key === key)?.factor ?? 1;
}

/** Round to one decimal for display of scenario-adjusted FTE values. */
export function fte(value: number): number {
  return Math.round(value * 10) / 10;
}
