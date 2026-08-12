import type { CommercialGuideContent } from "../../types";

/**
 * Page-specific Commercial Guide content — Cash & Sustainability
 * (`/commercial/model/cash`).
 *
 * Authored strictly against what `src/commercial/pages/CommercialCash.tsx`
 * actually renders:
 *
 *  - Directional banner, page header ("Project Momentous — Cash Flow, Working
 *    Capital, Break-even & Sustainability"), a permission-gated "Run Cash (all
 *    scenarios)" action, and run-status alerts (current failure, completed run,
 *    missing upstream P&L run, no completed cash run).
 *  - Run header card: model version, scenario selector, upstream P&L run and
 *    cash input hash.
 *  - Y1 quarterly cash table (FY2027-Q1..Q4): CASH-ACCRUED-REV,
 *    CASH-COLLECTED, CASH-COSTS-PAID, CASH-NCF-QTR, CASH-CUM-NCF-QTR.
 *  - Working Capital (Y1): WC-PEAK-TROUGH-Y1 and WC-MAX-FUNDING.
 *  - Annual table FY2027..FY2031 plus a five-year total: CASH-NCF-ANNUAL
 *    (EBITDA proxy per model contract §7), CASH-CUM-ANNUAL, CASH-CONVERSION,
 *    WC-REQUIREMENT.
 *  - Break-even (BE-EBITDA-YEAR, BE-CASH-YEAR, BE-STATUS), Payback (PB-YEAR,
 *    PB-MONTHS) and Financial Sustainability (SUS-NEG-YEARS,
 *    SUS-FUNDING-DEPENDENCY, SUS-STATUS, SUS-MODEL-HEALTH).
 *
 * Concepts requested but NOT present on this page (invoice-level timing, a
 * rebate-specific collection lag, separate payroll/contractor payment
 * calendars, tax, monthly granularity beyond Y1 quarters, cash charts, an
 * approved-versus-unapproved funding flag and export) are recorded as known
 * gaps. No figure or timing rule is invented, and this guide changes no
 * calculation, assumption, run or data.
 */
export const commercialCashGuide: CommercialGuideContent = {
  pageId: "commercial-cash",
  route: "/commercial/model/cash",
  match: "exact",
  pageTitle: "Cash & Sustainability",
  guideTitle: "Cash & Sustainability — When the Money Actually Moves",
  audiences: ["Finance", "Executive", "Commercial Lead", "Delivery", "Operations", "Administrator"],
  modes: ["executive", "practitioner", "administrator"],
  estimatedReadingMinutes: 14,
  trainingLevel: "Advanced",
  lastUpdated: "2026-07-31",

  /* ---------------- Overview ---------------- */
  purpose:
    "This page shows when cash enters and leaves the deal, how much funding is required before receipts arrive, where the working-capital trough sits, when break-even and payback occur, and whether the operating model is financially sustainable. It exists because a profitable model and a fundable model are not the same thing: profit is recognised when earned, cash only moves when collected or paid.",
  represents:
    "The outputs of the latest completed cash-scope model run for the selected scenario and model version: four quarters of FY2027 cash detail, the Y1 working-capital trough and maximum funding requirement, annual net and cumulative cash across FY2027 to FY2031 with a five-year figure, and the break-even, payback and sustainability flags derived from them.",
  whyItMatters:
    "Staffing, mobilisation and travel are paid before activation revenue is collected, so the deal consumes cash long before it earns it. This page sizes that gap. If the trough exceeds what the business will fund, the deal is unexecutable regardless of its EBITDA, and the required contract terms — payment timing, activation funding, milestone billing — become negotiation positions rather than preferences.",
  moduleConnection:
    "The cash engine consumes the completed P&L run for the same scenario and model version and never recomputes revenue, cost of delivery, operating expense or EBITDA. It reuses REV-TOTAL, COD-TOTAL, OPEX-TOTAL, PL-EBITDA, the travel line and activation funding, and applies the governed timing assumptions. It publishes funding need, break-even, payback and sustainability status to Scenario Comparison, Sensitivity Analysis, the Overview, Governance and the funding decision.",
  questionsAnswered: [
    "How much cash does this deal require, and in which quarter?",
    "When do collections actually begin, given the payment lag?",
    "Where is the working-capital trough and how deep is it?",
    "When does EBITDA turn positive, and when does cumulative cash turn positive?",
    "How long is the payback period in months?",
    "Can the business fund the staffing and mobilisation ramp?",
    "Is positive EBITDA sufficient to call the model sustainable?",
    "Which contractual terms would materially improve the cash position?",
  ],
  expectedOutcome:
    "A scenario-explicit funding position: a quantified peak cash need, a dated trough, credible break-even and payback, and a clear statement of the contract terms or funding required to make the deal executable.",
  lifecycleStages: [
    "Financial Modeling",
    "Commercial Structuring",
    "Executive Review",
    "Negotiation",
    "Mobilization",
    "Operations",
  ],
  prerequisites: [
    { id: "pre-1", label: "Valid revenue run", route: "/commercial/model/revenue", detail: "Total revenue and the activation funding line are read from the revenue run behind the P&L." },
    { id: "pre-2", label: "Completed P&L run", route: "/commercial/model/pnl", detail: "Hard prerequisite. Without a P&L run for the same scenario and model version the page shows a blocking alert and the engine cannot execute." },
    { id: "pre-3", label: "Payment-lag assumption", route: "/commercial/model/assumptions", detail: "PAY_LAG_DAYS (60 days in the seeded set) is converted to whole quarters and shifts collections." },
    { id: "pre-4", label: "Collection timing assumptions", route: "/commercial/model/assumptions", detail: "Q1_ACT_FUND_TIMING_PCT governs how much activation funding is collected in Q1." },
    { id: "pre-5", label: "Staffing ramp", route: "/commercial/staffing-resources", detail: "Pod build-up drives the cost paid each quarter before receipts arrive." },
    { id: "pre-6", label: "Mobilisation cost timing", route: "/commercial/model/assumptions", detail: "Q1_TRAVEL_FRONTLOAD_PCT front-loads Year-1 travel into Q1 to launch the pods." },
    { id: "pre-7", label: "Funding assumptions", route: "/commercial/model/revenue", detail: "Activation Fund and related funding are modelled upstream as revenue and collected on the stated timing." },
    { id: "pre-8", label: "Scenario", route: "/commercial/scenarios", detail: "Timing and driver values differ by scenario; the selected scenario governs everything on the page." },
    { id: "pre-9", label: "Model run", detail: "Results render only when a completed cash run exists; triggering one requires commercial.model.run." },
  ],
  ownership: {
    businessOwner: "Finance Lead",
    commercialOwner: "Commercial Lead",
    technicalOwner: "Model Administrator",
    executiveApprover: "Executive Sponsor",
    primaryUsers: ["Finance", "CFO", "Commercial Lead", "Deal Lead", "Program Director", "Staffing Lead", "Governance", "Negotiation team"],
    consumersOfOutput: ["Scenario Comparison", "Sensitivity Analysis", "Governance", "Negotiation", "Funding decisions", "Overview"],
  },

  /* ---------------- How it works ---------------- */
  sections: [
    {
      id: "sec-context",
      title: "Scope and model context",
      explanation:
        "The header states the scope: a server-authoritative cash engine that consumes the completed P&L run for the same scenario and model version and does not recompute revenue, cost of delivery, operating expense or EBITDA. The directional banner marks all figures as directional. 'Run Cash (all scenarios)' recalculates every scenario, is disabled without commercial.model.run, and returns a reused idempotent result for identical inputs.",
      targetId: "cash-context",
    },
    {
      id: "sec-run-header",
      title: "Run header and provenance",
      explanation:
        "The run header names the model version and formula catalog, the selected scenario, the upstream P&L run the cash run was paired to, the cash input hash, the run scope and the completion timestamp. Read it before any figure. A 'P&L prerequisite missing' alert means the engine could not execute at all; a current-failure alert means nothing on the page should be quoted externally.",
      targetId: "cash-run-header",
    },
    {
      id: "sec-scenario",
      title: "Scenario selection",
      explanation:
        "The selector switches which scenario's completed cash run is displayed; the baseline scenario is marked. Volumes, cost and timing all differ by scenario, so funding need, trough depth and payback differ too. Every cash figure quoted must carry its scenario name. Reading only the baseline hides how much funding the conservative case would require.",
      targetId: "cash-scenario",
    },
    {
      id: "sec-timing",
      title: "Year-1 quarterly cash and timing assumptions",
      explanation:
        "The Y1 table is where timing becomes visible. Accrued revenue is spread evenly across the four FY2027 quarters, collections are shifted by the payment lag converted to whole quarters, activation funding is collected on its stated Q1 timing, and Year-1 travel is front-loaded into Q1 to launch the pods. This is the only quarterly view in the model; FY2028 onwards is annual only.",
      targetId: "cash-timing",
    },
    {
      id: "sec-accrued",
      title: "Accrued revenue — recognition, not receipt",
      explanation:
        "CASH-ACCRUED-REV is Year-1 total revenue divided evenly across the four quarters. It is the recognition line, shown deliberately alongside collections so the gap between the two is visible. It is not money in the bank, it is not invoiced value, and it should never be quoted as a cash figure. The page renders no invoice-level detail between recognition and collection.",
      targetId: "cash-accrued",
    },
    {
      id: "sec-inflows",
      title: "Cash collected — the inflow line",
      explanation:
        "CASH-COLLECTED is the accrued revenue of an earlier quarter, shifted forward by the payment lag expressed in whole quarters, plus the share of activation funding collected in Q1. It is the only inflow line on the page. Early quarters can show little or no collection while costs are already being paid — that shortfall is what creates the working-capital trough.",
      targetId: "cash-inflows",
    },
    {
      id: "sec-outflows",
      title: "Cash costs paid — the outflow line",
      explanation:
        "CASH-COSTS-PAID takes Year-1 cost of delivery plus operating expense, removes the front-loaded travel, spreads the remainder evenly across the four quarters, then adds the front-loaded travel back in Q1. Payroll, contractor and supplier payments are not modelled on separate calendars — they sit inside this single even spread, with mobilisation travel as the one explicit timing exception.",
      targetId: "cash-outflows",
    },
    {
      id: "sec-net",
      title: "Quarterly net cash flow",
      explanation:
        "CASH-NCF-QTR is collections minus costs paid for that quarter. Negative quarters are the periods the business must fund from its own balance sheet. A single deeply negative quarter can matter more than a mildly negative year, because funding must be available at the moment the money leaves, not on average across the year.",
      targetId: "cash-net",
    },
    {
      id: "sec-cumulative",
      title: "Cumulative quarterly cash",
      explanation:
        "CASH-CUM-NCF-QTR is the running sum of quarterly net cash across FY2027. It is the line that reveals the trough: its minimum is the deepest point the business must carry. Read this rather than the annual figure when sizing funding — an annual total can look survivable while a mid-year cumulative position is far worse.",
      targetId: "cash-cumulative",
    },
    {
      id: "sec-peak-need",
      title: "Working capital — trough and peak funding need",
      explanation:
        "WC-PEAK-TROUGH-Y1 is the minimum of the Year-1 cumulative quarterly cash line — the deepest cash position reached. WC-MAX-FUNDING is that trough expressed as a positive funding requirement, floored at zero. Together they answer the funding question directly: this is how much cash must be available, and the quarterly table shows when.",
      targetId: "cash-peak-need",
    },
    {
      id: "sec-summary",
      title: "Annual cash flow and cumulative cash",
      explanation:
        "Annual net cash is taken as EBITDA, an explicit cash proxy declared by the model contract, with cumulative cash as its running sum, cash conversion as annual net cash over revenue, and the working-capital requirement per year as the negative of cumulative cash floored at zero. Because the annual view is a proxy, payment lag is only genuinely modelled in the Year-1 quarterly table.",
      targetId: "cash-summary",
    },
    {
      id: "sec-annual-net",
      title: "Annual net cash — an EBITDA proxy",
      explanation:
        "CASH-NCF-ANNUAL equals PL-EBITDA for each fiscal year. The row label states the proxy openly. Treat it as an indicative annual profile, not as a collections forecast: it carries no payment lag, no receivables balance and no separate payment calendar. Any statement about annual liquidity must be qualified by that limitation.",
      targetId: "cash-annual-net",
    },
    {
      id: "sec-annual-cumulative",
      title: "Cumulative cash across five years",
      explanation:
        "CASH-CUM-ANNUAL sums annual net cash from FY2027 forward, and its first non-negative year is the cash break-even year. This is the line that shows whether early losses are ever recovered. A single positive year does not clear an earlier deficit — the cumulative position must cross zero and stay there.",
      targetId: "cash-annual-cumulative",
    },
    {
      id: "sec-conversion",
      title: "Cash conversion",
      explanation:
        "CASH-CONVERSION is annual net cash divided by total revenue for the same year, expressed as a percentage. It shows how much of each revenue dollar the model converts to cash under the proxy. Because the numerator is EBITDA, this measures operating efficiency rather than collection performance; it will not reveal a deteriorating payment lag.",
      targetId: "cash-conversion",
    },
    {
      id: "sec-wc-requirement",
      title: "Working-capital requirement by year",
      explanation:
        "WC-REQUIREMENT is the negative of cumulative cash for each year, floored at zero. It shows how much funding remains outstanding at each year end. It falls as cumulative cash recovers and reaches zero once the deal has repaid itself. Read it with the Year-1 trough: the annual figure never captures a deeper intra-year low.",
      targetId: "cash-wc-requirement",
    },
    {
      id: "sec-breakeven",
      title: "Break-even",
      explanation:
        "Two distinct definitions are reported. The first positive EBITDA year is the first fiscal year EBITDA is at least zero. The first positive cumulative cash year is the first fiscal year cumulative cash is at least zero. Break-even status reads either achieved or not achieved by FY2031. The two years are usually different, and quoting the earlier one alone overstates the position.",
      targetId: "cash-breakeven",
    },
    {
      id: "sec-payback",
      title: "Payback",
      explanation:
        "Payback year matches the cash break-even year, and months to payback counts from the start of FY2027-Q1 until cumulative cash crosses zero, interpolating linearly within the crossover year. The starting investment is therefore the accumulated cash deficit itself, not a separately declared capital sum — state that definition whenever the figure is quoted.",
      targetId: "cash-payback",
    },
    {
      id: "sec-sustainability",
      title: "Financial sustainability",
      explanation:
        "Four indicators: the count of fiscal years with negative EBITDA, funding dependency as the greater of the Year-1 maximum funding need and the largest annual working-capital requirement, sustainability status of sustainable or at risk, and model health of healthy or watch. Sustainability requires break-even achieved and a positive terminal cumulative cash position at FY2031.",
      targetId: "cash-sustainability",
    },
  ],
  inputs: [
    { id: "in-1", label: "Revenue timing", description: "Year-1 total revenue spread evenly across four quarters as the accrual base.", owner: "Finance", source: "Revenue run (REV-TOTAL)", required: true },
    { id: "in-2", label: "Invoice timing", description: "Not modelled separately — the model moves from accrual to collection using the payment lag alone.", owner: "Finance", source: "Not modelled" },
    { id: "in-3", label: "Collection lag", description: "PAY_LAG_DAYS, seeded at 60 days and converted to whole quarters before shifting collections.", owner: "Finance", source: "Governed assumptions", required: true },
    { id: "in-4", label: "Rebate payment lag", description: "No rebate-specific lag exists; rebate revenue is collected on the single common payment lag.", owner: "Commercial Lead", source: "Not modelled" },
    { id: "in-5", label: "Services billing", description: "Services revenue is inside total revenue and carries the same lag; no separate billing schedule is modelled.", owner: "Commercial Lead", source: "Revenue run" },
    { id: "in-6", label: "Funding receipt timing", description: "Q1_ACT_FUND_TIMING_PCT sets the share of activation funding collected in Q1 (seeded at 100%).", owner: "Deal Lead", source: "Governed assumptions", required: true },
    { id: "in-7", label: "Staffing start dates", description: "The pod ramp behind the cost base; reflected through P&L cost totals rather than as a dated payroll calendar.", owner: "Staffing Lead", source: "Staffing plan / P&L run", required: true },
    { id: "in-8", label: "Payroll timing", description: "Not modelled on its own calendar — staffing cost sits inside the even quarterly spread of Year-1 costs.", owner: "Finance", source: "Not modelled" },
    { id: "in-9", label: "Contractor payments", description: "Also inside the even quarterly cost spread; no separate contractor payment terms are modelled.", owner: "Staffing Lead", source: "Not modelled" },
    { id: "in-10", label: "Mobilisation cost", description: "Q1_TRAVEL_FRONTLOAD_PCT front-loads the Year-1 travel and workshop line into Q1.", owner: "Program Director", source: "Governed assumptions", required: true },
    { id: "in-11", label: "Support and delivery cost", description: "Carried within total cost of delivery from the P&L run and paid across the four quarters.", owner: "Delivery Lead", source: "P&L run (COD-TOTAL)", required: true },
    { id: "in-12", label: "Sales and marketing cost", description: "Carried within total operating expense from the P&L run and paid across the four quarters.", owner: "Commercial Lead", source: "P&L run (OPEX-TOTAL)", required: true },
    { id: "in-13", label: "Scenario", description: "Selects which completed cash run is displayed and which driver and timing values were used.", owner: "Commercial Lead", source: "Scenario definition", required: true },
    { id: "in-14", label: "Tax and financing items", description: "Not modelled — there is no tax, interest, depreciation or financing line in the cash engine.", owner: "Finance", source: "Not modelled" },
  ],
  outputs: [
    { id: "out-1", label: "Cash inflow", description: "CASH-COLLECTED per Year-1 quarter, lag-shifted with Q1 activation funding.", consumedBy: ["Funding decisions", "Negotiation"] },
    { id: "out-2", label: "Cash outflow", description: "CASH-COSTS-PAID per Year-1 quarter, with travel front-loaded into Q1.", consumedBy: ["Funding decisions", "Program planning"] },
    { id: "out-3", label: "Net cash flow", description: "CASH-NCF-QTR quarterly, and CASH-NCF-ANNUAL as the EBITDA proxy by fiscal year.", consumedBy: ["Scenario Comparison", "Overview"] },
    { id: "out-4", label: "Cumulative cash", description: "CASH-CUM-NCF-QTR within Year 1 and CASH-CUM-ANNUAL across FY2027–FY2031.", consumedBy: ["Governance", "Executive review"] },
    { id: "out-5", label: "Peak cash need", description: "WC-MAX-FUNDING, the Year-1 trough expressed as a funding requirement.", consumedBy: ["Funding decisions", "CFO"] },
    { id: "out-6", label: "Funding gap", description: "SUS-FUNDING-DEPENDENCY, the greatest of the Year-1 peak need and the annual working-capital requirements.", consumedBy: ["Funding decisions", "Governance"] },
    { id: "out-7", label: "Break-even", description: "BE-EBITDA-YEAR, BE-CASH-YEAR and BE-STATUS.", consumedBy: ["Scenario Comparison", "Executive review"] },
    { id: "out-8", label: "Payback", description: "PB-YEAR and PB-MONTHS from the start of FY2027-Q1.", consumedBy: ["Scenario Comparison", "Negotiation"] },
    { id: "out-9", label: "Sustainability status", description: "SUS-STATUS, SUS-MODEL-HEALTH and SUS-NEG-YEARS.", consumedBy: ["Governance", "Overview"] },
    { id: "out-10", label: "Negotiation requirements", description: "The payment terms, milestone billing or funding timing implied by the trough — derived by the team, not printed by the page.", consumedBy: ["Negotiation", "Commercial Lead"] },
  ],
  businessRules: [
    { id: "br-1", rule: "Revenue recognition is not cash receipt.", explanation: "Accrued revenue and collected cash are shown as separate rows precisely so they are never conflated. Recognition happens when the revenue is earned; the collection line moves later by the payment lag." },
    { id: "br-2", rule: "EBITDA is not cash flow.", explanation: "The annual rows use EBITDA as a declared proxy for net cash. It excludes payment lag, receivables and working capital, so the annual view understates the timing problem the Year-1 quarterly table exposes." },
    { id: "br-3", rule: "Staffing and mobilisation begin before collection.", explanation: "Pod cost is paid across all four Year-1 quarters and travel is front-loaded into Q1, while collections are lag-shifted. The cost side starts first, and that ordering is what creates the trough." },
    { id: "br-4", rule: "Payment lag must be modelled explicitly.", explanation: "PAY_LAG_DAYS is a governed assumption converted to whole quarters, not an informal adjustment. Changing it requires an approved change set and a re-run; it must never be applied to figures outside the model." },
    { id: "br-5", rule: "Funding appears when contractually expected.", explanation: "Activation funding is collected on its assumed Q1 timing. If the contract does not commit that timing, the assumption is optimistic and the modelled trough is shallower than reality." },
    { id: "br-6", rule: "One-time funding is not recurring cash.", explanation: "The activation funding collection is applied in Q1 of Year 1 only. It must never be repeated into later periods or treated as an ongoing inflow when assessing sustainability." },
    { id: "br-7", rule: "Cumulative cash must include all modelled flows.", explanation: "The quarterly cumulative line is the running sum of every modelled inflow and outflow. Sizing funding from a single quarter, or from annual figures alone, will understate the requirement." },
    { id: "br-8", rule: "Use the page's own break-even and payback definitions.", explanation: "Break-even is reported twice — first positive EBITDA year and first positive cumulative cash year. Payback matches the cash break-even year, with months interpolated within the crossover year. Do not substitute other definitions." },
    { id: "br-9", rule: "Positive annual cash does not remove an earlier trough.", explanation: "A profitable later year does not fund an earlier quarter. The working-capital requirement stands until cumulative cash crosses zero, which is why the Year-1 quarterly minimum is reported separately." },
    { id: "br-10", rule: "Scenario context must be explicit.", explanation: "Funding need, trough depth, payback and sustainability status all differ by scenario. Every quoted cash figure must state its scenario, model version and the run's input hash." },
    { id: "br-11", rule: "Sustainability is reviewed with risk and timing.", explanation: "Status combines break-even achievement with the terminal cumulative cash position, and model health also weighs the count of negative EBITDA years. Neither indicator assesses delivery risk or schedule slippage on its own." },
    { id: "br-12", rule: "Unapproved funding must be labelled.", explanation: "The page cannot tell whether funding is contractually committed. If activation funding is assumed rather than agreed, say so explicitly whenever the funding requirement is presented." },
    { id: "br-13", rule: "Delays worsen cash materially.", explanation: "Later activation, invoicing or collection pushes receipts into subsequent quarters while costs continue. Test that exposure through Sensitivity Analysis before committing to payment terms." },
  ],
  calculationLogic: [
    "Accrued revenue per Year-1 quarter = total Year-1 revenue divided by four.",
    "Cash collected in a quarter = accrued revenue of the quarter one payment-lag interval earlier, plus the Q1 share of activation funding in Q1 only.",
    "Payment lag in days is converted to whole quarters before it is applied.",
    "Cash costs paid = (Year-1 cost of delivery plus operating expense, less front-loaded travel) divided by four, with the front-loaded travel added back in Q1.",
    "Quarterly net cash flow = cash collected minus cash costs paid.",
    "Cumulative quarterly cash = the running sum of quarterly net cash flow.",
    "Peak working-capital trough = the minimum of the Year-1 cumulative quarterly cash line.",
    "Maximum funding requirement = the greater of zero and the negative of that trough.",
    "Annual net cash = EBITDA for the fiscal year, declared as a cash proxy by the model contract.",
    "Cumulative annual cash = the running sum of annual net cash from FY2027.",
    "Cash conversion = annual net cash divided by total revenue for the same year.",
    "Working-capital requirement per year = the greater of zero and the negative of cumulative annual cash.",
    "First positive EBITDA year = the earliest fiscal year with EBITDA at or above zero.",
    "First positive cumulative cash year = the earliest fiscal year with cumulative annual cash at or above zero.",
    "Payback year = the cash break-even year; months to payback are measured from the start of FY2027-Q1 with linear interpolation inside the crossover year.",
    "Funding dependency = the greater of the Year-1 maximum funding requirement and the largest annual working-capital requirement.",
    "Sustainability is 'sustainable' when break-even is achieved and terminal FY2031 cumulative cash is positive, otherwise 'at risk'.",
    "Model health is 'healthy' when the model is sustainable with at most one negative EBITDA year, otherwise 'watch'.",
    "Every row carries lineage recording its formula, the upstream metric values used and the source P&L or revenue run reference.",
  ],
  relationship: {
    receivesFrom: [
      "Revenue (total revenue and activation funding)",
      "P&L (cost of delivery, operating expense, EBITDA, travel line)",
      "Staffing & Resources (ramp behind the cost base)",
      "Program timing",
      "Funding assumptions",
      "Payment-lag assumptions",
      "Collection and front-load timing assumptions",
      "Scenarios (driver set)",
    ],
    models: [
      "Cash inflows and outflows by Year-1 quarter",
      "Net and cumulative cash, quarterly and annual",
      "Peak cash need and the working-capital trough",
      "Working-capital requirement by fiscal year",
      "Break-even on both EBITDA and cumulative cash",
      "Payback year and months",
      "Funding dependency and sustainability status",
    ],
    feeds: [
      "Scenario Comparison",
      "Sensitivity Analysis",
      "Governance",
      "Negotiation",
      "Funding decisions",
      "Overview",
    ],
  },
  downstreamImpacts: [
    { area: "Cash", effect: "This page is the authoritative funding requirement and payback source for the program." },
    { area: "Governance", effect: "Funding dependency and sustainability status are governance gating evidence before executive commitment." },
    { area: "Risk", effect: "A trough the business cannot fund becomes the program's primary commercial risk." },
    { area: "Staffing", effect: "Funding limits constrain how fast the pod ramp can be resourced." },
    { area: "Timeline", effect: "Payback timing and the trough quarter set mobilisation and activation sequencing." },
    { area: "EBITDA", effect: "The annual cash proxy inherits EBITDA directly, so any P&L change moves cash outcomes." },
    { area: "Activation", effect: "Activation timing drives both the funding inflow and the point collections begin." },
    { area: "Customer outcomes", effect: "Payment terms negotiated to protect cash change what the customer is asked to commit to." },
  ],
  dataQuality: {
    dataSources: [
      "Completed cash-scope model run results (per scenario and model version)",
      "Paired completed P&L run (and, through it, the revenue run)",
      "Governed timing assumptions: payment lag, activation-funding timing, travel front-load",
      "Scenario driver set",
      "Registered model version and formula catalog",
    ],
    updateFrequency: "On demand — values change only when a cash run is executed after a completed P&L run for the active model version.",
    knownGaps: [
      "Quarterly detail exists for FY2027 only; FY2028 onwards is annual.",
      "Annual net cash is EBITDA as a declared proxy, so it carries no payment lag or receivables balance.",
      "Invoice-level timing is not modelled — the model moves from accrual straight to lag-shifted collection.",
      "There is no rebate-specific or services-specific collection lag; one common lag applies.",
      "Payroll and contractor payments have no separate calendars; only travel has an explicit timing exception.",
      "Tax, interest, depreciation and financing costs are not modelled.",
      "The page renders no cash chart; the quarterly and annual tables must be read directly.",
      "Nothing on the page flags whether funding is contractually approved or merely assumed.",
      "There is no export or download action on this page.",
    ],
    changeControl: "Read-only outputs. Timing assumptions change only through an approved assumption change set followed by a re-run; the cash input hash records exactly what was used.",
    lineage: "Every row exposes a lineage popover with the formula, the upstream metric values used and the source P&L or revenue run reference.",
  },
  modelConfidence: "Medium",
  confidenceBasis: ["Timing", "Cost assumptions", "Revenue assumptions", "Governance approvals", "Source completeness"],
  confidenceGuidance:
    "Confidence is highest for the Year-1 quarterly view, where lag and front-loading are modelled explicitly, and lowest for FY2028 onwards, where cash is an EBITDA proxy with no timing content. Treat the funding requirement as directional until the payment terms and activation-funding timing behind it are contractually confirmed.",
  commercialReadiness: "Approval Required",
  readinessCriteria: [
    "A completed cash run exists for the selected scenario, paired to the current P&L run on an activated model version.",
    "Payment lag, activation-funding timing and travel front-load are confirmed by their owners.",
    "The Year-1 trough and maximum funding requirement have been read, not just the annual figures.",
    "The conservative scenario has been reviewed, not only the baseline.",
    "Funding is identified as committed or assumed, and labelled accordingly.",
    "Break-even and payback are quoted using this page's definitions.",
    "A funding plan or set of contract terms exists for the modelled trough.",
  ],

  /* ---------------- How to use it ---------------- */
  workflow: [
    { id: "wf-1", step: 1, title: "Confirm the scenario", description: "Read the run header: model version, scenario, upstream P&L run, cash input hash and timestamp. Resolve any failure or missing-prerequisite alert first.", role: "Finance" },
    { id: "wf-2", step: 2, title: "Reconcile Revenue and P&L", description: "Confirm the paired P&L run is current for this scenario and version, since every cash figure inherits its totals.", role: "Finance" },
    { id: "wf-3", step: 3, title: "Review cash timing assumptions", description: "Check payment lag, the Q1 activation-funding share and the Q1 travel front-load against what the contract actually commits.", role: "Commercial Lead" },
    { id: "wf-4", step: 4, title: "Review staffing and mobilisation outflows", description: "Read the quarterly costs-paid line and confirm the pod ramp and mobilisation spend are timed as planned.", role: "Program Director" },
    { id: "wf-5", step: 5, title: "Review funding timing", description: "Confirm activation funding is collected when the contract commits it, not when the plan would prefer it.", role: "Deal Lead" },
    { id: "wf-6", step: 6, title: "Identify the cash trough", description: "Read the cumulative quarterly line, then the peak trough and maximum funding requirement in the Working Capital card.", role: "Finance" },
    { id: "wf-7", step: 7, title: "Identify break-even and payback", description: "Note both break-even years, the status flag, the payback year and the months to payback.", role: "Finance" },
    { id: "wf-8", step: 8, title: "Stress the payment lag", description: "Use Sensitivity Analysis to test a longer lag or later activation and see how the funding requirement moves.", role: "Finance" },
    { id: "wf-9", step: 9, title: "Review downside sustainability", description: "Switch to the conservative scenario and read funding dependency, sustainability status and model health there.", role: "Executive Sponsor" },
    { id: "wf-10", step: 10, title: "Identify required terms or funding", description: "Translate the trough into specific payment terms, milestone billing or a funding commitment the deal needs.", role: "Commercial Lead" },
    { id: "wf-11", step: 11, title: "Route changes through Assumptions", description: "Raise every timing change as a governed change set, then re-run; never adjust cash figures outside the model.", role: "Commercial Lead" },
    { id: "wf-12", step: 12, title: "Prepare the funding recommendation", description: "State the amount, the quarter it is needed, the scenario it assumes, and whether the funding is committed or assumed.", role: "Finance" },
  ],
  actionsAvailable: [
    "Switch the displayed scenario.",
    "Trigger 'Run Cash (all scenarios)' with the commercial.model.run permission.",
    "Open the lineage popover on any quarterly or annual cash row.",
    "Read the upstream P&L run, cash input hash and completion timestamp for reproducibility.",
    "Read break-even, payback and sustainability flags for the selected scenario.",
  ],
  teamActivities: [
    { id: "ta-1", activity: "Own cash calculation integrity and reconciliation", role: "Finance", cadence: "Each model revision" },
    { id: "ta-2", activity: "Validate payment terms and collection timing", role: "Commercial Lead", cadence: "Each model revision" },
    { id: "ta-3", activity: "Confirm funding commitments and their timing", role: "Deal Lead", cadence: "Before executive review" },
    { id: "ta-4", activity: "Validate staffing ramp and mobilisation spend timing", role: "Staffing Lead", cadence: "Monthly" },
    { id: "ta-5", activity: "Validate program timing behind the outflow profile", role: "Program Director", cadence: "Each model revision" },
    { id: "ta-6", activity: "Review funding dependency and sustainability", role: "Governance", cadence: "Before executive review" },
    { id: "ta-7", activity: "Approve the funding requirement", role: "Executive Sponsor", cadence: "At decision points" },
    { id: "ta-8", activity: "Convert cash constraints into negotiation positions", role: "Negotiation team", cadence: "Before contracting" },
  ],
  roles: [
    { role: "Finance", responsibility: "Owns cash calculation integrity, timing assumptions and reconciliation to Revenue and P&L." },
    { role: "Executive Sponsor", responsibility: "Approves the funding requirement and accepts the residual liquidity risk." },
    { role: "Commercial Lead", responsibility: "Owns payment terms, collection assumptions and the commercial treatment of funding." },
    { role: "Deal Lead", responsibility: "Owns funding commitments and their contractual timing." },
    { role: "Program Director", responsibility: "Owns mobilisation and program timing behind the outflow profile." },
    { role: "Staffing Lead", responsibility: "Owns the ramp that determines how early cost is incurred." },
    { role: "Governance", responsibility: "Reviews sustainability, funding dependency and change control before commitment." },
    { role: "Negotiation team", responsibility: "Converts the cash position into required contract terms." },
    { role: "Model Administrator", responsibility: "Owns model version registration, run execution and run integrity." },
  ],
  raci: [
    { activity: "Own cash calculation integrity", assignments: [{ role: "Finance", raci: "R" }, { role: "Executive", raci: "A" }, { role: "Commercial Lead", raci: "C" }, { role: "Delivery", raci: "I" }] },
    { activity: "Validate payment and collection timing", assignments: [{ role: "Commercial Lead", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Operations", raci: "C" }, { role: "Executive", raci: "I" }] },
    { activity: "Confirm funding commitment and timing", assignments: [{ role: "Commercial Lead", raci: "R" }, { role: "Executive", raci: "A" }, { role: "Finance", raci: "C" }, { role: "Delivery", raci: "I" }] },
    { activity: "Validate mobilisation and ramp outflows", assignments: [{ role: "Delivery", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Operations", raci: "C" }, { role: "Commercial Lead", raci: "I" }] },
    { activity: "Size the funding requirement and trough", assignments: [{ role: "Finance", raci: "R" }, { role: "Executive", raci: "A" }, { role: "Commercial Lead", raci: "C" }, { role: "Operations", raci: "I" }] },
    { activity: "Execute and certify cash runs", assignments: [{ role: "Administrator", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Commercial Lead", raci: "C" }, { role: "Executive", raci: "I" }] },
    { activity: "Approve the funding recommendation", assignments: [{ role: "Executive", raci: "A" }, { role: "Finance", raci: "R" }, { role: "Commercial Lead", raci: "C" }, { role: "Delivery", raci: "I" }] },
  ],
  reviewRequirements: [
    "Run header and upstream P&L run reviewed before any figure is quoted.",
    "Timing assumptions reviewed against contractual terms, not intentions.",
    "Year-1 quarterly cumulative line reviewed to locate the trough.",
    "Conservative scenario reviewed alongside the baseline.",
    "Break-even and payback quoted using this page's definitions.",
    "Funding labelled as committed or assumed.",
    "Sensitivity to payment delay reviewed before payment terms are agreed.",
  ],
  approvalRequirements: [
    "Timing assumption changes approved through an assumption change set.",
    "Model version activated through Release & Activation before baseline use.",
    "Funding requirement approved by the Executive Sponsor or CFO before commitment.",
    "Payment terms and milestone billing agreed by Commercial and the Deal Lead before contracting.",
  ],
  decisions: [
    { id: "dec-1", decision: "Whether the business will fund the modelled working-capital trough.", decidedBy: "Executive Sponsor / CFO", evidence: "Peak trough and maximum funding requirement from a completed run on an activated model version." },
    { id: "dec-2", decision: "Which payment terms or milestone billing the deal requires.", decidedBy: "Commercial Lead", evidence: "Quarterly collection profile and payment-lag sensitivity results." },
    { id: "dec-3", decision: "Whether the model is financially sustainable enough to proceed.", decidedBy: "Governance", evidence: "Sustainability status, model health, negative-EBITDA years and funding dependency." },
    { id: "dec-4", decision: "Whether the staffing ramp can be funded as planned.", decidedBy: "Finance with Staffing Lead", evidence: "Quarterly costs-paid profile against the trough and available funding." },
  ],
  whatToDoNext: [
    "Open Sensitivity Analysis to stress the payment lag and activation timing.",
    "Open Scenario Comparison to see the funding range across scenarios.",
    "Open P&L to reconcile the EBITDA behind the annual cash proxy.",
    "Open Staffing & Resources to test whether the ramp can be funded.",
    "Raise timing changes in Assumptions & Change Sets.",
    "Record the funding requirement and its conditions in Governance.",
  ],
  relatedPages: [
    { pageId: "commercial-pnl", label: "P&L (Cost & EBITDA)", route: "/commercial/model/pnl", relationship: "Prerequisite" },
    { pageId: "commercial-revenue", label: "Revenue", route: "/commercial/model/revenue", relationship: "Upstream" },
    { pageId: "commercial-assumptions", label: "Assumptions & Change Sets", route: "/commercial/model/assumptions", relationship: "Upstream" },
    { pageId: "commercial-scenarios", label: "Scenarios", route: "/commercial/scenarios", relationship: "Upstream" },
    { pageId: "commercial-sensitivity", label: "Sensitivity Analysis", route: "/commercial/model/sensitivity", relationship: "Downstream" },
    { pageId: "commercial-compare", label: "Scenario Comparison", route: "/commercial/model/compare", relationship: "Downstream" },
    { pageId: "commercial-overview", label: "Overview", route: "/commercial", relationship: "Downstream" },
    { pageId: "commercial-governance", label: "Governance", route: "/commercial/neurealm-governance", relationship: "Companion" },
  ],

  /* ---------------- Interpretation & training ---------------- */
  interpretation: [
    {
      band: "healthy",
      label: "Cash position is fundable",
      criteria: [
        "Cash timing is explicit: payment lag, funding timing and mobilisation front-load are all stated.",
        "Available funding comfortably covers the Year-1 trough.",
        "The conservative scenario remains manageable.",
        "Break-even and payback are credible on this page's definitions.",
        "Payment terms are supportable by the customer and the business.",
        "Results reconcile to the paired Revenue and P&L runs.",
      ],
      action: "Proceed to executive review with the funding amount, the quarter it is required and the scenario it assumes.",
    },
    {
      band: "warning",
      label: "Review before commitment",
      criteria: [
        "Funding is assumed rather than contractually approved.",
        "Cash is highly sensitive to a modest collection delay.",
        "Staffing and mobilisation spend begin well before receipts.",
        "Sustainability holds only in the upside scenario.",
        "Back-half cash depends on aggressive services growth.",
        "A small schedule slip would open a funding gap.",
      ],
      action: "Confirm funding commitments, stress the payment lag in Sensitivity, and agree protective contract terms before proceeding.",
    },
    {
      band: "critical",
      label: "Do not commit",
      criteria: [
        "The business cannot fund the modelled trough.",
        "Cash timing assumptions are missing or unowned.",
        "EBITDA is being presented as available cash.",
        "One-time activation funding is counted in more than one period.",
        "Payment delay is not modelled at all.",
        "A binding recommendation is being made without a funding plan.",
      ],
      action: "Stop external commitment, correct inputs through change control, re-run, and record the funding exposure in Governance.",
    },
  ],
  commonMistakes: [
    { id: "cm-1", description: "Treating recognised revenue as cash received.", correction: "Read the collected line, not the accrued line. Accrued revenue is deliberately shown beside collections so the lag is visible." },
    { id: "cm-2", description: "Treating EBITDA as cash.", correction: "Annual net cash is an EBITDA proxy with no timing content. Size funding from the Year-1 quarterly cumulative line and the trough." },
    { id: "cm-3", description: "Ignoring the collection lag when planning spend.", correction: "The lag shifts receipts by whole quarters. Costs continue meanwhile, so early quarters can be deeply negative even in a profitable year." },
    { id: "cm-4", description: "Ignoring payroll and mobilisation spend before revenue arrives.", correction: "Pod cost is paid from Q1 and travel is front-loaded into Q1. That spend must be funded before any collection occurs." },
    { id: "cm-5", description: "Assuming funding arrives immediately.", correction: "The Q1 activation-funding share is an assumption, not a contract. If the timing is not committed, state that and test a later receipt." },
    { id: "cm-6", description: "Reading annual cash instead of cumulative cash.", correction: "A positive year does not repay an earlier deficit. Read cumulative cash and the working-capital requirement to see the outstanding position." },
    { id: "cm-7", description: "Reviewing only the baseline scenario.", correction: "Switch to the conservative scenario. Funding dependency and sustainability status there are what the business must actually be able to survive." },
    { id: "cm-8", description: "Quoting payback without stating the starting investment.", correction: "Payback here is measured from the start of FY2027-Q1 until cumulative cash crosses zero; the investment is the accumulated deficit itself." },
  ],
  bestPractices: [
    "Read the run header and the paired P&L run before reading any number.",
    "Always read the accrued and collected rows together.",
    "Size funding from the Year-1 cumulative minimum, not from annual figures.",
    "State scenario, model version and input hash with every cash figure.",
    "Label funding as committed or assumed every time it is presented.",
    "Stress the payment lag before agreeing payment terms.",
    "Never present EBITDA as available cash.",
    "Route every timing change through a governed change set the same day.",
  ],
  workedExamples: [
    {
      id: "we-1",
      title: "The payment lag increases from 60 to 120 days",
      narrative:
        "Suppose the customer's standard terms push the payment lag from 60 days to 120. Nothing is edited here: the change is raised in Assumptions & Change Sets, approved, and the model is re-run. Once the cash run completes, read the effects in order. Revenue does not change — the same accounts activate and the same value is earned, so accrued revenue per quarter is identical. EBITDA does not change either, because cost recognition and revenue recognition are untouched, so the P&L page reads exactly as before. What moves is timing. The lag now spans two quarters instead of one, so the collected line shifts a further quarter to the right and one more early quarter collects nothing beyond the Q1 activation funding. Costs paid are unchanged, so quarterly net cash falls further in the early quarters, the cumulative line dips deeper, and the peak trough and maximum funding requirement both increase. Because cumulative cash starts from a deeper hole, it crosses zero later, so the payback year or months to payback move out. The deal is no less profitable than it was, but it is temporarily less fundable. The response is commercial, not accounting: negotiate shorter terms, milestone or upfront billing, or earlier activation funding, or secure additional working capital to cover the larger trough.",
      steps: [
        "Raise the payment-lag change as a governed change set and re-run cash after the P&L run.",
        "Confirm accrued revenue per quarter is unchanged.",
        "Confirm EBITDA and therefore annual net cash are unchanged.",
        "Read how far the collected line has shifted and which quarters now collect nothing.",
        "Read the new peak trough and maximum funding requirement.",
        "Read the new payback year and months.",
        "Decide between revised contract terms and additional funding, then record the decision.",
      ],
      result:
        "Unchanged profitability with a deeper trough, a larger funding requirement and later payback — a profitable deal that is temporarily unsustainable without revised terms or funding.",
    },
  ],
  faqs: [
    { id: "faq-1", question: "Why is cash lower than EBITDA?", answer: "EBITDA counts revenue when it is earned and cost when it is incurred. Cash counts money only when it is collected or paid. With a payment lag, revenue is recognised quarters before it is collected while staffing and mobilisation are paid immediately, so the cash position sits below EBITDA until collections catch up." },
    { id: "faq-2", question: "What is working capital?", answer: "The cash tied up in running the deal between paying costs and collecting revenue. Here it is expressed two ways: the Year-1 peak trough, the deepest cumulative cash position reached, and the annual working-capital requirement, the outstanding deficit at each year end floored at zero." },
    { id: "faq-3", question: "What is peak cash need?", answer: "The maximum funding requirement — the Year-1 cash trough expressed as a positive amount, floored at zero. It is the most cash the business must have available at one time. The quarterly table shows which quarter it occurs in; funding must exist by then, not on average across the year." },
    { id: "faq-4", question: "What is the difference between break-even and payback?", answer: "Break-even is reported twice: the first fiscal year EBITDA turns positive, and the first fiscal year cumulative cash turns positive. Payback matches the cash break-even year and adds months measured from the start of FY2027-Q1 until cumulative cash crosses zero. Break-even is a year; payback is a duration." },
    { id: "faq-5", question: "How does payment lag affect the model?", answer: "The lag in days is converted to whole quarters and shifts every collection forward by that many quarters. Revenue and EBITDA are unaffected. Early quarters collect less while costs continue, so the trough deepens, the funding requirement rises and payback moves later." },
    { id: "faq-6", question: "Is the Activation Fund recurring?", answer: "No. It is one-time funding, collected on its assumed timing in Q1 of Year 1 only. It must never be repeated into later periods or treated as an ongoing inflow. If its timing is not contractually committed, label it as assumed when presenting the funding position." },
    { id: "faq-7", question: "Why can a profitable deal need funding?", answer: "Because profit and liquidity are different questions. Pod staffing and mobilisation are paid from the first quarter while collections are lag-shifted, so cash goes negative before it recovers. The deal can show positive EBITDA and still require funding to survive the trough in between." },
    { id: "faq-8", question: "Where should a cash-timing assumption be changed?", answer: "Not here — this page is read-only output. Payment lag, activation-funding timing and the travel front-load are governed assumptions changed through a change set in Assumptions & Change Sets, with evidence in Sources. After approval, re-run the P&L and then cash, and read the new result here." },
  ],
  glossary: [
    { term: "Cash Inflow", definition: "Money actually received in a period. Here it is the collected line: lag-shifted revenue plus the Q1 share of activation funding." },
    { term: "Cash Outflow", definition: "Money actually paid in a period. Here it is Year-1 delivery and operating cost spread across four quarters, with travel front-loaded into Q1." },
    { term: "Net Cash Flow", definition: "Inflows less outflows for the period — quarterly in Year 1, and as an EBITDA proxy for each fiscal year thereafter." },
    { term: "Cumulative Cash", definition: "The running sum of net cash flow. Its minimum is the trough; its first non-negative year is the cash break-even year." },
    { term: "Working Capital", definition: "Cash tied up between paying costs and collecting revenue; reported as the Year-1 trough and as an annual requirement floored at zero." },
    { term: "Cash Trough", definition: "The deepest cumulative cash position reached in Year 1, and the basis for the maximum funding requirement." },
    { term: "Break-Even", definition: "Reported twice: the first fiscal year with non-negative EBITDA, and the first fiscal year with non-negative cumulative cash." },
    { term: "Payback", definition: "The year cumulative cash crosses zero, plus months measured from the start of FY2027-Q1 with linear interpolation inside that year." },
    { term: "Payment Lag", definition: "The governed delay between revenue recognition and cash receipt, seeded at 60 days and applied in whole quarters." },
    { term: "Sustainability", definition: "Sustainable when break-even is achieved and terminal FY2031 cumulative cash is positive; otherwise at risk. Model health also weighs negative-EBITDA years." },
    { term: "Cash Conversion", definition: "Annual net cash divided by revenue for the same year; an operating-efficiency measure, not a collections measure." },
    { term: "Funding Dependency", definition: "The greatest of the Year-1 maximum funding requirement and the largest annual working-capital requirement." },
  ],
  executiveTakeaway:
    "This page answers whether the deal is fundable, not just whether it is profitable. Year-1 quarters show revenue recognised, cash collected after the payment lag, and cost paid with mobilisation travel front-loaded into Q1 — the ordering that creates the working-capital trough and sets the peak funding need. Annual cash from FY2028 is an EBITDA proxy, so it carries no timing and must never be read as a collections forecast. Quote both break-even definitions, state payback with its FY2027-Q1 starting point, name the scenario, and say plainly whether the funding covering the trough is committed or merely assumed.",
  keyRisks: [
    "The working-capital trough exceeds the funding the business will commit.",
    "Activation funding is assumed on Q1 timing that the contract does not commit.",
    "A longer payment lag or later activation deepens the trough and delays payback.",
    "The EBITDA cash proxy hides annual timing risk from FY2028 onwards.",
    "One-time funding is treated as recurring when assessing sustainability.",
    "Only the baseline scenario is reviewed, understating downside funding need.",
    "Payment terms are agreed before payment-lag sensitivity has been tested.",
    "A binding commercial recommendation is issued without an approved funding plan.",
  ],

  /* ---------------- Show on page ---------------- */
  showOnPageTargets: [
    { targetId: "cash-context", label: "Scope and model context", description: "Page header, cash-engine scope statement and the run action." },
    { targetId: "cash-run-header", label: "Run header", description: "Model version, scenario, upstream P&L run and cash input hash." },
    { targetId: "cash-scenario", label: "Scenario selector", description: "Switches which scenario's completed cash run is displayed." },
    { targetId: "cash-timing", label: "Year-1 quarterly cash and timing", description: "Payment lag, Q1 activation funding and Q1 travel front-load made visible by quarter." },
    { targetId: "cash-accrued", label: "Accrued revenue", description: "Recognition line, shown to distinguish revenue earned from cash received." },
    { targetId: "cash-inflows", label: "Cash collected", description: "Lag-shifted collections plus the Q1 activation-funding share." },
    { targetId: "cash-outflows", label: "Cash costs paid", description: "Quarterly delivery and operating cash cost with travel front-loaded into Q1." },
    { targetId: "cash-net", label: "Quarterly net cash flow", description: "Collections less costs paid for each Year-1 quarter." },
    { targetId: "cash-cumulative", label: "Cumulative quarterly cash", description: "Running Year-1 position whose minimum defines the trough." },
    { targetId: "cash-peak-need", label: "Working capital and peak funding need", description: "Peak Year-1 trough and the maximum funding requirement." },
    { targetId: "cash-summary", label: "Annual cash summary", description: "Annual net and cumulative cash, conversion and working-capital requirement." },
    { targetId: "cash-annual-net", label: "Annual net cash", description: "EBITDA used as the declared annual cash proxy." },
    { targetId: "cash-annual-cumulative", label: "Cumulative annual cash", description: "Running five-year position behind cash break-even and payback." },
    { targetId: "cash-conversion", label: "Cash conversion", description: "Annual net cash as a percentage of revenue for the same year." },
    { targetId: "cash-wc-requirement", label: "Working-capital requirement", description: "Outstanding funding requirement at each fiscal year end." },
    { targetId: "cash-breakeven", label: "Break-even", description: "First positive EBITDA year, first positive cumulative cash year and status." },
    { targetId: "cash-payback", label: "Payback", description: "Payback year and months from the start of FY2027-Q1." },
    { targetId: "cash-sustainability", label: "Financial sustainability", description: "Negative-EBITDA years, funding dependency, sustainability status and model health." },
  ],
};
