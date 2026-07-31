import type { CommercialGuideContent } from "../../types";

/**
 * Page-specific Commercial Guide content — Governance
 * (`/commercial/neurealm-governance`).
 *
 * Authored strictly against what `src/commercial/pages/CommercialNeurealmGovernance.tsx`
 * and the components in `src/commercial/governance/*` actually render:
 *
 *  - Header: title "Governance", subtitle, engagement context, view switch,
 *    Export menu (incl. "Copy Executive Update"), notifications, reset, and an
 *    "Unsaved local changes" badge.
 *  - Five summary cards: Overall Governance Health, Active Workstreams, Open
 *    Decisions, Open Risks, Next Governance Meeting — each scrolls to a section.
 *  - Three-tier operating model (Executive Steering Committee, Program
 *    Management Office, Delivery and Operations Pods) with a tier drawer.
 *  - Day 0 / Day 1 / Day 2 operational focus cards with activity checklists and
 *    readiness percentages.
 *  - Seven governance forums with cadence, chair, next meeting and open actions.
 *  - RACI snapshot across 13 functions and 7 governance groups.
 *  - Risk and issue register (5 items), decision register (5 items), 10
 *    governance KPIs, Executive Attention panel (5 items), governance calendar
 *    (7 meetings) and a local activity feed.
 *  - A prototype notice: all state is local and mock, nothing persists.
 *
 * This guide changes no governance behaviour, state or data.
 */
export const commercialGovernanceGuide: CommercialGuideContent = {
  pageId: "commercial-governance",
  route: "/commercial/neurealm-governance",
  match: "exact",
  pageTitle: "Governance",
  guideTitle: "Governance — Who Decides, Who Owns, and What Is Blocked",
  audiences: ["Executive", "Commercial Lead", "Finance", "Delivery", "Operations", "Administrator"],
  modes: ["executive", "practitioner", "administrator"],
  estimatedReadingMinutes: 14,
  trainingLevel: "Advanced",
  lastUpdated: "2026-07-31",

  /* ---------------- Overview ---------------- */
  purpose:
    "This page shows how Neurealm governs the engagement: the decision rights held at each governance tier, the forums that meet and what they may approve, who is Responsible and who is Accountable for each function, the open risks and issues, the decisions in flight with owners and due dates, the governance KPIs, and the items requiring executive attention across Day 0, Day 1 and Day 2.",
  represents:
    "The internal governance operating model for the Citrix Healthcare Operating Model engagement: three governance tiers, seven forums, a RACI across thirteen functions, a risk and issue register, a decision register, ten governance KPIs, an executive attention list, a forward meeting calendar and an activity log.",
  whyItMatters:
    "Every commercial figure elsewhere in the module depends on a decision someone is authorised to make. If a material assumption is applied without approval, if a high risk has no owner, or if a gate is passed without evidence, the model may be internally consistent and still commercially unsafe. This page is where authority, ownership and evidence are made explicit before commitments are given.",
  moduleConnection:
    "Governance receives context from Program, Assumptions, Scenarios, Portfolio, the financial pages, Release & Activation, Timelines and Staffing. It records decision rights, forums, RACI, risks, issues, decisions, escalations, approvals, gates and performance. It feeds approved assumptions, release decisions, program and staffing changes, commercial decisions, executive updates and the Overview.",
  questionsAnswered: [
    "Who is authorised to decide this, and at which tier?",
    "Who owns the work, and who is accountable for the outcome?",
    "Which risks and issues are open, and how severe are they?",
    "Which decisions are overdue or require attention?",
    "Which forum should act, and when does it next meet?",
    "What is blocking the next phase gate?",
    "What requires executive attention this cycle?",
    "Is governance actually operating effectively, or only meeting?",
  ],
  expectedOutcome:
    "Every material risk and decision has a named owner, an explicit due date, a routed forum and recorded rationale — and the downstream Commercial Module pages reflect what was decided.",
  lifecycleStages: [
    "Opportunity Qualification",
    "Financial Modeling",
    "Commercial Structuring",
    "Executive Review",
    "Negotiation",
    "Mobilization",
    "Operations",
    "Continuous Improvement",
  ],
  prerequisites: [
    { id: "pre-1", label: "Defined governance tiers", detail: "Three tiers are established: Executive Steering Committee (Executive authority), Program Management Office (Program authority) and Delivery and Operations Pods (Operational authority)." },
    { id: "pre-2", label: "Defined decision rights", detail: "Each tier carries a stated decision authority and escalation path; the tier drawer shows responsibilities, participants and cadence." },
    { id: "pre-3", label: "Named forum chairs", detail: "All seven forums have a named chair, cadence, participants and a next meeting date." },
    { id: "pre-4", label: "RACI", detail: "Thirteen functions are mapped across seven governance groups using R, A, C and I." },
    { id: "pre-5", label: "Program gates", route: "/commercial/program-timeline", detail: "Day 0, Day 1 and Day 2 readiness percentages act as the phase-gate view on this page." },
    { id: "pre-6", label: "Risks and issues", detail: "The register distinguishes Risk from Issue and carries severity, owner, status, impact, mitigation and due date." },
    { id: "pre-7", label: "Decisions", detail: "The decision register carries type, owner, forum, due date, status and impact." },
    { id: "pre-8", label: "Named owners", detail: "Every risk and decision on the page has an owner; unowned items should not be recorded." },
    { id: "pre-9", label: "Explicit due dates", detail: "All open risks and decisions carry a dated deadline, not a relative one." },
    { id: "pre-10", label: "Evidence", detail: "Rationale and outcome fields exist on decisions, and mitigation notes on risks, to hold the evidence behind a status." },
  ],
  ownership: {
    businessOwner: "Program Director / Governance Lead",
    commercialOwner: "Commercial Lead",
    technicalOwner: "PMO Lead",
    executiveApprover: "Executive Sponsor",
    primaryUsers: ["Executive Sponsor", "Deal Lead", "Program Director", "PMO", "Commercial Lead", "Finance", "Delivery Leadership", "RunOps Leadership", "Customer Success", "Functional owners"],
    consumersOfOutput: ["Overview", "Assumptions & Change Sets", "Release & Activation", "Program", "Staffing & Resources", "Timelines", "Executive reporting"],
  },

  /* ---------------- How it works ---------------- */
  sections: [
    {
      id: "sec-summary",
      title: "Governance header and context",
      explanation:
        "The header names the page, the internal governance framework supporting Day 0, Day 1 and Day 2 operations, and the engagement context. It carries a view switch (executive and other governance views), an Export menu including 'Copy Executive Update', a notifications count of high open risks plus decisions marked Attention Required, and a reset that restores the initial mock data. An 'Unsaved local changes' badge appears once anything on the page has been edited.",
      targetId: "governance-summary",
    },
    {
      id: "sec-health",
      title: "Governance health summary",
      explanation:
        "Five cards summarise the cycle: Overall Governance Health (On Track, 92%), Active Workstreams (8, all with assigned owners), Open Decisions (5, of which 2 require leadership attention), Open Risks (3 — 1 High and 2 Medium) and Next Governance Meeting (June 24, 2026, Executive Steering Committee). Each card is a button that scrolls to the section it summarises, so health is always read against the underlying register rather than in isolation.",
      targetId: "governance-health",
    },
    {
      id: "sec-tiers",
      title: "Governance tiers and decision rights",
      explanation:
        "Three tiers with distinct authority. Tier 1, the Executive Steering Committee, meets monthly and holds Executive authority over strategy, commercial approvals, funding, risk acceptance and major scope change. Tier 2, the Programme Management Office, meets weekly with Program authority over the integrated plan, risks, decisions, dependencies, change control and reporting. Tier 3, Delivery and Operations Pods, operates daily and weekly with Operational authority. Opening a tier shows responsibilities, participants, escalation path, open actions and the related risks and decisions.",
      targetId: "governance-tiers",
    },
    {
      id: "sec-phases",
      title: "Day 0, Day 1 and Day 2 operational focus",
      explanation:
        "Three phase cards with objective, outcome, owner, target period and a readiness percentage derived from the activity checklist. Day 0 (Build and Transition, Transition Lead, Jun–Sep 2026) sits at 78% and In Progress; Day 1 (Operate and Stabilize, Service Delivery Manager, Oct 2026–Mar 2027) at 65% and Planned; Day 2 (Optimize and Evolve, RunOps Practice Leader, Apr 2027 onward) at 35% as a future phase. Ticking an activity recalculates readiness immediately — that percentage is the page's gate signal.",
      targetId: "governance-operational-focus",
    },
    {
      id: "sec-forums",
      title: "Governance forums",
      explanation:
        "Seven forums with purpose, participants, cadence, next meeting, chair, tier, open actions and agenda: Executive Steering Committee (monthly, Executive Sponsor), Program Management Office (weekly, Program Director), Technical Advisory Board (biweekly, Chief Architect), RunOps and SRE Council (weekly, RunOps Lead), Change Advisory Board (weekly, Change Manager), Commercial Governance Council (biweekly, Commercial Leader) and Customer Success Council (monthly, Customer Success Lead). Actions can be added and meetings requested; both are prototype-local.",
      targetId: "governance-forums",
    },
    {
      id: "sec-raci",
      title: "RACI snapshot",
      explanation:
        "Thirteen functions — from Strategy and Governance through Commercial Management, Service Transition, Incident and Problem Management, to Risk Management and Value Realization — mapped across seven groups: Executive Steering Committee, PMO, Delivery Pods, RunOps & SRE, Customer Success, Commercial and Finance & Legal. R is Responsible (does the work), A is Accountable (answers for the outcome), C is Consulted and I is Informed. Commercial Management sits R with Commercial and A with the Executive Steering Committee — that is the commercial approval path.",
      targetId: "governance-raci",
    },
    {
      id: "sec-risks",
      title: "Risks and issues register",
      explanation:
        "One register holds both Risks (something that may happen) and Issues (something already happening), each with severity, owner, status, impact, mitigation and due date. The seeded set: delayed customer access (High, PMO, due July 10), resource constraints during build (Medium, Delivery Lead, Monitoring), slow tooling and automation adoption (Issue, Medium, RunOps Lead), commercial operating assumptions not fully approved (High, Commercial Lead, due July 31) and L3 escalation clarification (Issue, Medium, Technical Advisory Board). Items can be added, edited, noted, closed or escalated locally.",
      targetId: "governance-risks",
    },
    {
      id: "sec-decisions",
      title: "Decision register",
      explanation:
        "Five decisions with type, owner, forum, due date, status and impact: commercial framework approval (Citrix Executives, Executive Steering Committee, July 31, In Progress), Neurealm operating model approval (August 15, Planned), RunOps tooling selection (July 15, Planned), L3 escalation model approval (July 20, In Progress) and activation staffing plan (Delivery Executive, PMO, July 25, Attention Required). The drawer carries impact and a rationale or outcome field — the evidence that makes a decision complete.",
      targetId: "governance-decisions",
    },
    {
      id: "sec-kpis",
      title: "Governance KPIs",
      explanation:
        "Ten metrics with target, current value, status, trend, owner and a six-point history: forum attendance-style governance metrics alongside outcome metrics. Decisions Made On Time is 88% against ≥90% and declining; Action Closure On Time is 84% against >90% and declining; Automation Adoption is 42% against >60%; Day 0 Readiness is 78% against 100%. Risks with Active Mitigation, Critical Incidents Open, Customer Satisfaction, Change Success Rate and SLA Attainment are on track. Read the declining closure and timeliness metrics as the honest health signal.",
      targetId: "governance-kpis",
    },
    {
      id: "sec-attention",
      title: "Executive attention",
      explanation:
        "The prioritised list for leadership this cycle: commercial framework approval required by July 31 (High), customer access required before build validation can begin (High), activation staffing not yet fully approved (Medium), automation adoption below the Day 1 target (Medium) and decision timeliness below the governance target (Medium). The panel also composes the executive update — open risks and their High count, open decisions and how many need attention, Day 0 readiness and forum open-action totals — which can be copied to the clipboard.",
      targetId: "governance-executive-attention",
    },
    {
      id: "sec-calendar",
      title: "Governance calendar",
      explanation:
        "Seven scheduled meetings in date order from June 17 to June 26, 2026, each showing the forum, tier, chair, purpose, participants and agenda, together with the open decisions and open risks linked to it. Opening a meeting shows the agenda and lets an agenda item be added or a reschedule drafted. Use it to route each open item to the next forum that can actually close it.",
      targetId: "governance-calendar",
    },
    {
      id: "sec-activity",
      title: "Governance activity feed",
      explanation:
        "A chronological log of governance actions with timestamp, actor, action, related item and category — readiness updates, decision status moves, risk escalations, assignments and change approvals. In this prototype it records the current session's local activity; it is the page's audit trail surface, not a persisted system of record.",
      targetId: "governance-activity",
    },
  ],
  inputs: [
    { id: "in-1", label: "Governance tiers", description: "Three tiers with cadence, decision authority and escalation path.", owner: "Program Director", source: "Governance operating model", required: true },
    { id: "in-2", label: "Decision rights", description: "Executive, Program and Operational authority levels attached to each tier.", owner: "Executive Sponsor", source: "Governance operating model", required: true },
    { id: "in-3", label: "Forum definitions", description: "Seven forums with purpose, chair, participants, cadence and agenda.", owner: "PMO Lead", source: "Forum charter", required: true },
    { id: "in-4", label: "RACI", description: "Thirteen functions mapped across seven governance groups.", owner: "PMO Lead", source: "RACI snapshot", required: true },
    { id: "in-5", label: "Risks and issues", description: "Severity, owner, status, impact, mitigation and due date for each entry.", owner: "PMO", source: "Risk and issue register", required: true },
    { id: "in-6", label: "Decisions", description: "Type, owner, forum, due date, status and impact for each decision.", owner: "Program Director", source: "Decision register", required: true },
    { id: "in-7", label: "Phase readiness", description: "Day 0, Day 1 and Day 2 activity checklists that compute readiness percentages.", owner: "Transition Lead", source: "Operational phase cards", required: true },
    { id: "in-8", label: "Governance KPIs", description: "Ten metrics with target, current, status, trend, owner and history.", owner: "PMO", source: "KPI table", required: true },
    { id: "in-9", label: "Meeting schedule", description: "Dated forum meetings with agenda and linked open items.", owner: "PMO", source: "Governance calendar", required: true },
    { id: "in-10", label: "Executive attention items", description: "Severity-ranked items surfaced for leadership this cycle.", owner: "Program Director", source: "Executive attention panel" },
    { id: "in-11", label: "Commercial context", description: "Model, scenario and financial context that gives governance items their impact.", owner: "Commercial Lead", source: "Commercial Module pages" },
    { id: "in-12", label: "Approval evidence", description: "Rationale and outcome recorded against a decision; mitigation notes against a risk.", owner: "Decision owner", source: "Detail drawers" },
  ],
  outputs: [
    { id: "out-1", label: "Decision record", description: "A decision with owner, forum, due date, status, impact and recorded rationale.", consumedBy: ["Assumptions & Change Sets", "Release & Activation", "Executive reporting"] },
    { id: "out-2", label: "Risk record", description: "A risk with severity, owner, mitigation, due date and status.", consumedBy: ["Program", "Executive reporting"] },
    { id: "out-3", label: "Issue record", description: "An already-materialised problem tracked in the same register, distinguished by type.", consumedBy: ["Delivery", "RunOps"] },
    { id: "out-4", label: "Approval", description: "A decision moved to Approved by the authorised forum.", consumedBy: ["Assumptions & Change Sets", "Release & Activation", "Staffing & Resources"] },
    { id: "out-5", label: "RACI", description: "Confirmed Responsible and Accountable assignment per function.", consumedBy: ["Program", "Delivery", "RunOps"] },
    { id: "out-6", label: "Forum schedule", description: "The dated calendar of forums, their agendas and the items routed to each.", consumedBy: ["All governance participants"] },
    { id: "out-7", label: "Gate decision", description: "Day 0, Day 1 or Day 2 readiness judged sufficient to proceed, with the checklist as evidence.", consumedBy: ["Program", "Timelines", "Release & Activation"] },
    { id: "out-8", label: "Executive escalation", description: "An item raised to the Executive Steering Committee, with risk escalation also raising severity to High.", consumedBy: ["Executive Sponsor", "Executive Steering Committee"] },
    { id: "out-9", label: "Governance KPI", description: "Ten metrics against target with trend and owner.", consumedBy: ["Overview", "Executive reporting"] },
    { id: "out-10", label: "Action register", description: "Open actions per forum and per tier, plus the actions attached to each meeting.", consumedBy: ["PMO", "Forum chairs"] },
  ],
  businessRules: [
    { id: "br-1", rule: "Every material risk and decision has a named owner.", explanation: "The registers carry an owner column for a reason: an item without a named individual or named body has no one to progress it. A High risk with no owner is a governance failure, not a tracking gap." },
    { id: "br-2", rule: "Due dates must be explicit.", explanation: "Every open risk and decision on this page carries a dated deadline — July 10, July 15, July 20, July 25, July 31, August 15. 'Soon' or 'next cycle' is not a due date and cannot be measured against the Decisions Made On Time KPI." },
    { id: "br-3", rule: "Approval authority must match the governance model.", explanation: "Executive approvals, funding and risk acceptance sit with Tier 1. Program-level control sits with Tier 2. Operational decisions sit with Tier 3. Routing a decision to a forum that lacks the authority to approve it produces discussion, not a decision." },
    { id: "br-4", rule: "Responsible and Accountable are not interchangeable.", explanation: "R does the work; A answers for the outcome and is the approval point. In the RACI, Commercial is R for Commercial Management while the Executive Steering Committee is A — the work and the approval sit in different places by design." },
    { id: "br-5", rule: "A meeting is not a decision.", explanation: "The calendar shows that a forum met and what was on the agenda. Only the decision register, with a status and recorded rationale, evidences that something was decided. Attendance never substitutes for a decision record." },
    { id: "br-6", rule: "Decisions retain rationale and evidence.", explanation: "The decision drawer holds impact and a rationale or outcome field. A decision moved to Approved without that content is incomplete and cannot be defended later or relied on downstream." },
    { id: "br-7", rule: "Material assumption changes follow the correct approval path.", explanation: "Commercial assumptions are changed through a governed change set in Assumptions & Change Sets, approved via the Commercial Governance Council and, where material, the Executive Steering Committee. Nothing on this page edits the model." },
    { id: "br-8", rule: "Risks carry mitigation and status.", explanation: "Every register entry has a mitigation and a status of Open, Monitoring, In Progress, Escalated or Closed. A risk with severity but no mitigation is an unmanaged exposure — this is what the Risks with Active Mitigation KPI measures." },
    { id: "br-9", rule: "Closed items retain history.", explanation: "Closing a risk sets its status to Closed; the impact, mitigation, notes and due date remain readable, and the activity feed retains the action. History is never deleted to make a report look cleaner." },
    { id: "br-10", rule: "Gate progression requires evidence.", explanation: "Day 0 readiness is 78% because twelve of fifteen activities are complete. Readiness is computed from the checklist, so a gate claim must be supported by the ticked activities, not asserted." },
    { id: "br-11", rule: "No self-approval where segregation of duties applies.", explanation: "The owner of a decision and its approving forum are separate: the activation staffing plan is owned by the Delivery Executive but routed to the PMO, and the commercial framework is owned by Citrix Executives and approved at the Executive Steering Committee." },
    { id: "br-12", rule: "Governance status reflects open items, not attendance.", explanation: "Overall health of 92% must be read against 5 open decisions, 3 open risks including 1 High, and the declining Decisions Made On Time and Action Closure On Time metrics. Forums meeting on cadence while items age is a warning state, not a healthy one." },
    { id: "br-13", rule: "Executive attention is threshold-based.", explanation: "The attention panel carries five items ranked High and Medium, tied to material commercial and operational impact. Escalating everything degrades the signal; the escalate action exists for items that genuinely need Tier 1 authority." },
  ],
  calculationLogic: [
    "Phase readiness = completed activities divided by total activities for that phase, expressed as a whole percentage; ticking an activity recalculates it immediately.",
    "Notification count = High-severity risks that are not Closed, plus decisions with status Attention Required.",
    "Executive update open risks = all risks whose status is not Closed, with the High-severity subset counted separately.",
    "Executive update open decisions = all decisions whose status is not Approved, with Attention Required and Escalated counted as needing leadership attention.",
    "Forum open actions total = the sum of open actions across all seven forums; adding an action increments that forum's count.",
    "Escalating a risk sets its status to Escalated and raises its severity to High.",
    "Escalating a decision sets its status to Escalated; approving sets it to Approved.",
    "Closing a risk sets its status to Closed while retaining impact, mitigation, notes and due date.",
    "A KPI edit stamps the current time into the KPI's updated-at field.",
    "Any edit sets the local-changes flag, shown as the 'Unsaved local changes' badge; reset restores the initial mock data.",
  ],
  relationship: {
    receivesFrom: [
      "Program",
      "Assumptions & Change Sets",
      "Scenarios",
      "Portfolio",
      "Revenue, P&L and Cash",
      "Release & Activation",
      "Timelines",
      "Staffing & Resources",
      "Risks and issues raised by delivery and operations",
    ],
    models: [
      "Decision rights by governance tier",
      "Forum cadence, chair and agenda",
      "RACI across functions and groups",
      "Risk and issue register",
      "Decision register and escalations",
      "Approval routing",
      "Day 0, Day 1 and Day 2 phase gates",
      "Governance and service performance KPIs",
    ],
    feeds: [
      "Approved assumptions",
      "Release decisions",
      "Program changes",
      "Staffing decisions",
      "Commercial decisions",
      "Executive updates",
      "Overview",
    ],
  },
  downstreamImpacts: [
    { area: "Governance", effect: "This page is the record of authority, ownership and evidence for the engagement." },
    { area: "Revenue", effect: "Commercial framework approval gates the commercial operating model and mobilisation funding." },
    { area: "Cash", effect: "A delayed funding decision pushes mobilisation spend ahead of committed funding." },
    { area: "Staffing", effect: "The activation staffing plan decision determines when pods can be resourced." },
    { area: "Timeline", effect: "Day 0 readiness and gate evidence set when transition can proceed to Day 1." },
    { area: "Risk", effect: "Escalated risks become executive agenda items and can trigger risk acceptance at Tier 1." },
    { area: "Activation", effect: "Activation and release readiness depend on gate decisions recorded here." },
    { area: "Customer outcomes", effect: "Customer Success Council actions and value-realization tracking flow from this governance cycle." },
  ],
  dataQuality: {
    dataSources: [
      "Governance operating model (three tiers, decision authority, escalation paths)",
      "Forum charters (chair, cadence, participants, agenda)",
      "RACI snapshot (13 functions, 7 groups)",
      "Risk and issue register",
      "Decision register",
      "Operational phase checklists for Day 0, Day 1 and Day 2",
      "Governance KPI set with six-period history",
      "Governance meeting calendar",
    ],
    updateFrequency: "Per governance cycle — weekly for Tier 2 and Tier 3 forums, monthly for the Executive Steering Committee; KPIs and readiness are refreshed as activities and actions close.",
    knownGaps: [
      "This page is a prototype: all state is local and in-memory, and nothing persists or writes to the backend.",
      "Export options other than 'Copy Executive Update' produce a prototype confirmation only.",
      "Scheduling and rescheduling a meeting drafts a request in the prototype; no calendar system is integrated.",
      "There is no formal gate approval record — readiness percentages stand in for gate evidence.",
      "Decision rationale and evidence are free-text; no document attachment or approval signature is captured.",
      "The activity feed is session-local and is not a durable audit log.",
      "Risks and decisions are not linked to specific model runs, change sets or release certifications on this page.",
      "No automatic overdue flag is derived from due dates; status must be maintained manually.",
      "There is no segregation-of-duties enforcement in the prototype; the separation is a governance rule, not a control.",
    ],
    changeControl: "Governance content is maintained by the PMO and Program Director. Commercial assumption changes are made only through governed change sets in Assumptions & Change Sets; model activation only through Release & Activation.",
    lineage: "Each risk and decision carries an owner, a forum, a due date and a status, and the activity feed records who changed what during the session.",
  },
  roles: [
    { role: "Executive Sponsor", responsibility: "Chairs the Executive Steering Committee and holds executive approval, funding and risk-acceptance authority." },
    { role: "Deal Lead", responsibility: "Owns commercial commitments and ensures they carry decision authority." },
    { role: "Program Director", responsibility: "Chairs the PMO forum, owns governance operation, escalation and the integrated plan." },
    { role: "PMO", responsibility: "Maintains the risk, issue, decision and action registers, and governance reporting." },
    { role: "Commercial Lead", responsibility: "Chairs the Commercial Governance Council and owns commercial assumptions and margin protection." },
    { role: "Finance", responsibility: "Validates funding, margin and financial impact behind governance decisions." },
    { role: "Delivery Leadership", responsibility: "Owns solution delivery and service transition execution and their operational risks." },
    { role: "RunOps Leadership", responsibility: "Chairs the RunOps and SRE Council and owns operational performance and reliability." },
    { role: "Customer Success", responsibility: "Owns customer health, adoption and value realization tracking." },
    { role: "Functional owners", responsibility: "Own the workstream-level actions, mitigations and evidence behind each register entry." },
  ],
  raci: [
    { activity: "Set governance structure and decision rights", assignments: [{ role: "Executive", raci: "A" }, { role: "Administrator", raci: "R" }, { role: "Commercial Lead", raci: "C" }, { role: "Delivery", raci: "I" }, { role: "Operations", raci: "I" }, { role: "Finance", raci: "I" }] },
    { activity: "Maintain the risk and issue register", assignments: [{ role: "Administrator", raci: "R" }, { role: "Executive", raci: "A" }, { role: "Delivery", raci: "C" }, { role: "Operations", raci: "C" }, { role: "Commercial Lead", raci: "C" }, { role: "Finance", raci: "I" }] },
    { activity: "Maintain the decision register and rationale", assignments: [{ role: "Administrator", raci: "R" }, { role: "Executive", raci: "A" }, { role: "Commercial Lead", raci: "C" }, { role: "Finance", raci: "C" }, { role: "Delivery", raci: "I" }, { role: "Operations", raci: "I" }] },
    { activity: "Approve commercial assumptions and framework", assignments: [{ role: "Commercial Lead", raci: "R" }, { role: "Executive", raci: "A" }, { role: "Finance", raci: "C" }, { role: "Delivery", raci: "I" }, { role: "Operations", raci: "I" }] },
    { activity: "Confirm phase-gate readiness evidence", assignments: [{ role: "Delivery", raci: "R" }, { role: "Administrator", raci: "A" }, { role: "Operations", raci: "R" }, { role: "Executive", raci: "I" }, { role: "Commercial Lead", raci: "I" }] },
    { activity: "Escalate material items to Tier 1", assignments: [{ role: "Administrator", raci: "R" }, { role: "Executive", raci: "A" }, { role: "Commercial Lead", raci: "C" }, { role: "Delivery", raci: "C" }, { role: "Operations", raci: "C" }] },
    { activity: "Report governance KPIs and executive update", assignments: [{ role: "Administrator", raci: "R" }, { role: "Executive", raci: "A" }, { role: "Operations", raci: "C" }, { role: "Finance", raci: "I" }, { role: "Commercial Lead", raci: "I" }] },
  ],
  reviewRequirements: [
    "Governance health reviewed against the open registers, not attendance.",
    "Upcoming forums reviewed so each open item has a route to closure.",
    "Overdue actions and declining KPIs reviewed each cycle.",
    "High risks reviewed with owner, mitigation and due date confirmed.",
    "Open decisions reviewed for authority, due date and evidence.",
    "Phase readiness reviewed against the activity checklist before any gate claim.",
    "Executive attention list reviewed for materiality before escalation.",
  ],
  approvalRequirements: [
    "Executive approvals, funding and risk acceptance at the Executive Steering Committee (Tier 1).",
    "Commercial assumptions and margin decisions at the Commercial Governance Council, escalated to Tier 1 when material.",
    "Program, plan and change-control decisions at the PMO (Tier 2).",
    "Technical and escalation-model decisions at the Technical Advisory Board.",
    "Change and release decisions at the Change Advisory Board.",
    "Decision owner and approving forum must be separate where segregation of duties applies.",
  ],
  decisions: [
    { id: "dec-1", decision: "Whether to approve the commercial framework.", decidedBy: "Executive Steering Committee", evidence: "Commercial approval pack, margin review and the assumption change sets behind it." },
    { id: "dec-2", decision: "Whether to approve the Neurealm operating model.", decidedBy: "Executive Steering Committee", evidence: "Tier responsibilities, decision authority and RACI confirmation." },
    { id: "dec-3", decision: "Whether Day 0 readiness is sufficient to proceed.", decidedBy: "Program Director with the Transition Lead", evidence: "Day 0 activity checklist and the readiness percentage derived from it." },
    { id: "dec-4", decision: "Whether to accept, escalate or mitigate a High risk.", decidedBy: "Executive Steering Committee", evidence: "Risk impact, mitigation, owner, due date and mitigation notes." },
    { id: "dec-5", decision: "Whether to approve the activation staffing plan.", decidedBy: "PMO with the Delivery Executive", evidence: "Staffing forecast, funding position and Day 0 and Day 1 execution needs." },
  ],
  whatToDoNext: [
    "Open the Overview to see how governance status is reported to leadership.",
    "Open Assumptions & Change Sets to route an approved assumption change.",
    "Open Release & Activation to confirm what a governance decision releases.",
    "Open Staffing & Resources to act on the activation staffing decision.",
    "Open Timelines to align gate decisions with program dates.",
    "Open Cash to quantify the funding effect of a delayed approval.",
  ],
  relatedPages: [
    { pageId: "commercial-overview", label: "Overview", route: "/commercial", relationship: "Downstream" },
    { pageId: "commercial-program", label: "Program", route: "/commercial/program", relationship: "Upstream" },
    { pageId: "commercial-assumptions", label: "Assumptions & Change Sets", route: "/commercial/model/assumptions", relationship: "Companion" },
    { pageId: "commercial-scenarios", label: "Scenarios", route: "/commercial/scenarios", relationship: "Upstream" },
    { pageId: "commercial-pnl", label: "P&L (Cost & EBITDA)", route: "/commercial/model/pnl", relationship: "Upstream" },
    { pageId: "commercial-cash", label: "Cash & Sustainability", route: "/commercial/model/cash", relationship: "Upstream" },
    { pageId: "commercial-compare", label: "Scenario Comparison", route: "/commercial/model/compare", relationship: "Upstream" },
  ],

  /* ---------------- Interpretation & training ---------------- */
  interpretation: [
    {
      band: "healthy",
      label: "Governance is operating",
      criteria: [
        "Roles are clear and every function has a single Accountable group in the RACI.",
        "Forums operate at the right cadence with named chairs and published agendas.",
        "Every open risk carries a mitigation, an owner and a dated deadline.",
        "Decisions are made by their due date at the forum with the authority to make them.",
        "Phase readiness is supported by a completed activity checklist.",
        "Downstream Commercial Module pages reflect what was decided.",
      ],
      action: "Continue the cycle, publish the executive update and keep routing new items to the correct forum.",
    },
    {
      band: "warning",
      label: "Governance needs intervention",
      criteria: [
        "Actions are overdue and Action Closure On Time is declining.",
        "Decision ownership is unclear or the routed forum lacks authority.",
        "Risk mitigation is weak, generic or unowned.",
        "Forums meet on cadence but items remain open cycle after cycle.",
        "RACI conflicts exist, or a function has more than one Accountable group.",
        "A commercial approval is pending close to its deadline.",
      ],
      action: "Reassign owners, tighten due dates, escalate the blocked items to the next scheduled forum and record the decision the same day.",
    },
    {
      band: "critical",
      label: "Governance has failed on this item",
      criteria: [
        "A material assumption has been applied to the model without approval.",
        "A phase gate has been passed without checklist evidence.",
        "A High risk has no named owner.",
        "A binding commitment has been given without decision authority.",
        "A recorded governance decision is not reflected in the model or downstream pages.",
        "A critical escalation is not visible on the executive attention list.",
      ],
      action: "Stop external commitment on that item, escalate to the Executive Steering Committee, reconstruct the approval path with evidence, and correct the model through a governed change set.",
    },
  ],
  commonMistakes: [
    { id: "cm-1", description: "Treating discussion at a forum as approval.", correction: "A meeting record is not a decision record. Move the decision status explicitly and record the rationale and impact in the decision drawer." },
    { id: "cm-2", description: "Confusing Responsible with Accountable.", correction: "R does the work, A answers for the outcome and holds the approval. Read the RACI row before routing an item — the approver is the A, not the R." },
    { id: "cm-3", description: "Closing a risk without evidence.", correction: "Add a mitigation note that states what changed and why the exposure is gone, then close. Status alone is not evidence, and closed items keep their history." },
    { id: "cm-4", description: "Recording status without impact.", correction: "Every register entry has an impact field. 'In Progress' tells leadership nothing; the impact statement is what makes the item actionable." },
    { id: "cm-5", description: "Failing to update the model after a decision.", correction: "An approved assumption change must be applied through Assumptions & Change Sets and the model re-run. A decision that never reaches the model is not implemented." },
    { id: "cm-6", description: "Using meeting attendance as governance health.", correction: "Read Decisions Made On Time (88%), Action Closure On Time (84%) and the open registers. Cadence is an input to health, not the measure of it." },
    { id: "cm-7", description: "Assigning multiple Accountable roles to one function.", correction: "One A per function. Where two groups both hold approval, split the function or escalate the boundary to the Executive Steering Committee for a decision on decision rights." },
    { id: "cm-8", description: "Escalating everything to the executive tier.", correction: "Escalate on materiality thresholds. Tier 3 and Tier 2 exist to close operational and program items; Tier 1 time is for funding, risk acceptance, commercial approval and major scope." },
  ],
  bestPractices: [
    "Read governance health against the open registers before quoting it.",
    "Confirm owner and due date on every item before the forum closes.",
    "Route each item to the forum with the authority to close it.",
    "Record rationale and impact at the moment of decision, not afterwards.",
    "Keep one Accountable group per function in the RACI.",
    "Tie every gate claim to the completed activity checklist.",
    "Update the affected Commercial Module page the same cycle a decision is made.",
    "Reserve executive attention for material commercial and operational impact.",
  ],
  workedExamples: [
    {
      id: "we-1",
      title: "Commercial framework approval slips past July 31",
      narrative:
        "The commercial framework approval is owned by Citrix Executives, routed to the Executive Steering Committee and due July 31, 2026. Its stated impact is that it enables mobilisation funding and the commercial operating model, and the matching risk — commercial operating assumptions not fully approved — is High and owned by the Commercial Lead. If the Executive Steering Committee on June 24 does not close it and the date slips, the consequences propagate rather than stay local: mobilisation funding is not released, so staffing approval stalls; the activation staffing plan, already Attention Required and due July 25, cannot be confirmed; the pod ramp is delayed, which moves Day 0 activities and pushes readiness below the 78% currently reported; the program schedule and activation date slip; release readiness cannot be certified against an unapproved framework; revenue recognition shifts later while mobilisation costs continue to be incurred; the Year-1 cash trough deepens and payback moves out. The item therefore belongs on the executive attention list at High severity, is prepared at the Commercial Governance Council on June 22 with the commercial approval pack, and must produce a decision record at the Executive Steering Committee on June 24 with rationale, impact and the funding envelope attached — not simply a note that it was discussed.",
      steps: [
        "Confirm the decision owner, forum and July 31 due date in the decision register.",
        "Confirm the paired High risk has a named owner and a live mitigation.",
        "Prepare the approval pack at the Commercial Governance Council on June 22.",
        "Route the decision to the Executive Steering Committee on June 24 with the funding envelope.",
        "Record the decision, its rationale and its impact in the decision register.",
        "Apply any resulting assumption change through a governed change set and re-run the model.",
        "Update Staffing, Timelines, Release and Cash to reflect the approved position.",
        "If it slips again, escalate at High severity and record the funding, schedule and cash exposure.",
      ],
      result:
        "Either an approved framework with recorded rationale that unblocks funding, staffing and activation, or an explicit, evidenced escalation quantifying the delay's effect on schedule, revenue timing and the cash trough.",
    },
  ],
  faqs: [
    { id: "faq-1", question: "What is the difference between a risk and an issue?", answer: "A risk is something that may happen and can still be prevented — delayed customer access, for example, is carried as a High risk with a July 10 mitigation date. An issue is already happening and must be resolved — slow tooling and automation adoption is typed as an Issue. Both live in the same register with severity, owner, mitigation, due date and status; only the type differs." },
    { id: "faq-2", question: "What is the difference between Responsible and Accountable?", answer: "Responsible does the work. Accountable answers for the outcome and is the single approval point. In the RACI, Commercial is R for Commercial Management while the Executive Steering Committee is A. There can be several Responsible parties; there should be exactly one Accountable group per function." },
    { id: "faq-3", question: "Which forum approves a commercial assumption?", answer: "The Commercial Governance Council, chaired by the Commercial Leader and meeting biweekly, handles assumption change sets, margin and rate review and contract obligations. Where the change is material — funding, commercial framework, major scope — it escalates to the Executive Steering Committee, which holds commercial approval authority." },
    { id: "faq-4", question: "What makes a decision complete?", answer: "A named owner, the forum with authority to approve it, an explicit due date, a status that has actually been moved, a stated impact and recorded rationale or outcome. A decision without rationale cannot be defended later, and a decision not reflected downstream has not been implemented." },
    { id: "faq-5", question: "How does Governance affect the model?", answer: "Indirectly and deliberately. Nothing on this page edits a figure. Governance approves the assumption changes that are then applied in Assumptions & Change Sets and re-run, approves model activation through Release & Activation, and approves staffing and funding positions that the model reflects." },
    { id: "faq-6", question: "What is a gate decision?", answer: "A judgement that a phase is ready to proceed. Here the evidence is the Day 0, Day 1 or Day 2 activity checklist and the readiness percentage computed from it — Day 0 is 78% with twelve of fifteen activities complete. Progression without that evidence is a governance failure." },
    { id: "faq-7", question: "When should an item be escalated?", answer: "When it exceeds the authority of the current tier, when it is material to funding, commercial commitment, risk acceptance or major scope, or when it is blocked past its due date. Escalating a risk here also raises its severity to High, so use thresholds rather than escalating everything." },
    { id: "faq-8", question: "Who updates downstream pages?", answer: "The owner named on the decision, supported by the PMO. Governance records the decision; the Commercial Lead, Finance, Staffing Lead or Model Administrator applies it on the relevant page. The decision is not closed until that has happened." },
  ],
  glossary: [
    { term: "Governance", definition: "The structure of tiers, forums, decision rights and evidence through which the engagement is directed and controlled." },
    { term: "Forum", definition: "A standing body with a chair, cadence, participants, agenda and defined authority. Seven operate here across the three tiers." },
    { term: "RACI", definition: "Responsible, Accountable, Consulted, Informed — the assignment of work and approval rights across thirteen functions and seven governance groups." },
    { term: "Risk", definition: "Something that may happen, carried with severity, owner, impact, mitigation, due date and status." },
    { term: "Issue", definition: "Something already happening, tracked in the same register with type Issue and requiring resolution rather than prevention." },
    { term: "Decision", definition: "A recorded choice with type, owner, forum, due date, status, impact and rationale." },
    { term: "Escalation", definition: "Raising an item to a higher tier for authority or resolution; escalating a risk here also sets its severity to High." },
    { term: "Gate", definition: "A readiness checkpoint between Day 0, Day 1 and Day 2, evidenced by the phase activity checklist and its readiness percentage." },
    { term: "Mitigation", definition: "The specific action reducing a risk's likelihood or impact, with an owner and a date." },
    { term: "Decision Evidence", definition: "The rationale, impact and supporting material retained against a decision so it can be defended and audited later." },
  ],
  executiveTakeaway:
    "Governance reports On Track at 92% with eight owned workstreams, five open decisions of which two need leadership attention, and three open risks including one High. The real signal sits in the trend: Decisions Made On Time is 88% and declining, Action Closure On Time is 84% and declining, and the commercial framework approval due July 31 gates mobilisation funding, activation staffing, Day 0 readiness and the cash position behind them. Forums are meeting on cadence; the question for leadership is whether they are closing items.",
  keyRisks: [
    "The commercial framework is not approved by July 31, stalling funding, staffing and activation.",
    "Customer access is not secured, blocking build validation and transition readiness.",
    "A material assumption reaches the model without the correct approval path.",
    "A phase gate is claimed without checklist evidence.",
    "Declining decision timeliness and action closure erode governance credibility.",
    "Automation adoption at 42% against a >60% target undermines Day 1 efficiency.",
    "Escalation is used indiscriminately, burying the material items in the executive view.",
    "Decisions are recorded but never applied to the downstream Commercial Module pages.",
  ],

  /* ---------------- Show on page ---------------- */
  showOnPageTargets: [
    { targetId: "governance-summary", label: "Governance header and context", description: "Page title, engagement context, view switch, export, notifications and local-changes badge." },
    { targetId: "governance-health", label: "Governance health summary", description: "Five summary cards: health, workstreams, open decisions, open risks and next meeting." },
    { targetId: "governance-tiers", label: "Governance tiers", description: "Three-tier operating model with decision authority, cadence and escalation paths." },
    { targetId: "governance-operational-focus", label: "Day 0, Day 1 and Day 2 focus", description: "Phase objectives, activity checklists and computed readiness." },
    { targetId: "governance-forums", label: "Governance forums", description: "Seven forums with chair, cadence, next meeting, agenda and open actions." },
    { targetId: "governance-raci", label: "RACI snapshot", description: "Decision rights and accountability across functions and governance groups." },
    { targetId: "governance-risks", label: "Risks and issues", description: "Register with severity, owner, status, impact, mitigation and due date." },
    { targetId: "governance-decisions", label: "Decision register", description: "Decisions with type, owner, forum, due date, status, impact and rationale." },
    { targetId: "governance-kpis", label: "Governance KPIs", description: "Ten metrics against target with trend, owner and history." },
    { targetId: "governance-executive-attention", label: "Executive attention", description: "Priority items for leadership and the composed executive update." },
    { targetId: "governance-calendar", label: "Governance calendar", description: "Scheduled forums with agendas and the open items linked to each." },
    { targetId: "governance-activity", label: "Governance activity feed", description: "Chronological log of governance actions for this session." },
  ],
};
