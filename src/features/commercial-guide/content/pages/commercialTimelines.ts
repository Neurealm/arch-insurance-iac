import type { CommercialGuideContent } from "../../types";

/**
 * CDT-COMMERCIAL-GUIDE-TIMELINES
 *
 * Content is authored strictly from what `CommercialProgramTimeline.tsx` and
 * `src/data/programTimelineMockData.ts` actually render. No schedule, activity,
 * milestone, risk or mock value is changed by this guide.
 */
export const commercialTimelinesGuide: CommercialGuideContent = {
  pageId: "commercial-program-timeline",
  route: "/commercial/program-timeline",
  match: "exact",
  pageTitle: "Timelines",
  guideTitle: "Timelines — Internal Readiness Behind the Customer Schedule",
  audiences: ["Delivery", "Operations", "Commercial Lead", "Executive", "Administrator"],
  modes: ["executive", "practitioner", "administrator"],
  estimatedReadingMinutes: 12,
  trainingLevel: "Intermediate",
  lastUpdated: "2026-07-31",

  /* ---------------- Overview ---------------- */
  purpose:
    "Timelines is Neurealm's internal governance, staffing, transition and operating-readiness schedule supporting Day 0, Day 1 and Day 2. It shows what Neurealm must complete internally — governance approvals, tooling and access, enablement and certification, support activation, service transition and operational acceptance — so that the customer-facing dates on the Program page can actually be met.",
  represents:
    "A prototype integrated schedule for the Citrix + Neurealm Healthcare Operating Model Engagement, running June 1 to December 31, 2026 with a mock today of June 17, 2026. It renders 20 activities across four lanes (Neurealm Deliverables, Customer Activities, Commercial and Governance, Operational Readiness), 9 dependencies, 7 milestones, 3 schedule risks and 6 simulated insights.",
  whyItMatters:
    "Customer dates are promises; internal readiness is what makes them keepable. Go-live on December 15 is gated by UAT sign-off and Operational Acceptance, and Operational Acceptance is gated by tooling, enablement, support activation and transition readiness — all internal Neurealm work. If the readiness lane slips quietly, the deal schedule, the staffing ramp and the cash timing all become wrong at the same time.",
  moduleConnection:
    "Program sets the deal and customer schedule and the phase structure. Timelines shows the internal work that stands behind those dates: the Commercial and Governance lane carries approvals feeding Assumptions and Scenarios, the Operational Readiness lane carries the Day 0 path feeding Governance and Staffing & Resources, and slipped internal dates change activation timing on Cash and staffing cost phasing on P&L. Overview reads the resulting confidence.",
  questionsAnswered: [
    "Is Neurealm internally ready for the dates the customer has been given?",
    "Which Day 0 readiness activities are incomplete right now?",
    "When does Day 1 operational coverage begin, and what must precede it?",
    "What must happen before handoff to steady-state operations?",
    "Are staffing, enablement and tooling aligned to the same dates?",
    "Which governance forums and approvals occur when?",
    "What is delaying operational acceptance?",
    "When can Day 2 optimization legitimately begin?",
  ],
  expectedOutcome:
    "You can state internal readiness by lane, name the incomplete Day 0 items and their owners, confirm whether Day 1 coverage will exist at go-live, and identify which internal slip needs to be reflected in the customer schedule, cost timing and governance escalation.",
  lifecycleStages: [
    "Delivery Planning",
    "Mobilization",
    "Execution",
    "Operations",
    "Continuous Improvement",
  ],
  prerequisites: [
    { id: "pre-1", label: "Program schedule", route: "/commercial/program", detail: "The customer-facing phase plan and deal dates this internal schedule must support." },
    { id: "pre-2", label: "Governance cadence", route: "/commercial/neurealm-governance", detail: "Forums, chairs and decision rights that approve gates and escalate slips." },
    { id: "pre-3", label: "Staffing plan", route: "/commercial/staffing", detail: "Role coverage and ramp dates behind the enablement and support activities." },
    { id: "pre-4", label: "Transition plan", detail: "Knowledge transfer and readiness verification scope behind Service Transition Readiness." },
    { id: "pre-5", label: "Operational-readiness requirements", detail: "The acceptance checklist for support, monitoring, runbooks and transition." },
    { id: "pre-6", label: "Tooling access", detail: "Tooling licences, monitoring and operational access — a customer-owned dependency here (Citrix IT)." },
    { id: "pre-7", label: "Certification and training", detail: "Neurealm CoE certification tracks defining role readiness." },
    { id: "pre-8", label: "Support model", detail: "Runbooks and escalation paths activated by RunOps Leadership." },
    { id: "pre-9", label: "Acceptance criteria", detail: "The evidence required for UAT sign-off and Operational Acceptance." },
  ],
  ownership: {
    businessOwner: "Program Director",
    commercialOwner: "PMO",
    technicalOwner: "RunOps Lead",
    executiveApprover: "Delivery Executive",
    primaryUsers: [
      "Program Director",
      "PMO",
      "Delivery Lead",
      "RunOps Lead",
      "SRE Lead",
      "Transition Lead",
      "Staffing Lead",
      "Governance Lead",
      "Customer Success Lead",
      "Executive Sponsor",
    ],
    consumersOfOutput: ["Governance", "Staffing & Resources", "Program", "Cash & Sustainability", "Overview"],
  },

  /* ---------------- How it works ---------------- */
  sections: [
    {
      id: "sec-context",
      title: "Page context and controls",
      explanation:
        "The header names the engagement, shows the mock today of June 17, 2026, and offers Today, Export and View. Export and view switching are prototype actions. An 'Unsaved local changes' badge appears once you edit anything, because nothing on this page persists.",
      targetId: "timelines-context",
    },
    {
      id: "sec-summary",
      title: "Timeline summary",
      explanation:
        "Four cards: Program Duration (approximately 6 months, June to December 2026), Target Go-Live (December 15, 2026, On Track), Stakeholder Model (Citrix + Neurealm, jointly governed) and Key Milestones (7). Selecting a card opens its detail and can filter the lanes it focuses on.",
      targetId: "timelines-summary",
    },
    {
      id: "sec-controls",
      title: "View, zoom and filters",
      explanation:
        "Switch view (timeline, customer, deliverables, readiness, milestones), change zoom, filter by lane, owner, status or category, and toggle at-risk only, customer-owned only, critical-path only and dependency connectors. Filters change what you see, never the schedule.",
      targetId: "timelines-controls",
    },
    {
      id: "sec-integrated",
      title: "Integrated timeline",
      explanation:
        "The Gantt workspace: four collapsible lanes, activity bars coloured by category, milestone markers, dependency connectors and a today line. Selecting a bar opens the activity drawer with owner, status, progress, customer obligations, commercial implications and notes.",
      targetId: "timelines-integrated",
    },
    {
      id: "sec-lane-deliverables",
      title: "Neurealm deliverables lane",
      explanation:
        "The five sequential Neurealm phases: Discovery & Planning (in progress, 35%), Solution Design, Build & Configuration, Testing & Validation and Deployment & Transition. All five are on the critical path and each finishes before the next starts.",
      targetId: "timelines-lane-deliverables",
    },
    {
      id: "sec-lane-customer",
      title: "Customer activities lane",
      explanation:
        "Customer-owned work: Stakeholder Alignment (45%), Data & Access Readiness, UAT & Feedback, Change Management and Go-Live Readiness. Customer-owned activities are roughly 30% of scheduled effort, so these dates are commitments Neurealm depends on but does not control.",
      targetId: "timelines-lane-customer",
    },
    {
      id: "sec-lane-governance",
      title: "Commercial and governance lane",
      explanation:
        "Commercial Terms Alignment (30%), Account and ARR Validation (At Risk, 20%), Governance Model Approval, Funding and Activation Approval and Operating Model Approval. Governance cadence and decision rights are approved here in July, before the heavy execution phases begin.",
      targetId: "timelines-lane-commercial",
    },
    {
      id: "sec-lane-readiness",
      title: "Operational readiness lane — the internal Day 0 path",
      explanation:
        "Tooling and Access Provisioning (Citrix IT, by August 31), Team Enablement and Certification (Neurealm CoE), Support Model Activation (RunOps Leadership), Service Transition Readiness (Transition Lead) and Operational Acceptance (Joint Operations Team, December 1 to 15). This lane is the internal readiness schedule.",
      targetId: "timelines-lane-readiness",
    },
    {
      id: "sec-milestones",
      title: "Key milestones",
      explanation:
        "Seven gates with owner, date, status, dependency and readiness: Kickoff (complete), Commercial Framework Agreed (July 31, 40%), Solution Design Approval (15%), Configuration Complete (5%), UAT Sign-Off (10%), Operational Acceptance (December 10, 5%) and Go-Live (December 15, 0%). Required actions are listed per milestone.",
      targetId: "timelines-milestones",
    },
    {
      id: "sec-upcoming",
      title: "Upcoming milestone",
      explanation:
        "A focus panel for one milestone showing days remaining from the mock today, readiness percentage and required actions, with View Details and a simulated reminder. Featuring a different milestone from the detail dialog changes only this panel.",
      targetId: "timelines-upcoming",
    },
    {
      id: "sec-intelligence",
      title: "Schedule intelligence",
      explanation:
        "A collapsible section with three tabs — Risks, Dependencies and Insights — that reads the schedule rather than adding to it. Use it to convert lane detail into the two or three facts an escalation actually needs.",
      targetId: "timelines-intelligence",
    },
    {
      id: "sec-risks",
      title: "Schedule risks",
      explanation:
        "Three risks with severity, impact, owner and mitigation: ARR data not fully validated (High, Finance + Citrix, complete before July 31), stakeholder introductions incomplete (Medium, Citrix, before July 10) and tooling access possibly unavailable before operational onboarding (Medium, Citrix IT, provision before August 31).",
      targetId: "timelines-risks",
    },
    {
      id: "sec-dependencies",
      title: "Dependencies",
      explanation:
        "Counts for total dependencies, blocked activities, at-risk activities and critical-path items, plus the nine upstream-to-downstream links — including Data & Access required before Build, Tooling required before Support Model Activation, and Operational Acceptance required before Go-Live.",
      targetId: "timelines-dependencies",
    },
    {
      id: "sec-insights",
      title: "Simulated insights",
      explanation:
        "Six rule-generated statements, each badged Simulated: the December 15 go-live holds if commercial approval completes by July 31; ARR validation is the most material near-term risk; UAT and operational acceptance form the final critical path; customer-owned work is about 30% of effort.",
      targetId: "timelines-insights",
    },
    {
      id: "sec-legend",
      title: "Legend and data provenance",
      explanation:
        "Category colour keys plus the provenance footer: last updated June 17, 2026 at 10:30 AM, illustrative prototype data only, and an explicit statement that timelines and statuses shown are simulated and do not represent committed contractual dates.",
      targetId: "timelines-legend",
    },
  ],

  inputs: [
    { id: "in-1", label: "Program schedule", description: "Phase structure and customer-facing dates the internal plan must support.", owner: "Program Director", source: "Program", required: true },
    { id: "in-2", label: "Governance cadence", description: "Forums, chairs and decision rights that approve gates.", owner: "Governance Lead", source: "Governance", required: true },
    { id: "in-3", label: "Staffing plan", description: "Role coverage and ramp dates behind enablement and support.", owner: "Staffing Lead", source: "Staffing & Resources", required: true },
    { id: "in-4", label: "Transition plan", description: "Knowledge transfer and readiness verification scope.", owner: "Transition Lead", required: true },
    { id: "in-5", label: "Operational-readiness requirements", description: "Acceptance checklist for support, monitoring, runbooks and transition.", owner: "RunOps Lead", required: true },
    { id: "in-6", label: "Tooling and access plan", description: "Licences, monitoring and operational access — customer-owned (Citrix IT).", owner: "Citrix IT", required: true },
    { id: "in-7", label: "Certification and training tracks", description: "CoE-defined role readiness requirements.", owner: "Neurealm CoE" },
    { id: "in-8", label: "Support model", description: "Runbooks, escalation paths and coverage design.", owner: "RunOps Leadership" },
    { id: "in-9", label: "Acceptance criteria", description: "Evidence and defect thresholds for UAT and operational acceptance.", owner: "Joint Operations Team", required: true },
    { id: "in-10", label: "Commercial approvals", description: "Commercial terms, funding and activation approvals that release delivery capacity.", owner: "Executive Sponsors", source: "Commercial and Governance lane" },
  ],
  outputs: [
    { id: "out-1", label: "Internal readiness schedule", description: "Dated internal activities with owner, status and progress by lane.", consumedBy: ["Governance", "Program"] },
    { id: "out-2", label: "Day 0 status", description: "Completion state of pre-operational readiness work: tooling, enablement, support activation and transition.", consumedBy: ["Governance", "Executive Sponsor"] },
    { id: "out-3", label: "Day 1 start readiness", description: "Whether operational coverage will exist at cutover, evidenced by Operational Acceptance and Go-Live Readiness.", consumedBy: ["RunOps", "Program"] },
    { id: "out-4", label: "Day 2 transition", description: "The point at which optimization work can begin without masking stabilization issues.", consumedBy: ["RunOps", "Customer Success"] },
    { id: "out-5", label: "Governance cadence view", description: "When approval activities occur relative to execution phases.", consumedBy: ["Governance"] },
    { id: "out-6", label: "Operational acceptance position", description: "Readiness percentage, required actions and dependency state for the December 10 gate.", consumedBy: ["Governance", "Program"] },
    { id: "out-7", label: "Internal schedule risks", description: "Three registered risks with severity, impact, owner and mitigation date.", consumedBy: ["Governance", "Overview"] },
    { id: "out-8", label: "Required staffing and tooling actions", description: "The specific actions that unblock readiness activities.", consumedBy: ["Staffing & Resources"] },
    { id: "out-9", label: "Milestone required actions", description: "Named actions per gate, such as confirming architecture reviewers or publishing the runbook certification plan.", consumedBy: ["PMO"] },
    { id: "out-10", label: "Critical-path and blocked counts", description: "Dependency statistics used to size escalation.", consumedBy: ["PMO", "Executive Sponsor"] },
  ],

  businessRules: [
    { id: "br-1", rule: "Day 1 must not begin without required Day 0 readiness", explanation: "Operational Acceptance is a required predecessor of Go-Live in the dependency set. Starting live operations without accepted support, monitoring, runbooks and transition moves risk from the program to the customer's production environment." },
    { id: "br-2", rule: "Operational acceptance requires evidence", explanation: "Acceptance is a formal sign-off by the Joint Operations Team covering support, monitoring, runbooks and service transition. A percentage or an assertion is not evidence; the completed checklist and sign-off are." },
    { id: "br-3", rule: "Staffing dates must align with role readiness", explanation: "Team Enablement and Certification runs August 1 to September 15 and supports the staffing model assumed in the P&L. A person scheduled is not a person ready; readiness is certification against the assigned role." },
    { id: "br-4", rule: "Tooling and access must precede operational responsibility", explanation: "Tooling and Access Provisioning is a required predecessor of Support Model Activation. Teams cannot hold operational accountability for systems they cannot see, monitor or act on." },
    { id: "br-5", rule: "Training and certification must align with assigned roles", explanation: "Certification tracks are defined by the Neurealm CoE per role. Generic completion does not confer role readiness for support, SRE or transition duties." },
    { id: "br-6", rule: "Governance cadence must begin before major execution", explanation: "Governance Model Approval completes in July, before Build begins in August. Approving decision rights after execution starts leaves change control undefined during the highest-cost phase." },
    { id: "br-7", rule: "Internal changes affecting the customer schedule must update the Program page", explanation: "This page is internal. If an internal slip moves a customer-visible date, the deal schedule is now wrong until the Program page and the customer commitment are updated." },
    { id: "br-8", rule: "Staffing changes affecting cost must update P&L and Cash", explanation: "Ramp timing drives cost phasing and cash outflow timing. Moving enablement or support activation without updating financial timing produces a plan whose money and people disagree." },
    { id: "br-9", rule: "Day 2 optimization must not mask unresolved Day 1 stability issues", explanation: "Optimization consumes the same people who stabilise the service. Starting it while incidents are unresolved hides instability behind improvement metrics." },
    { id: "br-10", rule: "Milestone completion must reflect actual evidence", explanation: "Marking a milestone complete sets readiness to 100 and clears it from the register. Without evidence, the register stops representing reality and downstream confidence becomes false." },
    { id: "br-11", rule: "Customer-owned readiness items remain schedule risks", explanation: "Tooling access and data access are owned by Citrix and Citrix IT. Neurealm cannot close them unilaterally, so they must be tracked as dependencies with escalation dates, not as internal tasks." },
    { id: "br-12", rule: "Critical-path activities are escalated, not re-planned locally", explanation: "Sixteen of the twenty activities sit on the critical path or feed it. A slip on any of them consumes program float, which is a governance decision rather than a lane-level adjustment." },
    { id: "br-13", rule: "Nothing on this page is a contractual commitment", explanation: "The legend states explicitly that timelines and statuses are simulated and do not represent committed contractual dates. Contractual dates live in the agreement, not in this prototype." },
  ],
  calculationLogic: [
    "Activity bars are positioned by start and end date against a fixed June 1 to December 31, 2026 track; zoom changes track width only.",
    "The today line is drawn from the mock today of June 17, 2026; Today re-centres the scroll position without changing data.",
    "Days remaining on the upcoming milestone panel is the difference between the mock today and the milestone date.",
    "Lane counts are the number of filtered activities in each group; collapsing a lane hides rows without excluding them from counts.",
    "Blocked activities are dependencies whose upstream activity is At Risk; at-risk and critical-path counts are simple filters over the activity set.",
    "Marking an activity complete sets status to Completed and progress to 100 in local state only.",
    "Marking a milestone complete sets status to Completed and readiness to 100 in local state only.",
    "Insights are prototype rules over the mock data and are badged Simulated; they are not derived from live program data.",
  ],
  relationship: {
    receivesFrom: [
      "Program",
      "Governance",
      "Staffing & Resources",
      "Release & Activation",
      "Delivery plan",
      "Support model",
      "Tooling plan",
      "Commercial approvals",
    ],
    models: [
      "Internal readiness",
      "Governance cadence",
      "Staffing mobilization",
      "Service transition",
      "Day 0 activities",
      "Day 1 stabilization",
      "Day 2 optimization",
      "Internal dependencies",
    ],
    feeds: [
      "Program schedule confidence",
      "Staffing actions",
      "Cost timing",
      "Governance",
      "Operational acceptance",
      "Overview",
    ],
  },
  downstreamImpacts: [
    { area: "Timeline", effect: "Internal slips consume float on the December 15 go-live and change the customer-facing schedule." },
    { area: "Staffing", effect: "Enablement and certification dates determine when roles become deployable, not just filled." },
    { area: "Costs", effect: "Ramp and support activation timing phases delivery cost across the plan." },
    { area: "Cash", effect: "Activation and go-live timing shift when outflows start and when steady-state billing begins." },
    { area: "Activation", effect: "Funding and Activation Approval releases delivery capacity; delay compresses every downstream phase." },
    { area: "Governance", effect: "Unclosed readiness items become forum agenda items and escalation candidates." },
    { area: "Risk", effect: "Blocked dependencies convert directly into registered schedule risks with owners and dates." },
    { area: "Customer outcomes", effect: "Weak Day 0 readiness produces unstable Day 1 support and slower adoption." },
  ],
  dataQuality: {
    dataSources: [
      "programTimelineMockData.ts — 20 activities, 4 lanes, 9 dependencies, 7 milestones, 3 risks, 6 insights",
      "Mock today: June 17, 2026",
      "Last updated: June 17, 2026 at 10:30 AM",
    ],
    updateFrequency: "Static prototype data; local edits are lost on reload.",
    knownGaps: [
      "No explicit Day 0, Day 1 or Day 2 sections exist; the internal readiness path is read from the Operational Readiness lane and the acceptance milestones.",
      "No early-life support window, hypercare period or stabilization exit criteria are modelled.",
      "No separate governance cadence calendar is rendered here; forums and cadence live on the Governance page.",
      "No staffing counts, role coverage or FTE data appear on this page; they live on Staffing & Resources.",
      "No training completion or certification percentage is tracked — enablement is a single activity bar.",
      "No evidence attachments, sign-off records or acceptance checklist items are stored.",
      "No baseline versus actual variance, no float calculation and no schedule change history.",
      "Export, reminders and milestone editing are simulated; nothing persists and no backend is called.",
      "Insights are prototype rules, explicitly badged Simulated, not analysis of live data.",
    ],
    changeControl:
      "Read-only against any system of record. All interactions mutate local React state only and are reset by the toolbar Reset action or a page reload.",
    lineage: "Static module import; no query, no run manifest, no persistence layer.",
  },
  modelConfidence: "Medium",
  confidenceBasis: ["Timing", "Governance approvals", "Staffing assumptions", "Source completeness"],
  confidenceGuidance:
    "Confidence is reasonable on structure — the lane model, dependency chain and gate sequence reflect how the engagement is intended to run. It is low on status: this is prototype data with a fixed mock today, readiness percentages carry no evidence, and progress values are illustrative. Treat the sequence and dependencies as instructive, and confirm every date and percentage with its named owner before acting.",
  commercialReadiness: "Review Required",
  readinessCriteria: [
    "Every readiness activity has a named owner and a dated deadline.",
    "Tooling and access provisioning is confirmed complete before support model activation starts.",
    "Certification is complete for each role holding operational accountability.",
    "Operational acceptance criteria and evidence requirements are agreed and written down.",
    "Day 1 coverage, escalation paths and runbooks are confirmed before cutover.",
    "Internal date changes have been reflected on Program, and cost effects on P&L and Cash.",
    "Registered risks have live mitigations with dates that precede the activity they protect.",
  ],

  /* ---------------- How to use it ---------------- */
  workflow: [
    { id: "wf-1", step: 1, title: "Confirm alignment to the program schedule", description: "Compare the lane dates and go-live gate against the customer-facing plan on the Program page before reading anything else.", role: "Program Director" },
    { id: "wf-2", step: 2, title: "Review Day 0 readiness activities", description: "Filter to the Operational Readiness lane and read tooling, enablement, support activation, transition readiness and operational acceptance.", role: "RunOps Lead" },
    { id: "wf-3", step: 3, title: "Confirm staffing and role coverage", description: "Check that enablement and certification dates align with the roles named in the staffing plan.", role: "Staffing Lead" },
    { id: "wf-4", step: 4, title: "Confirm tooling and access", description: "Verify provisioning completes before August 31 and before Support Model Activation begins on September 1.", role: "SRE Lead" },
    { id: "wf-5", step: 5, title: "Confirm training and documentation", description: "Confirm certification tracks and runbooks exist for every role that will hold operational responsibility.", role: "Delivery Lead" },
    { id: "wf-6", step: 6, title: "Review transition and acceptance", description: "Read Service Transition Readiness and the December 10 Operational Acceptance gate, including its required actions.", role: "Transition Lead" },
    { id: "wf-7", step: 7, title: "Review Day 1 support readiness", description: "Confirm coverage, escalation paths and runbook certification will be in place at cutover, not shortly after it.", role: "RunOps Lead" },
    { id: "wf-8", step: 8, title: "Review Day 2 prerequisites", description: "Confirm stabilization exit conditions before any optimization work is scheduled or resourced.", role: "RunOps Lead" },
    { id: "wf-9", step: 9, title: "Review dependencies and risks", description: "Open Schedule Intelligence and read blocked activities, critical-path counts and the three registered risks.", role: "PMO" },
    { id: "wf-10", step: 10, title: "Escalate conflicts", description: "Route any readiness item that cannot be closed by its owner to the forum with authority over it.", role: "Governance Lead" },
    { id: "wf-11", step: 11, title: "Update connected pages", description: "Reflect customer-visible date changes on Program, and staffing or cost effects on P&L and Cash.", role: "Commercial Lead" },
    { id: "wf-12", step: 12, title: "Record evidence for closed items", description: "Keep the acceptance evidence and sign-off behind every completed readiness item and milestone.", role: "PMO" },
  ],
  actionsAvailable: [
    "Switch view between timeline, customer, deliverables, readiness and milestones.",
    "Change zoom and jump the track to today.",
    "Filter by lane, owner, status, category, at-risk only, customer-owned only, critical-path only or milestones only.",
    "Toggle dependency connectors and critical-path highlighting.",
    "Collapse or expand any lane.",
    "Open an activity to read owner, progress, customer obligations, commercial implications and notes.",
    "Update or complete an activity locally (prototype only).",
    "Open a milestone for detail, feature it in the upcoming panel, or mark it complete locally.",
    "Send a simulated milestone reminder.",
    "Expand Schedule Intelligence and read risks, dependencies and simulated insights.",
    "Export the timeline, milestones, executive summary or snapshot (prototype only).",
    "Enter full screen, or reset all mock data to the prototype baseline.",
  ],
  teamActivities: [
    { id: "ta-1", activity: "Review internal readiness against the customer schedule", role: "Program Director", cadence: "Weekly" },
    { id: "ta-2", activity: "Maintain activity status, dependencies and required actions", role: "PMO", cadence: "Weekly" },
    { id: "ta-3", activity: "Confirm delivery phase progress and hand-offs between phases", role: "Delivery Lead", cadence: "Weekly" },
    { id: "ta-4", activity: "Track tooling, monitoring and access provisioning", role: "SRE Lead", cadence: "Weekly" },
    { id: "ta-5", activity: "Drive support model activation, runbooks and escalation paths", role: "RunOps Lead", cadence: "Weekly" },
    { id: "ta-6", activity: "Run knowledge transfer and readiness verification", role: "Transition Lead", cadence: "Weekly" },
    { id: "ta-7", activity: "Align enablement and certification with role assignments", role: "Staffing Lead", cadence: "Biweekly" },
    { id: "ta-8", activity: "Escalate readiness blockers into the governance forums", role: "Governance Lead", cadence: "Biweekly" },
    { id: "ta-9", activity: "Confirm adoption and change readiness with the customer", role: "Customer Success Lead", cadence: "Monthly" },
    { id: "ta-10", activity: "Review go-live confidence and approve gate progression", role: "Executive Sponsor", cadence: "Monthly" },
  ],
  roles: [
    { role: "Program Director", responsibility: "Owns internal readiness overall and the alignment between this schedule and the customer plan." },
    { role: "PMO", responsibility: "Owns schedule accuracy, dependencies, required actions and escalation packaging." },
    { role: "Delivery Lead", responsibility: "Owns the Neurealm deliverables lane and phase-to-phase hand-offs." },
    { role: "RunOps Lead", responsibility: "Owns support model activation, runbooks, escalation paths and Day 1 coverage." },
    { role: "SRE Lead", responsibility: "Owns tooling, monitoring and operational access readiness." },
    { role: "Transition Lead", responsibility: "Owns service transition readiness, knowledge transfer and acceptance preparation." },
    { role: "Staffing Lead", responsibility: "Owns role coverage, enablement and certification alignment to dates." },
    { role: "Governance Lead", responsibility: "Owns cadence, decision rights and escalation routing for readiness blockers." },
    { role: "Customer Success Lead", responsibility: "Owns adoption readiness and the customer-side view of transition." },
    { role: "Executive Sponsor", responsibility: "Approves gate progression and arbitrates when readiness and dates conflict." },
    { role: "Delivery Executive", responsibility: "Executive approver for operational acceptance and go-live readiness." },
  ],
  raci: [
    {
      activity: "Maintain the internal readiness schedule",
      assignments: [
        { role: "PMO", raci: "R" },
        { role: "Program Director", raci: "A" },
        { role: "Delivery Lead", raci: "C" },
        { role: "Executive Sponsor", raci: "I" },
      ],
    },
    {
      activity: "Confirm tooling and access readiness",
      assignments: [
        { role: "SRE Lead", raci: "R" },
        { role: "RunOps Lead", raci: "A" },
        { role: "PMO", raci: "C" },
        { role: "Program Director", raci: "I" },
      ],
    },
    {
      activity: "Confirm enablement and certification",
      assignments: [
        { role: "Staffing Lead", raci: "R" },
        { role: "Delivery Lead", raci: "A" },
        { role: "RunOps Lead", raci: "C" },
        { role: "PMO", raci: "I" },
      ],
    },
    {
      activity: "Achieve operational acceptance",
      assignments: [
        { role: "Transition Lead", raci: "R" },
        { role: "Delivery Executive", raci: "A" },
        { role: "RunOps Lead", raci: "C" },
        { role: "Customer Success Lead", raci: "I" },
      ],
    },
    {
      activity: "Escalate internal schedule conflicts",
      assignments: [
        { role: "Program Director", raci: "R" },
        { role: "Executive Sponsor", raci: "A" },
        { role: "Governance Lead", raci: "C" },
        { role: "PMO", raci: "I" },
      ],
    },
  ],
  reviewRequirements: [
    "Weekly review of the Operational Readiness lane with named owners.",
    "Weekly review of blocked dependencies and critical-path activities.",
    "Review of every customer-owned readiness dependency against its escalation date.",
    "Review of milestone required actions before each gate date.",
    "Confirmation that internal changes have been reflected on Program, P&L and Cash.",
  ],
  approvalRequirements: [
    "Governance Model Approval before major execution begins.",
    "Funding and Activation Approval before delivery capacity is released.",
    "UAT Sign-Off before go-live readiness is confirmed.",
    "Operational Acceptance sign-off by the Joint Operations Team before go-live.",
    "Executive approval for any change to the go-live date.",
  ],
  decisions: [
    { id: "dec-1", decision: "Is Neurealm internally ready to support the committed go-live date?", decidedBy: "Program Director", evidence: "Readiness lane status, dependency state, registered risks" },
    { id: "dec-2", decision: "Can Day 1 operational coverage begin?", decidedBy: "RunOps Lead", evidence: "Support model activation, runbooks, escalation paths, tooling access" },
    { id: "dec-3", decision: "Is operational acceptance achieved?", decidedBy: "Delivery Executive", evidence: "Acceptance checklist and Joint Operations Team sign-off" },
    { id: "dec-4", decision: "Should Day 2 optimization begin?", decidedBy: "RunOps Lead", evidence: "Stabilization exit criteria and open incident position" },
    { id: "dec-5", decision: "Does an internal slip require the customer schedule to move?", decidedBy: "Executive Sponsor", evidence: "Critical-path impact and float consumed" },
  ],
  whatToDoNext: [
    "Confirm tooling and access provisioning will complete before August 31.",
    "Confirm certification tracks are published and mapped to named roles.",
    "Agree the operational acceptance evidence list before the December 10 gate.",
    "Escalate the High-severity ARR validation risk into the commercial forum.",
    "Reflect any internal date change on Program, then on P&L and Cash.",
  ],
  relatedPages: [
    { pageId: "commercial-program", label: "Program", route: "/commercial/program", relationship: "Upstream" },
    { pageId: "commercial-governance", label: "Governance", route: "/commercial/neurealm-governance", relationship: "Companion" },
    { pageId: "commercial-staffing", label: "Staffing & Resources", route: "/commercial/staffing", relationship: "Companion" },
    { pageId: "commercial-pnl", label: "P&L, Cost & EBITDA", route: "/commercial/model/pnl", relationship: "Downstream" },
    { pageId: "commercial-cash", label: "Cash & Sustainability", route: "/commercial/model/cash", relationship: "Downstream" },
    { pageId: "commercial-overview", label: "Overview", route: "/commercial/overview", relationship: "Downstream" },
  ],

  /* ---------------- Interpretation & training ---------------- */
  interpretation: [
    {
      band: "healthy",
      label: "Internally ready",
      criteria: [
        "Day 0 prerequisites are complete with evidence.",
        "Every operational role is staffed and certified.",
        "Tooling, monitoring and access are provisioned and verified.",
        "Acceptance criteria are explicit and agreed.",
        "Day 1 coverage and escalation paths are stable.",
        "Day 2 optimization begins only after stabilization.",
      ],
      action: "Hold the plan, keep evidence current and continue weekly readiness review.",
    },
    {
      band: "warning",
      label: "Readiness at risk",
      criteria: [
        "Training or certification is incomplete for assigned roles.",
        "Tooling or access provisioning is running late.",
        "Critical roles remain open close to their ramp date.",
        "Internal dates now lag the customer schedule.",
        "Acceptance evidence is partial or undocumented.",
      ],
      action: "Assign owners and dates to each gap, escalate customer-owned items, and re-test the go-live date against remaining float.",
    },
    {
      band: "critical",
      label: "Not ready",
      criteria: [
        "Operations are due to begin without readiness in place.",
        "No escalation path exists for live issues.",
        "Day 1 coverage is inadequate for the committed service.",
        "An internal delay is not reflected in the deal schedule.",
        "Day 2 work has started while critical Day 1 issues remain open.",
      ],
      action: "Escalate to the Executive Sponsor immediately, pause the affected gate, and update the customer schedule and financial timing before proceeding.",
    },
  ],
  commonMistakes: [
    { id: "cm-1", description: "Treating this page as the customer schedule. It is the internal readiness view; the deal and customer plan lives on Program.", correction: "Read Program for customer commitments and Timelines for whether Neurealm can meet them." },
    { id: "cm-2", description: "Treating scheduled staffing as available staffing. A role with a start date is not a certified, tooled, accountable operator.", correction: "Confirm role coverage, certification and access together before claiming readiness." },
    { id: "cm-3", description: "Marking readiness complete without evidence, which sets progress to 100 and removes the item from attention.", correction: "Require the acceptance artefact or sign-off before completing any readiness item." },
    { id: "cm-4", description: "Ignoring tooling lead time and assuming access appears when it is needed.", correction: "Track provisioning as a dated, customer-owned dependency with its own escalation point." },
    { id: "cm-5", description: "Starting Day 2 optimization while Day 1 stability issues are still open.", correction: "Define stabilization exit criteria and require them to be met before optimization is resourced." },
    { id: "cm-6", description: "Moving internal dates without updating cost and cash timing.", correction: "Re-phase staffing cost on P&L and outflow timing on Cash whenever ramp or activation moves." },
    { id: "cm-7", description: "Ignoring governance cadence and approving decision rights after execution starts.", correction: "Confirm governance approval lands before the heavy build phases begin." },
    { id: "cm-8", description: "Treating training completion as operational acceptance.", correction: "Acceptance covers support, monitoring, runbooks and transition — training is one input to it, not the gate." },
  ],
  bestPractices: [
    "Read the readiness lane before the deliverables lane; the deliverables are usually visible while readiness is not.",
    "Filter to critical-path only when you need to know what actually moves the go-live date.",
    "Use blocked-dependency counts, not narrative, to size an escalation.",
    "Give every customer-owned readiness item a named Neurealm chaser and an escalation date.",
    "Keep required actions on milestones specific enough that completion is unambiguous.",
    "Re-check the today line before quoting days remaining; the prototype is anchored to June 17, 2026.",
    "Restate readiness percentages as 'evidence held' or 'evidence outstanding' in executive updates.",
  ],
  workedExamples: [
    {
      id: "we-1",
      title: "Tooling access slips past August 31",
      narrative:
        "Tooling and Access Provisioning is owned by Citrix IT and scheduled July 15 to August 31, with a registered Medium risk that access may not be available before operational onboarding. Assume it lands six weeks late, in mid-October. Support Model Activation depends on it and is scheduled September 1 to October 15, so activation cannot start on time: runbooks cannot be validated against live tooling and escalation paths cannot be tested. Team Enablement finishes September 15, so certified staff sit without the access their roles require, and productive ramp begins later than the staffing plan assumes. Service Transition Readiness, running October 15 to November 30, absorbs the compression, which puts the December 10 Operational Acceptance gate at risk. Because Operational Acceptance is a required predecessor of Go-Live, the December 15 date now depends on unproven support readiness. The correct response is not to compress acceptance. It is to escalate the customer-owned dependency, re-plan support activation with the RunOps Lead, restate Day 1 coverage honestly, and reflect the shifted ramp in cost and cash timing.",
      steps: [
        "Confirm the actual provisioning date with Citrix IT and record it against the activity.",
        "Recalculate Support Model Activation start and its effect on transition readiness.",
        "Reassess certified-but-unproductive staffing days and the resulting cost phasing.",
        "Test whether the December 10 Operational Acceptance gate still holds with evidence.",
        "Escalate the dependency into the governance forum with a dated recovery plan.",
        "Update Program if the customer-visible go-live date moves, then update P&L and Cash.",
      ],
      result:
        "Scope does not change and no calculation changes; what changes is confidence. Day 1 coverage becomes the binding constraint, operational acceptance evidence is at risk, staffing productivity is lost without cost being saved, and the go-live commitment must either be re-underwritten with a recovery plan or moved with executive approval.",
    },
  ],
  faqs: [
    { id: "faq-1", question: "How is this different from Program & Timeline?", answer: "Program carries the integrated deal and customer schedule — the phases, commitments and dates the customer sees. Timelines carries Neurealm's internal operational schedule: governance cadence, staffing mobilization, tooling, enablement, transition and the readiness path to Day 0, Day 1 and Day 2. In this build both are rendered on one integrated Gantt, so read the Operational Readiness and Commercial and Governance lanes for internal readiness, and the Customer Activities lane for customer obligations." },
    { id: "faq-2", question: "What is Day 0?", answer: "Day 0 is everything that must be true before live operational responsibility starts: tooling and access provisioned, teams enabled and certified, the support model activated with runbooks and escalation paths, service transition readiness verified, and operational acceptance achieved. On this page, Day 0 is the Operational Readiness lane and the December 10 Operational Acceptance gate." },
    { id: "faq-3", question: "When does Day 1 begin?", answer: "Day 1 begins at cutover, when Neurealm holds live operational responsibility. On this schedule that follows Deployment & Transition and the December 15 Go-Live milestone, and it is gated by Operational Acceptance and Go-Live Readiness. It should not begin while any required Day 0 item is outstanding." },
    { id: "faq-4", question: "What is operational acceptance?", answer: "Formal acceptance by the Joint Operations Team that support, monitoring, runbooks and service transition are in place and fit for live operation. It runs December 1 to 15, has a milestone date of December 10, and is a required predecessor of Go-Live. It requires evidence, not a status claim." },
    { id: "faq-5", question: "Can Day 2 begin before stabilization?", answer: "No. Day 2 is optimization and continuous improvement, and it draws on the same people who stabilise the service. Starting it while critical Day 1 issues remain open hides instability behind improvement activity and delays real resolution. Define stabilization exit criteria and meet them first." },
    { id: "faq-6", question: "Who owns internal readiness?", answer: "The Program Director is accountable overall. The PMO owns schedule accuracy, the RunOps Lead owns support activation and Day 1 coverage, the SRE Lead owns tooling and access, the Transition Lead owns transition and acceptance preparation, and the Staffing Lead owns role coverage and certification. The Delivery Executive approves acceptance." },
    { id: "faq-7", question: "How does staffing affect the timeline?", answer: "Enablement and certification convert assigned people into deployable operators, and Support Model Activation assumes those operators exist. If roles are open or certification slips, support readiness slips with it, transition compresses, and acceptance is at risk. Staffing changes also move cost and cash timing, so they are never schedule-only changes." },
    { id: "faq-8", question: "Which page changes when internal dates move?", answer: "Update Program if a customer-visible date moves, Governance if the item needs escalation or a decision, Staffing & Resources if role or ramp dates change, and P&L and Cash if cost or activation timing changes. Overview then reflects the revised confidence. This page does not push those updates automatically." },
  ],
  glossary: [
    { term: "Day 0", definition: "The readiness state that must exist before live operational responsibility begins: tooling, access, certification, support activation, transition readiness and acceptance." },
    { term: "Day 1", definition: "The first live operating period after cutover, when Neurealm holds operational responsibility and stabilization is the priority." },
    { term: "Day 2", definition: "The optimization and continuous-improvement period that follows a stabilised service." },
    { term: "Operational Readiness", definition: "Verified capability to operate the service: people certified, tooling provisioned, runbooks written and escalation paths tested." },
    { term: "Early-Life Support", definition: "Heightened support coverage immediately after go-live while the service stabilises. Not separately modelled on this prototype page." },
    { term: "Operational Acceptance", definition: "Formal sign-off that support, monitoring, runbooks and service transition are accepted; a required predecessor of Go-Live." },
    { term: "Transition", definition: "The planned movement of service responsibility to steady-state operations, including knowledge transfer and readiness verification." },
    { term: "Stabilization", definition: "The period in which incidents, defects and operating gaps found in live running are resolved to an agreed exit standard." },
    { term: "Governance Cadence", definition: "The rhythm of forums, approvals and decision rights that governs the program; approved here in July, before major execution." },
    { term: "Continuous Improvement", definition: "Ongoing optimization of the operating model after stabilization, measured against agreed service and value outcomes." },
    { term: "Critical Path", definition: "The chain of activities whose slip directly moves the go-live date; highlighted by the critical-path toggle." },
    { term: "Blocked Activity", definition: "A downstream activity whose upstream dependency is At Risk, counted in the Dependencies tab." },
  ],
  executiveTakeaway:
    "Timelines answers one executive question: can Neurealm actually operate this service on the date the customer has been given? The schedule currently supports a December 15 go-live if commercial approval completes by July 31, but go-live is gated by Operational Acceptance, which is gated by tooling access, certification, support activation and transition readiness. Two of those depend on the customer. Treat the readiness lane, not the deliverables lane, as the true measure of confidence, and require evidence before accepting any readiness claim.",
  keyRisks: [
    "Account-level ARR data is not fully validated (High) — could delay commercial model approval past July 31.",
    "Customer access and stakeholder introductions are incomplete (Medium) — reduces discovery quality.",
    "Tooling access may not be available before operational onboarding (Medium) — delays support readiness.",
    "Certification completed without matching tooling access produces staffed but non-operational roles.",
    "Operational acceptance accepted on assertion rather than evidence.",
    "Day 2 optimization started while Day 1 stability issues remain open.",
    "Internal slips not reflected on Program, P&L and Cash, leaving the deal schedule and financial timing wrong.",
    "Prototype data mistaken for committed contractual dates.",
  ],

  /* ---------------- Show on page ---------------- */
  showOnPageTargets: [
    { targetId: "timelines-context", label: "Page context", description: "Engagement, mock today and page-level actions." },
    { targetId: "timelines-summary", label: "Timeline summary", description: "Duration, go-live, stakeholder model and milestone count." },
    { targetId: "timelines-controls", label: "View, zoom and filters", description: "Lane, owner, status and critical-path controls." },
    { targetId: "timelines-integrated", label: "Integrated timeline", description: "Gantt workspace with lanes, milestones and dependencies." },
    { targetId: "timelines-lane-deliverables", label: "Neurealm deliverables lane", description: "The five sequential delivery phases." },
    { targetId: "timelines-lane-customer", label: "Customer activities lane", description: "Customer-owned obligations and dependencies." },
    { targetId: "timelines-lane-commercial", label: "Commercial and governance lane", description: "Approvals, funding activation and governance cadence." },
    { targetId: "timelines-lane-readiness", label: "Operational readiness lane", description: "The internal Day 0 path to operational acceptance." },
    { targetId: "timelines-milestones", label: "Key milestones", description: "Seven gates with owner, date, status and readiness." },
    { targetId: "timelines-upcoming", label: "Upcoming milestone", description: "Focused gate with days remaining and required actions." },
    { targetId: "timelines-intelligence", label: "Schedule intelligence", description: "Risks, dependencies and simulated insights." },
    { targetId: "timelines-risks", label: "Schedule risks", description: "Three registered risks with owner and mitigation date." },
    { targetId: "timelines-dependencies", label: "Dependencies", description: "Nine links plus blocked and critical-path counts." },
    { targetId: "timelines-insights", label: "Simulated insights", description: "Prototype-generated schedule observations." },
    { targetId: "timelines-legend", label: "Legend and provenance", description: "Category keys and the prototype data disclaimer." },
  ],
};
