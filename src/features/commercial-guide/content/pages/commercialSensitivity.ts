import type { CommercialGuideContent } from "../../types";

/**
 * Page-specific Commercial Guide content — Sensitivity Analysis
 * (`/commercial/model/sensitivity`, prefix — the detail route
 * `/commercial/model/sensitivity/:id` shares this guide).
 *
 * Authored strictly against what renders in
 * `src/commercial/pages/CommercialSensitivity.tsx` and
 * `src/commercial/pages/CommercialSensitivityDetail.tsx`:
 *
 *  - List page: header, a permission-gated "New Experiment" form (title,
 *    baseline scenario, optional description, perturbed assumption, strategy
 *    of "% Increments (list)" or "Absolute Values (list)", the increments or
 *    values input, included scopes revenue / pnl / cash, Create Experiment),
 *    an Experiments table (title, assumption, scopes, status, stale badge,
 *    created, Open) and a read-only access alert.
 *  - Detail page: title, description, badges (status, assumption code,
 *    baseline value, included scopes, stale baseline), Execute / Reset to
 *    Draft / Archive actions, a destructive failure alert showing error code
 *    and message, and three tabs — Perturbations (index, label, value,
 *    status, runtime fingerprint), Tornado (Top 25 by |Δ%| with metric,
 *    period, baseline, perturbed, Δ, Δ%, direction) and All Results
 *    (scope, metric, period, baseline, perturbed, Δ%, first 500 rows).
 *
 * Concepts requested but NOT present (elasticity measures, graphical tornado
 * bars, an interpretation summary panel, multi-variable experiments, explicit
 * breakpoint detection, rerun history beyond status transitions) are described
 * only as practice or recorded as known gaps. No numeric result is invented,
 * and no calculation, execution path or result is changed by this guide.
 */
export const commercialSensitivityGuide: CommercialGuideContent = {
  pageId: "commercial-sensitivity",
  route: "/commercial/model/sensitivity",
  match: "prefix",
  pageTitle: "Sensitivity Analysis",
  guideTitle: "Sensitivity Analysis — Which Assumptions Actually Move the Outcome",
  audiences: ["Finance", "Commercial Lead", "Executive", "Delivery", "Operations", "Administrator", "Sales"],
  modes: ["executive", "practitioner", "administrator"],
  estimatedReadingMinutes: 12,
  trainingLevel: "Advanced",
  lastUpdated: "2026-07-29",

  /* ---------------- Overview ---------------- */
  purpose:
    "Sensitivity Analysis identifies which single assumption most influences commercial outcomes. Each experiment perturbs one governed assumption around a chosen baseline scenario and re-runs the model across Revenue, P&L and Cash, recording the movement in every affected metric. The result tells the team where negotiation effort, evidence gathering, risk mitigation and operating attention are worth the most.",
  represents:
    "A register of named experiments, each bound to one baseline scenario, one assumption code, one perturbation strategy and a set of included scopes. Each executed experiment holds its perturbations and a results set of baseline value, perturbed value, absolute delta, percentage delta and variance direction per metric and fiscal period. It represents model response, not a decision.",
  whyItMatters:
    "Not every assumption matters equally. Without sensitivity, teams argue about inputs in proportion to how strongly they feel rather than how much the input moves the answer. Ranking drivers by measured impact focuses negotiation on the terms that pay, focuses evidence work on the assumptions that carry risk, and shows whether the deal is robust or fragile.",
  moduleConnection:
    "Sensitivity sits downstream of Assumptions and Scenarios and upstream of decisions. It draws its baseline from a scenario and a draft model version, perturbs one governed assumption, and executes against the Revenue, P&L and Cash engines. Findings feed negotiation priorities, assumption governance, scenario design, risk mitigation, Release decisions and Overview. It never writes back into the active model.",
  questionsAnswered: [
    "Which assumptions matter most to the outcome?",
    "How much does a metric move when one driver changes?",
    "Where are the commercial breakpoints?",
    "Which terms should be negotiated most aggressively?",
    "Which assumptions need stronger evidence before a decision?",
    "Which risks have disproportionate financial impact?",
    "Which operational levers actually improve the outcome?",
    "Is the deal robust, or fragile to a single input?",
  ],
  expectedOutcome:
    "A ranked, reproducible view of driver influence for a named baseline — with the high-impact assumptions identified, their owners engaged, and each finding converted into a negotiation ask, an evidence action, a risk mitigation or a governed change proposal.",
  lifecycleStages: [
    "Financial Modeling",
    "Executive Review",
    "Negotiation",
    "Delivery Planning",
    "Continuous Improvement",
  ],
  prerequisites: [
    { id: "pre-scenario", label: "Valid baseline scenario", route: "/commercial/scenarios", detail: "Every experiment binds to one baseline scenario; the page defaults to the scenario flagged as baseline." },
    { id: "pre-version", label: "Draft model version", route: "/commercial/model/assumptions", detail: "Without a draft model version the page shows an empty state and no experiment can be created." },
    { id: "pre-run", label: "Completed model run for the baseline", route: "/commercial/model/revenue", detail: "Perturbed results are only meaningful against a baseline the engines have already produced." },
    { id: "pre-metrics", label: "Defined outcome scopes", detail: "Choose the included scopes — revenue, pnl, cash — before creating the experiment; they cannot be widened after the fact." },
    { id: "pre-range", label: "Controlled variable range", detail: "Decide plausible increments or absolute values before running; the form accepts any comma-separated numbers." },
    { id: "pre-assumptions", label: "Current assumptions", route: "/commercial/model/assumptions", detail: "Only numeric assumptions on the selected scenario are offered as perturbation targets." },
    { id: "pre-reproducible", label: "Reproducible model version", detail: "Each perturbation records a runtime fingerprint so a result can be traced to the code and inputs that produced it." },
  ],
  ownership: {
    businessOwner: "Commercial Lead",
    commercialOwner: "Commercial Lead",
    technicalOwner: "Model Administrator",
    executiveApprover: "Executive Sponsor for any resulting decision",
    primaryUsers: ["Finance", "Commercial Lead", "Deal Lead", "Model Administrator", "Staffing Lead"],
    consumersOfOutput: ["Negotiation team", "Governance", "Scenarios", "Assumptions & Change Sets", "Overview", "Release & Activation"],
  },

  /* ---------------- How it works ---------------- */
  sections: [
    {
      id: "sec-interpretation",
      title: "What this page does — and what it is not",
      targetId: "sensitivity-interpretation",
      explanation:
        "The header states the method plainly: perturb a single governed assumption to measure downstream impact across Revenue, P&L and Cash. That is the distinction from Scenario Comparison. A scenario changes a coherent bundle of assumptions at once; a sensitivity experiment holds everything else at the baseline and moves one variable. Use scenarios to compare possible worlds, and sensitivity to find out which lever moves the world you are already in.",
    },
    {
      id: "sec-baseline",
      title: "Baseline scenario selection",
      targetId: "sensitivity-baseline",
      explanation:
        "Every experiment binds to one baseline scenario, defaulting to the scenario flagged as baseline. The baseline supplies the unperturbed value of the tested assumption and the reference figures each result is measured against. Two experiments built on different baselines are not comparable, and the detail page shows a 'stale baseline' badge when the baseline had already moved on at creation time.",
    },
    {
      id: "sec-variable",
      title: "Perturbed assumption selection",
      targetId: "sensitivity-variable-selection",
      explanation:
        "One assumption per experiment. The picker lists only assumption codes on the selected scenario that carry a numeric value, showing each code with its current value. There is no multi-variable mode — interactions between drivers must be explored through separate experiments or through scenario design, and that limitation should be stated whenever results are presented.",
    },
    {
      id: "sec-range",
      title: "Perturbation strategy and range",
      targetId: "sensitivity-range",
      explanation:
        "Two strategies exist. '% Increments (list)' takes comma-separated decimals — the default is -0.10, -0.05, 0.05, 0.10 — applied relative to the baseline value. 'Absolute Values (list)' takes comma-separated values used directly. The form accepts any numbers, so commercial plausibility is a human judgement, not a system control. Each entry becomes one perturbation and one model execution.",
    },
    {
      id: "sec-outcome",
      title: "Included scopes",
      targetId: "sensitivity-outcome",
      explanation:
        "Three scopes can be included: revenue, pnl and cash, all selected by default. The chosen scopes determine which engines execute and therefore which metrics appear in the results. Narrowing scope makes an experiment faster but hides second-order effects — a driver that flatters P&L can still damage cash, so exclude a scope only deliberately.",
    },
    {
      id: "sec-history",
      title: "Experiments register",
      targetId: "sensitivity-history",
      explanation:
        "A table of every saved experiment for the program: title, assumption code, included scopes, status badge, a stale marker where applicable, creation timestamp and an Open action. Status is draft, completed, failed or archived. The register is the audit surface — it is how prior work stays distinguishable rather than being silently re-run.",
    },
    {
      id: "sec-status",
      title: "Experiment status and controls",
      targetId: "sensitivity-run-status",
      explanation:
        "The detail header shows the status badge, the assumption code, the baseline value, the included scopes and any stale-baseline warning. Draft experiments can be executed, failed experiments can be reset to draft — clearing failed-attempt perturbations while preserving the failure audit event — and non-archived experiments can be archived. A failed run raises a destructive alert with its error code and message.",
    },
    {
      id: "sec-tornado",
      title: "Tornado ranking",
      targetId: "sensitivity-tornado",
      explanation:
        "A table, not a chart: the top 25 result rows ranked by absolute percentage delta, each showing metric code, fiscal period, baseline value, perturbed value, absolute delta, percentage delta and variance direction. It answers 'where did this driver bite hardest'. Rows are ranked by magnitude only, so read direction alongside magnitude before drawing any conclusion.",
    },
    {
      id: "sec-results",
      title: "All results",
      targetId: "sensitivity-results",
      explanation:
        "The complete result set for the experiment — scope, metric code, fiscal period, baseline value, perturbed value and percentage delta — capped at the first 500 rows on screen. Use it to trace how a single perturbation propagates by period and by scope, and to check whether a headline movement is sustained or confined to one fiscal period.",
    },
  ],
  inputs: [
    { id: "in-title", label: "Experiment title", description: "Required name for the experiment; the register is browsed by title.", owner: "Finance", required: true },
    { id: "in-baseline", label: "Baseline scenario", description: "The scenario supplying unperturbed values; defaults to the flagged baseline.", owner: "Commercial Lead", source: "Scenarios", required: true },
    { id: "in-version", label: "Draft model version", description: "The model version the experiment binds to; required for creation.", owner: "Model Administrator", required: true },
    { id: "in-desc", label: "Description", description: "Optional free text explaining the commercial question the experiment answers.", owner: "Commercial Lead" },
    { id: "in-assumption", label: "Perturbed assumption code", description: "A single numeric assumption on the baseline scenario.", owner: "Owner of the tested assumption", source: "Assumptions & Change Sets", required: true },
    { id: "in-strategy", label: "Perturbation strategy", description: "'% Increments (list)' relative to baseline, or 'Absolute Values (list)' used directly.", owner: "Finance", required: true },
    { id: "in-range", label: "Increment or value list", description: "Comma-separated numbers; each becomes one perturbation and one execution.", owner: "Finance", required: true },
    { id: "in-scopes", label: "Included scopes", description: "Any of revenue, pnl and cash; all three are selected by default.", owner: "Finance", required: true },
  ],
  outputs: [
    { id: "out-perts", label: "Perturbations", description: "Indexed rows with label, perturbed value, status and runtime fingerprint.", consumedBy: ["Model Administrator", "Governance"] },
    { id: "out-impact", label: "Variable impact per metric", description: "Baseline value, perturbed value, absolute delta and percentage delta by metric and fiscal period.", consumedBy: ["Finance", "Negotiation team"] },
    { id: "out-ranking", label: "Relative ranking", description: "Top 25 rows ordered by absolute percentage delta in the Tornado tab.", consumedBy: ["Commercial Lead", "Executive Sponsor"] },
    { id: "out-direction", label: "Variance direction", description: "Whether the metric moved favourably or adversely under the perturbation.", consumedBy: ["Finance", "Governance"] },
    { id: "out-range", label: "Outcome range across perturbations", description: "The span of results produced by the tested range for a given metric.", consumedBy: ["Executive Sponsor", "Risk"] },
    { id: "out-status", label: "Experiment status and error detail", description: "Draft, completed, failed with error code and message, or archived.", consumedBy: ["Model Administrator", "Governance"] },
    { id: "out-followup", label: "Recommended follow-up", description: "Negotiation ask, evidence action, risk mitigation or governed change proposal derived from the finding.", consumedBy: ["Assumptions & Change Sets", "Governance", "Scenarios"] },
  ],
  businessRules: [
    { id: "br-1", rule: "Sensitivity must start from an identified baseline.", explanation: "Every experiment binds to one baseline scenario and one model version. Without that binding a delta has no reference and the result cannot be reproduced or defended." },
    { id: "br-2", rule: "Tested ranges must be commercially plausible.", explanation: "The form accepts any comma-separated numbers, so nothing stops an implausible range. Plausibility is the analyst's responsibility, and the chosen range should be justifiable to the owner of the tested assumption." },
    { id: "br-3", rule: "One variable moves; everything else holds at baseline.", explanation: "This is the method the page implements — a single assumption code per experiment. Any statement about combined movement requires separate experiments or scenario design." },
    { id: "br-4", rule: "Sensitivity shows model response, not causal certainty.", explanation: "The engines report what the model does when an input changes. That is not evidence that the real business behaves the same way, and it never establishes cause." },
    { id: "br-5", rule: "Results retain scenario and model-version context.", explanation: "Baseline scenario, assumption code, included scopes and runtime fingerprint are recorded with the experiment. Quote results with that context or they become unfalsifiable." },
    { id: "br-6", rule: "A highly sensitive variable needs governance attention, not automatic optimisation.", explanation: "High sensitivity means high consequence of being wrong. The correct response is stronger evidence, clearer ownership and explicit risk treatment — not moving the input to the flattering end of the range." },
    { id: "br-7", rule: "A favourable outcome at an unrealistic value is not a recommendation.", explanation: "The model will happily compute a result for a value the business could never achieve. Test operational realism before any finding is carried into negotiation." },
    { id: "br-8", rule: "Failed experiments are not valid results.", explanation: "A failed status raises an error code and message and must be reset to draft before re-execution. Partial output from a failed attempt must not be read as a finding." },
    { id: "br-9", rule: "Reset and archive history must stay distinguishable.", explanation: "Reset clears failed-attempt perturbations while preserving the failure audit event; archive retires an experiment without deleting it. Both keep prior work visible instead of silently overwritten." },
    { id: "br-10", rule: "Sensitivity never changes the active model.", explanation: "Perturbed values persist to an isolated sensitivity run and never mutate historical model runs. Adopting a value requires a governed change set and, where applicable, release approval." },
    { id: "br-11", rule: "Interactions require scenario or multi-variable analysis.", explanation: "The page has no multi-variable mode. Where two drivers plausibly interact, build the combination as a scenario rather than adding two single-variable results together." },
    { id: "br-12", rule: "Only the metrics and visualisations actually present may be cited.", explanation: "The page produces baseline, perturbed, absolute delta, percentage delta and variance direction, ranked in a table. There is no elasticity measure and no graphical tornado — do not describe outputs that are not rendered." },
  ],
  calculationLogic: [
    "The baseline value is read from the tested assumption on the selected baseline scenario.",
    "'% Increments (list)' expands each decimal increment relative to that baseline value; 'Absolute Values (list)' uses the entered values directly.",
    "Each expanded perturbation is executed as an isolated sensitivity run across the included scopes — revenue, pnl and cash.",
    "Per metric and fiscal period the engine records baseline value, perturbed value, absolute delta, percentage delta and variance direction.",
    "The Tornado tab filters to rows with a finite percentage delta, sorts by absolute magnitude descending, and shows the top 25.",
    "Percentage deltas are displayed as the stored decimal multiplied by 100 to two decimal places.",
    "The All Results tab renders the first 500 rows of the complete result set.",
    "No elasticity coefficient, breakpoint detector or regression is computed — breakpoints are read by inspection across the tested range.",
  ],
  relationship: {
    receivesFrom: ["Assumptions & Change Sets", "Scenarios", "Revenue model", "P&L model", "Cash model", "Staffing assumptions", "Active baseline and draft model version"],
    models: ["Single-variable perturbations", "Outcome response by metric and period", "Relative influence ranking", "Breakpoints across the tested range", "Downside and upside exposure", "Commercial leverage"],
    feeds: ["Negotiation priorities", "Assumption governance", "Scenario design", "Risk mitigation", "Executive recommendations", "Overview", "Release & Activation"],
  },
  downstreamImpacts: [
    { area: "Revenue", effect: "Identifies which revenue drivers carry the largest swing and therefore the greatest negotiation value." },
    { area: "Costs", effect: "Exposes cost assumptions whose movement materially erodes contribution." },
    { area: "EBITDA", effect: "Ranks the drivers that move EBITDA most for a given plausible change." },
    { area: "Cash", effect: "Shows where a driver that improves profit still worsens the cash profile." },
    { area: "Staffing", effect: "Highlights when a driver's upside depends on capacity the organisation has not approved." },
    { area: "Risk", effect: "Converts fragility into a ranked risk register with owners and mitigations." },
    { area: "Governance", effect: "Directs evidence and approval effort to the assumptions that actually matter." },
  ],
  dataQuality: {
    dataSources: ["Baseline scenario assumptions", "Draft model version", "Revenue, P&L and Cash engine outputs", "Sensitivity experiment, perturbation and result records"],
    updateFrequency: "On demand — results are produced when an experiment is executed and are not refreshed automatically.",
    knownGaps: [
      "No multi-variable or interaction experiments; one assumption code per experiment.",
      "No elasticity coefficient or normalised response measure is computed or displayed.",
      "The Tornado view is a ranked table, not a graphical tornado chart.",
      "No automated breakpoint detection — breakpoints must be read by inspection.",
      "No interpretation summary panel; conclusions are written by the analyst outside the tool.",
      "No plausibility validation on the entered range; any numbers are accepted.",
      "No named owner field on an experiment beyond its creator.",
      "The All Results tab is capped at the first 500 rows on screen.",
      "No side-by-side comparison of two experiments within the page.",
      "No direct path from a finding to a change set; the follow-up must be raised manually.",
    ],
    changeControl: "Experiments are additive and isolated. Perturbed values never mutate historical model runs or the active model. Adopting a tested value requires a change set in Assumptions & Change Sets, and any released model change requires Release & Activation.",
    lineage: "Each perturbation carries a runtime fingerprint; each experiment records its baseline scenario, assumption code, included scopes and model version.",
  },
  modelConfidence: "Medium",
  confidenceBasis: ["Revenue assumptions", "Cost assumptions", "Timing", "Commercial terms", "Governance approvals"],
  confidenceGuidance:
    "Confidence in the mechanism is high — the engines are deterministic and each run is fingerprinted. Confidence in the interpretation depends on the baseline and the range. Treat a result as reliable when the baseline is current, the range was agreed with the assumption owner, and the experiment completed without error; treat it as indicative otherwise.",
  commercialReadiness: "Review Required",
  readinessCriteria: [
    "The baseline scenario is current and not flagged stale.",
    "The experiment status is completed, not failed or draft.",
    "The tested range was agreed as commercially plausible.",
    "Included scopes cover the metrics being cited.",
    "The owner of the tested assumption has seen the result.",
    "Operational feasibility of the favourable end of the range has been checked.",
    "Each finding has been converted into a named action.",
  ],

  /* ---------------- How to use it ---------------- */
  workflow: [
    { id: "wf-1", step: 1, title: "Confirm the baseline", description: "Check the baseline scenario and draft model version, and note any stale-baseline badge before proceeding.", role: "Finance" },
    { id: "wf-2", step: 2, title: "Select the outcome scopes", description: "Include revenue, pnl and cash unless there is a deliberate reason to narrow the analysis.", role: "Finance" },
    { id: "wf-3", step: 3, title: "Select a material driver", description: "Choose one numeric assumption code on the baseline scenario that plausibly carries weight.", role: "Commercial Lead" },
    { id: "wf-4", step: 4, title: "Set a plausible range", description: "Pick the strategy and enter increments or absolute values you could defend to the assumption owner.", role: "Finance" },
    { id: "wf-5", step: 5, title: "Create and execute", description: "Save the experiment, open it, and use Execute to generate perturbations and results.", role: "Finance" },
    { id: "wf-6", step: 6, title: "Review status and completeness", description: "Confirm the status is completed, no error alert is shown, and the expected perturbations exist.", role: "Model Administrator" },
    { id: "wf-7", step: 7, title: "Interpret direction and magnitude", description: "Read variance direction alongside percentage delta; magnitude alone can mislead.", role: "Finance" },
    { id: "wf-8", step: 8, title: "Compare multiple drivers", description: "Run separate experiments on the same baseline and rank their impacts against each other.", role: "Commercial Lead" },
    { id: "wf-9", step: 9, title: "Identify breakpoints", description: "Scan All Results across the tested range for the point where response changes character.", role: "Finance" },
    { id: "wf-10", step: 10, title: "Validate operational realism", description: "Confirm the favourable end of the range is deliverable with approved capacity and funding.", role: "Program Director" },
    { id: "wf-11", step: 11, title: "Convert the finding into an action", description: "Raise a change proposal, a negotiation ask, an evidence request or a risk mitigation.", role: "Commercial Lead" },
    { id: "wf-12", step: 12, title: "Never edit the released model from a result", description: "Adoption goes through Assumptions & Change Sets and, where relevant, Release & Activation.", role: "Model Administrator" },
  ],
  actionsAvailable: [
    "Create an experiment with a title, baseline scenario, optional description, assumption, strategy, range and scopes (requires create permission).",
    "Browse the experiments register with status, scopes and creation time.",
    "Open an experiment to see its badges, perturbations, tornado ranking and full results.",
    "Execute a draft experiment (requires execute permission).",
    "Reset a failed experiment to draft, clearing failed-attempt perturbations while preserving the failure audit event.",
    "Archive an experiment (requires archive permission).",
    "Read the error code and message on a failed execution.",
  ],
  teamActivities: [
    { id: "ta-1", activity: "Driver shortlist for sensitivity testing", role: "Commercial Lead with Finance", cadence: "Each modelling cycle" },
    { id: "ta-2", activity: "Range agreement with the assumption owner", role: "Finance", cadence: "Before each experiment" },
    { id: "ta-3", activity: "Impact ranking review", role: "Finance", cadence: "After each batch of experiments" },
    { id: "ta-4", activity: "Operational realism check on high-impact drivers", role: "Program Director / Staffing Lead", cadence: "Before any recommendation" },
    { id: "ta-5", activity: "Negotiation priority setting from ranked leverage", role: "Deal Lead", cadence: "Ahead of each negotiation round" },
    { id: "ta-6", activity: "Failed-experiment triage and reset", role: "Model Administrator", cadence: "As required" },
  ],
  roles: [
    { role: "Finance", responsibility: "Designs experiments, sets ranges, executes runs and interprets response." },
    { role: "Commercial Lead", responsibility: "Owns the business question, selects material drivers and converts findings into asks." },
    { role: "Deal Lead", responsibility: "Turns ranked leverage into negotiation priorities." },
    { role: "Model Administrator", responsibility: "Owns model version integrity, reproducibility and recovery of failed experiments." },
    { role: "Staffing Lead", responsibility: "Confirms whether the favourable end of a tested range is resourceable." },
    { role: "Risk and Governance teams", responsibility: "Ensure high-sensitivity assumptions carry owners, evidence and mitigations." },
    { role: "Executive Sponsor", responsibility: "Approves decisions arising from sensitivity findings." },
    { role: "Functional reviewers", responsibility: "Validate that the tested range for their assumption is credible." },
  ],
  raci: [
    { activity: "Design and create an experiment", assignments: [{ role: "Finance", raci: "R" }, { role: "Commercial Lead", raci: "A" }, { role: "Functional reviewers", raci: "C" }, { role: "Model Administrator", raci: "I" }] },
    { activity: "Execute and validate results", assignments: [{ role: "Finance", raci: "R" }, { role: "Model Administrator", raci: "A" }, { role: "Commercial Lead", raci: "C" }, { role: "Executive Sponsor", raci: "I" }] },
    { activity: "Interpret and rank commercial leverage", assignments: [{ role: "Commercial Lead", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Deal Lead", raci: "C" }, { role: "Risk and Governance teams", raci: "I" }] },
    { activity: "Act on a finding", assignments: [{ role: "Deal Lead", raci: "R" }, { role: "Executive Sponsor", raci: "A" }, { role: "Finance", raci: "C" }, { role: "Model Administrator", raci: "I" }] },
  ],
  reviewRequirements: [
    "Baseline currency confirmed and any stale-baseline badge explained.",
    "Range reviewed for commercial plausibility by the assumption owner.",
    "Status confirmed as completed before any result is cited.",
    "Direction reviewed alongside magnitude for every headline finding.",
    "Cash impact reviewed even when the headline is a revenue or EBITDA movement.",
    "Operational constraints on the favourable end of the range documented.",
  ],
  approvalRequirements: [
    "Creating, executing and archiving experiments each require their own permission; without them the page is read-only.",
    "No approval is granted by running an experiment — a result is evidence, never a decision.",
    "Adopting a tested value requires an approved change set in Assumptions & Change Sets.",
    "Decisions arising from findings require Executive Sponsor approval.",
    "Any change to a released model requires Release & Activation certification.",
  ],
  decisions: [
    { id: "dec-1", decision: "Which terms to prioritise in negotiation", decidedBy: "Deal Lead with Executive Sponsor", evidence: "Ranked absolute percentage deltas across comparable experiments" },
    { id: "dec-2", decision: "Which assumptions need stronger evidence", decidedBy: "Commercial Lead with Finance", evidence: "High-impact drivers whose baseline confidence is low" },
    { id: "dec-3", decision: "Whether the deal is robust enough to commit", decidedBy: "Executive Sponsor", evidence: "Outcome range across plausible perturbations and cash response" },
    { id: "dec-4", decision: "Whether to raise a change set for a tested value", decidedBy: "Commercial Lead with Model Administrator", evidence: "Completed experiment plus operational feasibility confirmation" },
  ],
  whatToDoNext: [
    "Run comparable experiments on the same baseline for the other candidate drivers.",
    "Take high-impact, low-confidence assumptions to Sources for stronger evidence.",
    "Test whether an apparent upside is deliverable in Staffing & Resources.",
    "Design a scenario where two drivers plausibly interact rather than adding results together.",
    "Raise a change set in Assumptions & Change Sets to adopt a validated value.",
    "Present ranked leverage and the residual fragility to Governance.",
  ],
  relatedPages: [
    { pageId: "commercial-scenarios", label: "Scenarios", route: "/commercial/scenarios", relationship: "Prerequisite" },
    { pageId: "commercial-assumptions", label: "Assumptions & Change Sets", route: "/commercial/model/assumptions", relationship: "Prerequisite" },
    { pageId: "commercial-revenue", label: "Revenue", route: "/commercial/model/revenue", relationship: "Upstream" },
    { pageId: "commercial-pnl", label: "P&L (Cost & EBITDA)", route: "/commercial/model/pnl", relationship: "Upstream" },
    { pageId: "commercial-cash", label: "Cash & Sustainability", route: "/commercial/model/cash", relationship: "Upstream" },
    { pageId: "commercial-compare", label: "Scenario Comparison", route: "/commercial/model/compare", relationship: "Companion" },
    { pageId: "commercial-release", label: "Release & Activation", route: "/commercial/model/release", relationship: "Downstream" },
    { pageId: "commercial-staffing-resources", label: "Staffing & Resources", route: "/commercial/staffing-resources", relationship: "Companion" },
    { pageId: "commercial-overview", label: "Overview", route: "/commercial", relationship: "Downstream" },
  ],

  /* ---------------- Interpretation & training ---------------- */
  interpretation: [
    {
      band: "healthy",
      label: "Reliable, actionable sensitivity evidence",
      criteria: [
        "The baseline scenario is current and not flagged stale.",
        "Tested ranges are plausible and were agreed with the assumption owner.",
        "Experiments completed and the expected perturbations and results are present.",
        "High-impact drivers have named owners.",
        "Each finding has produced a specific negotiation, evidence or risk action.",
        "Limitations — single variable, no interaction testing — are disclosed with the result.",
      ],
      action: "Use the ranking to set negotiation priorities and evidence work, and record the findings in Governance.",
    },
    {
      band: "warning",
      label: "Usable with explicit caveats",
      criteria: [
        "The tested range is aggressive relative to what the business could achieve.",
        "Baseline confidence is low or the baseline is marked stale.",
        "Response across the range is strongly nonlinear.",
        "The tested assumption has operational constraints that the model does not represent.",
        "Two or more drivers plausibly interact and were tested only in isolation.",
      ],
      action: "Narrow the range, refresh the baseline, and add scenario-based testing before presenting conclusions externally.",
    },
    {
      band: "critical",
      label: "Results must not be used",
      criteria: [
        "The baseline scenario or model version is invalid.",
        "The experiment status is failed and an error alert is displayed.",
        "Results from different baselines are being compared as if equivalent.",
        "A sensitivity result is being treated as an approved assumption.",
        "A binding commercial recommendation depends on a value at the unrealistic end of the range.",
      ],
      action: "Stop citing the output. Reset failed experiments to draft, rebuild on a current baseline, and re-run before any decision is taken.",
    },
  ],
  commonMistakes: [
    { id: "cm-1", description: "Confusing a sensitivity experiment with a scenario.", correction: "A scenario changes a coherent bundle of assumptions; sensitivity moves one variable around a fixed baseline. Use Scenario Comparison for bundles." },
    { id: "cm-2", description: "Testing ranges the business could never realise.", correction: "Agree the range with the owner of the assumption before running, and record why it is plausible." },
    { id: "cm-3", description: "Ranking drivers by impact alone, ignoring controllability.", correction: "Weight impact by whether the team can actually influence the driver; a large but uncontrollable driver is a risk, not a lever." },
    { id: "cm-4", description: "Reading only the revenue or EBITDA response and ignoring cash and staffing.", correction: "Keep all three scopes included and read the cash rows before concluding a driver is favourable." },
    { id: "cm-5", description: "Treating a modelled response as proof of causation.", correction: "The result shows what the model does. Establishing that the business behaves the same way requires evidence outside the model." },
    { id: "cm-6", description: "Applying a sensitivity value directly to the active model.", correction: "Perturbed values are isolated by design. Adoption requires a change set and, for released models, certification." },
    { id: "cm-7", description: "Comparing experiments that were built on different baselines.", correction: "Check the baseline scenario badge on each experiment; only rank experiments that share a baseline and model version." },
    { id: "cm-8", description: "Quoting output from a failed or partially executed run.", correction: "Check the status badge first. Reset failed experiments to draft and re-execute before reading any figure." },
  ],
  bestPractices: [
    "Name experiments so the commercial question is obvious from the register.",
    "Keep all three scopes included unless narrowing is deliberate and stated.",
    "Test one driver per experiment and run a comparable set on a shared baseline.",
    "Write the range justification into the description field at creation time.",
    "Read variance direction before percentage delta.",
    "Archive superseded experiments rather than deleting or silently re-running them.",
    "State the single-variable limitation whenever findings are presented.",
    "Convert every material finding into an owned action the same day.",
  ],
  workedExamples: [
    {
      id: "we-1",
      title: "Testing the activation ramp around the Base baseline",
      narrative:
        "The question is whether activation pace is a lever worth negotiating for. Create an experiment titled after the question, leave the baseline scenario on the flagged Base case, select the activation ramp assumption code — the picker shows its current baseline value — and choose '% Increments (list)' with the default -0.10, -0.05, 0.05, 0.10. Keep revenue, pnl and cash included, then Execute. Four perturbations are generated, each with a runtime fingerprint, and the status moves to completed. Open the Tornado tab to see which metrics and fiscal periods moved most by absolute percentage delta, and read variance direction next to each. Then open All Results to check whether the movement is sustained across periods or concentrated in one year, and specifically whether the cash rows move in the same direction as the P&L rows — a faster ramp usually costs cash before it earns it. If activation ranks high, the operational question follows immediately: can delivery actually resource the faster ramp? That check happens in Staffing & Resources, not here. Nothing on this page changes the model: adopting a different activation value requires a change set in Assumptions & Change Sets, and the finding should be recorded in Governance as a negotiation priority with its enabling conditions.",
      steps: [
        "Confirm the baseline scenario and that no stale-baseline badge is shown.",
        "Select the activation ramp assumption and the % Increments strategy.",
        "Enter a plausible increment list and keep all three scopes included.",
        "Execute, then confirm the status is completed with no error alert.",
        "Read the Tornado tab for ranked magnitude and direction.",
        "Read All Results for period-by-period and cash-scope behaviour.",
        "Validate operational feasibility, then raise a change set or negotiation ask.",
      ],
      result:
        "A reproducible, baseline-anchored ranking of where activation pace bites, with an owned follow-up action — and no change to the active model.",
    },
  ],
  faqs: [
    { id: "faq-1", question: "How is sensitivity different from scenario comparison?", answer: "A scenario changes a coherent bundle of assumptions to describe a different possible world. A sensitivity experiment holds the baseline fixed and moves one governed assumption to measure how far the outcome travels. Use scenarios to choose between worlds and sensitivity to find the strongest lever inside one." },
    { id: "faq-2", question: "What is the baseline?", answer: "The scenario and draft model version the experiment binds to. It supplies the unperturbed value of the tested assumption and the reference figures every delta is measured against. If the baseline had already moved on when the experiment was created, the detail page shows a stale-baseline badge." },
    { id: "faq-3", question: "How should ranges be chosen?", answer: "Choose values the business could plausibly reach and agree them with the owner of the assumption. The form accepts any comma-separated numbers, so there is no system check on plausibility. The default increment list is -0.10, -0.05, 0.05, 0.10 relative to the baseline value." },
    { id: "faq-4", question: "What does the Tornado tab show?", answer: "The top 25 result rows ranked by absolute percentage delta, with metric, fiscal period, baseline value, perturbed value, absolute delta, percentage delta and variance direction. It is a ranked table, not a graphical tornado chart, and it ranks by magnitude only — read direction alongside it." },
    { id: "faq-5", question: "Does sensitivity prove causation?", answer: "No. It shows how the model responds when an input changes. That response reflects the model's structure, not evidence that the real business behaves the same way. Causal claims need support from Sources and from functional owners." },
    { id: "faq-6", question: "Can I apply a result directly to the model?", answer: "No. Perturbed values persist to an isolated sensitivity run and never mutate historical model runs or the active model. Adopting a value requires a governed change set in Assumptions & Change Sets, and any released model change requires Release & Activation." },
    { id: "faq-7", question: "What is a breakpoint?", answer: "The value at which the outcome changes character — where a metric turns negative, a threshold is crossed, or the response stops being proportional. There is no automated breakpoint detection here; read All Results across the tested range and identify it by inspection." },
    { id: "faq-8", question: "What should I do with a highly sensitive assumption?", answer: "Give it an owner, strengthen its evidence in Sources, decide whether it is controllable, and treat it as a risk if it is not. High sensitivity is a reason for governance attention and mitigation — not a reason to move the input to the most flattering value in the range." },
  ],
  glossary: [
    { term: "Sensitivity", definition: "Measurement of how far an outcome moves when one governed assumption is changed around a fixed baseline." },
    { term: "Baseline", definition: "The scenario and model version an experiment binds to, supplying the unperturbed value and the reference figures for every delta." },
    { term: "Perturbation", definition: "One tested value of the selected assumption, executed as an isolated run and recorded with an index, label, value, status and runtime fingerprint." },
    { term: "Range", definition: "The set of tested values, entered either as comma-separated percentage increments relative to baseline or as comma-separated absolute values." },
    { term: "Outcome Metric", definition: "A metric code within an included scope — revenue, pnl or cash — reported per fiscal period with baseline and perturbed values." },
    { term: "Tornado", definition: "The ranked table of the top 25 results by absolute percentage delta. Rendered as a table on this page, not as a chart." },
    { term: "Percentage Delta", definition: "The proportional movement between baseline and perturbed value, displayed to two decimal places. This page computes no elasticity coefficient." },
    { term: "Breakpoint", definition: "A value in the tested range where the outcome changes character. Identified by inspection; not detected automatically." },
    { term: "Controllability", definition: "Whether the organisation can actually influence a driver. High impact plus low controllability is a risk; high impact plus high controllability is leverage." },
    { term: "Nonlinear Response", definition: "A response that is not proportional across the tested range, meaning a result at one increment cannot be extrapolated to another." },
    { term: "Stale Baseline", definition: "A badge shown when the baseline had already been superseded at the time the experiment was created; results should be re-run against a current baseline." },
  ],
  executiveTakeaway:
    "Sensitivity tells you where to spend your negotiating capital. Each experiment moves one governed assumption around a named baseline and reports how far Revenue, P&L and Cash travel — ranked by magnitude with direction shown. Read it as leverage, not as truth: it shows model response, never causation, and a flattering result at an unachievable value is not a recommendation. High-sensitivity drivers deserve owners, evidence and mitigation. Nothing here changes the model; adoption runs through change control and, where relevant, release certification.",
  keyRisks: [
    "Results cited from a stale or invalid baseline.",
    "Implausible ranges producing impressive but unusable findings.",
    "Single-variable results being added together as if interactions did not exist.",
    "Failed or partially executed experiments read as valid results.",
    "Sensitivity output treated as an approved assumption without change control.",
    "Cash and staffing consequences ignored behind a favourable EBITDA response.",
    "High-impact drivers left without an owner or a mitigation.",
  ],

  /* ---------------- Show on page ---------------- */
  showOnPageTargets: [
    { targetId: "sensitivity-interpretation", label: "Method and framing", description: "The header stating that one governed assumption is perturbed across Revenue, P&L and Cash." },
    { targetId: "sensitivity-baseline", label: "Baseline scenario", description: "The scenario the experiment binds to, defaulting to the flagged baseline." },
    { targetId: "sensitivity-variable-selection", label: "Perturbed assumption", description: "Single numeric assumption code selected from the baseline scenario." },
    { targetId: "sensitivity-range", label: "Strategy and range", description: "Percentage increments or absolute values defining the tested perturbations." },
    { targetId: "sensitivity-outcome", label: "Included scopes", description: "Revenue, pnl and cash — the engines executed and metrics returned." },
    { targetId: "sensitivity-history", label: "Experiments register", description: "Saved experiments with status, scopes, stale marker and creation time." },
    { targetId: "sensitivity-run-status", label: "Experiment status", description: "Status, assumption code, baseline value, scopes and stale-baseline warning." },
    { targetId: "sensitivity-tornado", label: "Tornado ranking", description: "Top 25 results by absolute percentage delta with direction." },
    { targetId: "sensitivity-results", label: "All results", description: "Full result set by scope, metric and fiscal period, capped at 500 rows on screen." },
  ],
};
