import type { CommercialGuideContent } from "../../types";

/**
 * Page-specific Commercial Guide content — Overview (`/commercial`).
 *
 * Authored against the sections that actually render in
 * `src/commercial/pages/CommercialOverview.tsx`. Sections that do not exist on
 * the page (scenario selector, revenue/EBITDA/cash summary cards, activation
 * status, staffing readiness, risk register, last-updated metadata) are NOT
 * described here; they are recorded as known gaps in `dataQuality.knownGaps`.
 */
export const commercialOverviewGuide: CommercialGuideContent = {
  pageId: "commercial-overview",
  route: "/commercial",
  match: "exact",
  pageTitle: "Overview",
  guideTitle: "Overview — Consolidated Commercial View",
  audiences: ["Executive", "Commercial Lead", "Finance", "Delivery", "Operations", "Administrator"],
  modes: ["executive", "practitioner", "administrator"],
  estimatedReadingMinutes: 9,
  trainingLevel: "Foundation",
  lastUpdated: "2026-07-29",

  /* ---------------- Overview ---------------- */
  purpose:
    "Overview is the consolidated executive view of the Commercial Digital Twin. It brings the workspace, program, operating gate, aggregate metrics, baseline scenario, source validation and data readiness onto one screen so an executive can judge commercial position and decide where to go next. It is a review and navigation surface, not the place to edit detailed model inputs.",
  represents:
    "A read-only roll-up of the program record, gate progression, four aggregate program metrics, the baseline scenario and its comparators, the registered confidential sources, the account-data readiness checklist, and the recommended next actions for the deal team.",
  whyItMatters:
    "Executives rarely have time to reconcile revenue, P&L, cash, comparison and release pages individually. Overview gives one credible position statement with explicit gate, scenario and confidence context, so review meetings start from a shared picture and escalate only the genuine exceptions. A summary is only credible when the detailed pages behind it are current — Overview shows the confidence and readiness signals needed to test that.",
  moduleConnection:
    "Overview sits at the top of the Commercial Module. Program, Scenarios, Portfolio and Sources supply its context; the Model pages (Revenue, P&L, Cash, Comparison, Sensitivity, Release) supply the economics that the deal team interprets alongside it; Governance, Timelines and Staffing & Resources supply operating readiness. Overview publishes nothing of its own — every value shown is owned by an upstream page, and every exception must be resolved on that authoritative page.",
  questionsAnswered: [
    "What is the current commercial outlook for this program?",
    "Which workspace, program, gate, scenario and model context am I reviewing?",
    "Is the deal economically viable on the current baseline?",
    "Where are the material risks or data gaps?",
    "Which decisions require executive attention?",
    "Which detailed page should be reviewed next?",
  ],
  expectedOutcome:
    "A stated executive position on the program: the current gate, the baseline scenario in force, the aggregate economics and their confidence, the outstanding data gaps, and an agreed next action — either an approval, a redirect to a detailed page, or an escalation.",
  lifecycleStages: [
    "Commercial Structuring",
    "Financial Modeling",
    "Executive Review",
    "Negotiation",
    "Delivery Planning",
    "Operations",
    "Continuous Improvement",
  ],
  prerequisites: [
    { id: "pre-scenario", label: "A selected and valid baseline scenario", route: "/commercial/scenarios", detail: "Scenarios must be seeded and one flagged as baseline." },
    { id: "pre-portfolio", label: "Current portfolio data", route: "/commercial/portfolio", detail: "Account population and readiness reviewed." },
    { id: "pre-assumptions", label: "Current assumptions", route: "/commercial/model/assumptions", detail: "No unapplied change set that would move the headline numbers." },
    { id: "pre-run", label: "A completed model run where required", route: "/commercial/model/revenue", detail: "Runs must not be stale or superseded." },
    { id: "pre-financials", label: "Current revenue, cost, EBITDA and cash outputs", route: "/commercial/model/cash" },
    { id: "pre-activation", label: "Current activation plan and model version in force", route: "/commercial/model/release" },
    { id: "pre-staffing", label: "Current staffing plan", route: "/commercial/staffing-resources" },
    { id: "pre-risks", label: "Current risks and open decisions", route: "/commercial/neurealm-governance" },
    { id: "pre-sources", label: "Source and confidence information", route: "/commercial/sources", detail: "SRC references registered with status and confidentiality." },
  ],
  ownership: {
    businessOwner: "Deal Lead",
    commercialOwner: "Commercial Lead",
    technicalOwner: "Finance Lead (financial owner of the summarised outputs)",
    executiveApprover: "Executive Sponsor",
    primaryUsers: ["Deal team", "Governance leaders", "Program Director", "Delivery Executive"],
    consumersOfOutput: [
      "Executive steering committee",
      "Finance",
      "Delivery",
      "Staffing",
      "Customer leadership",
    ],
  },

  /* ---------------- How it works ---------------- */
  sections: [
    {
      id: "sec-page-context",
      title: "Directional banner (page context)",
      targetId: "overview-page-context",
      explanation:
        "Represents the standing caveat that the module presents directional, source-referenced modelling rather than contracted commitments. Read it as the confidence frame for everything below. Verify you are not about to quote a figure as a commitment. Supports the decision on whether an output may leave the room as guidance or as a binding number.",
    },
    {
      id: "sec-workspace",
      title: "Workspace card",
      targetId: "overview-workspace-context",
      explanation:
        "Represents the tenant you are operating in: name, slug, status and (for platform admins) an admin badge. Read it first — every figure on the page is scoped to this workspace. Verify the workspace matches the deal under review before interpreting anything. Supports the decision to proceed or switch workspace.",
    },
    {
      id: "sec-program",
      title: "Program card",
      targetId: "overview-program-context",
      explanation:
        "Represents the program record: name, partner, market segment, status, current gate code and source status, with a link into the Program workspace and the contextual audio summary. Read the badges as the authoritative program context. Verify the current gate and source status are the ones being reviewed. Supports gate and structuring decisions.",
    },
    {
      id: "sec-current-gate",
      title: "Current Gate card",
      targetId: "overview-current-gate",
      explanation:
        "Represents the active operating gate: code, name, status, account scope, operating objective and economic objective. Read it as the mandate the program is currently working to. Verify the objectives still match what the deal team is executing. Supports gate-approval and scope decisions.",
    },
    {
      id: "sec-gate-progression",
      title: "Gate progression",
      targetId: "overview-gate-progression",
      explanation:
        "Represents the ordered gate sequence with passed, active and pending states shown by both icon and label. Read left to right to see where the program stands and what remains. Verify the active gate matches the Program card. Supports sequencing and governance-agenda decisions.",
    },
    {
      id: "sec-summary-metrics",
      title: "Aggregate program metrics",
      targetId: "overview-summary-metrics",
      explanation:
        "Represents the headline program metrics with their unit formatting and a confidence label under each value. Read the value and the confidence together — never the value alone. Verify each metric's confidence is adequate for the decision being taken. Supports the viability judgement and the choice of which model page to open next.",
    },
    {
      id: "sec-baseline-scenario",
      title: "Baseline scenario card",
      targetId: "overview-scenario-context",
      explanation:
        "Represents the scenario flagged as baseline: name, description, code and source status. Read it as the scenario context for every figure on the page. Verify the baseline is the scenario the executive intends to review. Supports negotiation positioning and the decision to re-baseline.",
    },
    {
      id: "sec-scenario-comparison",
      title: "Scenario comparison card",
      targetId: "overview-scenario-comparison",
      explanation:
        "Represents each scenario with its assumption count and a Baseline badge, plus a link to Scenarios. Read it as coverage, not as economics — it counts assumptions, it does not compare outputs. Verify every scenario carries a complete assumption set. Supports the decision to open Scenarios or Scenario Comparison for a real variance review.",
    },
    {
      id: "sec-source-validation",
      title: "Source validation",
      targetId: "overview-source-validation",
      explanation:
        "Represents the count of registered confidential sources and each source's code, title and status, with a link to the source register. Read it as evidence provenance; only metadata is held, never raw content. Verify no source underpinning a headline figure is unvalidated. Supports the decision on whether the position is defensible.",
    },
    {
      id: "sec-data-readiness",
      title: "Data readiness",
      targetId: "overview-data-status",
      explanation:
        "Represents the account-data checklist with Known and Pending states shown by icon and badge. Read Pending items as the boundary of what the model can currently substantiate. Verify no Pending item is material to the decision at hand. Supports the decision to approve now or hold pending validation.",
    },
    {
      id: "sec-next-actions",
      title: "Recommended next actions",
      targetId: "overview-next-actions",
      explanation:
        "Represents the ordered list of recommended actions, each either linked to its owning page or marked deferred. Read it as the deal team's queue, not as a commitment plan. Verify ownership and sequencing before the meeting closes. Supports decision prioritisation and the assignment of follow-ups.",
    },
  ],
  inputs: [
    { id: "in-workspace", label: "Active workspace (tenant)", description: "Source page: Platform workspace selector. Business owner: Deal Lead. Approval owner: Platform Admin. Data type: reference. Confidence: definitive. Effect of change: re-scopes every figure on the page.", owner: "Deal Lead", source: "Platform / workspace selector", required: true },
    { id: "in-program", label: "Program record and current gate", description: "Source page: Program. Business owner: Program Director. Approval owner: Executive Sponsor. Data type: status. Confidence: governed. Effect of change: changes the mandate and the gate-approval question.", owner: "Program Director", source: "/commercial/program", required: true },
    { id: "in-scenario", label: "Active (baseline) scenario", description: "Source page: Scenarios. Business owner: Commercial Lead. Approval owner: Deal Lead. Data type: selection. Confidence: directional until validated. Effect of change: changes every downstream economic figure.", owner: "Commercial Lead", source: "/commercial/scenarios", required: true },
    { id: "in-version", label: "Active model / release version", description: "Source page: Release & Activation. Business owner: Finance Lead. Approval owner: Executive Sponsor. Data type: version reference. Confidence: certified or draft. Effect of change: invalidates comparisons made against the prior version.", owner: "Finance Lead", source: "/commercial/model/release" },
    { id: "in-portfolio", label: "Portfolio scope", description: "Source page: Portfolio. Business owner: Commercial Lead. Approval owner: Deal Lead. Data type: population. Confidence: aggregate only until accounts are imported. Effect of change: moves volume, revenue and staffing.", owner: "Commercial Lead", source: "/commercial/portfolio" },
    { id: "in-revenue", label: "Revenue outputs", description: "Source page: Revenue. Business owner: Commercial Lead. Approval owner: Finance Lead. Data type: calculated. Confidence: run-dependent. Effect of change: moves EBITDA and cash.", owner: "Commercial Lead", source: "/commercial/model/revenue" },
    { id: "in-cost", label: "Cost and EBITDA outputs", description: "Source page: P&L (Cost & EBITDA). Business owner: Finance Lead. Approval owner: Executive Sponsor. Data type: calculated. Confidence: run-dependent. Effect of change: moves margin and the viability conclusion.", owner: "Finance Lead", source: "/commercial/model/pnl" },
    { id: "in-cash", label: "Cash outputs", description: "Source page: Cash & Sustainability. Business owner: Finance Lead. Approval owner: Executive Sponsor. Data type: calculated. Confidence: run-dependent. Effect of change: moves funding requirement, break-even and payback.", owner: "Finance Lead", source: "/commercial/model/cash" },
    { id: "in-activation", label: "Activation status", description: "Source page: Release & Activation. Business owner: Program Director. Approval owner: Executive Sponsor. Data type: lifecycle state. Confidence: certified or not. Effect of change: determines whether results may be quoted as authoritative.", owner: "Program Director", source: "/commercial/model/release" },
    { id: "in-staffing", label: "Staffing readiness", description: "Source page: Staffing & Resources. Business owner: Staffing Lead. Approval owner: Delivery Executive. Data type: plan. Confidence: illustrative prototype. Effect of change: moves cost, capacity and timeline feasibility.", owner: "Staffing Lead", source: "/commercial/staffing-resources" },
    { id: "in-risks", label: "Risks and open decisions", description: "Source page: Governance. Business owner: Governance Lead. Approval owner: Executive Sponsor. Data type: register. Confidence: as maintained. Effect of change: can override an otherwise positive summary.", owner: "Governance Lead", source: "/commercial/neurealm-governance" },
    { id: "in-quality", label: "Data-quality and source status", description: "Source pages: Sources and the Data readiness checklist. Business owner: Commercial Lead. Approval owner: Deal Lead. Data type: status. Confidence: explicit Known/Pending. Effect of change: raises or lowers the confidence attached to every conclusion.", owner: "Commercial Lead", source: "/commercial/sources" },
  ],
  outputs: [
    { id: "out-summary", label: "Executive commercial summary", description: "A single consolidated statement of workspace, program, gate, baseline scenario and aggregate metrics.", consumedBy: ["Executive steering committee"] },
    { id: "out-health", label: "Current deal-health assessment", description: "A judgement on economics, confidence and readiness taken together.", consumedBy: ["Executive Sponsor", "Finance"] },
    { id: "out-risks", label: "Priority risks", description: "The Pending readiness items and unvalidated sources that constrain the current position.", consumedBy: ["Governance Lead"] },
    { id: "out-decisions", label: "Priority decisions", description: "The decisions the executive must take or defer at this gate.", consumedBy: ["Executive steering committee"] },
    { id: "out-deep-dives", label: "Recommended deep dives", description: "The specific detailed pages to open for each exception raised.", consumedBy: ["Deal team"] },
    { id: "out-readiness", label: "Readiness for executive review", description: "Whether the position is complete enough to be reviewed or must be held.", consumedBy: ["Program Director"] },
    { id: "out-narrative", label: "Executive narrative", description: "The wording used to present the deal position, including its confidence qualifier.", consumedBy: ["Customer leadership", "Executive steering committee"] },
  ],
  businessRules: [
    { id: "rule-summary", rule: "Overview is a summary, not the authoritative editing surface.", explanation: "Detailed assumptions are edited on Scenarios and governed through Assumptions & Change Sets. Nothing on Overview writes to the model." },
    { id: "rule-context", rule: "Every displayed result retains scenario and model-version context.", explanation: "A number quoted without its baseline scenario and model version is not usable evidence." },
    { id: "rule-no-mixing", rule: "Metrics from different scenarios or model versions must not be combined.", explanation: "Mixing produces an arithmetically valid but commercially meaningless position." },
    { id: "rule-gaps", rule: "A positive summary does not override a critical data gap or unapproved assumption.", explanation: "Pending readiness items and unvalidated sources cap the confidence of any conclusion drawn." },
    { id: "rule-holistic", rule: "Financial health must be interpreted alongside cash, capacity, timing and risk.", explanation: "Margin alone can look healthy while the funding profile, staffing capacity or gate timing makes the deal undeliverable." },
    { id: "rule-warnings", rule: "Warning indicators direct the user to the authoritative detailed page.", explanation: "Overview identifies exceptions; it never resolves them. Resolution happens on the owning page." },
    { id: "rule-confidence", rule: "Executive conclusions must state both the result and its confidence level.", explanation: "Each metric carries a confidence label; the narrative must carry it too." },
  ],
  calculationLogic: [
    "Overview performs no financial calculation of its own — it reads and formats records already produced elsewhere.",
    "Program, gates, metrics and sources are read together from the Project Momentous program record.",
    "The baseline scenario is resolved as the single scenario flagged is_baseline; if none is flagged, the card reports no baseline.",
    "The current gate is resolved by matching the program's current_gate_code, falling back to the first gate in sequence.",
    "The scenario comparison list counts assumptions per scenario; it does not compute economic variance.",
    "Metric values are formatted by unit — USD values are abbreviated to millions above $1M; all other units render with their unit suffix.",
    "The data readiness checklist is a fixed authored list of Known and Pending items, not a computed score.",
  ],
  relationship: {
    receivesFrom: [
      "Program",
      "Portfolio",
      "Sources",
      "Assumptions & Change Sets",
      "Scenarios",
      "Revenue",
      "P&L (Cost & EBITDA)",
      "Cash & Sustainability",
      "Scenario Comparison",
      "Sensitivity Analysis",
      "Release & Activation",
      "Governance",
      "Timelines",
      "Staffing & Resources",
    ],
    models: [
      "Consolidated commercial status",
      "Active scenario and version context",
      "Financial summary",
      "Operational readiness summary",
      "Risk and decision summary",
      "Priority attention items",
    ],
    feeds: [
      "Executive review",
      "Governance agendas",
      "Decision prioritisation",
      "Negotiation strategy",
      "Deep-dive navigation",
      "Gate decisions",
    ],
  },
  downstreamImpacts: [
    { area: "Governance", effect: "Sets the executive agenda and the list of decisions tabled at the gate." },
    { area: "Revenue", effect: "Directs attention to Revenue when volume or activation assumptions look unsupported." },
    { area: "EBITDA", effect: "Frames the viability conclusion carried into executive review." },
    { area: "Cash", effect: "Prompts the funding conversation when economics are positive but cash is stressed." },
    { area: "Staffing", effect: "Triggers a capacity check when scope or activation moves." },
    { area: "Activation", effect: "Determines whether the position may be quoted as authoritative or only as directional." },
    { area: "Risk", effect: "Elevates Pending readiness items and unvalidated sources into the risk register." },
    { area: "Customer outcomes", effect: "Shapes the narrative presented to customer leadership." },
  ],
  dataQuality: {
    dataSources: [
      "Program record, stage gates and program metrics (Project Momentous)",
      "Scenarios and scenario assumptions",
      "Source references register (SRC-001…SRC-006, metadata only)",
      "Workspace / tenant membership context",
      "Authored data-readiness checklist held in the page component",
      "Authored recommended-next-actions list held in the page component",
    ],
    updateFrequency:
      "Program, scenario and source data refresh on load from the Commercial tables. The readiness checklist and next-actions list are authored content and change only when the page is edited.",
    knownGaps: [
      "No scenario or model-version selector on Overview — scenario context comes from the baseline flag only.",
      "No revenue, cost, EBITDA or cash summary cards — those outputs live only on the Model pages.",
      "No cash or sustainability indicator on Overview.",
      "No activation or release status tile on Overview.",
      "No staffing or capacity readiness tile on Overview.",
      "No risk or attention indicator and no risk register roll-up on Overview.",
      "No recent-changes feed and no last-updated timestamp shown on Overview.",
      "Account-level ARR, renewal dates, product mix and partner status remain Pending validation.",
    ],
    changeControl:
      "Overview is read-only. Program and gate changes are governed on Program; assumption changes are governed through change sets on Assumptions & Change Sets; model versions are governed on Release & Activation.",
    lineage:
      "Every figure on Overview is traceable to an owning Commercial table and its source references; Overview stores nothing of its own.",
  },
  modelConfidence: "Medium",
  confidenceBasis: ["Account data", "Commercial terms", "Revenue assumptions", "Source completeness", "Governance approvals"],
  confidenceGuidance:
    "Treat Overview as directional. Aggregate program figures and the no-partner aggregate model are known; account-level ARR, renewal dates, product mix and partner status are still pending validation. Quote figures with their confidence label, and raise confidence only by validating the underlying sources and importing account records.",
  commercialReadiness: "Review Required",
  readinessCriteria: [
    "Baseline scenario present and explicitly named in the narrative.",
    "Current gate matches the mandate being reviewed.",
    "All registered sources validated for any figure being quoted.",
    "No Pending readiness item material to the decision at hand.",
    "Model runs behind any quoted economics are current, not stale or superseded.",
  ],

  /* ---------------- How to use it ---------------- */
  workflow: [
    { id: "wf-1", step: 1, title: "Confirm scenario and model version", description: "Check the Baseline scenario card, then confirm the model version in force on Release & Activation.", role: "Commercial Lead" },
    { id: "wf-2", step: 2, title: "Confirm the data currency", description: "Review source statuses and the Data readiness checklist to establish how current the underlying data is.", role: "Commercial Lead" },
    { id: "wf-3", step: 3, title: "Review the aggregate metrics", description: "Read each headline metric together with its confidence label.", role: "Finance Lead" },
    { id: "wf-4", step: 4, title: "Review cash and sustainability", description: "Overview does not show cash — open Cash & Sustainability to complete the financial picture.", role: "Finance Lead" },
    { id: "wf-5", step: 5, title: "Review portfolio and activation status", description: "Open Portfolio for account substantiation and Release & Activation for the version in force.", role: "Commercial Lead" },
    { id: "wf-6", step: 6, title: "Review staffing and operational readiness", description: "Open Staffing & Resources and Timelines to test capacity and sequencing against the gate.", role: "Delivery Executive" },
    { id: "wf-7", step: 7, title: "Review risks, decisions and data gaps", description: "Combine the Pending readiness items with the Governance register to list what is open.", role: "Governance Lead" },
    { id: "wf-8", step: 8, title: "Open the detailed page for every exception", description: "Resolve each exception on its authoritative page; never adjust the narrative to fit the summary.", role: "Deal Lead" },
    { id: "wf-9", step: 9, title: "Prepare the executive takeaway", description: "State the position, the scenario and version it rests on, and its confidence level.", role: "Deal Lead" },
    { id: "wf-10", step: 10, title: "Record or escalate the decision", description: "Log the approval, redirect or escalation and assign the follow-up owner.", role: "Executive Sponsor" },
  ],
  actionsAvailable: [
    "Play the workspace introduction and the contextual audio deal summary.",
    "Seed Project Momentous when no program is provisioned.",
    "Open the Program workspace from the Program card.",
    "Open Scenarios from the Scenario comparison card.",
    "Open the source register from Source validation.",
    "Follow a linked recommended next action (Portfolio, Scenarios, Platform members).",
    "Open the Commercial Guide, run the page walkthrough, and use Show on Page.",
  ],
  teamActivities: [
    { id: "act-deal", activity: "Confirm the overall commercial narrative and its confidence qualifier", role: "Deal Lead", cadence: "Every executive review" },
    { id: "act-commercial", activity: "Confirm commercial terms and the baseline scenario in force", role: "Commercial Lead", cadence: "Every review cycle" },
    { id: "act-finance", activity: "Reconcile summary values to the detailed Revenue, P&L and Cash outputs", role: "Finance Lead", cadence: "Before each executive review" },
    { id: "act-pmo", activity: "Confirm program status, current gate and gate progression", role: "PMO / Program Director", cadence: "Weekly" },
    { id: "act-staffing", activity: "Confirm capacity status against the modelled scope", role: "Staffing Lead", cadence: "Each planning cycle" },
    { id: "act-governance", activity: "Confirm open risks, data gaps and pending decisions", role: "Governance Lead", cadence: "Each governance meeting" },
    { id: "act-exec", activity: "Approve the position or redirect the next action", role: "Executive Sponsor", cadence: "At each gate" },
  ],
  roles: [
    { role: "Executive Sponsor", responsibility: "Approves the executive position or redirects the deal team." },
    { role: "Deal Lead", responsibility: "Owns the consolidated narrative and the decision log." },
    { role: "Commercial Lead", responsibility: "Owns scenario and commercial-term context." },
    { role: "Finance Lead", responsibility: "Owns reconciliation of summary values to detailed financial outputs." },
    { role: "Program Director / PMO", responsibility: "Owns program status and gate progression." },
    { role: "Delivery Executive", responsibility: "Owns delivery feasibility and operational readiness." },
    { role: "Staffing Lead", responsibility: "Owns capacity readiness against modelled scope." },
    { role: "Governance Lead", responsibility: "Owns the risk and decision register." },
  ],
  raci: [
    { activity: "Review the active scenario", assignments: [{ role: "Commercial Lead", raci: "R" }, { role: "Deal Lead", raci: "A" }, { role: "Finance Lead", raci: "C" }, { role: "Executive Sponsor", raci: "I" }] },
    { activity: "Confirm financial outputs", assignments: [{ role: "Finance Lead", raci: "R" }, { role: "Deal Lead", raci: "A" }, { role: "Commercial Lead", raci: "C" }, { role: "Executive Sponsor", raci: "I" }] },
    { activity: "Confirm operational readiness", assignments: [{ role: "Delivery Executive", raci: "R" }, { role: "Program Director", raci: "A" }, { role: "Staffing Lead", raci: "C" }, { role: "Deal Lead", raci: "I" }] },
    { activity: "Confirm risks and data gaps", assignments: [{ role: "Governance Lead", raci: "R" }, { role: "Deal Lead", raci: "A" }, { role: "Commercial Lead", raci: "C" }, { role: "Executive Sponsor", raci: "I" }] },
    { activity: "Prepare the executive recommendation", assignments: [{ role: "Deal Lead", raci: "R" }, { role: "Executive Sponsor", raci: "A" }, { role: "Finance Lead", raci: "C" }, { role: "Program Director", raci: "I" }] },
    { activity: "Approve the executive position", assignments: [{ role: "Executive Sponsor", raci: "R" }, { role: "Executive Sponsor", raci: "A" }, { role: "Governance Lead", raci: "C" }, { role: "Deal team", raci: "I" }] },
  ],
  reviewRequirements: [
    "Finance reconciles every quoted figure to its detailed page before the review.",
    "Commercial confirms the baseline scenario is the one intended for review.",
    "PMO confirms the current gate and gate progression.",
    "Governance confirms the open risks and data gaps listed against the position.",
  ],
  approvalRequirements: [
    "Executive Sponsor approves the stated executive position at each gate.",
    "Any binding external number must rest on validated sources and a certified, activated model version.",
    "Assumption changes behind a revised position must be applied through a governed change set before approval.",
  ],
  decisions: [
    { id: "dec-gate", decision: "Proceed through, hold at, or return from the current operating gate", decidedBy: "Executive Sponsor", evidence: "Current Gate card, Gate progression, Governance register" },
    { id: "dec-viability", decision: "Accept the current economic position as viable", decidedBy: "Executive Sponsor", evidence: "Aggregate metrics with confidence labels, Revenue / P&L / Cash pages" },
    { id: "dec-baseline", decision: "Re-baseline to a different scenario", decidedBy: "Deal Lead", evidence: "Baseline scenario card, Scenario Comparison" },
    { id: "dec-validate", decision: "Hold the decision pending source or account validation", decidedBy: "Deal Lead", evidence: "Source validation, Data readiness" },
    { id: "dec-escalate", decision: "Escalate a capacity, cash or timing constraint", decidedBy: "Program Director", evidence: "Staffing & Resources, Cash & Sustainability, Timelines" },
  ],
  whatToDoNext: [
    "Open Cash & Sustainability to complete the financial picture, which Overview does not show.",
    "Open Portfolio to progress account-level validation for the Pending readiness items.",
    "Open Sources to close out any unvalidated source reference.",
    "Open Scenario Comparison when the scenario list raises a genuine variance question.",
    "Open Release & Activation to confirm the model version in force before quoting numbers.",
    "Record the decision and the assigned owner in Governance.",
  ],
  relatedPages: [
    { pageId: "commercial-program", label: "Program", route: "/commercial/program", relationship: "Prerequisite" },
    { pageId: "commercial-scenarios", label: "Scenarios", route: "/commercial/scenarios", relationship: "Prerequisite" },
    { pageId: "commercial-portfolio", label: "Portfolio", route: "/commercial/portfolio", relationship: "Upstream" },
    { pageId: "commercial-sources", label: "Sources", route: "/commercial/sources", relationship: "Upstream" },
    { pageId: "commercial-revenue", label: "Revenue", route: "/commercial/model/revenue", relationship: "Upstream" },
    { pageId: "commercial-pnl", label: "P&L (Cost & EBITDA)", route: "/commercial/model/pnl", relationship: "Upstream" },
    { pageId: "commercial-cash", label: "Cash & Sustainability", route: "/commercial/model/cash", relationship: "Upstream" },
    { pageId: "commercial-assumptions", label: "Assumptions & Change Sets", route: "/commercial/model/assumptions", relationship: "Upstream" },
    { pageId: "commercial-compare", label: "Scenario Comparison", route: "/commercial/model/compare", relationship: "Companion" },
    { pageId: "commercial-sensitivity", label: "Sensitivity Analysis", route: "/commercial/model/sensitivity", relationship: "Companion" },
    { pageId: "commercial-release", label: "Release & Activation", route: "/commercial/model/release", relationship: "Downstream" },
    { pageId: "commercial-governance", label: "Governance", route: "/commercial/neurealm-governance", relationship: "Downstream" },
    { pageId: "commercial-program-timeline", label: "Timelines", route: "/commercial/program-timeline", relationship: "Companion" },
    { pageId: "commercial-staffing-resources", label: "Staffing & Resources", route: "/commercial/staffing-resources", relationship: "Companion" },
  ],

  /* ---------------- Interpretation & training ---------------- */
  interpretation: [
    {
      band: "healthy",
      label: "Position is reviewable and defensible",
      criteria: [
        "Baseline scenario and model version in force are explicit.",
        "Source pages and model runs behind the figures are current.",
        "Financial, cash, staffing and activation views are consistent with one another.",
        "No unresolved critical data gap affects the decision at hand.",
        "The decisions requiring executive attention are clearly identified.",
      ],
      action: "Proceed with the executive review and record the decision.",
    },
    {
      band: "warning",
      label: "Position is usable only with qualification",
      criteria: [
        "One or more source pages or model runs are stale.",
        "Scenario or model-version context is unclear or unstated.",
        "Results are economically positive but capacity or cash is stressed.",
        "Material assumptions remain unapproved or sit in an unapplied change set.",
        "Summary metrics do not reconcile to the detailed pages.",
      ],
      action: "Qualify the narrative, open the authoritative page for each exception, and re-present once resolved.",
    },
    {
      band: "critical",
      label: "Position must not be used for a decision",
      criteria: [
        "Figures from different scenarios or model versions have been mixed.",
        "A source that underpins a headline figure is missing or unvalidated.",
        "The model is not ready for an executive decision.",
        "A release or activation is unsupported or uncertified.",
        "A binding recommendation is being drawn from illustrative or unvalidated data.",
      ],
      action: "Stop. Withdraw the position, escalate to the Executive Sponsor, and remediate on the owning page before re-presenting.",
    },
  ],
  commonMistakes: [
    { id: "mis-edit", description: "Treating Overview as the place to change detailed assumptions.", correction: "Edit on Scenarios and govern through Assumptions & Change Sets; Overview writes nothing." },
    { id: "mis-cash", description: "Reviewing headline economics without cash sustainability, which Overview does not display.", correction: "Always open Cash & Sustainability before concluding on viability." },
    { id: "mis-scenario", description: "Ignoring which scenario the figures belong to.", correction: "State the baseline scenario name and code in every conclusion." },
    { id: "mis-confidence", description: "Ignoring the confidence label printed under each metric.", correction: "Quote the value and its confidence together, every time." },
    { id: "mis-green", description: "Assuming Known and passed indicators mean every dependency is resolved.", correction: "Check the Pending readiness items and the Governance register before concluding." },
    { id: "mis-stale", description: "Using summary data that predates the latest model run or applied change set.", correction: "Confirm run currency on the Model pages before the review." },
    { id: "mis-nodeepdive", description: "Raising an exception but never opening the authoritative detailed page.", correction: "Every exception gets an owner and a page; resolve it there." },
    { id: "mis-commit", description: "Presenting illustrative or directional values as contractual commitments.", correction: "Honour the directional banner — commitments require validated sources and a certified, activated version." },
  ],
  bestPractices: [
    "Open Overview first in every commercial review to set shared context.",
    "Read scenario, version and confidence before reading any number.",
    "Use Show on Page to anchor the discussion to the exact card being debated.",
    "Pair every headline metric with the detailed page that owns it.",
    "Log Pending readiness items as risks rather than footnotes.",
    "Close each review with one recorded decision and one named owner.",
  ],
  workedExamples: [
    {
      id: "ex-activation-increase",
      title: "The activation assumption increases",
      narrative:
        "During a structuring review the team proposes a faster activation ramp: more accounts activated earlier in the year. On Overview the change is not visible immediately, because Overview reads records produced elsewhere. The team must follow the effect through the connected pages before the executive position can move.",
      steps: [
        "Revenue may increase as activated accounts start billing earlier.",
        "Delivery and RunOps capacity may need to increase to serve those accounts.",
        "Staffing cost may rise as roles are pulled forward in the plan.",
        "Cash requirements may increase before collections catch up, worsening the funding profile even while margin improves.",
        "Risk and timeline change: onboarding and gate sequencing come under pressure.",
        "Overview should show the new position only after the assumption is applied through a governed change set and Revenue, P&L, Cash and Staffing are recalculated and validated.",
      ],
      result:
        "The executive recommendation must weigh the complete effect — revenue upside net of capacity, cost, cash and timing risk — not the revenue line alone.",
    },
  ],
  faqs: [
    { id: "faq-differ", question: "Why does Overview differ from a detailed page?", answer: "Overview summarises records produced elsewhere and refreshes when those records change. If a detailed page has been recalculated or a change set applied since the summarised record was written, the two will differ. The detailed page is always authoritative." },
    { id: "faq-edit", question: "Where should assumptions be edited?", answer: "Directional assumptions are edited on Scenarios. Governed changes go through Assumptions & Change Sets, where they are staged, validated and applied with an audit trail. Overview is read-only." },
    { id: "faq-active-scenario", question: "What does the active scenario mean here?", answer: "Overview uses the scenario flagged as baseline. It is the scenario every figure on the page is scoped to. If no scenario is flagged, the Baseline scenario card says so and the page has no scenario context." },
    { id: "faq-ebitda-cash", question: "Why can EBITDA improve while cash worsens?", answer: "EBITDA is recognised on the period the activity falls in; cash follows collection and payment timing. Faster activation can lift margin while increasing the funding requirement before collections arrive. Cash & Sustainability shows this." },
    { id: "faq-warning", question: "What should I do when something is marked Pending or unvalidated?", answer: "Treat it as a constraint on confidence, not a footnote. Open the owning page — Portfolio for account data, Sources for provenance — resolve it there, and qualify the narrative until it is closed." },
    { id: "faq-current", question: "How do I know the model is current?", answer: "Overview does not display run timestamps. Confirm currency on the Model pages, which show run status, stale and superseded indicators, and on Release & Activation for the version in force." },
    { id: "faq-approval", question: "Can Overview be used for an approval?", answer: "It can frame the approval discussion, but the approval must rest on the detailed pages: current runs, validated sources, applied change sets, and a certified activated model version." },
    { id: "faq-wrong", question: "Which page should I open when a number looks wrong?", answer: "Follow the metric to its owner: volume and revenue to Revenue, cost and margin to P&L, funding to Cash, scope to Portfolio, provenance to Sources, version to Release & Activation." },
  ],
  glossary: [
    { term: "Commercial Digital Twin", definition: "The modelled representation of the deal's commercial structure, economics and readiness across the Commercial Module." },
    { term: "Active Scenario", definition: "On Overview, the scenario flagged as baseline; the context every displayed figure is scoped to." },
    { term: "Model Version", definition: "The versioned formula catalogue and manifest under which results were produced, governed on Release & Activation." },
    { term: "EBITDA", definition: "Earnings before interest, tax, depreciation and amortisation — the margin measure produced on the P&L page." },
    { term: "Cash Requirement", definition: "The funding needed before collections cover outflows, produced on Cash & Sustainability." },
    { term: "Activation", definition: "The governed act of making a model version authoritative, and the ramp at which accounts are brought into service." },
    { term: "Model Confidence", definition: "The stated reliability of a figure given its source completeness and validation state; shown as a label under each aggregate metric." },
    { term: "Commercial Readiness", definition: "Whether the position is complete enough to support an executive decision, or requires further review or approval." },
  ],
  executiveTakeaway:
    "Overview is the consolidated position statement for the Commercial Digital Twin: workspace, program, gate, baseline scenario, aggregate economics, source provenance and data readiness in one view. Its figures are directional and currently Medium confidence — aggregate values are known while account-level data remains pending validation. Use it to frame the review, identify exceptions and choose the next deep dive; take binding decisions only against the authoritative detailed pages, current model runs and a certified, activated model version.",
  keyRisks: [
    "Account-level ARR, renewal dates, product mix and partner status remain pending validation.",
    "Overview shows no cash, staffing or activation status, so viability can be misread from margin alone.",
    "No run timestamps on the page mean stale economics can be quoted unknowingly.",
    "Directional figures may be mistaken for contractual commitments.",
    "Mixing scenarios or model versions produces a meaningless position.",
  ],

  /* ---------------- Show on page ---------------- */
  showOnPageTargets: [
    { targetId: "overview-page-context", label: "Directional banner", description: "The standing caveat that this module presents directional, source-referenced modelling." },
    { targetId: "overview-workspace-context", label: "Workspace card", description: "Confirm the tenant every figure on this page is scoped to." },
    { targetId: "overview-program-context", label: "Program card", description: "Program name, partner, segment, status, current gate and source status." },
    { targetId: "overview-current-gate", label: "Current Gate card", description: "The active gate mandate: account scope, operating and economic objectives." },
    { targetId: "overview-gate-progression", label: "Gate progression", description: "Passed, active and pending gates in sequence." },
    { targetId: "overview-summary-metrics", label: "Aggregate program metrics", description: "Headline metrics, each with its confidence label." },
    { targetId: "overview-scenario-context", label: "Baseline scenario", description: "The scenario every figure on this page is scoped to." },
    { targetId: "overview-scenario-comparison", label: "Scenario comparison", description: "Scenario coverage by assumption count, with a link to Scenarios." },
    { targetId: "overview-source-validation", label: "Source validation", description: "Registered confidential sources and their validation status." },
    { targetId: "overview-data-status", label: "Data readiness", description: "Known and Pending account-data items that cap confidence." },
    { targetId: "overview-next-actions", label: "Recommended next actions", description: "The deal team's queue of follow-ups and deferred items." },
  ],
};
