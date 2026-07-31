import type { CommercialGuideContent } from "../../types";

/**
 * Page-specific Commercial Guide content — P&L (Cost & EBITDA)
 * (`/commercial/model/pnl`).
 *
 * Authored strictly against what `src/commercial/pages/CommercialPnl.tsx`
 * actually renders:
 *
 *  - Directional banner, page header ("Project Momentous — Cost, OPEX &
 *    EBITDA"), a permission-gated "Run P&L (all scenarios)" action, and run
 *    status alerts (current failure, completed run with input hash, missing
 *    upstream revenue run, no completed P&L run).
 *  - A Run header card with the model version, scenario selector, upstream
 *    revenue run, input hash and timestamp.
 *  - Four metric tables across FY2027..FY2031 plus a 5-yr total column, each
 *    row exposing a formula-lineage popover:
 *      • P&L summary — PL-GROSS-PROFIT, PL-GROSS-MARGIN-PCT, PL-EBITDA,
 *        PL-EBITDA-MARGIN-PCT.
 *      • Cost of Delivery — COD-01..COD-11 plus COD-TOTAL.
 *      • Operating Expenses — OPEX-01..OPEX-10 plus OPEX-TOTAL.
 *      • Staffing memo — POD-FTE (informational FTE, not cost).
 *
 * Concepts requested but NOT present on this page (an explicit revenue row,
 * funding/reimbursement offset lines, an explicit fixed-vs-variable split,
 * trend charts, break-even markers, a variance view, and scenario-versus-
 * scenario comparison) are recorded as known gaps or pointed to the page that
 * does own them. No figure, cost category or formula is invented, and this
 * guide changes no calculation, run or data.
 */
export const commercialPnlGuide: CommercialGuideContent = {
  pageId: "commercial-pnl",
  route: "/commercial/model/pnl",
  match: "exact",
  pageTitle: "P&L (Cost & EBITDA)",
  guideTitle: "P&L — What the Deal Costs and What It Earns",
  audiences: ["Finance", "Commercial Lead", "Executive", "Delivery", "Operations", "Administrator"],
  modes: ["executive", "practitioner", "administrator"],
  estimatedReadingMinutes: 13,
  trainingLevel: "Intermediate",
  lastUpdated: "2026-07-31",

  /* ---------------- Overview ---------------- */
  purpose:
    "This page shows what the modelled revenue costs to deliver and what is left as operating profit. It separates cost of delivery from operating expenses, then reports gross profit, gross margin, EBITDA and EBITDA margin for the selected scenario across FY2027 to FY2031. It exists so profitability is read from one governed calculation, paired to a specific revenue run, rather than assembled by hand.",
  represents:
    "The outputs of the latest completed P&L-scope model run for the selected scenario and model version: twelve cost-of-delivery lines, eleven operating-expense lines, four summary profitability rows and a total pod-FTE memo, each reported per fiscal year with a five-year figure and formula lineage.",
  whyItMatters:
    "Revenue alone proves nothing. The same activation volumes that create revenue also create pods, support, delivery and travel cost, so a growing top line can sit on a falling margin. This page is where that trade-off becomes visible, and it is the input to cash, scenario comparison and the executive recommendation. A missing cost category here overstates EBITDA everywhere downstream.",
  moduleConnection:
    "P&L consumes the completed revenue run for the same scenario and model version, together with the governed assumptions, the staffing plan and the scenario driver set. It publishes gross profit, EBITDA and margin to Cash & Sustainability, Scenario Comparison, Sensitivity Analysis, the Overview and Governance. Nothing on this page can be edited: cost values change only by changing assumptions, scenarios or the model version and re-running.",
  questionsAnswered: [
    "Is the modelled deal profitable, and in which fiscal years?",
    "Which cost categories drive the result — delivery, support, tooling, travel or G&A?",
    "When does EBITDA turn positive?",
    "What is the EBITDA margin by fiscal period and by scenario?",
    "How much of the cost base is staffing versus non-staffing?",
    "Does the pod-FTE memo reconcile to the staffing plan?",
    "Is the profitability position operationally credible?",
    "Which cost assumptions threaten sustainability?",
  ],
  expectedOutcome:
    "A defensible, scenario-explicit profitability position where every cost line has an owner, staffing cost reconciles to the staffing plan, and EBITDA is never presented as cash.",
  lifecycleStages: [
    "Financial Modeling",
    "Commercial Structuring",
    "Executive Review",
    "Negotiation",
    "Delivery Planning",
    "Operations",
  ],
  prerequisites: [
    { id: "pre-1", label: "Completed revenue run", route: "/commercial/model/revenue", detail: "The P&L engine consumes the revenue run for the same scenario and model version; without it the page shows a blocking alert." },
    { id: "pre-2", label: "Staffing plan", route: "/commercial/staffing-resources", detail: "Role counts and ramp behind the pod cost lines and the POD-FTE memo." },
    { id: "pre-3", label: "Loaded-cost assumptions", route: "/commercial/model/assumptions", detail: "Loaded cost per FTE, contractor basis and cost escalation feed every staffing-linked line." },
    { id: "pre-4", label: "Delivery scope", detail: "Managed-services delivery scope sizes the base and variable delivery lines (COD-09, COD-09B)." },
    { id: "pre-5", label: "Support scope", detail: "L1/L2 support scope sizes COD-06." },
    { id: "pre-6", label: "Funding assumptions", route: "/commercial/model/revenue", detail: "Activation Fund, MDF and Support Readiness are modelled as revenue lines, not as cost offsets here." },
    { id: "pre-7", label: "Timing", detail: "Fiscal-year phasing must match the revenue run's periods." },
    { id: "pre-8", label: "Scenario", route: "/commercial/scenarios", detail: "The scenario supplies the cost driver values used by the run." },
    { id: "pre-9", label: "Model run", detail: "Results render only when a completed P&L run exists; triggering one requires commercial.model.run." },
  ],
  ownership: {
    businessOwner: "Finance Lead",
    commercialOwner: "Commercial Lead",
    technicalOwner: "Model Administrator",
    executiveApprover: "Executive Sponsor",
    primaryUsers: ["Finance", "Commercial Lead", "Deal Lead", "Delivery Leadership", "Staffing Lead", "RunOps Lead"],
    consumersOfOutput: ["Cash & Sustainability", "Scenario Comparison", "Sensitivity Analysis", "Overview", "Governance"],
  },

  /* ---------------- How it works ---------------- */
  sections: [
    {
      id: "sec-context",
      title: "Scope and model context",
      explanation:
        "The header states the scope: server-authoritative cost-of-delivery, operating-expense, gross-profit and EBITDA calculations that consume the completed revenue run for the same scenario and model version. Nothing is computed in the browser. The directional banner marks all figures as directional. 'Run P&L (all scenarios)' recalculates every scenario and is disabled without the commercial.model.run permission; identical inputs return a reused, idempotent result.",
      targetId: "pnl-context",
    },
    {
      id: "sec-run-header",
      title: "Run header and provenance",
      explanation:
        "The run header names the model version and formula catalog, the selected scenario, the upstream revenue run the P&L was paired to, the input hash and the completion timestamp. Read it before reading any figure. A current-failure alert means nothing on the page should be quoted; a 'revenue run required' alert means the engine could not execute for that scenario at all.",
      targetId: "pnl-run-header",
    },
    {
      id: "sec-scenario",
      title: "Scenario selection",
      explanation:
        "The selector switches which scenario's completed run is displayed; the baseline scenario is marked. Cost drivers, staffing and escalation differ by scenario, so margin differs too. Every figure quoted from this page must carry its scenario name — comparing an EBITDA figure from one scenario with a revenue figure from another is a reconciliation error, not an insight.",
      targetId: "pnl-scenario",
    },
    {
      id: "sec-summary",
      title: "P&L summary",
      explanation:
        "Four rows: Gross Profit, Gross Margin %, EBITDA and EBITDA Margin %. Gross profit is revenue less total cost of delivery; EBITDA subtracts total operating expenses as well. Revenue itself is not shown as a row here — it lives on the Revenue page, and the paired run is named in the run header. EBITDA is highlighted because it is the figure downstream pages consume.",
      targetId: "pnl-summary",
    },
    {
      id: "sec-gross-profit",
      title: "Gross profit and gross margin",
      explanation:
        "Gross profit is the result after cost of delivery only. It is the cleanest test of whether the delivery model works: if gross margin is thin before any operating expense is applied, no amount of overhead discipline will rescue EBITDA. Read gross margin per fiscal year rather than only across five years, because early-year delivery build-up can hide inside a five-year total.",
      targetId: "pnl-gross-profit",
    },
    {
      id: "sec-costs",
      title: "Cost of delivery",
      explanation:
        "Twelve lines covering the pod and its delivery: pod lead, customer success, solution architect, healthcare SME, services pre-sales, L1/L2 support, data/RevOps, PMO, base and variable managed-services delivery, third-party tools and infrastructure, and travel and customer workshops. COD-TOTAL is the sum used for gross profit. Lines 1 to 9b are staffing-driven; 10 and 11 are non-staffing delivery cost.",
      targetId: "pnl-costs",
    },
    {
      id: "sec-staffing-cost",
      title: "Staffing cost lines",
      explanation:
        "The pod roles are the largest cost block. Each line is a role count times loaded cost per FTE, escalated by year, so it moves with both the staffing plan and the loaded-cost assumption. These lines must reconcile to Staffing & Resources: if the plan shows roles this model does not cost, or costs roles the plan has not resourced, the margin is not credible regardless of what the summary says.",
      targetId: "pnl-staffing-cost",
    },
    {
      id: "sec-support-cost",
      title: "Support and operating cost",
      explanation:
        "Line 6 covers L1/L2 support resources — the run-side cost of keeping activated accounts supported. It scales with the supported estate rather than with new sales, so it persists after activation growth slows. RunOps should validate that the modelled support cost matches the agreed support scope and service levels, not just a headcount ratio.",
      targetId: "pnl-support-cost",
    },
    {
      id: "sec-delivery-cost",
      title: "Delivery cost, base and variable",
      explanation:
        "Line 9 is the base managed-services delivery lead FTE; line 9b is variable delivery resource that scales with managed-services volume. The split is the model's clearest fixed-versus-variable distinction inside delivery: the base line persists regardless of volume, while the variable line grows with converted accounts. Validate both against the delivery scope before accepting the cost.",
      targetId: "pnl-delivery-cost",
    },
    {
      id: "sec-marketing-cost",
      title: "Sales, marketing and go-to-market cost",
      explanation:
        "Within operating expenses, line 5 covers marketing and customer materials, alongside alliance management (line 2), training and certification (line 6), non-delivery travel (line 7) and recruiting (line 10). These are the go-to-market and enablement costs of running the program. They are largely fixed commitments and do not fall automatically when volume falls.",
      targetId: "pnl-marketing-cost",
    },
    {
      id: "sec-opex",
      title: "Operating expenses",
      explanation:
        "Eleven rows: executive sponsor / program GM, alliance management, finance and deal operations, legal and contracting, marketing, training, non-delivery travel, G&A allocation, internal systems and tooling, recruiting, and OPEX-TOTAL. The total is subtracted from gross profit to give EBITDA. Because most lines are period commitments rather than volume-driven, they compress margin hardest in low-volume years.",
      targetId: "pnl-opex",
    },
    {
      id: "sec-shared-services",
      title: "Shared-services and G&A allocation",
      explanation:
        "Line 8 is the G&A allocation — the shared corporate cost apportioned to this program — supported by finance and deal operations, legal and contracting, and internal systems and tooling. Allocations are the easiest category to understate. If shared resources are also carried by another program without a consistent basis, the same capacity is being counted twice across the portfolio.",
      targetId: "pnl-shared-services",
    },
    {
      id: "sec-ebitda",
      title: "EBITDA",
      explanation:
        "EBITDA is gross profit less total operating expenses for the fiscal year, with a five-year figure in the final column. It is the highlighted row because Cash & Sustainability, Scenario Comparison, Sensitivity and the Overview all consume it. Read the year-by-year profile, not just the total: the year EBITDA first turns positive matters more to the decision than the five-year sum.",
      targetId: "pnl-ebitda",
    },
    {
      id: "sec-margin",
      title: "EBITDA margin",
      explanation:
        "EBITDA margin expresses EBITDA as a percentage of the paired revenue for the same period. It is the comparability measure across periods and scenarios, but only when scope and periods are consistent. A margin that improves purely because cost was deferred past the work it supports is not an improvement — check the cost profile before crediting the percentage.",
      targetId: "pnl-margin",
    },
    {
      id: "sec-by-period",
      title: "Fiscal periods and the five-year column",
      explanation:
        "Every table runs FY2027 to FY2031 with a five-year total column. Cost and revenue must be read on the same periods and the same scenario. Early years typically carry delivery build-up before volume arrives; late years carry the accumulated support estate. Judging the deal from the five-year column alone hides both effects.",
      targetId: "pnl-by-period",
    },
    {
      id: "sec-staffing-memo",
      title: "Staffing memo",
      explanation:
        "Total pod FTE per fiscal year, shown as an informational memo rather than a cost. It exists to make the reconciliation to Staffing & Resources direct: if the FTE profile here does not match the staffing plan, the staffing-driven cost lines above are not trustworthy either. It is a check, not an input to EBITDA.",
      targetId: "pnl-staffing-memo",
    },
    {
      id: "sec-detail",
      title: "Totals and lineage",
      explanation:
        "COD-TOTAL and OPEX-TOTAL are the two subtotals that drive the summary. Every row — including totals — exposes a formula-lineage popover with the engine's captured inputs, formula, source cells and any approximation flag. That popover is the reconciliation tool: when a cost figure is challenged, open the lineage rather than rebuilding the arithmetic by hand.",
      targetId: "pnl-detail",
    },
  ],
  inputs: [
    { id: "in-1", label: "Revenue by stream", description: "The completed revenue run paired to this scenario and model version; the denominator for both margin rows.", owner: "Commercial Lead", source: "Revenue", required: true },
    { id: "in-2", label: "FTE plan", description: "Role counts and ramp behind the pod cost lines and the POD-FTE memo.", owner: "Staffing Lead", source: "Staffing & Resources", required: true },
    { id: "in-3", label: "Loaded cost per FTE", description: "Fully loaded annual cost applied to each staffed role line.", owner: "Finance", source: "Assumptions", required: true },
    { id: "in-4", label: "Hiring and contractor assumptions", description: "Whether a role is employed or contracted, which changes the loaded basis used.", owner: "Staffing Lead", source: "Assumptions" },
    { id: "in-5", label: "Delivery scope", description: "Managed-services scope sizing the base and variable delivery lines.", owner: "Delivery Lead", source: "Program / Assumptions", required: true },
    { id: "in-6", label: "Support scope", description: "L1/L2 support model and service levels sizing the support line.", owner: "RunOps Lead", source: "Program / Assumptions", required: true },
    { id: "in-7", label: "Sales and marketing baseline", description: "Marketing, alliance, training and non-delivery travel commitments in OPEX.", owner: "Commercial Lead", source: "Assumptions" },
    { id: "in-8", label: "Shared services and G&A allocation", description: "Corporate cost apportioned to the program, plus finance, legal and internal tooling.", owner: "Finance", source: "Assumptions", required: true },
    { id: "in-9", label: "Third-party tools and infrastructure", description: "Non-staffing delivery cost carried inside cost of delivery.", owner: "Delivery Lead", source: "Assumptions" },
    { id: "in-10", label: "Travel and customer workshops", description: "Delivery-side travel, phased by fiscal year.", owner: "Delivery Lead", source: "Assumptions" },
    { id: "in-11", label: "Recruiting and hiring cost", description: "Cost of standing the pod up, concentrated in ramp years.", owner: "Staffing Lead", source: "Assumptions" },
    { id: "in-12", label: "Cost escalation", description: "Annual escalation applied by year index to cost lines.", owner: "Finance", source: "Assumptions" },
    { id: "in-13", label: "Timing", description: "Fiscal-year phasing that must align with the revenue run.", owner: "Program Director", source: "Program", required: true },
    { id: "in-14", label: "Selected scenario", description: "Determines which cost driver values the run used.", owner: "Commercial Lead", source: "Scenarios", required: true },
    { id: "in-15", label: "Model version", description: "The registered version and formula catalog the run executed against.", owner: "Model Administrator", source: "Release & Activation", required: true },
  ],
  outputs: [
    { id: "out-1", label: "Total cost of delivery", description: "COD-TOTAL per fiscal year and across five years.", consumedBy: ["Cash & Sustainability", "Scenario Comparison"] },
    { id: "out-2", label: "Total operating expenses", description: "OPEX-TOTAL per fiscal year and across five years.", consumedBy: ["Cash & Sustainability", "Governance"] },
    { id: "out-3", label: "Cost by category", description: "Twelve delivery lines and eleven OPEX lines showing where the money goes.", consumedBy: ["Governance", "Delivery Leadership", "RunOps"] },
    { id: "out-4", label: "Gross profit and gross margin", description: "Result after cost of delivery only, before operating expenses.", consumedBy: ["Overview", "Scenario Comparison"] },
    { id: "out-5", label: "EBITDA", description: "Gross profit less operating expenses, per period and five-year.", consumedBy: ["Cash & Sustainability", "Scenario Comparison", "Sensitivity Analysis", "Overview"] },
    { id: "out-6", label: "EBITDA margin", description: "EBITDA as a percentage of paired revenue for the same period.", consumedBy: ["Overview", "Governance", "Executive review"] },
    { id: "out-7", label: "Profitability by period", description: "FY2027–FY2031 profile showing when the result turns positive.", consumedBy: ["Cash & Sustainability", "Negotiation"] },
    { id: "out-8", label: "Total pod FTE memo", description: "Informational FTE per year used to reconcile to the staffing plan.", consumedBy: ["Staffing & Resources"] },
    { id: "out-9", label: "Formula lineage and run provenance", description: "Per-row inputs and formula, plus model version, scenario, input hash and paired revenue run.", consumedBy: ["Governance", "Audit"] },
  ],
  businessRules: [
    { id: "br-1", rule: "Revenue and cost must use the same scenario, model version and periods.", explanation: "The engine pairs the P&L run to a completed revenue run for the same scenario and version, and reports both on FY2027–FY2031. Mixing sources across scenarios or versions invalidates every margin figure." },
    { id: "br-2", rule: "All modelled cost categories must be present.", explanation: "Gross profit uses COD-TOTAL and EBITDA uses OPEX-TOTAL. If a category is zero because an input is missing rather than because the cost does not exist, EBITDA is overstated by exactly that amount." },
    { id: "br-3", rule: "Fixed and variable cost are distinguished only where the model supports it.", explanation: "The clearest split is base delivery (COD-09) versus variable delivery (COD-09B). Most OPEX lines behave as period commitments. The page does not publish a formal fixed/variable classification." },
    { id: "br-4", rule: "Staffing cost must reconcile to Staffing & Resources.", explanation: "The pod role lines and the POD-FTE memo describe the same workforce as the staffing plan. A mismatch means either the plan or the cost model is wrong; the margin cannot be accepted until it is resolved." },
    { id: "br-5", rule: "Delivery and support cost must align with agreed scope.", explanation: "COD-09/09B follow managed-services delivery scope and COD-06 follows the support model. Cost below scope is a delivery risk, not a saving." },
    { id: "br-6", rule: "Funding is modelled as revenue, not as a cost offset.", explanation: "Activation Fund, MDF / co-sell and Support Readiness are revenue streams on the Revenue page. They must never also be netted against a cost line here, or the same money is counted twice." },
    { id: "br-7", rule: "A cost offset is never counted twice.", explanation: "Each cost line applies a distinct driver to a distinct base. Shared resources apportioned through G&A must not also appear as a direct delivery line." },
    { id: "br-8", rule: "EBITDA is not cash flow.", explanation: "EBITDA excludes payment timing, working capital and receipt lag. Liquidity is modelled only on Cash & Sustainability, and a positive EBITDA year can still be cash-negative." },
    { id: "br-9", rule: "A positive margin does not prove adequate liquidity.", explanation: "Staffing is paid monthly while rebate and services receipts arrive later. Margin and funding requirement must be read together before any sustainability claim." },
    { id: "br-10", rule: "Cost reductions must be operationally feasible.", explanation: "Removing cost in the model removes capacity in reality. Any reduction must be agreed by the owner of that scope — Delivery, RunOps or Staffing — before it is modelled." },
    { id: "br-11", rule: "Contractor and employee cost use the correct loaded basis.", explanation: "Contractor premiums and employee loaded cost differ. Applying an average blended rate to a contractor-heavy pod understates the cost base." },
    { id: "br-12", rule: "Scenario comparisons require consistent scope and periods.", explanation: "Margins are only comparable when the underlying delivery and support scope are the same. Use Scenario Comparison for structured comparison rather than reading two runs side by side." },
    { id: "br-13", rule: "Results are read-only outputs of a governed run.", explanation: "No value on this page can be edited. Cost changes are made through an approved assumption change set, then re-run; the input hash records the inputs used." },
  ],
  calculationLogic: [
    "COD-TOTAL = sum of the twelve cost-of-delivery lines for the fiscal year.",
    "Staffing-driven delivery lines apply role counts to loaded cost per FTE, escalated by year index.",
    "COD-09B (variable delivery) scales with managed-services volume; COD-09 (base delivery lead) does not.",
    "OPEX-TOTAL = sum of the ten operating-expense lines, including the G&A allocation.",
    "Gross Profit = paired revenue for the period less COD-TOTAL.",
    "Gross Margin % = Gross Profit ÷ paired revenue for the period.",
    "EBITDA = Gross Profit less OPEX-TOTAL.",
    "EBITDA Margin % = EBITDA ÷ paired revenue for the period.",
    "POD-FTE is reported as a memo and is not an input to any profit row.",
    "The five-year column aggregates the fiscal years; percentage rows are reported on the same five-year basis.",
    "Every row carries lineage: captured inputs, formula, source cells and any approximation flag.",
  ],
  relationship: {
    receivesFrom: [
      "Revenue (paired completed run)",
      "Staffing & Resources (FTE plan)",
      "Program (timing, delivery and support scope)",
      "Assumptions & Change Sets (loaded cost, escalation, allocations)",
      "Scenarios (cost driver set)",
      "Release & Activation (registered model version)",
      "Funding terms (treated as revenue upstream)",
    ],
    models: [
      "Cost by category across delivery and operating expense",
      "Gross profit and gross margin",
      "EBITDA and EBITDA margin",
      "Profitability by fiscal period",
      "Profitability by scenario",
      "Total pod FTE as a staffing reconciliation memo",
    ],
    feeds: [
      "Cash & Sustainability",
      "Scenario Comparison",
      "Sensitivity Analysis",
      "Overview",
      "Governance",
      "Negotiation decisions",
    ],
  },
  downstreamImpacts: [
    { area: "Cash", effect: "EBITDA and the cost profile drive the funding requirement and the timing of peak cash need." },
    { area: "EBITDA", effect: "This page is the authoritative EBITDA source for every other commercial view." },
    { area: "Costs", effect: "Category detail sets where cost reduction can credibly be pursued." },
    { area: "Staffing", effect: "Cost pressure on pod lines feeds directly into staffing decisions and role phasing." },
    { area: "Capacity", effect: "Cutting modelled cost removes delivery and support capacity in the plan." },
    { area: "Governance", effect: "Material cost or allocation changes require a governed change set and approval." },
    { area: "Risk", effect: "Concentrated cost or thin early-year margin becomes an explicit commercial risk." },
    { area: "Timeline", effect: "Cost phasing determines when the program can be presented as self-sustaining." },
  ],
  dataQuality: {
    dataSources: [
      "Completed P&L-scope model run results (per scenario and model version)",
      "Paired completed revenue run",
      "Governed assumptions and approved change sets",
      "Scenario driver set",
      "Registered model version and formula catalog",
    ],
    updateFrequency: "On demand — values change only when a P&L run is executed for the active model version.",
    knownGaps: [
      "Revenue is not displayed as a row on this page; it is read from the Revenue page and identified via the paired run in the run header.",
      "There are no funding or reimbursement offset lines here — funding is modelled as revenue streams upstream.",
      "The page publishes no formal fixed-versus-variable classification; only base versus variable delivery is explicit.",
      "No trend chart, break-even marker or variance view is rendered; the fiscal-year columns must be read directly.",
      "Scenario-versus-scenario comparison is not shown side by side; use Scenario Comparison.",
      "Brand royalty is not a modelled line on this page.",
      "The POD-FTE memo is FTE, not cost, and does not itself prove staffing-cost reconciliation.",
    ],
    changeControl: "Read-only outputs. Cost inputs change only through an approved assumption change set followed by a re-run; the input hash records exactly what was used.",
    lineage: "Every row exposes a formula-lineage popover with captured inputs, formula, source cells and approximation flags.",
  },
  modelConfidence: "Medium",
  confidenceBasis: ["Cost assumptions", "Staffing assumptions", "Revenue assumptions", "Timing", "Source completeness"],
  confidenceGuidance:
    "Confidence is highest where a cost line traces to an agreed staffing plan and a source-supported loaded cost, and lowest for allocations, escalation and tooling estimates. Treat any category whose value is zero as unverified until its owner confirms the cost genuinely does not exist.",
  commercialReadiness: "Review Required",
  readinessCriteria: [
    "A completed P&L run exists for the selected scenario on an activated model version.",
    "The paired revenue run is the current one for the same scenario and version.",
    "Every cost category has a named owner and a stated basis.",
    "Staffing cost and the POD-FTE memo reconcile to Staffing & Resources.",
    "Delivery and support cost match the agreed scope.",
    "Funding is confirmed as revenue-side only, with no duplicate cost offset.",
    "Cash & Sustainability has been read alongside the margin position.",
  ],

  /* ---------------- How to use it ---------------- */
  workflow: [
    { id: "wf-1", step: 1, title: "Confirm scenario and period", description: "Read the run header: model version, scenario, paired revenue run, input hash and timestamp. Resolve any failure or missing-revenue alert first.", role: "Finance" },
    { id: "wf-2", step: 2, title: "Reconcile revenue", description: "Confirm the paired revenue run is the current one for this scenario and version before trusting either margin row.", role: "Commercial Lead" },
    { id: "wf-3", step: 3, title: "Review cost categories", description: "Walk the twelve delivery lines and eleven OPEX lines and confirm none is missing or implausibly zero.", role: "Finance" },
    { id: "wf-4", step: 4, title: "Reconcile staffing cost", description: "Compare the pod role lines and the POD-FTE memo with the staffing plan in Staffing & Resources.", role: "Staffing Lead" },
    { id: "wf-5", step: 5, title: "Validate delivery and support scope", description: "Confirm base and variable delivery and the L1/L2 support line match the agreed delivery and support scope.", role: "Delivery Lead" },
    { id: "wf-6", step: 6, title: "Review fixed and variable behaviour", description: "Identify which lines persist regardless of volume and which scale with it, using base versus variable delivery as the anchor.", role: "Finance" },
    { id: "wf-7", step: 7, title: "Review funding treatment", description: "Confirm funding sits on the Revenue page only and is not also netted against any cost line here.", role: "Commercial Lead" },
    { id: "wf-8", step: 8, title: "Review EBITDA and margin", description: "Read gross profit, gross margin, EBITDA and EBITDA margin by fiscal year, noting when the result turns positive.", role: "Finance" },
    { id: "wf-9", step: 9, title: "Investigate major variances", description: "Open the lineage popover on any line that moves sharply between years and confirm the driver behind it.", role: "Finance" },
    { id: "wf-10", step: 10, title: "Review operational feasibility", description: "Ask Delivery and RunOps whether the modelled cost genuinely resources the committed scope.", role: "RunOps Lead" },
    { id: "wf-11", step: 11, title: "Continue to Cash", description: "Read Cash & Sustainability before making any statement about funding, liquidity or self-sustainability.", role: "Finance" },
    { id: "wf-12", step: 12, title: "Route input changes through Assumptions", description: "Raise every cost change as a governed change set, then re-run; never adjust figures outside the model.", role: "Commercial Lead" },
  ],
  actionsAvailable: [
    "Switch the displayed scenario.",
    "Trigger 'Run P&L (all scenarios)' with the commercial.model.run permission.",
    "Open the formula-lineage popover on any cost, OPEX or summary row.",
    "Read the paired revenue run, input hash and completion timestamp for reproducibility.",
    "Read the total pod FTE memo to reconcile against the staffing plan.",
  ],
  teamActivities: [
    { id: "ta-1", activity: "Own calculation integrity and reconciliation", role: "Finance", cadence: "Each model revision" },
    { id: "ta-2", activity: "Validate commercial treatment of cost and funding", role: "Commercial Lead", cadence: "Each model revision" },
    { id: "ta-3", activity: "Validate FTE plan and loaded cost", role: "Staffing Lead", cadence: "Monthly" },
    { id: "ta-4", activity: "Validate delivery cost against scope", role: "Delivery Lead", cadence: "Each model revision" },
    { id: "ta-5", activity: "Validate support and operating cost", role: "RunOps Lead", cadence: "Each model revision" },
    { id: "ta-6", activity: "Validate cost phasing and timing", role: "Program Director", cadence: "Each model revision" },
    { id: "ta-7", activity: "Approve material cost and allocation changes", role: "Governance", cadence: "Before executive review" },
    { id: "ta-8", activity: "Approve the economic position", role: "Executive Sponsor", cadence: "At decision points" },
  ],
  roles: [
    { role: "Finance", responsibility: "Owns calculation integrity, cost treatment, allocations and reconciliation to the model." },
    { role: "Commercial Lead", responsibility: "Owns the commercial treatment of cost, funding classification and the margin position." },
    { role: "Deal Lead", responsibility: "Uses the cost and margin profile to shape and defend the negotiating position." },
    { role: "Staffing Lead", responsibility: "Owns the FTE plan and loaded-cost basis behind the staffing-driven lines." },
    { role: "Delivery Lead", responsibility: "Owns delivery scope and validates base and variable delivery cost." },
    { role: "RunOps Lead", responsibility: "Owns support scope and validates ongoing operating cost." },
    { role: "Program Director", responsibility: "Owns cost phasing and alignment of periods with the program plan." },
    { role: "Executive Sponsor", responsibility: "Approves the economic position and accepts the residual profitability risk." },
    { role: "Model Administrator", responsibility: "Owns model version registration, run execution and run integrity." },
  ],
  raci: [
    { activity: "Own P&L calculation integrity", assignments: [{ role: "Finance", raci: "R" }, { role: "Executive Sponsor", raci: "A" }, { role: "Commercial Lead", raci: "C" }, { role: "Delivery", raci: "I" }] },
    { activity: "Validate staffing cost and loaded basis", assignments: [{ role: "Staffing Lead", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Delivery", raci: "C" }, { role: "Commercial Lead", raci: "I" }] },
    { activity: "Validate delivery cost against scope", assignments: [{ role: "Delivery Lead", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Program Director", raci: "C" }, { role: "Executive Sponsor", raci: "I" }] },
    { activity: "Validate support and operating cost", assignments: [{ role: "RunOps Lead", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Delivery", raci: "C" }, { role: "Commercial Lead", raci: "I" }] },
    { activity: "Confirm funding treatment is not duplicated", assignments: [{ role: "Commercial Lead", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Governance", raci: "C" }, { role: "Executive Sponsor", raci: "I" }] },
    { activity: "Execute and certify model runs", assignments: [{ role: "Model Administrator", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Commercial Lead", raci: "C" }, { role: "Governance", raci: "I" }] },
    { activity: "Approve the economic position", assignments: [{ role: "Executive Sponsor", raci: "A" }, { role: "Finance", raci: "R" }, { role: "Commercial Lead", raci: "C" }, { role: "Delivery", raci: "I" }] },
  ],
  reviewRequirements: [
    "Run header and paired revenue run reviewed before any figure is quoted.",
    "Every cost category reviewed for presence and plausibility.",
    "Staffing cost and POD-FTE reconciled with Staffing & Resources.",
    "Delivery and support cost reviewed against agreed scope with Delivery and RunOps.",
    "Allocation basis for G&A and shared services reviewed with Finance.",
    "Margin reviewed by fiscal year, not only across five years.",
    "Cash & Sustainability reviewed in the same session.",
  ],
  approvalRequirements: [
    "Material cost or allocation changes approved through an assumption change set.",
    "Model version activated through Release & Activation before baseline use.",
    "Delivery and support cost reductions agreed by their scope owners.",
    "Executive Sponsor approval of the economic position before external commitment.",
  ],
  decisions: [
    { id: "dec-1", decision: "Whether the modelled economics are defensible for executive review.", decidedBy: "Executive Sponsor", evidence: "Completed run on an activated version with reconciled staffing and scope-aligned cost." },
    { id: "dec-2", decision: "Whether the cost base is operationally feasible.", decidedBy: "Delivery Leadership", evidence: "Delivery and support lines tested against scope and Staffing & Resources." },
    { id: "dec-3", decision: "Which cost categories to challenge in negotiation.", decidedBy: "Commercial Lead", evidence: "Cost concentration by category and sensitivity results." },
    { id: "dec-4", decision: "Whether a cost assumption must change.", decidedBy: "Finance", evidence: "Lineage review plus owner confirmation, raised as a change set." },
  ],
  whatToDoNext: [
    "Open Cash & Sustainability to see whether the margin is fundable.",
    "Open Staffing & Resources to reconcile the FTE plan behind the cost lines.",
    "Open Revenue to confirm the paired run behind both margin rows.",
    "Open Sensitivity Analysis to find which cost driver moves EBITDA most.",
    "Open Scenario Comparison to see the profitability range across scenarios.",
    "Raise unsupported cost assumptions in Assumptions & Change Sets.",
  ],
  relatedPages: [
    { pageId: "commercial-revenue", label: "Revenue", route: "/commercial/model/revenue", relationship: "Prerequisite" },
    { pageId: "commercial-staffing-resources", label: "Staffing & Resources", route: "/commercial/staffing-resources", relationship: "Prerequisite" },
    { pageId: "commercial-assumptions", label: "Assumptions & Change Sets", route: "/commercial/model/assumptions", relationship: "Upstream" },
    { pageId: "commercial-scenarios", label: "Scenarios", route: "/commercial/scenarios", relationship: "Upstream" },
    { pageId: "commercial-program", label: "Program", route: "/commercial/program", relationship: "Upstream" },
    { pageId: "commercial-release", label: "Release & Activation", route: "/commercial/model/release", relationship: "Upstream" },
    { pageId: "commercial-cash", label: "Cash & Sustainability", route: "/commercial/model/cash", relationship: "Downstream" },
    { pageId: "commercial-compare", label: "Scenario Comparison", route: "/commercial/model/compare", relationship: "Downstream" },
    { pageId: "commercial-sensitivity", label: "Sensitivity Analysis", route: "/commercial/model/sensitivity", relationship: "Downstream" },
    { pageId: "commercial-overview", label: "Overview", route: "/commercial", relationship: "Downstream" },
    { pageId: "commercial-governance", label: "Governance", route: "/commercial/neurealm-governance", relationship: "Companion" },
  ],

  /* ---------------- Interpretation & training ---------------- */
  interpretation: [
    {
      band: "healthy",
      label: "Economics are defensible",
      criteria: [
        "Revenue and cost use the same scenario, model version and fiscal periods.",
        "Staffing cost and the POD-FTE memo reconcile to the staffing plan.",
        "Delivery and support cost match the agreed scope.",
        "Funding treatment is clear and appears only on the revenue side.",
        "Margin is credible year by year, not only across five years.",
        "Cash & Sustainability has been reviewed separately.",
        "Every cost assumption has a named owner.",
      ],
      action: "Proceed to executive review, stating scenario, model version and the fiscal years where margin is thinnest.",
    },
    {
      band: "warning",
      label: "Review before use",
      criteria: [
        "Margin depends on roles that are unfilled or on optimistic utilisation.",
        "Cost appears deferred beyond the work it supports.",
        "Funding is assumed but not contractually agreed.",
        "Shared-service or G&A allocation looks incomplete.",
        "EBITDA is positive only in a narrow case or only in late years.",
        "Back-half profitability relies on aggressive services growth.",
        "A cost category is zero without a confirmed reason.",
      ],
      action: "Assign owners to the weak categories, confirm scope with Delivery and RunOps, and run sensitivity before executive review.",
    },
    {
      band: "critical",
      label: "Do not use",
      criteria: [
        "A material cost category is missing from the model.",
        "Revenue and cost were taken from different scenarios or model versions.",
        "EBITDA is being presented as cash.",
        "Staffing cost does not reconcile to the staffing plan.",
        "Funding is counted as revenue and again as a cost offset.",
        "The current run failed, or a row cannot be reconciled to its lineage.",
      ],
      action: "Stop external use immediately, correct the inputs through change control, re-run, and record the issue in Governance.",
    },
  ],
  commonMistakes: [
    { id: "cm-1", description: "Treating EBITDA as cash available to the business.", correction: "EBITDA excludes payment timing and working capital. Read Cash & Sustainability before any liquidity or funding statement." },
    { id: "cm-2", description: "Excluding pre-revenue staffing from the early years.", correction: "The pod must be stood up before accounts activate. Ramp-year staffing cost belongs in the year it is incurred, not in the year revenue arrives." },
    { id: "cm-3", description: "Understating shared services and the G&A allocation.", correction: "Confirm the allocation basis with Finance. An under-allocated program shows a margin the portfolio cannot actually support." },
    { id: "cm-4", description: "Counting funding twice — as revenue and again as a cost offset.", correction: "Activation Fund, MDF and Support Readiness are revenue lines upstream. There are no funding offset lines on this page, and none should be improvised." },
    { id: "cm-5", description: "Assuming all cost scales perfectly with volume.", correction: "Base delivery, the program GM, legal, finance and G&A persist regardless of volume. Only variable delivery and volume-linked support move with it." },
    { id: "cm-6", description: "Ignoring contractor premiums when costing roles.", correction: "Contractor and employee loaded bases differ. Applying a blended average to a contractor-heavy pod understates cost of delivery." },
    { id: "cm-7", description: "Using average staffing instead of required peak capacity.", correction: "Delivery must be resourced for peak demand. Averaging the FTE profile produces a cheaper model that cannot meet the committed scope." },
    { id: "cm-8", description: "Comparing margins across inconsistent scopes.", correction: "Only compare scenarios with the same delivery and support scope and the same periods, and use Scenario Comparison to do it." },
  ],
  bestPractices: [
    "Read the run header and the paired revenue run before reading any number.",
    "Work top-down: summary, then cost of delivery, then OPEX, then the staffing memo.",
    "Reconcile POD-FTE to the staffing plan every time the model changes.",
    "Open the lineage popover whenever a cost figure is challenged.",
    "Read margin by fiscal year, not only across five years.",
    "Ask the owner of each scope before crediting any cost reduction.",
    "Never present EBITDA without cash alongside it.",
    "Route every cost change through a governed change set the same day.",
  ],
  workedExamples: [
    {
      id: "we-1",
      title: "RunOps staffing increases to meet a higher activation level",
      narrative:
        "Suppose the plan raises activation and RunOps argues the support and delivery pod must grow to keep the estate stable. Nothing is edited here: the staffing and scope change runs through Assumptions & Change Sets and a re-run. Once the run completes, read the effects in order. The pod role lines and the L1/L2 support line rise, and the variable delivery line grows with managed-services volume, so COD-TOTAL increases and the POD-FTE memo rises with it. Gross profit falls unless the paired revenue grows at least as fast, and because most OPEX lines are period commitments that do not fall, EBITDA can drop in the near years even while the top line improves. That is not automatically a bad outcome. The added capacity is what makes the higher activation deliverable at all, so service stability improves and the revenue capacity behind later years becomes credible rather than aspirational. Cash typically worsens first, because the staffing is paid monthly while rebate and services receipts arrive later; the funding requirement therefore rises before the margin recovers. The decision is a balance: accept a weaker near-term EBITDA and a larger funding need in exchange for a delivery model that can actually support the committed volumes. Read Cash, Staffing & Resources and Scenario Comparison before concluding.",
      steps: [
        "Raise the staffing and scope change as a governed change set, not as an edit here.",
        "Re-run and confirm a completed P&L run paired to a current revenue run.",
        "Read cost of delivery, then the staffing memo, then the summary rows.",
        "Check which fiscal years absorb the increase and when EBITDA recovers.",
        "Open Cash & Sustainability to size the larger funding requirement.",
        "Confirm with Staffing & Resources that the added roles can be filled on time.",
        "Compare against the prior scenario before recommending.",
      ],
      result:
        "A higher cost base and weaker near-term EBITDA whose value is only established once capacity, service stability, cash need and delivery feasibility have been read alongside it.",
    },
  ],
  faqs: [
    { id: "faq-1", question: "What is EBITDA?", answer: "Earnings before interest, tax, depreciation and amortisation. On this page it is gross profit — paired revenue less total cost of delivery — minus total operating expenses, reported per fiscal year and across five years. It is the standard measure of operating profitability and the figure downstream pages consume." },
    { id: "faq-2", question: "How is EBITDA different from cash?", answer: "EBITDA measures whether the operation earns more than it spends in a period. Cash measures whether the money is actually available when it is needed. Payment lag, working capital and the timing of receipts are modelled only on Cash & Sustainability, so a positive EBITDA year can still require funding." },
    { id: "faq-3", question: "Which staffing costs are included?", answer: "The pod roles inside cost of delivery: pod lead, customer success, solution architect, healthcare SME, services pre-sales, L1/L2 support, data/RevOps, PMO, and base and variable managed-services delivery. Non-delivery roles such as the program GM, alliance, finance and legal sit in operating expenses. Total pod FTE is shown as a memo." },
    { id: "faq-4", question: "How are funding offsets treated?", answer: "They are not cost offsets here. The Activation Fund, MDF / co-sell and Support Readiness are modelled as revenue streams on the Revenue page and are already inside total revenue. Because of that, they must never also be netted against a cost line on this page." },
    { id: "faq-5", question: "Why can revenue rise while margin falls?", answer: "Because the same volumes that create revenue create cost. More activated accounts mean more pod, support and delivery resource, and operating expenses do not fall to match. If incremental cost per account exceeds incremental revenue per account, margin falls even as the top line grows." },
    { id: "faq-6", question: "What is a fixed cost?", answer: "A cost that persists regardless of volume. In this model the base managed-services delivery lead, the program GM, legal, finance and the G&A allocation behave that way, while variable delivery scales with managed-services volume. The page does not publish a formal fixed/variable label, so judge line by line." },
    { id: "faq-7", question: "Why does margin differ by scenario?", answer: "The scenario supplies the driver values — activation, conversion, staffing, escalation and services assumptions — for both the revenue run and the cost run. Changing scenario changes both sides of the margin. The formulas themselves are fixed by the model version named in the run header." },
    { id: "faq-8", question: "Where should a cost assumption be changed?", answer: "Not here — this page is read-only output. Loaded cost, headcount, escalation, allocations and scope-driven cost are changed through a governed change set in Assumptions & Change Sets, with evidence in Sources. After approval, re-run the model and read the new result on this page." },
  ],
  glossary: [
    { term: "P&L", definition: "Profit and loss: the statement pairing revenue with cost to show gross profit, operating expenses and EBITDA for each fiscal period." },
    { term: "Direct Cost", definition: "Cost incurred to deliver the service itself — the twelve cost-of-delivery lines, including pod roles, tools and delivery travel." },
    { term: "Fixed Cost", definition: "Cost that persists regardless of volume, such as the base delivery lead, program GM, legal, finance and the G&A allocation." },
    { term: "Variable Cost", definition: "Cost that scales with volume, most explicitly the variable managed-services delivery line and volume-linked support." },
    { term: "Loaded FTE Cost", definition: "The fully loaded annual cost of one full-time equivalent, applied to role counts and escalated by year index." },
    { term: "EBITDA", definition: "Gross profit less total operating expenses; the highlighted profitability row consumed by Cash, Scenario Comparison, Sensitivity and the Overview." },
    { term: "EBITDA Margin", definition: "EBITDA expressed as a percentage of the paired revenue for the same period; comparable only across consistent scope and periods." },
    { term: "Cost Offset", definition: "An amount that reduces a cost line. This model has none on this page — funding is treated as revenue upstream, so offsets must not be improvised." },
    { term: "Contribution", definition: "The result after direct cost only. On this page it is expressed as gross profit and gross margin, before operating expenses." },
    { term: "Break-Even", definition: "The point at which EBITDA turns positive. The page shows no break-even marker; read the fiscal-year columns to find the first positive year." },
    { term: "G&A Allocation", definition: "Shared corporate cost apportioned to the program inside operating expenses; a common source of understatement." },
    { term: "POD-FTE", definition: "Total pod full-time equivalents per fiscal year, shown as an informational memo for reconciliation, not as a cost input." },
  ],
  executiveTakeaway:
    "This page answers whether the deal earns anything. It pairs a completed revenue run with twelve delivery-cost lines and eleven operating-expense lines to produce gross profit, EBITDA and margin for each fiscal year from FY2027 to FY2031. Read the year-by-year profile rather than the five-year total: near-term margin is compressed by pod build-up before activation volume arrives. Two disciplines make the number credible — staffing cost must reconcile to the staffing plan, and EBITDA must never be read as cash. Funding is revenue-side only. Every figure is reproducible from its lineage, scenario and input hash.",
  keyRisks: [
    "A material cost category is missing or zero without a confirmed reason, overstating EBITDA.",
    "Staffing cost does not reconcile to the staffing plan or to required peak capacity.",
    "Shared-service and G&A allocation is understated relative to the resources actually consumed.",
    "EBITDA is presented as cash, hiding the funding requirement.",
    "Funding is counted as both revenue and a cost offset.",
    "Margin depends on roles that cannot be filled on the modelled timeline.",
    "Cost is deferred beyond the work it supports, flattering early years.",
    "Scenarios are compared across inconsistent delivery or support scope.",
  ],

  /* ---------------- Show on page ---------------- */
  showOnPageTargets: [
    { targetId: "pnl-context", label: "Scope and model context", description: "Page header, P&L scope statement and the run action." },
    { targetId: "pnl-run-header", label: "Run header", description: "Model version, scenario, upstream revenue run, input hash and timestamp." },
    { targetId: "pnl-scenario", label: "Scenario selector", description: "Switches which scenario's completed P&L run is displayed." },
    { targetId: "pnl-summary", label: "P&L summary", description: "Gross profit, gross margin, EBITDA and EBITDA margin." },
    { targetId: "pnl-gross-profit", label: "Gross profit", description: "Result after cost of delivery, before operating expenses." },
    { targetId: "pnl-ebitda", label: "EBITDA", description: "Gross profit less total operating expenses." },
    { targetId: "pnl-margin", label: "EBITDA margin", description: "EBITDA as a percentage of paired revenue for the period." },
    { targetId: "pnl-by-period", label: "Fiscal periods", description: "FY2027–FY2031 columns and the five-year total column." },
    { targetId: "pnl-costs", label: "Cost of delivery", description: "Twelve delivery-cost lines summing to COD-TOTAL." },
    { targetId: "pnl-staffing-cost", label: "Staffing cost lines", description: "Pod role lines driven by FTE counts and loaded cost." },
    { targetId: "pnl-support-cost", label: "Support cost", description: "L1/L2 support resources sized by the support scope." },
    { targetId: "pnl-delivery-cost", label: "Delivery cost", description: "Base managed-services delivery lead, alongside the variable delivery line." },
    { targetId: "pnl-opex", label: "Operating expenses", description: "Eleven OPEX rows summing to OPEX-TOTAL." },
    { targetId: "pnl-marketing-cost", label: "Sales and marketing cost", description: "Marketing and customer materials within operating expenses." },
    { targetId: "pnl-shared-services", label: "Shared services and G&A", description: "G&A allocation apportioned to the program." },
    { targetId: "pnl-staffing-memo", label: "Staffing memo", description: "Total pod FTE per fiscal year, used to reconcile to the staffing plan." },
    { targetId: "pnl-detail", label: "Totals and lineage", description: "COD-TOTAL with the per-row formula-lineage popover." },
  ],
};
