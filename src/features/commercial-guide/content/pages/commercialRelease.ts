import type { CommercialGuideContent } from "../../types";

/**
 * Page-specific Commercial Guide content — Release & Activation
 * (`/commercial/model/release`, prefix — the detail route
 * `/commercial/model/release/:versionId` shares this guide).
 *
 * Authored strictly against what renders in
 * `src/commercial/pages/CommercialRelease.tsx` and
 * `src/commercial/pages/CommercialReleaseDetail.tsx`:
 *
 *  - Workspace page: heading "Model Release & Activation" with the program
 *    name, a "Directional model" alert stating that readiness, manifests,
 *    hashes and lineage are computed server-side, a Model versions table
 *    (version code, name, status badge of draft / active / superseded,
 *    formula catalog version, activated timestamp, Open) with the active
 *    version named in the card description, and an Activation history table
 *    (activated at, model version, status, prior active, manifest hash,
 *    reason).
 *  - Detail page: version header with status badge and "Re-evaluate
 *    readiness", a blocking-controls destructive alert, four counters
 *    (Controls, Passing, Warnings, Blocking failures) and four tabs —
 *    Readiness (controls grouped by the ten categories Model configuration,
 *    Assumptions, Revenue, P&L, Cash, Comparison, Sensitivity, Documentation,
 *    Security, Lineage, each row showing control code, blocking flag, status,
 *    expected, actual and remediation hint), Certification (New certification,
 *    Refresh snapshot, Certify, an optional note, the certifications table
 *    with pass / warning / blocking counts, readiness hash and manifest hash,
 *    and Invalidate with a recorded reason), Lineage (relationship, upstream,
 *    downstream, scope, source hash) and Handoff (activation reason, Activate
 *    with a confirmation dialog, Create successor draft, activation records).
 *
 * Concepts requested but NOT present (a deployment or environment promotion
 * step, a rollback action, a scheduled activation window, a customer-facing
 * release note and a post-activation review record) are described only as
 * practice or recorded as known gaps. No control, hash, certification or
 * activation behaviour is changed by this guide, and no number is invented.
 */
export const commercialReleaseGuide: CommercialGuideContent = {
  pageId: "commercial-release",
  route: "/commercial/model/release",
  match: "prefix",
  pageTitle: "Release & Activation",
  guideTitle: "Release & Activation — Certifying a Model Version and Making It the Active Baseline",
  audiences: ["Executive", "Commercial Lead", "Finance", "Delivery", "Operations", "Administrator"],
  modes: ["executive", "practitioner", "administrator"],
  estimatedReadingMinutes: 12,
  trainingLevel: "Advanced",
  lastUpdated: "2026-07-31",

  /* ---------------- Overview ---------------- */
  purpose:
    "Release & Activation is the control gate between a model that is being worked on and the model the organisation is allowed to quote. It evaluates readiness controls against a model version, freezes a certified snapshot with deterministic hashes, and — only when certification is clean — activates that version as the single active baseline for the program, superseding the previous one and recording an immutable activation entry.",
  represents:
    "The release state of the commercial model. It shows every model version with its status (draft, active or superseded) and formula catalog version, the readiness controls evaluated per version, the certifications created against those controls with readiness and manifest hashes, the upstream lineage bound to a certification, and the activation history for the program. It represents governed release state, not new financial results.",
  whyItMatters:
    "Numbers become commitments the moment they leave the room. Without an activation control, two people can quote two different models and both believe they are current. Certification and activation make one version authoritative, make its evidence reproducible through hashes, and make every change of baseline attributable to a person, a timestamp and a stated reason.",
  moduleConnection:
    "Release & Activation sits at the end of the modelling chain. It reads the state produced by Assumptions & Change Sets, Scenarios, Revenue, P&L, Cash, Scenario Comparison and Sensitivity Analysis, and tests that state through readiness controls grouped by those same domains. It produces the active baseline that Overview, Governance and external commitments rely on. It never recalculates revenue, cost, cash or staffing — it certifies what those pages already produced.",
  questionsAnswered: [
    "Which model version is currently active for this program?",
    "Is this version ready to be released?",
    "Which controls are failing, and which of those block activation?",
    "What evidence was frozen at certification, and can it be reproduced?",
    "Which upstream artefacts is this certification bound to?",
    "Who activated a version, when, and for what stated reason?",
    "Which version did the current baseline supersede?",
    "Where do we continue modelling once a version is active?",
  ],
  expectedOutcome:
    "One certified model version is active for the program with zero blocking failures, its readiness snapshot and release manifest hashed and reproducible, its lineage recorded, its activation attributable with a stated reason, and a successor draft opened so continued modelling never disturbs the active baseline.",
  lifecycleStages: [
    "Financial Modeling",
    "Executive Review",
    "Delivery Planning",
    "Mobilization",
    "Operations",
    "Continuous Improvement",
  ],
  prerequisites: [
    { id: "pre-program", label: "Commercial program bootstrapped", route: "/commercial", detail: "Without a program the workspace shows an empty state and no release work is possible." },
    { id: "pre-version", label: "A model version to release", route: "/commercial/model/assumptions", detail: "Only a draft version can be activated; active and superseded versions are historical records." },
    { id: "pre-assumptions", label: "Applied assumptions", route: "/commercial/model/assumptions", detail: "Outstanding proposals and unapplied change sets surface as Assumptions-category control results." },
    { id: "pre-runs", label: "Completed Revenue, P&L and Cash runs", route: "/commercial/model/revenue", detail: "The Revenue, P&L and Cash control categories test the persisted run state for the version." },
    { id: "pre-comparison", label: "Saved comparison and sensitivity evidence", route: "/commercial/model/compare", detail: "The Comparison and Sensitivity categories check that the analytical evidence behind the case exists." },
    { id: "pre-permission", label: "Certification and activation permissions", detail: "Certification actions require commercial.release.certify; activation requires commercial.model.version.activate. Platform admins hold both." },
    { id: "pre-governance", label: "Governance approval of the planning case", route: "/commercial/neurealm-governance", detail: "The page enforces technical readiness, not commercial endorsement — the decision to release is taken in Governance." },
  ],
  ownership: {
    businessOwner: "Commercial Lead",
    commercialOwner: "Deal Lead",
    technicalOwner: "Model Administrator with Finance",
    executiveApprover: "Executive Sponsor",
    primaryUsers: ["Model Administrator", "Finance", "Commercial Lead", "Program Director"],
    consumersOfOutput: ["Executive Sponsor", "Governance", "Delivery", "Overview", "Audit and assurance"],
  },

  /* ---------------- How it works ---------------- */
  sections: [
    {
      id: "sec-context",
      title: "Release workspace context",
      targetId: "release-context",
      explanation:
        "The heading names the program the release workspace belongs to and states its scope: activation readiness, release certification, deterministic release manifests and activation lineage. Everything on the page is scoped to that one program. If the program named here is not the one you are releasing, stop before touching any certification action.",
    },
    {
      id: "sec-scope-note",
      title: "Directional model notice",
      targetId: "release-scope-note",
      explanation:
        "The alert states plainly that activation makes a model version operational for the program, and that readiness, manifests, hashes and lineage are computed server-side with nothing calculated in the browser. That server-side computation is what makes a hash trustworthy: the same version and state produce the same hash regardless of who opened the page or when.",
    },
    {
      id: "sec-versions",
      title: "Model versions register",
      targetId: "release-versions",
      explanation:
        "Every model version for the program is listed with its version code, name, status badge, formula catalog version, activation timestamp and an Open action. Status carries the whole release story: draft is being worked on, active is the current authoritative baseline, superseded is a former baseline retained as history. The formula catalog version records which calculation set the version was built against.",
    },
    {
      id: "sec-active",
      title: "Active version",
      targetId: "release-active",
      explanation:
        "The card description names the currently active version, or states that none is active yet. This is the single most important line on the page for a non-specialist: it is the version the organisation is entitled to quote. Exactly one version can be active for a program at a time — activating a new one supersedes the previous one atomically.",
    },
    {
      id: "sec-version-header",
      title: "Version detail header and re-evaluation",
      targetId: "release-version-header",
      explanation:
        "The detail page opens on the version code, its status badge and its name, with a Re-evaluate readiness action. Re-evaluation re-reads the current state of the model — it does not alter it. Use it after fixing a control so the failure is retested rather than assumed resolved, and before creating a certification you intend to rely on.",
    },
    {
      id: "sec-readiness-summary",
      title: "Readiness counters",
      targetId: "release-readiness-summary",
      explanation:
        "Four counters summarise the evaluation: total controls, passing, warnings and blocking failures. Blocking failures are the only count that stops activation. Warnings do not block, which makes them easy to ignore and dangerous to ignore — each one is a stated qualification on the release that someone must consciously accept.",
    },
    {
      id: "sec-blocking",
      title: "Blocking control alert",
      targetId: "release-blocking",
      explanation:
        "When any blocking control is failing, a destructive alert names how many and states that activation is blocked until every blocking control passes. This is a hard system control, not a reminder: the activation button stays disabled while a blocking failure exists. Resolve the underlying condition on its own page, then re-evaluate.",
    },
    {
      id: "sec-readiness-controls",
      title: "Readiness controls by category",
      targetId: "release-readiness-controls",
      explanation:
        "Controls are grouped into ten categories — Model configuration, Assumptions, Revenue, P&L, Cash, Comparison, Sensitivity, Documentation, Security and Lineage. Each row shows the control label and code, whether it is blocking, its status of pass, fail, warning or not applicable, the expected and actual values, and a remediation hint. The categories mirror the modelling chain, so a failure points directly at the page that must fix it.",
    },
    {
      id: "sec-certification-actions",
      title: "Certification actions",
      targetId: "release-certification-actions",
      explanation:
        "Permission-gated actions create a certification draft, refresh its snapshot against current state, or certify it. Certification freezes a readiness snapshot and a release manifest with deterministic hashes. An optional note is recorded with the action. Refreshing is only available before certification — once certified, the snapshot is fixed and a change requires a new certification.",
    },
    {
      id: "sec-certifications",
      title: "Certification register and hashes",
      targetId: "release-certifications",
      explanation:
        "Each certification lists its creation time, status, pass / warning / blocking counts, and the leading characters of its readiness hash and manifest hash. Status runs draft, ready, certified or invalidated. Invalidation requires a reason and is recorded in the audit trail rather than deleting the record — a withdrawn certification stays visible as history.",
    },
    {
      id: "sec-lineage",
      title: "Release lineage",
      targetId: "release-lineage",
      explanation:
        "Lineage lists the upstream evidence bound to the latest certification: relationship, upstream type, downstream type, scope and source hash. It answers the audit question directly — which assumption state, runs and analyses this certified release actually rests on. Lineage is captured when a certification is created, so a version with no certification shows none.",
    },
    {
      id: "sec-activation",
      title: "Activation and handoff",
      targetId: "release-activation",
      explanation:
        "Activation requires a certified release with zero blocking failures, a draft version, activation permission and a typed activation reason, and is confirmed through a dialog. The previously active version is superseded atomically, so there is never a moment with two active baselines or none. The reason is stored on the activation record and is the primary explanation an auditor will read.",
    },
    {
      id: "sec-successor",
      title: "Successor draft",
      targetId: "release-successor",
      explanation:
        "Creating a successor draft opens a new version code to continue modelling after activation. This is the mechanism that keeps the active baseline stable: further work happens on the successor, not on the version people are quoting. Open the successor immediately after activation so ongoing changes have a legitimate home.",
    },
    {
      id: "sec-activation-records",
      title: "Activation records for the version",
      targetId: "release-activation-records",
      explanation:
        "The detail page lists activations of this version with the timestamp, status, certification hash and warning count. The warning count is the honest record of what was accepted at activation — the qualifications the organisation knowingly released with, not a defect introduced afterwards.",
    },
    {
      id: "sec-activation-history",
      title: "Program activation history",
      targetId: "release-activation-history",
      explanation:
        "The workspace-level history is the immutable record of every baseline change for the program: activation time, model version, status, prior active version, manifest hash and reason. Read as a sequence it shows how the authoritative model evolved and why, which is exactly what a governance or audit review asks for.",
    },
  ],
  inputs: [
    { id: "in-version", label: "Model version", description: "The draft version proposed for release, with its code, name and formula catalog version.", owner: "Model Administrator", source: "Assumptions & Change Sets", required: true },
    { id: "in-assumption-state", label: "Applied assumption state", description: "The applied values behind the version; tested by the Assumptions control category.", owner: "Commercial Lead", source: "Assumptions & Change Sets", required: true },
    { id: "in-runs", label: "Persisted model runs", description: "Revenue, P&L and Cash results for the version; tested by their own control categories.", owner: "Finance", source: "Revenue, P&L, Cash", required: true },
    { id: "in-analysis", label: "Comparison and sensitivity evidence", description: "Saved comparisons and sensitivity results supporting the case.", owner: "Finance", source: "Scenario Comparison, Sensitivity Analysis", required: true },
    { id: "in-documentation", label: "Documentation state", description: "Evidence and narrative completeness tested by the Documentation control category.", owner: "Deal Lead", source: "Sources" },
    { id: "in-note", label: "Certification note", description: "Optional free text recorded with a certification action.", owner: "Model Administrator" },
    { id: "in-reason", label: "Activation reason", description: "Required rationale typed before activation and stored on the activation record.", owner: "Model Administrator", required: true },
    { id: "in-successor-code", label: "Successor version code", description: "The code for the new draft opened to continue modelling after activation.", owner: "Model Administrator" },
    { id: "in-invalidation-reason", label: "Invalidation reason", description: "Reason recorded in the audit trail when a certification is withdrawn.", owner: "Model Administrator" },
  ],
  outputs: [
    { id: "out-readiness", label: "Readiness evaluation", description: "Control-by-control pass, fail, warning or not-applicable state with expected and actual values.", consumedBy: ["Model Administrator", "Finance", "Governance"] },
    { id: "out-certification", label: "Certification record", description: "A frozen readiness snapshot and release manifest with pass, warning and blocking counts.", consumedBy: ["Governance", "Audit and assurance"] },
    { id: "out-hashes", label: "Readiness and manifest hashes", description: "Deterministic hashes that make the certified state reproducible and tamper-evident.", consumedBy: ["Audit and assurance", "Finance"] },
    { id: "out-lineage", label: "Lineage records", description: "Upstream-to-downstream bindings with scope and source hash for the certification.", consumedBy: ["Audit and assurance", "Governance"] },
    { id: "out-active", label: "Active model version", description: "The single authoritative baseline for the program at any point in time.", consumedBy: ["Overview", "Governance", "Delivery", "Executive Sponsor"] },
    { id: "out-activation", label: "Activation record", description: "Immutable entry with timestamp, prior active version, certification hash, warning count and reason.", consumedBy: ["Governance", "Audit and assurance"] },
    { id: "out-successor", label: "Successor draft version", description: "A new draft that carries continued modelling without disturbing the active baseline.", consumedBy: ["Model Administrator", "Finance"] },
  ],
  businessRules: [
    { id: "br-1", rule: "Exactly one version is active per program", explanation: "Activation supersedes the previously active version atomically, so the program always has one authoritative baseline and never two. This is what makes 'the current model' an unambiguous statement." },
    { id: "br-2", rule: "Only a draft version can be activated", explanation: "Active and superseded versions are historical records. Continued work belongs on a successor draft, which is why a successor is created rather than the active version being edited." },
    { id: "br-3", rule: "Activation requires a certified release", explanation: "The activation control is enabled only when the latest certification carries the status certified. An uncertified version can be modelled and reviewed but cannot become the baseline." },
    { id: "br-4", rule: "A single blocking failure prevents activation", explanation: "Blocking controls are absolute. The count of blocking failures must be zero — the alert states this and the action stays disabled until the underlying condition is resolved and readiness is re-evaluated." },
    { id: "br-5", rule: "Warnings do not block but must be accepted", explanation: "Warnings pass through activation and are stored as a warning count on the activation record. They are qualifications the organisation is knowingly releasing with, and should be reviewed explicitly rather than skimmed." },
    { id: "br-6", rule: "Certification freezes a snapshot", explanation: "Certifying fixes the readiness snapshot and the release manifest. Later changes to assumptions or runs do not retroactively alter a certification — they require a refreshed or new certification." },
    { id: "br-7", rule: "Hashes are computed server-side", explanation: "Readiness, manifest and certification hashes are produced by the server, never in the browser. That is what allows a hash quoted months later to be independently recomputed and trusted." },
    { id: "br-8", rule: "Activation requires a stated reason", explanation: "The activation control stays disabled until a reason is typed. The reason is stored on the immutable activation record and is the explanation governance and audit read first." },
    { id: "br-9", rule: "Certification and activation are separate permissions", explanation: "commercial.release.certify governs certification actions and commercial.model.version.activate governs activation. Users without them see the page read-only, which keeps evidence visible while control stays restricted." },
    { id: "br-10", rule: "Invalidation is recorded, not deleted", explanation: "Withdrawing a certification requires a reason and leaves an invalidated record in place. History remains complete, so a withdrawn release is visible rather than silently absent." },
    { id: "br-11", rule: "Lineage is bound at certification", explanation: "Lineage rows are captured against the latest certification. A version with no certification shows no lineage, which is itself the signal that no reproducible evidence chain exists yet." },
    { id: "br-12", rule: "Readiness reflects current state at evaluation time", explanation: "Re-evaluating reads present state. A readiness view opened before an upstream change was applied is stale — re-evaluate before relying on it for a certification decision." },
    { id: "br-13", rule: "Release certifies, it does not calculate", explanation: "No revenue, cost, cash or staffing figure is produced here. Every control tests state created on the upstream pages, so remediation always happens on the page that owns the data." },
    { id: "br-14", rule: "Technical readiness is not commercial approval", explanation: "A clean certification means the model is internally consistent and evidenced. Whether the case should be released remains a Governance decision taken with the Executive Sponsor." },
  ],
  calculationLogic: [
    "Readiness controls are evaluated server-side per model version and returned grouped into the ten categories Model configuration, Assumptions, Revenue, P&L, Cash, Comparison, Sensitivity, Documentation, Security and Lineage.",
    "Each control returns a status of pass, fail, warning or not applicable, together with an expected value, an actual value and a remediation hint where one applies.",
    "Blocking failures are counted as controls flagged blocking whose status is fail; warnings are counted separately and do not block.",
    "Certification freezes the evaluated control set and the release manifest, and records pass, warning and blocking counts with a readiness hash and a manifest hash.",
    "Activation is permitted only when the latest certification is certified, the version status is draft, blocking failures are zero and the user holds activation permission.",
    "Activation supersedes the prior active version in the same transaction and writes an activation record carrying the prior active version, certification hash, warning count and reason.",
    "No commercial figure is computed on this page — Revenue, P&L, Cash, comparison and sensitivity values are read from their own persisted runs.",
  ],
  relationship: {
    receivesFrom: [
      "Assumptions & Change Sets — the applied assumption state behind the version",
      "Scenarios — the scenario set the version was modelled across",
      "Revenue, P&L (Cost & EBITDA) and Cash & Sustainability — persisted run results",
      "Scenario Comparison and Sensitivity Analysis — the analytical evidence behind the case",
      "Sources — documentation and evidence completeness",
      "Governance — the decision that the case should be released",
    ],
    models: [
      "Readiness of a model version against blocking and non-blocking controls",
      "Certification state with frozen readiness and manifest hashes",
      "Upstream lineage bound to a certification",
      "Activation state and version supersession",
      "Activation history and attribution for the program",
    ],
    feeds: [
      "Overview — the active baseline reported to executives",
      "Governance — release evidence, warnings accepted and activation attribution",
      "Delivery and Operations — the version delivery plans are built against",
      "Audit and assurance — reproducible hashes and immutable activation records",
      "Assumptions & Change Sets — the successor draft where modelling continues",
    ],
  },
  downstreamImpacts: [
    { area: "Governance", effect: "Activation changes which model version governance decisions and board materials refer to." },
    { area: "Revenue", effect: "Quoted revenue figures should be drawn from the active version; a superseded version's figures are historical." },
    { area: "EBITDA", effect: "Margin commitments made externally are only defensible against the certified active baseline." },
    { area: "Cash", effect: "Funding requests should cite the active version's cash profile, not a draft under revision." },
    { area: "Staffing", effect: "Hiring and capacity commitments follow the staffing shape implied by the released case." },
    { area: "Timeline", effect: "Activation timing determines when delivery planning can be built on stable numbers." },
    { area: "Activation", effect: "The activation record establishes the baseline date from which change control applies." },
    { area: "Risk", effect: "Warnings accepted at activation become carried risks that need explicit ownership." },
  ],
  dataQuality: {
    dataSources: [
      "Commercial model versions with status and formula catalog version",
      "Server-side readiness control evaluation",
      "Release certifications with pass, warning and blocking counts and hashes",
      "Release lineage records",
      "Model activation records for the program",
    ],
    updateFrequency: "Readiness is evaluated on demand and on re-evaluation; certifications and activations are written at the moment the action is taken.",
    knownGaps: [
      "There is no rollback action — reverting means certifying and activating another version.",
      "There is no scheduled or future-dated activation; activation happens immediately on confirmation.",
      "There is no environment promotion or deployment step — activation is a model-state change, not a software release.",
      "There is no customer-facing release note generated from the certification.",
      "There is no post-activation review record; confirming that the released case held is done in Governance.",
      "Warning acceptance is recorded as a count, not as an itemised sign-off per warning.",
    ],
    changeControl:
      "Certifications freeze state and can only be withdrawn by an explicit, reasoned invalidation. Activation is immutable and attributable. Continued modelling is directed onto a successor draft so the active baseline never changes silently.",
    lineage:
      "Readiness hash, manifest hash and certification hash bind an activation to the exact evaluated state and its upstream evidence, and the activation record names the version it superseded.",
  },
  modelConfidence: "High",
  confidenceBasis: ["Governance approvals", "Source completeness", "Commercial terms", "Revenue assumptions", "Cost assumptions", "Timing"],
  confidenceGuidance:
    "Confidence in the release mechanism is high — controls, hashes and activation are computed and enforced server-side, and activation records are immutable. Confidence in the released numbers is inherited, not created here: it is only as good as the assumptions, runs and evidence the controls tested. Treat a clean certification as proof of consistency and traceability, never as proof that the commercial case is right.",
  commercialReadiness: "Approval Required",
  readinessCriteria: [
    "The intended program and model version are confirmed before any action is taken.",
    "Readiness has been re-evaluated against current state, not read from a stale view.",
    "Blocking failures are zero.",
    "Every warning has been read and explicitly accepted by a named owner.",
    "Assumptions, Revenue, P&L and Cash control categories all reflect current, applied state.",
    "Comparison and Sensitivity evidence supporting the case exists and is saved.",
    "A certification exists with the status certified and its hashes recorded.",
    "Lineage is present for the certification.",
    "Governance has endorsed releasing this case.",
    "An activation reason has been agreed and stated.",
    "A successor draft code has been decided for continued modelling.",
  ],

  /* ---------------- How to use it ---------------- */
  workflow: [
    { id: "wf-1", step: 1, title: "Confirm the program and active version", description: "Read the workspace heading and the active version named on the Model versions card before doing anything else.", role: "Model Administrator" },
    { id: "wf-2", step: 2, title: "Open the candidate version", description: "Open the draft version proposed for release from the Model versions table.", role: "Model Administrator" },
    { id: "wf-3", step: 3, title: "Re-evaluate readiness", description: "Re-evaluate so the control results reflect current model state rather than an earlier evaluation.", role: "Finance" },
    { id: "wf-4", step: 4, title: "Read the counters", description: "Check total controls, passing, warnings and blocking failures before reading any individual row.", role: "Finance" },
    { id: "wf-5", step: 5, title: "Resolve blocking failures", description: "Work each blocking failure on the page that owns it, using the remediation hint, then re-evaluate.", role: "Model Administrator" },
    { id: "wf-6", step: 6, title: "Review warnings deliberately", description: "Read every warning and decide, with a named owner, whether it is acceptable to release with.", role: "Commercial Lead" },
    { id: "wf-7", step: 7, title: "Confirm upstream categories", description: "Check the Assumptions, Revenue, P&L, Cash, Comparison and Sensitivity categories reflect the case being released.", role: "Finance" },
    { id: "wf-8", step: 8, title: "Create the certification draft", description: "Create a certification, adding a note that states what is being certified and why.", role: "Model Administrator" },
    { id: "wf-9", step: 9, title: "Refresh the snapshot if state moved", description: "Refresh before certifying if anything upstream changed after the draft was created.", role: "Model Administrator" },
    { id: "wf-10", step: 10, title: "Certify the release", description: "Certify to freeze the readiness snapshot and manifest, then record the readiness and manifest hashes.", role: "Model Administrator" },
    { id: "wf-11", step: 11, title: "Check lineage", description: "Open the Lineage tab and confirm the upstream evidence bound to the certification is what you expect.", role: "Finance" },
    { id: "wf-12", step: 12, title: "Obtain governance endorsement", description: "Present the certification, its warnings and the case to Governance and the Executive Sponsor.", role: "Governance" },
    { id: "wf-13", step: 13, title: "Activate with a stated reason", description: "Type the activation rationale, confirm in the dialog, and let the prior version be superseded atomically.", role: "Model Administrator" },
    { id: "wf-14", step: 14, title: "Open a successor draft", description: "Create the next version code immediately so continued modelling never touches the active baseline.", role: "Model Administrator" },
    { id: "wf-15", step: 15, title: "Communicate the new baseline", description: "Tell Finance, Delivery and Governance which version is now authoritative and what was accepted with it.", role: "Commercial Lead" },
  ],
  actionsAvailable: [
    "Browse every model version with status, formula catalog version and activation timestamp.",
    "Open a version to see its readiness controls grouped by category.",
    "Re-evaluate readiness against current model state.",
    "Create a certification draft with an optional note (requires certify permission).",
    "Refresh a certification snapshot before it is certified (requires certify permission).",
    "Certify a ready release, freezing readiness and manifest hashes (requires certify permission).",
    "Invalidate a certification with a recorded reason (requires certify permission).",
    "Review lineage bound to the latest certification.",
    "Activate a certified draft version with a stated reason and confirmation dialog (requires activate permission).",
    "Create a successor draft version to continue modelling (requires activate permission).",
    "Read program-level activation history including prior active version and manifest hash.",
  ],
  teamActivities: [
    { id: "ta-1", activity: "Readiness review of the candidate version", role: "Model Administrator with Finance", cadence: "Before every certification" },
    { id: "ta-2", activity: "Blocking-failure remediation on the owning pages", role: "Finance / Commercial Lead", cadence: "Until blocking failures are zero" },
    { id: "ta-3", activity: "Warning acceptance walkthrough", role: "Commercial Lead with Executive Sponsor", cadence: "Before activation" },
    { id: "ta-4", activity: "Certification and hash recording", role: "Model Administrator", cadence: "Per release" },
    { id: "ta-5", activity: "Lineage and evidence check", role: "Finance", cadence: "Per certification" },
    { id: "ta-6", activity: "Governance endorsement of the release", role: "Governance with Executive Sponsor", cadence: "Per release" },
    { id: "ta-7", activity: "Activation and baseline communication", role: "Model Administrator with Commercial Lead", cadence: "Per activation" },
    { id: "ta-8", activity: "Successor draft creation and modelling handover", role: "Model Administrator", cadence: "Immediately after activation" },
  ],
  roles: [
    { role: "Model Administrator", responsibility: "Operates the release workspace — evaluates readiness, certifies, activates, invalidates and opens successor drafts." },
    { role: "Finance", responsibility: "Validates that the Revenue, P&L, Cash, Comparison and Sensitivity control categories reflect the intended case." },
    { role: "Commercial Lead", responsibility: "Owns the commercial content being released and leads the acceptance of warnings." },
    { role: "Deal Lead", responsibility: "Confirms the released case matches the deal position being taken to the customer." },
    { role: "Program Director", responsibility: "Confirms the released baseline is the version delivery planning will be built against." },
    { role: "Governance", responsibility: "Endorses the release, records accepted warnings and holds the activation to account." },
    { role: "Executive Sponsor", responsibility: "Approves the release decision and accepts the residual qualifications." },
    { role: "Audit and assurance", responsibility: "Uses hashes, lineage and activation records to reproduce and verify what was released." },
  ],
  raci: [
    { activity: "Evaluate readiness for a candidate version", assignments: [{ role: "Model Administrator", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Commercial Lead", raci: "C" }, { role: "Governance", raci: "I" }] },
    { activity: "Remediate blocking control failures", assignments: [{ role: "Finance", raci: "R" }, { role: "Commercial Lead", raci: "A" }, { role: "Model Administrator", raci: "C" }, { role: "Program Director", raci: "I" }] },
    { activity: "Accept non-blocking warnings", assignments: [{ role: "Commercial Lead", raci: "R" }, { role: "Executive Sponsor", raci: "A" }, { role: "Finance", raci: "C" }, { role: "Governance", raci: "I" }] },
    { activity: "Certify the release", assignments: [{ role: "Model Administrator", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Governance", raci: "C" }, { role: "Deal Lead", raci: "I" }] },
    { activity: "Activate the model version", assignments: [{ role: "Model Administrator", raci: "R" }, { role: "Executive Sponsor", raci: "A" }, { role: "Governance", raci: "C" }, { role: "Delivery", raci: "I" }] },
    { activity: "Open the successor draft and resume modelling", assignments: [{ role: "Model Administrator", raci: "R" }, { role: "Finance", raci: "A" }, { role: "Commercial Lead", raci: "C" }, { role: "Program Director", raci: "I" }] },
  ],
  reviewRequirements: [
    "Program and candidate version confirmed before any certification action.",
    "Readiness re-evaluated so results reflect current state.",
    "Every blocking failure resolved on its owning page and retested.",
    "Every warning read, owned and explicitly accepted.",
    "Assumptions, Revenue, P&L and Cash categories confirmed against the intended case.",
    "Comparison and Sensitivity evidence confirmed as saved and current.",
    "Lineage reviewed for the certification being relied on.",
    "Readiness and manifest hashes recorded alongside the governance decision.",
    "Activation reason reviewed for accuracy before confirmation.",
  ],
  approvalRequirements: [
    "Certification actions require the commercial.release.certify permission; without it the page is read-only.",
    "Activation requires the commercial.model.version.activate permission; platform administrators hold it implicitly.",
    "Activation is blocked by the system until the latest certification is certified and blocking failures are zero.",
    "A typed activation reason is mandatory before the confirmation dialog can complete the activation.",
    "Governance endorsement and Executive Sponsor approval are required before activation — the system enforces readiness, not authority.",
    "Invalidating a certification requires a reason that is written to the audit trail.",
  ],
  decisions: [
    { id: "dec-1", decision: "Whether the candidate version is ready to certify", decidedBy: "Model Administrator with Finance", evidence: "Re-evaluated readiness with zero blocking failures and reviewed warnings" },
    { id: "dec-2", decision: "Whether each warning is acceptable to release with", decidedBy: "Commercial Lead with Executive Sponsor", evidence: "Warning rows with expected and actual values and remediation hints" },
    { id: "dec-3", decision: "Whether the certified version should become the active baseline", decidedBy: "Executive Sponsor on Governance endorsement", evidence: "Certification record, hashes and lineage" },
    { id: "dec-4", decision: "What the activation reason states", decidedBy: "Model Administrator with Commercial Lead", evidence: "The governance decision that authorised the release" },
    { id: "dec-5", decision: "Whether a certification must be invalidated", decidedBy: "Model Administrator with Finance", evidence: "A material upstream change made after the snapshot was frozen" },
    { id: "dec-6", decision: "Which successor version code continues the modelling", decidedBy: "Model Administrator", evidence: "The program's version-coding convention and the next planned cycle" },
  ],
  whatToDoNext: [
    "Resolve any blocking control on the page that owns it, then re-evaluate readiness.",
    "Refresh stale Revenue, P&L or Cash runs before certifying.",
    "Apply or cancel outstanding assumption proposals in Assumptions & Change Sets.",
    "Save the comparison and sensitivity evidence that supports the case.",
    "Record the readiness and manifest hashes with the governance decision.",
    "Activate with a reason that names the decision that authorised it.",
    "Open the successor draft and point continued modelling at it.",
    "Confirm Overview and Governance now reference the newly active version.",
  ],
  relatedPages: [
    { pageId: "commercial-assumptions", label: "Assumptions & Change Sets", route: "/commercial/model/assumptions", relationship: "Prerequisite" },
    { pageId: "commercial-scenarios", label: "Scenarios", route: "/commercial/scenarios", relationship: "Upstream" },
    { pageId: "commercial-revenue", label: "Revenue", route: "/commercial/model/revenue", relationship: "Upstream" },
    { pageId: "commercial-pnl", label: "P&L (Cost & EBITDA)", route: "/commercial/model/pnl", relationship: "Upstream" },
    { pageId: "commercial-cash", label: "Cash & Sustainability", route: "/commercial/model/cash", relationship: "Upstream" },
    { pageId: "commercial-compare", label: "Scenario Comparison", route: "/commercial/model/compare", relationship: "Upstream" },
    { pageId: "commercial-sensitivity", label: "Sensitivity Analysis", route: "/commercial/model/sensitivity", relationship: "Upstream" },
    { pageId: "commercial-governance", label: "Governance", route: "/commercial/neurealm-governance", relationship: "Companion" },
    { pageId: "commercial-overview", label: "Overview", route: "/commercial", relationship: "Downstream" },
  ],

  /* ---------------- Interpretation & training ---------------- */
  interpretation: [
    {
      band: "healthy",
      label: "Certified, activated and reproducible",
      criteria: [
        "One version is active and it is the version the organisation is quoting.",
        "The active version was activated from a certified release with zero blocking failures.",
        "Readiness and manifest hashes are recorded and lineage is present.",
        "Warnings accepted at activation are itemised and owned outside the system.",
        "The activation record carries a reason that names the authorising decision.",
        "A successor draft is open, so modelling continues without touching the baseline.",
      ],
      action: "Communicate the active version to Finance, Delivery and Governance, and direct all further changes to the successor draft.",
    },
    {
      band: "warning",
      label: "Releasable with stated qualifications",
      criteria: [
        "Non-blocking warnings exist and have not yet been explicitly accepted by a named owner.",
        "A certification draft exists but has not been refreshed since an upstream change.",
        "Documentation or Lineage controls are passing only marginally.",
        "The candidate version is certified but Governance endorsement is still outstanding.",
        "The active version is some cycles old and modelling has moved on materially.",
      ],
      action: "Itemise and assign the warnings, refresh the snapshot if state moved, and complete governance endorsement before activating.",
    },
    {
      band: "critical",
      label: "Must not be activated or quoted",
      criteria: [
        "Blocking controls are failing.",
        "No version is active while figures are being quoted externally.",
        "Figures are being quoted from a draft or superseded version as if authoritative.",
        "The certification relied on has been invalidated.",
        "An activation would proceed without a stated reason or without governance authority.",
        "Lineage is absent, so the release cannot be traced to its evidence.",
      ],
      action: "Stop external commitments, resolve the blocking conditions on their owning pages, re-certify and re-present to Governance before activating.",
    },
  ],
  commonMistakes: [
    { id: "cm-1", description: "Treating a clean certification as proof that the commercial case is correct.", correction: "Certification proves internal consistency and traceability. The merit of the case is decided in Governance with the Executive Sponsor." },
    { id: "cm-2", description: "Ignoring warnings because they do not block activation.", correction: "Read every warning and record who accepted it. Warnings become carried risks the moment activation completes." },
    { id: "cm-3", description: "Quoting figures from a draft version because it is more recent than the active one.", correction: "Only the active version is authoritative. If the draft is better, certify and activate it rather than quoting it informally." },
    { id: "cm-4", description: "Certifying against a readiness view evaluated before an upstream change was applied.", correction: "Re-evaluate readiness immediately before certifying, and refresh the snapshot if anything moved after the draft was created." },
    { id: "cm-5", description: "Continuing to model on the version that has just been activated.", correction: "Create the successor draft straight away and direct all further changes there, leaving the baseline stable." },
    { id: "cm-6", description: "Writing an activation reason that restates the version code instead of the rationale.", correction: "State the decision that authorised the release — the reason is the first thing an auditor reads." },
    { id: "cm-7", description: "Fixing a failing control by adjusting the release page rather than the source page.", correction: "Controls test upstream state. Remediation always happens on the page that owns the assumption, run or evidence." },
    { id: "cm-8", description: "Expecting activation to deploy software or change a customer-facing system.", correction: "Activation changes which model version is authoritative. It is a governance act, not an environment promotion." },
    { id: "cm-9", description: "Assuming an activation can be undone.", correction: "There is no rollback. Reverting means certifying and activating another version, which is itself recorded in the history." },
    { id: "cm-10", description: "Recording hashes nowhere outside the application.", correction: "Carry the readiness and manifest hashes into the governance minute so the decision and the evidence stay linked." },
  ],
  bestPractices: [
    "Re-evaluate readiness immediately before certifying, never earlier.",
    "Resolve blocking controls at source and retest rather than reasoning around them.",
    "Itemise warnings with a named acceptor before activation.",
    "Write certification notes that state what is being certified and for which decision.",
    "Record readiness and manifest hashes in the governance minute.",
    "Use activation reasons that reference the authorising decision, not the mechanics.",
    "Open the successor draft in the same session as the activation.",
    "Keep version codes conventional and sequential so history reads clearly.",
    "Review activation history periodically to confirm the baseline is not drifting out of date.",
    "Invalidate rather than ignore a certification that no longer reflects reality.",
  ],
  workedExamples: [
    {
      id: "we-1",
      title: "A candidate version fails one blocking control and is released a day later",
      narrative:
        "A draft version is prepared for release. Readiness is re-evaluated and the counters show a set of controls passing, several warnings, and one blocking failure in the Cash category: the persisted cash run no longer matches the applied assumption state, because a change set was applied after the last run. The destructive alert states that activation is blocked. Nothing on the release page can fix this — the control is testing state owned by Cash & Sustainability. Finance re-runs the scenario there, returns to the version and re-evaluates. The blocking count falls to zero and the Cash category passes. The remaining warnings sit in Documentation and Sensitivity; the Commercial Lead reads each one, and the Executive Sponsor accepts them in writing as qualifications on the release. A certification is created with a note naming the governance decision, and because nothing has moved since, it is certified directly. The readiness and manifest hashes are copied into the governance minute alongside the endorsement. The administrator types an activation reason that names that decision, confirms the dialog, and the previously active version is superseded atomically. A successor draft is opened the same afternoon so the next modelling cycle has somewhere legitimate to run.",
      steps: [
        "Re-evaluate readiness on the candidate draft version.",
        "Read the counters: one blocking failure, several warnings.",
        "Identify the failing control's category and remediation hint.",
        "Fix the underlying state on the owning page — Cash & Sustainability.",
        "Re-evaluate; confirm blocking failures are zero.",
        "Review and formally accept every remaining warning.",
        "Create the certification with a note and certify it.",
        "Record the readiness and manifest hashes with the governance decision.",
        "Activate with a stated reason and confirm the prior version is superseded.",
        "Open the successor draft for continued modelling.",
      ],
      result:
        "The version is activated with zero blocking failures, accepted warnings recorded against a named owner, hashes carried into the governance record, and continued modelling redirected to a successor draft rather than the live baseline.",
    },
  ],
  faqs: [
    { id: "faq-1", question: "What is the difference between certification and activation?", answer: "Certification freezes evidence: it snapshots the readiness evaluation and release manifest and hashes them. Activation changes reality: it makes that version the single authoritative baseline for the program and supersedes the previous one. Certification is a prerequisite for activation, not a substitute for it." },
    { id: "faq-2", question: "Why can I not activate even though everything looks fine?", answer: "Activation needs four things at once: a certified latest certification, a version still in draft status, zero blocking failures, and the activation permission. It also needs a typed activation reason. If any one is missing the control stays disabled." },
    { id: "faq-3", question: "Do warnings stop a release?", answer: "No. Only blocking control failures stop activation. Warnings pass through and are stored as a warning count on the activation record. Treat them as qualifications you are knowingly releasing with, and have a named owner accept each one before activating." },
    { id: "faq-4", question: "What are the hashes for?", answer: "The readiness hash, manifest hash and certification hash are computed server-side and make a release reproducible and tamper-evident. Quoted months later, they let anyone confirm that the figures presented came from exactly the state that was certified." },
    { id: "faq-5", question: "Can an activation be rolled back?", answer: "There is no rollback action. If a released version turns out to be wrong, the response is to correct the model on a successor draft, certify it and activate that. Both activations remain in the history, which is the honest record of what happened." },
    { id: "faq-6", question: "Does activation deploy anything?", answer: "No. Activation is a model-state change within the Commercial Module — it decides which version is authoritative. It does not promote environments, deploy software or change any customer-facing system." },
    { id: "faq-7", question: "Why create a successor draft?", answer: "Because an active version must stay stable while people quote it. The successor gives continued modelling a legitimate home, so improvements never silently alter the baseline others are relying on." },
    { id: "faq-8", question: "What does invalidating a certification do?", answer: "It withdraws that certification with a recorded reason and leaves an invalidated record in place. Nothing is deleted. Use it when a material upstream change means the frozen snapshot no longer represents reality." },
    { id: "faq-9", question: "Where do I fix a failing control?", answer: "On the page that owns the state. The control categories mirror the modelling chain — Assumptions, Revenue, P&L, Cash, Comparison, Sensitivity, Documentation, Security and Lineage — and the remediation hint points at what is expected versus what was found." },
    { id: "faq-10", question: "Is a certified release approved to be used commercially?", answer: "Not by itself. Certification means the model is consistent and evidenced. Whether the case should be committed to a customer is a Governance decision taken with the Executive Sponsor, and it should precede activation." },
  ],
  glossary: [
    { term: "Model version", definition: "A named, coded version of the commercial model that can be draft, active or superseded." },
    { term: "Active baseline", definition: "The single model version currently authoritative for a program; exactly one exists at a time." },
    { term: "Superseded", definition: "The status given to a previously active version when a new version is activated." },
    { term: "Readiness control", definition: "A server-evaluated check on model state returning pass, fail, warning or not applicable, with expected and actual values." },
    { term: "Blocking control", definition: "A readiness control whose failure prevents activation entirely." },
    { term: "Certification", definition: "A frozen snapshot of the readiness evaluation and release manifest, with deterministic hashes and counts." },
    { term: "Readiness hash", definition: "A deterministic hash of the evaluated control set at certification time." },
    { term: "Manifest hash", definition: "A deterministic hash of the release manifest, identifying exactly what was certified." },
    { term: "Lineage", definition: "Recorded bindings from a certification to its upstream evidence, with relationship, scope and source hash." },
    { term: "Activation record", definition: "An immutable entry capturing when a version was activated, by what reason, which version it superseded and the warning count accepted." },
    { term: "Formula catalog version", definition: "The identifier of the calculation set a model version was built against." },
    { term: "Successor draft", definition: "A new draft version opened after activation so modelling continues without altering the active baseline." },
  ],
  executiveTakeaway:
    "Release & Activation is the reason a Neurealm commercial number can be trusted. One certified version is active for the program at a time, it cannot become active while a blocking control fails, and every activation carries a reason, a person, a timestamp and hashes that let the underlying evidence be reproduced later. Warnings do not block, so the executive question at release is not whether the system allowed it — it is which qualifications were knowingly accepted, by whom, and whether the case behind them still stands.",
  keyRisks: [
    "Quoting figures from a draft or superseded version as though they were the active baseline.",
    "Accepting warnings implicitly, so carried qualifications end up unowned.",
    "Certifying against a readiness view that predates an upstream change.",
    "Letting the active version fall materially behind current modelling.",
    "Continuing to model on the active version instead of a successor draft.",
    "Recording hashes nowhere outside the system, breaking the link between decision and evidence.",
    "Treating technical readiness as commercial approval.",
  ],

  /* ---------------- Show on page ---------------- */
  showOnPageTargets: [
    { targetId: "release-context", label: "Release workspace context", description: "Program name and the scope of the release workspace." },
    { targetId: "release-scope-note", label: "Directional model notice", description: "Readiness, manifests, hashes and lineage are computed server-side." },
    { targetId: "release-versions", label: "Model versions register", description: "Every version with status, formula catalog version and activation time." },
    { targetId: "release-active", label: "Active version", description: "The version currently authoritative for this program." },
    { targetId: "release-activation-history", label: "Activation history", description: "Immutable record of every baseline change for the program." },
    { targetId: "release-version-header", label: "Version header", description: "Version code, status badge and re-evaluate readiness." },
    { targetId: "release-readiness-summary", label: "Readiness counters", description: "Controls, passing, warnings and blocking failures." },
    { targetId: "release-blocking", label: "Blocking control alert", description: "Activation is blocked until every blocking control passes." },
    { targetId: "release-readiness-controls", label: "Readiness controls", description: "Controls grouped by the ten readiness categories." },
    { targetId: "release-certification-actions", label: "Certification actions", description: "Create, refresh and certify a release snapshot." },
    { targetId: "release-certifications", label: "Certification register", description: "Certification status, counts, readiness hash and manifest hash." },
    { targetId: "release-lineage", label: "Release lineage", description: "Upstream evidence bound to the latest certification." },
    { targetId: "release-activation", label: "Activation", description: "Activation reason, eligibility and confirmation." },
    { targetId: "release-successor", label: "Successor version", description: "Open a new draft to continue modelling after activation." },
    { targetId: "release-activation-records", label: "Activation records", description: "Activations of this version with certification hash and warnings." },
  ],
};
