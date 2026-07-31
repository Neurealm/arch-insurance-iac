import type { CommercialGuideContent } from "../../types";

/**
 * Page-specific Commercial Guide content — Revenue (`/commercial/model/revenue`).
 *
 * Authored strictly against what `src/commercial/pages/CommercialRevenue.tsx`
 * actually renders:
 *
 *  - Directional banner, page header ("Project Momentous — Revenue Engine"),
 *    a permission-gated "Run all scenarios" action, draft-model-version and
 *    run-status alerts (current failure, completed run with input hash,
 *    superseded historical failure disclosure).
 *  - A Run header card: model version + formula catalog + status, scenario
 *    selector, last completed run timestamp, input hash and run scope.
 *  - Three metric tables across FY2027..FY2031 plus a 5-yr total column, each
 *    row exposing a formula-lineage popover:
 *      • Volume drivers — VOL-CUM-ACT, VOL-NEW-ACT, VOL-CONV-REBATE,
 *        VOL-CONV-EXPAND, VOL-CONV-MS.
 *      • Revenue base — REV-ACT-ARR, REV-INCR-ARR, REV-NEW-ACT-ARR,
 *        REV-EAR-INFLUENCED.
 *      • Revenue streams — the eleven modelled Neurealm lines REV-01..REV-11
 *        plus REV-TOTAL.
 *
 * Concepts requested but NOT present on this page (revenue by individual
 * account or cohort, trend charts, explicit recurring-vs-one-time or
 * concentration measures, revenue-at-risk) are recorded as known gaps or
 * described as off-page practice. No revenue stream, formula or figure is
 * invented, and this guide changes no calculation, run or data.
 */
export const commercialRevenueGuide: CommercialGuideContent = {
  pageId: "commercial-revenue",
  route: "/commercial/model/revenue",
  match: "exact",
  pageTitle: "Revenue",
  guideTitle: "Revenue — Where Neurealm's Money Actually Comes From",
  audiences: ["Commercial Lead", "Finance", "Executive", "Sales", "Delivery", "Operations", "Administrator"],
  modes: ["executive", "practitioner", "administrator"],
  estimatedReadingMinutes: 12,
  trainingLevel: "Intermediate",
  lastUpdated: "2026-07-31",

  /* ---------------- Overview ---------------- */
  purpose:
    "This page shows the server-calculated revenue Neurealm expects to earn under a chosen scenario. It separates the volume drivers that make accounts eligible, the ARR base those accounts represent, and the eleven modelled revenue lines that convert that base into Neurealm revenue across FY2027 to FY2031. It exists so the commercial position is read from one governed calculation rather than from spreadsheets, and so every figure is traceable to its formula.",
  represents:
    "The outputs of the latest completed revenue-scope model run for the selected scenario and model version: five volume-driver rows, four revenue-base rows, eleven revenue-stream rows and a total, each reported per fiscal year with a five-year figure and a formula-lineage record.",
  whyItMatters:
    "Portfolio ARR is customer spend; only a modelled share of it becomes Neurealm revenue. This page is the only place that distinction is calculated consistently. Everything downstream — cost, EBITDA, cash, scenario comparison and the executive recommendation — is built on these numbers, so an unsupported rate or an over-optimistic activation ramp here propagates through every commercial conclusion.",
  moduleConnection:
    "Revenue consumes the program and portfolio scope, the governed assumptions and their approved change sets, the scenario definition and the registered model version. It publishes its results to P&L (Cost & EBITDA), Cash & Sustainability, Scenario Comparison, Sensitivity Analysis, the Overview and Governance. Staffing & Resources reads the same activation and services volumes to test whether the revenue is deliverable. Nothing on this page can be edited directly: values change only by changing assumptions, scenarios or the model version and re-running.",
  questionsAnswered: [
    "What total revenue does the model expect Neurealm to earn over FY2027–FY2031?",
    "Which of the eleven modelled streams produces it?",
    "How many accounts must activate, and how many convert to rebate, expansion or managed services?",
    "In which fiscal year is each amount recognised?",
    "What conditions must be met before a stream contributes anything?",
    "How much is recurring licence-linked economics versus one-time or services revenue?",
    "Which assumptions carry the most uncertainty behind these figures?",
    "Are these numbers from a current, completed run on an activated model version?",
  ],
  expectedOutcome:
    "A defensible, scenario-explicit revenue position that reconciles to activation volumes and governed rates, with every unsupported driver routed to Assumptions or Sources before it is quoted externally.",
  lifecycleStages: [
    "Commercial Structuring",
    "Financial Modeling",
    "Executive Review",
    "Negotiation",
    "Delivery Planning",
    "Operations",
  ],
  prerequisites: [
    { id: "pre-1", label: "Bootstrapped program and portfolio", route: "/commercial/portfolio", detail: "Project Momentous must exist in the workspace with its account scope defined." },
    { id: "pre-2", label: "Scenario definition", route: "/commercial/scenarios", detail: "A scenario supplies the driver rates used by every stream formula." },
    { id: "pre-3", label: "Current governed assumptions", route: "/commercial/model/assumptions", detail: "Rates, mixes, activation ramp and services values must be current and approved." },
    { id: "pre-4", label: "Registered model version", route: "/commercial/model/release", detail: "Runs execute against a registered version; a draft version is flagged on the page." },
    { id: "pre-5", label: "Source support", route: "/commercial/sources", detail: "Every material rate should be traceable to a source document." },
    { id: "pre-6", label: "Completed revenue run", detail: "Results only render when a completed run exists for the selected scenario." },
    { id: "pre-7", label: "Run permission for recalculation", detail: "Triggering 'Run all scenarios' requires commercial.model.run; without it the page is view-only." },
  ],
  ownership: {
    businessOwner: "Commercial Lead",
    commercialOwner: "Commercial Lead",
    technicalOwner: "Model Administrator",
    executiveApprover: "Executive Sponsor",
    primaryUsers: ["Commercial Lead", "Finance", "Deal Lead", "Account Leads", "Customer Success", "Services Leadership"],
    consumersOfOutput: ["P&L (Cost & EBITDA)", "Cash & Sustainability", "Scenario Comparison", "Sensitivity Analysis", "Overview", "Governance", "Staffing & Resources"],
  },

  /* ---------------- How it works ---------------- */
  sections: [
    {
      id: "sec-context",
      title: "Scope and model context",
      explanation:
        "The header states the run scope and that calculations are server-authoritative: nothing is computed in the browser. It also states plainly that cost of delivery, OPEX, EBITDA, cash and sensitivity are not part of this scope. The directional banner above it marks all figures as directional. 'Run all scenarios' recalculates every scenario and is disabled without the run permission; identical inputs return a reused, idempotent result rather than a new one.",
      targetId: "revenue-context",
    },
    {
      id: "sec-summary",
      title: "Run header",
      explanation:
        "Model version with its formula-catalog version and status, the selected scenario, the last completed run timestamp with its short run id, the input hash and the run scope. This is the provenance block: if you quote a figure, quote it with this context. A draft model version raises an activation alert, and a failed run for this scenario raises a destructive alert unless a later successful run superseded it, in which case it appears only as a historical disclosure.",
      targetId: "revenue-summary",
    },
    {
      id: "sec-scenario",
      title: "Scenario selector",
      explanation:
        "Switches the displayed results between the program's scenarios; the baseline scenario is marked with a star. Every table below re-reads from the latest completed run for the selected scenario. Revenue differs by scenario because the scenario supplies the conversion percentages, mix rates, rebate rates and services values used by the formulas — so any comparison of two revenue figures is meaningless without naming the scenario.",
      targetId: "revenue-by-scenario",
    },
    {
      id: "sec-drivers",
      title: "Volume drivers",
      explanation:
        "The account counts that gate everything else: cumulative activated accounts, new accounts activated in the year, and the integer-rounded counts converting to licence rebate, to expansion or growth, and to managed services. These are outputs of the activation ramp and conversion percentages, not free inputs. If activation is wrong, every revenue line below is wrong in the same direction, and Staffing & Resources is sized against the same counts.",
      targetId: "revenue-drivers",
    },
    {
      id: "sec-base",
      title: "Revenue base",
      explanation:
        "Intermediate ARR figures — activated ARR base, in-year incremental ARR, new-account ARR, and the influenced renewal (EAR) pool. These are customer-side amounts, not Neurealm revenue. Each stream applies its own rate to the correct base, which is why the base rows are shown separately: an audit of any stream starts by confirming it was applied to the right base row and the right fiscal year.",
      targetId: "revenue-base",
    },
    {
      id: "sec-streams",
      title: "Revenue streams",
      explanation:
        "The eleven modelled Neurealm lines plus TOTAL, highlighted at the foot. Lines 1–6 are rebate, accelerator and growth-share economics; 7–9 are funding lines; 10 and 11 are managed and professional services, kept separate from licence economics. Each row carries its metric code and a lineage popover showing the inputs, formula and source cells the engine used. Streams are mutually exclusive by construction — the total is their sum, with nothing counted twice.",
      targetId: "revenue-by-stream",
    },
    {
      id: "sec-period",
      title: "Fiscal periods",
      explanation:
        "Columns run FY2027 through FY2031 with a five-year total. Recognition follows the modelled condition for each stream: renewal-linked revenue follows the influenced renewal pool for that year, expansion follows in-year incremental ARR, activation funding follows new accounts in the year they activate, and managed services follows converted accounts with an annual escalator applied by year index. Recognition timing here is not cash timing.",
      targetId: "revenue-by-period",
    },
    {
      id: "sec-renewal",
      title: "Renewal-linked revenue",
      explanation:
        "Line 1, the enhanced base / influenced renewal rebate, applies the base renewal rebate rate to the influenced portion of the renewal (EAR) pool for that fiscal year. It is the clearest example of the eligibility principle: Neurealm earns on the pool it is modelled to influence, not on the whole renewal book. Both the influence percentage and the rebate rate are scenario-driven assumptions and should be source-supported before use.",
      targetId: "revenue-renewal",
    },
    {
      id: "sec-expansion",
      title: "Expansion and growth revenue",
      explanation:
        "Lines 3 and 4 split in-year incremental ARR between the non-Flex mix and the remaining Flex mix, each with its own rebate rate. Line 5, the strategic growth accelerator, contributes only when the incremental ARR growth rate exceeds the modelled threshold — otherwise it is zero. Line 6 is growth-share on incremental ARR and is flagged as an approximation in its lineage. Line 2 applies the marketplace mix and rebate rate to new-account ARR.",
      targetId: "revenue-expansion",
    },
    {
      id: "sec-services",
      title: "Services revenue",
      explanation:
        "Line 10 is managed-services revenue: accounts converting to managed services, times the annual revenue per account, escalated by year index. Line 11 is one-time professional services on newly activated accounts. Both are services revenue and are deliberately kept apart from licence economics because they consume delivery capacity. They should never be read without checking Staffing & Resources — modelled services revenue that delivery cannot resource is not achievable revenue.",
      targetId: "revenue-services",
    },
    {
      id: "sec-funding",
      title: "Funding lines",
      explanation:
        "Line 7, the Activation Fund, pays per newly activated account. Line 8, MDF / co-sell funding, and line 9, the Support Readiness Fund / retainer, are flat annual amounts. They are modelled as revenue lines inside the total, so they must not also be netted against cost elsewhere or the same money is counted twice. Funding that has not been contractually agreed should be treated as an unapproved driver and raised in Governance.",
      targetId: "revenue-funding",
    },
    {
      id: "sec-detail",
      title: "Total and lineage",
      explanation:
        "TOTAL Neurealm revenue is the sum of lines 1 to 11 for that fiscal year, with a five-year figure in the final column. Every row — including the total — exposes a formula-lineage popover containing the engine's captured inputs, formula, source cells and any approximation flag. That popover is the reconciliation tool: if a figure is challenged, open the lineage rather than rebuilding the arithmetic by hand.",
      targetId: "revenue-detail",
    },
  ],
  inputs: [
    { id: "in-1", label: "Account scope", description: "The program portfolio that defines which accounts can ever contribute revenue.", owner: "Commercial Lead", source: "Portfolio", required: true },
    { id: "in-2", label: "Activation ramp", description: "Cumulative and new activated accounts per fiscal year — the gate on every stream.", owner: "Customer Success", source: "Assumptions", required: true },
    { id: "in-3", label: "Conversion percentages", description: "Share of activated accounts generating licence rebate, expansion and managed services.", owner: "Commercial Lead", source: "Assumptions", required: true },
    { id: "in-4", label: "Average ARR per customer", description: "Converts account counts into the activated and new-account ARR bases.", owner: "Finance", source: "Assumptions", required: true },
    { id: "in-5", label: "Renewal (EAR) pool by year", description: "The renewal book available per fiscal year before influence is applied.", owner: "Finance", source: "Sources", required: true },
    { id: "in-6", label: "Renewal influence percentage", description: "Share of the renewal pool Neurealm is modelled to influence.", owner: "Commercial Lead", source: "Scenario drivers", required: true },
    { id: "in-7", label: "Base renewal rebate rate", description: "Rate applied to the influenced renewal pool for stream 1.", owner: "Commercial Lead", source: "Scenario drivers", required: true },
    { id: "in-8", label: "Marketplace mix and rebate rate", description: "Drives stream 2 from new-account ARR.", owner: "Commercial Lead", source: "Scenario drivers" },
    { id: "in-9", label: "Non-Flex mix and expansion rebate rates", description: "Splits incremental ARR across streams 3 and 4 with their respective rates.", owner: "Commercial Lead", source: "Scenario drivers" },
    { id: "in-10", label: "Incremental ARR growth rate and accelerator threshold", description: "Sets in-year expansion ARR and whether stream 5 triggers at all.", owner: "Finance", source: "Assumptions / scenario drivers" },
    { id: "in-11", label: "Growth-share rate", description: "Applied to incremental ARR for stream 6; flagged as an approximation.", owner: "Finance", source: "Scenario drivers" },
    { id: "in-12", label: "Activation fund per account", description: "Per-new-account funding for stream 7.", owner: "Commercial Lead", source: "Scenario drivers" },
    { id: "in-13", label: "MDF / co-sell and support readiness amounts", description: "Flat annual funding values for streams 8 and 9.", owner: "Commercial Lead", source: "Scenario drivers" },
    { id: "in-14", label: "Managed-services annual revenue per account", description: "With the cost escalator applied by year index, drives stream 10.", owner: "Services Leadership", source: "Scenario drivers" },
    { id: "in-15", label: "Professional-services one-time value per account", description: "Applied to newly activated accounts for stream 11.", owner: "Services Leadership", source: "Scenario drivers" },
    { id: "in-16", label: "Selected scenario", description: "Determines which set of driver values the run used.", owner: "Commercial Lead", source: "Scenarios", required: true },
    { id: "in-17", label: "Model version", description: "The registered version and formula catalog the run executed against.", owner: "Model Administrator", source: "Release & Activation", required: true },
  ],
  outputs: [
    { id: "out-1", label: "TOTAL Neurealm revenue", description: "Sum of streams 1–11 per fiscal year and across five years.", consumedBy: ["P&L (Cost & EBITDA)", "Overview", "Scenario Comparison"] },
    { id: "out-2", label: "Revenue by fiscal period", description: "FY2027–FY2031 columns showing the recognition profile.", consumedBy: ["Cash & Sustainability", "Staffing & Resources"] },
    { id: "out-3", label: "Revenue by stream", description: "Eleven modelled lines separating rebate, funding and services economics.", consumedBy: ["Governance", "Scenario Comparison"] },
    { id: "out-4", label: "Volume driver counts", description: "Cumulative, new, rebate-eligible, expansion and managed-services account counts.", consumedBy: ["Staffing & Resources", "P&L (Cost & EBITDA)"] },
    { id: "out-5", label: "Revenue base ARR figures", description: "Activated, incremental, new-account and influenced renewal ARR.", consumedBy: ["Finance review", "Sensitivity Analysis"] },
    { id: "out-6", label: "Services revenue", description: "Managed-services and professional-services lines held separate from licence economics.", consumedBy: ["Staffing & Resources", "Services Leadership"] },
    { id: "out-7", label: "Formula lineage", description: "Per-row inputs, formula, source cells and approximation flags.", consumedBy: ["Governance", "Audit"] },
    { id: "out-8", label: "Run provenance", description: "Model version, scenario, input hash, run scope and completion timestamp.", consumedBy: ["Governance", "Release & Activation"] },
  ],
  businessRules: [
    { id: "br-1", rule: "Portfolio ARR is not Neurealm revenue.", explanation: "The revenue-base rows are customer-side ARR. Neurealm revenue is only what the eleven stream formulas produce after rates, mixes and influence percentages are applied." },
    { id: "br-2", rule: "Only activated and converted accounts generate revenue.", explanation: "Volume drivers gate every stream. An account in the portfolio that never activates contributes nothing, and conversion counts are integer-rounded before use." },
    { id: "br-3", rule: "Streams are not double counted.", explanation: "Each of the eleven lines applies a distinct rate to a distinct base. TOTAL is their sum; the same economics must never be represented in two lines." },
    { id: "br-4", rule: "Funding lines are modelled as revenue.", explanation: "Activation Fund, MDF / co-sell and Support Readiness appear inside TOTAL. They must not also be netted against costs elsewhere." },
    { id: "br-5", rule: "Services revenue is kept separate from licence economics.", explanation: "Managed and professional services are reported as lines 10 and 11 precisely because they consume delivery capacity and behave differently from rebate economics." },
    { id: "br-6", rule: "The growth accelerator is conditional.", explanation: "Stream 5 contributes only when the incremental ARR growth rate exceeds the modelled threshold; below it the line is zero, which is a correct result, not a data gap." },
    { id: "br-7", rule: "Recognition follows the modelled condition, not intent.", explanation: "Each stream is recognised in the fiscal year its driver occurs — activation, renewal influence or in-year expansion — regardless of when the team expects to be paid." },
    { id: "br-8", rule: "Revenue recognition is not cash receipt.", explanation: "Payment lag and working capital are modelled on Cash & Sustainability. A strong revenue year can still be cash-negative." },
    { id: "br-9", rule: "Scenario context must always be stated.", explanation: "Driver rates come from the scenario. Any figure quoted without the scenario name and model version is unusable for decision making." },
    { id: "br-10", rule: "Results are read-only outputs of a completed run.", explanation: "Nothing on this page is editable. Values change only through Assumptions change sets, scenario changes or a new model version, followed by a re-run." },
    { id: "br-11", rule: "Approximations must stay visible.", explanation: "The growth-share line is flagged as an approximation in its lineage. That flag travels with the number and must be repeated whenever the figure is presented." },
    { id: "br-12", rule: "Draft model versions are not an authoritative baseline.", explanation: "The page warns when the version is a draft. Calculations succeeding does not activate a model; governed activation is required first." },
    { id: "br-13", rule: "Unsupported or unapproved rates must be labelled.", explanation: "A rate without a source or an approved change set is directional only and must be raised in Governance before external use." },
    { id: "br-14", rule: "Revenue must be read alongside delivery capacity.", explanation: "Services and activation-linked revenue imply staffing. Revenue the delivery organisation cannot resource is not a commercial position." },
    { id: "br-15", rule: "Rows must reconcile to lineage.", explanation: "Every figure carries its inputs, formula and source cells. If a row cannot be reconciled from its lineage, it must not be quoted." },
  ],
  calculationLogic: [
    "Volume drivers come first: cumulative activated accounts, new accounts activated, and the integer-rounded conversion counts for rebate, expansion and managed services.",
    "Revenue-base rows convert those counts into ARR: activated ARR base, in-year incremental ARR, new-account ARR, and the influenced renewal (EAR) pool.",
    "Each of the eleven streams applies its scenario rate to the correct base row for that fiscal year.",
    "The strategic growth accelerator is conditional on the incremental ARR growth rate exceeding the modelled threshold.",
    "Managed-services revenue applies an annual escalator by year index; professional services is one-time on newly activated accounts.",
    "TOTAL Neurealm revenue is the sum of streams 1 to 11 per fiscal year, with a five-year total column.",
    "All calculation happens server-side in the revenue-scope engine; the browser renders stored results only.",
    "Runs are idempotent: identical assumptions and model version return a reused result rather than writing a new one.",
  ],
  relationship: {
    receivesFrom: [
      "Program",
      "Portfolio",
      "Sources",
      "Assumptions & Change Sets",
      "Scenarios",
      "Release & Activation",
      "Renewal (EAR) pool timing",
      "Services scope and attach assumptions",
      "Commercial terms and rates",
    ],
    models: [
      "Volume drivers by fiscal year",
      "Revenue-base ARR figures",
      "Eleven modelled revenue streams",
      "Total revenue by period and across five years",
      "Revenue mix between licence economics, funding and services",
      "Recognition timing by stream",
      "Formula lineage and run provenance",
    ],
    feeds: [
      "P&L (Cost & EBITDA)",
      "Cash & Sustainability",
      "Scenario Comparison",
      "Sensitivity Analysis",
      "Overview",
      "Governance",
      "Staffing & Resources",
    ],
  },
  downstreamImpacts: [
    { area: "Revenue", effect: "Sets the top line every other commercial output is measured against." },
    { area: "Costs", effect: "Volume drivers size delivery roles, so revenue and cost move together." },
    { area: "EBITDA", effect: "Revenue enters P&L directly; higher revenue does not guarantee higher EBITDA." },
    { area: "Cash", effect: "Recognition feeds the cash model, where payment lag can turn a strong year cash-negative." },
    { area: "Staffing", effect: "Services and activation volumes imply the pod and delivery staffing plan." },
    { area: "Capacity", effect: "Managed and professional services revenue must be matched by deliverable capacity." },
    { area: "Governance", effect: "Unsupported rates and approximation flags become governance items." },
    { area: "Risk", effect: "Concentration in a small number of streams or a steep back-half ramp is a commercial risk." },
  ],
  dataQuality: {
    dataSources: [
      "Governed scenario assumptions and approved change sets",
      "Activation ramp and conversion percentages",
      "Renewal (EAR) pool values by fiscal year",
      "Registered model version and formula catalog",
      "Completed revenue-scope model runs and their stored results",
    ],
    updateFrequency: "On demand — results change only when a new run completes for the selected scenario and model version.",
    knownGaps: [
      "No revenue breakdown by individual account or cohort is rendered on this page; account-level facts live in Portfolio.",
      "No trend chart — results are presented as fiscal-year tables only.",
      "No explicit recurring versus one-time classification field; the split must be read from the stream definitions.",
      "No revenue concentration measure and no revenue-at-risk metric are calculated here.",
      "The growth-share line is an explicit approximation and is flagged as such in its lineage.",
      "Cost of delivery, OPEX, EBITDA, cash and sensitivity are outside this page's run scope.",
    ],
    changeControl: "Figures cannot be edited here. Changes require an approved assumption change set, a scenario change, or a new model version, followed by a re-run by a user holding commercial.model.run.",
    lineage: "Every row exposes a formula-lineage popover with the engine's captured inputs, formula, source cells and approximation flags; each run carries a model version, scenario, run scope and deterministic input hash.",
  },
  modelConfidence: "Medium",
  confidenceBasis: ["Revenue assumptions", "Account data", "Commercial terms", "Timing", "Source completeness"],
  confidenceGuidance:
    "Calculation confidence is high — the engine is server-authoritative, deterministic and lineage-complete. Input confidence is the constraint: activation pace, renewal influence, rebate rates and services attach are negotiated or estimated values. Treat the arithmetic as reliable and the drivers as the thing to challenge, and downgrade confidence whenever the model version is still a draft.",
  commercialReadiness: "Review Required",
  readinessCriteria: [
    "A completed run exists for the selected scenario with no current failure alert.",
    "The model version is activated, not draft.",
    "Activation and conversion assumptions have named owners.",
    "Rebate, mix and influence rates are source-supported or approved.",
    "Services values are validated by Services Leadership and matched to capacity.",
    "Funding lines reflect contractually plausible commitments.",
    "Approximation flags are disclosed wherever figures are presented.",
  ],

  /* ---------------- How to use it ---------------- */
  workflow: [
    { id: "wf-1", step: 1, title: "Confirm scenario and model version", description: "Read the run header: scenario, model version, status and formula catalog. Resolve any draft-version warning before quoting figures.", role: "Commercial Lead" },
    { id: "wf-2", step: 2, title: "Confirm the run is current", description: "Check the completed-run alert, its timestamp and input hash. A current failure alert means no figure on the page should be used.", role: "Model Administrator" },
    { id: "wf-3", step: 3, title: "Confirm portfolio scope", description: "Verify in Portfolio that the account scope behind the activation ramp is the intended one.", role: "Account Leads" },
    { id: "wf-4", step: 4, title: "Review volume drivers", description: "Check cumulative and new activation, then the rebate, expansion and managed-services conversion counts for plausibility.", role: "Customer Success" },
    { id: "wf-5", step: 5, title: "Review the revenue base", description: "Confirm activated ARR, incremental ARR, new-account ARR and the influenced renewal pool before looking at any stream.", role: "Finance" },
    { id: "wf-6", step: 6, title: "Review rate and mix assumptions", description: "Open the lineage on each material stream and confirm the rate applied and the base it was applied to.", role: "Commercial Lead" },
    { id: "wf-7", step: 7, title: "Review services lines", description: "Validate managed-services per-account value, escalation and the one-time professional-services value with Services Leadership.", role: "Services Leadership" },
    { id: "wf-8", step: 8, title: "Review funding lines", description: "Confirm activation fund, MDF and support readiness amounts are agreed and are not also netted against cost elsewhere.", role: "Finance" },
    { id: "wf-9", step: 9, title: "Check recognition timing", description: "Read across FY2027–FY2031 and confirm each stream lands in the year its modelled condition occurs.", role: "Finance" },
    { id: "wf-10", step: 10, title: "Assess mix and dependency", description: "Judge how much of the total depends on a single stream, on the activation ramp, or on back-half years.", role: "Commercial Lead" },
    { id: "wf-11", step: 11, title: "Test against delivery capacity", description: "Compare services and activation volumes with Staffing & Resources before accepting the position.", role: "Delivery" },
    { id: "wf-12", step: 12, title: "Continue to P&L and Cash", description: "Read cost, EBITDA and cash timing before drawing any commercial conclusion from revenue alone.", role: "Finance" },
    { id: "wf-13", step: 13, title: "Route unsupported drivers", description: "Send weak rates to Sources for evidence or Assumptions for a governed change set, and record material items in Governance.", role: "Commercial Lead" },
  ],
  actionsAvailable: [
    "Switch the displayed scenario.",
    "Trigger 'Run all scenarios' with the commercial.model.run permission.",
    "Open the formula-lineage popover on any row.",
    "Expand the historical run-issue disclosure when a failure was superseded.",
    "Read the input hash and run scope for reproducibility.",
  ],
  teamActivities: [
    { id: "ta-1", activity: "Validate rebate rates, mixes and eligibility", role: "Commercial Lead", cadence: "Each material model revision" },
    { id: "ta-2", activity: "Validate calculation treatment and recognition timing", role: "Finance", cadence: "Each material model revision" },
    { id: "ta-3", activity: "Validate account facts behind the activation ramp", role: "Account Leads", cadence: "Monthly" },
    { id: "ta-4", activity: "Validate services scope, attach and per-account values", role: "Services Leadership", cadence: "Each model revision" },
    { id: "ta-5", activity: "Validate activation and adoption assumptions", role: "Customer Success", cadence: "Monthly" },
    { id: "ta-6", activity: "Test revenue against delivery capacity", role: "Delivery", cadence: "Each model revision" },
    { id: "ta-7", activity: "Approve material commercial assumptions", role: "Governance", cadence: "Before executive review" },
    { id: "ta-8", activity: "Approve the commercial position", role: "Executive Sponsor", cadence: "At decision points" },
  ],
  roles: [
    { role: "Commercial Lead", responsibility: "Owns the revenue position, the rate structure and stream eligibility." },
    { role: "Finance", responsibility: "Owns calculation treatment, recognition timing and reconciliation to the model." },
    { role: "Deal Lead", responsibility: "Uses stream economics to shape and defend the negotiating position." },
    { role: "Account Leads", responsibility: "Own the account facts and renewal timing feeding the activation ramp." },
    { role: "Customer Success", responsibility: "Owns activation and adoption assumptions and their realism." },
    { role: "Services Leadership", responsibility: "Owns managed and professional services scope, attach and values." },
    { role: "Executive Sponsor", responsibility: "Approves the commercial position and accepts the residual risk." },
    { role: "Model Administrator", responsibility: "Owns model version registration, run execution and run integrity." },
  ],
  raci: [
    { activity: "Set rebate, mix and influence rates", assignments: [{ role: "Commercial Lead", raci: "R" }, { role: "Executive Sponsor", raci: "A" }, { role: "Finance", raci: "C" }, { role: "Deal Lead", raci: "I" }] },
    { activity: "Validate recognition timing", assignments: [{ role: "Finance", raci: "R" }, { role: "Commercial Lead", raci: "A" }, { role: "Account Leads", raci: "C" }, { role: "Executive Sponsor", raci: "I" }] },
    { activity: "Validate activation ramp", assignments: [{ role: "Customer Success", raci: "R" }, { role: "Commercial Lead", raci: "A" }, { role: "Account Leads", raci: "C" }, { role: "Delivery", raci: "I" }] },
    { activity: "Validate services revenue", assignments: [{ role: "Services Leadership", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Delivery", raci: "C" }, { role: "Commercial Lead", raci: "I" }] },
    { activity: "Execute and certify model runs", assignments: [{ role: "Model Administrator", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Commercial Lead", raci: "C" }, { role: "Executive Sponsor", raci: "I" }] },
    { activity: "Approve the commercial position", assignments: [{ role: "Executive Sponsor", raci: "A" }, { role: "Commercial Lead", raci: "R" }, { role: "Finance", raci: "C" }, { role: "Delivery", raci: "I" }] },
  ],
  reviewRequirements: [
    "Run header reviewed before any figure is quoted.",
    "Volume drivers reviewed with Customer Success.",
    "Rate and base pairing checked via lineage for every material stream.",
    "Services lines reviewed with Services Leadership and Delivery.",
    "Recognition timing reviewed with Finance.",
    "Approximation flags reviewed and disclosed.",
  ],
  approvalRequirements: [
    "Material rate changes approved through an assumption change set.",
    "Model version activated through Release & Activation before baseline use.",
    "Funding assumptions confirmed as contractually plausible.",
    "Executive Sponsor approval of the revenue position before external commitment.",
  ],
  decisions: [
    { id: "dec-1", decision: "Whether the modelled revenue position is defensible for executive review.", decidedBy: "Executive Sponsor", evidence: "Completed run on an activated version with source-supported rates." },
    { id: "dec-2", decision: "Which streams to prioritise in negotiation.", decidedBy: "Commercial Lead", evidence: "Stream mix, five-year totals and sensitivity results." },
    { id: "dec-3", decision: "Whether services revenue is achievable.", decidedBy: "Services Leadership", evidence: "Managed and professional services lines tested against Staffing & Resources." },
    { id: "dec-4", decision: "Whether an assumption must change.", decidedBy: "Finance", evidence: "Lineage review plus source support, raised as a change set." },
  ],
  whatToDoNext: [
    "Open P&L (Cost & EBITDA) to see what this revenue costs to deliver.",
    "Open Cash & Sustainability to see when the money actually arrives.",
    "Open Sensitivity Analysis to find which driver moves the total most.",
    "Open Scenario Comparison to see the range across scenarios.",
    "Open Staffing & Resources to test deliverability.",
    "Raise unsupported drivers in Assumptions or Sources.",
  ],
  relatedPages: [
    { pageId: "commercial-portfolio", label: "Portfolio", route: "/commercial/portfolio", relationship: "Prerequisite" },
    { pageId: "commercial-assumptions", label: "Assumptions & Change Sets", route: "/commercial/model/assumptions", relationship: "Upstream" },
    { pageId: "commercial-scenarios", label: "Scenarios", route: "/commercial/scenarios", relationship: "Upstream" },
    { pageId: "commercial-sources", label: "Sources", route: "/commercial/sources", relationship: "Upstream" },
    { pageId: "commercial-release", label: "Release & Activation", route: "/commercial/model/release", relationship: "Upstream" },
    { pageId: "commercial-pnl", label: "P&L (Cost & EBITDA)", route: "/commercial/model/pnl", relationship: "Downstream" },
    { pageId: "commercial-cash", label: "Cash & Sustainability", route: "/commercial/model/cash", relationship: "Downstream" },
    { pageId: "commercial-compare", label: "Scenario Comparison", route: "/commercial/model/compare", relationship: "Downstream" },
    { pageId: "commercial-sensitivity", label: "Sensitivity Analysis", route: "/commercial/model/sensitivity", relationship: "Downstream" },
    { pageId: "commercial-staffing-resources", label: "Staffing & Resources", route: "/commercial/staffing-resources", relationship: "Companion" },
  ],

  /* ---------------- Interpretation & training ---------------- */
  interpretation: [
    {
      band: "healthy",
      label: "Revenue is defensible",
      criteria: [
        "Revenue reconciles to activation volumes and the revenue base.",
        "Streams are distinct and the total is their clean sum.",
        "Recognition timing follows the modelled condition for each stream.",
        "Rates are source-supported or carried by an approved change set.",
        "Services revenue is matched by validated delivery capacity.",
        "The mix and its dependencies are understood and stated.",
        "Cash timing has been reviewed separately.",
      ],
      action: "Proceed to P&L and Cash, and present the position with its scenario, model version and approximation flags.",
    },
    {
      band: "warning",
      label: "Review before relying on it",
      criteria: [
        "Revenue depends heavily on a low-confidence activation ramp.",
        "Services attach implies more delivery capacity than exists.",
        "The total leans on one or two streams or on back-half years.",
        "Renewal pool timing is estimated rather than sourced.",
        "Funding lines are assumed rather than agreed.",
        "The model version is still a draft.",
      ],
      action: "Assign owners to the weak drivers, gather source support, and run sensitivity before executive review.",
    },
    {
      band: "critical",
      label: "Do not use",
      criteria: [
        "Ineligible or non-activating accounts are contributing revenue.",
        "The same economics appear in more than one stream.",
        "Portfolio ARR is being presented as Neurealm revenue.",
        "Revenue is shown before its modelled condition occurs.",
        "An unsupported driver is what makes the recommendation work.",
        "Rows cannot be reconciled to their lineage, or the current run failed.",
      ],
      action: "Stop external use immediately, correct the inputs through change control, re-run, and record the issue in Governance.",
    },
  ],
  commonMistakes: [
    { id: "cm-1", description: "Quoting portfolio ARR as revenue to Neurealm.", correction: "ARR is customer spend. Neurealm revenue is only what the eleven stream formulas produce after rates and influence are applied." },
    { id: "cm-2", description: "Treating recognised revenue as cash in the bank.", correction: "Recognition follows the modelled condition; receipt follows payment lag. Read Cash & Sustainability before making any liquidity claim." },
    { id: "cm-3", description: "Counting funding lines twice — once as revenue and again as a cost offset.", correction: "Activation Fund, MDF and Support Readiness are already inside TOTAL. Never net them against cost as well." },
    { id: "cm-4", description: "Treating services opportunity as booked services revenue.", correction: "Lines 10 and 11 are modelled outputs of conversion assumptions, not signed work. Validate scope and capacity before presenting them." },
    { id: "cm-5", description: "Raising activation without raising delivery capacity.", correction: "Activation drives both revenue and cost. Test any ramp change against Staffing & Resources and P&L in the same review." },
    { id: "cm-6", description: "Applying a rebate rate to the wrong base.", correction: "Open the lineage popover and confirm which base row the rate was applied to — renewal pool, incremental ARR or new-account ARR." },
    { id: "cm-7", description: "Ignoring renewal timing when reading stream 1.", correction: "Renewal-linked revenue follows the influenced renewal pool for that fiscal year. Wrong timing moves revenue between years." },
    { id: "cm-8", description: "Comparing revenue figures from different scenarios or model versions.", correction: "Always state the scenario and model version from the run header; use Scenario Comparison for structured comparison." },
  ],
  bestPractices: [
    "Read the run header before reading any number.",
    "Work top-down: volume drivers, then revenue base, then streams.",
    "Open the lineage popover whenever a figure is challenged.",
    "State the scenario, model version and approximation flags every time you present.",
    "Review services lines with Delivery in the same session.",
    "Treat funding lines as conditional until contractually agreed.",
    "Never present revenue without cost and cash alongside it.",
    "Route weak drivers to Sources or Assumptions the same day.",
  ],
  workedExamples: [
    {
      id: "we-1",
      title: "What happens if activation increases",
      narrative:
        "Suppose the team argues for a faster activation ramp. Nothing changes on this page directly — the ramp is a governed assumption, so the change runs through Assumptions & Change Sets and a re-run. Once the run completes, read the effects in order. Volume drivers rise: cumulative and new activated accounts increase, and because the conversion percentages are applied to those counts, the rebate, expansion and managed-services counts rise too. The revenue base rises with them, so activated ARR, new-account ARR and in-year incremental ARR all increase. Streams then move: renewal-linked and expansion rebates grow with their bases, the Activation Fund grows with new accounts, professional services grows one-time with new activations, and managed services grows with converted accounts and the year escalator. TOTAL rises. That is only half the picture. The same volume drivers size delivery roles in P&L, so cost of delivery rises as well, and EBITDA may not improve. Cash typically worsens first, because staffing is paid before rebate and services receipts arrive. Delivery risk increases if the ramp exceeds what Staffing & Resources can resource. Review P&L, Cash, Scenario Comparison, Staffing and the Overview before concluding anything: a higher revenue total is not automatically a better commercial position.",
      steps: [
        "Raise the ramp change as a governed change set, not as an edit here.",
        "Re-run and confirm a completed run on the selected scenario.",
        "Read volume drivers, then revenue base, then the affected streams.",
        "Open P&L to see the cost the same volumes create.",
        "Open Cash to see the timing gap before receipts.",
        "Test the ramp against Staffing & Resources capacity.",
        "Compare against the prior scenario before recommending.",
      ],
      result:
        "A higher modelled revenue total whose commercial value is only established once cost, cash, capacity and risk have been read alongside it.",
    },
  ],
  faqs: [
    { id: "faq-1", question: "Why is Portfolio ARR higher than revenue?", answer: "Portfolio ARR is what customers spend. Neurealm earns a modelled share of it: a rebate on the influenced portion of the renewal pool, rates on expansion and new-account ARR, plus funding and services lines. The revenue-base rows show the customer-side ARR; the stream rows show what converts into Neurealm revenue." },
    { id: "faq-2", question: "What drives renewal revenue?", answer: "Stream 1 applies the base renewal rebate rate to the influenced portion of the renewal (EAR) pool for that fiscal year. Three things move it: the pool value by year, the renewal influence percentage, and the rebate rate. All three are scenario or assumption values and should be source-supported." },
    { id: "faq-3", question: "What drives expansion revenue?", answer: "In-year incremental ARR, split between the non-Flex mix and the remaining Flex mix with their own rebate rates (streams 3 and 4), plus growth-share on incremental ARR (stream 6) and a strategic growth accelerator (stream 5) that only contributes when the incremental ARR growth rate exceeds the modelled threshold." },
    { id: "faq-4", question: "When does services revenue begin?", answer: "Professional services (stream 11) is one-time and follows newly activated accounts in the year they activate. Managed services (stream 10) follows the accounts that convert to managed services, with an annual escalator applied by year index. Both depend on activation happening first." },
    { id: "faq-5", question: "Is funding revenue?", answer: "In this model, yes. The Activation Fund, MDF / co-sell funding and the Support Readiness Fund are modelled as revenue lines 7, 8 and 9 and are included in TOTAL. Because of that treatment they must never also be netted against costs, or the same money is counted twice." },
    { id: "faq-6", question: "Why does revenue change by scenario?", answer: "The scenario supplies the driver values: activation ramp, conversion percentages, mixes, rebate rates, growth rates and services values. Changing scenario changes the inputs to every stream formula. The formulas themselves are fixed by the model version shown in the run header." },
    { id: "faq-7", question: "Why can revenue rise while EBITDA falls?", answer: "Because the same volume drivers that generate revenue also size delivery. More activated accounts mean more pods, more support and more services delivery. If the incremental cost per account exceeds the incremental revenue per account, EBITDA falls even as the top line grows. Read P&L, never revenue alone." },
    { id: "faq-8", question: "Where should a revenue assumption be changed?", answer: "Not here — this page is read-only output. Rates, mixes, activation and services values are changed through a governed change set in Assumptions & Change Sets, with evidence in Sources. After approval, re-run the model and read the new results on this page." },
  ],
  glossary: [
    { term: "ARR", definition: "Annual Recurring Revenue — the customer-side recurring spend that forms the base for Neurealm's rate-driven revenue lines. Not Neurealm revenue." },
    { term: "Revenue Recognition", definition: "The fiscal year in which the model records a stream, determined by the modelled condition — activation, renewal influence or in-year expansion — not by payment." },
    { term: "Base Rebate", definition: "Stream 1: the enhanced base / influenced renewal rebate, applied to the influenced portion of the renewal (EAR) pool." },
    { term: "Growth Share", definition: "Stream 6: a share of in-year incremental ARR. Flagged in lineage as an approximation of the workbook treatment." },
    { term: "Expansion Revenue", definition: "Streams 3 and 4: non-Flex and Flex expansion rebates applied to in-year incremental ARR at their respective rates." },
    { term: "Professional Services", definition: "Stream 11: one-time services revenue earned on newly activated accounts." },
    { term: "Managed Services", definition: "Stream 10: recurring services revenue from accounts converting to managed services, escalated annually by year index." },
    { term: "Services Attach", definition: "The conversion percentage that determines how many activated accounts buy managed services in a given year." },
    { term: "Recurring Revenue", definition: "Streams that repeat while the underlying condition holds — renewal-linked rebate, managed services and flat annual funding — as distinct from one-time lines." },
    { term: "Revenue Concentration", definition: "The degree to which the total depends on a small number of streams, accounts or fiscal years. Assessed by reading the tables; not calculated on this page." },
    { term: "Volume Driver", definition: "An account-count output — cumulative, new, or converted — that gates which streams can contribute in a fiscal year." },
    { term: "Input Hash", definition: "The deterministic fingerprint of a run's inputs. Identical inputs reuse the prior result, making runs idempotent and reproducible." },
  ],
  executiveTakeaway:
    "This is the modelled top line and the reason to believe it. Neurealm earns a share of customer ARR through eleven distinct lines — renewal and expansion rebates, growth share, three funding lines, and managed and professional services — all gated by how many accounts actually activate and convert. Every figure is server-calculated, scenario-specific and traceable to its formula, but the drivers behind it are negotiated estimates. Read it with cost, cash and delivery capacity: a bigger revenue number produced by a faster ramp usually costs more, arrives later in cash, and carries more delivery risk.",
  keyRisks: [
    "Activation ramp proves slower than modelled, deflating every stream at once.",
    "Renewal influence or rebate rates are not contractually supported.",
    "Services revenue exceeds the capacity Delivery can resource.",
    "Funding lines assumed but never agreed.",
    "Figures quoted from a draft model version or a superseded run.",
    "Growth-share approximation presented as an exact entitlement.",
    "Revenue read in isolation from cost, cash and staffing.",
  ],

  /* ---------------- Show on page ---------------- */
  showOnPageTargets: [
    { targetId: "revenue-context", label: "Scope and model context", description: "Header stating the revenue run scope, server-authoritative calculation and the run action." },
    { targetId: "revenue-summary", label: "Run header", description: "Model version, scenario, last completed run, input hash and run scope." },
    { targetId: "revenue-by-scenario", label: "Scenario selector", description: "Switches results between the program's scenarios; the baseline is starred." },
    { targetId: "revenue-drivers", label: "Volume drivers", description: "Cumulative, new and converted account counts that gate every revenue stream." },
    { targetId: "revenue-base", label: "Revenue base", description: "Activated, incremental and new-account ARR plus the influenced renewal pool." },
    { targetId: "revenue-by-stream", label: "Revenue streams", description: "The eleven modelled Neurealm revenue lines plus the total." },
    { targetId: "revenue-by-period", label: "Fiscal periods", description: "FY2027–FY2031 columns and the five-year total column." },
    { targetId: "revenue-renewal", label: "Renewal-linked revenue", description: "Stream 1 — enhanced base / influenced renewal rebate." },
    { targetId: "revenue-expansion", label: "Expansion revenue", description: "Stream 3 — non-Flex expansion rebate, alongside the Flex, accelerator and growth-share lines." },
    { targetId: "revenue-services", label: "Services revenue", description: "Stream 10 — managed-services revenue, shown next to one-time professional services." },
    { targetId: "revenue-funding", label: "Funding lines", description: "Stream 7 — Activation Fund, alongside MDF / co-sell and Support Readiness." },
    { targetId: "revenue-detail", label: "Total and lineage", description: "TOTAL Neurealm revenue with the per-row formula-lineage popover." },
  ],
};
