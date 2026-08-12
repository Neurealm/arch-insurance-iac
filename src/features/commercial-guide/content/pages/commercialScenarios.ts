import type { CommercialGuideContent } from "../../types";

/**
 * Page-specific Commercial Guide content — Scenarios (`/commercial/scenarios`).
 *
 * Authored strictly against what renders in
 * `src/commercial/pages/CommercialScenarios.tsx`: the directional banner, the
 * directional caveat alert, the "no calculation engine on this page" notice,
 * the permission / unsaved-changes status line, the seed + save actions, three
 * scenario cards (Conservative, Base, Upside — the Base card carries the
 * `Baseline` star badge), the Activation Ramp table (FY2027–FY2031) and five
 * driver group tables: Renewal & Growth, Rebate & Growth Share, Services,
 * Funding and Operating Scope. Each driver row shows a label, an assumption
 * code, one editable cell per scenario, a confidence badge and source SRC-002.
 *
 * Concepts requested but NOT rendered here (scenario create / duplicate /
 * archive actions, a named scenario owner field, a stored rationale field
 * separate from the description, per-scenario validation or run status, an
 * explicit "recommended" flag beyond `is_baseline`, staffing, loaded cost,
 * timeline, collections and risk drivers) are described only as practice or
 * recorded as known gaps. Nothing is invented, and no scenario data,
 * calculation or workflow is changed by this guide.
 */
export const commercialScenariosGuide: CommercialGuideContent = {
  pageId: "commercial-scenarios",
  route: "/commercial/scenarios",
  match: "exact",
  pageTitle: "Scenarios",
  guideTitle: "Scenarios — Coherent Cases, Not Assembled Preferences",
  audiences: ["Executive", "Commercial Lead", "Finance", "Delivery", "Operations", "Sales", "Administrator"],
  modes: ["executive", "practitioner", "administrator"],
  estimatedReadingMinutes: 11,
  trainingLevel: "Intermediate",
  lastUpdated: "2026-07-29",

  /* ---------------- Overview ---------------- */
  purpose:
    "Scenarios defines the small set of coherent, internally consistent cases the Commercial Digital Twin can be run under. Each scenario is one possible deal outcome expressed as a complete set of driver values — activation ramp, renewal influence, growth, rebates, services, funding and operating scope. The page exists so every downstream number can be attributed to a named case rather than to a loose collection of preferred inputs.",
  represents:
    "Three configured cases for Project Momentous — Conservative, Base and Upside — each with a code, description, status, source status and a baseline flag, plus one column of driver values per case. It represents the definition of each case, not its financial results: no revenue, EBITDA, cash or payback figure is computed on this page.",
  whyItMatters:
    "A scenario is only meaningful if it hangs together. The moment activation is taken from Upside, cost from Conservative and services attach from Base, the resulting model output describes a business that does not exist. Keeping cases whole is what makes a recommendation defensible, reproducible and safe to negotiate against.",
  moduleConnection:
    "Scenarios sits between Assumptions and the model engines. Program, Portfolio, Sources and Assumptions & Change Sets supply scope, evidence and controlled inputs; Scenarios organises those inputs into named cases; Revenue, P&L, Cash, Scenario Comparison and Sensitivity all execute against a chosen scenario; Release & Activation certifies one case; Overview and Governance report on the case that was selected for planning.",
  questionsAnswered: [
    "What assumptions define each scenario?",
    "What business conditions does each scenario represent?",
    "Which scenario is marked as the baseline for planning?",
    "How do scenario assumptions differ, driver by driver?",
    "Is each scenario operationally feasible?",
    "What is the downside exposure if Conservative holds?",
    "What evidence supports the Base case?",
    "What would cause the deal to move from one scenario to another?",
  ],
  expectedOutcome:
    "A small number of complete, explainable cases — each with a rationale, a consistent set of drivers and a clear status — with one identified as the planning baseline and the others retained as credible downside and conditional upside.",
  lifecycleStages: [
    "Commercial Structuring",
    "Financial Modeling",
    "Executive Review",
    "Negotiation",
    "Delivery Planning",
    "Continuous Improvement",
  ],
  prerequisites: [
    { id: "pre-portfolio", label: "Defined portfolio scope", route: "/commercial/portfolio", detail: "Account population and segmentation agreed before scenario drivers are set." },
    { id: "pre-sources", label: "Current sources", route: "/commercial/sources", detail: "Driver values on this page are attributed to SRC-002; that reference must be current." },
    { id: "pre-assumptions", label: "Controlled assumptions", route: "/commercial/model/assumptions", detail: "Material changes belong in the governed change-set process, not in ad-hoc edits." },
    { id: "pre-terms", label: "Defined commercial terms", route: "/commercial/program", detail: "Rebate, growth-share and services terms must be understood before they are varied by case." },
    { id: "pre-staffing", label: "Staffing and timing assumptions", route: "/commercial/staffing-resources", detail: "Activation ramp is only credible if delivery capacity can support it." },
    { id: "pre-owner", label: "Scenario owner", detail: "Not captured as a field on this page — record the owner in governance minutes." },
    { id: "pre-rationale", label: "Scenario rationale", detail: "Held today in the scenario description text; write it before editing drivers." },
  ],
  ownership: {
    businessOwner: "Deal Lead",
    commercialOwner: "Commercial Lead",
    technicalOwner: "Finance (model owner)",
    executiveApprover: "Executive Sponsor or steering committee",
    primaryUsers: ["Commercial Lead", "Finance", "Deal Lead", "Program Director", "Staffing Lead"],
    consumersOfOutput: ["Revenue", "P&L", "Cash", "Scenario Comparison", "Sensitivity", "Release & Activation", "Overview", "Governance"],
  },

  /* ---------------- How it works ---------------- */
  sections: [
    {
      id: "sec-summary",
      title: "Directional caveat and page framing",
      targetId: "scenarios-summary",
      explanation:
        "The page opens with the directional banner and a caveat stating that these are directional portfolio assumptions, not contractually approved values or validated account-level forecasts. Read it as a scope statement: the cases are structurally real and comparable, but the individual values are planning-grade. Quote scenario outputs with that qualification attached.",
    },
    {
      id: "sec-cards",
      title: "Scenario cards",
      targetId: "scenarios-cards",
      explanation:
        "Three cards — Conservative, Base and Upside — each showing the scenario name, a monospaced scenario code, a description, a status badge and a source-status badge. The card with the Baseline star badge is the case the model treats as the planning default; its border is highlighted. The cards are the only place the business meaning of each case is stated in words.",
    },
    {
      id: "sec-rationale",
      title: "Scenario rationale",
      targetId: "scenarios-rationale",
      explanation:
        "The description text on each card carries the rationale: what business conditions the case assumes. There is no separate structured rationale field, no enabling-conditions list and no owner name. Keep the description specific enough that a reader can say why the case is credible without opening the driver tables.",
    },
    {
      id: "sec-status",
      title: "Permission and unsaved-change status",
      targetId: "scenarios-status",
      explanation:
        "A status line shows either 'Editing enabled' or a locked 'View-only' state when the user lacks scenario-management permission, plus a count of unsaved changes when driver cells have been edited. Unsaved edits are held in the browser only; navigating away or reloading prompts a warning and discards them.",
    },
    {
      id: "sec-detail",
      title: "Activation Ramp (cumulative accounts)",
      targetId: "scenarios-detail",
      explanation:
        "A table of cumulative activated accounts by fiscal year, FY2027 through FY2031, with one editable column per scenario. This is the single most consequential difference between cases: it drives account-linked revenue, services attach and the delivery capacity each case implies. Read the ramp before reading any other driver.",
    },
    {
      id: "sec-drivers",
      title: "Driver groups",
      targetId: "scenarios-drivers",
      explanation:
        "Five grouped tables — Renewal & Growth, Rebate & Growth Share, Services, Funding and Operating Scope — each row showing the driver label, its assumption code, one value per scenario, a confidence badge and source SRC-002. Support scope (L1_L2_SUPPORT_IN_SCOPE) is displayed but not editable here. Differences between columns are the scenario definition.",
    },
    {
      id: "sec-actions",
      title: "Seed and save actions",
      targetId: "scenarios-actions",
      explanation:
        "Two actions exist: seed the Conservative, Base and Upside scenarios when none are configured, and save pending driver edits. There is no create, duplicate, archive or scenario-select action on this page — the case set is fixed at three, and the baseline flag is set in data rather than through the interface.",
    },
    {
      id: "sec-validation",
      title: "Calculation and validation notice",
      targetId: "scenarios-validation",
      explanation:
        "A dashed notice states that no P&L, EBITDA, cash-flow, NPV or payback output is computed on this page. There is no per-scenario validation state or run status shown here. Validation and run outcomes live in Assumptions & Change Sets, the model pages and Release & Activation.",
    },
  ],
  inputs: [
    { id: "in-ramp", label: "Activation ramp FY2027–FY2031", description: "Cumulative activated accounts per fiscal year, per scenario.", owner: "Commercial Lead", source: "SRC-002", required: true },
    { id: "in-renewal", label: "Renewal influenced %", description: "Share of the renewal base the program is credited with influencing.", owner: "Commercial Lead", source: "SRC-002", required: true },
    { id: "in-growth", label: "Incremental ARR growth %", description: "Growth rate applied to influenced ARR.", owner: "Finance", source: "SRC-002" },
    { id: "in-mix", label: "Non-flex and marketplace mix %", description: "Split of the influenced base across commercial motions.", owner: "Commercial Lead", source: "SRC-002" },
    { id: "in-rebate", label: "Rebate rates", description: "Base renewal, marketplace, non-flex expansion and flex migration rebate percentages.", owner: "Finance", source: "SRC-002", required: true },
    { id: "in-share", label: "Strategic growth acceleration and ARR proxy growth share %", description: "Upside participation terms on accelerated growth.", owner: "Commercial Lead", source: "SRC-002" },
    { id: "in-ms", label: "Managed-services annual revenue per account", description: "Recurring services value attached per activated account.", owner: "Delivery", source: "SRC-002" },
    { id: "in-ps", label: "Professional-services one-time revenue per account", description: "One-off services value per activated account.", owner: "Delivery", source: "SRC-002" },
    { id: "in-msgm", label: "Managed-services gross margin %", description: "Margin assumption on recurring services.", owner: "Finance", source: "SRC-002" },
    { id: "in-fund", label: "Funding drivers", description: "Activation fund per account, MDF / co-sell annual, support readiness fund.", owner: "Commercial Lead", source: "SRC-002" },
    { id: "in-support", label: "L1/L2 support in scope", description: "Whether tier 1 and 2 support sit inside the scope of the case. Displayed read-only on this page.", owner: "Delivery", source: "SRC-002" },
    { id: "in-lag", label: "Payment lag days", description: "Timing driver feeding working-capital behaviour downstream in Cash.", owner: "Finance", source: "SRC-002" },
  ],
  outputs: [
    { id: "out-def", label: "Scenario definition", description: "A named case with a code, description, status and source status.", consumedBy: ["Scenario Comparison", "Governance"] },
    { id: "out-values", label: "Scenario-specific driver values", description: "One complete column of assumption values per case.", consumedBy: ["Revenue", "P&L", "Cash", "Sensitivity"] },
    { id: "out-status", label: "Scenario status and baseline flag", description: "Status, source status and which case carries the Baseline badge.", consumedBy: ["Overview", "Release & Activation"] },
    { id: "out-rationale", label: "Scenario rationale", description: "The business conditions each case assumes, held in the description text.", consumedBy: ["Executive Review", "Governance"] },
    { id: "out-context", label: "Model-run context", description: "The case identity attached to every model run so results stay attributable.", consumedBy: ["Revenue", "P&L", "Cash"] },
    { id: "out-compare", label: "Comparison-ready case", description: "A whole case that can be set against another without mixing inputs.", consumedBy: ["Scenario Comparison"] },
    { id: "out-reco", label: "Planning recommendation", description: "The case put forward for planning, evidenced by drivers and rationale.", consumedBy: ["Governance", "Release & Activation"] },
  ],
  businessRules: [
    { id: "br-1", rule: "Each scenario must have a clear business rationale.", explanation: "A case without a stated reason cannot be defended or reproduced. The description on the scenario card is the only rationale field available — write it before editing drivers." },
    { id: "br-2", rule: "Assumptions within a scenario must be internally consistent.", explanation: "Activation, rebate, services, funding and scope in one column must describe the same world. Inconsistency inside a case produces results nobody can act on." },
    { id: "br-3", rule: "Values from different scenarios must not be mixed in one model run.", explanation: "A run executes against one scenario column. Assembling preferred values across cases creates a fictional case with no rationale and no owner." },
    { id: "br-4", rule: "Base should be the most supportable planning case, not an aspirational midpoint.", explanation: "Base carries the Baseline badge and drives planning. It must be the case the evidence best supports, not the arithmetic middle of Conservative and Upside." },
    { id: "br-5", rule: "Conservative should represent credible downside, not an artificial failure case.", explanation: "A deliberately hopeless Conservative case removes the value of downside planning. It must be a plausible outcome with all unavoidable costs retained." },
    { id: "br-6", rule: "Upside should require defined enabling conditions.", explanation: "Higher activation and services attach only occur if specific things happen. Those conditions must be written down; the page has no field for them, so record them in the description or governance minutes." },
    { id: "br-7", rule: "Scope, activation, staffing, cost, services and timing must align within the case.", explanation: "A faster ramp implies more delivery capacity and different funding. If the operational side does not move with the commercial side, the case is not feasible." },
    { id: "br-8", rule: "Scenario names do not replace explicit driver values.", explanation: "Calling a case 'Upside' communicates nothing testable. Only the driver columns define it, and only those values are used by the model." },
    { id: "br-9", rule: "Material scenario changes should use the controlled assumption process.", explanation: "Direct edits here save immediately to scenario assumptions. Anything that changes the planning case or a governed value belongs in Assumptions & Change Sets." },
    { id: "br-10", rule: "The active or recommended scenario must be explicit.", explanation: "The Baseline badge is the only visible marker of the planning case. If governance recommends a different case, the badge and the minutes must agree." },
    { id: "br-11", rule: "Scenario selection is not release approval.", explanation: "Choosing a case for modelling does not certify it. Certification happens in Release & Activation, with its own approvals and lineage." },
    { id: "br-12", rule: "Archived or obsolete scenarios must remain distinguishable from active ones.", explanation: "The status and source-status badges are the only differentiators today. There is no archive action, so retired cases must be handled by status and clearly narrated." },
  ],
  calculationLogic: [
    "No financial calculation runs on this page — the dashed notice states that P&L, EBITDA, cash-flow, NPV and payback are not computed here.",
    "Ratio drivers are stored as decimals and displayed as percentages; editing a cell divides the entered percentage by 100 before saving.",
    "USD drivers are displayed with thousands separators; accounts and days are displayed as entered.",
    "Saving writes each edited cell directly to the scenario's assumption record; unsaved edits exist only in the browser session.",
    "Scenario columns are ordered Conservative, Base, Upside regardless of storage order.",
    "The Baseline badge is driven by the scenario's baseline flag in data, not by any control on this page.",
  ],
  relationship: {
    receivesFrom: ["Program", "Portfolio", "Sources", "Assumptions & Change Sets", "Staffing & Resources", "Activation planning", "Commercial terms", "Risk posture"],
    models: ["Conservative case", "Base case", "Upside case", "Integrated driver set per case", "Activation ramp by fiscal year", "Differences between cases"],
    feeds: ["Revenue", "P&L (Cost & EBITDA)", "Cash & Sustainability", "Scenario Comparison", "Sensitivity Analysis", "Release & Activation", "Overview", "Governance"],
  },
  downstreamImpacts: [
    { area: "Revenue", effect: "Activation ramp, renewal influence, rebate rates and services attach set the revenue trajectory for the case." },
    { area: "Costs", effect: "Services scope and support scope determine the cost base carried in the case." },
    { area: "EBITDA", effect: "Every EBITDA figure is only interpretable against the scenario it was run under." },
    { area: "Cash", effect: "Payment lag and funding drivers change working-capital timing between cases." },
    { area: "Staffing", effect: "A faster ramp implies earlier hiring; Staffing & Resources must be checked against the chosen case." },
    { area: "Activation", effect: "The ramp is the activation plan expressed numerically." },
    { area: "Governance", effect: "The planning case and its rationale are what governance reviews and records." },
    { area: "Risk", effect: "Upside conditions and Conservative exposure define the risk envelope of the deal." },
  ],
  dataQuality: {
    dataSources: ["SRC-002 (revised P&L workbook)", "Seeded Project Momentous scenario set", "commercial_scenario_assumptions records"],
    updateFrequency: "On demand, whenever a driver is revised by a permitted user.",
    knownGaps: [
      "No scenario create, duplicate, archive or delete action exists on the page.",
      "No named scenario owner field — ownership must be recorded outside the tool.",
      "No structured rationale or enabling-conditions field; the card description carries both.",
      "No per-scenario validation state or model-run status is displayed here.",
      "No staffing, loaded-cost, timeline, collections or risk drivers are configurable on this page.",
      "No change history, audit trail or attribution for direct driver edits on this page.",
      "Confidence is shown as a single badge per driver row, not per scenario.",
      "Every driver row is attributed to SRC-002 with no per-driver source selection.",
      "No 'recommended' concept distinct from the baseline flag.",
      "No approval or sign-off step is available from this page.",
    ],
    changeControl: "Direct edits require scenario-management permission and save immediately. Governed and material changes must instead go through Assumptions & Change Sets so they are validated, approved and auditable.",
    lineage: "Scenario driver values trace to SRC-002; downstream model runs record the scenario they executed against.",
  },
  modelConfidence: "Medium",
  confidenceBasis: ["Commercial terms", "Revenue assumptions", "Cost assumptions", "Timing", "Source completeness"],
  confidenceGuidance:
    "Treat structure as reliable and values as directional. Confidence is highest where a driver comes straight from agreed terms, and lowest for activation ramp and services attach, which are judgement-based. Raise confidence by validating each driver with its functional owner and recording the evidence in Sources.",
  commercialReadiness: "Review Required",
  readinessCriteria: [
    "Each of the three cases has a rationale stated in its description.",
    "Every driver column has been reviewed by its functional owner.",
    "Activation ramp has been checked against delivery capacity.",
    "Upside enabling conditions are written down somewhere durable.",
    "Conservative retains all unavoidable costs.",
    "The Baseline badge sits on the case governance intends to plan against.",
    "No unsaved changes remain when the page is used for a review.",
  ],

  /* ---------------- How to use it ---------------- */
  workflow: [
    { id: "wf-1", step: 1, title: "Confirm portfolio and program scope", description: "Check that the account population and deal structure behind the cases are current.", role: "Commercial Lead" },
    { id: "wf-2", step: 2, title: "Confirm the business purpose of each case", description: "Read the card descriptions and restate what conditions each case assumes.", role: "Deal Lead" },
    { id: "wf-3", step: 3, title: "Review every material driver", description: "Walk the activation ramp and all five driver groups column by column, not row by row.", role: "Finance" },
    { id: "wf-4", step: 4, title: "Confirm internal consistency", description: "Check that scope, activation, services, funding and scope flags describe the same world within each case.", role: "Commercial Lead" },
    { id: "wf-5", step: 5, title: "Confirm staffing and delivery feasibility", description: "Test the ramp against Staffing & Resources before accepting it.", role: "Program Director" },
    { id: "wf-6", step: 6, title: "Confirm funding and cash assumptions", description: "Check funding drivers and payment lag against what Finance can support.", role: "Finance" },
    { id: "wf-7", step: 7, title: "Document enabling conditions", description: "Write down what must be true for Upside; the page has no dedicated field, so use the description or minutes.", role: "Deal Lead" },
    { id: "wf-8", step: 8, title: "Validate with functional owners", description: "Have each owner confirm the drivers they are accountable for.", role: "Functional owners" },
    { id: "wf-9", step: 9, title: "Save and run the model", description: "Save pending edits, then run Revenue, P&L and Cash against the chosen scenario.", role: "Finance" },
    { id: "wf-10", step: 10, title: "Review outputs in case context", description: "Read every output alongside the scenario it was produced under.", role: "Finance" },
    { id: "wf-11", step: 11, title: "Compare scenarios", description: "Use Scenario Comparison to set whole cases against each other rather than reading them separately.", role: "Commercial Lead" },
    { id: "wf-12", step: 12, title: "Approve the planning case through governance", description: "Take the recommended case, its rationale and its conditions to the sponsor or steering committee.", role: "Executive Sponsor" },
  ],
  actionsAvailable: [
    "Read the three scenario cards, their descriptions, status and source status.",
    "Identify the baseline case from the Baseline star badge.",
    "Read the activation ramp for FY2027 to FY2031 across all cases.",
    "Read all five driver groups with confidence and source shown.",
    "Edit driver values in place when scenario-management permission is held.",
    "See the count of unsaved changes and be warned before leaving with edits pending.",
    "Save pending driver changes.",
    "Seed the Conservative, Base and Upside scenarios when none exist.",
  ],
  teamActivities: [
    { id: "ta-1", activity: "Driver walkthrough with functional owners", role: "Commercial Lead", cadence: "Each modelling cycle" },
    { id: "ta-2", activity: "Feasibility check of the activation ramp", role: "Program Director", cadence: "Before any recommendation" },
    { id: "ta-3", activity: "Funding and cash review of scenario drivers", role: "Finance", cadence: "Each modelling cycle" },
    { id: "ta-4", activity: "Enabling-condition documentation for Upside", role: "Deal Lead", cadence: "Whenever Upside changes" },
    { id: "ta-5", activity: "Planning-case recommendation to governance", role: "Executive Sponsor", cadence: "At each executive review" },
  ],
  roles: [
    { role: "Deal Lead", responsibility: "Owns the business rationale and the enabling conditions behind each case." },
    { role: "Commercial Lead", responsibility: "Owns driver coherence across the case and the recommendation of a planning case." },
    { role: "Finance", responsibility: "Owns model integrity, rebate, margin, funding and timing drivers." },
    { role: "Program Director", responsibility: "Confirms the ramp is deliverable and the case is operationally feasible." },
    { role: "Staffing Lead", responsibility: "Confirms capacity implied by activation can be resourced." },
    { role: "Revenue and Cost Owners", responsibility: "Confirm the drivers they are accountable for within each case." },
    { role: "Executive Sponsor", responsibility: "Approves the planning case and accepts the downside exposure." },
    { role: "Governance reviewers", responsibility: "Test that cases are coherent, attributable and not assembled from mixed inputs." },
  ],
  raci: [
    { activity: "Define scenario rationale", assignments: [{ role: "Deal Lead", raci: "R" }, { role: "Commercial Lead", raci: "A" }, { role: "Finance", raci: "C" }, { role: "Executive Sponsor", raci: "I" }] },
    { activity: "Set and edit scenario drivers", assignments: [{ role: "Commercial Lead", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Revenue and Cost Owners", raci: "C" }, { role: "Program Director", raci: "I" }] },
    { activity: "Confirm operational feasibility", assignments: [{ role: "Program Director", raci: "R" }, { role: "Staffing Lead", raci: "C" }, { role: "Commercial Lead", raci: "A" }, { role: "Finance", raci: "I" }] },
    { activity: "Recommend the planning case", assignments: [{ role: "Commercial Lead", raci: "R" }, { role: "Executive Sponsor", raci: "A" }, { role: "Finance", raci: "C" }, { role: "Governance reviewers", raci: "I" }] },
  ],
  reviewRequirements: [
    "Every driver column reviewed by its functional owner before the case is used in a recommendation.",
    "Activation ramp reviewed against staffing capacity.",
    "Differences between cases explained in one sentence each.",
    "Conservative reviewed for omitted fixed or unavoidable costs.",
    "Upside reviewed for undocumented enabling conditions.",
  ],
  approvalRequirements: [
    "No approval control exists on this page — approval happens in governance and, for governed values, in Assumptions & Change Sets.",
    "Editing requires scenario-management permission; without it the page is view-only.",
    "The planning case must be approved by the Executive Sponsor or steering committee.",
    "Release certification is separate and happens in Release & Activation.",
  ],
  decisions: [
    { id: "dec-1", decision: "Which case is used for planning", decidedBy: "Executive Sponsor", evidence: "Baseline badge, driver review, rationale, feasibility check" },
    { id: "dec-2", decision: "Whether Upside can be offered in negotiation", decidedBy: "Deal Lead with Executive Sponsor", evidence: "Documented enabling conditions" },
    { id: "dec-3", decision: "Whether Conservative exposure is acceptable", decidedBy: "Executive Sponsor", evidence: "Conservative driver column and downstream Cash output" },
    { id: "dec-4", decision: "Whether a driver change is direct or governed", decidedBy: "Commercial Lead with Finance", evidence: "Materiality of the driver and change-control policy" },
  ],
  whatToDoNext: [
    "Run Revenue, P&L and Cash against the case you intend to recommend.",
    "Open Scenario Comparison to set the cases against each other as whole cases.",
    "Use Sensitivity Analysis to test which drivers actually move the outcome.",
    "Route material driver changes through Assumptions & Change Sets.",
    "Take the recommended case and its conditions to Governance.",
  ],
  relatedPages: [
    { pageId: "commercial-portfolio", label: "Portfolio", route: "/commercial/portfolio", relationship: "Prerequisite" },
    { pageId: "commercial-sources", label: "Sources", route: "/commercial/sources", relationship: "Prerequisite" },
    { pageId: "commercial-assumptions", label: "Assumptions & Change Sets", route: "/commercial/model/assumptions", relationship: "Upstream" },
    { pageId: "commercial-revenue", label: "Revenue", route: "/commercial/model/revenue", relationship: "Downstream" },
    { pageId: "commercial-pnl", label: "P&L (Cost & EBITDA)", route: "/commercial/model/pnl", relationship: "Downstream" },
    { pageId: "commercial-cash", label: "Cash & Sustainability", route: "/commercial/model/cash", relationship: "Downstream" },
    { pageId: "commercial-compare", label: "Scenario Comparison", route: "/commercial/model/compare", relationship: "Downstream" },
    { pageId: "commercial-sensitivity", label: "Sensitivity Analysis", route: "/commercial/model/sensitivity", relationship: "Downstream" },
    { pageId: "commercial-release", label: "Release & Activation", route: "/commercial/model/release", relationship: "Downstream" },
    { pageId: "commercial-staffing-resources", label: "Staffing & Resources", route: "/commercial/staffing-resources", relationship: "Companion" },
  ],

  /* ---------------- Interpretation & training ---------------- */
  interpretation: [
    {
      band: "healthy",
      label: "Coherent, explainable case set",
      criteria: [
        "Each scenario has explicit driver values, not just a name.",
        "Each case is coherent and supportable on its own terms.",
        "Functional owners agree with the drivers they own.",
        "Operational capacity aligns with the activation ramp.",
        "Differences between cases are easy to explain in one sentence.",
        "The planning case is clearly identified by the Baseline badge.",
      ],
      action: "Proceed to model runs and comparison, and take the recommended case to governance.",
    },
    {
      band: "warning",
      label: "Cases need tightening before use",
      criteria: [
        "Scenarios differ in ways nobody has documented.",
        "Base relies on low-confidence assumptions.",
        "Upside depends on resources that have not been approved.",
        "Conservative omits costs that would be incurred regardless.",
        "Scope differs between cases without that being disclosed.",
      ],
      action: "Pause the recommendation, walk each driver with its owner, and record the differences and conditions before modelling further.",
    },
    {
      band: "critical",
      label: "Case set cannot support a decision",
      criteria: [
        "Inputs have been mixed across scenarios in a single run.",
        "The scenario cannot be reproduced from its recorded drivers.",
        "A recommended case has no operational feasibility.",
        "Scenario outputs are being quoted without the scenario context.",
        "Binding commercial terms rest solely on an unsupported Upside case.",
      ],
      action: "Stop using the outputs. Rebuild each case as a whole column, restate the rationale, and re-validate with owners before any external commitment.",
    },
  ],
  commonMistakes: [
    { id: "cm-1", description: "Selecting the scenario with the highest EBITDA rather than the one the evidence supports.", correction: "Choose the case that is most supportable and feasible, then state the upside separately with its conditions." },
    { id: "cm-2", description: "Treating Base as the arithmetic average of Conservative and Upside.", correction: "Build Base from evidence in its own right; it is a planning case, not a midpoint." },
    { id: "cm-3", description: "Mixing account scope between cases without disclosing it.", correction: "Keep scope explicit per case and state any scope difference alongside the results." },
    { id: "cm-4", description: "Raising revenue drivers without changing the capacity needed to deliver them.", correction: "Move activation, services and staffing together, and confirm feasibility with the Program Director." },
    { id: "cm-5", description: "Ignoring the cash requirement implied by a faster ramp.", correction: "Check payment lag and funding drivers, then read Cash & Sustainability for the same case." },
    { id: "cm-6", description: "Hiding fixed or unavoidable costs inside the Conservative case.", correction: "Keep unavoidable costs in every case; Conservative is a credible downside, not a failure scenario." },
    { id: "cm-7", description: "Treating selection of a scenario as approval of it.", correction: "Selection is a modelling choice. Approval is a governance act, and certification happens in Release & Activation." },
    { id: "cm-8", description: "Failing to define what would trigger a move from one case to another.", correction: "Write the trigger conditions down when the case is defined, not when the deal shifts." },
  ],
  bestPractices: [
    "Read scenarios by column, never by row.",
    "Write the rationale before touching a driver value.",
    "State enabling conditions for Upside every time it is presented.",
    "Keep the number of cases small — three that are understood beat six that are not.",
    "Always name the scenario when quoting a number.",
    "Save or discard edits before entering a review; unsaved changes are invisible to others.",
    "Route material driver changes through the governed change-set process.",
    "Re-check feasibility whenever the activation ramp moves.",
  ],
  workedExamples: [
    {
      id: "we-1",
      title: "Base versus Upside — higher activation and services attach",
      narrative:
        "Base assumes a measured activation ramp and a modest managed-services attach per activated account. Upside raises both: more accounts activate earlier, and each activated account carries a larger managed-services and professional-services value. Revenue in Upside is clearly higher, and EBITDA follows. But the same drivers that lift revenue also lift demand: more activated accounts earlier means more onboarding, more support and more delivery staff, and the services attach only materialises if capacity exists to deliver it. With payment lag applied to a larger and earlier revenue base, cash typically worsens before it improves — the cost of hiring and mobilising lands before collections catch up. Risk rises too, because Upside depends on partner motion, customer readiness and hiring all going right at once. None of those conditions are stored as fields on this page, so they must be written into the scenario description or the governance record. The correct conclusion is not 'recommend Upside because EBITDA is higher'. It is 'Base is the planning case; Upside is available if these named conditions are met, and here is the cash and staffing profile required to pursue it'.",
      steps: [
        "Compare the FY2027–FY2031 activation ramp rows across the Base and Upside columns.",
        "Compare managed-services and professional-services revenue per account in the Services group.",
        "Check funding drivers and payment lag for the timing consequences.",
        "Test the Upside ramp against Staffing & Resources for feasibility.",
        "Run Revenue, P&L and Cash separately for each case — never a blended column.",
        "Document the enabling conditions and present Base as the planning case.",
      ],
      result:
        "Base is recommended for planning; Upside is presented as a conditional case with named enabling conditions, a defined capacity requirement and an acknowledged cash profile.",
    },
  ],
  faqs: [
    { id: "faq-1", question: "What is a scenario?", answer: "A coherent, internally consistent set of driver values describing one possible deal outcome — activation ramp, renewal influence, growth, rebates, services, funding and operating scope. It is a whole case, not a single adjusted input." },
    { id: "faq-2", question: "What makes the Base case credible?", answer: "Base is credible when every driver is the most supportable value available, each owner has confirmed the drivers they are accountable for, and the ramp is deliverable with the capacity that exists or is approved. Credibility comes from evidence, not from sitting between Conservative and Upside." },
    { id: "faq-3", question: "Can I mix assumptions from different scenarios?", answer: "No. A model run executes one scenario column. Combining preferred values across cases produces a case with no rationale, no owner and no way to reproduce it, and any output from it is misleading." },
    { id: "faq-4", question: "How is a scenario approved?", answer: "Not on this page. Editing requires scenario-management permission, but approval of the planning case is a governance act by the Executive Sponsor or steering committee, and governed value changes run through Assumptions & Change Sets." },
    { id: "faq-5", question: "Is the active scenario the released scenario?", answer: "No. The Baseline badge marks the planning default for modelling. Release certification is a separate, audited step in Release & Activation with its own approvals and lineage." },
    { id: "faq-6", question: "Why does Upside need enabling conditions?", answer: "Because Upside is not a wish — it is an outcome that occurs only if specific things happen: partner motion, customer readiness, hiring, funding. Without those conditions written down, Upside becomes an unaccountable number that can be quoted in negotiation." },
    { id: "faq-7", question: "When should a scenario be archived?", answer: "When it no longer represents a case anyone would plan or negotiate against. There is no archive action on this page today, so retirement must be handled through the scenario status and clearly narrated in governance records." },
    { id: "faq-8", question: "Where do I change a scenario driver?", answer: "Directly in the activation ramp or driver group tables if you hold scenario-management permission — edit the cell and press Save changes. For material or governed values, raise a change set in Assumptions & Change Sets instead so the change is validated, approved and auditable." },
  ],
  glossary: [
    { term: "Scenario", definition: "A named, internally consistent set of driver values representing one possible deal outcome." },
    { term: "Conservative", definition: "The credible downside case — plausible, with all unavoidable costs retained. Not an artificial failure case." },
    { term: "Base", definition: "The most supportable planning case, carrying the Baseline badge. Not an average of the other cases." },
    { term: "Upside", definition: "A better outcome that depends on defined enabling conditions being met." },
    { term: "Driver", definition: "An individual input value that defines part of a scenario — for example activation ramp, rebate rate or services attach." },
    { term: "Enabling Condition", definition: "A specific thing that must be true for a case to occur. Not stored as a field on this page; record it in the description or governance minutes." },
    { term: "Planning Case", definition: "The scenario the organisation plans against, approved through governance." },
    { term: "Active Scenario", definition: "The case the model treats as default, shown by the Baseline star badge on its card." },
    { term: "Scenario Integrity", definition: "The property of a case whose drivers all describe the same world and have not been mixed with values from other cases." },
    { term: "Scenario Rationale", definition: "The stated business reasoning for a case, held today in the scenario card description." },
  ],
  executiveTakeaway:
    "Scenarios is where the deal becomes decidable. Three whole cases — Conservative, Base and Upside — each defined by explicit drivers rather than by their names. Base carries the Baseline badge and should be the most supportable planning case, not a midpoint. Conservative must remain a credible downside with all unavoidable costs intact, and Upside must carry written enabling conditions. Never quote a number without naming its case, never mix values across cases, and never treat selecting a scenario as approving it — approval sits with governance and certification with Release & Activation.",
  keyRisks: [
    "Mixed inputs across cases producing a fictional, unattributable result.",
    "Base built as an aspirational midpoint rather than the supportable case.",
    "Upside used in negotiation without documented enabling conditions.",
    "Conservative understated by omitting unavoidable costs.",
    "Activation ramp accepted without a delivery-capacity check.",
    "Direct driver edits bypassing the governed change-set process, leaving no audit trail.",
    "Scenario outputs circulated without their case context attached.",
  ],

  /* ---------------- Show on page ---------------- */
  showOnPageTargets: [
    { targetId: "scenarios-summary", label: "Directional caveat", description: "Scope statement framing all scenario values as directional." },
    { targetId: "scenarios-cards", label: "Scenario cards", description: "Conservative, Base and Upside with codes, status and the Baseline badge." },
    { targetId: "scenarios-rationale", label: "Scenario rationale", description: "The description text stating what business conditions the case assumes." },
    { targetId: "scenarios-status", label: "Permission and unsaved-change status", description: "Editing enabled or view-only, plus the count of pending edits." },
    { targetId: "scenarios-detail", label: "Activation ramp", description: "Cumulative activated accounts FY2027–FY2031 per scenario." },
    { targetId: "scenarios-drivers", label: "Driver groups", description: "Renewal, rebate, services, funding and operating scope values per case." },
    { targetId: "scenarios-actions", label: "Seed and save actions", description: "The only actions on the page — seed the case set and save driver edits." },
    { targetId: "scenarios-validation", label: "Calculation notice", description: "Confirms no P&L, EBITDA, cash or payback output is computed here." },
  ],
};
