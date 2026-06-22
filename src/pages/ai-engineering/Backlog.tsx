import { useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutGrid, ListChecks, KanbanSquare, AlertTriangle, GitBranch, Cpu,
  Activity, Map, Users, Settings as Cog, ChevronRight, Sparkles,
  Search, RefreshCcw, Brain, ShieldCheck, Workflow, Database, Layers,
  Target, Network, CheckCircle2, XCircle, Clock, TrendingUp, Bot, Zap,
  CircleDot, AlertCircle, FileText, Boxes, ArrowRight,
} from "lucide-react";

/* ============================================================
   DATA MODEL
============================================================ */

type Health = "On Track" | "At Risk" | "Blocked";
type Priority = "P0" | "P1" | "P2";

interface Story {
  id: string;
  title: string;
  points: number;
  status: "To Do" | "In Progress" | "In Review" | "Done";
  assignee: { initials: string; name: string; color: string };
  risk?: "Blocked" | "At Risk" | "OK";
  problem: string;
  acceptance: string[];
  techDesign: string;
  telemetry: string[];
  rollback: string;
}

interface Epic {
  id: string;
  num: number;
  title: string;
  goal: string;
  businessOutcome: string;
  priority: Priority;
  points: number;
  completion: number;
  health: Health;
  owner: string;
  ownerTeam: string;
  risk: "Low" | "Medium" | "High" | "Critical";
  riskScore: number;
  dependencies: string[];
  // Intelligence
  executive: {
    what: string;
    why: string;
    whyEnterprisesStruggle: string;
    whySvInvesting: string;
  };
  strategic: { businessValue: number; complexity: number; opRisk: number; adoption: number; maturity: number };
  industryChallenges: string[];
  architecture: { layer: string; desc: string; comps: string[] }[];
  adrs: { id: string; title: string; decision: string; consequence: string }[];
  risks: { risk: string; likelihood: string; impact: string; owner: string; mitigation: string; status: string }[];
  dependencyGraph: { group: string; items: string[] }[];
  telemetry: { name: string; value: string; trend: "up" | "down" | "flat" }[];
  knowledge: {
    google: string;
    openai: string;
    anthropic: string;
    microsoft: string;
    patterns: string[];
    mistakes: string[];
    trends: string[];
  };
  aiDetails: { topic: string; detail: string }[];
  stories: Story[];
}

const EPICS: Epic[] = [
  {
    id: "AI-101", num: 1, title: "Answers → Actions",
    goal: "Move search experiences from information delivery to action execution.",
    businessOutcome: "Reduce time-to-task completion by 40%; enable transactional intent.",
    priority: "P0", points: 54, completion: 64, health: "On Track",
    owner: "Sarah K.", ownerTeam: "AI Platform Team", risk: "Medium", riskScore: 56,
    dependencies: ["MCP Registry", "Identity Federation", "Saga Engine"],
    executive: {
      what: "Transition from answer-generation systems (search, RAG) to action-execution systems where the AI invokes verified tools to complete tasks on behalf of the user.",
      why: "Information retrieval is commoditized. The next defensible value layer is reliable execution — booking, purchasing, configuring, deploying.",
      whyEnterprisesStruggle: "Action systems require identity propagation, transactional guarantees, audit trails, and rollback — none of which existed in the search stack.",
      whySvInvesting: "Every major lab (OpenAI Operator, Anthropic Computer Use, Google Project Mariner) is racing here because action latency = revenue. The economic surface area of action-AI is 100x retrieval-AI.",
    },
    strategic: { businessValue: 95, complexity: 88, opRisk: 72, adoption: 38, maturity: 35 },
    industryChallenges: [
      "Verification of external actions before commit",
      "Safe execution under partial network failure",
      "Identity propagation across tools (OAuth, mTLS, OBO tokens)",
      "Rollback for non-idempotent operations",
      "Human-in-the-loop approval at the right granularity",
      "Tool reliability and circuit breaking",
      "Multi-step failure recovery (Saga / compensating actions)",
    ],
    architecture: [
      { layer: "Intent Layer", desc: "Parse user goals into structured intents.", comps: ["Intent Classifier", "Goal Decomposer", "Constraint Extractor"] },
      { layer: "Planning Layer", desc: "Generate executable plans with branching.", comps: ["Planner LLM", "Plan Validator", "Cost Estimator"] },
      { layer: "Tool Layer", desc: "Catalog and invoke external capabilities.", comps: ["MCP Tool Registry", "Schema Validator", "Capability Discovery"] },
      { layer: "Verification Layer", desc: "Pre-execution checks and policy enforcement.", comps: ["Action Verifier", "Policy Engine", "Dry-Run Sandbox"] },
      { layer: "Execution Layer", desc: "Run tools with transactional guarantees.", comps: ["Saga Coordinator", "Idempotency Keys", "Compensation Registry"] },
      { layer: "Observability Layer", desc: "Distributed traces across plan + tools.", comps: ["OTel Agent Spans", "Replay Store", "Audit Sink"] },
      { layer: "Feedback Layer", desc: "Outcome attribution back to plan quality.", comps: ["Outcome Tracker", "Eval Harness", "RLHF Loop"] },
    ],
    adrs: [
      { id: "ADR-001", title: "Use MCP for tool discovery", decision: "Adopt Anthropic's Model Context Protocol as the canonical tool registry.", consequence: "Vendor-neutral tool surface; tighter coupling to MCP spec evolution." },
      { id: "ADR-002", title: "Implement Saga pattern for rollback", decision: "Multi-step actions use Saga with compensating transactions.", consequence: "Eventual consistency only; requires compensation for every forward step." },
      { id: "ADR-003", title: "Use OpenTelemetry for agent traces", decision: "All agent steps emit OTel spans with semantic conventions for GenAI.", consequence: "Unified observability with non-AI services; vendor lock-in avoided." },
    ],
    risks: [
      { risk: "External Tool Reliability", likelihood: "High", impact: "Critical", owner: "Sarah K.", mitigation: "Circuit breaker + hedged calls.", status: "Mitigating" },
      { risk: "Identity token leakage in traces", likelihood: "Medium", impact: "Critical", owner: "Security Eng", mitigation: "PII scrubber in OTel pipeline.", status: "Open" },
      { risk: "Saga compensation correctness", likelihood: "Medium", impact: "High", owner: "Platform", mitigation: "Property-based tests + chaos drills.", status: "Mitigating" },
    ],
    dependencyGraph: [
      { group: "Internal Teams", items: ["Identity Platform", "Search Infra", "FinOps"] },
      { group: "External Vendors", items: ["Anthropic (MCP)", "Auth0", "Datadog"] },
      { group: "Models", items: ["Claude Sonnet 4.5", "GPT-4o", "Gemini 2.5 Pro"] },
      { group: "Tools / MCP Servers", items: ["Stripe MCP", "Calendar MCP", "Internal Ops MCP"] },
      { group: "Data Sources", items: ["Customer 360", "Catalog DB", "Policy Store"] },
    ],
    telemetry: [
      { name: "Action Success Rate", value: "92.4%", trend: "up" },
      { name: "Verification Pass Rate", value: "98.1%", trend: "flat" },
      { name: "Rollback Rate", value: "1.8%", trend: "down" },
      { name: "p95 Latency", value: "1.4s", trend: "down" },
      { name: "Tool Failure Rate", value: "0.7%", trend: "down" },
      { name: "Human Escalation Rate", value: "4.3%", trend: "down" },
      { name: "Cost / Transaction", value: "$0.043", trend: "down" },
      { name: "Outcome Completion %", value: "88.5%", trend: "up" },
    ],
    knowledge: {
      google: "Project Mariner-style browser agents with action graphs validated by Gemini's tool-use head; tight integration with Google Cloud's policy engine.",
      openai: "Operator + Responses API; tools are first-class with built-in retries; action attestation via assistants-side sandbox.",
      anthropic: "Computer Use + MCP servers; deterministic tool surface; planner-executor separation with Claude as both.",
      microsoft: "Copilot Actions + Semantic Kernel planners; deep Graph API integration; Entra ID OBO tokens for identity propagation.",
      patterns: ["Plan-then-Execute", "Saga + Compensation", "Dry-run before commit", "Tool-level circuit breakers", "Per-tool eval harness"],
      mistakes: ["Skipping verification layer", "Sharing tokens across users", "No idempotency keys", "Treating tools as RPC instead of transactional"],
      trends: ["MCP standardization", "Hardware-attested action proofs", "Action marketplaces", "Multi-agent action choreography"],
    },
    aiDetails: [
      { topic: "Architecture Patterns", detail: "Plan-Execute-Verify; Saga choreography; Hierarchical planning with reflection." },
      { topic: "Data Flow", detail: "Intent → Plan → Tool Schema → Validated Args → Execution → Outcome → Eval Store." },
      { topic: "Control Flow", detail: "Async event-driven via Temporal; deterministic replay from event log." },
      { topic: "State Management", detail: "Event-sourced plan state; CRDT for collaborative agent state." },
      { topic: "Memory Management", detail: "Short-term: plan context window. Long-term: per-user action history with TTL + redaction." },
      { topic: "Security Model", detail: "OBO token exchange; per-tool scope minimization; no token in prompt context." },
      { topic: "Identity Model", detail: "User identity propagates as JWT; agent identity is a workload identity (SPIFFE)." },
      { topic: "Governance Controls", detail: "Pre-flight policy engine (OPA); spend caps; approval matrix by action class." },
      { topic: "Observability", detail: "OTel GenAI semconv; per-step spans; PII-scrubbed prompt/response logging." },
      { topic: "Testing Strategy", detail: "Replay harness over recorded action traces; mutation testing on tool schemas." },
      { topic: "Evaluation Framework", detail: "Outcome-grounded evals (did the action achieve the goal?) not just plan quality." },
      { topic: "Rollback Strategy", detail: "Per-step compensation registry; partial rollback supported; manual override path." },
      { topic: "SLO Design", detail: "99.5% action success, p95 < 2s, < 5% human escalation." },
      { topic: "Failure Modes", detail: "Tool timeout, schema drift, identity expiry, plan loops, policy denial." },
      { topic: "Recovery Patterns", detail: "Retry with backoff → compensate → escalate to human → file incident." },
    ],
    stories: [
      { id: "AI-101-1", title: "Implement permission & verification framework", points: 8, status: "In Progress", assignee: { initials: "SK", name: "Sarah K.", color: "ai" }, risk: "OK",
        problem: "Actions are executing without consistent pre-flight permission checks.",
        acceptance: ["Every tool call passes through verifier", "Policy denials produce structured errors", "Audit log for every decision"],
        techDesign: "OPA sidecar evaluates JSON policy against tool args + user context before execution proceeds.",
        telemetry: ["verifier.decisions.total", "verifier.deny.rate", "verifier.latency.p95"],
        rollback: "Verifier in shadow mode (log-only) via feature flag." },
      { id: "AI-101-2", title: "Tool execution sandbox & action validator", points: 5, status: "Done", assignee: { initials: "ML", name: "Mike L.", color: "status-info" }, risk: "OK",
        problem: "No safe environment to test tool calls before production execution.",
        acceptance: ["Dry-run mode for all MCP tools", "Validator catches schema violations", "Sandbox parity > 95%"],
        techDesign: "MCP proxy intercepts calls, routes to sandboxed implementation when in dry-run; results diffed.",
        telemetry: ["sandbox.calls.total", "validator.violations.rate"],
        rollback: "Disable proxy; fall back to direct tool calls." },
      { id: "AI-101-3", title: "Human-in-the-loop escalation", points: 5, status: "To Do", assignee: { initials: "PG", name: "Priya G.", color: "ai" }, risk: "At Risk",
        problem: "High-risk actions auto-execute without human review.",
        acceptance: ["Risk classifier on every plan", "Slack/Teams approval card", "SLA-bound timeout fallback"],
        techDesign: "Risk scorer → if score > threshold, suspend Saga, emit approval request, resume on signed callback.",
        telemetry: ["escalation.rate", "approval.latency.p50"],
        rollback: "Lower threshold to ∞ to disable escalation." },
    ],
  },
  {
    id: "AI-102", num: 2, title: "Sessions → Persistent Agents",
    goal: "One-off interactions to always-on agents that maintain durable state.",
    businessOutcome: "Increase task continuity; reduce re-prompting by 60%.",
    priority: "P0", points: 71, completion: 60, health: "At Risk",
    owner: "Alex R.", ownerTeam: "Agent Runtime", risk: "High", riskScore: 72,
    dependencies: ["Memory Store", "Identity Federation", "MCP"],
    executive: {
      what: "Move from per-request stateless LLM calls to long-lived agents with episodic + semantic memory that persist across sessions, devices, and users.",
      why: "Knowledge work is continuous, not transactional. Persistent agents compound value with every interaction.",
      whyEnterprisesStruggle: "Memory is the hardest unsolved problem in agentic AI: what to remember, how to retrieve, how to forget, how to govern.",
      whySvInvesting: "Memory is the moat. Whoever owns the durable user/work context owns the next OS layer.",
    },
    strategic: { businessValue: 92, complexity: 94, opRisk: 78, adoption: 30, maturity: 28 },
    industryChallenges: [
      "Context window vs. external memory tradeoffs",
      "Memory retrieval recall vs. precision",
      "Memory governance (right-to-be-forgotten, retention)",
      "Cross-device session continuity",
      "Memory poisoning attacks",
      "Memory cost economics at scale",
    ],
    architecture: [
      { layer: "Session Layer", desc: "Manages active agent sessions.", comps: ["Session Manager", "Cross-Device Sync"] },
      { layer: "Working Memory", desc: "Active context window.", comps: ["Context Compressor", "Summarizer"] },
      { layer: "Episodic Memory", desc: "Past interactions.", comps: ["Vector Store", "Time-Indexed Log"] },
      { layer: "Semantic Memory", desc: "Distilled facts and relationships.", comps: ["Knowledge Graph", "Fact Extractor"] },
      { layer: "Procedural Memory", desc: "Learned workflows.", comps: ["Skill Library", "Macro Recorder"] },
      { layer: "Governance Layer", desc: "Memory policy and forgetting.", comps: ["Retention Engine", "PII Redactor"] },
    ],
    adrs: [
      { id: "ADR-101", title: "Hybrid vector + graph memory", decision: "Use vector store for recall, graph for relationships.", consequence: "Two systems to operate; richer retrieval." },
      { id: "ADR-102", title: "Per-user memory isolation", decision: "Memory namespace = user_id; no cross-user retrieval.", consequence: "No emergent population-level insights without explicit aggregation." },
    ],
    risks: [
      { risk: "Memory poisoning via prompt injection", likelihood: "High", impact: "Critical", owner: "Security", mitigation: "Memory write gating + provenance tags.", status: "Open" },
      { risk: "Storage cost runaway", likelihood: "Medium", impact: "High", owner: "FinOps", mitigation: "TTL + compression + summarization.", status: "Mitigating" },
    ],
    dependencyGraph: [
      { group: "Internal Teams", items: ["Identity", "Storage", "Privacy"] },
      { group: "External Vendors", items: ["Pinecone", "Neo4j", "Anthropic"] },
      { group: "Models", items: ["Claude Sonnet", "Embed-v4"] },
      { group: "Data Sources", items: ["User Profile", "Activity Log"] },
    ],
    telemetry: [
      { name: "Memory Recall@5", value: "0.81", trend: "up" },
      { name: "Memory Write Rate", value: "12/s", trend: "up" },
      { name: "Avg Memory / User", value: "4.2 MB", trend: "up" },
      { name: "Forget Latency p95", value: "320ms", trend: "down" },
    ],
    knowledge: {
      google: "Gemini's million-token context + Project Astra's continuous perception loop with on-device summarization.",
      openai: "Memory feature in ChatGPT: distilled facts with explicit user control; rolling summary in Assistants API.",
      anthropic: "Claude's projects + tool-based memory writes; emphasis on user-visible memory inspection.",
      microsoft: "Microsoft Graph as the de-facto memory layer; Copilot grounded in user's M365 corpus.",
      patterns: ["Hierarchical summarization", "Recency + salience reranking", "Memory write gating", "User-visible memory inspector"],
      mistakes: ["Storing raw chat logs forever", "No PII redaction at write time", "Letting LLM decide what to remember without policy"],
      trends: ["Differential privacy memories", "Federated agent memory", "On-device memory with cloud sync"],
    },
    aiDetails: [
      { topic: "Memory Management", detail: "Working / episodic / semantic / procedural separation; write gates; TTL by class." },
      { topic: "Failure Modes", detail: "Stale memory, memory poisoning, recall collapse, embedding drift." },
      { topic: "Evaluation Framework", detail: "Memory recall, factual consistency, harmful memory detection." },
    ],
    stories: [
      { id: "AI-102-1", title: "State store for persistent agent memory", points: 8, status: "In Progress", assignee: { initials: "PG", name: "Priya G.", color: "ai" }, risk: "OK",
        problem: "Agents lose context across sessions.", acceptance: ["Per-user namespace", "TTL policy enforced", "Sub-200ms read"], techDesign: "Postgres + pgvector with per-user RLS.", telemetry: ["memory.read.p95", "memory.size.bytes"], rollback: "Disable persistence flag." },
      { id: "AI-102-2", title: "Context window mgmt & summarization", points: 5, status: "In Review", assignee: { initials: "AR", name: "Alex R.", color: "status-warning" }, risk: "At Risk",
        problem: "Long sessions blow context window.", acceptance: ["Rolling summary every 8k tokens", "Summary quality > 0.85 on eval set"], techDesign: "Map-reduce summarization with hierarchical compression.", telemetry: ["context.tokens.p95", "summary.quality"], rollback: "Truncate instead of summarize." },
    ],
  },
  {
    id: "AI-103", num: 3, title: "Results → Autonomous Workflows",
    goal: "Single-step results to multi-step autonomous workflows.",
    businessOutcome: "Automate 30% of multi-step knowledge work end-to-end.",
    priority: "P0", points: 89, completion: 55, health: "On Track",
    owner: "David W.", ownerTeam: "Workflow Platform", risk: "High", riskScore: 68,
    dependencies: ["Saga Engine", "Tool Registry", "Eval Harness"],
    executive: {
      what: "Build durable workflow runtime where agents execute long-horizon plans with checkpointing, retries, and human handoffs.",
      why: "Single LLM calls solve fragments; real work is multi-step. Without workflow durability, agents are toys.",
      whyEnterprisesStruggle: "LLM nondeterminism breaks classical workflow assumptions. Need new semantics for retry, replay, idempotency.",
      whySvInvesting: "Temporal, Inngest, Restate, LangGraph — entire category emerging around durable AI workflows.",
    },
    strategic: { businessValue: 90, complexity: 85, opRisk: 70, adoption: 42, maturity: 40 },
    industryChallenges: [
      "Determinism under LLM nondeterminism",
      "Long-horizon planning with reflection",
      "Cost control on agent loops",
      "Workflow versioning when prompts change",
    ],
    architecture: [
      { layer: "Orchestrator", desc: "Durable execution.", comps: ["Temporal Workers", "Workflow Versioning"] },
      { layer: "Planner", desc: "Generates and revises plans.", comps: ["Planner LLM", "Reflector"] },
      { layer: "Executor", desc: "Runs steps.", comps: ["Tool Invoker", "Saga Coordinator"] },
      { layer: "Checkpoint Store", desc: "Replayable state.", comps: ["Event Log", "Snapshot Store"] },
    ],
    adrs: [
      { id: "ADR-201", title: "Adopt Temporal for orchestration", decision: "All multi-step agent workflows run on Temporal.", consequence: "Operational complexity; durable guarantees." },
    ],
    risks: [
      { risk: "Infinite agent loops", likelihood: "Medium", impact: "High", owner: "David W.", mitigation: "Step budget + cost ceiling per workflow.", status: "Mitigating" },
    ],
    dependencyGraph: [
      { group: "Internal Teams", items: ["Platform", "Observability"] },
      { group: "External Vendors", items: ["Temporal Cloud"] },
      { group: "Models", items: ["GPT-4o", "Claude Sonnet"] },
    ],
    telemetry: [
      { name: "Workflow Success", value: "87%", trend: "up" },
      { name: "Avg Steps / Workflow", value: "11.3", trend: "up" },
      { name: "Cost / Workflow", value: "$0.78", trend: "flat" },
    ],
    knowledge: {
      google: "Vertex AI Agent Builder with deterministic graph execution.",
      openai: "Swarm + Responses API with stateful runs.",
      anthropic: "MCP + Claude with explicit step manifests.",
      microsoft: "Semantic Kernel planners with handlers.",
      patterns: ["Plan-Reflect-Refine", "Checkpoint per tool call", "Step budgets"],
      mistakes: ["No max-step guard", "Replaying without prompt pinning"],
      trends: ["Workflow-as-data", "Declarative agent DAGs"],
    },
    aiDetails: [
      { topic: "Architecture Patterns", detail: "Durable execution + LLM reflection + Saga compensation." },
      { topic: "Recovery Patterns", detail: "Resume from last checkpoint; replay with pinned prompt hash." },
    ],
    stories: [
      { id: "AI-103-1", title: "Workflow orchestration engine", points: 13, status: "In Progress", assignee: { initials: "DW", name: "David W.", color: "ai" }, risk: "OK",
        problem: "No durable runtime for multi-step agents.", acceptance: ["Temporal workers deployed", "Replay tested", "Versioning supported"], techDesign: "Temporal namespaces per tenant.", telemetry: ["workflow.duration.p95"], rollback: "Disable workflows; serve sync only." },
      { id: "AI-103-2", title: "Error handling & retry policies", points: 5, status: "To Do", assignee: { initials: "DW", name: "David W.", color: "ai" }, risk: "OK",
        problem: "Transient failures cascade.", acceptance: ["Exp backoff", "Non-retryable classified"], techDesign: "Policy table per error class.", telemetry: ["retry.rate"], rollback: "No retries (fail fast)." },
    ],
  },
  {
    id: "AI-104", num: 4, title: "Internal Systems → External Ecosystems",
    goal: "Connect internal AI to external partners, marketplaces, and APIs.",
    businessOutcome: "Open new revenue surface via partner integrations.",
    priority: "P0", points: 68, completion: 65, health: "On Track",
    owner: "Jin Y.", ownerTeam: "Integrations", risk: "Medium", riskScore: 48,
    dependencies: ["MCP", "API Gateway", "Identity"],
    executive: {
      what: "Extend AI surface beyond internal data/tools to a federated ecosystem of partner-provided tools, models, and data.",
      why: "Value compounds in ecosystems. No single vendor will own all capabilities.",
      whyEnterprisesStruggle: "Multi-party identity, schema interop, liability boundaries, billing reconciliation.",
      whySvInvesting: "Marketplaces (GPT Store, Claude Skills, Vertex Garden) — the App Store moment for AI.",
    },
    strategic: { businessValue: 80, complexity: 75, opRisk: 60, adoption: 50, maturity: 45 },
    industryChallenges: ["Multi-tenant trust boundaries", "Schema versioning", "Partner SLA propagation", "Billing reconciliation"],
    architecture: [
      { layer: "Federation Gateway", desc: "Routes to partners.", comps: ["mTLS", "Rate Limiter"] },
      { layer: "Trust Layer", desc: "Verifies provenance.", comps: ["JWT Validator", "Signed Catalogs"] },
    ],
    adrs: [{ id: "ADR-301", title: "Federated MCP", decision: "MCP servers can be partner-hosted.", consequence: "Need partner attestation." }],
    risks: [{ risk: "Partner outage cascade", likelihood: "Medium", impact: "High", owner: "Jin Y.", mitigation: "Bulkhead + fallback.", status: "Open" }],
    dependencyGraph: [{ group: "External Vendors", items: ["Stripe", "Salesforce", "Slack"] }, { group: "Tools / MCP Servers", items: ["Partner MCP catalog"] }],
    telemetry: [{ name: "Partner Calls", value: "1.2M/d", trend: "up" }, { name: "Partner Error Rate", value: "0.4%", trend: "down" }],
    knowledge: {
      google: "Vertex Extensions marketplace.",
      openai: "GPT Store + custom GPTs.",
      anthropic: "Claude MCP servers from partners.",
      microsoft: "Copilot connectors.",
      patterns: ["mTLS between MCP servers", "Per-partner rate limits"],
      mistakes: ["Trusting partner schemas blindly"],
      trends: ["Signed tool catalogs", "Reputation systems"],
    },
    aiDetails: [{ topic: "Security Model", detail: "Per-partner workload identity; signed manifests." }],
    stories: [
      { id: "AI-104-1", title: "MCP server integration framework", points: 8, status: "In Progress", assignee: { initials: "JY", name: "Jin Y.", color: "ai" }, risk: "OK",
        problem: "Each partner MCP requires bespoke wiring.", acceptance: ["Generic adapter", "Schema introspection"], techDesign: "MCP-spec compliant adapter generator.", telemetry: ["mcp.partners.active"], rollback: "Disable partner discovery." },
      { id: "AI-104-2", title: "API key vault & secret rotation", points: 3, status: "Done", assignee: { initials: "JY", name: "Jin Y.", color: "status-healthy" }, risk: "OK",
        problem: "Static API keys present rotation risk.", acceptance: ["90-day auto-rotation", "Zero downtime"], techDesign: "Vault transit engine.", telemetry: ["secret.rotation.success"], rollback: "Fall back to manual rotation." },
    ],
  },
  {
    id: "AI-105", num: 5, title: "Single Surface → Cross-Surface Experiences",
    goal: "Search in one place to experiences across surfaces.",
    businessOutcome: "Increase task completion across web, mobile, IDE, terminal.",
    priority: "P1", points: 81, completion: 45, health: "Blocked",
    owner: "Nina P.", ownerTeam: "Surface Eng", risk: "High", riskScore: 78,
    dependencies: ["Identity Federation", "Cross-surface sync"],
    executive: {
      what: "Continuous AI experience across web, mobile, desktop, IDE, terminal, voice.",
      why: "Users live in many surfaces; context must follow them.",
      whyEnterprisesStruggle: "Identity correlation, surface-specific UI affordances, network reliability variance.",
      whySvInvesting: "Apple Intelligence, Copilot in Windows + IDE, Gemini in Chrome — the ambient AI race.",
    },
    strategic: { businessValue: 78, complexity: 80, opRisk: 75, adoption: 28, maturity: 25 },
    industryChallenges: ["Cross-device identity", "Push notification reliability", "Offline behavior", "Surface-appropriate UX"],
    architecture: [{ layer: "Surface Router", desc: "Picks the right surface.", comps: ["Presence Service", "Notification Hub"] }],
    adrs: [{ id: "ADR-401", title: "Surface-agnostic state", decision: "All UI state is server-truth.", consequence: "Surfaces are thin clients." }],
    risks: [{ risk: "Identity Federation slip", likelihood: "High", impact: "Critical", owner: "Identity Team", mitigation: "Parallel work-stream.", status: "Blocked" }],
    dependencyGraph: [{ group: "Internal Teams", items: ["Identity", "Mobile", "Web"] }],
    telemetry: [{ name: "Cross-Surface Sessions", value: "18%", trend: "up" }],
    knowledge: {
      google: "Cross-device continuity via Google account.",
      openai: "ChatGPT desktop + web + mobile parity.",
      anthropic: "Claude desktop with screen awareness.",
      microsoft: "Copilot across Edge, Office, Windows.",
      patterns: ["Server-truth state", "Optimistic UI"],
      mistakes: ["Surface-local state divergence"],
      trends: ["Ambient agents", "Continuity APIs"],
    },
    aiDetails: [{ topic: "Identity Model", detail: "Single user identity across surfaces; per-surface workload identity." }],
    stories: [
      { id: "AI-105-1", title: "Cross-surface identity resolution", points: 8, status: "In Progress", assignee: { initials: "NP", name: "Nina P.", color: "status-critical" }, risk: "Blocked",
        problem: "User identity not propagating across surfaces.", acceptance: ["Single sub claim", "Device binding"], techDesign: "OIDC with device-bound tokens.", telemetry: ["identity.resolution.success"], rollback: "Per-surface login fallback." },
      { id: "AI-105-2", title: "Experience consistency layer", points: 5, status: "To Do", assignee: { initials: "NP", name: "Nina P.", color: "ai" }, risk: "OK",
        problem: "UX diverges per surface.", acceptance: ["Shared design tokens", "Behavior parity tests"], techDesign: "Headless UX state machine.", telemetry: ["ux.parity.score"], rollback: "N/A." },
    ],
  },
  {
    id: "AI-106", num: 6, title: "Deterministic → Probabilistic Systems",
    goal: "Predictable outputs to probabilistic behavior with confidence bounds.",
    businessOutcome: "Surface uncertainty to users; reduce overconfident wrong answers.",
    priority: "P1", points: 67, completion: 40, health: "At Risk",
    owner: "Karan S.", ownerTeam: "ML Foundations", risk: "High", riskScore: 70,
    dependencies: ["Eval Harness", "Calibration Pipeline"],
    executive: {
      what: "Treat AI outputs as probability distributions with explicit confidence, not deterministic answers.",
      why: "Overconfident AI is the #1 cause of user trust collapse.",
      whyEnterprisesStruggle: "No mature tooling for calibration in production LLMs.",
      whySvInvesting: "Anthropic's interpretability work, OpenAI's calibration research — frontier labs all investing.",
    },
    strategic: { businessValue: 85, complexity: 90, opRisk: 82, adoption: 22, maturity: 20 },
    industryChallenges: ["LLMs are uncalibrated by default", "Surfacing uncertainty without confusing users", "Selective abstention"],
    architecture: [
      { layer: "Confidence Layer", desc: "Estimates output uncertainty.", comps: ["Verifier Ensemble", "Self-Consistency"] },
      { layer: "Calibration", desc: "Maps raw scores to probabilities.", comps: ["Platt Scaling", "Temperature Scaling"] },
    ],
    adrs: [{ id: "ADR-501", title: "Abstain by default at low confidence", decision: "If confidence < 0.7, abstain or escalate.", consequence: "Lower coverage; higher precision." }],
    risks: [{ risk: "Calibration drift over time", likelihood: "High", impact: "High", owner: "Karan S.", mitigation: "Continuous calibration jobs.", status: "Mitigating" }],
    dependencyGraph: [{ group: "Internal Teams", items: ["ML Platform"] }, { group: "Models", items: ["All inference endpoints"] }],
    telemetry: [{ name: "ECE (Calibration Error)", value: "0.04", trend: "down" }, { name: "Abstention Rate", value: "8.2%", trend: "flat" }],
    knowledge: {
      google: "Built-in confidence head on Gemini.",
      openai: "Log-prob exposure on completions.",
      anthropic: "Constitutional self-critique for confidence.",
      microsoft: "Groundedness scoring via Azure Content Safety.",
      patterns: ["Self-consistency voting", "Verifier ensemble", "Abstention head"],
      mistakes: ["Treating raw softmax as probability"],
      trends: ["Conformal prediction for LLMs"],
    },
    aiDetails: [{ topic: "Evaluation Framework", detail: "Brier score, ECE, selective accuracy curves." }],
    stories: [
      { id: "AI-106-1", title: "Uncertainty quantification service", points: 8, status: "In Review", assignee: { initials: "KS", name: "Karan S.", color: "status-warning" }, risk: "OK",
        problem: "No uncertainty surfaced to downstream consumers.", acceptance: ["Confidence on every response", "Calibrated weekly"], techDesign: "Sidecar verifier with conformal prediction.", telemetry: ["confidence.distribution"], rollback: "Hide confidence in UI." },
      { id: "AI-106-2", title: "Confidence calibration pipeline", points: 5, status: "To Do", assignee: { initials: "KS", name: "Karan S.", color: "ai" }, risk: "OK",
        problem: "Confidence drifts as data shifts.", acceptance: ["Weekly recalibration job", "ECE alarms"], techDesign: "Airflow DAG over eval set.", telemetry: ["calibration.ece"], rollback: "Use last-known calibration." },
    ],
  },
  {
    id: "AI-107", num: 7, title: "Model Quality → Outcome Quality",
    goal: "Focus shifts from model accuracy to real-world outcome quality.",
    businessOutcome: "Measure success by business outcomes, not benchmarks.",
    priority: "P1", points: 62, completion: 35, health: "At Risk",
    owner: "Liza T.", ownerTeam: "Eval & QA", risk: "Medium", riskScore: 58,
    dependencies: ["Telemetry", "Outcome Attribution"],
    executive: {
      what: "Replace benchmark obsession with outcome-grounded evals tied to business metrics.",
      why: "Benchmarks don't predict business value.",
      whyEnterprisesStruggle: "Outcome attribution is hard; counterfactuals are expensive.",
      whySvInvesting: "Companies like Patronus, Braintrust, Vellum building outcome-eval platforms.",
    },
    strategic: { businessValue: 88, complexity: 78, opRisk: 65, adoption: 35, maturity: 30 },
    industryChallenges: ["Outcome attribution", "Counterfactual evaluation", "Delayed outcomes"],
    architecture: [{ layer: "Outcome Tracker", desc: "Links agent action → business event.", comps: ["Attribution Engine", "Counterfactual Sim"] }],
    adrs: [{ id: "ADR-601", title: "All evals must include outcome metric", decision: "Reject evals that only score model output.", consequence: "Higher eval cost; truer signal." }],
    risks: [{ risk: "Outcome signal too noisy", likelihood: "Medium", impact: "High", owner: "Liza T.", mitigation: "Bayesian smoothing + larger windows.", status: "Mitigating" }],
    dependencyGraph: [{ group: "Internal Teams", items: ["Analytics", "Product"] }],
    telemetry: [{ name: "Outcome Success Rate", value: "76%", trend: "up" }],
    knowledge: {
      google: "OKR-driven eval at every Gemini release.",
      openai: "User-graded outcome evals in production.",
      anthropic: "Outcome evals shipped with Claude eval harness.",
      microsoft: "Copilot business value tracking via Viva.",
      patterns: ["A/B with outcome metric", "Bayesian attribution"],
      mistakes: ["Optimizing benchmark scores"],
      trends: ["Causal eval frameworks"],
    },
    aiDetails: [{ topic: "Evaluation Framework", detail: "Outcome-grounded eval + counterfactual baselines + delayed reward windows." }],
    stories: [
      { id: "AI-107-1", title: "Outcome metrics & instrumentation", points: 8, status: "In Progress", assignee: { initials: "LT", name: "Liza T.", color: "ai" }, risk: "OK",
        problem: "No standardized outcome metric instrumentation.", acceptance: ["Event spec defined", "All agents emit outcome events"], techDesign: "Outcome event schema in OTel; ingested into warehouse.", telemetry: ["outcome.events.rate"], rollback: "Continue legacy metrics." },
      { id: "AI-107-2", title: "A/B test framework for outcomes", points: 3, status: "To Do", assignee: { initials: "LT", name: "Liza T.", color: "ai" }, risk: "OK",
        problem: "No way to A/B by outcome.", acceptance: ["Bucketing service", "Sequential testing"], techDesign: "Stat-engine with mSPRT.", telemetry: ["ab.experiments.active"], rollback: "Use existing experimentation tool." },
    ],
  },
  {
    id: "AI-108", num: 8, title: "Experimentation → Production Operations",
    goal: "Prototypes to reliable, scalable production operations.",
    businessOutcome: "Reduce MTTR; increase deploy frequency; harden AI ops.",
    priority: "P1", points: 110, completion: 30, health: "On Track",
    owner: "Omar H.", ownerTeam: "AI SRE", risk: "Medium", riskScore: 52,
    dependencies: ["Eval Harness", "CI/CD", "Observability"],
    executive: {
      what: "Bring SRE rigor to LLM systems: SLOs, error budgets, deploys, rollbacks, on-call.",
      why: "Notebook → prod is where most AI initiatives die.",
      whyEnterprisesStruggle: "AI infra is new; runbooks and SLO traditions don't translate cleanly.",
      whySvInvesting: "LLMOps category: Weights & Biases, Arize, WhyLabs, Fiddler.",
    },
    strategic: { businessValue: 92, complexity: 70, opRisk: 60, adoption: 48, maturity: 50 },
    industryChallenges: ["LLM-specific SLOs (factuality, safety)", "Prompt versioning", "Eval-gated CD", "Cost-aware autoscaling"],
    architecture: [
      { layer: "CI/CD", desc: "Eval-gated pipelines.", comps: ["Eval Gates", "Canary Deployer"] },
      { layer: "Observability", desc: "AI-native traces.", comps: ["OTel GenAI", "Trace Sampler"] },
      { layer: "Runtime", desc: "Cost-aware autoscale.", comps: ["KV Cache Pool", "Router"] },
    ],
    adrs: [
      { id: "ADR-701", title: "Eval-gated CD", decision: "No prompt change ships without passing eval bar.", consequence: "Slower deploys; safer." },
      { id: "ADR-702", title: "Prompt versioning in git", decision: "All prompts versioned alongside code.", consequence: "Reviewable like code." },
    ],
    risks: [{ risk: "Eval suite too slow", likelihood: "Medium", impact: "Medium", owner: "Omar H.", mitigation: "Parallel eval shards.", status: "Mitigating" }],
    dependencyGraph: [{ group: "Internal Teams", items: ["Platform", "Eval"] }, { group: "Tools", items: ["GitHub Actions", "Argo"] }],
    telemetry: [
      { name: "Deploy Frequency", value: "12/d", trend: "up" },
      { name: "Change Failure Rate", value: "3.4%", trend: "down" },
      { name: "MTTR", value: "18m", trend: "down" },
      { name: "AI Reliability SLO", value: "99.2%", trend: "up" },
    ],
    knowledge: {
      google: "Vertex Model Registry + Eval as a Service.",
      openai: "Evals API + Responses logging.",
      anthropic: "Claude eval harness.",
      microsoft: "Azure AI Studio with Prompt Flow.",
      patterns: ["Eval-gated CD", "Canary with shadow", "Cost-aware autoscale"],
      mistakes: ["Shipping prompts without eval", "No SLOs on factuality"],
      trends: ["LLMOps consolidation", "Eval marketplaces"],
    },
    aiDetails: [
      { topic: "SLO Design", detail: "Availability + factuality + cost SLO." },
      { topic: "Rollback Strategy", detail: "Prompt version pinning + model version pinning + traffic split." },
    ],
    stories: [
      { id: "AI-108-1", title: "CI/CD for models & prompts", points: 13, status: "In Progress", assignee: { initials: "OH", name: "Omar H.", color: "ai" }, risk: "OK",
        problem: "No eval-gated CD path.", acceptance: ["Eval gate in pipeline", "Canary deploys"], techDesign: "GitHub Actions → eval runner → Argo Rollouts.", telemetry: ["deploy.success.rate"], rollback: "Manual deploy fallback." },
      { id: "AI-108-2", title: "Canary deploy & rollback", points: 5, status: "To Do", assignee: { initials: "OH", name: "Omar H.", color: "ai" }, risk: "OK",
        problem: "All-or-nothing prompt rollouts.", acceptance: ["1/5/25/100% canary", "Auto-rollback on SLO breach"], techDesign: "Argo Rollouts + analysis templates.", telemetry: ["canary.steps", "rollback.count"], rollback: "Pin previous version." },
    ],
  },
];

const KPIS = [
  { label: "Program Completion", value: "47%", trend: "+3% vs sprint", color: "ai" },
  { label: "Sprint Completion", value: "42%", trend: "On pace", color: "status-info" },
  { label: "Velocity (5-spr avg)", value: "38 SP", trend: "Stable", color: "status-healthy" },
  { label: "Blocked Stories", value: "8", trend: "+2 since Mon", color: "status-critical" },
  { label: "Engineering Capacity", value: "37/42", trend: "88% util", color: "status-healthy" },
  { label: "Deploy Frequency", value: "12/d", trend: "↑ 18%", color: "ai" },
  { label: "Change Failure Rate", value: "3.4%", trend: "↓ 0.6pp", color: "status-healthy" },
  { label: "AI Reliability SLO", value: "99.2%", trend: "Above target", color: "status-healthy" },
  { label: "Cost / Workflow", value: "$0.78", trend: "↓ 4%", color: "status-healthy" },
  { label: "MTTR", value: "18m", trend: "↓ 6m", color: "status-healthy" },
  { label: "Eval Score", value: "0.82", trend: "↑ 0.03", color: "ai" },
  { label: "Outcome Success", value: "76%", trend: "↑ 2pp", color: "ai" },
];

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "backlog", label: "Backlog", icon: ListChecks },
  { key: "sprint", label: "Sprint Board", icon: KanbanSquare },
  { key: "risks", label: "Program Risks", icon: AlertTriangle },
  { key: "deps", label: "Dependencies", icon: GitBranch },
  { key: "arch", label: "AI Architecture", icon: Cpu },
  { key: "telemetry", label: "Telemetry", icon: Activity },
  { key: "roadmap", label: "Roadmap", icon: Map },
  { key: "teams", label: "Teams", icon: Users },
  { key: "settings", label: "Settings", icon: Cog },
];

const PROGRAM_INSIGHTS = [
  { tone: "warn", text: "Persistent Agents (AI-102) is likely to slip 2 sprints due to MCP dependency delays." },
  { tone: "warn", text: "Model Quality → Outcome Quality (AI-107) showing increasing defect density in last 3 sprints." },
  { tone: "block", text: "Cross-Surface Experiences (AI-105) blocked by Identity Federation completion (ETA: Sprint 20)." },
  { tone: "info", text: "Velocity trending stable at 38 SP/sprint; recommend committing 36 SP for Sprint 19." },
  { tone: "info", text: "AI Reliability SLO healthy (99.2%) — burn rate well under budget." },
];

/* ============================================================
   PAGE
============================================================ */

export default function AiEngineeringBacklog() {
  const [activeNav, setActiveNav] = useState("overview");
  const [openEpic, setOpenEpic] = useState<Epic | null>(null);
  const [openStory, setOpenStory] = useState<Story | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <AppShell>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        {/* Inner sub-nav */}
        <aside className="w-56 shrink-0 border-r border-border bg-card/60 backdrop-blur-sm">
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-ai to-indigo grid place-items-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">AI Engineering</div>
                <div className="text-[13px] font-bold">Backlog</div>
              </div>
            </div>
          </div>
          <nav className="p-2 space-y-0.5">
            {NAV_ITEMS.map((n) => (
              <button
                key={n.key}
                onClick={() => setActiveNav(n.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                  activeNav === n.key
                    ? "bg-ai-soft text-ai"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">
          <TopHeader now={now} />
          <main className="flex-1 px-6 py-5 space-y-5 animate-fade-in overflow-x-hidden">
            {activeNav === "overview" && (
              <>
                <KpiRibbon />
                <div className="grid grid-cols-12 gap-5">
                  <ProductBacklogPanel epics={EPICS} onOpen={setOpenEpic} />
                  <SprintBacklogPanel epics={EPICS} onOpenStory={setOpenStory} />
                </div>
                <BottomOpsMetrics />
              </>
            )}
            {activeNav === "backlog" && <FullBacklogView epics={EPICS} onOpen={setOpenEpic} />}
            {activeNav === "sprint" && <SprintBoardView epics={EPICS} onOpenStory={setOpenStory} />}
            {activeNav === "risks" && <RisksView epics={EPICS} />}
            {activeNav === "deps" && <DependenciesView epics={EPICS} />}
            {activeNav === "arch" && <ArchitectureView epics={EPICS} onOpen={setOpenEpic} />}
            {activeNav === "telemetry" && <TelemetryView />}
            {activeNav === "roadmap" && <RoadmapView epics={EPICS} />}
            {activeNav === "teams" && <TeamsView epics={EPICS} />}
            {activeNav === "settings" && <SettingsView />}
          </main>
        </div>
      </div>

      {/* Epic slide-out */}
      <Sheet open={!!openEpic} onOpenChange={(o) => !o && setOpenEpic(null)}>
        <SheetContent side="right" className="w-[44rem] sm:max-w-[44rem] p-0 overflow-y-auto">
          {openEpic && <EpicIntelligencePanel epic={openEpic} />}
        </SheetContent>
      </Sheet>

      {/* Story slide-out */}
      <Sheet open={!!openStory} onOpenChange={(o) => !o && setOpenStory(null)}>
        <SheetContent side="right" className="w-[36rem] sm:max-w-[36rem] p-0 overflow-y-auto">
          {openStory && <StoryDetailPanel story={openStory} />}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

/* ============================================================
   HEADER
============================================================ */

function TopHeader({ now }: { now: Date }) {
  return (
    <header className="px-6 py-4 border-b border-border bg-card/60 backdrop-blur-sm flex items-center gap-6">
      <div>
        <h1 className="text-[20px] font-bold tracking-tight">AI Engineering – Agile Delivery Dashboard</h1>
        <p className="text-[12px] text-muted-foreground">Operationalizing Agentic AI Capabilities</p>
      </div>
      <div className="flex-1" />
      <HeaderField label="Program" value="Agentic AI Platform" />
      <HeaderField label="Team" value="AI Engineering" />
      <HeaderField label="Sprint" value="Sprint 18 (May 20 – Jun 2)" />
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold">Last Updated</div>
          <div className="text-[12px] font-semibold text-foreground">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        <button className="h-8 w-8 grid place-items-center rounded-md hover:bg-accent">
          <RefreshCcw className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}

function HeaderField({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-1.5 rounded-lg border border-border bg-background">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
      <div className="text-[12px] font-semibold flex items-center gap-1">
        {value} <ChevronRight className="h-3 w-3 text-muted-foreground rotate-90" />
      </div>
    </div>
  );
}

/* ============================================================
   KPI RIBBON
============================================================ */

function KpiRibbon() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-3">
      {KPIS.map((k) => (
        <button
          key={k.label}
          className="text-left rounded-xl border border-border bg-card p-3 hover:border-ai/40 hover:shadow-md transition-all"
        >
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold leading-tight">
            {k.label}
          </div>
          <div className="text-[18px] font-bold mt-1" style={{ color: `hsl(var(--${k.color}))` }}>
            {k.value}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{k.trend}</div>
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   PRODUCT BACKLOG
============================================================ */

function ProductBacklogPanel({ epics, onOpen }: { epics: Epic[]; onOpen: (e: Epic) => void }) {
  return (
    <Card title="Product Backlog" subtitle={`642 Story Points · 58 Epics`} className="col-span-12 xl:col-span-5">
      <div className="grid grid-cols-[24px_1fr_70px_60px_60px_120px] gap-2 px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
        <span>#</span>
        <span>Epic / Capability</span>
        <span className="text-right">SP</span>
        <span>Priority</span>
        <span>%</span>
        <span>Status</span>
      </div>
      <ul className="divide-y divide-border">
        {epics.map((e) => (
          <li key={e.id}>
            <button
              onClick={() => onOpen(e)}
              className="w-full grid grid-cols-[24px_1fr_70px_60px_60px_120px] gap-2 items-center px-2 py-2.5 text-left hover:bg-accent/40 rounded-md transition-colors"
            >
              <span className="h-5 w-5 rounded-full bg-ai-soft text-ai grid place-items-center text-[10px] font-bold">
                {e.num}
              </span>
              <div className="min-w-0">
                <div className="text-[12px] font-bold truncate">{e.title}</div>
                <div className="text-[10px] text-muted-foreground truncate">{e.goal}</div>
              </div>
              <span className="text-[12px] font-semibold text-right tabular-nums">{e.points}</span>
              <PriorityChip p={e.priority} />
              <span className="text-[11px] font-semibold tabular-nums">{e.completion}%</span>
              <div className="flex items-center gap-2">
                <Progress value={e.completion} className="h-1.5 flex-1" />
                <HealthChip h={e.health} compact />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============================================================
   SPRINT BACKLOG
============================================================ */

function SprintBacklogPanel({ epics, onOpenStory }: { epics: Epic[]; onOpenStory: (s: Story) => void }) {
  const sprintStories = epics.flatMap((e) => e.stories.map((s) => ({ ...s, epic: e })));
  return (
    <Card
      title="Sprint Backlog"
      subtitle={`Sprint 18 · May 20 – Jun 2 · ${sprintStories.reduce((a, s) => a + s.points, 0)} SP · ${sprintStories.length} stories`}
      className="col-span-12 xl:col-span-7"
    >
      <ul className="divide-y divide-border">
        {sprintStories.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => onOpenStory(s)}
              className="w-full grid grid-cols-[1fr_56px_50px_90px_28px] gap-2 items-center px-2 py-2 text-left hover:bg-accent/40 rounded-md transition-colors"
            >
              <div className="min-w-0">
                <div className="text-[12px] font-semibold truncate">{s.title}</div>
                <div className="text-[10px] text-muted-foreground">{s.id}</div>
              </div>
              <span className="text-[11px] font-semibold tabular-nums text-right">{s.points} SP</span>
              <StatusChip status={s.status} />
              <div className="flex items-center gap-1.5">
                <span
                  className="h-5 w-5 rounded-full grid place-items-center text-[9px] font-bold text-white"
                  style={{ background: `hsl(var(--${s.assignee.color}))` }}
                >
                  {s.assignee.initials}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">{s.assignee.name.split(" ")[0]}</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ============================================================
   INTELLIGENCE PANEL
============================================================ */

function IntelligencePanel() {
  return (
    <div className="col-span-12 xl:col-span-3 space-y-4">
      <Card title="Sprint Burndown" subtitle="Ideal vs Actual">
        <BurndownChart />
      </Card>
      <Card title="Program Intelligence" subtitle="AI-generated insights" accent>
        <ul className="space-y-2">
          {PROGRAM_INSIGHTS.map((i, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[11px]">
              <span
                className="mt-0.5 h-2 w-2 rounded-full shrink-0"
                style={{
                  background:
                    i.tone === "block"
                      ? "hsl(var(--status-critical))"
                      : i.tone === "warn"
                      ? "hsl(var(--status-warning))"
                      : "hsl(var(--ai))",
                }}
              />
              <span className="leading-relaxed">{i.text}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Upcoming (Sprint 19)" subtitle="Jun 3 – Jun 16">
        <ul className="space-y-1.5 text-[11px]">
          {[
            ["AI-101-3", "Human-in-the-loop escalation"],
            ["AI-102-3", "Long-term memory compaction"],
            ["AI-103-3", "Parallel step execution"],
            ["AI-104-3", "Third-party tool marketplace"],
            ["AI-105-3", "Personalization at scale"],
          ].map(([id, t]) => (
            <li key={id} className="flex items-center justify-between gap-2">
              <span className="font-mono text-muted-foreground">{id}</span>
              <span className="flex-1 truncate">{t}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function BurndownChart() {
  // Simple SVG burndown
  const points = [200, 190, 175, 160, 140, 120, 95, 75, 50, 30];
  const ideal = points.map((_, i) => 200 - (200 / (points.length - 1)) * i);
  const w = 240, h = 110, pad = 16;
  const xs = (i: number) => pad + (i * (w - pad * 2)) / (points.length - 1);
  const ys = (v: number) => h - pad - (v * (h - pad * 2)) / 200;
  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${xs(i)},${ys(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
      <path d={path(ideal)} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="3 3" />
      <path d={path(points)} fill="none" stroke="hsl(var(--ai))" strokeWidth="2" />
      {points.map((v, i) => (
        <circle key={i} cx={xs(i)} cy={ys(v)} r="2.5" fill="hsl(var(--ai))" />
      ))}
      <text x={pad} y={10} fontSize="8" fill="hsl(var(--muted-foreground))">200 SP</text>
      <text x={w - 30} y={h - 4} fontSize="8" fill="hsl(var(--muted-foreground))">Jun 2</text>
      <text x={pad} y={h - 4} fontSize="8" fill="hsl(var(--muted-foreground))">May 20</text>
    </svg>
  );
}

/* ============================================================
   BOTTOM OPS METRICS
============================================================ */

function BottomOpsMetrics() {
  const cards = [
    { label: "Estimated vs Actual", value: "±12%", status: "Within Threshold", color: "status-healthy" },
    { label: "Requirements Clarity", value: "87%", status: "Good", color: "status-healthy" },
    { label: "Dependency Health", value: "92%", status: "Good", color: "status-healthy" },
    { label: "Technical Debt Ratio", value: "14%", status: "Healthy", color: "status-healthy" },
    { label: "Test Coverage", value: "76%", status: "Needs Improvement", color: "status-warning" },
    { label: "Change Failure Rate", value: "3.4%", status: "Within Threshold", color: "status-healthy" },
    { label: "Team Capacity", value: "37 / 42", status: "88% Utilization", color: "ai" },
  ];
  return (
    <Card title="Backlog Health" subtitle="Operational delivery metrics">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-background p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{c.label}</div>
            <div className="text-[18px] font-bold mt-1">{c.value}</div>
            <div className="text-[10px] mt-0.5 font-semibold" style={{ color: `hsl(var(--${c.color}))` }}>{c.status}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============================================================
   EPIC INTELLIGENCE PANEL (slide-out)
============================================================ */

function EpicIntelligencePanel({ epic }: { epic: Epic }) {
  return (
    <div>
      <SheetHeader className="px-6 py-5 border-b border-border bg-gradient-to-br from-ai-soft to-background">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-ai text-white grid place-items-center font-bold">
            {epic.num}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{epic.id}</Badge>
              <PriorityChip p={epic.priority} />
              <HealthChip h={epic.health} />
            </div>
            <SheetTitle className="text-[18px] mt-1.5">{epic.title}</SheetTitle>
            <p className="text-[12px] text-muted-foreground mt-1">{epic.goal}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4">
          <Stat label="Owner" value={epic.owner} />
          <Stat label="Team" value={epic.ownerTeam} />
          <Stat label="Story Points" value={`${epic.points}`} />
          <Stat label="Completion" value={`${epic.completion}%`} />
        </div>
      </SheetHeader>

      <Tabs defaultValue="exec" className="px-6 py-4">
        <TabsList className="flex flex-wrap h-auto gap-1 justify-start bg-muted/40 p-1">
          {[
            ["exec", "Executive"],
            ["strategic", "Strategic"],
            ["arch", "Architecture"],
            ["backlog", "Backlog"],
            ["adr", "Decisions"],
            ["risks", "Risks"],
            ["deps", "Dependencies"],
            ["tel", "Telemetry"],
            ["ai", "AI Details"],
            ["know", "Knowledge"],
          ].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="text-[11px] h-7 px-2.5">{l}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="exec" className="mt-4 space-y-4">
          <ExecBlock title="What is this initiative?" text={epic.executive.what} />
          <ExecBlock title="Why does it matter?" text={epic.executive.why} />
          <ExecBlock title="Why are enterprises struggling?" text={epic.executive.whyEnterprisesStruggle} />
          <ExecBlock title="Why is Silicon Valley investing heavily?" text={epic.executive.whySvInvesting} />
          <div>
            <SectionLabel>Current Industry Challenges</SectionLabel>
            <ul className="space-y-1.5">
              {epic.industryChallenges.map((c) => (
                <li key={c} className="text-[12px] flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-status-warning mt-0.5 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="strategic" className="mt-4 space-y-3">
          {Object.entries(epic.strategic).map(([k, v]) => (
            <div key={k}>
              <div className="flex items-center justify-between text-[12px] mb-1">
                <span className="font-semibold capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                <span className="font-bold">{v}/100</span>
              </div>
              <Progress value={v} className="h-2" />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="arch" className="mt-4 space-y-2">
          <SectionLabel>Reference Architecture</SectionLabel>
          {epic.architecture.map((l) => (
            <details key={l.layer} className="group rounded-lg border border-border bg-card">
              <summary className="cursor-pointer px-3 py-2 flex items-center gap-2 hover:bg-accent/40 rounded-lg">
                <Layers className="h-3.5 w-3.5 text-ai" />
                <span className="text-[12px] font-bold">{l.layer}</span>
                <span className="text-[11px] text-muted-foreground">— {l.desc}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-3 pb-3 pt-1 flex flex-wrap gap-1.5">
                {l.comps.map((c) => (
                  <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                ))}
              </div>
            </details>
          ))}
        </TabsContent>

        <TabsContent value="backlog" className="mt-4 space-y-2">
          {epic.stories.map((s) => (
            <div key={s.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px]">{s.id}</Badge>
                <StatusChip status={s.status} />
                <span className="text-[11px] text-muted-foreground ml-auto">{s.points} SP · {s.assignee.name}</span>
              </div>
              <div className="text-[12px] font-semibold">{s.title}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.problem}</div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="adr" className="mt-4 space-y-2">
          {epic.adrs.map((a) => (
            <details key={a.id} className="group rounded-lg border border-border bg-card">
              <summary className="cursor-pointer px-3 py-2 hover:bg-accent/40 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-ai" />
                  <span className="text-[11px] font-mono text-muted-foreground">{a.id}</span>
                  <span className="text-[12px] font-semibold">{a.title}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto group-open:rotate-90 transition-transform" />
                </div>
              </summary>
              <div className="px-3 pb-3 pt-1 space-y-1.5">
                <div><span className="text-[10px] uppercase font-bold text-muted-foreground">Decision · </span><span className="text-[12px]">{a.decision}</span></div>
                <div><span className="text-[10px] uppercase font-bold text-muted-foreground">Consequence · </span><span className="text-[12px]">{a.consequence}</span></div>
              </div>
            </details>
          ))}
        </TabsContent>

        <TabsContent value="risks" className="mt-4">
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-[11px]">
              <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-2 py-2 text-left">Risk</th>
                  <th className="px-2 py-2">Likelihood</th>
                  <th className="px-2 py-2">Impact</th>
                  <th className="px-2 py-2 text-left">Mitigation</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {epic.risks.map((r) => (
                  <tr key={r.risk} className="border-t border-border">
                    <td className="px-2 py-2 font-semibold">{r.risk}</td>
                    <td className="px-2 py-2 text-center">{r.likelihood}</td>
                    <td className="px-2 py-2 text-center">{r.impact}</td>
                    <td className="px-2 py-2">{r.mitigation}</td>
                    <td className="px-2 py-2 text-center">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="deps" className="mt-4 space-y-3">
          {epic.dependencyGraph.map((g) => (
            <div key={g.group}>
              <SectionLabel>{g.group}</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((i) => (
                  <Badge key={i} variant="outline" className="text-[10px]">
                    <Network className="h-3 w-3 mr-1" /> {i}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="tel" className="mt-4 grid grid-cols-2 gap-3">
          {epic.telemetry.map((t) => (
            <div key={t.name} className="rounded-lg border border-border bg-card p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t.name}</div>
              <div className="flex items-end gap-1 mt-1">
                <span className="text-[18px] font-bold">{t.value}</span>
                <TrendingUp className={`h-3.5 w-3.5 mb-1 ${t.trend === "down" ? "rotate-180 text-status-healthy" : t.trend === "up" ? "text-ai" : "text-muted-foreground"}`} />
              </div>
              <Sparkline />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="ai" className="mt-4 space-y-2">
          {epic.aiDetails.map((d) => (
            <div key={d.topic} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <Brain className="h-3.5 w-3.5 text-ai" />
                <span className="text-[12px] font-bold">{d.topic}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{d.detail}</div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="know" className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Google", epic.knowledge.google],
              ["OpenAI", epic.knowledge.openai],
              ["Anthropic", epic.knowledge.anthropic],
              ["Microsoft", epic.knowledge.microsoft],
            ].map(([n, t]) => (
              <div key={n} className="rounded-lg border border-border bg-card p-3">
                <div className="text-[11px] font-bold text-ai">{n}</div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{t}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <KnowList title="Recommended Patterns" items={epic.knowledge.patterns} tone="healthy" />
            <KnowList title="Common Mistakes" items={epic.knowledge.mistakes} tone="critical" />
            <KnowList title="Future Trends" items={epic.knowledge.trends} tone="ai" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Sparkline() {
  const points = useMemo(() => Array.from({ length: 10 }, () => 30 + Math.random() * 60), []);
  return (
    <svg viewBox="0 0 100 24" className="w-full h-6 mt-1">
      <polyline
        points={points.map((v, i) => `${(i * 100) / 9},${24 - (v * 24) / 100}`).join(" ")}
        fill="none"
        stroke="hsl(var(--ai))"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function KnowList({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: `hsl(var(--status-${tone}))` }}>
        {tone === "ai" ? title : title}
      </div>
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i} className="text-[11px] flex items-start gap-1.5">
            <CircleDot className="h-2.5 w-2.5 mt-1 shrink-0" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExecBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-bold tracking-wider text-ai mb-1">{title}</div>
      <p className="text-[12px] leading-relaxed">{text}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2">{children}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
      <div className="text-[12px] font-semibold truncate">{value}</div>
    </div>
  );
}

/* ============================================================
   STORY DETAIL PANEL
============================================================ */

function StoryDetailPanel({ story }: { story: Story }) {
  return (
    <div>
      <SheetHeader className="px-6 py-5 border-b border-border bg-gradient-to-br from-ai-soft to-background">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">{story.id}</Badge>
          <StatusChip status={story.status} />
          <span className="text-[11px] text-muted-foreground ml-auto">{story.points} SP</span>
        </div>
        <SheetTitle className="text-[16px] mt-2">{story.title}</SheetTitle>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold text-white"
            style={{ background: `hsl(var(--${story.assignee.color}))` }}
          >
            {story.assignee.initials}
          </span>
          <span className="text-[12px] font-semibold">{story.assignee.name}</span>
        </div>
      </SheetHeader>
      <div className="px-6 py-4 space-y-4">
        <Block title="Problem Statement" body={story.problem} />
        <Block title="Acceptance Criteria">
          <ul className="space-y-1.5">
            {story.acceptance.map((a) => (
              <li key={a} className="text-[12px] flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-status-healthy mt-0.5 shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        </Block>
        <Block title="Technical Design" body={story.techDesign} />
        <Block title="Telemetry">
          <div className="flex flex-wrap gap-1.5">
            {story.telemetry.map((t) => (
              <Badge key={t} variant="secondary" className="font-mono text-[10px]">{t}</Badge>
            ))}
          </div>
        </Block>
        <Block title="Rollback Plan" body={story.rollback} />
      </div>
    </div>
  );
}

function Block({ title, body, children }: { title: string; body?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-[10px] uppercase font-bold tracking-wider text-ai mb-1.5">{title}</div>
      {body && <p className="text-[12px] leading-relaxed">{body}</p>}
      {children}
    </div>
  );
}

/* ============================================================
   ALTERNATE VIEWS
============================================================ */

function FullBacklogView({ epics, onOpen }: { epics: Epic[]; onOpen: (e: Epic) => void }) {
  return (
    <>
      <KpiRibbon />
      <Card title="Full Product Backlog" subtitle={`${epics.length} epics`}>
        <ProductBacklogPanel epics={epics} onOpen={onOpen} />
      </Card>
    </>
  );
}

function SprintBoardView({ epics, onOpenStory }: { epics: Epic[]; onOpenStory: (s: Story) => void }) {
  const cols: Story["status"][] = ["To Do", "In Progress", "In Review", "Done"];
  const all = epics.flatMap((e) => e.stories);
  return (
    <Card title="Sprint Board" subtitle="Sprint 18">
      <div className="grid grid-cols-4 gap-3">
        {cols.map((c) => (
          <div key={c} className="rounded-xl bg-muted/40 p-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              {c} · {all.filter((s) => s.status === c).length}
            </div>
            <div className="space-y-2">
              {all
                .filter((s) => s.status === c)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onOpenStory(s)}
                    className="w-full rounded-lg border border-border bg-card p-2.5 text-left hover:border-ai/40 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge variant="outline" className="text-[9px]">{s.id}</Badge>
                      <span className="text-[10px] text-muted-foreground ml-auto">{s.points} SP</span>
                    </div>
                    <div className="text-[12px] font-semibold leading-tight">{s.title}</div>
                    <div className="flex items-center gap-1 mt-2">
                      <span
                        className="h-5 w-5 rounded-full grid place-items-center text-[9px] font-bold text-white"
                        style={{ background: `hsl(var(--${s.assignee.color}))` }}
                      >
                        {s.assignee.initials}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{s.assignee.name}</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RisksView({ epics }: { epics: Epic[] }) {
  const all = epics.flatMap((e) => e.risks.map((r) => ({ ...r, epic: e.title })));
  return (
    <Card title="Program Risk Register" subtitle={`${all.length} active risks across ${epics.length} epics`}>
      <table className="w-full text-[12px]">
        <thead className="text-[10px] uppercase text-muted-foreground border-b border-border">
          <tr>
            <th className="px-2 py-2 text-left">Risk</th>
            <th className="px-2 py-2 text-left">Epic</th>
            <th className="px-2 py-2">Likelihood</th>
            <th className="px-2 py-2">Impact</th>
            <th className="px-2 py-2 text-left">Owner</th>
            <th className="px-2 py-2 text-left">Mitigation</th>
            <th className="px-2 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {all.map((r, i) => (
            <tr key={i} className="border-b border-border hover:bg-accent/30">
              <td className="px-2 py-2 font-semibold">{r.risk}</td>
              <td className="px-2 py-2 text-muted-foreground">{r.epic}</td>
              <td className="px-2 py-2 text-center">{r.likelihood}</td>
              <td className="px-2 py-2 text-center">{r.impact}</td>
              <td className="px-2 py-2">{r.owner}</td>
              <td className="px-2 py-2 text-muted-foreground">{r.mitigation}</td>
              <td className="px-2 py-2 text-center">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function DependenciesView({ epics }: { epics: Epic[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {epics.map((e) => (
        <Card key={e.id} title={e.title} subtitle={e.id}>
          <div className="space-y-3">
            {e.dependencyGraph.map((g) => (
              <div key={g.group}>
                <SectionLabel>{g.group}</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {g.items.map((i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      <Network className="h-3 w-3 mr-1" />{i}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function ArchitectureView({ epics, onOpen }: { epics: Epic[]; onOpen: (e: Epic) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {epics.map((e) => (
        <Card key={e.id} title={e.title} subtitle="Reference Architecture">
          <div className="space-y-1.5">
            {e.architecture.map((l) => (
              <div key={l.layer} className="rounded-md border border-border bg-card p-2">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3 w-3 text-ai" />
                  <span className="text-[11px] font-bold">{l.layer}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {l.comps.map((c) => (
                    <Badge key={c} variant="secondary" className="text-[9px]">{c}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button onClick={() => onOpen(e)} variant="ghost" size="sm" className="mt-2 w-full text-ai">
            Open intelligence panel <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Card>
      ))}
    </div>
  );
}

function TelemetryView() {
  const metrics = EPICS.flatMap((e) => e.telemetry.map((t) => ({ ...t, epic: e.title })));
  return (
    <Card title="Live Operational Telemetry" subtitle={`${metrics.length} metrics across ${EPICS.length} initiatives`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold truncate">{m.epic}</div>
            <div className="text-[11px] font-semibold mt-0.5">{m.name}</div>
            <div className="text-[16px] font-bold mt-1 text-ai">{m.value}</div>
            <Sparkline />
          </div>
        ))}
      </div>
    </Card>
  );
}

function RoadmapView({ epics }: { epics: Epic[] }) {
  const buckets = {
    Now: epics.slice(0, 3),
    Next: epics.slice(3, 6),
    Later: epics.slice(6),
  };
  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(buckets).map(([k, items]) => (
        <Card key={k} title={k} subtitle={k === "Now" ? "Current quarter" : k === "Next" ? "Next quarter" : "Future"}>
          <ul className="space-y-2">
            {items.map((e) => (
              <li key={e.id} className="rounded-md border border-border p-2.5">
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[9px]">{e.id}</Badge>
                  <HealthChip h={e.health} compact />
                </div>
                <div className="text-[12px] font-bold mt-1">{e.title}</div>
                <div className="text-[10px] text-muted-foreground">{e.goal}</div>
                <Progress value={e.completion} className="h-1 mt-2" />
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

function TeamsView({ epics }: { epics: Epic[] }) {
  return (
    <Card title="Teams" subtitle="Owners across the program">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {epics.map((e) => (
          <div key={e.id} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-ai text-white grid place-items-center text-[11px] font-bold">
                {e.owner.split(" ").map((w) => w[0]).join("")}
              </div>
              <div>
                <div className="text-[12px] font-bold">{e.owner}</div>
                <div className="text-[10px] text-muted-foreground">{e.ownerTeam}</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Owns: {e.title}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SettingsView() {
  return (
    <Card title="Settings" subtitle="Program configuration">
      <p className="text-[12px] text-muted-foreground">Program settings, integrations, and notification preferences.</p>
    </Card>
  );
}

/* ============================================================
   PRIMITIVES
============================================================ */

function Card({
  title, subtitle, children, className, accent,
}: { title: string; subtitle?: string; children: React.ReactNode; className?: string; accent?: boolean }) {
  return (
    <section className={`rounded-2xl border ${accent ? "border-ai/30 bg-ai-soft/40" : "border-border bg-card"} shadow-sm p-4 ${className ?? ""}`}>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className={`text-[13px] font-bold tracking-tight ${accent ? "text-ai" : "text-foreground"}`}>{title}</h2>
          {subtitle && <div className="text-[11px] text-muted-foreground">{subtitle}</div>}
        </div>
      </div>
      {children}
    </section>
  );
}

function PriorityChip({ p }: { p: Priority }) {
  const map: Record<Priority, string> = {
    P0: "bg-status-critical-soft text-status-critical border-status-critical/30",
    P1: "bg-status-warning-soft text-status-warning border-status-warning/30",
    P2: "bg-status-info-soft text-status-info border-status-info/30",
  };
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-bold ${map[p]}`}>{p}</span>;
}

function HealthChip({ h, compact }: { h: Health; compact?: boolean }) {
  const map: Record<Health, { c: string; i: any }> = {
    "On Track": { c: "status-healthy", i: CheckCircle2 },
    "At Risk": { c: "status-warning", i: AlertTriangle },
    "Blocked": { c: "status-critical", i: XCircle },
  };
  const m = map[h];
  if (compact) {
    return <m.i className="h-3.5 w-3.5" style={{ color: `hsl(var(--${m.c}))` }} />;
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold"
      style={{
        background: `hsl(var(--${m.c}-soft))`,
        color: `hsl(var(--${m.c}))`,
        borderColor: `hsl(var(--${m.c}) / 0.3)`,
      }}
    >
      <m.i className="h-3 w-3" /> {h}
    </span>
  );
}

function StatusChip({ status }: { status: Story["status"] }) {
  const map = {
    "To Do": "bg-muted text-muted-foreground",
    "In Progress": "bg-status-info-soft text-status-info",
    "In Review": "bg-status-warning-soft text-status-warning",
    "Done": "bg-status-healthy-soft text-status-healthy",
  } as const;
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${map[status]}`}>{status}</span>;
}
