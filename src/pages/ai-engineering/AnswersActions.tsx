import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Target, AlertTriangle, CheckCircle2, Settings, Brain, Wrench, Play,
  ShieldCheck, Database, BarChart3, ArrowRight, Lock, GitBranch,
  RefreshCcw, Users, FileText, Activity, Boxes, Zap, AlertCircle,
  Calendar, Phone, ShoppingCart, FileSignature, Server, Cloud,
} from "lucide-react";

/* =====================================================================
   DATA MODEL
===================================================================== */

type ArchNode = {
  id: string;
  num: number;
  title: string;
  color: string; // tailwind text color
  bg: string;
  icon: any;
  responsibilities: string[];
  flow: string[];
  highlight?: boolean;
  drawer: DrawerContent;
};

type DrawerContent = {
  summary: { what: string; why: string; svInvestment: string; googleAngle: string };
  problem: string;
  architecture: { layer: string; nodes: string[]; flows: string }[];
  patterns: { name: string; desc: string; tradeoffs: string; usage: string }[];
  risks: { risk: string; likelihood: "Low" | "Med" | "High"; impact: "Low" | "Med" | "High"; mitigation: string }[];
  telemetry: { metric: string; signal: string; threshold: string }[];
  security: string[];
  questions: string[];
  patternsDeepDive?: { topic: string; bullets: string[] }[];
};

const ARCH_NODES: ArchNode[] = [
  {
    id: "intent",
    num: 1,
    title: "Intent & Planning",
    color: "text-blue-700",
    bg: "from-blue-50 to-white border-blue-200",
    icon: Target,
    responsibilities: [
      "Goal understanding",
      "Intent classification",
      "Constraint extraction",
      "Success criteria definition",
      "Task decomposition",
    ],
    flow: ["User Goal", "Planner", "Execution Plan"],
    drawer: {
      summary: {
        what: "The planner converts an ambiguous natural-language goal into a verifiable, executable plan with explicit success criteria and constraints.",
        why: "Without a deterministic plan, downstream tool calls become exploratory; recovery and verification are impossible because there is nothing to compare against.",
        svInvestment: "ReAct, Tree-of-Thoughts, LATS, and DSPy-style compilers are all attempts to make planning auditable. OpenAI Operator, Mariner, and Anthropic computer-use ship explicit planner/executor splits.",
        googleAngle: "Google Search now invests heavily in 'fan-out' query planning where the model decomposes a single answer into sub-tasks executed in parallel, then merged with verification.",
      },
      problem: "Enterprises ask agents to 'book a flight', 'provision an account', or 'reconcile this invoice'. Without intent classification and constraint extraction the agent over- or under-acts, leading to silent failure and compliance exposure.",
      architecture: [
        { layer: "Input", nodes: ["User Utterance", "Session Context", "Policy Bundle"], flows: "→ Intent Classifier" },
        { layer: "Planning", nodes: ["Goal Decomposer", "Constraint Extractor", "Success Criteria Builder"], flows: "→ Plan Validator" },
        { layer: "Output", nodes: ["Typed Plan DAG", "Pre-flight Checks", "Budget Envelope"], flows: "→ Tool Selection" },
      ],
      patterns: [
        { name: "ReAct", desc: "Interleaved reasoning + acting with thought traces.", tradeoffs: "Lower latency cost than ToT; weaker on long horizons.", usage: "Short 1-3 step workflows." },
        { name: "Tree of Thoughts", desc: "Branching search over candidate plans with self-evaluation.", tradeoffs: "Higher token spend; better recovery from dead-ends.", usage: "Multi-step planning with reversible exploration." },
        { name: "Planner/Executor split", desc: "Frozen plan compiled once, executor enforces it.", tradeoffs: "Less adaptive; far more auditable.", usage: "Regulated domains (finance, healthcare)." },
      ],
      risks: [
        { risk: "Ambiguous goal accepted", likelihood: "High", impact: "Med", mitigation: "Confidence-gated clarification turn." },
        { risk: "Constraint dropped silently", likelihood: "Med", impact: "High", mitigation: "Structured constraint schema + plan validator." },
        { risk: "Plan exceeds token budget", likelihood: "Med", impact: "Med", mitigation: "Budget envelope + recursive summarization." },
      ],
      telemetry: [
        { metric: "Plan validity rate", signal: "% plans passing validator before execution", threshold: ">98%" },
        { metric: "Clarification rate", signal: "Clarifications / goal", threshold: "<0.3" },
        { metric: "Plan depth", signal: "p95 nodes/plan", threshold: "<12" },
      ],
      security: ["Strip PII before LLM call when classifier is sufficient.", "Sign plans with HMAC so executor can detect tampering.", "Scope policy bundle to tenant + user."],
      questions: [
        "How do you guarantee a plan satisfies declared constraints before execution?",
        "What happens when the planner is uncertain — block, ask, or proceed?",
        "How do you bound recursive replanning?",
        "Is the plan a first-class auditable artifact?",
      ],
    },
  },
  {
    id: "tools",
    num: 2,
    title: "Tool Selection",
    color: "text-violet-700",
    bg: "from-violet-50 to-white border-violet-200",
    icon: Wrench,
    responsibilities: ["Tool discovery", "Tool ranking", "Capability matching", "Schema validation"],
    flow: ["Agent", "MCP Registry", "Tool Discovery", "Tool Invocation"],
    drawer: {
      summary: {
        what: "A capability-aware registry that maps plan steps to typed, versioned tools and returns the smallest viable tool set per step.",
        why: "An agent loaded with 200 tools degrades quickly. Selection is the lever that controls cost, latency, and blast radius.",
        svInvestment: "MCP standardizes tool descriptors. OpenAI's tool router, Anthropic's tool_use blocks, and LangChain's tool-retrieval all converge on retrieval-over-tools rather than prompt-stuffing.",
        googleAngle: "Search treats web actions as tools; ranking uses signals (provider trust, latency, cost, success history) — the same model Google uses for organic ranking.",
      },
      problem: "When tools come from multiple MCP servers, version drift, capability overlap, and contract changes silently break agents in production.",
      architecture: [
        { layer: "Discovery", nodes: ["MCP Servers", "Tool Registry", "Capability Index"], flows: "→ Retrieval" },
        { layer: "Selection", nodes: ["Embedding Retriever", "Capability Matcher", "Ranker"], flows: "→ Schema Validator" },
        { layer: "Binding", nodes: ["Typed Tool Spec", "Auth Resolver", "Quota Check"], flows: "→ Execution" },
      ],
      patterns: [
        { name: "Tool retrieval (MCP)", desc: "Embed tool descriptions, retrieve top-k per step.", tradeoffs: "Recall risk; needs eval set.", usage: "Catalogs >30 tools." },
        { name: "Capability typing", desc: "Tools advertise effects (read/write/external) for policy gating.", tradeoffs: "Requires registry discipline.", usage: "Any production agent." },
        { name: "Contract pinning", desc: "Pin tool schema hash per plan version.", tradeoffs: "Slower rollout of tool updates.", usage: "Regulated workflows." },
      ],
      risks: [
        { risk: "Capability overlap (two tools, same effect)", likelihood: "High", impact: "Med", mitigation: "Deduplicate via capability hash, rank by trust." },
        { risk: "Version mismatch", likelihood: "Med", impact: "High", mitigation: "Pin tool schema in plan; reject on drift." },
        { risk: "Tool injection (malicious MCP)", likelihood: "Low", impact: "High", mitigation: "MCP allowlist + signed manifests." },
      ],
      telemetry: [
        { metric: "Tool retrieval recall@5", signal: "labeled eval set", threshold: ">0.95" },
        { metric: "Schema-drift detections / day", signal: "registry diff", threshold: "investigate >0" },
        { metric: "Tools loaded / call", signal: "p95 count", threshold: "<8" },
      ],
      security: ["Sign all MCP tool manifests.", "Enforce capability-to-scope mapping at admission.", "Quarantine tools failing contract tests."],
      questions: [
        "How do you prevent prompt-stuffing of unused tools?",
        "How is a tool revoked across all in-flight plans?",
        "What's your strategy when two tools overlap in capability?",
      ],
    },
  },
  {
    id: "exec",
    num: 3,
    title: "Execution",
    color: "text-emerald-700",
    bg: "from-emerald-50 to-white border-emerald-200",
    icon: Play,
    responsibilities: ["Tool invocation", "Authentication", "Parameter binding", "State persistence"],
    flow: ["Agent", "Execution Engine", "Tool Adapter", "External Service"],
    drawer: {
      summary: {
        what: "The runtime that calls tools with the right identity, parameters, retries, and durable state — the part that actually changes the world.",
        why: "Reasoning is cheap; side effects are not. The execution layer is where reliability engineering replaces prompt engineering.",
        svInvestment: "Temporal, Restate, AWS Step Functions, Inngest, and Cloudflare Workflows are all racing to be the durable runtime for agentic execution.",
        googleAngle: "Google's internal Borg/Pipelines disciplines (idempotent steps, exactly-once via dedup, durable workflow state) are being ported into agent runtimes.",
      },
      problem: "External services are non-transactional, partially fail, and rate-limit unpredictably. Without a durable runtime, retries cause duplicate side effects and lost state.",
      architecture: [
        { layer: "Identity", nodes: ["OAuth2/OIDC", "OBO Token Exchange", "Scoped JWT"], flows: "→ Tool Adapter" },
        { layer: "Runtime", nodes: ["Workflow Engine", "Idempotency Store", "Outbox"], flows: "→ External Service" },
        { layer: "Resilience", nodes: ["Retry w/ Jitter", "Circuit Breaker", "Bulkhead", "Hedge"], flows: "→ Verification" },
      ],
      patterns: [
        { name: "Idempotency keys", desc: "Client-generated key dedupes at the provider boundary.", tradeoffs: "Requires provider support; storage cost for dedup window.", usage: "All mutating calls." },
        { name: "Outbox", desc: "Side effects journaled in the same txn as state, dispatched async.", tradeoffs: "Adds latency; requires dispatcher.", usage: "Multi-service writes." },
        { name: "Circuit breaker", desc: "Trips on error-rate to shed load.", tradeoffs: "Tuning sensitivity; false trips.", usage: "Any external dependency." },
        { name: "Hedged requests", desc: "Send Nth request after p99 to cut tail latency.", tradeoffs: "Cost; must be idempotent.", usage: "Read-heavy critical paths." },
      ],
      risks: [
        { risk: "Duplicate side effect on retry", likelihood: "High", impact: "High", mitigation: "Idempotency key + dedup window." },
        { risk: "Token leakage through logs", likelihood: "Med", impact: "High", mitigation: "Redaction middleware + scoped tokens." },
        { risk: "Long-running call exceeds Lambda timeout", likelihood: "Med", impact: "Med", mitigation: "Durable workflow runtime." },
      ],
      telemetry: [
        { metric: "Tool success rate", signal: "200-range / total", threshold: ">99.5%" },
        { metric: "Duplicate-execution rate", signal: "idempotency conflicts", threshold: "<0.1%" },
        { metric: "p95 tool latency", signal: "per tool", threshold: "SLO per tool" },
      ],
      security: ["Use OBO tokens; never share root agent identity.", "Down-scope tokens to single tool call.", "Enforce per-tenant rate limits at the adapter."],
      questions: [
        "How is identity propagated across tool calls?",
        "What happens when a tool times out mid-write?",
        "How do you prove a side effect happened exactly once?",
      ],
    },
  },
  {
    id: "verify",
    num: 4,
    title: "Verification",
    color: "text-amber-700",
    bg: "from-amber-50 to-white border-amber-300",
    icon: ShieldCheck,
    highlight: true,
    responsibilities: ["Output validation", "Business-rule validation", "Policy validation", "Schema validation", "Ground-truth verification"],
    flow: ["Pre-Action", "Execution", "Post-Action"],
    drawer: {
      summary: {
        what: "A structured layer that asserts what was supposed to happen actually happened — pre, during, and post execution.",
        why: "Verification > reasoning. A correct answer that wasn't verified is indistinguishable from a hallucination once committed.",
        svInvestment: "Constrained decoding, function-call schema enforcement, LLM-as-judge ensembles, and 'second-look' verification models are now standard in frontier agent stacks.",
        googleAngle: "Google Search has run output verification (claim extraction + grounding) for years; the same primitives are being repurposed for agents.",
      },
      problem: "An agent confirming 'booked your flight' is meaningless without an external read-back. Most enterprise failures are silent successes — the agent thought it worked.",
      architecture: [
        { layer: "Pre-Action", nodes: ["Policy Check", "Permission Check", "Budget Check", "PII Scan"], flows: "→ Execute" },
        { layer: "During", nodes: ["Schema Validator", "Rule Engine", "Confidence Gate"], flows: "→ Commit" },
        { layer: "Post-Action", nodes: ["Read-back Probe", "Ground-truth Diff", "Receipt Capture"], flows: "→ Learn" },
      ],
      patterns: [
        { name: "Read-back verification", desc: "Re-read the affected resource via a different path and diff.", tradeoffs: "Extra API call.", usage: "All mutating workflows." },
        { name: "LLM-as-judge ensemble", desc: "Independent model scores outputs against criteria.", tradeoffs: "Cost; correlated failures.", usage: "Subjective acceptance." },
        { name: "Policy-as-code (OPA)", desc: "Declarative rules evaluated before commit.", tradeoffs: "Author/maintain rule set.", usage: "Compliance-bound actions." },
        { name: "Receipt pattern", desc: "Provider returns signed receipt; stored as proof-of-effect.", tradeoffs: "Provider must support.", usage: "Financial / regulated." },
      ],
      risks: [
        { risk: "False positive (verify passes, action failed)", likelihood: "Med", impact: "High", mitigation: "Diversify verification channels." },
        { risk: "Verifier overfits to provider quirks", likelihood: "Med", impact: "Med", mitigation: "Contract tests per provider." },
        { risk: "Latency budget blown by verification", likelihood: "Med", impact: "Med", mitigation: "Async post-action probe + reconciliation." },
      ],
      telemetry: [
        { metric: "Verification pass rate", signal: "passes / executions", threshold: ">99%" },
        { metric: "Silent-failure rate", signal: "passes contradicted by reconciliation", threshold: "<0.05%" },
        { metric: "Verifier-add latency", signal: "p95", threshold: "<200ms" },
      ],
      security: ["Verifier runs with read-only credentials.", "Independent identity from executor.", "Receipts stored in WORM bucket."],
      questions: [
        "What proves the action completed?",
        "Are verifier and executor independent fault domains?",
        "How do you handle verifier disagreement with executor?",
      ],
    },
  },
  {
    id: "commit",
    num: 5,
    title: "Commit / Rollback",
    color: "text-rose-700",
    bg: "from-rose-50 to-white border-rose-200",
    icon: GitBranch,
    responsibilities: ["Action commit", "Compensating actions", "State reconciliation", "Distributed consistency"],
    flow: ["Action Commit", "OR", "Compensating Action"],
    drawer: {
      summary: {
        what: "A saga-style orchestrator that commits a multi-step plan atomically from the user's perspective, with compensations for partial failure.",
        why: "External systems rarely support 2PC. Sagas + compensations are the only realistic primitive for end-user-visible atomicity.",
        svInvestment: "Temporal, Restate, Inngest, Trigger.dev, AWS Step Functions — all bet on durable workflows + compensations as the agent commit surface.",
        googleAngle: "Spanner-style strong consistency is unavailable across third-party APIs; Google internally uses saga-pattern orchestration for cross-service business transactions.",
      },
      problem: "Booking = flight + hotel + car. Hotel fails after flight is booked. Without compensations the user is charged for a flight they no longer need.",
      architecture: [
        { layer: "Forward", nodes: ["Step A (Flight)", "Step B (Hotel)", "Step C (Car)"], flows: "→ Success or Failure" },
        { layer: "Compensation", nodes: ["Cancel C", "Cancel B", "Cancel A"], flows: "in reverse order" },
        { layer: "Reconciliation", nodes: ["State Snapshot", "Diff Engine", "Manual-Review Queue"], flows: "→ Closed Loop" },
      ],
      patterns: [
        { name: "Orchestrated saga", desc: "Central coordinator drives steps + compensations.", tradeoffs: "Coordinator is SPOF without durability.", usage: "Default for agents." },
        { name: "Choreographed saga", desc: "Events trigger next step; no coordinator.", tradeoffs: "Hard to reason about; debugging cost.", usage: "Loosely coupled domains." },
        { name: "Event sourcing", desc: "Append-only log is source of truth.", tradeoffs: "Replay/migration complexity.", usage: "Audit-heavy domains." },
      ],
      risks: [
        { risk: "Compensation itself fails", likelihood: "Med", impact: "High", mitigation: "Retry + alert + manual queue." },
        { risk: "Non-compensatable side effect", likelihood: "Med", impact: "High", mitigation: "Mark step as 'point of no return' + human gate." },
        { risk: "Partial visibility to user", likelihood: "Med", impact: "Med", mitigation: "Unified saga status surface." },
      ],
      telemetry: [
        { metric: "Saga completion rate", signal: "completed / started", threshold: ">99%" },
        { metric: "Compensation success rate", signal: "comp ok / comp triggered", threshold: ">99.5%" },
        { metric: "Manual-review queue depth", signal: "current size", threshold: "<25" },
      ],
      security: ["Compensation credentials are scoped + audited.", "Mark irreversible steps explicitly.", "Require dual-control on >$X actions."],
      questions: [
        "Which steps are non-compensatable?",
        "How is the user shown saga state?",
        "How are compensation failures escalated?",
      ],
    },
  },
  {
    id: "learn",
    num: 6,
    title: "Learning",
    color: "text-indigo-700",
    bg: "from-indigo-50 to-white border-indigo-200",
    icon: BarChart3,
    responsibilities: ["Outcome attribution", "User-objective tracking", "Failure clustering", "Reward modeling"],
    flow: ["Outcome", "Feedback", "Improvement"],
    drawer: {
      summary: {
        what: "Closed-loop telemetry that attributes outcomes to specific plans, tools, and prompts and feeds them into evals, retrievers, and policies.",
        why: "Without attribution every regression is a mystery. With it, every release is measurable.",
        svInvestment: "Braintrust, Langfuse, Arize, and OpenAI Evals are all building this layer; reward modeling and DPO push it into model training.",
        googleAngle: "Search's quality-rater + interleaving culture is the template — every change ships behind a guardrail eval before traffic.",
      },
      problem: "Teams ship agent changes blind because they cannot attribute a downstream user outcome back to a planner or tool decision.",
      architecture: [
        { layer: "Capture", nodes: ["Trace Store", "User Outcome Signal", "Receipt Log"], flows: "→ Attribution" },
        { layer: "Attribute", nodes: ["Causal Linker", "Failure Clusterer", "Cost/Outcome Joiner"], flows: "→ Evals" },
        { layer: "Improve", nodes: ["Offline Evals", "Retriever Tuning", "Reward Modeling"], flows: "→ Deploy" },
      ],
      patterns: [
        { name: "Outcome attribution", desc: "Tie every user outcome to the trace that produced it.", tradeoffs: "Storage; PII handling.", usage: "Mandatory at scale." },
        { name: "Failure clustering", desc: "Embedding-cluster of failed traces.", tradeoffs: "Needs labeling loop.", usage: "Triaging long tail." },
        { name: "Reward modeling", desc: "Train a model on outcome signals to score future plans.", tradeoffs: "Risk of reward hacking.", usage: "Mature programs." },
      ],
      risks: [
        { risk: "Wrong outcome signal selected", likelihood: "Med", impact: "High", mitigation: "Multi-signal definition + review." },
        { risk: "PII in traces", likelihood: "High", impact: "High", mitigation: "Redact at capture; segregated store." },
        { risk: "Reward hacking", likelihood: "Med", impact: "Med", mitigation: "Adversarial evals + holdout." },
      ],
      telemetry: [
        { metric: "Outcome attribution rate", signal: "% outcomes linked to trace", threshold: ">95%" },
        { metric: "Eval-to-prod regression delta", signal: "offline vs online", threshold: "<2%" },
        { metric: "Top-failure-cluster share", signal: "% of failures in top 5 clusters", threshold: ">60%" },
      ],
      security: ["Trace redaction pipeline.", "RBAC on outcome dataset.", "Differential privacy on aggregated metrics."],
      questions: [
        "What is the canonical user-success signal?",
        "How long until a regression is detected?",
        "How are eval sets refreshed?",
      ],
    },
  },
];

const PRIMITIVES = [
  { id: "authnz", title: "AuthN/Z & Delegated Identity", icon: Lock, body: "OAuth2/OIDC, service accounts, scoped tokens, on-behalf-of (OBO) downscoping. Identity propagates from user → agent → tool with explicit scope at each hop." },
  { id: "guardrails", title: "Guardrails & Policy Engine", icon: ShieldCheck, body: "OPA / Cedar policies for action admission. PII/PCI scans, allow/deny lists, approval thresholds. Policies are versioned, testable, and shipped as code." },
  { id: "idem", title: "Idempotency & Exactly-Once", icon: RefreshCcw, body: "Client-side idempotency keys, dedup windows, inbox/outbox patterns. Guarantees mutating tool calls don't double-execute under retry." },
  { id: "reliability", title: "Reliability Patterns", icon: Activity, body: "Retries with jitter, circuit breakers, bulkheads, timeouts, hedged requests. Failure isolation per tool/tenant." },
  { id: "audit", title: "Audit & Provenance", icon: FileText, body: "Immutable event log of inputs, outputs, decisions, tool traces. Signed and WORM-stored. Foundation for compliance + outcome attribution." },
];

const TECH_PATTERNS = [
  { title: "Plan → Act → Verify → Commit (PAVC)", icon: Boxes, benefits: "Auditable lifecycle; clear failure points.", failures: "Verification is brittle if read-back path differs from write path.", examples: "OpenAI Operator, Anthropic computer-use." },
  { title: "Saga / Compensating Transactions", icon: GitBranch, benefits: "User-visible atomicity across non-transactional providers.", failures: "Non-compensatable steps require human gates.", examples: "Travel booking, multi-cloud provisioning." },
  { title: "Human-in-the-Loop Escalation", icon: Users, benefits: "Bounded risk on high-impact actions.", failures: "Alert fatigue if thresholds are wrong.", examples: "Wire transfers >$X, prod deploys." },
  { title: "Safe Tool Abstractions & Contracts", icon: Wrench, benefits: "Decouples agent from provider quirks.", failures: "Adapter drift if not contract-tested.", examples: "MCP tools, internal action SDK." },
  { title: "Deterministic Replay & Time-Travel Debug", icon: RefreshCcw, benefits: "Reproduce any production trace locally.", failures: "Replay diverges with non-deterministic tools.", examples: "Temporal, Restate." },
  { title: "Outbox + Event Sourcing", icon: Database, benefits: "Single source of truth for side effects.", failures: "Migration cost; replay complexity.", examples: "Stripe-style ledgers." },
];

const DOMAINS = [
  { id: "book", title: "Booking & Reservations", icon: Calendar, intent: "Reserve a resource for a time slot.", tools: "Provider APIs (Amadeus, OpenTable, hotel PMS).", verify: "Read-back confirmation number + slot.", rollback: "Cancel reservation within provider window.", metrics: "Confirmation match %, cancel-window adherence." },
  { id: "call", title: "Business Calling & Outreach", icon: Phone, intent: "Place an outbound call and capture an outcome.", tools: "Twilio, telephony adapters, ASR/TTS.", verify: "Call disposition + transcript signal extraction.", rollback: "Schedule retry or human handoff.", metrics: "Connect %, outcome-capture %, escalation %." },
  { id: "buy", title: "Checkout & Purchase", icon: ShoppingCart, intent: "Complete a purchase under budget + policy.", tools: "Stripe, ERP, procurement APIs.", verify: "Receipt + ledger reconciliation.", rollback: "Refund / void within window.", metrics: "Charge match %, refund SLA, fraud rate." },
  { id: "form", title: "Form Submission", icon: FileSignature, intent: "Submit a structured document to a system of record.", tools: "Headless browser, eForm APIs.", verify: "Submission ID + downstream visibility check.", rollback: "Withdraw / amend.", metrics: "First-pass acceptance %, retry depth." },
  { id: "prov", title: "Account Provisioning", icon: Server, intent: "Create/modify an account with scoped entitlements.", tools: "IAM, IdP SCIM, ITSM.", verify: "Login probe + entitlement read-back.", rollback: "Deprovision via reverse SCIM.", metrics: "Time-to-active, entitlement diff = 0." },
  { id: "ops", title: "Infrastructure Operations", icon: Cloud, intent: "Apply an infra change (scale, restart, rotate).", tools: "Cloud APIs, k8s, Terraform.", verify: "Post-change health probes + SLO.", rollback: "Revert via prior known-good state.", metrics: "Change success rate, MTTR." },
];

const METRICS = [
  { name: "Action Success Rate", def: "Plans that reach committed + verified state.", formula: "verified_commits / plans_started", lead: "Tool success, verification pass.", slo: ">99%" },
  { name: "Verification Pass Rate", def: "Verifications confirming intended effect.", formula: "verifier_pass / verifier_runs", lead: "Read-back availability.", slo: ">99%" },
  { name: "Rollback Rate", def: "Plans triggering compensation.", formula: "compensations_triggered / plans_started", lead: "Tool failure, policy denial.", slo: "<1%" },
  { name: "Mean Time To Outcome", def: "User goal → verified outcome.", formula: "median(t_outcome − t_intent)", lead: "Planner depth, tool latency.", slo: "<60s" },
  { name: "Tool Failure Rate", def: "Non-success responses from tool adapters.", formula: "5xx+timeouts / total", lead: "Provider availability.", slo: "<0.5% per tool" },
  { name: "Escalation Rate", def: "Plans handed off to human.", formula: "human_escalations / plans_started", lead: "Confidence gating threshold.", slo: "tuned per domain" },
  { name: "Cost Per Action", def: "Fully-loaded cost of a committed action.", formula: "(model + tool + infra) / commits", lead: "Plan depth, hedging.", slo: "trending down" },
  { name: "User Outcome Success %", def: "User-confirmed goal achievement.", formula: "user_confirmed / plans_started", lead: "Verification + attribution.", slo: "≥95%" },
];

/* =====================================================================
   PAGE
===================================================================== */

export default function AnswersActions() {
  const [active, setActive] = useState<ArchNode | null>(null);
  const [primitive, setPrimitive] = useState<typeof PRIMITIVES[number] | null>(null);
  const [pattern, setPattern] = useState<typeof TECH_PATTERNS[number] | null>(null);
  const [domain, setDomain] = useState<typeof DOMAINS[number] | null>(null);
  const [metric, setMetric] = useState<typeof METRICS[number] | null>(null);

  return (
    <AppShell>
      <div className="min-h-full bg-slate-50/60 p-4 md:p-6">
        <div className="max-w-[1320px] mx-auto space-y-5">
          {/* ============ HEADER ============ */}
          <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[10px]">1</span>
                  Epic AI-101 · AI Engineering Backlog
                </div>
                <h1 className="mt-1 text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  Answers → Actions
                </h1>
                <p className="mt-1 text-sm text-slate-600 max-w-3xl">
                  Operationalizing Agentic Execution Systems. Transforming information retrieval into reliable, governed, outcome-oriented execution.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">P0</Badge>
                <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">On Track · 64%</Badge>
                <Badge variant="outline" className="border-slate-200 text-slate-700">Owner: Sarah K.</Badge>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryCard accent="blue" icon={Target} label="Industry Transition" body="Information Delivery → Outcome Execution" />
              <SummaryCard accent="rose" icon={AlertTriangle} label="Core Challenge" body="Verification · Authorization · Rollback · Reliability" />
              <SummaryCard accent="emerald" icon={CheckCircle2} label="Key Learning" body="Verification & recovery matter more than reasoning." />
              <SummaryCard accent="violet" icon={Settings} label="Neurealm Capability" body="Action-Oriented Agent Frameworks with planning, tool use, and verification." />
            </div>
          </header>

          {/* ============ ARCHITECTURE CANVAS ============ */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Architecture Canvas</div>
                <h2 className="text-lg font-bold text-slate-900">Action-Oriented Agent Architecture</h2>
              </div>
              <div className="text-[11px] text-slate-500">Click any layer for engineering deep-dive →</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 relative">
              {ARCH_NODES.map((n, i) => {
                const Icon = n.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => setActive(n)}
                    className={`group relative text-left rounded-xl border bg-gradient-to-b ${n.bg} p-3 hover:shadow-md hover:-translate-y-0.5 transition-all ${n.highlight ? "ring-2 ring-amber-300/60" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${n.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        Step {n.num}
                      </div>
                      {n.highlight && <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[9px]">Critical</Badge>}
                    </div>
                    <div className="mt-1.5 text-[13px] font-bold text-slate-900">{n.title}</div>
                    <ul className="mt-2 space-y-0.5">
                      {n.responsibilities.slice(0, 3).map((r) => (
                        <li key={r} className="text-[11px] text-slate-600 flex gap-1">
                          <span className="text-slate-400">·</span> {r}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center flex-wrap gap-1 text-[10px] text-slate-500">
                      {n.flow.map((f, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1">
                          {idx > 0 && <ArrowRight className="h-2.5 w-2.5 text-slate-400" />}
                          <span className="font-medium text-slate-700">{f}</span>
                        </span>
                      ))}
                    </div>
                    {n.highlight && (
                      <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 px-2 py-1 text-[10px] font-semibold text-amber-800">
                        Verification &gt; Reasoning
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500 border-t border-dashed border-slate-200 pt-3">
              <Activity className="h-3 w-3" />
              <span className="font-semibold uppercase tracking-wider">Observability & Feedback Loop</span>
              <span className="flex-1 border-b border-dashed border-slate-300" />
              <span>Traces · Receipts · Outcome Attribution</span>
            </div>
          </section>

          {/* ============ TECHNICAL ANALYSIS: PRIMITIVES + PATTERNS ============ */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Engineering Primitives</div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Foundational building blocks</h3>
              <ul className="space-y-2">
                {PRIMITIVES.map((p) => {
                  const Icon = p.icon;
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => setPrimitive(p)}
                        className="w-full text-left rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 px-3 py-2 transition-colors flex items-start gap-2"
                      >
                        <Icon className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] font-bold text-slate-900">{p.title}</div>
                          <div className="text-[11px] text-slate-600 truncate">{p.body}</div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 mt-1" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Technical Pattern Gallery</div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Patterns we implement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TECH_PATTERNS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.title}
                      onClick={() => setPattern(p)}
                      className="text-left rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50/30 px-3 py-2 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-violet-600" />
                        <div className="text-[12px] font-bold text-slate-900">{p.title}</div>
                      </div>
                      <div className="text-[10.5px] text-slate-600 mt-1 line-clamp-2">{p.benefits}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ============ DOMAINS ============ */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Example Action Domains</div>
                <h3 className="text-base font-bold text-slate-900">Where this stack ships</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {DOMAINS.map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDomain(d)}
                    className="text-left rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 hover:border-blue-300 hover:shadow-sm p-3 transition-all"
                  >
                    <Icon className="h-5 w-5 text-blue-600" />
                    <div className="mt-2 text-[12px] font-bold text-slate-900">{d.title}</div>
                    <div className="text-[10.5px] text-slate-600 mt-0.5 line-clamp-2">{d.intent}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ============ METRICS ============ */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Operational Metrics</div>
                <h3 className="text-base font-bold text-slate-900">Measures we drive</h3>
              </div>
              <div className="text-[11px] text-slate-500">Click any metric for definition + SLO →</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-2">
              {METRICS.map((m) => (
                <button
                  key={m.name}
                  onClick={() => setMetric(m)}
                  className="text-left rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 p-3 transition-colors"
                >
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{m.name}</div>
                  <div className="text-[13px] font-bold text-emerald-700 mt-1">{m.slo}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{m.def}</div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* ============ INTELLIGENCE DRAWER (ARCH NODE) ============ */}
        <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
          <SheetContent side="right" className="w-full sm:max-w-[640px] p-0 overflow-hidden">
            {active && <ArchDrawer node={active} />}
          </SheetContent>
        </Sheet>

        {/* ============ PRIMITIVE DRAWER ============ */}
        <Sheet open={!!primitive} onOpenChange={(o) => !o && setPrimitive(null)}>
          <SheetContent side="right" className="w-full sm:max-w-[520px]">
            {primitive && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <primitive.icon className="h-5 w-5 text-indigo-600" />
                    {primitive.title}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <p>{primitive.body}</p>
                  <ArchMini title="Reference flow" steps={["Client", "Policy", "Adapter", "Provider", "Receipt"]} />
                  <DrawerSection title="Engineering considerations">
                    <ul className="list-disc pl-5 space-y-1 text-[12.5px]">
                      <li>Treat as a platform-team responsibility, not per-agent.</li>
                      <li>Version every artifact (policy bundle, tool schema, idempotency window).</li>
                      <li>Contract-test against provider sandboxes nightly.</li>
                    </ul>
                  </DrawerSection>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* ============ PATTERN DRAWER ============ */}
        <Sheet open={!!pattern} onOpenChange={(o) => !o && setPattern(null)}>
          <SheetContent side="right" className="w-full sm:max-w-[520px]">
            {pattern && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <pattern.icon className="h-5 w-5 text-violet-600" />
                    {pattern.title}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <DrawerSection title="Benefits"><p>{pattern.benefits}</p></DrawerSection>
                  <DrawerSection title="Failure modes"><p>{pattern.failures}</p></DrawerSection>
                  <DrawerSection title="Industry examples"><p>{pattern.examples}</p></DrawerSection>
                  <ArchMini title="Architecture" steps={["Trigger", "Coordinator", "Step Workers", "Verifier", "Commit / Compensate"]} />
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* ============ DOMAIN DRAWER ============ */}
        <Sheet open={!!domain} onOpenChange={(o) => !o && setDomain(null)}>
          <SheetContent side="right" className="w-full sm:max-w-[560px]">
            {domain && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <domain.icon className="h-5 w-5 text-blue-600" />
                    {domain.title}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <KV k="User intent" v={domain.intent} />
                  <KV k="Tools" v={domain.tools} />
                  <KV k="Verification" v={domain.verify} />
                  <KV k="Rollback" v={domain.rollback} />
                  <KV k="Metrics" v={domain.metrics} />
                  <ArchMini title="Flow" steps={["Intent", "Plan", "Tool", "Verify", "Commit", "Receipt"]} />
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* ============ METRIC DRAWER ============ */}
        <Sheet open={!!metric} onOpenChange={(o) => !o && setMetric(null)}>
          <SheetContent side="right" className="w-full sm:max-w-[480px]">
            {metric && (
              <>
                <SheetHeader>
                  <SheetTitle>{metric.name}</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <KV k="Definition" v={metric.def} />
                  <KV k="Formula" v={metric.formula} />
                  <KV k="Leading indicators" v={metric.lead} />
                  <KV k="SLO target" v={metric.slo} />
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}

/* =====================================================================
   ARCH DRAWER (rich)
===================================================================== */

function ArchDrawer({ node }: { node: ArchNode }) {
  const Icon = node.icon;
  const d = node.drawer;
  return (
    <div className="h-full flex flex-col">
      <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-slate-500">
          <Icon className={`h-4 w-4 ${node.color}`} />
          Step {node.num} · Architecture Layer
        </div>
        <SheetTitle className="text-xl">{node.title}</SheetTitle>
        <p className="text-[12.5px] text-slate-600">{d.summary.what}</p>
      </SheetHeader>
      <Tabs defaultValue="exec" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-5 mt-3 grid grid-cols-7 h-8">
          <TabsTrigger value="exec" className="text-[11px]">Exec</TabsTrigger>
          <TabsTrigger value="arch" className="text-[11px]">Arch</TabsTrigger>
          <TabsTrigger value="patterns" className="text-[11px]">Patterns</TabsTrigger>
          <TabsTrigger value="risks" className="text-[11px]">Risks</TabsTrigger>
          <TabsTrigger value="tele" className="text-[11px]">Telemetry</TabsTrigger>
          <TabsTrigger value="sec" className="text-[11px]">Security</TabsTrigger>
          <TabsTrigger value="qa" className="text-[11px]">Review</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1 mt-3">
          <div className="px-5 pb-6 space-y-4">
            <TabsContent value="exec" className="m-0 space-y-3">
              <KV k="What it is" v={d.summary.what} />
              <KV k="Why it matters" v={d.summary.why} />
              <KV k="Why SV is investing" v={d.summary.svInvestment} />
              <KV k="Google angle" v={d.summary.googleAngle} />
              <DrawerSection title="Business problem"><p className="text-[12.5px]">{d.problem}</p></DrawerSection>
            </TabsContent>

            <TabsContent value="arch" className="m-0 space-y-3">
              {d.architecture.map((a) => (
                <div key={a.layer} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{a.layer}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {a.nodes.map((n, i) => (
                      <span key={n} className="inline-flex items-center gap-1">
                        {i > 0 && <ArrowRight className="h-3 w-3 text-slate-400" />}
                        <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">{n}</span>
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 text-[10.5px] text-slate-500">{a.flows}</div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="patterns" className="m-0 space-y-2">
              {d.patterns.map((p) => (
                <div key={p.name} className="rounded-lg border border-slate-200 p-3">
                  <div className="text-[12.5px] font-bold text-slate-900">{p.name}</div>
                  <div className="text-[11.5px] text-slate-600 mt-0.5">{p.desc}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="font-semibold text-slate-500">Tradeoffs:</span> {p.tradeoffs}</div>
                    <div><span className="font-semibold text-slate-500">Use when:</span> {p.usage}</div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="risks" className="m-0">
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-[11.5px]">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr><th className="text-left px-2 py-1.5">Risk</th><th className="px-2">L</th><th className="px-2">I</th><th className="text-left px-2">Mitigation</th></tr>
                  </thead>
                  <tbody>
                    {d.risks.map((r, i) => (
                      <tr key={i} className="border-t border-slate-200">
                        <td className="px-2 py-1.5">{r.risk}</td>
                        <td className="px-2 text-center"><LIChip v={r.likelihood} /></td>
                        <td className="px-2 text-center"><LIChip v={r.impact} /></td>
                        <td className="px-2 text-slate-600">{r.mitigation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="tele" className="m-0 space-y-2">
              {d.telemetry.map((t) => (
                <div key={t.metric} className="rounded-lg border border-slate-200 p-3 flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-bold text-slate-900">{t.metric}</div>
                    <div className="text-[10.5px] text-slate-500">{t.signal}</div>
                  </div>
                  <Badge variant="outline" className="text-[10.5px] border-emerald-200 text-emerald-700 bg-emerald-50">{t.threshold}</Badge>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="sec" className="m-0">
              <ul className="space-y-1.5 text-[12px] text-slate-700">
                {d.security.map((s, i) => (
                  <li key={i} className="flex gap-2"><Lock className="h-3.5 w-3.5 text-slate-500 mt-0.5 shrink-0" />{s}</li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="qa" className="m-0">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Engineering review board questions</div>
              <ol className="space-y-1.5 text-[12px] text-slate-700 list-decimal pl-5">
                {d.questions.map((q, i) => <li key={i}>{q}</li>)}
              </ol>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

/* =====================================================================
   PIECES
===================================================================== */

function SummaryCard({ accent, icon: Icon, label, body }: { accent: "blue" | "rose" | "emerald" | "violet"; icon: any; label: string; body: string }) {
  const map: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50/40 text-blue-700",
    rose: "border-rose-200 bg-rose-50/40 text-rose-700",
    emerald: "border-emerald-200 bg-emerald-50/40 text-emerald-700",
    violet: "border-violet-200 bg-violet-50/40 text-violet-700",
  };
  return (
    <div className={`rounded-xl border ${map[accent]} p-3`}>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1.5 text-[12.5px] font-semibold text-slate-900 leading-snug">{body}</div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{k}</div>
      <div className="text-[12.5px] text-slate-800 mt-0.5">{v}</div>
    </div>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">{title}</div>
      <div className="text-slate-700">{children}</div>
    </div>
  );
}

function ArchMini({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 bg-white">
      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">{title}</div>
      <div className="flex flex-wrap items-center gap-1.5">
        {steps.map((s, i) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            {i > 0 && <ArrowRight className="h-3 w-3 text-slate-400" />}
            <span className="rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[11px] font-semibold">{s}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function LIChip({ v }: { v: "Low" | "Med" | "High" }) {
  const map = {
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Med: "bg-amber-50 text-amber-700 border-amber-200",
    High: "bg-rose-50 text-rose-700 border-rose-200",
  } as const;
  return <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${map[v]}`}>{v}</span>;
}
