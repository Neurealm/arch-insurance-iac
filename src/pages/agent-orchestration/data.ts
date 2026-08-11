// Canonical tenant model for the neugain.io Agent Orchestration administration
// plane: workflows, orchestration pipeline stages, the incident remediation
// execution graph, state stores, policy families, tool bindings, handoffs,
// approvals, retry/idempotency engineering, evaluations and run explanation.

export type Health = "Healthy" | "Degraded" | "Error" | "Draft" | "Deprecated" | "Suspended";

/* ------------------------------- principles ------------------------------- */

export const PRINCIPLES = [
  {
    id: "coordinated", title: "Coordinated by Design",
    short: "Orchestrate agents, tools, models, and humans as governed workflows.",
    hover: "Digital coworkers execute within explicit workflow boundaries. Each participant has a role, expected input, output contract, execution authority, and transition rule.",
    detail: [
      "No digital coworker may invoke another digital coworker directly; every transition is a declared workflow edge.",
      "Each node declares an input contract and an output schema that must validate before the transition is allowed.",
      "Execution authority is granted per node, never inherited from the calling agent.",
      "Workflow graphs are versioned artifacts subject to review, simulation, and publication.",
    ],
  },
  {
    id: "state", title: "State-Aware Execution",
    short: "Every workflow carries durable state, checkpoints, and step outputs.",
    hover: "Long-running agentic workflows must survive process failure, model failure, provider outage, tool timeout, or human delay without losing execution context.",
    detail: [
      "Run state is persisted to a durable store on every checkpoint boundary.",
      "Resume replays from the last checkpoint rather than restarting the workflow.",
      "Step outputs are stored as references where they contain regulated or user-sensitive content.",
      "Timers, locks, retry counters, and pending approvals are part of durable state.",
    ],
  },
  {
    id: "handoff", title: "Policy-Governed Handoffs",
    short: "Control sequencing, delegation, approval, and agent-to-agent transfer.",
    hover: "Every transition can enforce policy based on role, confidence, business impact, data classification, execution risk, and autonomy level.",
    detail: [
      "Handoffs declare source role, destination role, input contract, and carried state.",
      "Confidence and evidence thresholds gate agent-to-agent delegation.",
      "Rejection behaviour and escalation paths are mandatory configuration, not defaults.",
      "Privileged execution always terminates at a human or policy gate.",
    ],
  },
  {
    id: "recovery", title: "Resilient Recovery",
    short: "Retries, fallback paths, timeout policies, dead-letter handling, and idempotent recovery.",
    hover: "Execution failure should produce controlled retry, alternate routing, human escalation, or safe termination rather than uncontrolled agent loops.",
    detail: [
      "Retryable and non-retryable error classes are declared per step.",
      "Side-effect steps require an idempotency key before automatic retry is permitted.",
      "Exhausted retries route to escalation or dead-letter, never to silent failure.",
      "Correlation IDs are preserved across every retry and resume.",
    ],
  },
  {
    id: "learning", title: "Observable Learning",
    short: "Execution traces, evaluations, decisions, and outcomes improve future orchestration.",
    hover: "The platform records branch decisions, step quality, retry behavior, human intervention, tool results, and outcome validation for continuous improvement.",
    detail: [
      "Every branch decision records the rule, inputs, and evaluated result.",
      "Human interventions are captured as first-class evaluation signals.",
      "Outcome validation results feed workflow version scoring.",
      "Traces are retained for audit and for regression comparison across versions.",
    ],
  },
];

export const OUTCOMES = [
  {
    id: "success", label: "Workflow Success Rate", value: "98.6%",
    definition: "Percentage of completed orchestration runs achieving the configured completion criteria without unrecovered failure.",
    calculation: "Runs meeting completion policy ÷ runs started (excluding cancelled)",
    target: "98%", result: "98.6% over 7 days", trend: "+0.7pp vs last 7 days",
    contributors: "Vulnerability Triage & Patch Validation (95.9%) is the largest detractor",
    why: "Success rate measures whether governed coordination actually finishes work, not whether individual model calls returned.",
  },
  {
    id: "decision", label: "Median Orchestration Decision", value: "73 ms",
    definition: "Median time required to evaluate next-step routing, policy, branch, handoff, and state conditions.",
    calculation: "p50 of orchestration decision evaluation duration per transition",
    target: "< 120 ms", result: "73 ms (p95 182 ms)", trend: "-6 ms vs last 7 days",
    contributors: "Graph Flow workflows with 4-way parallel joins",
    why: "Orchestration overhead must stay far below model and tool latency or coordination becomes the bottleneck.",
  },
  {
    id: "approval", label: "Human Approval SLA", value: "96.2%",
    definition: "Percentage of approval-required workflow steps completed within configured approval response thresholds.",
    calculation: "Approvals decided within SLA ÷ approvals requested",
    target: "95%", result: "96.2%", trend: "+1.3pp vs last 7 days",
    contributors: "Production Remediation Approval (5 min SLA) accounts for most breaches",
    why: "Approval latency is the dominant contributor to end-to-end runtime for governed execution paths.",
  },
  {
    id: "recover", label: "Recoverable Step Failures", value: "91.4%",
    definition: "Percentage of failed workflow steps automatically recovered through retry, checkpoint resume, alternate agent, or fallback execution path.",
    calculation: "Recovered step failures ÷ total step failures",
    target: "90%", result: "91.4%", trend: "+2.8pp vs last 7 days",
    contributors: "Tool timeouts on Terraform apply and ServiceNow write operations",
    why: "Recovery rate demonstrates that failure produces controlled behaviour rather than abandoned or duplicated work.",
  },
];

/* ------------------------------ contextual help --------------------------- */

export const HELP: Record<string, { what: string; why: string; how: string; controls: string }> = {
  "Orchestrator Type": {
    what: "The execution engine pattern used to advance a workflow: State Machine, Directed Flow, Graph Flow, Planner + Queue, or Decision Workflow.",
    why: "neugain.io must support deterministic regulated processes and bounded dynamic planning in the same control plane.",
    how: "The orchestrator evaluates the current durable state, the declared transitions, and applicable policies to select the next step.",
    controls: "Transition evaluation, parallelism, join semantics, and how much planning freedom the workflow is permitted.",
  },
  "Durable State": {
    what: "Persisted execution state required to continue or resume a workflow after interruption.",
    why: "Agentic workflows run for minutes to days across models, tools and humans; process memory is not a safe execution substrate.",
    how: "State is written to a durable store at checkpoint boundaries and referenced by run ID and correlation ID.",
    controls: "Resume behaviour, retention, replay eligibility, and what may be stored inline versus by reference.",
  },
  Checkpoint: {
    what: "A known recoverable execution point storing sufficient state to safely resume.",
    why: "Resuming from a checkpoint avoids re-executing side-effect-producing operations.",
    how: "Steps declare checkpoint-before and checkpoint-after semantics; the engine persists state and acknowledges the boundary.",
    controls: "Where resume can start, how much work is repeated after failure, and which steps are replay-safe.",
  },
  Idempotency: {
    what: "Guarantee that repeated execution of a step does not create unintended duplicate side effects.",
    why: "Automatic retry of an unguarded side-effect step can duplicate a payment, a ticket, an apply, or a scaling operation.",
    how: "Each side-effect step derives an idempotency key and registers it with the execution gateway for a duplicate detection window.",
    controls: "Whether retry is permitted at all, and whether a replay may be authorized.",
  },
  Handoff: {
    what: "Controlled transfer of work and state from one participant to another.",
    why: "Uncontrolled agent-to-agent invocation removes policy, audit, and authority boundaries.",
    how: "The source declares an output contract; the destination declares required input, confidence, and authorization.",
    controls: "Who may receive work, what evidence travels with it, and what happens on rejection or timeout.",
  },
  "Fallback Path": {
    what: "Alternate agent, tool, route, or execution path used when the preferred path is unavailable or invalid.",
    why: "A single unavailable coworker, model, or tool must not strand a governed workflow.",
    how: "Fallbacks are ordered and each is independently policy-evaluated before use.",
    controls: "Degraded-mode behaviour and whether the run continues, escalates, or terminates safely.",
  },
  "Approval Gate": {
    what: "A workflow point requiring explicitly authorized human or policy approval before execution continues.",
    why: "Production and high-risk actions require accountable human authority.",
    how: "The gate presents proposed action, impact, risk, evidence, rollback, and validation plan to an authorized role.",
    controls: "Who can approve, the SLA, timeout behaviour, and whether escalation or termination follows.",
  },
  "Branch Rule": {
    what: "A declarative condition that selects the next transition from the current state.",
    why: "Branch selection must be reconstructable and reviewable rather than emergent from model output.",
    how: "Rules evaluate step result, confidence, validation, policy status, and risk class in declared order.",
    controls: "Continue, retry, human review, alternate agent, escalate, or stop.",
  },
  "Dead Letter Queue": {
    what: "A durable holding queue for workflow steps that could not be completed or recovered.",
    why: "Failures must be inspectable and replayable rather than discarded.",
    how: "Exhausted retries and non-retryable failures write the run state, error class, and correlation ID to the queue.",
    controls: "Operator triage, authorized replay, and permanent termination of stuck work.",
  },
  "Correlation ID": {
    what: "A stable identifier joining every step, retry, handoff, tool call, and approval within a run.",
    why: "Traceability across agents, tools, and humans depends on one identifier surviving all recovery paths.",
    how: "Assigned at trigger acceptance and propagated to every downstream invocation and log record.",
    controls: "Audit reconstruction, duplicate detection, and cross-system evidence correlation.",
  },
  "Dynamic Planning": {
    what: "Bounded decomposition of an objective into steps selected from approved step templates.",
    why: "Unbounded planning permits agents to invent tool calls, participants, and paths that were never governed.",
    how: "The planner may only compose approved step types within declared maximums for steps, roles, and tools.",
    controls: "Maximum dynamic steps, allowed coworker roles, allowed tools, and mandatory approval points.",
  },
  "Tool Binding": {
    what: "Governed association between an orchestration step and an executable enterprise tool or service.",
    why: "Tool access is an execution authority decision, not an integration detail.",
    how: "Bindings declare invocation mode, allowed operations, blocked operations, environment, and approval requirements.",
    controls: "What a workflow may actually do in an enterprise system, and under what approval.",
  },
  "Execution Contract": {
    what: "The declared input schema, output schema, timeout, retry, and authority for a single step.",
    why: "Contracts make step behaviour verifiable independently of the model or agent implementing it.",
    how: "The engine validates input before invocation and output before transition.",
    controls: "Whether a step result is accepted, retried, escalated, or rejected.",
  },
  "Workflow State": {
    what: "Technical execution state required to resume and coordinate a workflow run.",
    why: "Workflow state is not agent memory: it is coordination data with a defined lifecycle and retention.",
    how: "Includes current step, completed steps, outputs, timers, retry state, pending approvals, locks and branch state.",
    controls: "Resume, recovery, duplicate suppression, and audit reconstruction.",
  },
};

/* -------------------------------- workflows ------------------------------- */

export interface WorkflowRow {
  id: string; name: string; slug: string; domain: string; trigger: string; steps: number;
  orchestrator: string; gates: number; version: string; success: number; status: Health;
  owner: string; risk: string; approvalRequired: boolean; pattern: string; environment: string;
  description: string; published: string; activeRuns: number; coworkers: string[]; tools: string[];
  triggerDetail: { eventClass: string; source: string; filters: string; dedup: string; correlation: string };
  stepMix: [string, string][];
  gateDetail: { name: string; roles: string; sla: string; fallback: string }[];
  runStats: [string, string][];
  statusDetail: { health: string; warnings: string[]; conflicts: string[]; evaluation: string };
  config: { maxRuntime: string; stateStore: string; retry: string; fallback: string; updated: string };
  configSteps: { title: string; detail: string; status: string }[];
  policies: [string, string][];
  usage: [string, string][];
  history: [string, string][];
  versions: { v: string; state: string; note: string }[];
}

export const WORKFLOWS: WorkflowRow[] = [
  {
    id: "wf-underwriting", name: "Underwriting Intake & Triage", slug: "underwriting-intake", domain: "Insurance",
    trigger: "Submission Received", steps: 9, orchestrator: "State Machine", gates: 2, version: "v12", success: 98.9,
    status: "Healthy", owner: "Underwriting Platform Team", risk: "Medium", approvalRequired: true,
    pattern: "Conditional", environment: "Production",
    description: "Receives broker submissions, validates completeness, extracts risk evidence, triages appetite, and routes to the correct underwriting queue with a documented rationale.",
    published: "May 04, 2026", activeRuns: 41,
    coworkers: ["Submission Intake Coworker", "Risk Evidence Analyst", "Appetite Triage Coworker"],
    tools: ["Duck Creek", "ServiceNow", "Document Store"],
    triggerDetail: { eventClass: "Business event", source: "Broker portal / Duck Creek", filters: "line_of_business in (property, casualty)", dedup: "10 minute window on submission ID", correlation: "submission_id" },
    stepMix: [["Agent steps", "4"], ["Tool steps", "3"], ["Human steps", "1"], ["Approval steps", "2"], ["Validation steps", "1"]],
    gateDetail: [
      { name: "Appetite Exception Approval", roles: "Underwriting Manager", sla: "4 hours", fallback: "Escalate to Portfolio Lead" },
      { name: "Referral Release", roles: "Senior Underwriter", sla: "8 hours", fallback: "Queue for next business day" },
    ],
    runStats: [["Runs (7d)", "1,842"], ["Completed", "1,822"], ["Recovered", "14"], ["Failed", "6"], ["Manual interventions", "31"]],
    statusDetail: { health: "All steps within thresholds", warnings: [], conflicts: [], evaluation: "Passed · May 14, 2026" },
    config: { maxRuntime: "45 minutes", stateStore: "Durable / PostgreSQL", retry: "3 attempts, exponential backoff", fallback: "Human underwriting queue", updated: "6 days ago" },
    configSteps: [
      { title: "Validate submission completeness", detail: "Schema and document presence checks.", status: "Active" },
      { title: "Extract risk evidence", detail: "Structured extraction from submission bundle.", status: "Active" },
      { title: "Score appetite", detail: "Appetite model with documented rationale.", status: "Active" },
      { title: "Branch on appetite result", detail: "In-appetite, referral, or decline.", status: "Active" },
      { title: "Require approval for exceptions", detail: "Underwriting Manager gate.", status: "Active" },
      { title: "Publish triage outcome", detail: "Write result to Duck Creek and notify broker desk.", status: "Active" },
    ],
    policies: [["Sequencing", "Strict order until branch"], ["Retry", "3 attempts, non-retryable on validation failure"], ["Approval", "Exception path only"], ["State retention", "90 days"]],
    usage: [["Runs (30d)", "7,914"], ["Average runtime", "6.2 min"], ["Human intervention rate", "1.7%"], ["Cost per run", "$0.21"]],
    history: [["May 04, 2026 · A. Ito", "v12 published — added evidence completeness gate"], ["Apr 18, 2026 · S. Devi", "Retry policy widened to 3 attempts"]],
    versions: [{ v: "v10", state: "Deprecated", note: "Pre-evidence gate" }, { v: "v11", state: "Previous", note: "Referral SLA change" }, { v: "v12", state: "Active", note: "Evidence completeness gate" }],
  },
  {
    id: "wf-policy-change", name: "Policy Change Review", slug: "policy-change-review", domain: "Insurance",
    trigger: "Policy Update Event", steps: 7, orchestrator: "Directed Flow", gates: 1, version: "v5", success: 99.1,
    status: "Healthy", owner: "Policy Administration Team", risk: "Low", approvalRequired: true,
    pattern: "Deterministic", environment: "Production",
    description: "Reviews midterm policy changes for coverage consistency, regulatory constraints, and premium impact before the change is committed.",
    published: "Apr 22, 2026", activeRuns: 12,
    coworkers: ["Policy Review Coworker", "Regulatory Check Coworker"],
    tools: ["Duck Creek", "Document Store"],
    triggerDetail: { eventClass: "Change event", source: "Policy administration system", filters: "change_type = midterm_endorsement", dedup: "5 minute window on policy ID", correlation: "policy_id" },
    stepMix: [["Agent steps", "3"], ["Tool steps", "2"], ["Human steps", "0"], ["Approval steps", "1"], ["Validation steps", "1"]],
    gateDetail: [{ name: "Premium Impact Approval", roles: "Policy Administration Lead", sla: "2 hours", fallback: "Hold change and notify" }],
    runStats: [["Runs (7d)", "986"], ["Completed", "977"], ["Recovered", "7"], ["Failed", "2"], ["Manual interventions", "9"]],
    statusDetail: { health: "Deterministic flow, no branch drift", warnings: [], conflicts: [], evaluation: "Passed · May 12, 2026" },
    config: { maxRuntime: "20 minutes", stateStore: "Durable / PostgreSQL", retry: "2 attempts, fixed backoff", fallback: "Hold for human review", updated: "3 weeks ago" },
    configSteps: [
      { title: "Load policy and endorsement context", detail: "Evidence layer retrieval.", status: "Active" },
      { title: "Check coverage consistency", detail: "Rule and model evaluation.", status: "Active" },
      { title: "Check regulatory constraints", detail: "Jurisdiction rule set.", status: "Active" },
      { title: "Approve premium impact", detail: "Policy Administration Lead gate.", status: "Active" },
      { title: "Commit change", detail: "Governed write to Duck Creek.", status: "Active" },
    ],
    policies: [["Sequencing", "Fully deterministic"], ["Retry", "2 attempts"], ["Approval", "Always required before commit"], ["State retention", "180 days"]],
    usage: [["Runs (30d)", "4,120"], ["Average runtime", "3.1 min"], ["Human intervention rate", "0.9%"], ["Cost per run", "$0.08"]],
    history: [["Apr 22, 2026 · R. Nair", "v5 published — jurisdiction rules refreshed"]],
    versions: [{ v: "v4", state: "Previous", note: "Prior jurisdiction set" }, { v: "v5", state: "Active", note: "Current" }],
  },
  {
    id: "wf-finops", name: "Cloud FinOps Optimization Cycle", slug: "finops-optimization", domain: "FinOps",
    trigger: "Daily Schedule", steps: 11, orchestrator: "Planner + Queue", gates: 1, version: "v8", success: 97.6,
    status: "Healthy", owner: "Cloud FinOps Team", risk: "Medium", approvalRequired: true,
    pattern: "Planner-Guided", environment: "Production",
    description: "Plans and distributes rightsizing, commitment, and waste-elimination tasks across FinOps coworkers, then executes approved optimizations through governed cloud tooling.",
    published: "May 08, 2026", activeRuns: 6,
    coworkers: ["FinOps Analyst Coworker", "Rightsizing Coworker", "Commitment Planner Coworker"],
    tools: ["AWS", "Azure", "Datadog", "Terraform"],
    triggerDetail: { eventClass: "Schedule", source: "Platform scheduler", filters: "cron 0 2 * * * UTC", dedup: "One run per tenant per day", correlation: "finops_cycle_date" },
    stepMix: [["Agent steps", "5"], ["Tool steps", "4"], ["Human steps", "0"], ["Approval steps", "1"], ["Validation steps", "1"]],
    gateDetail: [{ name: "Optimization Execution Approval", roles: "FinOps Lead or Platform Engineering", sla: "8 hours", fallback: "Defer to next cycle" }],
    runStats: [["Runs (7d)", "7"], ["Completed", "7"], ["Recovered", "3"], ["Failed", "0"], ["Manual interventions", "2"]],
    statusDetail: { health: "Planner scope within declared maximums", warnings: ["Planner reached 4 of 4 dynamic steps on May 15"], conflicts: [], evaluation: "Passed · May 15, 2026" },
    config: { maxRuntime: "3 hours", stateStore: "Durable / PostgreSQL + Object Storage", retry: "3 attempts, exponential backoff", fallback: "Defer task to next cycle", updated: "8 days ago" },
    configSteps: [
      { title: "Load spend and utilization evidence", detail: "Evidence layer plus Datadog telemetry.", status: "Active" },
      { title: "Plan optimization candidates", detail: "Bounded decomposition, max 4 dynamic steps.", status: "Active" },
      { title: "Queue tasks to coworkers", detail: "Weighted distribution by capability and load.", status: "Active" },
      { title: "Approve execution set", detail: "FinOps Lead gate.", status: "Active" },
      { title: "Execute approved changes", detail: "Terraform and cloud APIs, approval-gated.", status: "Active" },
      { title: "Validate savings and stability", detail: "Post-change verification window.", status: "Active" },
    ],
    policies: [["Parallelism", "Max 6 concurrent tasks"], ["Planner scope", "12 allowed steps, 4 dynamic"], ["Approval", "Required before any execution"], ["State retention", "365 days"]],
    usage: [["Runs (30d)", "30"], ["Average runtime", "51 min"], ["Human intervention rate", "6.7%"], ["Cost per run", "$4.12"]],
    history: [["May 08, 2026 · K. Osei", "v8 published — dynamic step ceiling reduced to 4"]],
    versions: [{ v: "v7", state: "Previous", note: "6 dynamic steps" }, { v: "v8", state: "Active", note: "Tightened planner scope" }],
  },
  {
    id: "wf-incident", name: "Incident Investigation & Remediation", slug: "incident-remediation", domain: "RunOps",
    trigger: "Priority Alert", steps: 13, orchestrator: "Graph Flow", gates: 2, version: "v14", success: 98.6,
    status: "Healthy", owner: "RunOps Platform Team", risk: "High", approvalRequired: true,
    pattern: "Conditional", environment: "Production",
    description: "Coordinates end-to-end incident investigation, evidence gathering, remediation proposal, human approval, controlled execution, and validation to restore service and close the operational loop.",
    published: "May 16, 2026", activeRuns: 3,
    coworkers: ["Incident Investigation Agent", "Remediation Agent", "Validation Coworker"],
    tools: ["ServiceNow", "AWS", "Datadog", "Terraform"],
    triggerDetail: { eventClass: "Alert", source: "Datadog / ServiceNow event bus", filters: "priority <= P2 AND service in production catalog", dedup: "15 minute window on incident key", correlation: "incident_id" },
    stepMix: [["Agent steps", "5"], ["Tool steps", "4"], ["Human steps", "1"], ["Approval steps", "2"], ["Validation steps", "1"]],
    gateDetail: [
      { name: "Production Remediation Approval", roles: "SRE Lead (alt: Incident Commander)", sla: "5 minutes", fallback: "Escalate to Incident Commander" },
      { name: "Closeout Confirmation", roles: "SRE Lead", sla: "30 minutes", fallback: "Auto-close with audit note after validation" },
    ],
    runStats: [["Runs (7d)", "214"], ["Completed", "211"], ["Recovered", "19"], ["Failed", "3"], ["Manual interventions", "27"]],
    statusDetail: {
      health: "Operating within thresholds",
      warnings: ["Production remediation step permits retry but does not define an idempotency key"],
      conflicts: ["Retry policy conflicts with side-effect classification on NODE-EXEC-006"],
      evaluation: "Passed with warning · May 16, 2026",
    },
    config: { maxRuntime: "30 minutes", stateStore: "Durable / Redis + Object Log", retry: "3 attempts, exponential backoff", fallback: "Human escalation + alternate agent", updated: "2 days ago" },
    configSteps: [
      { title: "Classify incident intent", detail: "Analyze alert and determine scope.", status: "Active" },
      { title: "Load approved context and topology", detail: "Retrieve services, dependencies, and prior incidents.", status: "Active" },
      { title: "Run investigation agent and branch on confidence", detail: "Correlate signals and assess impact.", status: "Active" },
      { title: "Require human approval for remediation", detail: "SRE Lead review and approval gate.", status: "Active" },
      { title: "Execute approved action through policy-bound tool", detail: "Remediation via governed tool.", status: "Active" },
      { title: "Validate service recovery and close workflow", detail: "Verify outcomes and update records.", status: "Active" },
    ],
    policies: [["Sequencing", "Graph transitions with confidence branch"], ["Retry", "3 attempts, exponential backoff 2s → 10s → 30s"], ["Approval", "Mandatory before production execution"], ["Execution risk", "High — privileged action gateway required"], ["State retention", "30 days run state, 365 days audit"]],
    usage: [["Runs (30d)", "912"], ["Average runtime", "9.4 min"], ["Human intervention rate", "12.6%"], ["Cost per run", "$1.87"], ["Tokens per run", "184K"]],
    history: [
      ["May 16, 2026 · R. Nair", "v14 published — alternate investigator fallback added"],
      ["May 09, 2026 · D. Marsh", "Approval SLA reduced from 10 to 5 minutes"],
      ["Apr 30, 2026 · S. Devi", "Terraform binding moved to approval-gated mode"],
    ],
    versions: [
      { v: "v12", state: "Deprecated", note: "Pre-graph flow" },
      { v: "v13", state: "Previous", note: "10 minute approval SLA" },
      { v: "v14", state: "Active", note: "Alternate investigator fallback" },
      { v: "v15", state: "Draft", note: "Adds idempotency key on remediation execution" },
    ],
  },
  {
    id: "wf-change-risk", name: "SRE Change Risk Review", slug: "sre-change-risk", domain: "SRE",
    trigger: "Change Request", steps: 8, orchestrator: "Decision Workflow", gates: 1, version: "v6", success: 98.2,
    status: "Healthy", owner: "SRE Governance", risk: "Medium", approvalRequired: true,
    pattern: "Conditional", environment: "Production",
    description: "Evaluates proposed infrastructure changes for blast radius, dependency risk, rollback readiness, and change-window compliance before approval.",
    published: "Apr 29, 2026", activeRuns: 8,
    coworkers: ["Change Risk Coworker", "Dependency Analyst Coworker"],
    tools: ["ServiceNow", "GitHub Actions", "Terraform"],
    triggerDetail: { eventClass: "Change event", source: "ServiceNow change management", filters: "risk in (medium, high)", dedup: "None — every change evaluated", correlation: "change_id" },
    stepMix: [["Agent steps", "3"], ["Tool steps", "3"], ["Human steps", "0"], ["Approval steps", "1"], ["Validation steps", "1"]],
    gateDetail: [{ name: "Change Approval", roles: "Change Manager", sla: "1 hour", fallback: "Defer to CAB" }],
    runStats: [["Runs (7d)", "168"], ["Completed", "165"], ["Recovered", "6"], ["Failed", "3"], ["Manual interventions", "11"]],
    statusDetail: { health: "Within thresholds", warnings: [], conflicts: [], evaluation: "Passed · May 11, 2026" },
    config: { maxRuntime: "25 minutes", stateStore: "Durable / PostgreSQL", retry: "2 attempts", fallback: "Route to CAB queue", updated: "2 weeks ago" },
    configSteps: [
      { title: "Load change and dependency graph", detail: "Topology and ownership evidence.", status: "Active" },
      { title: "Assess blast radius", detail: "Impact scoring across dependent services.", status: "Active" },
      { title: "Verify rollback readiness", detail: "Rollback plan presence and validity.", status: "Active" },
      { title: "Approve or defer", detail: "Change Manager gate.", status: "Active" },
    ],
    policies: [["Sequencing", "Decision workflow"], ["Retry", "2 attempts"], ["Approval", "Change Manager"], ["Execution window", "Approved windows only"]],
    usage: [["Runs (30d)", "684"], ["Average runtime", "7.8 min"], ["Human intervention rate", "4.4%"], ["Cost per run", "$0.44"]],
    history: [["Apr 29, 2026 · D. Marsh", "v6 published — rollback verification added"]],
    versions: [{ v: "v5", state: "Previous", note: "No rollback verification" }, { v: "v6", state: "Active", note: "Current" }],
  },
  {
    id: "wf-vuln", name: "Vulnerability Triage & Patch Validation", slug: "vulnerability-triage", domain: "Security",
    trigger: "Scan Complete", steps: 10, orchestrator: "State Machine", gates: 2, version: "v9", success: 95.9,
    status: "Degraded", owner: "Security Engineering", risk: "High", approvalRequired: true,
    pattern: "Conditional", environment: "Production",
    description: "Triages scanner findings, correlates asset exposure, plans patch sequencing, and validates remediation with evidence capture for audit.",
    published: "May 02, 2026", activeRuns: 5,
    coworkers: ["Vulnerability Triage Coworker", "Patch Validation Coworker"],
    tools: ["ServiceNow", "AWS", "GitHub Actions"],
    triggerDetail: { eventClass: "Scan event", source: "Security scanning platform", filters: "severity in (critical, high)", dedup: "60 minute window on finding fingerprint", correlation: "finding_id" },
    stepMix: [["Agent steps", "4"], ["Tool steps", "3"], ["Human steps", "1"], ["Approval steps", "2"], ["Validation steps", "1"]],
    gateDetail: [
      { name: "Emergency Patch Approval", roles: "Security Lead", sla: "30 minutes", fallback: "Escalate to CISO delegate" },
      { name: "Production Patch Window", roles: "Change Manager", sla: "4 hours", fallback: "Defer to next window" },
    ],
    runStats: [["Runs (7d)", "342"], ["Completed", "328"], ["Recovered", "22"], ["Failed", "14"], ["Manual interventions", "48"]],
    statusDetail: {
      health: "Degraded — patch validation step exceeding timeout",
      warnings: ["Validation step timeout (90s) exceeded on 6.4% of runs", "Alternate validation coworker not configured"],
      conflicts: ["Missing fallback agent for NODE-VAL-004"],
      evaluation: "Failed validation threshold · May 16, 2026",
    },
    config: { maxRuntime: "60 minutes", stateStore: "Durable / PostgreSQL", retry: "3 attempts, exponential backoff", fallback: "Not configured for validation step", updated: "4 days ago" },
    configSteps: [
      { title: "Ingest scan findings", detail: "Normalize and deduplicate.", status: "Active" },
      { title: "Correlate asset exposure", detail: "Asset criticality and reachability.", status: "Active" },
      { title: "Plan patch sequence", detail: "Dependency-ordered patch plan.", status: "Active" },
      { title: "Approve emergency patches", detail: "Security Lead gate.", status: "Active" },
      { title: "Validate patch application", detail: "Evidence capture and verification.", status: "Degraded" },
    ],
    policies: [["Sequencing", "State machine"], ["Retry", "3 attempts"], ["Approval", "Two gates"], ["Fallback", "Incomplete — validation step"]],
    usage: [["Runs (30d)", "1,406"], ["Average runtime", "18.2 min"], ["Human intervention rate", "14.1%"], ["Cost per run", "$0.96"]],
    history: [["May 02, 2026 · S. Devi", "v9 published — evidence capture added"], ["May 16, 2026 · System", "Status changed to Degraded"]],
    versions: [{ v: "v8", state: "Previous", note: "No evidence capture" }, { v: "v9", state: "Active", note: "Current" }],
  },
  {
    id: "wf-escalation", name: "Customer Escalation Resolution", slug: "customer-escalation", domain: "Support",
    trigger: "Escalation Created", steps: 6, orchestrator: "Directed Flow", gates: 1, version: "v4", success: 97.3,
    status: "Healthy", owner: "Customer Operations", risk: "Low", approvalRequired: true,
    pattern: "Deterministic", environment: "Production",
    description: "Assembles account, policy, and interaction history, drafts a resolution plan, and routes to a human owner for confirmation before customer communication.",
    published: "Apr 12, 2026", activeRuns: 17,
    coworkers: ["Escalation Coworker", "Communications Coworker"],
    tools: ["ServiceNow", "Duck Creek"],
    triggerDetail: { eventClass: "Human request", source: "Support desk", filters: "escalation_tier >= 2", dedup: "None", correlation: "case_id" },
    stepMix: [["Agent steps", "3"], ["Tool steps", "1"], ["Human steps", "1"], ["Approval steps", "1"], ["Validation steps", "0"]],
    gateDetail: [{ name: "Customer Communication Approval", roles: "Support Manager", sla: "1 hour", fallback: "Hold communication" }],
    runStats: [["Runs (7d)", "421"], ["Completed", "409"], ["Recovered", "9"], ["Failed", "3"], ["Manual interventions", "38"]],
    statusDetail: { health: "Within thresholds", warnings: [], conflicts: [], evaluation: "Passed · May 10, 2026" },
    config: { maxRuntime: "2 hours", stateStore: "Durable / PostgreSQL", retry: "2 attempts", fallback: "Human owner", updated: "5 weeks ago" },
    configSteps: [
      { title: "Assemble case context", detail: "Account, policy, and interaction history.", status: "Active" },
      { title: "Draft resolution plan", detail: "Grounded in approved evidence.", status: "Active" },
      { title: "Approve customer communication", detail: "Support Manager gate.", status: "Active" },
      { title: "Send and record", detail: "Governed write to ServiceNow.", status: "Active" },
    ],
    policies: [["Sequencing", "Deterministic"], ["Approval", "Always before customer contact"], ["State retention", "180 days"]],
    usage: [["Runs (30d)", "1,780"], ["Average runtime", "42 min"], ["Human intervention rate", "9.0%"], ["Cost per run", "$0.19"]],
    history: [["Apr 12, 2026 · L. Chen", "v4 published — tone policy applied"]],
    versions: [{ v: "v3", state: "Previous", note: "Prior tone policy" }, { v: "v4", state: "Active", note: "Current" }],
  },
];

/* --------------------------- orchestration pipeline ----------------------- */

export interface PipelineStage {
  id: string; index: number; name: string; headline: string; sub: string;
  purpose: string; componentsLabel: string; components: string[];
  controlsLabel: string; controls: string[];
  inputs: string[]; outputs: string[]; logic: string[];
  configuration: [string, string][]; policies: string[]; dependencies: string[];
  health: string; usage: [string, string][]; changes: [string, string][];
}

export const PIPELINE: PipelineStage[] = [
  {
    id: "trigger", index: 1, name: "Trigger / Intake", headline: "8 trigger classes configured", sub: "Dedup window 5m",
    purpose: "Accept, classify, deduplicate, and authorize incoming work before any workflow run is created.",
    componentsLabel: "Trigger classes",
    components: ["Event", "Schedule", "API", "Human request", "Agent request", "Alert", "Change event", "Webhook"],
    controlsLabel: "Controls", controls: ["Deduplication window", "Correlation key", "Priority", "Tenant eligibility"],
    inputs: ["Source event payload", "Tenant identity", "Priority or severity", "Correlation key"],
    outputs: ["Accepted run with run ID and correlation ID", "Rejection with reason", "Suppressed duplicate"],
    logic: [
      "IF tenant_eligible = false THEN reject",
      "IF duplicate_key seen within dedup_window THEN suppress and attach to existing run",
      "IF priority > configured_threshold THEN reject or queue at low priority",
      "ELSE create run and assign correlation ID",
    ],
    configuration: [["Deduplication window", "5 minutes default, per-workflow override"], ["Correlation key", "Declared per trigger class"], ["Priority mapping", "P1–P4 to queue weight"], ["Tenant eligibility", "Tenant + environment allow list"]],
    policies: ["Trigger authorization policy", "Rate limit policy", "Agent-request trigger requires an originating workflow"],
    dependencies: ["Event bus", "Tenant registry", "Deduplication store"],
    health: "Healthy — 91.2K triggers/day, 3.1% suppressed as duplicates.",
    usage: [["Accepted (24h)", "88.4K"], ["Suppressed duplicates", "2.8K"], ["Rejected", "412"]],
    changes: [["May 10, 2026 · R. Nair", "Webhook trigger class enabled"], ["Apr 28, 2026 · A. Ito", "Dedup window raised to 15m for incident alerts"]],
  },
  {
    id: "plan", index: 2, name: "Plan / Decompose", headline: "12 active plan templates", sub: "Max 4 dynamic steps",
    purpose: "Convert an accepted objective into an executable, bounded sequence of approved steps with declared dependencies.",
    componentsLabel: "Components",
    components: ["Objective analysis", "Task decomposition", "Dependency graph", "Required capabilities", "Required evidence", "Parallelism", "Execution constraints"],
    controlsLabel: "Planning bounds", controls: ["Allowed steps 12", "Max dynamic steps 4", "Allowed roles 3", "Allowed tools 5"],
    inputs: ["Accepted trigger", "Workflow definition and version", "Available step templates", "Evidence requirements"],
    outputs: ["Execution plan", "Dependency graph", "Required capability set", "Parallel branch declarations"],
    logic: [
      "IF workflow.pattern = deterministic THEN use published graph without planning",
      "IF workflow.pattern = conditional THEN use published graph with branch evaluation",
      "IF workflow.pattern = planner_guided THEN decompose within allowed step templates",
      "IF dynamic_steps > max_dynamic_steps THEN truncate plan and require approval",
    ],
    configuration: [["Plan templates", "12 active"], ["Dynamic planning", "Enabled for 2 of 7 workflows"], ["Max dynamic steps", "4"], ["Approval on plan expansion", "Required"]],
    policies: ["Planner scope policy", "Approved step template registry", "Evidence sufficiency policy"],
    dependencies: ["Workflow registry", "Step template registry", "Context / Evidence Layer"],
    health: "Healthy — not every workflow requires dynamic planning. Five workflows use predetermined graphs; two allow bounded decomposition.",
    usage: [["Plans created (24h)", "6.1K"], ["Dynamic expansions", "212"], ["Truncated plans", "4"]],
    changes: [["May 08, 2026 · K. Osei", "FinOps dynamic step ceiling reduced from 6 to 4"]],
  },
  {
    id: "assign", index: 3, name: "Assign Agent / Tool", headline: "Routing mode: Weighted", sub: "31 coworkers eligible",
    purpose: "Select the digital coworker, model role, or tool authorized and available to execute the step.",
    componentsLabel: "Assignment inputs",
    components: ["Role matching", "Skills", "Allowed tools", "Current load", "Agent availability", "Policy eligibility", "Required autonomy"],
    controlsLabel: "Controls", controls: ["Weighted routing", "Per-agent concurrency", "Alternate coworker", "Minimum agent version"],
    inputs: ["Step definition", "Required skill and domain", "Coworker registry state", "Policy eligibility result"],
    outputs: ["Assigned participant", "Alternate participant", "Assignment rationale"],
    logic: [
      "Filter coworkers by required_skill AND domain AND minimum_version",
      "Reject any coworker lacking the declared tool authorization",
      "Score remaining by availability, current load, and recent quality",
      "IF no eligible coworker THEN alternate coworker; IF none THEN human escalation",
    ],
    configuration: [["Routing mode", "Weighted (availability 40, load 25, quality 35)"], ["Per-agent concurrency", "8 in-flight"], ["Alternate assignment", "Required for high-risk steps"], ["Minimum version enforcement", "Enabled"]],
    policies: ["Agent assignment policy", "Autonomy level policy", "Tool authorization policy"],
    dependencies: ["Coworker registry", "Access & Security plane", "Tool binding registry"],
    health: "Healthy — 0.4% of assignments fall through to alternate coworker.",
    usage: [["Assignments (24h)", "74.8K"], ["Alternate used", "298"], ["Escalated (no eligible agent)", "11"]],
    changes: [["May 16, 2026 · R. Nair", "Alternate investigator added for RunOps domain"]],
  },
  {
    id: "execute", index: 4, name: "Execute Step", headline: "Retry policy: 3 attempts", sub: "Execution: step-based",
    purpose: "Invoke the assigned participant under a declared execution contract with timeout, idempotency and authorization controls.",
    componentsLabel: "Controls",
    components: ["Timeout", "Idempotency", "Tool authorization", "Input contract", "Output schema", "Checkpoint"],
    controlsLabel: "Execution", controls: ["Step-based execution", "Exponential backoff 2s → 10s → 30s", "Execution lock", "Privileged action gateway"],
    inputs: ["Validated step input", "Execution authority grant", "Idempotency key for side-effect steps"],
    outputs: ["Step output conforming to schema", "Checkpoint record", "Error classification on failure"],
    logic: [
      "Validate input against declared schema; reject on mismatch (non-retryable)",
      "IF step.side_effect = true AND idempotency_key = null THEN block automatic retry",
      "Invoke participant with timeout; on timeout apply retry policy",
      "Persist checkpoint after successful output validation",
    ],
    configuration: [["Default timeout", "90 seconds"], ["Max retries", "3"], ["Backoff", "2s → 10s → 30s"], ["Duplicate detection window", "60 minutes"], ["Checkpoint", "After each step"]],
    policies: ["Retry / timeout policy", "Tool invocation policy", "Execution risk policy"],
    dependencies: ["State store", "Privileged Action Gateway", "Tool bindings"],
    health: "Healthy — 91.4% of step failures recovered automatically.",
    usage: [["Steps executed (24h)", "412K"], ["Retried", "9.8K"], ["Dead-lettered", "184"]],
    changes: [["May 09, 2026 · D. Marsh", "Backoff schedule changed to 2s / 10s / 30s"]],
  },
  {
    id: "branch", index: 5, name: "Evaluate / Branch", headline: "Confidence + policy", sub: "Eval model: Quality v2",
    purpose: "Determine whether the workflow should continue, retry, branch, escalate, request approval, or stop.",
    componentsLabel: "Components",
    components: ["Branch rules", "Confidence thresholds", "Output validation", "Policy decisions", "Exception detection", "Evaluation model", "Quality thresholds"],
    controlsLabel: "Thresholds", controls: ["Continue ≥ 0.85", "Human review 0.60–0.85", "Alternate agent < 0.60", "Policy violation → stop"],
    inputs: ["Step result", "Tool result", "Confidence", "Validation result", "Policy status", "Risk class", "Current workflow state"],
    outputs: ["Selected transition", "Branch rationale", "Escalation or approval request"],
    logic: [
      "IF confidence >= 0.85 AND validation = passed THEN continue",
      "IF confidence >= 0.60 AND confidence < 0.85 THEN human review",
      "IF confidence < 0.60 THEN alternate agent",
      "IF policy violation = true THEN stop and escalate",
    ],
    configuration: [["Evaluation model", "Quality v2"], ["Confidence source", "Agent self-report reconciled with validator"], ["Rule evaluation", "Ordered, first match wins"], ["Rationale capture", "Mandatory"]],
    policies: ["Branch rule policy", "Exception detection policy", "Escalation policy"],
    dependencies: ["Evaluation service", "Policy engine", "Durable state"],
    health: "Healthy — branch accuracy 97.8% against human review sample.",
    usage: [["Branch decisions (24h)", "88.1K"], ["Human review branch", "3.2K"], ["Alternate agent branch", "641"], ["Stopped on policy", "77"]],
    changes: [["May 12, 2026 · S. Devi", "Human review band widened to 0.60–0.85"]],
  },
  {
    id: "approval", index: 6, name: "Approval / Handoff", headline: "9 approval gates", sub: "2 configured on this workflow",
    purpose: "Transfer work between participants under authorization, or pause execution for accountable human decision.",
    componentsLabel: "Components",
    components: ["Human role", "Agent handoff", "RBAC", "SLA", "Delegation", "Escalation", "Approval evidence"],
    controlsLabel: "Controls", controls: ["No auto-approval on timeout", "Alternate approver", "Evidence pack required", "Rejection behaviour declared"],
    inputs: ["Proposed action", "Impact and risk assessment", "Evidence pack", "Rollback plan", "Validation plan"],
    outputs: ["Approve / Reject / Request changes / Escalate", "Signed audit record", "Carried state for the destination participant"],
    logic: [
      "IF risk_class >= medium AND environment = production THEN approval required",
      "IF approver = requester THEN reject (self-approval prohibited)",
      "IF SLA exceeded THEN escalate to alternate role — never auto-approve",
      "Handoff allowed only when confidence, evidence, and policy conditions all pass",
    ],
    configuration: [["Approval gates", "9 tenant-wide"], ["Default SLA", "5 minutes for production remediation"], ["Timeout behaviour", "Escalate to Incident Commander"], ["Delegation", "Explicit, time-boxed"]],
    policies: ["Approval policy", "Agent handoff policy", "Human role constraint policy"],
    dependencies: ["Identity & access", "Notification service", "Audit ledger"],
    health: "Healthy — 96.2% of approvals decided within SLA.",
    usage: [["Approvals requested (24h)", "1,284"], ["Approved", "1,144"], ["Rejected", "62"], ["Escalated on timeout", "48"]],
    changes: [["May 09, 2026 · D. Marsh", "Production remediation SLA reduced to 5 minutes"]],
  },
  {
    id: "validate", index: 7, name: "Validate / Complete", headline: "Completion policy enforced", sub: "97.1% output validation",
    purpose: "Verify the declared outcome, reconcile system state, and close the run under a completion policy.",
    componentsLabel: "Components",
    components: ["Outcome schema", "Expected result", "Validation test", "Reconciliation", "Completion policy", "Learning event", "Audit closeout"],
    controlsLabel: "Controls", controls: ["Validation required before completion", "Reconciliation against source system", "Learning event emitted", "Audit record sealed"],
    inputs: ["Execution result", "Expected outcome definition", "Post-change telemetry", "Source system state"],
    outputs: ["Completed run", "Escalated run", "Recovery run", "Learning and evaluation events"],
    logic: [
      "IF validation_tests = passed AND reconciliation = matched THEN complete",
      "IF validation failed AND retries remaining THEN retry validation after backoff",
      "IF validation failed AND retries exhausted THEN escalate to human",
      "Emit learning event with branch decisions, retries, and interventions",
    ],
    configuration: [["Validation retries", "2 with 10s backoff"], ["Reconciliation window", "5 minutes post-execution"], ["Completion policy", "All required validations pass"], ["Learning events", "Enabled"]],
    policies: ["Completion policy", "Outcome validation policy", "State retention policy"],
    dependencies: ["Telemetry sources", "Source systems", "Evaluation service", "Audit ledger"],
    health: "Healthy — 97.1% output validation pass rate on first attempt.",
    usage: [["Validations (24h)", "86.2K"], ["Passed first attempt", "83.7K"], ["Passed after retry", "2.1K"], ["Escalated", "394"]],
    changes: [["Apr 30, 2026 · A. Ito", "Reconciliation window extended to 5 minutes"]],
  },
];

/* ------------------------------ workflow graph ---------------------------- */

export type NodeKind = "trigger" | "automated" | "agent" | "human" | "approval" | "tool" | "validation" | "end";

export interface GraphNode {
  id: string; nodeId: string; label: string; sub: string; kind: NodeKind;
  x: number; y: number; w: number; h: number;
  participant: string; inputSchema: string[]; outputSchema: string[];
  timeout: string; retry: string; policy: string; authority: string; checkpoint: string;
  overview: [string, string][]; assignment: [string, string][]; policies: string[];
  state: [string, string][]; evaluation: [string, string][]; history: [string, string][];
}

export interface GraphEdge {
  id: string; from: string; to: string; kind: "success" | "alternate" | "retry" | "failure";
  label?: string; rule: string; condition: string; priority: string; fallback: string; threshold: string;
  points: [number, number][];
}

export const GRAPH_NODES: GraphNode[] = [
  {
    id: "n-trigger", nodeId: "NODE-TRG-001", label: "Trigger", sub: "Priority Alert", kind: "trigger",
    x: 20, y: 150, w: 128, h: 46, participant: "Event intake service",
    inputSchema: ["alert_id", "severity", "service", "signal_payload"],
    outputSchema: ["run_id", "correlation_id", "incident_id", "priority"],
    timeout: "5 seconds", retry: "None (idempotent intake)", policy: "Trigger authorization policy", authority: "Read-only", checkpoint: "After acceptance",
    overview: [["Trigger class", "Alert"], ["Source", "Datadog / ServiceNow event bus"], ["Filter", "priority <= P2"], ["Dedup window", "15 minutes on incident key"]],
    assignment: [["Participant", "Platform intake service"], ["Alternate", "None — intake is platform-owned"]],
    policies: ["Tenant eligibility required", "Duplicate suppression enforced", "Correlation ID assigned at acceptance"],
    state: [["Checkpoint", "After acceptance"], ["Retention", "30 days"]],
    evaluation: [["Acceptance accuracy", "99.9%"], ["False trigger rate", "0.1%"]],
    history: [["Apr 28, 2026 · A. Ito", "Dedup window raised to 15 minutes"]],
  },
  {
    id: "n-context", nodeId: "NODE-CTX-002", label: "Context Load", sub: "Topology & Evidence", kind: "automated",
    x: 188, y: 150, w: 140, h: 46, participant: "Context / Evidence Layer",
    inputSchema: ["incident_id", "service", "time_window"],
    outputSchema: ["topology[]", "evidence_refs[]", "recent_changes[]", "prior_incidents[]"],
    timeout: "30 seconds", retry: "2 attempts, fixed 5s", policy: "Evidence access policy", authority: "Read-only", checkpoint: "After completion",
    overview: [["Participant", "Context / Evidence Layer"], ["Retrieval scope", "Approved tenant sources only"], ["Evidence objects", "14 typical"], ["Freshness requirement", "< 15 minutes for telemetry"]],
    assignment: [["Assignment", "Platform service, not a coworker"], ["Alternate", "Cached topology snapshot"]],
    policies: ["No unapproved source access", "Evidence returned as references", "Data classification enforced at retrieval"],
    state: [["Checkpoint", "After completion"], ["Stored form", "References, not raw content"]],
    evaluation: [["Evidence sufficiency", "98.4%"], ["Retrieval latency p95", "3.1s"]],
    history: [["Apr 22, 2026 · S. Devi", "Prior-incident lookback extended to 90 days"]],
  },
  {
    id: "n-investigate", nodeId: "NODE-INV-003", label: "Investigation Agent", sub: "Analyze & Correlate", kind: "agent",
    x: 368, y: 150, w: 152, h: 46, participant: "Incident Investigation Agent",
    inputSchema: ["Incident ID", "Alert context", "Topology", "Telemetry", "Recent change", "Prior incidents"],
    outputSchema: ["Hypotheses[]", "Confidence", "Evidence[]", "Affected services[]", "Likely cause", "Recommended next step"],
    timeout: "5 minutes (action: escalate)", retry: "1", policy: "No direct remediation", authority: "Analysis only — no execution", checkpoint: "After completion",
    overview: [["Digital Coworker", "Incident Investigation Agent"], ["Role", "Investigation"], ["Assignment", "Skill + domain + availability"], ["Max Runtime", "5 minutes"], ["Timeout Action", "Escalate"], ["Retries", "1"], ["Parallel Execution", "No"]],
    assignment: [["Required Skill", "Incident Investigation"], ["Domain", "Infrastructure"], ["Minimum Version", "v8"], ["Alternate Coworker", "General RunOps Investigator"]],
    policies: ["Context required", "No direct remediation", "No privileged tool access", "Audit logging required"],
    state: [["Checkpoint", "After completion"], ["Retention", "30 days"]],
    evaluation: [["Minimum output validity", "95%"], ["Minimum confidence", "0.70"], ["Observed mean confidence", "0.78"]],
    history: [["May 16, 2026 · R. Nair", "Alternate coworker configured"], ["May 03, 2026 · D. Marsh", "Max runtime reduced to 5 minutes"]],
  },
  {
    id: "n-remediate", nodeId: "NODE-REM-004", label: "Remediation Agent", sub: "Propose Actions", kind: "agent",
    x: 566, y: 62, w: 150, h: 46, participant: "Remediation Agent",
    inputSchema: ["Likely cause", "Affected services[]", "Evidence[]", "Risk class"],
    outputSchema: ["Proposed action", "Expected impact", "Rollback plan", "Validation plan", "Blast radius"],
    timeout: "3 minutes", retry: "1", policy: "Proposal only — cannot execute", authority: "Proposal authority only", checkpoint: "After completion",
    overview: [["Digital Coworker", "Remediation Agent"], ["Role", "Remediation planning"], ["Execution authority", "None — proposal only"], ["Max Runtime", "3 minutes"]],
    assignment: [["Required Skill", "Remediation planning"], ["Domain", "Infrastructure"], ["Minimum Version", "v6"], ["Alternate Coworker", "Senior RunOps Remediation"]],
    policies: ["Rollback plan mandatory", "Blast radius must be declared", "No tool invocation from this node"],
    state: [["Checkpoint", "After completion"], ["Carried forward", "Proposal, evidence refs, risk"]],
    evaluation: [["Proposal acceptance rate", "88.4%"], ["Rollback plan completeness", "100%"]],
    history: [["Apr 30, 2026 · S. Devi", "Blast radius declaration made mandatory"]],
  },
  {
    id: "n-approval", nodeId: "NODE-APR-005", label: "Approval Gate", sub: "SRE Lead", kind: "approval",
    x: 566, y: 150, w: 150, h: 46, participant: "SRE Lead (human)",
    inputSchema: ["Proposed action", "Expected impact", "Risk", "Evidence", "Rollback", "Affected services", "Validation plan"],
    outputSchema: ["decision", "approver", "reason", "timestamp", "evidence_viewed"],
    timeout: "5 minutes (escalate)", retry: "None", policy: "Production Remediation Approval (APR-PROD-004)", authority: "Human authorization", checkpoint: "Before and after decision",
    overview: [["Approval ID", "APR-PROD-004"], ["Required Role", "SRE Lead"], ["Alternate", "Incident Commander"], ["SLA", "5 minutes"], ["Approval Type", "Explicit"], ["Timeout", "Escalate to Incident Commander"], ["Auto-approval", "Never"]],
    assignment: [["Approver pool", "6 SRE Leads"], ["Self-approval", "Prohibited"], ["Delegation", "Time-boxed, explicit"]],
    policies: ["No auto-approval after timeout", "Evidence pack must be viewed", "Decision reason required for reject and request-changes"],
    state: [["Pending approval", "Held in durable state"], ["Locks", "Execution lock held during approval"]],
    evaluation: [["Approval SLA attainment", "96.2%"], ["Median decision time", "2m 14s"]],
    history: [["May 09, 2026 · D. Marsh", "SLA reduced from 10 to 5 minutes"]],
  },
  {
    id: "n-execute", nodeId: "NODE-EXEC-006", label: "Execute Action", sub: "Policy-Bound Tool", kind: "tool",
    x: 756, y: 150, w: 148, h: 46, participant: "Terraform via Privileged Action Gateway",
    inputSchema: ["approved_action", "target_resource", "approval_record", "rollback_plan"],
    outputSchema: ["execution_result", "applied_plan_ref", "resource_state", "duration"],
    timeout: "90 seconds", retry: "3 attempts, exponential backoff 2s → 10s → 30s", policy: "Production Change Execution", authority: "Privileged — approval-bound", checkpoint: "Before invocation and after result",
    overview: [["Tool binding", "TOOL-TF-001 (Terraform)"], ["Invocation mode", "Approval-Gated"], ["Environment", "Production"], ["Gateway", "Privileged Action Gateway"], ["Side-effect classification", "Mutating"]],
    assignment: [["Executor", "Platform execution service"], ["Alternate tool", "Not permitted without approval"]],
    policies: ["Approval record required", "Rollback plan required", "Change window enforced", "Idempotency key required for retry — currently not configured"],
    state: [["Checkpoint", "Before invocation and after result"], ["Execution lock", "Held on target resource"], ["Duplicate window", "60 minutes"]],
    evaluation: [["Execution success", "97.9%"], ["Rollback invoked", "0.6%"]],
    history: [["Apr 30, 2026 · S. Devi", "Binding moved to approval-gated mode"]],
  },
  {
    id: "n-validate", nodeId: "NODE-VAL-007", label: "Validation Step", sub: "Verify Recovery", kind: "validation",
    x: 756, y: 240, w: 148, h: 46, participant: "Validation Coworker",
    inputSchema: ["execution_result", "expected_outcome", "service_slis"],
    outputSchema: ["validation_status", "test_results[]", "reconciliation_status"],
    timeout: "60 seconds", retry: "2 attempts, 10s backoff", policy: "Outcome validation policy", authority: "Read-only", checkpoint: "After completion",
    overview: [["Participant", "Validation Coworker"], ["Tests", "Service SLI recovery, error rate, saturation, reconciliation"], ["Retry", "2 attempts with 10s backoff"]],
    assignment: [["Required Skill", "Outcome validation"], ["Alternate Coworker", "Platform validation service"]],
    policies: ["Completion requires validation pass", "Reconciliation against source system required"],
    state: [["Checkpoint", "After completion"], ["Retention", "30 days"]],
    evaluation: [["Validation pass (first attempt)", "94.6%"], ["Pass after retry", "97.1%"]],
    history: [["Apr 30, 2026 · A. Ito", "Reconciliation window extended to 5 minutes"]],
  },
  {
    id: "n-human", nodeId: "NODE-HUM-008", label: "Human Review", sub: "SRE Lead", kind: "human",
    x: 368, y: 258, w: 152, h: 46, participant: "SRE Lead (human)",
    inputSchema: ["hypotheses[]", "confidence", "evidence[]", "affected services[]"],
    outputSchema: ["direction", "selected_hypothesis", "notes"],
    timeout: "15 minutes", retry: "None", policy: "Low-confidence review policy", authority: "Human direction", checkpoint: "After decision",
    overview: [["Trigger condition", "Investigation confidence < 0.70"], ["Role", "SRE Lead"], ["Purpose", "Direct the workflow rather than approve execution"]],
    assignment: [["Reviewer pool", "SRE on-call rotation"], ["Escalation", "Incident Commander after 15 minutes"]],
    policies: ["Review decision recorded with reason", "Review may return workflow to remediation or terminate the run"],
    state: [["Pending review", "Held in durable state"], ["Timer", "15 minute review timer"]],
    evaluation: [["Review rate", "12.6% of runs"], ["Median review time", "4m 02s"]],
    history: [["May 12, 2026 · S. Devi", "Confidence threshold band adjusted"]],
  },
  {
    id: "n-escalate", nodeId: "NODE-ESC-009", label: "Human Escalation", sub: "Incident Commander", kind: "human",
    x: 952, y: 62, w: 150, h: 46, participant: "Incident Commander (human)",
    inputSchema: ["failure_class", "retry_history", "run_state", "correlation_id"],
    outputSchema: ["escalation_decision", "manual_action_record"],
    timeout: "None — human owned", retry: "None", policy: "Escalation policy", authority: "Human ownership of the run", checkpoint: "On entry",
    overview: [["Entry condition", "Retries exhausted or non-retryable failure"], ["Role", "Incident Commander"], ["Run ownership", "Transferred to human"]],
    assignment: [["Pool", "Incident command rotation"], ["Notification", "Page + ServiceNow task"]],
    policies: ["Run state preserved for manual continuation", "Dead-letter entry created", "No automatic retry after escalation"],
    state: [["Run state", "Frozen at last checkpoint"], ["Dead letter", "Entry written with correlation ID"]],
    evaluation: [["Escalation rate", "1.4% of runs"], ["Median resolution", "22 min"]],
    history: [["May 09, 2026 · D. Marsh", "Escalation now creates a ServiceNow task automatically"]],
  },
  {
    id: "n-closeout", nodeId: "NODE-END-010", label: "Closeout", sub: "Update & Notify", kind: "end",
    x: 952, y: 240, w: 150, h: 46, participant: "Closeout service",
    inputSchema: ["validation_status", "execution_record", "approval_record"],
    outputSchema: ["run_outcome", "audit_record", "learning_event"],
    timeout: "30 seconds", retry: "2 attempts", policy: "Completion policy", authority: "Write to record systems", checkpoint: "Final",
    overview: [["Completion policy", "All required validations passed"], ["Records updated", "ServiceNow incident, audit ledger"], ["Learning event", "Emitted to evaluation service"]],
    assignment: [["Participant", "Platform closeout service"], ["Alternate", "Manual closeout by SRE Lead"]],
    policies: ["Audit record sealed and immutable", "Learning event required", "Outcome published to workflow evaluation"],
    state: [["Run state", "Sealed"], ["Retention", "30 days run state, 365 days audit"]],
    evaluation: [["Closeout success", "99.7%"], ["Outcome validation", "97.1%"]],
    history: [["Apr 18, 2026 · A. Ito", "Learning event schema v3"]],
  },
];

export const GRAPH_EDGES: GraphEdge[] = [
  {
    id: "e1", from: "n-trigger", to: "n-context", kind: "success",
    rule: "on_accept → load_context", condition: "Trigger accepted and correlation ID assigned", priority: "1",
    fallback: "Reject run", threshold: "—", points: [[148, 173], [188, 173]],
  },
  {
    id: "e2", from: "n-context", to: "n-investigate", kind: "success",
    rule: "on_evidence_sufficient → investigate", condition: "evidence_sufficiency >= 0.80", priority: "1",
    fallback: "Retry retrieval, then human review", threshold: "0.80 evidence sufficiency", points: [[328, 173], [368, 173]],
  },
  {
    id: "e3", from: "n-investigate", to: "n-remediate", kind: "success", label: "High Confidence (≥ 0.70)",
    rule: "IF confidence >= 0.70 AND policy_violation = false THEN remediation_path",
    condition: "confidence >= 0.70 AND root_cause_evidence >= 0.80 AND incident_risk_class <= medium",
    priority: "1", fallback: "Human review", threshold: "0.70 confidence",
    points: [[520, 165], [543, 165], [543, 85], [566, 85]],
  },
  {
    id: "e4", from: "n-investigate", to: "n-human", kind: "alternate", label: "Low Confidence (< 0.70)",
    rule: "IF confidence < 0.70 THEN human_review",
    condition: "confidence < 0.70 OR root_cause_evidence < 0.80", priority: "2",
    fallback: "Escalate to Incident Commander after 15 minutes", threshold: "0.70 confidence",
    points: [[444, 196], [444, 258]],
  },
  {
    id: "e5", from: "n-remediate", to: "n-approval", kind: "success",
    rule: "on_proposal → approval_gate", condition: "Proposal complete with rollback and validation plan", priority: "1",
    fallback: "Return to remediation agent for missing rollback plan", threshold: "—",
    points: [[641, 108], [641, 150]],
  },
  {
    id: "e6", from: "n-human", to: "n-approval", kind: "alternate",
    rule: "on_direction → approval_gate", condition: "Reviewer selects a remediation direction", priority: "1",
    fallback: "Terminate run with human note", threshold: "—",
    points: [[520, 281], [543, 281], [543, 190], [566, 190]],
  },
  {
    id: "e7", from: "n-approval", to: "n-execute", kind: "success",
    rule: "IF decision = approve THEN execute", condition: "Approved by SRE Lead or Incident Commander", priority: "1",
    fallback: "Reject → close run; Request changes → return to remediation", threshold: "Explicit approval",
    points: [[716, 173], [756, 173]],
  },
  {
    id: "e8", from: "n-execute", to: "n-validate", kind: "success",
    rule: "on_execution_result → validate", condition: "Tool returned a result (success or partial)", priority: "1",
    fallback: "Retry execution up to 3 attempts", threshold: "—",
    points: [[830, 196], [830, 240]],
  },
  {
    id: "e9", from: "n-execute", to: "n-execute", kind: "retry", label: "Retry ×3 · exponential backoff",
    rule: "IF error in retryable_set AND attempts < 3 THEN retry with backoff",
    condition: "HTTP 429, temporary network error, tool unavailable, lock contention", priority: "1",
    fallback: "Human escalation after attempt 3", threshold: "3 attempts",
    points: [[904, 160], [928, 160], [928, 130], [830, 130], [830, 150]],
  },
  {
    id: "e10", from: "n-execute", to: "n-escalate", kind: "failure", label: "Retries exhausted",
    rule: "IF attempts >= 3 OR error in non_retryable_set THEN escalate",
    condition: "permission denied, policy denied, invalid target, approval expired, or retry exhaustion",
    priority: "3", fallback: "Dead-letter with correlation ID", threshold: "3 attempts",
    points: [[904, 162], [1027, 162], [1027, 108]],
  },
  {
    id: "e11", from: "n-validate", to: "n-closeout", kind: "success",
    rule: "IF validation = passed THEN closeout", condition: "All required validation tests passed and reconciliation matched",
    priority: "1", fallback: "Retry validation twice, then escalate", threshold: "All required tests",
    points: [[904, 263], [952, 263]],
  },
  {
    id: "e12", from: "n-validate", to: "n-escalate", kind: "failure", label: "Validation failed",
    rule: "IF validation failed AND retries exhausted THEN escalate",
    condition: "Validation retries exhausted", priority: "2", fallback: "Dead-letter", threshold: "2 validation retries",
    points: [[830, 286], [830, 320], [1027, 320], [1027, 108]],
  },
];

export const GRAPH_LEGEND: { kind: NodeKind | "retryPath" | "alternatePath" | "failurePath"; label: string }[] = [
  { kind: "automated", label: "Automated Step" },
  { kind: "agent", label: "Agent Step" },
  { kind: "human", label: "Human Step" },
  { kind: "approval", label: "Approval Gate" },
  { kind: "tool", label: "Tool Execution" },
  { kind: "validation", label: "Validation Step" },
  { kind: "end", label: "End State" },
  { kind: "retryPath", label: "Retry Path" },
  { kind: "alternatePath", label: "Alternate Path" },
  { kind: "failurePath", label: "Failure Path" },
];

/* --------------------------- state & quality panel ------------------------ */

export const STATE_METRICS = [
  { id: "sm-stores", label: "Durable State Stores", value: "3 configured", definition: "Backing stores holding durable workflow execution state for this tenant.", target: "≥ 2 with independent failure domains", current: "Redis, PostgreSQL, Object Storage", gap: "Event Log is read-only replica", why: "State survival determines whether a long-running workflow can resume rather than restart." },
  { id: "sm-checkpoint", label: "Checkpoint Coverage", value: "99.1% of steps", definition: "Percentage of workflow steps that persist sufficient state to safely resume execution after interruption.", target: "99%", current: "99.1%", gap: "Legacy Policy Review v3", why: "Long-running agentic workflows must recover without restarting side-effect-producing operations." },
  { id: "sm-resume", label: "Resume Success", value: "97.8%", definition: "Percentage of interrupted runs that resumed from checkpoint and completed successfully.", target: "97%", current: "97.8%", gap: "Planner + Queue workflows with in-flight queue tasks", why: "Resume is the practical test of durable state; without it recovery becomes a restart." },
  { id: "sm-steps", label: "Average Step Count", value: "8.4 per execution", definition: "Mean number of executed steps per completed run, including retries.", target: "Informational", current: "8.4", gap: "Incident Investigation & Remediation averages 11.2", why: "Step count drives cost, runtime, and the number of recoverable boundaries." },
  { id: "sm-dlq", label: "Dead Letter Queue", value: "Enabled", definition: "Durable holding queue for steps that could not be completed or recovered.", target: "Enabled with triage owner", current: "Enabled · owner RunOps Platform Team", gap: "None", why: "Failures must be inspectable and replayable rather than silently discarded." },
  { id: "sm-queued", label: "Queued Failures", value: "2,314 items", definition: "Current dead-letter depth awaiting operator triage or authorized replay.", target: "< 3,000", current: "2,314", gap: "1,842 items originate from Vulnerability Triage validation timeouts", why: "Queue depth indicates unrecovered work that still requires human resolution." },
];

export const QUALITY_SCORECARD = [
  { id: "q-step", label: "Step Reliability", value: 98.7, definition: "Percentage of steps completing successfully on first execution attempt.", target: "98%", contributors: "Tool steps against ServiceNow are the largest detractor", exceptions: "184 dead-lettered steps in 24h" },
  { id: "q-idem", label: "Idempotency Compliance", value: 99.2, definition: "Percentage of side-effect steps with a registered idempotency key and duplicate detection window.", target: "100%", contributors: "NODE-EXEC-006 on Incident Remediation is non-compliant", exceptions: "1 side-effect step permits retry without a key" },
  { id: "q-retry", label: "Retry Recovery", value: 91.4, definition: "Percentage of failed steps recovered by retry, checkpoint resume, alternate agent, or fallback.", target: "90%", contributors: "Terraform apply timeouts", exceptions: "184 unrecovered in 24h" },
  { id: "q-approval", label: "Approval Latency SLA", value: 96.2, definition: "Percentage of approvals decided within the configured SLA.", target: "95%", contributors: "Production Remediation Approval (5 min SLA)", exceptions: "48 escalations on timeout" },
  { id: "q-output", label: "Output Validation", value: 97.1, definition: "Percentage of step outputs passing schema and outcome validation.", target: "97%", contributors: "Vulnerability patch validation timeouts", exceptions: "394 escalated validations" },
];

export const STATE_MODEL: [string, string][] = [
  ["Run ID", "RUN-882014"],
  ["Workflow version", "v14"],
  ["Current step", "NODE-VAL-007 (Validation Step)"],
  ["Previous step", "NODE-EXEC-006 (Execute Action)"],
  ["Context references", "14 evidence object references (no inline content)"],
  ["Step outputs", "9 outputs stored — 3 inline, 6 by reference"],
  ["Pending approvals", "None (APR-PROD-004 decided 04:18:22Z)"],
  ["Retry count", "1 on NODE-VAL-007"],
  ["Timers", "validation_retry_timer (10s), run_max_runtime (30m)"],
  ["Execution locks", "lock:resource:sql-prod-07 held during execution"],
  ["Correlation ID", "corr-inc-98271"],
  ["State store", "Redis (hot) + Object Log (durable)"],
  ["Checkpoint ID", "ckpt-882014-009"],
  ["State retention", "30 days run state · 365 days audit record"],
];

export const STATE_STORES = [
  { id: "ss-redis", name: "Redis", role: "Hot run state and locks", durability: "AOF + replica", retention: "7 days", workflows: 7 },
  { id: "ss-pg", name: "PostgreSQL", role: "Durable run state and approvals", durability: "Synchronous replica", retention: "30 days", workflows: 7 },
  { id: "ss-obj", name: "Object Storage", role: "Step output payloads by reference", durability: "Cross-region replication", retention: "365 days", workflows: 4 },
  { id: "ss-log", name: "Event Log", role: "Append-only execution trace", durability: "Immutable, sealed", retention: "365 days", workflows: 7 },
];

/* ------------------------------ policy families --------------------------- */

export interface PolicyFamily {
  id: string; category: string; count: number; status: string; tone: "ok" | "warn";
  governs: string; examples: string[]; enforcement: string; conditions: string[]; history: [string, string][];
}

export const POLICY_FAMILIES: PolicyFamily[] = [
  { id: "pf-seq", category: "Sequencing Policies", count: 6, status: "All active", tone: "ok", governs: "The order in which steps may execute, which transitions are legal, and whether parallel branches are permitted.", examples: ["Strict order until declared branch point", "Parallel evidence gathering with required join", "No backward transitions except declared retry paths"], enforcement: "Evaluated on every transition before the next step is scheduled.", conditions: ["workflow.pattern", "step.dependencies", "branch.declared"], history: [["Apr 28, 2026 · A. Ito", "Parallel join semantics clarified"]] },
  { id: "pf-approval", category: "Approval Gates", count: 9, status: "1 pending update", tone: "warn", governs: "Where explicit human authorization is required, who may grant it, within what SLA, and what happens on timeout.", examples: ["Production Remediation Approval — SRE Lead, 5 min SLA", "Emergency Patch Approval — Security Lead, 30 min SLA", "Customer Communication Approval — Support Manager"], enforcement: "Execution is blocked and the run is held in durable state until decided.", conditions: ["environment", "risk_class", "action_type", "data_classification"], history: [["May 09, 2026 · D. Marsh", "Production remediation SLA reduced to 5 minutes"], ["May 16, 2026 · Pending", "Alternate approver expansion under review"]] },
  { id: "pf-retry", category: "Retry / Timeout Policies", count: 7, status: "All active", tone: "ok", governs: "Whether, when, and how a failed step may be attempted again, and how long a step may run.", examples: ["3 attempts with 2s → 10s → 30s backoff", "Non-retryable: permission denied, policy denied, invalid target, approval expired", "Timeout 90s default, 5 min for agent analysis"], enforcement: "Applied by the execution engine on every step failure or timeout.", conditions: ["error_class", "attempt_count", "step.side_effect", "idempotency_key"], history: [["May 09, 2026 · D. Marsh", "Backoff schedule standardized"]] },
  { id: "pf-fallback", category: "Fallback / Escalation Paths", count: 5, status: "All active", tone: "ok", governs: "Alternate agents, tools, and human escalation used when the preferred path is unavailable or invalid.", examples: ["Alternate coworker for investigation", "Human escalation after retry exhaustion", "Defer to next cycle for FinOps tasks"], enforcement: "Each fallback is independently policy-evaluated before use.", conditions: ["primary_unavailable", "retries_exhausted", "policy_denied"], history: [["May 16, 2026 · R. Nair", "Alternate investigator fallback added"]] },
  { id: "pf-tool", category: "Tool Invocation Policies", count: 8, status: "All active", tone: "ok", governs: "Which tools a workflow step may invoke, in which mode, in which environment, and under what approval.", examples: ["Terraform production apply requires human approval", "Datadog is observation-only", "GitHub Actions restricted to approved workflows"], enforcement: "Enforced at the Privileged Action Gateway, not in the agent.", conditions: ["tool.mode", "environment", "operation", "approval_record"], history: [["Apr 30, 2026 · S. Devi", "Terraform moved to approval-gated"]] },
  { id: "pf-state", category: "State Retention Policies", count: 4, status: "All active", tone: "ok", governs: "How long run state, step outputs, and audit records are retained, and in what form.", examples: ["30 days run state", "365 days audit record", "Regulated outputs stored by reference only"], enforcement: "Applied by the state service at checkpoint write and at expiry.", conditions: ["data_classification", "domain", "regulatory_scope"], history: [["Apr 12, 2026 · L. Chen", "Support domain retention set to 180 days"]] },
  { id: "pf-human", category: "Human Role Constraints", count: 6, status: "All active", tone: "ok", governs: "Which human roles may review, approve, delegate, or take ownership of a run.", examples: ["Self-approval prohibited", "Delegation must be explicit and time-boxed", "Incident Commander may assume run ownership"], enforcement: "Checked against identity and access at gate evaluation.", conditions: ["role", "requester_identity", "delegation_window"], history: [["May 09, 2026 · D. Marsh", "Incident Commander alternate approver added"]] },
  { id: "pf-handoff", category: "Agent Handoff Policies", count: 8, status: "All active", tone: "ok", governs: "Which participant may transfer work to which other participant, and under which conditions.", examples: ["Investigation → Remediation requires confidence ≥ 0.70", "Root cause evidence ≥ 0.80", "Risk class ≤ medium"], enforcement: "Evaluated before the destination participant is assigned.", conditions: ["confidence", "evidence_score", "risk_class", "policy_violation"], history: [["May 12, 2026 · S. Devi", "Evidence threshold raised to 0.80"]] },
  { id: "pf-risk", category: "Execution Risk Policies", count: 5, status: "All active", tone: "ok", governs: "How risk class is derived and what additional controls a risk class imposes on execution.", examples: ["High risk requires approval, rollback plan, and validation", "Blast radius ceilings per environment", "Change window enforcement"], enforcement: "Applied at assignment, approval, and execution stages.", conditions: ["blast_radius", "environment", "action_type", "service_criticality"], history: [["Apr 30, 2026 · S. Devi", "Blast radius ceiling introduced for production"]] },
];

/* ------------------------------- tool bindings ---------------------------- */

export interface ToolBinding {
  id: string; bindingId: string; name: string; mode: string; health: Health; sync: string;
  workflows: number; privileged: boolean; owner: string; gateway: string; environment: string;
  auth: string; credential: string; allowed: string[]; blocked: string[]; approval: string;
  riskClass: string; policy: string[]; usedBy: string[]; history: [string, string][];
}

export const TOOL_MODES: Record<string, string> = {
  Observation: "Read telemetry only. The workflow may observe system state but cannot query records or mutate anything.",
  "Read-only": "Query records and configuration. No write, no execution, no side effects.",
  "Direct Invocation": "The workflow may call the tool directly within its declared allowed operations, without a separate approval step.",
  Connector: "Calls are brokered through a managed connector that applies field-level mapping, throttling, and schema validation.",
  "Approval-Gated": "Every mutating invocation requires an explicit approval record before the gateway will execute it.",
  Sandboxed: "Execution occurs in an isolated non-production environment with no access to production data.",
  Simulation: "The call is evaluated and traced but never executed against the target system.",
};

export const TOOL_BINDINGS: ToolBinding[] = [
  {
    id: "tb-snow", bindingId: "TOOL-SNOW-001", name: "ServiceNow", mode: "Direct Invocation", health: "Healthy", sync: "2h ago",
    workflows: 8, privileged: false, owner: "IT Service Management", gateway: "Managed connector gateway", environment: "Production",
    auth: "Workload Identity", credential: "Managed reference",
    allowed: ["create incident", "update incident", "create task", "attach evidence", "read CMDB"],
    blocked: ["delete records", "modify workflow rules", "change ACLs"],
    approval: "Not required for non-privileged record operations", riskClass: "Low",
    policy: ["Field-level mapping enforced", "Rate limit 40 calls/second", "Audit record for every write"],
    usedBy: ["Incident Investigation & Remediation", "SRE Change Risk Review", "Customer Escalation Resolution"],
    history: [["May 14, 2026 · L. Chen", "Evidence attachment operation enabled"]],
  },
  {
    id: "tb-dc", bindingId: "TOOL-DC-002", name: "Duck Creek", mode: "Connector", health: "Healthy", sync: "1h ago",
    workflows: 5, privileged: false, owner: "Policy Administration", gateway: "Managed connector gateway", environment: "Production",
    auth: "Workload Identity", credential: "Managed reference",
    allowed: ["read policy", "read submission", "write endorsement (approved)", "read schedule"],
    blocked: ["cancel policy", "modify rating tables", "bulk export"],
    approval: "Required for endorsement writes", riskClass: "Medium",
    policy: ["Regulated data handled by reference", "Write operations require approval record", "Jurisdiction constraints enforced"],
    usedBy: ["Underwriting Intake & Triage", "Policy Change Review", "Customer Escalation Resolution"],
    history: [["Apr 22, 2026 · R. Nair", "Endorsement write scope narrowed"]],
  },
  {
    id: "tb-aws", bindingId: "TOOL-AWS-003", name: "AWS", mode: "Direct Invocation", health: "Healthy", sync: "45m ago",
    workflows: 7, privileged: true, owner: "Platform Engineering", gateway: "Privileged Action Gateway", environment: "Production",
    auth: "Workload Identity (STS assume-role)", credential: "Managed reference",
    allowed: ["describe resources", "modify EBS volume (approved)", "scale ASG (approved)", "read CloudWatch"],
    blocked: ["delete resources", "modify IAM policy", "disable logging", "modify security groups"],
    approval: "Required for any mutating operation in production", riskClass: "High",
    policy: ["Maximum blast radius", "Allowed resource types", "Environment constraints", "Change window", "Required rollback plan"],
    usedBy: ["Incident Investigation & Remediation", "Cloud FinOps Optimization Cycle", "Vulnerability Triage & Patch Validation"],
    history: [["Apr 30, 2026 · S. Devi", "IAM operations explicitly blocked"]],
  },
  {
    id: "tb-azure", bindingId: "TOOL-AZ-004", name: "Azure", mode: "Connector", health: "Healthy", sync: "50m ago",
    workflows: 6, privileged: true, owner: "Platform Engineering", gateway: "Privileged Action Gateway", environment: "Production",
    auth: "Workload Identity", credential: "Managed reference",
    allowed: ["read resource graph", "resize VM (approved)", "modify reservation (approved)"],
    blocked: ["delete resource group", "modify RBAC", "disable diagnostics"],
    approval: "Required for mutating operations", riskClass: "High",
    policy: ["Subscription scope restriction", "Change window", "Rollback plan required"],
    usedBy: ["Cloud FinOps Optimization Cycle"],
    history: [["May 06, 2026 · K. Osei", "Reservation operations added"]],
  },
  {
    id: "tb-dd", bindingId: "TOOL-DD-005", name: "Datadog", mode: "Observation", health: "Healthy", sync: "1m ago",
    workflows: 12, privileged: false, owner: "Observability Engineering", gateway: "Read gateway", environment: "Production",
    auth: "Workload Identity", credential: "Managed reference",
    allowed: ["query metrics", "query logs", "read monitors", "read SLOs"],
    blocked: ["mute monitors", "modify dashboards", "delete data"],
    approval: "Not applicable — observation only", riskClass: "Low",
    policy: ["Query rate limits", "No mutation surface exposed to workflows"],
    usedBy: ["Incident Investigation & Remediation", "Cloud FinOps Optimization Cycle", "SRE Change Risk Review"],
    history: [["Apr 10, 2026 · A. Ito", "SLO read scope added"]],
  },
  {
    id: "tb-gha", bindingId: "TOOL-GHA-006", name: "GitHub Actions", mode: "Direct Invocation", health: "Healthy", sync: "2h ago",
    workflows: 4, privileged: true, owner: "Developer Platform", gateway: "Privileged Action Gateway", environment: "Production",
    auth: "Workload Identity (OIDC)", credential: "Managed reference",
    allowed: ["dispatch approved workflow", "read run status", "read artifacts"],
    blocked: ["modify workflow definitions", "manage secrets", "delete runs"],
    approval: "Required for deployment workflows", riskClass: "High",
    policy: ["Allow-listed workflow IDs only", "Branch protection respected", "No secret access from orchestration"],
    usedBy: ["SRE Change Risk Review", "Vulnerability Triage & Patch Validation"],
    history: [["May 02, 2026 · S. Devi", "Allow-list narrowed to 9 workflow IDs"]],
  },
  {
    id: "tb-tf", bindingId: "TOOL-TF-001", name: "Terraform", mode: "Approval-Gated", health: "Healthy", sync: "2h ago",
    workflows: 3, privileged: true, owner: "Platform Engineering", gateway: "Privileged Action Gateway", environment: "Production",
    auth: "Workload Identity", credential: "Managed reference",
    allowed: ["plan", "validate", "apply approved plan", "rollback approved change"],
    blocked: ["destroy unapproved resources", "modify identity policy", "disable logging"],
    approval: "Human approval required for production apply", riskClass: "High",
    policy: ["Maximum blast radius", "Allowed resource types", "Environment constraints", "Change window", "Required rollback plan"],
    usedBy: ["Incident Investigation & Remediation", "Cloud FinOps Optimization Cycle", "SRE Change Risk Review"],
    history: [["Apr 30, 2026 · S. Devi", "Binding moved to approval-gated mode"], ["Mar 18, 2026 · R. Nair", "Destroy operations permanently blocked"]],
  },
];

/* --------------------------- handoffs and approvals ----------------------- */

export const HANDOFFS = [
  {
    id: "ho-inv-rem", source: "Investigation Agent", destination: "Remediation Agent", kind: "Agent → Agent",
    conditions: ["confidence >= 0.70", "root cause evidence >= 0.80", "policy violation = false", "incident risk class <= medium"],
    otherwise: "Human SRE Review",
    inputContract: "Likely cause, affected services, evidence references, risk class",
    outputContract: "Proposed action, expected impact, rollback plan, validation plan",
    reason: "Investigation complete with sufficient confidence to propose remediation",
    authorization: "Handoff policy HP-RUNOPS-002", timeout: "3 minutes", escalation: "Incident Commander",
    rejection: "Return to investigation with reviewer notes",
    carriedState: "Evidence references, hypotheses, confidence, correlation ID",
    contextRefresh: "Telemetry re-read required if older than 5 minutes",
  },
  {
    id: "ho-rem-human", source: "Remediation Agent", destination: "SRE Lead", kind: "Agent → Human",
    conditions: ["environment = production", "action = configuration_change"],
    otherwise: "Not applicable — approval always required in production",
    inputContract: "Proposed action, impact, risk, evidence, rollback, validation plan",
    outputContract: "Decision, approver identity, reason, timestamp, evidence viewed",
    reason: "Production execution policy requires accountable human authorization",
    authorization: "APR-PROD-004", timeout: "5 minutes", escalation: "Incident Commander",
    rejection: "Close run with reason, no execution",
    carriedState: "Full proposal and evidence pack", contextRefresh: "Not required",
  },
  {
    id: "ho-human-agent", source: "SRE Lead", destination: "Remediation Agent", kind: "Human → Agent",
    conditions: ["decision = request_changes", "reviewer supplies direction"],
    otherwise: "Terminate run",
    inputContract: "Reviewer direction, selected hypothesis, constraints",
    outputContract: "Revised proposal", reason: "Human redirection of an agent proposal",
    authorization: "Human role constraint policy", timeout: "3 minutes", escalation: "Incident Commander",
    rejection: "Terminate run with audit note", carriedState: "Original proposal plus reviewer notes",
    contextRefresh: "Required — evidence re-validated before revision",
  },
  {
    id: "ho-tool-agent", source: "Terraform", destination: "Validation Coworker", kind: "Tool → Agent",
    conditions: ["execution result received", "applied plan reference present"],
    otherwise: "Retry execution or escalate",
    inputContract: "Execution result, applied plan reference, resource state",
    outputContract: "Validation status, test results, reconciliation status",
    reason: "Execution complete — outcome must be verified before completion",
    authorization: "Outcome validation policy", timeout: "60 seconds", escalation: "Human escalation",
    rejection: "Escalate to Incident Commander", carriedState: "Execution record and correlation ID",
    contextRefresh: "Required — post-change telemetry must be re-read",
  },
  {
    id: "ho-agent-tool", source: "Execution service", destination: "Terraform", kind: "Agent → Tool",
    conditions: ["approval record present", "change window open", "rollback plan present", "blast radius within ceiling"],
    otherwise: "Block execution and escalate",
    inputContract: "Approved action, target resource, approval record, rollback plan",
    outputContract: "Execution result, applied plan reference, duration",
    reason: "Approved remediation must be executed through the governed gateway",
    authorization: "TOOL-TF-001 approval-gated binding", timeout: "90 seconds", escalation: "Human escalation after 3 attempts",
    rejection: "Dead-letter with correlation ID", carriedState: "Approval record, idempotency key (when configured)",
    contextRefresh: "Not required",
  },
];

export const APPROVAL_POLICY = {
  id: "APR-PROD-004", name: "Production Remediation Approval",
  role: "SRE Lead", alternate: "Incident Commander", sla: "5 minutes", type: "Explicit",
  inputs: ["Proposed action", "Expected impact", "Risk", "Evidence", "Rollback", "Affected services", "Validation plan"],
  decisions: ["Approve", "Reject", "Request Changes", "Escalate"],
  timeout: "Escalate to Incident Commander — no auto-approval after timeout",
  audit: [
    ["Approver", "D. Marsh (SRE Lead)"],
    ["Decision", "Approve"],
    ["Timestamp", "2026-05-16 04:18:22 UTC"],
    ["Reason", "Root cause confirmed, blast radius limited to one volume, rollback validated"],
    ["Evidence viewed", "7 of 7 objects opened"],
    ["Workflow state", "RUN-882014 · step NODE-APR-005 · lock held"],
  ] as [string, string][],
};

/* ------------------------- retry and idempotency engineering -------------- */

export const RETRY_MODEL = {
  step: "Execute Action (NODE-EXEC-006)",
  maxRetries: "3",
  backoff: "2s → 10s → 30s",
  retryable: ["HTTP 429", "temporary network error", "tool unavailable", "lock contention"],
  nonRetryable: ["permission denied", "policy denied", "invalid target", "approval expired"],
  alternateAgent: "Not permitted for privileged execution",
  alternateTool: "Not permitted without approval",
  resume: "Checkpoint resume from ckpt-882014-008",
  dlq: "Enabled — entry written with correlation ID",
  escalation: "Human Escalation (Incident Commander)",
  termination: "Safe termination after escalation acknowledgement",
  note: "All retries preserve the original correlation ID so duplicate detection and audit reconstruction remain valid.",
};

export const IDEMPOTENCY_MODEL = {
  key: "workflow-run-id + target-resource + remediation-id",
  window: "60 minutes",
  replay: "Blocked unless explicitly authorized",
  sideEffect: "Mutating — infrastructure configuration change",
  lock: "lock:resource:sql-prod-07",
  correlation: "corr-inc-98271",
  why: "An agent retry is indistinguishable from a new request at the target system. Without an idempotency key, a retried apply can duplicate a side-effect-producing operation — a second volume expansion, a second ticket, a second scaling event.",
};

export const PATTERNS = [
  { id: "pt-det", name: "Deterministic Flow", detail: "Known sequence executed in declared order.", example: "Policy Change Review", freedom: "No dynamic steps" },
  { id: "pt-cond", name: "Conditional Flow", detail: "Known graph with branch logic evaluated at runtime.", example: "Incident Remediation", freedom: "Branches only, no new steps" },
  { id: "pt-plan", name: "Planner-Guided Flow", detail: "Planner decomposes an objective within approved step templates.", example: "Complex Evidence Investigation", freedom: "Max 4 dynamic steps" },
  { id: "pt-queue", name: "Queue-Orchestrated", detail: "Tasks distributed across digital coworkers with weighted assignment.", example: "Cloud FinOps optimization", freedom: "Bounded queue depth and concurrency" },
];

export const PLANNING_BOUNDS: [string, string][] = [
  ["Allowed steps", "12"],
  ["Maximum dynamic steps", "4"],
  ["Allowed coworker roles", "3"],
  ["Allowed tools", "5"],
  ["Human approval required for", "Execution"],
];

export const CONCURRENCY: [string, string][] = [
  ["Maximum concurrent workflows", "120 per tenant"],
  ["Maximum concurrent steps", "480 per tenant"],
  ["Per-agent concurrency", "8 in-flight"],
  ["Per-tool concurrency", "12 (Terraform: 2)"],
  ["Rate limits", "40 tool calls/second per system"],
  ["Queue priorities", "P1 → P4 weighted 8/4/2/1"],
];

export const PARALLEL_EXAMPLE = {
  name: "Incident Investigation — parallel evidence gathering",
  branches: ["Logs", "Metrics", "Recent Changes", "Topology"],
  join: "Wait for all required",
  timeout: "30 seconds",
  continueIf: "3 of 4 complete and minimum evidence score reached",
};

/* -------------------------------- evaluation ------------------------------ */

export const EVALUATION_METRICS: [string, string][] = [
  ["Completion Rate", "98.6%"], ["Step Success", "98.7%"], ["Recovery Rate", "91.4%"],
  ["Retry Rate", "2.4%"], ["Average Runtime", "9.4 min"], ["Human Intervention Rate", "12.6%"],
  ["Approval Delay", "2m 14s median"], ["Branch Accuracy", "97.8%"], ["Tool Failure Rate", "1.3%"],
  ["State Recovery", "97.8%"], ["Policy Compliance", "99.4%"], ["Outcome Validation", "97.1%"],
  ["Cost per Run", "$1.87"], ["Tokens per Run", "184K"], ["Digital Coworker Utilization", "63%"],
];

export const EVALUATION_SUMMARY = {
  workflow: "Incident Investigation & Remediation",
  rows: [["Completion", "98.6"], ["Recovery", "91.4"], ["Approval SLA", "96.2"], ["Validation", "97.1"], ["Policy Compliance", "99.4"]] as [string, string][],
  date: "May 16, 2026", sample: "912 runs over 30 days",
};

/* ------------------------------ run explanation --------------------------- */

export const EXPLANATION = {
  run: "RUN-882014", workflow: "Incident Investigation & Remediation",
  trigger: "Priority Alert", incident: "INC-98271", version: "v14", correlation: "corr-inc-98271",
  steps: [
    { n: 1, title: "Trigger accepted", detail: "Reason: Priority >= P2", tone: "ok" },
    { n: 2, title: "Context loaded", detail: "Evidence: 14 objects (references only)", tone: "ok" },
    { n: 3, title: "Investigation Agent selected", detail: "Reason: Role match + domain match + availability", tone: "ok" },
    { n: 4, title: "Investigation confidence 0.76 — branch to remediation path", detail: "Reason: confidence >= 0.70 threshold and evidence score 0.84", tone: "ok" },
    { n: 5, title: "Remediation proposal created", detail: "Risk: Medium · rollback plan attached", tone: "ok" },
    { n: 6, title: "Human approval required", detail: "Reason: production execution policy (APR-PROD-004)", tone: "warn" },
    { n: 7, title: "Approved by SRE Lead", detail: "D. Marsh · 2m 14s · 7 of 7 evidence objects viewed", tone: "ok" },
    { n: 8, title: "Terraform action executed", detail: "Result: Success · applied plan ref plan-4471", tone: "ok" },
    { n: 9, title: "Validation failed initial check", detail: "Error rate still above SLI threshold at T+15s", tone: "warn" },
    { n: 10, title: "Retry after 10 seconds", detail: "Validation retry 1 of 2 · correlation ID preserved", tone: "warn" },
    { n: 11, title: "Validation passed", detail: "All required tests passed · reconciliation matched", tone: "ok" },
    { n: 12, title: "Workflow completed", detail: "Outcome: Service restored · audit record sealed", tone: "ok" },
  ],
};

/* ------------------------------- simulation ------------------------------- */

export const SIM_SCENARIOS = [
  { id: "happy", label: "Happy Path" },
  { id: "agent-fail", label: "Agent Failure" },
  { id: "model-timeout", label: "Model Timeout" },
  { id: "tool-fail", label: "Tool Failure" },
  { id: "approval-timeout", label: "Approval Timeout" },
  { id: "low-confidence", label: "Low Confidence" },
  { id: "policy-denial", label: "Policy Denial" },
  { id: "duplicate", label: "Duplicate Trigger" },
  { id: "state-fail", label: "State Store Failure" },
  { id: "fallback-agent", label: "Fallback Agent" },
  { id: "validation-fail", label: "Validation Failure" },
];

export interface SimStep { step: string; state: string; branch: string; policy: string; tone: "ok" | "warn" | "bad" }

export const SIM_RUNS: Record<string, SimStep[]> = {
  happy: [
    { step: "Trigger accepted (P1 alert)", state: "run created · corr-sim-001", branch: "—", policy: "Trigger authorization passed", tone: "ok" },
    { step: "Context loaded", state: "checkpoint ckpt-001", branch: "evidence sufficiency 0.88", policy: "Evidence access policy passed", tone: "ok" },
    { step: "Investigation Agent executed", state: "checkpoint ckpt-002", branch: "confidence 0.81 → remediation", policy: "No direct remediation enforced", tone: "ok" },
    { step: "Remediation proposal created", state: "checkpoint ckpt-003", branch: "risk medium", policy: "Rollback plan present", tone: "ok" },
    { step: "Approval requested", state: "run held · lock acquired", branch: "—", policy: "APR-PROD-004 applied", tone: "warn" },
    { step: "Approved by SRE Lead (1m 42s)", state: "checkpoint ckpt-004", branch: "approve", policy: "Self-approval check passed", tone: "ok" },
    { step: "Terraform apply executed", state: "checkpoint ckpt-005", branch: "—", policy: "Approval record verified at gateway", tone: "ok" },
    { step: "Validation passed", state: "checkpoint ckpt-006", branch: "validation passed", policy: "Completion policy satisfied", tone: "ok" },
    { step: "Run completed", state: "state sealed", branch: "complete", policy: "Audit record written", tone: "ok" },
  ],
  "agent-fail": [
    { step: "Trigger accepted", state: "run created", branch: "—", policy: "Passed", tone: "ok" },
    { step: "Context loaded", state: "checkpoint ckpt-001", branch: "—", policy: "Passed", tone: "ok" },
    { step: "Investigation Agent failed (runtime error)", state: "checkpoint retained", branch: "error class: retryable", policy: "Retry policy applied", tone: "bad" },
    { step: "Retry 1 after 2s — failed again", state: "retry_count 1", branch: "—", policy: "Retry policy applied", tone: "warn" },
    { step: "Alternate coworker assigned", state: "checkpoint ckpt-002", branch: "fallback agent", policy: "Assignment policy — alternate eligible", tone: "warn" },
    { step: "Investigation completed by General RunOps Investigator", state: "checkpoint ckpt-003", branch: "confidence 0.74", policy: "Passed", tone: "ok" },
    { step: "Run continues on remediation path", state: "resumed", branch: "remediation", policy: "Passed", tone: "ok" },
  ],
  "model-timeout": [
    { step: "Investigation Agent invoked", state: "checkpoint ckpt-002", branch: "—", policy: "Timeout 5 minutes", tone: "ok" },
    { step: "Model provider timeout at 300s", state: "no state loss", branch: "error class: retryable", policy: "Timeout policy applied", tone: "bad" },
    { step: "Model routing fallback engaged", state: "retry_count 1", branch: "fallback model", policy: "Delegated to LLM + Model Routing plane", tone: "warn" },
    { step: "Investigation completed on fallback model", state: "checkpoint ckpt-003", branch: "confidence 0.72", policy: "Passed", tone: "ok" },
  ],
  "tool-fail": [
    { step: "Terraform apply invoked", state: "checkpoint ckpt-005", branch: "—", policy: "Approval verified", tone: "ok" },
    { step: "Tool returned 429 rate limited", state: "state preserved", branch: "error class: retryable", policy: "Retry policy 3 attempts", tone: "bad" },
    { step: "Retry 1 after 2s — 429", state: "retry_count 1", branch: "—", policy: "Idempotency key checked", tone: "warn" },
    { step: "Retry 2 after 10s — success", state: "checkpoint ckpt-006", branch: "—", policy: "Duplicate detection passed", tone: "ok" },
    { step: "Validation passed, run completed", state: "state sealed", branch: "complete", policy: "Completion policy satisfied", tone: "ok" },
  ],
  "approval-timeout": [
    { step: "Approval requested from SRE Lead", state: "run held · lock held", branch: "—", policy: "APR-PROD-004 · SLA 5 min", tone: "warn" },
    { step: "SLA exceeded at 5m 00s", state: "run still held", branch: "timeout", policy: "No auto-approval permitted", tone: "bad" },
    { step: "Escalated to Incident Commander", state: "approver reassigned", branch: "escalate", policy: "Alternate approver policy", tone: "warn" },
    { step: "Approved by Incident Commander", state: "checkpoint ckpt-004", branch: "approve", policy: "Audit records both approvers", tone: "ok" },
  ],
  "low-confidence": [
    { step: "Investigation Agent completed", state: "checkpoint ckpt-002", branch: "confidence 0.58", policy: "Branch rule evaluated", tone: "warn" },
    { step: "Branch: confidence < 0.60 → alternate agent", state: "no execution attempted", branch: "alternate agent", policy: "Handoff policy blocked remediation", tone: "warn" },
    { step: "Alternate investigator confidence 0.64", state: "checkpoint ckpt-003", branch: "human review band", policy: "0.60–0.85 → human review", tone: "warn" },
    { step: "Human Review requested (SRE Lead)", state: "run held", branch: "human review", policy: "Low-confidence review policy", tone: "warn" },
  ],
  "policy-denial": [
    { step: "Remediation proposal created", state: "checkpoint ckpt-003", branch: "risk high", policy: "Blast radius exceeds production ceiling", tone: "warn" },
    { step: "Policy engine denied execution path", state: "no execution attempted", branch: "stop and escalate", policy: "Execution risk policy denied", tone: "bad" },
    { step: "Run escalated to Incident Commander", state: "state frozen", branch: "escalate", policy: "Escalation policy applied", tone: "warn" },
    { step: "Run terminated safely with audit note", state: "state sealed", branch: "terminate", policy: "Safe termination", tone: "ok" },
  ],
  duplicate: [
    { step: "Second alert received for INC-98271", state: "no new run created", branch: "—", policy: "Dedup window 15 minutes", tone: "warn" },
    { step: "Duplicate suppressed and attached to existing run", state: "corr-inc-98271 reused", branch: "suppress", policy: "Correlation key matched", tone: "ok" },
    { step: "Original run continues unaffected", state: "checkpoint unchanged", branch: "—", policy: "No duplicate side effects", tone: "ok" },
  ],
  "state-fail": [
    { step: "Redis hot state unavailable", state: "write failed", branch: "error class: infrastructure", policy: "State store failover policy", tone: "bad" },
    { step: "Failover to PostgreSQL durable store", state: "checkpoint ckpt-005 recovered", branch: "failover", policy: "Durable state policy", tone: "warn" },
    { step: "Run resumed from last checkpoint", state: "resume successful", branch: "resume", policy: "No step re-executed with side effects", tone: "ok" },
    { step: "Run completed", state: "state sealed", branch: "complete", policy: "Completion policy satisfied", tone: "ok" },
  ],
  "fallback-agent": [
    { step: "Primary investigation coworker at concurrency limit", state: "assignment deferred 400ms", branch: "—", policy: "Per-agent concurrency 8", tone: "warn" },
    { step: "Alternate coworker assigned", state: "checkpoint ckpt-002", branch: "fallback agent", policy: "Alternate eligibility verified", tone: "warn" },
    { step: "Run proceeds normally", state: "checkpoint ckpt-003", branch: "remediation", policy: "Passed", tone: "ok" },
  ],
  "validation-fail": [
    { step: "Terraform apply succeeded", state: "checkpoint ckpt-005", branch: "—", policy: "Approval verified", tone: "ok" },
    { step: "Validation failed — error rate above SLI", state: "state preserved", branch: "validation failed", policy: "Validation retry policy", tone: "bad" },
    { step: "Retry validation after 10s — failed", state: "retry_count 2", branch: "—", policy: "Retries exhausted", tone: "bad" },
    { step: "Escalated to Incident Commander with rollback plan", state: "state frozen", branch: "escalate", policy: "No auto-rollback without approval", tone: "warn" },
  ],
};

/* ----------------------------- errors & conflicts ------------------------- */

export const CONFIG_ERRORS = [
  { id: "err-idem", severity: "warn", title: "Missing idempotency on side-effect step", workflow: "Incident Investigation & Remediation", failed: "NODE-EXEC-006 permits automatic retry but does not define an idempotency key.", why: "A retry may duplicate a side-effect-producing operation such as a second volume expansion.", action: "Configure idempotency or disable automatic retry for this step." },
  { id: "err-fallback", severity: "warn", title: "Missing fallback agent", workflow: "Vulnerability Triage & Patch Validation", failed: "NODE-VAL-004 has no alternate coworker configured.", why: "Validation timeouts currently escalate directly to humans, raising intervention rate.", action: "Assign an alternate validation coworker or platform validation service." },
  { id: "err-timeout", severity: "warn", title: "Timeout conflict", workflow: "Vulnerability Triage & Patch Validation", failed: "Step timeout (90s) is shorter than the tool's observed p95 (112s).", why: "Steps time out before the tool can legitimately respond, consuming retries.", action: "Raise the step timeout or reduce the tool operation scope." },
  { id: "err-approver", severity: "info", title: "No authorized approver during window", workflow: "Cloud FinOps Optimization Cycle", failed: "Approval gate has a single eligible role with no coverage between 22:00 and 06:00 UTC.", why: "Runs stall until the next business day, breaching the optimization cycle window.", action: "Add an alternate approver role or move the cycle inside coverage hours." },
];

export const CONFLICT = {
  title: "Workflow Configuration Conflict",
  workflow: "Incident Investigation & Remediation",
  issue: "Production remediation step permits retry but does not currently define an idempotency key.",
  impact: "A retry may duplicate a side-effect-producing operation.",
  recommended: "Configure idempotency or disable automatic retry for this step.",
};

/* ------------------------------ control plane ----------------------------- */

export const CONTROL_PLANE_DEFINES = [
  "What workflows exist",
  "Which digital coworkers participate",
  "How work is sequenced",
  "How tasks are assigned",
  "How state is persisted",
  "How handoffs happen",
  "Where approvals are required",
  "How tools are invoked",
  "How failures recover",
  "How escalation occurs",
  "How outcomes are validated",
];

export const CONTROL_PLANE_FLOW = [
  "Tenant Orchestration Control Plane",
  "Workflow Definition",
  "Runtime Workflow State",
  "Agent / Tool / Human Execution",
  "Validation",
  "Outcome",
];

export const NOT_GOVERNED_HERE = [
  ["Enterprise evidence", "Context / Evidence Layer"],
  ["Model selection", "LLM + Model Routing"],
  ["Individual digital coworker behavior", "Agents & Coworkers"],
  ["Business decision policy", "Reasoning / Decisioning"],
] as [string, string][];

export const SERVICE_CONTRACT: [string, string][] = [
  ["Coordinated", "Every participant executes within a defined workflow."],
  ["Stateful", "Execution state can be persisted and recovered."],
  ["Policy-bound", "Transitions, tools, agents, and approvals follow tenant policy."],
  ["Resilient", "Failures produce controlled retry, fallback, escalation, or termination."],
  ["Traceable", "Every step, decision, handoff, and execution is captured."],
  ["Bounded", "Agents cannot create uncontrolled workflow paths or tool execution."],
  ["Recoverable", "Checkpoints and idempotency enable safe continuation."],
  ["Validated", "Workflow completion requires configured outcome validation."],
  ["Explainable", "Administrators can reconstruct why each path was selected."],
];

export const ROLES: [string, string][] = [
  ["Platform Admin", "Full configuration authority across the orchestration plane."],
  ["Agent Engineer", "Agent assignment, alternate participants, and capability requirements."],
  ["Workflow Engineer", "Workflow graph, transitions, and branch logic."],
  ["Security Admin", "Execution authority, tool policies, and privileged gateways."],
  ["RunOps Admin", "Operational thresholds, retries, timeouts, and escalation."],
  ["Approval Policy Admin", "Human gates, roles, SLAs, and delegation."],
  ["Auditor", "Read-only access to configuration and history."],
  ["Read Only", "View configuration without modification rights."],
];

export const DEFINITIONS: [string, string][] = [
  ["Orchestration", "Governed coordination of digital coworkers, tools, models, humans, policies, and workflow state required to achieve an objective."],
  ["Workflow", "Versioned execution graph defining allowable steps, transitions, participants, policies, and completion conditions."],
  ["Handoff", "Controlled transfer of work and state from one participant to another."],
  ["Durable State", "Persisted execution state required to continue or resume a workflow."],
  ["Checkpoint", "Known recoverable execution point storing sufficient state to safely resume."],
  ["Branch", "Transition selected based on evaluated conditions."],
  ["Approval Gate", "Workflow point requiring explicitly authorized human or policy approval."],
  ["Tool Binding", "Governed association between an orchestration step and an executable enterprise tool or service."],
  ["Idempotency", "Guarantee that repeated execution does not create unintended duplicate side effects."],
  ["Retry Policy", "Rules determining whether, when, and how a failed step may be attempted again."],
  ["Fallback", "Alternate agent, tool, route, or execution path used when the preferred path is unavailable or invalid."],
  ["Completion Policy", "Conditions required before a workflow can be declared successfully finished."],
];

/* --------------------------------- filters -------------------------------- */

export const FILTER_DEFS = [
  { id: "domain", label: "Domain", options: ["Insurance", "FinOps", "RunOps", "SRE", "Security", "Support"] },
  { id: "pattern", label: "Workflow Type", options: ["Deterministic", "Conditional", "Planner-Guided"] },
  { id: "status", label: "Status", options: ["Healthy", "Degraded", "Draft"] },
  { id: "trigger", label: "Trigger", options: ["Submission Received", "Policy Update Event", "Daily Schedule", "Priority Alert", "Change Request", "Scan Complete", "Escalation Created"] },
  { id: "risk", label: "Risk Class", options: ["Low", "Medium", "High"] },
  { id: "approval", label: "Approval Required", options: ["Yes", "No"] },
  { id: "tool", label: "Tool", options: ["ServiceNow", "Duck Creek", "AWS", "Azure", "Datadog", "GitHub Actions", "Terraform"] },
  { id: "coworker", label: "Digital Coworker", options: ["Incident Investigation Agent", "Remediation Agent", "Validation Coworker", "FinOps Analyst Coworker", "Policy Review Coworker"] },
  { id: "owner", label: "Owner", options: ["RunOps Platform Team", "Security Engineering", "Cloud FinOps Team", "Underwriting Platform Team", "SRE Governance", "Policy Administration Team", "Customer Operations"] },
];

export const WORKFLOW_TOTAL = 24;
export const DRAFT_TOTAL = 3;
export const COWORKER_TOTAL = 31;
export const POLICY_TOTAL = 18;
