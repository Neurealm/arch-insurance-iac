// Canonical tenant model for the LLM + Model Routing administration plane.
// All figures are internally consistent: model rows drive catalog counts and
// usage share, provider rows drive health and spend, pipeline stages drive
// throughput, and evaluation scores drive the capability matrix.

export type Health = "Healthy" | "Degraded" | "Inactive" | "Error";
export type ReasoningTier = "Fast" | "Balanced" | "Advanced";
export type SafetyProfile = "High" | "Medium" | "Standard";

/* ------------------------------- Principles ------------------------------- */

export interface Principle {
  id: string; title: string; short: string; hover: string; detail: string[];
}

export const PRINCIPLES: Principle[] = [
  {
    id: "right-model",
    title: "Right Model, Right Task",
    short: "Match capability to objective, context size, reasoning depth, modality, and response type.",
    hover:
      "Model selection should be task-dependent rather than statically assigned. Classification, summarization, code generation, long-context synthesis, extraction, vision, tool use, and high-reasoning workflows may require different models.",
    detail: [
      "Every request is classified into a task class before any model is considered.",
      "Capability requirements are expressed as constraints, not preferences: reasoning tier, context size, modality, tool support, structured output.",
      "A single default model for all workloads is treated as a configuration defect, not a simplification.",
      "Task classes are tenant-defined so routing taxonomy matches the business, not the provider catalog.",
    ],
  },
  {
    id: "resilience",
    title: "Provider-Agnostic Resilience",
    short: "Route across approved providers, regions, models, and fallback chains.",
    hover:
      "The platform must remain functional when a provider, region, model deployment, quota, or endpoint becomes unavailable.",
    detail: [
      "No routing policy may depend on a single provider unless the tenant explicitly accepts that risk in writing.",
      "Every active policy carries at least one validated alternate route; fallback readiness is measured continuously.",
      "Failover triggers include timeout, HTTP error class, quota exhaustion, safety rejection, and regional degradation.",
      "Provider outage drills are executed on a scheduled cadence and recorded as evidence.",
    ],
  },
  {
    id: "governed",
    title: "Governed Inference",
    short: "Apply policy, entitlements, safety, audit, data handling, and regional controls before inference.",
    hover:
      "A model is not eligible simply because it is technically available. Each invocation must satisfy tenant policy.",
    detail: [
      "Eligibility is evaluated before scoring: an ineligible model is never compared on cost or latency.",
      "Data classification of the request is matched against the allowed data classes of the model deployment.",
      "Regional residency is enforced at the deployment level, not the provider level.",
      "Every route decision is written to the audit ledger with the policy version that produced it.",
    ],
  },
  {
    id: "cost-aware",
    title: "Cost-Aware Performance",
    short: "Optimize quality, reasoning depth, latency, context utilization, and cost together.",
    hover:
      "The cheapest model is not always optimal and the most capable model is not always necessary. Routing considers the task outcome and service-level objective.",
    detail: [
      "Composite route score weighs capability, policy, latency, cost, and evaluation quality.",
      "Per-request cost ceilings are hard-blocking; provider spend targets are optimization guidance.",
      "Cached context and prompt reuse reduce effective token cost and are considered during scoring.",
      "Premium models require explicit approval on task classes where a lower tier satisfies the objective.",
    ],
  },
  {
    id: "evaluation",
    title: "Continuous Evaluation",
    short: "Continuously compare models, detect drift, measure outcomes, and improve routing.",
    hover:
      "Routing decisions should evolve as model quality, pricing, latency, policies, and provider performance change.",
    detail: [
      "Golden datasets, synthetic tests, human review, and production outcomes feed one normalized score.",
      "Regression stability is tracked per model version; a failed regression suspends promotion.",
      "Evaluation results are tenant-owned measurements, never vendor benchmark claims.",
      "Score movement is fed back into composite route scoring on the next policy evaluation cycle.",
    ],
  },
];

/* -------------------------------- Outcomes -------------------------------- */

export interface Outcome {
  id: string; label: string; value: string; definition: string;
  calculation: string; target: string; result: string; trend: string;
  contributors: string; why: string;
}

export const OUTCOMES: Outcome[] = [
  {
    id: "compliance", label: "Routing Policy Compliance", value: "99.3%",
    definition: "Percentage of inference requests routed through a model/provider combination that satisfies current tenant policy.",
    calculation: "compliant routes ÷ total executed routes, evaluated against the policy version active at request time",
    target: "99%", result: "99.3%", trend: "+0.4 pts versus previous 30 days",
    contributors: "OpenAI, Anthropic, Azure OpenAI, Google, AWS Bedrock, Internal Gateway",
    why: "Digital coworkers must not invoke technically available models that violate data, security, cost, residency, or governance requirements.",
  },
  {
    id: "decision", label: "Median Route Decision", value: "41 ms",
    definition: "Time required for neugain.io to classify the request, evaluate routing policies, score eligible models, and select the route.",
    calculation: "p50 of classify + policy filter + score + select, excluding provider inference time",
    target: "< 60 ms", result: "41 ms", trend: "-6 ms after policy index rebuild",
    contributors: "Routing engine, policy cache, model registry cache",
    why: "Route decision latency is added to every request; if the control plane is slow, every digital coworker feels it.",
  },
  {
    id: "fallback", label: "Fallback Readiness", value: "98.7%",
    definition: "Percentage of active routing policies with at least one validated alternate route.",
    calculation: "policies with a validated fallback ÷ active policies, validated within the last 7 days",
    target: "100%", result: "98.7%", trend: "1 policy in conflict (EU Regulated Workloads)",
    contributors: "Fallback validator, provider health monitor",
    why: "Resilience is only real when the alternate route has been proven eligible, reachable, and policy-compliant.",
  },
  {
    id: "cost", label: "Cost per 1K Requests", value: "$2.84",
    definition: "Normalized tenant inference cost across routed requests.",
    calculation: "(input token cost + output token cost + embedding cost) ÷ requests × 1,000",
    target: "≤ $3.20", result: "$2.84", trend: "-11% after utility routing shift to GPT-5 Mini",
    contributors: "OpenAI 36%, Anthropic 24%, Google 16%, Azure 14%, AWS 8%",
    why: "Inference economics determine whether a digital coworker workflow is viable at enterprise volume.",
  },
];

/* --------------------------------- Models --------------------------------- */

export interface ModelRow {
  id: string; name: string; provider: string; deployment: string; family: string;
  type: "Foundation" | "Fast" | "Open" | "Embedding";
  contextWindow: string; contextTokens: number; allowedContext: string;
  reasoning: ReasoningTier; latency: number; cost: "$" | "$$" | "$$$";
  costPerRequest: string; inputRate: string; outputRate: string;
  safety: SafetyProfile; regions: string; regionList: string[];
  status: Health; statusReason?: string; usage: number;
  modalities: string[]; tools: boolean; structured: boolean; streaming: boolean;
  quota: number; recentErrors: string; lastInvocation: string;
  eligiblePolicies: number; primaryRoutes: number; fallbackRoutes: number;
  monthCost: string; avgInputTokens: number; avgOutputTokens: number;
  allowedClasses: string[]; blockedClasses: string[];
  composite: number; lastEvaluated: string; regression: string;
  requests: string; tokens: string; successRate: string;
  coworkers: string[];
  history: [string, string][];
}

export const MODELS: ModelRow[] = [
  {
    id: "MDL-OAI-GPT5-ENT-001", name: "GPT-5 Enterprise", provider: "OpenAI", deployment: "MDL-OAI-GPT5-ENT-001",
    family: "GPT-5", type: "Foundation", contextWindow: "256K", contextTokens: 256000, allowedContext: "128K (tenant cap)",
    reasoning: "Advanced", latency: 1.8, cost: "$$$", costPerRequest: "$0.142", inputRate: "$2.50 / 1M", outputRate: "$10.00 / 1M",
    safety: "High", regions: "US / EU", regionList: ["US-East", "US-West", "EU-West"], status: "Healthy", usage: 28,
    modalities: ["Text", "Vision", "Document"], tools: true, structured: true, streaming: true,
    quota: 62, recentErrors: "0 in last 24h", lastInvocation: "8 seconds ago",
    eligiblePolicies: 9, primaryRoutes: 4, fallbackRoutes: 5,
    monthCost: "$66.2K", avgInputTokens: 2140, avgOutputTokens: 640,
    allowedClasses: ["Public", "Internal", "Confidential"], blockedClasses: ["Restricted"],
    composite: 96, lastEvaluated: "May 15, 2026", regression: "Stable — no regression on 12 suites",
    requests: "684K", tokens: "1.91B", successRate: "99.8%",
    coworkers: ["Underwriting Analyst", "Claims Reviewer", "Risk Engineer"],
    history: [
      ["May 12, 2026 · R. Nair", "Tenant allowed context reduced 256K → 128K (cost control CHG-4471)"],
      ["Apr 30, 2026 · A. Ito", "EU-West deployment added to region availability"],
      ["Apr 02, 2026 · System", "Evaluation composite published: 96"],
    ],
  },
  {
    id: "MDL-OAI-GPT5-MINI-002", name: "GPT-5 Mini", provider: "OpenAI", deployment: "MDL-OAI-GPT5-MINI-002",
    family: "GPT-5", type: "Foundation", contextWindow: "128K", contextTokens: 128000, allowedContext: "128K",
    reasoning: "Balanced", latency: 0.9, cost: "$$", costPerRequest: "$0.021", inputRate: "$0.40 / 1M", outputRate: "$1.60 / 1M",
    safety: "High", regions: "Global", regionList: ["US-East", "US-West", "EU-West", "APAC-SE"], status: "Healthy", usage: 18,
    modalities: ["Text", "Vision"], tools: true, structured: true, streaming: true,
    quota: 44, recentErrors: "2 rate-limit retries in last 24h", lastInvocation: "3 seconds ago",
    eligiblePolicies: 12, primaryRoutes: 5, fallbackRoutes: 7,
    monthCost: "$18.4K", avgInputTokens: 1180, avgOutputTokens: 320,
    allowedClasses: ["Public", "Internal", "Confidential"], blockedClasses: ["Restricted"],
    composite: 88, lastEvaluated: "May 15, 2026", regression: "Stable",
    requests: "912K", tokens: "1.37B", successRate: "99.9%",
    coworkers: ["Service Desk Coworker", "Document Triage", "Intake Classifier"],
    history: [["May 04, 2026 · R. Nair", "Promoted to primary for Low-Latency Utility Tasks"]],
  },
  {
    id: "MDL-ANT-SONNET-003", name: "Claude Sonnet", provider: "Anthropic", deployment: "MDL-ANT-SONNET-003",
    family: "Claude", type: "Foundation", contextWindow: "200K", contextTokens: 200000, allowedContext: "160K (tenant cap)",
    reasoning: "Advanced", latency: 1.4, cost: "$$$", costPerRequest: "$0.118", inputRate: "$3.00 / 1M", outputRate: "$15.00 / 1M",
    safety: "High", regions: "US / EU", regionList: ["US-East", "EU-West"], status: "Healthy", usage: 16,
    modalities: ["Text", "Vision", "Document"], tools: true, structured: true, streaming: true,
    quota: 55, recentErrors: "0 in last 24h", lastInvocation: "12 seconds ago",
    eligiblePolicies: 10, primaryRoutes: 2, fallbackRoutes: 8,
    monthCost: "$44.2K", avgInputTokens: 2380, avgOutputTokens: 710,
    allowedClasses: ["Public", "Internal", "Confidential"], blockedClasses: ["Restricted"],
    composite: 94, lastEvaluated: "May 15, 2026", regression: "Stable",
    requests: "374K", tokens: "1.15B", successRate: "99.7%",
    coworkers: ["Underwriting Analyst", "Policy Drafting", "Evidence Synthesizer"],
    history: [["May 08, 2026 · S. Devi", "Attached as fallback for High-Reasoning Tasks"]],
  },
  {
    id: "MDL-ANT-HAIKU-004", name: "Claude Haiku", provider: "Anthropic", deployment: "MDL-ANT-HAIKU-004",
    family: "Claude", type: "Fast", contextWindow: "200K", contextTokens: 200000, allowedContext: "100K",
    reasoning: "Fast", latency: 0.7, cost: "$", costPerRequest: "$0.008", inputRate: "$0.25 / 1M", outputRate: "$1.25 / 1M",
    safety: "High", regions: "Global", regionList: ["US-East", "EU-West", "APAC-SE"], status: "Healthy", usage: 8,
    modalities: ["Text"], tools: true, structured: true, streaming: true,
    quota: 31, recentErrors: "0 in last 24h", lastInvocation: "1 second ago",
    eligiblePolicies: 8, primaryRoutes: 1, fallbackRoutes: 7,
    monthCost: "$6.1K", avgInputTokens: 860, avgOutputTokens: 210,
    allowedClasses: ["Public", "Internal"], blockedClasses: ["Confidential", "Restricted"],
    composite: 82, lastEvaluated: "May 15, 2026", regression: "Stable",
    requests: "421K", tokens: "451M", successRate: "99.9%",
    coworkers: ["Intake Classifier", "Notification Composer"],
    history: [["Apr 21, 2026 · R. Nair", "Data class Confidential removed pending DPIA"]],
  },
  {
    id: "MDL-GOO-GEM25-005", name: "Gemini 2.5 Pro", provider: "Google", deployment: "MDL-GOO-GEM25-005",
    family: "Gemini", type: "Foundation", contextWindow: "1M", contextTokens: 1000000, allowedContext: "400K (tenant cap)",
    reasoning: "Advanced", latency: 1.6, cost: "$$", costPerRequest: "$0.096", inputRate: "$1.25 / 1M", outputRate: "$10.00 / 1M",
    safety: "Medium", regions: "US", regionList: ["US-Central"], status: "Healthy", usage: 11,
    modalities: ["Text", "Vision", "Audio", "Document"], tools: true, structured: true, streaming: true,
    quota: 51, recentErrors: "0 in last 24h", lastInvocation: "26 seconds ago",
    eligiblePolicies: 6, primaryRoutes: 2, fallbackRoutes: 4,
    monthCost: "$29.4K", avgInputTokens: 8600, avgOutputTokens: 540,
    allowedClasses: ["Public", "Internal"], blockedClasses: ["Confidential", "Restricted"],
    composite: 91, lastEvaluated: "May 15, 2026", regression: "Stable",
    requests: "186K", tokens: "1.70B", successRate: "99.5%",
    coworkers: ["Long-Context Summarizer", "Submission Digest"],
    history: [["May 15, 2026 · System", "Long-context evaluation suite refreshed"]],
  },
  {
    id: "MDL-AZ-LLAMA4-006", name: "Llama 4 Enterprise", provider: "Azure Hosted", deployment: "MDL-AZ-LLAMA4-006",
    family: "Llama", type: "Open", contextWindow: "128K", contextTokens: 128000, allowedContext: "128K",
    reasoning: "Balanced", latency: 1.2, cost: "$", costPerRequest: "$0.006", inputRate: "$0.20 / 1M", outputRate: "$0.60 / 1M",
    safety: "Medium", regions: "US", regionList: ["US-East"], status: "Healthy", usage: 7,
    modalities: ["Text"], tools: true, structured: true, streaming: false,
    quota: 28, recentErrors: "0 in last 24h", lastInvocation: "4 seconds ago",
    eligiblePolicies: 5, primaryRoutes: 1, fallbackRoutes: 4,
    monthCost: "$3.9K", avgInputTokens: 1420, avgOutputTokens: 260,
    allowedClasses: ["Public", "Internal"], blockedClasses: ["Confidential", "Restricted"],
    composite: 79, lastEvaluated: "May 15, 2026", regression: "Stable",
    requests: "268K", tokens: "451M", successRate: "99.6%",
    coworkers: ["Background Classification", "Internal Automation"],
    history: [["Apr 18, 2026 · A. Ito", "Cost ceiling set to $0.05 / request"]],
  },
  {
    id: "MDL-AWS-MISTRAL-007", name: "Mistral Large", provider: "AWS Bedrock", deployment: "MDL-AWS-MISTRAL-007",
    family: "Mistral", type: "Foundation", contextWindow: "128K", contextTokens: 128000, allowedContext: "128K",
    reasoning: "Balanced", latency: 1.1, cost: "$", costPerRequest: "$0.011", inputRate: "$0.40 / 1M", outputRate: "$1.20 / 1M",
    safety: "Medium", regions: "US / EU", regionList: ["US-East", "EU-West"], status: "Degraded",
    statusReason: "US-East inference latency 3.8s exceeds the 2.5s tenant SLA; eligible traffic shifted to alternates.",
    usage: 3,
    modalities: ["Text"], tools: false, structured: true, streaming: true,
    quota: 74, recentErrors: "38 timeouts in last 24h", lastInvocation: "6 minutes ago",
    eligiblePolicies: 3, primaryRoutes: 0, fallbackRoutes: 3,
    monthCost: "$1.6K", avgInputTokens: 1310, avgOutputTokens: 240,
    allowedClasses: ["Public", "Internal"], blockedClasses: ["Confidential", "Restricted"],
    composite: 74, lastEvaluated: "May 15, 2026", regression: "Latency regression on US-East",
    requests: "62K", tokens: "96M", successRate: "94.2%",
    coworkers: ["Background Classification"],
    history: [["May 16, 2026 · System", "Status changed Healthy → Degraded (latency SLA breach)"]],
  },
];

export const REGISTRY_TOTAL = 43;

/* -------------------------------- Providers ------------------------------- */

export interface ProviderRow {
  id: string; name: string; regions: string; regionList: string[]; status: Health;
  failover: string; auth: string; authDetail: string; quota: number;
  quotaHard: string; quotaSoft: string; quotaPeak: string; projected: string;
  incident: string; incidentDetail?: string; spendShare: number; spend: string;
  requests: string; inputTokens: string; outputTokens: string; avgCost: string; trend: string;
  models: number; endpoint: string; connection: string;
}

export const PROVIDERS: ProviderRow[] = [
  {
    id: "PRV-OAI", name: "OpenAI", regions: "US, EU, APAC", regionList: ["US-East", "US-West", "EU-West", "APAC-SE"],
    status: "Healthy", failover: "Ready", auth: "Healthy", authDetail: "OAuth service principal, rotated 14 days ago",
    quota: 62, quotaHard: "12M tokens / min", quotaSoft: "80%", quotaPeak: "71% (May 14, 09:40 UTC)", projected: "No exhaustion projected this cycle",
    incident: "None", spendShare: 36, spend: "$66.2K", requests: "1.60M", inputTokens: "2.41B", outputTokens: "0.87B",
    avgCost: "$0.041", trend: "+3% versus previous month", models: 11,
    endpoint: "gateway.neugain.io/inference/openai", connection: "Private endpoint · TLS 1.3 · mTLS pinned",
  },
  {
    id: "PRV-ANT", name: "Anthropic", regions: "US, EU", regionList: ["US-East", "EU-West"],
    status: "Healthy", failover: "Ready", auth: "Healthy", authDetail: "API credential reference in tenant vault, rotated 9 days ago",
    quota: 55, quotaHard: "6M tokens / min", quotaSoft: "80%", quotaPeak: "63% (May 13, 15:10 UTC)", projected: "No exhaustion projected this cycle",
    incident: "None", spendShare: 24, spend: "$44.2K", requests: "795K", inputTokens: "1.31B", outputTokens: "0.29B",
    avgCost: "$0.056", trend: "+1% versus previous month", models: 7,
    endpoint: "gateway.neugain.io/inference/anthropic", connection: "Private endpoint · TLS 1.3",
  },
  {
    id: "PRV-GOO", name: "Google", regions: "US, EU", regionList: ["US-Central", "EU-West"],
    status: "Healthy", failover: "Ready", auth: "Healthy", authDetail: "Workload identity federation, no static secret",
    quota: 51, quotaHard: "4M tokens / min", quotaSoft: "75%", quotaPeak: "58% (May 12, 11:05 UTC)", projected: "No exhaustion projected this cycle",
    incident: "None", spendShare: 16, spend: "$29.4K", requests: "186K", inputTokens: "1.60B", outputTokens: "0.10B",
    avgCost: "$0.158", trend: "-4% versus previous month", models: 6,
    endpoint: "gateway.neugain.io/inference/google", connection: "Private service connect · TLS 1.3",
  },
  {
    id: "PRV-AZ", name: "Azure OpenAI", regions: "US, EU", regionList: ["US-East", "EU-West", "EU-North"],
    status: "Healthy", failover: "Ready", auth: "Healthy", authDetail: "Managed identity, no static secret",
    quota: 57, quotaHard: "8M tokens / min", quotaSoft: "80%", quotaPeak: "64% (May 15, 08:20 UTC)", projected: "No exhaustion projected this cycle",
    incident: "None", spendShare: 14, spend: "$25.8K", requests: "402K", inputTokens: "0.71B", outputTokens: "0.18B",
    avgCost: "$0.064", trend: "+9% versus previous month (EU regulated shift)", models: 9,
    endpoint: "gateway.neugain.io/inference/azure-openai", connection: "Private link · TLS 1.3",
  },
  {
    id: "PRV-AWS", name: "AWS Bedrock", regions: "US, EU", regionList: ["US-East", "EU-West"],
    status: "Degraded", failover: "Ready", auth: "Healthy", authDetail: "IAM role assumption via tenant execution role",
    quota: 74, quotaHard: "3M tokens / min", quotaSoft: "70%", quotaPeak: "88% (May 16, 06:15 UTC)", projected: "Soft threshold reached in ~9 days at current growth",
    incident: "US-East inference latency spike",
    incidentDetail: "US-East inference latency exceeds configured SLA. Observed 3.8 sec against a 2.5 sec threshold since 04:10 UTC. New eligible requests have been shifted to alternate providers for policies allowing cross-provider fallback.",
    spendShare: 8, spend: "$14.7K", requests: "62K", inputTokens: "0.08B", outputTokens: "0.02B",
    avgCost: "$0.237", trend: "-18% versus previous month (traffic shifted)", models: 6,
    endpoint: "gateway.neugain.io/inference/bedrock", connection: "VPC endpoint · TLS 1.3",
  },
  {
    id: "PRV-INT", name: "Internal Gateway", regions: "US", regionList: ["US-East"],
    status: "Healthy", failover: "Ready", auth: "Healthy", authDetail: "Internal mTLS certificate, rotated 3 days ago",
    quota: 22, quotaHard: "1M tokens / min", quotaSoft: "70%", quotaPeak: "29% (May 10, 17:45 UTC)", projected: "No exhaustion projected this cycle",
    incident: "None", spendShare: 2, spend: "$3.7K", requests: "74K", inputTokens: "0.06B", outputTokens: "0.02B",
    avgCost: "$0.050", trend: "flat", models: 4,
    endpoint: "internal-gw.neugain.local/inference", connection: "Private network · mTLS",
  },
];

/* --------------------------- Routing pipeline ----------------------------- */

export interface PipelineStage {
  id: string; index: number; name: string; volume: string; pass: string;
  signalsLabel: string; signals: string[]; purpose: string;
  inputs: string[]; logic: string[]; rules: string[]; thresholds: [string, string][];
  dependencies: string[]; changes: [string, string][]; health: string;
  recent: [string, string][];
}

export const PIPELINE: PipelineStage[] = [
  {
    id: "classify", index: 1, name: "Request Classify", volume: "91.2K req/day", pass: "—",
    signalsLabel: "Signals",
    signals: ["task class", "modality", "context size", "reasoning requirement", "latency class", "data classification"],
    purpose: "Determine what the request actually is before any model is considered, so routing operates on intent rather than caller preference.",
    inputs: ["Agent task descriptor", "Prompt envelope metadata", "Attached evidence references", "Requested response contract", "Caller entitlement context"],
    logic: [
      "Intent classifier assigns one of eleven tenant task classes.",
      "Context size is estimated from the assembled evidence pack, not the raw prompt.",
      "Data classification is inherited from the highest-classified evidence object in the request.",
      "Latency class is derived from the calling workflow's service-level objective.",
    ],
    rules: ["Unclassifiable requests fall back to the 'General Reasoning' task class and are flagged for review.", "Classification never reads evidence content the caller is not entitled to."],
    thresholds: [["Classification confidence floor", "0.72"], ["Review flag threshold", "< 0.60"], ["p95 classify time", "11 ms"]],
    dependencies: ["Context / Evidence Layer", "Identity & Access entitlements", "Task class taxonomy v4"],
    changes: [["May 09, 2026 · R. Nair", "Added 'Regulated' task class for EU workloads"]],
    health: "Healthy — 0 classification failures in the last 24 hours",
    recent: [["REQ-882014", "High Reasoning · 44K context · Confidential"], ["REQ-882011", "Summarization · 212K context · Internal"]],
  },
  {
    id: "capability", index: 2, name: "Capability Match", volume: "91.2K", pass: "100%",
    signalsLabel: "Signals",
    signals: ["reasoning", "vision", "tool use", "structured output", "long context", "coding", "language", "streaming"],
    purpose: "Determine which tenant-approved models can satisfy the request.",
    inputs: ["Task class", "Required modality", "Context size", "Reasoning tier", "Tool requirements", "Structured output", "Response SLA"],
    logic: [
      "Context Required ≤ Model Tenant-Allowed Context",
      "Required Reasoning Tier ≤ Model Capability Tier",
      "Required Tools ⊆ Model Allowed Tools",
      "Required Region ∈ Model Region Availability",
      "Model status = Healthy",
    ],
    rules: ["Capability is a hard filter: a model that fails any clause is removed from the candidate set and never scored.", "Degraded models remain visible in the trace with an explicit rejection reason."],
    thresholds: [["Minimum candidate set", "2 models"], ["Alert if candidates", "< 2"], ["p95 match time", "7 ms"]],
    dependencies: ["Model Registry", "Provider health monitor"],
    changes: [["May 12, 2026 · R. Nair", "Tenant context cap on GPT-5 Enterprise reduced to 128K"]],
    health: "Healthy — median candidate set 4.2 models",
    recent: [["REQ-882014", "5 evaluated · 2 eligible"], ["REQ-882009", "5 evaluated · 3 eligible"]],
  },
  {
    id: "policy", index: 3, name: "Policy Filter", volume: "89.7K", pass: "98.4%",
    signalsLabel: "Controls",
    signals: ["tenant entitlement", "provider authorization", "model authorization", "regional policy", "data classification", "business domain"],
    purpose: "Remove models that are technically capable but not permitted for this request under current tenant policy.",
    inputs: ["Caller entitlements", "Data classification", "Business domain", "Residency requirement", "Policy version in effect"],
    logic: [
      "Provider must appear in the tenant approved-provider set.",
      "Model deployment must be authorized for the requesting business domain.",
      "Request data classification must be within the model's allowed data classes.",
      "Deployment region must satisfy the residency rule attached to the task class.",
    ],
    rules: ["Policy rejection is terminal for that candidate; it cannot be recovered by a higher score.", "Every rejection records the policy identifier and version that caused it."],
    thresholds: [["Compliance target", "99%"], ["Current", "98.4% pass-through"], ["Blocked today", "1,478 candidates"]],
    dependencies: ["Access & Security", "Data classification service", "Policy registry v18"],
    changes: [["May 14, 2026 · S. Devi", "EU residency rule tightened to deployment level"]],
    health: "Healthy — policy cache refreshed 4 minutes ago",
    recent: [["REQ-882014", "Gemini 2.5 Pro rejected · region policy mismatch"], ["REQ-882002", "Llama 4 rejected · safety profile mismatch"]],
  },
  {
    id: "score", index: 4, name: "Cost / Latency Score", volume: "89.7K", pass: "100%",
    signalsLabel: "Inputs",
    signals: ["latency SLO", "token estimate", "request budget", "quality score", "provider cost", "cache availability"],
    purpose: "Rank the eligible candidate set using the tenant's weighted composite route score.",
    inputs: ["Estimated input and output tokens", "Provider unit rates", "Recent p50/p95 latency", "Evaluation composite", "Cache hit probability"],
    logic: [
      "Composite = 0.30 capability + 0.20 policy + 0.20 evaluation + 0.15 latency + 0.15 cost",
      "Cost sub-score is normalized against the task class cost ceiling.",
      "Latency sub-score uses trailing 1-hour p95 per deployment and region.",
      "Cached context reduces the estimated input token count before scoring.",
    ],
    rules: ["Scoring never overrides eligibility.", "Ties are broken by evaluation composite, then by lowest cost."],
    thresholds: [["Hard cost ceiling", "per task class"], ["Latency ceiling", "per task class"], ["p95 score time", "9 ms"]],
    dependencies: ["Evaluation service", "Cost & Performance metering", "Latency telemetry"],
    changes: [["May 06, 2026 · A. Ito", "Cost weight raised 0.10 → 0.15 for utility classes"]],
    health: "Healthy",
    recent: [["REQ-882014", "GPT-5 Enterprise 92.4 · Claude Sonnet 91.8"], ["REQ-882007", "GPT-5 Mini 90.1 · Claude Haiku 88.4"]],
  },
  {
    id: "safety", index: 5, name: "Safety Guardrail", volume: "88.1K", pass: "98.2%",
    signalsLabel: "Controls",
    signals: ["prompt protection", "sensitive data handling", "allowed tool use", "model safety profile", "content policy"],
    purpose: "Apply pre-invocation guardrails to the selected route and prepare post-invocation checks.",
    inputs: ["Assembled prompt", "Detected sensitive data spans", "Requested tool invocations", "Model safety profile"],
    logic: [
      "Prompt injection detection runs against evidence-derived content before invocation.",
      "Sensitive data spans are masked or blocked according to the data-handling policy.",
      "Tool invocation requests are checked against the allowed tool set for the route.",
      "Post-invocation moderation and citation checks are registered for the response.",
    ],
    rules: ["A guardrail rejection re-enters route selection with the offending candidate removed.", "Repeated rejections on all candidates produce an unroutable request, logged for review."],
    thresholds: [["Injection score block", "≥ 0.80"], ["Interventions today", "1,612"], ["Unroutable", "0.3%"]],
    dependencies: ["Safety & Guardrails registry", "Sensitive data classifier"],
    changes: [["May 11, 2026 · S. Devi", "Citation requirement extended to grounded Q&A class"]],
    health: "Healthy — 9 guardrails active",
    recent: [["REQ-881990", "Blocked · injection score 0.86"], ["REQ-881975", "Masked 4 PII spans pre-invocation"]],
  },
  {
    id: "route", index: 6, name: "Route / Fallback", volume: "88.1K", pass: "100%",
    signalsLabel: "Output",
    signals: ["primary route", "fallback chain", "timeout", "retry behavior", "provider failover"],
    purpose: "Emit the executable route: selected deployment, ordered fallback chain, and failure handling contract.",
    inputs: ["Ranked candidate set", "Fallback chain definition", "Provider health", "Timeout and retry policy"],
    logic: [
      "Primary route is the highest composite eligible candidate.",
      "Fallback entries must themselves be eligible under the same policy evaluation.",
      "Timeout and retry are inherited from the task class unless overridden by the policy.",
      "Route decision, score table, and rejection reasons are written to the audit ledger.",
    ],
    rules: ["A route is never emitted without at least one validated fallback unless the policy declares fallback not required.", "Failover to a different region requires the residency rule to permit it."],
    thresholds: [["Fallback readiness", "98.7%"], ["Fallback success rate", "98.7%"], ["Route audit coverage", "100%"]],
    dependencies: ["Fallback validator", "Audit ledger", "Provider health monitor"],
    changes: [["May 15, 2026 · System", "AWS Bedrock removed from primary position on 3 policies"]],
    health: "Healthy — 1 policy in fallback conflict",
    recent: [["REQ-882014", "GPT-5 Enterprise → Claude Sonnet"], ["REQ-882011", "Gemini 2.5 Pro → GPT-5 Enterprise"]],
  },
];

/* ----------------------------- Routing policies --------------------------- */

export interface PolicyStep { title: string; rule: string; condition: string; action: string; status: string }

export interface RoutingPolicy {
  id: string; name: string; intent: string; primary: string; fallback: string;
  constraints: string[]; updated: string; status: "Active" | "Draft" | "Conflict";
  owner: string; maxContext: string; maxCost: string; regions: string[];
  about: string; steps: PolicyStep[]; usage: [string, string][];
  history: [string, string][]; conflict?: { title: string; detail: string; impact: string; recommended: string };
}

export const POLICIES: RoutingPolicy[] = [
  {
    id: "policy-high-reasoning", name: "High-Reasoning Tasks", intent: "High-Reasoning",
    primary: "GPT-5 Enterprise", fallback: "Claude Sonnet",
    constraints: ["Approved providers", "US / EU", "High safety", "Cost ceiling"],
    updated: "2 days ago", status: "Active", owner: "AI Platform Team",
    maxContext: "128K", maxCost: "$0.18", regions: ["US", "EU"],
    about: "Routes high-reasoning and complex analytical tasks to the highest eligible tenant-approved model while controlling cost, latency, location, and compliance.",
    steps: [
      { title: "Classify high-reasoning intent", rule: "intent.class = High-Reasoning", condition: "Detected tasks requiring deep reasoning or multi-step analysis", action: "Enter policy evaluation", status: "Active" },
      { title: "Require advanced reasoning tier", rule: "model.reasoningTier = Advanced", condition: "Only models with Advanced tier are eligible", action: "Filter candidate set", status: "Active" },
      { title: "Enforce approved providers", rule: "model.provider ∈ approvedProviders AND model.region ∈ {US, EU}", condition: "Filter models to tenant-approved providers and regions", action: "Reject non-conforming candidates", status: "Active" },
      { title: "Apply token budget", rule: "estimatedCost ≤ $0.18", condition: "Ensure estimated cost is within the per-request ceiling", action: "Hard block above ceiling", status: "Active" },
      { title: "Select lowest-latency compliant model", rule: "max(composite) where latency ≤ SLO", condition: "Score by latency and cost within constraints", action: "Assign primary route", status: "Active" },
      { title: "Attach fallback", rule: "fallback = Claude Sonnet", condition: "Validated alternate route required", action: "Attach fallback chain", status: "Active" },
    ],
    usage: [["Requests (30d)", "214K"], ["Primary route hit rate", "96.2%"], ["Fallback invoked", "3.8%"], ["Average cost / request", "$0.142"], ["p95 latency", "3.1s"], ["Policy violations", "0"]],
    history: [["May 14, 2026 · R. Nair", "Cost ceiling raised $0.15 → $0.18 (CHG-4487)"], ["Apr 28, 2026 · S. Devi", "Fallback changed GPT-5 Mini → Claude Sonnet"]],
  },
  {
    id: "policy-large-context", name: "Large-Context Summarization", intent: "Summarization",
    primary: "Gemini 2.5 Pro", fallback: "GPT-5 Enterprise",
    constraints: ["Context > 150K allowed", "US region", "Medium safety minimum"],
    updated: "5 days ago", status: "Active", owner: "AI Platform Team",
    maxContext: "400K", maxCost: "$0.22", regions: ["US"],
    about: "Routes long-document synthesis to models with validated long-context performance while preventing context overflow and uncontrolled token spend.",
    steps: [
      { title: "Classify summarization intent", rule: "intent.class = Summarization", condition: "Long-document synthesis requests", action: "Enter policy evaluation", status: "Active" },
      { title: "Require long-context capability", rule: "model.allowedContext ≥ requiredContext", condition: "Context above 150K tokens", action: "Filter candidate set", status: "Active" },
      { title: "Require long-context evaluation score", rule: "eval.longContext ≥ 88", condition: "Only models with validated long-context results", action: "Filter candidate set", status: "Active" },
      { title: "Apply context budget", rule: "requiredContext ≤ 400K", condition: "Prevent context overflow and runaway cost", action: "Hard block above budget", status: "Active" },
      { title: "Attach fallback", rule: "fallback = GPT-5 Enterprise", condition: "Alternate must accept ≥ 128K context", action: "Attach fallback chain", status: "Active" },
    ],
    usage: [["Requests (30d)", "86K"], ["Primary route hit rate", "98.9%"], ["Fallback invoked", "1.1%"], ["Average cost / request", "$0.096"], ["p95 latency", "4.4s"], ["Policy violations", "0"]],
    history: [["May 11, 2026 · A. Ito", "Context budget raised 250K → 400K"]],
  },
  {
    id: "policy-low-latency", name: "Low-Latency Utility Tasks", intent: "Utility",
    primary: "GPT-5 Mini", fallback: "Claude Haiku",
    constraints: ["Latency < 1.2s", "Cost ceiling $0.05", "Internal data only"],
    updated: "6 days ago", status: "Active", owner: "AI Platform Team",
    maxContext: "32K", maxCost: "$0.05", regions: ["US", "EU", "APAC"],
    about: "Routes high-volume utility work — classification, extraction, formatting, routing hints — to fast, low-cost models under a strict latency ceiling.",
    steps: [
      { title: "Classify utility intent", rule: "intent.class = Utility", condition: "Short, deterministic, high-volume tasks", action: "Enter policy evaluation", status: "Active" },
      { title: "Enforce latency ceiling", rule: "model.p95Latency ≤ 1.2s", condition: "Filter to fast deployments only", action: "Filter candidate set", status: "Active" },
      { title: "Enforce cost ceiling", rule: "estimatedCost ≤ $0.05", condition: "Per-request hard block", action: "Reject above ceiling", status: "Active" },
      { title: "Prefer cached context", rule: "prefer cacheHit = true", condition: "Reduce effective input tokens", action: "Optimization guidance", status: "Active" },
      { title: "Attach fallback", rule: "fallback = Claude Haiku", condition: "Alternate must meet the same latency ceiling", action: "Attach fallback chain", status: "Active" },
    ],
    usage: [["Requests (30d)", "1.12M"], ["Primary route hit rate", "97.4%"], ["Fallback invoked", "2.6%"], ["Average cost / request", "$0.021"], ["p95 latency", "1.1s"], ["Policy violations", "0"]],
    history: [["May 04, 2026 · R. Nair", "Primary changed Claude Haiku → GPT-5 Mini after evaluation refresh"]],
  },
  {
    id: "policy-eu-regulated", name: "Regulated EU Data", intent: "Regulated",
    primary: "Azure OpenAI EU", fallback: "GPT-5 Enterprise EU",
    constraints: ["EU region only", "High safety", "Restricted data allowed", "No cross-region failover"],
    updated: "1 day ago", status: "Conflict", owner: "Security Administration",
    maxContext: "128K", maxCost: "$0.20", regions: ["EU"],
    about: "Routes regulated EU workloads exclusively to EU-resident deployments with restricted data handling and no cross-region failover permitted.",
    steps: [
      { title: "Classify regulated intent", rule: "intent.class = Regulated OR data.residency = EU", condition: "Regulated or EU-resident data detected", action: "Enter policy evaluation", status: "Active" },
      { title: "Enforce EU deployment residency", rule: "deployment.region ∈ {EU-West, EU-North}", condition: "Deployment-level residency, not provider-level", action: "Filter candidate set", status: "Active" },
      { title: "Require high safety profile", rule: "model.safetyProfile = High", condition: "Regulated data requires the highest safety tier", action: "Filter candidate set", status: "Active" },
      { title: "Block cross-region failover", rule: "failover.crossRegion = false", condition: "Failover may not leave the EU", action: "Constrain fallback chain", status: "Active" },
      { title: "Attach fallback", rule: "fallback = GPT-5 Enterprise EU", condition: "Alternate must have an eligible EU deployment", action: "Attach fallback chain", status: "Conflict" },
    ],
    usage: [["Requests (30d)", "48K"], ["Primary route hit rate", "100%"], ["Fallback invoked", "0%"], ["Average cost / request", "$0.131"], ["p95 latency", "2.8s"], ["Policy violations", "0"]],
    history: [["May 15, 2026 · S. Devi", "Residency tightened to deployment level — fallback conflict raised"]],
    conflict: {
      title: "Routing Policy Conflict",
      detail: "Fallback model does not have an eligible EU deployment.",
      impact: "Fallback readiness unavailable. If the primary EU deployment fails, requests in this policy become unroutable rather than failing over outside the EU.",
      recommended: "Assign an EU-approved fallback model or remove the fallback requirement for this policy.",
    },
  },
  {
    id: "policy-cost-capped", name: "Cost-Capped Internal Automation", intent: "Automation",
    primary: "Llama 4 Enterprise", fallback: "Claude Haiku",
    constraints: ["Cost < $0.05", "Internal data only", "US region"],
    updated: "8 days ago", status: "Active", owner: "FinOps Administration",
    maxContext: "64K", maxCost: "$0.05", regions: ["US"],
    about: "Routes background internal automation to the lowest-cost eligible model with a hard per-request cost ceiling and no access to confidential data classes.",
    steps: [
      { title: "Classify automation intent", rule: "intent.class = Automation", condition: "Background, non-interactive workloads", action: "Enter policy evaluation", status: "Active" },
      { title: "Restrict data classification", rule: "data.class ∈ {Public, Internal}", condition: "Confidential and Restricted are excluded", action: "Filter candidate set", status: "Active" },
      { title: "Enforce cost ceiling", rule: "estimatedCost < $0.05", condition: "Hard block", action: "Reject above ceiling", status: "Active" },
      { title: "Prefer batch eligibility", rule: "prefer batchEligible = true", condition: "Non-interactive requests may be batched", action: "Optimization guidance", status: "Active" },
      { title: "Attach fallback", rule: "fallback = Claude Haiku", condition: "Alternate must remain under the ceiling", action: "Attach fallback chain", status: "Active" },
    ],
    usage: [["Requests (30d)", "268K"], ["Primary route hit rate", "94.1%"], ["Fallback invoked", "5.9%"], ["Average cost / request", "$0.006"], ["p95 latency", "1.9s"], ["Policy violations", "0"]],
    history: [["May 08, 2026 · A. Ito", "Cost ceiling lowered $0.08 → $0.05"]],
  },
];

export const POLICY_TOTAL = 18;

/* ------------------------------- Guardrails ------------------------------- */

export interface Guardrail {
  id: string; name: string; policies: number; status: "Active" | "Draft";
  enforced: string; definition: string; configuration: string[]; why: string; interventions: string;
}

export const GUARDRAILS: Guardrail[] = [
  { id: "gr-injection", name: "Prompt Injection Protection", policies: 7, status: "Active", enforced: "Pre & Post Invocation",
    definition: "Detects and neutralizes instructions embedded in retrieved evidence or user content that attempt to override system intent.",
    configuration: ["Injection score block threshold 0.80", "Evidence-derived content scanned before assembly", "Tool invocation suppressed on detection", "Detection events written to audit ledger"],
    why: "Retrieved enterprise content is untrusted input; without this control an attacker can steer a digital coworker through a document.", interventions: "1,612 in last 30 days" },
  { id: "gr-sensitive", name: "Sensitive Data Handling", policies: 6, status: "Active", enforced: "Pre & Post Invocation",
    definition: "Identifies sensitive data spans and applies masking, redaction, or blocking before the prompt leaves the tenant boundary.",
    configuration: ["PII, PHI, PCI detectors enabled", "Mask by default, block for Restricted class", "Post-response scan for leakage", "Per-domain override requires Security Admin"],
    why: "Data classification must be enforced at the inference boundary, not assumed from the source system.", interventions: "8,904 spans masked in last 30 days" },
  { id: "gr-moderation", name: "Output Moderation", policies: 6, status: "Active", enforced: "Post Invocation",
    definition: "Evaluates model responses against tenant content policy before they are returned to a digital coworker.",
    configuration: ["Severity threshold: block at high", "Categories: harassment, self-harm, illicit, extremism", "Blocked responses trigger fallback re-route", "Sampled human review at 2%"],
    why: "A compliant route can still produce a non-compliant response; enforcement must be two-sided.", interventions: "212 in last 30 days" },
  { id: "gr-citation", name: "Citation Requirements", policies: 4, status: "Active", enforced: "Post Invocation",
    definition: "Requires that grounded responses cite evidence objects that were actually supplied in the context pack.",
    configuration: ["Minimum 1 citation per factual assertion", "Citations validated against the evidence pack manifest", "Uncited assertions flagged, not silently removed", "Applies to grounded Q&A and evidence synthesis classes"],
    why: "Groundedness is only verifiable when the response points back to the evidence that produced it.", interventions: "486 flagged in last 30 days" },
  { id: "gr-tools", name: "Allowed Tool Invocation", policies: 5, status: "Active", enforced: "Pre Invocation",
    definition: "Restricts which tools a route may invoke, independent of what the model is technically capable of calling.",
    configuration: ["Allow-list per task class", "Write-capable tools require approval-gated policies", "Tool arguments validated against schema", "Denied invocations returned as structured refusals"],
    why: "Tool access is the point where reasoning becomes action; it must be bounded by policy rather than by prompt.", interventions: "74 denied in last 30 days" },
  { id: "gr-residency", name: "Regional Residency Enforcement", policies: 5, status: "Active", enforced: "Pre & Post Invocation",
    definition: "Ensures the selected deployment and any failover target satisfy the residency rule attached to the request.",
    configuration: ["Deployment-level region evaluation", "Cross-region failover blocked for regulated classes", "Response telemetry region-tagged", "Violations are hard failures, never warnings"],
    why: "Provider-level region claims are insufficient; residency must be proven at the deployment that executes the inference.", interventions: "0 violations in last 30 days" },
  { id: "gr-authorization", name: "Model Authorization", policies: 8, status: "Active", enforced: "Pre Invocation",
    definition: "Confirms the specific model deployment is authorized for the requesting business domain and caller entitlement.",
    configuration: ["Domain-to-deployment authorization matrix", "Entitlement inherited from Identity & Access", "Unauthorized attempts logged with actor", "Shadow models are never routable"],
    why: "Registration in the catalog is not authorization to use; the two decisions are deliberately separate.", interventions: "31 blocked in last 30 days" },
  { id: "gr-cost", name: "Maximum Cost Policy", policies: 4, status: "Active", enforced: "Pre Invocation",
    definition: "Blocks invocation when the estimated request cost exceeds the ceiling defined for the task class.",
    configuration: ["High-Reasoning $0.18", "Internal Summarization $0.05", "Background Classification $0.01", "Hard-blocking, not advisory"],
    why: "Cost control at request time is the only reliable protection against runaway token spend at agent scale.", interventions: "1,204 requests re-routed to cheaper eligible models" },
  { id: "gr-context", name: "Maximum Context Policy", policies: 5, status: "Active", enforced: "Pre Invocation",
    definition: "Caps the context supplied to a model below the provider maximum, according to the tenant's own budget.",
    configuration: ["GPT-5 Enterprise capped 256K → 128K", "Gemini 2.5 Pro capped 1M → 400K", "Overflow triggers evidence re-ranking, not truncation", "Cap changes require FinOps approval"],
    why: "Provider maximum context is a capability, not a budget; unbounded context is the most common source of cost surprise.", interventions: "3,318 context re-ranks in last 30 days" },
];

/* ----------------------------- Fallback chains ---------------------------- */

export interface FallbackChain {
  id: string; nodes: string[]; timeout: string; retries: string; trigger: string;
  regional: string; status: "Validated" | "Conflict" | "Unvalidated"; note: string;
  arrowRules: string[];
}

export const CHAINS: FallbackChain[] = [
  { id: "chain-1", nodes: ["GPT-5 Enterprise", "Claude Sonnet", "GPT-5 Mini"], timeout: "18s", retries: "1 per hop",
    trigger: "Timeout, 5xx, quota exhaustion, safety rejection", regional: "US / EU, cross-provider permitted", status: "Validated",
    note: "Primary chain for High-Reasoning Tasks. Last validated 2 days ago.",
    arrowRules: ["Failover after 18s or first 5xx; reasoning tier preserved (Advanced → Advanced).", "Second hop accepts a lower tier only when the request is retry-safe and non-analytical."] },
  { id: "chain-2", nodes: ["Gemini 2.5 Pro", "GPT-5 Enterprise", "Claude Sonnet"], timeout: "30s", retries: "1 per hop",
    trigger: "Timeout, context overflow, provider unavailable", regional: "US only", status: "Validated",
    note: "Long-context chain. Hop 2 requires context re-ranking to 128K.",
    arrowRules: ["Failover after 30s; context re-ranked to fit the alternate's tenant cap.", "Third hop reserved for provider-level outage only."] },
  { id: "chain-3", nodes: ["GPT-5 Mini", "Claude Haiku", "Llama 4 Enterprise"], timeout: "6s", retries: "2 per hop",
    trigger: "Timeout, rate limit, latency SLA breach", regional: "Global", status: "Validated",
    note: "Utility chain optimized for latency; all hops under the 1.2s ceiling.",
    arrowRules: ["Failover after 6s or two consecutive rate limits.", "Final hop is internal-cost preferred for background retries."] },
  { id: "chain-4", nodes: ["Azure OpenAI EU", "GPT-5 Enterprise EU", "Claude Sonnet EU"], timeout: "20s", retries: "1 per hop",
    trigger: "Timeout, provider unavailable — no cross-region failover", regional: "EU only, cross-region blocked", status: "Conflict",
    note: "Claude Sonnet EU deployment is not registered; the third hop cannot be validated.",
    arrowRules: ["Failover within EU deployments only.", "Cross-region failover is blocked by the regulated residency rule."] },
];

export const ASSURANCE = [
  { id: "as-1", label: "Fallback Success Rate", value: "98.7%", definition: "Percentage of failover attempts that completed successfully on an alternate eligible route.", detail: "Measured over 30 days across 4,182 failover events. Failures are dominated by the EU regulated policy where cross-region failover is blocked." },
  { id: "as-2", label: "Provider Outage Drill", value: "12 days ago", definition: "Last scheduled exercise simulating full provider unavailability.", detail: "AWS Bedrock US-East simulated outage. 3 policies exercised failover; median recovery 1.9s; no policy violations recorded." },
  { id: "as-3", label: "Route Audit Coverage", value: "100%", definition: "Percentage of executed routes with a complete decision record in the audit ledger.", detail: "Every route persists the candidate set, rejection reasons, score table, policy version, and selected deployment." },
  { id: "as-4", label: "Unroutable Requests", value: "0.3%", definition: "Requests where no eligible model remained after capability, policy, and safety evaluation.", detail: "268 requests in 30 days. Dominant cause: Restricted data class with no authorized deployment in the required region." },
];

/* ------------------------------- Evaluation ------------------------------- */

export const EVAL_COLUMNS = ["Reasoning", "Summarization", "Extraction", "Tool Use", "Grounded Q&A", "Policy Adherence"] as const;

export interface EvalRow { model: string; scores: number[]; sample: number; date: string; ci: string; delta: number[]; suite: string }

export const EVALUATIONS: EvalRow[] = [
  { model: "GPT-5 Enterprise", scores: [96, 93, 92, 91, 94, 97], sample: 4200, date: "May 15, 2026", ci: "±1.4", delta: [1, 0, 2, 1, 0, 1], suite: "Underwriting golden set v6" },
  { model: "Claude Sonnet", scores: [93, 94, 90, 88, 93, 95], sample: 4200, date: "May 15, 2026", ci: "±1.6", delta: [0, 2, -1, 1, 1, 0], suite: "Underwriting golden set v6" },
  { model: "Gemini 2.5 Pro", scores: [92, 91, 88, 86, 90, 89], sample: 3800, date: "May 15, 2026", ci: "±1.9", delta: [2, 3, 0, -2, 1, 0], suite: "Long-context synthesis v3" },
  { model: "GPT-5 Mini", scores: [88, 89, 87, 83, 86, 91], sample: 5100, date: "May 15, 2026", ci: "±1.2", delta: [1, 1, 1, 0, 0, 1], suite: "Utility task suite v9" },
  { model: "Claude Haiku", scores: [82, 86, 84, 79, 81, 88], sample: 5100, date: "May 15, 2026", ci: "±1.3", delta: [0, 1, -1, 0, -1, 0], suite: "Utility task suite v9" },
];

export const EVAL_DIMENSIONS = [
  "Reasoning", "Task Accuracy", "Groundedness", "Extraction Accuracy", "Tool Use",
  "Structured Output Reliability", "Latency", "Cost", "Safety", "Policy Adherence",
  "Hallucination Rate", "Citation Accuracy", "Long-Context Performance",
  "Domain-Specific Performance", "Regression Stability",
];

export const EVAL_SOURCES = [
  "Golden datasets", "Synthetic tests", "Human evaluation",
  "Production feedback", "Digital coworker outcomes", "Policy compliance",
];

/* -------------------------------- Cost data ------------------------------- */

export const SPEND_TOTAL = "$184K";

export const LATENCY_SUMMARY: { id: string; label: string; value: string; detail: string }[] = [
  { id: "p50", label: "p50 Latency", value: "0.92s", detail: "Median end-to-end inference latency across all routed requests, excluding route decision time (41 ms)." },
  { id: "p95", label: "p95 Latency", value: "3.12s", detail: "95th percentile, dominated by Advanced-tier long-context requests on the summarization policy." },
  { id: "tokens", label: "Avg Tokens / Request", value: "1,842", detail: "Combined input and output tokens. Long-context summarization skews the mean; utility median is 1,140." },
  { id: "requests", label: "Requests This Month", value: "2.31M", detail: "Executed inference requests across all providers, excluding evaluation and drill traffic." },
  { id: "cache", label: "Cache Hit Rate", value: "34%", detail: "Share of requests where assembled context was served from prompt cache, reducing effective input token cost." },
  { id: "failed", label: "Failed Inference", value: "0.4%", detail: "Requests where the primary route failed. 98.7% of these completed successfully on a fallback route." },
];

export const COST_POLICIES: { id: string; name: string; limit: string; kind: "Hard block" | "Optimization guidance"; detail: string }[] = [
  { id: "cp-1", name: "High-Reasoning Tasks", limit: "max $0.18 / request", kind: "Hard block", detail: "Requests estimated above the ceiling are re-scored against cheaper eligible models; if none qualify the request is rejected with a budget reason." },
  { id: "cp-2", name: "Internal Summarization", limit: "max $0.05 / request", kind: "Hard block", detail: "Context re-ranking is attempted before rejection to bring the estimate under the ceiling." },
  { id: "cp-3", name: "Background Classification", limit: "max $0.01 / request", kind: "Hard block", detail: "Batch inference eligibility is preferred for this class; batched requests are metered at the batch rate." },
  { id: "cp-4", name: "Monthly Provider Spend — OpenAI", limit: "$75K", kind: "Optimization guidance", detail: "Approaching the target biases scoring toward alternate providers; it does not block eligible routes." },
  { id: "cp-5", name: "Maximum Output Tokens", limit: "4,096 default", kind: "Hard block", detail: "Per task class override permitted up to 16,384 with FinOps approval." },
  { id: "cp-6", name: "Premium Model Approval", limit: "Required below Advanced tier need", kind: "Hard block", detail: "Routing an Advanced-tier model to a task class that evaluates adequately on Balanced requires explicit approval." },
];

/* -------------------------- Recent route decisions ------------------------ */

export interface RouteDecision {
  id: string; time: string; taskClass: string; model: string; fallback: string;
  policy: string; latency: string; cost: string; status: "Completed" | "Fallback" | "Blocked";
  reason: string; reasonLong: string;
}

export const DECISIONS: RouteDecision[] = [
  { id: "REQ-882014", time: "10:42:18", taskClass: "High Reasoning", model: "GPT-5 Enterprise", fallback: "Claude Sonnet", policy: "High-Reasoning Tasks", latency: "2.14s", cost: "$0.148", status: "Completed", reason: "Highest composite eligible score", reasonLong: "5 candidates evaluated, 2 eligible. GPT-5 Enterprise scored 92.4 against Claude Sonnet 91.8 within the $0.18 ceiling." },
  { id: "REQ-882011", time: "10:42:11", taskClass: "Summarization", model: "Gemini 2.5 Pro", fallback: "GPT-5 Enterprise", policy: "Large-Context Summarization", latency: "4.02s", cost: "$0.201", status: "Completed", reason: "Only model with 212K allowed context", reasonLong: "Context requirement of 212K removed all candidates except Gemini 2.5 Pro under the tenant context cap." },
  { id: "REQ-882009", time: "10:42:04", taskClass: "Utility", model: "GPT-5 Mini", fallback: "Claude Haiku", policy: "Low-Latency Utility Tasks", latency: "0.81s", cost: "$0.019", status: "Completed", reason: "Lowest latency within cost ceiling", reasonLong: "3 eligible candidates; GPT-5 Mini selected on latency sub-score with cache hit reducing input tokens by 38%." },
  { id: "REQ-882002", time: "10:41:52", taskClass: "Automation", model: "Claude Haiku", fallback: "—", policy: "Cost-Capped Internal Automation", latency: "0.68s", cost: "$0.007", status: "Fallback", reason: "Primary rate-limited, fallback invoked", reasonLong: "Llama 4 Enterprise returned a rate-limit response twice; failover to Claude Haiku completed within the $0.05 ceiling." },
  { id: "REQ-881996", time: "10:41:40", taskClass: "Regulated", model: "Azure OpenAI EU", fallback: "—", policy: "Regulated EU Data", latency: "2.61s", cost: "$0.129", status: "Completed", reason: "Only eligible EU deployment", reasonLong: "Deployment-level residency filter left a single eligible candidate. Fallback unavailable — policy conflict raised." },
  { id: "REQ-881990", time: "10:41:31", taskClass: "Grounded Q&A", model: "—", fallback: "—", policy: "High-Reasoning Tasks", latency: "0.04s", cost: "$0.000", status: "Blocked", reason: "Prompt injection guardrail", reasonLong: "Injection score 0.86 on evidence-derived content exceeded the 0.80 block threshold. No inference executed." },
  { id: "REQ-881975", time: "10:41:19", taskClass: "Extraction", model: "GPT-5 Mini", fallback: "Claude Haiku", policy: "Low-Latency Utility Tasks", latency: "0.94s", cost: "$0.022", status: "Completed", reason: "4 PII spans masked pre-invocation", reasonLong: "Sensitive data handling masked 4 spans before assembly; route otherwise unchanged." },
  { id: "REQ-881964", time: "10:41:02", taskClass: "Automation", model: "Llama 4 Enterprise", fallback: "Claude Haiku", policy: "Cost-Capped Internal Automation", latency: "1.18s", cost: "$0.006", status: "Completed", reason: "Lowest cost eligible route", reasonLong: "Batch-eligible request metered at the batch rate; cost sub-score dominant at weight 0.15." },
];

/* --------------------------- Route explainability ------------------------- */

export interface Candidate { model: string; eligible: boolean; rejection?: string; scores?: Record<string, number>; composite?: number }

export const EXPLANATION = {
  requestId: "REQ-882014",
  task: "Analyze underwriting risk evidence",
  classification: "High Reasoning",
  context: "44K",
  dataClass: "Confidential",
  region: "US",
  policy: "High-Reasoning Tasks",
  candidates: [
    { model: "GPT-5 Enterprise", eligible: true, scores: { Capability: 98, Policy: 100, Latency: 88, Cost: 72, Evaluation: 96 }, composite: 92.4 },
    { model: "Claude Sonnet", eligible: true, scores: { Capability: 95, Policy: 100, Latency: 91, Cost: 78, Evaluation: 94 }, composite: 91.8 },
    { model: "Gemini 2.5 Pro", eligible: false, rejection: "Region policy mismatch — no EU/US-East eligible deployment for Confidential data class" },
    { model: "GPT-5 Mini", eligible: false, rejection: "Reasoning tier insufficient — Balanced < required Advanced" },
    { model: "Llama 4 Enterprise", eligible: false, rejection: "Safety policy mismatch — Medium safety profile not permitted for Confidential data" },
  ] as Candidate[],
  selected: "GPT-5 Enterprise",
  reason: "Highest composite eligible score within configured policy and request budget.",
  fallback: "Claude Sonnet",
  weights: [["Capability", "0.30"], ["Policy", "0.20"], ["Evaluation", "0.20"], ["Latency", "0.15"], ["Cost", "0.15"]] as [string, string][],
};

/* ------------------------------ Control plane ----------------------------- */

export const CONTROL_PLANE_DEFINES = [
  "Which providers exist", "Which models are registered", "Where models may execute",
  "What data they may process", "Which capabilities they support", "What routing policies exist",
  "How fallback works", "What safety controls apply", "How cost is controlled", "How models are evaluated",
];

export const CONTROL_PLANE_FLOW = [
  "Tenant Model Control Plane", "Agent Model Requirements", "Runtime Route Decision",
  "Selected Model", "Inference", "Evaluation Feedback",
];

export const SERVICE_CONTRACT: [string, string][] = [
  ["Eligible", "Only approved models participate in routing."],
  ["Capable", "Selected models satisfy the required task capability."],
  ["Governed", "Security, residency, data, safety, and access controls are enforced."],
  ["Resilient", "Validated fallback paths exist where required."],
  ["Explainable", "Every route can show why a model was selected or rejected."],
  ["Cost-Aware", "Inference executes within defined budget controls."],
  ["Observable", "Latency, errors, usage, and policy outcomes are measurable."],
  ["Evaluated", "Model performance continuously feeds future routing decisions."],
];

/* ---------------------------------- Roles --------------------------------- */

export const ROLES: [string, string][] = [
  ["Platform Admin", "Full configuration authority across providers, models, policies, safety, and cost."],
  ["AI Engineer", "Manage model routing policies, fallback chains, and scoring weights."],
  ["Model Administrator", "Register, authorize, suspend, and retire providers and model deployments."],
  ["Security Administrator", "Manage policy, safety profiles, data classes, and residency rules."],
  ["FinOps Administrator", "Manage budgets, cost ceilings, token policies, and spend targets."],
  ["Auditor", "Read-only access to routes, decisions, and configuration history."],
  ["Read Only", "View configuration; no modification of any object."],
];

/* ---------------------------------- Help ---------------------------------- */

export interface HelpTopic { what: string; why: string; how: string; controls: string }

export const HELP: Record<string, HelpTopic> = {
  "Reasoning Tier": {
    what: "A tenant-defined classification — Fast, Balanced, Advanced — representing the depth of reasoning a task requires and a model provides.",
    why: "Provider capability names are inconsistent and change between releases. A tenant taxonomy keeps routing policies stable across vendors.",
    how: "Each registered deployment is assigned a tier from evaluation results, not vendor marketing. Task classes declare a minimum required tier.",
    controls: "Candidate eligibility: a model whose tier is below the required tier is removed before scoring.",
  },
  "Routing Policy": {
    what: "A rule set controlling model selection for a defined task or workload class.",
    why: "Without an explicit policy, model choice becomes an implementation detail of whichever agent was written last.",
    how: "A policy declares intent class, required capabilities, constraints, scoring strategy, and a fallback chain. Policies are versioned and audited.",
    controls: "Which models are eligible, how they are ranked, what the request may cost, and what happens when the primary route fails.",
  },
  "Fallback Chain": {
    what: "An ordered sequence of alternate eligible models invoked when the preferred route cannot execute successfully.",
    why: "Provider outages, quota exhaustion, and latency breaches are routine at enterprise volume; resilience must be configured, not hoped for.",
    how: "Each hop is validated against the same policy evaluation as the primary. Timeout, retry count, and failover triggers are declared per chain.",
    controls: "Availability of a workload during provider degradation, and whether failover may cross regions or providers.",
  },
  "Model Eligibility": {
    what: "Whether a model satisfies all required capability, policy, region, safety, cost, and availability constraints for a given request.",
    why: "Availability is not authorization. Eligibility is the boundary that keeps technically possible routes from becoming governance incidents.",
    how: "Evaluated as a hard filter in two stages — capability match, then policy filter — before any scoring occurs.",
    controls: "The candidate set. An ineligible model is never compared on cost, latency, or quality.",
  },
  "Tenant Allowed Context": {
    what: "The maximum context this tenant permits for a deployment, which may be lower than the provider maximum.",
    why: "Provider maximum context is a capability, not a budget. Unbounded context is the most common cause of unexpected inference spend.",
    how: "Configured per deployment. Requests exceeding the cap trigger evidence re-ranking rather than silent truncation.",
    controls: "Context budget, effective token cost, and eligibility for long-context task classes.",
  },
  "Composite Route Score": {
    what: "The weighted score used to compare eligible model routes across capability, quality, latency, cost, safety, availability, and policy.",
    why: "Single-dimension selection — cheapest, fastest, or most capable — produces the wrong route for most enterprise workloads.",
    how: "Composite = 0.30 capability + 0.20 policy + 0.20 evaluation + 0.15 latency + 0.15 cost. Weights are tenant-configurable per task class.",
    controls: "Which eligible model becomes the primary route and the order of the fallback chain.",
  },
  "Provider Health": {
    what: "The current operational state of a provider across its monitored regions, authentication, quota, and recent incidents.",
    why: "Routing decisions made against stale health data cause avoidable failures and SLA breaches.",
    how: "Synthetic probes per region plus real invocation telemetry. Degradation is declared against tenant SLA thresholds, not provider status pages.",
    controls: "Candidate eligibility, failover triggers, and whether a provider may hold a primary route position.",
  },
  "Guardrail": {
    what: "A control evaluated before and/or after inference to enforce acceptable model usage.",
    why: "Model selection governs which model runs; guardrails govern what it is allowed to receive and return.",
    how: "Pre-invocation guardrails filter or block the request; post-invocation guardrails evaluate the response and may trigger a re-route.",
    controls: "Prompt content, sensitive data exposure, tool invocation, output moderation, citations, and residency.",
  },
  "Evaluation Score": {
    what: "Tenant-controlled measurement of model behavior against defined task, safety, quality, and performance criteria.",
    why: "Vendor benchmarks do not measure this tenant's documents, domain language, or policy expectations.",
    how: "Golden datasets, synthetic tests, human review, and production outcomes are normalized to a 0–100 composite per dimension.",
    controls: "The evaluation weight in composite route scoring and whether a model version may be promoted.",
  },
  "Cost Ceiling": {
    what: "The maximum permitted estimated cost for a single request within a task class.",
    why: "Agentic workloads multiply request volume; per-request economics determine whether a workflow is viable at scale.",
    how: "Estimated from token projection and provider unit rates before invocation. Hard-blocking ceilings reject; guidance targets bias scoring.",
    controls: "Whether a route may execute, and which eligible model is preferred when several satisfy the constraint.",
  },
  "Model Registry": {
    what: "The tenant-approved catalog of model deployments eligible for evaluation and routing.",
    why: "Providers expose far more models than a tenant should permit; the registry is the boundary between available and approved.",
    how: "Models are discovered from the provider, registered with tenant eligibility settings, evaluated, and then authorized for routing.",
    controls: "Which deployments may appear in any candidate set anywhere in the platform.",
  },
  "Provider": {
    what: "An external or internal inference platform exposing one or more model endpoints.",
    why: "Provider-agnostic routing requires providers to be first-class configurable objects rather than hard-coded integrations.",
    how: "Registered with authentication, gateway, network route, regions, and quota. Credentials are stored as vault references, never inline.",
    controls: "Available deployments, regional reach, quota headroom, and failover options.",
  },
};

/* --------------------------------- Filters -------------------------------- */

export const FILTER_DEFS = [
  { id: "provider", label: "Provider", options: ["OpenAI", "Anthropic", "Google", "Azure Hosted", "AWS Bedrock", "Internal Gateway"] },
  { id: "region", label: "Region", options: ["US", "EU", "Global", "APAC"] },
  { id: "type", label: "Model Type", options: ["Foundation", "Fast", "Open"] },
  { id: "status", label: "Status", options: ["Healthy", "Degraded", "Inactive"] },
  { id: "safety", label: "Safety Profile", options: ["High", "Medium", "Standard"] },
  { id: "reasoning", label: "Reasoning Tier", options: ["Fast", "Balanced", "Advanced"] },
  { id: "policy", label: "Routing Policy", options: POLICIES.map((p) => p.name) },
  { id: "domain", label: "Business Domain", options: ["Underwriting", "Claims", "Policy Administration", "IT Operations", "Finance"] },
] as const;
