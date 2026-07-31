import type { CommercialGuideContent } from "../../types";

/**
 * Page-specific Commercial Guide content — Scenario Comparison
 * (`/commercial/model/compare`, prefix — the detail route
 * `/commercial/model/compare/:id` shares this guide).
 *
 * Authored strictly against what renders in
 * `src/commercial/pages/CommercialCompare.tsx` and
 * `src/commercial/pages/CommercialCompareDetail.tsx`:
 *
 *  - List page: header, a Model context card (program, model version code,
 *    version status), a permission-gated "New comparison" form (title, mode
 *    of Pairwise / Three-way / Historical runs, baseline scenario, compared
 *    scenario checkboxes, included scopes revenue / pnl / cash, an optional
 *    Rationale textarea, Create draft), a Comparisons register table (title,
 *    mode, scenario count, scopes, status, stale-at-save flag, updated, Open)
 *    and a read-only comparison-layer alert.
 *  - Detail page: title, badges (mode, status, stale at save, baseline vs
 *    compared scenarios, scopes), description, Save snapshot and Archive
 *    actions, a Readiness table per scenario × scope (state Current / Stale /
 *    Missing, latest run, latest apply), a stale-scope alert, and three tabs —
 *    Metrics (metric code, fiscal period, compared-vs scenario, baseline,
 *    compared, Δ, Δ%, direction), Summary (roll-up of PNL-REVENUE,
 *    PNL-GROSS-PROFIT, PNL-EBITDA, PNL-EBITDA-MARGIN, CASH-MAX-FUNDING,
 *    CASH-PAYBACK) and Assumptions (code, scenario, value, unit, differs) —
 *    plus a Source-run manifest card with manifest and content hashes.
 *
 * Concepts requested but NOT present (a staffing comparison scope, an
 * activation or timing comparison, a risk or confidence comparison, a
 * structured recommendation record, an account-scope comparability check and
 * an executive export) are described only as practice or recorded as known
 * gaps. No numeric result is invented, and no calculation, saved comparison
 * or scenario record is changed by this guide.
 */
export const commercialCompareGuide: CommercialGuideContent = {
  pageId: "commercial-compare",
  route: "/commercial/model/compare",
  match: "prefix",
  pageTitle: "Scenario Comparison",
  guideTitle: "Scenario Comparison — Choosing a Planning Case on Tradeoffs, Not One Metric",
  audiences: ["Executive", "Commercial Lead", "Finance", "Delivery", "Operations", "Administrator", "Sales"],
  modes: ["executive", "practitioner", "administrator"],
  estimatedReadingMinutes: 13,
  trainingLevel: "Advanced",
  lastUpdated: "2026-07-31",

  /* ---------------- Overview ---------------- */
  purpose:
    "Scenario Comparison sets one baseline scenario against one or more compared scenarios and reports the difference in persisted Revenue, P&L and Cash results, plus the effective assumption differences that produced them. It exists so a planning case is chosen on the full tradeoff — economics, funding, feasibility, timing and risk — rather than on whichever scenario shows the largest revenue or EBITDA.",
  represents:
    "A register of named comparisons. Each holds a mode (pairwise, three-way or historical), a baseline scenario, the compared scenarios, the included scopes, a readiness state per scenario and scope, variance rows by metric and fiscal period, effective assumption differences, and — once saved — an immutable snapshot with a source-run manifest hash and a content hash. It represents measured difference, not a decision.",
  whyItMatters:
    "Scenarios are only useful when they are compared honestly. The highest-revenue case usually demands the most staffing, the most funding and the fastest activation, and those costs are invisible if only the headline is read. Comparing on a common baseline, with readiness and assumption differences on screen, is what turns competing cases into a defensible recommendation.",
  moduleConnection:
    "Comparison sits downstream of Scenarios, Assumptions and the Revenue, P&L and Cash engines, and upstream of executive decision-making. It reads persisted run results for the selected scenarios — it never re-runs the model — and reports variance and assumption differences. Its output feeds the scenario recommendation, the negotiation position, Governance, Release & Activation and Overview.",
  questionsAnswered: [
    "How do the scenarios actually differ?",
    "What assumption changes create the difference?",
    "Which scenario is economically strongest?",
    "Which scenario is most feasible to deliver?",
    "Which scenario requires the most funding?",
    "Which scenario carries the most risk?",
    "Which assumptions must be negotiated?",
    "Which scenario should be approved as the planning case?",
  ],
  expectedOutcome:
    "A saved, reproducible comparison on a common model version with the deltas explained by driver differences, the funding and feasibility consequences stated, and a recommended planning case carrying explicit rationale and enabling conditions — ready for governance approval.",
  lifecycleStages: [
    "Financial Modeling",
    "Executive Review",
    "Negotiation",
    "Delivery Planning",
    "Continuous Improvement",
  ],
  prerequisites: [
    { id: "pre-scenarios", label: "Valid scenarios", route: "/commercial/scenarios", detail: "At least a baseline and one compared scenario must exist; the form defaults to the scenario flagged as baseline." },
    { id: "pre-version", label: "Draft model version", route: "/commercial/model/assumptions", detail: "Without a program and model version the page shows an empty state and no comparison can be created." },
    { id: "pre-runs", label: "Completed model runs", route: "/commercial/model/revenue", detail: "Comparison reads persisted results only. A scope with no completed run appears as Missing in Readiness." },
    { id: "pre-periods", label: "Comparable fiscal periods", detail: "Variance rows only appear where the same metric and fiscal period exist on both sides; non-overlapping metrics are simply absent." },
    { id: "pre-scope", label: "Comparable portfolio scope", detail: "The page does not test whether two scenarios cover the same accounts. Confirm scope equivalence in Portfolio before comparing." },
    { id: "pre-financials", label: "Current Revenue, P&L and Cash results", detail: "Readiness marks each scenario × scope as Current, Stale or Missing; refresh stale scopes from their own pages before saving." },
    { id: "pre-assumptions", label: "Known assumptions and confidence", route: "/commercial/model/assumptions", detail: "The Assumptions tab shows applied values only; Draft and Cancelled proposals are excluded and confidence is judged outside the page." },
  ],
  ownership: {
    businessOwner: "Deal Lead",
    commercialOwner: "Commercial Lead",
    technicalOwner: "Finance (analytical owner) with Model Administrator",
    executiveApprover: "Executive Sponsor",
    primaryUsers: ["Deal Lead", "Commercial Lead", "Finance", "Program Director", "Delivery Lead", "Staffing Lead"],
    consumersOfOutput: ["Executive Sponsor", "Governance", "Negotiation team", "Release & Activation", "Overview"],
  },

  /* ---------------- How it works ---------------- */
  sections: [
    {
      id: "sec-context",
      title: "Model context",
      targetId: "comparison-context",
      explanation:
        "The context card names the program, the model version code and the version status. Every comparison is created against that single model version, which is what makes the two sides of a delta legitimately comparable. If the version status is not what you expect, stop: a comparison built on the wrong version will look perfectly reasonable and be wrong.",
    },
    {
      id: "sec-selector",
      title: "Comparison selection",
      targetId: "comparison-selector",
      explanation:
        "The New comparison form is permission-gated on comparison-create. It takes a required title and a mode: Pairwise (baseline vs exactly one), Three-way (baseline vs two) or Historical runs. Creating produces a draft — nothing is persisted as a snapshot until Save. Title the comparison after the decision it supports, because the register is browsed by title alone.",
    },
    {
      id: "sec-scenarios",
      title: "Scenario cards and selection",
      targetId: "comparison-scenarios",
      explanation:
        "One baseline scenario is chosen from the scenario list, defaulting to the flagged baseline, and the compared scenarios are selected as checkboxes from the remainder. If none are ticked, every other scenario is compared by default. Pairwise mode rejects a submission that does not carry exactly one compared scenario. All deltas are expressed relative to the chosen baseline.",
    },
    {
      id: "sec-scopes",
      title: "Included scopes — revenue, P&L and cash",
      targetId: "comparison-scopes",
      explanation:
        "Three scopes can be included: revenue, pnl and cash, all selected by default. The scopes decide which persisted results are read and therefore which metrics can be compared. Dropping cash is the most common and most damaging narrowing — a scenario can improve EBITDA while demanding materially more funding, and that only shows in the cash scope.",
    },
    {
      id: "sec-rationale",
      title: "Rationale and recommendation",
      targetId: "comparison-recommendation",
      explanation:
        "The optional Rationale field is the only free-text field on the comparison, and it is displayed as the description on the detail page. There is no structured recommendation record, no conditions list and no approval field. Use the rationale to state the decision question, the recommended case, why it is recommended and what conditions must hold for the recommendation to survive.",
    },
    {
      id: "sec-saved",
      title: "Saved and archived comparisons",
      targetId: "comparison-saved",
      explanation:
        "The register lists every comparison for the program with its title, mode, scenario count, included scopes, status, a Stale-at-save flag where applicable, the last update and an Open action. Status is draft, saved or archived. Saved comparisons keep the results as they were; archived comparisons stay readable and remain visibly distinguishable rather than being deleted.",
    },
    {
      id: "sec-readiness",
      title: "Readiness — comparability check",
      targetId: "comparison-readiness",
      explanation:
        "Readiness reports each scenario × scope as Current, Stale or Missing, with the latest run timestamp and the latest assumption-apply timestamp. It is the comparability control on this page: Stale means assumptions moved after the last run, Missing means there is no run at all. A destructive alert appears whenever any selected scope is stale.",
    },
    {
      id: "sec-deltas",
      title: "Delta table — variance rows",
      targetId: "comparison-deltas",
      explanation:
        "The Metrics tab lists every overlapping metric: metric code, fiscal period, the compared scenario, the baseline value, the compared value, the absolute delta, the percentage delta and a variance direction of favourable, unfavourable or neutral. Draft comparisons show a live calculation from persisted results; saved comparisons show the immutable snapshot. Nothing here is recomputed by the model.",
    },
    {
      id: "sec-financials",
      title: "Financial comparison — revenue, EBITDA, margin and cash roll-up",
      targetId: "comparison-financials",
      explanation:
        "The Summary tab rolls up six key codes: PNL-REVENUE, PNL-GROSS-PROFIT, PNL-EBITDA, PNL-EBITDA-MARGIN, CASH-MAX-FUNDING and CASH-PAYBACK, each showing up to six rows of fiscal period, compared scenario, percentage variance and direction. Read maximum funding and payback next to EBITDA — those two cash codes are how a flattering profit case reveals its true cost.",
    },
    {
      id: "sec-drivers",
      title: "Driver differences — effective assumptions",
      targetId: "comparison-drivers",
      explanation:
        "The Assumptions tab lists the effective assumption values per scenario — code, scenario, value, unit and a Changed marker where the value differs from the baseline — using applied values only, with Draft and Cancelled proposals excluded. This is what makes a delta traceable: every financial difference should be explainable by one or more rows flagged as Changed here.",
    },
    {
      id: "sec-actions",
      title: "Save and archive actions",
      targetId: "comparison-actions",
      explanation:
        "A draft can be saved as an immutable snapshot by a user with save permission; the confirmation dialog restates the scenarios, the scopes and whether any scope is stale or missing before you commit. A saved comparison can be archived by a user with archive permission. Archived comparisons remain readable and fully immutable. No action re-runs the model.",
    },
    {
      id: "sec-lineage",
      title: "Source-run manifest",
      targetId: "comparison-lineage",
      explanation:
        "The manifest card shows the source-run manifest hash, the content hash and the raw manifest, freezing exactly which model runs produced the compared figures. This is the reproducibility record: it is how a comparison quoted in a board pack months later can still be traced back to the specific runs behind it.",
    },
  ],
  inputs: [
    { id: "in-title", label: "Comparison title", description: "Required name; the register is browsed by title only.", owner: "Deal Lead", required: true },
    { id: "in-mode", label: "Mode", description: "Pairwise (baseline vs 1), Three-way (baseline vs 2) or Historical runs.", owner: "Finance", required: true },
    { id: "in-baseline", label: "Baseline scenario", description: "The reference case for every delta; defaults to the flagged baseline.", owner: "Commercial Lead", source: "Scenarios", required: true },
    { id: "in-compared", label: "Compared scenarios", description: "Checkbox selection; if none are ticked, all other scenarios are compared.", owner: "Commercial Lead", source: "Scenarios", required: true },
    { id: "in-scopes", label: "Included scopes", description: "Any of revenue, pnl and cash; all three are selected by default.", owner: "Finance", required: true },
    { id: "in-rationale", label: "Rationale", description: "Optional free text shown as the description on the detail page; the only place a recommendation can be recorded.", owner: "Deal Lead" },
    { id: "in-version", label: "Model version", description: "Bound automatically from the program's draft model version at creation.", owner: "Model Administrator", source: "Model context", required: true },
    { id: "in-runs", label: "Persisted model runs", description: "Completed Revenue, P&L and Cash results for each selected scenario and scope.", owner: "Finance", source: "Revenue, P&L and Cash pages", required: true },
  ],
  outputs: [
    { id: "out-readiness", label: "Readiness matrix", description: "Current, Stale or Missing per scenario × scope with latest run and latest apply timestamps.", consumedBy: ["Finance", "Model Administrator", "Governance"] },
    { id: "out-deltas", label: "Scenario deltas", description: "Baseline value, compared value, absolute delta, percentage delta and direction by metric and fiscal period.", consumedBy: ["Finance", "Executive Sponsor", "Negotiation team"] },
    { id: "out-summary", label: "Key metric roll-up", description: "Revenue, gross profit, EBITDA, EBITDA margin, maximum funding and payback variances.", consumedBy: ["Executive Sponsor", "Finance"] },
    { id: "out-drivers", label: "Effective assumption differences", description: "Applied assumption values per scenario with a Changed marker against the baseline.", consumedBy: ["Commercial Lead", "Negotiation team", "Governance"] },
    { id: "out-funding", label: "Funding comparison", description: "Maximum funding requirement and payback difference between the cases, from the cash scope.", consumedBy: ["Finance", "Executive Sponsor"] },
    { id: "out-snapshot", label: "Immutable saved comparison", description: "A frozen result set with source-run manifest hash and content hash.", consumedBy: ["Governance", "Release & Activation", "Audit"] },
    { id: "out-recommendation", label: "Recommended planning case and conditions", description: "Recorded in the rationale text and carried into governance; not a structured field on the page.", consumedBy: ["Executive Sponsor", "Governance", "Overview"] },
  ],
  businessRules: [
    { id: "br-1", rule: "Compared scenarios must use compatible time periods.", explanation: "Variance rows are produced only where the same metric and fiscal period exist on both sides. Non-overlapping periods are silently absent rather than flagged, so period comparability must be confirmed by reading the delta table, not assumed." },
    { id: "br-2", rule: "Scope differences must be disclosed.", explanation: "The page performs no account-scope comparability check. If two scenarios cover different accounts or a different portfolio, state that in the rationale before the comparison is read by anyone else." },
    { id: "br-3", rule: "Model-version context must be clear.", explanation: "Each comparison is created against one program and one model version, shown in the Model context card and frozen in the source-run manifest. Never present figures from comparisons built on different model versions as equivalent." },
    { id: "br-4", rule: "Comparisons never re-run the model.", explanation: "This is a read-only layer over persisted Revenue, P&L and Cash results. Stale scopes are shown as-is; refreshing requires re-running from the Revenue, P&L or Cash pages before the comparison is saved." },
    { id: "br-5", rule: "Financial metrics must be read alongside cash, capacity, timing and risk.", explanation: "The summary deliberately places CASH-MAX-FUNDING and CASH-PAYBACK next to EBITDA. Capacity, timing and risk are not modelled here and must be brought in from Staffing & Resources, Timelines and the risk register." },
    { id: "br-6", rule: "The highest EBITDA scenario is not automatically the best decision.", explanation: "A superior EBITDA delta that depends on more funding, faster activation or unapproved staffing is a conditional outcome, not a recommendation. The decision is the tradeoff, not the single largest favourable number." },
    { id: "br-7", rule: "A scenario requiring unapproved authority or staffing is not decision-ready.", explanation: "If the upside depends on headcount, spend or customer access nobody has approved, the scenario can be recommended only with those approvals named as enabling conditions." },
    { id: "br-8", rule: "Differences must be traceable to drivers.", explanation: "Every material financial delta should map to assumption rows flagged as Changed in the Assumptions tab. An unexplained delta means a stale run, a scope mismatch or a modelling error — investigate before presenting it." },
    { id: "br-9", rule: "Saved comparisons retain their scenario versions.", explanation: "Saving freezes the result set, the source-run manifest hash and the content hash. Later scenario edits do not alter a saved comparison, which is why a saved snapshot can be cited long after the scenarios themselves have moved." },
    { id: "br-10", rule: "Archived comparisons remain distinguishable.", explanation: "Archiving retires a comparison without deleting it. It stays readable and fully immutable, carrying its archived status in the register so superseded analysis is never mistaken for current analysis." },
    { id: "br-11", rule: "A stale or missing scope must be disclosed at save.", explanation: "The save dialog states whether any scope is stale or missing and the record carries a Stale-at-save badge. Saving over a stale scope is permitted but must be explained wherever the comparison is quoted." },
    { id: "br-12", rule: "The recommendation must carry rationale and conditions.", explanation: "The page offers only a free-text rationale, so the discipline is editorial: name the recommended case, the tradeoff accepted, and the conditions required for it to hold. A comparison without a recommendation is analysis, not a decision package." },
  ],
  calculationLogic: [
    "No formula is executed on this page. All figures are read from persisted Revenue, P&L and Cash run results.",
    "A variance row is produced for each metric code and fiscal period present for both the baseline and a compared scenario.",
    "Absolute variance is the compared value less the baseline value.",
    "Percentage variance is the absolute variance expressed against the baseline value, displayed to one decimal place.",
    "Variance direction is reported as favourable, unfavourable or neutral and is shown with its own indicator.",
    "The Summary tab filters the variance rows to six key codes: PNL-REVENUE, PNL-GROSS-PROFIT, PNL-EBITDA, PNL-EBITDA-MARGIN, CASH-MAX-FUNDING and CASH-PAYBACK, showing up to six rows each.",
    "Readiness compares the latest completed run timestamp with the latest assumption-apply timestamp per scenario and scope to derive Current, Stale or Missing.",
    "The Assumptions tab shows effective applied values only and marks each row that differs from the baseline; Draft and Cancelled proposals are excluded.",
    "Saving persists the current calculation together with a source-run manifest hash and a content hash; the snapshot is thereafter immutable.",
  ],
  relationship: {
    receivesFrom: ["Scenarios", "Assumptions & Change Sets", "Revenue model", "P&L model", "Cash model", "Sensitivity findings", "Staffing & Resources", "Timelines and activation plans", "Risk register"],
    models: ["Assumption differences", "Revenue variance", "Cost and EBITDA variance", "Margin variance", "Cash and funding variance", "Readiness and staleness", "Immutable comparison snapshots"],
    feeds: ["Scenario recommendation", "Executive decision", "Negotiation position", "Governance", "Release & Activation selection", "Overview"],
  },
  downstreamImpacts: [
    { area: "Revenue", effect: "Shows which case delivers more revenue and over which fiscal periods it arrives." },
    { area: "EBITDA", effect: "Quantifies the profit gap between cases and whether it is sustained or concentrated." },
    { area: "Cash", effect: "Exposes the maximum funding and payback consequence of the more ambitious case." },
    { area: "Staffing", effect: "Prompts a capacity check whenever the favoured case implies higher delivery volume." },
    { area: "Activation", effect: "Prompts a timing check where the delta depends on a faster ramp." },
    { area: "Risk", effect: "Frames the chosen case as a set of accepted risks with named enabling conditions." },
    { area: "Governance", effect: "Provides the immutable, hashed evidence pack behind a scenario approval." },
  ],
  dataQuality: {
    dataSources: ["Scenario records", "Draft model version", "Persisted Revenue, P&L and Cash run results", "Effective applied assumptions", "Comparison, result and manifest records"],
    updateFrequency: "On demand — draft comparisons recalculate from persisted results when opened; saved comparisons never change.",
    knownGaps: [
      "No staffing or capacity comparison scope; only revenue, pnl and cash can be included.",
      "No activation or timing comparison view on the page.",
      "No risk or confidence comparison; risk must be assessed outside the tool.",
      "No structured recommendation, decision-conditions or approval field — only a free-text rationale.",
      "No account-scope comparability check between the compared scenarios.",
      "No warning when fiscal periods do not overlap; non-matching rows are simply absent.",
      "No graphical delta or tradeoff visualisation; all output is tabular.",
      "No executive export or presentation pack generated from a comparison.",
      "No side-by-side view of two saved comparisons.",
      "The Summary roll-up shows at most six rows per key metric code.",
    ],
    changeControl: "Comparisons are read-only over the model. Saving freezes the results with a source-run manifest hash and a content hash; archiving retires a saved comparison without deleting it. Changing an assumption requires a change set in Assumptions & Change Sets, and adopting a case as the released model requires Release & Activation.",
    lineage: "Each saved comparison records its program, model version, baseline and compared scenarios, included scopes, source-run manifest and content hash.",
  },
  modelConfidence: "Medium",
  confidenceBasis: ["Revenue assumptions", "Cost assumptions", "Timing", "Commercial terms", "Governance approvals", "Source completeness"],
  confidenceGuidance:
    "Confidence in the arithmetic is high — deltas are read from persisted, hashed runs and saved snapshots are immutable. Confidence in the conclusion depends on comparability. Treat a comparison as decision-grade when every scenario × scope shows Current, the scenarios cover the same portfolio scope, the periods overlap and the deltas trace to Changed assumption rows. Treat it as indicative otherwise.",
  commercialReadiness: "Review Required",
  readinessCriteria: [
    "All selected scenario × scope combinations show Current in Readiness — none Stale or Missing.",
    "The comparison was created on the intended program and model version.",
    "Portfolio and account scope equivalence has been confirmed outside the page.",
    "Fiscal periods overlap for the metrics being cited.",
    "Every material delta traces to an assumption row flagged Changed.",
    "Cash maximum funding and payback have been reviewed alongside EBITDA.",
    "Staffing, activation timing and risk have been assessed for the favoured case.",
    "The rationale names the recommended case, its tradeoffs and its enabling conditions.",
    "The comparison has been saved so the evidence is reproducible.",
  ],

  /* ---------------- How to use it ---------------- */
  workflow: [
    { id: "wf-1", step: 1, title: "Confirm the model context", description: "Check the program, model version code and status before creating anything.", role: "Finance" },
    { id: "wf-2", step: 2, title: "Select the scenarios", description: "Choose the baseline and the compared scenarios, and pick a mode consistent with that selection.", role: "Deal Lead" },
    { id: "wf-3", step: 3, title: "Confirm scope and period comparability", description: "Verify the scenarios cover the same portfolio and the same fiscal periods; disclose any difference in the rationale.", role: "Commercial Lead" },
    { id: "wf-4", step: 4, title: "Include all three scopes", description: "Keep revenue, pnl and cash included unless narrowing is deliberate and stated.", role: "Finance" },
    { id: "wf-5", step: 5, title: "Create the draft and check readiness", description: "Open the draft and confirm every scenario × scope shows Current rather than Stale or Missing.", role: "Finance" },
    { id: "wf-6", step: 6, title: "Review driver differences", description: "Open the Assumptions tab and identify which applied values are flagged as Changed against the baseline.", role: "Commercial Lead" },
    { id: "wf-7", step: 7, title: "Compare revenue", description: "Read the PNL-REVENUE roll-up and the underlying variance rows by fiscal period.", role: "Finance" },
    { id: "wf-8", step: 8, title: "Compare cost, EBITDA and margin", description: "Read gross profit, EBITDA and EBITDA margin variances together rather than in isolation.", role: "Finance" },
    { id: "wf-9", step: 9, title: "Compare cash", description: "Read CASH-MAX-FUNDING and CASH-PAYBACK to establish the funding cost of the more ambitious case.", role: "Finance" },
    { id: "wf-10", step: 10, title: "Compare staffing, activation and risk", description: "Take the deltas to Staffing & Resources, Timelines and the risk register; none of these are modelled on this page.", role: "Program Director" },
    { id: "wf-11", step: 11, title: "Identify enabling conditions", description: "Name the approvals, capacity and customer access the favoured case depends on.", role: "Delivery Lead" },
    { id: "wf-12", step: 12, title: "Document the recommendation", description: "Write the recommended case, the tradeoff accepted and the conditions into the rationale.", role: "Deal Lead" },
    { id: "wf-13", step: 13, title: "Save the snapshot", description: "Save to freeze the results, manifest hash and content hash so the evidence is reproducible.", role: "Finance" },
    { id: "wf-14", step: 14, title: "Route for governance approval", description: "Present the saved comparison to the Executive Sponsor and Governance, then archive superseded comparisons.", role: "Governance" },
  ],
  actionsAvailable: [
    "Create a draft comparison with a title, mode, baseline scenario, compared scenarios, included scopes and optional rationale (requires create permission).",
    "Browse the comparisons register with mode, scenario count, scopes, status, stale-at-save flag and last update.",
    "Open a comparison to see readiness, variance rows, key metric roll-up, assumption differences and the source-run manifest.",
    "Review readiness per scenario × scope with latest run and latest apply timestamps.",
    "Save a draft as an immutable snapshot after confirming stale and missing scopes in the dialog (requires save permission).",
    "Archive a saved comparison (requires archive permission).",
    "Read the source-run manifest hash and content hash for reproducibility.",
  ],
  teamActivities: [
    { id: "ta-1", activity: "Scenario shortlist for comparison", role: "Deal Lead with Commercial Lead", cadence: "Each modelling cycle" },
    { id: "ta-2", activity: "Comparability review — scope, periods, model version", role: "Finance", cadence: "Before every comparison is saved" },
    { id: "ta-3", activity: "Driver difference walkthrough", role: "Commercial Lead with Finance", cadence: "Each comparison" },
    { id: "ta-4", activity: "Feasibility and capacity assessment of the favoured case", role: "Program Director / Staffing Lead", cadence: "Before any recommendation" },
    { id: "ta-5", activity: "Funding and cash tradeoff review", role: "Finance", cadence: "Each executive review" },
    { id: "ta-6", activity: "Recommendation and enabling-conditions drafting", role: "Deal Lead", cadence: "Ahead of each gate decision" },
    { id: "ta-7", activity: "Archiving superseded comparisons", role: "Model Administrator", cadence: "After each decision" },
  ],
  roles: [
    { role: "Deal Lead", responsibility: "Owns the comparison as a business artefact and drafts the recommendation and its conditions." },
    { role: "Finance", responsibility: "Analytical owner — validates comparability, reads the deltas and the funding consequence, and saves the snapshot." },
    { role: "Commercial Lead", responsibility: "Owns the scenario design and explains each delta through its driver differences." },
    { role: "Program Director", responsibility: "Assesses timing and activation feasibility of the favoured case." },
    { role: "Delivery Lead", responsibility: "Confirms the delivery model implied by the recommended case is executable." },
    { role: "Staffing Lead", responsibility: "Confirms the capacity the favoured case assumes is approved and resourceable." },
    { role: "Governance", responsibility: "Requires the saved snapshot, rationale and conditions before endorsing a planning case." },
    { role: "Executive Sponsor", responsibility: "Approves the planning case and accepts the stated tradeoffs and risks." },
    { role: "Negotiation team", responsibility: "Converts the assumption differences into the terms to be negotiated." },
  ],
  raci: [
    { activity: "Select scenarios and create the comparison", assignments: [{ role: "Finance", raci: "R" }, { role: "Deal Lead", raci: "A" }, { role: "Commercial Lead", raci: "C" }, { role: "Governance", raci: "I" }] },
    { activity: "Confirm comparability — scope, periods, model version", assignments: [{ role: "Finance", raci: "R" }, { role: "Commercial Lead", raci: "A" }, { role: "Program Director", raci: "C" }, { role: "Executive Sponsor", raci: "I" }] },
    { activity: "Assess feasibility, staffing and risk", assignments: [{ role: "Program Director", raci: "R" }, { role: "Delivery Lead", raci: "A" }, { role: "Staffing Lead", raci: "C" }, { role: "Finance", raci: "I" }] },
    { activity: "Recommend the planning case", assignments: [{ role: "Deal Lead", raci: "R" }, { role: "Executive Sponsor", raci: "A" }, { role: "Finance", raci: "C" }, { role: "Governance", raci: "I" }] },
    { activity: "Save and archive comparison snapshots", assignments: [{ role: "Finance", raci: "R" }, { role: "Model Administrator", raci: "A" }, { role: "Governance", raci: "C" }, { role: "Deal Lead", raci: "I" }] },
  ],
  reviewRequirements: [
    "Model version and program confirmed in the Model context card.",
    "Readiness reviewed for every scenario × scope; stale or missing states explained.",
    "Portfolio and account scope equivalence confirmed and any difference disclosed.",
    "Fiscal period overlap confirmed for the metrics being cited.",
    "Each material delta traced to an assumption row flagged Changed.",
    "Cash funding and payback reviewed alongside EBITDA and margin.",
    "Staffing, activation timing and risk assessed for the favoured case.",
    "Rationale reviewed for a named recommendation, tradeoffs and enabling conditions.",
  ],
  approvalRequirements: [
    "Creating, saving and archiving comparisons each require their own permission; without them the page is read-only.",
    "Saving a comparison is an evidence act, not an approval — it grants no decision authority.",
    "The recommended planning case requires Executive Sponsor approval.",
    "Enabling conditions involving unapproved staffing, spend or authority require their own approvals before the case is committed.",
    "Adopting a case as the released model requires certification in Release & Activation.",
  ],
  decisions: [
    { id: "dec-1", decision: "Which scenario becomes the planning case", decidedBy: "Executive Sponsor on the Deal Lead's recommendation", evidence: "Saved comparison with deltas, funding comparison, feasibility assessment and rationale" },
    { id: "dec-2", decision: "Which assumptions to negotiate", decidedBy: "Deal Lead with Commercial Lead", evidence: "Assumption rows flagged Changed and their financial deltas" },
    { id: "dec-3", decision: "Whether the funding profile of the ambitious case is acceptable", decidedBy: "Finance with Executive Sponsor", evidence: "CASH-MAX-FUNDING and CASH-PAYBACK variances" },
    { id: "dec-4", decision: "Whether the favoured case is operationally feasible", decidedBy: "Program Director with Delivery and Staffing Leads", evidence: "Capacity and activation review carried out outside this page" },
    { id: "dec-5", decision: "Whether a comparison should be archived as superseded", decidedBy: "Model Administrator with Finance", evidence: "A newer saved comparison on a current model version" },
  ],
  whatToDoNext: [
    "Refresh any stale scope from the Revenue, P&L or Cash page and rebuild the comparison.",
    "Test the assumptions that create the biggest deltas in Sensitivity Analysis.",
    "Validate the capacity implied by the favoured case in Staffing & Resources.",
    "Check activation and timing feasibility in Timelines.",
    "Raise a change set in Assumptions & Change Sets for any negotiated value.",
    "Present the saved comparison and its conditions to Governance.",
    "Take the approved planning case to Release & Activation.",
  ],
  relatedPages: [
    { pageId: "commercial-scenarios", label: "Scenarios", route: "/commercial/scenarios", relationship: "Prerequisite" },
    { pageId: "commercial-assumptions", label: "Assumptions & Change Sets", route: "/commercial/model/assumptions", relationship: "Prerequisite" },
    { pageId: "commercial-revenue", label: "Revenue", route: "/commercial/model/revenue", relationship: "Upstream" },
    { pageId: "commercial-pnl", label: "P&L (Cost & EBITDA)", route: "/commercial/model/pnl", relationship: "Upstream" },
    { pageId: "commercial-cash", label: "Cash & Sustainability", route: "/commercial/model/cash", relationship: "Upstream" },
    { pageId: "commercial-sensitivity", label: "Sensitivity Analysis", route: "/commercial/model/sensitivity", relationship: "Companion" },
    { pageId: "commercial-staffing-resources", label: "Staffing & Resources", route: "/commercial/staffing-resources", relationship: "Companion" },
    { pageId: "commercial-release", label: "Release & Activation", route: "/commercial/model/release", relationship: "Downstream" },
    { pageId: "commercial-overview", label: "Overview", route: "/commercial", relationship: "Downstream" },
  ],

  /* ---------------- Interpretation & training ---------------- */
  interpretation: [
    {
      band: "healthy",
      label: "Comparable, explained and decision-grade",
      criteria: [
        "Scenarios are comparable — same model version, same portfolio scope, overlapping fiscal periods.",
        "Every scenario × scope shows Current in Readiness.",
        "Each material difference is explained by an assumption row flagged Changed.",
        "Tradeoffs are explicit — revenue and EBITDA are read next to funding and payback.",
        "Operational feasibility has been reviewed with Program, Delivery and Staffing.",
        "Cash and risk are included in the conclusion, not appended afterwards.",
        "The recommendation carries rationale and named enabling conditions, and the comparison is saved.",
      ],
      action: "Route the saved comparison to the Executive Sponsor and Governance as the decision package, and archive superseded comparisons.",
    },
    {
      band: "warning",
      label: "Usable with explicit caveats",
      criteria: [
        "Portfolio or account scope differs between the compared scenarios.",
        "One scenario rests on lower-confidence assumptions than the other.",
        "The upside case depends on staffing or authority that has not been approved.",
        "The conservative case appears to exclude a cost that is in practice unavoidable.",
        "Cash tradeoffs are not clearly stated alongside the profit outcome.",
        "A scope shows Stale and the comparison was saved with the Stale-at-save flag.",
      ],
      action: "Disclose the caveat in the rationale, refresh stale runs where possible, and obtain the feasibility and funding views before presenting externally.",
    },
    {
      band: "critical",
      label: "Comparison must not drive a decision",
      criteria: [
        "Scenarios from different model versions are being compared as if equivalent.",
        "A scope shows Missing, so one side of the delta has no completed run.",
        "The comparison cannot be reproduced — no saved snapshot, manifest or content hash.",
        "The recommendation rests on a single metric such as highest revenue or highest EBITDA.",
        "A binding decision is being taken while risk or funding is unexamined.",
        "Scenario, scope or version context has been lost in an export or executive presentation.",
      ],
      action: "Stop the decision. Rebuild the comparison on a common model version with current runs, save the snapshot, and re-present with full context.",
    },
  ],
  commonMistakes: [
    { id: "cm-1", description: "Selecting the scenario with the highest revenue.", correction: "Revenue is one dimension. Read gross profit, EBITDA, margin, maximum funding and payback before any case is preferred." },
    { id: "cm-2", description: "Selecting the scenario with the highest EBITDA.", correction: "A superior EBITDA that needs more funding, faster activation or unapproved staffing is conditional. Recommend it only with those conditions named." },
    { id: "cm-3", description: "Ignoring cash by excluding the cash scope or skipping the cash rows.", correction: "Keep the cash scope included and read CASH-MAX-FUNDING and CASH-PAYBACK in the Summary tab alongside EBITDA." },
    { id: "cm-4", description: "Ignoring the staffing and capacity implied by the favoured case.", correction: "Staffing is not comparable on this page. Take the favoured case to Staffing & Resources and confirm the capacity is approved." },
    { id: "cm-5", description: "Comparing scenarios that cover different accounts or portfolio scope.", correction: "The page performs no scope check. Confirm equivalence in Portfolio first, and disclose any difference in the rationale." },
    { id: "cm-6", description: "Comparing stale runs and reading the deltas as current.", correction: "Check Readiness before interpreting anything. Refresh stale scopes from the Revenue, P&L or Cash pages, then rebuild." },
    { id: "cm-7", description: "Hiding low-confidence assumptions behind a clean-looking delta.", correction: "Walk the Assumptions tab and state which Changed values are weakly evidenced; test them in Sensitivity Analysis." },
    { id: "cm-8", description: "Failing to document the conditions attached to the decision.", correction: "There is no conditions field, so write the recommendation, tradeoffs and enabling conditions into the rationale before saving." },
  ],
  bestPractices: [
    "Title comparisons after the decision they support, because the register shows nothing else.",
    "Keep all three scopes included so profit and funding are always read together.",
    "Check Readiness before reading a single delta.",
    "Walk the Assumptions tab before the Metrics tab — understand the cause before the effect.",
    "Read variance direction next to percentage variance; magnitude alone misleads.",
    "State scope, period and model-version comparability explicitly in the rationale.",
    "Save the comparison before quoting any figure from it externally.",
    "Archive superseded comparisons so current analysis is unambiguous.",
    "Carry the scenario, version and date context into every export or slide.",
  ],
  workedExamples: [
    {
      id: "we-1",
      title: "Comparing Base and Upside for a planning-case decision",
      narrative:
        "The question is which case to plan against. Create a pairwise comparison titled for that decision, leave the baseline on the flagged Base scenario, tick Upside as the compared scenario, keep revenue, pnl and cash included, and write the decision question into the rationale. Open the draft and check Readiness first: every Base and Upside row across all three scopes should read Current. Then open the Assumptions tab — the rows flagged Changed are the whole story, typically a faster activation ramp, stronger service attach and broader customer access. Now read the Summary tab. Upside will usually show favourable PNL-REVENUE and PNL-EBITDA variances, but read CASH-MAX-FUNDING and CASH-PAYBACK in the same glance: the upside is normally funded before it is earned, so peak funding rises and payback lengthens. The Metrics tab then shows whether the gain is sustained across fiscal periods or concentrated in one. Three feasibility questions follow, none of which this page answers: can delivery staff the faster ramp, can the activation dates be met, and is the required customer access actually available. Recommend Upside only if those hold, and record the funding, staffing and access conditions in the rationale before saving the snapshot.",
      steps: [
        "Create a pairwise comparison with Base as baseline and Upside as compared, all three scopes included.",
        "Confirm every scenario × scope in Readiness shows Current.",
        "Read the Assumptions tab to identify the Changed drivers behind the difference.",
        "Read revenue, gross profit, EBITDA and margin variances in the Summary tab.",
        "Read CASH-MAX-FUNDING and CASH-PAYBACK to price the upside in funding terms.",
        "Check period-by-period behaviour in the Metrics tab.",
        "Validate staffing, activation timing and customer access outside the page.",
        "Write the recommendation and enabling conditions into the rationale, then Save the snapshot.",
      ],
      result:
        "An immutable, hashed comparison showing that Upside's higher revenue and EBITDA are purchased with more funding, faster activation and more staffing — with a recommendation that is explicitly conditional on those being approved.",
    },
  ],
  faqs: [
    { id: "faq-1", question: "What makes scenarios comparable?", answer: "The same program and model version, overlapping fiscal periods, equivalent portfolio scope, and completed non-stale runs for every included scope. The page enforces the model version and reports readiness per scenario and scope, but it does not check account scope or warn about non-overlapping periods — those remain a human check." },
    { id: "faq-2", question: "Which scenario should be recommended?", answer: "The one whose outcome the organisation can actually deliver and fund. Weigh the revenue, EBITDA and margin deltas against maximum funding, payback, staffing, activation timing and risk, and recommend the case whose enabling conditions are achievable and can be named explicitly." },
    { id: "faq-3", question: "Why is the highest EBITDA not always best?", answer: "EBITDA ignores when the cash moves, whether the capacity exists and whether the assumptions behind the upside are approved. A case with better EBITDA and a much higher peak funding requirement can be undeliverable. That is why the Summary places maximum funding and payback beside EBITDA." },
    { id: "faq-4", question: "How should risk be compared?", answer: "Outside this page. There is no risk or confidence comparison here. Use the Changed assumption rows as the risk inventory, test the material ones in Sensitivity Analysis, and record the resulting risks and mitigations against the recommendation in Governance." },
    { id: "faq-5", question: "How should cash be considered?", answer: "Keep the cash scope included and read CASH-MAX-FUNDING and CASH-PAYBACK for every case. Peak funding is the capital the organisation must commit; payback is how long it stays committed. A profit improvement that lengthens payback is a financing decision, not just a commercial one." },
    { id: "faq-6", question: "What if account scope differs?", answer: "The comparison will still calculate, and it will be misleading. The page performs no scope check. Confirm equivalence in Portfolio first; if scope genuinely differs, disclose it prominently in the rationale and treat the deltas as indicative rather than decision-grade." },
    { id: "faq-7", question: "Can a comparison be saved?", answer: "Yes. A draft can be saved as an immutable snapshot with a source-run manifest hash and a content hash, and the dialog restates the scenarios, scopes and any stale or missing state first. Saved comparisons never change; they can later be archived and remain readable and distinguishable." },
    { id: "faq-8", question: "What happens after a scenario is selected?", answer: "The recommendation goes to the Executive Sponsor and Governance with the saved comparison as evidence. Negotiated values are raised as change sets in Assumptions & Change Sets, delivery planning proceeds against the selected case, and adopting it as the released model requires Release & Activation certification." },
  ],
  glossary: [
    { term: "Scenario Comparison", definition: "A read-only comparison of persisted Revenue, P&L and Cash results between a baseline scenario and one or more compared scenarios on a single model version." },
    { term: "Delta", definition: "The difference between a compared scenario's value and the baseline value for a given metric and fiscal period, shown as an absolute variance, a percentage variance and a direction." },
    { term: "Tradeoff", definition: "What a scenario gives up to obtain its advantage — typically funding, capacity, timing or risk exchanged for revenue or EBITDA." },
    { term: "Comparable Scope", definition: "Agreement between the compared scenarios on the accounts, portfolio and fiscal periods being modelled. Not validated by the page." },
    { term: "Planning Case", definition: "The scenario approved as the basis for delivery planning, staffing and commitment." },
    { term: "Enabling Condition", definition: "An approval, capacity commitment or customer access the recommended case depends on. Recorded in the rationale, not as a structured field." },
    { term: "Feasibility", definition: "Whether the organisation can actually execute the scenario with approved capacity, funding and timing." },
    { term: "Decision Rationale", definition: "The recorded explanation of which case is recommended, what tradeoff is accepted and under what conditions." },
    { term: "Confidence", definition: "The strength of evidence behind the assumptions driving a scenario. Assessed outside the page; the Assumptions tab shows applied values only." },
    { term: "Recommended Scenario", definition: "The case put forward for approval, with rationale and conditions attached." },
    { term: "Readiness", definition: "The per scenario × scope state of Current, Stale or Missing, derived from the latest completed run and the latest assumption apply." },
    { term: "Stale at save", definition: "A flag recorded when a comparison was saved while one or more scopes were out of date relative to applied assumptions." },
    { term: "Source-run manifest", definition: "The frozen record, with hash, of exactly which model runs produced the figures in a saved comparison." },
    { term: "Mode", definition: "Pairwise (baseline vs one), Three-way (baseline vs two) or Historical runs." },
  ],
  executiveTakeaway:
    "This page tells you how two or three cases differ and, crucially, what the better-looking case costs. Read the EBITDA delta and the maximum funding and payback deltas together — an upside that needs more capital, faster activation and unapproved staffing is a conditional outcome, not a better plan. Ask three questions before approving: are the cases genuinely comparable, does every difference trace to a named assumption change, and can we deliver and fund the case being recommended. Approve a planning case only with its enabling conditions written down and the comparison saved as reproducible evidence.",
  keyRisks: [
    "Choosing a case on a single headline metric while ignoring funding, capacity and risk.",
    "Comparing scenarios with different account or portfolio scope, which the page does not detect.",
    "Reading deltas from stale or missing runs and treating them as current.",
    "Non-overlapping fiscal periods silently omitting rows from the comparison.",
    "Committing to an upside that depends on unapproved staffing, spend or customer access.",
    "Quoting an unsaved draft comparison that cannot later be reproduced.",
    "Losing scenario, scope and model-version context in an executive export.",
    "Recording no rationale, leaving the decision undocumented and unauditable.",
  ],

  /* ---------------- Show on page ---------------- */
  showOnPageTargets: [
    { targetId: "comparison-context", label: "Model context", description: "Program, model version code and version status binding the comparison." },
    { targetId: "comparison-selector", label: "Comparison selection", description: "Title, mode and the create-draft action." },
    { targetId: "comparison-scenarios", label: "Scenario selection", description: "Baseline scenario and compared scenario checkboxes." },
    { targetId: "comparison-scopes", label: "Included scopes", description: "Revenue, P&L and cash scope selection." },
    { targetId: "comparison-recommendation", label: "Rationale", description: "The only place the recommendation, tradeoffs and conditions can be recorded." },
    { targetId: "comparison-saved", label: "Saved and archived comparisons", description: "Register of draft, saved and archived comparison snapshots." },
    { targetId: "comparison-readiness", label: "Readiness", description: "Current, Stale or Missing per scenario and scope with run timestamps." },
    { targetId: "comparison-deltas", label: "Delta table", description: "Variance rows by metric, period, baseline, compared, Δ, Δ% and direction." },
    { targetId: "comparison-financials", label: "Financial comparison", description: "Revenue, gross profit, EBITDA, margin, maximum funding and payback roll-up." },
    { targetId: "comparison-drivers", label: "Driver differences", description: "Effective assumption values and which differ from the baseline." },
    { targetId: "comparison-actions", label: "Save and archive actions", description: "Immutable snapshot save and archive controls." },
    { targetId: "comparison-lineage", label: "Source-run manifest", description: "Manifest hash, content hash and the frozen run manifest." },
  ],
};
